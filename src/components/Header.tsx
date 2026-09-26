import * as React from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Phone, MessageSquare, HelpCircle, Globe, User, ChevronRight } from "lucide-react";
import { BRAND_CONFIG } from "@/config/brand";
import { BrandLogo } from "./BrandLogo";
import { MegaMenu, type MegaMenuCategory } from "./MegaMenu";
import { openConsultationDrawer } from "./ConsultationDrawer";

interface NavItem {
  key: Exclude<MegaMenuCategory, null>;
  label: string;
  to: string;
}

const NAV_ITEMS: NavItem[] = [
  { key: "solar", label: "Solar Panels", to: "/" },
  { key: "homes", label: "Homes", to: "/residential" },
  { key: "omnigrid", label: "Omnigrid", to: "/omnigrid" },
  { key: "commercial", label: "Commercial", to: "/enterprise" },
  { key: "discover", label: "Discover", to: "/deploy" },
];

export function Header() {
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [activeCategory, setActiveCategory] = React.useState<MegaMenuCategory>(null);
  const [regionModalOpen, setRegionModalOpen] = React.useState(false);

  const closeTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const routerState = useRouterState();
  const pathname = routerState.location.pathname;

  const currentMatch = routerState.matches[routerState.matches.length - 1];
  const headerTone =
    (currentMatch?.staticData as { headerTone?: "overlay" | "solid" } | undefined)?.headerTone ??
    "solid";

  // Auto-close menus on route navigation
  React.useEffect(() => {
    setActiveCategory(null);
    setMenuOpen(false);
  }, [pathname]);

  React.useEffect(() => {
    function handleScroll() {
      setIsScrolled(window.scrollY > 40);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleMouseEnter = (key: Exclude<MegaMenuCategory, null>) => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setActiveCategory(key);
  };

  const handleMouseLeave = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
    }
    closeTimerRef.current = setTimeout(() => {
      setActiveCategory(null);
    }, 150);
  };

  const handleMenuContainerEnter = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const isMenuVisible = activeCategory !== null;
  const isOverlay = headerTone === "overlay";
  const showSolidHeader = isScrolled || !isOverlay || isMenuVisible;

  return (
    <>
      <header
        onMouseLeave={handleMouseLeave}
        className={`fixed top-0 left-0 right-0 h-14 z-50 transition-colors duration-200 flex items-center justify-between px-6 lg:px-10 ${
          showSolidHeader
            ? "bg-[#FFFFFF] text-[#171A20] border-b border-[#E3E4E6]"
            : "bg-transparent text-[#FFFFFF]"
        }`}
      >
        {/* Left: Brand Geometric Wordmark */}
        <div className="flex items-center">
          <BrandLogo size="md" className={showSolidHeader ? "text-[#171A20]" : "text-[#FFFFFF]"} />
        </div>

        {/* Center: Tesla-Style Minimal Navigation Items */}
        <nav className="hidden md:flex items-center space-x-1" aria-label="Main Navigation">
          {NAV_ITEMS.map((item) => {
            const isHovered = activeCategory === item.key;
            return (
              <Link
                key={item.key}
                to={item.to}
                onMouseEnter={() => handleMouseEnter(item.key)}
                className={`relative px-4 py-1.5 rounded-[4px] text-[14px] font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current ${
                  isHovered
                    ? "bg-[#F4F4F4] text-[#171A20]"
                    : showSolidHeader
                      ? "hover:bg-[#F4F4F4] text-[#171A20]"
                      : "hover:bg-white/10 text-[#FFFFFF]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right: Tesla-Style Utility Icons & Actions */}
        <div className="flex items-center space-x-1 sm:space-x-2">
          {/* Help / Consultation Icon */}
          <button
            type="button"
            onClick={() => openConsultationDrawer()}
            title="Schedule Consultation"
            aria-label="Schedule Consultation"
            className={`p-2 rounded-[4px] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current ${
              showSolidHeader ? "hover:bg-[#F4F4F4]" : "hover:bg-white/10"
            }`}
          >
            <HelpCircle className="w-[18px] h-[18px]" />
          </button>

          {/* Region / Grid Icon */}
          <button
            type="button"
            onClick={() => setRegionModalOpen(true)}
            title="Supported States & DISCOMs"
            aria-label="Regional Grid"
            className={`p-2 rounded-[4px] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current ${
              showSolidHeader ? "hover:bg-[#F4F4F4]" : "hover:bg-white/10"
            }`}
          >
            <Globe className="w-[18px] h-[18px]" />
          </button>

          {/* Account / Design Studio Icon */}
          <Link
            to="/deploy"
            title="Design Studio"
            aria-label="Design Studio"
            className={`p-2 rounded-[4px] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current ${
              showSolidHeader ? "hover:bg-[#F4F4F4]" : "hover:bg-white/10"
            }`}
          >
            <User className="w-[18px] h-[18px]" />
          </Link>

          {/* Mobile / Compact Menu Trigger */}
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Open navigation menu"
            className={`px-3 py-1.5 rounded-[4px] text-[14px] font-medium transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current md:hidden ${
              showSolidHeader ? "hover:bg-[#F4F4F4]" : "hover:bg-white/10"
            }`}
          >
            Menu
          </button>
        </div>
      </header>

      {/* Tesla-Grade Full-Width Mega Menu Flyout */}
      <MegaMenu
        activeCategory={activeCategory}
        onClose={() => setActiveCategory(null)}
        onMouseEnter={handleMenuContainerEnter}
        onMouseLeave={handleMouseLeave}
      />

      {/* Regional Grid Dialog */}
      <Dialog.Root open={regionModalOpen} onOpenChange={setRegionModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md bg-[#FFFFFF] text-[#171A20] rounded-[8px] p-6 shadow-2xl focus:outline-none">
            <div className="flex items-center justify-between pb-4 border-b border-[#E3E4E6]">
              <Dialog.Title className="text-[16px] font-medium">
                Active Solar Grid Jurisdictions
              </Dialog.Title>
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="p-1 rounded-[4px] text-[#5C5E62] hover:text-[#171A20] hover:bg-[#F4F4F4]"
                >
                  <X className="w-5 h-5" />
                </button>
              </Dialog.Close>
            </div>
            <div className="py-4 space-y-3 text-[14px]">
              <div className="p-3 bg-[#F4F4F4] rounded-[4px]">
                <div className="font-medium text-[#171A20]">Telangana (TGSPDCL / TGNPDCL)</div>
                <div className="text-[12px] text-[#5C5E62]">
                  Hyderabad, Secunderabad, Rangareddy, Warangal. PM Surya Ghar ready.
                </div>
              </div>
              <div className="p-3 bg-[#F4F4F4] rounded-[4px]">
                <div className="font-medium text-[#171A20]">
                  Andhra Pradesh (APEPDCL / APSPDCL / APCPDCL)
                </div>
                <div className="text-[12px] text-[#5C5E62]">
                  Visakhapatnam, Vijayawada, Guntur, Tirupati. Direct subsidy sanctioning.
                </div>
              </div>
              <div className="p-3 bg-[#F4F4F4] rounded-[4px]">
                <div className="font-medium text-[#171A20]">Karnataka (BESCOM)</div>
                <div className="text-[12px] text-[#5C5E62]">
                  Bengaluru Urban & Rural. Turnkey net-metering synchronization.
                </div>
              </div>
            </div>
            <div className="pt-2 flex flex-col gap-2">
              <Link
                to="/service-areas"
                onClick={() => setRegionModalOpen(false)}
                className="w-full h-10 rounded-[4px] border border-[#171A20] text-[#171A20] text-[13px] font-medium flex items-center justify-center hover:bg-[#F4F4F4] transition-colors"
              >
                View Full Jurisdictions &amp; Net-Metering Details
              </Link>
              <button
                type="button"
                onClick={() => {
                  setRegionModalOpen(false);
                  openConsultationDrawer();
                }}
                className="w-full h-10 rounded-[4px] bg-[#171A20] text-[#FFFFFF] text-[14px] font-medium hover:bg-[#171A20]/90 transition-colors"
              >
                Schedule Site Feasibility Check
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Full-Height Mobile Drawer */}
      <Dialog.Root open={menuOpen} onOpenChange={setMenuOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <Dialog.Content className="fixed inset-y-0 right-0 z-50 w-full sm:max-w-sm bg-[#FFFFFF] text-[#171A20] shadow-2xl flex flex-col justify-between p-6 sm:p-8 focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right duration-200">
            <div>
              <div className="flex items-center justify-between pb-8">
                <BrandLogo size="sm" asLink={false} />
                <Dialog.Close asChild>
                  <button
                    type="button"
                    className="p-1.5 rounded-[4px] text-[#5C5E62] hover:text-[#171A20] hover:bg-[#F4F4F4] transition-colors focus-visible:outline-none"
                    aria-label="Close navigation menu"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </Dialog.Close>
              </div>

              <nav className="flex flex-col space-y-4" aria-label="Menu Items">
                {NAV_ITEMS.map((item) => (
                  <Link
                    key={item.key}
                    to={item.to}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center justify-between text-[17px] font-medium tracking-tight text-[#171A20] hover:text-[#5C5E62] transition-colors py-1.5"
                  >
                    <span>{item.label}</span>
                    <ChevronRight className="w-4 h-4 text-[#5C5E62]/40" />
                  </Link>
                ))}
                <Link
                  to="/deploy"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-between text-[17px] font-medium tracking-tight text-[#171A20] hover:text-[#5C5E62] transition-colors py-1.5"
                >
                  <span>Design Studio</span>
                  <ChevronRight className="w-4 h-4 text-[#5C5E62]/40" />
                </Link>
                <Link
                  to="/technology"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-between text-[17px] font-medium tracking-tight text-[#171A20] hover:text-[#5C5E62] transition-colors py-1.5"
                >
                  <span>Solar Engineering</span>
                  <ChevronRight className="w-4 h-4 text-[#5C5E62]/40" />
                </Link>
                <Link
                  to="/warranty"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-between text-[17px] font-medium tracking-tight text-[#171A20] hover:text-[#5C5E62] transition-colors py-1.5"
                >
                  <span>Asset Warranty</span>
                  <ChevronRight className="w-4 h-4 text-[#5C5E62]/40" />
                </Link>
                <Link
                  to="/service-areas"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-between text-[17px] font-medium tracking-tight text-[#171A20] hover:text-[#5C5E62] transition-colors py-1.5"
                >
                  <span>Service Areas &amp; DISCOMs</span>
                  <ChevronRight className="w-4 h-4 text-[#5C5E62]/40" />
                </Link>
                <Link
                  to="/net-metering"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-between text-[17px] font-medium tracking-tight text-[#171A20] hover:text-[#5C5E62] transition-colors py-1.5"
                >
                  <span>DISCOM Net-Metering</span>
                  <ChevronRight className="w-4 h-4 text-[#5C5E62]/40" />
                </Link>
                <Link
                  to="/faq"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-between text-[17px] font-medium tracking-tight text-[#171A20] hover:text-[#5C5E62] transition-colors py-1.5"
                >
                  <span>Questions &amp; FAQ</span>
                  <ChevronRight className="w-4 h-4 text-[#5C5E62]/40" />
                </Link>
                <Link
                  to="/our-story"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-between text-[17px] font-medium tracking-tight text-[#171A20] hover:text-[#5C5E62] transition-colors py-1.5"
                >
                  <span>Our Story &amp; Ethos</span>
                  <ChevronRight className="w-4 h-4 text-[#5C5E62]/40" />
                </Link>
                <Link
                  to="/architects"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-between text-[17px] font-medium tracking-tight text-[#171A20] hover:text-[#5C5E62] transition-colors py-1.5"
                >
                  <span>Architectural Solar Specs</span>
                  <ChevronRight className="w-4 h-4 text-[#5C5E62]/40" />
                </Link>
              </nav>
            </div>

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
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
