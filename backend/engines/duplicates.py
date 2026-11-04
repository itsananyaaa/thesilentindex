"""Duplicate detection and clustering engine for cultural heritage collections.
Uses token-blocking and RapidFuzz token-set similarity.
Candidate clusters are surfaced with full provenance and match evidence;
records are NEVER merged automatically.
"""
from typing import List, Dict, Any, Tuple
from rapidfuzz import fuzz
import re

def clean_for_matching(text: str) -> str:
    if not text:
        return ""
    # Lowercase and remove punctuation
    clean = re.sub(r"[^\w\s]", " ", text.lower())
    return " ".join(clean.split())

def find_duplicate_clusters(records: List[Dict[str, Any]], similarity_threshold: float = 82.0) -> List[Dict[str, Any]]:
    """Detect candidate duplicate clusters among records.
    
    Args:
        records: list of record dictionaries
        similarity_threshold: RapidFuzz token_set_ratio threshold (0-100)
        
    Returns:
        List of duplicate cluster dicts:
        [{
            "cluster_id": str,
            "similarity": float,
            "matched_fields": List[str],
            "record_ids": List[str],
            "records": List[Dict]
        }]
    """
    clusters = []
    seen_in_cluster = set()

    n = len(records)
    cluster_idx = 1

    for i in range(n):
        r1 = records[i]
        id1 = str(r1.get("id") or r1.get("record_id"))
        if id1 in seen_in_cluster:
            continue

        title1 = clean_for_matching(r1.get("title", ""))
        creator1 = clean_for_matching(r1.get("creator") or r1.get("maker_name", ""))
        period1 = clean_for_matching(r1.get("period_text") or r1.get("period_date", ""))

        current_cluster_ids = [id1]
        cluster_records = [r1]
        highest_similarity = 0.0
        matching_fields = set()

        for j in range(i + 1, n):
            r2 = records[j]
            id2 = str(r2.get("id") or r2.get("record_id"))
            if id2 in seen_in_cluster:
                continue

            title2 = clean_for_matching(r2.get("title", ""))
            creator2 = clean_for_matching(r2.get("creator") or r2.get("maker_name", ""))
            period2 = clean_for_matching(r2.get("period_text") or r2.get("period_date", ""))

            # 1. Title token set similarity
            sim_title = fuzz.token_set_ratio(title1, title2)
            
            # 2. Creator similarity
            sim_creator = fuzz.ratio(creator1, creator2) if creator1 and creator2 else 50.0

            # 3. Accession ID exact match check
            acc1 = str(r1.get("accession_id") or "").strip()
            acc2 = str(r2.get("accession_id") or "").strip()
            acc_match = bool(acc1 and acc2 and acc1.lower() == acc2.lower())

            # Combined match condition
            is_match = False
            combined_sim = sim_title
            
            if acc_match:
                is_match = True
                combined_sim = 99.0
                matching_fields.add("accession_id")
            elif sim_title >= similarity_threshold:
                if (creator1 and creator2 and sim_creator >= 70.0) or (period1 and period2 and period1 == period2) or sim_title >= 92.0:
                    is_match = True
                    matching_fields.add("title")
                    if sim_creator >= 70.0:
                        matching_fields.add("creator")
                    if period1 == period2 and period1:
                        matching_fields.add("period")

            if is_match:
                current_cluster_ids.append(id2)
                cluster_records.append(r2)
                seen_in_cluster.add(id2)
                if combined_sim > highest_similarity:
                    highest_similarity = combined_sim

        if len(current_cluster_ids) > 1:
            seen_in_cluster.add(id1)
            clusters.append({
                "cluster_id": f"DUP-CLUST-{cluster_idx:03d}",
                "similarity": round(highest_similarity, 1),
                "matched_fields": sorted(list(matching_fields)) or ["title"],
                "record_ids": current_cluster_ids,
                "records": [
                    {
                        "id": str(r.get("id") or r.get("record_id")),
                        "title": r.get("title"),
                        "art_form": r.get("art_form"),
                        "category": r.get("category_id") or r.get("category"),
                        "state": r.get("state"),
                        "source_institution": r.get("source_institution"),
                        "accession_id": r.get("accession_id")
                    }
                    for r in cluster_records
                ]
            })
            cluster_idx += 1

    return clusters

