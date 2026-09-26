import { describe, it, expect } from "vitest";
import { computeHyderabadSunPosition } from "./suncalc";

describe("Hyderabad SunCalc Engine", () => {
  it("computes reasonable solar altitude at midday", () => {
    // March 15 at 12:30 PM (equinox near noon in Hyderabad, lat ~17.4° N)
    const pos = computeHyderabadSunPosition(2, 12.5);
    expect(pos.isDaylight).toBe(true);
    // At equinox noon, sun altitude is approx 90 - 17.4 = 72.6°
    expect(pos.altitudeDeg).toBeGreaterThan(65);
    expect(pos.altitudeDeg).toBeLessThan(80);
    expect(pos.generationKw).toBeGreaterThan(8.0);
  });

  it("registers night conditions correctly", () => {
    // Midnight
    const night = computeHyderabadSunPosition(5, 0.0);
    expect(night.isDaylight).toBe(false);
    expect(night.altitudeDeg).toBe(0);
    expect(night.generationKw).toBe(0);
  });

  it("calculates shadow projection ratio", () => {
    // 8:00 AM low sun
    const morning = computeHyderabadSunPosition(3, 8.0);
    expect(morning.isDaylight).toBe(true);
    expect(morning.shadowLengthRatio).toBeGreaterThan(1.0);
  });
});
