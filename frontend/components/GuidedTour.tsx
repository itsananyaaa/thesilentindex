"use client";

import React, { useState, useEffect } from "react";
import { CornerFiligree } from "./ornament/CornerFiligree";
import { JaliLattice } from "./ornament/JaliLattice";
import { Compass, Sparkles, AlertCircle, Shield, CheckCircle2, ChevronRight, ChevronLeft, X } from "lucide-react";

export const GuidedTour: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    // Always listen for manual tour open requests
    const handleReopen = () => {
      setStep(0);
      setIsOpen(true);
    };
    window.addEventListener("open_guided_tour", handleReopen);

    // Auto-show on first visit if not dismissed
    const dismissed = typeof window !== "undefined" ? localStorage.getItem("silence_index_tour_dismissed") : null;
    let timer: any = null;
    if (!dismissed) {
      timer = setTimeout(() => setIsOpen(true), 1200);
    }

    return () => {
      window.removeEventListener("open_guided_tour", handleReopen);
      if (timer) clearTimeout(timer);
    };
  }, []);

  const handleDismiss = () => {
    localStorage.setItem("silence_index_tour_dismissed", "true");
    setIsOpen(false);
  };

  if (!isOpen) return null;

  const tourSteps = [
    {
      title: "Welcome to THE SILENCE INDEX",
      badge: "ORIENTATION • 90 SECONDS",
      icon: Sparkles,
      content: (
        <div className="space-y-3 text-xs text-oxblood-800 leading-relaxed font-sans">
          <p className="font-serif italic text-sm text-copper-600 font-semibold">
            "Because what is missing from history matters too."
          </p>
          <p>
            THE SILENCE INDEX is a museum-grade cultural collection auditing platform. Instead of presenting a generic catalogue of facts, it diagnoses the <b>silences</b> and <b>omissions</b> in cultural holdings.
          </p>
          <div className="p-3 bg-cream-100 border border-gold-400/40 rounded-xs">
            <span className="font-serif font-bold text-oxblood-900 block mb-1">Non-Negotiable Axiom #1:</span>
            Absence of a record in an audited collection is <i>never</i> proof that a tradition, region, or community has less heritage.
          </div>
        </div>
      )
    },
    {
      title: "The Four-State Absence Model",
      badge: "METHODOLOGY",
      icon: AlertCircle,
      content: (
        <div className="space-y-3 text-xs text-oxblood-800 leading-relaxed font-sans">
          <p>
            Cultural heritage metadata cannot be reduced to a binary presence/absence. Every record is evaluated across 10 distinct knowledge dimensions into four deterministic states:
          </p>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="p-2 border border-olive-500/40 bg-cream-100 rounded-xs">
              <span className="font-serif font-bold text-olive-700 block">1. Documented (≥ 0.75)</span>
              Substantive contextual, physical, or audio-visual evidence.
            </div>
            <div className="p-2 border border-gold-400/60 bg-cream-100 rounded-xs">
              <span className="font-serif font-bold text-gold-600 block">2. Partial (0.25 – 0.74)</span>
              Fragmentary or monolingual record with missing dimensions.
            </div>
            <div className="p-2 border border-copper-500/40 bg-cream-100 rounded-xs">
              <span className="font-serif font-bold text-copper-600 block">3. Undocumented</span>
              Evaluated field completely absent in the analysed catalog.
            </div>
            <div className="p-2 border border-parchment-400 bg-cream-100 pattern-dotted-parchment rounded-xs">
              <span className="font-serif font-bold text-oxblood-900 block">4. Not Assessable</span>
              Catalog schema lacks the field entirely (e.g. no consultation column).
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Cultural Coverage Debt (CCD)",
      badge: "MATHEMATICAL METRIC",
      icon: Compass,
      content: (
        <div className="space-y-3 text-xs text-oxblood-800 leading-relaxed font-sans">
          <p>
            <b>Cultural Coverage Debt (CCD)</b> is a deterministic score from <b>0 to 100</b> measuring documentation deficit across assessable dimensions:
          </p>
          <div className="p-3 bg-oxblood-900 text-cream-100 font-mono text-center text-xs rounded-xs border border-gold-400/60">
            CCD = 100 × [ Σ (w_d × Debt_d) / Σ w_d ]
          </div>
          <p>
            Each score includes reproducible 90% bootstrap confidence intervals and sensitivity analysis. <b>CCD measures documentation completeness, never cultural importance.</b>
          </p>
        </div>
      )
    },
    {
      title: "Consent-First Preservation Priorities",
      badge: "ETHICS & CARE",
      icon: Shield,
      content: (
        <div className="space-y-3 text-xs text-oxblood-800 leading-relaxed font-sans">
          <p>
            The software automatically ranks documentation priorities based on Gap magnitude (G), Evidence confidence (E), Breadth (B), and Feasibility (F).
          </p>
          <div className="p-3 bg-cream-100 border border-henna-500/40 rounded-xs space-y-1">
            <span className="font-serif font-bold text-henna-700 block">CARE Principles & FPIC Enforced:</span>
            <p className="text-[11px]">
              Whenever oral histories, sacred rituals, or practitioner perspectives are recommended for documentation, the platform mandates <b>Free, Prior, and Informed Consent (FPIC)</b> from community elders before any field approach.
            </p>
          </div>
          <p className="text-[11px] text-oxblood-800/80">
            You can generate a one-page printable <b>Documentation Brief (PDF)</b> from any priority card.
          </p>
        </div>
      )
    }
  ];

  const current = tourSteps[step];
  const Icon = current.icon;

  return (
    <div className="fixed inset-0 z-[100] bg-oxblood-950/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-cream-100 border-2 border-gold-400 rounded-sm shadow-2xl p-6 overflow-hidden">
        <JaliLattice className="absolute inset-0 opacity-5 pointer-events-none" />
        <CornerFiligree position="top-left" size={28} className="absolute left-1 top-1" />
        <CornerFiligree position="top-right" size={28} className="absolute right-1 top-1" />

        {/* Close Button */}
        <button
          onClick={handleDismiss}
          className="absolute right-3 top-3 text-oxblood-800/60 hover:text-oxblood-900 p-1"
          aria-label="Close Tour"
        >
          <X size={16} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <Icon size={18} className="text-gold-500 shrink-0" />
          <span className="text-[10px] font-mono uppercase tracking-widest font-bold px-2 py-0.5 bg-oxblood-900 text-gold-300 rounded-xs">
            {current.badge}
          </span>
          <span className="text-xs font-sans text-oxblood-800/60 ml-auto">
            {step + 1} of {tourSteps.length}
          </span>
        </div>

        <h3 className="font-serif text-lg font-bold text-oxblood-900 mb-3">
          {current.title}
        </h3>

        {/* Step Content */}
        <div className="min-h-[160px] mb-6">
          {current.content}
        </div>

        {/* Step Progress Indicators */}
        <div className="flex items-center justify-between border-t border-parchment-300 pt-4">
          <div className="flex gap-1.5">
            {tourSteps.map((_, i) => (
              <button
                key={i}
                onClick={() => setStep(i)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i === step ? "bg-oxblood-900 w-5" : "bg-parchment-400"
                }`}
                aria-label={`Go to step ${i + 1}`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            {step > 0 && (
              <button
                onClick={() => setStep((s) => s - 1)}
                className="px-3 py-1 bg-cream-200 hover:bg-cream-300 border border-parchment-400 text-xs font-serif text-oxblood-900 rounded-xs flex items-center gap-1"
              >
                <ChevronLeft size={14} />
                <span>Back</span>
              </button>
            )}

            {step < tourSteps.length - 1 ? (
              <button
                onClick={() => setStep((s) => s + 1)}
                className="px-4 py-1.5 bg-oxblood-900 hover:bg-oxblood-800 text-cream-100 text-xs font-serif font-bold rounded-xs flex items-center gap-1 shadow-xs"
              >
                <span>Next</span>
                <ChevronRight size={14} />
              </button>
            ) : (
              <button
                onClick={handleDismiss}
                className="px-4 py-1.5 bg-olive-700 hover:bg-olive-600 text-cream-100 text-xs font-serif font-bold rounded-xs flex items-center gap-1 shadow-xs"
              >
                <CheckCircle2 size={14} />
                <span>Explore The Index</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

