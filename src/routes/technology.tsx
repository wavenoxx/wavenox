import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Shield,
  Zap,
  Wind,
  Sun,
  Activity,
  CheckCircle2,
  XCircle,
  Cpu,
  Layers,
  Sparkles,
  Phone,
  ArrowRight,
  Maximize2,
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/system/Button";
import { Media } from "@/components/system/Media";
import { media } from "@/config/media";
import { BRAND_CONFIG } from "@/config/brand";
import { PRODUCTS_CONFIG } from "@/config/products";
import { openConsultationDrawer } from "@/components/ConsultationDrawer";

export const Route = createFileRoute("/technology")({
  head: () => ({
    meta: [
      { title: `Technology Atelier & Engineering Standards — ${BRAND_CONFIG.name}` },
      {
        name: "description",
        content:
          "The engineering science behind WAVENOX: N-type TOPCon bifacial cell physics, 170 km/h cyclone-rated pergolas, <20ms microgrid switchgear, and zero terrace slab damage.",
      },
      {
        property: "og:title",
        content: `Technology Atelier & Engineering Standards — ${BRAND_CONFIG.name}`,
      },
      {
        property: "og:description",
        content:
          "Explore the metallurgy, cell physics, and software engineering behind monolithic luxury solar.",
      },
      { property: "og:image", content: "/media/home-heat-1600w.jpg" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      {
        rel: "preload",
        as: "image",
        href: "/media/home-heat-1600w.webp",
        media: "(min-width: 768px)",
        type: "image/webp",
      },
      {
        rel: "preload",
        as: "image",
        href: "/media/home-heat-mobile.webp",
        media: "(max-width: 767px)",
        type: "image/webp",
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "TechArticle",
          headline: "WAVENOX Monolithic Clean Energy Architecture & Engineering Standards",
          description:
            "Technical specification of N-type TOPCon bifacial modules, LiFePO4 battery energy storage, and elevated terrace pergola engineering in India.",
          author: {
            "@type": "Organization",
            name: BRAND_CONFIG.name,
            url: "https://wavenox.in",
          },
          publisher: {
            "@type": "Organization",
            name: BRAND_CONFIG.name,
            logo: "https://wavenox.in/favicon.ico",
          },
        }),
      },
    ],
  }),
  component: TechnologyPage,
});

function TechnologyPage() {
  const [activeTab, setActiveTab] = React.useState<"cell" | "pergola" | "storage" | "iot">("cell");

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#171A20] selection:bg-[#171A20] selection:text-[#FFFFFF]">
      <Header />

      <main className="pt-24 sm:pt-28 md:pt-32 pb-20">
        {/* 1. HERO HEADER */}
        <section className="max-w-4xl mx-auto px-6 text-center">
          <span className="text-[11px] sm:text-[12px] font-medium tracking-[0.2em] uppercase text-[#5C5E62] block mb-3">
            Engineering Atelier &amp; Metallurgy
          </span>
          <h1 className="text-[32px] sm:text-[44px] md:text-[54px] font-medium tracking-tight leading-[1.1] text-[#171A20] text-balance">
            The Anatomy of Monolithic Solar
          </h1>
          <p className="text-[15px] sm:text-[17px] font-normal leading-relaxed text-[#5C5E62] max-w-2xl mx-auto mt-3 sm:mt-4 text-balance">
            How WAVENOX engineered an integrated, all-black clean energy architecture built for
            extreme Indian summer heat, coastal cyclones, and modern luxury estates.
          </p>

          {/* Key Engineering Benchmarks Ribbon */}
          <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4 max-w-4xl mx-auto">
            {[
              { value: "22.8%", label: "Module Efficiency", sub: "STC Certified" },
              { value: "-0.30%", label: "Temp. Coeff.", sub: "Per °C Rise" },
              { value: "< 20 ms", label: "Islanding Speed", sub: "Solid-State" },
              { value: "170 km/h", label: "Cyclone Rating", sub: "IS 875 Part 3" },
              { value: "14.3 kWh", label: "Modular LFP", sub: "Expandable" },
              { value: "25 Years", label: "Asset Warranty", sub: "≥ 84.8% Output" },
            ].map((stat, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-[6px] border border-[#E3E4E6] bg-[#F4F4F4]/50 flex flex-col items-center justify-center text-center"
              >
                <span className="text-[20px] sm:text-[22px] font-semibold tracking-tight text-[#171A20] tabular-nums">
                  {stat.value}
                </span>
                <span className="text-[11px] font-medium uppercase tracking-wider text-[#5C5E62] mt-0.5">
                  {stat.label}
                </span>
                <span className="text-[10px] text-[#5C5E62]/70">{stat.sub}</span>
              </div>
            ))}
          </div>
        </section>

        {/* 2. THE VISUAL HERO CANVAS: N-TYPE CELL ARCHITECTURE */}
        <section className="max-w-5xl mx-auto px-6 mt-14 sm:mt-16">
          <div className="relative aspect-[16/9] w-full rounded-[12px] overflow-hidden border border-[#171A20]/10 shadow-2xl">
            <Media
              media={media["home-heat"]}
              priority={true}
              fill={true}
              className="w-full h-full object-cover"
              alt="Microscopic architecture of N-type TOPCon bifacial silicon wafer under precision rim lighting"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent pointer-events-none" />
            <div className="absolute bottom-0 inset-x-0 p-6 sm:p-10 text-white z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="max-w-xl">
                <span className="text-[10px] sm:text-[11px] font-medium uppercase tracking-[0.2em] text-white/70 block mb-1.5">
                  Precision Silicon Physics
                </span>
                <h2 className="text-[22px] sm:text-[28px] font-medium tracking-tight text-white leading-snug">
                  N-Type TOPCon Dual-Glass Bifacial Architecture
                </h2>
                <p className="text-[13px] sm:text-[14px] text-white/80 leading-relaxed mt-1 text-balance">
                  Quantum tunneling oxide passivation layer completely eliminates Light-Induced
                  Degradation (LID) while capturing up to 25% rear albedo reflection from terrace
                  surfaces.
                </p>
              </div>
              <div className="shrink-0">
                <Button
                  onClick={() => openConsultationDrawer()}
                  variant="primary"
                  tone="dark"
                  className="w-full sm:w-auto"
                >
                  Request Technical Spec Sheet
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* 3. ARCHITECTURAL COMPARISON: CONVENTIONAL VS WAVENOX */}
        <section className="max-w-5xl mx-auto px-6 mt-20 sm:mt-28">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <span className="text-[11px] sm:text-[12px] font-medium tracking-[0.2em] uppercase text-[#5C5E62] block mb-2">
              Architectural Distinction
            </span>
            <h2 className="text-[28px] sm:text-[36px] font-medium tracking-tight text-[#171A20]">
              The Standard Rooftop vs. The WAVENOX Standard
            </h2>
            <p className="text-[14px] sm:text-[16px] text-[#5C5E62] mt-2">
              Why traditional solar installations deface luxury residences, and how monolithic
              engineering protects your home’s architectural integrity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {/* Standard Conventional Solar */}
            <div className="p-6 sm:p-8 rounded-[8px] border border-[#E3E4E6] bg-[#FFFFFF] space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-[#E3E4E6]">
                <div className="text-[17px] font-medium text-[#5C5E62]">
                  Conventional Solar Installation
                </div>
                <span className="px-2.5 py-1 rounded-[4px] bg-[#5C5E62]/10 text-[11px] font-medium text-[#5C5E62] uppercase tracking-wider">
                  Generic
                </span>
              </div>
              <ul className="space-y-3.5 text-[14px] text-[#5C5E62]">
                <li className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <span>
                    <strong>Crude Blue Polycrystalline:</strong> High reflectance, silver frames,
                    and visible matrix busbars that clash with modern exterior finishes.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <span>
                    <strong>Slab Puncturing &amp; Seepage:</strong> Direct mechanical roof bolting
                    cracks waterproofing coats, resulting in ceiling seepage during monsoons.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <span>
                    <strong>Lost Usable Terrace Area:</strong> Knee-high 3-foot diagonal scaffolding
                    ruins the terrace, making walking, clothes drying, or entertaining impossible.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <span>
                    <strong>Exposed External PVC Conduits:</strong> Bright orange and grey utility
                    conduits run openly across exterior walls and facades.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <span>
                    <strong>Severe Summer Heat Derating:</strong> Conventional panels lose 0.38% to
                    0.42% output per degree rise above 25°C, cratering output during heatwaves.
                  </span>
                </li>
              </ul>
            </div>

            {/* WAVENOX Monolithic Standard */}
            <div className="p-6 sm:p-8 rounded-[8px] border-2 border-[#171A20] bg-[#171A20] text-white shadow-xl space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-white/15">
                <div className="text-[17px] font-medium text-white">WAVENOX Monolithic System</div>
                <span className="px-2.5 py-1 rounded-[4px] bg-white/20 text-[11px] font-medium text-white uppercase tracking-wider">
                  Apex Luxury
                </span>
              </div>
              <ul className="space-y-3.5 text-[14px] text-white/85">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#F57C00] shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-white">Pure Obsidian Crystalline Surface:</strong> Deep
                    matte black anti-reflective glass, black backsheet, and anodized black frame.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#F57C00] shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-white">Zero Slab Damage Guarantee:</strong> Chemical
                    anchors or non-penetrating ballasted blocks with 5-year waterproofing warranty.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#F57C00] shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-white">7 to 9 Ft Clear Headroom:</strong> Elevated
                    pergola transforms your terrace into a shaded outdoor living space.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#F57C00] shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-white">Concealed Sub-Terrace Conduits:</strong> All DC
                    string cables run inside structural columns and internal service ducts.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#F57C00] shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-white">N-Type TOPCon Heat Resilience:</strong> Industry
                    leading -0.30%/°C temp coefficient produces up to 8% more power at 44°C.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* 4. FOUR CORE ENGINEERING PILLARS (INTERACTIVE TABS) */}
        <section className="max-w-5xl mx-auto px-6 mt-20 sm:mt-28">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-[11px] sm:text-[12px] font-medium tracking-[0.2em] uppercase text-[#5C5E62] block mb-2">
              Deep Engineering Breakdown
            </span>
            <h2 className="text-[28px] sm:text-[36px] font-medium tracking-tight text-[#171A20]">
              Engineered from Molecular Silicon to Structural Steel
            </h2>
          </div>

          {/* Tab Selector Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
            {[
              { id: "cell", label: "N-Type TOPCon Physics", icon: Sun },
              { id: "pergola", label: "Terrace Pergola Structure", icon: Wind },
              { id: "storage", label: "Omnigrid Microgrid Islanding", icon: Zap },
              { id: "iot", label: "Realtime Telemetry & IoT", icon: Activity },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`min-h-[44px] px-5 py-2 rounded-[4px] text-[13px] sm:text-[14px] font-medium flex items-center gap-2.5 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#171A20] ${
                    isActive
                      ? "bg-[#171A20] text-white shadow-md"
                      : "bg-[#F4F4F4] text-[#5C5E62] hover:bg-[#EAEAEA] hover:text-[#171A20]"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB 1: CELL PHYSICS */}
          {activeTab === "cell" && (
            <div className="p-8 sm:p-10 rounded-[10px] border border-[#E3E4E6] bg-[#F4F4F4]/40 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#F57C00] block">
                  Quantum Tunneling Passivation
                </span>
                <h3 className="text-[24px] sm:text-[28px] font-medium text-[#171A20] leading-snug">
                  Why N-Type TOPCon Outperforms Every Legacy Panel
                </h3>
                <p className="text-[14px] sm:text-[15px] text-[#5C5E62] leading-relaxed">
                  In traditional P-type silicon, boron-oxygen complexes cause Light-Induced
                  Degradation (LID), bleeding up to 3% output in the first month. WAVENOX N-type
                  cells use phosphorus-doped wafers coated with an ultra-thin 1.5 nm silicon oxide
                  tunneling layer and microcrystalline silicon passivating contact.
                </p>
                <div className="pt-2 grid grid-cols-2 gap-4">
                  <div className="p-3 bg-white rounded-[4px] border border-[#E3E4E6]">
                    <div className="text-[18px] font-semibold text-[#171A20] tabular-nums">
                      22.8%
                    </div>
                    <div className="text-[12px] text-[#5C5E62]">Module Conversion Efficiency</div>
                  </div>
                  <div className="p-3 bg-white rounded-[4px] border border-[#E3E4E6]">
                    <div className="text-[18px] font-semibold text-[#171A20] tabular-nums">
                      +10% to 25%
                    </div>
                    <div className="text-[12px] text-[#5C5E62]">Bifacial Rear Albedo Gain</div>
                  </div>
                </div>
              </div>
              <div className="relative aspect-[4/3] rounded-[8px] overflow-hidden border border-[#E3E4E6]">
                <Media
                  media={media["home-design"]}
                  fill={true}
                  className="w-full h-full object-cover"
                  alt="Concealed mounting structure detail"
                />
              </div>
            </div>
          )}

          {/* TAB 2: PERGOLA STRUCTURE */}
          {activeTab === "pergola" && (
            <div className="p-8 sm:p-10 rounded-[10px] border border-[#E3E4E6] bg-[#F4F4F4]/40 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#F57C00] block">
                  Structural Metallurgy &amp; Cyclone Physics
                </span>
                <h3 className="text-[24px] sm:text-[28px] font-medium text-[#171A20] leading-snug">
                  170 km/h Cyclone Wind Certified Pergola
                </h3>
                <p className="text-[14px] sm:text-[15px] text-[#5C5E62] leading-relaxed">
                  Engineered in compliance with Indian Standard IS 875 (Part 3), our elevated
                  structures are fabricated from structural 6063-T6 marine-grade anodized aluminum
                  beams and heavy-gauge hot-dip galvanized steel columns (80+ micron zinc
                  immersion).
                </p>
                <div className="space-y-2 pt-2 text-[14px] text-[#171A20]">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#F57C00]" />
                    <span>7 to 9 feet clear headroom beneath all cross-members</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#F57C00]" />
                    <span>Multi-layer elastomeric chemical anchor seals or pre-cast ballast</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#F57C00]" />
                    <span>Grade 304 and 316 marine stainless steel fastening hardware</span>
                  </div>
                </div>
              </div>
              <div className="relative aspect-[4/3] rounded-[8px] overflow-hidden border border-[#E3E4E6]">
                <Media
                  media={media["home-final"]}
                  fill={true}
                  className="w-full h-full object-cover"
                  alt="Elevated solar pergola on terrace"
                />
              </div>
            </div>
          )}

          {/* TAB 3: STORAGE & ISLANDING */}
          {activeTab === "storage" && (
            <div className="p-8 sm:p-10 rounded-[10px] border border-[#E3E4E6] bg-[#F4F4F4]/40 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#F57C00] block">
                  Solid-State Microgrid Architecture
                </span>
                <h3 className="text-[24px] sm:text-[28px] font-medium text-[#171A20] leading-snug">
                  Sub-20ms Transfer: Zero Flickers, Zero Diesel Noise
                </h3>
                <p className="text-[14px] sm:text-[15px] text-[#5C5E62] leading-relaxed">
                  Omnigrid replaces dirty, loud diesel generators and inefficient lead-acid inverter
                  batteries. Its solid-state islanding switchgear constantly samples the grid at
                  kilohertz frequencies. The instant grid voltage drops below tolerance, it
                  decouples the home in under 20 milliseconds, providing unbroken power to your
                  entire electrical panel.
                </p>
                <div className="pt-2 grid grid-cols-2 gap-4">
                  <div className="p-3 bg-white rounded-[4px] border border-[#E3E4E6]">
                    <div className="text-[18px] font-semibold text-[#171A20] tabular-nums">
                      10.0 kW
                    </div>
                    <div className="text-[12px] text-[#5C5E62]">Peak Surge Starting Power</div>
                  </div>
                  <div className="p-3 bg-white rounded-[4px] border border-[#E3E4E6]">
                    <div className="text-[18px] font-semibold text-[#171A20] tabular-nums">
                      6,000 Cycles
                    </div>
                    <div className="text-[12px] text-[#5C5E62]">LiFePO4 Lifecycle Guarantee</div>
                  </div>
                </div>
              </div>
              <div className="relative aspect-[4/3] rounded-[8px] overflow-hidden border border-[#E3E4E6]">
                <Media
                  media={media["omnigrid-switchover"]}
                  fill={true}
                  className="w-full h-full object-cover"
                  alt="Omnigrid solid state switchgear telemetry"
                />
              </div>
            </div>
          )}

          {/* TAB 4: IOT & TELEMETRY */}
          {activeTab === "iot" && (
            <div className="p-8 sm:p-10 rounded-[10px] border border-[#E3E4E6] bg-[#F4F4F4]/40 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#F57C00] block">
                  Encrypted Sub-Second Telemetry
                </span>
                <h3 className="text-[24px] sm:text-[28px] font-medium text-[#171A20] leading-snug">
                  Realtime Telemetry &amp; Autonomous Fleet Dispatch
                </h3>
                <p className="text-[14px] sm:text-[15px] text-[#5C5E62] leading-relaxed">
                  Every inverter and battery unit streams encrypted telemetry over Wi-Fi and 4G
                  cellular IoT back to our Hyderabad Command Center. Proprietary algorithms detect
                  panel mismatch, shading anomalies, and grid voltage fluctuations in real time.
                  If a fault occurs, our team dispatches a service engineer before you notice a drop
                  in yield.
                </p>
                <div className="space-y-2 pt-2 text-[14px] text-[#171A20]">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#F57C00]" />
                    <span>Realtime live energy flow (Solar → Battery → Home → Grid)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#F57C00]" />
                    <span>DISCOM net-metering export ledger and Rupee savings tracking</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#F57C00]" />
                    <span>Guaranteed 48-Hour Technical Dispatch SLA across service hubs</span>
                  </div>
                </div>
              </div>
              <div className="relative aspect-[4/3] rounded-[8px] overflow-hidden border border-[#E3E4E6]">
                <Media
                  media={media["studio-estate"]}
                  fill={true}
                  className="w-full h-full object-cover"
                  alt="3D CAD estate layout engineering model"
                />
              </div>
            </div>
          )}
        </section>

        {/* 5. VERIFIED TECHNICAL SPECIFICATION DATASHEET SUMMARY */}
        <section className="max-w-5xl mx-auto px-6 mt-20 sm:mt-28">
          <div className="border border-[#E3E4E6] rounded-[8px] bg-[#FFFFFF] overflow-hidden shadow-sm">
            <div className="p-6 sm:p-8 border-b border-[#E3E4E6] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-[#5C5E62] block mb-1">
                  Master Technical Datasheet
                </span>
                <h3 className="text-[20px] sm:text-[24px] font-medium text-[#171A20]">
                  Verified Component Specifications
                </h3>
              </div>
              <div className="flex items-center gap-2 text-[12px] font-medium text-[#5C5E62] bg-[#F4F4F4] px-3 py-1.5 rounded-[4px]">
                <CheckCircle2 className="w-4 h-4 text-[#F57C00]" />
                <span>BIS, IEC 61215, ALMM Certified</span>
              </div>
            </div>

            <div className="divide-y divide-[#E3E4E6] text-[13px] sm:text-[14px]">
              <div className="p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-4 gap-2 sm:gap-4 items-baseline bg-[#F4F4F4]/30">
                <span className="font-medium text-[#171A20]">Solar Module</span>
                <span className="sm:col-span-2 text-[#5C5E62]">
                  {PRODUCTS_CONFIG.module.cellType} ({PRODUCTS_CONFIG.module.ratedPowerW}W rated)
                </span>
                <span className="font-semibold text-[#171A20] sm:text-right">
                  {PRODUCTS_CONFIG.module.efficiencyPct}% Efficiency
                </span>
              </div>

              <div className="p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-4 gap-2 sm:gap-4 items-baseline">
                <span className="font-medium text-[#171A20]">Front Glass</span>
                <span className="sm:col-span-2 text-[#5C5E62]">
                  {PRODUCTS_CONFIG.module.frontGlass}
                </span>
                <span className="text-[#5C5E62] sm:text-right">Class A Fire Rated</span>
              </div>

              <div className="p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-4 gap-2 sm:gap-4 items-baseline bg-[#F4F4F4]/30">
                <span className="font-medium text-[#171A20]">Hybrid Inverter</span>
                <span className="sm:col-span-2 text-[#5C5E62]">
                  {PRODUCTS_CONFIG.inverter.type}
                </span>
                <span className="font-semibold text-[#171A20] sm:text-right">
                  {PRODUCTS_CONFIG.inverter.maxEfficiencyPct}% Max Yield
                </span>
              </div>

              <div className="p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-4 gap-2 sm:gap-4 items-baseline">
                <span className="font-medium text-[#171A20]">Battery Storage</span>
                <span className="sm:col-span-2 text-[#5C5E62]">
                  {PRODUCTS_CONFIG.battery.chemistry} (Expandable Modular Architecture)
                </span>
                <span className="font-semibold text-[#171A20] sm:text-right">
                  {PRODUCTS_CONFIG.battery.usableCapacityKwh} kWh Usable
                </span>
              </div>

              <div className="p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-4 gap-2 sm:gap-4 items-baseline bg-[#F4F4F4]/30">
                <span className="font-medium text-[#171A20]">Structural Mount</span>
                <span className="sm:col-span-2 text-[#5C5E62]">
                  Elevated 6063-T6 Anodized Aluminum Pergola / Non-Penetrating Ballast
                </span>
                <span className="font-semibold text-[#171A20] sm:text-right">
                  170 km/h Certified
                </span>
              </div>

              <div className="p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-4 gap-2 sm:gap-4 items-baseline">
                <span className="font-medium text-[#171A20]">Asset Warranty</span>
                <span className="sm:col-span-2 text-[#5C5E62]">
                  25-Year Linear Power Guarantee (≥ 84.8% at Year 25)
                </span>
                <span className="font-semibold text-[#171A20] sm:text-right">
                  10-Yr Battery / 10-Yr Inverter
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* 6. CONVERSION ADVISORY DOCK */}
        <section className="max-w-4xl mx-auto px-6 mt-20 sm:mt-28">
          <div className="p-8 sm:p-12 rounded-[12px] bg-[#171A20] text-white text-center space-y-5 shadow-2xl">
            <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-[#F57C00] block">
              Architectural Feasibility
            </span>
            <h2 className="text-[26px] sm:text-[34px] md:text-[40px] font-medium tracking-tight text-white text-balance leading-snug">
              Engineer Solar for Your Residence or Commercial Facility
            </h2>
            <p className="text-[14px] sm:text-[16px] text-white/80 max-w-xl mx-auto leading-relaxed text-balance">
              Speak with a WAVENOX solar structural engineer to review your roof orientation, shadow
              analysis, and DISCOM net-metering sanctions.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-3">
              <Button to="/deploy" variant="primary" tone="dark" className="w-full sm:w-auto">
                Design Your System Online
              </Button>
              <Button
                onClick={() => openConsultationDrawer()}
                variant="secondary"
                tone="dark"
                className="w-full sm:w-auto"
              >
                Schedule Virtual Consultation
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
