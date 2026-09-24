import * as React from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Panel, QuietSection, StatRow, Button, TextLink, SpecsDrawer } from "@/components/system";
import { media } from "@/config/media";
import { BRAND_CONFIG } from "@/config/brand";
import { submitLead } from "@/functions/leads";
import { getStoredTelemetry } from "@/lib/telemetry";

export const Route = createFileRoute("/enterprise")({
  head: () => ({
    meta: [
      { title: `Commercial Solar — ${BRAND_CONFIG.name}` },
      {
        name: "description",
        content:
          "Turn idle industrial rooftops into high-yield clean energy assets. 40% accelerated tax depreciation under Section 32, zero-downtime microgrids, and 25-year linear warranties.",
      },
      { property: "og:title", content: `Commercial Solar — ${BRAND_CONFIG.name}` },
      {
        property: "og:description",
        content:
          "High-capacity rooftop solar infrastructure for manufacturing plants, cold storage, and corporate campuses.",
      },
      { property: "og:image", content: "/media/commercial-hero-1600w.jpg" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      {
        rel: "preload",
        as: "image",
        href: "/media/commercial-hero-1600w.webp",
        media: "(min-width: 768px)",
        type: "image/webp",
      },
      {
        rel: "preload",
        as: "image",
        href: "/media/commercial-hero-mobile.webp",
        media: "(max-width: 767px)",
        type: "image/webp",
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

  // RFP Form State
  const [clientName, setClientName] = React.useState("");
  const [companyName, setCompanyName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [companyWebsite, setCompanyWebsite] = React.useState("");
  const [consentGiven, setConsentGiven] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  // Calculations: ~100 sq.ft per kWp commercial solar
  const capacityKw = React.useMemo(() => Math.round(roofAreaSqFt / 100), [roofAreaSqFt]);
  const capacityMw = React.useMemo(() => (capacityKw / 1000).toFixed(2), [capacityKw]);
  const annualUnitsKwh = React.useMemo(() => Math.round(capacityKw * 1550), [capacityKw]);
  const annualSavingsInr = React.useMemo(
    () => Math.round(annualUnitsKwh * commercialTariff),
    [annualUnitsKwh, commercialTariff],
  );
  const estCapexInr = React.useMemo(() => Math.round(capacityKw * 42000), [capacityKw]);
  const year1TaxShieldInr = React.useMemo(
    () => Math.round(estCapexInr * 0.4 * 0.2517),
    [estCapexInr],
  );
  const estPaybackYears = React.useMemo(
    () => (estCapexInr / Math.max(1, annualSavingsInr)).toFixed(1),
    [estCapexInr, annualSavingsInr],
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
          city: companyName ? `${companyName} Facility` : "Industrial Rooftop",
          property_tier: "commercial",
          roof_area_sqft: roofAreaSqFt,
          system_kw: capacityKw,
          net_price_inr: estCapexInr,
          source: "enterprise",
          notes: `Commercial proposal for ${roofAreaSqFt.toLocaleString("en-IN")} sq.ft (~${capacityMw} MWp). Tariff: ₹${commercialTariff}/unit.`,
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

      {/* 1. PANEL: commercial-hero */}
      <Panel
        id="commercial"
        media={media["commercial-hero"]}
        priority={true}
        tone="dark"
        title="Commercial Solar"
        lead="Turn industrial rooftops into clean energy assets with high-yield bifacial arrays."
        stats={
          <StatRow
            stats={[
              { value: "40%", label: "Tax Depreciation" },
              { value: "3 to 4 Yrs", label: "Average Payback" },
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
        disclaimer="*Accelerated depreciation under Section 32 of Income Tax Act. Consult your financial advisor."
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
        lead="Estimate system capacity, annual energy savings, and Year 1 Section 32 tax shields."
      >
        <div className="max-w-2xl mx-auto space-y-10">
          {/* Controls */}
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between items-baseline">
                <span className="text-[13px] font-medium text-[#5C5E62]">Usable Rooftop Area</span>
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
          </div>

          {/* Big Number Output */}
          <div className="text-center pt-4 border-t border-[#E3E4E6] space-y-2">
            <div className="text-[36px] sm:text-[48px] font-medium tracking-tight tabular-nums text-[#171A20]">
              ₹{formatInr(annualSavingsInr)}
            </div>
            <div className="text-[13px] text-[#5C5E62]">Estimated Annual Electricity Savings</div>
          </div>

          {/* Stat Row */}
          <div className="pt-2">
            <StatRow
              stats={[
                {
                  value: `${capacityMw} MWp`,
                  label: "Plant Capacity",
                  sublabel: `~${capacityKw} kWp`,
                },
                {
                  value: `₹${formatInr(year1TaxShieldInr)}`,
                  label: "Year 1 Tax Shield",
                  sublabel: "Sec 32 Depreciation",
                },
                {
                  value: `${estPaybackYears} Yrs`,
                  label: "Estimated Payback",
                  sublabel: "Capex Recovery",
                },
              ]}
            />
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
              <div className="p-4 bg-[#B42318]/10 border border-[#B42318]/30 rounded-[4px] text-[#B42318] text-[13px]">
                {submitError}
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="rfp-name" className="text-[13px] font-medium text-[#5C5E62]">
                Full Name *
              </label>
              <input
                id="rfp-name"
                type="text"
                required
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Ramesh Varma"
                className="w-full h-10 px-3 bg-[#FFFFFF] border border-[#E3E4E6] rounded-[4px] text-[14px] text-[#171A20] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#171A20]"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="rfp-phone" className="text-[13px] font-medium text-[#5C5E62]">
                Mobile Phone (+91) *
              </label>
              <input
                id="rfp-phone"
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full h-10 px-3 bg-[#FFFFFF] border border-[#E3E4E6] rounded-[4px] text-[14px] text-[#171A20] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#171A20]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="rfp-company" className="text-[13px] font-medium text-[#5C5E62]">
                  Company / Facility Name
                </label>
                <input
                  id="rfp-company"
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Apex Manufacturing Ltd"
                  className="w-full h-10 px-3 bg-[#FFFFFF] border border-[#E3E4E6] rounded-[4px] text-[14px] text-[#171A20] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#171A20]"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="rfp-website" className="text-[13px] font-medium text-[#5C5E62]">
                  Company Website (Optional)
                </label>
                <input
                  id="rfp-website"
                  type="text"
                  value={companyWebsite}
                  onChange={(e) => setCompanyWebsite(e.target.value)}
                  placeholder="apexmanufacturing.in"
                  className="w-full h-10 px-3 bg-[#FFFFFF] border border-[#E3E4E6] rounded-[4px] text-[14px] text-[#171A20] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#171A20]"
                />
              </div>
            </div>

            {/* DPDP Act 2023 Consent */}
            <div className="pt-2 flex items-start gap-3">
              <input
                id="rfp-consent"
                type="checkbox"
                required
                checked={consentGiven}
                onChange={(e) => setConsentGiven(e.target.checked)}
                className="mt-1 h-4 w-4 rounded-[4px] border-[#E3E4E6] text-[#171A20] focus-visible:ring-2 focus-visible:ring-[#171A20] cursor-pointer"
              />
              <label
                htmlFor="rfp-consent"
                className="text-[12px] text-[#5C5E62] leading-normal cursor-pointer select-none"
              >
                I authorize WAVENOX engineers to contact me via phone, WhatsApp, and email regarding
                commercial rooftop solar feasibility under our DPDP Act 2023 privacy policy.
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !consentGiven}
              className="w-full h-10 px-6 rounded-[4px] bg-[#171A20] text-[#FFFFFF] text-[14px] font-medium hover:bg-[#171A20]/90 transition-colors flex items-center justify-center cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Submitting Request..." : "Request Commercial Proposal"}
            </button>

            <div className="text-center pt-2">
              <TextLink href={BRAND_CONFIG.contact.whatsapp.link} arrow>
                Or chat with commercial advisor on WhatsApp
              </TextLink>
            </div>
          </form>
        </div>
      </QuietSection>

      <Footer />

      {/* Specifications Drawer */}
      <SpecsDrawer open={specsOpen} onOpenChange={setSpecsOpen} />
    </div>
  );
}
