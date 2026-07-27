import { motion, type Variants } from "framer-motion";
import { Sun, Battery, Plug, Cpu, Shield, type LucideIcon } from "lucide-react";

type Node = {
  icon: LucideIcon;
  title: string;
  subtext: string;
};

const nodes: Node[] = [
  {
    icon: Sun,
    title: "Monolithic Solar",
    subtext: "Tier-1 structural energy generation",
  },
  {
    icon: Battery,
    title: "Intelligent Storage",
    subtext: "Next-gen battery bank architecture",
  },
  {
    icon: Plug,
    title: "EV Integration",
    subtext: "High-speed charging networks",
  },
  {
    icon: Cpu,
    title: "AI Energy Routing",
    subtext: "Smart-home and building management",
  },
  {
    icon: Shield,
    title: "Microgrid Freedom",
    subtext: "Zero reliance on state infrastructure",
  },
];

const headerVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.2 } },
};

const nodeVariants: Variants = {
  hidden: { opacity: 0, y: 24, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

function NodeCard({ node }: { node: Node }) {
  const Icon = node.icon;
  return (
    <motion.div
      variants={nodeVariants}
      whileHover={{ scale: 1.05, y: -4 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className="group relative z-10 flex w-full items-start gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl transition-colors duration-500 hover:border-[#F57C00]/40 hover:bg-white/[0.08] hover:shadow-[0_0_40px_-10px_rgba(245,124,0,0.55)] md:w-auto md:flex-col md:items-center md:gap-3 md:p-6 md:text-center"
    >
      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-white/10 bg-black/40 transition-all duration-500 group-hover:border-[#F57C00]/60 group-hover:bg-[#F57C00]/10 group-hover:shadow-[0_0_28px_rgba(245,124,0,0.7)] md:h-14 md:w-14">
        <Icon
          className="h-5 w-5 text-white/70 transition-all duration-500 group-hover:text-[#F57C00] group-hover:[filter:drop-shadow(0_0_10px_rgba(245,124,0,0.9))] md:h-6 md:w-6"
          strokeWidth={1.75}
        />
      </span>
      <div className="min-w-0 md:mt-1">
        <h4 className="text-sm font-semibold tracking-tight text-white md:text-base">
          {node.title}
        </h4>
        <p className="mt-1.5 text-xs leading-relaxed text-white/50 opacity-60 transition-opacity duration-500 group-hover:text-white/80 group-hover:opacity-100 md:text-sm">
          {node.subtext}
        </p>
      </div>
    </motion.div>
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
        className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[1100px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#F57C00]/[0.06] blur-[160px]"
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
            We don't just install panels We build intelligent interconnected
            energy infrastructure for the ultimate smart-home and commercial
            experience
          </motion.p>
        </motion.div>

        {/* Grid */}
        <motion.div
          className="relative mt-16 md:mt-24"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1, margin: "100px 0px 100px 0px" }}
          variants={container}
        >
          {/* Power line — desktop horizontal */}
          <div
            aria-hidden
            className="pointer-events-none absolute left-0 right-0 top-7 hidden md:block"
          >
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, amount: 0.1, margin: "100px 0px 100px 0px" }}
              transition={{ duration: 1.4, ease: "easeOut", delay: 0.2 }}
              style={{ transformOrigin: "left center" }}
              className="mx-auto h-px w-[92%] bg-gradient-to-r from-transparent via-[#F57C00]/60 to-transparent shadow-[0_0_20px_rgba(245,124,0,0.6)]"
            />
          </div>

          {/* Power line — mobile vertical spine */}
          <div
            aria-hidden
            className="pointer-events-none absolute bottom-0 left-6 top-0 md:hidden"
          >
            <motion.div
              initial={{ scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true, amount: 0.05 }}
              transition={{ duration: 1.4, ease: "easeOut", delay: 0.2 }}
              style={{ transformOrigin: "top center" }}
              className="h-full w-px bg-gradient-to-b from-transparent via-[#F57C00]/60 to-transparent shadow-[0_0_20px_rgba(245,124,0,0.6)]"
            />
          </div>

          <div className="grid grid-cols-1 gap-6 pl-14 md:grid-cols-5 md:gap-4 md:pl-0">
            {nodes.map((node) => (
              <NodeCard key={node.title} node={node} />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
