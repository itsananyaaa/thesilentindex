"""Test Multi-State GI and Intangible Heritage Attribution.
Verifies that:
1. Records with multi-state provenance count ONCE in collection record totals.
2. Records count ONCE PER STATE in state aggregations.
3. Both single-state and multi-state totals are tracked honestly with multi_state flag.
"""
from backend.app.db import SessionLocal
from backend.app.models import Record, StateAttribution, Collection
from scripts.harvest.gi_registry import GiRegistryAdapter
from scripts.harvest.unesco_ich import UnescoIchAdapter

def test_multi_state_gi_adapter_attributions():
    adapter = GiRegistryAdapter()
    
    # Basmati Rice spans multiple states
    basmati_raw = next(i for i in adapter.discover() if i["name"] == "Basmati Rice")
    attrs = adapter.state_attribution(basmati_raw)
    
    # Should attribute to PB, HR, DL, HP, UT, UP, JK
    state_codes = [a[0] for a in attrs]
    assert "PB" in state_codes
    assert "HR" in state_codes
    assert "UP" in state_codes
    assert all(a[3] is True for a in attrs) # all multi_state=True

    # Single-state GI (e.g. Blue Pottery of Jaipur)
    jaipur_raw = next(i for i in adapter.discover() if "Blue Pottery" in i["name"])
    j_attrs = adapter.state_attribution(jaipur_raw)
    assert len(j_attrs) == 1
    assert j_attrs[0][0] == "RJ"
    assert j_attrs[0][3] is False # multi_state=False

def test_unesco_multi_state_attributions():
    adapter = UnescoIchAdapter()
    chhau = next(i for i in adapter.discover() if "Chhau" in i["title"])
    attrs = adapter.state_attribution(chhau)
    codes = [a[0] for a in attrs]
    assert "JH" in codes
    assert "OR" in codes
    assert "WB" in codes
    assert all(a[3] is True for a in attrs)

def test_db_fused_collection_counts():
    db = SessionLocal()
    try:
        col = db.query(Collection).filter(Collection.id == "fused-v2").first()
        assert col is not None
        
        # Unique record count
        rec_count = db.query(Record).filter(Record.collection_id == "fused-v2").count()
        assert rec_count > 250
        
        # State attribution count is strictly greater than unique records because of multi-state splitting
        attr_count = db.query(StateAttribution).count()
        assert attr_count > rec_count
    finally:
        db.close()

