import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  authenticateAndAuthorizeCrmRequest,
  createDemoStaffSessionToken,
  createLiveSupabaseAuthAdapter,
  CRM_SESSION_COOKIE_NAME,
  DEMO_STAFF_DIRECTORY,
  getPermissionsForRole,
  hasCrmPermission,
  maskEmailAddress,
  maskPhoneNumber,
  revokeCrmSessionToken,
  type CrmAuthDatabaseAdapter,
  type CrmAuthEnv,
  type CrmPermission,
  type CrmStaffMember,
  type CrmStaffRole,
} from "@/server/crm-auth";
import {
  normalizeIndianPhone,
  resolveLeadExecutionMode,
  SUPPORTED_LEAD_SOURCES,
  type LeadSource,
} from "@/functions/leads";
import { ATTRIBUTION_CHANNELS, type AttributionChannel, type ClickIdType } from "@/lib/telemetry";

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
  notes: string | null; // Original customer submission notes (protected)
  status: CrmLeadStatus;
  consent_given: boolean;
  consent_version: string | null;
  consent_at: string | null;
  consent_withdrawn_at: string | null;
  do_not_contact: boolean;
  retention_category: "enquiry_24m" | "project_lifecycle_25y" | "legal_hold";

  // Attribution
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

  // CRM Operational Fields
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
// ISOLATED DEMO SANDBOX STORE (Used ONLY when LEAD_MODE="demo")
// ============================================================================
interface DemoCrmStoreState {
  staff: CrmStaffMember[];
  leads: CrmLeadRecord[];
  activities: Array<Omit<CrmLeadActivityItem, "created_at_ist">>;
  tasks: Array<{
    lead_version?: number;
    id: string;
    lead_id: string;
    assigned_staff_id: string;
    created_by_staff_id: string | null;
    task_type: CrmTaskType;
    status: CrmTaskStatus;
    due_at: string;
    summary: string;
    completed_at: string | null;
    completion_note: string | null;
    created_at: string;
    updated_at: string;
  }>;
  privacyRequests: Array<{
    id: string;
    lead_id: string;
    request_type: CrmPrivacyRequestType;
    status: CrmPrivacyRequestStatus;
    responsible_staff_id: string | null;
    resolution_summary: string | null;
    requested_at: string;
    resolved_at: string | null;
  }>;
}

function buildInitialDemoStore(): DemoCrmStoreState {
  const staff = DEMO_STAFF_DIRECTORY.map((s) => ({ ...s }));
  const leads: CrmLeadRecord[] = [
    {
      id: "10000000-0000-4000-8000-000000000001",
      created_at: "2026-11-03T05:30:00.000Z",
      reference_code: "WNX-DEMO-7K9P2M",
      client_name: "Raghavendra Prasad (Demo)",
      phone: "+919000000101",
      email: "raghavendra.demo@example.invalid",
      company_name: null,
      company_url: null,
      city: "Hyderabad",
      pin_code: "500033",
      property_tier: "villa",
      discom_code: "TGSPDCL",
      monthly_bill_inr: 18500,
      system_kw: 12.18,
      battery_units: 2,
      net_price_inr: 1219420,
      roof_area_sqft: 1800,
      source: "studio",
      notes:
        "Email: raghavendra.demo@example.invalid | Jubilee Hills plot 42, prefers elevated terrace pergola.",
      status: "qualified",
      consent_given: true,
      consent_version: "2026-11-v2",
      consent_at: "2026-11-03T05:30:00.000Z",
      consent_withdrawn_at: null,
      do_not_contact: false,
      retention_category: "enquiry_24m",
      utm_source: "google",
      utm_medium: "cpc",
      utm_campaign: "hyd_luxury_villas_q4",
      utm_term: "architectural solar hyderabad",
      utm_content: "pergola_ad_v1",
      landing_url:
        "/deploy?utm_source=google&utm_medium=cpc&utm_campaign=hyd_luxury_villas_q4&gclid=DEMO_GCLID_101",
      referrer: "https://google.co.in",
      first_touch_source: "google",
      first_touch_medium: "cpc",
      first_touch_campaign: "hyd_luxury_villas_q4",
      first_touch_landing_path: "/deploy",
      first_touch_referrer_domain: "google.co.in",
      first_touch_at: "2026-11-03T05:22:00.000Z",
      last_touch_source: "google",
      last_touch_medium: "cpc",
      last_touch_campaign: "hyd_luxury_villas_q4",
      last_touch_landing_path: "/deploy",
      last_touch_referrer_domain: "google.co.in",
      last_touch_at: "2026-11-03T05:22:00.000Z",
      conversion_path: "/deploy",
      attribution_channel: "paid_search",
      click_id_type: "gclid",
      click_id_value: "DEMO_GCLID_101",
      assigned_staff_id: "00000000-0000-4000-8000-000000000102",
      next_followup_at: "2026-11-05T06:30:00.000Z", // Overdue relative to 2026-11-06!
      last_contacted_at: "2026-11-04T09:15:00.000Z",
      qualified_at: "2026-11-04T09:20:00.000Z",
      qualification_outcome: "qualified",
      disqualification_reason: null,
      stage_updated_at: "2026-11-04T09:20:00.000Z",
      last_activity_at: "2026-11-04T09:20:00.000Z",
      crm_version: 2,
    },
    {
      id: "10000000-0000-4000-8000-000000000002",
      created_at: "2026-11-04T11:00:00.000Z",
      reference_code: "WNX-DEMO-4H8N3Q",
      client_name: "Raghavendra Prasad (Demo)",
      phone: "+919000000101", // Second legitimate enquiry from same customer for commercial unit!
      email: "raghavendra.demo@example.invalid",
      company_name: "Deccan Precision Engineering (Demo)",
      company_url: "https://deccan-demo.invalid",
      city: "Hyderabad",
      pin_code: "500032",
      property_tier: "commercial",
      discom_code: "TGSPDCL",
      monthly_bill_inr: 185000,
      system_kw: 150,
      battery_units: 0,
      net_price_inr: 6300000,
      roof_area_sqft: 15000,
      source: "enterprise",
      notes: "Commercial proposal for 15,000 sq.ft (~0.15 MWp). Tariff: ₹10.5/unit.",
      status: "survey_booked",
      consent_given: true,
      consent_version: "2026-11-v2",
      consent_at: "2026-11-04T11:00:00.000Z",
      consent_withdrawn_at: null,
      do_not_contact: false,
      retention_category: "enquiry_24m",
      utm_source: "linkedin",
      utm_medium: "paid_social",
      utm_campaign: "c_and_i_sec33_tax_2026",
      utm_term: null,
      utm_content: "carousel_sec33",
      landing_url:
        "/enterprise?utm_source=linkedin&utm_medium=paid_social&utm_campaign=c_and_i_sec33_tax_2026",
      referrer: "https://linkedin.com",
      first_touch_source: "google",
      first_touch_medium: "cpc",
      first_touch_campaign: "hyd_luxury_villas_q4",
      first_touch_landing_path: "/deploy",
      first_touch_referrer_domain: "google.co.in",
      first_touch_at: "2026-11-03T05:22:00.000Z",
      last_touch_source: "linkedin",
      last_touch_medium: "paid_social",
      last_touch_campaign: "c_and_i_sec33_tax_2026",
      last_touch_landing_path: "/enterprise",
      last_touch_referrer_domain: "linkedin.com",
      last_touch_at: "2026-11-04T10:50:00.000Z",
      conversion_path: "/enterprise",
      attribution_channel: "paid_social",
      click_id_type: null,
      click_id_value: null,
      assigned_staff_id: "00000000-0000-4000-8000-000000000101",
      next_followup_at: "2026-11-07T05:30:00.000Z",
      last_contacted_at: "2026-11-05T07:00:00.000Z",
      qualified_at: "2026-11-04T15:00:00.000Z",
      qualification_outcome: "qualified",
      disqualification_reason: null,
      stage_updated_at: "2026-11-05T07:00:00.000Z",
      last_activity_at: "2026-11-05T07:00:00.000Z",
      crm_version: 3,
    },
    {
      id: "10000000-0000-4000-8000-000000000003",
      created_at: "2026-11-05T08:15:00.000Z",
      reference_code: "WNX-DEMO-9B5W2X",
      client_name: "Kavitha Deshmukh (Demo)",
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
      utm_source: null,
      utm_medium: null,
      utm_campaign: null,
      utm_term: null,
      utm_content: null,
      landing_url: "/residential",
      referrer: "https://google.com",
      first_touch_source: null,
      first_touch_medium: null,
      first_touch_campaign: null,
      first_touch_landing_path: "/residential",
      first_touch_referrer_domain: "google.com",
      first_touch_at: "2026-11-05T08:10:00.000Z",
      last_touch_source: null,
      last_touch_medium: null,
      last_touch_campaign: null,
      last_touch_landing_path: "/residential",
      last_touch_referrer_domain: "google.com",
      last_touch_at: "2026-11-05T08:10:00.000Z",
      conversion_path: "/residential",
      attribution_channel: "organic_search",
      click_id_type: null,
      click_id_value: null,
      assigned_staff_id: null, // Unassigned lead
      next_followup_at: null,
      last_contacted_at: null,
      qualified_at: null,
      qualification_outcome: "pending",
      disqualification_reason: null,
      stage_updated_at: "2026-11-05T08:15:00.000Z",
      last_activity_at: "2026-11-05T08:15:00.000Z",
      crm_version: 1,
    },
    {
      id: "10000000-0000-4000-8000-000000000004",
      created_at: "2026-11-01T10:00:00.000Z",
      reference_code: "WNX-DEMO-3F6T8C",
      client_name: "Ar. Devika Menon (Demo)",
      phone: "+919000000103",
      email: "devika.studio@example.invalid",
      company_name: "Studio Dakshin Architecture (Demo)",
      company_url: "https://dakshin-demo.invalid",
      city: "Hyderabad",
      pin_code: "500075",
      property_tier: "villa",
      discom_code: "TGSPDCL",
      monthly_bill_inr: 24000,
      system_kw: 15.08,
      battery_units: 2,
      net_price_inr: 1385000,
      roof_area_sqft: 2400,
      source: "architects",
      notes:
        "Architectural CAD/BIM inquiry from Studio Dakshin Architecture (Demo) for project in Kokapet.",
      status: "quoted",
      consent_given: true,
      consent_version: "2026-11-v2",
      consent_at: "2026-11-01T10:00:00.000Z",
      consent_withdrawn_at: null,
      do_not_contact: false,
      retention_category: "enquiry_24m",
      utm_source: "archdaily_india",
      utm_medium: "referral",
      utm_campaign: "architect_partner_2026",
      utm_term: null,
      utm_content: null,
      landing_url:
        "/architects?utm_source=archdaily_india&utm_medium=referral&utm_campaign=architect_partner_2026",
      referrer: "https://archdaily.com",
      first_touch_source: "archdaily_india",
      first_touch_medium: "referral",
      first_touch_campaign: "architect_partner_2026",
      first_touch_landing_path: "/architects",
      first_touch_referrer_domain: "archdaily.com",
      first_touch_at: "2026-11-01T09:52:00.000Z",
      last_touch_source: "archdaily_india",
      last_touch_medium: "referral",
      last_touch_campaign: "architect_partner_2026",
      last_touch_landing_path: "/architects",
      last_touch_referrer_domain: "archdaily.com",
      last_touch_at: "2026-11-01T09:52:00.000Z",
      conversion_path: "/architects",
      attribution_channel: "referral",
      click_id_type: null,
      click_id_value: null,
      assigned_staff_id: "00000000-0000-4000-8000-000000000103",
      next_followup_at: "2026-11-06T11:30:00.000Z",
      last_contacted_at: "2026-11-03T12:00:00.000Z",
      qualified_at: "2026-11-02T08:00:00.000Z",
      qualification_outcome: "qualified",
      disqualification_reason: null,
      stage_updated_at: "2026-11-03T12:00:00.000Z",
      last_activity_at: "2026-11-03T12:00:00.000Z",
      crm_version: 4,
    },
    {
      id: "10000000-0000-4000-8000-000000000005",
      created_at: "2026-10-28T07:45:00.000Z",
      reference_code: "WNX-DEMO-6L2R9V",
      client_name: "Consumer USC-100998877 (Demo)",
      phone: "+919000000104",
      email: null,
      company_name: null,
      company_url: null,
      city: "Telangana",
      pin_code: "500084",
      property_tier: "villa",
      discom_code: "TGSPDCL",
      monthly_bill_inr: null,
      system_kw: 15,
      battery_units: 0,
      net_price_inr: null,
      roof_area_sqft: null,
      source: "net_metering",
      notes:
        "Feasibility check for USC: 100998877 under TGSPDCL. Sanctioned load: 15 kW. Permissible solar: 15.0 kW.",
      status: "contacted",
      consent_given: true,
      consent_version: "2026-11-v2",
      consent_at: "2026-10-28T07:45:00.000Z",
      consent_withdrawn_at: null,
      do_not_contact: false,
      retention_category: "enquiry_24m",
      utm_source: null,
      utm_medium: null,
      utm_campaign: null,
      utm_term: null,
      utm_content: null,
      landing_url: "/net-metering",
      referrer: null,
      first_touch_source: null,
      first_touch_medium: null,
      first_touch_campaign: null,
      first_touch_landing_path: "/net-metering",
      first_touch_referrer_domain: null,
      first_touch_at: "2026-10-28T07:40:00.000Z",
      last_touch_source: null,
      last_touch_medium: null,
      last_touch_campaign: null,
      last_touch_landing_path: "/net-metering",
      last_touch_referrer_domain: null,
      last_touch_at: "2026-10-28T07:40:00.000Z",
      conversion_path: "/net-metering",
      attribution_channel: "direct",
      click_id_type: null,
      click_id_value: null,
      assigned_staff_id: "00000000-0000-4000-8000-000000000102",
      next_followup_at: null,
      last_contacted_at: "2026-10-29T06:00:00.000Z",
      qualified_at: null,
      qualification_outcome: "pending",
      disqualification_reason: null,
      stage_updated_at: "2026-10-29T06:00:00.000Z",
      last_activity_at: "2026-10-29T06:00:00.000Z",
      crm_version: 2,
    },
  ];

  const activities: DemoCrmStoreState["activities"] = [
    {
      id: "20000000-0000-4000-8000-000000000001",
      lead_id: "10000000-0000-4000-8000-000000000001",
      actor_staff_id: null,
      actor_label: "System Lead Capture",
      action_type: "lead_created",
      note_body: "Lead submitted via studio with consent version 2026-11-v2.",
      before_state: null,
      after_state: { status: "new", source: "studio" },
      reason: null,
      created_at: "2026-11-03T05:30:00.000Z",
    },
    {
      id: "20000000-0000-4000-8000-000000000002",
      lead_id: "10000000-0000-4000-8000-000000000001",
      actor_staff_id: "00000000-0000-4000-8000-000000000102",
      actor_label: "Ananya Reddy (Senior Solar Coordinator)",
      action_type: "stage_changed",
      note_body: null,
      before_state: { status: "new", crm_version: 1 },
      after_state: { status: "qualified", crm_version: 2 },
      reason: "Reviewed 12-month TGSPDCL bill history; 15 kW 3-phase sanctioned load confirmed.",
      created_at: "2026-11-04T09:20:00.000Z",
    },
    {
      id: "20000000-0000-4000-8000-000000000003",
      lead_id: "10000000-0000-4000-8000-000000000001",
      actor_staff_id: "00000000-0000-4000-8000-000000000102",
      actor_label: "Ananya Reddy (Senior Solar Coordinator)",
      action_type: "note_added",
      note_body:
        "Client requested elevated pergola layout over south-west terrace deck; structural column drawings requested before site survey.",
      before_state: null,
      after_state: { qualification_outcome: "qualified" },
      reason: null,
      created_at: "2026-11-04T09:25:00.000Z",
    },
  ];

  const tasks: DemoCrmStoreState["tasks"] = [
    {
      id: "30000000-0000-4000-8000-000000000001",
      lead_id: "10000000-0000-4000-8000-000000000001",
      assigned_staff_id: "00000000-0000-4000-8000-000000000102",
      created_by_staff_id: "00000000-0000-4000-8000-000000000102",
      task_type: "site_survey_confirm",
      status: "pending",
      due_at: "2026-11-05T06:30:00.000Z", // Overdue task
      summary: "Confirm structural engineer visit slot for Jubilee Hills terrace pergola check",
      completed_at: null,
      completion_note: null,
      created_at: "2026-11-04T09:25:00.000Z",
      updated_at: "2026-11-04T09:25:00.000Z",
    },
    {
      id: "30000000-0000-4000-8000-000000000002",
      lead_id: "10000000-0000-4000-8000-000000000004",
      assigned_staff_id: "00000000-0000-4000-8000-000000000103",
      created_by_staff_id: "00000000-0000-4000-8000-000000000101",
      task_type: "quote_followup",
      status: "pending",
      due_at: "2026-11-06T11:30:00.000Z",
      summary:
        "Review preliminary quotation WNX-Q-2026-44 and DWG string layout with principal architect",
      completed_at: null,
      completion_note: null,
      created_at: "2026-11-03T12:05:00.000Z",
      updated_at: "2026-11-03T12:05:00.000Z",
    },
    {
      id: "30000000-0000-4000-8000-000000000003",
      lead_id: "10000000-0000-4000-8000-000000000002",
      assigned_staff_id: "00000000-0000-4000-8000-000000000101",
      created_by_staff_id: "00000000-0000-4000-8000-000000000101",
      task_type: "site_survey_confirm",
      status: "pending",
      due_at: "2026-11-07T05:30:00.000Z",
      summary: "Coordinate HT transformer clearance & PEB purlin load sheet with facility manager",
      completed_at: null,
      completion_note: null,
      created_at: "2026-11-05T07:05:00.000Z",
      updated_at: "2026-11-05T07:05:00.000Z",
    },
  ];

  return {
    staff,
    leads,
    activities,
    tasks,
    privacyRequests: [],
  };
}

let demoCrmStore: DemoCrmStoreState = buildInitialDemoStore();

export function resetDemoCrmStore(): void {
  demoCrmStore = buildInitialDemoStore();
}

/**
 * Registers a newly submitted DEMO lead into the isolated demo CRM store so E2E and sandbox flows
 * can immediately inspect newly submitted leads in `/ops` without touching live storage.
 */
export function registerDemoLeadInCrmStore(input: {
  referenceCode: string;
  name: string;
  phone: string;
  email?: string | null;
  company_name?: string | null;
  company_url?: string | null;
  city: string;
  pin_code?: string | null;
  property_tier: "villa" | "independent_home" | "commercial";
  discom_code?: string | null;
  monthly_bill_inr?: number | null;
  system_kw?: number | null;
  battery_units?: number;
  net_price_inr?: number | null;
  roof_area_sqft?: number | null;
  source: LeadSource;
  notes?: string | null;
  consent_version: string;
  consent_at: string;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  utm_term?: string | null;
  utm_content?: string | null;
  landing_url?: string | null;
  referrer?: string | null;
  first_touch_source?: string | null;
  first_touch_medium?: string | null;
  first_touch_campaign?: string | null;
  first_touch_landing_path?: string | null;
  first_touch_referrer_domain?: string | null;
  first_touch_at?: string | null;
  last_touch_source?: string | null;
  last_touch_medium?: string | null;
  last_touch_campaign?: string | null;
  last_touch_landing_path?: string | null;
  last_touch_referrer_domain?: string | null;
  last_touch_at?: string | null;
  conversion_path?: string | null;
  attribution_channel?: AttributionChannel;
  click_id_type?: ClickIdType | null;
  click_id_value?: string | null;
}): CrmLeadRecord {
  const nowIso = new Date().toISOString();
  const id = `10000000-0000-4000-8000-${String(Date.now()).slice(-12).padStart(12, "0")}`;
  const record: CrmLeadRecord = {
    id,
    created_at: nowIso,
    reference_code: input.referenceCode,
    client_name: input.name,
    phone: input.phone,
    email: input.email ?? null,
    company_name: input.company_name ?? null,
    company_url: input.company_url ?? null,
    city: input.city || "Hyderabad",
    pin_code: input.pin_code ?? null,
    property_tier: input.property_tier,
    discom_code: input.discom_code ?? null,
    monthly_bill_inr: input.monthly_bill_inr ?? null,
    system_kw: input.system_kw ?? null,
    battery_units: input.battery_units ?? 0,
    net_price_inr: input.net_price_inr ?? null,
    roof_area_sqft: input.roof_area_sqft ?? null,
    source: input.source,
    notes: input.notes ?? null,
    status: "new",
    consent_given: true,
    consent_version: input.consent_version,
    consent_at: input.consent_at,
    consent_withdrawn_at: null,
    do_not_contact: false,
    retention_category: "enquiry_24m",
    utm_source: input.utm_source ?? null,
    utm_medium: input.utm_medium ?? null,
    utm_campaign: input.utm_campaign ?? null,
    utm_term: input.utm_term ?? null,
    utm_content: input.utm_content ?? null,
    landing_url: input.landing_url ?? null,
    referrer: input.referrer ?? null,
    first_touch_source: input.first_touch_source ?? input.utm_source ?? null,
    first_touch_medium: input.first_touch_medium ?? input.utm_medium ?? null,
    first_touch_campaign: input.first_touch_campaign ?? input.utm_campaign ?? null,
    first_touch_landing_path: input.first_touch_landing_path ?? null,
    first_touch_referrer_domain: input.first_touch_referrer_domain ?? null,
    first_touch_at: input.first_touch_at ?? nowIso,
    last_touch_source: input.last_touch_source ?? input.utm_source ?? null,
    last_touch_medium: input.last_touch_medium ?? input.utm_medium ?? null,
    last_touch_campaign: input.last_touch_campaign ?? input.utm_campaign ?? null,
    last_touch_landing_path: input.last_touch_landing_path ?? null,
    last_touch_referrer_domain: input.last_touch_referrer_domain ?? null,
    last_touch_at: input.last_touch_at ?? nowIso,
    conversion_path: input.conversion_path ?? null,
    attribution_channel: input.attribution_channel ?? "unknown",
    click_id_type: input.click_id_type ?? null,
    click_id_value: input.click_id_value ?? null,
    assigned_staff_id: null,
    next_followup_at: null,
    last_contacted_at: null,
    qualified_at: null,
    qualification_outcome: "pending",
    disqualification_reason: null,
    stage_updated_at: nowIso,
    last_activity_at: nowIso,
    crm_version: 1,
  };

  demoCrmStore.leads.unshift(record);
  demoCrmStore.activities.unshift({
    id: `20000000-0000-4000-8000-${String(Date.now()).slice(-12).padStart(12, "0")}`,
    lead_id: id,
    actor_staff_id: null,
    actor_label: "System Lead Capture (Demo)",
    action_type: "lead_created",
    note_body: `Lead submitted via ${input.source} with consent version ${input.consent_version}.`,
    before_state: null,
    after_state: { status: "new", source: input.source },
    reason: null,
    created_at: nowIso,
  });

  return record;
}

// ============================================================================
// STORAGE ADAPTER INTERFACE (Supports Live Supabase DB & Isolated Demo Store)
// ============================================================================
type RelatedChange =
  | {
      action: "followup_scheduled";
      assignee: string;
      due: string;
      taskType: CrmTaskType;
      note: string;
    }
  | { action: "followup_rescheduled"; taskId: string; assignee: string; due: string; note: string }
  | { action: "followup_completed"; taskId: string; confirmed: boolean; note: string }
  | {
      action: "privacy_request_logged";
      requestType: CrmPrivacyRequestType;
      status: CrmPrivacyRequestStatus;
      note: string;
    };

type MutationFailure = {
  ok: false;
  code: "NOT_FOUND" | "CONFLICT" | "FORBIDDEN" | "DB_ERROR";
  message: string;
};

function mutationFailure(result: MutationFailure) {
  const status = { NOT_FOUND: 404, CONFLICT: 409, FORBIDDEN: 403, DB_ERROR: 500 }[result.code];
  return { ok: false as const, status, reason: result.code.toLowerCase(), message: result.message };
}
const conflict = {
  ok: false,
  code: "CONFLICT",
  message: "The record changed. Refresh and try again.",
} as const;

export interface CrmStorageAdapter {
  listStaffMembers: () => Promise<CrmStaffMember[]>;
  getAllLeadsRaw: () => Promise<CrmLeadRecord[]>;
  getLeadById: (leadId: string) => Promise<CrmLeadRecord | null>;
  transitionLeadStage: (input: {
    leadId: string;
    expectedVersion: number;
    newStatus: CrmLeadStatus;
    actorStaffId: string;
    actorLabel: string;
    reason: string | null;
    qualificationOutcome: CrmQualificationOutcome | null;
    disqualificationReason: string | null;
    restoreFromArchive: boolean;
    nowIso: string;
  }) => Promise<{ ok: true; lead: CrmLeadRecord; activityId: string } | MutationFailure>;
  updateLeadRecord: (
    leadId: string,
    expectedVersion: number,
    patch: Partial<CrmLeadRecord>,
    activity: {
      actor_staff_id: string;
      actor_label: string;
      action_type: CrmActivityActionType;
      note_body?: string | null;
      before_state?: CrmAuditStateSnapshot | null;
      after_state?: CrmAuditStateSnapshot | null;
      reason?: string | null;
    },
  ) => Promise<{ ok: true; lead: CrmLeadRecord; activityId: string } | MutationFailure>;
  listLeadActivities: (
    leadId: string,
  ) => Promise<Array<Omit<CrmLeadActivityItem, "created_at_ist">>>;
  listFollowupTasks: (leadId?: string) => Promise<DemoCrmStoreState["tasks"]>;
  listPrivacyRequests: (leadId?: string) => Promise<DemoCrmStoreState["privacyRequests"]>;
  mutateRelated: (
    leadId: string,
    expectedVersion: number,
    actor: CrmStaffMember,
    change: RelatedChange,
  ) => Promise<{ ok: true; id: string } | MutationFailure>;
}

function recomputeLeadNextFollowup(leadId: string, store: DemoCrmStoreState): string | null {
  const pending = store.tasks
    .filter((t) => t.lead_id === leadId && t.status === "pending")
    .sort((a, b) => Date.parse(a.due_at) - Date.parse(b.due_at));
  return pending[0]?.due_at ?? null;
}

export interface DemoCrmStorageOptions {
  onBeforeAuditInsert?: (activity: Omit<CrmLeadActivityItem, "created_at_ist">) => void;
}

export function createDemoCrmStorageAdapter(
  store: DemoCrmStoreState = demoCrmStore,
  options?: DemoCrmStorageOptions,
): CrmStorageAdapter {
  return {
    async listStaffMembers() {
      return store.staff.map((s) => ({ ...s }));
    },
    async getAllLeadsRaw() {
      return store.leads.map((l) => ({ ...l }));
    },
    async getLeadById(leadId: string) {
      const found = store.leads.find((l) => l.id === leadId);
      return found ? { ...found } : null;
    },
    async transitionLeadStage(input) {
      const idx = store.leads.findIndex((l) => l.id === input.leadId);
      if (idx === -1) {
        return { ok: false, code: "NOT_FOUND", message: "Lead record not found." };
      }
      const current = store.leads[idx];
      if (current.crm_version !== input.expectedVersion) {
        return {
          ok: false,
          code: "CONFLICT",
          message:
            "Concurrent modification conflict: this lead was updated by another staff member. Please refresh and try again.",
        };
      }

      const nowIso = input.nowIso || new Date().toISOString();
      const retentionCategory =
        current.retention_category !== "legal_hold" &&
        (input.newStatus === "contract_signed" || input.newStatus === "installed")
          ? "project_lifecycle_25y"
          : current.retention_category;

      const updated: CrmLeadRecord = {
        ...current,
        status: input.newStatus,
        stage_updated_at: nowIso,
        last_activity_at: nowIso,
        last_contacted_at:
          input.newStatus === "contacted" && !current.last_contacted_at
            ? nowIso
            : current.last_contacted_at,
        qualified_at:
          input.newStatus === "qualified" && !current.qualified_at ? nowIso : current.qualified_at,
        qualification_outcome:
          input.newStatus === "qualified"
            ? (input.qualificationOutcome ?? "qualified")
            : (input.qualificationOutcome ?? current.qualification_outcome),
        disqualification_reason: input.disqualificationReason ?? current.disqualification_reason,
        retention_category: retentionCategory,
        crm_version: current.crm_version + 1,
      };

      const activityRecord: Omit<CrmLeadActivityItem, "created_at_ist"> = {
        id: crypto.randomUUID(),
        lead_id: input.leadId,
        actor_staff_id: input.actorStaffId,
        actor_label: input.actorLabel,
        action_type: "stage_changed",
        note_body: null,
        before_state: { status: current.status, crm_version: current.crm_version },
        after_state: { status: input.newStatus, crm_version: updated.crm_version },
        reason: input.reason ?? null,
        created_at: nowIso,
      };

      try {
        options?.onBeforeAuditInsert?.(activityRecord);
      } catch (err) {
        return {
          ok: false,
          code: "DB_ERROR",
          message:
            err instanceof Error
              ? err.message
              : "Audit activity insertion failed; stage transition rolled back.",
        };
      }

      store.leads[idx] = updated;
      store.activities.unshift(activityRecord);
      return { ok: true, lead: { ...updated }, activityId: activityRecord.id };
    },
    async updateLeadRecord(leadId, expectedVersion, patch, activity) {
      const idx = store.leads.findIndex((l) => l.id === leadId);
      if (idx === -1) {
        return { ok: false, code: "NOT_FOUND", message: "Lead record not found." };
      }
      const current = store.leads[idx];
      if (current.crm_version !== expectedVersion) {
        return {
          ok: false,
          code: "CONFLICT",
          message:
            "Concurrent modification conflict: this lead was updated by another staff member. Please refresh and try again.",
        };
      }

      const nowIso = new Date().toISOString();
      const updated: CrmLeadRecord = {
        ...current,
        ...patch,
        last_activity_at: nowIso,
        crm_version: current.crm_version + 1,
      };
      const activityRecord: Omit<CrmLeadActivityItem, "created_at_ist"> = {
        id: crypto.randomUUID(),
        lead_id: leadId,
        actor_staff_id: activity.actor_staff_id,
        actor_label: activity.actor_label,
        action_type: activity.action_type,
        note_body: activity.note_body ?? null,
        before_state: activity.before_state ?? null,
        after_state: activity.after_state ?? null,
        reason: activity.reason ?? null,
        created_at: nowIso,
      };

      try {
        options?.onBeforeAuditInsert?.(activityRecord);
      } catch (err) {
        return {
          ok: false,
          code: "DB_ERROR",
          message:
            err instanceof Error
              ? err.message
              : "Audit activity insertion failed; lead update rolled back.",
        };
      }

      store.leads[idx] = updated;
      store.activities.unshift(activityRecord);
      return { ok: true, lead: { ...updated }, activityId: activityRecord.id };
    },
    async listLeadActivities(leadId: string) {
      return store.activities
        .filter((a) => a.lead_id === leadId)
        .sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at));
    },
    async listFollowupTasks(leadId?: string) {
      const filtered = leadId ? store.tasks.filter((t) => t.lead_id === leadId) : store.tasks;
      return filtered.map((t) => ({ ...t }));
    },
    async listPrivacyRequests(leadId?: string) {
      const filtered = leadId
        ? store.privacyRequests.filter((r) => r.lead_id === leadId)
        : store.privacyRequests;
      return filtered.map((r) => ({ ...r }));
    },
    async mutateRelated(leadId, expectedVersion, actor, change) {
      const lead = store.leads.find((row) => row.id === leadId);
      if (!lead) return { ok: false, code: "NOT_FOUND", message: "Lead record not found." };
      if (lead.crm_version !== expectedVersion) return conflict;
      const prior =
        "taskId" in change
          ? store.tasks.find((row) => row.id === change.taskId && row.lead_id === leadId)
          : undefined;
      if ("taskId" in change && prior?.status !== "pending") return conflict;
      const now = new Date().toISOString();
      const id = prior?.id ?? crypto.randomUUID();
      const event = {
        id: crypto.randomUUID(),
        lead_id: lead.id,
        actor_staff_id: actor.id,
        actor_label: actor.full_name,
        action_type: change.action,
        created_at: now,
        note_body: change.note,
        reason: null,
        before_state: prior ? { ...prior } : null,
        after_state: { id, ...change },
      };
      try {
        options?.onBeforeAuditInsert?.(event);
      } catch {
        return { ok: false, code: "DB_ERROR", message: "Mandatory audit insertion failed." };
      }
      switch (change.action) {
        case "followup_scheduled":
          store.tasks.push({
            id,
            lead_id: lead.id,
            assigned_staff_id: change.assignee,
            created_by_staff_id: actor.id,
            task_type: change.taskType,
            status: "pending",
            due_at: change.due,
            summary: change.note,
            completed_at: null,
            completion_note: null,
            created_at: now,
            updated_at: now,
          });
          break;
        case "followup_rescheduled":
          Object.assign(prior!, {
            due_at: change.due,
            assigned_staff_id: change.assignee,
            updated_at: now,
          });
          break;
        case "followup_completed":
          Object.assign(prior!, {
            status: "completed",
            completed_at: now,
            completion_note: change.note,
            updated_at: now,
          });
          if (change.confirmed) lead.last_contacted_at = now;
          break;
        case "privacy_request_logged":
          store.privacyRequests.unshift({
            id,
            lead_id: lead.id,
            request_type: change.requestType,
            status: change.status,
            responsible_staff_id: actor.id,
            resolution_summary: change.note,
            requested_at: now,
            resolved_at: change.status === "fulfilled" ? now : null,
          });
          if (change.requestType === "consent_withdrawal") {
            lead.consent_withdrawn_at ??= now;
            lead.do_not_contact = true;
          }
          break;
      }
      if (change.action !== "privacy_request_logged")
        lead.next_followup_at = recomputeLeadNextFollowup(leadId, store);
      lead.last_activity_at = now;
      lead.crm_version++;
      store.activities.unshift(event);
      return { ok: true, id };
    },
  };
}

function normalizeDbRowToLeadRecord(row: Record<string, unknown>): CrmLeadRecord {
  const createdAt = typeof row.created_at === "string" ? row.created_at : new Date().toISOString();
  const rawChannel =
    typeof row.attribution_channel === "string" ? row.attribution_channel : "unknown";
  const channel = ATTRIBUTION_CHANNELS.includes(rawChannel as AttributionChannel)
    ? (rawChannel as AttributionChannel)
    : "unknown";

  return {
    id: String(row.id),
    created_at: createdAt,
    reference_code: String(row.reference_code || "WNX-UNKNOWN"),
    client_name: String(row.client_name || "Not provided"),
    phone: String(row.phone || ""),
    email: typeof row.email === "string" ? row.email : null,
    company_name: typeof row.company_name === "string" ? row.company_name : null,
    company_url: typeof row.company_url === "string" ? row.company_url : null,
    city: String(row.city || "Hyderabad"),
    pin_code: typeof row.pin_code === "string" ? row.pin_code : null,
    property_tier:
      row.property_tier === "commercial" || row.property_tier === "independent_home"
        ? row.property_tier
        : "villa",
    discom_code: typeof row.discom_code === "string" ? row.discom_code : null,
    monthly_bill_inr: row.monthly_bill_inr != null ? Number(row.monthly_bill_inr) : null,
    system_kw: row.system_kw != null ? Number(row.system_kw) : null,
    battery_units: row.battery_units != null ? Number(row.battery_units) : 0,
    net_price_inr: row.net_price_inr != null ? Number(row.net_price_inr) : null,
    roof_area_sqft: row.roof_area_sqft != null ? Number(row.roof_area_sqft) : null,
    source:
      typeof row.source === "string" && SUPPORTED_LEAD_SOURCES.includes(row.source as LeadSource)
        ? (row.source as LeadSource)
        : null,
    notes: typeof row.notes === "string" ? row.notes : null,
    status:
      typeof row.status === "string" && CRM_LEAD_STATUSES.includes(row.status as CrmLeadStatus)
        ? (row.status as CrmLeadStatus)
        : "new",
    consent_given: Boolean(row.consent_given),
    consent_version: typeof row.consent_version === "string" ? row.consent_version : null,
    consent_at: typeof row.consent_at === "string" ? row.consent_at : null,
    consent_withdrawn_at:
      typeof row.consent_withdrawn_at === "string" ? row.consent_withdrawn_at : null,
    do_not_contact: Boolean(row.do_not_contact),
    retention_category:
      row.retention_category === "project_lifecycle_25y" || row.retention_category === "legal_hold"
        ? row.retention_category
        : "enquiry_24m",
    utm_source: typeof row.utm_source === "string" ? row.utm_source : null,
    utm_medium: typeof row.utm_medium === "string" ? row.utm_medium : null,
    utm_campaign: typeof row.utm_campaign === "string" ? row.utm_campaign : null,
    utm_term: typeof row.utm_term === "string" ? row.utm_term : null,
    utm_content: typeof row.utm_content === "string" ? row.utm_content : null,
    landing_url: typeof row.landing_url === "string" ? row.landing_url : null,
    referrer: typeof row.referrer === "string" ? row.referrer : null,
    first_touch_source: typeof row.first_touch_source === "string" ? row.first_touch_source : null,
    first_touch_medium: typeof row.first_touch_medium === "string" ? row.first_touch_medium : null,
    first_touch_campaign:
      typeof row.first_touch_campaign === "string" ? row.first_touch_campaign : null,
    first_touch_landing_path:
      typeof row.first_touch_landing_path === "string" ? row.first_touch_landing_path : null,
    first_touch_referrer_domain:
      typeof row.first_touch_referrer_domain === "string" ? row.first_touch_referrer_domain : null,
    first_touch_at: typeof row.first_touch_at === "string" ? row.first_touch_at : null,
    last_touch_source: typeof row.last_touch_source === "string" ? row.last_touch_source : null,
    last_touch_medium: typeof row.last_touch_medium === "string" ? row.last_touch_medium : null,
    last_touch_campaign:
      typeof row.last_touch_campaign === "string" ? row.last_touch_campaign : null,
    last_touch_landing_path:
      typeof row.last_touch_landing_path === "string" ? row.last_touch_landing_path : null,
    last_touch_referrer_domain:
      typeof row.last_touch_referrer_domain === "string" ? row.last_touch_referrer_domain : null,
    last_touch_at: typeof row.last_touch_at === "string" ? row.last_touch_at : null,
    conversion_path: typeof row.conversion_path === "string" ? row.conversion_path : null,
    attribution_channel: channel,
    click_id_type:
      row.click_id_type === "gclid" ||
      row.click_id_type === "gbraid" ||
      row.click_id_type === "wbraid" ||
      row.click_id_type === "fbclid"
        ? row.click_id_type
        : null,
    click_id_value: typeof row.click_id_value === "string" ? row.click_id_value : null,
    assigned_staff_id: typeof row.assigned_staff_id === "string" ? row.assigned_staff_id : null,
    next_followup_at: typeof row.next_followup_at === "string" ? row.next_followup_at : null,
    last_contacted_at: typeof row.last_contacted_at === "string" ? row.last_contacted_at : null,
    qualified_at: typeof row.qualified_at === "string" ? row.qualified_at : null,
    qualification_outcome:
      row.qualification_outcome === "pending" ||
      row.qualification_outcome === "qualified" ||
      row.qualification_outcome === "disqualified" ||
      row.qualification_outcome === "nurture"
        ? row.qualification_outcome
        : null,
    disqualification_reason:
      typeof row.disqualification_reason === "string" ? row.disqualification_reason : null,
    stage_updated_at: typeof row.stage_updated_at === "string" ? row.stage_updated_at : createdAt,
    last_activity_at: typeof row.last_activity_at === "string" ? row.last_activity_at : createdAt,
    crm_version: row.crm_version != null ? Number(row.crm_version) : 1,
  };
}

export function createLiveSupabaseCrmStorageAdapter(db: SupabaseClient): CrmStorageAdapter {
  async function auditedRpc(name: string, args: Record<string, unknown>) {
    const { data, error } = await db.rpc(name, args);
    if (error) {
      if (error.code === "40001" || error.message === "CONCURRENT_MODIFICATION_CONFLICT")
        return conflict;
      if (error.code === "42501")
        return { ok: false, code: "FORBIDDEN", message: "Staff permission denied." } as const;
      if (["LEAD_NOT_FOUND", "TASK_NOT_FOUND"].includes(error.message))
        return { ok: false, code: "NOT_FOUND", message: "Record not found." } as const;
      return {
        ok: false,
        code: "DB_ERROR",
        message: "Unable to confirm the CRM change. Refresh before retrying.",
      } as const;
    }
    if (!z.string().uuid().safeParse(data?.activity_id).success) {
      return {
        ok: false,
        code: "DB_ERROR",
        message: "Mandatory audit activity record missing.",
      } as const;
    }
    return {
      ok: true,
      data: data as { activity_id: string; lead?: Record<string, unknown>; id?: string },
    } as const;
  }
  async function updateLead(name: string, args: Record<string, unknown>) {
    const result = await auditedRpc(name, args);
    if (!result.ok) return result;
    if (result.data.lead?.id !== args.p_lead_id || !result.data.lead) {
      return { ok: false, code: "DB_ERROR", message: "Missing updated lead." } as const;
    }
    return {
      ok: true,
      lead: normalizeDbRowToLeadRecord(result.data.lead),
      activityId: result.data.activity_id,
    } as const;
  }

  return {
    async listStaffMembers() {
      const { data, error } = await db
        .from("crm_staff_members")
        .select("*")
        .order("full_name", { ascending: true });
      if (error) {
        throw new Error(`CRM staff query failed (${error.code || "DB_ERROR"})`);
      }
      return (data ?? []) as CrmStaffMember[];
    },
    async getAllLeadsRaw() {
      const { data, error } = await db
        .from("consultations")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1000);
      if (error) {
        throw new Error(`CRM consultations query failed (${error.code || "DB_ERROR"})`);
      }
      return (data ?? []).map((r) => normalizeDbRowToLeadRecord(r as Record<string, unknown>));
    },
    async getLeadById(leadId: string) {
      const { data, error } = await db
        .from("consultations")
        .select("*")
        .eq("id", leadId)
        .maybeSingle();
      if (error) throw new Error("CRM lead query failed.");
      if (!data) return null;
      return normalizeDbRowToLeadRecord(data as Record<string, unknown>);
    },
    async transitionLeadStage(input) {
      return updateLead("crm_transition_lead_stage", {
        p_lead_id: input.leadId,
        p_expected_version: input.expectedVersion,
        p_actor_staff_id: input.actorStaffId,
        p_new_status: input.newStatus,
        p_reason: input.reason,
        p_qualification_outcome: input.qualificationOutcome,
        p_disqualification_reason: input.disqualificationReason,
        p_restore_from_archive: input.restoreFromArchive,
      });
    },
    async updateLeadRecord(leadId, expectedVersion, patch, activity) {
      return updateLead("crm_atomic_update_lead_with_audit", {
        p_lead_id: leadId,
        p_expected_version: expectedVersion,
        p_patch: patch,
        p_actor_staff_id: activity.actor_staff_id,
        p_action_type: activity.action_type,
        p_note_body: activity.note_body ?? null,
        p_reason: activity.reason ?? null,
      });
    },
    async listLeadActivities(leadId: string) {
      const { data, error } = await db
        .from("crm_lead_activities")
        .select("*")
        .eq("lead_id", leadId)
        .order("created_at", { ascending: false });
      if (error) throw new Error("CRM records unavailable.");
      return (data ?? []) as Array<Omit<CrmLeadActivityItem, "created_at_ist">>;
    },
    async listFollowupTasks(leadId?: string) {
      let query = db
        .from("crm_followup_tasks")
        .select("*, consultations!inner(crm_version)")
        .order("due_at", { ascending: true });
      if (leadId) {
        query = query.eq("lead_id", leadId);
      }
      const { data, error } = await query;
      if (error) throw new Error("CRM records unavailable.");
      return (data ?? []).map(({ consultations, ...task }) => ({
        ...task,
        lead_version: consultations.crm_version,
      })) as DemoCrmStoreState["tasks"];
    },
    async listPrivacyRequests(leadId?: string) {
      let query = db
        .from("crm_privacy_requests")
        .select("*")
        .order("requested_at", { ascending: false });
      if (leadId) {
        query = query.eq("lead_id", leadId);
      }
      const { data, error } = await query;
      if (error) throw new Error("CRM records unavailable.");
      return (data ?? []) as DemoCrmStoreState["privacyRequests"];
    },
    async mutateRelated(leadId, expectedVersion, actor, change) {
      const common = {
        p_lead_id: leadId,
        p_expected_version: expectedVersion,
        p_actor_staff_id: actor.id,
      };
      const result =
        change.action === "privacy_request_logged"
          ? await auditedRpc("crm_log_privacy_request", {
              ...common,
              p_type: change.requestType,
              p_status: change.status,
              p_summary: change.note,
            })
          : await auditedRpc("crm_mutate_followup", {
              ...common,
              p_action: change.action,
              p_task_id: "taskId" in change ? change.taskId : null,
              p_due_at: "due" in change ? change.due : null,
              p_assignee: "assignee" in change ? change.assignee : null,
              p_task_type: "taskType" in change ? change.taskType : null,
              p_note: change.note,
              p_contact_confirmed: change.action === "followup_completed" && change.confirmed,
            });
      if (!result.ok) return result;
      if (!result.data.id || !z.string().uuid().safeParse(result.data.id).success)
        return { ok: false, code: "DB_ERROR", message: "Missing committed record." };
      return { ok: true, id: result.data.id };
    },
  };
}

// ============================================================================
// ZOD INPUT SCHEMAS FOR PROTECTED CRM OPERATIONS
// ============================================================================
export const listCrmLeadsFilterSchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(50).default(20),
  status: z.enum(CRM_LEAD_STATUSES).optional(),
  source: z.enum(SUPPORTED_LEAD_SOURCES).optional(),
  channel: z.enum(ATTRIBUTION_CHANNELS).optional(),
  campaign: z.string().trim().max(150).optional(),
  ownerId: z.string().trim().max(64).optional(), // UUID or "unassigned"
  propertyTier: z.enum(["villa", "independent_home", "commercial"]).optional(),
  city: z.string().trim().max(100).optional(),
  discomCode: z.string().trim().max(50).optional(),
  dateFrom: z.string().trim().optional(),
  dateTo: z.string().trim().optional(),
  overdueOnly: z.boolean().optional(),
  search: z.string().trim().max(100).optional(),
});

export type ListCrmLeadsFilterInput = z.infer<typeof listCrmLeadsFilterSchema>;

export const transitionStageInputSchema = z.object({
  leadId: z.string().uuid(),
  newStatus: z.enum(CRM_LEAD_STATUSES),
  expectedVersion: z.number().int().min(1),
  reason: z.string().trim().max(500).optional(),
  qualificationOutcome: z.enum(CRM_QUALIFICATION_OUTCOMES).optional(),
  disqualificationReason: z.string().trim().max(300).optional(),
  restoreFromArchive: z.boolean().optional(),
});

export const assignLeadOwnerInputSchema = z.object({
  leadId: z.string().uuid(),
  assignedStaffId: z.string().uuid().nullable(),
  expectedVersion: z.number().int().min(1),
  reason: z.string().trim().max(300).optional(),
});

export const addLeadNoteInputSchema = z.object({
  expectedVersion: z.number().int().min(1),
  leadId: z.string().uuid(),
  noteBody: z.string().trim().min(2, "Note must be at least 2 characters").max(1000),
  qualificationOutcome: z.enum(CRM_QUALIFICATION_OUTCOMES).optional(),
  disqualificationReason: z.string().trim().max(300).optional(),
});

export const createFollowupTaskInputSchema = z.object({
  expectedVersion: z.number().int().min(1),
  leadId: z.string().uuid(),
  assignedStaffId: z.string().uuid(),
  taskType: z.enum(CRM_TASK_TYPES),
  dueAt: z
    .string()
    .trim()
    .refine((val) => !Number.isNaN(Date.parse(val)), {
      message: "Please provide a valid follow-up due date and time",
    }),
  summary: z
    .string()
    .trim()
    .min(3, "Task summary must be at least 3 characters")
    .max(300, "Task summary cannot exceed 300 characters"),
});

export const completeFollowupTaskInputSchema = z.object({
  expectedVersion: z.number().int().min(1),
  taskId: z.string().uuid(),
  completionNote: z.string().trim().min(2, "Please record a brief completion note").max(500),
  customerContactConfirmed: z.boolean().default(false),
});

export const rescheduleFollowupTaskInputSchema = z.object({
  expectedVersion: z.number().int().min(1),
  taskId: z.string().uuid(),
  newDueAt: z
    .string()
    .trim()
    .refine((val) => !Number.isNaN(Date.parse(val)), {
      message: "Please provide a valid rescheduled date and time",
    }),
  assignedStaffId: z.string().uuid().optional(),
  reason: z.string().trim().min(2, "Please provide a reschedule reason").max(300),
});

export const correctLeadDataInputSchema = z.object({
  leadId: z.string().uuid(),
  expectedVersion: z.number().int().min(1),
  reason: z
    .string()
    .trim()
    .min(5, "A documented correction reason (min 5 chars) is required for audit compliance")
    .max(500),
  updates: z.object({
    client_name: z.string().trim().min(2).max(100).optional(),
    city: z.string().trim().min(2).max(100).optional(),
    pin_code: z
      .string()
      .trim()
      .regex(/^[1-9][0-9]{5}$/, "PIN code must be a valid 6-digit Indian postal code")
      .optional(),
    discom_code: z.string().trim().max(50).optional(),
    monthly_bill_inr: z.number().nonnegative().max(100000000).optional(),
    roof_area_sqft: z.number().nonnegative().max(5000000).optional(),
    company_name: z.string().trim().max(150).optional(),
  }),
});

export const logPrivacyRequestInputSchema = z.object({
  expectedVersion: z.number().int().min(1),
  leadId: z.string().uuid(),
  requestType: z.enum(CRM_PRIVACY_REQUEST_TYPES),
  status: z.enum(CRM_PRIVACY_REQUEST_STATUSES).default("received"),
  resolutionSummary: z
    .string()
    .trim()
    .min(5, "Please record request verification and handling notes")
    .max(500),
});

export interface CrmExecutionContext {
  token: string | null | undefined;
  env?: CrmAuthEnv;
  authAdapter?: CrmAuthDatabaseAdapter;
  storageAdapter?: CrmStorageAdapter;
  demoStaffList?: readonly CrmStaffMember[];
  nowMs?: number;
}

function resolveStorageAdapter(ctx: CrmExecutionContext, mode: "live" | "demo"): CrmStorageAdapter {
  if (ctx.storageAdapter) return ctx.storageAdapter;
  if (mode === "demo") {
    return createDemoCrmStorageAdapter(demoCrmStore);
  }
  throw new Error("Live storage adapter is required in LIVE mode.");
}

// ============================================================================
// CORE TESTABLE CRM SERVICE OPERATIONS
// ============================================================================

/**
 * 1. List Paginated & Filtered Leads (Masks PII in summary list)
 */
export async function executeListCrmLeads(
  rawInput: unknown,
  ctx: CrmExecutionContext,
): Promise<
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
> {
  const auth = await authenticateAndAuthorizeCrmRequest({
    token: ctx.token,
    requiredPermission: "leads:list",
    env: ctx.env,
    authAdapter: ctx.authAdapter,
    demoStaffList: ctx.demoStaffList,
    nowMs: ctx.nowMs,
  });
  if (!auth.ok) {
    return { ok: false, status: auth.status, reason: auth.reason, message: auth.message };
  }

  const parsed = listCrmLeadsFilterSchema.safeParse(rawInput ?? {});
  if (!parsed.success) {
    return {
      ok: false,
      status: 400,
      reason: "validation_error",
      message: parsed.error.issues[0]?.message || "Invalid filter parameters.",
    };
  }
  const filters = parsed.data;
  const nowMs = ctx.nowMs ?? Date.now();
  const storage = resolveStorageAdapter(ctx, auth.mode);

  const [allLeads, staffMembers] = await Promise.all([
    storage.getAllLeadsRaw(),
    storage.listStaffMembers(),
  ]);

  const staffMap = new Map(staffMembers.map((s) => [s.id, s.full_name]));

  // Count enquiries per normalized phone for duplicate recognition flag
  const pii = hasCrmPermission(auth.staff.role, "leads:view_unmasked_pii");
  const phoneCountMap = new Map<string, number>();
  for (const lead of allLeads) {
    const norm = normalizeIndianPhone(lead.phone) || lead.phone;
    if (norm) {
      phoneCountMap.set(norm, (phoneCountMap.get(norm) ?? 0) + 1);
    }
  }

  const filtered = allLeads.filter((lead) => {
    if (filters.status && lead.status !== filters.status) return false;
    if (filters.source && lead.source !== filters.source) return false;
    if (filters.channel && lead.attribution_channel !== filters.channel) return false;
    if (
      filters.campaign &&
      (lead.utm_campaign || "").toLowerCase() !== filters.campaign.toLowerCase()
    ) {
      return false;
    }
    if (filters.ownerId) {
      if (filters.ownerId === "unassigned") {
        if (lead.assigned_staff_id !== null) return false;
      } else if (lead.assigned_staff_id !== filters.ownerId) {
        return false;
      }
    }
    if (filters.propertyTier && lead.property_tier !== filters.propertyTier) return false;
    if (filters.city && lead.city.toLowerCase() !== filters.city.toLowerCase()) return false;
    if (
      filters.discomCode &&
      (lead.discom_code || "").toLowerCase() !== filters.discomCode.toLowerCase()
    ) {
      return false;
    }
    if (filters.dateFrom) {
      const fromMs = Date.parse(filters.dateFrom);
      if (!Number.isNaN(fromMs) && Date.parse(lead.created_at) < fromMs) return false;
    }
    if (filters.dateTo) {
      const toMs = Date.parse(filters.dateTo);
      if (!Number.isNaN(toMs) && Date.parse(lead.created_at) > toMs) return false;
    }

    const isOverdue = Boolean(
      lead.next_followup_at &&
      Date.parse(lead.next_followup_at) < nowMs &&
      lead.status !== "installed" &&
      lead.status !== "archived",
    );
    if (filters.overdueOnly && !isOverdue) return false;

    if (filters.search) {
      const q = filters.search.toLowerCase();
      const qDigits = q.replace(/\D/g, "");
      const refMatch = lead.reference_code.toLowerCase().includes(q);
      const nameMatch = pii && lead.client_name.toLowerCase().includes(q);
      const companyMatch = pii && (lead.company_name || "").toLowerCase().includes(q);
      const cityMatch = lead.city.toLowerCase().includes(q);
      const phoneMatch =
        pii && qDigits.length >= 4 && lead.phone.replace(/\D/g, "").includes(qDigits);
      if (!refMatch && !nameMatch && !companyMatch && !cityMatch && !phoneMatch) {
        return false;
      }
    }

    return true;
  });

  filtered.sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at));

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / filters.pageSize));
  const safePage = Math.min(filters.page, totalPages);
  const startIdx = (safePage - 1) * filters.pageSize;
  const pageSlice = filtered.slice(startIdx, startIdx + filters.pageSize);

  const items: CrmLeadSummaryItem[] = pageSlice.map((lead) => {
    const normPhone = normalizeIndianPhone(lead.phone) || lead.phone;
    const isOverdue = Boolean(
      lead.next_followup_at &&
      Date.parse(lead.next_followup_at) < nowMs &&
      lead.status !== "installed" &&
      lead.status !== "archived",
    );
    return {
      id: lead.id,
      reference_code: lead.reference_code,
      created_at: lead.created_at,
      created_at_ist: formatTimestampIst(lead.created_at),
      client_name: pii ? lead.client_name : "Restricted",
      masked_phone: maskPhoneNumber(lead.phone),
      masked_email: maskEmailAddress(lead.email),
      company_name: pii ? lead.company_name : null,
      city: lead.city,
      pin_code: pii ? lead.pin_code : null,
      property_tier: lead.property_tier,
      discom_code: lead.discom_code,
      system_kw: lead.system_kw,
      battery_units: lead.battery_units,
      monthly_bill_inr: lead.monthly_bill_inr,
      source: lead.source,
      attribution_channel: lead.attribution_channel,
      utm_campaign: lead.utm_campaign,
      status: lead.status,
      qualification_outcome: lead.qualification_outcome,
      assigned_staff_id: lead.assigned_staff_id,
      assigned_staff_name: lead.assigned_staff_id
        ? (staffMap.get(lead.assigned_staff_id) ?? "Unassigned")
        : null,
      next_followup_at: lead.next_followup_at,
      next_followup_ist: lead.next_followup_at ? formatTimestampIst(lead.next_followup_at) : null,
      is_overdue: isOverdue,
      last_activity_at: lead.last_activity_at,
      last_activity_ist: formatTimestampIst(lead.last_activity_at),
      crm_version: lead.crm_version,
      possible_duplicate_count: phoneCountMap.get(normPhone) ?? 1,
      do_not_contact: lead.do_not_contact,
    };
  });

  return {
    ok: true,
    mode: auth.mode,
    items,
    total,
    page: safePage,
    pageSize: filters.pageSize,
    totalPages,
    staffDirectory: staffMembers.map((s) => ({
      id: s.id,
      full_name: s.full_name,
      role: s.role,
      is_active: s.is_active,
    })),
  };
}

/**
 * 2. Fetch Full Lead Detail (Enforces Role-Scoped PII Masking for Read-Only Viewer)
 */
export async function executeGetCrmLeadDetail(
  leadIdInput: unknown,
  ctx: CrmExecutionContext,
): Promise<
  | { ok: true; mode: "live" | "demo"; data: CrmLeadDetailPayload }
  | { ok: false; status: number; reason: string; message: string }
> {
  const auth = await authenticateAndAuthorizeCrmRequest({
    token: ctx.token,
    requiredPermission: "leads:view_detail",
    env: ctx.env,
    authAdapter: ctx.authAdapter,
    demoStaffList: ctx.demoStaffList,
    nowMs: ctx.nowMs,
  });
  if (!auth.ok) {
    return { ok: false, status: auth.status, reason: auth.reason, message: auth.message };
  }

  const parsedId = z.string().uuid().safeParse(leadIdInput);
  if (!parsedId.success) {
    return { ok: false, status: 400, reason: "validation_error", message: "Invalid lead ID." };
  }

  const storage = resolveStorageAdapter(ctx, auth.mode);
  const lead = await storage.getLeadById(parsedId.data);
  if (!lead) {
    return { ok: false, status: 404, reason: "not_found", message: "Lead record not found." };
  }

  const [allLeads, staffMembers, rawActivities, rawTasks, rawPrivacyRequests] = await Promise.all([
    storage.getAllLeadsRaw(),
    storage.listStaffMembers(),
    storage.listLeadActivities(lead.id),
    storage.listFollowupTasks(lead.id),
    hasCrmPermission(auth.staff.role, "privacy:view")
      ? storage.listPrivacyRequests(lead.id)
      : Promise.resolve([]),
  ]);

  const staffMap = new Map(staffMembers.map((s) => [s.id, s.full_name]));
  const canViewUnmaskedPii = hasCrmPermission(auth.staff.role, "leads:view_unmasked_pii");
  const nowMs = ctx.nowMs ?? Date.now();

  const normPhone = normalizeIndianPhone(lead.phone) || lead.phone;
  const relatedEnquiries: CrmRelatedEnquiryItem[] = allLeads
    .filter(
      (other) =>
        other.id !== lead.id && (normalizeIndianPhone(other.phone) || other.phone) === normPhone,
    )
    .map((other) => ({
      id: other.id,
      reference_code: other.reference_code,
      created_at: other.created_at,
      created_at_ist: formatTimestampIst(other.created_at),
      property_tier: other.property_tier,
      city: other.city,
      source: other.source,
      system_kw: other.system_kw,
      status: other.status,
    }));

  const activities: CrmLeadActivityItem[] = rawActivities.map((a) => ({
    ...a,
    ...(!canViewUnmaskedPii && {
      note_body: null,
      before_state: null,
      after_state: null,
      reason: null,
    }),
    created_at_ist: formatTimestampIst(a.created_at),
  }));

  const tasks: CrmFollowupTaskItem[] = rawTasks.map((t) => ({
    ...t,
    lead_reference_code: lead.reference_code,
    lead_version: lead.crm_version,
    lead_client_name: canViewUnmaskedPii ? lead.client_name : "Restricted",
    summary: canViewUnmaskedPii ? t.summary : "Restricted",
    completion_note: canViewUnmaskedPii ? t.completion_note : null,
    lead_city: lead.city,
    lead_status: lead.status,
    assigned_staff_name: staffMap.get(t.assigned_staff_id) ?? "Unassigned",
    due_at_ist: formatTimestampIst(t.due_at),
    urgency: classifyFollowupUrgency(t.status, t.due_at, nowMs),
    completed_at_ist: t.completed_at ? formatTimestampIst(t.completed_at) : null,
  }));

  const privacyRequests: CrmPrivacyRequestItem[] = rawPrivacyRequests.map((r) => ({
    ...r,
    lead_reference_code: lead.reference_code,
    responsible_staff_name: r.responsible_staff_id
      ? (staffMap.get(r.responsible_staff_id) ?? null)
      : null,
    requested_at_ist: formatTimestampIst(r.requested_at),
  }));

  const { phone, email, ...restLead } = lead;
  const isOverdue = Boolean(
    lead.next_followup_at &&
    Date.parse(lead.next_followup_at) < nowMs &&
    lead.status !== "installed" &&
    lead.status !== "archived",
  );

  return {
    ok: true,
    mode: auth.mode,
    data: {
      lead: {
        ...restLead,
        ...(!canViewUnmaskedPii && {
          client_name: "Restricted",
          company_name: null,
          company_url: null,
          pin_code: null,
          consent_given: null,
          consent_version: null,
          consent_at: null,
          consent_withdrawn_at: null,
          disqualification_reason: null,
          click_id_value: null,
          landing_url: null,
          referrer: null,
          utm_term: null,
          utm_content: null,
          conversion_path: null,
          first_touch_landing_path: null,
          last_touch_landing_path: null,
        }),
        notes: canViewUnmaskedPii ? restLead.notes : null,
        phone_display: canViewUnmaskedPii ? phone : maskPhoneNumber(phone),
        email_display: canViewUnmaskedPii ? email : maskEmailAddress(email),
        pii_masked: !canViewUnmaskedPii,
        created_at_ist: formatTimestampIst(lead.created_at),
        consent_at_ist:
          canViewUnmaskedPii && lead.consent_at ? formatTimestampIst(lead.consent_at) : null,
        next_followup_ist: lead.next_followup_at ? formatTimestampIst(lead.next_followup_at) : null,
        last_contacted_ist: lead.last_contacted_at
          ? formatTimestampIst(lead.last_contacted_at)
          : null,
        stage_updated_ist: formatTimestampIst(lead.stage_updated_at),
        assigned_staff_name: lead.assigned_staff_id
          ? (staffMap.get(lead.assigned_staff_id) ?? null)
          : null,
        is_overdue: isOverdue,
      },
      activities,
      tasks,
      privacyRequests,
      relatedEnquiries,
    },
  };
}

/**
 * 3. Server-Validated Sales Stage Transition
 */
export async function executeTransitionCrmLeadStage(
  rawInput: unknown,
  ctx: CrmExecutionContext,
): Promise<
  { ok: true; lead: CrmLeadRecord } | { ok: false; status: number; reason: string; message: string }
> {
  const auth = await authenticateAndAuthorizeCrmRequest({
    token: ctx.token,
    requiredPermission: "leads:update_stage",
    env: ctx.env,
    authAdapter: ctx.authAdapter,
    demoStaffList: ctx.demoStaffList,
    nowMs: ctx.nowMs,
  });
  if (!auth.ok) {
    return { ok: false, status: auth.status, reason: auth.reason, message: auth.message };
  }

  const parsed = transitionStageInputSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      ok: false,
      status: 400,
      reason: "validation_error",
      message: parsed.error.issues[0]?.message || "Invalid stage transition payload.",
    };
  }
  const input = parsed.data;
  const storage = resolveStorageAdapter(ctx, auth.mode);
  const current = await storage.getLeadById(input.leadId);

  if (!current) {
    return { ok: false, status: 404, reason: "not_found", message: "Lead record not found." };
  }

  if (current.crm_version !== input.expectedVersion) return mutationFailure(conflict);

  if (current.status === input.newStatus) {
    return {
      ok: false,
      status: 400,
      reason: "no_op_transition",
      message: `Lead is already in the '${current.status}' stage.`,
    };
  }

  const allowedTargets = ALLOWED_STAGE_TRANSITIONS[current.status] ?? [];
  if (!allowedTargets.includes(input.newStatus)) {
    return {
      ok: false,
      status: 400,
      reason: "invalid_stage_transition",
      message: `Transition from '${current.status}' directly to '${input.newStatus}' is not permitted by the WAVENOX sales workflow.`,
    };
  }

  // Archived lead safeguard: requires explicit restoreFromArchive + leads:restore_archived permission
  if (current.status === "archived") {
    if (!input.restoreFromArchive) {
      return {
        ok: false,
        status: 400,
        reason: "archived_lead_locked",
        message:
          "Archived leads cannot be modified without an explicit restore action (`restoreFromArchive: true`).",
      };
    }
    if (!hasCrmPermission(auth.staff.role, "leads:restore_archived")) {
      return {
        ok: false,
        status: 403,
        reason: "forbidden",
        message: "Only an Owner/Admin can restore an archived lead.",
      };
    }
  }

  // Safeguard against unverified quotation / contract / installation claims
  if (
    input.newStatus === "quoted" ||
    input.newStatus === "contract_signed" ||
    input.newStatus === "installed" ||
    input.newStatus === "archived"
  ) {
    if (!input.reason || input.reason.trim().length < 5) {
      return {
        ok: false,
        status: 400,
        reason: "evidence_reason_required",
        message: `Transitioning a lead to '${input.newStatus}' requires an operational note/reference (min 5 characters).`,
      };
    }
  }

  const nowIso = new Date(ctx.nowMs ?? Date.now()).toISOString();
  const res = await storage.transitionLeadStage({
    leadId: current.id,
    expectedVersion: input.expectedVersion,
    newStatus: input.newStatus,
    actorStaffId: auth.staff.id,
    actorLabel: auth.staff.full_name,
    reason: input.reason ?? null,
    qualificationOutcome: input.qualificationOutcome ?? null,
    disqualificationReason: input.disqualificationReason ?? null,
    restoreFromArchive: Boolean(input.restoreFromArchive),
    nowIso,
  });

  if (!res.ok) {
    return mutationFailure(res);
  }

  return { ok: true, lead: res.lead };
}

/**
 * 4. Assign or Reassign Lead Ownership
 */
export async function executeAssignCrmLeadOwner(
  rawInput: unknown,
  ctx: CrmExecutionContext,
): Promise<
  { ok: true; lead: CrmLeadRecord } | { ok: false; status: number; reason: string; message: string }
> {
  const auth = await authenticateAndAuthorizeCrmRequest({
    token: ctx.token,
    requiredPermission: "leads:assign_self",
    env: ctx.env,
    authAdapter: ctx.authAdapter,
    demoStaffList: ctx.demoStaffList,
    nowMs: ctx.nowMs,
  });
  if (!auth.ok) {
    return { ok: false, status: auth.status, reason: auth.reason, message: auth.message };
  }

  const parsed = assignLeadOwnerInputSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      ok: false,
      status: 400,
      reason: "validation_error",
      message: parsed.error.issues[0]?.message || "Invalid owner assignment payload.",
    };
  }
  const input = parsed.data;
  const storage = resolveStorageAdapter(ctx, auth.mode);
  const [current, staffList] = await Promise.all([
    storage.getLeadById(input.leadId),
    storage.listStaffMembers(),
  ]);

  if (!current) {
    return { ok: false, status: 404, reason: "not_found", message: "Lead record not found." };
  }

  if (current.crm_version !== input.expectedVersion) return mutationFailure(conflict);
  const canAssignAny = hasCrmPermission(auth.staff.role, "leads:assign_any");

  // Coordinator restriction: cannot reassign a lead already owned by someone else, nor assign to a third person
  if (!canAssignAny) {
    if (current.assigned_staff_id !== null && current.assigned_staff_id !== auth.staff.id) {
      return {
        ok: false,
        status: 403,
        reason: "forbidden",
        message:
          "Sales Coordinators cannot reassign leads already owned by another team member. Contact an Owner/Admin.",
      };
    }
    if (input.assignedStaffId !== auth.staff.id) {
      return {
        ok: false,
        status: 403,
        reason: "forbidden",
        message: "Sales Coordinators can only claim unassigned leads for themselves.",
      };
    }
  }

  let targetStaffName = "Unassigned";
  if (input.assignedStaffId !== null) {
    const targetStaff = staffList.find((s) => s.id === input.assignedStaffId);
    if (!targetStaff) {
      return {
        ok: false,
        status: 400,
        reason: "invalid_staff_target",
        message: "Cannot assign lead to an unknown staff identity.",
      };
    }
    if (!targetStaff.is_active) {
      return {
        ok: false,
        status: 400,
        reason: "inactive_staff_target",
        message: "Cannot assign lead to a deactivated staff member.",
      };
    }
    if (targetStaff.role === "read_only_viewer") {
      return {
        ok: false,
        status: 400,
        reason: "ineligible_staff_role",
        message: "Read-Only Viewers cannot be assigned lead ownership.",
      };
    }
    targetStaffName = targetStaff.full_name;
  }

  const res = await storage.updateLeadRecord(
    current.id,
    input.expectedVersion,
    { assigned_staff_id: input.assignedStaffId },
    {
      actor_staff_id: auth.staff.id,
      actor_label: auth.staff.full_name,
      action_type: "owner_assigned",
      before_state: { assigned_staff_id: current.assigned_staff_id },
      after_state: {
        assigned_staff_id: input.assignedStaffId,
        assigned_staff_name: targetStaffName,
      },
      reason: input.reason ?? null,
    },
  );

  if (!res.ok) {
    return mutationFailure(res);
  }

  return { ok: true, lead: res.lead };
}

/**
 * 5. Add Staff Note (Preserves customer's original `consultations.notes` untouched)
 */
export async function executeAddCrmLeadNote(
  rawInput: unknown,
  ctx: CrmExecutionContext,
): Promise<
  { ok: true; activityId: string } | { ok: false; status: number; reason: string; message: string }
> {
  const auth = await authenticateAndAuthorizeCrmRequest({
    token: ctx.token,
    requiredPermission: "leads:add_note",
    env: ctx.env,
    authAdapter: ctx.authAdapter,
    demoStaffList: ctx.demoStaffList,
    nowMs: ctx.nowMs,
  });
  if (!auth.ok) {
    return { ok: false, status: auth.status, reason: auth.reason, message: auth.message };
  }

  const parsed = addLeadNoteInputSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      ok: false,
      status: 400,
      reason: "validation_error",
      message: parsed.error.issues[0]?.message || "Invalid note payload.",
    };
  }
  const input = parsed.data;
  const storage = resolveStorageAdapter(ctx, auth.mode);
  const current = await storage.getLeadById(input.leadId);
  if (!current) {
    return { ok: false, status: 404, reason: "not_found", message: "Lead record not found." };
  }

  const patch: Partial<CrmLeadRecord> = {};
  if (input.qualificationOutcome) patch.qualification_outcome = input.qualificationOutcome;
  if (input.disqualificationReason) patch.disqualification_reason = input.disqualificationReason;
  const result = await storage.updateLeadRecord(current.id, input.expectedVersion, patch, {
    actor_staff_id: auth.staff.id,
    actor_label: auth.staff.full_name,
    action_type: "note_added",
    note_body: input.noteBody,
    before_state: { qualification_outcome: current.qualification_outcome },
    after_state: patch,
  });
  return result.ok ? { ok: true, activityId: result.activityId } : mutationFailure(result);
}

/**
 * 6. Create, Complete & Reschedule Follow-Up Tasks
 */
export async function executeCreateCrmFollowupTask(
  rawInput: unknown,
  ctx: CrmExecutionContext,
): Promise<
  { ok: true; taskId: string } | { ok: false; status: number; reason: string; message: string }
> {
  const auth = await authenticateAndAuthorizeCrmRequest({
    token: ctx.token,
    requiredPermission: "tasks:create",
    env: ctx.env,
    authAdapter: ctx.authAdapter,
    demoStaffList: ctx.demoStaffList,
    nowMs: ctx.nowMs,
  });
  if (!auth.ok) {
    return { ok: false, status: auth.status, reason: auth.reason, message: auth.message };
  }

  const parsed = createFollowupTaskInputSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      ok: false,
      status: 400,
      reason: "validation_error",
      message: parsed.error.issues[0]?.message || "Invalid follow-up task input.",
    };
  }
  const input = parsed.data;
  const storage = resolveStorageAdapter(ctx, auth.mode);
  const [lead, staffList] = await Promise.all([
    storage.getLeadById(input.leadId),
    storage.listStaffMembers(),
  ]);

  if (!lead) {
    return { ok: false, status: 404, reason: "not_found", message: "Lead record not found." };
  }

  const targetStaff = staffList.find((s) => s.id === input.assignedStaffId);
  if (!targetStaff || !targetStaff.is_active || targetStaff.role === "read_only_viewer") {
    return {
      ok: false,
      status: 400,
      reason: "invalid_staff_target",
      message: "Follow-up task must be assigned to an active Owner/Admin or Sales Coordinator.",
    };
  }

  if (
    input.assignedStaffId !== auth.staff.id &&
    !hasCrmPermission(auth.staff.role, "tasks:reassign_any")
  ) {
    return {
      ok: false,
      status: 403,
      reason: "forbidden",
      message: "Sales Coordinators can only schedule follow-up tasks assigned to themselves.",
    };
  }

  const result = await storage.mutateRelated(lead.id, input.expectedVersion, auth.staff, {
    action: "followup_scheduled",
    assignee: input.assignedStaffId,
    due: new Date(input.dueAt).toISOString(),
    taskType: input.taskType,
    note: input.summary,
  });
  return result.ok ? { ok: true, taskId: result.id } : mutationFailure(result);
}

export async function executeCompleteCrmFollowupTask(
  rawInput: unknown,
  ctx: CrmExecutionContext,
): Promise<
  { ok: true; taskId: string } | { ok: false; status: number; reason: string; message: string }
> {
  const auth = await authenticateAndAuthorizeCrmRequest({
    token: ctx.token,
    requiredPermission: "tasks:complete",
    env: ctx.env,
    authAdapter: ctx.authAdapter,
    demoStaffList: ctx.demoStaffList,
    nowMs: ctx.nowMs,
  });
  if (!auth.ok) {
    return { ok: false, status: auth.status, reason: auth.reason, message: auth.message };
  }

  const parsed = completeFollowupTaskInputSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      ok: false,
      status: 400,
      reason: "validation_error",
      message: parsed.error.issues[0]?.message || "Invalid task completion input.",
    };
  }
  const input = parsed.data;
  const storage = resolveStorageAdapter(ctx, auth.mode);
  const allTasks = await storage.listFollowupTasks();
  const existingTask = allTasks.find((t) => t.id === input.taskId);

  if (!existingTask) {
    return { ok: false, status: 404, reason: "not_found", message: "Follow-up task not found." };
  }

  if (
    existingTask.assigned_staff_id !== auth.staff.id &&
    !hasCrmPermission(auth.staff.role, "tasks:reassign_any")
  ) {
    return {
      ok: false,
      status: 403,
      reason: "forbidden",
      message: "You can only complete follow-up tasks assigned to you.",
    };
  }

  const result = await storage.mutateRelated(
    existingTask.lead_id,
    input.expectedVersion,
    auth.staff,
    {
      action: "followup_completed",
      taskId: existingTask.id,
      confirmed: input.customerContactConfirmed,
      note: input.completionNote,
    },
  );
  return result.ok ? { ok: true, taskId: result.id } : mutationFailure(result);
}

export async function executeRescheduleCrmFollowupTask(
  rawInput: unknown,
  ctx: CrmExecutionContext,
): Promise<
  { ok: true; taskId: string } | { ok: false; status: number; reason: string; message: string }
> {
  const auth = await authenticateAndAuthorizeCrmRequest({
    token: ctx.token,
    requiredPermission: "tasks:create",
    env: ctx.env,
    authAdapter: ctx.authAdapter,
    demoStaffList: ctx.demoStaffList,
    nowMs: ctx.nowMs,
  });
  if (!auth.ok) {
    return { ok: false, status: auth.status, reason: auth.reason, message: auth.message };
  }

  const parsed = rescheduleFollowupTaskInputSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      ok: false,
      status: 400,
      reason: "validation_error",
      message: parsed.error.issues[0]?.message || "Invalid reschedule payload.",
    };
  }
  const input = parsed.data;
  const storage = resolveStorageAdapter(ctx, auth.mode);
  const [allTasks, staffList] = await Promise.all([
    storage.listFollowupTasks(),
    storage.listStaffMembers(),
  ]);
  const existingTask = allTasks.find((t) => t.id === input.taskId);

  if (!existingTask) {
    return { ok: false, status: 404, reason: "not_found", message: "Follow-up task not found." };
  }

  const nextAssignee = input.assignedStaffId ?? existingTask.assigned_staff_id;
  if (
    (nextAssignee !== existingTask.assigned_staff_id ||
      existingTask.assigned_staff_id !== auth.staff.id) &&
    !hasCrmPermission(auth.staff.role, "tasks:reassign_any")
  ) {
    return {
      ok: false,
      status: 403,
      reason: "forbidden",
      message: "Only an Owner/Admin can reassign a follow-up task to another staff member.",
    };
  }

  const targetStaff = staffList.find((s) => s.id === nextAssignee);
  if (!targetStaff || !targetStaff.is_active || targetStaff.role === "read_only_viewer") {
    return {
      ok: false,
      status: 400,
      reason: "invalid_staff_target",
      message: "Assigned staff member must be an active Owner/Admin or Sales Coordinator.",
    };
  }

  const result = await storage.mutateRelated(
    existingTask.lead_id,
    input.expectedVersion,
    auth.staff,
    {
      action: "followup_rescheduled",
      taskId: existingTask.id,
      assignee: nextAssignee,
      due: new Date(input.newDueAt).toISOString(),
      note: input.reason,
    },
  );
  return result.ok ? { ok: true, taskId: result.id } : mutationFailure(result);
}

/**
 * 7. Controlled Customer Data Correction (Records before/after in audit log; protects immutable fields)
 */
export async function executeCorrectCrmLeadData(
  rawInput: unknown,
  ctx: CrmExecutionContext,
): Promise<
  { ok: true; lead: CrmLeadRecord } | { ok: false; status: number; reason: string; message: string }
> {
  const auth = await authenticateAndAuthorizeCrmRequest({
    token: ctx.token,
    requiredPermission: "leads:correct_data",
    env: ctx.env,
    authAdapter: ctx.authAdapter,
    demoStaffList: ctx.demoStaffList,
    nowMs: ctx.nowMs,
  });
  if (!auth.ok) {
    return { ok: false, status: auth.status, reason: auth.reason, message: auth.message };
  }

  const parsed = correctLeadDataInputSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      ok: false,
      status: 400,
      reason: "validation_error",
      message: parsed.error.issues[0]?.message || "Invalid data correction input.",
    };
  }
  const input = parsed.data;
  const storage = resolveStorageAdapter(ctx, auth.mode);
  const current = await storage.getLeadById(input.leadId);
  if (!current) {
    return { ok: false, status: 404, reason: "not_found", message: "Lead record not found." };
  }

  const beforeState: CrmAuditStateSnapshot = {};
  const afterState: CrmAuditStateSnapshot = {};
  const patch: Partial<CrmLeadRecord> = {};

  for (const [k, v] of Object.entries(input.updates)) {
    if (v !== undefined) {
      const key = k as keyof typeof input.updates;
      beforeState[key] = current[key];
      afterState[key] = v;
      (patch as Record<string, unknown>)[key] = v;
    }
  }

  if (Object.keys(patch).length === 0) {
    return {
      ok: false,
      status: 400,
      reason: "no_changes",
      message: "No fields were modified in the correction request.",
    };
  }

  const res = await storage.updateLeadRecord(current.id, input.expectedVersion, patch, {
    actor_staff_id: auth.staff.id,
    actor_label: auth.staff.full_name,
    action_type: "data_corrected",
    before_state: beforeState,
    after_state: afterState,
    reason: input.reason,
  });

  if (!res.ok) {
    return mutationFailure(res);
  }

  return { ok: true, lead: res.lead };
}

/**
 * 8. Log DPDP Data Principal Privacy Request (Owner/Admin only)
 */
export async function executeLogCrmPrivacyRequest(
  rawInput: unknown,
  ctx: CrmExecutionContext,
): Promise<
  { ok: true; requestId: string } | { ok: false; status: number; reason: string; message: string }
> {
  const auth = await authenticateAndAuthorizeCrmRequest({
    token: ctx.token,
    requiredPermission: "privacy:manage",
    env: ctx.env,
    authAdapter: ctx.authAdapter,
    demoStaffList: ctx.demoStaffList,
    nowMs: ctx.nowMs,
  });
  if (!auth.ok) {
    return { ok: false, status: auth.status, reason: auth.reason, message: auth.message };
  }

  const parsed = logPrivacyRequestInputSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      ok: false,
      status: 400,
      reason: "validation_error",
      message: parsed.error.issues[0]?.message || "Invalid privacy request payload.",
    };
  }
  const input = parsed.data;
  const storage = resolveStorageAdapter(ctx, auth.mode);
  const current = await storage.getLeadById(input.leadId);
  if (!current) {
    return { ok: false, status: 404, reason: "not_found", message: "Lead record not found." };
  }

  const result = await storage.mutateRelated(current.id, input.expectedVersion, auth.staff, {
    action: "privacy_request_logged",
    requestType: input.requestType,
    status: input.status,
    note: input.resolutionSummary,
  });
  return result.ok ? { ok: true, requestId: result.id } : mutationFailure(result);
}

/**
 * 9. List All Follow-Up Tasks Queue (Due, Overdue, Upcoming, Completed)
 */
export async function executeListCrmFollowupQueue(ctx: CrmExecutionContext): Promise<
  | {
      ok: true;
      mode: "live" | "demo";
      tasks: CrmFollowupTaskItem[];
      counts: { overdue: number; dueToday: number; upcoming: number; completed: number };
    }
  | { ok: false; status: number; reason: string; message: string }
> {
  const auth = await authenticateAndAuthorizeCrmRequest({
    token: ctx.token,
    requiredPermission: "tasks:view",
    env: ctx.env,
    authAdapter: ctx.authAdapter,
    demoStaffList: ctx.demoStaffList,
    nowMs: ctx.nowMs,
  });
  if (!auth.ok) {
    return { ok: false, status: auth.status, reason: auth.reason, message: auth.message };
  }

  const nowMs = ctx.nowMs ?? Date.now();
  const storage = resolveStorageAdapter(ctx, auth.mode);
  const [rawTasks, allLeads, staffList] = await Promise.all([
    storage.listFollowupTasks(),
    storage.getAllLeadsRaw(),
    storage.listStaffMembers(),
  ]);

  const leadMap = new Map(allLeads.map((l) => [l.id, l]));
  const staffMap = new Map(staffList.map((s) => [s.id, s.full_name]));

  const pii = hasCrmPermission(auth.staff.role, "leads:view_unmasked_pii");
  const items: CrmFollowupTaskItem[] = rawTasks
    .map((t) => {
      const lead = leadMap.get(t.lead_id);
      const urgency = classifyFollowupUrgency(t.status, t.due_at, nowMs);
      return {
        ...t,
        lead_reference_code: lead?.reference_code ?? "WNX-UNKNOWN",
        lead_version: t.lead_version ?? lead?.crm_version ?? null,
        lead_client_name: pii ? (lead?.client_name ?? "Unknown Lead") : "Restricted",
        summary: pii ? t.summary : "Restricted",
        completion_note: pii ? t.completion_note : null,
        lead_city: lead?.city ?? "Hyderabad",
        lead_status: lead?.status ?? "new",
        assigned_staff_name: staffMap.get(t.assigned_staff_id) ?? "Unassigned",
        due_at_ist: formatTimestampIst(t.due_at),
        urgency,
        completed_at_ist: t.completed_at ? formatTimestampIst(t.completed_at) : null,
      };
    })
    .sort((a, b) => Date.parse(a.due_at) - Date.parse(b.due_at));

  const counts = {
    overdue: items.filter((i) => i.urgency === "overdue").length,
    dueToday: items.filter((i) => i.urgency === "due_today").length,
    upcoming: items.filter((i) => i.urgency === "upcoming").length,
    completed: items.filter((i) => i.urgency === "completed").length,
  };

  return {
    ok: true,
    mode: auth.mode,
    tasks: items,
    counts,
  };
}

/**
 * 10. Aggregated Operational & Attribution Metrics (Zero Fabricated Revenue or ROAS)
 */
export async function executeGetCrmDashboardMetrics(
  rawFilter: { dateFrom?: string; dateTo?: string } | undefined,
  ctx: CrmExecutionContext,
): Promise<
  | { ok: true; metrics: CrmDashboardMetrics }
  | { ok: false; status: number; reason: string; message: string }
> {
  const auth = await authenticateAndAuthorizeCrmRequest({
    token: ctx.token,
    requiredPermission: "metrics:view",
    env: ctx.env,
    authAdapter: ctx.authAdapter,
    demoStaffList: ctx.demoStaffList,
    nowMs: ctx.nowMs,
  });
  if (!auth.ok) {
    return { ok: false, status: auth.status, reason: auth.reason, message: auth.message };
  }

  const nowMs = ctx.nowMs ?? Date.now();
  const nowIso = new Date(nowMs).toISOString();
  const storage = resolveStorageAdapter(ctx, auth.mode);
  const [allLeads, allTasks] = await Promise.all([
    storage.getAllLeadsRaw(),
    storage.listFollowupTasks(),
  ]);

  const dateFrom = rawFilter?.dateFrom?.trim() || null;
  const dateTo = rawFilter?.dateTo?.trim() || null;

  const cohort = allLeads.filter((l) => {
    const createdMs = Date.parse(l.created_at);
    if (dateFrom) {
      const fromMs = Date.parse(dateFrom);
      if (!Number.isNaN(fromMs) && createdMs < fromMs) return false;
    }
    if (dateTo) {
      const toMs = Date.parse(dateTo);
      if (!Number.isNaN(toMs) && createdMs > toMs) return false;
    }
    return true;
  });

  const stageCounts: Record<CrmLeadStatus, number> = {
    new: 0,
    contacted: 0,
    qualified: 0,
    survey_booked: 0,
    quoted: 0,
    contract_signed: 0,
    installed: 0,
    archived: 0,
  };

  for (const lead of cohort) {
    stageCounts[lead.status] = (stageCounts[lead.status] ?? 0) + 1;
  }

  const totalLeads = cohort.length;
  const eligibleLeadsCount = cohort.filter((l) => l.status !== "archived").length;
  const unassignedLeadsCount = cohort.filter(
    (l) => l.assigned_staff_id === null && l.status !== "archived" && l.status !== "installed",
  ).length;

  const qualifiedCount =
    stageCounts.qualified +
    stageCounts.survey_booked +
    stageCounts.quoted +
    stageCounts.contract_signed +
    stageCounts.installed;
  const surveyBookedCount =
    stageCounts.survey_booked +
    stageCounts.quoted +
    stageCounts.contract_signed +
    stageCounts.installed;
  const contractSignedCount = stageCounts.contract_signed + stageCounts.installed;

  const pct = (num: number, den: number) => (den > 0 ? Math.round((num / den) * 1000) / 10 : 0);

  let overdueFollowupsCount = 0;
  let dueTodayFollowupsCount = 0;
  for (const t of allTasks) {
    const u = classifyFollowupUrgency(t.status, t.due_at, nowMs);
    if (u === "overdue") overdueFollowupsCount += 1;
    if (u === "due_today") dueTodayFollowupsCount += 1;
  }

  // Group by Original Lead Source
  const sourceMap = new Map<string, number>();
  for (const lead of cohort) {
    const key = lead.source || "unknown";
    sourceMap.set(key, (sourceMap.get(key) ?? 0) + 1);
  }
  const bySource = Array.from(sourceMap.entries())
    .map(([source, count]) => ({
      source,
      count,
      pct: pct(count, totalLeads),
    }))
    .sort((a, b) => b.count - a.count);

  // Group by Attribution Channel
  const channelMap = new Map<AttributionChannel, number>();
  for (const ch of ATTRIBUTION_CHANNELS) {
    channelMap.set(ch, 0);
  }
  for (const lead of cohort) {
    const ch = lead.attribution_channel || "unknown";
    channelMap.set(ch, (channelMap.get(ch) ?? 0) + 1);
  }
  const byChannel = Array.from(channelMap.entries())
    .map(([channel, count]) => ({
      channel,
      count,
      pct: pct(count, totalLeads),
    }))
    .filter((i) => i.count > 0 || i.channel === "direct" || i.channel === "paid_search");

  // Group by First Touch Source & Last Touch Source
  const firstTouchMap = new Map<string, number>();
  const lastTouchMap = new Map<string, number>();
  for (const lead of cohort) {
    const ft =
      lead.first_touch_source ||
      lead.first_touch_referrer_domain ||
      (lead.attribution_channel === "direct" ? "direct" : "unattributed");
    firstTouchMap.set(ft, (firstTouchMap.get(ft) ?? 0) + 1);

    const lt =
      lead.last_touch_source ||
      lead.utm_source ||
      lead.last_touch_referrer_domain ||
      (lead.attribution_channel === "direct" ? "direct" : "unattributed");
    lastTouchMap.set(lt, (lastTouchMap.get(lt) ?? 0) + 1);
  }

  const byFirstTouchSource = Array.from(firstTouchMap.entries())
    .map(([source, count]) => ({ source, count }))
    .sort((a, b) => b.count - a.count);

  const byLastTouchSource = Array.from(lastTouchMap.entries())
    .map(([source, count]) => ({ source, count }))
    .sort((a, b) => b.count - a.count);

  // Group by Campaign
  const campaignMap = new Map<
    string,
    {
      campaign: string;
      channel: AttributionChannel;
      source: string;
      totalLeads: number;
      qualifiedLeads: number;
      surveyBookedLeads: number;
      contractSignedLeads: number;
    }
  >();

  for (const lead of cohort) {
    const campaignKey = lead.utm_campaign || "(unattributed / organic)";
    const existing = campaignMap.get(campaignKey) ?? {
      campaign: campaignKey,
      channel: lead.attribution_channel || "unknown",
      source: lead.utm_source || lead.first_touch_referrer_domain || "direct/unknown",
      totalLeads: 0,
      qualifiedLeads: 0,
      surveyBookedLeads: 0,
      contractSignedLeads: 0,
    };
    existing.totalLeads += 1;
    if (
      ["qualified", "survey_booked", "quoted", "contract_signed", "installed"].includes(lead.status)
    ) {
      existing.qualifiedLeads += 1;
    }
    if (["survey_booked", "quoted", "contract_signed", "installed"].includes(lead.status)) {
      existing.surveyBookedLeads += 1;
    }
    if (["contract_signed", "installed"].includes(lead.status)) {
      existing.contractSignedLeads += 1;
    }
    campaignMap.set(campaignKey, existing);
  }

  const byCampaign = Array.from(campaignMap.values()).sort((a, b) => b.totalLeads - a.totalLeads);

  return {
    ok: true,
    metrics: {
      mode: auth.mode,
      reportingPeriod: {
        dateFrom,
        dateTo,
        generatedAtIso: nowIso,
        generatedAtIst: formatTimestampIst(nowIso),
      },
      totalLeads,
      eligibleLeadsCount,
      unassignedLeadsCount,
      overdueFollowupsCount,
      dueTodayFollowupsCount,
      stageCounts,
      conversionMetrics: {
        qualifiedCount,
        qualifiedRatePct: pct(qualifiedCount, eligibleLeadsCount),
        surveyBookedCount,
        surveyConversionPct: pct(surveyBookedCount, eligibleLeadsCount),
        contractSignedCount,
        contractConversionPct: pct(contractSignedCount, eligibleLeadsCount),
        methodologyNote:
          "Denominators use eligible non-archived leads within the selected date range. Preliminary solar configuration estimates are never counted as revenue.",
      },
      bySource,
      byChannel,
      byFirstTouchSource,
      byLastTouchSource,
      byCampaign,
      financialDisclosures: {
        pipelineRevenueAvailable: false,
        pipelineRevenueNotice:
          "Preliminary solar project prices are indicative sizing estimates and are not counted as contracted pipeline revenue.",
        roasAvailable: false,
        roasNotice: "Ad spend not connected — ROAS unavailable.",
      },
    },
  };
}

// ============================================================================
// TANSTACK START SERVER FUNCTION WRAPPERS (HttpOnly Cookie + Private Headers)
// ============================================================================
export async function respondToCrmMutation<T extends { ok: true } | { ok: false; status: number }>(
  operation: Promise<T>,
): Promise<T> {
  const result = await operation;
  if (!result.ok) {
    const { setResponseStatus } = await import("@tanstack/react-start/server");
    setResponseStatus(result.status);
  }
  return result;
}

export async function buildServerExecutionContext(): Promise<{
  ctx: CrmExecutionContext;
  setSessionCookie: (token: string) => void;
  clearSessionCookie: () => void;
}> {
  const { getCookie, setCookie, deleteCookie, getRequestHeader, setResponseHeader } =
    await import("@tanstack/react-start/server");

  // Prevent public caching or indexing of any CRM server response
  try {
    setResponseHeader("Cache-Control", "no-store, no-cache, must-revalidate, private");
    setResponseHeader("Pragma", "no-cache");
    setResponseHeader("X-Robots-Tag", "noindex, nofollow");
  } catch {
    // Ignore when called outside active HTTP response context
  }

  let cookieToken: string | undefined;
  try {
    cookieToken = getCookie(CRM_SESSION_COOKIE_NAME) ?? undefined;
  } catch {
    cookieToken = undefined;
  }

  let bearerToken: string | undefined;
  try {
    const authHeader = getRequestHeader("authorization");
    if (authHeader && authHeader.toLowerCase().startsWith("bearer ")) {
      bearerToken = authHeader.slice(7).trim();
    }
  } catch {
    bearerToken = undefined;
  }

  const token = cookieToken || bearerToken;
  const env = (typeof process !== "undefined" ? process.env : {}) as CrmAuthEnv;
  const mode = resolveLeadExecutionMode(env);

  let authAdapter: CrmAuthDatabaseAdapter | undefined;
  let storageAdapter: CrmStorageAdapter | undefined;

  if (mode === "live") {
    const { hasValidSupabaseServerConfig, getServerSupabaseClient } =
      await import("@/server/supabase");
    if (hasValidSupabaseServerConfig(env)) {
      const supabase = getServerSupabaseClient(env);
      authAdapter = createLiveSupabaseAuthAdapter(supabase);
      storageAdapter = createLiveSupabaseCrmStorageAdapter(supabase);
    }
  } else {
    storageAdapter = createDemoCrmStorageAdapter(demoCrmStore);
  }

  const isProdHttps = process.env.NODE_ENV === "production";

  return {
    ctx: {
      token,
      env,
      authAdapter,
      storageAdapter,
    },
    setSessionCookie(newToken: string) {
      setCookie(CRM_SESSION_COOKIE_NAME, newToken, {
        httpOnly: true,
        secure: isProdHttps,
        sameSite: "lax",
        path: "/",
        maxAge: 8 * 60 * 60,
      });
    },
    clearSessionCookie() {
      try {
        deleteCookie(CRM_SESSION_COOKIE_NAME, {
          httpOnly: true,
          secure: isProdHttps,
          sameSite: "lax",
          path: "/",
        });
      } catch {
        // ignore
      }
    },
  };
}

export async function handleGetCrmSession() {
  const { ctx } = await buildServerExecutionContext();
  const mode = resolveLeadExecutionMode(ctx.env);
  const auth = await authenticateAndAuthorizeCrmRequest({
    token: ctx.token,
    env: ctx.env,
    authAdapter: ctx.authAdapter,
  });

  if (!auth.ok) {
    return {
      authenticated: false as const,
      mode,
      reason: auth.reason,
      message: auth.message,
      demoPersonas:
        mode === "demo"
          ? DEMO_STAFF_DIRECTORY.map((s) => ({
              id: s.id,
              email: s.email,
              full_name: s.full_name,
              role: s.role,
              is_active: s.is_active,
            }))
          : [],
    };
  }

  return {
    authenticated: true as const,
    mode: auth.mode,
    staff: auth.staff,
    permissions: auth.permissions,
    demoPersonas: [],
  };
}

export async function handleLoginCrmStaff(data: unknown) {
  const { ctx, setSessionCookie } = await buildServerExecutionContext();
  const mode = resolveLeadExecutionMode(ctx.env);

  const schema = z.object({
    email: z.string().trim().email("Please enter a valid staff email address"),
    password: z.string().optional(),
    demoPersonaEmail: z.string().email().optional(),
  });

  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    return {
      ok: false as const,
      status: 400,
      message: parsed.error.issues[0]?.message || "Invalid sign-in credentials.",
    };
  }

  if (mode === "demo") {
    const targetEmail = (parsed.data.demoPersonaEmail || parsed.data.email).trim().toLowerCase();
    const matched = DEMO_STAFF_DIRECTORY.find((s) => s.email.toLowerCase() === targetEmail);

    if (!matched) {
      return {
        ok: false as const,
        status: 403,
        reason: "not_staff",
        message: "Access denied. This email is not in the provisioned WAVENOX CRM staff allowlist.",
      };
    }

    const token = createDemoStaffSessionToken(
      {
        authUserId: matched.auth_user_id,
        staffId: matched.id,
      },
      ctx.env,
    );

    if (!matched.is_active) {
      return {
        ok: false as const,
        status: 403,
        reason: "disabled_staff",
        message:
          "Access denied. This WAVENOX staff membership has been deactivated by an administrator.",
      };
    }

    setSessionCookie(token);
    return {
      ok: true as const,
      mode: "demo" as const,
      staff: matched,
      permissions: getPermissionsForRole(matched.role),
    };
  }

  // LIVE MODE — Fail closed if Supabase is not configured
  const { hasValidSupabaseServerConfig, getServerSupabaseClient } =
    await import("@/server/supabase");
  if (!hasValidSupabaseServerConfig(ctx.env)) {
    return {
      ok: false as const,
      status: 503,
      reason: "live_unconfigured",
      message:
        "CRM Live Mode requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY on the server. Access is fail-closed.",
    };
  }

  if (!parsed.data.password || parsed.data.password.length < 6) {
    return {
      ok: false as const,
      status: 400,
      message: "Password is required for live staff authentication.",
    };
  }

  const supabase = getServerSupabaseClient(ctx.env);
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (signInError || !signInData?.session?.access_token) {
    return {
      ok: false as const,
      status: 401,
      reason: "invalid_credentials",
      message: "Invalid staff email or password.",
    };
  }

  const accessToken = signInData.session.access_token;
  const authCheck = await authenticateAndAuthorizeCrmRequest({
    token: accessToken,
    env: ctx.env,
    authAdapter: ctx.authAdapter,
  });

  if (!authCheck.ok) {
    return {
      ok: false as const,
      status: authCheck.status,
      reason: authCheck.reason,
      message: authCheck.message,
    };
  }

  setSessionCookie(accessToken);
  return {
    ok: true as const,
    mode: "live" as const,
    staff: authCheck.staff,
    permissions: authCheck.permissions,
  };
}

export async function executeLogoutCrmStaff(ctx: CrmExecutionContext) {
  if (ctx.token && resolveLeadExecutionMode(ctx.env) === "live") {
    try {
      if (!(await ctx.authAdapter?.revokeSession?.(ctx.token))) {
        return {
          ok: false as const,
          status: 503,
          message: "Sign-out could not be confirmed. Please retry.",
        };
      }
    } catch {
      return {
        ok: false as const,
        status: 503,
        message: "Sign-out could not be confirmed. Please retry.",
      };
    }
  }
  if (ctx.token) {
    revokeCrmSessionToken(ctx.token);
  }
  return { ok: true as const };
}

export async function handleLogoutCrmStaff() {
  const { ctx, clearSessionCookie } = await buildServerExecutionContext();
  const result = await executeLogoutCrmStaff(ctx);
  if (result.ok) clearSessionCookie();
  return result;
}
