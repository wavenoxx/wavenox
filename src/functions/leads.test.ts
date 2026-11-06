import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  processLeadSubmission,
  resolveLeadExecutionMode,
  resetLeadRateLimiter,
  normalizeIndianPhone,
  isValidCompanyUrl,
  generateReferenceCode,
  isValidReferenceCode,
  isDemoReferenceCode,
  SUPPORTED_LEAD_SOURCES,
  type LeadDatabaseClient,
  type LeadSubmissionInput,
} from "./leads";
import { hasValidSupabaseServerConfig } from "@/server/supabase";

const BASE_VALID_INPUT: LeadSubmissionInput = {
  name: "Vikram Aditya",
  phone: "9876543210",
  email: "vikram@example.com",
  city: "Hyderabad",
  pin_code: "500033",
  property_tier: "villa",
  discom_code: "TGSPDCL",
  monthly_bill_inr: 15000,
  system_kw: 8.5,
  battery_units: 1,
  net_price_inr: 650000,
  roof_area_sqft: 1200,
  source: "drawer",
  notes: "Interested in elevated terrace pergola.",
  consent_given: true,
  consent_version: "2026-11-v2",
  consent_timestamp: "2026-11-04T18:00:00.000Z",
};

describe("Production-Safe Lead Submission Pipeline (Step 1 — Phase D & H)", () => {
  beforeEach(() => {
    resetLeadRateLimiter();
    vi.restoreAllMocks();
  });

  describe("1. Mode Resolution & Explicit Demo Mode", () => {
    it("activates DEMO mode ONLY when LEAD_MODE='demo' or VITE_LEAD_MODE='demo'", () => {
      expect(resolveLeadExecutionMode({})).toBe("live");
      expect(resolveLeadExecutionMode({ LEAD_MODE: "live" })).toBe("live");
      expect(resolveLeadExecutionMode({ LEAD_MODE: "" })).toBe("live");
      expect(resolveLeadExecutionMode({ LEAD_MODE: "demo" })).toBe("demo");
      expect(resolveLeadExecutionMode({ VITE_LEAD_MODE: "demo" })).toBe("demo");
    });

    it("returns a clearly marked WNX-DEMO-XXXXXX simulation response in explicit demo mode without touching the database", async () => {
      const insertSpy = vi.fn();
      const dbClient: LeadDatabaseClient = {
        insertConsultation: insertSpy,
      };

      const res = await processLeadSubmission(BASE_VALID_INPUT, {
        env: { LEAD_MODE: "demo" },
        dbClient,
      });

      expect(res.success).toBe(true);
      expect(res.isDemo).toBe(true);
      expect(res.mode).toBe("demo");
      expect(res.referenceCode).toMatch(/^WNX-DEMO-[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{6}$/);
      expect(res.message).toContain("Demo Mode Simulation");
      expect(res.message).toContain("No live consultation request was saved");
      expect(insertSpy).not.toHaveBeenCalled();
    });
  });

  describe("2. Live Mode with Missing or Placeholder Database Credentials (No Fake Production Success)", () => {
    it("fails closed when SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing in LIVE mode", async () => {
      const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      const res = await processLeadSubmission(BASE_VALID_INPUT, {
        env: {
          LEAD_MODE: "live",
          SUPABASE_URL: "",
          SUPABASE_SERVICE_ROLE_KEY: "",
        },
      });

      expect(res.success).toBe(false);
      expect(res.isDemo).toBe(false);
      expect(res.mode).toBe("live");
      expect(res.referenceCode).toBeUndefined();
      expect(res.message).toContain("+91 91546 26354");
      expect(errorSpy).toHaveBeenCalled();
    });

    it("rejects .env.example placeholder Supabase credentials as invalid in LIVE mode", async () => {
      vi.spyOn(console, "error").mockImplementation(() => {});

      expect(
        hasValidSupabaseServerConfig({
          SUPABASE_URL: "https://your-project-id.supabase.co",
          SUPABASE_SERVICE_ROLE_KEY: "your-service-role-secret-key",
        }),
      ).toBe(false);

      const res = await processLeadSubmission(BASE_VALID_INPUT, {
        env: {
          LEAD_MODE: "live",
          SUPABASE_URL: "https://your-project-id.supabase.co",
          SUPABASE_SERVICE_ROLE_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        },
      });

      expect(res.success).toBe(false);
      expect(res.isDemo).toBe(false);
      expect(res.referenceCode).toBeUndefined();
    });
  });

  describe("3. Successful Persisted Live Submission", () => {
    it("persists validated lead payload and returns a live WNX-XXXXXX reference code", async () => {
      const capturedPayloads: Array<Record<string, unknown>> = [];
      const dbClient: LeadDatabaseClient = {
        async insertConsultation(payload) {
          capturedPayloads.push(payload);
          return { data: [{ id: "uuid-live-123" }], error: null };
        },
      };

      const res = await processLeadSubmission(
        {
          ...BASE_VALID_INPUT,
          phone: "+91 98765 43210",
          company_name: "Apex Tech Park Pvt Ltd",
          company_url: "https://apextech.in",
          source: "enterprise",
        },
        {
          env: { LEAD_MODE: "live" },
          dbClient,
        },
      );

      expect(res.success).toBe(true);
      expect(res.isDemo).toBe(false);
      expect(res.mode).toBe("live");
      expect(res.source).toBe("enterprise");
      expect(res.sourceFallbackUsed).toBe(false);
      expect(res.referenceCode).toMatch(/^WNX-[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{6}$/);
      expect(res.referenceCode).not.toContain("DEMO");

      expect(capturedPayloads).toHaveLength(1);
      const saved = capturedPayloads[0];
      expect(saved.client_name).toBe("Vikram Aditya");
      expect(saved.phone).toBe("+919876543210");
      expect(saved.company_name).toBe("Apex Tech Park Pvt Ltd");
      expect(saved.company_url).toBe("https://apextech.in");
      expect(saved.source).toBe("enterprise");
      expect(saved.notes).toContain("Email: vikram@example.com");
      expect(saved.consent_given).toBe(true);
      expect(saved.consent_version).toBe("2026-11-v2");
      expect(saved.consent_at).toBe("2026-11-04T18:00:00.000Z");
    });

    it("omits null company_name and company_url keys from v3 payload when not provided", async () => {
      const capturedPayloads: Array<Record<string, unknown>> = [];
      const dbClient: LeadDatabaseClient = {
        async insertConsultation(payload) {
          capturedPayloads.push(payload);
          return { data: [{ id: "uuid-drawer-123" }], error: null };
        },
      };

      const res = await processLeadSubmission(
        {
          ...BASE_VALID_INPUT,
          company_name: undefined,
          company_url: undefined,
          source: "drawer",
        },
        {
          env: { LEAD_MODE: "live" },
          dbClient,
        },
      );

      expect(res.success).toBe(true);
      expect(capturedPayloads).toHaveLength(1);
      expect("company_name" in capturedPayloads[0]).toBe(false);
      expect("company_url" in capturedPayloads[0]).toBe(false);
      expect(capturedPayloads[0].notes).toContain("Email: vikram@example.com");
    });
  });

  describe("4. Database Insertion Failure Handling & Sanitized Non-PII Logging", () => {
    it("returns success: false, no reference code, and never logs error.details containing customer PII", async () => {
      const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      const dbClient: LeadDatabaseClient = {
        async insertConsultation() {
          return {
            data: null,
            error: {
              code: "50000",
              message: "Connection terminated unexpectedly",
              details: "Failing row contains (Vikram Aditya, +919876543210, vikram@example.com)",
            },
          };
        },
      };

      const res = await processLeadSubmission(BASE_VALID_INPUT, {
        env: { LEAD_MODE: "live" },
        dbClient,
      });

      expect(res.success).toBe(false);
      expect(res.isDemo).toBe(false);
      expect(res.mode).toBe("live");
      expect(res.referenceCode).toBeUndefined();
      expect(res.message).toContain("Unable to process your request");

      const loggedString = JSON.stringify(errorSpy.mock.calls);
      expect(loggedString).not.toContain("+919876543210");
      expect(loggedString).not.toContain("Vikram Aditya");
      expect(loggedString).not.toContain("vikram@example.com");
    });

    it("surfaces a clear user-friendly message when PostgreSQL trg_check_recent_submission rejects duplicate phone within 60s", async () => {
      const dbClient: LeadDatabaseClient = {
        async insertConsultation() {
          return {
            data: null,
            error: {
              code: "P0001",
              message:
                "A consultation with this phone number was submitted less than 60 seconds ago.",
            },
          };
        },
      };

      const res = await processLeadSubmission(BASE_VALID_INPUT, {
        env: { LEAD_MODE: "live" },
        dbClient,
      });

      expect(res.success).toBe(false);
      expect(res.isDemo).toBe(false);
      expect(res.referenceCode).toBeUndefined();
      expect(res.message).toContain("submitted less than a minute ago");
    });

    it("retries once with a fresh reference code if a 23505 unique reference_code collision occurs", async () => {
      vi.spyOn(console, "warn").mockImplementation(() => {});
      let attempts = 0;

      const dbClient: LeadDatabaseClient = {
        async insertConsultation() {
          attempts += 1;
          if (attempts === 1) {
            return {
              data: null,
              error: {
                code: "23505",
                message:
                  'duplicate key value violates unique constraint "consultations_reference_code_key"',
              },
            };
          }
          return { data: [{ id: "uuid-retry-ok" }], error: null };
        },
      };

      const res = await processLeadSubmission(BASE_VALID_INPUT, {
        env: { LEAD_MODE: "live" },
        dbClient,
      });

      expect(attempts).toBe(2);
      expect(res.success).toBe(true);
      expect(res.isDemo).toBe(false);
      expect(res.referenceCode).toMatch(/^WNX-[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{6}$/);
    });
  });

  describe("5. Source Attribution Preservation & Schema Compatibility (v2 / v3)", () => {
    it.each(SUPPORTED_LEAD_SOURCES)(
      "preserves exact lead source '%s' when inserting into a v3 database",
      async (source) => {
        let persistedSource: unknown = null;
        const dbClient: LeadDatabaseClient = {
          async insertConsultation(payload) {
            persistedSource = payload.source;
            return { data: [{ id: `id-${source}` }], error: null };
          },
        };

        const res = await processLeadSubmission(
          { ...BASE_VALID_INPUT, source },
          { env: { LEAD_MODE: "live" }, dbClient, skipRateLimit: true },
        );

        expect(res.success).toBe(true);
        expect(res.source).toBe(source);
        expect(persistedSource).toBe(source);
        expect(res.sourceFallbackUsed).toBe(false);
      },
    );

    it("gracefully falls back to v2-compatible payload while preserving original source and company metadata in notes when v3 migration is absent", async () => {
      vi.spyOn(console, "warn").mockImplementation(() => {});
      const payloads: Array<Record<string, unknown>> = [];

      const dbClient: LeadDatabaseClient = {
        async insertConsultation(payload) {
          payloads.push(payload);
          if (payloads.length === 1) {
            return {
              data: null,
              error: {
                code: "23514",
                message:
                  'new row for relation "consultations" violates check constraint "consultations_source_check"',
              },
            };
          }
          return { data: [{ id: "v2-fallback-id" }], error: null };
        },
      };

      const res = await processLeadSubmission(
        {
          ...BASE_VALID_INPUT,
          source: "architects",
          company_name: "Studio Deccan",
          company_url: "studiodeccan.in",
          notes: "Villa project in Jubilee Hills",
        },
        { env: { LEAD_MODE: "live" }, dbClient },
      );

      expect(res.success).toBe(true);
      expect(res.isDemo).toBe(false);
      expect(res.source).toBe("architects");
      expect(res.sourceFallbackUsed).toBe(true);
      expect(payloads).toHaveLength(2);
      expect(payloads[0].source).toBe("architects");
      expect(payloads[1].source).toBe("drawer");
      expect(payloads[1].notes).toContain("[Origin Source: architects]");
      expect(payloads[1].notes).toContain("Company: Studio Deccan (studiodeccan.in)");
      expect(payloads[1].notes).toContain("Email: vikram@example.com");
      expect(payloads[1].notes).toContain("Villa project in Jubilee Hills");
    });

    it("does NOT trigger v2 fallback retry for unrelated 23514 check constraint violations", async () => {
      vi.spyOn(console, "error").mockImplementation(() => {});
      let attempts = 0;

      const dbClient: LeadDatabaseClient = {
        async insertConsultation() {
          attempts += 1;
          return {
            data: null,
            error: {
              code: "23514",
              message:
                'new row for relation "consultations" violates check constraint "consultations_property_tier_check"',
            },
          };
        },
      };

      const res = await processLeadSubmission(
        {
          ...BASE_VALID_INPUT,
          source: "architects",
        },
        { env: { LEAD_MODE: "live" }, dbClient },
      );

      expect(attempts).toBe(1);
      expect(res.success).toBe(false);
      expect(res.referenceCode).toBeUndefined();
    });
  });

  describe("6. Rigorous Input Validation, Consent Enforcement & Rate Limiting", () => {
    it("enforces explicit consent_given === true", async () => {
      const res = await processLeadSubmission(
        {
          ...BASE_VALID_INPUT,
          consent_given: false as unknown as true,
        },
        { env: { LEAD_MODE: "demo" } },
      );

      expect(res.success).toBe(false);
      expect(res.message).toContain("Consent to be contacted is required");
    });

    it("validates Indian mobile numbers, email, company_url, PIN code, and numeric bounds", async () => {
      expect(normalizeIndianPhone("9876543210")).toBe("+919876543210");
      expect(normalizeIndianPhone("+91 98765-43210")).toBe("+919876543210");
      expect(normalizeIndianPhone("09876543210")).toBe("+919876543210");
      expect(normalizeIndianPhone("5555555555")).toBeNull();
      expect(normalizeIndianPhone("12345")).toBeNull();

      expect(isValidCompanyUrl("https://wavenox.in")).toBe(true);
      expect(isValidCompanyUrl("wavenox.in")).toBe(true);
      expect(isValidCompanyUrl("not a url")).toBe(false);

      const badPhone = await processLeadSubmission(
        { ...BASE_VALID_INPUT, phone: "12345" },
        { env: { LEAD_MODE: "demo" } },
      );
      expect(badPhone.success).toBe(false);

      const badUrl = await processLeadSubmission(
        { ...BASE_VALID_INPUT, company_url: "invalid url with spaces" },
        { env: { LEAD_MODE: "demo" } },
      );
      expect(badUrl.success).toBe(false);
      expect(badUrl.message).toContain("company website URL");

      const excessiveKw = await processLeadSubmission(
        { ...BASE_VALID_INPUT, system_kw: 999999 },
        { env: { LEAD_MODE: "demo" } },
      );
      expect(excessiveKw.success).toBe(false);
    });

    it("intercepts honeypot bot submissions without calling the database", async () => {
      const insertSpy = vi.fn();
      const res = await processLeadSubmission(
        { ...BASE_VALID_INPUT, hp_extra: "spam-bot-filled" },
        {
          env: { LEAD_MODE: "live" },
          dbClient: { insertConsultation: insertSpy },
        },
      );

      expect(res.success).toBe(true);
      expect(res.isDemo).toBe(true);
      expect(insertSpy).not.toHaveBeenCalled();
    });

    it("enforces sliding-window rate limiting per normalized phone number", async () => {
      for (let i = 0; i < 5; i++) {
        const okRes = await processLeadSubmission(BASE_VALID_INPUT, {
          env: { LEAD_MODE: "demo" },
        });
        expect(okRes.success).toBe(true);
      }

      const sixthRes = await processLeadSubmission(
        { ...BASE_VALID_INPUT, phone: "+91 98765 43210" },
        { env: { LEAD_MODE: "demo" } },
      );
      expect(sixthRes.success).toBe(false);
      expect(sixthRes.message).toContain("Too many requests");
    });

    it("generates and validates distinct live vs demo reference code formats", () => {
      const liveCode = generateReferenceCode("live");
      const demoCode = generateReferenceCode("demo");

      expect(liveCode).toMatch(/^WNX-[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{6}$/);
      expect(demoCode).toMatch(/^WNX-DEMO-[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{6}$/);

      expect(isValidReferenceCode(liveCode)).toBe(true);
      expect(isValidReferenceCode(demoCode)).toBe(true);
      expect(isDemoReferenceCode(liveCode)).toBe(false);
      expect(isDemoReferenceCode(demoCode)).toBe(true);

      // Rejects placeholder or spoofed strings
      expect(isValidReferenceCode("WNX-PROPOSAL")).toBe(false);
      expect(isValidReferenceCode("WNX-ENTERPRISE")).toBe(false);
      expect(isValidReferenceCode("WNX-101")).toBe(false);
      expect(isValidReferenceCode("WNX-DEMO-101")).toBe(false);
      expect(isValidReferenceCode("")).toBe(false);
    });
  });

  describe("7. Step 5 Multi-Touch Attribution Persistence & v4->v3 Schema Fallback", () => {
    it("sanitizes PII from attribution URLs and falls back cleanly from v4 to v3 when Step 5 columns are absent on remote DB", async () => {
      vi.spyOn(console, "warn").mockImplementation(() => {});
      const payloads: Array<Record<string, unknown>> = [];

      const dbClient: LeadDatabaseClient = {
        async insertConsultation(payload) {
          payloads.push(payload);
          if (payloads.length === 1) {
            return {
              data: null,
              error: {
                code: "PGRST204",
                message:
                  "Could not find the 'first_touch_source' column of 'consultations' in the schema cache",
              },
            };
          }
          return { data: [{ id: "v3-fallback-ok" }], error: null };
        },
      };

      const res = await processLeadSubmission(
        {
          ...BASE_VALID_INPUT,
          utm_source: "google",
          utm_medium: "cpc",
          utm_campaign: "hyd_rooftop_q4",
          landing_url:
            "https://wavenox.in/deploy?utm_source=google&utm_medium=cpc&phone=9876543210&gclid=EAIaIQobChMI_test",
          first_touch_source: "instagram",
          first_touch_medium: "paid_social",
          first_touch_campaign: "villa_reels",
          first_touch_landing_path: "/architects?email=secret@example.com",
          last_touch_source: "google",
          last_touch_medium: "cpc",
          last_touch_campaign: "hyd_rooftop_q4",
          conversion_path: "/deploy?phone=9876543210",
          attribution_channel: "paid_search",
          click_id_type: "gclid",
          click_id_value: "EAIaIQobChMI_test",
        },
        { env: { LEAD_MODE: "live" }, dbClient },
      );

      expect(res.success).toBe(true);
      expect(payloads).toHaveLength(2);
      // Attempt 1 (v4) includes sanitized Step 5 columns with PII stripped
      expect(payloads[0].first_touch_source).toBe("instagram");
      expect(payloads[0].attribution_channel).toBe("paid_search");
      expect(payloads[0].landing_url).not.toContain("9876543210");
      expect(payloads[0].conversion_path).toBe("/deploy");
      // Attempt 2 (v3 fallback) strips Step 5 columns so insertion succeeds on pre-v4 databases
      expect("first_touch_source" in payloads[1]).toBe(false);
      expect(payloads[1].utm_source).toBe("google");
      expect(payloads[1].landing_url).not.toContain("9876543210");
    });
  });
});
