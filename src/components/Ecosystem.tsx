import { motion, type Variants } from "framer-motion";
import { useState } from "react";
import { Sun, Battery, Plug, Cpu, Shield, type LucideIcon } from "lucide-react";

type Satellite = {
  id: string;
  icon: LucideIcon;
  title: string;
  subtext: string;
  // desktop positioning
  pos: { top?: string; bottom?: string; left?: string; right?: string };
  // angle from center (degrees) — for the connecting beam
  angle: number;
  // beam length in px
  length: number;
};

const satellites: Satellite[] = [
  {
    id: "storage",
    icon: Battery,
    title: "Intelligent Storage",
    subtext: "Next-gen battery bank architecture",
    pos: { top: "10%", left: "10%" },
    angle: 225,
    length: 300,
  },
  {
    id: "ev",
    icon: Plug,
    title: "EV Integration",
    subtext: "High-speed charging networks",
    pos: { top: "10%", right: "10%" },
    angle: 315,
    length: 300,
  },
  {
    id: "ai",
    icon: Cpu,
    title: "AI Energy Routing",
    subtext: "Smart-home and building management",
    pos: { bottom: "10%", left: "10%" },
    angle: 135,
    length: 300,
  },
  {
    id: "grid",
    icon: Shield,
    title: "Microgrid Freedom",
    subtext: "Zero reliance on state infrastructure",
    pos: { bottom: "10%", right: "10%" },
    angle: 45,
    length: 300,
  },
];

const headerVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15, delayChildren: 0.2 } },
};

const nodeFade: Variants = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

function Beam({ angle, length, active }: { angle: number; length: number; active: boolean }) {
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute left-1/2 top-1/2 origin-left"
      style={{
        width: length,
        height: 1,
        transform: `rotate(${angle}deg)`,
      }}
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
    >
      <div
        className="h-full w-full transition-all duration-500"
        style={{
          background: active
            ? "linear-gradient(to right, rgba(245,124,0,0.9), rgba(245,124,0,0.2))"
            : "linear-gradient(to right, rgba(245,124,0,0.35), rgba(245,124,0,0.05))",
          boxShadow: active
            ? "0 0 18px rgba(245,124,0,0.9), 0 0 40px rgba(245,124,0,0.5)"
            : "0 0 8px rgba(245,124,0,0.2)",
          opacity: active ? 1 : 0.25,
        }}
      />
    </motion.div>
  );
}

function SatelliteNode({
  sat,
  onHover,
  active,
}: {
  sat: Satellite;
  onHover: (id: string | null) => void;
  active: boolean;
}) {
  const Icon = sat.icon;
  return (
    <motion.div
      variants={nodeFade}
      onHoverStart={() => onHover(sat.id)}
      onHoverEnd={() => onHover(null)}
      whileHover={{ scale: 1.1 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className="absolute z-10 w-56"
      style={sat.pos}
    >
      <div
        className={`group flex flex-col items-center gap-3 rounded-2xl border p-5 text-center backdrop-blur-2xl transition-all duration-500 ${
          active
            ? "border-[#F57C00]/60 bg-white/10 shadow-[0_0_40px_-8px_rgba(245,124,0,0.7)]"
            : "border-white/10 bg-white/5"
        }`}
      >
        <span
          className={`grid h-12 w-12 place-items-center rounded-full border transition-all duration-500 ${
            active
              ? "border-[#F57C00]/70 bg-[#F57C00]/15 shadow-[0_0_28px_rgba(245,124,0,0.8)]"
              : "border-white/10 bg-black/40"
          }`}
        >
          <Icon
            className={`h-5 w-5 transition-all duration-500 ${
              active
                ? "text-[#F57C00] [filter:drop-shadow(0_0_10px_rgba(245,124,0,0.9))]"
                : "text-white/70"
            }`}
            strokeWidth={1.75}
          />
        </span>
        <div>
          <h4 className="text-sm font-semibold tracking-tight text-white">{sat.title}</h4>
          <p
            className={`mt-1.5 text-xs leading-relaxed transition-opacity duration-500 ${
              active ? "text-white/85 opacity-100" : "text-white/50 opacity-60"
            }`}
          >
            {sat.subtext}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function CoreOrb() {
  return (
    <div className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2">
      <div className="relative flex flex-col items-center">
        <div className="relative">
          {/* breathing pulses */}
          <span className="pointer-events-none absolute inset-0 rounded-full bg-[#F57C00]/25 blur-2xl animate-ping [animation-duration:3s]" />
          <span className="pointer-events-none absolute inset-0 rounded-full bg-[#F57C00]/20 blur-3xl animate-pulse [animation-duration:2.5s]" />
          <div className="relative flex h-40 w-40 items-center justify-center rounded-full border border-[#F57C00]/40 bg-white/5 backdrop-blur-2xl shadow-[0_0_80px_-10px_rgba(245,124,0,0.7),inset_0_0_40px_rgba(245,124,0,0.15)]">
            <Sun
              className="h-14 w-14 text-[#F57C00] [filter:drop-shadow(0_0_16px_rgba(245,124,0,0.9))]"
              strokeWidth={1.5}
            />
          </div>
        </div>
        <div className="mt-5 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#F5B366]">
            The Core
          </p>
          <h3 className="mt-1 text-base font-semibold tracking-tight text-white">
            Wavenox Monolithic Solar
          </h3>
        </div>
      </div>
    </div>
  );
}

export function Ecosystem() {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <section className="relative overflow-hidden bg-[#050505] py-20 md:py-32">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/[0.04] to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[1100px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#F57C00]/[0.06] blur-[160px]"
      />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        {/* Header */}
        <motion.div
          className="mx-auto max-w-3xl text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2, margin: "100px 0px 100px 0px" }}
        >
          <motion.div variants={headerVariants} className="flex justify-center">
            <span className="inline-flex items-center rounded-full border border-[#F57C00]/40 bg-white/5 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.32em] text-[#F5B366] backdrop-blur-xl shadow-[0_0_30px_-10px_rgba(245,124,0,0.5)]">
              The Wavenox Ecosystem
            </span>
          </motion.div>

          <motion.h2
            variants={headerVariants}
            className="mx-auto mt-6 max-w-2xl text-balance text-3xl font-bold tracking-tight text-white md:text-5xl"
          >
            Architecting the grid of{" "}
            <span
              className="text-[#F57C00]"
              style={{ filter: "drop-shadow(0 0 24px rgba(245,124,0,0.5))" }}
            >
              tomorrow
            </span>
          </motion.h2>

          <motion.p
            variants={headerVariants}
            className="mx-auto mt-5 max-w-2xl text-balance text-sm leading-relaxed text-white/60 md:text-base"
          >
            One intelligent core Four orbiting systems An interconnected energy
            infrastructure engineered for the smart-home and commercial future
          </motion.p>
        </motion.div>

        {/* Desktop — Orbital Map */}
        <motion.div
          className="relative mx-auto mt-20 hidden h-[640px] w-full max-w-5xl md:block"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1, margin: "100px 0px 100px 0px" }}
          variants={container}
        >
          {/* Beams behind everything */}
          {satellites.map((sat) => (
            <Beam
              key={`beam-${sat.id}`}
              angle={sat.angle}
              length={sat.length}
              active={hovered === sat.id}
            />
          ))}

          {/* Core */}
          <CoreOrb />

          {/* Satellites */}
          {satellites.map((sat) => (
            <SatelliteNode
              key={sat.id}
              sat={sat}
              onHover={setHovered}
              active={hovered === sat.id}
            />
          ))}
        </motion.div>

        {/* Mobile — Vertical Spine */}
        <motion.div
          className="relative mt-16 md:hidden"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.05 }}
          variants={container}
        >
          {/* Glowing spine */}
          <div aria-hidden className="pointer-events-none absolute bottom-0 left-6 top-0">
            <motion.div
              initial={{ scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true, amount: 0.05 }}
              transition={{ duration: 1.4, ease: "easeOut", delay: 0.2 }}
              style={{ transformOrigin: "top center" }}
              className="h-full w-px bg-gradient-to-b from-[#F57C00]/70 via-[#F57C00]/40 to-transparent shadow-[0_0_16px_rgba(245,124,0,0.6)]"
            />
          </div>

          <div className="space-y-6 pl-16">
            {/* Core first */}
            <motion.div variants={nodeFade} className="relative">
              <span className="absolute -left-[42px] top-6 h-3 w-3 -translate-x-1/2 rounded-full bg-[#F57C00] shadow-[0_0_16px_rgba(245,124,0,0.9)]" />
              <div className="rounded-2xl border border-[#F57C00]/40 bg-white/5 p-5 backdrop-blur-2xl shadow-[0_0_40px_-15px_rgba(245,124,0,0.6)]">
                <div className="flex items-center gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-full border border-[#F57C00]/50 bg-[#F57C00]/10 shadow-[0_0_20px_rgba(245,124,0,0.6)]">
                    <Sun
                      className="h-5 w-5 text-[#F57C00] [filter:drop-shadow(0_0_8px_rgba(245,124,0,0.9))]"
                      strokeWidth={1.5}
                    />
                  </span>
                  <div>
                    <p className="text-[9px] font-semibold uppercase tracking-[0.3em] text-[#F5B366]">
                      The Core
                    </p>
                    <h4 className="text-sm font-semibold text-white">
                      Wavenox Monolithic Solar
                    </h4>
                  </div>
                </div>
              </div>
            </motion.div>

            {satellites.map((sat) => {
              const Icon = sat.icon;
              return (
                <motion.div key={sat.id} variants={nodeFade} className="relative">
                  <span className="absolute -left-[42px] top-6 h-2 w-2 -translate-x-1/2 rounded-full bg-[#F57C00]/80 shadow-[0_0_10px_rgba(245,124,0,0.7)]" />
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-2xl">
                    <div className="flex items-start gap-4">
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white/10 bg-black/40">
                        <Icon className="h-5 w-5 text-white/80" strokeWidth={1.75} />
                      </span>
                      <div className="min-w-0">
                        <h4 className="text-sm font-semibold tracking-tight text-white">
                          {sat.title}
                        </h4>
                        <p className="mt-1.5 text-xs leading-relaxed text-white/60">
                          {sat.subtext}
                        </p>
                      </div>
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
