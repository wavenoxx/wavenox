import crypto from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { hasValidSupabaseServerConfig, type SupabaseServerEnv } from "./supabase";

export interface LeadExecutionModeEnv {
  LEAD_MODE?: string;
  VITE_LEAD_MODE?: string;
}

function resolveCrmMode(env: LeadExecutionModeEnv = {}): "live" | "demo" {
  const rawMode = (env.LEAD_MODE || env.VITE_LEAD_MODE || "").trim().toLowerCase();
  return rawMode === "demo" ? "demo" : "live";
}

export const CRM_STAFF_ROLES = ["owner_admin", "sales_coordinator", "read_only_viewer"] as const;

export type CrmStaffRole = (typeof CRM_STAFF_ROLES)[number];

export const CRM_PERMISSIONS = [
  "leads:list",
  "leads:view_detail",
  "leads:view_unmasked_pii",
  "leads:update_stage",
  "leads:restore_archived",
  "leads:assign_self",
  "leads:assign_any",
  "leads:add_note",
  "leads:correct_data",
  "tasks:view",
  "tasks:create",
  "tasks:complete",
  "tasks:reassign_any",
  "metrics:view",
  "attribution:view",
  "privacy:view",
  "privacy:manage",
  "staff:view",
  "staff:manage",
] as const;

export type CrmPermission = (typeof CRM_PERMISSIONS)[number];

const ROLE_PERMISSIONS_MAP: Record<CrmStaffRole, ReadonlySet<CrmPermission>> = {
  owner_admin: new Set<CrmPermission>(CRM_PERMISSIONS),
  sales_coordinator: new Set<CrmPermission>([
    "leads:list",
    "leads:view_detail",
    "leads:view_unmasked_pii",
    "leads:update_stage",
    "leads:assign_self",
    "leads:add_note",
    "leads:correct_data",
    "tasks:view",
    "tasks:create",
    "tasks:complete",
    "metrics:view",
    "attribution:view",
    "privacy:view",
    "staff:view",
  ]),
  read_only_viewer: new Set<CrmPermission>([
    "leads:list",
    "leads:view_detail",
    "tasks:view",
    "metrics:view",
    "attribution:view",
    "staff:view",
  ]),
};

export function hasCrmPermission(role: CrmStaffRole, permission: CrmPermission): boolean {
  const allowed = ROLE_PERMISSIONS_MAP[role];
  return allowed ? allowed.has(permission) : false;
}

export function getPermissionsForRole(role: CrmStaffRole): CrmPermission[] {
  return Array.from(ROLE_PERMISSIONS_MAP[role] ?? []);
}

export interface CrmStaffMember {
  id: string;
  auth_user_id: string;
  email: string;
  full_name: string;
  role: CrmStaffRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Isolated Demo Staff Accounts — ONLY active when LEAD_MODE="demo" or VITE_LEAD_MODE="demo".
 * Never used or accepted in LIVE mode.
 */
export const DEMO_STAFF_DIRECTORY: readonly CrmStaffMember[] = [
  {
    id: "00000000-0000-4000-8000-000000000101",
    auth_user_id: "00000000-0000-4000-8000-000000000901",
    email: "Siddharth.Rao@demo.wavenox.internal",
    full_name: "Siddharth Rao (Principal Director)",
    role: "owner_admin",
    is_active: true,
    created_at: "2026-10-01T04:30:00.000Z",
    updated_at: "2026-10-01T04:30:00.000Z",
  },
  {
    id: "00000000-0000-4000-8000-000000000102",
    auth_user_id: "00000000-0000-4000-8000-000000000902",
    email: "Ananya.Reddy@demo.wavenox.internal",
    full_name: "Ananya Reddy (Senior Solar Coordinator)",
    role: "sales_coordinator",
    is_active: true,
    created_at: "2026-10-01T04:30:00.000Z",
    updated_at: "2026-10-01T04:30:00.000Z",
  },
  {
    id: "00000000-0000-4000-8000-000000000103",
    auth_user_id: "00000000-0000-4000-8000-000000000903",
    email: "Kiran.Varma@demo.wavenox.internal",
    full_name: "Kiran Varma (Engineering Coordinator)",
    role: "sales_coordinator",
    is_active: true,
    created_at: "2026-10-01T04:30:00.000Z",
    updated_at: "2026-10-01T04:30:00.000Z",
  },
  {
    id: "00000000-0000-4000-8000-000000000104",
    auth_user_id: "00000000-0000-4000-8000-000000000904",
    email: "Meera.Iyer@demo.wavenox.internal",
    full_name: "Meera Iyer (Finance & Audit Viewer)",
    role: "read_only_viewer",
    is_active: true,
    created_at: "2026-10-01T04:30:00.000Z",
    updated_at: "2026-10-01T04:30:00.000Z",
  },
  {
    id: "00000000-0000-4000-8000-000000000105",
    auth_user_id: "00000000-0000-4000-8000-000000000905",
    email: "Former.Staff@demo.wavenox.internal",
    full_name: "Rohan Kulkarni (Deactivated Account)",
    role: "sales_coordinator",
    is_active: false,
    created_at: "2026-09-01T04:30:00.000Z",
    updated_at: "2026-10-15T04:30:00.000Z",
  },
] as const;

export const CRM_SESSION_COOKIE_NAME = "wavenox_crm_session";
export const DEFAULT_SESSION_TTL_MS = 8 * 60 * 60 * 1000; // 8 hours

// Ephemeral per-process fallback secret for isolated demo sandbox HMAC signing
const EPHEMERAL_DEMO_HMAC_KEY = crypto.randomBytes(32).toString("hex");

// Revoked session token JTI / signature set for immediate server-side logout invalidation
const revokedSessionTokenHashes = new Set<string>();

function hashTokenForRevocation(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function revokeCrmSessionToken(token: string | null | undefined): void {
  if (!token || !token.trim()) return;
  if (revokedSessionTokenHashes.size > 5000) {
    revokedSessionTokenHashes.clear();
  }
  revokedSessionTokenHashes.add(hashTokenForRevocation(token.trim()));
}

export function isCrmSessionTokenRevoked(token: string | null | undefined): boolean {
  if (!token || !token.trim()) return false;
  return revokedSessionTokenHashes.has(hashTokenForRevocation(token.trim()));
}

export function clearRevokedCrmTokens(): void {
  revokedSessionTokenHashes.clear();
}

export interface CrmAuthEnv extends LeadExecutionModeEnv, SupabaseServerEnv {
  CRM_SESSION_SECRET?: string;
}

function getDemoSigningSecret(env?: CrmAuthEnv): string {
  const configured = env?.CRM_SESSION_SECRET?.trim();
  if (configured && configured.length >= 16) {
    return configured;
  }
  return EPHEMERAL_DEMO_HMAC_KEY;
}

export interface DemoTokenPayload {
  sub: string; // auth_user_id
  staffId: string;
  exp: number; // epoch ms
  iat: number;
  mode: "demo";
}

/**
 * Creates a cryptographically signed HMAC-SHA256 session token for isolated DEMO mode testing.
 * Notice: Role is NOT trusted from the token payload during verification; verification always looks up
 * the server-side staff record by `auth_user_id` to prevent client metadata/role tampering.
 */
export function createDemoStaffSessionToken(
  input: {
    authUserId: string;
    staffId: string;
    expiresInMs?: number;
    nowMs?: number;
  },
  env?: CrmAuthEnv,
): string {
  const now = input.nowMs ?? Date.now();
  const exp = now + (input.expiresInMs ?? DEFAULT_SESSION_TTL_MS);
  const payload: DemoTokenPayload = {
    sub: input.authUserId,
    staffId: input.staffId,
    iat: now,
    exp,
    mode: "demo",
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  const secret = getDemoSigningSecret(env);
  const signature = crypto
    .createHmac("sha256", secret)
    .update(`wnx_demo_v1.${encodedPayload}`)
    .digest("base64url");

  return `wnx_demo_v1.${encodedPayload}.${signature}`;
}

export function verifyDemoStaffSessionToken(
  token: string,
  options?: { env?: CrmAuthEnv; nowMs?: number },
):
  | { valid: true; payload: DemoTokenPayload }
  | { valid: false; reason: "invalid_token" | "expired" } {
  if (!token || typeof token !== "string" || !token.startsWith("wnx_demo_v1.")) {
    return { valid: false, reason: "invalid_token" };
  }

  const parts = token.split(".");
  if (parts.length !== 3) {
    return { valid: false, reason: "invalid_token" };
  }

  const [, encodedPayload, providedSig] = parts;
  if (!encodedPayload || !providedSig) {
    return { valid: false, reason: "invalid_token" };
  }

  const secret = getDemoSigningSecret(options?.env);
  const expectedSig = crypto
    .createHmac("sha256", secret)
    .update(`wnx_demo_v1.${encodedPayload}`)
    .digest("base64url");

  const a = Buffer.from(providedSig, "utf8");
  const b = Buffer.from(expectedSig, "utf8");
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return { valid: false, reason: "invalid_token" };
  }

  try {
    const decoded = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf8"),
    ) as DemoTokenPayload;
    if (
      !decoded ||
      decoded.mode !== "demo" ||
      typeof decoded.sub !== "string" ||
      typeof decoded.exp !== "number"
    ) {
      return { valid: false, reason: "invalid_token" };
    }
    const now = options?.nowMs ?? Date.now();
    if (now >= decoded.exp) {
      return { valid: false, reason: "expired" };
    }
    return { valid: true, payload: decoded };
  } catch {
    return { valid: false, reason: "invalid_token" };
  }
}

export type CrmAuthFailureReason =
  | "unauthenticated"
  | "expired"
  | "invalid_token"
  | "revoked"
  | "not_staff"
  | "disabled_staff"
  | "forbidden"
  | "live_unconfigured";

export interface CrmAuthSuccess {
  ok: true;
  mode: "live" | "demo";
  staff: CrmStaffMember;
  permissions: CrmPermission[];
}

export interface CrmAuthFailure {
  ok: false;
  mode: "live" | "demo";
  status: 401 | 403 | 503;
  reason: CrmAuthFailureReason;
  message: string;
}

export type CrmAuthResult = CrmAuthSuccess | CrmAuthFailure;

export interface CrmAuthDatabaseAdapter {
  verifySupabaseJwt: (
    accessToken: string,
  ) => Promise<{ user: { id: string; email?: string } | null; error?: string }>;
  findStaffByAuthUserId: (authUserId: string) => Promise<CrmStaffMember | null>;
}

export function createLiveSupabaseAuthAdapter(supabase: SupabaseClient): CrmAuthDatabaseAdapter {
  return {
    async verifySupabaseJwt(accessToken: string) {
      const { data, error } = await supabase.auth.getUser(accessToken);
      if (error || !data?.user) {
        return { user: null, error: error?.message || "Invalid session token" };
      }
      return {
        user: {
          id: data.user.id,
          email: data.user.email,
        },
      };
    },
    async findStaffByAuthUserId(authUserId: string) {
      const { data, error } = await supabase
        .from("crm_staff_members")
        .select("id, auth_user_id, email, full_name, role, is_active, created_at, updated_at")
        .eq("auth_user_id", authUserId)
        .maybeSingle();

      if (error || !data) {
        return null;
      }
      return data as CrmStaffMember;
    },
  };
}

/**
 * Verifies a staff session token and optional required permission on the server.
 *
 * Security invariants:
 * 1. Never trusts client-supplied `isAdmin`, `role`, or JWT `user_metadata`.
 * 2. Checks revocation registry first.
 * 3. In LIVE mode, rejects demo tokens and fails closed if Supabase credentials are missing.
 * 4. Looks up the staff record server-side by verified `auth_user_id` and enforces `is_active === true`.
 * 5. Enforces the exact requested `requiredPermission` against the server-controlled role matrix.
 */
export async function authenticateAndAuthorizeCrmRequest(options: {
  token: string | null | undefined;
  requiredPermission?: CrmPermission;
  env?: CrmAuthEnv;
  authAdapter?: CrmAuthDatabaseAdapter;
  demoStaffList?: readonly CrmStaffMember[];
  nowMs?: number;
}): Promise<CrmAuthResult> {
  const env = options.env ?? (typeof process !== "undefined" ? (process.env as CrmAuthEnv) : {});
  const mode = resolveCrmMode(env);
  const rawToken = options.token?.trim() || "";

  if (mode === "live" && !options.authAdapter && !hasValidSupabaseServerConfig(env)) {
    return {
      ok: false,
      mode: "live",
      status: 503,
      reason: "live_unconfigured",
      message:
        "CRM Live Mode requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY on the server. Access is fail-closed.",
    };
  }

  if (!rawToken) {
    return {
      ok: false,
      mode,
      status: 401,
      reason: "unauthenticated",
      message: "Authentication required. Please sign in with an authorized WAVENOX staff account.",
    };
  }

  if (isCrmSessionTokenRevoked(rawToken)) {
    return {
      ok: false,
      mode,
      status: 401,
      reason: "revoked",
      message: "Your staff session has been signed out. Please sign in again.",
    };
  }

  let resolvedStaff: CrmStaffMember | null = null;

  if (mode === "demo" && rawToken.startsWith("wnx_demo_v1.")) {
    const verified = verifyDemoStaffSessionToken(rawToken, {
      env,
      nowMs: options.nowMs,
    });
    if (!verified.valid) {
      return {
        ok: false,
        mode: "demo",
        status: 401,
        reason: verified.reason,
        message:
          verified.reason === "expired"
            ? "Your staff session has expired. Please sign in again."
            : "Invalid authentication token.",
      };
    }

    const directory = options.demoStaffList ?? DEMO_STAFF_DIRECTORY;
    resolvedStaff = directory.find((s) => s.auth_user_id === verified.payload.sub) ?? null;

    if (!resolvedStaff) {
      return {
        ok: false,
        mode: "demo",
        status: 403,
        reason: "not_staff",
        message: "Authenticated account is not provisioned in the WAVENOX staff directory.",
      };
    }
  } else {
    // LIVE mode (or non-demo token): strictly reject demo tokens in LIVE mode
    if (rawToken.startsWith("wnx_demo_v1.")) {
      return {
        ok: false,
        mode,
        status: 401,
        reason: "invalid_token",
        message: "Demo sandbox tokens are rejected in LIVE mode.",
      };
    }

    if (!options.authAdapter) {
      return {
        ok: false,
        mode,
        status: 503,
        reason: "live_unconfigured",
        message: "Server authentication adapter is unavailable.",
      };
    }

    const verifiedJwt = await options.authAdapter.verifySupabaseJwt(rawToken);
    if (!verifiedJwt.user) {
      const isExpired = verifiedJwt.error?.toLowerCase().includes("expired") ?? false;
      return {
        ok: false,
        mode,
        status: 401,
        reason: isExpired ? "expired" : "invalid_token",
        message: isExpired
          ? "Your staff session has expired. Please sign in again."
          : "Invalid or unverified authentication session.",
      };
    }

    resolvedStaff = await options.authAdapter.findStaffByAuthUserId(verifiedJwt.user.id);
    if (!resolvedStaff) {
      return {
        ok: false,
        mode,
        status: 403,
        reason: "not_staff",
        message:
          "Access denied. Your account is authenticated but is not provisioned as an authorized WAVENOX CRM staff member.",
      };
    }
  }

  if (!resolvedStaff.is_active) {
    return {
      ok: false,
      mode,
      status: 403,
      reason: "disabled_staff",
      message:
        "Access denied. This WAVENOX staff membership has been deactivated by an administrator.",
    };
  }

  if (!CRM_STAFF_ROLES.includes(resolvedStaff.role)) {
    return {
      ok: false,
      mode,
      status: 403,
      reason: "forbidden",
      message: "Access denied. Invalid staff role configuration.",
    };
  }

  if (
    options.requiredPermission &&
    !hasCrmPermission(resolvedStaff.role, options.requiredPermission)
  ) {
    return {
      ok: false,
      mode,
      status: 403,
      reason: "forbidden",
      message: `Permission denied. Role '${resolvedStaff.role}' is not authorized to perform '${options.requiredPermission}'.`,
    };
  }

  return {
    ok: true,
    mode,
    staff: resolvedStaff,
    permissions: getPermissionsForRole(resolvedStaff.role),
  };
}

/**
 * Masks an Indian phone number for summary tables and read-only viewer roles (+91 ••••••3210).
 */
export function maskPhoneNumber(phone: string | null | undefined): string {
  if (!phone || !phone.trim()) return "Not provided";
  const digits = phone.replace(/\D/g, "");
  if (digits.length >= 4) {
    const last4 = digits.slice(-4);
    return `+91 ••••••${last4}`;
  }
  return "••••••";
}

/**
 * Masks an email address for summary tables and read-only viewer roles.
 */
export function maskEmailAddress(email: string | null | undefined): string | null {
  if (!email || !email.trim()) return null;
  const trimmed = email.trim();
  const atIdx = trimmed.indexOf("@");
  if (atIdx <= 0) return "•••";
  const local = trimmed.slice(0, atIdx);
  const domain = trimmed.slice(atIdx + 1);
  const prefix = local.slice(0, Math.min(2, local.length));
  return `${prefix}•••@${domain}`;
}
