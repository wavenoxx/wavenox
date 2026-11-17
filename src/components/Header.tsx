import * as React from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Phone, MessageSquare, Globe, ChevronRight, ChevronLeft } from "lucide-react";
import { BRAND_CONFIG } from "@/config/brand";
import { BrandLogo } from "./BrandLogo";
import { MegaMenu, type MegaMenuCategory } from "./MegaMenu";
import { openConsultationDrawer } from "@/lib/consultation";
import { REGION_HUBS } from "@/routes/service-areas";

type NavItemKey = Exclude<MegaMenuCategory, null> | "studio";

interface NavItem {
  key: NavItemKey;
  label: string;
  to: string;
  hasMenu: boolean;
}

const HEADER_NAV_ITEMS: NavItem[] = [
  { key: "solar", label: "Solar Panels", to: "/residential", hasMenu: true },
  { key: "omnigrid", label: "Solar + Storage", to: "/omnigrid", hasMenu: true },
  { key: "commercial", label: "Commercial", to: "/enterprise", hasMenu: true },
  { key: "studio", label: "Design Studio", to: "/deploy", hasMenu: false },
  { key: "discover", label: "Discover", to: "/our-story", hasMenu: true },
];

export interface MobileCategoryItem {
  title: string;
  description: string;
  to: string;
  hash?: string;
}

export interface MobileCategoryAction {
  label: string;
  to: string;
  hash?: string;
}

export interface MobileCategory {
  id: string;
  label: string;
  items: MobileCategoryItem[];
  actions: MobileCategoryAction[];
  primaryCta?: {
    label: string;
    to?: string;
    action?: () => void;
  };
}

const MOBILE_CATEGORIES: MobileCategory[] = [
  {
    id: "solar",
    label: "Solar Panels",
    items: [
      {
        title: "Residential Rooftop Solar",
        description: "Independent homes, villas & row houses",
        to: "/residential",
      },
      {
        title: "Elevated Terrace Pergola",
        description: "Walkable shaded rooftop living space",
        to: "/residential",
        hash: "terrace-design",
      },
      {
        title: "Severe Weather Engineering",
        description: "Monsoon sealing & 158 km/h wind rating",
        to: "/residential",
        hash: "home-resilience",
      },
    ],
    actions: [
      { label: "Get Solar Estimate", to: "/deploy" },
      { label: "Subsidy & Net-Metering Guide", to: "/net-metering" },
      { label: "25-Year Warranty Coverage", to: "/warranty" },
    ],
    primaryCta: {
      label: "Open Solar Design Studio",
      to: "/deploy",
    },
  },
  {
    id: "omnigrid",
    label: "Solar + Storage",
    items: [
      {
        title: "Omnigrid Home Storage",
        description: "14.3 kWh to 28.6 kWh modular LFP battery",
        to: "/omnigrid",
      },
      {
        title: "Automatic Outage Switchover",
        description: "Sub-20ms backup when grid power drops",
        to: "/omnigrid",
        hash: "outage-defense",
      },
      {
        title: "Solar After Sunset",
        description: "Run evening ACs & home loads on stored solar",
        to: "/omnigrid",
        hash: "sunset-power",
      },
    ],
    actions: [
      { label: "Backup Duration Estimator", to: "/omnigrid", hash: "estimator" },
      { label: "24-Hour Energy Flow", to: "/omnigrid", hash: "flow-simulation" },
      { label: "10-Year Battery Warranty", to: "/warranty" },
    ],
    primaryCta: {
      label: "Configure Solar + Storage",
      to: "/deploy",
    },
  },
  {
    id: "commercial",
    label: "Commercial",
    items: [
      {
        title: "Commercial & Industrial Solar",
        description: "Manufacturing, logistics & cold storage",
        to: "/enterprise",
      },
      {
        title: "Daytime Tariff Reduction",
        description: "Offset peak daytime kVAh billing",
        to: "/enterprise",
        hash: "operating-costs",
      },
      {
        title: "Commercial Yield & Tax Calculator",
        description: "Accelerated depreciation & payback modeling",
        to: "/enterprise",
        hash: "calculator",
      },
      {
        title: "Campus & Enterprise Assessment",
        description: "Custom structural & grid feasibility",
        to: "/enterprise",
        hash: "assessment",
      },
    ],
    actions: [
      { label: "Interactive Sizing Studio", to: "/deploy" },
      { label: "For Architects & Builders", to: "/architects" },
      { label: "DISCOM Grid Approvals", to: "/net-metering" },
    ],
    primaryCta: {
      label: "Talk to a Commercial Advisor",
      action: () => openConsultationDrawer("commercial"),
    },
  },
  {
    id: "discover",
    label: "Discover",
    items: [
      {
        title: "Solar Engineering Standards",
        description: "N-Type TOPCon cells & LFP battery architecture",
        to: "/technology",
      },
      {
        title: "Net-Metering & Subsidies",
        description: "PM Surya Ghar & state DISCOM approvals",
        to: "/net-metering",
      },
      {
        title: "25-Year Warranty Coverage",
        description: "Performance, hardware & workmanship terms",
        to: "/warranty",
      },
      {
        title: "Service Areas & Priority Hubs",
        description: "Active consultation & DISCOM jurisdictions",
        to: "/service-areas",
      },
      {
        title: "For Architects & Builders",
        description: "Structural load tables & CAD/BIM details",
        to: "/architects",
      },
      {
        title: "Our Story & Delivery Model",
        description: "Direct engineering without subcontractor handoffs",
        to: "/our-story",
      },
    ],
    actions: [
      { label: "Frequently Asked Questions", to: "/faq" },
      { label: "Calculation Methodology", to: "/legal/disclosures" },
      { label: "Engineering Case Study", to: "/about-this-project" },
    ],
    primaryCta: {
      label: "Talk to a Solar Advisor",
      action: () => openConsultationDrawer(),
    },
  },
];

export function Header() {
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [activeCategory, setActiveCategory] = React.useState<MegaMenuCategory>(null);
  const [regionModalOpen, setRegionModalOpen] = React.useState(false);
  const [activeMobileCategory, setActiveMobileCategory] = React.useState<string | null>(null);

  const closeTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const navLinkRefs = React.useRef<Record<string, HTMLAnchorElement | null>>({});
  const mobileBackBtnRef = React.useRef<HTMLButtonElement | null>(null);
  const mobileCatBtnRefs = React.useRef<Record<string, HTMLButtonElement | null>>({});
  const navigate = useNavigate();

  const routerState = useRouterState();
  const pathname = routerState.location.pathname;

  const currentMatch = routerState.matches[routerState.matches.length - 1];
  const headerTone =
    (currentMatch?.staticData as { headerTone?: "overlay" | "solid" } | undefined)?.headerTone ??
    "solid";

  const clearCloseTimer = React.useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const closeMegaMenuAndRestoreFocus = React.useCallback(() => {
    clearCloseTimer();
    const prevCategory = activeCategory;
    setActiveCategory(null);
    if (prevCategory) {
      const activeEl = document.activeElement;
      const megaMenuEl = document.getElementById("wavenox-megamenu");
      if (megaMenuEl && activeEl && megaMenuEl.contains(activeEl)) {
        requestAnimationFrame(() => {
          navLinkRefs.current[prevCategory]?.focus();
        });
      }
    }
  }, [activeCategory, clearCloseTimer]);

  // Auto-close menus on route navigation
  React.useEffect(() => {
    clearCloseTimer();
    setActiveCategory(null);
    setMenuOpen(false);
    setActiveMobileCategory(null);
  }, [pathname, clearCloseTimer]);

  React.useEffect(() => {
    function handleScroll() {
      setIsScrolled(window.scrollY > 40);
    }
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close MegaMenu on Escape or when viewport narrows below desktop breakpoint (1024px)
  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && activeCategory !== null) {
        closeMegaMenuAndRestoreFocus();
      }
    }
    function handleResize() {
      if (window.innerWidth < 1024) {
        setActiveCategory(null);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", handleResize, { passive: true });
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleResize);
    };
  }, [activeCategory, closeMegaMenuAndRestoreFocus]);

  React.useEffect(() => () => clearCloseTimer(), [clearCloseTimer]);

  const handleCategoryEnter = (key: Exclude<MegaMenuCategory, null>) => {
    clearCloseTimer();
    setActiveCategory(key);
  };

  const handleDirectLinkEnter = () => {
    clearCloseTimer();
    setActiveCategory(null);
  };

  const handleMouseLeave = () => {
    clearCloseTimer();
    closeTimerRef.current = setTimeout(() => {
      setActiveCategory(null);
    }, 150);
  };

  const openMobileSubCategory = (catId: string) => {
    setActiveMobileCategory(catId);
    requestAnimationFrame(() => {
      mobileBackBtnRef.current?.focus();
    });
  };

  const closeMobileSubCategory = () => {
    const prevId = activeMobileCategory;
    setActiveMobileCategory(null);
    if (prevId) {
      requestAnimationFrame(() => {
        mobileCatBtnRefs.current[prevId]?.focus();
      });
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
        className={`fixed top-0 left-0 right-0 h-14 z-50 transition-colors duration-200 flex items-center justify-between px-5 sm:px-6 lg:px-8 xl:px-10 ${
          showSolidHeader
            ? "bg-[#FFFFFF]/95 backdrop-blur-md text-[#171A20] border-b border-[#E3E4E6]"
            : "bg-transparent text-[#FFFFFF]"
        }`}
      >
        {/* Left: Brand Wordmark */}
        <div className="flex items-center shrink-0">
          <BrandLogo size="md" className={showSolidHeader ? "text-[#171A20]" : "text-[#FFFFFF]"} />
        </div>

        {/* Center: 5-Item Desktop Navigation Rail (1024px+) */}
        <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1" aria-label="Main Navigation">
          {HEADER_NAV_ITEMS.map((item) => {
            const isHovered = item.hasMenu && activeCategory === item.key;
            const isCurrentRoute = pathname === item.to;
            return (
              <Link
                key={item.key}
                ref={(el) => {
                  navLinkRefs.current[item.key] = el;
                }}
                to={item.to}
                aria-current={isCurrentRoute ? "page" : undefined}
                aria-expanded={item.hasMenu ? isHovered : undefined}
                aria-controls={item.hasMenu && isHovered ? "wavenox-megamenu" : undefined}
                onMouseEnter={() => {
                  if (item.hasMenu) {
                    handleCategoryEnter(item.key as Exclude<MegaMenuCategory, null>);
                  } else {
                    handleDirectLinkEnter();
                  }
                }}
                onFocus={() => {
                  if (!item.hasMenu) {
                    handleDirectLinkEnter();
                  } else if (activeCategory !== null && activeCategory !== item.key) {
                    setActiveCategory(null);
                  }
                }}
                onClick={() => {
                  clearCloseTimer();
                  setActiveCategory(null);
                }}
                onKeyDown={(e) => {
                  if (item.hasMenu && e.key === "ArrowDown") {
                    e.preventDefault();
                    clearCloseTimer();
                    setActiveCategory(item.key as Exclude<MegaMenuCategory, null>);
                    requestAnimationFrame(() => {
                      const firstInteractive = document.querySelector<HTMLElement>(
                        "#wavenox-megamenu a, #wavenox-megamenu button",
                      );
                      firstInteractive?.focus();
                    });
                  } else if (e.key === "Escape" && activeCategory !== null) {
                    e.preventDefault();
                    closeMegaMenuAndRestoreFocus();
                  }
                }}
                className={`relative whitespace-nowrap px-3 xl:px-3.5 py-1.5 rounded-[4px] text-[14px] font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current ${
                  isHovered
                    ? "bg-[#F4F4F4] text-[#171A20]"
                    : showSolidHeader
                      ? isCurrentRoute
                        ? "bg-[#F4F4F4]/80 text-[#171A20]"
                        : "hover:bg-[#F4F4F4] text-[#171A20]"
                      : isCurrentRoute
                        ? "bg-white/15 text-[#FFFFFF]"
                        : "hover:bg-white/10 text-[#FFFFFF]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right: Desktop Utilities & Advisor Action / Mobile Menu Trigger */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Desktop Region / DISCOM Selector (1024px+) */}
          <button
            type="button"
            onClick={() => {
              setActiveCategory(null);
              setRegionModalOpen(true);
            }}
            title="Supported States & DISCOMs"
            aria-label="Supported States and DISCOMs"
            className={`hidden lg:inline-flex items-center justify-center p-2 rounded-[4px] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current ${
              showSolidHeader ? "hover:bg-[#F4F4F4]" : "hover:bg-white/10"
            }`}
          >
            <Globe className="w-[18px] h-[18px]" />
          </button>

          {/* Desktop Primary Consultation Action (1024px+) */}
          <button
            type="button"
            onClick={() => {
              setActiveCategory(null);
              openConsultationDrawer();
            }}
            className={`hidden lg:inline-flex items-center justify-center whitespace-nowrap h-8 px-3.5 rounded-[4px] text-[13px] font-medium transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current ${
              showSolidHeader
                ? "bg-[#171A20] text-[#FFFFFF] hover:bg-[#2C3038]"
                : "bg-white/15 border border-white/30 text-[#FFFFFF] backdrop-blur-xs hover:bg-white/25"
            }`}
          >
            Talk to Advisor
          </button>

          {/* Mobile & Tablet Menu Trigger (<1024px) */}
          <button
            type="button"
            onClick={() => {
              setActiveMobileCategory(null);
              setMenuOpen(true);
            }}
            aria-label="Open navigation menu"
            className={`lg:hidden min-h-[44px] px-3.5 py-1.5 rounded-[4px] text-[13px] font-medium transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current ${
              showSolidHeader
                ? "bg-[#F4F4F4] text-[#171A20] hover:bg-[#EAEAEA]"
                : "bg-white/15 text-[#FFFFFF] backdrop-blur-xs hover:bg-white/25"
            }`}
          >
            Menu
          </button>
        </div>
      </header>

      {/* Full-Width Desktop MegaMenu Flyout */}
      <MegaMenu
        activeCategory={activeCategory}
        onClose={closeMegaMenuAndRestoreFocus}
        onMouseEnter={clearCloseTimer}
        onMouseLeave={handleMouseLeave}
      />

      {/* Regional Grid Dialog */}
      <Dialog.Root open={regionModalOpen} onOpenChange={setRegionModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[calc(100%-2rem)] max-w-lg bg-[#FFFFFF] text-[#171A20] rounded-[8px] p-6 sm:p-7 shadow-2xl focus:outline-none max-h-[90vh] flex flex-col justify-between">
            <div className="flex items-center justify-between pb-4 border-b border-[#E3E4E6]">
              <div>
                <Dialog.Title className="text-[17px] font-medium text-[#171A20]">
                  Active Solar Grid Jurisdictions
                </Dialog.Title>
                <Dialog.Description className="text-[12px] text-[#5C5E62] mt-0.5">
                  Select your state to view technical parameters and DISCOM net-metering.
                </Dialog.Description>
              </div>
              <Dialog.Close asChild>
                <button
                  type="button"
                  aria-label="Close region selector"
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-[4px] text-[#5C5E62] hover:text-[#171A20] hover:bg-[#F4F4F4] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#171A20]"
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
                  className="p-3 bg-[#F4F4F4] hover:bg-[#EAEAEA] transition-colors rounded-[4px] flex items-center justify-between cursor-pointer group focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#171A20]"
                >
                  <div>
                    <div className="font-semibold text-[#171A20] flex items-center gap-2 flex-wrap">
                      <span>{hub.state}</span>
                      <span className="text-[12px] font-normal text-[#5C5E62] bg-white px-2 py-0.5 rounded-[3px] border border-[#E3E4E6]">
                        {hub.discoms[0].split("(")[0].trim()}
                      </span>
                    </div>
                    <div className="text-[12px] text-[#5C5E62] mt-1 line-clamp-1">
                      {hub.keyDistricts[0]} · {hub.irradiance}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#5C5E62] shrink-0 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              ))}
            </div>

            <div className="pt-3 border-t border-[#E3E4E6] flex flex-col sm:flex-row gap-2.5">
              <Link
                to="/service-areas"
                onClick={() => setRegionModalOpen(false)}
                className="flex-1 h-11 rounded-[4px] border border-[#171A20] text-[#171A20] text-[13px] font-medium flex items-center justify-center hover:bg-[#F4F4F4] transition-colors"
              >
                View All Jurisdictions
              </Link>
              <button
                type="button"
                onClick={() => {
                  setRegionModalOpen(false);
                  openConsultationDrawer();
                }}
                className="flex-1 h-11 rounded-[4px] bg-[#171A20] text-[#FFFFFF] text-[13px] font-medium hover:bg-[#171A20]/90 transition-colors cursor-pointer"
              >
                Request Consultation
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Mobile & Tablet Navigation Drawer (<1024px) */}
      <Dialog.Root open={menuOpen} onOpenChange={setMenuOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <Dialog.Content className="fixed inset-y-0 right-0 z-50 w-full sm:max-w-md bg-[#FFFFFF] text-[#171A20] shadow-2xl flex flex-col justify-between p-6 sm:p-8 focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right duration-200 overflow-y-auto">
            <Dialog.Title className="sr-only">WAVENOX Navigation Menu</Dialog.Title>
            <Dialog.Description className="sr-only">
              Explore residential solar panels, battery storage, commercial solar, and the solar
              design studio.
            </Dialog.Description>

            {activeMobileCategory === null ? (
              /* ================= LEVEL 0: ROOT MAIN CATEGORIES ================= */
              <div className="flex flex-col h-full justify-between">
                <div>
                  {/* Top Bar: Brand Logo & Close X */}
                  <div className="flex items-center justify-between pb-5">
                    <BrandLogo size="md" asLink={false} />
                    <Dialog.Close asChild>
                      <button
                        type="button"
                        className="min-w-[44px] min-h-[44px] -mr-2 flex items-center justify-center rounded-full text-[#171A20] hover:bg-[#F4F4F4] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#171A20] cursor-pointer"
                        aria-label="Close navigation menu"
                      >
                        <X className="w-5 h-5 stroke-[1.75]" />
                      </button>
                    </Dialog.Close>
                  </div>

                  {/* Level 0: Aligned 5-Item Family Hierarchy + Key Utilities */}
                  <nav className="flex flex-col space-y-1 pt-1" aria-label="Mobile Navigation">
                    {MOBILE_CATEGORIES.slice(0, 3).map((cat) => (
                      <button
                        key={cat.id}
                        ref={(el) => {
                          mobileCatBtnRefs.current[cat.id] = el;
                        }}
                        type="button"
                        onClick={() => openMobileSubCategory(cat.id)}
                        className="w-full min-h-[52px] flex items-center justify-between py-3 px-3 rounded-[6px] text-[17px] font-medium tracking-tight text-[#171A20] hover:bg-[#F4F4F4]/80 transition-colors cursor-pointer group text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#171A20]"
                      >
                        <span>{cat.label}</span>
                        <ChevronRight className="w-4 h-4 text-[#171A20]/60 group-hover:translate-x-0.5 group-hover:text-[#171A20] transition-all stroke-[1.75]" />
                      </button>
                    ))}

                    <Link
                      to="/deploy"
                      onClick={() => setMenuOpen(false)}
                      className="min-h-[52px] py-3 px-3 rounded-[6px] text-[17px] font-medium tracking-tight text-[#171A20] hover:bg-[#F4F4F4]/80 transition-colors flex items-center justify-between text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#171A20]"
                    >
                      <span>Design Studio</span>
                      <span className="text-[12px] font-normal text-[#5C5E62]">Estimate</span>
                    </Link>

                    {MOBILE_CATEGORIES.slice(3).map((cat) => (
                      <button
                        key={cat.id}
                        ref={(el) => {
                          mobileCatBtnRefs.current[cat.id] = el;
                        }}
                        type="button"
                        onClick={() => openMobileSubCategory(cat.id)}
                        className="w-full min-h-[52px] flex items-center justify-between py-3 px-3 rounded-[6px] text-[17px] font-medium tracking-tight text-[#171A20] hover:bg-[#F4F4F4]/80 transition-colors cursor-pointer group text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#171A20]"
                      >
                        <span>{cat.label}</span>
                        <ChevronRight className="w-4 h-4 text-[#171A20]/60 group-hover:translate-x-0.5 group-hover:text-[#171A20] transition-all stroke-[1.75]" />
                      </button>
                    ))}

                    {/* Secondary Utility Links */}
                    <div className="pt-3 mt-2 border-t border-[#E3E4E6] space-y-1">
                      <Link
                        to="/service-areas"
                        onClick={() => setMenuOpen(false)}
                        className="min-h-[44px] py-2.5 px-3 rounded-[6px] text-[15px] font-medium text-[#171A20] hover:bg-[#F4F4F4]/80 transition-colors flex items-center justify-between text-left"
                      >
                        <span>Service Areas &amp; Hubs</span>
                      </Link>
                      <Link
                        to="/faq"
                        onClick={() => setMenuOpen(false)}
                        className="min-h-[44px] py-2.5 px-3 rounded-[6px] text-[15px] font-medium text-[#171A20] hover:bg-[#F4F4F4]/80 transition-colors flex items-center justify-between text-left"
                      >
                        <span>Frequently Asked Questions</span>
                      </Link>
                      <Link
                        to="/about-this-project"
                        onClick={() => setMenuOpen(false)}
                        className="min-h-[44px] py-2.5 px-3 rounded-[6px] text-[15px] font-medium text-[#171A20] hover:bg-[#F4F4F4]/80 transition-colors flex items-center justify-between text-left"
                      >
                        <span>Engineering Case Study</span>
                      </Link>
                    </div>
                  </nav>
                </div>

                {/* Bottom Dock: Jurisdiction Trigger + Primary Actions */}
                <div className="pt-5 mt-5 space-y-3 border-t border-[#E3E4E6]">
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      setRegionModalOpen(true);
                    }}
                    className="w-full min-h-[44px] px-3 py-2 rounded-[6px] bg-[#F4F4F4] hover:bg-[#EAEAEA] transition-colors flex items-center justify-between text-left cursor-pointer"
                  >
                    <span className="flex items-center gap-2.5 text-[13px] font-medium text-[#171A20]">
                      <Globe className="w-4 h-4 text-[#5C5E62]" />
                      <span>India (EN) · Active DISCOMs</span>
                    </span>
                    <ChevronRight className="w-4 h-4 text-[#5C5E62]" />
                  </button>

                  <Link
                    to="/deploy"
                    onClick={() => setMenuOpen(false)}
                    className="w-full h-11 px-6 rounded-[4px] bg-[#171A20] text-[#FFFFFF] text-[14px] font-medium hover:bg-[#000000] active:scale-[0.99] transition-all flex items-center justify-center cursor-pointer shadow-xs"
                  >
                    Open Design Studio
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      openConsultationDrawer();
                    }}
                    className="w-full h-11 px-6 rounded-[4px] bg-[#F4F4F4] border border-[#E3E4E6] text-[#171A20] text-[14px] font-medium hover:bg-[#EAEAEA] active:scale-[0.99] transition-all flex items-center justify-center cursor-pointer"
                  >
                    Talk to a Solar Advisor
                  </button>

                  <div className="flex items-center justify-center gap-4 text-[13px] text-[#5C5E62] pt-1">
                    <a
                      href={`tel:${BRAND_CONFIG.contact.phone.dial}`}
                      className="flex items-center gap-1.5 hover:text-[#171A20] transition-colors py-1"
                    >
                      <Phone className="w-3.5 h-3.5 text-[#F57C00]" />
                      <span>{BRAND_CONFIG.contact.phone.display}</span>
                    </a>
                    <span>·</span>
                    <a
                      href={BRAND_CONFIG.contact.whatsapp.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 hover:text-[#171A20] transition-colors py-1"
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
                  <div className="flex items-center justify-between pb-5">
                    <button
                      ref={mobileBackBtnRef}
                      type="button"
                      onClick={closeMobileSubCategory}
                      className="inline-flex items-center gap-1.5 min-h-[44px] text-[15px] font-medium text-[#171A20] hover:text-[#5C5E62] transition-colors cursor-pointer py-1.5 px-2 -ml-2 rounded-[4px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#171A20]"
                    >
                      <ChevronLeft className="w-5 h-5 stroke-[1.75]" />
                      <span>Back</span>
                    </button>
                    <Dialog.Close asChild>
                      <button
                        type="button"
                        className="min-w-[44px] min-h-[44px] -mr-2 flex items-center justify-center rounded-full text-[#171A20] hover:bg-[#F4F4F4] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#171A20] cursor-pointer"
                        aria-label="Close navigation menu"
                      >
                        <X className="w-5 h-5 stroke-[1.75]" />
                      </button>
                    </Dialog.Close>
                  </div>

                  {/* Sub-Category Title */}
                  <div className="pt-1 pb-3">
                    <h3 className="text-[22px] font-medium tracking-tight text-[#171A20]">
                      {currentMobileCat?.label}
                    </h3>
                  </div>

                  {/* Sub-Category Distinct Destinations */}
                  <div className="space-y-1 py-1">
                    {currentMobileCat?.items.map((item) => (
                      <Link
                        key={`${item.to}#${item.hash || ""}-${item.title}`}
                        to={item.to}
                        hash={item.hash}
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

                  {/* Sub-Category Quick Actions */}
                  {currentMobileCat?.actions && currentMobileCat.actions.length > 0 && (
                    <div className="pt-4 mt-3 space-y-1 border-t border-[#E3E4E6]">
                      <span className="text-[12px] font-semibold text-[#5C5E62] uppercase tracking-wider block px-3 pb-1">
                        Guides &amp; Support
                      </span>
                      {currentMobileCat.actions.map((act) => (
                        <Link
                          key={`${act.to}#${act.hash || ""}-${act.label}`}
                          to={act.to}
                          hash={act.hash}
                          onClick={() => {
                            setMenuOpen(false);
                            setActiveMobileCategory(null);
                          }}
                          className="min-h-[44px] text-[14px] font-medium text-[#171A20] hover:text-[#5C5E62] py-2.5 px-3 rounded-[6px] hover:bg-[#F4F4F4] transition-colors flex items-center justify-between"
                        >
                          <span>{act.label}</span>
                          <ChevronRight className="w-3.5 h-3.5 text-[#171A20]/40 stroke-[1.75]" />
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                {/* Sub-view Bottom CTA */}
                <div className="pt-5 mt-5 space-y-2.5 border-t border-[#E3E4E6]">
                  {currentMobileCat?.primaryCta && (
                    <button
                      type="button"
                      onClick={() => {
                        const targetTo = currentMobileCat.primaryCta?.to;
                        const targetAction = currentMobileCat.primaryCta?.action;
                        setMenuOpen(false);
                        setActiveMobileCategory(null);
                        if (targetAction) {
                          targetAction();
                        } else if (targetTo) {
                          navigate({ to: targetTo });
                        }
                      }}
                      className="w-full h-11 px-6 rounded-[4px] bg-[#171A20] text-[#FFFFFF] text-[14px] font-medium hover:bg-[#000000] active:scale-[0.99] transition-all flex items-center justify-center cursor-pointer shadow-xs"
                    >
                      {currentMobileCat.primaryCta.label}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={closeMobileSubCategory}
                    className="w-full min-h-[44px] rounded-[4px] border border-[#E3E4E6] text-[#5C5E62] text-[13px] font-medium hover:bg-[#F4F4F4] transition-colors flex items-center justify-center cursor-pointer"
                  >
                    ← Back to Navigation
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
