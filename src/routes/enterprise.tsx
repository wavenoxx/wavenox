import * as React from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ShieldCheck, AlertCircle, MessageSquare } from "lucide-react";
import {
  Panel,
  EditorialFeature,
  SpecsGrid,
  Button,
  SpecsDrawer,
  type SpecCategory,
} from "@/components/system";
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
        type: "image/webp",
        imageSrcSet: media["commercial-hero"].mobileWebp,
        imageSizes: "(max-width: 420px) 360px, 100vw",
        media: "(max-width: 768px)",
        fetchPriority: "high",
      },
      {
        rel: "preload",
        as: "image",
        type: "image/webp",
        imageSrcSet: media["commercial-hero"].webp,
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

const ENTERPRISE_SPECS: SpecCategory[] = [
  {
    title: "Capacity & Yield",
    items: [
      { label: "Deployment Scale", value: "25 kWp to 5+ MWp rooftop plants" },
      { label: "Module Architecture", value: "580W+ N-Type TOPCon Bifacial" },
      { label: "Module Efficiency", value: "22.45% – 22.8% (STC)" },
      { label: "Indicative Payback", value: "3 to 4 Years operational recovery" },
    ],
  },
  {
    title: "Roof & Grid Engineering",
    items: [
      { label: "Metal Roof Mounting", value: "Non-penetrating standing-seam clamps" },
      { label: "RCC Roof Mounting", value: "Ballasted / waterproofed chemical pedestals" },
      { label: "Interconnection", value: "HT / LT synchronization & DISCOM net metering" },
      { label: "O&M Access", value: "Dedicated walkways, lifelines & string telemetry" },
    ],
  },
  {
    title: "Tax & Commercial Basis",
    items: [
      { label: "Statutory Framework", value: "Section 33, Income-tax Act, 2025*" },
      { label: "Commissioning Rules", value: "Notified Income-tax Rules, 2026 (H1 40% / H2 20%)" },
      { label: "Tariff Offset", value: "₹10.50+ / kWh commercial daytime tariffs" },
      { label: "Financing Options", value: "Capex, Bank Green Term Loan, or Custom EPC" },
    ],
  },
  {
    title: "Warranties & Safety",
    items: [
      { label: "Linear Performance", value: "25 Years OEM linear output warranty" },
      { label: "Wind Engineering", value: "IS 875 (Part 3) 44 m/s structural design" },
      { label: "Protection Standards", value: "Surge arrestors, LA, DC/AC isolation & earthing" },
      { label: "Compliance", value: "CEIG inspection & MNRE ALMM / BIS hardware" },
    ],
  },
];

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
        {/* SEC 0: BOOKEND HERO (16:9 DESKTOP / 4:5 MOBILE) */}
        <Panel
          id="commercial"
          as="h1"
          media={media["commercial-hero"]}
          priority={true}
          mobileNaturalFrame={true}
          tone="dark"
          className="scroll-mt-14"
          title="Commercial Solar"
          lead="High-Yield Rooftop Power for Manufacturing Plants and Campuses."
          actions={
            <>
              <Button
                onClick={scrollToAssessment}
                variant="primary"
                tone="dark"
                className="w-full sm:w-auto sm:min-w-[204px]"
              >
                Request Assessment
              </Button>
              <Button
                onClick={scrollToCalculator}
                variant="secondary"
                tone="dark"
                className="w-full sm:w-auto sm:min-w-[204px]"
              >
                Calculate Yield
              </Button>
            </>
          }
        />

        {/* SEC 1: LOWER OPERATING COSTS */}
        <EditorialFeature
          id="operating-costs"
          media={media["commercial-industrial"]}
          title="Lower Daytime Operating Costs"
          lead="Generate predictable clean power during peak commercial daytime tariff hours—reducing factory energy overhead and strengthening operating margins for 25+ years."
          actions={
            <>
              <Button
                onClick={scrollToAssessment}
                variant="primary"
                tone="light"
                className="w-full sm:w-auto sm:min-w-[204px]"
              >
                Request Site Assessment
              </Button>
              <Button
                onClick={() => setSpecsOpen(true)}
                variant="secondary"
                tone="light"
                className="w-full sm:w-auto sm:min-w-[180px]"
              >
                View Specs
              </Button>
            </>
          }
          cards={[
            {
              metric: "₹10.50+",
              title: "Daytime Tariff Offset",
              description:
                "Directly offsets expensive commercial and HT industrial daytime power slabs across manufacturing shifts.",
            },
            {
              metric: "Sec 33*",
              title: "Tax Depreciation Model",
              description:
                "Eligible corporate entities can model Year 1 WDV depreciation allowances under Section 33 of the Income-tax Act, 2025.",
            },
            {
              metric: "3 to 4 Yrs",
              title: "Indicative Payback",
              description:
                "Typical operational capital recovery window for high-utilization Indian C&I rooftops followed by decades of low-cost yield.",
            },
          ]}
        />

        {/* SEC 2: CAMPUS & INDUSTRIAL ENGINEERING */}
        <EditorialFeature
          id="campus-scale"
          media={media["commercial-campus"]}
          className="deferred-section"
          title="Engineered for Industrial Roofs & Campuses"
          lead="Standing-seam metal sheds, cold storage depots, and corporate tech parks engineered with non-penetrating clamps, safe O&M walkways, and utility-compliant HT/LT synchronization."
          cards={[
            {
              title: "Non-Penetrating Clamps",
              description:
                "Preserves industrial metal sheet roof warranties without drilling leaks across long-span factory sheds.",
            },
            {
              title: "O&M Safety Walkways",
              description:
                "Structured maintenance corridors, lifelines, and string-level diagnostics simplify cleaning and preventive checks.",
            },
            {
              title: "CEIG & Grid Sync",
              description:
                "Complete electrical safety approvals, bi-directional net metering, and protection relays coordinated end to end.",
            },
          ]}
        />

        {/* SEC 3: COMMERCIAL YIELD CALCULATOR (PURE #FFFFFF CANVAS + #F4F4F4 STUDIO) */}
        <section
          id="calculator"
          data-theme="light"
          className="relative w-full bg-[#FFFFFF] text-[#171A20] pt-16 sm:pt-24 lg:pt-32 pb-16 sm:pb-24 lg:pb-32 scroll-mt-14"
        >
          <div className="w-full max-w-[1116px] mx-auto px-6 md:px-8 xl:px-0 space-y-10 sm:space-y-12">
            <div className="max-w-[780px] space-y-4">
              <h2 className="text-[30px] sm:text-[40px] lg:text-[48px] font-medium tracking-[-0.028em] leading-[1.12] text-[#171A20] text-balance">
                Commercial Yield Calculator
              </h2>
              <p className="text-[16px] sm:text-[18px] lg:text-[20px] font-normal leading-[1.52] text-[#5C5E62] text-pretty">
                Estimate plant capacity, annual electricity savings, and illustrative Year 1 Section
                33 WDV tax shields.
              </p>
            </div>

            <div className="rounded-[8px] bg-[#F4F4F4] p-6 sm:p-10 lg:p-12 space-y-8 sm:space-y-10">
              {/* Controls */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-6 space-y-5">
                  <div className="space-y-2.5">
                    <div className="flex justify-between items-baseline">
                      <span className="text-[12px] font-medium uppercase tracking-[0.06em] text-[#5C5E62]">
                        Usable Rooftop Area
                      </span>
                      <span className="text-[22px] sm:text-[26px] font-medium tabular-nums text-[#171A20] leading-none">
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
                    <div className="flex justify-between text-[12px] text-[#5C5E62] tabular-nums">
                      <span>10,000 sq.ft</span>
                      <span>200,000+ sq.ft</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2">
                    <label
                      htmlFor="tariff-input"
                      className="text-[13px] font-medium text-[#5C5E62]"
                    >
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
                      className="min-h-[44px] w-full sm:w-28 px-3 bg-[#FFFFFF] border border-[#D0D2D6] rounded-[4px] text-[14px] font-medium text-[#171A20] text-right tabular-nums focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#171A20]"
                    />
                  </div>
                </div>

                <div className="lg:col-span-6 space-y-5">
                  <div className="space-y-2">
                    <span className="text-[12px] font-medium uppercase tracking-[0.06em] text-[#5C5E62] block">
                      Commissioning Period (Sec 33 Model)
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setCommissionedHalf("H1")}
                        className={`min-h-[44px] px-3 rounded-[4px] border text-[13px] font-medium transition-colors cursor-pointer ${
                          commissionedHalf === "H1"
                            ? "border-[#171A20] bg-[#171A20] text-[#FFFFFF]"
                            : "border-[#D0D2D6] bg-[#FFFFFF] text-[#171A20] hover:border-[#171A20]/50"
                        }`}
                      >
                        H1 (≥180d) · 40%
                      </button>
                      <button
                        type="button"
                        onClick={() => setCommissionedHalf("H2")}
                        className={`min-h-[44px] px-3 rounded-[4px] border text-[13px] font-medium transition-colors cursor-pointer ${
                          commissionedHalf === "H2"
                            ? "border-[#171A20] bg-[#171A20] text-[#FFFFFF]"
                            : "border-[#D0D2D6] bg-[#FFFFFF] text-[#171A20] hover:border-[#171A20]/50"
                        }`}
                      >
                        H2 (&lt;180d) · 20%
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="tax-rate-select"
                      className="text-[12px] font-medium uppercase tracking-[0.06em] text-[#5C5E62] block"
                    >
                      Corporate Tax Bracket
                    </label>
                    <select
                      id="tax-rate-select"
                      value={taxRatePct}
                      onChange={(e) => setTaxRatePct(Number(e.target.value))}
                      className="min-h-[44px] w-full px-3.5 bg-[#FFFFFF] border border-[#D0D2D6] rounded-[4px] text-[13px] font-medium text-[#171A20] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#171A20]"
                    >
                      <option value={25.17}>25.17% (Sec 115BAA corporate)</option>
                      <option value={30.0}>30.00% (Standard corporate / LLP)</option>
                      <option value={22.0}>22.00% (Base manufacturing)</option>
                      <option value={0}>0% (No Current Taxable Profit / Tax-Exempt)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Headline Output + Mobile-Safe Stacked KPI Cards */}
              <div className="rounded-[8px] bg-[#FFFFFF] p-6 sm:p-8 space-y-6">
                <div className="space-y-1.5">
                  <div className="text-[12px] font-medium uppercase tracking-[0.06em] text-[#5C5E62]">
                    Estimated Annual Electricity Savings
                  </div>
                  <div className="text-[36px] sm:text-[48px] font-medium tracking-[-0.028em] tabular-nums text-[#171A20] leading-none">
                    ₹{formatInr(annualSavingsInr)}
                  </div>
                  <div className="text-[14px] text-[#5C5E62] tabular-nums">
                    ~{formatInr(annualUnitsKwh)} kWh/yr estimated generation at ₹
                    {commercialTariff.toFixed(2)}/kWh
                  </div>
                </div>

                {/* Responsive KPI Strip: Stacks cleanly on mobile so zero text cramping */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-6 border-t border-[#E3E4E6]">
                  <div className="space-y-1">
                    <div className="text-[12px] font-medium uppercase tracking-[0.05em] text-[#5C5E62]">
                      Plant Capacity
                    </div>
                    <div className="text-[26px] sm:text-[30px] font-medium tracking-[-0.02em] tabular-nums text-[#171A20]">
                      {capacityMw} MWp
                    </div>
                    <div className="text-[12px] text-[#5C5E62] tabular-nums">
                      ~{capacityKw} kWp · ₹{formatInr(estCapexInr)} Gross Capex
                    </div>
                  </div>

                  <div className="space-y-1 sm:border-l sm:border-[#E3E4E6] sm:pl-5">
                    <div className="text-[12px] font-medium uppercase tracking-[0.05em] text-[#5C5E62]">
                      Illustrative Year 1 Tax Shield*
                    </div>
                    <div className="text-[26px] sm:text-[30px] font-medium tracking-[-0.02em] tabular-nums text-[#171A20]">
                      ₹{formatInr(year1TaxShieldInr)}
                    </div>
                    <div className="text-[12px] text-[#5C5E62] tabular-nums">
                      Sec 33 ({commissionedHalf === "H1" ? "40%" : "20%"} WDV Deduction: ₹
                      {formatInr(year1DepreciationDeductionInr)})
                    </div>
                  </div>

                  <div className="space-y-1 sm:border-l sm:border-[#E3E4E6] sm:pl-5">
                    <div className="text-[12px] font-medium uppercase tracking-[0.05em] text-[#5C5E62]">
                      Operational Payback
                    </div>
                    <div className="text-[26px] sm:text-[30px] font-medium tracking-[-0.02em] tabular-nums text-[#171A20]">
                      {estPaybackYears} Yrs
                    </div>
                    <div className="text-[12px] text-[#5C5E62] tabular-nums">
                      {taxRatePct > 0
                        ? `~${taxAdjustedPaybackYears} Yrs w/ Illustrative Tax Shield*`
                        : "Pre-Tax Capex Recovery"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 33 Ledger Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-[13px]">
                <div className="rounded-[8px] bg-[#FFFFFF] p-5 space-y-1">
                  <div className="text-[12px] text-[#5C5E62]">
                    Year 1 WDV Depreciation Allowance
                  </div>
                  <div className="font-medium text-[#171A20] tabular-nums">
                    ₹{formatInr(year1DepreciationDeductionInr)} (
                    {commercialAssessment.year1DepreciationRatePct}% of Capex)
                  </div>
                  <div className="text-[12px] text-[#5C5E62]">Deduction from taxable income</div>
                </div>
                <div className="rounded-[8px] bg-[#FFFFFF] p-5 space-y-1">
                  <div className="text-[12px] text-[#5C5E62]">
                    Illustrative Cash Tax Shield ({taxRatePct}%)
                  </div>
                  <div className="font-medium text-[#171A20] tabular-nums">
                    ₹{formatInr(year1TaxShieldInr)}
                  </div>
                  <div className="text-[12px] text-[#5C5E62]">
                    {taxRatePct > 0
                      ? "Requires taxable profit capacity"
                      : "No immediate tax shield"}
                  </div>
                </div>
                <div className="rounded-[8px] bg-[#FFFFFF] p-5 space-y-1">
                  <div className="text-[12px] text-[#5C5E62]">Closing Year 1 WDV Block Balance</div>
                  <div className="font-medium text-[#171A20] tabular-nums">
                    ₹{formatInr(commercialAssessment.remainingWdvAfterYear1Inr)}
                  </div>
                  <div className="text-[12px] text-[#5C5E62]">Carried forward to Year 2</div>
                </div>
              </div>

              {/* Statutory Disclaimer & Source Link */}
              <div className="pt-5 border-t border-[#E3E4E6] flex flex-col lg:flex-row lg:items-end justify-between gap-4">
                <p className="text-[12px] text-[#5C5E62] leading-[1.55] max-w-3xl">
                  *Illustrative figures under Section 33 of the Income-tax Act, 2025 and Notified
                  Income-tax Rules, 2026 (succeeding Section 32 of the 1961 Act). Applicable 2026
                  depreciation block rates, commissioning windows, and corporate tax benefits depend
                  on your entity&apos;s tax regime and profit profile — consult your Chartered
                  Accountant.
                </p>
                <Link
                  to="/legal/disclosures"
                  hash="sources"
                  className="inline-flex items-center gap-1 text-[12px] font-medium text-[#171A20] underline underline-offset-4 hover:text-[#5C5E62] shrink-0"
                >
                  <span>View statutory methodology &amp; sources</span>
                  <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* SEC 4: DARK #000000 COMMERCIAL SPECS GRID */}
        <SpecsGrid
          id="enterprise-specs"
          title="Commercial Solar Specs"
          subtitle="Industrial rooftop and campus solar engineering standards for Telangana, Andhra Pradesh, and pan-India C&I facilities."
          categories={ENTERPRISE_SPECS}
          footnote="All megawatt-scale designs undergo site-specific structural roof load audits, CEIG electrical drawings, and DISCOM feeder feasibility verification prior to execution."
        />

        {/* SEC 5: COMMERCIAL SITE ASSESSMENT FORM (CLEAN ARCHITECTURAL SPLIT) */}
        <section
          id="assessment"
          data-theme="light"
          className="relative w-full bg-[#FFFFFF] text-[#171A20] py-16 sm:py-24 lg:py-32 scroll-mt-14"
        >
          <div className="w-full max-w-[1116px] mx-auto px-6 md:px-8 xl:px-0">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
              <div className="lg:col-span-5 space-y-5">
                <h2 className="text-[30px] sm:text-[40px] lg:text-[44px] font-medium tracking-[-0.028em] leading-[1.12] text-[#171A20] text-balance">
                  Request a Site Assessment
                </h2>
                <p className="text-[16px] sm:text-[18px] text-[#5C5E62] leading-[1.55] text-pretty">
                  Our commercial engineering team evaluates roof structural capacity, HT/LT grid
                  interconnection, and preliminary generation yield for your facility.
                </p>

                <div className="pt-2 space-y-4">
                  <a
                    href={BRAND_CONFIG.contact.whatsapp.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-[14px] font-medium text-[#171A20] hover:text-[#5C5E62] transition-colors"
                  >
                    <MessageSquare className="w-4 h-4" aria-hidden="true" />
                    <span>Prefer direct commercial advisor discussion? Chat on WhatsApp →</span>
                  </a>

                  <div className="pt-4 border-t border-[#E3E4E6] flex flex-wrap items-center gap-6 text-[14px]">
                    <Link
                      to="/residential"
                      className="font-medium text-[#5C5E62] hover:text-[#171A20] transition-colors"
                    >
                      Solar Panels →
                    </Link>
                    <Link
                      to="/omnigrid"
                      className="font-medium text-[#5C5E62] hover:text-[#171A20] transition-colors"
                    >
                      Solar + Storage →
                    </Link>
                    <Link
                      to="/deploy"
                      className="font-medium text-[#5C5E62] hover:text-[#171A20] transition-colors"
                    >
                      Design Studio →
                    </Link>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-7 rounded-[8px] bg-[#F4F4F4] p-6 sm:p-8 lg:p-10">
                <form onSubmit={handleSubmitRfp} className="space-y-5">
                  {submitError && (
                    <div className="p-3.5 bg-[#B42318]/10 border border-[#B42318]/30 rounded-[4px] text-[#B42318] text-[13px] flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{submitError}</span>
                    </div>
                  )}

                  <div>
                    <label
                      htmlFor="rfp-name"
                      className="block text-[12px] font-medium text-[#171A20] uppercase tracking-[0.06em] mb-1.5"
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
                      className="w-full min-h-[44px] px-3.5 bg-[#FFFFFF] border border-[#D0D2D6] rounded-[4px] text-[14px] text-[#171A20] placeholder:text-[#8E9094] transition-colors focus:border-[#171A20] focus:ring-1 focus:ring-[#171A20] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="rfp-phone"
                      className="block text-[12px] font-medium text-[#171A20] uppercase tracking-[0.06em] mb-1.5"
                    >
                      Mobile Phone / WhatsApp (+91) *
                    </label>
                    <div className="relative flex items-center">
                      <span className="absolute left-3.5 text-[13px] font-medium text-[#5C5E62] select-none pointer-events-none border-r border-[#E3E4E6] pr-2.5">
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
                        className="w-full min-h-[44px] pl-16 pr-3.5 bg-[#FFFFFF] border border-[#D0D2D6] rounded-[4px] text-[14px] text-[#171A20] placeholder:text-[#8E9094] transition-colors focus:border-[#171A20] focus:ring-1 focus:ring-[#171A20] focus:outline-none tabular-nums"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="rfp-company"
                        className="block text-[12px] font-medium text-[#171A20] uppercase tracking-[0.06em] mb-1.5"
                      >
                        Company / Facility Name
                      </label>
                      <input
                        id="rfp-company"
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="e.g. Commercial facility or business name"
                        className="w-full min-h-[44px] px-3.5 bg-[#FFFFFF] border border-[#D0D2D6] rounded-[4px] text-[14px] text-[#171A20] placeholder:text-[#8E9094] transition-colors focus:border-[#171A20] focus:ring-1 focus:ring-[#171A20] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="rfp-website"
                        className="block text-[12px] font-medium text-[#171A20] uppercase tracking-[0.06em] mb-1.5"
                      >
                        Company Website (Optional)
                      </label>
                      <input
                        id="rfp-website"
                        type="text"
                        value={companyWebsite}
                        onChange={(e) => setCompanyWebsite(e.target.value)}
                        placeholder="e.g. company.in"
                        className="w-full min-h-[44px] px-3.5 bg-[#FFFFFF] border border-[#D0D2D6] rounded-[4px] text-[14px] text-[#171A20] placeholder:text-[#8E9094] transition-colors focus:border-[#171A20] focus:ring-1 focus:ring-[#171A20] focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Visually hidden honeypot field */}
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
                  <div className="p-4 rounded-[4px] bg-[#FFFFFF] border border-[#E3E4E6] flex items-start gap-3">
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
                      interconnection, prepare a commercial solar proposal, and contact me in
                      accordance with the <strong>DPDP Act 2023</strong>. Project details may be
                      shared only as necessary with authorized WAVENOX delivery partners and utility
                      authorities, and are never sold to third-party lead aggregators. See our{" "}
                      <a href="/legal/privacy" className="underline hover:text-[#171A20]">
                        Privacy Policy
                      </a>
                      .
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || !consentGiven}
                    className="w-full min-h-[44px] py-2.5 px-6 rounded-[4px] bg-[#171A20] text-[#FFFFFF] text-[14px] font-medium tracking-[0.015em] hover:bg-[#2B2F36] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ShieldCheck className="w-4 h-4" aria-hidden="true" />
                    <span>
                      {isSubmitting ? "Generating Assessment..." : "Request Commercial Proposal"}
                    </span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>

        {/* SEC 6: BOOKEND CLOSING CTA (16:9 DESKTOP / 4:5 MOBILE) */}
        <Panel
          id="consultation"
          height="closing"
          media={media["commercial-closing"]}
          mobileNaturalFrame={true}
          tone="dark"
          className="scroll-mt-14"
          title="Deploy Commercial Solar with WAVENOX"
          lead="Turn idle industrial rooftops into reliable 25-year clean energy infrastructure."
          actions={
            <>
              <Button
                onClick={scrollToAssessment}
                variant="primary"
                tone="dark"
                className="w-full sm:w-auto sm:min-w-[204px]"
              >
                Request Assessment
              </Button>
              <Button
                to="/deploy"
                variant="secondary"
                tone="dark"
                className="w-full sm:w-auto sm:min-w-[204px]"
              >
                Open Design Studio
              </Button>
            </>
          }
        />
      </main>

      <Footer />

      {/* Specifications Drawer */}
      <SpecsDrawer open={specsOpen} onOpenChange={setSpecsOpen} categories={ENTERPRISE_SPECS} />
    </div>
  );
}
