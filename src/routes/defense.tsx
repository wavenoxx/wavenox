import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { openConsultationDrawer } from "@/components/ConsultationDrawer";
import defHero01 from "@/assets/def-hero-01.jpg";
import defHero02 from "@/assets/def-hero-02.jpg";
import defTile from "@/assets/def-tile.jpg";
import defGrid from "@/assets/def-grid.jpg";
import ogCore from "@/assets/og-core.jpg";

const IMG = {
  hero: defHero01,
  cardA: defTile,
  cardB: defGrid,
  storm: defHero02,
  hardware: ogCore,
};

export const Route = createFileRoute("/defense")({
  head: () => ({
    meta: [
      { title: "Defense & Safety — WAVENOX" },
      {
        name: "description",
        content:
          "Impenetrable by design. Wavenox tiles withstand Category 5 hurricanes, ballistic impacts, and extreme thermal shock.",
      },
      { property: "og:title", content: "Defense & Safety — WAVENOX" },
      {
        property: "og:description",
        content:
          "Military grade architecture, EMP shielding, and failsafe redundancy for your estate.",
      },
      { property: "og:type", content: "website" },
      { property: "og:image", content: IMG.hero },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: IMG.hero },
    ],
  }),
  component: DefensePage,
});

function CoreHero() {
  return (
    <section className="relative flex min-h-screen items-center bg-black">
      <img
        src={IMG.hero}
        alt="Dark luxury villa architectural exterior at night"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black via-black/30 to-black"
        aria-hidden="true"
      />
      <div className="relative z-10 w-full max-w-4xl px-6 pt-32 md:px-16">
        <h1 className="mb-6 text-3xl font-bold uppercase leading-tight tracking-tight text-white md:text-5xl lg:text-6xl">
          Impenetrable by Design
        </h1>
        <p className="max-w-2xl text-base font-normal leading-relaxed text-white/90 md:text-xl">
          Engineered to withstand Category 5 hurricanes, ballistic impacts, and
          extreme thermal shock. Your estate remains an unyielding fortress.
        </p>
      </div>
    </section>
  );
}

const CARDS = [
  {
    src: IMG.cardA,
    alt: "Macro solar panel glass texture",
    stat: "IMPACT RATING: MIL-STD-810G",
  },
  {
    src: IMG.cardB,
    alt: "Black glass solar architecture facade",
    stat: "WIND RESISTANCE: 250 MPH",
  },
];

function TechnicalGrid() {
  return (
    <section className="mx-auto max-w-7xl bg-black px-6 py-20 md:px-16 md:py-36">
      <h2 className="mb-4 text-2xl font-bold uppercase text-white md:text-4xl">
        Military Grade Architecture
      </h2>
      <p className="mb-12 max-w-2xl font-normal text-white/90">
        Forged from aerospace-grade polymers and reinforced titanium. Wavenox
        tiles provide structural armor for your sanctuary.
      </p>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-12">
        {CARDS.map((c) => (
          <figure
            key={c.stat}
            className="relative overflow-hidden border border-white/10 bg-black"
          >
            <img
              src={c.src}
              alt={c.alt}
              loading="lazy"
              className="aspect-[4/3] w-full object-cover"
            />
            <figcaption className="absolute bottom-0 left-0 right-0 border-t border-white/10 bg-black/70 p-6 backdrop-blur-md md:p-8">
              <span className="whitespace-nowrap font-mono text-sm tracking-widest text-white">
                {c.stat}
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

function ClimateHero() {
  return (
    <section className="relative flex min-h-[80vh] items-center justify-end bg-black">
      <img
        src={IMG.storm}
        alt="Dark stormy landscape surrounding a modern estate"
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black via-black/30 to-black"
        aria-hidden="true"
      />
      <div className="relative z-10 w-full max-w-2xl px-6 py-20 text-right md:px-16">
        <h2 className="mb-4 text-2xl font-bold uppercase text-white md:text-4xl lg:text-5xl">
          Climate Fortitude
        </h2>
        <p className="text-base font-normal text-white/90 md:text-lg">
          When the grid collapses and the elements rage, Wavenox ensures your
          estate remains an island of light, warmth, and absolute security.
        </p>
      </div>
    </section>
  );
}

const SPECS = [
  ["THICKNESS", "12mm"],
  ["IMPACT RATING", "CLASS 4"],
  ["FIRE RATING", "CLASS A"],
];

function ShieldProtocol() {
  return (
    <section className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 py-20 md:px-16 md:py-36 lg:grid-cols-2 lg:gap-16">
      <div>
        <h2 className="mb-6 text-2xl font-bold uppercase text-white md:text-4xl">
          The Shield Protocol
        </h2>
        <div className="space-y-4">
          {SPECS.map(([k, v]) => (
            <div
              key={k}
              className="flex justify-between gap-6 border-b border-white/10 pb-3 font-mono text-sm text-white/90"
            >
              <span className="whitespace-nowrap">{k}</span>
              <span className="whitespace-nowrap">{v}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="border border-white/10 bg-black/40">
        <img
          src={IMG.hardware}
          alt="Solar battery storage tower hardware"
          loading="lazy"
          className="aspect-square w-full object-cover"
        />
      </div>
    </section>
  );
}

const MATRIX = [
  ["EMP SHIELDING", "Military grade Faraday cages protect the core."],
  ["THERMAL REGULATION", "Active heat dissipation prevents micro-cracking."],
  [
    "BALLISTIC RATED",
    "Class 4 impact resistance. Designed to survive severe physical trauma.",
  ],
  [
    "FAILSAFE REDUNDANCY",
    "Decentralized micro-inverters ensure localized damage never compromises overall power.",
  ],
];

function SpecificationsMatrix() {
  return (
    <section className="mx-auto grid max-w-7xl grid-cols-1 gap-8 border-t border-white/10 px-6 py-20 md:grid-cols-2 md:gap-12 md:px-16 md:py-36">
      {MATRIX.map(([title, body]) => (
        <div key={title}>
          <h3 className="mb-3 text-sm font-bold uppercase tracking-widest text-white md:text-base">
            {title}
          </h3>
          <p className="max-w-md text-sm font-normal leading-relaxed text-white/90">
            {body}
          </p>
        </div>
      ))}
    </section>
  );
}

const DEFENSE_STANDARDS = [
  {
    id: "impact",
    title: "Class 4 Ballistic & Hail Strike",
    protocol: "ASTM FM 4473 / UL 2218",
    rating: "ZERO CRACKING @ 160 KM/H",
    desc: "Engineered to withstand 50mm (2-inch) ice balls traveling at terminal velocity and stray high-velocity debris with zero glass fracture or performance drop.",
  },
  {
    id: "wind",
    title: "Category 5 Wind Uplift",
    protocol: "ASTM E330 / TAS 108",
    rating: "TESTED TO 320 KM/H (200 MPH)",
    desc: "Patented titanium interlocks lock directly to roof substructures, resisting extreme negative pressure suction during severe tropical cyclones.",
  },
  {
    id: "emp",
    title: "EMP Military Faraday Shielding",
    protocol: "MIL-STD-188-125-1",
    rating: "ATTENUATION > 80 dB (10 kHz - 1 GHz)",
    desc: "Enclosed Faraday shielding surrounds the micro-inverter matrix and battery core, guaranteeing survival against coronal mass ejections (CME) and high-altitude electromagnetic pulses.",
  },
  {
    id: "fire",
    title: "Class A Fire Imperviousness",
    protocol: "UL 790 / ASTM E108",
    rating: "NON-COMBUSTIBLE MONOLITHIC GLASS",
    desc: "Unlike traditional polymer backsheets which ignite and propagate roof fires, WAVENOX dual-tempered glass provides an unyielding barrier against flying embers and extreme heat.",
  },
];

function ArmorToleranceComparator() {
  const [activeStandard, setActiveStandard] = useState("impact");
  const current = DEFENSE_STANDARDS.find((s) => s.id === activeStandard) || DEFENSE_STANDARDS[0];

  return (
    <section className="bg-black py-20 md:py-36 border-t border-white/10">
      <div className="mx-auto max-w-7xl px-6 md:px-16">
        <div className="max-w-3xl">
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-[#F57C00]">
            STRUCTURAL VERIFICATION MATRIX
          </span>
          <h2 className="mt-4 text-3xl font-bold uppercase tracking-tight text-white md:text-5xl">
            MILITARY TESTING PROTOCOLS
          </h2>
        </div>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {DEFENSE_STANDARDS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setActiveStandard(s.id)}
              className={`p-6 border text-left transition-all duration-300 cursor-pointer ${
                activeStandard === s.id
                  ? "border-[#F57C00] bg-white/[0.04] shadow-lg shadow-[#F57C00]/10"
                  : "border-white/10 bg-black/40 hover:border-white/30"
              }`}
            >
              <span className="text-[10px] font-mono uppercase text-[#F57C00]">
                {s.protocol}
              </span>
              <h3 className="mt-2 text-sm font-bold uppercase text-white">
                {s.title}
              </h3>
            </button>
          ))}
        </div>

        <div className="mt-8 border border-white/10 bg-white/[0.02] p-8 md:p-12">
          <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-white/10 pb-6">
            <div>
              <span className="text-xs font-mono uppercase text-white/50">{current.protocol}</span>
              <h3 className="text-2xl font-bold uppercase text-white mt-1">{current.title}</h3>
            </div>
            <div className="font-mono text-sm font-bold text-[#F57C00]">{current.rating}</div>
          </div>
          <p className="mt-6 text-sm leading-relaxed text-white/80 max-w-3xl">
            {current.desc}
          </p>
        </div>
      </div>
    </section>
  );
}

function DefenseCTA() {
  return (
    <section className="border-t border-white/10 bg-black px-6 py-24 text-center md:py-36">
      <div className="mx-auto max-w-4xl">
        <span className="font-mono text-xs uppercase tracking-[0.3em] text-[#F57C00]">
          FORTRESS-GRADE INTEGRATION
        </span>
        <h2 className="mt-4 text-3xl font-bold uppercase tracking-tight text-white md:text-5xl">
          ARMOR YOUR ESTATE WITH WAVENOX DEFENSE
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-sm leading-relaxed text-white/70 md:text-base">
          Engineered for mission-critical continuity, EMP immunity, and ballistic resilience. Our defense engineering team deploys worldwide.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => openConsultationDrawer("industrial")}
            className="cursor-pointer rounded-full bg-white px-8 py-3.5 text-xs font-bold uppercase tracking-[0.25em] text-black transition-all duration-300 hover:bg-[#F57C00] hover:text-black"
          >
            COMMISSION DEFENSE AUDIT →
          </button>
        </div>
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
      <ArmorToleranceComparator />
      <DefenseCTA />
      <Footer />
    </main>
  );
}
