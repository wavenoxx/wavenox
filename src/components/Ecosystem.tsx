import { useRef } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import eco1 from "@/assets/eco-01-grid.jpg";
import eco2 from "@/assets/eco-02-vault.jpg";
import eco3 from "@/assets/eco-03-inverter.jpg";
import eco4 from "@/assets/eco-04-tree.jpg";
import eco5 from "@/assets/eco-05-terra.jpg";
import eco6 from "@/assets/eco-06-aqua.jpg";

type Card = {
  index: string;
  title: string;
  description: string;
  image: string;
};

const cards: Card[] = [
  {
    index: "01",
    title: "Grid-Sync Architecture",
    description:
      "Flawless integration with municipal grids for shadow-free, high-yield rooftop installations.",
    image: eco1,
  },
  {
    index: "02",
    title: "PowerVault Storage",
    description:
      "Next-generation battery banks up to 10kW ensuring uninterrupted zero-latency power during grid failures.",
    image: eco2,
  },
  {
    index: "03",
    title: "Quantum Micro-Inverters",
    description:
      "Dedicated module-level optimization mitigating shadow orientation challenges for maximum systemic efficiency.",
    image: eco3,
  },
  {
    index: "04",
    title: "The Solar Tree",
    description:
      "Visually striking, space-saving urban solar canopies perfect for villas, resorts, and premium commercial spaces.",
    image: eco4,
  },
  {
    index: "05",
    title: "Terra-Firma Arrays",
    description:
      "Ground-mounted scalable arrays engineered for optimal solar exposure and massive industrial energy generation.",
    image: eco5,
  },
  {
    index: "06",
    title: "Aqua-Volt Platforms",
    description:
      "High-efficiency floating solar structures maximizing unused aquatic space while cooling panels for increased output.",
    image: eco6,
  },
];

export function Ecosystem() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  const physics = useSpring(scrollYProgress, { stiffness: 50, damping: 20, mass: 0.5 });
  const x = useTransform(physics, [0, 1], ["2%", "-72%"]);

  return (
    <section
      ref={containerRef}
      className="relative h-[300vh] bg-black"
      style={{ backgroundImage: "none", backgroundColor: "#000000" }}
    >
      <div className="sticky top-0 flex h-screen flex-col overflow-hidden">
        {/* Header */}
        <div className="relative z-10 mx-auto w-full max-w-6xl px-5 pb-20 pt-24 text-center sm:px-8 md:pb-32 md:pt-32">
          <div className="flex justify-center">
            <span className="inline-flex items-center rounded-full border border-[#F57C00]/40 bg-white/5 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.32em] text-[#F5B366] backdrop-blur-xl shadow-[0_0_30px_-10px_rgba(245,124,0,0.5)]">
              Step 05 — Infinite Scalability
            </span>
          </div>
          <h2 className="mt-10 text-3xl font-bold leading-[1.1] tracking-tight text-white md:mt-14 md:text-4xl lg:text-5xl">
            The{" "}
            <span
              className="bg-gradient-to-r from-[#FFB547] via-[#F57C00] to-[#C25A00] bg-clip-text text-transparent"
              style={{ filter: "drop-shadow(0 0 10px rgba(245,124,0,0.35))" }}
            >
              Omni-Grid
            </span>{" "}
            Ecosystem
          </h2>
          <p className="mx-auto mt-8 max-w-2xl text-sm leading-relaxed text-white/60 sm:text-base">
            Architected for infinite scalability. From urban rooftops to
            sprawling solar forests, Wavenox adapts to your exact energy demands
            without compromise.
          </p>
        </div>

        {/* Horizontal parallax rail */}
        <div className="relative flex flex-1 items-center overflow-hidden">
          <motion.div
            style={{ x }}
            className="flex gap-6 px-6 md:gap-8 md:px-12"
          >
            {cards.map((card) => (
              <article
                key={card.index}
                className="group relative h-[62vh] w-[78vw] shrink-0 rounded-2xl p-px sm:w-[62vw] md:h-[64vh] md:w-[46vw] lg:w-[36vw] xl:w-[30vw]"
              >
                <span aria-hidden className="card-glow-spin opacity-70" />
                <div className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-2xl">
                  {/* Image */}
                  <div className="relative h-1/2 w-full overflow-hidden">
                    <img
                      src={card.image}
                      alt={card.title}
                      loading="lazy"
                      width={1024}
                      height={1024}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div
                      aria-hidden
                      className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-black/40 to-black"
                    />
                    <span className="absolute left-4 top-4 rounded-full border border-white/15 bg-black/50 px-2.5 py-1 text-[10px] font-semibold tracking-[0.25em] text-white/70 backdrop-blur-xl">
                      {card.index}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="relative flex flex-1 flex-col p-6 md:p-8">
                    <div className="flex items-center gap-2.5">
                      <span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-[#F57C00] shadow-[0_0_10px_rgba(245,124,0,0.9)]" />
                      <h3 className="text-lg font-semibold tracking-tight text-white md:text-xl">
                        {card.title}
                      </h3>
                    </div>
                    <p className="mt-4 text-sm leading-relaxed text-gray-400 md:text-[15px]">
                      {card.description}
                    </p>
                    <div className="mt-auto flex items-center gap-2 border-t border-white/10 pt-5">
                      <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#F5B366]">
                        Wavenox Module
                      </span>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
