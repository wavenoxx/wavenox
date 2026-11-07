# Step 6 privacy and security

## Data lifecycle

File selection is customer initiated. Original bytes are read locally and are not persisted. Hidden-by-default previews can be revealed locally for manual redaction. Only explicitly consented raster pages are sent to the extraction endpoint and OpenAI. Identifiers are not automatically detected: customers must review and redact names, addresses, account numbers, phones and QR/barcodes before consent. The UI explains this limitation.

The app uses memory only for documents, extraction drafts and review fields. Clear, successful apply, unmount or the 15-minute document expiry releases references and aborts pending requests. No bill contents are written to localStorage/sessionStorage, Supabase, analytics, disk, URLs or CRM. Applied numeric planning values remain in the existing Studio state until navigation; a later, separately consented consultation uses the existing validated lead flow.

Clear/cancel is not a promise to recall bytes already received by OpenAI or to securely wipe browser/process memory. `store:false` disables stored response retrieval, not all provider retention. OpenAI can retain abuse-monitoring data for up to 30 days, with documented exceptions and account-dependent controls. This is disclosed before transfer. No claim of Zero Data Retention is made. [Provider data controls](https://developers.openai.com/api/docs/guides/your-data)

## Boundaries

- Server credentials are ignored local/runtime environment values; never VITE-prefixed or bundled client-side.
- AI activation is independent of LIVE/DEMO lead mode and disabled without `BILL_AI_ENABLED=true` plus a server key. No DEMO bill is passed off as extraction.
- Original type/signature/size, image dimensions, PDF page count and renderer behavior are checked. Active PDFs and unsupported formats fail safely. Raster-only server intake prevents server-side PDF or embedded-content execution.
- Server body reads are bounded independently of Content-Length, followed by collection bounds, schema validation, image decode/re-encode and a 45-second overall processing budget. OpenAI has a 40-second timeout and no retry.
- Same-origin checks reject cross-site browser calls. A per-process ceiling of 20 attempts/hour and two concurrent requests limits accidental cost. It is **not** a distributed abuse-control guarantee. Production activation requires deployment-level/distributed quotas, cost alerts and an approved threat review. No external rate-limit infrastructure was added.
- Provider outputs are untrusted. Strictly allowlisted fields, numbers/dates/enums, duplicate/provenance checks, explicit customer confirmation and absence of model tools constrain prompt-injection impact. Model extraction can still be wrong; visual confirmation is mandatory.
- No raw document, provider response, exception payload, customer identifier or credential is logged. Errors return generic manual-fallback messages. Response headers disable caching and MIME sniffing.
- Existing Supabase grants, RLS and transactional CRM audit paths are unchanged. Zod 4 compatibility uses `error.issues` in existing error responses without changing authorization.

## Dependency review

Sharp was patched to 0.35.5 and Zod to 4.6.7 for [image-decoder](https://github.com/advisories/GHSA-wq5f-xc86-pv6w) and [bounded-validation](https://github.com/advisories/GHSA-mrhx-c7xc-m3w5) advisories. Related narrow tooling patches update Vite and vulnerable shell-quote/source-map-js transitive packages. No whole-tree forced upgrade was used. The production-dependency audit returned zero advisories; remaining development-tool findings are recorded separately in the execution report.

No production key/environment was configured, no storage bucket was created, no live migration ran and no customer document was used for testing.
