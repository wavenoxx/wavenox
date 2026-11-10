import { createClient } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";
import { clearRevokedCrmTokens, createLiveSupabaseAuthAdapter } from "../../src/server/crm-auth";
import { executeLogoutCrmStaff } from "../../src/server/crm-service";

const enabled = process.env.STEP8_TEST_DB === "supabase";
const url = "http://127.0.0.1:54321";
const service = process.env.STEP5_SERVICE_KEY || "unconfigured";
const anon = process.env.STEP5_ANON_KEY || "unconfigured";
const client = (key = service) =>
  createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
async function signIn() {
  const link = await client().auth.admin.generateLink({
    type: "magiclink",
    email: "fixture1@example.invalid",
  });
  expect(link.error).toBeNull();
  const login = await client(anon).auth.verifyOtp({
    email: "fixture1@example.invalid",
    token: link.data.properties!.email_otp,
    type: "email",
  });
  expect(login.error).toBeNull();
  return login.data.session!.access_token;
}

describe.skipIf(!enabled)("native release session security", () => {
  it("rejects a copied staff cookie after logout on a fresh adapter without process-local revocation", async () => {
    const token = await signIn();
    const adapter = createLiveSupabaseAuthAdapter(client());
    expect((await adapter.verifySupabaseJwt(token)).user).not.toBeNull();
    expect(
      await executeLogoutCrmStaff({ token, env: { LEAD_MODE: "live" }, authAdapter: adapter }),
    ).toEqual({ ok: true });
    clearRevokedCrmTokens();
    const anotherInstance = createLiveSupabaseAuthAdapter(client());
    expect((await anotherInstance.verifySupabaseJwt(token)).user).toBeNull();
  });
  it("denies anonymous and authenticated direct session lookup", async () => {
    const token = await signIn();
    const sessionId = JSON.parse(
      Buffer.from(token.split(".")[1], "base64url").toString(),
    ).session_id;
    const user = await client().auth.getUser(token);
    for (const authorization of [anon, token]) {
      const direct = createClient(url, anon, {
        global: { headers: { Authorization: `Bearer ${authorization}` } },
        auth: { persistSession: false },
      });
      expect(
        (
          await direct.rpc("crm_session_is_active", {
            p_session_id: sessionId,
            p_user_id: user.data.user!.id,
          })
        ).error?.code,
      ).toBe("42501");
    }
    expect(
      (
        await client().rpc("crm_session_is_active", {
          p_session_id: sessionId,
          p_user_id: "00000000-0000-4000-8000-000000000000",
        })
      ).data,
    ).toBe(false);
  });
});
