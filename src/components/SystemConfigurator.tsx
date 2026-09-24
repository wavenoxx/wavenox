import * as React from "react";
import { useNavigate } from "@tanstack/react-router";
import { Plus, Minus, ShieldCheck, AlertCircle, MessageSquare, CheckCircle2 } from "lucide-react";
import { BRAND_CONFIG } from "@/config/brand";
import { DISCOMS, SOLAR_ASSUMPTIONS, SYSTEM_TIERS, estimate } from "@/config/solar";
import { PRODUCTS_CONFIG } from "@/config/products";
import { openConsultationDrawer } from "@/components/ConsultationDrawer";
import { submitLead } from "@/functions/leads";
import { getStoredTelemetry } from "@/lib/telemetry";
import { Media, StatRow, Button, TextLink } from "@/components/system";
import { media } from "@/config/media";

export interface SystemConfiguratorProps {
  initialBill?: number;
  initialDiscom?: string;
}

const batteryCap = PRODUCTS_CONFIG.battery.usableCapacityKwh;

const BATTERY_OPTIONS = [
  {
    units: 0,
    label: "0 Units",
    sublabel: "Grid-Tied",
    capacityKwh: 0,
    headline: "Net-metered export only. Shuts down during utility blackouts.",
  },
  {
    units: 1,
    label: "1 Unit",
    sublabel: `${batteryCap} kWh`,
    capacityKwh: batteryCap,
    headline: "Powers lighting, Wi-Fi, refrigerator, and 1 inverter air conditioner.",
  },
  {
    units: 2,
    label: "2 Units",
    sublabel: `${(batteryCap * 2).toFixed(1)} kWh`,
    capacityKwh: batteryCap * 2,
    headline: "Whole-home backup. Seamless transfer powering up to 4 air conditioners.",
  },
  {
    units: 3,
    label: "3 Units",
    sublabel: `${(batteryCap * 3).toFixed(1)} kWh`,
    capacityKwh: batteryCap * 3,
    headline: "Multi-day off-grid autonomy for sprawling private estates and EV charging.",
  },
];

const ROOF_PROFILES = [
  {
    id: "rcc-flat",
    label: "RCC Flat Slab",
    desc: "Non-penetrative elevated structural ballast frame.",
  },
  { id: "sloped-tile", label: "Sloped Tile", desc: "Concealed interlocking stainless brackets." },
  { id: "standing-seam", label: "Standing-Seam", desc: "Zero-penetration mechanical seam clamps." },
];

const BILL_PRESETS = [8000, 15000, 25000, 50000];

function formatInr(val: number): string {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(val);
}

export function SystemConfigurator({ initialBill, initialDiscom }: SystemConfiguratorProps) {
  const navigate = useNavigate();

  // State
  const [address, setAddress] = React.useState("");
  const [selectedDiscomCode, setSelectedDiscomCode] = React.useState(
    initialDiscom || DISCOMS[0].code,
  );
  const [monthlyBill, setMonthlyBill] = React.useState(initialBill || 12000);
  const [panelCount, setPanelCount] = React.useState(24);
  const [selectedBatteryUnits, setSelectedBatteryUnits] = React.useState(1);
  const [roofProfile, setRoofProfile] = React.useState("rcc-flat");
  const [paymentMode, setPaymentMode] = React.useState<"cash" | "loan">("loan");
  const [estateView, setEstateView] = React.useState<"villa" | "estate">("villa");

  // Lead Form State
  const [userName, setUserName] = React.useState("");
  const [userPhone, setUserPhone] = React.useState("");
  const [pinCode, setPinCode] = React.useState("");
  const [consentGiven, setConsentGiven] = React.useState(false);
  const [companyWebsite, setCompanyWebsite] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  // Selected DISCOM
  const discom = React.useMemo(() => {
    return DISCOMS.find((d) => d.code === selectedDiscomCode) || DISCOMS[0];
  }, [selectedDiscomCode]);

  // Unified Solar Engine Calculation
  const calculation = React.useMemo(() => {
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
  const subsidyInr = calculation.subsidyInr;
  const netPayableInr = calculation.netInr;
  const totalGrossInr = calculation.grossInr;
  const monthlyEmiInr = calculation.monthlyEmiInr;
  const twentyFiveYearWealthInr = calculation.netGain25YearsInr;
  const twentyFiveYearLakhs = (twentyFiveYearWealthInr / 100000).toFixed(1);

  // Selected battery option
  const battery = React.useMemo(() => {
    return BATTERY_OPTIONS.find((b) => b.units === selectedBatteryUnits) || BATTERY_OPTIONS[1];
  }, [selectedBatteryUnits]);

  // Panel adjustment
  const handlePanelIncrement = (amount: number) => {
    setPanelCount((prev) => Math.min(60, Math.max(6, prev + amount)));
  };

  const handleBillChange = (val: number) => {
    setMonthlyBill(val);
    if (val <= 6000) setPanelCount(SYSTEM_TIERS[0].panels);
    else if (val <= 11000) setPanelCount(SYSTEM_TIERS[1].panels);
    else if (val <= 18000) setPanelCount(SYSTEM_TIERS[2].panels);
    else setPanelCount(SYSTEM_TIERS[3].panels);
  };

  const handleReserve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consentGiven) {
      setSubmitError("Please confirm your consent to receive your proposal.");
      return;
    }

    const cleanPin = pinCode.trim();
    if (!cleanPin || !/^[1-9][0-9]{5}$/.test(cleanPin)) {
      setSubmitError("Please enter a valid 6-digit postal PIN code for DISCOM feasibility (e.g. 500033).");
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

  const activeMedia = estateView === "villa" ? media["res-hero"] : media["studio-estate"];

  return (
    <div className="w-full bg-[#FFFFFF] text-[#171A20]">
      {/* 2-Column Responsive Layout */}
      <div className="flex flex-col lg:flex-row w-full min-h-[calc(100svh-56px)]">
        {/* LEFT COLUMN: 58% Sticky Media Showroom */}
        <div className="w-full lg:w-[58%] relative min-h-[480px] lg:h-[calc(100svh-56px)] lg:sticky lg:top-14 flex flex-col justify-between p-6 sm:p-10 text-[#FFFFFF] overflow-hidden select-none bg-[#171A20]">
          {/* Background image with subtle scrims */}
          <div className="absolute inset-0 z-0 w-full h-full pointer-events-none">
            <Media
              media={activeMedia}
              alt="Architectural residential solar showroom render"
              priority={true}
              fill
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/60 via-black/25 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 h-52 bg-gradient-to-t from-black/75 via-black/35 to-transparent" />
          </div>

          {/* Top Info & View Toggle */}
          <div className="relative flex items-start justify-between gap-4 z-10">
            <div>
              <span className="text-[12px] font-medium uppercase tracking-widest text-[#FFFFFF]/70">
                Design Studio
              </span>
              <h1 className="text-[28px] sm:text-[36px] font-medium tracking-tight leading-tight mt-1">
                System Sizing & Architecture
              </h1>
            </div>

            {/* Estate View Toggle */}
            <div className="inline-flex rounded-[4px] bg-black/40 backdrop-blur-md p-1 border border-white/20">
              <button
                type="button"
                onClick={() => setEstateView("villa")}
                className={`px-3 py-1 rounded-[2px] text-[12px] font-medium transition-colors ${
                  estateView === "villa"
                    ? "bg-[#FFFFFF] text-[#171A20]"
                    : "text-[#FFFFFF]/80 hover:text-white"
                }`}
              >
                Villa
              </button>
              <button
                type="button"
                onClick={() => setEstateView("estate")}
                className={`px-3 py-1 rounded-[2px] text-[12px] font-medium transition-colors ${
                  estateView === "estate"
                    ? "bg-[#FFFFFF] text-[#171A20]"
                    : "text-[#FFFFFF]/80 hover:text-white"
                }`}
              >
                Estate
              </button>
            </div>
          </div>

          {/* Bottom Dock: Live Stats & Disclaimers */}
          <div className="relative z-10 space-y-4 pt-8">
            <StatRow
              align="start"
              stats={[
                {
                  value: `${systemKw} kW`,
                  label: "Solar Capacity",
                  sublabel: `${panelCount} Modules`,
                },
                {
                  value: `₹${formatInr(subsidyInr)}`,
                  label: "Surya Ghar Subsidy",
                  sublabel: "Direct Benefit Transfer",
                },
                {
                  value: `₹${formatInr(calculation.annualSavingsInr)}`,
                  label: "Annual Bill Savings",
                  sublabel: "Tariff Offset",
                },
              ]}
            />
            <p className="text-[12px] text-[#FFFFFF]/60 max-w-xl">
              *Subsidy under PM Surya Ghar Muft Bijli Yojana subject to central portal sanctioning.
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: 42% Scrolling Configurator */}
        <div className="w-full lg:w-[42%] bg-[#FFFFFF] p-6 sm:p-10 lg:p-12 space-y-10 pb-28 lg:pb-16 overflow-y-auto">
          {/* Section 1: DISCOM & Bill */}
          <div className="space-y-4">
            <h2 className="text-[18px] font-medium text-[#171A20]">
              1. Electricity Board & Power Consumption
            </h2>

            <div className="space-y-2">
              <label htmlFor="studio-discom" className="text-[12px] font-medium text-[#5C5E62]">
                State Electricity Distribution Company (DISCOM)
              </label>
              <select
                id="studio-discom"
                value={selectedDiscomCode}
                onChange={(e) => setSelectedDiscomCode(e.target.value)}
                className="w-full h-10 px-3 bg-[#FFFFFF] border border-[#E3E4E6] rounded-[4px] text-[14px] text-[#171A20] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#171A20]"
              >
                {DISCOMS.map((d) => (
                  <option key={d.code} value={d.code}>
                    {d.code} — {d.name} ({d.state})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-baseline">
                <span className="text-[12px] font-medium text-[#5C5E62]">
                  Monthly Electricity Bill
                </span>
                <span className="text-[20px] font-semibold tabular-nums text-[#171A20]">
                  ₹{formatInr(monthlyBill)}
                </span>
              </div>
              <input
                type="range"
                min={3000}
                max={75000}
                step={500}
                value={monthlyBill}
                onChange={(e) => handleBillChange(Number(e.target.value))}
                className="range-slider"
                aria-label="Monthly electricity bill"
              />
              <div className="flex justify-between gap-2 pt-1">
                {BILL_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handleBillChange(preset)}
                    className={`flex-1 py-1 text-[12px] tabular-nums rounded-[4px] border transition-colors ${
                      monthlyBill === preset
                        ? "border-[#171A20] bg-[#171A20] text-[#FFFFFF]"
                        : "border-[#E3E4E6] text-[#5C5E62] hover:border-[#171A20]/40"
                    }`}
                  >
                    ₹{preset >= 1000 ? `${preset / 1000}k` : preset}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 2: Sizing Tiers */}
          <div className="space-y-4 pt-6 border-t border-[#E3E4E6]">
            <div className="flex justify-between items-baseline">
              <h2 className="text-[18px] font-medium text-[#171A20]">2. Sizing Capacity</h2>
              <span className="text-[13px] font-medium tabular-nums text-[#5C5E62]">
                {systemKw} kW ({panelCount} Panels)
              </span>
            </div>

            {/* Sizing Tier Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {SYSTEM_TIERS.map((tier) => {
                const isActive = panelCount === tier.panels;
                return (
                  <button
                    key={tier.id}
                    type="button"
                    onClick={() => setPanelCount(tier.panels)}
                    className={`p-3 text-left rounded-[4px] border transition-all ${
                      isActive
                        ? "border-[#171A20] bg-[#171A20] text-[#FFFFFF]"
                        : "border-[#E3E4E6] bg-[#FFFFFF] text-[#171A20] hover:border-[#171A20]/40"
                    }`}
                  >
                    <div className="text-[13px] font-medium leading-none">{tier.label}</div>
                    <div
                      className={`text-[12px] tabular-nums mt-1 ${isActive ? "text-[#FFFFFF]/70" : "text-[#5C5E62]"}`}
                    >
                      {tier.systemKw} kW
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Micro-adjust panel count */}
            <div className="flex items-center justify-between p-3 rounded-[4px] border border-[#E3E4E6] bg-[#F4F4F4]">
              <span className="text-[12px] text-[#5C5E62]">Custom Panel Count (550W TOPCon)</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handlePanelIncrement(-2)}
                  className="w-8 h-8 rounded-[4px] bg-[#FFFFFF] border border-[#E3E4E6] flex items-center justify-center text-[#171A20] hover:bg-[#EAEAEA] active:bg-[#DFDFDF] transition-colors"
                  aria-label="Decrease panels"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="text-[14px] font-semibold tabular-nums px-2">{panelCount}</span>
                <button
                  type="button"
                  onClick={() => handlePanelIncrement(2)}
                  className="w-8 h-8 rounded-[4px] bg-[#FFFFFF] border border-[#E3E4E6] flex items-center justify-center text-[#171A20] hover:bg-[#EAEAEA] active:bg-[#DFDFDF] transition-colors"
                  aria-label="Increase panels"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Section 3: Omnigrid Battery Storage */}
          <div className="space-y-4 pt-6 border-t border-[#E3E4E6]">
            <div className="flex justify-between items-baseline">
              <h2 className="text-[18px] font-medium text-[#171A20]">3. Omnigrid Storage</h2>
              <span className="text-[13px] font-medium tabular-nums text-[#5C5E62]">
                {battery.capacityKwh} kWh
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {BATTERY_OPTIONS.map((opt) => {
                const isActive = selectedBatteryUnits === opt.units;
                return (
                  <button
                    key={opt.units}
                    type="button"
                    onClick={() => setSelectedBatteryUnits(opt.units)}
                    className={`p-3 text-left rounded-[4px] border transition-all ${
                      isActive
                        ? "border-[#171A20] bg-[#171A20] text-[#FFFFFF]"
                        : "border-[#E3E4E6] bg-[#FFFFFF] text-[#171A20] hover:border-[#171A20]/40"
                    }`}
                  >
                    <div className="text-[13px] font-medium leading-none">{opt.label}</div>
                    <div
                      className={`text-[12px] mt-1 ${isActive ? "text-[#FFFFFF]/70" : "text-[#5C5E62]"}`}
                    >
                      {opt.sublabel}
                    </div>
                  </button>
                );
              })}
            </div>
            <p className="text-[12px] text-[#5C5E62] leading-normal">{battery.headline}</p>
          </div>

          {/* Section 4: Roof Profile */}
          <div className="space-y-4 pt-6 border-t border-[#E3E4E6]">
            <h2 className="text-[18px] font-medium text-[#171A20]">4. Terrace Architecture</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {ROOF_PROFILES.map((prof) => {
                const isActive = roofProfile === prof.id;
                return (
                  <button
                    key={prof.id}
                    type="button"
                    onClick={() => setRoofProfile(prof.id)}
                    className={`p-3 text-left rounded-[4px] border transition-all ${
                      isActive
                        ? "border-[#171A20] bg-[#171A20] text-[#FFFFFF]"
                        : "border-[#E3E4E6] bg-[#FFFFFF] text-[#171A20] hover:border-[#171A20]/40"
                    }`}
                  >
                    <div className="text-[13px] font-medium">{prof.label}</div>
                    <div
                      className={`text-[12px] mt-1 leading-snug ${isActive ? "text-[#FFFFFF]/70" : "text-[#5C5E62]"}`}
                    >
                      {prof.desc}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 5: Payment Structure */}
          <div className="space-y-4 pt-6 border-t border-[#E3E4E6]">
            <h2 className="text-[18px] font-medium text-[#171A20]">5. Investment Structure</h2>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMode("loan")}
                className={`p-3 text-left rounded-[4px] border transition-all ${
                  paymentMode === "loan"
                    ? "border-[#171A20] bg-[#171A20] text-[#FFFFFF]"
                    : "border-[#E3E4E6] bg-[#FFFFFF] text-[#171A20] hover:border-[#171A20]/40"
                }`}
              >
                <div className="text-[13px] font-medium">5-Year Financing</div>
                <div
                  className={`text-[12px] mt-0.5 tabular-nums ${paymentMode === "loan" ? "text-[#FFFFFF]/70" : "text-[#5C5E62]"}`}
                >
                  ~₹{formatInr(monthlyEmiInr)} / mo
                </div>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMode("cash")}
                className={`p-3 text-left rounded-[4px] border transition-all ${
                  paymentMode === "cash"
                    ? "border-[#171A20] bg-[#171A20] text-[#FFFFFF]"
                    : "border-[#E3E4E6] bg-[#FFFFFF] text-[#171A20] hover:border-[#171A20]/40"
                }`}
              >
                <div className="text-[13px] font-medium">Direct Purchase</div>
                <div
                  className={`text-[12px] mt-0.5 tabular-nums ${paymentMode === "cash" ? "text-[#FFFFFF]/70" : "text-[#5C5E62]"}`}
                >
                  100% Upfront
                </div>
              </button>
            </div>

            {/* Financial Breakdown */}
            <div className="p-4 rounded-[4px] border border-[#E3E4E6] bg-[#F4F4F4] space-y-2 text-[13px]">
              <div className="flex justify-between">
                <span className="text-[#5C5E62]">System Equipment & Turnkey Installation</span>
                <span className="font-medium tabular-nums">₹{formatInr(totalGrossInr)}</span>
              </div>
              <div className="flex justify-between text-[#171A20]">
                <span className="text-[#5C5E62]">PM Surya Ghar National Subsidy</span>
                <span className="font-medium tabular-nums">-₹{formatInr(subsidyInr)}</span>
              </div>
              <div className="pt-2 border-t border-[#E3E4E6] flex justify-between items-baseline text-[14px]">
                <span className="font-medium">Net Payable Investment</span>
                <span className="text-[18px] font-semibold tabular-nums">
                  ₹{formatInr(netPayableInr)}
                </span>
              </div>
              <div className="pt-1 flex justify-between text-[12px] text-[#5C5E62]">
                <span>25-Year Est. Net Savings</span>
                <span className="font-medium tabular-nums text-[#171A20]">
                  ₹{twentyFiveYearLakhs} Lakhs
                </span>
              </div>
            </div>
          </div>

          {/* Section 6: Proposal Request Form */}
          <div className="space-y-5 pt-8 border-t border-[#E3E4E6]">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#F57C00] bg-[#F57C00]/10 px-2.5 py-0.5 rounded-[3px]">
                  Bespoke Dossier
                </span>
                <span className="text-[11px] text-[#5C5E62]">· 24-Hour Engineering Review</span>
              </div>
              <h2 className="text-[20px] font-medium tracking-tight text-[#171A20]">
                6. Request Architectural Feasibility Dossier
              </h2>
              <p className="text-[13px] text-[#5C5E62] mt-1 leading-relaxed">
                Our solar structural engineers review rooftop satellite irradiance, shadow profile,
                and DISCOM feeder capacity to generate your custom 3D proposal dossier.
              </p>
            </div>

            <form onSubmit={handleReserve} className="space-y-4">
              {submitError && (
                <div className="p-3.5 rounded-[6px] bg-[#B42318]/10 border border-[#B42318]/30 text-[#B42318] text-[13px] flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}

              <div>
                <label
                  htmlFor="user-name"
                  className="block text-[11px] font-semibold text-[#171A20] uppercase tracking-[0.08em] mb-1.5"
                >
                  Full Name *
                </label>
                <input
                  id="user-name"
                  type="text"
                  required
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="First and last name"
                  className="w-full h-11 px-3.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-[6px] text-[14px] text-[#171A20] placeholder:text-[#9CA3AF] transition-colors focus:bg-[#FFFFFF] focus:border-[#171A20] focus:ring-1 focus:ring-[#171A20] focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="user-phone"
                  className="block text-[11px] font-semibold text-[#171A20] uppercase tracking-[0.08em] mb-1.5"
                >
                  Mobile Phone / WhatsApp (+91) *
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-[13px] font-medium text-[#5C5E62] select-none pointer-events-none border-r border-[#E5E7EB] pr-2.5">
                    +91
                  </span>
                  <input
                    id="user-phone"
                    type="tel"
                    required
                    value={userPhone}
                    onChange={(e) => setUserPhone(e.target.value)}
                    placeholder="10-digit mobile number"
                    maxLength={14}
                    className="w-full h-11 pl-16 pr-3.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-[6px] text-[14px] text-[#171A20] placeholder:text-[#9CA3AF] transition-colors focus:bg-[#FFFFFF] focus:border-[#171A20] focus:ring-1 focus:ring-[#171A20] focus:outline-none tabular-nums"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label
                    htmlFor="user-address"
                    className="block text-[11px] font-semibold text-[#171A20] uppercase tracking-[0.08em] mb-1.5"
                  >
                    City / Locality *
                  </label>
                  <input
                    id="user-address"
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. Hyderabad, Bengaluru"
                    className="w-full h-11 px-3.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-[6px] text-[14px] text-[#171A20] placeholder:text-[#9CA3AF] transition-colors focus:bg-[#FFFFFF] focus:border-[#171A20] focus:ring-1 focus:ring-[#171A20] focus:outline-none"
                  />
                </div>
                <div>
                  <label
                    htmlFor="user-pin"
                    className="block text-[11px] font-semibold text-[#171A20] uppercase tracking-[0.08em] mb-1.5"
                  >
                    6-Digit PIN Code *
                  </label>
                  <input
                    id="user-pin"
                    type="text"
                    required
                    maxLength={6}
                    pattern="[1-9][0-9]{5}"
                    inputMode="numeric"
                    value={pinCode}
                    onChange={(e) => setPinCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="e.g. 500033"
                    className="w-full h-11 px-3.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-[6px] text-[14px] text-[#171A20] placeholder:text-[#9CA3AF] transition-colors focus:bg-[#FFFFFF] focus:border-[#171A20] focus:ring-1 focus:ring-[#171A20] focus:outline-none tabular-nums"
                  />
                </div>
              </div>
              <p className="text-[11px] text-[#5C5E62]/80">
                PIN code is required to verify local DISCOM substation transformer capacity and PM Surya Ghar feeder clearance.
              </p>

              {/* Bot honeypot */}
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

              {/* DPDP Consent */}
              <div className="p-3.5 rounded-[6px] bg-[#F9FAFB] border border-[#E5E7EB] flex items-start gap-3">
                <input
                  type="checkbox"
                  id="studio-consent"
                  required
                  checked={consentGiven}
                  onChange={(e) => setConsentGiven(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded-[4px] border-[#CBD5E1] text-[#171A20] focus:ring-1 focus:ring-[#171A20] cursor-pointer shrink-0"
                />
                <label
                  htmlFor="studio-consent"
                  className="text-[12px] text-[#5C5E62] leading-relaxed cursor-pointer select-none"
                >
                  I consent to receive my bespoke solar proposal and be contacted by WAVENOX solar
                  structural engineers in accordance with the <strong>Digital Personal Data
                  Protection (DPDP) Act 2023</strong>. Zero spam guarantee.
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !consentGiven}
                className="w-full h-12 px-6 rounded-[6px] bg-[#171A20] text-[#FFFFFF] text-[14px] font-medium tracking-[0.02em] hover:bg-[#2B2F36] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ShieldCheck className="w-4 h-4 text-[#F57C00]" />
                <span>
                  {isSubmitting ? "Generating Dossier..." : "Request Engineering Proposal Dossier"}
                </span>
              </button>

              <div className="pt-2 text-center">
                <a
                  href={BRAND_CONFIG.contact.whatsapp.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-[13px] font-medium text-[#5C5E62] hover:text-[#171A20] transition-colors"
                >
                  <MessageSquare className="w-4 h-4 text-[#F57C00]" />
                  <span>Prefer direct advisor assistance? Chat on WhatsApp →</span>
                </a>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Sticky Mobile Bottom Bar */}
      <div className="fixed bottom-0 inset-x-0 z-30 bg-[#FFFFFF] border-t border-[#E3E4E6] px-6 py-3 flex sm:hidden items-center justify-between shadow-lg">
        <div>
          <div className="text-[12px] text-[#5C5E62]">Net Payable</div>
          <div className="text-[16px] font-semibold tabular-nums text-[#171A20]">
            ₹{formatInr(netPayableInr)}
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            const form = document.getElementById("user-name");
            form?.scrollIntoView({ behavior: "smooth" });
            form?.focus();
          }}
          className="h-10 px-5 rounded-[4px] bg-[#171A20] text-[#FFFFFF] text-[14px] font-medium"
        >
          Request Proposal
        </button>
      </div>
    </div>
  );
}
