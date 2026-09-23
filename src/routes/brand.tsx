import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ShieldCheck, Award, Zap, Compass, CheckCircle2 } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { openConsultationDrawer } from "@/components/ConsultationDrawer";
import { BRAND_CONFIG } from "@/config/brand";
import { BUSINESS } from "@/config/business";

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
    <section className="relative min-h-[85vh] w-full overflow-hidden bg-black flex items-center pt-28 pb-20">
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

          <motion.div {...fadeUp} className="border border-white/10 bg-white/[0.02] p-8 md:p-12">
            <h3 className="text-xs font-mono uppercase tracking-[0.3em] text-white/50">
              GLOBAL CERTIFICATION MATRIX
            </h3>
            <div className="mt-8 space-y-6">
              {[
                { label: "Bureau of Indian Standards", cert: "IS 14286 / IS 61730" },
                { label: "TÜV Rheinland Germany", cert: "IEC 61215 / IEC 61730" },
                { label: "Underwriters Laboratories", cert: "UL 790 Class A Fire Rated" },
                { label: "Structural Wind Resistance", cert: "ASTM E330 (Cat 5 Hurricane)" },
                { label: "IP Protection Rating", cert: "IP68 Submersible Junction Box" },
              ].map((c) => (
                <div key={c.label} className="flex justify-between items-baseline border-b border-white/10 pb-4">
                  <span className="text-sm text-white/70">{c.label}</span>
                  <span className="font-mono text-xs font-bold text-[#F57C00]">{c.cert}</span>
                </div>
              ))}
            </div>
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
      <LaboratorySection />
      <Footer />
    </main>
  );
}
