# Step 7 customer portal architecture

The approved foundation is main `9037b75ded4f11ba7505b2e6b82b5a4fdb4ae308`. Step 7 adds `/portal` and a Projects tab inside `/ops`; it retains TanStack Start, React, Supabase and all existing calculation/lead/CRM paths.

## Identity and request boundary

`project-runtime.ts` selects LIVE by default and DEMO only through the existing explicit lead-mode flag. LIVE requires server Supabase configuration; a missing database never falls back to fixtures. `project-http.ts` handles `/api/projects`, `/api/project-documents` and `/api/project-documents/:id` before SSR. Mutating requests require the same Origin, bounded bodies and strict Zod envelopes. Browser actor IDs and roles are not accepted.

Staff use the existing CRM cookie, verified Supabase Auth identity and active CRM membership. Owners activate projects, manage invitations/memberships, assign coordinators and change project state. Coordinators operate only projects assigned to them. Viewers receive restricted project summaries and cannot open project details, files or mutation paths.

Customers use approved email OTP through official Supabase `signInWithOtp` and `verifyOtp`. The server requires a confirmed email and real Auth session, then exchanges it for a random 256-bit opaque cookie. Only its SHA-256 hash is persisted. The separate `wavenox_portal_session` cookie is HttpOnly, SameSite=Lax, Secure in production, path `/`, one-hour TTL. Every private request checks database expiry/revocation, Auth account state and project membership. Any staff Auth identity is rejected as a customer identity. Logout revokes the stored hash; tokens are not kept in localStorage or exposed in JSON.

Owner approval is a 24-hour invitation row, not a bearer URL. Verified email matching consumes pending approvals once and atomically creates memberships/activity records. Multiple approved projects are supported. Revocation is effective on subsequent server authorization; it is not record deletion. `PORTAL_EMAIL_ENABLED=false` by default. Production activation requires reviewed SMTP and code-only templates using `{{ .Token }}` for applicable OTP emails, a short OTP expiry (at most ten minutes), provider rate limits and delivery verification. Unknown emails and provider send failures receive the same generic response; no delivery success is claimed. Application limits are database-backed and email keys are HMACs. Provider delivery monitoring and perimeter abuse controls remain operational prerequisites. [Official passwordless API](https://supabase.com/docs/guides/auth/auth-email-passwordless), [email templates](https://supabase.com/docs/guides/auth/auth-email-templates).

## Data and transactions

The additive migration creates projects, memberships, invitation approvals, sessions, milestones, appointments, document metadata, support, append-only activities and rate limits. All private table access is server-only. Project mutations lock the project row, check expected version, authorize the actor, execute the mutation and append its audit event in one transaction. Request IDs and payload hashes make identical retries idempotent and changed retries conflicts. Project creation separately locks the consultation and prevents duplicate projects.

The LIVE store calls PostgreSQL RPCs; the DEMO store is isolated process memory with synthetic identities and no external side effects. DEMO does not survive process restarts or provide shared multi-instance state. Customer DTOs explicitly select approved fields; staff notes, marketing attribution, consent provenance, contact evidence, membership emails and storage paths are excluded. The portal SSR response contains a public sign-in shell, never private project data. API/private-route responses are no-store/noindex; private routes are excluded from attribution capture.

## Documents and support

Only JPEG/PNG scans up to 3 MiB are accepted. Signature/dimension checks and Sharp decoding/re-encoding limit images to 24 megapixels and 3200px output edges, strip metadata and normalize to JPEG. Private immutable object keys are server-generated UUIDs. Upload precedes atomic metadata/audit registration; registration failure triggers compensating removal. A failed removal can leave an inaccessible private orphan requiring operational cleanup. No malware scanner is claimed; PDF, Office, SVG, HTML and executables are rejected.

The private bucket is checked on each operation. Customer downloads require active membership, customer visibility and reviewed status. Authenticated server delivery rechecks authorization after storage I/O and records a download request before returning bytes. No signed bearer URLs are issued, so there is no remaining signed-link lifetime after revocation. The audit records authorization/request, not proof of completed receipt. [Supabase private storage](https://supabase.com/docs/guides/storage/buckets/fundamentals).

Support requests are project-scoped, bounded and limited to five per hour per actor. Public responses and internal notes are separate fields. Resolution requires an actual public response. Portal updates do not send email/SMS/WhatsApp or claim technician assignment. No bill originals, AI extraction, telemetry, payments or contracts are generated by this stage.
