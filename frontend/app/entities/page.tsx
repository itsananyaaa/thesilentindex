"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { CornerFiligree } from "@/components/ornament/CornerFiligree";
import { Landmark, Search, Filter, ShieldCheck, ExternalLink, ChevronRight, Award } from "lucide-react";

export default function EntitiesListPage() {
  const [entities, setEntities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (selectedCategory) params.set("category", selectedCategory);
    params.set("limit", "100");

    fetch(`/api/entities?${params.toString()}`)
      .then((r) => r.json())
      .then((res) => setEntities(res.entities || []))
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, [search, selectedCategory]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 overflow-x-hidden">
      {/* Banner */}
      <div className="relative bg-cream-200/80 border border-gold-400 p-6 rounded-sm shadow-xs overflow-hidden">
        <CornerFiligree position="top-left" size={32} className="absolute left-1 top-1" />
        <CornerFiligree position="top-right" size={32} className="absolute right-1 top-1" />
        <div className="flex items-center gap-2 mb-1">
          <Landmark size={18} className="text-gold-500" />
          <span className="text-[10px] font-mono uppercase tracking-widest font-bold px-2 py-0.5 bg-oxblood-900 text-cream-100 rounded-xs">
            FEATURE F2 • HERITAGE ENTITIES DIRECTORY
          </span>
        </div>
        <h1 className="font-serif text-2xl font-bold text-oxblood-900">
          Traditions, Monuments & Intangible Practices
        </h1>
        <p className="text-xs text-oxblood-800/80 mt-1 max-w-3xl leading-relaxed">
          Records are institutional documents; Heritage Entities are the living traditions, registered craft knowledge, and monuments themselves. Clustering records across museum and governmental sources closes documentation debt.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search size={14} className="absolute left-3 top-2.5 text-oxblood-800/50" />
          <input
            type="text"
            placeholder="Search tradition or monument (e.g. Chhau, Pashmina, Konark)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-cream-100 border border-parchment-400 rounded-xs text-xs font-sans text-oxblood-900 focus:outline-hidden focus:ring-1 focus:ring-gold-400"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full sm:w-60 bg-cream-100 border border-parchment-400 rounded-xs p-1.5 text-xs font-sans text-oxblood-900 cursor-pointer"
        >
          <option value="">All Cultural Categories</option>
          <option value="visual_arts">Visual Arts & Paintings</option>
          <option value="architecture">Architecture & Monuments</option>
          <option value="textiles_crafts">Textiles, Weaving & Crafts</option>
          <option value="manuscripts_literature">Manuscripts & Epigraphy</option>
          <option value="music_instruments">Music & Musical Instruments</option>
          <option value="dance_performance">Dance & Performance</option>
          <option value="oral_traditions">Oral Traditions</option>
          <option value="ritual_heritage">Ritual Heritage</option>
          <option value="sculpture_material">Sculpture & Metalwork</option>
        </select>
      </div>

      {/* Entities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {entities.map((e) => (
          <div
            key={e.id}
            className="bg-cream-100 border border-parchment-300 rounded-xs p-4 shadow-xs hover:border-gold-400 transition-all flex flex-col justify-between overflow-hidden"
          >
            <div>
              {/* Representative Image Thumbnail */}
              {e.image_url ? (
                <div className="h-40 w-full mb-3 rounded-xs overflow-hidden bg-oxblood-950/20 border border-parchment-300 relative group">
                  <img
                    src={e.image_url}
                    alt={e.label}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ) : (
                <div className="h-28 w-full mb-3 rounded-xs bg-cream-200/50 border border-parchment-300 flex items-center justify-center text-oxblood-800/50 font-serif italic text-xs">
                  <span>🏛️ {e.label}</span>
                </div>
              )}

              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 bg-cream-200 border border-parchment-400 text-oxblood-900 rounded-xs">
                  {e.entity_type}
                </span>
                <span className="text-[11px] font-mono text-copper-600 font-bold">
                  {e.primary_state_codes?.join(", ") || "India"}
                </span>
              </div>
              <h3 className="font-serif text-base font-bold text-oxblood-900 mb-1 leading-snug">
                {e.label}
              </h3>
              <p className="text-xs text-oxblood-800/70 font-sans line-clamp-2 mb-3">
                Category: {e.category_id?.replace(/_/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase())}
              </p>
            </div>

            <div className="flex items-center justify-between border-t border-parchment-300 pt-3 text-xs">
              <span className="text-[11px] font-mono text-oxblood-800/80">
                {e.linked_records_count} linked source {e.linked_records_count === 1 ? "record" : "records"}
              </span>
              <Link
                href={`/entities/${e.id}`}
                className="px-2.5 py-1 bg-gold-400 hover:bg-gold-300 text-oxblood-950 font-serif font-bold text-[11px] rounded-xs shadow-2xs inline-flex items-center gap-1"
              >
                <span>Inspect Evidence Stack</span>
                <ChevronRight size={12} />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

