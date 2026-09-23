import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { ShieldCheck, ThermometerSun, Grid, Zap, Award } from "lucide-react";
import defTile from "@/assets/def-tile.jpg";
import { openConsultationDrawer } from "./ConsultationDrawer";

const TECH_SPECS = [
  {
    icon: Grid,
    title: "18 Independent Power Zones",
    desc: "Laser-cut N-type half-cells are partitioned into 18 autonomous diodes. If shade falls from a roof water tank, parapet, or tree, the unshaded sections continue producing at 100% capacity.",
  },
  {
    icon: ThermometerSun,
    title: "50°C Indian Summer Thermal Rating",
    desc: "Conventional panels degrade rapidly above 25°C. WAVENOX features an ultra-low temperature coefficient of -0.29%/°C, generating up to 14% more energy during scorching Indian heatwaves.",
  },
  {
    icon: ShieldCheck,
    title: "Class 4 Severe Weather Resilience",
    desc: "Dual-tempered 3.2mm diamond glass front and back withstands 250 km/h cyclone winds and 50mm ballistic hail impacts at 140 km/h. Backed by an unconditional 25-year structural warranty.",
  },
];

export function EfficiencyTech() {
  return (
    <section className="relative w-full bg-[#F8F8FA] text-[#171A20] py-24 sm:py-32 lg:py-36 overflow-hidden select-none border-b border-[#E2E8F0]">
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
            Efficiency & Durability
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-[#171A20] mt-2"
          >
            Engineered for Maximum Production
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-sm sm:text-base text-[#393C41] mt-4 leading-relaxed max-w-2xl"
          >
            WAVENOX solar panels are designed with advanced cell architecture that maximizes energy production across every square foot of your roof. Even in complex roof angles, high summer temperatures, or partial shade, our panels out-produce conventional solar arrays.
          </motion.p>
        </div>

        {/* Feature Grid & Visual Presentation */}
        <div className="mt-14 lg:mt-20 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Column: 3 Technical Highlights */}
          <div className="lg:col-span-6 space-y-6 sm:space-y-8 order-2 lg:order-1">
            {TECH_SPECS.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.15 + i * 0.1 }}
                  className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs space-y-2 hover:border-zinc-400 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[#F8F8FA] border border-[#E2E8F0] text-[#171A20]">
                      <Icon size={18} />
                    </div>
                    <h3 className="text-sm sm:text-base font-semibold text-[#171A20]">
                      {item.title}
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm text-[#5C5E62] leading-relaxed pl-1">
                    {item.desc}
                  </p>
                </motion.div>
              );
            })}

            {/* Dual Tesla-Style Pill Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <Link
                to="/deploy"
                className="w-full sm:w-auto px-8 py-2.5 rounded-full bg-[#171A20] text-white text-sm font-medium hover:bg-black transition-colors text-center shadow-xs cursor-pointer"
              >
                Order Now
              </Link>
              <button
                type="button"
                onClick={() => openConsultationDrawer()}
                className="w-full sm:w-auto px-8 py-2.5 rounded-full bg-white text-[#171A20] text-sm font-medium border border-[#E2E8F0] hover:bg-[#EEEEEE] transition-colors text-center cursor-pointer"
              >
                Schedule Consultation
              </button>
            </div>
          </div>

          {/* Right Column: High-Res Physical Asset */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 relative group overflow-hidden rounded-2xl bg-white border border-[#E2E8F0] shadow-xs aspect-[4/3] order-1 lg:order-2"
          >
            <img
              src={defTile}
              alt="WAVENOX High-Efficiency Solar Panel Cascading Matrix"
              className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-103"
            />
            {/* Spec overlay tag */}
            <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 px-3.5 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white text-[11px] font-medium tracking-wide">
              Dual-Glass 3.2mm • 25-Year Guaranteed &gt;89.4% Output
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
