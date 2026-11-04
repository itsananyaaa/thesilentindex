from backend.engines.scripts_lang import analyze_indic_text, detect_unicode_scripts

def test_devanagari_detection():
    res = analyze_indic_text("मधुबनी चित्रकला (Mithila Painting)")
    assert res["has_indic_script"] is True
    assert "Devanagari" in res["detected_scripts"]
    assert res["heuristic_score"] == 1.0

def test_tamil_detection():
    res = analyze_indic_text("தஞ்சாவூர் ஓவியம்")
    assert res["has_indic_script"] is True
    assert "Tamil" in res["detected_scripts"]
    assert res["heuristic_score"] == 1.0

def test_transliteration_detection():
    res = analyze_indic_text("Śiva Naṭarāja Bronze")
    assert res["has_indic_script"] is False
    assert res["is_transliterated"] is True
    assert res["heuristic_score"] == 0.5

def test_english_only():
    res = analyze_indic_text("Painting of a temple chariot in oil on canvas")
    assert res["has_indic_script"] is False
    assert res["is_transliterated"] is False
    assert res["heuristic_score"] == 0.0

