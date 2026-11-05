"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { CornerFiligree } from "@/components/ornament/CornerFiligree";
import {
  Search, Filter, Download, ExternalLink, Bookmark, BookmarkCheck,
  Maximize2, X, ZoomIn, ZoomOut, RotateCcw, AlertTriangle, ShieldCheck
} from "lucide-react";
import { getActiveCollection } from "@/lib/collection";

export default function ImageExplorerPage() {
  const [activeColId, setActiveColId] = useState<string>("fused-v2");
  const [images, setImages] = useState<any[]>([]);
  const [selectedRights, setSelectedRights] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  // Full-screen Viewer State
  const [activeImage, setActiveImage] = useState<any | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  // Saved Research Collection (persisted in localStorage)
  const [savedItems, setSavedItems] = useState<any[]>([]);

  useEffect(() => {
    setActiveColId(getActiveCollection());

    const handleColChange = () => {
      setActiveColId(getActiveCollection());
    };
    window.addEventListener("collection_changed", handleColChange);
    return () => window.removeEventListener("collection_changed", handleColChange);
  }, []);

  useEffect(() => {
    // Load saved items from localStorage
    const saved = localStorage.getItem("silence_index_research_collection");
    if (saved) {
      try {
        setSavedItems(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const toggleSaveItem = (img: any) => {
    const exists = savedItems.some((s) => s.id === img.id);
    let updated;
    if (exists) {
      updated = savedItems.filter((s) => s.id !== img.id);
    } else {
      updated = [...savedItems, img];
    }
    setSavedItems(updated);
    localStorage.setItem("silence_index_research_collection", JSON.stringify(updated));
  };

  const exportSavedAsCsv = () => {
    if (savedItems.length === 0) return;
    const rows = [
      ["ID", "Title", "Creator", "Institution", "Rights Category", "Declared Rights", "Attribution", "Source URL"],
      ...savedItems.map((s) => [
        s.id,
        `"${(s.title || "").replace(/"/g, '""')}"`,
        `"${(s.creator || "").replace(/"/g, '""')}"`,
        `"${(s.institution || "").replace(/"/g, '""')}"`,
        s.rights_category,
        `"${(s.rights_declared || "").replace(/"/g, '""')}"`,
        `"${(s.attribution_text || "").replace(/"/g, '""')}"`,
        s.source_url
      ])
    ];
    const csvContent = rows.map((e) => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "silence_index_research_collection.csv";
    link.click();
  };

  useEffect(() => {
    setLoading(true);
    const q = new URLSearchParams();
    if (activeColId) q.set("collection_id", activeColId);
    if (selectedRights) q.set("rights_category", selectedRights);
    if (search) q.set("q", search);
    q.set("page_size", "40");

    fetch(`/api/images?${q.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.images) setImages(data.images);
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, [activeColId, selectedRights, search]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-parchment-300">
        <div>
          <span className="font-serif text-xs font-bold uppercase tracking-widest text-copper-600 block mb-1">
            Visual Repository & Rights Auditor
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-oxblood-900">
            Image & Heritage Explorer
          </h1>
          <p className="text-xs sm:text-sm text-oxblood-800/80 mt-1 max-w-2xl">
            High-resolution visual archives with declared provider rights, transparent reuse gating, and custodial citations.
          </p>
        </div>

        {/* Saved Research Collection Counter */}
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 bg-cream-200/80 border border-parchment-300 rounded-xs text-xs font-serif">
            <span>Research Collection: </span>
            <strong className="text-oxblood-900">{savedItems.length} items</strong>
          </div>
          {savedItems.length > 0 && (
            <button
              onClick={exportSavedAsCsv}
              className="px-3 py-1.5 bg-gold-400 hover:bg-gold-300 text-oxblood-950 font-serif font-bold text-xs rounded-xs shadow-2xs inline-flex items-center gap-1.5"
            >
              <Download size={13} />
              <span>Export Saved CSV</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center gap-3 p-4 bg-cream-200/50 border border-parchment-300 rounded-xs text-xs">
        <div className="relative flex-1 min-w-[240px]">
          <Search size={14} className="absolute left-3 top-2.5 text-oxblood-800/50" />
          <input
            type="text"
            placeholder="Search title, artisan, institution..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-cream-100 border border-parchment-400 rounded-xs text-xs font-sans text-oxblood-900 focus:outline-hidden focus:ring-1 focus:ring-gold-400"
          />
        </div>

        <select
          value={selectedRights}
          onChange={(e) => setSelectedRights(e.target.value)}
          className="bg-cream-100 border border-parchment-400 rounded-xs px-3 py-1.5 text-xs text-oxblood-900 cursor-pointer"
        >
          <option value="">All Rights Categories</option>
          <option value="CC0">CC0 (Public Domain Dedication)</option>
          <option value="PDM">Public Domain Mark (PDM)</option>
          <option value="CC_BY">CC BY (Attribution)</option>
          <option value="CC_BY_SA">CC BY-SA (ShareAlike)</option>
          <option value="CC_BY_NC">CC BY-NC (Non-Commercial)</option>
          <option value="IN_COPYRIGHT">In Copyright / All Rights Reserved</option>
        </select>

        <span className="text-oxblood-800/70 font-mono text-[11px] ml-auto">
          {images.length} verified imagery items
        </span>
      </div>

      {/* Gallery Grid */}
      {loading ? (
        <div className="py-20 text-center text-sm font-serif text-oxblood-800">
          Loading verified visual catalog...
        </div>
      ) : images.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {images.map((img) => {
            const isSaved = savedItems.some((s) => s.id === img.id);
            return (
              <div
                key={img.id}
                className="bg-cream-100 border border-parchment-300 rounded-sm overflow-hidden flex flex-col justify-between shadow-xs hover:border-gold-400 transition-all group"
              >
                {/* Image Thumb */}
                <div className="relative aspect-square bg-oxblood-950 overflow-hidden">
                  <img
                    src={img.thumbnail_url || img.image_url}
                    alt={img.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                    onClick={() => {
                      setActiveImage(img);
                      setZoomLevel(1);
                    }}
                    loading="lazy"
                  />

                  {/* Bookmark Button */}
                  <button
                    onClick={() => toggleSaveItem(img)}
                    className="absolute top-2 right-2 p-1.5 bg-oxblood-950/80 hover:bg-oxblood-900 text-cream-100 rounded-xs border border-gold-400/50 shadow-sm transition-colors"
                    title={isSaved ? "Remove from research collection" : "Save to research collection"}
                  >
                    {isSaved ? <BookmarkCheck size={14} className="text-gold-400" /> : <Bookmark size={14} />}
                  </button>

                  {/* Download Gating Badge */}
                  <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-xs font-mono text-[9px] font-bold bg-oxblood-950/85 text-cream-100 border border-gold-400/40">
                    {img.rights_category}
                  </div>
                </div>

                {/* Details */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                  <div>
                    <h3
                      className="font-serif font-bold text-sm text-oxblood-900 line-clamp-2 cursor-pointer hover:text-henna-700"
                      onClick={() => {
                        setActiveImage(img);
                        setZoomLevel(1);
                      }}
                    >
                      {img.title}
                    </h3>
                    <p className="text-[11px] text-oxblood-800/80 truncate mt-1">
                      {img.creator || "Traditional Indian artisan"}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-parchment-300 text-[10px] text-oxblood-800/70 font-sans space-y-0.5">
                    <p className="truncate">Source: {img.institution || "Archive"}</p>
                    <p className="italic">Declared: {img.rights_declared || "Public Domain"}</p>
                  </div>
                </div>

                {/* Action Footer */}
                <div className="px-4 py-2.5 bg-cream-200/50 border-t border-parchment-300 flex items-center justify-between text-xs">
                  {img.download_allowed ? (
                    <a
                      href={`/api/images/${img.id}/download`}
                      download
                      className="text-emerald-900 font-serif font-bold text-[11px] inline-flex items-center gap-1 hover:underline"
                    >
                      <Download size={11} />
                      <span>Download (Attributed)</span>
                    </a>
                  ) : (
                    <a
                      href={img.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-copper-700 font-serif font-bold text-[11px] inline-flex items-center gap-1 hover:underline"
                    >
                      <span>View at source</span>
                      <ExternalLink size={10} />
                    </a>
                  )}

                  <button
                    onClick={() => {
                      setActiveImage(img);
                      setZoomLevel(1);
                    }}
                    className="p-1 text-oxblood-800 hover:text-oxblood-950"
                    title="Open Fullscreen Viewer"
                  >
                    <Maximize2 size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-20 text-center text-xs text-oxblood-800/60 bg-cream-100 border border-parchment-300 rounded-sm">
          No images match the selected filter.
        </div>
      )}

      {/* FULLSCREEN MODAL VIEWER */}
      {activeImage && (
        <div
          className="fixed inset-0 z-50 bg-oxblood-950/90 backdrop-blur-md flex flex-col animate-fade-in text-cream-100"
          role="dialog"
          aria-modal="true"
        >
          {/* Top Viewer Bar */}
          <div className="px-6 py-3 border-b border-gold-400/40 flex items-center justify-between bg-oxblood-950">
            <div className="flex items-center gap-3">
              <span className="font-serif text-sm font-bold text-gold-300">
                HIGH-RESOLUTION INSPECTOR
              </span>
              <span className="text-xs text-cream-200/70 font-mono hidden sm:inline">
                {activeImage.id}
              </span>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setZoomLevel((z) => Math.max(0.5, z - 0.25))}
                className="p-1.5 hover:bg-oxblood-800 rounded-xs"
                title="Zoom Out"
              >
                <ZoomOut size={16} />
              </button>
              <span className="text-xs font-mono">{Math.round(zoomLevel * 100)}%</span>
              <button
                onClick={() => setZoomLevel((z) => Math.min(3.0, z + 0.25))}
                className="p-1.5 hover:bg-oxblood-800 rounded-xs"
                title="Zoom In"
              >
                <ZoomIn size={16} />
              </button>
              <button
                onClick={() => setZoomLevel(1)}
                className="p-1.5 hover:bg-oxblood-800 rounded-xs"
                title="Reset Zoom"
              >
                <RotateCcw size={16} />
              </button>
              <button
                onClick={() => setActiveImage(null)}
                className="p-1.5 hover:bg-oxblood-800 rounded-xs text-gold-400"
                aria-label="Close Viewer"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Main Viewer Body */}
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
            {/* Image Canvas */}
            <div className="flex-1 bg-black/60 flex items-center justify-center p-6 overflow-auto">
              <img
                src={activeImage.image_url}
                alt={activeImage.title}
                style={{ transform: `scale(${zoomLevel})`, transition: "transform 0.15s ease-out" }}
                className="max-h-[80vh] max-w-full object-contain shadow-2xl select-none"
              />
            </div>

            {/* Metadata & Rights Side Dossier */}
            <div className="w-full lg:w-96 bg-oxblood-900 border-l border-gold-400/40 p-6 flex flex-col justify-between overflow-y-auto space-y-6">
              <div className="space-y-4">
                {/* Rights Banner */}
                <div className={`p-3.5 rounded-xs border text-xs ${
                  activeImage.download_allowed
                    ? "bg-olive-800/80 border-olive-500 text-cream-100"
                    : "bg-henna-700/80 border-copper-500 text-cream-100"
                }`}>
                  <strong className="block font-serif text-sm font-bold uppercase mb-1">
                    Rights Status: {activeImage.rights_category}
                  </strong>
                  <p className="font-sans leading-relaxed text-cream-200/90 text-[11px]">
                    {activeImage.rights_explanation || (activeImage.download_allowed
                      ? "Reuse permitted with attribution under open access."
                      : "Direct download restricted under provider terms. Viewing and research citation permitted.")}
                  </p>
                </div>

                <div>
                  <h2 className="font-serif font-bold text-xl text-cream-100 leading-snug">
                    {activeImage.title}
                  </h2>
                  <p className="text-xs text-gold-400 font-sans mt-1">
                    Creator: {activeImage.creator || "Traditional Indian artisan"}
                  </p>
                  <p className="text-xs text-cream-200/70 font-sans">
                    Holding Institution: {activeImage.institution || "Archive"}
                  </p>
                </div>

                <div className="space-y-2 text-xs font-sans text-cream-200/80 border-t border-gold-400/20 pt-4">
                  <div><strong>Declared Rights:</strong> {activeImage.rights_declared}</div>
                  <div><strong>Harvested At:</strong> {activeImage.harvested_at?.slice(0, 10)}</div>
                  <div><strong>Attribution:</strong> <span className="italic">{activeImage.attribution_text}</span></div>
                </div>
              </div>

              {/* Action Buttons in Viewer */}
              <div className="space-y-3 pt-4 border-t border-gold-400/30">
                {activeImage.download_allowed ? (
                  <a
                    href={`/api/images/${activeImage.id}/download`}
                    download
                    className="w-full py-2.5 bg-gold-400 hover:bg-gold-300 text-oxblood-950 font-serif font-bold text-xs rounded-xs shadow-md inline-flex items-center justify-center gap-2"
                  >
                    <Download size={14} />
                    <span>Download Image (with Attributions)</span>
                  </a>
                ) : (
                  <a
                    href={activeImage.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 bg-oxblood-800 hover:bg-oxblood-700 text-cream-100 font-serif font-bold text-xs rounded-xs border border-gold-400/40 inline-flex items-center justify-center gap-2"
                  >
                    <span>View at Original Holding Source</span>
                    <ExternalLink size={14} />
                  </a>
                )}

                <button
                  onClick={() => toggleSaveItem(activeImage)}
                  className="w-full py-2 bg-transparent hover:bg-oxblood-800 text-cream-200 font-serif text-xs rounded-xs border border-gold-400/30 inline-flex items-center justify-center gap-2"
                >
                  <Bookmark size={13} />
                  <span>
                    {savedItems.some((s) => s.id === activeImage.id)
                      ? "Saved in Research Collection"
                      : "Save to Research Collection"}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

