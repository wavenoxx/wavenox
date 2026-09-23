/**
 * ============================================================================
 * SOLAR PHYSICS & FINANCIAL CONSTANTS — edit this file for localized tariffs.
 * ============================================================================
 *
 * This file centralizes the mathematical, structural, and financial assumptions
 * used across the ROI calculator, system tier recommendations, and quote
 * proposals.
 */

export interface DiscomTariff {
  code: string;
  name: string;
  state: string;
  avgCommercialRateInr: number;
  avgResidentialRateInr: number;
}

export interface SolarConfig {
  /** Power density of Wavenox Liquid Glass tiles in Watts per sq.ft. */
  wattsPerSqftWavenox: number;
  /** Power density of standard conventional bolt-on solar panels in Watts per sq.ft. */
  wattsPerSqftConventional: number;
  /** Average effective generation peak sun hours per year across Southern/Central India. */
  effectiveSunHoursPerYear: number;
  /** Default avoided grid electricity tariff in INR per kWh. */
  defaultTariffInrPerKwh: number;
  /** Standard performance & structural warranty duration in years. */
  warrantyYears: number;
  /** Efficiency rating of Liquid Glass tiles. */
  cellEfficiencyPct: number;
  /** Maximum cyclone wind resistance in kmph. */
  windResistanceKmph: number;
  /** DISCOM utility schedules. */
  discoms: DiscomTariff[];
}

export const SOLAR_CONFIG: SolarConfig = {
  wattsPerSqftWavenox: 13,
  wattsPerSqftConventional: 10,
  effectiveSunHoursPerYear: 1600,
  defaultTariffInrPerKwh: 9.5,
  warrantyYears: 25,
  cellEfficiencyPct: 24.5,
  windResistanceKmph: 250,

  discoms: [
    {
      code: "TSSPDCL",
      name: "Telangana Southern Power Distribution Company",
      state: "Telangana",
      avgCommercialRateInr: 10.5,
      avgResidentialRateInr: 9.2,
    },
    {
      code: "TSNPDCL",
      name: "Telangana Northern Power Distribution Company",
      state: "Telangana",
      avgCommercialRateInr: 10.0,
      avgResidentialRateInr: 8.8,
    },
    {
      code: "BESCOM",
      name: "Bangalore Electricity Supply Company",
      state: "Karnataka",
      avgCommercialRateInr: 11.2,
      avgResidentialRateInr: 8.9,
    },
    {
      code: "APEPDCL",
      name: "Andhra Pradesh Eastern Power Distribution",
      state: "Andhra Pradesh",
      avgCommercialRateInr: 9.8,
      avgResidentialRateInr: 8.5,
    },
    {
      code: "MSEDCL",
      name: "Maharashtra State Electricity Distribution",
      state: "Maharashtra",
      avgCommercialRateInr: 12.0,
      avgResidentialRateInr: 10.2,
    },
  ],
};

/**
 * Computes energy yield and lifetime financial output for a given roof footprint.
 */
export interface SolarYieldParams {
  roofAreaSqFt?: number;
  sqft?: number;
  tariffRatePerKwh?: number;
  tariff?: number;
  wattsPerSqft?: number;
  years?: number;
}

export interface SolarYieldResult {
  kw: number;
  capacityKw: number;
  annualKwh: number;
  annualUnitsGenerated: number;
  lifetimeInr: number;
  twentyFiveYearNetSavingsInr: number;
  estimatedSubsidyInr: number;
}

/**
 * Computes energy yield and lifetime financial output for a given roof footprint.
 * Supports both object params and positional params for 100% runtime safety.
 */
export function computeSolarYield(
  arg1: number | SolarYieldParams,
  arg2 = SOLAR_CONFIG.wattsPerSqftWavenox,
  arg3 = SOLAR_CONFIG.defaultTariffInrPerKwh,
  arg4 = SOLAR_CONFIG.warrantyYears,
): SolarYieldResult {
  let sqft = 2500;
  let wattsPerSqft = arg2;
  let tariff = arg3;
  let years = arg4;

  if (typeof arg1 === "object" && arg1 !== null) {
    sqft = Number(arg1.roofAreaSqFt ?? arg1.sqft ?? 2500);
    wattsPerSqft = Number(arg1.wattsPerSqft ?? SOLAR_CONFIG.wattsPerSqftWavenox);
    tariff = Number(arg1.tariffRatePerKwh ?? arg1.tariff ?? SOLAR_CONFIG.defaultTariffInrPerKwh);
    years = Number(arg1.years ?? SOLAR_CONFIG.warrantyYears);
  } else if (typeof arg1 === "number") {
    sqft = arg1;
  }

  const kw = Number(((sqft * wattsPerSqft) / 1000).toFixed(2));
  const annualKwh = Math.round(kw * SOLAR_CONFIG.effectiveSunHoursPerYear);
  const lifetimeInr = Math.round(annualKwh * tariff * years);
  const estimatedSubsidyInr = calculateGovtSubsidyInr(kw);

  return {
    kw,
    capacityKw: kw,
    annualKwh,
    annualUnitsGenerated: annualKwh,
    lifetimeInr,
    twentyFiveYearNetSavingsInr: lifetimeInr,
    estimatedSubsidyInr,
  };
}

/**
 * Calculates national PM Surya Ghar subsidy eligibility in INR based on kW capacity.
 * - Up to 2 kW: ₹30,000 per kW (Max ₹60,000)
 * - 3 kW: ₹78,000
 * - Above 3 kW: Capped at ₹78,000 for residential
 */
export function calculateGovtSubsidyInr(kw: number): number {
  if (kw <= 0) return 0;
  if (kw < 2) return Math.round(kw * 30000);
  if (kw < 3) return 60000 + Math.round((kw - 2) * 18000);
  return 78000;
}

/** Backward compatibility alias */
export const SOLAR_SPECS = SOLAR_CONFIG;
