import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  MapPin,
  Building2,
  Sun,
  Zap,
  Shield,
  Phone,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/system/Button";
import { BRAND_CONFIG } from "@/config/brand";
import { openConsultationDrawer } from "@/lib/consultation";

export interface ServiceAreasSearch {
  state?: string;
}

export const Route = createFileRoute("/service-areas")({
  validateSearch: (search: Record<string, unknown>): ServiceAreasSearch => ({
    state: typeof search.state === "string" ? search.state : undefined,
  }),
  head: () => ({
    meta: [
      {
        title: `Service Areas & DISCOM Jurisdictions — ${BRAND_CONFIG.name}`,
      },
      {
        name: "description",
        content:
          "WAVENOX architectural solar engineering and DISCOM net-metering synchronization across Telangana, Karnataka, Maharashtra, Andhra Pradesh, Delhi-NCR, Goa, and Tamil Nadu.",
      },
      {
        property: "og:title",
        content: `Service Areas & DISCOM Jurisdictions — ${BRAND_CONFIG.name}`,
      },
      {
        property: "og:description",
        content:
          "Architectural rooftop solar feasibility and bi-directional DISCOM net-metering across India's premier luxury hubs.",
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
          areaServed: [
            "Telangana",
            "Karnataka",
            "Maharashtra",
            "Andhra Pradesh",
            "Delhi",
            "Haryana",
            "Goa",
            "Tamil Nadu",
          ],
        }),
      },
    ],
  }),
  component: ServiceAreasPage,
});

export interface RegionHub {
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

export const REGION_HUBS: RegionHub[] = [
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
      "Sangareddy (Tellapur, Patancheru)",
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
  {
    id: "karnataka",
    state: "Karnataka",
    headline: "Bengaluru Metropolitan & Karnataka State",
    discoms: [
      "BESCOM (Bangalore Electricity Supply Company)",
      "MESCOM (Mangalore Electricity Supply Company)",
      "HESCOM (Hubli Electricity Supply Company)",
    ],
    keyDistricts: [
      "Bengaluru Urban (Indiranagar, Sadashivanagar, Koramangala)",
      "Bengaluru East (Whitefield, Sarjapur, Marathahalli)",
      "Bengaluru North (Hebbal, Yelahanka Luxury Villa Estates)",
      "Mysuru Urban & Heritage Estates",
    ],
    headquarters: "Bengaluru, Karnataka — 560001",
    irradiance: "5.2 – 5.6 kWh/m²/day",
    annualGenerationPerKw: "1,460 Units / kW / Year (NASA POWER / PVWatts v8)",
    cycloneRating: "IS 875 (Part 3) Basic Wind Speed: 39 m/s (140 km/h)",
    netMeteringPortal: "BESCOM Rooftop Solar Portal & KREDL",
    netMeteringPortalUrl: "https://bescom.karnataka.gov.in",
    leadTimeWeeks: "3 to 4 Weeks (Technical Feasibility to Bi-Directional Meter Commissioning)",
    notes:
      "Full compliance with KERC Net-Metering & Gross Metering frameworks. Fast-track technical feasibility sanctions for independent villa communities and tech campus solar carports.",
  },
  {
    id: "maharashtra",
    state: "Maharashtra",
    headline: "Mumbai Metropolitan Region & Pune",
    discoms: [
      "MSEDCL (Maharashtra State Electricity Distribution - Mahavitaran)",
      "Tata Power Mumbai (Distribution)",
      "Adani Electricity Mumbai Limited (AEML)",
      "Brihanmumbai Electric Supply & Transport (BEST)",
    ],
    keyDistricts: [
      "Mumbai South & West (Bandra, Juhu, Worli, Malabar Hill, Khar)",
      "Alibaug Coastal Luxury Villas (Marine micro-climate belt)",
      "Lonavala & Khandala Luxury Hill Estates",
      "Pune Metropolitan (Koregaon Park, Baner, Hinjawadi)",
    ],
    headquarters: "Bandra Kurla Complex (BKC), Mumbai — 400051",
    irradiance: "5.1 – 5.5 kWh/m²/day",
    annualGenerationPerKw: "1,440 Units / kW / Year (NASA POWER / PVWatts v8)",
    cycloneRating: "IS 875 (Part 3) Basic Wind Speed: 44 m/s (Up to 50 m/s marine gusts in Alibaug)",
    netMeteringPortal: "MSEDCL Solar Rooftop Portal & MERC Guidelines",
    netMeteringPortalUrl: "https://www.mahadiscom.in",
    leadTimeWeeks: "3 to 4 Weeks (DISCOM Sanction to Grid Synchronization)",
    notes:
      "Marine-grade C5-M anti-corrosion anodized aluminum structures engineered specifically for saline air in Alibaug and coastal Mumbai. Zero terrace puncture ballast engineering.",
  },
  {
    id: "andhra-pradesh",
    state: "Andhra Pradesh",
    headline: "Visakhapatnam, Amaravati & Coastal Andhra",
    discoms: [
      "APEPDCL (Eastern Power Distribution Company of AP)",
      "APSPDCL (Southern Power Distribution Company of AP)",
      "APCPDCL (Central Power Distribution Company of AP)",
    ],
    keyDistricts: [
      "Visakhapatnam (Beach Road, MVP Colony, Rushikonda, Madhurawada)",
      "Amaravati Capital Region & Guntur",
      "Vijayawada Urban (Benz Circle, Kanuru)",
      "Tirupati Metropolitan & Industrial Corridor",
    ],
    headquarters: "Visakhapatnam, Andhra Pradesh — 530002",
    irradiance: "5.5 – 5.9 kWh/m²/day",
    annualGenerationPerKw: "1,520 Units / kW / Year (NASA POWER / PVWatts v8)",
    cycloneRating: "IS 875 (Part 3) Basic Wind Speed: 50 m/s (180 km/h — Cyclone Zone V)",
    netMeteringPortal: "APEPDCL / APSPDCL Solar Net-Metering Portal",
    netMeteringPortalUrl: "https://www.apeasternpower.com",
    leadTimeWeeks: "2 to 3 Weeks (Portal Application to Meter Synchronization)",
    notes:
      "Highest solar insolation in South India (~1,520 kWh/kWp). Structures custom-engineered with SS316 fasteners and aerodynamic wind spoilers for Bay of Bengal cyclone resilience.",
  },
  {
    id: "delhi-ncr",
    state: "Delhi-NCR",
    headline: "National Capital Region (Delhi & Gurugram)",
    discoms: [
      "BSES Rajdhani Power Limited (BRPL)",
      "BSES Yamuna Power Limited (BYPL)",
      "Tata Power Delhi Distribution (TPDDL)",
      "DHBVN (Dakshin Haryana Bijli Vitran Nigam - Gurugram)",
      "UPPCL (Noida & Greater Noida)",
    ],
    keyDistricts: [
      "New Delhi (Lutyens', Vasant Vihar, Shanti Niketan, Jor Bagh)",
      "Gurugram (DLF Phase 1-5, Golf Course Road, DLF Camellias belt)",
      "Noida & Greater Noida Expressway Luxury Estates",
      "Chhatarpur & Mehrauli Farmhouse Enclaves",
    ],
    headquarters: "Connaught Place, New Delhi — 110001",
    irradiance: "4.9 – 5.4 kWh/m²/day",
    annualGenerationPerKw: "1,400 Units / kW / Year (NASA POWER / PVWatts v8)",
    cycloneRating: "IS 875 (Part 3) Basic Wind Speed: 47 m/s (169 km/h — Zone IV)",
    netMeteringPortal: "Delhi Solar Policy & BRPL Net-Metering Portal",
    netMeteringPortalUrl: "https://www.bsesdelhi.com",
    leadTimeWeeks: "3 to 4 Weeks (Application to Bi-Directional Meter Setup)",
    notes:
      "Hydrophobic anti-soiling nano-coating included standard to counter winter PM2.5 particulate deposition and smog attenuation. Support for Delhi Solar Policy generation-based incentives.",
  },
  {
    id: "goa",
    state: "Goa",
    headline: "Goa Coastal & Heritage Villa Enclaves",
    discoms: ["Goa Electricity Department (GED)"],
    keyDistricts: [
      "North Goa (Assagao, Anjuna, Moira, Aldona, Vagator, Candolim)",
      "South Goa (Cavelossim, Varca, Benaulim luxury coastal villas)",
      "Panaji & Dona Paula Waterfront Estates",
    ],
    headquarters: "Panaji, Goa — 403001",
    irradiance: "5.2 – 5.6 kWh/m²/day",
    annualGenerationPerKw: "1,450 Units / kW / Year (NASA POWER / PVWatts v8)",
    cycloneRating: "IS 875 (Part 3) Basic Wind Speed: 39 m/s (140 km/h)",
    netMeteringPortal: "GED Joint Electricity Regulatory Commission (JERC) Portal",
    netMeteringPortalUrl: "https://goaelectricity.gov.in",
    leadTimeWeeks: "3 to 4 Weeks (GED Sanction to Synchronized Net-Meter)",
    notes:
      "Specially contoured non-penetrative mounting clamps for Portuguese-Goan terracotta tiled roofs and concealed cable raceways preserving luxury estate aesthetics.",
  },
  {
    id: "tamil-nadu",
    state: "Tamil Nadu",
    headline: "Chennai Metropolitan & Tamil Nadu",
    discoms: ["TANGEDCO (Tamil Nadu Generation and Distribution Corporation)"],
    keyDistricts: [
      "Chennai Core (Boat Club, Poes Garden, RA Puram, Nungambakkam)",
      "East Coast Road (ECR Beachfront Luxury Enclaves, Neelankarai, Akkarai)",
      "Old Mahabalipuram Road (OMR Tech Corridor)",
      "Coimbatore (Race Course & Peelamedu)",
    ],
    headquarters: "Chennai, Tamil Nadu — 600002",
    irradiance: "5.4 – 5.8 kWh/m²/day",
    annualGenerationPerKw: "1,480 Units / kW / Year (NASA POWER / PVWatts v8)",
    cycloneRating: "IS 875 (Part 3) Basic Wind Speed: 50 m/s (180 km/h — Coastal Cyclone Belt)",
    netMeteringPortal: "TANGEDCO Solar Rooftop Application Portal",
    netMeteringPortalUrl: "https://www.tangedco.gov.in",
    leadTimeWeeks: "3 to 4 Weeks (TEDA Inspection to Net-Meter Commissioning)",
    notes:
      "High corrosion-resistant anodized aluminum architecture designed for coastal humidity and salt spray along the ECR corridor. TNERC grid export tariff compliance.",
  },
];

function ServiceAreasPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();

  const selectedHubId =
    search.state && REGION_HUBS.some((h) => h.id === search.state) ? search.state : "telangana";

  const currentHub = REGION_HUBS.find((h) => h.id === selectedHubId) || REGION_HUBS[0];

  const handleSelectHub = (hubId: string) => {
    navigate({
      search: { state: hubId },
      replace: true,
    });
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#171A20] selection:bg-[#171A20] selection:text-[#FFFFFF]">
      <Header />

      <main className="pt-24 sm:pt-28 md:pt-32 pb-20">
        {/* 1. HERO HEADER */}
        <section className="max-w-4xl mx-auto px-6 text-center">
          <span className="text-[12px] font-medium tracking-[0.2em] uppercase text-[#5C5E62] block mb-3">
            National Grid Infrastructure &amp; Regional Hubs
          </span>
          <h1 className="text-[32px] sm:text-[44px] md:text-[54px] font-medium tracking-tight leading-[1.1] text-[#171A20] text-balance">
            Service Areas &amp; DISCOM Jurisdictions
          </h1>
          <p className="text-[15px] sm:text-[17px] font-normal leading-relaxed text-[#5C5E62] max-w-2xl mx-auto mt-3 sm:mt-4 text-balance">
            Direct turnkey feasibility, architectural solar integration, and bi-directional DISCOM
            meter synchronization across India&apos;s premier luxury hubs.
          </p>

          {/* Regional Switcher Pills */}
          <div
            role="tablist"
            aria-label="Regional jurisdictions"
            className="mt-10 flex flex-wrap items-center justify-center gap-2 max-w-3xl mx-auto"
          >
            {REGION_HUBS.map((hub) => {
              const isSelected = hub.id === currentHub.id;
              return (
                <button
                  key={hub.id}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => handleSelectHub(hub.id)}
                  className={`min-h-[44px] px-5 py-2.5 rounded-[4px] text-[13px] sm:text-[14px] font-medium transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#171A20] ${
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
                <span className="text-[12px] font-semibold text-[#B45309] uppercase tracking-widest block mb-1">
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
                <div className="text-[12px] text-[#5C5E62] mt-0.5">Global Horizontal Daily</div>
              </div>

              <div className="p-4 rounded-[6px] bg-[#F4F4F4]/70 border border-[#E3E4E6]">
                <div className="flex items-center gap-2 text-[#5C5E62] text-[12px] font-medium uppercase tracking-wider mb-1">
                  <Zap className="w-4 h-4 text-[#F57C00]" />
                  <span>Expected Annual Yield</span>
                </div>
                <div className="text-[18px] font-semibold text-[#171A20]">
                  {currentHub.annualGenerationPerKw}
                </div>
                <div className="text-[12px] text-[#5C5E62] mt-0.5">N-Type TOPCon Physics</div>
              </div>

              <div className="p-4 rounded-[6px] bg-[#F4F4F4]/70 border border-[#E3E4E6]">
                <div className="flex items-center gap-2 text-[#5C5E62] text-[12px] font-medium uppercase tracking-wider mb-1">
                  <Shield className="w-4 h-4 text-[#F57C00]" />
                  <span>Pergola Wind Spec</span>
                </div>
                <div className="text-[18px] font-semibold text-[#171A20]">
                  {currentHub.cycloneRating}
                </div>
                <div className="text-[12px] text-[#5C5E62] mt-0.5">IS 875 Part 3 Certified</div>
              </div>
            </div>

            {/* Jurisdiction Details & DISCOMs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
              <div className="space-y-4">
                <h3 className="text-[12px] font-semibold text-[#171A20] uppercase tracking-wider">
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
                  <h3 className="text-[12px] font-semibold text-[#171A20] uppercase tracking-wider mb-2">
                    Turnkey Net-Metering Liaison
                  </h3>
                  <p className="text-[13px] text-[#5C5E62] leading-relaxed">
                    WAVENOX handles the entire end-to-end liaison process: feasibility check, portal
                    registration, CEIG / Electrical Inspectorate filings, CT/PT inspection, and
                    bi-directional meter synchronization. Typical completion window:{" "}
                    <strong className="text-[#171A20]">{currentHub.leadTimeWeeks}</strong>.
                  </p>
                  <div className="mt-3">
                    <a
                      href={currentHub.netMeteringPortalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#171A20] hover:underline"
                    >
                      <span>Official Portal: {currentHub.netMeteringPortal}</span>
                      <ExternalLink className="w-3.5 h-3.5 text-[#5C5E62]" />
                    </a>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-[12px] font-semibold text-[#171A20] uppercase tracking-wider">
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
              <span className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[#F57C00] block">
                Regional Engineering Support
              </span>
              <h2 className="text-[24px] sm:text-[28px] font-medium text-white leading-snug">
                Dedicated Rooftop Solar Consultation &amp; Liaison
              </h2>
              <p className="text-[14px] text-white/80 leading-relaxed">
                From initial 3D shadow assessment and DISCOM net-metering portal application to
                bi-directional meter synchronization, our engineering team coordinates every
                regulatory and technical milestone directly across your state.
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
              <span className="text-[12px] text-white/60">Mon – Sat · 9:00 AM – 7:00 PM IST</span>
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
