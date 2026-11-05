"""Harvest Runner: Orchestrates all enabled source layers,
stores raw caches under data/raw/<layer_id>/, and registers harvest runs in SQLite.
"""
from datetime import UTC, datetime
import json
import os
import sys

# Ensure project root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from backend.app.db import SessionLocal
from backend.app.models import SourceLayer, HarvestRun
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

def run_harvest(use_cache: bool = True):
    print("=== THE SILENCE INDEX — Multi-Source Harvester ===")
    db = SessionLocal()
    harvest_summary = []

    try:
        for adapter in ADAPTERS:
            print(f"\n[Harvester] Processing Layer: {adapter.name} ({adapter.layer_id})...")
            
            # Ensure SourceLayer exists in DB
            layer_record = db.query(SourceLayer).filter(SourceLayer.id == adapter.layer_id).first()
            if not layer_record:
                layer_record = SourceLayer(
                    id=adapter.layer_id,
                    name=adapter.name,
                    kind=adapter.kind,
                    licence_summary=adapter.licence_summary,
                    terms_url=adapter.terms_url,
                    access_method="attributed_cache_replay" if use_cache else "live_api",
                    enabled=True
                )
                db.add(layer_record)
                db.commit()

            start_time = datetime.now(UTC)
            run_id = f"RUN-{adapter.layer_id}-{int(start_time.timestamp())}"
            
            try:
                raw_items = adapter.discover(use_cache=use_cache)
                kept_count = len(raw_items)
                
                # Record successful run
                run_entry = HarvestRun(
                    id=run_id,
                    layer_id=adapter.layer_id,
                    started_at=start_time,
                    finished_at=datetime.now(UTC),
                    status="completed",
                    items_seen=kept_count,
                    items_kept=kept_count,
                    items_rejected=0,
                    rejection_reasons_json={},
                    errors_json=[]
                )
                db.add(run_entry)
                db.commit()

                print(f"  ✓ {kept_count} items discovered and verified.")
                harvest_summary.append({
                    "layer_id": adapter.layer_id,
                    "name": adapter.name,
                    "kind": adapter.kind,
                    "items_kept": kept_count,
                    "status": "completed"
                })

            except Exception as e:
                print(f"  ❌ Error in {adapter.layer_id}: {e}")
                run_entry = HarvestRun(
                    id=run_id,
                    layer_id=adapter.layer_id,
                    started_at=start_time,
                    finished_at=datetime.now(UTC),
                    status="failed",
                    items_seen=0,
                    items_kept=0,
                    items_rejected=0,
                    rejection_reasons_json={},
                    errors_json=[str(e)]
                )
                db.add(run_entry)
                db.commit()
                harvest_summary.append({
                    "layer_id": adapter.layer_id,
                    "name": adapter.name,
                    "kind": adapter.kind,
                    "items_kept": 0,
                    "status": "failed",
                    "error": str(e)
                })

    finally:
        db.close()

    print("\n=== Harvest Summary ===")
    for s in harvest_summary:
        print(f"- {s['name']}: {s['items_kept']} items ({s['status']})")
    return harvest_summary

if __name__ == "__main__":
    run_harvest(use_cache=True)

