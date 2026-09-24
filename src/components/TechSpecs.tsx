import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";
import { openConsultationDrawer } from "./ConsultationDrawer";
import { PRODUCTS_CONFIG } from "@/config/products";

const MECHANICAL_SPECS = [
  { label: "Nominal Power Rating", value: `${PRODUCTS_CONFIG.module.ratedPowerW}W Bifacial` },
  { label: "Cell Technology", value: PRODUCTS_CONFIG.module.cellType },
  { label: "Module Efficiency", value: `${PRODUCTS_CONFIG.module.efficiencyPct}% STC` },
  { label: "Dimensions", value: PRODUCTS_CONFIG.module.dimensionsMm },
  { label: "Weight", value: `${PRODUCTS_CONFIG.module.weightKg} kg` },
  { label: "Front / Back Glass", value: PRODUCTS_CONFIG.module.frontGlass },
  { label: "Static Load Rating", value: PRODUCTS_CONFIG.module.maxStaticLoadPa },
];

const ELECTRICAL_SPECS = [
  {
    label: "Inverter Efficiency",
    value: `${PRODUCTS_CONFIG.inverter.efficiencyPct}% European (${PRODUCTS_CONFIG.inverter.maxEfficiencyPct}% Peak)`,
  },
  { label: "Inverter Architecture", value: PRODUCTS_CONFIG.inverter.type },
  { label: "Enclosure Protection", value: PRODUCTS_CONFIG.inverter.protectionRating },
  { label: "Fire Safety Class", value: PRODUCTS_CONFIG.module.fireRating },
  { label: "Compliance & Standards", value: PRODUCTS_CONFIG.module.certifications.join(", ") },
  {
    label: "Product Warranty",
    value: `${PRODUCTS_CONFIG.module.productWarrantyYears} Years Workmanship`,
  },
  {
    label: "Performance Warranty",
    value: `${PRODUCTS_CONFIG.module.performanceWarrantyYears} Years Linear Output`,
  },
];

export function TechSpecs() {
  return (
    <section className="relative w-full bg-[#F8F8FA] text-[#171A20] py-24 sm:py-32 lg:py-36 overflow-hidden border-b border-[#E2E8F0]">
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
            Engineering & Specs
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-[#171A20] mt-2"
          >
            Solar Panel Specs
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-sm sm:text-base text-[#393C41] mt-4 leading-relaxed max-w-2xl"
          >
            Engineered with uncompromising precision. Every WAVENOX architectural panel undergoes
            rigorous testing to exceed Indian BIS and international IEC standards for mechanical
            loading, thermal shock, and long-term durability.
          </motion.p>
        </div>

        {/* 2-Column Minimalist Specifications Table */}
        <div className="mt-14 lg:mt-20 grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-14 bg-white p-6 sm:p-12 rounded-3xl border border-[#E2E8F0] shadow-xs">
          {/* Column 1: Mechanical & Physical */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[#171A20] pb-3 border-b border-[#E2E8F0]">
              Mechanical & Physical Architecture
            </h3>
            <dl className="divide-y divide-[#E2E8F0]">
              {MECHANICAL_SPECS.map((spec) => (
                <div
                  key={spec.label}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs sm:text-sm"
                >
                  <dt className="text-[#5C5E62] font-normal">{spec.label}</dt>
                  <dd className="text-[#171A20] font-semibold sm:text-right">{spec.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Column 2: Electrical, Ratings & Warranty */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[#171A20] pb-3 border-b border-[#E2E8F0]">
              Electrical, Ratings & Warranty
            </h3>
            <dl className="divide-y divide-[#E2E8F0]">
              {ELECTRICAL_SPECS.map((spec) => (
                <div
                  key={spec.label}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs sm:text-sm"
                >
                  <dt className="text-[#5C5E62] font-normal">{spec.label}</dt>
                  <dd className="text-[#171A20] font-semibold sm:text-right">{spec.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        {!PRODUCTS_CONFIG.specsVerified && (
          <p className="mt-4 text-xs text-[#5C5E62] text-center italic">
            {PRODUCTS_CONFIG.indicativeDisclaimer}
          </p>
        )}

        {/* Bottom Actions & Certification Bar */}
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-6 pt-4">
          <div className="flex items-center gap-2 text-xs text-[#5C5E62]">
            <ShieldCheck size={18} className="text-[#171A20] shrink-0" />
            <span>
              Certified under Bureau of Indian Standards (BIS IS 14286) & IEC 61215/61730 for
              residential installations.
            </span>
          </div>

          {/* Pill Action Buttons */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
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
      </div>
    </section>
  );
}
