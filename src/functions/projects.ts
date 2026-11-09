import type { ProjectAction, ProjectCommand } from "@/lib/projects";
export class ProjectRequestError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}
export async function projectRequest<T>(query = "", body?: unknown): Promise<T> {
  const response = await fetch("/api/projects" + query, {
    method: body ? "POST" : "GET",
    credentials: "same-origin",
    cache: "no-store",
    headers: body ? { "content-type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await response.json();
  if (!response.ok)
    throw new ProjectRequestError(
      response.status,
      typeof data.error === "string" ? data.error : "Project service unavailable.",
    );
  return data as T;
}
export async function projectMutation(
  audience: "staff" | "customer",
  projectId: string,
  expectedVersion: number,
  action: ProjectAction,
  payload: ProjectCommand["payload"],
  requestId: string,
) {
  return projectRequest("", {
    action: "mutate",
    audience,
    command: { projectId, expectedVersion, action, payload, requestId },
  });
}
export async function uploadProjectDocument(form: FormData) {
  const r = await fetch("/api/project-documents", {
    method: "POST",
    credentials: "same-origin",
    body: form,
  });
  const data = await r.json();
  if (!r.ok) throw new ProjectRequestError(r.status, data.error || "Document upload unavailable.");
  return data;
}
export async function downloadProjectDocument(id: string, audience: "staff" | "customer") {
  const r = await fetch(`/api/project-documents/${encodeURIComponent(id)}?audience=${audience}`, {
    credentials: "same-origin",
    cache: "no-store",
  });
  if (!r.ok) {
    const e = await r.json();
    throw new ProjectRequestError(r.status, e.error || "Document unavailable.");
  }
  const blob = await r.blob(),
    url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "project-document.jpg";
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
