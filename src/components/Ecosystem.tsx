import { motion, type Variants } from "framer-motion";
import { Sun, Wind, BatteryCharging, Cpu, Building2, Plug } from "lucide-react";

type Node = {
  id: string;
  title: string;
  subtext: string;
  stage: "Generation" | "Storage & Transmission" | "Consumption";
  icon: "sun" | "wind" | "battery" | "cpu" | "building" | "plug";
  // percent coordinates within the SVG viewBox 0..1600 x 0..600
  x: number;
  y: number;
};

const NODES: Node[] = [
  { id: "solar",   title: "Monolithic Solar",       subtext: "Tier-1 photonic generation",     stage: "Generation",             icon: "sun",      x: 140,  y: 220 },
  { id: "wind",    title: "Wind Energy",            subtext: "Continuous kinetic harvest",     stage: "Generation",             icon: "wind",     x: 260,  y: 400 },
  { id: "battery", title: "Intelligent Batteries",  subtext: "Next-gen storage banks",         stage: "Storage & Transmission", icon: "battery", x: 640,  y: 220 },
  { id: "ai",      title: "AI Grid Routing",        subtext: "Predictive load balancing",      stage: "Storage & Transmission", icon: "cpu",      x: 800,  y: 400 },
  { id: "city",    title: "Smart Buildings",        subtext: "Adaptive energy consumption",    stage: "Consumption",            icon: "building", x: 1200, y: 220 },
  { id: "ev",      title: "EV Infrastructure",      subtext: "High-speed charging networks",   stage: "Consumption",            icon: "plug",     x: 1360, y: 400 },
];

// Path connecting all nodes left→right; used both as the visible grid and
// as the motion path for the traveling energy particles.
const GRID_PATH =
  "M 60 300 " +
  "C 160 260, 200 220, 260 240 " +
  "S 380 380, 480 340 " +
  "S 620 220, 720 260 " +
  "S 860 400, 960 340 " +
  "S 1120 220, 1240 260 " +
  "S 1420 380, 1540 320";

const IconFor = ({ kind }: { kind: Node["icon"] }) => {
  const cls = "h-5 w-5 text-[#F57C00] [filter:drop-shadow(0_0_10px_rgba(245,124,0,0.9))]";
  switch (kind) {
    case "sun":      return <Sun className={cls} strokeWidth={1.5} />;
    case "wind":     return <motion.div animate={{ rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: "linear" }}><Wind className={cls} strokeWidth={1.5} /></motion.div>;
    case "battery":  return <BatteryCharging className={cls} strokeWidth={1.5} />;
    case "cpu":      return <Cpu className={cls} strokeWidth={1.5} />;
    case "building": return <Building2 className={cls} strokeWidth={1.5} />;
    case "plug":     return <Plug className={cls} strokeWidth={1.5} />;
  }
};

const headerVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

function NodeCard({ node, index }: { node: Node; index: number }) {
  // Position card on top of the SVG using the same coordinate system.
  // The container is placed at viewBox coordinates via percentages.
  const leftPct = (node.x / 1600) * 100;
  const topPct = (node.y / 600) * 100;
  return (
    <motion.div
      className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${leftPct}%`, top: `${topPct}%` }}
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 * index }}
    >
      <motion.div
        animate={{ scale: [1, 1.04, 1] }}
        transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut", delay: index * 0.4 }}
        className="group relative w-[180px] rounded-2xl border border-white/10 bg-white/5 p-4 text-center backdrop-blur-xl shadow-[0_0_40px_-15px_rgba(245,124,0,0.5)]"
      >
        <span className="pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-br from-[#F57C00]/20 via-transparent to-transparent opacity-40" />
        <div className="relative flex items-center justify-center">
          <span className="grid h-10 w-10 place-items-center rounded-full border border-[#F57C00]/40 bg-[#F57C00]/10 shadow-[0_0_18px_rgba(245,124,0,0.6)]">
            <IconFor kind={node.icon} />
          </span>
        </div>
        <p className="relative mt-2 text-[8px] font-semibold uppercase tracking-[0.28em] text-[#F5B366]">
          {node.stage}
        </p>
        <h4 className="relative mt-1 text-[13px] font-semibold tracking-tight text-white">
          {node.title}
        </h4>
        <p className="relative mt-1 text-[10px] leading-relaxed text-white/60">
          {node.subtext}
        </p>
      </motion.div>
    </motion.div>
  );
}

function EnergyParticle({ delay, color }: { delay: number; color: string }) {
  return (
    <motion.circle
      r={6}
      fill={color}
      style={{ offsetPath: `path("${GRID_PATH}")`, filter: `drop-shadow(0 0 10px ${color})` }}
      initial={{ offsetDistance: "0%" }}
      animate={{ offsetDistance: "100%" }}
      transition={{ duration: 6, repeat: Infinity, ease: "linear", delay }}
    />
  );
}

export function Ecosystem() {
  return (
    <section className="relative overflow-hidden bg-[#050505] py-20 md:py-32">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/[0.04] to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[1200px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#F57C00]/[0.06] blur-[160px]"
      />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        {/* Header */}
        <motion.div
          className="mx-auto max-w-3xl text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
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
            A continuous flow of intelligent energy from generation to consumption
          </motion.p>
        </motion.div>

        {/* Living Grid Canvas */}
        <div className="mt-16 md:mt-24">
          <div className="-mx-5 overflow-x-auto sm:-mx-8 md:mx-0">
            <div className="relative mx-auto h-[520px] w-[1200px] md:h-[600px] md:w-full md:max-w-6xl px-6">
              {/* SVG grid + traveling particles */}
              <svg
                viewBox="0 0 1600 600"
                preserveAspectRatio="none"
                className="absolute inset-0 h-full w-full"
                aria-hidden
              >
                <defs>
                  <linearGradient id="gridStroke" x1="0" x2="1" y1="0" y2="0">
                    <stop offset="0%" stopColor="rgba(245,124,0,0.05)" />
                    <stop offset="50%" stopColor="rgba(245,124,0,0.4)" />
                    <stop offset="100%" stopColor="rgba(245,124,0,0.05)" />
                  </linearGradient>
                  <linearGradient id="flowStroke" x1="0" x2="1" y1="0" y2="0">
                    <stop offset="0%" stopColor="rgba(245,124,0,0)" />
                    <stop offset="60%" stopColor="rgba(245,124,0,0.9)" />
                    <stop offset="100%" stopColor="rgba(255,200,120,1)" />
                  </linearGradient>
                </defs>

                {/* Base grid path */}
                <path
                  d={GRID_PATH}
                  fill="none"
                  stroke="url(#gridStroke)"
                  strokeWidth={1.5}
                  strokeLinecap="round"
                />
                {/* Faint parallel filaments */}
                <path
                  d={GRID_PATH}
                  fill="none"
                  stroke="rgba(255,255,255,0.06)"
                  strokeWidth={0.75}
                  strokeDasharray="2 8"
                />

                {/* Animated flowing dash — the "electricity" pulse */}
                <motion.path
                  d={GRID_PATH}
                  fill="none"
                  stroke="url(#flowStroke)"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeDasharray="120 900"
                  initial={{ strokeDashoffset: 1020 }}
                  animate={{ strokeDashoffset: 0 }}
                  transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                  style={{ filter: "drop-shadow(0 0 8px rgba(245,124,0,0.9))" }}
                />

                {/* Traveling particles along the same path */}
                <EnergyParticle delay={0}   color="rgba(245,124,0,1)" />
                <EnergyParticle delay={1.2} color="rgba(255,180,80,0.95)" />
                <EnergyParticle delay={2.4} color="rgba(245,124,0,1)" />
                <EnergyParticle delay={3.6} color="rgba(255,180,80,0.95)" />
                <EnergyParticle delay={4.8} color="rgba(245,124,0,1)" />
              </svg>

              {/* Nodes on top */}
              {NODES.map((n, i) => (
                <NodeCard key={n.id} node={n} index={i} />
              ))}

              {/* Stage labels along the bottom */}
              <div className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-between px-8 text-[9px] font-semibold uppercase tracking-[0.35em] text-white/40">
                <span>Generation</span>
                <span>Storage · Transmission</span>
                <span>Consumption</span>
              </div>
            </div>
          </div>

          <p className="mt-6 text-center text-[10px] uppercase tracking-[0.3em] text-white/30 md:hidden">
            ← Swipe to explore the living grid →
          </p>
        </div>
      </div>
    </section>
  );
}
