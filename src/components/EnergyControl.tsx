import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import {
  Sun,
  BatteryCharging,
  Home,
  Zap,
  Shield,
  Smartphone,
  TrendingUp,
  Clock,
  CheckCircle2,
  Sliders,
} from "lucide-react";
import { openConsultationDrawer } from "./ConsultationDrawer";
import { BRAND_CONFIG } from "@/config/brand";

type AppMode = "self-powered" | "storm-watch" | "tariff-optimizer";

export function EnergyControl() {
  const [activeMode, setActiveMode] = useState<AppMode>("self-powered");

  const modeData = {
    "self-powered": {
      title: "Self-Powered Mode",
      desc: "Maximizes solar self-consumption. Stored energy powers your home during evening peak tariff hours, achieving near 100% grid independence.",
      solarKw: "+7.8 kW",
      batteryCharge: "94%",
      batteryStatus: "Charging (+4.2 kW)",
      homeLoad: "3.6 kW",
      gridFlow: "0.0 kW (Neutral)",
      selfPoweredPct: "99%",
    },
    "storm-watch": {
      title: "Storm Watch & Outage Reserve",
      desc: "Automatically tracks Indian weather alerts and DISCOM grid instability, immediately prioritizing battery reserve to 100% capacity.",
      solarKw: "+6.4 kW",
      batteryCharge: "100%",
      batteryStatus: "Full Reserve (Standby)",
      homeLoad: "3.2 kW",
      gridFlow: "+3.2 kW (Grid Active)",
      selfPoweredPct: "95%",
    },
    "tariff-optimizer": {
      title: "Time-of-Use Tariff Optimizer",
      desc: "Intelligently schedules battery discharge during your state DISCOM's most expensive peak hours, eliminating high-slab tariff penalties.",
      solarKw: "+5.1 kW",
      batteryCharge: "82%",
      batteryStatus: "Optimizing Discharge",
      homeLoad: "4.1 kW",
      gridFlow: "-1.0 kW (Net Export)",
      selfPoweredPct: "98%",
    },
  }[activeMode];

  return (
    <section className="relative w-full bg-white text-[#171A20] py-24 sm:py-32 lg:py-36 overflow-hidden select-none border-b border-[#E2E8F0]">
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
            Energy Control
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-[#171A20] mt-2"
          >
            Monitor and Optimize
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-sm sm:text-base text-[#393C41] mt-4 leading-relaxed max-w-2xl"
          >
            With the WAVENOX App, monitor your energy production and consumption in real time from anywhere in the world. Set your preferences to optimize for energy independence, outage protection or utility tariff savings. View daily generation analytics, battery state of charge, and historical DISCOM net-metering credits with zero lag.
          </motion.p>
        </div>

        {/* 2-Column Showcase: Left Features / Right Interactive Smartphone Mockup */}
        <div className="mt-14 lg:mt-20 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Column: 3 App Control Value Props */}
          <div className="lg:col-span-6 space-y-6 sm:space-y-8 order-2 lg:order-1">
            {/* Mode Selector Tabs */}
            <div className="p-1.5 rounded-xl bg-[#F8F8FA] border border-[#E2E8F0] flex flex-wrap gap-1">
              {[
                { id: "self-powered" as const, label: "Self-Powered" },
                { id: "storm-watch" as const, label: "Storm Watch" },
                { id: "tariff-optimizer" as const, label: "Tariff Optimizer" },
              ].map((m) => {
                const isSelected = activeMode === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setActiveMode(m.id)}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all cursor-pointer text-center ${
                      isSelected
                        ? "bg-[#171A20] text-white shadow-xs"
                        : "text-[#5C5E62] hover:text-[#171A20] hover:bg-white/60"
                    }`}
                  >
                    {m.label}
                  </button>
                );
              })}
            </div>

            {/* Active Mode Card */}
            <div className="p-6 rounded-2xl bg-[#F8F8FA] border border-[#E2E8F0] space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#5C5E62]">
                Active Control Profile
              </span>
              <h3 className="text-lg font-semibold text-[#171A20]">
                {modeData.title}
              </h3>
              <p className="text-xs sm:text-sm text-[#5C5E62] leading-relaxed">
                {modeData.desc}
              </p>
            </div>

            {/* 3 Core App Capabilities */}
            <div className="space-y-4">
              <div className="flex items-start gap-3.5">
                <div className="p-2 rounded-lg bg-[#F8F8FA] border border-[#E2E8F0] text-[#171A20] shrink-0">
                  <Clock size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-[#171A20]">
                    Real-Time Sub-Second Telemetry
                  </h4>
                  <p className="text-xs text-[#5C5E62] mt-0.5 leading-relaxed">
                    Sensors sample energy generation and domestic load 10 times per second with instant cloud sync.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="p-2 rounded-lg bg-[#F8F8FA] border border-[#E2E8F0] text-[#171A20] shrink-0">
                  <Shield size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-[#171A20]">
                    Outage & Frequency Sensing
                  </h4>
                  <p className="text-xs text-[#5C5E62] mt-0.5 leading-relaxed">
                    Detects voltage sags on local DISCOM feeders and pre-emptively isolates your home before blackouts occur.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="p-2 rounded-lg bg-[#F8F8FA] border border-[#E2E8F0] text-[#171A20] shrink-0">
                  <TrendingUp size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-[#171A20]">
                    DISCOM Net-Metering Audit
                  </h4>
                  <p className="text-xs text-[#5C5E62] mt-0.5 leading-relaxed">
                    Tracks exported surplus units and calculates accrued net-metering rupee credits on your monthly billing cycle.
                  </p>
                </div>
              </div>
            </div>

            {/* Dual Tesla-Style Pill Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <Link
                to="/deploy"
                className="w-full sm:w-auto px-8 py-2.5 rounded-full bg-[#171A20] text-white text-sm font-medium hover:bg-black transition-colors text-center shadow-xs cursor-pointer"
              >
                Order Now
              </Link>
              <button
                type="button"
                onClick={() => openConsultationDrawer()}
                className="w-full sm:w-auto px-8 py-2.5 rounded-full bg-[#EEEEEE] text-[#171A20] text-sm font-medium hover:bg-[#E2E8F0] transition-colors text-center cursor-pointer"
              >
                Schedule Consultation
              </button>
            </div>
          </div>

          {/* Right Column: Realistic Tesla-Grade Smartphone Frame */}
          <div className="lg:col-span-6 flex justify-center order-1 lg:order-2">
            <div className="relative w-full max-w-[340px] sm:max-w-[360px] rounded-[44px] bg-[#171A20] p-3.5 shadow-2xl border-4 border-[#393C41]">
              {/* Dynamic Island / Bezel Top */}
              <div className="relative h-6 w-full flex justify-center items-center">
                <div className="h-4 w-28 rounded-full bg-black flex items-center justify-between px-2.5">
                  <div className="h-2 w-2 rounded-full bg-zinc-800" />
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                </div>
              </div>

              {/* Screen Interior: WAVENOX Energy OS */}
              <div className="rounded-[34px] bg-[#000000] text-white p-5 space-y-4 overflow-hidden">
                {/* App Header */}
                <div className="flex items-center justify-between pt-1 pb-2 border-b border-white/10">
                  <div>
                    <span className="block text-[10px] text-zinc-400 font-medium tracking-wider uppercase">
                      Estate Telemetry
                    </span>
                    <h5 className="text-xs font-semibold text-white">
                      {BRAND_CONFIG.name} OS • Jubilee Hills
                    </h5>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-medium">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                    <span>Live</span>
                  </div>
                </div>

                {/* Central Energy Flow Wheel / Matrix */}
                <div className="p-4 rounded-2xl bg-zinc-900/80 border border-white/10 space-y-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-400">Self-Powered Score</span>
                    <span className="text-emerald-400 font-bold tabular-nums">
                      {modeData.selfPoweredPct}
                    </span>
                  </div>

                  {/* 4 Connected Nodes Inside App */}
                  <div className="grid grid-cols-2 gap-2.5">
                    {/* Solar Node */}
                    <div className="p-3 rounded-xl bg-black/60 border border-amber-500/30">
                      <div className="flex items-center gap-1.5 text-[#F57C00]">
                        <Sun size={14} />
                        <span className="text-[10px] uppercase font-semibold">Solar</span>
                      </div>
                      <span className="block text-base font-bold text-white mt-1 tabular-nums">
                        {modeData.solarKw}
                      </span>
                    </div>

                    {/* Battery Node */}
                    <div className="p-3 rounded-xl bg-black/60 border border-white/15">
                      <div className="flex items-center gap-1.5 text-zinc-300">
                        <BatteryCharging size={14} />
                        <span className="text-[10px] uppercase font-semibold">Battery</span>
                      </div>
                      <span className="block text-base font-bold text-white mt-1 tabular-nums">
                        {modeData.batteryCharge}
                      </span>
                    </div>

                    {/* Home Node */}
                    <div className="p-3 rounded-xl bg-black/60 border border-white/15">
                      <div className="flex items-center gap-1.5 text-zinc-300">
                        <Home size={14} />
                        <span className="text-[10px] uppercase font-semibold">Home</span>
                      </div>
                      <span className="block text-base font-bold text-white mt-1 tabular-nums">
                        {modeData.homeLoad}
                      </span>
                    </div>

                    {/* Grid Node */}
                    <div className="p-3 rounded-xl bg-black/60 border border-white/15">
                      <div className="flex items-center gap-1.5 text-zinc-400">
                        <Zap size={14} />
                        <span className="text-[10px] uppercase font-semibold">Grid</span>
                      </div>
                      <span className="block text-[11px] font-semibold text-zinc-300 mt-1.5">
                        {modeData.gridFlow}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 24-Hour Generation Curve Simulation */}
                <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-white/10 space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-zinc-400 font-medium">Generation Curve</span>
                    <span className="text-[#F57C00] font-bold">54.2 kWh Generated</span>
                  </div>
                  {/* SVG Bell Curve */}
                  <div className="h-14 w-full flex items-end justify-between gap-1 pt-2">
                    {[10, 15, 25, 45, 75, 95, 100, 90, 70, 40, 20, 10].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 bg-gradient-to-t from-[#F57C00]/40 to-[#F57C00] rounded-t-xs transition-all duration-500"
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between text-[9px] text-zinc-500 pt-1">
                    <span>6 AM</span>
                    <span>12 PM (Peak)</span>
                    <span>6 PM</span>
                  </div>
                </div>

                {/* Bottom App Navigation Bar */}
                <div className="pt-2 flex justify-around items-center border-t border-white/10 text-zinc-400">
                  <div className="text-center text-[#F57C00]">
                    <Zap size={16} className="mx-auto" />
                    <span className="text-[9px] font-medium block mt-0.5">Energy</span>
                  </div>
                  <div className="text-center">
                    <BatteryCharging size={16} className="mx-auto" />
                    <span className="text-[9px] font-medium block mt-0.5">Backup</span>
                  </div>
                  <div className="text-center">
                    <Sliders size={16} className="mx-auto" />
                    <span className="text-[9px] font-medium block mt-0.5">Settings</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
