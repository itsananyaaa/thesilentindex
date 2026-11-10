# THE SILENCE INDEX — PITCH-SAFE TRUTH SHEET
> **Audience:** Hackathon Presentation, Stage Pitch & Technical Demo Rehearsal  
> **Source of Truth:** Verified SQLite database (`silence_index.db`, SHA-256: `9e435f6a94a25d872ab7b2d19feca4cdebb935fbe7ac887db12378f2f38c6d1e`), Python test suite, and API responses as of 10 November 2026.  
> **Rule:** Every figure below is provably backed by database queries and implementation code. If a figure is not on this sheet, do not say it.

---

## 1. Verified Key Numbers (Safe to Say on Stage)

| Metric | Verified Value | Where on Screen / Route | Context & Evidence |
| :--- | :---: | :--- | :--- |
| **Fused Collection Records** | **317** | `/`, `/observatory`, `/auditor`, `/compare` | `collection_id = 'fused-v2'`. Seed subcontinental collection. |
| **Open Access Baseline Records** | **181** | `/compare`, `/observatory` (Sample A), `/` (fallback) | `collection_id = 'sample-real-001'`. Real museum archive holdings across 13 states. |
| **Synthetic Benchmark Records** | **150** | `/compare` (Sample B) | `collection_id = 'sample-synth-002'`. 9-dimension test suite. |
| **Heritage Entities** | **157** | `/entities`, `/health`, `/gaps` | Clustered unique cultural traditions, monuments, crafts, and performing arts. |
| **Regional State Attributions** | **345** | `/sources`, `/sources/ledger.csv` | Cross-regional mappings across 317 records (allowing for multi-state traditions like Basmati Rice and Phulkari). |
| **Documentation Dimensions** | **10** | `/matrix`, `/method`, `/page.tsx` | Visual, Historical, Language, Geography, Materials, Practitioner, Oral Histories, Attribution, Community, Preservation. |
| **Epistemic Classification States** | **4** | `/matrix`, `/method`, `/records/[id]` | **Documented** (≥0.75), **Partial** (0.25–0.74), **Undocumented in collection** (<0.25), **Not assessable** (unmapped schema column), plus **Not applicable**. |
| **Cultural Coverage Debt (CCD)** | **29.94** | `/observatory`, `/auditor`, `/` (Fused v2) | Fused collection debt score (90% CI: [29.65, 30.20], 5 of 10 assessable dimensions). |
| **Baseline Museum CCD** | **33.93** | `/compare`, `/` (initial fallback) | Open Access museum holdings debt score (90% CI: [33.60, 34.24], 7 of 10 assessable). |
| **Statistical Bootstrap** | **1,000 resamples** | Code (`ccd.py`), `/method` | 90% confidence interval, fixed seed (`seed=42`) for 100% computational reproducibility. |
| **Suppression Threshold** | **< 5 records** | `/map`, `/priorities`, `ccd.py` | Statistical slices with fewer than 5 records display "insufficient evidence" to avoid misleading inferences. |
| **Automated Passing Tests** | **42** | `pytest` terminal run, `/health` | 42 unit and regression tests passing in < 1 second. `/health` API verified run date: 10 November 2026. |
| **Production Routes** | **19** | Full App Router (`frontend/app/`) | 19 live routes covering observatory, matrix, map, entities, gaps, priorities, atlas, auditor, health, exports. |
| **Supported Indian Languages** | **4** | Header language toggle | English, Hindi (हिंदी), Malayalam (മലയാളം), Tamil (தமிழ்) with 113 translated keys per language. |
| **Preservation Priorities Generated** | **503** | `/priorities`, `priorities` table | Dimension-by-slice recommendations ranked by $100 \times (0.40G + 0.25E + 0.20B + 0.15F)$. |
| **Active Source Layers** | **5** | `/sources`, `source_layers` table | Museum Open Access (181), GI Registry (81), Wikidata (24), Wikimedia Commons (16), UNESCO ICH (15). |
| **True Maximum Debt Reduction** | **9.38 points** | `evaluate_heritage_entity_ccd` | Highest debt reduction achieved via multi-source fusion across all 157 entities is Chhau Dance (`ENT-06980`, 34.38 → 25.0). |

---

## 2. "Do Not Say" List (Avoid on Stage)

| ❌ DO NOT SAY | Why it is Inaccurate | ✅ WHAT TO SAY INSTEAD |
| :--- | :--- | :--- |
| **"Clustering closes documentation debt by up to 42.6 points"** | The true maximum debt reduction across all 157 entities in the database is **9.38 points** (`ENT-06980` Chhau Dance). 42.6 is unsubstantiated. | "Clustering cross-institutional records with living registers closes documentation debt by **up to 9.4 points**." |
| **"100% WCAG compliance" / "Zero accessibility errors"** | No automated tool guarantees 100% WCAG; background audio attempting autoplay on landing violates WCAG 1.4.2 without manual opt-in. | "Engineered to strict accessibility standards with high-contrast oxblood/cream palettes, focus rings, and pattern fills." |
| **"All 36 states and union territories have records on the map"** | In `fused-v2`, `records.state` has 35 states; Haryana (`HR`) displays 0 on the live map and in `/api/collections/fused-v2/summary` because Haryana's 2 attributions stem from multi-state records where primary state is Punjab. | "All 36 States and UTs are accounted for in regional attributions, with 35 states catalogued in primary holdings." |
| **"108 GI, 54 ASI, 68 Wikidata, 72 museum records"** | The database `layer_id` breakdown is **81 GI, 15 UNESCO, 24 Wikidata, 16 Commons, 181 Museum OA** (Total 317). ASI is not an independent layer (it is indexed under Wikidata and Museum OA). | "Five fused sources: 81 GI Registry crafts, 15 UNESCO traditions, 24 Wikidata monuments, 16 Commons media, and 181 museum holdings." |
| **"DataCite XML and Dublin Core XML downloads"** | There are NO DataCite XML or Dublin Core XML export endpoints in backend. Dublin Core is only embedded inside the Schema.org JSON-LD graph. | "Machine-readable open data exports in **Schema.org JSON-LD (with Dublin Core metadata), CSV, GeoJSON, and PDF**." |
| **"Pashmina merges three sources"** | Entity `ENT-70533` (Pashmina Weaving) links exactly 2 records across 2 sources: GI Registry (`FUSED-REC-GI-46`) and Commons (`FUSED-REC-COMMONS-512`). | "Pashmina Weaving (`ENT-70533`) merges official GI Registry data with verified open museum archives." |
| **"The software uses AI to predict missing metadata"** | Scoring is 100% deterministic and rule-based. No LLM or generative AI touches the evaluation path (`LLM_EXPLAIN=0`). | "Scoring is completely deterministic and transparent, avoiding hallucinated cultural attributes." |
| **"First ever AI platform for Indian heritage"** | Unprovable hackathon superlative; judges penalize unsubstantiated 'first ever' claims. | "A museum-grade cultural collection auditing platform measuring institutional silence across Indian heritage." |

---

## 3. Verified Zero-Record States & Documentation Absences

### In Museum-Only Holdings (`sample-real-001`, 181 records across 13 states):
**23 States and Union Territories have ZERO records (completely silent):**
1. Andaman and Nicobar Islands (`IN-AN`)
2. Andhra Pradesh (`IN-AP`)
3. Arunachal Pradesh (`IN-AR`)
4. **Assam (`IN-AS`) — 0 records (VERIFIED)**
5. Chandigarh (`IN-CH`)
6. Chhattisgarh (`IN-CT`)
7. Dadra and Nagar Haveli and Daman and Diu (`IN-DN`)
8. Goa (`IN-GA`)
9. Haryana (`IN-HR`)
10. Jharkhand (`IN-JH`)
11. **Ladakh (`IN-LA`) — 0 records (VERIFIED; panel indicates no records)**
12. Lakshadweep (`IN-LD`)
13. Manipur (`IN-MN`)
14. Meghalaya (`IN-ML`)
15. **Mizoram (`IN-MZ`) — 0 records (VERIFIED)**
16. Nagaland (`IN-NL`)
17. Puducherry (`IN-PY`)
18. Punjab (`IN-PB`)
19. **Rajasthan (`IN-RJ`) — 0 records (VERIFIED)**
20. Sikkim (`IN-SK`)
21. Telangana (`IN-TG`)
22. Tripura (`IN-TR`)
23. Uttarakhand (`IN-UT`)

### In Fused Subcontinental Holdings (`fused-v2`, 317 records):
- **Primary Catalog Record Count:** 35 states have $\ge 1$ record; **Haryana (`IN-HR`) has 0 primary records** (displays 0 on the map choropleth).
- **Regional Attributions:** All 36 states/UTs have $\ge 1$ attribution (Haryana has 2 attributions via Phulkari and Basmati multi-state registries).
- **Suppressed Slices (< 5 records):** 20 states/UTs have under 5 records and carry the "insufficient evidence" indicator:
  - 1 record: Lakshadweep, Meghalaya, Sikkim
  - 2 records: Andaman & Nicobar, Andhra Pradesh, Arunachal Pradesh, Chandigarh, Dadra & Nagar Haveli, Goa, Jharkhand, Mizoram, Nagaland, Tripura
  - 3 records: Assam, Chhattisgarh, Manipur, Puducherry, Telangana
  - 4 records: Ladakh, Punjab

