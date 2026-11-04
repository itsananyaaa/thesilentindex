from datetime import datetime, timezone
from sqlalchemy import (
    Column, String, Integer, Float, Boolean, Text, DateTime, JSON, ForeignKey, Enum as SqlEnum, Index
)
from sqlalchemy.orm import relationship
from backend.app.db import Base

class Collection(Base):
    __tablename__ = "collections"

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    kind = Column(String, nullable=False) # sample_real | sample_synthetic | upload
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    source_notes = Column(Text, nullable=True)

    records = relationship("Record", back_populates="collection", cascade="all, delete-orphan")
    audits = relationship("Audit", back_populates="collection", cascade="all, delete-orphan")
    mappings = relationship("ColumnMapping", back_populates="collection", cascade="all, delete-orphan")


class Record(Base):
    __tablename__ = "records"

    id = Column(String, primary_key=True)
    collection_id = Column(String, ForeignKey("collections.id"), nullable=False, index=True)
    row_index = Column(Integer, nullable=False)
    original_json = Column(JSON, nullable=False) # Immutable raw data
    
    # Normalized fields
    title = Column(String, nullable=False, index=True)
    art_form = Column(String, nullable=True, index=True)
    category_id = Column(String, nullable=True, index=True)
    state = Column(String, nullable=True, index=True)
    place = Column(String, nullable=True)
    lat = Column(Float, nullable=True)
    lon = Column(Float, nullable=True)
    language = Column(String, nullable=True)
    period_text = Column(String, nullable=True)
    materials = Column(Text, nullable=True)
    technique = Column(Text, nullable=True)
    description = Column(Text, nullable=True)
    creator = Column(String, nullable=True)
    community = Column(String, nullable=True)
    source_institution = Column(String, nullable=True, index=True)
    accession_id = Column(String, nullable=True)
    source_url = Column(String, nullable=True)
    image_id = Column(String, nullable=True)
    image_url = Column(String, nullable=True)
    thumbnail_url = Column(String, nullable=True)
    rights_declared = Column(String, nullable=True)
    rights_category = Column(String, nullable=True)
    download_allowed = Column(Boolean, default=False)
    is_synthetic = Column(Boolean, default=False)

    collection = relationship("Collection", back_populates="records")
    provenances = relationship("FieldProvenance", back_populates="record", cascade="all, delete-orphan")
    inferences = relationship("Inference", back_populates="record", cascade="all, delete-orphan")
    dimension_statuses = relationship("RecordDimensionStatus", back_populates="record", cascade="all, delete-orphan")

    __table_args__ = (
        Index("idx_records_col_cat", "collection_id", "category_id"),
        Index("idx_records_col_state", "collection_id", "state"),
    )


class FieldProvenance(Base):
    __tablename__ = "field_provenance"

    id = Column(Integer, primary_key=True, autoincrement=True)
    record_id = Column(String, ForeignKey("records.id"), nullable=False, index=True)
    field = Column(String, nullable=False)
    origin = Column(String, nullable=False) # SOURCE | NORMALISED | INFERRED
    method = Column(String, nullable=False) # e.g. "state_authority_alias", "exact_csv_column"
    confidence = Column(Float, default=1.0)
    detail = Column(Text, nullable=True)

    record = relationship("Record", back_populates="provenances")


class Inference(Base):
    __tablename__ = "inferences"

    id = Column(Integer, primary_key=True, autoincrement=True)
    record_id = Column(String, ForeignKey("records.id"), nullable=False, index=True)
    field = Column(String, nullable=False)
    value = Column(String, nullable=False)
    method = Column(String, nullable=False) # "taxonomy_keyword_match" | "embedding_centroid"
    model_name = Column(String, nullable=True)
    model_version = Column(String, nullable=True)
    confidence = Column(Float, default=1.0)
    evidence_text = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    record = relationship("Record", back_populates="inferences")


class ImageModel(Base):
    __tablename__ = "images"

    id = Column(String, primary_key=True)
    record_id = Column(String, nullable=True, index=True)
    source_url = Column(String, nullable=False)
    image_url = Column(String, nullable=False)
    thumbnail_url = Column(String, nullable=True)
    creator = Column(String, nullable=True)
    institution = Column(String, nullable=True)
    title = Column(String, nullable=False)
    rights_declared = Column(String, nullable=False)
    rights_category = Column(String, nullable=False) # CC0 | PDM | CC_BY | etc.
    attribution_text = Column(Text, nullable=False)
    attribution_required = Column(Boolean, default=False)
    download_allowed = Column(Boolean, default=False)
    harvested_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    verified_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    original_json = Column(JSON, nullable=True)


class ColumnMapping(Base):
    __tablename__ = "column_mappings"

    id = Column(Integer, primary_key=True, autoincrement=True)
    collection_id = Column(String, ForeignKey("collections.id"), nullable=False, index=True)
    source_column = Column(String, nullable=False)
    canonical_field = Column(String, nullable=False)
    confidence = Column(Float, default=1.0)
    confirmed = Column(Boolean, default=True)

    collection = relationship("Collection", back_populates="mappings")


class Audit(Base):
    __tablename__ = "audits"

    id = Column(String, primary_key=True)
    collection_id = Column(String, ForeignKey("collections.id"), nullable=False, index=True)
    started_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    finished_at = Column(DateTime, nullable=True)
    status = Column(String, default="pending") # pending | running | completed | failed
    weights_json = Column(JSON, nullable=True)
    ccd = Column(Float, nullable=True)
    ccd_low = Column(Float, nullable=True)
    ccd_high = Column(Float, nullable=True)
    assessability = Column(String, nullable=True) # e.g. "8 of 10 dimensions assessable"
    progress_stage = Column(String, default="initialized")
    progress_percent = Column(Integer, default=0)
    error_message = Column(Text, nullable=True)

    collection = relationship("Collection", back_populates="audits")
    dimension_statuses = relationship("RecordDimensionStatus", back_populates="audit", cascade="all, delete-orphan")
    findings = relationship("Finding", back_populates="audit", cascade="all, delete-orphan")
    priorities = relationship("PreservationPriority", back_populates="audit", cascade="all, delete-orphan")
    duplicate_clusters = relationship("DuplicateCluster", back_populates="audit", cascade="all, delete-orphan")


class RecordDimensionStatus(Base):
    __tablename__ = "record_dimension_status"

    id = Column(Integer, primary_key=True, autoincrement=True)
    audit_id = Column(String, ForeignKey("audits.id"), nullable=False, index=True)
    record_id = Column(String, ForeignKey("records.id"), nullable=False, index=True)
    dimension = Column(String, nullable=False, index=True)
    score = Column(Float, nullable=False) # [0, 1]
    status = Column(String, nullable=False) # Documented | Partial | Undocumented in collection | Not assessable | Not applicable
    reason = Column(Text, nullable=True)

    audit = relationship("Audit", back_populates="dimension_statuses")
    record = relationship("Record", back_populates="dimension_statuses")


class Finding(Base):
    __tablename__ = "findings"

    id = Column(String, primary_key=True)
    audit_id = Column(String, ForeignKey("audits.id"), nullable=False, index=True)
    kind = Column(String, nullable=False) # e.g. "missing_provenance", "geographic_conflict", "monolingual_cataloguing"
    title = Column(String, nullable=False)
    issue = Column(Text, nullable=False)
    evidence_json = Column(JSON, nullable=False)
    why_it_matters = Column(Text, nullable=False)
    certainty = Column(String, nullable=False) # high | medium | low
    suggested_action = Column(Text, nullable=False)
    record_ids_json = Column(JSON, nullable=False)

    audit = relationship("Audit", back_populates="findings")


class PreservationPriority(Base):
    __tablename__ = "priorities"

    id = Column(String, primary_key=True)
    audit_id = Column(String, ForeignKey("audits.id"), nullable=False, index=True)
    slice_json = Column(JSON, nullable=False) # e.g. {"dimension": "...", "slice_type": "category", "slice_value": "..."}
    dimension = Column(String, nullable=False)
    g = Column(Float, nullable=False) # gap magnitude
    e = Column(Float, nullable=False) # evidence confidence
    b = Column(Float, nullable=False) # breadth
    f = Column(Float, nullable=False) # feasibility
    score = Column(Float, nullable=False) # Priority score 0-100
    band = Column(String, nullable=False) # High | Medium | Lower investigation priority
    consultation = Column(String, nullable=False) # none | recommended | required
    next_step = Column(Text, nullable=False)
    reasons_json = Column(JSON, nullable=False)

    audit = relationship("Audit", back_populates="priorities")


class DuplicateCluster(Base):
    __tablename__ = "duplicate_clusters"

    id = Column(Integer, primary_key=True, autoincrement=True)
    audit_id = Column(String, ForeignKey("audits.id"), nullable=False, index=True)
    cluster_id = Column(String, nullable=False, index=True)
    record_ids_json = Column(JSON, nullable=False)
    similarity = Column(Float, nullable=False)
    matched_fields = Column(JSON, nullable=False)

    audit = relationship("Audit", back_populates="duplicate_clusters")

