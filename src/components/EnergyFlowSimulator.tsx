import * as React from "react";
import { Sun, Home, Battery, Zap, ShieldAlert, Play, Pause, RotateCcw } from "lucide-react";
import { PRODUCTS_CONFIG } from "@/config/products";
import { PHYSICS_SIMULATION_TIMELINE, BATTERY_PHYSICS } from "@/config/simulation";

export function EnergyFlowSimulator() {
  const [currentIndex, setCurrentIndex] = React.useState(2); // start at Midday Solar Peak
  const [isPlaying, setIsPlaying] = React.useState(false);
  const current = PHYSICS_SIMULATION_TIMELINE[currentIndex];
  const batteryCap = PRODUCTS_CONFIG.battery.usableCapacityKwh || BATTERY_PHYSICS.capacityKwh;

  React.useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % PHYSICS_SIMULATION_TIMELINE.length);
    }, 3200);
    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div className="w-full rounded-[8px] bg-[#000000] border border-white/10 p-6 sm:p-8 lg:p-10 text-[#FFFFFF] overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/15">
        <div className="space-y-1">
          <div className="text-[12px] font-medium tracking-[0.08em] uppercase text-[#A2A3A5]">
            24-Hour Dispatch Modeling
          </div>
          <h3 className="text-[22px] sm:text-[26px] font-medium tracking-[-0.02em] text-[#FFFFFF]">
            Autonomous Solar &amp; Storage Architecture
          </h3>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto text-[13px]">
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            className="min-h-[44px] px-4 rounded-[4px] bg-[#171A20] hover:bg-[#23272F] text-[#FFFFFF] border border-white/15 flex items-center gap-2 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFFFFF]"
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4" aria-hidden="true" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" aria-hidden="true" />
                <span>Cycle Hours</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setIsPlaying(false);
              setCurrentIndex(2);
            }}
            className="min-h-[44px] px-3.5 rounded-[4px] bg-[#171A20] hover:bg-[#23272F] text-[#A2A3A5] hover:text-[#FFFFFF] border border-white/15 flex items-center gap-1.5 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFFFFF]"
            title="Reset to Midday Peak"
          >
            <RotateCcw className="w-4 h-4" aria-hidden="true" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* Timeline Scrubber */}
      <div className="py-6 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 text-[12px] text-[#A2A3A5]">
          <span>06:00 AM · Dawn</span>
          <span className="text-[#FFFFFF] font-medium text-[13px]">
            {current.timeStr} — {current.label}
          </span>
          <span>10:30 PM · Night</span>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {PHYSICS_SIMULATION_TIMELINE.map((item, idx) => {
            const isSelected = idx === currentIndex;
            return (
              <button
                key={item.timeStr}
                type="button"
                onClick={() => {
                  setIsPlaying(false);
                  setCurrentIndex(idx);
                }}
                aria-pressed={isSelected}
                className={`min-h-[44px] py-2 px-2 rounded-[4px] text-center transition-colors cursor-pointer border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFFFFF] ${
                  isSelected
                    ? "bg-[#FFFFFF] text-[#171A20] font-medium border-[#FFFFFF]"
                    : "bg-[#111318] hover:bg-[#1A1D24] text-[#A2A3A5] border-white/10"
                }`}
              >
                <div className="text-[12px] font-medium leading-tight tabular-nums">
                  {item.timeStr.split(" ")[0]}
                </div>
                <div
                  className={`text-[12px] truncate hidden sm:block mt-0.5 ${
                    isSelected ? "text-[#393C41]" : "text-[#A2A3A5]"
                  }`}
                >
                  {item.label}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Energy Flow Topology */}
      <div className="my-4 p-5 sm:p-8 rounded-[8px] bg-[#111318] border border-white/10">
        {current.isOutage && (
          <div className="mb-6 p-3.5 rounded-[4px] bg-[#221718] border border-[#7F1D1D]/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[13px]">
            <div className="flex items-center gap-2 text-[#FCA5A5] font-medium">
              <ShieldAlert className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>DISCOM Blackout Simulation Active</span>
            </div>
            <div className="text-[#D0D1D2] text-[12px]">
              Microgrid Islanding Active · Essential Loads Energized
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 text-center">
          {/* Node 1: Solar */}
          <div className="p-5 rounded-[8px] bg-[#000000] border border-white/10 flex flex-col items-center">
            <div
              className={`p-2.5 rounded-full mb-3 ${
                current.solarKw > 0 ? "bg-white/10 text-[#FFFFFF]" : "bg-white/5 text-[#6E727A]"
              }`}
              aria-hidden="true"
            >
              <Sun className="w-5 h-5" />
            </div>
            <div className="text-[12px] tracking-[0.04em] text-[#A2A3A5] uppercase">Rooftop PV</div>
            <div className="text-[24px] sm:text-[28px] font-medium tabular-nums text-[#FFFFFF] mt-1">
              {current.solarKw.toFixed(1)}{" "}
              <span className="text-[13px] text-[#A2A3A5] font-normal">kW</span>
            </div>
            <div className="text-[12px] text-[#A2A3A5] mt-1">580W N-Type TOPCon</div>
          </div>

          {/* Node 2: Hybrid Inverter */}
          <div className="p-5 rounded-[8px] bg-[#000000] border border-white/10 flex flex-col items-center">
            <div className="p-2.5 rounded-full mb-3 bg-white/10 text-[#FFFFFF]" aria-hidden="true">
              <Zap className="w-5 h-5" />
            </div>
            <div className="text-[12px] tracking-[0.04em] text-[#A2A3A5] uppercase">
              Hybrid Inverter
            </div>
            <div className="text-[24px] sm:text-[28px] font-medium tabular-nums text-[#FFFFFF] mt-1">
              98.4% <span className="text-[13px] text-[#A2A3A5] font-normal">Eff.</span>
            </div>
            <div className="text-[12px] text-[#A2A3A5] mt-1">Microgrid Synchronized</div>
          </div>

          {/* Node 3: Battery Storage */}
          <div className="p-5 rounded-[8px] bg-[#000000] border border-white/10 flex flex-col items-center">
            <div className="p-2.5 rounded-full mb-3 bg-white/10 text-[#FFFFFF]" aria-hidden="true">
              <Battery className="w-5 h-5" />
            </div>
            <div className="text-[12px] tracking-[0.04em] text-[#A2A3A5] uppercase">
              Battery Storage
            </div>
            <div className="text-[24px] sm:text-[28px] font-medium tabular-nums text-[#FFFFFF] mt-1">
              {current.batterySoc}%{" "}
              <span className="text-[13px] text-[#A2A3A5] font-normal">SOC</span>
            </div>
            <div className="text-[12px] mt-1 tabular-nums">
              {current.batteryKw > 0 ? (
                <span className="text-[#FFFFFF]">Charging +{current.batteryKw.toFixed(1)} kW</span>
              ) : current.batteryKw < 0 ? (
                <span className="text-[#D0D1D2]">
                  Discharging {current.batteryKw.toFixed(1)} kW
                </span>
              ) : (
                <span className="text-[#A2A3A5]">Standby · Ready</span>
              )}
            </div>
          </div>

          {/* Node 4: Home Load */}
          <div className="p-5 rounded-[8px] bg-[#000000] border border-white/10 flex flex-col items-center">
            <div className="p-2.5 rounded-full mb-3 bg-white/10 text-[#FFFFFF]" aria-hidden="true">
              <Home className="w-5 h-5" />
            </div>
            <div className="text-[12px] tracking-[0.04em] text-[#A2A3A5] uppercase">Home Load</div>
            <div className="text-[24px] sm:text-[28px] font-medium tabular-nums text-[#FFFFFF] mt-1">
              {current.homeKw.toFixed(1)}{" "}
              <span className="text-[13px] text-[#A2A3A5] font-normal">kW</span>
            </div>
            <div className="text-[12px] text-[#A2A3A5] mt-1">Domestic Demand</div>
          </div>
        </div>

        {/* Dynamic Status Bar */}
        <div className="mt-6 pt-5 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[13px]">
          <span className="text-[#E5E7EB]">{current.statusText}</span>
          <span className="text-[#A2A3A5] tabular-nums">
            Net DISCOM Balance:{" "}
            <strong className="text-[#FFFFFF] font-medium">
              {current.gridKw > 0
                ? `Exporting +${current.gridKw.toFixed(1)} kW`
                : current.gridKw < 0
                  ? `Importing ${Math.abs(current.gridKw).toFixed(1)} kW`
                  : "0.0 kW (Zero Draw)"}
            </strong>
          </span>
        </div>
      </div>

      {/* Technical Summary Strip */}
      <dl className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-4 text-[13px]">
        <div className="space-y-1">
          <dt className="text-[12px] text-[#A2A3A5]">Storage Spec</dt>
          <dd className="font-medium text-[#FFFFFF] tabular-nums">{batteryCap} kWh LiFePO4</dd>
        </div>
        <div className="space-y-1">
          <dt className="text-[12px] text-[#A2A3A5]">Switchover Speed</dt>
          <dd className="font-medium text-[#FFFFFF]">&lt; 20 Milliseconds</dd>
        </div>
        <div className="space-y-1">
          <dt className="text-[12px] text-[#A2A3A5]">Primary Function</dt>
          <dd className="font-medium text-[#FFFFFF]">Outage Resilience</dd>
        </div>
        <div className="space-y-1">
          <dt className="text-[12px] text-[#A2A3A5]">Grid Connection</dt>
          <dd className="font-medium text-[#FFFFFF]">DISCOM Net-Meter</dd>
        </div>
      </dl>
    </div>
  );
}
