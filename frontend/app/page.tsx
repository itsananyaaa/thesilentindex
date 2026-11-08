"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { CornerFiligree } from "@/components/ornament/CornerFiligree";
import { JaliLattice } from "@/components/ornament/JaliLattice";
import { OrnamentalBand } from "@/components/ornament/OrnamentalBand";
import { StatusBadge } from "@/components/StatusBadge";
import { StatusLegend } from "@/components/StatusLegend";
import { ArrowRight, Compass, ShieldCheck, Layers, FileText, CheckCircle2, AlertCircle, Sparkles, MapPin } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { getActiveCollection, setActiveCollection } from "@/lib/collection";

export default function LandingPage() {
  const { lang, t } = useTranslation();
  const [activeColId, setActiveColId] = useState<string>("fused-v2");
  const [summary, setSummary] = useState<any>(null);
  const [audit, setAudit] = useState<any>(null);
  const [priorities, setPriorities] = useState<any[]>([]);
  const [featuredImages, setFeaturedImages] = useState<any[]>([]);

  useEffect(() => {
    setActiveColId(getActiveCollection());

    const handleColChange = () => {
      setActiveColId(getActiveCollection());
    };
    window.addEventListener("collection_changed", handleColChange);
    return () => window.removeEventListener("collection_changed", handleColChange);
  }, []);

  useEffect(() => {
    // 1. Fetch real summary for active collection
    fetch(`/api/collections/${activeColId}/summary`)
      .then((r) => {
        if (!r.ok) throw new Error("Collection summary fetch failed");
        return r.json();
      })
      .then((data) => {
        setSummary(data);
        const auditId = data.latest_audit_id || `AUDIT-${activeColId.toUpperCase()}-INIT`;
        fetch(`/api/audits/${auditId}`)
          .then((r) => r.json())
          .then((aData) => setAudit(aData))
          .catch((err) => console.error(err));

        fetch(`/api/audits/${auditId}/priorities`)
          .then((r) => r.json())
          .then((pData) => {
            if (pData.priorities) setPriorities(pData.priorities.slice(0, 3));
          })
          .catch((err) => console.error(err));
      })
      .catch((err) => {
        console.error("Error loading active collection, falling back to fused-v2:", err);
        if (activeColId !== "fused-v2") {
          setActiveCollection("fused-v2");
        }
      });

    // 2. Fetch images for active collection (with reliable fallback)
    fetch(`/api/images?collection_id=${activeColId}&page_size=6`)
      .then((r) => r.json())
      .then((data) => {
        if (data.images && data.images.length > 0) {
          setFeaturedImages(data.images);
        } else {
          // Always ensure showcase has museum-grade images
          fetch(`/api/images?collection_id=fused-v2&page_size=6`)
            .then((r) => r.json())
            .then((fData) => {
              if (fData.images) setFeaturedImages(fData.images);
            });
        }
      })
      .catch((err) => {
        console.error("Error loading images:", err);
        fetch(`/api/images?collection_id=fused-v2&page_size=6`)
          .then((r) => r.json())
          .then((fData) => {
            if (fData.images) setFeaturedImages(fData.images);
          });
      });
  }, [activeColId]);

  return (
    <div className="min-h-screen bg-cream-100 text-oxblood-900">
      {/* 1. HERO SECTION: Museum Editorial Layout inspired by MAHADI reference */}
      <section className="relative bg-oxblood-900 text-cream-100 overflow-hidden border-b-4 border-gold-400">
        <JaliLattice className="absolute inset-0 opacity-15" />
        <CornerFiligree position="top-left" size={48} className="absolute left-3 top-3 z-10" />
        <CornerFiligree position="top-right" size={48} className="absolute right-3 top-3 z-10" />
        <CornerFiligree position="bottom-left" size={48} className="absolute left-3 bottom-3 z-10" />
        <CornerFiligree position="bottom-right" size={48} className="absolute right-3 bottom-3 z-10" />

        <div className="max-w-7xl mx-auto px-6 pt-4 pb-14 lg:pt-5 lg:pb-16 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Column: Oxblood Editorial Panel */}
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-gold-400/20 border border-gold-400/60 rounded-xs text-gold-300 font-serif tracking-widest text-xs uppercase shadow-2xs">
                <span>{t("home.hero_badge", "THE WORLD WE HAVE PRESERVED • THE KNOWLEDGE WE OMITTED")}</span>
              </div>

              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-cream-100 leading-[1.15]">
                {t("home.hero_title_1", "We have preserved thousands of fragments of history.")}
                <span className="block mt-2 italic font-normal text-gold-300">
                  {t("home.hero_title_2", "But what remains undocumented?")}
                </span>
              </h1>

              <p className="text-base sm:text-lg font-sans text-cream-200/90 leading-relaxed max-w-2xl">
                {t("home.hero_subtitle", "A museum-grade cultural collection auditing platform for Indian heritage. Diagnosing which aspects of cultural knowledge are documented, partially documented, undocumented, or impossible to assess in institutional holdings—then converting those absences into transparent, consent-first priorities.")}
              </p>

              {/* Live Computed Stats Ribbon */}
              <div className="grid grid-cols-3 gap-4 pt-3 border-t border-gold-400/30">
                <div className="bg-oxblood-800/80 p-3.5 rounded-xs border border-gold-400/40 shadow-xs">
                  <span className="text-[11px] font-sans text-gold-300 uppercase tracking-wider block">
                    {t("home.stat_records", "Holdings Audited")}
                  </span>
                  <span className="font-serif text-2xl font-bold text-cream-100">
                    {summary?.total_records ? summary.total_records.toLocaleString() : "181"}
                  </span>
                  <span className="text-[10px] text-cream-200/60 block mt-0.5">
                    {t("home.stat_records_sub", "Verified open-access")}
                  </span>
                </div>
                <div className="bg-oxblood-800/80 p-3.5 rounded-xs border border-gold-400/40 shadow-xs">
                  <span className="text-[11px] font-sans text-gold-300 uppercase tracking-wider block">
                    {t("home.stat_ccd", "Coverage Debt")}
                  </span>
                  <span className="font-serif text-2xl font-bold text-gold-400">
                    {audit?.ccd !== undefined ? audit.ccd.toFixed(1) : "33.9"}
                  </span>
                  <span className="text-[10px] text-cream-200/60 block mt-0.5">
                    {t("home.stat_ccd_sub", "CCD Scale 0-100")}
                  </span>
                </div>
                <div className="bg-oxblood-800/80 p-3.5 rounded-xs border border-gold-400/40 shadow-xs">
                  <span className="text-[11px] font-sans text-gold-300 uppercase tracking-wider block">
                    {t("home.stat_assess", "Assessability")}
                  </span>
                  <span className="font-serif text-2xl font-bold text-cream-100">
                    {audit?.assessability ? audit.assessability.split(" ")[0] : "7"}/10
                  </span>
                  <span className="text-[10px] text-cream-200/60 block mt-0.5">
                    {t("home.stat_assess_sub", "Dimensions assessable")}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 pt-2">
                <Link
                  href="/observatory"
                  className="px-6 py-3 bg-gold-400 hover:bg-gold-300 text-oxblood-950 font-serif font-bold text-sm tracking-wide rounded-xs shadow-md transition-all flex items-center gap-2 group"
                >
                  <span>{t("common.explore_observatory", "Explore the Observatory")}</span>
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/auditor"
                  className="px-6 py-3 bg-olive-700 hover:bg-olive-600 text-cream-100 font-serif font-bold text-sm tracking-wide rounded-xs border border-gold-400/60 transition-all flex items-center gap-2 shadow-sm"
                >
                  <span>{t("common.audit_collection", "Audit a Collection")}</span>
                </Link>
              </div>
            </div>

            {/* Right Column: Cultural Cartography Hero Showcase with Interactive India Map */}
            <div className="lg:col-span-5 relative">
              <div className="bg-olive-900/90 border-2 border-gold-400/80 rounded-sm p-4 sm:p-5 shadow-2xl relative overflow-hidden group">
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-gold-400/40 mb-3.5">
                  <span className="font-serif text-xs sm:text-sm font-bold uppercase tracking-wider text-gold-300 flex items-center gap-1.5">
                    <Sparkles size={14} className="text-gold-400 animate-pulse" />
                    Living Cultural Cartography
                  </span>
                  <span className="text-[10px] font-mono font-medium px-2 py-0.5 bg-olive-950/80 border border-gold-400/50 text-gold-200 rounded-xs">
                    36 States &amp; UTs
                  </span>
                </div>

                {/* Interactive Map Showcase with Pop-up & Hover Effects */}
                <Link
                  href="/map"
                  className="block relative aspect-[4/5] w-full bg-[#fbf8ee] rounded-xs overflow-hidden border border-gold-400/60 shadow-inner group/map focus:outline-none focus:ring-2 focus:ring-gold-400"
                  title="Explore the Interactive Living Culture Map of India"
                >
                  {/* Subtle Background Lattice Watermark */}
                  <div className="absolute inset-0 bg-[radial-gradient(#d4af37_1px,transparent_1px)] [background-size:16px_16px] opacity-15 pointer-events-none" />

                  {/* Golden Glow Aura blooming on hover */}
                  <div className="absolute inset-0 bg-radial from-amber-400/25 via-gold-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-xl pointer-events-none" />

                  {/* The Illustrated Cultural Map with Pop-Up Transform */}
                  <img
                    src="/images/india_cultural_map.jpg"
                    alt="Illustrated Cultural Map of India showing living heritage traditions, monuments, crafts, and arts"
                    className="w-full h-full object-contain p-2 sm:p-3 transition-all duration-500 ease-out transform group-hover:scale-105 group-hover:-translate-y-1.5 drop-shadow-md group-hover:drop-shadow-[0_20px_25px_rgba(217,119,6,0.35)]"
                    loading="eager"
                  />

                  {/* Shimmer Light Sweeping across the frame on hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />

                  {/* Delicate Floating Cultural Region Hotspot Markers */}
                  {/* North: Himalayas */}
                  <div className="absolute top-4 left-6 hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-oxblood-950/85 border border-gold-400/60 text-[9px] font-mono text-gold-300 shadow-md backdrop-blur-xs transition-transform duration-300 group-hover:scale-105">
                    <span className="w-1.5 h-1.5 rounded-full bg-gold-400 animate-ping" />
                    <span>Himalayan Epigraphy &amp; Crafts</span>
                  </div>

                  {/* East: Bengal & Odisha */}
                  <div className="absolute top-1/3 right-3 hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-oxblood-950/85 border border-gold-400/60 text-[9px] font-mono text-gold-300 shadow-md backdrop-blur-xs transition-transform duration-300 group-hover:scale-105">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                    <span>Pattachitra &amp; Chhau</span>
                  </div>

                  {/* South: Deccan & Carnatic */}
                  <div className="absolute bottom-12 left-4 hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-oxblood-950/85 border border-gold-400/60 text-[9px] font-mono text-gold-300 shadow-md backdrop-blur-xs transition-transform duration-300 group-hover:scale-105">
                    <span className="w-1.5 h-1.5 rounded-full bg-gold-400 animate-ping" />
                    <span>Carnatic Arts &amp; Bronzes</span>
                  </div>

                  {/* Interactive Floating Hover Pill */}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 pointer-events-none bg-oxblood-950/95 text-gold-300 border border-gold-400/90 px-3.5 py-1.5 rounded-full text-xs font-serif shadow-2xl flex items-center gap-2 backdrop-blur-md whitespace-nowrap">
                    <MapPin size={13} className="text-gold-400 animate-bounce" />
                    <span className="font-bold tracking-wide">Explore Living Culture Map</span>
                    <ArrowRight size={12} className="text-gold-300" />
                  </div>
                </Link>

                {/* Footer with Links */}
                <div className="mt-3.5 pt-3 border-t border-gold-400/30 flex items-center justify-between text-[11px] text-cream-200/90 font-sans">
                  <span className="text-gold-300/80 font-serif italic">
                    PS-05 • The Living Culture Map
                  </span>
                  <div className="flex items-center gap-3">
                    <Link
                      href="/atlas"
                      className="text-cream-200 hover:text-gold-300 underline font-medium"
                    >
                      Cultural Atlas
                    </Link>
                    <span className="text-gold-400/40">•</span>
                    <Link
                      href="/map"
                      className="text-gold-300 hover:text-gold-200 font-bold inline-flex items-center gap-1 hover:underline"
                    >
                      <span>Open Map</span>
                      <ArrowRight size={12} />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. LIVE CULTURAL COVERAGE DEBT (CCD) EXPLAINER */}
      <section className="py-16 max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="font-serif text-xs font-bold uppercase tracking-widest text-copper-600 block mb-2">
            Deterministic Metric
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-oxblood-900">
            What is Cultural Coverage Debt?
          </h2>
          <p className="mt-3 text-sm font-sans text-oxblood-800/80 leading-relaxed">
            Cultural Coverage Debt (CCD) measures <strong className="font-semibold text-oxblood-900">documentation completeness</strong> across 
            ten essential dimensions of knowledge. It measures what a catalog records, not the intrinsic value of a tradition.
          </p>
        </div>

        {/* 10 Documentation Dimensions Strip */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { id: "visual_documentation", name: "1. Visual Documentation", desc: "High-res photos, technical metadata & verified reuse rights." },
            { id: "historical_context", name: "2. Historical Context", desc: "Period, dynasty, descriptive historiography and citations." },
            { id: "original_language", name: "3. Original-Language", desc: "Native Indic scripts (Devanagari, Tamil, etc.) vs English-only." },
            { id: "geographic_provenance", name: "4. Geographic Provenance", desc: "State, district, locality, and geonames coordinates." },
            { id: "materials_and_techniques", name: "5. Materials & Techniques", desc: "Constituent media (pigments, alloys) and craft techniques." },
            { id: "practitioner_perspective", name: "6. Practitioner Perspective", desc: "Named artisan, hereditary guild, first-person voice." },
            { id: "oral_histories", name: "7. Oral Histories", desc: "Linked narratives, folklore, recitation, recorded memory." },
            { id: "source_attribution", name: "8. Source Attribution", desc: "Holding institution, accession ID, and chain of custody." },
            { id: "community_validation", name: "9. Community Validation", desc: "Living consultation protocols. Strict: Not assessable if unmapped." },
            { id: "preservation_accessibility", name: "10. Preservation & Access", desc: "Conservation state, declared license, access URL." },
          ].map((dim) => (
            <div key={dim.id} className="bg-cream-200/70 border border-parchment-300 p-4 rounded-xs shadow-xs hover:border-gold-400 transition-colors">
              <h3 className="font-serif font-bold text-sm text-oxblood-900 mb-1.5">{dim.name}</h3>
              <p className="text-xs text-oxblood-800/80 leading-relaxed">{dim.desc}</p>
            </div>
          ))}
        </div>

        {/* Global Four-State Absence Model Legend */}
        <div className="mt-8">
          <StatusLegend />
        </div>
      </section>

      {/* 3. HOW IT WORKS STRIP */}
      <section className="bg-cream-200/60 border-y border-parchment-300 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="font-serif text-xs font-bold uppercase tracking-widest text-copper-600 block mb-2">
              Auditing Pipeline
            </span>
            <h2 className="font-serif text-3xl font-bold text-oxblood-900">
              The 6-Step Responsible Audit Workflow
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
            {[
              { step: "01", title: "Upload", desc: "Drop any CSV or JSON manifest up to 25 MB with automatic encoding detection." },
              { step: "02", title: "Map Columns", desc: "Confirm fuzzy header mappings with confidence badges before running." },
              { step: "03", title: "Audit", desc: "Deterministic rubric scoring, duplicate detection, and geographic conflict check." },
              { step: "04", title: "Prioritise", desc: "Calculate gap magnitude, evidence confidence, breadth, and feasibility." },
              { step: "05", title: "Consult", desc: "Enforce consent-first gating: community permission comes before documentation." },
              { step: "06", title: "Document", desc: "Export museum-grade PDF and CSV reports with traceable citations." },
            ].map((st) => (
              <div key={st.step} className="bg-cream-100 p-5 rounded-xs border border-parchment-300 flex flex-col justify-between">
                <div>
                  <span className="font-serif text-2xl font-bold text-gold-500 block mb-2">{st.step}</span>
                  <h4 className="font-serif font-bold text-base text-oxblood-900 mb-2">{st.title}</h4>
                  <p className="text-xs text-oxblood-800/80 leading-relaxed">{st.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. REAL RECOMMENDATION CARDS PREVIEW */}
      <section className="py-16 max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
          <div>
            <span className="font-serif text-xs font-bold uppercase tracking-widest text-copper-600 block mb-2">
              Actionable Intelligence
            </span>
            <h2 className="font-serif text-3xl font-bold text-oxblood-900">
              Preservation Priority Recommendations
            </h2>
            <p className="mt-2 text-sm text-oxblood-800/80">
              Surfacing concrete documentation priorities with mandatory community consultation gating.
            </p>
          </div>
          <Link
            href="/priorities"
            className="mt-4 md:mt-0 inline-flex items-center gap-1.5 text-xs font-serif font-bold text-henna-600 hover:text-henna-700 underline underline-offset-4"
          >
            <span>View All Priorities</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {priorities.length > 0 ? (
            priorities.map((p) => (
              <div key={p.id} className="bg-cream-200/50 border border-parchment-300 rounded-sm p-5 flex flex-col justify-between shadow-xs">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 bg-oxblood-900 text-cream-100 rounded-xs">
                      {p.band.replace(" investigation priority", "")}
                    </span>
                    <span className={`text-[10px] font-sans font-bold uppercase px-2 py-0.5 rounded-xs border ${
                      p.consultation === "required"
                        ? "bg-red-50 text-red-900 border-red-300"
                        : "bg-gold-50 text-gold-900 border-gold-300"
                    }`}>
                      Consultation: {p.consultation}
                    </span>
                  </div>

                  <span className="text-xs font-sans text-copper-600 font-medium block mb-1">
                    {p.slice.name}
                  </span>
                  <h4 className="font-serif font-bold text-lg text-oxblood-900 mb-2">
                    Missing {p.dimension_name}
                  </h4>

                  <p className="text-xs text-oxblood-800/80 leading-relaxed mb-4">
                    {p.next_step}
                  </p>
                </div>

                <div className="pt-3 border-t border-parchment-300 flex items-center justify-between text-[11px] text-oxblood-800/70">
                  <span>Score: <strong>{p.score.toFixed(1)}/100</strong></span>
                  <Link href={`/observatory?category=${encodeURIComponent(p.slice.filter_val || '')}`} className="text-henna-600 hover:underline">
                    Inspect records →
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 text-center py-10 bg-cream-200/30 border border-dashed border-parchment-300 text-sm text-oxblood-800">
              Loading active priority recommendations...
            </div>
          )}
        </div>
      </section>

      {/* 5. COMMUNITY-CENTRED ETHICS CALLOUT */}
      <section className="bg-emerald-950 text-cream-100 py-16 px-6 relative overflow-hidden">
        <JaliLattice className="absolute inset-0 opacity-10" />
        <div className="max-w-4xl mx-auto relative z-10 text-center space-y-4">
          <span className="font-serif text-xs font-bold uppercase tracking-widest text-gold-300 block">
            Responsible Digital Humanities
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-cream-100">
            Consent First: Empowering Custodians, Not Replacing Them
          </h2>
          <p className="text-sm font-sans text-cream-200/90 leading-relaxed max-w-2xl mx-auto">
            THE SILENCE INDEX adheres strictly to the CARE Principles for Indigenous Data Governance.
            Absence of metadata never justifies non-consensual extraction. Where ritual, esoteric, or living
            artisan knowledge is undocumented, the software advises community consultation—never automated generation.
          </p>
          <div className="pt-4 flex justify-center gap-4">
            <Link
              href="/ethics"
              className="px-5 py-2.5 bg-gold-400 hover:bg-gold-300 text-oxblood-950 font-serif font-bold text-xs rounded-xs shadow-sm"
            >
              Read Ethical Principles & CARE Protocol
            </Link>
            <Link
              href="/method"
              className="px-5 py-2.5 bg-transparent hover:bg-emerald-900 border border-gold-400/60 text-cream-100 font-serif font-bold text-xs rounded-xs"
            >
              Read Methodological Formulas
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

