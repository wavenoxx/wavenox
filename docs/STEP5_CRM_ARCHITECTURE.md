# Private CRM architecture

The 17 public routes include the consultation and Design Studio flows. The internal workspace is `/ops`. Its Overview, All Leads, Pipeline, Follow-Ups, Attribution, and Settings & Governance views use TanStack server functions. The server selects LIVE or the isolated in-memory DEMO store. LIVE is the default.

## Staff sessions and access

| Staff identity | Application access |
| --- | --- |
| Active owner/admin | Full lead detail, all assignments, archive restoration, corrections, task management, privacy requests and reports |
| Active sales coordinator | Full detail and corrections, permitted stage changes, claiming for self, internal notes and own follow-ups |
| Active read-only viewer | Restricted summaries, masked phone/email, redacted detail, operational task metadata and aggregate reports |
| Missing, unlisted or inactive identity | Access denied |

The session cookie is HttpOnly, SameSite=Lax and Secure in production. The server looks up active membership per operation. Viewer responses redact names, PINs, original consent details, notes, audit snapshots and task free text. Phone and customer-name search predicates are restricted to roles with unmasked access. Staff provisioning is an administrative database operation.

## Pipeline and mutations

The eight `consultations.status` values are `new`, `contacted`, `qualified`, `survey_booked`, `quoted`, `contract_signed`, `installed`, and `archived`. The transition map permits only specified edges. Quotation, contract, installation and archive transitions require evidence text. An archive restore requires both the explicit restore flag and owner/admin permission.

The UI submits the observed `crm_version` for every change, including notes and tasks. The LIVE adapter performs one RPC per mutation. The RPC commits the relevant lead, task or privacy changes and the corresponding audit event together. Conflicting edits return 409 and require a refresh. Staff notes are distinct from the original customer submission. Follow-up times use TIMESTAMPTZ and display in Asia/Kolkata. Only a confirmed contact updates the contact time on task completion.

## Attribution and reporting

The existing telemetry implementation stores the first and latest eligible touch for the browser session in sessionStorage and sanitizes attribution again on submission. Reports include lead source, campaign, channel and stage counts. Spend and contracted revenue have no connected ledger. The current LIVE list and reporting implementation reads up to 1,000 recent consultations.

[CRM server functions](../src/functions/crm.ts) · [Role matrix](../src/server/crm-auth.ts) · [LIVE and DEMO operations](../src/server/crm-service.ts) · [Telemetry](../src/lib/telemetry.ts) · [Database security](STEP5_DATABASE_SECURITY.md)
