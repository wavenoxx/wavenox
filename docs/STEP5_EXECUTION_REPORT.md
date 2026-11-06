# Step 5 security hardening execution report

Work continued on [draft PR #9](https://github.com/wavenoxx/wavenox/pull/9), branch `feat/wavenox-step5-crm-attribution`, from [f1e7645](https://github.com/wavenoxx/wavenox/commit/f1e7645b366a448e99d3ac644c4f1df3f5af6750). The target main commit at intake was [14a45de](https://github.com/wavenoxx/wavenox/commit/14a45deec1468250239d6440d453e25769e3d0b5). The original checkout contained five modified files. Their changes were imported into an isolated branch checkout before validation.

## Changes

- The forward migration closes direct CRM table and RPC access for browser roles. The service authenticates the Auth user and checks active staff membership for each operation. Password login cannot change the identity of the database service client.
- Four service-only RPCs commit material changes and a mandatory audit together. The database locks staff and lead rows, checks the lead version, restricts protected fields and obtains audit actor labels from membership. See the [privilege and transaction tables](STEP5_DATABASE_SECURITY.md).
- npm resolves React Start 1.169.4 and a single start-server-core 1.169.45. The previous committed npm tree resolved 1.168.58 and 1.169.37 respectively. The obsolete Bun lockfile also contained vulnerable releases and was removed so automated installs use the verified npm lock. [GitHub advisory](https://github.com/advisories/GHSA-qx66-fv34-fjm8) · [Vendor release](https://tanstack.com/blog/tanstack-start-security-update-cve-2026-102989)

## Local evidence, 6 November 2026

| Gate | Inherited working tree | Hardened branch |
| --- | --- | --- |
| npm test | 114 passed | 113 passed. Eleven isolated-database cases run separately. A migration text assertion was replaced by runtime privilege tests. |
| npm run lint | One formatting error and ten warnings | Exit 0, ten existing warnings, copy lint passed |
| npx tsc --noEmit | Exit 0 | Exit 0 |
| npm run build | Client and Nitro SSR passed | Client and Nitro SSR passed. Private sentinel and privileged adapter code absent from public JS. |
| npm run test:e2e | Chromium launch blocked by macOS sandbox | Same local MachPortRendezvous permission denial before page execution |

A disposable PostgreSQL 18.6 WASM engine (PGlite) applied the complete migration chain. PostgREST 16.5 served actual loopback HTTP requests against those tables and functions. All eleven [integration cases](../scripts/step5-tests/live.test.ts) passed, including 144 table/RPC denials across anonymous, non-staff, inactive, viewer, coordinator and admin identities. Eight forced audit failures left the lead, audit history, tasks and privacy rows identical to their pre-operation state. The suite also exercised validated LIVE lead submission, legacy provenance, role-restricted reads, actor spoofing, duplicate replay, invalid stage and patch rejection, and loss of database connectivity.

The local role fixture signs synthetic JWTs. The native PostgreSQL/Supabase Auth and browser jobs are separate checks. The local WASM server serializes connections, so it verifies stale replay but cannot establish native concurrent transaction locking. The [CI workflow](../.github/workflows/step5-hardening.yml) starts a disposable Supabase stack, applies migrations locally, provisions synthetic identities, checks concurrent writes and runs the DEMO route audit and LIVE browser login. See the [PR checks](https://github.com/wavenoxx/wavenox/pull/9/checks) for results for each pushed revision.

## Release boundary

The historical [preview at f1e7645](https://vercel.com/wavenoxxs-projects/wavenox/GztZgpgz4x86Ku39aooFJap4Wucd) failed. Verify the exact new SHA's GitHub/Vercel status before sign-off. Production requires separately approved database migration, staff provisioning, environment review and release QA. This task authorizes feature-branch preview only.
