import * as React from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  ChevronRight,
  ChevronLeft,
  Building2,
  Home,
  Factory,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
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
    capacity: "15 kW – 25 kW",
    desc: "Single-family residences requiring flush architectural mounting and 24/7 outage protection.",
    icon: Home,
  },
  {
    id: "independent_home" as const,
    title: "Independent Home / Penthouse",
    capacity: "5 kW – 15 kW",
    desc: "Terrace installations with elevated pergola structure and net-metering export.",
    icon: Building2,
  },
  {
    id: "commercial" as const,
    title: "Commercial & Industrial",
    capacity: "25 kW – 500 kW+",
    desc: "Commercial rooftops and factories with 40% Section 34 accelerated depreciation.",
    icon: Factory,
  },
];

export function ConsultationDrawer() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = React.useState(false);
  const [step, setStep] = React.useState<1 | 2 | 3>(1);
  const [selectedTier, setSelectedTier] = React.useState<
    "villa" | "independent_home" | "commercial"
  >("villa");
  const [monthlyBill, setMonthlyBill] = React.useState(12000);
  const [name, setName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [city, setCity] = React.useState("Hyderabad");
  const [pinCode, setPinCode] = React.useState("");
  const [consentGiven, setConsentGiven] = React.useState(false);
  const [hpExtra, setHpExtra] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  const resetForm = React.useCallback(() => {
    setStep(1);
    setName("");
    setPhone("");
    setCity("Hyderabad");
    setPinCode("");
    setConsentGiven(false);
    setHpExtra("");
    setSubmitError(null);
  }, []);

  const calculation = React.useMemo(
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

  React.useEffect(() => {
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
    if (!open) {
      resetForm();
      if (typeof window !== "undefined" && window.location.hash === "#consultation") {
        history.replaceState(null, "", window.location.pathname + window.location.search);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consentGiven) {
      setSubmitError("Please confirm your consent to be contacted.");
      return;
    }

    const cleanPin = pinCode.trim();
    if (!cleanPin || !/^[1-9][0-9]{5}$/.test(cleanPin)) {
      setSubmitError(
        "Please enter a valid 6-digit postal PIN code for DISCOM feasibility (e.g. 500033).",
      );
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
          hp_extra: hpExtra.trim() || undefined,
          ...telemetry,
        },
      });

      if (!res.success) {
        setSubmitError(res.message);
        setIsSubmitting(false);
        return;
      }

      if (typeof window !== "undefined") {
        sessionStorage.setItem(
          "wavenox_last_submission",
          JSON.stringify({
            ref: res.referenceCode || "WNX-PROPOSAL",
            name,
            isDemo: res.isDemo ?? true,
            timestamp: new Date().toISOString(),
          }),
        );
      }

      resetForm();
      setIsOpen(false);
      navigate({
        to: "/order/received",
        search: { ref: res.referenceCode || "WNX-PROPOSAL" },
      });
    } catch (err: unknown) {
      console.error("[ConsultationDrawer] Submit error:", err);
      setSubmitError("Failed to submit proposal request. Please reach us via WhatsApp.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg bg-[#FFFFFF] text-[#171A20] p-6 sm:p-8 rounded-[4px] border border-[#E3E4E6]">
        <DialogHeader className="border-b border-[#E3E4E6] pb-4">
          <DialogTitle className="text-[20px] font-medium tracking-tight text-[#171A20]">
            Virtual Solar Consultation
          </DialogTitle>
          <DialogDescription className="text-[13px] text-[#5C5E62] mt-1">
            Complimentary 3D rooftop design and financial modeling with a WAVENOX solar engineer.
          </DialogDescription>
        </DialogHeader>

        {/* Step Indicators */}
        <div className="flex items-center gap-2 pt-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-[2px] transition-colors ${
                s <= step ? "bg-[#171A20]" : "bg-[#E3E4E6]"
              }`}
            />
          ))}
        </div>

        {/* Step 1: Property Type */}
        {step === 1 && (
          <div className="space-y-4 pt-2">
            <div>
              <h3 className="text-[14px] font-medium text-[#171A20]">1. Select Property Type</h3>
              <p className="text-[12px] text-[#5C5E62] mt-0.5">
                Configure structural mounting and inverter sizing for your architecture.
              </p>
            </div>

            <div className="space-y-2.5">
              {PROPERTY_TIERS.map((tier) => {
                const Icon = tier.icon;
                const isSelected = selectedTier === tier.id;
                return (
                  <button
                    key={tier.id}
                    type="button"
                    onClick={() => setSelectedTier(tier.id)}
                    className={`w-full text-left p-3.5 rounded-[4px] border transition-all cursor-pointer flex items-start gap-3.5 ${
                      isSelected
                        ? "border-[#171A20] bg-[#F4F4F4]"
                        : "border-[#E3E4E6] hover:border-[#171A20]/40 bg-[#FFFFFF]"
                    }`}
                  >
                    <div className="p-2 rounded-[4px] bg-[#FFFFFF] border border-[#E3E4E6] text-[#171A20] shrink-0 mt-0.5">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-2">
                        <h4 className="text-[14px] font-medium text-[#171A20] truncate">
                          {tier.title}
                        </h4>
                        <span className="text-[12px] tabular-nums text-[#5C5E62] shrink-0">
                          {tier.capacity}
                        </span>
                      </div>
                      <p className="text-[12px] text-[#5C5E62] mt-1 leading-normal">{tier.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="h-10 px-6 rounded-[4px] bg-[#171A20] text-[#FFFFFF] text-[14px] font-medium hover:bg-[#171A20]/90 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span>Next: Usage & Savings</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Monthly Bill */}
        {step === 2 && (
          <div className="space-y-4 pt-2">
            <div>
              <h3 className="text-[14px] font-medium text-[#171A20]">
                2. Average Monthly Electricity Bill
              </h3>
              <p className="text-[12px] text-[#5C5E62] mt-0.5">
                Calibrate based on your typical monthly power bill.
              </p>
            </div>

            <div className="bg-[#F4F4F4] p-4 rounded-[4px] border border-[#E3E4E6] space-y-3">
              <div className="flex items-baseline justify-between">
                <span className="text-[13px] font-medium text-[#5C5E62]">Monthly Bill</span>
                <span className="text-[20px] font-semibold tabular-nums text-[#171A20]">
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
                aria-label="Monthly electricity bill"
              />
              <div className="flex justify-between text-[12px] text-[#5C5E62]">
                <span>₹3,000 / mo</span>
                <span>₹75,000+ / mo</span>
              </div>
            </div>

            {/* Numbers */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-[4px] border border-[#E3E4E6] bg-[#FFFFFF]">
                <span className="text-[12px] text-[#5C5E62] block">Recommended System</span>
                <span className="text-[18px] font-semibold text-[#171A20] tabular-nums">
                  {estimatedKw} kW
                </span>
              </div>
              <div className="p-3 rounded-[4px] border border-[#E3E4E6] bg-[#FFFFFF]">
                <span className="text-[12px] text-[#5C5E62] block">Surya Ghar Subsidy</span>
                <span className="text-[18px] font-semibold text-[#171A20] tabular-nums">
                  ₹{subsidyAmount.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-[4px] border border-[#E3E4E6] bg-[#FFFFFF] flex justify-between items-baseline">
              <span className="text-[12px] text-[#5C5E62]">Estimated Annual Savings</span>
              <span className="text-[16px] font-semibold text-[#171A20] tabular-nums">
                ₹{estimatedAnnualSavings.toLocaleString("en-IN")} / yr
              </span>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="h-10 px-4 rounded-[4px] text-[13px] font-medium text-[#5C5E62] hover:bg-[#F4F4F4] transition-colors flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="h-10 px-6 rounded-[4px] bg-[#171A20] text-[#FFFFFF] text-[14px] font-medium hover:bg-[#171A20]/90 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span>Next: Contact Details</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Contact Details */}
        {step === 3 && (
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div>
              <h3 className="text-[14px] font-medium text-[#171A20]">3. Contact Information</h3>
              <p className="text-[12px] text-[#5C5E62] mt-0.5">
                A solar engineer will review roof geometry and dispatch your custom 3D model.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="drawer-name"
                  className="block text-[11px] font-semibold text-[#171A20] uppercase tracking-[0.08em] mb-1.5"
                >
                  Full Name *
                </label>
                <input
                  id="drawer-name"
                  type="text"
                  required
                  placeholder="First and last name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-11 px-3.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-[6px] text-[14px] text-[#171A20] placeholder:text-[#9CA3AF] transition-colors focus:bg-[#FFFFFF] focus:border-[#171A20] focus:ring-1 focus:ring-[#171A20] focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="drawer-phone"
                  className="block text-[11px] font-semibold text-[#171A20] uppercase tracking-[0.08em] mb-1.5"
                >
                  Mobile Phone / WhatsApp (+91) *
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-[13px] font-medium text-[#5C5E62] select-none pointer-events-none border-r border-[#E5E7EB] pr-2.5">
                    +91
                  </span>
                  <input
                    id="drawer-phone"
                    type="tel"
                    required
                    placeholder="10-digit mobile number"
                    maxLength={14}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full h-11 pl-16 pr-3.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-[6px] text-[14px] text-[#171A20] placeholder:text-[#9CA3AF] transition-colors focus:bg-[#FFFFFF] focus:border-[#171A20] focus:ring-1 focus:ring-[#171A20] focus:outline-none tabular-nums"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label
                    htmlFor="drawer-city"
                    className="block text-[11px] font-semibold text-[#171A20] uppercase tracking-[0.08em] mb-1.5"
                  >
                    City / Locality *
                  </label>
                  <input
                    id="drawer-city"
                    type="text"
                    required
                    placeholder="e.g. Hyderabad, Bengaluru"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full h-11 px-3.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-[6px] text-[14px] text-[#171A20] placeholder:text-[#9CA3AF] transition-colors focus:bg-[#FFFFFF] focus:border-[#171A20] focus:ring-1 focus:ring-[#171A20] focus:outline-none"
                  />
                </div>
                <div>
                  <label
                    htmlFor="drawer-pincode"
                    className="block text-[11px] font-semibold text-[#171A20] uppercase tracking-[0.08em] mb-1.5"
                  >
                    6-Digit PIN Code *
                  </label>
                  <input
                    id="drawer-pincode"
                    type="text"
                    required
                    maxLength={6}
                    pattern="[1-9][0-9]{5}"
                    inputMode="numeric"
                    placeholder="e.g. 500033"
                    value={pinCode}
                    onChange={(e) => setPinCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    className="w-full h-11 px-3.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-[6px] text-[14px] text-[#171A20] placeholder:text-[#9CA3AF] transition-colors focus:bg-[#FFFFFF] focus:border-[#171A20] focus:ring-1 focus:ring-[#171A20] focus:outline-none tabular-nums"
                  />
                </div>
              </div>
              <p className="text-[11px] text-[#5C5E62]/80">
                PIN code determines local DISCOM net-metering feasibility and PM Surya Ghar
                clearance.
              </p>

              {/* Bot suppression honeypot */}
              <div
                style={{
                  position: "absolute",
                  left: "-9999px",
                  opacity: 0,
                  height: 0,
                  overflow: "hidden",
                }}
                aria-hidden="true"
              >
                <input
                  type="text"
                  name="hp_extra"
                  id="drawer-hp-extra"
                  tabIndex={-1}
                  autoComplete="off"
                  value={hpExtra}
                  onChange={(e) => setHpExtra(e.target.value)}
                />
              </div>

              {/* DPDP Consent */}
              <div className="p-3.5 rounded-[6px] bg-[#F9FAFB] border border-[#E5E7EB] flex items-start gap-3">
                <input
                  type="checkbox"
                  id="drawer-consent"
                  required
                  checked={consentGiven}
                  onChange={(e) => setConsentGiven(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded-[4px] border-[#CBD5E1] text-[#171A20] focus:ring-1 focus:ring-[#171A20] cursor-pointer shrink-0"
                />
                <label
                  htmlFor="drawer-consent"
                  className="text-[12px] text-[#5C5E62] leading-relaxed cursor-pointer select-none"
                >
                  I consent to receive my bespoke solar proposal and be contacted by WAVENOX
                  engineers in accordance with the <strong>DPDP Act 2023</strong>. Data is processed
                  solely for proposal generation and never shared. You may withdraw consent anytime
                  via our{" "}
                  <a href="/legal/privacy" className="underline hover:text-[#171A20]">
                    Privacy Policy
                  </a>
                  .
                </label>
              </div>

              {submitError && (
                <div className="p-3.5 rounded-[6px] bg-[#B42318]/10 border border-[#B42318]/30 text-[#B42318] text-[12px] flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}
            </div>

            <div className="pt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={isSubmitting}
                className="h-11 px-4 rounded-[4px] text-[13px] font-medium text-[#5C5E62] hover:bg-[#F4F4F4] transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !consentGiven}
                className="h-11 px-6 rounded-[6px] bg-[#171A20] text-[#FFFFFF] text-[14px] font-medium hover:bg-[#2B2F36] active:scale-[0.99] transition-all flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ShieldCheck className="w-4 h-4 text-[#F57C00]" />
                <span>{isSubmitting ? "Submitting..." : "Schedule Engineering Consultation"}</span>
              </button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
