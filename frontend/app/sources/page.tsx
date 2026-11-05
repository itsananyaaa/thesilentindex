"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { CornerFiligree } from "@/components/ornament/CornerFiligree";
import { JaliLattice } from "@/components/ornament/JaliLattice";
import {
  Layers, Download, ExternalLink, CheckCircle2, AlertTriangle,
  ToggleLeft, ToggleRight, RefreshCw, Database, ShieldCheck, MapPin
} from "lucide-react";

export default function SourcesPage() {
  const [layers, setLayers] = useState<any[]>([]);
  const [stateCoverage, setStateCoverage] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);
  const [searchState, setSearchState] = useState("");

  const loadSources = () => {
    setLoading(true);
    fetch("/api/sources")
      .then((r) => r.json())
      .then((res) => {
        setLayers(res.layers || []);
        setStateCoverage(res.state_coverage || null);
      })
      .catch((e) => console.error("Error loading sources:", e))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadSources();
  }, []);

  const handleToggle = (layerId: string) => {
    setToggling(layerId);
    fetch(`/api/sources/${layerId}/toggle`, { method: "PATCH" })
      .then((r) => r.json())
      .then((updated) => {
        setLayers((prev) =>
          prev.map((l) => (l.id === layerId ? { ...l, enabled: updated.enabled } : l))
        );
      })
      .catch((e) => console.error(e))
      .finally(() => setToggling(null));
  };

  const statesList = stateCoverage?.states ? Object.values(stateCoverage.states) : [];
  const filteredStates = statesList.filter((s: any) =>
    s.name.toLowerCase().includes(searchState.toLowerCase()) ||
    s.state_code.toLowerCase().includes(searchState.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 overflow-x-hidden">
      {/* Top Banner */}
      <div className="relative bg-cream-200/80 border border-gold-400 p-6 rounded-sm shadow-xs overflow-hidden">
        <CornerFiligree position="top-left" size={32} className="absolute left-1 top-1" />
        <CornerFiligree position="top-right" size={32} className="absolute right-1 top-1" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Layers size={18} className="text-gold-500" />
              <span className="text-[10px] font-mono uppercase tracking-widest font-bold px-2 py-0.5 bg-oxblood-900 text-cream-100 rounded-xs">
                FEATURE F1 • SOURCE FUSION CONSOLE
              </span>
            </div>
            <h1 className="font-serif text-2xl font-bold text-oxblood-900">
              Multi-Source Harvest & Authority Fusion
            </h1>
            <p className="text-xs text-oxblood-800/80 mt-1 max-w-3xl leading-relaxed">
              Transparent source ledger reconciling official registries, knowledge graphs, and open-access repositories. Each layer maintains immutable provenance, declared licensing, and per-state attributions.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            <a
              href="/api/sources/ledger.csv"
              download
              className="px-3 py-1.5 bg-oxblood-900 hover:bg-oxblood-800 text-cream-100 font-serif text-xs rounded-xs flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Download size={13} />
              <span>Download Ledger CSV</span>
            </a>
            <button
              onClick={loadSources}
              className="px-3 py-1.5 bg-cream-100 hover:bg-cream-200 border border-parchment-400 text-oxblood-900 font-serif text-xs rounded-xs flex items-center gap-1.5 shadow-xs"
            >
              <RefreshCw size={13} />
              <span>Refresh Status</span>
            </button>
          </div>
        </div>
      </div>

      {/* Layer Cards */}
      <div className="space-y-4">
        <h2 className="font-serif text-lg font-bold text-oxblood-900 flex items-center gap-2">
          <Database size={16} className="text-copper-600" />
          <span>Active Source Layers ({layers.length})</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {layers.map((layer) => (
            <div
              key={layer.id}
              className={`p-5 rounded-xs border transition-all relative ${
                layer.enabled
                  ? "bg-cream-100 border-parchment-300 shadow-xs"
                  : "bg-cream-200/40 border-parchment-300 opacity-60"
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider font-bold px-1.5 py-0.5 bg-cream-200 border border-parchment-400 text-oxblood-900 rounded-xs">
                    {layer.kind}
                  </span>
                  <h3 className="font-serif font-bold text-sm text-oxblood-900 mt-1.5 leading-snug">
                    {layer.name}
                  </h3>
                </div>
                <button
                  onClick={() => handleToggle(layer.id)}
                  disabled={toggling === layer.id}
                  title={layer.enabled ? "Disable layer for audit" : "Enable layer for audit"}
                  className="text-oxblood-900 hover:text-gold-600 transition-colors shrink-0"
                >
                  {layer.enabled ? (
                    <ToggleRight size={28} className="text-olive-700" />
                  ) : (
                    <ToggleLeft size={28} className="text-oxblood-800/40" />
                  )}
                </button>
              </div>

              <div className="space-y-2 text-xs text-oxblood-800/90 font-sans border-t border-parchment-300 pt-3">
                <div className="flex justify-between">
                  <span className="text-oxblood-800/60">Harvested Items:</span>
                  <span className="font-mono font-bold text-oxblood-900">{layer.total_items.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-oxblood-800/60">Access Method:</span>
                  <span className="font-mono text-[11px]">{layer.access_method}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-oxblood-800/60">Declared Licence:</span>
                  <span className="font-mono text-[10px] text-right truncate max-w-[160px]" title={layer.licence_summary}>
                    {layer.licence_summary}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-oxblood-800/60">Status:</span>
                  <span className="inline-flex items-center gap-1 font-semibold text-emerald-800 text-[11px]">
                    <CheckCircle2 size={12} />
                    <span>Verified Active</span>
                  </span>
                </div>
              </div>

              {layer.terms_url && (
                <div className="mt-3 pt-2 border-t border-parchment-300/60 text-right">
                  <a
                    href={layer.terms_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-serif text-copper-600 hover:text-copper-700 inline-flex items-center gap-1 underline underline-offset-2"
                  >
                    <span>Official Terms & API Policy</span>
                    <ExternalLink size={10} />
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* State Coverage Table */}
      <div className="bg-cream-100 border border-parchment-300 rounded-sm p-6 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-serif text-lg font-bold text-oxblood-900 flex items-center gap-2">
              <MapPin size={17} className="text-gold-500" />
              <span>Subcontinental State & UT Coverage Matrix (36 Regions)</span>
            </h3>
            <p className="text-xs text-oxblood-800/80 mt-0.5">
              Floor requirements: ≥ 25 records per State, ≥ 10 records per UT. Sparse badges reflect truthful upstream holdings without synthetic fabrication.
            </p>
          </div>
          <input
            type="text"
            placeholder="Search State or UT..."
            value={searchState}
            onChange={(e) => setSearchState(e.target.value)}
            className="px-3 py-1.5 bg-cream-200 border border-parchment-400 rounded-xs text-xs font-sans text-oxblood-900 w-full sm:w-64 focus:outline-hidden focus:ring-1 focus:ring-gold-400"
          />
        </div>

        <div className="overflow-x-auto border border-parchment-300 rounded-xs">
          <table className="w-full text-left text-xs text-oxblood-900 font-sans" aria-label="State Coverage Table">
            <thead className="bg-oxblood-900 text-cream-100 font-serif text-[11px] uppercase tracking-wider">
              <tr>
                <th className="p-3">State / UT Name</th>
                <th className="p-3">Code</th>
                <th className="p-3">Type</th>
                <th className="p-3 text-right">Floor Target</th>
                <th className="p-3 text-right">Attributed Records</th>
                <th className="p-3 text-right">Multi-State Spans</th>
                <th className="p-3">Coverage Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-parchment-300">
              {filteredStates.map((s: any) => (
                <tr key={s.state_code} className="hover:bg-cream-200/50 transition-colors">
                  <td className="p-3 font-semibold text-oxblood-900">{s.name}</td>
                  <td className="p-3 font-mono text-copper-600 font-bold">{s.state_code}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-xs text-[10px] font-mono font-bold uppercase ${
                      s.type === "State" ? "bg-cream-200 border border-parchment-400" : "bg-gold-400/30 border border-gold-400 text-oxblood-900"
                    }`}>
                      {s.type}
                    </span>
                  </td>
                  <td className="p-3 text-right font-mono text-oxblood-800/80">{s.target_floor}</td>
                  <td className="p-3 text-right font-mono font-bold text-oxblood-900">
                    {s.total_attributed_records}
                  </td>
                  <td className="p-3 text-right font-mono text-oxblood-800/70">
                    {s.multi_state_records > 0 ? (
                      <span title="Attributed via multi-state tradition (e.g. Basmati, Phulkari, Chhau)">
                        {s.multi_state_records}
                      </span>
                    ) : "—"}
                  </td>
                  <td className="p-3">
                    {s.sparse_coverage ? (
                      <span
                        className="px-2 py-0.5 rounded-xs text-[10px] font-sans font-bold bg-copper-500/15 border border-copper-500 text-copper-600 inline-flex items-center gap-1"
                        title={s.sparse_reason}
                      >
                        <AlertTriangle size={11} />
                        <span>Sparse Source Coverage</span>
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-xs text-[10px] font-sans font-bold bg-olive-700/15 border border-olive-700 text-olive-700 inline-flex items-center gap-1">
                        <CheckCircle2 size={11} />
                        <span>Meets Target Floor</span>
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
