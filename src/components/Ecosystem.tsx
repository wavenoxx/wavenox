import { motion } from "framer-motion";

// Energy laser path weaving from solar farm -> transmission towers -> city skyline
const ENERGY_PATH =
  "M 40 520 " +
  "C 120 500, 180 480, 240 500 " +
  "S 360 540, 440 500 " +
  "S 560 440, 640 460 " +
  "S 780 520, 880 480 " +
  "S 1040 420, 1160 440 " +
  "S 1340 500, 1480 460 " +
  "L 1560 460";

function WindTurbine({ x, y, scale = 1, spinDuration = 6 }: { x: number; y: number; scale?: number; spinDuration?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      {/* Tower */}
      <path d="M -3 0 L 3 0 L 2 -140 L -2 -140 Z" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="1.2" />
      {/* Hub + blades (spin) */}
      <g style={{ transformOrigin: "0px -140px", transformBox: "fill-box" }}>
        <motion.g
          animate={{ rotate: 360 }}
          transition={{ duration: spinDuration, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: "0px -140px" }}
        >
          <circle cx="0" cy="-140" r="4" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1.2" />
          <path d="M 0 -140 L 0 -200" stroke="rgba(255,255,255,0.28)" strokeWidth="1.4" strokeLinecap="round" />
          <path d="M 0 -140 L 52 -110" stroke="rgba(255,255,255,0.28)" strokeWidth="1.4" strokeLinecap="round" />
          <path d="M 0 -140 L -52 -110" stroke="rgba(255,255,255,0.28)" strokeWidth="1.4" strokeLinecap="round" />
        </motion.g>
      </g>
    </g>
  );
}

function SolarPanel({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`} stroke="rgba(255,255,255,0.22)" strokeWidth="1.1" fill="none">
      {/* Panel plane (parallelogram) */}
      <path d="M 0 0 L 80 -18 L 110 -4 L 30 14 Z" />
      {/* Grid cells */}
      <path d="M 20 -4 L 50 10" />
      <path d="M 40 -8 L 70 6" />
      <path d="M 60 -12 L 90 2" />
      <path d="M 80 -16 L 100 -2" opacity="0.7" />
      {/* Legs */}
      <path d="M 15 10 L 20 26" />
      <path d="M 95 -2 L 100 14" />
    </g>
  );
}

function TransmissionTower({ x, y, h = 130 }: { x: number; y: number; h?: number }) {
  return (
    <g transform={`translate(${x} ${y})`} stroke="rgba(255,255,255,0.22)" strokeWidth="1.1" fill="none">
      {/* Legs */}
      <path d={`M -18 0 L -4 ${-h}`} />
      <path d={`M 18 0 L 4 ${-h}`} />
      {/* Cross bracing */}
      <path d={`M -14 -20 L 14 -20`} />
      <path d={`M -12 -50 L 12 -50`} />
      <path d={`M -9 -80 L 9 -80`} />
      <path d={`M -18 0 L 18 0`} />
      <path d={`M -14 -20 L 14 -50`} />
      <path d={`M 14 -20 L -14 -50`} />
      <path d={`M -12 -50 L 12 -80`} />
      <path d={`M 12 -50 L -12 -80`} />
      {/* Arms */}
      <path d={`M -22 ${-h + 8} L 22 ${-h + 8}`} />
      <path d={`M -16 ${-h - 4} L 16 ${-h - 4}`} />
      <path d={`M 0 ${-h - 4} L 0 ${-h - 18}`} />
    </g>
  );
}

function Building({ x, y, w, h, windows = true }: { x: number; y: number; w: number; h: number; windows?: boolean }) {
  const cols = Math.max(2, Math.floor(w / 12));
  const rows = Math.max(3, Math.floor(h / 16));
  const cellW = w / cols;
  const cellH = h / rows;
  return (
    <g transform={`translate(${x} ${y})`} stroke="rgba(255,255,255,0.22)" strokeWidth="1.1" fill="none">
      <rect x="0" y={-h} width={w} height={h} />
      {windows &&
        Array.from({ length: rows - 1 }).map((_, r) =>
          Array.from({ length: cols }).map((__, c) => (
            <rect
              key={`${r}-${c}`}
              x={c * cellW + cellW * 0.25}
              y={-h + r * cellH + cellH * 0.25}
              width={cellW * 0.5}
              height={cellH * 0.4}
              stroke="rgba(255,255,255,0.14)"
              strokeWidth="0.8"
            />
          )),
        )}
    </g>
  );
}

function EnergyParticle({ delay }: { delay: number }) {
  return (
    <motion.circle
      r={4}
      fill="#FFB86B"
      style={{ offsetPath: `path("${ENERGY_PATH}")`, filter: "drop-shadow(0 0 8px #F57C00)" }}
      initial={{ offsetDistance: "0%" }}
      animate={{ offsetDistance: "100%" }}
      transition={{ duration: 6, repeat: Infinity, ease: "linear", delay }}
    />
  );
}

export function Ecosystem() {
  return (
    <section className="relative min-h-[600px] overflow-hidden bg-[#050505] py-20 md:py-28">
      {/* Ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[520px] w-[1100px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#F57C00]/[0.06] blur-[160px]"
      />
      {/* Star field dots */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 30%, rgba(255,255,255,0.25) 0.5px, transparent 1px), radial-gradient(circle at 80% 60%, rgba(255,255,255,0.2) 0.5px, transparent 1px), radial-gradient(circle at 45% 15%, rgba(255,255,255,0.18) 0.5px, transparent 1px)",
          backgroundSize: "140px 140px, 220px 220px, 300px 300px",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center rounded-full border border-[#F57C00]/40 bg-white/5 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.32em] text-[#F5B366] backdrop-blur-xl shadow-[0_0_30px_-10px_rgba(245,124,0,0.5)]">
            The Wavenox Ecosystem
          </span>
          <h2 className="mx-auto mt-6 max-w-2xl text-balance text-3xl font-bold tracking-tight text-white md:text-5xl">
            Architecting the grid of{" "}
            <span className="text-[#F57C00]" style={{ filter: "drop-shadow(0 0 24px rgba(245,124,0,0.5))" }}>
              tomorrow
            </span>
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-balance text-sm leading-relaxed text-white/60 md:text-base">
            A continuous flow of intelligent energy from generation to consumption
          </p>
        </div>
      </div>

      {/* Landscape canvas */}
      <div className="relative mt-14 md:mt-20">
        {/* Floating typography row */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 mx-auto flex max-w-6xl justify-between px-8 md:px-16">
          {[
            { label: "Generation", sub: "Solar · Wind" },
            { label: "Transmission", sub: "Smart Grid Routing" },
            { label: "Consumption", sub: "Cities · Mobility" },
          ].map((s) => (
            <div key={s.label} className="relative text-center">
              <span
                aria-hidden
                className="absolute left-1/2 top-1/2 -z-10 h-24 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#F57C00]/10 blur-2xl"
              />
              <p
                className="text-[10px] font-semibold uppercase tracking-[0.35em] text-white/80 md:text-sm"
                style={{ textShadow: "0 0 18px rgba(0,0,0,0.9), 0 0 30px rgba(245,124,0,0.25)" }}
              >
                {s.label}
              </p>
              <p className="mt-1 text-[9px] uppercase tracking-[0.28em] text-white/40 md:text-[10px]">{s.sub}</p>
            </div>
          ))}
        </div>

        <div className="-mx-0 overflow-x-auto">
          <div className="relative mx-auto w-[1600px] md:w-full md:max-w-none">
            <svg
              viewBox="0 0 1600 600"
              preserveAspectRatio="xMidYMid meet"
              className="block h-[420px] w-full md:h-[560px]"
              aria-hidden
            >
              <defs>
                <linearGradient id="laserGrad" x1="0" x2="1" y1="0" y2="0">
                  <stop offset="0%" stopColor="rgba(245,124,0,0)" />
                  <stop offset="55%" stopColor="rgba(245,124,0,0.95)" />
                  <stop offset="100%" stopColor="rgba(255,210,140,1)" />
                </linearGradient>
                <linearGradient id="groundGrad" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="rgba(245,124,0,0.35)" />
                  <stop offset="100%" stopColor="rgba(245,124,0,0)" />
                </linearGradient>
                <filter id="laserGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="b" />
                  <feMerge>
                    <feMergeNode in="b" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Horizon line */}
              <path d="M 0 540 L 1600 540" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
              <path d="M 0 540 L 1600 540" stroke="url(#groundGrad)" strokeWidth="40" opacity="0.35" />

              {/* Faint distant mountains */}
              <path
                d="M 0 520 L 120 460 L 220 500 L 340 430 L 480 500 L 620 450 L 780 510 L 940 440 L 1100 500 L 1260 450 L 1420 510 L 1600 470 L 1600 540 L 0 540 Z"
                fill="none"
                stroke="rgba(255,255,255,0.08)"
                strokeWidth="1"
              />

              {/* === LEFT: GENERATION === */}
              {/* Solar array cluster */}
              <SolarPanel x={60} y={520} />
              <SolarPanel x={180} y={528} />
              <SolarPanel x={300} y={520} />
              <SolarPanel x={110} y={548} />
              <SolarPanel x={230} y={556} />

              {/* Wind turbines */}
              <WindTurbine x={400} y={540} scale={1} spinDuration={7} />
              <WindTurbine x={520} y={540} scale={0.75} spinDuration={5} />
              <WindTurbine x={620} y={540} scale={0.9} spinDuration={9} />

              {/* === MIDDLE: TRANSMISSION === */}
              <TransmissionTower x={760} y={540} h={140} />
              <TransmissionTower x={900} y={540} h={120} />
              <TransmissionTower x={1040} y={540} h={150} />
              {/* Sagging power lines */}
              <path
                d="M 760 410 Q 830 450 900 425 Q 970 400 1040 395"
                fill="none"
                stroke="rgba(255,255,255,0.18)"
                strokeWidth="1"
              />
              <path
                d="M 760 420 Q 830 465 900 435 Q 970 410 1040 405"
                fill="none"
                stroke="rgba(255,255,255,0.14)"
                strokeWidth="1"
              />

              {/* === RIGHT: CONSUMPTION (City) === */}
              <Building x={1140} y={540} w={60} h={160} />
              <Building x={1210} y={540} w={80} h={220} />
              <Building x={1300} y={540} w={50} h={140} />
              <Building x={1360} y={540} w={90} h={260} />
              <Building x={1460} y={540} w={60} h={180} />
              <Building x={1530} y={540} w={55} h={130} />
              {/* Antenna accents */}
              <path d="M 1250 320 L 1250 290" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
              <circle cx="1250" cy="288" r="2" fill="#F57C00" opacity="0.9">
                <animate attributeName="opacity" values="0.3;1;0.3" dur="1.6s" repeatCount="indefinite" />
              </circle>
              <path d="M 1405 280 L 1405 250" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
              <circle cx="1405" cy="248" r="2" fill="#F57C00" opacity="0.9">
                <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite" />
              </circle>

              {/* === ENERGY LASER PATH === */}
              {/* Faint base rail */}
              <path
                d={ENERGY_PATH}
                fill="none"
                stroke="rgba(245,124,0,0.15)"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              {/* Traveling laser dash */}
              <motion.path
                d={ENERGY_PATH}
                fill="none"
                stroke="url(#laserGrad)"
                strokeWidth="2.75"
                strokeLinecap="round"
                strokeDasharray="180 1400"
                initial={{ strokeDashoffset: 1580 }}
                animate={{ strokeDashoffset: 0 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                filter="url(#laserGlow)"
              />
              {/* Second offset laser for continuous feel */}
              <motion.path
                d={ENERGY_PATH}
                fill="none"
                stroke="url(#laserGrad)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray="90 1490"
                initial={{ strokeDashoffset: 1580 }}
                animate={{ strokeDashoffset: 0 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear", delay: 1.5 }}
                filter="url(#laserGlow)"
                opacity="0.85"
              />

              {/* Particles */}
              <EnergyParticle delay={0} />
              <EnergyParticle delay={1.2} />
              <EnergyParticle delay={2.4} />
              <EnergyParticle delay={3.6} />
              <EnergyParticle delay={4.8} />
            </svg>
          </div>
        </div>

        <p className="mt-6 text-center text-[10px] uppercase tracking-[0.3em] text-white/30 md:hidden">
          ← Swipe to explore the living grid →
        </p>
      </div>
    </section>
  );
}
