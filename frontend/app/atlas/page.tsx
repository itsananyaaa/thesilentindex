"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { CornerFiligree } from "@/components/ornament/CornerFiligree";
import { StatusBadge } from "@/components/StatusBadge";
import { StatusLegend } from "@/components/StatusLegend";
import { Layers, Search, Filter, ChevronRight, Eye } from "lucide-react";
import { getActiveCollection } from "@/lib/collection";

export default function CulturalAtlasPage() {
  const [activeColId, setActiveColId] = useState<string>("fused-v2");
  const [records, setRecords] = useState<any[]>([]);
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
    q.set("page_size", "36");

    fetch(`/api/records?${q.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.records) setRecords(data.records);
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, [activeColId, selectedCategory, selectedState, search]);

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
            Image-led exploration across 9 cultural categories. Discover how visual, tactile, and spiritual
            traditions are captured and where documentation gaps persist.
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

      {/* Masonry Cards Grid */}
      {loading ? (
        <div className="py-20 text-center text-sm font-serif text-oxblood-800/80">
          Loading cultural atlas holdings...
        </div>
      ) : records.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {records.map((r) => {
            const completenessPct = Math.round((r.completeness_score || 0.5) * 100);
            return (
              <div
                key={r.id}
                className="bg-cream-100 border border-parchment-300 rounded-sm overflow-hidden flex flex-col justify-between shadow-xs hover:border-gold-400 hover:shadow-md transition-all group relative"
              >
                {/* Image Container */}
                <div className="relative aspect-4/3 bg-oxblood-950 overflow-hidden">
                  {r.thumbnail_url || r.image_url ? (
                    <img
                      src={r.thumbnail_url || r.image_url}
                      alt={r.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-xs p-4 text-center pattern-dotted-parchment">
                      <span className="font-serif italic font-medium text-gold-300 bg-oxblood-950/85 px-2.5 py-0.5 rounded-xs border border-gold-400/30">No image documented</span>
                      <span className="text-[10px] text-cream-100/80 mt-1 bg-oxblood-950/85 px-2 py-0.5 rounded-xs">{r.is_synthetic ? "Synthetic benchmark" : "Not documented in collection"}</span>
                    </div>
                  )}

                  {/* Completeness Ring Badge */}
                  <div
                    className="absolute top-2 right-2 bg-oxblood-950/85 backdrop-blur-xs text-cream-100 px-2 py-0.5 rounded-xs font-mono text-[10px] font-bold border border-gold-400/50 shadow-sm"
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

                {/* Card Body */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                  <div>
                    <span className="text-[10px] font-sans text-copper-600 font-semibold uppercase tracking-wider block">
                      {r.art_form || "Traditional Indian Heritage"}
                    </span>
                    <h3 className="font-serif font-bold text-sm text-oxblood-900 group-hover:text-henna-700 transition-colors line-clamp-2 mt-0.5">
                      {r.title}
                    </h3>
                  </div>

                  <div className="text-[11px] text-oxblood-800/80 font-sans space-y-0.5 pt-2 border-t border-parchment-300">
                    <div><strong>Provenance:</strong> {r.state || "Not documented in collection"}</div>
                    <div><strong>Period:</strong> {r.period || "Unknown era"}</div>
                    <div><strong>Rights:</strong> {r.rights_category || "PDM"}</div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="px-4 py-2.5 bg-cream-200/50 border-t border-parchment-300 flex items-center justify-between text-xs">
                  <span className="text-[10px] font-mono text-oxblood-800/60 truncate max-w-[120px]">{r.id}</span>
                  <Link
                    href={`/records/${r.id}`}
                    className="font-serif font-bold text-xs text-oxblood-900 group-hover:text-gold-600 inline-flex items-center gap-1"
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

