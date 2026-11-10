# Step 8 SEO & Accessibility Report

**Audit Date:** 10 November 2026  
**Branch:** `fix/wavenox-step8-final-release-gates`  
**Verification Harness:** `scripts/step8-tests/release-audit.mjs` (Playwright `1.63.0` + `@axe-core/playwright` `4.13.0` across 16 public routes × 5 viewports = **80 route-viewport checks**).

---

## 1. Executive Summary

- **Public Routes Audited (16):** `/`, `/residential`, `/omnigrid`, `/enterprise`, `/engineering`, `/deploy`, `/warranty`, `/net-metering`, `/service-areas`, `/architects`, `/faq`, `/about`, `/about-this-project`, `/legal/privacy`, `/legal/terms`, `/legal/disclosures`.
- **Viewports Tested per Route (5):** `320×720` (small mobile), `390×844` (standard mobile), `768×1024` (tablet portrait), `1024×768` (tablet landscape), `1440×900` (desktop).
- **Total Route-Viewport Checks:** **80 / 80 PASS** (`0` horizontal overflow `> 2px`, exactly `1` `<h1>` and `1` `<main>` per page, `0` visible text nodes `< 12px`, keyboard `Tab` focus verified on all 80 checks, and **`0` Axe violations of any severity** across `wcag2a`, `wcag2aa`, `wcag21aa`, `wcag22aa`).

---

## 2. Resolution of the 6 Mobile Layout/Accessibility Failures (Work Package A)

### Root Cause in CI Run `42752891435`

In GitHub Actions run `42752891435`, `scripts/step8-tests/release-audit.mjs` reported 6 failures:

- `/warranty` at `320×720` and `390×844`
- `/about-this-project` at `320×720` and `390×844`
- `/legal/disclosures` at `320×720` and `390×844`

Inspection of `release-report.json` confirmed that all 6 failures had `overflow: 0`, `h1: 1`, `main: 1`, `smallText: 0`, `keyboard: true`, and failed **Axe rule `scrollable-region-focusable` (`impact: "serious"`, WCAG 2.1.1 Keyboard)**:

- At narrow mobile viewports (`320px` and `390px`), wide comparison/specification tables inside `.overflow-x-auto` containers overflowed horizontally (`scrollWidth > clientWidth`) without focusable descendants and without `tabIndex={0}` on the scrollable container, preventing keyboard-only users from scrolling the tables horizontally.

### Applied Corrections

1. **`src/routes/warranty.tsx`:** Added `role="region"`, `aria-label="Specified N-Type TOPCon vs conventional output retention comparison"`, `tabIndex={0}`, visible keyboard focus ring (`focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#171A20]`), and responsive mobile cell padding (`px-3 sm:px-6`) on the degradation comparison table container.
2. **`src/routes/about-this-project.tsx`:** Added `role="region"`, `aria-label="Platform transformation matrix"`, `tabIndex={0}`, visible keyboard focus ring, and responsive cell padding (`p-3 sm:p-4`) on the transformation matrix table container.
3. **`src/routes/legal/disclosures.tsx`:** Added `role="region"`, descriptive `aria-label` (`"State DISCOM tariff schedules and verification status"` and `"Statutory verification and sources register"`), `tabIndex={0}`, visible keyboard focus ring, and responsive cell padding (`px-3 sm:px-4`) on both `.overflow-x-auto` table containers.
4. **Shared Component Hardening (`src/components/PmSuryaGharJourney.tsx`, `src/components/BillDecoder.tsx`, `src/components/ArchitecturalDossierModal.tsx`):** Added keyboard-focusable region semantics (`role="region"`, `aria-label`, `tabIndex={0}`, visible focus outline) to all remaining `.overflow-x-auto` table containers.
5. **Additional `/deploy` Accessibility Polish (`src/components/MonthlyGenerationChart.tsx`, `src/components/WealthCurveVisualizer.tsx`, `src/components/SourcePopover.tsx`):**
   - Improved daily kWh stat contrast on white background from `#F57C00` (`2.80:1`) to `#B45309` (`5.02:1`).
   - Corrected heading hierarchy inside Stage 5 (`WealthCurveVisualizer` `<h4>` -> `<h3>` under `<h2>5. Investment Structure</h2>`).
   - Updated `SourcePopover` button `aria-label` when visible `label` text is rendered so the accessible name begins with the visible label (`WCAG 2.5.3 Label in Name`).

---

## 3. Multi-Viewport Accessibility & Layout Verification Matrix (80 Checks)

| Route                 | `320×720` | `390×844` | `768×1024` | `1024×768` | `1440×900` | Overflow | `h1` / `main` | `<12px` Text | Axe Serious/Critical |
| :-------------------- | :-------- | :-------- | :--------- | :--------- | :--------- | :------- | :------------ | :----------- | :------------------- |
| `/`                   | PASS      | PASS      | PASS       | PASS       | PASS       | `0 px`   | `1 / 1`       | `0`          | `0`                  |
| `/residential`        | PASS      | PASS      | PASS       | PASS       | PASS       | `0 px`   | `1 / 1`       | `0`          | `0`                  |
| `/omnigrid`           | PASS      | PASS      | PASS       | PASS       | PASS       | `0 px`   | `1 / 1`       | `0`          | `0`                  |
| `/enterprise`         | PASS      | PASS      | PASS       | PASS       | PASS       | `0 px`   | `1 / 1`       | `0`          | `0`                  |
| `/engineering`        | PASS      | PASS      | PASS       | PASS       | PASS       | `0 px`   | `1 / 1`       | `0`          | `0`                  |
| `/deploy`             | PASS      | PASS      | PASS       | PASS       | PASS       | `0 px`   | `1 / 1`       | `0`          | `0`                  |
| `/warranty`           | **PASS**  | **PASS**  | PASS       | PASS       | PASS       | `0 px`   | `1 / 1`       | `0`          | **`0`**              |
| `/net-metering`       | PASS      | PASS      | PASS       | PASS       | PASS       | `0 px`   | `1 / 1`       | `0`          | `0`                  |
| `/service-areas`      | PASS      | PASS      | PASS       | PASS       | PASS       | `0 px`   | `1 / 1`       | `0`          | `0`                  |
| `/architects`         | PASS      | PASS      | PASS       | PASS       | PASS       | `0 px`   | `1 / 1`       | `0`          | `0`                  |
| `/faq`                | PASS      | PASS      | PASS       | PASS       | PASS       | `0 px`   | `1 / 1`       | `0`          | `0`                  |
| `/about`              | PASS      | PASS      | PASS       | PASS       | PASS       | `0 px`   | `1 / 1`       | `0`          | `0`                  |
| `/about-this-project` | **PASS**  | **PASS**  | PASS       | PASS       | PASS       | `0 px`   | `1 / 1`       | `0`          | **`0`**              |
| `/legal/privacy`      | PASS      | PASS      | PASS       | PASS       | PASS       | `0 px`   | `1 / 1`       | `0`          | `0`                  |
| `/legal/terms`        | PASS      | PASS      | PASS       | PASS       | PASS       | `0 px`   | `1 / 1`       | `0`          | `0`                  |
| `/legal/disclosures`  | **PASS**  | **PASS**  | PASS       | PASS       | PASS       | `0 px`   | `1 / 1`       | `0`          | **`0`**              |

---

## 4. Technical SEO, Sitemap, Robots & Indexing Controls

1. **Unique Metadata & Canonicals Across All 16 Public Routes:**
   - Every route in `public/sitemap.xml` (16 routes) returns HTTP `200`, has a unique non-empty `<title>`, a single unique `<meta name="description">`, and a single self-referencing `<link rel="canonical" href="https://wavenox.in/...">` matching the exact route path.
   - Structured data (`application/ld+json`) parses cleanly as valid JSON on every public route (`Organization` in root shell plus route-specific `WebSite`, `WebPage`, `FAQPage`, `Service`, and `WebApplication` schemas).
2. **`public/sitemap.xml` Hygiene:**
   - Contains exactly the 16 indexable public routes (`https://wavenox.in/...`).
   - Excludes fabricated `<lastmod>` timestamps and excludes all private/transactional paths (`/ops`, `/portal`, `/order/received`, `/api/*`).
3. **`public/robots.txt` & Private Route Isolation:**
   - Explicitly disallows `/portal`, `/ops`, `/api/`, and `/_serverFn/`.
   - Server response policy (`src/server/response-policy.ts`) enforces `Cache-Control: no-store` and `X-Robots-Tag: noindex, nofollow` on `/ops`, `/portal`, `/api/projects`, `/api/bill-extraction`, `/order/received`, and 404/error responses.
4. **Pre-Incorporation Indexing Guard (`BRAND_CONFIG.status`):**
   - While `BRAND_CONFIG.status` is `"pre-incorporation"` (`BRAND_CONFIG.status !== "active"`), `src/routes/__root.tsx` emits `<meta name="robots" content="noindex, nofollow" />` on public routes so preview/staging deployments are not indexed prematurely before commercial sign-off. (This intentional guard accounts for the `is-crawlable` deduction in Lighthouse SEO scores during pre-launch mode.)

---

## 5. Limitations

Automated Axe-core (`wcag2a`, `wcag2aa`, `wcag21aa`, `wcag22aa`), viewport geometry, and keyboard focus checks verify structural and programmatic accessibility across all 5 breakpoints but do not replace manual assistive-technology testing with screen readers (VoiceOver, NVDA, TalkBack).
