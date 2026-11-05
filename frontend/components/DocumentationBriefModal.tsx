"use client";

import React, { useState, useEffect } from "react";
import { CornerFiligree } from "./ornament/CornerFiligree";
import { FileText, Download, CheckCircle, HelpCircle, X, Shield, ArrowRight } from "lucide-react";

interface DocumentationBriefModalProps {
  priorityId: string | null;
  onClose: () => void;
}

export const DocumentationBriefModal: React.FC<DocumentationBriefModalProps> = ({ priorityId, onClose }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!priorityId) return;
    setLoading(true);
    fetch(`/api/priorities/${priorityId}/brief`)
      .then((r) => r.json())
      .then((res) => setData(res))
      .catch((e) => console.error("Error loading brief:", e))
      .finally(() => setLoading(false));
  }, [priorityId]);

  if (!priorityId) return null;

  return (
    <div className="fixed inset-0 z-50 bg-oxblood-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-cream-100 border-2 border-gold-400 rounded-sm shadow-2xl p-6 my-8 max-h-[90vh] overflow-y-auto">
        <CornerFiligree position="top-left" size={28} className="absolute left-1 top-1" />
        <CornerFiligree position="top-right" size={28} className="absolute right-1 top-1" />

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-oxblood-800/60 hover:text-oxblood-900 p-1"
          aria-label="Close Brief"
        >
          <X size={18} />
        </button>

        {loading || !data ? (
          <div className="py-16 text-center font-serif text-sm text-oxblood-800/70">
            Generating Documentation Brief...
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <FileText size={18} className="text-gold-500" />
                <span className="text-[10px] font-mono uppercase tracking-widest font-bold px-2 py-0.5 bg-oxblood-900 text-gold-300 rounded-xs">
                  ONE-PAGE RESEARCH DOSSIER
                </span>
                <span className="text-xs font-mono text-oxblood-800/60 ml-auto">
                  {data.priority_id}
                </span>
              </div>
              <h2 className="font-serif text-2xl font-bold text-oxblood-900">
                Documentation Brief: {data.tradition_name}
              </h2>
              <p className="text-xs text-oxblood-800/80 mt-1 font-sans">
                Fieldwork protocol tailored for researchers, photographers, and community liaisons.
              </p>
            </div>

            {/* Action Banner */}
            <div className="p-4 bg-cream-200/70 border border-parchment-300 rounded-xs space-y-2 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pb-2 border-b border-parchment-300 font-sans">
                <div>
                  <span className="text-[10px] text-copper-600 uppercase block font-semibold">Dimension</span>
                  <span className="font-bold text-oxblood-900">{data.dimension.replace(/_/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase())}</span>
                </div>
                <div>
                  <span className="text-[10px] text-copper-600 uppercase block font-semibold">Priority Band</span>
                  <span className="font-bold text-oxblood-900">{data.band}</span>
                </div>
                <div>
                  <span className="text-[10px] text-copper-600 uppercase block font-semibold">Priority Score</span>
                  <span className="font-bold text-gold-600 font-serif text-sm">{data.score.toFixed(1)} / 100</span>
                </div>
                <div>
                  <span className="text-[10px] text-copper-600 uppercase block font-semibold">Consent Gate</span>
                  <span className={`px-2 py-0.5 rounded-xs font-mono text-[10px] font-bold uppercase inline-block mt-0.5 ${
                    data.consultation === "required" ? "bg-henna-600 text-cream-100" : "bg-olive-700 text-cream-100"
                  }`}>
                    {data.consultation}
                  </span>
                </div>
              </div>
              <p className="font-serif italic text-oxblood-900 pt-1">
                <b>Immediate Action:</b> {data.next_step}
              </p>
            </div>

            {/* Questions to Investigate */}
            <div>
              <h4 className="font-serif text-sm font-bold text-oxblood-900 flex items-center gap-1.5 mb-2">
                <HelpCircle size={15} className="text-copper-600" />
                <span>1. Primary Fieldwork Questions to Investigate</span>
              </h4>
              <ul className="space-y-1.5 text-xs text-oxblood-800 font-sans pl-2">
                {data.investigation_questions.map((q: string, i: number) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-gold-500 font-bold">•</span>
                    <span>{q}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* CARE Principles & Indigenous Consent Checklist */}
            <div className="p-4 bg-cream-200/50 border border-gold-400/50 rounded-xs">
              <h4 className="font-serif text-sm font-bold text-oxblood-900 flex items-center gap-1.5 mb-2">
                <Shield size={15} className="text-henna-600" />
                <span>2. CARE Principles & Indigenous Consent Protocol (MANDATORY)</span>
              </h4>
              <ul className="space-y-2 text-xs text-oxblood-800 font-sans">
                {data.care_checklist.map((c: string, i: number) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle size={14} className="text-olive-700 shrink-0 mt-0.5" />
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Desk Research Steps */}
            <div>
              <h4 className="font-serif text-sm font-bold text-oxblood-900 flex items-center gap-1.5 mb-2">
                <ArrowRight size={15} className="text-olive-700" />
                <span>3. Desk Research Before Approaching Community</span>
              </h4>
              <ul className="space-y-1.5 text-xs text-oxblood-800 font-sans pl-2">
                {data.desk_research_steps.map((s: string, i: number) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-copper-600 font-bold">→</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Download PDF button */}
            <div className="flex items-center justify-between border-t border-parchment-300 pt-4">
              <span className="text-[11px] text-oxblood-800/60 font-sans">
                Format: Archival 8.5" × 11" PDF ready for print or field distribution
              </span>
              <a
                href={`/api/priorities/${data.priority_id}/brief.pdf`}
                download
                className="px-4 py-2 bg-oxblood-900 hover:bg-oxblood-800 text-cream-100 font-serif font-bold text-xs rounded-xs flex items-center gap-2 shadow-xs transition-colors"
              >
                <Download size={14} />
                <span>Download Printable PDF Brief</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

