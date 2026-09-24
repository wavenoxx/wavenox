import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, ChevronRight, Phone, MessageSquare } from "lucide-react";
import { Link, useRouterState } from "@tanstack/react-router";
import { BrandLogo } from "./BrandLogo";
import { openConsultationDrawer } from "./ConsultationDrawer";
import { BRAND_CONFIG } from "@/config/brand";

const MAIN_NAV = [
  { label: "Solar Panels", to: "/" },
  { label: "Homes", to: "/residential" },
  { label: "Omnigrid", to: "/omnigrid" },
  { label: "Commercial", to: "/enterprise" },
];

const DRAWER_NAV = [
  { label: "Solar Panels (Showcase)", to: "/" },
  { label: "Solar for Homes", to: "/residential" },
  { label: "Omnigrid Energy Storage", to: "/omnigrid" },
  { label: "Commercial & Industrial Solar", to: "/enterprise" },
  { label: "Design Studio", to: "/deploy" },
];

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const routerState = useRouterState();

  // Auto-close menu on route navigation
  useEffect(() => {
    setDrawerOpen(false);
  }, [routerState.location.pathname]);

  // Close menu on ESC key
  useEffect(() => {
    if (!drawerOpen) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setDrawerOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [drawerOpen]);

  useEffect(() => {
    function handleScroll() {
      setIsScrolled(window.scrollY > 40);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  return (
    <>
      <header
        className={`fixed top-0 left-0 w-full z-40 transition-all duration-300 ${
          isScrolled
            ? "bg-white/85 backdrop-blur-md border-b border-black/5 text-[#171A20] shadow-xs py-3.5 px-6 lg:px-12"
            : "bg-transparent text-white py-5 px-6 lg:px-12"
        } flex items-center justify-between`}
      >
        {/* Left: Brand Logo */}
        <div className="flex items-center">
          <BrandLogo size="md" className={isScrolled ? "text-[#171A20]" : "text-white"} />
        </div>

        {/* Center: Minimalist Links */}
        <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
          {MAIN_NAV.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className={`px-3.5 py-1.5 text-sm font-medium rounded-md transition-colors ${
                isScrolled ? "text-[#171A20] hover:bg-black/5" : "text-white/95 hover:bg-white/10"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right: Consultation Pill & Menu */}
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() => openConsultationDrawer()}
            className={`hidden sm:inline-flex items-center justify-center px-4 py-1.5 text-xs font-medium rounded-full transition-all cursor-pointer ${
              isScrolled
                ? "bg-[#171A20] text-white hover:bg-black"
                : "bg-white/20 backdrop-blur-md text-white border border-white/30 hover:bg-white/30"
            }`}
          >
            Schedule Consultation
          </button>

          <button
            type="button"
            aria-label="Open navigation menu"
            aria-expanded={drawerOpen}
            aria-controls="mobile-navigation-drawer"
            onClick={() => setDrawerOpen(true)}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors cursor-pointer ${
              isScrolled ? "text-[#171A20] hover:bg-black/5" : "text-white hover:bg-white/10"
            }`}
          >
            Menu
          </button>
        </div>
      </header>

      {/* Slide-Over Side Drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setDrawerOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-xs"
            />

            {/* Right Drawer Sheet */}
            <motion.div
              id="mobile-navigation-drawer"
              role="dialog"
              aria-modal="true"
              aria-label="Site navigation menu"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="absolute top-0 right-0 h-full w-full max-w-sm bg-white shadow-2xl flex flex-col justify-between p-6 sm:p-8"
            >
              {/* Top: Close trigger */}
              <div>
                <div className="flex items-center justify-between pb-6 border-b border-[#E2E8F0]">
                  <BrandLogo size="sm" className="text-[#171A20]" />
                  <button
                    type="button"
                    aria-label="Close menu"
                    onClick={() => setDrawerOpen(false)}
                    className="p-1.5 rounded-full text-[#5C5E62] hover:text-[#171A20] hover:bg-[#EEEEEE] transition-colors cursor-pointer"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Navigation Links */}
                <nav className="mt-6 space-y-1">
                  {DRAWER_NAV.map((item) => (
                    <Link
                      key={item.label}
                      to={item.to}
                      onClick={() => setDrawerOpen(false)}
                      className="flex items-center justify-between px-3 py-3 text-sm font-medium text-[#171A20] rounded-lg hover:bg-[#F8F8FA] transition-colors"
                    >
                      <span>{item.label}</span>
                      <ChevronRight size={16} className="text-[#5C5E62]" />
                    </Link>
                  ))}
                </nav>
              </div>

              {/* Bottom: Contact & Direct Actions */}
              <div className="pt-6 border-t border-[#E2E8F0] space-y-3">
                <button
                  type="button"
                  onClick={() => {
                    setDrawerOpen(false);
                    openConsultationDrawer();
                  }}
                  className="w-full py-2.5 px-4 rounded-full bg-[#171A20] text-white text-sm font-medium hover:bg-black transition-colors text-center cursor-pointer shadow-xs"
                >
                  Schedule Consultation
                </button>

                <div className="flex items-center justify-between text-xs text-[#5C5E62] px-2 pt-2">
                  <a
                    href={`tel:${BRAND_CONFIG.contact.phone.dial}`}
                    className="flex items-center gap-1.5 hover:text-[#171A20] transition-colors"
                  >
                    <Phone size={13} />
                    <span>{BRAND_CONFIG.contact.phone.display}</span>
                  </a>
                  <a
                    href={BRAND_CONFIG.contact.whatsapp.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 hover:text-[#171A20] transition-colors"
                  >
                    <MessageSquare size={13} />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
