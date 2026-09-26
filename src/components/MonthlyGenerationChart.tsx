import * as React from "react";
import { Info, BarChart3, Sun, CloudRain } from "lucide-react";
import { CITY_SOLAR_METEOROLOGY, type CitySolarYieldProfile } from "@/config/regulatory";

export interface MonthlyGenerationChartProps {
  systemKw?: number;
  initialCity?: string;
  className?: string;
}

export function MonthlyGenerationChart({
  systemKw = 5.5,
  initialCity = "hyderabad",
  className = "",
}: MonthlyGenerationChartProps) {
  const [selectedCityKey, setSelectedCityKey] = React.useState(initialCity);
  const [activeMonthIdx, setActiveMonthIdx] = React.useState<number | null>(null);

  const cityProfile: CitySolarYieldProfile =
    CITY_SOLAR_METEOROLOGY[selectedCityKey] || CITY_SOLAR_METEOROLOGY.hyderabad;

  const monthlyData = React.useMemo(() => {
    return cityProfile.monthlyYield.map((m, idx) => {
      const kwh = Math.round(m.yieldKwh * systemKw);
      const days = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][idx];
      const dailyKwh = Number((kwh / days).toFixed(1));
      return {
        month: m.month,
        yieldKwhPerKw: m.yieldKwh,
        totalKwh: kwh,
        dailyKwh,
        isMonsoon: idx >= 5 && idx <= 7, // Jun, Jul, Aug
        isPeak: idx >= 2 && idx <= 4, // Mar, Apr, May
      };
    });
  }, [cityProfile, systemKw]);

  const maxKwh = Math.max(...monthlyData.map((d) => d.totalKwh), 1);
  const annualTotalKwh = Math.round(cityProfile.annualKwhPerKw * systemKw);
  const monthlyAvgKwh = Math.round(annualTotalKwh / 12);

  const activeItem = activeMonthIdx !== null ? monthlyData[activeMonthIdx] : monthlyData[4]; // Default to May or hovered

  return (
    <div
      className={`rounded-[8px] border border-[#E3E4E6] bg-[#FFFFFF] overflow-hidden shadow-xs ${className}`}
    >
      {/* Header and City Selector */}
      <div className="p-5 border-b border-[#E3E4E6] flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#F4F4F4]/50">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[12px] font-semibold uppercase tracking-wider text-[#92400E] bg-[#FEF3C7] px-2 py-0.5 rounded-[3px]">
              NASA POWER &amp; NREL PVWatts v8
            </span>
            <span className="text-[12px] text-[#5C5E62]">
              {cityProfile.optimalTiltDeg}° Latitude Tilt
            </span>
          </div>
          <h3 className="text-[16px] sm:text-[18px] font-medium text-[#171A20] leading-snug">
            Monthly Solar Generation Profile ({systemKw} kW System)
          </h3>
          <p className="text-[12px] text-[#5C5E62] mt-0.5">
            Sourced meteorological irradiance accounting for local seasonal cloud cover &amp;
            monsoon cycles.
          </p>
        </div>

        {/* City Switcher */}
        <div
          role="radiogroup"
          aria-label="City solar yield profile"
          className="flex items-center gap-1.5 self-start sm:self-auto bg-[#FFFFFF] border border-[#E3E4E6] p-1 rounded-[6px]"
        >
          {Object.entries(CITY_SOLAR_METEOROLOGY).map(([key, prof]) => {
            const isSelected = key === selectedCityKey;
            return (
              <button
                key={key}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => setSelectedCityKey(key)}
                className={`px-2.5 py-1 text-[12px] font-medium rounded-[4px] transition-colors cursor-pointer ${
                  isSelected
                    ? "bg-[#171A20] text-[#FFFFFF]"
                    : "text-[#5C5E62] hover:text-[#171A20] hover:bg-[#F4F4F4]"
                }`}
              >
                {prof.city}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Stats Display */}
      <div className="p-5 border-b border-[#E3E4E6] grid grid-cols-2 sm:grid-cols-4 gap-4 bg-[#FFFFFF]">
        <div>
          <span className="text-[12px] text-[#5C5E62] uppercase tracking-wider block">
            Annual Generation
          </span>
          <span className="text-[20px] sm:text-[24px] font-medium text-[#171A20] tabular-nums">
            {annualTotalKwh.toLocaleString("en-IN")} kWh
          </span>
        </div>
        <div>
          <span className="text-[12px] text-[#5C5E62] uppercase tracking-wider block">
            Monthly Average
          </span>
          <span className="text-[20px] sm:text-[24px] font-medium text-[#171A20] tabular-nums">
            {monthlyAvgKwh.toLocaleString("en-IN")} kWh
          </span>
        </div>
        <div>
          <span className="text-[12px] text-[#5C5E62] uppercase tracking-wider block">
            {activeItem?.month} Total
          </span>
          <span className="text-[20px] sm:text-[24px] font-medium text-[#171A20] tabular-nums">
            {activeItem?.totalKwh.toLocaleString("en-IN")} kWh
          </span>
        </div>
        <div>
          <span className="text-[12px] text-[#5C5E62] uppercase tracking-wider block">
            Daily Average ({activeItem?.month})
          </span>
          <span className="text-[20px] sm:text-[24px] font-medium text-[#F57C00] tabular-nums">
            {activeItem?.dailyKwh} kWh / day
          </span>
        </div>
      </div>

      {/* Bar Chart Visualization */}
      <div className="p-5 sm:p-6 space-y-4">
        <div className="h-44 sm:h-52 w-full flex items-end gap-1.5 sm:gap-3 pt-6 pb-2 px-1">
          {monthlyData.map((d, idx) => {
            const heightPercent = Math.max(12, Math.round((d.totalKwh / maxKwh) * 100));
            const isHovered = activeMonthIdx === idx;
            return (
              <div
                key={d.month}
                onMouseEnter={() => setActiveMonthIdx(idx)}
                onFocus={() => setActiveMonthIdx(idx)}
                tabIndex={0}
                role="button"
                aria-label={`${d.month}: ${d.totalKwh} kWh (${d.dailyKwh} kWh/day)`}
                className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer focus-visible:outline-none"
              >
                {/* Tooltip on active */}
                <div
                  className={`text-[12px] font-mono text-[#171A20] mb-1 tabular-nums transition-opacity ${
                    isHovered ? "opacity-100 font-semibold" : "opacity-0 group-hover:opacity-100"
                  }`}
                >
                  {d.totalKwh}
                </div>

                {/* Vertical Bar */}
                <div
                  style={{ height: `${heightPercent}%` }}
                  className={`w-full rounded-t-[3px] transition-all duration-200 ${
                    isHovered
                      ? "bg-[#171A20]"
                      : d.isMonsoon
                        ? "bg-[#5C5E62]/40 group-hover:bg-[#5C5E62]"
                        : d.isPeak
                          ? "bg-[#F57C00] group-hover:bg-[#D97706]"
                          : "bg-[#171A20]/80 group-hover:bg-[#171A20]"
                  }`}
                />

                {/* Month Label */}
                <div
                  className={`text-[12px] mt-2 font-medium transition-colors ${
                    isHovered ? "text-[#171A20] font-bold" : "text-[#5C5E62]"
                  }`}
                >
                  {d.month}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend and Honest Meteorological Note */}
        <div className="pt-3 border-t border-[#E3E4E6] flex flex-wrap items-center justify-between gap-3 text-[12px] text-[#5C5E62]">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-[2px] bg-[#F57C00]" />
              <span className="flex items-center gap-1">
                <Sun className="w-3 h-3 text-[#F57C00]" /> Pre-Monsoon Peak (Mar–May)
              </span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-[2px] bg-[#5C5E62]/40" />
              <span className="flex items-center gap-1">
                <CloudRain className="w-3 h-3 text-[#5C5E62]" /> Monsoon Low (Jun–Aug)
              </span>
            </span>
          </div>

          <a
            href={cityProfile.source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#171A20] underline inline-flex items-center gap-1"
          >
            <Info className="w-3 h-3" />
            <span>Source: NASA POWER Meteorological SSE Release 8</span>
          </a>
        </div>
      </div>
    </div>
  );
}
