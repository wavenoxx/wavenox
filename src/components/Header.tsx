import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { Link } from "@tanstack/react-router";

type NavItem = { label: string; to?: string };

const NAV_ITEMS: NavItem[] = [
  { label: "LIQUID GLASS", to: "/liquid-glass" },
  { label: "RESIDENTIAL", to: "/residential" },
  { label: "OMNI GRID", to: "/omnigrid" },
  { label: "DEFENSE & SAFETY" },
  { label: "SYSTEM INTELLIGENCE" },
  { label: "ENTERPRISE SCALE" },
  { label: "THE BRAND" },
  { label: "DEPLOY" },
];

export function Header() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header className="fixed top-0 left-0 w-full z-50 bg-black/50 backdrop-blur-md border-b border-white/10 flex justify-between items-center px-6 lg:px-10 py-6">
        <Link
          to="/"
          className="text-white text-lg lg:text-xl font-bold uppercase tracking-[0.35em] select-none"
        >
          WAVENOX
        </Link>

        <nav className="hidden xl:flex items-center space-x-8 2xl:space-x-12">
          {NAV_ITEMS.map((item) => {
            const cls =
              "relative text-white/90 text-[11px] font-bold uppercase tracking-[0.25em] transition-colors duration-300 hover:text-white group";
            const inner = (
              <>
                {item.label}
                <span className="absolute left-0 -bottom-1 h-px w-0 bg-white transition-all duration-300 group-hover:w-full" />
              </>
            );
            return item.to ? (
              <Link key={item.label} to={item.to} className={cls}>
                {inner}
              </Link>
            ) : (
              <a key={item.label} href="#" className={cls}>
                {inner}
              </a>
            );
          })}
        </nav>

        <button
          aria-label="Open menu"
          onClick={() => setOpen(true)}
          className="xl:hidden flex flex-col gap-[6px] p-2 -mr-2"
        >
          <span className="block h-[1.5px] w-7 bg-white" />
          <span className="block h-[1.5px] w-7 bg-white" />
        </button>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 bg-black z-50 pt-20 px-8 overflow-y-auto"
          >
            <div className="fixed top-0 left-0 w-full flex justify-between items-center px-4 py-6">
              <span className="text-white text-xl font-bold uppercase tracking-[0.4em]">
                WAVENOX
              </span>
              <button
                aria-label="Close menu"
                onClick={() => setOpen(false)}
                className="relative h-8 w-8"
              >
                <span className="absolute inset-x-1 top-1/2 h-[1.5px] bg-white rotate-45" />
                <span className="absolute inset-x-1 top-1/2 h-[1.5px] bg-white -rotate-45" />
              </button>
            </div>

            <nav className="flex flex-col">
              {NAV_ITEMS.map((item, i) => {
                const cls =
                  "w-full py-5 border-b border-gray-800 text-white text-sm font-semibold uppercase tracking-widest flex justify-between items-center";
                const motionProps = {
                  initial: { opacity: 0, y: 10 },
                  animate: { opacity: 1, y: 0 },
                  transition: {
                    duration: 0.4,
                    delay: 0.08 + i * 0.04,
                    ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
                  },
                  onClick: () => setOpen(false),
                  className: cls,
                };
                const inner = (
                  <>
                    <span>{item.label}</span>
                    <ChevronDown size={16} className="text-gray-400" />
                  </>
                );
                return item.to ? (
                  <motion.div key={item.label} {...motionProps}>
                    <Link to={item.to} onClick={() => setOpen(false)} className="contents">
                      {inner}
                    </Link>
                  </motion.div>
                ) : (
                  <motion.a key={item.label} href="#" {...motionProps}>
                    {inner}
                  </motion.a>
                );
              })}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
