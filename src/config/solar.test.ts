import { describe, it, expect } from "vitest";
import {
  DISCOMS,
  SOLAR_ASSUMPTIONS,
  SYSTEM_TIERS,
  calculateGovtSubsidyInr,
  validateRoofFeasibility,
  calculateSolarFinancing,
  calculateCommercialSolarAssessment,
  project25Years,
  estimate,
} from "./solar";

describe("Solar Engine — Subsidy Calculations", () => {
  it("calculates correct residential subsidy curve", () => {
    expect(calculateGovtSubsidyInr(1)).toBe(30000);
    expect(calculateGovtSubsidyInr(2)).toBe(60000);
    expect(calculateGovtSubsidyInr(3)).toBe(78000);
    expect(calculateGovtSubsidyInr(5)).toBe(78000);
    expect(calculateGovtSubsidyInr(10)).toBe(78000);
    expect(calculateGovtSubsidyInr(25)).toBe(78000);
  });

  it("returns 0 subsidy for commercial segments", () => {
    expect(calculateGovtSubsidyInr(1, "commercial")).toBe(0);
    expect(calculateGovtSubsidyInr(3, "commercial")).toBe(0);
    expect(calculateGovtSubsidyInr(10, "commercial")).toBe(0);
  });

  it("handles 0, negative, and invalid kW inputs safely", () => {
    expect(calculateGovtSubsidyInr(0)).toBe(0);
    expect(calculateGovtSubsidyInr(-5)).toBe(0);
    expect(calculateGovtSubsidyInr(NaN)).toBe(0);
  });
});

describe("Solar Engine — estimate() Core & Regional Calculations", () => {
  const sampleBills = [3000, 14000, 75000];

  it("ensures annualSavingsInr never exceeds annualBillInr across bills and DISCOMs", () => {
    for (const bill of sampleBills) {
      for (const discom of DISCOMS) {
        const result = estimate({
          monthlyBillInr: bill,
          discomCode: discom.code,
        });

        expect(result.annualSavingsInr).toBeLessThanOrEqual(result.annualBillInr);
        expect(result.billCoveragePct).toBeLessThanOrEqual(100);
        expect(result.billCoveragePct).toBeGreaterThanOrEqual(0);
        expect(result.billBreakdown.unavoidableChargesInr).toBeGreaterThan(0);
      }
    }
  });

  it("assigns VERIFIED status to Telangana & AP DISCOMs, INDICATIVE to regional benchmarks, and UNAVAILABLE to unknown codes", () => {
    expect(estimate({ monthlyBillInr: 8000, discomCode: "TGSPDCL" }).status).toBe("VERIFIED");
    expect(estimate({ monthlyBillInr: 8000, discomCode: "TGNPDCL" }).status).toBe("VERIFIED");
    expect(estimate({ monthlyBillInr: 8000, discomCode: "APEPDCL" }).status).toBe("VERIFIED");
    expect(estimate({ monthlyBillInr: 8000, discomCode: "APSPDCL" }).status).toBe("VERIFIED");
    expect(estimate({ monthlyBillInr: 8000, discomCode: "BESCOM" }).status).toBe("INDICATIVE");
    expect(estimate({ monthlyBillInr: 8000, discomCode: "MSEDCL" }).status).toBe("INDICATIVE");

    const unknown = estimate({ monthlyBillInr: 8000, discomCode: "NON_EXISTENT_DISCOM" });
    expect(unknown.status).toBe("UNAVAILABLE");
    expect(unknown.warnings.length).toBeGreaterThan(0);
  });

  it("reflects regional solar yield differences across states", () => {
    const hyd = estimate({ monthlyBillInr: 10000, discomCode: "TGSPDCL", panels: 10 });
    const vizag = estimate({ monthlyBillInr: 10000, discomCode: "APEPDCL", panels: 10 });
    const blr = estimate({ monthlyBillInr: 10000, discomCode: "BESCOM", panels: 10 });

    expect(hyd.assumptions.yieldKwhPerKwYear).toBe(1490);
    expect(vizag.assumptions.yieldKwhPerKwYear).toBe(1460);
    expect(blr.assumptions.yieldKwhPerKwYear).toBe(1440);
    expect(hyd.annualGenKwh).toBeGreaterThan(vizag.annualGenKwh);
    expect(vizag.annualGenKwh).toBeGreaterThan(blr.annualGenKwh);
  });

  it("produces emiBelowBill === false for default studio configuration", () => {
    const result = estimate({
      monthlyBillInr: 12000,
      panels: 24,
      batteryUnits: 2,
    });

    expect(result.emiBelowBill).toBe(false);
    expect(result.monthlyEmiInr).toBeGreaterThan(12000);
  });

  it("excludes standalone battery storage capex from PM Surya Ghar subsidy", () => {
    const withoutBattery = estimate({ monthlyBillInr: 10000, panels: 10, batteryUnits: 0 });
    const withBattery = estimate({ monthlyBillInr: 10000, panels: 10, batteryUnits: 2 });

    expect(withBattery.subsidyInr).toBe(withoutBattery.subsidyInr);
    expect(withBattery.batteryGrossInr).toBe(2 * SOLAR_ASSUMPTIONS.battery.unitPriceInr);
    expect(withBattery.grossInr).toBe(withoutBattery.grossInr + withBattery.batteryGrossInr);
  });

  it("gracefully handles NaN, 0, and negative bill inputs without throwing", () => {
    expect(() => estimate({ monthlyBillInr: NaN })).not.toThrow();
    expect(() => estimate({ monthlyBillInr: 0 })).not.toThrow();
    expect(() => estimate({ monthlyBillInr: -5000 })).not.toThrow();

    const nanResult = estimate({ monthlyBillInr: NaN });
    expect(nanResult.annualBillInr).toBe(0);
    expect(nanResult.annualSavingsInr).toBe(0);
    expect(nanResult.billCoveragePct).toBe(0);
    expect(nanResult.emiBelowBill).toBe(false);
  });

  it("produces consistent recommendedKw across callers with identical bills and DISCOMs (Phase I)", () => {
    const res1 = estimate({ monthlyBillInr: 8000, discomCode: "TGSPDCL" });
    const res2 = estimate({ monthlyBillInr: 8000, discomCode: "TGSPDCL" });

    expect(res1.recommendedKw).toBe(res2.recommendedKw);
    expect(res1.recommendedPanels).toBe(res2.recommendedPanels);
    expect(res1.systemKw).toBe(res2.systemKw);
    expect(res1.annualGenKwh).toBe(res2.annualGenKwh);
    expect(res1.annualSavingsInr).toBe(res2.annualSavingsInr);
    expect(res1.projection[24].netCumulativeCashflow).toBe(res1.netGain25YearsInr);
  });

  it("scales tiers according to panel specification (580W)", () => {
    expect(SOLAR_ASSUMPTIONS.panelWatt).toBe(580);

    for (const tier of SYSTEM_TIERS) {
      expect(tier.panels).toBe(Math.ceil((tier.targetKw * 1000) / SOLAR_ASSUMPTIONS.panelWatt));
      expect(tier.systemKw).toBe(
        Number(((tier.panels * SOLAR_ASSUMPTIONS.panelWatt) / 1000).toFixed(2)),
      );
    }
  });

  it("correctly models 25-year compounding for both cash and financed purchases (Phase F)", () => {
    const result = estimate({
      monthlyBillInr: 15000,
      discomCode: "TGSPDCL",
    });

    expect(result.savings25YearsInr).toBeGreaterThan(0);
    expect(result.netGain25YearsInr).toBe(result.savings25YearsInr - result.netInr);
    expect(result.financedNetGain25YearsInr).toBe(
      result.savings25YearsInr - (result.netInr + result.financing.totalInterestInr),
    );
    expect(result.financedPaybackYears).toBeGreaterThanOrEqual(result.paybackYears);
  });
});

describe("Solar Engine — Roof Feasibility, Financing & Commercial Section 33 Tax (Phases B, E, G)", () => {
  it("validates roof area feasibility and flags insufficient roof area", () => {
    const feasible = validateRoofFeasibility(10, 580, 800);
    expect(feasible.systemKw).toBe(5.8);
    expect(feasible.recommendedClearRoofSqft).toBe(580);
    expect(feasible.isFeasible).toBe(true);
    expect(feasible.warning).toBeNull();

    const constrained = validateRoofFeasibility(20, 580, 600);
    expect(constrained.systemKw).toBe(11.6);
    expect(constrained.recommendedClearRoofSqft).toBe(1160);
    expect(constrained.isFeasible).toBe(false);
    expect(constrained.maxFeasiblePanels).toBe(10);
    expect(constrained.warning).toContain("exceeds the 600 sq.ft. available");
  });

  it("calculates numerically stable EMI across Tier 1, Tier 2, zero-interest, and zero-principal cases", () => {
    // Tier 1: ₹2,00,000 gross -> ₹1,80,000 principal (<= ₹2L) -> 5.75%
    const tier1 = calculateSolarFinancing({ grossCapexInr: 200000, tenureMonths: 60 });
    expect(tier1.loanPrincipalInr).toBe(180000);
    expect(tier1.annualInterestRate).toBe(0.0575);
    expect(tier1.monthlyEmiInr).toBeGreaterThan(3400);
    expect(tier1.monthlyEmiInr).toBeLessThan(3500);
    expect(tier1.exceedsConcessionalCap).toBe(false);

    // Tier 2: ₹5,00,000 gross -> ₹4,50,000 principal (₹2L–₹6L) -> 7.90%
    const tier2 = calculateSolarFinancing({ grossCapexInr: 500000, tenureMonths: 60 });
    expect(tier2.loanPrincipalInr).toBe(450000);
    expect(tier2.annualInterestRate).toBe(0.079);
    expect(tier2.exceedsConcessionalCap).toBe(false);

    // Above ₹6,00,000 principal cap
    const aboveCap = calculateSolarFinancing({ grossCapexInr: 900000, tenureMonths: 60 });
    expect(aboveCap.loanPrincipalInr).toBe(810000);
    expect(aboveCap.exceedsConcessionalCap).toBe(true);
    expect(aboveCap.status).toBe("INDICATIVE");

    // Zero interest rate edge case
    const zeroRate = calculateSolarFinancing({
      grossCapexInr: 120000,
      tenureMonths: 60,
      annualInterestRate: 0,
    });
    expect(zeroRate.loanPrincipalInr).toBe(108000);
    expect(zeroRate.monthlyEmiInr).toBe(1800);
    expect(zeroRate.totalInterestInr).toBe(0);

    // Zero principal edge case
    const zeroPrincipal = calculateSolarFinancing({ grossCapexInr: 0 });
    expect(zeroPrincipal.monthlyEmiInr).toBe(0);
    expect(zeroPrincipal.totalRepaymentInr).toBe(0);
  });

  it("models Section 33 commercial depreciation deduction vs conditional tax shield including 0% tax scenario", () => {
    const h1Profitable = calculateCommercialSolarAssessment({
      capacityKw: 100,
      discomCode: "TGSPDCL",
      commissioningWindow: "H1_FULL_RATE",
      corporateTaxRatePct: 25.17,
      hasTaxableProfit: true,
    });

    expect(h1Profitable.grossCapexInr).toBe(4200000);
    expect(h1Profitable.subsidyInr).toBe(0);
    expect(h1Profitable.year1DepreciationRatePct).toBe(40);
    expect(h1Profitable.year1DepreciationDeductionInr).toBe(1680000);
    expect(h1Profitable.year1IllustrativeTaxShieldInr).toBe(Math.round(1680000 * 0.2517));
    expect(h1Profitable.taxAdjustedIllustrativePaybackYears).toBeLessThan(
      h1Profitable.operationalPaybackYears,
    );

    const h2HalfRate = calculateCommercialSolarAssessment({
      capacityKw: 100,
      discomCode: "TGSPDCL",
      commissioningWindow: "H2_HALF_RATE",
      corporateTaxRatePct: 25.17,
      hasTaxableProfit: true,
    });
    expect(h2HalfRate.year1DepreciationRatePct).toBe(20);
    expect(h2HalfRate.year1DepreciationDeductionInr).toBe(840000);

    const zeroTaxEntity = calculateCommercialSolarAssessment({
      capacityKw: 100,
      discomCode: "TGSPDCL",
      commissioningWindow: "H1_FULL_RATE",
      corporateTaxRatePct: 0,
      hasTaxableProfit: false,
    });
    expect(zeroTaxEntity.year1DepreciationDeductionInr).toBe(1680000);
    expect(zeroTaxEntity.year1IllustrativeTaxShieldInr).toBe(0);
    expect(zeroTaxEntity.taxAdjustedIllustrativePaybackYears).toBe(
      zeroTaxEntity.operationalPaybackYears,
    );
  });
});
