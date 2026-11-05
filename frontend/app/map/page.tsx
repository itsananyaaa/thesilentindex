"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import "leaflet/dist/leaflet.css";
import { CornerFiligree } from "@/components/ornament/CornerFiligree";
import { StatusBadge } from "@/components/StatusBadge";
import { MapPin, AlertCircle, Layers, Table as TableIcon, ChevronRight, X, ExternalLink } from "lucide-react";

export default function BlindSpotMapPage() {
  const [activeColId, setActiveColId] = useState<string>("sample-real-001");
  const [metric, setMetric] = useState<string>("record_count");
  const [mapData, setMapData] = useState<any>(null);
  const [selectedState, setSelectedState] = useState<any>(null);
  const [stateDetails, setStateDetails] = useState<any>(null);
  const [showTableAlt, setShowTableAlt] = useState<boolean>(false);
  const [loadingState, setLoadingState] = useState<boolean>(false);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const geoJsonLayerRef = useRef<any>(null);

  const [currentAuditId, setCurrentAuditId] = useState<string>("AUDIT-SAMPLE-REAL-001-INIT");

  useEffect(() => {
    const stored = localStorage.getItem("silence_index_active_collection");
    if (stored) setActiveColId(stored);

    const handleColChange = () => {
      const updated = localStorage.getItem("silence_index_active_collection");
      if (updated) setActiveColId(updated);
    };
    window.addEventListener("collection_changed", handleColChange);
    return () => window.removeEventListener("collection_changed", handleColChange);
  }, []);

  // Fetch map metrics from API
  useEffect(() => {
    fetch(`/api/collections/${activeColId}/summary`)
      .then((r) => r.json())
      .then((col) => {
        const auditId = col.latest_audit_id || `AUDIT-${activeColId.toUpperCase()}-INIT`;
        setCurrentAuditId(auditId);
        return fetch(`/api/audits/${auditId}/map?metric=${metric}`);
      })
      .then((r) => r.json())
      .then((d) => setMapData(d))
      .catch((e) => console.error(e));
  }, [activeColId, metric]);

  // Fetch state drill-down details when state is selected
  useEffect(() => {
    if (!selectedState) {
      setStateDetails(null);
      return;
    }
    setLoadingState(true);
    fetch(`/api/audits/${currentAuditId}/map/state/${encodeURIComponent(selectedState.code)}`)
      .then((r) => r.json())
      .then((d) => setStateDetails(d))
      .catch((e) => console.error(e))
      .finally(() => setLoadingState(false));
  }, [selectedState, currentAuditId]);

  // Helper function to calculate choropleth styles based on metric
  const getFeatureStyle = (stateInfo: any, currentMetric: string) => {
    if (!stateInfo) {
      return {
        fillColor: "#EDE0C4",
        fillOpacity: 0.8,
        color: "#B0673A",
        weight: 1,
        dashArray: "3 3",
        className: "leaflet-state-polygon cursor-pointer",
      };
    }

    if (currentMetric === "existence") {
      const ext = stateInfo.existence_count || 0;
      let fill = "#EDE0C4";
      if (ext > 10) fill = "#3F4220"; // Olive
      else if (ext > 4) fill = "#6B2F27"; // Henna
      else if (ext > 0) fill = "#C8A24A"; // Gold
      return {
        fillColor: fill,
        fillOpacity: 0.85,
        color: "#2E1013",
        weight: 1,
        dashArray: ext === 0 ? "3 3" : undefined,
        className: "leaflet-state-polygon cursor-pointer",
      };
    }

    if (currentMetric === "gap") {
      const gap = stateInfo.gap_score || 0;
      let fill = "#3F4220";
      if (gap > 6) fill = "#4A1C20"; // Severe Gap (Oxblood)
      else if (gap > 2) fill = "#B0673A"; // Moderate Gap (Copper)
      else if (gap > 0) fill = "#C8A24A"; // Mild Gap (Gold)
      return {
        fillColor: fill,
        fillOpacity: 0.85,
        color: "#2E1013",
        weight: 1,
        className: "leaflet-state-polygon cursor-pointer",
      };
    }

    if (currentMetric === "ccd") {
      const ccd = stateInfo.state_ccd !== null && stateInfo.state_ccd !== undefined ? stateInfo.state_ccd : 50;
      let fill = "#C8A24A";
      if (ccd > 50) fill = "#4A1C20"; // High Debt
      else if (ccd > 30) fill = "#B0673A"; // Medium Debt
      else fill = "#3F4220"; // Low Debt
      return {
        fillColor: fill,
        fillOpacity: 0.85,
        color: "#2E1013",
        weight: 1,
        className: "leaflet-state-polygon cursor-pointer",
      };
    }

    if (currentMetric === "composition") {
      const comp = stateInfo.composition_count || 0;
      let fill = "#EDE0C4";
      if (comp >= 3) fill = "#4A1C20"; // 3+ Layers
      else if (comp === 2) fill = "#B0673A"; // 2 Layers
      else if (comp === 1) fill = "#C8A24A"; // 1 Layer
      return {
        fillColor: fill,
        fillOpacity: 0.85,
        color: "#2E1013",
        weight: 1,
        dashArray: comp === 0 ? "3 3" : undefined,
        className: "leaflet-state-polygon cursor-pointer",
      };
    }

    // Default: record_count
    const count = stateInfo.record_count || 0;
    if (count === 0) {
      return {
        fillColor: "#EDE0C4",
        fillOpacity: 0.8,
        color: "#B0673A",
        weight: 1,
        dashArray: "3 3",
        className: "leaflet-state-polygon cursor-pointer",
      };
    }

    let fill = "#EDE0C4";
    if (count > 25) fill = "#4A1C20";
    else if (count > 12) fill = "#6B2F27";
    else if (count > 5) fill = "#B0673A";
    else fill = "#C8A24A";

    return {
      fillColor: fill,
      fillOpacity: 0.85,
      color: "#2E1013",
      weight: 1,
      className: "leaflet-state-polygon cursor-pointer",
    };
  };

  // Update styles reactively when metric changes
  useEffect(() => {
    if (!geoJsonLayerRef.current || !mapData) return;
    geoJsonLayerRef.current.eachLayer((layer: any) => {
      const code = layer.feature?.properties?.code;
      const stateInfo = mapData?.states?.find((s: any) => s.code === code);
      layer.setStyle(getFeatureStyle(stateInfo, metric));
    });
  }, [metric, mapData]);

  // Initialize Leaflet map safely on client side
  useEffect(() => {
    if (typeof window === "undefined" || !mapContainerRef.current) return;

    let isMounted = true;

    import("leaflet").then((L) => {
      if (!isMounted || !mapContainerRef.current) return;

      if (!leafletMapRef.current) {
        const map = L.map(mapContainerRef.current, {
          center: [22.8, 80.0],
          zoom: 4.5,
          minZoom: 3.5,
          maxZoom: 7,
          attributionControl: false,
          scrollWheelZoom: false,
        });
        leafletMapRef.current = map;
      }

      const map = leafletMapRef.current;

      fetch("/api/geo/states")
        .then((r) => r.json())
        .then((geoJson) => {
          if (!isMounted) return;

          // Remove prior layer if present
          if (geoJsonLayerRef.current) {
            map.removeLayer(geoJsonLayerRef.current);
          }

          const layer = L.geoJSON(geoJson, {
            style: (feature: any) => {
              const code = feature?.properties?.code;
              const stateInfo = mapData?.states?.find((s: any) => s.code === code);
              return getFeatureStyle(stateInfo, metric);
            },
            onEachFeature: (feature: any, layer: any) => {
              const code = feature?.properties?.code;
              const name = feature?.properties?.name;

              layer.on({
                click: () => {
                  const stateInfo = mapData?.states?.find((s: any) => s.code === code) || { code, name };
                  setSelectedState(stateInfo);
                },
                mouseover: () => {
                  layer.setStyle({ weight: 2.5, color: "#C8A24A" });
                },
                mouseout: () => {
                  const stateInfo = mapData?.states?.find((s: any) => s.code === code);
                  layer.setStyle(getFeatureStyle(stateInfo, metric));
                },
              });
            },
          }).addTo(map);

          try {
            map.fitBounds(layer.getBounds(), { padding: [20, 20] });
            setTimeout(() => map.invalidateSize(), 200);
          } catch (err) {
            console.error(err);
          }

          geoJsonLayerRef.current = layer;
        });
    });

    return () => {
      isMounted = false;
    };
  }, [mapData]);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-6 sm:py-8 space-y-6 w-full overflow-x-hidden">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-parchment-300">
        <div>
          <span className="font-serif text-xs font-bold uppercase tracking-widest text-copper-600 block mb-1">
            Cartographic Audit
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-oxblood-900">
            Regional Blind-Spot Map of India
          </h1>
          <p className="text-xs sm:text-sm text-oxblood-800/80 mt-1 max-w-3xl">
            Spatial distribution of catalogued cultural holdings across 28 States and 8 Union Territories.
            Highlighting geographic clustering and systemic documentation absences in institutional archives.
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowTableAlt(!showTableAlt)}
            className="px-3 py-1.5 bg-cream-100 hover:bg-cream-200 border border-parchment-400 text-oxblood-900 font-serif text-xs font-semibold rounded-xs shadow-2xs inline-flex items-center gap-1.5"
            aria-label="Toggle Accessible Table View"
          >
            <TableIcon size={14} className="text-gold-500" />
            <span>{showTableAlt ? "Show Map View" : "Accessible Table View"}</span>
          </button>
        </div>
      </div>

      {/* Metrics & Chips Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 sm:p-4 bg-cream-200/60 border border-parchment-300 rounded-sm">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
          <div className="px-2.5 py-1 bg-cream-100 border border-parchment-300 rounded-xs">
            <span className="text-oxblood-800/70">Documented States & UTs: </span>
            <strong className="text-oxblood-900">{mapData?.states_with_records_count || 0} / 36 <span className="text-[10px] font-normal text-oxblood-800/60">(28 States & 8 UTs)</span></strong>
          </div>
          <div className="px-2.5 py-1 bg-copper-500/10 border border-copper-500/40 rounded-xs text-copper-700">
            <span>None in analysed collection: </span>
            <strong>{mapData?.zero_states_count || 0} States & UTs</strong>
          </div>
          <div className="px-2.5 py-1 bg-oxblood-900 text-cream-100 rounded-xs">
            <span>Missing / Unassigned Geography: </span>
            <strong className="text-gold-400">{mapData?.missing_geo_records_count || 0} records</strong>
          </div>
        </div>

        {/* Metric Selector */}
        <div className="flex flex-wrap items-center gap-2 text-xs max-w-full">
          <label htmlFor="metric-select" className="font-sans font-medium text-oxblood-800 shrink-0">
            Choropleth Metric:
          </label>
          <select
            id="metric-select"
            value={metric}
            onChange={(e) => setMetric(e.target.value)}
            className="bg-cream-100 border border-parchment-400 rounded-xs px-2 py-1 text-xs font-sans text-oxblood-900 cursor-pointer max-w-[210px] sm:max-w-none truncate"
          >
            <option value="record_count">Record Density (Holding Count)</option>
            <option value="existence">Existence Depth (GI, UNESCO, ASI)</option>
            <option value="gap">Existence–Documentation Gap</option>
            <option value="ccd">Regional Coverage Debt (CCD)</option>
            <option value="composition">Multi-Source Composition</option>
          </select>
        </div>
      </div>

      {/* Main Map or Table Alternative */}
      {showTableAlt ? (
        /* Accessible Table Alternative */
        <div className="bg-cream-100 border border-parchment-300 rounded-sm shadow-xs overflow-x-auto">
          <table className="w-full text-left text-xs text-oxblood-900" aria-label="India States Documentation Table">
            <thead className="bg-oxblood-900 text-cream-100 font-serif text-[11px] uppercase tracking-wider">
              <tr>
                <th scope="col" className="p-3">State / Union Territory</th>
                <th scope="col" className="p-3">ISO Code</th>
                <th scope="col" className="p-3">Holdings Count</th>
                <th scope="col" className="p-3">Art Traditions</th>
                <th scope="col" className="p-3">Share of Collection</th>
                <th scope="col" className="p-3">Documentation Status</th>
                <th scope="col" className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-parchment-300 font-sans">
              {mapData?.states?.map((st: any) => (
                <tr key={st.code} className="hover:bg-cream-200/50">
                  <td className="p-3 font-serif font-bold text-oxblood-900">{st.name}</td>
                  <td className="p-3 font-mono text-oxblood-800/70">{st.code}</td>
                  <td className="p-3 font-bold">{st.record_count}</td>
                  <td className="p-3">{st.art_forms_count}</td>
                  <td className="p-3">{st.share_of_collection_pct}%</td>
                  <td className="p-3">
                    {st.is_zero_in_collection ? (
                      <span className="text-copper-600 italic">none in the analysed collection</span>
                    ) : (
                      <span className="text-olive-700 font-medium">Documented ({st.record_count} items)</span>
                    )}
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => setSelectedState(st)}
                      className="px-2 py-0.5 bg-gold-400 hover:bg-gold-300 text-oxblood-950 font-serif font-bold text-[11px] rounded-xs"
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* Interactive Map Container */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 bg-cream-100 border-2 border-gold-400/80 rounded-sm p-3 shadow-md flex flex-col justify-between overflow-hidden">
            <div className="relative w-full h-[540px] rounded-xs bg-[#EDE0C4]/30 overflow-hidden border border-parchment-300">
              <div ref={mapContainerRef} className="w-full h-full z-0" />

              {/* Map Legend Floating Box strictly inside the map viewport at top-3 left-3 */}
              <div className="absolute top-3 left-3 z-[1000] bg-cream-100/95 border border-parchment-400 p-2.5 rounded-xs shadow-md text-[11px] space-y-1.5 backdrop-blur-xs max-w-[240px]">
                <span className="font-serif font-bold text-[10px] uppercase tracking-wider block text-oxblood-900 border-b border-parchment-300 pb-1">
                  {metric === "existence"
                    ? "Existence Depth (GI & ASI)"
                    : metric === "gap"
                    ? "Documentation Gap Severity"
                    : metric === "ccd"
                    ? "Regional Debt Score (CCD)"
                    : metric === "composition"
                    ? "Multi-Source Composition"
                    : "Holdings Density Legend"}
                </span>

                {metric === "existence" ? (
                  <>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 bg-[#3F4220] border border-oxblood-900 shrink-0"></span>
                      <span>High Legal Presence (&gt; 10 items)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 bg-[#6B2F27] border border-oxblood-900 shrink-0"></span>
                      <span>Moderate Presence (4 - 10)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 bg-[#C8A24A] border border-oxblood-900 shrink-0"></span>
                      <span>Initial Presence (1 - 3)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 bg-[#EDE0C4] border border-copper-500 border-dashed shrink-0"></span>
                      <span className="italic text-copper-700">None in official registries</span>
                    </div>
                  </>
                ) : metric === "gap" ? (
                  <>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 bg-[#4A1C20] border border-oxblood-900 shrink-0"></span>
                      <span>Severe Gap (Proven legal existence, sparse records)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 bg-[#B0673A] border border-oxblood-900 shrink-0"></span>
                      <span>Moderate Documentation Gap</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 bg-[#3F4220] border border-oxblood-900 shrink-0"></span>
                      <span>Balanced / Well Documented</span>
                    </div>
                  </>
                ) : metric === "ccd" ? (
                  <>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 bg-[#4A1C20] border border-oxblood-900 shrink-0"></span>
                      <span>High Coverage Debt (CCD &gt; 50)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 bg-[#B0673A] border border-oxblood-900 shrink-0"></span>
                      <span>Moderate Coverage Debt (30 - 50)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 bg-[#3F4220] border border-oxblood-900 shrink-0"></span>
                      <span>Low Coverage Debt (CCD &lt; 30)</span>
                    </div>
                  </>
                ) : metric === "composition" ? (
                  <>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 bg-[#4A1C20] border border-oxblood-900 shrink-0"></span>
                      <span>Multi-Layer Fused (3+ Layers)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 bg-[#B0673A] border border-oxblood-900 shrink-0"></span>
                      <span>Dual Layer (2 Layers)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 bg-[#C8A24A] border border-oxblood-900 shrink-0"></span>
                      <span>Single Layer (1 Layer)</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 bg-[#4A1C20] border border-oxblood-900 shrink-0"></span>
                      <span>High Density (&gt; 25 records)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 bg-[#6B2F27] border border-oxblood-900 shrink-0"></span>
                      <span>Medium Density (12 - 25 records)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 bg-[#C8A24A] border border-oxblood-900 shrink-0"></span>
                      <span>Low Density (1 - 12 records)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 bg-[#EDE0C4] border border-copper-500 border-dashed shrink-0"></span>
                      <span className="italic text-copper-700">None in analysed collection</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Small Territory Direct Targeting Chips (Hardening for small UTs difficult to target via national polygon) */}
            <div className="mt-3 pt-2.5 border-t border-parchment-300">
              <span className="text-[10px] font-sans uppercase tracking-wider text-copper-600 block mb-1.5 font-bold">
                Small Territory Direct Targeting Chips:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { code: "IN-LD", name: "Lakshadweep", short: "LD" },
                  { code: "IN-CH", name: "Chandigarh", short: "CH" },
                  { code: "IN-PY", name: "Puducherry", short: "PY" },
                  { code: "IN-AN", name: "Andaman and Nicobar Islands", short: "AN" },
                  { code: "IN-DN", name: "Dadra and Nagar Haveli and Daman and Diu", short: "DN" },
                  { code: "IN-LA", name: "Ladakh", short: "LA" },
                  { code: "IN-DL", name: "Delhi", short: "DL" }
                ].map((ut) => {
                  const isSel = selectedState?.code === ut.code;
                  return (
                    <button
                      key={ut.code}
                      onClick={() => setSelectedState({ code: ut.code, name: ut.name })}
                      className={`px-2 py-1 rounded-xs font-serif text-[11px] font-semibold border transition-all ${
                        isSel
                          ? "bg-oxblood-900 text-cream-100 border-gold-400 shadow-xs"
                          : "bg-cream-100 hover:bg-cream-200 border-parchment-400 text-oxblood-900"
                      }`}
                    >
                      <span>{ut.name.split(" ")[0]}</span>
                      <span className="text-[9px] font-mono ml-1 opacity-70">({ut.short})</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: State Side Panel Drill-Down */}
          <div className="lg:col-span-4 bg-cream-200/60 border border-parchment-300 rounded-sm p-5 shadow-xs flex flex-col justify-between">
            {selectedState ? (
              <div className="space-y-4">
                <div className="flex items-start justify-between pb-3 border-b border-parchment-300">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-copper-600 block">
                      {selectedState.code} • {stateDetails?.type || "Region"}
                    </span>
                    <h3 className="font-serif text-xl font-bold text-oxblood-900">
                      {selectedState.name}
                    </h3>
                  </div>
                  <button
                    onClick={() => setSelectedState(null)}
                    className="p-1 text-oxblood-800 hover:text-oxblood-950"
                  >
                    <X size={16} />
                  </button>
                </div>

                {loadingState ? (
                  <div className="py-8 text-center text-xs text-oxblood-800">Loading regional details...</div>
                ) : stateDetails?.is_zero_in_collection ? (
                  <div className="p-4 bg-copper-500/10 border border-copper-500/40 rounded-xs space-y-2">
                    <span className="font-serif font-bold text-sm text-copper-800 block">
                      No Records in Analysed Collection
                    </span>
                    <p className="text-xs text-oxblood-800/80 leading-relaxed">
                      This institutional holding does not contain catalogued items attributed to {selectedState.name}.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 bg-cream-100 rounded-xs border border-parchment-300">
                        <span className="text-[10px] text-oxblood-800/70 block uppercase">Catalog Items</span>
                        <span className="font-serif text-lg font-bold text-oxblood-900">{stateDetails?.total_records}</span>
                      </div>
                      <div className="p-2.5 bg-cream-100 rounded-xs border border-parchment-300">
                        <span className="text-[10px] text-oxblood-800/70 block uppercase">Art Traditions</span>
                        <span className="font-serif text-lg font-bold text-oxblood-900">{stateDetails?.art_forms?.length || 0}</span>
                      </div>
                    </div>

                    {/* Traditions List */}
                    <div>
                      <span className="text-[11px] font-serif font-bold text-oxblood-900 block mb-1">
                        Represented Art Traditions:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {stateDetails?.art_forms?.map((af: string) => (
                          <span key={af} className="px-2 py-0.5 bg-cream-100 border border-parchment-300 rounded-xs text-[10px] text-oxblood-900">
                            {af}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Sample Records */}
                    <div>
                      <span className="text-[11px] font-serif font-bold text-oxblood-900 block mb-1">
                        Catalog Holdings Preview:
                      </span>
                      <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
                        {stateDetails?.sample_records?.map((r: any) => (
                          <Link
                            key={r.id}
                            href={`/records/${r.id}`}
                            className="p-2 bg-cream-100 border border-parchment-300 rounded-xs flex items-center justify-between text-xs hover:border-gold-400 group"
                          >
                            <span className="truncate max-w-[200px]" title={r.title}>{r.title}</span>
                            <ChevronRight size={12} className="text-gold-500 group-hover:translate-x-0.5 transition-transform" />
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-16 text-center text-xs text-oxblood-800/70 space-y-2">
                <MapPin size={24} className="mx-auto text-gold-500" />
                <p>Click any state or territory on the map to inspect regional holdings and documentation gaps.</p>
              </div>
            )}

            {/* Standing Caveat */}
            <div className="mt-6 pt-3 border-t border-parchment-300 text-[10px] text-henna-700 font-sans italic leading-tight">
              <strong>Mandatory Caveat:</strong> Absence of a record is never proof that a tradition, region or community has less heritage. Low counts describe the analysed collection, not the region.
            </div>
          </div>
        </div>
      )}

      {/* Cartographic Boundary Disclaimer */}
      <div className="p-3 bg-cream-200/40 border border-parchment-300 rounded-xs text-[11px] text-oxblood-800/70 font-sans flex items-start gap-2">
        <AlertCircle size={14} className="text-copper-600 shrink-0 mt-0.5" />
        <p>
          <strong>Official Boundary Notice:</strong> State boundaries reflect the official demarcations of the Republic of India,
          including the Union Territories of Jammu & Kashmir and Ladakh, and the State of Arunachal Pradesh.
        </p>
      </div>
    </div>
  );
}
