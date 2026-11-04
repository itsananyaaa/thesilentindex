"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { CornerFiligree } from "@/components/ornament/CornerFiligree";
import { OrnamentalBand } from "@/components/ornament/OrnamentalBand";
import { StatusBadge } from "@/components/StatusBadge";
import {
  Download, FileText, AlertTriangle, Layers, ShieldAlert,
  ChevronRight, CheckCircle2, ArrowRight, Printer
} from "lucide-react";

export default function SilenceReportPage() {
  const params = useParams();
  const auditId = (params?.auditId as string) || "AUDIT-SAMPLE-REAL-001-INIT";

  const [report, setReport] = useState<any>(null);
  const [findings, setFindings] = useState<any[]>([]);
  const [duplicates, setDuplicates] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`/api/audits/${auditId}/report.json`).then((r) => r.json()),
      fetch(`/api/audits/${auditId}/findings`).then((r) => r.json()),
      fetch(`/api/audits/${auditId}/duplicates`).then((r) => r.json()),
    ])
      .then(([repData, findData, dupData]) => {
        setReport(repData);
        if (findData.findings) setFindings(findData.findings);
        if (dupData.clusters) setDuplicates(dupData.clusters);
      })
      .catch((e) => console.error("Error loading report:", e))
      .finally(() => setLoading(false));
  }, [auditId]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-10">
      {/* Report Header Card */}
      <div className="bg-oxblood-900 text-cream-100 p-8 rounded-sm border-2 border-gold-400 shadow-xl relative overflow-hidden">
        <CornerFiligree position="top-left" size={36} className="absolute left-2 top-2" />
        <CornerFiligree position="top-right" size={36} className="absolute right-2 top-2" />

        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-gold-400/40">
            <span className="font-serif text-xs font-bold uppercase tracking-widest text-gold-300">
              AUDIT DOSSIER • {auditId}
            </span>
            <div className="flex gap-2">
              <a
                href={`/api/audits/${auditId}/report.pdf`}
                download
                className="px-3.5 py-1.5 bg-gold-400 hover:bg-gold-300 text-oxblood-950 font-serif font-bold text-xs rounded-xs shadow-md inline-flex items-center gap-1.5"
              >
                <Download size={13} />
                <span>Export PDF Report</span>
              </a>
              <a
                href={`/api/audits/${auditId}/report.csv`}
                download
                className="px-3 py-1.5 bg-oxblood-800 hover:bg-oxblood-700 text-cream-100 font-serif font-bold text-xs rounded-xs border border-gold-400/50 inline-flex items-center gap-1.5"
              >
                <Download size={13} />
                <span>Export CSV</span>
              </a>
            </div>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-cream-100">
            THE SILENCE REPORT
          </h1>
          <p className="text-xs sm:text-sm text-cream-200/90 font-sans leading-relaxed max-w-2xl">
            Audit of documentation completeness and institutional metadata gaps for:{" "}
            <strong className="text-cream-100 font-serif">{report?.collection?.name || "Collection"}</strong>.
          </p>

          {/* Metric Highlights Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-gold-400/30">
            <div className="bg-oxblood-800/80 p-3 rounded-xs border border-gold-400/30">
              <span className="text-[10px] text-gold-300 uppercase block">Cultural Coverage Debt</span>
              <span className="font-serif text-3xl font-bold text-gold-400">
                {report?.ccd !== undefined ? report.ccd.toFixed(1) : "—"}
              </span>
              <span className="text-[10px] text-cream-200/70 block mt-0.5">
                90% CI: [{report?.ccd_interval?.[0]?.toFixed(1)}, {report?.ccd_interval?.[1]?.toFixed(1)}]
              </span>
            </div>
            <div className="bg-oxblood-800/80 p-3 rounded-xs border border-gold-400/30">
              <span className="text-[10px] text-gold-300 uppercase block">Assessability</span>
              <span className="font-serif text-xl font-bold text-cream-100 mt-1 block">
                {report?.assessability || "7 of 10 dimensions"}
              </span>
              <span className="text-[10px] text-cream-200/70 block mt-0.5">Driven by schema mapping</span>
            </div>
            <div className="bg-oxblood-800/80 p-3 rounded-xs border border-gold-400/30">
              <span className="text-[10px] text-gold-300 uppercase block">Total Catalog Items</span>
              <span className="font-serif text-3xl font-bold text-cream-100">
                {report?.total_records || 0}
              </span>
              <span className="text-[10px] text-cream-200/70 block mt-0.5">Evaluated across 10 rubrics</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mandatory Standing Notice */}
      <div className="p-4 bg-cream-200/80 border border-gold-400 rounded-sm text-xs text-oxblood-900 space-y-1">
        <strong className="font-serif uppercase tracking-wider text-copper-700 block text-[11px]">
          Fundamental Axiom: Absence is Not Inferiority
        </strong>
        <p className="font-sans leading-relaxed text-oxblood-800/90">
          Absence of a record in this catalog is never proof that a tradition, region or community has less heritage. 
          All findings strictly reflect what is documented or omitted in the analyzed institutional holdings. 
          No culture or lineage is ranked by value.
        </p>
      </div>

      {/* Section 1: Diagnostic Findings */}
      <section className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-parchment-300">
          <h2 className="font-serif text-2xl font-bold text-oxblood-900">
            1. Diagnostic Metadata Findings ({findings.length})
          </h2>
          <span className="text-xs text-oxblood-800/70 font-sans">Empirically Traceable</span>
        </div>

        <div className="space-y-4">
          {findings.length > 0 ? (
            findings.map((f) => (
              <div
                key={f.id}
                className="bg-cream-100 border-2 border-parchment-300 rounded-sm p-6 space-y-4 hover:border-gold-400 transition-colors shadow-xs"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-parchment-300">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 bg-oxblood-900 text-cream-100 rounded-xs">
                      {f.kind.replace("_", " ").toUpperCase()}
                    </span>
                    <span className="text-[10px] font-mono text-oxblood-800/70 font-semibold">
                      Certainty: {f.certainty?.toUpperCase()}
                    </span>
                  </div>
                  <span className="text-xs font-mono text-copper-600 font-bold">
                    {f.record_ids?.length || 0} Records Affected
                  </span>
                </div>

                <div>
                  <h3 className="font-serif font-bold text-lg text-oxblood-900 mb-1">{f.title}</h3>
                  <p className="text-xs text-oxblood-800/90 font-sans leading-relaxed">{f.issue}</p>
                </div>

                {/* Explanation */}
                <div className="p-3 bg-cream-200/50 rounded-xs border border-parchment-300 text-xs text-oxblood-900 space-y-1">
                  <span className="text-[10px] font-serif font-bold uppercase text-copper-700 block">
                    Diagnostic Analysis ({f.explanation_origin === "AI-worded" ? "AI-worded" : "Deterministic"}):
                  </span>
                  <p className="font-sans leading-relaxed text-oxblood-800/90">{f.explanation}</p>
                </div>

                {/* Why It Matters & Suggested Action */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans pt-2">
                  <div className="p-3 bg-cream-200/30 rounded-xs border border-parchment-300">
                    <strong className="text-oxblood-900 block mb-1">Why It Matters:</strong>
                    <p className="text-oxblood-800/80 leading-relaxed">{f.why_it_matters}</p>
                  </div>
                  <div className="p-3 bg-olive-700/10 rounded-xs border border-olive-500/30">
                    <strong className="text-olive-800 block mb-1">Suggested Institutional Action:</strong>
                    <p className="text-oxblood-800/90 leading-relaxed">{f.suggested_action}</p>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <Link
                    href={`/observatory?q=${encodeURIComponent(f.title.split(" ")[0])}`}
                    className="text-xs font-serif font-bold text-henna-600 hover:text-henna-700 underline underline-offset-4 inline-flex items-center gap-1"
                  >
                    <span>Click-through responsible records</span>
                    <ChevronRight size={14} />
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-xs text-oxblood-800/60 bg-cream-100 border border-parchment-300 rounded-sm">
              No critical diagnostic anomalies detected in this collection.
            </div>
          )}
        </div>
      </section>

      {/* Section 2: Candidate Duplicate Clusters */}
      {duplicates.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-parchment-300">
            <h2 className="font-serif text-2xl font-bold text-oxblood-900">
              2. Candidate Duplicate Clusters ({duplicates.length})
            </h2>
            <span className="text-xs text-oxblood-800/70">RapidFuzz Token-Set Clustering • Never Auto-Merged</span>
          </div>

          <div className="space-y-3">
            {duplicates.slice(0, 5).map((dc) => (
              <div key={dc.cluster_id} className="p-4 bg-cream-100 border border-parchment-300 rounded-sm space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-oxblood-900">{dc.cluster_id}</span>
                    <span className="px-1.5 py-0.5 rounded-xs text-[10px] font-mono bg-gold-400/20 text-oxblood-900 border border-gold-400/40">
                      {dc.similarity}% Similarity
                    </span>
                  </div>
                  <span className="text-[11px] text-oxblood-800/70">Matched: {dc.matched_fields.join(", ")}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {dc.records.map((r: any) => (
                    <div key={r.id} className="p-2.5 bg-cream-200/50 border border-parchment-300 rounded-xs">
                      <div className="font-mono text-[10px] text-copper-600">{r.id} • {r.accession_id || "No accession ID"}</div>
                      <h4 className="font-serif font-bold text-oxblood-900 truncate mt-0.5" title={r.title}>{r.title}</h4>
                      <p className="text-[11px] text-oxblood-800/70 mt-1">{r.art_form} • {r.state || "Unassigned state"}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Section 3: Recommended Documentation Priorities */}
      <section className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-parchment-300">
          <h2 className="font-serif text-2xl font-bold text-oxblood-900">
            3. Recommended Documentation Roadmap
          </h2>
          <Link href="/priorities" className="text-xs font-serif font-bold text-henna-600 hover:underline">
            Open Full Priority Engine →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {report?.priorities?.slice(0, 4).map((p: any) => (
            <div key={p.id} className="p-5 bg-cream-100 border border-parchment-300 rounded-sm space-y-2">
              <div className="flex items-center justify-between text-[10px] font-mono uppercase">
                <span className="px-2 py-0.5 bg-oxblood-900 text-cream-100 rounded-xs">{p.band}</span>
                <span className="text-copper-700 font-bold">Consent: {p.consultation}</span>
              </div>
              <h4 className="font-serif font-bold text-base text-oxblood-900">{p.slice.name}: {p.dimension_name}</h4>
              <p className="text-xs text-oxblood-800/80 leading-relaxed font-sans">{p.next_step}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

