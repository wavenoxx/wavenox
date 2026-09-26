import * as React from "react";
import { TrendingUp, ShieldCheck, Zap, ArrowUpRight } from "lucide-react";

interface WealthCurveVisualizerProps {
  annualBillInr: number;
  annualSavingsInr: number;
  netInvestmentInr: number;
  paybackYears: number;
  tariffPerKwh: number;
}

function formatInr(val: number): string {
  if (val >= 10000000) {
    return `₹${(val / 10000000).toFixed(2)} Cr`;
  }
  if (val >= 100000) {
    return `₹${(val / 100000).toFixed(1)} L`;
  }
  return `₹${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(val)}`;
}

export function WealthCurveVisualizer({
  annualBillInr,
  annualSavingsInr,
  netInvestmentInr,
  paybackYears,
  tariffPerKwh,
}: WealthCurveVisualizerProps) {
  const [hoveredYear, setHoveredYear] = React.useState<number>(25);

  // Compute 25-year series data
  const dataPoints = React.useMemo(() => {
    const points = [];
    let cumSpendWithoutSolar = 0;
    let cumSavings = 0;

    for (let y = 1; y <= 25; y++) {
      const inflation = Math.pow(1.03, y - 1);
      const degradation = Math.pow(1 - 0.004, y - 1);

      const yearBill = annualBillInr * inflation;
      const yearSavings = Math.min(yearBill, annualSavingsInr * inflation * degradation);

      cumSpendWithoutSolar += yearBill;
      cumSavings += yearSavings;
      const netWealth = Math.round(cumSavings - netInvestmentInr);

      points.push({
        year: y,
        tariff: (tariffPerKwh * inflation).toFixed(2),
        cumSpendWithoutSolar: Math.round(cumSpendWithoutSolar),
        cumSavings: Math.round(cumSavings),
        netWealth,
      });
    }
    return points;
  }, [annualBillInr, annualSavingsInr, netInvestmentInr, tariffPerKwh]);

  const activePoint = dataPoints.find((p) => p.year === hoveredYear) || dataPoints[24];
  const maxSpend = dataPoints[24].cumSpendWithoutSolar;
  const maxNetWealth = Math.max(...dataPoints.map((p) => p.netWealth));
  const maxVal = Math.max(maxSpend, maxNetWealth) * 1.05;

  // SVG dimensions
  const width = 640;
  const height = 240;
  const paddingX = 40;
  const paddingY = 30;

  const getX = (year: number) => paddingX + ((year - 1) / 24) * (width - 2 * paddingX);
  const getY = (val: number) => {
    const clamped = Math.max(0, val);
    return height - paddingY - (clamped / maxVal) * (height - 2 * paddingY);
  };

  // Generate SVG path for spend curve
  const spendPath = dataPoints
    .map((p, idx) => `${idx === 0 ? "M" : "L"} ${getX(p.year)} ${getY(p.cumSpendWithoutSolar)}`)
    .join(" ");

  // Generate SVG path for net wealth curve
  const wealthPath = dataPoints
    .map((p, idx) => `${idx === 0 ? "M" : "L"} ${getX(p.year)} ${getY(Math.max(0, p.netWealth))}`)
    .join(" ");

  return (
    <div className="w-full p-5 sm:p-6 rounded-[8px] bg-[#16181D] border border-[#23272F] text-[#FFFFFF] shadow-sm space-y-5">
      {/* Title & Active Metric Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#23272F] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#10B981]" />
            <h4 className="text-[13px] font-semibold tracking-wider uppercase text-[#E5E7EB]">
              25-Year Compounding Wealth Trajectory
            </h4>
          </div>
          <p className="text-[11px] text-[#9CA3AF] mt-0.5">
            Grid Tariff Escalation (3.0% YoY) vs. Monolithic Zero-Fuel Solar Asset
          </p>
        </div>

        {/* Dynamic Scrub Metric */}
        <div className="flex items-center gap-4 bg-[#1B1E24] px-3.5 py-1.5 rounded-[4px] border border-[#2C323C] self-start sm:self-auto font-mono text-[12px]">
          <div>
            <span className="text-[#9CA3AF] text-[10px] uppercase">Year {activePoint.year}</span>
            <div className="font-bold text-[#10B981] text-[14px]">
              {activePoint.netWealth > 0
                ? `+${formatInr(activePoint.netWealth)}`
                : formatInr(activePoint.netWealth)}
            </div>
          </div>
          <div className="border-l border-[#2C323C] pl-3">
            <span className="text-[#9CA3AF] text-[10px] uppercase">Grid Loss</span>
            <div className="font-semibold text-[#EF4444] text-[13px]">
              -{formatInr(activePoint.cumSpendWithoutSolar)}
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Vector Chart */}
      <div className="relative w-full overflow-hidden select-none">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
          {/* Grid lines */}
          <line
            x1={paddingX}
            y1={getY(0)}
            x2={width - paddingX}
            y2={getY(0)}
            stroke="#2C323C"
            strokeWidth="1"
          />
          <line
            x1={paddingX}
            y1={getY(maxVal / 2)}
            x2={width - paddingX}
            y2={getY(maxVal / 2)}
            stroke="#23272F"
            strokeDasharray="4 4"
            strokeWidth="1"
          />

          {/* Spend Line (Red/Slate Discom Outflow) */}
          <path
            d={spendPath}
            fill="none"
            stroke="#EF4444"
            strokeWidth="2"
            strokeDasharray="5 5"
            opacity="0.85"
          />

          {/* Wealth Line (Emerald Retained Net Cash) */}
          <path d={wealthPath} fill="none" stroke="#10B981" strokeWidth="2.5" />

          {/* Payback marker line */}
          {paybackYears > 0 && paybackYears <= 25 && (
            <g>
              <line
                x1={getX(paybackYears)}
                y1={paddingY}
                x2={getX(paybackYears)}
                y2={height - paddingY}
                stroke="#F57C00"
                strokeDasharray="2 2"
                strokeWidth="1"
              />
              <text
                x={getX(paybackYears)}
                y={paddingY - 8}
                fill="#F57C00"
                fontSize="9"
                fontFamily="monospace"
                textAnchor="middle"
              >
                Payback ({paybackYears}y)
              </text>
            </g>
          )}

          {/* Active Hover Point Circle */}
          <circle
            cx={getX(activePoint.year)}
            cy={getY(Math.max(0, activePoint.netWealth))}
            r="5"
            fill="#10B981"
            stroke="#FFFFFF"
            strokeWidth="2"
          />
          <circle
            cx={getX(activePoint.year)}
            cy={getY(activePoint.cumSpendWithoutSolar)}
            r="4"
            fill="#EF4444"
            stroke="#16181D"
            strokeWidth="1.5"
          />
        </svg>

        {/* Year Buttons Scrubber */}
        <div className="flex items-center justify-between pt-2 px-1 text-[10px] font-mono text-[#9CA3AF]">
          {[1, 5, 10, 15, 20, 25].map((yr) => (
            <button
              key={yr}
              type="button"
              onClick={() => setHoveredYear(yr)}
              className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                hoveredYear === yr
                  ? "bg-[#10B981] text-[#111317] font-bold"
                  : "hover:bg-[#23272F] text-[#9CA3AF]"
              }`}
            >
              Y{yr}
            </button>
          ))}
        </div>
      </div>

      {/* Legend & Milestone Insight */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[#23272F] text-[11px] font-mono">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-[#10B981]">
            <span className="w-2.5 h-0.5 bg-[#10B981]" />
            <span>Net Retained Cash</span>
          </div>
          <div className="flex items-center gap-1.5 text-[#EF4444]">
            <span className="w-2.5 h-0.5 bg-[#EF4444] border-t border-dashed" />
            <span>Discom Outflow Without Solar</span>
          </div>
        </div>

        <div className="text-[#9CA3AF]">
          By Year 25, power tariff projected at{" "}
          <span className="text-[#FFFFFF] font-bold">₹{dataPoints[24].tariff}/kWh</span>
        </div>
      </div>
    </div>
  );
}
