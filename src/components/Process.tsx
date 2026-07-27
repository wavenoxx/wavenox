import { motion, type Variants } from "framer-motion";
import { ScanLine, Wrench, Zap } from "lucide-react";

const steps = [
  {
    n: "01",
    title: "Architectural Blueprint",
    body: "Our engineers scan your site, measure roof geometry, assess sun exposure and structural load, then design a system optimized for maximum lifetime yield on your specific asset.",
    meta: "Free of charge • 48-hour turnaround",
    Icon: ScanLine,
  },
  {
    n: "02",
    title: "Precision Integration",
    body: "Trained crews mount the Wavenox monolithic solar architecture in a single unified step — no separate roofing phase. Faster than a conventional roof alone, engineered to last decades.",
    meta: "Typically 3–7 days for a standard roof",
    Icon: Wrench,
  },
  {
    n: "03",
    title: "Grid Synchronization",
    body: "We handle grid connection, net metering approval, and commissioning. From switch-on, your roof generates power — slashing bills or feeding the grid for direct earnings.",
    meta: "Earnings start from Day 1",
    Icon: Zap,
  },
];

const headerVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut", delay: 0.1 + i * 0.12 },
  }),
};

export function Process() {
  return (
    <section
      className="relative overflow-hidden py-8 md:py-12"
      style={{ backgroundImage: "none", backgroundColor: "#000000" }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#F57C00]/8 blur-[180px]"
      />

      <div className="relative mx-auto max-w-6xl px-5 pt-8 sm:px-8 md:pt-16">
        {/* Header */}
        <motion.div
          className="mx-auto max-w-3xl text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2, margin: "100px 0px 100px 0px" }}
        >
          <motion.div variants={headerVariants} className="flex justify-center">
            <span className="inline-flex items-center rounded-full border border-[#F57C00]/40 bg-white/5 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.32em] text-[#F5B366] backdrop-blur-xl shadow-[0_0_30px_-10px_rgba(245,124,0,0.5)]">
              Deployment
            </span>
          </motion.div>

          <motion.h2
            variants={headerVariants}
            className="mt-10 text-balance text-3xl font-bold leading-[1.1] tracking-tight text-white md:mt-14 md:text-4xl lg:text-5xl"
          >
            The Integration{" "}
            <span
              className="text-[#F57C00]"
              style={{ filter: "drop-shadow(0 0 10px rgba(245,124,0,0.4))" }}
            >
              Protocol
            </span>
          </motion.h2>

          <motion.p
            variants={headerVariants}
            className="mx-auto mt-8 max-w-2xl text-balance text-sm leading-relaxed text-gray-300 md:mt-10 md:text-base"
          >
            From initial architectural scanning to grid synchronization. A
            frictionless transition to apex energy generation
          </motion.p>
        </motion.div>

        {/* Timeline */}
        <div className="relative mt-16 md:mt-24">
          {/* Energy pulse line — aligned to icon centers (top card padding + icon half) */}
          <div
            aria-hidden
            className="pointer-events-none absolute left-6 right-6 hidden md:block"
            style={{ top: "calc(2rem + 28px)" }}
          >
            <div className="relative h-px w-full overflow-hidden bg-gradient-to-r from-transparent via-white/15 to-transparent">
              <span className="pulse-packet absolute top-1/2 h-[2px] w-32 -translate-y-1/2 rounded-full bg-gradient-to-r from-transparent via-[#F57C00] to-transparent shadow-[0_0_20px_rgba(245,124,0,0.9)]" />
            </div>
          </div>

          <div className="grid auto-rows-fr grid-cols-1 gap-8 md:grid-cols-3">
            {steps.map((s, i) => (
              <motion.div
                key={s.n}
                custom={i}
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.15 }}
                className="relative h-full overflow-hidden rounded-2xl p-px"
              >
                <span aria-hidden className="card-glow-spin opacity-60" />
                <div className="relative flex h-full flex-col items-center rounded-2xl border border-white/10 bg-black/90 p-8 text-center backdrop-blur-2xl">
                  {/* Icon node */}
                  <div className="relative">
                    <span
                      aria-hidden
                      className="absolute inset-0 rounded-full bg-[#F57C00]/40 blur-xl animate-pulse"
                    />
                    <span className="relative grid h-14 w-14 place-items-center rounded-full border border-[#F57C00]/50 bg-black shadow-[0_0_30px_-5px_rgba(245,124,0,0.7)]">
                      <s.Icon
                        className="h-6 w-6 text-[#F57C00]"
                        strokeWidth={1.75}
                      />
                    </span>
                  </div>

                  <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.32em] text-[#F5B366]">
                    Step {s.n}
                  </p>
                  <h3 className="mt-3 text-xl font-bold tracking-tight text-white md:text-2xl">
                    {s.title}
                  </h3>
                  <p className="mt-4 flex-1 text-sm leading-relaxed text-white/60 md:text-base">
                    {s.body}
                  </p>

                  <div className="mt-6 h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                  <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#F5B366]">
                    {s.meta}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>



      </div>
    </section>
  );
}
