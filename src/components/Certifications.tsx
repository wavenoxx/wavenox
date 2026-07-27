import { motion, type Variants } from "framer-motion";
import { Star, type LucideIcon } from "lucide-react";

type Certification = {
  seal: string | { icon: LucideIcon };
  title: string;
  subtitle: string;
};

const certifications: Certification[] = [
  {
    seal: "UL",
    title: "UL Listed",
    subtitle: "Global PV Safety & Fire Standard",
  },
  {
    seal: "TÜV",
    title: "TÜV Rheinland",
    subtitle: "IEC 61215 & 61730 Certified",
  },
  {
    seal: "BIS",
    title: "BIS Certified",
    subtitle: "Approved for Indian Grid Deployment",
  },
  {
    seal: { icon: Star },
    title: "20-Year Patent",
    subtitle: "Proprietary IP Granted in USA & India",
  },
];

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.05 },
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

function SealContent({
  seal,
}: {
  seal: string | { icon: LucideIcon };
}) {
  if (typeof seal === "string") {
    return (
      <span className="text-sm font-bold tracking-tight text-white md:text-base">
        {seal}
      </span>
    );
  }

  const Icon = seal.icon;
  return (
    <Icon
      className="h-5 w-5 fill-[#F57C00] text-[#F57C00] md:h-6 md:w-6"
      strokeWidth={1.5}
    />
  );
}

export function Certifications() {
  return (
    <section
      id="certifications"
      className="relative overflow-hidden bg-black py-16 md:py-24"
      style={{
        backgroundImage: "none !important",
        backgroundColor: "#000000 !important",
      }}
    >
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
              GLOBAL COMPLIANCE
            </span>
          </motion.div>

          <motion.h2
            variants={headerVariants}
            className="mt-10 text-3xl font-bold leading-[1.1] tracking-tight text-white md:mt-14 md:text-4xl lg:text-5xl"
          >
            Engineered for Absolute{" "}
            <span
              className="bg-gradient-to-r from-[#FFB547] via-[#F57C00] to-[#C25A00] bg-clip-text text-transparent"
              style={{
                filter: "drop-shadow(0 0 10px rgba(245,124,0,0.35))",
              }}
            >
              Supremacy
            </span>
          </motion.h2>

          <motion.p
            variants={headerVariants}
            className="mx-auto mt-8 max-w-2xl text-sm leading-relaxed text-gray-300 sm:text-base"
          >
            Subjected to the world's most brutal testing protocols. Certified by
            global independent regulatory bodies.
          </motion.p>
        </motion.div>

        {/* Cards */}
        <motion.div
          className="mt-14 grid auto-rows-fr grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4 md:mt-20"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1, margin: "100px 0px 100px 0px" }}
          variants={containerVariants}
        >
          {certifications.map((cert) => (
            <motion.article
              key={cert.title}
              variants={cardVariants}
              className="group relative h-full rounded-2xl transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl"
            >
              {/* Glow border layer */}
              <div
                aria-hidden
                className="pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-br from-[#F57C00]/0 via-[#F57C00]/0 to-[#F57C00]/0 opacity-0 blur transition-opacity duration-500 group-hover:from-[#FFB547]/60 group-hover:via-[#F57C00]/40 group-hover:to-transparent group-hover:opacity-100"
              />
              <div className="relative h-full overflow-hidden rounded-2xl p-px">
                {/* 24/7 rotating conic-gradient border */}
                <span aria-hidden className="card-glow-spin opacity-70" />
                <div className="relative flex h-full flex-col items-center rounded-2xl border border-white/10 bg-black/90 p-6 text-center backdrop-blur-2xl transition-colors duration-500 group-hover:border-[#F57C00]/40 md:p-8">
                  {/* Holographic tech seal */}
                  <div className="relative mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.03] shadow-[0_0_20px_rgba(245,124,0,0.4)] transition-all duration-500 group-hover:shadow-[0_0_40px_rgba(245,124,0,0.7)] md:h-20 md:w-20">
                    <div className="absolute inset-0 rounded-full bg-[#F57C00]/10 blur-md" />
                    <div className="relative">
                      <SealContent seal={cert.seal} />
                    </div>
                  </div>

                  <h3 className="text-base font-semibold tracking-tight text-white md:text-lg">
                    {cert.title}
                  </h3>

                  <p className="mt-2 text-xs leading-relaxed text-gray-400 md:text-sm">
                    {cert.subtitle}
                  </p>
                </div>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
