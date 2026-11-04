"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CornerFiligree } from "@/components/ornament/CornerFiligree";
import { StatusBadge } from "@/components/StatusBadge";
import {
  UploadCloud, FileCheck, CheckCircle2, AlertTriangle, ArrowRight,
  RefreshCw, Check, X, ShieldAlert, Sparkles
} from "lucide-react";

export default function AuditorPage() {
  const router = useRouter();

  // Wizard Step: 1 = Source Selection, 2 = Validation, 3 = Column Mapping, 4 = Audit Progress, 5 = Complete
  const [step, setStep] = useState<number>(1);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [mappings, setMappings] = useState<any[]>([]);
  const [auditId, setAuditId] = useState<string | null>(null);
  const [auditProgress, setAuditProgress] = useState<any>({ percent: 0, stage: "initialized" });
  const [auditComplete, setAuditComplete] = useState<any>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Canonical field options for mapping
  const CANONICAL_OPTIONS = [
    { id: "title", label: "Object Title / Artwork Name" },
    { id: "art_form", label: "Art Tradition / School / Genre" },
    { id: "category", label: "Cultural Category (1 of 9)" },
    { id: "state", label: "State / UT Provenance" },
    { id: "district_place", label: "District / Town / Locality" },
    { id: "coordinates", label: "Geographic Coordinates (Lat/Lon)" },
    { id: "period_date", label: "Chronological Period / Date" },
    { id: "language", label: "Language / Script Description" },
    { id: "materials", label: "Constituent Materials" },
    { id: "technique", label: "Craft / Fabrication Technique" },
    { id: "description", label: "Descriptive Historiography" },
    { id: "maker_name", label: "Artisan / Maker Name" },
    { id: "community", label: "Artisan Community / Lineage" },
    { id: "practitioner_statement", label: "Practitioner Voice / Statement" },
    { id: "narrative_oral", label: "Oral History / Narrative Notes" },
    { id: "source_institution", label: "Holding Institution / Archive" },
    { id: "accession_id", label: "Accession Number / Inventory ID" },
    { id: "source_url", label: "Institutional Record URL" },
    { id: "image_url", label: "High-Resolution Image URL" },
    { id: "rights_license", label: "Declared Rights & License" },
    { id: "validated_by", label: "Community Validation / Consultation" },
    { id: "unmapped", label: "— Mark as Not Present in Dataset —" }
  ];

  // Handle file drop / select
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setErrorMessage(null);
    }
  };

  // Upload and validate file
  const handleUpload = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    setErrorMessage(null);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const res = await fetch("/api/uploads", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || data.detail?.message || "Upload validation failed.");
      }

      setUploadResult(data);
      setMappings(data.suggested_mappings || []);
      setStep(2); // Move to validation review
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to parse upload.");
    } finally {
      setIsUploading(false);
    }
  };

  // Select Sample dataset directly
  const handleSelectSample = (sampleId: string) => {
    localStorage.setItem("silence_index_active_collection", sampleId);
    window.dispatchEvent(new Event("collection_changed"));
    router.push(`/observatory`);
  };

  // Confirm mapping and start audit
  const handleStartAudit = async () => {
    setStep(4);
    try {
      // 1. Update mappings on server
      await fetch(`/api/uploads/${uploadResult.upload_id}/mapping`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mappings }),
      });

      // 2. Start audit run
      const startRes = await fetch("/api/audits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ collection_id: uploadResult.upload_id }),
      });
      const startData = await startRes.json();
      const currentAuditId = startData.audit_id;
      setAuditId(currentAuditId);

      // 3. Poll audit progress
      const pollInterval = setInterval(async () => {
        try {
          const pRes = await fetch(`/api/audits/${currentAuditId}/progress`);
          const pData = await pRes.json();
          setAuditProgress(pData);

          if (pData.status === "completed") {
            clearInterval(pollInterval);
            // Fetch final audit result
            const aRes = await fetch(`/api/audits/${currentAuditId}`);
            const aData = await aRes.json();
            setAuditComplete(aData);
            setStep(5);
            localStorage.setItem("silence_index_active_collection", uploadResult.upload_id);
            window.dispatchEvent(new Event("collection_changed"));
          } else if (pData.status === "failed") {
            clearInterval(pollInterval);
            setErrorMessage(pData.error || "Audit failed during execution.");
          }
        } catch (e) {
          console.error(e);
        }
      }, 700);

    } catch (err: any) {
      setErrorMessage(err.message || "Failed to start audit.");
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-8">
      {/* Page Title */}
      <div className="text-center max-w-2xl mx-auto">
        <span className="font-serif text-xs font-bold uppercase tracking-widest text-copper-600 block mb-1">
          Automated Cultural Audit
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-oxblood-900">
          Collection Auditor Wizard
        </h1>
        <p className="text-xs sm:text-sm text-oxblood-800/80 mt-2">
          Upload any heritage collection CSV or JSON to audit documentation completeness, compute Cultural Coverage Debt,
          and identify unassessed dimensions.
        </p>
      </div>

      {/* Stepper Indicator */}
      <div className="flex items-center justify-between max-w-2xl mx-auto text-xs font-serif font-bold uppercase tracking-wider">
        {[
          { num: 1, label: "Choose Source" },
          { num: 2, label: "Validation" },
          { num: 3, label: "Map Columns" },
          { num: 4, label: "Audit Engine" },
          { num: 5, label: "Results" },
        ].map((s) => (
          <div key={s.num} className="flex items-center gap-1.5">
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                step >= s.num ? "bg-gold-400 text-oxblood-950 font-bold" : "bg-parchment-300 text-oxblood-800/60"
              }`}
            >
              {s.num}
            </span>
            <span className={`hidden sm:inline ${step >= s.num ? "text-oxblood-900 font-bold" : "text-oxblood-800/50"}`}>
              {s.label}
            </span>
          </div>
        ))}
      </div>

      {/* STEP 1: Choose Source or Drop File */}
      {step === 1 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Option A: Upload Custom Dataset */}
          <div className="bg-cream-100 border-2 border-dashed border-gold-400 rounded-sm p-8 text-center space-y-4 hover:bg-cream-200/40 transition-colors">
            <UploadCloud size={40} className="mx-auto text-gold-500" />
            <h3 className="font-serif text-lg font-bold text-oxblood-900">Audit Your Collection Manifest</h3>
            <p className="text-xs text-oxblood-800/80 max-w-sm mx-auto">
              Drop any CSV, JSON array, or JSON Lines file up to 25 MB. Encodings and delimiters are detected automatically.
            </p>
            <input
              type="file"
              accept=".csv,.json,.jsonl"
              onChange={handleFileChange}
              className="block w-full text-xs text-oxblood-900 file:mr-4 file:py-2 file:px-4 file:rounded-xs file:border-0 file:text-xs file:font-serif file:font-bold file:bg-gold-400 file:text-oxblood-950 hover:file:bg-gold-300 cursor-pointer"
            />
            {selectedFile && (
              <div className="pt-2">
                <button
                  onClick={handleUpload}
                  disabled={isUploading}
                  className="w-full py-2.5 bg-oxblood-900 hover:bg-oxblood-800 text-cream-100 font-serif font-bold text-xs rounded-xs shadow-md"
                >
                  {isUploading ? "Validating Encoding & Structure..." : `Validate ${selectedFile.name} →`}
                </button>
              </div>
            )}
            {errorMessage && (
              <div className="p-3 bg-red-100 border border-red-300 text-red-900 text-xs rounded-xs text-left">
                <strong>Error:</strong> {errorMessage}
              </div>
            )}
          </div>

          {/* Option B: Choose Pre-loaded Sample Collection */}
          <div className="bg-cream-200/60 border border-parchment-300 rounded-sm p-8 flex flex-col justify-between space-y-4">
            <div>
              <span className="font-serif text-xs font-bold uppercase tracking-wider text-copper-600 block mb-1">
                Zero Configuration
              </span>
              <h3 className="font-serif text-lg font-bold text-oxblood-900">Or Audit a Pre-Loaded Benchmark Holding</h3>
              <p className="text-xs text-oxblood-800/80 mt-1">
                Choose between real open-access museum data or a deliberately seeded synthetic test set with diagnostic flaws.
              </p>

              <div className="mt-4 space-y-3">
                <div
                  onClick={() => handleSelectSample("sample-real-001")}
                  className="p-3 bg-cream-100 border border-parchment-400 rounded-xs hover:border-gold-400 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <strong className="font-serif text-sm text-oxblood-900">Sample A: Indian Art in Open Access</strong>
                    <span className="text-[10px] font-mono font-bold uppercase bg-olive-700 text-cream-100 px-1.5 py-0.5 rounded-xs">
                      181 Real Items
                    </span>
                  </div>
                  <p className="text-xs text-oxblood-800/70 mt-1">
                    Verified open-access holdings with genuine declared rights and authentic high-resolution images.
                  </p>
                </div>

                <div
                  onClick={() => handleSelectSample("sample-synth-002")}
                  className="p-3 bg-cream-100 border border-parchment-400 rounded-xs hover:border-gold-400 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <strong className="font-serif text-sm text-oxblood-900">Sample B: Synthetic Regional Museum</strong>
                    <span className="text-[10px] font-mono font-bold uppercase bg-henna-600 text-cream-100 px-1.5 py-0.5 rounded-xs">
                      150 Synthetic
                    </span>
                  </div>
                  <p className="text-xs text-oxblood-800/70 mt-1">
                    Deliberately seeded with duplicate clusters, geographic discrepancies, and missing maker citations.
                  </p>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-oxblood-800/60 italic border-t border-parchment-300 pt-3">
              Absence of a record describes the collection manifest, not the cultural heritage itself.
            </p>
          </div>
        </div>
      )}

      {/* STEP 2: Validation Report */}
      {step === 2 && uploadResult && (
        <div className="bg-cream-100 border border-parchment-300 rounded-sm p-6 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-parchment-300">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase text-olive-700 block">VALIDATION PASSED</span>
              <h3 className="font-serif text-xl font-bold text-oxblood-900">
                File Ingestion & Encoding Report
              </h3>
            </div>
            <span className="px-3 py-1 bg-olive-700 text-cream-100 text-xs font-mono font-bold rounded-xs">
              {uploadResult.total_rows} Records Detected
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-3 bg-cream-200/60 rounded-xs border border-parchment-300">
              <span className="text-oxblood-800/70 block uppercase text-[10px]">Detected Encoding</span>
              <strong className="font-mono text-sm text-oxblood-900">{uploadResult.detected_encoding.toUpperCase()}</strong>
            </div>
            <div className="p-3 bg-cream-200/60 rounded-xs border border-parchment-300">
              <span className="text-oxblood-800/70 block uppercase text-[10px]">Delimiter</span>
              <strong className="font-mono text-sm text-oxblood-900">{uploadResult.detected_delimiter === "\t" ? "TAB" : uploadResult.detected_delimiter}</strong>
            </div>
            <div className="p-3 bg-cream-200/60 rounded-xs border border-parchment-300">
              <span className="text-oxblood-800/70 block uppercase text-[10px]">Header Row</span>
              <strong className="font-mono text-sm text-emerald-900">VERIFIED</strong>
            </div>
            <div className="p-3 bg-cream-200/60 rounded-xs border border-parchment-300">
              <span className="text-oxblood-800/70 block uppercase text-[10px]">BOM Stripped</span>
              <strong className="font-mono text-sm text-oxblood-900">{uploadResult.has_bom ? "YES" : "NO"}</strong>
            </div>
          </div>

          {uploadResult.warnings?.length > 0 && (
            <div className="p-3 bg-gold-400/15 border border-gold-400/50 rounded-xs text-xs space-y-1">
              <strong className="text-oxblood-900 block">Parsing Notices:</strong>
              {uploadResult.warnings.map((w: string, i: number) => (
                <p key={i} className="text-oxblood-800/80">• {w}</p>
              ))}
            </div>
          )}

          <div className="flex justify-between pt-4 border-t border-parchment-300">
            <button
              onClick={() => setStep(1)}
              className="px-4 py-2 bg-cream-200 hover:bg-cream-300 text-oxblood-900 text-xs font-serif font-bold rounded-xs"
            >
              ← Choose Different File
            </button>
            <button
              onClick={() => setStep(3)}
              className="px-6 py-2 bg-oxblood-900 hover:bg-oxblood-800 text-cream-100 text-xs font-serif font-bold rounded-xs shadow-md"
            >
              Proceed to Column Mapping Review →
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Column Mapping Review */}
      {step === 3 && (
        <div className="bg-cream-100 border border-parchment-300 rounded-sm p-6 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-parchment-300">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase text-copper-600 block">SCHEMA ALIGNMENT</span>
              <h3 className="font-serif text-xl font-bold text-oxblood-900">
                Confirm Canonical Column Mappings
              </h3>
              <p className="text-xs text-oxblood-800/80 mt-1">
                Fuzzy and exact header matches with confidence scores. Any unmapped canonical field drives the 
                <strong className="text-oxblood-900"> Not Assessable</strong> state rather than false zeros.
              </p>
            </div>
          </div>

          <div className="space-y-3 max-h-[420px] overflow-y-auto pr-2">
            {mappings.map((m, idx) => (
              <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center p-3 bg-cream-200/50 rounded-xs border border-parchment-300">
                <div className="md:col-span-4">
                  <span className="text-[10px] text-oxblood-800/60 block uppercase">Source CSV Column</span>
                  <strong className="font-mono text-xs text-oxblood-900">{m.source_column}</strong>
                </div>

                <div className="md:col-span-2 text-center">
                  <span className={`px-2 py-0.5 rounded-xs text-[10px] font-mono font-bold border ${
                    m.confidence >= 0.90 ? "bg-emerald-900/10 text-emerald-900 border-emerald-900/30" : "bg-gold-400/20 text-oxblood-900 border-gold-400/40"
                  }`}>
                    {Math.round(m.confidence * 100)}% Match
                  </span>
                </div>

                <div className="md:col-span-6">
                  <span className="text-[10px] text-oxblood-800/60 block uppercase">Mapped Canonical Dimension</span>
                  <select
                    value={m.canonical_field}
                    onChange={(e) => {
                      const updated = [...mappings];
                      updated[idx].canonical_field = e.target.value;
                      updated[idx].confidence = e.target.value === "unmapped" ? 0.0 : 1.0;
                      setMappings(updated);
                    }}
                    className="w-full bg-cream-100 border border-parchment-400 rounded-xs p-1.5 text-xs font-sans text-oxblood-900"
                  >
                    {CANONICAL_OPTIONS.map((opt) => (
                      <option key={opt.id} value={opt.id}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between pt-4 border-t border-parchment-300">
            <button
              onClick={() => setStep(2)}
              className="px-4 py-2 bg-cream-200 hover:bg-cream-300 text-oxblood-900 text-xs font-serif font-bold rounded-xs"
            >
              ← Back to Validation
            </button>
            <button
              onClick={handleStartAudit}
              className="px-6 py-2.5 bg-oxblood-900 hover:bg-oxblood-800 text-cream-100 text-xs font-serif font-bold rounded-xs shadow-md"
            >
              Execute Collection Audit Now →
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Real Audit Progress */}
      {step === 4 && (
        <div className="bg-cream-100 border border-parchment-300 rounded-sm p-12 text-center space-y-6">
          <RefreshCw size={36} className="mx-auto text-gold-500 animate-spin" />
          <h3 className="font-serif text-2xl font-bold text-oxblood-900">
            Auditing Collection Metadata...
          </h3>
          <p className="text-xs text-oxblood-800/80 max-w-md mx-auto">
            Stage: <strong className="uppercase font-mono text-oxblood-900">{auditProgress.stage}</strong> ({auditProgress.percent}%)
          </p>

          {/* Progress Bar */}
          <div className="w-full max-w-md mx-auto h-3 bg-parchment-300 rounded-full overflow-hidden border border-parchment-400">
            <div
              className="h-full bg-gold-500 transition-all duration-300"
              style={{ width: `${auditProgress.percent}%` }}
            />
          </div>

          <div className="text-[11px] text-oxblood-800/60 max-w-sm mx-auto">
            Computing deterministic rubrics, RapidFuzz duplicate clustering, and regional geographic validation.
          </div>
        </div>
      )}

      {/* STEP 5: Audit Complete Summary */}
      {step === 5 && auditComplete && (
        <div className="bg-cream-100 border-2 border-gold-400 rounded-sm p-8 space-y-6">
          <div className="flex items-center gap-3 text-emerald-900">
            <CheckCircle2 size={28} />
            <div>
              <h3 className="font-serif text-2xl font-bold text-oxblood-900">Audit Completed Successfully</h3>
              <p className="text-xs text-oxblood-800/80">Audit ID: {auditComplete.id}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 bg-cream-200/70 border border-parchment-300 rounded-xs">
              <span className="text-[11px] uppercase text-copper-600 block">Cultural Coverage Debt</span>
              <span className="font-serif text-3xl font-bold text-oxblood-900">{auditComplete.ccd?.toFixed(1)}</span>
              <span className="text-[10px] text-oxblood-800/70 block mt-0.5">Scale 0-100</span>
            </div>
            <div className="p-4 bg-cream-200/70 border border-parchment-300 rounded-xs">
              <span className="text-[11px] uppercase text-copper-600 block">Assessability</span>
              <span className="font-serif text-xl font-bold text-oxblood-900">{auditComplete.assessability}</span>
              <span className="text-[10px] text-oxblood-800/70 block mt-0.5">Based on mapped schema</span>
            </div>
            <div className="p-4 bg-cream-200/70 border border-parchment-300 rounded-xs">
              <span className="text-[11px] uppercase text-copper-600 block">Total Catalog Items</span>
              <span className="font-serif text-3xl font-bold text-oxblood-900">{auditComplete.total_records}</span>
              <span className="text-[10px] text-oxblood-800/70 block mt-0.5">Evaluated immutably</span>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-parchment-300">
            <Link
              href={`/reports/${auditComplete.id}`}
              className="px-6 py-3 bg-oxblood-900 hover:bg-oxblood-800 text-cream-100 font-serif font-bold text-xs rounded-xs shadow-md inline-flex items-center gap-2"
            >
              <span>View The Silence Report & Export PDF</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

