import * as React from "react";
import { Sun, Home, Battery, Zap, AlertTriangle, ShieldCheck, Play, Pause, RotateCcw } from "lucide-react";
import { PRODUCTS_CONFIG } from "@/config/products";

interface SimulationState {
  timeStr: string;
  hour: number;
  label: string;
  solarKw: number;
  homeKw: number;
  batteryKw: number; // positive = charging, negative = discharging
  batterySoc: number; // percentage
  gridKw: number; // positive = export, negative = import
  isOutage: boolean;
  statusText: string;
}

const SIMULATION_TIMELINE: SimulationState[] = [
  {
    timeStr: "06:00 AM",
    hour: 6,
    label: "Dawn Awakening",
    solarKw: 0.8,
    homeKw: 2.2,
    batteryKw: -1.4,
    batterySoc: 48,
    gridKw: 0.0,
    isOutage: false,
    statusText: "Dawn awakening · Stored solar powers morning HVAC",
  },
  {
    timeStr: "09:30 AM",
    hour: 9.5,
    label: "Solar Ramp-Up",
    solarKw: 6.8,
    homeKw: 2.5,
    batteryKw: 4.3,
    batterySoc: 65,
    gridKw: 0.0,
    isOutage: false,
    statusText: "Surplus solar directly charges Omnigrid at 4.3 kW",
  },
  {
    timeStr: "12:30 PM",
    hour: 12.5,
    label: "Solar Apex Peak",
    solarKw: 11.2,
    homeKw: 3.6,
    batteryKw: 4.8,
    batterySoc: 98,
    gridKw: 2.8,
    isOutage: false,
    statusText: "Solar apex · Villa fully powered, battery topped up, exporting 2.8 kW",
  },
  {
    timeStr: "03:30 PM",
    hour: 15.5,
    label: "Afternoon Generation",
    solarKw: 7.4,
    homeKw: 3.2,
    batteryKw: 0.2,
    batterySoc: 100,
    gridKw: 4.0,
    isOutage: false,
    statusText: "Battery at 100% capacity · Surplus exported to DISCOM grid",
  },
  {
    timeStr: "07:00 PM",
    hour: 19,
    label: "Evening Peak Tariff",
    solarKw: 0.0,
    homeKw: 5.4,
    batteryKw: -5.4,
    batterySoc: 82,
    gridKw: 0.0,
    isOutage: false,
    statusText: "Peak DISCOM tariff hours · Omnigrid completely avoids grid bills",
  },
  {
    timeStr: "10:30 PM",
    hour: 22.5,
    label: "Grid Outage / Islanded",
    solarKw: 0.0,
    homeKw: 3.8,
    batteryKw: -3.8,
    batterySoc: 62,
    gridKw: 0.0,
    isOutage: true,
    statusText: "DISCOM blackout detected · Instant <20ms microgrid switchover",
  },
  {
    timeStr: "02:00 AM",
    hour: 26,
    label: "Quiet Night Autonomy",
    solarKw: 0.0,
    homeKw: 1.6,
    batteryKw: -1.6,
    batterySoc: 52,
    gridKw: 0.0,
    isOutage: false,
    statusText: "Silent nocturnal autonomy · Zero diesel noise or fumes",
  },
];

export function EnergyFlowSimulator() {
  const [currentIndex, setCurrentIndex] = React.useState(2); // start at Solar Apex
  const [isPlaying, setIsPlaying] = React.useState(false);
  const current = SIMULATION_TIMELINE[currentIndex];
  const batteryCap = PRODUCTS_CONFIG.battery.usableCapacityKwh;

  React.useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % SIMULATION_TIMELINE.length);
    }, 2800);
    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div className="w-full max-w-5xl mx-auto rounded-[8px] bg-[#111317] border border-[#23272F] p-6 sm:p-10 text-[#FFFFFF] shadow-2xl overflow-hidden selection:bg-[#F57C00] selection:text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#23272F]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
            <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#9CA3AF]">
              Live Energy Kinetics · Kinetic Flow Simulator
            </span>
          </div>
          <h3 className="text-[22px] sm:text-[28px] font-medium tracking-tight text-[#FFFFFF] mt-1">
            24-Hour Autonomous Estate Power
          </h3>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto font-mono text-[12px]">
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            className="h-9 px-3.5 rounded-[4px] bg-[#23272F] hover:bg-[#2C323C] text-[#FFFFFF] flex items-center gap-2 transition-colors cursor-pointer"
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 text-[#F57C00]" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 text-[#10B981]" />
                <span>Auto-Cycle</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setIsPlaying(false);
              setCurrentIndex(2);
            }}
            className="h-9 px-3 rounded-[4px] bg-[#23272F] hover:bg-[#2C323C] text-[#9CA3AF] hover:text-[#FFFFFF] flex items-center gap-1.5 transition-colors cursor-pointer"
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
          <span className="text-[#F57C00] font-bold text-[13px]">{current.timeStr} — {current.label}</span>
          <span>02:00 AM (Night)</span>
        </div>

        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {SIMULATION_TIMELINE.map((item, idx) => {
            const isSelected = idx === currentIndex;
            return (
              <button
                key={item.timeStr}
                type="button"
                onClick={() => {
                  setIsPlaying(false);
                  setCurrentIndex(idx);
                }}
                className={`py-2 px-1 rounded-[4px] text-center transition-all cursor-pointer ${
                  isSelected
                    ? "bg-[#FFFFFF] text-[#111317] font-semibold shadow-md scale-[1.02]"
                    : "bg-[#1B1E24] hover:bg-[#23272F] text-[#9CA3AF]"
                }`}
              >
                <div className="text-[10px] sm:text-[11px] font-mono leading-tight">{item.timeStr.split(" ")[0]}</div>
                <div className="text-[9px] truncate opacity-70 hidden sm:block">{item.label}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Kinetic Energy Flow Topology (Visual Network) */}
      <div className="my-6 p-6 sm:p-10 rounded-[6px] bg-[#16181D] border border-[#23272F] relative">
        {/* Outage Banner */}
        {current.isOutage && (
          <div className="mb-6 p-3 rounded-[4px] bg-[#B42318]/20 border border-[#B42318]/50 flex items-center justify-between text-[12px]">
            <div className="flex items-center gap-2 text-[#FCA5A5] font-medium">
              <AlertTriangle className="w-4 h-4 text-[#EF4444]" />
              <span>DISCOM Grid Unavailable (Simulated Outage)</span>
            </div>
            <div className="flex items-center gap-1.5 text-[#10B981] font-mono font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>&lt;20ms Islanding Active · Villa 100% Energized</span>
            </div>
          </div>
        )}

        {/* Network Layout */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center text-center relative z-10">
          
          {/* Node 1: Solar */}
          <div className="p-5 rounded-[6px] bg-[#1B1E24] border border-[#2C323C] flex flex-col items-center">
            <div className={`p-3 rounded-full mb-3 ${current.solarKw > 0 ? "bg-[#F57C00]/20 text-[#F57C00]" : "bg-[#23272F] text-[#5C5E62]"}`}>
              <Sun className="w-6 h-6" />
            </div>
            <div className="text-[11px] uppercase tracking-wider text-[#9CA3AF] font-mono">
              Monolithic PV
            </div>
            <div className="text-[24px] font-semibold tabular-nums text-[#FFFFFF] mt-0.5">
              {current.solarKw.toFixed(1)} <span className="text-[13px] text-[#9CA3AF] font-normal">kW</span>
            </div>
            <div className="text-[11px] text-[#9CA3AF] mt-1">
              550W N-Type TOPCon
            </div>
          </div>

          {/* Node 2: Central Inverter & Gateway */}
          <div className="p-5 rounded-[6px] bg-[#1B1E24] border border-[#2C323C] flex flex-col items-center">
            <div className="p-3 rounded-full mb-3 bg-[#3B82F6]/20 text-[#60A5FA]">
              <Zap className="w-6 h-6" />
            </div>
            <div className="text-[11px] uppercase tracking-wider text-[#9CA3AF] font-mono">
              Hybrid Gateway
            </div>
            <div className="text-[20px] font-semibold tabular-nums text-[#FFFFFF] mt-0.5">
              98.4% <span className="text-[13px] text-[#9CA3AF] font-normal">Eff.</span>
            </div>
            <div className="text-[11px] text-[#10B981] mt-1 font-mono">
              Solid-State Switchgear
            </div>
          </div>

          {/* Node 3: Omnigrid Battery */}
          <div className="p-5 rounded-[6px] bg-[#1B1E24] border border-[#2C323C] flex flex-col items-center">
            <div className="p-3 rounded-full mb-3 bg-[#10B981]/20 text-[#10B981]">
              <Battery className="w-6 h-6" />
            </div>
            <div className="text-[11px] uppercase tracking-wider text-[#9CA3AF] font-mono">
              Omnigrid Storage
            </div>
            <div className="text-[24px] font-semibold tabular-nums text-[#FFFFFF] mt-0.5">
              {current.batterySoc}% <span className="text-[13px] text-[#9CA3AF] font-normal">SOC</span>
            </div>
            <div className="text-[11px] font-mono mt-1">
              {current.batteryKw > 0 ? (
                <span className="text-[#10B981]">Charging +{current.batteryKw.toFixed(1)} kW</span>
              ) : current.batteryKw < 0 ? (
                <span className="text-[#F57C00]">Discharging {current.batteryKw.toFixed(1)} kW</span>
              ) : (
                <span className="text-[#9CA3AF]">Standby · Ready</span>
              )}
            </div>
          </div>

          {/* Node 4: Villa Consumption */}
          <div className="p-5 rounded-[6px] bg-[#1B1E24] border border-[#2C323C] flex flex-col items-center">
            <div className="p-3 rounded-full mb-3 bg-[#A855F7]/20 text-[#C084FC]">
              <Home className="w-6 h-6" />
            </div>
            <div className="text-[11px] uppercase tracking-wider text-[#9CA3AF] font-mono">
              Villa Load
            </div>
            <div className="text-[24px] font-semibold tabular-nums text-[#FFFFFF] mt-0.5">
              {current.homeKw.toFixed(1)} <span className="text-[13px] text-[#9CA3AF] font-normal">kW</span>
            </div>
            <div className="text-[11px] text-[#9CA3AF] mt-1">
              HVAC + Estate Power
            </div>
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
            <span className={current.gridKw > 0 ? "text-[#10B981] font-bold" : "text-[#FFFFFF]"}>
              {current.gridKw > 0 ? `Exporting +${current.gridKw.toFixed(1)} kW` : current.gridKw < 0 ? `Importing ${Math.abs(current.gridKw).toFixed(1)} kW` : "Zero Grid Draw (0.0 kW)"}
            </span>
          </div>
        </div>
      </div>

      {/* Technical Summary Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-[12px]">
        <div className="p-3 rounded-[4px] bg-[#16181D] border border-[#23272F]">
          <div className="text-[10px] text-[#9CA3AF] uppercase font-mono">Usable Capacity</div>
          <div className="font-semibold text-[#FFFFFF] mt-0.5">{batteryCap} kWh LiFePO4</div>
        </div>
        <div className="p-3 rounded-[4px] bg-[#16181D] border border-[#23272F]">
          <div className="text-[10px] text-[#9CA3AF] uppercase font-mono">Switchover Speed</div>
          <div className="font-semibold text-[#10B981] mt-0.5">&lt; 20 Milliseconds</div>
        </div>
        <div className="p-3 rounded-[4px] bg-[#16181D] border border-[#23272F]">
          <div className="text-[10px] text-[#9CA3AF] uppercase font-mono">Net Self-Consumption</div>
          <div className="font-semibold text-[#FFFFFF] mt-0.5">Up to 92% Without Diesel</div>
        </div>
        <div className="p-3 rounded-[4px] bg-[#16181D] border border-[#23272F]">
          <div className="text-[10px] text-[#9CA3AF] uppercase font-mono">Grid Interconnection</div>
          <div className="font-semibold text-[#FFFFFF] mt-0.5">Bi-Directional Net-Meter</div>
        </div>
      </div>
    </div>
  );
}
