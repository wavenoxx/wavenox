import { motion, type Variants } from "framer-motion";
import { Wind, Zap, ShieldCheck, Wrench, type LucideIcon } from "lucide-react";

type Feature = {
  icon: LucideIcon;
  title: string;
  stat: string;
  description: string;
  proof: string;
};

const features: Feature[] = [
  {
    icon: Wind,
    title: "TIER-1 RESILIENCE",
    stat: "Cyclone-Proof",
    description:
      "Engineered with ultra-durable aerospace-grade mounting structures to withstand extreme weather and high wind velocities across India.",
    proof: "Structurally superior to conventional mounts",
  },
  {
    icon: Zap,
    title: "MAXIMUM YIELD",
    stat: "Ultra-High Efficiency",
    description:
      "Utilizing advanced Mono PERC half-cut cell technology to generate up to 30% more power per square foot than standard rooftop installations.",
    proof: "30% more energy in the same roof space",
  },
  {
    icon: ShieldCheck,
    title: "ZERO DEGRADATION",
    stat: "25-Year Lifespan",
    description:
      "Flawless monolithic installation eliminates micro-cracking and thermal stress, ensuring peak energy generation for decades without maintenance.",
    proof: "Ironclad 25-Year Performance Warranty",
  },
  {
    icon: Wrench,
    title: "SEAMLESS INTEGRATION",
    stat: "Zero Hassle",
    description:
      "From customized 3D roof mapping to final net-metering and government subsidy approvals, we handle the entire end-to-end solar deployment process.",
    proof: "Turnkey EPC Solution",
  },
];

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15, delayChildren: 0.05 },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const headerVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

export function Features() {
  return (
    <section
      id="why-wavenox"
      className="relative overflow-hidden bg-[#050505] py-20 md:py-32"
    >
      {/* Animated technical grid background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage:
            "radial-gradient(ellipse at center, black 40%, transparent 80%)",
        }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2 }}
      >
        <div className="absolute -top-40 left-1/2 h-[420px] w-[900px] -translate-x-1/2 rounded-full bg-[#F57C00]/10 blur-[140px]" />
        <div className="absolute bottom-0 right-0 h-[320px] w-[520px] rounded-full bg-[#F57C00]/5 blur-[120px]" />
      </motion.div>

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        {/* Header */}
        <motion.div
          className="mx-auto max-w-3xl text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1, margin: "100px 0px 100px 0px" }}
          variants={containerVariants}
        >
          <motion.div variants={headerVariants} className="flex justify-center">
            <span className="inline-flex items-center rounded-full border border-[#F57C00]/40 bg-white/5 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.28em] text-[#F5B366] backdrop-blur-xl shadow-[0_0_30px_-10px_rgba(245,124,0,0.4)]">
              THE WAVENOX ADVANTAGE
            </span>
          </motion.div>

          <motion.h2
            variants={headerVariants}
            className="mt-6 text-3xl font-bold leading-[1.1] tracking-tight text-white md:text-4xl lg:text-5xl"
          >
            The pinnacle of solar{" "}
            <span
              className="bg-gradient-to-r from-[#FFB547] via-[#F57C00] to-[#C25A00] bg-clip-text text-transparent"
              style={{
                filter: "drop-shadow(0 0 24px rgba(245,124,0,0.35))",
              }}
            >
              architecture
            </span>
          </motion.h2>

          <motion.p
            variants={headerVariants}
            className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-white/60 sm:text-base"
          >
            Engineered exclusively for Indian climates. Wavenox delivers maximum
            energy yields, eliminating your electricity bills while drastically
            increasing your property value.
          </motion.p>
        </motion.div>

        {/* Cards */}
        <motion.div
          className="mt-14 grid min-h-[240px] grid-cols-1 gap-5 sm:gap-6 md:mt-20 md:grid-cols-2 xl:grid-cols-4"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1, margin: "100px 0px 100px 0px" }}
          variants={containerVariants}
        >
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.article
                key={feature.title}
                variants={cardVariants}
                whileHover={{ y: -6 }}
                transition={{ type: "spring", stiffness: 300, damping: 22 }}
                className="group relative rounded-2xl"
              >
                {/* Glow border layer */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-br from-[#F57C00]/0 via-[#F57C00]/0 to-[#F57C00]/0 opacity-0 blur transition-opacity duration-500 group-hover:from-[#FFB547]/60 group-hover:via-[#F57C00]/40 group-hover:to-transparent group-hover:opacity-100"
                />
                <div className="relative flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-2xl transition-colors duration-500 group-hover:border-[#F57C00]/40 sm:p-7">
                  {/* Icon */}
                  <div className="relative mb-6 flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] transition-all duration-500 group-hover:scale-110 group-hover:border-[#F57C00]/50 group-hover:bg-[#F57C00]/10 group-hover:shadow-[0_0_40px_-5px_rgba(245,124,0,0.6)]">
                    <Icon
                      className="h-5 w-5 text-[#F5B366] transition-colors duration-500 group-hover:text-[#FFB547]"
                      strokeWidth={1.8}
                    />
                  </div>

                  <h3 className="text-sm font-medium uppercase tracking-[0.18em] text-white/70">
                    {feature.title}
                  </h3>

                  <p
                    className="mt-3 bg-gradient-to-br from-[#FFB547] to-[#E56A00] bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-[42px]"
                    style={{
                      filter: "drop-shadow(0 0 18px rgba(245,124,0,0.25))",
                    }}
                  >
                    {feature.stat}
                  </p>

                  <p className="mt-4 text-sm leading-relaxed text-white/60">
                    {feature.description}
                  </p>

                  <div className="mt-6 flex items-center gap-2 border-t border-white/10 pt-4">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#F57C00] shadow-[0_0_8px_rgba(245,124,0,0.8)]" />
                    <span className="text-xs font-medium text-white/70">
                      {feature.proof}
                    </span>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
