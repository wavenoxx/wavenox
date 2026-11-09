import { z } from "zod";

export const MILESTONES = [
  ["confirmed", "Project confirmed"],
  ["survey", "Site survey"],
  ["engineering", "Engineering review"],
  ["utility", "DISCOM / net-metering coordination"],
  ["equipment", "Equipment preparation"],
  ["scheduled", "Installation scheduled"],
  ["installation", "Installation underway"],
  ["commissioning", "Testing & commissioning"],
  ["handover", "Handover"],
  ["aftercare", "Aftercare & support"],
] as const;
export const MILESTONE_KEYS = MILESTONES.map(([key]) => key) as [string, ...string[]];
export const MILESTONE_STATES = [
  "not_started",
  "in_progress",
  "blocked",
  "completed",
  "not_applicable",
] as const;
export const APPOINTMENT_STATES = [
  "requested",
  "proposed",
  "confirmed",
  "rescheduled",
  "completed",
  "cancelled",
] as const;
export const DOCUMENT_KINDS = [
  "survey",
  "engineering",
  "quotation",
  "agreement",
  "equipment",
  "utility",
  "commissioning",
  "handover",
  "warranty",
] as const;
export const SUPPORT_CATEGORIES = [
  "survey",
  "installation",
  "equipment",
  "documentation",
  "commissioning",
  "aftercare",
  "other",
] as const;
export const PROJECT_STATES = ["active", "on_hold", "completed", "cancelled"] as const;
export const PROJECT_DOCUMENT_LIMIT = 3 * 1024 * 1024;
export type MilestoneState = (typeof MILESTONE_STATES)[number];
export type ProjectActor =
  | { kind: "staff"; id: string; role: "owner_admin" | "sales_coordinator" | "read_only_viewer" }
  | { kind: "customer"; id: string };
export interface ProjectMilestone {
  key: string;
  label: string;
  state: MilestoneState;
  summary: string;
  completed_at: string | null;
  updated_at: string;
  evidence_document_id: string | null;
}
export interface ProjectAppointment {
  id: string;
  kind: "survey" | "installation" | "service";
  status: (typeof APPOINTMENT_STATES)[number];
  starts_at: string;
  ends_at: string;
  instructions: string;
  assigned_staff_id: string;
  completed_at: string | null;
}
export interface ProjectDocument {
  id: string;
  title: string;
  kind: (typeof DOCUMENT_KINDS)[number];
  visibility: "internal" | "customer";
  status: "pending" | "verified" | "superseded";
  revision: number;
  mime: "image/jpeg" | "image/png";
  created_at: string;
  replaces_id: string | null;
  storage_path?: string;
}
export interface ProjectSupport {
  id: string;
  category: (typeof SUPPORT_CATEGORIES)[number];
  description: string;
  status: "open" | "in_progress" | "resolved";
  public_response: string;
  internal_note: string;
  created_at: string;
  resolved_at: string | null;
  created_by: string;
}
export interface ProjectActivity {
  id: string;
  action: string;
  summary: string;
  customer_visible: boolean;
  created_at: string;
  actor_label: string;
  before_state?: unknown;
  after_state?: unknown;
  request_id?: string;
  payload_hash?: string;
  actor_id?: string;
  result?: unknown;
}
export interface ProjectMembership {
  user_id: string;
  active: boolean;
  created_at?: string;
  revoked_at?: string | null;
}
export interface ProjectInvitation {
  id: string;
  email: string;
  status: "pending" | "accepted" | "revoked";
  expires_at: string;
  created_at: string;
}
export interface ProjectRecord {
  id: string;
  reference: string;
  consultation_id: string;
  title: string;
  project_type: "residential" | "commercial" | "hybrid";
  city: string;
  coordinator_id: string;
  state: (typeof PROJECT_STATES)[number];
  version: number;
  contact_reference: string;
  activation_evidence: string;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  milestones: ProjectMilestone[];
  appointments: ProjectAppointment[];
  documents: ProjectDocument[];
  support: ProjectSupport[];
  activities: ProjectActivity[];
  memberships: ProjectMembership[];
  invitations: ProjectInvitation[];
}
export type ProjectSummary = Pick<
  ProjectRecord,
  "id" | "reference" | "title" | "city" | "project_type" | "state" | "version" | "updated_at"
> & { restricted?: boolean };
export function canAccessProject(actor: ProjectActor, project: ProjectRecord): boolean {
  if (actor.kind === "customer")
    return project.memberships.some((m) => m.user_id === actor.id && m.active);
  return (
    actor.role === "owner_admin" ||
    (actor.role === "sales_coordinator" && project.coordinator_id === actor.id)
  );
}
export function toCustomerProject(p: ProjectRecord) {
  return {
    id: p.id,
    reference: p.reference,
    title: p.title,
    city: p.city,
    project_type: p.project_type,
    state: p.state,
    version: p.version,
    created_at: p.created_at,
    updated_at: p.updated_at,
    completed_at: p.completed_at,
    milestones: p.milestones.map((m) => ({
      key: m.key,
      label: m.label,
      state: m.state,
      summary: m.summary,
      completed_at: m.completed_at,
      updated_at: m.updated_at,
    })),
    appointments: p.appointments.map((a) => ({
      id: a.id,
      kind: a.kind,
      status: a.status,
      starts_at: a.starts_at,
      ends_at: a.ends_at,
      instructions: a.instructions,
      completed_at: a.completed_at,
    })),
    documents: p.documents
      .filter((d) => d.visibility === "customer" && d.status === "verified")
      .map((d) => ({
        id: d.id,
        title: d.title,
        kind: d.kind,
        revision: d.revision,
        mime: d.mime,
        created_at: d.created_at,
        status: d.status,
      })),
    support: p.support.map((s) => ({
      id: s.id,
      category: s.category,
      description: s.description,
      status: s.status,
      public_response: s.public_response,
      created_at: s.created_at,
      resolved_at: s.resolved_at,
    })),
    activities: p.activities
      .filter((a) => a.customer_visible)
      .map((a) => ({ id: a.id, action: a.action, summary: a.summary, created_at: a.created_at })),
  };
}
export type CustomerProject = ReturnType<typeof toCustomerProject>;
const uuid = z.string().uuid();
const text = (min = 1, max = 1000) => z.string().trim().min(min).max(max);
const utc = z
  .string()
  .datetime({ offset: true })
  .refine((s) => Number.isFinite(Date.parse(s)), "Use a valid timestamp with timezone");
export const createProjectSchema = z
  .object({
    consultationId: uuid,
    expectedLeadVersion: z.number().int().min(1),
    requestId: uuid,
    title: text(3, 120),
    projectType: z.enum(["residential", "commercial", "hybrid"]),
    city: text(2, 100),
    coordinatorId: uuid,
    contactReference: text(10, 300),
    authorizationEvidence: text(15, 1000),
    prerequisitesConfirmed: z.literal(true),
  })
  .strict();
export const projectPayloadSchemas = {
  coordinator: z.object({ coordinatorId: uuid, reason: text(10) }).strict(),
  status: z.object({ state: z.enum(PROJECT_STATES), reason: text(10) }).strict(),
  milestone: z
    .object({
      key: z.enum(MILESTONE_KEYS),
      state: z.enum(MILESTONE_STATES),
      summary: text(10),
      evidenceDocumentId: uuid.nullable().optional(),
    })
    .strict(),
  appointment: z
    .object({
      id: uuid.optional(),
      kind: z.enum(["survey", "installation", "service"]),
      status: z.enum(APPOINTMENT_STATES),
      startsAt: utc,
      endsAt: utc,
      instructions: text(5),
      assignedStaffId: uuid.optional(),
    })
    .strict()
    .refine(
      (v) =>
        Date.parse(v.endsAt) > Date.parse(v.startsAt) &&
        Date.parse(v.endsAt) - Date.parse(v.startsAt) <= 8 * 3600000,
      "Appointment must last up to eight hours",
    ),
  note: z.object({ summary: text(5), customerVisible: z.boolean().default(false) }).strict(),
  invite: z
    .object({
      email: z
        .string()
        .trim()
        .email()
        .max(254)
        .transform((s) => s.toLowerCase()),
      reason: text(10),
    })
    .strict(),
  revoke: z
    .object({ userId: uuid.optional(), invitationId: uuid.optional(), reason: text(10) })
    .strict()
    .refine(
      (v) => Boolean(v.userId) !== Boolean(v.invitationId),
      "Choose one membership or invitation",
    ),
  document: z
    .object({
      id: uuid,
      title: text(3, 120),
      kind: z.enum(DOCUMENT_KINDS),
      visibility: z.enum(["internal", "customer"]),
      storagePath: text(1, 200),
      mime: z.enum(["image/jpeg", "image/png"]),
      replacesId: uuid.nullable().optional(),
    })
    .strict(),
  document_review: z.object({ id: uuid, verified: z.boolean(), reason: text(10) }).strict(),
  support: z.object({ category: z.enum(SUPPORT_CATEGORIES), description: text(10, 2000) }).strict(),
  support_response: z
    .object({
      id: uuid,
      status: z.enum(["open", "in_progress", "resolved"]),
      publicResponse: z.string().trim().max(2000),
      internalNote: z.string().trim().max(2000).default(""),
    })
    .strict()
    .refine(
      (v) => v.status !== "resolved" || v.publicResponse.length >= 5,
      "A resolution needs a customer-visible response",
    ),
} as const;
export type ProjectAction = keyof typeof projectPayloadSchemas;
export const PROJECT_ACTIONS = Object.keys(projectPayloadSchemas) as [
  ProjectAction,
  ...ProjectAction[],
];
export const projectCommandSchema = z
  .object({
    action: z.enum(PROJECT_ACTIONS),
    projectId: uuid,
    expectedVersion: z.number().int().min(1),
    requestId: uuid,
    payload: z.record(z.string(), z.unknown()),
  })
  .strict()
  .superRefine((v, ctx) => {
    const result = projectPayloadSchemas[v.action].safeParse(v.payload);
    if (!result.success)
      ctx.addIssue({
        code: "custom",
        message: result.error.issues[0]?.message || "Invalid operation",
      });
  });
export type ProjectCommand = z.infer<typeof projectCommandSchema>;
export function validateMilestoneChange(
  key: string,
  from: MilestoneState,
  to: MilestoneState,
  summary: string,
  verifiedEvidence = false,
): void {
  const transitions: Record<MilestoneState, readonly MilestoneState[]> = {
    not_started: ["in_progress", "blocked", "not_applicable"],
    in_progress: ["blocked", "completed", "not_applicable"],
    blocked: ["in_progress", "not_applicable"],
    completed: ["in_progress"],
    not_applicable: ["not_started", "in_progress"],
  };
  if (
    !MILESTONE_KEYS.includes(key) ||
    !transitions[from]?.includes(to) ||
    summary.trim().length < 10
  )
    throw new Error(
      "Record a valid transition and a reason or next action of at least ten characters.",
    );
  if (
    ["commissioning", "handover"].includes(key) &&
    (to === "not_applicable" || (to === "completed" && !verifiedEvidence))
  )
    throw new Error("Commissioning and handover require a verified evidence document.");
}
export function parseIstDateTime(value: string): string {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value))
    throw new Error("Enter a valid date and time in IST.");
  const day = value.slice(0, 10),
    parsed = new Date(`${value}:00+05:30`);
  if (
    !Number.isFinite(parsed.getTime()) ||
    new Date(`${day}T00:00:00Z`).toISOString().slice(0, 10) !== day ||
    Number(value.slice(11, 13)) > 23 ||
    Number(value.slice(14)) > 59
  )
    throw new Error("Enter a valid date and time in IST.");
  return parsed.toISOString();
}
export function formatProjectDate(iso: string | null): string {
  if (!iso || !Number.isFinite(Date.parse(iso))) return "Not scheduled";
  return (
    new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso)) + " IST"
  );
}
export const labelForState = (state: string) =>
  state.replaceAll("_", " ").replace(/^./, (s) => s.toUpperCase());
