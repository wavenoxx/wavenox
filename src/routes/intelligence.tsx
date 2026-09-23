import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Cpu, Activity, ShieldAlert, CloudLightning, Zap, ArrowRight, RefreshCw } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { openConsultationDrawer } from "@/components/ConsultationDrawer";
import { BRAND_CONFIG } from "@/config/brand";

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
    <section className="relative min-h-[90vh] w-full overflow-hidden bg-black flex items-center pt-28 pb-20">
      {/* Background ambient pulse */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-[#F57C00]/10 blur-[150px] pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-12 w-full text-center">
        <motion.div {...fadeUp} className="mx-auto max-w-3xl">
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-[#F57C00]">
            AUTONOMOUS OPERATING SYSTEM
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

  useEffect(() => {
    const interval = setInterval(() => {
      // Add realistic natural micro-fluctuations
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
          {/* Top Status Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
            <div className="flex items-center gap-3">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-white">
                TELEMETRY BUS: 100% OPERATIONAL
              </span>
            </div>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setIslandMode(!islandMode)}
                className={`cursor-pointer rounded-full px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider transition-all duration-300 ${
                  islandMode
                    ? "bg-[#F57C00] text-black"
                    : "border border-white/20 text-white/80 hover:border-white"
                }`}
              >
                {islandMode ? "ISLANDED (GRID DETACHED)" : "TEST GRID DETACHMENT"}
              </button>
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

function IntelligencePage() {
  return (
    <main className="min-h-screen w-full bg-black">
      <Header />
      <IntelligenceHero />
      <LiveTelemetrySimulator />
      <ArchitecturePillars />
      <Footer />
    </main>
  );
}
