# THE SILENCE INDEX — System Boundaries & Limitations

In accordance with ethical digital humanities practices and hackathon integrity rules, this document records the known limitations, operational boundaries, and methodological caveats of **THE SILENCE INDEX**.

---

## 1. Epistemic & Cultural Boundaries

### 1.1 Metadata Silence vs. Cultural Reality
- **The Core Law:** The absence of a record or descriptive field within a collection is **never** evidence that a culture, community, or region lacks heritage.
- A high Cultural Coverage Debt (CCD) indicates institutional cataloguing neglect, historical extraction, or metadata omission — never cultural deficit.
- Slices with low record counts reflect collection bias, not geographical or historical insignificance.

### 1.2 Community Consent & Traditional Knowledge
- The Silence Index is an auditing tool for cataloguers and researchers; it **does not speak for any community**.
- Traditional Knowledge (TK) and Biocultural Labels can only be established and assigned by legitimate cultural custodians, elders, or community representatives. The software never auto-assigns TK labels.
- Prescriptive recommendations involving sacred objects, ritual practices, and living traditions carry a mandatory **"Consultation Required"** flag.

---

## 2. Technical & Algorithmic Limitations

### 2.1 Language Script Detection is Heuristic
- The `original_language` dimension identifies Indic scripts (Devanagari, Tamil, Bengali, Telugu, Kannada, Malayalam, Odia, Gurmukhi, Gujarati, Perso-Arabic) using deterministic Unicode block ranges.
- **Limitations:**
  - Presence of Indic script does not guarantee linguistic or semantic accuracy (e.g., modern English transliterated into Devanagari is scored as Indic script).
  - Dialects and oral languages without formal writing systems (e.g., Gondi, Kurukh, Bhili oral traditions) cannot be identified by Unicode script matching alone.
  - Transliterated romanized Indic terms (e.g., IAST or Hunterian system) receive partial score (0.50), which relies on keyword dictionary heuristics.

### 2.2 Cartographic Representation & Administrative Borders
- The Blind-Spot Choropleth Map uses simplified GeoJSON polygons based on standard Indian administrative state boundaries.
- **Cartographic Disclaimer:** The boundaries, names, and designations used on the map do not imply official endorsement or acceptance by the platform authors. The map is designed purely as an analytical tool for visualizing metadata concentration across cultural zones.
- Island territories and union territories with very small polygon areas may require table-view fallback for inspection.

### 2.3 Rights Classification
- Rights statuses (`CC0`, `PDM`, `CC_BY`, `CC_BY_SA`, `IN_COPYRIGHT`, `UNKNOWN`) are parsed directly from provider-declared metadata strings.
- The system **does not conduct independent legal chain-of-title verifications**.
- In accordance with non-negotiable rule 6, only assets declared under explicit open-access licences permit binary download; all other media are restricted to in-browser viewing or external link-outs.

### 2.4 Duplicate Detection Heuristics
- The duplicate detection engine clusters records based on title token-set ratio ($\ge 85\%$) combined with year and medium matching.
- **Limitations:**
  - High similarity between titles such as *"Vishnu Sculpture, 11th Century"* and *"Vishnu Sculpture, 12th Century"* can generate false-positive candidate clusters that require human curatorial review.
  - The platform groups candidate duplicates for curatorial decision-making and **never deletes or collapses records automatically**.

### 2.5 Machine Learning & Generative Text Restraint
- By default, all classifications, debt scores, and priority bands are **100% deterministic**.
- Generative AI explanation is disabled by default (`LLM_EXPLAIN=0`). When enabled, it only words already-computed numerical findings, and every generated sentence is explicitly tagged with an **"AI-worded"** badge.

### 2.6 Small-Sample Suppression
- To prevent statistical distortions and unwarranted conclusions on scarce data, the platform suppresses Cultural Coverage Debt scores for any demographic or categorical slice with fewer than 5 records ($N < 5$), displaying **"Insufficient Evidence"**.

