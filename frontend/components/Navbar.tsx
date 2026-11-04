"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CornerFiligree } from "./ornament/CornerFiligree";
import { JaliLattice } from "./ornament/JaliLattice";
import { Layers, MapPin, Grid3X3, UploadCloud, Compass, Image as ImageIcon, BookOpen, AlertTriangle } from "lucide-react";

interface CollectionItem {
  id: string;
  name: string;
  kind: string;
  total_records: number;
}

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [collections, setCollections] = useState<CollectionItem[]>([]);
  const [selectedColId, setSelectedColId] = useState<string>("sample-real-001");

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

    // Read stored collection
    const stored = localStorage.getItem("silence_index_active_collection");
    if (stored) setSelectedColId(stored);

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

  const navLinks = [
    { href: "/observatory", label: "Observatory", icon: Layers },
    { href: "/map", label: "Blind-Spot Map", icon: MapPin },
    { href: "/matrix", label: "Coverage Matrix", icon: Grid3X3 },
    { href: "/auditor", label: "Auditor", icon: UploadCloud },
    { href: "/priorities", label: "Priorities", icon: Compass },
    { href: "/atlas", label: "Atlas", icon: Layers },
    { href: "/explorer", label: "Image Explorer", icon: ImageIcon },
    { href: "/method", label: "Method", icon: BookOpen },
  ];

  return (
    <header className="sticky top-0 z-50 bg-oxblood-900 text-cream-100 shadow-md border-b-2 border-gold-400">
      {/* Top Ornamental Header Bar */}
      <div className="relative bg-oxblood-950 px-4 py-2 flex items-center justify-between border-b border-gold-400/30 overflow-hidden">
        <JaliLattice className="absolute inset-0 opacity-10" />
        <CornerFiligree position="top-left" size={24} className="absolute left-1 top-1" />
        <CornerFiligree position="top-right" size={24} className="absolute right-1 top-1" />

        <div className="flex items-center gap-4 z-10">
          <Link href="/" className="group flex items-center gap-2">
            <span className="font-serif text-lg tracking-widest font-bold text-cream-100 group-hover:text-gold-300 transition-colors">
              THE SILENCE INDEX
            </span>
            <span className="hidden sm:inline-block text-xs font-serif italic text-gold-400/90 pl-2 border-l border-gold-400/40">
              Because what is missing from history matters too.
            </span>
          </Link>
        </div>

        {/* Persistent Collection Switcher */}
        <div className="flex items-center gap-2 z-10">
          <label htmlFor="collection-switcher" className="text-[11px] font-sans font-medium text-gold-300 uppercase tracking-wider hidden md:inline">
            Active Holding:
          </label>
          <select
            id="collection-switcher"
            value={selectedColId}
            onChange={handleSelectCollection}
            className="bg-oxblood-800 text-cream-100 text-xs font-sans border border-gold-400/60 rounded-xs px-2.5 py-1 focus:outline-hidden focus:ring-1 focus:ring-gold-400 cursor-pointer max-w-[220px] truncate"
          >
            {collections.map((c) => (
              <option key={c.id} value={c.id}>
                {c.kind === "sample_real" ? "★ Sample A (Real Open Access)" : c.kind === "sample_synthetic" ? "⚡ Sample B (Synthetic Demo)" : `📁 ${c.name}`} ({c.total_records} items)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Navigation Row */}
      <nav className="max-w-7xl mx-auto px-4 py-1.5 flex items-center justify-between overflow-x-auto no-scrollbar" aria-label="Main Navigation">
        <div className="flex items-center gap-1 sm:gap-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xs text-xs font-sans tracking-wide transition-colors whitespace-nowrap ${
                  isActive
                    ? "bg-gold-400 text-oxblood-950 font-semibold shadow-xs"
                    : "text-cream-200 hover:text-gold-300 hover:bg-oxblood-800/80"
                }`}
              >
                <Icon size={14} className={isActive ? "text-oxblood-950" : "text-gold-400"} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>

        <div className="hidden lg:flex items-center gap-2 text-xs">
          <Link
            href="/ethics"
            className="text-gold-300/80 hover:text-gold-200 underline underline-offset-4 decoration-gold-400/40 text-[11px]"
          >
            Ethics & CARE
          </Link>
        </div>
      </nav>
    </header>
  );
};

