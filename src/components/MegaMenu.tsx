import * as React from "react";
import { Link } from "@tanstack/react-router";
import { openConsultationDrawer } from "@/lib/consultation";

export type MegaMenuCategory = "solar" | "omnigrid" | "commercial" | "studio" | "discover" | null;

interface ProductItem {
  name: string;
  subtitle?: string;
  image: string;
  learnTo: string;
  orderTo?: string;
  orderLabel?: string;
}

interface QuickLink {
  label: string;
  to?: string;
  href?: string;
  action?: () => void;
  external?: boolean;
}

interface CategoryContent {
  products?: ProductItem[];
  quickLinks?: { title?: string; links: QuickLink[] }[];
}

const MEGA_MENU_DATA: Record<Exclude<MegaMenuCategory, null>, CategoryContent> = {
  solar: {
    products: [
      {
        name: "Residential Rooftop Solar",
        subtitle: "Independent homes & villas",
        image: "/media/home-hero-640w.webp",
        learnTo: "/residential",
        orderTo: "/deploy",
        orderLabel: "Get Estimate",
      },
      {
        name: "Low-Profile Terrace Mount",
        subtitle: "Concealed conduit raceways",
        image: "/media/home-design-640w.webp",
        learnTo: "/residential#terrace-design",
        orderTo: "/deploy",
        orderLabel: "Get Estimate",
      },
      {
        name: "Elevated Solar Pergola",
        subtitle: "Shaded usable terrace space",
        image: "/media/res-hero-640w.webp",
        learnTo: "/residential#terrace-design",
        orderTo: "/deploy",
        orderLabel: "Get Estimate",
      },
    ],
    quickLinks: [
      {
        links: [
          {
            label: "Talk to a Solar Advisor",
            action: () => openConsultationDrawer(),
          },
          { label: "Get Solar Estimate (Design Studio)", to: "/deploy" },
          { label: "PM Surya Ghar Subsidy Guide (Up to ₹78,000)", to: "/net-metering" },
          { label: "DISCOM Net-Metering & Approvals", to: "/net-metering" },
          { label: "25-Year Linear Module Warranty", to: "/warranty" },
          { label: "Service Areas & Priority Hubs", to: "/service-areas" },
          { label: "Frequently Asked Questions", to: "/faq" },
        ],
      },
    ],
  },
  omnigrid: {
    products: [
      {
        name: "Omnigrid 14.3 kWh Storage",
        subtitle: "Single-unit LFP home backup",
        image: "/media/omnigrid-hero-640w.webp",
        learnTo: "/omnigrid",
        orderTo: "/deploy",
        orderLabel: "Configure",
      },
      {
        name: "Omnigrid Dual-Pack (28.6 kWh)",
        subtitle: "Extended nighttime & AC backup",
        image: "/media/omnigrid-night-640w.webp",
        learnTo: "/omnigrid#sunset-power",
        orderTo: "/deploy",
        orderLabel: "Configure",
      },
      {
        name: "Sub-20ms Islanding Gateway",
        subtitle: "Automatic grid outage switchover",
        image: "/media/omnigrid-switchover-640w.webp",
        learnTo: "/omnigrid#outage-defense",
        orderTo: "/deploy",
        orderLabel: "Configure",
      },
    ],
    quickLinks: [
      {
        links: [
          {
            label: "Talk to a Storage Advisor",
            action: () => openConsultationDrawer(),
          },
          { label: "Appliance Backup Duration Estimator", to: "/omnigrid#estimator" },
          { label: "24-Hour Solar & Storage Flow", to: "/omnigrid#flow-simulation" },
          { label: "Why Standard Solar Needs Battery for Outages", to: "/omnigrid" },
          { label: "10-Year OEM Battery & Inverter Warranty", to: "/warranty" },
        ],
      },
    ],
  },
  commercial: {
    products: [
      {
        name: "Industrial Rooftop Solar",
        subtitle: "Manufacturing & logistics plants",
        image: "/media/commercial-hero-640w.webp",
        learnTo: "/enterprise",
        orderTo: "/enterprise#assessment",
        orderLabel: "Request Assessment",
      },
      {
        name: "High-Yield Bifacial Arrays",
        subtitle: "Daytime peak tariff offset",
        image: "/media/commercial-industrial-640w.webp",
        learnTo: "/enterprise#operating-costs",
        orderTo: "/enterprise#calculator",
        orderLabel: "Calculate Yield",
      },
      {
        name: "Corporate & Campus Solar",
        subtitle: "Offices, campuses & hospitals",
        image: "/media/commercial-campus-640w.webp",
        learnTo: "/enterprise",
        orderTo: "/enterprise#assessment",
        orderLabel: "Request Assessment",
      },
    ],
    quickLinks: [
      {
        links: [
          {
            label: "Request Commercial Site Assessment",
            action: () => openConsultationDrawer(),
          },
          { label: "Commercial Yield & Payback Calculator", to: "/enterprise#calculator" },
          { label: "Section 33 Tax Depreciation Guide", to: "/enterprise#calculator" },
          { label: "Architectural & CAD/BIM Specifications", to: "/architects" },
          { label: "DISCOM HT/LT Feeder Feasibility", to: "/net-metering" },
        ],
      },
    ],
  },
  studio: {
    products: [
      {
        name: "Interactive Solar Sizing Studio",
        subtitle: "Estimate kW size, savings & subsidy",
        image: "/media/home-hero-640w.webp",
        learnTo: "/deploy",
        orderTo: "/deploy",
        orderLabel: "Open Studio",
      },
      {
        name: "Satellite Terrace Sketcher",
        subtitle: "Map usable roof area & setbacks",
        image: "/media/studio-estate-640w.webp",
        learnTo: "/deploy",
        orderTo: "/deploy",
        orderLabel: "Sketch Roof",
      },
      {
        name: "Solar + Battery Configurator",
        subtitle: "Compare solar-only vs battery backup",
        image: "/media/omnigrid-hero-640w.webp",
        learnTo: "/deploy",
        orderTo: "/deploy",
        orderLabel: "Configure",
      },
    ],
    quickLinks: [
      {
        links: [
          { label: "Start With Monthly Electricity Bill", to: "/deploy" },
          {
            label: "Prefer a Guided Review? Talk to an Advisor",
            action: () => openConsultationDrawer(),
          },
          { label: "How We Calculate Savings & Tariffs", to: "/legal/disclosures" },
          { label: "Check DISCOM Net-Metering Rules", to: "/net-metering" },
        ],
      },
    ],
  },
  discover: {
    quickLinks: [
      {
        title: "Solar Guides & Feasibility",
        links: [
          { label: "Get Solar Estimate (Design Studio)", to: "/deploy" },
          { label: "DISCOM Net-Metering & Subsidy Guide", to: "/net-metering" },
          { label: "Service Areas & Priority Hubs", to: "/service-areas" },
          { label: "Frequently Asked Questions (FAQ)", to: "/faq" },
          { label: "Calculation Methodology & Sources", to: "/legal/disclosures" },
        ],
      },
      {
        title: "Engineering & Architecture",
        links: [
          { label: "Solar Physics & N-Type TOPCon Tech", to: "/technology" },
          { label: "For Architects & Villa Builders (CAD)", to: "/architects" },
          { label: "OEM, Workmanship & Support Warranties", to: "/warranty" },
          { label: "Omnigrid Battery Storage Architecture", to: "/omnigrid" },
        ],
      },
      {
        title: "Company & Governance",
        links: [
          {
            label: "Talk to a Solar Advisor",
            action: () => openConsultationDrawer(),
          },
          { label: "Our Story & Delivery Model", to: "/our-story" },
          { label: "Colophon & Engineering Case Study", to: "/about-this-project" },
          { label: "Terms of Service", to: "/legal/terms" },
          { label: "Privacy Policy (DPDP 2023)", to: "/legal/privacy" },
        ],
      },
    ],
  },
};

interface MegaMenuProps {
  activeCategory: MegaMenuCategory;
  onClose: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export function MegaMenu({ activeCategory, onClose, onMouseEnter, onMouseLeave }: MegaMenuProps) {
  if (!activeCategory) return null;

  const data = MEGA_MENU_DATA[activeCategory];
  if (!data) return null;

  const isDiscover = activeCategory === "discover";

  return (
    <>
      {/* Background Dim Backdrop */}
      <div
        className="fixed inset-0 top-14 bg-black/35 backdrop-blur-xs z-30 transition-opacity duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Flyout White Panel */}
      <div
        role="region"
        aria-label={`${activeCategory} navigation menu`}
        className="fixed top-14 left-0 right-0 z-40 bg-[#FFFFFF] text-[#171A20] border-b border-[#E3E4E6] shadow-2xl transition-all duration-200 animate-in fade-in-0 slide-in-from-top-1"
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            onClose();
          }
        }}
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-10 py-10">
          {isDiscover ? (
            /* 3-Column Layout for Discover */
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 max-w-4xl mx-auto">
              {data.quickLinks?.map((col, idx) => (
                <div key={idx} className="space-y-4">
                  {col.title && (
                    <div className="text-[12px] font-semibold text-[#5C5E62] uppercase tracking-[0.06em]">
                      {col.title}
                    </div>
                  )}
                  <ul className="space-y-3">
                    {col.links.map((link) => (
                      <li key={link.label}>
                        {link.action ? (
                          <button
                            type="button"
                            onClick={() => {
                              onClose();
                              link.action?.();
                            }}
                            className="text-[14px] font-medium text-[#171A20] hover:text-[#5C5E62] transition-colors text-left cursor-pointer focus-visible:outline-none focus-visible:underline"
                          >
                            {link.label}
                          </button>
                        ) : link.to ? (
                          <Link
                            to={link.to}
                            onClick={onClose}
                            className="text-[14px] font-medium text-[#171A20] hover:text-[#5C5E62] transition-colors block focus-visible:outline-none focus-visible:underline"
                          >
                            {link.label}
                          </Link>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            /* Product Showcase + Quick Links for Product Categories */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left: Product Showcase Cards */}
              <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
                {data.products?.map((prod) => (
                  <div key={prod.name} className="flex flex-col items-center text-center group">
                    {/* Product Image Frame */}
                    <Link
                      to={prod.learnTo}
                      onClick={onClose}
                      className="w-full aspect-[16/10] rounded-[6px] overflow-hidden bg-[#F4F4F4] mb-3 flex items-center justify-center p-1.5 relative group-hover:opacity-95 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#171A20]"
                    >
                      <img
                        src={prod.image}
                        alt={prod.name}
                        className="w-full h-full object-cover rounded-[4px] transform group-hover:scale-102 transition-transform duration-300"
                        loading="eager"
                      />
                    </Link>

                    {/* Product Name & Subtitle */}
                    <h3 className="text-[15px] font-medium text-[#171A20] leading-snug">
                      {prod.name}
                    </h3>
                    {prod.subtitle && (
                      <p className="text-[12px] text-[#5C5E62] mt-0.5 mb-2">{prod.subtitle}</p>
                    )}

                    {/* Action Links */}
                    <div className="flex items-center gap-3 text-[13px] text-[#5C5E62]">
                      <Link
                        to={prod.learnTo}
                        onClick={onClose}
                        className="underline underline-offset-4 decoration-[#E3E4E6] hover:decoration-[#171A20] hover:text-[#171A20] transition-colors"
                      >
                        Learn
                      </Link>
                      {prod.orderTo && (
                        <>
                          <span className="text-[#E3E4E6]">·</span>
                          <Link
                            to={prod.orderTo}
                            onClick={onClose}
                            className="underline underline-offset-4 decoration-[#E3E4E6] hover:decoration-[#171A20] hover:text-[#171A20] transition-colors font-medium text-[#171A20]"
                          >
                            {prod.orderLabel || "Get Estimate"}
                          </Link>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Right: Quick Links Separated by Hairline Divider */}
              <div className="lg:col-span-4 lg:border-l lg:border-[#E3E4E6] lg:pl-8 space-y-2.5">
                {data.quickLinks?.[0]?.links.map((link) => (
                  <div key={link.label}>
                    {link.action ? (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          link.action?.();
                        }}
                        className="text-[14px] font-medium text-[#171A20] hover:text-[#5C5E62] transition-colors text-left cursor-pointer py-1 focus-visible:outline-none focus-visible:underline"
                      >
                        {link.label}
                      </button>
                    ) : link.to ? (
                      <Link
                        to={link.to}
                        onClick={onClose}
                        className="text-[14px] font-medium text-[#171A20] hover:text-[#5C5E62] transition-colors block py-1 focus-visible:outline-none focus-visible:underline"
                      >
                        {link.label}
                      </Link>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
