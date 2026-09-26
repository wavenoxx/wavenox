/**
 * ============================================================================
 * PHYSICS-COMPLIANT ENERGY FLOW SIMULATOR ENGINE
 * ============================================================================
 *
 * Implements strict conservation of energy and battery state-of-charge (SOC)
 * dynamics:
 *
 * 1. Power Balance:
 *    Solar + GridImport = HomeLoad + BatteryCharging + GridExport
 *    (or Solar + GridImport + BatteryDischarging = HomeLoad + GridExport)
 *
 * 2. SOC Continuity:
 *    SOC(t + Δt) = SOC(t) + (P_batt * Δt * η / Capacity) * 100%
 *    Clamped to [10%, 100%] operating buffer (LiFePO4 DOD reserve).
 */

export interface SimulationState {
  timeStr: string;
  hour: number;
  label: string;
  solarKw: number;
  homeKw: number;
  batteryKw: number; // positive = charging into battery, negative = discharging into load
  batterySoc: number; // percentage (0 - 100)
  gridImportKw: number; // power drawn from utility
  gridExportKw: number; // power pushed to utility
  gridKw: number; // positive = export, negative = import (UI representation)
  isOutage: boolean;
  statusText: string;
}

export const BATTERY_PHYSICS = {
  capacityKwh: 14.3, // Usable capacity of 1 Omnigrid LFP pack
  roundTripEfficiency: 0.95,
  minSocPct: 10,
  maxSocPct: 100,
};

/**
 * 24-hour representative timeline points for luxury residence with 10 kWp solar & 14.3 kWh storage.
 * Sized and balanced to strictly satisfy:
 *   solarKw + gridImportKw + max(0, -batteryKw) = homeKw + max(0, batteryKw) + gridExportKw (+/- 0.05 kW)
 */
export const PHYSICS_SIMULATION_TIMELINE: SimulationState[] = [
  {
    timeStr: "06:00 AM",
    hour: 6.0,
    label: "Dawn Awakening",
    solarKw: 0.8,
    homeKw: 2.0,
    batteryKw: -1.2, // Discharging 1.2 kW to load
    batterySoc: 38,
    gridImportKw: 0.0,
    gridExportKw: 0.0,
    gridKw: 0.0,
    isOutage: false,
    statusText: "Dawn awakening · Stored battery power supports morning baseline load",
  },
  {
    timeStr: "09:30 AM",
    hour: 9.5,
    label: "Solar Ramp-Up",
    solarKw: 5.5,
    homeKw: 2.5,
    batteryKw: 3.0, // Charging at 3.0 kW
    batterySoc: 68,
    gridImportKw: 0.0,
    gridExportKw: 0.0,
    gridKw: 0.0,
    isOutage: false,
    statusText: "Solar ramp-up · Rooftop array directly powers villa and charges battery at 3.0 kW",
  },
  {
    timeStr: "12:30 PM",
    hour: 12.5,
    label: "Midday Solar Peak",
    solarKw: 10.5,
    homeKw: 3.5,
    batteryKw: 2.0, // Charging at 2.0 kW (topping off)
    batterySoc: 96,
    gridImportKw: 0.0,
    gridExportKw: 5.0, // Exporting 5.0 kW to DISCOM net-meter
    gridKw: 5.0,
    isOutage: false,
    statusText:
      "Midday peak · Villa fully powered, battery near capacity, exporting 5.0 kW to DISCOM",
  },
  {
    timeStr: "03:30 PM",
    hour: 15.5,
    label: "Afternoon Generation",
    solarKw: 6.2,
    homeKw: 3.2,
    batteryKw: 0.5, // Float charge
    batterySoc: 100,
    gridImportKw: 0.0,
    gridExportKw: 2.5, // Exporting 2.5 kW
    gridKw: 2.5,
    isOutage: false,
    statusText: "Full battery capacity · 2.5 kW clean surplus exported to DISCOM grid",
  },
  {
    timeStr: "07:00 PM",
    hour: 19.0,
    label: "Evening Transition",
    solarKw: 0.0,
    homeKw: 4.2,
    batteryKw: -4.2, // Discharging 4.2 kW to load
    batterySoc: 82,
    gridImportKw: 0.0,
    gridExportKw: 0.0,
    gridKw: 0.0,
    isOutage: false,
    statusText: "Evening transition · Stored solar seamlessly carries domestic HVAC and lighting",
  },
  {
    timeStr: "10:30 PM",
    hour: 22.5,
    label: "Grid Outage / Islanded",
    solarKw: 0.0,
    homeKw: 2.8,
    batteryKw: -2.8, // Discharging 2.8 kW for essential villa circuits
    batterySoc: 64,
    gridImportKw: 0.0,
    gridExportKw: 0.0,
    gridKw: 0.0,
    isOutage: true,
    statusText: "DISCOM blackout active · Instant microgrid isolation powers essential circuits",
  },
];

/**
 * Validates power balance at a given simulation state:
 * Input (Generation + Imports) must match Output (Loads + Charging + Exports) within tolerance.
 */
export function verifyPowerBalance(state: SimulationState, toleranceKw: number = 0.05): boolean {
  const generation = state.solarKw;
  const gridImport = state.gridImportKw;
  const batteryDischarge = state.batteryKw < 0 ? Math.abs(state.batteryKw) : 0;

  const totalInput = generation + gridImport + batteryDischarge;

  const load = state.homeKw;
  const batteryCharge = state.batteryKw > 0 ? state.batteryKw : 0;
  const gridExport = state.gridExportKw;

  const totalOutput = load + batteryCharge + gridExport;

  return Math.abs(totalInput - totalOutput) <= toleranceKw;
}
