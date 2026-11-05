"""Explanation generator for audit findings.
Template-based plain-language explanations by default.
Optional LLM wording is strictly gated: receives ONLY already-computed numbers,
is off by default, and every LLM sentence is clearly labelled 'AI-worded'.
"""
import os
from typing import Any

LLM_EXPLAIN = os.environ.get("LLM_EXPLAIN", "0") == "1"

def explain_finding(finding_dict: dict[str, Any]) -> dict[str, str]:
    """Generate human-readable explanation and impact summary for a finding.
    
    Returns:
        {
            "summary": str,
            "origin": "DETERMINISTIC_TEMPLATE" | "AI-worded"
        }
    """
    kind = finding_dict.get("kind", "")
    title = finding_dict.get("title", "")
    evidence = finding_dict.get("evidence_json", {})

    # Deterministic templates (default)
    if kind == "geographic_conflict":
        count = evidence.get("conflicting_count", 0)
        summary = (
            f"The collection contains {count} items where the recorded regional provenance directly contradicts "
            f"established territorial boundaries (such as Thanjavur misattributed to northern jurisdictions). "
            f"This obscures local artisanal custodianship and distorts regional heritage mapping."
        )
    elif kind == "missing_source_institution":
        count = evidence.get("missing_count", 0)
        pct = evidence.get("percentage", 0)
        summary = (
            f"Approximately {pct}% ({count} records) in this holding lack institutional provenance records. "
            f"Without an attributed archive, repository, or accession manifest, the digital chain of custody cannot be verified."
        )
    elif kind == "missing_accession_id":
        count = evidence.get("missing_count", 0)
        summary = (
            f"{count} records lack an institutional accession number. In archival practice, items without unique catalog numbers "
            f"are at severe risk of duplicate cataloging, misplacement, and untracked deaccessioning."
        )
    elif kind == "duplicate_cluster":
        count = evidence.get("duplicate_count", 0)
        summary = (
            f"Identified {count} suspected duplicate records sharing identical titles, dates, or accession identifiers. "
            f"These should be cross-referenced against conservation registers before physical auditing."
        )
    else:
        summary = f"{title}. Computed directly from collection audit records."

    return {
        "summary": summary,
        "origin": "DETERMINISTIC_TEMPLATE"
    }

