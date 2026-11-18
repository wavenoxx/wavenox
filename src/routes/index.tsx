import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import {
  Panel,
  QuietSection,
  StatRow,
  Button,
  TextLink,
  SpecsDrawer,
  Faq,
  Media,
  type FaqItem,
} from "@/components/system";
import { media } from "@/config/media";
import { BRAND_CONFIG } from "@/config/brand";
import { DISCOMS, estimate } from "@/config/solar";
import { openConsultationDrawer } from "@/lib/consultation";

const SOLUTION_FAMILIES = [
  {
    id: "solar-panels",
    eyebrow: "01 · Residential Rooftop · 3 kW – 25 kW",
    title: "Solar Panels for Homes",
    description:
      "Low-profile rooftop arrays and elevated terrace pergolas built around Indian slab waterproofing, concealed conduit routing, and residential PM Surya Ghar subsidies.",
    mediaKey: "res-hero" as const,
    ctaLabel: "Explore Solar Panels",
    to: "/residential",
  },
  {
    id: "solar-storage",
    eyebrow: "02 · Solar + Storage · 14.3 – 28.6 kWh",
    title: "Solar + Battery Storage",
    description:
      "Pair daytime solar generation with modular LiFePO4 storage and compatible hybrid inverters to supply supported home circuits during grid outages.",
    mediaKey: "omnigrid-hero" as const,
    ctaLabel: "Explore Battery Storage",
    to: "/omnigrid",
  },
  {
    id: "commercial-solar",
    eyebrow: "03 · Enterprises & Facilities · 25 kW+",
    title: "Commercial Solar",
    description:
      "High-yield arrays for industrial roofs and campuses designed to offset daytime tariffs alongside Section 33 tax depreciation modeling.",
    mediaKey: "commercial-hero" as const,
    ctaLabel: "Explore Commercial",
    to: "/enterprise",
  },
] as const;

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
        {/* SCENE 01: ARCHITECTURAL SOLAR HERO */}
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
                className="w-full sm:w-auto sm:min-w-[210px] !px-2.5 min-[375px]:!px-3 sm:!px-7 text-[12px] min-[375px]:text-[13px] sm:text-[14px]"
              >
                Design Your System
              </Button>
              <Button
                onClick={() => openConsultationDrawer()}
                variant="secondary"
                tone="dark"
                className="w-full sm:w-auto sm:min-w-[210px] !px-2.5 min-[375px]:!px-3 sm:!px-7 text-[12px] min-[375px]:text-[13px] sm:text-[14px] bg-[#171A20]/80 backdrop-blur-md text-[#FFFFFF] border border-[#FFFFFF]/30 hover:bg-[#171A20]/90 shadow-[0_2px_10px_rgba(0,0,0,0.28)]"
              >
                Book a Consultation
              </Button>
            </>
          }
        />

        {/* SCENE 02: THREE SOLAR PATHS (ARCHITECTURAL PRODUCT GALLERY) */}
        <QuietSection
          id="solutions"
          bg="white"
          eyebrow="01 · System Architecture"
          className="scroll-mt-14"
          title="Three Solar Paths. One Coordinated Experience."
          lead="Choose the system architecture tailored to your roof layout, daytime demand, and backup requirements."
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-10">
            {SOLUTION_FAMILIES.map((family) => {
              const [stepCode, segmentLabel, capacityLabel] = family.eyebrow.split(" · ");
              return (
                <article
                  key={family.id}
                  className="flex flex-col justify-between space-y-6 pt-5 border-t border-[#E3E4E6]"
                >
                  <div className="space-y-5">
                    <div className="flex items-center justify-between gap-2 text-[12px] font-medium uppercase tracking-[0.06em] text-[#5C5E62] tabular-nums">
                      <span>
                        {stepCode} · {segmentLabel}
                      </span>
                      <span className="text-[#171A20]">{capacityLabel}</span>
                    </div>

                    <Link
                      to={family.to}
                      className="block relative aspect-[16/10.5] w-full overflow-hidden rounded-[4px] bg-[#F4F4F4] border border-black/[0.06] group focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#171A20]"
                    >
                      <Media
                        media={media[family.mediaKey]}
                        objectPosition="center 35%"
                        className="w-full h-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.02]"
                      />
                    </Link>

                    <div className="space-y-2.5 pt-0.5">
                      <h3 className="text-[22px] sm:text-[24px] font-medium tracking-[-0.018em] leading-[1.2] text-[#171A20]">
                        {family.title}
                      </h3>
                      <p className="text-[14px] sm:text-[15px] text-[#393C41] leading-[1.6] text-pretty">
                        {family.description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-1">
                    <Button
                      to={family.to}
                      variant="primary"
                      tone="light"
                      className="w-full sm:w-auto"
                    >
                      {family.ctaLabel}
                    </Button>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="mt-14 pt-8 border-t border-[#E3E4E6] flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <span className="text-[13px] text-[#5C5E62]">
              Every configuration is engineered around local DISCOM net-metering and structural wind
              codes.
            </span>
            <TextLink to="/deploy" arrow>
              Unsure which system fits your roof? Compare options in the Design Studio
            </TextLink>
          </div>
        </QuietSection>

        {/* SCENE 03: ROOFTOP BEAUTY & INDIAN HEAT ENGINEERING (LARGE EDITORIAL ARCHITECTURAL FRAME) */}
        <section
          id="design"
          data-theme="light"
          className="relative w-full py-16 sm:py-20 md:py-24 lg:py-32 px-5 sm:px-8 lg:px-12 bg-[#F4F4F4] text-[#171A20] border-y border-[#E3E4E6] scroll-mt-14"
        >
          <div className="max-w-[1240px] mx-auto space-y-10 sm:space-y-12">
            {/* Editorial Split Header */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-end">
              <div className="lg:col-span-7 space-y-3">
                <div
                  id="heat-performance"
                  className="scroll-mt-24 text-[12px] font-medium uppercase tracking-[0.08em] text-[#5C5E62]"
                >
                  02 · Architecture &amp; Thermal Engineering
                </div>
                <h2 className="text-[28px] sm:text-[36px] lg:text-[44px] font-medium tracking-[-0.024em] leading-[1.1] text-[#171A20] text-balance max-w-[22ch]">
                  Engineered for Indian Rooftops and 45°C Summers
                </h2>
              </div>

              <div className="lg:col-span-5 space-y-5">
                <p className="text-[15px] sm:text-[16px] text-[#393C41] leading-[1.6] text-pretty">
                  Low-profile terrace mounts and concealed conduit raceways paired with −0.30%/°C
                  thermal engineering—preserving walkable roof geometry without exposed cable trays.
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    onClick={() => setSpecsOpen(true)}
                    variant="primary"
                    tone="light"
                    className="w-full sm:w-auto"
                  >
                    View Technical Specs
                  </Button>
                  <Button
                    to="/residential"
                    variant="secondary"
                    tone="light"
                    className="w-full sm:w-auto bg-[#FFFFFF] border-[#D0D2D6] hover:bg-[#EAEAEA]"
                  >
                    Explore Solar Panels
                  </Button>
                </div>
              </div>
            </div>

            {/* Large Unobstructed Architectural Photograph Frame */}
            <div className="relative aspect-[4/3] sm:aspect-[16/9] w-full overflow-hidden rounded-[6px] bg-[#171A20] border border-black/[0.08] shadow-[0_18px_44px_rgba(23,26,32,0.08)]">
              <Media media={media["home-design"]} className="w-full h-full object-cover" />
            </div>

            {/* Below-Frame Verified Specification Bar & Reference Footnote */}
            <div className="pt-2 space-y-6">
              <div className="grid grid-cols-3 gap-2.5 sm:gap-8 py-6 border-y border-[#D8DADC]">
                <div>
                  <div className="text-[17px] min-[375px]:text-[19px] sm:text-[28px] lg:text-[34px] font-medium tracking-[-0.02em] leading-[1.1] tabular-nums whitespace-nowrap text-[#171A20]">
                    -0.30% / °C
                  </div>
                  <div className="text-[12px] font-medium uppercase tracking-[0.04em] sm:tracking-[0.05em] text-[#5C5E62] mt-1.5">
                    Temp. Coeff.*
                  </div>
                </div>
                <div className="border-l border-[#D8DADC] pl-2.5 sm:pl-8">
                  <div className="text-[17px] min-[375px]:text-[19px] sm:text-[28px] lg:text-[34px] font-medium tracking-[-0.02em] leading-[1.1] tabular-nums whitespace-nowrap text-[#171A20]">
                    22.45%+
                  </div>
                  <div className="text-[12px] font-medium uppercase tracking-[0.04em] sm:tracking-[0.05em] text-[#5C5E62] mt-1.5">
                    Efficiency*
                  </div>
                </div>
                <div className="border-l border-[#D8DADC] pl-2.5 sm:pl-8">
                  <div className="text-[17px] min-[375px]:text-[19px] sm:text-[28px] lg:text-[34px] font-medium tracking-[-0.02em] leading-[1.1] tabular-nums whitespace-nowrap text-[#171A20]">
                    158 km/h
                  </div>
                  <div className="text-[12px] font-medium uppercase tracking-[0.04em] sm:tracking-[0.05em] text-[#5C5E62] mt-1.5">
                    Wind Basis*
                  </div>
                </div>
              </div>

              <p className="text-[12px] text-[#5C5E62] leading-[1.5]">
                *Reference 580W N-Type TOPCon (22.45%–22.8%) and IS 875 44 m/s wind basis; final
                specs follow site survey and OEM datasheet.
              </p>
            </div>
          </div>
        </section>

        {/* SCENE 04A: SOLAR + BATTERY OUTAGE PROTECTION */}
        <Panel
          id="outage-protection"
          media={media["home-outage"]}
          tone="dark"
          className="scroll-mt-14"
          title="Backup Power When the Grid Goes Down"
          lead="Standard grid-tied solar shuts down during power cuts for utility anti-islanding safety. Pairing your array with compatible LiFePO4 battery storage powers essential circuits through outages."
          stats={
            <StatRow
              stats={[
                { value: "< 20 ms*", label: "UPS Transfer Spec*" },
                { value: "14.3 kWh", label: "Modular LFP Storage" },
                { value: "6.0 kW*", label: "Continuous Output*" },
              ]}
            />
          }
          actions={
            <>
              <Button
                to="/omnigrid"
                variant="primary"
                tone="dark"
                className="w-full sm:w-auto sm:min-w-[210px] text-[12px] min-[375px]:text-[13px] sm:text-[14px]"
              >
                Explore Battery Storage
              </Button>
              <Button
                to="/deploy"
                variant="secondary"
                tone="dark"
                className="w-full sm:w-auto sm:min-w-[210px] text-[12px] min-[375px]:text-[13px] sm:text-[14px]"
              >
                Configure Solar + Storage
              </Button>
            </>
          }
          disclaimer="*Transfer time, backup output, and runtime depend on your installed hybrid inverter, battery state of charge, and active home loads."
        />

        {/* SCENE 04B: ENERGY VISIBILITY & ILLUSTRATIVE MONITORING EXAMPLE */}
        <QuietSection id="monitoring" bg="white" className="scroll-mt-14 border-b border-[#E3E4E6]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            <div className="lg:col-span-5 space-y-6 text-left">
              <div className="space-y-3">
                <div className="text-[12px] font-medium uppercase tracking-[0.08em] text-[#5C5E62]">
                  03 · Energy Visibility · OEM Inverter Cloud
                </div>
                <h2 className="text-[28px] sm:text-[36px] lg:text-[42px] font-medium tracking-[-0.024em] leading-[1.1] text-[#171A20] text-balance">
                  Generation, Home Load &amp; Reserve in One View
                </h2>
                <p className="text-[15px] sm:text-[16px] text-[#393C41] leading-[1.6] text-pretty">
                  Compatible hybrid inverters stream solar output, household demand, battery
                  reserve, and net-metering export directly to the inverter manufacturer&apos;s app.
                  WAVENOX assists with initial portal setup and only reviews diagnostic logs with
                  your explicit authorization.
                </p>
              </div>

              <div className="divide-y divide-[#E3E4E6] border-y border-[#E3E4E6] text-[13px]">
                <div className="py-3 flex items-center justify-between gap-4">
                  <span className="text-[#5C5E62]">Daytime Dispatch</span>
                  <span className="font-medium text-[#171A20]">
                    Home Loads → LFP Reserve → DISCOM Export
                  </span>
                </div>
                <div className="py-3 flex items-center justify-between gap-4">
                  <span className="text-[#5C5E62]">Outage Switchover</span>
                  <span className="font-medium text-[#171A20] tabular-nums">
                    Automatic Backup (&lt; 20 ms target)
                  </span>
                </div>
              </div>

              <div>
                <TextLink to="/omnigrid" hash="flow-simulation" arrow>
                  Explore 24-hour energy flow modeling
                </TextLink>
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="w-full rounded-[6px] bg-[#F4F4F4] border border-[#E3E4E6] p-6 sm:p-10 lg:p-12 flex flex-col items-center">
                <div className="w-full max-w-[400px] rounded-[10px] bg-[#171A20] text-[#FFFFFF] p-5 sm:p-6 shadow-[0_18px_40px_rgba(23,26,32,0.14)] border border-white/10 space-y-5">
                  <div className="flex justify-between items-center gap-2 pb-4 border-b border-white/10 text-[12px] text-[#FFFFFF]/80">
                    <span className="font-medium tracking-[0.02em] text-[#FFFFFF] whitespace-nowrap">
                      OEM Inverter App
                    </span>
                    <span className="px-2.5 py-0.5 rounded-[4px] bg-[#FFFFFF]/10 text-[#FFFFFF] text-[12px] whitespace-nowrap">
                      Illustrative sample
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="p-4 rounded-[6px] bg-[#FFFFFF]/[0.06] flex justify-between items-center gap-3">
                      <div>
                        <div className="text-[12px] text-[#FFFFFF]/70">Solar Production</div>
                        <div className="text-[22px] font-medium text-[#FFFFFF] tabular-nums mt-0.5">
                          5.8 kW
                        </div>
                      </div>
                      <span className="text-[12px] text-[#FFFFFF]/75 whitespace-nowrap">
                        Midday Peak
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-[12px]">
                      <div className="p-4 rounded-[6px] bg-[#FFFFFF]/[0.06]">
                        <div className="text-[#FFFFFF]/70">Home Load</div>
                        <div className="text-[18px] font-medium text-[#FFFFFF] tabular-nums mt-0.5 whitespace-nowrap">
                          1.6 kW
                        </div>
                      </div>
                      <div className="p-4 rounded-[6px] bg-[#FFFFFF]/[0.06]">
                        <div className="text-[#FFFFFF]/70">Battery Reserve</div>
                        <div className="flex items-baseline gap-1.5 mt-0.5 whitespace-nowrap">
                          <span className="text-[18px] font-medium text-[#FFFFFF] tabular-nums">
                            98%
                          </span>
                          <span className="text-[12px] text-[#FFFFFF]/70 tabular-nums">
                            +2.2 kW
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-[6px] bg-[#FFFFFF]/[0.06] flex justify-between items-center gap-2">
                      <div>
                        <div className="text-[12px] text-[#FFFFFF]/70">Grid Net Export</div>
                        <div className="text-[18px] font-medium text-[#FFFFFF] tabular-nums mt-0.5 whitespace-nowrap">
                          2.0 kW export
                        </div>
                      </div>
                      <span className="text-[12px] text-[#F57C00] font-medium whitespace-nowrap">
                        Net Metering
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-[12px] text-[#5C5E62] text-center max-w-[44ch] mt-5">
                  Illustrative monitoring example. Screens and metrics depend on your installed OEM
                  inverter hardware and cloud provider.
                </p>
              </div>
            </div>
          </div>
        </QuietSection>

        {/* SCENE 05: PERSONALIZED SOLAR DESIGN & SAVINGS */}
        <QuietSection
          id="savings"
          bg="surface"
          eyebrow="04 · Tariff & Subsidy Modeling"
          className="scroll-mt-14"
          title="Estimate Your Solar System & Savings"
          lead="Select your electricity board and monthly power bill to preview indicative system size, annual savings, and central subsidy eligibility."
        >
          <div className="max-w-[1080px] mx-auto bg-[#FFFFFF] p-6 sm:p-10 lg:p-12 rounded-[6px] border border-[#E3E4E6] space-y-8 sm:space-y-10">
            {/* Step 1 & 2: DISCOM Selector + Monthly Bill Slider in a Clean 12-Col Split */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
              <div className="lg:col-span-6 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label
                    htmlFor="discom-select"
                    className="text-[12px] font-medium uppercase tracking-[0.06em] text-[#5C5E62]"
                  >
                    1. Electricity Board (DISCOM)
                  </label>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[4px] border border-[#E3E4E6] bg-[#F4F4F4] text-[#171A20] text-[12px] font-medium">
                    <span
                      className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                        solarEstimate.status === "VERIFIED" ? "bg-[#B45309]" : "bg-[#5C5E62]"
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
                  <span className="text-[26px] sm:text-[30px] font-medium tracking-[-0.02em] leading-none tabular-nums text-[#171A20]">
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

            {/* Step 3, 4, 5: Three Primary Metric Outputs with Architectural Hairlines (No Nested Gray Cards) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-0 py-7 sm:py-8 border-y border-[#E3E4E6] sm:divide-x sm:divide-[#E3E4E6]">
              <div className="sm:pr-8">
                <div className="text-[12px] font-medium uppercase tracking-[0.06em] text-[#5C5E62]">
                  Recommended System
                </div>
                <div className="text-[30px] sm:text-[36px] lg:text-[40px] font-medium tracking-[-0.025em] leading-[1.1] tabular-nums text-[#171A20] mt-2">
                  {solarEstimate.recommendedKw} kW
                </div>
                <div className="text-[13px] text-[#5C5E62] mt-1">
                  Recommended ({solarEstimate.recommendedPanels} Panels)
                </div>
              </div>

              <div className="pt-5 border-t border-[#E3E4E6] sm:pt-0 sm:border-t-0 sm:px-8">
                <div className="text-[12px] font-medium uppercase tracking-[0.06em] text-[#5C5E62]">
                  Est. Annual Savings
                </div>
                <div className="text-[30px] sm:text-[36px] lg:text-[40px] font-medium tracking-[-0.025em] leading-[1.1] tabular-nums text-[#171A20] mt-2">
                  ₹{formatInr(solarEstimate.annualSavingsInr)}
                </div>
                <div className="text-[13px] text-[#5C5E62] mt-1">
                  Based on {solarEstimate.assumptions.discom.code} tariff schedule
                </div>
              </div>

              <div className="pt-5 border-t border-[#E3E4E6] sm:pt-0 sm:border-t-0 sm:pl-8">
                <div className="text-[12px] font-medium uppercase tracking-[0.06em] text-[#5C5E62]">
                  Conditional Central Subsidy
                </div>
                <div className="text-[30px] sm:text-[36px] lg:text-[40px] font-medium tracking-[-0.025em] leading-[1.1] tabular-nums text-[#171A20] mt-2">
                  ₹{formatInr(solarEstimate.subsidyInr)}
                </div>
                <div className="text-[13px] text-[#5C5E62] mt-1">
                  Potential DBT Subsidy (Conditional)*
                </div>
              </div>
            </div>

            {/* Step 6: Generation Summary + Studio / Consultation Actions */}
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
                  className="w-full sm:w-auto min-w-[200px]"
                >
                  Open in Design Studio
                </Button>
                <Button
                  onClick={() => openConsultationDrawer()}
                  variant="secondary"
                  tone="light"
                  className="w-full sm:w-auto min-w-[200px]"
                >
                  Talk to a Solar Advisor
                </Button>
              </div>
            </div>

            {/* Step 7: Unified Bottom Regulatory Disclosure */}
            <div className="pt-6 border-t border-[#E3E4E6] flex flex-col lg:flex-row lg:items-end justify-between gap-4">
              <p className="text-[12px] text-[#5C5E62] leading-[1.55] max-w-3xl text-pretty">
                *
                {solarEstimate.status === "VERIFIED"
                  ? `Modeled on verified ${solarEstimate.assumptions.discom.authority} (${solarEstimate.assumptions.discom.state}) telescopic tariff slabs and conditional MNRE PM Surya Ghar central subsidy guidelines.`
                  : `Modeled on an indicative regional benchmark (₹${solarEstimate.assumptions.tariffInrPerKwh.toFixed(2)}/kWh for ${solarEstimate.assumptions.discom.state}) and conditional MNRE PM Surya Ghar guidelines.`}{" "}
                {solarEstimate.assumptions.discom.regulatoryNote} Unavoidable monthly fixed charges
                (~₹{formatInr(solarEstimate.billBreakdown.unavoidableChargesInr)}/mo) remain payable
                to your DISCOM. Actual system pricing, roof capacity, and export settlements depend
                on a site survey and formal quotation.
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
        </QuietSection>

        {/* SCENE 06: FROM CONSULTATION TO POWER-ON (OPEN 3x2 ARCHITECTURAL GRID) */}
        <QuietSection
          id="process"
          bg="white"
          eyebrow="05 · Turnkey Execution"
          className="scroll-mt-14"
          title="From Consultation to Power-On"
          lead="A coordinated six-stage workflow from initial tariff review and roof survey to DISCOM bi-directional meter commissioning."
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 lg:gap-x-12 gap-y-10 lg:gap-y-12">
            {STEPS.map((step) => (
              <div key={step.num} className="pt-6 border-t border-[#E3E4E6] space-y-3">
                <span className="text-[12px] font-semibold tracking-[0.08em] uppercase tabular-nums text-[#5C5E62] block">
                  STEP {step.num}
                </span>
                <h3 className="text-[20px] font-medium tracking-[-0.015em] text-[#171A20]">
                  {step.title}
                </h3>
                <p className="text-[14px] sm:text-[15px] text-[#393C41] leading-[1.6] text-pretty">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-14 pt-8 border-t border-[#E3E4E6] flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <p className="text-[13px] text-[#5C5E62] max-w-2xl">
              Commissioning timelines depend on terrace structural readiness, local DISCOM feeder
              capacity, and utility inspection schedules.
            </p>
            <TextLink to="/net-metering" arrow className="shrink-0">
              Review DISCOM net-metering workflow
            </TextLink>
          </div>
        </QuietSection>

        {/* SCENE 07: TRUST, GOVERNANCE & FREQUENTLY ASKED QUESTIONS */}
        <QuietSection
          id="faq"
          bg="surface"
          eyebrow="06 · Governance & Clarity"
          className="scroll-mt-14"
          title="Governance, Warranties & Common Questions"
          lead="Every specification, tariff basis, and warranty boundary is documented openly before you commit."
        >
          {/* Part A: Three Editorial Governance Foundations */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10 pb-14 mb-14 border-b border-[#E3E4E6]">
            {TRUST_CARDS.map((card) => (
              <div
                key={card.title}
                className="flex flex-col justify-between space-y-4 pt-6 border-t border-[#D8DADC]"
              >
                <div className="space-y-2.5">
                  <h3 className="text-[18px] font-medium tracking-[-0.015em] text-[#171A20]">
                    {card.title}
                  </h3>
                  <p className="text-[14px] sm:text-[15px] text-[#393C41] leading-[1.6] text-pretty">
                    {card.description}
                  </p>
                </div>
                <div className="pt-1">
                  <TextLink to={card.to} arrow>
                    {card.linkLabel}
                  </TextLink>
                </div>
              </div>
            ))}
          </div>

          {/* Part B: 12-Column Editorial FAQ Split (Borderless Accordion Synchronized with FAQPage JSON-LD) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
            <div className="lg:col-span-4 space-y-4">
              <div className="text-[12px] font-medium uppercase tracking-[0.08em] text-[#5C5E62]">
                Knowledge Base
              </div>
              <h3 className="text-[22px] sm:text-[26px] font-medium tracking-[-0.02em] leading-[1.18] text-[#171A20]">
                Direct Answers on Subsidies, Backup &amp; Roof Care
              </h3>
              <p className="text-[14px] text-[#5C5E62] leading-[1.6] text-pretty">
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
                className="border-[#D8DADC] divide-[#D8DADC]"
              />
            </div>
          </div>
        </QuietSection>

        {/* SCENE 08: FINAL CONSULTATION INVITATION + FOOTER */}
        <Panel
          id="consultation"
          height="closing"
          media={media["home-final"]}
          tone="dark"
          className="scroll-mt-14"
          title="Plan Your Solar System with WAVENOX"
          lead="Generate an indicative estimate for your roof online or request a call with an advisor to review feasibility, subsidies, and design."
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
                className="w-full sm:w-auto sm:min-w-[210px] text-[12px] min-[375px]:text-[13px] sm:text-[14px]"
              >
                Get Solar Estimate
              </Button>
              <Button
                onClick={() => openConsultationDrawer()}
                variant="secondary"
                tone="dark"
                className="w-full sm:w-auto sm:min-w-[210px] text-[12px] min-[375px]:text-[13px] sm:text-[14px]"
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
