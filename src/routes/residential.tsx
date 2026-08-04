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
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.3 },
  transition: { duration: 1.1, ease: [0.22, 1, 0.36, 1] as const },
};

function DataRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-10 border-b border-white/10 py-6">
      <span className="text-[10px] font-normal uppercase tracking-[0.3em] text-white/40">
        {label}
      </span>
      <span className="text-sm font-light text-white/90">{value}</span>
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
      <div className="absolute inset-0 bg-black/70" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-[1400px] flex-col items-center justify-center px-6 text-center md:px-12">
        <motion.div {...fadeUp}>
          <h1 className="text-balance text-3xl font-light uppercase tracking-[0.12em] text-white/90 sm:text-4xl lg:text-5xl">
            The Luxury Estate
          </h1>
          <p className="mx-auto mt-16 max-w-2xl text-[10px] font-normal uppercase leading-loose tracking-[0.3em] text-white/50 md:text-xs">
            Autonomous energy for the world's most exclusive homes
          </p>
        </motion.div>
      </div>
    </section>
  );
}

function TechnicalSpecs() {
  return (
    <section className="bg-black py-32 lg:py-48">
      <div className="mx-auto grid max-w-[1400px] items-center gap-24 px-6 md:px-12 lg:grid-cols-2 lg:gap-32">
        <motion.div {...fadeUp}>
          <img
            src={resTile}
            alt="Wavenox Liquid Glass solar tile render"
            loading="lazy"
            width={1200}
            height={1200}
            className="mx-auto w-full max-w-lg object-contain"
          />
        </motion.div>

        <motion.div
          {...fadeUp}
          transition={{ duration: 1.1, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2 className="text-2xl font-light uppercase tracking-[0.12em] text-white/90 sm:text-3xl lg:text-4xl">
            Architectural Power
          </h2>
          <p className="mt-10 max-w-lg text-sm font-light leading-relaxed text-white/50">
            Each Liquid Glass tile replaces conventional roofing entirely — no frames,
            no conduits, no visual compromise. The result is a monolithic surface that
            reads as architecture and performs as infrastructure.
          </p>

          <div className="mt-20 max-w-lg">
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
    <section className="relative min-h-[90vh] w-full overflow-hidden bg-black">
      <img
        src={resHero02}
        alt="Aerial view of a villa rooftop clad in seamless black solar glass"
        loading="lazy"
        width={1920}
        height={1088}
        className="absolute inset-0 h-full w-full object-cover"
        draggable={false}
      />
      <div className="absolute inset-0 bg-black/70" />

      <div className="relative z-10 mx-auto flex min-h-[90vh] max-w-[1400px] flex-col justify-center px-6 md:px-12">
        <motion.div {...fadeUp} className="max-w-2xl">
          <h2 className="text-balance text-3xl font-light uppercase tracking-[0.12em] text-white/90 sm:text-4xl lg:text-5xl">
            Zero Compromise
          </h2>
          <p className="mt-12 max-w-2xl text-sm font-light leading-relaxed text-white/50 md:text-base">
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
  { label: "Solar Capture", x: 140 },
  { label: "Smart Storage", x: 380 },
  { label: "EV Integration", x: 620 },
  { label: "The Estate", x: 860 },
];

function EcosystemInfographic() {
  return (
    <section className="bg-black py-32 lg:py-48">
      <div className="mx-auto max-w-[1400px] px-6 md:px-12">
        <motion.h2
          {...fadeUp}
          className="text-center text-2xl font-light uppercase tracking-[0.12em] text-white/90 sm:text-3xl lg:text-4xl"
        >
          The Autonomous Ecosystem
        </motion.h2>

        <motion.div {...fadeUp} className="mt-24 lg:mt-32">
          <svg
            viewBox="0 0 1000 240"
            className="mx-auto w-full max-w-5xl"
            role="img"
            aria-label="Wavenox energy flow: solar capture, smart storage, EV integration, the estate"
          >
            <line
              x1="140"
              y1="110"
              x2="860"
              y2="110"
              className="stroke-white/20"
              strokeWidth="0.5"
            />
            {NODES.map((n, i) => (
              <g key={n.label}>
                <circle
                  cx={n.x}
                  cy="110"
                  r="26"
                  fill="none"
                  className="stroke-white/20"
                  strokeWidth="0.5"
                />
                <circle cx={n.x} cy="110" r="2" className="fill-white/50" />
                <text
                  x={n.x}
                  y="180"
                  className="fill-white/50"
                  fontSize="9"
                  fontWeight="400"
                  letterSpacing="3"
                  textAnchor="middle"
                >
                  {`0${i + 1}`}
                </text>
                <text
                  x={n.x}
                  y="202"
                  className="fill-white/90"
                  fontSize="10"
                  fontWeight="300"
                  letterSpacing="2.6"
                  textAnchor="middle"
                >
                  {n.label.toUpperCase()}
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
    <section className="bg-black pb-32 lg:pb-48">
      <div className="mx-auto grid max-w-[1400px] items-center gap-24 lg:grid-cols-2 lg:gap-32">
        <div className="relative h-[440px] w-full overflow-hidden lg:h-[780px]">
          <img
            src={resInterior}
            alt="Luxury smart home energy control panel at night"
            loading="lazy"
            width={1408}
            height={1600}
            className="h-full w-full object-cover"
          />
        </div>

        <motion.div {...fadeUp} className="px-6 md:px-12 lg:pl-0 lg:pr-16">
          <h2 className="text-2xl font-light uppercase tracking-[0.12em] text-white/90 sm:text-3xl lg:text-4xl">
            System Configurations
          </h2>
          <p className="mt-10 max-w-lg text-sm font-light leading-relaxed text-white/50">
            Three deployment tiers, calibrated to the scale of the residence. Every
            configuration is engineered, commissioned, and monitored by Wavenox.
          </p>

          <div className="mt-16 flex flex-wrap gap-10">
            {(Object.keys(CONFIGS) as ConfigKey[]).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setActive(key)}
                className={`pb-2 text-[11px] font-normal uppercase tracking-[0.3em] transition-colors duration-700 ease-out ${
                  active === key
                    ? "border-b border-white text-white"
                    : "text-white/30 hover:text-white/60"
                }`}
              >
                {key}
              </button>
            ))}
          </div>

          <div className="mt-14 max-w-lg">
            {CONFIGS[active].map((row) => (
              <DataRow key={row.label} label={row.label} value={row.value} />
            ))}
          </div>

          <div className="mt-20">
            <button
              type="button"
              className="rounded-full bg-white px-10 py-4 text-sm font-medium tracking-[0.2em] text-black transition-all duration-700 ease-out hover:bg-white/90"
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
