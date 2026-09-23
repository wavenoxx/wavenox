import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { openConsultationDrawer } from "@/components/ConsultationDrawer";

const IMG = {
  hero: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=2400&q=80",
  cardA:
    "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=1400&q=80",
  cardB:
    "https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&w=1400&q=80",
  storm:
    "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=2400&q=80",
  hardware:
    "https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&w=1600&q=80",
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
      <DefenseCTA />
      <Footer />
    </main>
  );
}
