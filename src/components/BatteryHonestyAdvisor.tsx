import * as React from "react";
import { AlertCircle, ShieldCheck, Zap, BatteryCharging, CheckCircle2, Info } from "lucide-react";
import { PRODUCTS_CONFIG } from "@/config/products";

export interface BatteryLoadItem {
  id: string;
  name: string;
  category: "Climate" | "Appliances" | "Electronics" | "Pumps";
  watts: number;
  source: string;
}

export const REALISTIC_BEE_LOADS: BatteryLoadItem[] = [
  {
    id: "ac-inverter",
    name: "1.5-Ton Inverter AC",
    category: "Climate",
    watts: 1100,
    source: "BEE 2024 5-Star ISEER 5.0+ average running load",
  },
  {
    id: "bldc-fans",
    name: "3x BLDC Ceiling Fans",
    category: "Climate",
    watts: 105,
    source: "BEE 5-Star BLDC motor @ 35W per fan",
  },
  {
    id: "fridge",
    name: "260L Inverter Refrigerator",
    category: "Appliances",
    watts: 160,
    source: "BEE 5-Star cyclic compressor average",
  },
  {
    id: "led-lights",
    name: "Full Home LED Lighting (10 Lamps)",
    category: "Appliances",
    watts: 90,
    source: "BIS IS 16102 compliant 9W LED lamps",
  },
  {
    id: "wifi-router",
    name: "Fiber ONT + WiFi 6 Router",
    category: "Electronics",
    watts: 18,
    source: "Dual-band WiFi 6 gateway idle load",
  },
  {
    id: "workstation",
    name: 'Workstation (Laptop + 27" Monitor)',
    category: "Electronics",
    watts: 85,
    source: "Energy Star 8.0 computer equipment",
  },
  {
    id: "oled-tv",
    name: '65" OLED TV + Soundbar',
    category: "Electronics",
    watts: 145,
    source: "BEE Star label television operating power",
  },
  {
    id: "water-pump",
    name: "0.5 HP Water Booster Pump",
    category: "Pumps",
    watts: 375,
    source: "BEE 5-Star domestic monobloc pump rating",
  },
];

export interface BatteryHonestyAdvisorProps {
  className?: string;
}

export function BatteryHonestyAdvisor({ className = "" }: BatteryHonestyAdvisorProps) {
  const [batteryCount, setBatteryCount] = React.useState(1);
  const [selectedLoadIds, setSelectedLoadIds] = React.useState<string[]>([
    "bldc-fans",
    "fridge",
    "led-lights",
    "wifi-router",
  ]);

  const toggleLoad = (id: string) => {
    setSelectedLoadIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const totalWatts = React.useMemo(() => {
    let sum = 0;
    for (const load of REALISTIC_BEE_LOADS) {
      if (selectedLoadIds.includes(load.id)) {
        sum += load.watts;
      }
    }
    return Math.max(50, sum);
  }, [selectedLoadIds]);

  // Total usable kWh = units * 14.3 * 0.9 efficiency factor
  const totalUsableKwh = batteryCount * PRODUCTS_CONFIG.battery.usableCapacityKwh * 0.9;
  const backupHours = ((totalUsableKwh * 1000) / totalWatts).toFixed(1);
  const isAcRunning = selectedLoadIds.includes("ac-inverter");

  return (
    <div
      className={`rounded-[8px] border border-[#E3E4E6] bg-[#FFFFFF] overflow-hidden shadow-xs ${className}`}
    >
      {/* 1. Honest Economic Advisory Banner */}
      <div className="p-5 sm:p-6 bg-[#F8F9FA] border-b border-[#E3E4E6] space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-[12px] font-semibold uppercase tracking-wider text-[#92400E] bg-[#FEF3C7] px-2 py-0.5 rounded-[3px]">
            Financial Transparency Advisory
          </span>
          <span className="text-[12px] text-[#5C5E62]">Net-Metering vs. Storage ROI</span>
        </div>
        <h3 className="text-[18px] sm:text-[20px] font-medium text-[#171A20] leading-snug">
          When Does a Home Battery Make Sense in Telangana?
        </h3>
        <p className="text-[13px] sm:text-[14px] text-[#5C5E62] leading-relaxed">
          <strong className="text-[#171A20]">Plain Statement on Payback:</strong> Under net-metering
          regulations in Telangana (TGSPDCL / TGNPDCL), the electricity grid acts as a 100%
          efficient virtual battery during daylight. Surplus solar units are exported to the grid
          and credited against your bill at the full retail tariff rate. Adding a physical lithium
          storage pack (₹2,80,000+ per 14.3 kWh unit) does{" "}
          <strong className="text-[#171A20]">not improve your financial ROI</strong> or speed up
          payback. Purchase battery storage for{" "}
          <strong className="text-[#171A20]">uninterrupted power security during blackouts</strong>,
          not as an investment.
        </p>
      </div>

      {/* 2. Battery Unit Stacking Controls */}
      <div className="p-5 sm:p-6 border-b border-[#E3E4E6] flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#FFFFFF]">
        <div>
          <span className="text-[12px] font-medium text-[#5C5E62] uppercase tracking-wider block">
            Storage Configuration
          </span>
          <div className="text-[16px] font-semibold text-[#171A20]">
            {batteryCount}x 14.3 kWh LiFePO4 Pack ({batteryCount * 14.3} kWh Gross /{" "}
            {totalUsableKwh.toFixed(1)} kWh Usable)
          </div>
        </div>

        <div
          role="radiogroup"
          aria-label="Battery capacity units"
          className="flex items-center gap-1.5 bg-[#F4F4F4] p-1 rounded-[6px]"
        >
          {[1, 2, 3].map((units) => {
            const isSelected = batteryCount === units;
            return (
              <button
                key={units}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => setBatteryCount(units)}
                className={`px-3 py-1.5 text-[12px] font-medium rounded-[4px] transition-colors cursor-pointer ${
                  isSelected ? "bg-[#171A20] text-[#FFFFFF]" : "text-[#5C5E62] hover:text-[#171A20]"
                }`}
              >
                {units} Unit{units > 1 ? "s" : ""} ({units * 14.3} kWh)
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Realistic Sourced Appliances Multi-Select Grid */}
      <div className="p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-[13px] font-semibold uppercase tracking-wider text-[#171A20]">
            Select Outage Essential Loads (BEE Rated Standards)
          </h4>
          <span className="text-[12px] font-mono text-[#5C5E62] tabular-nums">
            Active Load: {totalWatts} Watts
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {REALISTIC_BEE_LOADS.map((load) => {
            const isSelected = selectedLoadIds.includes(load.id);
            return (
              <button
                key={load.id}
                type="button"
                role="button"
                aria-pressed={isSelected}
                onClick={() => toggleLoad(load.id)}
                className={`p-3.5 rounded-[4px] border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? "border-[#171A20] bg-[#171A20] text-[#FFFFFF]"
                    : "border-[#E3E4E6] bg-[#FFFFFF] text-[#171A20] hover:border-[#171A20]/40"
                }`}
              >
                <div>
                  <div className="text-[13px] font-medium leading-snug">{load.name}</div>
                  <div
                    className={`text-[12px] mt-0.5 leading-tight ${
                      isSelected ? "text-[#FFFFFF]/90" : "text-[#5C5E62]"
                    }`}
                  >
                    {load.source}
                  </div>
                </div>
                <div
                  className={`text-[12px] font-mono mt-3 tabular-nums font-semibold ${
                    isSelected ? "text-[#F57C00]" : "text-[#171A20]"
                  }`}
                >
                  ~{load.watts} W
                </div>
              </button>
            );
          })}
        </div>

        {/* Runtime Display */}
        <div className="mt-6 p-6 rounded-[6px] bg-[#F4F4F4] flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <div className="text-[32px] sm:text-[40px] font-medium text-[#171A20] tabular-nums tracking-tight leading-none">
              {backupHours} Hours
            </div>
            <div className="text-[13px] text-[#5C5E62] mt-1">
              Continuous backup time at {totalWatts} W sustained consumption
              {isAcRunning ? " (including 1.5-ton inverter AC)" : ""}
            </div>
          </div>

          <div className="text-[12px] text-[#5C5E62] sm:text-right max-w-xs space-y-1">
            <div>
              Transfer Speed:{" "}
              <strong className="text-[#171A20]">
                {PRODUCTS_CONFIG.battery.islandingTransferSpeedMs}
              </strong>
            </div>
            <div>
              Chemistry: <strong className="text-[#171A20]">Lithium Iron Phosphate (LFP)</strong>
            </div>
            <div>
              Cycle Life: <strong className="text-[#171A20]">6,000+ Cycles (15 Years)</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
