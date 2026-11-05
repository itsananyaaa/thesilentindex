"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { CornerFiligree } from "@/components/ornament/CornerFiligree";
import { StatusBadge } from "@/components/StatusBadge";
import { StatusLegend } from "@/components/StatusLegend";
import { STATUS_STYLES } from "@/lib/tokens";
import { Download, X, Layers, Sliders, ExternalLink, HelpCircle, CheckCircle2 } from "lucide-react";
import { getActiveCollection, setActiveCollection } from "@/lib/collection";

export default function CoverageMatrixPage() {
  const [activeColId, setActiveColId] = useState<string>("fused-v2");
  const [matrixData, setMatrixData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Cell Drawer State
  const [selectedCell, setSelectedCell] = useState<{
    category: string;
    categoryName: string;
    dimension: string;
    dimensionName: string;
  } | null>(null);
  const [cellRecords, setCellRecords] = useState<any[]>([]);
  const [loadingCell, setLoadingCell] = useState<boolean>(false);

  // Weight Sliders
  const [showWeights, setShowWeights] = useState<boolean>(false);
  const [weights, setWeights] = useState<Record<string, number>>({
    visual_documentation: 1.0,
    historical_context: 1.0,
    original_language: 1.0,
    geographic_provenance: 1.0,
    materials_and_techniques: 1.0,
    practitioner_perspective: 1.0,
    oral_histories: 1.0,
    source_attribution: 1.0,
    community_validation: 1.0,
    preservation_accessibility: 1.0,
  });

  useEffect(() => {
    setActiveColId(getActiveCollection());

    const handleColChange = () => {
      setActiveColId(getActiveCollection());
    };
    window.addEventListener("collection_changed", handleColChange);
    return () => window.removeEventListener("collection_changed", handleColChange);
  }, []);

  const loadMatrix = () => {
    setLoading(true);
    fetch(`/api/collections/${activeColId}/summary`)
      .then((r) => {
        if (!r.ok) throw new Error("Collection summary failed");
        return r.json();
      })
      .then((col) => {
        const auditId = col.latest_audit_id || `AUDIT-${activeColId.toUpperCase()}-INIT`;
        return fetch(`/api/audits/${auditId}/matrix`);
      })
      .then((r) => r.json())
      .then((data) => setMatrixData(data))
      .catch((e) => {
        console.error("Error loading matrix, falling back to fused-v2:", e);
        fetch(`/api/audits/AUDIT-FUSED-V2-INIT/matrix`)
          .then((r) => r.json())
          .then((data) => setMatrixData(data));
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadMatrix();
  }, [activeColId]);

  // Handle cell click -> open drawer and fetch records
  const handleCellClick = (catId: string, catName: string, dimId: string, dimName: string) => {
    setSelectedCell({ category: catId, categoryName: catName, dimension: dimId, dimensionName: dimName });
    setLoadingCell(true);
    const auditId = matrixData?.audit_id || `AUDIT-${activeColId.toUpperCase()}-INIT`;
    fetch(`/api/audits/${auditId}/matrix/cell?category=${encodeURIComponent(catId)}&dimension=${encodeURIComponent(dimId)}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.records) setCellRecords(res.records);
      })
      .catch((e) => console.error(e))
      .finally(() => setLoadingCell(false));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-parchment-300">
        <div>
          <span className="font-serif text-xs font-bold uppercase tracking-widest text-copper-600 block mb-1">
            Structural Knowledge Matrix
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-oxblood-900">
            Cultural Category × Dimension Coverage Matrix
          </h1>
          <p className="text-xs sm:text-sm text-oxblood-800/80 mt-1 max-w-3xl">
            A deterministic grid mapping 9 Indian cultural heritage categories across 10 documentation dimensions.
            Click any cell to inspect the responsible catalog records and download verification manifests.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowWeights(!showWeights)}
            className="px-3 py-1.5 bg-cream-100 hover:bg-cream-200 border border-parchment-400 text-oxblood-900 font-serif text-xs font-semibold rounded-xs shadow-2xs inline-flex items-center gap-1.5"
          >
            <Sliders size={14} className="text-gold-500" />
            <span>{showWeights ? "Hide Weights" : "Adjust Weights"}</span>
          </button>
        </div>
      </div>

      {/* Weights Panel */}
      {showWeights && (
        <div className="bg-cream-200/90 border border-gold-400 p-5 rounded-sm shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-parchment-300">
            <h3 className="font-serif font-bold text-sm text-oxblood-900">
              Dimension Weight Sliders (Sensitivity Adjustment)
            </h3>
            <span className="text-[11px] text-oxblood-800/70">Equal weights (1.0) by default</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {Object.keys(weights).map((dim) => (
              <div key={dim} className="space-y-1">
                <div className="flex justify-between text-[11px] font-sans">
                  <span className="truncate max-w-[120px]" title={dim}>{dim.replace("_", " ")}</span>
                  <span className="font-mono font-bold">{weights[dim].toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="3"
                  step="0.5"
                  value={weights[dim]}
                  onChange={(e) => setWeights({ ...weights, [dim]: parseFloat(e.target.value) })}
                  className="w-full accent-gold-500 cursor-pointer"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Matrix Table */}
      <div className="bg-cream-100 border border-parchment-300 rounded-sm shadow-sm overflow-x-auto">
        {loading ? (
          <div className="p-16 text-center text-sm font-serif text-oxblood-800/80">
            Computing coverage matrix from catalog records...
          </div>
        ) : matrixData ? (
          <table className="w-full text-left text-xs border-collapse" aria-label="Coverage Matrix Grid">
            <thead>
              <tr className="bg-oxblood-900 text-cream-100 font-serif text-[11px] uppercase tracking-wider">
                <th scope="col" className="p-3 border-r border-oxblood-800 sticky left-0 bg-oxblood-900 z-10 min-w-[180px]">
                  Cultural Category
                </th>
                {matrixData.dimensions.map((dim: any) => (
                  <th key={dim.id} scope="col" className="p-3 border-r border-oxblood-800 text-center min-w-[110px]" title={dim.name}>
                    <span className="line-clamp-2">{dim.name}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-parchment-300 font-sans">
              {matrixData.grid.map((row: any) => (
                <tr key={row.category_id} className="hover:bg-cream-200/40 transition-colors">
                  <th scope="row" className="p-3 font-serif font-bold text-oxblood-900 border-r border-parchment-300 sticky left-0 bg-cream-100 z-10 whitespace-nowrap">
                    {row.category_name}
                  </th>
                  {row.dimensions.map((col: any) => {
                    const style = STATUS_STYLES[col.dominant_status] || STATUS_STYLES["Not assessable"];
                    return (
                      <td
                        key={col.dimension_id}
                        onClick={() => handleCellClick(row.category_id, row.category_name, col.dimension_id, col.dimension_name)}
                        className={`p-2.5 text-center border-r border-parchment-300 cursor-pointer hover:ring-2 hover:ring-gold-400 hover:ring-inset transition-all ${
                          col.dominant_status === "Documented"
                            ? "bg-olive-700/15"
                            : col.dominant_status === "Partial"
                            ? "pattern-diagonal-gold"
                            : col.dominant_status === "Undocumented in collection"
                            ? "pattern-hatch-copper"
                            : col.dominant_status === "Not assessable"
                            ? "pattern-dotted-parchment"
                            : "bg-cream-100"
                        }`}
                        title={`Click to inspect ${col.total_records} records`}
                      >
                        <div className="flex flex-col items-center justify-center gap-1">
                          <StatusBadge status={col.dominant_status} size="sm" />
                          <span className="text-[10px] text-oxblood-800/70 font-mono">
                            {col.total_records > 0 ? `${col.total_records} recs` : "—"}
                          </span>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        ) : null}
      </div>

      <div className="pt-2">
        <StatusLegend />
      </div>

      {/* Cell Drill-Down Drawer / Modal */}
      {selectedCell && (
        <div className="fixed inset-0 z-50 bg-oxblood-950/70 backdrop-blur-xs flex justify-end animate-fade-in" role="dialog" aria-modal="true">
          <div className="w-full max-w-2xl bg-cream-100 h-full shadow-2xl flex flex-col border-l-2 border-gold-400 p-6 overflow-y-auto">
            {/* Drawer Header */}
            <div className="flex items-start justify-between pb-4 border-b border-parchment-300">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-copper-600 block">
                  CELL DRILL-DOWN INSPECTION
                </span>
                <h3 className="font-serif text-xl font-bold text-oxblood-900 mt-1">
                  {selectedCell.categoryName}
                </h3>
                <p className="text-xs text-oxblood-800/80">
                  Dimension: <strong className="text-oxblood-900">{selectedCell.dimensionName}</strong> ({cellRecords.length} responsible records)
                </p>
              </div>
              <button
                onClick={() => setSelectedCell(null)}
                className="p-1.5 rounded-xs hover:bg-cream-200 text-oxblood-900"
                aria-label="Close Drawer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Actions Bar */}
            <div className="flex items-center justify-between py-3 border-b border-parchment-300 text-xs">
              <span className="text-oxblood-800/80">Click any record to inspect full catalog dossier.</span>
              <a
                href={`/api/audits/${matrixData?.audit_id}/matrix/cell?category=${encodeURIComponent(selectedCell.category)}&dimension=${encodeURIComponent(selectedCell.dimension)}&format=csv`}
                download
                className="px-2.5 py-1 bg-cream-200 hover:bg-cream-300 border border-parchment-400 text-oxblood-900 font-serif font-bold text-[11px] rounded-xs inline-flex items-center gap-1.5"
              >
                <Download size={12} />
                <span>Download Cell CSV</span>
              </a>
            </div>

            {/* Records List in Drawer */}
            <div className="flex-1 py-4 space-y-3">
              {loadingCell ? (
                <div className="py-12 text-center text-xs text-oxblood-800">Loading cell records...</div>
              ) : cellRecords.length > 0 ? (
                cellRecords.map((r) => (
                  <div
                    key={r.id}
                    className="p-3 bg-cream-200/50 border border-parchment-300 rounded-xs hover:border-gold-400 transition-colors flex items-start justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={r.status} size="sm" />
                        <span className="text-[10px] font-mono font-medium text-oxblood-800/60">{r.id}</span>
                      </div>
                      <h4 className="font-serif font-bold text-sm text-oxblood-900 leading-snug">
                        {r.title}
                      </h4>
                      <p className="text-[11px] text-oxblood-800/80">
                        {r.art_form} • Provenance: {r.state || "Not documented"}
                      </p>
                      <p className="text-[10px] text-henna-700 font-sans italic">
                        Reason: {r.reason}
                      </p>
                    </div>

                    <Link
                      href={`/records/${r.id}`}
                      className="px-2 py-1 bg-gold-400 hover:bg-gold-300 text-oxblood-950 font-serif font-bold text-[11px] rounded-xs shrink-0 whitespace-nowrap"
                    >
                      Inspect →
                    </Link>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-xs text-oxblood-800/60">
                  No records found in this cell for the active collection.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

