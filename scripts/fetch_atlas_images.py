"""Fetch authentic cultural heritage photographs for the Cultural Atlas.
Uses Wikipedia Open APIs (opensearch + REST page summary) to source genuine,
openly-licensed photographs for Indian cultural heritage traditions.
"""
import os
import re
import json
import time
import urllib.request
import urllib.parse

USER_AGENT = "TheSilentIndex-CulturalAtlas/1.0 (https://thesilentindex.vercel.app; cultural-heritage-research)"
OUTPUT_DIR = os.path.abspath("frontend/public/images/atlas")
CAT_DIR = os.path.join(OUTPUT_DIR, "categories")

os.makedirs(OUTPUT_DIR, exist_ok=True)
os.makedirs(CAT_DIR, exist_ok=True)

# 36 Primary Atlas records + specific search queries
ATLAS_TARGETS = [
    {
        "id": "FUSED-REC-GI-46",
        "key": "kashmir_pashmina",
        "queries": ["Pashmina shawl Kashmir", "Pashmina", "Cashmere wool"]
    },
    {
        "id": "FUSED-REC-GI-47",
        "key": "kashmir_sozani_craft",
        "queries": ["Kashmiri needlework", "Sozani", "Kashmir embroidery"]
    },
    {
        "id": "FUSED-REC-GI-48",
        "key": "kani_shawl",
        "queries": ["Kani shawl", "Pashmina shawl"]
    },
    {
        "id": "FUSED-REC-GI-182",
        "key": "kashmir_walnut_wood_carving",
        "queries": ["Kashmir walnut wood carving", "Wood carving Kashmir"]
    },
    {
        "id": "FUSED-REC-GI-752",
        "key": "ladakh_pashmina",
        "queries": ["Changthangi goat", "Ladakh Pashmina", "Cashmere goat"]
    },
    {
        "id": "FUSED-REC-GI-753",
        "key": "ladakh_raktsey_karpo_apricot",
        "queries": ["Apricots Ladakh", "Apricot fruit", "Ladakh apricot"]
    },
    {
        "id": "FUSED-REC-GI-754",
        "key": "ladakh_wood_carving",
        "queries": ["Ladakh monastery wood carving", "Tibetan wood carving", "Ladakh monastery"]
    },
    {
        "id": "FUSED-REC-GI-145",
        "key": "phulkari",
        "queries": ["Phulkari", "Phulkari embroidery Punjab"]
    },
    {
        "id": "FUSED-REC-GI-1452",
        "key": "basmati_rice",
        "queries": ["Basmati rice", "Basmati paddy"]
    },
    {
        "id": "FUSED-REC-GI-544",
        "key": "kolhapuri_chappal",
        "queries": ["Kolhapuri chappal", "Kolhapuri footwear"]
    },
    {
        "id": "FUSED-REC-GI-19",
        "key": "kullu_shawl",
        "queries": ["Kullu shawl", "Himachal shawl weaving"]
    },
    {
        "id": "FUSED-REC-GI-218",
        "key": "chamba_rumal",
        "queries": ["Chamba Rumal", "Chamba embroidery"]
    },
    {
        "id": "FUSED-REC-GI-464",
        "key": "kangra_paintings",
        "queries": ["Kangra painting", "Pahari miniature painting"]
    },
    {
        "id": "FUSED-REC-GI-516",
        "key": "uttarakhand_aipan_art",
        "queries": ["Aipan art", "Aipan Uttarakhand", "Kumaoni art"]
    },
    {
        "id": "FUSED-REC-GI-517",
        "key": "ringal_craft_of_uttarakhand",
        "queries": ["Bamboo craft Uttarakhand", "Bamboo weaving", "Ringal craft"]
    },
    {
        "id": "FUSED-REC-GI-518",
        "key": "thulma_blanket",
        "queries": ["Bhotia blanket", "Woollen blanket handloom", "Traditional blanket India"]
    },
    {
        "id": "FUSED-REC-GI-99",
        "key": "banaras_brocades_and_sarees",
        "queries": ["Banarasi sari", "Varanasi silk brocade", "Banarasi silk"]
    },
    {
        "id": "FUSED-REC-GI-119",
        "key": "lucknow_chikan_craft",
        "queries": ["Chikankari", "Chikan embroidery", "Lucknow chikan"]
    },
    {
        "id": "FUSED-REC-GI-242",
        "key": "moradabad_metal_craft",
        "queries": ["Moradabad brass craft", "Brassware India", "Engraved brassware"]
    },
    {
        "id": "FUSED-REC-GI-397",
        "key": "gorakhpur_terracotta",
        "queries": ["Gorakhpur terracotta", "Terracotta elephant craft", "Terracotta India"]
    },
    {
        "id": "FUSED-REC-GI-105",
        "key": "madhubani_paintings",
        "queries": ["Madhubani painting", "Mithila art"]
    },
    {
        "id": "FUSED-REC-GI-106",
        "key": "applique_khatwa_work_of_bihar",
        "queries": ["Khatwa applique Bihar", "Appliqué work India", "Applique textile"]
    },
    {
        "id": "FUSED-REC-GI-107",
        "key": "sujini_embroidery_work_of_bihar",
        "queries": ["Sujani embroidery", "Sujani Bihar", "Kantha quilt"]
    },
    {
        "id": "FUSED-REC-GI-189",
        "key": "sikki_grass_products_of_bihar",
        "queries": ["Sikki grass craft", "Golden grass craft", "Grass craft Bihar"]
    },
    {
        "id": "FUSED-REC-GI-1",
        "key": "darjeeling_tea",
        "queries": ["Darjeeling tea", "Tea garden Darjeeling", "Tea pluckers Darjeeling"]
    },
    {
        "id": "FUSED-REC-GI-71",
        "key": "nakshi_kantha",
        "queries": ["Nakshi kantha", "Kantha embroidery", "Kantha quilt"]
    },
    {
        "id": "FUSED-REC-GI-536",
        "key": "purulia_chhau_mask",
        "queries": ["Chhau mask", "Purulia Chhau mask", "Chhau dance"]
    },
    {
        "id": "FUSED-REC-GI-538",
        "key": "bankura_panchmura_terracotta_horse",
        "queries": ["Bankura horse", "Panchmura terracotta horse", "Bishnupur terracotta"]
    },
    {
        "id": "FUSED-REC-GI-86",
        "key": "odisha_pattachitra",
        "queries": ["Pattachitra", "Raghurajpur pattachitra", "Orissa painting"]
    },
    {
        "id": "FUSED-REC-GI-87",
        "key": "kotpad_handloom_fabrics",
        "queries": ["Kotpad Handloom fabrics", "Kotpad textile", "Tribal handloom Odisha"]
    },
    {
        "id": "FUSED-REC-GI-88",
        "key": "pipili_applique_work",
        "queries": ["Pipili applique work", "Pipili", "Odisha applique"]
    },
    {
        "id": "FUSED-REC-GI-136",
        "key": "konark_stone_carving",
        "queries": ["Konark Sun Temple wheel", "Konark Sun Temple sculpture", "Konark Sun Temple"]
    },
    {
        "id": "FUSED-REC-GI-645",
        "key": "sohrai_and_khovar_painting_of_jharkhand",
        "queries": ["Sohrai and Khovar painting", "Sohrai painting", "Khovar painting"]
    },
    {
        "id": "FUSED-REC-GI-83",
        "key": "bastar_dhokra",
        "queries": ["Dhokra metal casting", "Dhokra", "Lost wax casting India"]
    },
    {
        "id": "FUSED-REC-GI-84",
        "key": "bastar_wooden_craft",
        "queries": ["Bastar wooden craft", "Bastar tribal wood", "Wood craft Bastar"]
    },
    {
        "id": "FUSED-REC-GI-85",
        "key": "bastar_iron_craft",
        "queries": ["Bastar iron craft", "Wrought iron Bastar", "Tribal iron craft"]
    }
]

# 9 Category Heroes
CATEGORY_HEROES = [
    {
        "cat": "textiles_crafts",
        "queries": ["Textiles of India", "Sari weaving India", "Indian textile handloom"]
    },
    {
        "cat": "visual_arts",
        "queries": ["Indian painting", "Miniature painting India", "Tanjore painting"]
    },
    {
        "cat": "sculpture_material",
        "queries": ["Chola bronzes", "Nataraja bronze", "Indian bronze sculpture"]
    },
    {
        "cat": "architecture",
        "queries": ["Brihadisvara Temple, Thanjavur", "Konark Sun Temple", "Indian temple architecture"]
    },
    {
        "cat": "dance_performance",
        "queries": ["Kathakali", "Bharatanatyam", "Classical Indian dance"]
    },
    {
        "cat": "music_instruments",
        "queries": ["Saraswati veena", "Sitar", "Mridangam", "Indian musical instruments"]
    },
    {
        "cat": "manuscripts_literature",
        "queries": ["Palm-leaf manuscript", "Birch bark manuscript", "Ancient Sanskrit manuscript"]
    },
    {
        "cat": "ritual_heritage",
        "queries": ["Theyyam", "Kumbh Mela", "Durga Puja festival Kolkata"]
    },
    {
        "cat": "oral_traditions",
        "queries": ["Vedic chant", "Baul singer Bengal", "Oral tradition India"]
    }
]

def get_page_image(title: str) -> str | None:
    url = f"https://en.wikipedia.org/api/rest_v1/page/summary/{urllib.parse.quote(title)}"
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            if "thumbnail" in data and "source" in data["thumbnail"]:
                return data["thumbnail"]["source"]
            if "originalimage" in data and "source" in data["originalimage"]:
                return data["originalimage"]["source"]
    except Exception:
        pass
    return None

def search_wikipedia_image(query: str) -> tuple[str | None, str | None]:
    search_url = f"https://en.wikipedia.org/w/api.php?action=opensearch&search={urllib.parse.quote(query)}&limit=4&namespace=0&format=json"
    req = urllib.request.Request(search_url, headers={"User-Agent": USER_AGENT})
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            titles = data[1] if len(data) > 1 else []
            for t in titles:
                img = get_page_image(t.replace(" ", "_"))
                if img:
                    return t, img
    except Exception:
        pass
    return None, None

def download_and_save(img_url: str, dest_path: str) -> bool:
    req = urllib.request.Request(img_url, headers={"User-Agent": USER_AGENT})
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = resp.read()
            if len(data) > 3000:
                with open(dest_path, "wb") as f:
                    f.write(data)
                return True
    except Exception as e:
        print(f"    Download error: {e}")
    return False

def resolve_photo_for_queries(queries: list[str]) -> tuple[str | None, str | None]:
    for q in queries:
        title, img = search_wikipedia_image(q)
        if img:
            return title, img
        # Also try direct page summary
        img = get_page_image(q.replace(" ", "_"))
        if img:
            return q, img
        time.sleep(0.1)
    return None, None

def main():
    print("=== Downloading Authentic Cultural Heritage Photographs ===")
    
    # 1. Category Heroes
    for item in CATEGORY_HEROES:
        cat = item["cat"]
        dest = os.path.join(CAT_DIR, f"{cat}.jpg")
        if os.path.exists(dest) and os.path.getsize(dest) > 3000:
            print(f"[OK] Category hero {cat} already cached ({os.path.getsize(dest)} bytes)")
            continue
        print(f"Resolving Category Hero: {cat}...")
        title, img_url = resolve_photo_for_queries(item["queries"])
        if img_url and download_and_save(img_url, dest):
            print(f"  -> Saved {dest} ({os.path.getsize(dest)} bytes) from '{title}'")
        else:
            print(f"  -> Failed to resolve hero for {cat}")
        time.sleep(0.2)

    # 2. 36 Primary Atlas Targets
    manifest = {}
    for target in ATLAS_TARGETS:
        key = target["key"]
        dest = os.path.join(OUTPUT_DIR, f"{key}.jpg")
        manifest[target["id"]] = f"/images/atlas/{key}.jpg"
        manifest[key] = f"/images/atlas/{key}.jpg"

        if os.path.exists(dest) and os.path.getsize(dest) > 3000:
            print(f"[OK] {key} already cached ({os.path.getsize(dest)} bytes)")
            continue

        print(f"Resolving: {key}...")
        title, img_url = resolve_photo_for_queries(target["queries"])
        if img_url and download_and_save(img_url, dest):
            print(f"  -> Saved {dest} ({os.path.getsize(dest)} bytes) from '{title}'")
        else:
            print(f"  -> FAILED to resolve for {key}")
        time.sleep(0.2)

    # Save manifest.json
    manifest_path = os.path.join(OUTPUT_DIR, "manifest.json")
    with open(manifest_path, "w") as f:
        json.dump(manifest, f, indent=2)
    print(f"\nManifest successfully written to {manifest_path}")

if __name__ == "__main__":
    main()
