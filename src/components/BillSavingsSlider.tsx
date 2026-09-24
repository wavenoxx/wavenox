import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { ArrowRight, IndianRupee, ShieldCheck, Zap, Sparkles } from "lucide-react";
import { DISCOMS, estimate } from "@/config/solar";

export function BillSavingsSlider() {
  const [monthlyBill, setMonthlyBill] = useState(14000);
  const [selectedDiscom, setSelectedDiscom] = useState(DISCOMS[0]);

  const calculation = useMemo(
    () =>
      estimate({
        monthlyBillInr: monthlyBill,
        discomCode: selectedDiscom.code,
      }),
    [monthlyBill, selectedDiscom.code],
  );

  const twentyFiveYearLakhs = (calculation.netGain25YearsInr / 100000).toFixed(1);

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
            Savings
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-[#171A20] mt-2"
          >
            Pay Less for Electricity
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-sm sm:text-base text-[#393C41] mt-4 leading-relaxed max-w-2xl"
          >
            See how much you can save each year by switching to WAVENOX architectural solar. Select
            your local electricity board and average monthly power bill to view instant system
            sizing, 25-year net wealth generated, and Central Government PM Surya Ghar subsidies.
          </motion.p>
        </div>

        {/* State DISCOM Selector Tabs */}
        <div className="mt-10 sm:mt-12">
          <span className="block text-xs font-medium text-[#5C5E62] mb-3 uppercase tracking-wider">
            Select Your State Utility Board (DISCOM)
          </span>
          <div className="flex flex-wrap gap-2">
            {DISCOMS.map((d) => {
              const isSelected = selectedDiscom.code === d.code;
              return (
                <button
                  key={d.code}
                  type="button"
                  onClick={() => setSelectedDiscom(d)}
                  className={`px-4 py-2 rounded-full text-xs font-medium transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#171A20] text-white shadow-xs"
                      : "bg-[#F8F8FA] text-[#5C5E62] border border-[#E2E8F0] hover:border-zinc-400 hover:text-[#171A20]"
                  }`}
                >
                  <span>{d.code}</span>
                  <span className="ml-1.5 opacity-60">₹{d.residentialTariffInr}/u</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Interactive Calculator Engine Layout */}
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Interactive Slider Panel */}
          <div className="lg:col-span-6 bg-[#F8F8FA] rounded-2xl p-6 sm:p-10 border border-[#E2E8F0] space-y-8">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-[#5C5E62]">
                  Average Monthly Bill
                </span>
                <p className="text-xs text-[#5C5E62] mt-0.5">Estimated based on power bill</p>
              </div>
              <div className="text-right">
                <span className="text-3xl sm:text-4xl font-bold text-[#171A20] tabular-nums">
                  ₹{monthlyBill.toLocaleString("en-IN")}
                </span>
                <span className="block text-[11px] text-[#5C5E62]">/ month</span>
              </div>
            </div>

            {/* Slider Input */}
            <div className="space-y-3">
              <input
                type="range"
                min={3000}
                max={75000}
                step={1000}
                value={monthlyBill}
                onChange={(e) => setMonthlyBill(Number(e.target.value))}
                className="range-slider"
              />
              <div className="flex justify-between text-xs text-[#5C5E62] font-medium">
                <span>₹3,000 / mo</span>
                <span>₹35,000 / mo</span>
                <span>₹75,000+ / mo</span>
              </div>
            </div>

            {/* Net Metering Summary Pill */}
            <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Zap size={16} className="text-[#F57C00]" />
                <span className="font-medium text-[#171A20]">
                  Grid Offset: Covers ~{calculation.billCoveragePct}% of your bill
                </span>
              </div>
              <span className="font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                ~{calculation.billCoveragePct}% Coverage
              </span>
            </div>

            {/* Primary Action Button */}
            <div className="pt-2">
              <Link
                to="/deploy"
                className="w-full py-3.5 px-8 rounded-full bg-[#171A20] text-white text-sm font-medium hover:bg-black transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                <span>Order Solar Now</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          {/* Right Column: 4 Real-Time Output Metric Cards */}
          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Metric 1: System Size */}
            <div className="p-6 rounded-2xl bg-[#F8F8FA] border border-[#E2E8F0] space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#5C5E62]">
                Recommended Size
              </span>
              <div className="text-3xl font-bold text-[#171A20] tabular-nums">
                {calculation.recommendedKw} kW
              </div>
              <p className="text-xs text-[#5C5E62] leading-relaxed">
                N-Type TOPCon dual-glass architecture generating ~
                {calculation.annualGenKwh.toLocaleString("en-IN")} units/yr.
              </p>
            </div>

            {/* Metric 2: Estimated Annual Savings */}
            <div className="p-6 rounded-2xl bg-[#F8F8FA] border border-[#E2E8F0] space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#5C5E62]">
                1-Year Bill Savings
              </span>
              <div className="text-3xl font-bold text-[#171A20] tabular-nums">
                ₹{calculation.annualSavingsInr.toLocaleString("en-IN")}
              </div>
              <p className="text-xs text-[#5C5E62] leading-relaxed">
                Direct utility bill offset at {selectedDiscom.code} scheduled residential rates.
              </p>
            </div>

            {/* Metric 3: 25-Year Wealth Generated */}
            <div className="p-6 rounded-2xl bg-[#F8F8FA] border border-[#E2E8F0] space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#5C5E62]">
                25-year savings after system cost
              </span>
              <div className="text-3xl font-bold text-[#171A20] tabular-nums">
                ₹{twentyFiveYearLakhs} L
              </div>
              <p className="text-xs text-[#5C5E62] leading-relaxed">
                Cumulative net savings factoring module degradation and tariff inflation.
              </p>
            </div>

            {/* Metric 4: Government Subsidy */}
            <div className="p-6 rounded-2xl bg-[#F8F8FA] border border-[#E2E8F0] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#5C5E62]">
                  Govt Subsidy Credit
                </span>
                <span className="h-2 w-2 rounded-full bg-[#F57C00]" />
              </div>
              <div className="text-3xl font-bold text-[#F57C00] tabular-nums">
                ₹{calculation.subsidyInr.toLocaleString("en-IN")}
              </div>
              <p className="text-xs text-[#5C5E62] leading-relaxed">
                PM Surya Ghar Muft Bijli Yojana direct credit deposited to your bank account.
              </p>
            </div>
          </div>
        </div>

        {/* Footnote */}
        <p className="mt-8 text-center text-xs text-[#5C5E62]">
          Estimate only.{" "}
          <a href="/legal/disclosures" className="underline hover:text-[#171A20]">
            See how we calculate
          </a>
        </p>
      </div>
    </section>
  );
}
