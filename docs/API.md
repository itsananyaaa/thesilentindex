# THE SILENCE INDEX — REST API Reference

The Silence Index backend is a high-performance Python 3.11 FastAPI service providing deterministic cultural collection auditing, Cultural Coverage Debt (CCD) computation, provenance tracking, and preservation priority scoring.

- **Base URL:** `http://127.0.0.1:8000` (Direct) or `http://localhost:3000/api` (Next.js Proxy)
- **Interactive OpenAPI Documentation:** `http://127.0.0.1:8000/docs`
- **ReDoc Documentation:** `http://127.0.0.1:8000/redoc`

---

## 1. Collections

### `GET /api/collections`
Returns a list of all registered cultural collections in the database with their record counts and latest audit status.

**Response Example (200 OK):**
```json
[
  {
    "id": "COLL-REAL-001",
    "name": "Wikimedia Commons Indic Heritage Harvest",
    "institution": "Wikimedia Commons Cultural Heritage Initiative",
    "description": "181 authentic cultural heritage objects spanning Indian temple architecture, bronzes, textiles, manuscripts, and folk crafts.",
    "record_count": 181,
    "latest_audit_id": "AUDIT-SAMPLE-REAL-001-INIT",
    "created_at": "2026-11-04T23:59:12"
  },
  {
    "id": "COLL-SYNTH-002",
    "name": "Regional Heritage Museum of Eastern India",
    "institution": "State Cultural Directorate (Synthetic Benchmark)",
    "description": "150 catalogued records seeded with real-world metadata flaws: English-only cataloguing, duplicate accessions, missing maker credits, and geographic discrepancies.",
    "record_count": 150,
    "latest_audit_id": "AUDIT-SAMPLE-SYNTH-002-INIT",
    "created_at": "2026-11-04T23:59:15"
  }
]
```

### `GET /api/collections/{id}`
Returns metadata, statistics, and audit history for a specific collection.

---

## 2. Audits & Analytical Metrics

### `GET /api/audits/{id}`
Retrieves complete audit summary, collection-wide Cultural Coverage Debt (CCD), bootstrap 90% confidence intervals, and dimensional debt breakdown.

**Response Example (200 OK):**
```json
{
  "audit_id": "AUDIT-SAMPLE-REAL-001-INIT",
  "collection_id": "COLL-REAL-001",
  "collection_name": "Wikimedia Commons Indic Heritage Harvest",
  "record_count": 181,
  "ccd": 33.93,
  "confidence_interval_90": [31.52, 36.41],
  "assessable_dimensions": 7,
  "total_dimensions": 10,
  "dimensional_debts": {
    "visual_documentation": 0.05,
    "historical_context": 0.28,
    "original_language": 0.44,
    "geographic_provenance": 0.18,
    "materials_techniques": 0.35,
    "practitioner_perspective": 0.82,
    "oral_histories": 0.90,
    "source_attribution": 0.02,
    "community_validation": null,
    "preservation_accessibility": 0.15
  },
  "created_at": "2026-11-04T23:59:20"
}
```

### `GET /api/audits/{id}/kpi`
Returns key performance metrics designed for high-level museum directors and curators:
- Total records audited
- Collection CCD with uncertainty interval
- Proportion of records with original Indic script documentation
- Provenance integrity score
- Open access ratio

### `GET /api/audits/{id}/matrix`
Returns the Category × Dimension coverage matrix.
- Slices collection records across 9 heritage categories and 10 documentation dimensions.
- Evaluates each cell to one of the 4 states: `documented`, `partial`, `undocumented`, `not_assessable`, or `not_applicable`.
- Returns cell record IDs for instantaneous drill-down inspection.

### `GET /api/audits/{id}/map`
Returns state-level audit metrics for the Blind-Spot Choropleth Map:
- Record count per Indian state/UT
- State-level CCD
- State-level assessability ratio
- Distinct categories represented in that state

### `GET /api/audits/{id}/priorities`
Computes preservation documentation priority cards using the deterministic formula:
$$\text{Priority} = 100 \times (0.40 \cdot G + 0.25 \cdot E + 0.20 \cdot B + 0.15 \cdot F)$$

**Parameters:**
- `weights` (optional query string): Custom weights in format `g=0.4,e=0.25,b=0.2,f=0.15`
- `category` (optional filter)
- `state` (optional filter)

**Response Item Example:**
```json
{
  "gap_id": "GAP-REAL-TEXTILES-PRACTITIONER",
  "slice_category": "Textiles & Weaving",
  "slice_state": "Tamil Nadu",
  "dimension": "practitioner_perspective",
  "dimension_label": "Practitioner or Artisan Perspective",
  "gap_magnitude": 0.88,
  "evidence_confidence": 0.82,
  "breadth": 0.14,
  "feasibility": 0.70,
  "priority_score": 78.4,
  "priority_band": "High Investigation Priority",
  "consultation": "required",
  "recommended_step": "Consult the relevant weaver communities or guilds (e.g., Kanchipuram master weavers) before any documentation or field interview.",
  "dataset_evidence": "16 textile records documented in Tamil Nadu lack master weaver names, lineage details, or artisan statements."
}
```

### `GET /api/audits/{id}/duplicates`
Returns clusters of near-duplicate or identical records identified via token set similarity and visual hash analysis, allowing curators to deduplicate accessions without deleting underlying records.

### `GET /api/audits/{id}/report.csv`
Streams a complete, RFC 4180-compliant CSV report containing metadata headers, dimensional debt metrics, category breakdown, and priority actions.

### `GET /api/audits/{id}/report.pdf`
Generates a downloadable, print-ready PDF silence audit report containing executive summaries, KPI tables, and priority roadmaps.

---

## 3. Records & Provenance

### `GET /api/records`
Lists collection records with support for comprehensive filtering, pagination, and sorting.

**Query Parameters:**
- `collection_id` (string): Filter by collection
- `state` (string): Filter by state
- `category` (string): Filter by heritage category
- `status_{dimension}` (string): Filter by dimensional status (`documented`, `partial`, `undocumented`)
- `search` (string): Full-text search across titles, descriptions, and accession numbers
- `limit` (int, default 50): Number of records per page
- `offset` (int, default 0): Pagination offset

### `GET /api/records/{id}`
Returns complete catalog details for a single cultural record:
- Source metadata (title, original description, accession ID, institution, date)
- Normalised fields (category, state, district, language script, period)
- 10-dimension rubric scores and deterministic explanations
- Declared rights and normalized licence category
- Image URL and resolution

### `GET /api/records/{id}/provenance`
Returns immutable audit trail of how fields were established:
```json
[
  {
    "field": "title",
    "value": "Nataraja Bronze from Thanjavur",
    "provenance": "SOURCE",
    "confidence": 1.0,
    "timestamp": "2026-11-04T23:59:12"
  },
  {
    "field": "state",
    "value": "Tamil Nadu",
    "provenance": "NORMALISED",
    "confidence": 0.95,
    "method": "Gazetteer lookup via Thanjavur district",
    "timestamp": "2026-11-04T23:59:15"
  },
  {
    "field": "category",
    "value": "Sculpture & Iconography",
    "provenance": "INFERRED",
    "confidence": 0.88,
    "method": "Keyword taxonomy classification: 'Bronze', 'Nataraja'",
    "timestamp": "2026-11-04T23:59:16"
  }
]
```

---

## 4. Ingestion & Audit Wizard

### `POST /api/uploads/validate`
Uploads a user-supplied CSV or JSON dataset for immediate structural validation.
- Checks file integrity, encoding (UTF-8), non-empty rows.
- Returns column list and suggested schema mappings.

### `POST /api/uploads/map`
Accepts user-confirmed column mappings between uploaded columns and the canonical 10-dimension schema.

### `POST /api/audits/run`
Executes an asynchronous or synchronous audit run on the uploaded dataset:
1. Ingests raw rows into immutable storage (`SOURCE`).
2. Normalises dates, geography, categories, and scripts.
3. Computes 10-dimension rubric scores.
4. Calculates Cultural Coverage Debt with 1,000 bootstrap resamples.
5. Identifies duplicate clusters and geographical contradictions.
6. Returns completed `audit_id`.

---

## 5. Images & Rights Enforcement

### `GET /api/images/{record_id}`
Returns high-resolution image metadata, declared rights string, and normalized rights category (`CC0`, `PDM`, `CC_BY`, `CC_BY_SA`, `IN_COPYRIGHT`, `UNKNOWN`).

### `GET /api/images/{record_id}/download`
Gated image asset download:
- Returns binary stream if licence is `CC0`, `PDM`, `CC_BY`, or `CC_BY_SA`.
- Returns **HTTP 403 Forbidden** with message `"Asset rights are declared as restricted or unknown; direct download is disabled to respect cultural and intellectual property"` if the licence is not verified open access.

