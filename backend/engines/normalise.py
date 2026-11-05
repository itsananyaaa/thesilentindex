"""Data normalisation engine for THE SILENCE INDEX.
Normalises state authorities, dates, Unicode NFC, and splits multi-values.
Preserves original values immutably and outputs explicit field provenance records.
"""
import os
import unicodedata
from typing import Any

import yaml

STATES_PATH = os.path.join(os.path.dirname(__file__), "../../config/states.yaml")

class NormalisationEngine:
    def __init__(self, states_config_path: str = STATES_PATH):
        with open(states_config_path, "r", encoding="utf-8") as f:
            cfg = yaml.safe_load(f)
        self.states_list = cfg.get("states", [])
        
        # Build normalization lookup dict
        self.state_lookup: dict[str, dict[str, Any]] = {}
        for s in self.states_list:
            self.state_lookup[s["name"].lower()] = s
            self.state_lookup[s["code"].lower()] = s
            for alias in s.get("aliases", []):
                self.state_lookup[alias.lower()] = s

    def normalise_text(self, val: Any) -> str:
        """Strip whitespace and enforce Unicode NFC normalization."""
        if val is None:
            return ""
        s = str(val).strip()
        return unicodedata.normalize("NFC", s)

    def normalise_state(self, raw_state: str) -> tuple[str | None, str | None, dict[str, Any] | None]:
        """Normalise state name against canonical states authority.
        
        Returns:
            (canonical_name, iso_code, provenance_info)
        """
        clean = self.normalise_text(raw_state)
        if not clean:
            return None, None, None

        k = clean.lower()
        if k in self.state_lookup:
            matched = self.state_lookup[k]
            is_alias = (matched["name"].lower() != k and matched["code"].lower() != k)
            prov = {
                "origin": "NORMALISED" if is_alias else "SOURCE",
                "method": "state_authority_alias" if is_alias else "exact_state_match",
                "confidence": 1.0,
                "detail": f"Mapped '{clean}' to canonical state '{matched['name']}' ({matched['code']})."
            }
            return matched["name"], matched["code"], prov

        # Fuzzy or partial match
        for name_key, s_entry in self.state_lookup.items():
            if len(name_key) > 4 and (name_key in k or k in name_key):
                prov = {
                    "origin": "NORMALISED",
                    "method": "state_authority_partial",
                    "confidence": 0.85,
                    "detail": f"Fuzzy mapped '{clean}' to canonical state '{s_entry['name']}'."
                }
                return s_entry["name"], s_entry["code"], prov

        return clean, None, {
            "origin": "SOURCE",
            "method": "unrecognized_state",
            "confidence": 0.5,
            "detail": f"State '{clean}' could not be matched to canonical India authority table."
        }

    def detect_geographic_conflict(self, state: str | None, place: str | None) -> dict[str, Any] | None:
        """Detect contradictory geography, e.g. State: Bihar, Place: Thanjavur."""
        if not state or not place:
            return None
            
        clean_state = state.strip().lower()
        clean_place = place.strip().lower()
        
        # Check if the place is actually known to belong to another state
        if clean_place in self.state_lookup:
            other_state = self.state_lookup[clean_place]["name"].lower()
            if other_state != clean_state and clean_place != clean_state:
                return {
                    "issue": f"Geographic discrepancy: place '{place}' is associated with '{self.state_lookup[clean_place]['name']}', but record declares state '{state}'.",
                    "severity": "high",
                    "suggested_fix": f"Verify whether artifact originates from {state} or {self.state_lookup[clean_place]['name']}."
                }
                
        # Known classic cross-regional mismatches
        known_places = {
            "thanjavur": "Tamil Nadu",
            "madhubani": "Bihar",
            "bhubaneswar": "Odisha",
            "puri": "Odisha",
            "kangra": "Himachal Pradesh",
            "srikalahasti": "Andhra Pradesh",
            "hampi": "Karnataka",
            "pune": "Maharashtra",
            "kolkata": "West Bengal",
        }
        for pl, expected_st in known_places.items():
            if pl in clean_place and clean_state != expected_st.lower():
                return {
                    "issue": f"Geographic discrepancy: place '{place}' belongs to '{expected_st}', but record declares state '{state}'.",
                    "severity": "high",
                    "suggested_fix": f"Reconcile provenance between {state} and {expected_st}."
                }
                
        return None

