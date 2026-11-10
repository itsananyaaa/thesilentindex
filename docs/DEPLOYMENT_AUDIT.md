# THE SILENCE INDEX — Deployment Technical Audit

This audit evaluates the codebase architecture, execution dependencies, database read/write patterns, and deployment risks in strict preparation for zero-loss production hosting.

- **Date:** 2026-11-05
- **Commit Baseline:** `96be9a010e304a90c95027631d786b34b6414771`
- **Application:** THE SILENCE INDEX v2 (FastAPI + Next.js App Router + SQLite)

---

## 1. Frontend Audit (`frontend/`)

| Parameter | Specification | Evidence / File Citation |
| :--- | :--- | :--- |
| **Framework** | Next.js 14.2.24 | `frontend/package.json:15` |
| **Router Architecture** | Next.js App Router | `frontend/app/` (`layout.tsx`, `page.tsx`, etc.) |
| **Output Mode** | Default Next.js Standalone/Hybrid | `frontend/next.config.js:1-23` |
| **Component Architecture** | Client-heavy interactive pages (`"use client"`) with hydration-safe data fetching | `frontend/app/page.tsx:1`, `frontend/app/entities/page.tsx:1`, `frontend/app/map/page.tsx:1` |
| **Dynamic Routes** | 3 dynamic URL segments (`/entities/[id]`, `/records/[id]`, `/reports/[id]`) | `frontend/app/entities/[id]/page.tsx`, `frontend/app/records/[id]/page.tsx`, `frontend/app/reports/[id]/page.tsx` |
| **Environment Variables** | `NEXT_PUBLIC_API_URL` (consumed during rewrites and client calls; baked into client bundle at build time) | `frontend/next.config.js:14-20`, `frontend/lib/collection.ts` |
| **Static Assets** | 172 files in `frontend/public/` (including 171 high-resolution SVG heritage illustrations) | `baselines/local/asset_checksums.txt` |
| **Typography & Fonts** | Editorial serif web fonts (`Cinzel`, `Cormorant Garamond`, `Newsreader`, `Cinzel Decorative`) loaded via CSS `@import` | `frontend/app/globals.css:1-5` |
| **Indic Script Support** | Native UTF-8 Unicode rendering for English, Malayalam (മലയാളം), Hindi (हिन्दी), and Tamil (தமிழ்) | `frontend/lib/i18n.tsx:1-80` |
| **Image Optimisation** | `images: { unoptimized: true, remotePatterns: [...] }` to prevent Vercel free image-transformation quota limits | `frontend/next.config.js:4-12` |
| **Package Manager** | `npm` (with locked `package-lock.json`) | `frontend/package-lock.json` |
| **Build Command & Output** | `npm run build` compiles 19 routes cleanly | `frontend/package.json:7` |

---

## 2. Backend Audit (`backend/`)

| Parameter | Specification | Evidence / File Citation |
| :--- | :--- | :--- |
| **Python Version** | Python 3.11.15 | Confirmed via `python --version` |
| **Web Framework** | FastAPI 0.110.0+ | `backend/requirements.txt:1`, `backend/app/main.py:27` |
| **Entrypoint** | `backend.app.main:app` (ASGI standard) | `backend/app/main.py:27` |
| **Dependencies** | Pinned or bounded in `backend/requirements.txt`: `fastapi`, `uvicorn[standard]`, `pydantic>=2.6`, `sqlalchemy>=2.0`, `pandas>=2.2`, `reportlab>=4.1`, `pyyaml>=6.0`, `rapidfuzz>=3.6` | `backend/requirements.txt:1-15` |
| **ASGI Server & Startup** | `uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT` | `backend/app/main.py` |
| **Port Binding** | Dynamically binds to `PORT` supplied by cloud environment | Tested with `--port $PORT` |
| **CORS Middleware** | Configured with `ALLOWED_ORIGINS` environment variable defaulting to `*` | `backend/app/main.py:36-45` |
| **Health Check Route** | `GET /api/health` returns comprehensive JSON payload verifying DB connectivity, dialect, record count, and layer statuses | `backend/routers/health.py:1-60` |
| **Execution Timeouts** | Sync routes respond in < 15ms; export reports generate in < 120ms | Verified against baseline captures |

---

## 3. Database Architecture & Data Flow

### Database Location & Properties
- **Database File:** `./silence_index.db`
- **Dialect:** SQLite 3 (`sqlite:///./silence_index.db` via `DATABASE_URL` in `backend/app/db.py:10`)
- **Size:** 8,929,280 bytes (~8.5 MB)
- **Tables (16):** `collections`, `records`, `entities`, `entity_links`, `state_attributions`, `audits`, `findings`, `priorities`, `duplicate_clusters`, `source_layers`, `harvest_runs`, `images`, `record_dimension_status`, `field_provenance`, `column_mappings`, `inferences`.
- **Pre-computed Core Holding:**
  - `fused-v2`: 317 canonical records
  - Clustered Heritage Entities: 157
  - Multi-state attributions: 345
  - Source layers: 5 (GI Registry, Wikidata, Wikimedia Commons, UNESCO ICH, Museum Open Access)

### Read vs. Write Flow Analysis

#### A. Read-Only Core Discovery Endpoints (100% of Primary Platform)
The following primary public features only perform read queries (`SELECT`) via SQLAlchemy sessions:
1. **Landing & KPI Band:** `GET /api/collections`, `GET /api/collections/{id}/summary` (`backend/routers/collections.py:16-55`)
2. **Observatory:** `GET /api/records?collection_id={id}` (`backend/routers/records.py:20-65`)
3. **Blind-Spot Map:** `GET /api/audits/{id}/map`, `GET /api/geo/states` (`backend/routers/map.py:15-80`)
4. **Coverage Matrix:** `GET /api/audits/{id}/matrix` (`backend/routers/matrix.py:18-75`)
5. **Heritage Entities Directory & Detail:** `GET /api/entities`, `GET /api/entities/{id}` (`backend/routers/entities.py:25-90`)
6. **Existence-Documentation Gaps:** `GET /api/gaps?collection_id={id}` (`backend/routers/gaps.py:15-50`)
7. **Longitudinal Audit Compare:** `GET /api/compare?audit_a={id}&audit_b={id}` (`backend/routers/compare.py:18-60`)
8. **Preservation Priorities & Curatorial Briefs:** `GET /api/audits/{id}/priorities`, `GET /api/priorities/{id}/brief` (`backend/routers/briefs.py:20-95`)
9. **Atlas & Spatial Inspection:** `GET /api/geo/states`, `GET /api/audits/{id}/map` (`backend/routers/map.py:82-120`)
10. **Image Explorer:** `GET /api/images` (`backend/routers/images.py:15-45`)
11. **Open Data Exports:** `GET /api/export/{id}/csv`, `GET /api/export/{id}/jsonld`, `GET /api/export/{id}/geojson`, `GET /api/audits/{id}/report.pdf` (`backend/routers/exports.py:21-140`)

> [!NOTE]
> **Read-Only Verification:** None of the core discovery features execute `INSERT`, `UPDATE`, or `DELETE`. If the SQLite database is mounted read-only, all 11 core discovery interfaces function with 100% feature parity.

#### B. Write Endpoints (Interactive/Custom User Actions)
Only three endpoints execute database writes:
1. `POST /api/uploads` (`backend/routers/uploads.py:35-120`): Parses user-uploaded CSV file (< 25MB) and seeds an ephemeral audit collection.
2. `POST /api/audits` (`backend/routers/audits.py:40-90`): Triggers a background scoring job for a newly uploaded dataset.
3. `POST /api/sources/{id}/toggle` (`backend/routers/sources.py:45-75`): Toggles the `enabled` boolean flag of a source layer.

#### C. Ephemeral Container Behavior
On Render Free Web Services:
- The container filesystem is ephemeral.
- If a user uploads a custom CSV to audit their own museum, the audit persists while the container is warm.
- If the container spins down after 15 minutes of inactivity or restarts, the filesystem resets to the clean git commit.
- **Outcome:** The canonical National Silence Index dataset (317 fused records, 157 entities, 345 attributions) is permanently preserved because it is baked into the committed git repository. Ephemeral user test uploads gracefully reset without polluting or corrupting production data.

---

## 4. Deployment Risk & Mitigation Matrix

| Risk Scenario | Likelihood | Impact | Built-in Mitigation |
| :--- | :--- | :--- | :--- |
| **Database Corruption / Accidental Deletion** | Critical | Severe | Dedicated pre-deploy backup at `backups/silence_index.pre-deploy.db`. SQLite file is committed to Git. Core routes are read-only. |
| **Render Cold Start Latency (Free Tier)** | High | Low-Medium | Free tier spins down after 15m. First request takes ~45–60s. Next.js displays graceful skeleton states. |
| **Vercel Image Transformation Quota Exhaustion** | High | Medium | `unoptimized: true` configured in `next.config.js`. SVGs and local images are served raw without depleting transformation credits. |
| **CORS Preflight Blockage** | Medium | High | `CORSMiddleware` in `backend/app/main.py` explicitly supports configurable origins via `ALLOWED_ORIGINS`. |
| **Indic Font Rendering Failure** | Low | Medium | Fonts are linked via Google Web Fonts and standard system font fallbacks (`serif`, `sans-serif`) across Hindi, Tamil, and Malayalam. |
| **API Port Hardcoding Failure** | Low | High | Uvicorn start command configured with dynamic `$PORT` argument. |
| **Memory Exhaustion on PDF Export** | Low | Low | ReportLab PDF stream uses streaming `io.BytesIO` buffer (< 5MB memory peak). |

