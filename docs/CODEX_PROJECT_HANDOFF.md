# WAVENOX project handoff

Updated 7 November 2026. WAVENOX is a premium Indian full-service solar platform for residential and commercial customers. Preserve its brand, consent-based consultation flow, original attribution, India-specific engineering and financing assumptions, and Design Studio journey.

## Verified foundation and roadmap

Steps 1–4 delivered secure lead capture, the public showroom, energy/financial calculations and the intelligent configurator. Step 5 delivered private CRM, attribution, server-only database permissions and atomic audited mutations. [PR #9](https://github.com/wavenoxx/wavenox/pull/9) was already merged when Step 6 began. Its approved foundation is [665a2b5](https://github.com/wavenoxx/wavenox/commit/665a2b59529de2ebe2e99bde68a3f89cc02dd9ee); the Step 6 base [97dd875](https://github.com/wavenoxx/wavenox/commit/97dd875e2120401848249405c8e8f6600bd00d45) has the identical source tree. No published history was rewritten. The original Antigravity checkout was preserved.

Step 6 is implemented on `feat/wavenox-step6-ai-bill-roof-intelligence`, with [Draft PR #10](https://github.com/wavenoxx/wavenox/pull/10) targeting `main`. Verify its current head and checks before continuing. It adds local bill previews/redaction, a server-only OpenAI adapter, explicit human review, manual fallback and measured rectangle/L-shape roof planning. No satellite service, customer location collection, document database storage or automatic CRM insertion was added. See the [execution evidence](STEP6_EXECUTION_REPORT.md), [bill architecture](STEP6_AI_BILL_ARCHITECTURE.md), [roof capabilities](STEP6_ROOF_INTELLIGENCE.md) and [privacy boundary](STEP6_PRIVACY_SECURITY.md).

## Architecture and verification

The npm lockfile resolves React 19.3.0, TypeScript 5.9.3, TanStack Router 1.170.46 / React Start 1.169.4 / start-server-core 1.169.45, Vite 8.3.6, Nitro 3.0.260603-beta, Supabase JS 2.117.1, Zod 4.6.7, Vitest 5.0.1 and Playwright 1.63.0. Bill processing uses OpenAI SDK 7.53.0, PDF.js 6.5.438 and Sharp 0.35.5. Keep the existing Step 3/4 calculation functions authoritative. Preserve LIVE/DEMO separation and the [CRM architecture](STEP5_CRM_ARCHITECTURE.md) / [database boundary](STEP5_DATABASE_SECURITY.md).

The current local suite passes 152 cases; fourteen opt-in cases are skipped by default (eleven database, three live-provider). Lint passes with ten inherited warnings; types and client/SSR build pass. Actual desktop/mobile browser and isolated Supabase results are recorded by commit in the Step 6 execution report. Local Chromium cannot launch under this macOS sandbox; the user authorized GitHub Actions for that gate. Test transport stubs are not evidence of real OCR accuracy.

## Release prerequisites

The user approved secure OpenAI key setup. Its local destination is ignored `.env.local`; never read its values into tool output, Git, browser code or documentation. A key alone does not activate processing: `BILL_AI_ENABLED=true` is also required. Live synthetic provider attempts returned HTTP 429, so real extraction remains unverified and production AI is inactive. Resolve provider access/quota, test representative bill accuracy, approve retention/disclosure and add distributed quotas/cost controls before activation.

Live CRM still requires separately approved migrations, staff provisioning and environment configuration. Production readiness also needs privacy, legal/financial, observability and release reviews. Roof structure, shading, wind loads, geometry and hosting approval require a physical survey.

## Safe continuation

1. Read [AGENTS.md](../AGENTS.md) and [Rules.md](../Rules.md), inspect the working tree, fetch and inspect branch history. Preserve all uncommitted work. Use reviewed commits and ordinary feature-branch pushes; never rewrite shared history.
2. Verify the prior stage's final SHA and PR status before selecting the next base. Do not restart from outdated main. Run unit, lint, type, build and browser gates. Separate mocked, real provider, database, browser and deployment evidence.
3. Use disposable local or expressly authorized staging database fixtures. Keep service credentials server-side and audited mutations transactional. Production migration, customer-data changes, provisioning, merge and production deployment each require explicit approval.
4. Keep documents ephemeral, disclose external processing, require human confirmation, and preserve customer overrides. Never invent readings, calibrated confidence, imagery capabilities or financial guarantees.

## Remaining stages

- **Step 7:** separately scoped authenticated installation milestones, surveys, documents, support and consent-safe notifications.
- **Step 8:** production security, accessibility, performance, SEO, legal/financial disclosures, observability, domain readiness and approved release operations.

Do not start either stage or activate production services merely because Step 6 code is complete.
