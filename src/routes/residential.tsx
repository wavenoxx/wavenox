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
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.3 },
  transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] as const },
};

function DataRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-10 border-b border-white/10 py-5">
      <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-gray-400 md:text-xs">
        {label}
      </span>
      <span className="text-sm font-semibold tracking-tight text-white md:text-base">
        {value}
      </span>
    </div>
  );
}

function CoreHero() {
  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-black">
      <img
        src={resHero01}
        alt="Ultra-modern billionaire estate at twilight with integrated black glass solar roof"
        width={1920}
        height={1088}
        className="absolute inset-0 h-full w-full object-cover"
        draggable={false}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black via-black/40 to-black" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-black/80" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-[1400px] flex-col items-center justify-center px-6 text-center md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        >
          <h1 className="text-balance text-4xl font-bold uppercase leading-[1.05] tracking-tight text-white md:text-6xl lg:text-7xl">
            The Luxury Estate
          </h1>
          <p className="mx-auto mt-8 max-w-2xl text-[10px] font-semibold uppercase leading-relaxed tracking-[0.28em] text-gray-400 md:text-xs">
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
      <div className="mx-auto grid max-w-[1400px] items-center gap-16 px-6 md:px-12 lg:grid-cols-2 lg:gap-24">
        <motion.div {...fadeUp} className="relative">
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,rgba(245,124,0,0.18),transparent_65%)] blur-2xl" />
          <img
            src={resTile}
            alt="Macro shot of Wavenox Liquid Glass solar tile"
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
          <h2 className="text-3xl font-bold uppercase leading-[1.1] tracking-tight text-white md:text-4xl lg:text-5xl">
            Architectural Power
          </h2>
          <p className="mt-6 max-w-lg text-sm leading-relaxed text-gray-400 md:text-base">
            Each Liquid Glass tile replaces conventional roofing entirely — no frames,
            no conduits, no visual compromise. A monolithic surface that reads as
            architecture and performs as infrastructure.
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
        alt="Seamless black solar glass roof merging with a cinematic dusk sky"
        loading="lazy"
        width={1920}
        height={1088}
        className="absolute inset-0 h-full w-full object-cover"
        draggable={false}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/60" />

      <div className="relative z-10 mx-auto flex min-h-[80vh] max-w-[1400px] flex-col justify-center px-6 md:px-12">
        <motion.div {...fadeUp} className="max-w-2xl">
          <h2 className="text-balance text-4xl font-bold uppercase leading-[1.05] tracking-tight text-white md:text-5xl lg:text-6xl">
            Zero Compromise
          </h2>
          <p className="mt-6 max-w-xl text-sm leading-relaxed text-gray-300 md:text-base">
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
  { label: "Solar Capture", r: 190 },
  { label: "Smart Storage", r: 300 },
  { label: "EV Integration", r: 410 },
  { label: "The Estate", r: 520 },
];

function EcosystemInfographic() {
  return (
    <section className="bg-black py-20 md:py-32">
      <div className="mx-auto max-w-[1400px] px-6 md:px-12">
        <motion.h2
          {...fadeUp}
          className="text-center text-3xl font-bold uppercase tracking-tight text-white md:text-4xl lg:text-5xl"
        >
          The Autonomous Ecosystem
        </motion.h2>

        <motion.div {...fadeUp} className="mt-14 md:mt-20">
          <svg
            viewBox="0 0 1200 620"
            className="mx-auto w-full max-w-6xl"
            role="img"
            aria-label="Wavenox energy flow: solar capture, smart storage, EV integration, the estate"
          >
            <defs>
              <radialGradient id="coreGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#F57C00" stopOpacity="0.55" />
                <stop offset="100%" stopColor="#F57C00" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Core */}
            <circle cx="600" cy="620" r="260" fill="url(#coreGlow)" />
            <circle cx="600" cy="620" r="140" className="fill-white" />

            {NODES.map((n, i) => {
              const angle = 208 + i * 12;
              const rad = (angle * Math.PI) / 180;
              const x = 600 + n.r * Math.cos(rad);
              const y = 620 + n.r * Math.sin(rad);
              return (
                <g key={n.label}>
                  <path
                    d={`M ${600 - n.r} 620 A ${n.r} ${n.r} 0 0 1 ${600 + n.r} 620`}
                    fill="none"
                    stroke="#ffffff"
                    strokeOpacity="0.35"
                    strokeWidth="1"
                    strokeDasharray="2 8"
                    strokeLinecap="round"
                  />
                  <circle cx={x} cy={y} r="9" className="fill-white" />
                  <circle
                    cx={x}
                    cy={y}
                    r="20"
                    fill="none"
                    stroke="#F57C00"
                    strokeOpacity="0.8"
                    strokeWidth="1.2"
                  />
                  <line
                    x1={x - 20}
                    y1={y}
                    x2={x - 70}
                    y2={y - 26}
                    stroke="#ffffff"
                    strokeOpacity="0.8"
                    strokeWidth="1"
                  />
                  <line
                    x1={x - 70}
                    y1={y - 26}
                    x2={x - 210}
                    y2={y - 26}
                    stroke="#ffffff"
                    strokeOpacity="0.8"
                    strokeWidth="1"
                  />
                  <text
                    x={x - 210}
                    y={y - 36}
                    className="fill-white"
                    fontSize="14"
                    fontWeight="700"
                    letterSpacing="3"
                  >
                    {n.label.toUpperCase()}
                  </text>
                </g>
              );
            })}
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
    <section className="bg-black pb-20 md:pb-32">
      <div className="mx-auto grid max-w-[1400px] items-center gap-16 lg:grid-cols-2 lg:gap-24">
        <div className="relative h-[420px] w-full overflow-hidden lg:h-[760px]">
          <img
            src={resInterior}
            alt="Luxury smart home energy hub glowing in a dark interior at night"
            loading="lazy"
            width={1088}
            height={1408}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black lg:to-black" />
        </div>

        <motion.div {...fadeUp} className="px-6 md:px-12 lg:pl-0 lg:pr-16">
          <h2 className="text-3xl font-bold uppercase leading-[1.1] tracking-tight text-white md:text-4xl lg:text-5xl">
            System Configurations
          </h2>
          <p className="mt-6 max-w-lg text-sm leading-relaxed text-gray-400 md:text-base">
            Three deployment tiers, calibrated to the scale of the residence. Every
            configuration is engineered, commissioned, and monitored by Wavenox.
          </p>

          <div className="mt-10 flex flex-wrap gap-8">
            {(Object.keys(CONFIGS) as ConfigKey[]).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setActive(key)}
                className={`pb-2 text-[11px] font-bold uppercase tracking-[0.25em] transition-colors duration-300 ${
                  active === key
                    ? "border-b border-white text-white"
                    : "text-white/30 hover:text-white/70"
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
              className="rounded-full bg-white px-10 py-4 text-[11px] font-bold uppercase tracking-[0.2em] text-black transition-all duration-500 hover:bg-white/90"
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
