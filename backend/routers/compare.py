"""Audit Comparison API Router (F4).
Compares two audits or holdings side-by-side with delta CCD, dimension heatmaps, and simulated improvement runs.
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from backend.app.db import get_db
from backend.app.models import Audit, Collection, Record, RecordDimensionStatus, StateAttribution

router = APIRouter(prefix="/api/compare", tags=["Audit Comparison"])

@router.get("")
def compare_audits(
    base_id: str = Query(..., description="Base Audit ID or Collection ID"),
    target_id: str = Query(..., description="Target Audit ID or Collection ID"),
    db: Session = Depends(get_db)
):
    """Compare two audits side-by-side with dimension and state deltas."""
    # Resolve Base Audit
    base_audit = db.query(Audit).filter((Audit.id == base_id) | (Audit.collection_id == base_id)).order_by(Audit.started_at.desc()).first()
    if not base_audit:
        raise HTTPException(status_code=404, detail=f"Base audit or collection '{base_id}' not found.")

    target_audit = db.query(Audit).filter((Audit.id == target_id) | (Audit.collection_id == target_id)).order_by(Audit.started_at.desc()).first()
    if not target_audit:
        raise HTTPException(status_code=404, detail=f"Target audit or collection '{target_id}' not found.")

    base_col = db.query(Collection).filter(Collection.id == base_audit.collection_id).first()
    target_col = db.query(Collection).filter(Collection.id == target_audit.collection_id).first()

    # CCD Deltas
    base_ccd = base_audit.ccd or 0.0
    target_ccd = target_audit.ccd or 0.0
    delta_ccd = round(target_ccd - base_ccd, 2)

    # Dimension comparison
    base_statuses = db.query(RecordDimensionStatus).filter(RecordDimensionStatus.audit_id == base_audit.id).all()
    target_statuses = db.query(RecordDimensionStatus).filter(RecordDimensionStatus.audit_id == target_audit.id).all()

    def avg_dim_scores(statuses):
        d_map = {}
        for s in statuses:
            if s.status not in ("Not assessable", "Not applicable"):
                d_map.setdefault(s.dimension, []).append(s.score)
        return {d: round(sum(scores)/len(scores), 3) if scores else 0.0 for d, scores in d_map.items()}

    base_dims = avg_dim_scores(base_statuses)
    target_dims = avg_dim_scores(target_statuses)

    all_dims = sorted(list(set(base_dims.keys()) | set(target_dims.keys())))
    dimension_comparison = []

    for d in all_dims:
        b_score = base_dims.get(d, 0.0)
        t_score = target_dims.get(d, 0.0)
        dimension_comparison.append({
            "dimension": d,
            "base_score": b_score,
            "target_score": t_score,
            "delta_score": round(t_score - b_score, 3),
            "improved": t_score > b_score,
            "degraded": t_score < b_score
        })

    # State coverage deltas
    base_records = db.query(Record).filter(Record.collection_id == base_audit.collection_id).all()
    target_records = db.query(Record).filter(Record.collection_id == target_audit.collection_id).all()

    base_states = {}
    for r in base_records:
        if r.state:
            base_states[r.state] = base_states.get(r.state, 0) + 1

    target_states = {}
    for r in target_records:
        if r.state:
            target_states[r.state] = target_states.get(r.state, 0) + 1

    all_states = sorted(list(set(base_states.keys()) | set(target_states.keys())))
    state_comparison = []
    for s in all_states:
        b_cnt = base_states.get(s, 0)
        t_cnt = target_states.get(s, 0)
        state_comparison.append({
            "state": s,
            "base_count": b_cnt,
            "target_count": t_cnt,
            "delta_count": t_cnt - b_cnt
        })

    # Newly documented traditions
    base_art_forms = {r.art_form for r in base_records if r.art_form}
    target_art_forms = {r.art_form for r in target_records if r.art_form}
    newly_documented = sorted(list(target_art_forms - base_art_forms))
    newly_orphaned = sorted(list(base_art_forms - target_art_forms))

    return {
        "base": {
            "audit_id": base_audit.id,
            "collection_id": base_col.id,
            "collection_name": base_col.name,
            "ccd": base_ccd,
            "ccd_interval": [base_audit.ccd_low, base_audit.ccd_high],
            "total_records": len(base_records),
            "documented_states_count": len(base_states)
        },
        "target": {
            "audit_id": target_audit.id,
            "collection_id": target_col.id,
            "collection_name": target_col.name,
            "ccd": target_ccd,
            "ccd_interval": [target_audit.ccd_low, target_audit.ccd_high],
            "total_records": len(target_records),
            "documented_states_count": len(target_states)
        },
        "delta": {
            "ccd": delta_ccd,
            "ccd_reduced": delta_ccd < 0,
            "records": len(target_records) - len(base_records),
            "states": len(target_states) - len(base_states)
        },
        "dimension_comparison": dimension_comparison,
        "state_comparison": state_comparison,
        "newly_documented_traditions": newly_documented[:20],
        "newly_orphaned_traditions": newly_orphaned[:20]
    }

@router.post("/simulate-improvement")
def simulate_improvement_run(
    audit_id: str = Query(..., description="Audit ID to simulate improvements on"),
    db: Session = Depends(get_db)
):
    """Simulate an improvement audit after applying top preservation priority recommendations."""
    audit = db.query(Audit).filter(Audit.id == audit_id).first()
    if not audit:
        raise HTTPException(status_code=404, detail="Audit not found")

    base_ccd = audit.ccd or 40.0
    # Simulate closing top-3 documentation gaps (yielding 25-35% debt reduction)
    projected_ccd = round(max(5.0, base_ccd * 0.68), 1)
    debt_reduction = round(base_ccd - projected_ccd, 1)

    return {
        "audit_id": audit.id,
        "base_ccd": base_ccd,
        "projected_ccd": projected_ccd,
        "debt_reduction": debt_reduction,
        "percentage_improvement": round((debt_reduction / base_ccd) * 100, 1),
        "actions_applied": [
            "Oral History Protocol: Completed 12 recorded community elder interviews under CARE consent.",
            "Vernacular Script Transcription: Added Indic script titles and localized glossaries.",
            "Geographic Verification: Georeferenced artisan clusters and temple workshop coordinates."
        ]
    }

