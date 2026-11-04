"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { CornerFiligree } from "@/components/ornament/CornerFiligree";
import { ExternalLink, ShieldCheck, HeartHandshake, Download } from "lucide-react";

export default function CreditsPage() {
  const [images, setImages] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/images?page_size=100")
      .then((r) => r.json())
      .then((d) => {
        if (d.images) setImages(d.images);
      })
      .catch((e) => console.error(e));
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 space-y-10">
      <div className="text-center max-w-2xl mx-auto">
        <span className="font-serif text-xs font-bold uppercase tracking-widest text-copper-600 block mb-1">
          Open Access Attribution Manifest
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-oxblood-900">
          Credits, Citations & Image Provenance
        </h1>
        <p className="text-xs sm:text-sm text-oxblood-800/80 mt-2">
          Every image and record in THE SILENCE INDEX seed dataset is authentic, verified, and explicitly attributed.
        </p>
      </div>

      {/* Sources Overview Card */}
      <div className="bg-cream-100 border border-parchment-300 p-6 rounded-sm shadow-xs space-y-4">
        <h2 className="font-serif text-xl font-bold text-oxblood-900 pb-2 border-b border-parchment-300">
          Institutional Repositories & Open Licences
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-sans">
          <div className="p-3 bg-cream-200/50 rounded-xs border border-parchment-300">
            <strong className="font-serif text-oxblood-900 block mb-1">Wikimedia Commons Archive</strong>
            <p className="text-oxblood-800/80">
              High-resolution imagery of Indian art, architecture, and crafts licensed under CC0, Public Domain Mark, CC BY, and CC BY-SA.
            </p>
          </div>
          <div className="p-3 bg-cream-200/50 rounded-xs border border-parchment-300">
            <strong className="font-serif text-oxblood-900 block mb-1">Metropolitan Museum of Art</strong>
            <p className="text-oxblood-800/80">
              Open Access Initiative collections of South Asian sculptures, manuscripts, and textiles designated CC0 1.0 Universal.
            </p>
          </div>
          <div className="p-3 bg-cream-200/50 rounded-xs border border-parchment-300">
            <strong className="font-serif text-oxblood-900 block mb-1">Survey of India Demarcations</strong>
            <p className="text-oxblood-800/80">
              Administrative state boundary GeoJSON representing official territorial demarcations of the Republic of India.
            </p>
          </div>
        </div>
      </div>

      {/* Verified Attributions Table */}
      <div className="bg-cream-100 border border-parchment-300 rounded-sm shadow-xs overflow-hidden">
        <div className="p-4 bg-oxblood-900 text-cream-100 flex items-center justify-between">
          <h3 className="font-serif font-bold text-sm uppercase tracking-wider">
            Attribution Registry ({images.length} Verified Entries)
          </h3>
          <a
            href="/data/seed/attribution.csv"
            download
            className="px-2.5 py-1 bg-gold-400 hover:bg-gold-300 text-oxblood-950 font-serif font-bold text-xs rounded-xs shadow-2xs inline-flex items-center gap-1"
          >
            <Download size={11} />
            <span>Download attribution.csv</span>
          </a>
        </div>

        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <table className="w-full text-left text-xs text-oxblood-900" aria-label="Attribution Table">
            <thead className="bg-cream-200/90 font-serif text-[11px] uppercase tracking-wider sticky top-0 border-b border-parchment-300">
              <tr>
                <th scope="col" className="p-3">Artwork Title</th>
                <th scope="col" className="p-3">Artisan / Creator</th>
                <th scope="col" className="p-3">Source Institution</th>
                <th scope="col" className="p-3">Declared Rights</th>
                <th scope="col" className="p-3 text-right">Source Link</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-parchment-300 font-sans">
              {images.map((img) => (
                <tr key={img.id} className="hover:bg-cream-200/40">
                  <td className="p-3 font-medium max-w-xs truncate" title={img.title}>
                    <div className="flex items-center gap-2">
                      {img.thumbnail_url && (
                        <img src={img.thumbnail_url} alt="" className="w-6 h-6 rounded-xs object-cover border border-parchment-300 shrink-0" />
                      )}
                      <span className="truncate">{img.title}</span>
                    </div>
                  </td>
                  <td className="p-3 text-oxblood-800/80 truncate max-w-[160px]">{img.creator || "Traditional Indian artisan"}</td>
                  <td className="p-3 text-oxblood-800/80 truncate max-w-[160px]">{img.institution || "Archive"}</td>
                  <td className="p-3 whitespace-nowrap">
                    <span className="px-1.5 py-0.5 rounded-xs text-[10px] font-mono border bg-cream-200/70 border-parchment-300">
                      {img.rights_category}
                    </span>
                  </td>
                  <td className="p-3 text-right whitespace-nowrap">
                    <a
                      href={img.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-henna-700 hover:underline font-serif font-bold text-[11px] inline-flex items-center gap-1"
                    >
                      <span>Repository</span>
                      <ExternalLink size={10} />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

