import React from "react";

interface CornerFiligreeProps {
  className?: string;
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  color?: string;
  size?: number;
}

export const CornerFiligree: React.FC<CornerFiligreeProps> = ({
  className = "",
  position = "top-left",
  color = "#C8A24A", // Antique gold
  size = 36,
}) => {
  const rotation = {
    "top-left": "rotate(0)",
    "top-right": "rotate(90)",
    "bottom-right": "rotate(180)",
    "bottom-left": "rotate(270)",
  }[position];

  return (
    <div
      className={`pointer-events-none select-none ${className}`}
      style={{
        width: size,
        height: size,
        transform: rotation,
        transformOrigin: "center",
      }}
      aria-hidden="true"
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer corner bracket */}
        <path
          d="M2 18V6C2 3.79086 3.79086 2 6 2H18"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        {/* Delicate floral scroll */}
        <path
          d="M6 14C6 9.58172 9.58172 6 14 6H18"
          stroke={color}
          strokeWidth="1"
          strokeOpacity="0.8"
        />
        <circle cx="14" cy="14" r="2.5" fill={color} fillOpacity="0.85" />
        <path
          d="M14 6C18 6 22 10 22 14C22 18 18 22 14 22C10 22 6 18 6 14"
          stroke={color}
          strokeWidth="0.75"
          strokeDasharray="2 2"
          strokeOpacity="0.6"
        />
        <path
          d="M2 28C2 22 8 16 16 16C22 16 28 22 28 28"
          stroke={color}
          strokeWidth="0.75"
          strokeOpacity="0.4"
        />
      </svg>
    </div>
  );
};

