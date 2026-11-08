import { describe, expect, it, vi } from "vitest";
import { createProjectsHandler, hashPortalToken } from "./project-http";
import { createDemoProjectStore, DEMO_CUSTOMERS } from "./project-demo";
import { DEMO_STAFF_DIRECTORY } from "./crm-auth";
const url = "http://localhost:8080/api/projects";
const owner = {
  kind: "staff" as const,
  id: DEMO_STAFF_DIRECTORY[0].id,
  role: "owner_admin" as const,
};
const make = () => {
  const store = createDemoProjectStore();
  const handler = createProjectsHandler({
    mode: "demo",
    store,
    staff: async () => owner,
    emailEnabled: false,
    auth: null,
  });
  return { store, handler };
};
const post = (body: unknown, cookie = "", origin = "http://localhost:8080") =>
  new Request(url, {
    method: "POST",
    headers: { "content-type": "application/json", origin, cookie },
    body: JSON.stringify(body),
  });
async function customerLogin(
  handler: ReturnType<typeof createProjectsHandler>,
  id = DEMO_CUSTOMERS[0].id,
) {
  const r = await handler(post({ action: "demo_login", personaId: id }));
  expect(r.status).toBe(200);
  return r.headers.get("set-cookie")!.split(";")[0];
}
describe("project HTTP identity and isolation", () => {
  it("requires a separate customer session; staff cookies and bearer JWTs do not identify a customer", async () => {
    const { handler } = make();
    const r = await handler(
      new Request(url, {
        headers: { cookie: "wavenox_crm_session=staff", authorization: "Bearer pretend" },
      }),
    );
    expect(r.status).toBe(401);
    expect(await r.text()).not.toContain("Hyderabad");
  });
  it("sets private HttpOnly cookies, rejects other projects and revokes copied sessions on logout", async () => {
    const { handler } = make();
    const login = await handler(post({ action: "demo_login", personaId: DEMO_CUSTOMERS[0].id }));
    const header = login.headers.get("set-cookie")!;
    expect(header).toContain("HttpOnly");
    expect(header).toContain("SameSite=Lax");
    const cookie = header.split(";")[0];
    const own = await handler(
      new Request(url + "?projectId=00000000-0000-4000-8000-000000000701", { headers: { cookie } }),
    );
    expect(own.status).toBe(200);
    expect(own.headers.get("cache-control")).toContain("no-store");
    expect(await own.text()).not.toContain("activation_evidence");
    expect(
      (
        await handler(
          new Request(url + "?projectId=00000000-0000-4000-8000-000000000702", {
            headers: { cookie },
          }),
        )
      ).status,
    ).toBe(403);
    expect((await handler(post({ action: "logout" }, cookie))).status).toBe(200);
    expect((await handler(new Request(url, { headers: { cookie } }))).status).toBe(401);
  });
  it("rejects cross-origin mutations, viewer writes and actor spoofing", async () => {
    const { handler, store } = make();
    expect((await handler(post({ action: "logout" }, "", "https://attacker.invalid"))).status).toBe(
      403,
    );
    const cookie = await customerLogin(handler);
    const cmd = {
      action: "mutate",
      audience: "customer",
      command: {
        action: "milestone",
        projectId: "00000000-0000-4000-8000-000000000701",
        expectedVersion: 1,
        requestId: crypto.randomUUID(),
        payload: { key: "survey", state: "in_progress", summary: "Pretend customer approval" },
      },
    };
    expect((await handler(post(cmd, cookie))).status).toBe(403);
    const viewer = createProjectsHandler({
      mode: "demo",
      store,
      staff: async () => ({
        kind: "staff",
        id: DEMO_STAFF_DIRECTORY[3].id,
        role: "read_only_viewer",
      }),
      emailEnabled: false,
      auth: null,
    });
    expect((await viewer(post({ ...cmd, audience: "staff" }))).status).toBe(403);
    expect((await handler(post({ ...cmd, actorId: owner.id }, cookie))).status).toBe(400);
  });
  it("does not expose internal notes or support notes in customer JSON", async () => {
    const { handler, store } = make();
    const id = "00000000-0000-4000-8000-000000000701";
    await store.mutate(owner, {
      action: "note",
      projectId: id,
      expectedVersion: 1,
      requestId: crypto.randomUUID(),
      payload: { summary: "PRIVATE STAFF SENTINEL", customerVisible: false },
    });
    const cookie = await customerLogin(handler);
    const r = await handler(new Request(url + "?projectId=" + id, { headers: { cookie } }));
    expect(await r.text()).not.toContain("PRIVATE STAFF SENTINEL");
  });
  it("fails closed on missing LIVE configuration without a synthetic fallback", async () => {
    const handler = createProjectsHandler({
      mode: "live",
      store: null,
      staff: async () => {
        throw new Error("unavailable");
      },
      emailEnabled: false,
      auth: null,
    });
    const r = await handler(new Request(url));
    expect(r.status).toBe(503);
    expect(await r.text()).not.toContain("DEMO");
    expect(
      (await handler(post({ action: "demo_login", personaId: DEMO_CUSTOMERS[0].id }))).status,
    ).not.toBe(200);
  });
  it("does not report OTP delivery when unconfigured and never logs credentials", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      const { handler } = make();
      const r = await handler(post({ action: "request_code", email: "private@example.invalid" }));
      expect(r.status).toBe(503);
      expect(spy).not.toHaveBeenCalled();
      expect(hashPortalToken("secret")).not.toContain("secret");
    } finally {
      spy.mockRestore();
    }
  });
});
describe("project HTTP failure paths", () => {
  it("keeps unknown and approved email requests indistinguishable and refuses unverified identities", async () => {
    const store = createDemoProjectStore();
    const requestCode = vi.fn().mockRejectedValue(new Error("provider unavailable"));
    let allowed = false;
    store.emailAllowed = async () => allowed;
    const handler = createProjectsHandler({
      mode: "live",
      store,
      staff: async () => owner,
      emailEnabled: true,
      rateSecret: "synthetic-test-only",
      auth: {
        requestCode,
        verifyCode: async () => ({
          id: DEMO_CUSTOMERS[0].id,
          email: "fixture@example.invalid",
          emailConfirmed: false,
        }),
      },
    });
    const unknown = await handler(
      post({ action: "request_code", email: "fixture@example.invalid" }),
    );
    allowed = true;
    const known = await handler(post({ action: "request_code", email: "fixture@example.invalid" }));
    expect(unknown.status).toBe(200);
    expect(await unknown.text()).toBe(await known.text());
    expect(requestCode).toHaveBeenCalledOnce();
    const rejected = await handler(
      post({ action: "verify_code", email: "fixture@example.invalid", token: "123456" }),
    );
    expect(rejected.status).toBe(401);
    expect(rejected.headers.has("set-cookie")).toBe(false);
  });
  it("does not emit a session cookie after failed invitation audit or persistence", async () => {
    const { handler, store } = make();
    store.openSession = async () => {
      throw new Error("database unavailable");
    };
    const r = await handler(post({ action: "demo_login", personaId: DEMO_CUSTOMERS[0].id }));
    expect(r.status).toBe(503);
    expect(r.headers.has("set-cookie")).toBe(false);
  });
  it("does not expose document bytes if membership is revoked during storage I/O", async () => {
    const { handler, store } = make();
    const cookie = await customerLogin(handler);
    const projectId = "00000000-0000-4000-8000-000000000701",
      id = crypto.randomUUID(),
      path = `${projectId}/${id}.jpg`;
    await store.upload(path, Buffer.from("private synthetic bytes"));
    await store.mutate(owner, {
      action: "document",
      projectId,
      expectedVersion: 1,
      requestId: crypto.randomUUID(),
      payload: {
        id,
        title: "Synthetic scan",
        kind: "survey",
        visibility: "customer",
        storagePath: path,
        mime: "image/jpeg",
      },
    });
    await store.mutate(owner, {
      action: "document_review",
      projectId,
      expectedVersion: 2,
      requestId: crypto.randomUUID(),
      payload: { id, verified: true, reason: "Synthetic review completed" },
    });
    const original = store.download;
    store.download = async (p) => {
      const bytes = await original(p);
      await store.mutate(owner, {
        action: "revoke",
        projectId,
        expectedVersion: 3,
        requestId: crypto.randomUUID(),
        payload: {
          userId: DEMO_CUSTOMERS[0].id,
          reason: "Synthetic access revoked during download",
        },
      });
      return bytes;
    };
    const r = await handler(
      new Request(`http://localhost:8080/api/project-documents/${id}`, { headers: { cookie } }),
    );
    expect(r.status).toBe(403);
    expect(await r.text()).not.toContain("private synthetic bytes");
  });
  it("blocks document metadata forgery through the generic API", async () => {
    const { handler } = make();
    const id = crypto.randomUUID(),
      projectId = "00000000-0000-4000-8000-000000000701";
    const r = await handler(
      post({
        action: "mutate",
        audience: "staff",
        command: {
          action: "document",
          projectId,
          expectedVersion: 1,
          requestId: crypto.randomUUID(),
          payload: {
            id,
            title: "Forged scan",
            kind: "agreement",
            visibility: "customer",
            storagePath: `${projectId}/${id}.jpg`,
            mime: "image/jpeg",
          },
        },
      }),
    );
    expect(r.status).toBe(403);
  });
});
