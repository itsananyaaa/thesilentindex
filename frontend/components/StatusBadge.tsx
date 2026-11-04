import React from "react";
import { STATUS_STYLES } from "@/lib/tokens";

interface StatusBadgeProps {
  status: string;
  size?: "sm" | "md" | "lg";
  showDescription?: boolean;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = "md",
  showDescription = false,
  className = "",
}) => {
  const style = STATUS_STYLES[status] || STATUS_STYLES["Not assessable"];

  const sizeClasses = {
    sm: "px-1.5 py-0.5 text-[10px]",
    md: "px-2.5 py-1 text-xs",
    lg: "px-3 py-1.5 text-sm font-medium",
  }[size];

  // Specific pattern decorations to ensure meaning survives greyscale/colorblindness
  const patternIndicator = () => {
    switch (style.pattern) {
      case "solid-olive":
        return <span className="inline-block w-2 h-2 rounded-full bg-cream-100 mr-1.5 shadow-sm" aria-hidden="true" />;
      case "diagonal-stripe":
        return (
          <span
            className="inline-block w-2.5 h-2.5 mr-1.5 border border-oxblood-900/60"
            style={{
              backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 2px, #2E1013 2px, #2E1013 4px)"
            }}
            aria-hidden="true"
          />
        );
      case "copper-hatch":
        return (
          <span
            className="inline-block w-2.5 h-2.5 mr-1.5 border border-copper-600"
            style={{
              backgroundImage: "repeating-linear-gradient(-45deg, transparent, transparent 2px, #B0673A 2px, #B0673A 4px)"
            }}
            aria-hidden="true"
          />
        );
      case "dotted-grey":
        return <span className="inline-block w-2 h-2 border-2 border-dotted border-oxblood-800 mr-1.5" aria-hidden="true" />;
      case "blank-dash":
        return <span className="inline-block mr-1 text-neutral-400 font-mono">—</span>;
      default:
        return null;
    }
  };

  return (
    <span
      className={`inline-flex items-center border font-sans font-medium rounded-sm tracking-wide ${sizeClasses} ${style.bg} ${style.border} ${style.text} ${className}`}
      title={style.description}
    >
      {patternIndicator()}
      <span>{style.label}</span>
    </span>
  );
};

