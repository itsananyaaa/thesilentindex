# THE SILENCE INDEX — Deployment & Operations Guide

This guide details local setup, containerized deployment, and production cloud hosting options for **THE SILENCE INDEX**.

---

## 1. Local Development Setup

### Prerequisites
- Python 3.11+
- Node.js 18.18+ (tested on Node 20.x)
- Make (optional, for automation)

### Quickstart (3 Commands)
```bash
# 1. Setup virtual environment & dependencies
make setup

# 2. Initialize SQLite database & seed verified 181-object harvest + 150-object synthetic set
make seed

# 3. Run automated unit & golden tests
make test
```

### Running the Development Servers
In two separate terminal tabs:

**Tab 1 (FastAPI Backend):**
```bash
./venv/bin/uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```

**Tab 2 (Next.js Frontend):**
```bash
cd frontend && npm run dev
```

Visit `http://localhost:3000` in your browser.

---

## 2. Docker & Container Deployment

A multi-container setup via Docker Compose provides complete isolation and zero-dependency reproducibility.

### `docker-compose.yml`
```yaml
version: '3.8'

services:
  backend:
    build:
      context: .
      dockerfile: backend/Dockerfile
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=sqlite:///silence_index.db
      - LLM_EXPLAIN=0
      - CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
    volumes:
      - data-volume:/app/data
      - db-volume:/app/db

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:8000
      - PORT=3000
    depends_on:
      - backend

volumes:
  data-volume:
  db-volume:
```

### Build & Run
```bash
docker-compose up --build -d
```

---

## 3. Cloud Deployment Recipes

### Option A: Cloud Run / Fly.io (Dual Microservices)
1. **Backend (FastAPI on Fly.io or Cloud Run):**
   - Deploy container with persistent disk mounted for `silence_index.db` (or attach a managed Postgres database).
   - Set environment variable `CORS_ORIGINS=https://your-frontend.vercel.app`.
2. **Frontend (Next.js on Vercel):**
   - Import `frontend/` directory directly into Vercel.
   - Configure environment variable: `NEXT_PUBLIC_API_URL=https://your-backend.fly.dev`.

### Option B: Single VM (Ubuntu 22.04 LTS with Caddy)
Run both services via systemd or Docker Compose behind Caddy:
```caddyfile
silenceindex.org {
    reverse_proxy /api/* 127.0.0.1:8000
    reverse_proxy * 127.0.0.1:3000
}
```

---

## 4. Production Environment Configuration

| Variable | Default | Purpose |
| :--- | :--- | :--- |
| `DATABASE_URL` | `sqlite:///silence_index.db` | SQLAlchemy connection string |
| `LLM_EXPLAIN` | `0` | Flag to enable AI-worded findings (`1` or `0`) |
| `GEMINI_API_KEY` | *(empty)* | Optional Gemini API key if `LLM_EXPLAIN=1` |
| `NEXT_PUBLIC_API_URL` | `http://127.0.0.1:8000` | Backend endpoint for frontend queries |
| `PORT` | `3000` | Frontend HTTP port |

