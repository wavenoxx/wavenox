import { createHash, randomUUID } from "node:crypto";
import {
  canAccessProject,
  MILESTONES,
  validateMilestoneChange,
  type ProjectRecord,
  type ProjectActor,
  type ProjectActivity,
  type ProjectDocument,
  type MilestoneState,
} from "@/lib/projects";
import { DEMO_STAFF_DIRECTORY } from "./crm-auth";
import { createDemoCrmStorageAdapter } from "./crm-service";
import { ProjectError, type ProjectStore, type ProjectMutationResult } from "./project-store";
export const DEMO_CUSTOMERS = [
  {
    id: "00000000-0000-4000-8000-000000000801",
    label: "Synthetic customer A",
    email: "customer-a@example.invalid",
  },
  {
    id: "00000000-0000-4000-8000-000000000802",
    label: "Synthetic customer B",
    email: "customer-b@example.invalid",
  },
] as const;
export function createDemoProjectStore(
  onBeforeAudit?: (event: ProjectActivity) => void,
): ProjectStore {
  const projects = new Map<string, ProjectRecord>();
  const files = new Map<string, Buffer>();
  const sessions = new Map<string, { userId: string; expires: number }>();
  const limits = new Map<string, { start: number; count: number }>();
  const crm = createDemoCrmStorageAdapter();
  const now = () => new Date().toISOString();
  for (let i = 0; i < 2; i++) {
    const id = `00000000-0000-4000-8000-00000000070${i + 1}`;
    projects.set(id, {
      id,
      reference: `WNX-DEMO-P-${i + 1}`,
      consultation_id: `00000000-0000-4000-8000-00000000060${i + 1}`,
      title: i ? "DEMO · Bengaluru residence" : "DEMO · Hyderabad residence",
      project_type: "residential",
      city: i ? "Bengaluru" : "Hyderabad",
      coordinator_id: DEMO_STAFF_DIRECTORY[1].id,
      state: "active",
      version: 1,
      contact_reference: "DEMO contact only",
      activation_evidence: "DEMO operational prerequisite fixture",
      created_at: now(),
      updated_at: now(),
      completed_at: null,
      memberships: [{ user_id: DEMO_CUSTOMERS[i].id, active: true }],
      invitations: [],
      milestones: MILESTONES.map(([key, label]) => ({
        key,
        label,
        state: key === "confirmed" ? "completed" : "not_started",
        summary: key === "confirmed" ? "Synthetic project for demonstration." : "",
        completed_at: key === "confirmed" ? now() : null,
        updated_at: now(),
        evidence_document_id: null,
      })),
      appointments: [],
      documents: [],
      support: [],
      activities: [],
    });
  }
  function authorized(actor: ProjectActor, id: string): ProjectRecord {
    const p = projects.get(id);
    if (
      actor.kind === "staff" &&
      !DEMO_STAFF_DIRECTORY.some((s) => s.id === actor.id && s.is_active && s.role === actor.role)
    )
      throw new ProjectError(403, "Project access is unavailable.");
    if (!p || !canAccessProject(actor, p))
      throw new ProjectError(403, "Project access is unavailable.");
    return p;
  }
  const hash = (x: unknown) => createHash("sha256").update(JSON.stringify(x)).digest("hex");
  const store: ProjectStore = {
    async list(a) {
      return [...projects.values()]
        .filter(
          (p) => (a.kind === "staff" && a.role === "read_only_viewer") || canAccessProject(a, p),
        )
        .slice(0, 50)
        .map((p) => ({
          id: p.id,
          reference: p.reference,
          title:
            a.kind === "staff" && a.role === "read_only_viewer" ? "Restricted project" : p.title,
          city: a.kind === "staff" && a.role === "read_only_viewer" ? "" : p.city,
          project_type: p.project_type,
          state: p.state,
          version: p.version,
          updated_at: p.updated_at,
          restricted: a.kind === "staff" && a.role === "read_only_viewer",
        }));
    },
    async read(a, id) {
      return structuredClone(authorized(a, id));
    },
    async create(a, input) {
      if (a.kind !== "staff" || a.role !== "owner_admin")
        throw new ProjectError(403, "Owner authorization required.");
      const lead = await crm.getLeadById(input.consultationId);
      if (!lead || lead.status !== "contract_signed" || !input.prerequisitesConfirmed)
        throw new ProjectError(400, "An eligible consultation and prerequisites are required.");
      const prior = [...projects.values()].find((p) => p.consultation_id === input.consultationId);
      if (prior) {
        const event = prior.activities.find((e) => e.request_id === input.requestId);
        if (event?.payload_hash === hash(input) && event.actor_id === a.id)
          return event.result as ProjectMutationResult;
        throw new ProjectError(409, "This consultation already has a project.");
      }
      if (lead.crm_version !== input.expectedLeadVersion)
        throw new ProjectError(409, "Consultation changed. Refresh before creating the project.");
      if (
        !DEMO_STAFF_DIRECTORY.some(
          (s) => s.id === input.coordinatorId && s.is_active && s.role !== "read_only_viewer",
        )
      )
        throw new ProjectError(400, "Choose an active coordinator.");
      const p = structuredClone(projects.values().next().value!);
      p.id = randomUUID();
      p.reference = "WNX-DEMO-P-" + p.id.slice(0, 8).toUpperCase();
      p.consultation_id = lead.id;
      p.title = input.title;
      p.city = input.city;
      p.project_type = input.projectType;
      p.coordinator_id = input.coordinatorId;
      p.activation_evidence = input.authorizationEvidence;
      p.contact_reference = input.contactReference;
      p.version = 1;
      p.created_at = now();
      p.updated_at = now();
      p.memberships = [];
      p.invitations = [];
      p.appointments = [];
      p.documents = [];
      p.support = [];
      p.activities = [];
      p.state = "active";
      p.completed_at = null;
      p.milestones = MILESTONES.map(([key, label]) => ({
        key,
        label,
        state: key === "confirmed" ? "completed" : "not_started",
        summary: key === "confirmed" ? "Project prerequisites reviewed by staff." : "",
        completed_at: key === "confirmed" ? now() : null,
        updated_at: now(),
        evidence_document_id: null,
      }));
      const result = { projectId: p.id, version: 1 };
      const event: ProjectActivity = {
        id: randomUUID(),
        action: "project_created",
        summary: input.authorizationEvidence,
        customer_visible: false,
        created_at: now(),
        actor_label: "Demo owner",
        actor_id: a.id,
        request_id: input.requestId,
        payload_hash: hash(input),
        result,
      };
      onBeforeAudit?.(event);
      p.activities = [event];
      projects.set(p.id, p);
      return result;
    },
    async mutate(a, c) {
      const original = authorized(a, c.projectId);
      const previous = original.activities.find((e) => e.request_id === c.requestId);
      const fingerprint = hash({ action: c.action, payload: c.payload });
      if (previous) {
        if (previous.actor_id === a.id && previous.payload_hash === fingerprint)
          return { ...(previous.result as ProjectMutationResult), replayed: true };
        throw new ProjectError(409, "Request already processed.");
      }
      if (original.version !== c.expectedVersion)
        throw new ProjectError(409, "Project changed. Refresh before trying again.");
      if (a.kind === "customer" && !["support", "appointment"].includes(c.action))
        throw new ProjectError(403, "Customer action is not permitted.");
      if (
        ["coordinator", "status", "invite", "revoke"].includes(c.action) &&
        (a.kind !== "staff" || a.role !== "owner_admin")
      )
        throw new ProjectError(403, "Owner authorization required.");
      if (
        ["completed", "cancelled"].includes(original.state) &&
        ["milestone", "coordinator"].includes(c.action)
      )
        throw new ProjectError(409, "Reopen the project first.");
      const p = structuredClone(original),
        v = c.payload;
      let summary = String(v.reason ?? v.summary ?? "");
      let visible = false;
      let resourceId: string | undefined;
      let before: unknown = null,
        after: unknown = null;
      const value = (key: string) => String(v[key] ?? "");
      switch (c.action) {
        case "coordinator":
          if (
            !DEMO_STAFF_DIRECTORY.some(
              (s) => s.id === v.coordinatorId && s.is_active && s.role !== "read_only_viewer",
            )
          )
            throw new ProjectError(400, "Choose an active coordinator.");
          before = { coordinator_id: p.coordinator_id };
          p.coordinator_id = value("coordinatorId");
          after = { coordinator_id: p.coordinator_id };
          break;
        case "status": {
          const state = value("state") as ProjectRecord["state"];
          if (state === p.state) throw new ProjectError(400, "Choose a different state.");
          if (
            state === "completed" &&
            !["commissioning", "handover"].every((k) =>
              p.milestones.some(
                (m) =>
                  m.key === k &&
                  m.state === "completed" &&
                  p.documents.some(
                    (d) =>
                      d.id === m.evidence_document_id && d.kind === k && d.status === "verified",
                  ),
              ),
            )
          )
            throw new ProjectError(400, "Commissioning and handover evidence are required.");
          before = { state: p.state };
          p.state = state;
          p.completed_at = state === "completed" ? now() : null;
          after = { state };
          visible = true;
          break;
        }
        case "milestone": {
          const m = p.milestones.find((m) => m.key === v.key);
          if (!m) throw new ProjectError(400, "Unknown milestone.");
          before = { ...m };
          const evidence = p.documents.find(
            (d) => d.id === v.evidenceDocumentId && d.status === "verified",
          );
          if (v.evidenceDocumentId && !evidence)
            throw new ProjectError(400, "Choose a verified project document.");
          try {
            validateMilestoneChange(
              m.key,
              m.state,
              value("state") as MilestoneState,
              summary,
              evidence?.kind === m.key,
            );
          } catch {
            throw new ProjectError(
              400,
              "Use a valid milestone transition, reason and verified evidence.",
            );
          }
          const prior = m.key === "handover" ? "commissioning" : "installation";
          if (
            ["commissioning", "handover"].includes(m.key) &&
            v.state === "completed" &&
            !p.milestones.some((x) => x.key === prior && x.state === "completed")
          )
            throw new ProjectError(400, "Complete the preceding operational milestone.");
          if (
            ["installation", "commissioning"].includes(m.key) &&
            m.state === "completed" &&
            p.milestones.some(
              (x) =>
                x.key === (m.key === "installation" ? "commissioning" : "handover") &&
                x.state === "completed",
            )
          )
            throw new ProjectError(409, "Reverse the dependent milestone first.");
          m.state = value("state") as MilestoneState;
          m.summary = summary;
          m.completed_at = m.state === "completed" ? now() : null;
          m.updated_at = now();
          m.evidence_document_id = evidence?.id ?? null;
          after = { ...m };
          visible = true;
          break;
        }
        case "appointment": {
          if (a.kind === "customer" && (v.status !== "requested" || v.id || v.assignedStaffId))
            throw new ProjectError(403, "Customers may request a new appointment only.");
          const existing = p.appointments.find((x) => x.id === v.id);
          if (v.id && !existing) throw new ProjectError(400, "Appointment not found.");
          if (existing && ["completed", "cancelled"].includes(existing.status))
            throw new ProjectError(409, "Appointment is closed.");
          if (
            v.status === "completed" &&
            (!existing ||
              existing.status !== "confirmed" ||
              Date.parse(existing.ends_at) > Date.now() ||
              Date.parse(existing.starts_at) !== Date.parse(value("startsAt")) ||
              Date.parse(existing.ends_at) !== Date.parse(value("endsAt")))
          )
            throw new ProjectError(400, "Only an actual confirmed visit can be completed.");
          if (["rescheduled", "cancelled"].includes(value("status")) && !existing)
            throw new ProjectError(400, "Choose an existing appointment.");
          if (
            !["completed", "cancelled"].includes(value("status")) &&
            Date.parse(value("startsAt")) <= Date.now()
          )
            throw new ProjectError(400, "Choose a future appointment.");
          const assigned = value("assignedStaffId") || p.coordinator_id;
          if (a.kind === "staff" && a.role === "sales_coordinator" && assigned !== a.id)
            throw new ProjectError(403, "Coordinator assignment is outside your scope.");
          if (
            !DEMO_STAFF_DIRECTORY.some(
              (s) => s.id === assigned && s.is_active && s.role !== "read_only_viewer",
            )
          )
            throw new ProjectError(400, "Choose an active coordinator.");
          if (
            v.status === "confirmed" &&
            [...projects.values()].some((proj) =>
              proj.appointments.some(
                (x) =>
                  x.id !== v.id &&
                  x.assigned_staff_id === assigned &&
                  x.status === "confirmed" &&
                  Date.parse(x.starts_at) < Date.parse(value("endsAt")) &&
                  Date.parse(x.ends_at) > Date.parse(value("startsAt")),
              ),
            )
          )
            throw new ProjectError(
              409,
              "The coordinator has an overlapping confirmed appointment.",
            );
          resourceId = existing?.id ?? randomUUID();
          before = existing ?? null;
          const ap = {
            id: resourceId,
            kind: value("kind") as "survey" | "installation" | "service",
            status: value("status") as ProjectRecord["appointments"][number]["status"],
            starts_at: value("startsAt"),
            ends_at: value("endsAt"),
            assigned_staff_id: assigned,
            instructions: value("instructions"),
            completed_at: v.status === "completed" ? now() : null,
          };
          p.appointments = p.appointments.filter((x) => x.id !== resourceId);
          p.appointments.unshift(ap);
          after = ap;
          summary = "Appointment " + ap.status + ": " + ap.instructions;
          visible = true;
          break;
        }
        case "note":
          visible = v.customerVisible === true;
          after = { summary, customer_visible: visible };
          break;
        case "invite": {
          const email = value("email").toLowerCase();
          const prior = p.invitations.find((i) => i.email === email);
          if (
            prior &&
            (prior.status === "accepted" ||
              (prior.status === "pending" && Date.parse(prior.expires_at) > Date.now()))
          )
            throw new ProjectError(409, "An active invitation already exists.");
          resourceId = prior?.id ?? randomUUID();
          p.invitations = p.invitations.filter((i) => i.id !== resourceId);
          const i = {
            id: resourceId,
            email,
            status: "pending" as const,
            created_at: now(),
            expires_at: new Date(Date.now() + 86400000).toISOString(),
          };
          p.invitations.unshift(i);
          after = i;
          break;
        }
        case "revoke": {
          if (v.userId) {
            const m = p.memberships.find((m) => m.user_id === v.userId && m.active);
            if (!m) throw new ProjectError(400, "Membership not found.");
            before = { ...m };
            m.active = false;
            m.revoked_at = now();
            after = { ...m };
          } else {
            const i = p.invitations.find((i) => i.id === v.invitationId && i.status === "pending");
            if (!i) throw new ProjectError(400, "Invitation not found.");
            before = { ...i };
            i.status = "revoked";
            after = { ...i };
          }
          break;
        }
        case "document": {
          if (
            !files.has(value("storagePath")) ||
            value("storagePath") !== `${p.id}/${value("id")}.jpg`
          )
            throw new ProjectError(400, "Validated private upload required.");
          const prior = p.documents.find((d) => d.id === v.replacesId && d.status !== "superseded");
          if (
            v.replacesId &&
            (!prior ||
              p.milestones.some(
                (m) => m.evidence_document_id === prior.id && m.state === "completed",
              ))
          )
            throw new ProjectError(409, "Document replacement requires evidence review.");
          if (prior) {
            before = { ...prior };
            prior.status = "superseded";
          }
          resourceId = value("id");
          const doc: ProjectDocument = {
            id: resourceId,
            title: value("title"),
            kind: value("kind") as ProjectDocument["kind"],
            visibility: value("visibility") as ProjectDocument["visibility"],
            status: "pending",
            revision: (prior?.revision ?? 0) + 1,
            mime: "image/jpeg",
            created_at: now(),
            storage_path: value("storagePath"),
            replaces_id: prior?.id ?? null,
          };
          p.documents.unshift(doc);
          summary = "Document uploaded for review: " + doc.title;
          after = doc;
          break;
        }
        case "document_review": {
          const d = p.documents.find((d) => d.id === v.id && d.status !== "superseded");
          if (!d) throw new ProjectError(400, "Document not found.");
          if (
            v.verified !== true &&
            p.milestones.some((m) => m.evidence_document_id === d.id && m.state === "completed")
          )
            throw new ProjectError(409, "Reverse the dependent milestone first.");
          before = { ...d };
          d.status = v.verified ? "verified" : "pending";
          after = { ...d };
          resourceId = d.id;
          visible = d.visibility === "customer" && d.status === "verified";
          if (visible) summary = "Document available: " + d.title;
          break;
        }
        case "support": {
          if (
            [...projects.values()]
              .flatMap((p) => p.support)
              .filter(
                (s) => s.created_by === a.id && Date.parse(s.created_at) > Date.now() - 3600000,
              ).length >= 5
          )
            throw new ProjectError(429, "Too many support requests. Try later.");
          resourceId = randomUUID();
          const s = {
            id: resourceId,
            category: value("category") as ProjectRecord["support"][number]["category"],
            description: value("description"),
            status: "open" as const,
            public_response: "",
            internal_note: "",
            created_at: now(),
            resolved_at: null,
            created_by: a.id,
          };
          p.support.unshift(s);
          after = s;
          summary = "Support request received.";
          visible = true;
          break;
        }
        case "support_response": {
          const s = p.support.find((s) => s.id === v.id);
          if (!s) throw new ProjectError(400, "Support request not found.");
          before = { ...s };
          s.status = value("status") as typeof s.status;
          s.public_response = value("publicResponse");
          s.internal_note = value("internalNote");
          s.resolved_at = s.status === "resolved" ? now() : null;
          after = { ...s };
          resourceId = s.id;
          summary = "Support request " + s.status + ".";
          visible = s.public_response.length > 0;
          break;
        }
      }
      p.version++;
      p.updated_at = now();
      const result = { projectId: p.id, version: p.version, resourceId };
      const event: ProjectActivity = {
        id: randomUUID(),
        action: c.action,
        summary,
        customer_visible: visible,
        created_at: now(),
        actor_label:
          a.kind === "customer"
            ? "Customer"
            : (DEMO_STAFF_DIRECTORY.find((s) => s.id === a.id)?.full_name ?? "Staff"),
        actor_id: a.id,
        request_id: c.requestId,
        payload_hash: fingerprint,
        before_state: before,
        after_state: after,
        result,
      };
      onBeforeAudit?.(event);
      p.activities.unshift(event);
      projects.set(p.id, p);
      return result;
    },
    async eligibleLeads() {
      return (await crm.getAllLeadsRaw())
        .filter((l) => l.status === "contract_signed")
        .slice(0, 50)
        .map(({ id, reference_code, client_name, city, crm_version }) => ({
          id,
          reference_code,
          client_name,
          city,
          crm_version,
        }));
    },
    async staffDirectory() {
      return DEMO_STAFF_DIRECTORY.filter((s) => s.is_active && s.role !== "read_only_viewer").map(
        ({ id, full_name }) => ({ id, full_name }),
      );
    },
    async emailAllowed() {
      return false;
    },
    async openSession(userId, email, tokenHash) {
      if (!DEMO_CUSTOMERS.some((c) => c.id === userId && c.email === email))
        throw new ProjectError(401, "Synthetic identity required.");
      const changed: ProjectRecord[] = [];
      for (const original of projects.values()) {
        const p = structuredClone(original);
        let accepted = false;
        for (const i of p.invitations.filter(
          (i) =>
            i.email === email && i.status === "pending" && Date.parse(i.expires_at) > Date.now(),
        )) {
          i.status = "accepted";
          p.memberships = p.memberships.filter((m) => m.user_id !== userId);
          p.memberships.push({ user_id: userId, active: true, created_at: now() });
          p.version++;
          p.updated_at = now();
          const event: ProjectActivity = {
            id: randomUUID(),
            action: "membership_accepted",
            summary: "Synthetic approved invitation accepted.",
            customer_visible: false,
            created_at: now(),
            actor_label: "Demo customer",
          };
          onBeforeAudit?.(event);
          p.activities.unshift(event);
          accepted = true;
        }
        if (accepted) changed.push(p);
      }
      changed.forEach((p) => projects.set(p.id, p));
      sessions.set(tokenHash, { userId, expires: Date.now() + 3600000 });
    },
    async sessionUser(hash) {
      const s = sessions.get(hash);
      if (!s || s.expires <= Date.now()) throw new ProjectError(401, "Sign in required.");
      return s.userId;
    },
    async endSession(hash) {
      sessions.delete(hash);
    },
    async consumeLimit(key, limit, seconds) {
      const p = limits.get(key);
      const value =
        p && p.start + seconds * 1000 > Date.now()
          ? { ...p, count: p.count + 1 }
          : { start: Date.now(), count: 1 };
      limits.set(key, value);
      return value.count <= limit;
    },
    async document(id) {
      for (const p of projects.values()) {
        const d = p.documents.find((d) => d.id === id);
        if (d) return { ...d, project_id: p.id };
      }
      throw new ProjectError(403, "Document access is unavailable.");
    },
    async auditDownload(a, id) {
      const d = await store.document(id);
      const p = authorized(a, d.project_id);
      if (
        d.status === "superseded" ||
        (a.kind === "customer" && (d.status !== "verified" || d.visibility !== "customer"))
      )
        throw new ProjectError(403, "Document access is unavailable.");
      const e: ProjectActivity = {
        id: randomUUID(),
        action: "document_access",
        summary: "Authorized document download requested.",
        customer_visible: false,
        created_at: now(),
        actor_label: a.kind === "customer" ? "Customer" : "Authorized staff",
      };
      onBeforeAudit?.(e);
      p.activities.unshift(e);
      return d.storage_path!;
    },
    async upload(path, bytes) {
      if (files.has(path)) throw new ProjectError(409, "Upload already exists.");
      files.set(path, Buffer.from(bytes));
    },
    async download(path) {
      const b = files.get(path);
      if (!b) throw new ProjectError(503, "Document download unavailable.");
      return Buffer.from(b);
    },
    async remove(path) {
      files.delete(path);
    },
  };
  return store;
}
