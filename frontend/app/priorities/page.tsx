"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { CornerFiligree } from "@/components/ornament/CornerFiligree";
import { Sliders, Filter, ArrowRight, ShieldAlert, CheckCircle2, AlertTriangle, ExternalLink, FileText } from "lucide-react";
import { DocumentationBriefModal } from "@/components/DocumentationBriefModal";
import { useTranslation } from "@/lib/i18n";

export default function PrioritiesPage() {
  const { lang, t } = useTranslation();
  const [activeColId, setActiveColId] = useState<string>("sample-real-001");
  const [priorities, setPriorities] = useState<any[]>([]);
  const [selectedDimension, setSelectedDimension] = useState<string>("");
  const [selectedBand, setSelectedBand] = useState<string>("");
  const [selectedConsultation, setSelectedConsultation] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [briefPriorityId, setBriefPriorityId] = useState<string | null>(null);

  // Weight sliders state (defaults from config/weights.yaml)
  const [showSliders, setShowSliders] = useState<boolean>(false);
  const [weights, setWeights] = useState({
    g: 0.40, // Gap magnitude
    e: 0.25, // Evidence confidence
    b: 0.20, // Breadth
    f: 0.15, // Feasibility
  });

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

  const loadPriorities = () => {
    setLoading(true);
    fetch(`/api/collections/${activeColId}/summary`)
      .then((r) => r.json())
      .then((col) => {
        const auditId = col.latest_audit_id || `AUDIT-${activeColId.toUpperCase()}-INIT`;
        const q = new URLSearchParams();
        if (selectedDimension) q.set("dimension", selectedDimension);
        if (selectedBand) q.set("band", selectedBand);
        if (selectedConsultation) q.set("consultation", selectedConsultation);
        return fetch(`/api/audits/${auditId}/priorities?${q.toString()}`);
      })
      .then((r) => r.json())
      .then((data) => {
        if (data.priorities) setPriorities(data.priorities);
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadPriorities();
  }, [activeColId, selectedDimension, selectedBand, selectedConsultation]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-parchment-300">
        <div>
          <span className="font-serif text-xs font-bold uppercase tracking-widest text-copper-600 block mb-1">
            {t("nav.priorities", "Preservation Priority Engine")}
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-oxblood-900">
            {t("priorities.title", "Consent-First Documentation Priorities")}
          </h1>
          <p className="text-xs sm:text-sm text-oxblood-800/80 mt-1 max-w-3xl">
            {t("priorities.subtitle", "Surfacing structural silences ranked by gap magnitude, evidence confidence, collection breadth, and feasibility.")}
          </p>
        </div>

        <button
          onClick={() => setShowSliders(!showSliders)}
          className="px-3.5 py-1.5 bg-cream-100 hover:bg-cream-200 border border-parchment-400 text-oxblood-900 font-serif text-xs font-semibold rounded-xs shadow-2xs inline-flex items-center gap-1.5"
        >
          <Sliders size={14} className="text-gold-500" />
          <span>{showSliders ? "Hide Priority Weights" : "Adjust Priority Weights"}</span>
        </button>
      </div>

      {/* Priority Weight Sliders Panel */}
      {showSliders && (
        <div className="bg-cream-200/90 border border-gold-400 p-5 rounded-sm shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-parchment-300">
            <div>
              <h3 className="font-serif font-bold text-sm text-oxblood-900">
                Formula: Priority = 100 × (0.40·G + 0.25·E + 0.20·B + 0.15·F)
              </h3>
              <p className="text-[11px] text-oxblood-800/70">
                G = Gap Magnitude, E = Evidence Confidence, B = Breadth, F = Feasibility.
              </p>
            </div>
            <span className="text-[11px] font-mono text-oxblood-900">Defaults Loaded</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            <div>
              <div className="flex justify-between text-xs font-sans mb-1">
                <span>Gap Magnitude (G)</span>
                <span className="font-mono font-bold">{weights.g.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="0.8"
                step="0.05"
                value={weights.g}
                onChange={(e) => setWeights({ ...weights, g: parseFloat(e.target.value) })}
                className="w-full accent-gold-500 cursor-pointer"
              />
            </div>
            <div>
              <div className="flex justify-between text-xs font-sans mb-1">
                <span>Evidence Conf (E)</span>
                <span className="font-mono font-bold">{weights.e.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="0.5"
                step="0.05"
                value={weights.e}
                onChange={(e) => setWeights({ ...weights, e: parseFloat(e.target.value) })}
                className="w-full accent-gold-500 cursor-pointer"
              />
            </div>
            <div>
              <div className="flex justify-between text-xs font-sans mb-1">
                <span>Breadth (B)</span>
                <span className="font-mono font-bold">{weights.b.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.5"
                step="0.05"
                value={weights.b}
                onChange={(e) => setWeights({ ...weights, b: parseFloat(e.target.value) })}
                className="w-full accent-gold-500 cursor-pointer"
              />
            </div>
            <div>
              <div className="flex justify-between text-xs font-sans mb-1">
                <span>Feasibility (F)</span>
                <span className="font-mono font-bold">{weights.f.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.4"
                step="0.05"
                value={weights.f}
                onChange={(e) => setWeights({ ...weights, f: parseFloat(e.target.value) })}
                className="w-full accent-gold-500 cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}

      {/* Filter Row */}
      <div className="flex flex-wrap items-center gap-3 p-4 bg-cream-200/60 border border-parchment-300 rounded-xs text-xs">
        <div className="flex items-center gap-1.5 font-serif font-bold text-oxblood-900 mr-2">
          <Filter size={14} className="text-gold-500" />
          <span>Filter Priorities:</span>
        </div>

        <select
          value={selectedBand}
          onChange={(e) => setSelectedBand(e.target.value)}
          className="bg-cream-100 border border-parchment-400 rounded-xs px-2.5 py-1"
        >
          <option value="">All Priority Bands</option>
          <option value="High">High investigation priority</option>
          <option value="Medium">Medium investigation priority</option>
          <option value="Lower">Lower investigation priority</option>
        </select>

        <select
          value={selectedConsultation}
          onChange={(e) => setSelectedConsultation(e.target.value)}
          className="bg-cream-100 border border-parchment-400 rounded-xs px-2.5 py-1"
        >
          <option value="">All Consent Protocols</option>
          <option value="required">Consultation: Required</option>
          <option value="recommended">Consultation: Recommended</option>
          <option value="none">Desk-based / Archival</option>
        </select>

        <span className="text-oxblood-800/70 ml-auto font-mono">
          {priorities.length} recommendations generated
        </span>
      </div>

      {/* Priority Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-3 py-16 text-center text-xs text-oxblood-800">
            Evaluating multi-dimensional gap priorities...
          </div>
        ) : priorities.length > 0 ? (
          priorities.map((p) => {
            const isRequired = p.consultation === "required";
            return (
              <div
                key={p.id}
                className="bg-cream-100 border-2 border-parchment-300 rounded-sm p-5 flex flex-col justify-between shadow-xs hover:border-gold-400 transition-all relative overflow-hidden"
              >
                <CornerFiligree position="top-right" size={24} className="absolute right-1 top-1" />

                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-2 py-0.5 rounded-xs text-[10px] font-mono font-bold uppercase bg-oxblood-900 text-cream-100">
                      {p.band}
                    </span>
                    <span className={`px-2 py-0.5 rounded-xs text-[10px] font-sans font-bold uppercase border ${
                      isRequired
                        ? "bg-red-50 text-red-950 border-red-300 font-semibold"
                        : p.consultation === "recommended"
                        ? "bg-gold-50 text-gold-950 border-gold-300"
                        : "bg-parchment-200 text-oxblood-900 border-parchment-400"
                    }`}>
                      Consent: {p.consultation}
                    </span>
                  </div>

                  <span className="text-[11px] font-sans text-copper-600 font-medium block mb-1">
                    {p.slice.name} ({p.slice.record_count} items)
                  </span>

                  <h3 className="font-serif font-bold text-lg text-oxblood-900 leading-snug mb-2">
                    Documentation Gap: {p.dimension_name}
                  </h3>

                  {/* Component Metrics Bar */}
                  <div className="grid grid-cols-4 gap-1 py-2 my-2 border-y border-parchment-300 text-center text-[10px] font-mono bg-cream-200/40 rounded-xs">
                    <div>
                      <span className="block text-oxblood-800/60">GAP (G)</span>
                      <strong className="text-oxblood-900">{Math.round(p.g * 100)}%</strong>
                    </div>
                    <div>
                      <span className="block text-oxblood-800/60">CONF (E)</span>
                      <strong className="text-oxblood-900">{Math.round(p.e * 100)}%</strong>
                    </div>
                    <div>
                      <span className="block text-oxblood-800/60">BREADTH</span>
                      <strong className="text-oxblood-900">{Math.round(p.b * 100)}%</strong>
                    </div>
                    <div>
                      <span className="block text-oxblood-800/60">FEAS (F)</span>
                      <strong className="text-oxblood-900">{Math.round(p.f * 100)}%</strong>
                    </div>
                  </div>

                  {/* Suggested Next Step */}
                  <div className="mt-3">
                    <span className="text-[10px] font-serif font-bold uppercase text-oxblood-900 block mb-1">
                      Recommended Research Action:
                    </span>
                    <p className="text-xs text-oxblood-800/90 leading-relaxed font-sans">
                      {p.next_step}
                    </p>
                  </div>

                  {/* Reasons list */}
                  <div className="mt-3 space-y-1">
                    {p.reasons?.slice(0, 2).map((r: string, idx: number) => (
                      <p key={idx} className="text-[11px] text-oxblood-800/70 font-sans leading-tight">
                        • {r}
                      </p>
                    ))}
                  </div>
                </div>

                {/* Card Footer with Click-through Records link & Brief Generator */}
                <div className="pt-4 mt-4 border-t border-parchment-300 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="font-serif font-bold text-oxblood-900">
                    Priority Score: <span className="text-gold-500 font-mono text-sm">{p.score.toFixed(1)}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setBriefPriorityId(p.id)}
                      className="px-2 py-1 bg-gold-400/20 hover:bg-gold-400/30 border border-gold-400/60 text-oxblood-900 font-serif text-[11px] font-semibold rounded-xs inline-flex items-center gap-1 transition-colors cursor-pointer"
                      title="View field brief and PDF"
                    >
                      <FileText size={12} className="text-gold-600" />
                      <span>Field Brief</span>
                    </button>

                    <Link
                      href={`/observatory?category=${encodeURIComponent(p.slice.filter_val || "")}`}
                      className="text-henna-600 hover:text-henna-700 font-serif font-bold text-[11px] inline-flex items-center gap-1 group"
                    >
                      <span>Evidence</span>
                      <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-3 py-16 text-center text-xs text-oxblood-800/60">
            No preservation priorities match the selected criteria.
          </div>
        )}
      </div>

      {/* Documentation Brief Modal */}
      <DocumentationBriefModal
        priorityId={briefPriorityId}
        onClose={() => setBriefPriorityId(null)}
      />

      {/* Cultural Responsibility Note */}
      <div className="p-4 bg-cream-200/60 border border-parchment-300 rounded-sm text-xs text-oxblood-800/80 font-sans space-y-1">
        <strong className="text-oxblood-900 block font-serif">Terminology & Governance Rules:</strong>
        <p>
          Priority scores express <em>investigation and research urgency</em> based strictly on documentation completeness. 
          The platform never uses the term "importance" and never ranks cultures or communities against one another.
          Living heritage, ritual, and practitioner perspectives always require Free, Prior and Informed Consent (FPIC).
        </p>
      </div>
    </div>
  );
}

