from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_health():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "SILENCE INDEX" in data["service"]

def test_collections_list():
    response = client.get("/api/collections")
    assert response.status_code == 200
    cols = response.json()
    assert len(cols) >= 2
    ids = [c["id"] for c in cols]
    assert "sample-real-001" in ids
    assert "sample-synth-002" in ids

def test_collection_summary():
    response = client.get("/api/collections/sample-real-001/summary")
    assert response.status_code == 200
    data = response.json()
    assert data["total_records"] > 100
    assert data["latest_audit_id"] is not None
    assert data["latest_ccd"] is not None

def test_matrix_endpoint():
    response = client.get("/api/audits/AUDIT-SAMPLE-REAL-001-INIT/matrix")
    assert response.status_code == 200
    data = response.json()
    assert "grid" in data
    assert len(data["grid"]) > 0

def test_map_endpoint():
    response = client.get("/api/audits/AUDIT-SAMPLE-REAL-001-INIT/map")
    assert response.status_code == 200
    data = response.json()
    assert data["total_states"] >= 30
    assert "states" in data

def test_download_forbidden_on_non_reusable():
    # Attempt download on in-copyright image or invalid image
    response = client.get("/api/images/non-existent-img/download")
    assert response.status_code == 404

def test_config_rubrics():
    response = client.get("/api/config/rubrics")
    assert response.status_code == 200
    data = response.json()
    assert "dimensions" in data
    assert "visual_documentation" in data["dimensions"]

