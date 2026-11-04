from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class CollectionSummary(BaseModel):
    id: str
    name: str
    kind: str
    description: Optional[str] = None
    created_at: Any
    total_records: int
    art_forms_count: int
    states_count: int
    languages_count: int
    provenance_rate: float
    latest_audit_id: Optional[str] = None
    latest_ccd: Optional[float] = None
    latest_assessability: Optional[str] = None

class ColumnMappingItem(BaseModel):
    source_column: str
    canonical_field: str
    confidence: float
    confirmed: bool = True

class ColumnMappingUpdateRequest(BaseModel):
    mappings: List[ColumnMappingItem]

class UploadValidationResponse(BaseModel):
    upload_id: str
    filename: str
    total_rows: int
    detected_encoding: str
    detected_delimiter: str
    has_header: bool
    warnings: List[str]
    suggested_mappings: List[ColumnMappingItem]
    sample_rows: List[Dict[str, Any]]

class AuditStartRequest(BaseModel):
    collection_id: str
    weights: Optional[Dict[str, float]] = None

class AuditProgressResponse(BaseModel):
    audit_id: str
    status: str
    stage: str
    percent: int
    message: Optional[str] = None
    error: Optional[str] = None

class FindingResponse(BaseModel):
    id: str
    kind: str
    title: str
    issue: str
    evidence: Dict[str, Any]
    why_it_matters: str
    certainty: str
    suggested_action: str
    record_ids: List[str]

class PriorityCardResponse(BaseModel):
    id: str
    slice: Dict[str, Any]
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
    reasons: List[str]

class DuplicateClusterResponse(BaseModel):
    cluster_id: str
    similarity: float
    matched_fields: List[str]
    records: List[Dict[str, Any]]

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
    status_distribution: Dict[str, int]
    responsible_record_ids: List[str]

class AuditReportResponse(BaseModel):
    audit_id: str
    collection: Dict[str, Any]
    started_at: str
    finished_at: Optional[str]
    ccd: float
    ccd_interval: List[float]
    assessability: str
    total_records: int
    dimension_summaries: List[Dict[str, Any]]
    category_summaries: List[Dict[str, Any]]
    state_summaries: List[Dict[str, Any]]
    findings: List[FindingResponse]
    priorities: List[PriorityCardResponse]
    duplicates_count: int
    uncertain_classifications_count: int

