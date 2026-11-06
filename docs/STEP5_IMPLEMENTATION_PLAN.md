# WAVENOX — STEP 5 IMPLEMENTATION PLAN
## Private CRM, Lead Intelligence, Campaign Attribution & Sales Operations

**Branch:** `feat/wavenox-step5-crm-attribution`  
**Base Branch:** `main` (`14a45deec1468250239d6440d453e25769e3d0b5`, containing Step 4 commit `ff0043698520bf5d88bb6f6bd2fe8235c0d450c0`)  
**Date:** 2026-11-06

---

## 1. Baseline Repository Audit

### 1.1 Existing Database Schema (`public.consultations`)
Audited across the three existing repository migrations:
1. [`supabase/migrations/20260923_consultations.sql`](file:///Users/bunny/.gemini/antigravity/scratch/wavenox/supabase/migrations/20260923_consultations.sql) (Migration v1):
   - Created `public.consultations` with `id`, `created_at`, `client_name`, `phone`, `city`, `property_tier`, `roof_area_sqft`, `estimated_capacity_kw`, `estimated_savings_inr`, `battery_tier`, `notes`, `status`, `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`, `landing_url`, `referrer`, `client_ip_hash`, `owner_notified_at`, `whatsapp_dispatched`.
   - Contained early permissive RLS policies (`"Public can submit VIP solar consultations"` and `"Admins have full access to consultation records"` using `auth.role() = 'authenticated'`).
   - Installed `trg_check_recent_submission` (60-second duplicate submission guard per phone).
2. [`supabase/migrations/20260924_consultations_v2.sql`](file:///Users/bunny/.gemini/antigravity/scratch/wavenox/supabase/migrations/20260924_consultations_v2.sql) (Migration v2):
   - Added `reference_code` (`NOT NULL UNIQUE`), `pin_code`, `discom_code`, `monthly_bill_inr`, `system_kw`, `battery_units`, `net_price_inr`, `source`, `consent_given`, `consent_version`, `consent_at`.
   - Constrained `property_tier` to `('villa', 'independent_home', 'commercial')`.
   - Constrained `status` to `('new', 'contacted', 'qualified', 'survey_booked', 'quoted', 'contract_signed', 'installed', 'archived')`.
   - Constrained `source` to `('drawer', 'studio', 'enterprise')`.
   - **Zero-Trust RLS Hardening**: Enabled RLS on `public.consultations` and dropped all public/authenticated RLS policies (`"Public can submit VIP solar consultations"`, `"Admins have full access to consultation records"`, `"Public can insert consultations"`), requiring all access to go through server-side functions.
3. [`supabase/migrations/20260926_consultations_v3.sql`](file:///Users/bunny/.gemini/antigravity/scratch/wavenox/supabase/migrations/20260926_consultations_v3.sql) (Migration v3):
   - Added `company_name` and `company_url`.
   - Expanded `consultations_source_check` to `('drawer', 'studio', 'enterprise', 'net_metering', 'architects')`.

### 1.2 Lead Submission Entry Points
All 5 public lead entry surfaces route through [`submitLead`](file:///Users/bunny/.gemini/antigravity/scratch/wavenox/src/functions/leads.ts#L772-L779) (`processLeadSubmission`):
1. [`src/components/ConsultationDrawer.tsx`](file:///Users/bunny/.gemini/antigravity/scratch/wavenox/src/components/ConsultationDrawer.tsx): Global modal drawer (`source: "drawer"`).
2. [`src/components/SystemConfigurator.tsx`](file:///Users/bunny/.gemini/antigravity/scratch/wavenox/src/components/SystemConfigurator.tsx): `/deploy` Design Studio (`source: "studio"`).
3. [`src/routes/enterprise.tsx`](file:///Users/bunny/.gemini/antigravity/scratch/wavenox/src/routes/enterprise.tsx): Commercial & Industrial assessment form (`source: "enterprise"`).
4. [`src/routes/net-metering.tsx`](file:///Users/bunny/.gemini/antigravity/scratch/wavenox/src/routes/net-metering.tsx): DISCOM feeder feasibility check (`source: "net_metering"`).
5. [`src/routes/architects.tsx`](file:///Users/bunny/.gemini/antigravity/scratch/wavenox/src/routes/architects.tsx): Architectural studio registration (`source: "architects"`).

### 1.3 Existing Attribution & Privacy Behavior
- [`src/lib/telemetry.ts`](file:///Users/bunny/.gemini/antigravity/scratch/wavenox/src/lib/telemetry.ts) currently stores first-touch `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`, `landing_url` (raw `window.location.href`), and `referrer` in `sessionStorage` (`wavenox_attribution_v1`).
- **Identified Gaps**:
  1. `window.location.href` is stored raw without stripping potential PII query parameters (e.g., `phone`, `email`, `name`, `token`) or bounding lengths.
  2. Only session first-touch is stored; there is no distinction between **First Touch**, **Last Touch**, **Conversion Touch**, and deterministic **Channel Classification** (`paid_search`, `paid_social`, `organic_search`, `referral`, `direct`, `unknown`).
  3. Subsequent campaign interactions within a session do not update Last Touch.

### 1.4 Existing Authorization & CRM Status
- There is currently **no** staff authentication, staff membership table, role-based access control, follow-up task table, immutable CRM audit history table, or internal `/ops` CRM interface.
- [`src/server/supabase.ts`](file:///Users/bunny/.gemini/antigravity/scratch/wavenox/src/server/supabase.ts) provides `getServerSupabaseClient()` using `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.
- [`src/start.ts`](file:///Users/bunny/.gemini/antigravity/scratch/wavenox/src/start.ts) enforces `createCsrfMiddleware` on all TanStack Start `serverFn` calls.

---

## 2. Step 5 Architecture & Implementation Plan

### Phase A — Additive CRM & Attribution Database Migration
Create [`supabase/migrations/20261106_step5_crm_and_attribution.sql`](file:///Users/bunny/.gemini/antigravity/scratch/wavenox/supabase/migrations/20261106_step5_crm_and_attribution.sql):
1. **`public.crm_staff_members`**:
   - Invite-only staff allowlist bound to `auth.users(id)` (`auth_user_id UUID NOT NULL UNIQUE`), `email`, `full_name`, `role IN ('owner_admin', 'sales_coordinator', 'read_only_viewer')`, `is_active BOOLEAN`.
2. **Additive Extensions to `public.consultations`**:
   - Ownership & workflow columns: `email`, `assigned_staff_id`, `next_followup_at`, `last_contacted_at`, `qualified_at`, `qualification_outcome`, `disqualification_reason`, `stage_updated_at`, `last_activity_at`, `crm_version`.
   - Multi-touch attribution columns: `first_touch_source`, `first_touch_medium`, `first_touch_campaign`, `first_touch_landing_path`, `first_touch_referrer_domain`, `first_touch_at`, `last_touch_source`, `last_touch_medium`, `last_touch_campaign`, `last_touch_landing_path`, `last_touch_referrer_domain`, `last_touch_at`, `attribution_channel`, `click_id_type`, `click_id_value`.
   - Privacy & retention columns: `retention_category`, `consent_withdrawn_at`, `do_not_contact`.
3. **`public.crm_lead_activities`**:
   - Append-only audit log (`lead_id`, `actor_staff_id`, `actor_label`, `action_type`, `note_body`, `before_state`, `after_state`, `reason`, `created_at`) protected by a `BEFORE UPDATE OR DELETE` immutability trigger.
4. **`public.crm_followup_tasks`**:
   - Follow-up tasks (`lead_id`, `assigned_staff_id`, `created_by_staff_id`, `task_type`, `status`, `due_at` in UTC, `summary`, `completed_at`, `completion_note`).
5. **`public.crm_privacy_requests`**:
   - Restricted register for DPDP Data Principal requests (`access`, `correction`, `erasure`, `consent_withdrawal`).
6. **Restrictive Grants, Explicit RLS Policies & Atomic RPCs**:
   - `REVOKE ALL` from `PUBLIC` and `anon` on all CRM tables.
   - `SECURITY DEFINER` helper `public.get_active_crm_staff_role()` checking `public.crm_staff_members` where `auth_user_id = auth.uid() AND is_active = true`.
   - Role-scoped RLS policies on `consultations`, `crm_staff_members`, `crm_lead_activities`, `crm_followup_tasks`, and `crm_privacy_requests`.
   - Atomic PL/pgSQL transaction functions for stage transitions, owner assignment, note creation, and follow-up task completion.

### Phase B — Privacy-Conscious Marketing Attribution Engine
Upgrade [`src/lib/telemetry.ts`](file:///Users/bunny/.gemini/antigravity/scratch/wavenox/src/lib/telemetry.ts) and add [`src/lib/telemetry.test.ts`](file:///Users/bunny/.gemini/antigravity/scratch/wavenox/src/lib/telemetry.test.ts):
- Sanitize landing URLs to strip PII query parameters (`email`, `phone`, `name`, `token`, `code`, `pin`, `usc`, or values matching email/phone patterns) and persist clean landing paths + allowlisted campaign parameters (`utm_*`, `gclid`, `gbraid`, `wbraid`, `fbclid`).
- Maintain distinct **First Touch**, **Last Touch**, **Conversion Touch**, and **Original Lead Source** (`drawer`, `studio`, `enterprise`, `net_metering`, `architects`).
- Implement deterministic channel classification (`paid_search`, `paid_social`, `organic_search`, `referral`, `direct`, `unknown`) without guessing paid traffic from organic search/social referrers.
- Update [`src/functions/leads.ts`](file:///Users/bunny/.gemini/antigravity/scratch/wavenox/src/functions/leads.ts) to validate, sanitize, and persist multi-touch attribution with full backward compatibility when targeting pre-Step-5 schemas.

### Phase C — Staff Authentication, Role Authorization & CRM Server Functions
Create [`src/server/crm-auth.ts`](file:///Users/bunny/.gemini/antigravity/scratch/wavenox/src/server/crm-auth.ts) and [`src/functions/crm.ts`](file:///Users/bunny/.gemini/antigravity/scratch/wavenox/src/functions/crm.ts):
- Enforce server-side staff authentication (`supabase.auth.getUser(token)` + active `crm_staff_members` verification in LIVE mode; isolated HMAC-signed demo persona sessions only when `LEAD_MODE="demo"`).
- Set `HttpOnly; SameSite=Lax; Path=/` session cookies and `Cache-Control: no-store, private` headers.
- Enforce strict per-operation role permissions (`owner_admin`, `sales_coordinator`, `read_only_viewer`).
- Implement server-validated stage transitions, optimistic concurrency checks (`crm_version`), owner assignment validation, separate staff notes, follow-up task scheduling/completion, controlled data correction logging, privacy request logging, and honest operational metrics.

### Phase D — Private `/ops` CRM Workspace UI
Create [`src/routes/ops.tsx`](file:///Users/bunny/.gemini/antigravity/scratch/wavenox/src/routes/ops.tsx):
- Protected `/ops` route (`noindex, nofollow` + `Disallow: /ops` in `robots.txt`).
- Staff Sign-In gate, Permission-Denied screen, and 6 operational views (**Overview**, **All Leads**, **Pipeline**, **Follow-Ups**, **Attribution**, **Settings & Governance**) + slide-over **Lead Detail** inspector.
- Display all timestamps in `Asia/Kolkata` (`IST`), display missing values as `"Not provided"`, mask phone numbers in summary lists, and enforce role-based UI + server controls.

### Phase E — Comprehensive Unit, Security, Browser E2E & Visual QA
- Add [`src/lib/telemetry.test.ts`](file:///Users/bunny/.gemini/antigravity/scratch/wavenox/src/lib/telemetry.test.ts) and [`src/functions/crm.test.ts`](file:///Users/bunny/.gemini/antigravity/scratch/wavenox/src/functions/crm.test.ts) covering all positive and negative authentication, authorization, role escalation, stage transition, concurrency, follow-up, attribution, privacy, and migration policy checks.
- Extend [`scripts/run-e2e-audit.mjs`](file:///Users/bunny/.gemini/antigravity/scratch/wavenox/scripts/run-e2e-audit.mjs) to test `/ops` unauthenticated denial, staff sign-in, live demo lead persistence into CRM, stage update, follow-up creation, overdue filtering, attribution reporting, viewer role restriction, and logout.
- Capture and inspect screenshots across `320×720`, `390×844`, `768×1024`, `1024×768`, and `1440×900`.
