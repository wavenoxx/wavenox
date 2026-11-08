import type { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  createProjectSchema,
  type ProjectActor,
  type ProjectCommand,
  type ProjectDocument,
  type ProjectRecord,
  type ProjectSummary,
} from "@/lib/projects";
export class ProjectError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}
export type ProjectCreateInput = z.infer<typeof createProjectSchema>;
export interface ProjectMutationResult {
  projectId: string;
  version: number;
  resourceId?: string | null;
  replayed?: boolean;
}
export interface EligibleProjectLead {
  id: string;
  reference_code: string;
  client_name: string;
  city: string;
  crm_version: number;
}
export interface ProjectStaffOption {
  id: string;
  full_name: string;
}
export interface ProjectStore {
  list(actor: ProjectActor): Promise<ProjectSummary[]>;
  read(actor: ProjectActor, id: string): Promise<ProjectRecord>;
  create(actor: ProjectActor, input: ProjectCreateInput): Promise<ProjectMutationResult>;
  mutate(actor: ProjectActor, input: ProjectCommand): Promise<ProjectMutationResult>;
  eligibleLeads(): Promise<EligibleProjectLead[]>;
  staffDirectory(): Promise<ProjectStaffOption[]>;
  emailAllowed(email: string): Promise<boolean>;
  openSession(userId: string, email: string, hash: string): Promise<void>;
  sessionUser(hash: string): Promise<string>;
  endSession(hash: string): Promise<void>;
  consumeLimit(key: string, limit: number, seconds: number): Promise<boolean>;
  document(id: string): Promise<ProjectDocument & { project_id: string }>;
  auditDownload(actor: ProjectActor, id: string): Promise<string>;
  upload(path: string, bytes: Buffer): Promise<void>;
  download(path: string): Promise<Buffer>;
  remove(path: string): Promise<void>;
}
function fail(error: { code?: string } | null): void {
  if (!error) return;
  const code = error.code;
  if (code === "42501") throw new ProjectError(403, "Project access is unavailable.");
  if (code === "PT409" || code === "23505")
    throw new ProjectError(
      409,
      "This record changed or the request was already processed. Refresh before trying again.",
    );
  if (code === "PT429") throw new ProjectError(429, "Too many requests. Please try later.");
  if (
    code === "PT400" ||
    code === "23514" ||
    code === "23502" ||
    code === "22P02" ||
    code === "22007" ||
    code === "23503"
  )
    throw new ProjectError(
      400,
      "Check the fields, prerequisites, evidence and permitted transition.",
    );
  throw new ProjectError(503, "Project service is unavailable. No success is confirmed.");
}
export function createLiveProjectStore(db: SupabaseClient): ProjectStore {
  async function rpc<T>(name: string, args: Record<string, unknown>): Promise<T> {
    const { data, error } = await db.rpc(name, args);
    fail(error);
    return data as T;
  }
  async function privateBucket() {
    const { data, error } = await db.storage.getBucket("project-documents");
    if (error || !data || data.public)
      throw new ProjectError(503, "Private document storage is unavailable.");
  }
  return {
    list: (a) => rpc("project_list", { p_actor_kind: a.kind, p_actor_id: a.id }),
    read: (a, id) =>
      rpc("project_read", { p_actor_kind: a.kind, p_actor_id: a.id, p_project_id: id }),
    create: (a, input) => rpc("project_create", { p_actor_id: a.id, p_input: input }),
    mutate: (a, c) =>
      rpc("project_mutate", {
        p_actor_kind: a.kind,
        p_actor_id: a.id,
        p_project_id: c.projectId,
        p_expected_version: c.expectedVersion,
        p_request_id: c.requestId,
        p_action: c.action,
        p_payload: c.payload,
      }),
    async eligibleLeads() {
      const { data, error } = await db
        .from("consultations")
        .select("id,reference_code,client_name,city,crm_version")
        .eq("status", "contract_signed")
        .order("created_at", { ascending: false })
        .limit(50);
      fail(error);
      return data ?? [];
    },
    async staffDirectory() {
      const { data, error } = await db
        .from("crm_staff_members")
        .select("id,full_name")
        .eq("is_active", true)
        .in("role", ["owner_admin", "sales_coordinator"])
        .limit(100);
      fail(error);
      return data ?? [];
    },
    emailAllowed: (email) => rpc("project_email_allowed", { p_email: email }),
    async openSession(userId, email, hash) {
      await rpc("project_open_customer_session", {
        p_user_id: userId,
        p_email: email,
        p_token_hash: hash,
      });
    },
    sessionUser: (hash) => rpc("project_customer_session", { p_token_hash: hash }),
    async endSession(hash) {
      const { error } = await db
        .from("project_sessions")
        .update({ revoked_at: new Date().toISOString() })
        .eq("token_hash", hash);
      fail(error);
    },
    consumeLimit: (key, limit, seconds) =>
      rpc("project_consume_limit", { p_key: key, p_limit: limit, p_seconds: seconds }),
    async document(id) {
      const { data, error } = await db
        .from("project_documents")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      fail(error);
      if (!data) throw new ProjectError(403, "Document access is unavailable.");
      return data as ProjectDocument & { project_id: string };
    },
    auditDownload: (a, id) =>
      rpc("project_document_access", { p_actor_kind: a.kind, p_actor_id: a.id, p_document_id: id }),
    async upload(path, bytes) {
      await privateBucket();
      const { error } = await db.storage
        .from("project-documents")
        .upload(path, bytes, { contentType: "image/jpeg", upsert: false, cacheControl: "0" });
      if (error) throw new ProjectError(503, "Document upload failed. Nothing was published.");
    },
    async download(path) {
      await privateBucket();
      const { data, error } = await db.storage.from("project-documents").download(path);
      if (error || !data || data.size > 3 * 1024 * 1024)
        throw new ProjectError(503, "Document download is unavailable.");
      return Buffer.from(await data.arrayBuffer());
    },
    async remove(path) {
      const { error } = await db.storage.from("project-documents").remove([path]);
      if (error) throw new ProjectError(503, "Private upload cleanup requires review.");
    },
  };
}
