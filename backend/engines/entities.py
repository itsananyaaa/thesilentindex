"""Heritage Entity Intelligence Engine.
Computes Entity-level Cultural Coverage Debt across fused cross-source evidence stacks:
S(E, d) = max_{r in E} S(r, d)

Demonstrates how multi-source fusion closes debt:
Delta Debt Closed = Avg_Record_CCD - Entity_CCD
"""
from typing import Any
import numpy as np
from sqlalchemy.orm import Session
from backend.app.models import HeritageEntity, EntityLink, Record, RecordDimensionStatus, Audit
from backend.engines.ccd import DEFAULT_WEIGHTS

def evaluate_heritage_entity_ccd(
    entity_id: str,
    db: Session,
    weights: dict[str, float] | None = None
) -> dict[str, Any]:
    """Compute cross-institutional documentation depth and closed debt for a Heritage Entity.
    
    Formula:
        For each dimension d in 1..10:
        S(E, d) = max_{r in E} S(r, d)
        Entity Debt(d) = 1.0 - S(E, d)
        Entity CCD = 100 * sum(w_d * Debt(d)) / sum(w_d)
    """
    entity = db.query(HeritageEntity).filter(HeritageEntity.id == entity_id).first()
    if not entity:
        raise ValueError(f"Heritage Entity '{entity_id}' not found.")

    links = db.query(EntityLink).filter(EntityLink.entity_id == entity_id).all()
    record_ids = [l.record_id for l in links]

    if not record_ids:
        return {
            "entity_id": entity.id,
            "label": entity.label,
            "entity_type": entity.entity_type,
            "linked_records_count": 0,
            "entity_ccd": None,
            "record_level_avg_ccd": None,
            "debt_closed_delta": 0.0,
            "dimensions": {},
            "linked_records": []
        }

    records = db.query(Record).filter(Record.id.in_(record_ids)).all()
    statuses = db.query(RecordDimensionStatus).filter(RecordDimensionStatus.record_id.in_(record_ids)).all()

    # Map record_id -> dim -> status_obj
    rec_dim_map = {}
    for st in statuses:
        if st.record_id not in rec_dim_map:
            rec_dim_map[st.record_id] = {}
        rec_dim_map[st.record_id][st.dimension] = st

    w_dict = {**DEFAULT_WEIGHTS, **(weights or {})}
    all_dims = list(DEFAULT_WEIGHTS.keys())

    dim_results = {}
    assessable_dims = []

    for d in all_dims:
        best_score = 0.0
        best_source_record = None
        has_applicable = False
        has_assessable = False

        evidence_stack = []

        for r in records:
            st = rec_dim_map.get(r.id, {}).get(d)
            if not st:
                continue

            r_score = st.score or 0.0
            evidence_stack.append({
                "record_id": r.id,
                "title": r.title,
                "layer_id": r.layer_id,
                "institution": r.source_institution,
                "score": r_score,
                "status": st.status,
                "reason": st.reason
            })

            if st.status != "Not applicable":
                has_applicable = True
            if st.status not in ("Not assessable", "Not applicable"):
                has_assessable = True

            if r_score > best_score:
                best_score = r_score
                best_source_record = r

        if not has_applicable:
            status = "Not applicable"
        elif not has_assessable:
            status = "Not assessable"
        elif best_score >= 0.75:
            status = "Documented"
            assessable_dims.append(d)
        elif best_score >= 0.25:
            status = "Partial"
            assessable_dims.append(d)
        else:
            status = "Undocumented in collection"
            assessable_dims.append(d)

        dim_results[d] = {
            "dimension": d,
            "score": round(best_score, 3),
            "status": status,
            "supplied_by": {
                "record_id": best_source_record.id if best_source_record else None,
                "title": best_source_record.title if best_source_record else None,
                "institution": best_source_record.source_institution if best_source_record else None,
                "layer_id": best_source_record.layer_id if best_source_record else None
            } if best_source_record else None,
            "evidence_stack": evidence_stack
        }

    # Compute Entity CCD
    if assessable_dims:
        num = sum(w_dict.get(d, 1.0) * (1.0 - dim_results[d]["score"]) for d in assessable_dims)
        denom = sum(w_dict.get(d, 1.0) for d in assessable_dims)
        entity_ccd = round(100.0 * num / denom, 2) if denom > 0 else 0.0
    else:
        entity_ccd = 0.0

    # Compute Record-level Average CCD across linked records
    record_ccds = []
    for r in records:
        r_scores = [rec_dim_map.get(r.id, {}).get(d).score for d in all_dims if rec_dim_map.get(r.id, {}).get(d) and rec_dim_map.get(r.id, {}).get(d).status not in ("Not assessable", "Not applicable")]
        if r_scores:
            r_debt = [1.0 - s for s in r_scores]
            record_ccds.append(round(100.0 * float(np.mean(r_debt)), 2))

    avg_record_ccd = round(float(np.mean(record_ccds)), 2) if record_ccds else entity_ccd
    debt_closed_delta = round(max(0.0, avg_record_ccd - entity_ccd), 2)

    return {
        "entity_id": entity.id,
        "label": entity.label,
        "entity_type": entity.entity_type,
        "category_id": entity.category_id,
        "description": entity.description,
        "primary_state_codes": entity.primary_state_codes,
        "created_from": entity.created_from,
        "linked_records_count": len(records),
        "entity_ccd": entity_ccd,
        "record_level_avg_ccd": avg_record_ccd,
        "debt_closed_delta": debt_closed_delta,
        "assessable_dimensions_count": len(assessable_dims),
        "dimensions": dim_results,
        "linked_records": [
            {
                "id": r.id,
                "title": r.title,
                "layer_id": r.layer_id,
                "institution": r.source_institution,
                "rights_category": r.rights_category,
                "image_url": r.image_url
            } for r in records
        ]
    }
