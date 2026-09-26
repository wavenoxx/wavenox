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
  type FaqItem,
} from "@/components/system";
import { media } from "@/config/media";
import { BRAND_CONFIG } from "@/config/brand";
import { DISCOMS, estimate } from "@/config/solar";
import { openConsultationDrawer } from "@/lib/consultation";

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
          description:
            "Architectural rooftop solar design and statutory feasibility calculations for Telangana (TGSPDCL & TGNPDCL).",
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
    title: "Virtual Consultation",
    desc: "15-minute roof feasibility review and custom 3D proposal.",
  },
  {
    num: "02",
    title: "Engineering Survey",
    desc: "On-site terrace measurement, shadow study, and structural check.",
  },
  {
    num: "03",
    title: "DISCOM Sanction",
    desc: "Net-metering application and portal approvals filed for you.",
  },
  {
    num: "04",
    title: "Precision Install",
    desc: "Concealed mounting, TOPCon panels, and smart hybrid inverter.",
  },
  {
    num: "05",
    title: "Bi-directional Meter",
    desc: "DISCOM meter change, testing, and system energization.",
  },
];

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
        {/* 1. PANEL: home-hero */}
        <Panel
          id="solar-panels"
          as="h1"
          media={media["home-hero"]}
          priority={true}
          tone="dark"
          title="Rooftop Solar"
          lead="Pay less for electricity with low-profile solar built for Indian roofs."
          stats={
            <StatRow
              stats={[
                { value: "₹78,000", label: "Surya Ghar Subsidy" },
                { value: "25 Years", label: "Linear Warranty" },
                { value: "24/7", label: "Outage Protection" },
              ]}
            />
          }
          actions={
            <>
              <Button
                to="/deploy"
                variant="primary"
                tone="dark"
                className="w-full sm:w-auto min-w-[200px]"
              >
                Design Yours
              </Button>
              <Button
                onClick={() => openConsultationDrawer()}
                variant="secondary"
                tone="dark"
                className="w-full sm:w-auto min-w-[200px]"
              >
                Schedule Consultation
              </Button>
            </>
          }
          disclaimer="*Subsidy under PM Surya Ghar Muft Bijli Yojana subject to central portal sanctioning."
        />

        {/* 2. PANEL: home-design */}
        <Panel
          id="design"
          media={media["home-design"]}
          tone="dark"
          title="Clean, All-Black Design"
          lead="Low-profile panels and concealed mounting that sit neatly on your roofline."
          stats={
            <StatRow
              stats={[
                { value: "Flush", label: "Terrace Mount" },
                { value: "Zero", label: "Visible Conduits" },
              ]}
            />
          }
          actions={
            <>
              <Button
                to="/deploy"
                variant="primary"
                tone="dark"
                className="w-full sm:w-auto min-w-[200px]"
              >
                Design Yours
              </Button>
              <Button
                to="/residential"
                variant="secondary"
                tone="dark"
                className="w-full sm:w-auto min-w-[200px]"
              >
                Learn More
              </Button>
            </>
          }
        />

        {/* 3. PANEL: home-outage */}
        <Panel
          id="outage-protection"
          media={media["home-outage"]}
          tone="dark"
          title="Outage Protection"
          lead="Add Omnigrid to store solar energy and keep your home running when the grid goes down."
          stats={
            <StatRow
              stats={[
                { value: "< 20 ms", label: "Backup Switchover" },
                { value: "14.3 kWh", label: "Usable Storage" },
              ]}
            />
          }
          actions={
            <>
              <Button
                to="/omnigrid"
                variant="primary"
                tone="dark"
                className="w-full sm:w-auto min-w-[200px]"
              >
                Explore Omnigrid
              </Button>
              <Button
                to="/deploy"
                variant="secondary"
                tone="dark"
                className="w-full sm:w-auto min-w-[200px]"
              >
                Design Yours
              </Button>
            </>
          }
        />

        {/* 4. QUIET SECTION: Lower Monthly Power Bills (Savings Calculator) */}
        <QuietSection
          id="savings"
          bg="surface"
          title="Lower Monthly Power Bills"
          lead="See how much solar lowers your monthly power bill across Telangana and Andhra Pradesh."
        >
          <div className="max-w-2xl mx-auto space-y-10">
            {/* Controls: DISCOM select & Bill slider */}
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label htmlFor="discom-select" className="text-[13px] font-medium text-[#5C5E62]">
                  Electricity Board (DISCOM)
                </label>
                <select
                  id="discom-select"
                  value={selectedDiscom}
                  onChange={(e) => setSelectedDiscom(e.target.value)}
                  className="h-10 px-3 bg-[#FFFFFF] border border-[#E3E4E6] rounded-[4px] text-[14px] font-medium text-[#171A20] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#171A20]"
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
                  <span className="text-[18px] font-medium tabular-nums text-[#171A20]">
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
                  <span>₹2,000</span>
                  <span>₹35,000+</span>
                </div>
                <p className="text-[12px] text-[#5C5E62] pt-1.5 text-center leading-normal">
                  * Telangana Gruha Jyothi scheme gives eligible households up to 200 free
                  units/month.
                </p>
              </div>
            </div>

            {/* Big Number Output */}
            <div className="text-center pt-4 border-t border-[#E3E4E6] space-y-2">
              <div className="text-[36px] sm:text-[48px] font-medium tracking-tight tabular-nums text-[#171A20]">
                ₹{formatInr(solarEstimate.annualSavingsInr)}
              </div>
              <div className="text-[13px] text-[#5C5E62]">Estimated Annual Bill Savings</div>
              <p className="text-[14px] text-[#171A20] pt-1">
                Recommended {solarEstimate.recommendedKw} kW system · Estimated ₹
                {formatInr(solarEstimate.subsidyInr)} central subsidy.
              </p>
              <p className="text-[12px] text-[#5C5E62] pt-0.5">
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
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Button
                to="/deploy"
                search={{ bill: monthlyBill, discom: selectedDiscom }}
                variant="primary"
                tone="light"
                className="w-full sm:w-auto min-w-[200px]"
              >
                Design Yours
              </Button>
              <TextLink to="/legal/disclosures" arrow>
                How we calculate
              </TextLink>
            </div>
          </div>
        </QuietSection>

        {/* 5. PANEL: home-heat */}
        <Panel
          id="heat-performance"
          media={media["home-heat"]}
          tone="dark"
          title="Built for Indian Heat"
          lead="N-type TOPCon cells keep producing through hot afternoons and partial shade."
          stats={
            <StatRow
              stats={[
                { value: "-0.30% / °C", label: "Temperature Coeff." },
                { value: "22.8%", label: "Module Efficiency" },
              ]}
            />
          }
          actions={
            <>
              <Button
                onClick={() => setSpecsOpen(true)}
                variant="secondary"
                tone="dark"
                className="w-full sm:w-auto min-w-[200px]"
              >
                View Specs
              </Button>
              <Button
                to="/deploy"
                variant="primary"
                tone="dark"
                className="w-full sm:w-auto min-w-[200px]"
              >
                Design Yours
              </Button>
            </>
          }
        />

        {/* 6. QUIET SECTION: Track Live Generation */}
        <QuietSection
          id="monitoring"
          bg="white"
          title="Track Live Generation"
          lead="Track generation, home consumption, and battery storage in real time through your inverter maker's cloud app."
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
                Design your system
              </TextLink>
            </div>
          </div>
        </QuietSection>

        {/* 7. QUIET SECTION: From Order to Power On */}
        <QuietSection
          id="process"
          bg="surface"
          title="From Order to Power On"
          lead="Turnkey milestone management from DISCOM application to bi-directional meter energization."
        >
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 md:gap-6 pt-4">
            {STEPS.map((step) => (
              <div key={step.num} className="space-y-2">
                <span className="text-[13px] font-medium tabular-nums text-[#5C5E62] block">
                  {step.num}
                </span>
                <h3 className="text-[16px] font-medium text-[#171A20]">{step.title}</h3>
                <p className="text-[13px] text-[#5C5E62] leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </QuietSection>

        {/* 8. QUIET SECTION: Questions & Answers */}
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

        {/* 9. PANEL: home-final */}
        <Panel
          id="consultation"
          media={media["home-final"]}
          tone="dark"
          title="Speak with a Solar Engineer"
          lead="Speak with a solar engineer to review your roof layout, subsidy eligibility, and savings."
          stats={
            <StatRow
              stats={[
                { value: "15 Mins", label: "Virtual Consultation" },
                { value: "₹0", label: "Feasibility Layout" },
              ]}
            />
          }
          actions={
            <>
              <Button
                onClick={() => openConsultationDrawer()}
                variant="primary"
                tone="dark"
                className="w-full sm:w-auto min-w-[200px]"
              >
                Schedule Consultation
              </Button>
              <Button
                to="/deploy"
                variant="secondary"
                tone="dark"
                className="w-full sm:w-auto min-w-[200px]"
              >
                Design Yours
              </Button>
            </>
          }
        />
      </main>

      {/* 10. FOOTER */}
      <Footer />

      {/* Technical Specifications Drawer */}
      <SpecsDrawer open={specsOpen} onOpenChange={setSpecsOpen} />
    </div>
  );
}
