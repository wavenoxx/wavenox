import { AnimatePresence, motion, type Variants } from "framer-motion";
import { Plus } from "lucide-react";
import { useState } from "react";

const faqs: { q: string; a: string }[] = [
  {
    q: "What is the difference between an integrated solar roof and traditional solar panels?",
    a: "Traditional panels are bolted onto existing roofs using aluminum rails, creating aesthetic clutter and structural vulnerabilities. An integrated solar roof, like the Wavenox liquid-glass system, replaces the roofing material entirely, acting as both a weatherproof structural barrier and a high-yield power plant.",
  },
  {
    q: "How much can I actually save with a premium solar rooftop system?",
    a: "Savings depend on kinetic yield and localized tariffs. However, premium systems utilizing integrated micro-inverters can reduce grid dependency by up to 100%. For luxury estates and commercial facilities, this translates to a capital return on investment (ROI) within 2.5 to 3 years.",
  },
  {
    q: "How much rooftop space is required for a commercial or luxury solar installation?",
    a: "Unlike outdated 400W panels that require massive square footage, high-density solar architectures maximize yield in minimal space. The Wavenox Omni-Grid system is designed for edge-to-edge installation, generating maximum kinetic output regardless of complex roof angles.",
  },
  {
    q: "Do integrated solar roofs require regular cleaning or maintenance?",
    a: "Standard panels require frequent cleaning to prevent dirt-induced energy drops. High-end systems utilize hydrophobic, self-cleaning liquid-glass surfaces. This ensures optimal thermal management and kinetic yield with virtually zero manual maintenance.",
  },
  {
    q: "Are solar roofs safe during severe weather or coastal cyclones?",
    a: "Traditional bolt-on panels are highly susceptible to wind uplift. A true integrated solar roof sits completely flush with the structure. Aerospace-grade systems are wind-tunnel tested to withstand Category 5 cyclones (250+ kmph winds) and feature Class-A fire ratings for absolute safety.",
  },
  {
    q: "What is the standard warranty period for high-end solar rooftop systems?",
    a: "While budget solar panels offer 10-year warranties, tier-one integrated systems are engineered for generational durability. The Wavenox architecture is backed by a 25-year performance warranty and is protected by proprietary 20-year patents in both India and the USA.",
  },
  {
    q: "Is net metering available with solar rooftop installations in India?",
    a: "Yes. Net metering allows you to export excess kinetic energy generated during the day back to the local grid, earning you credits. Our AI-driven deployment protocol ensures your system is perfectly calibrated to local Indian grid regulations for maximum financial return.",
  },
  {
    q: "Can I get a government subsidy for a premium rooftop solar installation?",
    a: "The Indian government offers substantial subsidies for residential solar deployments. While Wavenox caters to the premium market, our structural installations are fully BIS-certified, making them eligible for applicable state and central grid benefits.",
  },
  {
    q: "What financing options are available for luxury solar rooftop systems in India?",
    a: "Transitioning to energy independence is a capital asset acquisition. We partner with India's premier financial institutions to offer seamless, low-interest solar financing, ensuring that your system generates positive cash flow from day one.",
  },
  {
    q: "Will installing solar panels ruin my home's architectural design?",
    a: "Traditional panels often disrupt the visual flow of luxury properties. This is why the Wavenox system was engineered. With zero visible wiring, no ugly rails, and a seamless edge-to-edge obsidian glass profile, it elevates your property's architecture rather than compromising it.",
  },
];

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut", delay: i * 0.05 },
  }),
};

const headerVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

export function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section
      id="faq"
      className="relative overflow-hidden py-24 md:py-32"
      style={{
        backgroundImage: "none !important",
        backgroundColor: "#000000 !important",
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/3 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-[#F57C00]/5 blur-[180px]"
      />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Left — Sticky */}
          <motion.div
            className="lg:col-span-4"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={headerVariants}
          >
            <div className="lg:sticky lg:top-32">
              <span className="inline-flex items-center rounded-full border border-[#F57C00]/40 bg-white/5 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.28em] text-[#F5B366] backdrop-blur-xl shadow-[0_0_30px_-10px_rgba(245,124,0,0.4)]">
                Frequently Asked Questions
              </span>
              <h2 className="mt-8 text-3xl font-bold leading-[1.05] tracking-tight text-white md:mt-10 md:text-4xl lg:text-5xl">
                System{" "}
                <span
                  className="bg-gradient-to-r from-[#FFB547] via-[#F57C00] to-[#C25A00] bg-clip-text text-transparent"
                  style={{ filter: "drop-shadow(0 0 10px rgba(245,124,0,0.35))" }}
                >
                  Intelligence
                </span>
              </h2>
              <p className="mt-6 max-w-md text-sm leading-relaxed text-gray-400 md:text-base">
                Explore the technical, financial, and structural parameters of
                the Wavenox Omni-Grid ecosystem.
              </p>
            </div>
          </motion.div>

          {/* Right — Accordion */}
          <motion.div
            className="lg:col-span-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.05 }}
          >
            <div className="divide-y divide-white/10 border-t border-white/10">
              {faqs.map((item, i) => {
                const isOpen = openIndex === i;
                return (
                  <motion.div
                    key={item.q}
                    custom={i}
                    variants={itemVariants}
                    className="group"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenIndex(isOpen ? null : i)}
                      className="flex w-full items-center justify-between gap-6 py-6 text-left transition-colors md:py-7"
                      aria-expanded={isOpen}
                    >
                      <span className="text-base font-medium tracking-tight text-white md:text-lg">
                        {item.q}
                      </span>
                      <motion.span
                        animate={{ rotate: isOpen ? 45 : 0 }}
                        transition={{ type: "spring", stiffness: 260, damping: 22 }}
                        className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[#F57C00]/40 bg-[#F57C00]/10 text-[#F57C00] shadow-[0_0_20px_-6px_rgba(245,124,0,0.6)]"
                      >
                        <Plus className="h-4 w-4" strokeWidth={2.25} />
                      </motion.span>
                    </button>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          key="content"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{
                            height: { type: "spring", stiffness: 120, damping: 20 },
                            opacity: { duration: 0.25 },
                          }}
                          className="overflow-hidden"
                        >
                          <div className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md md:p-6">
                            <p className="text-sm leading-relaxed text-gray-300 md:text-base">
                              {item.a}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
