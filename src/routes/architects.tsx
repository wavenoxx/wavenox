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
import { openConsultationDrawer } from "@/components/ConsultationDrawer";
import { PRODUCTS_CONFIG } from "@/config/products";

export const Route = createFileRoute("/architects")({
  head: () => ({
    meta: [
      {
        title: `Architectural Atelier & BIM Specifications — ${BRAND_CONFIG.name}`,
      },
      {
        name: "description",
        content:
          "Turnkey rooftop solar integration for architects, interior designers, and luxury estate builders in India. Zero-penetration structural engineering, concealed conduit raceways, 170 km/h wind resilience, and BIM/CAD specifications.",
      },
      {
        property: "og:title",
        content: `Architectural Atelier & BIM Specifications — ${BRAND_CONFIG.name}`,
      },
      {
        property: "og:description",
        content:
          "Engineering solar into modern architectural design language. Concealed conduits, zero terrace punctures, and 170 km/h cyclone resistance.",
      },
      { property: "og:image", content: "/media/home-hero-1600w.jpg" },
      { property: "og:type", content: "website" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Service",
          name: `${BRAND_CONFIG.name} Architectural Solar Atelier`,
          description:
            "Turnkey rooftop solar integration for architects and luxury residential builders in India. Zero-penetration structural engineering, concealed conduit raceways, and BIM/CAD specifications.",
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
    desc: "Our non-penetrative structural ballast clamps and perimeter parapet anchors preserve 100% of the builder's waterproofing membrane. Guaranteed with our 5-year structural weatherproofing charter.",
  },
  {
    icon: Compass,
    title: "Concealed Architectural Raceways",
    desc: "Zero visible conduits or dangling wiring. DC cables and smart switchgear route through sub-slab conduits or custom color-matched architectural chases that blend into exterior walls.",
  },
  {
    icon: Wind,
    title: "170 km/h Wind Resilience (IS 875 Part 3)",
    desc: "Engineered with structural 6005-T5 anodized aluminum and marine-grade SS304 fasteners. FEA wind-tunnel tested to withstand severe monsoon and coastal cyclone gale forces.",
  },
];

const BIM_SPECS = [
  {
    category: "550W N-Type TOPCon Bifacial PV Module",
    dimensions: "2278 mm (L) × 1134 mm (W) × 30 mm (H)",
    weight: "28.5 kg / module",
    loading: "5400 Pa front (snow/uplift) / 2400 Pa rear (wind)",
    cadFormats: "DWG · DXF · Revit .RFA · IFC",
  },
  {
    category: "Omnigrid Modular LiFePO4 Energy Storage",
    dimensions: "750 mm (W) × 1150 mm (H) × 150 mm (D)",
    weight: "115 kg per 14.3 kWh pack",
    mounting: "Wall-hung or floor-standing (IP65 outdoor rated)",
    cadFormats: "DWG · 3D STEP · Revit .RFA",
  },
  {
    category: "Three-Phase Hybrid String Inverter",
    dimensions: "580 mm (W) × 650 mm (H) × 230 mm (D)",
    weight: "32 kg",
    acoustics: "< 35 dBA whisper quiet convection cooling",
    cadFormats: "DWG · DXF · Revit .RFA",
  },
  {
    category: "Elevated Terrace Pergola Living Canopy",
    dimensions: "Custom parametric spans (2.4m to 3.2m clear height)",
    material: "Structural 6005-T5 Anodized Architectural Aluminum",
    finish: "Matte Black Anodized (25-micron coating) or Custom RAL",
    cadFormats: "BIM Family · Structural Calcs · FEA Reports",
  },
];

function ArchitectsPage() {
  const [studioName, setStudioName] = React.useState("");
  const [contactName, setContactName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [projectLocation, setProjectLocation] = React.useState("");
  const [formSubmitted, setFormSubmitted] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
  };

  const whatsappText = `Hello WAVENOX Architectural Team, I am an architect / interior designer and would like to review rooftop solar CAD/BIM specifications and schedule a technical consultation.`;
  const whatsappUrl = `${BRAND_CONFIG.contact.whatsappLink}?text=${encodeURIComponent(whatsappText)}`;

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-[#171A20] selection:bg-[#171A20] selection:text-white flex flex-col justify-between">
      <Header />

      <main className="flex-1 pt-28 pb-20">
        {/* Hero Section */}
        <section className="px-6 sm:px-12 max-w-5xl mx-auto w-full text-center space-y-6 pt-8 pb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F4F4F4] text-[#5C5E62] text-[11px] font-semibold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5 text-[#F57C00]" />
            <span>The Architectural Atelier</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-medium tracking-tight text-[#171A20] max-w-3xl mx-auto leading-[1.1]">
            Clean Energy in Your Design Language
          </h1>

          <p className="text-[16px] sm:text-[18px] text-[#5C5E62] max-w-2xl mx-auto leading-relaxed">
            We partner with premier architects, structural engineers, and luxury villa developers to
            seamlessly embed monolithic clean power into bespoke residences without compromising form
            or terrace usability.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              type="button"
              onClick={() => openConsultationDrawer()}
              className="w-full sm:w-auto min-w-[220px] h-12 px-6 rounded-[4px] bg-[#171A20] text-[#FFFFFF] text-[14px] font-medium tracking-wide hover:bg-[#2C3038] transition-colors cursor-pointer"
            >
              Request Architectural Dossier
            </button>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto min-w-[200px] h-12 px-6 rounded-[4px] border border-[#E3E4E6] bg-[#FFFFFF] text-[#171A20] text-[14px] font-medium tracking-wide hover:bg-[#F4F4F4] transition-colors flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-4 h-4 text-[#F57C00]" />
              <span>Direct Atelier Liaison</span>
            </a>
          </div>
        </section>

        {/* 3 Core Architectural Pillars */}
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
              Download parametric Revit families, 2D AutoCAD details, and structural calculation
              reports formatted for architectural drawings.
            </div>
          </div>

          <div className="overflow-x-auto rounded-[6px] border border-[#E3E4E6] bg-[#FFFFFF] shadow-xs">
            <table className="w-full text-left text-[13px] border-collapse">
              <thead>
                <tr className="bg-[#F8F9FA] border-b border-[#E3E4E6] text-[11px] uppercase font-bold text-[#5C5E62]">
                  <th className="py-3.5 px-4">Hardware Component</th>
                  <th className="py-3.5 px-4">Physical Dimensions</th>
                  <th className="py-3.5 px-4">Structural / Mechanical Properties</th>
                  <th className="py-3.5 px-4 text-right">Available CAD Formats</th>
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
                    <td className="py-4 px-4 text-right font-mono font-medium text-[11px] text-[#171A20]">
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
                Connect directly with our Lead Solar Structural Engineers to receive 3D shadow models,
                custom Pergola structural calculations, and turnkey DISCOM utility liaison for your
                client villas.
              </p>
            </div>

            {formSubmitted ? (
              <div className="p-6 rounded-[6px] bg-[#F0FDF4] border border-[#DCFCE7] text-center space-y-3">
                <CheckCircle2 className="w-8 h-8 text-[#16A34A] mx-auto" />
                <h4 className="text-[17px] font-semibold text-[#166534]">
                  Architectural Dossier Request Confirmed
                </h4>
                <p className="text-[13px] text-[#15803D] max-w-md mx-auto">
                  Our Lead Structural Engineer will contact you within 24 hours with complete BIM
                  families and project-specific 3D shadow simulation files.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 max-w-xl mx-auto pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#171A20] uppercase tracking-wider mb-1.5">
                      Architecture Studio / Firm *
                    </label>
                    <input
                      type="text"
                      required
                      value={studioName}
                      onChange={(e) => setStudioName(e.target.value)}
                      placeholder="e.g. Studio Morphogenesis"
                      className="w-full h-11 px-3.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-[6px] text-[14px] text-[#171A20] placeholder:text-[#9CA3AF] focus:bg-[#FFFFFF] focus:border-[#171A20] focus:ring-1 focus:ring-[#171A20] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#171A20] uppercase tracking-wider mb-1.5">
                      Lead Architect / Principal *
                    </label>
                    <input
                      type="text"
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
                    <label className="block text-[11px] font-semibold text-[#171A20] uppercase tracking-wider mb-1.5">
                      Mobile / WhatsApp (+91) *
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="10-digit mobile number"
                      maxLength={14}
                      className="w-full h-11 px-3.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-[6px] text-[14px] text-[#171A20] placeholder:text-[#9CA3AF] focus:bg-[#FFFFFF] focus:border-[#171A20] focus:ring-1 focus:ring-[#171A20] focus:outline-none tabular-nums"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#171A20] uppercase tracking-wider mb-1.5">
                      Project Location / City *
                    </label>
                    <input
                      type="text"
                      required
                      value={projectLocation}
                      onChange={(e) => setProjectLocation(e.target.value)}
                      placeholder="e.g. Jubilee Hills, Hyderabad"
                      className="w-full h-11 px-3.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-[6px] text-[14px] text-[#171A20] placeholder:text-[#9CA3AF] focus:bg-[#FFFFFF] focus:border-[#171A20] focus:ring-1 focus:ring-[#171A20] focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full h-12 rounded-[6px] bg-[#171A20] text-[#FFFFFF] text-[14px] font-medium tracking-wide hover:bg-[#2C3038] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <FileCode2 className="w-4 h-4 text-[#F57C00]" />
                  <span>Request Full BIM &amp; CAD Package</span>
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
