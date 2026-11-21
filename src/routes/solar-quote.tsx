import * as React from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Phone,
  MessageSquare,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Sun,
  BatteryCharging,
  Building2,
} from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { Media, Faq, type FaqItem } from "@/components/system";
import { TurnstileWidget } from "@/components/TurnstileWidget";
import { BRAND_CONFIG } from "@/config/brand";
import { INDIAN_STATES_AND_UTS } from "@/config/business";
import { DISCOMS, DISCOM_REGION_GROUPS, estimate } from "@/config/solar";
import { media } from "@/config/media";
import { submitLead } from "@/functions/leads";
import { getStoredTelemetry } from "@/lib/telemetry";
import { trackContactClick, trackLeadConversion } from "@/lib/analytics";

export interface SolarQuoteSearch {
  state?: string;
  discom?: string;
  bill?: number;
  segment?: "independent_home" | "villa" | "commercial";
}

const QUOTE_FAQS: FaqItem[] = [
  {
    id: "quote-pan-india",
    question: "Which Indian states and DISCOMs do you serve?",
    answer:
      "WAVENOX supports rooftop solar feasibility, system design, and authorized installation coordination across all 28 Indian states and 8 Union Territories, covering major state DISCOMs including TGSPDCL, TGNPDCL, MSEDCL, BESCOM, UGVCL/PGVCL, JVVNL, UPPCL, KSEB, TANGEDCO, WBSEDCL, and BRPL.",
  },
  {
    id: "quote-subsidy",
    question: "How much PM Surya Ghar subsidy can my home receive?",
    answer:
      "Under MNRE guidelines, eligible residential grid-connected systems using DCR modules qualify for Central Financial Assistance of ₹30,000 per kW for the first 2 kW and ₹18,000 for the 3rd kW—up to a maximum of ₹78,000 for systems of 3 kW or larger, disbursed via DBT after DISCOM commissioning.",
  },
  {
    id: "quote-timeline",
    question: "What happens after I request my custom solar proposal?",
    answer:
      "A WAVENOX solar engineer contacts you to review your recent electricity bill and property layout, confirm state DISCOM feasibility, and share an indicative itemized quotation before scheduling any physical rooftop measurement.",
  },
  {
    id: "quote-pricing",
    question: "Is there any fee or obligation for receiving this proposal?",
    answer:
      "No. Your preliminary solar sizing, subsidy calculation, and DISCOM feasibility assessment are completely free and involve zero obligation. Final equipment costs are specified clearly on your formal project quotation prior to installation.",
  },
];

function resolveInitialDiscom(search: SolarQuoteSearch): string {
  if (search.discom && DISCOMS.some((d) => d.code === search.discom?.toUpperCase())) {
    return search.discom.toUpperCase();
  }
  if (search.state) {
    const normalized = search.state.trim().toLowerCase();
    const matchedState = INDIAN_STATES_AND_UTS.find(
      (s) => s.name.toLowerCase() === normalized || normalized.includes(s.name.toLowerCase()),
    );
    if (matchedState && DISCOMS.some((d) => d.code === matchedState.defaultDiscomCode)) {
      return matchedState.defaultDiscomCode;
    }
  }
  return DISCOMS[0]?.code || "TGSPDCL";
}

function formatInr(amount: number): string {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(Math.round(amount));
}

export const Route = createFileRoute("/solar-quote")({
  staticData: {
    headerTone: "solid" as const,
  },
  validateSearch: (search: Record<string, unknown>): SolarQuoteSearch => {
    const rawBill = Number(search.bill);
    const validBill =
      Number.isFinite(rawBill) && rawBill >= 2000 && rawBill <= 150000
        ? Math.round(rawBill)
        : undefined;
    const rawSeg = search.segment;
    const validSegment =
      rawSeg === "independent_home" || rawSeg === "villa" || rawSeg === "commercial"
        ? rawSeg
        : undefined;
    return {
      state: typeof search.state === "string" ? search.state : undefined,
      discom: typeof search.discom === "string" ? search.discom : undefined,
      bill: validBill,
      segment: validSegment,
    };
  },
  head: () => {
    const heroMedia = media["home-hero"];
    const ogImage = `${BRAND_CONFIG.domain}${heroMedia.src}`;
    return {
      meta: [
        { title: `Pan-India Rooftop Solar Quote & Subsidy Calculator — ${BRAND_CONFIG.name}` },
        {
          name: "description",
          content:
            "Get an instant Pan-India rooftop solar quote tailored to your state DISCOM and electricity bill. Check PM Surya Ghar DBT subsidies up to ₹78,000, payback, and 25-year savings across all 28 States & 8 UTs.",
        },
        {
          property: "og:title",
          content: `Pan-India Rooftop Solar Quote & Subsidy Calculator — ${BRAND_CONFIG.name}`,
        },
        {
          property: "og:description",
          content:
            "Calculate state DISCOM savings, PM Surya Ghar subsidies up to ₹78,000, and request your site-specific architectural solar quotation across India.",
        },
        { property: "og:image", content: ogImage },
        { property: "og:image:width", content: "1600" },
        { property: "og:image:height", content: "900" },
        { property: "og:url", content: `${BRAND_CONFIG.domain}/solar-quote` },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
        {
          name: "twitter:title",
          content: `Pan-India Rooftop Solar Quote — ${BRAND_CONFIG.name}`,
        },
        {
          name: "twitter:description",
          content:
            "Estimate solar capacity, state DISCOM savings, and central subsidies across all 28 States & 8 UTs.",
        },
        { name: "twitter:image", content: ogImage },
      ],
      links: [
        { rel: "canonical", href: `${BRAND_CONFIG.domain}/solar-quote` },
        ...(heroMedia.avif
          ? [
              {
                rel: "preload",
                as: "image",
                type: "image/avif",
                imageSrcSet: heroMedia.avif,
                imageSizes: "(max-width: 420px) 360px, (max-width: 1024px) 100vw, 560px",
                fetchPriority: "high" as const,
              },
            ]
          : heroMedia.webp
            ? [
                {
                  rel: "preload",
                  as: "image",
                  type: "image/webp",
                  imageSrcSet: heroMedia.webp,
                  imageSizes: "(max-width: 420px) 360px, (max-width: 1024px) 100vw, 560px",
                  fetchPriority: "high" as const,
                },
              ]
            : []),
      ],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: `${BRAND_CONFIG.domain}/` },
              {
                "@type": "ListItem",
                position: 2,
                name: "Quick Solar Quote",
                item: `${BRAND_CONFIG.domain}/solar-quote`,
              },
            ],
          }).replace(/</g, "\\u003c"),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: QUOTE_FAQS.map((q) => ({
              "@type": "Question",
              name: q.question,
              acceptedAnswer: {
                "@type": "Answer",
                text: q.answer,
              },
            })),
          }).replace(/</g, "\\u003c"),
        },
      ],
    };
  },
  component: SolarQuoteLandingPage,
});

function SolarQuoteLandingPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();

  const [discomCode, setDiscomCode] = React.useState<string>(() => resolveInitialDiscom(search));
  const [monthlyBill, setMonthlyBill] = React.useState<number>(() => search.bill ?? 10000);
  const [segment, setSegment] = React.useState<"independent_home" | "villa" | "commercial">(
    () => search.segment ?? "independent_home",
  );

  const [name, setName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [city, setCity] = React.useState(search.state || "");
  const [pinCode, setPinCode] = React.useState("");
  const [consentGiven, setConsentGiven] = React.useState(false);
  const [hpExtra, setHpExtra] = React.useState("");
  const [turnstileToken, setTurnstileToken] = React.useState<string | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  const estimation = React.useMemo(
    () =>
      estimate({
        monthlyBillInr: monthlyBill,
        discomCode,
        segment: segment === "commercial" ? "commercial" : "residential",
      }),
    [monthlyBill, discomCode, segment],
  );

  const selectedDiscomObj = React.useMemo(
    () => DISCOMS.find((d) => d.code === discomCode) || DISCOMS[0],
    [discomCode],
  );

  const handleSelectTier = (tier: "independent_home" | "villa" | "commercial") => {
    setSegment(tier);
    if (typeof document !== "undefined") {
      document.getElementById("quote-form-card")?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!name.trim()) {
      setSubmitError("Please enter your full name.");
      return;
    }

    const digits = phone.replace(/\D/g, "");
    const tenDigit = digits.length === 12 && digits.startsWith("91") ? digits.slice(2) : digits;
    if (!/^[6-9][0-9]{9}$/.test(tenDigit)) {
      setSubmitError("Please enter a valid 10-digit Indian mobile number (starting with 6–9).");
      return;
    }

    if (!city.trim()) {
      setSubmitError("Please enter your city or locality.");
      return;
    }

    const cleanPin = pinCode.trim();
    if (!/^[1-9][0-9]{5}$/.test(cleanPin)) {
      setSubmitError("Please enter a valid 6-digit Indian postal PIN code (e.g. 400001).");
      return;
    }

    if (!consentGiven) {
      setSubmitError("Please confirm your consent under the DPDP Act 2023 to proceed.");
      return;
    }

    setIsSubmitting(true);

    try {
      const telemetry = getStoredTelemetry();
      const res = await submitLead({
        data: {
          name: name.trim(),
          phone: tenDigit,
          city: city.trim(),
          pin_code: cleanPin,
          property_tier: segment,
          discom_code: discomCode,
          monthly_bill_inr: monthlyBill,
          system_kw: estimation.recommendedKw,
          battery_units: segment === "villa" ? 1 : 0,
          net_price_inr: estimation.netInr,
          source: "studio",
          notes: `[Landing Page: /solar-quote] State: ${selectedDiscomObj?.state || "India"} | DISCOM: ${discomCode} | Monthly Bill: ₹${formatInr(monthlyBill)} | Est. Size: ${estimation.recommendedKw} kW`,
          consent_given: true,
          consent_version: "2026-11-v2",
          consent_timestamp: new Date().toISOString(),
          turnstile_token: turnstileToken,
          hp_extra: hpExtra.trim() || undefined,
          ...telemetry,
        },
      });

      if (!res.success || !res.referenceCode) {
        setSubmitError(
          res.message || "Unable to submit your request right now. Please call or WhatsApp us.",
        );
        setIsSubmitting(false);
        return;
      }

      const isDemoResult = Boolean(res.isDemo);
      void trackLeadConversion({
        referenceCode: res.referenceCode,
        source: "solar_quote",
        propertyTier: segment,
        discomCode,
        valueInr: estimation.netInr,
        phone: tenDigit,
        isDemo: isDemoResult,
      });

      if (typeof window !== "undefined") {
        try {
          sessionStorage.setItem(
            "wavenox_last_submission",
            JSON.stringify({
              ref: res.referenceCode,
              referenceCode: res.referenceCode,
              isDemo: isDemoResult,
              mode: res.mode || (isDemoResult ? "demo" : "live"),
              source: "studio",
              timestamp: new Date().toISOString(),
            }),
          );
        } catch {
          // Ignore storage restrictions
        }
      }

      navigate({
        to: "/order/received",
        search: { ref: res.referenceCode },
      });
    } catch {
      setSubmitError("Network error while submitting request. Please reach us on WhatsApp.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#171A20] selection:bg-[#171A20] selection:text-[#FFFFFF] flex flex-col justify-between">
      {/* DISTRACTION-FREE TOP BAR (PAID ADS CONVERSION FOCUSED) */}
      <header className="sticky top-0 z-40 w-full bg-[#FFFFFF]/95 backdrop-blur-md border-b border-[#E3E4E6]">
        <div className="max-w-[1200px] mx-auto px-5 sm:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <BrandLogo size="sm" asLink className="text-[#171A20] shrink-0" />
            <span className="hidden md:inline-flex items-center px-2.5 py-1 rounded-[4px] bg-[#F4F4F4] text-[#5C5E62] text-[12px] font-medium truncate">
              Pan-India Solar Desk · 28 States &amp; 8 UTs
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <a
              href={`tel:${BRAND_CONFIG.contact.phone.dial}`}
              onClick={() => trackContactClick("phone", "solar_quote_header")}
              className="min-h-[44px] px-3 sm:px-4 rounded-[4px] border border-[#E3E4E6] bg-[#FFFFFF] hover:bg-[#F4F4F4] text-[#171A20] text-[13px] font-medium inline-flex items-center gap-2 transition-colors"
            >
              <Phone className="w-4 h-4 text-[#F57C00] shrink-0" aria-hidden="true" />
              <span className="hidden sm:inline">{BRAND_CONFIG.contact.phone.display}</span>
              <span className="sm:hidden">Call</span>
            </a>
            <a
              href={BRAND_CONFIG.contact.whatsapp.link}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackContactClick("whatsapp", "solar_quote_header")}
              className="min-h-[44px] px-3 sm:px-4 rounded-[4px] bg-[#171A20] hover:bg-[#2B2F36] text-[#FFFFFF] text-[13px] font-medium inline-flex items-center gap-2 transition-colors"
            >
              <MessageSquare className="w-4 h-4 text-[#F57C00] shrink-0" aria-hidden="true" />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* SECTION 1: HERO + INTERACTIVE QUOTE CALCULATOR & LEAD CAPTURE */}
        <section className="max-w-[1200px] mx-auto px-5 sm:px-8 pt-8 sm:pt-12 pb-16 sm:pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* LEFT: VALUE PROPOSITION + ARCHITECTURAL VISUAL + CORE SPECS */}
            <div className="lg:col-span-6 space-y-6">
              <div className="space-y-3">
                <span className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#5C5E62] block">
                  Pan-India Rooftop Solar · All 28 States &amp; 8 UTs
                </span>
                <h1 className="text-[32px] sm:text-[42px] lg:text-[46px] font-medium tracking-[-0.028em] leading-[1.08] text-[#171A20] text-balance">
                  Custom Solar Quote &amp; Subsidy Estimate in 60 Seconds
                </h1>
                <p className="text-[15px] sm:text-[17px] text-[#5C5E62] leading-relaxed">
                  Calculate indicative kW capacity, PM Surya Ghar DBT subsidy up to ₹78,000, and
                  state DISCOM payback for your home or commercial property across India.
                </p>
              </div>

              <div className="rounded-[8px] overflow-hidden border border-[#E3E4E6] bg-[#111215] aspect-[16/10]">
                <Media
                  media={media["home-hero"]}
                  priority={true}
                  preserveDesktopAspect={true}
                  fill={true}
                  className="w-full h-full object-cover"
                  sizes="(max-width: 420px) 360px, (max-width: 1024px) 100vw, 560px"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="p-3.5 rounded-[6px] bg-[#F4F4F4] border border-[#E3E4E6]">
                  <div className="text-[12px] text-[#5C5E62]">Module Tech</div>
                  <div className="text-[14px] sm:text-[15px] font-semibold text-[#171A20] mt-0.5">
                    580W TOPCon
                  </div>
                </div>
                <div className="p-3.5 rounded-[6px] bg-[#F4F4F4] border border-[#E3E4E6]">
                  <div className="text-[12px] text-[#5C5E62]">Govt Subsidy</div>
                  <div className="text-[14px] sm:text-[15px] font-semibold text-[#171A20] mt-0.5">
                    Up to ₹78,000
                  </div>
                </div>
                <div className="p-3.5 rounded-[6px] bg-[#F4F4F4] border border-[#E3E4E6]">
                  <div className="text-[12px] text-[#5C5E62]">OEM Output</div>
                  <div className="text-[14px] sm:text-[15px] font-semibold text-[#171A20] mt-0.5">
                    25-Yr Warranty
                  </div>
                </div>
              </div>

              <ul className="space-y-2 text-[13px] text-[#5C5E62]">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#171A20] shrink-0 mt-0.5" />
                  <span>
                    ALMM &amp; DCR compliant hardware for PM Surya Ghar subsidy eligibility
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#171A20] shrink-0 mt-0.5" />
                  <span>Non-penetrating terrace ballast or chemical anchor mounting (IS 875)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#171A20] shrink-0 mt-0.5" />
                  <span>DISCOM net-metering liaison across all Indian electricity boards</span>
                </li>
              </ul>
            </div>

            {/* RIGHT: LIVE CALCULATOR + CONVERSION FORM */}
            <div
              id="quote-form-card"
              className="lg:col-span-6 rounded-[8px] bg-[#F4F4F4] border border-[#E3E4E6] p-5 sm:p-7 space-y-6"
            >
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-[18px] sm:text-[20px] font-medium text-[#171A20]">
                    1. Customize Your Monthly Bill &amp; Utility
                  </h2>
                  <span className="text-[12px] font-medium px-2.5 py-0.5 rounded-[4px] bg-[#FFFFFF] border border-[#E3E4E6] text-[#171A20]">
                    {selectedDiscomObj?.state || "Pan-India"}
                  </span>
                </div>

                {/* Property Segment Selector */}
                <div
                  className="grid grid-cols-3 gap-2"
                  role="radiogroup"
                  aria-label="Property type"
                >
                  {(
                    [
                      { id: "independent_home", label: "Home Solar" },
                      { id: "villa", label: "Villa + Storage" },
                      { id: "commercial", label: "Commercial" },
                    ] as const
                  ).map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      role="radio"
                      aria-checked={segment === item.id}
                      onClick={() => setSegment(item.id)}
                      className={`min-h-[40px] px-2 py-1.5 rounded-[4px] border text-[12px] sm:text-[13px] font-medium transition-colors cursor-pointer ${
                        segment === item.id
                          ? "bg-[#171A20] text-[#FFFFFF] border-[#171A20]"
                          : "bg-[#FFFFFF] text-[#5C5E62] border-[#D0D2D6] hover:text-[#171A20]"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>

                {/* DISCOM Select */}
                <div>
                  <label
                    htmlFor="quote-discom"
                    className="block text-[12px] font-semibold uppercase tracking-[0.06em] text-[#5C5E62] mb-1.5"
                  >
                    State / Electricity Board (DISCOM)
                  </label>
                  <select
                    id="quote-discom"
                    value={discomCode}
                    onChange={(e) => setDiscomCode(e.target.value)}
                    className="w-full min-h-[44px] px-3.5 bg-[#FFFFFF] border border-[#D0D2D6] rounded-[4px] text-[14px] text-[#171A20] focus:border-[#171A20] focus:outline-none"
                  >
                    {DISCOM_REGION_GROUPS.map((group) => (
                      <optgroup key={group.label} label={group.label}>
                        {group.discoms.map((d) => (
                          <option key={d.code} value={d.code}>
                            {d.state} — {d.code}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>

                {/* Bill Slider */}
                <div className="space-y-2">
                  <div className="flex items-baseline justify-between">
                    <label
                      htmlFor="quote-bill-range"
                      className="text-[12px] font-semibold uppercase tracking-[0.06em] text-[#5C5E62]"
                    >
                      Avg. Monthly Electricity Bill
                    </label>
                    <span className="text-[22px] font-medium text-[#171A20] tabular-nums">
                      ₹{formatInr(monthlyBill)}
                    </span>
                  </div>
                  <input
                    id="quote-bill-range"
                    type="range"
                    min={2000}
                    max={50000}
                    step={500}
                    value={monthlyBill}
                    onChange={(e) => setMonthlyBill(Number(e.target.value))}
                    className="range-slider"
                    aria-valuetext={`₹${formatInr(monthlyBill)} per month`}
                  />
                  <div className="flex justify-between text-[12px] text-[#5C5E62] tabular-nums">
                    <span>₹2,000/mo</span>
                    <span>₹50,000/mo</span>
                  </div>
                </div>

                {/* Live Indicative Summary Strip */}
                <div className="grid grid-cols-3 gap-2.5 p-3.5 rounded-[6px] bg-[#FFFFFF] border border-[#E3E4E6]">
                  <div>
                    <div className="text-[12px] text-[#5C5E62]">Rec. Capacity</div>
                    <div className="text-[16px] sm:text-[18px] font-semibold text-[#171A20] tabular-nums">
                      {estimation.recommendedKw} kW
                    </div>
                  </div>
                  <div>
                    <div className="text-[12px] text-[#5C5E62]">
                      {segment === "commercial" ? "Tax Benefit" : "DBT Subsidy"}
                    </div>
                    <div className="text-[16px] sm:text-[18px] font-semibold text-[#171A20] tabular-nums">
                      {segment === "commercial"
                        ? "Sec 33 WDV"
                        : `₹${formatInr(estimation.subsidyInr)}`}
                    </div>
                  </div>
                  <div>
                    <div className="text-[12px] text-[#5C5E62]">Yr 1 Savings</div>
                    <div className="text-[16px] sm:text-[18px] font-semibold text-[#171A20] tabular-nums">
                      ₹{formatInr(estimation.annualSavingsInr)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Lead Form */}
              <form onSubmit={handleSubmit} className="space-y-4 pt-4 border-t border-[#E3E4E6]">
                <h2 className="text-[16px] sm:text-[18px] font-medium text-[#171A20]">
                  2. Get Your Free Site-Specific Proposal
                </h2>

                <div>
                  <label
                    htmlFor="quote-name"
                    className="block text-[12px] font-semibold uppercase tracking-[0.06em] text-[#171A20] mb-1.5"
                  >
                    Full Name *
                  </label>
                  <input
                    id="quote-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="First and last name"
                    className="w-full min-h-[44px] px-3.5 bg-[#FFFFFF] border border-[#D0D2D6] rounded-[4px] text-[14px] text-[#171A20] placeholder:text-[#8E9094] focus:border-[#171A20] focus:outline-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor="quote-phone"
                    className="block text-[12px] font-semibold uppercase tracking-[0.06em] text-[#171A20] mb-1.5"
                  >
                    Mobile Number / WhatsApp (+91) *
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3.5 text-[13px] font-medium text-[#5C5E62] select-none pointer-events-none border-r border-[#E3E4E6] pr-2.5">
                      +91
                    </span>
                    <input
                      id="quote-phone"
                      type="tel"
                      required
                      maxLength={14}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="10-digit mobile number"
                      className="w-full min-h-[44px] pl-16 pr-3.5 bg-[#FFFFFF] border border-[#D0D2D6] rounded-[4px] text-[14px] text-[#171A20] placeholder:text-[#8E9094] focus:border-[#171A20] focus:outline-none tabular-nums"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="quote-city"
                      className="block text-[12px] font-semibold uppercase tracking-[0.06em] text-[#171A20] mb-1.5"
                    >
                      City / Locality *
                    </label>
                    <input
                      id="quote-city"
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Pune, Ahmedabad, Bengaluru"
                      className="w-full min-h-[44px] px-3.5 bg-[#FFFFFF] border border-[#D0D2D6] rounded-[4px] text-[14px] text-[#171A20] placeholder:text-[#8E9094] focus:border-[#171A20] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="quote-pin"
                      className="block text-[12px] font-semibold uppercase tracking-[0.06em] text-[#171A20] mb-1.5"
                    >
                      6-Digit PIN Code *
                    </label>
                    <input
                      id="quote-pin"
                      type="text"
                      required
                      maxLength={6}
                      pattern="[1-9][0-9]{5}"
                      inputMode="numeric"
                      value={pinCode}
                      onChange={(e) => setPinCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      placeholder="e.g. 400001"
                      className="w-full min-h-[44px] px-3.5 bg-[#FFFFFF] border border-[#D0D2D6] rounded-[4px] text-[14px] text-[#171A20] placeholder:text-[#8E9094] focus:border-[#171A20] focus:outline-none tabular-nums"
                    />
                  </div>
                </div>

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
                    id="quote-hp-extra"
                    tabIndex={-1}
                    autoComplete="off"
                    value={hpExtra}
                    onChange={(e) => setHpExtra(e.target.value)}
                  />
                </div>

                <div className="p-3 rounded-[4px] bg-[#FFFFFF] border border-[#E3E4E6] flex items-start gap-2.5">
                  <input
                    id="quote-consent"
                    type="checkbox"
                    required
                    checked={consentGiven}
                    onChange={(e) => setConsentGiven(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded-[4px] border-[#CBD5E1] text-[#171A20] focus:ring-[#171A20] cursor-pointer shrink-0"
                  />
                  <label
                    htmlFor="quote-consent"
                    className="text-[12px] text-[#5C5E62] leading-relaxed cursor-pointer"
                  >
                    I consent to {BRAND_CONFIG.name} contacting me regarding my solar quote under
                    the <strong>DPDP Act 2023</strong>. Details may be shared only with authorized
                    regional partners and utility desks for feasibility. See{" "}
                    <Link to="/legal/privacy" className="underline hover:text-[#171A20]">
                      Privacy Policy
                    </Link>
                    .
                  </label>
                </div>

                <TurnstileWidget onToken={setTurnstileToken} />

                {submitError && (
                  <div
                    role="alert"
                    className="p-3 rounded-[4px] bg-[#B42318]/10 border border-[#B42318]/30 text-[#B42318] text-[13px] flex items-center gap-2"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{submitError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full min-h-[48px] px-5 rounded-[4px] bg-[#171A20] hover:bg-[#2B2F36] text-[#FFFFFF] text-[14px] font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <ShieldCheck className="w-4 h-4 text-[#F57C00]" aria-hidden="true" />
                  <span>
                    {isSubmitting ? "Preparing Quote..." : "Get My Custom Solar Proposal"}
                  </span>
                </button>

                <div className="text-center pt-1">
                  <a
                    href={BRAND_CONFIG.contact.whatsapp.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackContactClick("whatsapp", "solar_quote_form")}
                    className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#5C5E62] hover:text-[#171A20] transition-colors"
                  >
                    <MessageSquare className="w-4 h-4 text-[#F57C00]" aria-hidden="true" />
                    <span>Or share your electricity bill directly on WhatsApp →</span>
                  </a>
                </div>
              </form>
            </div>
          </div>
        </section>

        {/* SECTION 2: THREE SYSTEM CONFIGURATIONS */}
        <section className="w-full bg-[#F4F4F4] border-y border-[#E3E4E6] py-16">
          <div className="max-w-[1200px] mx-auto px-5 sm:px-8 space-y-8">
            <div className="max-w-xl space-y-2">
              <h2 className="text-[24px] sm:text-[32px] font-medium tracking-tight text-[#171A20]">
                Systems Engineered for Every Indian Rooftop
              </h2>
              <p className="text-[14px] sm:text-[15px] text-[#5C5E62]">
                Select the architecture matching your home loads or business tariff profile.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-[8px] bg-[#FFFFFF] border border-[#E3E4E6] flex flex-col justify-between gap-5">
                <div className="space-y-2.5">
                  <Sun className="w-5 h-5 text-[#F57C00]" />
                  <h3 className="text-[18px] font-medium text-[#171A20]">
                    Grid-Tied Home Solar (3–10 kW)
                  </h3>
                  <p className="text-[13px] text-[#5C5E62] leading-relaxed">
                    Designed for maximum monthly electricity bill reduction and direct PM Surya Ghar
                    subsidy eligibility up to ₹78,000.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleSelectTier("independent_home")}
                  className="text-left text-[13px] font-medium text-[#171A20] hover:underline cursor-pointer"
                >
                  Select Home Solar →
                </button>
              </div>

              <div className="p-6 rounded-[8px] bg-[#FFFFFF] border border-[#E3E4E6] flex flex-col justify-between gap-5">
                <div className="space-y-2.5">
                  <BatteryCharging className="w-5 h-5 text-[#F57C00]" />
                  <h3 className="text-[18px] font-medium text-[#171A20]">
                    Solar + Omnigrid LFP Backup (5–25 kW)
                  </h3>
                  <p className="text-[13px] text-[#5C5E62] leading-relaxed">
                    Modular 14.3 kWh LiFePO4 battery storage with sub-20ms switchover to run HVAC
                    and home appliances when the grid drops.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleSelectTier("villa")}
                  className="text-left text-[13px] font-medium text-[#171A20] hover:underline cursor-pointer"
                >
                  Select Villa + Storage →
                </button>
              </div>

              <div className="p-6 rounded-[8px] bg-[#FFFFFF] border border-[#E3E4E6] flex flex-col justify-between gap-5">
                <div className="space-y-2.5">
                  <Building2 className="w-5 h-5 text-[#F57C00]" />
                  <h3 className="text-[18px] font-medium text-[#171A20]">
                    Commercial &amp; Industrial (25–500 kW+)
                  </h3>
                  <p className="text-[13px] text-[#5C5E62] leading-relaxed">
                    Offset high commercial DISCOM daytime tariffs with indicative Section 33 WDV
                    depreciation tax-shield modeling.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleSelectTier("commercial")}
                  className="text-left text-[13px] font-medium text-[#171A20] hover:underline cursor-pointer"
                >
                  Select Commercial →
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: 3-STEP TRANSPARENT PROCESS */}
        <section className="max-w-[1200px] mx-auto px-5 sm:px-8 py-16">
          <div className="max-w-xl mb-8">
            <h2 className="text-[24px] sm:text-[32px] font-medium tracking-tight text-[#171A20]">
              From Quote to Synchronized Generation
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                num: "01",
                title: "Bill & Utility Verification",
                desc: "We validate your sanctioned load, tariff slab, and PM Surya Ghar / state net-metering rules before site dispatch.",
              },
              {
                num: "02",
                title: "Terrace Layout & Structural Spec",
                desc: "Authorized regional engineers inspect parapet clearances, shading geometry, and IS 875 mounting strategy.",
              },
              {
                num: "03",
                title: "Commissioning & Net-Meter Sync",
                desc: "DCR TOPCon array installation, bi-directional DISCOM inspection, and National Portal DBT subsidy tracking.",
              },
            ].map((step) => (
              <div
                key={step.num}
                className="p-6 rounded-[8px] bg-[#FFFFFF] border border-[#E3E4E6] space-y-2"
              >
                <span className="text-[12px] font-mono font-semibold text-[#5C5E62]">
                  STEP {step.num}
                </span>
                <h3 className="text-[17px] font-medium text-[#171A20]">{step.title}</h3>
                <p className="text-[13px] text-[#5C5E62] leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 4: FOCUSED FAQ (SYNCED WITH JSON-LD) */}
        <section className="max-w-[960px] mx-auto px-5 sm:px-8 pb-20 space-y-6">
          <h2 className="text-[24px] sm:text-[32px] font-medium tracking-tight text-[#171A20]">
            Frequently Asked Questions
          </h2>
          <Faq items={QUOTE_FAQS} defaultValue={QUOTE_FAQS[0].id} />
        </section>
      </main>

      {/* MINIMAL COMPLIANCE FOOTER */}
      <footer className="w-full bg-[#FFFFFF] border-t border-[#E3E4E6] py-8">
        <div className="max-w-[1200px] mx-auto px-5 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[12px] text-[#5C5E62]">
          <div>
            © {new Date().getFullYear()} {BRAND_CONFIG.legalName} · Pan-India Solar Advisory
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href={`tel:${BRAND_CONFIG.contact.phone.dial}`}
              onClick={() => trackContactClick("phone", "solar_quote_footer")}
              className="hover:text-[#171A20] transition-colors"
            >
              {BRAND_CONFIG.contact.phone.display}
            </a>
            <span aria-hidden="true">·</span>
            <Link to="/legal/privacy" className="hover:text-[#171A20] transition-colors">
              Privacy
            </Link>
            <span aria-hidden="true">·</span>
            <Link to="/legal/terms" className="hover:text-[#171A20] transition-colors">
              Terms
            </Link>
            <span aria-hidden="true">·</span>
            <Link to="/legal/disclosures" className="hover:text-[#171A20] transition-colors">
              Disclosures
            </Link>
            <span aria-hidden="true">·</span>
            <Link
              to="/"
              className="hover:text-[#171A20] transition-colors font-medium text-[#171A20]"
            >
              Explore Full Site →
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
