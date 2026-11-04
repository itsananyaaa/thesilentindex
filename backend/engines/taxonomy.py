"""Taxonomy classification engine for Indian cultural heritage.
Deterministic rule-based classification using config/taxonomy.yaml.
Supports exact matching, alias lookup, sensitivity hint detection, and confidence scoring.
Anything below 0.6 confidence is flagged for review.
"""
from typing import Dict, Any, List, Optional, Tuple
import yaml
import os
import re

TAXONOMY_PATH = os.path.join(os.path.dirname(__file__), "../../config/taxonomy.yaml")

class TaxonomyEngine:
    def __init__(self, config_path: str = TAXONOMY_PATH):
        with open(config_path, "r", encoding="utf-8") as f:
            self.config = yaml.safe_load(f)
        self.categories = self.config.get("categories", {})
        self.sensitivity_keywords = self.config.get("sensitivity_keywords", [])

    def classify_record(self, record_dict: Dict[str, Any]) -> Dict[str, Any]:
        """Classify a record into one of 9 cultural categories.
        
        Returns:
            {
                "category_id": str,
                "category_name": str,
                "confidence": float,
                "method": str ("declared" | "alias_match" | "fallback"),
                "needs_review": bool,
                "evidence_text": str,
                "sensitivity_notices": List[str]
            }
        """
        # 1. Check if category is already explicitly declared and matches canonical id
        declared_cat = str(record_dict.get("category") or record_dict.get("category_id") or "").strip().lower()
        if declared_cat in self.categories:
            cat_info = self.categories[declared_cat]
            return {
                "category_id": declared_cat,
                "category_name": cat_info["name"],
                "confidence": 1.0,
                "method": "declared_canonical",
                "needs_review": False,
                "evidence_text": f"Directly matched declared category '{declared_cat}'.",
                "sensitivity_notices": self.detect_sensitivity(record_dict, declared_cat)
            }

        # 2. Textual search across title, art_form, description, materials
        text_corpus = " ".join([
            str(record_dict.get("title") or ""),
            str(record_dict.get("art_form") or ""),
            str(record_dict.get("materials") or ""),
            str(record_dict.get("technique") or ""),
            str(record_dict.get("description") or "")[:400]
        ]).lower()

        best_cat = None
        best_score = 0.0
        best_match_alias = ""

        for cat_id, cat_info in self.categories.items():
            aliases = cat_info.get("aliases", [])
            for alias in aliases:
                alias_lower = alias.lower()
                # Exact word boundary match gives higher confidence
                pattern = r"\b" + re.escape(alias_lower) + r"\b"
                if re.search(pattern, text_corpus):
                    # Longer alias match gives higher confidence
                    score = min(0.95, 0.65 + (len(alias_lower) / 40.0))
                    if score > best_score:
                        best_score = score
                        best_cat = cat_id
                        best_match_alias = alias

        if best_cat and best_score >= 0.60:
            return {
                "category_id": best_cat,
                "category_name": self.categories[best_cat]["name"],
                "confidence": round(best_score, 2),
                "method": "alias_lookup",
                "needs_review": best_score < 0.75,
                "evidence_text": f"Matched characteristic alias '{best_match_alias}'.",
                "sensitivity_notices": self.detect_sensitivity(record_dict, best_cat)
            }

        # Fallback to visual_arts or needs_review
        return {
            "category_id": best_cat or "visual_arts",
            "category_name": self.categories[best_cat]["name"] if best_cat else "Visual Arts & Paintings",
            "confidence": round(best_score, 2) if best_score > 0 else 0.40,
            "method": "fallback_inference",
            "needs_review": True,
            "evidence_text": f"Low-confidence inference from fragmentary text clues.",
            "sensitivity_notices": self.detect_sensitivity(record_dict, best_cat)
        }

    def detect_sensitivity(self, record_dict: Dict[str, Any], category_id: Optional[str]) -> List[str]:
        """Detect cultural sensitivity keywords and category-specific sensitivity hints."""
        notices = []
        full_text = " ".join([
            str(record_dict.get("title") or ""),
            str(record_dict.get("description") or ""),
            str(record_dict.get("art_form") or ""),
            str(record_dict.get("community") or "")
        ]).lower()

        for kw in self.sensitivity_keywords:
            term = kw["term"]
            if re.search(r"\b" + re.escape(term) + r"\b", full_text):
                notices.append(kw["notice"])

        if category_id and category_id in self.categories:
            cat_hint = self.categories[category_id].get("sensitivity_hint")
            if cat_hint and category_id in ("ritual_heritage", "oral_traditions"):
                notices.append(f"Category notice: {cat_hint}")

        return list(dict.fromkeys(notices)) # remove duplicates preserving order

