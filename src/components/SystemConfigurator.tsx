import * as React from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  Plus,
  Minus,
  ShieldCheck,
  AlertCircle,
  MessageSquare,
  CheckCircle2,
  FileText,
  Ruler,
  Sparkles,
  RotateCcw,
  BatteryCharging,
  SlidersHorizontal,
} from "lucide-react";
import { BRAND_CONFIG } from "@/config/brand";
import { DISCOMS, SOLAR_ASSUMPTIONS, SYSTEM_TIERS } from "@/config/solar";
import { PRODUCTS_CONFIG } from "@/config/products";
import {
  BACKUP_PRIORITY_OPTIONS,
  buildSolarRecommendation,
  type BackupPriorityId,
} from "@/config/recommendation";
import { submitLead } from "@/functions/leads";
import { getStoredTelemetry } from "@/lib/telemetry";
import { Media, StatRow } from "@/components/system";
import { media } from "@/config/media";
import { ArchitecturalDossierModal, type DossierData } from "./ArchitecturalDossierModal";
import { WealthCurveVisualizer } from "./WealthCurveVisualizer";
import { BillDecoder } from "./BillDecoder";
import { BillIntelligence } from "./BillIntelligence";
import type { ConfirmedBillInputs } from "@/lib/bill-intelligence";
import { MonthlyGenerationChart } from "./MonthlyGenerationChart";
import { RoofSketcher } from "./RoofSketcher";
import { BatteryHonestyAdvisor } from "./BatteryHonestyAdvisor";
import { SourcePopover } from "./SourcePopover";

export interface SystemConfiguratorProps {
  initialBill?: number;
  initialDiscom?: string;
}

const ROOF_PROFILES = [
  {
    id: "rcc-flat",
    label: "RCC Flat Slab",
    desc: "Non-penetrative elevated structural ballast frame.",
  },
  { id: "sloped-tile", label: "Sloped Tile", desc: "Concealed interlocking stainless brackets." },
  { id: "standing-seam", label: "Standing-Seam", desc: "Zero-penetration mechanical seam clamps." },
];

const BILL_PRESETS = [8000, 15000, 25000, 50000];

function sanitizeBillInput(val?: number): number {
  if (typeof val === "number" && Number.isFinite(val) && val > 0) {
    return Math.min(200000, Math.max(1000, Math.round(val)));
  }
  return 12000;
}

function formatInr(val: number): string {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(val);
}

export function SystemConfigurator({ initialBill, initialDiscom }: SystemConfiguratorProps) {
  const navigate = useNavigate();

  const maxResidentialPanels = Math.ceil(
    (SOLAR_ASSUMPTIONS.maxResidentialKw * 1000) / SOLAR_ASSUMPTIONS.panelWatt,
  );

  const safeInitialBill = sanitizeBillInput(initialBill);
  const safeInitialDiscom = initialDiscom?.trim() || DISCOMS[0].code;

  // Stage 1: Property & Consumption State
  const [address, setAddress] = React.useState("");
  const [selectedDiscomCode, setSelectedDiscomCode] = React.useState(safeInitialDiscom);
  const [monthlyBill, setMonthlyBill] = React.useState(safeInitialBill);
  const [confirmedBillBasis, setConfirmedBillBasis] = React.useState("");
  const [inputMode, setInputMode] = React.useState<"estimate" | "known">("estimate");
  const [customMonthlyUnitsStr, setCustomMonthlyUnitsStr] = React.useState("");
  const [customSanctionedLoadStr, setCustomSanctionedLoadStr] = React.useState("");
  const [sanctionedLoadConfirmed, setSanctionedLoadConfirmed] = React.useState(false);

  // Stage 2 & 3: Sizing, Manual Override & Roof State
  const [panelCount, setPanelCount] = React.useState(() => {
    const initialRec = buildSolarRecommendation({
      monthlyBillInr: safeInitialBill,
      discomCode: safeInitialDiscom,
    });
    return Math.min(maxResidentialPanels, initialRec.recommendedPanels);
  });
  const [isManualPanelOverride, setIsManualPanelOverride] = React.useState(false);
  const [showOverrideChoicePrompt, setShowOverrideChoicePrompt] = React.useState(false);
  const [roofProfile, setRoofProfile] = React.useState("rcc-flat");
  const [showRoofSketcher, setShowRoofSketcher] = React.useState(false);
  const [sketchedRoofSqft, setSketchedRoofSqft] = React.useState<number | undefined>(undefined);
  const [knownRoofSqftStr, setKnownRoofSqftStr] = React.useState("");

  // Stage 4: Battery Storage State
  const [selectedBatteryUnits, setSelectedBatteryUnits] = React.useState(0);
  const [backupPriority, setBackupPriority] =
    React.useState<BackupPriorityId>("kitchen-refrigeration");
  const [showBatteryAdvisor, setShowBatteryAdvisor] = React.useState(false);

  // Stage 5: Payment Mode & Showroom View
  const [paymentMode, setPaymentMode] = React.useState<"cash" | "loan">("loan");
  const [estateView, setEstateView] = React.useState<"villa" | "estate">("villa");

  // Stage 6: Lead Form & Proposal Preview State
  const [userName, setUserName] = React.useState("");
  const [userPhone, setUserPhone] = React.useState("");
  const [pinCode, setPinCode] = React.useState("");
  const [consentGiven, setConsentGiven] = React.useState(false);
  const [hpExtra, setHpExtra] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [previewDossierOpen, setPreviewDossierOpen] = React.useState(false);

  // Keep state synchronized when URL search params change via SPA navigation
  React.useEffect(() => {
    if (initialBill !== undefined || initialDiscom !== undefined) {
      setConfirmedBillBasis("");
      const nextBill = sanitizeBillInput(initialBill);
      const nextDiscom = initialDiscom?.trim() || DISCOMS[0].code;
      setMonthlyBill(nextBill);
      setSelectedDiscomCode(nextDiscom);
      const nextRec = buildSolarRecommendation({
        monthlyBillInr: nextBill,
        discomCode: nextDiscom,
      });
      setPanelCount(Math.min(maxResidentialPanels, nextRec.recommendedPanels));
      setIsManualPanelOverride(false);
      setShowOverrideChoicePrompt(false);
    }
  }, [initialBill, initialDiscom, maxResidentialPanels]);

  const parsedMonthlyUnitsOverride = React.useMemo(() => {
    if (inputMode !== "known" || !customMonthlyUnitsStr.trim()) return undefined;
    const val = Number(customMonthlyUnitsStr);
    return Number.isFinite(val) && val >= 0 ? Math.round(val) : undefined;
  }, [inputMode, customMonthlyUnitsStr]);

  const parsedSanctionedLoadKw = React.useMemo(() => {
    if (inputMode !== "known" || !customSanctionedLoadStr.trim()) return undefined;
    const val = Number(customSanctionedLoadStr);
    return Number.isFinite(val) && val > 0 ? Number(val.toFixed(2)) : undefined;
  }, [inputMode, customSanctionedLoadStr]);

  const effectiveRoofSqft = React.useMemo(() => {
    if (sketchedRoofSqft !== undefined) return sketchedRoofSqft;
    if (inputMode === "known" && knownRoofSqftStr.trim() !== "") {
      const val = Number(knownRoofSqftStr);
      if (Number.isFinite(val) && val >= 0) return Math.round(val);
    }
    return undefined;
  }, [sketchedRoofSqft, inputMode, knownRoofSqftStr]);

  // Unified Step 4 Recommendation & Step 3 Calculation Engine
  const recommendation = React.useMemo(() => {
    return buildSolarRecommendation({
      discomCode: selectedDiscomCode,
      monthlyBillInr: monthlyBill,
      inputMode,
      monthlyUnitsOverride: parsedMonthlyUnitsOverride,
      availableRoofSqft: effectiveRoofSqft,
      sanctionedLoadKw: parsedSanctionedLoadKw,
      sanctionedLoadConfirmed: Boolean(parsedSanctionedLoadKw && sanctionedLoadConfirmed),
      selectedPanels: panelCount,
      isManualPanelOverride,
      selectedBatteryUnits,
      backupPriority,
      paymentMode,
    });
  }, [
    selectedDiscomCode,
    monthlyBill,
    inputMode,
    parsedMonthlyUnitsOverride,
    effectiveRoofSqft,
    parsedSanctionedLoadKw,
    sanctionedLoadConfirmed,
    panelCount,
    isManualPanelOverride,
    selectedBatteryUnits,
    backupPriority,
    paymentMode,
  ]);

  const calculation = recommendation.estimateResult;
  const discom = recommendation.discom;
  const isUnavailable = calculation.status === "UNAVAILABLE";
  const isKnownDiscom = React.useMemo(
    () => DISCOMS.some((d) => d.code === selectedDiscomCode),
    [selectedDiscomCode],
  );

  const systemKw = calculation.systemKw;
  const annualKwh = calculation.annualGenKwh;
  const subsidyInr = calculation.subsidyInr;
  const netPayableInr = calculation.netInr;
  const totalGrossInr = calculation.grossInr;
  const monthlyEmiInr = calculation.monthlyEmiInr;
  const activeTwentyFiveYearWealthInr =
    paymentMode === "loan" ? calculation.financedNetGain25YearsInr : calculation.netGain25YearsInr;
  const twentyFiveYearWealthInr = calculation.netGain25YearsInr;
  const twentyFiveYearLakhs = (activeTwentyFiveYearWealthInr / 100000).toFixed(1);

  const battery = recommendation.batteryGuidance.selectedOption;
  const activeRoofProfileObj = ROOF_PROFILES.find((p) => p.id === roofProfile) ?? ROOF_PROFILES[0];

  // Panel adjustment (marks selection as Customer Selected)
  const handlePanelIncrement = (amount: number) => {
    setIsManualPanelOverride(true);
    setShowOverrideChoicePrompt(false);
    setPanelCount((prev) => Math.min(maxResidentialPanels, Math.max(6, prev + amount)));
  };

  const handleSelectTier = (tierPanels: number) => {
    setIsManualPanelOverride(true);
    setShowOverrideChoicePrompt(false);
    setPanelCount(tierPanels);
  };

  const handleApplyRecommendation = (targetPanels?: number) => {
    const nextPanels = Math.min(
      maxResidentialPanels,
      targetPanels ?? recommendation.recommendedPanels,
    );
    setPanelCount(nextPanels);
    setIsManualPanelOverride(false);
    setShowOverrideChoicePrompt(false);
  };

  const handleConfirmedBill = (data: ConfirmedBillInputs) => {
    // Preserve stored precision inputs even when the customer temporarily selected estimate mode.
    const previousUnits = Number(customMonthlyUnitsStr);
    const previousLoad = Number(customSanctionedLoadStr);
    const units =
      data.monthlyUnitsOverride ??
      (customMonthlyUnitsStr.trim() && Number.isFinite(previousUnits) && previousUnits >= 0
        ? previousUnits
        : undefined);
    const load =
      data.sanctionedLoadKw ??
      (customSanctionedLoadStr.trim() && Number.isFinite(previousLoad) && previousLoad > 0
        ? previousLoad
        : undefined);
    const loadConfirmed =
      data.sanctionedLoadKw !== undefined ? data.sanctionedLoadConfirmed : sanctionedLoadConfirmed;
    setMonthlyBill(data.monthlyBillInr);
    setSelectedDiscomCode(data.discomCode);
    setInputMode("known");
    if (data.monthlyUnitsOverride !== undefined)
      setCustomMonthlyUnitsStr(String(data.monthlyUnitsOverride));
    if (data.sanctionedLoadKw !== undefined) {
      setCustomSanctionedLoadStr(String(data.sanctionedLoadKw));
      setSanctionedLoadConfirmed(data.sanctionedLoadConfirmed);
    }
    setConfirmedBillBasis(
      data.basis +
        (data.monthlyUnitsOverride === undefined && units !== undefined
          ? " Your existing consumption override was retained."
          : "") +
        (data.sanctionedLoadKw === undefined && load !== undefined
          ? " Your existing sanctioned-load input was retained."
          : ""),
    );
    const next = buildSolarRecommendation({
      ...data,
      inputMode: "known",
      monthlyUnitsOverride: units,
      sanctionedLoadKw: load,
      sanctionedLoadConfirmed: loadConfirmed,
    });
    if (!isManualPanelOverride)
      setPanelCount(Math.min(maxResidentialPanels, next.recommendedPanels));
    else setShowOverrideChoicePrompt(panelCount !== next.recommendedPanels);
  };

  const handleBillChange = (val: number) => {
    setConfirmedBillBasis("");
    const safeVal = sanitizeBillInput(val);
    setMonthlyBill(safeVal);
    const nextRec = buildSolarRecommendation({
      monthlyBillInr: safeVal,
      discomCode: selectedDiscomCode,
      inputMode,
      monthlyUnitsOverride: parsedMonthlyUnitsOverride,
      sanctionedLoadKw: parsedSanctionedLoadKw,
      sanctionedLoadConfirmed: Boolean(parsedSanctionedLoadKw && sanctionedLoadConfirmed),
    });
    const nextRecommendedPanels = Math.min(maxResidentialPanels, nextRec.recommendedPanels);
    if (!isManualPanelOverride) {
      setPanelCount(nextRecommendedPanels);
      setShowOverrideChoicePrompt(false);
    } else if (panelCount !== nextRecommendedPanels) {
      // Preserve customer's custom panel count and offer explicit choice
      setShowOverrideChoicePrompt(true);
    }
  };

  const handleDiscomChange = (newDiscomCode: string) => {
    setConfirmedBillBasis("");
    setSelectedDiscomCode(newDiscomCode);
    const nextRec = buildSolarRecommendation({
      monthlyBillInr: monthlyBill,
      discomCode: newDiscomCode,
      inputMode,
      monthlyUnitsOverride: parsedMonthlyUnitsOverride,
      sanctionedLoadKw: parsedSanctionedLoadKw,
      sanctionedLoadConfirmed: Boolean(parsedSanctionedLoadKw && sanctionedLoadConfirmed),
    });
    const nextRecommendedPanels = Math.min(maxResidentialPanels, nextRec.recommendedPanels);
    if (!isManualPanelOverride) {
      setPanelCount(nextRecommendedPanels);
      setShowOverrideChoicePrompt(false);
    } else if (panelCount !== nextRecommendedPanels) {
      // Preserve customer's custom panel count and offer explicit choice
      setShowOverrideChoicePrompt(true);
    }
  };

  const currentDossierData: DossierData = React.useMemo(
    () => ({
      refCode: "WNX-PREVIEW",
      clientName: userName || "Prospective Homeowner",
      phone: userPhone,
      address: address || "Site Assessment Required",
      pinCode: pinCode || "Pending Verification",
      discomCode: discom.code,
      discomName: discom.name,
      jurisdictionStatus: calculation.status,
      authorityLabel: discom.authority,
      recommendedKw: recommendation.recommendedCapacityKw,
      recommendedPanels: recommendation.recommendedPanels,
      isCustomPanelSelection: recommendation.isCustomPanelSelection,
      systemKw: systemKw,
      panelCount: panelCount,
      batteryUnits: selectedBatteryUnits,
      batteryKwh: selectedBatteryUnits * SOLAR_ASSUMPTIONS.battery.unitCapacityKwh,
      monthlyBill: monthlyBill,
      monthlyUnits: calculation.monthlyUnits,
      grossCapex: totalGrossInr,
      subsidyInr: subsidyInr,
      netPayable: netPayableInr,
      paymentMode,
      monthlyEmi: monthlyEmiInr,
      initialMonthlyEmi: calculation.financing.initialMonthlyEmiInr,
      customerDownPayment: calculation.financing.customerDownPaymentInr,
      loanInterestRatePct: calculation.financing.annualInterestRatePct,
      loanTierLabel: calculation.financing.tierLabel,
      isLoanSchemeEligible: calculation.financing.isSchemeEligible,
      paybackYears:
        paymentMode === "loan" ? calculation.financedPaybackYears : calculation.paybackYears,
      annualSavings: calculation.annualSavingsInr,
      twentyFiveYearSavings: activeTwentyFiveYearWealthInr,
      annualGenKwh: annualKwh,
      tariffInrPerKwh: calculation.assumptions.tariffInrPerKwh,
      roofProfileLabel: activeRoofProfileObj.label,
      roofStatusLabel: recommendation.roofFeasibility.statusLabel,
      roofWarning: recommendation.roofFeasibility.warning,
      sanctionedLoadStatusLabel: recommendation.sanctionedLoadFeasibility.statusLabel,
      sanctionedLoadWarning: recommendation.sanctionedLoadFeasibility.warning,
      projection: paymentMode === "loan" ? calculation.financedProjection : calculation.projection,
    }),
    [
      userName,
      userPhone,
      address,
      pinCode,
      discom.code,
      discom.name,
      discom.authority,
      calculation.status,
      recommendation.recommendedCapacityKw,
      recommendation.recommendedPanels,
      recommendation.isCustomPanelSelection,
      recommendation.roofFeasibility.statusLabel,
      recommendation.roofFeasibility.warning,
      recommendation.sanctionedLoadFeasibility.statusLabel,
      recommendation.sanctionedLoadFeasibility.warning,
      systemKw,
      panelCount,
      selectedBatteryUnits,
      monthlyBill,
      calculation.monthlyUnits,
      totalGrossInr,
      subsidyInr,
      netPayableInr,
      paymentMode,
      monthlyEmiInr,
      calculation.financing.initialMonthlyEmiInr,
      calculation.financing.customerDownPaymentInr,
      calculation.financing.annualInterestRatePct,
      calculation.financing.tierLabel,
      calculation.financing.isSchemeEligible,
      calculation.financedPaybackYears,
      calculation.paybackYears,
      calculation.annualSavingsInr,
      activeTwentyFiveYearWealthInr,
      annualKwh,
      calculation.assumptions.tariffInrPerKwh,
      activeRoofProfileObj.label,
      calculation.financedProjection,
      calculation.projection,
    ],
  );

  const handleReserve = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userName.trim()) {
      setSubmitError("Please enter your full name to prepare your preliminary solar assessment.");
      return;
    }

    const digitsOnlyPhone = userPhone.replace(/\D/g, "");
    const cleanTenDigitPhone =
      digitsOnlyPhone.length === 12 && digitsOnlyPhone.startsWith("91")
        ? digitsOnlyPhone.slice(2)
        : digitsOnlyPhone;
    if (!/^[6-9][0-9]{9}$/.test(cleanTenDigitPhone)) {
      setSubmitError("Please enter a valid 10-digit Indian mobile number (starting with 6–9).");
      return;
    }

    if (!address.trim()) {
      setSubmitError("Please enter your city or locality for regional feasibility.");
      return;
    }

    const cleanPin = pinCode.trim();
    if (!cleanPin || !/^[1-9][0-9]{5}$/.test(cleanPin)) {
      setSubmitError(
        "Please enter a valid 6-digit postal PIN code for DISCOM feasibility (e.g. 500033).",
      );
      return;
    }

    if (!consentGiven) {
      setSubmitError("Please confirm your consent to receive your proposal.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const telemetry = getStoredTelemetry();
      const res = await submitLead({
        data: {
          name: userName.trim(),
          phone: userPhone.trim(),
          city: address.trim(),
          pin_code: cleanPin || undefined,
          property_tier: "villa",
          discom_code: selectedDiscomCode,
          monthly_bill_inr: monthlyBill,
          system_kw: systemKw,
          battery_units: selectedBatteryUnits,
          net_price_inr: netPayableInr,
          source: "studio",
          consent_given: true,
          consent_version: "2026-11-v2",
          consent_timestamp: new Date().toISOString(),
          hp_extra: hpExtra.trim() || undefined,
          ...telemetry,
        },
      });

      if (!res.success || !res.referenceCode) {
        setSubmitError(
          res.message || "Failed to submit proposal request. Please reach us via WhatsApp.",
        );
        setIsSubmitting(false);
        return;
      }

      const isDemoResult = Boolean(res.isDemo);
      const nowIso = new Date().toISOString();

      if (typeof window !== "undefined") {
        try {
          sessionStorage.setItem(
            "wavenox_active_dossier",
            JSON.stringify({
              ...currentDossierData,
              refCode: res.referenceCode,
              isDemo: isDemoResult,
              timestamp: nowIso,
              clientName: userName.trim(),
              phone: userPhone.trim(),
              address: address.trim(),
              pinCode: cleanPin,
              twentyFiveYearSavings: twentyFiveYearWealthInr,
              projection: calculation.projection,
            }),
          );

          sessionStorage.setItem(
            "wavenox_last_submission",
            JSON.stringify({
              ref: res.referenceCode,
              referenceCode: res.referenceCode,
              isDemo: isDemoResult,
              mode: res.mode || (isDemoResult ? "demo" : "live"),
              source: "studio",
              timestamp: nowIso,
            }),
          );
        } catch {
          // ignore storage quota errors
        }
      }

      navigate({
        to: "/order/received",
        search: { ref: res.referenceCode },
      });
    } catch (err: unknown) {
      console.error("[SystemConfigurator] Submit error:", err);
      setSubmitError("Failed to submit proposal request. Please reach us via WhatsApp.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeMedia = estateView === "villa" ? media["res-hero"] : media["studio-estate"];

  return (
    <div className="w-full bg-[#FFFFFF] text-[#171A20]">
      {/* 2-Column Responsive Layout */}
      <div className="flex flex-col lg:flex-row w-full min-h-[calc(100svh-56px)]">
        {/* LEFT COLUMN: 58% Sticky Media Showroom */}
        <div className="w-full lg:w-[58%] relative min-h-[480px] lg:h-[calc(100svh-56px)] lg:sticky lg:top-14 flex flex-col justify-between p-6 sm:p-10 text-[#FFFFFF] overflow-hidden bg-[#171A20]">
          {/* Background image with subtle scrims */}
          <div className="absolute inset-0 z-0 w-full h-full pointer-events-none">
            <Media
              media={activeMedia}
              alt="Architectural residential solar showroom render"
              priority={true}
              fill
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/60 via-black/25 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          </div>

          {/* Top Info & View Toggle */}
          <div className="relative flex items-start justify-between gap-4 z-10">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[12px] font-medium uppercase tracking-widest text-[#FFFFFF]/75">
                  Design Studio
                </span>
                <span className="px-2 py-0.5 rounded-[3px] bg-black/50 backdrop-blur-xs border border-white/20 text-[12px] font-medium text-[#FFFFFF]">
                  {recommendation.recommendationStatus}
                </span>
              </div>
              <h1 className="text-[28px] sm:text-[36px] font-medium tracking-tight leading-tight mt-1">
                System Sizing &amp; Architecture
              </h1>
            </div>

            {/* Estate View Toggle */}
            <div
              role="radiogroup"
              aria-label="Showroom architectural render"
              className="inline-flex rounded-[4px] bg-black/40 backdrop-blur-md p-1 border border-white/20 shrink-0"
            >
              <button
                type="button"
                role="radio"
                aria-checked={estateView === "villa"}
                onClick={() => setEstateView("villa")}
                className={`px-3 py-1 rounded-[2px] text-[12px] font-medium transition-colors cursor-pointer ${
                  estateView === "villa"
                    ? "bg-[#FFFFFF] text-[#171A20]"
                    : "text-[#FFFFFF]/80 hover:text-white"
                }`}
              >
                Villa
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={estateView === "estate"}
                onClick={() => setEstateView("estate")}
                className={`px-3 py-1 rounded-[2px] text-[12px] font-medium transition-colors cursor-pointer ${
                  estateView === "estate"
                    ? "bg-[#FFFFFF] text-[#171A20]"
                    : "text-[#FFFFFF]/80 hover:text-white"
                }`}
              >
                Estate
              </button>
            </div>
          </div>

          {/* Bottom Dock: Live Stats & Disclaimers */}
          <div className="relative z-10 space-y-4 pt-8">
            <StatRow
              align="start"
              stats={[
                {
                  value: `${systemKw} kW`,
                  label: "Solar Capacity",
                  sublabel: `${panelCount} Modules (${recommendation.recommendationStatus})`,
                },
                {
                  value: `₹${formatInr(subsidyInr)}`,
                  label: "Potential DBT Subsidy*",
                  sublabel: "Conditional Post-Commissioning",
                },
                {
                  value: isUnavailable
                    ? "Advisor Review"
                    : `₹${formatInr(calculation.annualSavingsInr)}`,
                  label: "Annual Bill Savings",
                  sublabel: isUnavailable ? "Regional Tariff Unavailable" : "Indicative Offset",
                },
              ]}
            />
            <p className="text-[12px] text-[#FFFFFF]/70 max-w-xl">
              *Potential subsidy under PM Surya Ghar Muft Bijli Yojana is conditional on residential
              eligibility, DCR-compliant modules, DISCOM net-meter commissioning, and national
              portal sanctioning.
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: 42% Scrolling Configurator */}
        <div className="w-full lg:w-[42%] bg-[#FFFFFF] p-6 sm:p-10 lg:p-12 space-y-10 pb-28 lg:pb-16 overflow-y-auto">
          {/* ================================================================
              STAGE 1: UNDERSTAND YOUR PROPERTY
              ================================================================ */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-[18px] font-medium text-[#171A20]">
                1. Electricity Board &amp; Property Details
              </h2>
              <span className="text-[12px] text-[#5C5E62]">Step 1 of 6</span>
            </div>

            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label htmlFor="studio-discom" className="text-[12px] font-medium text-[#5C5E62]">
                  State Electricity Distribution Company (DISCOM)
                </label>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-[4px] text-[12px] font-medium ${
                    calculation.status === "VERIFIED"
                      ? "bg-[#E8F5E9] text-[#1B5E20]"
                      : calculation.status === "INDICATIVE"
                        ? "bg-[#FFF8E1] text-[#8D6E00]"
                        : "bg-[#FEF3C7] text-[#92400E] border border-[#F59E0B]/40"
                  }`}
                >
                  {recommendation.jurisdictionBadgeLabel}
                </span>
              </div>
              <select
                id="studio-discom"
                value={selectedDiscomCode}
                onChange={(e) => handleDiscomChange(e.target.value)}
                className="w-full h-10 px-3 bg-[#FFFFFF] border border-[#E3E4E6] rounded-[4px] text-[14px] text-[#171A20] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#171A20]"
              >
                {!isKnownDiscom && (
                  <option value={selectedDiscomCode}>
                    {selectedDiscomCode} — Unsupported / Unverified Utility [Utility Verification
                    Required]
                  </option>
                )}
                {DISCOMS.map((d) => (
                  <option key={d.code} value={d.code}>
                    {d.code} — {d.name} ({d.state}) [
                    {d.status === "VERIFIED" ? "Verified" : "Indicative"}]
                  </option>
                ))}
              </select>
            </div>

            <BillIntelligence onConfirm={handleConfirmedBill} />
            {confirmedBillBasis && (
              <p className="text-xs text-[#5C5E62]" data-testid="confirmed-bill-basis">
                {confirmedBillBasis} The engine still uses its disclosed regional, seasonal and
                regulatory assumptions.
              </p>
            )}

            {/* Monthly Electricity Bill Input */}
            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-baseline">
                <span className="text-[12px] font-medium text-[#5C5E62]">
                  Monthly Electricity Bill
                </span>
                <span className="text-[20px] font-semibold tabular-nums text-[#171A20]">
                  ₹{formatInr(monthlyBill)}
                </span>
              </div>
              <input
                type="range"
                min={3000}
                max={75000}
                step={500}
                value={Math.min(75000, Math.max(3000, monthlyBill))}
                onChange={(e) => handleBillChange(Number(e.target.value))}
                className="range-slider"
                aria-label="Monthly electricity bill"
                aria-valuetext={`₹${formatInr(monthlyBill)} per month`}
              />
              <div
                role="radiogroup"
                aria-label="Monthly bill presets"
                className="flex justify-between gap-2 pt-1"
              >
                {BILL_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    role="radio"
                    aria-checked={monthlyBill === preset}
                    onClick={() => handleBillChange(preset)}
                    className={`flex-1 py-1.5 text-[12px] tabular-nums rounded-[4px] border transition-colors cursor-pointer ${
                      monthlyBill === preset
                        ? "border-[#171A20] bg-[#171A20] text-[#FFFFFF]"
                        : "border-[#E3E4E6] text-[#5C5E62] hover:border-[#171A20]/40"
                    }`}
                  >
                    ₹{preset >= 1000 ? `${preset / 1000}k` : preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Help Me Estimate vs I Know My Details Toggle */}
            <div className="pt-2 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-[12px] font-medium text-[#5C5E62]">
                  Property &amp; Bill Precision Mode
                </span>
                <div
                  role="radiogroup"
                  aria-label="Property detail input mode"
                  className="inline-flex rounded-[6px] border border-[#E3E4E6] bg-[#F4F4F4] p-0.5"
                >
                  <button
                    type="button"
                    role="radio"
                    aria-checked={inputMode === "estimate"}
                    onClick={() => setInputMode("estimate")}
                    className={`px-2.5 py-1 rounded-[4px] text-[12px] font-medium transition-colors cursor-pointer ${
                      inputMode === "estimate"
                        ? "bg-[#171A20] text-[#FFFFFF]"
                        : "text-[#5C5E62] hover:text-[#171A20]"
                    }`}
                  >
                    Help me estimate
                  </button>
                  <button
                    type="button"
                    role="radio"
                    aria-checked={inputMode === "known"}
                    onClick={() => setInputMode("known")}
                    className={`px-2.5 py-1 rounded-[4px] text-[12px] font-medium transition-colors cursor-pointer ${
                      inputMode === "known"
                        ? "bg-[#171A20] text-[#FFFFFF]"
                        : "text-[#5C5E62] hover:text-[#171A20]"
                    }`}
                  >
                    I know my details
                  </button>
                </div>
              </div>

              {inputMode === "known" && (
                <div className="p-3.5 rounded-[6px] border border-[#E3E4E6] bg-[#F8F9FA] space-y-3">
                  <div className="flex items-center gap-1.5 text-[12px] font-medium text-[#171A20]">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-[#F57C00]" />
                    <span>
                      Optional Electricity Bill &amp; Rooftop Details (Leave blank if unknown)
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label
                        htmlFor="studio-monthly-units"
                        className="block text-[12px] font-medium text-[#5C5E62] mb-1"
                      >
                        Monthly Usage (kWh)
                      </label>
                      <input
                        id="studio-monthly-units"
                        type="number"
                        min={50}
                        max={25000}
                        inputMode="numeric"
                        value={customMonthlyUnitsStr}
                        onChange={(e) => {
                          setCustomMonthlyUnitsStr(e.target.value);
                          setConfirmedBillBasis("");
                        }}
                        placeholder={
                          isUnavailable ? "e.g. 900" : `~${calculation.monthlyUnits} kWh`
                        }
                        className="w-full h-9 px-2.5 bg-[#FFFFFF] border border-[#E3E4E6] rounded-[4px] text-[13px] text-[#171A20] tabular-nums focus:outline-none focus:border-[#171A20]"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="studio-roof-sqft"
                        className="block text-[12px] font-medium text-[#5C5E62] mb-1"
                      >
                        Usable Roof (sq.ft.)
                      </label>
                      <input
                        id="studio-roof-sqft"
                        type="number"
                        min={0}
                        max={20000}
                        inputMode="numeric"
                        value={
                          sketchedRoofSqft !== undefined
                            ? String(sketchedRoofSqft)
                            : knownRoofSqftStr
                        }
                        onChange={(e) => {
                          setSketchedRoofSqft(undefined);
                          setKnownRoofSqftStr(e.target.value);
                        }}
                        placeholder="e.g. 1200"
                        className="w-full h-9 px-2.5 bg-[#FFFFFF] border border-[#E3E4E6] rounded-[4px] text-[13px] text-[#171A20] tabular-nums focus:outline-none focus:border-[#171A20]"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="studio-sanctioned-load"
                        className="block text-[12px] font-medium text-[#5C5E62] mb-1"
                      >
                        Sanctioned Load (kW)
                      </label>
                      <input
                        id="studio-sanctioned-load"
                        type="number"
                        min={1}
                        max={200}
                        step="0.5"
                        inputMode="decimal"
                        value={customSanctionedLoadStr}
                        onChange={(e) => setCustomSanctionedLoadStr(e.target.value)}
                        placeholder="e.g. 5 or 10"
                        className="w-full h-9 px-2.5 bg-[#FFFFFF] border border-[#E3E4E6] rounded-[4px] text-[13px] text-[#171A20] tabular-nums focus:outline-none focus:border-[#171A20]"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-0.5">
                    <input
                      id="studio-sanctioned-confirmed"
                      type="checkbox"
                      checked={sanctionedLoadConfirmed}
                      onChange={(e) => setSanctionedLoadConfirmed(e.target.checked)}
                      className="h-4 w-4 rounded-[3px] border-[#CBD5E1] text-[#171A20] focus:ring-1 focus:ring-[#171A20] cursor-pointer"
                    />
                    <label
                      htmlFor="studio-sanctioned-confirmed"
                      className="text-[12px] text-[#5C5E62] cursor-pointer"
                    >
                      This sanctioned load is verified from my printed electricity bill
                    </label>
                  </div>
                </div>
              )}

              <p className="text-[12px] text-[#5C5E62] leading-normal">* {discom.regulatoryNote}</p>
              <BillDecoder
                monthlyBill={monthlyBill}
                discomCode={selectedDiscomCode}
                sanctionedLoadKw={parsedSanctionedLoadKw}
                sanctionedLoadConfirmed={Boolean(parsedSanctionedLoadKw && sanctionedLoadConfirmed)}
                monthlyUnitsOverride={parsedMonthlyUnitsOverride}
                className="mt-2"
              />
            </div>
          </div>

          {/* ================================================================
              STAGE 2: RECOMMENDED SOLAR SYSTEM (EXPLAINABLE GUIDANCE)
              ================================================================ */}
          <div className="space-y-4 pt-6 border-t border-[#E3E4E6]">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#F57C00]" />
                <h2 className="text-[18px] font-medium text-[#171A20]">
                  2. Recommended Solar System
                </h2>
              </div>
              <span
                className={`px-2.5 py-0.5 rounded-[4px] text-[12px] font-medium ${
                  recommendation.recommendationStatus === "Recommended"
                    ? "bg-[#E8F5E9] text-[#1B5E20]"
                    : recommendation.recommendationStatus === "Customer Selected"
                      ? "bg-[#F4F4F4] text-[#171A20] border border-[#E3E4E6]"
                      : "bg-[#FFF8E1] text-[#92400E] border border-[#F59E0B]/40"
                }`}
              >
                {recommendation.recommendationStatus}
              </span>
            </div>

            <div
              data-testid="studio-recommendation-card"
              className="p-4 rounded-[6px] border border-[#E3E4E6] bg-[#F8F9FA] space-y-3"
            >
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <span className="text-[12px] text-[#5C5E62] block">Recommended Size</span>
                  <span className="text-[17px] font-semibold text-[#171A20] tabular-nums">
                    {recommendation.recommendedCapacityKw} kW
                  </span>
                  <span className="text-[12px] text-[#5C5E62] block">
                    {recommendation.recommendedPanels} × {PRODUCTS_CONFIG.module.ratedPowerW}W
                  </span>
                </div>
                <div>
                  <span className="text-[12px] text-[#5C5E62] block">Indicative Gen</span>
                  <span className="text-[17px] font-semibold text-[#171A20] tabular-nums">
                    {isUnavailable
                      ? "Advisor Review"
                      : `~${formatInr(recommendation.estimatedGeneration.recommendedAnnualKwh)}`}
                  </span>
                  <span className="text-[12px] text-[#5C5E62] block">
                    {isUnavailable
                      ? "Unverified Region"
                      : `kWh/yr (${recommendation.estimatedGeneration.city})`}
                  </span>
                </div>
                <div>
                  <span className="text-[12px] text-[#5C5E62] block">Est. Roof Needed</span>
                  <span className="text-[17px] font-semibold text-[#171A20] tabular-nums">
                    ~
                    {formatInr(
                      Math.round(
                        recommendation.recommendedCapacityKw * SOLAR_ASSUMPTIONS.clearRoofSqftPerKw,
                      ),
                    )}
                  </span>
                  <span className="text-[12px] text-[#5C5E62] block">sq.ft. shadow-free</span>
                </div>
                <div>
                  <span className="text-[12px] text-[#5C5E62] block">Bill Offset Basis</span>
                  <span className="text-[17px] font-semibold text-[#1B5E20] tabular-nums">
                    {isUnavailable ? "Pending" : `~${calculation.billCoveragePct}%`}
                  </span>
                  <span className="text-[12px] text-[#5C5E62] block">
                    {isUnavailable ? "Requires Survey" : "Avoidable Bill"}
                  </span>
                </div>
              </div>

              <p className="text-[12px] text-[#5C5E62] leading-relaxed border-t border-[#E3E4E6] pt-2.5">
                <strong className="text-[#171A20]">Why this system is recommended:</strong>{" "}
                {recommendation.explanation}
              </p>

              {recommendation.customizationNotice && (
                <div className="p-2.5 rounded-[4px] bg-[#FFFFFF] border border-[#E3E4E6] flex flex-wrap items-center justify-between gap-2 text-[12px] text-[#171A20]">
                  <span>{recommendation.customizationNotice}</span>
                  <button
                    type="button"
                    onClick={() => handleApplyRecommendation()}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[4px] bg-[#171A20] text-[#FFFFFF] text-[12px] font-medium hover:bg-[#2B2F36] transition-colors cursor-pointer shrink-0"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Use Recommended ({recommendation.recommendedCapacityKw} kW)</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ================================================================
              STAGE 3: CUSTOMIZE SOLAR CAPACITY & ROOF PLANNING
              ================================================================ */}
          <div className="space-y-4 pt-6 border-t border-[#E3E4E6]">
            <div className="flex justify-between items-baseline">
              <h2 className="text-[18px] font-medium text-[#171A20]">
                3. Sizing Capacity &amp; Rooftop Feasibility
              </h2>
              <span className="text-[13px] font-medium tabular-nums text-[#5C5E62]">
                {systemKw} kW ({panelCount} Panels)
              </span>
            </div>

            {/* Choice Prompt When Bill/DISCOM Changes During Manual Override */}
            {showOverrideChoicePrompt && panelCount !== recommendation.recommendedPanels && (
              <div
                data-testid="manual-override-banner"
                role="region"
                aria-label="Updated solar recommendation available"
                className="p-3.5 rounded-[6px] bg-[#FFF8E1] border border-[#F59E0B]/40 text-[12px] text-[#92400E] space-y-2.5"
              >
                <div>
                  <strong className="text-[#171A20]">
                    Your consumption or utility input changed:
                  </strong>{" "}
                  We preserved your custom selection of{" "}
                  <strong>
                    {systemKw} kW ({panelCount} panels)
                  </strong>
                  . The updated recommendation for your current inputs is{" "}
                  <strong>
                    {recommendation.recommendedCapacityKw} kW ({recommendation.recommendedPanels}{" "}
                    panels)
                  </strong>
                  .
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowOverrideChoicePrompt(false)}
                    className="px-3 py-1.5 rounded-[4px] border border-[#171A20] bg-[#FFFFFF] text-[#171A20] text-[12px] font-medium hover:bg-[#F4F4F4] transition-colors cursor-pointer"
                  >
                    Keep current configuration ({systemKw} kW)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyRecommendation()}
                    className="px-3 py-1.5 rounded-[4px] bg-[#171A20] text-[#FFFFFF] text-[12px] font-medium hover:bg-[#2B2F36] transition-colors cursor-pointer"
                  >
                    Apply updated recommendation ({recommendation.recommendedCapacityKw} kW)
                  </button>
                </div>
              </div>
            )}

            {/* Sizing Tier Buttons */}
            <div
              role="radiogroup"
              aria-label="System sizing capacity tiers"
              className="grid grid-cols-2 sm:grid-cols-4 gap-2"
            >
              {SYSTEM_TIERS.map((tier) => {
                const isActive = panelCount === tier.panels;
                return (
                  <button
                    key={tier.id}
                    type="button"
                    role="radio"
                    aria-checked={isActive}
                    onClick={() => handleSelectTier(tier.panels)}
                    className={`p-3 text-left rounded-[4px] border transition-all cursor-pointer ${
                      isActive
                        ? "border-[#171A20] bg-[#171A20] text-[#FFFFFF]"
                        : "border-[#E3E4E6] bg-[#FFFFFF] text-[#171A20] hover:border-[#171A20]/40"
                    }`}
                  >
                    <div className="text-[13px] font-medium leading-none">{tier.label}</div>
                    <div
                      className={`text-[12px] tabular-nums mt-1 ${isActive ? "text-[#FFFFFF]/70" : "text-[#5C5E62]"}`}
                    >
                      {tier.systemKw} kW
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Micro-adjust panel count */}
            <div className="flex items-center justify-between p-3 rounded-[4px] border border-[#E3E4E6] bg-[#F4F4F4]">
              <div>
                <span className="text-[12px] font-medium text-[#171A20] block">
                  Custom Panel Count ({SOLAR_ASSUMPTIONS.panelWatt}W TOPCon)
                </span>
                <span className="text-[12px] text-[#5C5E62]">
                  {recommendation.isCustomPanelSelection
                    ? `Customer Selected (Recommended: ${recommendation.recommendedPanels} panels)`
                    : "Matched to Recommended System"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handlePanelIncrement(-2)}
                  className="w-8 h-8 rounded-[4px] bg-[#FFFFFF] border border-[#E3E4E6] flex items-center justify-center text-[#171A20] hover:bg-[#EAEAEA] active:bg-[#DFDFDF] transition-colors cursor-pointer"
                  aria-label="Decrease panels"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="text-[14px] font-semibold tabular-nums px-2">{panelCount}</span>
                <button
                  type="button"
                  onClick={() => handlePanelIncrement(2)}
                  className="w-8 h-8 rounded-[4px] bg-[#FFFFFF] border border-[#E3E4E6] flex items-center justify-center text-[#171A20] hover:bg-[#EAEAEA] active:bg-[#DFDFDF] transition-colors cursor-pointer"
                  aria-label="Increase panels"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 text-[12px] text-[#5C5E62]">
              <span>
                Physical Module Area:{" "}
                <strong className="font-medium text-[#171A20]">
                  {formatInr(calculation.roofFeasibility.moduleFootprintSqft)} sq.ft.
                </strong>
              </span>
              <span>
                Recommended Shadow-Free Roof:{" "}
                <strong className="font-medium text-[#171A20]">
                  ~{formatInr(calculation.roofFeasibility.recommendedClearRoofSqft)} sq.ft.
                </strong>
              </span>
            </div>

            {!calculation.roofFeasibility.isFeasible && calculation.roofFeasibility.warning && (
              <div
                role="alert"
                className="p-3 rounded-[4px] bg-[#FFF8E1] border border-[#F59E0B]/40 text-[12px] text-[#92400E] space-y-2"
              >
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#D97706]" />
                  <span>{calculation.roofFeasibility.warning}</span>
                </div>
                {calculation.roofFeasibility.maxFeasiblePanels !== null &&
                  calculation.roofFeasibility.maxFeasiblePanels >= 6 && (
                    <button
                      type="button"
                      onClick={() =>
                        handleSelectTier(
                          Math.min(
                            maxResidentialPanels,
                            calculation.roofFeasibility.maxFeasiblePanels!,
                          ),
                        )
                      }
                      className="px-3 py-1 rounded-[4px] bg-[#171A20] text-[#FFFFFF] text-[12px] font-medium hover:bg-[#2B2F36] transition-colors cursor-pointer"
                    >
                      Fit to Available Roof ({calculation.roofFeasibility.maxFeasibleKw} kW /{" "}
                      {calculation.roofFeasibility.maxFeasiblePanels} Panels)
                    </button>
                  )}
              </div>
            )}

            {calculation.sanctionedLoadFeasibility.requiresLoadEnhancement &&
              calculation.sanctionedLoadFeasibility.warning && (
                <div className="p-3 rounded-[4px] bg-[#FFF8E1] border border-[#F59E0B]/40 text-[12px] text-[#92400E] flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#D97706]" />
                  <span>{calculation.sanctionedLoadFeasibility.warning}</span>
                </div>
              )}

            {/* Terrace Architecture & Roof Sketcher Integration */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-medium text-[#171A20]">
                  Terrace Mounting Architecture
                </span>
                <span className="text-[12px] text-[#5C5E62]">
                  {recommendation.roofFeasibility.statusLabel}
                </span>
              </div>
              <div
                role="radiogroup"
                aria-label="Terrace architecture roof profiles"
                className="grid grid-cols-1 sm:grid-cols-3 gap-2"
              >
                {ROOF_PROFILES.map((prof) => {
                  const isActive = roofProfile === prof.id;
                  return (
                    <button
                      key={prof.id}
                      type="button"
                      role="radio"
                      aria-checked={isActive}
                      onClick={() => setRoofProfile(prof.id)}
                      className={`p-3 text-left rounded-[4px] border transition-all cursor-pointer ${
                        isActive
                          ? "border-[#171A20] bg-[#171A20] text-[#FFFFFF]"
                          : "border-[#E3E4E6] bg-[#FFFFFF] text-[#171A20] hover:border-[#171A20]/40"
                      }`}
                    >
                      <div className="text-[13px] font-medium">{prof.label}</div>
                      <div
                        className={`text-[12px] mt-1 leading-snug ${isActive ? "text-[#FFFFFF]/70" : "text-[#5C5E62]"}`}
                      >
                        {prof.desc}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="pt-1">
                <button
                  type="button"
                  aria-expanded={showRoofSketcher}
                  onClick={() => setShowRoofSketcher((prev) => !prev)}
                  className="w-full p-3 rounded-[4px] border border-[#E3E4E6] bg-[#F4F4F4] hover:bg-[#EAEAEA] text-[#171A20] text-[13px] font-medium flex items-center justify-between gap-2 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2 text-left">
                    <Ruler className="w-4 h-4 text-[#F57C00] shrink-0" />
                    <span>
                      {showRoofSketcher
                        ? "Hide Interactive Rooftop Area & Obstruction Planner"
                        : "Plan Usable Terrace Area & Obstructions (Calculates Max Panels)"}
                    </span>
                  </div>
                  <span className="text-[12px] uppercase tracking-wider text-[#5C5E62] bg-[#FFFFFF] px-2 py-0.5 rounded border border-[#E3E4E6] shrink-0">
                    {showRoofSketcher ? "Close Planner" : "Open Planner"}
                  </span>
                </button>

                {showRoofSketcher && (
                  <div className="mt-3">
                    <RoofSketcher
                      discomCode={selectedDiscomCode}
                      targetPanels={panelCount}
                      onApplyKw={(_kw, feasiblePanels, area) => {
                        setSketchedRoofSqft(area);
                        setKnownRoofSqftStr(String(area));
                        if (feasiblePanels >= 6) {
                          setPanelCount(Math.min(maxResidentialPanels, feasiblePanels));
                          setIsManualPanelOverride(true);
                        }
                        setShowRoofSketcher(false);
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ================================================================
              STAGE 4: OMNIGRID BATTERY STORAGE & BACKUP PLANNING
              ================================================================ */}
          <div className="space-y-4 pt-6 border-t border-[#E3E4E6]">
            <div className="flex justify-between items-baseline">
              <h2 className="text-[18px] font-medium text-[#171A20]">
                4. Omnigrid Storage &amp; Backup Planning
              </h2>
              <span className="text-[13px] font-medium tabular-nums text-[#5C5E62]">
                {battery.usableCapacityKwh} kWh Usable
                {battery.priceInr > 0 ? ` · +₹${formatInr(battery.priceInr)}` : " · Solar Only"}
              </span>
            </div>

            <div
              role="radiogroup"
              aria-label="Omnigrid battery capacity options"
              className="grid grid-cols-2 sm:grid-cols-4 gap-2"
            >
              {recommendation.batteryGuidance.options.map((opt) => {
                const isActive = selectedBatteryUnits === opt.units;
                return (
                  <button
                    key={opt.units}
                    type="button"
                    role="radio"
                    aria-checked={isActive}
                    onClick={() => setSelectedBatteryUnits(opt.units)}
                    className={`p-3 text-left rounded-[4px] border transition-all cursor-pointer ${
                      isActive
                        ? "border-[#171A20] bg-[#171A20] text-[#FFFFFF]"
                        : "border-[#E3E4E6] bg-[#FFFFFF] text-[#171A20] hover:border-[#171A20]/40"
                    }`}
                  >
                    <div className="text-[13px] font-medium leading-none">
                      {opt.units === 0 ? "0 Units" : opt.label}
                    </div>
                    <div
                      className={`text-[12px] mt-1 ${isActive ? "text-[#FFFFFF]/75" : "text-[#5C5E62]"}`}
                    >
                      {opt.units === 0 ? "Grid-Tied" : `${opt.usableCapacityKwh} kWh`}
                    </div>
                    <div
                      className={`text-[12px] font-mono mt-1 ${isActive ? "text-[#F59E0B]" : "text-[#171A20]"}`}
                    >
                      {opt.priceInr === 0 ? "₹0 Outlay" : `+₹${formatInr(opt.priceInr)}`}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Solar Only vs Solar + Battery Comparison & Backup Guidance */}
            <div className="p-3.5 rounded-[6px] border border-[#E3E4E6] bg-[#F8F9FA] space-y-3 text-[12px]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div
                  className={`p-3 rounded-[4px] border ${
                    selectedBatteryUnits === 0
                      ? "border-[#171A20] bg-[#FFFFFF]"
                      : "border-[#E3E4E6] bg-[#FFFFFF]/70"
                  }`}
                >
                  <div className="font-semibold text-[#171A20]">Solar Only (Grid-Tied)</div>
                  <p className="text-[#5C5E62] mt-1 leading-relaxed">
                    {recommendation.batteryGuidance.solarOnlySummary}
                  </p>
                </div>
                <div
                  className={`p-3 rounded-[4px] border ${
                    selectedBatteryUnits > 0
                      ? "border-[#171A20] bg-[#FFFFFF]"
                      : "border-[#E3E4E6] bg-[#FFFFFF]/70"
                  }`}
                >
                  <div className="font-semibold text-[#171A20]">
                    Solar + Omnigrid LFP ({PRODUCTS_CONFIG.battery.usableCapacityKwh} kWh/unit)
                  </div>
                  <p className="text-[#5C5E62] mt-1 leading-relaxed">
                    {recommendation.batteryGuidance.solarPlusBatterySummary}
                  </p>
                </div>
              </div>

              {/* Backup Priority Selector */}
              <div className="pt-2 border-t border-[#E3E4E6] space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-medium text-[#171A20]">
                    Select Outage Priority (For Illustrative Backup Sizing):
                  </span>
                  <span className="text-[#5C5E62] font-mono">
                    {battery.illustrativeRuntimeLabel}
                  </span>
                </div>
                <div
                  role="radiogroup"
                  aria-label="Backup priority profile"
                  className="grid grid-cols-1 sm:grid-cols-2 gap-2"
                >
                  {BACKUP_PRIORITY_OPTIONS.map((prio) => {
                    const isSelected = backupPriority === prio.id;
                    return (
                      <button
                        key={prio.id}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        onClick={() => setBackupPriority(prio.id)}
                        className={`p-2.5 rounded-[4px] border text-left transition-colors cursor-pointer ${
                          isSelected
                            ? "border-[#171A20] bg-[#171A20] text-[#FFFFFF]"
                            : "border-[#E3E4E6] bg-[#FFFFFF] text-[#171A20] hover:border-[#171A20]/40"
                        }`}
                      >
                        <div className="text-[12px] font-medium">{prio.label}</div>
                        <div
                          className={`text-[12px] mt-0.5 ${
                            isSelected ? "text-[#FFFFFF]/75" : "text-[#5C5E62]"
                          }`}
                        >
                          ~{prio.typicalLoadRangeWatts[0]}–{prio.typicalLoadRangeWatts[1]} W typical
                          load
                        </div>
                      </button>
                    );
                  })}
                </div>
                <p className="text-[#5C5E62] leading-normal pt-0.5">
                  <strong className="text-[#171A20]">Selected Configuration:</strong>{" "}
                  {battery.headline} {battery.outageBehavior} Runtime figures are illustrative only;
                  actual backup duration depends on connected appliance demand, battery state of
                  charge, inverter sizing, and dedicated backup sub-panel wiring.
                </p>
              </div>

              {/* Optional Detailed Appliance Runtime Calculator Drawer */}
              <div className="pt-1">
                <button
                  type="button"
                  aria-expanded={showBatteryAdvisor}
                  onClick={() => setShowBatteryAdvisor((prev) => !prev)}
                  className="w-full p-2.5 rounded-[4px] border border-[#E3E4E6] bg-[#FFFFFF] hover:bg-[#F4F4F4] text-[#171A20] text-[12px] font-medium flex items-center justify-between gap-2 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2 text-left">
                    <BatteryCharging className="w-4 h-4 text-[#F57C00] shrink-0" />
                    <span>
                      {showBatteryAdvisor
                        ? "Hide Appliance-by-Appliance Backup Estimator"
                        : "Explore Appliance-by-Appliance Outage Load Estimator (BEE Standards)"}
                    </span>
                  </div>
                  <span className="text-[12px] text-[#5C5E62] underline shrink-0">
                    {showBatteryAdvisor ? "Close" : "Open"}
                  </span>
                </button>
                {showBatteryAdvisor && (
                  <div className="mt-3">
                    <BatteryHonestyAdvisor />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ================================================================
              STAGE 5: COST, SUBSIDY & INVESTMENT STRUCTURE
              ================================================================ */}
          <div className="space-y-4 pt-6 border-t border-[#E3E4E6]">
            <div className="flex items-center justify-between">
              <h2 className="text-[18px] font-medium text-[#171A20]">5. Investment Structure</h2>
              <SourcePopover sourceId="sbiSolarLoan" label="SBI Concessional Loan" />
            </div>
            <div
              role="radiogroup"
              aria-label="Investment payment mode"
              className="grid grid-cols-2 gap-2"
            >
              <button
                type="button"
                role="radio"
                aria-checked={paymentMode === "loan"}
                onClick={() => setPaymentMode("loan")}
                className={`p-3 text-left rounded-[4px] border transition-all cursor-pointer ${
                  paymentMode === "loan"
                    ? "border-[#171A20] bg-[#171A20] text-[#FFFFFF]"
                    : "border-[#E3E4E6] bg-[#FFFFFF] text-[#171A20] hover:border-[#171A20]/40"
                }`}
              >
                <div className="text-[13px] font-medium">5-Year Financing</div>
                <div
                  className={`text-[12px] mt-0.5 tabular-nums ${paymentMode === "loan" ? "text-[#FFFFFF]/70" : "text-[#5C5E62]"}`}
                >
                  {isUnavailable ? "Indicative Loan" : `~₹${formatInr(monthlyEmiInr)} / mo`}
                </div>
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={paymentMode === "cash"}
                onClick={() => setPaymentMode("cash")}
                className={`p-3 text-left rounded-[4px] border transition-all cursor-pointer ${
                  paymentMode === "cash"
                    ? "border-[#171A20] bg-[#171A20] text-[#FFFFFF]"
                    : "border-[#E3E4E6] bg-[#FFFFFF] text-[#171A20] hover:border-[#171A20]/40"
                }`}
              >
                <div className="text-[13px] font-medium">Direct Purchase</div>
                <div
                  className={`text-[12px] mt-0.5 tabular-nums ${paymentMode === "cash" ? "text-[#FFFFFF]/70" : "text-[#5C5E62]"}`}
                >
                  100% Upfront
                </div>
              </button>
            </div>

            {/* Financial Breakdown */}
            <div className="p-4 rounded-[4px] border border-[#E3E4E6] bg-[#F4F4F4] space-y-2 text-[13px]">
              <div className="flex justify-between items-baseline">
                <span className="font-medium text-[#171A20]">
                  Gross Installed System Cost (Solar
                  {selectedBatteryUnits > 0 ? " + Omnigrid LFP" : ""})
                </span>
                <span className="text-[16px] font-semibold tabular-nums text-[#171A20]">
                  ₹{formatInr(totalGrossInr)}
                </span>
              </div>
              {selectedBatteryUnits > 0 && (
                <div className="flex justify-between text-[12px] text-[#5C5E62]">
                  <span>
                    Breakdown: Solar Array ₹{formatInr(calculation.solarGrossInr)} + Omnigrid
                    Battery ({selectedBatteryUnits}×) ₹{formatInr(calculation.batteryGrossInr)}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center text-[#171A20]">
                <div className="flex items-center gap-1.5">
                  <span className="text-[#5C5E62]">
                    Potential Post-Commissioning DBT Subsidy (Conditional)*
                  </span>
                  <SourcePopover sourceId="pmSuryaGharSubsidy" showIconOnly />
                </div>
                <span className="font-medium tabular-nums text-[#1B5E20]">
                  -₹{formatInr(subsidyInr)}
                </span>
              </div>
              <div className="pt-2 border-t border-[#E3E4E6] flex justify-between items-baseline text-[14px]">
                <div className="flex items-center gap-1.5">
                  <span className="font-medium">Conditional cost after potential DBT*</span>
                  <SourcePopover
                    sourceId={discom.authority === "APERC" ? "apercTariffs" : "tgercTariffs"}
                    showIconOnly
                  />
                </div>
                <span className="text-[18px] font-semibold tabular-nums">
                  ₹{formatInr(netPayableInr)}
                </span>
              </div>

              {paymentMode === "loan" && (
                <div className="pt-2 mt-2 border-t border-[#E3E4E6] space-y-1.5 text-[12px] text-[#5C5E62]">
                  <div className="flex justify-between">
                    <span>
                      Year 0 Customer Down Payment (
                      {Math.round(calculation.financing.customerMarginPct * 100)}% Solar Margin
                      {selectedBatteryUnits > 0 ? " + Battery Outlay" : ""})
                    </span>
                    <span className="font-medium tabular-nums text-[#171A20]">
                      ₹{formatInr(calculation.financing.customerDownPaymentInr)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Initial Solar Loan Principal (90% of Solar Cost)</span>
                    <span className="font-medium tabular-nums text-[#171A20]">
                      ₹{formatInr(calculation.financing.initialLoanPrincipalInr)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>
                      {calculation.financing.isSchemeEligible
                        ? `Initial EMI (Months 1–${calculation.financing.subsidyCreditMonth} · ${calculation.financing.annualInterestRatePct}% p.a. floating)`
                        : `Unadjusted Monthly EMI (${calculation.financing.annualInterestRatePct}% p.a. Non-Scheme Illustrative)`}
                    </span>
                    <span className="font-medium tabular-nums text-[#171A20]">
                      ~₹{formatInr(calculation.financing.initialMonthlyEmiInr)} / mo
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>
                      {calculation.financing.isSchemeEligible
                        ? `Month-${calculation.financing.subsidyCreditMonth} Loan Principal Prepayment via DBT Subsidy*`
                        : `Illustrative Month-${calculation.financing.subsidyCreditMonth} Optional Prepayment via DBT*`}
                    </span>
                    <span className="font-medium tabular-nums text-[#1B5E20]">
                      -₹{formatInr(calculation.financing.subsidyCreditedToLoanInr)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>
                      {calculation.financing.isSchemeEligible
                        ? `Post-Subsidy Recast EMI (Months ${calculation.financing.subsidyCreditMonth + 1}–${calculation.financing.tenureMonths} · Indicative)`
                        : `Illustrative Recast EMI if Prepayment Applied (Subject to Lender)`}
                    </span>
                    <span className="font-medium tabular-nums text-[#171A20]">
                      ~₹{formatInr(calculation.financing.postSubsidyMonthlyEmiInr)} / mo
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total 5-Year Loan Interest Outflow</span>
                    <span className="font-medium tabular-nums text-[#171A20]">
                      ₹{formatInr(calculation.financing.totalInterestInr)}
                    </span>
                  </div>
                  {!calculation.financing.isSchemeEligible && (
                    <div className="text-[12px] text-[#92400E] bg-[#FFF8E1] p-2.5 rounded border border-[#F59E0B]/30 mt-1 space-y-1">
                      <div>{calculation.financing.note}</div>
                      <div>{recommendation.financingAvailability.prepaymentModeDisclosure}</div>
                    </div>
                  )}
                </div>
              )}

              <p className="text-[12px] text-[#5C5E62] leading-tight pt-0.5">
                *Potential DBT subsidy is not an upfront invoice discount; it is conditional on
                DCR-compliant solar modules, DISCOM bi-directional meter commissioning, and no prior
                central rooftop solar subsidy. Under SBI PM Surya Ghar loan rules,
                post-commissioning subsidy is credited directly into the linked SBI loan account to
                prepay loan principal with zero prepayment penalty (or to your Aadhaar-linked bank
                account for direct cash purchases). Standalone battery storage is excluded from
                central subsidy and scheme financing.
              </p>

              {isUnavailable ? (
                <div className="pt-2 border-t border-[#E3E4E6] text-[12px] text-[#92400E] font-medium">
                  Detailed regional calculation unavailable — advisor assessment required.
                </div>
              ) : (
                <div className="pt-2 border-t border-[#E3E4E6] flex justify-between text-[12px] text-[#5C5E62]">
                  <span>
                    25-Year Est. Net Savings (
                    {paymentMode === "loan" ? "Financed Basis" : "Cash Basis"})
                  </span>
                  <span className="font-medium tabular-nums text-[#171A20]">
                    ₹{twentyFiveYearLakhs} Lakhs
                  </span>
                </div>
              )}

              <div className="pt-1 flex items-center justify-end">
                <a
                  href="/legal/disclosures#sources"
                  className="inline-flex items-center gap-1.5 text-[12px] text-[#5C5E62] hover:text-[#171A20] transition-colors"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
                  <span>
                    Source · verified Nov 2026 ({discom.authority}, MNRE &amp; SBI as of{" "}
                    {calculation.financing.effectiveAsOf})
                  </span>
                </a>
              </div>
            </div>

            {/* Interactive 25-Year Compounding Wealth Visualizer */}
            {!isUnavailable && (
              <WealthCurveVisualizer
                annualBillInr={monthlyBill * 12}
                annualSavingsInr={calculation.annualSavingsInr}
                netInvestmentInr={
                  paymentMode === "loan"
                    ? netPayableInr + calculation.financing.totalInterestInr
                    : netPayableInr
                }
                paybackYears={
                  paymentMode === "loan"
                    ? calculation.financedPaybackYears
                    : calculation.paybackYears
                }
                tariffPerKwh={discom.residentialTariffInr}
                annualGenKwh={annualKwh}
                paymentMode={paymentMode}
                projectionOverride={
                  paymentMode === "loan" ? calculation.financedProjection : calculation.projection
                }
                authorityLabel={discom.authority}
              />
            )}

            {/* NASA POWER / PVWatts Monthly Solar Generation Curve */}
            {!isUnavailable && (
              <MonthlyGenerationChart
                systemKw={systemKw}
                initialCity={discom.cityKey}
                className="mt-6"
              />
            )}
          </div>

          {/* ================================================================
              STAGE 6: PERSONALIZED CONFIGURATION SUMMARY & PROPOSAL REQUEST
              ================================================================ */}
          <div className="space-y-5 pt-8 border-t border-[#E3E4E6]">
            {/* Personalized Configuration Summary Card (Phase F) */}
            <div
              data-testid="studio-configuration-summary"
              className="p-4 rounded-[6px] border border-[#E3E4E6] bg-[#F8F9FA] space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E3E4E6] pb-2">
                <h3 className="text-[14px] font-semibold uppercase tracking-wider text-[#171A20]">
                  Your Preliminary Configuration Summary
                </h3>
                <span className="text-[12px] font-medium text-[#5C5E62]">
                  {recommendation.recommendationStatus}
                </span>
              </div>

              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-[12px]">
                <div className="flex justify-between sm:block border-b sm:border-b-0 border-[#E3E4E6]/60 pb-1 sm:pb-0">
                  <dt className="text-[#5C5E62]">Selected DISCOM</dt>
                  <dd className="font-medium text-[#171A20]">
                    {discom.code} ({discom.state})
                  </dd>
                </div>
                <div className="flex justify-between sm:block border-b sm:border-b-0 border-[#E3E4E6]/60 pb-1 sm:pb-0">
                  <dt className="text-[#5C5E62]">Consumption Basis</dt>
                  <dd className="font-medium text-[#171A20]">
                    {recommendation.consumptionBasisLabel}
                  </dd>
                </div>
                <div className="flex justify-between sm:block border-b sm:border-b-0 border-[#E3E4E6]/60 pb-1 sm:pb-0">
                  <dt className="text-[#5C5E62]">Recommended System</dt>
                  <dd className="font-medium text-[#171A20]">
                    {recommendation.recommendedCapacityKw} kW ({recommendation.recommendedPanels}{" "}
                    Modules)
                  </dd>
                </div>
                <div className="flex justify-between sm:block border-b sm:border-b-0 border-[#E3E4E6]/60 pb-1 sm:pb-0">
                  <dt className="text-[#5C5E62]">Selected Solar System</dt>
                  <dd className="font-medium text-[#171A20]">
                    {systemKw} kW ({panelCount} × {PRODUCTS_CONFIG.module.ratedPowerW}W Modules)
                  </dd>
                </div>
                <div className="flex justify-between sm:block border-b sm:border-b-0 border-[#E3E4E6]/60 pb-1 sm:pb-0">
                  <dt className="text-[#5C5E62]">Battery Configuration</dt>
                  <dd className="font-medium text-[#171A20]">
                    {selectedBatteryUnits === 0
                      ? "Solar Only (0 Units · Grid-Tied)"
                      : `${selectedBatteryUnits} × ${PRODUCTS_CONFIG.battery.usableCapacityKwh} kWh (${battery.usableCapacityKwh} kWh Usable)`}
                  </dd>
                </div>
                <div className="flex justify-between sm:block border-b sm:border-b-0 border-[#E3E4E6]/60 pb-1 sm:pb-0">
                  <dt className="text-[#5C5E62]">Est. Annual Generation</dt>
                  <dd className="font-medium text-[#171A20]">
                    {isUnavailable
                      ? "Detailed regional calculation unavailable — advisor assessment required."
                      : `~${formatInr(annualKwh)} kWh/yr`}
                  </dd>
                </div>
                <div className="flex justify-between sm:block border-b sm:border-b-0 border-[#E3E4E6]/60 pb-1 sm:pb-0">
                  <dt className="text-[#5C5E62]">Roof Feasibility Status</dt>
                  <dd
                    className={`font-medium ${
                      recommendation.roofFeasibility.statusTone === "warning"
                        ? "text-[#92400E]"
                        : recommendation.roofFeasibility.statusTone === "verified"
                          ? "text-[#1B5E20]"
                          : "text-[#171A20]"
                    }`}
                  >
                    {recommendation.roofFeasibility.statusLabel}
                  </dd>
                </div>
                <div className="flex justify-between sm:block border-b sm:border-b-0 border-[#E3E4E6]/60 pb-1 sm:pb-0">
                  <dt className="text-[#5C5E62]">Sanctioned Load Status</dt>
                  <dd
                    className={`font-medium ${
                      recommendation.sanctionedLoadFeasibility.statusTone === "warning"
                        ? "text-[#92400E]"
                        : recommendation.sanctionedLoadFeasibility.statusTone === "verified"
                          ? "text-[#1B5E20]"
                          : "text-[#171A20]"
                    }`}
                  >
                    {recommendation.sanctionedLoadFeasibility.statusLabel}
                  </dd>
                </div>
                <div className="flex justify-between sm:block border-b sm:border-b-0 border-[#E3E4E6]/60 pb-1 sm:pb-0">
                  <dt className="text-[#5C5E62]">Gross Installed Cost</dt>
                  <dd className="font-medium tabular-nums text-[#171A20]">
                    ₹{formatInr(totalGrossInr)}
                  </dd>
                </div>
                <div className="flex justify-between sm:block border-b sm:border-b-0 border-[#E3E4E6]/60 pb-1 sm:pb-0">
                  <dt className="text-[#5C5E62]">Potential Central Subsidy*</dt>
                  <dd className="font-medium tabular-nums text-[#1B5E20]">
                    -₹{formatInr(subsidyInr)} (Conditional DBT)
                  </dd>
                </div>
                <div className="flex justify-between sm:block border-b sm:border-b-0 border-[#E3E4E6]/60 pb-1 sm:pb-0">
                  <dt className="text-[#5C5E62]">Conditional Cost After DBT*</dt>
                  <dd className="font-semibold tabular-nums text-[#171A20]">
                    ₹{formatInr(netPayableInr)}
                  </dd>
                </div>
                <div className="flex justify-between sm:block border-b sm:border-b-0 border-[#E3E4E6]/60 pb-1 sm:pb-0">
                  <dt className="text-[#5C5E62]">Indicative Annual Bill Savings</dt>
                  <dd className="font-medium tabular-nums text-[#171A20]">
                    {isUnavailable
                      ? "Detailed regional calculation unavailable — advisor assessment required."
                      : `~₹${formatInr(calculation.annualSavingsInr)}/yr`}
                  </dd>
                </div>
                <div className="sm:col-span-2 flex justify-between sm:block pt-1 border-t border-[#E3E4E6]">
                  <dt className="text-[#5C5E62]">Selected Investment Mode</dt>
                  <dd className="font-medium text-[#171A20]">
                    {paymentMode === "loan"
                      ? `Indicative 5-Year Financing (~₹${formatInr(monthlyEmiInr)}/mo post-DBT · ${calculation.financing.tierLabel})`
                      : "Direct Cash Purchase (100% Upfront Milestone Payment)"}
                  </dd>
                </div>
              </dl>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#92400E] bg-[#FEF3C7] px-2.5 py-0.5 rounded-[3px]">
                  Preliminary Solar Assessment
                </span>
                <span className="text-[12px] text-[#5C5E62]">· Engineering Review</span>
              </div>
              <h2 className="text-[20px] font-medium tracking-tight text-[#171A20]">
                6. Request Architectural Feasibility Proposal
              </h2>
              <p className="text-[13px] text-[#5C5E62] mt-1 leading-relaxed">
                Submit your configuration for a WAVENOX advisor consultation, on-site terrace and
                electrical survey, and formal project quotation.
              </p>
            </div>

            {/* What Happens Next Steps */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[12px]">
              <div className="p-2.5 rounded-[4px] border border-[#E3E4E6] bg-[#FFFFFF]">
                <span className="font-semibold text-[#171A20] block">1. Advisor Call</span>
                <span className="text-[#5C5E62]">
                  Review 12-month electricity bills &amp; sanctioned load.
                </span>
              </div>
              <div className="p-2.5 rounded-[4px] border border-[#E3E4E6] bg-[#FFFFFF]">
                <span className="font-semibold text-[#171A20] block">2. Site Survey</span>
                <span className="text-[#5C5E62]">
                  On-site roof measurement, shade &amp; structural check.
                </span>
              </div>
              <div className="p-2.5 rounded-[4px] border border-[#E3E4E6] bg-[#FFFFFF]">
                <span className="font-semibold text-[#171A20] block">3. Formal Quote</span>
                <span className="text-[#5C5E62]">
                  Final engineering design, partner contract &amp; net-metering.
                </span>
              </div>
            </div>

            <form
              onSubmit={handleReserve}
              noValidate
              aria-describedby={submitError ? "studio-form-error" : undefined}
              className="space-y-4"
            >
              <div>
                <label
                  htmlFor="user-name"
                  className="block text-[12px] font-semibold text-[#171A20] uppercase tracking-[0.08em] mb-1.5"
                >
                  Full Name *
                </label>
                <input
                  id="user-name"
                  type="text"
                  required
                  value={userName}
                  onChange={(e) => {
                    setUserName(e.target.value);
                    if (submitError) setSubmitError(null);
                  }}
                  placeholder="First and last name"
                  className="w-full h-11 px-3.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-[6px] text-[14px] text-[#171A20] placeholder:text-[#9CA3AF] transition-colors focus:bg-[#FFFFFF] focus:border-[#171A20] focus:ring-1 focus:ring-[#171A20] focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="user-phone"
                  className="block text-[12px] font-semibold text-[#171A20] uppercase tracking-[0.08em] mb-1.5"
                >
                  Mobile Phone / WhatsApp (+91) *
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-[13px] font-medium text-[#5C5E62] select-none pointer-events-none border-r border-[#E5E7EB] pr-2.5">
                    +91
                  </span>
                  <input
                    id="user-phone"
                    type="tel"
                    required
                    value={userPhone}
                    onChange={(e) => {
                      setUserPhone(e.target.value);
                      if (submitError) setSubmitError(null);
                    }}
                    placeholder="10-digit mobile number"
                    maxLength={14}
                    className="w-full h-11 pl-16 pr-3.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-[6px] text-[14px] text-[#171A20] placeholder:text-[#9CA3AF] transition-colors focus:bg-[#FFFFFF] focus:border-[#171A20] focus:ring-1 focus:ring-[#171A20] focus:outline-none tabular-nums"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label
                    htmlFor="user-address"
                    className="block text-[12px] font-semibold text-[#171A20] uppercase tracking-[0.08em] mb-1.5"
                  >
                    City / Locality *
                  </label>
                  <input
                    id="user-address"
                    type="text"
                    required
                    value={address}
                    onChange={(e) => {
                      setAddress(e.target.value);
                      if (submitError) setSubmitError(null);
                    }}
                    placeholder="e.g. Hyderabad, Bengaluru"
                    className="w-full h-11 px-3.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-[6px] text-[14px] text-[#171A20] placeholder:text-[#9CA3AF] transition-colors focus:bg-[#FFFFFF] focus:border-[#171A20] focus:ring-1 focus:ring-[#171A20] focus:outline-none"
                  />
                </div>
                <div>
                  <label
                    htmlFor="user-pin"
                    className="block text-[12px] font-semibold text-[#171A20] uppercase tracking-[0.08em] mb-1.5"
                  >
                    6-Digit PIN Code *
                  </label>
                  <input
                    id="user-pin"
                    type="text"
                    required
                    maxLength={6}
                    pattern="[1-9][0-9]{5}"
                    inputMode="numeric"
                    value={pinCode}
                    onChange={(e) => {
                      setPinCode(e.target.value.replace(/\D/g, "").slice(0, 6));
                      if (submitError) setSubmitError(null);
                    }}
                    placeholder="e.g. 500033"
                    className="w-full h-11 px-3.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-[6px] text-[14px] text-[#171A20] placeholder:text-[#9CA3AF] transition-colors focus:bg-[#FFFFFF] focus:border-[#171A20] focus:ring-1 focus:ring-[#171A20] focus:outline-none tabular-nums"
                  />
                </div>
              </div>
              <p className="text-[12px] text-[#5C5E62]/80">
                PIN code is required to verify local DISCOM substation transformer capacity and PM
                Surya Ghar feeder clearance.
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
                  id="studio-hp-extra"
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
                  id="studio-consent"
                  required
                  checked={consentGiven}
                  onChange={(e) => {
                    setConsentGiven(e.target.checked);
                    if (submitError) setSubmitError(null);
                  }}
                  className="mt-1 h-4 w-4 rounded-[4px] border-[#CBD5E1] text-[#171A20] focus:ring-1 focus:ring-[#171A20] cursor-pointer shrink-0"
                />
                <label
                  htmlFor="studio-consent"
                  className="text-[12px] text-[#5C5E62] leading-relaxed cursor-pointer"
                >
                  I consent to WAVENOX processing my details to prepare my solar proposal,
                  coordinate feasibility and installation assessment, and contact me in accordance
                  with the <strong>DPDP Act 2023</strong>. Project details may be shared only as
                  necessary with authorized WAVENOX installation partners and utility/subsidy
                  authorities, and are never sold to third-party lead aggregators. See our{" "}
                  <a href="/legal/privacy" className="underline hover:text-[#171A20]">
                    Privacy Policy
                  </a>
                  .
                </label>
              </div>

              {submitError && (
                <div
                  id="studio-form-error"
                  role="alert"
                  className="p-3.5 rounded-[6px] bg-[#B42318]/10 border border-[#B42318]/30 text-[#B42318] text-[13px] flex items-center gap-2"
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2.5">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 h-12 px-5 rounded-[6px] bg-[#171A20] text-[#FFFFFF] text-[14px] font-medium tracking-[0.02em] hover:bg-[#2B2F36] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ShieldCheck className="w-4 h-4 text-[#F57C00]" />
                  <span>{isSubmitting ? "Generating Proposal..." : "Request Solar Proposal"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPreviewDossierOpen(true)}
                  className="h-12 px-4 rounded-[6px] border border-[#E5E7EB] bg-[#FFFFFF] text-[#171A20] text-[13px] font-medium hover:bg-[#F9FAFB] active:scale-[0.99] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  title="Preview Preliminary Solar Assessment"
                >
                  <FileText className="w-4 h-4 text-[#5C5E62]" />
                  <span>Preview Proposal (PDF)</span>
                </button>
              </div>

              <div className="pt-2 text-center">
                <a
                  href={BRAND_CONFIG.contact.whatsapp.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-[13px] font-medium text-[#5C5E62] hover:text-[#171A20] transition-colors"
                >
                  <MessageSquare className="w-4 h-4 text-[#F57C00]" />
                  <span>Prefer direct advisor assistance? Chat on WhatsApp →</span>
                </a>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Sticky Mobile Bottom Bar (hidden when modal open) */}
      {!previewDossierOpen && (
        <div className="fixed bottom-0 inset-x-0 z-30 bg-[#FFFFFF] border-t border-[#E3E4E6] px-4 py-2.5 flex sm:hidden items-center justify-between gap-3 shadow-lg">
          <div className="min-w-0">
            <div className="text-[12px] text-[#5C5E62] truncate">
              {systemKw} kW ({panelCount} Panels) · Gross ₹{formatInr(totalGrossInr)}
            </div>
            <div className="text-[15px] font-semibold tabular-nums text-[#171A20]">
              ₹{formatInr(netPayableInr)}{" "}
              <span className="text-[12px] font-normal text-[#5C5E62]">Post-DBT*</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              const form = document.getElementById("user-name");
              form?.scrollIntoView({ behavior: "smooth" });
              form?.focus();
            }}
            className="h-10 px-4 rounded-[4px] bg-[#171A20] text-[#FFFFFF] text-[13px] font-medium shrink-0 cursor-pointer"
          >
            Request Proposal
          </button>
        </div>
      )}

      {/* Architectural Feasibility Proposal Preview Modal */}
      <ArchitecturalDossierModal
        isOpen={previewDossierOpen}
        onClose={() => setPreviewDossierOpen(false)}
        data={currentDossierData}
      />
    </div>
  );
}
