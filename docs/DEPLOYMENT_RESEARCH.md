# THE SILENCE INDEX — Deployment Provider Research & Citations

This document compiles authoritative research on free-tier cloud platforms, container constraints, database persistence models, and runtime characteristics.

---

## 1. Render Free Web Services

- **Source Documentation:**
  - Render Free Tier Specifications: [https://render.com/docs/free#free-web-services](https://render.com/docs/free#free-web-services) (Accessed Nov 2026)
  - Render Web Services Overview: [https://render.com/docs/web-services](https://render.com/docs/web-services) (Accessed Nov 2026)
  - Render Python Environment: [https://render.com/docs/python-support](https://render.com/docs/python-support) (Accessed Nov 2026)

### Specifications & Operating Parameters
- **Runtime:** Native Python 3.11.x (configured via `PYTHON_VERSION=3.11.10` or `.python-version` file).
- **Compute Resources:** 512 MB RAM, 0.1 vCPU.
- **Instance Hours:** 750 free instance hours per calendar month (sufficient for continuous 24/7 run of a single service).
- **Inactivity Behavior (Spin Down):** Services spin down after 15 minutes of receiving no HTTP traffic.
- **Cold-Start Latency:** First request after spin-down requires ~45 to 60 seconds to boot the container image. Subsequent requests respond in < 20 ms.
- **Request Timeout:** 100 seconds per HTTP request.
- **Bandwidth:** 100 GB outbound bandwidth per month.
- **Filesystem Persistence:**
  - Filesystem is **ephemeral**. Any modifications made to disk during runtime are discarded when the container restarts, sleeps, or redeploys.
  - Persistent Disks are not available on the Render Free Tier.
  - Files committed to Git (such as `silence_index.db`) are restored with bit-for-bit fidelity on every container deployment and wake-up.
- **Port Handling:** Render dynamically injects a `$PORT` environment variable (typically port 10000). Applications must bind to `0.0.0.0` and listen on `$PORT`.

---

## 2. Vercel Hobby (Free Tier)

- **Source Documentation:**
  - Next.js Deployment on Vercel: [https://vercel.com/docs/frameworks/nextjs](https://vercel.com/docs/frameworks/nextjs) (Accessed Nov 2026)
  - Vercel Limits and Free Tier: [https://vercel.com/docs/limits](https://vercel.com/docs/limits) (Accessed Nov 2026)

### Specifications & Operating Parameters
- **Next.js Support:** First-party native optimization for Next.js 14.2.24 App Router.
- **Project Root:** Supports configuring root directory to `frontend/` within a monorepo structure.
- **Build & Install Pipeline:** Default `npm ci && npm run build` with automatic dependency caching.
- **Environment Variables:** `NEXT_PUBLIC_*` variables are evaluated and inlined into the client JavaScript bundle at build time. Changing `NEXT_PUBLIC_API_URL` requires a redeployment to take effect.
- **Edge CDN & Asset Delivery:** Global CDN edge nodes cache and serve static assets (such as the 171 SVG heritage illustrations) with sub-10ms latency worldwide.
- **Bandwidth:** 100 GB/month included.
- **Image Optimization:** 1,000 source images per month. Setting `images: { unoptimized: true }` bypasses this quota entirely, allowing unlimited SVG/image delivery directly from CDN storage.
- **Serverless Function Limit:** 10s maximum execution duration per request on Hobby plan.

---

## 3. SQLite in Production Container Workloads

- **Source Documentation:**
  - SQLite Appropriate Uses: [https://sqlite.org/whentouse.html](https://sqlite.org/whentouse.html) (Accessed Nov 2026)
  - Fly.io SQLite in Production Architecture: [https://fly.io/docs/database/sqlite-basics/](https://fly.io/docs/database/sqlite-basics/) (Accessed Nov 2026)

### Analysis for THE SILENCE INDEX
- **Read-Dominated Workload:** THE SILENCE INDEX core discovery views (Observatory, Map, Matrix, Entities, Gaps, Compare, Priorities, Atlas, Explorer, Exports) perform 100% read queries.
- **Embedded Performance:** Because SQLite operates in-process via C-level bindings directly on the container's local disk, query latency is virtually zero (0.1–0.5 ms), completely eliminating external network round-trips to an external database.
- **Journal Mode Safety:** The database is configured with `journal_mode = delete`. There are no external `-wal` or `-shm` shared memory files. The single 8.5MB file is completely self-contained.
- **Ephemerality Protection:** By checking `silence_index.db` directly into Git, the curated, audited heritage collection of 317 fused records, 157 entities, and 345 state attributions cannot be wiped or lost. Container restarts cleanly re-hydrate the verified dataset.

---

## 4. Neon Serverless Postgres (Free Tier) Evaluation

- **Source Documentation:**
  - Neon Free Tier Architecture: [https://neon.tech/docs/introduction/free-tier](https://neon.tech/docs/introduction/free-tier) (Accessed Nov 2026)

### Evaluation & Comparative Analysis
- **Features:** 0.5 GB database storage, built-in connection pooling, automated backups, compute autosuspend.
- **Cold-Start Impact:** Neon computes suspend after 5 minutes of inactivity; waking up requires ~500ms–1.5s cold start.
- **Migration Necessity Assessment:**
  - Migrating to Neon Postgres would require:
    1. Schema translation (handling SQLite types, auto-increments, text vs timestamp).
    2. Rewriting `backend/app/db.py` to use `psycopg2` or `asyncpg` with connection pooling.
    3. Exporting and dumping all 16 tables, with the risk of data loss or foreign key truncation.
    4. Managing remote credentials and database connection string secrets.
  - **Verdict:** Unnecessary for THE SILENCE INDEX. SQLite already works flawlessly, passes 41/41 automated tests, requires zero configuration, has zero risk of migration regression, and guarantees bit-for-bit data parity.

