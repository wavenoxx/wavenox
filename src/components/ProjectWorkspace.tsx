import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from "react";
import {
  APPOINTMENT_STATES,
  DOCUMENT_KINDS,
  MILESTONES,
  MILESTONE_STATES,
  PROJECT_STATES,
  SUPPORT_CATEGORIES,
  formatProjectDate,
  labelForState,
  parseIstDateTime,
  type CustomerProject,
  type ProjectRecord,
  type ProjectSummary,
  type ProjectAction,
} from "@/lib/projects";
import {
  downloadProjectDocument,
  projectMutation,
  projectRequest,
  uploadProjectDocument,
} from "@/functions/projects";

const inputClass =
  "w-full min-h-11 rounded border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus-visible:outline-2 focus-visible:outline-amber-700";
const buttonClass =
  "min-h-11 rounded bg-neutral-900 px-5 py-3 text-sm font-medium text-white disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-700";
export function ProjectField({
  label,
  name,
  children,
  type = "text",
  value,
  required = true,
  maxLength = 1000,
}: {
  label: string;
  name: string;
  children?: ReactNode;
  type?: string;
  value?: string;
  required?: boolean;
  maxLength?: number;
}) {
  const fieldId = useId();
  return (
    <div className="grid min-w-0 gap-2 text-sm font-medium">
      <label htmlFor={fieldId}>{label}</label>
      {children ? (
        <select
          id={fieldId}
          className={inputClass}
          name={name}
          defaultValue={value}
          required={required}
        >
          {children}
        </select>
      ) : type === "textarea" ? (
        <textarea
          id={fieldId}
          className={inputClass}
          name={name}
          defaultValue={value}
          required={required}
          maxLength={maxLength}
          rows={3}
        />
      ) : (
        <input
          id={fieldId}
          className={inputClass}
          name={name}
          type={type}
          defaultValue={value}
          required={required}
          maxLength={maxLength}
        />
      )}
    </div>
  );
}
function ProjectForm({
  title,
  children,
  onSubmit,
  submit = "Save change",
  busy,
}: {
  title: string;
  children: ReactNode;
  onSubmit: (data: FormData, id: string) => Promise<void>;
  submit?: string;
  busy: boolean;
}) {
  const requestId = useRef("");
  const [formError, setFormError] = useState("");
  return (
    <form
      aria-label={title}
      className="grid min-w-0 content-start gap-4 rounded border border-neutral-200 bg-white p-4 sm:p-6"
      onChange={() => {
        requestId.current = "";
      }}
      onSubmit={(e) => {
        e.preventDefault();
        if (!requestId.current) requestId.current = crypto.randomUUID();
        const data = new FormData(e.currentTarget);
        setFormError("");
        void Promise.resolve()
          .then(() => onSubmit(data, requestId.current))
          .then(() => {
            requestId.current = "";
          })
          .catch((e) => setFormError(e instanceof Error ? e.message : "Check the form."));
      }}
    >
      <h3 className="text-lg font-semibold">{title}</h3>
      {children}
      {formError && (
        <p role="alert" className="text-sm text-amber-900">
          {formError}
        </p>
      )}
      <button disabled={busy} className={buttonClass}>
        {busy ? "Working…" : submit}
      </button>
    </form>
  );
}
const options = (items: readonly string[]) =>
  items.map((s) => (
    <option key={s} value={s}>
      {labelForState(s)}
    </option>
  ));
const val = (data: FormData, key: string) => String(data.get(key) ?? "");
const istInput = (iso: string) => {
  const d = new Date(Date.parse(iso) + 330 * 60000);
  return d.toISOString().slice(0, 16);
};
type StaffOptions = {
  leads: {
    id: string;
    reference_code: string;
    client_name: string;
    city: string;
    crm_version: number;
  }[];
  staff: { id: string; full_name: string }[];
};
export function ProjectWorkspace({
  audience,
  role,
}: {
  audience: "staff" | "customer";
  role?: "owner_admin" | "sales_coordinator" | "read_only_viewer";
}) {
  const [list, setList] = useState<ProjectSummary[]>([]),
    [selected, setSelected] = useState(""),
    [project, setProject] = useState<ProjectRecord | CustomerProject | null>(null),
    [section, setSection] = useState("overview");
  const [loading, setLoading] = useState(true),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [directory, setDirectory] = useState<StaffOptions>({ leads: [], staff: [] });
  const [appointmentId, setAppointmentId] = useState("");
  const owner = audience === "staff" && role === "owner_admin",
    editing = audience === "staff" && role !== "read_only_viewer";
  const load = useCallback(
    async (id: string) => {
      setLoading(true);
      setProject(null);
      try {
        const rows = await projectRequest<ProjectSummary[]>(`?audience=${audience}`);
        setList(rows);
        const chosen =
          id && rows.some((p) => p.id === id) ? id : (rows.find((p) => !p.restricted)?.id ?? "");
        setSelected(chosen);
        if (chosen)
          setProject(
            await projectRequest<ProjectRecord | CustomerProject>(
              `?audience=${audience}&projectId=${chosen}`,
            ),
          );
        if (owner)
          setDirectory(await projectRequest<StaffOptions>("?audience=staff&action=options"));
      } finally {
        setLoading(false);
      }
    },
    [audience, owner],
  );
  useEffect(() => {
    let live = true;
    void load("").catch((e) => {
      if (live) setError(e instanceof Error ? e.message : "Unable to load projects.");
    });
    return () => {
      live = false;
    };
  }, [load]);
  const run = async (work: () => Promise<unknown>, message = "Change recorded and audited.") => {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await work();
      await load(selected);
      setNotice(message);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No success is confirmed.");
      throw e;
    } finally {
      setBusy(false);
    }
  };
  const mutate = (action: ProjectAction, payload: Record<string, unknown>, id: string) =>
    run(() => projectMutation(audience, selected, project!.version, action, payload, id));
  const staffProject = audience === "staff" ? (project as ProjectRecord | null) : null;
  const appointment = project?.appointments.find((a) => a.id === appointmentId);
  const sections = [
    "overview",
    "journey",
    "appointments",
    "documents",
    "support",
    ...(editing ? ["operations"] : []),
  ];
  return (
    <div className="min-w-0 space-y-6 text-neutral-900">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">
            {audience === "staff" ? "Installation projects" : "Your projects"}
          </h2>
          <p className="mt-2 text-sm text-neutral-600">
            {audience === "staff"
              ? "Verified activation and accountable project operations."
              : "Updates recorded by your project team. Dates remain tentative until confirmed."}
          </p>
        </div>
        <button
          className={buttonClass}
          disabled={loading || busy}
          onClick={() => void run(() => load(selected), "Projects refreshed.").catch(() => {})}
        >
          Refresh projects
        </button>
      </div>
      {error && (
        <div role="alert" className="rounded border border-amber-700 bg-amber-50 p-4 text-sm">
          {error}
        </div>
      )}
      {notice && (
        <p role="status" className="text-sm">
          {notice}
        </p>
      )}
      {loading ? (
        <p role="status">Loading authorized projects…</p>
      ) : (
        <>
          {list.length === 0 && (
            <div className="rounded border border-neutral-200 bg-white p-8">
              <h3 className="text-lg font-semibold">No approved projects yet</h3>
              <p className="mt-2 text-sm text-neutral-600">
                An enquiry does not create an installation project. Your coordinator must verify and
                activate it.
              </p>
            </div>
          )}
          {list.some((p) => !p.restricted) && (
            <label className="grid gap-2 text-sm font-medium">
              Select project
              <select
                className={inputClass}
                value={selected}
                onChange={(e) => {
                  setAppointmentId("");
                  setError("");
                  void load(e.target.value).catch((e) =>
                    setError(e instanceof Error ? e.message : "Project unavailable."),
                  );
                }}
              >
                {list
                  .filter((p) => !p.restricted)
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.reference} · {p.title}
                    </option>
                  ))}
              </select>
            </label>
          )}
          {role === "read_only_viewer" && (
            <div className="space-y-3">
              {list.map((p) => (
                <p key={p.id} className="rounded border p-4 text-sm">
                  {p.reference} · {labelForState(p.state)} · Private project details restricted
                </p>
              ))}
            </div>
          )}
          {project && (
            <>
              <div className="rounded bg-neutral-900 p-6 text-white sm:p-8">
                <p className="text-xs uppercase tracking-widest text-neutral-300">
                  {project.reference} · {labelForState(project.project_type)}
                </p>
                <h3 className="mt-3 break-words text-2xl font-semibold sm:text-3xl">
                  {project.title}
                </h3>
                <p className="mt-3 text-sm">
                  {project.city} · {labelForState(project.state)}
                </p>
                <p className="mt-5 text-sm text-neutral-300">
                  {project.milestones.filter((m) => m.state === "completed").length} of{" "}
                  {project.milestones.length} milestones recorded complete · Updated{" "}
                  {formatProjectDate(project.updated_at)}
                </p>
              </div>
              <nav aria-label="Project sections" className="flex flex-wrap gap-2">
                {sections.map((s) => (
                  <button
                    key={s}
                    className={`min-h-11 rounded px-4 py-3 text-sm ${section === s ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-800"}`}
                    aria-pressed={section === s}
                    onClick={() => setSection(s)}
                  >
                    {labelForState(s)}
                  </button>
                ))}
              </nav>
              {section === "overview" && (
                <div className="grid gap-6 md:grid-cols-2">
                  <section className="rounded border p-6">
                    <h3 className="text-lg font-semibold">Next step</h3>
                    <p className="mt-3">
                      {project.milestones.find(
                        (m) => !["completed", "not_applicable"].includes(m.state),
                      )?.label ?? "Your project team will confirm aftercare arrangements."}
                    </p>
                    <p className="mt-3 text-sm text-neutral-600">
                      Progress reflects staff records. Survey, utility approval and commissioning
                      are separate checks.
                    </p>
                    <h4 className="mt-6 font-semibold">Next confirmed appointment</h4>
                    <p className="mt-2 text-sm">
                      {formatProjectDate(
                        project.appointments
                          .filter(
                            (a) => a.status === "confirmed" && Date.parse(a.starts_at) > Date.now(),
                          )
                          .sort((a, b) => a.starts_at.localeCompare(b.starts_at))[0]?.starts_at ??
                          null,
                      )}
                    </p>
                  </section>
                  <section className="rounded border p-6">
                    <h3 className="text-lg font-semibold">Project updates</h3>
                    <p className="mt-2 text-sm text-neutral-600">
                      Updates appear here. Email, SMS and WhatsApp delivery are not enabled.
                    </p>
                    <ul className="mt-4 space-y-4">
                      {project.activities
                        .filter((a) => !("customer_visible" in a) || a.customer_visible)
                        .slice(0, 10)
                        .map((a) => (
                          <li key={a.id} className="border-t pt-3">
                            <p className="whitespace-pre-wrap break-words text-sm">{a.summary}</p>
                            <p className="mt-1 text-xs text-neutral-600">
                              {formatProjectDate(a.created_at)}
                            </p>
                          </li>
                        ))}
                    </ul>
                    {!project.activities.length && (
                      <p className="mt-4 text-sm">No published updates yet.</p>
                    )}
                  </section>
                </div>
              )}
              {section === "journey" && (
                <ol aria-label="Installation milestones" className="grid gap-4 md:grid-cols-2">
                  {project.milestones.map((m, index) => (
                    <li key={m.key} className="rounded border border-neutral-200 p-5">
                      <p className="text-xs text-neutral-600">
                        {String(index + 1).padStart(2, "0")} · {labelForState(m.state)}
                      </p>
                      <h3 className="mt-2 text-lg font-semibold">{m.label}</h3>
                      <p className="mt-3 whitespace-pre-wrap break-words text-sm">
                        {m.summary || "Awaiting a staff update."}
                      </p>
                      {m.completed_at && (
                        <p className="mt-3 text-xs text-neutral-600">
                          Recorded complete {formatProjectDate(m.completed_at)}
                        </p>
                      )}
                    </li>
                  ))}
                </ol>
              )}
              {section === "appointments" && (
                <div className="grid gap-6 lg:grid-cols-2">
                  <section>
                    <h3 className="text-lg font-semibold">Appointments</h3>
                    <p className="mt-2 text-sm text-neutral-600">
                      All times in Asia/Kolkata. Requested, proposed and rescheduled appointments
                      await confirmation.
                    </p>
                    <ul className="mt-4 space-y-4">
                      {project.appointments.map((a) => (
                        <li key={a.id} className="rounded border p-5">
                          <h4 className="font-semibold">
                            {labelForState(a.kind)} · {labelForState(a.status)}
                          </h4>
                          <p className="mt-2 text-sm">
                            {formatProjectDate(a.starts_at)} to {formatProjectDate(a.ends_at)}
                          </p>
                          <p className="mt-2 whitespace-pre-wrap break-words text-sm">
                            {a.instructions}
                          </p>
                          {editing && (
                            <button
                              className={buttonClass + " mt-3"}
                              onClick={() => setAppointmentId(a.id)}
                            >
                              Manage appointment
                            </button>
                          )}
                        </li>
                      ))}
                    </ul>
                    {!project.appointments.length && (
                      <p className="mt-4 text-sm">No appointments recorded.</p>
                    )}
                  </section>
                  <ProjectForm
                    key={appointmentId + project.version}
                    title={editing ? "Schedule or update appointment" : "Request an appointment"}
                    busy={busy}
                    submit={editing ? "Record appointment" : "Send request"}
                    onSubmit={(d, id) =>
                      mutate(
                        "appointment",
                        {
                          ...(appointmentId ? { id: appointmentId } : {}),
                          kind: val(d, "kind"),
                          status: editing ? val(d, "status") : "requested",
                          startsAt: parseIstDateTime(val(d, "startsAt")),
                          endsAt: parseIstDateTime(val(d, "endsAt")),
                          instructions: val(d, "instructions"),
                        },
                        id,
                      )
                    }
                  >
                    {editing && (
                      <>
                        <ProjectField label="Record" name="record" value={appointmentId || "new"}>
                          <option value="new">New appointment</option>
                          {appointment && (
                            <option value={appointment.id}>Selected existing appointment</option>
                          )}
                        </ProjectField>
                        {appointmentId && (
                          <button
                            type="button"
                            className={buttonClass}
                            onClick={() => setAppointmentId("")}
                          >
                            Start new appointment
                          </button>
                        )}
                      </>
                    )}
                    <ProjectField label="Appointment type" name="kind" value={appointment?.kind}>
                      {options(["survey", "installation", "service"])}
                    </ProjectField>
                    {editing && (
                      <ProjectField
                        label="Appointment status"
                        name="status"
                        value={appointment?.status ?? "proposed"}
                      >
                        {options(APPOINTMENT_STATES)}
                      </ProjectField>
                    )}
                    <ProjectField
                      label="Start (IST)"
                      name="startsAt"
                      type="datetime-local"
                      value={appointment ? istInput(appointment.starts_at) : undefined}
                    />
                    <ProjectField
                      label="End (IST)"
                      name="endsAt"
                      type="datetime-local"
                      value={appointment ? istInput(appointment.ends_at) : undefined}
                    />
                    <ProjectField
                      label="Instructions or requested next action"
                      name="instructions"
                      type="textarea"
                      value={appointment?.instructions}
                    />
                  </ProjectForm>
                </div>
              )}
              {section === "documents" && (
                <div className="grid gap-6 lg:grid-cols-2">
                  <section>
                    <h3 className="text-lg font-semibold">Project documents</h3>
                    <p className="mt-2 text-sm text-neutral-600">
                      Private reviewed scans. A scan is not independent proof of a signature,
                      certification or regulatory approval.
                    </p>
                    <ul className="mt-4 space-y-4">
                      {project.documents.map((d) => (
                        <li key={d.id} className="rounded border p-5">
                          <h4 className="break-words font-semibold">{d.title}</h4>
                          <p className="mt-2 text-sm">
                            {labelForState(d.kind)} · Revision {d.revision} ·{" "}
                            {labelForState(d.status)}
                          </p>
                          <button
                            className={buttonClass + " mt-3"}
                            disabled={busy || d.status === "superseded"}
                            onClick={() =>
                              void run(
                                () => downloadProjectDocument(d.id, audience),
                                "Authorized document download prepared.",
                              ).catch(() => {})
                            }
                          >
                            Download scan
                          </button>
                        </li>
                      ))}
                    </ul>
                    {!project.documents.length && (
                      <p className="mt-4 text-sm">No customer-authorized documents available.</p>
                    )}
                  </section>
                  {editing && (
                    <div className="space-y-6">
                      <ProjectForm
                        title="Upload private scan"
                        busy={busy}
                        submit="Upload for review"
                        onSubmit={(d, id) =>
                          run(() => {
                            d.set("projectId", selected);
                            d.set("expectedVersion", String(project.version));
                            d.set("requestId", id);
                            return uploadProjectDocument(d);
                          }, "Uploaded privately. Review is required before customer access.")
                        }
                      >
                        <p className="text-sm text-neutral-600">
                          JPEG or PNG, up to 3 MiB. Scans are normalized and metadata removed. PDF,
                          HTML and Office files are not supported. No malware-scanning service is
                          claimed.
                        </p>
                        <label className="grid gap-2 text-sm font-medium">
                          Scan file
                          <input
                            className={inputClass}
                            type="file"
                            accept="image/jpeg,image/png"
                            name="file"
                            required
                          />
                        </label>
                        <ProjectField label="Document title" name="title" maxLength={120} />
                        <ProjectField label="Document category" name="kind">
                          {options(DOCUMENT_KINDS)}
                        </ProjectField>
                        <ProjectField label="Visibility after review" name="visibility">
                          {options(["internal", "customer"])}
                        </ProjectField>
                        <ProjectField label="Replace a document" name="replacesId" required={false}>
                          <option value="">New document</option>
                          {project.documents
                            .filter((d) => d.status !== "superseded")
                            .map((d) => (
                              <option key={d.id} value={d.id}>
                                {d.title} · v{d.revision}
                              </option>
                            ))}
                        </ProjectField>
                      </ProjectForm>
                      <ProjectForm
                        title="Review document"
                        busy={busy}
                        onSubmit={(d, id) =>
                          mutate(
                            "document_review",
                            {
                              id: val(d, "id"),
                              verified: val(d, "verified") === "true",
                              reason: val(d, "reason"),
                            },
                            id,
                          )
                        }
                      >
                        <ProjectField label="Document to review" name="id">
                          {project.documents
                            .filter((d) => d.status !== "superseded")
                            .map((d) => (
                              <option key={d.id} value={d.id}>
                                {d.title}
                              </option>
                            ))}
                        </ProjectField>
                        <ProjectField label="Review decision" name="verified">
                          <option value="true">
                            Reviewed and approved for its declared purpose
                          </option>
                          <option value="false">Return to pending review</option>
                        </ProjectField>
                        <ProjectField
                          label="Review evidence / reason"
                          name="reason"
                          type="textarea"
                        />
                      </ProjectForm>
                    </div>
                  )}
                </div>
              )}
              {section === "support" && (
                <div className="grid gap-6 lg:grid-cols-2">
                  <section>
                    <h3 className="text-lg font-semibold">Support requests</h3>
                    <ul className="mt-4 space-y-4">
                      {project.support.map((s) => (
                        <li key={s.id} className="rounded border p-5">
                          <p className="text-xs">
                            {labelForState(s.category)} · {labelForState(s.status)}
                          </p>
                          <p className="mt-3 whitespace-pre-wrap break-words text-sm">
                            {s.description}
                          </p>
                          <p className="mt-3 whitespace-pre-wrap break-words text-sm">
                            {s.public_response || "Awaiting a project team response."}
                          </p>
                          {s.resolved_at && (
                            <p className="mt-2 text-xs">
                              Resolved {formatProjectDate(s.resolved_at)}
                            </p>
                          )}
                          {editing && "internal_note" in s && s.internal_note && (
                            <p className="mt-3 whitespace-pre-wrap break-words border-t pt-3 text-sm">
                              Internal: {s.internal_note}
                            </p>
                          )}
                        </li>
                      ))}
                    </ul>
                    {!project.support.length && (
                      <p className="mt-4 text-sm">No support requests yet.</p>
                    )}
                  </section>
                  <div className="space-y-6">
                    <ProjectForm
                      title="New support request"
                      busy={busy}
                      submit="Submit support request"
                      onSubmit={(d, id) =>
                        mutate(
                          "support",
                          { category: val(d, "category"), description: val(d, "description") },
                          id,
                        )
                      }
                    >
                      <ProjectField label="Support category" name="category">
                        {options(SUPPORT_CATEGORIES)}
                      </ProjectField>
                      <ProjectField
                        label="How can the project team help?"
                        name="description"
                        type="textarea"
                        maxLength={2000}
                      />
                      <p className="text-sm text-neutral-600">
                        Do not include passwords, financial account numbers or unrelated personal
                        information.
                      </p>
                    </ProjectForm>
                    {editing && (
                      <ProjectForm
                        title="Respond to support request"
                        busy={busy}
                        onSubmit={(d, id) =>
                          mutate(
                            "support_response",
                            {
                              id: val(d, "id"),
                              status: val(d, "status"),
                              publicResponse: val(d, "publicResponse"),
                              internalNote: val(d, "internalNote"),
                            },
                            id,
                          )
                        }
                      >
                        <ProjectField label="Support request" name="id">
                          {project.support.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.description.slice(0, 70)}
                            </option>
                          ))}
                        </ProjectField>
                        <ProjectField label="Support status" name="status">
                          {options(["open", "in_progress", "resolved"])}
                        </ProjectField>
                        <ProjectField
                          label="Customer-visible response"
                          name="publicResponse"
                          type="textarea"
                          maxLength={2000}
                        />
                        <ProjectField
                          label="Internal staff note"
                          name="internalNote"
                          type="textarea"
                          required={false}
                          maxLength={2000}
                        />
                      </ProjectForm>
                    )}
                  </div>
                </div>
              )}
              {section === "operations" && editing && staffProject && (
                <div className="grid gap-6 lg:grid-cols-2">
                  <ProjectForm
                    title="Update milestone"
                    busy={busy}
                    onSubmit={(d, id) =>
                      mutate(
                        "milestone",
                        {
                          key: val(d, "key"),
                          state: val(d, "state"),
                          summary: val(d, "summary"),
                          evidenceDocumentId: val(d, "evidenceDocumentId") || null,
                        },
                        id,
                      )
                    }
                  >
                    <ProjectField label="Milestone" name="key">
                      {MILESTONES.map(([k, l]) => (
                        <option key={k} value={k}>
                          {l}
                        </option>
                      ))}
                    </ProjectField>
                    <ProjectField label="New milestone state" name="state">
                      {options(MILESTONE_STATES)}
                    </ProjectField>
                    <ProjectField
                      label="Customer-visible reason / next action"
                      name="summary"
                      type="textarea"
                    />
                    <ProjectField
                      label="Verified evidence document"
                      name="evidenceDocumentId"
                      required={false}
                    >
                      <option value="">No document selected</option>
                      {project.documents
                        .filter((d) => d.status === "verified")
                        .map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.title}
                          </option>
                        ))}
                    </ProjectField>
                    <p className="text-sm text-neutral-600">
                      Commissioning and handover require matching reviewed evidence and the
                      preceding completed milestone. Corrections are audited.
                    </p>
                  </ProjectForm>
                  <ProjectForm
                    title="Record project note"
                    busy={busy}
                    onSubmit={(d, id) =>
                      mutate(
                        "note",
                        {
                          summary: val(d, "summary"),
                          customerVisible: val(d, "visibility") === "customer",
                        },
                        id,
                      )
                    }
                  >
                    <ProjectField label="Note visibility" name="visibility">
                      {options(["internal", "customer"])}
                    </ProjectField>
                    <ProjectField label="Note text" name="summary" type="textarea" />
                  </ProjectForm>
                  {owner && (
                    <>
                      <ProjectForm
                        title="Approve customer invitation"
                        busy={busy}
                        submit="Approve invitation"
                        onSubmit={(d, id) =>
                          mutate("invite", { email: val(d, "email"), reason: val(d, "reason") }, id)
                        }
                      >
                        <p className="text-sm text-neutral-600">
                          Approve only an independently verified customer email. Approval lasts 24
                          hours; the customer must request and verify a sign-in code. This action
                          does not send a notification.
                        </p>
                        <ProjectField label="Verified customer email" name="email" type="email" />
                        <ProjectField
                          label="Identity verification reference"
                          name="reason"
                          type="textarea"
                        />
                      </ProjectForm>
                      <ProjectForm
                        title="Revoke customer access"
                        busy={busy}
                        onSubmit={(d, id) => {
                          const [kind, idValue] = val(d, "target").split(":");
                          return mutate(
                            "revoke",
                            {
                              [kind === "member" ? "userId" : "invitationId"]: idValue,
                              reason: val(d, "reason"),
                            },
                            id,
                          );
                        }}
                      >
                        <ProjectField label="Approved access" name="target">
                          {staffProject.memberships
                            .filter((m) => m.active)
                            .map((m, i) => (
                              <option key={m.user_id} value={"member:" + m.user_id}>
                                Membership {i + 1} · {m.user_id}
                              </option>
                            ))}
                          {staffProject.invitations
                            .filter((i) => i.status === "pending")
                            .map((i) => (
                              <option key={i.id} value={"invite:" + i.id}>
                                {i.email} · pending
                              </option>
                            ))}
                        </ProjectField>
                        <ProjectField label="Revocation reason" name="reason" type="textarea" />
                      </ProjectForm>
                      <ProjectForm
                        title="Assign coordinator"
                        busy={busy}
                        onSubmit={(d, id) =>
                          mutate(
                            "coordinator",
                            { coordinatorId: val(d, "coordinatorId"), reason: val(d, "reason") },
                            id,
                          )
                        }
                      >
                        <ProjectField
                          label="Project coordinator"
                          name="coordinatorId"
                          value={staffProject.coordinator_id}
                        >
                          {directory.staff.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.full_name}
                            </option>
                          ))}
                        </ProjectField>
                        <ProjectField label="Assignment reason" name="reason" type="textarea" />
                      </ProjectForm>
                      <ProjectForm
                        title="Change project state"
                        busy={busy}
                        onSubmit={(d, id) =>
                          mutate("status", { state: val(d, "state"), reason: val(d, "reason") }, id)
                        }
                      >
                        <ProjectField label="Project state" name="state" value={project.state}>
                          {options(PROJECT_STATES)}
                        </ProjectField>
                        <ProjectField
                          label="Customer-visible state-change reason"
                          name="reason"
                          type="textarea"
                        />
                      </ProjectForm>
                    </>
                  )}
                  <section className="min-w-0 rounded border p-5 lg:col-span-2">
                    <h3 className="text-lg font-semibold">Activity history</h3>
                    <ul className="mt-4 max-h-96 space-y-4 overflow-y-auto">
                      {staffProject.activities.map((a) => (
                        <li key={a.id} className="border-t pt-3 text-sm">
                          <p className="break-words">
                            {labelForState(a.action)} · {a.actor_label} ·{" "}
                            {formatProjectDate(a.created_at)}
                          </p>
                          <p className="mt-2 whitespace-pre-wrap break-words">{a.summary}</p>
                          <p className="mt-1 text-xs">
                            {a.customer_visible ? "Customer-visible update" : "Internal record"}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </section>
                </div>
              )}
            </>
          )}
          {owner && (
            <details className="rounded border bg-neutral-50 p-4">
              <summary className="min-h-11 cursor-pointer py-3 text-lg font-semibold">
                Activate a verified consultation
              </summary>
              <ProjectForm
                title="Create installation project"
                busy={busy}
                submit="Create verified project"
                onSubmit={(d, id) =>
                  run(() => {
                    const lead = directory.leads.find((l) => l.id === val(d, "consultationId"));
                    if (!lead) throw new Error("Choose an eligible consultation.");
                    return projectRequest("", {
                      action: "create",
                      input: {
                        consultationId: lead.id,
                        expectedLeadVersion: lead.crm_version,
                        requestId: id,
                        title: val(d, "title"),
                        projectType: val(d, "projectType"),
                        city: val(d, "city"),
                        coordinatorId: val(d, "coordinatorId"),
                        contactReference: val(d, "contactReference"),
                        authorizationEvidence: val(d, "authorizationEvidence"),
                        prerequisitesConfirmed: d.get("confirmed") === "on",
                      },
                    });
                  }, "Project created with an audit record. Select it to manage customer access.")
                }
              >
                <p className="text-sm text-neutral-600">
                  Contract-signed CRM status is a qualification signal. Independently verify
                  commercial authorization and customer contact before creating a project.
                </p>
                <ProjectField label="Eligible consultation" name="consultationId">
                  {directory.leads.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.reference_code} · {l.client_name}
                    </option>
                  ))}
                </ProjectField>
                <ProjectField label="Project title" name="title" maxLength={120} />
                <ProjectField label="Project type" name="projectType">
                  {options(["residential", "commercial", "hybrid"])}
                </ProjectField>
                <ProjectField label="City / jurisdiction" name="city" maxLength={100} />
                <ProjectField label="Assigned coordinator" name="coordinatorId">
                  {directory.staff.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.full_name}
                    </option>
                  ))}
                </ProjectField>
                <ProjectField
                  label="Customer contact verification reference"
                  name="contactReference"
                  type="textarea"
                  maxLength={300}
                />
                <ProjectField
                  label="Commercial / operational authorization evidence"
                  name="authorizationEvidence"
                  type="textarea"
                />
                <label className="flex min-h-11 items-start gap-3 text-sm">
                  <input className="mt-1 size-5" name="confirmed" type="checkbox" required />I
                  reviewed the customer identity and applicable commercial and operational
                  prerequisites.
                </label>
              </ProjectForm>
            </details>
          )}
        </>
      )}
    </div>
  );
}
