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

### 2.7 Multi-Source Harvesting & Offline Determinism
- While the platform includes automated adapters for live harvesting (`scripts/harvest/`) across GI Registry, UNESCO, Wikidata, Wikimedia Commons, and Museum APIs, production and hackathon demonstrations rely on an offline frozen seed dataset (`data/seed/records_fused.jsonl`). This protects against upstream API rate limits, schema deprecations, or network failures.

### 2.8 Subcontinental Floor & Sparse Coverage Badging
- All 36 States and Union Territories of India are actively represented in the fused dataset. However, because the system strictly adheres to Non-Negotiable Rule 3 (*No invented data*), small island territories (e.g., Lakshadweep) and newly demarcated union territories (e.g., Ladakh, DNH & DD) possess sparse open-access records in upstream registries. The platform badges these areas with honest `Sparse` coverage indicators rather than populating them with synthetic or hallucinated artifacts.

### 2.9 Multi-State Heritage Entities Accounting
- Traditional knowledge systems, geographical indications, and living folklore frequently transcend state borders (e.g., Basmati rice cultivation spanning 7 states, Phulkari embroidery across Punjab, Haryana, and Rajasthan, or Chhau dance across West Bengal, Jharkhand, and Odisha).
- In accordance with our double-entry attribution model, multi-state cultural records are stored exactly once in the canonical `records` catalog (preserving unique collection totals) and mapped to each participating territory in `state_attributions` with a `multi_state=True` flag. Curators must distinguish between unique physical objects and regional heritage attributions.

