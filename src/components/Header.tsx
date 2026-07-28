import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

const NAV_ITEMS = [
  "LIQUID GLASS",
  "RESIDENTIAL",
  "OMNI-GRID",
  "DEFENSE & SAFETY",
  "SYSTEM INTELLIGENCE",
  "ENTERPRISE SCALE",
  "THE BRAND",
  "DEPLOY",
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
      <header className="fixed top-0 left-0 w-full z-50 bg-transparent">
        <div className="flex justify-between items-center w-full px-6 md:px-8 lg:px-16 py-6 md:py-8">
          <a
            href="#"
            className="text-white font-bold text-lg md:text-xl uppercase tracking-[0.5em] select-none"
          >
            WAVENOX
          </a>

          <nav className="hidden xl:flex items-center space-x-6 xl:space-x-10">
            {NAV_ITEMS.map((item) => (
              <a
                key={item}
                href="#"
                className="text-white/80 hover:text-white text-[11px] font-semibold uppercase tracking-[0.2em] border-b border-transparent hover:border-white transition-all duration-300 pb-1"
              >
                {item}
              </a>
            ))}
          </nav>

          <button
            aria-label="Open menu"
            onClick={() => setOpen(true)}
            className="xl:hidden flex flex-col gap-[6px] p-2 -mr-2"
          >
            <span className="block h-[1.5px] w-7 bg-white" />
            <span className="block h-[1.5px] w-7 bg-white" />
          </button>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-50 bg-black flex flex-col"
          >
            <div className="flex justify-between items-center w-full px-6 md:px-8 py-6 md:py-8">
              <span className="text-white font-bold text-lg md:text-xl uppercase tracking-[0.5em]">
                WAVENOX
              </span>
              <button
                aria-label="Close menu"
                onClick={() => setOpen(false)}
                className="relative h-8 w-8"
              >
                <span className="absolute inset-x-0 top-1/2 h-[1.5px] bg-white rotate-45" />
                <span className="absolute inset-x-0 top-1/2 h-[1.5px] bg-white -rotate-45" />
              </button>
            </div>

            <nav className="flex-1 flex flex-col justify-center px-6 md:px-12 gap-5 md:gap-7 overflow-y-auto pb-12">
              {NAV_ITEMS.map((item, i) => (
                <motion.a
                  key={item}
                  href="#"
                  onClick={() => setOpen(false)}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    duration: 0.5,
                    delay: 0.15 + i * 0.05,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="text-white text-3xl sm:text-4xl md:text-5xl font-bold uppercase tracking-[0.15em] hover:text-[#F57C00] transition-colors duration-300"
                >
                  {item}
                </motion.a>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
