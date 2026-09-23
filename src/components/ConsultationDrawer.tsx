import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Check,
  Building2,
  Home,
  Factory,
  ShieldAlert,
  Zap,
  TrendingUp,
  MessageSquare,
  CheckCircle2,
  Calendar,
} from "lucide-react";
import { BRAND_CONFIG } from "@/config/brand";
import { computeSolarYield, SOLAR_CONFIG } from "@/config/solar";

export const CONSULTATION_EVENT = "open-wavenox-consultation";

export function openConsultationDrawer(initialTier?: string) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent(CONSULTATION_EVENT, { detail: { tier: initialTier } })
    );
  }
}

const PROPERTY_TIERS = [
  {
    id: "villa",
    title: "Luxury Villa",
    capacity: "30kW – 50kW",
    desc: "Single-family ultra-luxury residences requiring monolithic aesthetic harmony and 100% grid independence.",
    icon: Home,
  },
  {
    id: "estate",
    title: "Private Estate / Farmhouse",
    capacity: "50kW – 120kW",
    desc: "Multi-acre private compounds, luxury retreats, and expansive rural estates with high inductive loads.",
    icon: Building2,
  },
  {
    id: "commercial",
    title: "Commercial & Industrial",
    capacity: "120kW – 500kW+",
    desc: "Corporate headquarters, manufacturing facilities, aviation hangars, and logistics mega-warehouses.",
    icon: Factory,
  },
  {
    id: "defense",
    title: "Defense & Critical Compound",
    capacity: "Custom Microgrid",
    desc: "EMP-shielded, ballistic-rated fortress microgrids with sub-0.1ms instant blackout islanding.",
    icon: ShieldAlert,
  },
];

export function ConsultationDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedTier, setSelectedTier] = useState("villa");
  const [roofSqft, setRoofSqft] = useState(8500);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("Hyderabad");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [referenceId, setReferenceId] = useState("");

  // Derived financial calculation
  const yieldMetrics = computeSolarYield(roofSqft);
  const lifetimeLakhs = (yieldMetrics.lifetimeInr / 100000).toFixed(1);

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

    // Initial check
    if (window.location.hash === "#consultation") {
      setIsOpen(true);
    }

    return () => {
      window.removeEventListener(CONSULTATION_EVENT, handleEvent);
      window.removeEventListener("hashchange", handleHash);
    };
  }, []);

  // Lock body scroll when drawer is open
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

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(() => {
      setStep(1);
      setIsSubmitted(false);
    }, 300);
  };

  const handleWhatsAppDispatch = () => {
    const tierObj = PROPERTY_TIERS.find((t) => t.id === selectedTier);
    const message = encodeURIComponent(
      `Hello ${BRAND_CONFIG.name},\n\nI would like to request an Architectural Solar Assessment for my property:\n\n` +
        `• Property Tier: ${tierObj?.title || selectedTier}\n` +
        `• Estimated Roof Area: ${roofSqft.toLocaleString("en-IN")} sq.ft\n` +
        `• Estimated Capacity: ${yieldMetrics.kw.toFixed(1)} kW\n` +
        `• Name: ${name || "Client"}\n` +
        `• City/Locality: ${city || "Hyderabad"}\n\n` +
        `Please connect me with your chief solar engineering advisory desk.`
    );
    window.open(`${BRAND_CONFIG.contact.whatsappLink}?text=${message}`, "_blank");
  };

  const handleFormalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ref = `WX-${Math.floor(100000 + Math.random() * 900000)}`;
    setReferenceId(ref);
    setIsSubmitted(true);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Slide-over Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 220 }}
            className="relative z-10 flex h-full w-full max-w-xl flex-col border-l border-white/10 bg-black/95 text-white shadow-2xl backdrop-blur-3xl"
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-5 lg:px-8">
              <div className="flex items-center gap-2.5">
                <span className="grid h-7 w-7 place-items-center rounded-lg border border-[#F57C00]/40 bg-[#F57C00]/10 text-[#F57C00]">
                  <Sparkles className="h-3.5 w-3.5" />
                </span>
                <div>
                  <h2 className="text-xs font-bold uppercase tracking-[0.25em] text-white">
                    Architectural Advisory
                  </h2>
                  <p className="text-[10px] text-white/50 tracking-wider">
                    Tier-1 Monolithic Solar Deployment
                  </p>
                </div>
              </div>

              <button
                aria-label="Close modal"
                onClick={handleClose}
                className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 text-white/70 transition-colors hover:border-white/30 hover:bg-white/5 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Stepper Progress Bar */}
            {!isSubmitted && (
              <div className="border-b border-white/5 bg-white/[0.02] px-6 py-3 lg:px-8">
                <div className="flex items-center justify-between">
                  {[
                    { n: 1, label: "Asset Tier" },
                    { n: 2, label: "Energy Metrics" },
                    { n: 3, label: "VIP Connect" },
                  ].map((s) => (
                    <div key={s.n} className="flex items-center gap-2">
                      <span
                        className={`grid h-5 w-5 place-items-center rounded-full text-[10px] font-bold ${
                          step === s.n
                            ? "bg-[#F57C00] text-black shadow-[0_0_10px_rgba(245,124,0,0.8)]"
                            : step > s.n
                            ? "bg-white/20 text-white"
                            : "bg-white/5 text-white/30"
                        }`}
                      >
                        {step > s.n ? "✓" : s.n}
                      </span>
                      <span
                        className={`text-[10px] font-semibold uppercase tracking-wider ${
                          step === s.n ? "text-white" : "text-white/40"
                        }`}
                      >
                        {s.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto px-6 py-6 lg:px-8">
              {isSubmitted ? (
                /* Success Dossier State */
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex h-full flex-col items-center justify-center text-center py-10"
                >
                  <div className="grid h-16 w-16 place-items-center rounded-full border border-[#F57C00]/40 bg-[#F57C00]/10 text-[#F57C00] shadow-[0_0_30px_rgba(245,124,0,0.4)]">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <h3 className="mt-6 text-xl font-bold uppercase tracking-tight text-white">
                    Assessment Dossier Queued
                  </h3>
                  <p className="mt-2 text-xs font-mono tracking-widest text-[#F5B366]">
                    REFERENCE: {referenceId}
                  </p>
                  <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/60">
                    Thank you, <span className="text-white font-semibold">{name || "Sir/Madam"}</span>. Our Chief Solar Engineering Desk in Hyderabad has received your architectural specifications for your {selectedTier.toUpperCase()} footprint.
                  </p>

                  <div className="mt-8 w-full max-w-sm rounded-xl border border-white/10 bg-white/[0.03] p-4 text-left">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-white/40">
                      Summary Projection
                    </p>
                    <div className="mt-3 flex justify-between text-xs py-1 border-b border-white/5">
                      <span className="text-white/60">Capacity:</span>
                      <span className="font-bold text-[#F57C00]">{yieldMetrics.kw.toFixed(1)} kW</span>
                    </div>
                    <div className="mt-2 flex justify-between text-xs py-1 border-b border-white/5">
                      <span className="text-white/60">25-Yr Value:</span>
                      <span className="font-bold text-white">₹{lifetimeLakhs} L</span>
                    </div>
                    <div className="mt-2 flex justify-between text-xs py-1">
                      <span className="text-white/60">Dispatch Priority:</span>
                      <span className="font-semibold text-emerald-400">Within 4 Hours</span>
                    </div>
                  </div>

                  <div className="mt-8 flex w-full max-w-sm flex-col gap-3">
                    <button
                      type="button"
                      onClick={handleWhatsAppDispatch}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FFB547] via-[#F57C00] to-[#E56A00] px-6 py-3.5 text-xs font-bold uppercase tracking-[0.2em] text-black shadow-[0_0_30px_-5px_rgba(245,124,0,0.8)]"
                    >
                      <MessageSquare className="h-4 w-4" />
                      Instant WhatsApp Connect
                    </button>
                    <button
                      type="button"
                      onClick={handleClose}
                      className="w-full rounded-xl border border-white/10 py-3 text-xs font-semibold uppercase tracking-wider text-white/60 hover:text-white"
                    >
                      Return to Architectural Gallery
                    </button>
                  </div>
                </motion.div>
              ) : (
                /* 3-Step Wizard */
                <div>
                  {/* Step 1: Property Tier */}
                  {step === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-4"
                    >
                      <div>
                        <h3 className="text-base font-bold uppercase tracking-wider text-white">
                          Select Architectural Asset Tier
                        </h3>
                        <p className="mt-1 text-xs text-white/60 leading-relaxed">
                          Choose the deployment category matching your physical structure.
                        </p>
                      </div>

                      <div className="mt-4 grid grid-cols-1 gap-3">
                        {PROPERTY_TIERS.map((tier) => {
                          const Icon = tier.icon;
                          const isSelected = selectedTier === tier.id;
                          return (
                            <div
                              key={tier.id}
                              onClick={() => setSelectedTier(tier.id)}
                              className={`group relative cursor-pointer rounded-xl border p-4.5 transition-all duration-300 ${
                                isSelected
                                  ? "border-[#F57C00] bg-[#F57C00]/[0.08] shadow-[0_0_30px_-10px_rgba(245,124,0,0.5)]"
                                  : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
                              }`}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                  <div
                                    className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg border ${
                                      isSelected
                                        ? "border-[#F57C00] bg-[#F57C00] text-black"
                                        : "border-white/10 bg-white/5 text-white/70"
                                    }`}
                                  >
                                    <Icon className="h-4.5 w-4.5" />
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-bold text-white tracking-wide">
                                      {tier.title}
                                    </h4>
                                    <span className="font-mono text-[10px] font-semibold tracking-wider text-[#F5B366]">
                                      {tier.capacity}
                                    </span>
                                  </div>
                                </div>

                                <div
                                  className={`grid h-5 w-5 place-items-center rounded-full border ${
                                    isSelected
                                      ? "border-[#F57C00] bg-[#F57C00] text-black"
                                      : "border-white/20"
                                  }`}
                                >
                                  {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                                </div>
                              </div>

                              <p className="mt-3 text-xs leading-relaxed text-white/50">
                                {tier.desc}
                              </p>
                            </div>
                          );
                        })}
                      </div>

                      <div className="pt-6">
                        <button
                          type="button"
                          onClick={() => setStep(2)}
                          className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-xs font-bold uppercase tracking-[0.2em] text-black transition-all hover:bg-[#F57C00] hover:text-black"
                        >
                          Configure Energy Metrics
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 2: Energy & Footprint */}
                  {step === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div>
                        <h3 className="text-base font-bold uppercase tracking-wider text-white">
                          Rooftop Footprint & Yield Sizing
                        </h3>
                        <p className="mt-1 text-xs text-white/60 leading-relaxed">
                          Slide to calibrate your architectural surface area.
                        </p>
                      </div>

                      {/* Area Slider */}
                      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
                        <div className="flex items-baseline justify-between">
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-white/40">
                            Available Roof Area
                          </span>
                          <span className="font-mono text-xl font-bold text-white">
                            {roofSqft.toLocaleString("en-IN")}{" "}
                            <span className="text-xs font-normal text-white/50">sq.ft</span>
                          </span>
                        </div>

                        <div className="mt-5">
                          <input
                            type="range"
                            min={1000}
                            max={50000}
                            step={250}
                            value={roofSqft}
                            onChange={(e) => setRoofSqft(parseInt(e.target.value, 10))}
                            className="wavenox-slider w-full"
                            style={{
                              background: `linear-gradient(to right, #F57C00 0%, #F57C00 ${
                                ((roofSqft - 1000) / (50000 - 1000)) * 100
                              }%, rgba(255,255,255,0.1) ${
                                ((roofSqft - 1000) / (50000 - 1000)) * 100
                              }%, rgba(255,255,255,0.1) 100%)`,
                            }}
                          />
                          <div className="mt-2 flex justify-between font-mono text-[9px] text-white/40">
                            <span>1,000 sq.ft</span>
                            <span>25,000 sq.ft</span>
                            <span>50,000+ sq.ft</span>
                          </div>
                        </div>
                      </div>

                      {/* Live Projections Preview */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                          <div className="flex items-center gap-1.5 text-[#F57C00]">
                            <Zap className="h-3.5 w-3.5" />
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-white/50">
                              System Power
                            </span>
                          </div>
                          <p className="mt-2 text-2xl font-bold text-white font-mono">
                            {yieldMetrics.kw.toFixed(1)}{" "}
                            <span className="text-xs font-medium text-white/40">kW</span>
                          </p>
                          <p className="mt-1 text-[10px] text-white/40">
                            ~{(yieldMetrics.annualKwh / 1000).toFixed(0)}k kWh / year
                          </p>
                        </div>

                        <div className="rounded-xl border border-[#F57C00]/30 bg-[#F57C00]/[0.06] p-4 shadow-[0_0_25px_-10px_rgba(245,124,0,0.5)]">
                          <div className="flex items-center gap-1.5 text-[#F5B366]">
                            <TrendingUp className="h-3.5 w-3.5" />
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#F5B366]">
                              25-Year Wealth
                            </span>
                          </div>
                          <p className="mt-2 text-2xl font-bold text-[#F57C00] font-mono">
                            ₹{lifetimeLakhs}{" "}
                            <span className="text-xs font-medium text-[#F5B366]">Lakhs</span>
                          </p>
                          <p className="mt-1 text-[10px] text-white/50">
                            Lifetime avoided grid tariffs
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-3 pt-4">
                        <button
                          type="button"
                          onClick={() => setStep(1)}
                          className="flex items-center justify-center gap-1.5 rounded-xl border border-white/10 px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-white/5"
                        >
                          <ChevronLeft className="h-4 w-4" />
                          Back
                        </button>
                        <button
                          type="button"
                          onClick={() => setStep(3)}
                          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-xs font-bold uppercase tracking-[0.2em] text-black transition-all hover:bg-[#F57C00] hover:text-black"
                        >
                          Finalize Advisory Request
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 3: Identity & Submit */}
                  {step === 3 && (
                    <motion.form
                      key="step3"
                      onSubmit={handleFormalSubmit}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-4"
                    >
                      <div>
                        <h3 className="text-base font-bold uppercase tracking-wider text-white">
                          Client Identification & Dispatch
                        </h3>
                        <p className="mt-1 text-xs text-white/60 leading-relaxed">
                          Your proposal dossier will be prepared by our senior engineering desk.
                        </p>
                      </div>

                      <div className="space-y-3.5 pt-2">
                        <div>
                          <label className="text-[10px] font-semibold uppercase tracking-wider text-white/50">
                            Full Name / Entity Name
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Dr. Rajesh Varma"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder-white/20 outline-none transition-colors focus:border-[#F57C00] focus:bg-white/[0.06]"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-semibold uppercase tracking-wider text-white/50">
                            WhatsApp / Mobile Number
                          </label>
                          <input
                            type="tel"
                            required
                            placeholder="e.g. +91 98765 43210"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder-white/20 outline-none transition-colors focus:border-[#F57C00] focus:bg-white/[0.06]"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-semibold uppercase tracking-wider text-white/50">
                            Project City / Locality
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Jubilee Hills, Hyderabad"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder-white/20 outline-none transition-colors focus:border-[#F57C00] focus:bg-white/[0.06]"
                          />
                        </div>
                      </div>

                      {/* Summary Capsule */}
                      <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.02] p-3 text-[11px] text-white/60">
                        Configured:{" "}
                        <span className="text-white font-semibold">{selectedTier.toUpperCase()}</span> ·{" "}
                        <span className="text-[#F57C00] font-semibold">
                          {roofSqft.toLocaleString("en-IN")} sq.ft
                        </span>{" "}
                        (~{yieldMetrics.kw.toFixed(1)} kW)
                      </div>

                      {/* Action buttons */}
                      <div className="space-y-2.5 pt-4">
                        <button
                          type="submit"
                          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FFB547] via-[#F57C00] to-[#E56A00] px-6 py-3.5 text-xs font-bold uppercase tracking-[0.2em] text-black shadow-[0_0_30px_-5px_rgba(245,124,0,0.8)] transition-all hover:scale-[1.01]"
                        >
                          Submit Formal Proposal Request
                        </button>

                        <button
                          type="button"
                          onClick={handleWhatsAppDispatch}
                          className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/[0.05] px-6 py-3 text-xs font-semibold uppercase tracking-wider text-white transition-all hover:border-emerald-500 hover:bg-emerald-500/10 hover:text-emerald-300"
                        >
                          <MessageSquare className="h-4 w-4 text-emerald-400" />
                          Connect Directly via VIP WhatsApp
                        </button>

                        <button
                          type="button"
                          onClick={() => setStep(2)}
                          className="w-full text-center text-[10px] font-semibold uppercase tracking-wider text-white/40 hover:text-white pt-1"
                        >
                          ← Modify Solar Capacity
                        </button>
                      </div>
                    </motion.form>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
