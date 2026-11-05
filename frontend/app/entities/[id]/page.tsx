"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { CornerFiligree } from "@/components/ornament/CornerFiligree";
import { StatusBadge } from "@/components/StatusBadge";
import { StatusLegend } from "@/components/StatusLegend";
import { DocumentationBriefModal } from "@/components/DocumentationBriefModal";
import {
  Landmark, Award, Shield, FileText, ChevronRight, ExternalLink,
  CheckCircle2, Layers, Download, ArrowLeft, ArrowUpRight
} from "lucide-react";

export default function HeritageEntityDetailPage() {
  const params = useParams();
  const entityId = params?.id as string;

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedBriefPriority, setSelectedBriefPriority] = useState<string | null>(null);

  useEffect(() => {
    if (!entityId) return;
    setLoading(true);
    fetch(`/api/entities/${entityId}`)
      .then((r) => r.json())
      .then((data) => setProfile(data))
      .catch((e) => console.error("Error loading entity profile:", e))
      .finally(() => setLoading(false));
  }, [entityId]);

  if (loading || !profile) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center font-serif text-sm text-oxblood-800">
        Loading Heritage Entity evidence stack...
      </div>
    );
  }

  const dims = profile.dimensions ? Object.values(profile.dimensions) : [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 overflow-x-hidden">
      {/* Back breadcrumb */}
      <div>
        <Link
          href="/entities"
          className="text-xs font-serif text-copper-600 hover:text-copper-700 inline-flex items-center gap-1"
        >
          <ArrowLeft size={13} />
          <span>Back to Heritage Entities Directory</span>
        </Link>
      </div>

      {/* Hero Header */}
      <div className="relative bg-cream-200/90 border border-gold-400 p-6 rounded-sm shadow-xs overflow-hidden">
        <CornerFiligree position="top-left" size={32} className="absolute left-1 top-1" />
        <CornerFiligree position="top-right" size={32} className="absolute right-1 top-1" />

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-[10px] font-mono uppercase tracking-widest font-bold px-2 py-0.5 bg-oxblood-900 text-cream-100 rounded-xs">
                HERITAGE ENTITY PROFILE
              </span>
              <span className="text-xs font-mono text-copper-600 font-bold">
                {profile.primary_state_codes?.join(" • ") || "India"}
              </span>
              <span className="text-xs font-mono text-oxblood-800/60">
                {profile.entity_id}
              </span>
            </div>

            <h1 className="font-serif text-3xl font-bold text-oxblood-900">
              {profile.label}
            </h1>

            <p className="text-xs text-oxblood-800/80 mt-2 max-w-3xl leading-relaxed font-sans">
              {profile.description || "Traditional Indian cultural heritage entity registered and documented across authoritative registries."}
            </p>

            {/* Recognition Badges */}
            {profile.recognition_badges && profile.recognition_badges.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {profile.recognition_badges.map((b: any, idx: number) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 bg-gold-400/20 border border-gold-500 text-oxblood-950 font-serif font-bold text-xs rounded-xs flex items-center gap-1.5 shadow-2xs"
                  >
                    <Award size={14} className="text-gold-600" />
                    <span>{b.label}</span>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Cross-Source Debt Closing Metric */}
          <div className="bg-oxblood-900 text-cream-100 border border-gold-400 p-4 rounded-xs shrink-0 text-center min-w-[200px]">
            <span className="text-[10px] font-sans uppercase tracking-wider text-gold-300 block">
              Entity-Level CCD
            </span>
            <span className="font-serif text-3xl font-bold text-gold-400">
              {profile.entity_ccd !== undefined ? profile.entity_ccd.toFixed(1) : "—"}
            </span>
            <div className="text-[10px] text-cream-200/80 mt-1 space-y-0.5 font-sans">
              <p>Record Avg CCD: {profile.record_level_avg_ccd?.toFixed(1)}</p>
              <p className="text-emerald-400 font-bold">
                ↓ Debt Closed: {profile.debt_closed_delta?.toFixed(1)} pts
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 10-Dimension Cross-Source Evidence Stack */}
      <div className="bg-cream-100 border border-parchment-300 rounded-sm p-6 space-y-6 shadow-xs">
        <div>
          <h2 className="font-serif text-xl font-bold text-oxblood-900 flex items-center gap-2">
            <Layers size={18} className="text-gold-500" />
            <span>Dimension Evidence Stack: S(E, d) = max_(r in E) S(r, d)</span>
          </h2>
          <p className="text-xs text-oxblood-800/80 mt-1 font-sans">
            How institutional fusion supplies evidence across the 10 cultural knowledge dimensions.
          </p>
        </div>

        <div className="space-y-4">
          {dims.map((d: any) => (
            <div
              key={d.dimension}
              className="p-4 bg-cream-200/50 border border-parchment-300 rounded-xs space-y-2"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-serif font-bold text-sm text-oxblood-900">
                    {d.dimension.replace(/_/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase())}
                  </span>
                  <StatusBadge status={d.status} size="sm" />
                </div>
                <div className="text-xs font-mono text-oxblood-800/80">
                  Fused Score: <span className="font-bold text-oxblood-900">{d.score.toFixed(2)}</span> / 1.00
                </div>
              </div>

              {/* Supplied By Attribution Pill */}
              {d.supplied_by ? (
                <div className="p-2.5 bg-cream-100 border border-gold-400/50 rounded-xs text-xs font-sans flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider font-bold px-1.5 py-0.5 bg-olive-700 text-cream-100 rounded-xs">
                      SUPPLIED BY
                    </span>
                    <span className="font-semibold text-oxblood-900 truncate max-w-md">
                      {d.supplied_by.title}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-copper-600 font-bold shrink-0">
                    {d.supplied_by.institution || d.supplied_by.layer_id}
                  </span>
                </div>
              ) : (
                <div className="text-xs text-oxblood-800/60 italic font-serif">
                  Not documented in any linked source record.
                </div>
              )}
            </div>
          ))}
        </div>

        <StatusLegend />
      </div>

      {/* Linked Source Records */}
      <div className="bg-cream-100 border border-parchment-300 rounded-sm p-6 space-y-4 shadow-xs">
        <h3 className="font-serif text-lg font-bold text-oxblood-900 flex items-center gap-2">
          <FileText size={17} className="text-copper-600" />
          <span>Linked Source Records ({profile.linked_records?.length || 0})</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {profile.linked_records?.map((r: any) => (
            <div
              key={r.id}
              className="p-3 bg-cream-200/50 border border-parchment-300 rounded-xs flex items-center justify-between gap-3 text-xs"
            >
              <div className="truncate">
                <span className="text-[10px] font-mono uppercase font-bold text-copper-600 block">
                  {r.layer_id || "source"}
                </span>
                <span className="font-semibold text-oxblood-900 block truncate" title={r.title}>
                  {r.title}
                </span>
                <span className="text-[11px] text-oxblood-800/60 block">
                  {r.institution || "Holding Archive"} • Rights: {r.rights_category}
                </span>
              </div>
              <Link
                href={`/records/${r.id}`}
                className="px-2.5 py-1 bg-gold-400 hover:bg-gold-300 text-oxblood-950 font-serif font-bold text-[11px] rounded-xs shadow-2xs shrink-0 flex items-center gap-1"
              >
                <span>Inspect</span>
                <ChevronRight size={12} />
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Documentation Brief Modal (F5) */}
      <DocumentationBriefModal
        priorityId={selectedBriefPriority}
        onClose={() => setSelectedBriefPriority(null)}
      />
    </div>
  );
}
