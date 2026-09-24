import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "@tanstack/react-router";
import {
  Sun,
  BatteryCharging,
  Home,
  Zap,
  ShieldAlert,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import ogCore from "@/assets/og-core.jpg";
import { PRODUCTS_CONFIG } from "@/config/products";

type Mode = "day" | "night" | "outage";

const MODES: { id: Mode; label: string; sub: string }[] = [
  { id: "day", label: "Day: Solar Charging", sub: "Sunlight generates power & charges battery" },
  { id: "night", label: "Night: Battery Power", sub: "Stored solar sustains home appliances" },
  {
    id: "outage",
    label: "Grid Outage: Failsafe Islanding",
    sub: `${PRODUCTS_CONFIG.battery.islandingTransferSpeedMs} instant blackout protection`,
  },
];

export function OutageProtection() {
  const [activeMode, setActiveMode] = useState<Mode>("day");

  const telemetry = {
    day: {
      solarKw: 8.5,
      batteryChargePct: 92,
      batteryKw: "+5.3 kW (Charging)",
      homeKw: 3.2,
      gridStatus: "Grid Standby (Zero Draw)",
      selfPoweredPct: 100,
      statusBadge: "100% Self-Powered",
      badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    night: {
      solarKw: 0.0,
      batteryChargePct: 78,
      batteryKw: "-3.8 kW (Discharging)",
      homeKw: 3.8,
      gridStatus: "Grid Standby (Zero Draw)",
      selfPoweredPct: 100,
      statusBadge: "100% Battery Powered",
      badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    outage: {
      solarKw: 6.2,
      batteryChargePct: 86,
      batteryKw: "4.5 kW Backup Supply",
      homeKw: 4.5,
      gridStatus: "Grid Severed (Blackout)",
      selfPoweredPct: 100,
      statusBadge: "Autonomous Islanding Active",
      badgeColor: "bg-amber-50 text-amber-800 border-amber-300",
    },
  }[activeMode];

  return (
    <section className="relative w-full bg-[#F8F8FA] text-[#171A20] py-24 sm:py-32 lg:py-36 overflow-hidden border-b border-[#E2E8F0]">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Section Header */}
        <div className="max-w-3xl">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-xs font-semibold uppercase tracking-[0.25em] text-[#5C5E62]"
          >
            Omnigrid Storage
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-[#171A20] mt-2"
          >
            24/7 Outage Protection
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-sm sm:text-base text-[#393C41] mt-4 leading-relaxed max-w-2xl"
          >
            Grid outages and severe summer voltage fluctuations are a daily reality across Indian
            cities. Omnigrid stores excess solar energy generated during the day and provides
            seamless, uninterrupted backup power at night or during blackouts. Keep your air
            conditioners, refrigeration, and security systems running without a split-second
            flicker.
          </motion.p>
        </div>

        {/* Interactive Mode Selector Tabs */}
        <div className="mt-10 sm:mt-14 flex flex-wrap gap-2.5">
          {MODES.map((m) => {
            const isActive = activeMode === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setActiveMode(m.id)}
                className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all cursor-pointer flex items-center gap-2 ${
                  isActive
                    ? "bg-[#171A20] text-white shadow-xs"
                    : "bg-white text-[#5C5E62] border border-[#E2E8F0] hover:border-zinc-400 hover:text-[#171A20]"
                }`}
              >
                <span>{m.label}</span>
                {isActive && <span className="h-1.5 w-1.5 rounded-full bg-[#F57C00]" />}
              </button>
            );
          })}
        </div>

        {/* Simulator Grid Display */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Interactive Telemetry Diagram */}
          <div className="lg:col-span-7 bg-white rounded-2xl p-6 sm:p-8 border border-[#E2E8F0] shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0]">
              <span className="text-xs font-semibold text-[#171A20] uppercase tracking-wider">
                Live Energy Telemetry Flow
              </span>
              <span
                className={`px-3 py-1 rounded-full text-[11px] font-medium border ${telemetry.badgeColor}`}
              >
                {telemetry.statusBadge}
              </span>
            </div>

            {/* 4 Interactive Flow Nodes */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              {/* Node 1: Solar */}
              <div
                className={`p-4 rounded-xl border transition-all ${
                  activeMode !== "night"
                    ? "bg-[#F8F8FA] border-[#171A20]"
                    : "bg-white border-[#E2E8F0] opacity-50"
                }`}
              >
                <div className="h-10 w-10 mx-auto rounded-full bg-white border border-[#E2E8F0] flex items-center justify-center text-[#F57C00]">
                  <Sun size={20} />
                </div>
                <span className="block text-xs font-medium text-[#5C5E62] mt-2">Solar Array</span>
                <span className="block text-base font-bold text-[#171A20] mt-0.5 tabular-nums">
                  {telemetry.solarKw} kW
                </span>
              </div>

              {/* Node 2: Omnigrid Battery */}
              <div className="p-4 rounded-xl bg-[#F8F8FA] border border-[#171A20]">
                <div className="h-10 w-10 mx-auto rounded-full bg-white border border-[#E2E8F0] flex items-center justify-center text-[#171A20]">
                  <BatteryCharging size={20} />
                </div>
                <span className="block text-xs font-medium text-[#5C5E62] mt-2">Omnigrid</span>
                <span className="block text-base font-bold text-[#171A20] mt-0.5 tabular-nums">
                  {telemetry.batteryChargePct}%
                </span>
                <span className="block text-[10px] text-[#5C5E62]">{telemetry.batteryKw}</span>
              </div>

              {/* Node 3: Home */}
              <div className="p-4 rounded-xl bg-[#F8F8FA] border border-[#E2E8F0]">
                <div className="h-10 w-10 mx-auto rounded-full bg-white border border-[#E2E8F0] flex items-center justify-center text-[#171A20]">
                  <Home size={20} />
                </div>
                <span className="block text-xs font-medium text-[#5C5E62] mt-2">Home Loads</span>
                <span className="block text-base font-bold text-[#171A20] mt-0.5 tabular-nums">
                  {telemetry.homeKw} kW
                </span>
                <span className="block text-[10px] text-emerald-600">Protected</span>
              </div>

              {/* Node 4: Grid */}
              <div
                className={`p-4 rounded-xl border transition-all ${
                  activeMode === "outage"
                    ? "bg-red-50 border-red-300 text-red-700"
                    : "bg-[#F8F8FA] border-[#E2E8F0]"
                }`}
              >
                <div
                  className={`h-10 w-10 mx-auto rounded-full bg-white border flex items-center justify-center ${
                    activeMode === "outage"
                      ? "border-red-300 text-red-600"
                      : "border-[#E2E8F0] text-[#5C5E62]"
                  }`}
                >
                  {activeMode === "outage" ? <ShieldAlert size={20} /> : <Zap size={20} />}
                </div>
                <span className="block text-xs font-medium text-[#5C5E62] mt-2">DISCOM Grid</span>
                <span
                  className={`block text-xs font-bold mt-1 ${
                    activeMode === "outage" ? "text-red-600" : "text-[#171A20]"
                  }`}
                >
                  {activeMode === "outage" ? "Disconnected" : "Active"}
                </span>
              </div>
            </div>

            {/* Dynamic Explanatory Footer Bar */}
            <div className="p-4 rounded-xl bg-[#F8F8FA] border border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#5C5E62]">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                <span>
                  {activeMode === "day" &&
                    "Omnigrid charges silently while home runs 100% on clean rooftop solar."}
                  {activeMode === "night" &&
                    "Omnigrid powers all air conditioning and lighting without drawing costly peak-hour grid units."}
                  {activeMode === "outage" &&
                    "Grid blackout isolated in under 4ms. No equipment restart or light flicker."}
                </span>
              </div>
              <span className="font-semibold text-[#171A20] shrink-0">Sub-4ms Islanding</span>
            </div>
          </div>

          {/* Right Column: Omnigrid Physical Visual & Key Specs */}
          <div className="lg:col-span-5 space-y-6">
            <div className="relative group overflow-hidden rounded-2xl bg-white border border-[#E2E8F0] shadow-xs aspect-[4/3]">
              <img
                src={ogCore}
                alt="WAVENOX Omnigrid Wall-Mounted Battery Storage"
                className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-103"
              />
              <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-medium border border-white/20">
                Omnigrid {PRODUCTS_CONFIG.battery.usableCapacityKwh} kWh Core
              </div>
            </div>

            {/* 3 Engineering Specifications */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3.5 rounded-xl bg-white border border-[#E2E8F0]">
                <span className="block text-xl font-bold text-[#171A20] tabular-nums">
                  {PRODUCTS_CONFIG.battery.usableCapacityKwh} kWh
                </span>
                <span className="block text-[11px] text-[#5C5E62] mt-0.5">Capacity / Unit</span>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-[#E2E8F0]">
                <span className="block text-xl font-bold text-[#171A20] tabular-nums">
                  {PRODUCTS_CONFIG.battery.islandingTransferSpeedMs}
                </span>
                <span className="block text-[11px] text-[#5C5E62] mt-0.5">Islanding Speed</span>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-[#E2E8F0]">
                <span className="block text-xl font-bold text-[#171A20] tabular-nums">
                  {PRODUCTS_CONFIG.battery.warrantyYears}-Year
                </span>
                <span className="block text-[11px] text-[#5C5E62] mt-0.5">Warranty</span>
              </div>
            </div>

            {!PRODUCTS_CONFIG.specsVerified && (
              <p className="text-[11px] text-[#71717A] text-center sm:text-left italic">
                {PRODUCTS_CONFIG.indicativeDisclaimer}
              </p>
            )}

            {/* Pill Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <Link
                to="/deploy"
                className="w-full sm:w-auto px-8 py-2.5 rounded-full bg-[#171A20] text-white text-sm font-medium hover:bg-black transition-colors text-center shadow-xs cursor-pointer"
              >
                Order Now
              </Link>
              <Link
                to="/omnigrid"
                className="w-full sm:w-auto px-8 py-2.5 rounded-full bg-[#EEEEEE] text-[#171A20] text-sm font-medium hover:bg-[#E2E8F0] transition-colors text-center cursor-pointer inline-flex items-center justify-center gap-1.5"
              >
                <span>Explore Omnigrid</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
