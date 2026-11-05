"""Coverage scoring and four-state absence assignment engine.
Deterministic, transparent evaluation of 10 heritage documentation dimensions.
Assigns:
- Documented (score >= 0.75)
- Partial (0.25 <= score < 0.75)
- Undocumented in collection (score < 0.25 when column exists)
- Not assessable (no mapped column in dataset for this dimension)
- Not applicable (dimension does not apply to category)
"""
import os
from typing import Any

import yaml

from backend.engines.scripts_lang import analyze_indic_text

CONFIG_DIR = os.path.join(os.path.dirname(__file__), "../../config")
RUBRICS_PATH = os.path.join(CONFIG_DIR, "rubrics.yaml")
APPLICABILITY_PATH = os.path.join(CONFIG_DIR, "applicability.yaml")

class CoverageEngine:
    def __init__(self, rubrics_path: str = RUBRICS_PATH, applicability_path: str = APPLICABILITY_PATH):
        with open(rubrics_path, "r", encoding="utf-8") as f:
            self.rubrics = yaml.safe_load(f)
        with open(applicability_path, "r", encoding="utf-8") as f:
            app_data = yaml.safe_load(f) or {}
            self.applicability = app_data.get("categories", {})
            self.record_kinds_applicability = app_data.get("record_kinds", {})

        self.threshold_documented = self.rubrics.get("thresholds", {}).get("documented", 0.75)
        self.threshold_partial = self.rubrics.get("thresholds", {}).get("partial", 0.25)
        self.dimension_definitions = self.rubrics.get("dimensions", {})

    def evaluate_record(
        self,
        record: dict[str, Any],
        mapped_canonical_fields: set[str],
        category_id: str | None = None
    ) -> dict[str, dict[str, Any]]:
        """Evaluate a single record across all 10 dimensions.
        
        Args:
            record: Dict of record values
            mapped_canonical_fields: set of canonical fields present in the dataset schema
            category_id: category for applicability check
            
        Returns:
            Dict mapping dimension_id -> {score, status, reason, applicable, assessable}
        """
        results = {}
        effective_cat = category_id or record.get("category_id") or record.get("category") or "visual_arts"
        cat_applicability = self.applicability.get(effective_cat, {}).get("applicable_dimensions", {})
        
        rec_kind = record.get("record_kind") or "museum_object"
        kind_applicability = self.record_kinds_applicability.get(rec_kind, {}).get("applicable_dimensions", {})

        for dim_id, dim_spec in self.dimension_definitions.items():
            # 1. Applicability Check (Category & Record Kind)
            is_cat_applicable = cat_applicability.get(dim_id, True)
            is_kind_applicable = kind_applicability.get(dim_id, True)
            
            if not is_cat_applicable:
                results[dim_id] = {
                    "dimension": dim_id,
                    "score": 0.0,
                    "status": "Not applicable",
                    "reason": f"Dimension is not applicable to category '{effective_cat}'.",
                    "applicable": False,
                    "assessable": False
                }
                continue

            if not is_kind_applicable:
                results[dim_id] = {
                    "dimension": dim_id,
                    "score": 0.0,
                    "status": "Not applicable",
                    "reason": f"Dimension is not applicable to record kind '{rec_kind}'.",
                    "applicable": False,
                    "assessable": False
                }
                continue

            # 2. Assessability Check
            canonical_fields = dim_spec.get("canonical_fields", [])
            # A dimension is assessable if at least one of its canonical fields is mapped in the collection
            has_mapped_column = any(cf in mapped_canonical_fields for cf in canonical_fields)
            
            # Dimension 9 Community Validation strict check:
            if dim_id == "community_validation" and not has_mapped_column:
                results[dim_id] = {
                    "dimension": dim_id,
                    "score": 0.0,
                    "status": "Not assessable",
                    "reason": "Dataset does not contain a community consultation or validation field (e.g. validated_by).",
                    "applicable": True,
                    "assessable": False
                }
                continue

            if not has_mapped_column:
                results[dim_id] = {
                    "dimension": dim_id,
                    "score": 0.0,
                    "status": "Not assessable",
                    "reason": f"No column mapped in dataset for {dim_spec.get('name', dim_id)}.",
                    "applicable": True,
                    "assessable": False
                }
                continue

            # 3. Deterministic Rubric Evaluation
            score, reason = self._score_dimension(dim_id, record)

            # 4. Four-state status assignment
            if score >= self.threshold_documented:
                status = "Documented"
            elif score >= self.threshold_partial:
                status = "Partial"
            else:
                status = "Undocumented in collection"

            results[dim_id] = {
                "dimension": dim_id,
                "score": round(score, 3),
                "status": status,
                "reason": reason,
                "applicable": True,
                "assessable": True
            }

        return results

    def _score_dimension(self, dim_id: str, rec: dict[str, Any]) -> (float, str):
        """Compute transparent deterministic score in [0, 1] per dimension."""
        score = 0.0
        reasons = []

        if dim_id == "visual_documentation":
            # image URL present 0.6; image metadata +0.2; rights information known +0.2
            img_url = rec.get("image_url") or rec.get("image")
            if img_url and str(img_url).strip().startswith("http"):
                score += 0.6
                reasons.append("Image URL present (+0.6)")
            meta = rec.get("image_metadata") or (rec.get("width") and rec.get("height"))
            if meta:
                score += 0.2
                reasons.append("Technical image metadata present (+0.2)")
            rights = rec.get("image_rights") or rec.get("rights_declared") or rec.get("rights")
            if rights and str(rights).strip().lower() not in ("unknown", ""):
                score += 0.2
                reasons.append("Image rights declared (+0.2)")

        elif dim_id == "historical_context":
            # date or period only 0.4; plus description >= 200 chars +0.3 (total 0.7); plus cited source +0.3 (total 1.0)
            period = rec.get("period_date") or rec.get("period_text") or rec.get("date")
            desc = str(rec.get("description") or "")
            citation = rec.get("citation_source") or rec.get("citation")

            if period and str(period).strip():
                score += 0.4
                reasons.append("Chronological period/date present (+0.4)")
            if len(desc.strip()) >= 200:
                score += 0.3
                reasons.append(f"Detailed historical description >=200 chars ({len(desc.strip())} chars) (+0.3)")
            if citation and str(citation).strip():
                score += 0.3
                reasons.append("Bibliographic source citation present (+0.3)")

        elif dim_id == "original_language":
            # English-only text 0.0; language tag or transliterated title 0.5; description in original script 1.0
            lang = str(rec.get("language") or "").strip().lower()
            text_to_check = " ".join([str(rec.get("title") or ""), str(rec.get("description") or "")[:300]])
            analysis = analyze_indic_text(text_to_check)

            if analysis["has_indic_script"]:
                score = 1.0
                reasons.append(f"Original Indic script detected ({', '.join(analysis['detected_scripts'])}) (1.0)")
            elif lang and lang != "english" and lang != "en" or analysis["is_transliterated"]:
                score = 0.5
                reasons.append("Non-English language tag or Latin-transliterated Indic detected (0.5)")
            else:
                score = 0.0
                reasons.append("Monolingual English-only documentation (0.0)")

        elif dim_id == "geographic_provenance":
            # state 0.4; district or place +0.3; coordinates or place-authority ID +0.3
            state = rec.get("state")
            place = rec.get("district_place") or rec.get("place")
            coords = rec.get("coordinates") or rec.get("lat") or rec.get("lon")

            if state and str(state).strip():
                score += 0.4
                reasons.append("State / province provenance present (+0.4)")
            if place and str(place).strip() and str(place).strip() != str(state).strip():
                score += 0.3
                reasons.append("District, town or locality provenance present (+0.3)")
            if coords and str(coords).strip():
                score += 0.3
                reasons.append("Geographic coordinates or geonames authority present (+0.3)")

        elif dim_id == "materials_and_techniques":
            # material 0.5 plus technique 0.5
            mat = rec.get("materials")
            tech = rec.get("technique")

            if mat and str(mat).strip():
                score += 0.5
                reasons.append("Material documentation present (+0.5)")
            if tech and str(tech).strip():
                score += 0.5
                reasons.append("Craft / fabrication technique documented (+0.5)")

        elif dim_id == "practitioner_perspective":
            # maker name 0.4; community or lineage +0.3; practitioner statement +0.3
            maker = rec.get("maker_name") or rec.get("creator")
            comm = rec.get("community_lineage") or rec.get("community")
            stmt = rec.get("practitioner_statement")

            if maker and str(maker).strip() and "unknown" not in str(maker).lower():
                score += 0.4
                reasons.append("Named artisan or practitioner (+0.4)")
            if comm and str(comm).strip():
                score += 0.3
                reasons.append("Practitioner community or lineage documented (+0.3)")
            if stmt and str(stmt).strip():
                score += 0.3
                reasons.append("Practitioner-authored voice / statement recorded (+0.3)")

        elif dim_id == "oral_histories":
            # linked narrative / media 1.0, or partial credit 0.5 for narrative note
            media = rec.get("narrative_media_url")
            narrative = rec.get("narrative_oral") or rec.get("oral_history")

            if media and str(media).strip().startswith("http"):
                score = 1.0
                reasons.append("Linked audio/video oral testimony or performance recording (1.0)")
            elif narrative and str(narrative).strip():
                score = 0.5
                reasons.append("Oral history narrative notes documented (0.5)")
            else:
                score = 0.0
                reasons.append("No oral narratives or living testimony recorded (0.0)")

        elif dim_id == "source_attribution":
            # source institution 0.3; accession id 0.2; citation or URL 0.3; provenance statement 0.2
            inst = rec.get("source_institution")
            acc = rec.get("accession_id")
            surl = rec.get("source_url") or rec.get("access_url")
            prov = rec.get("provenance_history") or rec.get("provenance")

            if inst and str(inst).strip():
                score += 0.3
                reasons.append("Source holding institution documented (+0.3)")
            if acc and str(acc).strip():
                score += 0.2
                reasons.append("Accession / inventory identifier present (+0.2)")
            if surl and str(surl).strip():
                score += 0.3
                reasons.append("Institutional record citation / URL present (+0.3)")
            if prov and str(prov).strip():
                score += 0.2
                reasons.append("Archival provenance history documented (+0.2)")

        elif dim_id == "community_validation":
            val = rec.get("validated_by") or rec.get("community_notes")
            consult = rec.get("consulted_with")

            if val and str(val).strip():
                score = 1.0
                reasons.append("Formally validated by indigenous community or advisory council (1.0)")
            elif consult and str(consult).strip():
                score = 0.5
                reasons.append("Community consultation recorded (0.5)")
            else:
                score = 0.0
                reasons.append("No community validation or consultation recorded on this record (0.0)")

        elif dim_id == "preservation_accessibility":
            # condition note 0.4; rights or license 0.3; access URL 0.3
            cond = rec.get("condition_notes") or rec.get("condition")
            rights = rec.get("rights_license") or rec.get("rights") or rec.get("rights_declared")
            aurl = rec.get("access_url") or rec.get("source_url")

            if cond and str(cond).strip():
                score += 0.4
                reasons.append("Physical / digital preservation condition recorded (+0.4)")
            if rights and str(rights).strip():
                score += 0.3
                reasons.append("Declared license and usage rights specified (+0.3)")
            if aurl and str(aurl).strip():
                score += 0.3
                reasons.append("Public access URL present (+0.3)")

        score = min(1.0, round(score, 3))
        reason_text = "; ".join(reasons) if reasons else "No positive criteria met in this dimension."
        return score, reason_text

