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
    modelName: "WAVENOX Monocrystalline TOPCon Series", // VERIFY(owner): from datasheet
    cellType: "N-Type TOPCon Half-Cut Bifacial", // VERIFY(owner): from datasheet
    cellTypeShort: "N-type TOPCon", // VERIFY(owner): from datasheet
    ratedPowerW: 550, // VERIFY(owner): from datasheet
    efficiencyPct: 22.8, // VERIFY(owner): from datasheet (STC module efficiency)
    dimensionsMm: "2278 × 1134 × 30 mm", // VERIFY(owner): from datasheet
    weightKg: 28.5, // VERIFY(owner): from datasheet
    frontGlass: "Dual Tempered Glass, 2.0mm + 2.0mm", // VERIFY(owner): from datasheet
    frame: "Anodized Aluminum Alloy (Black)", // VERIFY(owner): from datasheet
    bifacialityPct: 80, // VERIFY(owner): from datasheet
    tempCoefficientPmaxPctPerC: -0.3, // VERIFY(owner): from datasheet
    operatingTempRangeC: "-40°C to +85°C", // VERIFY(owner): from datasheet
    maxStaticLoadPa: "5400 Pa front / 2400 Pa rear", // VERIFY(owner): from datasheet
    fireRating: "Class A (IEC 61730)", // VERIFY(owner): from datasheet
    certifications: ["BIS Certified", "IEC 61215", "IEC 61730", "ALMM Listed"], // VERIFY(owner): from datasheet
    productWarrantyYears: 12, // VERIFY(owner): from datasheet
    performanceWarrantyYears: 25, // VERIFY(owner): from datasheet (linear output)
    degradationYear1Pct: 1.0, // VERIFY(owner): from datasheet
    annualDegradationPct: 0.4, // VERIFY(owner): from datasheet
  },

  inverter: {
    type: "Three-Phase Hybrid String Inverter with Integrated Rapid Shutdown", // VERIFY(owner): from datasheet
    efficiencyPct: 98.4, // VERIFY(owner): from datasheet
    maxEfficiencyPct: 98.8, // VERIFY(owner): from datasheet
    mpptTrackers: 2, // VERIFY(owner): from datasheet
    protectionRating: "IP66", // VERIFY(owner): from datasheet
    cooling: "Natural Convection / Smart Fan", // VERIFY(owner): from datasheet
    warrantyYears: 10, // VERIFY(owner): from datasheet
  },

  battery: {
    modelName: "Omnigrid Modular Storage Architecture",
    nominalEnergyKwh: 15.0,
    usableCapacityKwh: 14.3, // High-voltage LiFePO4 modular architecture (expandable in 5 kWh & 14.3 kWh blocks)
    continuousPowerKw: 6.0,
    peakPowerKw: 10.0,
    roundTripEfficiencyPct: 91.5,
    chemistry: "Lithium Iron Phosphate (LiFePO4)",
    islandingTransferSpeedMs: "< 20 ms",
    operatingTempRangeC: "-10°C to +50°C",
    protectionRating: "IP65 (Outdoor/Indoor)",
    mounting: "Floor or Wall Mount",
    warrantyYears: 10,
    warrantyCycles: 6000,
  },
};
