import * as React from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ShieldCheck, AlertCircle, MessageSquare } from "lucide-react";
import { Panel, QuietSection, StatRow, Button, TextLink, SpecsDrawer } from "@/components/system";
import { media } from "@/config/media";
import { BRAND_CONFIG } from "@/config/brand";
import { submitLead } from "@/functions/leads";
import { getStoredTelemetry } from "@/lib/telemetry";
import { calculateCommercialSolarAssessment } from "@/config/solar";

export const Route = createFileRoute("/enterprise")({
  staticData: {
    headerTone: "overlay" as const,
  },
  head: () => ({
    meta: [
      { title: `Commercial Solar — ${BRAND_CONFIG.name}` },
      {
        name: "description",
        content:
          "Turn idle industrial rooftops into high-yield clean energy assets. Section 33 tax depreciation modeling under the Income-tax Act, 2025, daytime tariff offset, and 25-year OEM linear warranties.",
      },
      { property: "og:title", content: `Commercial Solar — ${BRAND_CONFIG.name}` },
      {
        property: "og:description",
        content:
          "High-capacity rooftop solar infrastructure for manufacturing plants, cold storage, and corporate campuses.",
      },
      { property: "og:image", content: `${BRAND_CONFIG.domain}/media/commercial-hero-1600w.jpg` },
      { property: "og:url", content: `${BRAND_CONFIG.domain}/enterprise` },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "canonical", href: `${BRAND_CONFIG.domain}/enterprise` },
      {
        rel: "preload",
        as: "image",
        type: "image/avif",
        href: media["commercial-hero"].mobileAvif,
        media: "(max-width: 768px)",
        fetchPriority: "high",
      },
      {
        rel: "preload",
        as: "image",
        type: "image/avif",
        imageSrcSet: media["commercial-hero"].avif,
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
          "@type": "Service",
          name: `${BRAND_CONFIG.name} Enterprise Commercial & Industrial Solar Infrastructure`,
          image: `${BRAND_CONFIG.domain}/media/commercial-hero-1600w.jpg`,
          description:
            "Turnkey commercial solar engineering, procurement, and construction (EPC) for manufacturing plants, cold storage facilities, and corporate tech parks, with Section 33 tax depreciation modeling.",
          provider: {
            "@type": "Organization",
            name: BRAND_CONFIG.name,
            url: BRAND_CONFIG.domain,
          },
          areaServed: "IN",
        }),
      },
    ],
  }),
  component: EnterprisePage,
});

function formatInr(val: number): string {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(val);
}

function EnterprisePage() {
  const navigate = useNavigate();
  const [specsOpen, setSpecsOpen] = React.useState(false);

  // Commercial Calculator State
  const [roofAreaSqFt, setRoofAreaSqFt] = React.useState(50000);
  const [commercialTariff, setCommercialTariff] = React.useState(10.5);
  const [commissionedHalf, setCommissionedHalf] = React.useState<"H1" | "H2">("H1");
  const [taxRatePct, setTaxRatePct] = React.useState(25.17);

  // RFP Form State
  const [clientName, setClientName] = React.useState("");
  const [companyName, setCompanyName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [companyWebsite, setCompanyWebsite] = React.useState("");
  const [hpExtra, setHpExtra] = React.useState("");
  const [consentGiven, setConsentGiven] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  // Unified Commercial Assessment Engine (Section 33, Income-tax Act, 2025)
  const capacityKw = React.useMemo(() => Math.round(roofAreaSqFt / 100), [roofAreaSqFt]);
  const capacityMw = React.useMemo(() => (capacityKw / 1000).toFixed(2), [capacityKw]);
  const commercialAssessment = React.useMemo(
    () =>
      calculateCommercialSolarAssessment({
        capacityKw,
        discomCode: "TGSPDCL",
        commissioningWindow: commissionedHalf === "H1" ? "H1_FULL_RATE" : "H2_HALF_RATE",
        corporateTaxRatePct: taxRatePct,
        hasTaxableProfit: taxRatePct > 0,
      }),
    [capacityKw, commissionedHalf, taxRatePct],
  );
  const annualUnitsKwh = commercialAssessment.annualGenKwh;
  const annualSavingsInr = React.useMemo(
    () => Math.round(annualUnitsKwh * commercialTariff),
    [annualUnitsKwh, commercialTariff],
  );
  const estCapexInr = commercialAssessment.grossCapexInr;
  const year1DepreciationDeductionInr = commercialAssessment.year1DepreciationDeductionInr;
  const year1TaxShieldInr = commercialAssessment.year1IllustrativeTaxShieldInr;
  const estPaybackYears = React.useMemo(
    () => (estCapexInr / Math.max(1, annualSavingsInr)).toFixed(1),
    [estCapexInr, annualSavingsInr],
  );
  const taxAdjustedPaybackYears = React.useMemo(
    () => (Math.max(0, estCapexInr - year1TaxShieldInr) / Math.max(1, annualSavingsInr)).toFixed(1),
    [estCapexInr, year1TaxShieldInr, annualSavingsInr],
  );

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
          company_name: companyName.trim() || undefined,
          company_url: companyWebsite.trim() || undefined,
          city: "Hyderabad",
          property_tier: "commercial",
          roof_area_sqft: roofAreaSqFt,
          system_kw: capacityKw,
          net_price_inr: estCapexInr,
          source: "enterprise",
          notes: `Commercial proposal for ${roofAreaSqFt.toLocaleString("en-IN")} sq.ft (~${capacityMw} MWp). Tariff: ₹${commercialTariff}/unit.`,
          consent_given: true,
          consent_version: "2026-11-v2",
          consent_timestamp: new Date().toISOString(),
          hp_extra: hpExtra.trim() || undefined,
          ...telemetry,
        },
      });

      if (!res.success || !res.referenceCode) {
        setSubmitError(
          res.message || "Failed to submit proposal request. Please reach us via WhatsApp.",
        );
        setIsSubmitting(false);
        return;
      }

      if (typeof window !== "undefined") {
        sessionStorage.setItem(
          "wavenox_last_submission",
          JSON.stringify({
            ref: res.referenceCode,
            referenceCode: res.referenceCode,
            isDemo: Boolean(res.isDemo),
            mode: res.mode || (res.isDemo ? "demo" : "live"),
            source: "enterprise",
            timestamp: new Date().toISOString(),
          }),
        );
      }

      navigate({
        to: "/order/received",
        search: { ref: res.referenceCode },
      });
    } catch (err: unknown) {
      console.error("[EnterprisePage] RFP error:", err);
      setSubmitError("Failed to submit proposal request. Please reach us via WhatsApp or phone.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const scrollToAssessment = () => {
    document.getElementById("assessment")?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToCalculator = () => {
    document.getElementById("calculator")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#171A20] selection:bg-[#171A20] selection:text-[#FFFFFF]">
      <Header />

      <main>
        {/* 1. PANEL: commercial-hero */}
        <Panel
          id="commercial"
          as="h1"
          media={media["commercial-hero"]}
          priority={true}
          tone="dark"
          title="Commercial Solar"
          lead="Turn industrial rooftops into clean energy assets with high-yield bifacial arrays."
          stats={
            <StatRow
              stats={[
                { value: "Sec 33", label: "Tax Depreciation*" },
                { value: "3 to 4 Yrs", label: "Indicative Payback" },
                { value: "25 Years", label: "Linear Warranty" },
              ]}
            />
          }
          actions={
            <>
              <Button
                onClick={scrollToAssessment}
                variant="primary"
                tone="dark"
                className="w-full sm:w-auto min-w-[200px]"
              >
                Request Site Assessment
              </Button>
              <Button
                onClick={scrollToCalculator}
                variant="secondary"
                tone="dark"
                className="w-full sm:w-auto min-w-[200px]"
              >
                Calculate Yield
              </Button>
            </>
          }
          disclaimer="*Depreciation deductions under Section 33 of the Income-tax Act, 2025 and Notified Income-tax Rules, 2026 (formerly Section 32) depend on applicable 2026 block rules and corporate tax regime. Illustrative — consult your Chartered Accountant."
        />

        {/* 2. PANEL: commercial-industrial */}
        <Panel
          id="operating-costs"
          media={media["commercial-industrial"]}
          tone="dark"
          title="Lower Operating Costs"
          lead="Produce your own clean power during high peak daytime commercial tariff hours."
          stats={
            <StatRow
              stats={[
                { value: "₹10.50+", label: "Tariff Offset" },
                { value: "22.8%", label: "Module Efficiency" },
              ]}
            />
          }
          actions={
            <>
              <Button
                onClick={scrollToAssessment}
                variant="primary"
                tone="dark"
                className="w-full sm:w-auto min-w-[200px]"
              >
                Request Site Assessment
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

        {/* 3. QUIET SECTION: Commercial Calculator */}
        <QuietSection
          id="calculator"
          bg="surface"
          title="Commercial Yield Calculator"
          lead="Estimate system capacity, annual energy savings, and illustrative Year 1 Section 33 tax shields."
        >
          <div className="max-w-2xl mx-auto space-y-10">
            {/* Controls */}
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between items-baseline">
                  <span className="text-[13px] font-medium text-[#5C5E62]">
                    Usable Rooftop Area
                  </span>
                  <span className="text-[18px] font-medium tabular-nums text-[#171A20]">
                    {roofAreaSqFt.toLocaleString("en-IN")} sq.ft
                  </span>
                </div>
                <input
                  type="range"
                  min={10000}
                  max={200000}
                  step={5000}
                  value={roofAreaSqFt}
                  onChange={(e) => setRoofAreaSqFt(Number(e.target.value))}
                  className="range-slider"
                  aria-label="Rooftop area in square feet"
                  aria-valuetext={`${roofAreaSqFt.toLocaleString("en-IN")} square feet`}
                />
                <div className="flex justify-between text-[12px] text-[#5C5E62]">
                  <span>10,000 sq.ft</span>
                  <span>200,000+ sq.ft</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2">
                <label htmlFor="tariff-input" className="text-[13px] font-medium text-[#5C5E62]">
                  Current Commercial Tariff (₹ / kWh)
                </label>
                <input
                  id="tariff-input"
                  type="number"
                  step="0.1"
                  min="7"
                  max="15"
                  value={commercialTariff}
                  onChange={(e) => setCommercialTariff(Number(e.target.value))}
                  className="h-10 w-28 px-3 bg-[#FFFFFF] border border-[#E3E4E6] rounded-[4px] text-[14px] font-medium text-[#171A20] text-right focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#171A20]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-[#E3E4E6]">
                <div className="space-y-1.5">
                  <span className="text-[13px] font-medium text-[#5C5E62]">
                    Commissioning Period (Sec 33 Model)
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setCommissionedHalf("H1")}
                      className={`h-10 px-2 rounded-[4px] border text-[12px] font-medium transition-all ${
                        commissionedHalf === "H1"
                          ? "border-[#171A20] bg-[#171A20] text-white"
                          : "border-[#E3E4E6] bg-white text-[#171A20] hover:border-[#171A20]/40"
                      }`}
                    >
                      H1 (≥180d) · 40%
                    </button>
                    <button
                      type="button"
                      onClick={() => setCommissionedHalf("H2")}
                      className={`h-10 px-2 rounded-[4px] border text-[12px] font-medium transition-all ${
                        commissionedHalf === "H2"
                          ? "border-[#171A20] bg-[#171A20] text-white"
                          : "border-[#E3E4E6] bg-white text-[#171A20] hover:border-[#171A20]/40"
                      }`}
                    >
                      H2 (&lt;180d) · 20%
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="tax-rate-select"
                    className="text-[13px] font-medium text-[#5C5E62] block"
                  >
                    Corporate Tax Bracket
                  </label>
                  <select
                    id="tax-rate-select"
                    value={taxRatePct}
                    onChange={(e) => setTaxRatePct(Number(e.target.value))}
                    className="h-10 w-full px-3 bg-white border border-[#E3E4E6] rounded-[4px] text-[12px] font-medium text-[#171A20] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#171A20]"
                  >
                    <option value={25.17}>25.17% (Sec 115BAA corporate)</option>
                    <option value={30.0}>30.00% (Standard corporate / LLP)</option>
                    <option value={22.0}>22.00% (Base manufacturing)</option>
                    <option value={0}>0% (No Current Taxable Profit / Tax-Exempt)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Big Number Output */}
            <div className="text-center pt-4 border-t border-[#E3E4E6] space-y-2">
              <div className="text-[36px] sm:text-[48px] font-medium tracking-tight tabular-nums text-[#171A20]">
                ₹{formatInr(annualSavingsInr)}
              </div>
              <div className="text-[13px] text-[#5C5E62]">
                Estimated Annual Electricity Savings (~{formatInr(annualUnitsKwh)} kWh/yr)
              </div>
            </div>

            {/* Stat Row */}
            <div className="pt-2">
              <StatRow
                stats={[
                  {
                    value: `${capacityMw} MWp`,
                    label: "Plant Capacity",
                    sublabel: `~${capacityKw} kWp · ₹${formatInr(estCapexInr)} Gross Capex`,
                  },
                  {
                    value: `₹${formatInr(year1TaxShieldInr)}`,
                    label: "Illustrative Year 1 Tax Shield*",
                    sublabel: `Sec 33 (${commissionedHalf === "H1" ? "40%" : "20%"} WDV Deduction: ₹${formatInr(year1DepreciationDeductionInr)})`,
                  },
                  {
                    value: `${estPaybackYears} Yrs`,
                    label: "Operational Payback",
                    sublabel:
                      taxRatePct > 0
                        ? `~${taxAdjustedPaybackYears} Yrs w/ Illustrative Tax Shield*`
                        : "Pre-Tax Capex Recovery",
                  },
                ]}
              />
            </div>

            {/* Section 33 Ledger Summary */}
            <div className="p-4 rounded-[6px] bg-[#FFFFFF] border border-[#E3E4E6] grid grid-cols-1 sm:grid-cols-3 gap-3 text-[12px]">
              <div>
                <div className="text-[#5C5E62]">Year 1 WDV Depreciation Allowance</div>
                <div className="font-semibold text-[#171A20] tabular-nums mt-0.5">
                  ₹{formatInr(year1DepreciationDeductionInr)} (
                  {commercialAssessment.year1DepreciationRatePct}% of Capex)
                </div>
                <div className="text-[#5C5E62] mt-0.5">Deduction from taxable income</div>
              </div>
              <div>
                <div className="text-[#5C5E62]">Illustrative Cash Tax Shield ({taxRatePct}%)</div>
                <div className="font-semibold text-[#171A20] tabular-nums mt-0.5">
                  ₹{formatInr(year1TaxShieldInr)}
                </div>
                <div className="text-[#5C5E62] mt-0.5">
                  {taxRatePct > 0 ? "Requires taxable profit capacity" : "No immediate tax shield"}
                </div>
              </div>
              <div>
                <div className="text-[#5C5E62]">Closing Year 1 WDV Block Balance</div>
                <div className="font-semibold text-[#171A20] tabular-nums mt-0.5">
                  ₹{formatInr(commercialAssessment.remainingWdvAfterYear1Inr)}
                </div>
                <div className="text-[#5C5E62] mt-0.5">Carried forward to Year 2</div>
              </div>
            </div>

            {/* Statutory Disclaimer & Source Link */}
            <div className="text-center pt-1 border-t border-[#E3E4E6]/60">
              <p className="text-[12px] text-[#5C5E62]">
                *Illustrative figures under Section 33 of the Income-tax Act, 2025 and Notified
                Income-tax Rules, 2026 (succeeding Section 32 of the 1961 Act). Applicable 2026
                depreciation block rates, commissioning windows, and corporate tax benefits depend
                on your entity&apos;s tax regime and profit profile — consult your Chartered
                Accountant.
              </p>
              <Link
                to="/legal/disclosures"
                hash="sources"
                className="inline-flex items-center gap-1 text-[12px] font-medium text-[#171A20] hover:underline mt-1"
              >
                <span>View statutory methodology & sources</span>
                <span>→</span>
              </Link>
            </div>
          </div>
        </QuietSection>

        {/* 4. QUIET SECTION: Commercial Site Assessment Form */}
        <QuietSection
          id="assessment"
          bg="white"
          title="Request a Site Assessment"
          lead="Our commercial engineering team will evaluate roof structural loads, grid interconnection, and preliminary yield."
        >
          <div className="max-w-xl mx-auto">
            <form onSubmit={handleSubmitRfp} className="space-y-5">
              {submitError && (
                <div className="p-3.5 bg-[#B42318]/10 border border-[#B42318]/30 rounded-[6px] text-[#B42318] text-[13px] flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}

              <div>
                <label
                  htmlFor="rfp-name"
                  className="block text-[12px] font-semibold text-[#171A20] uppercase tracking-[0.08em] mb-1.5"
                >
                  Full Name *
                </label>
                <input
                  id="rfp-name"
                  type="text"
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="First and last name"
                  className="w-full h-11 px-3.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-[6px] text-[14px] text-[#171A20] placeholder:text-[#9CA3AF] transition-colors focus:bg-[#FFFFFF] focus:border-[#171A20] focus:ring-1 focus:ring-[#171A20] focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="rfp-phone"
                  className="block text-[12px] font-semibold text-[#171A20] uppercase tracking-[0.08em] mb-1.5"
                >
                  Mobile Phone / WhatsApp (+91) *
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-[13px] font-medium text-[#5C5E62] select-none pointer-events-none border-r border-[#E5E7EB] pr-2.5">
                    +91
                  </span>
                  <input
                    id="rfp-phone"
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="10-digit mobile number"
                    maxLength={14}
                    className="w-full h-11 pl-16 pr-3.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-[6px] text-[14px] text-[#171A20] placeholder:text-[#9CA3AF] transition-colors focus:bg-[#FFFFFF] focus:border-[#171A20] focus:ring-1 focus:ring-[#171A20] focus:outline-none tabular-nums"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label
                    htmlFor="rfp-company"
                    className="block text-[12px] font-semibold text-[#171A20] uppercase tracking-[0.08em] mb-1.5"
                  >
                    Company / Facility Name
                  </label>
                  <input
                    id="rfp-company"
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Commercial facility or business name"
                    className="w-full h-11 px-3.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-[6px] text-[14px] text-[#171A20] placeholder:text-[#9CA3AF] transition-colors focus:bg-[#FFFFFF] focus:border-[#171A20] focus:ring-1 focus:ring-[#171A20] focus:outline-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor="rfp-website"
                    className="block text-[12px] font-semibold text-[#171A20] uppercase tracking-[0.08em] mb-1.5"
                  >
                    Company Website (Optional)
                  </label>
                  <input
                    id="rfp-website"
                    type="text"
                    value={companyWebsite}
                    onChange={(e) => setCompanyWebsite(e.target.value)}
                    placeholder="e.g. company.in"
                    className="w-full h-11 px-3.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-[6px] text-[14px] text-[#171A20] placeholder:text-[#9CA3AF] transition-colors focus:bg-[#FFFFFF] focus:border-[#171A20] focus:ring-1 focus:ring-[#171A20] focus:outline-none"
                  />
                </div>
              </div>

              {/* Visually hidden honeypot field for bot suppression */}
              <div
                style={{
                  position: "absolute",
                  left: "-9999px",
                  opacity: 0,
                  height: 0,
                  overflow: "hidden",
                }}
                aria-hidden="true"
              >
                <input
                  type="text"
                  name="hp_extra"
                  tabIndex={-1}
                  autoComplete="off"
                  value={hpExtra}
                  onChange={(e) => setHpExtra(e.target.value)}
                />
              </div>

              {/* DPDP Act 2023 Consent */}
              <div className="p-3.5 rounded-[6px] bg-[#F9FAFB] border border-[#E5E7EB] flex items-start gap-3">
                <input
                  id="rfp-consent"
                  type="checkbox"
                  required
                  checked={consentGiven}
                  onChange={(e) => setConsentGiven(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded-[4px] border-[#CBD5E1] text-[#171A20] focus:ring-1 focus:ring-[#171A20] cursor-pointer shrink-0"
                />
                <label
                  htmlFor="rfp-consent"
                  className="text-[12px] text-[#5C5E62] leading-relaxed cursor-pointer"
                >
                  I authorize WAVENOX commercial solar engineers to evaluate facility
                  interconnection, prepare a commercial solar proposal, and contact me in accordance
                  with the <strong>DPDP Act 2023</strong>. Project details may be shared only as
                  necessary with authorized WAVENOX delivery partners and utility authorities, and
                  are never sold to third-party lead aggregators. See our{" "}
                  <a href="/legal/privacy" className="underline hover:text-[#171A20]">
                    Privacy Policy
                  </a>
                  .
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !consentGiven}
                className="w-full h-12 px-6 rounded-[6px] bg-[#171A20] text-[#FFFFFF] text-[14px] font-medium tracking-[0.02em] hover:bg-[#2B2F36] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ShieldCheck className="w-4 h-4 text-[#F57C00]" />
                <span>
                  {isSubmitting ? "Generating Assessment..." : "Request Commercial Proposal"}
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
                  <span>Prefer direct commercial advisor discussion? Chat on WhatsApp →</span>
                </a>
              </div>
            </form>

            {/* Cross-Solution Navigation */}
            <div className="mt-14 pt-8 border-t border-[#E3E4E6]">
              <div className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#5C5E62] text-center mb-4">
                Explore Related WAVENOX Solutions
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
                <Link
                  to="/residential"
                  className="p-4 rounded-[6px] border border-[#E3E4E6] bg-[#F4F4F4] hover:bg-[#EAEAEA] transition-colors block"
                >
                  <div className="text-[14px] font-medium text-[#171A20]">Solar Panels</div>
                  <div className="text-[12px] text-[#5C5E62] mt-0.5">Homes &amp; villas</div>
                </Link>
                <Link
                  to="/omnigrid"
                  className="p-4 rounded-[6px] border border-[#E3E4E6] bg-[#F4F4F4] hover:bg-[#EAEAEA] transition-colors block"
                >
                  <div className="text-[14px] font-medium text-[#171A20]">Solar + Storage</div>
                  <div className="text-[12px] text-[#5C5E62] mt-0.5">Omnigrid LFP backup</div>
                </Link>
                <Link
                  to="/deploy"
                  className="p-4 rounded-[6px] border border-[#E3E4E6] bg-[#F4F4F4] hover:bg-[#EAEAEA] transition-colors block"
                >
                  <div className="text-[14px] font-medium text-[#171A20]">Design Studio</div>
                  <div className="text-[12px] text-[#5C5E62] mt-0.5">Interactive sizing</div>
                </Link>
              </div>
            </div>
          </div>
        </QuietSection>
      </main>

      <Footer />

      {/* Specifications Drawer */}
      <SpecsDrawer open={specsOpen} onOpenChange={setSpecsOpen} />
    </div>
  );
}
