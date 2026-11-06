# WAVENOX — Step 5 Database Security, RLS & DPDP Privacy Governance

## 1. Zero-Trust PostgreSQL & Supabase Access Model

Migration file: [`supabase/migrations/20261106_step5_crm_and_attribution.sql`](file:///Users/bunny/.gemini/antigravity/scratch/wavenox/supabase/migrations/20261106_step5_crm_and_attribution.sql)

### 1.1 Public & Anonymous Access Revocation
All CRM tables and operational functions are strictly off-limits to anonymous (`anon`) and unverified public callers:
- `REVOKE ALL ON TABLE public.consultations FROM PUBLIC, anon;`
- `REVOKE ALL ON TABLE public.crm_staff_members FROM PUBLIC, anon;`
- `REVOKE ALL ON TABLE public.crm_lead_activities FROM PUBLIC, anon;`
- `REVOKE ALL ON TABLE public.crm_followup_tasks FROM PUBLIC, anon;`
- `REVOKE ALL ON TABLE public.crm_privacy_requests FROM PUBLIC, anon;`
- `ALTER TABLE ... ENABLE ROW LEVEL SECURITY;` and `ALTER TABLE ... FORCE ROW LEVEL SECURITY;` on all five tables.

Inbound customer lead submissions never use client-side anonymous table inserts; they execute exclusively through the server-validated `submitLead` function (`src/functions/leads.ts`) using the server-side `service_role` key after Zod validation, honeypot filtering, sliding-window rate limiting, and DPDP consent checks.

---

## 2. `SECURITY DEFINER` Staff Role Verification Helpers

Being signed into Supabase Auth (`authenticated` role) is **never sufficient** to read or mutate WAVENOX CRM tables. Every RLS policy calls `SECURITY DEFINER` PostgreSQL functions (pinned to `SET search_path = public`) that verify active membership in `public.crm_staff_members`:

| Function | Logic |
| :--- | :--- |
| `public.crm_current_staff_role()` | Returns `role` from `public.crm_staff_members` where `auth_user_id = auth.uid()` and `is_active = true` (`NULL` otherwise). |
| `public.crm_is_active_staff()` | Returns `true` iff `crm_current_staff_role() IS NOT NULL`. |
| `public.crm_can_write_leads()` | Returns `true` iff `crm_current_staff_role() IN ('owner_admin', 'sales_coordinator')`. |
| `public.crm_is_owner_admin()` | Returns `true` iff `crm_current_staff_role() = 'owner_admin'`. |

---

## 3. Row-Level Security (RLS) Policy Summary

| Table | `SELECT` Policy | `INSERT` Policy | `UPDATE` Policy | `DELETE` Policy |
| :--- | :--- | :--- | :--- | :--- |
| `public.consultations` | `crm_is_active_staff()` | Server `service_role` only | `crm_can_write_leads()` | None (preserved for audit; governed via privacy workflow) |
| `public.crm_staff_members` | `crm_is_active_staff()` | `crm_is_owner_admin()` | `crm_is_owner_admin()` | `crm_is_owner_admin()` |
| `public.crm_lead_activities` | `crm_is_active_staff()` | `crm_can_write_leads()` | **Blocked by trigger** | **Blocked by trigger** |
| `public.crm_followup_tasks` | `crm_is_active_staff()` | `crm_can_write_leads()` | `crm_can_write_leads()` | None (tasks transition to `cancelled` or `completed`) |
| `public.crm_privacy_requests` | `crm_is_active_staff()` | `crm_can_write_leads()` | `crm_is_owner_admin()` | None (immutable compliance log) |

---

## 4. Append-Only Audit Log Guarantee (`public.crm_lead_activities`)

To guarantee tamper-evident operational history:
1. Trigger `trg_crm_lead_activities_immutable` executes `BEFORE UPDATE OR DELETE ON public.crm_lead_activities` and raises `SQLSTATE '55000'` (`crm_lead_activities is append-only; UPDATE and DELETE are prohibited`).
2. Every stage transition (`crm_transition_lead_stage`), owner assignment, priority change, internal staff note, follow-up task action, data correction, and privacy status change appends a structured record containing:
   - `lead_id`
   - `actor_staff_id` and `actor_label`
   - `activity_type`
   - `summary`
   - `before_state` (`JSONB` snapshot of changed fields before mutation)
   - `after_state` (`JSONB` snapshot of changed fields after mutation)
   - `created_at` (`TIMESTAMPTZ`)

---

## 5. Atomic Stage Transition RPC (`public.crm_transition_lead_stage`)

To prevent partial updates where a lead's `crm_stage` changes without an audit record (or vice versa), `public.crm_transition_lead_stage` executes inside a single PostgreSQL transaction:
1. Verifies caller permissions (`auth.role() = 'service_role' OR public.crm_can_write_leads()`).
2. Locks the target `public.consultations` row with `SELECT * ... FOR UPDATE`.
3. Validates optimistic concurrency (`p_expected_updated_at IS NULL OR v_lead.updated_at = p_expected_updated_at`, raising `40001` on mismatch).
4. Enforces mandatory reason strings when transitioning to `lost` (`p_lost_reason`) or `disqualified_duplicate` (`p_disqualified_reason`).
5. Updates `crm_stage`, lifecycle timestamps (`first_contacted_at`, `qualified_at`, `site_visit_scheduled_at`, `site_visit_completed_at`, `proposal_shared_at`, `closed_at`), and `updated_at`.
6. Inserts the corresponding `stage_changed` row into `public.crm_lead_activities`.

---

## 6. DPDP Act 2023 Customer Privacy Governance

- **Consent Provenance**: Every consultation record displays `consent_given`, `consent_version`, and `consent_at` in the Lead Detail drawer.
- **Original Customer Notes vs. Internal Staff Notes**: Customer-submitted `notes` are read-only in the CRM and visually separated from internal staff notes stored in `public.crm_lead_activities` (`activity_type = 'note_added'`).
- **Audited Data Corrections**: Corrections to customer name, phone, email, city, PIN code, DISCOM, or monthly bill require a non-empty `reason` and record both `before_state` and `after_state` in `public.crm_lead_activities` (`activity_type = 'data_corrected'`).
- **Consent Withdrawal & Deletion Requests**: `owner_admin` staff can log customer requests (`consent_withdrawal`, `deletion_request`, `data_correction`, `do_not_contact`) in `public.crm_privacy_requests`, automatically updating the lead's `do_not_contact` and `privacy_status` flags (`active`, `consent_withdrawn`, `deletion_requested`, `redacted`) and recording a `privacy_status_changed` audit event.
