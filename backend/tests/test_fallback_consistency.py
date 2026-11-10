"""Regression test ensuring landing hero fallback values strictly match the default API collection."""
import os
import re
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_hero_fallback_matches_default_collection_api():
    """Verify that the default fused-v2 collection metrics exactly match the landing page fallbacks."""
    # 1. Fetch default collection summary from API
    response = client.get("/api/collections/fused-v2/summary")
    assert response.status_code == 200, f"Failed to get summary: {response.text}"
    data = response.json()

    total_records = data["total_records"]
    ccd_val = round(data["latest_ccd"], 1)
    assessable_dim_count = int(data["latest_assessability"].split()[0])

    assert total_records == 317, f"Expected 317 records, got {total_records}"
    assert ccd_val == 29.9, f"Expected 29.9 CCD, got {ccd_val}"
    assert assessable_dim_count == 5, f"Expected 5 assessable dimensions, got {assessable_dim_count}"

    # 2. Inspect frontend landing page source code to ensure fallbacks match exactly
    page_path = os.path.join(os.path.dirname(__file__), "../../frontend/app/page.tsx")
    assert os.path.exists(page_path), "frontend/app/page.tsx not found"
    
    with open(page_path, "r", encoding="utf-8") as f:
        content = f.read()

    # Verify fallback total_records is 317
    assert 'summary.total_records.toLocaleString() : "317"' in content, "Fallback total_records in page.tsx is not 317"
    
    # Verify fallback CCD is 29.9
    assert 'audit.ccd.toFixed(1) : "29.9"' in content, "Fallback CCD in page.tsx is not 29.9"

    # Verify fallback assessability is 5
    assert 'audit.assessability.split(" ")[0] : "5"' in content, "Fallback assessability in page.tsx is not 5"

