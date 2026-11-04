from fastapi import APIRouter, Depends, HTTPException, Query, Response
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import Dict, Any, List, Optional
from backend.app.db import get_db
from backend.app.models import ImageModel, Record
from backend.engines.rights import RightsCategory, REUSABLE_CATEGORIES

router = APIRouter(prefix="/api/images", tags=["Images & Media"])

@router.get("")
def list_images(
    rights_category: Optional[str] = None,
    institution: Optional[str] = None,
    q: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(24, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Browse high-resolution cultural heritage images with declared rights filtering."""
    query = db.query(ImageModel)

    if rights_category:
        query = query.filter(ImageModel.rights_category == rights_category)
    if institution:
        query = query.filter(ImageModel.institution.ilike(f"%{institution}%"))
    if q:
        query = query.filter(
            or_(
                ImageModel.title.ilike(f"%{q}%"),
                ImageModel.creator.ilike(f"%{q}%"),
                ImageModel.institution.ilike(f"%{q}%")
            )
        )

    total = query.count()
    images = query.order_by(ImageModel.id.asc()).offset((page - 1) * page_size).limit(page_size).all()

    items = []
    for img in images:
        items.append({
            "id": img.id,
            "record_id": img.record_id,
            "title": img.title,
            "creator": img.creator,
            "institution": img.institution,
            "image_url": img.image_url,
            "thumbnail_url": img.thumbnail_url or img.image_url,
            "source_url": img.source_url,
            "rights_declared": img.rights_declared,
            "rights_category": img.rights_category,
            "attribution_text": img.attribution_text,
            "attribution_required": img.attribution_required,
            "download_allowed": img.download_allowed,
            "harvested_at": img.harvested_at.isoformat() if img.harvested_at else None,
            "verified_at": img.verified_at.isoformat() if img.verified_at else None
        })

    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "images": items
    }

@router.get("/{id}/download")
def download_image(id: str, db: Session = Depends(get_db)):
    """Gated image download endpoint enforcing open-access reuse terms.
    
    Returns 403 Forbidden with explanatory text and source viewer link
    for in-copyright, proprietary, non-commercial, or unverified images.
    """
    img = db.query(ImageModel).filter_by(id=id).first()
    if not img:
        raise HTTPException(status_code=404, detail={"code": "NOT_FOUND", "message": f"Image '{id}' not found."})

    if not img.download_allowed:
        raise HTTPException(
            status_code=403,
            detail={
                "code": "DOWNLOAD_DISALLOWED",
                "message": (
                    f"Direct download is disallowed under declared rights category '{img.rights_category}' "
                    f"({img.rights_declared}). This object is available for viewing and reference only."
                ),
                "source_url": img.source_url,
                "hint": "Please access the holding institution or original provider repository directly via the source URL."
            }
        )

    # Allowed: Redirect to direct high-res image URL with attribution headers
    response = RedirectResponse(url=img.image_url, status_code=307)
    response.headers["X-Attribution"] = img.attribution_text
    response.headers["X-Rights-Category"] = img.rights_category
    return response

