import uuid
from datetime import UTC, datetime

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from backend.app.db import get_db
from backend.app.models import Collection, ColumnMapping, FieldProvenance, Record
from backend.app.schemas import ColumnMappingUpdateRequest, UploadValidationResponse
from backend.engines.ingest import parse_and_validate_file
from backend.engines.normalise import NormalisationEngine

router = APIRouter(prefix="/api/uploads", tags=["Collection Auditor & Ingestion"])

@router.post("", response_model=UploadValidationResponse)
async def upload_collection_file(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Upload a CSV or JSON collection dataset, validate integrity, and suggest column mappings."""
    try:
        raw_bytes = await file.read()
        parsed = parse_and_validate_file(raw_bytes, file.filename or "uploaded_dataset.csv")
    except ValueError as e:
        raise HTTPException(status_code=400, detail={"code": "VALIDATION_FAILED", "message": str(e)})
    except Exception as e:
        raise HTTPException(status_code=500, detail={"code": "SERVER_ERROR", "message": f"Unexpected parsing error: {e!s}"})

    col_id = f"upload-{uuid.uuid4().hex[:8]}"
    clean_name = (file.filename or "Uploaded Collection").replace(".csv", "").replace(".json", "").replace("_", " ").title()

    col = Collection(
        id=col_id,
        name=clean_name,
        kind="upload",
        description=f"User-uploaded cultural collection audit: {file.filename} ({parsed['total_rows']} records).",
        source_notes=f"Uploaded at {datetime.now(UTC).isoformat()} via Collection Auditor wizard."
    )
    db.add(col)

    # Persist column mappings
    for m in parsed["suggested_mappings"]:
        db.add(ColumnMapping(
            collection_id=col_id,
            source_column=m["source_column"],
            canonical_field=m["canonical_field"],
            confidence=m["confidence"],
            confirmed=m["confirmed"]
        ))

    # Persist records immutably
    normalizer = NormalisationEngine()
    for idx, r in enumerate(parsed["all_rows"], start=1):
        rec_id = f"{col_id}-REC-{idx:04d}"
        
        # Simple initial mapping using suggested mapping
        m_dict = {m["source_column"]: m["canonical_field"] for m in parsed["suggested_mappings"]}
        mapped_values = {}
        for col_name, val in r.items():
            canon = m_dict.get(col_name)
            if canon and canon != "unmapped":
                mapped_values[canon] = val

        raw_state = mapped_values.get("state")
        canon_state, state_code, state_prov = normalizer.normalise_state(raw_state)

        rec = Record(
            id=rec_id,
            collection_id=col_id,
            row_index=idx,
            original_json=dict(r), # Immutable raw copy
            title=str(mapped_values.get("title") or f"Record #{idx}")[:160],
            art_form=str(mapped_values.get("art_form") or "")[:100],
            category_id=str(mapped_values.get("category") or "visual_arts"),
            state=canon_state,
            place=str(mapped_values.get("district_place") or canon_state or "")[:100],
            period_text=str(mapped_values.get("period_date") or "")[:50],
            language=str(mapped_values.get("language") or "")[:50],
            materials=str(mapped_values.get("materials") or ""),
            technique=str(mapped_values.get("technique") or ""),
            description=str(mapped_values.get("description") or ""),
            creator=str(mapped_values.get("maker_name") or ""),
            community=str(mapped_values.get("community") or ""),
            source_institution=str(mapped_values.get("source_institution") or ""),
            accession_id=str(mapped_values.get("accession_id") or ""),
            source_url=str(mapped_values.get("source_url") or ""),
            image_url=str(mapped_values.get("image_url") or ""),
            thumbnail_url=str(mapped_values.get("image_url") or ""),
            rights_declared=str(mapped_values.get("rights_license") or ""),
            is_synthetic=False
        )
        db.add(rec)

        if state_prov:
            db.add(FieldProvenance(
                record_id=rec_id,
                field="state",
                origin=state_prov["origin"],
                method=state_prov["method"],
                confidence=state_prov["confidence"],
                detail=state_prov["detail"]
            ))

    db.commit()

    return UploadValidationResponse(
        upload_id=col_id,
        filename=file.filename or "uploaded_dataset.csv",
        total_rows=parsed["total_rows"],
        detected_encoding=parsed["encoding"],
        detected_delimiter=parsed["delimiter"],
        has_header=True,
        warnings=parsed["warnings"],
        suggested_mappings=parsed["suggested_mappings"],
        sample_rows=parsed["sample_rows"]
    )

@router.put("/{id}/mapping")
def update_column_mapping(
    id: str,
    req: ColumnMappingUpdateRequest,
    db: Session = Depends(get_db)
):
    """Confirm or update column mapping configurations for an uploaded collection."""
    col = db.query(Collection).filter_by(id=id).first()
    if not col:
        raise HTTPException(status_code=404, detail={"code": "NOT_FOUND", "message": f"Collection '{id}' not found."})

    # Delete existing mappings
    db.query(ColumnMapping).filter_by(collection_id=id).delete()

    for m in req.mappings:
        db.add(ColumnMapping(
            collection_id=id,
            source_column=m.source_column,
            canonical_field=m.canonical_field,
            confidence=m.confidence,
            confirmed=m.confirmed
        ))

    db.commit()
    return {"status": "success", "message": "Column mappings updated successfully.", "total_mappings": len(req.mappings)}

