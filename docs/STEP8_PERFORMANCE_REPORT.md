# Step 8 Performance Report

**Audit Date:** 10 November 2026  
**Branch:** `fix/wavenox-step8-final-release-gates` (based on `main` commit `3cab87aa15c66b7eb29e9bffdc77dfe3fd8976c5` / Step 8 merge of `d8583ec91510753d0f7b6ce6ed7cabf9b556a48b`)  
**Measurement Harness:** `scripts/step8-tests/release-audit.mjs` (Lighthouse `13.6.0`, `throttlingMethod: "simulate"`, Node production build `NITRO_PRESET=node-server`, loopback `127.0.0.1:45745`, LIVE fail-closed mode, AI and email disabled).

---

## 1. Performance Budgets & Enforcement Gates

`scripts/step8-tests/release-audit.mjs` enforces the following non-weakened lab budgets across 8 core public routes on both `mobile` and `desktop` form factors (16 Lighthouse runs total):

| Form Factor                                  | Performance Score | Largest Contentful Paint (LCP) | Cumulative Layout Shift (CLS) | Total Blocking Time (TBT) |
| :------------------------------------------- | :---------------- | :----------------------------- | :---------------------------- | :------------------------ |
| **Mobile** (simulated Moto G Power 4G)       | `>= 70`           | `<= 4,000 ms`                  | `<= 0.10`                     | `<= 600 ms`               |
| **Desktop** (`1440×900`, 40 ms RTT, 10 Mbps) | `>= 85`           | `<= 2,500 ms`                  | `<= 0.10`                     | `<= 300 ms`               |

---

## 2. Root-Cause Diagnosis & Evidence-Based Optimization on `/deploy` Mobile

### Baseline Failure in CI Run `42752891435` (`d8583ec91510753d0f7b6ce6ed7cabf9b556a48b`)

In GitHub Actions run `42752891435`, 15 of 16 Lighthouse route-formFactor combinations passed with scores of `94–100`. Only `/deploy` (`mobile`) exceeded the `4,000 ms` LCP budget:

- **Baseline `/deploy` Mobile Metrics:** Performance `82`, LCP `4,913.7 ms`, CLS `0`, TBT `60 ms`, TTFB `8 ms`, Transfer `597,032 B`.
- **Identified LCP Element (`lcp-breakdown-insight` & `image-delivery-insight`):** `<img src="/media/res-hero-mobile.avif" loading="eager" fetchpriority="high">` inside the Sticky Media Showroom (`src/components/SystemConfigurator.tsx`, displayed at `412×480` CSS pixels on mobile).
- **Root Causes in Lantern Simulated 4G Critical Path:**
  1. **Oversized Mobile Hero Image (`118,489 B`):** `public/media/res-hero-mobile.avif` was encoded at `1080×1920` (`quality: 86` with post-resize sharpening) for a `412×480` mobile showroom container (`92,193 B` flagged as wasted bytes by Lighthouse `image-delivery-insight`).
  2. **Competing High-Priority Font Preload (`85,382 B`):** `src/routes/__root.tsx` preloaded `inter-latin-ext-wght-normal.woff2` (`85.4 KB`) in `<head>` ahead of `/deploy`'s LCP image preload, and `@fontsource-variable/inter/wght.css` emitted a separate render-blocking stylesheet (`index-xKv10YAh.css`, `844 B`) plus triggered a `VeryHigh` priority download of `inter-latin-ext-wght-normal.woff2` solely for the `₹` (`U+20B9`) glyph.
  3. **Eager Initial-Load Imports for Deferred Interactions:** `src/components/SystemConfigurator.tsx` eagerly imported `submitLead` (`@/functions/leads` + `zod` schema bundle `schemas.js`, `24.4 KB` transferred) and `BatteryHonestyAdvisor` (collapsed by default behind `showBatteryAdvisor`), while `src/components/BillIntelligence.tsx` eagerly imported `BillPagePreview` and `@/lib/bill-document` (`prepareBillDocument`, `redactBillPage`) even when collapsed (`open === false`).
  4. **Synchronous Priority Image Decoding:** `src/components/system/Media.tsx` set `decoding="sync"` when `priority={true}`, blocking main-thread frame presentation during image decode (`elementRenderDelay: 173.3 ms`).

### Applied Optimizations (Zero Feature or Formula Changes)

1. **Responsive Mobile Hero Right-Sizing (`scripts/build-images.mjs`, `public/media/res-hero-mobile.*`, `public/media/studio-estate-mobile.*`):** Generated 9:16 mobile portrait hero assets at `540×960` (`quality: 56` AVIF without artificial sharpening noise), reducing `res-hero-mobile.avif` from `118,489 B` to **`23,082 B`** (`-80.5%`, saving `95.4 KB`) and `studio-estate-mobile.avif` from `113,085 B` to **`15,292 B`** (`-86.5%`).
2. **Critical-Path Font & CSS Consolidation (`src/routes/__root.tsx`, `src/styles.css`):** Inlined the `Inter Variable` (`latin` subset, `48.3 KB`) `@font-face` rule directly into `src/styles.css` and removed the `inter-latin-ext` preload (`85.4 KB`) and separate `@fontsource-variable/inter/wght.css` render-blocking stylesheet.
3. **Deferred Interaction Code-Splitting (`src/components/SystemConfigurator.tsx`, `src/components/BillIntelligence.tsx`):**
   - Converted `BatteryHonestyAdvisor` in `SystemConfigurator.tsx` to `React.lazy(...)` inside `<React.Suspense>`.
   - Converted `BillPagePreview` in `BillIntelligence.tsx` to `React.lazy(...)` and dynamically imported `@/lib/bill-document` inside `chooseFile` and `extract`.
   - Dynamically imported `submitLead` (`@/functions/leads`) inside `handleReserve` on form submission, removing `schemas.js` (`22.7 KB` transferred) and `leads.js` (`1.6 KB` transferred) from `/deploy`'s initial load.
4. **Async Priority Image Decoding (`src/components/system/Media.tsx`):** Set `decoding="async"` while preserving `loading="eager"` and `fetchPriority="high"` on priority hero media.

### Before vs. After on `/deploy` Mobile

| Metric                   | Before (CI Run `42752891435`) | After (`fix/wavenox-step8-final-release-gates`) | Delta                        | Budget               |
| :----------------------- | :---------------------------- | :---------------------------------------------- | :--------------------------- | :------------------- |
| **Performance Score**    | `82`                          | **`89`**                                        | `+7 pts`                     | `>= 70` (PASS)       |
| **Mobile LCP**           | `4,913.7 ms`                  | **`3,751.7 ms`**                                | **`-1,162.0 ms` (`-23.6%`)** | `<= 4,000 ms` (PASS) |
| **Desktop LCP**          | `1,086.7 ms`                  | **`1,002.2 ms`**                                | `-84.5 ms`                   | `<= 2,500 ms` (PASS) |
| **Mobile TBT**           | `60 ms`                       | **`0 ms`**                                      | `-60 ms`                     | `<= 600 ms` (PASS)   |
| **Mobile CLS**           | `0`                           | **`0`**                                         | `0`                          | `<= 0.10` (PASS)     |
| **Mobile Transfer Size** | `597,032 B` (`583.0 KiB`)     | **`411,044 B` (`401.4 KiB`)**                   | **`-185,988 B` (`-31.2%`)**  | —                    |

---

## 3. Complete 16-Run Lighthouse Matrix (`qa-artifacts/step8/release-report.json`)

| Route            | Form Factor | Perf Score | LCP (ms)  | CLS | TBT (ms) | TTFB (ms) | Transfer Bytes | Status |
| :--------------- | :---------- | :--------- | :-------- | :-- | :------- | :-------- | :------------- | :----- |
| `/`              | `mobile`    | `100`      | `1,201.9` | `0` | `0`      | `4`       | `1,791,219`    | PASS   |
| `/`              | `desktop`   | `100`      | `285.2`   | `0` | `0`      | `3`       | `2,072,393`    | PASS   |
| `/residential`   | `mobile`    | `100`      | `901.8`   | `0` | `0`      | `2`       | `764,997`      | PASS   |
| `/residential`   | `desktop`   | `100`      | `243.8`   | `0` | `0`      | `2`       | `1,189,240`    | PASS   |
| `/enterprise`    | `mobile`    | `100`      | `901.8`   | `0` | `0`      | `2`       | `692,678`      | PASS   |
| `/enterprise`    | `desktop`   | `100`      | `244.2`   | `0` | `0`      | `3`       | `805,735`      | PASS   |
| `/deploy`        | `mobile`    | `89`       | `3,751.7` | `0` | `0`      | `4`       | `411,044`      | PASS   |
| `/deploy`        | `desktop`   | `99`       | `1,002.2` | `0` | `0`      | `4`       | `653,357`      | PASS   |
| `/net-metering`  | `mobile`    | `100`      | `1,062.0` | `0` | `0`      | `2`       | `326,181`      | PASS   |
| `/net-metering`  | `desktop`   | `100`      | `283.5`   | `0` | `0`      | `2`       | `326,181`      | PASS   |
| `/architects`    | `mobile`    | `100`      | `902.1`   | `0` | `0`      | `2`       | `286,290`      | PASS   |
| `/architects`    | `desktop`   | `100`      | `243.6`   | `0` | `0`      | `2`       | `286,290`      | PASS   |
| `/legal/privacy` | `mobile`    | `100`      | `901.8`   | `0` | `0`      | `1`       | `251,393`      | PASS   |
| `/legal/privacy` | `desktop`   | `100`      | `243.9`   | `0` | `0`      | `1`       | `251,393`      | PASS   |
| `/legal/terms`   | `mobile`    | `100`      | `901.6`   | `0` | `0`      | `2`       | `251,313`      | PASS   |
| `/legal/terms`   | `desktop`   | `100`      | `244.1`   | `0` | `0`      | `2`       | `251,313`      | PASS   |

---

## 4. Production Client JavaScript Bundle Inventory

Total client JavaScript chunks in `.output/public/assets`: **71 files** (`1,787,605 B` raw across all routes and lazy chunks; PDF parsing and private `/ops` / `/portal` chunks are code-split and never loaded on initial public page views).

| Chunk File                       | Raw Bytes | Gzip Bytes | Loading Scope                                                        |
| :------------------------------- | :-------- | :--------- | :------------------------------------------------------------------- |
| `pdf-YwugTw7Y.js`                | `444,231` | `132,200`  | Lazy: loaded only when a customer selects a PDF in Bill Intelligence |
| `index-6Gl5P9Ke.js`              | `385,513` | `118,710`  | Shared React 19 / TanStack Router client runtime                     |
| `deploy-COS1PZKz.js`             | `113,739` | `30,150`   | Route chunk for `/deploy` Design Studio                              |
| `schemas-Ct8qkdL4.js`            | `90,064`  | `25,264`   | Lazy on `/deploy`: loaded on lead form submission / validation       |
| `link-CysXoTHd.js`               | `62,680`  | `22,303`   | Shared router link / navigation primitives                           |
| `ops-Bnb9aDBv.js`                | `74,607`  | `15,427`   | Route chunk for private `/ops` staff CRM                             |
| `ConsultationDrawer-DOxQc6OG.js` | `44,350`  | `13,535`   | Lazy: loaded when the consultation drawer is opened                  |
| `dist-CJIH3hN-.js`               | `37,732`  | `12,662`   | Shared query client runtime                                          |

---

## 5. Honest Measurement Limitations

1. **No Field CrUX / Real-User INP Data:** All measurements are synthetic Lighthouse lab runs against a local loopback production Node server (`127.0.0.1:45745`). No real-user Chrome UX Report (CrUX) or field Interaction to Next Paint (INP) telemetry exists prior to commercial traffic.
2. **TBT as Lab Proxy:** Total Blocking Time (`0 ms` across all 16 runs) is a synthetic lab proxy for main-thread responsiveness, not field INP.
3. **Loopback TTFB:** Observed `1–4 ms` TTFB reflects local Node SSR rendering latency, not edge/CDN or geographic network latency.
