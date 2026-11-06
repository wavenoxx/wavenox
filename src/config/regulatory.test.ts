import { describe, it, expect } from "vitest";
import {
  calculateGovtSubsidyInr,
  evaluateSubsidyEligibility,
  evaluateSanctionedLoadFeasibility,
  energyCharge,
  calculateElectricityBill,
  calculateMonthlyElectricityBill,
  estimateConsumptionFromBill,
  unitsForBill,
  decodeBill,
  calculateModuleDegradation,
  MODULE_WARRANTY_TERMS,
  SOLAR_LOAN_TERMS,
  WIND_SPEED_STANDARDS,
  VERIFIED_DISCOMS,
  DISCOM_TARIFF_PROFILES,
  TGERC_RTS_REGULATION_2025_SOURCE,
  TGERC_EXPORT_SETTLEMENT_PROCEEDING_2025_SOURCE,
  APERC_RTS_REGULATION_2023_SOURCE,
  HYDERABAD_ANNUAL_YIELD_KWH_PER_KW,
  CITY_SOLAR_METEOROLOGY,
  getSolarYieldProfileForDiscom,
  INCOME_TAX_SECTION_33_SOURCE,
  TAX_DEPRECIATION_CONFIG,
} from "./regulatory";
import { project25Years } from "./solar";
import { PHYSICS_SIMULATION_TIMELINE, verifyPowerBalance } from "./simulation";

describe("Category B — PM Surya Ghar CFA Subsidies & Eligibility (Phase D)", () => {
  it("calculates exact general category residential subsidies across fractional and integer boundaries", () => {
    // General category: ₹30,000/kW for first 2 kW, ₹18,000 for 3rd kW, cap ₹78,000
    expect(calculateGovtSubsidyInr(0.5)).toBe(15000);
    expect(calculateGovtSubsidyInr(1)).toBe(30000);
    expect(calculateGovtSubsidyInr(1.5)).toBe(45000);
    expect(calculateGovtSubsidyInr(2)).toBe(60000);
    expect(calculateGovtSubsidyInr(2.5)).toBe(69000);
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
    expect(calculateGovtSubsidyInr(3, { state: "Uttarakhand" })).toBe(85800);
    expect(calculateGovtSubsidyInr(3, { state: "Himachal Pradesh" })).toBe(85800);
  });

  it("returns zero subsidy for commercial, off-grid, non-DCR, and repeat claims", () => {
    expect(calculateGovtSubsidyInr(1, { segment: "commercial" })).toBe(0);
    expect(calculateGovtSubsidyInr(3, { segment: "commercial" })).toBe(0);
    expect(calculateGovtSubsidyInr(100, { segment: "commercial" })).toBe(0);
    expect(calculateGovtSubsidyInr(3, { isGridConnected: false })).toBe(0);
    expect(calculateGovtSubsidyInr(3, { dcrCompliant: false })).toBe(0);
    expect(calculateGovtSubsidyInr(3, { hasPriorSubsidy: true })).toBe(0);
  });

  it("calculates group housing and RWA common facility subsidies", () => {
    // RWA: ₹18,000 per kW up to 500 kW
    expect(calculateGovtSubsidyInr(10, { segment: "rwa" })).toBe(180000);
    expect(calculateGovtSubsidyInr(100, { segment: "rwa" })).toBe(1800000);
    expect(calculateGovtSubsidyInr(600, { segment: "rwa" })).toBe(500 * 18000);
  });

  it("evaluates structured subsidy eligibility statuses accurately (potential vs confirmed vs received)", () => {
    const res3kwUnconfirmed = evaluateSubsidyEligibility(3, { segment: "residential" });
    expect(res3kwUnconfirmed.eligibilityStatus).toBe("POTENTIALLY_ELIGIBLE");
    expect(res3kwUnconfirmed.potentialSubsidyInr).toBe(78000);
    expect(res3kwUnconfirmed.confirmedEligibleSubsidyInr).toBe(0);
    expect(res3kwUnconfirmed.receivedSubsidyInr).toBe(0);
    expect(res3kwUnconfirmed.isConditional).toBe(true);
    expect(res3kwUnconfirmed.unverifiedCustomerFacts.length).toBeGreaterThan(0);

    const res3kwConfirmed = evaluateSubsidyEligibility(3, {
      segment: "residential",
      isGridConnected: true,
      dcrCompliant: true,
      hasPriorSubsidy: false,
    });
    expect(res3kwConfirmed.eligibilityStatus).toBe("CONFIRMED_ELIGIBLE");
    expect(res3kwConfirmed.potentialSubsidyInr).toBe(78000);
    expect(res3kwConfirmed.confirmedEligibleSubsidyInr).toBe(78000);
    expect(res3kwConfirmed.receivedSubsidyInr).toBe(0);
    expect(res3kwConfirmed.isConditional).toBe(false);

    const res3kwReceived = evaluateSubsidyEligibility(3, {
      segment: "residential",
      isGridConnected: true,
      dcrCompliant: true,
      hasPriorSubsidy: false,
      subsidyDisbursed: true,
    });
    expect(res3kwReceived.receivedSubsidyInr).toBe(78000);

    const resSub1kw = evaluateSubsidyEligibility(0.8, { segment: "residential" });
    expect(resSub1kw.eligibilityStatus).toBe("REQUIRES_VERIFICATION");
    expect(resSub1kw.indicativeSubsidyInr).toBe(24000);

    const res12kw = evaluateSubsidyEligibility(12, { segment: "residential" });
    expect(res12kw.eligibilityStatus).toBe("REQUIRES_VERIFICATION");
    expect(res12kw.indicativeSubsidyInr).toBe(78000);

    const comm = evaluateSubsidyEligibility(50, { segment: "commercial" });
    expect(comm.eligibilityStatus).toBe("INELIGIBLE");
    expect(comm.indicativeSubsidyInr).toBe(0);
    expect(comm.potentialSubsidyInr).toBe(0);
  });

  it("handles 0, negative, and NaN inputs safely", () => {
    expect(calculateGovtSubsidyInr(0)).toBe(0);
    expect(calculateGovtSubsidyInr(-5)).toBe(0);
    expect(calculateGovtSubsidyInr(NaN)).toBe(0);
  });
});

describe("Category A — State-Specific Tariff & Bill Engine (Phase A)", () => {
  it("matches exact TGERC order test cases for Telangana: 300 units = 1790, 900 units = 7490", () => {
    expect(energyCharge("TGSPDCL", 50)).toBeCloseTo(97.5, 2);
    expect(energyCharge("TGSPDCL", 100)).toBeCloseTo(252.5, 2);
    expect(energyCharge("TGSPDCL", 200)).toBeCloseTo(820, 2);
    expect(energyCharge("TGSPDCL", 300)).toBe(1790);
    expect(energyCharge("TGSPDCL", 400)).toBe(2690);
    expect(energyCharge("TGSPDCL", 800)).toBe(6490);
    expect(energyCharge("TGSPDCL", 900)).toBe(7490);
  });

  it("matches exact APERC FY 2025-26 / 2026-27 6-tier telescopic slabs for Andhra Pradesh (APEPDCL & APSPDCL)", () => {
    // 0-30 @ 1.90 (57)
    expect(energyCharge("APEPDCL", 30)).toBeCloseTo(57, 2);
    // 30*1.90 (57) + 45*3.00 (135) = 192
    expect(energyCharge("APEPDCL", 75)).toBeCloseTo(192, 2);
    // 192 + 50*4.50 (225) = 417
    expect(energyCharge("APEPDCL", 125)).toBeCloseTo(417, 2);
    // 417 + 100*6.00 (600) = 1017
    expect(energyCharge("APEPDCL", 225)).toBeCloseTo(1017, 2);
    // 1017 + 175*8.75 (1531.25) = 2548.25
    expect(energyCharge("APEPDCL", 400)).toBeCloseTo(2548.25, 2);
    // 2548.25 + 100*9.75 (975) = 3523.25
    expect(energyCharge("APSPDCL", 500)).toBeCloseTo(3523.25, 2);
  });

  it("computes full monthly bills including customer charges, fixed charges, and duty", () => {
    const bill300 = calculateMonthlyElectricityBill("TGSPDCL", 300, 5);
    // 1790 (EC) + 60 (CC) + 50 (FC 5kW*10) + 18 (Duty 300*0.06) = 1918
    expect(bill300).toBe(1918);

    const bill100 = calculateMonthlyElectricityBill("TGSPDCL", 100, 3);
    // 50*1.95 (97.5) + 50*3.10 (155) = 252.5 EC + 25 CC + 0 FC + 6 Duty = 283.5 -> 284
    expect(bill100).toBe(284);

    // AP 400 units @ 5kW load: 2548.25 (EC) + 55 (CC) + 50 (FC) + 24 (Duty) = 2677.25 -> 2677
    const apBill400 = calculateMonthlyElectricityBill("APEPDCL", 400, 5);
    expect(apBill400).toBe(2677);
  });

  it("round-trips unitsForBill within ±1 unit across both Telangana and Andhra Pradesh", () => {
    const testUnits = [80, 150, 250, 300, 450, 700, 900, 1200];
    for (const discom of ["TGSPDCL", "TGNPDCL", "APEPDCL", "APSPDCL"]) {
      for (const units of testUnits) {
        const computedBill = calculateMonthlyElectricityBill(discom, units, 5);
        const recoveredUnits = unitsForBill(discom, computedBill, 5);
        expect(Math.abs(recoveredUnits - units)).toBeLessThanOrEqual(1);
      }
    }
  });

  it("decodes a ₹3,000 monthly bill into realistic units and telescopic slabs for TGSPDCL and APEPDCL", () => {
    const tgAnalysis = decodeBill("TGSPDCL", 3000, 5);
    expect(tgAnalysis.status).toBe("VERIFIED");
    expect(tgAnalysis.authority).toBe("TGERC");
    expect(tgAnalysis.estimatedUnits).toBe(416);
    expect(tgAnalysis.category).toBe("LT-I(C)");
    expect(tgAnalysis.slabs.length).toBeGreaterThanOrEqual(4);
    expect(Math.abs(tgAnalysis.totalComputedBill - 3000)).toBeLessThanOrEqual(15);

    const apAnalysis = decodeBill("APEPDCL", 3000, 5);
    expect(apAnalysis.status).toBe("VERIFIED");
    expect(apAnalysis.authority).toBe("APERC");
    expect(apAnalysis.category).toBe("LT-I(A)");
    expect(apAnalysis.slabs.length).toBe(6);
    expect(Math.abs(apAnalysis.totalComputedBill - 3000)).toBeLessThanOrEqual(15);
  });

  it("marks non-Telangana/AP DISCOMs as INDICATIVE and never applies Telangana slabs silently", () => {
    const bescomBill = decodeBill("BESCOM", 5000, 5);
    expect(bescomBill.status).toBe("INDICATIVE");
    expect(bescomBill.authority).toBe("KERC (Indicative Benchmark)");
    expect(bescomBill.category).toBe("INDICATIVE-LT");
    expect(bescomBill.slabs).toHaveLength(1);
    expect(bescomBill.slabs[0].slab).toContain("Indicative Regional Rate");

    const unknownBill = calculateElectricityBill("UNKNOWN_BOARD", 500);
    expect(unknownBill.status).toBe("UNAVAILABLE");
    expect(unknownBill.totalBillInr).toBe(0);

    const unknownConsumption = estimateConsumptionFromBill("UNKNOWN_BOARD", 5000);
    expect(unknownConsumption.status).toBe("UNAVAILABLE");
    expect(unknownConsumption.estimatedUnits).toBe(0);
  });

  it("restricts VERIFIED_DISCOMS to Telangana (TGERC) and Andhra Pradesh (APERC) and enforces MONTHLY_BILLING_PERIOD settlement with verified ₹2.57/kWh TGERC proceeding rate and indicative ₹2.09/kWh APERC rate", () => {
    expect(Object.keys(VERIFIED_DISCOMS)).toEqual(["TGSPDCL", "TGNPDCL", "APEPDCL", "APSPDCL"]);
    expect(VERIFIED_DISCOMS.TGSPDCL.portalUrl).toBe("https://tgsouthernpower.org");
    expect(VERIFIED_DISCOMS.TGNPDCL.portalUrl).toBe("https://tgnpdcl.com");
    expect(VERIFIED_DISCOMS.APEPDCL.portalUrl).toBe("https://www.apeasternpower.com");
    expect(VERIFIED_DISCOMS.APSPDCL.portalUrl).toBe("https://apspdcl.in");
    expect(Object.keys(DISCOM_TARIFF_PROFILES)).toHaveLength(11);

    // Task A & Final Source Patch: TGERC Proceedings No. TGERC/Secy/77/2025 (29.12.2025) ₹2.57/kWh & APERC Reg. No. 4 of 2023 ₹2.09/kWh
    expect(DISCOM_TARIFF_PROFILES.TGSPDCL.exportSettlementRateInr).toBe(2.57);
    expect(DISCOM_TARIFF_PROFILES.TGSPDCL.exportSettlementRateStatus).toBe("VERIFIED");
    expect(DISCOM_TARIFF_PROFILES.TGNPDCL.exportSettlementRateInr).toBe(2.57);
    expect(DISCOM_TARIFF_PROFILES.TGNPDCL.exportSettlementRateStatus).toBe("VERIFIED");
    expect(VERIFIED_DISCOMS.TGSPDCL.surplusRateInr).toBe(2.57);
    expect(VERIFIED_DISCOMS.TGSPDCL.surplusRateStatus).toBe("VERIFIED");
    expect(VERIFIED_DISCOMS.TGNPDCL.surplusRateInr).toBe(2.57);
    expect(VERIFIED_DISCOMS.TGNPDCL.surplusRateStatus).toBe("VERIFIED");
    expect(DISCOM_TARIFF_PROFILES.TGSPDCL.settlementCycle).toBe("MONTHLY_BILLING_PERIOD");
    expect(DISCOM_TARIFF_PROFILES.TGSPDCL.netMeteringRegulationSource.documentRef).toBe(
      TGERC_RTS_REGULATION_2025_SOURCE.documentRef,
    );
    expect(TGERC_EXPORT_SETTLEMENT_PROCEEDING_2025_SOURCE.status).toBe("VERIFIED");
    expect(TGERC_EXPORT_SETTLEMENT_PROCEEDING_2025_SOURCE.url).toContain("Proceeding%20Solar.pdf");

    expect(DISCOM_TARIFF_PROFILES.APEPDCL.exportSettlementRateInr).toBe(2.09);
    expect(DISCOM_TARIFF_PROFILES.APEPDCL.exportSettlementRateStatus).toBe("INDICATIVE");
    expect(DISCOM_TARIFF_PROFILES.APEPDCL.settlementCycle).toBe("MONTHLY_BILLING_PERIOD");
    expect(DISCOM_TARIFF_PROFILES.APEPDCL.netMeteringRegulationSource.documentRef).toBe(
      APERC_RTS_REGULATION_2023_SOURCE.documentRef,
    );
  });

  it("retains unavoidable fixed and customer charges when net billed consumption is 0 units under net metering (Task A4)", () => {
    const zeroUnitNetMeteredTg = calculateElectricityBill("TGSPDCL", 0, {
      sanctionedLoadKw: 5,
      includeZeroUnitFixedCharges: true,
    });
    expect(zeroUnitNetMeteredTg.energyChargeInr).toBe(0);
    expect(zeroUnitNetMeteredTg.electricityDutyInr).toBe(0);
    expect(zeroUnitNetMeteredTg.unavoidableChargesInr).toBeGreaterThan(0);
    expect(zeroUnitNetMeteredTg.totalBillInr).toBe(zeroUnitNetMeteredTg.unavoidableChargesInr);

    const zeroUnitNetMeteredAp = calculateElectricityBill("APEPDCL", 0, {
      sanctionedLoadKw: 5,
      includeZeroUnitFixedCharges: true,
    });
    expect(zeroUnitNetMeteredAp.energyChargeInr).toBe(0);
    expect(zeroUnitNetMeteredAp.unavoidableChargesInr).toBeGreaterThan(0);
    expect(zeroUnitNetMeteredAp.totalBillInr).toBe(zeroUnitNetMeteredAp.unavoidableChargesInr);
  });

  it("evaluates sanctioned load feasibility under TGERC Regulation No. 1 of 2025 (100% Res / 80% C&I) and APERC Regulation No. 4 of 2023 (100%) without assuming unverified 5 kW load is confirmed (Task C)", () => {
    // 1. Unconfirmed sanctioned load: 3.48 kW residential vs unconfirmed 5 kW default -> REQUIRES_VERIFICATION
    const unconfirmed3kw = evaluateSanctionedLoadFeasibility({
      discomCode: "TGSPDCL",
      systemKw: 3.48,
      segment: "residential",
    });
    expect(unconfirmed3kw.sanctionedLoadConfirmed).toBe(false);
    expect(unconfirmed3kw.knownSanctionedLoadKw).toBeNull();
    expect(unconfirmed3kw.assumedSanctionedLoadKw).toBe(5);
    expect(unconfirmed3kw.status).toBe("REQUIRES_VERIFICATION");
    expect(unconfirmed3kw.requiresLoadEnhancement).toBe(false);

    // 2. Unconfirmed sanctioned load: 6.96 kW residential exceeds unconfirmed 5 kW default -> flags load enhancement
    const unconfirmed7kw = evaluateSanctionedLoadFeasibility({
      discomCode: "TGSPDCL",
      systemKw: 6.96,
      segment: "residential",
    });
    expect(unconfirmed7kw.sanctionedLoadConfirmed).toBe(false);
    expect(unconfirmed7kw.requiresLoadEnhancement).toBe(true);
    expect(unconfirmed7kw.requiredSanctionedLoadKwForSystem).toBe(7);
    expect(unconfirmed7kw.warning).toContain("unverified 5 kW baseline assumption");

    // 3. Confirmed 5 kW residential load with 4.64 kW solar in TGSPDCL (100% cap) -> VERIFIED & feasible
    const confirmedFeasible = evaluateSanctionedLoadFeasibility({
      discomCode: "TGSPDCL",
      systemKw: 4.64,
      segment: "residential",
      sanctionedLoadKw: 5,
      sanctionedLoadConfirmed: true,
    });
    expect(confirmedFeasible.sanctionedLoadConfirmed).toBe(true);
    expect(confirmedFeasible.status).toBe("VERIFIED");
    expect(confirmedFeasible.isFeasibleWithoutEnhancement).toBe(true);
    expect(confirmedFeasible.maxPermissibleSolarKwWithoutLoadEnhancement).toBe(5);
    expect(confirmedFeasible.requiresLoadEnhancement).toBe(false);
    expect(confirmedFeasible.warning).toBeNull();

    // 4. Confirmed 10 kW commercial load in TGSPDCL (80% cap = 8.0 kW max): 9.0 kW requires enhancement to 11.3 kW
    const tgCommercial = evaluateSanctionedLoadFeasibility({
      discomCode: "TGSPDCL",
      systemKw: 9,
      segment: "commercial",
      sanctionedLoadKw: 10,
      sanctionedLoadConfirmed: true,
    });
    expect(tgCommercial.maxAllowedPctOfSanctionedLoad).toBe(80);
    expect(tgCommercial.maxPermissibleSolarKwWithoutLoadEnhancement).toBe(8);
    expect(tgCommercial.isFeasibleWithoutEnhancement).toBe(false);
    expect(tgCommercial.requiresLoadEnhancement).toBe(true);
    expect(tgCommercial.requiredSanctionedLoadKwForSystem).toBe(11.3);

    // 5. Confirmed 10 kW commercial load in APEPDCL (100% cap = 10.0 kW max): 9.0 kW is feasible
    const apCommercial = evaluateSanctionedLoadFeasibility({
      discomCode: "APEPDCL",
      systemKw: 9,
      segment: "commercial",
      sanctionedLoadKw: 10,
      sanctionedLoadConfirmed: true,
    });
    expect(apCommercial.maxAllowedPctOfSanctionedLoad).toBe(100);
    expect(apCommercial.maxPermissibleSolarKwWithoutLoadEnhancement).toBe(10);
    expect(apCommercial.isFeasibleWithoutEnhancement).toBe(true);
    expect(apCommercial.requiresLoadEnhancement).toBe(false);
  });
});

describe("Category C — Regional Solar Meteorology & Yield Profiles (Phase B / P1-E)", () => {
  it("provides indicative monthly generation curves with consistent 14.08% NREL PVWatts derate across all 7 service regions and UNAVAILABLE for unknown DISCOMs", () => {
    expect(HYDERABAD_ANNUAL_YIELD_KWH_PER_KW).toBe(1490);
    const expectedCities: Record<string, number> = {
      hyderabad: 1490,
      visakhapatnam: 1460,
      bengaluru: 1440,
      mumbai: 1450,
      delhi: 1420,
      goa: 1430,
      chennai: 1470,
    };

    for (const [cityKey, expectedAnnual] of Object.entries(expectedCities)) {
      const profile = CITY_SOLAR_METEOROLOGY[cityKey];
      expect(profile).toBeDefined();
      expect(profile.monthlyYield).toHaveLength(12);
      expect(profile.annualKwhPerKw).toBe(expectedAnnual);
      expect(profile.status).toBe("INDICATIVE");
      expect(profile.source.category).toBe("ENGINEERING_MODEL_ASSUMPTION");
      expect(profile.systemLossDeratePct).toBe(14.08);
      const sumMonthly = profile.monthlyYield.reduce((a, b) => a + b.yieldKwh, 0);
      expect(sumMonthly).toBe(expectedAnnual);
    }

    expect(getSolarYieldProfileForDiscom("TGSPDCL").annualKwhPerKw).toBe(1490);
    expect(getSolarYieldProfileForDiscom("APEPDCL").annualKwhPerKw).toBe(1460);
    expect(getSolarYieldProfileForDiscom("BESCOM").annualKwhPerKw).toBe(1440);

    const unknownYield = getSolarYieldProfileForDiscom("UNKNOWN_BOARD");
    expect(unknownYield.status).toBe("UNAVAILABLE");
    expect(unknownYield.annualKwhPerKw).toBe(0);
    expect(unknownYield.monthlyYield.every((m) => m.yieldKwh === 0)).toBe(true);
  });
});

describe("Regulatory Engine — Financing, Wind, Depreciation & Physics Invariants", () => {
  it("implements dated SBI Green Loans PM Surya Ghar tiered interest rates and direct-to-loan-account subsidy prepayment rules effective 2026-10-15 (Task B)", () => {
    expect(SOLAR_LOAN_TERMS.asOfDate).toBe("2026-10-15");
    expect(SOLAR_LOAN_TERMS.status).toBe("INDICATIVE");
    expect(SOLAR_LOAN_TERMS.tier1.annualInterestRate).toBe(0.06);
    expect(SOLAR_LOAN_TERMS.tier1.maxAmountInr).toBe(200000);
    expect(SOLAR_LOAN_TERMS.tier1.maxCapacityKw).toBe(3);
    expect(SOLAR_LOAN_TERMS.tier2.annualInterestRate).toBe(0.0815);
    expect(SOLAR_LOAN_TERMS.tier2.maxAmountInr).toBe(600000);
    expect(SOLAR_LOAN_TERMS.tier2.maxCapacityKw).toBe(10);
    expect(SOLAR_LOAN_TERMS.aboveCapIndicativeRate).toBe(0.0915);
    expect(SOLAR_LOAN_TERMS.maxFinancingPct).toBe(0.9);
    expect(SOLAR_LOAN_TERMS.subsidyCreditedDirectlyToLoanAccount).toBe(true);
    expect(SOLAR_LOAN_TERMS.prepaymentPenaltyPct).toBe(0);
    expect(SOLAR_LOAN_TERMS.standaloneBatteryEligibleForSchemeLoan).toBe(false);
  });

  it("maintains IS 875 (Part 3) basic wind speeds and Section 33 tax configuration citing Notified Income-tax Rules, 2026", () => {
    expect(WIND_SPEED_STANDARDS.hyderabad.basicWindSpeedKmh).toBe(158.4);
    expect(WIND_SPEED_STANDARDS.hyderabad.basicWindSpeedMs).toBe(44);
    expect(WIND_SPEED_STANDARDS.visakhapatnam.basicWindSpeedMs).toBe(50);
    expect(TAX_DEPRECIATION_CONFIG.sectionName).toBe("Section 33");
    expect(TAX_DEPRECIATION_CONFIG.actName).toBe("Income-tax Act, 2025");
    expect(TAX_DEPRECIATION_CONFIG.rulesName).toContain("Notified Income-tax Rules, 2026");
    expect(INCOME_TAX_SECTION_33_SOURCE.documentRef).toContain("Notified Income-tax Rules, 2026");
  });

  it("models negative cumulative cashflow dip before payback year", () => {
    const projection = project25Years({
      annualBillInr: 120000,
      annualSavingsInr: 100000,
      annualGenKwh: 12000,
      netInvestmentInr: 450000,
      tariffPerKwh: 9.2,
    });

    expect(projection).toHaveLength(25);
    expect(projection[0].netCumulativeCashflow).toBeLessThan(0);
    expect(projection[0].netCumulativeCashflow).toBe(projection[0].cumSavings - 450000);
    expect(projection[3].netCumulativeCashflow).toBeLessThan(0);
    expect(projection[5].netCumulativeCashflow).toBeGreaterThan(0);
  });

  it("strictly validates physics power balance and module degradation curve", () => {
    for (const step of PHYSICS_SIMULATION_TIMELINE) {
      expect(verifyPowerBalance(step, 0.05)).toBe(true);
      expect(step.batterySoc).toBeGreaterThanOrEqual(10);
      expect(step.batterySoc).toBeLessThanOrEqual(100);
    }

    expect(MODULE_WARRANTY_TERMS.year1MaxDegradationPct).toBe(1.0);
    expect(MODULE_WARRANTY_TERMS.annualDegradationPct).toBe(0.4);
    expect(calculateModuleDegradation(0)).toBe(100);
    expect(calculateModuleDegradation(1)).toBe(99.0);
    expect(calculateModuleDegradation(25)).toBe(89.4);
  });
});
