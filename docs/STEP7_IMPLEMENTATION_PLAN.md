# Step 7 implementation plan

## Foundation and baseline

Base: main `9037b75ded4f11ba7505b2e6b82b5a4fdb4ae308`, verified to contain Step 6 `55ea236a7dec0a60980b24d8dfc970486feb0309` with no source differences. Branch: `feat/wavenox-step7-installation-journey-portal`. The checkout was clean before branching; shared history and the original Antigravity checkout are preserved.

Baseline: 152 tests passed, 14 opt-in cases skipped; lint passed with ten inherited warnings; TypeScript and client/Nitro SSR build passed. Local Chromium failed before page execution with the existing macOS sandbox denial. The approved GitHub Actions browser and disposable Supabase workflow supplies those gates. Docker is installed but its daemon is unavailable locally.

## Existing architecture

TanStack Start/Router, React, TypeScript, Tailwind, Supabase JS, Zod and npm remain authoritative. `/ops` uses a separate HttpOnly staff cookie, verified Supabase Auth identity and active CRM membership. Roles are owner_admin, sales_coordinator and read_only_viewer. All five CRM tables deny direct anon/authenticated access; service-only RPCs perform audited mutations with version checks. Consultation stages are new, contacted, qualified, survey_booked, quoted, contract_signed, installed and archived. Neither a reference code nor a stage is identity or a legal document.

There is no customer account/session, project membership, project document storage or customer notification workflow. Optional Resend lead-owner notification exists, but is not a customer-invitation service. Step 6 originals are ephemeral and will not be copied into projects. Its disabled AI provider is not a dependency.

## Intended implementation

1. Add `/portal` and a Projects section inside `/ops`. Reuse current staff authentication, brand styling and validated lead lookup. Owners control activation/access/coordinator assignment; coordinators manage their assigned projects. Viewers receive restricted summaries, never mutation or private-document rights.
2. Customer onboarding is invitation-approved email OTP using official Supabase Auth. No phone/reference login, staff impersonation, password collection or browser token storage. A verified OTP is exchanged server-side for a short-lived random HttpOnly customer cookie whose hash is stored in a revocable database session. Membership and account status are rechecked. Production OTP sending requires explicit configuration and a code-only email template; missing delivery fails closed.
3. Add projects, memberships, invitation approvals, sessions, milestones, appointments, document metadata, support requests, append-only activity and bounded rate-limit state. All private tables have RLS plus revoked browser-role grants. Mutations use service-only, constrained-search-path PostgreSQL transactions; trusted actor identity comes from server authentication, not payloads.
4. Project activation requires an existing contract_signed consultation, current version, verified contact reference and separate operational-authorization evidence. One consultation cannot create duplicate projects. Preserve source, consent and original customer notes.
5. Ten explicit milestones support not started, in progress, blocked, completed and not applicable. Critical commissioning/handover require staff-verified project documents. Dates never imply completion. Reversals, blockers and customer-visible updates require explicit attributable actions.
6. Appointments store UTC, display Asia/Kolkata, distinguish requested/proposed/confirmed/rescheduled/completed/cancelled, and prevent overlapping confirmed assignments for a modeled coordinator. Customers may request a time; only staff confirms or completes it.
7. Private documents initially accept validated/re-encoded JPEG/PNG scans only (3 MiB input, bounded decoded pixels). No HTML/SVG, executable, office file or original PDF is accepted without additional scanning infrastructure. Store immutable random keys in a private Supabase bucket; deliver bytes through an authenticated no-store server endpoint that rechecks membership. Do not issue public/signed bearer links. Upload storage first, atomically register metadata/audit afterward; compensate failures and never report an unaudited success.
8. Customer support is membership-scoped and rate-limited. Staff responses and customer-visible updates are separate from internal notes and audit snapshots. Outbound milestone notifications are not implemented; portal updates are explicitly distinct from email delivery.
9. DEMO uses isolated synthetic identities, projects and in-memory files, with visible labeling and no provider/database calls. LIVE errors never return DEMO records.

## Acceptance and evidence

Test authorization independently at HTTP, actual PostgREST/RPC and Storage boundaries. Exercise OTP verification/replay/expiry, two-customer isolation, account and membership revocation, conflicts, duplicate requests, forced audit rollback, file failure, support privacy, request-vs-confirmed schedules and all existing regressions. Capture and inspect portal/ops at 320×720, 390×844, 768×1024, 1024×768 and 1440×900; verify keyboard, accessibility and private SSR/cache behavior.

Run unit/lint/types/build, inherited E2E, Step 6 E2E and focused Step 7 native integration/browser suites. Keep mock, native database/storage/auth, provider delivery and preview evidence distinct. Review current official DPDP commencement material; do not claim legal compliance. Document provisioning, SMTP/template, retention, migration and release prerequisites. Commit and push this feature branch, create a Draft PR to main, inspect its preview. No live migrations, production accounts/data, merge, production deployment or Step 8 implementation.
