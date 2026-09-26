import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import {
  Compass,
  Layers,
  ShieldCheck,
  Wind,
  Download,
  FileCode2,
  CheckCircle2,
  ArrowRight,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { BRAND_CONFIG } from "@/config/brand";
import { openConsultationDrawer } from "@/lib/consultation";
import { PRODUCTS_CONFIG } from "@/config/products";
import { submitLead } from "@/functions/leads";

export const Route = createFileRoute("/architects")({
  head: () => ({
    meta: [
      {
        title: `Architectural Solar & Technical Specifications — ${BRAND_CONFIG.name}`,
      },
      {
        name: "description",
        content:
          "Turnkey rooftop solar integration for architects, interior designers, and luxury estate builders in India. Zero-penetration structural engineering, concealed conduit raceways, IS 875 (Part 3) 44 m/s wind resilience, and CAD specifications.",
      },
      {
        property: "og:title",
        content: `Architectural Solar & Technical Specifications — ${BRAND_CONFIG.name}`,
      },
      {
        property: "og:description",
        content:
          "Engineering solar into modern architectural design language. Concealed conduits, zero terrace punctures, and IS 875 (Part 3) 44 m/s wind-load design.",
      },
      { property: "og:image", content: `${BRAND_CONFIG.domain}/media/home-hero-1600w.jpg` },
      { property: "og:url", content: `${BRAND_CONFIG.domain}/architects` },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: `${BRAND_CONFIG.domain}/architects` }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Service",
          name: `${BRAND_CONFIG.name} Architectural Solar Design`,
          description:
            "Turnkey rooftop solar integration for architects and residential builders in India. Zero-penetration structural engineering, concealed conduit raceways, and CAD specifications.",
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
  component: ArchitectsPage,
});

const ARCHITECT_PILLARS = [
  {
    icon: Layers,
    title: "Zero-Puncture Terrace Membrane Preservation",
    desc: "Our non-penetrative structural ballast clamps and perimeter parapet anchors protect 100% of the builder's waterproofing membrane, engineered to IS 875 standards.",
  },
  {
    icon: Compass,
    title: "Concealed Architectural Raceways",
    desc: "Zero visible conduits or dangling wiring. DC cables and smart switchgear route through sub-slab conduits or custom color-matched architectural chases that blend into exterior walls.",
  },
  {
    icon: Wind,
    title: "IS 875 (Part 3) Wind Load Engineering (44 m/s)",
    desc: "Engineered with structural 6005-T5 anodized aluminum and marine-grade SS304 fasteners to meet IS 875 (Part 3) basic wind speed standards (44 m/s in Hyderabad; 50 m/s in coastal zones).",
  },
];

const BIM_SPECS = [
  {
    category: "580W N-Type TOPCon Bifacial PV Module (Reference Standard)",
    dimensions: "2278 mm (L) × 1134 mm (W) × 30 mm (H)",
    weight: "28.5 kg / module",
    loading: "5400 Pa front (downward static / snow load) / 2400 Pa rear (wind uplift)",
    cadFormats: "DWG · DXF · IFC",
  },
  {
    category: "Modular High-Voltage LiFePO4 Energy Storage (Concept Reference)",
    dimensions: "580 mm (W) × 1200 mm (H) × 380 mm (D) vertical stack",
    weight: "165 kg (3 × 4.8 kWh stackable modules + BMS)",
    mounting: "Floor-standing plinth (IP65 rated)",
    cadFormats: "DWG · 3D STEP",
  },
  {
    category: "Three-Phase Hybrid String Inverter",
    dimensions: "580 mm (W) × 650 mm (H) × 230 mm (D)",
    weight: "32 kg",
    acoustics: "< 35 dBA whisper quiet convection cooling",
    cadFormats: "DWG · DXF",
  },
  {
    category: "Elevated Terrace Pergola Living Canopy",
    dimensions: "Custom spans (2.4m to 3.2m clear height)",
    material: "Structural 6005-T5 Anodized Architectural Aluminum",
    finish: "Matte Black Anodized (25-micron coating)",
    cadFormats: "Structural Layouts · Single-Line Diagrams",
  },
];

function ArchitectsPage() {
  const [studioName, setStudioName] = React.useState("");
  const [contactName, setContactName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [projectLocation, setProjectLocation] = React.useState("");
  const [hpExtra, setHpExtra] = React.useState("");
  const [consentGiven, setConsentGiven] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [submissionResult, setSubmissionResult] = React.useState<{
    referenceCode?: string;
    isDemo: boolean;
  } | null>(null);

  const whatsappText = `Hello WAVENOX Architectural Team, I am an architect / interior designer and would like to review rooftop solar CAD/BIM specifications and schedule a technical consultation.`;
  const whatsappUrl = `${BRAND_CONFIG.contact.whatsappLink}?text=${encodeURIComponent(whatsappText)}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consentGiven) {
      setSubmitError(
        "Please confirm your consent to be contacted regarding CAD/BIM specifications.",
      );
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const res = await submitLead({
        data: {
          name: contactName.trim(),
          phone: phone.trim(),
          city: projectLocation.trim() || "Hyderabad",
          property_tier: "villa",
          company_name: studioName.trim(),
          source: "architects",
          notes: `Architectural CAD/BIM inquiry from ${studioName.trim()} (${contactName.trim()}) for project in ${projectLocation.trim()}.`,
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
      console.error("[Architects] Lead submission error:", err);
      setSubmitError("Failed to record architectural inquiry. Please reach us via WhatsApp.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-[#171A20] selection:bg-[#171A20] selection:text-white flex flex-col justify-between">
      <Header />

      <main className="flex-1 pt-28 pb-20">
        {/* Hero Section */}
        <section className="px-6 sm:px-12 max-w-5xl mx-auto w-full text-center space-y-6 pt-8 pb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F4F4F4] text-[#5C5E62] text-[12px] font-semibold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5 text-[#F57C00]" />
            <span>Architectural Collaboration</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-medium tracking-tight text-[#171A20] max-w-3xl mx-auto leading-[1.1]">
            Clean Energy in Your Design Language
          </h1>

          <p className="text-[16px] sm:text-[18px] text-[#5C5E62] max-w-2xl mx-auto leading-relaxed">
            We partner with architects, structural engineers, and luxury villa developers to
            integrate clean rooftop power into modern residences without compromising form or
            terrace usability.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              type="button"
              onClick={() => openConsultationDrawer()}
              className="w-full sm:w-auto min-w-[220px] h-12 px-6 rounded-[4px] bg-[#171A20] text-[#FFFFFF] text-[14px] font-medium tracking-wide hover:bg-[#2C3038] transition-colors cursor-pointer"
            >
              Request Architectural Specs
            </button>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto min-w-[200px] h-12 px-6 rounded-[4px] border border-[#E3E4E6] bg-[#FFFFFF] text-[#171A20] text-[14px] font-medium tracking-wide hover:bg-[#F4F4F4] transition-colors flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-4 h-4 text-[#F57C00]" />
              <span>Direct Engineering Liaison</span>
            </a>
          </div>
        </section>

        {/* Core Architectural Principles */}
        <section className="px-6 sm:px-12 max-w-6xl mx-auto w-full py-16 border-t border-[#E3E4E6]">
          <div className="text-center max-w-xl mx-auto mb-12 space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#5C5E62]">
              Engineering Discipline
            </h2>
            <h3 className="text-2xl sm:text-3xl font-medium tracking-tight text-[#171A20]">
              Built to Honor Your Architecture
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {ARCHITECT_PILLARS.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={pillar.title}
                  className="p-8 rounded-[6px] bg-[#FFFFFF] border border-[#E3E4E6] shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="w-12 h-12 rounded-[4px] bg-[#F4F4F4] text-[#171A20] flex items-center justify-center mb-6">
                      <Icon className="w-6 h-6 text-[#171A20]" />
                    </div>
                    <h4 className="text-[17px] font-semibold text-[#171A20] tracking-tight mb-3">
                      {pillar.title}
                    </h4>
                    <p className="text-[14px] text-[#5C5E62] leading-relaxed">{pillar.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* BIM / CAD Specifications Matrix */}
        <section className="px-6 sm:px-12 max-w-6xl mx-auto w-full py-16 border-t border-[#E3E4E6]">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-[#5C5E62]">
                Specification Hub
              </div>
              <h3 className="text-2xl sm:text-3xl font-medium tracking-tight text-[#171A20] mt-1">
                BIM, CAD &amp; Structural Dimensions
              </h3>
            </div>
            <div className="text-[13px] text-[#5C5E62] max-w-md">
              Reference dimensional specifications and structural properties for architectural
              schematic design and terrace spatial planning.
            </div>
          </div>

          <div className="overflow-x-auto rounded-[6px] border border-[#E3E4E6] bg-[#FFFFFF] shadow-xs">
            <table className="w-full text-left text-[13px] border-collapse">
              <thead>
                <tr className="bg-[#F8F9FA] border-b border-[#E3E4E6] text-[12px] uppercase font-bold text-[#5C5E62]">
                  <th className="py-3.5 px-4">Hardware Component</th>
                  <th className="py-3.5 px-4">Physical Dimensions</th>
                  <th className="py-3.5 px-4">Structural / Mechanical Properties</th>
                  <th className="py-3.5 px-4 text-right">Reference CAD Standards</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E9ECEF] text-[#171A20]">
                {BIM_SPECS.map((spec) => (
                  <tr key={spec.category} className="hover:bg-[#FAFAFA] transition-colors">
                    <td className="py-4 px-4 font-semibold">{spec.category}</td>
                    <td className="py-4 px-4 font-mono text-[12px] text-[#5C5E62]">
                      {spec.dimensions}
                    </td>
                    <td className="py-4 px-4 text-[12px] text-[#5C5E62]">
                      {spec.weight || spec.loading || spec.acoustics || spec.material}
                    </td>
                    <td className="py-4 px-4 text-right font-mono font-medium text-[12px] text-[#171A20]">
                      {spec.cadFormats}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Architect Partner Program Liaison Form */}
        <section className="px-6 sm:px-12 max-w-4xl mx-auto w-full py-16 border-t border-[#E3E4E6]">
          <div className="p-8 sm:p-12 rounded-[8px] bg-[#FFFFFF] border border-[#E3E4E6] shadow-sm space-y-6">
            <div className="text-center space-y-2 max-w-xl mx-auto">
              <div className="text-xs font-bold uppercase tracking-widest text-[#5C5E62]">
                Architect Collaborative
              </div>
              <h3 className="text-2xl sm:text-3xl font-medium tracking-tight text-[#171A20]">
                Register Your Architectural Studio
              </h3>
              <p className="text-[14px] text-[#5C5E62] leading-relaxed">
                Connect directly with our engineering team to review 3D shadow models, Pergola
                structural parameters, and utility coordination for your client residences.
              </p>
            </div>

            {submissionResult ? (
              <div className="p-6 rounded-[6px] bg-[#F0FDF4] border border-[#DCFCE7] text-center space-y-4">
                <CheckCircle2 className="w-8 h-8 text-[#16A34A] mx-auto" />
                <h4 className="text-[17px] font-semibold text-[#166534]">
                  Architectural Inquiry Recorded ({submissionResult.referenceCode || "WNX-ARCH"})
                </h4>
                <p className="text-[13px] text-[#15803D] max-w-md mx-auto leading-relaxed">
                  {submissionResult.isDemo
                    ? "Portfolio Concept Demo: As WAVENOX is a design portfolio concept, no automated specification package dispatch occurs. You can review the published CAD specifications above or discuss engineering integration directly with the designer via WhatsApp."
                    : "Thank you for registering your practice. Our engineering team will review your project parameters and share custom technical details."}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[4px] bg-[#16A34A] text-white text-[13px] font-medium hover:bg-[#15803D] transition-colors"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Discuss on WhatsApp</span>
                  </a>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 max-w-xl mx-auto pt-2">
                {submitError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-[6px] text-[13px] text-red-700">
                    {submitError}
                  </div>
                )}

                {/* Honeypot field (hidden from real users) */}
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
                  <label htmlFor="arch_hp_extra">Leave this field blank</label>
                  <input
                    type="text"
                    id="arch_hp_extra"
                    name="hp_extra"
                    tabIndex={-1}
                    autoComplete="off"
                    value={hpExtra}
                    onChange={(e) => setHpExtra(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="arch_studio_name"
                      className="block text-[12px] font-semibold text-[#171A20] uppercase tracking-wider mb-1.5"
                    >
                      Architecture Studio / Firm *
                    </label>
                    <input
                      type="text"
                      id="arch_studio_name"
                      required
                      value={studioName}
                      onChange={(e) => setStudioName(e.target.value)}
                      placeholder="e.g. Studio Morphogenesis"
                      className="w-full h-11 px-3.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-[6px] text-[14px] text-[#171A20] placeholder:text-[#9CA3AF] focus:bg-[#FFFFFF] focus:border-[#171A20] focus:ring-1 focus:ring-[#171A20] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="arch_contact_name"
                      className="block text-[12px] font-semibold text-[#171A20] uppercase tracking-wider mb-1.5"
                    >
                      Lead Architect / Principal *
                    </label>
                    <input
                      type="text"
                      id="arch_contact_name"
                      required
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="e.g. Ar. Vikram Reddy"
                      className="w-full h-11 px-3.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-[6px] text-[14px] text-[#171A20] placeholder:text-[#9CA3AF] focus:bg-[#FFFFFF] focus:border-[#171A20] focus:ring-1 focus:ring-[#171A20] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="arch_phone"
                      className="block text-[12px] font-semibold text-[#171A20] uppercase tracking-wider mb-1.5"
                    >
                      Mobile / WhatsApp (+91) *
                    </label>
                    <input
                      type="tel"
                      id="arch_phone"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="10-digit mobile number"
                      maxLength={14}
                      className="w-full h-11 px-3.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-[6px] text-[14px] text-[#171A20] placeholder:text-[#9CA3AF] focus:bg-[#FFFFFF] focus:border-[#171A20] focus:ring-1 focus:ring-[#171A20] focus:outline-none tabular-nums"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="arch_project_location"
                      className="block text-[12px] font-semibold text-[#171A20] uppercase tracking-wider mb-1.5"
                    >
                      Project Location / City *
                    </label>
                    <input
                      type="text"
                      id="arch_project_location"
                      required
                      value={projectLocation}
                      onChange={(e) => setProjectLocation(e.target.value)}
                      placeholder="e.g. Jubilee Hills, Hyderabad"
                      className="w-full h-11 px-3.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-[6px] text-[14px] text-[#171A20] placeholder:text-[#9CA3AF] focus:bg-[#FFFFFF] focus:border-[#171A20] focus:ring-1 focus:ring-[#171A20] focus:outline-none"
                    />
                  </div>
                </div>

                {/* DPDP Consent */}
                <div className="flex items-start gap-2.5 pt-2">
                  <input
                    type="checkbox"
                    id="consent_architects"
                    checked={consentGiven}
                    onChange={(e) => setConsentGiven(e.target.checked)}
                    required
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-[#171A20] focus:ring-[#171A20]"
                  />
                  <label
                    htmlFor="consent_architects"
                    className="text-[12px] text-[#5C5E62] leading-relaxed cursor-pointer"
                  >
                    I consent to WAVENOX collecting my professional contact details to share CAD/BIM
                    specifications and discuss project feasibility. You may withdraw consent at any
                    time. See our{" "}
                    <Link to="/legal/privacy" className="underline hover:text-[#171A20]">
                      Privacy Policy
                    </Link>
                    .
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-12 rounded-[6px] bg-[#171A20] text-[#FFFFFF] text-[14px] font-medium tracking-wide hover:bg-[#2C3038] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FileCode2 className="w-4 h-4 text-[#F57C00]" />
                  <span>
                    {isSubmitting ? "Recording Inquiry..." : "Request Technical CAD Specifications"}
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
