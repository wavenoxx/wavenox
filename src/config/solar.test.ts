import { describe, it, expect } from "vitest";
import {
  DISCOMS,
  SOLAR_ASSUMPTIONS,
  SYSTEM_TIERS,
  calculateGovtSubsidyInr,
  estimate,
} from "./solar";

describe("Solar Engine — Subsidy Calculations", () => {
  it("calculates correct residential subsidy curve", () => {
    // 1 kW = ₹30,000
    expect(calculateGovtSubsidyInr(1)).toBe(30000);
    // 2 kW = ₹60,000
    expect(calculateGovtSubsidyInr(2)).toBe(60000);
    // 3 kW = ₹78,000
    expect(calculateGovtSubsidyInr(3)).toBe(78000);
    // > 3 kW is capped at ₹78,000
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

describe("Solar Engine — estimate() Core Calculations", () => {
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
      }
    }
  });

  it("produces emiBelowBill === false for default studio configuration", () => {
    // Default studio: ₹12,000 bill, 24 panels (13.2 kW), 2 Omnigrid units (27 kWh)
    const result = estimate({
      monthlyBillInr: 12000,
      panels: 24,
      batteryUnits: 2,
    });

    expect(result.emiBelowBill).toBe(false);
    expect(result.monthlyEmiInr).toBeGreaterThan(12000);
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

  it("produces consistent recommendedKw across callers with identical bills and DISCOMs", () => {
    const res1 = estimate({ monthlyBillInr: 8000, discomCode: "TGSPDCL" });
    const res2 = estimate({ monthlyBillInr: 8000, discomCode: "TGSPDCL" });

    expect(res1.recommendedKw).toBe(res2.recommendedKw);
    expect(res1.recommendedPanels).toBe(res2.recommendedPanels);
    expect(res1.systemKw).toBe(res2.systemKw);
    expect(res1.annualGenKwh).toBe(res2.annualGenKwh);
  });

  it("scales tiers according to 550W panel specification", () => {
    expect(SOLAR_ASSUMPTIONS.panelWatt).toBe(550);

    for (const tier of SYSTEM_TIERS) {
      expect(tier.panels).toBe(Math.ceil((tier.targetKw * 1000) / 550));
      expect(tier.systemKw).toBe(Number(((tier.panels * 550) / 1000).toFixed(2)));
    }
  });

  it("correctly models 25-year compounding with degradation and tariff escalation", () => {
    const result = estimate({
      monthlyBillInr: 15000,
      discomCode: "BESCOM",
    });

    expect(result.savings25YearsInr).toBeGreaterThan(0);
    expect(result.netGain25YearsInr).toBe(result.savings25YearsInr - result.netInr);
  });
});
