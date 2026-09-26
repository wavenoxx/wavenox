import * as React from "react";
import { Link } from "@tanstack/react-router";
import { openConsultationDrawer } from "./ConsultationDrawer";

export type MegaMenuCategory = "solar" | "homes" | "omnigrid" | "commercial" | "discover" | null;

interface ProductItem {
  name: string;
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
        name: "Low-Profile Solar Panels",
        image: "/media/home-design-640w.webp",
        learnTo: "/residential",
        orderTo: "/deploy",
        orderLabel: "Order",
      },
      {
        name: "Elevated Solar Pergola",
        image: "/media/home-final-640w.webp",
        learnTo: "/residential",
        orderTo: "/deploy",
        orderLabel: "Order",
      },
      {
        name: "Bifacial Commercial Array",
        image: "/media/commercial-hero-640w.webp",
        learnTo: "/enterprise",
        orderTo: "/enterprise#assessment",
        orderLabel: "Request RFP",
      },
    ],
    quickLinks: [
      {
        links: [
          {
            label: "Speak with a Solar Engineer",
            action: () => openConsultationDrawer(),
          },
          { label: "Why WAVENOX Solar", to: "/residential" },
          { label: "PM Surya Ghar Subsidy Guide (₹78,000)", to: "/legal/disclosures" },
          { label: "Frequently Asked Questions (FAQ)", to: "/faq" },
          { label: "DISCOM Net-Metering & Sanctions", to: "/net-metering" },
          { label: "Calculate Savings", to: "/deploy" },
          { label: "Solar Engineering & Specifications", to: "/technology" },
        ],
      },
    ],
  },
  homes: {
    products: [
      {
        name: "Independent Villa Solar",
        image: "/media/res-hero-640w.webp",
        learnTo: "/residential",
        orderTo: "/deploy",
        orderLabel: "Order",
      },
      {
        name: "Terrace Living Pergola",
        image: "/media/res-terrace-640w.webp",
        learnTo: "/residential",
        orderTo: "/deploy",
        orderLabel: "Order",
      },
      {
        name: "Severe Storm Resilience",
        image: "/media/res-weather-640w.webp",
        learnTo: "/residential",
        orderTo: "/deploy",
        orderLabel: "Order",
      },
    ],
    quickLinks: [
      {
        links: [
          {
            label: "Book Rooftop Feasibility Survey",
            action: () => openConsultationDrawer(),
          },
          { label: "Zero Terrace Damage Guarantee", to: "/residential" },
          { label: "Utility Sanctions (TGSPDCL / APSPDCL)", to: "/legal/disclosures" },
          { label: "25-Year Linear Power Warranty", to: "/warranty" },
          { label: "Residential Financing & Subsidies", to: "/deploy" },
        ],
      },
    ],
  },
  omnigrid: {
    products: [
      {
        name: "Omnigrid 14.3 kWh",
        image: "/media/omnigrid-hero-640w.webp",
        learnTo: "/omnigrid",
        orderTo: "/deploy",
        orderLabel: "Configure",
      },
      {
        name: "Omnigrid Dual-Pack (28.6 kWh)",
        image: "/media/omnigrid-night-640w.webp",
        learnTo: "/omnigrid",
        orderTo: "/deploy",
        orderLabel: "Configure",
      },
      {
        name: "Solid-State Gateway (<20ms)",
        image: "/media/omnigrid-switchover-640w.webp",
        learnTo: "/omnigrid",
      },
    ],
    quickLinks: [
      {
        links: [
          {
            label: "Schedule Storage Consultation",
            action: () => openConsultationDrawer(),
          },
          { label: "Blackout Duration Estimator", to: "/omnigrid#estimator" },
          { label: "Diesel Generator Replacement ROI", to: "/omnigrid" },
          { label: "Nighttime Solar Self-Consumption", to: "/omnigrid" },
          { label: "LFP Chemistry & Safety Standards", to: "/omnigrid" },
        ],
      },
    ],
  },
  commercial: {
    products: [
      {
        name: "Industrial Rooftop Arrays",
        image: "/media/commercial-hero-640w.webp",
        learnTo: "/enterprise",
        orderTo: "/enterprise#assessment",
        orderLabel: "Request RFP",
      },
      {
        name: "Manufacturing & Pharma",
        image: "/media/commercial-industrial-640w.webp",
        learnTo: "/enterprise",
        orderTo: "/enterprise#assessment",
        orderLabel: "Request RFP",
      },
      {
        name: "Corporate Tech Campuses",
        image: "/media/commercial-campus-640w.webp",
        learnTo: "/enterprise",
        orderTo: "/enterprise#assessment",
        orderLabel: "Request RFP",
      },
    ],
    quickLinks: [
      {
        links: [
          {
            label: "Request Industrial Site Survey",
            action: () => openConsultationDrawer(),
          },
          { label: "Section 34 40% Tax Depreciation", to: "/enterprise" },
          { label: "Commercial Yield Calculator", to: "/enterprise#calculator" },
          { label: "CAPEX vs OPEX / RESCO Models", to: "/enterprise" },
          { label: "Grid Wheeling & HT Open Access", to: "/enterprise" },
        ],
      },
    ],
  },
  discover: {
    quickLinks: [
      {
        title: "Resources",
        links: [
          { label: "Solar Savings Calculator", to: "/deploy" },
          { label: "Frequently Asked Questions (FAQ)", to: "/faq" },
          { label: "PM Surya Ghar Subsidy Guide", to: "/legal/disclosures" },
          { label: "Structural Wind Load Standards", to: "/technology" },
          { label: "Regional Jurisdictions & DISCOMs", to: "/service-areas" },
          { label: "Architectural Solar & CAD Specs", to: "/architects" },
        ],
      },
      {
        title: "Technology",
        links: [
          { label: "N-Type TOPCon Cell Architecture", to: "/technology" },
          { label: "Home Battery Backup System", to: "/omnigrid" },
          { label: "Smart Inverter Cloud Telemetry", to: "/#monitoring" },
          { label: "Linear 25-Year Performance Curve", to: "/warranty" },
        ],
      },
      {
        title: "Company",
        links: [
          {
            label: "Speak with Solar Advisor",
            action: () => openConsultationDrawer(),
          },
          { label: "Design Story & Concept", to: "/our-story" },
          { label: "Terms of Service", to: "/legal/terms" },
          { label: "Privacy Policy", to: "/legal/privacy" },
          { label: "Regulatory Disclosures", to: "/legal/disclosures" },
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
        className="fixed top-14 left-0 right-0 z-40 bg-[#FFFFFF] text-[#171A20] border-b border-[#E3E4E6] shadow-2xl transition-all duration-200 animate-in fade-in-0 slide-in-from-top-1"
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-10 py-10">
          {isDiscover ? (
            /* 3-Column Layout for Discover */
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 max-w-4xl mx-auto">
              {data.quickLinks?.map((col, idx) => (
                <div key={idx} className="space-y-4">
                  {col.title && (
                    <div className="text-[13px] font-medium text-[#5C5E62] uppercase tracking-[0.05em]">
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
                            className="text-[14px] font-medium text-[#171A20] hover:text-[#5C5E62] transition-colors text-left cursor-pointer"
                          >
                            {link.label}
                          </button>
                        ) : link.to ? (
                          <Link
                            to={link.to}
                            onClick={onClose}
                            className="text-[14px] font-medium text-[#171A20] hover:text-[#5C5E62] transition-colors block"
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
                      className="w-full aspect-[16/10] rounded-[6px] overflow-hidden bg-[#F4F4F4] mb-3 flex items-center justify-center p-2 relative group-hover:opacity-95 transition-opacity"
                    >
                      <img
                        src={prod.image}
                        alt={prod.name}
                        className="w-full h-full object-cover rounded-[4px] transform group-hover:scale-102 transition-transform duration-300"
                        loading="eager"
                      />
                    </Link>

                    {/* Product Name */}
                    <h3 className="text-[15px] font-medium text-[#171A20] leading-snug mb-2">
                      {prod.name}
                    </h3>

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
                            className="underline underline-offset-4 decoration-[#E3E4E6] hover:decoration-[#171A20] hover:text-[#171A20] transition-colors"
                          >
                            {prod.orderLabel || "Order"}
                          </Link>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Right: Quick Links Separated by Hairline Divider */}
              <div className="lg:col-span-4 lg:border-l lg:border-[#E3E4E6] lg:pl-8 space-y-3">
                {data.quickLinks?.[0]?.links.map((link) => (
                  <div key={link.label}>
                    {link.action ? (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          link.action?.();
                        }}
                        className="text-[14px] font-medium text-[#171A20] hover:text-[#5C5E62] transition-colors text-left cursor-pointer py-1"
                      >
                        {link.label}
                      </button>
                    ) : link.to ? (
                      <Link
                        to={link.to}
                        onClick={onClose}
                        className="text-[14px] font-medium text-[#171A20] hover:text-[#5C5E62] transition-colors block py-1"
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
