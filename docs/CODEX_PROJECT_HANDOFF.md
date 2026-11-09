# WAVENOX project handoff

Updated 9 November 2026. WAVENOX is a premium Indian full-service solar platform for residential and commercial customers. Preserve its brand, consent-based consultation flow, original attribution, India-specific engineering and financing assumptions, and Design Studio journey.

## Verified foundation and roadmap

Steps 1–4 delivered secure lead capture, the public showroom, energy/financial calculations and the intelligent configurator. Step 5 delivered private CRM, attribution, server-only database permissions and atomic audited mutations. [PR #9](https://github.com/wavenoxx/wavenox/pull/9) was already merged when Step 6 began. Its approved foundation is [665a2b5](https://github.com/wavenoxx/wavenox/commit/665a2b59529de2ebe2e99bde68a3f89cc02dd9ee); the Step 6 base [97dd875](https://github.com/wavenoxx/wavenox/commit/97dd875e2120401848249405c8e8f6600bd00d45) has the identical source tree. No published history was rewritten. The original Antigravity checkout was preserved.

Step 6 [PR #10](https://github.com/wavenoxx/wavenox/pull/10) is merged into main. Its implementation is `55ea236a7dec0a60980b24d8dfc970486feb0309`, and approved main/Step 7 base is `9037b75ded4f11ba7505b2e6b82b5a4fdb4ae308`, rechecked on 9 November. It adds local bill previews/redaction, a server-only OpenAI adapter, explicit human review, manual fallback and measured rectangle/L-shape roof planning. No satellite service, customer location collection, document database storage or automatic CRM insertion was added. See the [execution evidence](STEP6_EXECUTION_REPORT.md), [bill architecture](STEP6_AI_BILL_ARCHITECTURE.md), [roof capabilities](STEP6_ROOF_INTELLIGENCE.md) and [privacy boundary](STEP6_PRIVACY_SECURITY.md).

Step 7 is code complete on `feat/wavenox-step7-installation-journey-portal`; [Draft PR #11](https://github.com/wavenoxx/wavenox/pull/11) targets main and remains unmerged. Verified implementation commit: `19d6bd9a9ffa9a9422967d2b47dd40ce33065b0c`. Subsequent documentation delivery commits are recorded in that PR; inspect its actual head before continuing. Step 7 adds staff-controlled installation projects, approved customer identity/membership, milestones, appointments, private reviewed image documents and project support. See [architecture](STEP7_CUSTOMER_PORTAL_ARCHITECTURE.md), [lifecycle](STEP7_PROJECT_LIFECYCLE.md), [security](STEP7_DATABASE_SECURITY.md) and [execution evidence](STEP7_EXECUTION_REPORT.md).

## Architecture and verification

The npm lockfile resolves React 19.3.0, TypeScript 5.9.3, TanStack Router 1.170.46 / React Start 1.169.4 / start-server-core 1.169.45, Vite 8.3.6, Nitro 3.0.260603-beta, Supabase JS 2.117.1, Zod 4.6.7, Vitest 5.0.1 and Playwright 1.63.0. Bill processing uses OpenAI SDK 7.53.0, PDF.js 6.5.438 and Sharp 0.35.5. Keep the existing Step 3/4 calculation functions authoritative. Preserve LIVE/DEMO separation and the [CRM architecture](STEP5_CRM_ARCHITECTURE.md) / [database boundary](STEP5_DATABASE_SECURITY.md).

At the Step 7 implementation commit, `npm test` passes **182 cases**, with **33 opt-in skipped** (11 CRM database, 19 project database, 3 live bill-provider). Lint passes with zero errors and ten inherited warnings; types and client/Nitro SSR build pass. [CI run 42557763076](https://github.com/wavenoxx/wavenox/actions/runs/42557763076) passes both jobs: all 30 native database cases against disposable Supabase, 17 public/customer route checks, Step 6 desktop/mobile flows, LIVE CRM login/audit/logout, and Step 7 DEMO/LIVE staff/customer flows at five viewports. There are zero serious/critical axe findings in the Step 7 viewport checks; screenshots were visually inspected. Local Chromium cannot launch under this macOS sandbox; the user authorized GitHub Actions for that gate. Test transport stubs are not evidence of real OCR accuracy, and locally generated test OTPs do not prove SMTP delivery.

Runtime dependency audit reports zero vulnerabilities. The full audit has nine inherited moderate development-tool advisories, no high/critical; no dependencies changed in Step 7. The implementation's Vercel preview was observed READY, but protected runtime inspection is unverified and the resumed connector requires renewed team authorization. Do not equate CI, Vercel build status and production readiness.

## Release prerequisites

The user approved secure OpenAI key setup. Its local destination is ignored `.env.local`; never read its values into tool output, Git, browser code or documentation. A key alone does not activate processing: `BILL_AI_ENABLED=true` is also required. Live synthetic provider attempts returned HTTP 429, so real extraction remains unverified and production AI is inactive. Resolve provider access/quota, test representative bill accuracy, approve retention/disclosure and add distributed quotas/cost controls before activation.

Live CRM and the customer portal require separately approved migrations, staff/customer provisioning and environment configuration. Step 7 customer identity uses approved Supabase email OTP exchanged for a separate one-hour HttpOnly opaque session; active account and project membership are checked on each operation. Ten private tables and service-only RPCs preserve atomic audits. Private reviewed JPEG/PNG scans (up to 3 MiB) use authenticated server delivery, never public/signed bearer URLs. Customer-visible updates/support remain separate from internal notes.

Keep `PORTAL_EMAIL_ENABLED=false` until reviewed SMTP, code-only templates, short OTP expiry and real delivery are verified. Private bucket/policies, backups, record retention, session/rate cleanup, orphan-file reconciliation and abuse monitoring require operational provisioning. No malware scanner is configured; PDF/Office/HTML/SVG uploads are rejected. No production migration, accounts or records were changed. Production readiness also needs privacy, legal/financial, observability and release reviews. Roof structure, shading, wind loads, geometry and hosting approval require a physical survey.

## Safe continuation

1. Read [AGENTS.md](../AGENTS.md) and [Rules.md](../Rules.md), inspect the working tree, fetch and inspect branch history. Preserve all uncommitted work. Use reviewed commits and ordinary feature-branch pushes; never rewrite shared history.
2. Verify the prior stage's final SHA and PR status before selecting the next base. Do not restart from outdated main. Run unit, lint, type, build and browser gates. Separate mocked, real provider, database, browser and deployment evidence.
3. Use disposable local or expressly authorized staging database fixtures. Keep service credentials server-side and audited mutations transactional. Production migration, customer-data changes, provisioning, merge and production deployment each require explicit approval.
4. Keep bill documents ephemeral, disclose external processing, require human confirmation, and preserve customer overrides. Project documents are separately authorized private operational records with a reviewed retention process. Never invent readings, calibrated confidence, imagery capabilities, financial guarantees, project completion or approvals.
5. Preserve Lovable history, customer/staff session separation, ownership checks, audit transactions and explicit LIVE/DEMO mode. A lead reference is not authentication; contract_signed is not legal proof of a signed agreement. Never expose service credentials or use production customer records as fixtures.

## Remaining stages

- **Step 8:** production security, accessibility, performance, SEO, legal/financial disclosures, observability, domain readiness and approved release operations.

Step 7 code completion permits planning the separately scoped Step 8 after sign-off. It does not authorize merging, production services, migrations, provisioning or deployment. LIVE customer portal readiness and paid-traffic production readiness remain **NO**. Do not start Step 8 automatically.
