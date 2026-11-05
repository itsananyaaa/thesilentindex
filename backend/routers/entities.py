"""Heritage Entities API Router (F2).
Profiles clustered traditions, monuments, crafts, and performing arts across fused sources.
"""
import re
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from backend.app.db import get_db
from backend.app.models import HeritageEntity, EntityLink, Record
from backend.engines.entities import evaluate_heritage_entity_ccd

router = APIRouter(prefix="/api/entities", tags=["Heritage Entities"])

@router.get("")
def list_heritage_entities(
    q: str | None = Query(None, description="Search label or tradition"),
    category: str | None = Query(None, description="Filter by category_id"),
    state: str | None = Query(None, description="Filter by 2-letter state code"),
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """List heritage entities with search and filters."""
    query = db.query(HeritageEntity)
    if q:
        query = query.filter(HeritageEntity.label.ilike(f"%{q}%"))
    if category:
        query = query.filter(HeritageEntity.category_id == category)

    entities = query.limit(limit).all()
    results = []

    for e in entities:
        if state and state.upper() not in (e.primary_state_codes or []):
            continue
        link_count = db.query(EntityLink).filter(EntityLink.entity_id == e.id).count()

        # Deterministic local museum SVG illustration
        slug = re.sub(r'[^a-z0-9]+', '_', e.label.lower()).strip('_')
        cat_slug = re.sub(r'[^a-z0-9]+', '_', (e.category_id or "visual_arts").lower()).strip('_')
        img_url = f"/images/heritage/{slug}.svg"

        results.append({
            "id": e.id,
            "label": e.label,
            "entity_type": e.entity_type,
            "category_id": e.category_id,
            "primary_state_codes": e.primary_state_codes,
            "created_from": e.created_from,
            "linked_records_count": link_count,
            "image_url": img_url,
            "fallback_image_url": f"/images/heritage/{cat_slug}.svg"
        })

    return {"total": len(results), "entities": results}

@router.get("/{entity_id}")
def get_heritage_entity_profile(entity_id: str, db: Session = Depends(get_db)):
    """Retrieve full entity profile with dimension evidence stack and recognition badges."""
    try:
        profile = evaluate_heritage_entity_ccd(entity_id, db)
        
        # Add Recognition Badges
        badges = []
        lbl = profile["label"].lower()
        if "unesco" in profile["created_from"] or any("unesco" in r.get("id", "").lower() for r in profile["linked_records"]):
            badges.append({
                "kind": "UNESCO_ICH",
                "label": "UNESCO Representative List of Intangible Cultural Heritage",
                "year": "Inscribed",
                "issuer": "UNESCO"
            })
        if "gi" in profile["created_from"] or any("gi" in r.get("id", "").lower() for r in profile["linked_records"]):
            badges.append({
                "kind": "GI_TAG",
                "label": "Geographical Indication (GI) Registered",
                "year": "Registered",
                "issuer": "Intellectual Property India"
            })
        if profile["entity_type"] == "monument" or any("wd" in r.get("id", "").lower() for r in profile["linked_records"]):
            badges.append({
                "kind": "ASI_PROTECTED",
                "label": "Centrally Protected Monument / Archaeological Site",
                "year": "National Heritage",
                "issuer": "Archaeological Survey of India"
            })

        profile["recognition_badges"] = badges
        slug = re.sub(r'[^a-z0-9]+', '_', profile["label"].lower()).strip('_')
        cat_slug = re.sub(r'[^a-z0-9]+', '_', (profile.get("category_id") or "visual_arts").lower()).strip('_')
        profile["image_url"] = f"/images/heritage/{slug}.svg"
        profile["fallback_image_url"] = f"/images/heritage/{cat_slug}.svg"
        return profile
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

