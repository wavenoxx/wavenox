import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import {
  Panel,
  EditorialFeature,
  SpecsGrid,
  StatRow,
  Button,
  TextLink,
  SpecsDrawer,
  type SpecCategory,
} from "@/components/system";
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
        imageSrcSet: media["res-hero"].mobileAvif,
        imageSizes: "(max-width: 420px) 360px, 100vw",
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

const RESIDENTIAL_SPECS: SpecCategory[] = [
  {
    title: "Modules & Performance",
    items: [
      { label: "Cell Technology", value: "N-Type TOPCon Monocrystalline Bifacial" },
      { label: "Nominal Panel Power", value: "580W DCR (Reference)" },
      { label: "Module Efficiency", value: "22.45% – 22.8% (STC)" },
      { label: "Temperature Coefficient", value: "-0.30% / °C (Pmax)" },
    ],
  },
  {
    title: "Terrace & Structural",
    items: [
      { label: "Pergola Clear Height", value: "7 to 9 ft walkable headroom" },
      { label: "Basic Wind Speed", value: "IS 875 (Part 3) 44 m/s (158 km/h)" },
      {
        label: "Roof Waterproofing",
        value: "Non-penetrating ballasted or chemical-sealed anchors",
      },
      { label: "Structure Material", value: "Anodized 6063-T6 Aluminium & SS304" },
    ],
  },
  {
    title: "Subsidy & Utility",
    items: [
      { label: "PM Surya Ghar DBT", value: "Up to ₹78,000* (3 kW+ eligible homes)" },
      { label: "Grid Connection", value: "Bi-directional DISCOM net-metering" },
      { label: "Compliance", value: "MNRE ALMM Approved & BIS Certified" },
      { label: "Monitoring", value: "OEM Inverter Mobile Portal (Wi-Fi / 4G)" },
    ],
  },
  {
    title: "Warranties",
    items: [
      { label: "Linear Power Output", value: "25 Years OEM (≥ 89.4% at Year 25)" },
      { label: "Module Product Warranty", value: "12 Years OEM Manufacturer Coverage" },
      { label: "Inverter Warranty", value: "10 Years OEM Manufacturer Coverage" },
      { label: "Ingress Protection", value: "IP68 weather-sealed connectors & J-box" },
    ],
  },
];

function ResidentialPage() {
  const [specsOpen, setSpecsOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#171A20] selection:bg-[#171A20] selection:text-[#FFFFFF]">
      <Header />

      <main>
        {/* SEC 0: BOOKEND HERO (16:9 DESKTOP / 4:5 MOBILE) */}
        <Panel
          id="solar-for-homes"
          as="h1"
          media={media["res-hero"]}
          priority={true}
          tone="dark"
          className="scroll-mt-14"
          title="Solar Panels"
          lead="Lower Your Power Bills. Power Your Home."
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

        {/* SEC 1: TERRACE ARCHITECTURE (PURE #FFFFFF EDITORIAL — 16:9 DESKTOP / 4:5 MOBILE) */}
        <EditorialFeature
          id="terrace-design"
          media={media["res-terrace"]}
          title="Designed for Your Terrace"
          lead="Concealed conduit routing and elevated pergola frames protect both roof waterproofing and your outdoor living space—never exposing messy cable trays across your elevation."
          actions={
            <>
              <Button
                to="/deploy"
                variant="primary"
                tone="light"
                className="w-full sm:w-auto sm:min-w-[200px]"
              >
                Get Solar Estimate
              </Button>
              <Button
                onClick={() => setSpecsOpen(true)}
                variant="secondary"
                tone="light"
                className="w-full sm:w-auto sm:min-w-[200px]"
              >
                View Technical Specs
              </Button>
            </>
          }
          cards={[
            {
              metric: "7 to 9 ft",
              title: "Walkable Headroom",
              description:
                "Elevated steel pergola canopies preserve usable shaded terrace floor space beneath overhead bifacial solar modules.",
            },
            {
              metric: "Zero Exposed",
              title: "Concealed Raceways",
              description:
                "DC strings and earthing conductors route neatly along structural channels instead of cutting across visible facade walls.",
            },
            {
              metric: "Slab-Safe",
              title: "Waterproof Anchoring",
              description:
                "Precast ballasted blocks or epoxy-sealed chemical anchors specified after structural waterproofing inspection.",
            },
          ]}
        />

        {/* SEC 2: SEVERE WEATHER & HEAT RESILIENCE */}
        <EditorialFeature
          id="home-resilience"
          media={media["res-weather"]}
          title="Built for Indian Monsoons and 45°C Heat"
          lead="N-Type TOPCon dual-glass modules and structural wind frames engineered for coastal gusts, heavy monsoon rains, and peak Deccan summer temperatures."
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
                Size Your Roof
              </Button>
            </>
          }
          cards={[
            {
              metric: "158 km/h",
              title: "IS 875 Wind Basis",
              description:
                "Engineered to IS 875 (Part 3) 44 m/s structural wind loads with corrosion-resistant anodized aluminium and SS304 hardware.",
            },
            {
              metric: "IP68",
              title: "Monsoon-Sealed",
              description:
                "Dual-tempered glass laminates and weatherproof junction housings shield cells against sustained driving rain and dust.",
            },
            {
              metric: "-0.30%/°C",
              title: "Summer Thermal Yield",
              description:
                "Low temperature coefficient sustains higher midday energy production when residential cooling loads peak.",
            },
          ]}
        />

        {/* SEC 3: COORDINATED JOURNEY */}
        <EditorialFeature
          id="turnkey"
          media={media["home-design"]}
          title="Coordinated Journey, Start to Finish"
          lead="From 3D roof shading analysis and DISCOM net-metering applications to authorized partner installation and PM Surya Ghar documentation, WAVENOX guides every milestone."
          cardColumns={4}
          cards={[
            {
              metric: "01",
              title: "Roof Feasibility",
              description:
                "3D sun-path shading map, parapet setback study, and custom terrace structural plan.",
            },
            {
              metric: "02",
              title: "DISCOM Sanction",
              description:
                "Utility net-metering paperwork, technical feasibility filing, and subsidy portal preparation.",
            },
            {
              metric: "03",
              title: "Precision Install",
              description:
                "Clean rooftop mounting, concealed conduits, earthing, and bi-directional meter commissioning.",
            },
            {
              metric: "04",
              title: "25-Year Support",
              description:
                "Inverter cloud onboarding, subsidy tracking assistance, and 25-year OEM linear warranty backing.",
            },
          ]}
          className="pb-16 sm:pb-24 lg:pb-28"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
            <TextLink to="/deploy" arrow>
              Configure your residential system in Design Studio
            </TextLink>
            <div className="flex flex-wrap items-center gap-6 text-[14px]">
              <Link
                to="/omnigrid"
                className="font-medium text-[#5C5E62] hover:text-[#171A20] transition-colors"
              >
                Solar + Storage →
              </Link>
              <Link
                to="/enterprise"
                className="font-medium text-[#5C5E62] hover:text-[#171A20] transition-colors"
              >
                Commercial Solar →
              </Link>
            </div>
          </div>
        </EditorialFeature>

        {/* SEC 4: DARK #000000 TECHNICAL SPECIFICATIONS */}
        <SpecsGrid
          id="residential-specs"
          title="Residential Solar Specs"
          subtitle="Verified reference specifications for WAVENOX residential rooftop and elevated pergola installations."
          categories={RESIDENTIAL_SPECS}
          footnote="*Central DBT subsidy under MNRE PM Surya Ghar Muft Bijli Yojana (up to ₹78,000 for eligible ≥ 3 kW domestic installations) is subject to national portal approval and DISCOM commissioning."
        />

        {/* SEC 5: BOOKEND CLOSING CTA (16:9 DESKTOP / 4:5 MOBILE) */}
        <Panel
          id="consultation"
          height="closing"
          media={media["home-final"]}
          tone="dark"
          className="scroll-mt-14"
          title="Plan Your Residential Solar System"
          lead="Preview an indicative estimate for your roof online or schedule a consultation to review layout and PM Surya Ghar eligibility."
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
        />
      </main>

      <Footer />

      {/* Technical Specifications Drawer */}
      <SpecsDrawer open={specsOpen} onOpenChange={setSpecsOpen} categories={RESIDENTIAL_SPECS} />
    </div>
  );
}
