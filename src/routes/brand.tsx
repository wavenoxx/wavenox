import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ShieldCheck, Award, Zap, Compass, CheckCircle2, TrendingUp, Sliders } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { openConsultationDrawer } from "@/components/ConsultationDrawer";
import { BRAND_CONFIG } from "@/config/brand";
import { BUSINESS } from "@/config/business";
import resTile from "@/assets/res-tile.jpg";
import lgHero02 from "@/assets/lg-hero-02.jpg";
import eco04Tree from "@/assets/eco-04-tree.jpg";

export const Route = createFileRoute("/brand")({
  head: () => ({
    meta: [
      { title: `Our Brand & Engineering Ethos — ${BRAND_CONFIG.name}` },
      {
        name: "description",
        content:
          "The WAVENOX Manifesto: Why traditional bolt-on solar is an obsolete liability. Monolithic architectural glass, 25-year structural warranty, and pure energy independence.",
      },
      { property: "og:title", content: `Brand & Engineering Manifesto — ${BRAND_CONFIG.name}` },
      {
        property: "og:description",
        content:
          "Monolithic solar architecture forged with aerospace-grade resilience. Headquartered in Hyderabad, deployed globally.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: BrandPage,
});

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.3 },
  transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const },
};

function BrandHero() {
  return (
    <section className="relative min-h-[88vh] w-full overflow-hidden bg-black flex items-center pt-28 pb-20">
      {/* Background macro texture with soft fade */}
      <img
        src={resTile}
        alt="WAVENOX monolithic solar architectural glass detail"
        className="absolute inset-0 h-full w-full object-cover opacity-20"
        loading="eager"
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/90 via-black/60 to-black"
        aria-hidden="true"
      />

      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[450px] w-[600px] rounded-full bg-[#F57C00]/10 blur-[160px] pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-12 w-full text-center">
        <motion.div {...fadeUp} className="mx-auto max-w-3xl">
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-[#F57C00]">
            THE {BRAND_CONFIG.name.toUpperCase()} MANIFESTO
          </span>
          <h1 className="mt-4 text-4xl font-bold uppercase leading-[1.05] tracking-tight text-white md:text-6xl lg:text-7xl">
            ABSOLUTE POWER. ZERO COMPROMISE.
          </h1>
          <p className="mt-6 mx-auto max-w-2xl text-base leading-relaxed text-white/70 md:text-lg">
            For three decades, solar has been treated as an unsightly mechanical attachment: aluminum rails screwed into terracotta, exposed copper cables, and compromised roof waterproofing. We built {BRAND_CONFIG.name} to eliminate that compromise forever.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => openConsultationDrawer("villa")}
              className="cursor-pointer rounded-full bg-[#F57C00] px-8 py-4 text-xs font-bold uppercase tracking-[0.25em] text-black transition-all duration-300 hover:bg-white"
            >
              COMMISSION PRIVATE CONSULTATION →
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

const PRINCIPLES = [
  {
    num: "01",
    title: "Monolithic Architectural Synthesis",
    desc: "Energy generation must never compromise architectural beauty. Our Liquid Glass tiles function simultaneously as the primary weather barrier, structural armor, and high-efficiency photovoltaic engine.",
  },
  {
    num: "02",
    title: "The 25-Year Generational Pact",
    desc: "Energy infrastructure is not disposable consumer electronics. Every seal, connector, and semiconductor in our ecosystem is rated for a minimum quarter-century of continuous tropical operation.",
  },
  {
    num: "03",
    title: "Sub-Millisecond Energy Sovereignity",
    desc: "True luxury is complete autonomy. When central grids falter, our systems isolate seamlessly with zero interruption to computational, life-support, or estate security operations.",
  },
];

function BrandPrinciples() {
  return (
    <section className="bg-black py-24 md:py-36 border-t border-white/10">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <motion.div {...fadeUp} className="max-w-2xl">
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-[#F57C00]">
            FOUNDING TENETS
          </span>
          <h2 className="mt-4 text-3xl font-bold uppercase tracking-tight text-white md:text-5xl">
            HOW WE ENGINEER CERTAINTY
          </h2>
        </motion.div>

        <div className="mt-16 grid grid-cols-1 gap-10 md:grid-cols-3">
          {PRINCIPLES.map((p, idx) => (
            <motion.div
              key={p.num}
              {...fadeUp}
              transition={{ duration: 0.6, delay: idx * 0.15 }}
              className="border border-white/10 bg-white/[0.02] p-8 md:p-10 flex flex-col justify-between"
            >
              <div>
                <span className="font-mono text-2xl font-bold text-[#F57C00]">
                  {p.num}
                </span>
                <h3 className="mt-6 text-xl font-bold uppercase tracking-tight text-white">
                  {p.title}
                </h3>
                <p className="mt-4 text-sm leading-relaxed text-white/60">
                  {p.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function GenerationalWarrantySimulator() {
  const [selectedYear, setSelectedYear] = useState(25);

  // Degradation calculation: Year 1: 98%, subsequent years: -0.40% per year
  const wavenoxRetention = Number((98.0 - (selectedYear - 1) * 0.40).toFixed(1));
  const conventionalRetention = Math.max(40, Number((97.0 - (selectedYear - 1) * 1.15).toFixed(1)));

  return (
    <section className="bg-black py-24 md:py-36 border-t border-white/10">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <motion.div {...fadeUp} className="max-w-3xl">
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-[#F57C00]">
            THE 25-YEAR GENERATIONAL PACT
          </span>
          <h2 className="mt-4 text-3xl font-bold uppercase tracking-tight text-white md:text-5xl">
            LINEAR PERFORMANCE GUARANTEE
          </h2>
          <p className="mt-4 text-sm text-white/60 md:text-base">
            While conventional solar panels suffer severe degradation from tropical UV and thermal fatigue, WAVENOX dual-tempered N-Type cells maintain minimum 88.4% output at Year 25.
          </p>
        </motion.div>

        <motion.div {...fadeUp} className="mt-16 border border-white/10 bg-white/[0.02] p-8 md:p-12">
          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <div>
              <span className="font-mono text-xs uppercase tracking-widest text-[#F57C00]">
                SIMULATE ASSET LIFECYCLE
              </span>
              <h3 className="text-xl font-bold uppercase text-white mt-1">
                Operational Lifespan: Year {selectedYear}
              </h3>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono text-white/50">WAVENOX GUARANTEE</span>
              <div className="font-mono text-2xl font-bold text-emerald-400">
                {wavenoxRetention}% Power Retention
              </div>
            </div>
          </div>

          <div className="mt-8">
            <input
              type="range"
              min="1"
              max="25"
              step="1"
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="w-full accent-[#F57C00] cursor-pointer"
            />
            <div className="mt-2 flex justify-between font-mono text-xs text-white/40">
              <span>Year 01 (Genesis)</span>
              <span>Year 10 (Decade 1)</span>
              <span>Year 25 (Silver Jubilee)</span>
            </div>
          </div>

          {/* Comparison readout bars */}
          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-white/10 pt-8">
            <div className="border border-white/10 bg-black/60 p-6">
              <div className="flex justify-between items-baseline">
                <span className="font-mono text-xs font-bold text-white">WAVENOX LIQUID GLASS</span>
                <span className="font-mono text-xl font-bold text-[#F57C00]">{wavenoxRetention}%</span>
              </div>
              <div className="mt-4 h-2 w-full bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#F57C00] transition-all duration-300"
                  style={{ width: `${wavenoxRetention}%` }}
                />
              </div>
              <p className="mt-3 text-xs text-white/60">
                Aerospace polymeric dampening eliminates micro-cracks and hot-spots.
              </p>
            </div>

            <div className="border border-white/10 bg-black/60 p-6">
              <div className="flex justify-between items-baseline">
                <span className="font-mono text-xs font-bold text-white/60">CONVENTIONAL BOLT-ON SOLAR</span>
                <span className="font-mono text-xl font-bold text-red-400">{conventionalRetention}%</span>
              </div>
              <div className="mt-4 h-2 w-full bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-red-400 transition-all duration-300"
                  style={{ width: `${conventionalRetention}%` }}
                />
              </div>
              <p className="mt-3 text-xs text-white/60">
                Plastic backsheets yellow, delaminate, and suffer thermal cell fracture.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function LaboratorySection() {
  return (
    <section className="bg-black py-24 md:py-36 border-t border-white/10">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
          <motion.div {...fadeUp}>
            <span className="font-mono text-xs uppercase tracking-[0.3em] text-[#F57C00]">
              R&D HEADQUARTERS
            </span>
            <h2 className="mt-4 text-3xl font-bold uppercase tracking-tight text-white md:text-5xl">
              ENGINEERED IN HYDERABAD. DEPLOYED NATIONWIDE.
            </h2>
            <p className="mt-6 text-sm leading-relaxed text-white/70 md:text-base">
              At our {BUSINESS.primaryCity} engineering and testing facility, every batch of {BRAND_CONFIG.name} tiles undergoes severe environmental stress: 250-hour cyclic salt fog, Category 5 hurricane wind tunneling, and hail impact strikes at 160 km/h.
            </p>
            <div className="mt-8 grid grid-cols-2 gap-6">
              <div className="border border-white/10 p-5">
                <span className="font-mono text-2xl font-bold text-white">25-Yr</span>
                <p className="mt-2 text-xs text-white/60">Linear Performance Guarantee</p>
              </div>
              <div className="border border-white/10 p-5">
                <span className="font-mono text-2xl font-bold text-[#F57C00]">Class A</span>
                <p className="mt-2 text-xs text-white/60">Fire & Ballistic Rating</p>
              </div>
            </div>
            <div className="mt-10">
              <button
                type="button"
                onClick={() => openConsultationDrawer("villa")}
                className="cursor-pointer rounded-full bg-white px-8 py-3.5 text-xs font-bold uppercase tracking-[0.25em] text-black transition-all duration-300 hover:bg-[#F57C00] hover:text-black"
              >
                SCHEDULE PRIVATE LAB INSPECTION →
              </button>
            </div>
          </motion.div>

          <motion.div {...fadeUp} className="border border-white/10 bg-black overflow-hidden relative">
            <img
              src={lgHero02}
              alt="WAVENOX Hyderabad testing facility and architectural cleanroom deployment"
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

function BrandPage() {
  return (
    <main className="min-h-screen w-full bg-black">
      <Header />
      <BrandHero />
      <BrandPrinciples />
      <GenerationalWarrantySimulator />
      <LaboratorySection />
      <Footer />
    </main>
  );
}
