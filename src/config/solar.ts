/**
 * ============================================================================
 * UNIFIED SOLAR CALCULATION ENGINE & FINANCIAL ASSUMPTIONS
 * ============================================================================
 *
 * Single source of truth for solar geometry, regional generation yields,
 * state-specific DISCOM tariffs, PM Surya Ghar subsidies, residential loan
 * amortization, commercial Section 33 depreciation, and 25-year cash-flow modeling.
 * Sourced from official TGERC & APERC tariff orders, MNRE guidelines, SBI
 * lending circulars, Income-tax Act 2025 (Section 33), and BIS IS codes.
 */
import { PRODUCTS_CONFIG } from "@/config/products";
import {
  calculateGovtSubsidyInr as calculateGovtSubsidyInrRegulatory,
  evaluateSubsidyEligibility,
  evaluateSanctionedLoadFeasibility,
  calculateElectricityBill,
  unitsForBill,
  DISCOM_TARIFF_PROFILES,
  getSolarYieldProfileForDiscom,
  HYDERABAD_ANNUAL_YIELD_KWH_PER_KW,
  MODULE_WARRANTY_TERMS,
  SOLAR_LOAN_TERMS,
  TGERC_TARIFF_SOURCE,
  TGERC_RTS_REGULATION_2025_SOURCE,
  PM_SURYA_GHAR_SOURCE,
  SBI_SOLAR_LOAN_SOURCE,
  INCOME_TAX_SECTION_33_SOURCE,
  type DataSource,
  type VerificationStatus,
  type BillingSettlementCycle,
  type SubsidyEligibilityStatus,
  type SubsidyAssessment,
  type SanctionedLoadFeasibilityAssessment,
  type ElectricityBillResult,
} from "@/config/regulatory";

export interface DiscomInfo {
  code: string;
  name: string;
  state: string;
  residentialTariffInr: number;
  commercialTariffInr: number;
  exportRateInr: number; // Net-metering surplus settlement rate (Indicative Section 63 / FiT benchmark)
  exportRateStatus: VerificationStatus;
  exportSettlementBasis: string;
  settlementCycle: BillingSettlementCycle;
  maxResidentialSolarPctOfSanctionedLoad: number;
  maxCommercialSolarPctOfSanctionedLoad: number;
  status: VerificationStatus;
  authority: string;
  cityKey: string;
  regulatoryNote: string;
  gruhaJyothiApplicable: boolean;
  tariffSource: DataSource;
  netMeteringRegulationSource: DataSource;
}

export interface SolarSystemTier {
  id: string;
  label: string;
  targetKw: number;
  panels: number;
  systemKw: number;
  monthlyKwh: number;
  idealBill: string;
  description: string;
  isPopular?: boolean;
}

const DISCOM_CODES_ORDER = [
  "TGSPDCL",
  "TGNPDCL",
  "BESCOM",
  "MSEDCL",
  "TATA_MUMBAI",
  "APEPDCL",
  "APSPDCL",
  "BRPL",
  "DHBVN",
  "GED",
  "TANGEDCO",
] as const;

/**
 * State-aware DISCOM catalog with explicit VerificationStatus per utility:
 * - VERIFIED: Telangana (TGSPDCL, TGNPDCL) via TGERC FY 2025-26/2026-27 orders & TGERC Reg. No. 1 of 2025,
 *             and Andhra Pradesh (APEPDCL, APSPDCL) via APERC FY 2025-26/2026-27 orders & APERC Reg. No. 4 of 2023.
 * - INDICATIVE: Regional tariff benchmarks for Karnataka, Maharashtra, Delhi-NCR,
 *               Goa, and Tamil Nadu pending individual SERC slab ingestion.
 * - Note: Numeric surplus export settlement rates (exportRateInr) are classified as INDICATIVE across all utilities.
 */
export const DISCOMS: DiscomInfo[] = DISCOM_CODES_ORDER.map((code) => {
  const p = DISCOM_TARIFF_PROFILES[code];
  return {
    code: p.code,
    name: p.name,
    state: p.state,
    residentialTariffInr: p.residentialBlendedTariffInr,
    commercialTariffInr: p.commercialBlendedTariffInr,
    exportRateInr: p.exportSettlementRateInr,
    exportRateStatus: p.exportSettlementRateStatus,
    exportSettlementBasis: p.exportSettlementBasis,
    settlementCycle: p.settlementCycle,
    maxResidentialSolarPctOfSanctionedLoad: p.maxResidentialSolarPctOfSanctionedLoad,
    maxCommercialSolarPctOfSanctionedLoad: p.maxCommercialSolarPctOfSanctionedLoad,
    status: p.status,
    authority: p.authority,
    cityKey: p.cityKey,
    regulatoryNote: p.regulatoryNote,
    gruhaJyothiApplicable: p.gruhaJyothiApplicable,
    tariffSource: p.source,
    netMeteringRegulationSource: p.netMeteringRegulationSource,
  };
});

export const SOLAR_ASSUMPTIONS = {
  panelWatt: PRODUCTS_CONFIG.module.ratedPowerW, // 580W N-Type TOPCon
  panelFootprintSqft: 27.8, // 2278mm × 1134mm = 2.583 m² = 27.8 sq.ft. physical module area
  clearRoofSqftPerKw: 100, // Includes row spacing, tilt clearance, and maintenance walkways
  yieldKwhPerKwYear: HYDERABAD_ANNUAL_YIELD_KWH_PER_KW, // 1490 kWh/kWp/yr baseline (Hyderabad NASA POWER)
  year1Degradation: MODULE_WARRANTY_TERMS.year1MaxDegradationPct / 100, // 0.01 (1.0% Year 1)
  degradationPerYear: MODULE_WARRANTY_TERMS.annualDegradationPct / 100, // 0.004 (0.40%/year)
  selfConsumptionNoBattery: 0.7, // 70% daytime self-consumption
  selfConsumptionWithBattery: 0.9, // 90% self-consumption with battery
  tariffEscalationPerYear: 0.03, // 3.0% annual tariff escalation scenario
  pricePerKwInr: 62000, // Indicative turnkey residential capex per kW
  commercialPricePerKwInr: 42000, // Indicative turnkey commercial capex per kW
  battery: {
    unitCapacityKwh: PRODUCTS_CONFIG.battery.usableCapacityKwh,
    unitPriceInr: 280000,
  },
  loan: {
    annualRate: SOLAR_LOAN_TERMS.tier2.annualInterestRate, // 8.15%
    tenureMonths: SOLAR_LOAN_TERMS.defaultTenureMonths, // 60 months
  },
  minResidentialKw: 3,
  maxResidentialKw: 25,
};

/**
 * Modular residential sizing tiers built from panelWatt (580W)
 */
export const SYSTEM_TIERS: SolarSystemTier[] = [
  {
    id: "small",
    label: "Small",
    targetKw: 3,
    panels: Math.ceil((3 * 1000) / SOLAR_ASSUMPTIONS.panelWatt), // 6 panels
    systemKw: Number(
      (
        (Math.ceil((3 * 1000) / SOLAR_ASSUMPTIONS.panelWatt) * SOLAR_ASSUMPTIONS.panelWatt) /
        1000
      ).toFixed(2),
    ), // 3.48 kW
    monthlyKwh: Math.round(
      (Number(
        (
          (Math.ceil((3 * 1000) / SOLAR_ASSUMPTIONS.panelWatt) * SOLAR_ASSUMPTIONS.panelWatt) /
          1000
        ).toFixed(2),
      ) *
        SOLAR_ASSUMPTIONS.yieldKwhPerKwYear) /
        12,
    ),
    idealBill: "₹3,000 – ₹5,000",
    description: "Compact luxury residences, penthouses, and low daytime loads.",
  },
  {
    id: "medium",
    label: "Medium",
    targetKw: 5,
    panels: Math.ceil((5 * 1000) / SOLAR_ASSUMPTIONS.panelWatt), // 9 panels
    systemKw: Number(
      (
        (Math.ceil((5 * 1000) / SOLAR_ASSUMPTIONS.panelWatt) * SOLAR_ASSUMPTIONS.panelWatt) /
        1000
      ).toFixed(2),
    ), // 5.22 kW
    monthlyKwh: Math.round(
      (Number(
        (
          (Math.ceil((5 * 1000) / SOLAR_ASSUMPTIONS.panelWatt) * SOLAR_ASSUMPTIONS.panelWatt) /
          1000
        ).toFixed(2),
      ) *
        SOLAR_ASSUMPTIONS.yieldKwhPerKwYear) /
        12,
    ),
    idealBill: "₹6,000 – ₹10,000",
    description: "Recommended standard for 3–4 BHK luxury villas with continuous AC.",
    isPopular: true,
  },
  {
    id: "large",
    label: "Large",
    targetKw: 8,
    panels: Math.ceil((8 * 1000) / SOLAR_ASSUMPTIONS.panelWatt), // 14 panels
    systemKw: Number(
      (
        (Math.ceil((8 * 1000) / SOLAR_ASSUMPTIONS.panelWatt) * SOLAR_ASSUMPTIONS.panelWatt) /
        1000
      ).toFixed(2),
    ), // 8.12 kW
    monthlyKwh: Math.round(
      (Number(
        (
          (Math.ceil((8 * 1000) / SOLAR_ASSUMPTIONS.panelWatt) * SOLAR_ASSUMPTIONS.panelWatt) /
          1000
        ).toFixed(2),
      ) *
        SOLAR_ASSUMPTIONS.yieldKwhPerKwYear) /
        12,
    ),
    idealBill: "₹11,000 – ₹16,000",
    description: "Expansive luxury villas, home elevators, and private pools.",
  },
  {
    id: "xlarge",
    label: "Extra Large",
    targetKw: 12,
    panels: Math.ceil((12 * 1000) / SOLAR_ASSUMPTIONS.panelWatt), // 21 panels
    systemKw: Number(
      (
        (Math.ceil((12 * 1000) / SOLAR_ASSUMPTIONS.panelWatt) * SOLAR_ASSUMPTIONS.panelWatt) /
        1000
      ).toFixed(2),
    ), // 12.18 kW
    monthlyKwh: Math.round(
      (Number(
        (
          (Math.ceil((12 * 1000) / SOLAR_ASSUMPTIONS.panelWatt) * SOLAR_ASSUMPTIONS.panelWatt) /
          1000
        ).toFixed(2),
      ) *
        SOLAR_ASSUMPTIONS.yieldKwhPerKwYear) /
        12,
    ),
    idealBill: "₹18,000 – ₹28,000+",
    description: "Sprawling estates, multi-family compounds, and EV fleets.",
  },
];

/**
 * Re-export subsidy function from regulatory module
 */
export function calculateGovtSubsidyInr(
  kw: number,
  segment: "residential" | "commercial" = "residential",
): number {
  return calculateGovtSubsidyInrRegulatory(kw, { segment });
}

/**
 * ============================================================================
 * ROOF AREA & STRUCTURAL FEASIBILITY VALIDATION (Phase B)
 * ============================================================================
 */
export interface RoofFeasibilityAssessment {
  panelCount: number;
  panelWatt: number;
  systemKw: number;
  moduleFootprintSqft: number;
  recommendedClearRoofSqft: number;
  availableRoofSqft: number | null;
  maxFeasiblePanels: number | null;
  maxFeasibleKw: number | null;
  isFeasible: boolean;
  utilizationPct: number | null;
  warning: string | null;
  disclaimer: string;
}

export function validateRoofFeasibility(
  panelCount: number,
  panelWatt: number = SOLAR_ASSUMPTIONS.panelWatt,
  availableRoofSqft?: number,
): RoofFeasibilityAssessment {
  const safePanels =
    typeof panelCount === "number" && Number.isFinite(panelCount) && panelCount > 0
      ? Math.round(panelCount)
      : 0;
  const safeWatt =
    typeof panelWatt === "number" && Number.isFinite(panelWatt) && panelWatt > 0
      ? panelWatt
      : SOLAR_ASSUMPTIONS.panelWatt;

  const systemKw = Number(((safePanels * safeWatt) / 1000).toFixed(2));
  const moduleFootprintSqft = Math.round(safePanels * SOLAR_ASSUMPTIONS.panelFootprintSqft);
  const recommendedClearRoofSqft = Math.round(systemKw * SOLAR_ASSUMPTIONS.clearRoofSqftPerKw);

  const hasAvailableRoof =
    typeof availableRoofSqft === "number" &&
    Number.isFinite(availableRoofSqft) &&
    availableRoofSqft > 0;

  const cleanAvailableSqft = hasAvailableRoof ? Math.round(availableRoofSqft) : null;
  const maxFeasiblePanels =
    cleanAvailableSqft !== null
      ? Math.max(
          0,
          Math.floor(
            ((cleanAvailableSqft / SOLAR_ASSUMPTIONS.clearRoofSqftPerKw) * 1000) / safeWatt,
          ),
        )
      : null;
  const maxFeasibleKw =
    maxFeasiblePanels !== null ? Number(((maxFeasiblePanels * safeWatt) / 1000).toFixed(2)) : null;

  const isFeasible =
    cleanAvailableSqft === null ? true : cleanAvailableSqft >= recommendedClearRoofSqft;
  const utilizationPct =
    cleanAvailableSqft !== null && cleanAvailableSqft > 0
      ? Math.round((recommendedClearRoofSqft / cleanAvailableSqft) * 100)
      : null;

  const warning = !isFeasible
    ? `Configured ${systemKw} kW array (${safePanels} panels) requires ~${recommendedClearRoofSqft} sq.ft. of shadow-free roof area including tilt spacing, which exceeds the ${cleanAvailableSqft} sq.ft. available (~${maxFeasiblePanels} panels / ${maxFeasibleKw} kW max on standard mounting, or requires an elevated pergola structure).`
    : null;

  return {
    panelCount: safePanels,
    panelWatt: safeWatt,
    systemKw,
    moduleFootprintSqft,
    recommendedClearRoofSqft,
    availableRoofSqft: cleanAvailableSqft,
    maxFeasiblePanels,
    maxFeasibleKw,
    isFeasible,
    utilizationPct,
    warning,
    disclaimer:
      "Indicative roof sizing and satellite sketching do not replace physical structural inspection, 3D horizon shade modeling, parapet setback verification, or DISCOM sanction approval.",
  };
}

/**
 * ============================================================================
 * RESIDENTIAL FINANCING & SBI LOAN AMORTIZATION ENGINE (Phase E / P0-C / TASK B)
 * ============================================================================
 */
export type LoanSubsidyCreditMode =
  | "LOAN_PRINCIPAL_PREPAYMENT_RECAST_EMI"
  | "LOAN_PRINCIPAL_PREPAYMENT_REDUCE_TENURE"
  | "UNRESTRICTED_SUBSIDY_NO_PREPAYMENT";

export interface LoanAmortizationScenario {
  mode: LoanSubsidyCreditMode;
  status: VerificationStatus;
  label: string;
  description: string;
  initialLoanPrincipalInr: number;
  initialMonthlyEmiInr: number;
  subsidyCreditMonth: number;
  balanceBeforeSubsidyCreditInr: number;
  subsidyCreditedToLoanInr: number;
  excessSubsidyToBorrowerInr: number;
  postSubsidyPrincipalInr: number;
  postSubsidyMonthlyEmiInr: number;
  effectiveTenureMonths: number;
  totalBorrowerEmiRepaymentInr: number;
  totalInterestInr: number;
  interestSavedVsUnadjustedInr: number;
  annualBorrowerEmiOutflows: number[];
}

export interface SolarFinancingAssessment {
  status: VerificationStatus;
  grossCapexInr: number;
  eligibleSolarCapexInr: number;
  excludedBatteryCapexInr: number;
  batteryIncludedInSchemeLoan: boolean;
  customerMarginPct: number;
  solarDownPaymentInr: number;
  unfinancedBatteryOutlayInr: number;
  customerDownPaymentInr: number;
  initialLoanPrincipalInr: number;
  loanPrincipalInr: number;
  annualInterestRate: number;
  annualInterestRatePct: number;
  tenureMonths: number;
  effectiveTenureMonths: number;
  initialMonthlyEmiInr: number;
  subsidyCreditMonth: number;
  balanceBeforeSubsidyCreditInr: number;
  subsidyCreditedToLoanInr: number;
  excessSubsidyToBorrowerInr: number;
  postSubsidyPrincipalInr: number;
  postSubsidyMonthlyEmiInr: number;
  monthlyEmiInr: number;
  totalGrossRepaymentBeforeSubsidyInr: number;
  totalRepaymentInr: number;
  totalInterestBeforeSubsidyInr: number;
  totalInterestInr: number;
  interestSavedBySubsidyPrepaymentInr: number;
  subsidyCreditMode: LoanSubsidyCreditMode;
  amortizationScenarios: {
    recastEmi: LoanAmortizationScenario;
    reduceTenure: LoanAmortizationScenario;
    unadjustedNoPrepayment: LoanAmortizationScenario;
  };
  annualBorrowerEmiOutflows: number[];
  tierLabel: string;
  isSchemeEligible: boolean;
  exceedsConcessionalCap: boolean;
  exceedsCapacityCap: boolean;
  effectiveAsOf: string;
  note: string;
  caveats: string[];
  source: DataSource;
}

function computeStandardEmi(principalInr: number, monthlyRate: number, months: number): number {
  if (principalInr <= 0 || months <= 0) return 0;
  if (monthlyRate <= 0) return Math.round(principalInr / months);
  const factor = Math.pow(1 + monthlyRate, months);
  return Math.round((principalInr * monthlyRate * factor) / (factor - 1));
}

export function calculateSolarFinancing(params: {
  grossCapexInr: number;
  batteryCapexInr?: number;
  includeBatteryInSchemeLoan?: boolean;
  systemKw?: number;
  subsidyInr?: number;
  subsidyCreditMonth?: number;
  subsidyCreditMode?: LoanSubsidyCreditMode;
  tenureMonths?: number;
  annualInterestRate?: number;
  customerMarginPct?: number;
  segment?: "residential" | "commercial";
}): SolarFinancingAssessment {
  const grossCapexInr =
    typeof params.grossCapexInr === "number" &&
    Number.isFinite(params.grossCapexInr) &&
    params.grossCapexInr > 0
      ? Math.round(params.grossCapexInr)
      : 0;

  const rawBatteryCapex =
    typeof params.batteryCapexInr === "number" &&
    Number.isFinite(params.batteryCapexInr) &&
    params.batteryCapexInr > 0
      ? Math.min(grossCapexInr, Math.round(params.batteryCapexInr))
      : 0;

  const batteryIncludedInSchemeLoan = Boolean(params.includeBatteryInSchemeLoan);
  const excludedBatteryCapexInr = batteryIncludedInSchemeLoan ? 0 : rawBatteryCapex;
  const eligibleSolarCapexInr = Math.max(0, grossCapexInr - excludedBatteryCapexInr);

  const customerMarginPct =
    typeof params.customerMarginPct === "number" &&
    Number.isFinite(params.customerMarginPct) &&
    params.customerMarginPct >= 0 &&
    params.customerMarginPct < 1
      ? params.customerMarginPct
      : SOLAR_LOAN_TERMS.minCustomerMarginPct;

  const solarDownPaymentInr = Math.round(eligibleSolarCapexInr * customerMarginPct);
  const unfinancedBatteryOutlayInr = excludedBatteryCapexInr;
  const customerDownPaymentInr = solarDownPaymentInr + unfinancedBatteryOutlayInr;
  const initialLoanPrincipalInr = Math.max(0, eligibleSolarCapexInr - solarDownPaymentInr);
  const loanPrincipalInr = initialLoanPrincipalInr;

  const tenureMonths =
    typeof params.tenureMonths === "number" &&
    Number.isFinite(params.tenureMonths) &&
    params.tenureMonths > 0
      ? Math.round(params.tenureMonths)
      : SOLAR_LOAN_TERMS.defaultTenureMonths;

  const hasSystemKw =
    typeof params.systemKw === "number" && Number.isFinite(params.systemKw) && params.systemKw > 0;
  const systemKw = hasSystemKw ? params.systemKw! : undefined;

  const isResidentialSegment = (params.segment ?? "residential") === "residential";
  const isStandaloneBatteryOnly =
    grossCapexInr > 0 && rawBatteryCapex > 0 && eligibleSolarCapexInr === 0;
  const isSchemeEquipmentEligible = !batteryIncludedInSchemeLoan && !isStandaloneBatteryOnly;
  const exceedsConcessionalCap = initialLoanPrincipalInr > SOLAR_LOAN_TERMS.tier2.maxAmountInr;
  const exceedsCapacityCap =
    systemKw !== undefined && systemKw > SOLAR_LOAN_TERMS.tier2.maxCapacityKw;
  const isSchemeEligible =
    isResidentialSegment &&
    isSchemeEquipmentEligible &&
    !exceedsConcessionalCap &&
    !exceedsCapacityCap;

  let annualInterestRate: number;
  let tierLabel: string;
  // All financing estimates are conditional on borrower credit underwriting, EBLR spreads, and bank sanction
  const status: VerificationStatus = "INDICATIVE";

  const qualifiesForTier1 =
    isSchemeEligible &&
    initialLoanPrincipalInr <= SOLAR_LOAN_TERMS.tier1.maxAmountInr &&
    (systemKw === undefined || systemKw <= SOLAR_LOAN_TERMS.tier1.maxCapacityKw);

  const qualifiesForTier2 =
    isSchemeEligible &&
    !qualifiesForTier1 &&
    initialLoanPrincipalInr <= SOLAR_LOAN_TERMS.tier2.maxAmountInr &&
    (systemKw === undefined || systemKw <= SOLAR_LOAN_TERMS.tier2.maxCapacityKw);

  if (
    typeof params.annualInterestRate === "number" &&
    Number.isFinite(params.annualInterestRate) &&
    params.annualInterestRate >= 0
  ) {
    annualInterestRate = params.annualInterestRate;
    tierLabel = "Custom Financing Rate Assumption";
  } else if (qualifiesForTier1) {
    annualInterestRate = SOLAR_LOAN_TERMS.tier1.annualInterestRate; // 6.00% p.a. (eff. 2026-10-15)
    tierLabel =
      "SBI PM Surya Ghar Tier 1 (≤ 3 kW & ≤ ₹2,00,000 · 6.00% p.a. floating, eff. 2026-10-15)";
  } else if (qualifiesForTier2) {
    annualInterestRate = SOLAR_LOAN_TERMS.tier2.annualInterestRate; // 8.15% p.a. (eff. 2026-10-15)
    tierLabel =
      "SBI PM Surya Ghar Tier 2 (> 3–10 kW or ₹2,00,001–₹6,00,000 · 8.15% p.a. floating, eff. 2026-10-15)";
  } else {
    annualInterestRate = SOLAR_LOAN_TERMS.aboveCapIndicativeRate; // 9.15% p.a. indicative non-scheme modeling assumption
    if (!isResidentialSegment) {
      tierLabel =
        "Non-Scheme Illustrative Financing Scenario (Commercial Segment Outside PM Surya Ghar · 9.15% p.a. Indicative)";
    } else if (!isSchemeEquipmentEligible) {
      tierLabel =
        "Non-Scheme Illustrative Financing Scenario (Battery-Inclusive / Non-Scheme Equipment · 9.15% p.a. Indicative)";
    } else {
      tierLabel =
        "Unverified Above-Cap Modeling Assumption (> 10 kW or > ₹6,00,000 PM Surya Ghar Ceiling · 9.15% p.a. Indicative)";
    }
  }

  const r = annualInterestRate > 0 ? annualInterestRate / 12 : 0;
  const initialMonthlyEmiInr = computeStandardEmi(initialLoanPrincipalInr, r, tenureMonths);
  const totalGrossRepaymentBeforeSubsidyInr = initialMonthlyEmiInr * tenureMonths;
  const totalInterestBeforeSubsidyInr = Math.max(
    0,
    totalGrossRepaymentBeforeSubsidyInr - initialLoanPrincipalInr,
  );

  const rawSubsidy =
    isResidentialSegment &&
    !isStandaloneBatteryOnly &&
    typeof params.subsidyInr === "number" &&
    Number.isFinite(params.subsidyInr) &&
    params.subsidyInr > 0
      ? Math.round(params.subsidyInr)
      : 0;

  const subsidyCreditMonth =
    typeof params.subsidyCreditMonth === "number" &&
    Number.isFinite(params.subsidyCreditMonth) &&
    params.subsidyCreditMonth >= 1
      ? Math.min(Math.max(1, Math.round(params.subsidyCreditMonth)), Math.max(1, tenureMonths - 1))
      : Math.min(SOLAR_LOAN_TERMS.defaultSubsidyCreditMonth, Math.max(1, tenureMonths - 1));

  // Simulate Months 1..subsidyCreditMonth before DBT subsidy credit hits the SBI loan account
  let runningBalance = initialLoanPrincipalInr;
  let preSubsidyEmiPaidInr = 0;
  if (initialLoanPrincipalInr > 0 && tenureMonths > 0) {
    for (let m = 1; m <= subsidyCreditMonth; m++) {
      const interestM = runningBalance * r;
      const principalM = Math.max(0, Math.min(runningBalance, initialMonthlyEmiInr - interestM));
      runningBalance = Math.max(0, runningBalance - principalM);
      preSubsidyEmiPaidInr += initialMonthlyEmiInr;
    }
  }
  const balanceBeforeSubsidyCreditInr = Math.round(runningBalance);
  const subsidyCreditedToLoanInr = Math.min(balanceBeforeSubsidyCreditInr, rawSubsidy);
  const excessSubsidyToBorrowerInr = Math.max(0, rawSubsidy - balanceBeforeSubsidyCreditInr);
  const postSubsidyPrincipalInr = Math.max(
    0,
    balanceBeforeSubsidyCreditInr - subsidyCreditedToLoanInr,
  );
  const remainingMonthsAfterCredit = Math.max(0, tenureMonths - subsidyCreditMonth);

  // Helper to build 25-year annual EMI array from monthly payments array
  const buildAnnualOutflows = (monthlyPayments: number[]): number[] => {
    const annual: number[] = [];
    for (let y = 0; y < 25; y++) {
      let sumY = 0;
      for (let m = y * 12; m < (y + 1) * 12; m++) {
        sumY += monthlyPayments[m] ?? 0;
      }
      annual.push(Math.round(sumY));
    }
    return annual;
  };

  // Scenario 1: LOAN_PRINCIPAL_PREPAYMENT_RECAST_EMI (SBI Zero-Penalty Prepayment + EMI Recast)
  const recastPostEmi =
    postSubsidyPrincipalInr > 0 && remainingMonthsAfterCredit > 0
      ? computeStandardEmi(postSubsidyPrincipalInr, r, remainingMonthsAfterCredit)
      : 0;
  const recastMonthlyPayments: number[] = [];
  for (let m = 1; m <= tenureMonths; m++) {
    if (initialLoanPrincipalInr <= 0) {
      recastMonthlyPayments.push(0);
    } else if (m <= subsidyCreditMonth) {
      recastMonthlyPayments.push(initialMonthlyEmiInr);
    } else {
      recastMonthlyPayments.push(recastPostEmi);
    }
  }
  const recastTotalBorrowerEmi = recastMonthlyPayments.reduce((a, b) => a + b, 0);
  const recastTotalInterest = Math.max(
    0,
    recastTotalBorrowerEmi + subsidyCreditedToLoanInr - initialLoanPrincipalInr,
  );
  const recastScenario: LoanAmortizationScenario = {
    mode: "LOAN_PRINCIPAL_PREPAYMENT_RECAST_EMI",
    status: "INDICATIVE",
    label: "Loan Principal Prepayment + EMI Recast (Indicative Bank Practice)",
    description: `Post-commissioning DBT subsidy (₹${subsidyCreditedToLoanInr.toLocaleString("en-IN")}) is credited directly to the SBI solar loan account in Month ${subsidyCreditMonth} with zero prepayment penalty, reducing outstanding principal to ₹${postSubsidyPrincipalInr.toLocaleString("en-IN")} and re-amortizing the remaining ${remainingMonthsAfterCredit} months at ₹${recastPostEmi.toLocaleString("en-IN")}/month.`,
    initialLoanPrincipalInr,
    initialMonthlyEmiInr,
    subsidyCreditMonth,
    balanceBeforeSubsidyCreditInr,
    subsidyCreditedToLoanInr,
    excessSubsidyToBorrowerInr,
    postSubsidyPrincipalInr,
    postSubsidyMonthlyEmiInr: recastPostEmi,
    effectiveTenureMonths:
      initialLoanPrincipalInr <= 0
        ? 0
        : postSubsidyPrincipalInr > 0
          ? tenureMonths
          : subsidyCreditMonth,
    totalBorrowerEmiRepaymentInr: recastTotalBorrowerEmi,
    totalInterestInr: recastTotalInterest,
    interestSavedVsUnadjustedInr: Math.max(0, totalInterestBeforeSubsidyInr - recastTotalInterest),
    annualBorrowerEmiOutflows: buildAnnualOutflows(recastMonthlyPayments),
  };

  // Scenario 2: LOAN_PRINCIPAL_PREPAYMENT_REDUCE_TENURE (Constant EMI + Shortened Tenure)
  const reduceTenureMonthlyPayments: number[] = [];
  let balTenure = postSubsidyPrincipalInr;
  let effectiveTenureReduce = initialLoanPrincipalInr > 0 ? subsidyCreditMonth : 0;
  for (let m = 1; m <= tenureMonths; m++) {
    if (initialLoanPrincipalInr <= 0) {
      reduceTenureMonthlyPayments.push(0);
    } else if (m <= subsidyCreditMonth) {
      reduceTenureMonthlyPayments.push(initialMonthlyEmiInr);
    } else if (balTenure > 0 && initialMonthlyEmiInr > 0) {
      const intM = balTenure * r;
      if (balTenure + intM <= initialMonthlyEmiInr) {
        const finalPmt = Math.round(balTenure + intM);
        reduceTenureMonthlyPayments.push(finalPmt);
        balTenure = 0;
        effectiveTenureReduce = m;
      } else {
        reduceTenureMonthlyPayments.push(initialMonthlyEmiInr);
        balTenure = Math.max(0, balTenure - (initialMonthlyEmiInr - intM));
        effectiveTenureReduce = m;
      }
    } else {
      reduceTenureMonthlyPayments.push(0);
    }
  }
  const reduceTenureTotalBorrowerEmi = reduceTenureMonthlyPayments.reduce((a, b) => a + b, 0);
  const reduceTenureTotalInterest = Math.max(
    0,
    reduceTenureTotalBorrowerEmi + subsidyCreditedToLoanInr - initialLoanPrincipalInr,
  );
  const reduceTenureScenario: LoanAmortizationScenario = {
    mode: "LOAN_PRINCIPAL_PREPAYMENT_REDUCE_TENURE",
    status: "INDICATIVE",
    label: "Loan Principal Prepayment + Tenure Reduction (Indicative Bank Practice)",
    description: `Post-commissioning DBT subsidy (₹${subsidyCreditedToLoanInr.toLocaleString("en-IN")}) reduces loan principal in Month ${subsidyCreditMonth} while maintaining the ₹${initialMonthlyEmiInr.toLocaleString("en-IN")}/month installment, closing the loan early in ${effectiveTenureReduce} months.`,
    initialLoanPrincipalInr,
    initialMonthlyEmiInr,
    subsidyCreditMonth,
    balanceBeforeSubsidyCreditInr,
    subsidyCreditedToLoanInr,
    excessSubsidyToBorrowerInr,
    postSubsidyPrincipalInr,
    postSubsidyMonthlyEmiInr: postSubsidyPrincipalInr > 0 ? initialMonthlyEmiInr : 0,
    effectiveTenureMonths: effectiveTenureReduce,
    totalBorrowerEmiRepaymentInr: reduceTenureTotalBorrowerEmi,
    totalInterestInr: reduceTenureTotalInterest,
    interestSavedVsUnadjustedInr: Math.max(
      0,
      totalInterestBeforeSubsidyInr - reduceTenureTotalInterest,
    ),
    annualBorrowerEmiOutflows: buildAnnualOutflows(reduceTenureMonthlyPayments),
  };

  // Scenario 3: UNRESTRICTED_SUBSIDY_NO_PREPAYMENT (Unadjusted 60-Month Schedule)
  const unadjustedMonthlyPayments = Array.from({ length: tenureMonths }, () =>
    initialLoanPrincipalInr > 0 ? initialMonthlyEmiInr : 0,
  );
  const unadjustedScenario: LoanAmortizationScenario = {
    mode: "UNRESTRICTED_SUBSIDY_NO_PREPAYMENT",
    status: "INDICATIVE",
    label: "Unadjusted Full-Principal Schedule (No Principal Prepayment Applied)",
    description: `Borrower services the full ${tenureMonths}-month schedule on initial principal (₹${initialLoanPrincipalInr.toLocaleString("en-IN")}) at ₹${initialMonthlyEmiInr.toLocaleString("en-IN")}/month without applying DBT subsidy to prepay loan principal.`,
    initialLoanPrincipalInr,
    initialMonthlyEmiInr,
    subsidyCreditMonth,
    balanceBeforeSubsidyCreditInr: initialLoanPrincipalInr,
    subsidyCreditedToLoanInr: 0,
    excessSubsidyToBorrowerInr: rawSubsidy,
    postSubsidyPrincipalInr: initialLoanPrincipalInr,
    postSubsidyMonthlyEmiInr: initialMonthlyEmiInr,
    effectiveTenureMonths: initialLoanPrincipalInr > 0 ? tenureMonths : 0,
    totalBorrowerEmiRepaymentInr: totalGrossRepaymentBeforeSubsidyInr,
    totalInterestInr: totalInterestBeforeSubsidyInr,
    interestSavedVsUnadjustedInr: 0,
    annualBorrowerEmiOutflows: buildAnnualOutflows(unadjustedMonthlyPayments),
  };

  const subsidyCreditMode: LoanSubsidyCreditMode =
    params.subsidyCreditMode ??
    (rawSubsidy > 0
      ? "LOAN_PRINCIPAL_PREPAYMENT_RECAST_EMI"
      : "UNRESTRICTED_SUBSIDY_NO_PREPAYMENT");

  const activeScenario =
    subsidyCreditMode === "LOAN_PRINCIPAL_PREPAYMENT_RECAST_EMI"
      ? recastScenario
      : subsidyCreditMode === "LOAN_PRINCIPAL_PREPAYMENT_REDUCE_TENURE"
        ? reduceTenureScenario
        : unadjustedScenario;

  const monthlyEmiInr =
    subsidyCreditMode === "LOAN_PRINCIPAL_PREPAYMENT_RECAST_EMI" && rawSubsidy > 0
      ? activeScenario.postSubsidyMonthlyEmiInr > 0
        ? activeScenario.postSubsidyMonthlyEmiInr
        : initialMonthlyEmiInr
      : initialMonthlyEmiInr;

  const caveats: string[] = [
    `Interest rates (${(annualInterestRate * 100).toFixed(2)}% p.a. floating, effective ${SOLAR_LOAN_TERMS.asOfDate}) are linked to SBI EBLR and conditional on borrower CIBIL appraisal and bank sanction.`,
    `Assumes ${(customerMarginPct * 100).toFixed(0)}% Year-0 solar margin contribution (₹${solarDownPaymentInr.toLocaleString("en-IN")}) and ${(100 - customerMarginPct * 100).toFixed(0)}% financed solar principal (₹${initialLoanPrincipalInr.toLocaleString("en-IN")}).`,
    rawSubsidy > 0
      ? `Under SBI PM Surya Ghar loan rules, post-commissioning MNRE central subsidy (₹${rawSubsidy.toLocaleString("en-IN")}) is credited directly into the borrower's loan account (modeled in Month ${subsidyCreditMonth}) to reduce loan principal—not paid out as unrestricted cash while leaving the 90% loan unreduced.`
      : "No PM Surya Ghar central subsidy prepayment is applied to this loan schedule.",
    SOLAR_LOAN_TERMS.legacyScheduleNote,
  ];

  if (exceedsConcessionalCap || exceedsCapacityCap) {
    caveats.push(
      `System capacity (${systemKw ?? "N/A"} kW) or financed principal (₹${initialLoanPrincipalInr.toLocaleString("en-IN")}) exceeds the PM Surya Ghar scheme ceiling (10 kW / ₹6,00,000); the 9.15% p.a. rate is an unverified modeling assumption, not a published SBI PM Surya Ghar offer.`,
    );
  }

  if (rawBatteryCapex > 0) {
    caveats.push(
      batteryIncludedInSchemeLoan
        ? "Bundled battery storage capex is included in a custom non-scheme financing scenario; standalone battery storage is not eligible under MNRE PM Surya Ghar concessional loan terms."
        : `Standalone battery storage capex (₹${rawBatteryCapex.toLocaleString("en-IN")}) is excluded from the PM Surya Ghar concessional solar loan principal and included in Year-0 customer capital outlay.`,
    );
  }

  let note: string;
  if (!isResidentialSegment) {
    note = `Commercial installations are outside the residential PM Surya Ghar scheme; modeled as a non-scheme illustrative financing scenario at ${(annualInterestRate * 100).toFixed(2)}% p.a. (Indicative).`;
  } else if (!isSchemeEquipmentEligible) {
    note = `Battery-inclusive or standalone storage financing is outside the SBI PM Surya Ghar concessional solar loan scheme; modeled as a non-scheme illustrative financing scenario at ${(annualInterestRate * 100).toFixed(2)}% p.a. (Indicative).`;
  } else if (exceedsConcessionalCap || exceedsCapacityCap) {
    note = `Financed loan principal (₹${initialLoanPrincipalInr.toLocaleString("en-IN")})${exceedsCapacityCap ? ` or system size (${systemKw} kW)` : ""} exceeds the PM Surya Ghar concessional cap (10 kW / ₹6,00,000); modeled at an indicative ${(annualInterestRate * 100).toFixed(2)}% p.a. non-scheme rate.`;
  } else {
    note = `Modeled on SBI PM Surya Ghar Green Loan terms (${(annualInterestRate * 100).toFixed(2)}% p.a. floating effective ${SOLAR_LOAN_TERMS.asOfDate}) with post-commissioning subsidy credited directly to loan principal.`;
  }

  return {
    status,
    grossCapexInr,
    eligibleSolarCapexInr,
    excludedBatteryCapexInr,
    batteryIncludedInSchemeLoan,
    customerMarginPct,
    solarDownPaymentInr,
    unfinancedBatteryOutlayInr,
    customerDownPaymentInr,
    initialLoanPrincipalInr,
    loanPrincipalInr,
    annualInterestRate,
    annualInterestRatePct: Number((annualInterestRate * 100).toFixed(2)),
    tenureMonths,
    effectiveTenureMonths: activeScenario.effectiveTenureMonths,
    initialMonthlyEmiInr,
    subsidyCreditMonth,
    balanceBeforeSubsidyCreditInr: activeScenario.balanceBeforeSubsidyCreditInr,
    subsidyCreditedToLoanInr: activeScenario.subsidyCreditedToLoanInr,
    excessSubsidyToBorrowerInr: activeScenario.excessSubsidyToBorrowerInr,
    postSubsidyPrincipalInr: activeScenario.postSubsidyPrincipalInr,
    postSubsidyMonthlyEmiInr: activeScenario.postSubsidyMonthlyEmiInr,
    monthlyEmiInr,
    totalGrossRepaymentBeforeSubsidyInr,
    totalRepaymentInr: activeScenario.totalBorrowerEmiRepaymentInr,
    totalInterestBeforeSubsidyInr,
    totalInterestInr: activeScenario.totalInterestInr,
    interestSavedBySubsidyPrepaymentInr: activeScenario.interestSavedVsUnadjustedInr,
    subsidyCreditMode,
    amortizationScenarios: {
      recastEmi: recastScenario,
      reduceTenure: reduceTenureScenario,
      unadjustedNoPrepayment: unadjustedScenario,
    },
    annualBorrowerEmiOutflows: activeScenario.annualBorrowerEmiOutflows,
    tierLabel,
    isSchemeEligible,
    exceedsConcessionalCap,
    exceedsCapacityCap,
    effectiveAsOf: SOLAR_LOAN_TERMS.asOfDate,
    note,
    caveats,
    source: SBI_SOLAR_LOAN_SOURCE,
  };
}

/**
 * ============================================================================
 * 25-YEAR CASH FLOW & LIFETIME WEALTH ENGINE (Phase F / P0-B / TASK B)
 * ============================================================================
 */
export interface YearProjectionPoint {
  year: number;
  tariffPerKwh: number;
  genKwh: number;
  initialYear0OutflowInr: number;
  annualBillWithoutSolar?: number;
  annualSavings?: number;
  annualLoanOutflow: number;
  loanPrincipalPrepaymentInr?: number; // Post-commissioning DBT subsidy credited directly to loan principal in Year 1
  subsidyCreditInr: number; // Unrestricted DBT cash credit received by customer in Year 1 (Cash mode or excess over loan balance)
  annualNetCashflow?: number; // Net cash flow in year y
  cumSpendWithoutSolar: number;
  cumSavings: number;
  cumCustomerOutflow?: number; // Cumulative customer capital + EMI outflow net of received DBT credit
  netCumulativeCashflow: number; // Reconciles identically to cumSavings - cumCustomerOutflow
}

export interface CashFlowLedgerSummary {
  year0CashOutflowInr: number;
  year0LoanDownPaymentInr: number;
  year0CustomerOutflowInr: number;
  initialLoanPrincipalInr: number;
  loanPrincipalInr: number;
  initialMonthlyEmiInr: number;
  postSubsidyPrincipalInr: number;
  postSubsidyMonthlyEmiInr: number;
  monthlyEmiInr: number;
  loanTenureMonths: number;
  effectiveLoanTenureMonths: number;
  totalGrossEmiRepaymentBeforeSubsidyInr: number;
  totalEmiRepaymentInr: number;
  totalLoanInterestInr: number;
  interestSavedBySubsidyPrepaymentInr: number;
  subsidyReceiptYear: number;
  subsidyReceiptTiming: "POST_COMMISSIONING_YEAR_1";
  subsidyCreditTreatment: "DIRECT_TO_LOAN_PRINCIPAL" | "CASH_DBT_TO_BORROWER";
  year1LoanPrincipalPrepaymentInr: number;
  year1UnrestrictedCashSubsidyInr: number;
  year1SubsidyCreditInr: number;
  conditionalSubsidyCreditInr: number;
  netCashCapitalOutflowInr: number;
  netFinancedTotalOutflowInr: number;
  reconcilesWithSummary: boolean;
  ongoingCostsNote: string;
}

export interface ProjectionParams {
  annualBillInr: number;
  annualSavingsInr: number;
  annualGenKwh: number;
  netInvestmentInr: number;
  grossInvestmentInr?: number;
  subsidyInr?: number;
  tariffPerKwh: number;
  degradationPerYear?: number;
  tariffEscalationPerYear?: number;
  financing?: {
    customerDownPaymentInr: number;
    loanPrincipalInr?: number;
    subsidyInr: number;
    subsidyCreditedToLoanInr?: number;
    excessSubsidyToBorrowerInr?: number;
    subsidyReceiptYear?: number;
    monthlyEmiInr: number;
    tenureMonths: number;
    annualBorrowerEmiOutflows?: number[];
  };
}

/**
 * Single, unified 25-Year Compound Simulation used across estimate(),
 * WealthCurveVisualizer, and ArchitecturalDossierModal.
 *
 * Implements an explicit, reconciled cash-flow ledger:
 * - Cash Mode: Year 0 outflow = grossInvestmentInr; Year 1 DBT credit = cashSubsidyInr;
 *   Net 25-year customer outflow = grossInvestmentInr - cashSubsidyInr = netInvestmentInr.
 * - Financed Loan Mode (SBI PM Surya Ghar Loan-Account Prepayment):
 *   Year 0 outflow = customerDownPaymentInr (10% solar margin + any unfinanced battery outlay).
 *   In Year 1 (Month 3), MNRE credits subsidyCreditedToLoanInr directly to the loan account,
 *   reducing the outstanding loan principal and lowering subsequent EMIs (recorded in
 *   annualBorrowerEmiOutflows). Because the subsidy reduces loan principal (so borrower EMIs
 *   only repay the remaining net principal + interest), it is NOT counted a second time as
 *   unrestricted cash inflow to the customer—avoiding double-counting while reconciling 100%
 *   even when subsidyInr > customerDownPaymentInr.
 */
export function project25Years(params: ProjectionParams): YearProjectionPoint[] {
  const {
    annualBillInr,
    annualSavingsInr,
    annualGenKwh,
    netInvestmentInr,
    grossInvestmentInr,
    subsidyInr: cashSubsidyParam,
    tariffPerKwh,
    degradationPerYear = SOLAR_ASSUMPTIONS.degradationPerYear,
    tariffEscalationPerYear = SOLAR_ASSUMPTIONS.tariffEscalationPerYear,
    financing,
  } = params;

  const points: YearProjectionPoint[] = [];
  let cumSpendWithoutSolar = 0;
  let cumSavings = 0;

  const cashSubsidyInr =
    typeof cashSubsidyParam === "number" &&
    Number.isFinite(cashSubsidyParam) &&
    cashSubsidyParam >= 0
      ? Math.round(cashSubsidyParam)
      : typeof grossInvestmentInr === "number" && grossInvestmentInr > netInvestmentInr
        ? Math.round(grossInvestmentInr - netInvestmentInr)
        : 0;
  const cashGrossOutflowInr =
    typeof grossInvestmentInr === "number" && Number.isFinite(grossInvestmentInr)
      ? Math.round(grossInvestmentInr)
      : Math.round(netInvestmentInr + cashSubsidyInr);

  const subsidyReceiptYear = financing?.subsidyReceiptYear ?? 1;
  const year0DownPaymentInr = financing ? Math.round(financing.customerDownPaymentInr) : 0;
  const usesLoanPrincipalPrepayment =
    Boolean(financing) &&
    (typeof financing?.subsidyCreditedToLoanInr === "number" ||
      Array.isArray(financing?.annualBorrowerEmiOutflows));

  let cumLoanEmiPaid = 0;
  let cumSubsidyCredited = 0;

  for (let y = 1; y <= 25; y++) {
    const degFactor = Math.pow(1 - degradationPerYear, y - 1);
    const escFactor = Math.pow(1 + tariffEscalationPerYear, y - 1);

    const yearBill = Math.round(annualBillInr * escFactor);
    const yearTariff = Number((tariffPerKwh * escFactor).toFixed(2));
    const yearGen = Math.round(annualGenKwh * degFactor);

    // Annual savings in Year y (avoided bill + surplus settlement scaled by degradation and tariff escalation)
    const yearSavings = Math.round(annualSavingsInr * degFactor * escFactor);

    let annualLoanOutflow = 0;
    if (financing) {
      if (Array.isArray(financing.annualBorrowerEmiOutflows)) {
        annualLoanOutflow = Math.round(financing.annualBorrowerEmiOutflows[y - 1] ?? 0);
      } else if (financing.monthlyEmiInr > 0 && financing.tenureMonths > 0) {
        const startMonth = (y - 1) * 12 + 1;
        if (startMonth <= financing.tenureMonths) {
          const activeMonths = Math.min(12, financing.tenureMonths - startMonth + 1);
          annualLoanOutflow = financing.monthlyEmiInr * activeMonths;
        }
      }
      cumLoanEmiPaid += annualLoanOutflow;
    }

    const loanPrincipalPrepaymentInr =
      financing && usesLoanPrincipalPrepayment && y === subsidyReceiptYear
        ? Math.round(financing.subsidyCreditedToLoanInr ?? 0)
        : 0;

    // In loan principal prepayment mode, the subsidy reduces loan principal (and therefore EMI outflows),
    // so only any excess subsidy above the loan balance is an unrestricted cash inflow to the customer.
    const subsidyCreditInr =
      y === subsidyReceiptYear
        ? financing
          ? usesLoanPrincipalPrepayment
            ? Math.round(financing.excessSubsidyToBorrowerInr ?? 0)
            : Math.round(financing.subsidyInr)
          : cashSubsidyInr
        : 0;
    cumSubsidyCredited += subsidyCreditInr;

    cumSpendWithoutSolar += yearBill;
    cumSavings += yearSavings;

    const cumCustomerOutflow = financing
      ? year0DownPaymentInr + cumLoanEmiPaid - cumSubsidyCredited
      : cashGrossOutflowInr - cumSubsidyCredited;

    const annualNetCashflow = financing
      ? yearSavings + subsidyCreditInr - annualLoanOutflow - (y === 1 ? year0DownPaymentInr : 0)
      : yearSavings + subsidyCreditInr - (y === 1 ? cashGrossOutflowInr : 0);

    const netCumulativeCashflow = Math.round(cumSavings - cumCustomerOutflow);

    points.push({
      year: y,
      tariffPerKwh: yearTariff,
      genKwh: yearGen,
      initialYear0OutflowInr: financing ? year0DownPaymentInr : cashGrossOutflowInr,
      annualBillWithoutSolar: yearBill,
      annualSavings: yearSavings,
      annualLoanOutflow,
      loanPrincipalPrepaymentInr,
      subsidyCreditInr,
      annualNetCashflow,
      cumSpendWithoutSolar,
      cumSavings,
      cumCustomerOutflow,
      netCumulativeCashflow,
    });
  }

  return points;
}

/**
 * ============================================================================
 * COMMERCIAL SOLAR TAX & DEPRECIATION ENGINE (Phase G / P1-F)
 * ============================================================================
 */
export interface CommercialAssessmentParams {
  capacityKw: number;
  discomCode?: string;
  commissioningWindow?: "H1_FULL_RATE" | "H2_HALF_RATE";
  corporateTaxRatePct?: number;
  hasTaxableProfit?: boolean;
}

export interface CommercialAssessmentResult {
  status: VerificationStatus;
  capacityKw: number;
  discom: DiscomInfo;
  commercialTariffInrPerKwh: number;
  specificYieldKwhPerKwYear: number;
  annualGenKwh: number;
  grossCapexInr: number;
  subsidyInr: 0;
  depreciationStatute: string;
  commissioningWindow: "H1_FULL_RATE" | "H2_HALF_RATE";
  year1DepreciationRatePct: number;
  year1DepreciationDeductionInr: number;
  remainingWdvAfterYear1Inr: number;
  corporateTaxRatePct: number;
  hasTaxableProfit: boolean;
  year1IllustrativeTaxShieldInr: number;
  effectiveNetCapexAfterTaxShieldInr: number;
  annualOperationalSavingsInr: number;
  operationalPaybackYears: number;
  taxAdjustedIllustrativePaybackYears: number;
  lifetime25YrOperationalSavingsInr: number;
  disclosures: string[];
  source: DataSource;
}

export function calculateCommercialSolarAssessment(
  params: CommercialAssessmentParams,
): CommercialAssessmentResult {
  const safeKw =
    typeof params.capacityKw === "number" &&
    Number.isFinite(params.capacityKw) &&
    params.capacityKw > 0
      ? params.capacityKw
      : 100;

  const discom = DISCOMS.find((d) => d.code === params.discomCode) ?? DISCOMS[0];
  const yieldProfile = getSolarYieldProfileForDiscom(discom.code);
  const specificYieldKwhPerKwYear =
    yieldProfile.annualKwhPerKw || HYDERABAD_ANNUAL_YIELD_KWH_PER_KW;

  const annualGenKwh = Math.round(safeKw * specificYieldKwhPerKwYear);
  const grossCapexInr = Math.round(safeKw * SOLAR_ASSUMPTIONS.commercialPricePerKwInr);
  const commercialTariffInrPerKwh = discom.commercialTariffInr;

  const commissioningWindow =
    params.commissioningWindow === "H2_HALF_RATE" ? "H2_HALF_RATE" : "H1_FULL_RATE";
  const year1DepreciationRatePct = commissioningWindow === "H2_HALF_RATE" ? 20 : 40;

  // Statutory depreciation deduction from taxable business income (NOT cash tax saved)
  const year1DepreciationDeductionInr = Math.round(
    grossCapexInr * (year1DepreciationRatePct / 100),
  );
  const remainingWdvAfterYear1Inr = Math.max(0, grossCapexInr - year1DepreciationDeductionInr);

  const rawTaxRate =
    typeof params.corporateTaxRatePct === "number" &&
    Number.isFinite(params.corporateTaxRatePct) &&
    params.corporateTaxRatePct >= 0
      ? params.corporateTaxRatePct
      : 25.17;

  const hasTaxableProfit =
    typeof params.hasTaxableProfit === "boolean" ? params.hasTaxableProfit : rawTaxRate > 0;
  const corporateTaxRatePct = hasTaxableProfit ? rawTaxRate : 0;

  // Illustrative tax shield = Depreciation Deduction × Effective Corporate Tax Rate
  const year1IllustrativeTaxShieldInr =
    hasTaxableProfit && corporateTaxRatePct > 0
      ? Math.round(year1DepreciationDeductionInr * (corporateTaxRatePct / 100))
      : 0;

  const effectiveNetCapexAfterTaxShieldInr = Math.max(
    0,
    grossCapexInr - year1IllustrativeTaxShieldInr,
  );

  const annualOperationalSavingsInr = Math.round(annualGenKwh * commercialTariffInrPerKwh);

  const operationalPaybackYears =
    annualOperationalSavingsInr > 0
      ? Number((grossCapexInr / annualOperationalSavingsInr).toFixed(1))
      : 0;

  const taxAdjustedIllustrativePaybackYears =
    annualOperationalSavingsInr > 0
      ? Number((effectiveNetCapexAfterTaxShieldInr / annualOperationalSavingsInr).toFixed(1))
      : 0;

  const projection = project25Years({
    annualBillInr: annualOperationalSavingsInr * 2,
    annualSavingsInr: annualOperationalSavingsInr,
    annualGenKwh,
    netInvestmentInr: grossCapexInr,
    grossInvestmentInr: grossCapexInr,
    subsidyInr: 0,
    tariffPerKwh: commercialTariffInrPerKwh,
  });
  const lifetime25YrOperationalSavingsInr = projection[24].cumSavings;

  return {
    status: discom.status === "VERIFIED" ? "VERIFIED" : "INDICATIVE",
    capacityKw: safeKw,
    discom,
    commercialTariffInrPerKwh,
    specificYieldKwhPerKwYear,
    annualGenKwh,
    grossCapexInr,
    subsidyInr: 0,
    depreciationStatute: "Section 33, Income-tax Act, 2025 & Notified Income-tax Rules, 2026",
    commissioningWindow,
    year1DepreciationRatePct,
    year1DepreciationDeductionInr,
    remainingWdvAfterYear1Inr,
    corporateTaxRatePct,
    hasTaxableProfit,
    year1IllustrativeTaxShieldInr,
    effectiveNetCapexAfterTaxShieldInr,
    annualOperationalSavingsInr,
    operationalPaybackYears,
    taxAdjustedIllustrativePaybackYears,
    lifetime25YrOperationalSavingsInr,
    disclosures: [
      `Under Section 33 of the Income-tax Act, 2025 and Notified Income-tax Rules, 2026 (Appendix I — Renewable Energy Devices: Solar Power Generating Systems), qualifying commercial solar plants are eligible for ${year1DepreciationRatePct}% Written Down Value (WDV) depreciation in Year 1 (${commissioningWindow === "H1_FULL_RATE" ? "commissioned ≥ 180 days" : "commissioned < 180 days at 50% of block rate"}).`,
      `The ₹${year1DepreciationDeductionInr.toLocaleString("en-IN")} depreciation allowance is a deduction from taxable business income, not a direct cash grant or government subsidy.`,
      hasTaxableProfit
        ? `The illustrative Year-1 tax shield of ₹${year1IllustrativeTaxShieldInr.toLocaleString("en-IN")} assumes an effective corporate tax rate of ${corporateTaxRatePct}% and sufficient taxable business profit to absorb the deduction.`
        : "With 0% effective tax rate or no current taxable business profit, the immediate Year-1 cash tax shield is ₹0 (unabsorbed depreciation may be carried forward subject to statutory assessment).",
      "Consult your company's Chartered Accountant to verify depreciation block eligibility, MAT/AMT interactions, and corporate tax regime elections.",
    ],
    source: INCOME_TAX_SECTION_33_SOURCE,
  };
}

/**
 * ============================================================================
 * MONTHLY BILLING-PERIOD NET-METERING SETTLEMENT ENGINE (TASK A)
 * ============================================================================
 *
 * Models 12 monthly billing periods per:
 * - TGERC Regulation No. 1 of 2025 (dated 15.11.2025), Sections 2 & 8.1.1–8.1.5
 * - APERC Regulation No. 4 of 2023, Clauses 16.1 & 16.5
 *
 * In each monthly billing period m:
 * - Exported kWh offsets imported kWh only within that billing period:
 *   netMeteredOffsetKwh_m = min(exportedKwh_m, importedKwh_m)
 * - Net imported units (residualGridImportKwh_m = max(0, importedKwh_m - exportedKwh_m))
 *   are billed on that month's retail telescopic tariff schedule + unavoidable fixed/customer charges.
 * - Net excess exported units (billingPeriodSurplusKwh_m = max(0, exportedKwh_m - importedKwh_m))
 *   cannot retroactively or cross-period offset another month's grid imports at 1:1 retail slab rates;
 *   they are settled at the utility's indicative surplus export rate (exportRateInr).
 */
export interface MonthlyBillingPeriodPoint {
  monthIndex: number;
  month: string;
  consumptionKwh: number;
  genKwh: number;
  selfConsumedKwh: number;
  exportedKwh: number;
  importedKwh: number;
  netMeteredOffsetKwh: number;
  residualGridImportKwh: number;
  billingPeriodSurplusKwh: number;
  baselineBillInr: number;
  unavoidableFixedCustomerChargesInr: number;
  postSolarBillInr: number;
  avoidedBillSavingsInr: number;
  surplusExportCreditInr: number;
}

export interface AnnualAggregateComparison {
  annualAggregateOffsetKwh: number;
  annualAggregateSurplusKwh: number;
  annualAggregateResidualImportKwh: number;
  annualAggregateAvoidedBillSavingsInr: number;
  annualAggregateSurplusCreditInr: number;
  annualAggregateTotalSavingsInr: number;
  crossPeriodOffsetPreventedKwh: number;
  savingsDifferenceVsAnnualAggregateInr: number;
}

export interface EstimateParams {
  monthlyBillInr?: number;
  monthlyUnitsOverride?: number;
  monthlyConsumptionByMonth?: number[]; // Optional 12-month consumption profile (Jan..Dec)
  discomCode?: string;
  segment?: "residential" | "commercial";
  panels?: number;
  batteryUnits?: number;
  includeBatteryInSchemeLoan?: boolean;
  paymentMode?: "cash" | "loan";
  subsidyCreditMode?: LoanSubsidyCreditMode;
  subsidyCreditMonth?: number;
  sanctionedLoadKw?: number;
  sanctionedLoadConfirmed?: boolean;
  availableRoofSqft?: number;
  specialCategoryState?: boolean;
  isGridConnected?: boolean;
  dcrCompliant?: boolean;
  hasPriorSubsidy?: boolean;
  ownershipConfirmed?: boolean;
  portalApproved?: boolean;
  subsidyReceived?: boolean;
  subsidyDisbursed?: boolean;
}

export interface NetMeteringEnergyBalance {
  settlementStatus: VerificationStatus;
  settlementCycle: BillingSettlementCycle;
  exportRateStatus: VerificationStatus;
  exportSettlementBasis: string;
  consumptionProfileBasis: "ACTUAL_OR_SEASONAL_12_MONTH" | "UNIFORM_MONTHLY_ASSUMPTION";
  annualConsumptionKwh: number;
  annualGenKwh: number;
  selfConsumedKwh: number;
  exportedKwh: number;
  importedKwh: number;
  netMeteredOffsetKwh: number;
  netAnnualSurplusKwh: number;
  residualGridImportKwh: number;
  avoidedBillSavingsInr: number;
  surplusExportCreditInr: number;
  unavoidableAnnualFixedChargesInr: number;
  postSolarAnnualBillInr: number;
  selfConsumptionRatio: number;
  monthlyLedger: MonthlyBillingPeriodPoint[];
  annualAggregateComparison: AnnualAggregateComparison;
  batteryBackupRoleNote: string;
}

export interface VerificationBreakdown {
  tariffSchedule: VerificationStatus;
  surplusExportRate: VerificationStatus;
  solarGeneration: VerificationStatus;
  subsidyEligibility: SubsidyEligibilityStatus;
  sanctionedLoadFeasibility: VerificationStatus | "REQUIRES_VERIFICATION";
  financing: VerificationStatus;
  completeEstimate: VerificationStatus;
}

export interface EstimateResult {
  status: VerificationStatus;
  verificationBreakdown: VerificationBreakdown;
  monthlyUnits: number;
  annualConsumptionKwh: number;
  recommendedKw: number;
  recommendedPanels: number;
  systemKw: number;
  panels: number;
  annualGenKwh: number;
  selfConsumedKwh: number;
  exportedKwh: number;
  importedKwh: number;
  netMeteredOffsetKwh: number;
  netAnnualSurplusKwh: number;
  residualGridImportKwh: number;
  annualBillInr: number;
  residualBillAfterSolarInr: number;
  avoidedBillSavingsInr: number;
  surplusExportCreditInr: number;
  annualSavingsInr: number;
  billCoveragePct: number;
  solarGrossInr: number;
  batteryGrossInr: number;
  potentialSubsidyInr: number;
  confirmedSubsidyInr: number;
  receivedSubsidyInr: number;
  subsidyInr: number;
  grossInr: number;
  conditionalNetInr: number;
  netInr: number;
  monthlyEmiInr: number;
  emiBelowBill: boolean;
  paybackYears: number;
  savings25YearsInr: number;
  netGain25YearsInr: number;
  projection: YearProjectionPoint[];
  financedProjection: YearProjectionPoint[];
  financedNetGain25YearsInr: number;
  financedPaybackYears: number;
  cashFlowLedger: CashFlowLedgerSummary;
  energyBalance: NetMeteringEnergyBalance;
  billBreakdown: ElectricityBillResult;
  subsidyAssessment: SubsidyAssessment;
  sanctionedLoadFeasibility: SanctionedLoadFeasibilityAssessment;
  financing: SolarFinancingAssessment;
  roofFeasibility: RoofFeasibilityAssessment;
  warnings: string[];
  disclosures: string[];
  assumptions: {
    discom: DiscomInfo;
    tariffInrPerKwh: number;
    exportRateInr: number;
    exportRateStatus: VerificationStatus;
    panelWatt: number;
    yieldKwhPerKwYear: number;
    selfConsumptionRatio: number;
    sanctionedLoadKw: number;
    sanctionedLoadConfirmed: boolean;
    loanTenureMonths: number;
    loanAnnualRate: number;
  };
  sources: {
    tariff: DataSource;
    netMetering: DataSource;
    subsidy: DataSource;
    financing: DataSource;
  };
}

/**
 * Pure calculation engine for solar sizing, monthly billing-period net-metering settlement,
 * sanctioned-load feasibility, SBI loan-account subsidy prepayment, and 25-year returns.
 */
export function estimate(params: EstimateParams = {}): EstimateResult {
  const rawBill = params.monthlyBillInr;
  const billInput =
    typeof rawBill === "number" && Number.isFinite(rawBill) && rawBill > 0 ? rawBill : 0;
  const segment = params.segment === "commercial" ? "commercial" : "residential";

  const requestedCode = params.discomCode?.trim();
  const matchedDiscom = requestedCode ? DISCOMS.find((d) => d.code === requestedCode) : DISCOMS[0];
  const isUnknownDiscom = Boolean(requestedCode && !matchedDiscom);

  // Unknown DISCOMs never receive Hyderabad-based tariffs or yields
  const discom: DiscomInfo = isUnknownDiscom
    ? {
        code: requestedCode!,
        name: "Unsupported / Unverified Utility",
        state: "Unverified Jurisdiction",
        residentialTariffInr: 0,
        commercialTariffInr: 0,
        exportRateInr: 0,
        exportRateStatus: "UNAVAILABLE",
        exportSettlementBasis: "Unsupported utility",
        settlementCycle: "UNVERIFIED",
        maxResidentialSolarPctOfSanctionedLoad: 100,
        maxCommercialSolarPctOfSanctionedLoad: 100,
        status: "UNAVAILABLE",
        authority: "Unsupported Utility",
        cityKey: "unsupported",
        regulatoryNote:
          "Tariff and net-metering rules for this electricity board are not yet verified in the WAVENOX engine. Request a site consultation for utility-specific engineering.",
        gruhaJyothiApplicable: false,
        tariffSource: TGERC_TARIFF_SOURCE,
        netMeteringRegulationSource: TGERC_RTS_REGULATION_2025_SOURCE,
      }
    : (matchedDiscom ?? DISCOMS[0]);

  const status: VerificationStatus = isUnknownDiscom ? "UNAVAILABLE" : discom.status;

  // Sanctioned load confirmation state (Task C: never assume verified 5 kW load)
  const hasExplicitSanctionedLoad =
    typeof params.sanctionedLoadKw === "number" &&
    Number.isFinite(params.sanctionedLoadKw) &&
    params.sanctionedLoadKw > 0;
  const sanctionedLoadConfirmed =
    typeof params.sanctionedLoadConfirmed === "boolean"
      ? params.sanctionedLoadConfirmed && hasExplicitSanctionedLoad
      : hasExplicitSanctionedLoad;
  const effectiveSanctionedLoadKw = hasExplicitSanctionedLoad ? params.sanctionedLoadKw! : 5;

  // Regional specific yield lookup (returns 0 / UNAVAILABLE for unknown DISCOMs)
  const yieldProfile = getSolarYieldProfileForDiscom(isUnknownDiscom ? requestedCode : discom.code);
  const yieldKwhPerKwYear = isUnknownDiscom ? 0 : yieldProfile.annualKwhPerKw;

  const tariff = isUnknownDiscom
    ? 0
    : segment === "commercial"
      ? discom.commercialTariffInr
      : discom.residentialTariffInr;

  // Check if a 12-month consumption profile was supplied
  const hasMonthlyConsumptionArray =
    Array.isArray(params.monthlyConsumptionByMonth) &&
    params.monthlyConsumptionByMonth.length === 12 &&
    params.monthlyConsumptionByMonth.every(
      (v) => typeof v === "number" && Number.isFinite(v) && v >= 0,
    );

  const hasUnitsOverride =
    typeof params.monthlyUnitsOverride === "number" &&
    Number.isFinite(params.monthlyUnitsOverride) &&
    params.monthlyUnitsOverride >= 0;

  const monthlyUnits = isUnknownDiscom
    ? 0
    : hasMonthlyConsumptionArray
      ? Math.round(params.monthlyConsumptionByMonth!.reduce((acc, v) => acc + v, 0) / 12)
      : hasUnitsOverride
        ? Math.round(params.monthlyUnitsOverride!)
        : segment === "residential" && billInput > 0
          ? unitsForBill(discom.code, billInput, effectiveSanctionedLoadKw)
          : tariff > 0
            ? Math.round(billInput / tariff)
            : 0;

  const billBreakdown = calculateElectricityBill(
    isUnknownDiscom ? requestedCode! : discom.code,
    monthlyUnits,
    {
      sanctionedLoadKw: effectiveSanctionedLoadKw,
      sanctionedLoadConfirmed,
    },
  );

  const effectiveMonthlyBillInr = isUnknownDiscom
    ? 0
    : billInput > 0 && !hasMonthlyConsumptionArray
      ? billInput
      : (hasUnitsOverride || hasMonthlyConsumptionArray) && monthlyUnits > 0
        ? segment === "residential"
          ? billBreakdown.totalBillInr
          : Math.round(monthlyUnits * tariff)
        : 0;

  const monthlyConsumptionList: number[] = isUnknownDiscom
    ? Array.from({ length: 12 }, () => 0)
    : hasMonthlyConsumptionArray
      ? params.monthlyConsumptionByMonth!.map((v) => Math.max(0, Math.round(v)))
      : Array.from({ length: 12 }, () => monthlyUnits);

  const annualUnits = monthlyConsumptionList.reduce((acc, v) => acc + v, 0);

  // System recommendation based on consumption and regional yield
  let neededKw =
    !isUnknownDiscom && annualUnits > 0 && yieldKwhPerKwYear > 0
      ? annualUnits / yieldKwhPerKwYear
      : SOLAR_ASSUMPTIONS.minResidentialKw;
  if (segment === "residential") {
    neededKw = Math.max(
      SOLAR_ASSUMPTIONS.minResidentialKw,
      Math.min(SOLAR_ASSUMPTIONS.maxResidentialKw, neededKw),
    );
  }
  const recommendedPanels = Math.ceil((neededKw * 1000) / SOLAR_ASSUMPTIONS.panelWatt);
  const recommendedKw = Number(
    ((recommendedPanels * SOLAR_ASSUMPTIONS.panelWatt) / 1000).toFixed(2),
  );

  // Configured system panels
  const rawPanels = params.panels;
  const panels =
    typeof rawPanels === "number" && Number.isFinite(rawPanels) && rawPanels > 0
      ? Math.round(rawPanels)
      : recommendedPanels;
  const systemKw = Number(((panels * SOLAR_ASSUMPTIONS.panelWatt) / 1000).toFixed(2));
  const targetAnnualGenKwh = isUnknownDiscom ? 0 : Math.round(systemKw * yieldKwhPerKwYear);

  // Battery configuration
  const rawBatteryUnits = params.batteryUnits;
  const batteryUnits =
    typeof rawBatteryUnits === "number" && Number.isFinite(rawBatteryUnits) && rawBatteryUnits > 0
      ? Math.round(rawBatteryUnits)
      : 0;

  const selfConsumptionRatio =
    batteryUnits > 0
      ? SOLAR_ASSUMPTIONS.selfConsumptionWithBattery
      : SOLAR_ASSUMPTIONS.selfConsumptionNoBattery;

  // Build 12-month solar generation array from regional monthlyYield profile,
  // reconciling any integer rounding remainder on the peak irradiance month (May)
  const rawMonthlyGen = yieldProfile.monthlyYield.map((m) =>
    isUnknownDiscom ? 0 : Math.round(systemKw * m.yieldKwh),
  );
  const rawGenSum = rawMonthlyGen.reduce((a, b) => a + b, 0);
  if (!isUnknownDiscom && targetAnnualGenKwh > 0 && rawGenSum !== targetAnnualGenKwh) {
    // Adjust peak month (index 4 = May) so sum of 12 monthly generations equals targetAnnualGenKwh
    rawMonthlyGen[4] = Math.max(0, rawMonthlyGen[4] + (targetAnnualGenKwh - rawGenSum));
  }
  const annualGenKwh = rawMonthlyGen.reduce((a, b) => a + b, 0);

  // ==========================================================================
  // TASK A: 12-MONTH BILLING-PERIOD NET-METERING SETTLEMENT SIMULATION
  // ==========================================================================
  const monthlyLedger: MonthlyBillingPeriodPoint[] = [];
  let selfConsumedKwh = 0;
  let exportedKwh = 0;
  let importedKwh = 0;
  let netMeteredOffsetKwh = 0;
  let netAnnualSurplusKwh = 0;
  let residualGridImportKwh = 0;
  let annualBillInr = 0;
  let unavoidableAnnualFixedChargesInr = 0;
  let postSolarAnnualBillInr = 0;
  let avoidedBillSavingsInr = 0;

  for (let m = 0; m < 12; m++) {
    const monthLabel = yieldProfile.monthlyYield[m]?.month ?? `M${m + 1}`;
    const c_m = monthlyConsumptionList[m];
    const g_m = rawMonthlyGen[m];

    const self_m = isUnknownDiscom ? 0 : Math.min(c_m, Math.round(g_m * selfConsumptionRatio));
    const exp_m = isUnknownDiscom ? 0 : Math.max(0, g_m - self_m);
    const imp_m = isUnknownDiscom ? 0 : Math.max(0, c_m - self_m);

    // Billing-period 1:1 kWh offset is strictly bounded by that billing period's imports and exports
    const offset_m = isUnknownDiscom ? 0 : Math.min(exp_m, imp_m);
    const resImp_m = isUnknownDiscom ? 0 : Math.max(0, imp_m - exp_m);
    const surplus_m = isUnknownDiscom ? 0 : Math.max(0, exp_m - imp_m);

    let baselineBill_m = 0;
    let unavoidable_m = 0;
    let postSolarBill_m = 0;
    let avoidedSavings_m = 0;

    if (!isUnknownDiscom && (c_m > 0 || billInput > 0)) {
      const mBillBreakdown = hasMonthlyConsumptionArray
        ? calculateElectricityBill(discom.code, c_m, {
            sanctionedLoadKw: effectiveSanctionedLoadKw,
            sanctionedLoadConfirmed,
            includeZeroUnitFixedCharges: true,
          })
        : billBreakdown;

      baselineBill_m = hasMonthlyConsumptionArray
        ? segment === "residential"
          ? mBillBreakdown.totalBillInr
          : Math.round(c_m * tariff)
        : effectiveMonthlyBillInr;

      unavoidable_m =
        segment === "residential" && baselineBill_m > 0 ? mBillBreakdown.unavoidableChargesInr : 0;

      if (status === "VERIFIED" && segment === "residential" && baselineBill_m > 0) {
        const resBill =
          resImp_m > 0
            ? calculateElectricityBill(discom.code, resImp_m, {
                sanctionedLoadKw: effectiveSanctionedLoadKw,
                sanctionedLoadConfirmed,
              })
            : null;
        const resAvoidable_m = resBill ? resBill.avoidableChargesInr : 0;
        postSolarBill_m = Math.min(baselineBill_m, unavoidable_m + resAvoidable_m);
        avoidedSavings_m = Math.max(0, baselineBill_m - postSolarBill_m);
      } else if (baselineBill_m > 0) {
        const maxAvoidable_m = Math.max(0, baselineBill_m - unavoidable_m);
        const offsetUnits_m = self_m + offset_m;
        avoidedSavings_m = Math.min(maxAvoidable_m, Math.round(offsetUnits_m * tariff));
        postSolarBill_m = Math.max(unavoidable_m, baselineBill_m - avoidedSavings_m);
      }
    }

    const surplusCredit_m = Math.round(surplus_m * discom.exportRateInr * 100) / 100;

    monthlyLedger.push({
      monthIndex: m + 1,
      month: monthLabel,
      consumptionKwh: c_m,
      genKwh: g_m,
      selfConsumedKwh: self_m,
      exportedKwh: exp_m,
      importedKwh: imp_m,
      netMeteredOffsetKwh: offset_m,
      residualGridImportKwh: resImp_m,
      billingPeriodSurplusKwh: surplus_m,
      baselineBillInr: baselineBill_m,
      unavoidableFixedCustomerChargesInr: unavoidable_m,
      postSolarBillInr: postSolarBill_m,
      avoidedBillSavingsInr: avoidedSavings_m,
      surplusExportCreditInr: surplusCredit_m,
    });

    selfConsumedKwh += self_m;
    exportedKwh += exp_m;
    importedKwh += imp_m;
    netMeteredOffsetKwh += offset_m;
    netAnnualSurplusKwh += surplus_m;
    residualGridImportKwh += resImp_m;
    annualBillInr += baselineBill_m;
    unavoidableAnnualFixedChargesInr += unavoidable_m;
    postSolarAnnualBillInr += postSolarBill_m;
    avoidedBillSavingsInr += avoidedSavings_m;
  }

  const hasActiveConsumption = !isUnknownDiscom && (annualUnits > 0 || annualBillInr > 0);
  const surplusExportCreditInr = !hasActiveConsumption
    ? 0
    : Math.round(netAnnualSurplusKwh * discom.exportRateInr);
  const annualSavingsInr = !hasActiveConsumption
    ? 0
    : avoidedBillSavingsInr + surplusExportCreditInr;
  const billCoveragePct =
    !isUnknownDiscom && annualBillInr > 0
      ? Math.min(100, Math.round((avoidedBillSavingsInr / annualBillInr) * 100))
      : 0;

  // Compute naive Annual Aggregate comparison to prove why monthly billing-period settlement
  // prevents cross-period 1:1 kWh offsetting across different billing cycles (Task A.10)
  const annualAggregateOffsetKwh = isUnknownDiscom ? 0 : Math.min(exportedKwh, importedKwh);
  const annualAggregateSurplusKwh = isUnknownDiscom
    ? 0
    : Math.max(0, exportedKwh - annualAggregateOffsetKwh);
  const annualAggregateResidualImportKwh = isUnknownDiscom
    ? 0
    : Math.max(0, importedKwh - annualAggregateOffsetKwh);
  let annualAggregateAvoidedBillSavingsInr = 0;
  if (!isUnknownDiscom && annualBillInr > 0) {
    if (status === "VERIFIED" && segment === "residential") {
      const aggResMonthly = Math.round(annualAggregateResidualImportKwh / 12);
      const aggResBill =
        aggResMonthly > 0
          ? calculateElectricityBill(discom.code, aggResMonthly, {
              sanctionedLoadKw: effectiveSanctionedLoadKw,
              sanctionedLoadConfirmed,
            })
          : null;
      const aggPostBill = Math.min(
        annualBillInr,
        unavoidableAnnualFixedChargesInr + (aggResBill ? aggResBill.avoidableChargesInr * 12 : 0),
      );
      annualAggregateAvoidedBillSavingsInr = Math.max(0, annualBillInr - aggPostBill);
    } else {
      const maxAvoidable = Math.max(0, annualBillInr - unavoidableAnnualFixedChargesInr);
      annualAggregateAvoidedBillSavingsInr = Math.min(
        maxAvoidable,
        Math.round((selfConsumedKwh + annualAggregateOffsetKwh) * tariff),
      );
    }
  }
  const annualAggregateSurplusCreditInr = isUnknownDiscom
    ? 0
    : Math.round(annualAggregateSurplusKwh * discom.exportRateInr);
  const annualAggregateTotalSavingsInr =
    annualAggregateAvoidedBillSavingsInr + annualAggregateSurplusCreditInr;

  const annualAggregateComparison: AnnualAggregateComparison = {
    annualAggregateOffsetKwh,
    annualAggregateSurplusKwh,
    annualAggregateResidualImportKwh,
    annualAggregateAvoidedBillSavingsInr,
    annualAggregateSurplusCreditInr,
    annualAggregateTotalSavingsInr,
    crossPeriodOffsetPreventedKwh: Math.max(0, annualAggregateOffsetKwh - netMeteredOffsetKwh),
    savingsDifferenceVsAnnualAggregateInr: annualAggregateTotalSavingsInr - annualSavingsInr,
  };

  // Capital expenditures (Gross Cost is unconditional)
  const costPerKw =
    segment === "commercial"
      ? SOLAR_ASSUMPTIONS.commercialPricePerKwInr
      : SOLAR_ASSUMPTIONS.pricePerKwInr;

  const solarGrossInr = Math.round(systemKw * costPerKw);
  const batteryGrossInr = batteryUnits * SOLAR_ASSUMPTIONS.battery.unitPriceInr;
  const grossInr = solarGrossInr + batteryGrossInr;

  // Conditional subsidy evaluation (P1-D: do not hardcode unconfirmed customer facts as true)
  const subsidyAssessment = evaluateSubsidyEligibility(systemKw, {
    segment,
    specialCategory: params.specialCategoryState,
    state: isUnknownDiscom ? undefined : discom.state,
    isGridConnected: params.isGridConnected,
    dcrCompliant: params.dcrCompliant,
    hasPriorSubsidy: params.hasPriorSubsidy,
    ownershipConfirmed: params.ownershipConfirmed,
    portalApproved: params.portalApproved,
    subsidyReceived: params.subsidyReceived ?? params.subsidyDisbursed,
  });
  const potentialSubsidyInr = subsidyAssessment.potentialSubsidyInr;
  const confirmedSubsidyInr = subsidyAssessment.confirmedEligibleSubsidyInr;
  const receivedSubsidyInr = subsidyAssessment.receivedSubsidyInr;
  const subsidyInr = potentialSubsidyInr;
  const conditionalNetInr = Math.max(0, grossInr - potentialSubsidyInr);
  const netInr = conditionalNetInr;

  // Residential / Studio Financing Assessment (Task B: SBI loan-account subsidy prepayment)
  const financing = calculateSolarFinancing({
    grossCapexInr: grossInr,
    batteryCapexInr: batteryGrossInr,
    includeBatteryInSchemeLoan: params.includeBatteryInSchemeLoan,
    systemKw,
    subsidyInr: isUnknownDiscom ? 0 : potentialSubsidyInr,
    subsidyCreditMonth: params.subsidyCreditMonth,
    subsidyCreditMode: params.subsidyCreditMode,
    tenureMonths: SOLAR_ASSUMPTIONS.loan.tenureMonths,
    segment,
  });
  const monthlyEmiInr = financing.monthlyEmiInr;
  const emiBelowBill =
    !isUnknownDiscom &&
    effectiveMonthlyBillInr > 0 &&
    monthlyEmiInr > 0 &&
    monthlyEmiInr < effectiveMonthlyBillInr;

  // Simple cash payback period
  const paybackYears =
    !isUnknownDiscom && annualSavingsInr > 0
      ? Number((conditionalNetInr / annualSavingsInr).toFixed(1))
      : 0;

  // Unified 25-Year Cash Purchase Projection (P0-B)
  const projection = project25Years({
    annualBillInr,
    annualSavingsInr,
    annualGenKwh,
    netInvestmentInr: isUnknownDiscom ? 0 : conditionalNetInr,
    grossInvestmentInr: isUnknownDiscom ? 0 : grossInr,
    subsidyInr: isUnknownDiscom ? 0 : potentialSubsidyInr,
    tariffPerKwh: tariff,
  });

  // Unified 25-Year Financed Purchase Projection (Task B: subsidy credited to loan principal, reconciled 100%)
  const financedProjection = project25Years({
    annualBillInr,
    annualSavingsInr,
    annualGenKwh,
    netInvestmentInr: isUnknownDiscom ? 0 : conditionalNetInr + financing.totalInterestInr,
    grossInvestmentInr: isUnknownDiscom ? 0 : grossInr,
    subsidyInr: isUnknownDiscom ? 0 : potentialSubsidyInr,
    tariffPerKwh: tariff,
    financing: {
      customerDownPaymentInr: isUnknownDiscom ? 0 : financing.customerDownPaymentInr,
      loanPrincipalInr: isUnknownDiscom ? 0 : financing.initialLoanPrincipalInr,
      subsidyInr: isUnknownDiscom ? 0 : potentialSubsidyInr,
      subsidyCreditedToLoanInr: isUnknownDiscom ? 0 : financing.subsidyCreditedToLoanInr,
      excessSubsidyToBorrowerInr: isUnknownDiscom ? 0 : financing.excessSubsidyToBorrowerInr,
      subsidyReceiptYear: 1,
      monthlyEmiInr: isUnknownDiscom ? 0 : financing.monthlyEmiInr,
      tenureMonths: financing.tenureMonths,
      annualBorrowerEmiOutflows: isUnknownDiscom
        ? Array.from({ length: 25 }, () => 0)
        : financing.annualBorrowerEmiOutflows,
    },
  });

  const savings25YearsInr = isUnknownDiscom ? 0 : projection[24].cumSavings;
  const netGain25YearsInr = isUnknownDiscom ? 0 : projection[24].netCumulativeCashflow;
  const financedNetGain25YearsInr = isUnknownDiscom
    ? 0
    : financedProjection[24].netCumulativeCashflow;
  const financedPaybackYears =
    !isUnknownDiscom && annualSavingsInr > 0
      ? Number(((conditionalNetInr + financing.totalInterestInr) / annualSavingsInr).toFixed(1))
      : 0;

  const cashFlowLedger: CashFlowLedgerSummary = {
    year0CashOutflowInr: grossInr,
    year0LoanDownPaymentInr: financing.customerDownPaymentInr,
    year0CustomerOutflowInr:
      params.paymentMode === "loan" ? financing.customerDownPaymentInr : grossInr,
    initialLoanPrincipalInr: financing.initialLoanPrincipalInr,
    loanPrincipalInr: financing.loanPrincipalInr,
    initialMonthlyEmiInr: financing.initialMonthlyEmiInr,
    postSubsidyPrincipalInr: financing.postSubsidyPrincipalInr,
    postSubsidyMonthlyEmiInr: financing.postSubsidyMonthlyEmiInr,
    monthlyEmiInr: financing.monthlyEmiInr,
    loanTenureMonths: financing.tenureMonths,
    effectiveLoanTenureMonths: financing.effectiveTenureMonths,
    totalGrossEmiRepaymentBeforeSubsidyInr: financing.totalGrossRepaymentBeforeSubsidyInr,
    totalEmiRepaymentInr: financing.totalRepaymentInr,
    totalLoanInterestInr: financing.totalInterestInr,
    interestSavedBySubsidyPrepaymentInr: financing.interestSavedBySubsidyPrepaymentInr,
    subsidyReceiptYear: 1,
    subsidyReceiptTiming: "POST_COMMISSIONING_YEAR_1",
    subsidyCreditTreatment:
      params.paymentMode === "loan" && financing.subsidyCreditedToLoanInr > 0
        ? "DIRECT_TO_LOAN_PRINCIPAL"
        : "CASH_DBT_TO_BORROWER",
    year1LoanPrincipalPrepaymentInr: financing.subsidyCreditedToLoanInr,
    year1UnrestrictedCashSubsidyInr:
      params.paymentMode === "loan" ? financing.excessSubsidyToBorrowerInr : potentialSubsidyInr,
    year1SubsidyCreditInr: potentialSubsidyInr,
    conditionalSubsidyCreditInr: potentialSubsidyInr,
    netCashCapitalOutflowInr: conditionalNetInr,
    netFinancedTotalOutflowInr:
      financing.customerDownPaymentInr +
      financing.totalRepaymentInr -
      financing.excessSubsidyToBorrowerInr,
    reconcilesWithSummary:
      projection[24].netCumulativeCashflow === netGain25YearsInr &&
      financedProjection[24].netCumulativeCashflow === financedNetGain25YearsInr,
    ongoingCostsNote:
      "Preventive cleaning and inverter replacement reserves beyond the 10-year inverter warranty are excluded from baseline cash-flow projections and reviewed during engineering consultation.",
  };

  // Task C: Sanctioned load & regulatory capacity feasibility
  const sanctionedLoadFeasibility = evaluateSanctionedLoadFeasibility({
    systemKw,
    discomCode: isUnknownDiscom ? requestedCode : discom.code,
    segment,
    sanctionedLoadKw: params.sanctionedLoadKw,
    sanctionedLoadConfirmed,
  });

  const verificationBreakdown: VerificationBreakdown = {
    tariffSchedule: status,
    surplusExportRate: isUnknownDiscom ? "UNAVAILABLE" : discom.exportRateStatus,
    solarGeneration: isUnknownDiscom ? "UNAVAILABLE" : yieldProfile.status,
    subsidyEligibility: isUnknownDiscom
      ? "REQUIRES_VERIFICATION"
      : subsidyAssessment.eligibilityStatus,
    sanctionedLoadFeasibility: sanctionedLoadFeasibility.status,
    financing: isUnknownDiscom ? "UNAVAILABLE" : financing.status,
    completeEstimate: isUnknownDiscom ? "UNAVAILABLE" : "INDICATIVE",
  };

  const roofFeasibility = validateRoofFeasibility(
    panels,
    SOLAR_ASSUMPTIONS.panelWatt,
    params.availableRoofSqft,
  );

  const warnings: string[] = [];
  if (isUnknownDiscom) {
    warnings.push(
      `DISCOM "${requestedCode}" is not in the verified WAVENOX utility registry. Financial savings and payback figures are withheld; please request an engineering consultation for utility-specific modeling.`,
    );
  }
  if (!roofFeasibility.isFeasible && roofFeasibility.warning) {
    warnings.push(roofFeasibility.warning);
  }
  if (sanctionedLoadFeasibility.warning) {
    warnings.push(sanctionedLoadFeasibility.warning);
  }
  if (!financing.isSchemeEligible && params.paymentMode === "loan") {
    warnings.push(financing.note);
  }

  const consumptionBasisDisclosure = hasMonthlyConsumptionArray
    ? "Monthly settlement modeled across your 12-month seasonal consumption profile and regional monthly solar yield curve."
    : `Monthly billing-period settlement modeled across 12 regional monthly solar yield periods assuming a uniform ${monthlyUnits.toLocaleString("en-IN")} units/month consumption baseline (provide 12-month utility bill history during site consultation for seasonal load calibration).`;

  const disclosures: string[] = [
    status === "VERIFIED"
      ? `Electricity tariff and monthly billing-period settlement modeled using verified ${discom.authority} schedules for ${discom.name} (${discom.state}). ${discom.exportSettlementBasis}`
      : status === "INDICATIVE"
        ? `Electricity tariff for ${discom.name} (${discom.state}) uses an indicative regional benchmark (₹${tariff.toFixed(2)}/kWh); exact bill savings depend on your sanctioned load and SERC slab tier.`
        : `Electricity tariff and net-metering rules for ${discom.code} are unverified; financial savings are withheld pending consultation.`,
    consumptionBasisDisclosure,
    `Unavoidable monthly fixed/customer charges (~₹${billBreakdown.unavoidableChargesInr}/month) remain payable to ${discom.code} even in billing periods where solar exports offset 100% of grid imports.`,
    ...sanctionedLoadFeasibility.disclosures,
    `Potential PM Surya Ghar CFA subsidy (up to ₹${potentialSubsidyInr.toLocaleString("en-IN")}) is conditional on active residential grid connection, DCR-compliant modules, and National Portal approval. In SBI loan mode, post-commissioning DBT subsidy is credited directly to the solar loan account to reduce loan principal.`,
  ];

  const consumptionProfileBasis = hasMonthlyConsumptionArray
    ? "ACTUAL_OR_SEASONAL_12_MONTH"
    : "UNIFORM_MONTHLY_ASSUMPTION";

  return {
    status,
    verificationBreakdown,
    monthlyUnits,
    annualConsumptionKwh: annualUnits,
    recommendedKw,
    recommendedPanels,
    systemKw,
    panels,
    annualGenKwh,
    selfConsumedKwh,
    exportedKwh,
    importedKwh,
    netMeteredOffsetKwh,
    netAnnualSurplusKwh,
    residualGridImportKwh,
    annualBillInr,
    residualBillAfterSolarInr: postSolarAnnualBillInr,
    avoidedBillSavingsInr,
    surplusExportCreditInr,
    annualSavingsInr,
    billCoveragePct,
    solarGrossInr,
    batteryGrossInr,
    potentialSubsidyInr,
    confirmedSubsidyInr,
    receivedSubsidyInr,
    subsidyInr,
    grossInr,
    conditionalNetInr,
    netInr,
    monthlyEmiInr,
    emiBelowBill,
    paybackYears,
    savings25YearsInr,
    netGain25YearsInr,
    projection,
    financedProjection,
    financedNetGain25YearsInr,
    financedPaybackYears,
    cashFlowLedger,
    energyBalance: {
      settlementStatus: status,
      settlementCycle: discom.settlementCycle,
      exportRateStatus: discom.exportRateStatus,
      exportSettlementBasis: discom.exportSettlementBasis,
      consumptionProfileBasis,
      annualConsumptionKwh: annualUnits,
      annualGenKwh,
      selfConsumedKwh,
      exportedKwh,
      importedKwh,
      netMeteredOffsetKwh,
      netAnnualSurplusKwh,
      residualGridImportKwh,
      avoidedBillSavingsInr,
      surplusExportCreditInr,
      unavoidableAnnualFixedChargesInr,
      postSolarAnnualBillInr,
      selfConsumptionRatio,
      monthlyLedger,
      annualAggregateComparison,
      batteryBackupRoleNote:
        batteryUnits > 0
          ? "Under 1:1 net-metering, battery storage primarily provides uninterrupted UPS backup during grid outages and shifts daytime solar to evening self-consumption."
          : "Grid-tied 1:1 net-metered configuration without standalone battery storage.",
    },
    billBreakdown,
    subsidyAssessment,
    sanctionedLoadFeasibility,
    financing,
    roofFeasibility,
    warnings,
    disclosures,
    assumptions: {
      discom,
      tariffInrPerKwh: tariff,
      exportRateInr: discom.exportRateInr,
      exportRateStatus: discom.exportRateStatus,
      panelWatt: SOLAR_ASSUMPTIONS.panelWatt,
      yieldKwhPerKwYear,
      selfConsumptionRatio,
      sanctionedLoadKw: effectiveSanctionedLoadKw,
      sanctionedLoadConfirmed,
      loanTenureMonths: SOLAR_ASSUMPTIONS.loan.tenureMonths,
      loanAnnualRate: financing.annualInterestRate,
    },
    sources: {
      tariff: discom.tariffSource ?? TGERC_TARIFF_SOURCE,
      netMetering: discom.netMeteringRegulationSource ?? TGERC_RTS_REGULATION_2025_SOURCE,
      subsidy: PM_SURYA_GHAR_SOURCE,
      financing: SBI_SOLAR_LOAN_SOURCE,
    },
  };
}

/**
 * Backward compatibility object for legacy references.
 */
export const SOLAR_CONFIG = {
  panelWatt: SOLAR_ASSUMPTIONS.panelWatt,
  pricePerKwInr: SOLAR_ASSUMPTIONS.pricePerKwInr,
  yieldKwhPerKwYear: SOLAR_ASSUMPTIONS.yieldKwhPerKwYear,
  defaultTariffInrPerKwh: 9.2,
  discoms: DISCOMS,
};

export const SOLAR_SPECS = SOLAR_CONFIG;
