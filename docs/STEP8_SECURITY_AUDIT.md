# Step 8 security audit

Audit date: 10 November 2026. Foundation: `04c115d8504155e654c1fe907113ecbf9253a3fc` (merged Step 7 PR #11). Scope is source, production build, synthetic browser workflows and disposable Supabase. No production rows were read or changed.

## Findings and disposition

| Severity | Finding | Correction / evidence |
| --- | --- | --- |
| P1 | Staff logout only revoked a JWT in one warm process; a fresh instance could accept the copied token | LIVE logout now invokes Supabase Auth local-session sign-out. Every verified staff JWT must also match an active `auth.sessions` row through service-only `crm_session_is_active`. Five unit cases and two native cases include fresh-instance replay after clearing process state. |
| P1 | Global server error handling expanded arbitrary messages, causes and stacks that could include customer input | Production error capture retains no raw exception and emits only `server_error`; production Lovable error posting is disabled. Development diagnostics remain available. Synthetic secret-bearing errors verify the boundary. |
| P2 | Lead limiter's 2,000-key cap did not prevent unbounded unique-phone growth | New keys fail clearly once the active cap is full; expired windows release capacity. Regression exercised 2,000 distinct synthetic numbers and expiry. Turnstile verification has a ten-second timeout. |
| P2 | SSR/error response headers depended on platform static-header handling | Server wrapper sets nosniff, frame denial, referrer/permissions policy and production CSP. Private/API/server-function/error responses get no-store/noindex. Static CSP matches the server's permitted integrations. |
| P2 | Some public source labels implied unproved legal, structural or manufacturer certification | Reference versus model/control labels now distinguish these; no calculation formula changed. See readiness report. |

## Authorization model preserved

The trusted server uses a fresh service-role Supabase client per operation; credentials are never returned. Server functions validate identity and active staff membership for every request and SQL checks material mutation permissions again. Roles remain owner_admin, assigned sales_coordinator and restricted read_only_viewer. Ordinary authenticated users receive no customer-table privileges.

Complete migration history revokes PUBLIC/anon/authenticated rights to the five CRM tables and ten project tables. RLS is enabled/forced with default deny; RPC EXECUTE is service-only. CRM RPCs use invoker rights and empty search paths. The new session function necessarily uses definer rights to inspect Auth tables, with an empty search path, qualified names, a boolean result and no public execution. It compares the Auth-verified user ID to the supplied session UUID; a browser actor ID is never authoritative. Missing migration/query failure closes staff access.

Stage changes, corrections, ownership, qualification, follow-ups and privacy events remain atomic CRM RPCs. Project creation, access, milestones, appointment changes, updates and support remain atomic project RPCs with mandatory audit. Optimistic versions and idempotency rules are preserved. Native injected audit failure proves rollback; direct audit forgery is rejected.

Customer identity remains approved Supabase email OTP exchanged for a separate random, hashed, one-hour HttpOnly session. Active account and project membership are checked on every operation. Staff identity does not imply customer identity. Disabled/revoked access, expired sessions, reused codes and cross-project reads/mutations are denied. Consultation reference codes grant no access.

## HTTP, documents and abuse

TanStack's explicit CSRF middleware protects server functions. Project and bill HTTP handlers enforce same-origin requests and bounded bodies. Cookies are HttpOnly, SameSite=Lax and Secure in production. Private SSR contains a sign-in shell, never project payloads. No wildcard CORS permission is added. React text rendering and validated parameterized RPC/query arguments remain in use.

Project Storage is private, with restrictive browser-role denial. Only server-generated same-project object paths are used. Reviewed customer-visible JPEG/PNG scans are normalized, bounded to 3 MiB/24 MP intake, stripped of metadata, and delivered as authenticated no-store attachments after repeated authorization. No signed/public bearer URLs, Office/PDF/SVG/HTML upload support or malware-scanner claim is introduced. Database and object storage cannot share a transaction: compensation and an operator orphan-reconciliation process remain necessary.

CSP permits inline scripts/styles for current TanStack hydration. It is defense in depth, not a claim of nonce-based XSS prevention. No new third-party script is introduced. Bill AI stays disabled pending distributed quotas, cost control and accuracy validation. Lead and staff-login burst limits are process-local; PostgreSQL lead duplicate protection and project/support/invite limits supplement them. A verified edge abuse policy is a launch prerequisite, not an active integration claimed by this audit.

## Executed evidence

[CI run 42675302747](https://github.com/wavenoxx/wavenox/actions/runs/42675302747) at `1850f6e7e8c9b52058e03ed309ac09c70cbf5b46` passed the database job: 11 CRM + 19 project + 2 Step 8 native cases on disposable Supabase/PostgreSQL, PostgREST, Auth and Storage. Tests cover anon, ordinary authenticated, disabled staff, viewers, coordinators, owners, customers and revoked accounts; direct table/RPC denial, private object denial, ownership isolation, transaction rollback, concurrent writes, replay and shared logout. LIVE CRM and LIVE portal browser journeys also passed there. Production permissions remain unverified.

The same run passed ordinary unit/lint/types/build and inherited browser suites, but its new performance/accessibility gate failed. These failures and fixes are recorded separately; a passing DB job is not a passing release audit. Final evidence is in the execution report.

## Supply chain and limitations

React Start resolves 1.169.4; start-server-core 1.169.45, above the [TanStack advisory](https://github.com/advisories/GHSA-qx66-fv34-fjm8) patches. Vitest was narrowly patched to 5.0.3 for [its advisory](https://github.com/advisories/GHSA-qxg6-89mg-rqv8). Lighthouse 13.6.0 is a pinned development-only measurement tool. Runtime npm audit: zero findings. Full audit: seven moderate entries in the typescript-eslint/minimatch chain, one underlying [glob amplification advisory](https://github.com/advisories/GHSA-g3hv-75wg-m249). These tools process trusted repository configuration in CI; no public test UI is exposed. A forced incompatible minimatch major override was not introduced. Recheck the upstream compatible fix before release.

Actions are pinned to commit SHAs, permissions are contents:read, checkout credentials are not persisted, and native tests only use loopback fixtures. No new external monitoring is active. This audit is not a production penetration test or a legal certification.
