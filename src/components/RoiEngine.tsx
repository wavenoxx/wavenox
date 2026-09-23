import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform, type Variants } from "framer-motion";
import { Ruler, Zap, TrendingUp, BarChart3 } from "lucide-react";

// ---- Financial model (placeholder assumptions) ----
const WATTS_PER_SQFT_WAVENOX = 13; // W/sqft
const WATTS_PER_SQFT_CONV = 10; // W/sqft
const GEN_HOURS_PER_YEAR = 1600; // effective sun hours
const TARIFF_INR_PER_KWH = 9.5; // avoided grid cost
const YEARS = 25;

function computeYield(sqft: number, wattsPerSqft: number) {
  const kw = (sqft * wattsPerSqft) / 1000;
  const annualKwh = kw * GEN_HOURS_PER_YEAR;
  const lifetimeInr = annualKwh * TARIFF_INR_PER_KWH * YEARS;
  return { kw, annualKwh, lifetimeInr };
}

function formatLakhs(n: number) {
  return `₹${(n / 100000).toLocaleString("en-IN", { maximumFractionDigits: 1 })} L`;
}
function formatInt(n: number) {
  return Math.round(n).toLocaleString("en-IN");
}

// ---- Animated counting number ----
function CountUp({
  value,
  format,
  className,
}: {
  value: number;
  format: (n: number) => string;
  className?: string;
}) {
  const mv = useMotionValue(value);
  const spring = useSpring(mv, { stiffness: 90, damping: 20, mass: 0.6 });
  const [display, setDisplay] = useState(format(value));
  const prevRef = useRef(value);

  useEffect(() => {
    mv.set(value);
  }, [value, mv]);

  useEffect(() => {
    const unsub = spring.on("change", (v: number) => {
      setDisplay(format(v));
      prevRef.current = v;
    });
    return () => unsub();
  }, [spring, format]);

  return <span className={className}>{display}</span>;
}

const headerVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const panelVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut", delay: 0.1 + i * 0.1 },
  }),
};

// ---- Physics bar ----
function PhysicsBar({
  targetPct,
  label,
  value,
  variant,
}: {
  targetPct: number;
  label: string;
  value: string;
  variant: "wavenox" | "conv";
}) {
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { stiffness: 100, damping: 15 });
  const height = useTransform(spring, (v: number) => `${v}%`);

  useEffect(() => {
    mv.set(targetPct);
  }, [targetPct, mv]);

  const isWx = variant === "wavenox";

  return (
    <div className="flex flex-1 flex-col items-center gap-3">
      <div className="relative flex h-56 w-full max-w-[80px] items-end justify-center overflow-hidden rounded-xl border border-white/10 bg-white/[0.02]">
        <motion.div
          style={{ height }}
          className={
            isWx
              ? "w-full rounded-xl bg-gradient-to-t from-[#F57C00] via-[#FF9A2E] to-[#FFC978] shadow-[0_-10px_40px_-5px_rgba(245,124,0,0.7)]"
              : "w-full rounded-xl bg-gradient-to-t from-white/15 via-white/20 to-white/30"
          }
        />
        {isWx && (
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-[#F57C00]/30"
          />
        )}
      </div>
      <div className="text-center">
        <p
          className={`text-sm font-semibold ${
            isWx ? "text-[#F57C00]" : "text-white/70"
          }`}
        >
          {value}
        </p>
        <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">
          {label}
        </p>
      </div>
    </div>
  );
}

export function RoiEngine() {
  const [sqft, setSqft] = useState(12800);

  const wx = computeYield(sqft, WATTS_PER_SQFT_WAVENOX);
  const conv = computeYield(sqft, WATTS_PER_SQFT_CONV);
  const savings = wx.lifetimeInr - conv.lifetimeInr;

  // Fixed ceiling based on max slider (100,000 sqft) at Wavenox density so
  // Wavenox is always taller than Conventional and both bars scale live.
  const maxPossibleYield = computeYield(100000, WATTS_PER_SQFT_WAVENOX).lifetimeInr;
  const wxPct = Math.max((wx.lifetimeInr / maxPossibleYield) * 100, 8);
  const convPct = Math.max((conv.lifetimeInr / maxPossibleYield) * 100, 5);

  return (
    <section
      className="relative overflow-hidden py-16 md:py-24"
      style={{ backgroundImage: "none", backgroundColor: "#000000" }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#F57C00]/8 blur-[180px]"
      />

      <div className="relative mx-auto max-w-6xl px-5 pt-16 sm:px-8 md:pt-32">
        {/* Header */}
        <motion.div
          className="mx-auto max-w-3xl text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2, margin: "100px 0px 100px 0px" }}
        >
          <motion.div variants={headerVariants} className="flex justify-center">
            <span className="inline-flex items-center rounded-full border border-[#F57C00]/40 bg-white/5 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.32em] text-[#F5B366] backdrop-blur-xl shadow-[0_0_30px_-10px_rgba(245,124,0,0.5)]">
              ROI Matrix
            </span>
          </motion.div>

          <motion.h2
            variants={headerVariants}
            className="mt-10 text-balance text-3xl font-bold leading-[1.1] tracking-tight text-white md:mt-14 md:text-4xl lg:text-5xl"
          >
            The Wavenox{" "}
            <span
              className="text-[#F57C00]"
              style={{ filter: "drop-shadow(0 0 10px rgba(245,124,0,0.4))" }}
            >
              Financial Engine
            </span>
          </motion.h2>

          <motion.p
            variants={headerVariants}
            className="mx-auto mt-8 max-w-2xl text-balance text-sm leading-relaxed text-gray-300 md:mt-10 md:text-base"
          >
            Input your architectural footprint. Instantly visualize your 25-year
            wealth generation and energy supremacy over conventional systems
          </motion.p>
        </motion.div>

        {/* 3-Column Grid */}
        <div className="mt-16 grid auto-rows-fr grid-cols-1 gap-8 md:mt-20 lg:grid-cols-3">
          {/* Column 1: Inputs */}
          <motion.div
            custom={0}
            variants={panelVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            className="relative h-full overflow-hidden rounded-2xl p-px"
          >
            <span aria-hidden className="card-glow-spin opacity-60" />
            <div className="relative flex h-full flex-col rounded-2xl border border-white/10 bg-black/90 p-6 backdrop-blur-2xl md:p-8">
              <div className="flex items-center gap-2">
                <span className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 bg-white/5">
                  <Ruler className="h-4 w-4 text-[#F5B366]" strokeWidth={1.75} />
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/50">
                  Architectural Footprint
                </span>
              </div>

              <div className="mt-8 flex flex-1 flex-col justify-center">
                <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/40">
                  Roof Area
                </p>
                <div className="mt-2 flex items-baseline gap-2">
                  <CountUp
                    value={sqft}
                    format={formatInt}
                    className="text-4xl font-bold tracking-tight text-white md:text-5xl"
                  />
                  <span className="text-sm font-medium text-white/50">sq.ft</span>
                </div>

                {/* Custom slider */}
                <div className="mt-8">
                  <input
                    type="range"
                    min={1000}
                    max={100000}
                    step={100}
                    value={sqft}
                    onChange={(e) => setSqft(parseInt(e.target.value, 10))}
                    className="wavenox-slider w-full"
                    style={{
                      background: `linear-gradient(to right, #F57C00 0%, #F57C00 ${
                        ((sqft - 1000) / (100000 - 1000)) * 100
                      }%, rgba(255,255,255,0.1) ${
                        ((sqft - 1000) / (100000 - 1000)) * 100
                      }%, rgba(255,255,255,0.1) 100%)`,
                    }}
                  />
                  <div className="mt-3 flex justify-between text-[10px] font-medium text-white/40">
                    <span>1,000</span>
                    <span>100,000</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 rounded-xl border border-white/10 bg-white/[0.02] p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/40">
                  Derived Capacity
                </p>
                <div className="mt-2 flex items-baseline gap-1.5">
                  <CountUp
                    value={wx.kw}
                    format={(n) => n.toFixed(1)}
                    className="text-2xl font-bold text-[#F57C00]"
                  />
                  <span className="text-xs font-medium text-white/50">kW installed</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Column 2: Projections */}
          <motion.div
            custom={1}
            variants={panelVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            className="relative h-full overflow-hidden rounded-2xl p-px"
          >
            <span aria-hidden className="card-glow-spin opacity-60" />
            <div className="relative flex h-full flex-col rounded-2xl border border-white/10 bg-black/90 p-6 backdrop-blur-2xl md:p-8">
              <div className="flex items-center gap-2">
                <span className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 bg-white/5">
                  <TrendingUp className="h-4 w-4 text-[#F5B366]" strokeWidth={1.75} />
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/50">
                  25-Year Projection
                </span>
              </div>

              <div className="mt-8 flex flex-1 flex-col justify-center gap-6">
                {/* Wavenox */}
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#F5B366]">
                    Wavenox Yield
                  </p>
                  <CountUp
                    value={wx.lifetimeInr}
                    format={formatLakhs}
                    className="mt-1 block text-3xl font-bold tracking-tight text-[#F57C00] md:text-4xl"
                  />
                  <p className="mt-1 text-[11px] text-white/50">
                    <CountUp
                      value={wx.annualKwh}
                      format={formatInt}
                      className="font-semibold text-white/70"
                    />
                    {" "}kWh generated annually
                  </p>
                </div>

                <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                {/* Conventional */}
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/40">
                    Conventional Yield
                  </p>
                  <CountUp
                    value={conv.lifetimeInr}
                    format={formatLakhs}
                    className="mt-1 block text-3xl font-bold tracking-tight text-white/60 md:text-4xl"
                  />
                  <p className="mt-1 text-[11px] text-white/40">
                    <CountUp
                      value={conv.annualKwh}
                      format={formatInt}
                      className="font-semibold text-white/60"
                    />
                    {" "}kWh generated annually
                  </p>
                </div>
              </div>

              {/* Net savings highlight */}
              <div className="mt-8 rounded-xl border border-[#F57C00]/30 bg-[#F57C00]/[0.06] p-4 shadow-[0_0_40px_-15px_rgba(245,124,0,0.6)]">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#F57C00] opacity-60" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-[#F57C00] animate-pulse" />
                  </span>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#F5B366]">
                    Net Savings
                  </p>
                </div>
                <CountUp
                  value={savings}
                  format={formatLakhs}
                  className="mt-2 block text-2xl font-bold tracking-tight text-white md:text-3xl"
                />
                <p className="mt-1 text-[11px] text-white/50">
                  Lifetime wealth generated over conventional
                </p>
              </div>
            </div>
          </motion.div>

          {/* Column 3: Analytics */}
          <motion.div
            custom={2}
            variants={panelVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            className="relative h-full overflow-hidden rounded-2xl p-px"
          >
            <span aria-hidden className="card-glow-spin opacity-60" />
            <div className="relative flex h-full flex-col rounded-2xl border border-white/10 bg-black/90 p-6 backdrop-blur-2xl md:p-8">
              <div className="flex items-center gap-2">
                <span className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 bg-white/5">
                  <BarChart3 className="h-4 w-4 text-[#F5B366]" strokeWidth={1.75} />
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/50">
                  Yield Analytics
                </span>
              </div>

              <div className="mt-8 flex flex-1 items-end justify-center gap-6">
                <PhysicsBar
                  targetPct={wxPct}
                  label="Wavenox"
                  value={formatLakhs(wx.lifetimeInr)}
                  variant="wavenox"
                />
                <PhysicsBar
                  targetPct={convPct}
                  label="Conventional"
                  value={formatLakhs(conv.lifetimeInr)}
                  variant="conv"
                />
              </div>

              <div className="mt-8 flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3">
                <Zap className="h-3.5 w-3.5 text-[#F57C00]" strokeWidth={2} />
                <p className="text-[11px] text-white/60">
                  <span className="font-semibold text-white/80">
                    +{Math.round(((wx.lifetimeInr - conv.lifetimeInr) / conv.lifetimeInr) * 100)}%
                  </span>{" "}
                  lifetime yield advantage
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
