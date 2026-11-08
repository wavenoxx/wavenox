import { createHash, createHmac, randomBytes, randomUUID } from "node:crypto";
import { z } from "zod";
import {
  createProjectSchema,
  projectCommandSchema,
  projectPayloadSchemas,
  toCustomerProject,
  type ProjectActor,
} from "@/lib/projects";
import { ProjectError, type ProjectStore } from "./project-store";
import { sanitizeProjectDocument } from "./project-files";
import { DEMO_CUSTOMERS } from "./project-demo";

export const PORTAL_COOKIE = "wavenox_portal_session";
export const hashPortalToken = (token: string) => createHash("sha256").update(token).digest("hex");
export function readProjectCookie(request: Request, name: string): string {
  const value =
    (request.headers.get("cookie") ?? "")
      .split(";")
      .map((s) => s.trim())
      .find((s) => s.startsWith(name + "="))
      ?.slice(name.length + 1) ?? "";
  try {
    return value.length < 8192 ? decodeURIComponent(value) : "";
  } catch {
    return "";
  }
}
export const PRIVATE_HEADERS = {
  "cache-control": "private, no-store, max-age=0",
  pragma: "no-cache",
  "x-content-type-options": "nosniff",
  "x-robots-tag": "noindex, nofollow",
  "cross-origin-resource-policy": "same-origin",
};
interface EmailAuth {
  requestCode(email: string): Promise<void>;
  verifyCode(
    email: string,
    token: string,
  ): Promise<{ id: string; email: string; emailConfirmed: boolean }>;
}
interface Options {
  mode: "demo" | "live";
  store: ProjectStore | null;
  staff: (r: Request) => Promise<ProjectActor>;
  emailEnabled: boolean;
  auth: EmailAuth | null;
  rateSecret?: string;
  secureCookie?: boolean;
}
const email = z.string().trim().toLowerCase().email().max(254);
const envelope = z.discriminatedUnion("action", [
  z.object({ action: z.literal("demo_login"), personaId: z.string().uuid() }).strict(),
  z.object({ action: z.literal("request_code"), email }).strict(),
  z
    .object({ action: z.literal("verify_code"), email, token: z.string().regex(/^\d{6,10}$/) })
    .strict(),
  z.object({ action: z.literal("logout") }).strict(),
  z.object({ action: z.literal("create"), input: createProjectSchema }).strict(),
  z
    .object({
      action: z.literal("mutate"),
      audience: z.enum(["staff", "customer"]),
      command: projectCommandSchema,
    })
    .strict(),
]);
async function limitedBody(request: Request, limit: number): Promise<Uint8Array> {
  if (Number(request.headers.get("content-length")) > limit)
    throw new ProjectError(413, "Request is too large.");
  const reader = request.body?.getReader();
  if (!reader) throw new ProjectError(400, "Request body required.");
  const chunks: Uint8Array[] = [];
  let count = 0;
  const timer = setTimeout(() => {
    void reader.cancel();
  }, 15000);
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      count += value.length;
      if (count > limit) {
        await reader.cancel();
        throw new ProjectError(413, "Request is too large.");
      }
      chunks.push(value);
    }
    return Buffer.concat(chunks);
  } finally {
    clearTimeout(timer);
    reader.releaseLock();
  }
}
export function createProjectsHandler(options: Options) {
  const json = (data: unknown, status = 200, extra: Record<string, string> = {}) =>
    new Response(JSON.stringify(data), {
      status,
      headers: { ...PRIVATE_HEADERS, "content-type": "application/json", ...extra },
    });
  const cookie = (token: string, clear = false) =>
    `${PORTAL_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${clear ? 0 : 3600}${options.secureCookie ? "; Secure" : ""}`;
  return async function handle(request: Request): Promise<Response> {
    try {
      const store = options.store;
      if (!store) throw new ProjectError(503, "Project service is not configured.");
      const url = new URL(request.url);
      if (!["GET", "POST"].includes(request.method))
        throw new ProjectError(405, "Method not allowed.");
      if (
        request.method === "POST" &&
        (request.headers.get("origin") !== url.origin ||
          request.headers.get("sec-fetch-site") === "cross-site")
      )
        throw new ProjectError(403, "Same-origin request required.");
      const customer = async (): Promise<ProjectActor> => {
        const token = readProjectCookie(request, PORTAL_COOKIE);
        if (!/^[a-f0-9]{64}$/.test(token))
          throw new ProjectError(401, "Sign in to your customer account.");
        try {
          return { kind: "customer", id: await store.sessionUser(hashPortalToken(token)) };
        } catch (e) {
          if (e instanceof ProjectError && e.status === 503) throw e;
          throw new ProjectError(401, "Your customer session has ended. Sign in again.");
        }
      };
      const staff = async () => {
        const a = await options.staff(request);
        if (a.kind !== "staff") throw new ProjectError(403, "Staff authorization required.");
        return a;
      };
      const actor = async (audience: string | null) =>
        audience === "staff" ? staff() : customer();
      const startSession = async (id: string, e: string) => {
        const token = randomBytes(32).toString("hex");
        await store.openSession(id, e, hashPortalToken(token));
        return json({ ok: true }, 200, { "set-cookie": cookie(token) });
      };
      if (url.pathname.startsWith("/api/project-documents/")) {
        if (request.method !== "GET") throw new ProjectError(405, "Method not allowed.");
        const id = z.string().uuid().parse(url.pathname.slice("/api/project-documents/".length));
        const a = await actor(url.searchParams.get("audience"));
        const doc = await store.document(id);
        await store.read(a, doc.project_id);
        if (
          doc.status === "superseded" ||
          (a.kind === "customer" && (doc.visibility !== "customer" || doc.status !== "verified"))
        )
          throw new ProjectError(403, "Document access unavailable.");
        const bytes = await store.download(doc.storage_path!);
        // Recheck membership, staff scope and review status after storage I/O, before delivery.
        if ((await store.auditDownload(a, id)) !== doc.storage_path)
          throw new ProjectError(409, "Document changed. Try again.");
        return new Response(new Uint8Array(bytes), {
          headers: {
            ...PRIVATE_HEADERS,
            "content-type": "image/jpeg",
            "content-disposition": `attachment; filename="project-document-${id}.jpg"`,
          },
        });
      }
      if (url.pathname === "/api/project-documents") {
        if (request.method !== "POST") throw new ProjectError(405, "Method not allowed.");
        const a = await staff();
        if (a.role === "read_only_viewer")
          throw new ProjectError(403, "Document editing is not permitted.");
        const raw = await limitedBody(request, 4 * 1024 * 1024);
        let form: FormData;
        try {
          form = await new Response(new Uint8Array(raw), {
            headers: { "content-type": request.headers.get("content-type") ?? "" },
          }).formData();
        } catch {
          throw new ProjectError(400, "Choose a valid document upload.");
        }
        const file = form.get("file");
        if (!(file instanceof File)) throw new ProjectError(400, "Choose a document.");
        const projectId = z.string().uuid().parse(form.get("projectId"));
        await store.read(a, projectId);
        const id = randomUUID(),
          path = `${projectId}/${id}.jpg`;
        const payload = projectPayloadSchemas.document.parse({
          id,
          title: form.get("title"),
          kind: form.get("kind"),
          visibility: form.get("visibility"),
          storagePath: path,
          mime: "image/jpeg",
          replacesId: form.get("replacesId") || null,
        });
        const command = projectCommandSchema.parse({
          action: "document",
          projectId,
          expectedVersion: Number(form.get("expectedVersion")),
          requestId: form.get("requestId"),
          payload,
        });
        const bytes = await sanitizeProjectDocument(
          file.type,
          Buffer.from(await file.arrayBuffer()),
        );
        await store.upload(path, bytes);
        try {
          return json(await store.mutate(a, command));
        } catch (error) {
          try {
            await store.remove(path);
          } catch {
            /* Private orphan only; never publish an unaudited upload. */
          }
          throw error;
        }
      }
      if (url.pathname !== "/api/projects") throw new ProjectError(404, "Not found.");
      if (request.method === "GET") {
        const action = url.searchParams.get("action");
        if (action === "session") {
          let authenticated = false;
          try {
            await customer();
            authenticated = true;
          } catch (e) {
            if (e instanceof ProjectError && e.status === 503) throw e;
          }
          return json({
            mode: options.mode,
            authenticated,
            emailEnabled: options.emailEnabled,
            personas: options.mode === "demo" ? DEMO_CUSTOMERS : [],
          });
        }
        const a = await actor(url.searchParams.get("audience"));
        if (action === "options") {
          if (a.kind !== "staff" || a.role !== "owner_admin")
            throw new ProjectError(403, "Owner authorization required.");
          return json({ leads: await store.eligibleLeads(), staff: await store.staffDirectory() });
        }
        const id = url.searchParams.get("projectId");
        if (id) {
          const p = await store.read(a, z.string().uuid().parse(id));
          return json(
            a.kind === "customer"
              ? toCustomerProject(p)
              : { ...p, documents: p.documents.map(({ storage_path: _path, ...d }) => d) },
          );
        }
        return json(await store.list(a));
      }
      if (!request.headers.get("content-type")?.startsWith("application/json"))
        throw new ProjectError(415, "JSON required.");
      let input: unknown;
      try {
        input = JSON.parse(Buffer.from(await limitedBody(request, 24 * 1024)).toString());
      } catch (e) {
        if (e instanceof ProjectError) throw e;
        throw new ProjectError(400, "Invalid request.");
      }
      const body = envelope.parse(input);
      if (body.action === "demo_login") {
        if (options.mode !== "demo") throw new ProjectError(403, "Demo sign-in is unavailable.");
        const persona = DEMO_CUSTOMERS.find((c) => c.id === body.personaId);
        if (!persona) throw new ProjectError(401, "Choose a synthetic identity.");
        return await startSession(persona.id, persona.email);
      }
      if (body.action === "request_code" || body.action === "verify_code") {
        if (
          options.mode !== "live" ||
          !options.emailEnabled ||
          !options.auth ||
          !options.rateSecret
        )
          throw new ProjectError(
            503,
            "Customer email sign-in is not activated. Contact your coordinator.",
          );
        const key = createHmac("sha256", options.rateSecret).update(body.email).digest("hex");
        if (
          !(await store.consumeLimit(`auth:global:${body.action}`, 100, 3600)) ||
          !(await store.consumeLimit(
            `auth:${body.action}:${key}`,
            body.action === "verify_code" ? 10 : 3,
            3600,
          ))
        )
          throw new ProjectError(429, "Too many attempts. Try later.");
        if (body.action === "request_code") {
          const started = Date.now();
          const allowed = await store.emailAllowed(body.email);
          if (allowed) {
            try {
              await options.auth.requestCode(body.email);
            } catch {
              /* Generic response prevents account enumeration; no delivery claim. */
            }
          }
          await new Promise((r) => setTimeout(r, Math.max(0, 400 - Date.now())));
          return json({
            ok: true,
            message:
              "If this email has approved access, a sign-in code may arrive. Delivery is not confirmed here.",
          });
        }
        let identity;
        try {
          identity = await options.auth.verifyCode(body.email, body.token);
        } catch {
          throw new ProjectError(401, "Code invalid, expired or already used.");
        }
        if (!identity.emailConfirmed || identity.email.toLowerCase() !== body.email)
          throw new ProjectError(401, "Verified invited identity required.");
        return await startSession(identity.id, body.email);
      }
      if (body.action === "logout") {
        const token = readProjectCookie(request, PORTAL_COOKIE);
        if (token) await store.endSession(hashPortalToken(token));
        return json({ ok: true }, 200, { "set-cookie": cookie("", true) });
      }
      if (body.action === "create") {
        const a = await staff();
        if (a.role !== "owner_admin") throw new ProjectError(403, "Owner authorization required.");
        return json(await store.create(a, body.input));
      }
      const a = await actor(body.audience);
      if (
        (a.kind === "staff" && a.role === "read_only_viewer") ||
        (a.kind === "customer" && !["support", "appointment"].includes(body.command.action)) ||
        body.command.action === "document"
      )
        throw new ProjectError(403, "Operation not permitted.");
      return json(
        await store.mutate(a, {
          ...body.command,
          payload: projectPayloadSchemas[body.command.action].parse(body.command.payload),
        }),
      );
    } catch (e) {
      if (e instanceof z.ZodError)
        return json({ error: e.issues[0]?.message ?? "Check the supplied fields." }, 400);
      if (e instanceof ProjectError) return json({ error: e.message }, e.status);
      return json({ error: "Project service is unavailable. No success is confirmed." }, 503);
    }
  };
}
