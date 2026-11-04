"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { CornerFiligree } from "@/components/ornament/CornerFiligree";
import { StatusBadge } from "@/components/StatusBadge";
import { StatusLegend } from "@/components/StatusLegend";
import { PROVENANCE_BADGES } from "@/lib/tokens";
import {
  ShieldAlert, ExternalLink, Download, Layers, ArrowLeft,
  AlertCircle, CheckCircle2, ChevronRight, Info
} from "lucide-react";

export default function RecordDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [record, setRecord] = useState<any>(null);
  const [related, setRelated] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`/api/records/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setRecord(data);
        return fetch(`/api/records/${id}/related`);
      })
      .then((r) => r.json())
      .then((relData) => {
        if (Array.isArray(relData)) setRelated(relData);
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center font-serif text-sm text-oxblood-800">
        Loading museum catalogue dossier...
      </div>
    );
  }

  if (!record) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="font-serif text-2xl font-bold text-oxblood-900">Record Not Found</h2>
        <Link href="/observatory" className="text-xs font-serif text-henna-600 underline">
          Return to Observatory
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs font-serif text-oxblood-800/80">
        <Link href="/observatory" className="hover:text-gold-600 inline-flex items-center gap-1">
          <ArrowLeft size={13} />
          <span>Observatory</span>
        </Link>
        <span>/</span>
        <span className="text-oxblood-900 font-bold truncate max-w-sm">{record.title}</span>
      </div>

      {/* Cultural Sensitivity Notice if Flagged */}
      {record.sensitivity_notices?.length > 0 && (
        <div className="p-4 bg-red-50 border border-red-300 rounded-sm flex items-start gap-3 text-xs text-red-950">
          <ShieldAlert size={18} className="text-red-700 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="font-serif uppercase tracking-wider block">
              Cultural Sensitivity & Living Custodianship Notice
            </strong>
            {record.sensitivity_notices.map((n: string, i: number) => (
              <p key={i} className="font-sans leading-relaxed">{n}</p>
            ))}
            <Link href="/ethics" className="inline-block mt-1 font-serif font-bold text-red-800 underline text-[11px]">
              Learn more about our CARE Ethics Guidelines →
            </Link>
          </div>
        </div>
      )}

      {/* Main Editorial Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Image & Media */}
        <div className="lg:col-span-5 space-y-4 sticky top-20">
          <div className="bg-oxblood-950 border-2 border-gold-400 rounded-sm overflow-hidden relative shadow-lg">
            <CornerFiligree position="top-left" size={28} className="absolute left-1 top-1 z-10" />
            <CornerFiligree position="top-right" size={28} className="absolute right-1 top-1 z-10" />

            {record.image_url ? (
              <img
                src={record.image_url}
                alt={record.title}
                className="w-full h-auto max-h-[500px] object-contain mx-auto"
              />
            ) : (
              <div className="h-72 flex flex-col items-center justify-center text-xs pattern-dotted-parchment p-6 text-center">
                <span className="font-serif italic font-semibold text-sm text-gold-300 bg-oxblood-950/90 px-3 py-1 rounded-xs border border-gold-400/40">
                  No Digital Image Documented
                </span>
                <span className="text-[11px] text-cream-100/80 mt-2 bg-oxblood-950/90 px-2.5 py-0.5 rounded-xs">
                  {record.is_synthetic ? "Synthetic demonstration record" : "Not documented in the analysed collection"}
                </span>
              </div>
            )}
          </div>

          {/* Rights & Licensing Card */}
          <div className="p-4 bg-cream-200/60 border border-parchment-300 rounded-xs text-xs space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-parchment-300">
              <span className="font-serif font-bold uppercase text-[11px] text-oxblood-900">Declared Rights</span>
              <span className="px-2 py-0.5 rounded-xs font-mono text-[10px] font-bold bg-oxblood-900 text-cream-100">
                {record.rights_category || "PDM"}
              </span>
            </div>
            <p className="text-[11px] text-oxblood-800/90 font-sans">
              <strong>Verbatim Declaration:</strong> {record.rights_declared || "Public Domain"}
            </p>
            {record.attribution_text && (
              <p className="text-[11px] text-oxblood-800/80 font-sans italic">
                Attribution: {record.attribution_text}
              </p>
            )}
            <div className="pt-2 flex items-center justify-between">
              {record.download_allowed ? (
                <a
                  href={`/api/images/${record.image_id || record.id}/download`}
                  download
                  className="px-3 py-1.5 bg-gold-400 hover:bg-gold-300 text-oxblood-950 font-serif font-bold text-xs rounded-xs shadow-2xs inline-flex items-center gap-1.5"
                >
                  <Download size={12} />
                  <span>Download Image</span>
                </a>
              ) : (
                <span className="text-copper-700 italic text-[11px]">Download restricted under declared terms</span>
              )}

              {record.source_url && (
                <a
                  href={record.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-henna-700 hover:underline inline-flex items-center gap-1 text-[11px] font-serif font-bold"
                >
                  <span>View Source Archive</span>
                  <ExternalLink size={10} />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Museum Catalog Dossier */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-cream-100 border border-parchment-300 p-6 rounded-sm shadow-xs space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono uppercase text-copper-600 font-bold">
                {record.collection_id} • {record.id}
              </span>
              {record.is_synthetic && (
                <span className="px-2 py-0.5 rounded-xs font-mono text-[10px] font-bold bg-henna-600 text-cream-100">
                  SYNTHETIC RECORD
                </span>
              )}
            </div>

            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-oxblood-900 leading-snug">
              {record.title}
            </h1>

            {/* Metadata Badges Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs font-sans">
              <div className="p-2.5 bg-cream-200/50 rounded-xs border border-parchment-300">
                <span className="text-[10px] text-oxblood-800/60 uppercase block">Art Tradition</span>
                <strong className="text-oxblood-900 font-serif">{record.art_form || "Traditional Indian Craft"}</strong>
              </div>
              <div className="p-2.5 bg-cream-200/50 rounded-xs border border-parchment-300">
                <span className="text-[10px] text-oxblood-800/60 uppercase block">Regional Provenance</span>
                <strong className="text-oxblood-900 font-serif">{record.state || "Not documented in collection"}</strong>
              </div>
              <div className="p-2.5 bg-cream-200/50 rounded-xs border border-parchment-300">
                <span className="text-[10px] text-oxblood-800/60 uppercase block">Chronological Era</span>
                <strong className="text-oxblood-900 font-serif">{record.period || "Historical (Pre-modern)"}</strong>
              </div>
            </div>

            {/* Description */}
            <div className="pt-2">
              <h3 className="font-serif text-sm font-bold uppercase tracking-wider text-oxblood-900 mb-1.5">
                Descriptive Context
              </h3>
              <p className="text-xs sm:text-sm text-oxblood-800/90 leading-relaxed font-sans">
                {record.description || "No descriptive context recorded in holding metadata."}
              </p>
            </div>

            {/* Detailed Properties Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-parchment-300 text-xs font-sans">
              <div><strong>Maker / Artisan:</strong> {record.creator || "Anonymous or unrecorded artisan"}</div>
              <div><strong>Community Lineage:</strong> {record.community || "Not documented in collection"}</div>
              <div><strong>Materials:</strong> {record.materials || "Not documented in collection"}</div>
              <div><strong>Technique:</strong> {record.technique || "Not documented in collection"}</div>
              <div><strong>Holding Source:</strong> {record.source_institution || "Archive"}</div>
              <div><strong>Accession Number:</strong> {record.accession_id || "Unassigned"}</div>
            </div>
          </div>

          {/* 10 Documentation Dimensions Evaluation Breakdown */}
          <div className="bg-cream-100 border border-parchment-300 p-6 rounded-sm shadow-xs space-y-4">
            <h3 className="font-serif text-lg font-bold text-oxblood-900 pb-2 border-b border-parchment-300">
              Dimensional Completeness Audit
            </h3>
            <div className="space-y-2.5">
              {record.dimension_evaluations?.map((d: any) => (
                <div key={d.dimension} className="p-3 bg-cream-200/40 rounded-xs border border-parchment-300 flex items-start justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={d.status} size="sm" />
                      <strong className="font-serif text-oxblood-900">{d.dimension_name}</strong>
                    </div>
                    <p className="text-[11px] text-oxblood-800/80 font-sans italic">{d.reason}</p>
                  </div>
                  <span className="font-mono text-xs font-bold text-oxblood-900">
                    {Math.round(d.score * 100)}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Missing Documentation Panel */}
          {record.missing_documentation_panel?.length > 0 && (
            <div className="bg-copper-500/10 border border-copper-500/40 p-5 rounded-sm space-y-3">
              <div className="flex items-center gap-2 text-copper-800">
                <AlertCircle size={18} />
                <h4 className="font-serif font-bold text-sm uppercase tracking-wider">
                  Missing Documentation in this Record ({record.missing_documentation_panel.length} Dimensions)
                </h4>
              </div>
              <ul className="space-y-1.5 text-xs text-oxblood-800/90 font-sans">
                {record.missing_documentation_panel.map((m: any) => (
                  <li key={m.dimension} className="flex items-start gap-2">
                    <span className="font-mono text-copper-700 font-bold">•</span>
                    <div>
                      <strong>{m.dimension_name}:</strong> {m.reason}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Field Provenance Audit Trail */}
          {record.provenance_records?.length > 0 && (
            <div className="bg-cream-200/50 border border-parchment-300 p-5 rounded-sm space-y-3">
              <h4 className="font-serif font-bold text-xs uppercase tracking-wider text-oxblood-900">
                Immutable Field Provenance Log
              </h4>
              <div className="space-y-1.5 text-xs font-mono">
                {record.provenance_records.map((pr: any, i: number) => {
                  const b = PROVENANCE_BADGES[pr.origin as keyof typeof PROVENANCE_BADGES] || PROVENANCE_BADGES.SOURCE;
                  return (
                    <div key={i} className="p-2 bg-cream-100 rounded-xs border border-parchment-300 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`px-1.5 py-0.5 rounded-xs text-[10px] font-bold border ${b.bg}`}>
                          {b.label}
                        </span>
                        <span className="text-oxblood-900">Field: <strong>{pr.field}</strong></span>
                      </div>
                      <span className="text-[11px] text-oxblood-800/70">{pr.detail}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Related Artifacts Carousel/Grid */}
          {related.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-parchment-300">
              <h4 className="font-serif font-bold text-sm text-oxblood-900">
                Related Heritage in this Collection
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {related.map((rel) => (
                  <Link
                    key={rel.id}
                    href={`/records/${rel.id}`}
                    className="p-2.5 bg-cream-100 border border-parchment-300 rounded-xs hover:border-gold-400 group block"
                  >
                    {rel.thumbnail_url && (
                      <img src={rel.thumbnail_url} alt="" className="w-full aspect-4/3 object-cover rounded-xs mb-1.5" />
                    )}
                    <h5 className="font-serif font-bold text-xs text-oxblood-900 group-hover:text-henna-700 truncate" title={rel.title}>
                      {rel.title}
                    </h5>
                    <span className="text-[10px] text-oxblood-800/70 block mt-0.5">{rel.art_form}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

