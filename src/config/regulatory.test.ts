import { describe, it, expect } from "vitest";
import {
  calculateGovtSubsidyInr,
  energyCharge,
  calculateMonthlyElectricityBill,
  unitsForBill,
  decodeBill,
  calculateModuleDegradation,
  MODULE_WARRANTY_TERMS,
  SOLAR_LOAN_TERMS,
  WIND_SPEED_STANDARDS,
  VERIFIED_DISCOMS,
  HYDERABAD_ANNUAL_YIELD_KWH_PER_KW,
  CITY_SOLAR_METEOROLOGY,
} from "./regulatory";
import { project25Years } from "./solar";
import { PHYSICS_SIMULATION_TIMELINE, verifyPowerBalance } from "./simulation";

describe("Regulatory Engine — PM Surya Ghar CFA Subsidies (FIX_PLAN 2.1)", () => {
  it("calculates exact general category residential subsidies", () => {
    // General category: ₹30,000/kW for first 2 kW, ₹18,000 for 3rd kW, cap ₹78,000
    expect(calculateGovtSubsidyInr(1)).toBe(30000);
    expect(calculateGovtSubsidyInr(2)).toBe(60000);
    expect(calculateGovtSubsidyInr(3)).toBe(78000);
    expect(calculateGovtSubsidyInr(5)).toBe(78000);
    expect(calculateGovtSubsidyInr(10)).toBe(78000);
    expect(calculateGovtSubsidyInr(25)).toBe(78000);
  });

  it("calculates special category state subsidies", () => {
    // Special category: ₹33,000/kW for first 2 kW, ₹19,800 for 3rd kW, cap ₹85,800
    expect(calculateGovtSubsidyInr(1, { specialCategory: true })).toBe(33000);
    expect(calculateGovtSubsidyInr(2, { specialCategory: true })).toBe(66000);
    expect(calculateGovtSubsidyInr(3, { specialCategory: true })).toBe(85800);
    expect(calculateGovtSubsidyInr(10, { specialCategory: true })).toBe(85800);
  });

  it("returns zero subsidy for commercial and industrial consumers", () => {
    expect(calculateGovtSubsidyInr(1, { segment: "commercial" })).toBe(0);
    expect(calculateGovtSubsidyInr(3, { segment: "commercial" })).toBe(0);
    expect(calculateGovtSubsidyInr(100, { segment: "commercial" })).toBe(0);
  });

  it("calculates group housing and RWA common facility subsidies", () => {
    // RWA: ₹18,000 per kW up to 500 kW
    expect(calculateGovtSubsidyInr(10, { segment: "rwa" })).toBe(180000);
    expect(calculateGovtSubsidyInr(100, { segment: "rwa" })).toBe(1800000);
    expect(calculateGovtSubsidyInr(600, { segment: "rwa" })).toBe(500 * 18000);
  });

  it("handles 0, negative, and NaN inputs safely", () => {
    expect(calculateGovtSubsidyInr(0)).toBe(0);
    expect(calculateGovtSubsidyInr(-5)).toBe(0);
    expect(calculateGovtSubsidyInr(NaN)).toBe(0);
  });
});

describe("Regulatory Engine — TGERC FY 2025-26 Telescopic Tariff Slabs (FIX_PLAN 2.2)", () => {
  it("matches exact TGERC order test cases: 300 units = 1790, 900 units = 7490", () => {
    // LT-I(C) > 200 units/mo:
    // 300 units: 0-200 @ 5.10 (1020) + 201-300 @ 7.70 (770) = 1790
    expect(energyCharge("TGSPDCL", 300)).toBe(1790);

    // 900 units:
    // 0-200 @ 5.10 (1020) + 201-300 @ 7.70 (770) + 301-400 @ 9.00 (900)
    // + 401-800 @ 9.50 (3800) + 801-900 @ 10.00 (1000) = 7490
    expect(energyCharge("TGSPDCL", 900)).toBe(7490);
  });

  it("computes full monthly bills including customer charges, fixed charges, and duty", () => {
    const bill300 = calculateMonthlyElectricityBill("TGSPDCL", 300, 5);
    // 1790 (EC) + 60 (CC) + 50 (FC 5kW*10) + 18 (Duty 300*0.06) = 1918
    expect(bill300).toBe(1918);

    const bill100 = calculateMonthlyElectricityBill("TGSPDCL", 100, 3);
    // 50*1.95 (97.5) + 50*3.10 (155) = 252.5 EC + 25 CC + 0 FC + 6 Duty = 283.5 -> 284
    expect(bill100).toBe(284);
  });

  it("round-trips unitsForBill within ±1 unit across typical domestic consumption levels", () => {
    const testUnits = [80, 150, 250, 300, 450, 700, 900, 1200];
    for (const units of testUnits) {
      const computedBill = calculateMonthlyElectricityBill("TGSPDCL", units, 5);
      const recoveredUnits = unitsForBill("TGSPDCL", computedBill, 5);
      expect(Math.abs(recoveredUnits - units)).toBeLessThanOrEqual(1);
    }
  });

  it("decodes a ₹3,000 monthly bill into realistic units and telescopic slabs (FIX_PLAN Phase 6.1)", () => {
    const analysis = decodeBill("TGSPDCL", 3000, 5);
    // Exact TGERC FY 2025-26 math: 416 units = ₹2,997 ≈ ₹3,000
    expect(analysis.estimatedUnits).toBe(416);
    expect(analysis.category).toBe("LT-I(C)");
    expect(analysis.slabs.length).toBeGreaterThanOrEqual(4);
    // Total computed bill should be within 1% of input bill
    expect(Math.abs(analysis.totalComputedBill - 3000)).toBeLessThanOrEqual(15);
    expect(analysis.averageRatePerKwh).toBeGreaterThan(6.0);
    expect(analysis.averageRatePerKwh).toBeLessThan(7.5);
  });

  it("restricts verified DISCOMs to TGSPDCL and TGNPDCL", () => {
    expect(Object.keys(VERIFIED_DISCOMS)).toEqual(["TGSPDCL", "TGNPDCL"]);
    expect(VERIFIED_DISCOMS.TGSPDCL.portalUrl).toBe("https://tgsouthernpower.org");
    expect(VERIFIED_DISCOMS.TGNPDCL.portalUrl).toBe("https://tgnpdcl.com");
  });
});

describe("Regulatory Engine — Single Sourced Solar Yield (FIX_PLAN 2.4)", () => {
  it("uses single meteorological annual yield for Hyderabad tilted arrays", () => {
    expect(HYDERABAD_ANNUAL_YIELD_KWH_PER_KW).toBe(1490);
  });
});

describe("Regulatory Engine — Financing & SBI PM Surya Ghar Terms (FIX_PLAN 2.6)", () => {
  it("implements correct tiered interest rates: 5.75% up to ₹2L, 7.90% above", () => {
    expect(SOLAR_LOAN_TERMS.tier1.annualInterestRate).toBe(0.0575);
    expect(SOLAR_LOAN_TERMS.tier1.maxAmountInr).toBe(200000);
    expect(SOLAR_LOAN_TERMS.tier2.annualInterestRate).toBe(0.079);
    expect(SOLAR_LOAN_TERMS.maxFinancingPct).toBe(0.9);
  });
});

describe("Regulatory Engine — IS 875 (Part 3) Wind Load Standards (FIX_PLAN 2.7)", () => {
  it("maintains code-compliant basic wind speeds for key cities", () => {
    expect(WIND_SPEED_STANDARDS.hyderabad.basicWindSpeedMs).toBe(44);
    expect(WIND_SPEED_STANDARDS.hyderabad.basicWindSpeedKmh).toBe(158.4);
    expect(WIND_SPEED_STANDARDS.visakhapatnam.basicWindSpeedMs).toBe(50);
    expect(WIND_SPEED_STANDARDS.visakhapatnam.basicWindSpeedKmh).toBe(180.0);
  });
});

describe("Regulatory Engine — Unified 25-Year Compound Projection (FIX_PLAN 2.10)", () => {
  it("models negative cumulative cashflow dip before payback year", () => {
    const projection = project25Years({
      annualBillInr: 120000,
      annualSavingsInr: 100000,
      annualGenKwh: 12000,
      netInvestmentInr: 450000,
      tariffPerKwh: 9.2,
    });

    expect(projection).toHaveLength(25);

    // Year 1: net cashflow should be negative (savings < netInvestment)
    expect(projection[0].netCumulativeCashflow).toBeLessThan(0);
    expect(projection[0].netCumulativeCashflow).toBe(projection[0].cumSavings - 450000);

    // Payback should occur around Year 5
    expect(projection[3].netCumulativeCashflow).toBeLessThan(0);
    expect(projection[5].netCumulativeCashflow).toBeGreaterThan(0);

    // 25-year cumulative savings must be strictly increasing
    for (let i = 1; i < projection.length; i++) {
      expect(projection[i].cumSavings).toBeGreaterThan(projection[i - 1].cumSavings);
      expect(projection[i].netCumulativeCashflow).toBeGreaterThan(
        projection[i - 1].netCumulativeCashflow,
      );
    }
  });
});

describe("Regulatory Engine — Physics Conservation of Energy (FIX_PLAN 2.11)", () => {
  it("strictly validates power balance across all timeline points (±0.05 kW)", () => {
    for (const step of PHYSICS_SIMULATION_TIMELINE) {
      const isBalanced = verifyPowerBalance(step, 0.05);
      expect(isBalanced).toBe(true);
    }
  });

  it("keeps battery state-of-charge within operating reserve bounds [10%, 100%]", () => {
    for (const step of PHYSICS_SIMULATION_TIMELINE) {
      expect(step.batterySoc).toBeGreaterThanOrEqual(10);
      expect(step.batterySoc).toBeLessThanOrEqual(100);
    }
  });
});

describe("Regulatory Engine — Linear Warranty & Degradation Maths (FIX_PLAN 2.12)", () => {
  it("calculates exact linear power retention according to datasheet terms", () => {
    expect(MODULE_WARRANTY_TERMS.year1MaxDegradationPct).toBe(1.0);
    expect(MODULE_WARRANTY_TERMS.annualDegradationPct).toBe(0.4);
    expect(MODULE_WARRANTY_TERMS.year25MinOutputPct).toBe(89.4);

    expect(calculateModuleDegradation(0)).toBe(100);
    expect(calculateModuleDegradation(1)).toBe(99.0);
    expect(calculateModuleDegradation(2)).toBe(98.6);
    expect(calculateModuleDegradation(10)).toBe(95.4);
    expect(calculateModuleDegradation(20)).toBe(91.4);
    expect(calculateModuleDegradation(25)).toBe(89.4);
  });
});

describe("Regulatory Engine — NASA POWER / PVWatts Meteorology (FIX_PLAN Phase 6.2)", () => {
  it("provides monthly generation curves for Hyderabad, Visakhapatnam, and Bengaluru", () => {
    expect(CITY_SOLAR_METEOROLOGY.hyderabad).toBeDefined();
    expect(CITY_SOLAR_METEOROLOGY.visakhapatnam).toBeDefined();
    expect(CITY_SOLAR_METEOROLOGY.bengaluru).toBeDefined();

    const hyd = CITY_SOLAR_METEOROLOGY.hyderabad;
    expect(hyd.monthlyYield).toHaveLength(12);
    expect(hyd.annualKwhPerKw).toBe(1490);

    // Sum of 12 months should match annual total
    const sumMonthly = hyd.monthlyYield.reduce((a, b) => a + b.yieldKwh, 0);
    expect(sumMonthly).toBe(1490);

    // March/April/May (pre-monsoon summer) should have peak generation
    expect(hyd.monthlyYield[2].yieldKwh).toBeGreaterThanOrEqual(140);
    expect(hyd.monthlyYield[3].yieldKwh).toBeGreaterThanOrEqual(140);

    // July/August (monsoon) should show realistic seasonal dip
    expect(hyd.monthlyYield[6].yieldKwh).toBeLessThan(115);
    expect(hyd.monthlyYield[7].yieldKwh).toBeLessThan(115);
  });
});
