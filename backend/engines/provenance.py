"""Provenance, source verification, and geographic conflict auditor.
Checks custodial completeness, institution attribution, accession IDs,
and geographic contradictions.
"""
from typing import List, Dict, Any
from backend.engines.normalise import NormalisationEngine

def audit_provenance_and_sources(records: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Scan collection records for provenance, source, and geographic integrity issues.
    
    Returns:
        List of findings dicts ready for insertion into findings table.
    """
    normalizer = NormalisationEngine()
    findings = []

    missing_source_inst = []
    missing_accession = []
    geo_conflicts = []
    monolingual_records = []

    for r in records:
        rec_id = str(r.get("id") or r.get("record_id"))
        
        # 1. Source Institution check
        inst = r.get("source_institution")
        if not inst or not str(inst).strip():
            missing_source_inst.append(rec_id)

        # 2. Accession ID check
        acc = r.get("accession_id")
        if not acc or not str(acc).strip():
            missing_accession.append(rec_id)

        # 3. Geographic conflict check
        st = r.get("state")
        pl = r.get("district_place") or r.get("place")
        conflict = normalizer.detect_geographic_conflict(st, pl)
        if conflict:
            geo_conflicts.append({
                "record_id": rec_id,
                "title": r.get("title"),
                "state": st,
                "place": pl,
                "issue": conflict["issue"]
            })

    total = len(records)

    # Surface findings if thresholds exceeded
    if geo_conflicts:
        findings.append({
            "id": "FINDING-GEO-CONFLICT",
            "kind": "geographic_conflict",
            "title": f"Contradictory Geographic Provenance in {len(geo_conflicts)} Records",
            "issue": "Records declare state-level provenance that contradicts known district or cultural geography (e.g. state declared as Bihar while place is Thanjavur).",
            "evidence_json": {
                "conflicting_count": len(geo_conflicts),
                "sample_conflicts": geo_conflicts[:5]
            },
            "why_it_matters": "Contradictory geographic metadata misattributes regional cultural custody, distorts cartographic observatory findings, and complicates community repatriation or consultation.",
            "certainty": "high",
            "suggested_action": "Review source accession documents to separate the original place of fabrication from the location of historical collection.",
            "record_ids_json": [g["record_id"] for g in geo_conflicts]
        })

    if missing_source_inst and (len(missing_source_inst) / total > 0.05):
        findings.append({
            "id": "FINDING-MISSING-INSTITUTION",
            "kind": "missing_source_institution",
            "title": f"Missing Source Institution in {len(missing_source_inst)} Records",
            "issue": f"{len(missing_source_inst)} of {total} records ({round(len(missing_source_inst)/total*100, 1)}%) lack a recorded custodial institution or collection source.",
            "evidence_json": {
                "missing_count": len(missing_source_inst),
                "percentage": round(len(missing_source_inst)/total*100, 1)
            },
            "why_it_matters": "Custodial chain-of-custody cannot be verified without institutional provenance, hindering physical access and verification.",
            "certainty": "high",
            "suggested_action": "Cross-reference accession manifests or repository ingestion records to populate source holding bodies.",
            "record_ids_json": missing_source_inst
        })

    if missing_accession and (len(missing_accession) / total > 0.10):
        findings.append({
            "id": "FINDING-MISSING-ACCESSION",
            "kind": "missing_accession_id",
            "title": f"Unassigned Accession Identifiers ({len(missing_accession)} Records)",
            "issue": f"{len(missing_accession)} records do not contain a unique institutional accession number or catalogue identifier.",
            "evidence_json": {
                "missing_count": len(missing_accession),
                "percentage": round(len(missing_accession)/total*100, 1)
            },
            "why_it_matters": "Objects without accession identifiers cannot be disambiguated in physical storage or cross-institutional loans.",
            "certainty": "medium",
            "suggested_action": "Audit museum register ledgers and assign stable accession identifiers.",
            "record_ids_json": missing_accession
        })

    return findings

