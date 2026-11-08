import { describe, it, expect } from "vitest";
import {
  projectCommandSchema,
  canAccessProject,
  toCustomerProject,
  parseIstDateTime,
  validateMilestoneChange,
  type ProjectRecord,
  type ProjectActor,
} from "./projects";
const owner: ProjectActor = {
  kind: "staff",
  id: "00000000-0000-4000-8000-000000000101",
  role: "owner_admin",
};
const customer: ProjectActor = { kind: "customer", id: "00000000-0000-4000-8000-000000000801" };
const project = {
  id: "00000000-0000-4000-8000-000000000701",
  coordinator_id: owner.id,
  title: "Solar installation",
  reference: "WNX-P-TEST",
  city: "Hyderabad",
  project_type: "residential",
  state: "active",
  version: 1,
  created_at: "2026-11-07T00:00:00Z",
  updated_at: "2026-11-07T00:00:00Z",
  completed_at: null,
  consultation_id: "00000000-0000-4000-8000-000000000601",
  activation_evidence: "PRIVATE COMMERCIAL EVIDENCE",
  contact_reference: "PRIVATE CONTACT",
  milestones: [],
  appointments: [],
  documents: [],
  support: [],
  activities: [],
  invitations: [],
  memberships: [{ user_id: customer.id, active: true }],
} as ProjectRecord;
describe("project trust boundaries", () => {
  it("requires explicit active membership for customers", () => {
    expect(canAccessProject(customer, project)).toBe(true);
    expect(canAccessProject({ ...customer, id: "other" }, project)).toBe(false);
    expect(
      canAccessProject(customer, {
        ...project,
        memberships: [{ user_id: customer.id, active: false }],
      }),
    ).toBe(false);
  });
  it("limits coordinators to their projects and rejects viewer detail", () => {
    expect(canAccessProject(owner, project)).toBe(true);
    expect(
      canAccessProject({ kind: "staff", id: "other", role: "sales_coordinator" }, project),
    ).toBe(false);
    expect(canAccessProject({ ...owner, role: "read_only_viewer" }, project)).toBe(false);
  });
  it("constructs customer JSON without internal records or storage paths", () => {
    const result = toCustomerProject({
      ...project,
      activities: [
        { id: "1", action: "note", summary: "PRIVATE NOTE", customer_visible: false },
        { id: "2", action: "update", summary: "Survey proposed", customer_visible: true },
      ] as ProjectRecord["activities"],
      support: [
        {
          id: "3",
          description: "Question",
          public_response: "Reply",
          internal_note: "PRIVATE STAFF NOTE",
          status: "open",
        },
      ] as ProjectRecord["support"],
    });
    const json = JSON.stringify(result);
    expect(json).not.toContain("PRIVATE");
    expect(json).not.toContain("consultation_id");
    expect(json).not.toContain("memberships");
    expect(json).toContain("Survey proposed");
    expect(json).toContain("Reply");
  });
  it("rejects actor spoofing and malformed commands", () => {
    expect(
      projectCommandSchema.safeParse({
        action: "note",
        projectId: project.id,
        expectedVersion: 1,
        requestId: crypto.randomUUID(),
        payload: { summary: "Useful note", customerVisible: false },
        actorId: owner.id,
      }).success,
    ).toBe(false);
    expect(
      projectCommandSchema.safeParse({
        action: "milestone",
        projectId: project.id,
        expectedVersion: -1,
        requestId: "bad",
        payload: { key: "unknown", state: "completed" },
      }).success,
    ).toBe(false);
  });
  it("does not treat a requested appointment as confirmed", () => {
    const dto = toCustomerProject({
      ...project,
      appointments: [
        {
          id: "appt",
          status: "requested",
          starts_at: "2027-01-01T04:30:00Z",
          ends_at: "2027-01-01T05:30:00Z",
          instructions: "Please confirm",
          kind: "survey",
        },
      ] as ProjectRecord["appointments"],
    });
    expect(dto.appointments[0].status).toBe("requested");
  });
});
describe("explicit lifecycle and IST dates", () => {
  it("converts IST input to UTC without using the host timezone", () => {
    expect(parseIstDateTime("2027-01-01T10:00")).toBe("2027-01-01T04:30:00.000Z");
    expect(() => parseIstDateTime("2027-02-30T10:00")).toThrow();
    expect(() => parseIstDateTime("bad")).toThrow();
  });
  it("requires blocker next action, completion evidence and attributable reversals", () => {
    expect(() => validateMilestoneChange("survey", "in_progress", "blocked", "")).toThrow();
    expect(() => validateMilestoneChange("survey", "in_progress", "completed", "")).toThrow();
    expect(() =>
      validateMilestoneChange("survey", "completed", "not_started", "Changed"),
    ).toThrow();
    expect(() =>
      validateMilestoneChange(
        "survey",
        "completed",
        "in_progress",
        "Correction: another site visit required",
      ),
    ).not.toThrow();
  });
  it("does not permit commissioning or handover without verified evidence", () => {
    expect(() =>
      validateMilestoneChange(
        "commissioning",
        "in_progress",
        "completed",
        "Tests completed",
        false,
      ),
    ).toThrow();
    expect(() =>
      validateMilestoneChange("handover", "not_started", "not_applicable", "Not needed"),
    ).toThrow();
    expect(() =>
      validateMilestoneChange(
        "commissioning",
        "in_progress",
        "completed",
        "Signed test sheet reviewed",
        true,
      ),
    ).not.toThrow();
  });
});
