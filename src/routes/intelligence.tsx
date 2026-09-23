import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Cpu, Activity, ShieldAlert, CloudLightning, Zap, ArrowRight, RefreshCw, AlertTriangle, ShieldCheck } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { openConsultationDrawer } from "@/components/ConsultationDrawer";
import { BRAND_CONFIG } from "@/config/brand";
import ogCore from "@/assets/og-core.jpg";
import ogModule from "@/assets/og-module.jpg";

export const Route = createFileRoute("/intelligence")({
  head: () => ({
    meta: [
      { title: `AI Energy Intelligence & Telemetry — ${BRAND_CONFIG.name}` },
      {
        name: "description",
        content:
          "Autonomous energy arbitration, sub-millisecond islanding, and predictive weather algorithms. Experience the self-optimizing brain of your estate.",
      },
      { property: "og:title", content: `Energy Intelligence — ${BRAND_CONFIG.name}` },
      {
        property: "og:description",
        content:
          "AI-driven energy orchestration, sub-millisecond microsecond grid detachment, and live telemetry.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: IntelligencePage,
});

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.3 },
  transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const },
};

function IntelligenceHero() {
  return (
    <section className="relative min-h-[92vh] w-full overflow-hidden bg-black flex items-center pt-28 pb-20">
      {/* Background Silicon Core render with soft fade */}
      <img
        src={ogCore}
        alt="WAVENOX Omnigrid silicon intelligence core processor"
        className="absolute inset-0 h-full w-full object-cover opacity-25"
        loading="eager"
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/90 via-black/60 to-black"
        aria-hidden="true"
      />

      {/* Ambient solar pulse */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-[#F57C00]/10 blur-[160px] pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-12 w-full text-center">
        <motion.div {...fadeUp} className="mx-auto max-w-3xl">
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-[#F57C00]">
            AUTONOMOUS ENERGY OPERATING SYSTEM
          </span>
          <h1 className="mt-4 text-4xl font-bold uppercase leading-[1.05] tracking-tight text-white md:text-6xl lg:text-7xl">
            THE SYNAPSE OF YOUR ESTATE
          </h1>
          <p className="mt-6 mx-auto max-w-2xl text-base leading-relaxed text-white/70 md:text-lg">
            Traditional solar blindly pushes photons into the grid. The {BRAND_CONFIG.name} Omnigrid processor continuously arbitrates solar generation, storage reserves, and fluctuating household loads with sub-millisecond precision.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => openConsultationDrawer("estate")}
              className="cursor-pointer rounded-full bg-[#F57C00] px-8 py-4 text-xs font-bold uppercase tracking-[0.25em] text-black transition-all duration-300 hover:bg-white"
            >
              REQUEST SYSTEM ARCHITECTURE BRIEF →
            </button>
            <a
              href="#live-telemetry"
              className="rounded-full border border-white/20 px-8 py-4 text-xs font-bold uppercase tracking-[0.25em] text-white transition-all duration-300 hover:border-white hover:bg-white/5"
            >
              EXPLORE TELEMETRY ↓
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function LiveTelemetrySimulator() {
  const [solarGen, setSolarGen] = useState(38.4);
  const [batterySoc, setBatterySoc] = useState(94);
  const [estateLoad, setEstateLoad] = useState(14.2);
  const [gridExport, setGridExport] = useState(24.2);
  const [islandMode, setIslandMode] = useState(false);
  const [faultState, setFaultState] = useState<"idle" | "tripped" | "secured">("idle");
  const [transientMs, setTransientMs] = useState(3.8);

  useEffect(() => {
    const interval = setInterval(() => {
      // Natural ambient fluctuation
      const deltaGen = (Math.random() - 0.5) * 1.2;
      const deltaLoad = (Math.random() - 0.5) * 0.8;
      
      setSolarGen((prev) => Math.max(10, Math.min(50, Number((prev + deltaGen).toFixed(1)))));
      setEstateLoad((prev) => Math.max(5, Math.min(25, Number((prev + deltaLoad).toFixed(1)))));
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (islandMode) {
      setGridExport(0);
    } else {
      setGridExport(Number((solarGen - estateLoad).toFixed(1)));
    }
  }, [solarGen, estateLoad, islandMode]);

  const handleInjectFault = () => {
    setFaultState("tripped");
    setTimeout(() => {
      setFaultState("secured");
      setIslandMode(true);
      setTransientMs(Number((3.2 + Math.random() * 0.6).toFixed(1)));
    }, 1000);
  };

  const handleResetGrid = () => {
    setFaultState("idle");
    setIslandMode(false);
  };

  return (
    <section id="live-telemetry" className="bg-black py-24 md:py-36 border-t border-white/10">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <motion.div {...fadeUp} className="text-center max-w-2xl mx-auto">
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-[#F57C00]">
            REAL-TIME TELEMETRY ENGINE
          </span>
          <h2 className="mt-4 text-3xl font-bold uppercase tracking-tight text-white md:text-5xl">
            INTERACTIVE SYSTEM BUS
          </h2>
          <p className="mt-4 text-sm text-white/60 md:text-base">
            Live simulation of the {BRAND_CONFIG.name} Omnigrid high-speed energy flow arbitration.
          </p>
        </motion.div>

        <motion.div {...fadeUp} className="mt-16 border border-white/10 bg-white/[0.02] p-8 md:p-12 relative overflow-hidden">
          {/* Top Status Bar with Interactive Fault Trigger */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
            <div className="flex items-center gap-3">
              <span className="flex h-3 w-3 relative">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  faultState === "tripped" ? "bg-red-400" : "bg-emerald-400"
                }`}></span>
                <span className={`relative inline-flex rounded-full h-3 w-3 ${
                  faultState === "tripped" ? "bg-red-500" : "bg-emerald-500"
                }`}></span>
              </span>
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-white">
                {faultState === "tripped"
                  ? "GRID TRANSIENT SPIKE DETECTED (480V) — EXECUTING DETACHMENT..."
                  : faultState === "secured"
                  ? `ISOLATION VERIFIED IN ${transientMs}ms — ZERO POWER DROP`
                  : "TELEMETRY BUS: 100% OPERATIONAL (50.00 Hz)"}
              </span>
            </div>

            <div className="flex items-center gap-3">
              {faultState === "secured" ? (
                <button
                  type="button"
                  onClick={handleResetGrid}
                  className="cursor-pointer rounded-full border border-white/30 px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider text-white hover:border-white transition-all"
                >
                  RE-SYNCHRONIZE GRID ↺
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleInjectFault}
                  className="cursor-pointer rounded-full bg-red-600/80 px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider text-white hover:bg-red-500 transition-all flex items-center gap-2"
                >
                  <AlertTriangle className="h-3.5 w-3.5" />
                  <span>INJECT GRID BLACKOUT FAULT</span>
                </button>
              )}
            </div>
          </div>

          {/* 4 Interactive Gauges */}
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {/* Gauge 1: Solar Gen */}
            <div className="border border-white/10 bg-black/60 p-6">
              <span className="text-[11px] font-mono uppercase tracking-widest text-white/50">
                SOLAR ARRAY HARVEST
              </span>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="font-mono text-4xl font-bold text-[#F57C00]">
                  {solarGen}
                </span>
                <span className="font-mono text-sm text-white/60">kW</span>
              </div>
              <div className="mt-4 h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#F57C00] transition-all duration-500"
                  style={{ width: `${(solarGen / 50) * 100}%` }}
                />
              </div>
              <span className="mt-3 block text-[10px] font-mono text-white/40">
                Monolithic Liquid Glass array
              </span>
            </div>

            {/* Gauge 2: Battery Storage */}
            <div className="border border-white/10 bg-black/60 p-6">
              <span className="text-[11px] font-mono uppercase tracking-widest text-white/50">
                BATTERY RESERVE (SOC)
              </span>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="font-mono text-4xl font-bold text-white">
                  {batterySoc}
                </span>
                <span className="font-mono text-sm text-white/60">%</span>
              </div>
              <div className="mt-4 h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-400 transition-all duration-500"
                  style={{ width: `${batterySoc}%` }}
                />
              </div>
              <span className="mt-3 block text-[10px] font-mono text-white/40">
                Omnigrid 60kWh LFP Tower
              </span>
            </div>

            {/* Gauge 3: Estate Load */}
            <div className="border border-white/10 bg-black/60 p-6">
              <span className="text-[11px] font-mono uppercase tracking-widest text-white/50">
                ESTATE LOAD DEMAND
              </span>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="font-mono text-4xl font-bold text-white">
                  {estateLoad}
                </span>
                <span className="font-mono text-sm text-white/60">kW</span>
              </div>
              <div className="mt-4 h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-cyan-400 transition-all duration-500"
                  style={{ width: `${(estateLoad / 30) * 100}%` }}
                />
              </div>
              <span className="mt-3 block text-[10px] font-mono text-white/40">
                HVAC, pumps & security active
              </span>
            </div>

            {/* Gauge 4: Grid Export */}
            <div className="border border-white/10 bg-black/60 p-6">
              <span className="text-[11px] font-mono uppercase tracking-widest text-white/50">
                {islandMode ? "GRID STATUS" : "SURPLUS GRID EXPORT"}
              </span>
              <div className="mt-4 flex items-baseline gap-2">
                <span
                  className={`font-mono text-4xl font-bold ${
                    islandMode ? "text-amber-400" : "text-emerald-400"
                  }`}
                >
                  {islandMode ? "0.0" : `+${gridExport}`}
                </span>
                <span className="font-mono text-sm text-white/60">
                  {islandMode ? "OFF-GRID" : "kW"}
                </span>
              </div>
              <div className="mt-4 h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    islandMode ? "bg-amber-400" : "bg-emerald-400"
                  }`}
                  style={{ width: islandMode ? "0%" : `${Math.min(100, (gridExport / 35) * 100)}%` }}
                />
              </div>
              <span className="mt-3 block text-[10px] font-mono text-white/40">
                {islandMode ? "Zero transmission bleed" : "Bi-directional Net Metering"}
              </span>
            </div>
          </div>

          {/* Interactive Oscilloscope Waveform Display */}
          <div className="mt-10 border border-white/10 bg-black/80 p-6">
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
              <span className="font-mono text-xs uppercase tracking-widest text-white/70">
                OSCILLOSCOPE: SUB-4MS WAVEFORM CONTINUITY
              </span>
              <span className="font-mono text-xs text-emerald-400">
                {islandMode ? `ISLANDED: 50.00 Hz PURE SINE` : "GRID-LOCKED: 50.02 Hz"}
              </span>
            </div>
            <div className="mt-4 h-24 w-full flex items-center justify-center overflow-hidden relative">
              <svg className="h-full w-full" viewBox="0 0 800 100" fill="none">
                <path
                  d="M0,50 Q100,0 200,50 T400,50 T600,50 T800,50"
                  stroke={islandMode ? "#F57C00" : "#34D399"}
                  strokeWidth="2.5"
                  className="animate-pulse"
                />
              </svg>
              {faultState === "tripped" && (
                <div className="absolute inset-0 bg-red-500/20 backdrop-blur-xs flex items-center justify-center font-mono text-xs font-bold text-red-400">
                  TRANSIENT FAULT ISOLATION IN PROGRESS...
                </div>
              )}
            </div>
          </div>

          <div className="mt-10 border-t border-white/10 pt-6 flex flex-wrap items-center justify-between gap-4">
            <span className="text-xs text-white/60">
              * Active telemetry updates streamed via encrypted AES-256 local estate gateway.
            </span>
            <button
              type="button"
              onClick={() => openConsultationDrawer("estate")}
              className="cursor-pointer text-xs font-mono font-bold uppercase tracking-wider text-[#F57C00] hover:text-white transition-colors"
            >
              COMMISSION ESTATE DEMO →
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

const INTELLIGENCE_PILLARS = [
  {
    icon: ShieldAlert,
    title: "Sub-4ms Failsafe Islanding",
    desc: "When utility line transients or catastrophic grid blackouts strike, Omnigrid isolates the estate within 3.8 milliseconds. Computers, medical life-support, and precision electronics experience zero flicker.",
  },
  {
    icon: CloudLightning,
    title: "Predictive Weather Modeling",
    desc: "By synthesizing Doppler satellite radar and local barometric micro-sensors, our algorithm pre-charges battery reserves to 100% capacity hours before cyclonic storm systems make landfall.",
  },
  {
    icon: Cpu,
    title: "Module-Level Optimization",
    desc: "Unlike string inverters where a single fallen leaf degrades the entire roof, each Liquid Glass tile pairs with individual solid-state micro-converters to isolate shading and extract peak watts continuously.",
  },
];

function ArchitecturePillars() {
  return (
    <section className="bg-black py-24 md:py-36 border-t border-white/10">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <motion.div {...fadeUp} className="max-w-2xl">
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-[#F57C00]">
            ENGINEERING SPECIFICATIONS
          </span>
          <h2 className="mt-4 text-3xl font-bold uppercase tracking-tight text-white md:text-5xl">
            THE ARCHITECTURE OF CERTAINTY
          </h2>
        </motion.div>

        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
          {INTELLIGENCE_PILLARS.map((p, idx) => {
            const Icon = p.icon;
            return (
              <motion.div
                key={p.title}
                {...fadeUp}
                transition={{ duration: 0.6, delay: idx * 0.15 }}
                className="border border-white/10 bg-white/[0.02] p-8 md:p-10"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-black text-[#F57C00]">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-6 text-xl font-bold uppercase tracking-tight text-white">
                  {p.title}
                </h3>
                <p className="mt-4 text-sm leading-relaxed text-white/60">
                  {p.desc}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function HardwareChassis() {
  return (
    <section className="bg-black py-24 md:py-36 border-t border-white/10">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div {...fadeUp}>
            <span className="font-mono text-xs uppercase tracking-[0.3em] text-[#F57C00]">
              MONOLITHIC HARDWARE CHASSIS
            </span>
            <h2 className="mt-4 text-3xl font-bold uppercase tracking-tight text-white md:text-5xl">
              ANODIZED TITANIUM TOWER
            </h2>
            <p className="mt-6 text-sm leading-relaxed text-white/70 md:text-base">
              The Omnigrid processor stands silently in your private estate equipment vault or vehicle gallery. Precision-milled from aerospace-grade aluminum and titanium, it operates with zero acoustic hum and passive liquid cooling.
            </p>
            <div className="mt-8 space-y-4 font-mono text-xs text-white/80">
              <div className="flex justify-between border-b border-white/10 pb-3">
                <span className="text-white/50">ACOUSTIC NOISE</span>
                <span>{"<"} 25 dB (Near-Silent)</span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-3">
                <span className="text-white/50">THERMAL COOLING</span>
                <span>Closed-Loop Liquid Glycol</span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-3">
                <span className="text-white/50">COMMUNICATION BUS</span>
                <span>Encrypted Fiber Optic + CAN-FD</span>
              </div>
            </div>
            <div className="mt-10">
              <button
                type="button"
                onClick={() => openConsultationDrawer("estate")}
                className="cursor-pointer rounded-full bg-white px-8 py-3.5 text-xs font-bold uppercase tracking-[0.25em] text-black transition-all duration-300 hover:bg-[#F57C00] hover:text-black"
              >
                REQUEST HARDWARE BLUEPRINTS →
              </button>
            </div>
          </motion.div>

          <motion.div {...fadeUp} className="border border-white/10 bg-black overflow-hidden relative">
            <img
              src={ogModule}
              alt="Monolithic Omnigrid power chassis standing in obsidian void"
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/30"
              aria-hidden
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function IntelligencePage() {
  return (
    <main className="min-h-screen w-full bg-black">
      <Header />
      <IntelligenceHero />
      <LiveTelemetrySimulator />
      <ArchitecturePillars />
      <HardwareChassis />
      <Footer />
    </main>
  );
}
