import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const UNAMBIGUOUS_CHARS = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

/**
 * Generates an unambiguous reference code in the format WNX-XXXXXX
 * Excluding easily confused characters (0, O, 1, I).
 */
export function generateReferenceCode(): string {
  let code = "WNX-";
  for (let i = 0; i < 6; i++) {
    const idx = Math.floor(Math.random() * UNAMBIGUOUS_CHARS.length);
    code += UNAMBIGUOUS_CHARS[idx];
  }
  return code;
}

/**
 * Normalizes Indian phone numbers to E.164 format (+91XXXXXXXXXX)
 */
function normalizeIndianPhone(phoneStr: string): string | null {
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

export const leadSubmissionSchema = z.object({
  name: z.string().trim().min(2, "Full name must be at least 2 characters").max(100),
  phone: z
    .string()
    .trim()
    .refine((val) => normalizeIndianPhone(val) !== null, {
      message: "Please enter a valid 10-digit Indian mobile number (+91)",
    }),
  city: z.string().trim().default("Hyderabad"),
  pin_code: z
    .string()
    .trim()
    .regex(/^[1-9][0-9]{5}$/, "PIN code must be a valid 6-digit Indian postal code")
    .optional()
    .or(z.literal("")),
  property_tier: z.enum(["villa", "independent_home", "commercial"]),
  discom_code: z.string().optional(),
  monthly_bill_inr: z.number().nonnegative().optional(),
  system_kw: z.number().nonnegative().optional(),
  battery_units: z.number().int().nonnegative().default(0),
  net_price_inr: z.number().nonnegative().optional(),
  roof_area_sqft: z.number().nonnegative().optional(),
  source: z.enum(["drawer", "studio", "enterprise"]),
  notes: z.string().max(1000).optional(),
  consent_given: z.literal(true, {
    errorMap: () => ({ message: "Consent to be contacted is required" }),
  }),
  consent_version: z.string().default("2026-09-v1"),
  company_website: z.string().optional(), // Honeypot field for bot suppression
  utm_source: z.string().optional(),
  utm_medium: z.string().optional(),
  utm_campaign: z.string().optional(),
  utm_term: z.string().optional(),
  utm_content: z.string().optional(),
  landing_url: z.string().optional(),
  referrer: z.string().optional(),
});

export type LeadSubmissionInput = z.infer<typeof leadSubmissionSchema>;

export interface LeadSubmissionResponse {
  success: boolean;
  referenceCode?: string;
  message: string;
}

/**
 * Server function to securely submit architectural solar consultation leads.
 * Validates inputs, checks honeypots, audits DPDP consent, and writes to Supabase.
 */
export const submitLead = createServerFn({ method: "POST" })
  .validator((data: unknown) => leadSubmissionSchema.parse(data))
  .handler(async ({ data }): Promise<LeadSubmissionResponse> => {
    // 1. Honeypot suppression
    if (data.company_website && data.company_website.trim().length > 0) {
      // Silently accept bots without persisting
      return {
        success: true,
        referenceCode: generateReferenceCode(),
        message: "Your proposal request has been received.",
      };
    }

    const normalizedPhone = normalizeIndianPhone(data.phone);
    if (!normalizedPhone) {
      return {
        success: false,
        message: "Invalid phone number format. Please provide a 10-digit Indian phone number.",
      };
    }

    const referenceCode = generateReferenceCode();

    // 2. Check Supabase connection and persist
    try {
      const { getServerSupabaseClient } = await import("@/server/supabase");
      const db = getServerSupabaseClient();

      const { error } = await db.from("consultations").insert({
        reference_code: referenceCode,
        client_name: data.name,
        phone: normalizedPhone,
        city: data.city || "Hyderabad",
        pin_code: data.pin_code && data.pin_code.length === 6 ? data.pin_code : null,
        property_tier: data.property_tier,
        discom_code: data.discom_code || null,
        monthly_bill_inr: data.monthly_bill_inr ?? null,
        system_kw: data.system_kw ?? null,
        battery_units: data.battery_units ?? 0,
        net_price_inr: data.net_price_inr ?? null,
        roof_area_sqft: data.roof_area_sqft ?? null,
        source: data.source,
        notes: data.notes || null,
        consent_given: data.consent_given,
        consent_version: data.consent_version,
        consent_at: new Date().toISOString(),
        utm_source: data.utm_source || null,
        utm_medium: data.utm_medium || null,
        utm_campaign: data.utm_campaign || null,
        utm_term: data.utm_term || null,
        utm_content: data.utm_content || null,
        landing_url: data.landing_url || null,
        referrer: data.referrer || null,
      });

      if (error) {
        // Handle 60-second anti-duplicate trigger message
        if (error.message?.includes("less than 60 seconds ago")) {
          return {
            success: false,
            message:
              "A consultation request with this phone number was submitted less than a minute ago. Our advisory team will reach out shortly.",
          };
        }
        console.error("[submitLead] Database error:", error);
        return {
          success: false,
          message:
            "Unable to process your request at this time. Please try again or reach us via WhatsApp.",
        };
      }

      return {
        success: true,
        referenceCode,
        message: "Your proposal request has been successfully submitted.",
      };
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);

      // If Supabase environment is unconfigured, return a clear error instead of silent fake success
      if (errMsg.includes("Missing Supabase server configuration")) {
        console.error(
          "[submitLead] CRITICAL: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not configured.",
        );
        return {
          success: false,
          message:
            "Configuration error: Database connection is not configured on the server. Please contact WAVENOX support directly via phone or WhatsApp.",
        };
      }

      console.error("[submitLead] Unexpected error:", err);
      return {
        success: false,
        message: "An unexpected error occurred. Please contact us via phone or WhatsApp.",
      };
    }
  });
