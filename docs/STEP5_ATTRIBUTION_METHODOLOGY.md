# WAVENOX — Step 5 Marketing Attribution Methodology & Privacy Guardrails

## 1. Design Philosophy

WAVENOX's campaign attribution engine (`src/lib/telemetry.ts`) is designed to answer three practical sales-operations questions without invasive third-party tracking scripts or PII leakage:
1. **First Touch**: How did the customer originally discover WAVENOX?
2. **Last Touch**: Which campaign or referral brought the customer back for their active session?
3. **Conversion Touch**: Which on-site architectural/solar consultation form (`studio`, `drawer`, `enterprise`, `net_metering`, `architects`) and route converted the visitor into a consultation enquiry?

---

## 2. Three-Layer Attribution Model

| Layer | Storage Mechanism | Persistence & Overwrite Rule | Fields Captured |
| :--- | :--- | :--- | :--- |
| **1. First Touch** | `localStorage` (`wavenox_attr_first_v2`) | Written once on initial landing. **Never overwritten** by subsequent internal SPA navigation or return sessions unless `localStorage` is cleared by the user. | `first_touch_source`, `first_touch_medium`, `first_touch_campaign`, `first_touch_landing_path`, `first_touch_referrer_domain`, `first_touch_at` |
| **2. Last Touch** | `sessionStorage` (`wavenox_attr_last_v2`) + legacy `wavenox_utm` compatibility | Initialized on session start. Updated during navigation **only** when the URL contains new explicit campaign parameters (`utm_*` or click IDs `gclid`, `fbclid`, `msclkid`, `wbraid`, `gbraid`, `li_fat_id`, `ttclid`). Internal SPA navigation without UTMs never overwrites Last Touch with `direct`. | `last_touch_source`, `last_touch_medium`, `last_touch_campaign`, `last_touch_landing_path`, `last_touch_referrer_domain`, `last_touch_at`, `click_id_type`, `click_id_value` |
| **3. Conversion Touch** | Runtime Form Submission (`getLeadAttributionPayload()`) | Captured at the exact moment the customer submits a consultation form and re-sanitized server-side in `processLeadSubmission()` (`src/functions/leads.ts`). | `source` (form surface), `conversion_path` (pathname + allowed non-PII query params), `attribution_channel` |

---

## 3. Deterministic Channel Classification Rules (`classifyAttributionChannel`)

Channel classification is deterministic and evaluated in strict priority order:

| Priority | Condition | Classified Channel |
| :---: | :--- | :--- |
| **1** | `click_id_type` is `gclid`, `wbraid`, `gbraid`, or `msclkid` | `paid_search` |
| **2** | `click_id_type` is `fbclid`, `li_fat_id`, or `ttclid` | `paid_social` |
| **3** | `utm_medium` matches paid search tokens (`cpc`, `ppc`, `paid_search`, `paidsearch`, `sem`, `search_ads`) OR (`utm_medium` is paid AND `utm_source` is a search engine `google`, `bing`, `duckduckgo`, `yahoo`) | `paid_search` |
| **4** | `utm_medium` matches paid social tokens (`paid_social`, `paidsocial`, `cpm`, `social_ads`, `sponsored`, `reel_ads`, `story_ads`) OR (`utm_medium` is paid AND `utm_source` is a social network `instagram`, `facebook`, `meta`, `linkedin`, `youtube`, `x`, `twitter`) | `paid_social` |
| **5** | `utm_medium` is `organic`, `organic_search`, `seo`, OR (no paid medium and `referrer_domain` is a recognized search engine: `google.*`, `bing.com`, `duckduckgo.com`, `yahoo.*`, `ecosia.org`, `brave.com`) | `organic_search` |
| **6** | `utm_medium` is `referral`, `partner`, `affiliate`, `architect_referral`, OR `utm_source` is present without paid medium, OR external non-self `referrer_domain` is present | `referral` |
| **7** | No UTM tags, no click IDs, and no external referrer (while landing path is known) | `direct` |
| **8** | Malformed or completely empty context | `unknown` |

---

## 4. Privacy & PII Sanitization Rules

Customer privacy takes precedence over marketing telemetry. Both client-side (`sanitizeAttributionUrl`, `sanitizeConversionPath` in `src/lib/telemetry.ts`) and server-side (`sanitizeIncomingAttributionPayload` in `src/lib/telemetry.ts`, invoked by `src/functions/leads.ts`) enforce strict URL sanitization:

1. **Blocked PII Query Parameters**:
   - Any query parameter matching `name`, `client_name`, `fullname`, `first_name`, `last_name`, `phone`, `mobile`, `tel`, `whatsapp`, `email`, `mail`, `address`, `street`, `pin`, `pincode`, `pin_code`, `postal`, `usc`, `scno`, `service_number`, `consumer_number`, `account`, `token`, `auth`, `password`, `secret`, `otp`, or `ssn` is **stripped** before storage.
2. **Value-Pattern Redaction**:
   - Even if a query parameter uses an unknown key, if its value matches an email address (`/@/`), a 10-digit Indian phone number (`/(?:\+?91[\s-]?)?[6-9]\d{9}/`), or a 6-digit PIN code (`/\b[56]\d{5}\b/`), that parameter is stripped.
3. **Referrer Minimization**:
   - `extractReferrerDomain()` stores only the normalized lowercase hostname (e.g., `google.com`, `l.instagram.com`) and strips paths, fragments, and query strings from external referrers.

---

## 5. Honest Operational Analytics & ROAS Guardrail

- **No Fabricated Pipeline Revenue**: Preliminary configurator estimates (`net_price_inr`) represent indicative solar system sizing prior to physical roof and DISCOM verification. They are never summed and labeled as "Closed Revenue" or "Pipeline Revenue".
- **No Fabricated ROAS**: Because Google Ads / Meta Ads spend APIs are not connected in Step 5, `/ops` explicitly displays:
  > `"Ad spend not connected — ROAS unavailable."`
- **Verified Funnel Metrics**: Campaign performance tables in `/ops` report factual funnel counts (`totalLeads`, `qualifiedLeads`, `surveyBookedLeads`, `contractSignedLeads`) derived directly from persisted consultation records.
