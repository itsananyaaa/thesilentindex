"use client";

import React from "react";
import Link from "next/link";
import { CornerFiligree } from "@/components/ornament/CornerFiligree";
import { ShieldCheck, HeartHandshake, Eye, Users, FileCheck, ExternalLink } from "lucide-react";

export default function EthicsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-12">
      <div className="text-center max-w-2xl mx-auto">
        <span className="font-serif text-xs font-bold uppercase tracking-widest text-copper-600 block mb-1">
          Ethical Framework & Governance
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-oxblood-900">
          Consent-First Heritage Intelligence
        </h1>
        <p className="text-xs sm:text-sm text-oxblood-800/80 mt-2">
          Technology must support cultural custodians, not extract from or replace them.
        </p>
      </div>

      {/* Axioms of Non-Negotiable Cultural Respect */}
      <section className="bg-cream-100 border-2 border-gold-400 p-8 rounded-sm shadow-xs space-y-6">
        <h2 className="font-serif text-2xl font-bold text-oxblood-900 pb-2 border-b border-parchment-300">
          Core Ethical Non-Negotiables
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
          <div className="p-4 bg-cream-200/50 rounded-xs border border-parchment-300 space-y-1">
            <strong className="font-serif text-sm text-oxblood-900 block">1. Absence is Not Inferiority</strong>
            <p className="text-oxblood-800/80 leading-relaxed">
              Absence of a record in an institutional collection is never proof that a tradition, region or community has less heritage.
              All language in the platform explicitly states "not documented in the analysed collection".
            </p>
          </div>
          <div className="p-4 bg-cream-200/50 rounded-xs border border-parchment-300 space-y-1">
            <strong className="font-serif text-sm text-oxblood-900 block">2. Coverage Debt ≠ Cultural Value</strong>
            <p className="text-oxblood-800/80 leading-relaxed">
              Cultural Coverage Debt measures metadata completeness in institutional archives, not the intrinsic vitality of living traditions.
              Communities and art forms are never ranked by importance.
            </p>
          </div>
          <div className="p-4 bg-cream-200/50 rounded-xs border border-parchment-300 space-y-1">
            <strong className="font-serif text-sm text-oxblood-900 block">3. Consent First Before Collection</strong>
            <p className="text-oxblood-800/80 leading-relaxed">
              Where living artisan lineages, oral folklore, or sacred practices are undocumented, recommendations mandate
              formal community consultation. The software never advises unilateral extraction.
            </p>
          </div>
          <div className="p-4 bg-cream-200/50 rounded-xs border border-parchment-300 space-y-1">
            <strong className="font-serif text-sm text-oxblood-900 block">4. No Invented Metadata</strong>
            <p className="text-oxblood-800/80 leading-relaxed">
              LLMs never silently hallucinate metadata, dates, or communities. Classification is rule-based and transparent.
              Any uncertain classification becomes "Needs review".
            </p>
          </div>
        </div>
      </section>

      {/* CARE Principles for Indigenous Data Governance */}
      <section className="bg-cream-100 border border-parchment-300 p-8 rounded-sm shadow-xs space-y-6">
        <h2 className="font-serif text-2xl font-bold text-oxblood-900 pb-2 border-b border-parchment-300">
          The CARE Principles for Indigenous Data Governance
        </h2>
        <p className="text-xs sm:text-sm text-oxblood-800/90 leading-relaxed font-sans">
          THE SILENCE INDEX integrates the internationally recognized <strong>CARE Principles</strong> (Collective Benefit, Authority to Control,
          Responsibility, and Ethics) to ensure that digital cataloging serves source communities:
        </p>

        <div className="space-y-3 pt-2">
          <div className="p-3.5 bg-cream-200/40 rounded-xs border border-parchment-300 text-xs font-sans">
            <strong className="text-oxblood-900 font-serif text-sm block mb-1">C — Collective Benefit:</strong>
            <p className="text-oxblood-800/80 leading-relaxed">
              Data ecosystems must be designed and function in ways that enable Indigenous communities to derive benefit from cultural data.
            </p>
          </div>
          <div className="p-3.5 bg-cream-200/40 rounded-xs border border-parchment-300 text-xs font-sans">
            <strong className="text-oxblood-900 font-serif text-sm block mb-1">A — Authority to Control:</strong>
            <p className="text-oxblood-800/80 leading-relaxed">
              Indigenous peoples’ rights and interests in Indigenous data must be recognized and their authority to control their representation respected.
            </p>
          </div>
          <div className="p-3.5 bg-cream-200/40 rounded-xs border border-parchment-300 text-xs font-sans">
            <strong className="text-oxblood-900 font-serif text-sm block mb-1">R — Responsibility:</strong>
            <p className="text-oxblood-800/80 leading-relaxed">
              Those working with Indigenous data have a responsibility to share how these data advance Indigenous peoples’ self-determination.
            </p>
          </div>
          <div className="p-3.5 bg-cream-200/40 rounded-xs border border-parchment-300 text-xs font-sans">
            <strong className="text-oxblood-900 font-serif text-sm block mb-1">E — Ethics:</strong>
            <p className="text-oxblood-800/80 leading-relaxed">
              Indigenous peoples’ prior rights and well-being should be the primary concern at all stages of the data life cycle.
            </p>
          </div>
        </div>
      </section>

      {/* Local Contexts & Biocultural Labels */}
      <section className="bg-cream-100 border border-parchment-300 p-8 rounded-sm shadow-xs space-y-4">
        <h2 className="font-serif text-2xl font-bold text-oxblood-900 pb-2 border-b border-parchment-300">
          Local Contexts & Traditional Knowledge Labels
        </h2>
        <div className="text-xs sm:text-sm text-oxblood-800/90 leading-relaxed font-sans space-y-3">
          <p>
            We align with the <strong>Local Contexts initiative</strong>. Traditional Knowledge (TK) Labels and Biocultural (BC) Labels 
            provide digital tools for Indigenous communities to identify and clarify local rules, governance protocols, and permissions 
            for access and reuse of cultural heritage.
          </p>
          <div className="p-4 bg-cream-200/80 border border-parchment-400 rounded-xs">
            <strong className="text-oxblood-900 font-serif block mb-1">STRICT PROTOCOL:</strong>
            <p className="text-xs text-oxblood-800/90">
              THE SILENCE INDEX software <strong>never generates</strong> or assigns Traditional Knowledge or Biocultural Labels automatically.
              Only living communities and recognized custodians have the moral and legal authority to assign these designations.
            </p>
          </div>
          <p>
            <a
              href="https://localcontexts.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-henna-700 hover:underline font-serif font-bold inline-flex items-center gap-1"
            >
              <span>Learn more at Local Contexts (localcontexts.org)</span>
              <ExternalLink size={12} />
            </a>
          </p>
        </div>
      </section>
    </div>
  );
}

