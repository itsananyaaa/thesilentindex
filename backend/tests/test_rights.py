from backend.engines.rights import RightsCategory, normalise_rights


def test_cc0_normalization():
    cat, allowed, exp = normalise_rights("CC0 1.0 Universal Public Domain Dedication")
    assert cat == RightsCategory.CC0
    assert allowed is True

def test_pdm_normalization():
    cat, allowed, exp = normalise_rights("Public Domain (PD-old-100)")
    assert cat == RightsCategory.PDM
    assert allowed is True

def test_cc_by_normalization():
    cat, allowed, exp = normalise_rights("Creative Commons Attribution 4.0 International (CC BY 4.0)")
    assert cat == RightsCategory.CC_BY
    assert allowed is True

def test_cc_by_sa_normalization():
    cat, allowed, exp = normalise_rights("CC-BY-SA-3.0")
    assert cat == RightsCategory.CC_BY_SA
    assert allowed is True

def test_cc_nc_download_disallowed():
    cat, allowed, exp = normalise_rights("CC BY-NC 4.0")
    assert cat == RightsCategory.CC_BY_NC
    assert allowed is False

def test_in_copyright_disallowed():
    cat, allowed, exp = normalise_rights("All Rights Reserved © 2024 National Museum")
    assert cat == RightsCategory.IN_COPYRIGHT
    assert allowed is False

def test_unknown_empty():
    cat, allowed, exp = normalise_rights("")
    assert cat == RightsCategory.UNKNOWN
    assert allowed is False
    cat2, allowed2, exp2 = normalise_rights(None)
    assert cat2 == RightsCategory.UNKNOWN
    assert allowed2 is False

def test_multi_licensed_needs_review():
    cat, allowed, exp = normalise_rights("CC BY-SA 4.0", raw_payload={"multi_licensed": True})
    assert cat == RightsCategory.NEEDS_REVIEW
    assert allowed is False

