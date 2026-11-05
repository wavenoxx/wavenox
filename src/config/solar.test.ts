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

  it("reconciles energy partition and net-metering bill savings across bills and DISCOMs (P0-A)", () => {
    for (const bill of sampleBills) {
      for (const discom of DISCOMS) {
        const result = estimate({
          monthlyBillInr: bill,
          discomCode: discom.code,
        });

        // No double counting of solar energy or exports
        expect(result.selfConsumedKwh + result.exportedKwh).toBe(result.annualGenKwh);
        expect(result.netMeteredOffsetKwh + result.netAnnualSurplusKwh).toBe(result.exportedKwh);
        expect(result.selfConsumedKwh).toBeLessThanOrEqual(result.annualConsumptionKwh);
        expect(result.netMeteredOffsetKwh).toBeLessThanOrEqual(result.importedKwh);
        expect(result.residualGridImportKwh).toBe(result.importedKwh - result.netMeteredOffsetKwh);

        // Avoided bill savings never exceed baseline annual bill
        expect(result.avoidedBillSavingsInr).toBeLessThanOrEqual(result.annualBillInr);
        expect(result.annualSavingsInr).toBe(
          result.avoidedBillSavingsInr + result.surplusExportCreditInr,
        );
        expect(result.billCoveragePct).toBeLessThanOrEqual(100);
        expect(result.billCoveragePct).toBeGreaterThanOrEqual(0);
        expect(result.billBreakdown.unavoidableChargesInr).toBeGreaterThan(0);
      }
    }
  });

  it("models P0-A net-metering scenarios: Consumption > Gen, Gen == Consumption, Gen > Consumption, Solar-Only vs Hybrid", () => {
    // Scenario 1: Consumption > Generation (₹15,000/mo TGSPDCL bill, small 6-panel 3.48 kW array)
    const underSized = estimate({
      monthlyBillInr: 15000,
      discomCode: "TGSPDCL",
      panels: 6,
      batteryUnits: 0,
    });
    expect(underSized.annualGenKwh).toBeLessThan(underSized.annualConsumptionKwh);
    expect(underSized.netAnnualSurplusKwh).toBe(0);
    expect(underSized.surplusExportCreditInr).toBe(0);
    expect(underSized.residualGridImportKwh).toBeGreaterThan(0);
    // Because 1:1 net metering values exported units against retail slab consumption, savings far exceed APPC exportRateInr
    expect(underSized.annualSavingsInr).toBeGreaterThan(
      Math.round(underSized.annualGenKwh * underSized.assumptions.discom.exportRateInr),
    );
    expect(underSized.residualBillAfterSolarInr).toBeGreaterThan(
      underSized.billBreakdown.unavoidableChargesInr * 12,
    );
    expect(underSized.avoidedBillSavingsInr).toBe(
      underSized.annualBillInr - underSized.residualBillAfterSolarInr,
    );

    // Scenario 2: Generation > Consumption (₹3,000/mo TGSPDCL bill, large 14-panel 8.12 kW array)
    const overSized = estimate({
      monthlyBillInr: 3000,
      discomCode: "TGSPDCL",
      panels: 14,
      batteryUnits: 0,
    });
    expect(overSized.annualGenKwh).toBeGreaterThan(overSized.annualConsumptionKwh);
    expect(overSized.residualGridImportKwh).toBe(0);
    expect(overSized.netAnnualSurplusKwh).toBe(
      overSized.annualGenKwh - overSized.annualConsumptionKwh,
    );
    expect(overSized.surplusExportCreditInr).toBe(
      Math.round(overSized.netAnnualSurplusKwh * overSized.assumptions.discom.exportRateInr),
    );
    // Residual bill is only the unavoidable monthly fixed/customer charges
    expect(overSized.residualBillAfterSolarInr).toBe(
      overSized.billBreakdown.unavoidableChargesInr * 12,
    );
    expect(overSized.annualSavingsInr).toBe(
      overSized.avoidedBillSavingsInr + overSized.surplusExportCreditInr,
    );

    // Scenario 3: Solar-only (70% self-consumption) vs Hybrid (90% self-consumption)
    const solarOnly = estimate({
      monthlyBillInr: 12000,
      discomCode: "APEPDCL",
      panels: 10,
      batteryUnits: 0,
    });
    const hybrid = estimate({
      monthlyBillInr: 12000,
      discomCode: "APEPDCL",
      panels: 10,
      batteryUnits: 1,
    });
    expect(hybrid.selfConsumedKwh).toBeGreaterThan(solarOnly.selfConsumedKwh);
    expect(hybrid.exportedKwh).toBeLessThan(solarOnly.exportedKwh);
    // Under 1:1 net-metering without ToD differential, total offset units (selfConsumed + netMeteredOffset) are identical
    expect(hybrid.selfConsumedKwh + hybrid.netMeteredOffsetKwh).toBe(
      solarOnly.selfConsumedKwh + solarOnly.netMeteredOffsetKwh,
    );
    expect(hybrid.avoidedBillSavingsInr).toBe(solarOnly.avoidedBillSavingsInr);
  });

  it("assigns VERIFIED status to Telangana & AP DISCOMs, INDICATIVE to regional benchmarks, and withholds financial figures for UNAVAILABLE unknown codes (P1-E)", () => {
    const tg = estimate({ monthlyBillInr: 8000, discomCode: "TGSPDCL" });
    expect(tg.status).toBe("VERIFIED");
    expect(tg.verificationBreakdown.tariffSchedule).toBe("VERIFIED");
    expect(tg.verificationBreakdown.solarGeneration).toBe("INDICATIVE");
    expect(tg.verificationBreakdown.financing).toBe("INDICATIVE");

    expect(estimate({ monthlyBillInr: 8000, discomCode: "TGNPDCL" }).status).toBe("VERIFIED");
    expect(estimate({ monthlyBillInr: 8000, discomCode: "APEPDCL" }).status).toBe("VERIFIED");
    expect(estimate({ monthlyBillInr: 8000, discomCode: "APSPDCL" }).status).toBe("VERIFIED");
    expect(estimate({ monthlyBillInr: 8000, discomCode: "BESCOM" }).status).toBe("INDICATIVE");
    expect(estimate({ monthlyBillInr: 8000, discomCode: "MSEDCL" }).status).toBe("INDICATIVE");

    const unknown = estimate({ monthlyBillInr: 8000, discomCode: "NON_EXISTENT_DISCOM" });
    expect(unknown.status).toBe("UNAVAILABLE");
    expect(unknown.verificationBreakdown.tariffSchedule).toBe("UNAVAILABLE");
    expect(unknown.verificationBreakdown.solarGeneration).toBe("UNAVAILABLE");
    expect(unknown.verificationBreakdown.completeEstimate).toBe("UNAVAILABLE");
    expect(unknown.annualGenKwh).toBe(0);
    expect(unknown.annualSavingsInr).toBe(0);
    expect(unknown.assumptions.yieldKwhPerKwYear).toBe(0);
    expect(unknown.assumptions.tariffInrPerKwh).toBe(0);
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

  it("strictly reconciles 25-year cash and financed projections with summary metrics even when subsidy > 10% down payment (P0-B & P1-D)", () => {
    // 6 panels (3.48 kW): grossInr = ₹2,15,760, 10% down payment = ₹21,576, subsidy = ₹78,000 (> down payment!)
    const smallLoanCase = estimate({
      monthlyBillInr: 4500,
      discomCode: "TGSPDCL",
      panels: 6,
      paymentMode: "loan",
    });

    expect(smallLoanCase.subsidyInr).toBe(78000);
    expect(smallLoanCase.financing.customerDownPaymentInr).toBe(21576);
    expect(smallLoanCase.subsidyInr).toBeGreaterThan(
      smallLoanCase.financing.customerDownPaymentInr,
    );

    // Cash-Flow Ledger Reconciliation (P0-B)
    expect(smallLoanCase.projection[24].netCumulativeCashflow).toBe(
      smallLoanCase.netGain25YearsInr,
    );
    expect(smallLoanCase.financedProjection[24].netCumulativeCashflow).toBe(
      smallLoanCase.financedNetGain25YearsInr,
    );
    expect(smallLoanCase.cashFlowLedger.reconcilesWithSummary).toBe(true);
    expect(smallLoanCase.cashFlowLedger.year0CustomerOutflowInr).toBe(21576);
    expect(smallLoanCase.cashFlowLedger.year1SubsidyCreditInr).toBe(78000);

    // Subsidy credited once in Year 1, 0 in Years 2..25
    expect(smallLoanCase.financedProjection[0].subsidyCreditInr).toBe(78000);
    for (let i = 1; i < 25; i++) {
      expect(smallLoanCase.financedProjection[i].subsidyCreditInr).toBe(0);
    }

    // Sum of annual loan outflows equals totalRepaymentInr
    const totalScheduledEmi = smallLoanCase.financedProjection.reduce(
      (acc, pt) => acc + pt.annualLoanOutflow,
      0,
    );
    expect(totalScheduledEmi).toBe(smallLoanCase.financing.totalRepaymentInr);

    // Conditional Subsidy Differentiation (P1-D)
    expect(smallLoanCase.potentialSubsidyInr).toBe(78000);
    expect(smallLoanCase.confirmedSubsidyInr).toBe(0);
    expect(smallLoanCase.receivedSubsidyInr).toBe(0);
    expect(smallLoanCase.subsidyAssessment.isConditional).toBe(true);

    const confirmedCase = estimate({
      monthlyBillInr: 4500,
      discomCode: "TGSPDCL",
      panels: 6,
      isGridConnected: true,
      dcrCompliant: true,
      hasPriorSubsidy: false,
      subsidyDisbursed: true,
    });
    expect(confirmedCase.confirmedSubsidyInr).toBe(78000);
    expect(confirmedCase.receivedSubsidyInr).toBe(78000);
    expect(confirmedCase.subsidyAssessment.isConditional).toBe(false);
  });
});

describe("Solar Engine — Roof Feasibility, Financing & Commercial Section 33 Tax (Phases B, E, G / P0-C, P1-F)", () => {
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

  it("calculates numerically stable EMI across Tier 1 (6.00%), Tier 2 (8.15%), Above-Cap (9.15%), zero-interest, and zero-principal cases (P0-C)", () => {
    // Tier 1: ₹2,00,000 gross -> ₹1,80,000 principal (<= ₹2L) -> 6.00% p.a. (SBI Green Loans eff. 2026-10-15)
    const tier1 = calculateSolarFinancing({ grossCapexInr: 200000, tenureMonths: 60 });
    expect(tier1.loanPrincipalInr).toBe(180000);
    expect(tier1.annualInterestRate).toBe(0.06);
    expect(tier1.annualInterestRatePct).toBe(6);
    expect(tier1.monthlyEmiInr).toBe(3480);
    expect(tier1.exceedsConcessionalCap).toBe(false);
    expect(tier1.isSchemeEligible).toBe(true);
    expect(tier1.status).toBe("INDICATIVE");
    expect(tier1.effectiveAsOf).toBe("2026-10-15");

    // Tier 2: ₹5,00,000 gross -> ₹4,50,000 principal (₹2L–₹6L) -> 8.15% p.a.
    const tier2 = calculateSolarFinancing({ grossCapexInr: 500000, tenureMonths: 60 });
    expect(tier2.loanPrincipalInr).toBe(450000);
    expect(tier2.annualInterestRate).toBe(0.0815);
    expect(tier2.annualInterestRatePct).toBe(8.15);
    expect(tier2.exceedsConcessionalCap).toBe(false);
    expect(tier2.isSchemeEligible).toBe(true);
    expect(tier2.status).toBe("INDICATIVE");

    // Above ₹6,00,000 principal cap -> uses 9.15% aboveCapIndicativeRate and flags isSchemeEligible = false
    const aboveCap = calculateSolarFinancing({ grossCapexInr: 900000, tenureMonths: 60 });
    expect(aboveCap.loanPrincipalInr).toBe(810000);
    expect(aboveCap.annualInterestRate).toBe(0.0915);
    expect(aboveCap.annualInterestRatePct).toBe(9.15);
    expect(aboveCap.exceedsConcessionalCap).toBe(true);
    expect(aboveCap.isSchemeEligible).toBe(false);
    expect(aboveCap.status).toBe("INDICATIVE");
    expect(aboveCap.note).toContain("exceeds the ₹6,00,000 PM Surya Ghar concessional cap");

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
