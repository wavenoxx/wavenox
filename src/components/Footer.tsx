import * as React from "react";
import { Link } from "@tanstack/react-router";
import { Phone, MessageSquare, Mail, ArrowUpRight } from "lucide-react";
import { BRAND_CONFIG } from "@/config/brand";
import { BrandLogo } from "./BrandLogo";
import { openConsultationDrawer } from "@/lib/consultation";

export interface FooterLinkItem {
  label: string;
  to?: string;
  search?: Record<string, string>;
  href?: string;
  action?: () => void;
}

export interface FooterColumn {
  heading: string;
  links: FooterLinkItem[];
}

const FOOTER_COLUMNS: FooterColumn[] = [
  {
    heading: "Solar & Storage",
    links: [
      { label: "Rooftop Solar Overview", to: "/" },
      { label: "Solar Panels for Homes", to: "/residential" },
      { label: "Solar + Battery Storage", to: "/omnigrid" },
      { label: "Commercial Solar", to: "/enterprise" },
      { label: "Solar Design Studio", to: "/deploy" },
    ],
  },
  {
    heading: "Engineering & Guides",
    links: [
      { label: "Solar Engineering Standards", to: "/technology" },
      { label: "Net-Metering & Subsidies", to: "/net-metering" },
      { label: "Warranties & Support", to: "/warranty" },
      { label: "For Architects & Builders", to: "/architects" },
      { label: "Frequently Asked Questions", to: "/faq" },
    ],
  },
  {
    heading: "Service & Company",
    links: [
      { label: "Service Areas & Hubs", to: "/service-areas" },
      {
        label: "Telangana (TGSPDCL / TGNPDCL)",
        to: "/service-areas",
        search: { state: "telangana" },
      },
      {
        label: "Andhra Pradesh (APEPDCL / APSPDCL)",
        to: "/service-areas",
        search: { state: "andhra-pradesh" },
      },
      { label: "Our Story & Delivery Model", to: "/our-story" },
      { label: "Talk to a Solar Advisor", action: () => openConsultationDrawer() },
    ],
  },
  {
    heading: "Legal & Governance",
    links: [
      { label: "Calculation Disclosures", to: "/legal/disclosures" },
      { label: "Privacy Policy (DPDP 2023)", to: "/legal/privacy" },
      { label: "Terms of Service", to: "/legal/terms" },
      { label: "Engineering Case Study", to: "/about-this-project" },
      { label: "PM Surya Ghar Portal", href: "https://pmsuryaghar.gov.in" },
    ],
  },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-[#FFFFFF] text-[#171A20] border-t border-[#E3E4E6]">
      <div className="max-w-[1240px] mx-auto px-5 sm:px-8 lg:px-12 pt-16 pb-12">
        {/* QUIET ARCHITECTURAL IDENTITY STRIP */}
        <div className="pb-10 mb-10 border-b border-[#E3E4E6] flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="max-w-xl space-y-2">
            <BrandLogo size="sm" asLink={false} className="text-[#171A20]" />
            <p className="text-[14px] text-[#5C5E62] leading-relaxed">{BRAND_CONFIG.tagline}</p>
          </div>
          <div className="text-[12px] font-medium uppercase tracking-[0.08em] text-[#5C5E62]">
            Residential · Battery Storage · Commercial Solar
          </div>
        </div>

        {/* 4-COLUMN DEDUPLICATED DIRECTORY (5 UNIQUE DESTINATIONS PER COLUMN) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 lg:gap-12">
          {FOOTER_COLUMNS.map((col) => (
            <div key={col.heading} className="space-y-4">
              <h2 className="text-[12px] font-semibold text-[#171A20] uppercase tracking-[0.14em]">
                {col.heading}
              </h2>
              <ul className="space-y-1.5 text-[13px] text-[#5C5E62]">
                {col.links.map((item) => (
                  <li key={item.label}>
                    {item.action ? (
                      <button
                        type="button"
                        onClick={item.action}
                        className="min-h-[26px] py-0.5 hover:text-[#171A20] transition-colors cursor-pointer text-left inline-flex items-center rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#171A20]"
                      >
                        {item.label}
                      </button>
                    ) : item.href ? (
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="min-h-[26px] py-0.5 hover:text-[#171A20] transition-colors inline-flex items-center gap-1 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#171A20]"
                      >
                        <span>{item.label}</span>
                        <ArrowUpRight className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                      </a>
                    ) : item.to ? (
                      <Link
                        to={item.to}
                        search={item.search}
                        className="min-h-[26px] py-0.5 hover:text-[#171A20] transition-colors inline-flex items-center rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#171A20]"
                      >
                        {item.label}
                      </Link>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* REGIONAL CONTACT STRIP */}
        <div className="mt-12 pt-8 border-t border-[#E3E4E6] flex flex-col md:flex-row items-start md:items-center justify-between gap-6 text-[13px] text-[#5C5E62]">
          <div className="flex items-center gap-3">
            <span className="font-semibold tracking-[0.2em] uppercase text-[#171A20] text-[13px]">
              {BRAND_CONFIG.name}
            </span>
            <span className="text-[#5C5E62]/40" aria-hidden="true">
              |
            </span>
            <span className="text-[12px] text-[#5C5E62]">{BRAND_CONFIG.contact.address}</span>
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <a
              href={`tel:${BRAND_CONFIG.contact.phone.dial}`}
              className="min-h-[28px] py-1 inline-flex items-center gap-2 hover:text-[#171A20] transition-colors rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#171A20]"
            >
              <Phone className="w-4 h-4 text-[#F57C00] shrink-0" aria-hidden="true" />
              <span>{BRAND_CONFIG.contact.phone.display}</span>
            </a>
            <a
              href={BRAND_CONFIG.contact.whatsapp.link}
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[28px] py-1 inline-flex items-center gap-2 hover:text-[#171A20] transition-colors rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#171A20]"
            >
              <MessageSquare className="w-4 h-4 text-[#F57C00] shrink-0" aria-hidden="true" />
              <span>WhatsApp: {BRAND_CONFIG.contact.whatsapp.display}</span>
            </a>
            <a
              href={`mailto:${BRAND_CONFIG.contact.email}`}
              className="min-h-[28px] py-1 inline-flex items-center gap-2 hover:text-[#171A20] transition-colors rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#171A20]"
            >
              <Mail className="w-4 h-4 text-[#F57C00] shrink-0" aria-hidden="true" />
              <span>{BRAND_CONFIG.contact.email}</span>
            </a>
          </div>
        </div>

        {/* BOTTOM FINE-PRINT STRIP */}
        <div className="mt-8 pt-6 border-t border-[#E3E4E6]/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-[12px] text-[#393C41] text-center sm:text-left">
          <div>
            © {currentYear} {BRAND_CONFIG.legalName} · Architectural Solar &amp; Energy Storage.
            Statutory generation and tariff references follow MNRE &amp; state DISCOM frameworks.
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 shrink-0">
            <Link
              to="/legal/privacy"
              className="min-h-[26px] min-w-[28px] py-0.5 inline-flex items-center justify-center text-[#393C41] hover:text-[#171A20] transition-colors"
            >
              Privacy
            </Link>
            <span aria-hidden="true">·</span>
            <Link
              to="/legal/terms"
              className="min-h-[26px] min-w-[28px] py-0.5 inline-flex items-center justify-center text-[#393C41] hover:text-[#171A20] transition-colors"
            >
              Terms
            </Link>
            <span aria-hidden="true">·</span>
            <Link
              to="/legal/disclosures"
              className="min-h-[26px] min-w-[28px] py-0.5 inline-flex items-center justify-center text-[#393C41] hover:text-[#171A20] transition-colors"
            >
              Disclosures
            </Link>
            <span aria-hidden="true">·</span>
            <Link
              to="/about-this-project"
              className="min-h-[26px] min-w-[28px] py-0.5 inline-flex items-center justify-center text-[#393C41] hover:text-[#171A20] transition-colors"
            >
              Colophon
            </Link>
            <span aria-hidden="true">·</span>
            <Link
              to="/faq"
              className="min-h-[26px] min-w-[28px] py-0.5 inline-flex items-center justify-center text-[#393C41] hover:text-[#171A20] transition-colors"
            >
              FAQ
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
