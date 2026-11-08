import { createProjectsHandler, readProjectCookie } from "./project-http";
import { createLiveProjectStore, ProjectError } from "./project-store";
import { createDemoProjectStore } from "./project-demo";
import {
  authenticateAndAuthorizeCrmRequest,
  createLiveSupabaseAuthAdapter,
  CRM_SESSION_COOKIE_NAME,
} from "./crm-auth";
import { getServerSupabaseClient, hasValidSupabaseServerConfig } from "./supabase";
const demoStore = createDemoProjectStore();
export async function handleProjectRequest(request: Request): Promise<Response> {
  const env = process.env;
  const mode =
    (env.LEAD_MODE || env.VITE_LEAD_MODE || "").trim().toLowerCase() === "demo" ? "demo" : "live";
  const db =
    mode === "live" && hasValidSupabaseServerConfig(env) ? getServerSupabaseClient(env) : null;
  return createProjectsHandler({
    mode,
    store: mode === "demo" ? demoStore : db ? createLiveProjectStore(db) : null,
    secureCookie: env.NODE_ENV === "production",
    emailEnabled: env.PORTAL_EMAIL_ENABLED === "true",
    rateSecret: env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SECRET_KEY,
    staff: async (r) => {
      const result = await authenticateAndAuthorizeCrmRequest({
        token: readProjectCookie(r, CRM_SESSION_COOKIE_NAME),
        env,
        authAdapter: db ? createLiveSupabaseAuthAdapter(db) : undefined,
      });
      if (!result.ok) throw new ProjectError(result.status, "Staff authorization is unavailable.");
      return { kind: "staff", id: result.staff.id, role: result.staff.role };
    },
    auth: db
      ? {
          async requestCode(email) {
            const { error } = await getServerSupabaseClient(env).auth.signInWithOtp({
              email,
              options: { shouldCreateUser: true },
            });
            if (error) throw new Error("Email sign-in unavailable");
          },
          async verifyCode(email, token) {
            const { data, error } = await getServerSupabaseClient(env).auth.verifyOtp({
              email,
              token,
              type: "email",
            });
            if (error || !data.session || !data.user?.email) throw new Error("Invalid code");
            return {
              id: data.user.id,
              email: data.user.email,
              emailConfirmed: Boolean(data.user.email_confirmed_at),
            };
          },
        }
      : null,
  })(request);
}
