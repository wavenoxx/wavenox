import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

export function EclipseGateway({ onUnlock }: { onUnlock: () => void }) {
  const [locked, setLocked] = useState(true);
  const [region, setRegion] = useState("India");

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const handleInitialize = () => {
    setLocked(false);
    setTimeout(onUnlock, 1000);
  };

  return (
    <AnimatePresence>
      {locked && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black"
        >
          <div className="flex w-full max-w-sm flex-col items-center px-6">
            <h1 className="text-4xl font-light tracking-[0.5em] text-white md:text-5xl">
              WAVENOX
            </h1>
            <p className="mt-4 text-center text-xs font-medium uppercase tracking-widest text-gray-400">
              Acknowledge Deployment Zone
            </p>

            <div className="relative mt-12 w-full max-w-[250px]">
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full appearance-none border-0 border-b border-gray-800 bg-transparent py-3 pr-8 text-left text-sm text-gray-300 outline-none ring-0 transition-colors focus:border-gray-600"
              >
                <option value="India">India</option>
                <option value="North America">North America</option>
                <option value="Europe">Europe</option>
                <option value="Global">Global</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-0 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-600" />
            </div>

            <button
              onClick={handleInitialize}
              className="mt-8 w-full max-w-[250px] bg-[#2A2A2A] py-3 text-center text-xs font-medium uppercase tracking-widest text-white transition-colors duration-500 hover:bg-[#F57C00]"
            >
              Initialize
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
