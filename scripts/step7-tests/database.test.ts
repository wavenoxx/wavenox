import { beforeAll, describe, expect, it } from "vitest";
import { createClient } from "@supabase/supabase-js";
import { randomUUID, randomInt } from "node:crypto";
import { execFileSync } from "node:child_process";
import sharp from "sharp";
import { createLiveProjectStore } from "../../src/server/project-store";
import { createProjectsHandler } from "../../src/server/project-http";
import { toCustomerProject, type ProjectActor, type ProjectCommand } from "../../src/lib/projects";
const enabled = process.env.STEP7_TEST_DB === "supabase";
// Hard-coded loopback: this suite cannot target production or staging.
const url = "http://127.0.0.1:54321",
  service = process.env.STEP5_SERVICE_KEY || "unconfigured",
  anon = process.env.STEP5_ANON_KEY || "unconfigured";
const client = (key = service) =>
  createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
const db = client(),
  store = createLiveProjectStore(db);
const staffId = (n: number) => `00000000-0000-4000-8000-00000000000${n}`;
const owner: ProjectActor = { kind: "staff", id: staffId(1), role: "owner_admin" };
let customerA: ProjectActor,
  customerB: ProjectActor,
  unassigned: ProjectActor,
  projectA: string,
  projectB: string;
const tokens: string[] = [];
const emails = [
  "portal-a@example.invalid",
  "portal-b@example.invalid",
  "portal-unassigned@example.invalid",
];
function sql(source: string) {
  execFileSync(
    "psql",
    [
      "postgresql://postgres:postgres@127.0.0.1:54322/postgres",
      "-v",
      "ON_ERROR_STOP=1",
      "-c",
      source,
    ],
    { stdio: "pipe" },
  );
}
async function createProject() {
  const id = randomUUID();
  const r = await db.from("consultations").insert({
    id,
    reference_code: "WNX-S7-" + id.slice(0, 8),
    client_name: "Synthetic portal fixture",
    phone: "9" + randomInt(100000000, 999999999),
    city: "Hyderabad",
    property_tier: "villa",
    source: "drawer",
    status: "contract_signed",
    consent_given: true,
    consent_version: "test",
    consent_at: new Date().toISOString(),
  });
  expect(r.error).toBeNull();
  const input = {
    consultationId: id,
    expectedLeadVersion: 1,
    requestId: randomUUID(),
    title: "Synthetic installation project",
    projectType: "residential" as const,
    city: "Hyderabad",
    coordinatorId: staffId(2),
    contactReference: "Synthetic verified contact evidence",
    authorizationEvidence: "Synthetic operational authorization only",
    prerequisitesConfirmed: true as const,
  };
  return { input, result: await store.create(owner, input) };
}
async function command(
  projectId: string,
  action: ProjectCommand["action"],
  payload: Record<string, unknown>,
  actor = owner,
) {
  const p = await store.read(actor, projectId);
  return store.mutate(actor, {
    projectId,
    expectedVersion: p.version,
    requestId: randomUUID(),
    action,
    payload,
  });
}
describe.skipIf(!enabled)("native Step 7 Auth, PostgreSQL, REST and Storage", () => {
  beforeAll(async () => {
    const actors: ProjectActor[] = [];
    for (const email of emails) {
      const password = randomUUID();
      const r = await db.auth.admin.createUser({ email, password, email_confirm: true });
      expect(r.error).toBeNull();
      actors.push({ kind: "customer", id: r.data.user!.id });
      const login = await client(anon).auth.signInWithPassword({ email, password });
      expect(login.error).toBeNull();
      tokens.push(login.data.session!.access_token);
    }
    [customerA, customerB, unassigned] = actors;
    projectA = (await createProject()).result.projectId;
    projectB = (await createProject()).result.projectId;
    for (const [projectId, email, actor] of [
      [projectA, emails[0], customerA],
      [projectB, emails[1], customerB],
    ] as const) {
      await command(projectId, "invite", { email, reason: "Synthetic verified customer identity" });
      await store.openSession(actor.id, email, randomUUID().replaceAll("-", "").repeat(2));
    }
  }, 60000);
  it.each(["anonymous", "customer", "unassigned", "owner", "coordinator", "viewer", "deactivated"])(
    "denies direct private REST/RPC and storage access to %s",
    async (role) => {
      let token = role === "customer" ? tokens[0] : role === "unassigned" ? tokens[2] : anon;
      if (["owner", "coordinator", "viewer", "deactivated"].includes(role)) {
        const n = ["owner", "coordinator", "viewer", "deactivated"].indexOf(role) + 1;
        const link = await db.auth.admin.generateLink({
          type: "magiclink",
          email: `fixture${n}@example.invalid`,
        });
        expect(link.error).toBeNull();
        const login = await client(anon).auth.verifyOtp({
          email: `fixture${n}@example.invalid`,
          token: link.data.properties!.email_otp,
          type: "email",
        });
        expect(login.error).toBeNull();
        token = login.data.session!.access_token;
      }
      const direct = createClient(url, anon, {
        auth: { persistSession: false },
        global: { headers: { Authorization: "Bearer " + token } },
      });
      for (const table of [
        "installation_projects",
        "project_memberships",
        "project_invitations",
        "project_sessions",
        "project_milestones",
        "project_appointments",
        "project_documents",
        "project_support_requests",
        "project_activities",
        "project_rate_limits",
      ])
        expect((await direct.from(table).select("*")).error, table).not.toBeNull();
      for (const [rpc, args] of Object.entries({
        project_read: { p_actor_kind: "staff", p_actor_id: owner.id, p_project_id: projectA },
        project_open_customer_session: {
          p_user_id: customerA.id,
          p_email: emails[0],
          p_token_hash: "b".repeat(64),
        },
        project_mutate: {
          p_actor_kind: "staff",
          p_actor_id: owner.id,
          p_project_id: projectA,
          p_expected_version: 1,
          p_request_id: randomUUID(),
          p_action: "note",
          p_payload: { summary: "Forgery attempt" },
        },
      }))
        expect((await direct.rpc(rpc, args)).error, rpc).not.toBeNull();
      const upload = await direct.storage
        .from("project-documents")
        .upload(`${projectA}/${randomUUID()}.jpg`, Buffer.from("forged"), {
          contentType: "image/jpeg",
        });
      expect(upload.error).not.toBeNull();
    },
  );
  it("enforces customer ownership, staff scope, inactive accounts and explicit customer DTOs", async () => {
    const p = await store.read(customerA, projectA);
    expect(p.id).toBe(projectA);
    await expect(store.read(customerA, projectB)).rejects.toMatchObject({ status: 403 });
    await expect(store.read(customerB, projectA)).rejects.toMatchObject({ status: 403 });
    expect(await store.list(unassigned)).toEqual([]);
    for (const n of [3, 4])
      await expect(
        store.read(
          {
            kind: "staff",
            id: staffId(n),
            role: n === 3 ? "read_only_viewer" : "sales_coordinator",
          },
          projectA,
        ),
      ).rejects.toMatchObject({ status: 403 });
    await command(projectA, "note", { summary: "PRIVATE STAFF SENTINEL", customerVisible: false });
    expect(JSON.stringify(toCustomerProject(await store.read(customerA, projectA)))).not.toMatch(
      /PRIVATE STAFF SENTINEL|contact_reference|activation_evidence|storage_path/,
    );
    await db.auth.admin.updateUserById(customerB.id, { ban_duration: "24h" });
    await expect(store.read(customerB, projectB)).rejects.toMatchObject({ status: 403 });
    await db.auth.admin.updateUserById(customerB.id, { ban_duration: "none" });
  });
  it("creates one audited project, preserves leads and prevents duplicate activation", async () => {
    const { input, result } = await createProject();
    expect((await store.create(owner, input)).projectId).toBe(result.projectId);
    await expect(store.create(owner, { ...input, requestId: randomUUID() })).rejects.toMatchObject({
      status: 409,
    });
    const p = await store.read(owner, result.projectId);
    expect(p.activities.filter((a) => a.action === "project_created")).toHaveLength(1);
    expect(p.milestones).toHaveLength(10);
    expect(
      (await db.from("consultations").select("status").eq("id", input.consultationId).single()).data
        ?.status,
    ).toBe("contract_signed");
  });
  it("rolls back a mutation when the real audit INSERT fails", async () => {
    const before = await store.read(owner, projectA);
    await expect(
      command(projectA, "note", { summary: "force project audit failure", customerVisible: false }),
    ).rejects.toMatchObject({ status: 503 });
    const after = await store.read(owner, projectA);
    expect(after.version).toBe(before.version);
    expect(after.activities).toEqual(before.activities);
  });
  it("serializes concurrent writes and replays exactly once", async () => {
    const p = await store.read(owner, projectA);
    const c: ProjectCommand = {
      projectId: projectA,
      expectedVersion: p.version,
      requestId: randomUUID(),
      action: "note",
      payload: { summary: "Concurrent atomic project note", customerVisible: false },
    };
    const r = await Promise.allSettled([
      store.mutate(owner, c),
      store.mutate(owner, { ...c, requestId: randomUUID() }),
    ]);
    expect(r.map((x) => x.status).sort()).toEqual(["fulfilled", "rejected"]);
    const succeeded = r[0].status === "fulfilled";
    if (succeeded) expect((await store.mutate(owner, c)).replayed).toBe(true);
    expect((await store.read(owner, projectA)).version).toBe(p.version + 1);
  });
  it("rejects invalid transitions, missing commissioning evidence and customer milestone attempts", async () => {
    await expect(
      command(projectA, "milestone", {
        key: "survey",
        state: "completed",
        summary: "Skipped mandatory transition",
      }),
    ).rejects.toMatchObject({ status: 400 });
    await expect(
      command(projectA, "milestone", {
        key: "fiction",
        state: "in_progress",
        summary: "Unknown milestone attempt",
      }),
    ).rejects.toMatchObject({ status: 400 });
    await expect(
      command(projectA, "status", {
        state: "completed",
        reason: "No evidence to complete project",
      }),
    ).rejects.toMatchObject({ status: 400 });
    await expect(
      command(
        projectA,
        "milestone",
        { key: "survey", state: "in_progress", summary: "Customer fabrication attempt" },
        customerA,
      ),
    ).rejects.toMatchObject({ status: 403 });
  });
  it("records requested vs confirmed appointments, UTC times and real coordinator conflicts", async () => {
    const startsAt = "2027-12-01T04:30:00Z",
      endsAt = "2027-12-01T05:30:00Z";
    const ap = {
      kind: "survey",
      status: "requested",
      startsAt,
      endsAt,
      instructions: "Synthetic site visit request",
    };
    const r = await command(projectA, "appointment", ap, customerA);
    expect((await store.read(customerA, projectA)).appointments[0].status).toBe("requested");
    await command(projectA, "appointment", { ...ap, id: r.resourceId, status: "confirmed" });
    await expect(
      command(projectB, "appointment", { ...ap, status: "confirmed" }),
    ).rejects.toMatchObject({ status: 409 });
    await expect(
      command(projectA, "appointment", { ...ap, id: r.resourceId, status: "completed" }),
    ).rejects.toMatchObject({ status: 400 });
    await command(projectA, "appointment", {
      ...ap,
      id: r.resourceId,
      status: "rescheduled",
      startsAt: "2027-12-02T04:30:00Z",
      endsAt: "2027-12-02T05:30:00Z",
    });
    await command(projectA, "appointment", { ...ap, id: r.resourceId, status: "cancelled" });
    expect((await store.read(customerA, projectA)).appointments[0].status).toBe("cancelled");
  });
  it("protects real private storage, review state, cross-project files and audit append-only", async () => {
    expect((await db.storage.getBucket("project-documents")).data?.public).toBe(false);
    const id = randomUUID(),
      path = `${projectA}/${id}.jpg`;
    const bytes = await sharp({
      create: { width: 40, height: 40, channels: 3, background: "white" },
    })
      .jpeg()
      .toBuffer();
    await store.upload(path, bytes);
    await command(projectA, "document", {
      id,
      title: "Synthetic survey scan",
      kind: "survey",
      visibility: "customer",
      storagePath: path,
      mime: "image/jpeg",
    });
    await expect(store.auditDownload(customerA, id)).rejects.toMatchObject({ status: 403 });
    await command(projectA, "document_review", {
      id,
      verified: true,
      reason: "Synthetic scan content reviewed",
    });
    expect(await store.auditDownload(customerA, id)).toBe(path);
    expect((await store.download(path)).length).toBe(bytes.length);
    await expect(store.auditDownload(customerB, id)).rejects.toMatchObject({ status: 403 });
    const publicResponse = await fetch(`${url}/storage/v1/object/public/project-documents/${path}`);
    expect(publicResponse.ok).toBe(false);
    expect(
      (await client(anon).storage.from("project-documents").download(path)).error,
    ).not.toBeNull();
    expect(
      (
        await db
          .from("project_activities")
          .update({ summary: "forged audit" })
          .eq("project_id", projectA)
      ).error,
    ).not.toBeNull();
  });
  it("isolates support, rate limits requests and hides internal response notes", async () => {
    const r = await command(
      projectA,
      "support",
      { category: "documentation", description: "Please explain the project documents" },
      customerA,
    );
    await expect(
      command(projectB, "support_response", {
        id: r.resourceId,
        status: "resolved",
        publicResponse: "Cross-project response",
        internalNote: "",
      }),
    ).rejects.toMatchObject({ status: 400 });
    await command(projectA, "support_response", {
      id: r.resourceId,
      status: "resolved",
      publicResponse: "Your reviewed documents are available.",
      internalNote: "PRIVATE SUPPORT SENTINEL",
    });
    const dto = toCustomerProject(await store.read(customerA, projectA));
    expect(JSON.stringify(dto)).not.toContain("PRIVATE SUPPORT SENTINEL");
    expect(dto.support[0].resolved_at).toBeTruthy();
    for (let n = 0; n < 4; n++)
      await command(
        projectA,
        "support",
        { category: "other", description: "Synthetic additional assistance" },
        customerA,
      );
    await expect(
      command(
        projectA,
        "support",
        { category: "other", description: "Rate limit test request" },
        customerA,
      ),
    ).rejects.toMatchObject({ status: 429 });
  });
  it("uses real one-time Auth codes; rejects invalid, reused codes and unapproved identities", async () => {
    const link = await db.auth.admin.generateLink({ type: "magiclink", email: emails[0] });
    expect(link.error).toBeNull();
    const auth = client(anon).auth;
    expect(
      (await auth.verifyOtp({ email: emails[0], token: "000000", type: "email" })).error,
    ).not.toBeNull();
    expect(
      (
        await auth.verifyOtp({
          email: emails[0],
          token: link.data.properties!.email_otp,
          type: "email",
        })
      ).data.session,
    ).not.toBeNull();
    expect(
      (
        await client(anon).auth.verifyOtp({
          email: emails[0],
          token: link.data.properties!.email_otp,
          type: "email",
        })
      ).error,
    ).not.toBeNull();
    await expect(store.openSession(unassigned.id, emails[2], "c".repeat(64))).rejects.toMatchObject(
      { status: 403 },
    );
    await expect(
      store.openSession(
        "00000000-0000-4000-8000-000000000101",
        "fixture1@example.invalid",
        "d".repeat(64),
      ),
    ).rejects.toMatchObject({ status: 403 });
  });
  it("expires pending invitations and sessions and revokes membership immediately", async () => {
    const p = (await createProject()).result.projectId;
    await command(p, "invite", { email: emails[2], reason: "Synthetic expiring invitation" });
    sql(
      `UPDATE public.project_invitations SET expires_at=now()-interval '1 second' WHERE project_id='${p}'`,
    );
    await expect(store.openSession(unassigned.id, emails[2], "e".repeat(64))).rejects.toMatchObject(
      { status: 403 },
    );
    await store.openSession(customerA.id, emails[0], "f".repeat(64));
    await store.endSession("f".repeat(64));
    await expect(store.sessionUser("f".repeat(64))).rejects.toMatchObject({ status: 403 });
    await store.openSession(customerA.id, emails[0], "9".repeat(64));
    sql(
      "UPDATE public.project_sessions SET expires_at=now()-interval '1 second' WHERE token_hash=repeat('9',64)",
    );
    await expect(store.sessionUser("9".repeat(64))).rejects.toMatchObject({ status: 403 });
    await command(projectA, "revoke", {
      userId: customerA.id,
      reason: "Synthetic access revoked by owner",
    });
    await expect(store.read(customerA, projectA)).rejects.toMatchObject({ status: 403 });
  });
  it("completes a project only through real staff transitions and reviewed evidence", async () => {
    const id = (await createProject()).result.projectId;
    for (const key of ["installation", "commissioning", "handover"]) {
      await command(id, "milestone", {
        key,
        state: "in_progress",
        summary: "Synthetic operational work started",
      });
      let evidenceDocumentId = null;
      if (key !== "installation") {
        evidenceDocumentId = randomUUID();
        const path = `${id}/${evidenceDocumentId}.jpg`;
        const bytes = await sharp({
          create: { width: 40, height: 40, channels: 3, background: "white" },
        })
          .jpeg()
          .toBuffer();
        await store.upload(path, bytes);
        await command(id, "document", {
          id: evidenceDocumentId,
          title: "Synthetic " + key + " evidence",
          kind: key,
          visibility: "customer",
          storagePath: path,
          mime: "image/jpeg",
        });
        await command(id, "document_review", {
          id: evidenceDocumentId,
          verified: true,
          reason: "Synthetic evidence independently reviewed",
        });
      }
      await command(id, "milestone", {
        key,
        state: "completed",
        summary: "Synthetic operational work completed",
        evidenceDocumentId,
      });
    }
    await command(id, "status", {
      state: "completed",
      reason: "Synthetic commissioning and handover verified",
    });
    const p = await store.read(owner, id);
    expect(p.state).toBe("completed");
    expect(p.completed_at).toBeTruthy();
    await expect(
      command(id, "document_review", {
        id: p.milestones.find((m) => m.key === "handover")!.evidence_document_id,
        verified: false,
        reason: "Attempt to withdraw relied-on evidence",
      }),
    ).rejects.toMatchObject({ status: 409 });
  });
  it("fails closed if LIVE database configuration is missing", async () => {
    const handler = createProjectsHandler({
      mode: "live",
      store: null,
      staff: async () => owner,
      emailEnabled: false,
      auth: null,
    });
    expect((await handler(new Request("http://localhost/api/projects"))).status).toBe(503);
  });
});
