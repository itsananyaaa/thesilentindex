import os

import yaml
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from backend.app.db import get_db
from backend.app.models import Audit, Record, RecordDimensionStatus

router = APIRouter(prefix="/api/audits", tags=["Blind-Spot Map"])

STATES_PATH = os.path.join(os.path.dirname(__file__), "../../config/states.yaml")
with open(STATES_PATH, "r", encoding="utf-8") as f:
    STATES_CONFIG = yaml.safe_load(f).get("states", [])

@router.get("/{id}/map")
def get_map_data(
    id: str,
    metric: str | None = "record_count",
    db: Session = Depends(get_db)
):
    """Retrieve choropleth map metrics across all 36 Indian states and union territories."""
    audit = db.query(Audit).filter_by(id=id).first()
    if not audit:
        raise HTTPException(status_code=404, detail={"code": "NOT_FOUND", "message": f"Audit '{id}' not found."})

    col_id = audit.collection_id

    # Group counts by state
    state_counts = db.query(
        Record.state,
        func.count(Record.id).label("total_records"),
        func.count(func.distinct(Record.art_form)).label("art_forms_count"),
        func.count(func.distinct(Record.language)).label("languages_count")
    ).filter(
        Record.collection_id == col_id
    ).group_by(Record.state).all()

    counts_by_name = {
        row[0]: {
            "total_records": row[1],
            "art_forms_count": row[2],
            "languages_count": row[3]
        }
        for row in state_counts if row[0]
    }

    # Records with missing or unassigned state
    missing_geo_count = db.query(func.count(Record.id)).filter(
        Record.collection_id == col_id,
        (Record.state.is_(None)) | (Record.state == "")
    ).scalar() or 0

    # Query distinct layers and state attributions for existence/composition metrics
    from backend.app.models import StateAttribution
    state_attrib_counts = dict(
        db.query(StateAttribution.state_code, func.count(StateAttribution.id))
        .group_by(StateAttribution.state_code).all()
    )

    state_layer_counts = dict(
        db.query(Record.state, func.count(func.distinct(Record.layer_id)))
        .filter(Record.collection_id == col_id)
        .group_by(Record.state).all()
    )

    state_features = []
    total_coll_records = sum(c["total_records"] for c in counts_by_name.values()) + missing_geo_count

    for st in STATES_CONFIG:
        name = st["name"]
        code = st["code"]
        short_code = code.replace("IN-", "")
        data = counts_by_name.get(name, {"total_records": 0, "art_forms_count": 0, "languages_count": 0})
        count = data["total_records"]
        is_zero = (count == 0)

        # Existence metric (registered entities from state attributions + baseline)
        exist_cnt = state_attrib_counts.get(short_code, 0)
        if exist_cnt == 0:
            exist_cnt = max(1, count)

        # Gap score: high existence with sparse documentation
        gap_score = round(max(0, exist_cnt - count) if count < 10 else 0, 1)

        # Composition count: distinct source layers in this state
        comp_cnt = state_layer_counts.get(name, 1 if count > 0 else 0)

        # Slice debt calculation for state
        state_ccd = None
        if count >= 3:
            avg_score = db.query(func.avg(RecordDimensionStatus.score)).join(
                Record, RecordDimensionStatus.record_id == Record.id
            ).filter(
                RecordDimensionStatus.audit_id == id,
                Record.state == name
            ).scalar()
            if avg_score is not None:
                state_ccd = round((1.0 - float(avg_score)) * 100.0, 1)
        elif is_zero:
            state_ccd = 100.0 # completely undocumented

        state_features.append({
            "code": code,
            "name": name,
            "type": st.get("type", "State"),
            "record_count": count,
            "existence_count": exist_cnt,
            "gap_score": gap_score,
            "composition_count": comp_cnt,
            "state_ccd": state_ccd,
            "is_zero_in_collection": is_zero,
            "zero_label": "none in the analysed collection" if is_zero else None,
            "art_forms_count": data["art_forms_count"],
            "languages_count": data["languages_count"],
            "has_insufficient_evidence": count < 5 and not is_zero,
            "share_of_collection_pct": round((count / total_coll_records) * 100, 2) if total_coll_records > 0 else 0.0
        })

    return {
        "audit_id": id,
        "metric": metric,
        "total_states": len(state_features),
        "states_with_records_count": sum(1 for s in state_features if not s["is_zero_in_collection"]),
        "zero_states_count": sum(1 for s in state_features if s["is_zero_in_collection"]),
        "missing_geo_records_count": missing_geo_count,
        "caveat": "Low record counts describe the documentation completeness of the analysed collection, never the cultural depth or value of any region.",
        "states": state_features
    }

@router.get("/{id}/map/state/{code}")
def get_state_details(
    id: str,
    code: str,
    db: Session = Depends(get_db)
):
    """Retrieve detailed metadata drill-down for a specific state in the Blind-Spot Map."""
    audit = db.query(Audit).filter_by(id=id).first()
    if not audit:
        raise HTTPException(status_code=404, detail={"code": "NOT_FOUND", "message": f"Audit '{id}' not found."})

    # Find state in config
    st_entry = next((s for s in STATES_CONFIG if s["code"] == code or s["name"].lower() == code.lower()), None)
    if not st_entry:
        raise HTTPException(status_code=404, detail={"code": "NOT_FOUND", "message": f"State code '{code}' not recognized."})

    state_name = st_entry["name"]
    col_id = audit.collection_id

    records = db.query(Record).filter(
        Record.collection_id == col_id,
        Record.state == state_name
    ).all()

    total_records = len(records)
    art_forms = sorted(list({r.art_form for r in records if r.art_form}))
    languages = sorted(list({r.language for r in records if r.language}))
    sources = sorted(list({r.source_institution for r in records if r.source_institution}))

    # 10 dimensions breakdown
    dim_scores = db.query(
        RecordDimensionStatus.dimension,
        func.avg(RecordDimensionStatus.score),
        func.count(RecordDimensionStatus.id)
    ).join(
        Record, RecordDimensionStatus.record_id == Record.id
    ).filter(
        RecordDimensionStatus.audit_id == id,
        Record.state == state_name
    ).group_by(RecordDimensionStatus.dimension).all()

    dimension_quality = [
        {
            "dimension": row[0],
            "mean_score": round(float(row[1]), 3) if row[1] is not None else 0.0,
            "status": "Documented" if (row[1] or 0) >= 0.75 else ("Partial" if (row[1] or 0) >= 0.25 else "Undocumented in collection")
        }
        for row in dim_scores
    ]

    sample_records = [
        {
            "id": r.id,
            "title": r.title,
            "art_form": r.art_form,
            "period": r.period_text,
            "image_url": r.image_url,
            "thumbnail_url": r.thumbnail_url,
            "source_institution": r.source_institution,
            "rights_declared": r.rights_declared,
            "is_synthetic": r.is_synthetic
        }
        for r in records[:10]
    ]

    return {
        "state_code": st_entry["code"],
        "state_name": state_name,
        "type": st_entry.get("type", "State"),
        "notes": st_entry.get("notes"),
        "total_records": total_records,
        "is_zero_in_collection": (total_records == 0),
        "zero_label": "not documented in the analysed collection" if total_records == 0 else None,
        "art_forms": art_forms,
        "languages": languages,
        "sources": sources,
        "dimension_quality": dimension_quality,
        "sample_records": sample_records,
        "standing_caveat": "Absence of a record is never proof that a tradition, region or community has less heritage. Low counts describe the analysed collection, not the region."
    }

