import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Panel, QuietSection, StatRow, Button, TextLink, SpecsDrawer } from "@/components/system";
import { media } from "@/config/media";
import { BRAND_CONFIG } from "@/config/brand";
import { openConsultationDrawer } from "@/lib/consultation";

export const Route = createFileRoute("/residential")({
  staticData: {
    headerTone: "overlay" as const,
  },
  head: () => ({
    meta: [
      { title: `Solar for Homes — ${BRAND_CONFIG.name}` },
      {
        name: "description",
        content:
          "Low-profile residential solar for villas and independent homes in India. PM Surya Ghar subsidies up to ₹78,000, 25-year warranty, and Omnigrid battery backup.",
      },
      { property: "og:title", content: `Solar for Homes — ${BRAND_CONFIG.name}` },
      {
        property: "og:description",
        content:
          "Clean rooftop solar engineered for Indian residential terraces. 25-year warranty and reliable battery backup.",
      },
      { property: "og:image", content: `${BRAND_CONFIG.domain}/media/res-hero-1600w.jpg` },
      { property: "og:url", content: `${BRAND_CONFIG.domain}/residential` },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "canonical", href: `${BRAND_CONFIG.domain}/residential` },
      {
        rel: "preload",
        as: "image",
        type: "image/avif",
        href: media["res-hero"].mobileAvif,
        media: "(max-width: 768px)",
        fetchPriority: "high",
      },
      {
        rel: "preload",
        as: "image",
        type: "image/avif",
        imageSrcSet: media["res-hero"].avif,
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
          "@type": "WebPage",
          name: `${BRAND_CONFIG.name} Residential Solar Architecture`,
          url: `${BRAND_CONFIG.domain}/residential`,
          description:
            "Architectural rooftop solar designed for Indian villas and residences. N-Type TOPCon bifacial modules, terrace pergola structures, IS 875 (Part 3) 44 m/s wind resilience, and PM Surya Ghar subsidy integration.",
        }),
      },
    ],
  }),
  component: ResidentialPage,
});

const RESIDENTIAL_STEPS = [
  {
    num: "01",
    title: "Roof Feasibility",
    desc: "3D shadow mapping and custom terrace layout.",
  },
  {
    num: "02",
    title: "DISCOM Sanction",
    desc: "Net-metering application and utility liaison handled for you.",
  },
  {
    num: "03",
    title: "Coordinated Install",
    desc: "Precision terrace installation fulfilled by authorized solar installation teams.",
  },
  {
    num: "04",
    title: "Ongoing Support",
    desc: "Inverter mobile app telemetry and 25-year OEM linear module warranty.",
  },
];

function ResidentialPage() {
  const [specsOpen, setSpecsOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#171A20] selection:bg-[#171A20] selection:text-[#FFFFFF]">
      <Header />

      <main>
        {/* 1. PANEL: res-hero */}
        <Panel
          id="solar-for-homes"
          as="h1"
          media={media["res-hero"]}
          priority={true}
          tone="dark"
          title="Solar for Homes"
          lead="Clean, reliable power tailored for independent residences and villas."
          stats={
            <StatRow
              stats={[
                { value: "₹78,000", label: "Surya Ghar Subsidy" },
                { value: "25 Years", label: "Linear Warranty" },
                { value: "22.8%", label: "Module Efficiency" },
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
          disclaimer="*Subsidy under PM Surya Ghar Muft Bijli Yojana subject to central portal sanctioning."
        />

        {/* 2. PANEL: res-terrace */}
        <Panel
          id="terrace-design"
          media={media["res-terrace"]}
          tone="dark"
          title="Designed for Your Terrace"
          lead="Concealed mounting and elevated pergolas that protect your outdoor living space."
          stats={
            <StatRow
              stats={[
                { value: "7 to 9 ft", label: "Clear Headroom" },
                { value: "44 m/s", label: "Basic Wind Speed", sublabel: "IS 875 (158 km/h)" },
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
                onClick={() => setSpecsOpen(true)}
                variant="secondary"
                tone="dark"
                className="w-full sm:w-auto min-w-[210px]"
              >
                View Technical Specs
              </Button>
            </>
          }
        />

        {/* 3. PANEL: res-weather */}
        <Panel
          id="home-resilience"
          media={media["res-weather"]}
          tone="dark"
          title="Severe Weather Resilience"
          lead="Engineered to withstand heavy monsoons, cyclone wind gusts, and scorching summer heat."
          stats={
            <StatRow
              stats={[
                { value: "44 m/s", label: "Basic Wind Speed", sublabel: "IS 875 (158 km/h)" },
                { value: "IP68", label: "Water & Dust Proof" },
                { value: "25 Years", label: "Linear Guarantee" },
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
        />

        {/* 4. QUIET SECTION: One Team, Start to Finish */}
        <QuietSection
          id="turnkey"
          bg="surface"
          title="Coordinated Journey, Start to Finish"
          lead="From DISCOM net-metering coordination to authorized partner installation, WAVENOX guides every step."
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 pt-4">
            {RESIDENTIAL_STEPS.map((step) => (
              <div key={step.num} className="space-y-2">
                <span className="text-[13px] font-medium tabular-nums text-[#5C5E62] block">
                  {step.num}
                </span>
                <h3 className="text-[16px] font-medium text-[#171A20]">{step.title}</h3>
                <p className="text-[13px] text-[#5C5E62] leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <TextLink to="/deploy" arrow>
              Configure your residential system
            </TextLink>
          </div>

          {/* Cross-Solution Navigation */}
          <div className="mt-12 pt-8 border-t border-[#E3E4E6] max-w-3xl mx-auto">
            <div className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#5C5E62] text-center mb-4">
              Explore Related WAVENOX Solutions
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
              <Link
                to="/omnigrid"
                className="p-4 rounded-[6px] border border-[#E3E4E6] bg-[#FFFFFF] hover:bg-[#EAEAEA] transition-colors block"
              >
                <div className="text-[14px] font-medium text-[#171A20]">Solar + Storage</div>
                <div className="text-[12px] text-[#5C5E62] mt-0.5">Omnigrid LFP backup</div>
              </Link>
              <Link
                to="/enterprise"
                className="p-4 rounded-[6px] border border-[#E3E4E6] bg-[#FFFFFF] hover:bg-[#EAEAEA] transition-colors block"
              >
                <div className="text-[14px] font-medium text-[#171A20]">Commercial Solar</div>
                <div className="text-[12px] text-[#5C5E62] mt-0.5">Factories &amp; campuses</div>
              </Link>
              <Link
                to="/deploy"
                className="p-4 rounded-[6px] border border-[#E3E4E6] bg-[#FFFFFF] hover:bg-[#EAEAEA] transition-colors block"
              >
                <div className="text-[14px] font-medium text-[#171A20]">Design Studio</div>
                <div className="text-[12px] text-[#5C5E62] mt-0.5">Interactive roof sizing</div>
              </Link>
            </div>
          </div>
        </QuietSection>

        {/* 5. PANEL: home-final */}
        <Panel
          id="consultation"
          media={media["home-final"]}
          tone="dark"
          title="Plan Your Residential Solar System"
          lead="Get an indicative solar estimate for your home or speak with a WAVENOX advisor to review roof layout and subsidy eligibility."
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

      <Footer />

      {/* Technical Specifications Drawer */}
      <SpecsDrawer open={specsOpen} onOpenChange={setSpecsOpen} />
    </div>
  );
}
