/**
 * ============================================================================
 * PRODUCT SPECIFICATIONS & TECHNICAL DATASHEETS
 * ============================================================================
 *
 * Edit this file with verified values from your OEM manufacturer datasheets
 * (solar module, inverter, and battery storage).
 */

export interface SolarModuleSpecs {
  modelName: string;
  cellType: string;
  cellTypeShort?: string;
  ratedPowerW: number;
  efficiencyPct: number;
  dimensionsMm: string;
  weightKg: number;
  frontGlass: string;
  frame: string;
  bifacialityPct?: number;
  tempCoefficientPmaxPctPerC: number;
  operatingTempRangeC: string;
  maxStaticLoadPa: string;
  fireRating: string;
  certifications: string[];
  productWarrantyYears: number;
  performanceWarrantyYears: number;
  degradationYear1Pct: number;
  annualDegradationPct: number;
}

export interface InverterSpecs {
  type: string;
  efficiencyPct: number;
  maxEfficiencyPct: number;
  mpptTrackers: number;
  protectionRating: string;
  cooling: string;
  warrantyYears: number;
}

export interface BatterySpecs {
  modelName: string;
  nominalEnergyKwh: number;
  usableCapacityKwh: number;
  continuousPowerKw: number;
  peakPowerKw: number;
  roundTripEfficiencyPct: number;
  chemistry: string;
  islandingTransferSpeedMs: string;
  operatingTempRangeC: string;
  protectionRating: string;
  mounting: string;
  warrantyYears: number;
  warrantyCycles?: number;
}

export interface ProductsConfig {
  specsVerified: boolean;
  indicativeDisclaimer: string;
  module: SolarModuleSpecs;
  inverter: InverterSpecs;
  battery: BatterySpecs;
}

export const PRODUCTS_CONFIG: ProductsConfig = {
  // Set to true once verified datasheets from the manufacturer are provided.
  specsVerified: false,
  indicativeDisclaimer: "Indicative specifications. Final datasheet is shared with your proposal.",

  module: {
    modelName: "Tier-1 ALMM DCR Bifacial N-Type TOPCon 580W",
    cellType: "N-Type TOPCon 16BB Half-Cut Bifacial Dual Glass",
    cellTypeShort: "N-type TOPCon",
    ratedPowerW: 580,
    efficiencyPct: 22.45,
    dimensionsMm: "2278 × 1134 × 30 mm",
    weightKg: 28.5,
    frontGlass: "Dual Tempered Glass, 2.0mm + 2.0mm",
    frame: "Anodized Aluminum Alloy (Black 6005-T5)",
    bifacialityPct: 80,
    tempCoefficientPmaxPctPerC: -0.3,
    operatingTempRangeC: "-40°C to +85°C",
    maxStaticLoadPa: "5400 Pa front (static load) / 2400 Pa rear (wind uplift)",
    fireRating: "Class A (IEC 61730)",
    certifications: ["BIS Certified (IS 14286)", "IEC 61215", "IEC 61730", "ALMM Compliant"],
    productWarrantyYears: 12,
    performanceWarrantyYears: 25,
    degradationYear1Pct: 1.0,
    annualDegradationPct: 0.4,
  },

  inverter: {
    type: "Three-Phase Hybrid String Inverter with Dual MPPT",
    efficiencyPct: 98.4,
    maxEfficiencyPct: 98.8,
    mpptTrackers: 2,
    protectionRating: "IP66",
    cooling: "Natural Convection / Smart Fan",
    warrantyYears: 10,
  },

  battery: {
    modelName: "Modular High-Voltage LiFePO4 Battery (Reference Architecture)",
    nominalEnergyKwh: 15.0,
    usableCapacityKwh: 14.3,
    continuousPowerKw: 6.0,
    peakPowerKw: 10.0,
    roundTripEfficiencyPct: 91.5,
    chemistry: "Lithium Iron Phosphate (LiFePO4)",
    islandingTransferSpeedMs: "< 20 ms (UPS Grade)",
    operatingTempRangeC: "-10°C to +50°C",
    protectionRating: "IP65 (Outdoor/Indoor)",
    mounting: "Floor-Standing Plinth",
    warrantyYears: 10,
    warrantyCycles: 6000,
  },
};
