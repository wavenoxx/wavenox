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
    modelName: "Omnigrid Residential Storage Unit", // VERIFY(owner): from datasheet
    nominalEnergyKwh: 14.0, // VERIFY(owner): from datasheet
    usableCapacityKwh: 13.5, // VERIFY(owner): replace placeholder with verified OEM battery capacity (13.5 kWh is legacy Powerwall placeholder)
    continuousPowerKw: 5.0, // VERIFY(owner): from datasheet
    peakPowerKw: 7.0, // VERIFY(owner): from datasheet
    roundTripEfficiencyPct: 90.0, // VERIFY(owner): from datasheet
    chemistry: "Lithium Iron Phosphate (LiFePO4)", // VERIFY(owner): from datasheet
    islandingTransferSpeedMs: "< 20 ms", // VERIFY(owner): from datasheet (typical UPS grade transfer)
    operatingTempRangeC: "-10°C to +50°C", // VERIFY(owner): from datasheet
    protectionRating: "IP65 (Outdoor/Indoor)", // VERIFY(owner): from datasheet
    mounting: "Floor or Wall Mount", // VERIFY(owner): from datasheet
    warrantyYears: 10, // VERIFY(owner): from datasheet
  },
};
