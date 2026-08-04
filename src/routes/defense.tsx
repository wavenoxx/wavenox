import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import defHero01 from "@/assets/def-hero-01.jpg";
import defGrid from "@/assets/def-grid.jpg";
import defHero02 from "@/assets/def-hero-02.jpg";
import defTile from "@/assets/def-tile.jpg";

export const Route = createFileRoute("/defense")({
  head: () => ({
    meta: [
      { title: "Defense & Safety — WAVENOX" },
      {
        name: "description",
        content:
          "Impenetrable by design. Wavenox tiles withstand Category 5 hurricanes, ballistic impacts, and extreme thermal shock — structural armor for your estate.",
      },
      { property: "og:title", content: "Defense & Safety — WAVENOX" },
      {
        property: "og:description",
        content:
          "Military-grade architecture, EMP shielding, and failsafe redundancy. Your estate remains an unyielding fortress.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DefensePage,
});

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.3 },
  transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] as const },
};

const LABEL =
  "text-[10px] font-bold uppercase tracking-widest text-white/50 md:text-xs";

function CoreHero() {
  return (
    <section className="relative min-h-[80vh] w-full overflow-hidden bg-black">
      <img
        src={defHero01}
        alt="Macro shot of a Wavenox liquid glass tile edge catching a blinding beam of light against a pure black void"
        width={1920}
        height={1088}
        className="absolute inset-0 h-full w-full object-cover"
        draggable={false}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black via-black/30 to-black" />
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent" />

      <div className="relative z-10 mx-auto flex min-h-[80vh] max-w-[1400px] items-center px-6 py-32 md:px-12 lg:py-48">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-xl"
        >
          <h1 className="text-balance text-3xl font-bold uppercase leading-[1.05] tracking-tight text-white md:text-5xl lg:text-6xl">
            Impenetrable by Design
          </h1>
          <p className="mt-8 text-sm leading-relaxed text-white/50 md:text-base">
            Engineered to withstand Category 5 hurricanes, ballistic impacts, and
            extreme thermal shock. Your estate remains an unyielding fortress.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

function TechnicalGrid() {
  return (
    <section className="relative w-full overflow-hidden bg-black py-32 lg:py-48">
      <img
        src={defGrid}
        alt="Perspective render of layered Wavenox roof panels receding into a black void"
        width={1920}
        height={1088}
        loading="lazy"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-70"
        draggable={false}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black" />

      <div className="relative z-10 mx-auto max-w-[1400px] px-6 md:px-12">
        <motion.div {...fadeUp} className="max-w-xl">
          <h2 className="text-3xl font-bold uppercase leading-[1.05] tracking-tight text-white md:text-5xl">
            Military-Grade Architecture
          </h2>
          <p className="mt-8 text-sm leading-relaxed text-white/50 md:text-base">
            Forged from aerospace-grade polymers and reinforced titanium. Wavenox
            tiles don't just capture energy; they provide structural armor for your
            sanctuary.
          </p>
        </motion.div>

        <motion.div
          {...fadeUp}
          className="mt-40 flex flex-col gap-10 sm:flex-row sm:justify-end sm:gap-20 lg:mt-64"
        >
          {[
            ["Impact Rating", "MIL-STD-810G"],
            ["Wind Resistance", "250 MPH"],
          ].map(([k, v]) => (
            <div key={k} className="border-t border-white/10 pt-6">
              <span className={LABEL}>{k}</span>
              <div className="mt-3 text-xl font-bold tracking-tight text-white md:text-3xl">
                {v}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function ClimateHero() {
  return (
    <section className="relative min-h-[80vh] w-full overflow-hidden bg-black">
      <img
        src={defHero02}
        alt="Ultra-luxury dark estate glowing with autonomous power beneath a violent storm"
        width={1920}
        height={1088}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover"
        draggable={false}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
      <div className="absolute inset-0 bg-gradient-to-l from-black via-black/40 to-transparent" />

      <div className="relative z-10 mx-auto flex min-h-[80vh] max-w-[1400px] items-center justify-end px-6 py-32 md:px-12 lg:py-48">
        <motion.div {...fadeUp} className="max-w-xl text-left lg:text-right">
          <h2 className="text-3xl font-bold uppercase leading-[1.05] tracking-tight text-white md:text-5xl">
            Climate Fortitude
          </h2>
          <p className="mt-8 text-sm leading-relaxed text-white/50 md:text-base">
            When the grid collapses and the elements rage, Wavenox ensures your
            estate remains an island of light, warmth, and absolute security.
          </p>
          <button
            type="button"
            className="mt-12 inline-flex items-center gap-3 rounded-full border border-white/20 px-8 py-3 text-[10px] font-bold uppercase tracking-widest text-white transition-colors duration-500 hover:bg-white hover:text-black md:text-xs"
          >
            Watch
            <span aria-hidden="true">&rarr;</span>
          </button>
        </motion.div>
      </div>
    </section>
  );
}

const SHIELD_TABS = {
  OVERVIEW: [
    ["Thickness", "12mm"],
    ["Impact Rating", "Class 4"],
    ["Fire Rating", "Class A"],
  ],
  THERMAL: [
    ["Operating Range", "-40°F / 140°F"],
    ["Dissipation", "Active Liquid"],
    ["Thermal Shock", "MIL-STD-810G"],
  ],
  BALLISTIC: [
    ["Hail Rating", "Class 4"],
    ["Impact Energy", "> 55 J"],
    ["Penetration", "Zero"],
  ],
} as const;

type ShieldTab = keyof typeof SHIELD_TABS;

function ShieldProtocol() {
  const [tab, setTab] = useState<ShieldTab>("OVERVIEW");

  return (
    <section className="w-full bg-black py-32 lg:py-48">
      <div className="mx-auto grid max-w-[1400px] grid-cols-1 items-center gap-24 px-6 md:px-12 lg:grid-cols-2 lg:gap-32">
        <motion.div {...fadeUp}>
          <h2 className="text-3xl font-bold uppercase leading-[1.05] tracking-tight text-white md:text-5xl">
            The Shield Protocol
          </h2>

          <div className="mt-12 flex flex-wrap gap-8">
            {(Object.keys(SHIELD_TABS) as ShieldTab[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`pb-2 text-[10px] font-bold uppercase tracking-widest transition-colors duration-300 md:text-xs ${
                  tab === t
                    ? "border-b border-white text-white"
                    : "border-b border-transparent text-white/30 hover:text-white/60"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="mt-14 border-t border-white/10">
            {SHIELD_TABS[tab].map(([k, v]) => (
              <div
                key={k}
                className="flex items-baseline justify-between gap-10 border-b border-white/10 py-6"
              >
                <span className={LABEL}>{k}</span>
                <span className="text-sm font-bold tracking-tight text-white md:text-base">
                  {v}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div {...fadeUp} className="relative w-full overflow-hidden">
          <img
            src={defTile}
            alt="Exploded studio render of a Wavenox liquid glass tile showing armor, cell, and glass layers"
            width={1440}
            height={1440}
            loading="lazy"
            className="h-full w-full object-cover"
            draggable={false}
          />
        </motion.div>
      </div>
    </section>
  );
}

const MATRIX = [
  {
    title: "EMP Shielding",
    body: "Military-grade Faraday cages protect the Omnigrid core from electromagnetic pulses.",
    icon: (
      <>
        <circle cx="16" cy="16" r="11" />
        <circle cx="16" cy="16" r="4" />
        <path d="M16 5V1M16 31v-4M5 16H1M31 16h-4" />
      </>
    ),
  },
  {
    title: "Thermal Regulation",
    body: "Active heat dissipation prevents micro-cracking and maintains peak efficiency in 120°F+ environments.",
    icon: (
      <>
        <path d="M16 2v28M16 8l6-5M16 8l-6-5M16 24l6 5M16 24l-6 5" />
        <path d="M4 9l24 14M28 9L4 23" />
      </>
    ),
  },
  {
    title: "Ballistic Rated",
    body: "Class 4 impact resistance. Designed to survive severe hail and physical trauma without performance degradation.",
    icon: (
      <>
        <path d="M16 2l12 5v9c0 8-5 12-12 14C9 28 4 24 4 16V7l12-5z" />
        <path d="M11 16l4 4 7-8" />
      </>
    ),
  },
  {
    title: "Failsafe Redundancy",
    body: "Decentralized micro-inverters ensure that localized damage never compromises the estate's overall power.",
    icon: (
      <>
        <rect x="3" y="3" width="10" height="10" />
        <rect x="19" y="3" width="10" height="10" />
        <rect x="3" y="19" width="10" height="10" />
        <rect x="19" y="19" width="10" height="10" />
        <path d="M13 8h6M8 13v6M24 13v6M13 24h6" />
      </>
    ),
  },
];

function SpecificationsMatrix() {
  return (
    <section className="w-full bg-black py-32 lg:py-48">
      <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-20 px-6 md:px-12 lg:grid-cols-2 lg:gap-x-32 lg:gap-y-28">
        {MATRIX.map((item) => (
          <motion.div key={item.title} {...fadeUp} className="flex gap-6">
            <svg
              viewBox="0 0 32 32"
              className="mt-1 h-8 w-8 shrink-0 stroke-white/60"
              fill="none"
              strokeWidth={1}
              strokeLinecap="square"
              aria-hidden="true"
            >
              {item.icon}
            </svg>
            <div>
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-white md:text-xs">
                {item.title}
              </h3>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-white/50">
                {item.body}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function DefensePage() {
  return (
    <main className="min-h-screen w-full bg-black">
      <Header />
      <CoreHero />
      <TechnicalGrid />
      <ClimateHero />
      <ShieldProtocol />
      <SpecificationsMatrix />
    </main>
  );
}
