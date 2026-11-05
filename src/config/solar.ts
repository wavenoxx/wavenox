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
  type SubsidyEligibilityStatus,
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
 * RESIDENTIAL FINANCING & EMI ENGINE (Phase E / P0-C)
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
  isSchemeEligible: boolean;
  exceedsConcessionalCap: boolean;
  effectiveAsOf: string;
  note: string;
  caveats: string[];
  source: DataSource;
}

export function calculateSolarFinancing(params: {
  grossCapexInr: number;
  batteryCapexInr?: number;
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
  const isSchemeEligible =
    !exceedsConcessionalCap && (params.segment ?? "residential") === "residential";

  let annualInterestRate: number;
  let tierLabel: string;
  // All financing estimates are conditional on borrower credit underwriting, EBLR spreads, and bank sanction
  const status: VerificationStatus = "INDICATIVE";

  if (
    typeof params.annualInterestRate === "number" &&
    Number.isFinite(params.annualInterestRate) &&
    params.annualInterestRate >= 0
  ) {
    annualInterestRate = params.annualInterestRate;
    tierLabel = "Custom Financing Rate Assumption";
  } else if (loanPrincipalInr <= SOLAR_LOAN_TERMS.tier1.maxAmountInr) {
    annualInterestRate = SOLAR_LOAN_TERMS.tier1.annualInterestRate; // 6.00% p.a. (eff. 2026-10-15)
    tierLabel = "SBI PM Surya Ghar Tier 1 (≤ ₹2,00,000 · 6.00% p.a. floating, eff. 2026-10-15)";
  } else if (loanPrincipalInr <= SOLAR_LOAN_TERMS.tier2.maxAmountInr) {
    annualInterestRate = SOLAR_LOAN_TERMS.tier2.annualInterestRate; // 8.15% p.a. (eff. 2026-10-15)
    tierLabel =
      "SBI PM Surya Ghar Tier 2 (₹2,00,001 – ₹6,00,000 · 8.15% p.a. floating, eff. 2026-10-15)";
  } else {
    annualInterestRate = SOLAR_LOAN_TERMS.aboveCapIndicativeRate; // 9.15% p.a. indicative above-cap modeling assumption
    tierLabel =
      "Unverified Above-Cap Modeling Assumption (> ₹6,00,000 PM Surya Ghar Ceiling · 9.15% p.a. Indicative)";
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
    `Interest rates (${(annualInterestRate * 100).toFixed(2)}% p.a. floating, effective ${SOLAR_LOAN_TERMS.asOfDate}) are linked to SBI EBLR and conditional on borrower CIBIL appraisal and bank sanction.`,
    `Assumes ${(customerMarginPct * 100).toFixed(0)}% Year-0 customer margin contribution (₹${customerDownPaymentInr.toLocaleString("en-IN")}) and ${(100 - customerMarginPct * 100).toFixed(0)}% financed principal (₹${loanPrincipalInr.toLocaleString("en-IN")}).`,
    SOLAR_LOAN_TERMS.legacyScheduleNote,
  ];

  if (exceedsConcessionalCap) {
    caveats.push(
      `Financed principal (₹${loanPrincipalInr.toLocaleString("en-IN")}) exceeds the ₹6,00,000 PM Surya Ghar scheme ceiling; the 9.15% p.a. rate is an unverified modeling assumption, not a published SBI PM Surya Ghar offer.`,
    );
  }

  if ((params.batteryCapexInr ?? 0) > 0) {
    caveats.push(
      "Standalone battery storage capex is not covered under MNRE PM Surya Ghar concessional loan terms unless bundled under approved retail bank underwriting.",
    );
  }

  const note = exceedsConcessionalCap
    ? `Financed loan principal (₹${loanPrincipalInr.toLocaleString("en-IN")}) exceeds the ₹6,00,000 PM Surya Ghar concessional cap; modeled at an indicative ${(annualInterestRate * 100).toFixed(2)}% p.a. non-scheme rate.`
    : `Modeled on SBI PM Surya Ghar Green Loan terms (${(annualInterestRate * 100).toFixed(2)}% p.a. floating effective ${SOLAR_LOAN_TERMS.asOfDate}).`;

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
    isSchemeEligible,
    exceedsConcessionalCap,
    effectiveAsOf: SOLAR_LOAN_TERMS.asOfDate,
    note,
    caveats,
    source: SBI_SOLAR_LOAN_SOURCE,
  };
}

/**
 * ============================================================================
 * 25-YEAR CASH FLOW & LIFETIME WEALTH ENGINE (Phase F / P0-B)
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
  subsidyCreditInr: number; // Post-commissioning DBT credit received in Year 1 (0 in Years 2–25)
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
  loanPrincipalInr: number;
  monthlyEmiInr: number;
  loanTenureMonths: number;
  totalEmiRepaymentInr: number;
  totalLoanInterestInr: number;
  subsidyReceiptYear: number;
  subsidyReceiptTiming: "POST_COMMISSIONING_YEAR_1";
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
    subsidyReceiptYear?: number;
    monthlyEmiInr: number;
    tenureMonths: number;
  };
}

/**
 * Single, unified 25-Year Compound Simulation used across estimate(),
 * WealthCurveVisualizer, and ArchitecturalDossierModal.
 *
 * Implements an explicit, reconciled cash-flow ledger:
 * - Year 0 outflow: grossInvestmentInr (Cash mode) or customerDownPaymentInr (Loan mode)
 * - Year 1 post-commissioning DBT subsidy credit: subsidyInr (counted exactly once in Year 1)
 * - Years 1..tenure: annual EMI payments (monthlyEmiInr × activeMonths)
 * - No clamping via Math.max(0, downPayment - subsidy) — preserves exact reconciliation even when
 *   conditional DBT subsidy exceeds the 10% customer down payment.
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
    if (financing && financing.monthlyEmiInr > 0 && financing.tenureMonths > 0) {
      const startMonth = (y - 1) * 12 + 1;
      if (startMonth <= financing.tenureMonths) {
        const activeMonths = Math.min(12, financing.tenureMonths - startMonth + 1);
        annualLoanOutflow = financing.monthlyEmiInr * activeMonths;
      }
      cumLoanEmiPaid += annualLoanOutflow;
    }

    const subsidyCreditInr =
      y === subsidyReceiptYear ? Math.round(financing ? financing.subsidyInr : cashSubsidyInr) : 0;
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
 * UNIFIED RESIDENTIAL & STUDIO SOLAR ESTIMATE CONTRACT (Phases B–I / P0-A..P1-E)
 * ============================================================================
 */
export interface EstimateParams {
  monthlyBillInr?: number;
  monthlyUnitsOverride?: number;
  discomCode?: string;
  segment?: "residential" | "commercial";
  panels?: number;
  batteryUnits?: number;
  paymentMode?: "cash" | "loan";
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
  batteryBackupRoleNote: string;
}

export interface VerificationBreakdown {
  tariffSchedule: VerificationStatus;
  solarGeneration: VerificationStatus;
  subsidyEligibility: SubsidyEligibilityStatus;
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
        status: "UNAVAILABLE",
        authority: "Unsupported Utility",
        cityKey: "unsupported",
        regulatoryNote:
          "Tariff and net-metering rules for this electricity board are not yet verified in the WAVENOX engine. Request a site consultation for utility-specific engineering.",
        gruhaJyothiApplicable: false,
        tariffSource: TGERC_TARIFF_SOURCE,
      }
    : (matchedDiscom ?? DISCOMS[0]);

  const status: VerificationStatus = isUnknownDiscom ? "UNAVAILABLE" : discom.status;

  // Regional specific yield lookup (returns 0 / UNAVAILABLE for unknown DISCOMs)
  const yieldProfile = getSolarYieldProfileForDiscom(isUnknownDiscom ? requestedCode : discom.code);
  const yieldKwhPerKwYear = isUnknownDiscom ? 0 : yieldProfile.annualKwhPerKw;

  const tariff = isUnknownDiscom
    ? 0
    : segment === "commercial"
      ? discom.commercialTariffInr
      : discom.residentialTariffInr;

  // Determine monthly consumption (units) and monthly bill
  const hasUnitsOverride =
    typeof params.monthlyUnitsOverride === "number" &&
    Number.isFinite(params.monthlyUnitsOverride) &&
    params.monthlyUnitsOverride >= 0;

  const monthlyUnits = isUnknownDiscom
    ? 0
    : hasUnitsOverride
      ? Math.round(params.monthlyUnitsOverride!)
      : segment === "residential" && billInput > 0
        ? unitsForBill(discom.code, billInput, 5)
        : tariff > 0
          ? Math.round(billInput / tariff)
          : 0;

  const billBreakdown = calculateElectricityBill(
    isUnknownDiscom ? requestedCode! : discom.code,
    monthlyUnits,
    { sanctionedLoadKw: 5 },
  );

  const effectiveMonthlyBillInr = isUnknownDiscom
    ? 0
    : billInput > 0
      ? billInput
      : hasUnitsOverride && monthlyUnits > 0
        ? segment === "residential"
          ? billBreakdown.totalBillInr
          : Math.round(monthlyUnits * tariff)
        : 0;
  const annualBillInr = Math.round(effectiveMonthlyBillInr * 12);
  const annualUnits = monthlyUnits * 12;

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
  const annualGenKwh = isUnknownDiscom ? 0 : Math.round(systemKw * yieldKwhPerKwYear);

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

  // Strict 1:1 Net-Metering Energy Balance (P0-A):
  // 1. Self-consumed energy cannot exceed total annual consumption.
  // 2. Exported energy = annualGenKwh - selfConsumedKwh.
  // 3. Qualifying 1:1 net-metered offset = min(exportedKwh, importedKwh).
  // 4. True annual surplus = exportedKwh - netMeteredOffsetKwh (settled at APPC).
  // 5. Residual net grid import = importedKwh - netMeteredOffsetKwh.
  const selfConsumedKwh = isUnknownDiscom
    ? 0
    : Math.min(annualUnits, Math.round(annualGenKwh * selfConsumptionRatio));
  const exportedKwh = isUnknownDiscom ? 0 : Math.max(0, annualGenKwh - selfConsumedKwh);
  const importedKwh = isUnknownDiscom ? 0 : Math.max(0, annualUnits - selfConsumedKwh);
  const netMeteredOffsetKwh = isUnknownDiscom ? 0 : Math.min(exportedKwh, importedKwh);
  const netAnnualSurplusKwh = isUnknownDiscom ? 0 : Math.max(0, exportedKwh - netMeteredOffsetKwh);
  const residualGridImportKwh = isUnknownDiscom
    ? 0
    : Math.max(0, importedKwh - netMeteredOffsetKwh);

  // Regulator-grounded settlement calculation (P0-A):
  let unavoidableAnnualFixedChargesInr = 0;
  let postSolarAnnualBillInr = 0;
  let avoidedBillSavingsInr = 0;
  let surplusExportCreditInr = 0;

  if (!isUnknownDiscom && annualBillInr > 0) {
    unavoidableAnnualFixedChargesInr =
      segment === "residential" ? billBreakdown.unavoidableChargesInr * 12 : 0;

    if (status === "VERIFIED" && segment === "residential") {
      // Verified TGERC (Telangana) & APERC (Andhra Pradesh) telescopic slab settlement:
      // Residual net billed units per month after 1:1 kWh offset within the annual settlement window
      const residualMonthlyUnits = Math.round(residualGridImportKwh / 12);
      const residualBill =
        residualMonthlyUnits > 0
          ? calculateElectricityBill(discom.code, residualMonthlyUnits, { sanctionedLoadKw: 5 })
          : null;
      const residualAvoidableAnnualInr = residualBill ? residualBill.avoidableChargesInr * 12 : 0;
      postSolarAnnualBillInr = Math.min(
        annualBillInr,
        unavoidableAnnualFixedChargesInr + residualAvoidableAnnualInr,
      );
      avoidedBillSavingsInr = Math.max(0, annualBillInr - postSolarAnnualBillInr);
      surplusExportCreditInr = Math.round(netAnnualSurplusKwh * discom.exportRateInr);
    } else {
      // Indicative regional benchmark DISCOMs or commercial segment:
      const maxAvoidableAnnualBillInr = Math.max(
        0,
        annualBillInr - unavoidableAnnualFixedChargesInr,
      );
      const offsetUnitsKwh = selfConsumedKwh + netMeteredOffsetKwh;
      avoidedBillSavingsInr = Math.min(
        maxAvoidableAnnualBillInr,
        Math.round(offsetUnitsKwh * tariff),
      );
      postSolarAnnualBillInr = Math.max(
        unavoidableAnnualFixedChargesInr,
        annualBillInr - avoidedBillSavingsInr,
      );
      surplusExportCreditInr = Math.round(netAnnualSurplusKwh * discom.exportRateInr);
    }
  }

  const annualSavingsInr = isUnknownDiscom ? 0 : avoidedBillSavingsInr + surplusExportCreditInr;
  const billCoveragePct =
    !isUnknownDiscom && annualBillInr > 0
      ? Math.min(100, Math.round((avoidedBillSavingsInr / annualBillInr) * 100))
      : 0;

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

  // Residential / Studio Financing Assessment (P0-C)
  const financing = calculateSolarFinancing({
    grossCapexInr: grossInr,
    batteryCapexInr: batteryGrossInr,
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

  // Unified 25-Year Financed Purchase Projection (P0-B: transparent ledger with Year-1 post-commissioning DBT)
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
      loanPrincipalInr: isUnknownDiscom ? 0 : financing.loanPrincipalInr,
      subsidyInr: isUnknownDiscom ? 0 : potentialSubsidyInr,
      subsidyReceiptYear: 1,
      monthlyEmiInr: isUnknownDiscom ? 0 : financing.monthlyEmiInr,
      tenureMonths: financing.tenureMonths,
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
    loanPrincipalInr: financing.loanPrincipalInr,
    monthlyEmiInr: financing.monthlyEmiInr,
    loanTenureMonths: financing.tenureMonths,
    totalEmiRepaymentInr: financing.totalRepaymentInr,
    totalLoanInterestInr: financing.totalInterestInr,
    subsidyReceiptYear: 1,
    subsidyReceiptTiming: "POST_COMMISSIONING_YEAR_1",
    year1SubsidyCreditInr: potentialSubsidyInr,
    conditionalSubsidyCreditInr: potentialSubsidyInr,
    netCashCapitalOutflowInr: conditionalNetInr,
    netFinancedTotalOutflowInr:
      financing.customerDownPaymentInr + financing.totalRepaymentInr - potentialSubsidyInr,
    reconcilesWithSummary:
      projection[24].netCumulativeCashflow === netGain25YearsInr &&
      financedProjection[24].netCumulativeCashflow === financedNetGain25YearsInr,
    ongoingCostsNote:
      "Preventive cleaning and inverter replacement reserves beyond the 10-year inverter warranty are excluded from baseline cash-flow projections and reviewed during engineering consultation.",
  };

  const verificationBreakdown: VerificationBreakdown = {
    tariffSchedule: status,
    solarGeneration: isUnknownDiscom ? "UNAVAILABLE" : yieldProfile.status,
    subsidyEligibility: isUnknownDiscom
      ? "REQUIRES_VERIFICATION"
      : subsidyAssessment.eligibilityStatus,
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
  if (financing.exceedsConcessionalCap && params.paymentMode === "loan") {
    warnings.push(
      `Loan principal ₹${financing.loanPrincipalInr.toLocaleString("en-IN")} exceeds the ₹6,00,000 PM Surya Ghar concessional loan ceiling; modeled at an indicative ${(financing.annualInterestRate * 100).toFixed(2)}% p.a. non-scheme rate.`,
    );
  }

  const disclosures: string[] = [
    status === "VERIFIED"
      ? `Electricity tariff modeled using verified ${discom.authority} slab schedule for ${discom.name} (${discom.state}).`
      : status === "INDICATIVE"
        ? `Electricity tariff for ${discom.name} (${discom.state}) uses an indicative regional benchmark (₹${tariff.toFixed(2)}/kWh); exact bill savings depend on your sanctioned load and SERC slab tier.`
        : `Electricity tariff and net-metering rules for ${discom.code} are unverified; financial savings are withheld pending consultation.`,
    `Unavoidable monthly fixed/customer charges (~₹${billBreakdown.unavoidableChargesInr}/month) remain payable to ${discom.code} even when solar generation offsets 100% of energy consumption.`,
    `Potential PM Surya Ghar CFA subsidy (up to ₹${potentialSubsidyInr.toLocaleString("en-IN")}) is conditional on active residential grid connection, DCR-compliant modules, and National Portal approval, and is credited post-commissioning in Year 1 via DBT.`,
  ];

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
