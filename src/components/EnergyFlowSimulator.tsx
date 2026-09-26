import * as React from "react";
import { Sun, Home, Battery, Zap, ShieldAlert, Play, Pause, RotateCcw } from "lucide-react";
import { PRODUCTS_CONFIG } from "@/config/products";
import { PHYSICS_SIMULATION_TIMELINE, BATTERY_PHYSICS } from "@/config/simulation";

export function EnergyFlowSimulator() {
  const [currentIndex, setCurrentIndex] = React.useState(2); // start at Solar Apex Peak
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
    <div className="w-full max-w-5xl mx-auto rounded-[8px] bg-[#111215] border border-[#23272F] p-6 sm:p-10 text-[#FFFFFF] shadow-2xl overflow-hidden selection:bg-[#F57C00] selection:text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#23272F]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#F57C00] animate-pulse" />
            <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#9CA3AF]">
              Physics-Calibrated Energy Simulation
            </span>
          </div>
          <h3 className="text-[22px] sm:text-[28px] font-medium tracking-tight text-[#FFFFFF] mt-1">
            24-Hour Autonomous Solar Architecture
          </h3>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto font-mono text-[12px]">
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            className="h-9 px-3.5 rounded-[4px] bg-[#1B1E24] hover:bg-[#23272F] text-[#FFFFFF] border border-[#2C323C] flex items-center gap-2 transition-colors cursor-pointer"
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 text-[#F57C00]" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 text-[#F57C00]" />
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
            className="h-9 px-3 rounded-[4px] bg-[#1B1E24] hover:bg-[#23272F] text-[#9CA3AF] hover:text-[#FFFFFF] border border-[#2C323C] flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Reset to Solar Apex"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* Timeline Scrubber */}
      <div className="py-6">
        <div className="flex items-center justify-between text-[11px] font-mono text-[#9CA3AF] mb-2.5">
          <span>06:00 AM (Dawn)</span>
          <span className="text-[#F57C00] font-bold text-[13px]">
            {current.timeStr} — {current.label}
          </span>
          <span>10:30 PM (Night)</span>
        </div>

        <div className="grid grid-cols-6 gap-1.5 sm:gap-2">
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
                className={`py-2 px-1.5 rounded-[4px] text-center transition-all cursor-pointer border ${
                  isSelected
                    ? "bg-[#FFFFFF] text-[#111215] font-semibold border-white shadow-md scale-[1.02]"
                    : "bg-[#16181D] hover:bg-[#1B1E24] text-[#9CA3AF] border-[#23272F]"
                }`}
              >
                <div className="text-[11px] font-mono leading-tight">
                  {item.timeStr.split(" ")[0]}
                </div>
                <div className="text-[10px] truncate opacity-75 hidden sm:block">{item.label}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Energy Flow Topology */}
      <div className="my-6 p-6 sm:p-10 rounded-[6px] bg-[#16181D] border border-[#23272F] relative">
        {/* Outage State Banner */}
        {current.isOutage && (
          <div className="mb-6 p-3 rounded-[4px] bg-[#221718] border border-[#7F1D1D]/60 flex items-center justify-between text-[12px]">
            <div className="flex items-center gap-2 text-[#FCA5A5] font-medium">
              <ShieldAlert className="w-4 h-4 text-[#F57C00]" />
              <span>DISCOM Blackout Simulation Active</span>
            </div>
            <div className="text-[#9CA3AF] font-mono text-[11px]">
              Microgrid Islanding Active · Essential Loads Energized
            </div>
          </div>
        )}

        {/* Network Layout */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center text-center relative z-10">
          {/* Node 1: Solar */}
          <div className="p-5 rounded-[6px] bg-[#111215] border border-[#23272F] flex flex-col items-center">
            <div
              className={`p-3 rounded-full mb-3 ${
                current.solarKw > 0
                  ? "bg-[#F57C00]/15 text-[#F57C00]"
                  : "bg-[#1B1E24] text-[#5C5E62]"
              }`}
            >
              <Sun className="w-5 h-5" />
            </div>
            <div className="text-[11px] uppercase tracking-wider text-[#9CA3AF] font-mono">
              Monolithic PV
            </div>
            <div className="text-[24px] font-semibold tabular-nums text-[#FFFFFF] mt-0.5">
              {current.solarKw.toFixed(1)}{" "}
              <span className="text-[13px] text-[#9CA3AF] font-normal">kW</span>
            </div>
            <div className="text-[11px] text-[#5C5E62] mt-1 font-mono">550W N-Type TOPCon</div>
          </div>

          {/* Node 2: Central Inverter & Gateway */}
          <div className="p-5 rounded-[6px] bg-[#111215] border border-[#23272F] flex flex-col items-center">
            <div className="p-3 rounded-full mb-3 bg-[#1B1E24] text-[#FFFFFF]">
              <Zap className="w-5 h-5 text-[#F57C00]" />
            </div>
            <div className="text-[11px] uppercase tracking-wider text-[#9CA3AF] font-mono">
              Hybrid Inverter
            </div>
            <div className="text-[20px] font-semibold tabular-nums text-[#FFFFFF] mt-0.5">
              98.4% <span className="text-[13px] text-[#9CA3AF] font-normal">Eff.</span>
            </div>
            <div className="text-[11px] text-[#9CA3AF] mt-1 font-mono">
              Microgrid Synchronization
            </div>
          </div>

          {/* Node 3: Battery Storage */}
          <div className="p-5 rounded-[6px] bg-[#111215] border border-[#23272F] flex flex-col items-center">
            <div className="p-3 rounded-full mb-3 bg-[#1B1E24] text-[#FFFFFF]">
              <Battery className="w-5 h-5 text-[#F57C00]" />
            </div>
            <div className="text-[11px] uppercase tracking-wider text-[#9CA3AF] font-mono">
              Battery Storage
            </div>
            <div className="text-[24px] font-semibold tabular-nums text-[#FFFFFF] mt-0.5">
              {current.batterySoc}%{" "}
              <span className="text-[13px] text-[#9CA3AF] font-normal">SOC</span>
            </div>
            <div className="text-[11px] font-mono mt-1">
              {current.batteryKw > 0 ? (
                <span className="text-[#FFFFFF]">Charging +{current.batteryKw.toFixed(1)} kW</span>
              ) : current.batteryKw < 0 ? (
                <span className="text-[#F57C00]">
                  Discharging {current.batteryKw.toFixed(1)} kW
                </span>
              ) : (
                <span className="text-[#5C5E62]">Standby · Ready</span>
              )}
            </div>
          </div>

          {/* Node 4: Villa Consumption */}
          <div className="p-5 rounded-[6px] bg-[#111215] border border-[#23272F] flex flex-col items-center">
            <div className="p-3 rounded-full mb-3 bg-[#1B1E24] text-[#FFFFFF]">
              <Home className="w-5 h-5 text-[#F57C00]" />
            </div>
            <div className="text-[11px] uppercase tracking-wider text-[#9CA3AF] font-mono">
              Villa Load
            </div>
            <div className="text-[24px] font-semibold tabular-nums text-[#FFFFFF] mt-0.5">
              {current.homeKw.toFixed(1)}{" "}
              <span className="text-[13px] text-[#9CA3AF] font-normal">kW</span>
            </div>
            <div className="text-[11px] text-[#5C5E62] mt-1 font-mono">Active Domestic Demand</div>
          </div>
        </div>

        {/* Dynamic Status Bar */}
        <div className="mt-8 pt-6 border-t border-[#23272F] flex flex-col sm:flex-row items-center justify-between gap-3 text-[12px] font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#F57C00]" />
            <span className="text-[#E5E7EB]">{current.statusText}</span>
          </div>

          <div className="text-[#9CA3AF]">
            Net DISCOM Balance:{" "}
            <span className="text-[#FFFFFF] font-bold">
              {current.gridKw > 0
                ? `Exporting +${current.gridKw.toFixed(1)} kW`
                : current.gridKw < 0
                  ? `Importing ${Math.abs(current.gridKw).toFixed(1)} kW`
                  : "0.0 kW (Zero Draw)"}
            </span>
          </div>
        </div>
      </div>

      {/* Technical Parameters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-[12px]">
        <div className="p-3 rounded-[4px] bg-[#16181D] border border-[#23272F]">
          <div className="text-[10px] text-[#9CA3AF] uppercase font-mono">Storage Spec</div>
          <div className="font-semibold text-[#FFFFFF] mt-0.5">{batteryCap} kWh LiFePO4</div>
        </div>
        <div className="p-3 rounded-[4px] bg-[#16181D] border border-[#23272F]">
          <div className="text-[10px] text-[#9CA3AF] uppercase font-mono">Switchover Speed</div>
          <div className="font-semibold text-[#FFFFFF] mt-0.5">&lt; 20 Milliseconds</div>
        </div>
        <div className="p-3 rounded-[4px] bg-[#16181D] border border-[#23272F]">
          <div className="text-[10px] text-[#9CA3AF] uppercase font-mono">Primary Function</div>
          <div className="font-semibold text-[#FFFFFF] mt-0.5">Outage Resilience</div>
        </div>
        <div className="p-3 rounded-[4px] bg-[#16181D] border border-[#23272F]">
          <div className="text-[10px] text-[#9CA3AF] uppercase font-mono">Grid Connection</div>
          <div className="font-semibold text-[#FFFFFF] mt-0.5">DISCOM Net-Meter</div>
        </div>
      </div>
    </div>
  );
}
