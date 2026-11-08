"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { CornerFiligree } from "@/components/ornament/CornerFiligree";
import { StatusBadge } from "@/components/StatusBadge";
import { StatusLegend } from "@/components/StatusLegend";
import { Layers, Search, Filter, ChevronRight, Eye, Sparkles } from "lucide-react";
import { getActiveCollection } from "@/lib/collection";
import { getAtlasPhoto } from "@/lib/atlas_photos";

// Curated prestigious titles for primary living tradition cards
const CURATED_TITLES: Record<string, string> = {
  "FUSED-REC-REAL-0144": "Hindustani Classical Sitar",
  "REC-REAL-0144": "Hindustani Classical Sitar",
  "FUSED-REC-COMMONS-515": "Thanjavur Saraswati Veena",
  "REC-COMMONS-515": "Thanjavur Saraswati Veena",
  "FUSED-REC-REAL-0149": "Classical Mridangam Traditions",
  "REC-REAL-0149": "Classical Mridangam Traditions",
  "FUSED-REC-REAL-0153": "Benaras Shehnai Musical Tradition",
  "REC-REAL-0153": "Benaras Shehnai Musical Tradition",
  "FUSED-REC-UNESCO-00845": "Manipuri Sankirtana Sacred Music & Dance",
  "REC-UNESCO-00845": "Manipuri Sankirtana Sacred Music & Dance",
  "FUSED-REC-REAL-0175": "Kerala Theyyam Sacred Fire Ritual",
  "REC-REAL-0175": "Kerala Theyyam Sacred Fire Ritual",
  "FUSED-REC-COMMONS-516": "Kathakali Classical Dance-Drama of Kerala",
  "REC-COMMONS-516": "Kathakali Classical Dance-Drama of Kerala",
  "FUSED-REC-REAL-0161": "Bharatanatyam Classical Dance Mudras",
  "REC-REAL-0161": "Bharatanatyam Classical Dance Mudras",
  "FUSED-REC-REAL-0168": "Purulia Chhau Martial Dance",
  "REC-REAL-0168": "Purulia Chhau Martial Dance",
  "FUSED-REC-COMMONS-501": "Mithila Kohbar Painting by Sita Devi",
  "REC-COMMONS-501": "Mithila Kohbar Painting by Sita Devi",
  "FUSED-REC-COMMONS-503": "Warli Tarpa Ritual Dance Mural",
  "REC-COMMONS-503": "Warli Tarpa Ritual Dance Mural",
  "FUSED-REC-COMMONS-506": "Chola Shiva Nataraja Bronze in Ananda Tandava",
  "REC-COMMONS-506": "Chola Shiva Nataraja Bronze in Ananda Tandava",
  "FUSED-REC-COMMONS-507": "Mathura Sandstone Standing Buddha",
  "REC-COMMONS-507": "Mathura Sandstone Standing Buddha",
  "FUSED-REC-COMMONS-508": "Hoysala Bracket Figure (Madanika) of Belur",
  "REC-COMMONS-508": "Hoysala Bracket Figure (Madanika) of Belur",
  "FUSED-REC-COMMONS-509": "Brihadisvara Temple Granite Vimana",
  "REC-COMMONS-509": "Brihadisvara Temple Granite Vimana",
  "FUSED-REC-COMMONS-510": "Konark Sun Temple Chariot Wheel",
  "REC-COMMONS-510": "Konark Sun Temple Chariot Wheel",
};

// Curated specific noisy / raw scan IDs requested by user to exclude
const EXCLUDED_IDS = new Set([
  "FUSED-REC-REAL-0137", "REC-REAL-0137", // 1150 CE Hoysaleswara temple wall carving
  "FUSED-REC-REAL-0138", "REC-REAL-0138", // KAHLB 221238 South wall Surya shrine
  "FUSED-REC-REAL-0139", "REC-REAL-0139", // The Indian Listener Vol. XXII No. 17.pdf
  "FUSED-REC-REAL-0140", "REC-REAL-0140", // The Indian Listener Vol. XXII No. 20.pdf
  "FUSED-REC-REAL-0141", "REC-REAL-0141", // The Indian Listener Vol. XXII No. 26.pdf
  "FUSED-REC-REAL-0142", "REC-REAL-0142", // Hindu music from various authors (IA)
  "FUSED-REC-REAL-0143", "REC-REAL-0143", // Pandit Manilal Nag
  "FUSED-REC-REAL-0145", "REC-REAL-0145", // The Indian Listener Vol. XXII No. 21.pdf
  "FUSED-REC-REAL-0146", "REC-REAL-0146", // The music of India (IA)
  "FUSED-REC-REAL-0147", "REC-REAL-0147", // Wanderings Of A Pilgrim
  "FUSED-REC-REAL-0148", "REC-REAL-0148", // Sitar Malika PDF
  "FUSED-REC-REAL-0150", "REC-REAL-0150", // T S Nandakumar
  "FUSED-REC-REAL-0151", "REC-REAL-0151", // Bharatanatyam misclassified in music
  "FUSED-REC-REAL-0152", "REC-REAL-0152", // Umayalpuram concert video
  "FUSED-REC-REAL-0105", "REC-REAL-0105", // Footfalls of Indian history
  "FUSED-REC-REAL-0106", "REC-REAL-0106", // Footfalls of Indian history
  "FUSED-REC-REAL-0107", "REC-REAL-0107", // Footfalls of Indian history
  "FUSED-REC-REAL-0108", "REC-REAL-0108", // The Cave Temples of India
  "FUSED-REC-REAL-0109", "REC-REAL-0109", // The Cave Temples of India
  "FUSED-REC-REAL-0111", "REC-REAL-0111", // Chenar leaves poems
  "FUSED-REC-REAL-0114", "REC-REAL-0114", // Punjab industries
  "FUSED-REC-REAL-0115", "REC-REAL-0115", // Report on the trade
  "FUSED-REC-REAL-0135", "REC-REAL-0135", // Video file in manuscripts
]);

// Helper function to resolve authentic photographs for each record
function getRecordArtwork(r: any): string {
  return getAtlasPhoto(r);
}

// Check for noisy PDF / text scan records
function isNoisyRecord(r: any): boolean {
  if (EXCLUDED_IDS.has(r.id)) return true;
  const t = (r.title || "").toLowerCase();
  if (t.includes("bismillah and benaras")) return false; // Curated Benaras Shehnai
  if (
    t.endsWith(".pdf") ||
    t.endsWith(".djvu") ||
    t.endsWith(".webm") ||
    t.includes("the indian listener") ||
    t.includes("hindu music from various authors") ||
    t.includes("kahlb ") ||
    t.includes("surya shrine") ||
    t.includes("wanderings of a pilgrim") ||
    t.includes("pandit manilal nag") ||
    t.includes("t s nandakumar") ||
    (t.includes("hoysaleswara temple") && t.includes("dancing"))
  ) {
    return true;
  }
  return false;
}

// Compute deduplication key so each living tradition or monument appears ONCE
function getTraditionKey(r: any): string {
  const rid = (r.id || "").toLowerCase();
  const t = (r.title || "").toLowerCase();
  const a = (r.art_form || "").toLowerCase();
  const cat = r.category_id || r.category || "";

  // 1. User uploaded items must always be preserved uniquely
  if (rid.includes("rec-gi-85")) return "unique_user_bastar_iron_craft";
  if (rid.includes("rec-gi-88")) return "unique_user_pipili_applique";
  if (rid.includes("rec-gi-753")) return "unique_user_ladakh_apricot";
  if (rid.includes("rec-gi-87")) return "unique_user_kotpad_handloom";

  // 2. Protected State Monuments are each unique
  if (rid.includes("rec-wd-")) return `monument_${rid}`;

  // 3. Known grouped living traditions - keep 1 primary unique card per tradition
  if (t.includes("theyyam") || a.includes("theyyam")) return "trad_theyyam";
  if (t.includes("kathakali") || a.includes("kathakali")) return "trad_kathakali";
  if (t.includes("bharatanatyam") || a.includes("bharatanatyam")) return "trad_bharatanatyam";
  if (t.includes("chhau") || a.includes("chhau")) return "trad_chhau";
  if (t.includes("sitar") || a.includes("sitar")) return "trad_sitar";
  if (t.includes("veena") || a.includes("veena")) return "trad_veena";
  if (t.includes("mridangam") || a.includes("mridangam") || t.includes("mrudangam")) return "trad_mridangam";
  if (t.includes("shehnai") || a.includes("shehnai")) return "trad_shehnai";
  if (t.includes("sankirtana") || a.includes("sankirtana")) return "trad_sankirtana";
  if (t.includes("madhubani") || t.includes("mithila") || a.includes("madhubani")) return "trad_madhubani";
  if (t.includes("warli") || a.includes("warli")) return "trad_warli";
  if (t.includes("pattachitra") || a.includes("pattachitra")) return "trad_pattachitra";
  if ((t.includes("tanjore") || t.includes("thanjavur")) && cat === "visual_arts") return "trad_tanjore";
  if (a.includes("kerala mural") || (t.includes("mural") && t.includes("balussery"))) return "trad_kerala_mural";
  if (t.includes("kalighat") || a.includes("kalighat")) return "trad_kalighat";
  if (t.includes("gond") || a.includes("gond")) return "trad_gond";
  if (t.includes("chola") || a.includes("chola")) return "trad_chola";
  if (t.includes("mathura") || a.includes("mathura")) return "trad_mathura";
  if (t.includes("hoysala") || a.includes("hoysala")) return "trad_hoysala";
  if (t.includes("gandhara") || a.includes("gandhara")) return "trad_gandhara";
  if (t.includes("rani ki vav")) return "trad_rani_ki_vav";
  if (t.includes("hampi") || t.includes("vitthala")) return "trad_hampi";
  if (t.includes("konark")) return "trad_konark";
  if (t.includes("brihadisvara") && cat === "architecture") return "trad_brihadisvara";
  if (t.includes("chanderi") || a.includes("chanderi")) return "trad_chanderi";
  if (t.includes("bidri") || a.includes("bidri")) return "trad_bidri";
  if (t.includes("pashmina") || a.includes("pashmina")) return "trad_pashmina";
  if (t.includes("patola") || a.includes("patola")) return "trad_patola";
  if (t.includes("sharada") || a.includes("sharada") || t.includes("bhurjapatra")) return "trad_sharada_ms";
  if (t.includes("palm-leaf") || a.includes("palm-leaf") || t.includes("palm leaf")) return "trad_palm_leaf_ms";

  // Default: unique by art form and title
  return `${cat}_${a}_${t}`;
}

export default function CulturalAtlasPage() {
  const [activeColId, setActiveColId] = useState<string>("fused-v2");
  const [rawRecords, setRawRecords] = useState<any[]>([]);
  const [categories, setCategories] = useState<any>({});
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedState, setSelectedState] = useState<string>("");
  const [statesList, setStatesList] = useState<string[]>([]);
  const [search, setSearch] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setActiveColId(getActiveCollection());

    const handleColChange = () => {
      setActiveColId(getActiveCollection());
    };
    window.addEventListener("collection_changed", handleColChange);

    // Fetch taxonomy categories
    fetch("/api/config/taxonomy")
      .then((r) => r.json())
      .then((d) => setCategories(d.categories || {}));

    // Fetch states
    fetch("/api/config/states")
      .then((r) => r.json())
      .then((d) => setStatesList(d.states.map((s: any) => s.name)));

    return () => window.removeEventListener("collection_changed", handleColChange);
  }, []);

  useEffect(() => {
    setLoading(true);
    const q = new URLSearchParams();
    q.set("collection_id", activeColId);
    if (selectedCategory) q.set("category", selectedCategory);
    if (selectedState) q.set("state", selectedState);
    if (search) q.set("q", search);
    q.set("page_size", "350"); // Fetch all holding records to allow full deduplication

    fetch(`/api/records?${q.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.records) setRawRecords(data.records);
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, [activeColId, selectedCategory, selectedState, search]);

  // Deduplicate and curate records so every card represents a distinct cultural tradition
  const records = useMemo(() => {
    const seen = new Set<string>();
    const unique: any[] = [];

    for (const r of rawRecords) {
      if (isNoisyRecord(r)) continue;
      const key = getTraditionKey(r);
      if (seen.has(key)) continue;
      seen.add(key);

      // Enhance title with curated prestigious naming if present
      const curatedTitle = CURATED_TITLES[r.id] || r.title;
      unique.push({
        ...r,
        displayTitle: curatedTitle,
      });
    }

    return unique;
  }, [rawRecords]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-parchment-300">
        <div>
          <span className="font-serif text-xs font-bold uppercase tracking-widest text-copper-600 block mb-1">
            Visual Heritage Atlas
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-oxblood-900">
            Cultural Atlas of Indian Heritage
          </h1>
          <p className="text-xs sm:text-sm text-oxblood-800/80 mt-1 max-w-2xl">
            Curatorial dossier exploration across 9 cultural categories and 36 States &amp; UTs. Each unique tradition,
            sacred practice, and architectural monument is curated with verified authentic photography.
          </p>
        </div>

        {/* Search */}
        <div className="relative min-w-[260px]">
          <Search size={14} className="absolute left-3 top-2.5 text-oxblood-800/50" />
          <input
            type="text"
            placeholder="Search tradition or motif..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-cream-100 border border-parchment-400 rounded-xs text-xs font-sans text-oxblood-900 focus:outline-hidden focus:ring-1 focus:ring-gold-400"
          />
        </div>
      </div>

      {/* Category Pills Strip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        <button
          onClick={() => setSelectedCategory("")}
          className={`px-3 py-1.5 rounded-xs text-xs font-serif font-bold whitespace-nowrap transition-colors border ${
            selectedCategory === ""
              ? "bg-oxblood-900 text-cream-100 border-oxblood-900"
              : "bg-cream-100 text-oxblood-900 border-parchment-300 hover:bg-cream-200"
          }`}
        >
          All Categories
        </button>
        {Object.entries(categories).map(([k, cat]: [string, any]) => (
          <button
            key={k}
            onClick={() => setSelectedCategory(k)}
            className={`px-3 py-1.5 rounded-xs text-xs font-serif font-bold whitespace-nowrap transition-colors border ${
              selectedCategory === k
                ? "bg-oxblood-900 text-cream-100 border-oxblood-900"
                : "bg-cream-100 text-oxblood-900 border-parchment-300 hover:bg-cream-200"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between text-xs text-oxblood-800/70 border-b border-parchment-200 pb-2">
        <span className="font-mono text-[11px]">
          Showing <strong>{records.length}</strong> unique curated heritage traditions
        </span>
        <span className="text-[11px] text-copper-700 flex items-center gap-1 font-serif italic">
          <Sparkles size={12} className="text-gold-500" />
          Distinct photographic verification enabled
        </span>
      </div>

      {/* Masonry Cards Grid */}
      {loading ? (
        <div className="py-20 text-center text-sm font-serif text-oxblood-800/80">
          Loading cultural atlas holdings...
        </div>
      ) : records.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {records.map((r) => {
            const completenessPct = Math.round((r.completeness_score || 0.34) * 100);
            return (
              <div
                key={r.id}
                className="bg-cream-100 border border-parchment-300 rounded-sm overflow-hidden flex flex-col justify-between shadow-xs hover:border-gold-400 hover:shadow-md transition-all group relative border-t-2 border-t-gold-400"
              >
                {/* Visual Artwork Thumbnail */}
                <div className="relative h-48 w-full bg-oxblood-950 overflow-hidden border-b border-parchment-300">
                  <img
                    src={getRecordArtwork(r)}
                    alt={r.displayTitle || r.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                    onError={(ev) => {
                      const target = ev.target as HTMLImageElement;
                      if (!target.src.endsWith(".svg")) {
                        target.src = "/images/heritage/visual_arts.svg";
                      }
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                  {/* Completeness Badge */}
                  <div
                    className={`absolute top-2 right-2 px-2 py-0.5 rounded-xs font-mono text-[10px] font-bold border shadow-md ${
                      completenessPct >= 75
                        ? "bg-olive-800 text-cream-100 border-olive-600"
                        : completenessPct >= 25
                        ? "bg-oxblood-950/90 text-gold-300 border-gold-400/60"
                        : "bg-copper-900/90 text-copper-200 border-copper-400/50"
                    }`}
                    title={`Metadata completeness: ${completenessPct}%`}
                  >
                    {completenessPct}% COMPLETE
                  </div>

                  {r.is_synthetic && (
                    <div className="absolute top-2 left-2 bg-henna-600 text-cream-100 px-1.5 py-0.5 rounded-xs font-mono text-[9px] font-bold">
                      SYNTHETIC
                    </div>
                  )}
                </div>

                {/* Card Body Details */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-copper-600 bg-cream-200 px-2 py-0.5 rounded-xs border border-parchment-300 truncate max-w-[200px] inline-block mb-1.5">
                      {r.art_form || "Heritage Tradition"}
                    </span>
                    <h3 className="font-serif font-bold text-base text-oxblood-900 group-hover:text-henna-700 transition-colors line-clamp-2 leading-snug">
                      {r.displayTitle || r.title}
                    </h3>
                  </div>

                  <div className="text-[11px] text-oxblood-800/85 font-sans space-y-1.5 pt-2 border-t border-parchment-200">
                    <div className="flex items-baseline justify-between">
                      <span className="text-[10px] uppercase font-bold text-oxblood-800/60">Provenance</span>
                      <strong className="font-serif text-oxblood-900 truncate max-w-[150px]">{r.state || "Not documented"}</strong>
                    </div>
                    <div className="flex items-baseline justify-between">
                      <span className="text-[10px] uppercase font-bold text-oxblood-800/60">Period / Era</span>
                      <span className="font-mono text-oxblood-900 text-[10px] truncate max-w-[150px]">{r.period_text || r.period || "Registered Heritage"}</span>
                    </div>
                    <div className="flex items-baseline justify-between">
                      <span className="text-[10px] uppercase font-bold text-oxblood-800/60">Rights</span>
                      <span className="font-mono font-bold text-[10px] px-1.5 py-0.5 bg-cream-200 rounded-xs text-oxblood-900 border border-parchment-300">
                        {r.rights_category || r.rights_declared || "OGD_INDIA"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="px-4 py-2.5 bg-cream-200/50 border-t border-parchment-300 flex items-center justify-between text-xs">
                  <span className="text-[10px] font-mono text-oxblood-800/60 truncate max-w-[120px]" title={r.id}>
                    {r.id}
                  </span>
                  <Link
                    href={`/records/${r.id}`}
                    className="font-serif font-bold text-xs text-oxblood-900 group-hover:text-henna-700 inline-flex items-center gap-1 hover:underline"
                  >
                    <span>View Dossier</span>
                    <ChevronRight size={12} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-20 text-center text-xs text-oxblood-800/60 bg-cream-100 border border-parchment-300 rounded-sm">
          No artifacts match the selected category and filter combination.
        </div>
      )}

      <div className="pt-4">
        <StatusLegend />
      </div>
    </div>
  );
}
