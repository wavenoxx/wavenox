import { useState, useMemo } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Factory,
  Building2,
  Warehouse,
  Car,
  TrendingUp,
  ShieldCheck,
  Zap,
  ArrowRight,
  Sparkles,
  Check,
  FileSpreadsheet,
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { openConsultationDrawer } from "@/components/ConsultationDrawer";
import { BRAND_CONFIG } from "@/config/brand";
import { submitLead } from "@/functions/leads";
import { getStoredTelemetry } from "@/lib/telemetry";
import enterpriseMwRooftop from "@/assets/enterprise_mw_rooftop.jpg";
import lgScale from "@/assets/lg-scale.jpg";
import defGrid from "@/assets/def-grid.jpg";
import eco01Grid from "@/assets/eco-01-grid.jpg";

export const Route = createFileRoute("/enterprise")({
  head: () => ({
    meta: [
      { title: `Commercial & Industrial Megawatt Solar — ${BRAND_CONFIG.name}` },
      {
        name: "description",
        content:
          "Turn idle industrial rooftops into high-yield capital assets. 40% accelerated tax depreciation under Section 32, zero-downtime microgrids, and 25-year OEM-backed linear warranties.",
      },
      {
        property: "og:title",
        content: `Commercial & Industrial Megawatt Solar — ${BRAND_CONFIG.name}`,
      },
      {
        property: "og:description",
        content:
          "Megawatt-scale rooftop infrastructure, corporate ESG compliance, and 40% Section 32 tax write-offs.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: EnterprisePage,
});

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.25 },
  transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const },
};

const SECTORS = [
  {
    icon: Factory,
    title: "Heavy Manufacturing & Automotive",
    desc: "300 kW to 5 MW captive installations engineered for continuous 3-phase inductive machinery, heavy peak load shaving, and zero power factor penalties.",
    image: lgScale,
  },
  {
    icon: Building2,
    title: "Corporate IT Parks & Towers",
    desc: "High-efficiency bifacial glass rooftop installations designed with zero glare for aviation safety and seamless integration into corporate ESG disclosures.",
    image: defGrid,
  },
  {
    icon: Warehouse,
    title: "Logistics & Cold Storage Hubs",
    desc: "Non-penetrative seam clamp systems engineered for expansive PEB sheet rooftops, offsetting 24/7 refrigeration power requirements.",
    image: enterpriseMwRooftop,
  },
  {
    icon: Car,
    title: "Enterprise Solar EV Carports",
    desc: "Architectural dual-purpose parking canopies generating clean megawatt energy while offering shaded parking and Level 3 DC fast-charging for employee and fleet EVs.",
    image: eco01Grid,
  },
];

function EnterprisePage() {
  const navigate = useNavigate();

  // Commercial Calculator State
  const [roofAreaSqFt, setRoofAreaSqFt] = useState(50000);
  const [commercialTariff, setCommercialTariff] = useState(10.5);

  // RFP Form State
  const [clientName, setClientName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [phone, setPhone] = useState("");
  const [consentGiven, setConsentGiven] = useState(false);
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Math model
  // 100 sq.ft generates approx 1 kWp of commercial solar
  const capacityKw = useMemo(() => Math.round(roofAreaSqFt / 100), [roofAreaSqFt]);
  const capacityMw = useMemo(() => (capacityKw / 1000).toFixed(2), [capacityKw]);
  const annualUnitsKwh = useMemo(() => Math.round(capacityKw * 1550), [capacityKw]);
  const annualSavingsInr = useMemo(
    () => Math.round(annualUnitsKwh * commercialTariff),
    [annualUnitsKwh, commercialTariff],
  );

  // Capex approx ₹42,000 per kW for commercial megawatt scale
  const estCapexInr = useMemo(() => Math.round(capacityKw * 42000), [capacityKw]);
  // 40% Section 32 tax depreciation in Year 1 (assuming corporate tax rate ~25.17%)
  const year1TaxShieldInr = useMemo(() => Math.round(estCapexInr * 0.4 * 0.2517), [estCapexInr]);
  const twentyFiveYearNetInr = useMemo(
    () => Math.round(annualSavingsInr * 25 - estCapexInr),
    [annualSavingsInr, estCapexInr],
  );
  const estPaybackYears = useMemo(
    () => (estCapexInr / Math.max(1, annualSavingsInr)).toFixed(1),
    [estCapexInr, annualSavingsInr],
  );
  const twentyFiveYearCrores = (twentyFiveYearNetInr / 10000000).toFixed(2);

  const handleSubmitRfp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consentGiven) {
      setSubmitError("Please confirm your consent to receive your commercial proposal.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const telemetry = getStoredTelemetry();
      const res = await submitLead({
        data: {
          name: clientName,
          phone,
          city: companyName ? `${companyName} Facility` : "Industrial Rooftop",
          property_tier: "commercial",
          roof_area_sqft: roofAreaSqFt,
          system_kw: capacityKw,
          net_price_inr: estCapexInr,
          source: "enterprise",
          notes: `RFP configured for ${roofAreaSqFt.toLocaleString("en-IN")} sq.ft (~${capacityMw} MWp). Commercial Tariff: ₹${commercialTariff}/unit.`,
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
        search: { ref: res.referenceCode || "WNX-ENTERPRISE" },
      });
    } catch (err: unknown) {
      console.error("[EnterprisePage] RFP submit error:", err);
      setSubmitError("Failed to submit commercial RFP. Please reach us via WhatsApp.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWhatsAppRfp = () => {
    const text = encodeURIComponent(
      `*WAVENOX COMMERCIAL & INDUSTRIAL MEGAWATT RFP*\n` +
        `--------------------------------------\n` +
        `*Organization:* ${companyName || "Industrial Client"}\n` +
        `*Representative:* ${clientName || "Executive"}\n` +
        `*Roof Area:* ${roofAreaSqFt.toLocaleString("en-IN")} sq.ft\n` +
        `*Estimated Capacity:* ${capacityMw} MWp (${capacityKw} kWp)\n` +
        `*Commercial Tariff:* ₹${commercialTariff} / kWh\n` +
        `*Estimated Annual Generation:* ${annualUnitsKwh.toLocaleString("en-IN")} kWh / yr\n` +
        `*Section 32 Year 1 Tax Shield:* ₹${(year1TaxShieldInr / 100000).toFixed(1)} Lakhs\n` +
        `*25-Year Corporate Net Gain:* ₹${twentyFiveYearCrores} Crores\n` +
        `--------------------------------------\n` +
        `We require a formal corporate feasibility survey and PPA / CAPEX financial comparison.`,
    );
    window.open(
      `${BRAND_CONFIG.contact.whatsappLink}?text=${text}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  return (
    <div className="min-h-screen w-full bg-[#FFFFFF] text-[#171A20] selection:bg-[#171A20] selection:text-white">
      <Header />

      {/* =========================================================================
          HERO: 100vh Full-Bleed Megawatt Industrial Rooftop
          ========================================================================= */}
      <section className="relative min-h-screen w-full overflow-hidden bg-[#171A20]">
        <img
          src={enterpriseMwRooftop}
          alt="Megawatt commercial solar array on corporate industrial headquarters"
          className="absolute inset-0 h-full w-full object-cover opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/50" />

        <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col items-center justify-between px-6 pt-32 pb-16 text-center lg:px-12">
          {/* Centered Typography */}
          <div className="my-auto max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className="text-xs font-semibold uppercase tracking-[0.25em] text-white/75">
                COMMERCIAL & INDUSTRIAL SOLAR INFRASTRUCTURE
              </span>
              <h1 className="mt-3 text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-white">
                Commercial Megawatt Solar
              </h1>
              <p className="mt-4 text-base sm:text-lg text-white/80 font-normal max-w-2xl mx-auto leading-relaxed">
                Turn idle factory and corporate rooftops into high-yield capital assets. Slash
                electricity tariffs by up to 80% while claiming 40% accelerated tax depreciation
                under Section 32.
              </p>
            </motion.div>
          </div>

          {/* Bottom Floating Specs Dock & Dual Pills */}
          <div className="w-full max-w-4xl space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="grid grid-cols-3 gap-4 text-center divide-x divide-white/20 text-white py-4 backdrop-blur-md bg-black/40 rounded-2xl border border-white/10"
            >
              <div>
                <div className="text-2xl sm:text-3xl font-semibold tracking-tight">
                  300 kW – 5 MW+
                </div>
                <div className="text-[11px] sm:text-xs text-white/70 uppercase tracking-wider mt-0.5">
                  Deployment Scale
                </div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-semibold tracking-tight text-emerald-400">
                  40%
                </div>
                <div className="text-[11px] sm:text-xs text-white/70 uppercase tracking-wider mt-0.5">
                  Sec 32 Tax Shield
                </div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-semibold tracking-tight">~3–4 Years</div>
                <div className="text-[11px] sm:text-xs text-white/70 uppercase tracking-wider mt-0.5">
                  CAPEX Payback
                </div>
              </div>
            </motion.div>

            {/* Dual CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <button
                type="button"
                onClick={() => openConsultationDrawer("commercial")}
                className="btn-primary w-full sm:w-auto text-sm cursor-pointer"
              >
                Commission MW Feasibility Study
              </button>
              <a
                href="#commercial-calculator"
                className="btn-glass w-full sm:w-auto text-sm cursor-pointer"
              >
                Calculate Commercial ROI ↓
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: High-Yield Corporate Benefits (Pure White #FFFFFF)
          ========================================================================= */}
      <section className="w-full bg-[#FFFFFF] py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <motion.div {...fadeUp} className="max-w-3xl mx-auto text-center space-y-4">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#5C5E62]">
              FINANCIAL ENGINEERING
            </span>
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#171A20]">
              Capital Allocation for India's Industrial Leaders
            </h2>
            <p className="text-sm sm:text-base text-[#5C5E62]">
              Rooftop solar is no longer just a sustainability pledge; it is one of the highest
              internal rate of return (IRR) balance sheet investments available to Indian
              enterprises today.
            </p>
          </motion.div>

          <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div
              {...fadeUp}
              className="p-6 rounded-2xl border border-[#E2E8F0] bg-[#F8F8FA] space-y-3"
            >
              <div className="h-10 w-10 rounded-xl bg-[#171A20] text-white flex items-center justify-center">
                <FileSpreadsheet className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-[#171A20]">
                40% Accelerated Tax Depreciation
              </h3>
              <p className="text-xs text-[#5C5E62] leading-relaxed">
                Under Section 32 of the Indian Income Tax Act, write off 40% of the entire solar
                capital expenditure in Year 1, creating immediate balance sheet cash tax shields.
              </p>
            </motion.div>

            <motion.div
              {...fadeUp}
              className="p-6 rounded-2xl border border-[#E2E8F0] bg-[#F8F8FA] space-y-3"
            >
              <div className="h-10 w-10 rounded-xl bg-[#171A20] text-white flex items-center justify-center">
                <TrendingUp className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-[#171A20]">
                Up to 80% Power Bill Reduction
              </h3>
              <p className="text-xs text-[#5C5E62] leading-relaxed">
                Replace commercial utility tariffs of ₹10.00–₹12.50 per kWh with an effective
                levelized cost of energy (LCOE) under ₹2.50 per unit over 25 years.
              </p>
            </motion.div>

            <motion.div
              {...fadeUp}
              className="p-6 rounded-2xl border border-[#E2E8F0] bg-[#F8F8FA] space-y-3"
            >
              <div className="h-10 w-10 rounded-xl bg-[#171A20] text-white flex items-center justify-center">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-[#171A20]">SEBI BRSR & ESG Mandate</h3>
              <p className="text-xs text-[#5C5E62] leading-relaxed">
                Empower listed enterprises to meet SEBI's Business Responsibility & Sustainability
                Reporting (BRSR) directives and international RE100 zero-carbon commitments.
              </p>
            </motion.div>

            <motion.div
              {...fadeUp}
              className="p-6 rounded-2xl border border-[#E2E8F0] bg-[#F8F8FA] space-y-3"
            >
              <div className="h-10 w-10 rounded-xl bg-[#171A20] text-white flex items-center justify-center">
                <Zap className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-[#171A20]">Zero Production Downtime</h3>
              <p className="text-xs text-[#5C5E62] leading-relaxed">
                Grid-synchronized high-voltage industrial inverters smoothly integrate with your
                on-site diesel generators, slashing expensive fuel burn during load shedding.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: Industrial Deployment Sectors (Studio Gray #F8F8FA)
          ========================================================================= */}
      <section className="w-full bg-[#F8F8FA] py-20 lg:py-28 border-t border-b border-[#E2E8F0]">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <motion.div {...fadeUp} className="max-w-3xl mx-auto text-center space-y-4">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#5C5E62]">
              SECTOR ARCHITECTURE
            </span>
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#171A20]">
              Engineered for High-Demand Industries
            </h2>
            <p className="text-sm sm:text-base text-[#5C5E62]">
              Customized mechanical mounting brackets and high-voltage line synchronization for
              every industrial roof topology.
            </p>
          </motion.div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
            {SECTORS.map((sector) => {
              const Icon = sector.icon;
              return (
                <motion.div
                  key={sector.title}
                  {...fadeUp}
                  className="rounded-2xl overflow-hidden border border-[#E2E8F0] bg-white shadow-xs group"
                >
                  <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#171A20]">
                    <img
                      src={sector.image}
                      alt={sector.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                  <div className="p-6 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-[#171A20] text-white flex items-center justify-center shrink-0">
                        <Icon className="h-4 w-4" />
                      </div>
                      <h3 className="text-lg font-semibold text-[#171A20]">{sector.title}</h3>
                    </div>
                    <p className="text-xs sm:text-sm text-[#5C5E62] leading-relaxed">
                      {sector.desc}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 4: Interactive Commercial Sizing & ROI Engine (Pure White #FFFFFF)
          ========================================================================= */}
      <section id="commercial-calculator" className="w-full bg-[#FFFFFF] py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Controls */}
            <motion.div {...fadeUp} className="lg:col-span-6 space-y-8">
              <div>
                <span className="text-xs font-semibold uppercase tracking-widest text-[#5C5E62]">
                  INTERACTIVE FINANCIAL ENGINE
                </span>
                <h2 className="mt-2 text-3xl sm:text-4xl font-semibold tracking-tight text-[#171A20]">
                  Model Your Megawatt Solar Yield
                </h2>
                <p className="mt-3 text-sm text-[#5C5E62]">
                  Adjust your industrial rooftop area and current commercial utility tariff to
                  calculate your immediate tax deduction and 25-year cumulative wealth creation.
                </p>
              </div>

              {/* Roof Footprint Slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-baseline">
                  <label className="text-xs font-medium text-[#5C5E62]">
                    Usable Industrial Rooftop Area
                  </label>
                  <span className="text-lg font-bold text-[#171A20]">
                    {roofAreaSqFt.toLocaleString("en-IN")} sq.ft
                  </span>
                </div>
                <input
                  type="range"
                  min="10000"
                  max="150000"
                  step="5000"
                  value={roofAreaSqFt}
                  onChange={(e) => setRoofAreaSqFt(Number(e.target.value))}
                  className="w-full accent-[#171A20] cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-[#5C5E62]">
                  <span>10,000 sq.ft (100 kWp)</span>
                  <span>1,50,000 sq.ft (1.5 MWp)</span>
                </div>
              </div>

              {/* Commercial Tariff Selector */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-[#5C5E62]">
                  Current Commercial / Industrial DISCOM Tariff (₹/kWh)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[9.0, 10.5, 12.0].map((rate) => (
                    <button
                      key={rate}
                      type="button"
                      onClick={() => setCommercialTariff(rate)}
                      className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                        commercialTariff === rate
                          ? "border-[#171A20] bg-[#171A20] text-white"
                          : "border-[#E2E8F0] bg-[#FFFFFF] text-[#171A20] hover:border-[#171A20]/30"
                      }`}
                    >
                      ₹{rate.toFixed(1)} / unit
                    </button>
                  ))}
                </div>
              </div>

              {/* Enterprise RFP Form */}
              <form onSubmit={handleSubmitRfp} className="space-y-4 pt-2 border-t border-[#E2E8F0]">
                <div className="text-xs font-semibold uppercase tracking-wider text-[#5C5E62]">
                  Request Formal Megawatt Feasibility Proposal
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-[#171A20] mb-1">
                      Organization / Company
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Phoenix Logistics Park"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] bg-white text-xs text-[#171A20] focus:outline-none focus:border-[#171A20]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#171A20] mb-1">
                      Authorized Officer Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Suresh K. Varma"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] bg-white text-xs text-[#171A20] focus:outline-none focus:border-[#171A20]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#171A20] mb-1">
                    Corporate Phone / WhatsApp (+91)
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] bg-white text-xs text-[#171A20] focus:outline-none focus:border-[#171A20]"
                  />
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
                    id="enterprise-consent"
                    required
                    checked={consentGiven}
                    onChange={(e) => setConsentGiven(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-[#E2E8F0] accent-[#171A20] cursor-pointer"
                  />
                  <label
                    htmlFor="enterprise-consent"
                    className="text-xs text-[#5C5E62] leading-relaxed cursor-pointer"
                  >
                    I agree to receive a commercial solar feasibility proposal and be contacted by
                    WAVENOX industrial energy advisors as outlined in the{" "}
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
                      <span>Submit Commercial RFP</span>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleWhatsAppRfp}
                    className="flex-1 btn-secondary py-3.5 text-xs font-semibold cursor-pointer text-center"
                  >
                    Dispatch RFP via WhatsApp →
                  </button>
                </div>
              </form>
            </motion.div>

            {/* Results Card */}
            <motion.div {...fadeUp} className="lg:col-span-6">
              <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8F8FA] p-8 space-y-6">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#5C5E62]">
                    PROJECTED MEGAWATT METRICS
                  </span>
                  <div className="mt-1 text-3xl font-bold tracking-tight text-[#171A20]">
                    {capacityMw} MWp{" "}
                    <span className="text-base font-normal text-[#5C5E62]">({capacityKw} kWp)</span>
                  </div>
                </div>

                <div className="border-t border-b border-[#E2E8F0] py-5 space-y-3 text-xs sm:text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-[#5C5E62]">Est. Annual Clean Output</span>
                    <span className="font-semibold text-[#171A20]">
                      ~{annualUnitsKwh.toLocaleString("en-IN")} kWh / yr
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-emerald-700 font-medium">
                    <span>Year 1 Section 32 Tax Shield</span>
                    <span className="font-bold">
                      ₹{(year1TaxShieldInr / 100000).toFixed(1)} Lakhs
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#5C5E62]">Annual Electricity Bill Savings</span>
                    <span className="font-semibold text-[#171A20]">
                      ₹{(annualSavingsInr / 100000).toFixed(1)} Lakhs / yr
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#5C5E62]">Estimated Payback Period</span>
                    <span className="font-semibold text-[#171A20]">~{estPaybackYears} Years</span>
                  </div>
                </div>

                <div className="flex justify-between items-baseline pt-1">
                  <div>
                    <div className="text-xs font-semibold text-[#5C5E62] uppercase tracking-wider">
                      25-year savings after system cost
                    </div>
                    <div className="text-[11px] text-[#5C5E62]">
                      After full amortization of equipment & maintenance
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-emerald-700">
                    ₹{twentyFiveYearCrores} <span className="text-sm font-semibold">Cr</span>
                  </div>
                </div>

                <p className="text-[11px] text-[#5C5E62] pt-3 border-t border-[#E2E8F0]">
                  * Note on Section 32: Depreciation is halved if the asset is used for less than
                  180 days in the year. Confirm with your CA.{" "}
                  <a href="/legal/disclosures" className="underline hover:text-[#171A20]">
                    See how we calculate
                  </a>
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 5: Executive Feasibility Bar (Studio Gray #F8F8FA)
          ========================================================================= */}
      <section className="w-full bg-[#F8F8FA] py-16 border-t border-[#E2E8F0]">
        <div className="mx-auto max-w-5xl px-6 lg:px-12 text-center space-y-6">
          <h3 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#171A20]">
            Empower Your Balance Sheet with Clean Energy
          </h3>
          <p className="text-xs sm:text-sm text-[#5C5E62] max-w-xl mx-auto">
            WAVENOX in-house engineering team handles turnkey CEIG high-voltage synchronization,
            DISCOM net-metering & open-access approvals with 25-year performance warranties.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button
              type="button"
              onClick={() => openConsultationDrawer("commercial")}
              className="btn-primary w-full sm:w-auto text-sm cursor-pointer"
            >
              Request Commercial Feasibility Survey
            </button>
            <Link to="/deploy" className="btn-secondary w-full sm:w-auto text-sm cursor-pointer">
              Launch Design Studio →
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
