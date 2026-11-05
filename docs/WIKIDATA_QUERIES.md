# THE SILENCE INDEX — Wikidata SPARQL Queries

All queries target the public Wikidata SPARQL endpoint: `https://query.wikidata.org/sparql`
Licence: **Creative Commons CC0 1.0 Universal Public Domain Dedication**.

---

### Defensive Query Rules & Safeguards
1. **User-Agent**: Every request sends `TheSilenceIndexHarvester/2.0 (Cultural Heritage Research; https://github.com/silentindex)`.
2. **Defensive Limits**: Queries are bounded (`LIMIT 100`) per thematic harvest with standard pagination.
3. **Timeout Handling**: Built-in 30-second server timeout limit; exponential backoff upon 429/504 responses.
4. **Offline Cache Replay**: All retrieved JSON responses are cached under `data/raw/wikidata/<query_name>.json`. Subsequent runs execute offline from cache without external network requests.
5. **Markup Sanitisation**: Strip HTML tags and wiki formatting from label and description fields.

---

### Query 1: Protected Archaeological Monuments of India (ASI & State Protected)
Retrieves monuments located in administrative territories of India with coordinates, image, and ASI monument identifier.

```sparql
SELECT ?item ?itemLabel ?itemDescription ?asi_id ?stateLabel ?coords ?image
WHERE {
  # Instance of monument, archaeological site, or World Heritage Site
  ?item wdt:P31/wdt:P279* wd:Q4989906 . 
  ?item wdt:P17 wd:Q668 . # In India
  
  # State or administrative territorial entity
  OPTIONAL { ?item wdt:P131 ?state . }
  
  # Archaeological Survey of India (ASI) code
  OPTIONAL { ?item wdt:P3573 ?asi_id . }
  
  # Geographic coordinates and representative image
  OPTIONAL { ?item wdt:P625 ?coords . }
  OPTIONAL { ?item wdt:P18 ?image . }

  SERVICE wikibase:label { bd:serviceParam wikibase:language "en,hi". }
}
LIMIT 250
```

---

### Query 2: Traditional Indian Art Forms, Folk Crafts & Textiles
Retrieves living crafts, folk paintings, and textile traditions mapped to their region of origin.

```sparql
SELECT ?item ?itemLabel ?itemDescription ?category ?stateLabel ?image
WHERE {
  # Traditional craft, textile, or folk art
  VALUES ?type { wd:Q207869 wd:Q11019 wd:Q506443 }
  ?item wdt:P31/wdt:P279* ?type .
  ?item wdt:P495 wd:Q668 . # Country of origin: India
  
  OPTIONAL { ?item wdt:P131 ?state . }
  OPTIONAL { ?item wdt:P18 ?image . }

  SERVICE wikibase:label { bd:serviceParam wikibase:language "en,hi". }
}
LIMIT 150
```

---

### Query 3: Intangible Heritage, Traditional Music & Performing Arts
Retrieves classical and folk performance traditions, regional musical instruments, and sacred festivals.

```sparql
SELECT ?item ?itemLabel ?itemDescription ?genre ?stateLabel ?image
WHERE {
  VALUES ?genre { wd:Q2085372 wd:Q34379 wd:Q132311 } # Indian classical dance, musical instrument, festival
  ?item wdt:P31/wdt:P279* ?genre .
  ?item wdt:P495 wd:Q668 . # Origin: India
  
  OPTIONAL { ?item wdt:P131 ?state . }
  OPTIONAL { ?item wdt:P18 ?image . }

  SERVICE wikibase:label { bd:serviceParam wikibase:language "en,hi". }
}
LIMIT 150
```

