# WAVENOX — Step 7 execution report

Updated 9 November 2026. **Step 7 code complete: YES.** Implementation and verification evidence are separated from production activation. Verified implementation commit: `19d6bd9a9ffa9a9422967d2b47dd40ce33065b0c`; the final documentation delivery head is available in Draft PR #11.

## 1. Repository foundation

Base: `9037b75ded4f11ba7505b2e6b82b5a4fdb4ae308`, main containing merged Step 6 PR #10 and implementation `55ea236a7dec0a60980b24d8dfc970486feb0309`. The checkout was clean before branching. No history was rewritten or existing user work discarded.

## 2. Feature branch and delivery

`feat/wavenox-step7-installation-journey-portal`, pushed normally. [Draft PR #11](https://github.com/wavenoxx/wavenox/pull/11) targets main. Source commits: `fcf9f9a` initial implementation, `6ad732c` authentication/hydration guard, `cd833f2` evidence validation and precise labels, `3a43970` browser/visual verification, `19d6bd9` appointment clarity and explicit direct-write denial assertions. The PR remains unmerged.

## 3. Code architecture

React/TypeScript/TanStack Start and the npm lockfile remain unchanged in framework/dependency selection. Additive `/portal`, Projects inside `/ops`, typed project models/DTOs, same-origin HTTP handlers, LIVE PostgreSQL/storage adapter, isolated DEMO adapter and scan validation. Existing lead capture, CRM RPCs, solar calculations, configurator and bill processing are preserved.

## 4. Schema

One additive migration defines ten private project tables plus a private document bucket. It requires the existing migration history and Supabase Auth/Storage. It has been applied only in disposable PostgreSQL/Supabase tests, never production. Foreign keys, bounded text, indexes, uniqueness, version checks and append-only activity protect state.

## 5. Identity and authorization

Actual provider: Supabase Auth email OTP. Owner-approved 24-hour invitations are consumed only after verified email ownership. A separate random 256-bit customer cookie is HttpOnly, SameSite=Lax, Secure in production and expires after one hour; only its hash is persisted. Every operation checks account status and project membership. Staff identities cannot impersonate customers. Existing staff authentication and active role checks remain authoritative. Generic, rate-limited, bounded-time OTP request responses make no delivery claim. SMTP/code-only templates remain unactivated operational prerequisites.

## 6. Project activation

An owner explicitly activates a current contract_signed consultation after separate contact and operational/commercial evidence checks. The consultation reference is not authentication, and the CRM status is not proof of a signed agreement. A unique consultation relationship and idempotency prevent duplicates. Original lead notes, source attribution and consent provenance remain intact.

## 7. Timeline

Ten staff-controlled milestones use explicit states. Dates never complete work automatically. Commissioning/handover require matching reviewed same-project evidence and preceding operational completion; corrections and dependent reversals are attributable. A successful native test completes an installation only through these real database operations. No energy monitoring or fabricated progress is displayed.

## 8. Appointments

Customers request; authorized staff propose, confirm, reschedule, cancel or record a completed visit. UTC storage and Asia/Kolkata display are tested. Confirmed coordinator overlaps are rejected. Actual completion requires an existing ended confirmed visit and unchanged scheduled timestamps. No external calendar or automated dispatch exists.

## 9. Documents

Private JPEG/PNG scans only, up to 3 MiB and 24 megapixels. Sharp validates/normalizes to JPEG, strips metadata and bounds output dimensions. Objects have immutable server-generated keys. Metadata and audit registration are atomic; failed registration compensates the prior storage upload. Customers download only reviewed customer-visible documents through an authenticated, no-store endpoint that rechecks access after storage I/O. No public/signed bearer URLs are issued. PDF/Office/HTML/SVG are rejected; no malware-scanning or signature-verification claim is made.

## 10. Support

Membership-scoped categories and bounded requests; five requests per actor/hour. Public responses and private notes are separate. Resolution requires a public response and records its real timestamp. Native tests verify cross-project denial, rate limits and internal-note privacy.

## 11. Staff operations and audit

Owners manage activation/access/coordinators/project state; coordinators manage only assigned projects; viewers receive restricted summaries. Project creation, changes, invitation acceptance and mandatory audit records are transactional. Forced audit failure rolls back state, stale versions conflict, identical retries do not duplicate history, and direct staff Data API/RPC access is denied. Audits are append-only. Document access history records an authorized request, not confirmed receipt.

## 12. Customer portal

Overview, journey, appointments, documents, support and account/privacy. Only authorized projects are listed. Public SSR contains a sign-in shell with no customer data. LIVE failures do not substitute DEMO records. DEMO is clearly synthetic, isolated process memory and never sends real notifications.

## 13. Privacy

Customer JSON excludes internal notes, attribution, contact/activation evidence, membership emails and storage paths. Private routes—including trailing-slash paths—are excluded from attribution and private error reporting. Cookies/tokens are not stored in localStorage. API/private route responses are no-store/noindex. Client bundle scanning found no configured secret values. DPDP phased commencement and official corrections were reviewed in the [security document](STEP7_DATABASE_SECURITY.md); no blanket compliance claim is made. Revocation is distinct from deletion/retention.

## 14. Local quality gates

| Command | Actual outcome |
| --- | --- |
| `npm test` | 182 passed; 33 opt-in skipped; 15 suites passed, 3 skipped |
| `npm run lint` | PASS; zero errors, ten inherited warnings |
| `npx tsc --noEmit` | PASS |
| `npm run build` | PASS, client and Nitro SSR |
| `npm run test:e2e` | Executed locally; Chromium launch blocked by macOS MachPortRendezvous sandbox |
| Runtime `npm audit --omit=dev` | Zero vulnerabilities |
| Full dependency audit | Nine inherited moderate development-tool advisories; no high/critical; no package changes |

The 33 opt-in cases are 11 Step 5 native database tests, 19 Step 7 native tests and 3 real bill-provider tests. Native suites are executed separately in CI. Real bill-provider tests remain unperformed in this stage; historical HTTP 429 limitations remain unchanged.

## 15. Native database evidence

A local PGlite preflight applied every migration and exercised create/note/milestone/appointment/invitation/session operations. This uses fixture Auth/Storage schemas and is not proof of real Supabase services.

[CI run 42557763076](https://github.com/wavenoxx/wavenox/actions/runs/42557763076), commit `19d6bd9a9ffa9a9422967d2b47dd40ce33065b0c`, passed both jobs: **11 Step 5 native cases + 19 Step 7 native cases** against disposable loopback Supabase with real PostgreSQL, PostgREST, Auth and Storage. This includes anonymous/customer/non-staff/owner/coordinator/viewer/deactivated direct access denial, project isolation, account bans, rollback, concurrency, replay, critical evidence, scheduling conflicts, actual private objects, invalid/reused OTPs, expired invitations/sessions, logout and membership revocation. Explicit direct SELECT/RPC, project UPDATE, membership DELETE and forged audit INSERT attempts are denied across all seven tested personas. These are executed authorization tests, not migration-text assertions.

## 16. Browser E2E

The same green CI run passed the inherited **17 public/customer route audit**, Step 6 **desktop + mobile** bill/roof flows, existing LIVE CRM password login/cookie/audited-note/logout flow, and Step 7 **DEMO + LIVE staff/customer journeys**. Step 6 extraction transport is mocked; it is not real AI evidence. Step 7 LIVE uses actual disposable database/Auth/Storage, including staff project creation, approved invitation, real OTP verification, milestones, private scan upload/review/download and support response. Test OTPs are generated by the local Auth admin API; SMTP delivery is not claimed.

Both Step 7 modes exercise **320×720, 390×844, 768×1024, 1024×768 and 1440×900**, keyboard activation, reduced-motion context, one h1/main, no horizontal overflow, visible text ≥12px, and zero serious/critical axe findings. Customer SSR/JSON privacy, wrong-project denial and copied-session rejection after logout are checked.

## 17. Visual inspection

CI artifacts contain nine Step 7 PNGs per mode: five journey breakpoints, mobile appointments/documents/support and desktop staff operations. Files are under `qa-artifacts/step7/` in artifacts `customer-browser-evidence` and `step7-live-browser-evidence` (seven-day CI retention). Final LIVE artifacts were downloaded to ignored `qa-artifacts/step7-final/live/`; customer artifacts to `qa-artifacts/step7-final/customer/`. Final `live-portal-390.png`, `live-portal-1024.png` and `live-staff.png` were opened and visually inspected. Prior green-run inspection also covered 320/768/1440 journey views and the mobile appointment, document and support views. Journey cards are contained; document titles, confirmed appointment labels and public support responses remain readable. A stretched staff-form spacing issue was corrected. These synthetic test screenshots contain no production customer records.

## 18. Performance findings

Client/SSR builds succeed; no new runtime dependency was added. Project lists and activity/document/support reads are bounded (50 project summaries, 100 related entries per section). Images/body sizes are bounded and private data is not publicly cached. No load-test, production latency benchmark or hardware performance claim is made. Pagination beyond these bounds is a future improvement.

## 19. Limitations and production prerequisites

No known unresolved P0 security/data-integrity or P1 functional issue in the verified flows. Production remains inactive: migration approval, staff/customer provisioning, server credentials, private bucket verification, SMTP and code-only templates (configure short OTP expiry), real email delivery, backups, reviewed retention/deletion, session/rate-record cleanup, orphan reconciliation, monitoring and abuse controls are operational prerequisites. Storage and PostgreSQL cannot share a transaction; a crash/failed compensation can leave an inaccessible private orphan. DEMO is temporary and not shared multi-instance persistence. No outbound project notifications, AI activation, payments, official certifications or telemetry are added. Development-tool advisories need a separately reviewed tooling update; pagination is a minor improvement.

## 20. Preview and release decision

Vercel previously reported READY for implementation commit `19d6bd9a9ffa9a9422967d2b47dd40ce33065b0c`, [preview](https://wavenox-d8kz5ppe0-wavenoxxs-projects.vercel.app), deployment `dpl_FvPd4kEbTpoeYST8QeigwL8XTRvT`. Protected preview content returned 403, and the resumed connection also requires renewed team authorization to list deployments. Protected runtime page inspection is **UNVERIFIED**. The final documentation-head preview status is reported at delivery if accessible. Disposable browser evidence is separate from Vercel build status; no protection was bypassed.

No production migrations, accounts, customer-record changes, merges, production deployment or Step 8 implementation occurred.

- STEP 7 CODE COMPLETE: **YES**
- CUSTOMER PORTAL SECURITY: **PASS in disposable Supabase and browser verification**; production provisioning remains unverified.
- READY FOR STEP 8: **YES**, as a separately authorized task.
- LIVE CUSTOMER PORTAL READY: **NO**
- PAID-TRAFFIC PRODUCTION READY: **NO**
- PRODUCTION DEPLOYMENT AUTHORIZED: **NO**
