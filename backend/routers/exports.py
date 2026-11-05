"""Open Data & Linked-Data Export API Router (F6).
Provides JSON-LD (Schema.org & Dublin Core), comprehensive CSV, GeoJSON, and priorities exports.
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
from backend.app.models import Collection, Record, Audit, StateAttribution, PreservationPriority

router = APIRouter(prefix="/api/export", tags=["Open Data Exports"])

GEOJSON_PATH = os.path.join(os.path.dirname(__file__), "../../data/geo/india_states.geojson")
STATES_CONFIG_PATH = os.path.join(os.path.dirname(__file__), "../../config/states.yaml")

@router.get("/{collection_id}/jsonld")
def export_collection_jsonld(collection_id: str, db: Session = Depends(get_db)):
    """Export collection records formatted as JSON-LD with Schema.org & Dublin Core terms."""
    col = db.query(Collection).filter(Collection.id == collection_id).first()
    if not col:
        raise HTTPException(status_code=404, detail="Collection not found")

    records = db.query(Record).filter(Record.collection_id == collection_id).all()

    items = []
    for r in records:
        items.append({
            "@type": "schema:VisualArtwork" if r.category_id == "visual_arts" else "schema:CreativeWork",
            "@id": f"urn:thesilentindex:record:{r.id}",
            "schema:name": r.title,
            "dcterms:title": r.title,
            "schema:description": r.description,
            "dcterms:description": r.description,
            "schema:artform": r.art_form,
            "schema:genre": r.category_id,
            "dcterms:subject": r.category_id,
            "schema:spatialCoverage": {
                "@type": "schema:Place",
                "schema:name": r.state,
                "schema:geo": {
                    "@type": "schema:GeoCoordinates",
                    "schema:latitude": r.lat,
                    "schema:longitude": r.lon
                } if r.lat and r.lon else None
            } if r.state else None,
            "dcterms:spatial": r.state,
            "schema:creator": {
                "@type": "schema:Person",
                "schema:name": r.creator
            } if r.creator else None,
            "dcterms:creator": r.creator,
            "schema:material": r.materials,
            "schema:holdingArchive": {
                "@type": "schema:ArchiveOrganization",
                "schema:name": r.source_institution
            } if r.source_institution else None,
            "schema:image": r.image_url,
            "schema:license": r.rights_declared,
            "dcterms:license": r.rights_category,
            "schema:isAccessibleForFree": r.download_allowed
        })

    jsonld_doc = {
        "@context": {
            "schema": "https://schema.org/",
            "dcterms": "http://purl.org/dc/terms/",
            "rdfs": "http://www.w3.org/2000/01/rdf-schema#"
        },
        "@graph": {
            "@type": "schema:DataCatalog",
            "@id": f"urn:thesilentindex:collection:{col.id}",
            "schema:name": col.name,
            "schema:description": col.description,
            "schema:license": "https://creativecommons.org/publicdomain/zero/1.0/",
            "schema:dataset": items
        }
    }

    return Response(
        content=json.dumps(jsonld_doc, indent=2, ensure_ascii=False),
        media_type="application/ld+json",
        headers={"Content-Disposition": f"attachment; filename=silentindex_{collection_id}_linked_data.jsonld"}
    )

@router.get("/{collection_id}/csv")
def export_collection_csv(collection_id: str, db: Session = Depends(get_db)):
    """Export complete collection records with canonical, normalized, and provenance fields as CSV."""
    records = db.query(Record).filter(Record.collection_id == collection_id).all()
    if not records:
        raise HTTPException(status_code=404, detail="No records found for collection")

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Record ID", "Collection ID", "Layer ID", "Record Kind", "Title",
        "Art Form", "Cultural Category", "State Provenance", "Place",
        "Latitude", "Longitude", "Language", "Period / Date", "Materials",
        "Technique", "Description", "Creator / Artisan", "Community",
        "Source Institution", "Accession ID", "Source URL", "Image URL",
        "Declared Rights", "Normalised Rights Category", "Download Allowed", "Is Synthetic"
    ])

    for r in records:
        writer.writerow([
            r.id, r.collection_id, r.layer_id or "", r.record_kind or "", r.title,
            r.art_form or "", r.category_id or "", r.state or "", r.place or "",
            r.lat or "", r.lon or "", r.language or "", r.period_text or "",
            r.materials or "", r.technique or "", r.description or "",
            r.creator or "", r.community or "", r.source_institution or "",
            r.accession_id or "", r.source_url or "", r.image_url or "",
            r.rights_declared or "", r.rights_category or "", r.download_allowed, r.is_synthetic
        ])

    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=silentindex_{collection_id}_records.csv"}
    )

@router.get("/{collection_id}/geojson")
def export_collection_geojson(collection_id: str, db: Session = Depends(get_db)):
    """Export India GeoJSON polygons with embedded holding counts and coverage metrics."""
    if not os.path.exists(GEOJSON_PATH):
        raise HTTPException(status_code=500, detail="GeoJSON boundary file not found")

    with open(GEOJSON_PATH, "r", encoding="utf-8") as f:
        geo = json.load(f)

    # Compute record counts per state in this collection
    records = db.query(Record).filter(Record.collection_id == collection_id).all()
    state_counts = {}
    for r in records:
        if r.state:
            state_counts[r.state] = state_counts.get(r.state, 0) + 1

    for feature in geo.get("features", []):
        props = feature.get("properties", {})
        st_name = props.get("ST_NM") or props.get("name")
        count = state_counts.get(st_name, 0)
        props["total_records"] = count
        props["status"] = "documented" if count >= 5 else "partial" if count > 0 else "undocumented"
        props["collection_id"] = collection_id

    return Response(
        content=json.dumps(geo, indent=2, ensure_ascii=False),
        media_type="application/geo+json",
        headers={"Content-Disposition": f"attachment; filename=silentindex_{collection_id}_states.geojson"}
    )
