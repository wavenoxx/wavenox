import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { Compass, FileCheck, Wrench, Gauge, Zap, ArrowRight, ShieldCheck } from "lucide-react";
import { openConsultationDrawer } from "./ConsultationDrawer";

const STEPS = [
  {
    step: "01",
    icon: Compass,
    title: "Virtual 3D Design & Proposal",
    desc: "Share your latest DISCOM power bill and roof coordinates. Our solar engineers run high-precision satellite irradiance simulations to generate an optimized 3D layout tailored to your home.",
    timing: "Within 24 Hours",
  },
  {
    step: "02",
    icon: FileCheck,
    title: "DISCOM Net-Metering Feasibility",
    desc: "We manage the entire regulatory submission to your state electricity board (TSSPDCL, BESCOM, MSEDCL, etc.), securing official grid-tie feasibility and bi-directional meter sanctions.",
    timing: "3 – 5 Business Days",
  },
  {
    step: "03",
    icon: Wrench,
    title: "Single-Day Certified Installation",
    desc: "Our certified in-house structural technicians complete physical module mounting and inverter commissioning in a single day. All structural mounts use non-penetrative ballast engineering.",
    timing: "1 Day Physical Install",
  },
  {
    step: "04",
    icon: Gauge,
    title: "CEIG Inspection & Smart Net-Meter",
    desc: "Government electrical inspectors (CEIG) verify system safety compliance. Your local DISCOM installs the new bi-directional smart net-meter to record outgoing solar power credits.",
    timing: "Coordinated by WAVENOX",
  },
  {
    step: "05",
    icon: Zap,
    title: "Power On & Direct Subsidy Disbursal",
    desc: "Flip the switch to 100% clean autonomous energy. We submit post-commissioning geo-tagged reports to the National Solar Portal, crediting up to ₹78,000 subsidy directly to your bank account.",
    timing: "Day 1 Clean Energy",
  },
];

export function OrderProcess() {
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
            Process
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-[#171A20] mt-2"
          >
            Order to Power On
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-sm sm:text-base text-[#393C41] mt-4 leading-relaxed max-w-2xl"
          >
            From initial digital design to flipping the switch on clean power, our certified
            in-house engineering team manages every step of your solar journey. We handle all DISCOM
            net-metering approvals, CEIG electrical clearances, and PM Surya Ghar government subsidy
            disbursals with zero hassle.
          </motion.p>
        </div>

        {/* 5-Step Clean Card Timeline */}
        <div className="mt-14 lg:mt-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 + i * 0.1 }}
                className="p-6 rounded-2xl bg-[#F8F8FA] border border-[#E2E8F0] shadow-xs flex flex-col justify-between hover:border-zinc-400 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0]">
                    <span className="text-xl font-bold text-[#171A20] tabular-nums">{s.step}</span>
                    <div className="p-2 rounded-lg bg-white border border-[#E2E8F0] text-[#171A20]">
                      <Icon size={18} />
                    </div>
                  </div>

                  <h3 className="text-sm font-semibold text-[#171A20] mt-4 leading-snug">
                    {s.title}
                  </h3>

                  <p className="text-xs text-[#5C5E62] mt-2 leading-relaxed">{s.desc}</p>
                </div>

                <div className="mt-6 pt-4 border-t border-[#E2E8F0] flex items-center justify-between">
                  <span className="text-[11px] font-medium text-[#171A20] bg-white px-2.5 py-1 rounded-md border border-[#E2E8F0]">
                    {s.timing}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom Actions Bar */}
        <div className="mt-12 p-6 sm:p-8 rounded-2xl bg-[#F8F8FA] border border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-full bg-[#171A20] text-white shrink-0">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-[#171A20]">Zero Paperwork Hassle</h4>
              <p className="text-xs text-[#5C5E62] mt-0.5">
                Our regulatory team coordinates all government DISCOM filings, net-meter
                installation, and subsidy credits on your behalf.
              </p>
            </div>
          </div>

          {/* Dual Tesla Pill CTAs */}
          <div className="flex items-center gap-3 w-full sm:w-auto shrink-0">
            <Link
              to="/deploy"
              className="w-full sm:w-auto px-8 py-2.5 rounded-full bg-[#171A20] text-white text-sm font-medium hover:bg-black transition-colors text-center shadow-xs cursor-pointer"
            >
              Order Solar Now
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
