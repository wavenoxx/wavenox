import * as React from "react";
import { TrendingUp } from "lucide-react";
import { project25Years, type YearProjectionPoint } from "@/config/solar";

interface WealthCurveVisualizerProps {
  annualBillInr: number;
  annualSavingsInr: number;
  netInvestmentInr: number;
  paybackYears: number;
  tariffPerKwh: number;
  annualGenKwh?: number;
}

function formatInr(val: number): string {
  const isNeg = val < 0;
  const abs = Math.abs(val);
  let formatted = "";

  if (abs >= 10000000) {
    formatted = `₹${(abs / 10000000).toFixed(2)} Cr`;
  } else if (abs >= 100000) {
    formatted = `₹${(abs / 100000).toFixed(1)} L`;
  } else {
    formatted = `₹${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(abs)}`;
  }

  return isNeg ? `-${formatted}` : formatted;
}

export function WealthCurveVisualizer({
  annualBillInr,
  annualSavingsInr,
  netInvestmentInr,
  paybackYears,
  tariffPerKwh,
  annualGenKwh,
}: WealthCurveVisualizerProps) {
  const [hoveredYear, setHoveredYear] = React.useState<number>(25);

  // Compute 25-year series data using the single unified project25Years engine
  const dataPoints: YearProjectionPoint[] = React.useMemo(() => {
    return project25Years({
      annualBillInr,
      annualSavingsInr,
      annualGenKwh: annualGenKwh || (tariffPerKwh > 0 ? annualSavingsInr / tariffPerKwh : 10000),
      netInvestmentInr,
      tariffPerKwh,
    });
  }, [annualBillInr, annualSavingsInr, annualGenKwh, netInvestmentInr, tariffPerKwh]);

  const activePoint = dataPoints.find((p) => p.year === hoveredYear) || dataPoints[24];

  // Min and Max values for Y-axis (including negative investment dip)
  const minVal = Math.min(-netInvestmentInr, ...dataPoints.map((p) => p.netCumulativeCashflow), 0);
  const maxSpend = dataPoints[24].cumSpendWithoutSolar;
  const maxWealth = Math.max(...dataPoints.map((p) => p.netCumulativeCashflow));
  const maxVal = Math.max(maxSpend, maxWealth, 100000) * 1.05;

  // SVG dimensions
  const width = 640;
  const height = 260;
  const paddingX = 44;
  const paddingTop = 32;
  const paddingBottom = 40;

  const getX = (year: number) => paddingX + ((year - 1) / 24) * (width - 2 * paddingX);
  const getY = (val: number) => {
    const range = maxVal - minVal;
    if (range <= 0) return height / 2;
    const ratio = (val - minVal) / range;
    return height - paddingBottom - ratio * (height - paddingTop - paddingBottom);
  };

  const zeroY = getY(0);

  // Generate SVG path for spend without solar
  const spendPath = dataPoints
    .map((p, idx) => `${idx === 0 ? "M" : "L"} ${getX(p.year)} ${getY(p.cumSpendWithoutSolar)}`)
    .join(" ");

  // Generate SVG path for cumulative cashflow (showing negative dip and growth)
  const cashflowPath = dataPoints
    .map((p, idx) => `${idx === 0 ? "M" : "L"} ${getX(p.year)} ${getY(p.netCumulativeCashflow)}`)
    .join(" ");

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      setHoveredYear((prev) => Math.max(1, prev - 1));
    } else if (e.key === "ArrowRight") {
      setHoveredYear((prev) => Math.min(25, prev + 1));
    }
  };

  return (
    <div
      tabIndex={0}
      onKeyDown={handleKeyDown}
      role="region"
      aria-label="25-Year Financial Projection Chart. Use arrow keys to scrub through years."
      className="w-full p-5 sm:p-6 rounded-[8px] bg-[#16181D] border border-[#23272F] text-[#FFFFFF] shadow-sm space-y-5 focus:outline-none focus:ring-1 focus:ring-[#F57C00]"
    >
      {/* Title & Active Metric Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#23272F] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#F57C00]" />
            <h4 className="text-[13px] font-medium tracking-wider uppercase text-[#E5E7EB]">
              25-Year Cumulative Cash Flow
            </h4>
          </div>
          <p className="text-[11px] text-[#9CA3AF] mt-0.5">
            Sourced TGERC tariff escalation (3.0% YoY) vs. Monolithic solar asset
          </p>
        </div>

        {/* Dynamic Scrub Metric */}
        <div className="flex items-center gap-4 bg-[#111215] px-3.5 py-2 rounded-[4px] border border-[#2C323C] self-start sm:self-auto font-mono text-[12px]">
          <div>
            <span className="text-[#9CA3AF] text-[10px] uppercase">Year {activePoint.year}</span>
            <div
              className={`font-semibold text-[14px] ${
                activePoint.netCumulativeCashflow >= 0 ? "text-[#FFFFFF]" : "text-[#9CA3AF]"
              }`}
            >
              {activePoint.netCumulativeCashflow >= 0
                ? `+${formatInr(activePoint.netCumulativeCashflow)}`
                : formatInr(activePoint.netCumulativeCashflow)}
            </div>
          </div>
          <div className="border-l border-[#2C323C] pl-3">
            <span className="text-[#9CA3AF] text-[10px] uppercase">Spent without solar</span>
            <div className="font-semibold text-[#8C8E93] text-[13px]">
              {formatInr(activePoint.cumSpendWithoutSolar)}
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Vector Chart */}
      <div className="relative w-full overflow-hidden select-none">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible cursor-crosshair"
          onTouchMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const touch = e.touches[0];
            const relX = touch.clientX - rect.left;
            const pct = Math.max(0, Math.min(1, (relX - paddingX) / (rect.width - 2 * paddingX)));
            const yr = Math.max(1, Math.min(25, Math.round(1 + pct * 24)));
            setHoveredYear(yr);
          }}
        >
          {/* Zero baseline (₹0 Crossover Line) */}
          <line
            x1={paddingX}
            y1={zeroY}
            x2={width - paddingX}
            y2={zeroY}
            stroke="#343A46"
            strokeWidth="1"
          />
          <text
            x={paddingX - 6}
            y={zeroY + 3}
            fill="#6B7280"
            fontSize="9"
            fontFamily="monospace"
            textAnchor="end"
          >
            ₹0
          </text>

          {/* Upper Reference Grid Line */}
          <line
            x1={paddingX}
            y1={getY(maxVal * 0.5)}
            x2={width - paddingX}
            y2={getY(maxVal * 0.5)}
            stroke="#23272F"
            strokeDasharray="4 4"
            strokeWidth="1"
          />
          <text
            x={paddingX - 6}
            y={getY(maxVal * 0.5) + 3}
            fill="#4B5563"
            fontSize="9"
            fontFamily="monospace"
            textAnchor="end"
          >
            {formatInr(maxVal * 0.5)}
          </text>

          {/* Spend Without Solar Curve (Muted dashed line) */}
          <path
            d={spendPath}
            fill="none"
            stroke="#6B7280"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            opacity="0.8"
          />

          {/* Cumulative Net Cashflow Curve (Solid crisp white line) */}
          <path d={cashflowPath} fill="none" stroke="#FFFFFF" strokeWidth="2.2" />

          {/* Payback crossover line */}
          {paybackYears > 0 && paybackYears <= 25 && (
            <g>
              <line
                x1={getX(paybackYears)}
                y1={paddingTop}
                x2={getX(paybackYears)}
                y2={height - paddingBottom}
                stroke="#F57C00"
                strokeDasharray="3 3"
                strokeWidth="1.2"
                opacity="0.8"
              />
              <text
                x={getX(paybackYears)}
                y={paddingTop - 10}
                fill="#F57C00"
                fontSize="10"
                fontFamily="monospace"
                fontWeight="bold"
                textAnchor="middle"
              >
                Payback {paybackYears}y
              </text>
            </g>
          )}

          {/* Active Hover Marker on Net Cashflow */}
          <circle
            cx={getX(activePoint.year)}
            cy={getY(activePoint.netCumulativeCashflow)}
            r="4.5"
            fill="#F57C00"
            stroke="#FFFFFF"
            strokeWidth="2"
          />
          {/* Active Hover Marker on Spend Without Solar */}
          <circle
            cx={getX(activePoint.year)}
            cy={getY(activePoint.cumSpendWithoutSolar)}
            r="3.5"
            fill="#6B7280"
            stroke="#16181D"
            strokeWidth="1.5"
          />

          {/* X-Axis Tick Labels */}
          {[1, 5, 10, 15, 20, 25].map((yr) => (
            <text
              key={yr}
              x={getX(yr)}
              y={height - paddingBottom + 18}
              fill="#9CA3AF"
              fontSize="10"
              fontFamily="monospace"
              textAnchor="middle"
            >
              Yr {yr}
            </text>
          ))}
        </svg>

        {/* Year Selector Scrubber */}
        <div className="flex items-center justify-between pt-3 px-1 text-[11px] font-mono text-[#9CA3AF]">
          {[1, 5, 10, 15, 20, 25].map((yr) => (
            <button
              key={yr}
              type="button"
              onClick={() => setHoveredYear(yr)}
              className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                hoveredYear === yr
                  ? "bg-[#FFFFFF] text-[#16181D] font-bold"
                  : "hover:bg-[#23272F] text-[#9CA3AF]"
              }`}
            >
              Year {yr}
            </button>
          ))}
        </div>
      </div>

      {/* Legend & Milestone Insight */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-[#23272F] text-[11px] font-mono">
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2 text-[#FFFFFF]">
            <span className="w-3 h-0.5 bg-[#FFFFFF]" />
            <span>Net Cumulative Cash Flow</span>
          </div>
          <div className="flex items-center gap-2 text-[#9CA3AF]">
            <span className="w-3 h-0.5 bg-[#6B7280] border-t border-dashed" />
            <span>Spent on electricity without solar</span>
          </div>
        </div>

        <div className="text-[#9CA3AF]">
          At Year 25:{" "}
          <span className="text-[#FFFFFF] font-bold">
            +{formatInr(dataPoints[24].netCumulativeCashflow)}
          </span>{" "}
          net savings
        </div>
      </div>
    </div>
  );
}
