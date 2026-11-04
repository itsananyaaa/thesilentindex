import React from "react";

interface JaliLatticeProps {
  className?: string;
  color?: string;
  opacity?: number;
}

export const JaliLattice: React.FC<JaliLatticeProps> = ({
  className = "",
  color = "#C8A24A",
  opacity = 0.15,
}) => {
  return (
    <div className={`overflow-hidden pointer-events-none select-none ${className}`} aria-hidden="true">
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern
            id="jali-pattern"
            width="32"
            height="32"
            patternUnits="userSpaceOnUse"
          >
            {/* Diamond octagon lattice reminiscent of Fatehpur Sikri / Red Fort jali screens */}
            <path
              d="M16 0 L32 16 L16 32 L0 16 Z"
              fill="none"
              stroke={color}
              strokeWidth="0.8"
              strokeOpacity={opacity}
            />
            <circle
              cx="16"
              cy="16"
              r="4"
              fill="none"
              stroke={color}
              strokeWidth="0.8"
              strokeOpacity={opacity}
            />
            <circle
              cx="0"
              cy="0"
              r="2"
              fill={color}
              fillOpacity={opacity * 0.8}
            />
            <circle
              cx="32"
              cy="0"
              r="2"
              fill={color}
              fillOpacity={opacity * 0.8}
            />
            <circle
              cx="0"
              cy="32"
              r="2"
              fill={color}
              fillOpacity={opacity * 0.8}
            />
            <circle
              cx="32"
              cy="32"
              r="2"
              fill={color}
              fillOpacity={opacity * 0.8}
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#jali-pattern)" />
      </svg>
    </div>
  );
};

