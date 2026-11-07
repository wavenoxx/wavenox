# Step 6 implementation plan

## Verified foundation

On 7 November 2026, origin/main was 97dd875 (the merge of PR #9), containing approved Step 5 SHA 665a2b59529de2ebe2e99bde68a3f89cc02dd9ee with an identical tree. The clean isolated checkout was branched as feat/wavenox-step6-ai-bill-roof-intelligence. The original Antigravity checkout remains untouched. Step 6 targets main because Step 5 is now merged.

Baseline: 113 unit tests pass (11 database cases run separately), lint passes with ten existing warnings, TypeScript and client/Nitro SSR build pass. Local Chromium verification is recorded separately in the execution report.

## Implementation decisions

1. Keep the existing bill decoder, tariff tables, estimate(), recommendation builder and lead/CRM boundaries. Add a customer-controlled bill review panel to /deploy.
2. Accept signature-checked JPEG, PNG and PDF locally. Bound original bytes, decoded dimensions, PDF pages and processing time. Render PDFs locally with PDF.js, without scripting, links or embedded-file execution. Only raster pages reach the extraction server; no PDF or original filename is sent.
3. Provide private local previews and customer redaction before explicit external-processing consent. Keep document data in memory, release it on clear/unmount/timeout, and never write it to storage, analytics or CRM.
4. Use a provider-independent typed contract and OpenAI Responses with structured output, no tools, no response storage and qualitative reading-quality labels. Strictly allowlist non-identifying fields and values. Every result remains unconfirmed until customer review. Manual entry remains usable without the provider.
5. Validate consumption units, calendar dates, period lengths, DISCOM/state and residential eligibility. Normalize confirmed full calendar-month bills by their actual number of months; otherwise use a disclosed 365.25/12-day planning month with customer-confirmed days. Never silently infer that a period is 30 days. Prefer kWh over bill-amount inference.
6. Extend the existing roof geometry function with measured rectangle dimensions and a conservative L-shape cutout. Area-only mode retains its explicit square approximation. Preserve existing area-per-kW sizing and yield assumptions. No map source is licensed or verified for customer measurements, so do not add satellite detection or location collection.
7. Verify with unit tests, actual server requests, synthetic real-provider samples, desktop/mobile browser screenshots and inherited lead/CRM regression gates. Local browser sandbox failures move the browser gate to GitHub Actions as previously authorized.

## Boundaries and release prerequisites

No production activation, merge, live migrations or real customer documents. The user explicitly selected secure OpenAI key setup; the credential is stored only in ignored .env.local. Synthetic provider checks are permitted. AI activation in a deployed environment requires separate credential, privacy/retention, cost-control and release approval. No new database persistence is needed.
