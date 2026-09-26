import * as React from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Phone, MessageSquare, Globe, User, ChevronRight, ChevronLeft } from "lucide-react";
import { BRAND_CONFIG } from "@/config/brand";
import { BrandLogo } from "./BrandLogo";
import { MegaMenu, type MegaMenuCategory } from "./MegaMenu";
import { openConsultationDrawer } from "@/lib/consultation";
import { REGION_HUBS } from "@/routes/service-areas";

interface NavItem {
  key: Exclude<MegaMenuCategory, null>;
  label: string;
  to: string;
}

const NAV_ITEMS: NavItem[] = [
  { key: "solar", label: "Rooftop Solar", to: "/" },
  { key: "homes", label: "Homes", to: "/residential" },
  { key: "omnigrid", label: "Omnigrid", to: "/omnigrid" },
  { key: "commercial", label: "Commercial", to: "/enterprise" },
  { key: "discover", label: "Discover", to: "/deploy" },
];

interface MobileCategoryItem {
  title: string;
  description: string;
  to: string;
}

interface MobileCategory {
  id: string;
  label: string;
  items: MobileCategoryItem[];
  actions: {
    label: string;
    to: string;
  }[];
  primaryCta?: {
    label: string;
    to?: string;
    action?: () => void;
  };
}

const MOBILE_CATEGORIES: MobileCategory[] = [
  {
    id: "residential",
    label: "Residential Solar",
    items: [
      {
        title: "Low-Profile Solar Panels",
        description: "Flush coplanar architectural glass with zero frame exposure",
        to: "/residential",
      },
      {
        title: "Elevated Solar Pergola",
        description: "100% usable terrace living space with storm-certified steel",
        to: "/residential",
      },
      {
        title: "Independent Villa Solar",
        description: "Turnkey villa engineering with zero grid export leakage",
        to: "/residential",
      },
    ],
    actions: [
      { label: "Configure & Price (Studio)", to: "/deploy" },
      { label: "PM Surya Ghar ₹78,000 Subsidy Guide", to: "/legal/disclosures" },
      { label: "Zero Terrace Damage Guarantee", to: "/residential" },
      { label: "25-Year Linear Power Warranty", to: "/warranty" },
    ],
    primaryCta: {
      label: "Design Residential System",
      to: "/deploy",
    },
  },
  {
    id: "omnigrid",
    label: "Omnigrid Storage",
    items: [
      {
        title: "Omnigrid 14.3 kWh Pack",
        description: "Integrated prismatic LFP energy storage with 10,000 cycles",
        to: "/omnigrid",
      },
      {
        title: "Omnigrid Dual-Pack (28.6 kWh)",
        description: "Whole-home whole-night autonomy and EV charging",
        to: "/omnigrid",
      },
      {
        title: "Solid-State Gateway (<20ms)",
        description: "Instantaneous sub-cycle grid failure protection",
        to: "/omnigrid",
      },
    ],
    actions: [
      { label: "Blackout Duration Estimator", to: "/omnigrid" },
      { label: "Diesel Generator Replacement ROI", to: "/omnigrid" },
      { label: "LFP Chemistry & Safety Standards", to: "/omnigrid" },
    ],
    primaryCta: {
      label: "Configure Omnigrid Storage",
      to: "/deploy",
    },
  },
  {
    id: "commercial",
    label: "Commercial & Industrial",
    items: [
      {
        title: "Industrial Rooftop Arrays",
        description: "High-yield commercial MW-scale turnkey projects",
        to: "/enterprise",
      },
      {
        title: "Corporate Tech Campuses",
        description: "Architectural solar carports and high-efficiency BIPV",
        to: "/enterprise",
      },
      {
        title: "Manufacturing & Pharma",
        description: "Continuous clean energy with 99.9% uptime compliance",
        to: "/enterprise",
      },
    ],
    actions: [
      { label: "Section 34 40% Tax Depreciation", to: "/enterprise" },
      { label: "Commercial Yield Calculator", to: "/enterprise" },
      { label: "CAPEX vs OPEX / RESCO Models", to: "/enterprise" },
    ],
    primaryCta: {
      label: "Request Commercial Assessment",
      to: "/enterprise",
    },
  },
  {
    id: "technology",
    label: "Technology & Engineering",
    items: [
      {
        title: "Solar Engineering & Physics",
        description: "N-Type TOPCon cell architecture and bifacial yield metrics",
        to: "/technology",
      },
      {
        title: "Structural Wind Load Standards",
        description: "IS 875 Part 3 storm resistance up to 50 m/s (180 km/h)",
        to: "/technology",
      },
      {
        title: "Asset Warranty & Governance",
        description: "25-year linear power guarantee with Tier-1 bankability",
        to: "/warranty",
      },
      {
        title: "Architectural Solar Specs (CAD)",
        description: "Drawings and BIM specifications for architects and builders",
        to: "/architects",
      },
    ],
    actions: [
      { label: "Download Engineering Specs", to: "/technology" },
      { label: "Review Statutory Disclosures", to: "/legal/disclosures" },
    ],
    primaryCta: {
      label: "Speak with a Solar Engineer",
      action: () => openConsultationDrawer(),
    },
  },
  {
    id: "discover",
    label: "Discover & Resources",
    items: [
      {
        title: "Solar Sizing Studio",
        description: "Instant 3D rooftop geometry and financial model",
        to: "/deploy",
      },
      {
        title: "Service Areas & Jurisdictions",
        description: "Operational hubs across 7 premier Indian luxury states",
        to: "/service-areas",
      },
      {
        title: "DISCOM Net-Metering Guide",
        description: "Transformer allocations and bi-directional meter rules",
        to: "/net-metering",
      },
      {
        title: "Frequently Asked Questions (FAQ)",
        description: "Detailed answers on subsidies, equipment, and tariffs",
        to: "/faq",
      },
      {
        title: "Our Story & Ethos",
        description: "The philosophy of architectural energy independence",
        to: "/our-story",
      },
    ],
    actions: [
      { label: "Colophon & Case Study", to: "/about-this-project" },
      { label: "Schedule Feasibility Survey", to: "/service-areas" },
    ],
  },
];

export function Header() {
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [activeCategory, setActiveCategory] = React.useState<MegaMenuCategory>(null);
  const [regionModalOpen, setRegionModalOpen] = React.useState(false);
  const [activeMobileCategory, setActiveMobileCategory] = React.useState<string | null>(null);

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
    setActiveMobileCategory(null);
  }, [pathname]);

  React.useEffect(() => {
    function handleScroll() {
      setIsScrolled(window.scrollY > 40);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setActiveCategory(null);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
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

  const currentMobileCat = MOBILE_CATEGORIES.find((c) => c.id === activeMobileCategory);

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
        {/* Left: Brand Geometric Wordmark (Enlarged by +50% for commanding authority) */}
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
                onFocus={() => handleMouseEnter(item.key)}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
                    setActiveCategory(item.key);
                  } else if (e.key === "Escape") {
                    setActiveCategory(null);
                  }
                }}
                aria-expanded={isHovered}
                aria-haspopup="true"
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

        {/* Right: Clean Tesla-Style Utility Actions (Clutter stripped: No ? icon, No EN toggle) */}
        <div className="flex items-center space-x-1 sm:space-x-2">
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
            title="Solar Design Studio"
            aria-label="Solar Design Studio"
            className={`p-2 rounded-[4px] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current ${
              showSolidHeader ? "hover:bg-[#F4F4F4]" : "hover:bg-white/10"
            }`}
          >
            <User className="w-[18px] h-[18px]" />
          </Link>

          {/* Mobile Menu Trigger */}
          <button
            type="button"
            onClick={() => {
              setActiveMobileCategory(null);
              setMenuOpen(true);
            }}
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

      {/* Regional Grid Dialog (Expanded for all 7 Pan-India Luxury Hubs) */}
      <Dialog.Root open={regionModalOpen} onOpenChange={setRegionModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg bg-[#FFFFFF] text-[#171A20] rounded-[8px] p-6 sm:p-7 shadow-2xl focus:outline-none max-h-[90vh] flex flex-col justify-between">
            <div className="flex items-center justify-between pb-4 border-b border-[#E3E4E6]">
              <div>
                <Dialog.Title className="text-[17px] font-medium text-[#171A20]">
                  Active Solar Grid Jurisdictions
                </Dialog.Title>
                <p className="text-[12px] text-[#5C5E62] mt-0.5">
                  Select your state to view technical parameters and DISCOM net-metering.
                </p>
              </div>
              <Dialog.Close asChild>
                <button
                  type="button"
                  aria-label="Close region selector"
                  className="p-1 rounded-[4px] text-[#5C5E62] hover:text-[#171A20] hover:bg-[#F4F4F4] cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </Dialog.Close>
            </div>

            <div className="py-4 space-y-2 text-[14px] overflow-y-auto max-h-[380px] pr-1">
              {REGION_HUBS.map((hub) => (
                <Link
                  key={hub.id}
                  to="/service-areas"
                  search={{ state: hub.id }}
                  onClick={() => setRegionModalOpen(false)}
                  className="p-3 bg-[#F4F4F4] hover:bg-[#EAEAEA] transition-colors rounded-[4px] flex items-center justify-between block cursor-pointer group"
                >
                  <div>
                    <div className="font-semibold text-[#171A20] flex items-center gap-2">
                      <span>{hub.state}</span>
                      <span className="text-[11px] font-normal text-[#5C5E62] bg-white px-2 py-0.5 rounded-[3px] border border-[#E3E4E6]">
                        {hub.discoms[0].split("(")[0].trim()}
                      </span>
                    </div>
                    <div className="text-[12px] text-[#5C5E62] mt-1 line-clamp-1">
                      {hub.keyDistricts[0]} · {hub.irradiance}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#5C5E62] group-hover:translate-x-0.5 transition-transform" />
                </Link>
              ))}
            </div>

            <div className="pt-3 border-t border-[#E3E4E6] flex flex-col sm:flex-row gap-2.5">
              <Link
                to="/service-areas"
                onClick={() => setRegionModalOpen(false)}
                className="flex-1 h-10 rounded-[4px] border border-[#171A20] text-[#171A20] text-[13px] font-medium flex items-center justify-center hover:bg-[#F4F4F4] transition-colors"
              >
                View All Jurisdictions
              </Link>
              <button
                type="button"
                onClick={() => {
                  setRegionModalOpen(false);
                  openConsultationDrawer();
                }}
                className="flex-1 h-10 rounded-[4px] bg-[#171A20] text-[#FFFFFF] text-[13px] font-medium hover:bg-[#171A20]/90 transition-colors cursor-pointer"
              >
                Schedule Feasibility Check
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Tesla-Grade Drill-Down Mobile Navigation Drawer */}
      <Dialog.Root open={menuOpen} onOpenChange={setMenuOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <Dialog.Content className="fixed inset-y-0 right-0 z-50 w-full sm:max-w-md bg-[#FFFFFF] text-[#171A20] shadow-2xl flex flex-col justify-between p-6 sm:p-8 focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right duration-200 overflow-y-auto">
            {activeMobileCategory === null ? (
              /* ================= LEVEL 0: ROOT MAIN CATEGORIES (Tesla DNA) ================= */
              <div className="flex flex-col h-full justify-between">
                <div>
                  {/* Top Bar: Brand Logo & Close X (Clean, No Divider Lines) */}
                  <div className="flex items-center justify-between pb-6">
                    <BrandLogo size="md" asLink={false} />
                    <Dialog.Close asChild>
                      <button
                        type="button"
                        className="p-2 -mr-2 rounded-full text-[#171A20] hover:bg-[#F4F4F4] transition-colors focus-visible:outline-none cursor-pointer"
                        aria-label="Close navigation menu"
                      >
                        <X className="w-5 h-5 stroke-[1.75]" />
                      </button>
                    </Dialog.Close>
                  </div>

                  {/* Level 0: Main Categories (Pure Tesla DNA: Zero dividing borders, unified typography, generous touch targets) */}
                  <nav className="flex flex-col space-y-1 pt-1" aria-label="Mobile Navigation">
                    {MOBILE_CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setActiveMobileCategory(cat.id)}
                        className="w-full flex items-center justify-between py-3.5 px-3 rounded-[6px] text-[17px] font-medium tracking-tight text-[#171A20] hover:text-[#5C5E62] hover:bg-[#F4F4F4]/70 transition-colors cursor-pointer group text-left"
                      >
                        <span>{cat.label}</span>
                        <ChevronRight className="w-4 h-4 text-[#171A20]/60 group-hover:translate-x-0.5 group-hover:text-[#171A20] transition-all stroke-[1.75]" />
                      </button>
                    ))}

                    {/* Secondary Direct Utility Links (Unified Font Size, Weight, and Padding with Zero Dividing Lines) */}
                    <Link
                      to="/deploy"
                      onClick={() => setMenuOpen(false)}
                      className="py-3.5 px-3 rounded-[6px] text-[17px] font-medium tracking-tight text-[#171A20] hover:text-[#5C5E62] hover:bg-[#F4F4F4]/70 transition-colors block text-left"
                    >
                      Solar Sizing Studio
                    </Link>
                    <Link
                      to="/service-areas"
                      onClick={() => setMenuOpen(false)}
                      className="py-3.5 px-3 rounded-[6px] text-[17px] font-medium tracking-tight text-[#171A20] hover:text-[#5C5E62] hover:bg-[#F4F4F4]/70 transition-colors block text-left"
                    >
                      Service Areas &amp; Jurisdictions
                    </Link>
                    <Link
                      to="/warranty"
                      onClick={() => setMenuOpen(false)}
                      className="py-3.5 px-3 rounded-[6px] text-[17px] font-medium tracking-tight text-[#171A20] hover:text-[#5C5E62] hover:bg-[#F4F4F4]/70 transition-colors block text-left"
                    >
                      25-Year Linear Power Warranty
                    </Link>
                    <Link
                      to="/our-story"
                      onClick={() => setMenuOpen(false)}
                      className="py-3.5 px-3 rounded-[6px] text-[17px] font-medium tracking-tight text-[#171A20] hover:text-[#5C5E62] hover:bg-[#F4F4F4]/70 transition-colors block text-left"
                    >
                      Our Story &amp; Ethos
                    </Link>
                  </nav>
                </div>

                {/* Bottom Dock: Action Button and Refined Contact Touchpoints (Zero Globe / Zero Language Box) */}
                <div className="pt-6 mt-6 space-y-4">
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      openConsultationDrawer();
                    }}
                    className="w-full h-11 px-6 rounded-[4px] bg-[#171A20] text-[#FFFFFF] text-[14px] font-medium hover:bg-[#000000] active:scale-[0.99] transition-all flex items-center justify-center cursor-pointer shadow-sm"
                  >
                    Schedule Consultation
                  </button>

                  <div className="flex items-center justify-center gap-4 text-[13px] text-[#5C5E62] pt-1">
                    <a
                      href={`tel:${BRAND_CONFIG.contact.phone.dial}`}
                      className="flex items-center gap-1.5 hover:text-[#171A20] transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5 text-[#F57C00]" />
                      <span>{BRAND_CONFIG.contact.phone.display}</span>
                    </a>
                    <span>·</span>
                    <a
                      href={BRAND_CONFIG.contact.whatsapp.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 hover:text-[#171A20] transition-colors"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-[#F57C00]" />
                      <span>WhatsApp</span>
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              /* ================= LEVEL 1: DRILL-DOWN SUB-VIEW ================= */
              <div className="flex flex-col h-full justify-between">
                <div>
                  {/* Top Bar: Back Button & Close X */}
                  <div className="flex items-center justify-between pb-6">
                    <button
                      type="button"
                      onClick={() => setActiveMobileCategory(null)}
                      className="inline-flex items-center gap-1.5 text-[15px] font-medium text-[#171A20] hover:text-[#5C5E62] transition-colors cursor-pointer py-1 -ml-1"
                    >
                      <ChevronLeft className="w-5 h-5 stroke-[1.75]" />
                      <span>Back</span>
                    </button>
                    <Dialog.Close asChild>
                      <button
                        type="button"
                        className="p-2 -mr-2 rounded-full text-[#171A20] hover:bg-[#F4F4F4] transition-colors focus-visible:outline-none cursor-pointer"
                        aria-label="Close navigation menu"
                      >
                        <X className="w-5 h-5 stroke-[1.75]" />
                      </button>
                    </Dialog.Close>
                  </div>

                  {/* Sub-Category Title */}
                  <div className="pt-2 pb-3">
                    <h3 className="text-[22px] font-medium tracking-tight text-[#171A20]">
                      {currentMobileCat?.label}
                    </h3>
                  </div>

                  {/* Sub-Category Product Offerings (Clean Minimalist Cards) */}
                  <div className="space-y-1 py-1">
                    {currentMobileCat?.items.map((item, idx) => (
                      <Link
                        key={idx}
                        to={item.to}
                        onClick={() => {
                          setMenuOpen(false);
                          setActiveMobileCategory(null);
                        }}
                        className="py-3 px-3 rounded-[6px] hover:bg-[#F4F4F4] transition-colors block group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[16px] font-medium text-[#171A20] group-hover:text-[#000000]">
                            {item.title}
                          </span>
                          <ChevronRight className="w-4 h-4 text-[#171A20]/50 group-hover:translate-x-0.5 group-hover:text-[#171A20] transition-all stroke-[1.75]" />
                        </div>
                        <p className="text-[13px] text-[#5C5E62] mt-0.5 leading-snug">
                          {item.description}
                        </p>
                      </Link>
                    ))}
                  </div>

                  {/* Sub-Category Quick Links */}
                  {currentMobileCat?.actions && currentMobileCat.actions.length > 0 && (
                    <div className="pt-4 mt-3 space-y-1">
                      <span className="text-[11px] font-semibold text-[#5C5E62] uppercase tracking-wider block px-3 pb-1">
                        Specifications &amp; Guides
                      </span>
                      {currentMobileCat.actions.map((act, idx) => (
                        <Link
                          key={idx}
                          to={act.to}
                          onClick={() => {
                            setMenuOpen(false);
                            setActiveMobileCategory(null);
                          }}
                          className="text-[14px] font-medium text-[#171A20] hover:text-[#5C5E62] py-2 px-3 rounded-[6px] hover:bg-[#F4F4F4] transition-colors flex items-center justify-between"
                        >
                          <span>{act.label}</span>
                          <ChevronRight className="w-3.5 h-3.5 text-[#171A20]/40 stroke-[1.75]" />
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                {/* Sub-view Bottom CTA */}
                <div className="pt-6 mt-6 space-y-2.5">
                  {currentMobileCat?.primaryCta && (
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        setActiveMobileCategory(null);
                        if (currentMobileCat.primaryCta?.action) {
                          currentMobileCat.primaryCta.action();
                        } else if (currentMobileCat.primaryCta?.to) {
                          window.location.href = currentMobileCat.primaryCta.to;
                        }
                      }}
                      className="w-full h-11 px-6 rounded-[4px] bg-[#171A20] text-[#FFFFFF] text-[14px] font-medium hover:bg-[#000000] active:scale-[0.99] transition-all flex items-center justify-center cursor-pointer shadow-sm"
                    >
                      {currentMobileCat.primaryCta.label}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setActiveMobileCategory(null)}
                    className="w-full h-9 rounded-[4px] border border-[#E3E4E6] text-[#5C5E62] text-[12px] font-medium hover:bg-[#F4F4F4] transition-colors flex items-center justify-center cursor-pointer"
                  >
                    ← Back to All Products
                  </button>
                </div>
              </div>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
