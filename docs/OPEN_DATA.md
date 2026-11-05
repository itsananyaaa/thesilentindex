# THE SILENCE INDEX — Open Data, Linked Data & CIDOC CRM Mapping

The Silence Index provides cultural heritage metadata following linked data principles, FAIR data criteria, and international museum ontology mappings.

---

## 1. Linked Data Vocabularies
All entities and records in THE SILENCE INDEX are exposed in **JSON-LD** (`/api/export/{collection_id}/jsonld`) using standard vocabularies:
- **Schema.org** (`https://schema.org/`): `VisualArtwork`, `CreativeWork`, `Place`, `Person`, `ArchiveOrganization`, `DataCatalog`
- **Dublin Core Terms (DCMI)** (`http://purl.org/dc/terms/`): `dcterms:title`, `dcterms:description`, `dcterms:spatial`, `dcterms:creator`, `dcterms:subject`, `dcterms:license`
- **W3C PROV-O** (`http://www.w3.org/ns/prov#`): Tracks `wasDerivedFrom`, provenance levels (`SOURCE`, `NORMALISED`, `INFERRED`), and deterministic scoring algorithms.

---

## 2. CIDOC Conceptual Reference Model (CRM) Mapping
THE SILENCE INDEX schema maps directly onto ISO 21127:2014 (CIDOC CRM v7.1):

| The Silence Index Canonical Field | CIDOC CRM Class / Property | Semantics & Scope Notes |
| :--- | :--- | :--- |
| `id` (Record Identifier) | **E42 Identifier** $\rightarrow$ `P1 is identified by` | Persistent institutional record identifier |
| `title` | **E35 Title** $\rightarrow$ `P102 has title` | Primary recorded title in Latin or Indic script |
| `art_form` | **E55 Type** $\rightarrow$ `P2 has type` | Traditional art form, craft taxonomy, or genre |
| `category_id` | **E55 Type** $\rightarrow$ `P2 has type` | High-level 9 cultural taxonomy category |
| `state` / `place` | **E53 Place** $\rightarrow$ `P7 took place at` / `P27 moved from` | Geographic provenance of creation or historical practice |
| `lat`, `lon` | **E47 Spatial Coordinates** $\rightarrow$ `P168 place is defined by` | WGS84 decimal degree spatial anchor |
| `creator` | **E39 Actor** / **E21 Person** $\rightarrow$ `P14 carried out by` | Named master artisan, scribe, or painter |
| `community` | **E74 Group** $\rightarrow$ `P107 has current or former member` | Traditional practitioner community or guild |
| `materials` | **E57 Material** $\rightarrow$ `P45 consists of` | Medium (e.g. Sikki grass, chlorite schist, mulberry silk) |
| `technique` | **E29 Design or Procedure** $\rightarrow$ `P32 used general technique` | Artisan technique (e.g. cire-perdue casting, double ikat) |
| `period_text` | **E52 Time-Span** $\rightarrow$ `P4 has time-span` | Production era, reign, or registration year |
| `source_institution` | **E74 Group** / **E40 Legal Body** $\rightarrow$ `P50 has current keeper` | Holding museum, archive, or registry |
| `rights_category` | **E30 Right** $\rightarrow$ `P104 is subject to` | Declared intellectual property and licensing category |
| `HeritageEntity` | **E28 Conceptual Object** / **E89 Propositional Object** | The intangible heritage or monument itself |

---

## 3. Bulk Download Formats
All endpoints are publicly accessible and CORS-enabled:
- **JSON-LD**: `GET /api/export/{collection_id}/jsonld`
- **CSV Data Dump**: `GET /api/export/{collection_id}/csv`
- **GeoJSON Choropleth Boundary**: `GET /api/export/{collection_id}/geojson`
- **Harvest Ledger**: `GET /api/sources/ledger.csv`

