import { motion, type Variants } from "framer-motion";


type Card = {
  tag: string;
  title: string;
  subtitle: string;
  image: string;
};

const cards: Card[] = [
  {
    tag: "GOVERNMENT",
    title: "Command Centers",
    subtitle: "State Headquarters",
    image:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=80",
  },
  {
    tag: "AVIATION",
    title: "Aerospace Hangars",
    subtitle: "International Airport",
    image:
      "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1600&q=80",
  },
  {
    tag: "URBAN INFRA",
    title: "Smart City Nodes",
    subtitle: "Transit Hubs",
    image:
      "https://images.unsplash.com/photo-1449034446853-66c86144b0ad?auto=format&fit=crop&w=1600&q=80",
  },
  {
    tag: "INDUSTRIAL",
    title: "Mega-Factories",
    subtitle: "Heavy Manufacturing",
    image:
      "https://images.unsplash.com/photo-1565043666747-69f6646db940?auto=format&fit=crop&w=1600&q=80",
  },
  {
    tag: "HOSPITALITY",
    title: "Luxury Resorts",
    subtitle: "Off-Grid Eco-Sanctuaries",
    image:
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1600&q=80",
  },
  {
    tag: "LOGISTICS",
    title: "Hyper-Scale Warehouses",
    subtitle: "Supply Chain Centers",
    image:
      "https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=1600&q=80",
  },
];

const headerVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: "easeOut", delay: i * 0.12 },
  }),
};

export function Portfolio() {
  return (
    <section
      className="relative overflow-hidden py-8 md:py-12"
      style={{ backgroundImage: "none", backgroundColor: "#000000" }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/3 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-[#F57C00]/8 blur-[180px]"
      />

      <div className="relative mx-auto max-w-7xl px-5 pt-8 sm:px-8 md:pt-16">
        {/* Header */}
        <motion.div
          className="mx-auto max-w-3xl text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <motion.div variants={headerVariants} className="flex justify-center">
            <span className="inline-flex items-center rounded-full border border-[#F57C00]/40 bg-white/5 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.32em] text-[#F5B366] backdrop-blur-xl shadow-[0_0_30px_-10px_rgba(245,124,0,0.5)]">
              Genesis Deployments
            </span>
          </motion.div>

          <motion.h2
            variants={headerVariants}
            className="mt-10 text-balance text-3xl font-bold leading-[1.1] tracking-tight text-white md:mt-14 md:text-4xl lg:text-5xl"
          >
            Deployments of{" "}
            <span
              className="bg-gradient-to-r from-[#FFB547] via-[#F57C00] to-[#C25A00] bg-clip-text text-transparent"
              style={{ filter: "drop-shadow(0 0 10px rgba(245,124,0,0.35))" }}
            >
              Absolute Supremacy
            </span>
          </motion.h2>

          <motion.p
            variants={headerVariants}
            className="mx-auto mt-8 max-w-2xl text-balance text-sm leading-relaxed text-gray-300 md:mt-10 md:text-base"
          >
            From ultra-secure government compounds to hyper-scale aviation hubs.
            The Wavenox footprint.
          </motion.p>
        </motion.div>

        {/* Grid */}
        <div className="mt-16 grid auto-rows-fr grid-cols-1 gap-6 md:mt-24 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
          {cards.map((card, i) => (
            <motion.article
              key={card.title}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.15 }}
              className="group relative h-full overflow-hidden rounded-2xl p-px"
            >
              <span aria-hidden className="card-glow-spin opacity-60" />
              <div className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-2xl">
                {/* Image */}
                <div className="relative aspect-[16/10] w-full overflow-hidden">
                  <img
                    src={card.image}
                    alt={card.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent"
                  />
                  <span className="absolute right-4 top-4 rounded-full border border-[#F57C00]/40 bg-black/40 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-[#F5B366] backdrop-blur-xl shadow-[0_0_20px_-6px_rgba(245,124,0,0.6)]">
                    {card.tag}
                  </span>
                </div>

                {/* Content */}
                <div className="relative flex flex-1 flex-col p-6 md:p-7">
                  <div className="flex items-center gap-2.5">
                    <span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-[#F57C00] shadow-[0_0_10px_rgba(245,124,0,0.9)]" />
                    <h3 className="text-lg font-semibold tracking-tight text-white md:text-xl">
                      {card.title}
                    </h3>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-[#F5B366] md:text-[15px]">
                    {card.subtitle}
                  </p>
                </div>
              </div>
            </motion.article>
          ))}
        </div>



      </div>
    </section>
  );
}
