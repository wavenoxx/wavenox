import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import {
  Panel,
  EditorialFeature,
  SpecsGrid,
  Button,
  TextLink,
  SpecsDrawer,
  type SpecCategory,
} from "@/components/system";
import { media } from "@/config/media";
import { BRAND_CONFIG } from "@/config/brand";
import { PRODUCTS_CONFIG } from "@/config/products";
import { openConsultationDrawer } from "@/lib/consultation";
import { EnergyFlowSimulator } from "@/components/EnergyFlowSimulator";
import { BatteryHonestyAdvisor } from "@/components/BatteryHonestyAdvisor";

const batteryCap = PRODUCTS_CONFIG.battery.usableCapacityKwh;

export const Route = createFileRoute("/omnigrid")({
  staticData: {
    headerTone: "overlay" as const,
  },
  head: () => ({
    meta: [
      { title: `Omnigrid Clean Energy Storage — ${BRAND_CONFIG.name}` },
      {
        name: "description",
        content: `Whole-home battery storage engineered for Indian grid resilience. ${batteryCap} kWh usable capacity per unit, instant outage switchover, and intelligent peak-tariff shaving.`,
      },
      { property: "og:title", content: `Omnigrid Clean Energy Storage — ${BRAND_CONFIG.name}` },
      {
        property: "og:description",
        content:
          "Whole-home battery energy storage. Instant blackout protection, zero diesel noise, and 100% solar self-consumption.",
      },
      { property: "og:image", content: `${BRAND_CONFIG.domain}/media/omnigrid-hero-1600w.jpg` },
      { property: "og:url", content: `${BRAND_CONFIG.domain}/omnigrid` },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "canonical", href: `${BRAND_CONFIG.domain}/omnigrid` },
      {
        rel: "preload",
        as: "image",
        type: "image/webp",
        imageSrcSet: media["omnigrid-hero"].mobileWebp,
        imageSizes: "(max-width: 420px) 360px, 100vw",
        media: "(max-width: 768px)",
        fetchPriority: "high",
      },
      {
        rel: "preload",
        as: "image",
        type: "image/webp",
        imageSrcSet: media["omnigrid-hero"].webp,
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
          name: `${BRAND_CONFIG.name} Home Clean Energy Storage Architecture`,
          url: `${BRAND_CONFIG.domain}/omnigrid`,
          description: `Whole-home battery storage engineered for Indian grid resilience. ${batteryCap} kWh usable capacity per unit, <20ms instant outage switchover, LiFePO4 chemistry, and 10-year warranty.`,
        }),
      },
    ],
  }),
  component: OmnigridPage,
});

const OMNIGRID_SPECS: SpecCategory[] = [
  {
    title: "Capacity & Output",
    items: [
      { label: "Usable Capacity", value: `${batteryCap} kWh per unit`, verify: true },
      { label: "Scalable Architecture", value: "Up to 42.9 kWh (3 modular units)" },
      { label: "Continuous Output", value: `${PRODUCTS_CONFIG.battery.continuousPowerKw} kW` },
      { label: "Peak Surge Output (10s)", value: `${PRODUCTS_CONFIG.battery.peakPowerKw} kW` },
    ],
  },
  {
    title: "Chemistry & Efficiency",
    items: [
      { label: "Battery Chemistry", value: PRODUCTS_CONFIG.battery.chemistry },
      {
        label: "Round-Trip Efficiency",
        value: `${PRODUCTS_CONFIG.battery.roundTripEfficiencyPct}%`,
      },
      { label: "Cycle Life", value: "6,000+ Cycles (15-year design life)" },
      { label: "Acoustic Profile", value: "Solid-state silent — zero diesel exhaust" },
    ],
  },
  {
    title: "Operation & Resilience",
    items: [
      { label: "Transfer Speed", value: PRODUCTS_CONFIG.battery.islandingTransferSpeedMs },
      { label: "Ingress Protection", value: PRODUCTS_CONFIG.battery.protectionRating },
      { label: "Operating Temperature", value: PRODUCTS_CONFIG.battery.operatingTempRangeC },
      { label: "Mounting Options", value: PRODUCTS_CONFIG.battery.mounting },
    ],
  },
  {
    title: "Warranty & Integration",
    items: [
      { label: "Warranty Coverage", value: `${PRODUCTS_CONFIG.battery.warrantyYears} Years OEM` },
      { label: "Grid Safety", value: "Automatic anti-islanding utility isolation" },
      { label: "Inverter Pairing", value: "Compatible hybrid string inverter" },
      { label: "Monitoring", value: "OEM Inverter Cloud App (Wi-Fi / 4G)" },
    ],
  },
];

function OmnigridPage() {
  const [specsOpen, setSpecsOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#171A20] selection:bg-[#171A20] selection:text-[#FFFFFF]">
      <Header />

      <main>
        {/* SEC 0: BOOKEND HERO (16:9 DESKTOP / 4:5 MOBILE) */}
        <Panel
          id="omnigrid"
          as="h1"
          media={media["omnigrid-hero"]}
          priority={true}
          mobileNaturalFrame={true}
          tone="dark"
          className="scroll-mt-14"
          title="Omnigrid"
          lead="Home Battery Storage for Continuous Power Through Grid Outages."
          actions={
            <>
              <Button
                to="/deploy"
                variant="primary"
                tone="dark"
                className="w-full sm:w-auto sm:min-w-[204px]"
              >
                Configure Storage
              </Button>
              <Button
                onClick={() => openConsultationDrawer()}
                variant="secondary"
                tone="dark"
                className="w-full sm:w-auto sm:min-w-[210px]"
              >
                Book a Consultation
              </Button>
            </>
          }
        />

        {/* SEC 1: AUTOMATIC OUTAGE SWITCHOVER */}
        <EditorialFeature
          id="outage-defense"
          media={media["omnigrid-switchover"]}
          title="Automatic Outage Switchover"
          lead="When utility power drops, the hybrid islanding gateway isolates cleanly from the street feeder and transitions critical home circuits to stored solar in under 20 milliseconds."
          actions={
            <>
              <Button
                to="/deploy"
                variant="primary"
                tone="light"
                className="w-full sm:w-auto sm:min-w-[210px]"
              >
                Configure Solar + Storage
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
              metric: PRODUCTS_CONFIG.battery.islandingTransferSpeedMs,
              title: "UPS-Grade Transfer",
              description:
                "Wi-Fi routers, desktop workstations, and home automation stay online without restarting when the grid trips.",
            },
            {
              metric: "10.0 kW",
              title: "Peak Surge Capacity",
              description:
                "Handles starting currents for 1.5-ton inverter air conditioners, refrigerators, and domestic booster pumps.",
            },
            {
              metric: "Zero Fumes",
              title: "Silent Solid-State",
              description:
                "Replaces noisy diesel generators and acid-fume lead batteries with sealed architectural LiFePO4 modules.",
            },
          ]}
        />

        {/* SEC 2: USE SOLAR AFTER SUNSET */}
        <EditorialFeature
          id="sunset-power"
          media={media["omnigrid-night"]}
          className="deferred-section"
          title="Use Solar After Sunset"
          lead="Store excess midday rooftop generation to power evening air conditioning, lighting, and family spaces cleanly through the night."
          cards={[
            {
              metric: "14.3 – 42.9 kWh",
              title: "Modular Expansion",
              description:
                "Begin with a single 14.3 kWh cabinet and expand cleanly to 28.6 kWh or 42.9 kWh as household loads grow.",
            },
            {
              metric: "Up to 90%",
              title: "Solar Self-Use",
              description:
                "Capture peak afternoon sunshine inside your own reserve for evening appliances and overnight outage protection.",
            },
            {
              metric: "6,000+ Cycles",
              title: "Thermal-Safe LFP",
              description:
                "Lithium Iron Phosphate chemistry delivers superior thermal stability in high-ambient Indian utility rooms.",
            },
          ]}
        />

        {/* SEC 3: 24-HOUR SOLAR & STORAGE FLOW */}
        <EditorialFeature
          id="flow-simulation"
          title="24-Hour Solar & Storage Flow"
          lead="Explore how rooftop solar generation, Omnigrid LiFePO4 storage, household loads, and the DISCOM net-meter coordinate across daylight peaks, evening cooling, and grid outages."
        >
          <EnergyFlowSimulator />
        </EditorialFeature>

        {/* SEC 4: BACKUP DURATION & HONESTY ADVISOR */}
        <EditorialFeature
          id="estimator"
          title="Backup Duration & Honesty Advisor"
          lead="Calculate sustained runtime across real BEE-rated Indian appliances—paired with a transparent net-metering payback statement."
          className="pb-16 sm:pb-24 lg:pb-28"
        >
          <div className="space-y-8">
            <BatteryHonestyAdvisor />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  to="/deploy"
                  variant="primary"
                  tone="light"
                  className="w-full sm:w-auto sm:min-w-[210px]"
                >
                  Configure Solar + Storage
                </Button>
                <Button
                  onClick={() => openConsultationDrawer()}
                  variant="secondary"
                  tone="light"
                  className="w-full sm:w-auto sm:min-w-[200px]"
                >
                  Book a Consultation
                </Button>
              </div>

              <div className="flex flex-wrap items-center gap-6 text-[14px]">
                <Link
                  to="/residential"
                  className="font-medium text-[#5C5E62] hover:text-[#171A20] transition-colors"
                >
                  Solar Panels →
                </Link>
                <Link
                  to="/enterprise"
                  className="font-medium text-[#5C5E62] hover:text-[#171A20] transition-colors"
                >
                  Commercial Solar →
                </Link>
              </div>
            </div>

            <div className="pt-1">
              <TextLink to="/warranty" arrow>
                Review 10-year OEM battery &amp; inverter warranty terms
              </TextLink>
            </div>
          </div>
        </EditorialFeature>

        {/* SEC 5: DARK #000000 OMNIGRID SYSTEM SPECS */}
        <SpecsGrid
          id="omnigrid-specs"
          title="Omnigrid System Specs"
          subtitle="Modular LiFePO4 residential storage and hybrid backup gateway specifications."
          categories={OMNIGRID_SPECS}
          footnote="Backup runtime depends on installed battery capacity, state of charge, inverter configuration, and active household appliance duty cycles."
        />

        {/* SEC 6: BOOKEND CLOSING CTA (16:9 DESKTOP / 4:5 MOBILE) */}
        <Panel
          id="consultation"
          height="closing"
          media={media["home-final"]}
          mobileNaturalFrame={true}
          tone="dark"
          className="scroll-mt-14"
          title="Backup Power Built for Your Home"
          lead="Size your rooftop solar array and Omnigrid storage capacity online or schedule an architectural consultation."
          actions={
            <>
              <Button
                to="/deploy"
                variant="primary"
                tone="dark"
                className="w-full sm:w-auto sm:min-w-[204px]"
              >
                Configure Storage
              </Button>
              <Button
                onClick={() => openConsultationDrawer()}
                variant="secondary"
                tone="dark"
                className="w-full sm:w-auto sm:min-w-[210px]"
              >
                Request Consultation
              </Button>
            </>
          }
        />
      </main>

      <Footer />

      {/* Specifications Drawer */}
      <SpecsDrawer
        open={specsOpen}
        onOpenChange={setSpecsOpen}
        categories={OMNIGRID_SPECS}
        title="Omnigrid Technical Specifications"
      />
    </div>
  );
}
