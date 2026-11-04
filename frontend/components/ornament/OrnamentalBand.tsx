import React from "react";

interface OrnamentalBandProps {
  className?: string;
  title?: string;
  color?: string;
}

export const OrnamentalBand: React.FC<OrnamentalBandProps> = ({
  className = "",
  title,
  color = "#C8A24A",
}) => {
  return (
    <div className={`flex items-center justify-center gap-4 my-6 ${className}`} aria-hidden="true">
      {/* Left rule with finial */}
      <div className="flex-1 flex items-center">
        <div className="w-1.5 h-1.5 rotate-45" style={{ backgroundColor: color }} />
        <div className="h-[1px] flex-1" style={{ backgroundColor: color, opacity: 0.6 }} />
      </div>

      {/* Central motif */}
      <div className="flex items-center gap-2 px-2">
        <div className="w-2 h-2 rotate-45 border" style={{ borderColor: color }} />
        {title ? (
          <span className="font-serif tracking-widest uppercase text-xs font-semibold px-2" style={{ color }}>
            {title}
          </span>
        ) : (
          <div className="w-3 h-3 rotate-45" style={{ backgroundColor: color, opacity: 0.8 }} />
        )}
        <div className="w-2 h-2 rotate-45 border" style={{ borderColor: color }} />
      </div>

      {/* Right rule with finial */}
      <div className="flex-1 flex items-center">
        <div className="h-[1px] flex-1" style={{ backgroundColor: color, opacity: 0.6 }} />
        <div className="w-1.5 h-1.5 rotate-45" style={{ backgroundColor: color }} />
      </div>
    </div>
  );
};

