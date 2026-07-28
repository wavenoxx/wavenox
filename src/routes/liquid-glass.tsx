import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import lgHero01 from "@/assets/lg-hero-01.jpg";
import lgHero02 from "@/assets/lg-hero-02.jpg";
import lgCard01 from "@/assets/lg-card-01.jpg";
import lgCard02 from "@/assets/lg-card-02.jpg";
import lgCard03 from "@/assets/lg-card-03.jpg";
import lgScale from "@/assets/lg-scale.jpg";

export const Route = createFileRoute("/liquid-glass")({
  head: () => ({
    meta: [
      { title: "Liquid Glass — WAVENOX" },
      {
        name: "description",
        content:
          "Liquid Glass by Wavenox — architectural solar infrastructure engineered for extremes. Category 5 resilience, invisible integration, global deployment.",
      },
      { property: "og:title", content: "Liquid Glass — WAVENOX" },
      {
        property: "og:description",
        content:
          "Architectural solar infrastructure engineered for extremes. Invisible integration. Global deployment.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LiquidGlassPage,
});

const fadeUp = {
  initial: { opacity: 0, y: 32 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.35 },
  transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] as const },
};

function CinematicHero({
  image,
  headline,
  sub,
  cta,
  align = "left",
}: {
  image: string;
  headline: string;
  sub: string;
  cta?: string;
  align?: "left" | "center";
}) {
  const isCenter = align === "center";
  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-black">
      <img
        src={image}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        draggable={false}
      />
      <div
        className="absolute inset-0"
        style={{
          background: isCenter
            ? "radial-gradient(ellipse at center, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.85) 70%, rgba(0,0,0,0.95) 100%)"
            : "linear-gradient(90deg, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.72) 35%, rgba(0,0,0,0.25) 70%, rgba(0,0,0,0.05) 100%)",
        }}
      />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-linear-to-t from-black to-transparent" />

      <div
        className={`relative z-10 mx-auto flex min-h-screen max-w-[1400px] flex-col justify-center px-6 md:px-12 ${
          isCenter ? "items-center text-center" : "items-start text-left"
        }`}
      >
        <motion.div {...fadeUp} className={isCenter ? "max-w-3xl" : "max-w-2xl"}>
          <h1
            className={`text-balance font-bold uppercase leading-[0.95] tracking-[-0.01em] text-white text-3xl sm:text-4xl lg:text-5xl`}
          >
            {headline}
          </h1>
          <p
            className={`mt-6 text-sm leading-relaxed text-white/75 md:text-base ${
              isCenter ? "mx-auto max-w-xl" : "max-w-xl"
            }`}
          >
            {sub}
          </p>
          {cta && (
            <div className={`mt-10 flex ${isCenter ? "justify-center" : ""}`}>
              <button
                type="button"
                className="rounded-full bg-white px-8 py-3 text-xs font-bold uppercase tracking-[0.25em] text-black transition-all duration-500 hover:bg-[#F57C00] hover:text-black"
              >
                {cta}
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}

function OmniGridCards() {
  const cards = [
    {
      image: lgCard01,
      title: "THERMAL EFFICIENCY",
      body: "Maximize power generation in extreme heat. Proprietary liquid-cooled cells retain output where conventional silicon collapses.",
    },
    {
      image: lgCard02,
      title: "KINETIC ABSORPTION",
      body: "Military-grade shatter and impact resistance. Certified against Category 5 cyclones, ballistic hail, and thermal shock.",
    },
    {
      image: lgCard03,
      title: "ZERO VISUAL NOISE",
      body: "Flawless aesthetic integration for luxury estates. No frames. No conduits. Only a monolithic obsidian surface.",
    },
  ];

  return (
    <section className="relative bg-black py-24 md:py-40">
      <div className="mx-auto max-w-[1400px] px-6 md:px-12">
        <motion.h2
          {...fadeUp}
          className="mx-auto max-w-4xl text-center text-balance font-bold uppercase leading-[0.95] tracking-[-0.01em] text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl"
        >
          The Omni-Grid Advantage
        </motion.h2>
        <motion.p
          {...fadeUp}
          transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mt-6 max-w-2xl text-center text-sm leading-relaxed text-white/60 md:text-base"
        >
          Three intersecting pillars of the Liquid Glass system — thermal, kinetic, and aesthetic superiority.
        </motion.p>

        <div className="mt-16 grid gap-6 md:mt-24 md:grid-cols-3 md:gap-8">
          {cards.map((c, i) => (
            <motion.article
              key={c.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{
                duration: 0.8,
                delay: i * 0.12,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md transition-all duration-500 hover:-translate-y-2 hover:border-white/25 hover:bg-white/[0.07]"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden">
                <img
                  src={c.image}
                  alt={c.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/10 to-transparent" />
              </div>
              <div className="p-8 md:p-10">
                <h3 className="text-lg font-bold uppercase tracking-[0.2em] text-white md:text-xl">
                  {c.title}
                </h3>
                <p className="mt-4 text-sm leading-relaxed text-white/65">
                  {c.body}
                </p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

function LiquidGlassPage() {
  return (
    <main className="bg-black">
      <Header />

      <CinematicHero
        image={lgHero01}
        headline="Engineered For Extremes"
        sub="Liquid Glass is forged to withstand Category 5 cyclones, massive hail, and extreme thermal conditions. Total energy independence, unbreakable architecture."
      />

      <CinematicHero
        image={lgHero02}
        eyebrow="Liquid Glass — 02"
        headline="Architectural Freedom"
        sub="Invisible integration. Transform ultra-luxury estates and massive skyscrapers into autonomous power plants without the visual noise of traditional solar grids."
        cta="View Integration"
      />

      <OmniGridCards />

      <CinematicHero
        image={lgScale}
        eyebrow="Liquid Glass — 05"
        headline="Global Deployment"
        sub="Delivering architectural energy independence to luxury estates and enterprise mega-structures worldwide."
        cta="Check Availability"
        align="center"
      />
    </main>
  );
}
