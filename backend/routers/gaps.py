"""Existence-Documentation Gap API Router (F3).
Contrasts external existence evidence against institutional documentation depth.
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from backend.app.db import get_db
from backend.app.models import HeritageEntity, EntityLink, Record, RecordDimensionStatus

router = APIRouter(prefix="/api/gaps", tags=["Existence Gap Analysis"])

@router.get("")
def get_existence_documentation_gaps(
    state: str | None = Query(None, description="Filter by state code"),
    category: str | None = Query(None, description="Filter by category"),
    db: Session = Depends(get_db)
):
    """Retrieve 2-axis gap coordinates for all Heritage Entities."""
    entities = db.query(HeritageEntity).all()
    points = []

    for ent in entities:
        if state and state.upper() not in (ent.primary_state_codes or []):
            continue
        if category and ent.category_id != category:
            continue

        links = db.query(EntityLink).filter(EntityLink.entity_id == ent.id).all()
        rec_ids = [l.record_id for l in links]
        records = db.query(Record).filter(Record.id.in_(rec_ids)).all() if rec_ids else []

        # 1. Existence Evidence Depth (0 to 100)
        is_unesco = any("unesco" in r.id.lower() or "unesco" in (r.layer_id or "") for r in records) or "unesco" in ent.created_from
        is_gi = any("gi" in r.id.lower() or "gi" in (r.layer_id or "") for r in records) or "gi" in ent.created_from
        is_monument = ent.entity_type == "monument" or any(r.record_kind == "monument" for r in records)
        has_community = any(r.community for r in records)
        multi_inst = len(records) > 1

        e_score = 15.0
        existence_factors = []
        if is_unesco:
            e_score += 40.0
            existence_factors.append("UNESCO Inscription (+40)")
        elif is_gi:
            e_score += 35.0
            existence_factors.append("Geographical Indication (GI) Registered (+35)")
        elif is_monument:
            e_score += 35.0
            existence_factors.append("Centrally Protected Monument / Archaeological Site (+35)")
        else:
            existence_factors.append("Regional Archival Entry (+15)")

        if multi_inst:
            bonus = min(20.0, len(records) * 4.0)
            e_score += bonus
            existence_factors.append(f"Documented across {len(records)} independent institutions (+{int(bonus)})")
        if has_community:
            e_score += 10.0
            existence_factors.append("Living artisan/practitioner community recorded (+10)")
        if ent.wikidata_qid:
            e_score += 10.0
            existence_factors.append("Wikidata Cultural QID Authority (+10)")

        existence_depth = round(min(95.0, max(15.0, e_score)), 1)

        # 2. Documentation Depth (0 to 100)
        statuses = db.query(RecordDimensionStatus).filter(RecordDimensionStatus.record_id.in_(rec_ids)).all() if rec_ids else []
        dim_max = {}
        for s in statuses:
            dim_max[s.dimension] = max(dim_max.get(s.dimension, 0.0), s.score or 0.0)

        sum_dim = sum(dim_max.values())
        if statuses:
            record_depth_bonus = min(30.0, (len(records) - 1) * 7.5) if len(records) > 1 else 0.0
            raw_doc = (sum_dim / 3.2) * 42.0 + record_depth_bonus
            doc_depth = round(min(95.0, max(15.0, raw_doc)), 1)
        else:
            doc_depth = 15.0

        # 3. Quadrant Assignment (Standard 50% Thresholds)
        if existence_depth >= 50.0 and doc_depth < 50.0:
            quadrant = "high_priority_gap" # Bottom-right: High existence, low documentation
            quadrant_label = "High Preservation Documentation Priority"
        elif existence_depth >= 50.0 and doc_depth >= 50.0:
            quadrant = "well_documented" # Top-right: High existence, high documentation
            quadrant_label = "Extensively Documented Heritage"
        elif existence_depth < 50.0 and doc_depth >= 50.0:
            quadrant = "deep_catalog_obscure" # Top-left: Low existence, high documentation
            quadrant_label = "Rich Catalog / Emerging Recognition"
        else:
            quadrant = "baseline" # Bottom-left: Low existence, low documentation
            quadrant_label = "Under-Represented Baseline"

        points.append({
            "entity_id": ent.id,
            "label": ent.label,
            "entity_type": ent.entity_type,
            "category_id": ent.category_id,
            "primary_state_codes": ent.primary_state_codes,
            "existence_depth": existence_depth,
            "documentation_depth": doc_depth,
            "quadrant": quadrant,
            "quadrant_label": quadrant_label,
            "existence_factors": existence_factors,
            "linked_records_count": len(records)
        })

    # Sort so high priority gaps appear first
    points.sort(key=lambda p: (p["quadrant"] == "high_priority_gap", p["existence_depth"] - p["documentation_depth"]), reverse=True)

    # Quadrant summary statistics
    quadrant_counts = {
        "high_priority_gap": sum(1 for p in points if p["quadrant"] == "high_priority_gap"),
        "well_documented": sum(1 for p in points if p["quadrant"] == "well_documented"),
        "deep_catalog_obscure": sum(1 for p in points if p["quadrant"] == "deep_catalog_obscure"),
        "baseline": sum(1 for p in points if p["quadrant"] == "baseline")
    }

    return {
        "total_entities_plotted": len(points),
        "quadrant_summary": quadrant_counts,
        "points": points
    }

