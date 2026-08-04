import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import resHero01 from "@/assets/res-hero-01.jpg";
import resHero02 from "@/assets/res-hero-02.jpg";
import resTile from "@/assets/res-tile.jpg";
import resInterior from "@/assets/res-interior.jpg";

export const Route = createFileRoute("/residential")({
  head: () => ({
    meta: [
      { title: "Residential — WAVENOX" },
      {
        name: "description",
        content:
          "Autonomous energy for the world's most exclusive homes. Wavenox residential solar architecture — invisible integration, 30-50kW yield, 14-day backup.",
      },
      { property: "og:title", content: "Residential — WAVENOX" },
      {
        property: "og:description",
        content:
          "Autonomous energy for the world's most exclusive homes. Invisible integration. Zero demolition.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ResidentialPage,
});

const fadeUp = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.3 },
  transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] as const },
};

function DataRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-6 border-b border-white/20 py-5">
      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60">
        {label}
      </span>
      <span className="text-sm text-white md:text-base">{value}</span>
    </div>
  );
}

function CoreHero() {
  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-black">
      <img
        src={resHero01}
        alt="Luxury hillside estate with integrated black glass solar roof at dusk"
        width={1920}
        height={1088}
        className="absolute inset-0 h-full w-full object-cover"
        draggable={false}
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.45)_0%,rgba(0,0,0,0.8)_65%,rgba(0,0,0,0.96)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-linear-to-t from-black to-transparent" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-[1400px] flex-col items-center justify-center px-6 text-center md:px-12">
        <motion.div {...fadeUp}>
          <h1 className="text-balance text-3xl font-bold uppercase tracking-[-0.01em] text-white sm:text-4xl lg:text-5xl">
            The Luxury Estate
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-[10px] font-bold uppercase leading-relaxed tracking-[0.2em] text-white/60 md:text-xs">
            Autonomous energy for the world's most exclusive homes
          </p>
        </motion.div>
      </div>
    </section>
  );
}

function TechnicalSpecs() {
  return (
    <section className="bg-black py-20 md:py-32">
      <div className="mx-auto grid max-w-[1400px] items-center gap-12 px-6 md:px-12 lg:grid-cols-2 lg:gap-20">
        <motion.div {...fadeUp} className="relative">
          <img
            src={resTile}
            alt="Wavenox Liquid Glass solar tile render"
            loading="lazy"
            width={1200}
            height={1200}
            className="mx-auto w-full max-w-xl object-contain"
          />
        </motion.div>

        <motion.div
          {...fadeUp}
          transition={{ duration: 0.9, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2 className="text-2xl font-bold uppercase tracking-[-0.01em] text-white sm:text-3xl lg:text-4xl">
            Architectural Power
          </h2>
          <p className="mt-6 max-w-lg text-sm leading-relaxed text-white/60 md:text-base">
            Each Liquid Glass tile replaces conventional roofing entirely — no frames,
            no conduits, no visual compromise. The result is a monolithic surface that
            reads as architecture and performs as infrastructure, generating silently
            for decades.
          </p>

          <div className="mt-12 max-w-lg">
            <DataRow label="Thickness" value="12mm" />
            <DataRow label="Efficiency" value="24.5%" />
            <DataRow label="Impact Rating" value="MIL-STD-810G" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function SecondaryHero() {
  return (
    <section className="relative min-h-[80vh] w-full overflow-hidden bg-black">
      <img
        src={resHero02}
        alt="Aerial view of a villa rooftop clad in seamless black solar glass"
        loading="lazy"
        width={1920}
        height={1088}
        className="absolute inset-0 h-full w-full object-cover"
        draggable={false}
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.94)_0%,rgba(0,0,0,0.72)_38%,rgba(0,0,0,0.2)_75%,rgba(0,0,0,0.05)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-linear-to-t from-black to-transparent" />

      <div className="relative z-10 mx-auto flex min-h-[80vh] max-w-[1400px] flex-col justify-center px-6 md:px-12">
        <motion.div {...fadeUp} className="max-w-2xl">
          <h2 className="text-balance text-3xl font-bold uppercase tracking-[-0.01em] text-white sm:text-4xl lg:text-5xl">
            Zero Compromise
          </h2>
          <p className="mt-6 max-w-xl text-sm leading-relaxed text-white/70 md:text-base">
            Eliminate grid reliance without sacrificing design. Our patented
            glassmorphic surface absorbs maximum solar radiation while remaining
            entirely invisible from street level.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

const NODES = [
  { label: "Solar Capture", x: 380, y: 425, r: 300 },
  { label: "Smart Storage", x: 560, y: 305, r: 400 },
  { label: "EV Integration", x: 700, y: 242, r: 500 },
  { label: "The Estate", x: 850, y: 213, r: 600 },
];

function EcosystemInfographic() {
  return (
    <section className="bg-black py-20 md:py-32">
      <div className="mx-auto max-w-[1400px] px-6 md:px-12">
        <motion.h2
          {...fadeUp}
          className="text-center text-2xl font-bold uppercase tracking-[-0.01em] text-white sm:text-3xl lg:text-4xl"
        >
          The Autonomous Ecosystem
        </motion.h2>

        <motion.div {...fadeUp} className="mt-14 md:mt-20">
          <svg
            viewBox="0 0 1000 460"
            className="mx-auto w-full max-w-5xl"
            role="img"
            aria-label="Wavenox energy flow: solar capture, smart storage, EV integration, the estate"
          >
            {/* orbit arcs */}
            {NODES.map((n) => (
              <circle
                key={`arc-${n.label}`}
                cx="500"
                cy="700"
                r={n.r}
                fill="none"
                stroke="rgba(255,255,255,0.16)"
                strokeWidth="1"
                strokeDasharray="2 8"
              />
            ))}

            {/* the estate mass */}
            <circle cx="500" cy="690" r="300" fill="rgba(255,255,255,0.92)" />

            {NODES.map((n, i) => (
              <g key={n.label}>
                <circle cx={n.x} cy={n.y} r="5" fill="#ffffff" />
                <line
                  x1={n.x}
                  y1={n.y}
                  x2={n.x - 42}
                  y2={n.y + 26}
                  stroke="rgba(255,255,255,0.55)"
                  strokeWidth="1"
                />
                <line
                  x1={n.x - 42}
                  y1={n.y + 26}
                  x2={n.x - 200}
                  y2={n.y + 26}
                  stroke="rgba(255,255,255,0.55)"
                  strokeWidth="1"
                />
                <text
                  x={n.x - 200}
                  y={n.y + 19}
                  fill="#ffffff"
                  fontSize="13"
                  fontWeight="700"
                  letterSpacing="2.4"
                  textAnchor="start"
                >
                  {`0${i + 1} — ${n.label.toUpperCase()}`}
                </text>
              </g>
            ))}
          </svg>
        </motion.div>
      </div>
    </section>
  );
}

const CONFIGS = {
  VILLA: [
    { label: "System Yield", value: "30kW - 50kW" },
    { label: "Backup Duration", value: "7 - 14 Days" },
    { label: "Installation", value: "Zero Demolition" },
  ],
  ESTATE: [
    { label: "System Yield", value: "50kW - 120kW" },
    { label: "Backup Duration", value: "10 - 18 Days" },
    { label: "Installation", value: "Zero Demolition" },
  ],
  COMPOUND: [
    { label: "System Yield", value: "120kW - 400kW" },
    { label: "Backup Duration", value: "14 - 30 Days" },
    { label: "Installation", value: "Zero Demolition" },
  ],
} as const;

type ConfigKey = keyof typeof CONFIGS;

function Configurations() {
  const [active, setActive] = useState<ConfigKey>("VILLA");

  return (
    <section className="bg-black pb-24 md:pb-36">
      <div className="mx-auto grid max-w-[1400px] items-center gap-12 lg:grid-cols-2 lg:gap-0">
        <div className="relative h-[420px] w-full overflow-hidden lg:h-[760px]">
          <img
            src={resInterior}
            alt="Luxury smart home energy control panel at night"
            loading="lazy"
            width={1408}
            height={1600}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-r from-black/40 via-transparent to-black" />
        </div>

        <motion.div {...fadeUp} className="px-6 md:px-12 lg:pl-16">
          <h2 className="text-2xl font-bold uppercase tracking-[-0.01em] text-white sm:text-3xl lg:text-4xl">
            System Configurations
          </h2>
          <p className="mt-6 max-w-lg text-sm leading-relaxed text-white/60 md:text-base">
            Three deployment tiers, calibrated to the scale of the residence. Every
            configuration is engineered, commissioned, and monitored by Wavenox.
          </p>

          <div className="mt-10 flex flex-wrap gap-8">
            {(Object.keys(CONFIGS) as ConfigKey[]).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setActive(key)}
                className={`border-b pb-1 text-[11px] font-bold uppercase tracking-[0.2em] transition-colors duration-300 ${
                  active === key
                    ? "border-white text-white"
                    : "border-transparent text-white/40 hover:text-white/70"
                }`}
              >
                {key}
              </button>
            ))}
          </div>

          <div className="mt-10 max-w-lg">
            {CONFIGS[active].map((row) => (
              <DataRow key={row.label} label={row.label} value={row.value} />
            ))}
          </div>

          <div className="mt-12">
            <button
              type="button"
              className="rounded-full bg-white px-8 py-3 text-[11px] font-bold uppercase tracking-[0.25em] text-black transition-all duration-500 hover:bg-white/80"
            >
              Request Consultation
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function ResidentialPage() {
  return (
    <main className="bg-black">
      <Header />
      <CoreHero />
      <TechnicalSpecs />
      <SecondaryHero />
      <EcosystemInfographic />
      <Configurations />
    </main>
  );
}
