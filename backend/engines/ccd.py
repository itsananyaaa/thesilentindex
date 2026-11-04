"""Cultural Coverage Debt (CCD) computation engine.
Computes collection-level and slice-level coverage, debt, assessability,
sensitivity strips, and reproducible bootstrap 90% confidence intervals.
"""
from typing import Dict, Any, List, Optional, Tuple
import numpy as np

DEFAULT_WEIGHTS = {
    "visual_documentation": 1.0,
    "historical_context": 1.0,
    "original_language": 1.0,
    "geographic_provenance": 1.0,
    "materials_and_techniques": 1.0,
    "practitioner_perspective": 1.0,
    "oral_histories": 1.0,
    "source_attribution": 1.0,
    "community_validation": 1.0,
    "preservation_accessibility": 1.0
}

def compute_collection_ccd(
    record_dimension_evaluations: List[Dict[str, Dict[str, Any]]],
    weights: Optional[Dict[str, float]] = None,
    seed: int = 42,
    num_bootstrap: int = 1000
) -> Dict[str, Any]:
    """Compute collection-wide Cultural Coverage Debt (CCD) and bootstrap confidence interval.
    
    Args:
        record_dimension_evaluations: List of dicts, each mapping dim_id -> {score, status, applicable, assessable}
        weights: Optional dict of dimension weights
        seed: Random seed for bootstrap reproducibility
        num_bootstrap: Number of bootstrap resamples (default 1000)
        
    Returns:
        {
            "ccd": float (0-100),
            "ccd_interval": [float, float] (90% CI),
            "assessability": str, # e.g. "9 of 10 dimensions assessable"
            "assessable_dimensions_count": int,
            "applicable_dimensions_count": int,
            "dimension_coverage": Dict[str, float],
            "dimension_debt": Dict[str, float],
            "sensitivity_strip": Dict[str, float], # CCD if dimension weight is doubled
            "total_records": int
        }
    """
    total_records = len(record_dimension_evaluations)
    if total_records < 5:
        return {
            "ccd": None,
            "ccd_interval": [None, None],
            "assessability": "Insufficient evidence (< 5 records)",
            "assessable_dimensions_count": 0,
            "applicable_dimensions_count": 0,
            "dimension_coverage": {},
            "dimension_debt": {},
            "sensitivity_strip": {},
            "total_records": total_records,
            "insufficient_evidence": True
        }

    w_dict = {**DEFAULT_WEIGHTS, **(weights or {})}
    all_dims = list(DEFAULT_WEIGHTS.keys())

    # Assessability check per dimension across the collection
    dim_assessable = {}
    dim_scores_matrix = {d: [] for d in all_dims}

    for rec_eval in record_dimension_evaluations:
        for d in all_dims:
            ev = rec_eval.get(d, {})
            if ev.get("applicable", True) and ev.get("assessable", False):
                dim_assessable[d] = True
                dim_scores_matrix[d].append(ev.get("score", 0.0))

    assessable_dims = [d for d in all_dims if dim_assessable.get(d, False) and len(dim_scores_matrix[d]) > 0]
    assessability_str = f"{len(assessable_dims)} of {len(all_dims)} dimensions assessable"

    if not assessable_dims:
        return {
            "ccd": None,
            "ccd_interval": [None, None],
            "assessability": "0 of 10 dimensions assessable (no mapped columns)",
            "assessable_dimensions_count": 0,
            "applicable_dimensions_count": 10,
            "dimension_coverage": {},
            "dimension_debt": {},
            "sensitivity_strip": {},
            "total_records": total_records,
            "insufficient_evidence": True
        }

    # Mean coverage C_d and Debt_d
    dim_coverage = {}
    dim_debt = {}
    for d in assessable_dims:
        c_d = float(np.mean(dim_scores_matrix[d]))
        dim_coverage[d] = round(c_d, 4)
        dim_debt[d] = round(1.0 - c_d, 4)

    # Core CCD formula: 100 * sum(w_d * Debt_d) / sum(w_d)
    def calc_weighted_ccd(debts: Dict[str, float], w_map: Dict[str, float]) -> float:
        num = sum(w_map.get(d, 1.0) * debts[d] for d in assessable_dims)
        denom = sum(w_map.get(d, 1.0) for d in assessable_dims)
        return (100.0 * num / denom) if denom > 0 else 0.0

    core_ccd = round(calc_weighted_ccd(dim_debt, w_dict), 2)

    # Sensitivity strip: impact on CCD if each dimension's weight is doubled (+1.0)
    sensitivity_strip = {}
    for d in assessable_dims:
        modified_w = dict(w_dict)
        modified_w[d] = modified_w.get(d, 1.0) * 2.0
        new_ccd = round(calc_weighted_ccd(dim_debt, modified_w), 2)
        sensitivity_strip[d] = round(new_ccd - core_ccd, 2)

    # Bootstrap 90% confidence interval (1,000 resamples, seeded)
    rng = np.random.default_rng(seed)
    n = len(record_dimension_evaluations)
    bootstrap_ccds = []

    for _ in range(num_bootstrap):
        sample_indices = rng.choice(n, size=n, replace=True)
        sample_dim_scores = {d: [] for d in assessable_dims}
        for idx in sample_indices:
            rec_eval = record_dimension_evaluations[idx]
            for d in assessable_dims:
                ev = rec_eval.get(d, {})
                if ev.get("applicable", True) and ev.get("assessable", False):
                    sample_dim_scores[d].append(ev.get("score", 0.0))
        
        sample_debts = {}
        for d in assessable_dims:
            s_scores = sample_dim_scores[d]
            c_d = float(np.mean(s_scores)) if s_scores else 0.0
            sample_debts[d] = 1.0 - c_d

        b_ccd = calc_weighted_ccd(sample_debts, w_dict)
        bootstrap_ccds.append(b_ccd)

    ci_low = float(round(np.percentile(bootstrap_ccds, 5), 2))
    ci_high = float(round(np.percentile(bootstrap_ccds, 95), 2))

    return {
        "ccd": core_ccd,
        "ccd_interval": [ci_low, ci_high],
        "assessability": assessability_str,
        "assessable_dimensions_count": len(assessable_dims),
        "applicable_dimensions_count": len(all_dims),
        "dimension_coverage": dim_coverage,
        "dimension_debt": dim_debt,
        "sensitivity_strip": sensitivity_strip,
        "total_records": total_records,
        "insufficient_evidence": False
    }

def compute_slice_ccd(
    slice_records: List[Dict[str, Dict[str, Any]]],
    weights: Optional[Dict[str, float]] = None
) -> Dict[str, Any]:
    """Compute CCD for a specific slice (e.g. state, category, or language).
    If slice has fewer than 5 records, returns 'insufficient evidence' as strictly required.
    """
    total = len(slice_records)
    if total < 5:
        return {
            "ccd": None,
            "status": "insufficient evidence",
            "message": f"Slice has {total} records (< 5 required for statistical validity).",
            "total_records": total,
            "insufficient_evidence": True
        }

    res = compute_collection_ccd(slice_records, weights=weights, num_bootstrap=200)
    res["insufficient_evidence"] = False
    return res

