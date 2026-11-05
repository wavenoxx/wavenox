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

  it("proves 12-month billing-period settlement prevents cross-period retail offset vs annual aggregate netting and models seasonal import/export profiles (Task A1–A8)", () => {
    // 1. Uniform monthly consumption where annual generation (~10.38 MWh) is near annual consumption (~10.03 MWh):
    // Spring peak solar months (Mar/Apr/May) generate excess exports while monsoon months (Jul/Aug) have net grid imports.
    // Annual aggregate netting falsely offsets monsoon imports with spring exports at retail slab rates!
    const boundaryCase = estimate({
      monthlyBillInr: 7200,
      discomCode: "TGSPDCL",
      panels: 12, // 6.96 kW -> ~10,370 kWh/yr
    });
    expect(boundaryCase.energyBalance.settlementCycle).toBe("MONTHLY_BILLING_PERIOD");
    expect(boundaryCase.energyBalance.consumptionProfileBasis).toBe("UNIFORM_MONTHLY_ASSUMPTION");
    expect(boundaryCase.energyBalance.monthlyLedger).toHaveLength(12);
    expect(
      boundaryCase.energyBalance.annualAggregateComparison.crossPeriodOffsetPreventedKwh,
    ).toBeGreaterThan(0);
    expect(
      boundaryCase.energyBalance.annualAggregateComparison.savingsDifferenceVsAnnualAggregateInr,
    ).toBeGreaterThan(0);
    expect(boundaryCase.avoidedBillSavingsInr).toBeLessThan(
      boundaryCase.energyBalance.annualAggregateComparison.annualAggregateAvoidedBillSavingsInr,
    );

    // 2. Explicit 12-month seasonal consumption profile (Summer AC heavy, Monsoon moderate, Winter light)
    // Jan..Dec units: low in winter (250 u), high in summer (950 u), moderate in monsoon (650 u)
    const seasonalConsumption = [250, 300, 550, 850, 950, 800, 650, 650, 550, 450, 300, 250];
    const seasonalCase = estimate({
      monthlyBillInr: 5000,
      discomCode: "TGSPDCL",
      panels: 9, // 5.22 kW -> ~7,778 kWh/yr vs 6,550 kWh/yr consumption
      monthlyConsumptionByMonth: seasonalConsumption,
    });

    expect(seasonalCase.energyBalance.consumptionProfileBasis).toBe("ACTUAL_OR_SEASONAL_12_MONTH");
    expect(seasonalCase.annualConsumptionKwh).toBe(6550);

    // Winter month (Jan, index 0: 250 units consumption vs ~648 kWh generation): excess export > 0, residual import = 0, residual bill = unavoidable fixed/customer charges only
    const jan = seasonalCase.energyBalance.monthlyLedger[0];
    expect(jan.consumptionKwh).toBe(250);
    expect(jan.residualGridImportKwh).toBe(0);
    expect(jan.billingPeriodSurplusKwh).toBeGreaterThan(0);
    expect(jan.postSolarBillInr).toBe(jan.unavoidableFixedCustomerChargesInr);

    // Peak summer/monsoon months (May index 4: 950 u; Aug index 7: 650 u): net grid import > 0, excess export = 0
    const may = seasonalCase.energyBalance.monthlyLedger[4];
    const aug = seasonalCase.energyBalance.monthlyLedger[7];
    expect(may.residualGridImportKwh).toBeGreaterThan(0);
    expect(may.billingPeriodSurplusKwh).toBe(0);
    expect(aug.residualGridImportKwh).toBeGreaterThan(0);
    expect(aug.billingPeriodSurplusKwh).toBe(0);

    // Annual aggregate comparison proves winter exports were prevented from offsetting summer/monsoon imports at retail slab rates
    expect(
      seasonalCase.energyBalance.annualAggregateComparison.crossPeriodOffsetPreventedKwh,
    ).toBeGreaterThan(500);
    expect(
      seasonalCase.energyBalance.annualAggregateComparison.savingsDifferenceVsAnnualAggregateInr,
    ).toBeGreaterThan(1000);

    // Surplus export rate is ₹2.65/kWh (INDICATIVE under TGERC Reg. No. 1 of 2025 Clause 8.1.3)
    expect(seasonalCase.assumptions.discom.exportRateInr).toBe(2.65);
    expect(seasonalCase.assumptions.discom.exportRateStatus).toBe("INDICATIVE");
    expect(seasonalCase.verificationBreakdown.surplusExportRate).toBe("INDICATIVE");
    expect(seasonalCase.surplusExportCreditInr).toBe(
      Math.round(seasonalCase.netAnnualSurplusKwh * 2.65),
    );
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

  it("strictly reconciles 25-year cash and financed projections with summary metrics and Month-3 direct-to-loan-account DBT prepayment even when subsidy > 10% down payment (Task B & P0-B)", () => {
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

    // Task B: Subsidy credited directly into SBI loan account in Month 3 to prepay loan principal
    expect(smallLoanCase.financing.initialLoanPrincipalInr).toBe(194184);
    expect(smallLoanCase.financing.subsidyCreditMonth).toBe(3);
    expect(smallLoanCase.financing.subsidyCreditedToLoanInr).toBe(78000);
    expect(smallLoanCase.financing.excessSubsidyToBorrowerInr).toBe(0);
    expect(smallLoanCase.financing.postSubsidyPrincipalInr).toBe(
      smallLoanCase.financing.balanceBeforeSubsidyCreditInr - 78000,
    );
    expect(smallLoanCase.financing.postSubsidyMonthlyEmiInr).toBeLessThan(
      smallLoanCase.financing.initialMonthlyEmiInr,
    );

    // Cash-Flow Ledger Reconciliation (Task B6 & P0-B): zero double counting
    expect(smallLoanCase.projection[24].netCumulativeCashflow).toBe(
      smallLoanCase.netGain25YearsInr,
    );
    expect(smallLoanCase.financedProjection[24].netCumulativeCashflow).toBe(
      smallLoanCase.financedNetGain25YearsInr,
    );
    expect(smallLoanCase.cashFlowLedger.reconcilesWithSummary).toBe(true);
    expect(smallLoanCase.cashFlowLedger.year0CustomerOutflowInr).toBe(21576);
    expect(smallLoanCase.cashFlowLedger.year1LoanPrincipalPrepaymentInr).toBe(78000);
    expect(smallLoanCase.cashFlowLedger.year1UnrestrictedCashSubsidyInr).toBe(0);
    expect(smallLoanCase.cashFlowLedger.year1SubsidyCreditInr).toBe(78000);

    // In Loan mode, subsidy prepays loan principal in Year 1 (reducing annualLoanOutflow), so unrestricted cash subsidyCreditInr is 0 across all 25 years
    expect(smallLoanCase.financedProjection[0].loanPrincipalPrepaymentInr).toBe(78000);
    for (let i = 0; i < 25; i++) {
      expect(smallLoanCase.financedProjection[i].subsidyCreditInr).toBe(0);
    }
    // In Cash mode, subsidy is credited as a Year-1 DBT cash inflow
    expect(smallLoanCase.projection[0].subsidyCreditInr).toBe(78000);

    // Sum of annual customer loan EMI outflows equals totalRepaymentInr
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
    // Tier 1: ₹2,00,000 gross, 2.9 kW (<= 3 kW) -> ₹1,80,000 principal (<= ₹2L) -> 6.00% p.a. (SBI Green Loans eff. 2026-10-15)
    const tier1 = calculateSolarFinancing({
      grossCapexInr: 200000,
      systemKw: 2.9,
      tenureMonths: 60,
    });
    expect(tier1.loanPrincipalInr).toBe(180000);
    expect(tier1.annualInterestRate).toBe(0.06);
    expect(tier1.annualInterestRatePct).toBe(6);
    expect(tier1.monthlyEmiInr).toBe(3480);
    expect(tier1.exceedsConcessionalCap).toBe(false);
    expect(tier1.isSchemeEligible).toBe(true);
    expect(tier1.status).toBe("INDICATIVE");
    expect(tier1.effectiveAsOf).toBe("2026-10-15");

    // Tier 2: ₹5,00,000 gross, 5.8 kW (> 3 kW up to 10 kW) -> ₹4,50,000 principal (₹2L–₹6L) -> 8.15% p.a.
    const tier2 = calculateSolarFinancing({
      grossCapexInr: 500000,
      systemKw: 5.8,
      tenureMonths: 60,
    });
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
    expect(aboveCap.note).toContain("exceeds the PM Surya Ghar concessional cap");

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

  it("models all 3 SBI PM Surya Ghar loan amortization scenarios (Recast EMI, Reduce Tenure, Unadjusted), excludes battery capex from scheme loan, and validates >10 kW capacity cap (Task B1–B6)", () => {
    // 1. 3.48 kW solar (₹2,15,760) + 1 battery unit (₹2,65,000) = ₹4,80,760 gross, ₹78,000 subsidy
    const hybridLoan = calculateSolarFinancing({
      grossCapexInr: 480760,
      batteryCapexInr: 265000,
      systemKw: 3.48,
      subsidyInr: 78000,
      tenureMonths: 60,
    });

    // Battery capex is excluded from PM Surya Ghar scheme loan principal
    expect(hybridLoan.eligibleSolarCapexInr).toBe(215760);
    expect(hybridLoan.excludedBatteryCapexInr).toBe(265000);
    expect(hybridLoan.initialLoanPrincipalInr).toBe(Math.round(215760 * 0.9)); // 194,184
    expect(hybridLoan.solarDownPaymentInr).toBe(21576);
    expect(hybridLoan.unfinancedBatteryOutlayInr).toBe(265000);
    expect(hybridLoan.customerDownPaymentInr).toBe(21576 + 265000); // 286,576

    // Because systemKw = 3.48 > 3.0 kW, Tier 2 rate (8.15%) applies even though solar loan principal (₹1,94,184) <= ₹2L
    expect(hybridLoan.annualInterestRate).toBe(0.0815);
    expect(hybridLoan.isSchemeEligible).toBe(true);

    // Month-3 direct-to-loan-account DBT prepayment reduces principal and both interest & EMI
    const { recastEmi, reduceTenure, unadjustedNoPrepayment } = hybridLoan.amortizationScenarios;
    expect(recastEmi.status).toBe("INDICATIVE");
    expect(reduceTenure.status).toBe("INDICATIVE");
    expect(unadjustedNoPrepayment.status).toBe("INDICATIVE");

    expect(recastEmi.subsidyCreditedToLoanInr).toBe(78000);
    expect(recastEmi.postSubsidyPrincipalInr).toBe(recastEmi.balanceBeforeSubsidyCreditInr - 78000);
    expect(recastEmi.postSubsidyMonthlyEmiInr).toBeLessThan(recastEmi.initialMonthlyEmiInr);
    expect(recastEmi.totalInterestInr).toBeLessThan(unadjustedNoPrepayment.totalInterestInr);

    // Reduce-tenure scenario keeps initialMonthlyEmiInr constant and shortens effectiveTenureMonths < 60
    expect(reduceTenure.postSubsidyMonthlyEmiInr).toBe(reduceTenure.initialMonthlyEmiInr);
    expect(reduceTenure.effectiveTenureMonths).toBeLessThan(60);
    expect(reduceTenure.totalInterestInr).toBeLessThan(recastEmi.totalInterestInr);

    // 2. System > 10 kW (e.g. 11.6 kW) exceeds PM Surya Ghar 10 kW scheme capacity cap -> 9.15% indicative non-scheme rate
    const over10KwLoan = calculateSolarFinancing({
      grossCapexInr: 620000,
      systemKw: 11.6,
      subsidyInr: 78000,
    });
    expect(over10KwLoan.exceedsCapacityCap).toBe(true);
    expect(over10KwLoan.isSchemeEligible).toBe(false);
    expect(over10KwLoan.annualInterestRate).toBe(0.0915);
    expect(over10KwLoan.note).toContain("exceeds the PM Surya Ghar concessional cap");
  });

  it("integrates sanctionedLoadFeasibility into estimate() and warns when systemKw exceeds permissible sanctioned load cap (Task C)", () => {
    // 1. Unconfirmed sanctioned load with large bill (₹18,000 -> > 5 kW recommended) triggers load enhancement warning
    const highLoadUnconfirmed = estimate({
      monthlyBillInr: 18000,
      discomCode: "TGSPDCL",
    });
    expect(highLoadUnconfirmed.sanctionedLoadFeasibility.sanctionedLoadConfirmed).toBe(false);
    expect(highLoadUnconfirmed.sanctionedLoadFeasibility.requiresLoadEnhancement).toBe(true);
    expect(highLoadUnconfirmed.warnings.some((w) => w.includes("sanctioned load"))).toBe(true);

    // 2. Confirmed 10 kW sanctioned load with 8.12 kW residential system in TGSPDCL (100% cap) -> VERIFIED & feasible
    const confirmedRes = estimate({
      monthlyBillInr: 12000,
      discomCode: "TGSPDCL",
      panels: 14, // 8.12 kW
      sanctionedLoadKw: 10,
      sanctionedLoadConfirmed: true,
    });
    expect(confirmedRes.sanctionedLoadFeasibility.sanctionedLoadConfirmed).toBe(true);
    expect(confirmedRes.sanctionedLoadFeasibility.status).toBe("VERIFIED");
    expect(confirmedRes.sanctionedLoadFeasibility.isFeasibleWithoutEnhancement).toBe(true);
    expect(confirmedRes.sanctionedLoadFeasibility.requiresLoadEnhancement).toBe(false);
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
