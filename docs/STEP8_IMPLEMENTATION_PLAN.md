# Step 8 release audit implementation plan

Started 9 November 2026 from `04c115d8504155e654c1fe907113ecbf9253a3fc`, the verified merge of Step 7 PR #11 (merged 18:05:48 UTC). No newer main commit was present and the working tree was clean. Branch: `feat/wavenox-step8-production-release-audit`.

## Scope and acceptance

Preserve Steps 1–7, Lovable history, TanStack Start, Supabase, the authoritative solar engine and explicit LIVE/DEMO separation. Audit code and correct demonstrated defects; use only synthetic records in disposable databases. No production migration, account provisioning, customer mutation, service activation, merge or production deployment is authorized.

1. Trace public lead, staff, customer, bill and document boundaries; verify grants and mandatory audit transactions with native negative tests.
2. Review session revocation across server instances, safe logs, response headers and error paths; add independent regressions for confirmed defects.
3. Reconcile regulatory/financial citations with official sources. Preserve mathematics unless a material defect is demonstrated; qualify unverifiable claims.
4. Measure the production build using Lighthouse and Playwright at five requested sizes. Record lab LCP/CLS/TBT, distinguish field INP and real traffic, enforce practical budgets, and inspect screenshots.
5. Verify SSR metadata, canonical/sitemap consistency, private noindex, structured data, forms, keyboard access and accessibility.
6. Run full unit/lint/types/build/browser and native Supabase suites. Review focused dependency patches and client secret exposure.
7. Produce the security, performance, SEO/accessibility, readiness, deployment and incident-response package with actual evidence, owners and approval gates; commit/push and create a Draft PR.

## Baseline and external state

Local baseline: 182 unit tests pass, 33 opt-in skipped; lint has zero errors/ten inherited warnings; TypeScript and client/Nitro SSR build pass. Full npm audit: nine moderate development-tool advisories, no high/critical. Local Chromium has historically been sandbox-blocked; the approved GitHub Actions workflow will provide native/browser measurements if this persists.

Read-only Supabase discovery reports WAVENOX project `razcywkwnpgxgjbwdjdj` INACTIVE. Migration-history read timed out; no schema or operational setting is assumed verified. Vercel project inspection returns team-access 403; authorization was requested through its supported connection flow. These operational gaps do not authorize restoring the database or changing hosting settings.

## Initial findings requiring verification

- LIVE staff logout currently revokes a token only in a process-local set. Verify and fix acceptance by a fresh server instance.
- The inherited global error logger expands arbitrary error objects and causes. Replace production request diagnostics with bounded, allowlisted events if payload leakage is confirmed.
- Robots generation omits `/portal` and private API paths; sitemap lastmod is rebuilt from today's date rather than content changes.
- Source catalog contains a blanket DPDP compliance label and generic manufacturer/engineering citations; reconcile these against actual evidence.

All findings remain distinct from production activation. Final measured results and severity decisions belong in the execution and readiness reports.
