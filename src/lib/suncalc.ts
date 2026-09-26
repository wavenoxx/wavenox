/**
 * NOAA Solar Position Algorithm for Hyderabad (17.3850° N, 78.4867° E)
 * Computes solar altitude, azimuth, shadow projection, and instantaneous generation.
 */

export const HYDERABAD_COORDS = {
  latDeg: 17.385,
  lonDeg: 78.4867,
  timezoneOffsetHours: 5.5, // IST (UTC+5:30)
};

export interface SolarPosition {
  altitudeDeg: number; // angle above horizon (0° to 90°)
  azimuthDeg: number; // 0° = North, 90° = East, 180° = South, 270° = West
  isDaylight: boolean;
  shadowLengthRatio: number; // shadow length per meter of height (cotangent of altitude)
  shadowAngleDeg: number; // direction shadow falls
  generationKw: number; // for a 10 kWp N-type TOPCon system
}

const MONTH_DAYS = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];

// Month irradiance scaling for Hyderabad (derived from committed NASA POWER irradiance data)
const MONTH_IRRADIANCE_FACTOR = [
  0.92, // Jan
  0.98, // Feb
  1.05, // Mar (Pre-summer peak)
  1.08, // Apr
  1.06, // May
  0.88, // Jun (Monsoon onset)
  0.74, // Jul (Peak monsoon cloudiness)
  0.76, // Aug
  0.84, // Sep
  0.94, // Oct
  0.95, // Nov
  0.91, // Dec
];

const DEG_TO_RAD = Math.PI / 180;
const RAD_TO_DEG = 180 / Math.PI;

export function computeHyderabadSunPosition(monthIndex: number, hourOfDay: number): SolarPosition {
  // Clamp inputs
  const m = Math.max(0, Math.min(11, Math.floor(monthIndex)));
  const h = Math.max(0, Math.min(24, hourOfDay));

  // Day of year (15th of the month)
  const dayOfYear = MONTH_DAYS[m] + 15;

  // Fractional year in radians
  const gamma = (2 * Math.PI * (dayOfYear - 1)) / 365;

  // Equation of time in minutes
  const eqtime =
    229.18 *
    (0.000075 +
      0.001868 * Math.cos(gamma) -
      0.032077 * Math.sin(gamma) -
      0.014615 * Math.cos(2 * gamma) -
      0.040849 * Math.sin(2 * gamma));

  // Solar declination in radians
  const decl =
    0.006918 -
    0.399912 * Math.cos(gamma) +
    0.070257 * Math.sin(gamma) -
    0.006758 * Math.cos(2 * gamma) +
    0.000907 * Math.sin(2 * gamma) -
    0.002697 * Math.cos(3 * gamma) +
    0.00148 * Math.sin(3 * gamma);

  // Time offset in minutes
  const timeOffset =
    eqtime + 4 * HYDERABAD_COORDS.lonDeg - 60 * HYDERABAD_COORDS.timezoneOffsetHours;

  // True solar time in minutes
  const tstMinutes = h * 60 + timeOffset;

  // Hour angle in degrees
  let haDeg = tstMinutes / 4 - 180;
  if (haDeg < -180) haDeg += 360;
  if (haDeg > 180) haDeg -= 360;
  const haRad = haDeg * DEG_TO_RAD;

  const latRad = HYDERABAD_COORDS.latDeg * DEG_TO_RAD;

  // Solar zenith angle in radians
  const cosZenith =
    Math.sin(latRad) * Math.sin(decl) + Math.cos(latRad) * Math.cos(decl) * Math.cos(haRad);
  const zenithRad = Math.acos(Math.max(-1, Math.min(1, cosZenith)));
  const altitudeRad = Math.PI / 2 - zenithRad;
  const altitudeDeg = altitudeRad * RAD_TO_DEG;

  // Solar azimuth angle in radians
  const cosAzimuth =
    (Math.sin(decl) - Math.sin(latRad) * Math.cos(zenithRad)) /
    (Math.cos(latRad) * Math.sin(zenithRad));
  let azimuthRad = Math.acos(Math.max(-1, Math.min(1, cosAzimuth)));
  if (haDeg > 0) {
    azimuthRad = 2 * Math.PI - azimuthRad;
  }
  const azimuthDeg = (azimuthRad * RAD_TO_DEG + 180) % 360; // 0=N, 90=E, 180=S, 270=W

  const isDaylight = altitudeDeg > 0.5;

  // Shadow length per meter of vertical obstacle height
  let shadowLengthRatio = 0;
  if (isDaylight) {
    const clampedAlt = Math.max(5, altitudeDeg);
    shadowLengthRatio = 1 / Math.tan(clampedAlt * DEG_TO_RAD);
  }

  // Shadow angle is opposite to sun azimuth
  const shadowAngleDeg = (azimuthDeg + 180) % 360;

  // Instantaneous power generation estimate for 10 kWp array
  let generationKw = 0;
  if (isDaylight && altitudeDeg > 3) {
    const rawSin = Math.sin(altitudeRad);
    const systemSizeKw = 10.0;
    const weatherFactor = MONTH_IRRADIANCE_FACTOR[m];
    generationKw = Math.max(
      0,
      Math.min(10.0, systemSizeKw * Math.pow(rawSin, 1.1) * weatherFactor),
    );
  }

  return {
    altitudeDeg: Math.max(0, Math.round(altitudeDeg * 10) / 10),
    azimuthDeg: Math.round(azimuthDeg * 10) / 10,
    isDaylight,
    shadowLengthRatio: Math.min(12, Math.round(shadowLengthRatio * 100) / 100),
    shadowAngleDeg: Math.round(shadowAngleDeg * 10) / 10,
    generationKw: Math.round(generationKw * 10) / 10,
  };
}
