import * as React from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Phone, MessageSquare } from "lucide-react";
import { BRAND_CONFIG } from "@/config/brand";
import { openConsultationDrawer } from "./ConsultationDrawer";

const MAIN_NAV = [
  { label: "Solar Panels", to: "/" },
  { label: "Homes", to: "/residential" },
  { label: "Omnigrid", to: "/omnigrid" },
  { label: "Commercial", to: "/enterprise" },
];

const MENU_NAV = [
  { label: "Solar Panels", to: "/" },
  { label: "Solar for Homes", to: "/residential" },
  { label: "Omnigrid Storage", to: "/omnigrid" },
  { label: "Commercial Solar", to: "/enterprise" },
  { label: "Design Studio", to: "/deploy" },
];

export function Header() {
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const routerState = useRouterState();
  const pathname = routerState.location.pathname;

  // Static light routes that do not have full-bleed hero photos
  const isLightPage =
    pathname.startsWith("/deploy") ||
    pathname.startsWith("/legal") ||
    pathname.startsWith("/order");

  // Auto-close menu on route navigation
  React.useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  React.useEffect(() => {
    function handleScroll() {
      setIsScrolled(window.scrollY > 40);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const showSolidHeader = isScrolled || isLightPage;

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 h-14 z-40 transition-colors duration-200 flex items-center justify-between px-6 lg:px-10 ${
          showSolidHeader
            ? "bg-[#FFFFFF]/90 backdrop-blur-md text-[#171A20] border-b border-[#E3E4E6]"
            : "bg-transparent text-[#FFFFFF]"
        }`}
      >
        {/* Left: Brand Name / Wordmark */}
        <Link
          to="/"
          className="text-[15px] font-medium tracking-[0.2em] uppercase select-none transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current"
          aria-label="WAVENOX Home"
        >
          {BRAND_CONFIG.name}
        </Link>

        {/* Center: Minimalist Showroom Links */}
        <nav className="hidden md:flex items-center space-x-1" aria-label="Main Navigation">
          {MAIN_NAV.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className="px-3.5 py-1.5 rounded-[4px] text-[14px] font-medium transition-colors hover:bg-current/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right: Consultation Text & Menu Button */}
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => openConsultationDrawer()}
            className="hidden sm:inline-flex items-center px-3.5 py-1.5 rounded-[4px] text-[14px] font-medium transition-colors hover:bg-current/10 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current"
          >
            Consultation
          </button>

          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            className="px-3.5 py-1.5 rounded-[4px] text-[14px] font-medium transition-colors hover:bg-current/10 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current"
          >
            Menu
          </button>
        </div>
      </header>

      {/* Radix Dialog Full-Height Menu Sheet */}
      <Dialog.Root open={menuOpen} onOpenChange={setMenuOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <Dialog.Content className="fixed inset-y-0 right-0 z-50 w-full sm:max-w-sm bg-[#FFFFFF] text-[#171A20] shadow-2xl flex flex-col justify-between p-8 focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right duration-200">
            {/* Top Close Row */}
            <div>
              <div className="flex items-center justify-between pb-8">
                <Dialog.Title className="text-[14px] font-medium tracking-[0.2em] uppercase text-[#5C5E62]">
                  {BRAND_CONFIG.name}
                </Dialog.Title>
                <Dialog.Close asChild>
                  <button
                    type="button"
                    className="p-1.5 rounded-[4px] text-[#5C5E62] hover:text-[#171A20] hover:bg-[#F4F4F4] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#171A20]"
                    aria-label="Close navigation menu"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </Dialog.Close>
              </div>

              {/* Navigation Items */}
              <nav className="flex flex-col space-y-4" aria-label="Menu Items">
                {MENU_NAV.map((item) => (
                  <Link
                    key={item.label}
                    to={item.to}
                    onClick={() => setMenuOpen(false)}
                    className="text-[18px] font-medium tracking-tight text-[#171A20] hover:text-[#5C5E62] transition-colors py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#171A20]"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Bottom Contact & Consultation Area */}
            <div className="pt-8 border-t border-[#E3E4E6] space-y-4">
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  openConsultationDrawer();
                }}
                className="w-full h-10 px-6 rounded-[4px] bg-[#171A20] text-[#FFFFFF] text-[14px] font-medium hover:bg-[#171A20]/90 transition-colors flex items-center justify-center cursor-pointer"
              >
                Schedule Consultation
              </button>

              <div className="flex flex-col space-y-2 text-[13px] text-[#5C5E62]">
                <a
                  href={`tel:${BRAND_CONFIG.contact.phone.dial}`}
                  className="flex items-center gap-2 hover:text-[#171A20] transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  <span>{BRAND_CONFIG.contact.phone.display}</span>
                </a>
                <a
                  href={BRAND_CONFIG.contact.whatsapp.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-[#171A20] transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>WhatsApp: {BRAND_CONFIG.contact.whatsapp.display}</span>
                </a>
              </div>

              <p className="text-[12px] text-[#5C5E62]/70 leading-normal pt-2">
                Turnkey residential & commercial solar across Telangana, Andhra Pradesh & Bengaluru.
              </p>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
