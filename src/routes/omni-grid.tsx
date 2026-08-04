import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import ogHero01 from "@/assets/og-hero-01.jpg";
import ogHero02 from "@/assets/og-hero-02.jpg";
import ogCore from "@/assets/og-core.jpg";
import ogModule from "@/assets/og-module.jpg";

export const Route = createFileRoute("/omni-grid")({
  head: () => ({
    meta: [
      { title: "Omni-Grid — WAVENOX" },
      {
        name: "description",
        content:
          "The Omni-Grid is the neural network of autonomous architecture — energy arbitrage, failsafe islanding in under 0.1ms, and MIL-spec hardware.",
      },
      { property: "og:title", content: "Omni-Grid — WAVENOX" },
      {
        property: "og:description",
        content:
          "Energy arbitrage, failsafe islanding, and AI predictive routing. The neural network of autonomous architecture.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: OmniGridPage,
});

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.3 },
  transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] as const },
};

const LABEL =
  "text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-400 md:text-xs";

function CoreHero() {
  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-black">
      <img
        src={ogHero01}
        alt="Dark architectural control room looking out through glass at a dramatic storm"
        width={1920}
        height={1088}
        className="absolute inset-0 h-full w-full object-cover"
        draggable={false}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black via-black/30 to-black" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-transparent to-black/70" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-[1400px] flex-col items-center justify-center px-6 text-center md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        >
          <h1 className="text-balance text-4xl font-bold uppercase leading-[1.05] tracking-tight text-white md:text-6xl lg:text-7xl">
            The Omni-Grid
          </h1>
          <p className={`mx-auto mt-8 max-w-2xl leading-relaxed ${LABEL}`}>
            The neural network of autonomous architecture
          </p>
        </motion.div>
      </div>
    </section>
  );
}

function ArbitrageHero() {
  return (
    <section className="relative min-h-[80vh] w-full overflow-hidden bg-black">
      <img
        src={ogHero02}
        alt="Monolithic black glass Wavenox battery tower in a minimalist architectural void"
        width={1920}
        height={1088}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover"
        draggable={false}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent" />

      <div className="relative z-10 mx-auto flex min-h-[80vh] max-w-[1400px] items-center px-6 py-32 md:px-12 lg:py-48">
        <motion.div {...fadeUp} className="max-w-xl">
          <h2 className="text-3xl font-bold uppercase leading-[1.05] tracking-tight text-white md:text-5xl">
            Energy Arbitrage
          </h2>
          <p className="mt-6 text-sm leading-relaxed text-gray-400 md:text-base">
            The Omni-Grid intelligently stores, routes, and sells power back to the
            traditional grid in real-time. Absolute financial and energy autonomy.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

function FailsafeSplit() {
  return (
    <section className="w-full bg-black py-32 lg:py-48">
      <div className="mx-auto grid max-w-[1400px] grid-cols-1 items-center gap-24 px-6 md:px-12 lg:grid-cols-2 lg:gap-32">
        <motion.div {...fadeUp} className="relative aspect-square w-full overflow-hidden">
          <img
            src={ogCore}
            alt="Macro shot of the Omni-Grid processor core with liquid glass wiring"
            width={1440}
            height={1440}
            loading="lazy"
            className="h-full w-full object-cover"
            draggable={false}
          />
        </motion.div>

        <motion.div {...fadeUp}>
          <span className={LABEL}>Protocol</span>
          <h2 className="mt-6 text-3xl font-bold uppercase leading-[1.05] tracking-tight text-white md:text-5xl">
            Failsafe Architecture
          </h2>
          <p className="mt-6 max-w-xl text-sm leading-relaxed text-gray-400 md:text-base">
            In the event of catastrophic grid failure, the Omni-Grid seamlessly islands
            your estate in under 0.1 milliseconds. Zero flickering. Total security.
          </p>

          <div className="mt-14">
            <div className="flex items-baseline justify-between gap-10 border-b border-white/10 py-5">
              <span className={LABEL}>Transfer Time</span>
              <span className="text-sm font-semibold tracking-tight text-white md:text-base">
                &lt; 0.1 ms
              </span>
            </div>
            <div className="flex items-baseline justify-between gap-10 border-b border-white/10 py-5">
              <span className={LABEL}>Uptime</span>
              <span className="text-sm font-semibold tracking-tight text-white md:text-base">
                99.9997%
              </span>
            </div>
            <div className="flex items-baseline justify-between gap-10 border-b border-white/10 py-5">
              <span className={LABEL}>Redundancy</span>
              <span className="text-sm font-semibold tracking-tight text-white md:text-base">
                Triple Bus
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function RoutingBlueprint() {
  return (
    <section className="w-full bg-black py-32 lg:py-48">
      <div className="mx-auto max-w-[1400px] px-6 md:px-12">
        <motion.div {...fadeUp} className="max-w-2xl">
          <span className={LABEL}>Schematic</span>
          <h2 className="mt-6 text-3xl font-bold uppercase leading-[1.05] tracking-tight text-white md:text-5xl">
            The Routing Protocol
          </h2>
          <p className="mt-6 text-sm leading-relaxed text-gray-400 md:text-base">
            Every photon captured is metered, arbitrated, and dispatched by the routing
            core. Generation, storage, critical load, and export are resolved
            continuously across a single deterministic logic bus.
          </p>
        </motion.div>

        <motion.div {...fadeUp} className="mt-24 w-full overflow-x-auto">
          <svg
            viewBox="0 0 1200 520"
            className="h-auto w-full min-w-[860px]"
            fill="none"
            role="img"
            aria-label="Wavenox energy routing schematic: solar array to inverter core to critical loads and battery to grid export"
          >
            <g className="stroke-white/20" strokeWidth={0.5}>
              {/* frame ticks */}
              <path d="M40 40 H120 M40 40 V120" />
              <path d="M1160 480 H1080 M1160 480 V400" />
              {/* main bus */}
              <path d="M180 150 H600" />
              <path d="M600 150 V260" />
              <path d="M600 260 H980" />
              <path d="M600 260 V400" />
              <path d="M300 400 H980" />
              <path d="M300 400 V150" strokeDasharray="3 6" />
              <path d="M980 260 V400" strokeDasharray="3 6" />
              {/* orbit arcs */}
              <circle cx="600" cy="260" r="150" strokeDasharray="2 8" />
              <circle cx="600" cy="260" r="210" strokeDasharray="2 14" />
            </g>

            <g className="stroke-white/40" strokeWidth={0.75}>
              <rect x="120" y="110" width="120" height="80" />
              <rect x="540" y="220" width="120" height="80" />
              <rect x="920" y="220" width="120" height="80" />
              <rect x="240" y="360" width="120" height="80" />
            </g>

            <g className="fill-white">
              <circle cx="180" cy="150" r="3" />
              <circle cx="600" cy="260" r="3" />
              <circle cx="980" cy="260" r="3" />
              <circle cx="300" cy="400" r="3" />
            </g>

            <g
              className="fill-white"
              fontSize="11"
              fontWeight="700"
              letterSpacing="2.2"
              textAnchor="middle"
            >
              <text x="180" y="100">SOLAR ARRAY</text>
              <text x="600" y="210">INVERTER CORE</text>
              <text x="980" y="210">GRID EXPORT</text>
              <text x="300" y="350">CRITICAL LOADS</text>
            </g>

            <g
              className="fill-white/40"
              fontSize="9"
              fontWeight="600"
              letterSpacing="2"
              textAnchor="middle"
            >
              <text x="180" y="215">01</text>
              <text x="600" y="325">02</text>
              <text x="980" y="325">04</text>
              <text x="300" y="465">03 / BATTERY</text>
              <text x="390" y="140">DC TRANSIT</text>
              <text x="790" y="250">AC EXPORT</text>
            </g>
          </svg>
        </motion.div>
      </div>
    </section>
  );
}

const MODULE_SPECS = [
  "Liquid Cooling System",
  "A.I. Predictive Routing",
  "EMP Shielding",
  "MIL-Spec Enclosure",
];

function CoreModule() {
  return (
    <section className="w-full bg-black py-32 lg:py-48">
      <div className="mx-auto grid max-w-[1400px] grid-cols-1 items-center gap-24 px-6 md:px-12 lg:grid-cols-2 lg:gap-32">
        <motion.div {...fadeUp}>
          <span className={LABEL}>Hardware</span>
          <h2 className="mt-6 text-3xl font-bold uppercase leading-[1.05] tracking-tight text-white md:text-5xl">
            The Core Module
          </h2>
          <p className="mt-6 max-w-xl text-sm leading-relaxed text-gray-400 md:text-base">
            Engineered in-house as a single sealed monolith. Every subsystem is
            serviceable, shielded, and silent — built to run for decades without
            intervention.
          </p>

          <div className="mt-16 border-t border-white/10">
            {MODULE_SPECS.map((spec) => (
              <div key={spec} className="border-b border-white/10 py-6">
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white md:text-xs">
                  {spec}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div {...fadeUp} className="relative w-full overflow-hidden">
          <img
            src={ogModule}
            alt="Monolithic dark glass Omni-Grid hardware tower render"
            width={1088}
            height={1440}
            loading="lazy"
            className="h-full w-full object-cover"
            draggable={false}
          />
        </motion.div>
      </div>
    </section>
  );
}

function OmniGridPage() {
  return (
    <main className="min-h-screen w-full bg-black">
      <Header />
      <CoreHero />
      <ArbitrageHero />
      <FailsafeSplit />
      <RoutingBlueprint />
      <CoreModule />
    </main>
  );
}
