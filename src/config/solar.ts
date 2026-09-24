/**
 * ============================================================================
 * UNIFIED SOLAR CALCULATION ENGINE & FINANCIAL ASSUMPTIONS
 * ============================================================================
 *
 * Single source of truth for solar geometry, generation yields, DISCOM tariffs,
 * PM Surya Ghar subsidies, and multi-year financial modeling.
 */

export interface DiscomInfo {
  code: string;
  name: string;
  state: string;
  residentialTariffInr: number;
  commercialTariffInr: number;
  exportRateInr: number; // VERIFY(owner): net-metering feed-in export tariff
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

export const DISCOMS: DiscomInfo[] = [
  {
    code: "TGSPDCL",
    name: "Telangana Southern Power Distribution Company",
    state: "Telangana",
    residentialTariffInr: 9.2,
    commercialTariffInr: 10.5,
    exportRateInr: 3.0, // VERIFY(owner): net-metering feed-in export tariff
  },
  {
    code: "TGNPDCL",
    name: "Telangana Northern Power Distribution Company",
    state: "Telangana",
    residentialTariffInr: 8.8,
    commercialTariffInr: 10.0,
    exportRateInr: 3.0, // VERIFY(owner): net-metering feed-in export tariff
  },
  {
    code: "APEPDCL",
    name: "Andhra Pradesh Eastern Power Distribution",
    state: "Andhra Pradesh",
    residentialTariffInr: 8.5,
    commercialTariffInr: 9.8,
    exportRateInr: 3.0, // VERIFY(owner): net-metering feed-in export tariff
  },
  {
    code: "BESCOM",
    name: "Bangalore Electricity Supply Company",
    state: "Karnataka",
    residentialTariffInr: 8.9,
    commercialTariffInr: 11.2,
    exportRateInr: 3.0, // VERIFY(owner): net-metering feed-in export tariff
  },
  {
    code: "MSEDCL",
    name: "Maharashtra State Electricity Distribution",
    state: "Maharashtra",
    residentialTariffInr: 10.2,
    commercialTariffInr: 12.0,
    exportRateInr: 3.0, // VERIFY(owner): net-metering feed-in export tariff
  },
  {
    code: "TANGEDCO",
    name: "Tamil Nadu Generation and Distribution Corporation",
    state: "Tamil Nadu",
    residentialTariffInr: 8.2,
    commercialTariffInr: 10.5,
    exportRateInr: 3.0, // VERIFY(owner): net-metering feed-in export tariff
  },
  {
    code: "BSES Rajdhani",
    name: "BSES Rajdhani Power Limited",
    state: "Delhi",
    residentialTariffInr: 8.5,
    commercialTariffInr: 11.5,
    exportRateInr: 3.0, // VERIFY(owner): net-metering feed-in export tariff
  },
];

export const SOLAR_ASSUMPTIONS = {
  panelWatt: 550, // VERIFY(owner): from module datasheet (550W TOPCon)
  yieldKwhPerKwYear: 1450, // VERIFY(owner): specific generation yield kWh/kWp/yr across Central/Southern India
  selfConsumptionNoBattery: 0.7, // VERIFY(owner): 70% self-consumption without battery
  selfConsumptionWithBattery: 0.9, // VERIFY(owner): 90% self-consumption with battery
  degradationPerYear: 0.005, // VERIFY(owner): 0.5% annual degradation
  tariffEscalationPerYear: 0.03, // VERIFY(owner): 3.0% annual tariff inflation
  pricePerKwInr: 62000, // VERIFY(owner): turnkey residential capex per kW
  commercialPricePerKwInr: 42000, // VERIFY(owner): turnkey commercial capex per kW
  battery: {
    unitCapacityKwh: 13.5, // VERIFY(owner): from battery datasheet
    unitPriceInr: 280000, // VERIFY(owner): per battery unit turnkey price
  },
  loan: {
    annualRate: 0.095, // 9.5% per annum
    tenureMonths: 60, // 5 years
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
 * Calculates national PM Surya Ghar subsidy eligibility in INR.
 * Official scheme rules:
 * - Commercial / Industrial: ₹0
 * - 1 kW: ₹30,000
 * - 2 kW: ₹60,000
 * - 3 kW and above: ₹78,000 (capped at ₹78,000 for residential)
 */
export function calculateGovtSubsidyInr(
  kw: number,
  segment: "residential" | "commercial" = "residential",
): number {
  if (segment === "commercial") return 0;
  if (!Number.isFinite(kw) || kw <= 0) return 0;
  if (kw <= 1) return Math.round(kw * 30000);
  if (kw <= 2) return Math.round(30000 + (kw - 1) * 30000);
  if (kw <= 3) return Math.round(60000 + (kw - 2) * 18000);
  return 78000;
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
}

/**
 * Pure calculation engine for solar sizing, energy generation, and financial returns.
 */
export function estimate(params: EstimateParams = {}): EstimateResult {
  // Input guarding: NaN, negative, or undefined safely default to 0
  const rawBill = params.monthlyBillInr;
  const bill = typeof rawBill === "number" && Number.isFinite(rawBill) && rawBill > 0 ? rawBill : 0;
  const segment = params.segment === "commercial" ? "commercial" : "residential";

  // Find DISCOM or fallback to TGSPDCL
  const discom = DISCOMS.find((d) => d.code === params.discomCode) ?? DISCOMS[0]; // TGSPDCL

  const tariff =
    segment === "commercial" ? discom.commercialTariffInr : discom.residentialTariffInr;
  const annualBillInr = Math.round(bill * 12);
  const monthlyUnits = tariff > 0 ? Math.round(bill / tariff) : 0;
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

  // Self-consumption ratio based on battery configuration
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

  // Value generated: self-consumed avoids retail tariff, exported sells at feed-in rate
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

  // Loan EMI calculation (monthly compounded amortized loan)
  const P = netInr;
  const r = SOLAR_ASSUMPTIONS.loan.annualRate / 12;
  const n = SOLAR_ASSUMPTIONS.loan.tenureMonths;
  const monthlyEmiInr =
    P > 0 && r > 0 ? Math.round((P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)) : 0;

  const emiBelowBill = bill > 0 && monthlyEmiInr > 0 && monthlyEmiInr < bill;

  // Simple payback period
  const paybackYears = annualSavingsInr > 0 ? Number((netInr / annualSavingsInr).toFixed(1)) : 0;

  // 25-Year Compound Simulation with 0.5% module degradation and 3.0% tariff escalation
  let savings25YearsInr = 0;
  for (let y = 1; y <= 25; y++) {
    const degFactor = Math.pow(1 - SOLAR_ASSUMPTIONS.degradationPerYear, y - 1);
    const escFactor = Math.pow(1 + SOLAR_ASSUMPTIONS.tariffEscalationPerYear, y - 1);

    const yearGenKwh = annualGenKwh * degFactor;
    const yearTariff = tariff * escFactor;
    const yearExportRate = discom.exportRateInr * escFactor;
    const yearBillInr = annualBillInr * escFactor;

    const yearGenValue =
      yearGenKwh * selfConsumptionRatio * yearTariff +
      yearGenKwh * (1 - selfConsumptionRatio) * yearExportRate;
    const yearSavings = Math.min(yearBillInr, Math.round(yearGenValue));
    savings25YearsInr += yearSavings;
  }

  const netGain25YearsInr = Math.round(savings25YearsInr - netInr);

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
    assumptions: {
      discom,
      tariffInrPerKwh: tariff,
      exportRateInr: discom.exportRateInr,
      panelWatt: SOLAR_ASSUMPTIONS.panelWatt,
      yieldKwhPerKwYear: SOLAR_ASSUMPTIONS.yieldKwhPerKwYear,
      selfConsumptionRatio,
      loanTenureMonths: SOLAR_ASSUMPTIONS.loan.tenureMonths,
      loanAnnualRate: SOLAR_ASSUMPTIONS.loan.annualRate,
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
