import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const PUBLICATIONS = [
  "Forbes India",
  "The Economic Times",
  "CNBC TV18",
  "Mint",
  "Business Standard",
  "YourStory",
  "Moneycontrol",
  "NDTV Profit",
  "The Hindu BusinessLine",
  "Telangana Today",
];

const ARTICLES = [
  {
    tag: "TECHNOLOGY",
    title: "Wavenox Patents the Omni-Grid Architecture",
    desc: "A revolutionary breakthrough in micro-inverter integration designed at the Hyderabad HQ that eliminates the need for separate battery vaults.",
    image:
      "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=1200&q=80",
  },
  {
    tag: "INVESTMENT",
    title: "The 2.5-Year ROI Disrupting Big Energy",
    desc: "How the deployment of Wavenox liquid-glass solar technology is generating positive cash flow faster than any traditional energy asset in India.",
    image:
      "https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?auto=format&fit=crop&w=1200&q=80",
  },
  {
    tag: "ENGINEERING",
    title: "Surviving Category 5: Coastal Wind Tunnel Tests",
    desc: "Inside the aerospace-grade aerodynamic engineering that allows the Wavenox flush profile to withstand 250 kmph cyclones.",
    image:
      "https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&w=1200&q=80",
  },
];

function MarqueeRow() {
  // Duplicate list for seamless loop
  const loop = [...PUBLICATIONS, ...PUBLICATIONS];
  return (
    <motion.div
      className="flex shrink-0 items-center gap-16 md:gap-24 pr-16 md:pr-24"
      animate={{ x: ["0%", "-50%"] }}
      transition={{ duration: 40, ease: "linear", repeat: Infinity }}
    >
      {loop.map((name, i) => (
        <span
          key={`${name}-${i}`}
          className="whitespace-nowrap text-lg md:text-2xl font-semibold tracking-wide text-white/40 transition-all duration-300 hover:text-white hover:[text-shadow:0_0_10px_rgba(255,255,255,0.6)]"
        >
          {name}
        </span>
      ))}
    </motion.div>
  );
}

export function Press() {
  return (
    <section
      className="relative overflow-hidden"
      style={{ backgroundImage: "none", backgroundColor: "#000000" }}
    >
      <div className="mx-auto max-w-7xl px-4 pt-16 pb-16 md:pb-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="mx-auto max-w-3xl text-center"
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#F57C00]/40 px-4 py-1.5 text-xs font-semibold tracking-[0.25em] text-[#F57C00]">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#F57C00]" />
            RECOGNITION
          </div>
          <h2 className="text-3xl font-bold leading-[1.1] tracking-tight text-white md:mt-14 md:text-4xl lg:text-5xl">
            The Nation is{" "}
            <span
              className="text-[#F57C00]"
              style={{ textShadow: "0 0 10px rgba(245,124,0,0.6)" }}
            >
              Watching
            </span>
          </h2>
          <p className="mt-6 text-sm md:text-base text-gray-300">
            India's premier financial and tech publications analyzing the Wavenox disruption.
          </p>
        </motion.div>
      </div>

      {/* Interactive Marquee */}
      <div className="relative pb-20 md:pb-28">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 md:w-40 bg-gradient-to-r from-black to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 md:w-40 bg-gradient-to-l from-black to-transparent" />
        <motion.div
          className="flex cursor-grab active:cursor-grabbing"
          drag="x"
          dragConstraints={{ left: -2000, right: 2000 }}
          dragElastic={0.15}
        >
          <MarqueeRow />
          <MarqueeRow />
        </motion.div>
      </div>

      {/* Article Cards */}
      <div className="mx-auto max-w-7xl px-4 pb-32">
        <div className="grid gap-8 md:grid-cols-3 auto-rows-fr">
          {ARTICLES.map((a, i) => (
            <motion.article
              key={a.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, delay: i * 0.15 }}
              className="group relative flex h-full flex-col overflow-hidden rounded-2xl"
            >
              {/* Image */}
              <div className="relative h-56 overflow-hidden rounded-t-2xl">
                <img
                  src={a.image}
                  alt={a.title}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <span className="absolute right-4 top-4 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-semibold tracking-[0.2em] text-white backdrop-blur-xl [text-shadow:0_0_10px_rgba(255,255,255,0.4)]">
                  {a.tag}
                </span>
              </div>

              {/* Glass panel */}
              <div className="relative flex flex-1 flex-col overflow-hidden rounded-b-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-2xl">
                <div className="card-glow-spin opacity-60" />
                <div className="relative flex flex-1 flex-col">
                  <h3 className="text-lg md:text-xl font-semibold text-white leading-tight">
                    {a.title}
                  </h3>
                  <p className="mt-3 flex-1 text-sm text-gray-300 leading-relaxed">
                    {a.desc}
                  </p>
                  <a
                    href="#"
                    className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#F57C00] transition-transform duration-300 group-hover:translate-x-2"
                  >
                    Read Article <ArrowRight className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
