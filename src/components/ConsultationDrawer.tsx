import * as React from "react";
import { useNavigate } from "@tanstack/react-router";
import { ChevronRight, ChevronLeft, Building2, Home, Factory } from "lucide-react";
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
    capacity: "25 kW – 50 kW",
    desc: "Single-family residences requiring flush architectural mounting and 24/7 outage protection.",
    icon: Home,
  },
  {
    id: "independent_home" as const,
    title: "Independent Home / Penthouse",
    capacity: "10 kW – 25 kW",
    desc: "Terrace installations with elevated pergola structure and net-metering export.",
    icon: Building2,
  },
  {
    id: "commercial" as const,
    title: "Commercial & Industrial",
    capacity: "50 kW – 500 kW+",
    desc: "Commercial rooftops and factories with 40% Section 32 accelerated depreciation.",
    icon: Factory,
  },
];

export function ConsultationDrawer() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = React.useState(false);
  const [step, setStep] = React.useState<1 | 2 | 3>(1);
  const [selectedTier, setSelectedTier] = React.useState<"villa" | "independent_home" | "commercial">(
    "villa"
  );
  const [monthlyBill, setMonthlyBill] = React.useState(12000);
  const [name, setName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [city, setCity] = React.useState("Hyderabad");
  const [pinCode, setPinCode] = React.useState("");
  const [consentGiven, setConsentGiven] = React.useState(false);
  const [companyWebsite, setCompanyWebsite] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  const calculation = React.useMemo(
    () =>
      estimate({
        monthlyBillInr: monthlyBill,
        segment: selectedTier === "commercial" ? "commercial" : "residential",
      }),
    [monthlyBill, selectedTier]
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
              <h3 className="text-[14px] font-medium text-[#171A20]">
                1. Select Property Type
              </h3>
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
                      <p className="text-[12px] text-[#5C5E62] mt-1 leading-normal">
                        {tier.desc}
                      </p>
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
              <h3 className="text-[14px] font-medium text-[#171A20]">
                3. Contact Information
              </h3>
              <p className="text-[12px] text-[#5C5E62] mt-0.5">
                A solar engineer will review roof geometry and dispatch your custom 3D model.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[12px] font-medium text-[#5C5E62] mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Your Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-10 px-3 bg-[#FFFFFF] border border-[#E3E4E6] rounded-[4px] text-[14px] text-[#171A20] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#171A20]"
                />
              </div>

              <div>
                <label className="block text-[12px] font-medium text-[#5C5E62] mb-1">
                  Mobile Phone / WhatsApp (+91) *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full h-10 px-3 bg-[#FFFFFF] border border-[#E3E4E6] rounded-[4px] text-[14px] text-[#171A20] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#171A20]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] font-medium text-[#5C5E62] mb-1">City *</label>
                  <input
                    type="text"
                    required
                    placeholder="Hyderabad"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full h-10 px-3 bg-[#FFFFFF] border border-[#E3E4E6] rounded-[4px] text-[14px] text-[#171A20] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#171A20]"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-[#5C5E62] mb-1">PIN Code</label>
                  <input
                    type="text"
                    placeholder="500033"
                    maxLength={6}
                    value={pinCode}
                    onChange={(e) => setPinCode(e.target.value)}
                    className="w-full h-10 px-3 bg-[#FFFFFF] border border-[#E3E4E6] rounded-[4px] text-[14px] text-[#171A20] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#171A20]"
                  />
                </div>
              </div>

              {/* Bot suppression */}
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

              {/* DPDP Consent */}
              <div className="flex items-start gap-2.5 pt-1">
                <input
                  type="checkbox"
                  id="drawer-consent"
                  required
                  checked={consentGiven}
                  onChange={(e) => setConsentGiven(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded-[4px] border-[#E3E4E6] text-[#171A20] focus-visible:ring-2 focus-visible:ring-[#171A20] cursor-pointer"
                />
                <label htmlFor="drawer-consent" className="text-[12px] text-[#5C5E62] leading-normal cursor-pointer select-none">
                  I agree to receive my solar sizing proposal and be contacted by WAVENOX engineers under our DPDP Act 2023 privacy policy.
                </label>
              </div>

              {submitError && (
                <div className="p-3 rounded-[4px] bg-[#B42318]/10 border border-[#B42318]/30 text-[#B42318] text-[12px]">
                  {submitError}
                </div>
              )}
            </div>

            <div className="pt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={isSubmitting}
                className="h-10 px-4 rounded-[4px] text-[13px] font-medium text-[#5C5E62] hover:bg-[#F4F4F4] transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !consentGiven}
                className="h-10 px-6 rounded-[4px] bg-[#171A20] text-[#FFFFFF] text-[14px] font-medium hover:bg-[#171A20]/90 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
              >
                {isSubmitting ? "Submitting..." : "Schedule Consultation"}
              </button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
