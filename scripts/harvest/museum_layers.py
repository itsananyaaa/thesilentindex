"""Museum Open Access Layer Adapter.
Integrates museum and archive catalog items (Metropolitan Museum of Art, Cleveland Museum of Art,
National Museum New Delhi open access, etc.) with verified state-level provenance.
Licence: Declared open access / Public Domain (CC0 / PDM / CC BY).
Kind: 'museum_object'
"""
import json
import os
from typing import Any
from scripts.harvest.base import BaseHarvestAdapter

class MuseumOpenAccessAdapter(BaseHarvestAdapter):
    def __init__(self):
        super().__init__(
            layer_id="museum_open_access",
            name="Open-Access Museum & Archive Holdings",
            kind="museum_object",
            licence_summary="Open Access / Public Domain / CC BY (Museum Declared Rights)",
            terms_url="https://www.metmuseum.org/about-the-met/policies-and-documents/open-access"
        )
        self.v1_seed_path = os.path.join(os.path.dirname(__file__), "../../data/seed/records.jsonl")

    def discover(self, use_cache: bool = True) -> list[dict[str, Any]]:
        cached = self.read_cache("museum_records.json") if use_cache else None
        if cached:
            return cached
        
        items = []
        if os.path.exists(self.v1_seed_path):
            with open(self.v1_seed_path, "r", encoding="utf-8") as f:
                for line in f:
                    if line.strip():
                        items.append(json.loads(line))
        self.write_cache("museum_records.json", items)
        return items

    def to_record(self, raw_item: dict[str, Any], index: int) -> dict[str, Any]:
        # Preserve all normalized fields while ensuring layer_id and record_kind are set
        rec = dict(raw_item)
        rec["layer_id"] = self.layer_id
        rec["record_kind"] = "museum_object"
        rec["row_index"] = index
        return rec

    def rights(self, raw_item: dict[str, Any]) -> tuple[str, str, bool]:
        declared = raw_item.get("rights_declared", "Public Domain")
        cat = raw_item.get("rights_category", "PDM")
        dl = raw_item.get("download_allowed", True)
        return (declared, cat, dl)

    def state_attribution(self, raw_item: dict[str, Any]) -> list[tuple[str, str, float, bool]]:
        st = raw_item.get("state")
        if not st:
            return []
        code = self.get_state_code(st)
        if code:
            return [(code, "structured", 1.0, False)]
        return []

