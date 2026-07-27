import { motion, type Variants } from "framer-motion";
import { useState } from "react";
import { X, Check } from "lucide-react";

type CompCard = {
  title: string;
  description: string;
  image: string;
  badge: string;
};

const conventionalCards: CompCard[] = [
  {
    title: "Structural Vulnerability",
    description:
      "Mounting hardware punctures the roof membrane, creating severe leak points, corrosion, and high wind-uplift risks.",
    image:
      "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=1400&q=80",
    badge: "TWO SEPARATE SYSTEMS",
  },
  {
    title: "The Double-Sunk Cost",
    description:
      "Paying for a roof replacement, then paying again for a solar installation. Two separate systems, two warranties, double the hassle.",
    image:
      "https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&w=1400&q=80",
    badge: "DOUBLE INSTALLATION COST",
  },
];

const wavenoxCards: CompCard[] = [
  {
    title: "Seamless Monolithic Integration",
    description:
      "Zero mounting hardware. The roof IS the solar panel. Flush profile certified to withstand 250 kmph cyclones.",
    image:
      "https://images.unsplash.com/photo-1613665813446-82a78c468a1d?auto=format&fit=crop&w=1400&q=80",
    badge: "ONE INTEGRATED SYSTEM",
  },
  {
    title: "Day-One ROI Asset",
    description:
      "A single integrated installation step. One contractor, one unified warranty, generating revenue from the moment it's active.",
    image:
      "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&w=1400&q=80",
    badge: "30% MORE POWER",
  },
];

const liabilities = [
  "Leak & corrosion points",
  "Wind uplift rating failures",
  "10–20% heat-trap efficiency loss",
  "Roof remains a sunk cost",
];

const advantages = [
  "Zero leaks, zero corrosion",
  "250 kmph wind zones covered",
  "30% more power per sqft",
  "Roof pays revenue from day one",
];

const leftColVariants: Variants = {
  hidden: { opacity: 0, x: -60 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: "easeOut" } },
};

const rightColVariants: Variants = {
  hidden: { opacity: 0, x: 60 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: "easeOut" } },
};

const headerVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

function ImageCard({
  card,
  tone,
}: {
  card: CompCard;
  tone: "danger" | "wavenox";
}) {
  const badgeClasses =
    tone === "danger"
      ? "bg-red-500/90 text-white"
      : "bg-[#F57C00] text-black shadow-[0_0_24px_-4px_rgba(245,124,0,0.8)]";
  const borderClasses =
    tone === "danger"
      ? "border-red-500/20 hover:border-red-500/40"
      : "border-[#F57C00]/25 hover:border-[#F57C00]/60";

  return (
    <motion.article
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      className={`group relative overflow-hidden rounded-2xl border ${borderClasses} bg-white/[0.02] transition-colors duration-500`}
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden">
        <img
          src={card.image}
          alt={card.title}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/30" />
        <span
          className={`absolute left-4 top-4 rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-widest ${badgeClasses}`}
        >
          {card.badge}
        </span>
      </div>
      <div className="p-6 md:p-8">
        <h4 className="text-lg font-semibold tracking-tight text-white md:text-xl">
          {card.title}
        </h4>
        <p className="mt-3 text-sm leading-relaxed text-white/60 md:text-base">
          {card.description}
        </p>
      </div>
    </motion.article>
  );
}

export function Comparison() {
  const [hovered, setHovered] = useState<"left" | "right" | null>(null);

  const leftDim = hovered === "right";
  const rightDim = hovered === "left";

  return (
    <section className="relative overflow-hidden bg-black py-32 md:py-48">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-40 h-[380px] w-[900px] -translate-x-1/2 rounded-full bg-[#F57C00]/8 blur-[140px]"
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
            <span className="inline-flex items-center rounded-full border border-[#F57C00]/40 bg-white/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.28em] text-[#F5B366] backdrop-blur-xl shadow-[0_0_20px_-10px_rgba(245,124,0,0.5)]">
              The Paradigm Shift
            </span>
          </motion.div>

          <motion.div
            variants={headerVariants}
            className="mt-16 flex flex-col items-center justify-center gap-6 md:mt-24 md:flex-row md:gap-10"
          >
            <span className="whitespace-nowrap text-xl font-medium text-gray-400 sm:text-2xl md:text-3xl lg:text-4xl">
              Conventional Solar
            </span>
            <span className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/[0.04] px-8 py-4 text-sm font-bold tracking-[0.28em] text-white/80 backdrop-blur-2xl shadow-[0_0_40px_-15px_rgba(245,124,0,0.5)] md:px-10 md:py-5 md:text-base">
              VS
            </span>
            <span
              className="whitespace-nowrap text-xl font-bold text-[#F57C00] sm:text-2xl md:text-3xl lg:text-4xl"
              style={{ filter: "drop-shadow(0 0 10px rgba(245,124,0,0.35))" }}
            >
              Wavenox Architecture
            </span>
          </motion.div>


          <motion.p
            variants={headerVariants}
            className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-white/60 md:text-base"
          >
            Why bolting panels onto an old roof is a financial liability, and
            why Wavenox is the ultimate high-yielding asset.
          </motion.p>
        </motion.div>

        {/* Split-screen comparison */}
        <div className="mt-14 grid grid-cols-1 gap-6 md:mt-20 md:grid-cols-2 md:gap-8">
          {/* Left column */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1, margin: "100px 0px 100px 0px" }}
            variants={leftColVariants}
            onMouseEnter={() => setHovered("left")}
            onMouseLeave={() => setHovered(null)}
            className={`flex flex-col gap-6 transition-opacity duration-500 ${
              leftDim ? "md:opacity-40" : "opacity-100"
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-sm font-medium text-red-300">
                <X className="h-3.5 w-3.5" strokeWidth={2.5} />
                The Outdated Approach
              </span>
            </div>
            {conventionalCards.map((c) => (
              <ImageCard key={c.title} card={c} tone="danger" />
            ))}
          </motion.div>

          {/* Right column */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1, margin: "100px 0px 100px 0px" }}
            variants={rightColVariants}
            onMouseEnter={() => setHovered("right")}
            onMouseLeave={() => setHovered(null)}
            className={`flex flex-col gap-6 transition-opacity duration-500 ${
              rightDim ? "md:opacity-40" : "opacity-100"
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#F57C00]/40 bg-[#F57C00]/10 px-3 py-1.5 text-sm font-medium text-[#F5B366] shadow-[0_0_24px_-6px_rgba(245,124,0,0.6)]">
                <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                The Wavenox Standard
              </span>
            </div>
            {wavenoxCards.map((c) => (
              <ImageCard key={c.title} card={c} tone="wavenox" />
            ))}
          </motion.div>
        </div>

        {/* Summary matrix */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2, margin: "100px 0px 100px 0px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="mt-10 grid grid-cols-1 gap-6 md:mt-14 md:grid-cols-2 md:gap-8"
        >
          <div className="rounded-2xl border border-red-500/20 bg-red-500/[0.04] p-6 md:p-8">
            <h5 className="text-xs font-semibold uppercase tracking-[0.28em] text-red-400">
              Key Liabilities
            </h5>
            <ul className="mt-5 space-y-3">
              {liabilities.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 text-sm text-white/70 md:text-base"
                >
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-red-500/15">
                    <X className="h-3 w-3 text-red-400" strokeWidth={3} />
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-[#F57C00]/25 bg-[#F57C00]/[0.04] p-6 shadow-[0_0_60px_-30px_rgba(245,124,0,0.6)] md:p-8">
            <h5 className="text-xs font-semibold uppercase tracking-[0.28em] text-[#F5B366]">
              Wavenox Advantages
            </h5>
            <ul className="mt-5 space-y-3">
              {advantages.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 text-sm text-white/80 md:text-base"
                >
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#F57C00]/20 shadow-[0_0_12px_rgba(245,124,0,0.6)]">
                    <Check
                      className="h-3 w-3 text-[#FFB547]"
                      strokeWidth={3}
                    />
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
