import * as React from "react";

export interface StatItem {
  value: string;
  label: string;
  sublabel?: string;
}

export interface StatRowProps {
  stats: StatItem[];
  align?: "center" | "start";
  className?: string;
}

export function StatRow({ stats, align = "center", className = "" }: StatRowProps) {
  const isCenter = align === "center";
  const count = stats.length;
  const gridCols = count === 2 ? "grid-cols-2 max-w-xs" : count === 3 ? "grid-cols-3 max-w-sm sm:max-w-md" : "grid-cols-2 max-w-sm";

  return (
    <div
      className={`w-full grid ${gridCols} gap-2 sm:gap-6 md:flex md:w-auto md:flex-wrap md:items-baseline md:gap-14 mx-auto ${
        isCenter ? "justify-center text-center" : "justify-start text-left"
      } ${className}`}
    >
      {stats.map((stat, idx) => (
        <div key={idx} className="flex flex-col items-center md:items-start text-center md:text-left px-1">
          <span className="text-[19px] sm:text-[26px] md:text-[34px] font-semibold tracking-tight leading-tight tabular-nums text-inherit drop-shadow-[0_1px_6px_rgba(0,0,0,0.7)]">
            {stat.value}
          </span>
          <span className="text-[10px] sm:text-[11px] md:text-[12px] font-medium leading-tight tracking-[0.06em] uppercase text-inherit/80 mt-1 drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)]">
            {stat.label}
          </span>
          {stat.sublabel && (
            <span className="text-[10px] sm:text-[11px] font-normal text-inherit/60 mt-0.5">
              {stat.sublabel}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
