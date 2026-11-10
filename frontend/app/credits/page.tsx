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
          Source Layers & Verified Provenance (317 Fused Records)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3 text-xs font-sans">
          <div className="p-3 bg-cream-200/50 rounded-xs border border-parchment-300">
            <strong className="font-serif text-oxblood-900 block mb-1">GI Registry (81 items)</strong>
            <p className="text-oxblood-800/80 text-[11px]">
              Gazetted geographical indications from Intellectual Property India covering registered crafts and textiles.
            </p>
          </div>
          <div className="p-3 bg-cream-200/50 rounded-xs border border-parchment-300">
            <strong className="font-serif text-oxblood-900 block mb-1">UNESCO ICH (15 items)</strong>
            <p className="text-oxblood-800/80 text-[11px]">
              Inscriptions from the Representative List of the Intangible Cultural Heritage of Humanity.
            </p>
          </div>
          <div className="p-3 bg-cream-200/50 rounded-xs border border-parchment-300">
            <strong className="font-serif text-oxblood-900 block mb-1">Wikidata / ASI (24 items)</strong>
            <p className="text-oxblood-800/80 text-[11px]">
              Structured knowledge graph entries including Archaeological Survey of India (ASI) protected monuments.
            </p>
          </div>
          <div className="p-3 bg-cream-200/50 rounded-xs border border-parchment-300">
            <strong className="font-serif text-oxblood-900 block mb-1">Commons Media (16 items)</strong>
            <p className="text-oxblood-800/80 text-[11px]">
              Verified CC-licensed cultural imagery of epigraphy, dance, and temple murals.
            </p>
          </div>
          <div className="p-3 bg-cream-200/50 rounded-xs border border-parchment-300">
            <strong className="font-serif text-oxblood-900 block mb-1">Museum OA (181 items)</strong>
            <p className="text-oxblood-800/80 text-[11px]">
              Accessioned holdings from The Met, Cleveland, and Harvard Open Access collections under CC0 / Public Domain.
            </p>
          </div>
        </div>
      </div>

      {/* Platform Visual & Audio Credits */}
      <div className="bg-cream-100 border border-parchment-300 p-6 rounded-sm shadow-xs space-y-4">
        <div>
          <h2 className="font-serif text-xl font-bold text-oxblood-900">
            Platform Visual & Audio Credits
          </h2>
          <p className="text-xs text-oxblood-800/80 mt-1 font-sans">
            Attribution for user interface illustrations, decorative assets, and ambient landing audio.
          </p>
        </div>

        <div className="overflow-x-auto border border-parchment-300 rounded-xs">
          <table className="w-full text-left text-xs text-oxblood-900 font-sans" aria-label="Platform Media Credits">
            <thead className="bg-oxblood-900 text-cream-100 font-serif text-[11px] uppercase tracking-wider">
              <tr>
                <th className="p-3">Asset Name</th>
                <th className="p-3">Artist / Creator</th>
                <th className="p-3">Source Repository</th>
                <th className="p-3">Declared Licence / Terms</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-parchment-300">
              <tr className="hover:bg-cream-200/40">
                <td className="p-3 font-semibold text-oxblood-900">
                  Classical Dancers (`classical_dancers_transparent.png`)
                </td>
                <td className="p-3 text-oxblood-800">Ritu Poojari</td>
                <td className="p-3">Behance Portfolio</td>
                <td className="p-3 text-oxblood-800/80">Non-commercial educational demonstration</td>
                <td className="p-3">
                  <span className="px-2 py-0.5 rounded-xs text-[10px] font-mono bg-olive-700/15 text-olive-800 border border-olive-700/40 font-bold">
                    Attributed
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-cream-200/40">
                <td className="p-3 font-semibold text-oxblood-900">
                  Decorative Lotus Motifs (`lotus_*.png`)
                </td>
                <td className="p-3 text-oxblood-800">Ritu Poojari</td>
                <td className="p-3">Behance Portfolio</td>
                <td className="p-3 text-oxblood-800/80">Non-commercial educational demonstration</td>
                <td className="p-3">
                  <span className="px-2 py-0.5 rounded-xs text-[10px] font-mono bg-olive-700/15 text-olive-800 border border-olive-700/40 font-bold">
                    Attributed
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-cream-200/40">
                <td className="p-3 font-semibold text-oxblood-900">
                  Ambient Landing Music (`raga_bindu_stress_melts_away.m4a`)
                </td>
                <td className="p-3 text-oxblood-800">Raga Bindu</td>
                <td className="p-3">"Stress Melts Away" (Traditional Indian Meditation Music)</td>
                <td className="p-3 text-oxblood-800/80">Educational hackathon audio presentation with creator credit</td>
                <td className="p-3">
                  <span className="px-2 py-0.5 rounded-xs text-[10px] font-mono bg-olive-700/15 text-olive-800 border border-olive-700/40 font-bold">
                    Attributed
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
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

