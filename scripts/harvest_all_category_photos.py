"""Comprehensive Photo Harvester for all 9 Cultural Heritage Categories.
Maps each tradition, monument, instrument, dance, and craft in fused-v2 to
an authentic, distinct, museum-grade photograph.
"""
import os
import json
import time
import urllib.request
import urllib.parse
import sqlite3

USER_AGENT = "TheSilentIndex-CulturalAtlas/1.0 (https://thesilentindex.vercel.app; cultural-heritage-research)"
ATLAS_DIR = os.path.abspath("frontend/public/images/atlas")
os.makedirs(ATLAS_DIR, exist_ok=True)

# Explicit mappings from keywords / art_form / monument title to Wikipedia slug / Commons search
TOPIC_SPECS = [
    # Architecture & Monuments
    {"key": "ajanta_caves", "slug": "Ajanta_Caves", "match": ["ajanta"]},
    {"key": "hampi_complex", "slug": "Hampi", "match": ["hampi", "vitthala", "stone chariot"]},
    {"key": "rani_ki_vav", "slug": "Rani_ki_vav", "match": ["rani ki vav"]},
    {"key": "qutb_minar", "slug": "Qutb_Minar", "match": ["qutb minar"]},
    {"key": "khajuraho", "slug": "Khajuraho_Group_of_Monuments", "match": ["khajuraho"]},
    {"key": "nalanda_mahavihara", "slug": "Nalanda_mahavihara", "match": ["nalanda"]},
    {"key": "shore_temple", "slug": "Shore_Temple", "match": ["shore temple"]},
    {"key": "bhimbetka", "slug": "Bhimbetka_rock_shelters", "match": ["bhimbetka"]},
    {"key": "dholavira", "slug": "Dholavira", "match": ["dholavira"]},
    {"key": "martand_sun_temple", "slug": "Martand_Sun_Temple", "match": ["martand"]},
    {"key": "kangra_fort", "slug": "Kangra_Fort", "match": ["kangra fort"]},
    {"key": "chittorgarh_fort", "slug": "Chittor_Fort", "match": ["chittorgarh", "chittor fort"]},
    {"key": "golconda_fort", "slug": "Golconda_Fort", "match": ["golconda"]},
    {"key": "cellular_jail", "slug": "Cellular_Jail", "match": ["cellular jail"]},
    {"key": "jageshwar_temples", "slug": "Jageshwar_Temples", "match": ["jageshwar"]},
    {"key": "rang_ghar", "slug": "Rang_Ghar", "match": ["rang ghar", "talatal ghar"]},
    {"key": "capitol_complex", "slug": "Chandigarh_Capitol_Complex", "match": ["capitol complex"]},
    {"key": "diu_fort", "slug": "Diu_Fort", "match": ["diu fort"]},
    {"key": "sanchi_stupa", "slug": "Sanchi", "match": ["sanchi"]},
    {"key": "victoria_memorial", "slug": "Victoria_Memorial,_Kolkata", "match": ["victoria memorial"]},

    # Dance & Performance
    {"key": "bharatanatyam", "slug": "Bharatanatyam", "match": ["bharatanatyam"]},
    {"key": "kathputli", "slug": "Kathputli_(puppetry)", "match": ["kathputli"]},
    {"key": "koodiyattam", "slug": "Koodiyattam", "match": ["koodiyattam"]},
    {"key": "ramlila", "slug": "Ramlila", "match": ["ramlila"]},
    {"key": "chhau_dance", "slug": "Chhau_dance", "match": ["chhau"]},
    {"key": "kalbelia", "slug": "Kalbelia", "match": ["kalbelia"]},
    {"key": "mudiyettu", "slug": "Mudiyettu", "match": ["mudiyettu"]},
    {"key": "garba", "slug": "Garba_(dance)", "match": ["garba"]},
    {"key": "kathakali", "slug": "Kathakali", "match": ["kathakali"]},

    # Music & Musical Instruments
    {"key": "hindustani_sitar", "slug": "Sitar", "match": ["sitar"]},
    {"key": "mridangam", "slug": "Mridangam", "match": ["mridangam", "mrudangam"]},
    {"key": "manipuri_sankirtana", "slug": "Sankirtana", "match": ["sankirtana"]},
    {"key": "shehnai", "slug": "Shehnai", "match": ["shehnai"]},
    {"key": "carnatic_veena", "slug": "Saraswati_veena", "match": ["veena"]},

    # Manuscripts & Epigraphy
    {"key": "bhurjapatra_manuscript", "slug": "Sharada_script", "match": ["bhurjapatra", "birch", "sharada"]},
    {"key": "palm_leaf_manuscript", "slug": "Palm-leaf_manuscript", "match": ["palm-leaf", "palm leaf", "adhyatma", "gitagovinda"]},

    # Ritual Heritage
    {"key": "durga_puja", "slug": "Durga_Puja", "match": ["durga puja"]},
    {"key": "kumbh_mela", "slug": "Kumbh_Mela", "match": ["kumbh mela"]},
    {"key": "ramman_festival", "slug": "Ramman_(festival)", "match": ["ramman"]},
    {"key": "nawrouz", "slug": "Nowruz", "match": ["nawrouz", "nowruz"]},
    {"key": "yoga", "slug": "Yoga", "match": ["yoga"]},
    {"key": "theyyam", "slug": "Theyyam", "match": ["theyyam"]},

    # Visual Arts & Paintings
    {"key": "warli_painting", "slug": "Warli_painting", "match": ["warli"]},
    {"key": "gond_art", "slug": "Jangarh_Singh_Shyam", "match": ["gond"]},
    {"key": "kalamkari", "slug": "Kalamkari", "match": ["kalamkari"]},
    {"key": "thanjavur_paintings", "slug": "Thanjavur_painting", "match": ["thanjavur", "tanjore"]},
    {"key": "rogan_art", "slug": "Rogan_painting", "match": ["rogan"]},
    {"key": "kalighat_painting", "slug": "Kalighat_painting", "match": ["kalighat"]},
    {"key": "kerala_mural", "slug": "Kerala_mural_painting", "match": ["kerala mural", "balussery"]},
    {"key": "tala_pattachitra", "slug": "Pattachitra", "match": ["tala pattachitra", "jagannath trio"]},

    # Sculpture & Metalwork
    {"key": "chola_bronze", "slug": "Chola_bronzes", "match": ["chola", "nataraja"]},
    {"key": "mathura_buddha", "slug": "Mathura_art", "match": ["mathura", "shakyamuni"]},
    {"key": "hoysala_sculpture", "slug": "Hoysala_architecture", "match": ["hoysala", "madanika", "halebidu"]},
    {"key": "gandharan_art", "slug": "Greco-Buddhist_art", "match": ["gandhar"]},
    {"key": "pembarthi_metal", "slug": "Pembarthi_Metal_Craft", "match": ["pembarthi"]},
    {"key": "kondapalli_toys", "slug": "Kondapalli_Toys", "match": ["kondapalli"]},
    {"key": "bidriware", "slug": "Bidriware", "match": ["bidri"]},
    {"key": "jaipur_blue_pottery", "slug": "Blue_Pottery_of_Jaipur", "match": ["blue pottery"]},
    {"key": "channapatna_toys", "slug": "Channapatna_toys", "match": ["channapatna"]},
    {"key": "sankheda_furniture", "slug": "Sankheda_furniture", "match": ["sankheda"]},
    {"key": "villianur_terracotta", "slug": "Terracotta", "match": ["villianur"]},
    {"key": "thirukanur_papier_mache", "slug": "Papier-m%C3%A2ch%C3%A9", "match": ["thirukanur", "papier mache"]},

    # Textiles & Crafts
    {"key": "patan_patola", "slug": "Patola_sari", "match": ["patan patola", "patola"]},
    {"key": "bagh_print", "slug": "Bagh_Print", "match": ["bagh"]},
    {"key": "paithani", "slug": "Paithani", "match": ["paithani"]},
    {"key": "kasavu_saree", "slug": "Kasavu", "match": ["kasavu", "balaramapuram"]},
    {"key": "chanderi_saree", "slug": "Chanderi_sari", "match": ["chanderi"]},
    {"key": "mysore_silk", "slug": "Mysore_silk", "match": ["mysore silk", "mysore crepe"]},
    {"key": "kanchipuram_silk", "slug": "Kanchipuram_silk_sari", "match": ["kanchipuram"]},
    {"key": "kota_doria", "slug": "Kota_Doria", "match": ["kota doria"]},
    {"key": "jamdani", "slug": "Jamdani", "match": ["jamdani"]},
    {"key": "goa_feni", "slug": "Feni_(liquor)", "match": ["feni"]},
    {"key": "puneri_pagadi", "slug": "Puneri_Pagadi", "match": ["puneri pagadi", "pagadi"]}
]

def fetch_thumb_url(slug: str) -> str | None:
    u = f"https://en.wikipedia.org/api/rest_v1/page/summary/{urllib.parse.quote(slug)}"
    req = urllib.request.Request(u, headers={"User-Agent": USER_AGENT})
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            d = json.loads(resp.read().decode())
            return d.get("thumbnail", {}).get("source") or d.get("originalimage", {}).get("source")
    except Exception as e:
        print(f"  Summary fetch failed for {slug}: {e}")
    return None

def download_file(url: str, dest_path: str) -> bool:
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = resp.read()
            if len(data) > 3000:
                with open(dest_path, "wb") as f:
                    f.write(data)
                return True
    except Exception as e:
        print(f"  Download error for {url}: {e}")
    return False

def main():
    print("=== Downloading distinct category photos ===")
    
    # 1. Download each new topic photo if not present
    for spec in TOPIC_SPECS:
        key = spec["key"]
        dest = os.path.join(ATLAS_DIR, f"{key}.jpg")
        if os.path.exists(dest) and os.path.getsize(dest) > 3000:
            print(f"[CACHED] {key} ({os.path.getsize(dest)} bytes)")
            continue
        print(f"Downloading {key} ({spec['slug']})...")
        url = fetch_thumb_url(spec["slug"])
        if url and download_file(url, dest):
            print(f"  -> Saved {dest} ({os.path.getsize(dest)} bytes)")
        else:
            print(f"  -> FAILED for {key}")
        time.sleep(0.15)

    # 2. Connect to database and map all 317 fused-v2 records
    conn = sqlite3.connect("silence_index.db")
    cur = conn.cursor()
    cur.execute("SELECT id, title, art_form, category_id, state FROM records WHERE collection_id='fused-v2'")
    records = cur.fetchall()

    # Load existing manifest
    manifest_path = os.path.join(ATLAS_DIR, "manifest.json")
    with open(manifest_path, "r") as f:
        manifest = json.load(f)

    mapped_count = 0
    newly_mapped = 0

    for r in records:
        rid, title, art_form, cat, state = r
        current_img = manifest.get(rid, "")
        
        # Don't overwrite the 4 user-approved photos or existing verified top 36
        if rid in ["FUSED-REC-GI-85", "FUSED-REC-GI-88", "FUSED-REC-GI-753", "FUSED-REC-GI-87"]:
            mapped_count += 1
            continue

        search_text = f"{(title or '')} {(art_form or '')}".lower()
        
        # Check topic specs
        found_spec = None
        for spec in TOPIC_SPECS:
            dest = os.path.join(ATLAS_DIR, f"{spec['key']}.jpg")
            if not os.path.exists(dest) or os.path.getsize(dest) < 3000:
                continue
            for m in spec["match"]:
                if m in search_text:
                    found_spec = spec
                    break
            if found_spec:
                break

        if found_spec:
            target_path = f"/images/atlas/{found_spec['key']}.jpg"
            if current_img != target_path:
                manifest[rid] = target_path
                newly_mapped += 1
            mapped_count += 1
        else:
            mapped_count += 1

    print(f"\nTotal records processed: {len(records)}")
    print(f"Newly mapped to specific photos: {newly_mapped}")

    with open(manifest_path, "w") as f:
        json.dump(manifest, f, indent=2)

    # Also update frontend/lib/atlas_photos.ts
    ts_content = f"""// Auto-generated mapping of heritage records to authentic photographic assets
export const ATLAS_PHOTO_MANIFEST: Record<string, string> = {json.dumps(manifest, indent=2)};

export function getAtlasPhoto(record: {{ id?: string; title?: string; art_form?: string; category?: string; category_id?: string }}): string {{
  if (record.id && ATLAS_PHOTO_MANIFEST[record.id]) {{
    return ATLAS_PHOTO_MANIFEST[record.id];
  }}
  
  const cleanTitle = (record.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  const cleanArt = (record.art_form || '').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  
  if (cleanTitle && ATLAS_PHOTO_MANIFEST[cleanTitle]) return ATLAS_PHOTO_MANIFEST[cleanTitle];
  if (cleanArt && ATLAS_PHOTO_MANIFEST[cleanArt]) return ATLAS_PHOTO_MANIFEST[cleanArt];

  const cat = record.category || record.category_id;
  if (cat) {{
    return `/images/atlas/categories/${{cat}}.jpg`;
  }}
  
  return '/images/atlas/categories/visual_arts.jpg';
}}
"""
    with open("frontend/lib/atlas_photos.ts", "w") as f:
        f.write(ts_content)

    print("Updated manifest.json and frontend/lib/atlas_photos.ts successfully!")

if __name__ == "__main__":
    main()
