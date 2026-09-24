import * as React from "react";
import { Link } from "@tanstack/react-router";
import { BRAND_CONFIG } from "@/config/brand";
import { openConsultationDrawer } from "./ConsultationDrawer";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-[#FFFFFF] py-8 px-6 text-[12px] text-[#5C5E62] border-t border-[#E3E4E6] select-none">
      <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-center leading-normal">
        <span>{BRAND_CONFIG.name} © {currentYear}</span>
        <span aria-hidden="true" className="text-[#5C5E62]/40">·</span>
        <Link
          to="/legal/privacy"
          className="hover:text-[#171A20] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#171A20]"
        >
          Privacy
        </Link>
        <span aria-hidden="true" className="text-[#5C5E62]/40">·</span>
        <Link
          to="/legal/terms"
          className="hover:text-[#171A20] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#171A20]"
        >
          Terms
        </Link>
        <span aria-hidden="true" className="text-[#5C5E62]/40">·</span>
        <Link
          to="/legal/disclosures"
          className="hover:text-[#171A20] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#171A20]"
        >
          Disclosures
        </Link>
        <span aria-hidden="true" className="text-[#5C5E62]/40">·</span>
        <a
          href="https://pmsuryaghar.gov.in"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-[#171A20] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#171A20]"
        >
          PM Surya Ghar
        </a>
        <span aria-hidden="true" className="text-[#5C5E62]/40">·</span>
        <button
          type="button"
          onClick={() => openConsultationDrawer()}
          className="hover:text-[#171A20] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#171A20]"
        >
          Contact
        </button>
      </div>
    </footer>
  );
}
