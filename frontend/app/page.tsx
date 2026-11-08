"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { CornerFiligree } from "@/components/ornament/CornerFiligree";
import { JaliLattice } from "@/components/ornament/JaliLattice";
import { OrnamentalBand } from "@/components/ornament/OrnamentalBand";
import { StatusBadge } from "@/components/StatusBadge";
import { StatusLegend } from "@/components/StatusLegend";
import { ArrowRight, Compass, ShieldCheck, Layers, FileText, CheckCircle2, AlertCircle, Sparkles, MapPin, Volume2, VolumeX, Music } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { getActiveCollection, setActiveCollection } from "@/lib/collection";

export default function LandingPage() {
  const { lang, t } = useTranslation();
  const [activeColId, setActiveColId] = useState<string>("fused-v2");
  const [summary, setSummary] = useState<any>(null);
  const [audit, setAudit] = useState<any>(null);
  const [priorities, setPriorities] = useState<any[]>([]);
  const [featuredImages, setFeaturedImages] = useState<any[]>([]);
  const [isPlayingSound, setIsPlayingSound] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Initialize strictly at 40% volume and stop all audio when leaving the landing page
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.40;
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, []);

  // Pause audio when switching browser tabs, resume if playing
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        if (audioRef.current && !audioRef.current.paused) {
          audioRef.current.pause();
        }
      } else {
        if (isPlayingSound && audioRef.current) {
          audioRef.current.volume = 0.40;
          audioRef.current.play().catch(() => {});
        }
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [isPlayingSound]);

  const toggleSound = () => {
    if (!audioRef.current) return;
    if (isPlayingSound) {
      audioRef.current.pause();
      setIsPlayingSound(false);
    } else {
      audioRef.current.volume = 0.40;
      audioRef.current.play().then(() => {
        setIsPlayingSound(true);
      }).catch((e) => {
        console.log("Audio play error:", e);
      });
    }
  };

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

            {/* Right Column: Borderless Living Classical Dance Experience */}
            <div className="lg:col-span-5 relative flex flex-col items-center justify-center min-h-[580px]">
              {/* Audio element playing Raga Bindu's soothing traditional Indian meditation music strictly at 40% volume on landing page */}
              <audio
                ref={audioRef}
                src="/audio/raga_bindu_stress_melts_away.m4a"
                loop
                preload="auto"
              />

              {/* Radiant Warm Golden & Rose Aura blooming behind the dancers */}
              <div className="absolute inset-0 bg-radial from-gold-400/25 via-pink-500/10 to-transparent blur-3xl pointer-events-none" />

              {/* Composition Stage Container */}
              <div className="relative w-full max-w-[460px] flex flex-col items-center select-none">
                
                {/* 1. Sacred Golden Floor Mandala beneath the dancers' feet */}
                <div className="absolute -bottom-6 w-80 h-36 flex items-center justify-center pointer-events-none">
                  {/* Glowing floor halo */}
                  <div className="absolute inset-0 bg-radial from-gold-400/35 via-gold-500/15 to-transparent blur-xl rounded-full" />
                  
                  {/* Sacred Rangoli / Mandala Geometry */}
                  <svg viewBox="0 0 300 120" className="w-full h-full opacity-70 animate-gold-swirl" style={{ transformOrigin: "center center" }}>
                    <defs>
                      <linearGradient id="mandalaGold" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#ECD399" stopOpacity="0.9" />
                        <stop offset="50%" stopColor="#C8A24A" stopOpacity="0.75" />
                        <stop offset="100%" stopColor="#B0673A" stopOpacity="0.6" />
                      </linearGradient>
                    </defs>
                    {/* Concentric rings */}
                    <ellipse cx="150" cy="60" rx="135" ry="50" fill="none" stroke="url(#mandalaGold)" strokeWidth="1" strokeDasharray="3,3" />
                    <ellipse cx="150" cy="60" rx="110" ry="40" fill="none" stroke="url(#mandalaGold)" strokeWidth="1.2" />
                    <ellipse cx="150" cy="60" rx="85" ry="30" fill="none" stroke="url(#mandalaGold)" strokeWidth="0.8" strokeDasharray="4,4" />
                    <ellipse cx="150" cy="60" rx="55" ry="20" fill="none" stroke="url(#mandalaGold)" strokeWidth="1" />
                    {/* Radiating Petal Spokes */}
                    {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => {
                      const rad = (deg * Math.PI) / 180;
                      const x1 = 150 + 40 * Math.cos(rad);
                      const y1 = 60 + 15 * Math.sin(rad);
                      const x2 = 150 + 110 * Math.cos(rad);
                      const y2 = 60 + 40 * Math.sin(rad);
                      return (
                        <line
                          key={deg}
                          x1={x1}
                          y1={y1}
                          x2={x2}
                          y2={y2}
                          stroke="url(#mandalaGold)"
                          strokeWidth="0.9"
                          strokeOpacity="0.65"
                        />
                      );
                    })}
                  </svg>
                </div>

                {/* 2. Swirling Golden Ribbons & Majestic Stardust */}
                <svg
                  viewBox="0 0 460 560"
                  className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible"
                >
                  <defs>
                    <linearGradient id="goldRibbon1" x1="0%" y1="100%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#C8A24A" stopOpacity="0" />
                      <stop offset="30%" stopColor="#ECD399" stopOpacity="0.85" />
                      <stop offset="70%" stopColor="#F59E0B" stopOpacity="0.9" />
                      <stop offset="100%" stopColor="#C8A24A" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="goldRibbon2" x1="100%" y1="100%" x2="0%" y2="0%">
                      <stop offset="0%" stopColor="#B0673A" stopOpacity="0" />
                      <stop offset="45%" stopColor="#ECD399" stopOpacity="0.75" />
                      <stop offset="85%" stopColor="#FDE68A" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#C8A24A" stopOpacity="0" />
                    </linearGradient>
                    <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="3" result="blur" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>

                  {/* Flowing Graceful Golden Ribbon 1: Ascending around lower dancer to upper dancer */}
                  <path
                    d="M 90 480 C 40 420, 60 330, 160 310 C 260 290, 360 330, 400 240 C 430 170, 360 90, 270 70 C 200 55, 140 100, 160 150"
                    fill="none"
                    stroke="url(#goldRibbon1)"
                    strokeWidth="2.2"
                    strokeDasharray="6 3"
                    filter="url(#goldGlow)"
                    className="opacity-75"
                  />

                  {/* Flowing Graceful Golden Ribbon 2: Counter-curve */}
                  <path
                    d="M 360 490 C 410 430, 380 340, 290 320 C 180 295, 110 240, 120 160 C 130 90, 220 40, 310 45"
                    fill="none"
                    stroke="url(#goldRibbon2)"
                    strokeWidth="1.6"
                    strokeDasharray="3 4"
                    filter="url(#goldGlow)"
                    className="opacity-60"
                  />

                  {/* Sparkling Golden 4-point Stars / Stardust */}
                  {[
                    { cx: 70, cy: 190, size: 7, delay: "0s" },
                    { cx: 120, cy: 90, size: 9, delay: "0.8s" },
                    { cx: 370, cy: 110, size: 8, delay: "1.4s" },
                    { cx: 410, cy: 220, size: 10, delay: "0.5s" },
                    { cx: 340, cy: 370, size: 7, delay: "2.1s" },
                    { cx: 90, cy: 380, size: 8, delay: "1.2s" },
                    { cx: 210, cy: 40, size: 6, delay: "1.8s" },
                    { cx: 260, cy: 200, size: 6, delay: "0.9s" },
                    { cx: 160, cy: 450, size: 7, delay: "2.4s" },
                    { cx: 380, cy: 430, size: 8, delay: "1.6s" },
                  ].map((star, idx) => (
                    <g key={idx} transform={`translate(${star.cx}, ${star.cy})`} className="animate-gold-twinkle" style={{ animationDelay: star.delay }}>
                      <path
                        d={`M 0 ${-star.size} Q 0 0 ${star.size} 0 Q 0 0 0 ${star.size} Q 0 0 ${-star.size} 0 Q 0 0 0 ${-star.size}`}
                        fill="#FDE68A"
                        filter="url(#goldGlow)"
                      />
                      <circle cx="0" cy="0" r="1.5" fill="#FFFFFF" />
                    </g>
                  ))}
                </svg>

                {/* 3. Floating Glowing Lotuses (Layered organically around the dancers) */}
                {/* Lotus A: Top Left floating near upper dancer's arched leg */}
                <div className="absolute -top-3 left-3 w-28 h-24 z-20 pointer-events-none animate-lotus-top-left">
                  <Image
                    src="/images/lotus_top_left.png"
                    alt="Sacred Glowing Lotus"
                    width={150}
                    height={115}
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* Lotus B: Top Center floating high in the celestial space */}
                <div className="absolute -top-7 right-28 w-16 h-14 z-20 pointer-events-none animate-lotus-top-center">
                  <Image
                    src="/images/lotus_top_center.png"
                    alt="Floating Lotus Blossom"
                    width={70}
                    height={65}
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* Lotus C: Top Right floating near graceful mudra hand */}
                <div className="absolute top-24 -right-4 w-24 h-20 z-20 pointer-events-none animate-lotus-top-right">
                  <Image
                    src="/images/lotus_top_right.png"
                    alt="Celestial Lotus"
                    width={120}
                    height={100}
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* Lotus D: Sacred Floor Lotus resting in lower foreground by the mandala */}
                <div className="absolute -bottom-4 -left-4 w-44 h-32 z-20 pointer-events-none animate-lotus-floor">
                  <Image
                    src="/images/lotus_floor.png"
                    alt="Sacred Floor Lotus Blossom"
                    width={250}
                    height={180}
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* 4. The Two Classical Dancers: Pop Mode, Seamless Oxblood Blend, Zero Borders */}
                <div className="relative z-10 w-full flex items-center justify-center animate-subtle-pop hover:scale-[1.04] transition-transform duration-700 cursor-default">
                  <Image
                    src="/images/classical_dancers_transparent.png"
                    alt="Classical Indian Temple Dancers in Sacred Natya Mudra"
                    width={450}
                    height={555}
                    priority
                    className="w-auto h-auto max-h-[530px] object-contain drop-shadow-[0_15px_30px_rgba(200,162,74,0.35)]"
                  />
                </div>

                {/* 5. Floating Ambient Sound Controller (Playing Raga Bindu Meditation Music at 40% Volume) */}
                <button
                  onClick={toggleSound}
                  type="button"
                  className="mt-4 z-30 px-5 py-2.5 rounded-full font-serif text-xs font-bold transition-all duration-300 flex items-center gap-2.5 shadow-2xl border backdrop-blur-md cursor-pointer hover:scale-105 active:scale-95 bg-oxblood-950/90 text-gold-300 border-gold-400/80 hover:bg-gold-400 hover:text-oxblood-950 hover:border-gold-300"
                  title="Stress Melts Away | Soft Indian Traditional Music for Meditation, Relaxation & Inner Peace by Raga Bindu (40% Volume)"
                >
                  {isPlayingSound ? (
                    <>
                      <Volume2 size={16} className="text-gold-300 animate-pulse" />
                      <span className="tracking-wide">Stress Melts Away • Playing (40% Vol)</span>
                      <span className="flex gap-0.5 items-end h-3 ml-1">
                        <span className="w-0.5 h-3 bg-gold-400 animate-bounce" />
                        <span className="w-0.5 h-2 bg-gold-300 animate-bounce delay-75" />
                        <span className="w-0.5 h-3 bg-gold-400 animate-bounce delay-150" />
                      </span>
                    </>
                  ) : (
                    <>
                      <VolumeX size={16} className="text-gold-400/80" />
                      <span className="tracking-wide">Stress Melts Away • Tap to Play (40% Vol)</span>
                      <Music size={14} className="text-gold-400 animate-pulse" />
                    </>
                  )}
                </button>

              </div>

              {/* Living Heritage Micro-Badge */}
              <div className="mt-3 text-center">
                <div className="inline-flex items-center gap-2 text-[11px] font-mono text-gold-300/80 tracking-wider uppercase">
                  <Sparkles size={12} className="text-gold-400" />
                  <span>Stress Melts Away • Soft Indian Traditional Music by Raga Bindu</span>
                </div>
                <div className="text-[10px] text-cream-200/60 font-sans mt-0.5 flex items-center justify-center gap-2">
                  <span>Classical Natya Shastra Sacred Choreography</span>
                  <span>•</span>
                  <Link href="/atlas" className="text-gold-300 hover:underline">
                    View in Atlas →
                  </Link>
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

