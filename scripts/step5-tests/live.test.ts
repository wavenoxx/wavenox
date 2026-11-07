import { createHmac, randomInt, randomUUID } from "node:crypto";
import { beforeAll, describe, expect, it } from "vitest";
import { createClient } from "@supabase/supabase-js";
import {
  createLiveSupabaseCrmStorageAdapter,
  executeAssignCrmLeadOwner,
  executeCorrectCrmLeadData,
  executeTransitionCrmLeadStage,
  executeLogCrmPrivacyRequest,
  executeCreateCrmFollowupTask,
  executeCompleteCrmFollowupTask,
  executeRescheduleCrmFollowupTask,
  executeAddCrmLeadNote,
  executeGetCrmLeadDetail,
  executeListCrmLeads,
  executeListCrmFollowupQueue,
} from "../../src/server/crm-service";
import { createLiveSupabaseAuthAdapter } from "../../src/server/crm-auth";
import { processLeadSubmission } from "../../src/functions/leads";

// Two loopback-only targets: standalone PostgREST with signed fixture JWTs, or the full local Supabase stack.
const fullStack = process.env.STEP5_TEST_DB === "supabase";
const base = fullStack ? "http://127.0.0.1:54321" : "http://127.0.0.1:45440";
const rest = fullStack ? base + "/rest/v1" : base;
const staffId = (n: number) => "00000000-0000-4000-8000-00000000000" + n;
const subject = (n: number) => "00000000-0000-4000-8000-00000000010" + n;
function fixtureToken(role: string, n: number) {
  const encode = (value: object) => Buffer.from(JSON.stringify(value)).toString("base64url");
  const prefix =
    encode({ alg: "HS256", typ: "JWT" }) +
    "." +
    encode({ sub: subject(n), role, exp: Math.floor(Date.now() / 1000) + 1800 });
  return (
    prefix +
    "." +
    createHmac("sha256", "local-only-step5-disposable-test-signing-fixture")
      .update(prefix)
      .digest("base64url")
  );
}
const anon = fullStack ? process.env.STEP5_ANON_KEY! : fixtureToken("anon", 0);
const service = fullStack ? process.env.STEP5_SERVICE_KEY! : fixtureToken("service_role", 0);
const tokens = Array.from({ length: 6 }, (_, n) => fixtureToken("authenticated", n));
const db = createClient(base, service || "unconfigured", {
  auth: { persistSession: false, autoRefreshToken: false },
  global: {
    fetch: (url, init) =>
      fetch(fullStack ? url : String(url).replace(base + "/rest/v1", base), init),
  },
});
const storage = createLiveSupabaseCrmStorageAdapter(db);
const auth = createLiveSupabaseAuthAdapter(db);
const env = { LEAD_MODE: "live", SUPABASE_URL: base, SUPABASE_SERVICE_ROLE_KEY: service };
function ctx(n: number) {
  return {
    token: tokens[n],
    env,
    storageAdapter: storage,
    authAdapter: fullStack
      ? auth
      : {
          ...auth,
          verifySupabaseJwt: async (token: string) => ({
            user: token === tokens[n] ? { id: subject(n) } : null,
          }),
        },
  };
}
async function submitLead() {
  const input = {
    name: "Database Fixture",
    phone: "9" + randomInt(100000000, 999999999),
    email: "restricted@example.invalid",
    city: "Hyderabad",
    property_tier: "villa",
    source: "drawer",
    notes: "private customer fixture",
    consent_given: true,
    consent_version: "fixture-v1",
    pin_code: "500001",
    discom_code: "TGSPDCL",
    monthly_bill_inr: 5000,
    system_kw: 4,
    battery_units: 0,
    net_price_inr: 300000,
    roof_area_sqft: 900,
    utm_campaign: "local_qa",
    consent_timestamp: new Date().toISOString(),
  };
  const submitted = await processLeadSubmission(input, { env, getSupabaseClient: () => db });
  expect(submitted.success).toBe(true);
  const { data, error } = await db
    .from("consultations")
    .select("*")
    .eq("reference_code", submitted.referenceCode!)
    .single();
  expect(error).toBeNull();
  return data!;
}
async function state(id: string) {
  const [lead, activities, tasks, privacy] = await Promise.all([
    storage.getLeadById(id),
    storage.listLeadActivities(id),
    storage.listFollowupTasks(id),
    storage.listPrivacyRequests(id),
  ]);
  return { lead, activities, tasks, privacy };
}
async function request(path: string, token: string | undefined, method = "GET", body?: object) {
  return fetch(rest + "/" + path, {
    method,
    headers: {
      apikey: anon,
      ...(token ? { Authorization: "Bearer " + token } : {}),
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
}
describe.skipIf(!["supabase", "standalone"].includes(process.env.STEP5_TEST_DB ?? ""))(
  "isolated LIVE adapter and direct Data API",
  () => {
    beforeAll(async () => {
      if (!fullStack) return;
      for (let n = 1; n <= 5; n++) {
        const email = "fixture" + n + "@example.invalid";
        const password = randomUUID();
        const created = await db.auth.admin.createUser({
          id: subject(n),
          email,
          password,
          email_confirm: true,
        });
        expect(created.error).toBeNull();
        const signIn = await createClient(base, anon, {
          auth: { persistSession: false },
        }).auth.signInWithPassword({ email, password });
        expect(signIn.error).toBeNull();
        tokens[n] = signIn.data.session!.access_token;
        if (n === 1 && process.env.STEP5_BROWSER_CREDENTIAL_FILE) {
          // Used only by the subsequent LIVE browser test in this same disposable job.
          const { writeFile } = await import("node:fs/promises");
          await writeFile(process.env.STEP5_BROWSER_CREDENTIAL_FILE, password, { mode: 0o600 });
        }
      }
    }, 60000);
    it.each(["anonymous", "admin", "coordinator", "viewer", "deactivated", "nonstaff"])(
      "denies direct table and RPC privileges for %s",
      async (persona) => {
        const n = [
          "anonymous",
          "admin",
          "coordinator",
          "viewer",
          "deactivated",
          "nonstaff",
        ].indexOf(persona);
        const token = n ? tokens[n] : undefined;
        const leadId = randomUUID();
        for (const table of [
          "consultations",
          "crm_staff_members",
          "crm_lead_activities",
          "crm_followup_tasks",
          "crm_privacy_requests",
        ]) {
          for (const method of ["GET", "PATCH", "DELETE", "POST"]) {
            const body = method === "POST" ? {} : method === "PATCH" ? { id: leadId } : undefined;
            const res = await request(
              table + (method === "POST" ? "" : "?id=eq." + leadId),
              token,
              method,
              body,
            );
            expect([401, 403]).toContain(res.status);
            expect((await res.json()).code).toBe("42501");
          }
        }
        for (const [name, args] of Object.entries({
          crm_transition_lead_stage: { p_new_status: "contacted" },
          crm_atomic_update_lead_with_audit: {
            p_patch: { city: "Fixture" },
            p_action_type: "data_corrected",
            p_reason: "fixture",
            p_note_body: null,
          },
          crm_log_privacy_request: { p_type: "access", p_status: "received", p_summary: "fixture" },
          crm_mutate_followup: {
            p_action: "followup_completed",
            p_task_id: leadId,
            p_assignee: null,
            p_due_at: null,
            p_task_type: null,
            p_note: "fixture",
            p_contact_confirmed: false,
          },
        })) {
          const res = await request("rpc/" + name, token, "POST", {
            p_actor_staff_id: staffId(1),
            p_lead_id: leadId,
            p_expected_version: 1,
            ...args,
          });
          expect([401, 403]).toContain(res.status);
          expect((await res.json()).code).toBe("42501");
        }
      },
    );
    it("denies unlisted and disabled members, and denies writes to viewers", async () => {
      const lead = await submitLead();
      for (const n of [4, 5])
        expect(await executeGetCrmLeadDetail(lead.id, ctx(n))).toMatchObject({
          ok: false,
          status: 403,
        });
      for (const n of [3, 4, 5])
        expect(
          await executeTransitionCrmLeadStage(
            { leadId: lead.id, newStatus: "contacted", expectedVersion: 1 },
            ctx(n),
          ),
        ).toMatchObject({ ok: false, status: 403 });
      for (const n of [3, 4]) {
        const denied = await db.rpc("crm_transition_lead_stage", {
          p_actor_staff_id: staffId(n),
          p_lead_id: lead.id,
          p_expected_version: 1,
          p_new_status: "contacted",
        });
        expect(denied.error?.code).toBe("42501");
      }
      expect(
        await executeLogCrmPrivacyRequest(
          {
            leadId: lead.id,
            expectedVersion: 1,
            requestType: "access",
            status: "received",
            resolutionSummary: "fixture",
          },
          ctx(2),
        ),
      ).toMatchObject({ ok: false, status: 403 });
      expect((await state(lead.id)).activities).toHaveLength(0);
    });
    it("commits exactly one of two same-version writes and rejects stale replay, invalid stages and malformed patches", async () => {
      const lead = await submitLead();
      const input = {
        leadId: lead.id,
        expectedVersion: 1,
        newStatus: "contacted",
        actorStaffId: staffId(1),
      };
      expect(
        await executeTransitionCrmLeadStage({ ...input, newStatus: "installed" }, ctx(2)),
      ).toMatchObject({ ok: false, status: 400 });
      const wrongStage = await db.rpc("crm_transition_lead_stage", {
        p_lead_id: lead.id,
        p_expected_version: 1,
        p_actor_staff_id: staffId(1),
        p_new_status: "installed",
        p_reason: "fixture",
      });
      expect(wrongStage.error?.message).toContain("INVALID_STAGE_TRANSITION");
      const bad = await db.rpc("crm_atomic_update_lead_with_audit", {
        p_lead_id: lead.id,
        p_actor_staff_id: staffId(1),
        p_expected_version: 1,
        p_patch: { notes: "forged" },
        p_action_type: "data_corrected",
        p_reason: "invalid field",
        p_note_body: null,
      });
      expect(bad.error?.message).toContain("INVALID_PATCH_FIELDS");
      const results = await Promise.all([
        executeTransitionCrmLeadStage(input, ctx(2)),
        executeTransitionCrmLeadStage(input, ctx(2)),
      ]);
      expect(results.filter((r) => r.ok)).toHaveLength(1);
      expect(results.find((r) => !r.ok)).toMatchObject({ status: 409 });
      expect(await executeTransitionCrmLeadStage(input, ctx(2))).toMatchObject({
        ok: false,
        status: 409,
      });
      const saved = await state(lead.id);
      expect(saved.lead).toMatchObject({
        crm_version: 2,
        status: "contacted",
        notes: lead.notes,
        consent_at: lead.consent_at,
      });
      expect(saved.activities).toHaveLength(1);
      expect(saved.activities[0]).toMatchObject({
        action_type: "stage_changed",
        actor_staff_id: staffId(2),
        actor_label: "Fixture 2",
      });
      for (const mutation of [
        db.from("crm_lead_activities").update({ reason: "tampered" }),
        db.from("crm_lead_activities").delete(),
      ])
        expect((await mutation.eq("id", saved.activities[0].id)).error?.code).toBe("42501");
    });
    it("rolls back changes to the lead, task, privacy request and audit for each failed operation", async () => {
      const lead = await submitLead();
      const owner = ctx(1);
      const taskInput = {
        leadId: lead.id,
        expectedVersion: 1,
        taskType: "call",
        assignedStaffId: staffId(1),
        dueAt: "2027-01-05T12:00:00Z",
        summary: "Restricted task note",
      };
      const created = await executeCreateCrmFollowupTask(taskInput, owner);
      expect(created.ok).toBe(true);
      if (!created.ok) throw Error(created.message);
      const baseline = await state(lead.id);
      const input = { leadId: lead.id, expectedVersion: 2 };
      const task = { taskId: created.taskId, expectedVersion: 2 };
      const fault = "force audit failure";
      const operations = [
        () =>
          executeTransitionCrmLeadStage({ ...input, newStatus: "contacted", reason: fault }, owner),
        () =>
          executeAssignCrmLeadOwner(
            { ...input, assignedStaffId: staffId(2), reason: fault },
            owner,
          ),
        () =>
          executeCorrectCrmLeadData(
            { ...input, updates: { city: "Fixture change" }, reason: fault },
            owner,
          ),
        () =>
          executeAddCrmLeadNote(
            { ...input, noteBody: fault, qualificationOutcome: "nurture" },
            owner,
          ),
        () =>
          executeLogCrmPrivacyRequest(
            { ...input, requestType: "consent_withdrawal", resolutionSummary: fault },
            owner,
          ),
        () => executeCreateCrmFollowupTask({ ...taskInput, ...input, summary: fault }, owner),
        () =>
          executeCompleteCrmFollowupTask(
            { ...task, completionNote: fault, customerContactConfirmed: true },
            owner,
          ),
        () =>
          executeRescheduleCrmFollowupTask(
            { ...task, newDueAt: "2027-01-02T01:00Z", reason: fault },
            owner,
          ),
      ];
      for (const operation of operations) {
        expect(await operation()).toMatchObject({ ok: false, status: 500 });
        expect(await state(lead.id)).toEqual(baseline);
      }
      expect(await executeCreateCrmFollowupTask(taskInput, owner)).toMatchObject({
        ok: false,
        status: 409,
      });
      expect(
        await executeRescheduleCrmFollowupTask(
          { ...task, newDueAt: "2027-01-02T01:00Z", reason: "client requested" },
          ctx(2),
        ),
      ).toMatchObject({ ok: false, status: 403 });
      expect(
        await executeRescheduleCrmFollowupTask(
          { ...task, newDueAt: "2027-01-02T01:00Z", reason: "fixture reschedule" },
          owner,
        ),
      ).toMatchObject({ ok: true });
      expect(
        await executeCompleteCrmFollowupTask(
          {
            ...task,
            expectedVersion: 3,
            completionNote: "fixture complete",
            customerContactConfirmed: true,
          },
          owner,
        ),
      ).toMatchObject({ ok: true });
      expect((await state(lead.id)).lead).toMatchObject({ crm_version: 4, next_followup_at: null });
      expect((await state(lead.id)).lead?.last_contacted_at).toBeTruthy();
      expect(
        await executeCompleteCrmFollowupTask(
          { ...task, expectedVersion: 4, completionNote: "duplicate" },
          owner,
        ),
      ).toMatchObject({ ok: false, status: 409 });
    });
    it("preserves consent provenance, hides free text from the viewer and records actual before/after values", async () => {
      const lead = await submitLead();
      const owner = ctx(1);
      expect(
        await executeAssignCrmLeadOwner(
          { leadId: lead.id, expectedVersion: 1, assignedStaffId: staffId(2) },
          owner,
        ),
      ).toMatchObject({ ok: true });
      expect(
        await executeCorrectCrmLeadData(
          {
            leadId: lead.id,
            expectedVersion: 2,
            updates: { pin_code: "500099" },
            reason: "Restricted correction",
          },
          owner,
        ),
      ).toMatchObject({ ok: true });
      const note = await executeAddCrmLeadNote(
        {
          leadId: lead.id,
          expectedVersion: 3,
          noteBody: "Restricted staff note",
          qualificationOutcome: "nurture",
        },
        owner,
      );
      expect(note.ok).toBe(true);
      expect(
        await executeLogCrmPrivacyRequest(
          {
            leadId: lead.id,
            expectedVersion: 4,
            requestType: "consent_withdrawal",
            resolutionSummary: "Restricted privacy resolution",
          },
          owner,
        ),
      ).toMatchObject({ ok: true });
      const saved = await state(lead.id);
      expect(saved.lead).toMatchObject({
        crm_version: 5,
        do_not_contact: true,
        consent_version: lead.consent_version,
        notes: lead.notes,
        qualification_outcome: "nurture",
      });
      expect(saved.activities).toHaveLength(4);
      expect(saved.activities.find((a) => a.action_type === "note_added")?.id).toBe(
        note.ok && note.activityId,
      );
      expect(saved.activities.find((a) => a.action_type === "data_corrected")).toMatchObject({
        before_state: { pin_code: "500001" },
        after_state: { pin_code: "500099" },
      });
      const detail = await executeGetCrmLeadDetail(lead.id, ctx(3));
      expect(detail).toMatchObject({
        ok: true,
        data: {
          privacyRequests: [],
          lead: {
            notes: null,
            pin_code: null,
            consent_given: null,
            consent_at: null,
            consent_at_ist: null,
          },
        },
      });
      for (const response of [
        detail,
        await executeListCrmFollowupQueue(ctx(3)),
        await executeListCrmLeads({}, ctx(3)),
      ]) {
        for (const secret of [
          lead.phone,
          "restricted@example.invalid",
          "private customer fixture",
          "Restricted staff note",
          "Restricted correction",
          "Restricted privacy resolution",
          "Restricted task note",
          "500099",
        ])
          expect(JSON.stringify(response)).not.toContain(secret);
      }
    });
    it("fails closed when PostgREST is unavailable", async () => {
      const offline = createLiveSupabaseCrmStorageAdapter(
        createClient("http://127.0.0.1:1", service),
      );
      const changed = await offline.updateLeadRecord(
        randomUUID(),
        1,
        { city: "Fixture" },
        {
          actor_staff_id: staffId(1),
          actor_label: "Fixture",
          action_type: "data_corrected",
          reason: "fixture test",
        },
      );
      expect(changed).toMatchObject({ ok: false, code: "DB_ERROR" });
    });
  },
);
