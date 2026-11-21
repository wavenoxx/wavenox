/**
 * Pan-India Google Ads, GA4, GTM & Meta Conversion Tracking Module
 *
 * Completely environment-driven via VITE_* variables:
 *   - VITE_GOOGLE_ADS_ID            (e.g. "AW-XXXXXXXXXX")
 *   - VITE_GOOGLE_ADS_CONVERSION_LABEL (e.g. "AbCdEfGhIjK")
 *   - VITE_GA4_MEASUREMENT_ID       (e.g. "G-XXXXXXXXXX")
 *   - VITE_GTM_ID                   (e.g. "GTM-XXXXXXX")
 *   - VITE_META_PIXEL_ID            (e.g. "123456789012345")
 *
 * When no tracking IDs are configured (default local/CI build), zero external
 * scripts are injected and all tracking functions act as fast no-ops.
 * Live conversion events strictly enforce `!payload.isDemo` so simulation runs
 * never pollute ad platform bidding algorithms.
 */

export interface AnalyticsConfig {
  googleAdsId: string;
  googleAdsConversionLabel: string;
  ga4MeasurementId: string;
  gtmId: string;
  metaPixelId: string;
}

export interface LeadConversionPayload {
  referenceCode: string;
  source: string;
  propertyTier?: string;
  discomCode?: string;
  valueInr?: number;
  phone?: string;
  email?: string;
  isDemo?: boolean;
}

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
    gtag?: (...args: unknown[]) => void;
    fbq?: ((...args: unknown[]) => void) & {
      callMethod?: (...args: unknown[]) => void;
      queue?: unknown[];
      loaded?: boolean;
      version?: string;
      push?: (...args: unknown[]) => void;
    };
    _fbq?: Window["fbq"];
  }
}

const PRIVATE_ROUTE_REGEX = /^\/(ops|portal)(\/|$)/;

function cleanId(val: unknown): string {
  return typeof val === "string" ? val.trim() : "";
}

export function resolveAnalyticsConfig(
  env: Record<string, unknown> = import.meta.env as unknown as Record<string, unknown>,
): AnalyticsConfig {
  return {
    googleAdsId: cleanId(env.VITE_GOOGLE_ADS_ID),
    googleAdsConversionLabel: cleanId(env.VITE_GOOGLE_ADS_CONVERSION_LABEL),
    ga4MeasurementId: cleanId(env.VITE_GA4_MEASUREMENT_ID),
    gtmId: cleanId(env.VITE_GTM_ID),
    metaPixelId: cleanId(env.VITE_META_PIXEL_ID),
  };
}

export function isAdTrackingConfigured(
  config: AnalyticsConfig = resolveAnalyticsConfig(),
): boolean {
  return Boolean(
    config.googleAdsId || config.ga4MeasurementId || config.gtmId || config.metaPixelId,
  );
}

function isPrivatePath(pathname?: string): boolean {
  if (!pathname) return false;
  return PRIVATE_ROUTE_REGEX.test(pathname);
}

function normalizePhoneE164(phone?: string): string | undefined {
  if (!phone) return undefined;
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10 && /^[6-9]/.test(digits)) {
    return `+91${digits}`;
  }
  if (digits.length === 12 && digits.startsWith("91") && /^[6-9]/.test(digits.slice(2))) {
    return `+${digits}`;
  }
  return undefined;
}

export async function hashSha256Normalized(value: string): Promise<string | undefined> {
  const normalized = value.trim().toLowerCase();
  if (!normalized) return undefined;
  if (typeof globalThis.crypto?.subtle?.digest !== "function") {
    return undefined;
  }
  try {
    const encoded = new TextEncoder().encode(normalized);
    const digest = await globalThis.crypto.subtle.digest("SHA-256", encoded);
    return Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  } catch {
    return undefined;
  }
}

function appendExternalScriptOnce(id: string, src: string): void {
  if (typeof document === "undefined") return;
  if (document.getElementById(id)) return;
  const script = document.createElement("script");
  script.id = id;
  script.async = true;
  script.src = src;
  document.head.appendChild(script);
}

function ensureGtagQueue(): void {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  if (typeof window.gtag !== "function") {
    window.gtag = function gtag(...args: unknown[]) {
      window.dataLayer?.push(args as unknown as Record<string, unknown>);
    };
  }
}

let initializedKey = "";

export function initAdTracking(config: AnalyticsConfig = resolveAnalyticsConfig()): void {
  if (typeof window === "undefined" || typeof document === "undefined") return;
  if (isPrivatePath(window.location.pathname)) return;
  if (!isAdTrackingConfigured(config)) return;

  const signature = JSON.stringify(config);
  if (initializedKey === signature) return;
  initializedKey = signature;

  if (config.gtmId) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" } as Record<string, unknown>);
    appendExternalScriptOnce(
      "wnx-gtm-script",
      `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(config.gtmId)}`,
    );
  } else if (config.googleAdsId || config.ga4MeasurementId) {
    ensureGtagQueue();
    const primaryTagId = config.googleAdsId || config.ga4MeasurementId;
    window.gtag?.("js", new Date());
    if (config.googleAdsId) {
      window.gtag?.("config", config.googleAdsId, {
        allow_enhanced_conversions: true,
        send_page_view: false,
      });
    }
    if (config.ga4MeasurementId) {
      window.gtag?.("config", config.ga4MeasurementId, {
        send_page_view: false,
      });
    }
    appendExternalScriptOnce(
      "wnx-gtag-script",
      `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(primaryTagId)}`,
    );
  }

  if (config.metaPixelId) {
    if (typeof window.fbq !== "function") {
      const fbqFn = function (...args: unknown[]) {
        if (fbqFn.callMethod) {
          fbqFn.callMethod(...args);
        } else {
          fbqFn.queue?.push(args);
        }
      } as NonNullable<Window["fbq"]>;
      fbqFn.push = fbqFn;
      fbqFn.loaded = true;
      fbqFn.version = "2.0";
      fbqFn.queue = [];
      window.fbq = fbqFn;
      if (!window._fbq) window._fbq = fbqFn;
    }
    appendExternalScriptOnce(
      "wnx-meta-pixel-script",
      "https://connect.facebook.net/en_US/fbevents.js",
    );
    window.fbq?.("init", config.metaPixelId);
  }
}

export function trackPageView(
  pathname: string,
  config: AnalyticsConfig = resolveAnalyticsConfig(),
): void {
  if (typeof window === "undefined") return;
  if (isPrivatePath(pathname)) return;
  if (!isAdTrackingConfigured(config)) return;

  initAdTracking(config);

  if (config.ga4MeasurementId && typeof window.gtag === "function") {
    window.gtag("event", "page_view", {
      page_path: pathname,
      page_location: window.location.href,
      page_title: typeof document !== "undefined" ? document.title : "",
    });
  } else if (config.gtmId && Array.isArray(window.dataLayer)) {
    window.dataLayer.push({
      event: "virtual_page_view",
      page_path: pathname,
      page_location: window.location.href,
    });
  }

  if (config.metaPixelId && typeof window.fbq === "function") {
    window.fbq("track", "PageView");
  }
}

export async function trackLeadConversion(
  payload: LeadConversionPayload,
  config: AnalyticsConfig = resolveAnalyticsConfig(),
): Promise<boolean> {
  if (typeof window === "undefined") return false;
  if (payload.isDemo) return false;
  if (isPrivatePath(window.location.pathname)) return false;
  if (!isAdTrackingConfigured(config)) return false;

  initAdTracking(config);

  const value =
    typeof payload.valueInr === "number" &&
    Number.isFinite(payload.valueInr) &&
    payload.valueInr > 0
      ? Math.round(payload.valueInr)
      : 1;

  // Build Enhanced Conversions hashed user_data when available
  const e164Phone = normalizePhoneE164(payload.phone);
  const [sha256Phone, sha256Email] = await Promise.all([
    e164Phone ? hashSha256Normalized(e164Phone) : Promise.resolve(undefined),
    payload.email ? hashSha256Normalized(payload.email) : Promise.resolve(undefined),
  ]);

  const userData: Record<string, string> = {};
  if (sha256Phone) userData.sha256_phone_number = sha256Phone;
  if (sha256Email) userData.sha256_email_address = sha256Email;

  if (typeof window.gtag === "function") {
    if (Object.keys(userData).length > 0 && config.googleAdsId) {
      window.gtag("set", "user_data", userData);
    }

    if (config.googleAdsId && config.googleAdsConversionLabel) {
      window.gtag("event", "conversion", {
        send_to: `${config.googleAdsId}/${config.googleAdsConversionLabel}`,
        value,
        currency: "INR",
        transaction_id: payload.referenceCode,
      });
    }

    if (config.ga4MeasurementId) {
      window.gtag("event", "generate_lead", {
        currency: "INR",
        value,
        lead_source: payload.source,
        property_tier: payload.propertyTier || "unknown",
        discom_code: payload.discomCode || "UNSPECIFIED",
        transaction_id: payload.referenceCode,
      });
    }
  } else if (config.gtmId && Array.isArray(window.dataLayer)) {
    window.dataLayer.push({
      event: "generate_lead",
      currency: "INR",
      value,
      lead_source: payload.source,
      property_tier: payload.propertyTier || "unknown",
      discom_code: payload.discomCode || "UNSPECIFIED",
      transaction_id: payload.referenceCode,
      ...(Object.keys(userData).length > 0 ? { user_data: userData } : {}),
    });
  }

  if (config.metaPixelId && typeof window.fbq === "function") {
    window.fbq("track", "Lead", {
      value,
      currency: "INR",
      content_name: payload.source,
      content_category: payload.propertyTier || "solar",
    });
  }

  return true;
}

export function trackContactClick(
  channel: "phone" | "whatsapp",
  location: string,
  config: AnalyticsConfig = resolveAnalyticsConfig(),
): void {
  if (typeof window === "undefined") return;
  if (isPrivatePath(window.location.pathname)) return;
  if (!isAdTrackingConfigured(config)) return;

  initAdTracking(config);

  if (typeof window.gtag === "function") {
    window.gtag("event", "contact_click", {
      method: channel,
      link_location: location,
    });
  } else if (config.gtmId && Array.isArray(window.dataLayer)) {
    window.dataLayer.push({
      event: "contact_click",
      method: channel,
      link_location: location,
    });
  }

  if (config.metaPixelId && typeof window.fbq === "function") {
    window.fbq("track", "Contact", {
      content_name: `${channel}:${location}`,
    });
  }
}

export function resetAdTrackingForTests(): void {
  initializedKey = "";
}
