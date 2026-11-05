"""Freeze Seed: Fuses all harvested layers into data/seed/records_fused.jsonl,
computes state-level coverage analysis (target >= 25 per state, >= 10 per UT, or Sparse badge),
builds Heritage Entities and Entity Links, and populates the fused-v2 collection in SQLite.
"""
from datetime import UTC, datetime
import json
import os
import sys
import yaml

# Ensure project root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from backend.app.db import SessionLocal
from backend.app.models import (
    Collection, Record, StateAttribution, HeritageEntity, EntityLink, SourceLayer
)
from backend.engines.coverage import CoverageEngine
from backend.engines.ccd import compute_collection_ccd
from backend.engines.priority import compute_preservation_priorities
from backend.app.models import Audit, RecordDimensionStatus, PreservationPriority, DuplicateCluster

from scripts.harvest.gi_registry import GiRegistryAdapter
from scripts.harvest.wikidata_sparql import WikidataSparqlAdapter
from scripts.harvest.commons_categories import CommonsCategoriesAdapter
from scripts.harvest.unesco_ich import UnescoIchAdapter
from scripts.harvest.museum_layers import MuseumOpenAccessAdapter

ADAPTERS = [
    GiRegistryAdapter(),
    WikidataSparqlAdapter(),
    CommonsCategoriesAdapter(),
    UnescoIchAdapter(),
    MuseumOpenAccessAdapter()
]

STATES_CONFIG_PATH = os.path.join(os.path.dirname(__file__), "../../config/states.yaml")
SEED_DIR = os.path.join(os.path.dirname(__file__), "../../data/seed")
FUSED_JSONL_PATH = os.path.join(SEED_DIR, "records_fused.jsonl")
COVERAGE_REPORT_PATH = os.path.join(SEED_DIR, "state_coverage_report.json")

def freeze_seed():
    print("=== Freezing Fused Multi-Source Seed Dataset ===")
    os.makedirs(SEED_DIR, exist_ok=True)
    db = SessionLocal()

    # Load states metadata
    with open(STATES_CONFIG_PATH, "r", encoding="utf-8") as f:
        states_cfg = yaml.safe_load(f).get("states", [])
    
    state_meta = {s["code"].replace("IN-", ""): s for s in states_cfg}

    # Collect all canonical records and state attributions
    all_fused_records = []
    record_attributions_map = {} # rec_id -> list of (state_code, basis, confidence, multi_state)
    layer_counts = {}
    state_counts = {code: 0 for code in state_meta}
    multi_state_counts = {code: 0 for code in state_meta}
    
    global_index = 1
    for adapter in ADAPTERS:
        print(f"Loading layer {adapter.layer_id}...")
        raw_items = adapter.discover(use_cache=True)
        layer_counts[adapter.layer_id] = len(raw_items)
        
        for item in raw_items:
            rec = adapter.to_record(item, global_index)
            rec["collection_id"] = "fused-v2"
            fused_rec_id = f"FUSED-{rec['id']}"
            rec["id"] = fused_rec_id
            
            # Fetch attributions
            attrs = adapter.state_attribution(item)
            record_attributions_map[fused_rec_id] = attrs
            
            for code, basis, conf, is_multi in attrs:
                if code in state_counts:
                    state_counts[code] += 1
                    if is_multi:
                        multi_state_counts[code] += 1

            all_fused_records.append(rec)
            global_index += 1

    print(f"Total fused records assembled: {len(all_fused_records)}")

    # Write fused records to data/seed/records_fused.jsonl
    with open(FUSED_JSONL_PATH, "w", encoding="utf-8") as f:
        for r in all_fused_records:
            f.write(json.dumps(r, ensure_ascii=False) + "\n")
    print(f"Saved fused seed to {FUSED_JSONL_PATH}")

    # Build State Coverage Report
    state_report = {}
    for code, meta in state_meta.items():
        st_type = meta.get("type", "State") # State | UT
        target_floor = 25 if st_type == "State" else 10
        count = state_counts.get(code, 0)
        multi_count = multi_state_counts.get(code, 0)
        is_sparse = count < target_floor

        state_report[code] = {
            "state_code": f"IN-{code}",
            "name": meta["name"],
            "type": st_type,
            "target_floor": target_floor,
            "total_attributed_records": count,
            "multi_state_records": multi_count,
            "single_state_records": count - multi_count,
            "meets_target_floor": not is_sparse,
            "sparse_coverage": is_sparse,
            "sparse_reason": "Upstream cultural archives and open-access repositories hold sparse public records for this territory." if is_sparse else None
        }

    coverage_summary = {
        "generated_at": datetime.now(UTC).isoformat(),
        "total_records_unique": len(all_fused_records),
        "total_state_attributions": sum(state_counts.values()),
        "states_and_uts_count": len(state_meta),
        "layers": layer_counts,
        "states": state_report
    }

    with open(COVERAGE_REPORT_PATH, "w", encoding="utf-8") as f:
        json.dump(coverage_summary, f, indent=2, ensure_ascii=False)
    print(f"Saved state coverage report to {COVERAGE_REPORT_PATH}")

    # Insert or update in SQLite Database
    print("\nPopulating SQLite database with fused collection, attributions & entities...")
    
    # Ensure collection exists
    fused_col = db.query(Collection).filter(Collection.id == "fused-v2").first()
    if not fused_col:
        fused_col = Collection(
            id="fused-v2",
            name="The National Silence Index (Fused 36-State & UT Collection)",
            kind="fused_v2",
            description="Multi-source fused intelligence holding across GI Registry, Wikidata Knowledge Graph, Wikimedia Commons, UNESCO Intangible Heritage, and Museum Open Access.",
            source_notes="Fused v2 multi-source dataset encompassing all 36 States & UTs of the Republic of India."
        )
        db.add(fused_col)
        db.commit()

    # Clear prior fused-v2 records and entities
    db.query(StateAttribution).filter(StateAttribution.record_id.in_([r["id"] for r in all_fused_records])).delete(synchronize_session=False)
    db.query(Record).filter(Record.collection_id == "fused-v2").delete(synchronize_session=False)
    db.commit()

    # Insert records
    db_records = []
    for r in all_fused_records:
        rec_obj = Record(
            id=r["id"],
            collection_id="fused-v2",
            layer_id=r.get("layer_id"),
            row_index=r["row_index"],
            record_kind=r.get("record_kind", "museum_object"),
            original_json=r.get("original_json", {}),
            title=r["title"],
            art_form=r.get("art_form"),
            category_id=r.get("category_id"),
            state=r.get("state"),
            place=r.get("place"),
            lat=r.get("lat"),
            lon=r.get("lon"),
            language=r.get("language"),
            period_text=r.get("period_text"),
            materials=r.get("materials"),
            technique=r.get("technique"),
            description=r.get("description"),
            creator=r.get("creator"),
            community=r.get("community"),
            source_institution=r.get("source_institution"),
            accession_id=r.get("accession_id"),
            source_url=r.get("source_url"),
            image_id=r.get("image_id"),
            image_url=r.get("image_url"),
            thumbnail_url=r.get("thumbnail_url"),
            rights_declared=r.get("rights_declared"),
            rights_category=r.get("rights_category"),
            download_allowed=r.get("download_allowed", False),
            is_synthetic=False
        )
        db_records.append(rec_obj)
    db.bulk_save_objects(db_records)
    db.commit()

    # Insert State Attributions
    db_attrs = []
    for r_id, attrs in record_attributions_map.items():
        for code, basis, conf, is_multi in attrs:
            db_attrs.append(StateAttribution(
                record_id=r_id,
                state_code=code,
                basis=basis,
                confidence=conf,
                multi_state=is_multi
            ))
    db.bulk_save_objects(db_attrs)
    db.commit()
    print(f"Saved {len(db_attrs)} state attributions.")

    # Build Heritage Entities
    print("\nBuilding Heritage Entities and cross-source entity links...")
    # Group records by canonical tradition/entity
    entities_map = {}
    
    # 1. Entity clusters from records
    for r in all_fused_records:
        art_f = r.get("art_form") or r["title"]
        ent_key = art_f.strip().lower()
        if ent_key not in entities_map:
            ent_id = f"ENT-{abs(hash(ent_key)) % 100000:05d}"
            entities_map[ent_key] = {
                "id": ent_id,
                "label": art_f,
                "entity_type": "monument" if r.get("record_kind") == "monument" else "craft" if r.get("record_kind") == "craft_registration" else "tradition",
                "category_id": r.get("category_id", "visual_arts"),
                "primary_state_codes": [],
                "description": r.get("description"),
                "created_from": r.get("layer_id", "fused"),
                "records": []
            }
        entities_map[ent_key]["records"].append(r["id"])
        
        # Add state codes
        for code, _, _, _ in record_attributions_map.get(r["id"], []):
            if code not in entities_map[ent_key]["primary_state_codes"]:
                entities_map[ent_key]["primary_state_codes"].append(code)

    # Insert entities and links
    db.query(EntityLink).delete()
    db.query(HeritageEntity).delete()
    db.commit()

    db_entities = []
    db_links = []
    for ent in entities_map.values():
        ent_obj = HeritageEntity(
            id=ent["id"],
            label=ent["label"],
            entity_type=ent["entity_type"],
            wikidata_qid=None,
            primary_state_codes=ent["primary_state_codes"],
            category_id=ent["category_id"],
            description=ent["description"],
            created_from=ent["created_from"]
        )
        db_entities.append(ent_obj)
        for r_id in ent["records"]:
            db_links.append(EntityLink(
                entity_id=ent["id"],
                record_id=r_id,
                link_basis="name_exact",
                confidence=1.0
            ))

    db.bulk_save_objects(db_entities)
    db.bulk_save_objects(db_links)
    db.commit()
    print(f"Created {len(db_entities)} Heritage Entities with {len(db_links)} cross-source links.")

    # Run Initial Audit for fused-v2 Collection
    print("\nRunning initial audit for fused-v2 collection...")
    coverage_engine = CoverageEngine()
    audit_id = "AUDIT-FUSED-V2-INIT"
    
    # Remove existing audit if present
    db.query(Audit).filter(Audit.id == audit_id).delete(synchronize_session=False)
    db.commit()

    all_evaluations = []
    dimension_status_objs = []
    mapped_fields = {
        "title", "art_form", "category_id", "state", "place", "period_text",
        "materials", "technique", "description", "creator", "community",
        "source_institution", "accession_id", "source_url", "image_url",
        "rights_declared", "rights_category"
    }

    for r in all_fused_records:
        evals = coverage_engine.evaluate_record(r, mapped_fields, r.get("category_id"))
        all_evaluations.append(evals)
        for dim_id, ev in evals.items():
            dimension_status_objs.append(RecordDimensionStatus(
                audit_id=audit_id,
                record_id=r["id"],
                dimension=dim_id,
                score=ev["score"],
                status=ev["status"],
                reason=ev["reason"]
            ))

    ccd_results = compute_collection_ccd(all_evaluations)
    priorities = compute_preservation_priorities(all_fused_records, all_evaluations)

    new_audit = Audit(
        id=audit_id,
        collection_id="fused-v2",
        started_at=datetime.now(UTC),
        finished_at=datetime.now(UTC),
        status="completed",
        ccd=ccd_results["ccd"],
        ccd_low=ccd_results["ccd_interval"][0],
        ccd_high=ccd_results["ccd_interval"][1],
        assessability=ccd_results["assessability"],
        progress_stage="completed",
        progress_percent=100
    )
    db.add(new_audit)
    db.bulk_save_objects(dimension_status_objs)
    
    for p in priorities:
        db.add(PreservationPriority(
            id=p["id"],
            audit_id=audit_id,
            slice_json=p.get("slice", p.get("slice_json")),
            dimension=p["dimension"],
            g=p["g"], e=p["e"], b=p["b"], f=p["f"],
            score=p["score"], band=p["band"],
            consultation=p["consultation"],
            next_step=p["next_step"],
            reasons_json=p.get("reasons", p.get("reasons_json", []))
        ))
    db.commit()
    db.close()
    print(f"✓ Fused-v2 audit completed with CCD = {ccd_results['ccd']:.1f}.")

if __name__ == "__main__":
    freeze_seed()
