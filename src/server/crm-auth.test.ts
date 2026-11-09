import { createClient } from "@supabase/supabase-js";
import { describe, expect, it, vi } from "vitest";
import { createLiveSupabaseAuthAdapter } from "./crm-auth";
import { executeLogoutCrmStaff } from "./crm-service";

const userId = "00000000-0000-4000-8000-000000000101";
const sessionId = "00000000-0000-4000-8000-000000000201";
const token = (claims: object) =>
  `header.${Buffer.from(JSON.stringify(claims)).toString("base64url")}.signature`;

function fixture(active: boolean | "unavailable") {
  const fetcher = vi.fn(async (url: RequestInfo | URL) => {
    if (String(url).endsWith("/auth/v1/user")) {
      return Response.json({ id: userId, email: "synthetic@example.invalid" });
    }
    return active === "unavailable"
      ? Response.json({ message: "database unavailable" }, { status: 503 })
      : Response.json(active);
  });
  const client = createClient("http://127.0.0.1:54321", "synthetic-server-key", {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: fetcher },
  });
  return { adapter: createLiveSupabaseAuthAdapter(client), fetcher };
}

describe("LIVE staff session persistence boundary", () => {
  it("never reports logout success when shared revocation fails", async () => {
    const result = await executeLogoutCrmStaff({
      env: { LEAD_MODE: "live" },
      token: "synthetic-token",
      authAdapter: {
        verifySupabaseJwt: async () => ({ user: null }),
        findStaffByAuthUserId: async () => null,
        revokeSession: async () => false,
      },
    });
    expect(result).toMatchObject({ ok: false, status: 503 });
  });
  it("rejects a valid JWT whose provider session was revoked on another instance", async () => {
    const { adapter } = fixture(false);
    expect((await adapter.verifySupabaseJwt(token({ session_id: sessionId }))).user).toBeNull();
  });
  it("fails closed when the session query or migration is unavailable", async () => {
    const { adapter } = fixture("unavailable");
    expect((await adapter.verifySupabaseJwt(token({ session_id: sessionId }))).user).toBeNull();
  });
  it("does not accept identity-only or malformed session claims", async () => {
    for (const claims of [{}, { session_id: "not-a-uuid" }]) {
      const { adapter } = fixture(true);
      expect((await adapter.verifySupabaseJwt(token(claims))).user).toBeNull();
    }
  });
  it("binds the provider session lookup to the server-verified user", async () => {
    const { adapter, fetcher } = fixture(true);
    expect(
      (await adapter.verifySupabaseJwt(token({ session_id: sessionId, sub: "untrusted" }))).user
        ?.id,
    ).toBe(userId);
    expect(fetcher.mock.calls.map(([url]) => String(url))).toContain(
      "http://127.0.0.1:54321/rest/v1/rpc/crm_session_is_active",
    );
  });
});
