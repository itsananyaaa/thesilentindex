
import pytest

from backend.engines.ingest import parse_and_validate_file, suggest_column_mappings


def test_empty_file_rejected():
    with pytest.raises(ValueError, match="empty"):
        parse_and_validate_file(b"", "empty.csv")

def test_binary_file_rejected():
    with pytest.raises(ValueError, match="Binary or unsupported"):
        parse_and_validate_file(b"%PDF-1.4 binary data", "doc.pdf")

def test_bom_detected_and_handled():
    bom_csv = "\ufefftitle,state,period\nMadhubani,Bihar,1920\n".encode("utf-8")
    res = parse_and_validate_file(bom_csv, "bom.csv")
    assert res["has_bom"] is True
    assert res["total_rows"] == 1
    assert "BOM" in res["warnings"][0]

def test_semicolon_delimiter():
    semi_csv = b"title;state;category\nChola Bronze;Tamil Nadu;sculpture_material\n"
    res = parse_and_validate_file(semi_csv, "semi.csv")
    assert res["delimiter"] == ";"
    assert res["total_rows"] == 1
    assert res["headers"] == ["title", "state", "category"]

def test_json_lines_parsing():
    jsonl_data = b'{"title": "Pahari Painting", "state": "Himachal Pradesh"}\n{"title": "Pattachitra", "state": "Odisha"}\n'
    res = parse_and_validate_file(jsonl_data, "data.jsonl")
    assert res["total_rows"] == 2
    assert "title" in res["headers"]

def test_latin_encoded_file():
    latin_text = "title,description\nObjet d'art,Très ancien\n".encode("latin-1")
    res = parse_and_validate_file(latin_text, "french.csv")
    assert res["total_rows"] == 1

def test_suggest_column_mappings():
    headers = ["artwork_name", "origin_state", "craft_technique", "holding_institution", "unknown_col"]
    mappings = suggest_column_mappings(headers)
    mapping_dict = {m["source_column"]: m["canonical_field"] for m in mappings}
    assert mapping_dict["artwork_name"] == "title"
    assert mapping_dict["origin_state"] == "state"
    assert mapping_dict["craft_technique"] == "technique"
    assert mapping_dict["holding_institution"] == "source_institution"

