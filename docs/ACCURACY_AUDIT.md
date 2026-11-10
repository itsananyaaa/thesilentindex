# THE SILENCE INDEX — COMPREHENSIVE FACTUAL ACCURACY & DATA CONSISTENCY AUDIT
**Date:** 10 November 2026  
**Auditor:** QA Lead, Data Auditor & Technical Editor  
**Target Environments:**
- **Live Frontend:** [https://thesilentindex.vercel.app](https://thesilentindex.vercel.app) (Next.js 14 App Router on Vercel)
- **Live Backend:** [https://thesilentindex-backend.onrender.com](https://thesilentindex-backend.onrender.com) (FastAPI & SQLite on Render)
- **GitHub Repository:** [https://github.com/itsananyaaa/thesilentindex](https://github.com/itsananyaaa/thesilentindex)
- **Canonical Seed Database:** `silence_index.db` (SHA-256: `9e435f6a94a25d872ab7b2d19feca4cdebb935fbe7ac887db12378f2f38c6d1e`)

---

## 1. Executive Summary & Audit Mandate

Ahead of the Art Code Virtual Hackathon judging, an exhaustive, read-only audit of **THE SILENCE INDEX** was executed to verify every figure, formula, label, claim, and geographical representation across the platform.

### Core Audit Principles Enforced
1. **Strict Read-Only Verification:** No production files, scoring logic, thresholds, or database records were altered.
2. **Database Hash Lock:** `silence_index.db` was verified before and after all operations to ensure its SHA-256 hash remained strictly `9e435f6a94a25d872ab7b2d19feca4cdebb935fbe7ac887db12378f2f38c6d1e`. All exploratory queries and test executions were conducted against a verified read-only copy created via SQLite `.backup` (`/tmp/audit_silence_index.db`).
3. **Zero Fabrication:** Every claim status was confirmed via direct SQL queries, automated test executions, live API payloads, or source code line citations.

---

## 2. Ground Truth Extraction

All values below were extracted directly from the verified database copy (`/tmp/audit_silence_index.db`) and codebase.

### 2.1 Database Table Row Counts
*Command: `SELECT count(*) FROM <table>`*

| Table Name | Row Count | Purpose & Description |
| :--- | :---: | :--- |
| `records` | **648** | Complete cultural record inventory across all 3 collections |
| `record_dimension_status` | **12,480** | Dimension evaluations ($648 \times 10$ dimensions across audits) |
| `field_provenance` | **931** | Source attribution field tracking |
| `priorities` | **503** | Ranked preservation priority recommendations |
| `state_attributions` | **345** | Geographical state mappings across fused records |
| `images` | **181** | Image records with declared rights categories |
| `entities` | **157** | Clustered unique cultural traditions, crafts, and monuments |
| `entity_links` | **317** | Association links between `entities` and `records` in fused collection |
| `duplicate_clusters` | **68** | RapidFuzz title similarity clusters |
| `findings` | **21** | Qualitative audit diagnostic observations |
| `source_layers` | **5** | Registered external data harvest pipelines |
| `harvest_runs` | **5** | Harvest run executions for the 5 source layers |
| `audits` | **3** | Seed audit instances for the 3 collections |
| `collections` | **3** | Fused (`fused-v2`), Baseline (`sample-real-001`), Synthetic (`sample-synth-002`) |

---

### 2.2 Record Inventory by Collection
*Command: `SELECT collection_id, count(*) FROM records GROUP BY collection_id`*

1. **`fused-v2` (The National Silence Index):** **317 records** (Seed subcontinental fused collection).
2. **`sample-real-001` (Indian Art in Open Access):** **181 records** (Museum-only baseline).
3. **`sample-synth-002` (Synthetic Stress Benchmark):** **150 records** (Synthetic validation set).
*Total across all collections: $317 + 181 + 150 = 648$ records.*

---

### 2.3 Source Layer Breakdown in Fused Collection (`fused-v2`)
*Command: `SELECT layer_id, count(*) FROM records WHERE collection_id = 'fused-v2' GROUP BY layer_id`*

| Layer ID | Name / Description | Verified Count | README Claimed | Discrepancy Note |
| :--- | :--- | :---: | :---: | :--- |
| `museum_open_access` | Open-Access Museum & Archive Holdings | **181** | 72 | README under-reports museum records by 109 |
| `gi_registry` | Geographical Indications Registry (IP India) | **81** | 108 | README over-reports GI records by 27 |
| `wikidata` | Wikidata Cultural SPARQL / ASI Monuments | **24** | 68 | README over-reports Wikidata records by 44 |
| `commons` | Wikimedia Commons Verified Cultural Media | **16** | 0 | README omits Commons as a distinct layer |
| `unesco_ich` | UNESCO Intangible Cultural Heritage List | **15** | 15 | **Exact match** |
| **Total** | | **317** | **317** | Sum equals 317 in both, but internal layer counts differ |

> **Critical Note on ASI:** Archaeological Survey of India (ASI) is **not an independent database layer**. It is represented within `wikidata` (as "Archaeological Survey of India / Wikidata", 24 records) and `museum_open_access` (2 records).

---

### 2.4 State Attributions & The Multi-State Rule
*Command: `SELECT count(*) FROM state_attributions` $\rightarrow$ 345*  
Attributions (**345**) exceed records (**317**) by **28** because **19 records represent multi-state traditions or registered GI crafts** spanning more than one State or Union Territory:
- **Basmati Rice (`FUSED-REC-GI-145`):** 7 states (Punjab, Haryana, Himachal Pradesh, Delhi, Uttarakhand, Western Uttar Pradesh, Jammu & Kashmir).
- **Phulkari Embroidery (`FUSED-REC-GI-111`):** 3 states (Punjab, Haryana, Rajasthan).
- **Kolhapuri Chappal (`FUSED-REC-GI-131`):** 2 states (Maharashtra, Karnataka).
- **Warli Painting (`FUSED-REC-GI-184`):** 2 states (Maharashtra, Gujarat).
- **Sohrai & Khovar Painting (`FUSED-REC-GI-645`):** 2 states (Jharkhand, Bihar).

---

### 2.5 Per-State & Union Territory Coverage
*Command: `SELECT state, count(*) FROM records WHERE collection_id = ... GROUP BY state`*

#### A. Museum-Only Baseline (`sample-real-001`, 181 records):
- **Only 13 States have catalogued items:**
  - Tamil Nadu: 37
  - Kerala: 21
  - Karnataka: 18
  - Odisha: 15
  - West Bengal: 15
  - Jammu and Kashmir: 15
  - Maharashtra: 14
  - Gujarat: 9
  - Madhya Pradesh: 8
  - Uttar Pradesh: 8
  - Bihar: 7
  - Delhi: 7
  - Himachal Pradesh: 7
- **23 States & Union Territories have ZERO records (completely blank):**
  - **Rajasthan (0)**, **Assam (0)**, **Mizoram (0)**, **Ladakh (0)**, Andaman & Nicobar (0), Andhra Pradesh (0), Arunachal Pradesh (0), Chandigarh (0), Chhattisgarh (0), Dadra & Nagar Haveli (0), Goa (0), Haryana (0), Jharkhand (0), Lakshadweep (0), Manipur (0), Meghalaya (0), Nagaland (0), Puducherry (0), Punjab (0), Sikkim (0), Telangana (0), Tripura (0), Uttarakhand (0).

#### B. Fused Collection (`fused-v2`, 317 records):
- **Primary Catalog Records (`Record.state`):** **35 states/UTs have $\ge 1$ record.**
  - **Haryana (`IN-HR`) has 0 primary records in `Record.state`!**
  - Haryana is attributed in `state_attributions` (2 records via Basmati Rice and Phulkari), but because `Record.state` for those records holds 'Punjab', `/api/collections/fused-v2/summary` reports `states_count: 35`, and `/api/audits/AUDIT-FUSED-V2-INIT/map` reports `zero_states_count: 1` (Haryana rendered as 0).
- **Suppression Threshold (< 5 records):** **20 States & UTs** have fewer than 5 records and carry the "insufficient evidence" indicator:
  - 1 record: Lakshadweep (`LD`), Meghalaya (`ML`), Sikkim (`SK`).
  - 2 records: Andaman & Nicobar (`AN`), Andhra Pradesh (`AP`), Arunachal Pradesh (`AR`), Chandigarh (`CH`), Dadra & Nagar Haveli (`DN`), Goa (`GA`), Jharkhand (`JH`), Mizoram (`MZ`), Nagaland (`NL`), Tripura (`TR`).
  - 3 records: Assam (`AS`), Chhattisgarh (`CT`), Manipur (`MN`), Puducherry (`PY`), Telangana (`TG`).
  - 4 records: Ladakh (`LA`), Punjab (`PB`).

---

### 2.6 Landing Hero Figures (181, 33.9, 7/10)
- In `frontend/app/page.tsx` (lines 216, 227, 238), the JSX contains hardcoded fallback strings:
  - Total records fallback: `"181"`
  - Cultural Coverage Debt fallback: `"33.9"`
  - Assessable dimensions fallback: `"7"/10`
- **Origin:** These numbers originate from `sample-real-001` (Audit `AUDIT-SAMPLE-REAL-001-INIT`: 181 records, CCD 33.93, 7 assessable dimensions).
- **Behavior:** On page load, while Render spins up or before the API fetch resolves, the user sees `181`, `33.9`, and `7/10`. Once the API responds for the active collection (`fused-v2`), the figures update to `317`, `29.9`, and `5/10`.

---

### 2.7 Seed Audits Ground Truth

| Audit ID | Collection ID | CCD | 90% CI Low | 90% CI High | Assessability String | Assessable Dims |
| :--- | :--- | :---: | :---: | :---: | :--- | :---: |
| `AUDIT-FUSED-V2-INIT` | `fused-v2` | **29.94** | 29.65 | 30.20 | "5 of 10 dimensions assessable" | 5 |
| `AUDIT-SAMPLE-REAL-001-INIT` | `sample-real-001` | **33.93** | 33.60 | 34.24 | "7 of 10 dimensions assessable" | 7 |
| `AUDIT-SAMPLE-SYNTH-002-INIT` | `sample-synth-002` | **56.30** | 54.90 | 57.67 | "9 of 10 dimensions assessable" | 9 |

- **Bootstrap Parameters:** 1,000 resamples, fixed seed (`seed = 42`), 90% confidence interval (5th and 95th percentiles). Verified in `backend/engines/ccd.py:105-131`.

---

### 2.8 Scoring Rubrics, Thresholds & Formulas
*File: `backend/engines/coverage.py:116-121`*
- **Documented:** $\text{score} \ge 0.75$
- **Partial:** $0.25 \le \text{score} < 0.75$
- **Undocumented in collection:** $\text{score} < 0.25$ (when dimension is assessable)
- **Not assessable:** Dataset schema lacks column to assess dimension
- **Not applicable:** Category exempt from dimension
*File: `backend/engines/priority.py:18-24`*
- **Priority Score:** $\text{Priority} = 100 \times (0.40G + 0.25E + 0.20B + 0.15F)$
  - $G$ (Gap magnitude) = slice debt ($1.0 - \text{mean score}$)
  - $E$ (Evidence confidence) = sample stability ($\min(1.0, 0.4 + \text{count}/100)$)
  - $B$ (Collection breadth) = share of collection ($\text{count} / \text{total}$)
  - $F$ (Feasibility) = presence of leads and fieldwork penalty
- **Priority Bands:** High ($\ge 65.0$), Medium ($\ge 42.0$), Lower ($< 42.0$). (*Never labeled "importance"*).

---

### 2.9 Pashmina Entity (`ENT-70533`) Profile
- **Label:** `Pashmina Weaving`
- **Entity Type:** `craft` | **Category:** `textiles_crafts` | **Created From:** `gi_registry`
- **Primary States:** `["JK"]`
- **Linked Records (2):**
  1. `FUSED-REC-GI-46` (`gi_registry`): *Kashmir Pashmina* (GI Registry of India)
  2. `FUSED-REC-COMMONS-512` (`commons`): *Antique Pashmina Jamawar Shawl with Paisley Buta* (Victoria and Albert Museum / Commons)
- **Recognition Badges:** **`GI_TAG`** ("Geographical Indication (GI) Registered", Intellectual Property India). Supported by official GI Application #46.
- **CCD Metrics:**
  - `entity_ccd`: **32.0** | `record_level_avg_ccd`: **32.0** | `debt_closed_delta`: **0.0**
  - Dimensions: Visual Documentation (0.8), Historical Context (0.4), Geographic Provenance (0.4), Materials & Techniques (1.0), Source Attribution (0.8). Other 5 dimensions are Not Assessable.

---

### 2.10 The "Up to 42.6 Points" Debt Reduction Investigation
- **Claim:** README line 170 claims multi-source fusion closes debt by "up to 42.6 points".
- **Verification across all 157 Entities:**
  - Evaluated every entity via `evaluate_heritage_entity_ccd`:
    - **Top 1:** `ENT-06980` (Chhau Dance): record CCD 34.38 $\rightarrow$ entity CCD 25.0 = **9.38 points delta**.
    - **Top 2:** `ENT-09213` (Warli Painting): 31.25 $\rightarrow$ 26.0 = **5.25 points delta**.
    - **Top 3:** `ENT-34325` (Dravidian Architecture): 31.25 $\rightarrow$ 26.0 = **5.25 points delta**.
    - **Top 4:** `ENT-44113` (Tanjore Painting): 31.14 $\rightarrow$ 26.0 = **5.14 points delta**.
- **Conclusion:** The true maximum debt reduction across the entire database is **9.38 points**. The **42.6 points** figure is unsubstantiated.

---

### 2.11 Test Suite Verification
- Ran full test suite against `/tmp/audit_silence_index.db`:
  - `backend/tests/test_api.py` (7 tests)
  - `backend/tests/test_entities_ccd.py` (1 test)
  - `backend/tests/test_golden.py` (4 tests)
  - `backend/tests/test_multi_state_gi.py` (3 tests)
  - `backend/tests/test_rights.py` (8 tests)
  - `backend/tests/test_scripts_lang.py` (4 tests)
  - `backend/tests/test_upload.py` (7 tests)
  - `backend/tests/test_v2_features.py` (7 tests)
  - **Result:** **41 passed, 0 failed, 0 skipped, 1 warning** (Starlette testclient deprecation) in 0.78 seconds.

---

### 2.12 Route Inventory
- **Frontend Routes (19):**
  `/`, `/observatory`, `/explorer`, `/map`, `/matrix`, `/sources`, `/entities`, `/entities/[id]`, `/gaps`, `/compare`, `/priorities`, `/health`, `/reports/[auditId]`, `/records/[id]`, `/atlas`, `/auditor`, `/method`, `/ethics`, `/credits`.
- **Backend OpenAPI Routes (44):**
  44 endpoints across Collections, Audits, Matrix, Map, Records, Images, Uploads, Config, Sources, Entities, Gaps, Compare, Briefs, Exports, Health, and Geo.

---

## 3. Findings Grouped by Severity

### Critical Findings (Contradictions or False Numbers)

1. **"Up to 42.6 Points Debt Reduction" Claim is False (README:170):**
   - The true maximum debt closed delta across all 157 entities in the database is **9.38 points** (`ENT-06980` Chhau Dance). There is no entity with 42.6 points reduction.
2. **README Source Layer Breakdown Disagrees with Database (README:270-277):**
   - README claims: 108 GI, 15 UNESCO, 54 ASI, 68 Wikidata, 72 museum open access.
   - Database has: 81 GI, 15 UNESCO, 24 Wikidata, 16 Commons, 181 museum open access.
   - ASI is not a separate layer in the database.
3. **DataCite XML and Dublin Core XML Downloads Do Not Exist:**
   - README:23 and pitch claim C20 state all 5 export formats (DataCite XML, Dublin Core XML, Schema.org JSON-LD, CSV, PDF) are functional.
   - Backend only implements Schema.org JSON-LD (with Dublin Core terms embedded), CSV, GeoJSON, and PDF. No DataCite XML or standalone Dublin Core XML endpoints exist.
4. **Hero Landing Page Fallback Numbers Disagree with Active Collection:**
   - Landing page fallback HTML shows `181`, `33.9`, and `7/10` (values from `sample-real-001`), while `activeColId` is set to `fused-v2` (`317`, `29.9`, and `5/10`). During Render cold starts, visitors see the wrong collection metrics.

---

### Major Findings (Misleading Labels, Provenance Gaps, UI Inconsistencies)

5. **Live Map & Summary Endpoint Show 35 States, Not 36 (Haryana Zero):**
   - Haryana (`IN-HR`) has 0 primary records in `records.state` (its 2 records belong to multi-state items whose primary state is Punjab).
   - `/api/collections/fused-v2/summary` reports `states_count: 35`.
   - `/api/audits/AUDIT-FUSED-V2-INIT/map` renders Haryana with 0 records (`is_zero_in_collection: true`), displaying `states_with_records_count: 35` and `zero_states_count: 1`.
6. **Cartographic GeoJSON Missing Telangana & Duplicate Feature:**
   - `data/geo/india_states.geojson` contains only 35 features. Telangana is missing (merged into Andhra Pradesh), and Dadra & Nagar Haveli is duplicated. Telangana cannot be clicked on the map.
7. **Pashmina Merges Two Sources, Not Three (Pitch Claim C12):**
   - `ENT-70533` links exactly 2 records (`gi_registry` and `commons`), not 3.
8. **Hardcoded Static Dimension Distribution on `/observatory` (Lines 243-251):**
   - The 10-dimension horizontal progress bars on `/observatory` use hardcoded mock numbers (e.g. Preservation & Accessibility = 75% Doc, 15% Part, 10% Undoc), whereas in `fused-v2` Preservation & Accessibility is 100% Not Assessable.
9. **Health Dashboard Test Suite Badge Displays Stale 34 Tests:**
   - `/health` displays `34 / 34 Passing` (hardcoded in `backend/routers/health.py:64`), while the actual test suite runs 41 tests.
10. **Unrecorded UI Assets on `/credits`:**
    - UI decorative graphics (`lotus_*.png`, `classical_dancers_transparent.png`, `india_cultural_map.jpg`) and hero audio (`raga_bindu_stress_melts_away.m4a`) are not catalogued on `/credits`.
11. **Audio Autoplay Violates WCAG 1.4.2:**
    - `frontend/app/page.tsx` attempts automatic audio playback on mount and attaches global gesture listeners, conflicting with accessibility standards and browser autoplay policies.

---

### Minor Findings (Polish, Wording & Locales)

12. **Missing Translations for "Not assessable" & "Not applicable":**
    - Locale JSON files (`hi.json`, `ml.json`, `ta.json`) translate Documented, Partial, and Undocumented, but omit keys for "Not assessable" and "Not applicable", causing English fallbacks in the matrix drawer.
13. **Cold Start Latency Wording:**
    - Stated as "about 45–50 seconds", measured at 32.6 seconds.
14. **PDF Indic Typography Font Rendering:**
    - Generated PDF brief uses Helvetica standard fonts; Indic scripts fallback to Latin transliterations in PDF generation.

---

## 4. Analysis of Checks (A through J)

- **A. Internal Consistency:** Collections and record counts agree between SQL and API summary endpoints. Multi-state attribution accounting fully explains the difference between 317 records and 345 attributions.
- **B. Formula & Metric Integrity:** CCD calculation, 90% bootstrap (1,000 resamples, seed 42), four epistemic states, and priority weights (0.40, 0.25, 0.20, 0.15) were independently re-computed in Python and matched the database down to two decimal places (33.93 and 29.94).
- **C. Diagnostics Hub Truthfulness:** Engine uptime and record counts on `/health` are live. Test counts (34), cache hit rate (99.2%), and test coverage (96.5%) are static. "100% WCAG compliance" claim is unverified.
- **D. Boundary & Geography:** GeoJSON boundary file contains official Republic of India demarcations with boundary disclaimer, but lacks separate polygon demarcations for Telangana and Ladakh.
- **E. External Recognition Badges:** Checked across 25 sample entities. Official GI registrations (IP India) and UNESCO Intangible Cultural Heritage inscriptions match official records.
- **F. Rights & Attribution:** Download gate correctly returns HTTP 403 Forbidden for non-reusable items, allowing direct download only for CC0, PDM, CC BY, and CC BY-SA.
- **G. Open Data Exports:** Schema.org JSON-LD, CSV, GeoJSON, and PDF work. DataCite XML and Dublin Core XML downloads do not exist.
- **H. Multilingual Integrity:** All 4 languages have exactly 113 keys with 0 missing keys. Status terms are consistent.
- **I. API Latency & Cold Starts:** Measured cold start on Render free tier is 32.61 seconds. All 44 endpoints return HTTP 200/307.
- **J. Demo-Path Rehearsal:** Successfully executed via headless Playwright against the production deployment (`https://thesilentindex.vercel.app`).

---

## 5. Decisions Needed from User (Before Phase 2 Corrections)

1. **Landing & Map Default Display:**
   - *Issue:* Landing page hardcoded fallback shows 181, 33.9, 7/10 before API fetch. Fused collection has 317, 29.9, 5/10.
   - *Recommendation:* Bind fallback HTML in `frontend/app/page.tsx` to `"317"`, `"29.9"`, and `"5"` so numbers remain seamless during Render wake-up.
2. **Haryana Display on Live Map (35 vs 36 States):**
   - *Issue:* Haryana has 0 primary records in `records.state`, causing the map to render Haryana as 0 items and reporting 35 states.
   - *Recommendation:* Keep narrative precise: "All 36 States & UTs represented in regional attributions; 35 states catalogued in primary holdings". Alternatively, add primary state mapping for Haryana records.
3. **README Source Layer Breakdown (81 vs 108 GI):**
   - *Recommendation:* Update README table to reflect true database counts: 81 GI Registry, 15 UNESCO, 24 Wikidata, 16 Commons, 181 Museum Open Access.
4. **Unsupported Claims (42.6 Points & 100% WCAG):**
   - *Recommendation:* Correct "up to 42.6 points" to "up to 9.4 points". Replace "100% WCAG compliance" with specific compliance statements ("WCAG AA high-contrast design with pattern fills").
5. **DataCite & Dublin Core XML Exports:**
   - *Recommendation:* Update README and pitch to state "Exports in Schema.org JSON-LD (with Dublin Core metadata), CSV, GeoJSON, and PDF" (removing mention of DataCite XML).
6. **Provenance of Decorative Assets on `/credits`:**
   - *Recommendation:* Add a "Platform Artwork & Media Credits" section to `/credits` recording the provenance and license of `lotus_*.png`, `classical_dancers_transparent.png`, and Raga Bindu's meditation track.

