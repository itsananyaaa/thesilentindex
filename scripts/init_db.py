"""Initialize SQLite / Postgres database and pre-populate Sample A & Sample B collections.
Pre-runs audits so observatory, map, matrix, and explorer have live computed data immediately.
"""
import os
import json
import csv
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from backend.app.db import engine, SessionLocal, Base
from backend.app.models import (
    Collection, Record, ImageModel, FieldProvenance, Inference,
    ColumnMapping, Audit, RecordDimensionStatus, Finding, PreservationPriority, DuplicateCluster
)
from backend.engines.normalise import NormalisationEngine
from backend.engines.taxonomy import TaxonomyEngine
from backend.engines.coverage import CoverageEngine
from backend.engines.ccd import compute_collection_ccd
from backend.engines.duplicates import find_duplicate_clusters
from backend.engines.provenance import audit_provenance_and_sources
from backend.engines.priority import compute_preservation_priorities
from backend.engines.rights import normalise_rights

def init_and_seed_db():
    print("Creating database schema...")
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()

    try:
        # Check if already seeded
        existing_col = db.query(Collection).filter_by(id="sample-real-001").first()
        if existing_col:
            print("Database already contains collections. Re-seeding clean state...")
            # Delete in order
            db.query(RecordDimensionStatus).delete()
            db.query(Finding).delete()
            db.query(PreservationPriority).delete()
            db.query(DuplicateCluster).delete()
            db.query(Audit).delete()
            db.query(FieldProvenance).delete()
            db.query(Inference).delete()
            db.query(ColumnMapping).delete()
            db.query(ImageModel).delete()
            db.query(Record).delete()
            db.query(Collection).delete()
            db.commit()

        normalizer = NormalisationEngine()
        taxonomy = TaxonomyEngine()
        coverage_engine = CoverageEngine()

        # -----------------------------------------------------------------
        # 1. Seed Sample A: Real Verified Museum Open-Access Holding
        # -----------------------------------------------------------------
        print("Seeding Sample A (Real Verified Open Access)...")
        col_real = Collection(
            id="sample-real-001",
            name="Indian Art in Open-Access Museum Collections (Snapshot)",
            kind="sample_real",
            description="Verified, attributed open-access cultural heritage records from Wikimedia Commons, Met Open Access, and global museum repositories.",
            source_notes="This audits the metadata of these open-access holdings. It says nothing about the heritage of any region itself."
        )
        db.add(col_real)

        real_records_list = []
        with open("data/seed/records.jsonl", "r", encoding="utf-8") as f:
            for line in f:
                if line.strip():
                    real_records_list.append(json.loads(line))

        db_records_real = []
        real_canon_fields = {
            "title", "art_form", "category", "state", "place", "period_date",
            "language", "materials", "technique", "description", "creator",
            "community", "source_institution", "accession_id", "source_url",
            "image_url", "rights_license", "access_url"
        }

        # Seed images & records
        for r_dict in real_records_list:
            rec_id = r_dict["id"]
            img_id = r_dict.get("image_id")
            
            # Normalise state
            canon_state, state_code, state_prov = normalizer.normalise_state(r_dict.get("state", ""))
            
            # Image record
            img = ImageModel(
                id=img_id,
                record_id=rec_id,
                source_url=r_dict.get("source_url", ""),
                image_url=r_dict.get("image_url", ""),
                thumbnail_url=r_dict.get("thumbnail_url") or r_dict.get("image_url", ""),
                creator=r_dict.get("creator", "Unknown artisan"),
                institution=r_dict.get("source_institution", "Archive"),
                title=r_dict.get("title", ""),
                rights_declared=r_dict.get("rights_declared", "Public Domain"),
                rights_category=r_dict.get("rights_category", "PDM"),
                attribution_text=r_dict.get("attribution_text", ""),
                attribution_required=r_dict.get("attribution_required", False),
                download_allowed=r_dict.get("download_allowed", False),
                original_json=r_dict.get("original_json", {})
            )
            db.add(img)

            db_rec = Record(
                id=rec_id,
                collection_id="sample-real-001",
                row_index=r_dict.get("row_index", 1),
                original_json=r_dict.get("original_json", {}),
                title=r_dict.get("title", ""),
                art_form=r_dict.get("art_form", ""),
                category_id=r_dict.get("category_id", "visual_arts"),
                state=canon_state,
                place=r_dict.get("place", canon_state),
                period_text=r_dict.get("period_text", ""),
                language=r_dict.get("language", "Indic"),
                materials=r_dict.get("materials", ""),
                technique=r_dict.get("technique", ""),
                description=r_dict.get("description", ""),
                creator=r_dict.get("creator", ""),
                community=r_dict.get("community", ""),
                source_institution=r_dict.get("source_institution", ""),
                accession_id=r_dict.get("accession_id", ""),
                source_url=r_dict.get("source_url", ""),
                image_id=img_id,
                image_url=r_dict.get("image_url", ""),
                thumbnail_url=r_dict.get("thumbnail_url"),
                rights_declared=r_dict.get("rights_declared", ""),
                rights_category=r_dict.get("rights_category", "PDM"),
                download_allowed=r_dict.get("download_allowed", False),
                is_synthetic=False
            )
            db.add(db_rec)
            db_records_real.append(db_rec)

            # Field provenance
            if state_prov:
                db.add(FieldProvenance(
                    record_id=rec_id,
                    field="state",
                    origin=state_prov["origin"],
                    method=state_prov["method"],
                    confidence=state_prov["confidence"],
                    detail=state_prov["detail"]
                ))

        # -----------------------------------------------------------------
        # 2. Seed Sample B: Synthetic Regional Museum (demo)
        # -----------------------------------------------------------------
        print("Seeding Sample B (Synthetic Regional Museum)...")
        col_synth = Collection(
            id="sample-synth-002",
            name="Synthetic Regional Museum (Demo)",
            kind="sample_synthetic",
            description="A deliberately seeded synthetic test collection of 150 items with common institutional defects: missing makers, conflicting regional geography, and monolingual records.",
            source_notes="Deliberately seeded synthetic test dataset. Every record is badged SYNTHETIC and impossible to confuse with real history."
        )
        db.add(col_synth)

        synth_rows = []
        with open("data/synthetic/synthetic_regional_museum.csv", "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            synth_rows = list(reader)

        db_records_synth = []
        for s_row in synth_rows:
            rec_id = s_row["record_id"]
            canon_state, state_code, state_prov = normalizer.normalise_state(s_row.get("state", ""))
            
            rights_cat, dl_allowed, _ = normalise_rights(s_row.get("rights"))

            db_rec = Record(
                id=rec_id,
                collection_id="sample-synth-002",
                row_index=int(rec_id.split("-")[1]),
                original_json=dict(s_row),
                title=s_row.get("title", ""),
                art_form=s_row.get("art_form", ""),
                category_id=s_row.get("category", "visual_arts"),
                state=canon_state,
                place=s_row.get("place", canon_state),
                period_text=s_row.get("period_date", ""),
                language=s_row.get("language", ""),
                materials=s_row.get("materials", ""),
                technique=s_row.get("technique", ""),
                description=s_row.get("description", ""),
                creator=s_row.get("maker_name", ""),
                community=s_row.get("community", ""),
                source_institution=s_row.get("source_institution", ""),
                accession_id=s_row.get("accession_id", ""),
                source_url=s_row.get("source_url", ""),
                image_id=None,
                image_url=None,
                thumbnail_url=None,
                rights_declared=s_row.get("rights", ""),
                rights_category=rights_cat.value,
                download_allowed=dl_allowed,
                is_synthetic=True
            )
            db.add(db_rec)
            db_records_synth.append(db_rec)

            if state_prov:
                db.add(FieldProvenance(
                    record_id=rec_id,
                    field="state",
                    origin=state_prov["origin"],
                    method=state_prov["method"],
                    confidence=state_prov["confidence"],
                    detail=state_prov["detail"]
                ))

        db.commit()

        # -----------------------------------------------------------------
        # 3. Pre-run Audits for Sample A and Sample B
        # -----------------------------------------------------------------
        for col_id, recs, canon_cols in [
            ("sample-real-001", db_records_real, real_canon_fields),
            ("sample-synth-002", db_records_synth, set(synth_rows[0].keys()))
        ]:
            print(f"Running initial audit for {col_id}...")
            audit_id = f"AUDIT-{col_id.upper()}-INIT"
            now = datetime.now(timezone.utc)
            
            evaluations = []
            rec_dicts = []
            for r in recs:
                r_dict = {
                    "id": r.id,
                    "record_id": r.id,
                    "title": r.title,
                    "art_form": r.art_form,
                    "category": r.category_id,
                    "category_id": r.category_id,
                    "state": r.state,
                    "place": r.place,
                    "district_place": r.place,
                    "period_date": r.period_text,
                    "language": r.language,
                    "materials": r.materials,
                    "technique": r.technique,
                    "description": r.description,
                    "maker_name": r.creator,
                    "creator": r.creator,
                    "community": r.community,
                    "community_lineage": r.community,
                    "source_institution": r.source_institution,
                    "accession_id": r.accession_id,
                    "source_url": r.source_url,
                    "image_url": r.image_url,
                    "rights_license": r.rights_declared,
                    "rights_declared": r.rights_declared,
                    "access_url": r.source_url
                }
                # Check for synthetic extra fields
                if r.is_synthetic:
                    r_dict.update(r.original_json)

                rec_dicts.append(r_dict)
                eval_res = coverage_engine.evaluate_record(r_dict, mapped_canonical_fields=canon_cols, category_id=r.category_id)
                evaluations.append(eval_res)

                # Persist RecordDimensionStatus
                for dim, dim_res in eval_res.items():
                    db.add(RecordDimensionStatus(
                        audit_id=audit_id,
                        record_id=r.id,
                        dimension=dim,
                        score=dim_res["score"],
                        status=dim_res["status"],
                        reason=dim_res["reason"]
                    ))

            # CCD computation
            ccd_res = compute_collection_ccd(evaluations, seed=42)

            # Audit record
            audit = Audit(
                id=audit_id,
                collection_id=col_id,
                started_at=now,
                finished_at=now,
                status="completed",
                weights_json={},
                ccd=ccd_res["ccd"],
                ccd_low=ccd_res["ccd_interval"][0],
                ccd_high=ccd_res["ccd_interval"][1],
                assessability=ccd_res["assessability"],
                progress_stage="completed",
                progress_percent=100
            )
            db.add(audit)

            # Duplicate clusters
            dup_clusters = find_duplicate_clusters(rec_dicts)
            for dc in dup_clusters:
                db.add(DuplicateCluster(
                    audit_id=audit_id,
                    cluster_id=dc["cluster_id"],
                    record_ids_json=dc["record_ids"],
                    similarity=dc["similarity"],
                    matched_fields=dc["matched_fields"]
                ))

            # Provenance and geographic findings
            prov_findings = audit_provenance_and_sources(rec_dicts)
            for pf in prov_findings:
                db.add(Finding(
                    id=f"{audit_id}-{pf['id']}",
                    audit_id=audit_id,
                    kind=pf["kind"],
                    title=pf["title"],
                    issue=pf["issue"],
                    evidence_json=pf["evidence_json"],
                    why_it_matters=pf["why_it_matters"],
                    certainty=pf["certainty"],
                    suggested_action=pf["suggested_action"],
                    record_ids_json=pf["record_ids_json"]
                ))

            # Add duplicate finding if duplicates exist
            if dup_clusters:
                db.add(Finding(
                    id=f"{audit_id}-FINDING-DUPLICATES",
                    audit_id=audit_id,
                    kind="duplicate_cluster",
                    title=f"{len(dup_clusters)} Candidate Duplicate Record Clusters Identified",
                    issue=f"Found {len(dup_clusters)} clusters containing potential duplicate records sharing accession numbers or token-matched titles.",
                    evidence_json={
                        "duplicate_count": len(dup_clusters),
                        "clusters": [d["cluster_id"] for d in dup_clusters]
                    },
                    why_it_matters="Duplicate catalog entries inflate item counts, distort statistical coverage debt, and lead to fractured conservation histories.",
                    certainty="high",
                    suggested_action="Review catalog records side-by-side and mark accession cross-references; never merge without human conservator sign-off.",
                    record_ids_json=[r for d in dup_clusters for r in d["record_ids"]]
                ))

            # Preservation priorities
            priorities = compute_preservation_priorities(rec_dicts, evaluations)
            for p in priorities:
                db.add(PreservationPriority(
                    id=f"{audit_id}-{p['id']}",
                    audit_id=audit_id,
                    slice_json=p["slice"],
                    dimension=p["dimension"],
                    g=p["g"],
                    e=p["e"],
                    b=p["b"],
                    f=p["f"],
                    score=p["score"],
                    band=p["band"],
                    consultation=p["consultation"],
                    next_step=p["next_step"],
                    reasons_json=p["reasons"]
                ))

            db.commit()

        print("Database seeded and initial audits completed successfully!")

    finally:
        db.close()

if __name__ == "__main__":
    init_and_seed_db()

