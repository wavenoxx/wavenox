import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ChevronRight, ChevronLeft, Building2, Home, Factory, ShieldCheck } from "lucide-react";
import { estimate } from "@/config/solar";
import { submitLead } from "@/functions/leads";
import { getStoredTelemetry } from "@/lib/telemetry";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

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

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open && typeof window !== "undefined" && window.location.hash === "#consultation") {
      history.replaceState(null, "", window.location.pathname + window.location.search);
    }
  };

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
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        className="w-[95vw] sm:max-w-xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 rounded-2xl bg-white border border-[#E2E8F0] shadow-2xl"
        aria-describedby="consultation-modal-desc"
      >
        <DialogHeader className="text-left pb-4 border-b border-[#E2E8F0]">
          <span className="text-[11px] font-semibold uppercase tracking-widest text-[#5C5E62]">
            Energy Advisory
          </span>
          <DialogTitle className="text-xl sm:text-2xl font-semibold tracking-tight text-[#171A20] mt-0.5">
            Schedule Virtual Consultation
          </DialogTitle>
          <DialogDescription id="consultation-modal-desc" className="text-xs text-[#5C5E62]">
            Engineered architectural solar sizing and personalized savings projection.
          </DialogDescription>
        </DialogHeader>

        {/* Content Body */}
        <div className="py-2">
          {/* Step Progress Indicator */}
          <div className="flex items-center gap-2 mb-6">
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
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div>
                <h3 className="text-sm font-semibold text-[#171A20]">
                  1. Select Your Property Type
                </h3>
                <p className="text-xs text-[#5C5E62] mt-0.5">
                  Configure structural mounting and inverter sizing for your architecture.
                </p>
              </div>

              <div className="space-y-3 pt-1">
                {PROPERTY_TIERS.map((tier) => {
                  const Icon = tier.icon;
                  const isSelected = selectedTier === tier.id;
                  return (
                    <div
                      key={tier.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => setSelectedTier(tier.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setSelectedTier(tier.id);
                        }
                      }}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                        isSelected
                          ? "border-[#171A20] bg-[#F8F8FA] shadow-xs"
                          : "border-[#E2E8F0] hover:border-zinc-400 bg-white"
                      }`}
                    >
                      <div
                        className={`p-2 rounded-lg ${
                          isSelected ? "bg-[#171A20] text-white" : "bg-[#EEEEEE] text-[#171A20]"
                        }`}
                      >
                        <Icon size={18} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs sm:text-sm font-semibold text-[#171A20]">
                            {tier.title}
                          </h4>
                          <span className="text-[11px] font-medium text-[#5C5E62] bg-[#EEEEEE] px-2 py-0.5 rounded-md">
                            {tier.capacity}
                          </span>
                        </div>
                        <p className="text-xs text-[#5C5E62] mt-1 leading-relaxed">{tier.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-5 py-2.5 rounded-full bg-[#171A20] text-white text-xs font-semibold hover:bg-black transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Next: Usage & Savings</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Average Monthly Power Bill & Sizing */}
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div>
                <h3 className="text-sm font-semibold text-[#171A20]">
                  2. Average Monthly Electricity Bill
                </h3>
                <p className="text-xs text-[#5C5E62] mt-0.5">
                  Slide to calibrate based on your typical monthly DISCOM power consumption.
                </p>
              </div>

              {/* Slider Control */}
              <div className="bg-[#F8F8FA] p-4 rounded-xl border border-[#E2E8F0] space-y-3">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs font-medium text-[#5C5E62]">Monthly Bill</span>
                  <span className="text-xl font-bold text-[#171A20] tabular-nums">
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
                  className="w-full accent-[#171A20] cursor-pointer"
                  aria-label="Monthly electricity bill in INR"
                />
                <div className="flex justify-between text-[11px] text-[#5C5E62]">
                  <span>₹3,000 / mo</span>
                  <span>₹75,000+ / mo</span>
                </div>
              </div>

              {/* Real-Time Calculation Cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-[#F8F8FA] border border-[#E2E8F0]">
                  <span className="text-[11px] font-medium text-[#5C5E62]">Recommended System</span>
                  <div className="text-lg font-bold text-[#171A20] mt-0.5 tabular-nums">
                    {estimatedKw} kW
                  </div>
                  <span className="text-[10px] text-[#5C5E62]">550W N-Type TOPCon</span>
                </div>

                <div className="p-3.5 rounded-xl bg-[#F8F8FA] border border-[#E2E8F0]">
                  <span className="text-[11px] font-medium text-[#5C5E62]">Govt Subsidy (DBT)</span>
                  <div className="text-lg font-bold text-[#F57C00] mt-0.5 tabular-nums">
                    ₹{subsidyAmount.toLocaleString("en-IN")}
                  </div>
                  <span className="text-[10px] text-[#5C5E62]">PM Surya Ghar</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#F8F8FA] border border-[#E2E8F0] flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-medium text-[#5C5E62]">
                    Estimated Year-1 Savings
                  </span>
                  <div className="text-base font-bold text-[#171A20] tabular-nums">
                    ₹{estimatedAnnualSavings.toLocaleString("en-IN")} / year
                  </div>
                </div>
                <ShieldCheck size={24} className="text-[#171A20]" />
              </div>

              <p className="text-[11px] text-[#5C5E62] text-center">
                Indicative estimate.{" "}
                <a
                  href="/legal/disclosures"
                  target="_blank"
                  rel="noreferrer"
                  className="underline hover:text-[#171A20]"
                >
                  Calculation methodology & disclaimers
                </a>
              </p>

              <div className="pt-3 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 rounded-full text-xs font-medium text-[#5C5E62] hover:bg-[#EEEEEE] transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <ChevronLeft size={14} />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-5 py-2.5 rounded-full bg-[#171A20] text-white text-xs font-semibold hover:bg-black transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Next: Contact Details</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Contact & Booking Form */}
          {step === 3 && (
            <motion.form
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={handleSubmit}
              className="space-y-3.5"
            >
              <div>
                <h3 className="text-sm font-semibold text-[#171A20]">
                  3. Contact & Proposal Dispatch
                </h3>
                <p className="text-xs text-[#5C5E62] mt-0.5">
                  An engineering advisor will review satellite roof geometry and generate your 3D
                  dossier.
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-[#171A20] mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#E2E8F0] focus:border-[#171A20] focus:outline-none text-xs text-[#171A20]"
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
                    className="w-full px-3.5 py-2 rounded-xl border border-[#E2E8F0] focus:border-[#171A20] focus:outline-none text-xs text-[#171A20]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-[#171A20] mb-1">City</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Hyderabad"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-[#E2E8F0] focus:border-[#171A20] focus:outline-none text-xs text-[#171A20]"
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
                      className="w-full px-3.5 py-2 rounded-xl border border-[#E2E8F0] focus:border-[#171A20] focus:outline-none text-xs text-[#171A20]"
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
                <div className="flex items-start gap-2 pt-1">
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
                    I agree to receive my customized solar sizing proposal and be contacted by
                    WAVENOX advisors as outlined in the{" "}
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

              <div className="pt-3 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-full text-xs font-medium text-[#5C5E62] hover:bg-[#EEEEEE] transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  <ChevronLeft size={14} />
                  <span>Back</span>
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !consentGiven}
                  className="px-5 py-2.5 rounded-full bg-[#171A20] text-white text-xs font-semibold hover:bg-black transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <span className="inline-block h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Proposal Request</span>
                      <ChevronRight size={14} />
                    </>
                  )}
                </button>
              </div>
            </motion.form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
