# THE SILENCE INDEX

<div align="center">

```
  ____ ___ _     _____ _   _  ____ _____   ___ _   _ ____  _______  __
 / ___|_ _| |   | ____| \ | |/ ___| ____| |_ _| \ | |  _ \| ____\ \/ /
 \___ \| || |   |  _| |  \| | |   |  _|    | ||  \| | | | |  _|  \  / 
  ___) | || |___| |___| |\  | |___| |___   | || |\  | |_| | |___ /  \ 
 |____/___|_____|_____|_| \_|\____|_____| |___|_| \_|____/|_____/_/\_\
```

### *Because what is missing from history matters too.*

**A Museum-Grade Cultural Collection Auditing & Intelligence Platform for Indian Heritage**

[![FastAPI](https://img.shields.io/badge/FastAPI-0.110.0-009688?style=flat&logo=fastapi)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-14.2.24-black?style=flat&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat&logo=typescript)](https://www.typescriptlang.org)
[![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=flat&logo=python)](https://python.org)
[![Tests](https://img.shields.io/badge/Tests-30%20Passing-brightgreen?style=flat)]()
[![Licence](https://img.shields.io/badge/Licence-MIT-amber?style=flat)]()

</div>

---

## 🏛️ What is The Silence Index?

**The Silence Index** is an intelligence platform for curators, digital humanists, and cultural institutions. It analyses museum and archival collection metadata to uncover which aspects of Indian heritage are **documented**, **partially documented**, **undocumented in the analysed collection**, or **impossible to assess** — and transforms those structural absences into transparent, consent-aware preservation priorities.

It is **not** a chatbot, a generic dashboard, or a website of cultural trivia. It is a rigorous audit instrument with a museum-grade visual identity inspired by traditional Indian architectural and decorative arts.

---

## ⚖️ Non-Negotiable Axioms & Cultural Ethics

1. **Absence is Never Proof of Less Heritage:** The absence of a record in a collection never implies that a tradition, region, or community has less heritage. All system diagnostic messages explicitly state *"not documented in the analysed collection"*.
2. **Completeness $\neq$ Cultural Value:** Cultural Coverage Debt (CCD) measures metadata thoroughness. The system **never** ranks traditions or communities by importance or artistic worth.
3. **No Invented Data:** Every statistic, debt score, and chart is computed deterministically from real loaded records with full click-through traceability.
4. **Immutable Provenance:** Source records are never altered. Normalised and inferred fields are logged separately with an immutable audit trail (`SOURCE` · `NORMALISED` · `INFERRED`).
5. **Deterministic Classification First:** Core classification uses rules and authoritative taxonomies. Generative AI is disabled by default; when enabled, it only words already-computed findings and is explicitly labelled `AI-worded`.
6. **Rights are Declared, Not Verified:** Display rights exactly as declared by institutions. Binary media download is strictly enabled **only** for verified open-access licences (`CC0`, `PDM`, `CC_BY`, `CC_BY_SA`). All others are view-only with direct download blocked (HTTP 403).
7. **Consent First:** Recommendations touching practitioner knowledge, oral traditions, ritual practices, or sacred items require community consultation before any documentation begins. The software never speaks for communities or auto-assigns Traditional Knowledge (TK) labels.

---

## 🎨 Visual Identity & Aesthetic System

Inspired by traditional Indian craftsmanship, storefront signage (*MAHADI* henna aesthetic), and monument architecture:
- **Palette:** Deep oxblood (`#2E1013`, `#4A1C20`), henna brick (`#6B2F27`), antique olive (`#3F4220`), burnished copper (`#B0673A`), illuminated gold (`#C8A24A`), and warm parchment cream (`#F6EEDB`, `#D9C8A4`).
- **Original SVG Ornaments:** Jali lattice patterns (`JaliLattice.tsx`), corner filigree brackets (`CornerFiligree.tsx`), and ornamental border bands (`OrnamentalBand.tsx`).
- **Accessible 4-State Indicators:** High-contrast text labels paired with tactile SVG patterns (`solid-olive`, `diagonal-stripe`, `copper-hatch`, `dotted-grey`), fully readable in greyscale or for colour-blind users.

---

## 📐 Mathematical Framework

### 1. Ten Deterministic Documentation Dimensions
1. **Visual Documentation:** Image presence, technical metadata, multiple views, declared rights.
2. **Historical Context:** Period/dynasty dating, detailed narrative ($\ge 200$ chars), bibliographic citations.
3. **Original-Language Documentation:** Heuristic detection of indigenous Indic scripts (Devanagari, Tamil, Bengali, Telugu, Kannada, Malayalam, Odia, Gurmukhi, Gujarati, Perso-Arabic).
4. **Geographic Provenance:** State, district/site, gazetteer coordinates; diagnostic alert on contradictory geography.
5. **Materials and Techniques:** Base material and specific fabrication method.
6. **Practitioner Perspective:** Named artisan, workshop/lineage/gharana, maker statement.
7. **Oral Histories & Narratives:** Audio/video recordings, folklore narratives, living memory.
8. **Source Attribution:** Repository, accession ID, catalog link, ownership provenance chain.
9. **Community Validation:** Assessable only if community fields exist in dataset; defaults to *Not Assessable* otherwise.
10. **Preservation & Accessibility:** Physical condition report, open licence, public repository URL.

### 2. Cultural Coverage Debt (CCD)
$$\text{CCD} = 100 \times \frac{\sum_{d \in \mathcal{A}} w_d \cdot (1 - C_d)}{\sum_{d \in \mathcal{A}} w_d}$$
- Reports uncertainty alongside score: *"CCD 33.9 on 7 of 10 dimensions assessable"*.
- Computes **90% Bootstrap Confidence Intervals** (1,000 resamples).
- Suppresses scores for slices with $<5$ records to prevent statistical distortion.

### 3. Preservation Priority Engine
$$\text{Priority} = 100 \times (0.40 \cdot G + 0.25 \cdot E + 0.20 \cdot B + 0.15 \cdot F)$$
- **$G$:** Gap magnitude (dimensional debt)
- **$E$:** Evidence confidence
- **$B$:** Collection breadth
- **$F$:** Feasibility (desk research vs. field work)
- **Consent Routing:** Flags sensitive records with **"Consultation Required"** prior to documentation.

---

## ⚡ Quickstart

### Prerequisites
- Python 3.11+
- Node.js 18.18+

```bash
# 1. Clone repository
git clone https://github.com/your-org/silence-index.git
cd silence-index

# 2. Setup environment and install dependencies
make setup

# 3. Seed real harvest (181 Wikimedia records) & synthetic benchmark (150 records)
make seed

# 4. Run automated test suite (30 unit, golden, and integration tests)
make test
```

### Launch Development Servers

```bash
# Terminal 1: FastAPI Backend (http://127.0.0.1:8000)
make run-backend

# Terminal 2: Next.js Frontend (http://localhost:3000)
make run-frontend
```

---

## 🧭 Application Modules & Routes

| Route | Module | Purpose |
| :--- | :--- | :--- |
| `/` | **The Porch** | Hero overview, real-time KPI metrics, 6-step workflow, urgent preservation leads |
| `/observatory` | **Collection Observatory** | KPI summary, 10-dimension completeness distribution, full-text filtered table |
| `/matrix` | **Coverage Matrix** | Category × Dimension interactive grid with cell record drill-down drawer |
| `/map` | **Blind-Spot Map** | Interactive India choropleth map with zero-record hatched zones & state drawer |
| `/auditor` | **Collection Auditor** | 5-step upload wizard (upload $\to$ validate $\to$ column map $\to$ audit $\to$ summary) |
| `/priorities` | **Preservation Priorities** | Prioritised action cards with consent routing and interactive weight sliders |
| `/atlas` | **Cultural Atlas** | Masonry image gallery with circular dimensional completeness meters |
| `/explorer` | **Image Explorer** | High-res pan/zoom lightbox with declared rights banners & gated downloads |
| `/records/[id]` | **Record Dossier** | Museum catalogue layout, dimensional breakdown, immutable field provenance |
| `/reports/[auditId]` | **The Silence Report** | Comprehensive audit report with duplicate clusters, contradiction alerts, PDF/CSV export |
| `/method` | **Methodology** | Mathematical formulas, scoring rubrics, and bootstrap specifications |
| `/ethics` | **CARE & Ethics** | CARE principles, consent protocols, and Traditional Knowledge ethics |
| `/credits` | **Credits & Sources** | Attribution registry, open-access image citations, and acknowledgments |

---

## 🧪 Testing & Verification

The platform includes a comprehensive test suite:
- **Unit & Golden Value Tests:** Deterministic verification of rubric scoring, script detection, rights parsing, and CCD bootstrap intervals.
- **15-Step Playwright Journey:** End-to-end headless browser verification capturing visual proof for every major screen.

```bash
# Run pytest test suite
make test

# Run 15-step Playwright visual verification
make journey
```

---

## 📚 Documentation
- [REST API Specification](file:///Users/ananyabiju/Desktop/silentindex/docs/API.md)
- [Methodology & Mathematics](file:///Users/ananyabiju/Desktop/silentindex/docs/METHOD.md)
- [System Boundaries & Limitations](file:///Users/ananyabiju/Desktop/silentindex/docs/LIMITATIONS.md)
- [Deployment & Operations Guide](file:///Users/ananyabiju/Desktop/silentindex/docs/DEPLOY.md)

---

## 📄 Licence
Developed for the **Art • Culture • Heritage** Hackathon. Released under the MIT Licence.

