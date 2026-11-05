"""Pure-Python Unicode script block detection and Indic language heuristics.
Zero external language-detection dependencies.
Detects:
- Devanagari (Hindi, Sanskrit, Marathi, Nepali, Maithili, Bhojpuri, Rajasthani)
- Bengali / Assamese
- Gurmukhi (Punjabi)
- Gujarati
- Odia
- Tamil
- Telugu
- Kannada
- Malayalam
- Perso-Arabic (Urdu, Kashmiri, Sindhi)
- Tibetan (Ladakhi, Sikkimese)
- Sharada / Grantha historical scripts
- Latin (English or Transliteration)
"""
import re
from typing import Any

SCRIPT_RANGES = {
    "Devanagari": (0x0900, 0x097F),
    "Bengali": (0x0980, 0x09FF),
    "Gurmukhi": (0x0A00, 0x0A7F),
    "Gujarati": (0x0A80, 0x0AFF),
    "Odia": (0x0B00, 0x0B7F),
    "Tamil": (0x0B80, 0x0BFF),
    "Telugu": (0x0C00, 0x0C7F),
    "Kannada": (0x0C80, 0x0CFF),
    "Malayalam": (0x0D00, 0x0D7F),
    "Perso-Arabic": (0x0600, 0x06FF),
    "Arabic-Extended": (0x0750, 0x077F),
    "Tibetan": (0x0F00, 0x0FFF),
    "Grantha": (0x11300, 0x1137F),
    "Sharada": (0x11180, 0x111DF),
}

# Common transliteration diacritics in IAST / ISO 15919
INDIC_DIACRITICS_REGEX = re.compile(r"[āīūṛṝḷḹēōṃḥṅñṇṭḍśṣźž]", re.IGNORECASE)

def detect_unicode_scripts(text: str) -> dict[str, int]:
    """Count characters per Unicode script block in the given text."""
    if not text:
        return {}
    
    counts: dict[str, int] = {}
    for char in text:
        cp = ord(char)
        matched = False
        for script, (start, end) in SCRIPT_RANGES.items():
            if start <= cp <= end:
                counts[script] = counts.get(script, 0) + 1
                matched = True
                break
        if not matched and ('A' <= char <= 'Z' or 'a' <= char <= 'z'):
            counts["Latin"] = counts.get("Latin", 0) + 1
            
    return counts

def analyze_indic_text(text: str) -> dict[str, Any]:
    """Analyze text for Indic scripts or Latin transliteration.
    
    Returns:
        {
            "has_indic_script": bool,
            "detected_scripts": List[str],
            "is_transliterated": bool,
            "indic_char_count": int,
            "heuristic_score": float (0.0 to 1.0)
        }
    """
    if not text or not text.strip():
        return {
            "has_indic_script": False,
            "detected_scripts": [],
            "is_transliterated": False,
            "indic_char_count": 0,
            "heuristic_score": 0.0
        }

    script_counts = detect_unicode_scripts(text)
    indic_scripts = [s for s in script_counts if s not in ("Latin", "Common")]
    indic_chars = sum(script_counts[s] for s in indic_scripts)
    
    has_indic = indic_chars > 0
    has_diacritics = bool(INDIC_DIACRITICS_REGEX.search(text))

    if has_indic:
        score = 1.0
    elif has_diacritics:
        score = 0.5 # Possible transliterated Indic
    else:
        score = 0.0 # Monolingual Latin / English only

    return {
        "has_indic_script": has_indic,
        "detected_scripts": indic_scripts,
        "is_transliterated": has_diacritics,
        "indic_char_count": indic_chars,
        "heuristic_score": score
    }

