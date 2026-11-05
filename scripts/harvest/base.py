"""Base Harvester Interface and Utilities for Multi-Source Harvest Framework.
All source adapters inherit from BaseHarvestAdapter and implement:
- discover() -> list[dict]: raw records from cache or live API
- to_record(raw: dict) -> dict: converts raw item to canonical record schema
- rights(raw: dict) -> tuple[str, str, bool]: (declared_rights, rights_category, download_allowed)
- state_attribution(raw: dict) -> list[tuple[str, str, float, bool]]: [(state_code, basis, confidence, multi_state)]
"""
from abc import ABC, abstractmethod
import json
import os
import re
from typing import Any
import yaml

USER_AGENT = "TheSilenceIndexHarvester/2.0 (Cultural Heritage Research; https://github.com/silentindex)"

class BaseHarvestAdapter(ABC):
    def __init__(self, layer_id: str, name: str, kind: str, licence_summary: str, terms_url: str = ""):
        self.layer_id = layer_id
        self.name = name
        self.kind = kind
        self.licence_summary = licence_summary
        self.terms_url = terms_url
        self.cache_dir = os.path.join(os.path.dirname(__file__), f"../../data/raw/{layer_id}")
        os.makedirs(self.cache_dir, exist_ok=True)
        
        # Load state authority table
        states_path = os.path.join(os.path.dirname(__file__), "../../config/states.yaml")
        self.state_lookup = {} # alias/name lowercase -> state object
        self.states_by_code = {} # code e.g. "IN-PB" -> state object
        if os.path.exists(states_path):
            with open(states_path, "r", encoding="utf-8") as f:
                st_data = yaml.safe_load(f) or {}
                for s in st_data.get("states", []):
                    code = s["code"] # e.g. "IN-PB"
                    clean_code = code.replace("IN-", "") # e.g. "PB"
                    self.states_by_code[clean_code] = s
                    self.states_by_code[code] = s
                    self.state_lookup[s["name"].lower()] = s
                    for alias in s.get("aliases", []):
                        self.state_lookup[alias.lower()] = s

    def resolve_state(self, name_or_alias: str) -> dict[str, Any] | None:
        """Resolve any state name or alias to canonical state dictionary."""
        if not name_or_alias:
            return None
        norm = name_or_alias.strip().lower()
        if norm in self.state_lookup:
            return self.state_lookup[norm]
        
        # Strip prefixes/suffixes
        norm = re.sub(r"\b(state of|ut of|union territory of|district|region)\b", "", norm).strip()
        if norm in self.state_lookup:
            return self.state_lookup[norm]
        return None

    def get_state_code(self, state_name: str) -> str | None:
        st = self.resolve_state(state_name)
        if st:
            return st["code"].replace("IN-", "")
        return None

    def read_cache(self, filename: str) -> Any | None:
        path = os.path.join(self.cache_dir, filename)
        if os.path.exists(path):
            with open(path, "r", encoding="utf-8") as f:
                return json.load(f)
        return None

    def write_cache(self, filename: str, data: Any):
        path = os.path.join(self.cache_dir, filename)
        with open(path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)

    @abstractmethod
    def discover(self, use_cache: bool = True) -> list[dict[str, Any]]:
        """Retrieve raw records from offline cache or source."""
        pass

    @abstractmethod
    def to_record(self, raw_item: dict[str, Any], index: int) -> dict[str, Any]:
        """Convert raw item into canonical record dictionary."""
        pass

    @abstractmethod
    def rights(self, raw_item: dict[str, Any]) -> tuple[str, str, bool]:
        """Returns (rights_declared, rights_category, download_allowed)."""
        pass

    @abstractmethod
    def state_attribution(self, raw_item: dict[str, Any]) -> list[tuple[str, str, float, bool]]:
        """Returns list of (state_code, basis, confidence, multi_state)."""
        pass
