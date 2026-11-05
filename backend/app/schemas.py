from typing import Any

from pydantic import BaseModel


class CollectionSummary(BaseModel):
    id: str
    name: str
    kind: str
    description: str | None = None
    created_at: Any
    total_records: int
    art_forms_count: int
    states_count: int
    languages_count: int
    provenance_rate: float
    latest_audit_id: str | None = None
    latest_ccd: float | None = None
    latest_assessability: str | None = None

class ColumnMappingItem(BaseModel):
    source_column: str
    canonical_field: str
    confidence: float
    confirmed: bool = True

class ColumnMappingUpdateRequest(BaseModel):
    mappings: list[ColumnMappingItem]

class UploadValidationResponse(BaseModel):
    upload_id: str
    filename: str
    total_rows: int
    detected_encoding: str
    detected_delimiter: str
    has_header: bool
    warnings: list[str]
    suggested_mappings: list[ColumnMappingItem]
    sample_rows: list[dict[str, Any]]

class AuditStartRequest(BaseModel):
    collection_id: str
    weights: dict[str, float] | None = None

class AuditProgressResponse(BaseModel):
    audit_id: str
    status: str
    stage: str
    percent: int
    message: str | None = None
    error: str | None = None

class FindingResponse(BaseModel):
    id: str
    kind: str
    title: str
    issue: str
    evidence: dict[str, Any]
    why_it_matters: str
    certainty: str
    suggested_action: str
    record_ids: list[str]

class PriorityCardResponse(BaseModel):
    id: str
    slice: dict[str, Any]
    dimension: str
    dimension_name: str
    g: float
    e: float
    b: float
    f: float
    score: float
    band: str
    consultation: str
    next_step: str
    reasons: list[str]

class DuplicateClusterResponse(BaseModel):
    cluster_id: str
    similarity: float
    matched_fields: list[str]
    records: list[dict[str, Any]]

class AuditMatrixCellResponse(BaseModel):
    category_id: str
    category_name: str
    dimension: str
    dimension_name: str
    total_records: int
    applicable: bool
    assessable: bool
    dominant_status: str
    mean_score: float
    status_distribution: dict[str, int]
    responsible_record_ids: list[str]

class AuditReportResponse(BaseModel):
    audit_id: str
    collection: dict[str, Any]
    started_at: str
    finished_at: str | None
    ccd: float
    ccd_interval: list[float]
    assessability: str
    total_records: int
    dimension_summaries: list[dict[str, Any]]
    category_summaries: list[dict[str, Any]]
    state_summaries: list[dict[str, Any]]
    findings: list[FindingResponse]
    priorities: list[PriorityCardResponse]
    duplicates_count: int
    uncertain_classifications_count: int

