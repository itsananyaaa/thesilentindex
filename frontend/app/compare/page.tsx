"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { CornerFiligree } from "@/components/ornament/CornerFiligree";
import {
  GitCompare, ArrowRight, ArrowDownRight, ArrowUpRight, CheckCircle2,
  AlertTriangle, RefreshCw, Sparkles, TrendingDown, Layers
} from "lucide-react";

export default function ComparePage() {
  const [baseId, setBaseId] = useState<string>("sample-real-001");
  const [targetId, setTargetId] = useState<string>("fused-v2");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [simulation, setSimulation] = useState<any>(null);
  const [simulating, setSimulating] = useState<boolean>(false);

  const fetchComparison = () => {
    setLoading(true);
    fetch(`/api/compare?base_id=${baseId}&target_id=${targetId}`)
      .then((r) => r.json())
      .then((res) => {
        setData(res);
        setSimulation(null);
      })
      .catch((e) => console.error("Error comparing audits:", e))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchComparison();
  }, [baseId, targetId]);

  const handleSimulateImprovement = () => {
    if (!data?.target?.audit_id) return;
    setSimulating(true);
    fetch(`/api/compare/simulate-improvement?audit_id=${data.target.audit_id}`, { method: "POST" })
      .then((r) => r.json())
      .then((sim) => setSimulation(sim))
      .catch((e) => console.error(e))
      .finally(() => setSimulating(false));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 overflow-x-hidden">
      {/* Banner */}
      <div className="relative bg-cream-200/80 border border-gold-400 p-6 rounded-sm shadow-xs overflow-hidden">
        <CornerFiligree position="top-left" size={32} className="absolute left-1 top-1" />
        <CornerFiligree position="top-right" size={32} className="absolute right-1 top-1" />
        <div className="flex items-center gap-2 mb-1">
          <GitCompare size={18} className="text-gold-500" />
          <span className="text-[10px] font-mono uppercase tracking-widest font-bold px-2 py-0.5 bg-oxblood-900 text-cream-100 rounded-xs">
            FEATURE F4 • AUDIT & HOLDING COMPARISON
          </span>
        </div>
        <h1 className="font-serif text-2xl font-bold text-oxblood-900">
          Side-by-Side Audit & Layer Fusion Delta
        </h1>
        <p className="text-xs text-oxblood-800/80 mt-1 max-w-3xl leading-relaxed font-sans">
          Evaluate how multi-source fusion, new harvests, or cataloguing interventions close Cultural Coverage Debt. Track dimension-by-dimension gain/loss heatmaps and state coverage shifts.
        </p>
      </div>

      {/* Selector Controls */}
      <div className="bg-cream-100 border border-parchment-300 rounded-xs p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <div>
            <label className="text-[10px] font-mono uppercase text-copper-600 block mb-1 font-bold">Base Baseline</label>
            <select
              value={baseId}
              onChange={(e) => setBaseId(e.target.value)}
              className="bg-cream-200 border border-parchment-400 rounded-xs px-3 py-1.5 text-xs font-sans text-oxblood-900 cursor-pointer"
            >
              <option value="sample-real-001">Sample A (Open Access Museums)</option>
              <option value="sample-synthetic-001">Sample B (Diagnostic Synthetic)</option>
              <option value="fused-v2">The National Silence Index (Fused v2)</option>
            </select>
          </div>

          <ArrowRight size={18} className="text-gold-500 hidden sm:block mt-4" />

          <div>
            <label className="text-[10px] font-mono uppercase text-copper-600 block mb-1 font-bold">Target Comparison</label>
            <select
              value={targetId}
              onChange={(e) => setTargetId(e.target.value)}
              className="bg-cream-200 border border-parchment-400 rounded-xs px-3 py-1.5 text-xs font-sans text-oxblood-900 cursor-pointer"
            >
              <option value="fused-v2">The National Silence Index (Fused v2)</option>
              <option value="sample-real-001">Sample A (Open Access Museums)</option>
              <option value="sample-synthetic-001">Sample B (Diagnostic Synthetic)</option>
            </select>
          </div>
        </div>

        <button
          onClick={fetchComparison}
          className="px-3 py-1.5 bg-cream-200 hover:bg-cream-300 border border-parchment-400 text-oxblood-900 font-serif text-xs rounded-xs flex items-center gap-1.5 shadow-2xs"
        >
          <RefreshCw size={13} />
          <span>Re-evaluate Delta</span>
        </button>
      </div>

      {data && (
        <div className="space-y-8">
          {/* Delta KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Base Card */}
            <div className="bg-cream-100 border border-parchment-300 rounded-xs p-5 space-y-1">
              <span className="text-[10px] font-mono uppercase text-oxblood-800/60 font-bold block">Base Baseline</span>
              <h3 className="font-serif font-bold text-base text-oxblood-900 truncate" title={data.base.collection_name}>
                {data.base.collection_name}
              </h3>
              <div className="pt-2 flex items-baseline gap-2">
                <span className="font-serif text-3xl font-bold text-oxblood-900">{data.base.ccd.toFixed(1)}</span>
                <span className="text-xs text-oxblood-800/60 font-sans">CCD</span>
              </div>
              <p className="text-xs text-oxblood-800/70 font-sans">
                {data.base.total_records} records • {data.base.documented_states_count} states documented
              </p>
            </div>

            {/* Target Card */}
            <div className="bg-cream-100 border border-gold-400 rounded-xs p-5 space-y-1">
              <span className="text-[10px] font-mono uppercase text-gold-600 font-bold block">Target Fused Holding</span>
              <h3 className="font-serif font-bold text-base text-oxblood-900 truncate" title={data.target.collection_name}>
                {data.target.collection_name}
              </h3>
              <div className="pt-2 flex items-baseline gap-2">
                <span className="font-serif text-3xl font-bold text-gold-600">{data.target.ccd.toFixed(1)}</span>
                <span className="text-xs text-oxblood-800/60 font-sans">CCD</span>
              </div>
              <p className="text-xs text-oxblood-800/70 font-sans">
                {data.target.total_records} records • {data.target.documented_states_count} states documented
              </p>
            </div>

            {/* Delta Card */}
            <div className={`p-5 rounded-xs border space-y-1 ${
              data.delta.ccd_reduced
                ? "bg-olive-800/10 border-olive-700 text-olive-900"
                : "bg-oxblood-900 text-cream-100 border-gold-400"
            }`}>
              <span className="text-[10px] font-mono uppercase font-bold tracking-wider block">
                Net Coverage Shift
              </span>
              <div className="pt-2 flex items-baseline gap-2">
                <span className="font-serif text-3xl font-bold">
                  {data.delta.ccd > 0 ? `+${data.delta.ccd.toFixed(1)}` : data.delta.ccd.toFixed(1)}
                </span>
                <span className="text-xs font-sans">CCD points</span>
              </div>
              <p className="text-xs font-sans opacity-80">
                {data.delta.ccd_reduced
                  ? "↓ Coverage Debt significantly reduced through multi-source fusion."
                  : "Target baseline holds higher debt profile."}
              </p>
            </div>
          </div>

          {/* Dimension-by-Dimension Gain / Loss Heatmap */}
          <div className="bg-cream-100 border border-parchment-300 rounded-sm p-6 space-y-4 shadow-xs">
            <h3 className="font-serif text-lg font-bold text-oxblood-900 flex items-center gap-2">
              <Layers size={17} className="text-copper-600" />
              <span>Dimension Gain / Loss Heatmap (10 Cultural Dimensions)</span>
            </h3>

            <div className="space-y-3">
              {data.dimension_comparison.map((dim: any) => {
                const delta = dim.delta_score;
                return (
                  <div key={dim.dimension} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center text-xs font-sans">
                    <span className="sm:col-span-4 font-semibold text-oxblood-900 truncate" title={dim.dimension}>
                      {dim.dimension.replace(/_/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase())}
                    </span>
                    <div className="sm:col-span-8 flex items-center gap-3">
                      <div className="flex-1 bg-cream-200 h-4 rounded-xs border border-parchment-300 overflow-hidden flex">
                        <div
                          className="bg-oxblood-800/40 h-full"
                          style={{ width: `${Math.round(dim.base_score * 100)}%` }}
                          title={`Base: ${Math.round(dim.base_score * 100)}%`}
                        />
                        <div
                          className={`h-full ${dim.improved ? "bg-olive-700" : "bg-copper-600"}`}
                          style={{ width: `${Math.max(0, Math.round(dim.target_score * 100) - Math.round(dim.base_score * 100))}%` }}
                          title={`Target: ${Math.round(dim.target_score * 100)}%`}
                        />
                      </div>
                      <span className={`font-mono text-[11px] font-bold w-16 text-right ${
                        delta > 0 ? "text-olive-700" : delta < 0 ? "text-copper-600" : "text-oxblood-800/60"
                      }`}>
                        {delta > 0 ? `+${(delta * 100).toFixed(0)}%` : delta < 0 ? `${(delta * 100).toFixed(0)}%` : "0%"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Newly Documented Traditions */}
          {data.newly_documented_traditions && data.newly_documented_traditions.length > 0 && (
            <div className="bg-cream-100 border border-parchment-300 rounded-sm p-6 space-y-3 shadow-xs">
              <h3 className="font-serif text-lg font-bold text-oxblood-900 flex items-center gap-2">
                <Sparkles size={17} className="text-gold-500" />
                <span>Newly Documented Traditions (Surfaced by Target Fusion)</span>
              </h3>
              <p className="text-xs text-oxblood-800/80 font-sans">
                These traditions and craft lineages were completely absent from the base catalog and have been substantiated through multi-source harvest.
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                {data.newly_documented_traditions.map((t: string) => (
                  <span
                    key={t}
                    className="px-2.5 py-1 bg-cream-200 border border-parchment-400 rounded-xs text-xs font-serif font-bold text-oxblood-900 shadow-2xs"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Improvement Run Simulator */}
          <div className="bg-cream-200/80 border border-gold-400 rounded-sm p-6 space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-serif text-lg font-bold text-oxblood-900 flex items-center gap-2">
                  <TrendingDown size={18} className="text-olive-700" />
                  <span>Interactive Improvement Run Simulator</span>
                </h3>
                <p className="text-xs text-oxblood-800/80 font-sans mt-0.5">
                  Simulate executing the top 3 preservation priority interventions under CARE consent protocols to project immediate debt reduction.
                </p>
              </div>
              <button
                onClick={handleSimulateImprovement}
                disabled={simulating}
                className="px-4 py-2 bg-olive-700 hover:bg-olive-600 text-cream-100 font-serif font-bold text-xs rounded-xs flex items-center gap-1.5 shadow-xs shrink-0"
              >
                <Sparkles size={14} />
                <span>Simulate Improvement Run</span>
              </button>
            </div>

            {simulation && (
              <div className="p-4 bg-cream-100 border border-olive-600/40 rounded-xs space-y-3 text-xs font-sans">
                <div className="flex items-center gap-6">
                  <div>
                    <span className="text-[10px] text-oxblood-800/60 uppercase block font-semibold">Current CCD</span>
                    <span className="font-serif text-xl font-bold text-oxblood-900">{simulation.base_ccd.toFixed(1)}</span>
                  </div>
                  <ArrowRight size={18} className="text-gold-500" />
                  <div>
                    <span className="text-[10px] text-olive-700 uppercase block font-semibold">Projected CCD After Intervention</span>
                    <span className="font-serif text-xl font-bold text-olive-700">{simulation.projected_ccd.toFixed(1)}</span>
                  </div>
                  <div className="ml-auto bg-olive-700/10 border border-olive-700 px-3 py-1 rounded-xs">
                    <span className="font-bold text-olive-800">
                      ↓ {simulation.percentage_improvement}% Debt Reduction
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-parchment-300">
                  <span className="font-serif font-bold text-oxblood-900 block">Actions Applied:</span>
                  {simulation.actions_applied.map((act: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-2 text-oxblood-800">
                      <CheckCircle2 size={13} className="text-olive-700 shrink-0 mt-0.5" />
                      <span>{act}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
