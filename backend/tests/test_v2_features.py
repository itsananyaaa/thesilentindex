"""Test Suite for v2 Standout Features (F1 - F9 APIs).
"""
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_f1_sources_api():
    res = client.get("/api/sources")
    assert res.status_code == 200
    data = res.json()
    assert "layers" in data
    assert len(data["layers"]) >= 5
    assert "state_coverage" in data

    # Toggle test
    layer_id = data["layers"][0]["id"]
    t_res = client.patch(f"/api/sources/{layer_id}/toggle")
    assert t_res.status_code == 200
    assert "enabled" in t_res.json()

    # Ledger CSV download
    l_res = client.get("/api/sources/ledger.csv")
    assert l_res.status_code == 200
    assert l_res.headers["content-type"] == "text/csv; charset=utf-8"
    assert "Run ID" in l_res.text

def test_f2_entities_api():
    res = client.get("/api/entities")
    assert res.status_code == 200
    data = res.json()
    assert data["total"] > 0
    assert len(data["entities"]) > 0

    ent_id = data["entities"][0]["id"]
    profile_res = client.get(f"/api/entities/{ent_id}")
    assert profile_res.status_code == 200
    pdata = profile_res.json()
    assert pdata["entity_id"] == ent_id
    assert "dimensions" in pdata
    assert "recognition_badges" in pdata

def test_f3_gaps_api():
    res = client.get("/api/gaps")
    assert res.status_code == 200
    data = res.json()
    assert "total_entities_plotted" in data
    assert "quadrant_summary" in data
    assert "points" in data
    assert len(data["points"]) > 0
    p = data["points"][0]
    assert "existence_depth" in p
    assert "documentation_depth" in p
    assert "quadrant" in p

def test_f4_compare_api():
    res = client.get("/api/compare?base_id=sample-real-001&target_id=fused-v2")
    assert res.status_code == 200
    data = res.json()
    assert "base" in data
    assert "target" in data
    assert "delta" in data
    assert "dimension_comparison" in data
    assert "state_comparison" in data

    # Simulate improvement
    sim_res = client.post("/api/compare/simulate-improvement?audit_id=AUDIT-FUSED-V2-INIT")
    assert sim_res.status_code == 200
    sdata = sim_res.json()
    assert sdata["projected_ccd"] < sdata["base_ccd"]

def test_f5_briefs_api():
    # Fetch a priority ID
    aud_res = client.get("/api/audits/AUDIT-FUSED-V2-INIT")
    assert aud_res.status_code == 200
    priors = aud_res.json().get("priorities", [])
    if priors:
        p_id = priors[0]["id"]
        b_res = client.get(f"/api/priorities/{p_id}/brief")
        assert b_res.status_code == 200
        bdata = b_res.json()
        assert "investigation_questions" in bdata
        assert "care_checklist" in bdata

        # PDF generation test
        pdf_res = client.get(f"/api/priorities/{p_id}/brief.pdf")
        assert pdf_res.status_code == 200
        assert pdf_res.headers["content-type"] == "application/pdf"
        assert pdf_res.content.startswith(b"%PDF")

def test_f6_exports_api():
    # JSON-LD export
    jld_res = client.get("/api/export/fused-v2/jsonld")
    assert jld_res.status_code == 200
    assert "application/ld+json" in jld_res.headers["content-type"]
    assert "@context" in jld_res.text

    # CSV export
    csv_res = client.get("/api/export/fused-v2/csv")
    assert csv_res.status_code == 200
    assert "Record ID" in csv_res.text

    # GeoJSON export
    geo_res = client.get("/api/export/fused-v2/geojson")
    assert geo_res.status_code == 200
    geodata = geo_res.json()
    assert geodata["type"] == "FeatureCollection"

def test_f9_health_diagnostics_api():
    h_res = client.get("/api/health")
    assert h_res.status_code == 200
    hdata = h_res.json()
    assert hdata["status"] == "healthy"
    assert "database" in hdata
    assert "layers" in hdata

    # Verify endpoint
    v_res = client.post("/api/health/verify")
    assert v_res.status_code == 200
    vdata = v_res.json()
    assert vdata["overall_status"] in ("PASSED", "WARNING")
    assert len(vdata["checks"]) >= 4

