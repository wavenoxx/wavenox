import { motion, type Variants } from "framer-motion";
import {
  Wind,
  Zap,
  ShieldCheck,
  Hammer,
  TrendingUp,
  Wrench,
  CalendarClock,
  Check,
} from "lucide-react";

type Row = {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  criteria: string;
  conventional: { stat: string; sub: string };
  wavenox: { stat: string; sub: string };
};

const rows: Row[] = [
  {
    icon: Wind,
    criteria: "Structural Wind Rating",
    conventional: { stat: "< 100 kmph", sub: "High failure risk" },
    wavenox: { stat: "250 kmph", sub: "Cyclone-grade certified" },
  },
  {
    icon: Zap,
    criteria: "Power Density Yield",
    conventional: { stat: "Standard Output", sub: "Average efficiency" },
    wavenox: { stat: "Ultra-High Efficiency", sub: "30% more power per sqft" },
  },
  {
    icon: ShieldCheck,
    criteria: "Micro-Crack Vulnerability",
    conventional: { stat: "High Risk", sub: "Silent efficiency killer" },
    wavenox: { stat: "Zero", sub: "Monolithic durability" },
  },
  {
    icon: Hammer,
    criteria: "Installation Process",
    conventional: { stat: "Two Separate Phases", sub: "Roof first, solar second" },
    wavenox: { stat: "Single Turnkey Setup", sub: "Faster, cleaner, cheaper" },
  },
  {
    icon: TrendingUp,
    criteria: "Asset Classification",
    conventional: { stat: "Sunk Expense", sub: "Zero structural ROI" },
    wavenox: { stat: "Yielding Asset", sub: "Generates revenue from Day 1" },
  },
  {
    icon: Wrench,
    criteria: "Ongoing Upkeep",
    conventional: { stat: "High & Constant", sub: "Frequent repairs" },
    wavenox: { stat: "Virtually Zero", sub: "Self-cleaning flush profile" },
  },
  {
    icon: CalendarClock,
    criteria: "Performance Guarantee",
    conventional: { stat: "15-20 Years", sub: "Replacement needed sooner" },
    wavenox: { stat: "25+ Years", sub: "Ironclad warranty backed" },
  },
];

const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

const rowVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: "easeOut" },
  },
};

const headerVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

export function DataMatrix() {
  return (
    <section className="relative overflow-hidden bg-black py-16 md:py-24">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/3 h-[400px] w-[900px] -translate-x-1/2 rounded-full bg-[#F57C00]/8 blur-[160px]"
      />

      <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
        {/* Header */}
        <motion.div
          className="mx-auto max-w-3xl text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2, margin: "100px 0px 100px 0px" }}
        >
          <motion.div variants={headerVariants} className="flex justify-center">
            <span className="inline-flex items-center rounded-full border border-[#F57C00]/40 bg-white/5 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.32em] text-[#F5B366] backdrop-blur-xl shadow-[0_0_30px_-10px_rgba(245,124,0,0.5)]">
              The Data Doesn't Lie
            </span>
          </motion.div>

          <motion.div
            variants={headerVariants}
            className="mt-10 flex flex-col items-center justify-center gap-4 md:mt-14 md:flex-row md:gap-6"
          >
            <span className="whitespace-nowrap text-xl font-medium text-gray-400 sm:text-2xl md:text-3xl lg:text-4xl">
              Conventional Roof
            </span>
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/[0.04] text-[11px] font-bold tracking-[0.15em] text-white/80 backdrop-blur-2xl shadow-[0_0_24px_-10px_rgba(245,124,0,0.5)] md:h-12 md:w-12 md:text-xs">
              VS
            </span>
            <span
              className="whitespace-nowrap text-xl font-bold text-[#F57C00] sm:text-2xl md:text-3xl lg:text-4xl"
              style={{ filter: "drop-shadow(0 0 10px rgba(245,124,0,0.35))" }}
            >
              Wavenox Supremacy
            </span>
          </motion.div>

          <motion.p
            variants={headerVariants}
            className="mx-auto mt-10 max-w-2xl text-balance text-sm leading-relaxed text-white/60 md:mt-14 md:text-base"
          >
            Analyze the raw performance metrics. See exactly why commercial and
            residential owners are abandoning conventional solar
          </motion.p>
        </motion.div>


        {/* Data matrix */}
        <motion.div
          className="relative mt-12 overflow-hidden rounded-2xl p-px md:mt-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1, margin: "100px 0px 100px 0px" }}
          variants={container}
        >
          <span aria-hidden className="card-glow-spin opacity-60" />
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/90 backdrop-blur-2xl">

          {/* Column headers - desktop only */}
          <div className="hidden grid-cols-[1.5fr_1fr_1fr] gap-4 border-b border-white/10 bg-white/[0.02] px-6 py-4 md:grid md:px-8">
            <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/40">
              Criteria
            </span>
            <span className="text-center text-[10px] font-semibold uppercase tracking-[0.28em] text-red-400/70">
              Conventional
            </span>
            <span className="text-right text-[10px] font-semibold uppercase tracking-[0.28em] text-[#F5B366]">
              Wavenox
            </span>
          </div>

          {rows.map((row, i) => {
            const Icon = row.icon;
            return (
              <motion.div
                key={row.criteria}
                variants={rowVariants}
                className={`group relative transition-colors duration-300 hover:bg-white/[0.04] ${
                  i !== rows.length - 1 ? "border-b border-white/5" : ""
                }`}
              >
                {/* Mobile: mini-card */}
                <div className="grid grid-cols-1 gap-4 p-5 md:hidden">
                  <div className="flex items-center gap-3">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/5">
                      <Icon className="h-4 w-4 text-white/70" strokeWidth={1.75} />
                    </span>
                    <span className="text-sm font-semibold text-white">
                      {row.criteria}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 pl-11">
                    <div className="rounded-xl border border-red-500/15 bg-red-500/[0.04] p-3">
                      <p className="text-[9px] font-semibold uppercase tracking-widest text-red-400/70">
                        Conventional
                      </p>
                      <p className="mt-1.5 text-sm font-semibold text-red-400/90">
                        {row.conventional.stat}
                      </p>
                      <p className="mt-1 text-[10px] leading-relaxed text-white/50">
                        {row.conventional.sub}
                      </p>
                    </div>
                    <div className="rounded-xl border border-[#F57C00]/25 bg-[#F57C00]/[0.05] p-3 shadow-[0_0_24px_-12px_rgba(245,124,0,0.6)]">
                      <p className="text-[9px] font-semibold uppercase tracking-widest text-[#F5B366]">
                        Wavenox
                      </p>
                      <p className="mt-1.5 flex items-center gap-1.5 text-sm font-semibold text-[#F57C00]">
                        <Check className="h-3 w-3 shrink-0" strokeWidth={3} />
                        {row.wavenox.stat}
                      </p>
                      <p className="mt-1 text-[10px] leading-relaxed text-white/60">
                        {row.wavenox.sub}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Desktop: 3-column row */}
                <div className="hidden grid-cols-[1.5fr_1fr_1fr] items-center gap-4 px-8 py-6 md:grid">
                  <div className="flex items-center gap-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/5 transition-colors duration-300 group-hover:border-[#F57C00]/40 group-hover:bg-[#F57C00]/5">
                      <Icon
                        className="h-4 w-4 text-white/70 transition-colors duration-300 group-hover:text-[#F5B366]"
                        strokeWidth={1.75}
                      />
                    </span>
                    <span className="text-sm font-semibold text-white md:text-base">
                      {row.criteria}
                    </span>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-red-400/80 md:text-base">
                      {row.conventional.stat}
                    </p>
                    <p className="mt-1 text-[10px] text-white/40 md:text-xs">
                      {row.conventional.sub}
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className="inline-flex items-center gap-2 text-sm font-semibold text-[#F57C00] transition-[filter] duration-300 group-hover:[filter:drop-shadow(0_0_10px_rgba(245,124,0,0.6))] md:text-base"
                    >
                      {row.wavenox.stat}
                      <span className="grid h-4 w-4 shrink-0 place-items-center rounded-full bg-[#F57C00]/20 shadow-[0_0_10px_rgba(245,124,0,0.5)] animate-pulse">
                        <Check
                          className="h-2.5 w-2.5 text-[#FFB547]"
                          strokeWidth={3}
                        />
                      </span>
                    </p>
                    <p className="mt-1 text-[10px] text-white/50 md:text-xs">
                      {row.wavenox.sub}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
          </div>
        </motion.div>
      </div>
    </section>

  );
}
