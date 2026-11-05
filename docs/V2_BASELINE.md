# THE SILENCE INDEX — v2 Upgrade Baseline Audit

**Date:** 2026-11-05  
**Version Starting Point:** v1.0.0  
**Target:** v2.0.0 (Multi-Source Layered Fusion, Heritage Entities, 36 State/UT Subcontinental Coverage, 9 Standout Capabilities)

---

## 1. Runtime Environment & Tooling Verification

| Component | Detected Version | Status |
| :--- | :--- | :--- |
| **Operating System** | macOS (Darwin 24.x, Apple Silicon arm64) | Verified |
| **Python Runtime** | Python 3.11.15 (isolated `./venv`) | Verified |
| **Node.js** | v24.9.0 | Verified |
| **npm** | 11.6.0 | Verified |
| **FastAPI** | 0.162.0 | Healthy & Serving on `http://127.0.0.1:8000` |
| **Next.js** | 14.2.24 (App Router, Turbopack-ready) | Healthy & Serving on `http://localhost:3000` |
| **SQLAlchemy** | 2.1.8 | Verified |
| **Playwright** | 1.64.1 (Chromium v1248 installed) | Verified |
| **Ruff** | 0.17.3 | Installed |
| **Alembic** | 1.20.1 | Installed |

---

## 2. Test Suite & Code Quality Baseline

### Unit & Golden Tests
- **Test Command:** `PYTHONPATH=. ./venv/bin/pytest backend/tests/ -v`
- **Result:** **30 passed in 0.55s** (100% pass rate).
- **Golden Fixture:** Hand-computed `tiny_collection.csv` (12 records) matches `tiny_collection.expected.json` across all 10 dimensions, CCD formulas, and bootstrap intervals.
- **Invariants Tested:**
  - Non-reusable / in-copyright assets strictly reject download with HTTP 403.
  - Absence of column yields `Not assessable`, never false zeros.
  - Slices with $<5$ records suppress numeric CCD to `"Insufficient Evidence"`.
  - Multi-licensed items yield `NEEDS_REVIEW`.
  - Unicode block language heuristic correctly recognizes Devanagari, Tamil, and Latin transliterations.

### Static Analysis
- **TypeScript:** `npx tsc --noEmit` $\to$ **0 errors**.
- **Python Linting:** Initial Ruff scan detected 319 code style / import issues; 270 safely auto-fixed with `--fix`.

---

## 3. Existing v1 Architecture & Data Inventory

### Database Schema (v1)
- `collections`: id, name, institution, kind (`sample_real`, `sample_synthetic`, `upload`), description, record_count.
- `records`: id, collection_id, title, original_description, creator, institution, state, district, category_id, period, date, material, technique, rights_category, rights_declared, image_url.
- `audits`: id, collection_id, ccd, confidence_interval_90, assessable_dimensions, total_dimensions, dimensional_debts, created_at.
- `audit_matrices`: id, audit_id, matrix_json.
- `priority_items`: id, audit_id, gap_id, slice_category, slice_state, dimension, priority_score, priority_band, consultation, recommended_step.
- `duplicate_clusters`: id, audit_id, cluster_id, similarity, matched_fields, record_ids.
- `diagnostic_findings`: id, audit_id, finding_type, title, description, records_affected, recommended_action.
- `provenance_logs`: id, record_id, field_name, original_value, normalised_value, provenance_type (`SOURCE`, `NORMALISED`, `INFERRED`), confidence.

### Seed Datasets (v1)
1. `sample-real-001` (181 items from Wikimedia Commons open access).
2. `sample-synth-002` (150 synthetic records designed with diagnostic flaws).
3. `india_states.geojson` (455 KB optimized GeoJSON).

---

## 4. Gap Analysis & v2 Upgrade Roadmap

| Domain | v1 Status | v2 Requirement |
| :--- | :--- | :--- |
| **Source Layers** | Single harvester (Wikimedia Commons only) | Multi-source framework (`scripts/harvest/`): GI Registry, Wikidata SPARQL, Commons cultural categories, Museum open access, UNESCO ICH. |
| **Geographic Coverage** | 13 of 36 States/UTs documented | Full coverage across all 36 States & UTs (target $\ge 25$ records/state, $\ge 10$/UT where sources exist) with honest "Sparse" reporting where sources lack data. |
| **Heritage Entities** | Flat records only | First-class `HeritageEntity` model (craft, monument, art form, ritual) with linked evidence stack and entity-level CCD. |
| **Entity-Level CCD** | Record-level only | Max dimension score across linked records; difference between record and entity debt. |
| **Multi-State GI Attribution** | Single state string | `state_attributions` table with `multi_state` flag (counts once in totals, once per attributed state). |
| **Standout Features** | Core auditing only | 9 new features: `/sources`, `/entities/[id]`, `/gaps`, `/compare`, Brief PDF, Linked Open Data JSON-LD, Guided Tour, i18n (EN/HI/ML/TA), `/health`. |
| **Cartography** | Polygon click only | Small territory chips beneath map (Lakshadweep, Chandigarh, Puducherry, A&N, DNH&DD, Ladakh, Delhi) + 5 map modes. |
| **Reliability** | Local SQLite, basic errors | Offline cache replay, Alembic migrations, circuit breaker, checksum verification, strict upload security. |
