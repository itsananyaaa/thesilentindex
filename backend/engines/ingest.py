"""File ingestion, encoding detection, and schema mapping engine.
Handles CSV, JSON arrays, and JSON Lines up to 25 MB.
Validates file integrity and generates transparent column mappings with confidence scores.
"""
import csv
import io
import json
from typing import Any

from rapidfuzz import fuzz

CANONICAL_FIELD_ALIASES = {
    "title": ["title", "object_name", "item_title", "artwork", "name", "subject", "label"],
    "art_form": ["art_form", "artform", "tradition", "genre", "school", "craft_form", "style"],
    "category": ["category", "category_id", "cultural_category", "type", "classification", "medium_type"],
    "state": ["state", "province", "region", "state_name", "territory", "origin_state"],
    "district_place": ["district_place", "place", "district", "city", "town", "locality", "origin_place"],
    "coordinates": ["coordinates", "lat_lon", "latitude_longitude", "lat", "lon", "geo", "coords"],
    "period_date": ["period_date", "period_text", "date", "period", "century", "era", "dating", "dynasty", "year"],
    "language": ["language", "lang", "script", "languages"],
    "materials": ["materials", "material", "medium", "fabric", "composition"],
    "technique": ["technique", "craft_technique", "process", "method", "production_method"],
    "description": ["description", "desc", "details", "summary", "notes", "historical_context", "about"],
    "citation_source": ["citation_source", "citation", "bibliography", "references", "source_reference"],
    "maker_name": ["maker_name", "creator", "artist", "artisan", "author", "painter", "sculptor", "craftsperson"],
    "community": ["community", "community_lineage", "guild", "caste", "clan", "lineage", "workshop"],
    "practitioner_statement": ["practitioner_statement", "artisan_voice", "maker_statement", "practitioner_quote"],
    "narrative_oral": ["narrative_oral", "oral_history", "folklore", "oral_narrative", "song_lyrics", "legend"],
    "narrative_media_url": ["narrative_media_url", "audio_url", "video_url", "oral_media_url", "recording_url"],
    "source_institution": ["source_institution", "institution", "museum", "credit_line", "collection", "holding_institution"],
    "accession_id": ["accession_id", "accession_number", "id", "record_id", "catalog_number", "identifier", "inv_no"],
    "source_url": ["source_url", "url", "source_page", "description_url", "link", "web_link"],
    "provenance_history": ["provenance_history", "provenance", "acquisition_history", "custodial_history"],
    "validated_by": ["validated_by", "community_validation", "consulted_with", "community_notes", "advisory_council"],
    "condition_notes": ["condition_notes", "condition", "preservation_notes", "conservation_status"],
    "rights_license": ["rights_license", "rights", "license", "rights_declared", "licence", "copyright"],
    "access_url": ["access_url", "download_url", "digital_access_url", "open_access_link"],
    "image_url": ["image_url", "image", "thumbnail_url", "photo_url", "img_url"]
}

MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024 # 25 MB

def detect_encoding_and_delimiter(raw_bytes: bytes) -> tuple[str, str, bool, list[str]]:
    """Detect text encoding, delimiter, BOM presence, and potential mojibake."""
    warnings = []
    has_bom = False

    # Check BOM
    if raw_bytes.startswith(b"\xef\xbb\xbf"):
        has_bom = True
        encoding = "utf-8-sig"
        warnings.append("UTF-8 Byte Order Mark (BOM) detected and safely stripped.")
    else:
        # Try UTF-8
        try:
            raw_bytes.decode("utf-8")
            encoding = "utf-8"
        except UnicodeDecodeError:
            try:
                raw_bytes.decode("latin-1")
                encoding = "latin-1"
                warnings.append("Non-UTF8 characters detected; read with Latin-1 encoding fallback.")
            except Exception:
                encoding = "utf-8"
                warnings.append("Encoding decoding errors encountered; replaced invalid bytes.")

    text_sample = raw_bytes[:16384].decode(encoding, errors="replace")

    # Delimiter sniffing for tabular text
    delimiters = [",", ";", "\t", "|"]
    counts = {d: text_sample.count(d) for d in delimiters}
    best_delim = max(counts, key=counts.get)
    if counts[best_delim] == 0:
        best_delim = ","

    if best_delim == ";":
        warnings.append("Semicolon delimiter detected and configured.")
    elif best_delim == "\t":
        warnings.append("Tab delimiter detected and configured.")

    return encoding, best_delim, has_bom, warnings

def parse_and_validate_file(raw_bytes: bytes, filename: str) -> dict[str, Any]:
    """Validate uploaded file format and extract structured rows."""
    if len(raw_bytes) > MAX_FILE_SIZE_BYTES:
        raise ValueError(f"File size exceeds 25 MB limit ({len(raw_bytes) / 1024 / 1024:.1f} MB).")

    if len(raw_bytes.strip()) == 0:
        raise ValueError("The uploaded file is empty.")

    # Check for binary file signatures (e.g. zip, elf, pdf)
    if raw_bytes.startswith(b"%PDF") or raw_bytes.startswith(b"PK\x03\x04") or b"\x00" in raw_bytes[:512]:
        raise ValueError("Binary or unsupported file format. Please upload CSV, JSON array, or JSON Lines.")

    encoding, delimiter, has_bom, warnings = detect_encoding_and_delimiter(raw_bytes)
    text_content = raw_bytes.decode(encoding, errors="replace")

    rows = []
    # Try JSON / JSONL
    fname_lower = filename.lower()
    if fname_lower.endswith(".json") or fname_lower.endswith(".jsonl"):
        try:
            # Try JSON array first
            parsed_json = json.loads(text_content)
            if isinstance(parsed_json, list):
                rows = parsed_json
            elif isinstance(parsed_json, dict) and "records" in parsed_json:
                rows = parsed_json["records"]
            else:
                rows = [parsed_json]
        except json.JSONDecodeError:
            # Try JSON Lines
            lines = text_content.strip().split("\n")
            for line in lines:
                if line.strip():
                    try:
                        rows.append(json.loads(line))
                    except json.JSONDecodeError:
                        pass
    else:
        # Default CSV parsing
        try:
            csv_reader = csv.DictReader(io.StringIO(text_content), delimiter=delimiter)
            rows = list(csv_reader)
        except Exception as e:
            raise ValueError(f"Failed to parse CSV file: {e!s}")

    if not rows:
        raise ValueError("No recognizable rows or records found in the uploaded file.")

    # Validate recognizable columns
    sample_row = rows[0]
    headers = list(sample_row.keys()) if isinstance(sample_row, dict) else []
    if not headers or all(h is None or str(h).strip() == "" for h in headers):
        raise ValueError("Uploaded file has no recognizable header column names.")

    suggested_mappings = suggest_column_mappings(headers)

    return {
        "total_rows": len(rows),
        "encoding": encoding,
        "delimiter": delimiter,
        "has_bom": has_bom,
        "warnings": warnings,
        "headers": headers,
        "suggested_mappings": suggested_mappings,
        "sample_rows": rows[:5],
        "all_rows": rows
    }

def suggest_column_mappings(headers: list[str]) -> list[dict[str, Any]]:
    """Map uploaded column headers to canonical fields with confidence scoring."""
    mappings = []
    for h in headers:
        if not h:
            continue
        clean_h = str(h).strip().lower().replace(" ", "_").replace("-", "_")

        best_canon = None
        best_conf = 0.0

        for canon_field, aliases in CANONICAL_FIELD_ALIASES.items():
            if clean_h == canon_field:
                best_canon = canon_field
                best_conf = 1.0
                break
            for alias in aliases:
                if clean_h == alias:
                    best_canon = canon_field
                    best_conf = 0.95
                    break
                # Substring / token containment match
                if alias in clean_h or clean_h in alias:
                    sub_conf = 0.85
                    if sub_conf > best_conf:
                        best_conf = sub_conf
                        best_canon = canon_field
                # Fuzzy token match
                fuzz_ratio = fuzz.token_set_ratio(clean_h, alias) / 100.0
                if fuzz_ratio > 0.80 and fuzz_ratio > best_conf:
                    best_conf = fuzz_ratio
                    best_canon = canon_field

        if best_canon and best_conf >= 0.70:
            mappings.append({
                "source_column": h,
                "canonical_field": best_canon,
                "confidence": round(best_conf, 2),
                "confirmed": True
            })
        else:
            # Leave unmapped or low confidence
            mappings.append({
                "source_column": h,
                "canonical_field": best_canon or "unmapped",
                "confidence": round(best_conf, 2) if best_canon else 0.0,
                "confirmed": False
            })

    return mappings
