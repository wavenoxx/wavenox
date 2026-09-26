import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  MapPin,
  Building2,
  Sun,
  Zap,
  Shield,
  ArrowRight,
  Phone,
  CheckCircle2,
  ExternalLink,
  Navigation,
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/system/Button";
import { BRAND_CONFIG } from "@/config/brand";
import { openConsultationDrawer } from "@/components/ConsultationDrawer";

export const Route = createFileRoute("/service-areas")({
  head: () => ({
    meta: [
      {
        title: `Service Areas & DISCOM Jurisdictions — ${BRAND_CONFIG.name}`,
      },
      {
        name: "description",
        content:
          "WAVENOX solar engineering and statutory net-metering feasibility across Telangana (TGSPDCL / TGNPDCL) with verified solar yield and tariff calculations.",
      },
      {
        property: "og:title",
        content: `Service Areas & DISCOM Jurisdictions — ${BRAND_CONFIG.name}`,
      },
      {
        property: "og:description",
        content:
          "Architectural rooftop solar feasibility and DISCOM net-metering synchronization across Greater Hyderabad and Telangana.",
      },
      { property: "og:image", content: `${BRAND_CONFIG.domain}/media/home-hero-1600w.jpg` },
      { property: "og:url", content: `${BRAND_CONFIG.domain}/service-areas` },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: `${BRAND_CONFIG.domain}/service-areas` }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: BRAND_CONFIG.name,
          url: BRAND_CONFIG.domain,
          telephone: BRAND_CONFIG.contact.phone.display,
          email: BRAND_CONFIG.contact.email,
          areaServed: {
            "@type": "State",
            name: "Telangana",
          },
        }),
      },
    ],
  }),
  component: ServiceAreasPage,
});

interface RegionHub {
  id: string;
  state: string;
  headline: string;
  discoms: string[];
  keyDistricts: string[];
  headquarters: string;
  irradiance: string;
  annualGenerationPerKw: string;
  cycloneRating: string;
  netMeteringPortal: string;
  netMeteringPortalUrl: string;
  leadTimeWeeks: string;
  notes: string;
}

const REGION_HUBS: RegionHub[] = [
  {
    id: "telangana",
    state: "Telangana",
    headline: "Hyderabad Metropolitan & Telangana State",
    discoms: [
      "TGSPDCL (Southern Power Distribution Company of Telangana)",
      "TGNPDCL (Northern Power Distribution Company of Telangana)",
    ],
    keyDistricts: [
      "Hyderabad (Jubilee Hills, Banjara Hills, Gachibowli, Madhapur)",
      "Rangareddy (Kokapet, Gandipet, Nanakramguda, Mokila)",
      "Medchal-Malkajgiri (Kompally, Sainikpuri)",
      "Sangareddy (Patancheru, Tellapur)",
      "Warangal Urban & Suburbs",
    ],
    headquarters: "Hyderabad, Telangana — 500032",
    irradiance: "5.4 – 5.8 kWh/m²/day",
    annualGenerationPerKw: "1,490 Units / kW / Year (NASA POWER / PVWatts v8)",
    cycloneRating: "IS 875 (Part 3) Basic Wind Speed: 44 m/s (158 km/h)",
    netMeteringPortal: "TGSPDCL Solar Net-Metering Portal",
    netMeteringPortalUrl: "https://tgspdcl.cgg.gov.in/",
    leadTimeWeeks: "2 to 3 Weeks (Portal Sanction to Meter Synchronization)",
    notes:
      "Full turnkey support for PM Surya Ghar: Muft Bijli Yojana direct DBT subsidies (₹78,000 max). Pre-approved inverter rosters and CEA-certified protection relays.",
  },
];

function ServiceAreasPage() {
  const [selectedHub, setSelectedHub] = React.useState<string>("telangana");

  const currentHub = REGION_HUBS.find((h) => h.id === selectedHub) || REGION_HUBS[0];

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#171A20] selection:bg-[#171A20] selection:text-[#FFFFFF]">
      <Header />

      <main className="pt-24 sm:pt-28 md:pt-32 pb-20">
        {/* 1. HERO HEADER */}
        <section className="max-w-4xl mx-auto px-6 text-center">
          <span className="text-[11px] sm:text-[12px] font-medium tracking-[0.2em] uppercase text-[#5C5E62] block mb-3">
            Regional Grid Infrastructure
          </span>
          <h1 className="text-[32px] sm:text-[44px] md:text-[54px] font-medium tracking-tight leading-[1.1] text-[#171A20] text-balance">
            Service Areas &amp; DISCOM Jurisdictions
          </h1>
          <p className="text-[15px] sm:text-[17px] font-normal leading-relaxed text-[#5C5E62] max-w-2xl mx-auto mt-3 sm:mt-4 text-balance">
            Direct turnkey feasibility and DISCOM bi-directional meter synchronization across
            Telangana (TGSPDCL &amp; TGNPDCL).
          </p>

          {/* Regional Switcher Pills */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-2 max-w-xl mx-auto">
            {REGION_HUBS.map((hub) => {
              const isSelected = hub.id === selectedHub;
              return (
                <button
                  key={hub.id}
                  type="button"
                  onClick={() => setSelectedHub(hub.id)}
                  className={`min-h-[44px] px-6 py-2.5 rounded-[4px] text-[13px] sm:text-[14px] font-medium transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#171A20] ${
                    isSelected
                      ? "bg-[#171A20] text-white shadow-md"
                      : "bg-[#F4F4F4] text-[#5C5E62] hover:bg-[#EAEAEA] hover:text-[#171A20]"
                  }`}
                >
                  {hub.state}
                </button>
              );
            })}
          </div>
        </section>

        {/* 2. REGIONAL HUB DETAILS CONTAINER */}
        <section className="max-w-5xl mx-auto px-6 mt-12 sm:mt-16">
          <div className="border border-[#E3E4E6] rounded-[10px] bg-[#FFFFFF] p-6 sm:p-10 shadow-sm space-y-8">
            {/* Header info */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#E3E4E6]">
              <div>
                <span className="text-[11px] font-semibold text-[#F57C00] uppercase tracking-widest block mb-1">
                  Active Operational Jurisdiction
                </span>
                <h2 className="text-[24px] sm:text-[30px] font-medium text-[#171A20]">
                  {currentHub.state} — {currentHub.headline}
                </h2>
                <div className="flex items-center gap-2 mt-2 text-[13px] text-[#5C5E62]">
                  <MapPin className="w-4 h-4 text-[#F57C00] shrink-0" />
                  <span>{currentHub.headquarters}</span>
                </div>
              </div>
              <div className="shrink-0">
                <Button
                  onClick={() => openConsultationDrawer()}
                  variant="primary"
                  tone="light"
                  className="w-full sm:w-auto"
                >
                  Book Site Survey in {currentHub.state}
                </Button>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-[6px] bg-[#F4F4F4]/70 border border-[#E3E4E6]">
                <div className="flex items-center gap-2 text-[#5C5E62] text-[12px] font-medium uppercase tracking-wider mb-1">
                  <Sun className="w-4 h-4 text-[#F57C00]" />
                  <span>Solar Irradiance</span>
                </div>
                <div className="text-[18px] font-semibold text-[#171A20]">
                  {currentHub.irradiance}
                </div>
                <div className="text-[11px] text-[#5C5E62] mt-0.5">Global Horizontal Daily</div>
              </div>

              <div className="p-4 rounded-[6px] bg-[#F4F4F4]/70 border border-[#E3E4E6]">
                <div className="flex items-center gap-2 text-[#5C5E62] text-[12px] font-medium uppercase tracking-wider mb-1">
                  <Zap className="w-4 h-4 text-[#F57C00]" />
                  <span>Expected Annual Yield</span>
                </div>
                <div className="text-[18px] font-semibold text-[#171A20]">
                  {currentHub.annualGenerationPerKw}
                </div>
                <div className="text-[11px] text-[#5C5E62] mt-0.5">N-Type TOPCon Physics</div>
              </div>

              <div className="p-4 rounded-[6px] bg-[#F4F4F4]/70 border border-[#E3E4E6]">
                <div className="flex items-center gap-2 text-[#5C5E62] text-[12px] font-medium uppercase tracking-wider mb-1">
                  <Shield className="w-4 h-4 text-[#F57C00]" />
                  <span>Pergola Wind Spec</span>
                </div>
                <div className="text-[18px] font-semibold text-[#171A20]">
                  {currentHub.cycloneRating}
                </div>
                <div className="text-[11px] text-[#5C5E62] mt-0.5">IS 875 Part 3 Certified</div>
              </div>
            </div>

            {/* Jurisdiction Details & DISCOMs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
              <div className="space-y-4">
                <h3 className="text-[16px] font-semibold text-[#171A20] uppercase tracking-wider text-[12px]">
                  Governing Utility Companies (DISCOMs)
                </h3>
                <ul className="space-y-2.5 text-[14px] text-[#5C5E62]">
                  {currentHub.discoms.map((discom, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-[#F57C00] shrink-0 mt-0.5" />
                      <span>{discom}</span>
                    </li>
                  ))}
                </ul>

                <div className="pt-2">
                  <h3 className="text-[16px] font-semibold text-[#171A20] uppercase tracking-wider text-[12px] mb-2">
                    Turnkey Net-Metering Liaison
                  </h3>
                  <p className="text-[13px] text-[#5C5E62] leading-relaxed">
                    WAVENOX handles the entire end-to-end liaison process: feasibility check, portal
                    registration, CEIG / Electrical Inspectorate filings, CT/PT inspection, and
                    bi-directional meter synchronization. Typical completion window:{" "}
                    <strong className="text-[#171A20]">{currentHub.leadTimeWeeks}</strong>.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-[16px] font-semibold text-[#171A20] uppercase tracking-wider text-[12px]">
                  Prime Residential &amp; Commercial Enclaves
                </h3>
                <ul className="space-y-2 text-[13px] text-[#5C5E62]">
                  {currentHub.keyDistricts.map((district, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Building2 className="w-4 h-4 text-[#5C5E62]/70 shrink-0 mt-0.5" />
                      <span>{district}</span>
                    </li>
                  ))}
                </ul>

                <div className="p-3.5 bg-[#F4F4F4]/50 border border-[#E3E4E6] rounded-[6px] text-[12px] text-[#5C5E62] leading-relaxed">
                  <strong className="text-[#171A20] block mb-1">State Regulatory Note:</strong>
                  {currentHub.notes}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. TECHNICAL VERIFICATION & SUPPORT */}
        <section className="max-w-5xl mx-auto px-6 mt-20 sm:mt-28">
          <div className="p-8 sm:p-10 rounded-[10px] bg-[#171A20] text-white flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-xl space-y-3">
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#F57C00] block">
                Regional Engineering Support
              </span>
              <h3 className="text-[24px] sm:text-[28px] font-medium text-white leading-snug">
                Dedicated Rooftop Solar Consultation &amp; Liaison
              </h3>
              <p className="text-[14px] text-white/80 leading-relaxed">
                From initial 3D shadow assessment and DISCOM net-metering portal application to
                bi-directional meter synchronization, our engineering team coordinates every
                regulatory and technical milestone directly in Telangana.
              </p>
            </div>
            <div className="shrink-0 flex flex-col items-center gap-2">
              <a
                href={`tel:${BRAND_CONFIG.contact.phone.dial}`}
                className="inline-flex items-center gap-2.5 px-6 py-3 rounded-[4px] bg-white text-[#171A20] text-[14px] font-medium hover:bg-white/90 transition-colors shadow-md"
              >
                <Phone className="w-4 h-4 text-[#F57C00]" />
                <span>Call Advisory: {BRAND_CONFIG.contact.phone.display}</span>
              </a>
              <span className="text-[11px] text-white/60">Mon – Sat · 9:00 AM – 7:00 PM IST</span>
            </div>
          </div>
        </section>

        {/* 4. CONVERSION FOOTER DOCK */}
        <section className="max-w-4xl mx-auto px-6 mt-20 sm:mt-28 text-center space-y-5">
          <h2 className="text-[26px] sm:text-[34px] font-medium tracking-tight text-[#171A20]">
            Confirm Feasibility for Your Location
          </h2>
          <p className="text-[14px] sm:text-[16px] text-[#5C5E62] max-w-lg mx-auto">
            Our structural engineering team will review your rooftop satellite orientation, slab
            capacity, and DISCOM sanctioned load within 24 hours.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
            <Button to="/deploy" variant="primary" tone="light" className="w-full sm:w-auto">
              Calculate Subsidy &amp; Savings
            </Button>
            <Button
              onClick={() => openConsultationDrawer()}
              variant="secondary"
              tone="light"
              className="w-full sm:w-auto"
            >
              Schedule Engineer Survey
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
