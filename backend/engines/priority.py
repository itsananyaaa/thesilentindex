"""Preservation Priority Engine for THE SILENCE INDEX.
Transforms metadata gaps into transparent, consent-aware documentation priorities.
Formulas:
- G (gap magnitude) = slice debt on that dimension
- E (evidence confidence) = function of slice size, assessability, classification confidence
- B (breadth) = share of the collection affected
- F (feasibility) = presence of leads (URLs, institutions) vs desk vs fieldwork
Priority = 100 * (0.40*G + 0.25*E + 0.20*B + 0.15*F)
Bands: High / Medium / Lower investigation priority (NEVER "importance").
Consent gating: none | recommended | required.
"""
from typing import List, Dict, Any, Optional

DEFAULT_PRIORITY_WEIGHTS = {
    "g": 0.40,
    "e": 0.25,
    "b": 0.20,
    "f": 0.15
}

DIMENSION_NAMES = {
    "visual_documentation": "Visual Documentation",
    "historical_context": "Historical Context",
    "original_language": "Original-Language Documentation",
    "geographic_provenance": "Geographic Provenance",
    "materials_and_techniques": "Materials & Techniques",
    "practitioner_perspective": "Practitioner or Artisan Perspective",
    "oral_histories": "Oral Histories & Associated Narratives",
    "source_attribution": "Source Attribution & Provenance",
    "community_validation": "Community Validation",
    "preservation_accessibility": "Preservation & Accessibility Information"
}

CONSENT_REQUIRED_DIMENSIONS = {
    "practitioner_perspective",
    "oral_histories",
    "community_validation"
}

def compute_preservation_priorities(
    collection_records: List[Dict[str, Any]],
    record_evaluations: List[Dict[str, Dict[str, Any]]],
    weights: Optional[Dict[str, float]] = None
) -> List[Dict[str, Any]]:
    """Generate ranked preservation priority recommendations across slices and dimensions."""
    w = {**DEFAULT_PRIORITY_WEIGHTS, **(weights or {})}
    w_g, w_e, w_b, w_f = w.get("g", 0.40), w.get("e", 0.25), w.get("b", 0.20), w.get("f", 0.15)
    
    total_records = len(collection_records)
    if total_records == 0:
        return []

    # Group records by category and by state
    slices = []
    
    # Collection-wide dimension slices
    for dim_id in DIMENSION_NAMES:
        slices.append({
            "type": "collection",
            "name": "Collection-Wide",
            "dimension": dim_id,
            "filter_key": None,
            "filter_val": None
        })

    # Category slices
    categories = sorted(list({r.get("category_id") or r.get("category") for r in collection_records if r.get("category_id") or r.get("category")}))
    for cat in categories:
        for dim_id in DIMENSION_NAMES:
            slices.append({
                "type": "category",
                "name": f"Category: {cat.replace('_', ' ').title()}",
                "dimension": dim_id,
                "filter_key": "category",
                "filter_val": cat
            })

    # State slices
    states = sorted(list({r.get("state") for r in collection_records if r.get("state")}))
    for st in states:
        for dim_id in ["practitioner_perspective", "oral_histories", "materials_and_techniques", "original_language"]:
            slices.append({
                "type": "state",
                "name": f"Region: {st}",
                "dimension": dim_id,
                "filter_key": "state",
                "filter_val": st
            })

    priorities = []
    priority_idx = 1

    for s in slices:
        dim_id = s["dimension"]
        dim_name = DIMENSION_NAMES.get(dim_id, dim_id)

        # Filter records for slice
        matching_indices = []
        for idx, r in enumerate(collection_records):
            if s["type"] == "collection":
                matching_indices.append(idx)
            elif s["type"] == "category" and (r.get("category_id") == s["filter_val"] or r.get("category") == s["filter_val"]):
                matching_indices.append(idx)
            elif s["type"] == "state" and r.get("state") == s["filter_val"]:
                matching_indices.append(idx)

        slice_count = len(matching_indices)
        # Skip slices below statistical threshold (< 5 records)
        if slice_count < 5:
            continue

        # Compute dimension debt in this slice
        scores = []
        has_leads_count = 0
        has_sensitive_count = 0
        matching_rec_ids = []

        for idx in matching_indices:
            rec = collection_records[idx]
            rec_id = str(rec.get("id") or rec.get("record_id"))
            matching_rec_ids.append(rec_id)
            ev = record_evaluations[idx].get(dim_id, {})
            if ev.get("applicable", True) and ev.get("assessable", True):
                scores.append(ev.get("score", 0.0))
            if rec.get("source_url") or rec.get("source_institution"):
                has_leads_count += 1
            if "sacred" in str(rec).lower() or "ritual" in str(rec).lower() or "tribal" in str(rec).lower():
                has_sensitive_count += 1

        if not scores:
            continue

        mean_score = sum(scores) / len(scores)
        gap_magnitude = round(1.0 - mean_score, 3)

        # Only generate priorities where there is a notable gap (debt >= 0.35)
        if gap_magnitude < 0.35:
            continue

        # E: evidence confidence = function of slice size and sample stability
        evidence_conf = round(min(1.0, 0.4 + (slice_count / 100.0)), 3)

        # B: breadth = share of the collection affected
        breadth = round(slice_count / float(total_records), 3)

        # F: feasibility = presence of leads (URLs, institutions) vs fieldwork
        leads_ratio = has_leads_count / float(slice_count) if slice_count > 0 else 0.0
        # Fieldwork dimensions (oral histories, practitioner) are harder but high impact
        is_fieldwork = dim_id in ("oral_histories", "practitioner_perspective", "community_validation")
        feasibility = round(0.5 * leads_ratio + (0.3 if not is_fieldwork else 0.15), 3)

        # Priority formula
        raw_score = 100.0 * (w_g * gap_magnitude + w_e * evidence_conf + w_b * breadth + w_f * feasibility)
        score = round(min(100.0, max(0.0, raw_score)), 1)

        # Priority bands (NEVER "importance")
        if score >= 65.0:
            band = "High investigation priority"
        elif score >= 42.0:
            band = "Medium investigation priority"
        else:
            band = "Lower investigation priority"

        # Consent gating
        is_consent_required = (dim_id in CONSENT_REQUIRED_DIMENSIONS) or (has_sensitive_count > 0)
        consultation = "required" if is_consent_required else ("recommended" if dim_id == "original_language" else "none")

        # Next step wording
        if consultation == "required":
            next_step = f"Consult relevant {s['name']} community elders or practitioner custodians before initiating documentation protocols."
        elif dim_id == "original_language":
            next_step = f"Partner with regional linguistic scholars to transcribe and catalogue original Indic script titles and oral vernacular terms."
        elif dim_id == "materials_and_techniques":
            next_step = f"Conduct physical condition and materials analysis on {slice_count} records to document traditional pigments, alloys, and weave structures."
        elif dim_id == "geographic_provenance":
            next_step = f"Cross-reference archival registers to resolve district, workshop, or temple coordinates for {slice_count} records."
        else:
            next_step = f"Investigate source museum archives to supplement missing {dim_name.lower()} metadata."

        reasons = [
            f"Documentation gap of {round(gap_magnitude*100, 1)}% detected across {slice_count} records in {s['name']}.",
            f"Evidence confidence is {round(evidence_conf*100)}% based on {slice_count} evaluated holdings.",
            f"Affects {round(breadth*100, 1)}% of total collection holdings.",
            "Living heritage and practitioner dimensions require explicit community permission." if is_consent_required else "Desk-based and archival verification recommended."
        ]

        priorities.append({
            "id": f"PRIORITY-{priority_idx:03d}",
            "slice": {
                "type": s["type"],
                "name": s["name"],
                "filter_key": s["filter_key"],
                "filter_val": s["filter_val"],
                "record_count": slice_count
            },
            "dimension": dim_id,
            "dimension_name": dim_name,
            "g": gap_magnitude,
            "e": evidence_conf,
            "b": breadth,
            "f": feasibility,
            "score": score,
            "band": band,
            "consultation": consultation,
            "next_step": next_step,
            "reasons": reasons,
            "record_ids": matching_rec_ids
        })
        priority_idx += 1

    # Sort descending by priority score
    priorities.sort(key=lambda x: x["score"], reverse=True)
    return priorities

