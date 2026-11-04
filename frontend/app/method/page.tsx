"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { CornerFiligree } from "@/components/ornament/CornerFiligree";
import { StatusBadge } from "@/components/StatusBadge";
import { BookOpen, Calculator, Scale, Layers, HelpCircle } from "lucide-react";

export default function MethodPage() {
  const [rubrics, setRubrics] = useState<any>(null);

  useEffect(() => {
    fetch("/api/config/rubrics")
      .then((r) => r.json())
      .then((data) => setRubrics(data))
      .catch((e) => console.error(e));
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-12">
      <div className="text-center max-w-2xl mx-auto">
        <span className="font-serif text-xs font-bold uppercase tracking-widest text-copper-600 block mb-1">
          Methodological Specification
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-oxblood-900">
          Formulas, Deterministic Rubrics & Architecture
        </h1>
        <p className="text-xs sm:text-sm text-oxblood-800/80 mt-2">
          THE SILENCE INDEX replaces subjective evaluation with transparent, auditable, and reproducible metrics.
        </p>
      </div>

      {/* 1. Four-State Absence Model */}
      <section className="bg-cream-100 border border-parchment-300 p-8 rounded-sm shadow-xs space-y-4">
        <h2 className="font-serif text-2xl font-bold text-oxblood-900 pb-2 border-b border-parchment-300">
          1. The Four-State Absence Model Plus Not-Applicable
        </h2>
        <p className="text-xs sm:text-sm text-oxblood-800/90 leading-relaxed font-sans">
          Catalog silence is multi-faceted. A zero score must distinguish between an unpopulated field in a rich schema 
          versus an unassessed dimension in a deficient catalog. The platform assigns one deterministic state per dimension:
        </p>

        <div className="space-y-3 pt-2">
          {[
            {
              status: "Documented",
              desc: "The field is mapped in the dataset and the record's content meets or exceeds the dimension rubric threshold (Score ≥ 0.75). Rendered with solid olive fill."
            },
            {
              status: "Partial",
              desc: "Some empirical evidence is present but incomplete (0.25 ≤ Score < 0.75), such as date without description or state without locality. Rendered with antique gold fill and diagonal stripe."
            },
            {
              status: "Undocumented in collection",
              desc: "A column exists in the dataset schema for this dimension, but the record's value is blank or below 0.25. Rendered with copper outline and hatch."
            },
            {
              status: "Not assessable",
              desc: "The dataset schema contains NO column that could capture this dimension (e.g. no column for community consultation). It is statistically impossible to evaluate. Rendered with parchment grey dotted border. NEVER marked as zero."
            },
            {
              status: "Not applicable",
              desc: "The dimension naturally does not apply to this category (e.g. raw craft materials for dance performance). Configurable in applicability.yaml. Rendered with a small dash."
            }
          ].map((item) => (
            <div key={item.status} className="p-3 bg-cream-200/50 rounded-xs border border-parchment-300 flex items-start gap-3 text-xs">
              <StatusBadge status={item.status} size="sm" className="shrink-0 mt-0.5" />
              <p className="font-sans leading-relaxed text-oxblood-900">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 2. Cultural Coverage Debt Mathematical Formulation */}
      <section className="bg-cream-100 border border-parchment-300 p-8 rounded-sm shadow-xs space-y-6">
        <h2 className="font-serif text-2xl font-bold text-oxblood-900 pb-2 border-b border-parchment-300">
          2. Cultural Coverage Debt (CCD) Formulation
        </h2>
        
        <div className="space-y-3 text-xs sm:text-sm font-sans text-oxblood-800/90 leading-relaxed">
          <p>
            Let <span className="font-mono bg-cream-200 px-1 py-0.5 rounded-xs">D</span> be the set of 10 cultural documentation dimensions. 
            For record <span className="font-mono bg-cream-200 px-1 py-0.5 rounded-xs">i</span> and dimension <span className="font-mono bg-cream-200 px-1 py-0.5 rounded-xs">d</span>, 
            the deterministic score is <span className="font-mono bg-cream-200 px-1 py-0.5 rounded-xs">s_{"{i,d}"} \in [0, 1]</span>.
          </p>

          <div className="p-4 bg-oxblood-950 text-cream-100 rounded-xs font-mono text-xs space-y-2 border border-gold-400">
            <div>1. Dimension Coverage: C_d = (1 / N_d) * \sum s_{"{i,d}"} over applicable & assessable records</div>
            <div>2. Dimension Debt:     Debt_d = 1.0 - C_d</div>
            <div>3. Collection CCD:    CCD = 100 * [ \sum(w_d * Debt_d) / \sum(w_d) ]</div>
          </div>

          <p>
            <strong>Bootstrap Confidence Interval:</strong> A 90% confidence interval is computed via 1,000 resamples 
            with a fixed random seed (seed = 42). If a slice has fewer than 5 records, the engine strictly outputs 
            <em> "insufficient evidence"</em> to prevent statistical distortion.
          </p>
        </div>
      </section>

      {/* 3. Ten Deterministic Rubrics */}
      <section className="bg-cream-100 border border-parchment-300 p-8 rounded-sm shadow-xs space-y-6">
        <h2 className="font-serif text-2xl font-bold text-oxblood-900 pb-2 border-b border-parchment-300">
          3. Ten Knowledge Dimension Rubrics
        </h2>

        <div className="space-y-4">
          {[
            { id: "visual_documentation", name: "1. Visual Documentation", scoring: "Image URL (+0.6); technical metadata/dimensions (+0.2); declared rights (+0.2)." },
            { id: "historical_context", name: "2. Historical Context", scoring: "Date/period (+0.4); description >= 200 chars (+0.3); cited source (+0.3)." },
            { id: "original_language", name: "3. Original-Language Documentation", scoring: "Monolingual English (0.0); transliterated/tag (0.5); original Indic script block (1.0)." },
            { id: "geographic_provenance", name: "4. Geographic Provenance", scoring: "State (+0.4); district/place (+0.3); coordinates or geonames authority ID (+0.3)." },
            { id: "materials_and_techniques", name: "5. Materials & Techniques", scoring: "Constituent material (+0.5); craft fabrication technique (+0.5)." },
            { id: "practitioner_perspective", name: "6. Practitioner / Artisan Perspective", scoring: "Maker name (+0.4); community/lineage (+0.3); practitioner statement (+0.3)." },
            { id: "oral_histories", name: "7. Oral Histories & Narratives", scoring: "Linked oral media audio/video (1.0); narrative notes only (0.5); none (0.0)." },
            { id: "source_attribution", name: "8. Source Attribution & Provenance", scoring: "Institution (+0.3); accession ID (+0.2); record URL (+0.3); provenance statement (+0.2)." },
            { id: "community_validation", name: "9. Community Validation", scoring: "Strict assessability: Not assessable if unmapped. Validated (1.0); consultation note (0.5)." },
            { id: "preservation_accessibility", name: "10. Preservation & Accessibility", scoring: "Condition note (+0.4); rights/license (+0.3); access URL (+0.3)." },
          ].map((dim) => (
            <div key={dim.id} className="p-3.5 bg-cream-200/40 rounded-xs border border-parchment-300 text-xs">
              <strong className="font-serif text-sm text-oxblood-900 block mb-1">{dim.name}</strong>
              <p className="font-sans text-oxblood-800/80 leading-relaxed"><strong>Deterministic Scoring:</strong> {dim.scoring}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Preservation Priority Formula */}
      <section className="bg-cream-100 border border-parchment-300 p-8 rounded-sm shadow-xs space-y-4">
        <h2 className="font-serif text-2xl font-bold text-oxblood-900 pb-2 border-b border-parchment-300">
          4. Preservation Priority Engine Formulation
        </h2>
        <div className="space-y-3 text-xs sm:text-sm font-sans text-oxblood-800/90 leading-relaxed">
          <p>Each gap across a slice and dimension pair is assigned an investigation priority in [0, 100]:</p>
          <div className="p-4 bg-oxblood-950 text-cream-100 rounded-xs font-mono text-xs border border-gold-400">
            Priority = 100 × (0.40·G + 0.25·E + 0.20·B + 0.15·F)
          </div>
          <ul className="list-disc pl-5 space-y-1 text-xs">
            <li><strong>G (Gap Magnitude):</strong> Slice debt on that dimension (1.0 - mean score).</li>
            <li><strong>E (Evidence Confidence):</strong> Statistical stability function of slice size and sample completeness.</li>
            <li><strong>B (Breadth):</strong> Percentage share of the collection affected by the gap.</li>
            <li><strong>F (Feasibility):</strong> Presence of existing lead URLs and institutions vs requiring primary fieldwork.</li>
          </ul>
        </div>
      </section>

      {/* 5. Prior Art & Credits */}
      <section className="bg-cream-200/60 border border-parchment-300 p-6 rounded-sm text-xs font-sans text-oxblood-800/90 space-y-2">
        <strong className="font-serif font-bold text-sm text-oxblood-900 block">Prior Art & Digital Humanities Heritage:</strong>
        <p>
          THE SILENCE INDEX builds upon foundational metadata quality research developed by the Europeana Data Quality Committee,
          the Getty Vocabularies, and the Dublin Core Metadata Initiative, adapting them to the specific multidimensional realities
          of South Asian material and living cultural heritage.
        </p>
      </section>
    </div>
  );
}

