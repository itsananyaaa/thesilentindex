import csv
import io
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session

from backend.app.db import get_db
from backend.app.models import Audit, Record, RecordDimensionStatus
from backend.engines.coverage import CoverageEngine

router = APIRouter(prefix="/api/audits", tags=["Coverage Matrix"])

@router.get("/{id}/matrix")
def get_coverage_matrix(
    id: str,
    category: str | None = None,
    dimension: str | None = None,
    db: Session = Depends(get_db)
):
    """Retrieve category-by-dimension coverage matrix for an audit."""
    audit = db.query(Audit).filter_by(id=id).first()
    if not audit:
        raise HTTPException(status_code=404, detail={"code": "NOT_FOUND", "message": f"Audit '{id}' not found."})

    engine = CoverageEngine()
    dim_specs = engine.dimension_definitions
    cat_specs = engine.applicability

    # Query all statuses for this audit
    query = db.query(
        Record.category_id,
        RecordDimensionStatus.dimension,
        RecordDimensionStatus.status,
        RecordDimensionStatus.score,
        RecordDimensionStatus.record_id
    ).join(Record, RecordDimensionStatus.record_id == Record.id).filter(
        RecordDimensionStatus.audit_id == id
    )

    if category:
        query = query.filter(Record.category_id == category)
    if dimension:
        query = query.filter(RecordDimensionStatus.dimension == dimension)

    rows = query.all()

    # Aggregate by (category, dimension)
    cell_data: dict[Tuple[str, str], dict[str, Any]] = {}

    for cat_id, dim_id, status_val, score_val, rec_id in rows:
        key = (cat_id or "visual_arts", dim_id)
        if key not in cell_data:
            cell_data[key] = {
                "scores": [],
                "statuses": {"Documented": 0, "Partial": 0, "Undocumented in collection": 0, "Not assessable": 0, "Not applicable": 0},
                "record_ids": []
            }
        cell_data[key]["scores"].append(score_val)
        cell_data[key]["statuses"][status_val] = cell_data[key]["statuses"].get(status_val, 0) + 1
        cell_data[key]["record_ids"].append(rec_id)

    # Build response grid
    grid = []
    for cat_id, cat_info in cat_specs.items():
        if category and cat_id != category:
            continue

        cat_row = {
            "category_id": cat_id,
            "category_name": cat_info.get("name", cat_id.replace("_", " ").title()),
            "dimensions": []
        }

        for dim_id, dim_info in dim_specs.items():
            if dimension and dim_id != dimension:
                continue

            k = (cat_id, dim_id)
            c_info = cell_data.get(k)
            
            is_applicable = cat_info.get("applicable_dimensions", {}).get(dim_id, True)

            if not c_info:
                dominant = "Not applicable" if not is_applicable else "Not assessable"
                cat_row["dimensions"].append({
                    "dimension_id": dim_id,
                    "dimension_name": dim_info.get("name", dim_id),
                    "total_records": 0,
                    "applicable": is_applicable,
                    "assessable": False,
                    "dominant_status": dominant,
                    "mean_score": 0.0,
                    "status_distribution": {},
                    "responsible_records_count": 0
                })
                continue

            total = len(c_info["scores"])
            statuses = c_info["statuses"]
            dominant = max(statuses, key=statuses.get) if total > 0 else "Not assessable"
            mean_sc = round(sum(c_info["scores"]) / total, 3) if total > 0 else 0.0

            cat_row["dimensions"].append({
                "dimension_id": dim_id,
                "dimension_name": dim_info.get("name", dim_id),
                "total_records": total,
                "applicable": is_applicable,
                "assessable": dominant != "Not assessable",
                "dominant_status": dominant,
                "mean_score": mean_sc,
                "status_distribution": statuses,
                "responsible_records_count": total
            })

        grid.append(cat_row)

    return {
        "audit_id": id,
        "categories_count": len(grid),
        "dimensions": [{"id": k, "name": v["name"]} for k, v in dim_specs.items()],
        "grid": grid
    }

@router.get("/{id}/matrix/cell")
def get_matrix_cell_records(
    id: str,
    category: str,
    dimension: str,
    format: str | None = "json",
    db: Session = Depends(get_db)
):
    """Retrieve list of responsible records in a specific category x dimension matrix cell."""
    records_query = db.query(
        Record, RecordDimensionStatus
    ).join(
        RecordDimensionStatus, Record.id == RecordDimensionStatus.record_id
    ).filter(
        RecordDimensionStatus.audit_id == id,
        Record.category_id == category,
        RecordDimensionStatus.dimension == dimension
    )

    results = records_query.all()
    
    if format == "csv":
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(["record_id", "title", "art_form", "state", "category", "dimension", "score", "status", "reason"])
        for rec, st in results:
            writer.writerow([
                rec.id, rec.title, rec.art_form, rec.state, rec.category_id,
                st.dimension, st.score, st.status, st.reason
            ])
        return Response(
            content=output.getvalue(),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename=cell_{category}_{dimension}.csv"}
        )

    records_list = []
    for rec, st in results:
        records_list.append({
            "id": rec.id,
            "title": rec.title,
            "art_form": rec.art_form,
            "state": rec.state,
            "period": rec.period_text,
            "category": rec.category_id,
            "image_url": rec.image_url,
            "thumbnail_url": rec.thumbnail_url,
            "dimension": st.dimension,
            "score": st.score,
            "status": st.status,
            "reason": st.reason,
            "rights_declared": rec.rights_declared,
            "is_synthetic": rec.is_synthetic
        })

    return {
        "audit_id": id,
        "category": category,
        "dimension": dimension,
        "total_records": len(records_list),
        "records": records_list
    }

