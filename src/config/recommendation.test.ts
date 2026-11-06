import { describe, expect, it } from "vitest";
import { PRODUCTS_CONFIG } from "@/config/products";
import { SOLAR_ASSUMPTIONS, estimate, validateRoofFeasibility } from "@/config/solar";
import {
  BACKUP_PRIORITY_OPTIONS,
  buildBatteryGuidance,
  buildSolarRecommendation,
  calculateRoofSketcherGeometry,
} from "@/config/recommendation";

describe("Step 4 — Intelligent Solar Recommendation Layer (Phase B & C)", () => {
  it("matches Step 3 estimate() recommended capacity and panels for verified and indicative DISCOMs", () => {
    for (const discomCode of ["TGSPDCL", "APEPDCL", "BESCOM", "MSEDCL"]) {
      const step3 = estimate({
        monthlyBillInr: 12000,
        discomCode,
        segment: "residential",
      });
      const rec = buildSolarRecommendation({
        monthlyBillInr: 12000,
        discomCode,
      });

      expect(rec.recommendedCapacityKw).toBe(step3.recommendedKw);
      expect(rec.recommendedPanels).toBe(step3.recommendedPanels);
      expect(rec.currentSelectedPanels).toBe(step3.recommendedPanels);
      expect(rec.currentSelectedKw).toBe(step3.recommendedKw);
      expect(rec.isCustomPanelSelection).toBe(false);
      expect(rec.estimatedGeneration.annualKwh).toBe(step3.annualGenKwh);
      expect(rec.estimateResult.grossInr).toBe(step3.grossInr);
      expect(rec.estimateResult.conditionalNetInr).toBe(step3.conditionalNetInr);
      expect(rec.explanation).toContain(`${PRODUCTS_CONFIG.module.ratedPowerW}W`);
      expect(rec.explanation).toContain(discomCode);
    }
  });

  it("preserves customer manual panel overrides and distinguishes Recommended vs Customer Selected", () => {
    const defaultRec = buildSolarRecommendation({
      monthlyBillInr: 8000,
      discomCode: "TGSPDCL",
    });
    expect(defaultRec.isCustomPanelSelection).toBe(false);

    const customPanels = defaultRec.recommendedPanels + 4;
    const customRec = buildSolarRecommendation({
      monthlyBillInr: 8000,
      discomCode: "TGSPDCL",
      selectedPanels: customPanels,
      isManualPanelOverride: true,
      sanctionedLoadKw: 15,
      sanctionedLoadConfirmed: true,
      inputMode: "known",
    });

    expect(customRec.recommendedPanels).toBe(defaultRec.recommendedPanels);
    expect(customRec.currentSelectedPanels).toBe(customPanels);
    expect(customRec.isCustomPanelSelection).toBe(true);
    expect(customRec.panelDeltaFromRecommended).toBe(4);
    expect(customRec.recommendationStatus).toBe("Customer Selected");
    expect(customRec.customizationNotice).toContain("4 panels above");
  });

  it("handles 'I know my details' mode (monthly kWh override, roof area, and verified sanctioned load)", () => {
    const knownRec = buildSolarRecommendation({
      discomCode: "APEPDCL",
      monthlyBillInr: 10000,
      inputMode: "known",
      monthlyUnitsOverride: 950,
      availableRoofSqft: 1400,
      sanctionedLoadKw: 10,
      sanctionedLoadConfirmed: true,
    });

    expect(knownRec.estimateResult.monthlyUnits).toBe(950);
    expect(knownRec.consumptionBasisLabel).toContain("Customer-entered 950 kWh/month");
    expect(knownRec.roofFeasibility.isFeasible).toBe(true);
    expect(knownRec.roofFeasibility.statusTone).toBe("verified");
    expect(knownRec.sanctionedLoadFeasibility.sanctionedLoadConfirmed).toBe(true);
    expect(knownRec.sanctionedLoadFeasibility.requiresLoadEnhancement).toBe(false);
    expect(knownRec.sanctionedLoadFeasibility.statusTone).toBe("verified");
    expect(knownRec.recommendationStatus).toBe("Recommended");
  });

  it("flags unsupported DISCOMs as Utility Verification Required without fabricating regional yields or savings", () => {
    const unsupported = buildSolarRecommendation({
      discomCode: "UNKNOWN_DISCOM_XYZ",
      monthlyBillInr: 15000,
    });

    expect(unsupported.jurisdictionStatus).toBe("UNAVAILABLE");
    expect(unsupported.recommendationStatus).toBe("Utility Verification Required");
    expect(unsupported.jurisdictionBadgeLabel).toBe("Utility Verification Required");
    expect(unsupported.estimatedGeneration.annualKwh).toBe(0);
    expect(unsupported.estimatedGeneration.recommendedAnnualKwh).toBe(0);
    expect(unsupported.estimateResult.annualSavingsInr).toBe(0);
    expect(unsupported.warnings.length).toBeGreaterThan(0);
    expect(unsupported.explanation).toContain("not in the verified WAVENOX registry");
  });

  it("never produces NaN or Infinity for invalid, negative, or zero bills", () => {
    for (const badBill of [0, -5000, Number.NaN, Number.POSITIVE_INFINITY]) {
      const rec = buildSolarRecommendation({
        monthlyBillInr: badBill,
        discomCode: "TGSPDCL",
      });
      expect(Number.isFinite(rec.recommendedCapacityKw)).toBe(true);
      expect(Number.isFinite(rec.recommendedPanels)).toBe(true);
      expect(Number.isFinite(rec.currentSelectedKw)).toBe(true);
      expect(Number.isFinite(rec.estimateResult.grossInr)).toBe(true);
      expect(Number.isFinite(rec.estimateResult.netInr)).toBe(true);
      expect(Number.isFinite(rec.estimateResult.annualSavingsInr)).toBe(true);
    }
  });
});

describe("Step 4 — Roof Planning & Geometry Reconciliation (Phase D)", () => {
  it("never applies an artificial 200 sq.ft. minimum when obstructions exceed gross roof area", () => {
    const obstructed = calculateRoofSketcherGeometry({
      grossAreaSqft: 600,
      parapetMarginFt: 5, // ~490 sq.ft. setback
      waterTankSqft: 400,
      walkwaySqft: 300,
      discomCode: "TGSPDCL",
    });

    expect(obstructed.rawNetSqft).toBeLessThan(0);
    expect(obstructed.netUsableSqft).toBe(0);
    expect(obstructed.maxFeasiblePanels).toBe(0);
    expect(obstructed.maxFeasibleKw).toBe(0);
    expect(obstructed.estimatedMonthlyKwh).toBe(0);
    expect(obstructed.isZeroOrNegativeUsable).toBe(true);
    expect(obstructed.warning).toContain("0 sq.ft.");
  });

  it("permits valid 0 sq.ft. gross roof area and flags roof feasibility accurately", () => {
    const zeroRoof = calculateRoofSketcherGeometry({
      grossAreaSqft: 0,
      parapetMarginFt: 2,
      waterTankSqft: 0,
      walkwaySqft: 0,
      discomCode: "TGSPDCL",
      targetPanels: 10,
    });

    expect(zeroRoof.netUsableSqft).toBe(0);
    expect(zeroRoof.maxFeasiblePanels).toBe(0);
    expect(zeroRoof.roofFeasibility.availableRoofSqft).toBe(0);
    expect(zeroRoof.roofFeasibility.isFeasible).toBe(false);
    expect(zeroRoof.warning).toContain("0 sq.ft.");

    // Direct validateRoofFeasibility(10, 580, 0) also agrees
    const directZero = validateRoofFeasibility(10, 580, 0);
    expect(directZero.availableRoofSqft).toBe(0);
    expect(directZero.maxFeasiblePanels).toBe(0);
    expect(directZero.isFeasible).toBe(false);
  });

  it("reconciles 580W module dimensions and clear area with validateRoofFeasibility()", () => {
    const geom = calculateRoofSketcherGeometry({
      grossAreaSqft: 2200,
      parapetMarginFt: 2,
      waterTankSqft: 120,
      walkwaySqft: 100,
      discomCode: "TGSPDCL",
    });

    const directValidation = validateRoofFeasibility(
      geom.maxFeasiblePanels,
      PRODUCTS_CONFIG.module.ratedPowerW,
      geom.netUsableSqft,
    );

    expect(geom.panelWatt).toBe(580);
    expect(geom.maxFeasiblePanels).toBe(directValidation.maxFeasiblePanels);
    expect(geom.maxFeasibleKw).toBe(directValidation.maxFeasibleKw);
    expect(geom.physicalModuleFootprintSqft).toBe(directValidation.moduleFootprintSqft);
    expect(geom.recommendedClearRoofSqft).toBe(directValidation.recommendedClearRoofSqft);
    expect(directValidation.isFeasible).toBe(true);
    // Physical module footprint (27.8 sq.ft/panel) is distinct from clear roof area (58 sq.ft/panel)
    expect(geom.physicalModuleFootprintSqft).toBeLessThan(geom.recommendedClearRoofSqft);
  });

  it("uses the selected DISCOM's regional solar yield rather than hardcoding Hyderabad (1490 kWh/kWp/yr)", () => {
    const hydRoof = calculateRoofSketcherGeometry({
      grossAreaSqft: 2000,
      parapetMarginFt: 2,
      waterTankSqft: 100,
      walkwaySqft: 100,
      discomCode: "TGSPDCL", // Hyderabad: 1490 kWh/kWp/yr
    });

    const vizagRoof = calculateRoofSketcherGeometry({
      grossAreaSqft: 2000,
      parapetMarginFt: 2,
      waterTankSqft: 100,
      walkwaySqft: 100,
      discomCode: "APEPDCL", // Visakhapatnam: 1460 kWh/kWp/yr
    });

    const blrRoof = calculateRoofSketcherGeometry({
      grossAreaSqft: 2000,
      parapetMarginFt: 2,
      waterTankSqft: 100,
      walkwaySqft: 100,
      discomCode: "BESCOM", // Bengaluru: 1440 kWh/kWp/yr
    });

    const unsupportedRoof = calculateRoofSketcherGeometry({
      grossAreaSqft: 2000,
      parapetMarginFt: 2,
      waterTankSqft: 100,
      walkwaySqft: 100,
      discomCode: "FAKE_UTILITY",
    });

    expect(hydRoof.annualYieldKwhPerKw).toBe(1490);
    expect(vizagRoof.annualYieldKwhPerKw).toBe(1460);
    expect(blrRoof.annualYieldKwhPerKw).toBe(1440);
    expect(vizagRoof.estimatedAnnualKwh).toBeLessThan(hydRoof.estimatedAnnualKwh);
    expect(blrRoof.estimatedAnnualKwh).toBeLessThan(vizagRoof.estimatedAnnualKwh);
    expect(unsupportedRoof.yieldStatus).toBe("UNAVAILABLE");
    expect(unsupportedRoof.estimatedAnnualKwh).toBe(0);
    expect(unsupportedRoof.estimatedMonthlyKwh).toBe(0);
  });
});

describe("Step 4 — Battery Storage Guidance & Financial Consistency (Phase E & G)", () => {
  it("reads battery specifications and prices directly from PRODUCTS_CONFIG and SOLAR_ASSUMPTIONS", () => {
    const solarOnly = buildBatteryGuidance({ selectedUnits: 0 });
    expect(solarOnly.selectedOption.usableCapacityKwh).toBe(0);
    expect(solarOnly.selectedOption.priceInr).toBe(0);
    expect(solarOnly.selectedOption.illustrativeRuntimeRangeHours).toBeNull();
    expect(solarOnly.selectedOption.outageBehavior).toContain("anti-islanding");

    for (const units of [1, 2, 3]) {
      const bg = buildBatteryGuidance({
        selectedUnits: units,
        backupPriority: BACKUP_PRIORITY_OPTIONS[2].id,
      });
      expect(bg.selectedOption.usableCapacityKwh).toBe(
        Number((units * PRODUCTS_CONFIG.battery.usableCapacityKwh).toFixed(1)),
      );
      expect(bg.selectedOption.nominalCapacityKwh).toBe(
        Number((units * PRODUCTS_CONFIG.battery.nominalEnergyKwh).toFixed(1)),
      );
      expect(bg.selectedOption.priceInr).toBe(units * SOLAR_ASSUMPTIONS.battery.unitPriceInr);
      expect(bg.selectedOption.illustrativeRuntimeRangeHours).not.toBeNull();
      const [minH, maxH] = bg.selectedOption.illustrativeRuntimeRangeHours!;
      expect(maxH).toBeGreaterThan(minH);
    }
  });

  it("updates gross project cost when adding batteries without subsidizing battery capex, and preserves equipment across cash/loan modes", () => {
    const cashNoBattery = buildSolarRecommendation({
      discomCode: "TGSPDCL",
      monthlyBillInr: 10000,
      selectedPanels: 10,
      selectedBatteryUnits: 0,
      paymentMode: "cash",
    });

    const cashWithTwoBatteries = buildSolarRecommendation({
      discomCode: "TGSPDCL",
      monthlyBillInr: 10000,
      selectedPanels: 10,
      selectedBatteryUnits: 2,
      paymentMode: "cash",
    });

    const loanWithTwoBatteries = buildSolarRecommendation({
      discomCode: "TGSPDCL",
      monthlyBillInr: 10000,
      selectedPanels: 10,
      selectedBatteryUnits: 2,
      paymentMode: "loan",
    });

    expect(cashWithTwoBatteries.estimateResult.grossInr).toBe(
      cashNoBattery.estimateResult.grossInr + 2 * SOLAR_ASSUMPTIONS.battery.unitPriceInr,
    );
    // Central PM Surya Ghar subsidy is unchanged by battery addition
    expect(cashWithTwoBatteries.estimateResult.potentialSubsidyInr).toBe(
      cashNoBattery.estimateResult.potentialSubsidyInr,
    );
    // Switching between cash and loan preserves panels, kW, and battery units
    expect(loanWithTwoBatteries.currentSelectedPanels).toBe(
      cashWithTwoBatteries.currentSelectedPanels,
    );
    expect(loanWithTwoBatteries.currentSelectedKw).toBe(cashWithTwoBatteries.currentSelectedKw);
    expect(loanWithTwoBatteries.batteryGuidance.selectedUnits).toBe(2);
  });

  it("provides explicit non-scheme prepayment disclosure when system exceeds SBI PM Surya Ghar 10 kW / ₹6L cap", () => {
    const aboveCapLoan = buildSolarRecommendation({
      discomCode: "TGSPDCL",
      monthlyBillInr: 25000,
      selectedPanels: 22, // 12.76 kW (> 10 kW cap)
      paymentMode: "loan",
    });

    expect(aboveCapLoan.financingAvailability.isSchemeEligible).toBe(false);
    expect(aboveCapLoan.financingAvailability.annualInterestRatePct).toBe(9.15);
    expect(aboveCapLoan.financingAvailability.prepaymentModeDisclosure).toContain(
      "Illustrative non-scheme financing scenario",
    );
    expect(aboveCapLoan.financingAvailability.prepaymentModeDisclosure).toContain("unadjusted EMI");
  });
});
