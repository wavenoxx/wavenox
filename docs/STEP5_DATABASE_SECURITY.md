# Step 5 database security

The public consultation form calls the validated TanStack lead-submission function. In LIVE mode its server-side Supabase client inserts the consultation. The CRM uses separate server functions that verify the Auth token with `auth.getUser`, look up the active staff row by Auth user ID, and check the requested operation. Password sign-in uses a request-local client so its session cannot replace the service identity used for database calls.

## Effective privileges

The v1 migration allowed public inserts and authenticated access. V2 removed those policies. The original Step 5 migration later granted authenticated staff direct table access through role-based RLS. A viewer could request raw columns and a writer could update rows or insert activities outside the application.

Apply the complete migration history in order, including the [forward hardening migration](../supabase/migrations/20261107000000_step5_server_only_audit.sql). The original Step 5 migration is preserved for installations that have already recorded it. The upgrade removes direct table privileges from PUBLIC, anon and authenticated, drops the staff-facing policies, the two obsolete membership helpers, and the old stage RPC signature. All five tables have enabled and forced RLS with default deny. Supabase's trusted service_role bypasses RLS and still requires SQL privileges.

| Table | Service-role privilege |
| --- | --- |
| consultations | SELECT, INSERT, UPDATE |
| crm_staff_members | SELECT and column UPDATE on is_active for membership row locks |
| crm_lead_activities | SELECT, INSERT |
| crm_followup_tasks | SELECT, INSERT, UPDATE |
| crm_privacy_requests | SELECT, INSERT |

The four CRM RPCs use invoker rights with an empty search path. Only the trusted service role receives EXECUTE among Data API roles. Helpers in crm_private lock the actor's active staff row and the target lead, and insert the audit entry. An existing trigger rejects audit updates and deletes. Another trigger protects the original customer notes, reference, source, creation time and consent provenance.

## Transactions

| RPC | Writes committed together |
| --- | --- |
| crm_transition_lead_stage | Validated stage edge, lifecycle fields, version and stage_changed event |
| crm_atomic_update_lead_with_audit | Ownership, allowed correction fields or qualification with an internal note, version and one event |
| crm_mutate_followup | Task creation, rescheduling or completion, earliest pending follow-up, confirmed contact time where applicable, version and one event |
| crm_log_privacy_request | Privacy register entry, applicable withdrawal flags, version and one event |

Every mutation requires the client's observed integer version. The database compares it after locking the lead. Replaying a successful request with its original version produces a conflict. The server takes the actor ID from verified membership, and SQL reads the display name and enforces role restrictions again. The transaction computes its audit state from the locked rows. An exception in the audit INSERT aborts the entire RPC.

A service credential is privileged and must stay in the trusted server environment. PostgreSQL owners and administrators remain trusted operators. Provision staff separately with an approved administrative process. See the [execution report](STEP5_EXECUTION_REPORT.md) for observed test results.
