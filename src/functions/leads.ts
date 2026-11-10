import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { BRAND_CONFIG } from "@/config/brand";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { SupabaseServerEnv } from "@/server/supabase";
import {
  sanitizeIncomingAttributionPayload,
  type AttributionChannel,
  type ClickIdType,
} from "@/lib/telemetry";

const PLACEHOLDER_VALUES = new Set([
  "https://your-project-id.supabase.co",
  "http://your-project-id.supabase.co",
  "your-supabase-url",
  "your-service-role-secret-key",
  "your-anon-key",
  "eyjhbgcioijiuzi1niisinr5cci6ikppxvcj9...",
]);

export function hasValidSupabaseServerConfig(
  env: SupabaseServerEnv = typeof process !== "undefined" ? process.env : {},
): boolean {
  const rawUrl = (
    env.SUPABASE_URL ||
    env.VITE_SUPABASE_URL ||
    env.NEXT_PUBLIC_SUPABASE_URL ||
    ""
  ).trim();
  const rawKey = (env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SECRET_KEY || "").trim();

  if (!rawUrl || !rawKey) return false;
  if (
    PLACEHOLDER_VALUES.has(rawUrl.toLowerCase()) ||
    PLACEHOLDER_VALUES.has(rawKey.toLowerCase())
  ) {
    return false;
  }

  try {
    const parsed = new URL(rawUrl);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

const UNAMBIGUOUS_CHARS = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
const VALID_LIVE_REF_REGEX = /^WNX-[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{6}$/;
const VALID_DEMO_REF_REGEX = /^WNX-DEMO-[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{6}$/;

/**
 * Validates whether a reference code matches an official server-issued WAVENOX format.
 */
export function isValidReferenceCode(ref: string | null | undefined): boolean {
  if (!ref) return false;
  const trimmed = ref.trim();
  return VALID_LIVE_REF_REGEX.test(trimmed) || VALID_DEMO_REF_REGEX.test(trimmed);
}

/**
 * Checks whether a reference code is an explicit demo simulation reference code.
 */
export function isDemoReferenceCode(ref: string | null | undefined): boolean {
  if (!ref) return false;
  return VALID_DEMO_REF_REGEX.test(ref.trim());
}

/**
 * Generates an unambiguous reference code in the format WNX-XXXXXX (live)
 * or WNX-DEMO-XXXXXX (explicit demo mode), excluding easily confused characters (0, O, 1, I).
 */
export function generateReferenceCode(mode: "live" | "demo" = "live"): string {
  let code = mode === "demo" ? "WNX-DEMO-" : "WNX-";
  const bytes = new Uint8Array(6);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < 6; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }
  for (let i = 0; i < 6; i++) {
    code += UNAMBIGUOUS_CHARS[bytes[i] % UNAMBIGUOUS_CHARS.length];
  }
  return code;
}

/**
 * Normalizes Indian phone numbers to E.164 format (+91XXXXXXXXXX)
 */
export function normalizeIndianPhone(phoneStr: string): string | null {
  const digits = phoneStr.replace(/\D/g, "");
  if (digits.length === 10 && /^[6-9]/.test(digits)) {
    return `+91${digits}`;
  }
  if (digits.length === 11 && digits.startsWith("0") && /^[6-9]/.test(digits.slice(1))) {
    return `+91${digits.slice(1)}`;
  }
  if (digits.length === 12 && digits.startsWith("91") && /^[6-9]/.test(digits.slice(2))) {
    return `+${digits}`;
  }
  return null;
}

/**
 * Validates optional HTTP/HTTPS URLs or domain names cleanly without rejecting empty strings.
 */
export function isValidCompanyUrl(val: string): boolean {
  const trimmed = val.trim();
  if (!trimmed) return true;
  if (/\s/.test(trimmed)) return false;
  try {
    const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    const parsed = new URL(withProtocol);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return false;
    }
    return /^[a-z0-9.-]+\.[a-z]{2,}$/i.test(parsed.hostname);
  } catch {
    return false;
  }
}

export const SUPPORTED_LEAD_SOURCES = [
  "drawer",
  "studio",
  "enterprise",
  "net_metering",
  "architects",
] as const;

export type LeadSource = (typeof SUPPORTED_LEAD_SOURCES)[number];

const V2_LEGACY_SOURCES = new Set<string>(["drawer", "studio", "enterprise"]);

export const leadSubmissionSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name must be 100 characters or fewer"),
  phone: z
    .string()
    .trim()
    .refine((val) => normalizeIndianPhone(val) !== null, {
      message: "Please enter a valid 10-digit Indian mobile number (+91)",
    }),
  email: z
    .string()
    .trim()
    .max(254, "Email address is too long")
    .email("Please enter a valid email address")
    .optional()
    .or(z.literal("")),
  company_name: z
    .string()
    .trim()
    .max(150, "Company name must be 150 characters or fewer")
    .optional(),
  company_url: z
    .string()
    .trim()
    .max(255, "Company URL must be 255 characters or fewer")
    .refine((val) => !val || isValidCompanyUrl(val), {
      message: "Please enter a valid company website URL (e.g. https://example.com)",
    })
    .optional()
    .or(z.literal("")),
  city: z.string().trim().min(1).max(100).default("Hyderabad"),
  pin_code: z
    .string()
    .trim()
    .regex(/^[1-9][0-9]{5}$/, "PIN code must be a valid 6-digit Indian postal code")
    .optional()
    .or(z.literal("")),
  property_tier: z.enum(["villa", "independent_home", "commercial"]),
  discom_code: z.string().trim().max(50).optional(),
  monthly_bill_inr: z
    .number()
    .nonnegative("Monthly bill cannot be negative")
    .max(100000000, "Monthly bill exceeds realistic bounds")
    .optional(),
  system_kw: z
    .number()
    .nonnegative("System size cannot be negative")
    .max(50000, "System size exceeds 50 MWp online limit")
    .optional(),
  battery_units: z.number().int().nonnegative().max(500).default(0),
  net_price_inr: z.number().nonnegative().max(5000000000).optional(),
  roof_area_sqft: z
    .number()
    .nonnegative("Roof area cannot be negative")
    .max(5000000, "Roof area exceeds realistic bounds")
    .optional(),
  source: z.enum(SUPPORTED_LEAD_SOURCES),
  notes: z.string().max(1000, "Notes cannot exceed 1000 characters").optional(),
  consent_given: z.boolean().refine((val) => val === true, {
    message: "Consent to be contacted is required",
  }),
  consent_version: z.string().trim().min(1).max(50).default("2026-11-v2"),
  consent_timestamp: z
    .string()
    .trim()
    .refine((val) => !val || !Number.isNaN(Date.parse(val)), {
      message: "Invalid consent timestamp",
    })
    .optional(),
  hp_extra: z.string().optional(), // Non-guessable honeypot field for bot suppression
  turnstile_token: z.string().optional(), // Cloudflare Turnstile token
  utm_source: z.string().max(500).optional().catch(undefined),
  utm_medium: z.string().max(500).optional().catch(undefined),
  utm_campaign: z.string().max(500).optional().catch(undefined),
  utm_term: z.string().max(500).optional().catch(undefined),
  utm_content: z.string().max(500).optional().catch(undefined),
  landing_url: z.string().max(2000).optional().catch(undefined),
  referrer: z.string().max(2000).optional().catch(undefined),
  // Step 5 multi-touch attribution fields (never block valid lead submission if malformed)
  first_touch_source: z.string().max(500).optional().catch(undefined),
  first_touch_medium: z.string().max(500).optional().catch(undefined),
  first_touch_campaign: z.string().max(500).optional().catch(undefined),
  first_touch_landing_path: z.string().max(2000).optional().catch(undefined),
  first_touch_referrer_domain: z.string().max(500).optional().catch(undefined),
  first_touch_at: z.string().max(100).optional().catch(undefined),
  last_touch_source: z.string().max(500).optional().catch(undefined),
  last_touch_medium: z.string().max(500).optional().catch(undefined),
  last_touch_campaign: z.string().max(500).optional().catch(undefined),
  last_touch_landing_path: z.string().max(2000).optional().catch(undefined),
  last_touch_referrer_domain: z.string().max(500).optional().catch(undefined),
  last_touch_at: z.string().max(100).optional().catch(undefined),
  conversion_path: z.string().max(1000).optional().catch(undefined),
  attribution_channel: z.string().max(100).optional().catch(undefined),
  click_id_type: z.string().max(50).optional().catch(undefined),
  click_id_value: z.string().max(255).optional().catch(undefined),
});

export type LeadSubmissionInput = z.infer<typeof leadSubmissionSchema>;

export interface LeadSubmissionResponse {
  success: boolean;
  referenceCode?: string;
  message: string;
  fieldErrors?: Record<string, string[] | undefined>;
  isDemo?: boolean;
  mode?: "live" | "demo";
  source?: LeadSource;
  sourceFallbackUsed?: boolean;
}

/**
 * In-Memory Sliding-Window Rate Limiter (5 requests / 10 minutes per normalized phone).
 *
 * Runtime Limitation Note:
 * In serverless / multi-isolate environments (Nitro / Vercel Functions / Cloudflare Workers),
 * this Map is scoped to a single warm runtime isolate and resets on cold starts.
 * It provides first-line burst abuse protection within an isolate and complements
 * the PostgreSQL `trg_check_recent_submission` 60-second duplicate trigger in Supabase.
 */
const ipRequestTimestamps = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 5;
const MAX_RATE_LIMIT_KEYS = 2000;

function isRateLimited(identifier: string): boolean {
  const now = Date.now();
  if (ipRequestTimestamps.size >= MAX_RATE_LIMIT_KEYS) {
    for (const [key, timestamps] of ipRequestTimestamps.entries()) {
      const active = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
      if (active.length === 0) {
        ipRequestTimestamps.delete(key);
      } else {
        ipRequestTimestamps.set(key, active);
      }
    }
    // Do not let a stream of unique numbers grow this runtime's memory indefinitely.
    // Existing keys retain their window; new keys can retry after expiry.
    if (ipRequestTimestamps.size >= MAX_RATE_LIMIT_KEYS && !ipRequestTimestamps.has(identifier)) {
      return true;
    }
  }
  const history = ipRequestTimestamps.get(identifier) || [];
  const recent = history.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  if (recent.length >= RATE_LIMIT_MAX_REQUESTS) {
    ipRequestTimestamps.set(identifier, recent);
    return true;
  }
  recent.push(now);
  ipRequestTimestamps.set(identifier, recent);
  return false;
}

export function resetLeadRateLimiter(): void {
  ipRequestTimestamps.clear();
}

async function verifyTurnstile(token: string, secretKey: string): Promise<boolean> {
  try {
    const params = new URLSearchParams();
    params.append("secret", secretKey);
    params.append("response", token);

    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: params,
      signal: AbortSignal.timeout(10_000),
    });
    const outcome = (await res.json()) as { success: boolean };
    return outcome.success === true;
  } catch {
    console.warn("[Turnstile] Validation unavailable");
    return false;
  }
}

export interface LeadExecutionEnv extends SupabaseServerEnv {
  LEAD_MODE?: string;
  VITE_LEAD_MODE?: string;
  TURNSTILE_SECRET_KEY?: string;
  RESEND_API_KEY?: string;
  OWNER_NOTIFY_EMAIL?: string;
  LEADS_FROM_EMAIL?: string;
}

/**
 * Resolves the active lead submission mode:
 * - "demo" ONLY when explicitly configured via LEAD_MODE="demo" or VITE_LEAD_MODE="demo".
 * - "live" in all other cases (default / production mode).
 */
export function resolveLeadExecutionMode(
  env: LeadExecutionEnv = typeof process !== "undefined" ? process.env : {},
): "live" | "demo" {
  const rawMode = (env.LEAD_MODE || env.VITE_LEAD_MODE || "").trim().toLowerCase();
  return rawMode === "demo" ? "demo" : "live";
}

export interface LeadDbInsertResult {
  data: Array<{ id: string }> | null;
  error: {
    code?: string;
    message?: string;
    details?: string;
  } | null;
}

export interface LeadDatabaseClient {
  insertConsultation: (payload: Record<string, unknown>) => Promise<LeadDbInsertResult>;
  markOwnerNotified?: (id: string, isoTimestamp: string) => Promise<void>;
}

function createSupabaseDatabaseClient(
  env: LeadExecutionEnv,
  getSupabaseClient?: (env?: SupabaseServerEnv) => SupabaseClient,
): LeadDatabaseClient {
  if (!getSupabaseClient) {
    throw new Error(
      "Missing Supabase server configuration. Please ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in your server environment.",
    );
  }
  const db = getSupabaseClient(env);
  return {
    async insertConsultation(payload: Record<string, unknown>) {
      const result = await db.from("consultations").insert(payload).select("id");
      return {
        data: (result.data as Array<{ id: string }> | null) ?? null,
        error: result.error
          ? {
              code: result.error.code,
              message: result.error.message,
              details: result.error.details,
            }
          : null,
      };
    },
    async markOwnerNotified(id: string, isoTimestamp: string) {
      await db.from("consultations").update({ owner_notified_at: isoTimestamp }).eq("id", id);
    },
  };
}

function isStep5SchemaCompatibilityError(error: {
  code?: string;
  message?: string;
  details?: string;
}): boolean {
  const code = (error.code || "").toUpperCase();
  const msg = `${error.message || ""} ${error.details || ""}`.toLowerCase();
  const step5Markers = [
    "first_touch_",
    "last_touch_",
    "conversion_path",
    "attribution_channel",
    "click_id_",
    "client_email",
    "crm_lead_attribution_channel_check",
    "crm_lead_click_id_type_check",
  ];
  if (code === "PGRST204" || code === "42703" || code === "23514") {
    return step5Markers.some((marker) => msg.includes(marker));
  }
  return step5Markers.some((marker) => msg.includes(marker));
}

function isLegacySchemaCompatibilityError(
  error: {
    code?: string;
    message?: string;
    details?: string;
  },
  source: LeadSource,
): boolean {
  const code = (error.code || "").toUpperCase();
  const msg = `${error.message || ""} ${error.details || ""}`.toLowerCase();

  // Check constraint violation: only treat as v2 schema incompatibility if it is the source check constraint
  if (code === "23514") {
    return (
      msg.includes("consultations_source_check") ||
      msg.includes("source") ||
      (!msg.trim() && !V2_LEGACY_SOURCES.has(source))
    );
  }

  // Missing v3 column in PostgREST schema cache (PGRST204) or PostgreSQL undefined_column (42703)
  if (code === "PGRST204" || code === "42703") {
    return (
      msg.includes("company_name") ||
      msg.includes("company_url") ||
      msg.includes("schema cache") ||
      !msg.trim()
    );
  }

  return (
    msg.includes("consultations_source_check") ||
    msg.includes("company_name") ||
    msg.includes("company_url")
  );
}

/**
 * Pure, testable lead submission processor used by `submitLead`.
 * Enforces strict separation between DEMO and LIVE modes and guarantees that
 * LIVE mode never reports a false positive when credentials are missing or DB insertion fails.
 */
export async function processLeadSubmission(
  data: unknown,
  options?: {
    env?: LeadExecutionEnv;
    dbClient?: LeadDatabaseClient;
    getSupabaseClient?: (env?: SupabaseServerEnv) => SupabaseClient;
    skipRateLimit?: boolean;
    onDemoLeadRegistered?: (demoLead: Record<string, unknown>) => void;
  },
): Promise<LeadSubmissionResponse> {
  const env: LeadExecutionEnv = options?.env ?? (typeof process !== "undefined" ? process.env : {});
  const mode = resolveLeadExecutionMode(env);

  // 1. Zod Safe Validation
  const parsed = leadSubmissionSchema.safeParse(data);
  if (!parsed.success) {
    const flattened = parsed.error.flatten();
    const firstErrorMessage =
      parsed.error.issues[0]?.message || "Validation failed. Please verify your inputs.";
    return {
      success: false,
      isDemo: mode === "demo",
      mode,
      message: firstErrorMessage,
      fieldErrors: flattened.fieldErrors,
    };
  }

  const validData = parsed.data;

  // 2. Honeypot suppression
  if (validData.hp_extra && validData.hp_extra.trim().length > 0) {
    // Reject automated bots without persisting to database
    return {
      success: true,
      isDemo: true,
      mode: "demo",
      source: validData.source,
      referenceCode: generateReferenceCode("demo"),
      message: "Demo Mode Simulation: Automated submission intercepted; no live lead was stored.",
    };
  }

  const normalizedPhone = normalizeIndianPhone(validData.phone);
  if (!normalizedPhone) {
    return {
      success: false,
      isDemo: mode === "demo",
      mode,
      source: validData.source,
      message: "Invalid phone number format. Please provide a 10-digit Indian phone number.",
      fieldErrors: { phone: ["Invalid phone number format"] },
    };
  }

  // 3. Turnstile bot verification (if TURNSTILE_SECRET_KEY is configured)
  const turnstileSecret = env.TURNSTILE_SECRET_KEY;
  if (turnstileSecret) {
    if (!validData.turnstile_token) {
      return {
        success: false,
        isDemo: mode === "demo",
        mode,
        source: validData.source,
        message: "Security verification required. Please complete the captcha check.",
      };
    }
    const isHuman = await verifyTurnstile(validData.turnstile_token, turnstileSecret);
    if (!isHuman) {
      return {
        success: false,
        isDemo: mode === "demo",
        mode,
        source: validData.source,
        message: "Security verification failed. Please try again.",
      };
    }
  }

  // 4. Per-phone sliding-window rate limit
  if (!options?.skipRateLimit && isRateLimited(normalizedPhone)) {
    return {
      success: false,
      isDemo: mode === "demo",
      mode,
      source: validData.source,
      message: "Too many requests. Please wait a few minutes before trying again.",
    };
  }

  // Sanitize incoming attribution parameters to strip any accidental PII from URLs/referrers
  const sanitizedAttr = sanitizeIncomingAttributionPayload({
    utm_source: validData.utm_source,
    utm_medium: validData.utm_medium,
    utm_campaign: validData.utm_campaign,
    utm_term: validData.utm_term,
    utm_content: validData.utm_content,
    landing_url: validData.landing_url,
    referrer: validData.referrer,
    first_touch_source: validData.first_touch_source,
    first_touch_medium: validData.first_touch_medium,
    first_touch_campaign: validData.first_touch_campaign,
    first_touch_landing_path: validData.first_touch_landing_path,
    first_touch_referrer_domain: validData.first_touch_referrer_domain,
    first_touch_at: validData.first_touch_at,
    last_touch_source: validData.last_touch_source,
    last_touch_medium: validData.last_touch_medium,
    last_touch_campaign: validData.last_touch_campaign,
    last_touch_landing_path: validData.last_touch_landing_path,
    last_touch_referrer_domain: validData.last_touch_referrer_domain,
    last_touch_at: validData.last_touch_at,
    conversion_path: validData.conversion_path,
    attribution_channel: validData.attribution_channel as AttributionChannel | undefined,
    click_id_type: validData.click_id_type as ClickIdType | undefined,
    click_id_value: validData.click_id_value,
  });

  const cleanUtmSource = sanitizedAttr.utm_source || null;
  const cleanUtmMedium = sanitizedAttr.utm_medium || null;
  const cleanUtmCampaign = sanitizedAttr.utm_campaign || null;
  const cleanUtmTerm = sanitizedAttr.utm_term || null;
  const cleanUtmContent = sanitizedAttr.utm_content || null;
  const cleanLandingUrl = sanitizedAttr.landing_url || null;
  const cleanReferrer = sanitizedAttr.referrer || null;

  const hasMultiTouchInput = Boolean(
    validData.first_touch_source ||
    validData.first_touch_medium ||
    validData.first_touch_campaign ||
    validData.first_touch_landing_path ||
    validData.first_touch_referrer_domain ||
    validData.last_touch_source ||
    validData.last_touch_medium ||
    validData.last_touch_campaign ||
    validData.last_touch_landing_path ||
    validData.last_touch_referrer_domain ||
    validData.conversion_path ||
    validData.attribution_channel ||
    validData.click_id_type ||
    validData.click_id_value,
  );

  // 5. EXPLICIT DEMO MODE
  // Only active when LEAD_MODE="demo" or VITE_LEAD_MODE="demo".
  if (mode === "demo") {
    const demoReferenceCode = generateReferenceCode("demo");
    const consentTimestampIso = validData.consent_timestamp
      ? new Date(validData.consent_timestamp).toISOString()
      : new Date().toISOString();

    try {
      options?.onDemoLeadRegistered?.({
        referenceCode: demoReferenceCode,
        name: validData.name,
        email: validData.email?.trim() || null,
        phone: normalizedPhone,
        company_name: validData.company_name?.trim() || null,
        company_url: validData.company_url?.trim() || null,
        city: validData.city || "Hyderabad",
        pin_code: validData.pin_code && validData.pin_code.length === 6 ? validData.pin_code : null,
        property_tier: validData.property_tier,
        discom_code: validData.discom_code || null,
        monthly_bill_inr: validData.monthly_bill_inr ?? null,
        system_kw: validData.system_kw ?? null,
        battery_units: validData.battery_units ?? 0,
        net_price_inr: validData.net_price_inr ?? null,
        roof_area_sqft: validData.roof_area_sqft ?? null,
        source: validData.source,
        notes: validData.notes?.trim() || null,
        consent_version: validData.consent_version,
        consent_at: consentTimestampIso,
        utm_source: cleanUtmSource,
        utm_medium: cleanUtmMedium,
        utm_campaign: cleanUtmCampaign,
        utm_term: cleanUtmTerm,
        utm_content: cleanUtmContent,
        landing_url: cleanLandingUrl,
        referrer: cleanReferrer,
        first_touch_source: sanitizedAttr.first_touch_source || cleanUtmSource,
        first_touch_medium: sanitizedAttr.first_touch_medium || cleanUtmMedium,
        first_touch_campaign: sanitizedAttr.first_touch_campaign || cleanUtmCampaign,
        first_touch_landing_path: sanitizedAttr.first_touch_landing_path || cleanLandingUrl,
        first_touch_referrer_domain: sanitizedAttr.first_touch_referrer_domain || null,
        first_touch_at: sanitizedAttr.first_touch_at || consentTimestampIso,
        last_touch_source: sanitizedAttr.last_touch_source || cleanUtmSource,
        last_touch_medium: sanitizedAttr.last_touch_medium || cleanUtmMedium,
        last_touch_campaign: sanitizedAttr.last_touch_campaign || cleanUtmCampaign,
        last_touch_landing_path: sanitizedAttr.last_touch_landing_path || cleanLandingUrl,
        last_touch_referrer_domain: sanitizedAttr.last_touch_referrer_domain || null,
        last_touch_at: sanitizedAttr.last_touch_at || consentTimestampIso,
        conversion_path: sanitizedAttr.conversion_path || cleanLandingUrl,
        attribution_channel: sanitizedAttr.attribution_channel,
        click_id_type: sanitizedAttr.click_id_type || null,
        click_id_value: sanitizedAttr.click_id_value || null,
      });
    } catch (crmDemoErr) {
      console.warn("[submitLead] Unable to register demo lead in CRM store");
    }

    console.info(
      `[submitLead] Explicit DEMO mode active. Returning simulated reference ${demoReferenceCode} for source="${validData.source}".`,
    );
    return {
      success: true,
      referenceCode: demoReferenceCode,
      isDemo: true,
      mode: "demo",
      source: validData.source,
      message:
        "Demo Mode Simulation: Your indicative solar configuration was prepared for preview purposes only. No live consultation request was saved or scheduled.",
    };
  }

  // 6. LIVE MODE — Fail closed if server-side Supabase credentials are missing or invalid
  if (!options?.dbClient && !hasValidSupabaseServerConfig(env)) {
    console.error(
      "[submitLead] CRITICAL: LEAD_MODE is 'live', but SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not configured on the server. Refusing to return a fake confirmation.",
    );
    return {
      success: false,
      isDemo: false,
      mode: "live",
      source: validData.source,
      message: `We couldn't save your consultation request right now due to a server configuration issue. Please call ${BRAND_CONFIG.contact.phone.display} or message us on WhatsApp (${BRAND_CONFIG.contact.whatsapp.display}).`,
    };
  }

  // 7. Persist to Supabase in LIVE mode
  try {
    const dbClient =
      options?.dbClient ?? createSupabaseDatabaseClient(env, options?.getSupabaseClient);
    const consentTimestampIso = validData.consent_timestamp
      ? new Date(validData.consent_timestamp).toISOString()
      : new Date().toISOString();

    const cleanCompanyName = validData.company_name?.trim() || null;
    const cleanCompanyUrl = validData.company_url?.trim() || null;
    const cleanEmail = validData.email?.trim() || null;
    const cleanNotes = validData.notes?.trim() || null;

    const v3NotesParts: string[] = [];
    if (cleanEmail && (!cleanNotes || !cleanNotes.includes(cleanEmail))) {
      v3NotesParts.push(`Email: ${cleanEmail}`);
    }
    if (cleanNotes) {
      v3NotesParts.push(cleanNotes);
    }
    const v3Notes = v3NotesParts.length > 0 ? v3NotesParts.join(" | ") : null;

    // Build v3 payload: preserves exact `source` ('drawer' | 'studio' | 'enterprise' | 'net_metering' | 'architects')
    // and dedicated `company_name` / `company_url` columns from migration v3.
    const buildV3Payload = (refCode: string): Record<string, unknown> => ({
      reference_code: refCode,
      client_name: validData.name,
      phone: normalizedPhone,
      city: validData.city || "Hyderabad",
      pin_code: validData.pin_code && validData.pin_code.length === 6 ? validData.pin_code : null,
      property_tier: validData.property_tier,
      discom_code: validData.discom_code || null,
      monthly_bill_inr: validData.monthly_bill_inr ?? null,
      system_kw: validData.system_kw ?? null,
      battery_units: validData.battery_units ?? 0,
      net_price_inr: validData.net_price_inr ?? null,
      roof_area_sqft: validData.roof_area_sqft ?? null,
      ...(cleanCompanyName ? { company_name: cleanCompanyName } : {}),
      ...(cleanCompanyUrl ? { company_url: cleanCompanyUrl } : {}),
      source: validData.source,
      notes: v3Notes,
      consent_given: validData.consent_given,
      consent_version: validData.consent_version,
      consent_at: consentTimestampIso,
      utm_source: cleanUtmSource,
      utm_medium: cleanUtmMedium,
      utm_campaign: cleanUtmCampaign,
      utm_term: cleanUtmTerm,
      utm_content: cleanUtmContent,
      landing_url: cleanLandingUrl,
      referrer: cleanReferrer,
    });

    // Build Step 5 v4 payload when multi-touch attribution fields are provided by the client
    const buildV4Payload = (refCode: string): Record<string, unknown> => ({
      ...buildV3Payload(refCode),
      ...(cleanEmail ? { email: cleanEmail } : {}),
      first_touch_source: sanitizedAttr.first_touch_source || cleanUtmSource,
      first_touch_medium: sanitizedAttr.first_touch_medium || cleanUtmMedium,
      first_touch_campaign: sanitizedAttr.first_touch_campaign || cleanUtmCampaign,
      first_touch_landing_path: sanitizedAttr.first_touch_landing_path || cleanLandingUrl,
      first_touch_referrer_domain: sanitizedAttr.first_touch_referrer_domain || null,
      first_touch_at: sanitizedAttr.first_touch_at || consentTimestampIso,
      last_touch_source: sanitizedAttr.last_touch_source || cleanUtmSource,
      last_touch_medium: sanitizedAttr.last_touch_medium || cleanUtmMedium,
      last_touch_campaign: sanitizedAttr.last_touch_campaign || cleanUtmCampaign,
      last_touch_landing_path: sanitizedAttr.last_touch_landing_path || cleanLandingUrl,
      last_touch_referrer_domain: sanitizedAttr.last_touch_referrer_domain || null,
      last_touch_at: sanitizedAttr.last_touch_at || consentTimestampIso,
      conversion_path: sanitizedAttr.conversion_path || cleanLandingUrl,
      attribution_channel: sanitizedAttr.attribution_channel,
      click_id_type: sanitizedAttr.click_id_type || null,
      click_id_value: sanitizedAttr.click_id_value || null,
    });

    // Documented Compatibility Fallback for v2 databases that have not yet run migration v3:
    // Embeds original source, company metadata, and email into `notes` so zero attribution is lost.
    const buildV2FallbackPayload = (refCode: string): Record<string, unknown> => {
      const noteParts: string[] = [];
      if (!V2_LEGACY_SOURCES.has(validData.source)) {
        noteParts.push(`[Origin Source: ${validData.source}]`);
      }
      if (cleanCompanyName) {
        noteParts.push(
          `Company: ${cleanCompanyName}${cleanCompanyUrl ? ` (${cleanCompanyUrl})` : ""}`,
        );
      } else if (cleanCompanyUrl) {
        noteParts.push(`Website: ${cleanCompanyUrl}`);
      }
      if (cleanEmail && (!cleanNotes || !cleanNotes.includes(cleanEmail))) {
        noteParts.push(`Email: ${cleanEmail}`);
      }
      if (cleanNotes) {
        noteParts.push(cleanNotes);
      }

      const fallbackSource = V2_LEGACY_SOURCES.has(validData.source) ? validData.source : "drawer";

      return {
        reference_code: refCode,
        client_name: validData.name,
        phone: normalizedPhone,
        city: validData.city || "Hyderabad",
        pin_code: validData.pin_code && validData.pin_code.length === 6 ? validData.pin_code : null,
        property_tier: validData.property_tier,
        discom_code: validData.discom_code || null,
        monthly_bill_inr: validData.monthly_bill_inr ?? null,
        system_kw: validData.system_kw ?? null,
        battery_units: validData.battery_units ?? 0,
        net_price_inr: validData.net_price_inr ?? null,
        roof_area_sqft: validData.roof_area_sqft ?? null,
        source: fallbackSource,
        notes: noteParts.length > 0 ? noteParts.join(" | ") : null,
        consent_given: validData.consent_given,
        consent_version: validData.consent_version,
        consent_at: consentTimestampIso,
        utm_source: cleanUtmSource,
        utm_medium: cleanUtmMedium,
        utm_campaign: cleanUtmCampaign,
        utm_term: cleanUtmTerm,
        utm_content: cleanUtmContent,
        landing_url: cleanLandingUrl,
        referrer: cleanReferrer,
      };
    };

    let activeRefCode = generateReferenceCode("live");
    let activeBuilder = hasMultiTouchInput ? buildV4Payload : buildV3Payload;
    let sourceFallbackUsed = false;

    let { data: insertedRows, error } = await dbClient.insertConsultation(
      activeBuilder(activeRefCode),
    );

    // If database has not yet applied Step 5 v4 migration, fall back cleanly to v3 payload
    if (error && hasMultiTouchInput && isStep5SchemaCompatibilityError(error)) {
      console.warn(
        `[submitLead] Step 5 attribution schema fallback triggered (${error.code || "column"}). Retrying with v3 payload.`,
      );
      activeBuilder = buildV3Payload;
      const v3Retry = await dbClient.insertConsultation(activeBuilder(activeRefCode));
      insertedRows = v3Retry.data;
      error = v3Retry.error;
    }

    // If database has not yet applied v3 migration (missing company_name/company_url or v2 source check constraint),
    // fall back to the v2-compatible payload while preserving original source and company metadata in `notes`.
    if (error && isLegacySchemaCompatibilityError(error, validData.source)) {
      console.warn(
        `[submitLead] Database schema compatibility fallback triggered (${error.code || "constraint"}). Retrying with v2-compatible payload while preserving source="${validData.source}" in notes.`,
      );
      activeBuilder = buildV2FallbackPayload;
      sourceFallbackUsed = true;
      const v2Retry = await dbClient.insertConsultation(activeBuilder(activeRefCode));
      insertedRows = v2Retry.data;
      error = v2Retry.error;
    }

    // Handle reference code unique collision: regenerate and retry once
    if (
      error &&
      error.code === "23505" &&
      (error.message?.includes("reference_code") || error.details?.includes("reference_code"))
    ) {
      console.warn("[submitLead] Reference code collision detected. Retrying with fresh code...");
      activeRefCode = generateReferenceCode("live");
      const retryResult = await dbClient.insertConsultation(activeBuilder(activeRefCode));
      error = retryResult.error;
      insertedRows = retryResult.data;
    }

    if (error || !insertedRows || insertedRows.length === 0) {
      if (error?.message?.includes("less than 60 seconds ago")) {
        return {
          success: false,
          isDemo: false,
          mode: "live",
          source: validData.source,
          message:
            "A consultation request with this phone number was submitted less than a minute ago. Our solar coordination team will reach out shortly.",
        };
      }
      // Log only sanitized error metadata (never `error.details` which can include row PII)
      console.error("[submitLead] Database error:", {
        code: error?.code ?? "unknown",
        source: validData.source,
      });
      return {
        success: false,
        isDemo: false,
        mode: "live",
        source: validData.source,
        message:
          "Unable to process your request at this time. Please try again or reach us via WhatsApp.",
      };
    }

    // 8. Dispatch optional owner notification via Resend REST API
    const resendApiKey = env.RESEND_API_KEY;
    const ownerNotifyEmail = env.OWNER_NOTIFY_EMAIL;
    const leadsFromEmail = env.LEADS_FROM_EMAIL;

    if (resendApiKey && ownerNotifyEmail && leadsFromEmail && insertedRows[0]?.id) {
      const insertedId = insertedRows[0].id;
      try {
        const resendResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: leadsFromEmail,
            to: ownerNotifyEmail,
            subject: `[New Lead] ${validData.name} — ${activeRefCode} (${validData.property_tier})`,
            text: [
              `New WAVENOX Consultation Request`,
              `---------------------------------`,
              `Reference: ${activeRefCode}`,
              `Name: ${validData.name}`,
              `Email: ${validData.email || "N/A"}`,
              `Company: ${validData.company_name || "N/A"} (${validData.company_url || "N/A"})`,
              `Phone: ${normalizedPhone}`,
              `City: ${validData.city || "Hyderabad"} (PIN: ${validData.pin_code || "N/A"})`,
              `Property Tier: ${validData.property_tier}`,
              `Source: ${validData.source}`,
              `System Size: ${validData.system_kw ? `${validData.system_kw} kW` : "N/A"}`,
              `Monthly Bill: ${
                validData.monthly_bill_inr
                  ? `₹${validData.monthly_bill_inr.toLocaleString("en-IN")}`
                  : "N/A"
              }`,
              `Battery Units: ${validData.battery_units || 0}`,
              `Consent Logged: Yes (${validData.consent_version} @ ${consentTimestampIso})`,
            ].join("\n"),
          }),
        });

        if (resendResponse.ok && dbClient.markOwnerNotified) {
          await dbClient.markOwnerNotified(insertedId, new Date().toISOString());
        } else if (!resendResponse.ok) {
          console.warn("[submitLead] Resend API returned non-OK status:", resendResponse.status);
        }
      } catch (notifyErr) {
        console.warn("[submitLead] Failed to dispatch owner notification email");
      }
    }

    return {
      success: true,
      referenceCode: activeRefCode,
      isDemo: false,
      mode: "live",
      source: validData.source,
      sourceFallbackUsed,
      message: "Your solar consultation request has been registered with WAVENOX.",
    };
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);

    if (errMsg.includes("Missing Supabase server configuration")) {
      console.error(
        "[submitLead] CRITICAL: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not configured on the server.",
      );
      return {
        success: false,
        isDemo: false,
        mode: "live",
        source: validData.source,
        message: `We couldn't save your request right now. Please call ${BRAND_CONFIG.contact.phone.display} or WhatsApp us.`,
      };
    }

    console.error("[submitLead] Unexpected database failure");
    return {
      success: false,
      isDemo: false,
      mode: "live",
      source: validData.source,
      message: "An unexpected error occurred. Please contact us via phone or WhatsApp.",
    };
  }
}

/**
 * Server function to securely submit architectural solar consultation leads.
 * Validates inputs with safeParse, checks honeypots, audits DPDP consent,
 * and enforces strict Demo vs Live mode separation.
 */
export const submitLead = createServerFn({ method: "POST" })
  .validator((data: unknown) => data)
  .handler(async ({ data }): Promise<LeadSubmissionResponse> => {
    const { getServerSupabaseClient } = await import("@/server/supabase");
    const { registerDemoLeadInCrmStore } = await import("@/server/crm-service");
    return processLeadSubmission(data, {
      getSupabaseClient: getServerSupabaseClient,
      onDemoLeadRegistered: (demoLead) =>
        registerDemoLeadInCrmStore(
          demoLead as unknown as Parameters<typeof registerDemoLeadInCrmStore>[0],
        ),
    });
  });
