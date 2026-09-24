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
import { openConsultationDrawer } from "@/components/ConsultationDrawer";

const batteryCap = PRODUCTS_CONFIG.battery.usableCapacityKwh;

export const Route = createFileRoute("/omnigrid")({
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
      { property: "og:image", content: "/media/omnigrid-hero-1600w.jpg" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
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
      { label: "Round-Trip Efficiency", value: `${PRODUCTS_CONFIG.battery.roundTripEfficiencyPct}%` },
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
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#171A20] selection:bg-[#171A20] selection:text-[#FFFFFF]">
      <Header />

      {/* 1. PANEL: omnigrid-hero */}
      <Panel
        id="omnigrid"
        media={media["omnigrid-hero"]}
        priority={true}
        tone="dark"
        title="Omnigrid"
        lead="Home battery storage engineered for continuous power during grid outages."
        stats={
          <StatRow
            stats={[
              { value: `${batteryCap} kWh`, label: "Usable Capacity" },
              { value: `${PRODUCTS_CONFIG.battery.continuousPowerKw} kW`, label: "Continuous Output" },
              { value: `${PRODUCTS_CONFIG.battery.warrantyYears} Years`, label: "Warranty" },
            ]}
          />
        }
        actions={
          <>
            <Button to="/deploy" variant="primary" tone="dark" className="w-full sm:w-auto min-w-[200px]">
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

      {/* 2. PANEL: home-outage */}
      <Panel
        id="outage-defense"
        media={media["home-outage"]}
        tone="dark"
        title="Outage Protection"
        lead="Seamless switchover in under 20 milliseconds keeps your entire home running."
        stats={
          <StatRow
            stats={[
              { value: PRODUCTS_CONFIG.battery.islandingTransferSpeedMs, label: "Transfer Speed" },
              { value: "24/7", label: "Power Security" },
            ]}
          />
        }
        actions={
          <>
            <Button to="/deploy" variant="primary" tone="dark" className="w-full sm:w-auto min-w-[200px]">
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

      {/* 3. PANEL: home-final */}
      <Panel
        id="sunset-power"
        media={media["home-final"]}
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
            <Button to="/deploy" variant="primary" tone="dark" className="w-full sm:w-auto min-w-[200px]">
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

      {/* 4. QUIET SECTION: Backup Duration Estimator */}
      <QuietSection
        id="estimator"
        bg="surface"
        title="Backup Duration Estimator"
        lead="Select your essential loads to see how long a single Omnigrid unit keeps your home running."
      >
        <div className="max-w-2xl mx-auto space-y-10">
          {/* Unboxed Segmented Load Toggles */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {LOAD_ITEMS.map((item) => {
              const active = selectedLoads.includes(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => toggleLoad(item.id)}
                  className={`p-4 rounded-[4px] text-center transition-all cursor-pointer border ${
                    active
                      ? "border-[#171A20] bg-[#171A20] text-[#FFFFFF]"
                      : "border-[#E3E4E6] bg-[#FFFFFF] text-[#171A20] hover:border-[#171A20]/40"
                  }`}
                >
                  <div className="text-[13px] font-medium leading-snug">{item.label}</div>
                  <div className={`text-[12px] mt-1 tabular-nums ${active ? "text-[#FFFFFF]/70" : "text-[#5C5E62]"}`}>
                    ~{item.watts} W
                  </div>
                </button>
              );
            })}
          </div>

          {/* Big Number Display */}
          <div className="text-center pt-4 border-t border-[#E3E4E6] space-y-2">
            <div className="text-[36px] sm:text-[48px] font-medium tracking-tight tabular-nums text-[#171A20]">
              {backupHours} Hours
            </div>
            <div className="text-[13px] text-[#5C5E62]">
              Estimated Backup Duration ({totalWatts} W average load)
            </div>
            <p className="text-[13px] text-[#5C5E62] pt-1">
              Based on {batteryCap} kWh usable capacity at 90% round-trip efficiency. Stack up to 4 units for larger estates.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Button to="/deploy" variant="primary" tone="light" className="w-full sm:w-auto min-w-[200px]">
              Configure Omnigrid
            </Button>
            <TextLink to="/residential" arrow>
              Learn about solar integration
            </TextLink>
          </div>
        </div>
      </QuietSection>

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
