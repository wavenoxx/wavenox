# Step 6 bill intelligence architecture

## Intake and extraction

The `/deploy` Studio adds `BillIntelligence` above the existing `BillDecoder`. Supported originals are JPEG, PNG and plain, unencrypted PDF: 10 MiB maximum, 24 million image pixels, at most three PDF pages. MIME/signature and image header dimensions are checked before decoding. The browser fully decodes images; PDF.js 6.5.438 renders PDF pages locally, with a 20-second budget, no viewer scripting, no XFA, no active annotations and no worker resource fetching. Scripted or attached-file PDFs are rejected. Invalid, oversized, password-protected or complex files fall back to manual entry.

Previews are hidden by default. Customers can reveal a local canvas and draw black redactions or use top/bottom-quarter buttons. Redactions are burned into transmitted raster pixels. Original PDFs, original filenames and EXIF metadata are never sent to the server. A 1,800-pixel longest-edge raster and strict per-page/base64 limits bound the request below 3.5 MB. Low-resolution warnings are heuristics, not validated OCR quality scores.

`/api/bill-extraction` is handled by the existing server entry before SSR. It requires same-origin JSON, explicit consent and an independently enabled provider. `BillExtractionProvider` accepts sanitized raster pages and an AbortSignal. The server validates and re-encodes every page with Sharp 0.35.5, strips metadata, bounds concurrent requests and request-body bytes, and returns generic failure messages without logging upstream payloads.

The implemented provider uses the official OpenAI SDK 7.53.0, Responses API, model `gpt-4.1-mini-2025-04-14`, structured output, `store:false`, no tools, no Files API and no automatic retries. `OPENAI_API_KEY` and `BILL_AI_ENABLED=true` must exist in the server environment; a key alone does not enable transfer. No browser credential is used. Other providers must implement the same contract; none is currently activated.

## Evidence and human review

Thirteen allowlisted fields cover state, DISCOM, period dates, explicitly printed months/days, period kWh, payable/energy/fixed charges, sanctioned load, category and phase. Values are bounded numbers, dates or registry/enumerated strings. No free-form OCR transcript or personal-identifier field exists. Unknown utilities become unsupported, never Telangana.

Each field has a value, unit, qualitative legibility (`clear`, `uncertain`, `missing`), supplied page number, coarse section (`header`, `readings`, etc.), issue code and `unconfirmed` status. Page/section provenance is model-reported and must be checked. It is not a measured bounding box. Confidence is not a calibrated probability. Document instructions are treated as untrusted data; there are no model tools or privileged follow-up actions.

Customers can edit readings and explicitly confirm before applying. The bill must be residential for this Studio. State/DISCOM mismatches, invalid dates, incompatible durations, nonfinite values and residential-range overflow are rejected. kVA/HP is not silently converted to sanctioned kW; kVAh/kW is not treated as kWh. Missing kWh permits the existing bill-amount estimation path, with its existing disclosure.

Whole-month bills are divided by the confirmed number of months. If dates are entered they must agree with the duration, including both endpoints. Irregular periods use customer-confirmed days and a disclosed 365.25/12-day planning month. This is an annual-average planning assumption, not a forecast of an actual future bill.

## Existing-engine integration

`confirmBillReview()` produces inputs for `buildSolarRecommendation()` and `estimate()`. No tariff, subsidy, financing, yield or net-metering engine was added. Confirmed kWh takes priority over payable-derived consumption, including zero kWh. `decodeBill()` now accepts the same override and delegates its charge breakdown to the existing `calculateElectricityBill()`.

Explicitly applied readings replace the relevant Studio inputs. Custom panel, battery, payment and roof selections are preserved. Missing consumption/load does not erase an existing override; a visible notice explains retention. The existing manual-panel choice banner offers the updated recommendation. Energy/fixed charges and connection type remain review-only; extracted PII is never submitted to CRM. Existing regulatory verification labels are retained.

## Sources and limitations

- [OpenAI image inputs](https://developers.openai.com/api/docs/guides/images-vision)
- [Structured outputs](https://developers.openai.com/api/docs/guides/structured-outputs)
- [Model capabilities](https://developers.openai.com/api/docs/models/gpt-4.1-mini)
- [PDF.js API](https://mozilla.github.io/pdf.js/api/draft/module-pdfjsLib.html)

All eleven existing DISCOM codes are available; this adds no regulatory coverage. The current bill workflow is residential. Commercial documents can be reviewed but require professional assessment rather than residential financial calculations. Real-provider verification encountered HTTP 429; see the execution report. No claim of successful real-world OCR or calibrated accuracy is made.
