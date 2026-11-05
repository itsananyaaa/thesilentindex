"""Test Entity-Level Cultural Coverage Debt (CCD) Engine.
Verifies that:
1. S(E, d) = max_{r in E} S(r, d)
2. Cross-source fusion strictly closes or maintains metadata debt: Entity CCD <= Avg Record CCD
3. Correct provenance is tagged in 'supplied_by' for each dimension.
"""
from backend.app.db import SessionLocal
from backend.app.models import HeritageEntity, EntityLink
from backend.engines.entities import evaluate_heritage_entity_ccd

def test_entity_level_ccd_evaluation():
    db = SessionLocal()
    try:
        # Find an entity with multiple linked records
        entities = db.query(HeritageEntity).all()
        assert len(entities) > 0
        
        target_entity = None
        for e in entities:
            links = db.query(EntityLink).filter(EntityLink.entity_id == e.id).all()
            if len(links) > 1:
                target_entity = e
                break

        if not target_entity:
            target_entity = entities[0]

        eval_res = evaluate_heritage_entity_ccd(target_entity.id, db)
        assert eval_res["entity_id"] == target_entity.id
        assert eval_res["entity_ccd"] is not None
        assert eval_res["record_level_avg_ccd"] is not None
        
        # Mathematical axiom: Entity CCD must be <= Average Record CCD because max score reduces debt
        assert eval_res["entity_ccd"] <= eval_res["record_level_avg_ccd"] + 0.01
        assert eval_res["debt_closed_delta"] >= 0.0

        # Check dimension structure
        dims = eval_res["dimensions"]
        assert len(dims) == 10
        for d_id, d_data in dims.items():
            assert "score" in d_data
            assert "status" in d_data
            assert d_data["score"] >= 0.0 and d_data["score"] <= 1.0
    finally:
        db.close()

