import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  ChevronRight,
  ChevronLeft,
  Check,
  Building2,
  Home,
  Factory,
  Zap,
  MessageSquare,
  CheckCircle2,
  Calendar,
  ShieldCheck,
} from "lucide-react";
import { BRAND_CONFIG } from "@/config/brand";
import { computeSolarYield, SOLAR_CONFIG } from "@/config/solar";

export const CONSULTATION_EVENT = "open-wavenox-consultation";

export function openConsultationDrawer(initialTier?: string) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(CONSULTATION_EVENT, { detail: { tier: initialTier } }));
  }
}

const PROPERTY_TIERS = [
  {
    id: "villa",
    title: "Luxury Villa",
    capacity: "25kW – 50kW",
    desc: "Single-family luxury residences requiring monolithic aesthetic harmony and 24/7 outage protection.",
    icon: Home,
  },
  {
    id: "penthouse",
    title: "Independent Home / Penthouse",
    capacity: "10kW – 25kW",
    desc: "Private rooftop installations with premium concealed mounting and high annual yields.",
    icon: Building2,
  },
  {
    id: "commercial",
    title: "Commercial & Industrial",
    capacity: "50kW – 500kW+",
    desc: "Corporate headquarters, factories, and warehouses with 40% Year-1 tax depreciation.",
    icon: Factory,
  },
];

export function ConsultationDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedTier, setSelectedTier] = useState("villa");
  const [monthlyBill, setMonthlyBill] = useState(12000);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("Hyderabad");
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Derived financial calculation based on monthly bill
  // Approximate tariff ₹9.5 / kWh
  const estimatedMonthlyUnits = Math.round(monthlyBill / 9.5);
  const estimatedKw = Math.max(3, Math.round((estimatedMonthlyUnits / 120) * 10) / 10);
  const estimatedAnnualSavings = Math.round(monthlyBill * 12 * 0.95);
  const subsidyAmount = estimatedKw <= 3 ? estimatedKw * 26000 : 78000;

  useEffect(() => {
    function handleEvent(e: Event) {
      const customEvent = e as CustomEvent<{ tier?: string }>;
      if (customEvent.detail?.tier) {
        setSelectedTier(customEvent.detail.tier);
      }
      setIsOpen(true);
      setIsSubmitted(false);
    }

    function handleHash() {
      if (window.location.hash === "#consultation") {
        setIsOpen(true);
        setIsSubmitted(false);
      }
    }

    window.addEventListener(CONSULTATION_EVENT, handleEvent);
    window.addEventListener("hashchange", handleHash);

    if (window.location.hash === "#consultation") {
      setIsOpen(true);
    }

    return () => {
      window.removeEventListener(CONSULTATION_EVENT, handleEvent);
      window.removeEventListener("hashchange", handleHash);
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      if (window.location.hash === "#consultation") {
        history.replaceState(null, "", window.location.pathname + window.location.search);
      }
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);

    const message = encodeURIComponent(
      `Hello ${BRAND_CONFIG.name} Energy Advisors,\n\nI would like to schedule a Virtual Solar Consultation.\n\n` +
        `• Property: ${PROPERTY_TIERS.find((t) => t.id === selectedTier)?.title}\n` +
        `• Monthly Electricity Bill: ₹${monthlyBill.toLocaleString("en-IN")}\n` +
        `• Recommended System: ~${estimatedKw} kW\n` +
        `• Estimated Subsidy: ₹${subsidyAmount.toLocaleString("en-IN")}\n` +
        `• Name: ${name}\n` +
        `• Phone: ${phone}\n` +
        `• City: ${city}\n\nPlease confirm my virtual consultation slot.`,
    );

    const waUrl = `${BRAND_CONFIG.contact.whatsapp.link}?text=${message}`;
    setTimeout(() => {
      window.open(waUrl, "_blank", "noopener,noreferrer");
    }, 400);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => setIsOpen(false)}
            className="absolute inset-0 bg-black/50 backdrop-blur-xs"
          />

          {/* Slide-over Right Sheet */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="absolute top-0 right-0 h-full w-full max-w-xl bg-white shadow-2xl flex flex-col justify-between overflow-y-auto"
          >
            {/* Header */}
            <div className="p-6 sm:p-8 border-b border-[#E2E8F0] flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-md z-10">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-widest text-[#5C5E62]">
                  Energy Advisory
                </span>
                <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#171A20] mt-0.5">
                  Schedule Virtual Consultation
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-full text-[#5C5E62] hover:text-[#171A20] hover:bg-[#EEEEEE] transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 sm:p-8 flex-1">
              {!isSubmitted ? (
                <>
                  {/* Step Progress Pills */}
                  <div className="flex items-center gap-2 mb-8">
                    {[
                      { num: 1, label: "Property" },
                      { num: 2, label: "Usage & Savings" },
                      { num: 3, label: "Schedule" },
                    ].map((s) => (
                      <div
                        key={s.num}
                        className={`flex-1 h-1.5 rounded-full transition-colors ${
                          step >= s.num ? "bg-[#171A20]" : "bg-[#E2E8F0]"
                        }`}
                      />
                    ))}
                  </div>

                  {/* Step 1: Select Property Type */}
                  {step === 1 && (
                    <motion.div
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="space-y-4"
                    >
                      <h3 className="text-base font-semibold text-[#171A20]">
                        1. Select Your Property Type
                      </h3>
                      <p className="text-xs text-[#5C5E62]">
                        Choose the asset category to configure optimal structural mounting and
                        inverter sizing.
                      </p>

                      <div className="space-y-3 pt-2">
                        {PROPERTY_TIERS.map((tier) => {
                          const Icon = tier.icon;
                          const isSelected = selectedTier === tier.id;
                          return (
                            <div
                              key={tier.id}
                              onClick={() => setSelectedTier(tier.id)}
                              className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-4 ${
                                isSelected
                                  ? "border-[#171A20] bg-[#F8F8FA] shadow-xs"
                                  : "border-[#E2E8F0] hover:border-zinc-400 bg-white"
                              }`}
                            >
                              <div
                                className={`p-2.5 rounded-lg ${
                                  isSelected
                                    ? "bg-[#171A20] text-white"
                                    : "bg-[#EEEEEE] text-[#171A20]"
                                }`}
                              >
                                <Icon size={20} />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <h4 className="text-sm font-semibold text-[#171A20]">
                                    {tier.title}
                                  </h4>
                                  <span className="text-xs font-medium text-[#5C5E62] bg-[#EEEEEE] px-2 py-0.5 rounded-md">
                                    {tier.capacity}
                                  </span>
                                </div>
                                <p className="text-xs text-[#5C5E62] mt-1 leading-relaxed">
                                  {tier.desc}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="pt-6 flex justify-end">
                        <button
                          type="button"
                          onClick={() => setStep(2)}
                          className="px-6 py-2.5 rounded-full bg-[#171A20] text-white text-sm font-medium hover:bg-black transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <span>Next: Usage & Savings</span>
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 2: Average Monthly Power Bill & Sizing */}
                  {step === 2 && (
                    <motion.div
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="space-y-6"
                    >
                      <div>
                        <h3 className="text-base font-semibold text-[#171A20]">
                          2. Average Monthly Electricity Bill
                        </h3>
                        <p className="text-xs text-[#5C5E62] mt-0.5">
                          Slide to match your average monthly DISCOM power bill in India.
                        </p>
                      </div>

                      {/* Slider Control */}
                      <div className="bg-[#F8F8FA] p-5 rounded-xl border border-[#E2E8F0] space-y-4">
                        <div className="flex items-baseline justify-between">
                          <span className="text-xs font-medium text-[#5C5E62]">Monthly Bill</span>
                          <span className="text-2xl font-bold text-[#171A20] tabular-nums">
                            ₹{monthlyBill.toLocaleString("en-IN")}
                          </span>
                        </div>
                        <input
                          type="range"
                          min={3000}
                          max={75000}
                          step={1000}
                          value={monthlyBill}
                          onChange={(e) => setMonthlyBill(Number(e.target.value))}
                          className="range-slider"
                        />
                        <div className="flex justify-between text-[11px] text-[#5C5E62]">
                          <span>₹3,000 / mo</span>
                          <span>₹75,000+ / mo</span>
                        </div>
                      </div>

                      {/* Real-Time Calculation Cards */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-4 rounded-xl bg-[#F8F8FA] border border-[#E2E8F0]">
                          <span className="text-[11px] font-medium text-[#5C5E62]">
                            Recommended System
                          </span>
                          <div className="text-xl font-bold text-[#171A20] mt-1 tabular-nums">
                            {estimatedKw} kW
                          </div>
                          <span className="text-[10px] text-[#5C5E62]">High-Yield N-Type</span>
                        </div>

                        <div className="p-4 rounded-xl bg-[#F8F8FA] border border-[#E2E8F0]">
                          <span className="text-[11px] font-medium text-[#5C5E62]">
                            Govt Subsidy (Surya Ghar)
                          </span>
                          <div className="text-xl font-bold text-[#F57C00] mt-1 tabular-nums">
                            ₹{subsidyAmount.toLocaleString("en-IN")}
                          </div>
                          <span className="text-[10px] text-[#5C5E62]">Direct Bank Credit</span>
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-[#F8F8FA] border border-[#E2E8F0] flex items-center justify-between">
                        <div>
                          <span className="text-[11px] font-medium text-[#5C5E62]">
                            Estimated 1-Year Savings
                          </span>
                          <div className="text-lg font-bold text-[#171A20] tabular-nums">
                            ₹{estimatedAnnualSavings.toLocaleString("en-IN")} / year
                          </div>
                        </div>
                        <ShieldCheck size={28} className="text-[#171A20]" />
                      </div>

                      <div className="pt-4 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => setStep(1)}
                          className="px-5 py-2.5 rounded-full text-xs font-medium text-[#5C5E62] hover:bg-[#EEEEEE] transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <ChevronLeft size={16} />
                          <span>Back</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setStep(3)}
                          className="px-6 py-2.5 rounded-full bg-[#171A20] text-white text-sm font-medium hover:bg-black transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <span>Next: Contact Details</span>
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 3: Contact & Booking */}
                  {step === 3 && (
                    <motion.form
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      onSubmit={handleSubmit}
                      className="space-y-4"
                    >
                      <div>
                        <h3 className="text-base font-semibold text-[#171A20]">
                          3. Your Contact Details
                        </h3>
                        <p className="text-xs text-[#5C5E62] mt-0.5">
                          A clean-tech Energy Advisor will prepare your 3D solar layout prior to the
                          virtual call.
                        </p>
                      </div>

                      <div className="space-y-3 pt-2">
                        <div>
                          <label className="block text-xs font-medium text-[#171A20] mb-1">
                            Full Name
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="Enter your name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-lg border border-[#E2E8F0] focus:border-[#171A20] focus:outline-none text-sm text-[#171A20]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-[#171A20] mb-1">
                            Phone / WhatsApp (+91)
                          </label>
                          <input
                            type="tel"
                            required
                            placeholder="+91 98765 43210"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-lg border border-[#E2E8F0] focus:border-[#171A20] focus:outline-none text-sm text-[#171A20]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-[#171A20] mb-1">
                            City / PIN Code
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Hyderabad 500033"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-lg border border-[#E2E8F0] focus:border-[#171A20] focus:outline-none text-sm text-[#171A20]"
                          />
                        </div>
                      </div>

                      <div className="pt-6 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => setStep(2)}
                          className="px-5 py-2.5 rounded-full text-xs font-medium text-[#5C5E62] hover:bg-[#EEEEEE] transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <ChevronLeft size={16} />
                          <span>Back</span>
                        </button>
                        <button
                          type="submit"
                          className="px-6 py-2.5 rounded-full bg-[#171A20] text-white text-sm font-medium hover:bg-black transition-colors flex items-center gap-2 cursor-pointer shadow-md"
                        >
                          <MessageSquare size={16} />
                          <span>Confirm on WhatsApp</span>
                        </button>
                      </div>
                    </motion.form>
                  )}
                </>
              ) : (
                /* Success Confirmation */
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-12 text-center space-y-4"
                >
                  <div className="h-16 w-16 bg-[#F8F8FA] border border-[#E2E8F0] text-[#171A20] rounded-full mx-auto flex items-center justify-center">
                    <CheckCircle2 size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-[#171A20]">
                    Consultation Request Dispatched
                  </h3>
                  <p className="text-sm text-[#5C5E62] max-w-sm mx-auto leading-relaxed">
                    Thank you, {name}. Your WhatsApp consultation dossier has been generated. Our
                    Energy Advisor will review your roof coordinates and connect with you shortly.
                  </p>
                  <div className="pt-6">
                    <button
                      type="button"
                      onClick={() => setIsOpen(false)}
                      className="px-8 py-2.5 rounded-full bg-[#171A20] text-white text-sm font-medium hover:bg-black transition-colors cursor-pointer"
                    >
                      Close Window
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
