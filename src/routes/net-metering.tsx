import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import {
  Zap,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  ExternalLink,
  ShieldCheck,
  Building2,
  HelpCircle,
  ArrowRight,
  MessageSquare,
} from "lucide-react";
import { BRAND_CONFIG } from "@/config/brand";
import { openConsultationDrawer } from "@/components/ConsultationDrawer";
import { DISCOMS } from "@/config/solar";
import { submitLead } from "@/functions/leads";

export const Route = createFileRoute("/net-metering")({
  head: () => ({
    meta: [
      {
        title: `DISCOM Net-Metering & Feeder Sanction Guide — ${BRAND_CONFIG.name}`,
      },
      {
        name: "description",
        content:
          "Authoritative guide to rooftop solar net-metering approvals, transformer DT load capacity rules, and PM Surya Ghar subsidy sanctions across TGSPDCL, APEPDCL, BESCOM, and MSEDCL.",
      },
      {
        property: "og:title",
        content: `DISCOM Net-Metering & Feeder Sanction Guide — ${BRAND_CONFIG.name}`,
      },
      {
        property: "og:description",
        content:
          "Calculate your permissible solar capacity, metering class, and sanction timeline under State Electricity Regulatory Commission (SERC) codes.",
      },
      { property: "og:image", content: `${BRAND_CONFIG.domain}/media/home-hero-1600w.jpg` },
      { property: "og:url", content: `${BRAND_CONFIG.domain}/net-metering` },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: `${BRAND_CONFIG.domain}/net-metering` }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "TechArticle",
          headline:
            "State DISCOM Net-Metering Feasibility, Transformer Load Allocations & PM Surya Ghar Subsidy Guide",
          description:
            "Statutory engineering reference for rooftop solar net-metering approvals across TGSPDCL, APEPDCL, BESCOM, and other Indian electrical utilities.",
          author: {
            "@type": "Organization",
            name: BRAND_CONFIG.name,
            url: BRAND_CONFIG.domain,
          },
          publisher: {
            "@type": "Organization",
            name: BRAND_CONFIG.name,
            logo: `${BRAND_CONFIG.domain}/favicon.ico`,
          },
        }),
      },
    ],
  }),
  component: NetMeteringPage,
});

interface DiscomRegulatoryData {
  code: string;
  name: string;
  state: string;
  portalUrl: string;
  portalName: string;
  maxSolarCapacityPct: number;
  sanctionDays: number;
  meterTypeSinglePhaseLimitKw: number;
  meterTypeWholeCurrentLimitKw: number;
  inspectionRequired: boolean;
}

const REGULATORY_DATA: Record<string, DiscomRegulatoryData> = {
  TGSPDCL: {
    code: "TGSPDCL",
    name: "Telangana Southern Power Distribution Company",
    state: "Telangana",
    portalUrl: "https://tgsouthernpower.org",
    portalName: "TGSPDCL Official Consumer Portal",
    maxSolarCapacityPct: 100, // Up to 100% of sanctioned connected load
    sanctionDays: 15, // MoP 2024 statutory limit
    meterTypeSinglePhaseLimitKw: 5,
    meterTypeWholeCurrentLimitKw: 19,
    inspectionRequired: true,
  },
  TGNPDCL: {
    code: "TGNPDCL",
    name: "Telangana Northern Power Distribution Company",
    state: "Telangana",
    portalUrl: "https://tgnpdcl.com",
    portalName: "TGNPDCL Official Portal",
    maxSolarCapacityPct: 100,
    sanctionDays: 15,
    meterTypeSinglePhaseLimitKw: 5,
    meterTypeWholeCurrentLimitKw: 19,
    inspectionRequired: true,
  },
};

const REQUIRED_DOCUMENTS = [
  {
    name: "Latest Paid Electricity Bill",
    desc: "Must display the unique Service Connection Number (USC No.), sanctioned load in kW, and tariff category (LT-1 Residential or HT Commercial).",
  },
  {
    name: "Rooftop Ownership Title / Property Tax Deed",
    desc: "Municipal property tax receipt, registered sale deed, or NOC from developer confirming exclusive terrace usage rights.",
  },
  {
    name: "Aadhaar Card of Electricity Account Holder",
    desc: "Matches the exact name on the DISCOM utility meter for PM Surya Ghar national portal identity synchronization.",
  },
  {
    name: "Cancelled Bank Cheque",
    desc: "Required for Direct Benefit Transfer (DBT) credit of the Central Government PM Surya Ghar subsidy (up to ₹78,000).",
  },
];

function NetMeteringPage() {
  const [selectedCode, setSelectedCode] = React.useState("TGSPDCL");
  const [sanctionedLoadKw, setSanctionedLoadKw] = React.useState(15);
  const [serviceNum, setServiceNum] = React.useState("");
  const [pinCode, setPinCode] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [consentGiven, setConsentGiven] = React.useState(false);
  const [hpExtra, setHpExtra] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [submissionResult, setSubmissionResult] = React.useState<{
    referenceCode?: string;
    isDemo?: boolean;
  } | null>(null);

  const reg = REGULATORY_DATA[selectedCode] || REGULATORY_DATA["TGSPDCL"];
  const permissibleSolarKw = (sanctionedLoadKw * (reg.maxSolarCapacityPct / 100)).toFixed(1);

  let meterCategory = "Three-Phase Whole-Current Bi-Directional Meter";
  if (sanctionedLoadKw <= reg.meterTypeSinglePhaseLimitKw) {
    meterCategory = "Single-Phase Bi-Directional Net-Meter";
  } else if (sanctionedLoadKw > reg.meterTypeWholeCurrentLimitKw) {
    meterCategory = "Three-Phase CT/PT Operated Net-Meter with AMR (Automated Meter Reading)";
  }

  const handleFeasibilityCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consentGiven) {
      setSubmitError(
        "Please confirm your consent to be contacted regarding net-metering feasibility.",
      );
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const res = await submitLead({
        data: {
          name: `Consumer USC-${serviceNum.trim()}`,
          phone,
          city: "Hyderabad",
          pin_code: pinCode.trim(),
          property_tier: "villa",
          discom_code: selectedCode,
          system_kw: Number(permissibleSolarKw),
          source: "net_metering",
          notes: `Feasibility check for USC: ${serviceNum} under ${selectedCode}. Sanctioned load: ${sanctionedLoadKw} kW. Permissible solar: ${permissibleSolarKw} kW.`,
          consent_given: true,
          consent_version: "2026-09-v1",
          hp_extra: hpExtra.trim() || undefined,
        },
      });

      if (!res.success) {
        setSubmitError(res.message);
        setIsSubmitting(false);
        return;
      }

      setSubmissionResult({
        referenceCode: res.referenceCode,
        isDemo: res.isDemo ?? true,
      });
    } catch (err: unknown) {
      console.error("[NetMetering] Feasibility error:", err);
      setSubmitError("Failed to record feasibility check. Please reach us via WhatsApp.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const whatsappHref = `${BRAND_CONFIG.contact.whatsappLink}?text=${encodeURIComponent(
    `Hello WAVENOX Liaison Team, I would like to check net-metering feeder clearance for my service connection in ${reg.name} (${reg.code}). Sanctioned load: ${sanctionedLoadKw} kW.`,
  )}`;

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-[#171A20] selection:bg-[#171A20] selection:text-white flex flex-col justify-between">
      <Header />

      <main className="flex-1 pt-28 pb-20">
        {/* Page Hero */}
        <section className="px-6 sm:px-12 max-w-5xl mx-auto w-full text-center space-y-6 pt-8 pb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F4F4F4] text-[#5C5E62] text-[11px] font-semibold uppercase tracking-widest">
            <Zap className="w-3.5 h-3.5 text-[#F57C00]" />
            <span>State Regulatory Engine</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-medium tracking-tight text-[#171A20] max-w-3xl mx-auto leading-[1.1]">
            DISCOM Net-Metering &amp; Feeder Feasibility
          </h1>

          <p className="text-[16px] sm:text-[18px] text-[#5C5E62] max-w-2xl mx-auto leading-relaxed">
            Eliminating regulatory ambiguity. WAVENOX manages 100% of the DISCOM engineering
            applications, technical feasibility studies, bi-directional meter synchronization, and
            PM Surya Ghar subsidies for your estate.
          </p>
        </section>

        {/* Interactive Regulatory Calculator */}
        <section className="px-6 sm:px-12 max-w-5xl mx-auto w-full mb-16">
          <div className="p-8 sm:p-10 rounded-[8px] bg-[#FFFFFF] border border-[#E3E4E6] shadow-sm space-y-8">
            <div className="border-b border-[#E3E4E6] pb-4">
              <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#171A20]">
                Interactive Permissible Capacity &amp; Metering Engine
              </h2>
              <p className="text-xs text-[#5C5E62] mt-1">
                Select your designated electricity distribution utility to calculate your statutory
                solar limits.
              </p>
            </div>

            {/* Inputs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* DISCOM Select */}
              <div>
                <label className="block text-[11px] font-semibold text-[#171A20] uppercase tracking-wider mb-2">
                  Designated Distribution Utility (DISCOM)
                </label>
                <div className="space-y-2">
                  {Object.values(REGULATORY_DATA).map((item) => (
                    <button
                      key={item.code}
                      type="button"
                      onClick={() => setSelectedCode(item.code)}
                      className={`w-full p-3.5 rounded-[4px] border text-left transition-all cursor-pointer flex items-center justify-between ${
                        selectedCode === item.code
                          ? "border-[#171A20] bg-[#F4F4F4] text-[#171A20]"
                          : "border-[#E3E4E6] bg-[#FFFFFF] text-[#5C5E62] hover:border-[#171A20]/40"
                      }`}
                    >
                      <div>
                        <div className="text-[13px] font-semibold text-[#171A20]">
                          {item.name} ({item.code})
                        </div>
                        <div className="text-[11px] text-[#5C5E62] mt-0.5">
                          {item.state} · Turnkey Net-Metering Sanctioned
                        </div>
                      </div>
                      {selectedCode === item.code && (
                        <CheckCircle2 className="w-4 h-4 text-[#171A20] shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Connected Load Slider */}
              <div className="flex flex-col justify-between space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[11px] font-semibold text-[#171A20] uppercase tracking-wider">
                      Sanctioned Connected Load (kW)
                    </label>
                    <span className="font-mono text-[18px] font-bold text-[#171A20]">
                      {sanctionedLoadKw} kW
                    </span>
                  </div>
                  <input
                    type="range"
                    min={3}
                    max={50}
                    step={1}
                    value={sanctionedLoadKw}
                    onChange={(e) => setSanctionedLoadKw(Number(e.target.value))}
                    className="range-slider w-full"
                  />
                  <div className="flex justify-between text-[11px] text-[#5C5E62] mt-2 font-mono">
                    <span>3 kW (Studio Villa)</span>
                    <span>15 kW (Estate)</span>
                    <span>50 kW (Mansion)</span>
                  </div>
                  <p className="text-[11px] text-[#5C5E62] mt-3 leading-relaxed">
                    * Found on your monthly electricity bill under &quot;Sanctioned Load&quot; or
                    &quot;Contracted Demand&quot;.
                  </p>
                </div>

                {/* Calculation Output Box */}
                <div className="p-5 rounded-[6px] bg-[#F8F9FA] border border-[#E9ECEF] space-y-3 font-mono text-[12px]">
                  <div className="flex justify-between border-b border-[#E3E4E6] pb-2">
                    <span className="text-[#5C5E62]">Permissible Solar Capacity:</span>
                    <span className="font-bold text-[#171A20] text-[14px]">
                      Up to {permissibleSolarKw} kWp DC
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-[#E3E4E6] pb-2">
                    <span className="text-[#5C5E62]">Technical Feasibility:</span>
                    <span className="text-[#171A20] text-right font-sans font-medium text-[11px] max-w-[200px]">
                      {sanctionedLoadKw <= 10
                        ? "Waived / Deemed Approved (≤ 10 kW)"
                        : "Subject to DT Feeder Capacity"}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-[#E3E4E6] pb-2">
                    <span className="text-[#5C5E62]">Metering Classification:</span>
                    <span className="text-[#171A20] text-right font-sans font-medium text-[11px] max-w-[200px]">
                      {meterCategory}
                    </span>
                  </div>
                  <div className="flex justify-between text-[#2E7D32] pt-1">
                    <span className="font-medium">Estimated Sanction Timeline:</span>
                    <span className="font-bold">~{reg.sanctionDays} Business Days</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4 Required Statutory Documents */}
        <section className="px-6 sm:px-12 max-w-5xl mx-auto w-full py-16 border-t border-[#E3E4E6]">
          <div className="text-center max-w-xl mx-auto mb-12 space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#5C5E62]">
              Liaison Checklist
            </h2>
            <h3 className="text-2xl sm:text-3xl font-medium tracking-tight text-[#171A20]">
              Statutory Documentation Requirements
            </h3>
            <p className="text-[14px] text-[#5C5E62]">
              We handle all paperwork and physical utility inspections. You only provide these 4
              documents.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {REQUIRED_DOCUMENTS.map((doc, idx) => (
              <div
                key={doc.name}
                className="p-6 rounded-[6px] bg-[#FFFFFF] border border-[#E3E4E6] shadow-xs flex items-start gap-4"
              >
                <div className="w-8 h-8 rounded-full bg-[#171A20] text-[#FFFFFF] text-[12px] font-bold font-mono flex items-center justify-center shrink-0">
                  0{idx + 1}
                </div>
                <div>
                  <h4 className="text-[15px] font-semibold text-[#171A20]">{doc.name}</h4>
                  <p className="text-[13px] text-[#5C5E62] leading-relaxed mt-1">{doc.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Service Connection Feasibility Inquiry */}
        <section className="px-6 sm:px-12 max-w-4xl mx-auto w-full py-16 border-t border-[#E3E4E6]">
          <div className="p-8 sm:p-12 rounded-[8px] bg-[#FFFFFF] border border-[#E3E4E6] shadow-sm space-y-6">
            <div className="text-center space-y-2 max-w-xl mx-auto">
              <div className="text-xs font-bold uppercase tracking-widest text-[#5C5E62]">
                Instant Feasibility Verification
              </div>
              <h3 className="text-2xl sm:text-3xl font-medium tracking-tight text-[#171A20]">
                Verify Your Transformer DT Clearance
              </h3>
              <p className="text-[14px] text-[#5C5E62] leading-relaxed">
                Provide your Service Connection Number to let our regulatory liaison team verify
                available feeder capacity on your local distribution transformer.
              </p>
            </div>

            {submissionResult ? (
              <div className="p-6 rounded-[6px] bg-[#F0FDF4] border border-[#DCFCE7] text-center space-y-4">
                <CheckCircle2 className="w-8 h-8 text-[#16A34A] mx-auto" />
                <h4 className="text-[17px] font-semibold text-[#166534]">
                  Feasibility Request Logged ({submissionResult.referenceCode || "WNX-FEASIBILITY"})
                </h4>
                <p className="text-[13px] text-[#15803D] max-w-md mx-auto leading-relaxed">
                  {submissionResult.isDemo
                    ? `Portfolio Concept Demo: As WAVENOX is a design portfolio concept, no live automated query is dispatched to ${reg.code} servers. You can check your actual feeder load directly on the official ${reg.portalName} or discuss with our engineers on WhatsApp.`
                    : `Your feasibility assessment request has been recorded for ${reg.code}. You can also view official feeder capacity guidelines directly on ${reg.portalName}.`}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <a
                    href={reg.portalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[4px] bg-[#16A34A] text-white text-[13px] font-medium hover:bg-[#15803D] transition-colors"
                  >
                    <span>Visit {reg.portalName}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[4px] border border-[#16A34A] text-[#166534] text-[13px] font-medium hover:bg-[#DCFCE7] transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Discuss on WhatsApp</span>
                  </a>
                </div>
              </div>
            ) : (
              <form onSubmit={handleFeasibilityCheck} className="space-y-4 max-w-xl mx-auto pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="net-service-num"
                      className="block text-[11px] font-semibold text-[#171A20] uppercase tracking-wider mb-1.5"
                    >
                      Service Connection / USC Number *
                    </label>
                    <input
                      id="net-service-num"
                      type="text"
                      required
                      value={serviceNum}
                      onChange={(e) => setServiceNum(e.target.value)}
                      placeholder="e.g. 1002345892"
                      className="w-full h-11 px-3.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-[6px] text-[14px] text-[#171A20] placeholder:text-[#9CA3AF] focus:bg-[#FFFFFF] focus:border-[#171A20] focus:ring-1 focus:ring-[#171A20] focus:outline-none tabular-nums"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="net-pincode"
                      className="block text-[11px] font-semibold text-[#171A20] uppercase tracking-wider mb-1.5"
                    >
                      6-Digit Postal PIN Code *
                    </label>
                    <input
                      id="net-pincode"
                      type="text"
                      required
                      maxLength={6}
                      pattern="[1-9][0-9]{5}"
                      inputMode="numeric"
                      value={pinCode}
                      onChange={(e) => setPinCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      placeholder="e.g. 500033"
                      className="w-full h-11 px-3.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-[6px] text-[14px] text-[#171A20] placeholder:text-[#9CA3AF] focus:bg-[#FFFFFF] focus:border-[#171A20] focus:ring-1 focus:ring-[#171A20] focus:outline-none tabular-nums"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="net-phone"
                    className="block text-[11px] font-semibold text-[#171A20] uppercase tracking-wider mb-1.5"
                  >
                    Mobile Number / WhatsApp (+91) *
                  </label>
                  <input
                    id="net-phone"
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="10-digit mobile number"
                    maxLength={14}
                    className="w-full h-11 px-3.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-[6px] text-[14px] text-[#171A20] placeholder:text-[#9CA3AF] focus:bg-[#FFFFFF] focus:border-[#171A20] focus:ring-1 focus:ring-[#171A20] focus:outline-none tabular-nums"
                  />
                </div>

                {/* Bot suppression honeypot */}
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
                    id="net-hp-extra"
                    tabIndex={-1}
                    autoComplete="off"
                    value={hpExtra}
                    onChange={(e) => setHpExtra(e.target.value)}
                  />
                </div>

                {/* DPDP Consent */}
                <div className="p-3.5 rounded-[6px] bg-[#F9FAFB] border border-[#E5E7EB] flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="net-consent"
                    required
                    checked={consentGiven}
                    onChange={(e) => setConsentGiven(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded-[4px] border-[#CBD5E1] text-[#171A20] focus:ring-1 focus:ring-[#171A20] cursor-pointer shrink-0"
                  />
                  <label
                    htmlFor="net-consent"
                    className="text-[12px] text-[#5C5E62] leading-relaxed cursor-pointer select-none"
                  >
                    I authorize WAVENOX to review my service connection details and contact me
                    regarding net-metering feasibility in accordance with the{" "}
                    <strong>DPDP Act 2023</strong>. Data is processed solely for feasibility
                    estimation and never shared. You may withdraw consent anytime via our{" "}
                    <a href="/legal/privacy" className="underline hover:text-[#171A20]">
                      Privacy Policy
                    </a>
                    .
                  </label>
                </div>

                {submitError && (
                  <div className="p-3.5 rounded-[6px] bg-[#B42318]/10 border border-[#B42318]/30 text-[#B42318] text-[12px]">
                    {submitError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting || !consentGiven}
                  className="w-full h-12 rounded-[6px] bg-[#171A20] text-[#FFFFFF] text-[14px] font-medium tracking-wide hover:bg-[#2C3038] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ShieldCheck className="w-4 h-4 text-[#F57C00]" />
                  <span>
                    {isSubmitting
                      ? "Submitting Request..."
                      : "Verify Feeder Clearance & Sanction Lead Time"}
                  </span>
                </button>
              </form>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
