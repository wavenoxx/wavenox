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
  calculateElectricityBill,
  unitsForBill,
  DISCOM_TARIFF_PROFILES,
  getSolarYieldProfileForDiscom,
  HYDERABAD_ANNUAL_YIELD_KWH_PER_KW,
  MODULE_WARRANTY_TERMS,
  SOLAR_LOAN_TERMS,
  TGERC_TARIFF_SOURCE,
  PM_SURYA_GHAR_SOURCE,
  SBI_SOLAR_LOAN_SOURCE,
  INCOME_TAX_SECTION_33_SOURCE,
  type DataSource,
  type VerificationStatus,
  type SubsidyAssessment,
  type ElectricityBillResult,
} from "@/config/regulatory";

export interface DiscomInfo {
  code: string;
  name: string;
  state: string;
  residentialTariffInr: number;
  commercialTariffInr: number;
  exportRateInr: number; // Net-metering surplus settlement rate (APPC / FiT)
  status: VerificationStatus;
  authority: string;
  cityKey: string;
  regulatoryNote: string;
  gruhaJyothiApplicable: boolean;
  tariffSource: DataSource;
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

/**
 * State-aware DISCOM catalog with explicit VerificationStatus per utility:
 * - VERIFIED: Telangana (TGSPDCL, TGNPDCL) via TGERC FY 2025-26/2026-27 orders
 *             and Andhra Pradesh (APEPDCL, APSPDCL) via APERC FY 2025-26/2026-27 orders.
 * - INDICATIVE: Regional tariff benchmarks for Karnataka, Maharashtra, Delhi-NCR,
 *               Goa, and Tamil Nadu pending individual SERC slab ingestion.
 */
export const DISCOMS: DiscomInfo[] = [
  {
    code: "TGSPDCL",
    name: "Telangana Southern Power Distribution Company",
    state: "Telangana",
    residentialTariffInr: 9.2,
    commercialTariffInr: 10.5,
    exportRateInr: 3.55,
    status: DISCOM_TARIFF_PROFILES.TGSPDCL.status,
    authority: DISCOM_TARIFF_PROFILES.TGSPDCL.authority,
    cityKey: DISCOM_TARIFF_PROFILES.TGSPDCL.cityKey,
    regulatoryNote: DISCOM_TARIFF_PROFILES.TGSPDCL.regulatoryNote,
    gruhaJyothiApplicable: DISCOM_TARIFF_PROFILES.TGSPDCL.gruhaJyothiApplicable,
    tariffSource: DISCOM_TARIFF_PROFILES.TGSPDCL.source,
  },
  {
    code: "TGNPDCL",
    name: "Telangana Northern Power Distribution Company",
    state: "Telangana",
    residentialTariffInr: 8.8,
    commercialTariffInr: 10.2,
    exportRateInr: 3.55,
    status: DISCOM_TARIFF_PROFILES.TGNPDCL.status,
    authority: DISCOM_TARIFF_PROFILES.TGNPDCL.authority,
    cityKey: DISCOM_TARIFF_PROFILES.TGNPDCL.cityKey,
    regulatoryNote: DISCOM_TARIFF_PROFILES.TGNPDCL.regulatoryNote,
    gruhaJyothiApplicable: DISCOM_TARIFF_PROFILES.TGNPDCL.gruhaJyothiApplicable,
    tariffSource: DISCOM_TARIFF_PROFILES.TGNPDCL.source,
  },
  {
    code: "BESCOM",
    name: "Bangalore Electricity Supply Company (Karnataka)",
    state: "Karnataka",
    residentialTariffInr: 8.8,
    commercialTariffInr: 10.2,
    exportRateInr: 3.82,
    status: DISCOM_TARIFF_PROFILES.BESCOM.status,
    authority: DISCOM_TARIFF_PROFILES.BESCOM.authority,
    cityKey: DISCOM_TARIFF_PROFILES.BESCOM.cityKey,
    regulatoryNote: DISCOM_TARIFF_PROFILES.BESCOM.regulatoryNote,
    gruhaJyothiApplicable: DISCOM_TARIFF_PROFILES.BESCOM.gruhaJyothiApplicable,
    tariffSource: DISCOM_TARIFF_PROFILES.BESCOM.source,
  },
  {
    code: "MSEDCL",
    name: "Maharashtra State Electricity Distribution (Mahavitaran)",
    state: "Maharashtra",
    residentialTariffInr: 9.5,
    commercialTariffInr: 11.2,
    exportRateInr: 3.75,
    status: DISCOM_TARIFF_PROFILES.MSEDCL.status,
    authority: DISCOM_TARIFF_PROFILES.MSEDCL.authority,
    cityKey: DISCOM_TARIFF_PROFILES.MSEDCL.cityKey,
    regulatoryNote: DISCOM_TARIFF_PROFILES.MSEDCL.regulatoryNote,
    gruhaJyothiApplicable: DISCOM_TARIFF_PROFILES.MSEDCL.gruhaJyothiApplicable,
    tariffSource: DISCOM_TARIFF_PROFILES.MSEDCL.source,
  },
  {
    code: "TATA_MUMBAI",
    name: "Tata Power Mumbai (MMR)",
    state: "Maharashtra",
    residentialTariffInr: 9.8,
    commercialTariffInr: 11.5,
    exportRateInr: 3.9,
    status: DISCOM_TARIFF_PROFILES.TATA_MUMBAI.status,
    authority: DISCOM_TARIFF_PROFILES.TATA_MUMBAI.authority,
    cityKey: DISCOM_TARIFF_PROFILES.TATA_MUMBAI.cityKey,
    regulatoryNote: DISCOM_TARIFF_PROFILES.TATA_MUMBAI.regulatoryNote,
    gruhaJyothiApplicable: DISCOM_TARIFF_PROFILES.TATA_MUMBAI.gruhaJyothiApplicable,
    tariffSource: DISCOM_TARIFF_PROFILES.TATA_MUMBAI.source,
  },
  {
    code: "APEPDCL",
    name: "Eastern Power Distribution Company of AP (Visakhapatnam)",
    state: "Andhra Pradesh",
    residentialTariffInr: 8.9,
    commercialTariffInr: 10.4,
    exportRateInr: 3.6,
    status: DISCOM_TARIFF_PROFILES.APEPDCL.status,
    authority: DISCOM_TARIFF_PROFILES.APEPDCL.authority,
    cityKey: DISCOM_TARIFF_PROFILES.APEPDCL.cityKey,
    regulatoryNote: DISCOM_TARIFF_PROFILES.APEPDCL.regulatoryNote,
    gruhaJyothiApplicable: DISCOM_TARIFF_PROFILES.APEPDCL.gruhaJyothiApplicable,
    tariffSource: DISCOM_TARIFF_PROFILES.APEPDCL.source,
  },
  {
    code: "APSPDCL",
    name: "Southern Power Distribution Company of AP (Amaravati / Tirupati)",
    state: "Andhra Pradesh",
    residentialTariffInr: 8.9,
    commercialTariffInr: 10.4,
    exportRateInr: 3.6,
    status: DISCOM_TARIFF_PROFILES.APSPDCL.status,
    authority: DISCOM_TARIFF_PROFILES.APSPDCL.authority,
    cityKey: DISCOM_TARIFF_PROFILES.APSPDCL.cityKey,
    regulatoryNote: DISCOM_TARIFF_PROFILES.APSPDCL.regulatoryNote,
    gruhaJyothiApplicable: DISCOM_TARIFF_PROFILES.APSPDCL.gruhaJyothiApplicable,
    tariffSource: DISCOM_TARIFF_PROFILES.APSPDCL.source,
  },
  {
    code: "BRPL",
    name: "BSES Rajdhani Power Limited (New Delhi)",
    state: "Delhi-NCR",
    residentialTariffInr: 8.5,
    commercialTariffInr: 10.8,
    exportRateInr: 3.7,
    status: DISCOM_TARIFF_PROFILES.BRPL.status,
    authority: DISCOM_TARIFF_PROFILES.BRPL.authority,
    cityKey: DISCOM_TARIFF_PROFILES.BRPL.cityKey,
    regulatoryNote: DISCOM_TARIFF_PROFILES.BRPL.regulatoryNote,
    gruhaJyothiApplicable: DISCOM_TARIFF_PROFILES.BRPL.gruhaJyothiApplicable,
    tariffSource: DISCOM_TARIFF_PROFILES.BRPL.source,
  },
  {
    code: "DHBVN",
    name: "Dakshin Haryana Bijli Vitran Nigam (Gurugram)",
    state: "Delhi-NCR",
    residentialTariffInr: 8.6,
    commercialTariffInr: 10.6,
    exportRateInr: 3.65,
    status: DISCOM_TARIFF_PROFILES.DHBVN.status,
    authority: DISCOM_TARIFF_PROFILES.DHBVN.authority,
    cityKey: DISCOM_TARIFF_PROFILES.DHBVN.cityKey,
    regulatoryNote: DISCOM_TARIFF_PROFILES.DHBVN.regulatoryNote,
    gruhaJyothiApplicable: DISCOM_TARIFF_PROFILES.DHBVN.gruhaJyothiApplicable,
    tariffSource: DISCOM_TARIFF_PROFILES.DHBVN.source,
  },
  {
    code: "GED",
    name: "Goa Electricity Department (Goa Coastal)",
    state: "Goa",
    residentialTariffInr: 7.8,
    commercialTariffInr: 9.8,
    exportRateInr: 3.5,
    status: DISCOM_TARIFF_PROFILES.GED.status,
    authority: DISCOM_TARIFF_PROFILES.GED.authority,
    cityKey: DISCOM_TARIFF_PROFILES.GED.cityKey,
    regulatoryNote: DISCOM_TARIFF_PROFILES.GED.regulatoryNote,
    gruhaJyothiApplicable: DISCOM_TARIFF_PROFILES.GED.gruhaJyothiApplicable,
    tariffSource: DISCOM_TARIFF_PROFILES.GED.source,
  },
  {
    code: "TANGEDCO",
    name: "Tamil Nadu Generation & Distribution Corporation (Chennai)",
    state: "Tamil Nadu",
    residentialTariffInr: 8.7,
    commercialTariffInr: 10.5,
    exportRateInr: 3.6,
    status: DISCOM_TARIFF_PROFILES.TANGEDCO.status,
    authority: DISCOM_TARIFF_PROFILES.TANGEDCO.authority,
    cityKey: DISCOM_TARIFF_PROFILES.TANGEDCO.cityKey,
    regulatoryNote: DISCOM_TARIFF_PROFILES.TANGEDCO.regulatoryNote,
    gruhaJyothiApplicable: DISCOM_TARIFF_PROFILES.TANGEDCO.gruhaJyothiApplicable,
    tariffSource: DISCOM_TARIFF_PROFILES.TANGEDCO.source,
  },
];

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
    annualRate: SOLAR_LOAN_TERMS.tier2.annualInterestRate, // 7.90%
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
 * RESIDENTIAL FINANCING & EMI ENGINE (Phase E)
 * ============================================================================
 */
export interface SolarFinancingAssessment {
  status: VerificationStatus;
  grossCapexInr: number;
  customerMarginPct: number;
  customerDownPaymentInr: number;
  loanPrincipalInr: number;
  annualInterestRate: number;
  annualInterestRatePct: number;
  tenureMonths: number;
  monthlyEmiInr: number;
  totalRepaymentInr: number;
  totalInterestInr: number;
  tierLabel: string;
  exceedsConcessionalCap: boolean;
  effectiveAsOf: string;
  caveats: string[];
  source: DataSource;
}

export function calculateSolarFinancing(params: {
  grossCapexInr: number;
  batteryCapexInr?: number;
  tenureMonths?: number;
  annualInterestRate?: number;
  customerMarginPct?: number;
}): SolarFinancingAssessment {
  const grossCapexInr =
    typeof params.grossCapexInr === "number" &&
    Number.isFinite(params.grossCapexInr) &&
    params.grossCapexInr > 0
      ? Math.round(params.grossCapexInr)
      : 0;

  const customerMarginPct =
    typeof params.customerMarginPct === "number" &&
    Number.isFinite(params.customerMarginPct) &&
    params.customerMarginPct >= 0 &&
    params.customerMarginPct < 1
      ? params.customerMarginPct
      : SOLAR_LOAN_TERMS.minCustomerMarginPct;

  const customerDownPaymentInr = Math.round(grossCapexInr * customerMarginPct);
  const loanPrincipalInr = Math.max(0, grossCapexInr - customerDownPaymentInr);

  const tenureMonths =
    typeof params.tenureMonths === "number" &&
    Number.isFinite(params.tenureMonths) &&
    params.tenureMonths > 0
      ? Math.round(params.tenureMonths)
      : SOLAR_LOAN_TERMS.defaultTenureMonths;

  const exceedsConcessionalCap = loanPrincipalInr > SOLAR_LOAN_TERMS.tier2.maxAmountInr;

  let annualInterestRate: number;
  let tierLabel: string;
  let status: VerificationStatus = "VERIFIED";

  if (
    typeof params.annualInterestRate === "number" &&
    Number.isFinite(params.annualInterestRate) &&
    params.annualInterestRate >= 0
  ) {
    annualInterestRate = params.annualInterestRate;
    tierLabel = "Custom Financing Rate Assumption";
    status = "INDICATIVE";
  } else if (loanPrincipalInr <= SOLAR_LOAN_TERMS.tier1.maxAmountInr) {
    annualInterestRate = SOLAR_LOAN_TERMS.tier1.annualInterestRate;
    tierLabel = "SBI PM Surya Ghar Tier 1 (≤ ₹2,00,000 · Collateral-Free)";
  } else if (loanPrincipalInr <= SOLAR_LOAN_TERMS.tier2.maxAmountInr) {
    annualInterestRate = SOLAR_LOAN_TERMS.tier2.annualInterestRate;
    tierLabel = "SBI PM Surya Ghar Tier 2 (₹2,00,001 – ₹6,00,000)";
  } else {
    annualInterestRate = SOLAR_LOAN_TERMS.tier2.annualInterestRate;
    tierLabel = "Indicative Retail Solar / Home-Equity Financing (> ₹6,00,000 PM Surya Ghar Cap)";
    status = "INDICATIVE";
  }

  let monthlyEmiInr = 0;
  let totalRepaymentInr = 0;
  let totalInterestInr = 0;

  if (loanPrincipalInr > 0 && tenureMonths > 0) {
    if (annualInterestRate <= 0) {
      monthlyEmiInr = Math.round(loanPrincipalInr / tenureMonths);
      totalRepaymentInr = loanPrincipalInr;
      totalInterestInr = 0;
    } else {
      const r = annualInterestRate / 12;
      const factor = Math.pow(1 + r, tenureMonths);
      monthlyEmiInr = Math.round((loanPrincipalInr * r * factor) / (factor - 1));
      totalRepaymentInr = monthlyEmiInr * tenureMonths;
      totalInterestInr = Math.max(0, totalRepaymentInr - loanPrincipalInr);
    }
  }

  const caveats: string[] = [
    `Interest rates (${(annualInterestRate * 100).toFixed(2)}% p.a. floating, effective as of ${SOLAR_LOAN_TERMS.asOfDate}) are linked to bank EBLR and subject to borrower credit underwriting.`,
    `Assumes ${(customerMarginPct * 100).toFixed(0)}% customer margin contribution (₹${customerDownPaymentInr.toLocaleString("en-IN")}) and ${(100 - customerMarginPct * 100).toFixed(0)}% financed principal (₹${loanPrincipalInr.toLocaleString("en-IN")}).`,
  ];

  if (exceedsConcessionalCap) {
    caveats.push(
      `Financed principal (₹${loanPrincipalInr.toLocaleString("en-IN")}) exceeds the ₹6,00,000 PM Surya Ghar concessional scheme ceiling; banks typically underwrite larger residential systems under retail solar or home-equity top-up terms.`,
    );
  }

  if ((params.batteryCapexInr ?? 0) > 0) {
    caveats.push(
      "Standalone battery storage capex is not covered under MNRE PM Surya Ghar concessional loan subsidies unless bundled under approved bank retail solar terms.",
    );
  }

  return {
    status,
    grossCapexInr,
    customerMarginPct,
    customerDownPaymentInr,
    loanPrincipalInr,
    annualInterestRate,
    annualInterestRatePct: Number((annualInterestRate * 100).toFixed(2)),
    tenureMonths,
    monthlyEmiInr,
    totalRepaymentInr,
    totalInterestInr,
    tierLabel,
    exceedsConcessionalCap,
    effectiveAsOf: SOLAR_LOAN_TERMS.asOfDate,
    caveats,
    source: SBI_SOLAR_LOAN_SOURCE,
  };
}

/**
 * ============================================================================
 * 25-YEAR CASH FLOW & LIFETIME WEALTH ENGINE (Phase F)
 * ============================================================================
 */
export interface YearProjectionPoint {
  year: number;
  tariffPerKwh: number;
  genKwh: number;
  annualBillWithoutSolar?: number;
  annualSavings?: number;
  annualLoanOutflow?: number;
  cumSpendWithoutSolar: number;
  cumSavings: number;
  netCumulativeCashflow: number; // starts negative (savings - netInvestmentInr), crosses zero at payback
}

export interface ProjectionParams {
  annualBillInr: number;
  annualSavingsInr: number;
  annualGenKwh: number;
  netInvestmentInr: number;
  tariffPerKwh: number;
  degradationPerYear?: number;
  tariffEscalationPerYear?: number;
  financing?: {
    customerDownPaymentInr: number;
    subsidyInr: number;
    monthlyEmiInr: number;
    tenureMonths: number;
  };
}

/**
 * Single, unified 25-Year Compound Simulation used across estimate(),
 * WealthCurveVisualizer, and ArchitecturalDossierModal.
 * Models 0.40% annual linear module degradation and 3.0% annual tariff escalation.
 */
export function project25Years(params: ProjectionParams): YearProjectionPoint[] {
  const {
    annualBillInr,
    annualSavingsInr,
    annualGenKwh,
    netInvestmentInr,
    tariffPerKwh,
    degradationPerYear = SOLAR_ASSUMPTIONS.degradationPerYear,
    tariffEscalationPerYear = SOLAR_ASSUMPTIONS.tariffEscalationPerYear,
    financing,
  } = params;

  const points: YearProjectionPoint[] = [];
  let cumSpendWithoutSolar = 0;
  let cumSavings = 0;
  let cumLoanOutflow = financing
    ? Math.max(0, financing.customerDownPaymentInr - financing.subsidyInr)
    : 0;

  for (let y = 1; y <= 25; y++) {
    const degFactor = Math.pow(1 - degradationPerYear, y - 1);
    const escFactor = Math.pow(1 + tariffEscalationPerYear, y - 1);

    const yearBill = Math.round(annualBillInr * escFactor);
    const yearTariff = Number((tariffPerKwh * escFactor).toFixed(2));
    const yearGen = Math.round(annualGenKwh * degFactor);

    // Annual savings in Year y, capped at that year's electricity bill
    const yearSavings = Math.min(yearBill, Math.round(annualSavingsInr * degFactor * escFactor));

    let annualLoanOutflow = 0;
    if (financing && financing.monthlyEmiInr > 0 && financing.tenureMonths > 0) {
      const startMonth = (y - 1) * 12 + 1;
      if (startMonth <= financing.tenureMonths) {
        const activeMonths = Math.min(12, financing.tenureMonths - startMonth + 1);
        annualLoanOutflow = financing.monthlyEmiInr * activeMonths;
      }
      cumLoanOutflow += annualLoanOutflow;
    }

    cumSpendWithoutSolar += yearBill;
    cumSavings += yearSavings;

    const netCumulativeCashflow = financing
      ? Math.round(cumSavings - cumLoanOutflow)
      : Math.round(cumSavings - netInvestmentInr);

    points.push({
      year: y,
      tariffPerKwh: yearTariff,
      genKwh: yearGen,
      annualBillWithoutSolar: yearBill,
      annualSavings: yearSavings,
      annualLoanOutflow,
      cumSpendWithoutSolar,
      cumSavings,
      netCumulativeCashflow,
    });
  }

  return points;
}

/**
 * ============================================================================
 * COMMERCIAL SOLAR TAX & DEPRECIATION ENGINE (Phase G)
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
  const specificYieldKwhPerKwYear = yieldProfile.annualKwhPerKw;

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
    depreciationStatute: "Section 33, Income-tax Act, 2025 & Income-tax Rules, 2026",
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
      `Under Section 33 of the Income-tax Act, 2025 (and Income-tax Rules, 2026), commercial solar power generating systems qualify for ${year1DepreciationRatePct}% Written Down Value (WDV) depreciation in Year 1 (${commissioningWindow === "H1_FULL_RATE" ? "commissioned ≥ 180 days" : "commissioned < 180 days at 50% of block rate"}).`,
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
 * UNIFIED RESIDENTIAL & STUDIO SOLAR ESTIMATE CONTRACT (Phases B, C, D, E, F, I)
 * ============================================================================
 */
export interface EstimateParams {
  monthlyBillInr?: number;
  discomCode?: string;
  segment?: "residential" | "commercial";
  panels?: number;
  batteryUnits?: number;
  paymentMode?: "cash" | "loan";
  availableRoofSqft?: number;
  specialCategoryState?: boolean;
}

export interface NetMeteringEnergyBalance {
  annualConsumptionKwh: number;
  annualGenKwh: number;
  selfConsumedKwh: number;
  exportedKwh: number;
  importedKwh: number;
  netMeteredOffsetKwh: number;
  netAnnualSurplusKwh: number;
  residualGridImportKwh: number;
  selfConsumptionRatio: number;
  batteryBackupRoleNote: string;
}

export interface EstimateResult {
  status: VerificationStatus;
  monthlyUnits: number;
  recommendedKw: number;
  recommendedPanels: number;
  systemKw: number;
  panels: number;
  annualGenKwh: number;
  annualBillInr: number;
  annualSavingsInr: number;
  billCoveragePct: number;
  solarGrossInr: number;
  batteryGrossInr: number;
  subsidyInr: number;
  grossInr: number;
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
  energyBalance: NetMeteringEnergyBalance;
  billBreakdown: ElectricityBillResult;
  subsidyAssessment: SubsidyAssessment;
  financing: SolarFinancingAssessment;
  roofFeasibility: RoofFeasibilityAssessment;
  warnings: string[];
  disclosures: string[];
  assumptions: {
    discom: DiscomInfo;
    tariffInrPerKwh: number;
    exportRateInr: number;
    panelWatt: number;
    yieldKwhPerKwYear: number;
    selfConsumptionRatio: number;
    loanTenureMonths: number;
    loanAnnualRate: number;
  };
  sources: {
    tariff: DataSource;
    subsidy: DataSource;
    financing: DataSource;
  };
}

/**
 * Pure calculation engine for solar sizing, energy generation, and financial returns.
 */
export function estimate(params: EstimateParams = {}): EstimateResult {
  const rawBill = params.monthlyBillInr;
  const bill = typeof rawBill === "number" && Number.isFinite(rawBill) && rawBill > 0 ? rawBill : 0;
  const segment = params.segment === "commercial" ? "commercial" : "residential";

  const requestedCode = params.discomCode?.trim();
  const matchedDiscom = requestedCode ? DISCOMS.find((d) => d.code === requestedCode) : DISCOMS[0];
  const isUnknownDiscom = Boolean(requestedCode && !matchedDiscom);
  const discom = matchedDiscom ?? DISCOMS[0];

  const status: VerificationStatus = isUnknownDiscom ? "UNAVAILABLE" : discom.status;

  // Regional specific yield lookup (uses 1,490 kWh/kWp/yr for Telangana and regional profiles for other states)
  const yieldProfile = getSolarYieldProfileForDiscom(discom.code);
  const yieldKwhPerKwYear = yieldProfile.annualKwhPerKw;

  const tariff =
    segment === "commercial" ? discom.commercialTariffInr : discom.residentialTariffInr;
  const annualBillInr = Math.round(bill * 12);

  // Use state-aware telescopic tariff slabs for VERIFIED DISCOMs, or benchmark inverse for INDICATIVE
  const monthlyUnits =
    segment === "residential" && bill > 0
      ? unitsForBill(discom.code, bill, 5)
      : tariff > 0
        ? Math.round(bill / tariff)
        : 0;
  const annualUnits = monthlyUnits * 12;

  const billBreakdown = calculateElectricityBill(
    isUnknownDiscom ? requestedCode! : discom.code,
    monthlyUnits,
    { sanctionedLoadKw: 5 },
  );

  // System recommendation based on consumption and regional yield
  let neededKw =
    annualUnits > 0 ? annualUnits / yieldKwhPerKwYear : SOLAR_ASSUMPTIONS.minResidentialKw;
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
  const annualGenKwh = Math.round(systemKw * yieldKwhPerKwYear);

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

  // 1:1 Net-Metering Energy Balance:
  // Self-consumed solar avoids immediate grid import, while exported daytime solar
  // offsets night/evening grid import 1:1 up to total annual consumption.
  const selfConsumedKwh = Math.round(annualGenKwh * selfConsumptionRatio);
  const exportedKwh = Math.max(0, annualGenKwh - selfConsumedKwh);
  const importedKwh = Math.max(0, annualUnits - selfConsumedKwh);
  const netMeteredOffsetKwh = Math.min(exportedKwh, importedKwh);
  const netAnnualSurplusKwh = Math.max(0, exportedKwh - netMeteredOffsetKwh);
  const residualGridImportKwh = Math.max(0, importedKwh - netMeteredOffsetKwh);

  // Value generated: self-consumed avoids retail tariff, exported offsets at retail/APPC
  const annualGenValueInr = Math.round(
    selfConsumedKwh * tariff + exportedKwh * discom.exportRateInr,
  );

  // Real bill savings capped at annual electricity bill
  const annualSavingsInr = Math.min(annualBillInr, annualGenValueInr);
  const billCoveragePct =
    annualBillInr > 0 ? Math.min(100, Math.round((annualSavingsInr / annualBillInr) * 100)) : 0;

  // Capital expenditures
  const costPerKw =
    segment === "commercial"
      ? SOLAR_ASSUMPTIONS.commercialPricePerKwInr
      : SOLAR_ASSUMPTIONS.pricePerKwInr;

  const solarGrossInr = Math.round(systemKw * costPerKw);
  const batteryGrossInr = batteryUnits * SOLAR_ASSUMPTIONS.battery.unitPriceInr;
  const grossInr = solarGrossInr + batteryGrossInr;

  const subsidyAssessment = evaluateSubsidyEligibility(systemKw, {
    segment,
    specialCategory: params.specialCategoryState,
    state: discom.state,
    isGridConnected: true,
    dcrCompliant: true,
  });
  const subsidyInr = subsidyAssessment.indicativeSubsidyInr;
  const netInr = Math.max(0, grossInr - subsidyInr);

  // Residential / Studio Financing Assessment
  const financing = calculateSolarFinancing({
    grossCapexInr: grossInr,
    batteryCapexInr: batteryGrossInr,
    tenureMonths: SOLAR_ASSUMPTIONS.loan.tenureMonths,
  });
  const monthlyEmiInr = financing.monthlyEmiInr;
  const emiBelowBill = bill > 0 && monthlyEmiInr > 0 && monthlyEmiInr < bill;

  // Simple cash payback period
  const paybackYears = annualSavingsInr > 0 ? Number((netInr / annualSavingsInr).toFixed(1)) : 0;

  // Unified 25-Year Cash Purchase Projection
  const projection = project25Years({
    annualBillInr,
    annualSavingsInr,
    annualGenKwh,
    netInvestmentInr: netInr,
    tariffPerKwh: tariff,
  });

  // Unified 25-Year Financed Purchase Projection (includes 10% down payment + EMI interest outflows)
  const financedProjection = project25Years({
    annualBillInr,
    annualSavingsInr,
    annualGenKwh,
    netInvestmentInr: netInr + financing.totalInterestInr,
    tariffPerKwh: tariff,
    financing: {
      customerDownPaymentInr: financing.customerDownPaymentInr,
      subsidyInr,
      monthlyEmiInr: financing.monthlyEmiInr,
      tenureMonths: financing.tenureMonths,
    },
  });

  const savings25YearsInr = projection[24].cumSavings;
  const netGain25YearsInr = projection[24].netCumulativeCashflow;
  const financedNetGain25YearsInr = savings25YearsInr - (netInr + financing.totalInterestInr);
  const financedPaybackYears =
    annualSavingsInr > 0
      ? Number(((netInr + financing.totalInterestInr) / annualSavingsInr).toFixed(1))
      : 0;

  const roofFeasibility = validateRoofFeasibility(
    panels,
    SOLAR_ASSUMPTIONS.panelWatt,
    params.availableRoofSqft,
  );

  const warnings: string[] = [];
  if (isUnknownDiscom) {
    warnings.push(
      `DISCOM "${requestedCode}" does not have a verified tariff schedule in the WAVENOX registry. Showing fallback benchmark estimates; do not rely on these figures for contractual billing.`,
    );
  }
  if (!roofFeasibility.isFeasible && roofFeasibility.warning) {
    warnings.push(roofFeasibility.warning);
  }
  if (financing.exceedsConcessionalCap && params.paymentMode === "loan") {
    warnings.push(
      `Loan principal ₹${financing.loanPrincipalInr.toLocaleString("en-IN")} exceeds the ₹6,00,000 PM Surya Ghar concessional loan cap.`,
    );
  }

  const disclosures: string[] = [
    status === "VERIFIED"
      ? `Electricity tariff modeled using verified ${discom.authority} slab schedule for ${discom.name} (${discom.state}).`
      : `Electricity tariff for ${discom.name} (${discom.state}) uses an indicative regional benchmark (₹${tariff.toFixed(2)}/kWh); exact bill savings depend on your sanctioned load and SERC slab tier.`,
    `Unavoidable monthly fixed/customer charges (~₹${billBreakdown.unavoidableChargesInr}/month) remain payable to ${discom.code} even when solar generation offsets 100% of energy consumption.`,
    `PM Surya Ghar CFA subsidy (₹${subsidyInr.toLocaleString("en-IN")}) is not an upfront invoice discount; it is disbursed via Direct Benefit Transfer (DBT) after DISCOM net-meter commissioning.`,
  ];

  return {
    status,
    monthlyUnits,
    recommendedKw,
    recommendedPanels,
    systemKw,
    panels,
    annualGenKwh,
    annualBillInr,
    annualSavingsInr,
    billCoveragePct,
    solarGrossInr,
    batteryGrossInr,
    subsidyInr,
    grossInr,
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
    energyBalance: {
      annualConsumptionKwh: annualUnits,
      annualGenKwh,
      selfConsumedKwh,
      exportedKwh,
      importedKwh,
      netMeteredOffsetKwh,
      netAnnualSurplusKwh,
      residualGridImportKwh,
      selfConsumptionRatio,
      batteryBackupRoleNote:
        batteryUnits > 0
          ? "Under 1:1 net-metering, battery storage primarily provides uninterrupted UPS backup during grid outages and shifts daytime solar to evening self-consumption."
          : "Grid-tied 1:1 net-metered configuration without standalone battery storage.",
    },
    billBreakdown,
    subsidyAssessment,
    financing,
    roofFeasibility,
    warnings,
    disclosures,
    assumptions: {
      discom,
      tariffInrPerKwh: tariff,
      exportRateInr: discom.exportRateInr,
      panelWatt: SOLAR_ASSUMPTIONS.panelWatt,
      yieldKwhPerKwYear,
      selfConsumptionRatio,
      loanTenureMonths: SOLAR_ASSUMPTIONS.loan.tenureMonths,
      loanAnnualRate: financing.annualInterestRate,
    },
    sources: {
      tariff: discom.tariffSource ?? TGERC_TARIFF_SOURCE,
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
