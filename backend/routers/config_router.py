import os
from typing import Any

import yaml
from fastapi import APIRouter

router = APIRouter(prefix="/api/config", tags=["Configuration & Authorities"])

CONFIG_DIR = os.path.join(os.path.dirname(__file__), "../../config")

def read_yaml_config(filename: str) -> dict[str, Any]:
    path = os.path.join(CONFIG_DIR, filename)
    with open(path, "r", encoding="utf-8") as f:
        return yaml.safe_load(f)

@router.get("/rubrics")
def get_rubrics():
    """Retrieve 10-dimension deterministic evaluation rubrics and scoring rules."""
    return read_yaml_config("rubrics.yaml")

@router.get("/applicability")
def get_applicability():
    """Retrieve category-dimension applicability matrix."""
    return read_yaml_config("applicability.yaml")

@router.get("/taxonomy")
def get_taxonomy():
    """Retrieve Indian cultural heritage taxonomy, categories, aliases, and sensitivity hints."""
    return read_yaml_config("taxonomy.yaml")

@router.get("/states")
def get_states():
    """Retrieve canonical India state authority and historical alias tables."""
    return read_yaml_config("states.yaml")

@router.get("/weights")
def get_weights():
    """Retrieve default Cultural Coverage Debt and Preservation Priority weighting parameters."""
    return read_yaml_config("weights.yaml")

