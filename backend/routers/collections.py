
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from backend.app.db import get_db
from backend.app.models import Audit, Collection, Record
from backend.app.schemas import CollectionSummary

router = APIRouter(prefix="/api/collections", tags=["Collections"])

@router.get("", response_model=list[CollectionSummary])
def list_collections(db: Session = Depends(get_db)):
    """List all available collections (Sample A, Sample B, and User Uploads)."""
    collections = db.query(Collection).all()
    summaries = []

    for col in collections:
        total = db.query(func.count(Record.id)).filter(Record.collection_id == col.id).scalar() or 0
        art_forms = db.query(func.count(func.distinct(Record.art_form))).filter(Record.collection_id == col.id).scalar() or 0
        states = db.query(func.count(func.distinct(Record.state))).filter(Record.collection_id == col.id).scalar() or 0
        langs = db.query(func.count(func.distinct(Record.language))).filter(Record.collection_id == col.id).scalar() or 0
        
        # Provenance rate: fraction with source institution
        with_inst = db.query(func.count(Record.id)).filter(
            Record.collection_id == col.id,
            Record.source_institution.isnot(None),
            Record.source_institution != ""
        ).scalar() or 0
        prov_rate = round((with_inst / total) * 100, 1) if total > 0 else 0.0

        # Latest completed audit
        latest_audit = db.query(Audit).filter(
            Audit.collection_id == col.id,
            Audit.status == "completed"
        ).order_by(Audit.started_at.desc()).first()

        summaries.append(CollectionSummary(
            id=col.id,
            name=col.name,
            kind=col.kind,
            description=col.description,
            created_at=col.created_at.isoformat() if col.created_at else None,
            total_records=total,
            art_forms_count=art_forms,
            states_count=states,
            languages_count=langs,
            provenance_rate=prov_rate,
            latest_audit_id=latest_audit.id if latest_audit else None,
            latest_ccd=latest_audit.ccd if latest_audit else None,
            latest_assessability=latest_audit.assessability if latest_audit else None
        ))

    return summaries

@router.get("/{id}/summary", response_model=CollectionSummary)
def get_collection_summary(id: str, db: Session = Depends(get_db)):
    """Retrieve detailed KPI summary for a specific collection."""
    col = db.query(Collection).filter_by(id=id).first()
    if not col:
        raise HTTPException(status_code=404, detail={"code": "NOT_FOUND", "message": f"Collection '{id}' not found."})

    total = db.query(func.count(Record.id)).filter(Record.collection_id == col.id).scalar() or 0
    art_forms = db.query(func.count(func.distinct(Record.art_form))).filter(Record.collection_id == col.id).scalar() or 0
    states = db.query(func.count(func.distinct(Record.state))).filter(Record.collection_id == col.id).scalar() or 0
    langs = db.query(func.count(func.distinct(Record.language))).filter(Record.collection_id == col.id).scalar() or 0
    
    with_inst = db.query(func.count(Record.id)).filter(
        Record.collection_id == col.id,
        Record.source_institution.isnot(None),
        Record.source_institution != ""
    ).scalar() or 0
    prov_rate = round((with_inst / total) * 100, 1) if total > 0 else 0.0

    latest_audit = db.query(Audit).filter(
        Audit.collection_id == col.id,
        Audit.status == "completed"
    ).order_by(Audit.started_at.desc()).first()

    return CollectionSummary(
        id=col.id,
        name=col.name,
        kind=col.kind,
        description=col.description,
        created_at=col.created_at.isoformat() if col.created_at else None,
        total_records=total,
        art_forms_count=art_forms,
        states_count=states,
        languages_count=langs,
        provenance_rate=prov_rate,
        latest_audit_id=latest_audit.id if latest_audit else None,
        latest_ccd=latest_audit.ccd if latest_audit else None,
        latest_assessability=latest_audit.assessability if latest_audit else None
    )

