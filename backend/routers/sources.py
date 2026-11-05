"""Sources API Router: Provides source layer management, live state coverage matrix,
layer toggling, and harvest ledger downloads (F1).
"""
import csv
import io
import json
import os
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
import yaml

from backend.app.db import get_db
from backend.app.models import SourceLayer, HarvestRun, StateAttribution, Record

router = APIRouter(prefix="/api/sources", tags=["Sources"])

CONFIG_DIR = os.path.join(os.path.dirname(__file__), "../../config")
STATES_CONFIG_PATH = os.path.join(CONFIG_DIR, "states.yaml")
COVERAGE_REPORT_PATH = os.path.join(os.path.dirname(__file__), "../../data/seed/state_coverage_report.json")

@router.get("")
def list_sources(db: Session = Depends(get_db)):
    """List all source layers with their harvest status, item count, licence summary and terms."""
    layers = db.query(SourceLayer).all()
    results = []

    for l in layers:
        last_run = db.query(HarvestRun).filter(HarvestRun.layer_id == l.id).order_by(HarvestRun.started_at.desc()).first()
        record_count = db.query(Record).filter(Record.layer_id == l.id).count()

        results.append({
            "id": l.id,
            "name": l.name,
            "kind": l.kind,
            "licence_summary": l.licence_summary,
            "terms_url": l.terms_url,
            "access_method": l.access_method,
            "enabled": l.enabled,
            "total_items": record_count if record_count > 0 else (last_run.items_kept if last_run else 0),
            "last_harvest_at": last_run.finished_at.isoformat() if last_run and last_run.finished_at else None,
            "status": last_run.status if last_run else "ready"
        })

    # Load state coverage report if available
    coverage_report = None
    if os.path.exists(COVERAGE_REPORT_PATH):
        with open(COVERAGE_REPORT_PATH, "r", encoding="utf-8") as f:
            coverage_report = json.load(f)

    return {
        "layers": results,
        "state_coverage": coverage_report
    }

@router.patch("/{layer_id}/toggle")
def toggle_source_layer(layer_id: str, db: Session = Depends(get_db)):
    """Toggle a source layer enabled/disabled state."""
    layer = db.query(SourceLayer).filter(SourceLayer.id == layer_id).first()
    if not layer:
        raise HTTPException(status_code=404, detail="Source layer not found")
    layer.enabled = not layer.enabled
    db.commit()
    return {"id": layer.id, "name": layer.name, "enabled": layer.enabled}

@router.get("/ledger.csv")
def download_harvest_ledger(db: Session = Depends(get_db)):
    """Download complete harvest ledger as CSV."""
    runs = db.query(HarvestRun).order_by(HarvestRun.started_at.desc()).all()
    
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Run ID", "Layer ID", "Started At", "Finished At", "Status",
        "Items Seen", "Items Kept", "Items Rejected", "Errors"
    ])

    for r in runs:
        writer.writerow([
            r.id, r.layer_id,
            r.started_at.isoformat() if r.started_at else "",
            r.finished_at.isoformat() if r.finished_at else "",
            r.status, r.items_seen, r.items_kept, r.items_rejected,
            "; ".join(r.errors_json or [])
        ])

    csv_data = output.getvalue()
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=the_silence_index_harvest_ledger.csv"}
    )
