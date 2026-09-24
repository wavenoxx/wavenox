import { createClient, SupabaseClient } from "@supabase/supabase-js";

let cachedClient: SupabaseClient | null = null;

/**
 * Returns a server-side Supabase client initialized with the privileged Service Role Key.
 *
 * CAUTION: Never import or use this module in client-side components.
 * This client bypasses Row Level Security and is reserved exclusively for
 * server functions and API handlers.
 */
export function getServerSupabaseClient(): SupabaseClient {
  if (cachedClient) {
    return cachedClient;
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error(
      "Missing Supabase server configuration. Please ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in your environment.",
    );
  }

  cachedClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return cachedClient;
}
