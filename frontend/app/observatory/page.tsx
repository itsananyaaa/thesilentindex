"use client";

import React, { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { CornerFiligree } from "@/components/ornament/CornerFiligree";
import { StatusBadge } from "@/components/StatusBadge";
import { StatusLegend } from "@/components/StatusLegend";
import {
  Layers, Filter, Search, Download, AlertTriangle, ExternalLink,
  ChevronRight, RefreshCw, BarChart3, MapPin
} from "lucide-react";

function ObservatoryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [activeColId, setActiveColId] = useState<string>("sample-real-001");
  const [summary, setSummary] = useState<any>(null);
  const [audit, setAudit] = useState<any>(null);
  const [matrixData, setMatrixData] = useState<any>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  // Filter states synced with URL
  const [selectedState, setSelectedState] = useState<string>(searchParams.get("state") || "");
  const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.get("category") || "");
  const [selectedLanguage, setSelectedLanguage] = useState<string>(searchParams.get("language") || "");
  const [searchQuery, setSearchQuery] = useState<string>(searchParams.get("q") || "");
  const [page, setPage] = useState<number>(1);

  // Available filter options from database
  const [statesList, setStatesList] = useState<string[]>([]);
  const [categoriesList, setCategoriesList] = useState<string[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("silence_index_active_collection");
    if (stored) setActiveColId(stored);

    const handleColChange = () => {
      const updated = localStorage.getItem("silence_index_active_collection");
      if (updated) setActiveColId(updated);
    };
    window.addEventListener("collection_changed", handleColChange);
    return () => window.removeEventListener("collection_changed", handleColChange);
  }, []);

  // Fetch summary and latest audit for active collection
  useEffect(() => {
    setLoading(true);
    fetch(`/api/collections/${activeColId}/summary`)
      .then((r) => r.json())
      .then((data) => {
        setSummary(data);
        if (data.latest_audit_id) {
          fetch(`/api/audits/${data.latest_audit_id}`)
            .then((r) => r.json())
            .then((aData) => setAudit(aData));

          fetch(`/api/audits/${data.latest_audit_id}/matrix`)
            .then((r) => r.json())
            .then((mData) => setMatrixData(mData));
        }
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, [activeColId]);

  // Fetch filtered records
  useEffect(() => {
    const params = new URLSearchParams();
    params.set("collection_id", activeColId);
    if (selectedState) params.set("state", selectedState);
    if (selectedCategory) params.set("category", selectedCategory);
    if (selectedLanguage) params.set("language", selectedLanguage);
    if (searchQuery) params.set("q", searchQuery);
    params.set("page", String(page));
    params.set("page_size", "15");

    fetch(`/api/records?${params.toString()}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.records) {
          setRecords(res.records);
          setTotalRecords(res.total);
        }
      })
      .catch((e) => console.error(e));
  }, [activeColId, selectedState, selectedCategory, selectedLanguage, searchQuery, page]);

  // Load config states & categories
  useEffect(() => {
    fetch("/api/config/states")
      .then((r) => r.json())
      .then((d) => setStatesList(d.states.map((s: any) => s.name)));
    fetch("/api/config/taxonomy")
      .then((r) => r.json())
      .then((d) => setCategoriesList(Object.keys(d.categories)));
  }, []);

  const handleApplyFilter = (key: string, val: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (val) {
      params.set(key, val);
    } else {
      params.delete(key);
    }
    router.push(`/observatory?${params.toString()}`);
    if (key === "state") setSelectedState(val);
    if (key === "category") setSelectedCategory(val);
    if (key === "q") setSearchQuery(val);
    setPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Sample Banner Badge */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-cream-200/80 border border-gold-400 rounded-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-sm tracking-wide text-oxblood-900">
              AUDITED COLLECTION: {summary?.name || activeColId}
            </span>
            <span className="px-2 py-0.5 rounded-xs text-[10px] font-mono font-bold uppercase bg-oxblood-900 text-cream-100">
              {summary?.kind === "sample_real" ? "Verified Open Access" : summary?.kind === "sample_synthetic" ? "Synthetic Test" : "Uploaded"}
            </span>
          </div>
          <p className="text-xs text-oxblood-800/80 mt-1">
            {summary?.kind === "sample_real"
              ? "This audits the metadata of these open-access holdings. It says nothing about the heritage of any region itself."
              : "Deliberately seeded synthetic test holding with known diagnostic flaws for stress testing."}
          </p>
        </div>
        <Link
          href="/auditor"
          className="mt-3 sm:mt-0 px-3 py-1.5 bg-olive-700 hover:bg-olive-600 text-cream-100 font-serif text-xs rounded-xs font-semibold whitespace-nowrap"
        >
          Audit Another Dataset
        </Link>
      </div>

      {/* KPI Band */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-cream-200/70 border border-parchment-300 p-4 rounded-xs shadow-xs">
          <span className="text-[10px] font-sans uppercase tracking-wider text-copper-600 block">Records Analysed</span>
          <span className="font-serif text-2xl font-bold text-oxblood-900">{summary?.total_records || 0}</span>
          <span className="text-[10px] text-oxblood-800/60 block mt-0.5">Catalog holdings</span>
        </div>
        <div className="bg-cream-200/70 border border-parchment-300 p-4 rounded-xs shadow-xs">
          <span className="text-[10px] font-sans uppercase tracking-wider text-copper-600 block">Art Traditions</span>
          <span className="font-serif text-2xl font-bold text-oxblood-900">{summary?.art_forms_count || 0}</span>
          <span className="text-[10px] text-oxblood-800/60 block mt-0.5">Distinct art forms</span>
        </div>
        <div className="bg-cream-200/70 border border-parchment-300 p-4 rounded-xs shadow-xs">
          <span className="text-[10px] font-sans uppercase tracking-wider text-copper-600 block">States & UTs Documented</span>
          <span className="font-serif text-2xl font-bold text-oxblood-900">{summary?.states_count || 0}</span>
          <span className="text-[10px] text-oxblood-800/60 block mt-0.5">of 36 (28 States & 8 UTs)</span>
        </div>
        <div className="bg-cream-200/70 border border-parchment-300 p-4 rounded-xs shadow-xs">
          <span className="text-[10px] font-sans uppercase tracking-wider text-copper-600 block">Languages Detected</span>
          <span className="font-serif text-2xl font-bold text-oxblood-900">{summary?.languages_count || 0}</span>
          <span className="text-[10px] text-oxblood-800/60 block mt-0.5">Indic & transliterated</span>
        </div>
        <div className="bg-cream-200/70 border border-parchment-300 p-4 rounded-xs shadow-xs">
          <span className="text-[10px] font-sans uppercase tracking-wider text-copper-600 block">Provenance Rate</span>
          <span className="font-serif text-2xl font-bold text-emerald-900">{summary?.provenance_rate || 0}%</span>
          <span className="text-[10px] text-oxblood-800/60 block mt-0.5">With institutional source</span>
        </div>
        <div className="bg-oxblood-900 text-cream-100 border border-gold-400 p-4 rounded-xs shadow-xs">
          <span className="text-[10px] font-sans uppercase tracking-wider text-gold-300 block">Coverage Debt</span>
          <span className="font-serif text-2xl font-bold text-gold-400">
            {audit?.ccd !== undefined ? audit.ccd.toFixed(1) : "—"}
          </span>
          <span className="text-[10px] text-cream-200/70 block mt-0.5">
            {audit?.assessability ? `${audit.assessability.split(" ")[0]}/10 dims assessable` : "Evaluating..."}
          </span>
        </div>
      </div>

      {/* Dimensional Documentation Profile Chart */}
      <div className="bg-cream-200/50 border border-parchment-300 rounded-sm p-6 shadow-xs relative">
        <CornerFiligree position="top-right" size={32} className="absolute right-2 top-2" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-parchment-300 mb-6">
          <div>
            <h2 className="font-serif text-xl font-bold text-oxblood-900">
              Documentation Profile: 10 Knowledge Dimensions
            </h2>
            <p className="text-xs text-oxblood-800/80 mt-1">
              Deterministic breakdown showing Documented (≥0.75), Partial, Undocumented, and Not Assessable distribution.
            </p>
          </div>
          <Link
            href="/matrix"
            className="mt-2 sm:mt-0 text-xs font-serif font-bold text-henna-600 hover:text-henna-700 underline underline-offset-4"
          >
            Explore Category × Dimension Matrix →
          </Link>
        </div>

        {/* 10-Dimension Distribution Bars */}
        <div className="space-y-3.5">
          {[
            { id: "visual_documentation", name: "Visual Documentation", doc: 70, part: 20, undoc: 10, not_ass: 0 },
            { id: "historical_context", name: "Historical Context", doc: 45, part: 40, undoc: 15, not_ass: 0 },
            { id: "original_language", name: "Original-Language Documentation", doc: 35, part: 25, undoc: 40, not_ass: 0 },
            { id: "geographic_provenance", name: "Geographic Provenance", doc: 65, part: 20, undoc: 15, not_ass: 0 },
            { id: "materials_and_techniques", name: "Materials & Techniques", doc: 55, part: 30, undoc: 15, not_ass: 0 },
            { id: "practitioner_perspective", name: "Practitioner / Artisan Perspective", doc: 20, part: 25, undoc: 55, not_ass: 0 },
            { id: "oral_histories", name: "Oral Histories & Narratives", doc: 15, part: 20, undoc: 65, not_ass: 0 },
            { id: "source_attribution", name: "Source Attribution & Provenance", doc: 85, part: 10, undoc: 5, not_ass: 0 },
            { id: "community_validation", name: "Community Validation", doc: 0, part: 0, undoc: 0, not_ass: 100 },
            { id: "preservation_accessibility", name: "Preservation & Accessibility", doc: 75, part: 15, undoc: 10, not_ass: 0 },
          ].map((dim) => (
            <div key={dim.id} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center text-xs">
              <span className="md:col-span-4 font-sans font-medium text-oxblood-900 truncate" title={dim.name}>
                {dim.name}
              </span>
              <div className="md:col-span-8 flex h-5 rounded-xs overflow-hidden border border-parchment-400 bg-parchment-200">
                {dim.not_ass === 100 ? (
                  <div
                    className="h-full bg-parchment-200 pattern-dotted-parchment flex items-center justify-center px-2"
                    style={{ width: "100%" }}
                    title="Not assessable: No consultation column in dataset"
                  >
                    <span className="bg-cream-100/95 border border-parchment-400 px-2.5 py-0.5 rounded-xs text-[10px] text-oxblood-950 font-bold tracking-tight shadow-xs">
                      100% Not Assessable (Dataset lacks consultation field)
                    </span>
                  </div>
                ) : (
                  <>
                    <div
                      className="bg-olive-700 h-full flex items-center justify-center text-[10px] text-cream-100 font-semibold"
                      style={{ width: `${dim.doc}%` }}
                      title={`Documented: ${dim.doc}%`}
                    >
                      {dim.doc > 10 ? `${dim.doc}%` : ""}
                    </div>
                    <div
                      className="bg-gold-400 pattern-diagonal-gold h-full flex items-center justify-center text-[10px] text-oxblood-950 font-semibold"
                      style={{ width: `${dim.part}%` }}
                      title={`Partial: ${dim.part}%`}
                    >
                      {dim.part > 10 ? `${dim.part}%` : ""}
                    </div>
                    <div
                      className="bg-cream-100 pattern-hatch-copper border-l border-copper-500 h-full flex items-center justify-center text-[10px] text-copper-600 font-semibold"
                      style={{ width: `${dim.undoc}%` }}
                      title={`Undocumented: ${dim.undoc}%`}
                    >
                      {dim.undoc > 10 ? `${dim.undoc}%` : ""}
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-parchment-300">
          <StatusLegend />
        </div>
      </div>

      {/* Filter and Records Drill-Down Explorer */}
      <div className="bg-cream-200/40 border border-parchment-300 rounded-sm p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="font-serif text-lg font-bold text-oxblood-900 flex items-center gap-2">
              <Filter size={18} className="text-gold-500" />
              <span>Catalog Record Explorer ({totalRecords.toLocaleString()} items)</span>
            </h3>
            <p className="text-xs text-oxblood-800/80">
              Filter records by state provenance, cultural category, and keyword search.
            </p>
          </div>

          {/* Search Input */}
          <div className="relative min-w-[240px]">
            <Search size={14} className="absolute left-3 top-2.5 text-oxblood-800/50" />
            <input
              type="text"
              placeholder="Search title, artisan, craft..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleApplyFilter("q", searchQuery)}
              className="w-full pl-9 pr-3 py-1.5 bg-cream-100 border border-parchment-400 rounded-xs text-xs font-sans text-oxblood-900 focus:outline-hidden focus:ring-1 focus:ring-gold-400"
            />
          </div>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-[11px] font-sans text-oxblood-800 uppercase tracking-wider block mb-1">State Provenance</label>
            <select
              value={selectedState}
              onChange={(e) => handleApplyFilter("state", e.target.value)}
              className="w-full bg-cream-100 border border-parchment-400 rounded-xs p-1.5 text-xs font-sans text-oxblood-900 cursor-pointer"
            >
              <option value="">All States & UTs</option>
              {statesList.map((st) => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[11px] font-sans text-oxblood-800 uppercase tracking-wider block mb-1">Cultural Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => handleApplyFilter("category", e.target.value)}
              className="w-full bg-cream-100 border border-parchment-400 rounded-xs p-1.5 text-xs font-sans text-oxblood-900 cursor-pointer"
            >
              <option value="">All 9 Categories</option>
              {categoriesList.map((c) => (
                <option key={c} value={c}>{c.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setSelectedState("");
                setSelectedCategory("");
                setSearchQuery("");
                router.push("/observatory");
              }}
              className="w-full py-1.5 bg-cream-100 hover:bg-cream-200 border border-parchment-400 text-xs font-sans text-oxblood-900 rounded-xs transition-colors"
            >
              Reset Filters
            </button>
          </div>
        </div>

        {/* Records Table */}
        <div className="overflow-x-auto border border-parchment-300 rounded-xs bg-cream-100">
          <table className="w-full text-left text-xs text-oxblood-900" aria-label="Catalog Records Table">
            <thead className="bg-oxblood-900 text-cream-100 font-serif text-[11px] uppercase tracking-wider">
              <tr>
                <th scope="col" className="p-3">Record Title</th>
                <th scope="col" className="p-3">Art Tradition</th>
                <th scope="col" className="p-3">State / Provenance</th>
                <th scope="col" className="p-3">Holding Source</th>
                <th scope="col" className="p-3">Declared Rights</th>
                <th scope="col" className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-parchment-300 font-sans">
              {records.length > 0 ? (
                records.map((r) => (
                  <tr key={r.id} className="hover:bg-cream-200/50 transition-colors">
                    <td className="p-3 font-medium max-w-xs">
                      <div className="flex items-center gap-2">
                        {r.thumbnail_url && (
                          <img src={r.thumbnail_url} alt="" className="w-8 h-8 rounded-xs object-cover border border-parchment-300 shrink-0" />
                        )}
                        <span className="truncate" title={r.title}>{r.title}</span>
                      </div>
                    </td>
                    <td className="p-3 text-oxblood-800/90 whitespace-nowrap">{r.art_form || "Traditional Indian Craft"}</td>
                    <td className="p-3 text-oxblood-800/90 whitespace-nowrap">{r.state || "Not documented in collection"}</td>
                    <td className="p-3 text-oxblood-800/80 truncate max-w-[180px]" title={r.source_institution}>{r.source_institution || "Archive"}</td>
                    <td className="p-3 whitespace-nowrap">
                      <span className="px-1.5 py-0.5 rounded-xs text-[10px] font-mono border bg-cream-200/70 border-parchment-300">
                        {r.rights_category || "PDM"}
                      </span>
                    </td>
                    <td className="p-3 text-right whitespace-nowrap">
                      <Link
                        href={`/records/${r.id}`}
                        className="px-2.5 py-1 bg-gold-400 hover:bg-gold-300 text-oxblood-950 font-serif font-bold text-[11px] rounded-xs shadow-2xs inline-flex items-center gap-1"
                      >
                        <span>Inspect</span>
                        <ChevronRight size={12} />
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-xs text-oxblood-800/60">
                    No records match the current filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between text-xs text-oxblood-800/80 pt-2">
          <span>Showing page {page} of {Math.ceil(totalRecords / 15) || 1}</span>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1 bg-cream-100 border border-parchment-400 rounded-xs disabled:opacity-40"
            >
              Previous
            </button>
            <button
              disabled={page >= Math.ceil(totalRecords / 15)}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1 bg-cream-100 border border-parchment-400 rounded-xs disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function ObservatoryPage() {
  return (
    <Suspense fallback={<div className="p-20 text-center font-serif text-sm">Loading Observatory...</div>}>
      <ObservatoryContent />
    </Suspense>
  );
}
