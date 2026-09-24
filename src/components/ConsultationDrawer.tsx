import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "@tanstack/react-router";
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
import { estimate } from "@/config/solar";
import { submitLead } from "@/functions/leads";
import { getStoredTelemetry } from "@/lib/telemetry";

export const CONSULTATION_EVENT = "open-wavenox-consultation";

export function openConsultationDrawer(initialTier?: string) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(CONSULTATION_EVENT, { detail: { tier: initialTier } }));
  }
}

const PROPERTY_TIERS = [
  {
    id: "villa" as const,
    title: "Luxury Villa",
    capacity: "25kW – 50kW",
    desc: "Single-family luxury residences requiring monolithic aesthetic harmony and 24/7 outage protection.",
    icon: Home,
  },
  {
    id: "independent_home" as const,
    title: "Independent Home / Penthouse",
    capacity: "10kW – 25kW",
    desc: "Private rooftop installations with premium concealed mounting and high annual yields.",
    icon: Building2,
  },
  {
    id: "commercial" as const,
    title: "Commercial & Industrial",
    capacity: "50kW – 500kW+",
    desc: "Corporate headquarters, factories, and warehouses with 40% Year-1 tax depreciation.",
    icon: Factory,
  },
];

export function ConsultationDrawer() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedTier, setSelectedTier] = useState<"villa" | "independent_home" | "commercial">(
    "villa",
  );
  const [monthlyBill, setMonthlyBill] = useState(12000);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("Hyderabad");
  const [pinCode, setPinCode] = useState("");
  const [consentGiven, setConsentGiven] = useState(false);
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const calculation = useMemo(
    () =>
      estimate({
        monthlyBillInr: monthlyBill,
        segment: selectedTier === "commercial" ? "commercial" : "residential",
      }),
    [monthlyBill, selectedTier],
  );
  const estimatedKw = calculation.recommendedKw;
  const estimatedAnnualSavings = calculation.annualSavingsInr;
  const subsidyAmount = calculation.subsidyInr;

  useEffect(() => {
    function handleEvent(e: Event) {
      const customEvent = e as CustomEvent<{ tier?: string }>;
      if (customEvent.detail?.tier) {
        const t = customEvent.detail.tier;
        if (t === "commercial" || t === "independent_home" || t === "villa") {
          setSelectedTier(t);
        } else {
          setSelectedTier("villa");
        }
      }
      setIsOpen(true);
      setSubmitError(null);
    }

    function handleHash() {
      if (window.location.hash === "#consultation") {
        setIsOpen(true);
        setSubmitError(null);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consentGiven) {
      setSubmitError("Please confirm your consent to be contacted.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const telemetry = getStoredTelemetry();
      const res = await submitLead({
        data: {
          name,
          phone,
          city,
          pin_code: pinCode.trim() || undefined,
          property_tier: selectedTier,
          monthly_bill_inr: monthlyBill,
          system_kw: estimatedKw,
          battery_units: 0,
          source: "drawer",
          consent_given: true,
          consent_version: "2026-09-v1",
          company_website: companyWebsite.trim() || undefined,
          ...telemetry,
        },
      });

      if (!res.success) {
        setSubmitError(res.message);
        setIsSubmitting(false);
        return;
      }

      setIsOpen(false);
      navigate({
        to: "/order/received",
        search: { ref: res.referenceCode || "WNX-PROPOSAL" },
      });
    } catch (err: unknown) {
      console.error("[ConsultationDrawer] Submit error:", err);
      setSubmitError("Failed to submit request. Please try again or reach us via WhatsApp.");
    } finally {
      setIsSubmitting(false);
    }
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
                    Choose the asset category to configure optimal structural mounting and inverter
                    sizing.
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
                              isSelected ? "bg-[#171A20] text-white" : "bg-[#EEEEEE] text-[#171A20]"
                            }`}
                          >
                            <Icon size={20} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-semibold text-[#171A20]">{tier.title}</h4>
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

                  <p className="text-[11px] text-[#5C5E62] text-center">
                    Estimate only.{" "}
                    <a
                      href="/legal/disclosures"
                      target="_blank"
                      rel="noreferrer"
                      className="underline hover:text-[#171A20]"
                    >
                      See how we calculate
                    </a>
                  </p>

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

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-[#171A20] mb-1">
                          City
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Hyderabad"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-lg border border-[#E2E8F0] focus:border-[#171A20] focus:outline-none text-sm text-[#171A20]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[#171A20] mb-1">
                          PIN Code (Optional)
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. 500033"
                          maxLength={6}
                          value={pinCode}
                          onChange={(e) => setPinCode(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-lg border border-[#E2E8F0] focus:border-[#171A20] focus:outline-none text-sm text-[#171A20]"
                        />
                      </div>
                    </div>

                    {/* Honeypot field for bot suppression */}
                    <input
                      type="text"
                      name="company_website"
                      value={companyWebsite}
                      onChange={(e) => setCompanyWebsite(e.target.value)}
                      tabIndex={-1}
                      autoComplete="off"
                      className="hidden"
                      aria-hidden="true"
                    />

                    {/* DPDP Act 2023 Consent Checkbox */}
                    <div className="flex items-start gap-2 pt-2">
                      <input
                        type="checkbox"
                        id="drawer-consent"
                        required
                        checked={consentGiven}
                        onChange={(e) => setConsentGiven(e.target.checked)}
                        className="mt-1 h-4 w-4 rounded border-[#E2E8F0] accent-[#171A20] cursor-pointer"
                      />
                      <label
                        htmlFor="drawer-consent"
                        className="text-xs text-[#5C5E62] leading-relaxed cursor-pointer"
                      >
                        I agree to receive my solar sizing proposal and be contacted by WAVENOX
                        advisors as outlined in the{" "}
                        <a
                          href="/legal/privacy"
                          target="_blank"
                          rel="noreferrer"
                          className="underline hover:text-[#171A20]"
                        >
                          Privacy Policy
                        </a>
                        .
                      </label>
                    </div>

                    {submitError && (
                      <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
                        {submitError}
                      </div>
                    )}
                  </div>

                  <div className="pt-6 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      disabled={isSubmitting}
                      className="px-5 py-2.5 rounded-full text-xs font-medium text-[#5C5E62] hover:bg-[#EEEEEE] transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      <ChevronLeft size={16} />
                      <span>Back</span>
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || !consentGiven}
                      className="px-6 py-2.5 rounded-full bg-[#171A20] text-white text-sm font-medium hover:bg-black transition-colors flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <>
                          <span>Request Proposal</span>
                          <ChevronRight size={16} />
                        </>
                      )}
                    </button>
                  </div>
                </motion.form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
