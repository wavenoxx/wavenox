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
  const gridCols =
    count === 2
      ? "grid-cols-2 gap-x-4 gap-y-2 max-w-[290px] sm:max-w-[380px]"
      : count === 3
        ? "grid-cols-3 gap-x-1.5 sm:gap-x-4 gap-y-2 max-w-[360px] sm:max-w-[460px]"
        : "grid-cols-2 gap-x-4 gap-y-2 max-w-[340px]";

  return (
    <div
      className={`w-full grid ${gridCols} md:max-w-none md:flex md:w-auto md:flex-nowrap md:items-baseline md:gap-12 lg:gap-16 mx-auto ${
        isCenter ? "justify-center text-center" : "justify-start text-left"
      } ${className}`}
    >
      {stats.map((stat, idx) => (
        <div
          key={idx}
          data-testid="hero-stat"
          className="stat-item flex flex-col items-center md:items-start text-center md:text-left px-0.5 sm:px-1 min-w-0"
        >
          <span className="text-[18px] min-[375px]:text-[20px] sm:text-[25px] md:text-[30px] lg:text-[32px] font-medium tracking-[-0.02em] leading-[1.1] tabular-nums whitespace-nowrap text-inherit">
            {stat.value}
          </span>
          <span className="text-[12px] font-medium leading-[1.2] tracking-[0.03em] sm:tracking-[0.06em] uppercase text-inherit/85 mt-1 text-balance">
            {stat.label}
          </span>
          {stat.sublabel && (
            <span className="text-[12px] font-normal leading-[1.25] text-inherit/70 mt-0.5">
              {stat.sublabel}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
