import * as React from "react";
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

  const unitKwh = PRODUCTS_CONFIG.battery.usableCapacityKwh;
  const grossKwh = (batteryCount * unitKwh).toFixed(1);
  // Total usable kWh = units * 14.3 * 0.9 efficiency factor
  const totalUsableKwh = batteryCount * unitKwh * 0.9;
  const backupHours = ((totalUsableKwh * 1000) / totalWatts).toFixed(1);
  const isAcRunning = selectedLoadIds.includes("ac-inverter");

  return (
    <div className={`rounded-[8px] bg-[#F4F4F4] p-6 sm:p-8 lg:p-10 space-y-8 ${className}`}>
      {/* 1. Honest Economic Advisory Strip (Calm Architectural Hierarchy — No Loud Pills) */}
      <div className="border-l-2 border-[#171A20] pl-5 space-y-2">
        <div className="text-[12px] font-medium uppercase tracking-[0.06em] text-[#5C5E62]">
          Net-Metering vs. Storage Payback
        </div>
        <h3 className="text-[20px] sm:text-[22px] font-medium tracking-[-0.018em] text-[#171A20] leading-snug">
          When Does a Home Battery Make Sense in Telangana?
        </h3>
        <p className="text-[14px] sm:text-[15px] text-[#5C5E62] leading-[1.6] max-w-[78ch]">
          <strong className="font-medium text-[#171A20]">Plain Statement on Payback:</strong> Under
          net-metering regulations in Telangana (TGSPDCL / TGNPDCL), the utility grid credits
          daytime surplus exports against your bill at the retail tariff rate. Adding a physical
          lithium storage pack (₹2,80,000+ per 14.3 kWh unit) does{" "}
          <strong className="font-medium text-[#171A20]">not improve your financial ROI</strong> or
          speed up payback. Purchase battery storage for{" "}
          <strong className="font-medium text-[#171A20]">
            uninterrupted power security during blackouts
          </strong>
          , not as a financial return instrument.
        </p>
      </div>

      {/* 2. Storage Configuration & Unit Stacking Controls */}
      <div className="pt-6 border-t border-[#E3E4E6] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="text-[12px] font-medium text-[#5C5E62] uppercase tracking-[0.06em]">
            Storage Configuration
          </div>
          <div className="text-[17px] sm:text-[19px] font-medium text-[#171A20] tabular-nums">
            {batteryCount}x {unitKwh.toFixed(1)} kWh LiFePO4 Pack ({grossKwh} kWh Gross /{" "}
            {totalUsableKwh.toFixed(1)} kWh Usable)
          </div>
        </div>

        <div
          role="radiogroup"
          aria-label="Battery capacity units"
          className="grid grid-cols-3 gap-1.5 bg-[#FFFFFF] p-1 rounded-[4px] border border-[#E3E4E6] shrink-0"
        >
          {[1, 2, 3].map((units) => {
            const isSelected = batteryCount === units;
            const formattedKwh = (units * unitKwh).toFixed(1);
            return (
              <button
                key={units}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => setBatteryCount(units)}
                className={`min-h-[44px] px-2 sm:px-3.5 py-1.5 text-[12px] sm:text-[13px] font-medium rounded-[4px] transition-colors cursor-pointer tabular-nums flex flex-col sm:flex-row items-center justify-center sm:gap-1 leading-tight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#171A20] ${
                  isSelected
                    ? "bg-[#171A20] text-[#FFFFFF]"
                    : "text-[#5C5E62] hover:text-[#171A20] hover:bg-[#F4F4F4]"
                }`}
              >
                <span>
                  {units} Unit{units > 1 ? "s" : ""}
                </span>
                <span className={isSelected ? "text-[#FFFFFF]/85" : "text-[#5C5E62]"}>
                  ({formattedKwh} kWh)
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Essential Loads Multi-Select Grid (Clean Elevated Toggles — No Heavy Black Slabs) */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h4 className="text-[13px] font-medium uppercase tracking-[0.06em] text-[#171A20]">
            Select Outage Essential Loads (BEE Rated Standards)
          </h4>
          <span className="text-[13px] font-medium text-[#5C5E62] tabular-nums">
            Active Load: <strong className="text-[#171A20]">{totalWatts} W</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {REALISTIC_BEE_LOADS.map((load) => {
            const isSelected = selectedLoadIds.includes(load.id);
            return (
              <button
                key={load.id}
                type="button"
                aria-pressed={isSelected}
                onClick={() => toggleLoad(load.id)}
                className={`p-4 rounded-[8px] border text-left transition-all cursor-pointer flex flex-col justify-between gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#171A20] ${
                  isSelected
                    ? "border-[#171A20] bg-[#FFFFFF] ring-1 ring-[#171A20] text-[#171A20]"
                    : "border-[#E3E4E6] bg-[#FFFFFF]/70 text-[#5C5E62] hover:bg-[#FFFFFF] hover:border-[#B8BCC2]"
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={`text-[14px] font-medium leading-snug ${
                        isSelected ? "text-[#171A20]" : "text-[#393C41]"
                      }`}
                    >
                      {load.name}
                    </span>
                    <span
                      aria-hidden="true"
                      className={`mt-1 w-2 h-2 rounded-full shrink-0 ${
                        isSelected ? "bg-[#171A20]" : "bg-[#D0D2D6]"
                      }`}
                    />
                  </div>
                  <div className="text-[12px] text-[#5C5E62] leading-[1.35]">{load.source}</div>
                </div>
                <div className="text-[13px] font-medium tabular-nums text-[#171A20]">
                  ~{load.watts} W
                </div>
              </button>
            );
          })}
        </div>

        {/* Runtime Display */}
        <div className="mt-6 p-6 sm:p-8 rounded-[8px] bg-[#FFFFFF] flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="text-[36px] sm:text-[44px] font-medium text-[#171A20] tabular-nums tracking-[-0.028em] leading-none">
              {backupHours} Hours
            </div>
            <div className="text-[14px] text-[#5C5E62] mt-2">
              Continuous backup duration at {totalWatts} W sustained load
              {isAcRunning ? " (including 1.5-ton inverter AC)" : ""}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-1 gap-2 text-[13px] text-[#5C5E62] md:text-right">
            <div>
              Transfer Speed:{" "}
              <strong className="font-medium text-[#171A20]">
                {PRODUCTS_CONFIG.battery.islandingTransferSpeedMs}
              </strong>
            </div>
            <div>
              Chemistry:{" "}
              <strong className="font-medium text-[#171A20]">Lithium Iron Phosphate (LFP)</strong>
            </div>
            <div>
              Cycle Life:{" "}
              <strong className="font-medium text-[#171A20]">6,000+ Cycles (15 Years)</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
