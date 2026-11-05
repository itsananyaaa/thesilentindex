from datetime import UTC, datetime

from sqlalchemy import (
    JSON,
    Boolean,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import relationship

from backend.app.db import Base


class SourceLayer(Base):
    __tablename__ = "source_layers"

    id = Column(String, primary_key=True) # gi_registry | wikidata | commons | unesco_ich | museum_open_access
    name = Column(String, nullable=False)
    kind = Column(String, nullable=False) # craft_registration | monument | commons_media | intangible_element | museum_object
    licence_summary = Column(String, nullable=False) # e.g. CC0, Public Domain, OGL-India
    terms_url = Column(String, nullable=True)
    access_method = Column(String, nullable=False) # sparql_public | official_registry_cache | commons_api | curated_inscribed
    enabled = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(UTC))

    harvest_runs = relationship("HarvestRun", back_populates="layer", cascade="all, delete-orphan")
    records = relationship("Record", back_populates="layer")


class HarvestRun(Base):
    __tablename__ = "harvest_runs"

    id = Column(String, primary_key=True)
    layer_id = Column(String, ForeignKey("source_layers.id"), nullable=False, index=True)
    started_at = Column(DateTime, default=lambda: datetime.now(UTC))
    finished_at = Column(DateTime, nullable=True)
    status = Column(String, default="completed") # running | completed | failed
    items_seen = Column(Integer, default=0)
    items_kept = Column(Integer, default=0)
    items_rejected = Column(Integer, default=0)
    rejection_reasons_json = Column(JSON, default=dict)
    errors_json = Column(JSON, default=list)

    layer = relationship("SourceLayer", back_populates="harvest_runs")


class Collection(Base):
    __tablename__ = "collections"

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    kind = Column(String, nullable=False) # sample_real | sample_synthetic | upload | fused_v2
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(UTC))
    source_notes = Column(Text, nullable=True)

    records = relationship("Record", back_populates="collection", cascade="all, delete-orphan")
    audits = relationship("Audit", back_populates="collection", cascade="all, delete-orphan")
    mappings = relationship("ColumnMapping", back_populates="collection", cascade="all, delete-orphan")


class Record(Base):
    __tablename__ = "records"

    id = Column(String, primary_key=True)
    collection_id = Column(String, ForeignKey("collections.id"), nullable=False, index=True)
    layer_id = Column(String, ForeignKey("source_layers.id"), nullable=True, index=True)
    row_index = Column(Integer, nullable=False)
    record_kind = Column(String, default="museum_object", index=True) # craft_registration | monument | commons_media | intangible_element | image_only | museum_object
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
    layer = relationship("SourceLayer", back_populates="records")
    provenances = relationship("FieldProvenance", back_populates="record", cascade="all, delete-orphan")
    inferences = relationship("Inference", back_populates="record", cascade="all, delete-orphan")
    dimension_statuses = relationship("RecordDimensionStatus", back_populates="record", cascade="all, delete-orphan")
    state_attributions = relationship("StateAttribution", back_populates="record", cascade="all, delete-orphan")
    entity_links = relationship("EntityLink", back_populates="record", cascade="all, delete-orphan")

    __table_args__ = (
        Index("idx_records_col_cat", "collection_id", "category_id"),
        Index("idx_records_col_state", "collection_id", "state"),
        Index("idx_records_col_kind", "collection_id", "record_kind"),
    )


class StateAttribution(Base):
    __tablename__ = "state_attributions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    record_id = Column(String, ForeignKey("records.id"), nullable=False, index=True)
    state_code = Column(String(5), nullable=False, index=True) # 2-letter ISO, e.g. "PB", "HR", "KL"
    basis = Column(String, nullable=False) # structured | inferred | curated
    confidence = Column(Float, default=1.0)
    multi_state = Column(Boolean, default=False)

    record = relationship("Record", back_populates="state_attributions")


class HeritageEntity(Base):
    __tablename__ = "entities"

    id = Column(String, primary_key=True) # ENT-GI-xxx, ENT-WD-Qxxx, ENT-UNESCO-xxx
    label = Column(String, nullable=False, index=True)
    entity_type = Column(String, nullable=False, index=True) # craft | monument | tradition | art_form | festival
    wikidata_qid = Column(String, nullable=True, index=True)
    primary_state_codes = Column(JSON, default=list) # e.g. ["PB", "HR"]
    category_id = Column(String, nullable=True, index=True)
    description = Column(Text, nullable=True)
    created_from = Column(String, nullable=False) # source layer that originated this entity
    created_at = Column(DateTime, default=lambda: datetime.now(UTC))

    links = relationship("EntityLink", back_populates="entity", cascade="all, delete-orphan")


class EntityLink(Base):
    __tablename__ = "entity_links"

    id = Column(Integer, primary_key=True, autoincrement=True)
    entity_id = Column(String, ForeignKey("entities.id"), nullable=False, index=True)
    record_id = Column(String, ForeignKey("records.id"), nullable=False, index=True)
    link_basis = Column(String, nullable=False) # exact_external_id | name_exact | cluster_similarity
    confidence = Column(Float, default=1.0)

    entity = relationship("HeritageEntity", back_populates="links")
    record = relationship("Record", back_populates="entity_links")


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
    created_at = Column(DateTime, default=lambda: datetime.now(UTC))

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
    harvested_at = Column(DateTime, default=lambda: datetime.now(UTC))
    verified_at = Column(DateTime, default=lambda: datetime.now(UTC))
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
    started_at = Column(DateTime, default=lambda: datetime.now(UTC))
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

