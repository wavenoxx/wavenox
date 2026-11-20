import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import {
  Panel,
  EditorialFeature,
  EditorialCarousel,
  SpecsGrid,
  StatRow,
  Button,
  TextLink,
  SpecsDrawer,
  Faq,
  Media,
  type EditorialSlide,
  type FaqItem,
  type SpecCategory,
} from "@/components/system";
import { media } from "@/config/media";
import { BRAND_CONFIG } from "@/config/brand";
import { DISCOMS, estimate } from "@/config/solar";
import { openConsultationDrawer } from "@/lib/consultation";

const SOLUTION_FAMILIES = [
  {
    id: "solar-panels",
    capacity: "3 kW – 25 kW",
    title: "Solar Panels for Homes",
    description:
      "Low-profile rooftop arrays and elevated terrace pergolas engineered for slab waterproofing, concealed conduit routing, and PM Surya Ghar subsidies.",
    mediaKey: "res-hero" as const,
    ctaLabel: "Explore Solar Panels",
    to: "/residential",
  },
  {
    id: "solar-storage",
    capacity: "14.3 – 42.9 kWh",
    title: "Solar + Battery Storage",
    description:
      "Pair daytime solar generation with modular LiFePO4 storage and compatible hybrid inverters to power critical circuits through grid outages.",
    mediaKey: "omnigrid-hero" as const,
    ctaLabel: "Explore Battery Storage",
    to: "/omnigrid",
  },
  {
    id: "commercial-solar",
    capacity: "25 kW – MW+",
    title: "Commercial Solar",
    description:
      "High-yield arrays for industrial roofs and enterprise campuses designed to offset peak daytime tariffs with Section 33 depreciation modeling.",
    mediaKey: "commercial-hero" as const,
    ctaLabel: "Explore Commercial",
    to: "/enterprise",
  },
] as const;

const DESIGN_CAROUSEL_SLIDES: EditorialSlide[] = [
  {
    id: "flush-roof-integration",
    media: media["res-hero"],
    objectPosition: "center 30%",
    title: "Architectural Roof Integration",
    description:
      "All-black N-Type monocrystalline modules sit flush along flat and pitched Indian rooflines with concealed conduit raceways.",
  },
  {
    id: "walkable-pergola",
    media: media["res-terrace"],
    objectPosition: "center",
    title: "Walkable Elevated Pergolas",
    description:
      "Where terrace space matters, structural steel pergolas preserve 7 to 9 feet of shaded headroom above your outdoor lounge.",
  },
  {
    id: "thermal-cell-physics",
    media: media["home-heat"],
    objectPosition: "center",
    title: "Built for 45°C Indian Summers",
    description:
      "A −0.30%/°C temperature coefficient retains higher afternoon generation when peak summer air-conditioning demand spikes.",
  },
  {
    id: "monsoon-wind-resilience",
    media: media["res-weather"],
    objectPosition: "center",
    title: "Monsoon & Cyclone Wind Basis",
    description:
      "Anodized aluminium rails, SS304 fasteners, and waterproofed anchor details built around IS 875 (Part 3) 44 m/s (158 km/h) loads.",
  },
];

const HOME_SYSTEM_SPECS: SpecCategory[] = [
  {
    title: "Modules & Output",
    items: [
      { label: "Cell Architecture", value: "N-Type TOPCon Monocrystalline Bifacial" },
      { label: "Reference Module Rating", value: "580W DCR per panel" },
      { label: "Module Efficiency (STC)", value: "22.45% – 22.8%" },
      { label: "Temperature Coefficient", value: "-0.30% / °C (Pmax)" },
    ],
  },
  {
    title: "Structural & Environmental",
    items: [
      { label: "Design Wind Speed", value: "IS 875 (Part 3) 44 m/s (158 km/h)" },
      { label: "Mounting Material", value: "Anodized 6063-T6 Aluminium & SS304" },
      { label: "Roof Protection", value: "Ballasted blocks or sealed chemical anchors" },
      { label: "Ingress Rating", value: "IP68 junction box & weatherproof connectors" },
    ],
  },
  {
    title: "Storage & Inverter",
    items: [
      { label: "Modular Storage", value: "14.3 kWh to 42.9 kWh LiFePO4" },
      { label: "Backup Transfer", value: "< 20 milliseconds (UPS grade)" },
      { label: "Continuous / Peak Power", value: "6.0 kW continuous / 10.0 kW surge" },
      { label: "Monitoring Platform", value: "OEM Inverter Cloud App (Wi-Fi / 4G)" },
    ],
  },
  {
    title: "Warranties & Compliance",
    items: [
      { label: "Linear Performance", value: "25 Years OEM (≥ 89.4% at Year 25)" },
      { label: "Product Warranty", value: "12 Years OEM module coverage" },
      { label: "Battery & Inverter", value: "10 Years OEM warranty scope" },
      { label: "Subsidy & Grid", value: "MNRE ALMM / BIS / DISCOM Net-Metering" },
    ],
  },
];

const FAQ_ITEMS: FaqItem[] = [
  {
    id: "subsidy",
    question: "How does the PM Surya Ghar subsidy work?",
    answer:
      "Eligible residential households with systems of 3 kW or larger may qualify for up to ₹78,000 Direct Benefit Transfer under MNRE PM Surya Ghar guidelines after DISCOM net-meter commissioning. WAVENOX prepares national portal documentation and coordinates utility inspections with the authorized installation partner.",
  },
  {
    id: "outage",
    question: "Will my solar panels work during a power outage?",
    answer:
      "Standard grid-tied solar systems shut down during blackouts for utility anti-islanding safety. When paired with a compatible hybrid inverter and modular LiFePO4 battery storage wired to critical backup circuits, supported appliances can continue operating during grid outages depending on battery state of charge.",
  },
  {
    id: "ac-run",
    question: "Can battery storage run air conditioners during outages?",
    answer:
      "A compatible hybrid battery configuration rated at 6.0 kW continuous output (10.0 kW surge target) can support 1.5-ton inverter air conditioners alongside essential lighting and Wi-Fi loads; actual backup duration depends on installed kWh capacity, state of charge, and appliance duty cycles.",
  },
  {
    id: "terrace",
    question: "Can I still use my terrace after installing solar?",
    answer:
      "Yes. Elevated pergola structures can be engineered with 7 to 9 feet of clear headroom where structurally feasible, keeping walkable shaded terrace space open beneath overhead bifacial modules.",
  },
  {
    id: "waterproofing",
    question: "Will installing solar on my terrace cause roof leakage or slab damage?",
    answer:
      "Mounting assemblies use non-penetrating precast ballasted blocks or sealed chemical-anchor pedestals specified after structural and waterproofing inspection to protect the roof slab.",
  },
  {
    id: "timeline",
    question: "How long does installation and net metering take?",
    answer:
      "Physical rooftop mounting typically takes 2 to 3 days once final engineering designs are approved. Total commissioning and bi-directional net-metering activation depend on roof readiness, DISCOM feeder capacity, and utility inspection schedules (commonly 2 to 4 weeks).",
  },
];

const STEPS = [
  {
    num: "01",
    title: "Consultation",
    desc: "Share your property type, city, and monthly electricity bill for initial sizing and DISCOM tariff review.",
  },
  {
    num: "02",
    title: "Site Assessment",
    desc: "Terrace measurement, 3D sun-path shading analysis, and structural waterproofing inspection.",
  },
  {
    num: "03",
    title: "Design & Quotation",
    desc: "Itemized system engineering proposal covering module placement, conduit routing, and subsidy eligibility.",
  },
  {
    num: "04",
    title: "Installation Coordination",
    desc: "Authorized partner execution with concealed raceways, earthing, and structural anchorage.",
  },
  {
    num: "05",
    title: "Utility Commissioning",
    desc: "DISCOM net-metering filing, bi-directional meter installation, and grid synchronization.",
  },
  {
    num: "06",
    title: "After-Sales Support",
    desc: "Inverter cloud portal onboarding, subsidy tracking assistance, and OEM warranty coordination.",
  },
] as const;

const TRUST_CARDS = [
  {
    title: "Three-Tier Warranty Clarity",
    description:
      "Clear separation between 25-year OEM module performance warranties, 10-year OEM inverter and battery coverage, and authorized partner workmanship terms in your signed contract.",
    linkLabel: "Review Warranty Scope",
    to: "/warranty",
  },
  {
    title: "Transparent Tariff & Subsidy Basis",
    description:
      "Residential estimates use published TGERC (Telangana) and APERC (Andhra Pradesh) telescopic tariff slabs, labeled benchmarks for other states, and MNRE subsidy rules.",
    linkLabel: "Inspect Calculation Sources",
    to: "/legal/disclosures",
  },
  {
    title: "Coordinated Delivery & Privacy",
    description:
      "Surveys and physical installations are carried out by authorized WAVENOX partners under unified design standards with explicit DPDP Act 2023 consent controls.",
    linkLabel: "Read Delivery Model",
    to: "/our-story",
  },
] as const;

export const Route = createFileRoute("/")({
  staticData: {
    headerTone: "overlay" as const,
  },
  head: () => ({
    meta: [
      { title: `${BRAND_CONFIG.name} — Rooftop Solar for Indian Homes` },
      {
        name: "description",
        content:
          "WAVENOX deploys low-profile residential solar across India. PM Surya Ghar subsidies up to ₹78,000, 25-year warranty, and 24/7 outage protection.",
      },
      { property: "og:title", content: `${BRAND_CONFIG.name} — Rooftop Solar for Indian Homes` },
      {
        property: "og:description",
        content:
          "Low-profile architectural solar for Indian homes. Subsidies up to ₹78,000, 25-year linear warranty, and 24/7 outage protection.",
      },
      { property: "og:image", content: `${BRAND_CONFIG.domain}/media/home-hero-1600w.jpg` },
      { property: "og:url", content: `${BRAND_CONFIG.domain}/` },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "canonical", href: `${BRAND_CONFIG.domain}/` },
      {
        rel: "preload",
        as: "image",
        type: "image/webp",
        imageSrcSet: media["home-hero"].mobileWebp,
        imageSizes: "(max-width: 420px) 360px, 100vw",
        media: "(max-width: 768px)",
        fetchPriority: "high",
      },
      {
        rel: "preload",
        as: "image",
        type: "image/webp",
        imageSrcSet: media["home-hero"].webp,
        imageSizes: "100vw",
        media: "(min-width: 769px)",
        fetchPriority: "high",
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: BRAND_CONFIG.name,
          url: BRAND_CONFIG.domain,
          logo: `${BRAND_CONFIG.domain}/icon-512.png`,
          description: BRAND_CONFIG.description,
          contactPoint: {
            "@type": "ContactPoint",
            telephone: BRAND_CONFIG.contact.phone.dial,
            contactType: "customer service",
            areaServed: "IN",
            availableLanguage: ["English", "Telugu", "Hindi"],
          },
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQ_ITEMS.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: item.answer,
            },
          })),
        }),
      },
    ],
  }),
  component: IndexPage,
});

function formatInr(val: number): string {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(val);
}

function IndexPage() {
  const [specsOpen, setSpecsOpen] = React.useState(false);
  const [selectedDiscom, setSelectedDiscom] = React.useState(DISCOMS[0]?.code || "TGSPDCL");
  const [monthlyBill, setMonthlyBill] = React.useState(8000);

  const solarEstimate = React.useMemo(() => {
    return estimate({
      monthlyBillInr: monthlyBill,
      discomCode: selectedDiscom,
      segment: "residential",
    });
  }, [monthlyBill, selectedDiscom]);

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#171A20] selection:bg-[#171A20] selection:text-[#FFFFFF]">
      <Header />

      <main>
        {/* SEC 0: ARCHITECTURAL SOLAR HERO (LOCKED DESKTOP 16:9 / MOBILE 4:5) */}
        <Panel
          id="solar-panels"
          as="h1"
          media={media["home-hero"]}
          priority={true}
          mobileNaturalFrame={true}
          tone="dark"
          className="scroll-mt-14"
          title="Home Solar"
          lead="Lower Your Power Bills. Run Your Home on Solar."
          actions={
            <>
              <Button
                to="/deploy"
                variant="primary"
                tone="dark"
                className="w-full sm:w-auto sm:min-w-[204px]"
              >
                Design Your System
              </Button>
              <Button
                onClick={() => openConsultationDrawer()}
                variant="secondary"
                tone="dark"
                className="w-full sm:w-auto sm:min-w-[204px]"
              >
                Book a Consultation
              </Button>
            </>
          }
        />

        {/* SEC 1: THREE SOLAR PATHS (PURE #FFFFFF GALLERY — 4:3 CARDS IDENTICAL ON DESKTOP & MOBILE) */}
        <section
          id="solutions"
          data-theme="light"
          className="relative w-full bg-[#FFFFFF] text-[#171A20] pt-16 sm:pt-24 lg:pt-32 pb-8 sm:pb-12 lg:pb-16 scroll-mt-14"
        >
          <div className="w-full max-w-[1116px] mx-auto px-6 md:px-8 xl:px-0 space-y-10 sm:space-y-14">
            <div className="max-w-[780px] space-y-4">
              <h2 className="text-[30px] sm:text-[40px] lg:text-[48px] font-medium tracking-[-0.028em] leading-[1.12] text-[#171A20] text-balance">
                Three Solar Paths. One Coordinated Experience.
              </h2>
              <p className="text-[16px] sm:text-[18px] lg:text-[20px] font-normal leading-[1.52] text-[#5C5E62] text-pretty">
                Choose the system architecture tailored to your roof geometry, daytime demand, and
                outage backup requirements.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {SOLUTION_FAMILIES.map((family) => (
                <article
                  key={family.id}
                  className="rounded-[8px] bg-[#F4F4F4] overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    <Link
                      to={family.to}
                      className="block relative aspect-[4/3] w-full overflow-hidden bg-[#EAEAEA] group focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#171A20]"
                    >
                      <Media
                        media={media[family.mediaKey]}
                        preserveDesktopAspect={true}
                        objectPosition="center 35%"
                        sizes="(max-width: 640px) 360px, (max-width: 1024px) 50vw, 360px"
                        className="w-full h-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]"
                      />
                    </Link>

                    <div className="p-6 sm:p-7 space-y-3">
                      <div className="text-[12px] font-medium uppercase tracking-[0.06em] text-[#5C5E62] tabular-nums">
                        {family.capacity}
                      </div>
                      <h3 className="text-[22px] sm:text-[24px] font-medium tracking-[-0.02em] leading-[1.2] text-[#171A20]">
                        {family.title}
                      </h3>
                      <p className="text-[15px] sm:text-[16px] text-[#5C5E62] leading-[1.55] text-pretty">
                        {family.description}
                      </p>
                    </div>
                  </div>

                  <div className="px-6 sm:px-7 pb-6 sm:pb-7">
                    <Button to={family.to} variant="primary" tone="light" className="w-full">
                      {family.ctaLabel}
                    </Button>
                  </div>
                </article>
              ))}
            </div>

            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <span className="text-[14px] text-[#5C5E62]">
                Every system is engineered around local DISCOM net-metering and structural wind
                codes.
              </span>
              <TextLink to="/deploy" arrow>
                Unsure which system fits your roof? Compare options in the Design Studio
              </TextLink>
            </div>
          </div>
        </section>

        {/* SEC 2: ROOFTOP ARCHITECTURE + 4-SLIDE FREEFLOW CAROUSEL */}
        <EditorialFeature
          id="design"
          secondaryAnchorId="heat-performance"
          media={media["home-design"]}
          className="deferred-section"
          title="Engineered for Indian Rooftops and 45°C Summers"
          lead="Low-profile terrace mounts and concealed conduit raceways paired with −0.30%/°C thermal engineering preserve clean architecture while maximizing midday solar output."
          actions={
            <>
              <Button
                onClick={() => setSpecsOpen(true)}
                variant="primary"
                tone="light"
                className="w-full sm:w-auto sm:min-w-[200px]"
              >
                View Technical Specs
              </Button>
              <Button
                to="/residential"
                variant="secondary"
                tone="light"
                className="w-full sm:w-auto sm:min-w-[200px]"
              >
                Explore Solar Panels
              </Button>
            </>
          }
          footnote="*Reference 580W N-Type TOPCon (22.45%–22.8%) and IS 875 (Part 3) 44 m/s wind basis; final specs follow site survey and OEM datasheet."
        >
          <EditorialCarousel
            slides={DESIGN_CAROUSEL_SLIDES}
            label="Rooftop engineering highlights"
          />
        </EditorialFeature>

        {/* SEC 3: OUTAGE RESILIENCY (PURE #FFFFFF EDITORIAL — 16:9 DESKTOP / 4:5 MOBILE) */}
        <EditorialFeature
          id="outage-protection"
          media={media["home-outage"]}
          className="deferred-section"
          title="Grid Goes Down, Lights Stay On"
          lead="Standard grid-tied solar shuts down during power cuts for utility anti-islanding safety. Pairing your array with modular LiFePO4 storage keeps essential home circuits running through blackouts."
          actions={
            <>
              <Button
                to="/omnigrid"
                variant="primary"
                tone="light"
                className="w-full sm:w-auto sm:min-w-[204px]"
              >
                Explore Battery Storage
              </Button>
              <Button
                to="/deploy"
                variant="secondary"
                tone="light"
                className="w-full sm:w-auto sm:min-w-[204px]"
              >
                Configure Solar + Storage
              </Button>
            </>
          }
          cards={[
            {
              metric: "< 20 ms*",
              title: "Automatic Transfer",
              description:
                "Hybrid islanding gateway disconnects cleanly from the utility feeder and transitions essential circuits to stored energy.",
            },
            {
              metric: "14.3 kWh",
              title: "Modular LFP Reserve",
              description:
                "Stackable Lithium Iron Phosphate capacity scales from 14.3 kWh to 42.9 kWh for overnight cooling and evening loads.",
            },
            {
              metric: "6.0 kW*",
              title: "Continuous Output",
              description:
                "Sustained 6.0 kW output (10.0 kW surge rating) runs inverter ACs, refrigeration, Wi-Fi, and lighting without diesel noise.",
            },
          ]}
          footnote="*Transfer time, backup output, and runtime depend on your installed hybrid inverter, battery state of charge, and active home loads."
        />

        {/* SEC 4: ENERGY VISIBILITY & OEM INVERTER APP */}
        <EditorialFeature
          id="monitoring"
          className="deferred-section"
          customMedia={
            <div className="w-full rounded-[8px] bg-[#F4F4F4] p-6 sm:p-10 lg:p-16 flex flex-col items-center">
              <div className="w-full max-w-[440px] rounded-[8px] bg-[#171A20] text-[#FFFFFF] p-6 sm:p-7 shadow-[0_24px_60px_rgba(23,26,32,0.16)] space-y-5">
                <div className="flex justify-between items-center gap-2 pb-4 border-b border-white/10 text-[12px] text-[#FFFFFF]/80">
                  <span className="font-medium tracking-[0.02em] text-[#FFFFFF] whitespace-nowrap">
                    OEM Inverter App
                  </span>
                  <span className="px-2.5 py-0.5 rounded-[4px] bg-white/10 text-[#FFFFFF] text-[12px] whitespace-nowrap">
                    Illustrative sample
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="p-4 rounded-[8px] bg-white/[0.06] flex justify-between items-center gap-3">
                    <div>
                      <div className="text-[12px] text-[#FFFFFF]/70">Solar Production</div>
                      <div className="text-[24px] font-medium text-[#FFFFFF] tabular-nums mt-0.5">
                        5.8 kW
                      </div>
                    </div>
                    <span className="text-[12px] text-[#FFFFFF]/75 whitespace-nowrap">
                      Midday Peak
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-[12px]">
                    <div className="p-4 rounded-[8px] bg-white/[0.06]">
                      <div className="text-[#FFFFFF]/70">Home Load</div>
                      <div className="text-[20px] font-medium text-[#FFFFFF] tabular-nums mt-0.5 whitespace-nowrap">
                        1.6 kW
                      </div>
                    </div>
                    <div className="p-4 rounded-[8px] bg-white/[0.06]">
                      <div className="text-[#FFFFFF]/70">Battery Reserve</div>
                      <div className="flex items-baseline gap-1.5 mt-0.5 whitespace-nowrap">
                        <span className="text-[20px] font-medium text-[#FFFFFF] tabular-nums">
                          98%
                        </span>
                        <span className="text-[12px] text-[#FFFFFF]/70 tabular-nums">+2.2 kW</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-[8px] bg-white/[0.06] flex justify-between items-center gap-2">
                    <div>
                      <div className="text-[12px] text-[#FFFFFF]/70">Grid Net Export</div>
                      <div className="text-[20px] font-medium text-[#FFFFFF] tabular-nums mt-0.5 whitespace-nowrap">
                        2.0 kW export
                      </div>
                    </div>
                    <span className="text-[12px] text-[#D0D1D2] font-medium whitespace-nowrap">
                      Net Metering
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-[12px] text-[#5C5E62] text-center max-w-[48ch] mt-5">
                Illustrative monitoring example. Screens and metrics depend on your installed OEM
                inverter hardware and cloud provider.
              </p>
            </div>
          }
          title="Generation, Home Load & Reserve in One View"
          lead="Compatible hybrid inverters stream rooftop output, household demand, battery reserve, and DISCOM net export directly to the manufacturer's mobile portal. WAVENOX assists with onboarding and only accesses diagnostics with your authorization."
          actions={
            <TextLink to="/omnigrid" hash="flow-simulation" arrow>
              Explore 24-hour energy flow modeling
            </TextLink>
          }
          cards={[
            {
              title: "Daytime Dispatch",
              description:
                "Solar supplies active home loads first, tops up LFP reserve, and exports surplus units through your bi-directional DISCOM meter.",
            },
            {
              title: "Outage Visibility",
              description:
                "Monitor battery state of charge, remaining backup hours, and active circuit wattage directly from your inverter app.",
            },
            {
              title: "Owner-Controlled Access",
              description:
                "Your inverter credentials belong to you; WAVENOX reviews remote logs only when you explicitly request diagnostic support.",
            },
          ]}
        />

        {/* SEC 5: TARIFF & SUBSIDY MODELING (PURE #FFFFFF CANVAS + #F4F4F4 ARCHITECTURAL STUDIO) */}
        <section
          id="savings"
          data-theme="light"
          className="deferred-section relative w-full bg-[#FFFFFF] text-[#171A20] pt-16 sm:pt-24 lg:pt-32 pb-8 sm:pb-12 lg:pb-16 scroll-mt-14"
        >
          <div className="w-full max-w-[1116px] mx-auto px-6 md:px-8 xl:px-0 space-y-10 sm:space-y-12">
            <div className="max-w-[780px] space-y-4">
              <h2 className="text-[30px] sm:text-[40px] lg:text-[48px] font-medium tracking-[-0.028em] leading-[1.12] text-[#171A20] text-balance">
                Estimate Your Solar System &amp; Savings
              </h2>
              <p className="text-[16px] sm:text-[18px] lg:text-[20px] font-normal leading-[1.52] text-[#5C5E62] text-pretty">
                Select your electricity board and monthly power bill to preview indicative system
                capacity, annual savings, and central subsidy eligibility.
              </p>
            </div>

            <div className="rounded-[8px] bg-[#F4F4F4] p-6 sm:p-10 lg:p-12 space-y-8 sm:space-y-10">
              {/* Controls */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                <div className="lg:col-span-6 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <label
                      htmlFor="discom-select"
                      className="text-[12px] font-medium uppercase tracking-[0.06em] text-[#5C5E62]"
                    >
                      1. Electricity Board (DISCOM)
                    </label>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[4px] bg-[#FFFFFF] text-[#171A20] text-[12px] font-medium">
                      <span
                        className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                          solarEstimate.status === "VERIFIED" ? "bg-[#171A20]" : "bg-[#8E9094]"
                        }`}
                        aria-hidden="true"
                      />
                      <span>
                        {solarEstimate.status === "VERIFIED"
                          ? `Verified ${solarEstimate.assumptions.discom.authority} Schedule`
                          : "Indicative Regional Benchmark"}
                      </span>
                    </span>
                  </div>
                  <select
                    id="discom-select"
                    value={selectedDiscom}
                    onChange={(e) => setSelectedDiscom(e.target.value)}
                    className="w-full min-h-[44px] px-3.5 py-2.5 bg-[#FFFFFF] border border-[#D0D2D6] rounded-[4px] text-[14px] font-medium text-[#171A20] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#171A20]"
                  >
                    {DISCOMS.map((d) => (
                      <option key={d.code} value={d.code}>
                        {d.code} ({d.state}) — {d.status === "VERIFIED" ? "Verified" : "Indicative"}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="lg:col-span-6 space-y-3">
                  <div className="flex justify-between items-baseline">
                    <span className="text-[12px] font-medium uppercase tracking-[0.06em] text-[#5C5E62]">
                      2. Monthly Electricity Bill
                    </span>
                    <span className="text-[28px] sm:text-[32px] font-medium tracking-[-0.025em] leading-none tabular-nums text-[#171A20]">
                      ₹{formatInr(monthlyBill)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={2000}
                    max={35000}
                    step={500}
                    value={monthlyBill}
                    onChange={(e) => setMonthlyBill(Number(e.target.value))}
                    className="range-slider"
                    aria-label="Monthly electricity bill"
                    aria-valuetext={`₹${formatInr(monthlyBill)} per month`}
                  />
                  <div className="flex justify-between text-[12px] text-[#5C5E62] tabular-nums">
                    <span>₹2,000 / mo</span>
                    <span>₹35,000+ / mo</span>
                  </div>
                </div>
              </div>

              {/* Three Primary Metric Outputs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
                <div className="rounded-[8px] bg-[#FFFFFF] p-6">
                  <div className="text-[12px] font-medium uppercase tracking-[0.06em] text-[#5C5E62]">
                    Recommended System
                  </div>
                  <div className="text-[32px] sm:text-[38px] font-medium tracking-[-0.025em] leading-[1.1] tabular-nums text-[#171A20] mt-2">
                    {solarEstimate.recommendedKw} kW
                  </div>
                  <div className="text-[13px] text-[#5C5E62] mt-1">
                    Recommended ({solarEstimate.recommendedPanels} Panels)
                  </div>
                </div>

                <div className="rounded-[8px] bg-[#FFFFFF] p-6">
                  <div className="text-[12px] font-medium uppercase tracking-[0.06em] text-[#5C5E62]">
                    Est. Annual Savings
                  </div>
                  <div className="text-[32px] sm:text-[38px] font-medium tracking-[-0.025em] leading-[1.1] tabular-nums text-[#171A20] mt-2">
                    ₹{formatInr(solarEstimate.annualSavingsInr)}
                  </div>
                  <div className="text-[13px] text-[#5C5E62] mt-1">
                    Based on {solarEstimate.assumptions.discom.code} tariff schedule
                  </div>
                </div>

                <div className="rounded-[8px] bg-[#FFFFFF] p-6">
                  <div className="text-[12px] font-medium uppercase tracking-[0.06em] text-[#5C5E62]">
                    Conditional Central Subsidy
                  </div>
                  <div className="text-[32px] sm:text-[38px] font-medium tracking-[-0.025em] leading-[1.1] tabular-nums text-[#171A20] mt-2">
                    ₹{formatInr(solarEstimate.subsidyInr)}
                  </div>
                  <div className="text-[13px] text-[#5C5E62] mt-1">
                    Potential DBT Subsidy (Conditional)*
                  </div>
                </div>
              </div>

              {/* Generation Summary + Actions */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-1 text-[13px] text-[#5C5E62] tabular-nums">
                  <div>
                    Indicative Generation:{" "}
                    <strong className="font-medium text-[#171A20]">
                      {formatInr(solarEstimate.annualGenKwh)} kWh/yr
                    </strong>{" "}
                    ({solarEstimate.assumptions.yieldKwhPerKwYear} kWh/kWp/yr)
                  </div>
                  <div>
                    Gross Turnkey:{" "}
                    <strong className="font-medium text-[#171A20]">
                      ₹{formatInr(solarEstimate.grossInr)}
                    </strong>{" "}
                    · Post-DBT*:{" "}
                    <strong className="font-medium text-[#171A20]">
                      ₹{formatInr(solarEstimate.netInr)}
                    </strong>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
                  <Button
                    to="/deploy"
                    search={{ bill: monthlyBill, discom: selectedDiscom }}
                    variant="primary"
                    tone="light"
                    className="w-full sm:w-auto sm:min-w-[200px]"
                  >
                    Open in Design Studio
                  </Button>
                  <Button
                    onClick={() => openConsultationDrawer()}
                    variant="secondary"
                    tone="light"
                    className="w-full sm:w-auto sm:min-w-[200px] bg-[#FFFFFF] hover:bg-[#EAEAEA]"
                  >
                    Book a Consultation
                  </Button>
                </div>
              </div>

              {/* Regulatory Disclosure */}
              <div className="pt-6 border-t border-[#E3E4E6] flex flex-col lg:flex-row lg:items-end justify-between gap-4">
                <p className="text-[12px] text-[#5C5E62] leading-[1.55] max-w-3xl text-pretty">
                  *
                  {solarEstimate.status === "VERIFIED"
                    ? `Modeled on verified ${solarEstimate.assumptions.discom.authority} (${solarEstimate.assumptions.discom.state}) telescopic tariff slabs and conditional MNRE PM Surya Ghar central subsidy guidelines.`
                    : `Modeled on an indicative regional benchmark (₹${solarEstimate.assumptions.tariffInrPerKwh.toFixed(2)}/kWh for ${solarEstimate.assumptions.discom.state}) and conditional MNRE PM Surya Ghar guidelines.`}{" "}
                  {solarEstimate.assumptions.discom.regulatoryNote} Unavoidable monthly fixed
                  charges (~₹{formatInr(solarEstimate.billBreakdown.unavoidableChargesInr)}/mo)
                  remain payable to your DISCOM. Actual system pricing, roof capacity, and export
                  settlements depend on a site survey and formal quotation.
                </p>
                <Link
                  to="/legal/disclosures"
                  hash="sources"
                  className="text-[12px] font-medium text-[#171A20] underline underline-offset-4 hover:text-[#5C5E62] transition-colors shrink-0"
                >
                  Inspect tariff sources &amp; calculation methodology (
                  {solarEstimate.assumptions.discom.authority} &amp; MNRE)
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* SEC 6: FROM CONSULTATION TO POWER-ON */}
        <section
          id="process"
          data-theme="light"
          className="deferred-section relative w-full bg-[#FFFFFF] text-[#171A20] pt-16 sm:pt-24 lg:pt-32 pb-16 sm:pb-24 lg:pb-32 scroll-mt-14"
        >
          <div className="w-full max-w-[1116px] mx-auto px-6 md:px-8 xl:px-0 space-y-10 sm:space-y-14">
            <div className="max-w-[780px] space-y-4">
              <h2 className="text-[30px] sm:text-[40px] lg:text-[48px] font-medium tracking-[-0.028em] leading-[1.12] text-[#171A20] text-balance">
                From Consultation to Power-On
              </h2>
              <p className="text-[16px] sm:text-[18px] lg:text-[20px] font-normal leading-[1.52] text-[#5C5E62] text-pretty">
                A coordinated six-stage workflow from initial tariff review and roof survey to
                DISCOM bi-directional meter commissioning.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {STEPS.map((step) => (
                <article key={step.num} className="rounded-[8px] bg-[#F4F4F4] p-6 sm:p-7 space-y-3">
                  <span className="text-[12px] font-medium tracking-[0.06em] uppercase tabular-nums text-[#5C5E62] block">
                    STEP {step.num}
                  </span>
                  <h3 className="text-[22px] sm:text-[24px] font-medium tracking-[-0.02em] text-[#171A20]">
                    {step.title}
                  </h3>
                  <p className="text-[15px] sm:text-[16px] text-[#5C5E62] leading-[1.55] text-pretty">
                    {step.desc}
                  </p>
                </article>
              ))}
            </div>

            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <p className="text-[14px] text-[#5C5E62] max-w-2xl">
                Commissioning timelines depend on terrace structural readiness, local DISCOM feeder
                capacity, and utility inspection schedules.
              </p>
              <TextLink to="/net-metering" arrow className="shrink-0">
                Review DISCOM net-metering workflow
              </TextLink>
            </div>
          </div>
        </section>

        {/* SEC 7: DARK #000000 SYSTEM SPECIFICATIONS GRID */}
        <SpecsGrid
          id="specs"
          className="deferred-section"
          title="Solar System Specs"
          subtitle="Reference engineering baseline for WAVENOX residential solar and hybrid battery deployments across India."
          categories={HOME_SYSTEM_SPECS}
          footnote="Specifications represent standard WAVENOX residential turnkey builds. Exact component datasheets, single-line diagrams, and structural wind calculations are delivered after on-site roof survey."
        />

        {/* SEC 8: GOVERNANCE, WARRANTIES & FREQUENTLY ASKED QUESTIONS */}
        <section
          id="faq"
          data-theme="light"
          className="relative w-full bg-[#FFFFFF] text-[#171A20] py-16 sm:py-24 lg:py-32 scroll-mt-14"
        >
          <div className="w-full max-w-[1116px] mx-auto px-6 md:px-8 xl:px-0 space-y-12 sm:space-y-16">
            <div className="max-w-[780px] space-y-4">
              <h2 className="text-[30px] sm:text-[40px] lg:text-[48px] font-medium tracking-[-0.028em] leading-[1.12] text-[#171A20] text-balance">
                Governance, Warranties &amp; Common Questions
              </h2>
              <p className="text-[16px] sm:text-[18px] lg:text-[20px] font-normal leading-[1.52] text-[#5C5E62] text-pretty">
                Every specification, tariff basis, and warranty boundary is documented openly before
                you commit.
              </p>
            </div>

            {/* Three Borderless Governance Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              {TRUST_CARDS.map((card) => (
                <div
                  key={card.title}
                  className="rounded-[8px] bg-[#F4F4F4] p-6 sm:p-7 flex flex-col justify-between gap-5"
                >
                  <div className="space-y-2.5">
                    <h3 className="text-[20px] sm:text-[22px] font-medium tracking-[-0.018em] text-[#171A20]">
                      {card.title}
                    </h3>
                    <p className="text-[15px] text-[#5C5E62] leading-[1.55] text-pretty">
                      {card.description}
                    </p>
                  </div>
                  <div>
                    <TextLink to={card.to} arrow>
                      {card.linkLabel}
                    </TextLink>
                  </div>
                </div>
              ))}
            </div>

            {/* 12-Column Editorial FAQ Accordion */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start pt-4">
              <div className="lg:col-span-4 space-y-4">
                <h3 className="text-[24px] sm:text-[28px] font-medium tracking-[-0.02em] leading-[1.18] text-[#171A20]">
                  Direct Answers on Subsidies, Backup &amp; Roof Care
                </h3>
                <p className="text-[15px] text-[#5C5E62] leading-[1.6] text-pretty">
                  Need engineering specifics for your property? Explore the full 26-topic reference
                  library or speak directly with a WAVENOX solar advisor.
                </p>
                <div className="pt-2 flex flex-col items-start gap-3">
                  <TextLink to="/faq" arrow>
                    Browse complete Knowledge Base (26 Topics)
                  </TextLink>
                  <TextLink href={`tel:${BRAND_CONFIG.contact.phone.dial}`} arrow>
                    Speak with a WAVENOX advisor ({BRAND_CONFIG.contact.phone.display})
                  </TextLink>
                </div>
              </div>

              <div className="lg:col-span-8">
                <Faq
                  items={FAQ_ITEMS}
                  defaultValue="subsidy"
                  className="border-[#E3E4E6] divide-[#E3E4E6]"
                />
              </div>
            </div>
          </div>
        </section>

        {/* SEC 9: BOOKEND CLOSING CTA (16:9 DESKTOP / 4:5 MOBILE) */}
        <Panel
          id="consultation"
          height="closing"
          media={media["home-final"]}
          tone="dark"
          className="scroll-mt-14"
          title="Plan Your Solar System with WAVENOX"
          lead="Generate an indicative roof estimate online or schedule a consultation to review layout, subsidies, and system sizing."
          stats={
            <StatRow
              stats={[
                { value: "15 Mins", label: "Initial Advisory Call" },
                { value: "₹0", label: "Online Sizing Preview" },
              ]}
            />
          }
          actions={
            <>
              <Button
                to="/deploy"
                variant="primary"
                tone="dark"
                className="w-full sm:w-auto sm:min-w-[204px]"
              >
                Get Solar Estimate
              </Button>
              <Button
                onClick={() => openConsultationDrawer()}
                variant="secondary"
                tone="dark"
                className="w-full sm:w-auto sm:min-w-[204px]"
              >
                Request Consultation
              </Button>
            </>
          }
          disclaimer="Online estimates and advisory calls carry no purchase obligation; formal engineering quotations follow site evaluation."
        />
      </main>

      <Footer />

      {/* Technical Specifications Drawer */}
      <SpecsDrawer open={specsOpen} onOpenChange={setSpecsOpen} />
    </div>
  );
}
