from fastapi import APIRouter, Depends, HTTPException, Response, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Dict, Any, List, Optional
import io
from datetime import datetime, timezone

from backend.app.db import get_db, SessionLocal
from backend.app.models import (
    Audit, Collection, Record, RecordDimensionStatus, Finding,
    PreservationPriority, DuplicateCluster, ColumnMapping
)
from backend.app.schemas import AuditStartRequest, AuditProgressResponse, FindingResponse, PriorityCardResponse
from backend.engines.coverage import CoverageEngine
from backend.engines.ccd import compute_collection_ccd
from backend.engines.duplicates import find_duplicate_clusters
from backend.engines.provenance import audit_provenance_and_sources
from backend.engines.priority import compute_preservation_priorities
from backend.engines.explain import explain_finding
from backend.engines.report import build_report_json, export_report_csv, export_report_pdf

router = APIRouter(prefix="/api/audits", tags=["Audits & Findings"])

def run_audit_task(audit_id: str, collection_id: str, weights: Optional[Dict[str, float]]):
    """Background task to execute full 7-stage collection audit."""
    db: Session = SessionLocal()
    try:
        audit = db.query(Audit).filter_by(id=audit_id).first()
        if not audit:
            return

        # Stage 1: Initializing
        audit.status = "running"
        audit.progress_stage = "validating"
        audit.progress_percent = 15
        db.commit()

        # Load records and mapped columns
        records = db.query(Record).filter_by(collection_id=collection_id).all()
        mappings = db.query(ColumnMapping).filter_by(collection_id=collection_id).all()
        mapped_canonical = {m.canonical_field for m in mappings if m.canonical_field != "unmapped"}
        if not mapped_canonical:
            # Fallback to standard canonical fields
            mapped_canonical = {"title", "state", "category", "period_date", "materials", "source_institution"}

        rec_dicts = []
        for r in records:
            rd = {
                "id": r.id,
                "record_id": r.id,
                "title": r.title,
                "art_form": r.art_form,
                "category": r.category_id,
                "category_id": r.category_id,
                "state": r.state,
                "place": r.place,
                "district_place": r.place,
                "period_date": r.period_text,
                "language": r.language,
                "materials": r.materials,
                "technique": r.technique,
                "description": r.description,
                "maker_name": r.creator,
                "creator": r.creator,
                "community": r.community,
                "source_institution": r.source_institution,
                "accession_id": r.accession_id,
                "source_url": r.source_url,
                "image_url": r.image_url,
                "rights_license": r.rights_declared,
                "access_url": r.source_url
            }
            if r.is_synthetic and r.original_json:
                rd.update(r.original_json)
            rec_dicts.append(rd)

        # Stage 2: Normalising & Classifying
        audit.progress_stage = "classifying"
        audit.progress_percent = 35
        db.commit()

        coverage_engine = CoverageEngine()
        evaluations = []

        # Clear existing statuses for this audit if any
        db.query(RecordDimensionStatus).filter_by(audit_id=audit_id).delete()

        # Stage 3: Dimension Scoring
        audit.progress_stage = "scoring"
        audit.progress_percent = 55
        db.commit()

        for idx, rd in enumerate(rec_dicts):
            eval_res = coverage_engine.evaluate_record(
                rd,
                mapped_canonical_fields=mapped_canonical,
                category_id=rd.get("category_id")
            )
            evaluations.append(eval_res)

            for dim, d_res in eval_res.items():
                db.add(RecordDimensionStatus(
                    audit_id=audit_id,
                    record_id=rd["id"],
                    dimension=dim,
                    score=d_res["score"],
                    status=d_res["status"],
                    reason=d_res["reason"]
                ))

        # Stage 4: CCD Calculation
        ccd_res = compute_collection_ccd(evaluations, weights=weights, seed=42)
        audit.ccd = ccd_res["ccd"]
        audit.ccd_low = ccd_res["ccd_interval"][0]
        audit.ccd_high = ccd_res["ccd_interval"][1]
        audit.assessability = ccd_res["assessability"]

        # Stage 5: Duplicate Detection
        audit.progress_stage = "duplicates"
        audit.progress_percent = 70
        db.commit()

        db.query(DuplicateCluster).filter_by(audit_id=audit_id).delete()
        dup_clusters = find_duplicate_clusters(rec_dicts)
        for dc in dup_clusters:
            db.add(DuplicateCluster(
                audit_id=audit_id,
                cluster_id=dc["cluster_id"],
                record_ids_json=dc["record_ids"],
                similarity=dc["similarity"],
                matched_fields=dc["matched_fields"]
            ))

        # Stage 6: Provenance & Priorities
        audit.progress_stage = "prioritising"
        audit.progress_percent = 85
        db.commit()

        db.query(Finding).filter_by(audit_id=audit_id).delete()
        prov_findings = audit_provenance_and_sources(rec_dicts)
        for pf in prov_findings:
            db.add(Finding(
                id=f"{audit_id}-{pf['id']}",
                audit_id=audit_id,
                kind=pf["kind"],
                title=pf["title"],
                issue=pf["issue"],
                evidence_json=pf["evidence_json"],
                why_it_matters=pf["why_it_matters"],
                certainty=pf["certainty"],
                suggested_action=pf["suggested_action"],
                record_ids_json=pf["record_ids_json"]
            ))

        if dup_clusters:
            db.add(Finding(
                id=f"{audit_id}-FINDING-DUPLICATES",
                audit_id=audit_id,
                kind="duplicate_cluster",
                title=f"{len(dup_clusters)} Candidate Duplicate Record Clusters Identified",
                issue=f"Found {len(dup_clusters)} clusters containing potential duplicate records sharing accession numbers or token-matched titles.",
                evidence_json={
                    "duplicate_count": len(dup_clusters),
                    "clusters": [d["cluster_id"] for d in dup_clusters]
                },
                why_it_matters="Duplicate catalog entries inflate item counts and distort statistical coverage debt.",
                certainty="high",
                suggested_action="Review catalog records side-by-side and cross-reference accessions.",
                record_ids_json=[r for d in dup_clusters for r in d["record_ids"]]
            ))

        db.query(PreservationPriority).filter_by(audit_id=audit_id).delete()
        priorities = compute_preservation_priorities(rec_dicts, evaluations, weights=weights)
        for p in priorities:
            db.add(PreservationPriority(
                id=f"{audit_id}-{p['id']}",
                audit_id=audit_id,
                slice_json=p["slice"],
                dimension=p["dimension"],
                g=p["g"],
                e=p["e"],
                b=p["b"],
                f=p["f"],
                score=p["score"],
                band=p["band"],
                consultation=p["consultation"],
                next_step=p["next_step"],
                reasons_json=p["reasons"]
            ))

        # Stage 7: Reporting & Done
        audit.progress_stage = "completed"
        audit.progress_percent = 100
        audit.status = "completed"
        audit.finished_at = datetime.now(timezone.utc)
        db.commit()

    except Exception as e:
        audit = db.query(Audit).filter_by(id=audit_id).first()
        if audit:
            audit.status = "failed"
            audit.error_message = str(e)
            db.commit()
    finally:
        db.close()

@router.post("", response_model=Dict[str, Any])
def start_audit(req: AuditStartRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """Initiate a full collection audit with optional weight overrides."""
    col = db.query(Collection).filter_by(id=req.collection_id).first()
    if not col:
        raise HTTPException(status_code=404, detail={"code": "NOT_FOUND", "message": f"Collection '{req.collection_id}' not found."})

    audit_id = f"AUDIT-{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}"
    new_audit = Audit(
        id=audit_id,
        collection_id=col.id,
        status="pending",
        weights_json=req.weights or {},
        progress_stage="initialized",
        progress_percent=5
    )
    db.add(new_audit)
    db.commit()

    background_tasks.add_task(run_audit_task, audit_id, col.id, req.weights)
    return {"audit_id": audit_id, "status": "pending", "message": "Audit execution scheduled in background."}

@router.get("/{id}/progress", response_model=AuditProgressResponse)
def get_audit_progress(id: str, db: Session = Depends(get_db)):
    """Poll progress of an audit run."""
    audit = db.query(Audit).filter_by(id=id).first()
    if not audit:
        raise HTTPException(status_code=404, detail={"code": "NOT_FOUND", "message": f"Audit '{id}' not found."})

    return AuditProgressResponse(
        audit_id=audit.id,
        status=audit.status,
        stage=audit.progress_stage or "pending",
        percent=audit.progress_percent or 0,
        message=f"Current stage: {audit.progress_stage}",
        error=audit.error_message
    )

@router.get("/{id}")
def get_audit(id: str, db: Session = Depends(get_db)):
    """Retrieve full audit metadata."""
    audit = db.query(Audit).filter_by(id=id).first()
    if not audit:
        raise HTTPException(status_code=404, detail={"code": "NOT_FOUND", "message": f"Audit '{id}' not found."})

    col = db.query(Collection).filter_by(id=audit.collection_id).first()
    total_recs = db.query(func.count(Record.id)).filter(Record.collection_id == audit.collection_id).scalar() or 0

    return {
        "id": audit.id,
        "collection_id": audit.collection_id,
        "collection_name": col.name if col else "Collection",
        "collection_kind": col.kind if col else "upload",
        "started_at": audit.started_at.isoformat() if audit.started_at else None,
        "finished_at": audit.finished_at.isoformat() if audit.finished_at else None,
        "status": audit.status,
        "ccd": audit.ccd,
        "ccd_interval": [audit.ccd_low, audit.ccd_high] if audit.ccd_low is not None else None,
        "assessability": audit.assessability,
        "total_records": total_recs
    }

@router.get("/{id}/findings")
def get_audit_findings(id: str, db: Session = Depends(get_db)):
    """Retrieve diagnostic findings for an audit."""
    findings = db.query(Finding).filter_by(audit_id=id).all()
    results = []
    for f in findings:
        exp = explain_finding({"kind": f.kind, "title": f.title, "evidence_json": f.evidence_json})
        results.append({
            "id": f.id,
            "kind": f.kind,
            "title": f.title,
            "issue": f.issue,
            "explanation": exp["summary"],
            "explanation_origin": exp["origin"],
            "evidence": f.evidence_json,
            "why_it_matters": f.why_it_matters,
            "certainty": f.certainty,
            "suggested_action": f.suggested_action,
            "record_ids": f.record_ids_json
        })
    return {"audit_id": id, "total_findings": len(results), "findings": results}

@router.get("/{id}/findings/{fid}")
def get_single_finding(id: str, fid: str, db: Session = Depends(get_db)):
    """Retrieve single finding with full records click-through."""
    f = db.query(Finding).filter_by(audit_id=id, id=fid).first()
    if not f:
        raise HTTPException(status_code=404, detail={"code": "NOT_FOUND", "message": f"Finding '{fid}' not found."})

    exp = explain_finding({"kind": f.kind, "title": f.title, "evidence_json": f.evidence_json})
    
    # Fetch supporting records
    records = []
    if f.record_ids_json:
        recs = db.query(Record).filter(Record.id.in_(f.record_ids_json[:30])).all()
        records = [
            {
                "id": r.id,
                "title": r.title,
                "art_form": r.art_form,
                "state": r.state,
                "period": r.period_text,
                "category": r.category_id,
                "image_url": r.image_url,
                "source_institution": r.source_institution,
                "rights_declared": r.rights_declared,
                "is_synthetic": r.is_synthetic
            }
            for r in recs
        ]

    return {
        "id": f.id,
        "kind": f.kind,
        "title": f.title,
        "issue": f.issue,
        "explanation": exp["summary"],
        "explanation_origin": exp["origin"],
        "evidence": f.evidence_json,
        "why_it_matters": f.why_it_matters,
        "certainty": f.certainty,
        "suggested_action": f.suggested_action,
        "total_affected": len(f.record_ids_json),
        "supporting_records": records
    }

@router.get("/{id}/priorities")
def get_audit_priorities(
    id: str,
    dimension: Optional[str] = None,
    band: Optional[str] = None,
    consultation: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Retrieve ranked preservation priority recommendations with consent routing flags."""
    query = db.query(PreservationPriority).filter_by(audit_id=id)
    if dimension:
        query = query.filter_by(dimension=dimension)
    if band:
        query = query.filter(PreservationPriority.band.ilike(f"%{band}%"))
    if consultation:
        query = query.filter_by(consultation=consultation)

    priorities = query.order_by(PreservationPriority.score.desc()).all()
    results = [
        {
            "id": p.id,
            "slice": p.slice_json,
            "dimension": p.dimension,
            "dimension_name": p.dimension.replace("_", " ").title(),
            "g": p.g,
            "e": p.e,
            "b": p.b,
            "f": p.f,
            "score": p.score,
            "band": p.band,
            "consultation": p.consultation,
            "next_step": p.next_step,
            "reasons": p.reasons_json
        }
        for p in priorities
    ]
    return {"audit_id": id, "total_priorities": len(results), "priorities": results}

@router.get("/{id}/duplicates")
def get_audit_duplicates(id: str, db: Session = Depends(get_db)):
    """Retrieve identified duplicate clusters."""
    clusters = db.query(DuplicateCluster).filter_by(audit_id=id).all()
    results = []
    for c in clusters:
        rec_ids = c.record_ids_json or []
        recs = db.query(Record).filter(Record.id.in_(rec_ids)).all()
        results.append({
            "cluster_id": c.cluster_id,
            "similarity": c.similarity,
            "matched_fields": c.matched_fields,
            "records": [
                {
                    "id": r.id,
                    "title": r.title,
                    "art_form": r.art_form,
                    "state": r.state,
                    "source_institution": r.source_institution,
                    "accession_id": r.accession_id,
                    "is_synthetic": r.is_synthetic
                }
                for r in recs
            ]
        })
    return {"audit_id": id, "total_clusters": len(results), "clusters": results}

@router.get("/{id}/report.json")
def get_report_json(id: str, db: Session = Depends(get_db)):
    """Export complete audit report in structured JSON format."""
    audit = db.query(Audit).filter_by(id=id).first()
    if not audit:
        raise HTTPException(status_code=404, detail={"code": "NOT_FOUND", "message": f"Audit '{id}' not found."})

    col = db.query(Collection).filter_by(id=audit.collection_id).first()
    findings = db.query(Finding).filter_by(audit_id=id).all()
    priorities = db.query(PreservationPriority).filter_by(audit_id=id).order_by(PreservationPriority.score.desc()).all()
    total_recs = db.query(func.count(Record.id)).filter(Record.collection_id == audit.collection_id).scalar() or 0

    report = {
        "audit_id": audit.id,
        "collection": {
            "id": col.id,
            "name": col.name,
            "kind": col.kind,
            "description": col.description
        },
        "started_at": audit.started_at.isoformat() if audit.started_at else None,
        "finished_at": audit.finished_at.isoformat() if audit.finished_at else None,
        "ccd": audit.ccd,
        "ccd_interval": [audit.ccd_low, audit.ccd_high] if audit.ccd_low is not None else [0, 0],
        "assessability": audit.assessability,
        "total_records": total_recs,
        "findings": [
            {
                "id": f.id,
                "kind": f.kind,
                "title": f.title,
                "issue": f.issue,
                "certainty": f.certainty,
                "suggested_action": f.suggested_action,
                "record_ids": f.record_ids_json
            }
            for f in findings
        ],
        "priorities": [
            {
                "id": p.id,
                "slice": p.slice_json,
                "dimension": p.dimension,
                "dimension_name": p.dimension.replace("_", " ").title(),
                "score": p.score,
                "band": p.band,
                "consultation": p.consultation,
                "next_step": p.next_step,
                "reasons": p.reasons_json
            }
            for p in priorities
        ]
    }
    return report

@router.get("/{id}/report.csv")
def get_report_csv(id: str, db: Session = Depends(get_db)):
    """Export audit report summary as CSV."""
    rep_json = get_report_json(id, db)
    csv_str = export_report_csv(rep_json)
    return Response(
        content=csv_str,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=silence_report_{id}.csv"}
    )

@router.get("/{id}/report.pdf")
def get_report_pdf(id: str, db: Session = Depends(get_db)):
    """Export museum-grade PDF report."""
    rep_json = get_report_json(id, db)
    pdf_bytes = export_report_pdf(rep_json)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=silence_report_{id}.pdf"}
    )

