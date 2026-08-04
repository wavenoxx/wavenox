import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/Header";

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
          "Military-grade architecture, EMP shielding, and failsafe redundancy for your estate.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DefensePage,
});

const LABEL = "text-[10px] font-bold uppercase tracking-widest text-white/50 md:text-xs";
const H = "text-3xl font-bold uppercase leading-[1.05] tracking-tight text-white md:text-5xl";
const BODY = "text-sm leading-relaxed text-white/50 md:text-base";

function CoreHero() {
  return (
    <section className="relative min-h-screen w-full bg-black">
      <div className="absolute inset-0 bg-[#111111]" aria-hidden="true" />
      <div className="relative z-10 mx-auto flex min-h-screen max-w-[1400px] items-end px-6 pb-32 pt-48 md:px-12 lg:pb-48">
        <div className="max-w-xl">
          <h1 className={H}>Impenetrable by Design</h1>
          <p className={`mt-8 ${BODY}`}>
            Engineered to withstand Category 5 hurricanes, ballistic impacts, and
            extreme thermal shock. Your estate remains an unyielding fortress.
          </p>
        </div>
      </div>
    </section>
  );
}

function TechnicalGrid() {
  return (
    <section className="w-full bg-black py-32 lg:py-48">
      <div className="mx-auto max-w-[1400px] px-6 md:px-12">
        <div className="max-w-xl">
          <h2 className={H}>Military-Grade Architecture</h2>
          <p className={`mt-8 ${BODY}`}>
            Forged from aerospace-grade polymers and reinforced titanium. Wavenox
            tiles provide structural armor for your sanctuary.
          </p>
        </div>

        <div className="mt-32 grid grid-cols-1 gap-8 md:grid-cols-2 lg:gap-16">
          {[
            ["Impact Rating", "MIL-STD-810G"],
            ["Wind Resistance", "250 MPH"],
          ].map(([k, v]) => (
            <div
              key={k}
              className="flex min-h-[220px] flex-col justify-end border border-white/10 bg-[#111111] p-8 md:p-12"
            >
              <span className={LABEL}>{k}</span>
              <div className="mt-4 text-xl font-bold uppercase tracking-tight text-white md:text-3xl">
                {v}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ClimateHero() {
  return (
    <section className="relative min-h-[80vh] w-full bg-black">
      <div className="absolute inset-0 bg-[#111111]" aria-hidden="true" />
      <div className="relative z-10 mx-auto flex min-h-[80vh] max-w-[1400px] items-center justify-end px-6 py-32 md:px-12 lg:py-48">
        <div className="max-w-xl text-left lg:text-right">
          <h2 className={H}>Climate Fortitude</h2>
          <p className={`mt-8 ${BODY}`}>
            When the grid collapses and the elements rage, Wavenox ensures your
            estate remains an island of light, warmth, and absolute security.
          </p>
          <button
            type="button"
            className="mt-12 inline-flex items-center gap-3 border border-white/10 px-8 py-3 text-[10px] font-bold uppercase tracking-widest text-white md:text-xs"
          >
            Watch
            <span aria-hidden="true">&rarr;</span>
          </button>
        </div>
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
      <div className="mx-auto flex max-w-[1400px] flex-col gap-32 px-6 md:px-12 lg:flex-row lg:items-center lg:gap-48">
        <div className="w-full lg:w-1/2">
          <h2 className={H}>The Shield Protocol</h2>

          <div className="mt-12 flex flex-wrap gap-10">
            {(Object.keys(SHIELD_TABS) as ShieldTab[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`text-[10px] font-bold uppercase tracking-widest md:text-xs ${
                  tab === t ? "text-white" : "text-white/30"
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
                <span className="text-sm font-bold uppercase tracking-tight text-white md:text-base">
                  {v}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="w-full lg:w-1/2">
          <div className="min-h-[420px] w-full border border-white/10 bg-[#111111] lg:min-h-[560px]" />
        </div>
      </div>
    </section>
  );
}

const MATRIX = [
  ["EMP Shielding", "Military-grade Faraday cages protect the core."],
  ["Thermal Regulation", "Active heat dissipation prevents micro-cracking."],
  [
    "Ballistic Rated",
    "Class 4 impact resistance. Designed to survive severe physical trauma.",
  ],
  [
    "Failsafe Redundancy",
    "Decentralized micro-inverters ensure localized damage never compromises overall power.",
  ],
];

function SpecificationsMatrix() {
  return (
    <section className="w-full bg-black py-32 lg:py-48">
      <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-20 px-6 md:grid-cols-2 md:px-12 lg:gap-32">
        {MATRIX.map(([title, body]) => (
          <div key={title}>
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-white md:text-xs">
              {title}
            </h3>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-white/50">
              {body}
            </p>
          </div>
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
