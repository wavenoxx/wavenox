import { useState, useMemo } from "react";
import { useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sun,
  Battery,
  Zap,
  ShieldCheck,
  Check,
  Plus,
  Minus,
  Building2,
  Home,
  ArrowRight,
  Sparkles,
  PhoneCall,
  Clock,
  Layers,
  MapPin,
  TrendingUp,
} from "lucide-react";
import { BRAND_CONFIG } from "@/config/brand";
import { BUSINESS } from "@/config/business";
import { DISCOMS, SOLAR_ASSUMPTIONS, SYSTEM_TIERS, estimate } from "@/config/solar";
import { PRODUCTS_CONFIG } from "@/config/products";
import { openConsultationDrawer } from "@/components/ConsultationDrawer";
import { submitLead } from "@/functions/leads";
import { getStoredTelemetry } from "@/lib/telemetry";
import luxurySolarVilla from "@/assets/luxury_solar_villa.jpg";
import resHero02 from "@/assets/res-hero-02.jpg";

// Battery Storage Options (Omnigrid Units)
const BATTERY_OPTIONS = [
  {
    units: 0,
    label: "0 Units (Grid-Tied)",
    capacityKwh: 0,
    priceInr: 0,
    autonomyHours: "0 hrs (Daytime Solar Only)",
    headline:
      "Net-metered export only. Shuts down during utility blackout for anti-islanding safety.",
  },
  {
    units: 1,
    label: `1 Omnigrid (${SOLAR_ASSUMPTIONS.battery.unitCapacityKwh} kWh)`,
    capacityKwh: SOLAR_ASSUMPTIONS.battery.unitCapacityKwh,
    priceInr: SOLAR_ASSUMPTIONS.battery.unitPriceInr,
    autonomyHours: "18+ hrs Essential Backup",
    headline:
      "Powers lighting, WiFi, refrigeration, home automation, and 1 high-tonnage Inverter AC.",
  },
  {
    units: 2,
    label: `2 Omnigrid (${SOLAR_ASSUMPTIONS.battery.unitCapacityKwh * 2} kWh)`,
    capacityKwh: SOLAR_ASSUMPTIONS.battery.unitCapacityKwh * 2,
    priceInr: SOLAR_ASSUMPTIONS.battery.unitPriceInr * 2,
    autonomyHours: "36+ hrs Whole-Home Backup",
    headline:
      "Whole-home luxury backup. Seamless sub-4ms transfer powering 4 Inverter ACs and water pumps.",
    isRecommended: true,
  },
  {
    units: 3,
    label: `3 Omnigrid (${SOLAR_ASSUMPTIONS.battery.unitCapacityKwh * 3} kWh)`,
    capacityKwh: SOLAR_ASSUMPTIONS.battery.unitCapacityKwh * 3,
    priceInr: SOLAR_ASSUMPTIONS.battery.unitPriceInr * 3,
    autonomyHours: "72+ hrs Off-Grid Autonomy",
    headline:
      "Extreme multi-day autonomy. Powers entire estate including 6 ACs, heat pumps, and Level 2 EV charging.",
  },
];

// Roof Profiles for Indian architecture
const ROOF_PROFILES = [
  {
    id: "rcc-flat",
    name: "RCC Flat Slab Terrace",
    desc: "Elevated non-penetrative structural ballast frame with 100% usable terrace walkway beneath.",
    icon: Building2,
  },
  {
    id: "sloped-tile",
    name: "Sloped Mangalore Tile",
    desc: "Concealed interlocking stainless steel tile brackets for seamless architectural flush mounting.",
    icon: Home,
  },
  {
    id: "standing-seam",
    name: "Standing-Seam Metal",
    desc: "Zero-penetration precision mechanical seam clamps, preserving complete factory roof waterproofing.",
    icon: Layers,
  },
];

// Quick Bill Presets
const BILL_PRESETS = [8000, 15000, 25000, 50000];

export function SystemConfigurator() {
  const navigate = useNavigate();

  // Configurator state
  const [address, setAddress] = useState("Jubilee Hills, Hyderabad 500033");
  const [selectedDiscomCode, setSelectedDiscomCode] = useState(DISCOMS[0].code);
  const [monthlyBill, setMonthlyBill] = useState(12000);
  const [panelCount, setPanelCount] = useState(24);
  const [selectedBatteryUnits, setSelectedBatteryUnits] = useState(2);
  const [roofProfile, setRoofProfile] = useState("rcc-flat");
  const [paymentMode, setPaymentMode] = useState<"cash" | "loan">("loan");
  const [estateView, setEstateView] = useState<"villa" | "estate">("villa");

  // Reservation form state
  const [userName, setUserName] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [pinCode, setPinCode] = useState("");
  const [consentGiven, setConsentGiven] = useState(false);
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Selected DISCOM
  const discom = useMemo(() => {
    return DISCOMS.find((d) => d.code === selectedDiscomCode) || DISCOMS[0];
  }, [selectedDiscomCode]);

  // Unified Solar Engine Calculation
  const calculation = useMemo(() => {
    return estimate({
      monthlyBillInr: monthlyBill,
      discomCode: selectedDiscomCode,
      segment: "residential",
      panels: panelCount,
      batteryUnits: selectedBatteryUnits,
      paymentMode,
    });
  }, [monthlyBill, selectedDiscomCode, panelCount, selectedBatteryUnits, paymentMode]);

  const systemKw = calculation.systemKw;
  const annualKwh = calculation.annualGenKwh;
  const monthlyKwh = Math.round(annualKwh / 12);
  const billCoveragePct = calculation.billCoveragePct;
  const subsidyInr = calculation.subsidyInr;
  const netPayableInr = calculation.netInr;
  const totalGrossInr = calculation.grossInr;
  const monthlyEmiInr = calculation.monthlyEmiInr;
  const solarGrossInr = Math.round(systemKw * SOLAR_ASSUMPTIONS.pricePerKwInr);
  const twentyFiveYearWealthInr = calculation.netGain25YearsInr;
  const twentyFiveYearLakhs = (twentyFiveYearWealthInr / 100000).toFixed(1);

  // Sizing matching tier identifier
  const matchingTier = useMemo(() => {
    return SYSTEM_TIERS.find((t) => t.panels === panelCount) || null;
  }, [panelCount]);

  // Battery calculations
  const battery = useMemo(() => {
    return BATTERY_OPTIONS.find((b) => b.units === selectedBatteryUnits) || BATTERY_OPTIONS[2];
  }, [selectedBatteryUnits]);

  // Adjust panel count via buttons
  const handlePanelIncrement = (amount: number) => {
    setPanelCount((prev) => Math.min(60, Math.max(6, prev + amount)));
  };

  // Select a preset tier
  const handleSelectTier = (tierPanels: number) => {
    setPanelCount(tierPanels);
  };

  // Adjust bill slider & auto-suggest tier
  const handleBillChange = (val: number) => {
    setMonthlyBill(val);
    if (val <= 6000) setPanelCount(SYSTEM_TIERS[0].panels);
    else if (val <= 11000) setPanelCount(SYSTEM_TIERS[1].panels);
    else if (val <= 18000) setPanelCount(SYSTEM_TIERS[2].panels);
    else setPanelCount(SYSTEM_TIERS[3].panels);
  };

  // Handle WhatsApp Dossier dispatch
  const handleDispatchWhatsApp = () => {
    const text = encodeURIComponent(
      `*WAVENOX ARCHITECTURAL SOLAR PROPOSAL*\n` +
        `--------------------------------------\n` +
        `*Client:* ${userName || "Architectural Client"}\n` +
        `*Phone:* ${userPhone || "Provided on call"}\n` +
        `*Location:* ${address}\n` +
        `*Utility Board:* ${discom.code} (${discom.state})\n` +
        `*Avg Monthly Bill:* ₹${monthlyBill.toLocaleString("en-IN")}\n` +
        `--------------------------------------\n` +
        `*Configured System Capacity:* ${systemKw} kW (${panelCount} High-Efficiency Modules)\n` +
        `*Annual Yield:* ${annualKwh.toLocaleString("en-IN")} kWh / year\n` +
        `*Omnigrid Storage:* ${battery.label} (${battery.capacityKwh} kWh)\n` +
        `*Roof Architecture:* ${ROOF_PROFILES.find((r) => r.id === roofProfile)?.name}\n` +
        `--------------------------------------\n` +
        `*Gross System Cost:* ₹${totalGrossInr.toLocaleString("en-IN")}\n` +
        `*PM Surya Ghar Central Subsidy:* -₹${subsidyInr.toLocaleString("en-IN")}\n` +
        `*Net Payable Investment:* ₹${netPayableInr.toLocaleString("en-IN")}\n` +
        `*Payment Structure:* ${paymentMode === "loan" ? `5-Year EMI ~₹${monthlyEmiInr.toLocaleString("en-IN")}/mo` : "100% Upfront Direct Purchase"}\n` +
        `*Est. 25-Year Net Savings after System Cost:* ₹${twentyFiveYearLakhs} Lakhs\n\n` +
        `Please provide the technical line diagram (SLD) and book the priority site survey.`,
    );
    window.open(
      `${BRAND_CONFIG.contact.whatsappLink}?text=${text}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  // Handle Instant Proposal Submission
  const handleReserve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consentGiven) {
      setSubmitError("Please confirm your consent to receive your proposal.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const telemetry = getStoredTelemetry();
      const res = await submitLead({
        data: {
          name: userName,
          phone: userPhone,
          city: address,
          pin_code: pinCode.trim() || undefined,
          property_tier: "villa",
          discom_code: selectedDiscomCode,
          monthly_bill_inr: monthlyBill,
          system_kw: systemKw,
          battery_units: selectedBatteryUnits,
          net_price_inr: netPayableInr,
          source: "studio",
          consent_given: true,
          consent_version: "2026-09-v1",
          company_website: companyWebsite.trim() || undefined,
          ...telemetry,
        },
      });

      if (!res.success) {
        setSubmitError(res.message);
        setIsSubmitting(false);
        return;
      }

      navigate({
        to: "/order/received",
        search: { ref: res.referenceCode || "WNX-PROPOSAL" },
      });
    } catch (err: unknown) {
      console.error("[SystemConfigurator] Submit error:", err);
      setSubmitError("Failed to submit proposal request. Please reach us via WhatsApp.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full bg-[#FFFFFF] text-[#171A20]">
      {/* Studio Header Bar */}
      <div className="border-b border-[#E2E8F0] bg-[#FFFFFF] py-6 sm:py-8">
        <div className="mx-auto max-w-7xl px-6 lg:px-12 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-[#10B981] animate-pulse" />
              <span className="text-[11px] font-semibold uppercase tracking-widest text-[#5C5E62]">
                WAVENOX DESIGN STUDIO
              </span>
            </div>
            <h1 className="mt-1 text-2xl sm:text-3xl font-semibold tracking-tight text-[#171A20]">
              Design Your Solar & Storage Architecture
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => openConsultationDrawer("villa")}
              className="btn-secondary text-xs cursor-pointer"
            >
              Request Advisor Call
            </button>
            <a
              href={BRAND_CONFIG.contact.phoneHref}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#171A20] hover:text-[#5C5E62] transition-colors"
            >
              <PhoneCall className="h-3.5 w-3.5" />
              {BRAND_CONFIG.contact.phoneDisplay}
            </a>
          </div>
        </div>
      </div>

      {/* Main Studio Viewport (Dual-Column Split) */}
      <div className="mx-auto max-w-7xl px-6 lg:px-12 py-10 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          {/* =========================================================================
              LEFT COLUMN: Sticky Luxury Architectural Stage & Floating Telemetry Dock
              ========================================================================= */}
          <div className="lg:col-span-5 lg:sticky lg:top-28 space-y-6">
            {/* Visual Estate Card */}
            <div className="relative rounded-2xl overflow-hidden border border-[#E2E8F0] bg-[#171A20] shadow-sm">
              <img
                src={estateView === "villa" ? luxurySolarVilla : resHero02}
                alt="Luxury estate equipped with WAVENOX architectural solar array"
                className="w-full aspect-[4/3] object-cover transition-opacity duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

              {/* View Switcher Pills */}
              <div className="absolute top-4 left-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => setEstateView("villa")}
                  className={`px-3 py-1 rounded-full text-[11px] font-semibold tracking-wide transition-all backdrop-blur-md cursor-pointer ${
                    estateView === "villa"
                      ? "bg-white text-[#171A20]"
                      : "bg-black/50 text-white/80 hover:bg-black/70"
                  }`}
                >
                  Villa Aerial
                </button>
                <button
                  type="button"
                  onClick={() => setEstateView("estate")}
                  className={`px-3 py-1 rounded-full text-[11px] font-semibold tracking-wide transition-all backdrop-blur-md cursor-pointer ${
                    estateView === "estate"
                      ? "bg-white text-[#171A20]"
                      : "bg-black/50 text-white/80 hover:bg-black/70"
                  }`}
                >
                  Estate Terrace
                </button>
              </div>

              {/* Live Overlay Badges */}
              <div className="absolute top-4 right-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/90 text-white text-[11px] font-semibold tracking-wide backdrop-blur-md">
                  <Check className="h-3 w-3" />
                  Net-Metering Compatible
                </span>
              </div>

              {/* Bottom Card Floating Dock */}
              <div className="absolute bottom-0 inset-x-0 p-5 bg-gradient-to-t from-black via-black/80 to-transparent text-white">
                <div className="grid grid-cols-3 gap-2 text-center divide-x divide-white/20">
                  <div>
                    <div className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                      {systemKw} <span className="text-xs font-normal text-white/70">kWp</span>
                    </div>
                    <div className="text-[10px] uppercase tracking-wider text-white/70">
                      Capacity
                    </div>
                  </div>
                  <div>
                    <div className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                      {battery.capacityKwh}{" "}
                      <span className="text-xs font-normal text-white/70">kWh</span>
                    </div>
                    <div className="text-[10px] uppercase tracking-wider text-white/70">
                      Omnigrid Reserve
                    </div>
                  </div>
                  <div>
                    <div className="text-xl sm:text-2xl font-bold tracking-tight text-emerald-400">
                      ~{billCoveragePct}%
                    </div>
                    <div className="text-[10px] uppercase tracking-wider text-white/70">
                      Bill Offset
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Telemetry Summary Pill Box */}
            <div className="rounded-xl border border-[#E2E8F0] bg-[#F8F8FA] p-5 space-y-3">
              <div className="flex items-center justify-between text-xs font-medium text-[#5C5E62]">
                <span className="flex items-center gap-1.5">
                  <Sun className="h-4 w-4 text-[#F57C00]" />
                  Annual Generation
                </span>
                <span className="font-semibold text-[#171A20]">
                  ~{annualKwh.toLocaleString("en-IN")} kWh / yr
                </span>
              </div>
              <div className="flex items-center justify-between text-xs font-medium text-[#5C5E62]">
                <span className="flex items-center gap-1.5">
                  <Zap className="h-4 w-4 text-[#10B981]" />
                  Monthly Clean Power
                </span>
                <span className="font-semibold text-[#171A20]">
                  ~{monthlyKwh.toLocaleString("en-IN")} kWh / month
                </span>
              </div>
              <div className="flex items-center justify-between text-xs font-medium text-[#5C5E62]">
                <span className="flex items-center gap-1.5">
                  <Battery className="h-4 w-4 text-[#171A20]" />
                  Battery Outage Runtime
                </span>
                <span className="font-semibold text-[#171A20]">{battery.autonomyHours}</span>
              </div>
              <div className="pt-2 border-t border-[#E2E8F0] flex items-center justify-between text-xs">
                <span className="font-medium text-[#5C5E62]">
                  25-year savings after system cost
                </span>
                <span className="font-bold text-emerald-700 text-sm">
                  ₹{twentyFiveYearLakhs} Lakhs
                </span>
              </div>
              <p className="text-[11px] text-[#5C5E62] pt-2 border-t border-[#E2E8F0]">
                * Estimate only.{" "}
                <a href="/legal/disclosures" className="underline hover:text-[#171A20]">
                  See how we calculate
                </a>
              </p>
            </div>

            {!PRODUCTS_CONFIG.specsVerified && (
              <p className="text-[11px] text-[#5C5E62] italic px-1">
                {PRODUCTS_CONFIG.indicativeDisclaimer}
              </p>
            )}

            {/* Turnkey Assurance Card */}
            <div className="rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] p-4 flex items-start gap-3 text-xs text-[#5C5E62]">
              <ShieldCheck className="h-5 w-5 text-[#171A20] shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-[#171A20]">Regulatory Support:</span> We prepare
                and file your DISCOM net-metering and PM Surya Ghar applications for you.
              </div>
            </div>
          </div>

          {/* =========================================================================
              RIGHT COLUMN: Interactive Control Deck (6-Step Studio)
              ========================================================================= */}
          <div className="lg:col-span-7 space-y-10">
            {/* -----------------------------------------------------------------------
                STEP 1: Location & Utility Schedule
                ----------------------------------------------------------------------- */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-xs font-semibold uppercase tracking-widest text-[#5C5E62]">
                  STEP 01 / LOCATION & UTILITY
                </div>
                <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  {discom.state} Grid-Tied
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#171A20]">
                Where will your system be deployed?
              </h2>

              {/* Address / PIN Code Input */}
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5C5E62]" />
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter property address or 6-digit PIN code"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] text-sm text-[#171A20] placeholder-[#5C5E62]/50 focus:outline-none focus:border-[#171A20] transition-colors"
                />
              </div>

              {/* State DISCOM Selector */}
              <div>
                <label className="block text-xs font-medium text-[#5C5E62] mb-2">
                  Select State Electricity Distribution Board (DISCOM)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {DISCOMS.map((d) => (
                    <button
                      key={d.code}
                      type="button"
                      onClick={() => setSelectedDiscomCode(d.code)}
                      className={`px-3 py-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                        selectedDiscomCode === d.code
                          ? "border-[#171A20] bg-[#171A20] text-white"
                          : "border-[#E2E8F0] bg-[#FFFFFF] text-[#171A20] hover:border-[#171A20]/30"
                      }`}
                    >
                      <div className="font-semibold">{d.code}</div>
                      <div
                        className={`text-[10px] truncate ${selectedDiscomCode === d.code ? "text-white/70" : "text-[#5C5E62]"}`}
                      >
                        ₹{d.residentialTariffInr}/unit • {d.state}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Monthly Electricity Bill Slider */}
              <div className="pt-2">
                <div className="flex items-baseline justify-between mb-2">
                  <label className="text-xs font-medium text-[#5C5E62]">
                    Average Monthly Electricity Bill
                  </label>
                  <span className="text-lg font-bold text-[#171A20]">
                    ₹{monthlyBill.toLocaleString("en-IN")}{" "}
                    <span className="text-xs font-normal text-[#5C5E62]">/ mo</span>
                  </span>
                </div>
                <input
                  type="range"
                  min="3000"
                  max="75000"
                  step="1000"
                  value={monthlyBill}
                  onChange={(e) => handleBillChange(Number(e.target.value))}
                  className="w-full accent-[#171A20] cursor-pointer"
                />
                <div className="flex justify-between items-center gap-2 mt-3">
                  <span className="text-[11px] text-[#5C5E62]">Quick Presets:</span>
                  <div className="flex gap-1.5 flex-wrap">
                    {BILL_PRESETS.map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => handleBillChange(preset)}
                        className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                          monthlyBill === preset
                            ? "bg-[#171A20] text-white"
                            : "bg-[#EEEEEE] text-[#171A20] hover:bg-[#E2E8F0]"
                        }`}
                      >
                        ₹{(preset / 1000).toFixed(0)}k
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <hr className="border-[#E2E8F0]" />

            {/* -----------------------------------------------------------------------
                STEP 2: System Sizing (4-Tier Matrix + Stepper)
                ----------------------------------------------------------------------- */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-xs font-semibold uppercase tracking-widest text-[#5C5E62]">
                  STEP 02 / SOLAR SYSTEM SIZING
                </div>
                <span className="text-xs font-semibold text-[#171A20]">
                  {panelCount} Panels • {systemKw} kWp
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#171A20]">
                Select System Capacity
              </h2>
              <p className="text-xs sm:text-sm text-[#5C5E62]">
                Our modular sizing architecture ensures complete aesthetic roof coverage and optimal
                offset for your utility bill tier.
              </p>

              {/* 4-Tier Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {SYSTEM_TIERS.map((tier) => (
                  <button
                    key={tier.id}
                    type="button"
                    onClick={() => handleSelectTier(tier.panels)}
                    className={`relative p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                      panelCount === tier.panels
                        ? "border-[#171A20] bg-[#171A20] text-white shadow-sm"
                        : "border-[#E2E8F0] bg-[#FFFFFF] text-[#171A20] hover:border-[#171A20]/30"
                    }`}
                  >
                    {tier.isPopular && (
                      <span
                        className={`absolute -top-2 right-2 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                          panelCount === tier.panels
                            ? "bg-white text-[#171A20]"
                            : "bg-[#171A20] text-white"
                        }`}
                      >
                        Popular
                      </span>
                    )}
                    <div className="text-xs font-semibold">{tier.label}</div>
                    <div className="mt-1 text-base font-bold tracking-tight">
                      {tier.systemKw} <span className="text-[10px] font-normal opacity-70">kW</span>
                    </div>
                    <div
                      className={`mt-1 text-[10px] ${panelCount === tier.panels ? "text-white/70" : "text-[#5C5E62]"}`}
                    >
                      {tier.panels} Panels
                    </div>
                  </button>
                ))}
              </div>

              {/* Custom Panel Stepper */}
              <div className="rounded-xl border border-[#E2E8F0] bg-[#F8F8FA] p-4 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-[#171A20]">Fine-Tune Panel Count</div>
                  <div className="text-[11px] text-[#5C5E62]">
                    Each {SOLAR_ASSUMPTIONS.panelWatt}W module adds{" "}
                    {(SOLAR_ASSUMPTIONS.panelWatt / 1000).toFixed(2)} kWp and ~
                    {Math.round(
                      (SOLAR_ASSUMPTIONS.panelWatt * SOLAR_ASSUMPTIONS.yieldKwhPerKwYear) / 12000,
                    )}{" "}
                    kWh/month.
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handlePanelIncrement(-2)}
                    disabled={panelCount <= 6}
                    className="h-8 w-8 rounded-full border border-[#E2E8F0] bg-white flex items-center justify-center text-[#171A20] hover:bg-[#EEEEEE] disabled:opacity-30 cursor-pointer"
                    aria-label="Decrease panels"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="font-mono text-sm font-bold text-[#171A20] min-w-8 text-center">
                    {panelCount}
                  </span>
                  <button
                    type="button"
                    onClick={() => handlePanelIncrement(2)}
                    disabled={panelCount >= 60}
                    className="h-8 w-8 rounded-full border border-[#E2E8F0] bg-white flex items-center justify-center text-[#171A20] hover:bg-[#EEEEEE] disabled:opacity-30 cursor-pointer"
                    aria-label="Increase panels"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>

            <hr className="border-[#E2E8F0]" />

            {/* -----------------------------------------------------------------------
                STEP 3: Battery Storage (Omnigrid Units)
                ----------------------------------------------------------------------- */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-xs font-semibold uppercase tracking-widest text-[#5C5E62]">
                  STEP 03 / ENERGY STORAGE
                </div>
                <span className="text-xs font-semibold text-[#171A20]">
                  {battery.capacityKwh} kWh Autonomy
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#171A20]">
                Omnigrid Battery Storage Units
              </h2>
              <p className="text-xs sm:text-sm text-[#5C5E62]">
                Stores daytime solar production for zero-interruption power during grid brownouts
                and night peak tariff hours.
              </p>

              {/* Battery Selector Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {BATTERY_OPTIONS.map((opt) => (
                  <button
                    key={opt.units}
                    type="button"
                    onClick={() => setSelectedBatteryUnits(opt.units)}
                    className={`relative p-4 rounded-xl border text-left transition-all cursor-pointer ${
                      selectedBatteryUnits === opt.units
                        ? "border-[#171A20] bg-[#171A20] text-white shadow-sm"
                        : "border-[#E2E8F0] bg-[#FFFFFF] text-[#171A20] hover:border-[#171A20]/30"
                    }`}
                  >
                    {opt.isRecommended && (
                      <span
                        className={`absolute top-3 right-3 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                          selectedBatteryUnits === opt.units
                            ? "bg-white text-[#171A20]"
                            : "bg-[#171A20] text-white"
                        }`}
                      >
                        Recommended
                      </span>
                    )}
                    <div className="text-xs font-semibold">{opt.label}</div>
                    <div className="mt-1 text-sm font-bold">
                      {opt.priceInr === 0
                        ? "Included (Grid-Tie Only)"
                        : `+ ₹${(opt.priceInr / 100000).toFixed(2)} Lakhs`}
                    </div>
                    <div
                      className={`mt-2 text-[11px] leading-relaxed ${
                        selectedBatteryUnits === opt.units ? "text-white/80" : "text-[#5C5E62]"
                      }`}
                    >
                      {opt.autonomyHours}
                    </div>
                  </button>
                ))}
              </div>

              {/* Dynamic Capability Highlight */}
              <div className="rounded-xl bg-[#F8F8FA] border border-[#E2E8F0] p-4 text-xs text-[#5C5E62] flex items-start gap-3">
                <Sparkles className="h-4 w-4 text-[#F57C00] shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-[#171A20]">Outage Autonomy Scope: </span>
                  {battery.headline}
                </div>
              </div>
            </div>

            <hr className="border-[#E2E8F0]" />

            {/* -----------------------------------------------------------------------
                STEP 4: Roof Profile & Mounting Architecture
                ----------------------------------------------------------------------- */}
            <div className="space-y-4">
              <div className="text-xs font-semibold uppercase tracking-widest text-[#5C5E62]">
                STEP 04 / ROOF PROFILE & INTEGRATION
              </div>
              <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#171A20]">
                Architectural Mounting System
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {ROOF_PROFILES.map((prof) => {
                  const Icon = prof.icon;
                  return (
                    <button
                      key={prof.id}
                      type="button"
                      onClick={() => setRoofProfile(prof.id)}
                      className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                        roofProfile === prof.id
                          ? "border-[#171A20] bg-[#171A20] text-white"
                          : "border-[#E2E8F0] bg-[#FFFFFF] text-[#171A20] hover:border-[#171A20]/30"
                      }`}
                    >
                      <Icon className="h-5 w-5 mb-2" />
                      <div className="text-xs font-semibold">{prof.name}</div>
                      <div
                        className={`mt-1 text-[10px] leading-relaxed ${
                          roofProfile === prof.id ? "text-white/70" : "text-[#5C5E62]"
                        }`}
                      >
                        {prof.desc}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <hr className="border-[#E2E8F0]" />

            {/* -----------------------------------------------------------------------
                STEP 5: Transparent Pricing & Financial Model
                ----------------------------------------------------------------------- */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-xs font-semibold uppercase tracking-widest text-[#5C5E62]">
                  STEP 05 / FINANCIAL SUMMARY & SUBSIDY
                </div>
                <span className="text-xs font-bold text-emerald-700">
                  PM Surya Ghar Eligible (Residential)
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#171A20]">
                Transparent Investment & Savings
              </h2>

              {/* Detailed Breakdown Card */}
              <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8F8FA] p-6 space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-[#5C5E62]">
                    Solar Array Hardware & Turnkey Installation ({systemKw} kW)
                  </span>
                  <span className="font-semibold text-[#171A20]">
                    ₹{solarGrossInr.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-[#5C5E62]">
                    Omnigrid Storage Reserve ({battery.capacityKwh} kWh)
                  </span>
                  <span className="font-semibold text-[#171A20]">
                    {battery.priceInr === 0
                      ? "₹0 (Grid-Tie)"
                      : `₹${battery.priceInr.toLocaleString("en-IN")}`}
                  </span>
                </div>
                {subsidyInr > 0 && (
                  <div className="flex justify-between items-center text-sm text-emerald-700 bg-emerald-50 -mx-2 px-2 py-1.5 rounded-lg font-medium">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4" />
                      PM Surya Ghar Central DBT Subsidy Deduction
                    </span>
                    <span className="font-bold">- ₹{subsidyInr.toLocaleString("en-IN")}</span>
                  </div>
                )}
                <div className="pt-3 border-t border-[#E2E8F0] flex justify-between items-baseline">
                  <div>
                    <div className="text-sm font-semibold text-[#171A20]">
                      Net Investment After Subsidy
                    </div>
                    <div className="text-[11px] text-[#5C5E62]">
                      Includes all BIS-certified inverters, mounting, and net-metering liaison
                    </div>
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold tracking-tight text-[#171A20]">
                    ₹{netPayableInr.toLocaleString("en-IN")}
                  </div>
                </div>

                {/* Financing Options Toggle */}
                <div className="pt-3 border-t border-[#E2E8F0]">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#5C5E62]">
                      Payment Structure
                    </span>
                    <div className="flex rounded-full border border-[#E2E8F0] bg-[#EEEEEE] p-0.5">
                      <button
                        type="button"
                        onClick={() => setPaymentMode("loan")}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                          paymentMode === "loan"
                            ? "bg-[#171A20] text-white shadow-sm"
                            : "text-[#5C5E62] hover:text-[#171A20]"
                        }`}
                      >
                        5-Yr Green Loan EMI
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMode("cash")}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                          paymentMode === "cash"
                            ? "bg-[#171A20] text-white shadow-sm"
                            : "text-[#5C5E62] hover:text-[#171A20]"
                        }`}
                      >
                        Cash Purchase
                      </button>
                    </div>
                  </div>

                  {paymentMode === "loan" ? (
                    <div className="rounded-xl bg-white border border-[#E2E8F0] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-[#171A20]">
                            Estimated Monthly EMI:
                          </span>
                          {calculation.emiBelowBill && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                              EMI lower than your bill
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-[#5C5E62]">
                          Indicative 60-month solar financing at 9.5% p.a.
                        </div>
                      </div>
                      <div className="text-right">
                        <div
                          className={`text-xl font-bold ${
                            calculation.emiBelowBill ? "text-emerald-700" : "text-[#171A20]"
                          }`}
                        >
                          ~₹{monthlyEmiInr.toLocaleString("en-IN")}{" "}
                          <span className="text-xs font-normal text-[#5C5E62]">/ mo</span>
                        </div>
                        <div className="text-[10px] text-[#5C5E62]">
                          vs. ₹{monthlyBill.toLocaleString("en-IN")}/mo current bill
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-xl bg-white border border-[#E2E8F0] p-4 text-xs text-[#5C5E62]">
                      Direct 100% turnkey purchase. Estimated simple payback:{" "}
                      <span className="font-semibold text-[#171A20]">
                        {calculation.paybackYears > 0
                          ? `~${calculation.paybackYears} Years`
                          : "3 to 5 Years"}
                      </span>{" "}
                      depending on consumption and DISCOM net-metering tariff.{" "}
                      <a href="/legal/disclosures" className="underline hover:text-[#171A20]">
                        See assumptions
                      </a>
                    </div>
                  )}
                </div>

                <p className="text-[11px] text-[#5C5E62] pt-2">
                  * Estimate only. Final sizing and yield depends on physical roof shading,
                  orientation, and DISCOM sanctions.{" "}
                  <a href="/legal/disclosures" className="underline hover:text-[#171A20]">
                    See how we calculate
                  </a>
                </p>
              </div>
            </div>

            <hr className="border-[#E2E8F0]" />

            {/* -----------------------------------------------------------------------
                STEP 6: Instant Reservation & WhatsApp Dossier
                ----------------------------------------------------------------------- */}
            <div className="space-y-4">
              <div className="text-xs font-semibold uppercase tracking-widest text-[#5C5E62]">
                STEP 06 / REQUEST PROPOSAL
              </div>
              <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#171A20]">
                Request Your System Proposal
              </h2>
              <p className="text-xs sm:text-sm text-[#5C5E62]">
                Receive a personalized solar layout proposal and turnkey feasibility assessment. No
                commitment required.
              </p>

              <form onSubmit={handleReserve} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-[#5C5E62] mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      placeholder="e.g. Dr. Rajesh Reddy"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] bg-white text-xs text-[#171A20] focus:outline-none focus:border-[#171A20]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#5C5E62] mb-1">
                      WhatsApp Number (+91)
                    </label>
                    <input
                      type="tel"
                      required
                      value={userPhone}
                      onChange={(e) => setUserPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] bg-white text-xs text-[#171A20] focus:outline-none focus:border-[#171A20]"
                    />
                  </div>
                </div>

                {/* Honeypot field for bot suppression */}
                <input
                  type="text"
                  name="company_website"
                  value={companyWebsite}
                  onChange={(e) => setCompanyWebsite(e.target.value)}
                  tabIndex={-1}
                  autoComplete="off"
                  className="hidden"
                  aria-hidden="true"
                />

                {/* DPDP Act 2023 Consent Checkbox */}
                <div className="flex items-start gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="studio-consent"
                    required
                    checked={consentGiven}
                    onChange={(e) => setConsentGiven(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-[#E2E8F0] accent-[#171A20] cursor-pointer"
                  />
                  <label
                    htmlFor="studio-consent"
                    className="text-xs text-[#5C5E62] leading-relaxed cursor-pointer"
                  >
                    I agree to receive my customized solar proposal and be contacted by WAVENOX
                    advisors as outlined in the{" "}
                    <a
                      href="/legal/privacy"
                      target="_blank"
                      rel="noreferrer"
                      className="underline hover:text-[#171A20]"
                    >
                      Privacy Policy
                    </a>
                    .
                  </label>
                </div>

                {submitError && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
                    {submitError}
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting || !consentGiven}
                    className="flex-1 btn-primary py-3.5 text-xs font-semibold cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <span>Request my proposal</span>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleDispatchWhatsApp}
                    className="flex-1 btn-secondary py-3.5 text-xs font-semibold cursor-pointer text-center"
                  >
                    Chat on WhatsApp →
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
