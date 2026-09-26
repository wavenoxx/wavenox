import * as React from "react";
import { Link } from "@tanstack/react-router";
import { Phone, MessageSquare, MapPin, Mail, ArrowUpRight } from "lucide-react";
import { BRAND_CONFIG } from "@/config/brand";
import { BrandLogo } from "./BrandLogo";
import { openConsultationDrawer } from "./ConsultationDrawer";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-[#FFFFFF] text-[#171A20] border-t border-[#E3E4E6]">
      {/* 4-COLUMN ARCHITECTURAL SITEMAP */}
      <div className="max-w-7xl mx-auto px-6 sm:px-10 pt-16 pb-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 lg:gap-12">
          {/* COLUMN 1: ARCHITECTURE & SYSTEMS */}
          <div className="space-y-4">
            <h4 className="text-[12px] font-semibold text-[#171A20] uppercase tracking-[0.16em]">
              Clean Energy Systems
            </h4>
            <ul className="space-y-2.5 text-[13px] text-[#5C5E62]">
              <li>
                <Link to="/" className="hover:text-[#171A20] transition-colors">
                  All-Black Solar Panels
                </Link>
              </li>
              <li>
                <Link to="/residential" className="hover:text-[#171A20] transition-colors">
                  Elevated Terrace Pergolas
                </Link>
              </li>
              <li>
                <Link to="/omnigrid" className="hover:text-[#171A20] transition-colors">
                  Omnigrid LFP Battery Storage
                </Link>
              </li>
              <li>
                <Link to="/enterprise" className="hover:text-[#171A20] transition-colors">
                  Commercial &amp; Industrial MW
                </Link>
              </li>
              <li>
                <Link to="/deploy" className="hover:text-[#171A20] transition-colors">
                  Solar Sizing Studio
                </Link>
              </li>
            </ul>
          </div>

          {/* COLUMN 2: ENGINEERING & SCIENCE */}
          <div className="space-y-4">
            <h4 className="text-[12px] font-semibold text-[#171A20] uppercase tracking-[0.16em]">
              Engineering &amp; Science
            </h4>
            <ul className="space-y-2.5 text-[13px] text-[#5C5E62]">
              <li>
                <Link to="/technology" className="hover:text-[#171A20] transition-colors">
                  Solar Engineering
                </Link>
              </li>
              <li>
                <Link to="/warranty" className="hover:text-[#171A20] transition-colors">
                  25-Year Warranty Standards
                </Link>
              </li>
              <li>
                <Link to="/technology" className="hover:text-[#171A20] transition-colors">
                  N-Type TOPCon Dual-Glass
                </Link>
              </li>
              <li>
                <Link to="/technology" className="hover:text-[#171A20] transition-colors">
                  IS 875 (Part 3) 44 m/s Metallurgy
                </Link>
              </li>
              <li>
                <Link to="/architects" className="hover:text-[#171A20] transition-colors">
                  Architectural Solar Specs
                </Link>
              </li>
              <li>
                <Link to="/" hash="monitoring" className="hover:text-[#171A20] transition-colors">
                  Realtime IoT Telemetry
                </Link>
              </li>
            </ul>
          </div>

          {/* COLUMN 3: REGIONAL HUBS & DISCOMS */}
          <div className="space-y-4">
            <h4 className="text-[12px] font-semibold text-[#171A20] uppercase tracking-[0.16em]">
              Jurisdictions &amp; Grid
            </h4>
            <ul className="space-y-2.5 text-[13px] text-[#5C5E62]">
              <li>
                <Link to="/service-areas" className="hover:text-[#171A20] transition-colors">
                  Regional Service Areas
                </Link>
              </li>
              <li>
                <Link to="/service-areas" className="hover:text-[#171A20] transition-colors">
                  Telangana (TGSPDCL / TGNPDCL)
                </Link>
              </li>
              <li>
                <Link to="/service-areas" className="hover:text-[#171A20] transition-colors">
                  Andhra Pradesh (APEPDCL / APSPDCL)
                </Link>
              </li>
              <li>
                <Link to="/service-areas" className="hover:text-[#171A20] transition-colors">
                  Karnataka (BESCOM)
                </Link>
              </li>
              <li>
                <Link to="/net-metering" className="hover:text-[#171A20] transition-colors">
                  DISCOM Net-Metering &amp; Sanctions
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-[#171A20] transition-colors">
                  Frequently Asked Questions (FAQ)
                </Link>
              </li>
              <li>
                <a
                  href="https://pmsuryaghar.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#171A20] transition-colors inline-flex items-center gap-1"
                >
                  <span>PM Surya Ghar Portal</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              </li>
            </ul>
          </div>

          {/* COLUMN 4: COMPANY & LEGAL */}
          <div className="space-y-4">
            <h4 className="text-[12px] font-semibold text-[#171A20] uppercase tracking-[0.16em]">
              Company &amp; Governance
            </h4>
            <ul className="space-y-2.5 text-[13px] text-[#5C5E62]">
              <li>
                <Link to="/our-story" className="hover:text-[#171A20] transition-colors">
                  Our Story &amp; Ethos
                </Link>
              </li>
              <li>
                <Link to="/legal/disclosures" className="hover:text-[#171A20] transition-colors">
                  Statutory Disclosures
                </Link>
              </li>
              <li>
                <Link to="/legal/terms" className="hover:text-[#171A20] transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/legal/privacy" className="hover:text-[#171A20] transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => openConsultationDrawer()}
                  className="hover:text-[#171A20] transition-colors cursor-pointer text-left"
                >
                  Schedule Technical Consultation
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* REGIONAL CONTACT STRIP */}
        <div className="mt-12 pt-8 border-t border-[#E3E4E6] flex flex-col md:flex-row items-start md:items-center justify-between gap-6 text-[13px] text-[#5C5E62]">
          <div className="flex items-center gap-3">
            <BrandLogo size="sm" asLink={false} />
            <span className="text-[#5C5E62]/40">|</span>
            <span className="text-[12px]">{BRAND_CONFIG.contact.address}</span>
          </div>

          <div className="flex flex-wrap items-center gap-5">
            <a
              href={`tel:${BRAND_CONFIG.contact.phone.dial}`}
              className="flex items-center gap-2 hover:text-[#171A20] transition-colors"
            >
              <Phone className="w-4 h-4 text-[#F57C00]" />
              <span>{BRAND_CONFIG.contact.phone.display}</span>
            </a>
            <a
              href={BRAND_CONFIG.contact.whatsapp.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:text-[#171A20] transition-colors"
            >
              <MessageSquare className="w-4 h-4 text-[#F57C00]" />
              <span>WhatsApp: {BRAND_CONFIG.contact.whatsapp.display}</span>
            </a>
            <a
              href={`mailto:${BRAND_CONFIG.contact.email}`}
              className="flex items-center gap-2 hover:text-[#171A20] transition-colors"
            >
              <Mail className="w-4 h-4 text-[#F57C00]" />
              <span>{BRAND_CONFIG.contact.email}</span>
            </a>
          </div>
        </div>

        {/* BOTTOM FINE-PRINT STRIP */}
        <div className="mt-8 pt-6 border-t border-[#E3E4E6]/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-[12px] text-[#5C5E62]/80 text-center sm:text-left">
          <div>
            {BRAND_CONFIG.name} · Architectural Solar Concept © {currentYear}. Sourced statutory
            calculations for Telangana (TGSPDCL &amp; TGNPDCL).
          </div>
          <div className="flex items-center gap-4">
            <Link to="/legal/privacy" className="hover:text-[#171A20] transition-colors">
              Privacy
            </Link>
            <span>·</span>
            <Link to="/legal/terms" className="hover:text-[#171A20] transition-colors">
              Terms
            </Link>
            <span>·</span>
            <Link to="/legal/disclosures" className="hover:text-[#171A20] transition-colors">
              Disclosures
            </Link>
            <span>·</span>
            <Link to="/faq" className="hover:text-[#171A20] transition-colors">
              FAQ
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
