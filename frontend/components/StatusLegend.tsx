import React from "react";
import { STATUS_STYLES, PROVENANCE_BADGES } from "@/lib/tokens";
import { StatusBadge } from "./StatusBadge";

export const StatusLegend: React.FC<{ compact?: boolean; className?: string }> = ({
  compact = false,
  className = "",
}) => {
  return (
    <div
      className={`bg-cream-100/90 border border-parchment-300 rounded-sm p-3 shadow-xs text-xs ${className}`}
      role="region"
      aria-label="Documentation Status & Provenance Legend"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Absence Model States */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-serif font-bold text-oxblood-900 uppercase tracking-wider text-[11px] mr-1">
            Status:
          </span>
          {Object.keys(STATUS_STYLES).map((key) => (
            <StatusBadge key={key} status={key} size="sm" />
          ))}
        </div>

        {/* Provenance Indicators */}
        <div className="flex flex-wrap items-center gap-2 border-t sm:border-t-0 sm:border-l border-parchment-300 pt-2 sm:pt-0 sm:pl-4">
          <span className="font-serif font-bold text-oxblood-900 uppercase tracking-wider text-[11px] mr-1">
            Provenance:
          </span>
          {Object.entries(PROVENANCE_BADGES).map(([key, item]) => (
            <span
              key={key}
              className={`px-1.5 py-0.5 rounded-xs font-mono text-[10px] font-semibold border ${item.bg}`}
              title={item.description}
            >
              {item.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

