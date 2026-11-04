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
    eyebrow: "01 · Residential Rooftop",
    spec: "3 kW – 25 kW · N-Type TOPCon",
    title: "Solar Panels for Homes",
    description:
      "Low-profile rooftop and elevated pergola solar systems engineered to reduce monthly DISCOM bills while preserving usable terrace space.",
    highlights: [
      "Up to ₹78,000 central subsidy*",
      "25-year OEM linear module warranty",
      "Concealed conduit & waterproofing care",
    ],
    mediaKey: "res-hero" as const,
    primaryLabel: "Explore Solar Panels",
    primaryTo: "/residential",
    secondaryLabel: "Get Estimate",
    secondaryTo: "/deploy",
  },
  {
    id: "solar-storage",
    eyebrow: "02 · Residential Backup",
    spec: "14.3 kWh – 28.6 kWh · LiFePO4",
    title: "Solar + Battery Storage",
    description:
      "Store daytime solar generation for evening self-use and automatic sub-20ms backup switchover when utility power drops.",
    highlights: [
      "< 20 ms automatic outage transfer",
      "Runs inverter ACs & essential home loads",
      "10-year OEM battery & inverter warranty",
    ],
    mediaKey: "omnigrid-hero" as const,
    primaryLabel: "Explore Omnigrid",
    primaryTo: "/omnigrid",
    secondaryLabel: "Configure",
    secondaryTo: "/deploy",
  },
  {
    id: "commercial-solar",
    eyebrow: "03 · Enterprises & Facilities",
    spec: "25 kW – Multi-MW · C&I",
    title: "Commercial Solar",
    description:
      "High-yield rooftop and campus solar installations designed for daytime tariff reduction, accelerated depreciation, and ESG reporting.",
    highlights: [
      "3 to 4 year indicative payback*",
      "40% Year-1 accelerated depreciation",
      "Coordinated HT/LT net-metering",
    ],
    mediaKey: "commercial-hero" as const,
    primaryLabel: "Explore Commercial",
    primaryTo: "/enterprise",
    secondaryLabel: "Request Assessment",
    secondaryTo: "/enterprise",
  },
];

const FAQ_ITEMS: FaqItem[] = [
  {
    id: "subsidy",
    question: "How does the PM Surya Ghar subsidy work?",
    answer:
      "Eligible homes receive up to ₹78,000 direct benefit transfer from the central government for systems 3 kW or larger. WAVENOX files all national portal documentation and coordinates the DISCOM net-metering inspection end-to-end.",
  },
  {
    id: "outage",
    question: "Will my solar panels work during a power outage?",
    answer:
      "Standard grid-tied systems shut off during blackouts for utility safety. When paired with Omnigrid battery storage, your home switches to stored solar in under 20 milliseconds, keeping lights, appliances, and air conditioning running without interruption.",
  },
  {
    id: "ac-run",
    question: "Can Omnigrid battery run 1.5-ton air conditioners during blackouts?",
    answer:
      "Yes. Omnigrid delivers 6.0 kW continuous output with 10.0 kW peak surge capability, effortlessly starting and powering 1.5-ton and 2.0-ton 5-star inverter air conditioners, water pumps, and luxury appliances.",
  },
  {
    id: "terrace",
    question: "Can I still use my terrace after installing solar?",
    answer:
      "Yes. Our elevated pergola structures maintain 7 to 9 feet of clear headroom, transforming your terrace into a shaded outdoor living space while bifacial panels produce clean power overhead.",
  },
  {
    id: "waterproofing",
    question: "Will installing solar on my terrace cause roof leakage or slab damage?",
    answer:
      "We utilize non-penetrating precast ballasted foundation blocks or chemical-anchor pedestals sealed with multi-layer elastomeric waterproofing membranes to protect the structural integrity of your terrace roof slab.",
  },
  {
    id: "timeline",
    question: "How long does installation and net metering take?",
    answer:
      "On-site rooftop installation takes 2 to 3 days. DISCOM net-metering approvals and bi-directional meter energization typically complete within 2 to 4 weeks under Ministry of Power 2024 deemed approval timelines.",
  },
];

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
        href: "/media/home-hero-1600w.webp",
        media: "(min-width: 768px)",
        type: "image/webp",
      },
      {
        rel: "preload",
        as: "image",
        href: "/media/home-hero-mobile.webp",
        media: "(max-width: 767px)",
        type: "image/webp",
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

const STEPS = [
  {
    num: "01",
    title: "Consultation",
    desc: "Share your property type, city, and monthly power bill for an initial sizing and tariff review.",
  },
  {
    num: "02",
    title: "Site Assessment",
    desc: "Terrace measurement, 3D sun-path shading study, and structural load verification.",
  },
  {
    num: "03",
    title: "Design & Quotation",
    desc: "Itemized system engineering proposal with module layout, conduit path, and subsidy eligibility.",
  },
  {
    num: "04",
    title: "Installation Coordination",
    desc: "Authorized WAVENOX partner installation with concealed raceways and waterproofed mountings.",
  },
  {
    num: "05",
    title: "Utility Commissioning",
    desc: "DISCOM net-metering application, bi-directional meter inspection, and grid synchronization.",
  },
  {
    num: "06",
    title: "After-Sales Support",
    desc: "Inverter cloud monitoring setup, subsidy documentation tracking, and warranty coordination.",
  },
];

const TRUST_CARDS = [
  {
    title: "Three-Tier Warranty Clarity",
    description:
      "Clear separation between 25-year OEM module performance warranties, 10-year OEM inverter and battery coverage, and 5-year partner workmanship warranty.",
    linkLabel: "Review Warranty Scope",
    to: "/warranty",
  },
  {
    title: "Sourced Tariff & Subsidy Math",
    description:
      "Every savings and payback estimate cites published TGERC/APERC retail tariff schedules, MNRE subsidy slabs, and NASA POWER solar irradiance data.",
    linkLabel: "Inspect Calculation Sources",
    to: "/legal/disclosures",
  },
  {
    title: "Coordinated Delivery & Privacy",
    description:
      "Physical installation is fulfilled by authorized WAVENOX partners under unified engineering standards, with strict DPDP Act 2023 customer data protection.",
    linkLabel: "Read Delivery Model",
    to: "/our-story",
  },
] as const;

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
        {/* 1. PANEL: home-hero — Immediate Product Clarity */}
        <Panel
          id="solar-panels"
          as="h1"
          media={media["home-hero"]}
          priority={true}
          tone="dark"
          title="Solar, Designed Around Your Home"
          lead="Explore rooftop solar and battery storage engineered for Indian homes, with a coordinated journey from consultation to commissioning."
          stats={
            <StatRow
              stats={[
                { value: "₹78,000", label: "Max Central Subsidy*" },
                { value: "25 Years", label: "OEM Module Warranty" },
                { value: "1,490 kWh", label: "Annual Yield / kWp" },
              ]}
            />
          }
          actions={
            <>
              <Button
                to="/deploy"
                variant="primary"
                tone="dark"
                className="w-full sm:w-auto min-w-[210px]"
              >
                Get Solar Estimate
              </Button>
              <Button
                onClick={() => openConsultationDrawer()}
                variant="secondary"
                tone="dark"
                className="w-full sm:w-auto min-w-[210px]"
              >
                Talk to a Solar Advisor
              </Button>
            </>
          }
          disclaimer="*Central subsidy under PM Surya Ghar Muft Bijli Yojana subject to residential eligibility and national portal sanctioning."
        />

        {/* 2. QUIET SECTION: Three Clear Solution Paths */}
        <QuietSection
          id="solutions"
          bg="white"
          title="Three Solar Paths. One Coordinated Experience."
          lead="Select the system architecture designed for your property, daytime load profile, and backup power requirements."
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            {SOLUTION_FAMILIES.map((family) => (
              <article
                key={family.id}
                className="flex flex-col justify-between rounded-[8px] border border-[#E3E4E6] bg-[#FFFFFF] overflow-hidden shadow-xs hover:border-[#171A20]/40 transition-colors"
              >
                <div>
                  <Link
                    to={family.primaryTo}
                    className="block relative aspect-[16/10] w-full overflow-hidden bg-[#171A20] group"
                  >
                    <Media
                      media={media[family.mediaKey]}
                      className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
                    <span className="absolute bottom-3 left-4 text-[12px] font-medium tracking-wide text-[#FFFFFF] bg-black/55 backdrop-blur-xs px-2.5 py-1 rounded-[4px]">
                      {family.spec}
                    </span>
                  </Link>

                  <div className="p-6 space-y-3">
                    <div className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#5C5E62]">
                      {family.eyebrow}
                    </div>
                    <h3 className="text-[20px] font-medium tracking-tight text-[#171A20]">
                      {family.title}
                    </h3>
                    <p className="text-[14px] text-[#5C5E62] leading-relaxed">
                      {family.description}
                    </p>
                    <ul className="pt-2 space-y-1.5 border-t border-[#E3E4E6]">
                      {family.highlights.map((item) => (
                        <li
                          key={item}
                          className="text-[13px] text-[#171A20] flex items-center gap-2"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-[#171A20] shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="px-6 pb-6 pt-2 flex items-center gap-3">
                  <Link
                    to={family.primaryTo}
                    className="flex-1 h-10 px-4 rounded-[4px] bg-[#171A20] text-[#FFFFFF] text-[13px] font-medium hover:bg-[#2C3038] transition-colors flex items-center justify-center text-center"
                  >
                    {family.primaryLabel}
                  </Link>
                  <Link
                    to={family.secondaryTo}
                    className="h-10 px-4 rounded-[4px] border border-[#E3E4E6] bg-[#F4F4F4] text-[#171A20] text-[13px] font-medium hover:bg-[#EAEAEA] transition-colors flex items-center justify-center text-center"
                  >
                    {family.secondaryLabel}
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </QuietSection>

        {/* 3. PANEL: home-design — Architectural Solar */}
        <Panel
          id="design"
          media={media["home-design"]}
          tone="dark"
          title="Clean, All-Black Architecture"
          lead="Low-profile modules, concealed conduit raceways, and elevated pergola frames that sit cleanly on Indian terraces."
          stats={
            <StatRow
              stats={[
                { value: "Flush", label: "Terrace Mount" },
                { value: "Concealed", label: "Conduit Routing" },
                { value: "158 km/h", label: "IS 875 Wind Rating" },
              ]}
            />
          }
          actions={
            <>
              <Button
                to="/deploy"
                variant="primary"
                tone="dark"
                className="w-full sm:w-auto min-w-[210px]"
              >
                Get Solar Estimate
              </Button>
              <Button
                to="/residential"
                variant="secondary"
                tone="dark"
                className="w-full sm:w-auto min-w-[210px]"
              >
                Explore Solar Panels
              </Button>
            </>
          }
        />

        {/* 4. PANEL: home-outage — Solar + Battery Explanation */}
        <Panel
          id="outage-protection"
          media={media["home-outage"]}
          tone="dark"
          title="Solar + Battery for Uninterrupted Power"
          lead="Standard grid-tied solar shuts off during blackouts for utility safety. Pair your array with Omnigrid LiFePO4 storage for automatic sub-20ms backup switchover."
          stats={
            <StatRow
              stats={[
                { value: "< 20 ms", label: "Backup Switchover" },
                { value: "14.3 kWh", label: "Modular LFP Storage" },
                { value: "6.0 kW", label: "Continuous Output" },
              ]}
            />
          }
          actions={
            <>
              <Button
                to="/omnigrid"
                variant="primary"
                tone="dark"
                className="w-full sm:w-auto min-w-[210px]"
              >
                Explore Battery Storage
              </Button>
              <Button
                to="/deploy"
                variant="secondary"
                tone="dark"
                className="w-full sm:w-auto min-w-[210px]"
              >
                Get Solar Estimate
              </Button>
            </>
          }
          disclaimer="Backup runtime depends on installed battery capacity, state of charge, and active household appliance loads."
        />

        {/* 5. QUIET SECTION: Simple Energy Savings Entry Point */}
        <QuietSection
          id="savings"
          bg="surface"
          title="Estimate Your Solar System & Savings"
          lead="Select your electricity board and monthly power bill to view an indicative system size, annual savings, and central subsidy."
        >
          <div className="max-w-2xl mx-auto space-y-10">
            {/* Controls: DISCOM select & Bill slider */}
            <div className="space-y-6 bg-[#FFFFFF] p-6 sm:p-8 rounded-[8px] border border-[#E3E4E6]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label htmlFor="discom-select" className="text-[13px] font-medium text-[#5C5E62]">
                  Electricity Board (DISCOM)
                </label>
                <select
                  id="discom-select"
                  value={selectedDiscom}
                  onChange={(e) => setSelectedDiscom(e.target.value)}
                  className="h-10 px-3 bg-[#F4F4F4] border border-[#E3E4E6] rounded-[4px] text-[14px] font-medium text-[#171A20] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#171A20]"
                >
                  {DISCOMS.map((d) => (
                    <option key={d.code} value={d.code}>
                      {d.code} ({d.state})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-baseline">
                  <span className="text-[13px] font-medium text-[#5C5E62]">
                    Monthly Electricity Bill
                  </span>
                  <span className="text-[20px] font-medium tabular-nums text-[#171A20]">
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
                <div className="flex justify-between text-[12px] text-[#5C5E62]">
                  <span>₹2,000 / mo</span>
                  <span>₹35,000+ / mo</span>
                </div>
                <p className="text-[12px] text-[#5C5E62] pt-1 text-center leading-normal">
                  * Telangana Gruha Jyothi scheme gives eligible households up to 200 free
                  units/month.
                </p>
              </div>

              {/* 3-Metric Indicative Output Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-[#E3E4E6] text-center">
                <div className="p-3 rounded-[6px] bg-[#F4F4F4]">
                  <div className="text-[24px] sm:text-[28px] font-medium tracking-tight tabular-nums text-[#171A20]">
                    {solarEstimate.recommendedKw} kW
                  </div>
                  <div className="text-[12px] text-[#5C5E62] mt-0.5">Recommended System</div>
                </div>
                <div className="p-3 rounded-[6px] bg-[#F4F4F4]">
                  <div className="text-[24px] sm:text-[28px] font-medium tracking-tight tabular-nums text-[#171A20]">
                    ₹{formatInr(solarEstimate.annualSavingsInr)}
                  </div>
                  <div className="text-[12px] text-[#5C5E62] mt-0.5">Est. Annual Savings</div>
                </div>
                <div className="p-3 rounded-[6px] bg-[#F4F4F4]">
                  <div className="text-[24px] sm:text-[28px] font-medium tracking-tight tabular-nums text-[#171A20]">
                    ₹{formatInr(solarEstimate.subsidyInr)}
                  </div>
                  <div className="text-[12px] text-[#5C5E62] mt-0.5">Central Subsidy*</div>
                </div>
              </div>

              <p className="text-[12px] text-[#5C5E62] text-center">
                Indicative estimate only; final sizing requires an engineering site assessment.{" "}
                <Link
                  to="/legal/disclosures"
                  hash="sources"
                  className="underline hover:text-[#171A20]"
                >
                  Source · verified Aug 2026 (TGERC FY 2025-26 &amp; MNRE)
                </Link>
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                to="/deploy"
                search={{ bill: monthlyBill, discom: selectedDiscom }}
                variant="primary"
                tone="light"
                className="w-full sm:w-auto min-w-[210px]"
              >
                Open in Design Studio
              </Button>
              <Button
                onClick={() => openConsultationDrawer()}
                variant="secondary"
                tone="light"
                className="w-full sm:w-auto min-w-[210px]"
              >
                Talk to a Solar Advisor
              </Button>
            </div>
            <div className="text-center">
              <TextLink to="/legal/disclosures" arrow>
                How we calculate savings &amp; tariffs
              </TextLink>
            </div>
          </div>
        </QuietSection>

        {/* 6. PANEL: home-heat — Built for Indian Heat */}
        <Panel
          id="heat-performance"
          media={media["home-heat"]}
          tone="dark"
          title="Built for Indian Heat"
          lead="N-type TOPCon bifacial cells maintain high output through 45°C summer afternoons and monsoon cloud cover."
          stats={
            <StatRow
              stats={[
                { value: "-0.30% / °C", label: "Temperature Coeff." },
                { value: "22.8%", label: "Module Efficiency" },
                { value: "IP68", label: "Junction Box Rating" },
              ]}
            />
          }
          actions={
            <>
              <Button
                onClick={() => setSpecsOpen(true)}
                variant="secondary"
                tone="dark"
                className="w-full sm:w-auto min-w-[210px]"
              >
                View Technical Specs
              </Button>
              <Button
                to="/technology"
                variant="primary"
                tone="dark"
                className="w-full sm:w-auto min-w-[210px]"
              >
                Explore Engineering
              </Button>
            </>
          }
        />

        {/* 7. QUIET SECTION: Track Live Generation */}
        <QuietSection
          id="monitoring"
          bg="white"
          title="Track Live Generation"
          lead="Monitor solar production, home consumption, and battery state of charge in real time through your inverter manufacturer's cloud app."
        >
          <div className="flex flex-col items-center">
            {/* Minimalist Phone Mockup */}
            <div className="w-[280px] sm:w-[320px] rounded-[36px] p-4 bg-[#171A20] text-[#FFFFFF] shadow-2xl border-4 border-[#393C41]">
              {/* Phone Screen */}
              <div className="rounded-[24px] bg-[#171A20] p-5 space-y-6">
                <div className="flex justify-between items-center text-[12px] text-[#FFFFFF]/60">
                  <span>Inverter Cloud App</span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#F57C00] animate-pulse" />
                    Realtime
                  </span>
                </div>

                {/* Energy Diagram */}
                <div className="space-y-4">
                  <div className="p-3 rounded-[4px] bg-[#FFFFFF]/5 flex justify-between items-center">
                    <div>
                      <div className="text-[12px] text-[#FFFFFF]/60">Solar Production</div>
                      <div className="text-[18px] font-medium text-[#FFFFFF] tabular-nums">
                        5.8 kW
                      </div>
                    </div>
                    <div className="w-2.5 h-2.5 rounded-full bg-[#F57C00]" />
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-[12px]">
                    <div className="p-3 rounded-[4px] bg-[#FFFFFF]/5">
                      <div className="text-[#FFFFFF]/60">Home Load</div>
                      <div className="text-[16px] font-medium text-[#FFFFFF] tabular-nums mt-0.5">
                        1.6 kW
                      </div>
                    </div>
                    <div className="p-3 rounded-[4px] bg-[#FFFFFF]/5">
                      <div className="text-[#FFFFFF]/60">Omnigrid Battery</div>
                      <div className="text-[16px] font-medium text-[#FFFFFF] tabular-nums mt-0.5">
                        98% (2.2 kW)
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-[4px] bg-[#FFFFFF]/5 flex justify-between items-center">
                    <div>
                      <div className="text-[12px] text-[#FFFFFF]/60">Grid Net Export</div>
                      <div className="text-[16px] font-medium text-[#FFFFFF] tabular-nums">
                        2.0 kW (Sending)
                      </div>
                    </div>
                    <div className="text-[12px] text-[#F57C00] font-medium">+Net Metering</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 text-center">
              <TextLink to="/deploy" arrow>
                Configure your solar system
              </TextLink>
            </div>
          </div>
        </QuietSection>

        {/* 8. QUIET SECTION: From Consultation to Power-On + Trust Through Clarity */}
        <QuietSection
          id="process"
          bg="surface"
          title="From Consultation to Power-On"
          lead="A coordinated six-step delivery journey from initial roof assessment to bi-directional meter energization."
        >
          <div className="space-y-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-6 pt-2">
              {STEPS.map((step) => (
                <div
                  key={step.num}
                  className="p-5 rounded-[6px] bg-[#FFFFFF] border border-[#E3E4E6] space-y-2"
                >
                  <span className="text-[12px] font-semibold tabular-nums text-[#5C5E62] block">
                    STEP {step.num}
                  </span>
                  <h3 className="text-[15px] font-medium text-[#171A20]">{step.title}</h3>
                  <p className="text-[13px] text-[#5C5E62] leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>

            <p className="text-[12px] text-[#5C5E62] text-center max-w-2xl mx-auto">
              Project timelines depend on roof structural readiness, local DISCOM feeder capacity,
              and state utility inspection schedules.
            </p>

            {/* Trust Through Clarity Governance Summary */}
            <div className="pt-8 border-t border-[#E3E4E6]">
              <div className="text-center max-w-2xl mx-auto mb-8">
                <h3 className="text-[20px] sm:text-[22px] font-medium tracking-tight text-[#171A20]">
                  Built on Verifiable Engineering &amp; Governance
                </h3>
                <p className="text-[14px] text-[#5C5E62] mt-1.5">
                  Every specification, tariff assumption, and warranty boundary is documented openly
                  before you commit.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {TRUST_CARDS.map((card) => (
                  <div
                    key={card.title}
                    className="p-6 rounded-[6px] bg-[#FFFFFF] border border-[#E3E4E6] flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-2">
                      <h4 className="text-[16px] font-medium text-[#171A20]">{card.title}</h4>
                      <p className="text-[13px] text-[#5C5E62] leading-relaxed">
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
            </div>
          </div>
        </QuietSection>

        {/* 9. QUIET SECTION: Questions & Answers */}
        <QuietSection
          id="faq"
          bg="white"
          title="Questions & Answers"
          lead="Clear answers on rooftop solar, government subsidies, and grid backup."
        >
          <div className="max-w-2xl mx-auto space-y-8">
            <Faq items={FAQ_ITEMS} defaultValue="subsidy" />
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 pt-2">
              <TextLink to="/faq" arrow>
                Browse complete Knowledge Base (26 Topics)
              </TextLink>
              <TextLink href={`tel:${BRAND_CONFIG.contact.phone.dial}`} arrow>
                Talk to a WAVENOX solar advisor
              </TextLink>
            </div>
          </div>
        </QuietSection>

        {/* 10. PANEL: home-final — Final Consultation CTA */}
        <Panel
          id="consultation"
          media={media["home-final"]}
          tone="dark"
          title="Plan Your Solar System with WAVENOX"
          lead="Get an indicative solar estimate for your roof or speak with a WAVENOX advisor to review feasibility, subsidies, and system design."
          stats={
            <StatRow
              stats={[
                { value: "15 Mins", label: "Initial Advisory Call" },
                { value: "₹0", label: "Indicative Roof Sizing" },
              ]}
            />
          }
          actions={
            <>
              <Button
                to="/deploy"
                variant="primary"
                tone="dark"
                className="w-full sm:w-auto min-w-[210px]"
              >
                Get Solar Estimate
              </Button>
              <Button
                onClick={() => openConsultationDrawer()}
                variant="secondary"
                tone="dark"
                className="w-full sm:w-auto min-w-[210px]"
              >
                Request Consultation
              </Button>
            </>
          }
        />
      </main>

      {/* 11. FOOTER */}
      <Footer />

      {/* Technical Specifications Drawer */}
      <SpecsDrawer open={specsOpen} onOpenChange={setSpecsOpen} />
    </div>
  );
}
