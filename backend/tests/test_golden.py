import csv
import json
import hashlib
import pytest
from backend.engines.coverage import CoverageEngine
from backend.engines.ccd import compute_collection_ccd, compute_slice_ccd
from backend.engines.duplicates import find_duplicate_clusters
from backend.engines.rights import normalise_rights, RightsCategory

def test_golden_tiny_collection():
    """Verify that engine output on tiny_collection.csv matches tiny_collection.expected.json."""
    with open("data/fixtures/tiny_collection.csv", "r", encoding="utf-8") as f:
        csv_text = f.read()
        f.seek(0)
        rows = list(csv.DictReader(f))

    # Invariant: Original values hash before and after
    hash_before = hashlib.sha256(csv_text.encode("utf-8")).hexdigest()

    with open("data/fixtures/tiny_collection.expected.json", "r", encoding="utf-8") as f:
        expected = json.load(f)

    headers = set(rows[0].keys())
    engine = CoverageEngine()

    actual_evals = []
    for r in rows:
        cat = r.get("category")
        res = engine.evaluate_record(r, mapped_canonical_fields=headers, category_id=cat)
        actual_evals.append({
            "record_id": r.get("record_id"),
            "dimensions": res
        })

    eval_dicts = [ae["dimensions"] for ae in actual_evals]
    ccd_res = compute_collection_ccd(eval_dicts, seed=42)
    dup_res = find_duplicate_clusters(rows)

    # Invariant check: original text unchanged
    hash_after = hashlib.sha256(csv_text.encode("utf-8")).hexdigest()
    assert hash_before == hash_after

    # Check CCD match
    assert abs(ccd_res["ccd"] - expected["ccd"]) < 0.01
    assert ccd_res["assessability"] == expected["assessability"]
    assert ccd_res["assessable_dimensions_count"] == expected["assessable_dimensions_count"]
    
    # Check bootstrap interval within 1.0 tolerance
    assert abs(ccd_res["ccd_interval"][0] - expected["ccd_interval"][0]) < 1.0
    assert abs(ccd_res["ccd_interval"][1] - expected["ccd_interval"][1]) < 1.0

    # Check duplicate cluster count
    assert len(dup_res) == expected["duplicate_clusters_count"]

    # Verify per-record evaluation match
    for idx, exp_rec in enumerate(expected["record_evaluations"]):
        act_rec = actual_evals[idx]
        assert act_rec["record_id"] == exp_rec["record_id"]
        for dim, dim_data in exp_rec["dimensions"].items():
            act_dim_data = act_rec["dimensions"][dim]
            assert act_dim_data["status"] == dim_data["status"], f"Mismatch on {act_rec['record_id']} dim {dim}"
            assert abs(act_dim_data["score"] - dim_data["score"]) < 0.01

def test_missing_column_yields_not_assessable():
    """Invariant: A missing column in the dataset schema must yield 'Not assessable', never 'Undocumented in collection'."""
    engine = CoverageEngine()
    # Provide record without community validation or oral narrative columns mapped
    incomplete_headers = {"title", "state", "period_date"}
    sample_rec = {
        "title": "Ancient Temple Chariot",
        "state": "Tamil Nadu",
        "period_date": "16th Century"
    }
    res = engine.evaluate_record(sample_rec, mapped_canonical_fields=incomplete_headers, category_id="visual_arts")
    
    assert res["community_validation"]["status"] == "Not assessable"
    assert res["community_validation"]["assessable"] is False
    assert res["oral_histories"]["status"] == "Not assessable"
    assert res["oral_histories"]["assessable"] is False

def test_slice_under_5_records_returns_insufficient_evidence():
    """Invariant: Slices with fewer than 5 records must show 'insufficient evidence' instead of a score."""
    engine = CoverageEngine()
    records = [
        {"title": f"Item {i}", "state": "Sikkim", "category": "visual_arts"}
        for i in range(4) # 4 records (< 5)
    ]
    evals = [
        engine.evaluate_record(r, mapped_canonical_fields={"title", "state", "category"})
        for r in records
    ]
    slice_res = compute_slice_ccd(evals)
    assert slice_res["insufficient_evidence"] is True
    assert slice_res["ccd"] is None
    assert "insufficient evidence" in slice_res["status"].lower()

def test_download_allowed_invariant():
    """Invariant: download_allowed is false for every non-reusable or unknown rights value."""
    disallowed_declarations = [
        "In Copyright / All Rights Reserved",
        "CC BY-NC 4.0",
        "CC BY-ND 3.0",
        "CC BY-NC-SA 4.0",
        "Unknown",
        "",
        None,
        "Proprietary archive copy"
    ]
    for decl in disallowed_declarations:
        cat, allowed, _ = normalise_rights(decl)
        assert allowed is False, f"download_allowed was True for '{decl}'"

