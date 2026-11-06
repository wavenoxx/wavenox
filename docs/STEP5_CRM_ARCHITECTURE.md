# WAVENOX — Step 5 CRM Architecture & Sales Operations Guide

## 1. Executive Overview

Step 5 upgrades WAVENOX from an inbound lead-capture pipeline into a **private, role-governed, privacy-first internal CRM (`/ops`)** integrated with deterministic multi-touch campaign attribution.

The CRM architecture enforces three non-negotiable engineering boundaries:
1. **Zero Public Exposure of `/ops` or Customer PII**: All CRM reads and writes require verified server-side staff authentication (`src/server/crm-auth.ts`) and active directory membership in `public.crm_staff_members`. Unauthenticated requests to `/ops` render only the Staff Sign-In gate (`[data-testid="ops-login-gate"]`) with zero customer data in SSR HTML or client network responses.
2. **Client Bundle Isolation (`**/server/**`)**: All server-only secrets, Supabase service clients, HMAC demo tokens, and in-memory demo CRM state live exclusively inside `src/server/crm-auth.ts` and `src/server/crm-service.ts`. Client-imported server function wrappers (`src/functions/crm.ts` and `src/functions/leads.ts`) dynamically load `@/server/crm-service` only inside `createServerFn().handler(...)`.
3. **Honest Operational Analytics**: Dashboard metrics never fabricate pipeline revenue from preliminary solar estimates (`net_price_inr`) and explicitly report `"Ad spend not connected — ROAS unavailable."` until ad-network spend APIs are connected.

---

## 2. System Module Map

| Layer | File | Responsibility |
| :--- | :--- | :--- |
| **Database Schema & RLS** | `supabase/migrations/20261106_step5_crm_and_attribution.sql` | Additive `public.consultations` columns, `crm_staff_members`, append-only `crm_lead_activities`, `crm_followup_tasks`, `crm_privacy_requests`, `REVOKE ALL` from `anon`/`PUBLIC`, `SECURITY DEFINER` role checks, and atomic `crm_transition_lead_stage` RPC. |
| **Staff Auth & RBAC** | `src/server/crm-auth.ts` | Server-side session verification (`supabase.auth.getUser` + active `crm_staff_members` lookup in `LIVE` mode; HMAC-SHA256 signed demo tokens in explicit `LEAD_MODE="demo"`), token revocation registry on logout, RBAC permission matrix, and PII masking helpers (`maskPhoneNumber`, `maskEmailAddress`). |
| **CRM Server Engine** | `src/server/crm-service.ts` | Server-only execution engine (`executeListCrmLeads`, `executeGetCrmLeadDetail`, `executeTransitionCrmLeadStage`, `executeAssignCrmLeadOwner`, `executeAddCrmLeadNote`, `executeCreateCrmFollowupTask`, `executeCompleteCrmFollowupTask`, `executeRescheduleCrmFollowupTask`, `executeCorrectCrmLeadData`, `executeLogCrmPrivacyRequest`, `executeListCrmFollowupQueue`, `executeGetCrmDashboardMetrics`), Supabase adapter, and isolated `LEAD_MODE="demo"` store. |
| **Server Function Boundary** | `src/functions/crm.ts` | Serializable types, stage/priority metadata, `Asia/Kolkata` (`IST`) formatting and urgency helpers, `HttpOnly; SameSite=Lax; Path=/` cookie management, `Cache-Control: no-store, private` headers, and TanStack Start `createServerFn` endpoints. |
| **Attribution Engine** | `src/lib/telemetry.ts` | Client-side First-Touch (`localStorage`) + Last-Touch (`sessionStorage`) capture, URL PII query-parameter stripping, referrer domain extraction, and deterministic channel classification (`paid_search`, `paid_social`, `organic_search`, `referral`, `direct`, `unknown`). |
| **Lead Ingestion Bridge** | `src/functions/leads.ts` | Server-side re-sanitization of attribution fields, `v4 -> v3 -> v2` backward-compatible Supabase insert fallback, and automatic demo CRM registration in `LEAD_MODE="demo"`. |
| **Private `/ops` UI** | `src/routes/ops.tsx` | `noindex, nofollow` protected workspace with Staff Sign-In gate, Permission-Denied screen, 6 operational views (**Overview**, **All Leads**, **Pipeline**, **Follow-Ups**, **Attribution**, **Settings & Governance**), and slide-over **Lead Detail** inspector. |

---

## 3. Staff Role & Permission Matrix

Access is invite-only via `public.crm_staff_members`. There is no public staff sign-up endpoint.

| Capability / Permission | `owner_admin` | `sales_coordinator` | `read_only_viewer` | Deactivated / Unlisted User |
| :--- | :---: | :---: | :---: | :---: |
| Sign into `/ops` (`crm:read`) | Allowed | Allowed | Allowed | Denied (`401`/`403`) |
| View full unmasked customer phone & email (`crm:view_full_pii`) | Allowed | Allowed | **Masked** (`+9198******10`, `vi***@domain.com`) | Denied |
| Update sales stage & assign lead owner (`crm:write_lead`) | Allowed | Allowed | Denied (`403`) | Denied |
| Add internal staff notes (`crm:write_note`) | Allowed | Allowed | Denied (`403`) | Denied |
| Schedule, reschedule, or complete follow-up tasks (`crm:write_task`) | Allowed | Allowed | Denied (`403`) | Denied |
| Correct customer contact/project fields with audit reason (`crm:correct_data`) | Allowed | Allowed | Denied (`403`) | Denied |
| Log DPDP privacy withdrawal/deletion requests (`crm:manage_privacy`) | Allowed | Denied (`403`) | Denied (`403`) | Denied |
| Manage staff directory (`crm:manage_staff`) | Allowed | Denied (`403`) | Denied (`403`) | Denied |

---

## 4. Controlled Sales Stage Lifecycle

Every consultation lead progresses through 10 controlled operational stages (`crm_stage`):

| Stage Key | Label | Category | Operational Rule |
| :--- | :--- | :--- | :--- |
| `new` | New Enquiry | Open | Default stage on inbound submission (`sla_due_at = created_at + 4 hours`). |
| `contact_attempted` | Contact Attempted | Active | Sets `first_contacted_at` (if null) and updates `last_contacted_at`. |
| `qualified` | Qualified | Active | Sets `qualified_at` (if null); lead suitability and DISCOM/roof basics verified. |
| `site_assessment_scheduled` | Site Assessment Scheduled | Active | Sets `site_visit_scheduled_at`; structural/shadow engineering visit booked. |
| `site_assessment_completed` | Site Assessment Completed | Active | Sets `site_visit_completed_at`; physical terrace measurements recorded. |
| `proposal_shared` | Proposal Shared | Active | Sets `proposal_shared_at`; final engineered proposal shared with customer. |
| `negotiation_financing` | Negotiation / Financing | Active | Customer reviewing cash vs. SBI Surya Ghar / commercial tax shield options. |
| `won` | Won (Project Confirmed) | Closed | Sets `closed_at`; customer confirmed installation order. |
| `lost` | Lost | Closed | Sets `closed_at`; **requires non-empty `lost_reason`**. |
| `disqualified_duplicate` | Disqualified / Duplicate | Closed | Sets `closed_at`; **requires non-empty `disqualified_reason`**. |

### Optimistic Concurrency Control
Every stage transition accepts `expectedUpdatedAt`. If another staff member modified the lead in the interim, the server returns `HTTP 409 CONFLICT` rather than silently overwriting concurrent changes.

---

## 5. Follow-Up Tasks & `Asia/Kolkata` (`IST`) Timezone Rules

- **Storage**: All timestamps (`due_at`, `completed_at`, `created_at`, `sla_due_at`) are stored in PostgreSQL and demo memory as canonical UTC ISO-8601 strings (`TIMESTAMPTZ`).
- **Operational Display & Classification**: WAVENOX operates in India (`Asia/Kolkata`, `UTC+05:30`). Follow-up task urgency (`overdue`, `due_today`, `upcoming`, `completed`) is computed by comparing the current UTC timestamp against calendar day boundaries in `Asia/Kolkata` via `getIstDateKey()` and `classifyFollowupUrgency()`.
- **Audit Trail**: Creating, rescheduling, or completing a follow-up task writes an immutable event (`followup_created`, `followup_rescheduled`, `followup_completed`) to `public.crm_lead_activities`. Completing a task with `customerContactConfirmed = true` also updates the parent lead's `last_contacted_at`.
