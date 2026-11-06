# WAVENOX — STEP 5 EXECUTION REPORT

## 1. Executive Summary
Step 5 upgrades WAVENOX's inbound consultation pipeline into a **private, role-governed, privacy-first internal CRM (`/ops`)** with **deterministic multi-touch marketing attribution** and **auditable sales operations**.

Key capabilities delivered:
1. **Zero-Trust Staff Authentication & RBAC (`src/server/crm-auth.ts`)**: Invite-only access (`owner_admin`, `sales_coordinator`, `read_only_viewer`) verified server-side against `public.crm_staff_members`, with automatic PII masking (`+91 98•••• ••10`, `vi•••@domain.com`) for `read_only_viewer` and immediate denial (`401`/`403`) for unauthenticated or deactivated accounts.
2. **PostgreSQL & Supabase Security Hardening (`supabase/migrations/20261106_step5_crm_and_attribution.sql`)**: Explicit `REVOKE ALL` from `PUBLIC` and `anon`, `ENABLE` + `FORCE ROW LEVEL SECURITY` on all CRM tables, `SECURITY DEFINER` staff-role helpers, an append-only audit trigger (`trg_prevent_crm_activity_mutation`) on `public.crm_lead_activities`, and an atomic PostgreSQL RPC (`public.crm_transition_lead_stage`) with optimistic concurrency control.
3. **Privacy-First Multi-Touch Attribution (`src/lib/telemetry.ts`)**: Captures First Touch (`localStorage`), Last Touch (`sessionStorage`), and Conversion Touch (`getLeadAttributionPayload()`), strips PII query parameters (`phone`, `email`, `name`, `pin`, `usc`, `token`) client- and server-side, preserves `first_touch_*` across internal SPA navigation, and deterministically classifies channels (`paid_search`, `paid_social`, `organic_search`, `referral`, `direct`, `unknown`).
4. **Operational CRM Workspace (`src/routes/ops.tsx`)**: Protected `/ops` route (`noindex, nofollow, noarchive` + `Disallow: /ops` in `robots.txt`) with 6 views (**Overview**, **All Leads**, **Pipeline**, **Follow-Ups**, **Attribution**, **Settings & Governance**) and a slide-over **Lead Detail** inspector displaying timestamps in `Asia/Kolkata` (`IST`), `"Not provided"` for null fields, and `"Ad spend not connected — ROAS unavailable."`.

---

## 2. Repository & Lead Pipeline Audit

| Component | Pre-Step 5 State | Step 5 Upgrade |
| :--- | :--- | :--- |
| `public.consultations` | Captured lead contact, preliminary solar config, single-touch UTMs, and basic `status` (`new`..`archived`). | Extended with multi-touch attribution (`first_touch_*`, `last_touch_*`, `conversion_path`, `attribution_channel`, `click_id_*`), lifecycle timestamps, `crm_version` concurrency counter, and DPDP governance flags (`do_not_contact`, `retention_category`). |
| `src/lib/telemetry.ts` | Single-session `sessionStorage` UTM capture; did not strip PII query params or separate First vs. Last touch. | Full 3-layer First-Touch / Last-Touch / Conversion-Touch engine with URL PII stripping, referrer domain normalization, and deterministic channel classification. |
| `src/functions/leads.ts` | Validated and persisted inbound leads with `v3 -> v2` schema fallback. | Re-sanitizes multi-touch attribution server-side, adds `v4 -> v3 -> v2` backward-compatible Supabase schema fallback, and registers explicit `LEAD_MODE="demo"` leads into the isolated demo CRM store. |
| `/ops` Route | Did not exist. | Full invite-only staff CRM workspace (`src/routes/ops.tsx`) backed by `src/functions/crm.ts` and `src/server/crm-service.ts`. |

---

## 3. Staff Authentication & Authorization Architecture

- **Verification Path**:
  - **LIVE Mode**: Verifies Bearer/cookie session token via `supabase.auth.getUser(token)`, then queries `public.crm_staff_members` for an active record (`is_active = true`) matching `auth_user_id` or normalized email. Fails closed (`503`) if `SUPABASE_URL` or `SUPABASE_SERVICE_ROLE_KEY` is missing.
  - **Explicit DEMO Mode (`LEAD_MODE="demo"`)**: Issues HMAC-SHA256 signed demo tokens bound to provisioned demo staff personas (`owner_admin`, `sales_coordinator`, `read_only_viewer`, plus a deactivated coordinator for negative testing).
- **Cookie & Cache Hardening**:
  - Session cookie `wavenox_crm_session` is set with `HttpOnly; SameSite=Lax; Path=/` (plus `Secure` in production).
  - All CRM server responses attach `Cache-Control: no-store, no-cache, must-revalidate, private`.
  - Signing out revokes the active token in the server revocation registry (`revokeCrmSessionToken`) and clears the cookie.

---

## 4. Database Schema & RLS Security Design

Migration: [`supabase/migrations/20261106_step5_crm_and_attribution.sql`](file:///Users/bunny/.gemini/antigravity/scratch/wavenox/supabase/migrations/20261106_step5_crm_and_attribution.sql)

- **Tables**:
  1. `public.consultations` (additive Step 5 columns + composite operational indexes)
  2. `public.crm_staff_members` (invite-only staff directory & roles)
  3. `public.crm_lead_activities` (immutable append-only audit log guarded by `BEFORE UPDATE OR DELETE` trigger `trg_prevent_crm_activity_mutation`)
  4. `public.crm_followup_tasks` (UTC-stored follow-up queue with completion notes and reschedule count)
  5. `public.crm_privacy_requests` (DPDP Data Principal request register)
- **RLS & Grants**:
  - `REVOKE ALL` on all CRM tables and functions from `PUBLIC` and `anon`.
  - `FORCE ROW LEVEL SECURITY` enabled on all 5 tables.
  - All policies verify active staff status via `SECURITY DEFINER` helpers (`crm_is_active_staff()`, `crm_can_write_leads()`, `crm_is_owner_admin()`).

---

## 5. Multi-Touch Marketing Attribution Engine

Implemented in [`src/lib/telemetry.ts`](file:///Users/bunny/.gemini/antigravity/scratch/wavenox/src/lib/telemetry.ts) and tested in [`src/lib/telemetry.test.ts`](file:///Users/bunny/.gemini/antigravity/scratch/wavenox/src/lib/telemetry.test.ts):
- **First Touch (`wavenox_attr_first_v2`)**: Persisted in `localStorage` on initial landing and never overwritten by internal SPA navigation.
- **Last Touch (`wavenox_attr_last_v2`)**: Persisted in `sessionStorage` and updated only when explicit campaign parameters (`utm_*` or click IDs) are present.
- **Original Lead Source Preserved**: `source` (`studio`, `drawer`, `enterprise`, `net_metering`, `architects`) is never overwritten by marketing channel classification.
- **PII Stripping**: Query parameters such as `phone`, `email`, `name`, `pin`, `usc`, `token`, and values matching phone/email/PIN regex patterns are stripped from `landing_url`, `first_touch_landing_path`, `last_touch_landing_path`, and `conversion_path`.

---

## 6. Lead Lifecycle & Sales Stage Model

- **Stages**: `new`, `contacted`, `qualified`, `survey_booked`, `quoted`, `contract_signed`, `installed`, `archived`.
- **Transition Rules**:
  - Controlled state graph (`ALLOWED_STAGE_TRANSITIONS`) prevents invalid jumps.
  - Mandatory operational reason required for `quoted`, `contract_signed`, `installed`, and `archived`.
  - Only `owner_admin` can restore a lead from `archived` (with `restoreArchived = true`).
  - Optimistic concurrency (`expectedVersion` / `crm_version`) returns `409 CONFLICT` on concurrent edits.

---

## 7. Follow-Up Task & SLA Operations

- **Timezone Accuracy**: Stored as UTC ISO-8601 (`TIMESTAMPTZ`), evaluated and displayed in `Asia/Kolkata` (`IST`, `UTC+05:30`).
- **Urgency Buckets**: `overdue` (due date/time in the past or prior IST calendar date), `due_today` (due later today in IST), `upcoming` (future IST date), and `completed`.
- **Audit Integration**: Creating, rescheduling, or completing a task records an immutable event in `crm_lead_activities` and optionally updates the parent lead's `last_contacted_at`.

---

## 8. Customer Privacy & Audit Trail Controls

- **Role-Based PII Masking**: `read_only_viewer` receives masked phone (`+91 98•••• ••10`), masked email (`vi•••@domain.com`), and masked customer notes from the server.
- **Separation of Notes**: Customer-submitted `notes` are read-only; staff notes are appended as `note_added` events in `crm_lead_activities`.
- **Audited Corrections & DPDP Requests**: Corrections require a mandatory reason (`min 5 chars`) and log `before_state` and `after_state`. `owner_admin` can log DPDP `access`, `correction`, `erasure`, and `consent_withdrawal` requests, automatically activating `do_not_contact` when consent is withdrawn.

---

## 9. `/ops` CRM User Experience & Accessibility

- **Route**: [`src/routes/ops.tsx`](file:///Users/bunny/.gemini/antigravity/scratch/wavenox/src/routes/ops.tsx)
- **Search Engine Exclusion**: `<meta name="robots" content="noindex, nofollow, noarchive">` on `/ops` + `Disallow: /ops` in `public/robots.txt` (generated by `scripts/generate-sitemap.mjs`).
- **Responsive Design**: Desktop table (`lg+`) and mobile/tablet cards (`<lg`) verified with zero horizontal overflow across `320×720`, `390×844`, `768×1024`, `1024×768`, and `1440×900`.

---

## 10. Operational Analytics & Honest Reporting

- **Pipeline Counts & Conversion Rates**: Computes factual stage counts, qualification rate (`qualifiedRatePct`), site survey booking rate (`surveyConversionPct`), and signed/installed conversion rate (`contractConversionPct`).
- **Honest Financial Disclosures**:
  - Never fabricates pipeline revenue from indicative configurator estimates (`net_price_inr`).
  - Explicitly displays `"Ad spend not connected — ROAS unavailable."` in both the Overview and Attribution views.

---

## 11. Automated Unit, Integration, Security & E2E Test Matrix

| Suite | File | Tests | Coverage |
| :--- | :--- | :---: | :--- |
| Marketing Attribution | `src/lib/telemetry.test.ts` | 7 | First/Last/Conversion touch, SPA navigation preservation, PII stripping, channel classification. |
| CRM Auth, RBAC & Operations | `src/functions/crm.test.ts` | 24 | Unauthenticated/deactivated/unlisted denial, `read_only_viewer` PII masking & write blocking, stage transitions, `409` concurrency, notes, IST follow-up urgency, honest metrics, DPDP privacy requests, SQL migration RLS verification. |
| Lead Submission Pipeline | `src/functions/leads.test.ts` | 22 | Validation, honeypot, rate limiting, `v4 -> v3 -> v2` schema fallback, server-side attribution sanitization. |
| Solar, Regulatory & Brand | `src/config/*.test.ts`, `src/lib/suncalc.test.ts` | 59 | All Step 1–4 engineering and financial suites. |
| Browser E2E & Accessibility | `scripts/run-e2e-audit.mjs` | 17 routes + Step 5 `/ops` | Status 200, Axe WCAG 2.1 AA, zero sub-12px text, zero console errors, `/ops` auth gate, 403 deactivated denial, viewer PII masking, lead search, stage update, staff note, and 5-viewport zero overflow. |

---

## 12. Visual QA & Responsive Inspection Summary

All 19 screenshots captured and inspected in `qa-step5/`:
- `01-login-gate-desktop-1440x900.png` & `01-login-gate-mobile-390x844.png`
- `02-permission-denied-403-desktop-1440x900.png`
- `03-readonly-viewer-masked-pii-desktop-1440x900.png`
- `04-overview-desktop-1440x900.png` & `04-overview-mobile-390x844.png`
- `05-all-leads-desktop-1440x900.png`, `05-all-leads-landscape-1024x768.png`, `05-all-leads-tablet-768x1024.png`, `05-all-leads-mobile-390x844.png`, `05-all-leads-narrow-320x720.png`
- `06-pipeline-desktop-1440x900.png` & `06-pipeline-mobile-390x844.png`
- `07-followups-desktop-1440x900.png` & `07-followups-mobile-390x844.png`
- `08-attribution-desktop-1440x900.png` & `08-attribution-mobile-390x844.png`
- `09-governance-desktop-1440x900.png`
- `10-lead-detail-drawer-desktop-1440x900.png` & `10-lead-detail-drawer-mobile-390x844.png`

---

## 13. Known Limitations & Operational Prerequisites

1. **Supabase Migration Execution**: Before enabling `/ops` in production (`LEAD_MODE="live"`), apply `supabase/migrations/20261106_step5_crm_and_attribution.sql` and provision initial staff records in `public.crm_staff_members`.
2. **Ad Network Spend Integration**: ROAS is intentionally marked `"Ad spend not connected — ROAS unavailable."` until Google Ads / Meta Ads spend APIs are connected in a future marketing-ops integration.
3. **Contracted Invoice Ledger**: Preliminary solar estimates (`net_price_inr`) are displayed per lead for engineering context only; formal contracted order value tracking belongs to post-survey ERP/invoicing workflows.
