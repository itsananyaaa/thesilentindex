import os
from datetime import UTC, datetime

from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse

from backend.routers import (
    audits,
    briefs,
    collections,
    compare,
    config_router,
    entities,
    exports,
    gaps,
    health,
    images,
    map,
    matrix,
    records,
    sources,
    uploads,
)

app = FastAPI(
    title="THE SILENCE INDEX API",
    description="Cultural Collection Auditing & Preservation Priority Intelligence Platform.",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS
allowed_origins_env = os.environ.get("ALLOWED_ORIGINS", "*")
allowed_origins = [o.strip() for o in allowed_origins_env.split(",")] if allowed_origins_env != "*" else ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Exception handlers for structured errors: {code, message, hint}
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "code": "VALIDATION_ERROR",
            "message": "The request payload failed schema validation.",
            "hint": "Check field types and mandatory parameters against the API documentation.",
            "details": exc.errors()
        }
    )

# Routers
app.include_router(collections.router)
app.include_router(audits.router)
app.include_router(matrix.router)
app.include_router(map.router)
app.include_router(records.router)
app.include_router(images.router)
app.include_router(uploads.router)
app.include_router(config_router.router)
app.include_router(sources.router)
app.include_router(entities.router)
app.include_router(gaps.router)
app.include_router(compare.router)
app.include_router(briefs.router)
app.include_router(exports.router)
app.include_router(health.router)

@app.get("/api/geo/states", tags=["System"])
def get_india_states_geojson():
    """Serve canonical, optimized India states GeoJSON directly for map rendering."""
    geo_path = os.path.join(os.path.dirname(__file__), "../../data/geo/india_states.geojson")
    if os.path.exists(geo_path):
        return FileResponse(geo_path, media_type="application/geo+json")
    return JSONResponse(
        status_code=404,
        content={"code": "NOT_FOUND", "message": "GeoJSON file not found."}
    )

