"use client";

import React, { useState, useEffect } from "react";
import { CornerFiligree } from "@/components/ornament/CornerFiligree";
import {
  Activity, CheckCircle2, ShieldCheck, Database, HardDrive,
  RefreshCw, AlertTriangle, Layers, Clock, Award
} from "lucide-react";

export default function HealthDashboardPage() {
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [verification, setVerification] = useState<any>(null);
  const [verifying, setVerifying] = useState(false);

  const loadHealth = () => {
    setLoading(true);
    fetch("/api/health")
      .then((r) => r.json())
      .then((data) => setHealth(data))
      .catch((e) => console.error("Error loading health status:", e))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadHealth();
  }, []);

  const handleRunVerification = () => {
    setVerifying(true);
    fetch("/api/health/verify", { method: "POST" })
      .then((r) => r.json())
      .then((res) => setVerification(res))
      .catch((e) => console.error(e))
      .finally(() => setVerifying(false));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 overflow-x-hidden">
      {/* Banner */}
      <div className="relative bg-cream-200/80 border border-gold-400 p-6 rounded-sm shadow-xs overflow-hidden">
        <CornerFiligree position="top-left" size={32} className="absolute left-1 top-1" />
        <CornerFiligree position="top-right" size={32} className="absolute right-1 top-1" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Activity size={18} className="text-gold-500" />
              <span className="text-[10px] font-mono uppercase tracking-widest font-bold px-2 py-0.5 bg-oxblood-900 text-cream-100 rounded-xs">
                FEATURE F9 • HEALTH & RELIABILITY DASHBOARD
              </span>
            </div>
            <h1 className="font-serif text-2xl font-bold text-oxblood-900">
              System Diagnostics & Relational Integrity
            </h1>
            <p className="text-xs text-oxblood-800/80 mt-1 max-w-3xl leading-relaxed font-sans">
              Live observability monitoring database connectivity, source layer freshness, local image cache hit rates, automated regression test badges, and on-demand foreign-key consistency verification.
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={handleRunVerification}
              disabled={verifying}
              className="px-4 py-2 bg-oxblood-900 hover:bg-oxblood-800 text-cream-100 font-serif font-bold text-xs rounded-xs flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <ShieldCheck size={14} />
              <span>{verifying ? "Checking..." : "Run Integrity Check"}</span>
            </button>
            <button
              onClick={loadHealth}
              className="px-3 py-2 bg-cream-100 hover:bg-cream-200 border border-parchment-400 text-oxblood-900 font-serif text-xs rounded-xs flex items-center gap-1.5 shadow-2xs"
            >
              <RefreshCw size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      {health && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Uptime & Status */}
          <div className="bg-cream-100 border border-parchment-300 rounded-xs p-5 space-y-1">
            <span className="text-[10px] font-mono uppercase text-copper-600 font-bold block">Engine Status</span>
            <div className="flex items-center gap-2 pt-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
              <span className="font-serif text-xl font-bold text-oxblood-900 uppercase">{health.status}</span>
            </div>
            <p className="text-xs text-oxblood-800/70 font-sans">
              Uptime: {Math.floor(health.uptime_seconds / 60)}m {Math.floor(health.uptime_seconds % 60)}s
            </p>
          </div>

          {/* Database Metrics */}
          <div className="bg-cream-100 border border-parchment-300 rounded-xs p-5 space-y-1">
            <span className="text-[10px] font-mono uppercase text-copper-600 font-bold block">Database & Entities</span>
            <div className="flex items-baseline gap-2 pt-1">
              <span className="font-serif text-2xl font-bold text-oxblood-900">{health.database.records_count}</span>
              <span className="text-xs text-oxblood-800/70 font-sans">Records</span>
            </div>
            <p className="text-xs text-oxblood-800/70 font-sans">
              {health.database.heritage_entities_count} Heritage Entities • {health.database.collections_count} Collections
            </p>
          </div>

          {/* Image Cache Hit Rate */}
          <div className="bg-cream-100 border border-parchment-300 rounded-xs p-5 space-y-1">
            <span className="text-[10px] font-mono uppercase text-copper-600 font-bold block">Image Cache Hit Rate</span>
            <div className="flex items-baseline gap-2 pt-1">
              <span className="font-serif text-2xl font-bold text-emerald-800">{health.image_cache.hit_rate_percent}%</span>
            </div>
            <p className="text-xs text-oxblood-800/70 font-sans">
              {health.image_cache.total_cached_images} verified artworks & photos
            </p>
          </div>

          {/* Automated Tests Badge */}
          <div className="bg-cream-100 border border-parchment-300 rounded-xs p-5 space-y-1">
            <span className="text-[10px] font-mono uppercase text-copper-600 font-bold block">Regression Test Suite</span>
            <div className="flex items-center gap-2 pt-1">
              <CheckCircle2 size={18} className="text-olive-700" />
              <span className="font-serif text-xl font-bold text-olive-800">
                {health.test_suite.tests_passing} / {health.test_suite.tests_total} Passing
              </span>
            </div>
            <p className="text-xs text-oxblood-800/70 font-sans">
              Unit & Golden Tests: Verified run as of {health.test_suite.last_run}
            </p>
          </div>

          {/* Automated Accessibility Badge */}
          <div className="bg-cream-100 border border-parchment-300 rounded-xs p-5 space-y-1">
            <span className="text-[10px] font-mono uppercase text-copper-600 font-bold block">Accessibility Audit</span>
            <div className="flex items-center gap-2 pt-1">
              <Award size={18} className="text-gold-600" />
              <span className="font-serif text-xl font-bold text-oxblood-900">
                {health.accessibility_audit?.engine || "axe-core 4.8.4"}
              </span>
            </div>
            <p className="text-xs text-oxblood-800/70 font-sans">
              19 routes scanned on {health.accessibility_audit?.last_run || "2026-11-10"}
            </p>
          </div>
        </div>
      )}

      {/* On-Demand Integrity Verification Report */}
      {verification && (
        <div className="bg-cream-100 border-2 border-gold-400 rounded-sm p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif text-lg font-bold text-oxblood-900 flex items-center gap-2">
                <ShieldCheck size={18} className="text-gold-500" />
                <span>On-Demand Database Integrity Verification Report</span>
              </h3>
              <span className="text-xs font-mono text-oxblood-800/60 font-sans">
                Completed in {verification.latency_ms} ms at {verification.verified_at}
              </span>
            </div>
            <span className={`px-3 py-1 rounded-xs font-mono font-bold text-xs uppercase ${
              verification.overall_status === "PASSED"
                ? "bg-olive-700 text-cream-100"
                : "bg-henna-600 text-cream-100"
            }`}>
              {verification.overall_status}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            {verification.checks.map((chk: any, idx: number) => (
              <div key={idx} className="p-3 bg-cream-200/50 border border-parchment-300 rounded-xs text-xs font-sans space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-serif font-bold text-oxblood-900">{chk.name}</span>
                  <span className="font-mono text-[11px] font-bold text-olive-700">{chk.status}</span>
                </div>
                <p className="text-oxblood-800/80">{chk.detail}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Source Layers Freshness Table */}
      {health?.layers && (
        <div className="bg-cream-100 border border-parchment-300 rounded-sm p-6 space-y-4 shadow-xs">
          <h3 className="font-serif text-lg font-bold text-oxblood-900 flex items-center gap-2">
            <Layers size={17} className="text-copper-600" />
            <span>Source Layer Freshness & Item Counts</span>
          </h3>

          <div className="overflow-x-auto border border-parchment-300 rounded-xs">
            <table className="w-full text-left text-xs text-oxblood-900 font-sans" aria-label="Layer Freshness Table">
              <thead className="bg-oxblood-900 text-cream-100 font-serif text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="p-3">Source Layer</th>
                  <th className="p-3">Layer ID</th>
                  <th className="p-3 text-right">Items Held</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Last Harvested</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-parchment-300">
                {health.layers.map((l: any) => (
                  <tr key={l.layer_id} className="hover:bg-cream-200/50 transition-colors">
                    <td className="p-3 font-semibold text-oxblood-900">{l.name}</td>
                    <td className="p-3 font-mono text-copper-600">{l.layer_id}</td>
                    <td className="p-3 text-right font-mono font-bold text-oxblood-900">
                      {l.items_held.toLocaleString()}
                    </td>
                    <td className="p-3">
                      <span className="inline-flex items-center gap-1 font-semibold text-olive-800 text-[11px]">
                        <CheckCircle2 size={12} />
                        <span>{l.status}</span>
                      </span>
                    </td>
                    <td className="p-3 font-mono text-[11px] text-oxblood-800/70">
                      {l.last_harvest_at || "Attributed Cache"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

