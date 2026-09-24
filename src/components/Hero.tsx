import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { ArrowRight, ShieldCheck, Zap, Award } from "lucide-react";
import luxurySolarVilla from "@/assets/luxury_solar_villa.jpg";
import { openConsultationDrawer } from "./ConsultationDrawer";

export function Hero() {
  return (
    <section className="relative h-screen w-full overflow-hidden bg-black text-white flex flex-col justify-between items-center text-center">
      {/* Background Image: Cinema-Grade Luxury Solar Villa */}
      <div className="absolute inset-0 z-0">
        <img
          src={luxurySolarVilla}
          alt="WAVENOX Monolithic Luxury Architectural Solar Villa"
          className="h-full w-full object-cover object-center transform scale-100"
          priority-loaded="true"
        />
        {/* Cinematic ambient shading for pristine text legibility */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.1) 25%, rgba(0,0,0,0.15) 60%, rgba(0,0,0,0.7) 100%)",
          }}
        />
      </div>

      {/* Top Content: Clean Tesla-Grade Typography */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 pt-28 sm:pt-36 px-6 max-w-4xl mx-auto"
      >
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-white drop-shadow-md">
          Solar for Existing Roofs
        </h1>
        <div className="mt-3 flex items-center justify-center gap-2">
          <p className="text-sm sm:text-base text-zinc-200 font-normal">
            Lowest Cost in India — Guaranteed
          </p>
          <span className="text-zinc-400">•</span>
          <button
            type="button"
            onClick={() => openConsultationDrawer()}
            className="text-sm sm:text-base text-white underline underline-offset-4 hover:text-[#F57C00] transition-colors cursor-pointer inline-flex items-center gap-1"
          >
            <span>Schedule a Virtual Consultation</span>
            <ArrowRight size={14} className="mt-0.5" />
          </button>
        </div>
      </motion.div>

      {/* Bottom Floating Spec Dock + Dual Pill CTAs */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 pb-10 sm:pb-14 px-6 w-full max-w-5xl mx-auto"
      >
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8">
          {/* 3 Clean Engineering Specifications */}
          <div className="grid grid-cols-3 gap-6 sm:gap-12 text-center">
            {/* Spec 1 */}
            <div className="flex flex-col items-center">
              <span className="text-xl sm:text-2xl lg:text-3xl font-semibold tracking-tight text-white drop-shadow-sm">
                Guaranteed
              </span>
              <span className="mt-1 text-[11px] sm:text-xs text-zinc-300 font-normal tracking-wide">
                Lowest Price in India
              </span>
            </div>

            {/* Spec 2 */}
            <div className="flex flex-col items-center">
              <span className="text-xl sm:text-2xl lg:text-3xl font-semibold tracking-tight text-white drop-shadow-sm">
                25-Year
              </span>
              <span className="mt-1 text-[11px] sm:text-xs text-zinc-300 font-normal tracking-wide">
                Complete Warranty
              </span>
            </div>

            {/* Spec 3 */}
            <div className="flex flex-col items-center">
              <span className="text-xl sm:text-2xl lg:text-3xl font-semibold tracking-tight text-white drop-shadow-sm">
                24/7
              </span>
              <span className="mt-1 text-[11px] sm:text-xs text-zinc-300 font-normal tracking-wide">
                Outage Protection
              </span>
            </div>
          </div>

          {/* Dual Tesla-Style Pill Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            {/* Primary Pill: Order Now */}
            <Link
              to="/deploy"
              className="w-full sm:w-auto px-8 py-2.5 rounded-full bg-white text-[#171A20] text-sm font-medium hover:bg-neutral-200 transition-all text-center shadow-md cursor-pointer"
            >
              Order Now
            </Link>

            {/* Secondary Glass Pill: Schedule Consultation */}
            <button
              type="button"
              onClick={() => openConsultationDrawer()}
              className="w-full sm:w-auto px-8 py-2.5 rounded-full bg-black/50 backdrop-blur-md text-white text-sm font-medium border border-white/20 hover:bg-black/75 transition-all text-center cursor-pointer"
            >
              Schedule Consultation
            </button>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
