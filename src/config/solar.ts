/**
 * ============================================================================
 * UNIFIED SOLAR CALCULATION ENGINE & FINANCIAL ASSUMPTIONS
 * ============================================================================
 *
 * Single source of truth for solar geometry, generation yields, DISCOM tariffs,
 * PM Surya Ghar subsidies, and multi-year financial modeling.
 * Sourced from official TGERC tariff orders, MNRE guidelines, and IS codes.
 */
import { PRODUCTS_CONFIG } from "@/config/products";
import {
  calculateGovtSubsidyInr as calculateGovtSubsidyInrRegulatory,
  unitsForBill,
  HYDERABAD_ANNUAL_YIELD_KWH_PER_KW,
  MODULE_WARRANTY_TERMS,
  SOLAR_LOAN_TERMS,
  TGERC_TARIFF_SOURCE,
  PM_SURYA_GHAR_SOURCE,
  type DataSource,
} from "@/config/regulatory";

export interface DiscomInfo {
  code: string;
  name: string;
  state: string;
  residentialTariffInr: number;
  commercialTariffInr: number;
  exportRateInr: number; // Net-metering surplus settlement rate (TGERC APPC)
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
 * Single fully-sourced market: Telangana (TGSPDCL and TGNPDCL)
 * Verified against TGERC Retail Supply Tariff Order FY 2025-26.
 */
export const DISCOMS: DiscomInfo[] = [
  {
    code: "TGSPDCL",
    name: "Telangana Southern Power Distribution Company",
    state: "Telangana",
    residentialTariffInr: 9.2,
    commercialTariffInr: 10.5,
    exportRateInr: 3.55,
  },
  {
    code: "TGNPDCL",
    name: "Telangana Northern Power Distribution Company",
    state: "Telangana",
    residentialTariffInr: 8.8,
    commercialTariffInr: 10.2,
    exportRateInr: 3.55,
  },
];

export const SOLAR_ASSUMPTIONS = {
  panelWatt: PRODUCTS_CONFIG.module.ratedPowerW, // 550W TOPCon
  yieldKwhPerKwYear: HYDERABAD_ANNUAL_YIELD_KWH_PER_KW, // 1490 kWh/kWp/yr (NASA POWER / NREL PVWatts v8)
  selfConsumptionNoBattery: 0.7, // 70% daytime self-consumption
  selfConsumptionWithBattery: 0.9, // 90% self-consumption with battery
  degradationPerYear: MODULE_WARRANTY_TERMS.annualDegradationPct / 100, // 0.004 (0.40%/year)
  tariffEscalationPerYear: 0.03, // 3.0% annual tariff escalation
  pricePerKwInr: 62000, // Turnkey residential capex per kW
  commercialPricePerKwInr: 42000, // Turnkey commercial capex per kW
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
 * Modular residential sizing tiers built from panelWatt
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
    ), // 3.3 kW
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
    panels: Math.ceil((5 * 1000) / SOLAR_ASSUMPTIONS.panelWatt), // 10 panels
    systemKw: Number(
      (
        (Math.ceil((5 * 1000) / SOLAR_ASSUMPTIONS.panelWatt) * SOLAR_ASSUMPTIONS.panelWatt) /
        1000
      ).toFixed(2),
    ), // 5.5 kW
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
    panels: Math.ceil((8 * 1000) / SOLAR_ASSUMPTIONS.panelWatt), // 15 panels
    systemKw: Number(
      (
        (Math.ceil((8 * 1000) / SOLAR_ASSUMPTIONS.panelWatt) * SOLAR_ASSUMPTIONS.panelWatt) /
        1000
      ).toFixed(2),
    ), // 8.25 kW
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
    panels: Math.ceil((12 * 1000) / SOLAR_ASSUMPTIONS.panelWatt), // 22 panels
    systemKw: Number(
      (
        (Math.ceil((12 * 1000) / SOLAR_ASSUMPTIONS.panelWatt) * SOLAR_ASSUMPTIONS.panelWatt) /
        1000
      ).toFixed(2),
    ), // 12.1 kW
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

export interface YearProjectionPoint {
  year: number;
  tariffPerKwh: number;
  genKwh: number;
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
}

/**
 * Single, unified 25-Year Compound Simulation used by both estimate() and WealthCurveVisualizer.
 * Models 0.40% module degradation and 3.0% annual tariff escalation.
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
  } = params;

  const points: YearProjectionPoint[] = [];
  let cumSpendWithoutSolar = 0;
  let cumSavings = 0;

  for (let y = 1; y <= 25; y++) {
    const degFactor = Math.pow(1 - degradationPerYear, y - 1);
    const escFactor = Math.pow(1 + tariffEscalationPerYear, y - 1);

    const yearBill = Math.round(annualBillInr * escFactor);
    const yearTariff = Number((tariffPerKwh * escFactor).toFixed(2));
    const yearGen = Math.round(annualGenKwh * degFactor);

    // Annual savings in Year y, capped at that year's electricity bill
    const yearSavings = Math.min(yearBill, Math.round(annualSavingsInr * degFactor * escFactor));

    cumSpendWithoutSolar += yearBill;
    cumSavings += yearSavings;
    const netCumulativeCashflow = Math.round(cumSavings - netInvestmentInr);

    points.push({
      year: y,
      tariffPerKwh: yearTariff,
      genKwh: yearGen,
      cumSpendWithoutSolar,
      cumSavings,
      netCumulativeCashflow,
    });
  }

  return points;
}

export interface EstimateParams {
  monthlyBillInr?: number;
  discomCode?: string;
  segment?: "residential" | "commercial";
  panels?: number;
  batteryUnits?: number;
  paymentMode?: "cash" | "loan";
}

export interface EstimateResult {
  monthlyUnits: number;
  recommendedKw: number;
  recommendedPanels: number;
  systemKw: number;
  panels: number;
  annualGenKwh: number;
  annualBillInr: number;
  annualSavingsInr: number;
  billCoveragePct: number;
  subsidyInr: number;
  grossInr: number;
  netInr: number;
  monthlyEmiInr: number;
  emiBelowBill: boolean;
  paybackYears: number;
  savings25YearsInr: number;
  netGain25YearsInr: number;
  projection: YearProjectionPoint[];
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
  };
}

/**
 * Pure calculation engine for solar sizing, energy generation, and financial returns.
 */
export function estimate(params: EstimateParams = {}): EstimateResult {
  const rawBill = params.monthlyBillInr;
  const bill = typeof rawBill === "number" && Number.isFinite(rawBill) && rawBill > 0 ? rawBill : 0;
  const segment = params.segment === "commercial" ? "commercial" : "residential";

  // Find DISCOM or fallback to TGSPDCL
  const discom = DISCOMS.find((d) => d.code === params.discomCode) ?? DISCOMS[0]; // TGSPDCL

  const tariff =
    segment === "commercial" ? discom.commercialTariffInr : discom.residentialTariffInr;
  const annualBillInr = Math.round(bill * 12);

  // Use real telescopic tariff slabs for accurate residential consumption units
  const monthlyUnits =
    segment === "residential" && bill > 0
      ? unitsForBill(discom.code, bill, 5)
      : tariff > 0
        ? Math.round(bill / tariff)
        : 0;
  const annualUnits = monthlyUnits * 12;

  // System recommendation based on consumption
  let neededKw =
    annualUnits > 0
      ? annualUnits / SOLAR_ASSUMPTIONS.yieldKwhPerKwYear
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
  const annualGenKwh = Math.round(systemKw * SOLAR_ASSUMPTIONS.yieldKwhPerKwYear);

  // Battery configuration: for residential net-metered homes in Telangana,
  // net metering offsets imported units 1:1, so home battery serves as resilience/backup.
  const rawBatteryUnits = params.batteryUnits;
  const batteryUnits =
    typeof rawBatteryUnits === "number" && Number.isFinite(rawBatteryUnits) && rawBatteryUnits > 0
      ? Math.round(rawBatteryUnits)
      : 0;

  const selfConsumptionRatio =
    batteryUnits > 0
      ? SOLAR_ASSUMPTIONS.selfConsumptionWithBattery
      : SOLAR_ASSUMPTIONS.selfConsumptionNoBattery;

  const selfConsumedKwh = annualGenKwh * selfConsumptionRatio;
  const exportedKwh = annualGenKwh * (1 - selfConsumptionRatio);

  // Value generated: self-consumed avoids retail tariff, exported offsets at tariff / APPC rate
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
  const subsidyInr = calculateGovtSubsidyInr(systemKw, segment);
  const netInr = Math.max(0, grossInr - subsidyInr);

  // SBI PM Surya Ghar loan structure: up to 90% financing of gross cost
  const loanPrincipal = Math.round(grossInr * SOLAR_LOAN_TERMS.maxFinancingPct);
  const loanRate =
    loanPrincipal <= SOLAR_LOAN_TERMS.tier1.maxAmountInr
      ? SOLAR_LOAN_TERMS.tier1.annualInterestRate
      : SOLAR_LOAN_TERMS.tier2.annualInterestRate;

  const P = loanPrincipal;
  const r = loanRate / 12;
  const n = SOLAR_ASSUMPTIONS.loan.tenureMonths;
  const monthlyEmiInr =
    P > 0 && r > 0 ? Math.round((P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)) : 0;

  const emiBelowBill = bill > 0 && monthlyEmiInr > 0 && monthlyEmiInr < bill;

  // Simple payback period
  const paybackYears = annualSavingsInr > 0 ? Number((netInr / annualSavingsInr).toFixed(1)) : 0;

  // Unified 25-Year Compound Projection
  const projection = project25Years({
    annualBillInr,
    annualSavingsInr,
    annualGenKwh,
    netInvestmentInr: netInr,
    tariffPerKwh: tariff,
  });

  const savings25YearsInr = projection[24].cumSavings;
  const netGain25YearsInr = projection[24].netCumulativeCashflow;

  return {
    monthlyUnits,
    recommendedKw,
    recommendedPanels,
    systemKw,
    panels,
    annualGenKwh,
    annualBillInr,
    annualSavingsInr,
    billCoveragePct,
    subsidyInr,
    grossInr,
    netInr,
    monthlyEmiInr,
    emiBelowBill,
    paybackYears,
    savings25YearsInr,
    netGain25YearsInr,
    projection,
    assumptions: {
      discom,
      tariffInrPerKwh: tariff,
      exportRateInr: discom.exportRateInr,
      panelWatt: SOLAR_ASSUMPTIONS.panelWatt,
      yieldKwhPerKwYear: SOLAR_ASSUMPTIONS.yieldKwhPerKwYear,
      selfConsumptionRatio,
      loanTenureMonths: SOLAR_ASSUMPTIONS.loan.tenureMonths,
      loanAnnualRate: loanRate,
    },
    sources: {
      tariff: TGERC_TARIFF_SOURCE,
      subsidy: PM_SURYA_GHAR_SOURCE,
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
