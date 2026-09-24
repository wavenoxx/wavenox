import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { ShieldCheck, EyeOff, Layers } from "lucide-react";
import liquidGlassMacro from "@/assets/liquid_glass_macro.jpg";
import { openConsultationDrawer } from "./ConsultationDrawer";

const FEATURES = [
  {
    icon: Layers,
    title: "Concealed Mounting Hardware",
    desc: "Proprietary interlocking rail-free clamps secure panels flush against your roof, eliminating unsightly aluminum brackets.",
  },
  {
    icon: EyeOff,
    title: "Zero Visible Conduits",
    desc: "All high-voltage DC cabling is routed through internal architectural raceways directly into your hybrid inverter.",
  },
  {
    icon: ShieldCheck,
    title: "Monolithic All-Black Aesthetic",
    desc: "N-type TOPCon monocrystalline cells under dual-tempered diamond glass create a seamless, non-reflective obsidian plane.",
  },
];

export function SleekDesign() {
  return (
    <section className="relative w-full bg-white text-[#171A20] py-24 sm:py-32 lg:py-36 overflow-hidden border-b border-[#E2E8F0]">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Section Header */}
        <div className="max-w-3xl">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-xs font-semibold uppercase tracking-[0.25em] text-[#5C5E62]"
          >
            Design
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-[#171A20] mt-2"
          >
            Sleek, Low-Profile Solar
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-sm sm:text-base text-[#393C41] mt-4 leading-relaxed max-w-2xl"
          >
            Traditional solar panels are bulky and attached with visible rails and messy conduits
            that ruin your home's architecture. WAVENOX low-profile architectural panels blend
            seamlessly into your roof with concealed mounting hardware and all-black monolithic
            styling. Engineered specifically for luxury Indian residences, ensuring zero roof
            penetration leaks and aerodynamic cyclone resistance.
          </motion.p>
        </div>

        {/* Feature Grid & Visual Presentation */}
        <div className="mt-14 lg:mt-20 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Column: Macro Photographic Asset */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 relative group overflow-hidden rounded-2xl bg-[#F8F8FA] border border-[#E2E8F0] shadow-sm aspect-[16/10]"
          >
            <img
              src={liquidGlassMacro}
              alt="WAVENOX Hexagonal N-Type TOPCon Silicon Cells under Diamond Glass"
              className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-103"
            />
            {/* Subtle caption watermark */}
            <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 px-3.5 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white text-[11px] font-medium tracking-wide">
              Hexagonal N-Type TOPCon • 24.8% Cell Efficiency
            </div>
          </motion.div>

          {/* Right Column: 3 Architectural Feature Callouts */}
          <div className="lg:col-span-5 space-y-6 sm:space-y-8">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.15 + i * 0.1 }}
                  className="flex items-start gap-4 p-4 rounded-xl hover:bg-[#F8F8FA] transition-colors"
                >
                  <div className="p-2.5 rounded-lg bg-[#F8F8FA] border border-[#E2E8F0] text-[#171A20] shrink-0">
                    <Icon size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[#171A20]">{f.title}</h3>
                    <p className="text-xs sm:text-sm text-[#5C5E62] mt-1 leading-relaxed">
                      {f.desc}
                    </p>
                  </div>
                </motion.div>
              );
            })}

            {/* Dual Tesla-Style Pill Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.45 }}
              className="pt-4 flex flex-col sm:flex-row items-center gap-3"
            >
              <Link
                to="/deploy"
                className="w-full sm:w-auto px-8 py-2.5 rounded-full bg-[#171A20] text-white text-sm font-medium hover:bg-black transition-colors text-center shadow-xs cursor-pointer"
              >
                Order Now
              </Link>
              <button
                type="button"
                onClick={() => openConsultationDrawer()}
                className="w-full sm:w-auto px-8 py-2.5 rounded-full bg-[#EEEEEE] text-[#171A20] text-sm font-medium hover:bg-[#E2E8F0] transition-colors text-center cursor-pointer"
              >
                Schedule Consultation
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
