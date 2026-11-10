# THE SILENCE INDEX — PITCH-SAFE TRUTH SHEET
> **Audience:** Hackathon Presentation, Stage Pitch & Technical Demo Rehearsal  
> **Source of Truth:** Verified SQLite database (`silence_index.db`, SHA-256: `9e435f6a94a25d872ab7b2d19feca4cdebb935fbe7ac887db12378f2f38c6d1e`), Python test suite (42 passed), and live API responses (`https://thesilentindex-backend.onrender.com` & `https://thesilentindex.vercel.app`) as of 10 November 2026.  
> **Rule:** Every figure below is provably backed by database queries, live deployment responses, and implementation code. If a figure is not on this sheet, do not say it.

---

## 1. Verified Key Numbers (Safe to Say on Stage)

| Metric | Verified Value | Where on Screen / Route | Context & Evidence | Verification Status |
| :--- | :---: | :--- | :--- | :---: |
| **Fused Collection Records** | **317** | `/`, `/observatory`, `/auditor`, `/compare` | `collection_id = 'fused-v2'`. Seed subcontinental collection. | **Verified on live site** |
| **Open Access Baseline Records** | **181** | `/compare`, `/observatory` (Sample A), `/map` | `collection_id = 'sample-real-001'`. Real museum archive holdings across 13 states. | **Verified on live site** |
| **Synthetic Benchmark Records** | **150** | `/compare` (Sample B), `/map` | `collection_id = 'sample-synth-002'`. 9-dimension test suite. | **Verified on live site** |
| **Heritage Entities** | **157** | `/entities`, `/health`, `/gaps` | Clustered unique cultural traditions, monuments, crafts, and performing arts. | **Verified on live site** |
| **Regional State Attributions** | **345** | `/sources`, `/sources/ledger.csv` | Cross-regional mappings across 317 records (allowing for multi-state traditions like Basmati Rice and Phulkari). | **Verified on live site** |
| **Documentation Dimensions** | **10** | `/matrix`, `/method`, `/page.tsx` | Visual, Historical, Language, Geography, Materials, Practitioner, Oral Histories, Attribution, Community, Preservation. | **Verified on live site** |
| **Epistemic Classification States** | **4** | `/matrix`, `/method`, `/records/[id]` | **Documented** (≥0.75), **Partial** (0.25–0.74), **Undocumented in collection** (<0.25), **Not assessable** (unmapped schema column), plus **Not applicable**. | **Verified on live site** |
| **Cultural Coverage Debt (CCD)** | **29.94** | `/observatory`, `/auditor`, `/` (Fused v2) | Fused collection debt score (90% CI: [29.65, 30.20], 5 of 10 assessable dimensions). | **Verified on live site** |
| **Baseline Museum CCD** | **33.93** | `/compare`, `/` (Sample A) | Open Access museum holdings debt score (90% CI: [33.60, 34.24], 7 of 10 assessable). | **Verified on live site** |
| **Statistical Bootstrap** | **1,000 resamples** | Code (`ccd.py`), `/method` | 90% confidence interval, fixed seed (`seed=42`) for 100% computational reproducibility. | **Verified on live site** |
| **Suppression Threshold** | **< 5 records** | `/map`, `/priorities`, `ccd.py` | Statistical slices with fewer than 5 records display "insufficient evidence" to avoid misleading inferences. | **Verified on live site** |
| **Automated Passing Tests** | **42** | `pytest` terminal run, `/health` | 42 unit and regression tests passing in 0.85s. `/health` API verified run date: 10 November 2026. | **Verified on live site** |
| **Production Routes** | **19** | Full App Router (`frontend/app/`) | 19 live routes covering observatory, matrix, map, entities, gaps, priorities, atlas, auditor, health, exports. | **Verified on live site** |
| **Supported Indian Languages** | **4** | Header language toggle | English, Hindi (हिंदी), Malayalam (മലയാളം), Tamil (தமிழ்) with 113 translated keys per language. | **Verified on live site** |
| **Preservation Priorities Generated** | **503** | `/priorities`, `priorities` table | Dimension-by-slice recommendations ranked by $100 \times (0.40G + 0.25E + 0.20B + 0.15F)$. | **Verified on live site** |
| **Active Source Layers** | **5** | `/sources`, `source_layers` table | Museum Open Access (181), GI Registry (81), Wikidata (24), Wikimedia Commons (16), UNESCO ICH (15). Total = 317. | **Verified on live site** |
| **True Maximum Debt Reduction** | **9.38 points** | `evaluate_heritage_entity_ccd` | Highest debt reduction achieved via multi-source fusion across all 157 entities is Chhau Dance (`ENT-06980`, 34.38 → 25.0). | **Verified on live site** |
| **Render Cold Start Latency** | **33.02 seconds** | Live curl on Render free tier | Measured on 10 Nov 2026; warm requests return in 0.34 seconds. | **Verified on live site** |
| **Accessibility Scan (axe-core)** | **Dated 10 Nov 2026** | `/health`, `docs/AXE_ACCESSIBILITY_AUDIT.json` | 19 routes scanned; 0 defects on `/ethics` and `/credits`; 25–30 rules passed per route; palette contrast notes logged. | **Verified on live site** |

---

## 2. Four Preservation Priority Factors (Exact Code Names & Weights)

In `backend/engines/priority.py` (lines 4–17), the 4 priority factors and their deterministic weights are:

$$\text{Priority Score} = 100 \times (0.40 \cdot G + 0.25 \cdot E + 0.20 \cdot B + 0.15 \cdot F)$$

1. **$G$ (Gap Magnitude):** Weight **`0.40`**  
   Dimensional debt score on that slice ($1.0 - \text{mean\_score}$).
2. **$E$ (Evidence Confidence):** Weight **`0.25`**  
   Statistical stability function of slice size and sample completeness ($\min(1.0, 0.4 + \frac{\text{slice\_count}}{100.0})$).
3. **$B$ (Breadth):** Weight **`0.20`**  
   Share of the total collection affected by the gap ($\frac{\text{slice\_count}}{\text{total\_records}}$).
4. **$F$ (Feasibility):** Weight **`0.15`**  
   Presence of leads (URLs, institutions) vs desk research vs primary fieldwork ($0.5 \times \text{leads\_ratio} + [0.30 \text{ desk} \mid 0.15 \text{ fieldwork}]$).

*These 4 factor names and weights match identically across `backend/engines/priority.py`, `README.md`, `/method`, and the interactive sliders on `/priorities`.*

---

## 3. "Do Not Say" List (Avoid on Stage)

| ❌ DO NOT SAY | Why it is Inaccurate | ✅ WHAT TO SAY INSTEAD |
| :--- | :--- | :--- |
| **"Clustering closes documentation debt by up to 42.6 points"** | The true maximum debt reduction across all 157 entities in the database is **9.38 points** (`ENT-06980` Chhau Dance). 42.6 is unsubstantiated. | "Clustering cross-institutional records with living registers closes documentation debt by **up to 9.4 points for a single entity**." |
| **"100% WCAG compliance" / "Zero accessibility errors"** | Automated audits find subtle color contrast on traditional oxblood/gold filigrees. No automated tool guarantees 100% WCAG. | "Evaluated with automated axe-core 4.8.4 scans on 10 November 2026 across all 19 routes, achieving clean passes on `/ethics` and `/credits`." |
| **"All 36 states and union territories have records on the map"** | In `fused-v2`, `records.state` has 35 states; Haryana (`HR`) displays 0 on the live map and in `/api/collections/fused-v2/summary` because Haryana's 2 attributions stem from multi-state records where primary state is Punjab. | "All 36 States and UTs are accounted for in regional attributions, with 35 states catalogued in primary holdings." |
| **"108 GI, 54 ASI, 68 Wikidata, 72 museum records"** | The database `layer_id` breakdown is **81 GI, 15 UNESCO, 24 Wikidata, 16 Commons, 181 Museum OA** (Total 317). ASI is reached through Wikidata and Museum OA. | "Five fused sources: 81 GI Registry crafts, 15 UNESCO traditions, 24 Wikidata monuments, 16 Commons media, and 181 museum holdings." |
| **"DataCite XML and Dublin Core XML downloads"** | There are NO DataCite XML or Dublin Core XML export endpoints in backend. Dublin Core is embedded inside the Schema.org JSON-LD graph. | "Machine-readable open data exports in **Schema.org JSON-LD (with Dublin Core metadata), CSV, GeoJSON, and PDF**." |
| **"Pashmina merges three sources"** | Entity `ENT-70533` (Pashmina Weaving) links exactly 2 records across 2 sources: GI Registry (`FUSED-REC-GI-46`) and Commons (`FUSED-REC-COMMONS-512`). Max linked sources for any entity is 2. | "Pashmina Weaving (`ENT-70533`) merges official GI Registry data with verified open museum archives." |
| **"The software uses AI to predict missing metadata"** | Scoring is 100% deterministic and rule-based. No LLM or generative AI touches the evaluation path (`LLM_EXPLAIN=0`). | "Scoring is completely deterministic and transparent, avoiding hallucinated cultural attributes." |
| **"First ever AI platform for Indian heritage"** | Unprovable hackathon superlative; judges penalize unsubstantiated 'first ever' claims. | "A museum-grade cultural collection auditing platform measuring institutional silence across Indian heritage." |

---

## 4. Verified Zero-Record States & Documentation Absences

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

---

## 5. Live Demo Path & Collection Switching Verification

1. **Landing Hero (`/`):**
   - Real-time KPI band displaying **317 records**, **29.94 CCD**, and **5 assessable dimensions** (matching `fused-v2` API).
   - Audio controller for *Stress Melts Away* by Raga Bindu with volume indicator and gesture unlock.
   - Illustrated dancers and glowing lotuses by Ritu Poojari (Behance) seamlessly rendered over oxblood backdrop.
2. **Subcontinental Blind-Spot Map (`/map`):**
   - **Direct Holding Selector:** Switch seamlessly between *Fused Subcontinental Collection (317 items)* and *Museum-Only Holdings (Sample A, 181 items)* right on the map.
   - **Telangana Targeting Chip (`IN-TG`):** Target Telangana directly to inspect its 3 catalogued holdings (Pochampally Ikat, Pembarthi Metal Craft, Golconda Fort and Qutb Shahi Tombs).
   - **Ladakh Targeting Chip (`IN-LA`):** Inspect Ladakh's 4 catalogued holdings in `fused-v2`, or see truthful *"No Records in Analysed Collection"* under `sample-real-001`.
   - **Cartographic Note:** Transparently notes that base GeoJSON geometry pairs Telangana with AP and Ladakh with J&K, with both accessible via chips and table.
3. **Heritage Entities (`/entities` & `/entities/ENT-06980`):**
   - Chhau Dance (`ENT-06980`) demonstrates multi-source closure of documentation debt from **34.38 down to 25.0** ($\Delta = 9.38$ points) by clustering UNESCO ICH and open museum holdings.
4. **Preservation Priorities (`/priorities`):**
   - 4-factor formula $100 \times (0.40G + 0.25E + 0.20B + 0.15F)$ with interactive sliders.
   - Consent gate flags living ritual practices as *"Consultation Required"*.
   - Generates standardized 6-section Curatorial Action Briefs with PDF downloads.
5. **Diagnostics Hub (`/health`):**
   - Live database status: SQLite, 648 records, 157 entities, 5 layers active.
   - Test suite status: **42 / 42 passing** with verified run date **10 November 2026**.
   - Accessibility audit status: **axe-core 4.8.4 scan on 10 November 2026** across all 19 routes.
