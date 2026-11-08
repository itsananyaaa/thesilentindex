
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from backend.app.db import get_db
from backend.app.models import (
    FieldProvenance,
    ImageModel,
    Record,
    RecordDimensionStatus,
)
from backend.engines.taxonomy import TaxonomyEngine

router = APIRouter(prefix="/api/records", tags=["Records Explorer"])

@router.get("")
def list_records(
    collection_id: str | None = None,
    state: str | None = None,
    category: str | None = None,
    language: str | None = None,
    source: str | None = None,
    completeness_band: str | None = None, # high (>=0.7), medium (0.4-0.7), low (<0.4)
    q: str | None = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(24, ge=1, le=500),
    db: Session = Depends(get_db)
):
    """Search and browse collection records with comprehensive faceted filters."""
    query = db.query(Record)

    if collection_id:
        query = query.filter(Record.collection_id == collection_id)
    if state:
        query = query.filter(Record.state == state)
    if category:
        query = query.filter(Record.category_id == category)
    if language:
        query = query.filter(Record.language.ilike(f"%{language}%"))
    if source:
        query = query.filter(Record.source_institution.ilike(f"%{source}%"))
    if q:
        search_pattern = f"%{q}%"
        query = query.filter(
            or_(
                Record.title.ilike(search_pattern),
                Record.art_form.ilike(search_pattern),
                Record.description.ilike(search_pattern),
                Record.creator.ilike(search_pattern),
                Record.materials.ilike(search_pattern)
            )
        )

    total = query.count()
    records = query.order_by(Record.row_index.asc()).offset((page - 1) * page_size).limit(page_size).all()

    items = []
    for r in records:
        # Completeness calculation: mean score across dimensions for latest audit
        latest_status = db.query(func.avg(RecordDimensionStatus.score)).filter(
            RecordDimensionStatus.record_id == r.id
        ).scalar()
        completeness = round(float(latest_status), 2) if latest_status is not None else 0.50

        items.append({
            "id": r.id,
            "collection_id": r.collection_id,
            "title": r.title,
            "art_form": r.art_form,
            "category": r.category_id,
            "state": r.state,
            "place": r.place,
            "period": r.period_text,
            "language": r.language,
            "materials": r.materials,
            "creator": r.creator,
            "source_institution": r.source_institution,
            "image_url": r.image_url,
            "thumbnail_url": r.thumbnail_url or r.image_url,
            "rights_declared": r.rights_declared,
            "rights_category": r.rights_category,
            "download_allowed": r.download_allowed,
            "completeness_score": completeness,
            "is_synthetic": r.is_synthetic
        })

    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size,
        "records": items
    }

@router.get("/{id}")
def get_record_detail(id: str, db: Session = Depends(get_db)):
    """Retrieve full museum-grade editorial dossier for a record."""
    r = db.query(Record).filter_by(id=id).first()
    if not r:
        raise HTTPException(status_code=404, detail={"code": "NOT_FOUND", "message": f"Record '{id}' not found."})

    # Provenance tracking records
    provenances = db.query(FieldProvenance).filter_by(record_id=id).all()
    prov_list = [
        {
            "field": p.field,
            "origin": p.origin, # SOURCE | NORMALISED | INFERRED
            "method": p.method,
            "confidence": p.confidence,
            "detail": p.detail
        }
        for p in provenances
    ]

    # Dimension statuses for latest audit
    statuses = db.query(RecordDimensionStatus).filter_by(record_id=id).all()
    dim_list = [
        {
            "dimension": s.dimension,
            "dimension_name": s.dimension.replace("_", " ").title(),
            "score": s.score,
            "status": s.status,
            "reason": s.reason
        }
        for s in statuses
    ]

    # Identify missing or unassessed dimensions
    missing_panel = [
        d for d in dim_list if d["status"] in ("Undocumented in collection", "Not assessable")
    ]

    # Cultural sensitivity notices
    taxonomy = TaxonomyEngine()
    sensitivities = taxonomy.detect_sensitivity(r.__dict__, r.category_id)

    # Image metadata
    img = db.query(ImageModel).filter_by(record_id=id).first()

    return {
        "id": r.id,
        "collection_id": r.collection_id,
        "row_index": r.row_index,
        "title": r.title,
        "art_form": r.art_form,
        "category": r.category_id,
        "state": r.state,
        "place": r.place,
        "lat": r.lat,
        "lon": r.lon,
        "period": r.period_text,
        "language": r.language,
        "materials": r.materials,
        "technique": r.technique,
        "description": r.description,
        "creator": r.creator,
        "community": r.community,
        "source_institution": r.source_institution,
        "accession_id": r.accession_id,
        "source_url": r.source_url,
        "image_url": r.image_url,
        "thumbnail_url": r.thumbnail_url,
        "rights_declared": r.rights_declared,
        "rights_category": r.rights_category,
        "download_allowed": r.download_allowed,
        "attribution_text": img.attribution_text if img else None,
        "is_synthetic": r.is_synthetic,
        "provenance_records": prov_list,
        "dimension_evaluations": dim_list,
        "missing_documentation_panel": missing_panel,
        "sensitivity_notices": sensitivities,
        "original_json": r.original_json # Immutable raw data
    }

@router.get("/{id}/related")
def get_related_records(id: str, limit: int = 6, db: Session = Depends(get_db)):
    """Retrieve related records sharing art form, state, or category."""
    target = db.query(Record).filter_by(id=id).first()
    if not target:
        raise HTTPException(status_code=404, detail={"code": "NOT_FOUND", "message": f"Record '{id}' not found."})

    related = db.query(Record).filter(
        Record.collection_id == target.collection_id,
        Record.id != target.id,
        or_(
            Record.art_form == target.art_form,
            Record.state == target.state,
            Record.category_id == target.category_id
        )
    ).limit(limit).all()

    return [
        {
            "id": r.id,
            "title": r.title,
            "art_form": r.art_form,
            "category": r.category_id,
            "state": r.state,
            "image_url": r.image_url,
            "thumbnail_url": r.thumbnail_url or r.image_url,
            "rights_declared": r.rights_declared,
            "is_synthetic": r.is_synthetic
        }
        for r in related
    ]

