"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CornerFiligree } from "./ornament/CornerFiligree";
import { JaliLattice } from "./ornament/JaliLattice";
import { 
  Layers, MapPin, Grid3X3, UploadCloud, Compass, Image as ImageIcon, 
  BookOpen, Sparkles, Database, Building2, TrendingUp, GitCompare, Activity, Globe
} from "lucide-react";
import { LANGUAGE_OPTIONS, useTranslation, LanguageCode } from "@/lib/i18n";

interface CollectionItem {
  id: string;
  name: string;
  kind: string;
  total_records: number;
}

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { lang, t, setLang } = useTranslation();
  const [collections, setCollections] = useState<CollectionItem[]>([]);
  const [selectedColId, setSelectedColId] = useState<string>("fused-v2");

  useEffect(() => {
    // Load collections from API
    fetch("/api/collections")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCollections(data);
        }
      })
      .catch((e) => console.error("Error loading collections in Navbar:", e));

    // Read stored collection; default to fused-v2 if not set
    const stored = localStorage.getItem("silence_index_active_collection");
    if (stored) {
      setSelectedColId(stored);
    } else {
      setSelectedColId("fused-v2");
      localStorage.setItem("silence_index_active_collection", "fused-v2");
    }

    const handleColChange = () => {
      const updated = localStorage.getItem("silence_index_active_collection");
      if (updated) setSelectedColId(updated);
    };
    window.addEventListener("collection_changed", handleColChange);
    return () => window.removeEventListener("collection_changed", handleColChange);
  }, []);

  const handleSelectCollection = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedColId(val);
    localStorage.setItem("silence_index_active_collection", val);
    window.dispatchEvent(new Event("collection_changed"));
  };

  const handleSelectLang = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value as LanguageCode;
    setLang(val);
    localStorage.setItem("silence_index_lang", val);
    window.dispatchEvent(new Event("language_changed"));
  };

  const handleOpenTour = () => {
    window.dispatchEvent(new Event("open_guided_tour"));
  };

  const navLinks = [
    { href: "/observatory", key: "observatory", label: "Observatory", icon: Layers },
    { href: "/map", key: "map", label: "Blind-Spot Map", icon: MapPin },
    { href: "/matrix", key: "matrix", label: "Coverage Matrix", icon: Grid3X3 },
    { href: "/sources", key: "sources", label: "Sources", icon: Database, badge: "F1" },
    { href: "/entities", key: "entities", label: "Entities", icon: Building2, badge: "F2" },
    { href: "/gaps", key: "gaps", label: "Gaps", icon: TrendingUp, badge: "F3" },
    { href: "/compare", key: "compare", label: "Compare", icon: GitCompare, badge: "F4" },
    { href: "/priorities", key: "priorities", label: "Priorities", icon: Compass },
    { href: "/atlas", key: "atlas", label: "Atlas", icon: Layers },
    { href: "/explorer", key: "explorer", label: "Image Explorer", icon: ImageIcon },
    { href: "/auditor", key: "auditor", label: "Auditor", icon: UploadCloud },
    { href: "/health", key: "health", label: "Diagnostics", icon: Activity, badge: "F9" },
    { href: "/method", key: "method", label: "Method", icon: BookOpen },
  ];

  return (
    <header className="sticky top-0 z-50 bg-oxblood-900 text-cream-100 shadow-md border-b-2 border-gold-400 w-full overflow-hidden">
      {/* Top Ornamental Header Bar */}
      <div className="relative bg-oxblood-950 px-3 sm:px-4 py-2 flex flex-wrap items-center justify-between gap-2 border-b border-gold-400/30 overflow-hidden">
        <JaliLattice className="absolute inset-0 opacity-10 pointer-events-none" />
        <CornerFiligree position="top-left" size={24} className="absolute left-1 top-1 pointer-events-none" />
        <CornerFiligree position="top-right" size={24} className="absolute right-1 top-1 pointer-events-none" />

        <div className="flex items-center gap-3 z-10">
          <Link href="/" className="group flex items-center gap-2">
            <span className="font-serif text-base sm:text-lg tracking-widest font-bold text-cream-100 group-hover:text-gold-300 transition-colors">
              THE SILENCE INDEX
            </span>
            <span className="hidden xl:inline-block text-xs font-serif italic text-gold-400/90 pl-2 border-l border-gold-400/40">
              {t("tagline", "Because what is missing from history matters too.")}
            </span>
          </Link>
        </div>

        {/* Global Controls: Tour + Language Selector */}
        <div className="flex items-center gap-2.5 z-10">
          {/* Guided Tour Trigger */}
          <button
            onClick={handleOpenTour}
            className="flex items-center gap-1.5 px-3 py-1 bg-gold-400/20 hover:bg-gold-400/30 border border-gold-400/60 rounded-xs text-xs font-serif text-gold-300 hover:text-gold-200 transition-colors cursor-pointer shadow-2xs"
            title="Start 90-Second Guided Tour"
          >
            <Sparkles size={13} className="text-gold-400" />
            <span className="font-semibold">
              {lang === "ml" ? "90 സെക്കൻഡ് ടൂർ" : lang === "hi" ? "90s दौरा" : lang === "ta" ? "90s சுற்றுலா" : "90s Tour"}
            </span>
          </button>

          {/* Multilingual Selector */}
          <div className="flex items-center gap-1.5 bg-oxblood-800 border border-gold-400/60 rounded-xs px-2.5 py-1 shadow-2xs">
            <Globe size={13} className="text-gold-400 shrink-0" />
            <select
              id="language-switcher"
              value={lang}
              onChange={handleSelectLang}
              aria-label="Interface Language"
              className="bg-transparent text-cream-100 text-xs font-sans focus:outline-hidden cursor-pointer"
            >
              {LANGUAGE_OPTIONS.map((lo) => (
                <option key={lo.code} value={lo.code} className="bg-oxblood-900 text-cream-100">
                  {lo.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Navigation Row */}
      <nav className="w-full max-w-7xl mx-auto px-2 sm:px-4 py-1.5 flex items-center justify-between overflow-x-auto tab-slider" aria-label="Main Navigation">
        <div className="flex items-center gap-1 sm:gap-1.5">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
            const labelText = t(`nav.${link.key}`, link.label);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-xs text-[11px] sm:text-xs font-sans tracking-wide transition-colors whitespace-nowrap ${
                  isActive
                    ? "bg-gold-400 text-oxblood-950 font-semibold shadow-xs"
                    : "text-cream-200 hover:text-gold-300 hover:bg-oxblood-800/80"
                }`}
              >
                <Icon size={13} className={isActive ? "text-oxblood-950" : "text-gold-400"} />
                <span>{labelText}</span>
                {link.badge && (
                  <span className={`text-[9px] font-mono px-1 rounded-xs uppercase ${
                    isActive ? "bg-oxblood-950 text-gold-300" : "bg-oxblood-800 text-gold-400/90"
                  }`}>
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        <div className="hidden 2xl:flex items-center gap-2 text-xs">
          <Link
            href="/ethics"
            className="text-gold-300/80 hover:text-gold-200 underline underline-offset-4 decoration-gold-400/40 text-[11px] whitespace-nowrap"
          >
            {t("nav.ethics", "Ethics & CARE")}
          </Link>
        </div>
      </nav>
    </header>
  );
};
