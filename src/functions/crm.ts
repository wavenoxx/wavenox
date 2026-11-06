import { createServerFn } from "@tanstack/react-start";
import type { CrmStaffRole } from "@/server/crm-auth";
import type { LeadSource } from "./leads";
import type { AttributionChannel, ClickIdType } from "@/lib/telemetry";

export const CRM_LEAD_STATUSES = [
  "new",
  "contacted",
  "qualified",
  "survey_booked",
  "quoted",
  "contract_signed",
  "installed",
  "archived",
] as const;

export type CrmLeadStatus = (typeof CRM_LEAD_STATUSES)[number];

export const ALLOWED_STAGE_TRANSITIONS: Record<CrmLeadStatus, readonly CrmLeadStatus[]> = {
  new: ["contacted", "qualified", "survey_booked", "archived"],
  contacted: ["new", "qualified", "survey_booked", "quoted", "archived"],
  qualified: ["contacted", "survey_booked", "quoted", "archived"],
  survey_booked: ["contacted", "qualified", "quoted", "archived"],
  quoted: ["contacted", "qualified", "survey_booked", "contract_signed", "archived"],
  contract_signed: ["quoted", "installed", "archived"],
  installed: ["contract_signed", "archived"],
  archived: ["new", "contacted", "qualified", "survey_booked", "quoted"],
};

export const CRM_QUALIFICATION_OUTCOMES = [
  "pending",
  "qualified",
  "disqualified",
  "nurture",
] as const;

export type CrmQualificationOutcome = (typeof CRM_QUALIFICATION_OUTCOMES)[number];

export const CRM_TASK_TYPES = [
  "call",
  "whatsapp_review",
  "bill_review",
  "site_survey_confirm",
  "quote_followup",
  "contract_followup",
] as const;

export type CrmTaskType = (typeof CRM_TASK_TYPES)[number];

export const CRM_TASK_STATUSES = ["pending", "completed", "cancelled"] as const;
export type CrmTaskStatus = (typeof CRM_TASK_STATUSES)[number];

export const CRM_ACTIVITY_ACTION_TYPES = [
  "lead_created",
  "stage_changed",
  "owner_assigned",
  "note_added",
  "followup_scheduled",
  "followup_completed",
  "followup_rescheduled",
  "qualification_updated",
  "data_corrected",
  "privacy_request_logged",
] as const;

export type CrmActivityActionType = (typeof CRM_ACTIVITY_ACTION_TYPES)[number];

export const CRM_PRIVACY_REQUEST_TYPES = [
  "access",
  "correction",
  "erasure",
  "consent_withdrawal",
] as const;

export type CrmPrivacyRequestType = (typeof CRM_PRIVACY_REQUEST_TYPES)[number];

export const CRM_PRIVACY_REQUEST_STATUSES = [
  "received",
  "identity_verification_pending",
  "under_review",
  "fulfilled",
  "rejected_retention_mandate",
] as const;

export type CrmPrivacyRequestStatus = (typeof CRM_PRIVACY_REQUEST_STATUSES)[number];

export interface CrmLeadRecord {
  id: string;
  created_at: string;
  reference_code: string;
  client_name: string;
  phone: string;
  email: string | null;
  company_name: string | null;
  company_url: string | null;
  city: string;
  pin_code: string | null;
  property_tier: "villa" | "independent_home" | "commercial";
  discom_code: string | null;
  monthly_bill_inr: number | null;
  system_kw: number | null;
  battery_units: number;
  net_price_inr: number | null;
  roof_area_sqft: number | null;
  source: LeadSource | null;
  notes: string | null;
  status: CrmLeadStatus;
  consent_given: boolean;
  consent_version: string | null;
  consent_at: string | null;
  consent_withdrawn_at: string | null;
  do_not_contact: boolean;
  retention_category: "enquiry_24m" | "project_lifecycle_25y" | "legal_hold";
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_term: string | null;
  utm_content: string | null;
  landing_url: string | null;
  referrer: string | null;
  first_touch_source: string | null;
  first_touch_medium: string | null;
  first_touch_campaign: string | null;
  first_touch_landing_path: string | null;
  first_touch_referrer_domain: string | null;
  first_touch_at: string | null;
  last_touch_source: string | null;
  last_touch_medium: string | null;
  last_touch_campaign: string | null;
  last_touch_landing_path: string | null;
  last_touch_referrer_domain: string | null;
  last_touch_at: string | null;
  conversion_path: string | null;
  attribution_channel: AttributionChannel;
  click_id_type: ClickIdType | null;
  click_id_value: string | null;
  assigned_staff_id: string | null;
  next_followup_at: string | null;
  last_contacted_at: string | null;
  qualified_at: string | null;
  qualification_outcome: CrmQualificationOutcome | null;
  disqualification_reason: string | null;
  stage_updated_at: string;
  last_activity_at: string;
  crm_version: number;
}

export interface CrmLeadSummaryItem {
  id: string;
  reference_code: string;
  created_at: string;
  created_at_ist: string;
  client_name: string;
  masked_phone: string;
  masked_email: string | null;
  company_name: string | null;
  city: string;
  pin_code: string | null;
  property_tier: "villa" | "independent_home" | "commercial";
  discom_code: string | null;
  system_kw: number | null;
  battery_units: number;
  monthly_bill_inr: number | null;
  source: LeadSource | null;
  attribution_channel: AttributionChannel;
  utm_campaign: string | null;
  status: CrmLeadStatus;
  qualification_outcome: CrmQualificationOutcome | null;
  assigned_staff_id: string | null;
  assigned_staff_name: string | null;
  next_followup_at: string | null;
  next_followup_ist: string | null;
  is_overdue: boolean;
  last_activity_at: string;
  last_activity_ist: string;
  crm_version: number;
  possible_duplicate_count: number;
  do_not_contact: boolean;
}

export type CrmAuditStateSnapshot = Record<string, string | number | boolean | null | undefined>;

export interface CrmLeadActivityItem {
  id: string;
  lead_id: string;
  actor_staff_id: string | null;
  actor_label: string;
  action_type: CrmActivityActionType;
  note_body: string | null;
  before_state: CrmAuditStateSnapshot | null;
  after_state: CrmAuditStateSnapshot | null;
  reason: string | null;
  created_at: string;
  created_at_ist: string;
}

export type FollowupUrgency = "overdue" | "due_today" | "upcoming" | "completed" | "cancelled";

export interface CrmFollowupTaskItem {
  lead_version: number | null;
  id: string;
  lead_id: string;
  lead_reference_code: string;
  lead_client_name: string;
  lead_city: string;
  lead_status: CrmLeadStatus;
  assigned_staff_id: string;
  assigned_staff_name: string;
  created_by_staff_id: string | null;
  task_type: CrmTaskType;
  status: CrmTaskStatus;
  due_at: string;
  due_at_ist: string;
  urgency: FollowupUrgency;
  summary: string;
  completed_at: string | null;
  completed_at_ist: string | null;
  completion_note: string | null;
  created_at: string;
  updated_at: string;
}

export interface CrmPrivacyRequestItem {
  id: string;
  lead_id: string;
  lead_reference_code: string;
  request_type: CrmPrivacyRequestType;
  status: CrmPrivacyRequestStatus;
  responsible_staff_id: string | null;
  responsible_staff_name: string | null;
  resolution_summary: string | null;
  requested_at: string;
  requested_at_ist: string;
  resolved_at: string | null;
}

export interface CrmRelatedEnquiryItem {
  id: string;
  reference_code: string;
  created_at: string;
  created_at_ist: string;
  property_tier: string;
  city: string;
  source: LeadSource | null;
  system_kw: number | null;
  status: CrmLeadStatus;
}

export interface CrmLeadDetailPayload {
  lead: Omit<CrmLeadRecord, "phone" | "email" | "consent_given"> & {
    consent_given: boolean | null;
    phone_display: string;
    email_display: string | null;
    pii_masked: boolean;
    created_at_ist: string;
    consent_at_ist: string | null;
    next_followup_ist: string | null;
    last_contacted_ist: string | null;
    stage_updated_ist: string;
    assigned_staff_name: string | null;
    is_overdue: boolean;
  };
  activities: CrmLeadActivityItem[];
  tasks: CrmFollowupTaskItem[];
  privacyRequests: CrmPrivacyRequestItem[];
  relatedEnquiries: CrmRelatedEnquiryItem[];
}

export interface CrmDashboardMetrics {
  mode: "live" | "demo";
  reportingPeriod: {
    dateFrom: string | null;
    dateTo: string | null;
    generatedAtIso: string;
    generatedAtIst: string;
  };
  totalLeads: number;
  eligibleLeadsCount: number;
  unassignedLeadsCount: number;
  overdueFollowupsCount: number;
  dueTodayFollowupsCount: number;
  stageCounts: Record<CrmLeadStatus, number>;
  conversionMetrics: {
    qualifiedCount: number;
    qualifiedRatePct: number;
    surveyBookedCount: number;
    surveyConversionPct: number;
    contractSignedCount: number;
    contractConversionPct: number;
    methodologyNote: string;
  };
  bySource: Array<{ source: string; count: number; pct: number }>;
  byChannel: Array<{ channel: AttributionChannel; count: number; pct: number }>;
  byFirstTouchSource: Array<{ source: string; count: number }>;
  byLastTouchSource: Array<{ source: string; count: number }>;
  byCampaign: Array<{
    campaign: string;
    channel: AttributionChannel;
    source: string;
    totalLeads: number;
    qualifiedLeads: number;
    surveyBookedLeads: number;
    contractSignedLeads: number;
  }>;
  financialDisclosures: {
    pipelineRevenueAvailable: false;
    pipelineRevenueNotice: string;
    roasAvailable: false;
    roasNotice: string;
  };
}

/**
 * Formats an ISO UTC timestamp into Indian Standard Time (Asia/Kolkata, UTC+05:30).
 */
export function formatTimestampIst(isoUtc: string | null | undefined): string {
  if (!isoUtc) return "Not provided";
  const parsed = Date.parse(isoUtc);
  if (Number.isNaN(parsed)) return "Not provided";
  try {
    return (
      new Intl.DateTimeFormat("en-IN", {
        timeZone: "Asia/Kolkata",
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }).format(new Date(parsed)) + " IST"
    );
  } catch {
    return isoUtc;
  }
}

export function getIstDateKey(epochMs: number): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(epochMs));
}

export function classifyFollowupUrgency(
  status: CrmTaskStatus,
  dueAtIso: string,
  nowMs: number = Date.now(),
): FollowupUrgency {
  if (status === "completed") return "completed";
  if (status === "cancelled") return "cancelled";

  const dueMs = Date.parse(dueAtIso);
  if (Number.isNaN(dueMs)) return "upcoming";

  if (dueMs < nowMs) {
    return "overdue";
  }
  if (getIstDateKey(dueMs) === getIstDateKey(nowMs)) {
    return "due_today";
  }
  return "upcoming";
}

// ============================================================================
// TANSTACK START SERVER FUNCTION WRAPPERS (Dynamic Server Imports Only)
// ============================================================================
export const getCrmSession = createServerFn({ method: "GET" }).handler(async () => {
  const { handleGetCrmSession } = await import("@/server/crm-service");
  return handleGetCrmSession();
});

export const loginCrmStaff = createServerFn({ method: "POST" })
  .validator((data: unknown) => data)
  .handler(async ({ data }) => {
    const { handleLoginCrmStaff } = await import("@/server/crm-service");
    return handleLoginCrmStaff(data);
  });

export const logoutCrmStaff = createServerFn({ method: "POST" }).handler(async () => {
  const { handleLogoutCrmStaff } = await import("@/server/crm-service");
  return handleLogoutCrmStaff();
});

export const listCrmLeads = createServerFn({ method: "POST" })
  .validator((data: unknown) => data)
  .handler(
    async ({
      data,
    }): Promise<
      | {
          ok: true;
          mode: "live" | "demo";
          items: CrmLeadSummaryItem[];
          total: number;
          page: number;
          pageSize: number;
          totalPages: number;
          staffDirectory: Array<{
            id: string;
            full_name: string;
            role: CrmStaffRole;
            is_active: boolean;
          }>;
        }
      | { ok: false; status: number; reason: string; message: string }
    > => {
      const { buildServerExecutionContext, executeListCrmLeads } =
        await import("@/server/crm-service");
      const { ctx } = await buildServerExecutionContext();
      return executeListCrmLeads(data, ctx);
    },
  );

export const getCrmLeadDetail = createServerFn({ method: "POST" })
  .validator((data: unknown) => data)
  .handler(
    async ({
      data,
    }): Promise<
      | { ok: true; mode: "live" | "demo"; data: CrmLeadDetailPayload }
      | { ok: false; status: number; reason: string; message: string }
    > => {
      const { buildServerExecutionContext, executeGetCrmLeadDetail } =
        await import("@/server/crm-service");
      const { ctx } = await buildServerExecutionContext();
      const id =
        typeof data === "object" && data !== null && "leadId" in data
          ? (data as { leadId: unknown }).leadId
          : data;
      return executeGetCrmLeadDetail(id, ctx);
    },
  );

export const transitionCrmLeadStage = createServerFn({ method: "POST" })
  .validator((data: unknown) => data)
  .handler(
    async ({
      data,
    }): Promise<
      | { ok: true; lead: CrmLeadRecord }
      | { ok: false; status: number; reason: string; message: string }
    > => {
      const { buildServerExecutionContext, respondToCrmMutation, executeTransitionCrmLeadStage } =
        await import("@/server/crm-service");
      const { ctx } = await buildServerExecutionContext();
      return respondToCrmMutation(executeTransitionCrmLeadStage(data, ctx));
    },
  );

export const assignCrmLeadOwner = createServerFn({ method: "POST" })
  .validator((data: unknown) => data)
  .handler(
    async ({
      data,
    }): Promise<
      | { ok: true; lead: CrmLeadRecord }
      | { ok: false; status: number; reason: string; message: string }
    > => {
      const { buildServerExecutionContext, respondToCrmMutation, executeAssignCrmLeadOwner } =
        await import("@/server/crm-service");
      const { ctx } = await buildServerExecutionContext();
      return respondToCrmMutation(executeAssignCrmLeadOwner(data, ctx));
    },
  );

export const addCrmLeadNote = createServerFn({ method: "POST" })
  .validator((data: unknown) => data)
  .handler(
    async ({
      data,
    }): Promise<
      | { ok: true; activityId: string }
      | { ok: false; status: number; reason: string; message: string }
    > => {
      const { buildServerExecutionContext, respondToCrmMutation, executeAddCrmLeadNote } =
        await import("@/server/crm-service");
      const { ctx } = await buildServerExecutionContext();
      return respondToCrmMutation(executeAddCrmLeadNote(data, ctx));
    },
  );

export const createCrmFollowupTask = createServerFn({ method: "POST" })
  .validator((data: unknown) => data)
  .handler(
    async ({
      data,
    }): Promise<
      { ok: true; taskId: string } | { ok: false; status: number; reason: string; message: string }
    > => {
      const { buildServerExecutionContext, respondToCrmMutation, executeCreateCrmFollowupTask } =
        await import("@/server/crm-service");
      const { ctx } = await buildServerExecutionContext();
      return respondToCrmMutation(executeCreateCrmFollowupTask(data, ctx));
    },
  );

export const completeCrmFollowupTask = createServerFn({ method: "POST" })
  .validator((data: unknown) => data)
  .handler(
    async ({
      data,
    }): Promise<
      { ok: true; taskId: string } | { ok: false; status: number; reason: string; message: string }
    > => {
      const { buildServerExecutionContext, respondToCrmMutation, executeCompleteCrmFollowupTask } =
        await import("@/server/crm-service");
      const { ctx } = await buildServerExecutionContext();
      return respondToCrmMutation(executeCompleteCrmFollowupTask(data, ctx));
    },
  );

export const rescheduleCrmFollowupTask = createServerFn({ method: "POST" })
  .validator((data: unknown) => data)
  .handler(
    async ({
      data,
    }): Promise<
      { ok: true; taskId: string } | { ok: false; status: number; reason: string; message: string }
    > => {
      const {
        buildServerExecutionContext,
        respondToCrmMutation,
        executeRescheduleCrmFollowupTask,
      } = await import("@/server/crm-service");
      const { ctx } = await buildServerExecutionContext();
      return respondToCrmMutation(executeRescheduleCrmFollowupTask(data, ctx));
    },
  );

export const correctCrmLeadData = createServerFn({ method: "POST" })
  .validator((data: unknown) => data)
  .handler(
    async ({
      data,
    }): Promise<
      | { ok: true; lead: CrmLeadRecord }
      | { ok: false; status: number; reason: string; message: string }
    > => {
      const { buildServerExecutionContext, respondToCrmMutation, executeCorrectCrmLeadData } =
        await import("@/server/crm-service");
      const { ctx } = await buildServerExecutionContext();
      return respondToCrmMutation(executeCorrectCrmLeadData(data, ctx));
    },
  );

export const logCrmPrivacyRequest = createServerFn({ method: "POST" })
  .validator((data: unknown) => data)
  .handler(
    async ({
      data,
    }): Promise<
      | { ok: true; requestId: string }
      | { ok: false; status: number; reason: string; message: string }
    > => {
      const { buildServerExecutionContext, respondToCrmMutation, executeLogCrmPrivacyRequest } =
        await import("@/server/crm-service");
      const { ctx } = await buildServerExecutionContext();
      return respondToCrmMutation(executeLogCrmPrivacyRequest(data, ctx));
    },
  );

export const listCrmFollowupQueue = createServerFn({ method: "POST" }).handler(
  async (): Promise<
    | {
        ok: true;
        mode: "live" | "demo";
        tasks: CrmFollowupTaskItem[];
        counts: { overdue: number; dueToday: number; upcoming: number; completed: number };
      }
    | { ok: false; status: number; reason: string; message: string }
  > => {
    const { buildServerExecutionContext, executeListCrmFollowupQueue } =
      await import("@/server/crm-service");
    const { ctx } = await buildServerExecutionContext();
    return executeListCrmFollowupQueue(ctx);
  },
);

export const getCrmDashboardMetrics = createServerFn({ method: "POST" })
  .validator((data: unknown) => data)
  .handler(
    async ({
      data,
    }): Promise<
      | { ok: true; metrics: CrmDashboardMetrics }
      | { ok: false; status: number; reason: string; message: string }
    > => {
      const { buildServerExecutionContext, executeGetCrmDashboardMetrics } =
        await import("@/server/crm-service");
      const { ctx } = await buildServerExecutionContext();
      const filter =
        typeof data === "object" && data !== null
          ? (data as { dateFrom?: string; dateTo?: string })
          : undefined;
      return executeGetCrmDashboardMetrics(filter, ctx);
    },
  );
