"""Generate Sample B: Synthetic Regional Museum (demo).
A generated CSV of 150 rows with deliberately seeded metadata defects:
- Duplicates (exact and near-duplicates)
- State / place geographic conflicts (e.g. State: Bihar, Place: Thanjavur)
- English-only monolingual cataloging (missing Indic scripts)
- Missing artisan / maker attributions and craft techniques
- Mixed historical spellings (e.g. Orissa vs Odisha, Bombay vs Maharashtra)
- Missing source institutions and URLs
- Empty documentation fields across specific dimensions

Every record explicitly carries SYNTHETIC in its identifier and fields.
"""
import csv
import os
import random

def generate_synthetic_museum(output_path="data/synthetic/synthetic_regional_museum.csv", num_records=150):
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    categories = [
        "visual_arts", "architecture", "textiles_crafts", "manuscripts_literature",
        "music_instruments", "dance_performance", "oral_traditions", "ritual_heritage", "sculpture_material"
    ]

    states = [
        ("Odisha", "Bhubaneswar", "Orissa"),
        ("Bihar", "Patna", "Bihar"),
        ("Tamil Nadu", "Thanjavur", "Madras"),
        ("Rajasthan", "Jaipur", "Rajputana"),
        ("Kerala", "Kochi", "Travancore"),
        ("West Bengal", "Kolkata", "Bengal"),
        ("Karnataka", "Mysuru", "Mysore"),
        ("Gujarat", "Ahmedabad", "Gujrat"),
        ("Uttar Pradesh", "Varanasi", "United Provinces"),
        ("Madhya Pradesh", "Bhopal", "Central Provinces"),
        ("Assam", "Guwahati", "Asom"),
        ("Punjab", "Amritsar", "Panjab"),
    ]

    fieldnames = [
        "record_id",
        "title",
        "art_form",
        "category",
        "state",
        "place",
        "period_date",
        "language",
        "materials",
        "technique",
        "description",
        "maker_name",
        "community",
        "practitioner_statement",
        "narrative_oral",
        "source_institution",
        "accession_id",
        "source_url",
        "rights",
        "condition_notes",
        "access_url",
        "validated_by",
        "is_synthetic"
    ]

    records = []

    # Deliberate duplicate seeds
    duplicate_groups = [
        ("SYNTH-0010", "SYNTH-0011", "Decorative Brass Oil Lamp with Peacock Finial", "Metalwork", "sculpture_material", "Tamil Nadu", "Madras"),
        ("SYNTH-0045", "SYNTH-0046", "Handwoven Cotton Saree with Temple Border", "Textile Weaving", "textiles_crafts", "Odisha", "Orissa"),
        ("SYNTH-0080", "SYNTH-0081", "Palm Leaf Folio Depicting Gita Govinda Scene", "Palm Leaf Art", "manuscripts_literature", "Odisha", "Orissa"),
    ]

    for i in range(1, num_records + 1):
        rec_id = f"SYNTH-{i:04d}"
        cat = categories[i % len(categories)]
        st_tuple = states[i % len(states)]
        
        # Seed defects based on index modulo
        use_old_spelling = (i % 7 == 0)
        has_geo_conflict = (i % 11 == 0)
        missing_maker = (i % 3 != 0) # 66% missing makers
        missing_technique = (i % 4 == 0)
        missing_source = (i % 9 == 0)
        has_indic_script = (i % 5 == 0) # Only 20% have Indic script
        has_oral_narrative = (i % 10 == 0)
        has_community_val = (i % 15 == 0)

        chosen_state = st_tuple[2] if use_old_spelling else st_tuple[0]
        chosen_place = "Thanjavur" if has_geo_conflict and chosen_state == "Bihar" else st_tuple[1]

        # Script variation
        indic_scripts = ["चित्रकला नमूना (कैटलॉग)", "পাণ্ডুলিপি বিবরণ", "சிற்பக்கலை தொகுப்பு", "శిల్ప వివరాలు"]
        indic_text = f" - {random.choice(indic_scripts)}" if has_indic_script else ""

        title = f"[Synthetic Catalog #{i}] Traditional {cat.replace('_', ' ').title()} Artifact{indic_text}"
        art_form = f"Synthetic {cat.replace('_', ' ').title()}"

        # Description length variation (short vs detailed)
        if i % 3 == 0:
            desc = f"Synthetic inventory entry {i} recorded during preliminary regional survey. Documentation lacks comprehensive oral history and community notes. Preserved under institutional storage conditions without full archival provenance."
        else:
            desc = f"Synthetic specimen {i}."

        maker = "" if missing_maker else f"Master Artisan Guild Member #{i%20 + 1}"
        comm = "" if missing_maker else f"Traditional {st_tuple[0]} Artisan Custodians"
        practitioner_stmt = f"Craft methodology passed through oral lineages across generations." if not missing_maker and i % 6 == 0 else ""

        narrative = f"Oral narrative recorded during field expedition documenting folklore origins." if has_oral_narrative else ""
        source_inst = "" if missing_source else f"Regional Heritage Museum Archive #{i%5 + 1}"
        accession = "" if missing_source else f"RHM-{i:05d}"
        source_url = "" if missing_source else f"https://synthetic-museum.example.org/item/{i}"

        rec = {
            "record_id": rec_id,
            "title": title,
            "art_form": art_form,
            "category": cat,
            "state": chosen_state,
            "place": chosen_place,
            "period_date": "18th-19th Century CE" if i % 2 == 0 else "Unknown Era",
            "language": "Hindi / Sanskrit / English" if has_indic_script else "English",
            "materials": "Brass alloy / Silk / Paper" if not missing_technique else "",
            "technique": "Cire-perdue casting / Handloom weaving" if not missing_technique else "",
            "description": desc,
            "maker_name": maker,
            "community": comm,
            "practitioner_statement": practitioner_stmt,
            "narrative_oral": narrative,
            "source_institution": source_inst,
            "accession_id": accession,
            "source_url": source_url,
            "rights": "In Copyright / All Rights Reserved" if i % 2 == 0 else "Public Domain Mark (PDM)",
            "condition_notes": "Fair condition; slight oxidation on surface" if i % 4 == 0 else "",
            "access_url": source_url,
            "validated_by": "Local Craft Guild Advisory Council" if has_community_val else "",
            "is_synthetic": "TRUE"
        }
        records.append(rec)

    # Inject specific duplicates
    for orig_id, dup_id, dup_title, dup_art_form, dup_cat, dup_st, dup_alt_st in duplicate_groups:
        idx_dup = int(dup_id.split("-")[1]) - 1
        if 0 <= idx_dup < len(records):
            records[idx_dup]["title"] = f"{dup_title} (Duplicate Catalog Entry)"
            records[idx_dup]["art_form"] = dup_art_form
            records[idx_dup]["category"] = dup_cat
            records[idx_dup]["state"] = dup_alt_st
            records[idx_dup]["source_institution"] = "Regional Heritage Museum Archive #1"

    with open(output_path, "w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(records)

    print(f"Generated {len(records)} synthetic records at {output_path}")

if __name__ == "__main__":
    generate_synthetic_museum()

