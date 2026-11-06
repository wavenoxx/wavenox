/**
 * Privacy-First Marketing Attribution & Telemetry Engine (Step 5)
 *
 * Captures and sanitizes First-Touch, Last-Touch, and Conversion-Touch campaign metadata
 * in sessionStorage without third-party cookies, fingerprinting, or PII persistence.
 */

export const ATTRIBUTION_CHANNELS = [
  "paid_search",
  "paid_social",
  "organic_search",
  "referral",
  "direct",
  "unknown",
] as const;

export type AttributionChannel = (typeof ATTRIBUTION_CHANNELS)[number];

export const SUPPORTED_CLICK_ID_TYPES = ["gclid", "gbraid", "wbraid", "fbclid"] as const;
export type ClickIdType = (typeof SUPPORTED_CLICK_ID_TYPES)[number];

export interface TouchPointSnapshot {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  click_id_type?: ClickIdType;
  click_id_value?: string;
  landing_path?: string;
  referrer_domain?: string;
  channel: AttributionChannel;
  captured_at: string;
}

export interface AttributionData {
  // Conversion-touch / active campaign fields (backward-compatible with Step 1-4)
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  landing_url?: string;
  referrer?: string;

  // Step 5 Multi-Touch & Channel Classification fields
  first_touch_source?: string;
  first_touch_medium?: string;
  first_touch_campaign?: string;
  first_touch_landing_path?: string;
  first_touch_referrer_domain?: string;
  first_touch_at?: string;

  last_touch_source?: string;
  last_touch_medium?: string;
  last_touch_campaign?: string;
  last_touch_landing_path?: string;
  last_touch_referrer_domain?: string;
  last_touch_at?: string;

  conversion_path?: string;
  attribution_channel?: AttributionChannel;
  click_id_type?: ClickIdType;
  click_id_value?: string;
}

const STORAGE_KEY_V2 = "wavenox_attribution_v2";
const LEGACY_STORAGE_KEY_V1 = "wavenox_attribution_v1";

const ALLOWLISTED_QUERY_PARAMS = new Set([
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "gclid",
  "gbraid",
  "wbraid",
  "fbclid",
]);

const SENSITIVE_PARAM_KEY_REGEX =
  /(email|mail|phone|mobile|tel|whatsapp|name|token|code|auth|pass|secret|key|reset|pin|usc|service|aadhaar|pan|account|address)/i;

// Detects email addresses or 10+ digit phone sequences inside parameter values
const EMAIL_PATTERN = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
const PHONE_DIGIT_RUN_PATTERN = /(?:\+?\d[\d\s().-]{8,}\d)/;

const MAX_PARAM_VALUE_LENGTH = 150;
const MAX_URL_PATH_LENGTH = 255;

const SEARCH_ENGINE_DOMAINS = [
  "google.",
  "bing.com",
  "duckduckgo.com",
  "search.yahoo.",
  "yahoo.com",
  "ecosia.org",
  "baidu.com",
  "yandex.",
];

const SOCIAL_SOURCES = new Set([
  "facebook",
  "fb",
  "instagram",
  "ig",
  "meta",
  "linkedin",
  "youtube",
  "yt",
  "twitter",
  "x",
  "t.co",
]);

const SEARCH_SOURCES = new Set([
  "google",
  "adwords",
  "google_ads",
  "googleads",
  "bing",
  "microsoft",
  "duckduckgo",
  "yahoo",
  "search",
]);

const PAID_SEARCH_MEDIUMS = new Set(["cpc", "ppc", "paidsearch", "paid_search", "sem"]);
const PAID_SOCIAL_MEDIUMS = new Set([
  "paid_social",
  "paidsocial",
  "social_paid",
  "cpm",
  "promoted",
  " boosted",
]);
const GENERIC_PAID_MEDIUMS = new Set(["paid", "ads", "ad", "display", "banner", "cpv"]);

/**
 * Validates and sanitizes an individual UTM or click-ID parameter value.
 * Returns undefined if empty, oversized (>150 chars), or containing PII (email/phone).
 */
export function sanitizeAttributionValue(
  rawValue: string | null | undefined,
  maxLength = MAX_PARAM_VALUE_LENGTH,
): string | undefined {
  if (typeof rawValue !== "string") return undefined;
  let decoded = rawValue.trim();
  if (!decoded) return undefined;

  try {
    decoded = decodeURIComponent(decoded).trim();
  } catch {
    // Keep original trimmed string if malformed percent-encoding
  }

  if (!decoded || decoded.length > maxLength) {
    return undefined;
  }

  // Reject values containing email addresses or phone numbers
  if (EMAIL_PATTERN.test(decoded)) {
    return undefined;
  }
  const digitsOnly = decoded.replace(/\D/g, "");
  if (digitsOnly.length >= 10 && PHONE_DIGIT_RUN_PATTERN.test(decoded)) {
    return undefined;
  }

  // Strip control characters and HTML/script brackets; allow alphanumeric, -, _, ., /, :, +, space
  const cleaned = decoded
    .replace(/[<>"'`\\;\r\n\t]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned || cleaned.length > maxLength) {
    return undefined;
  }

  return cleaned;
}

/**
 * Normalizes a source or medium label to lowercase snake/dash format for consistent reporting.
 */
export function normalizeAttributionToken(rawValue: string | null | undefined): string | undefined {
  const sanitized = sanitizeAttributionValue(rawValue, 100);
  if (!sanitized) return undefined;
  return sanitized.toLowerCase().replace(/\s+/g, "_");
}

export interface SanitizedUrlResult {
  cleanLandingUrl: string;
  landingPath: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  click_id_type?: ClickIdType;
  click_id_value?: string;
  hasCampaignParameters: boolean;
}

/**
 * Sanitizes a full landing URL:
 * - Strips all non-allowlisted query parameters (email, phone, name, tokens, bill, etc.).
 * - Strips any allowlisted parameter whose value contains PII or exceeds 150 chars.
 * - Preserves only clean pathname + validated campaign query parameters.
 */
export function sanitizeAttributionUrl(
  rawUrl: string | null | undefined,
): SanitizedUrlResult | null {
  if (!rawUrl || typeof rawUrl !== "string") return null;
  const trimmed = rawUrl.trim();
  if (!trimmed) return null;

  try {
    const parsed = new URL(trimmed, "https://wavenox.in");
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return null;
    }

    // Sanitize pathname and strip any embedded email/phone in path segments
    let landingPath = parsed.pathname || "/";
    if (EMAIL_PATTERN.test(landingPath) || /\d{10,}/.test(landingPath)) {
      landingPath = "/";
    }
    if (landingPath.length > MAX_URL_PATH_LENGTH) {
      landingPath = landingPath.slice(0, MAX_URL_PATH_LENGTH);
    }

    const keptParams = new URLSearchParams();
    let utm_source: string | undefined;
    let utm_medium: string | undefined;
    let utm_campaign: string | undefined;
    let utm_term: string | undefined;
    let utm_content: string | undefined;
    let click_id_type: ClickIdType | undefined;
    let click_id_value: string | undefined;

    for (const [rawKey, rawVal] of parsed.searchParams.entries()) {
      const key = rawKey.trim().toLowerCase();
      if (!ALLOWLISTED_QUERY_PARAMS.has(key) || SENSITIVE_PARAM_KEY_REGEX.test(key)) {
        continue;
      }

      if (key === "utm_source") {
        const val = normalizeAttributionToken(rawVal);
        if (val) {
          utm_source = val;
          keptParams.set(key, val);
        }
      } else if (key === "utm_medium") {
        const val = normalizeAttributionToken(rawVal);
        if (val) {
          utm_medium = val;
          keptParams.set(key, val);
        }
      } else if (key === "utm_campaign") {
        const val = sanitizeAttributionValue(rawVal, MAX_PARAM_VALUE_LENGTH);
        if (val) {
          utm_campaign = val;
          keptParams.set(key, val);
        }
      } else if (key === "utm_term") {
        const val = sanitizeAttributionValue(rawVal, MAX_PARAM_VALUE_LENGTH);
        if (val) {
          utm_term = val;
          keptParams.set(key, val);
        }
      } else if (key === "utm_content") {
        const val = sanitizeAttributionValue(rawVal, MAX_PARAM_VALUE_LENGTH);
        if (val) {
          utm_content = val;
          keptParams.set(key, val);
        }
      } else if (
        (key === "gclid" || key === "gbraid" || key === "wbraid" || key === "fbclid") &&
        !click_id_type
      ) {
        // Click IDs may only contain safe token characters [A-Za-z0-9._-]
        const cleanClick = sanitizeAttributionValue(rawVal, MAX_PARAM_VALUE_LENGTH);
        if (cleanClick && /^[A-Za-z0-9._-]+$/.test(cleanClick)) {
          click_id_type = key as ClickIdType;
          click_id_value = cleanClick;
          keptParams.set(key, cleanClick);
        }
      }
    }

    const queryString = keptParams.toString();
    const cleanLandingUrl = queryString ? `${landingPath}?${queryString}` : landingPath;
    const hasCampaignParameters = Boolean(
      utm_source || utm_medium || utm_campaign || utm_term || utm_content || click_id_type,
    );

    return {
      cleanLandingUrl,
      landingPath,
      utm_source,
      utm_medium,
      utm_campaign,
      utm_term,
      utm_content,
      click_id_type,
      click_id_value,
      hasCampaignParameters,
    };
  } catch {
    return null;
  }
}

export interface SanitizedReferrerResult {
  cleanReferrer: string;
  referrerDomain: string;
}

/**
 * Sanitizes document.referrer:
 * - Ignores same-origin referrers.
 * - Strips query parameters, hash fragments, and credentials so PII in referrer query strings is never stored.
 */
export function sanitizeReferrer(
  rawReferrer: string | null | undefined,
  currentOrigin?: string,
): SanitizedReferrerResult | null {
  if (!rawReferrer || typeof rawReferrer !== "string") return null;
  const trimmed = rawReferrer.trim();
  if (!trimmed) return null;

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return null;
    }

    const refHost = parsed.hostname.toLowerCase().replace(/^www\./, "");
    if (!refHost) return null;

    if (currentOrigin) {
      try {
        const currentHost = new URL(currentOrigin).hostname.toLowerCase().replace(/^www\./, "");
        if (currentHost === refHost) {
          return null; // Ignore internal same-site navigation
        }
      } catch {
        // ignore invalid currentOrigin
      }
    }

    // Never treat wavenox.in or localhost as external referrer
    if (refHost === "wavenox.in" || refHost === "localhost" || refHost === "127.0.0.1") {
      return null;
    }

    const cleanPath =
      parsed.pathname && parsed.pathname !== "/" && !EMAIL_PATTERN.test(parsed.pathname)
        ? parsed.pathname.slice(0, 120)
        : "";
    const cleanReferrer = `${parsed.protocol}//${refHost}${cleanPath}`;

    return {
      cleanReferrer,
      referrerDomain: refHost,
    };
  } catch {
    return null;
  }
}

function isSearchEngineDomain(domain: string | undefined): boolean {
  if (!domain) return false;
  const lower = domain.toLowerCase();
  return SEARCH_ENGINE_DOMAINS.some((d) => lower.includes(d));
}

function isSocialSourceOrDomain(value: string | undefined): boolean {
  if (!value) return false;
  const lower = value.toLowerCase();
  if (SOCIAL_SOURCES.has(lower)) return true;
  return (
    lower.includes("facebook.") ||
    lower.includes("instagram.") ||
    lower.includes("linkedin.") ||
    lower.includes("youtube.") ||
    lower.includes("twitter.") ||
    lower.includes("x.com") ||
    lower === "t.co"
  );
}

/**
 * Deterministic Marketing Attribution Channel Classifier.
 *
 * Rules:
 * 1. `paid_search`: Paid search medium (`cpc`, `ppc`, `paidsearch`, `paid_search`, `sem`) OR Google Ads click ID (`gclid`, `gbraid`, `wbraid`), OR generic paid medium with a search engine source.
 * 2. `paid_social`: Paid social medium (`paid_social`, `paidsocial`, `cpm`, `promoted`) OR Meta click ID (`fbclid`), OR paid medium (`cpc`/`ppc`/`paid`) with a social network source.
 * 3. `organic_search`: `utm_medium=organic` OR search engine referrer (`google`, `bing`, `duckduckgo`, `yahoo`) when NO paid medium or click ID is present.
 * 4. `referral`: `utm_medium` in (`referral`, `social`, `email`, `partner`, `affiliate`) OR external non-search referrer domain (including organic social links without paid medium/click ID).
 * 5. `direct`: Explicit browser session with a landing path and zero UTM parameters, zero click IDs, and zero external referrer.
 * 6. `unknown`: Missing/unclassified telemetry or ambiguous UTM tags that do not match a deterministic channel rule.
 */
export function classifyAttributionChannel(input: {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  click_id_type?: ClickIdType;
  referrer_domain?: string;
  hasLandingContext?: boolean;
}): AttributionChannel {
  const source = input.utm_source?.trim().toLowerCase();
  const medium = input.utm_medium?.trim().toLowerCase();
  const clickId = input.click_id_type;
  const refDomain = input.referrer_domain?.trim().toLowerCase();

  // 1. Click IDs provide deterministic paid channel signals
  if (clickId === "gclid" || clickId === "gbraid" || clickId === "wbraid") {
    return "paid_search";
  }
  if (clickId === "fbclid") {
    return "paid_social";
  }

  // 2. Explicit UTM medium rules
  if (medium) {
    if (PAID_SOCIAL_MEDIUMS.has(medium)) {
      return "paid_social";
    }
    if (PAID_SEARCH_MEDIUMS.has(medium)) {
      if (isSocialSourceOrDomain(source) || isSocialSourceOrDomain(refDomain)) {
        return "paid_social";
      }
      return "paid_search";
    }
    if (GENERIC_PAID_MEDIUMS.has(medium)) {
      if (isSocialSourceOrDomain(source) || isSocialSourceOrDomain(refDomain)) {
        return "paid_social";
      }
      if (source && SEARCH_SOURCES.has(source)) {
        return "paid_search";
      }
      return "unknown";
    }
    if (medium === "organic" || medium === "organic_search") {
      return "organic_search";
    }
    if (
      medium === "referral" ||
      medium === "social" ||
      medium === "organic_social" ||
      medium === "email" ||
      medium === "partner" ||
      medium === "affiliate"
    ) {
      return "referral";
    }
    // Unrecognized custom medium: do not guess
    return "unknown";
  }

  // 3. UTM source present without UTM medium: do not guess paid!
  if (source) {
    if (source === "direct" || source === "(direct)") {
      return "direct";
    }
    // Without a medium, we cannot know if a bare utm_source=google or utm_source=facebook was paid or organic/referral
    return "unknown";
  }

  // 4. External referrer without UTM parameters or click IDs
  if (refDomain) {
    if (isSearchEngineDomain(refDomain)) {
      return "organic_search";
    }
    return "referral";
  }

  // 5. No UTMs, no click ID, no external referrer
  if (input.hasLandingContext) {
    return "direct";
  }

  return "unknown";
}

interface StoredAttributionStateV2 {
  firstTouch: TouchPointSnapshot;
  lastTouch: TouchPointSnapshot;
  conversionPath: string;
  initialLandingUrl: string;
  initialReferrer?: string;
}

function buildAttributionDataFromState(state: StoredAttributionStateV2): AttributionData {
  const activeTouch = state.lastTouch;
  const firstTouch = state.firstTouch;

  return {
    utm_source: activeTouch.utm_source,
    utm_medium: activeTouch.utm_medium,
    utm_campaign: activeTouch.utm_campaign,
    utm_term: activeTouch.utm_term,
    utm_content: activeTouch.utm_content,
    landing_url: state.initialLandingUrl,
    referrer: state.initialReferrer,

    first_touch_source: firstTouch.utm_source,
    first_touch_medium: firstTouch.utm_medium,
    first_touch_campaign: firstTouch.utm_campaign,
    first_touch_landing_path: firstTouch.landing_path,
    first_touch_referrer_domain: firstTouch.referrer_domain,
    first_touch_at: firstTouch.captured_at,

    last_touch_source: activeTouch.utm_source,
    last_touch_medium: activeTouch.utm_medium,
    last_touch_campaign: activeTouch.utm_campaign,
    last_touch_landing_path: activeTouch.landing_path,
    last_touch_referrer_domain: activeTouch.referrer_domain,
    last_touch_at: activeTouch.captured_at,

    conversion_path: state.conversionPath,
    attribution_channel: activeTouch.channel,
    click_id_type: activeTouch.click_id_type,
    click_id_value: activeTouch.click_id_value,
  };
}

/**
 * Records initial entry or subsequent navigation into sessionStorage.
 * - First touch is captured once per session and NEVER overwritten.
 * - Last touch is updated ONLY when a subsequent navigation contains explicit campaign parameters (UTMs or click IDs).
 * - Direct navigations or internal SPA transitions never overwrite a prior valid campaign touch.
 */
export function recordTelemetryNavigation(
  rawUrl?: string,
  rawReferrer?: string,
  nowIso: string = new Date().toISOString(),
): AttributionData {
  if (typeof window === "undefined" || !window.sessionStorage) {
    return {};
  }

  try {
    const activeUrl = rawUrl ?? window.location.href;
    const activeRef = rawReferrer ?? document.referrer;
    const currentOrigin = window.location.origin;

    const sanitizedUrl = sanitizeAttributionUrl(activeUrl);
    if (!sanitizedUrl) {
      return getStoredTelemetry();
    }

    const sanitizedRef = sanitizeReferrer(activeRef, currentOrigin);
    const existingRaw = window.sessionStorage.getItem(STORAGE_KEY_V2);

    if (!existingRaw) {
      const channel = classifyAttributionChannel({
        utm_source: sanitizedUrl.utm_source,
        utm_medium: sanitizedUrl.utm_medium,
        utm_campaign: sanitizedUrl.utm_campaign,
        click_id_type: sanitizedUrl.click_id_type,
        referrer_domain: sanitizedRef?.referrerDomain,
        hasLandingContext: true,
      });

      const initialTouch: TouchPointSnapshot = {
        utm_source: sanitizedUrl.utm_source,
        utm_medium: sanitizedUrl.utm_medium,
        utm_campaign: sanitizedUrl.utm_campaign,
        utm_term: sanitizedUrl.utm_term,
        utm_content: sanitizedUrl.utm_content,
        click_id_type: sanitizedUrl.click_id_type,
        click_id_value: sanitizedUrl.click_id_value,
        landing_path: sanitizedUrl.landingPath,
        referrer_domain: sanitizedRef?.referrerDomain,
        channel,
        captured_at: nowIso,
      };

      const initialState: StoredAttributionStateV2 = {
        firstTouch: initialTouch,
        lastTouch: initialTouch,
        conversionPath: sanitizedUrl.landingPath,
        initialLandingUrl: sanitizedUrl.cleanLandingUrl,
        initialReferrer: sanitizedRef?.cleanReferrer,
      };

      window.sessionStorage.setItem(STORAGE_KEY_V2, JSON.stringify(initialState));
      const output = buildAttributionDataFromState(initialState);
      window.sessionStorage.setItem(LEGACY_STORAGE_KEY_V1, JSON.stringify(output));
      return output;
    }

    const parsedState = JSON.parse(existingRaw) as StoredAttributionStateV2;
    let updatedLastTouch = parsedState.lastTouch;

    // Only update Last Touch when the new URL carries explicit campaign parameters (UTMs or click IDs)
    if (sanitizedUrl.hasCampaignParameters) {
      const newChannel = classifyAttributionChannel({
        utm_source: sanitizedUrl.utm_source,
        utm_medium: sanitizedUrl.utm_medium,
        utm_campaign: sanitizedUrl.utm_campaign,
        click_id_type: sanitizedUrl.click_id_type,
        referrer_domain: sanitizedRef?.referrerDomain ?? parsedState.lastTouch.referrer_domain,
        hasLandingContext: true,
      });

      updatedLastTouch = {
        utm_source: sanitizedUrl.utm_source,
        utm_medium: sanitizedUrl.utm_medium,
        utm_campaign: sanitizedUrl.utm_campaign,
        utm_term: sanitizedUrl.utm_term,
        utm_content: sanitizedUrl.utm_content,
        click_id_type: sanitizedUrl.click_id_type,
        click_id_value: sanitizedUrl.click_id_value,
        landing_path: sanitizedUrl.landingPath,
        referrer_domain: sanitizedRef?.referrerDomain ?? parsedState.lastTouch.referrer_domain,
        channel: newChannel,
        captured_at: nowIso,
      };
    }

    const nextState: StoredAttributionStateV2 = {
      ...parsedState,
      firstTouch: parsedState.firstTouch, // Strictly immutable first touch
      lastTouch: updatedLastTouch,
      conversionPath: sanitizedUrl.landingPath,
    };

    window.sessionStorage.setItem(STORAGE_KEY_V2, JSON.stringify(nextState));
    const output = buildAttributionDataFromState(nextState);
    window.sessionStorage.setItem(LEGACY_STORAGE_KEY_V1, JSON.stringify(output));
    return output;
  } catch (e) {
    console.debug("[telemetry] Unable to access sessionStorage:", e);
    return {};
  }
}

/**
 * Initializes and persists attribution parameters into sessionStorage.
 * Safe to invoke on initial load and subsequent SPA navigations.
 */
export function initTelemetry(): void {
  recordTelemetryNavigation();
}

/**
 * Retrieves stored attribution telemetry data for lead submissions.
 * Automatically updates `conversion_path` to the current route pathname if in a browser context.
 */
export function getStoredTelemetry(): AttributionData {
  if (typeof window === "undefined" || !window.sessionStorage) {
    return {};
  }

  try {
    const storedV2 = window.sessionStorage.getItem(STORAGE_KEY_V2);
    if (storedV2) {
      const parsed = JSON.parse(storedV2) as StoredAttributionStateV2;
      const currentSanitized = sanitizeAttributionUrl(window.location.href);
      if (currentSanitized?.landingPath) {
        parsed.conversionPath = currentSanitized.landingPath;
      }
      return buildAttributionDataFromState(parsed);
    }

    // Legacy v1 fallback compatibility (sanitized before returning)
    const storedV1 = window.sessionStorage.getItem(LEGACY_STORAGE_KEY_V1);
    if (storedV1) {
      const legacy = JSON.parse(storedV1) as AttributionData;
      return sanitizeIncomingAttributionPayload(legacy);
    }
  } catch (e) {
    console.debug("[telemetry] Unable to read stored attribution:", e);
  }

  return {};
}

/**
 * Server-safe sanitizer for attribution fields submitted in a lead payload.
 * Never throws: malformed or oversized attribution fields are stripped or degraded to 'unknown'
 * so that attribution issues never block a valid consented customer consultation.
 */
export function sanitizeIncomingAttributionPayload(raw: Partial<AttributionData>): AttributionData {
  const sanitizedLanding = sanitizeAttributionUrl(raw.landing_url);
  const sanitizedRef = sanitizeReferrer(raw.referrer);

  const utm_source = normalizeAttributionToken(raw.utm_source) ?? sanitizedLanding?.utm_source;
  const utm_medium = normalizeAttributionToken(raw.utm_medium) ?? sanitizedLanding?.utm_medium;
  const utm_campaign =
    sanitizeAttributionValue(raw.utm_campaign, MAX_PARAM_VALUE_LENGTH) ??
    sanitizedLanding?.utm_campaign;
  const utm_term =
    sanitizeAttributionValue(raw.utm_term, MAX_PARAM_VALUE_LENGTH) ?? sanitizedLanding?.utm_term;
  const utm_content =
    sanitizeAttributionValue(raw.utm_content, MAX_PARAM_VALUE_LENGTH) ??
    sanitizedLanding?.utm_content;

  const rawClickType = raw.click_id_type ?? sanitizedLanding?.click_id_type;
  const click_id_type =
    rawClickType && SUPPORTED_CLICK_ID_TYPES.includes(rawClickType) ? rawClickType : undefined;
  const rawClickVal = sanitizeAttributionValue(
    raw.click_id_value ?? sanitizedLanding?.click_id_value,
    MAX_PARAM_VALUE_LENGTH,
  );
  const click_id_value =
    click_id_type && rawClickVal && /^[A-Za-z0-9._-]+$/.test(rawClickVal) ? rawClickVal : undefined;

  const first_touch_source = normalizeAttributionToken(raw.first_touch_source) ?? utm_source;
  const first_touch_medium = normalizeAttributionToken(raw.first_touch_medium) ?? utm_medium;
  const first_touch_campaign =
    sanitizeAttributionValue(raw.first_touch_campaign, MAX_PARAM_VALUE_LENGTH) ?? utm_campaign;
  const first_touch_landing_path =
    sanitizeAttributionUrl(raw.first_touch_landing_path)?.landingPath ??
    sanitizedLanding?.landingPath;
  const first_touch_referrer_domain =
    sanitizeAttributionValue(raw.first_touch_referrer_domain, 120)?.toLowerCase() ??
    sanitizedRef?.referrerDomain;
  const first_touch_at =
    raw.first_touch_at && !Number.isNaN(Date.parse(raw.first_touch_at))
      ? new Date(raw.first_touch_at).toISOString()
      : undefined;

  const last_touch_source = normalizeAttributionToken(raw.last_touch_source) ?? utm_source;
  const last_touch_medium = normalizeAttributionToken(raw.last_touch_medium) ?? utm_medium;
  const last_touch_campaign =
    sanitizeAttributionValue(raw.last_touch_campaign, MAX_PARAM_VALUE_LENGTH) ?? utm_campaign;
  const last_touch_landing_path =
    sanitizeAttributionUrl(raw.last_touch_landing_path)?.landingPath ??
    sanitizedLanding?.landingPath;
  const last_touch_referrer_domain =
    sanitizeAttributionValue(raw.last_touch_referrer_domain, 120)?.toLowerCase() ??
    sanitizedRef?.referrerDomain;
  const last_touch_at =
    raw.last_touch_at && !Number.isNaN(Date.parse(raw.last_touch_at))
      ? new Date(raw.last_touch_at).toISOString()
      : undefined;

  const conversion_path =
    sanitizeAttributionUrl(raw.conversion_path)?.landingPath ?? sanitizedLanding?.landingPath;

  const hasLandingContext = Boolean(
    sanitizedLanding?.landingPath || first_touch_landing_path || conversion_path,
  );

  const computedChannel = classifyAttributionChannel({
    utm_source: last_touch_source ?? utm_source,
    utm_medium: last_touch_medium ?? utm_medium,
    utm_campaign: last_touch_campaign ?? utm_campaign,
    click_id_type: click_id_value ? click_id_type : undefined,
    referrer_domain: last_touch_referrer_domain ?? sanitizedRef?.referrerDomain,
    hasLandingContext,
  });

  return {
    utm_source,
    utm_medium,
    utm_campaign,
    utm_term,
    utm_content,
    landing_url: sanitizedLanding?.cleanLandingUrl,
    referrer: sanitizedRef?.cleanReferrer,
    first_touch_source,
    first_touch_medium,
    first_touch_campaign,
    first_touch_landing_path,
    first_touch_referrer_domain,
    first_touch_at,
    last_touch_source,
    last_touch_medium,
    last_touch_campaign,
    last_touch_landing_path,
    last_touch_referrer_domain,
    last_touch_at,
    conversion_path,
    attribution_channel: computedChannel,
    click_id_type: click_id_value ? click_id_type : undefined,
    click_id_value,
  };
}
