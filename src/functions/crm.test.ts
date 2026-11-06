import { describe, it, expect, beforeEach } from "vitest";
import {
  authenticateAndAuthorizeCrmRequest,
  createDemoStaffSessionToken,
  revokeCrmSessionToken,
  clearRevokedCrmTokens,
  hasCrmPermission,
  maskPhoneNumber,
  maskEmailAddress,
  DEMO_STAFF_DIRECTORY,
  type CrmStaffMember,
  type CrmStaffRole,
} from "@/server/crm-auth";
import {
  resetDemoCrmStore,
  registerDemoLeadInCrmStore,
  createDemoCrmStorageAdapter,
  createLiveSupabaseCrmStorageAdapter,
  executeListCrmLeads,
  executeGetCrmLeadDetail,
  executeTransitionCrmLeadStage,
  executeAssignCrmLeadOwner,
  executeAddCrmLeadNote,
  executeCreateCrmFollowupTask,
  executeCompleteCrmFollowupTask,
  executeRescheduleCrmFollowupTask,
  executeCorrectCrmLeadData,
  executeLogCrmPrivacyRequest,
  executeListCrmFollowupQueue,
  executeGetCrmDashboardMetrics,
} from "@/server/crm-service";
import type { SupabaseClient } from "@supabase/supabase-js";
import { classifyFollowupUrgency, formatTimestampIst, getIstDateKey } from "./crm";
import { processLeadSubmission, resetLeadRateLimiter } from "./leads";

const DEMO_ENV = { LEAD_MODE: "demo" };
const LIVE_CONFIGURED_ENV = {
  LEAD_MODE: "live",
  SUPABASE_URL: "https://wavenox-prod-test.supabase.co",
  SUPABASE_SERVICE_ROLE_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.real-service-key",
};

function getDemoStaffByRole(role: CrmStaffRole, active = true): CrmStaffMember {
  const found = DEMO_STAFF_DIRECTORY.find((s) => s.role === role && s.is_active === active);
  if (!found) {
    throw new Error(`Missing demo staff member for role=${role}, active=${active}`);
  }
  return found;
}

function issueDemoTokenForRole(role: CrmStaffRole, active = true): string {
  const staff = getDemoStaffByRole(role, active);
  return createDemoStaffSessionToken(
    {
      authUserId: staff.auth_user_id,
      staffId: staff.id,
    },
    DEMO_ENV,
  );
}

describe("Step 5 — Private CRM, Staff Auth, Attribution & Governance Suite", () => {
  beforeEach(() => {
    resetDemoCrmStore();
    clearRevokedCrmTokens();
    resetLeadRateLimiter();
  });

  describe("1. Staff Authentication, Session Verification & Negative Access Controls", () => {
    it("rejects unauthenticated requests with 401 unauthenticated", async () => {
      const res = await authenticateAndAuthorizeCrmRequest({
        token: null,
        env: DEMO_ENV,
      });
      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.status).toBe(401);
        expect(res.reason).toBe("unauthenticated");
      }
    });

    it("rejects malformed or tampered tokens with 401 invalid_token", async () => {
      const validToken = issueDemoTokenForRole("owner_admin");
      const tamperedToken = `${validToken}tampered`;

      const res = await authenticateAndAuthorizeCrmRequest({
        token: tamperedToken,
        env: DEMO_ENV,
      });
      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.status).toBe(401);
        expect(res.reason).toBe("invalid_token");
      }
    });

    it("rejects expired session tokens with 401 expired", async () => {
      const nowMs = Date.now();
      const owner = getDemoStaffByRole("owner_admin");
      const token = createDemoStaffSessionToken(
        {
          authUserId: owner.auth_user_id,
          staffId: owner.id,
          nowMs: nowMs - 20 * 60 * 60 * 1000, // Issued 20h ago (TTL is 8h)
        },
        DEMO_ENV,
      );

      const res = await authenticateAndAuthorizeCrmRequest({
        token,
        env: DEMO_ENV,
        nowMs,
      });
      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.status).toBe(401);
        expect(res.reason).toBe("expired");
      }
    });

    it("invalidates logged-out session tokens immediately via revocation registry", async () => {
      const token = issueDemoTokenForRole("owner_admin");

      const beforeLogout = await authenticateAndAuthorizeCrmRequest({ token, env: DEMO_ENV });
      expect(beforeLogout.ok).toBe(true);

      revokeCrmSessionToken(token);

      const afterLogout = await authenticateAndAuthorizeCrmRequest({ token, env: DEMO_ENV });
      expect(afterLogout.ok).toBe(false);
      if (!afterLogout.ok) {
        expect(afterLogout.status).toBe(401);
        expect(afterLogout.reason).toBe("revoked");
      }
    });

    it("rejects demo persona tokens when server is in LIVE mode", async () => {
      const demoToken = issueDemoTokenForRole("owner_admin");

      const res = await authenticateAndAuthorizeCrmRequest({
        token: demoToken,
        env: LIVE_CONFIGURED_ENV,
      });
      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.status).toBe(401);
        expect(res.reason).toBe("invalid_token");
      }
    });

    it("fails closed with 503 live_unconfigured in LIVE mode when Supabase credentials are missing", async () => {
      const res = await authenticateAndAuthorizeCrmRequest({
        token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.some-jwt",
        env: { LEAD_MODE: "live", SUPABASE_URL: "", SUPABASE_SERVICE_ROLE_KEY: "" },
      });
      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.status).toBe(503);
        expect(res.reason).toBe("live_unconfigured");
      }
    });

    it("rejects an authenticated Supabase user who is NOT in crm_staff_members with 403 not_staff", async () => {
      const res = await authenticateAndAuthorizeCrmRequest({
        token: "valid-supabase-jwt-outsider",
        env: LIVE_CONFIGURED_ENV,
        authAdapter: {
          verifySupabaseJwt: async () => ({
            user: { id: "outsider-auth-uuid", email: "random-customer@gmail.com" },
          }),
          findStaffByAuthUserId: async () => null,
        },
      });

      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.status).toBe(403);
        expect(res.reason).toBe("not_staff");
      }
    });

    it("rejects an authenticated staff member whose account is deactivated (is_active = false) with 403 disabled_staff", async () => {
      const deactivatedToken = issueDemoTokenForRole("sales_coordinator", false);
      const res = await authenticateAndAuthorizeCrmRequest({
        token: deactivatedToken,
        env: DEMO_ENV,
      });

      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.status).toBe(403);
        expect(res.reason).toBe("disabled_staff");
      }
    });

    it("derives staff role strictly from server-side crm_staff_members table in LIVE mode", async () => {
      const res = await authenticateAndAuthorizeCrmRequest({
        token: "valid-supabase-jwt-viewer",
        env: LIVE_CONFIGURED_ENV,
        authAdapter: {
          verifySupabaseJwt: async () => ({
            user: { id: "viewer-user-uuid", email: "audit@wavenox.com" },
          }),
          findStaffByAuthUserId: async () => ({
            id: "00000000-0000-4000-8000-000000000199",
            auth_user_id: "viewer-user-uuid",
            email: "audit@wavenox.com",
            full_name: "Meera Nair",
            role: "read_only_viewer",
            is_active: true,
            created_at: "2026-10-01T00:00:00.000Z",
            updated_at: "2026-10-01T00:00:00.000Z",
          }),
        },
      });

      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.staff.role).toBe("read_only_viewer");
        expect(hasCrmPermission(res.staff.role, "leads:list")).toBe(true);
        expect(hasCrmPermission(res.staff.role, "leads:view_unmasked_pii")).toBe(false);
        expect(hasCrmPermission(res.staff.role, "leads:update_stage")).toBe(false);
      }
    });
  });

  describe("2. PII Masking & Role-Scoped Data Visibility", () => {
    it("masks Indian phone numbers and email addresses accurately", () => {
      expect(maskPhoneNumber("+919876543210")).toBe("+91 ••••••3210");
      expect(maskEmailAddress("vikram.aditya@example.com")).toBe("vi•••@example.com");
      expect(maskEmailAddress(null)).toBeNull();
    });

    it("redacts full phone, email, and customer notes when loaded by read_only_viewer", async () => {
      const viewerToken = issueDemoTokenForRole("read_only_viewer");
      const ownerToken = issueDemoTokenForRole("owner_admin");

      const listRes = await executeListCrmLeads(
        { page: 1, pageSize: 20 },
        { token: viewerToken, env: DEMO_ENV },
      );
      expect(listRes.ok).toBe(true);
      if (!listRes.ok) return;

      expect(listRes.items.length).toBeGreaterThan(0);
      for (const item of listRes.items) {
        expect(item.masked_phone).toContain("••••••");
      }

      const targetId = listRes.items[0]!.id;

      // Viewer detail has masked phone, masked email, and redacted notes
      const viewerDetail = await executeGetCrmLeadDetail(targetId, {
        token: viewerToken,
        env: DEMO_ENV,
      });
      expect(viewerDetail.ok).toBe(true);
      if (viewerDetail.ok) {
        expect(viewerDetail.data.lead.pii_masked).toBe(true);
        expect(viewerDetail.data.lead.phone_display).toContain("••••••");
        expect(viewerDetail.data.lead.notes).toBeNull();
        if (viewerDetail.data.lead.email_display) {
          expect(viewerDetail.data.lead.email_display).toContain("•••");
        }
      }

      // Owner Admin receives unmasked phone and email in Lead Detail
      const ownerDetail = await executeGetCrmLeadDetail(targetId, {
        token: ownerToken,
        env: DEMO_ENV,
      });
      expect(ownerDetail.ok).toBe(true);
      if (ownerDetail.ok) {
        expect(ownerDetail.data.lead.pii_masked).toBe(false);
        expect(ownerDetail.data.lead.phone_display).toMatch(/^\+91[6-9]\d{9}$/);
      }
    });
  });

  describe("3. Role-Based Negative Mutation Checks (Viewer & Coordinator Constraints)", () => {
    it("blocks read_only_viewer from stage transitions, owner assignment, notes, follow-ups, corrections, and privacy requests", async () => {
      const viewerToken = issueDemoTokenForRole("read_only_viewer");
      const listRes = await executeListCrmLeads({}, { token: viewerToken, env: DEMO_ENV });
      expect(listRes.ok).toBe(true);
      if (!listRes.ok) return;
      const lead = listRes.items[0]!;

      const stageRes = await executeTransitionCrmLeadStage(
        {
          leadId: lead.id,
          newStatus: "contacted",
          expectedVersion: lead.crm_version,
          reason: "Viewer attempting stage mutation",
        },
        { token: viewerToken, env: DEMO_ENV },
      );
      expect(stageRes.ok).toBe(false);
      if (!stageRes.ok) expect(stageRes.status).toBe(403);

      const assignRes = await executeAssignCrmLeadOwner(
        {
          leadId: lead.id,
          assignedStaffId: "00000000-0000-4000-8000-000000000102",
          expectedVersion: lead.crm_version,
        },
        { token: viewerToken, env: DEMO_ENV },
      );
      expect(assignRes.ok).toBe(false);
      if (!assignRes.ok) expect(assignRes.status).toBe(403);

      const noteRes = await executeAddCrmLeadNote(
        {
          leadId: lead.id,
          expectedVersion: lead.crm_version,
          noteBody: "Viewer attempting to add internal note",
        },
        { token: viewerToken, env: DEMO_ENV },
      );
      expect(noteRes.ok).toBe(false);
      if (!noteRes.ok) expect(noteRes.status).toBe(403);

      const taskRes = await executeCreateCrmFollowupTask(
        {
          leadId: lead.id,
          expectedVersion: lead.crm_version,
          assignedStaffId: "00000000-0000-4000-8000-000000000102",
          taskType: "call",
          dueAt: new Date(Date.now() + 3600_000).toISOString(),
          summary: "Viewer task",
        },
        { token: viewerToken, env: DEMO_ENV },
      );
      expect(taskRes.ok).toBe(false);
      if (!taskRes.ok) expect(taskRes.status).toBe(403);
    });

    it("blocks sales_coordinator from reassigning a lead owned by another staff member while allowing self-claim of unassigned leads", async () => {
      const coordinator = getDemoStaffByRole("sales_coordinator"); // Ananya (...0102)
      const coordToken = issueDemoTokenForRole("sales_coordinator");

      const listRes = await executeListCrmLeads({}, { token: coordToken, env: DEMO_ENV });
      expect(listRes.ok).toBe(true);
      if (!listRes.ok) return;

      // Find a lead owned by someone else (e.g. Kiran ...0103 or Siddharth ...0101)
      const otherOwnedLead = listRes.items.find(
        (l) => l.assigned_staff_id !== null && l.assigned_staff_id !== coordinator.id,
      )!;
      expect(otherOwnedLead).toBeDefined();

      const blockedReassign = await executeAssignCrmLeadOwner(
        {
          leadId: otherOwnedLead.id,
          assignedStaffId: coordinator.id,
          expectedVersion: otherOwnedLead.crm_version,
        },
        { token: coordToken, env: DEMO_ENV },
      );
      expect(blockedReassign.ok).toBe(false);
      if (!blockedReassign.ok) {
        expect(blockedReassign.status).toBe(403);
        expect(blockedReassign.message).toContain("Sales Coordinators cannot reassign leads");
      }

      // Claiming an unassigned lead succeeds
      const unassignedLead = listRes.items.find((l) => l.assigned_staff_id === null)!;
      expect(unassignedLead).toBeDefined();

      const selfClaim = await executeAssignCrmLeadOwner(
        {
          leadId: unassignedLead.id,
          assignedStaffId: coordinator.id,
          expectedVersion: unassignedLead.crm_version,
          reason: "Claiming unassigned enquiry for morning call.",
        },
        { token: coordToken, env: DEMO_ENV },
      );
      expect(selfClaim.ok).toBe(true);
      if (selfClaim.ok) {
        expect(selfClaim.lead.assigned_staff_id).toBe(coordinator.id);
      }
    });
  });

  describe("4. Controlled Stage Transitions, Evidence Requirements & Optimistic Concurrency", () => {
    it("enforces allowed stage transitions and records immutable before/after audit state", async () => {
      const ownerToken = issueDemoTokenForRole("owner_admin");
      const listRes = await executeListCrmLeads(
        { status: "new" },
        { token: ownerToken, env: DEMO_ENV },
      );
      expect(listRes.ok).toBe(true);
      if (!listRes.ok) return;
      const newLead = listRes.items[0]!;

      // Invalid jump: new -> installed
      const invalidJump = await executeTransitionCrmLeadStage(
        {
          leadId: newLead.id,
          newStatus: "installed",
          expectedVersion: newLead.crm_version,
          reason: "Invalid direct jump to installed",
        },
        { token: ownerToken, env: DEMO_ENV },
      );
      expect(invalidJump.ok).toBe(false);
      if (!invalidJump.ok) {
        expect(invalidJump.status).toBe(400);
        expect(invalidJump.reason).toBe("invalid_stage_transition");
      }

      // Valid transition: new -> contacted
      const validStep = await executeTransitionCrmLeadStage(
        {
          leadId: newLead.id,
          newStatus: "contacted",
          expectedVersion: newLead.crm_version,
          reason: "Spoke with client over phone; confirmed TGSPDCL 3-phase service.",
        },
        { token: ownerToken, env: DEMO_ENV },
      );
      expect(validStep.ok).toBe(true);
      if (!validStep.ok) return;
      expect(validStep.lead.status).toBe("contacted");
      expect(validStep.lead.last_contacted_at).toBeTruthy();

      const detailRes = await executeGetCrmLeadDetail(newLead.id, {
        token: ownerToken,
        env: DEMO_ENV,
      });
      expect(detailRes.ok).toBe(true);
      if (detailRes.ok) {
        const latestActivity = detailRes.data.activities[0];
        expect(latestActivity?.action_type).toBe("stage_changed");
        expect(latestActivity?.before_state).toEqual({
          status: "new",
          crm_version: newLead.crm_version,
        });
        expect(latestActivity?.after_state).toEqual({
          status: "contacted",
          crm_version: newLead.crm_version + 1,
        });
      }
    });

    it("requires an evidence note when transitioning to quoted, contract_signed, installed, or archived", async () => {
      const ownerToken = issueDemoTokenForRole("owner_admin");
      const listRes = await executeListCrmLeads(
        { status: "survey_booked" },
        { token: ownerToken, env: DEMO_ENV },
      );
      expect(listRes.ok).toBe(true);
      if (!listRes.ok) return;
      const surveyLead = listRes.items[0]!;

      const missingEvidence = await executeTransitionCrmLeadStage(
        {
          leadId: surveyLead.id,
          newStatus: "quoted",
          expectedVersion: surveyLead.crm_version,
          reason: "ok", // Too short (< 5 chars)
        },
        { token: ownerToken, env: DEMO_ENV },
      );
      expect(missingEvidence.ok).toBe(false);
      if (!missingEvidence.ok) {
        expect(missingEvidence.status).toBe(400);
        expect(missingEvidence.reason).toBe("evidence_reason_required");
      }

      const withEvidence = await executeTransitionCrmLeadStage(
        {
          leadId: surveyLead.id,
          newStatus: "quoted",
          expectedVersion: surveyLead.crm_version,
          reason: "Issued formal proposal WNX-Q-2026-118 for 10 kW TOPCon + 13.5 kWh LFP.",
        },
        { token: ownerToken, env: DEMO_ENV },
      );
      expect(withEvidence.ok).toBe(true);
      if (withEvidence.ok) {
        expect(withEvidence.lead.status).toBe("quoted");
      }
    });

    it("detects concurrent stale updates and rejects with 409 conflict", async () => {
      const ownerToken = issueDemoTokenForRole("owner_admin");
      const coordToken = issueDemoTokenForRole("sales_coordinator");
      const listRes = await executeListCrmLeads(
        { status: "new" },
        { token: ownerToken, env: DEMO_ENV },
      );
      expect(listRes.ok).toBe(true);
      if (!listRes.ok) return;
      const lead = listRes.items[0]!;
      const staleVersion = lead.crm_version;

      const firstUpdate = await executeTransitionCrmLeadStage(
        {
          leadId: lead.id,
          newStatus: "contacted",
          expectedVersion: staleVersion,
          reason: "First update by Owner Admin",
        },
        { token: ownerToken, env: DEMO_ENV },
      );
      expect(firstUpdate.ok).toBe(true);

      const conflictingUpdate = await executeTransitionCrmLeadStage(
        {
          leadId: lead.id,
          newStatus: "qualified",
          expectedVersion: staleVersion,
          reason: "Stale update with outdated version",
        },
        { token: coordToken, env: DEMO_ENV },
      );
      expect(conflictingUpdate.ok).toBe(false);
      if (!conflictingUpdate.ok) {
        expect(conflictingUpdate.status).toBe(409);
        expect(conflictingUpdate.reason).toBe("conflict");
      }
    });

    it("prevents sales_coordinator from restoring an archived lead while allowing owner_admin", async () => {
      const ownerToken = issueDemoTokenForRole("owner_admin");
      const coordToken = issueDemoTokenForRole("sales_coordinator");
      const listRes = await executeListCrmLeads(
        { status: "new" },
        { token: ownerToken, env: DEMO_ENV },
      );
      expect(listRes.ok).toBe(true);
      if (!listRes.ok) return;
      const lead = listRes.items[0]!;

      const archivedRes = await executeTransitionCrmLeadStage(
        {
          leadId: lead.id,
          newStatus: "archived",
          expectedVersion: lead.crm_version,
          reason: "Duplicate test inquiry confirmed with homeowner",
        },
        { token: coordToken, env: DEMO_ENV },
      );
      expect(archivedRes.ok).toBe(true);
      if (!archivedRes.ok) return;

      // Coordinator tries to unarchive -> 403
      const coordUnarchive = await executeTransitionCrmLeadStage(
        {
          leadId: lead.id,
          newStatus: "contacted",
          expectedVersion: archivedRes.lead.crm_version,
          restoreFromArchive: true,
          reason: "Trying to reopen archived lead",
        },
        { token: coordToken, env: DEMO_ENV },
      );
      expect(coordUnarchive.ok).toBe(false);
      if (!coordUnarchive.ok) expect(coordUnarchive.status).toBe(403);

      // Owner Admin restores -> 200
      const ownerUnarchive = await executeTransitionCrmLeadStage(
        {
          leadId: lead.id,
          newStatus: "contacted",
          expectedVersion: archivedRes.lead.crm_version,
          restoreFromArchive: true,
          reason: "Client called back to resume consultation; reopened by Owner Admin.",
        },
        { token: ownerToken, env: DEMO_ENV },
      );
      expect(ownerUnarchive.ok).toBe(true);
      if (ownerUnarchive.ok) {
        expect(ownerUnarchive.lead.status).toBe("contacted");
      }
    });
  });

  describe("5. Separate Staff Notes vs Customer Notes & Follow-Up Task Engine (UTC + IST)", () => {
    it("appends internal staff notes to crm_lead_activities without mutating customer consultations.notes", async () => {
      const coordToken = issueDemoTokenForRole("sales_coordinator");
      const listRes = await executeListCrmLeads({}, { token: coordToken, env: DEMO_ENV });
      expect(listRes.ok).toBe(true);
      if (!listRes.ok) return;
      const lead = listRes.items[0]!;

      const beforeDetail = await executeGetCrmLeadDetail(lead.id, {
        token: coordToken,
        env: DEMO_ENV,
      });
      expect(beforeDetail.ok).toBe(true);
      if (!beforeDetail.ok) return;
      const originalCustomerNotes = beforeDetail.data.lead.notes;

      const noteRes = await executeAddCrmLeadNote(
        {
          leadId: lead.id,
          expectedVersion: lead.crm_version,
          noteBody: "Verified 3-phase meter location on east compound wall; shadow-free terrace.",
        },
        { token: coordToken, env: DEMO_ENV },
      );
      expect(noteRes.ok).toBe(true);

      const afterDetail = await executeGetCrmLeadDetail(lead.id, {
        token: coordToken,
        env: DEMO_ENV,
      });
      expect(afterDetail.ok).toBe(true);
      if (afterDetail.ok) {
        expect(afterDetail.data.lead.notes).toBe(originalCustomerNotes);
        expect(afterDetail.data.activities[0]?.action_type).toBe("note_added");
        expect(afterDetail.data.activities[0]?.note_body).toContain("east compound wall");
      }
    });

    it("schedules, classifies (overdue / due_today / upcoming / completed), reschedules, and completes follow-up tasks", async () => {
      const coordinator = getDemoStaffByRole("sales_coordinator");
      const coordToken = issueDemoTokenForRole("sales_coordinator");
      const listRes = await executeListCrmLeads({}, { token: coordToken, env: DEMO_ENV });
      expect(listRes.ok).toBe(true);
      if (!listRes.ok) return;
      const lead = listRes.items[0]!;

      const futureIso = new Date(Date.now() + 48 * 3600_000).toISOString();
      const createRes = await executeCreateCrmFollowupTask(
        {
          leadId: lead.id,
          expectedVersion: lead.crm_version,
          assignedStaffId: coordinator.id,
          taskType: "whatsapp_review",
          dueAt: futureIso,
          summary: "Send shading simulation report via WhatsApp",
        },
        { token: coordToken, env: DEMO_ENV },
      );
      expect(createRes.ok).toBe(true);
      if (!createRes.ok) return;

      // Classify timing accurately in Asia/Kolkata
      const nowMs = Date.parse("2026-11-06T07:00:00.000Z"); // 12:30 PM IST on 2026-11-06
      expect(classifyFollowupUrgency("pending", "2026-11-06T05:00:00.000Z", nowMs)).toBe("overdue");
      expect(classifyFollowupUrgency("pending", "2026-11-06T11:00:00.000Z", nowMs)).toBe(
        "due_today",
      );
      expect(classifyFollowupUrgency("pending", "2026-11-08T06:00:00.000Z", nowMs)).toBe(
        "upcoming",
      );
      expect(classifyFollowupUrgency("completed", "2026-11-05T06:00:00.000Z", nowMs)).toBe(
        "completed",
      );

      expect(getIstDateKey(Date.parse("2026-11-06T20:00:00.000Z"))).toBe("2026-11-07"); // 01:30 AM IST next day
      expect(formatTimestampIst("2026-11-06T07:00:00.000Z")).toContain("IST");

      // Reschedule task
      const rescheduleRes = await executeRescheduleCrmFollowupTask(
        {
          taskId: createRes.taskId,
          expectedVersion: lead.crm_version + 1,
          newDueAt: new Date(Date.now() + 72 * 3600_000).toISOString(),
          reason: "Client requested afternoon call after architect meeting.",
        },
        { token: coordToken, env: DEMO_ENV },
      );
      expect(rescheduleRes.ok).toBe(true);

      // Complete task
      const completeRes = await executeCompleteCrmFollowupTask(
        {
          taskId: createRes.taskId,
          expectedVersion: lead.crm_version + 2,
          completionNote: "Sent PDF shading layout on WhatsApp; client confirmed receipt.",
          customerContactConfirmed: true,
        },
        { token: coordToken, env: DEMO_ENV },
      );
      expect(completeRes.ok).toBe(true);

      const queueRes = await executeListCrmFollowupQueue({ token: coordToken, env: DEMO_ENV });
      expect(queueRes.ok).toBe(true);
      if (queueRes.ok) {
        const completedTask = queueRes.tasks.find((t) => t.id === createRes.taskId);
        expect(completedTask?.status).toBe("completed");
        expect(completedTask?.completed_at).toBeTruthy();
      }
    });
  });

  describe("6. End-to-End Attribution Persistence & Honest Operational Analytics", () => {
    it("registers newly submitted demo leads into the CRM store with sanitized multi-touch attribution", async () => {
      const submitRes = await processLeadSubmission(
        {
          name: "Dr. Karthikeya Rao",
          phone: "9848011223",
          email: "karthikeya@raohealth.in",
          city: "Hyderabad",
          pin_code: "500034",
          property_tier: "villa",
          discom_code: "TGSPDCL",
          monthly_bill_inr: 19500,
          system_kw: 10,
          battery_units: 1,
          net_price_inr: 795000,
          roof_area_sqft: 1400,
          source: "studio",
          consent_given: true,
          consent_version: "2026-11-v2",
          utm_source: "google",
          utm_medium: "cpc",
          utm_campaign: "hyd_luxury_villas_q4",
          landing_url:
            "https://wavenox.com/deploy?utm_source=google&utm_medium=cpc&phone=9848011223&gclid=EAIaIQobChMI_test99",
          referrer: "https://www.google.com/search?q=solar+hyderabad&email=secret@example.com",
          first_touch_source: "instagram",
          first_touch_medium: "paid_social",
          first_touch_campaign: "architectural_reels_oct",
          first_touch_landing_path:
            "https://wavenox.com/architects?utm_source=instagram&utm_medium=paid_social&name=SecretName",
          first_touch_referrer_domain: "l.instagram.com",
          last_touch_source: "google",
          last_touch_medium: "cpc",
          last_touch_campaign: "hyd_luxury_villas_q4",
          last_touch_landing_path:
            "https://wavenox.com/deploy?utm_source=google&utm_medium=cpc&phone=9848011223&gclid=EAIaIQobChMI_test99",
          conversion_path: "/deploy?bill=19500&phone=9848011223",
          attribution_channel: "paid_search",
          click_id_type: "gclid",
          click_id_value: "EAIaIQobChMI_test99",
        },
        {
          env: DEMO_ENV,
          onDemoLeadRegistered: (demoLead) =>
            registerDemoLeadInCrmStore(
              demoLead as unknown as Parameters<typeof registerDemoLeadInCrmStore>[0],
            ),
        },
      );

      expect(submitRes.success).toBe(true);
      expect(submitRes.referenceCode).toMatch(/^WNX-DEMO-/);

      const ownerToken = issueDemoTokenForRole("owner_admin");
      const listRes = await executeListCrmLeads(
        { search: submitRes.referenceCode },
        { token: ownerToken, env: DEMO_ENV },
      );

      expect(listRes.ok).toBe(true);
      if (!listRes.ok) return;
      expect(listRes.total).toBe(1);
      const summary = listRes.items[0]!;
      expect(summary.reference_code).toBe(submitRes.referenceCode);
      expect(summary.source).toBe("studio");
      expect(summary.attribution_channel).toBe("paid_search");

      const detailRes = await executeGetCrmLeadDetail(summary.id, {
        token: ownerToken,
        env: DEMO_ENV,
      });
      expect(detailRes.ok).toBe(true);
      if (detailRes.ok) {
        const savedLead = detailRes.data.lead;
        expect(savedLead.first_touch_source).toBe("instagram");
        expect(savedLead.last_touch_source).toBe("google");
        expect(savedLead.attribution_channel).toBe("paid_search");
        expect(savedLead.click_id_type).toBe("gclid");

        // Verify PII query params were stripped from all stored URLs
        expect(savedLead.landing_url).not.toContain("9848011223");
        expect(savedLead.first_touch_landing_path).toBe("/architects");
        expect(savedLead.last_touch_landing_path).toBe("/deploy");
        expect(savedLead.conversion_path).toBe("/deploy");
      }
    });

    it("computes honest operational metrics without fabricated revenue or fake ROAS", async () => {
      const ownerToken = issueDemoTokenForRole("owner_admin");
      const metricsRes = await executeGetCrmDashboardMetrics(undefined, {
        token: ownerToken,
        env: DEMO_ENV,
      });

      expect(metricsRes.ok).toBe(true);
      if (!metricsRes.ok) return;
      const { metrics } = metricsRes;

      expect(metrics.totalLeads).toBeGreaterThan(0);
      expect(metrics.financialDisclosures.pipelineRevenueAvailable).toBe(false);
      expect(metrics.financialDisclosures.roasAvailable).toBe(false);
      expect(metrics.financialDisclosures.roasNotice).toBe(
        "Ad spend not connected — ROAS unavailable.",
      );

      const sumByStage = Object.values(metrics.stageCounts).reduce((a, b) => a + b, 0);
      expect(sumByStage).toBe(metrics.totalLeads);

      const sumBySource = metrics.bySource.reduce((acc, item) => acc + item.count, 0);
      expect(sumBySource).toBe(metrics.totalLeads);
    });
  });

  describe("7. Controlled Customer Data Corrections & DPDP Privacy Governance", () => {
    it("records before_state and after_state when correcting customer data", async () => {
      const ownerToken = issueDemoTokenForRole("owner_admin");
      const listRes = await executeListCrmLeads({}, { token: ownerToken, env: DEMO_ENV });
      expect(listRes.ok).toBe(true);
      if (!listRes.ok) return;
      const lead = listRes.items[0]!;

      const corrRes = await executeCorrectCrmLeadData(
        {
          leadId: lead.id,
          expectedVersion: lead.crm_version,
          reason: "Confirmed updated PIN code and DISCOM from homeowner electricity bill",
          updates: {
            pin_code: "500075",
            discom_code: "TGSPDCL",
          },
        },
        { token: ownerToken, env: DEMO_ENV },
      );
      expect(corrRes.ok).toBe(true);

      const detailRes = await executeGetCrmLeadDetail(lead.id, {
        token: ownerToken,
        env: DEMO_ENV,
      });
      expect(detailRes.ok).toBe(true);
      if (detailRes.ok) {
        expect(detailRes.data.lead.pin_code).toBe("500075");
        expect(detailRes.data.activities[0]?.action_type).toBe("data_corrected");
        expect(detailRes.data.activities[0]?.after_state).toEqual({
          pin_code: "500075",
          discom_code: "TGSPDCL",
        });
      }
    });

    it("allows only owner_admin to log privacy requests and marks do_not_contact on consent_withdrawal", async () => {
      const ownerToken = issueDemoTokenForRole("owner_admin");
      const coordToken = issueDemoTokenForRole("sales_coordinator");
      const listRes = await executeListCrmLeads({}, { token: ownerToken, env: DEMO_ENV });
      expect(listRes.ok).toBe(true);
      if (!listRes.ok) return;
      const lead = listRes.items[0]!;

      const blockedCoord = await executeLogCrmPrivacyRequest(
        {
          leadId: lead.id,
          expectedVersion: lead.crm_version,
          requestType: "consent_withdrawal",
          status: "fulfilled",
          resolutionSummary: "Coordinator trying to log privacy request",
        },
        { token: coordToken, env: DEMO_ENV },
      );
      expect(blockedCoord.ok).toBe(false);
      if (!blockedCoord.ok) expect(blockedCoord.status).toBe(403);

      const ownerReq = await executeLogCrmPrivacyRequest(
        {
          leadId: lead.id,
          expectedVersion: lead.crm_version,
          requestType: "consent_withdrawal",
          status: "fulfilled",
          resolutionSummary:
            "Verified customer email request; marked do_not_contact = true and halted outbound follow-ups.",
        },
        { token: ownerToken, env: DEMO_ENV },
      );
      expect(ownerReq.ok).toBe(true);

      const refreshed = await executeGetCrmLeadDetail(lead.id, {
        token: ownerToken,
        env: DEMO_ENV,
      });
      expect(refreshed.ok).toBe(true);
      if (refreshed.ok) {
        expect(refreshed.data.lead.do_not_contact).toBe(true);
        expect(refreshed.data.lead.consent_withdrawn_at).toBeTruthy();
        expect(refreshed.data.privacyRequests[0]?.request_type).toBe("consent_withdrawal");
      }
    });
  });

  describe("9. Atomic CRM Mutations, Forced Audit Failure Rollback & Live RPC Wiring (P0-B)", () => {
    it("rolls back stage transitions, owner assignment, data corrections, notes, follow-up tasks, and privacy requests when audit insertion fails in DEMO adapter", async () => {
      const ownerToken = issueDemoTokenForRole("owner_admin");
      const owner = getDemoStaffByRole("owner_admin");

      // Inspect initial state before forced audit failures
      const initialList = await executeListCrmLeads(
        { status: "new" },
        { token: ownerToken, env: DEMO_ENV },
      );
      expect(initialList.ok).toBe(true);
      if (!initialList.ok) return;
      const targetLead = initialList.items[0]!;
      const initialDetail = await executeGetCrmLeadDetail(targetLead.id, {
        token: ownerToken,
        env: DEMO_ENV,
      });
      expect(initialDetail.ok).toBe(true);
      if (!initialDetail.ok) return;

      const originalVersion = initialDetail.data.lead.crm_version;
      const originalStatus = initialDetail.data.lead.status;
      const originalOwner = initialDetail.data.lead.assigned_staff_id;
      const originalPinCode = initialDetail.data.lead.pin_code;
      const originalNextFollowup = initialDetail.data.lead.next_followup_at;
      const originalDoNotContact = initialDetail.data.lead.do_not_contact;
      const originalActivityCount = initialDetail.data.activities.length;
      const originalTaskCount = initialDetail.data.tasks.length;
      const originalPrivacyCount = initialDetail.data.privacyRequests.length;

      // Fault-injected storage adapter that forces every audit insert to fail
      const failingAuditStorage = createDemoCrmStorageAdapter(undefined, {
        onBeforeAuditInsert: () => {
          throw new Error("Simulated crm_lead_activities insert failure");
        },
      });

      // 1. Stage transition must fail and keep status + crm_version unchanged
      const failedStage = await executeTransitionCrmLeadStage(
        {
          leadId: targetLead.id,
          newStatus: "contacted",
          expectedVersion: originalVersion,
          reason: "Attempting transition when audit log is down",
        },
        { token: ownerToken, env: DEMO_ENV, storageAdapter: failingAuditStorage },
      );
      expect(failedStage.ok).toBe(false);
      if (!failedStage.ok) {
        expect(failedStage.status).toBe(500);
      }

      // 2. Owner assignment must fail and keep assigned_staff_id + crm_version unchanged
      const failedAssign = await executeAssignCrmLeadOwner(
        {
          leadId: targetLead.id,
          assignedStaffId: owner.id,
          expectedVersion: originalVersion,
          reason: "Attempting owner assignment when audit log is down",
        },
        { token: ownerToken, env: DEMO_ENV, storageAdapter: failingAuditStorage },
      );
      expect(failedAssign.ok).toBe(false);
      if (!failedAssign.ok) {
        expect(failedAssign.status).toBe(500);
      }

      // 3. Customer data correction must fail and keep pin_code + crm_version unchanged
      const failedCorrection = await executeCorrectCrmLeadData(
        {
          leadId: targetLead.id,
          expectedVersion: originalVersion,
          reason: "Attempting data correction when audit log is down",
          updates: { pin_code: "500099" },
        },
        { token: ownerToken, env: DEMO_ENV, storageAdapter: failingAuditStorage },
      );
      expect(failedCorrection.ok).toBe(false);
      if (!failedCorrection.ok) {
        expect(failedCorrection.status).toBe(500);
      }

      // 4. Staff note (with qualification update) must fail and keep qualification_outcome unchanged
      const failedNote = await executeAddCrmLeadNote(
        {
          leadId: targetLead.id,
          expectedVersion: originalVersion,
          noteBody: "Internal note that should roll back on audit failure",
          qualificationOutcome: "qualified",
        },
        { token: ownerToken, env: DEMO_ENV, storageAdapter: failingAuditStorage },
      );
      expect(failedNote.ok).toBe(false);
      if (!failedNote.ok) {
        expect(failedNote.status).toBe(500);
      }

      // 5. Follow-up task creation must fail and roll back the created task + next_followup_at
      const failedTaskCreate = await executeCreateCrmFollowupTask(
        {
          leadId: targetLead.id,
          expectedVersion: originalVersion,
          assignedStaffId: owner.id,
          taskType: "call",
          dueAt: new Date(Date.now() + 24 * 3600_000).toISOString(),
          summary: "Task that must roll back when audit insert fails",
        },
        { token: ownerToken, env: DEMO_ENV, storageAdapter: failingAuditStorage },
      );
      expect(failedTaskCreate.ok).toBe(false);
      if (!failedTaskCreate.ok) {
        expect(failedTaskCreate.status).toBe(500);
        expect(failedTaskCreate.reason).toBe("db_error");
      }

      // 6. Privacy request (consent_withdrawal) must fail and roll back do_not_contact + privacy record
      const failedPrivacy = await executeLogCrmPrivacyRequest(
        {
          leadId: targetLead.id,
          expectedVersion: originalVersion,
          requestType: "consent_withdrawal",
          status: "fulfilled",
          resolutionSummary: "Privacy request that must roll back when audit insert fails",
        },
        { token: ownerToken, env: DEMO_ENV, storageAdapter: failingAuditStorage },
      );
      expect(failedPrivacy.ok).toBe(false);
      if (!failedPrivacy.ok) {
        expect(failedPrivacy.status).toBe(500);
        expect(failedPrivacy.reason).toBe("db_error");
      }

      // Verify the lead's entire state is 100% unchanged after all 6 failed mutations
      const afterDetail = await executeGetCrmLeadDetail(targetLead.id, {
        token: ownerToken,
        env: DEMO_ENV,
      });
      expect(afterDetail.ok).toBe(true);
      if (afterDetail.ok) {
        expect(afterDetail.data.lead.crm_version).toBe(originalVersion);
        expect(afterDetail.data.lead.status).toBe(originalStatus);
        expect(afterDetail.data.lead.assigned_staff_id).toBe(originalOwner);
        expect(afterDetail.data.lead.pin_code).toBe(originalPinCode);
        expect(afterDetail.data.lead.next_followup_at).toBe(originalNextFollowup);
        expect(afterDetail.data.lead.do_not_contact).toBe(originalDoNotContact);
        expect(afterDetail.data.activities.length).toBe(originalActivityCount);
        expect(afterDetail.data.tasks.length).toBe(originalTaskCount);
        expect(afterDetail.data.privacyRequests.length).toBe(originalPrivacyCount);
      }

      // 7. Also verify task completion and task reschedule roll back on existing pending task when audit fails
      const queueBefore = await executeListCrmFollowupQueue({ token: ownerToken, env: DEMO_ENV });
      expect(queueBefore.ok).toBe(true);
      if (!queueBefore.ok) return;
      const pendingTask = queueBefore.tasks.find((t) => t.status === "pending")!;
      expect(pendingTask).toBeDefined();
      const originalDueAt = pendingTask.due_at;

      const failedReschedule = await executeRescheduleCrmFollowupTask(
        {
          taskId: pendingTask.id,
          expectedVersion: pendingTask.lead_version,
          newDueAt: "2026-12-01T10:00:00.000Z",
          reason: "Reschedule when audit is down",
        },
        { token: ownerToken, env: DEMO_ENV, storageAdapter: failingAuditStorage },
      );
      expect(failedReschedule.ok).toBe(false);
      if (!failedReschedule.ok) {
        expect(failedReschedule.status).toBe(500);
        expect(failedReschedule.reason).toBe("db_error");
      }

      const failedComplete = await executeCompleteCrmFollowupTask(
        {
          taskId: pendingTask.id,
          expectedVersion: pendingTask.lead_version,
          completionNote: "Complete when audit is down",
          customerContactConfirmed: false,
        },
        { token: ownerToken, env: DEMO_ENV, storageAdapter: failingAuditStorage },
      );
      expect(failedComplete.ok).toBe(false);
      if (!failedComplete.ok) {
        expect(failedComplete.status).toBe(500);
        expect(failedComplete.reason).toBe("db_error");
      }

      const queueAfter = await executeListCrmFollowupQueue({ token: ownerToken, env: DEMO_ENV });
      expect(queueAfter.ok).toBe(true);
      if (queueAfter.ok) {
        const unchangedTask = queueAfter.tasks.find((t) => t.id === pendingTask.id)!;
        expect(unchangedTask.status).toBe("pending");
        expect(unchangedTask.due_at).toBe(originalDueAt);
        expect(unchangedTask.completed_at).toBeNull();
      }
    });

    it("wires LIVE stage transitions and lead updates to atomic PostgreSQL RPCs (crm_transition_lead_stage & crm_atomic_update_lead_with_audit) and enforces 409 conflicts and audit presence", async () => {
      const ownerStaff: CrmStaffMember = {
        id: "00000000-0000-4000-8000-000000000101",
        auth_user_id: "live-owner-auth-id",
        email: "siddharth@wavenox.com",
        full_name: "Siddharth Varma",
        role: "owner_admin",
        is_active: true,
        created_at: "2026-10-01T00:00:00.000Z",
        updated_at: "2026-10-01T00:00:00.000Z",
      };

      const liveAuthAdapter = {
        verifySupabaseJwt: async () => ({
          user: { id: ownerStaff.auth_user_id, email: ownerStaff.email },
        }),
        findStaffByAuthUserId: async () => ownerStaff,
      };

      const baseLeadRow = {
        id: "10000000-0000-4000-8000-000000000003",
        created_at: "2026-11-05T08:15:00.000Z",
        reference_code: "WNX-LIVE-9B5W2X",
        client_name: "Kavitha Deshmukh",
        phone: "+919000000102",
        email: null,
        company_name: null,
        company_url: null,
        city: "Bengaluru",
        pin_code: "560038",
        property_tier: "independent_home",
        discom_code: "BESCOM",
        monthly_bill_inr: 9500,
        system_kw: 6.96,
        battery_units: 1,
        net_price_inr: 615560,
        roof_area_sqft: 950,
        source: "drawer",
        notes: null,
        status: "new",
        consent_given: true,
        consent_version: "2026-11-v2",
        consent_at: "2026-11-05T08:15:00.000Z",
        consent_withdrawn_at: null,
        do_not_contact: false,
        retention_category: "enquiry_24m",
        attribution_channel: "organic_search",
        assigned_staff_id: null,
        next_followup_at: null,
        last_contacted_at: null,
        qualified_at: null,
        qualification_outcome: "pending",
        disqualification_reason: null,
        stage_updated_at: "2026-11-05T08:15:00.000Z",
        last_activity_at: "2026-11-05T08:15:00.000Z",
        crm_version: 1,
      };

      const rpcCalls: Array<{ fn: string; args: Record<string, unknown> }> = [];
      let rpcBehavior: "success" | "missing_audit_id" | "conflict" | "audit_error" = "success";

      const mockSupabase = {
        from: (table: string) => {
          if (table === "consultations") {
            return {
              select: () => ({
                eq: () => ({
                  maybeSingle: async () => ({ data: { ...baseLeadRow }, error: null }),
                }),
              }),
            };
          }
          if (table === "crm_staff_members") {
            return {
              select: () => ({
                order: async () => ({ data: [ownerStaff], error: null }),
              }),
            };
          }
          throw new Error(`Unexpected direct table query on ${table}`);
        },
        rpc: async (fn: string, args: Record<string, unknown>) => {
          rpcCalls.push({ fn, args });
          if (rpcBehavior === "conflict") {
            return {
              data: null,
              error: { message: "CONCURRENT_MODIFICATION_CONFLICT", code: "P0001" },
            };
          }
          if (rpcBehavior === "audit_error") {
            return {
              data: null,
              error: { message: "AUDIT_INSERT_FAILED", code: "P0001" },
            };
          }
          if (rpcBehavior === "missing_audit_id") {
            return {
              data: {
                lead: { ...baseLeadRow, status: "contacted", crm_version: 2 },
                activity_id: null,
              },
              error: null,
            };
          }
          if (fn === "crm_transition_lead_stage") {
            return {
              data: {
                lead: {
                  ...baseLeadRow,
                  status: args.p_new_status,
                  crm_version: Number(args.p_expected_version) + 1,
                },
                activity_id: "20000000-0000-4000-8000-000000000999",
              },
              error: null,
            };
          }
          if (fn === "crm_atomic_update_lead_with_audit") {
            const patch = (args.p_patch ?? {}) as Record<string, unknown>;
            return {
              data: {
                lead: {
                  ...baseLeadRow,
                  ...patch,
                  crm_version: Number(args.p_expected_version) + 1,
                },
                activity_id: "20000000-0000-4000-8000-000000000998",
              },
              error: null,
            };
          }
          return { data: null, error: { message: "Unknown RPC" } };
        },
      } as unknown as SupabaseClient;

      const liveStorage = createLiveSupabaseCrmStorageAdapter(mockSupabase);

      // 1. Successful atomic stage transition via crm_transition_lead_stage RPC
      const stageOk = await executeTransitionCrmLeadStage(
        {
          leadId: baseLeadRow.id,
          newStatus: "contacted",
          expectedVersion: 1,
          reason: "Live RPC stage transition check",
        },
        {
          token: "valid-live-jwt",
          env: LIVE_CONFIGURED_ENV,
          authAdapter: liveAuthAdapter,
          storageAdapter: liveStorage,
        },
      );
      expect(stageOk.ok).toBe(true);
      expect(rpcCalls[0]?.fn).toBe("crm_transition_lead_stage");
      if (stageOk.ok) {
        expect(stageOk.lead.status).toBe("contacted");
        expect(stageOk.lead.crm_version).toBe(2);
      }

      // 2. Rejects mutation if RPC omits mandatory activity_id
      rpcBehavior = "missing_audit_id";
      const missingAuditRes = await executeTransitionCrmLeadStage(
        {
          leadId: baseLeadRow.id,
          newStatus: "contacted",
          expectedVersion: 1,
          reason: "Should fail when activity_id is missing",
        },
        {
          token: "valid-live-jwt",
          env: LIVE_CONFIGURED_ENV,
          authAdapter: liveAuthAdapter,
          storageAdapter: liveStorage,
        },
      );
      expect(missingAuditRes.ok).toBe(false);
      if (!missingAuditRes.ok) {
        expect(missingAuditRes.status).toBe(500);
        expect(missingAuditRes.message).toContain("Mandatory audit activity record missing");
      }

      // 3. Propagates 409 conflict when RPC raises CONCURRENT_MODIFICATION_CONFLICT
      rpcBehavior = "conflict";
      const conflictRes = await executeAssignCrmLeadOwner(
        {
          leadId: baseLeadRow.id,
          assignedStaffId: ownerStaff.id,
          expectedVersion: 1,
          reason: "Stale version check on live RPC",
        },
        {
          token: "valid-live-jwt",
          env: LIVE_CONFIGURED_ENV,
          authAdapter: liveAuthAdapter,
          storageAdapter: liveStorage,
        },
      );
      expect(conflictRes.ok).toBe(false);
      expect(rpcCalls[2]?.fn).toBe("crm_atomic_update_lead_with_audit");
      if (!conflictRes.ok) {
        expect(conflictRes.status).toBe(409);
        expect(conflictRes.reason).toBe("conflict");
      }

      // 4. Rejects owner assignment when RPC raises AUDIT_INSERT_FAILED
      rpcBehavior = "audit_error";
      const auditErrRes = await executeAssignCrmLeadOwner(
        {
          leadId: baseLeadRow.id,
          assignedStaffId: ownerStaff.id,
          expectedVersion: 1,
          reason: "Audit failure check on live RPC",
        },
        {
          token: "valid-live-jwt",
          env: LIVE_CONFIGURED_ENV,
          authAdapter: liveAuthAdapter,
          storageAdapter: liveStorage,
        },
      );
      expect(auditErrRes.ok).toBe(false);
      if (!auditErrRes.ok) {
        expect(auditErrRes.status).toBe(500);
      }
    });
  });
});
