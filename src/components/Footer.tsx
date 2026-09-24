import { BRAND_CONFIG } from "@/config/brand";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-white py-10 px-6 text-center text-xs text-[#5C5E62] border-t border-[#E2E8F0]">
      <div className="max-w-6xl mx-auto flex flex-wrap justify-center items-center gap-x-6 gap-y-3 font-normal">
        <span className="text-[#171A20] font-medium tracking-wider uppercase">
          {BRAND_CONFIG.name} © {currentYear}
        </span>
        <a href="#privacy" className="hover:text-[#171A20] transition-colors">
          Privacy & Legal
        </a>
        <a href="#disclosures" className="hover:text-[#171A20] transition-colors">
          Consumer Disclosures
        </a>
        <a href="#subsidies" className="hover:text-[#171A20] transition-colors">
          PM Surya Ghar Guidelines
        </a>
        <a href="#locations" className="hover:text-[#171A20] transition-colors">
          Locations: Hyderabad HQ • Bengaluru • Mumbai • Vijayawada • Delhi-NCR
        </a>
        <a
          href={`tel:${BRAND_CONFIG.contact.phone.dial}`}
          className="hover:text-[#171A20] transition-colors font-medium text-[#171A20]"
        >
          Contact: {BRAND_CONFIG.contact.phone.display}
        </a>
      </div>
    </footer>
  );
}
