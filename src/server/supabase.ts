import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const PLACEHOLDER_VALUES = new Set([
  "https://your-project-id.supabase.co",
  "http://your-project-id.supabase.co",
  "your-supabase-url",
  "your-service-role-secret-key",
  "your-anon-key",
  "eyjhbgcioijiuzi1niisinr5cci6ikppxvcj9...",
]);

export interface SupabaseServerEnv {
  SUPABASE_URL?: string;
  VITE_SUPABASE_URL?: string;
  NEXT_PUBLIC_SUPABASE_URL?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  SUPABASE_SECRET_KEY?: string;
}

export function resolveSupabaseServerCredentials(
  env: SupabaseServerEnv = typeof process !== "undefined" ? process.env : {},
): { url: string; serviceRoleKey: string } | null {
  const rawUrl = (
    env.SUPABASE_URL ||
    env.VITE_SUPABASE_URL ||
    env.NEXT_PUBLIC_SUPABASE_URL ||
    ""
  ).trim();
  const rawKey = (env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SECRET_KEY || "").trim();

  if (!rawUrl || !rawKey) {
    return null;
  }

  if (
    PLACEHOLDER_VALUES.has(rawUrl.toLowerCase()) ||
    PLACEHOLDER_VALUES.has(rawKey.toLowerCase())
  ) {
    return null;
  }

  try {
    const parsed = new URL(rawUrl);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      return null;
    }
  } catch {
    return null;
  }

  return { url: rawUrl, serviceRoleKey: rawKey };
}

export function hasValidSupabaseServerConfig(
  env: SupabaseServerEnv = typeof process !== "undefined" ? process.env : {},
): boolean {
  return resolveSupabaseServerCredentials(env) !== null;
}

/**
 * Returns a server-side Supabase client initialized with the privileged Service Role Key.
 *
 * CAUTION: Never import or use this module in client-side components.
 * This client bypasses Row Level Security and is reserved exclusively for
 * server functions and API handlers.
 */
export function getServerSupabaseClient(
  env: SupabaseServerEnv = typeof process !== "undefined" ? process.env : {},
): SupabaseClient {
  const creds = resolveSupabaseServerCredentials(env);

  if (!creds) {
    throw new Error(
      "Missing Supabase server configuration. Please ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in your server environment.",
    );
  }

  // Auth sign-in mutates client session state even with persistSession disabled.
  return createClient(creds.url, creds.serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
