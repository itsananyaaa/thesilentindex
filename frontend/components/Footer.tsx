import React from "react";
import Link from "next/link";
import { OrnamentalBand } from "./ornament/OrnamentalBand";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#1A090B] text-cream-100 border-t-2 border-gold-400 mt-16 pt-8 pb-12 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4">
        <OrnamentalBand color="#C8A24A" />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 py-8">
          <div className="md:col-span-2">
            <span className="font-serif text-xl font-bold text-gold-300 tracking-wider block">
              THE SILENCE INDEX
            </span>
            <p className="mt-2 text-xs font-sans text-cream-100/90 leading-relaxed max-w-lg">
              A cultural collection auditing and documentation intelligence platform. Diagnosing metadata absences
              and converting structural silences into consent-first documentation priorities for Indian heritage.
            </p>
            <p className="mt-3 text-xs font-serif text-gold-400 italic">
              "Because what is missing from history matters too."
            </p>
          </div>

          <div>
            <h3 className="font-serif text-xs font-bold text-gold-400 uppercase tracking-widest mb-3">
              Methodology & Ethics
            </h3>
            <ul className="space-y-2 text-xs font-sans text-cream-100/90">
              <li>
                <Link href="/method" className="hover:text-gold-300 underline-offset-4 hover:underline transition-colors">
                  Deterministic Rubrics & Debt Formula
                </Link>
              </li>
              <li>
                <Link href="/ethics" className="hover:text-gold-300 underline-offset-4 hover:underline transition-colors">
                  CARE Principles & Indigenous Consent
                </Link>
              </li>
              <li>
                <Link href="/credits" className="hover:text-gold-300 underline-offset-4 hover:underline transition-colors">
                  Attribution & Open Access Manifest
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-serif text-xs font-bold text-gold-400 uppercase tracking-widest mb-3">
              Cartographic & Cultural Caveat
            </h3>
            <p className="text-xs font-sans text-cream-100/80 leading-relaxed">
              State boundaries reflect the official demarcations of the Republic of India. Absence of a record
              in an audited collection is never proof that a tradition, region or community has less heritage.
            </p>
          </div>
        </div>

        <div className="border-t border-gold-400/30 pt-6 mt-4 flex flex-col sm:flex-row items-center justify-between text-xs text-cream-200/80 font-sans">
          <p>© 2026 THE SILENCE INDEX. Built for Hackathon: Art • Culture • Heritage.</p>
          <p className="mt-2 sm:mt-0 font-medium">Museum-Grade Intelligence • Purely Deterministic Scoring</p>
        </div>
      </div>
    </footer>
  );
};

