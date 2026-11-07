# WAVENOX project handoff

WAVENOX is a premium Indian full-service solar platform for residential and commercial customers. Preserve the brand, consent-based consultation flow, original attribution, India-specific engineering and financing assumptions, and the Design Studio customer journey.

## Foundation

Steps 1–4 delivered secure lead capture, the public showroom, energy and financial calculations, and the intelligent configurator. Step 4 is merged into [main at 14a45de](https://github.com/wavenoxx/wavenox/commit/14a45deec1468250239d6440d453e25769e3d0b5). Step 5 develops the private CRM and attribution on `feat/wavenox-step5-crm-attribution`. Its approved starting SHA is [f1e7645](https://github.com/wavenoxx/wavenox/commit/f1e7645b366a448e99d3ac644c4f1df3f5af6750). Verify the current head and check results on [draft PR #9](https://github.com/wavenoxx/wavenox/pull/9) before continuing.

The verified npm tree uses React 19.3.0, TypeScript 5.9.3, TanStack Router 1.170.46, React Start 1.169.4, Vite 8.3.0, Nitro 3.0.260603-beta, Supabase JS 2.117.1, Zod, Vitest 5.0.1 and Playwright 1.63.0. Preserve the LIVE/DEMO separation. Read the [application architecture](STEP5_CRM_ARCHITECTURE.md), [database boundary](STEP5_DATABASE_SECURITY.md) and [quality-gate record](STEP5_EXECUTION_REPORT.md).

Step 5 hardening is code complete at [b012902](https://github.com/wavenoxx/wavenox/commit/b01290267409670780c66cc2b317a77a684e888c). The [verification run](https://github.com/wavenoxx/wavenox/actions/runs/42259670455) passed the public/CRM Chromium audit, eleven native Supabase integration cases and the LIVE login/cookie/audit/replay/logout test. Vercel confirmed a successful preview for that SHA. The 7 November resumed local gates passed unit tests (113), lint, types and client/SSR build. Local Chromium is blocked by the macOS sandbox. Protected preview runtime access requires the appropriate Vercel team connection.

Production readiness requires approved migrations, verified staff provisioning, environment configuration, privacy and financial review, and release sign-off. Step 6 is ready for a separately approved development task. The original Antigravity checkout's inherited changes were preserved in place, while Codex committed and pushed from an isolated checkout.

## Safe continuation

1. Read [AGENTS.md](../AGENTS.md) and [Rules.md](../Rules.md), inspect the working tree, fetch and inspect branch history. Preserve uncommitted work. Use ordinary reviewed commits and fast-forward pushes to the existing draft PR.
2. Run the five quality gates from the execution report. Separate mocked, real Data API, native concurrent database, browser and deployment evidence.
3. Use only disposable local or expressly authorized staging fixtures for database and authentication tests. Keep service credentials server-side. Production migration, data mutation, staff provisioning, merge and production deployment each require separate approval.

## Remaining roadmap

- **Step 6** requires separate development sign-off. Build consented bill and roof intelligence with confidence reporting, source imagery where relevant, and human correction.
- **Step 7** covers authenticated installation milestones, surveys, documents, support and consent-safe customer notifications.
- **Step 8** covers production security, accessibility, performance, SEO, legal and financial disclosures, observability, domain readiness and approved release operations.

## Step 6 continuation (7 November 2026)

Step 5 PR #9 is now merged at main 97dd875; its tree matches approved SHA 665a2b59529de2ebe2e99bde68a3f89cc02dd9ee. Step 6 develops on `feat/wavenox-step6-ai-bill-roof-intelligence`, targeting main. Read [the Step 6 plan](STEP6_IMPLEMENTATION_PLAN.md), [bill architecture](STEP6_AI_BILL_ARCHITECTURE.md), [roof scope](STEP6_ROOF_INTELLIGENCE.md), [privacy boundary](STEP6_PRIVACY_SECURITY.md), and [execution evidence](STEP6_EXECUTION_REPORT.md).

The existing Studio now supports local bill previews/redaction, a server-only OpenAI adapter, explicit review/confirmation, safe manual fallback and measured rectangle/L-shape roof inputs. Original documents are ephemeral; no database document storage or automatic CRM insertion was added. No satellite service or customer imagery measurement is configured. Existing financial engines and transactional CRM boundaries remain authoritative.

Local unit, lint, types and build gates pass. Browser/native database evidence must be verified on the Step 6 PR checks. Live synthetic provider verification returned HTTP 429 and is not claimed successful. Production activation requires quota/access, representative provider tests, retention review and distributed cost/abuse controls. The ignored local key must never enter Git, client bundles, logs or documentation. Step 7 and Step 8 remain separately scoped work; nothing here authorizes production deployment or migration.
