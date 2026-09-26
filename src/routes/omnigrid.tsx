import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import {
  Panel,
  QuietSection,
  StatRow,
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
        href: "/media/omnigrid-hero-1600w.webp",
        media: "(min-width: 768px)",
        type: "image/webp",
      },
      {
        rel: "preload",
        as: "image",
        href: "/media/omnigrid-hero-mobile.webp",
        media: "(max-width: 767px)",
        type: "image/webp",
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
    title: "Battery Storage",
    items: [
      { label: "Usable Capacity", value: `${batteryCap} kWh per unit`, verify: true },
      { label: "Continuous Output", value: `${PRODUCTS_CONFIG.battery.continuousPowerKw} kW` },
      { label: "Peak Output (10s)", value: `${PRODUCTS_CONFIG.battery.peakPowerKw} kW` },
      { label: "Battery Chemistry", value: PRODUCTS_CONFIG.battery.chemistry },
      {
        label: "Round-Trip Efficiency",
        value: `${PRODUCTS_CONFIG.battery.roundTripEfficiencyPct}%`,
      },
    ],
  },
  {
    title: "Operation & Resilience",
    items: [
      { label: "Transfer Speed", value: PRODUCTS_CONFIG.battery.islandingTransferSpeedMs },
      { label: "Ingress Protection", value: PRODUCTS_CONFIG.battery.protectionRating },
      { label: "Operating Temperature", value: PRODUCTS_CONFIG.battery.operatingTempRangeC },
      { label: "Mounting Options", value: PRODUCTS_CONFIG.battery.mounting },
      { label: "Warranty", value: `${PRODUCTS_CONFIG.battery.warrantyYears} Years Comprehensive` },
    ],
  },
];

const LOAD_ITEMS = [
  { id: "wifi", label: "Lights & Wi-Fi", watts: 300 },
  { id: "fridge", label: "Refrigerator & Fans", watts: 800 },
  { id: "ac", label: "1.5 Ton AC", watts: 1800 },
  { id: "heavy", label: "Water Pump / Heavy", watts: 2200 },
];

function OmnigridPage() {
  const [specsOpen, setSpecsOpen] = React.useState(false);
  const [selectedLoads, setSelectedLoads] = React.useState<string[]>(["wifi", "fridge"]);

  const totalWatts = React.useMemo(() => {
    let sum = 0;
    for (const load of LOAD_ITEMS) {
      if (selectedLoads.includes(load.id)) {
        sum += load.watts;
      }
    }
    return Math.max(sum, 150);
  }, [selectedLoads]);

  // Usable kWh * 1000 * 0.9 efficiency factor / total watts
  const backupHours = React.useMemo(() => {
    const hours = (batteryCap * 1000 * 0.9) / totalWatts;
    return hours > 24 ? "24+" : hours.toFixed(1);
  }, [totalWatts]);

  const toggleLoad = (id: string) => {
    setSelectedLoads((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#171A20] selection:bg-[#171A20] selection:text-[#FFFFFF]">
      <Header />

      <main>
        {/* 1. PANEL: omnigrid-hero */}
        <Panel
          id="omnigrid"
          as="h1"
          media={media["omnigrid-hero"]}
          priority={true}
          tone="dark"
          title="Omnigrid"
          lead="Home battery storage engineered for continuous power during grid outages."
          stats={
            <StatRow
              stats={[
                { value: `${batteryCap} kWh`, label: "Usable Capacity" },
                {
                  value: `${PRODUCTS_CONFIG.battery.continuousPowerKw} kW`,
                  label: "Continuous Output",
                },
                { value: `${PRODUCTS_CONFIG.battery.warrantyYears} Years`, label: "Warranty" },
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
                Configure Omnigrid
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
        />

        {/* 2. PANEL: omnigrid-switchover */}
        <Panel
          id="outage-defense"
          media={media["omnigrid-switchover"]}
          tone="dark"
          title="Outage Protection"
          lead="Fast switchover in under 20 milliseconds keeps your entire home running."
          stats={
            <StatRow
              stats={[
                {
                  value: PRODUCTS_CONFIG.battery.islandingTransferSpeedMs,
                  label: "Transfer Speed",
                },
                { value: "24/7", label: "Power Security" },
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
                Configure Omnigrid
              </Button>
              <Button
                onClick={() => setSpecsOpen(true)}
                variant="secondary"
                tone="dark"
                className="w-full sm:w-auto min-w-[200px]"
              >
                View Specs
              </Button>
            </>
          }
        />

        {/* 3. PANEL: omnigrid-night */}
        <Panel
          id="sunset-power"
          media={media["omnigrid-night"]}
          tone="dark"
          title="Use Solar After Sunset"
          lead="Store daytime excess generation to power nighttime air conditioning and appliances."
          stats={
            <StatRow
              stats={[
                { value: "100%", label: "Solar Self-Use" },
                { value: "Zero", label: "Diesel Fumes" },
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
                Configure Omnigrid
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
        />

        {/* 4. ENERGY FLOW: 24-Hour Home Simulation */}
        <QuietSection
          id="flow-simulation"
          bg="white"
          title="24-Hour Solar & Storage Flow"
          lead="See how solar generation, battery storage, and the DISCOM grid interact throughout the day and evening."
        >
          <EnergyFlowSimulator />
        </QuietSection>

        {/* 5. QUIET SECTION: Backup Duration & Honesty Advisor */}
        <QuietSection
          id="estimator"
          bg="surface"
          title="Backup Duration &amp; Honesty Advisor"
          lead="Calculate runtime across real BEE-rated appliances, with transparent payback guidance."
        >
          <div className="max-w-4xl mx-auto space-y-6">
            <BatteryHonestyAdvisor />

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
              <Button
                to="/deploy"
                variant="primary"
                tone="light"
                className="w-full sm:w-auto min-w-[200px]"
              >
                Configure Omnigrid
              </Button>
              <TextLink to="/residential" arrow>
                Learn about solar integration
              </TextLink>
            </div>
          </div>
        </QuietSection>
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
