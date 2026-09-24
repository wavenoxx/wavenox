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
  const alignClass = align === "center" ? "justify-center text-center" : "justify-start text-left";

  return (
    <div className={`flex flex-wrap items-baseline gap-8 md:gap-14 ${alignClass} ${className}`}>
      {stats.map((stat, idx) => (
        <div key={idx} className="flex flex-col min-w-[90px]">
          <span className="text-[26px] sm:text-[30px] md:text-[36px] font-semibold tracking-tight leading-tight tabular-nums text-inherit">
            {stat.value}
          </span>
          <span className="text-[12px] md:text-[13px] font-normal leading-snug tracking-normal text-inherit/80 mt-1">
            {stat.label}
          </span>
          {stat.sublabel && (
            <span className="text-[12px] font-normal text-inherit/60 mt-0.5">
              {stat.sublabel}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
