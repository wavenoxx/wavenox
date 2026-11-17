import * as React from "react";
import { Link } from "@tanstack/react-router";
import { openConsultationDrawer } from "@/lib/consultation";

export type MegaMenuCategory = "solar" | "omnigrid" | "commercial" | "discover" | null;

export interface MegaMenuProductItem {
  name: string;
  subtitle: string;
  image: string;
  alt: string;
  to: string;
  hash?: string;
}

export interface MegaMenuQuickLink {
  label: string;
  to?: string;
  hash?: string;
  action?: () => void;
}

export interface MegaMenuQuickLinkColumn {
  title?: string;
  links: MegaMenuQuickLink[];
}

export interface MegaMenuCategoryContent {
  label: string;
  products?: MegaMenuProductItem[];
  quickLinks: MegaMenuQuickLinkColumn[];
}

const MEGA_MENU_DATA: Record<Exclude<MegaMenuCategory, null>, MegaMenuCategoryContent> = {
  solar: {
    label: "Solar Panels",
    products: [
      {
        name: "Residential Rooftop Solar",
        subtitle: "Independent homes & villas",
        image: "/media/res-hero-640w.webp",
        alt: "WAVENOX architectural rooftop solar array on an Indian residence",
        to: "/residential",
      },
      {
        name: "Elevated Terrace Pergola",
        subtitle: "Shaded walkable terrace living space",
        image: "/media/res-terrace-640w.webp",
        alt: "Elevated solar pergola canopy over a sandstone terrace",
        to: "/residential",
        hash: "terrace-design",
      },
      {
        name: "Severe Weather Engineering",
        subtitle: "Monsoon & 158 km/h wind protection",
        image: "/media/res-weather-640w.webp",
        alt: "Weather-sealed rooftop solar array engineered for monsoon resilience",
        to: "/residential",
        hash: "home-resilience",
      },
    ],
    quickLinks: [
      {
        links: [
          { label: "Get Solar Estimate", to: "/deploy" },
          { label: "Subsidy & Net-Metering Guide", to: "/net-metering" },
          { label: "25-Year Warranty Coverage", to: "/warranty" },
          { label: "Service Areas & Priority Hubs", to: "/service-areas" },
          {
            label: "Talk to a Solar Advisor",
            action: () => openConsultationDrawer("residential"),
          },
        ],
      },
    ],
  },
  omnigrid: {
    label: "Solar + Storage",
    products: [
      {
        name: "Omnigrid Home Storage",
        subtitle: "14.3 kWh to 28.6 kWh modular battery",
        image: "/media/omnigrid-hero-640w.webp",
        alt: "WAVENOX Omnigrid LFP battery storage unit in a residential utility room",
        to: "/omnigrid",
      },
      {
        name: "Automatic Outage Switchover",
        subtitle: "Sub-20ms backup when grid power drops",
        image: "/media/omnigrid-switchover-640w.webp",
        alt: "Home illuminated reliably by Omnigrid storage during a grid outage",
        to: "/omnigrid",
        hash: "outage-defense",
      },
      {
        name: "Solar After Sunset",
        subtitle: "Power evening ACs & home loads",
        image: "/media/omnigrid-night-640w.webp",
        alt: "Warm evening courtyard residence powered by stored solar energy",
        to: "/omnigrid",
        hash: "sunset-power",
      },
    ],
    quickLinks: [
      {
        links: [
          { label: "Configure Solar + Storage", to: "/deploy" },
          { label: "Backup Duration Estimator", to: "/omnigrid", hash: "estimator" },
          { label: "24-Hour Energy Flow", to: "/omnigrid", hash: "flow-simulation" },
          { label: "10-Year Battery Warranty", to: "/warranty" },
          {
            label: "Talk to a Storage Advisor",
            action: () => openConsultationDrawer("omnigrid"),
          },
        ],
      },
    ],
  },
  commercial: {
    label: "Commercial",
    products: [
      {
        name: "Commercial & Industrial Solar",
        subtitle: "Manufacturing, logistics & cold storage",
        image: "/media/commercial-hero-640w.webp",
        alt: "Commercial rooftop solar array across an industrial facility",
        to: "/enterprise",
      },
      {
        name: "Daytime Tariff Reduction",
        subtitle: "High-yield arrays for peak daytime loads",
        image: "/media/commercial-industrial-640w.webp",
        alt: "High-density industrial solar installation reducing daytime operating tariffs",
        to: "/enterprise",
        hash: "operating-costs",
      },
      {
        name: "Campus & Enterprise Assessment",
        subtitle: "Custom structural & grid feasibility",
        image: "/media/commercial-campus-640w.webp",
        alt: "Corporate and enterprise campus rooftop solar architecture",
        to: "/enterprise",
        hash: "assessment",
      },
    ],
    quickLinks: [
      {
        links: [
          { label: "Commercial Yield & Tax Calculator", to: "/enterprise", hash: "calculator" },
          { label: "Interactive Sizing Studio", to: "/deploy" },
          { label: "For Architects & Builders", to: "/architects" },
          { label: "DISCOM Grid Approvals", to: "/net-metering" },
          {
            label: "Talk to a Commercial Advisor",
            action: () => openConsultationDrawer("commercial"),
          },
        ],
      },
    ],
  },
  discover: {
    label: "Discover",
    quickLinks: [
      {
        title: "Guides & Feasibility",
        links: [
          { label: "Solar Design Studio", to: "/deploy" },
          { label: "Net-Metering & Subsidies", to: "/net-metering" },
          { label: "Service Areas & Hubs", to: "/service-areas" },
          { label: "Frequently Asked Questions", to: "/faq" },
        ],
      },
      {
        title: "Engineering & Warranties",
        links: [
          { label: "Solar Engineering Standards", to: "/technology" },
          { label: "Warranties & Support Scope", to: "/warranty" },
          { label: "For Architects & Builders", to: "/architects" },
          { label: "Calculation Methodology", to: "/legal/disclosures" },
        ],
      },
      {
        title: "Company & Governance",
        links: [
          { label: "Our Story & Delivery Model", to: "/our-story" },
          { label: "Engineering Case Study", to: "/about-this-project" },
          { label: "Privacy & Data Protection", to: "/legal/privacy" },
          { label: "Talk to a Solar Advisor", action: () => openConsultationDrawer() },
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
        className="hidden lg:block fixed inset-0 top-14 bg-black/30 backdrop-blur-[2px] z-30 transition-opacity duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Full-Width Architectural Panel */}
      <div
        id="wavenox-megamenu"
        role="region"
        aria-label={`${data.label} submenu`}
        className="hidden lg:block fixed top-0 left-0 right-0 z-40 bg-[#FFFFFF] text-[#171A20] pt-[76px] pb-12 border-b border-black/[0.08] shadow-[0_20px_48px_rgba(0,0,0,0.12)] transition-all duration-200 animate-in fade-in-0"
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            e.preventDefault();
            onClose();
          }
        }}
      >
        <div className="max-w-[1160px] mx-auto px-8 lg:px-10">
          {isDiscover ? (
            /* 3-Column Layout for Discover */
            <div className="grid grid-cols-3 gap-12 max-w-4xl mx-auto">
              {data.quickLinks.map((col, idx) => (
                <div key={col.title || idx} className="space-y-4">
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
                            className="text-[14px] font-medium text-[#171A20] hover:text-[#5C5E62] transition-colors text-left cursor-pointer rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#171A20]"
                          >
                            {link.label}
                          </button>
                        ) : link.to ? (
                          <Link
                            to={link.to}
                            hash={link.hash}
                            onClick={onClose}
                            className="text-[14px] font-medium text-[#171A20] hover:text-[#5C5E62] transition-colors block rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#171A20]"
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
            /* Unified Product Cards + Curated Right-Rail Quick Links */
            <div className="grid grid-cols-12 gap-10 items-start">
              <div className="col-span-8 grid grid-cols-3 gap-6">
                {data.products?.map((prod) => (
                  <Link
                    key={prod.name}
                    to={prod.to}
                    hash={prod.hash}
                    onClick={onClose}
                    className="group flex flex-col text-left rounded-[6px] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#171A20]"
                  >
                    <div className="aspect-[16/10] w-full overflow-hidden rounded-[6px] bg-[#F4F4F4] border border-black/[0.06] mb-3.5 transition-colors duration-200 group-hover:border-black/[0.14]">
                      <img
                        src={prod.image}
                        alt={prod.alt}
                        width={640}
                        height={400}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.02]"
                      />
                    </div>
                    <h3 className="text-[15px] font-medium text-[#171A20] tracking-[-0.01em] group-hover:text-black transition-colors leading-snug">
                      {prod.name}
                    </h3>
                    <p className="text-[13px] text-[#5C5E62] mt-1 leading-[1.45]">
                      {prod.subtitle}
                    </p>
                  </Link>
                ))}
              </div>

              <div className="col-span-4 border-l border-[#E3E4E6] pl-8 space-y-2.5">
                {data.quickLinks[0]?.links.map((link) => (
                  <div key={link.label}>
                    {link.action ? (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          link.action?.();
                        }}
                        className="text-[14px] font-medium text-[#171A20] hover:text-[#5C5E62] transition-colors text-left cursor-pointer py-1 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#171A20]"
                      >
                        {link.label}
                      </button>
                    ) : link.to ? (
                      <Link
                        to={link.to}
                        hash={link.hash}
                        onClick={onClose}
                        className="text-[14px] font-medium text-[#171A20] hover:text-[#5C5E62] transition-colors block py-1 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#171A20]"
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
