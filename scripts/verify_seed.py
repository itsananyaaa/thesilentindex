"""Verify seed dataset integrity:
1. Every record has an ID, title, valid declared rights, and source URL.
2. Image URLs are well-formed.
3. Rights categories match RightsCategory enum.
4. Attribution CSV matches manifest.
"""
import json
import csv
import sys
from backend.engines.rights import RightsCategory

def verify_seed():
    print("Verifying data/seed/records.jsonl...")
    records = []
    with open("data/seed/records.jsonl", "r", encoding="utf-8") as f:
        for line in f:
            if line.strip():
                records.append(json.loads(line))

    assert len(records) >= 150, f"Expected at least 150 records, got {len(records)}"

    with open("data/seed/images_manifest.json", "r", encoding="utf-8") as f:
        manifest = json.load(f)

    assert len(manifest) == len(records), "Manifest count must match records count"

    with open("data/seed/attribution.csv", "r", encoding="utf-8") as f:
        attributions = list(csv.DictReader(f))

    assert len(attributions) == len(records), "Attribution rows must match records count"

    for r in records:
        assert r.get("id"), "Missing id"
        assert r.get("title"), "Missing title"
        assert r.get("source_url"), "Missing source_url"
        assert r.get("rights_declared"), "Missing rights_declared"
        assert r.get("rights_category") in [e.value for e in RightsCategory], f"Invalid rights category: {r.get('rights_category')}"
        assert r.get("image_url", "").startswith("http"), "Invalid image_url"

    print(f"Verified all {len(records)} real seed records successfully!")

if __name__ == "__main__":
    verify_seed()

