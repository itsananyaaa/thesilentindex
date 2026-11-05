"""Generate museum-grade SVG illustrations for Indian heritage entities and categories.
Guarantees 100% offline, zero-buffering, high-res visual assets matching The Silence Index design system.
"""
import os

OUTPUT_DIR = "frontend/public/images/heritage"
os.makedirs(OUTPUT_DIR, exist_ok=True)

SVGS = {
    "pashmina_weaving.svg": {
        "title": "KASHMIR PASHMINA",
        "subtitle": "Changthangi Cashmere Loom Weaving",
        "badge": "GI REGISTERED • JAMMU & KASHMIR",
        "bg_dark": "#2E1013",
        "bg_light": "#4A1C20",
        "accent": "#C8A24A",
        "symbol": """
        <!-- Paisley / Buta motif -->
        <path d="M 320,180 C 270,180 230,220 230,270 C 230,330 280,370 320,410 C 360,370 410,330 410,270 C 410,220 370,180 320,180 Z" fill="#C8A24A" opacity="0.35"/>
        <path d="M 320,200 C 285,200 255,230 255,270 C 255,315 295,350 320,380 C 345,350 385,315 385,270 C 385,230 355,200 320,200 Z" fill="#B0673A" opacity="0.6"/>
        <circle cx="320" cy="270" r="28" fill="#F6EEDB" opacity="0.9"/>
        <path d="M 320,220 Q 340,250 320,280 Q 300,310 320,340" stroke="#2E1013" stroke-width="4" fill="none"/>
        """
    },
    "sozani_needlework.svg": {
        "title": "SOZANI NEEDLEWORK",
        "subtitle": "Kashmiri Fine Suzani Needlepoint",
        "badge": "GI REGISTERED • JAMMU & KASHMIR",
        "bg_dark": "#3F4220",
        "bg_light": "#555A2B",
        "accent": "#D4AF37",
        "symbol": """
        <!-- Fine Floral Needlepoint -->
        <circle cx="320" cy="280" r="70" fill="none" stroke="#D4AF37" stroke-width="3" stroke-dasharray="6,4"/>
        <circle cx="320" cy="280" r="45" fill="#D4AF37" opacity="0.4"/>
        <circle cx="320" cy="280" r="20" fill="#F6EEDB"/>
        <!-- Needle rays -->
        <line x1="320" y1="170" x2="320" y2="390" stroke="#F6EEDB" stroke-width="2"/>
        <line x1="210" y1="280" x2="430" y2="280" stroke="#F6EEDB" stroke-width="2"/>
        <line x1="242" y1="202" x2="398" y2="358" stroke="#D4AF37" stroke-width="2"/>
        <line x1="398" y1="202" x2="242" y2="358" stroke="#D4AF37" stroke-width="2"/>
        """
    },
    "kani_weaving.svg": {
        "title": "KANI SHAWL WEAVING",
        "subtitle": "Talim Coded Spool Loom Pattern",
        "badge": "GI REGISTERED • JAMMU & KASHMIR",
        "bg_dark": "#4A1C20",
        "bg_light": "#6B2F27",
        "accent": "#E6C260",
        "symbol": """
        <!-- Loom Warps & Weft Kanis -->
        <g stroke="#E6C260" stroke-width="3" opacity="0.8">
          <line x1="220" y1="200" x2="420" y2="200"/>
          <line x1="220" y1="240" x2="420" y2="240"/>
          <line x1="220" y1="280" x2="420" y2="280"/>
          <line x1="220" y1="320" x2="420" y2="320"/>
          <line x1="220" y1="360" x2="420" y2="360"/>
        </g>
        <!-- Diamond Pattern Grid -->
        <polygon points="320,210 390,280 320,350 250,280" fill="#E6C260" opacity="0.45" stroke="#F6EEDB" stroke-width="3"/>
        <polygon points="320,240 360,280 320,320 280,280" fill="#F6EEDB" opacity="0.85"/>
        """
    },
    "walnut_wood_carving.svg": {
        "title": "WALNUT WOOD CARVING",
        "subtitle": "Relief Chinar Foliage on Juglans Regia",
        "badge": "GI REGISTERED • JAMMU & KASHMIR",
        "bg_dark": "#3B2219",
        "bg_light": "#543324",
        "accent": "#D4A373",
        "symbol": """
        <!-- Carved Chinar Leaf -->
        <path d="M 320,190 C 335,230 380,240 370,270 C 360,290 385,320 365,340 C 345,330 330,360 320,380 C 310,360 295,330 275,340 C 255,320 280,290 270,270 C 260,240 305,230 320,190 Z" fill="#D4A373" stroke="#F6EEDB" stroke-width="3" opacity="0.85"/>
        <line x1="320" y1="200" x2="320" y2="380" stroke="#3B2219" stroke-width="3"/>
        """
    },
    "ladakh_raw_pashm.svg": {
        "title": "LADAKH RAW PASHM",
        "subtitle": "High Altitude Changthang Fibre",
        "badge": "GI REGISTERED • LADAKH",
        "bg_dark": "#1F2833",
        "bg_light": "#37474F",
        "accent": "#C5A059",
        "symbol": """
        <!-- Changthang Mountain Peak & Fleece Waves -->
        <polygon points="320,200 410,340 230,340" fill="#C5A059" opacity="0.6"/>
        <polygon points="320,200 350,250 290,250" fill="#F6EEDB"/>
        <path d="M 230,360 Q 275,340 320,360 Q 365,380 410,360" fill="none" stroke="#F6EEDB" stroke-width="4"/>
        """
    },
    "traditional_apricot_cultivation.svg": {
        "title": "LADAKH RAKTSEY KARPO",
        "subtitle": "Sweet White Kernel Apricot",
        "badge": "GI REGISTERED • LADAKH",
        "bg_dark": "#5D2E16",
        "bg_light": "#8C4A26",
        "accent": "#E8A87C",
        "symbol": """
        <circle cx="320" cy="280" r="65" fill="#E8A87C" opacity="0.85" stroke="#F6EEDB" stroke-width="3"/>
        <path d="M 320,215 C 330,240 335,270 320,345" fill="none" stroke="#5D2E16" stroke-width="3"/>
        <path d="M 320,215 C 310,180 340,170 360,185 C 360,205 340,215 320,215 Z" fill="#3F4220"/>
        """
    },
    "buddhist_architectural_carving.svg": {
        "title": "LADAKHI WOOD CARVING",
        "subtitle": "Monastery Pillars & Capital Mandalas",
        "badge": "HERITAGE TRADITION • LADAKH",
        "bg_dark": "#2B1A29",
        "bg_light": "#4A2846",
        "accent": "#E0A96D",
        "symbol": """
        <!-- Lotus Capital & Bracket -->
        <rect x="250" y="320" width="140" height="40" fill="#E0A96D" rx="4"/>
        <rect x="280" y="270" width="80" height="50" fill="#F6EEDB" rx="2"/>
        <polygon points="230,240 410,240 370,270 270,270" fill="#E0A96D" stroke="#F6EEDB" stroke-width="2"/>
        <circle cx="320" cy="295" r="14" fill="#2B1A29"/>
        """
    },
    "phulkari_embroidery.svg": {
        "title": "PHULKARI EMBROIDERY",
        "subtitle": "Geometric Silk Floss on Khaddar",
        "badge": "GI REGISTERED • MULTI-STATE",
        "bg_dark": "#68131B",
        "bg_light": "#8F252C",
        "accent": "#F4B41A",
        "symbol": """
        <!-- Geometric Star / Bagh Pattern -->
        <polygon points="320,190 350,250 410,250 365,290 380,350 320,315 260,350 275,290 230,250 290,250" fill="#F4B41A" stroke="#F6EEDB" stroke-width="3"/>
        <circle cx="320" cy="275" r="22" fill="#68131B"/>
        """
    },
    "traditional_basmati_cultivation.svg": {
        "title": "BASMATI CULTIVATION",
        "subtitle": "Aromatic Long Grain Paddy Heritage",
        "badge": "GI REGISTERED • MULTI-STATE (7 STATES)",
        "bg_dark": "#2A3B18",
        "bg_light": "#415C25",
        "accent": "#D8C384",
        "symbol": """
        <!-- Paddy Grain Cluster -->
        <path d="M 320,370 C 320,310 280,260 270,220 C 300,230 320,270 320,370 Z" fill="#D8C384" opacity="0.85"/>
        <path d="M 320,370 C 320,310 360,260 370,220 C 340,230 320,270 320,370 Z" fill="#D8C384" opacity="0.85"/>
        <path d="M 320,370 L 320,190" stroke="#F6EEDB" stroke-width="3"/>
        """
    },
    "kolhapuri_leathercraft.svg": {
        "title": "KOLHAPURI CHAPPAL",
        "subtitle": "Vegetable Tanned Braided Leathercraft",
        "badge": "GI REGISTERED • MH & KA",
        "bg_dark": "#42281D",
        "bg_light": "#613D2F",
        "accent": "#D19C65",
        "symbol": """
        <!-- Sole & Braided Strap -->
        <path d="M 320,190 C 360,190 375,240 365,300 C 355,350 350,380 320,380 C 290,380 285,350 275,300 C 265,240 280,190 320,190 Z" fill="#D19C65" opacity="0.75" stroke="#F6EEDB" stroke-width="3"/>
        <circle cx="320" cy="235" r="16" fill="#F6EEDB"/>
        """
    },
    "madhubani_painting.svg": {
        "title": "MADHUBANI PAINTING",
        "subtitle": "Mithila Double-Line Folk Iconography",
        "badge": "GI REGISTERED • BIHAR",
        "bg_dark": "#591C21",
        "bg_light": "#7D2830",
        "accent": "#E5A93B",
        "symbol": """
        <!-- Stylized Fish & Lotus Iconography -->
        <path d="M 230,280 C 270,230 370,230 410,280 C 370,330 270,330 230,280 Z" fill="#E5A93B" opacity="0.75" stroke="#F6EEDB" stroke-width="3"/>
        <circle cx="370" cy="280" r="10" fill="#591C21"/>
        <path d="M 230,280 L 195,255 L 210,280 L 195,305 Z" fill="#E5A93B"/>
        """
    },
    "thanjavur_painting.svg": {
        "title": "THANJAVUR PAINTINGS",
        "subtitle": "22k Gold Foil & Semi-Precious Relief",
        "badge": "GI REGISTERED • TAMIL NADU",
        "bg_dark": "#2E1C0C",
        "bg_light": "#4F3218",
        "accent": "#FFD700",
        "symbol": """
        <!-- Classical Arch & Architrave -->
        <path d="M 240,360 L 240,260 C 240,210 400,210 400,260 L 400,360" fill="none" stroke="#FFD700" stroke-width="8"/>
        <circle cx="320" cy="280" r="36" fill="#FFD700" opacity="0.8"/>
        <polygon points="320,185 340,215 300,215" fill="#FFD700"/>
        """
    },
    "konark_sun_temple.svg": {
        "title": "KONARK SUN TEMPLE",
        "subtitle": "13th c. Kalinga Solar Chariot Wheels",
        "badge": "UNESCO WORLD HERITAGE • ODISHA",
        "bg_dark": "#36261E",
        "bg_light": "#543C30",
        "accent": "#D4A373",
        "symbol": """
        <!-- Sun Chariot 8-Spoke Wheel -->
        <circle cx="320" cy="280" r="75" fill="none" stroke="#D4A373" stroke-width="8"/>
        <circle cx="320" cy="280" r="24" fill="#D4A373"/>
        <g stroke="#D4A373" stroke-width="4">
          <line x1="320" y1="205" x2="320" y2="355"/>
          <line x1="245" y1="280" x2="395" y2="280"/>
          <line x1="267" y1="227" x2="373" y2="333"/>
          <line x1="373" y1="227" x2="267" y2="333"/>
        </g>
        """
    },
    "chola_bronze.svg": {
        "title": "CHOLA BRONZES",
        "subtitle": "Lost-Wax Cosmic Nataraja Casting",
        "badge": "NATIONAL ARCHIVE • TAMIL NADU",
        "bg_dark": "#1F2321",
        "bg_light": "#333A36",
        "accent": "#C9A050",
        "symbol": """
        <!-- Tiruvasi Flaming Aureole Ring -->
        <circle cx="320" cy="280" r="85" fill="none" stroke="#C9A050" stroke-width="5" stroke-dasharray="10,6"/>
        <circle cx="320" cy="280" r="45" fill="none" stroke="#C9A050" stroke-width="3"/>
        <line x1="320" y1="220" x2="320" y2="340" stroke="#F6EEDB" stroke-width="4"/>
        <line x1="260" y1="260" x2="380" y2="260" stroke="#F6EEDB" stroke-width="4"/>
        """
    },
    "kathakali_dance.svg": {
        "title": "KATHAKALI PERFORMANCE",
        "subtitle": "Paccha Make-Up & Kireedam Headdress",
        "badge": "INTANGIBLE HERITAGE • KERALA",
        "bg_dark": "#1C3322",
        "bg_light": "#2D4F36",
        "accent": "#8CD867",
        "symbol": """
        <!-- Kireedam Crown and Face Contour -->
        <polygon points="320,180 360,250 280,250" fill="#E6C260" stroke="#F6EEDB" stroke-width="2"/>
        <circle cx="320" cy="295" r="45" fill="#8CD867" opacity="0.8" stroke="#F6EEDB" stroke-width="3"/>
        <path d="M 295,290 Q 320,310 345,290" fill="none" stroke="#1C3322" stroke-width="4"/>
        """
    },
    "saraswati_veena.svg": {
        "title": "SARASWATI VEENA",
        "subtitle": "Thanjavur Carved Kudam & Frets",
        "badge": "GI REGISTERED • TAMIL NADU",
        "bg_dark": "#361B1B",
        "bg_light": "#542D2D",
        "accent": "#E5B25D",
        "symbol": """
        <!-- Kudam Resonator & Dandi -->
        <circle cx="270" cy="310" r="45" fill="#E5B25D" opacity="0.8"/>
        <rect x="260" y="190" width="120" height="20" rx="4" transform="rotate(-30 320 250)" fill="#E5B25D"/>
        <circle cx="370" cy="210" r="22" fill="#E5B25D" opacity="0.6"/>
        """
    },
    "theyyam_ritual.svg": {
        "title": "THEYYAM PERFORMANCE",
        "subtitle": "Living Ancestral Ritual Dance",
        "badge": "INTANGIBLE HERITAGE • KERALA",
        "bg_dark": "#521414",
        "bg_light": "#7D1C1C",
        "accent": "#FFA500",
        "symbol": """
        <!-- Grand Headdress Crown -->
        <path d="M 230,340 C 230,220 410,220 410,340 Z" fill="#FFA500" opacity="0.75" stroke="#F6EEDB" stroke-width="3"/>
        <circle cx="320" cy="300" r="25" fill="#521414"/>
        """
    }
}

TEMPLATE = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480" width="640" height="480">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="{bg_dark}"/>
      <stop offset="100%" stop-color="{bg_light}"/>
    </linearGradient>
    <pattern id="jali" width="30" height="30" patternUnits="userSpaceOnUse">
      <path d="M 0,15 L 15,0 L 30,15 L 15,30 Z" fill="none" stroke="{accent}" stroke-width="0.75" opacity="0.15"/>
    </pattern>
  </defs>

  <!-- Background -->
  <rect width="640" height="480" fill="url(#bgGrad)"/>
  <rect width="640" height="480" fill="url(#jali)"/>

  <!-- Museum Frame Borders -->
  <rect x="16" y="16" width="608" height="448" fill="none" stroke="{accent}" stroke-width="2" opacity="0.8"/>
  <rect x="22" y="22" width="596" height="436" fill="none" stroke="{accent}" stroke-width="0.75" opacity="0.4"/>

  <!-- Corner Brackets -->
  <path d="M 16,40 L 40,40 L 40,16" fill="none" stroke="{accent}" stroke-width="3"/>
  <path d="M 624,40 L 600,40 L 600,16" fill="none" stroke="{accent}" stroke-width="3"/>
  <path d="M 16,440 L 40,440 L 40,464" fill="none" stroke="{accent}" stroke-width="3"/>
  <path d="M 624,440 L 600,440 L 600,464" fill="none" stroke="{accent}" stroke-width="3"/>

  <!-- Header Banner -->
  <rect x="140" y="38" width="360" height="26" fill="{bg_dark}" stroke="{accent}" stroke-width="1" rx="2"/>
  <text x="320" y="55" font-family="'Cinzel', Georgia, serif" font-size="10" font-weight="bold" fill="{accent}" text-anchor="middle" letter-spacing="2">
    {badge}
  </text>

  <!-- Central Symbol -->
  {symbol}

  <!-- Lower Title Plaque -->
  <rect x="40" y="385" width="560" height="65" fill="{bg_dark}" opacity="0.9" stroke="{accent}" stroke-width="1.5" rx="3"/>
  <text x="320" y="415" font-family="'Cinzel', Georgia, serif" font-size="20" font-weight="bold" fill="#F6EEDB" text-anchor="middle" letter-spacing="1.5">
    {title}
  </text>
  <text x="320" y="438" font-family="system-ui, sans-serif" font-size="11" fill="{accent}" text-anchor="middle" opacity="0.9">
    {subtitle}
  </text>
</svg>"""

for fname, d in SVGS.items():
    svg_code = TEMPLATE.format(
        bg_dark=d["bg_dark"],
        bg_light=d["bg_light"],
        accent=d["accent"],
        title=d["title"],
        subtitle=d["subtitle"],
        badge=d["badge"],
        symbol=d["symbol"]
    )
    path = os.path.join(OUTPUT_DIR, fname)
    with open(path, "w", encoding="utf-8") as f:
        f.write(svg_code)
    print(f"Generated {path}")

# Generate default category fallbacks as well
CATEGORIES = [
    ("visual_arts", "Visual Arts & Paintings", "#591C21", "#7D2830", "#E5A93B"),
    ("architecture", "Architecture & Monuments", "#36261E", "#543C30", "#D4A373"),
    ("textiles_crafts", "Textiles, Weaving & Crafts", "#2E1013", "#4A1C20", "#C8A24A"),
    ("manuscripts_literature", "Manuscripts & Epigraphy", "#3F4220", "#555A2B", "#D4AF37"),
    ("music_instruments", "Music & Musical Instruments", "#361B1B", "#542D2D", "#E5B25D"),
    ("dance_performance", "Dance & Performing Arts", "#1C3322", "#2D4F36", "#8CD867"),
    ("oral_traditions", "Oral Histories & Narratives", "#4A2846", "#683A62", "#E0A96D"),
    ("ritual_heritage", "Ritual & Sacred Practices", "#521414", "#7D1C1C", "#FFA500"),
    ("sculpture_material", "Sculpture & Metalwork", "#1F2321", "#333A36", "#C9A050")
]

for cat_id, cat_title, dark, light, accent in CATEGORIES:
    d = {
        "bg_dark": dark,
        "bg_light": light,
        "accent": accent,
        "title": cat_title.upper(),
        "subtitle": "National Cultural Heritage Catalog",
        "badge": "AUTHENTIC CULTURAL TRADITION",
        "symbol": f"""
        <circle cx="320" cy="280" r="75" fill="none" stroke="{accent}" stroke-width="4" stroke-dasharray="10,6"/>
        <circle cx="320" cy="280" r="40" fill="{accent}" opacity="0.4"/>
        <circle cx="320" cy="280" r="16" fill="#F6EEDB"/>
        """
    }
    path = os.path.join(OUTPUT_DIR, f"{cat_id}.svg")
    with open(path, "w", encoding="utf-8") as f:
        f.write(TEMPLATE.format(**d))
    print(f"Generated {path}")

# Now, dynamically query all entities from the database and generate individual artwork for each!
try:
    from backend.app.db import SessionLocal
    from backend.app.models import HeritageEntity
    import re

    db = SessionLocal()
    entities = db.query(HeritageEntity).all()
    print(f"Generating SVG artwork for {len(entities)} registered heritage entities...")

    palette_cycle = [
        ("#2E1013", "#4A1C20", "#C8A24A"),
        ("#3F4220", "#555A2B", "#D4AF37"),
        ("#4A1C20", "#6B2F27", "#E6C260"),
        ("#3B2219", "#543324", "#D4A373"),
        ("#1F2833", "#37474F", "#C5A059"),
        ("#5D2E16", "#8C4A26", "#E8A87C"),
        ("#381920", "#582833", "#E3AC52"),
        ("#1A3038", "#2E4D5A", "#64B5F6"),
        ("#3E2723", "#5D4037", "#FFB74D"),
        ("#212121", "#424242", "#E0E0E0"),
    ]

    for idx, e in enumerate(entities):
        slug = re.sub(r'[^a-z0-9]+', '_', e.label.lower()).strip('_')
        fname = f"{slug}.svg"
        path = os.path.join(OUTPUT_DIR, fname)
        if os.path.exists(path):
            continue  # Already generated with hand-crafted motifs
        
        dark, light, accent = palette_cycle[idx % len(palette_cycle)]
        state_str = ", ".join(e.primary_state_codes) if e.primary_state_codes else "INDIA"
        category_clean = (e.category_id or "Heritage").replace("_", " ").title()

        ent_d = {
            "bg_dark": dark,
            "bg_light": light,
            "accent": accent,
            "title": e.label.upper()[:30],
            "subtitle": f"{category_clean} • {state_str}",
            "badge": f"{e.entity_type.upper()} • {state_str}",
            "symbol": f"""
            <circle cx="320" cy="280" r="72" fill="none" stroke="{accent}" stroke-width="3" stroke-dasharray="8,6"/>
            <polygon points="320,218 375,273 320,328 265,273" fill="{accent}" opacity="0.35" stroke="#F6EEDB" stroke-width="2"/>
            <circle cx="320" cy="273" r="24" fill="#F6EEDB" opacity="0.9"/>
            <circle cx="320" cy="273" r="10" fill="{dark}"/>
            """
        }
        with open(path, "w", encoding="utf-8") as f:
            f.write(TEMPLATE.format(**ent_d))
        print(f"Generated {path}")

except Exception as err:
    print(f"Note: Dynamic entity DB query encountered: {err}")

print("All heritage SVG illustrations generated successfully.")
