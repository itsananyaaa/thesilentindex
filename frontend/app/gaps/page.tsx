"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { CornerFiligree } from "@/components/ornament/CornerFiligree";
import { DocumentationBriefModal } from "@/components/DocumentationBriefModal";
import {
  Compass, AlertTriangle, CheckCircle2, ChevronRight, FileText,
  Filter, Search, Layers, ExternalLink, ArrowUpRight
} from "lucide-react";

export default function ExistenceGapPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedQuadrant, setSelectedQuadrant] = useState<string>("all");
  const [search, setSearch] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedBriefPriority, setSelectedBriefPriority] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (selectedCategory) params.set("category", selectedCategory);

    fetch(`/api/gaps?${params.toString()}`)
      .then((r) => r.json())
      .then((res) => setData(res))
      .catch((e) => console.error("Error loading gap analysis:", e))
      .finally(() => setLoading(false));
  }, [selectedCategory]);

  const points = data?.points || [];
  const filteredPoints = points.filter((p: any) => {
    const matchesSearch = p.label.toLowerCase().includes(search.toLowerCase());
    const matchesQuad = selectedQuadrant === "all" || p.quadrant === selectedQuadrant;
    return matchesSearch && matchesQuad;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 overflow-x-hidden">
      {/* Banner */}
      <div className="relative bg-cream-200/80 border border-gold-400 p-6 rounded-sm shadow-xs overflow-hidden">
        <CornerFiligree position="top-left" size={32} className="absolute left-1 top-1" />
        <CornerFiligree position="top-right" size={32} className="absolute right-1 top-1" />
        <div className="flex items-center gap-2 mb-1">
          <Compass size={18} className="text-gold-500" />
          <span className="text-[10px] font-mono uppercase tracking-widest font-bold px-2 py-0.5 bg-oxblood-900 text-cream-100 rounded-xs">
            FEATURE F3 • EXISTENCE–DOCUMENTATION GAP
          </span>
        </div>
        <h1 className="font-serif text-2xl font-bold text-oxblood-900">
          Existence Evidence vs. Documentation Depth
        </h1>
        <p className="text-xs text-oxblood-800/80 mt-1 max-w-3xl leading-relaxed font-sans">
          Contrasting what is known to exist (from GI registries, UNESCO inscriptions, and archaeological gazetteers) against how deeply it is documented in cultural collections. Traditions in the bottom-right quadrant (proven existence, sparse documentation) are flagged as High Preservation Documentation Priorities.
        </p>
      </div>

      {/* Quadrant Summary KPI Cards (Ordered I, II, III, IV) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Quadrant I */}
        <button
          onClick={() => setSelectedQuadrant(selectedQuadrant === "well_documented" ? "all" : "well_documented")}
          className={`p-4 rounded-xs border-2 text-left transition-all shadow-xs ${
            selectedQuadrant === "well_documented"
              ? "bg-olive-800 text-cream-100 border-gold-400 ring-2 ring-gold-400"
              : "bg-cream-100 border-olive-700/60 hover:bg-cream-200/50"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-olive-800 block">
              Quadrant I • Well Documented
            </span>
            <CheckCircle2 size={16} className="text-olive-700" />
          </div>
          <span className="font-serif text-2xl font-bold block my-1 text-oxblood-900">
            {data?.quadrant_summary?.well_documented || 0}
          </span>
          <span className="text-[11px] text-oxblood-800/80 block font-sans">
            High existence, extensive cataloguing
          </span>
        </button>

        {/* Quadrant II */}
        <button
          onClick={() => setSelectedQuadrant(selectedQuadrant === "deep_catalog_obscure" ? "all" : "deep_catalog_obscure")}
          className={`p-4 rounded-xs border-2 text-left transition-all shadow-xs ${
            selectedQuadrant === "deep_catalog_obscure"
              ? "bg-copper-600 text-cream-100 border-gold-400 ring-2 ring-gold-400"
              : "bg-cream-100 border-copper-600/60 hover:bg-cream-200/50"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-copper-700 block">
              Quadrant II • Rich Catalog
            </span>
            <Layers size={16} className="text-copper-600" />
          </div>
          <span className="font-serif text-2xl font-bold block my-1 text-oxblood-900">
            {data?.quadrant_summary?.deep_catalog_obscure || 0}
          </span>
          <span className="text-[11px] text-oxblood-800/80 block font-sans">
            Deep documentation, local recognition
          </span>
        </button>

        {/* Quadrant III */}
        <button
          onClick={() => setSelectedQuadrant(selectedQuadrant === "baseline" ? "all" : "baseline")}
          className={`p-4 rounded-xs border-2 text-left transition-all shadow-xs ${
            selectedQuadrant === "baseline"
              ? "bg-oxblood-950 text-cream-100 border-gold-400 ring-2 ring-gold-400"
              : "bg-cream-100 border-parchment-400 hover:bg-cream-200/50"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-oxblood-800/80 block">
              Quadrant III • Baseline
            </span>
            <span className="text-xs font-mono font-bold">•</span>
          </div>
          <span className="font-serif text-2xl font-bold block my-1 text-oxblood-900">
            {data?.quadrant_summary?.baseline || 0}
          </span>
          <span className="text-[11px] text-oxblood-800/80 block font-sans">
            Initial catalog presence
          </span>
        </button>

        {/* Quadrant IV */}
        <button
          onClick={() => setSelectedQuadrant(selectedQuadrant === "high_priority_gap" ? "all" : "high_priority_gap")}
          className={`p-4 rounded-xs border-2 text-left transition-all shadow-xs ${
            selectedQuadrant === "high_priority_gap"
              ? "bg-oxblood-900 text-cream-100 border-gold-400 ring-2 ring-gold-400"
              : "bg-cream-100 border-henna-600/60 hover:bg-cream-200/50"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-henna-700 block">
              Quadrant IV • High Priority
            </span>
            <AlertTriangle size={16} className="text-henna-600" />
          </div>
          <span className="font-serif text-2xl font-bold block my-1 text-oxblood-900">
            {data?.quadrant_summary?.high_priority_gap || 0}
          </span>
          <span className="text-[11px] text-oxblood-800/80 block font-sans">
            Proven existence, sparse documentation
          </span>
        </button>
      </div>

      {/* Interactive 2-Axis Scatter Visualizer */}
      <div className="bg-cream-100 border border-parchment-300 rounded-sm p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-serif text-lg font-bold text-oxblood-900">
              Interactive 2-Axis Quadrant Visualizer
            </h3>
            <p className="text-xs text-oxblood-800/80 font-sans">
              Horizontal: Existence Evidence Depth (GI, UNESCO, ASI) • Vertical: Documentation Depth across 10 dimensions
            </p>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Filter tradition..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-3 py-1.5 bg-cream-200 border border-parchment-400 rounded-xs text-xs font-sans text-oxblood-900 focus:outline-hidden"
            />
          </div>
        </div>

        {/* 2-Axis Matrix Display Container */}
        <div className="relative border-2 border-dashed border-parchment-400 rounded-xs p-4 bg-cream-200/30 h-72 sm:h-96 flex items-center justify-center overflow-hidden">
          {/* Quadrant dividing crosshairs */}
          <div className="absolute inset-x-0 top-1/2 border-t border-parchment-400/80" />
          <div className="absolute inset-y-0 left-1/2 border-l border-parchment-400/80" />

          {/* Quadrant Background Watermarks */}
          <div className="absolute top-2 left-2 text-[10px] font-mono font-bold text-oxblood-800/40 uppercase">
            II. Rich Catalog / Local (Low Exist, High Doc)
          </div>
          <div className="absolute top-2 right-2 text-[10px] font-mono font-bold text-olive-800/60 uppercase">
            I. Well Documented (High Exist, High Doc)
          </div>
          <div className="absolute bottom-2 left-2 text-[10px] font-mono font-bold text-oxblood-800/40 uppercase">
            III. Baseline Record (Low Exist, Low Doc)
          </div>
          <div className="absolute bottom-2 right-2 text-[10px] font-mono font-bold text-henna-700 uppercase bg-cream-100/90 px-2 py-0.5 rounded-xs border border-henna-500/40">
            ★ IV. HIGH DOCUMENTATION PRIORITY (Proven Existence, Sparse Doc)
          </div>

          {/* Render Sample Plotted Entity Dots */}
          <div className="absolute inset-6">
            {filteredPoints.slice(0, 45).map((p: any) => {
              const leftPercent = Math.max(5, Math.min(95, p.existence_depth));
              const bottomPercent = Math.max(5, Math.min(95, p.documentation_depth));
              const isHigh = p.quadrant === "high_priority_gap";

              return (
                <Link
                  key={p.entity_id}
                  href={`/entities/${p.entity_id}`}
                  style={{ left: `${leftPercent}%`, bottom: `${bottomPercent}%` }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer`}
                  title={`${p.label}: Existence ${p.existence_depth}%, Documentation ${p.documentation_depth}% (${p.quadrant_label})`}
                >
                  <div className={`w-3.5 h-3.5 rounded-full transition-transform group-hover:scale-150 border ${
                    isHigh
                      ? "bg-henna-600 border-gold-400 ring-2 ring-gold-400/50 animate-pulse"
                      : p.quadrant === "well_documented"
                      ? "bg-olive-700 border-cream-100"
                      : "bg-copper-500 border-cream-100"
                  }`} />
                  <span className="hidden group-hover:block absolute left-4 -top-2 z-30 bg-oxblood-900 text-cream-100 px-2 py-1 rounded-xs text-[10px] whitespace-nowrap font-serif shadow-md border border-gold-400">
                    {p.label} ({p.existence_depth}%, {p.documentation_depth}%)
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Filtered Entity Drill-Down Table */}
      <div className="bg-cream-100 border border-parchment-300 rounded-sm p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-lg font-bold text-oxblood-900 flex items-center gap-2">
            <Layers size={17} className="text-copper-600" />
            <span>Entities Filtered by Quadrant ({filteredPoints.length})</span>
          </h3>
          <span className="text-xs font-mono text-oxblood-800/60">
            Showing {filteredPoints.length} of {points.length} traditions
          </span>
        </div>

        <div className="overflow-x-auto border border-parchment-300 rounded-xs">
          <table className="w-full text-left text-xs text-oxblood-900 font-sans" aria-label="Existence Gap Table">
            <thead className="bg-oxblood-900 text-cream-100 font-serif text-[11px] uppercase tracking-wider">
              <tr>
                <th className="p-3">Heritage Entity</th>
                <th className="p-3">Region / States</th>
                <th className="p-3 text-right">Existence Depth</th>
                <th className="p-3 text-right">Documentation Depth</th>
                <th className="p-3">Quadrant Classification</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-parchment-300">
              {filteredPoints.map((p: any) => (
                <tr key={p.entity_id} className="hover:bg-cream-200/50 transition-colors">
                  <td className="p-3 font-semibold text-oxblood-900">
                    <Link href={`/entities/${p.entity_id}`} className="hover:text-copper-600 hover:underline">
                      {p.label}
                    </Link>
                  </td>
                  <td className="p-3 font-mono text-copper-600 font-bold">
                    {p.primary_state_codes?.join(", ") || "India"}
                  </td>
                  <td className="p-3 text-right font-mono font-bold text-oxblood-900">
                    {p.existence_depth}%
                  </td>
                  <td className="p-3 text-right font-mono font-bold text-oxblood-900">
                    {p.documentation_depth}%
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-xs text-[10px] font-sans font-bold inline-flex items-center gap-1 ${
                      p.quadrant === "high_priority_gap"
                        ? "bg-henna-600/15 border border-henna-600 text-henna-700"
                        : p.quadrant === "well_documented"
                        ? "bg-olive-700/15 border border-olive-700 text-olive-700"
                        : "bg-cream-200 border border-parchment-400 text-oxblood-800"
                    }`}>
                      {p.quadrant === "high_priority_gap" && <AlertTriangle size={11} />}
                      {p.quadrant === "well_documented" && <CheckCircle2 size={11} />}
                      <span>{p.quadrant_label}</span>
                    </span>
                  </td>
                  <td className="p-3 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/entities/${p.entity_id}`}
                        className="px-2 py-1 bg-cream-200 hover:bg-cream-300 border border-parchment-400 text-oxblood-900 font-serif text-[11px] rounded-xs shadow-2xs"
                      >
                        Profile
                      </Link>
                      <button
                        onClick={() => setSelectedBriefPriority("PRIORITY-001")}
                        className="px-2.5 py-1 bg-gold-400 hover:bg-gold-300 text-oxblood-950 font-serif font-bold text-[11px] rounded-xs shadow-2xs flex items-center gap-1"
                      >
                        <FileText size={11} />
                        <span>Brief</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Brief Modal */}
      <DocumentationBriefModal
        priorityId={selectedBriefPriority}
        onClose={() => setSelectedBriefPriority(null)}
      />
    </div>
  );
}

