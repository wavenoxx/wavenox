/**
 * Telemetry and marketing attribution utility.
 * Captures UTM query parameters, landing page URL, and document referrer into sessionStorage.
 */

export interface AttributionData {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  landing_url?: string;
  referrer?: string;
}

const STORAGE_KEY = "wavenox_attribution_v1";

/**
 * Initializes and persists attribution parameters into sessionStorage on initial entry.
 * Safe to invoke multiple times; retains first-touch attribution within the session.
 */
export function initTelemetry(): void {
  if (typeof window === "undefined" || !window.sessionStorage) {
    return;
  }

  try {
    const existing = window.sessionStorage.getItem(STORAGE_KEY);
    if (existing) {
      return; // Preserve first-touch session attribution
    }

    const searchParams = new URLSearchParams(window.location.search);
    const attribution: AttributionData = {};

    const utmSource = searchParams.get("utm_source");
    const utmMedium = searchParams.get("utm_medium");
    const utmCampaign = searchParams.get("utm_campaign");
    const utmTerm = searchParams.get("utm_term");
    const utmContent = searchParams.get("utm_content");

    if (utmSource) attribution.utm_source = utmSource;
    if (utmMedium) attribution.utm_medium = utmMedium;
    if (utmCampaign) attribution.utm_campaign = utmCampaign;
    if (utmTerm) attribution.utm_term = utmTerm;
    if (utmContent) attribution.utm_content = utmContent;

    attribution.landing_url = window.location.href;

    if (document.referrer && document.referrer.length > 0) {
      attribution.referrer = document.referrer;
    }

    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(attribution));
  } catch (e) {
    console.debug("[telemetry] Unable to access sessionStorage:", e);
  }
}

/**
 * Retrieves stored attribution telemetry data for lead submissions.
 */
export function getStoredTelemetry(): AttributionData {
  if (typeof window === "undefined" || !window.sessionStorage) {
    return {};
  }

  try {
    const stored = window.sessionStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as AttributionData;
    }
  } catch (e) {
    console.debug("[telemetry] Unable to read stored attribution:", e);
  }

  return {};
}
