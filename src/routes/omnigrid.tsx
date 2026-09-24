import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Battery,
  Zap,
  ShieldCheck,
  Check,
  Sparkles,
  ArrowRight,
  Clock,
  Layers,
  VolumeX,
  Gauge,
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { openConsultationDrawer } from "@/components/ConsultationDrawer";
import { BRAND_CONFIG } from "@/config/brand";
import { PRODUCTS_CONFIG } from "@/config/products";
import ogHero01 from "@/assets/og-hero-01.jpg";
import ogHero02 from "@/assets/og-hero-02.jpg";
import ogCore from "@/assets/og-core.jpg";
import ogModule from "@/assets/og-module.jpg";

export const Route = createFileRoute("/omnigrid")({
  head: () => ({
    meta: [
      { title: `Omnigrid Clean Energy Storage — ${BRAND_CONFIG.name}` },
      {
        name: "description",
        content: `Whole-home battery storage engineered for Indian grid resilience. ${PRODUCTS_CONFIG.battery.usableCapacityKwh} kWh usable capacity per unit, sub-4ms outage islanding, and intelligent Time-of-Day tariff shaving.`,
      },
      { property: "og:title", content: `Omnigrid Clean Energy Storage — ${BRAND_CONFIG.name}` },
      {
        property: "og:description",
        content:
          "Silent whole-villa energy independence. Zero-flicker blackout protection and modular LFP battery storage.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: OmnigridPage,
});

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.25 },
  transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const },
};

const unitCap = PRODUCTS_CONFIG.battery.usableCapacityKwh;

const STACK_OPTIONS = [
  {
    units: 1,
    capacity: `${(1 * unitCap).toFixed(1)} kWh`,
    desc: "Essential Luxury Backup",
    loads:
      "Powers lighting, WiFi, smart automation, refrigeration, and 1 high-tonnage Inverter AC.",
  },
  {
    units: 2,
    capacity: `${(2 * unitCap).toFixed(1)} kWh`,
    desc: "Whole-Home Standard (Recommended)",
    loads:
      "Full villa autonomy powering 4 Inverter ACs, home elevator, heated pool pumps, and kitchen.",
    isPopular: true,
  },
  {
    units: 3,
    capacity: `${(3 * unitCap).toFixed(1)} kWh`,
    desc: "Multi-Day Autonomy",
    loads:
      "Extended multi-day independence for sprawling estates with multiple central AC chillers.",
  },
  {
    units: 4,
    capacity: `${(4 * unitCap).toFixed(1)} kWh`,
    desc: "Commercial Microgrid",
    loads:
      "Heavy residential compounds, corporate retreat villas, and high-discharge Level 2 EV charging.",
  },
];

function OmnigridPage() {
  const [selectedUnits, setSelectedUnits] = useState(2);

  return (
    <div className="min-h-screen w-full bg-[#FFFFFF] text-[#171A20] selection:bg-[#171A20] selection:text-white">
      <Header />

      {/* =========================================================================
          HERO: 100vh Full-Bleed Omnigrid Studio Gallery
          ========================================================================= */}
      <section className="relative min-h-screen w-full overflow-hidden bg-[#171A20]">
        <img
          src={ogHero01}
          alt="Monolithic Omnigrid clean energy storage unit standing in minimalist architectural gallery"
          className="absolute inset-0 h-full w-full object-cover opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/50" />

        <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col items-center justify-between px-6 pt-32 pb-16 text-center lg:px-12">
          {/* Centered Typography */}
          <div className="my-auto max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className="text-xs font-semibold uppercase tracking-[0.25em] text-white/75">
                WHOLE-HOME ENERGY STORAGE
              </span>
              <h1 className="mt-3 text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-white">
                Omnigrid Clean Storage
              </h1>
              <p className="mt-4 text-base sm:text-lg text-white/80 font-normal max-w-xl mx-auto leading-relaxed">
                24/7 Outage Defense, Time-of-Day Tariff Optimization, and Absolute Energy
                Sovereignty.
              </p>
            </motion.div>
          </div>

          {/* Bottom Floating Specs Dock & Dual Pills */}
          <div className="w-full max-w-4xl space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="grid grid-cols-3 gap-4 text-center divide-x divide-white/20 text-white py-4 backdrop-blur-md bg-black/40 rounded-2xl border border-white/10"
            >
              <div>
                <div className="text-2xl sm:text-3xl font-semibold tracking-tight">
                  {PRODUCTS_CONFIG.battery.usableCapacityKwh} kWh
                </div>
                <div className="text-[11px] sm:text-xs text-white/70 uppercase tracking-wider mt-0.5">
                  Capacity / Unit
                </div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-semibold tracking-tight text-emerald-400">
                  {PRODUCTS_CONFIG.battery.islandingTransferSpeedMs}
                </div>
                <div className="text-[11px] sm:text-xs text-white/70 uppercase tracking-wider mt-0.5">
                  Sub-Cycle Islanding
                </div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-semibold tracking-tight">
                  {PRODUCTS_CONFIG.battery.warrantyYears}-Year
                </div>
                <div className="text-[11px] sm:text-xs text-white/70 uppercase tracking-wider mt-0.5">
                  Warranty
                </div>
              </div>
            </motion.div>

            {/* Dual CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link to="/deploy" className="btn-primary w-full sm:w-auto text-sm cursor-pointer">
                Configure Omnigrid System
              </Link>
              <button
                type="button"
                onClick={() => openConsultationDrawer("villa")}
                className="btn-glass w-full sm:w-auto text-sm cursor-pointer"
              >
                Consult Storage Engineer
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: 24/7 Outage Defense & Seamless Islanding (Pure White #FFFFFF)
          ========================================================================= */}
      <section className="w-full bg-[#FFFFFF] py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Visual Frame */}
            <motion.div {...fadeUp} className="lg:col-span-7">
              <div className="relative rounded-2xl overflow-hidden border border-[#E2E8F0] shadow-sm bg-[#171A20]">
                <img
                  src={ogCore}
                  alt="Precision Lithium Iron Phosphate battery module architecture inside Omnigrid"
                  className="w-full aspect-[16/10] object-cover"
                />
              </div>
            </motion.div>

            {/* Narrative & Feature Highlights */}
            <motion.div {...fadeUp} className="lg:col-span-5 space-y-6">
              <span className="text-xs font-semibold uppercase tracking-widest text-[#5C5E62]">
                UNINTERRUPTED POWER
              </span>
              <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#171A20]">
                Immunity from the Utility Grid
              </h2>
              <p className="text-sm sm:text-base text-[#5C5E62] leading-relaxed">
                Indian electrical grids suffer frequent voltage sags, brownouts, and monsoon line
                breaks. Omnigrid acts as an impenetrable electronic shield, detecting grid
                disruptions and transferring your entire residence in under 4 milliseconds.
              </p>

              <div className="space-y-4 pt-4 border-t border-[#E2E8F0]">
                <div className="flex items-start gap-3">
                  <div className="h-5 w-5 rounded-full bg-[#171A20] text-white flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="h-3 w-3" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-semibold text-[#171A20]">
                      Continuous Inductive Heavy Motor Support
                    </h3>
                    <p className="text-xs text-[#5C5E62] mt-0.5">
                      High surge capability effortlessly starts and operates 4–5 heavy Inverter AC
                      compressors, water lift pumps, and EV chargers without voltage dips.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-5 w-5 rounded-full bg-[#171A20] text-white flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="h-3 w-3" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-semibold text-[#171A20]">
                      100% Silent & Zero Diesel Fumes
                    </h3>
                    <p className="text-xs text-[#5C5E62] mt-0.5">
                      Eliminate noisy, vibrating diesel generator maintenance, toxic exhaust fumes,
                      and manual fuel procurement entirely.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-5 w-5 rounded-full bg-[#171A20] text-white flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="h-3 w-3" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-semibold text-[#171A20]">
                      Sub-4ms Transition (Zero Flicker)
                    </h3>
                    <p className="text-xs text-[#5C5E62] mt-0.5">
                      Faster than an eye blink. Sensitive high-end audio gear, gaming PCs, smart
                      lighting systems, and security servers never drop power.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: Time-of-Day (ToD) Tariff Optimization (Studio Gray #F8F8FA)
          ========================================================================= */}
      <section className="w-full bg-[#F8F8FA] py-20 lg:py-28 border-t border-b border-[#E2E8F0]">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <motion.div {...fadeUp} className="max-w-3xl mx-auto text-center space-y-4">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#5C5E62]">
              INTELLIGENT ENERGY ARBITRAGE
            </span>
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#171A20]">
              Never Pay Peak Electricity Rates
            </h2>
            <p className="text-sm sm:text-base text-[#5C5E62]">
              State electricity distribution boards in India increasingly penalize peak evening
              consumption (6 PM to 10 PM) with heavy tariff surcharges. Omnigrid neutralizes peak
              penalties automatically.
            </p>
          </motion.div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              {...fadeUp}
              className="p-6 rounded-2xl border border-[#E2E8F0] bg-white space-y-3"
            >
              <div className="h-10 w-10 rounded-xl bg-[#171A20] text-white flex items-center justify-center">
                <Clock className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-[#171A20]">
                Time-Based Tariff Arbitrage
              </h3>
              <p className="text-xs text-[#5C5E62] leading-relaxed">
                Omnigrid automatically charges using free rooftop solar during the day, then powers
                your estate throughout peak evening tariff windows to eliminate high DISCOM rates.
              </p>
            </motion.div>

            <motion.div
              {...fadeUp}
              className="p-6 rounded-2xl border border-[#E2E8F0] bg-white space-y-3"
            >
              <div className="h-10 w-10 rounded-xl bg-[#171A20] text-white flex items-center justify-center">
                <Zap className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-[#171A20]">100% Self-Powered Mode</h3>
              <p className="text-xs text-[#5C5E62] leading-relaxed">
                Minimize reliance on the external grid. Maximize consumption of your own clean solar
                generation day and night, keeping your estate completely carbon-neutral.
              </p>
            </motion.div>

            <motion.div
              {...fadeUp}
              className="p-6 rounded-2xl border border-[#E2E8F0] bg-white space-y-3"
            >
              <div className="h-10 w-10 rounded-xl bg-[#171A20] text-white flex items-center justify-center">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-[#171A20]">Emergency Backup Reserve</h3>
              <p className="text-xs text-[#5C5E62] leading-relaxed">
                Set a guaranteed energy reserve percentage (e.g. 20% to 50%) that is permanently
                preserved exclusively for sudden weather emergencies and grid outages.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 4: Modular Scalability & Technical Specifications (Pure White #FFFFFF)
          ========================================================================= */}
      <section className="w-full bg-[#FFFFFF] py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <motion.div {...fadeUp} className="max-w-3xl mx-auto text-center space-y-4">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#5C5E62]">
              ENGINEERING SPECIFICATIONS
            </span>
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#171A20]">
              Modular Architecture & Specifications
            </h2>
            <p className="text-sm sm:text-base text-[#5C5E62]">
              Stack multiple Omnigrid units seamlessly to match your estate's exact power capacity
              and continuous runtime requirements.
            </p>
          </motion.div>

          {/* Stacking Options */}
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {STACK_OPTIONS.map((stack) => (
              <button
                key={stack.units}
                type="button"
                onClick={() => setSelectedUnits(stack.units)}
                className={`p-5 rounded-2xl border text-left transition-all cursor-pointer ${
                  selectedUnits === stack.units
                    ? "border-[#171A20] bg-[#171A20] text-white shadow-sm"
                    : "border-[#E2E8F0] bg-[#F8F8FA] text-[#171A20] hover:border-[#171A20]/30"
                }`}
              >
                <div className="text-xs font-semibold opacity-70">
                  {stack.units} {stack.units === 1 ? "Unit" : "Units"}
                </div>
                <div className="mt-1 text-2xl font-bold tracking-tight">{stack.capacity}</div>
                <div
                  className={`mt-1 text-xs font-medium ${
                    selectedUnits === stack.units ? "text-white" : "text-[#171A20]"
                  }`}
                >
                  {stack.desc}
                </div>
                <div
                  className={`mt-3 text-[11px] leading-relaxed ${
                    selectedUnits === stack.units ? "text-white/70" : "text-[#5C5E62]"
                  }`}
                >
                  {stack.loads}
                </div>
              </button>
            ))}
          </div>

          {/* Specs Table */}
          <div className="mt-16 max-w-4xl mx-auto border-t border-[#E2E8F0] divide-y divide-[#E2E8F0]">
            <div className="py-4 flex justify-between items-center text-xs sm:text-sm">
              <span className="text-[#5C5E62] font-medium">Usable Energy Capacity</span>
              <span className="font-semibold text-[#171A20]">
                {PRODUCTS_CONFIG.battery.usableCapacityKwh} kWh per unit
              </span>
            </div>
            <div className="py-4 flex justify-between items-center text-xs sm:text-sm">
              <span className="text-[#5C5E62] font-medium">Peak & Continuous Power Output</span>
              <span className="font-semibold text-[#171A20]">
                {PRODUCTS_CONFIG.battery.peakPowerKw} kW Peak /{" "}
                {PRODUCTS_CONFIG.battery.continuousPowerKw} kW Continuous per Unit
              </span>
            </div>
            <div className="py-4 flex justify-between items-center text-xs sm:text-sm">
              <span className="text-[#5C5E62] font-medium">Battery Chemistry</span>
              <span className="font-semibold text-[#171A20]">
                {PRODUCTS_CONFIG.battery.chemistry}
              </span>
            </div>
            <div className="py-4 flex justify-between items-center text-xs sm:text-sm">
              <span className="text-[#5C5E62] font-medium">Round-Trip Efficiency</span>
              <span className="font-semibold text-[#171A20]">
                {PRODUCTS_CONFIG.battery.roundTripEfficiencyPct}% AC-to-AC
              </span>
            </div>
            <div className="py-4 flex justify-between items-center text-xs sm:text-sm">
              <span className="text-[#5C5E62] font-medium">Operating Temperature Range</span>
              <span className="font-semibold text-[#171A20]">
                {PRODUCTS_CONFIG.battery.operatingTempRangeC}
              </span>
            </div>
            <div className="py-4 flex justify-between items-center text-xs sm:text-sm">
              <span className="text-[#5C5E62] font-medium">Ingress Protection Rating</span>
              <span className="font-semibold text-[#171A20]">
                {PRODUCTS_CONFIG.battery.protectionRating}
              </span>
            </div>
            <div className="py-4 flex justify-between items-center text-xs sm:text-sm">
              <span className="text-[#5C5E62] font-medium">Performance Warranty</span>
              <span className="font-semibold text-[#171A20]">
                {PRODUCTS_CONFIG.battery.warrantyYears}-Year Warranty
              </span>
            </div>
          </div>

          {!PRODUCTS_CONFIG.specsVerified && (
            <p className="mt-4 text-center text-xs text-[#5C5E62] italic">
              {PRODUCTS_CONFIG.indicativeDisclaimer}
            </p>
          )}
        </div>
      </section>

      {/* =========================================================================
          SECTION 5: Next-Generation Storage CTA Bar (Studio Gray #F8F8FA)
          ========================================================================= */}
      <section className="w-full bg-[#F8F8FA] py-16 border-t border-[#E2E8F0]">
        <div className="mx-auto max-w-5xl px-6 lg:px-12 text-center space-y-6">
          <h3 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#171A20]">
            Take Control of Your Energy Future
          </h3>
          <p className="text-xs sm:text-sm text-[#5C5E62] max-w-xl mx-auto">
            Calculate exact Omnigrid battery units for your villa or schedule an engineering
            consultation with our storage specialists.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link to="/deploy" className="btn-primary w-full sm:w-auto text-sm cursor-pointer">
              Configure in Design Studio →
            </Link>
            <button
              type="button"
              onClick={() => openConsultationDrawer("villa")}
              className="btn-secondary w-full sm:w-auto text-sm cursor-pointer"
            >
              Consult Energy Storage Engineer
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
