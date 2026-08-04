import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import ogHero01 from "@/assets/og-hero-01.jpg";
import ogHero02 from "@/assets/og-hero-02.jpg";
import ogCore from "@/assets/og-core.jpg";
import ogModule from "@/assets/og-module.jpg";

export const Route = createFileRoute("/omnigrid")({
  head: () => ({
    meta: [
      { title: "Omnigrid — WAVENOX" },
      {
        name: "description",
        content:
          "Omnigrid is the central intelligence of your autonomous estate — silent energy orchestration, instant islanding, and military-grade hardware.",
      },
      { property: "og:title", content: "Omnigrid — WAVENOX" },
      {
        property: "og:description",
        content:
          "The central intelligence of your autonomous estate. Silent orchestration, seamless failsafe, absolute autonomy.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: OmnigridPage,
});

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.3 },
  transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] as const },
};

const LABEL =
  "text-[10px] font-bold uppercase tracking-widest text-white/50 md:text-xs";

function CoreHero() {
  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-black">
      <img
        src={ogHero01}
        alt="Macro view of the polished black glass surface of the Omnigrid unit reflecting a minimalist luxury interior"
        width={1920}
        height={1088}
        className="absolute inset-0 h-full w-full object-cover"
        draggable={false}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black via-black/40 to-black" />
      <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-[1400px] flex-col items-center justify-center px-6 text-center md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        >
          <h1 className="text-balance text-4xl font-bold uppercase leading-[1.05] tracking-tight text-white md:text-6xl lg:text-7xl">
            Omnigrid
          </h1>
          <p className={`mx-auto mt-10 max-w-2xl leading-relaxed ${LABEL}`}>
            The central intelligence of your autonomous estate
          </p>
        </motion.div>
      </div>
    </section>
  );
}

function AutonomyHero() {
  return (
    <section className="relative min-h-[80vh] w-full overflow-hidden bg-black">
      <img
        src={ogHero02}
        alt="Omnigrid unit standing alone under a single spotlight in a pristine mansion utility gallery"
        width={1920}
        height={1088}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover"
        draggable={false}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent" />

      <div className="relative z-10 mx-auto flex min-h-[80vh] max-w-[1400px] items-center px-6 py-32 md:px-12 lg:py-48">
        <motion.div {...fadeUp} className="max-w-xl">
          <h2 className="text-3xl font-bold uppercase leading-[1.05] tracking-tight text-white md:text-5xl">
            Absolute Autonomy
          </h2>
          <p className="mt-8 text-sm leading-relaxed text-white/50 md:text-base">
            Omnigrid silently orchestrates energy capture, storage, and distribution.
            It eliminates grid reliance, protecting your sanctuary from external
            failures with zero intervention.
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
            alt="Macro detail of the Omnigrid edge showing titanium framing and liquid glass finish"
            width={1440}
            height={1440}
            loading="lazy"
            className="h-full w-full object-cover"
            draggable={false}
          />
        </motion.div>

        <motion.div {...fadeUp}>
          <h2 className="text-3xl font-bold uppercase leading-[1.05] tracking-tight text-white md:text-5xl">
            Seamless Failsafe
          </h2>
          <p className="mt-8 max-w-xl text-sm leading-relaxed text-white/50 md:text-base">
            In the event of a catastrophic grid blackout, Omnigrid islands your estate
            in under 0.1 milliseconds. Your life continues uninterrupted. Uncompromised
            luxury.
          </p>

          <div className="mt-16 border-t border-white/10">
            {[
              ["Transfer Time", "< 0.1 ms"],
              ["Uptime", "99.9997%"],
              ["Redundancy", "Triple Bus"],
            ].map(([k, v]) => (
              <div
                key={k}
                className="flex items-baseline justify-between gap-10 border-b border-white/10 py-6"
              >
                <span className={LABEL}>{k}</span>
                <span className="text-sm font-bold tracking-tight text-white md:text-base">
                  {v}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function LogicBlueprint() {
  return (
    <section className="w-full bg-black py-32 lg:py-48">
      <div className="mx-auto max-w-[1400px] px-6 md:px-12">
        <motion.div {...fadeUp} className="max-w-2xl">
          <span className={LABEL}>Blueprint</span>
          <h2 className="mt-6 text-3xl font-bold uppercase leading-[1.05] tracking-tight text-white md:text-5xl">
            The Logic Architecture
          </h2>
          <p className="mt-8 text-sm leading-relaxed text-white/50 md:text-base">
            Every photon captured is metered, arbitrated, and dispatched by the
            Omnigrid processor. Generation, reserve, and estate demand resolve
            continuously across a single silent logic bus.
          </p>
        </motion.div>

        <motion.div {...fadeUp} className="mt-28 w-full overflow-x-auto">
          <svg
            viewBox="0 0 1200 620"
            className="h-auto w-full min-w-[860px]"
            fill="none"
            role="img"
            aria-label="Omnigrid energy flow: liquid glass roof to Omnigrid processor to battery reserve and estate loads"
          >
            <g className="stroke-white/20" strokeWidth={0.5}>
              <circle cx="600" cy="310" r="120" />
              <circle cx="600" cy="310" r="185" strokeDasharray="2 10" />
              <circle cx="600" cy="310" r="250" />
              <circle cx="600" cy="310" r="305" strokeDasharray="1 12" />
              <path d="M600 60 V190" />
              <path d="M600 430 V560" />
              <path d="M295 310 H480" />
              <path d="M720 310 H905" />
            </g>

            <g className="stroke-white/40" strokeWidth={0.75}>
              <circle cx="600" cy="310" r="34" />
            </g>

            <g className="fill-white">
              <circle cx="600" cy="60" r="3" />
              <circle cx="600" cy="560" r="3" />
              <circle cx="295" cy="310" r="3" />
              <circle cx="905" cy="310" r="3" />
            </g>

            <g
              className="fill-white"
              fontSize="11"
              fontWeight="700"
              letterSpacing="2.6"
              textAnchor="middle"
            >
              <text x="600" y="40">LIQUID GLASS ROOF</text>
              <text x="600" y="316">OMNIGRID PROCESSOR</text>
              <text x="600" y="590">ESTATE LOADS</text>
              <text x="295" y="290">BATTERY RESERVE</text>
              <text x="905" y="290">GRID EXPORT</text>
            </g>

            <g
              className="fill-white/40"
              fontSize="9"
              fontWeight="600"
              letterSpacing="2"
              textAnchor="middle"
            >
              <text x="600" y="86">01</text>
              <text x="295" y="336">03</text>
              <text x="905" y="336">04</text>
              <text x="600" y="538">02</text>
            </g>
          </svg>
        </motion.div>
      </div>
    </section>
  );
}

const HARDWARE = [
  "A.I. Energy Routing",
  "Thermal Management",
  "Military-Grade Enclosure",
  "Instant Islanding",
];

function Hardware() {
  return (
    <section className="w-full bg-black py-32 lg:py-48">
      <div className="mx-auto grid max-w-[1400px] grid-cols-1 items-center gap-24 px-6 md:px-12 lg:grid-cols-2 lg:gap-32">
        <motion.div {...fadeUp}>
          <h2 className="text-3xl font-bold uppercase leading-[1.05] tracking-tight text-white md:text-5xl">
            The Hardware
          </h2>
          <p className="mt-8 max-w-xl text-sm leading-relaxed text-white/50 md:text-base">
            Engineered in-house as a single sealed monolith. Every subsystem is
            shielded, silent, and built to run for decades without intervention.
          </p>

          <div className="mt-16 border-t border-white/10">
            {HARDWARE.map((spec) => (
              <div key={spec} className="border-b border-white/10 py-6">
                <span className="text-[10px] font-bold uppercase tracking-widest text-white md:text-xs">
                  {spec}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div {...fadeUp} className="relative w-full overflow-hidden">
          <img
            src={ogModule}
            alt="Studio render of the monolithic Omnigrid tower standing in a black void"
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

function OmnigridPage() {
  return (
    <main className="min-h-screen w-full bg-black">
      <Header />
      <CoreHero />
      <AutonomyHero />
      <FailsafeSplit />
      <LogicBlueprint />
      <Hardware />
    </main>
  );
}
