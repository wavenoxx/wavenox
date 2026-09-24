import { Link } from "@tanstack/react-router";
import { BRAND_CONFIG } from "@/config/brand";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-[#FFFFFF] py-12 px-6 sm:px-12 text-xs text-[#5C5E62] border-t border-[#E2E8F0]">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Top: Links & Navigation */}
        <div className="flex flex-wrap justify-between items-center gap-y-4 gap-x-6 pb-6 border-b border-[#E2E8F0]">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <Link to="/legal/privacy" className="hover:text-[#171A20] transition-colors">
              Privacy Policy (DPDP)
            </Link>
            <Link to="/legal/terms" className="hover:text-[#171A20] transition-colors">
              Terms & Quotation Conditions
            </Link>
            <Link to="/legal/disclosures" className="hover:text-[#171A20] transition-colors">
              Calculation Methodology & Disclosures
            </Link>
          </div>

          <div className="flex items-center gap-4 text-[#171A20] font-medium">
            <a
              href={`tel:${BRAND_CONFIG.contact.phone.dial}`}
              className="hover:underline transition-colors"
            >
              {BRAND_CONFIG.contact.phone.display}
            </a>
            <span className="text-[#E2E8F0]">•</span>
            <a
              href={`mailto:${BRAND_CONFIG.contact.email}`}
              className="hover:underline transition-colors"
            >
              {BRAND_CONFIG.contact.email}
            </a>
          </div>
        </div>

        {/* Middle: Corporate Entity & Office Location */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-[11px] text-[#5C5E62] leading-relaxed">
          <div>
            <span className="font-semibold text-[#171A20]">{BRAND_CONFIG.legalName}</span>
            <span className="hidden sm:inline"> | CIN: U40106TG2026PTC189000 (Reg. Pending)</span>
            <p className="mt-0.5">{BRAND_CONFIG.contact.address}</p>
          </div>

          <div className="text-left md:text-right">
            <p>Statutory Grievance Redressal: grievance@wavenox.com</p>
            <p className="mt-0.5">
              Service Hubs: Hyderabad • Bengaluru • Mumbai • Vijayawada • Delhi-NCR
            </p>
          </div>
        </div>

        {/* Bottom: Copyright */}
        <div className="text-center pt-2 text-[11px] text-[#5C5E62]">
          © {currentYear} WAVENOX Energy Technologies. All rights reserved. Monolithic architectural
          solar systems engineered for Indian grid resilience.
        </div>
      </div>
    </footer>
  );
}
