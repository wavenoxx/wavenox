import { useState, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Check, Shield, Zap, Sparkles, Building, Home, BatteryCharging, ArrowRight, Compass, SunMedium } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { openConsultationDrawer } from "@/components/ConsultationDrawer";
import { BRAND_CONFIG } from "@/config/brand";
import { BUSINESS } from "@/config/business";
import { computeSolarYield, SOLAR_SPECS } from "@/config/solar";
import luxurySolarVilla from "@/assets/luxury_solar_villa.jpg";
import resHero02 from "@/assets/res-hero-02.jpg";
import enterpriseMwRooftop from "@/assets/enterprise_mw_rooftop.jpg";

export const Route = createFileRoute("/deploy")({
  head: () => ({
    meta: [
      { title: `Solar System Configurator & Yield Estimator — ${BRAND_CONFIG.name}` },
      {
        name: "description",
        content:
          "Configure your custom architectural solar system. Select property profile, roof area, and battery storage tier for instant generation and 25-year financial ROI projections.",
      },
      { property: "og:title", content: `Architectural Solar Configurator — ${BRAND_CONFIG.name}` },
      {
        property: "og:description",
        content:
          "Instant solar sizing, PM Surya Ghar subsidy calculation, and luxury estate energy modeling.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: DeployPage,
});

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.3 },
  transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const },
};

const PROPERTY_TYPES = [
  { id: "villa", name: "Luxury Villa", icon: Home, avgSqFt: 3000, desc: "Architectural roof-integrated Liquid Glass" },
  { id: "estate", name: "Private Estate", icon: Building, avgSqFt: 8000, desc: "High-output villa & landscape arrays" },
  { id: "commercial", name: "Commercial Asset", icon: Building, avgSqFt: 25000, desc: "MW-scale corporate roof or carport" },
];

const ROOF_PROFILES = [
  { id: "monolithic", name: "Monolithic Flush Glass", desc: "Seamless obsidian tiles replacing traditional roof" },
  { id: "standing-seam", name: "Standing Seam Clamp", desc: "Zero-penetration clamp on premium metal roofing" },
  { id: "pergola", name: "Elevated Solar Pergola", desc: "Usable outdoor living terrace with bifacial solar canopy" },
];

const BATTERY_TIERS = [
  { id: "grid-tied", name: "Grid-Tied (No Battery)", capKwh: 0, desc: "Net-metering export with existing utility grid" },
  { id: "omnigrid-20", name: "Omnigrid 20 kWh", capKwh: 20, desc: "Essential overnight backup & sub-4ms islanding" },
  { id: "omnigrid-40", name: "Omnigrid 40 kWh Dual", capKwh: 40, desc: "Full-estate autonomy during prolonged grid failure" },
  { id: "omnigrid-100", name: "Omnigrid 100 kWh Industrial", capKwh: 100, desc: "Heavy commercial 3-phase high-discharge storage" },
];

function DeployPage() {
  const [selectedCity, setSelectedCity] = useState(BUSINESS.primaryCity);
  const [propertyType, setPropertyType] = useState("villa");
  const [roofProfile, setRoofProfile] = useState("monolithic");
  const [roofArea, setRoofArea] = useState(3000);
  const [batteryTier, setBatteryTier] = useState("omnigrid-20");

  const metrics = useMemo(() => {
    return computeSolarYield({
      roofAreaSqFt: roofArea,
      tariffRatePerKwh: propertyType === "commercial" ? 9.5 : 8.0,
    });
  }, [roofArea, propertyType]);

  const subsidyInr = metrics.estimatedSubsidyInr;
  const twentyFiveYearLakhs = (metrics.twentyFiveYearNetSavingsInr / 100000).toFixed(1);

  const previewImage =
    propertyType === "villa"
      ? luxurySolarVilla
      : propertyType === "estate"
      ? resHero02
      : enterpriseMwRooftop;

  const handleLaunchConsultation = () => {
    openConsultationDrawer(
      propertyType === "villa" ? "villa" : propertyType === "estate" ? "estate" : "commercial"
    );
  };

  const handleDirectWhatsApp = () => {
    const text = encodeURIComponent(
      `Hello ${BRAND_CONFIG.name}, I configured a custom solar system on your website:\n\n` +
      `• City: ${selectedCity}\n` +
      `• Property: ${propertyType.toUpperCase()}\n` +
      `• Roof Architecture: ${roofProfile.toUpperCase()}\n` +
      `• Usable Roof Area: ${roofArea.toLocaleString("en-IN")} sq.ft\n` +
      `• Array Capacity: ${metrics.capacityKw.toFixed(1)} kWp\n` +
      `• Storage Tier: ${batteryTier}\n` +
      `• Estimated 25-Yr Net Gain: ₹${twentyFiveYearLakhs} Lakhs\n\n` +
      `Please provide a formal architectural proposal and feasibility survey.`
    );
    window.open(`${BRAND_CONFIG.contact.whatsappLink}?text=${text}`, "_blank", "noopener,noreferrer");
  };

  return (
    <main className="min-h-screen w-full bg-black">
      <Header />
      
      <section className="relative min-h-screen w-full bg-black pt-28 pb-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          {/* Header */}
          <motion.div {...fadeUp} className="text-center max-w-3xl mx-auto pt-6">
            <span className="font-mono text-xs uppercase tracking-[0.3em] text-[#F57C00]">
              SYSTEM CONFIGURATOR
            </span>
            <h1 className="mt-4 text-4xl font-bold uppercase leading-[1.05] tracking-tight text-white md:text-6xl">
              DESIGN YOUR ENERGY SOVEREIGNTY
            </h1>
            <p className="mt-4 text-sm text-white/60 md:text-base">
              Customize roof geometry, battery reserves, and city deployment hub for instantaneous engineering metrics.
            </p>
          </motion.div>

          <div className="mt-16 grid grid-cols-1 gap-12 lg:grid-cols-12">
            {/* Left: Configuration Controls (Col 7) */}
            <div className="lg:col-span-7 space-y-10">
              {/* Step 1: Location */}
              <div className="border border-white/10 bg-white/[0.02] p-8">
                <span className="font-mono text-xs uppercase tracking-widest text-[#F57C00]">
                  STEP 01 / DEPLOYMENT HUB
                </span>
                <h3 className="mt-2 text-xl font-bold uppercase text-white">
                  Select Operating Region
                </h3>
                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {BUSINESS.serviceHubs.map((hub) => (
                    <button
                      key={hub.city}
                      type="button"
                      onClick={() => setSelectedCity(hub.city)}
                      className={`cursor-pointer rounded-lg border p-3.5 text-left transition-all duration-300 ${
                        selectedCity === hub.city
                          ? "border-[#F57C00] bg-[#F57C00]/10 text-white"
                          : "border-white/10 bg-black/40 text-white/70 hover:border-white/30"
                      }`}
                    >
                      <div className="text-xs font-bold uppercase">{hub.city}</div>
                      <div className="text-[10px] text-white/50">{hub.state}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 2: Property Type & Sizing */}
              <div className="border border-white/10 bg-white/[0.02] p-8">
                <span className="font-mono text-xs uppercase tracking-widest text-[#F57C00]">
                  STEP 02 / PROPERTY ASSET TIER
                </span>
                <h3 className="mt-2 text-xl font-bold uppercase text-white">
                  Property Classification
                </h3>
                <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {PROPERTY_TYPES.map((pt) => {
                    const Icon = pt.icon;
                    return (
                      <button
                        key={pt.id}
                        type="button"
                        onClick={() => {
                          setPropertyType(pt.id);
                          setRoofArea(pt.avgSqFt);
                        }}
                        className={`cursor-pointer rounded-lg border p-4 text-left transition-all duration-300 ${
                          propertyType === pt.id
                            ? "border-[#F57C00] bg-[#F57C00]/10 text-white"
                            : "border-white/10 bg-black/40 text-white/70 hover:border-white/30"
                        }`}
                      >
                        <Icon className="h-5 w-5 text-[#F57C00]" />
                        <div className="mt-3 text-xs font-bold uppercase">{pt.name}</div>
                        <div className="mt-1 text-[10px] text-white/50">{pt.desc}</div>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-10">
                  <div className="flex justify-between items-baseline">
                    <label className="text-xs font-mono uppercase tracking-widest text-white/70">
                      Estimated Usable Roof Footprint
                    </label>
                    <span className="font-mono text-base font-bold text-[#F57C00]">
                      {roofArea.toLocaleString("en-IN")} sq.ft
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1000"
                    max={propertyType === "commercial" ? 50000 : 15000}
                    step="500"
                    value={roofArea}
                    onChange={(e) => setRoofArea(Number(e.target.value))}
                    className="mt-6 w-full accent-[#F57C00] cursor-pointer"
                  />
                </div>
              </div>

              {/* Step 3: Roof Architecture Style */}
              <div className="border border-white/10 bg-white/[0.02] p-8">
                <span className="font-mono text-xs uppercase tracking-widest text-[#F57C00]">
                  STEP 03 / ROOF ARCHITECTURAL PROFILE
                </span>
                <h3 className="mt-2 text-xl font-bold uppercase text-white">
                  Integration Style
                </h3>
                <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {ROOF_PROFILES.map((rp) => (
                    <button
                      key={rp.id}
                      type="button"
                      onClick={() => setRoofProfile(rp.id)}
                      className={`cursor-pointer rounded-lg border p-4 text-left transition-all duration-300 ${
                        roofProfile === rp.id
                          ? "border-[#F57C00] bg-[#F57C00]/10 text-white"
                          : "border-white/10 bg-black/40 text-white/70 hover:border-white/30"
                      }`}
                    >
                      <div className="text-xs font-bold uppercase text-white">{rp.name}</div>
                      <div className="mt-1 text-[10px] text-white/50 leading-relaxed">{rp.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 4: Energy Storage Tier */}
              <div className="border border-white/10 bg-white/[0.02] p-8">
                <span className="font-mono text-xs uppercase tracking-widest text-[#F57C00]">
                  STEP 04 / OMNIGRID STORAGE TIER
                </span>
                <h3 className="mt-2 text-xl font-bold uppercase text-white">
                  Battery Autonomy Reserve
                </h3>
                <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {BATTERY_TIERS.map((bt) => (
                    <button
                      key={bt.id}
                      type="button"
                      onClick={() => setBatteryTier(bt.id)}
                      className={`cursor-pointer rounded-lg border p-4 text-left transition-all duration-300 ${
                        batteryTier === bt.id
                          ? "border-[#F57C00] bg-[#F57C00]/10 text-white"
                          : "border-white/10 bg-black/40 text-white/70 hover:border-white/30"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold uppercase text-white">{bt.name}</span>
                        {batteryTier === bt.id && <Check className="h-4 w-4 text-[#F57C00]" />}
                      </div>
                      <div className="mt-1 text-[11px] text-white/50">{bt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Live Reactive Proposal Summary (Col 5) */}
            <div className="lg:col-span-5">
              <div className="sticky top-28 border border-[#F57C00]/40 bg-black overflow-hidden relative">
                {/* Visual Estate Render Preview Card */}
                <div className="relative aspect-[16/10] w-full overflow-hidden border-b border-white/10 bg-black">
                  <img
                    src={previewImage}
                    alt="Configured estate architectural render"
                    className="h-full w-full object-cover transition-all duration-700"
                    loading="lazy"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/30" />
                  <div className="absolute bottom-3 left-3 rounded-full bg-black/80 px-3 py-1 text-[10px] font-mono uppercase tracking-wider text-white backdrop-blur-md border border-white/10">
                    {propertyType.toUpperCase()} • {roofArea.toLocaleString("en-IN")} SQ.FT
                  </div>
                </div>

                <div className="p-8 md:p-10 relative">
                  <div className="absolute top-0 right-0 h-48 w-48 bg-[#F57C00]/10 blur-3xl pointer-events-none" />

                  <span className="font-mono text-xs uppercase tracking-[0.25em] text-[#F57C00]">
                    ESTIMATED SYSTEM DOSSIER
                  </span>
                  <h3 className="mt-2 text-2xl font-bold uppercase text-white">
                    {BRAND_CONFIG.name} Architecture
                  </h3>

                  <div className="mt-8 space-y-4 border-t border-b border-white/10 py-6">
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs font-mono uppercase text-white/60">Deployment Hub</span>
                      <span className="font-mono text-sm font-bold text-white">{selectedCity}</span>
                    </div>
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs font-mono uppercase text-white/60">Roof Profile</span>
                      <span className="font-mono text-xs font-bold text-[#F57C00]">
                        {ROOF_PROFILES.find((r) => r.id === roofProfile)?.name}
                      </span>
                    </div>
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs font-mono uppercase text-white/60">Estimated System Capacity</span>
                      <span className="font-mono text-lg font-bold text-white">
                        {metrics.capacityKw.toFixed(1)} kWp
                      </span>
                    </div>
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs font-mono uppercase text-white/60">Annual Energy Output</span>
                      <span className="font-mono text-sm font-bold text-white">
                        {Math.round(metrics.annualUnitsGenerated).toLocaleString("en-IN")} kWh / yr
                      </span>
                    </div>
                    {subsidyInr > 0 && (
                      <div className="flex justify-between items-baseline">
                        <span className="text-xs font-mono uppercase text-emerald-400">
                          PM Surya Ghar Subsidy
                        </span>
                        <span className="font-mono text-sm font-bold text-emerald-400">
                          ₹{subsidyInr.toLocaleString("en-IN")} Direct Credit
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between items-baseline pt-2 border-t border-white/10">
                      <span className="text-xs font-mono uppercase text-[#F57C00]">
                        25-Year Estimated Net Return
                      </span>
                      <span className="font-mono text-2xl font-bold text-[#F57C00]">
                        ₹{twentyFiveYearLakhs} Lakhs
                      </span>
                    </div>
                  </div>

                  <div className="mt-8 space-y-3">
                    <button
                      type="button"
                      onClick={handleLaunchConsultation}
                      className="w-full cursor-pointer rounded-full bg-[#F57C00] py-4 text-xs font-bold uppercase tracking-[0.25em] text-black transition-all duration-300 hover:bg-white"
                    >
                      BOOK SITE ARCHITECTURAL AUDIT →
                    </button>
                    <button
                      type="button"
                      onClick={handleDirectWhatsApp}
                      className="w-full cursor-pointer rounded-full border border-white/20 bg-white/[0.04] py-3.5 text-xs font-bold uppercase tracking-[0.25em] text-white transition-all duration-300 hover:bg-white hover:text-black"
                    >
                      DISPATCH VIA WHATSAPP →
                    </button>
                  </div>

                  <p className="mt-6 text-[11px] leading-relaxed text-center text-white/40">
                    Includes 25-Year Generational Warranty and 100% turnkey grid net-metering approvals.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
