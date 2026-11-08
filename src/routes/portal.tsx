import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BrandLogo } from "@/components/BrandLogo";
import { ProjectField, ProjectWorkspace } from "@/components/ProjectWorkspace";
import { projectRequest } from "@/functions/projects";
import { BRAND_CONFIG } from "@/config/brand";
export const Route = createFileRoute("/portal")({
  head: () => ({
    meta: [
      { title: `Customer projects | ${BRAND_CONFIG.name}` },
      { name: "robots", content: "noindex, nofollow, noarchive" },
    ],
  }),
  component: CustomerPortal,
});
type Session = {
  mode: "live" | "demo";
  authenticated: boolean;
  emailEnabled: boolean;
  personas: { id: string; label: string; email: string }[];
};
function CustomerPortal() {
  const [session, setSession] = useState<Session | null>(null),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [busy, setBusy] = useState(false),
    [email, setEmail] = useState("");
  const refresh = async () => setSession(await projectRequest<Session>("?action=session"));
  useEffect(() => {
    void refresh().catch((e) =>
      setError(e instanceof Error ? e.message : "Sign-in service unavailable."),
    );
  }, []);
  const action = async (body: unknown) => {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const r = await projectRequest<{ message?: string }>("", body);
      if (r.message) setNotice(r.message);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Action unavailable.");
    } finally {
      setBusy(false);
    }
  };
  const button =
    "min-h-11 rounded bg-neutral-900 px-5 py-3 text-sm font-medium text-white disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-700";
  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <header className="border-b border-neutral-200">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-6 sm:px-8">
          <BrandLogo size="sm" />
          <span className="text-xs uppercase tracking-widest text-neutral-600">
            Customer projects
          </span>
        </div>
      </header>
      <main className="mx-auto max-w-6xl space-y-8 px-4 py-10 sm:px-8 sm:py-16">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="text-xs uppercase tracking-widest text-amber-800">
              Your installation journey
            </p>
            <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">
              Clear progress. Personal support.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-neutral-600">
              A private space for verified project updates, appointments, documents and questions.
            </p>
          </div>
          {session?.authenticated && (
            <button
              className={button}
              disabled={busy}
              onClick={() => void action({ action: "logout" })}
            >
              Sign out
            </button>
          )}
        </div>
        {session?.mode === "demo" && (
          <p className="rounded border border-amber-700 bg-amber-50 p-4 text-sm">
            <strong>DEMO · Synthetic project workspace.</strong> No real customers, installations,
            files or notifications. Demo records are temporary.
          </p>
        )}
        {error && (
          <div role="alert" className="rounded border border-amber-700 bg-amber-50 p-4 text-sm">
            {error}
            <button
              className={button + " ml-3"}
              disabled={busy}
              onClick={() =>
                void refresh()
                  .then(() => setError(""))
                  .catch(() => {})
              }
            >
              Retry connection
            </button>
          </div>
        )}
        {notice && (
          <p role="status" className="rounded border p-4 text-sm">
            {notice}
          </p>
        )}
        {!session && !error && <p role="status">Checking secure access…</p>}
        {session?.authenticated ? (
          <ProjectWorkspace audience="customer" />
        ) : (
          session && (
            <section className="grid gap-8 rounded border border-neutral-200 bg-neutral-50 p-5 sm:p-8 md:grid-cols-2">
              <div>
                <h2 className="text-xl font-semibold">Sign in to your project</h2>
                <p className="mt-3 text-sm leading-relaxed text-neutral-600">
                  Use the email approved by your coordinator. A consultation reference or phone
                  number does not grant access. Each sign-in code is single use.
                </p>
                {session.mode === "demo" ? (
                  <div className="mt-6 space-y-4">
                    {session.personas.map((p) => (
                      <div key={p.id}>
                        <button
                          className={button}
                          disabled={busy}
                          onClick={() => void action({ action: "demo_login", personaId: p.id })}
                        >
                          Explore {p.label.toLowerCase()}
                        </button>
                        <p className="mt-2 break-all text-xs text-neutral-600">{p.email}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <form
                    className="mt-6 grid gap-4"
                    onSubmit={(e) => {
                      e.preventDefault();
                      const d = new FormData(e.currentTarget);
                      const value = String(d.get("email") ?? "").trim();
                      setEmail(value);
                      void action({ action: "request_code", email: value });
                    }}
                  >
                    <ProjectField
                      label="Approved customer email"
                      name="email"
                      type="email"
                      maxLength={254}
                    />
                    <button className={button} disabled={busy || !session.emailEnabled}>
                      Request sign-in code
                    </button>
                    {!session.emailEnabled && (
                      <p className="text-sm">
                        Email sign-in is not activated. Your coordinator must complete secure
                        onboarding first.
                      </p>
                    )}
                  </form>
                )}
              </div>
              {session.mode === "live" ? (
                <form
                  className="grid content-start gap-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const d = new FormData(e.currentTarget);
                    void action({
                      action: "verify_code",
                      email: String(d.get("email") ?? ""),
                      token: String(d.get("token") ?? ""),
                    });
                  }}
                >
                  <h3 className="text-lg font-semibold">Verify your code</h3>
                  <ProjectField
                    key={email}
                    label="Email used for the code"
                    name="email"
                    type="email"
                    value={email}
                    maxLength={254}
                  />
                  <label className="grid gap-2 text-sm font-medium">
                    One-time email code
                    <input
                      name="token"
                      autoComplete="one-time-code"
                      inputMode="numeric"
                      pattern="[0-9]{6,10}"
                      minLength={6}
                      maxLength={10}
                      required
                      className="min-h-11 rounded border border-neutral-300 bg-white px-3 py-2 text-sm"
                    />
                  </label>
                  <button className={button} disabled={busy || !session.emailEnabled}>
                    Verify and sign in
                  </button>
                  <p className="text-sm text-neutral-600">
                    Codes expire according to the configured authentication provider. Never share a
                    code with staff or anyone else.
                  </p>
                </form>
              ) : (
                <div className="text-sm leading-relaxed text-neutral-600">
                  <h3 className="text-lg font-semibold text-neutral-900">
                    What this preview demonstrates
                  </h3>
                  <p className="mt-3">
                    Two separate synthetic customers have different projects. Staff updates and
                    reviewed documents appear only within the associated project.
                  </p>
                  <p className="mt-3">
                    Operational completion is recorded by authorized staff. No date-based progress,
                    measured energy data or automatic approval is shown.
                  </p>
                </div>
              )}
            </section>
          )
        )}
        <section className="border-t pt-6 text-sm text-neutral-600">
          <h2 className="font-semibold text-neutral-900">Account & privacy</h2>
          <p className="mt-2">
            Project access can be revoked by an authorized coordinator. Revocation does not delete
            records subject to reviewed operational retention requirements. Sign out when using a
            shared device.
          </p>
          <Link to="/legal/privacy" className="mt-2 inline-flex min-h-11 items-center underline">
            Privacy and access requests
          </Link>
        </section>
      </main>
    </div>
  );
}
