/**
 * ============================================================================
 * STEP 4 — EXPLAINABLE SOLAR RECOMMENDATION & STUDIO GUIDANCE LAYER
 * ============================================================================
 *
 * Deterministic, rule-based recommendation, roof-sketcher geometry, and
 * battery backup guidance layer built strictly ABOVE the verified Step 3
 * calculation engine (`estimate()`, `validateRoofFeasibility()`, `PRODUCTS_CONFIG`).
 *
 * Zero duplicated tariff, net-metering, subsidy, EMI, or 25-year cash-flow math.
 */

import { PRODUCTS_CONFIG } from "@/config/products";
import {
  getSolarYieldProfileForDiscom,
  type SanctionedLoadFeasibilityAssessment,
  type VerificationStatus,
} from "@/config/regulatory";
import {
  DISCOMS,
  SOLAR_ASSUMPTIONS,
  estimate,
  validateRoofFeasibility,
  type DiscomInfo,
  type EstimateResult,
  type RoofFeasibilityAssessment,
  type SolarFinancingAssessment,
} from "@/config/solar";

export type RecommendationStatusLabel =
  | "Recommended"
  | "Customer Selected"
  | "Requires Site Assessment"
  | "Utility Verification Required";

export type BackupPriorityId =
  "essential-lighting" | "work-connectivity" | "kitchen-refrigeration" | "climate-comfort";

export interface BackupPriorityOption {
  id: BackupPriorityId;
  label: string;
  typicalLoadRangeWatts: [number, number];
  appliancesSummary: string;
  recommendedMinBatteryUnits: number;
}

export const BACKUP_PRIORITY_OPTIONS: BackupPriorityOption[] = [
  {
    id: "essential-lighting",
    label: "Essential Lighting & Fans",
    typicalLoadRangeWatts: [250, 450],
    appliancesSummary: "LED lighting circuits, 3–4 BLDC ceiling fans, and mobile charging",
    recommendedMinBatteryUnits: 1,
  },
  {
    id: "work-connectivity",
    label: "Wi-Fi, Workstations & Security",
    typicalLoadRangeWatts: [400, 750],
    appliancesSummary:
      "Lighting, BLDC fans, fiber Wi-Fi gateway, 2 workstations, CCTV, and entry automation",
    recommendedMinBatteryUnits: 1,
  },
  {
    id: "kitchen-refrigeration",
    label: "Refrigerator & Home Circuits",
    typicalLoadRangeWatts: [650, 1100],
    appliancesSummary:
      "Inverter refrigerator, lighting, fans, Wi-Fi, television, and intermittent water booster pump",
    recommendedMinBatteryUnits: 1,
  },
  {
    id: "climate-comfort",
    label: "Extended Backup + Inverter AC",
    typicalLoadRangeWatts: [1400, 2400],
    appliancesSummary:
      "Essential home circuits, inverter refrigerator, and 1–2 BEE 5-Star inverter air conditioners",
    recommendedMinBatteryUnits: 2,
  },
];

export interface BatteryOptionDetail {
  units: number;
  label: string;
  sublabel: string;
  usableCapacityKwh: number;
  nominalCapacityKwh: number;
  continuousPowerKw: number;
  peakPowerKw: number;
  priceInr: number;
  headline: string;
  outageBehavior: string;
  illustrativeRuntimeRangeHours: [number, number] | null;
  illustrativeRuntimeLabel: string;
}

export interface BatteryGuidanceSummary {
  selectedUnits: number;
  selectedOption: BatteryOptionDetail;
  options: BatteryOptionDetail[];
  selectedPriority: BackupPriorityOption;
  unitPriceInr: number;
  totalBatteryPriceInr: number;
  modelName: string;
  chemistry: string;
  usableCapacityPerUnitKwh: number;
  nominalCapacityPerUnitKwh: number;
  continuousPowerPerUnitKw: number;
  peakPowerPerUnitKw: number;
  roundTripEfficiencyPct: number;
  islandingTransferSpeedMs: string;
  warrantyYears: number;
  warrantyCycles: number;
  solarOnlySummary: string;
  solarPlusBatterySummary: string;
  compatibilityDisclosures: string[];
}

export interface RoofSketcherGeometryResult {
  grossAreaSqft: number;
  parapetMarginFt: number;
  setbackDeductionSqft: number;
  waterTankSqft: number;
  walkwaySqft: number;
  totalDeductionsSqft: number;
  rawNetSqft: number;
  netUsableSqft: number;
  panelWatt: number;
  moduleFootprintPerPanelSqft: number;
  clearRoofPerPanelSqft: number;
  maxFeasiblePanels: number;
  maxFeasibleKw: number;
  physicalModuleFootprintSqft: number;
  recommendedClearRoofSqft: number;
  city: string;
  state: string;
  yieldStatus: VerificationStatus;
  annualYieldKwhPerKw: number;
  estimatedAnnualKwh: number;
  estimatedMonthlyKwh: number;
  isZeroOrNegativeUsable: boolean;
  isBelowMinimumArray: boolean;
  isFeasibleForStandardArray: boolean;
  warning: string | null;
  roofFeasibility: RoofFeasibilityAssessment;
}

/**
 * Pure, deterministic roof geometry & feasibility calculator for `RoofSketcher`.
 * - Never enforces an artificial 200 sq.ft. floor (`Math.max(0, rawNetSqft)`).
 * - Uses `PRODUCTS_CONFIG.module.ratedPowerW` (580W) and `validateRoofFeasibility()`.
 * - Uses the selected DISCOM's actual regional solar yield profile rather than
 *   hardcoding Hyderabad's 1490 kWh/kWp/yr across all regions.
 */
export function calculateRoofSketcherGeometry(params: {
  grossAreaSqft: number;
  parapetMarginFt: number;
  waterTankSqft: number;
  walkwaySqft: number;
  discomCode?: string;
  targetPanels?: number;
}): RoofSketcherGeometryResult {
  const grossAreaSqft =
    typeof params.grossAreaSqft === "number" &&
    Number.isFinite(params.grossAreaSqft) &&
    params.grossAreaSqft > 0
      ? Math.round(params.grossAreaSqft)
      : 0;

  const parapetMarginFt =
    typeof params.parapetMarginFt === "number" &&
    Number.isFinite(params.parapetMarginFt) &&
    params.parapetMarginFt >= 0
      ? params.parapetMarginFt
      : 0;

  const waterTankSqft =
    typeof params.waterTankSqft === "number" &&
    Number.isFinite(params.waterTankSqft) &&
    params.waterTankSqft >= 0
      ? Math.round(params.waterTankSqft)
      : 0;

  const walkwaySqft =
    typeof params.walkwaySqft === "number" &&
    Number.isFinite(params.walkwaySqft) &&
    params.walkwaySqft >= 0
      ? Math.round(params.walkwaySqft)
      : 0;

  const panelWatt = PRODUCTS_CONFIG.module.ratedPowerW;
  const moduleFootprintPerPanelSqft = SOLAR_ASSUMPTIONS.panelFootprintSqft;
  const clearRoofPerPanelSqft = Number(
    ((panelWatt / 1000) * SOLAR_ASSUMPTIONS.clearRoofSqftPerKw).toFixed(1),
  );

  const approxPerimeterFt = grossAreaSqft > 0 ? 4 * Math.sqrt(grossAreaSqft) : 0;
  const setbackDeductionSqft = Math.round(approxPerimeterFt * parapetMarginFt);
  const totalDeductionsSqft = setbackDeductionSqft + waterTankSqft + walkwaySqft;
  const rawNetSqft = grossAreaSqft - totalDeductionsSqft;
  const netUsableSqft = Math.max(0, rawNetSqft);

  const maxFeasiblePanels =
    netUsableSqft > 0
      ? Math.max(
          0,
          Math.floor(((netUsableSqft / SOLAR_ASSUMPTIONS.clearRoofSqftPerKw) * 1000) / panelWatt),
        )
      : 0;
  const maxFeasibleKw = Number(((maxFeasiblePanels * panelWatt) / 1000).toFixed(2));
  const physicalModuleFootprintSqft = Math.round(maxFeasiblePanels * moduleFootprintPerPanelSqft);
  const recommendedClearRoofSqft = Math.round(maxFeasibleKw * SOLAR_ASSUMPTIONS.clearRoofSqftPerKw);

  const panelsToValidate =
    typeof params.targetPanels === "number" &&
    Number.isFinite(params.targetPanels) &&
    params.targetPanels > 0
      ? Math.round(params.targetPanels)
      : maxFeasiblePanels;

  // Delegate feasibility validation to Step 3 `validateRoofFeasibility()`
  // When netUsableSqft === 0, pass 0.01 or handle zero explicitly so validateRoofFeasibility
  // evaluates against the actual usable area rather than treating 0 as "unknown/null".
  const baseFeasibility = validateRoofFeasibility(
    panelsToValidate,
    panelWatt,
    netUsableSqft > 0 ? netUsableSqft : undefined,
  );

  const roofFeasibility: RoofFeasibilityAssessment =
    netUsableSqft === 0
      ? {
          ...baseFeasibility,
          availableRoofSqft: 0,
          maxFeasiblePanels: 0,
          maxFeasibleKw: 0,
          isFeasible: panelsToValidate === 0,
          utilizationPct: panelsToValidate > 0 ? 100 : 0,
          warning:
            grossAreaSqft <= 0
              ? "Gross roof area is 0 sq.ft. Enter your approximate terrace area to evaluate module layout feasibility."
              : `Parapet setbacks (${setbackDeductionSqft} sq.ft.), water tank/mumty (${waterTankSqft} sq.ft.), and walkways (${walkwaySqft} sq.ft.) consume the entire ${grossAreaSqft} sq.ft. gross roof area (0 sq.ft. net usable roof).`,
        }
      : baseFeasibility;

  // Regional yield lookup via selected DISCOM
  const matchedDiscom = params.discomCode
    ? DISCOMS.find((d) => d.code === params.discomCode)
    : DISCOMS[0];
  const isUnknownDiscom = Boolean(params.discomCode && !matchedDiscom);
  const yieldProfile = getSolarYieldProfileForDiscom(
    isUnknownDiscom ? params.discomCode : (matchedDiscom?.code ?? DISCOMS[0].code),
  );

  const yieldStatus: VerificationStatus = isUnknownDiscom ? "UNAVAILABLE" : yieldProfile.status;
  const annualYieldKwhPerKw = isUnknownDiscom ? 0 : yieldProfile.annualKwhPerKw;
  const estimatedAnnualKwh =
    isUnknownDiscom || maxFeasibleKw <= 0 ? 0 : Math.round(maxFeasibleKw * annualYieldKwhPerKw);
  const estimatedMonthlyKwh =
    isUnknownDiscom || estimatedAnnualKwh <= 0 ? 0 : Math.round(estimatedAnnualKwh / 12);

  const isZeroOrNegativeUsable = netUsableSqft <= 0 || maxFeasiblePanels === 0;
  const minStandardPanels = Math.ceil(
    (SOLAR_ASSUMPTIONS.minResidentialKw * 1000) / SOLAR_ASSUMPTIONS.panelWatt,
  ); // 6 panels (3.48 kW)
  const isBelowMinimumArray = !isZeroOrNegativeUsable && maxFeasiblePanels < minStandardPanels;
  const isFeasibleForStandardArray =
    !isZeroOrNegativeUsable && !isBelowMinimumArray && roofFeasibility.isFeasible;

  let warning: string | null = null;
  if (grossAreaSqft <= 0) {
    warning =
      "Gross roof area is 0 sq.ft. Enter a positive terrace area to estimate usable solar capacity.";
  } else if (rawNetSqft <= 0) {
    warning = `Setbacks (${setbackDeductionSqft} sq.ft.), water tank/mumty (${waterTankSqft} sq.ft.), and walkways (${walkwaySqft} sq.ft.) exceed the ${grossAreaSqft} sq.ft. gross terrace area — leaving 0 sq.ft. of usable solar space. Reduce deductions or request a custom elevated pergola structural review.`;
  } else if (maxFeasiblePanels === 0) {
    warning = `Only ${netUsableSqft} sq.ft. remains after deductions, which is below the ~${Math.round(clearRoofPerPanelSqft)} sq.ft. shadow-free area needed per ${panelWatt}W module (including row spacing).`;
  } else if (isBelowMinimumArray) {
    warning = `Net usable roof (${netUsableSqft} sq.ft.) supports up to ${maxFeasiblePanels} modules (${maxFeasibleKw} kW) on standard ballast frames, below the standard ${minStandardPanels}-panel (${SOLAR_ASSUMPTIONS.minResidentialKw}+ kW) residential string configuration. An elevated steel pergola or custom string design will be assessed during site survey.`;
  } else if (!roofFeasibility.isFeasible && roofFeasibility.warning) {
    warning = roofFeasibility.warning;
  }

  return {
    grossAreaSqft,
    parapetMarginFt,
    setbackDeductionSqft,
    waterTankSqft,
    walkwaySqft,
    totalDeductionsSqft,
    rawNetSqft,
    netUsableSqft,
    panelWatt,
    moduleFootprintPerPanelSqft,
    clearRoofPerPanelSqft,
    maxFeasiblePanels,
    maxFeasibleKw,
    physicalModuleFootprintSqft,
    recommendedClearRoofSqft,
    city: yieldProfile.city,
    state: yieldProfile.state,
    yieldStatus,
    annualYieldKwhPerKw,
    estimatedAnnualKwh,
    estimatedMonthlyKwh,
    isZeroOrNegativeUsable,
    isBelowMinimumArray,
    isFeasibleForStandardArray,
    warning,
    roofFeasibility,
  };
}

/**
 * Builds structured, honest battery storage guidance directly from `PRODUCTS_CONFIG.battery`
 * and `SOLAR_ASSUMPTIONS.battery`. Never fabricates fixed whole-home backup hours.
 */
export function buildBatteryGuidance(params: {
  selectedUnits: number;
  backupPriority?: BackupPriorityId;
}): BatteryGuidanceSummary {
  const safeUnits =
    typeof params.selectedUnits === "number" &&
    Number.isFinite(params.selectedUnits) &&
    params.selectedUnits >= 0
      ? Math.min(3, Math.max(0, Math.round(params.selectedUnits)))
      : 0;

  const selectedPriority =
    BACKUP_PRIORITY_OPTIONS.find((p) => p.id === params.backupPriority) ??
    BACKUP_PRIORITY_OPTIONS[2];

  const unitUsableKwh = PRODUCTS_CONFIG.battery.usableCapacityKwh;
  const unitNominalKwh = PRODUCTS_CONFIG.battery.nominalEnergyKwh;
  const unitContinuousKw = PRODUCTS_CONFIG.battery.continuousPowerKw;
  const unitPeakKw = PRODUCTS_CONFIG.battery.peakPowerKw;
  const unitPriceInr = SOLAR_ASSUMPTIONS.battery.unitPriceInr;
  const rteFactor = PRODUCTS_CONFIG.battery.roundTripEfficiencyPct / 100;

  const computeIllustrativeRange = (units: number): [number, number] | null => {
    if (units <= 0) return null;
    // Account for round-trip efficiency and a 10% reserve floor
    const effectiveDeliverableWh = units * unitUsableKwh * 1000 * rteFactor * 0.9;
    const [minW, maxW] = selectedPriority.typicalLoadRangeWatts;
    const lowHours = Math.max(1, Math.round((effectiveDeliverableWh / maxW) * 10) / 10);
    const highHours = Math.max(lowHours, Math.round((effectiveDeliverableWh / minW) * 10) / 10);
    return [lowHours, highHours];
  };

  const options: BatteryOptionDetail[] = [
    {
      units: 0,
      label: "Solar Only",
      sublabel: "0 Units · Grid-Tied",
      usableCapacityKwh: 0,
      nominalCapacityKwh: 0,
      continuousPowerKw: 0,
      peakPowerKw: 0,
      priceInr: 0,
      headline:
        "Lowest upfront investment. Exports daytime surplus via net-metering; automatically shuts down during grid outages for anti-islanding safety.",
      outageBehavior: "No backup power during utility grid outages (mandatory anti-islanding).",
      illustrativeRuntimeRangeHours: null,
      illustrativeRuntimeLabel: "Grid-dependent (0 hrs outage backup)",
    },
    ...[1, 2, 3].map((units) => {
      const usableCapacityKwh = Number((units * unitUsableKwh).toFixed(1));
      const nominalCapacityKwh = Number((units * unitNominalKwh).toFixed(1));
      const continuousPowerKw = Number((units * unitContinuousKw).toFixed(1));
      const peakPowerKw = Number((units * unitPeakKw).toFixed(1));
      const priceInr = units * unitPriceInr;
      const range = computeIllustrativeRange(units);
      const [minW, maxW] = selectedPriority.typicalLoadRangeWatts;

      const headlines: Record<number, string> = {
        1: `Single ${unitUsableKwh} kWh usable (${unitNominalKwh} kWh nominal) LiFePO4 stack for essential protected circuits and evening load shifting.`,
        2: `Dual-stack ${usableCapacityKwh} kWh usable (${nominalCapacityKwh} kWh nominal) LiFePO4 storage for higher-load backup circuits including select inverter AC loads.`,
        3: `Triple-stack ${usableCapacityKwh} kWh usable (${nominalCapacityKwh} kWh nominal) LiFePO4 bank for large villa load profiles and extended outage resilience.`,
      };

      return {
        units,
        label: `${units} Unit${units > 1 ? "s" : ""}`,
        sublabel: `${usableCapacityKwh} kWh Usable`,
        usableCapacityKwh,
        nominalCapacityKwh,
        continuousPowerKw,
        peakPowerKw,
        priceInr,
        headline: headlines[units],
        outageBehavior: `${PRODUCTS_CONFIG.battery.islandingTransferSpeedMs} automatic islanding transfer up to ${continuousPowerKw} kW continuous (${peakPowerKw} kW peak) on wired backup sub-panels.`,
        illustrativeRuntimeRangeHours: range,
        illustrativeRuntimeLabel: range
          ? `~${range[0]}–${range[1]} hrs illustrative at ${minW}–${maxW} W (${selectedPriority.label})`
          : "Load-dependent",
      };
    }),
  ];

  const selectedOption = options.find((o) => o.units === safeUnits) ?? options[0];

  return {
    selectedUnits: safeUnits,
    selectedOption,
    options,
    selectedPriority,
    unitPriceInr,
    totalBatteryPriceInr: safeUnits * unitPriceInr,
    modelName: PRODUCTS_CONFIG.battery.modelName,
    chemistry: PRODUCTS_CONFIG.battery.chemistry,
    usableCapacityPerUnitKwh: unitUsableKwh,
    nominalCapacityPerUnitKwh: unitNominalKwh,
    continuousPowerPerUnitKw: unitContinuousKw,
    peakPowerPerUnitKw: unitPeakKw,
    roundTripEfficiencyPct: PRODUCTS_CONFIG.battery.roundTripEfficiencyPct,
    islandingTransferSpeedMs: PRODUCTS_CONFIG.battery.islandingTransferSpeedMs,
    warrantyYears: PRODUCTS_CONFIG.battery.warrantyYears,
    warrantyCycles: PRODUCTS_CONFIG.battery.warrantyCycles ?? 6000,
    solarOnlySummary:
      "Lower initial investment with 1:1 billing-period net-metering. Standard grid-tied solar inverters automatically isolate during power cuts to protect utility line workers and do not provide backup power without storage.",
    solarPlusBatterySummary:
      "Adds LiFePO4 energy storage for outage resilience and evening solar self-consumption. Increase in initial capital outlay does not accelerate financial payback under 1:1 net-metering and is chosen for backup security.",
    compatibilityDisclosures: [
      `Actual backup runtime depends on real-time appliance draw, ambient temperature, battery state-of-charge at outage onset, and inverter reserve settings.`,
      `Backup power is delivered only to circuits wired to the hybrid inverter's protected backup load sub-panel (up to ${selectedOption.continuousPowerKw || unitContinuousKw} kW continuous output) and requires on-site electrical distribution verification.`,
      `Standalone or hybrid battery storage is excluded from central PM Surya Ghar CFA subsidies and concessional SBI PM Surya Ghar loan tiers.`,
    ],
  };
}

export interface SolarRecommendationInput {
  discomCode?: string;
  monthlyBillInr?: number;
  inputMode?: "estimate" | "known";
  monthlyUnitsOverride?: number;
  availableRoofSqft?: number;
  sanctionedLoadKw?: number;
  sanctionedLoadConfirmed?: boolean;
  selectedPanels?: number;
  isManualPanelOverride?: boolean;
  selectedBatteryUnits?: number;
  backupPriority?: BackupPriorityId;
  paymentMode?: "cash" | "loan";
}

export interface SolarRecommendationResult {
  recommendedCapacityKw: number;
  recommendedPanels: number;
  currentSelectedPanels: number;
  currentSelectedKw: number;
  isCustomPanelSelection: boolean;
  panelDeltaFromRecommended: number;
  recommendationStatus: RecommendationStatusLabel;
  jurisdictionStatus: VerificationStatus;
  jurisdictionBadgeLabel: string;
  consumptionBasisLabel: string;
  estimatedGeneration: {
    annualKwh: number;
    recommendedAnnualKwh: number;
    monthlyAvgKwh: number;
    yieldKwhPerKwYear: number;
    city: string;
    state: string;
    status: VerificationStatus;
  };
  roofFeasibility: RoofFeasibilityAssessment & {
    statusLabel: string;
    statusTone: "verified" | "warning" | "neutral";
  };
  sanctionedLoadFeasibility: SanctionedLoadFeasibilityAssessment & {
    statusLabel: string;
    statusTone: "verified" | "warning" | "neutral";
  };
  batteryGuidance: BatteryGuidanceSummary;
  financingAvailability: {
    paymentMode: "cash" | "loan";
    isSchemeEligible: boolean;
    rateLabel: string;
    annualInterestRatePct: number;
    customerDownPaymentInr: number;
    initialLoanPrincipalInr: number;
    initialMonthlyEmiInr: number;
    postSubsidyMonthlyEmiInr: number;
    subsidyCreditedToLoanInr: number;
    totalInterestInr: number;
    prepaymentModeDisclosure: string;
    assessment: SolarFinancingAssessment;
  };
  explanation: string;
  customizationNotice: string | null;
  assumptions: EstimateResult["assumptions"];
  warnings: string[];
  disclosures: string[];
  discom: DiscomInfo;
  estimateResult: EstimateResult;
}

/**
 * Pure, deterministic recommendation builder above Step 3 `estimate()`.
 */
export function buildSolarRecommendation(
  input: SolarRecommendationInput = {},
): SolarRecommendationResult {
  const safeBill =
    typeof input.monthlyBillInr === "number" &&
    Number.isFinite(input.monthlyBillInr) &&
    input.monthlyBillInr >= 0
      ? Math.round(input.monthlyBillInr)
      : 12000;

  const paymentMode = input.paymentMode === "cash" ? "cash" : "loan";
  const inputMode = input.inputMode === "known" ? "known" : "estimate";

  const hasValidUnitsOverride =
    inputMode === "known" &&
    typeof input.monthlyUnitsOverride === "number" &&
    Number.isFinite(input.monthlyUnitsOverride) &&
    input.monthlyUnitsOverride > 0;

  const hasKnownRoof =
    typeof input.availableRoofSqft === "number" &&
    Number.isFinite(input.availableRoofSqft) &&
    input.availableRoofSqft >= 0;

  const hasKnownSanctionedLoad =
    inputMode === "known" &&
    typeof input.sanctionedLoadKw === "number" &&
    Number.isFinite(input.sanctionedLoadKw) &&
    input.sanctionedLoadKw > 0;

  const estimateResult = estimate({
    monthlyBillInr: safeBill,
    monthlyUnitsOverride: hasValidUnitsOverride ? input.monthlyUnitsOverride : undefined,
    discomCode: input.discomCode,
    segment: "residential",
    panels: input.selectedPanels,
    batteryUnits: input.selectedBatteryUnits,
    paymentMode,
    availableRoofSqft: hasKnownRoof ? input.availableRoofSqft : undefined,
    sanctionedLoadKw: hasKnownSanctionedLoad ? input.sanctionedLoadKw : undefined,
    sanctionedLoadConfirmed: hasKnownSanctionedLoad
      ? Boolean(input.sanctionedLoadConfirmed)
      : false,
  });

  const discom = estimateResult.assumptions.discom;
  const jurisdictionStatus = estimateResult.status;

  const recommendedPanels = estimateResult.recommendedPanels;
  const recommendedCapacityKw = estimateResult.recommendedKw;
  const currentSelectedPanels = estimateResult.panels;
  const currentSelectedKw = estimateResult.systemKw;
  const panelDeltaFromRecommended = currentSelectedPanels - recommendedPanels;
  const isCustomPanelSelection = Boolean(
    input.isManualPanelOverride || currentSelectedPanels !== recommendedPanels,
  );

  // Determine overall recommendation status badge
  let recommendationStatus: RecommendationStatusLabel = "Recommended";
  if (jurisdictionStatus === "UNAVAILABLE") {
    recommendationStatus = "Utility Verification Required";
  } else if (
    !estimateResult.roofFeasibility.isFeasible ||
    estimateResult.sanctionedLoadFeasibility.requiresLoadEnhancement
  ) {
    recommendationStatus = "Requires Site Assessment";
  } else if (isCustomPanelSelection) {
    recommendationStatus = "Customer Selected";
  }

  const jurisdictionBadgeLabel =
    jurisdictionStatus === "VERIFIED"
      ? `Verified ${discom.authority} Schedule`
      : jurisdictionStatus === "INDICATIVE"
        ? "Indicative Regional Benchmark"
        : "Utility Verification Required";

  const consumptionBasisLabel =
    jurisdictionStatus === "UNAVAILABLE"
      ? "Regional tariff & consumption derivation unavailable — advisor review required"
      : hasValidUnitsOverride
        ? `Customer-entered ${estimateResult.monthlyUnits.toLocaleString("en-IN")} kWh/month (${estimateResult.annualConsumptionKwh.toLocaleString("en-IN")} kWh/yr)`
        : `Estimated ~${estimateResult.monthlyUnits.toLocaleString("en-IN")} kWh/month from ₹${safeBill.toLocaleString("en-IN")}/mo ${discom.code} bill`;

  const yieldProfile = getSolarYieldProfileForDiscom(
    jurisdictionStatus === "UNAVAILABLE" ? input.discomCode : discom.code,
  );
  const recommendedAnnualKwh =
    jurisdictionStatus === "UNAVAILABLE"
      ? 0
      : Math.round(recommendedCapacityKw * estimateResult.assumptions.yieldKwhPerKwYear);

  // Roof feasibility status enrichment
  let roofStatusLabel = "Roof Area Not Entered — Requires Site Survey";
  let roofStatusTone: "verified" | "warning" | "neutral" = "neutral";
  if (estimateResult.roofFeasibility.availableRoofSqft !== null) {
    if (estimateResult.roofFeasibility.isFeasible) {
      roofStatusLabel = `Fits Available Roof (~${estimateResult.roofFeasibility.recommendedClearRoofSqft} of ${estimateResult.roofFeasibility.availableRoofSqft} sq.ft. used)`;
      roofStatusTone = "verified";
    } else {
      roofStatusLabel = `Requires Site Assessment — Exceeds ${estimateResult.roofFeasibility.availableRoofSqft} sq.ft. Usable Roof`;
      roofStatusTone = "warning";
    }
  }

  // Sanctioned load status enrichment
  const sl = estimateResult.sanctionedLoadFeasibility;
  let slStatusLabel = `Unverified ${sl.assumedSanctionedLoadKw} kW Baseline — Utility Verification Required`;
  let slStatusTone: "verified" | "warning" | "neutral" = "neutral";
  if (sl.requiresLoadEnhancement) {
    slStatusLabel = sl.sanctionedLoadConfirmed
      ? `Requires Load Enhancement (${currentSelectedKw} kW > ${sl.knownSanctionedLoadKw} kW Sanctioned Load)`
      : `Requires Load Verification / Enhancement (Needs ≥ ${sl.requiredSanctionedLoadKwForSystem} kW Sanctioned Load)`;
    slStatusTone = "warning";
  } else if (sl.sanctionedLoadConfirmed && sl.knownSanctionedLoadKw !== null) {
    slStatusLabel = `Within Customer-Entered ${sl.knownSanctionedLoadKw} kW Sanctioned Load`;
    slStatusTone = "verified";
  }

  const explanation =
    jurisdictionStatus === "UNAVAILABLE"
      ? `Tariff schedules and solar meteorology for "${discom.code}" are not in the verified WAVENOX registry. A baseline ${recommendedCapacityKw} kW (${recommendedPanels} × ${SOLAR_ASSUMPTIONS.panelWatt}W) reference array is shown for hardware sizing only; request a solar advisor assessment for utility-specific modeling.`
      : `Based on your ${hasValidUnitsOverride ? `entered ${estimateResult.monthlyUnits.toLocaleString("en-IN")} kWh/month usage` : `estimated ~${estimateResult.monthlyUnits.toLocaleString("en-IN")} kWh/month usage (₹${safeBill.toLocaleString("en-IN")}/mo)`} under ${discom.code} (${discom.state}), a ${recommendedCapacityKw} kW array (${recommendedPanels} × ${PRODUCTS_CONFIG.module.ratedPowerW}W N-Type TOPCon modules) generates ~${recommendedAnnualKwh.toLocaleString("en-IN")} kWh/year (${estimateResult.assumptions.yieldKwhPerKwYear} kWh/kWp/yr in ${yieldProfile.city}) to offset a substantial portion of your annual grid consumption. Final capacity depends on shadow-free roof area (~${Math.round(recommendedCapacityKw * SOLAR_ASSUMPTIONS.clearRoofSqftPerKw)} sq.ft. recommended), sanctioned load, and on-site structural assessment.`;

  const customizationNotice =
    isCustomPanelSelection && panelDeltaFromRecommended !== 0
      ? `You have customized the array to ${currentSelectedKw} kW (${currentSelectedPanels} panels), which is ${Math.abs(panelDeltaFromRecommended)} panel${Math.abs(panelDeltaFromRecommended) > 1 ? "s" : ""} ${panelDeltaFromRecommended > 0 ? "above" : "below"} the consumption-based recommendation of ${recommendedCapacityKw} kW (${recommendedPanels} panels).`
      : null;

  const batteryGuidance = buildBatteryGuidance({
    selectedUnits: input.selectedBatteryUnits ?? 0,
    backupPriority: input.backupPriority,
  });

  const fin = estimateResult.financing;
  const prepaymentModeDisclosure = fin.isSchemeEligible
    ? `Eligible for SBI PM Surya Ghar scheme financing (${fin.annualInterestRatePct}% p.a. floating, eff. ${fin.effectiveAsOf}). Post-commissioning DBT subsidy (up to ₹${fin.subsidyCreditedToLoanInr.toLocaleString("en-IN")}) is credited to the solar loan account to reduce principal and recast EMI.`
    : `Illustrative non-scheme financing scenario (${fin.annualInterestRatePct}% p.a. modeling assumption). Direct loan-account DBT prepayment is only verified under the SBI PM Surya Ghar scheme (≤ 10 kW, ≤ ₹6,00,000 solar loan); for non-scheme loans, unadjusted EMI (~₹${fin.initialMonthlyEmiInr.toLocaleString("en-IN")}/mo) applies unless your lender permits zero-penalty prepayment upon DBT receipt.`;

  return {
    recommendedCapacityKw,
    recommendedPanels,
    currentSelectedPanels,
    currentSelectedKw,
    isCustomPanelSelection,
    panelDeltaFromRecommended,
    recommendationStatus,
    jurisdictionStatus,
    jurisdictionBadgeLabel,
    consumptionBasisLabel,
    estimatedGeneration: {
      annualKwh: estimateResult.annualGenKwh,
      recommendedAnnualKwh,
      monthlyAvgKwh: Math.round(estimateResult.annualGenKwh / 12),
      yieldKwhPerKwYear: estimateResult.assumptions.yieldKwhPerKwYear,
      city: yieldProfile.city,
      state: yieldProfile.state,
      status: estimateResult.verificationBreakdown.solarGeneration,
    },
    roofFeasibility: {
      ...estimateResult.roofFeasibility,
      statusLabel: roofStatusLabel,
      statusTone: roofStatusTone,
    },
    sanctionedLoadFeasibility: {
      ...estimateResult.sanctionedLoadFeasibility,
      statusLabel: slStatusLabel,
      statusTone: slStatusTone,
    },
    batteryGuidance,
    financingAvailability: {
      paymentMode,
      isSchemeEligible: fin.isSchemeEligible,
      rateLabel: fin.tierLabel,
      annualInterestRatePct: fin.annualInterestRatePct,
      customerDownPaymentInr: fin.customerDownPaymentInr,
      initialLoanPrincipalInr: fin.initialLoanPrincipalInr,
      initialMonthlyEmiInr: fin.initialMonthlyEmiInr,
      postSubsidyMonthlyEmiInr: fin.postSubsidyMonthlyEmiInr,
      subsidyCreditedToLoanInr: fin.subsidyCreditedToLoanInr,
      totalInterestInr: fin.totalInterestInr,
      prepaymentModeDisclosure,
      assessment: fin,
    },
    explanation,
    customizationNotice,
    assumptions: estimateResult.assumptions,
    warnings: estimateResult.warnings,
    disclosures: estimateResult.disclosures,
    discom,
    estimateResult,
  };
}
