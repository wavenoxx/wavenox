# WAVENOX — Phase 1 / Workstream 2: Panel, Typography & Motion QA

**Date:** 2026-11-17
**Visual Evidence Sheet:** [`docs/design-evolution/phase-1/evidence/workstream-2-panel-mobile-desktop-qa.jpg`](file:///Users/bunny/.gemini/antigravity/scratch/wavenox-step8/docs/design-evolution/phase-1/evidence/workstream-2-panel-mobile-desktop-qa.jpg)

---

## 1. Mobile Hero Layout & `<Panel>` Responsive Findings

Before Workstream 2 (`53d4daf5` baseline), inspecting rendered mobile captures exposed two concrete composition issues:

1. On `320×720`, `StatRow`'s `"1,490 kWh"` wrapped onto two lines (`1,490` / `kWh`), inflating stat block height so it climbed over the glowing windows of the Deccan hero villa.
2. `#solutions` (`1440×900`) rendered `h-10` (`40px`) raw `<Link>` buttons whose labels (`"Explore Solar Panels"`, `"Explore Commercial"`, `"Request Assessment"`) wrapped onto two lines.

### Workstream 2 Fixes Verified in Rendered Screenshots

- **`320×720` (`/`):** `"₹78,000"`, `"25 Years"`, and `"1,490 kWh"` stay single-line (`whitespace-nowrap`), with bottom dock padding (`pb-5`) and compact gaps (`gap-3`) keeping the solar roof unobstructed above the stats.
- **`390×844` (`/`, `/residential`, `/omnigrid`, `/enterprise`):** Top headline and lead sit cleanly in the upper sky/wall gradient; architectural hero subjects sit unobstructed in the middle band; dual `44px` CTAs and disclaimers sit cleanly in the lower dark scrim.
- **`640×360` (Short Landscape Viewport):** `min-h-[100svh]` replaces rigid `h-[100svh]`, preventing content clipping or vertical overlap when viewport height drops below `600px`.
- **`768×1024`, `1024×768`, `1440×900`, `1920×1080`:** `0` horizontal overflow across all tested routes (`scrollWidth - clientWidth <= 0`), all `#solutions` buttons render at `>= 44px` height on a single line, and `#savings` displays the monochrome `#F4F4F4`/`#E3E4E6` verified schedule badge with `#B45309` indicator dot.

---

## 2. Motion & Reduced-Motion Verification (`Reveal.tsx`)

- **SSR & Hydration:** `Reveal` renders initial state `"visible"` (`data-reveal="visible"` or `"immediate"` when `immediate={true}`), ensuring zero SSR/client hydration mismatch and zero LCP delay on hero headlines/actions.
- **No-JS (`javaScriptEnabled: false`):** `0` hidden `[data-reveal]` elements (`opacity: 1` for 100% of page sections).
- **Reduced Motion (`prefers-reduced-motion: reduce`):** Both the React `matchMedia` check and `@media (prefers-reduced-motion: reduce)` CSS rule force `opacity: 1 !important; transform: none !important; transition: none !important;` (`0` hidden elements).
- **Pre-Intersection / Axe Fix Caught During QA:** An initial `opacity: 0` transition applied to `"pending"` caused `1 -> 0` downward fading (`~0.04` opacity) at `150ms`, triggering an Axe `color-contrast` violation on `/omnigrid`. Removing the CSS `transition` property from `"pending"` (applying the `480ms cubic-bezier(0.16, 1, 0.3, 1)` transition strictly on `"revealed"`) eliminated the transient partial-opacity state, bringing Axe violations to **`0` across all 17 routes**.

---

## 3. Automated Quality Gate Results (Post-Final Edit)

| Command / Gate                                  |       Outcome       | Verified Result                                                                                                                                                                                                    |
| :---------------------------------------------- | :-----------------: | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm test`                                      |      **PASS**       | `19` test files passed, `196` tests passed (incl. 5 new Workstream 2 primitive tests); `4` live-DB/provider test files skipped (`35` tests skipped due to absent live Supabase/OpenAI env vars in local sandbox).  |
| `npm run lint`                                  |      **PASS**       | `0` ESLint errors (`10` pre-existing `react-refresh` warnings); `copy-lint` passed (`0` banned buzzwords).                                                                                                         |
| `npx tsc --noEmit`                              |      **PASS**       | `0` TypeScript errors.                                                                                                                                                                                             |
| `npm run build`                                 |      **PASS**       | Production client + SSR build succeeded cleanly.                                                                                                                                                                   |
| `npm run test:e2e`                              |      **PASS**       | All `17 / 17` routes HTTP 200, single `<h1>`/`<main>`, logo visible at `scrollY=0`, `0` sub-12px elements, `0` Axe serious/critical violations, `0` console errors, Steps 2–5 interactive + CRM E2E checks passed. |
| `npm run test:e2e:step6`                        |      **PASS**       | Step 6 intake, PDF, redaction, correction, fallback, override & roof checks passed.                                                                                                                                |
| `node scripts/step7-tests/browser.mjs`          |      **PASS**       | Step 7 browser journeys passed across 5 viewports.                                                                                                                                                                 |
| `NITRO_PRESET=node-server npm run build`        |      **PASS**       | Node server production build succeeded.                                                                                                                                                                            |
| `node scripts/step8-tests/release-audit.mjs`    |      **PASS**       | All 16 sitemap routes passed SEO + WCAG AA + `>= 12px` + keyboard tab checks; Lighthouse `13.6.0` passed all Step 8 budgets.                                                                                       |
| Native Supabase DB/RLS regression (`step5/7/8`) | **NOT RUN LOCALLY** | Skipped locally due to missing live Supabase credentials; delegated to GitHub CI workflow jobs on Draft PR.                                                                                                        |

---

## 4. Before vs. After Lighthouse & Core Web Vitals Lab Summary

Measured via `node scripts/step8-tests/release-audit.mjs` (Lighthouse `13.6.0`, loopback Node production server, simulated throttling):

| Route & Form Factor                             | Before (WS1B Baseline) Perf / LCP |      After (WS2) Perf / LCP      | CLS |  TBT   |       Transfer Size       |
| :---------------------------------------------- | :-------------------------------: | :------------------------------: | :-: | :----: | :-----------------------: |
| `/` (`mobile`)                                  |         `100` / `1225 ms`         |      **`100` / `1225 ms`**       | `0` | `0 ms` | `498.1 KB` (`498,086 B`)  |
| `/` (`desktop`)                                 |         `100` / `285 ms`          |       **`100` / `285 ms`**       | `0` | `0 ms` | `1.65 MB` (`1,647,754 B`) |
| `/residential` (`mobile`)                       |         `100` / `902 ms`          |      **`100` / `1052 ms`**       | `0` | `0 ms` | `381.7 KB` (`381,655 B`)  |
| `/residential` (`desktop`)                      |         `99` / `1002 ms`          |       **`100` / `284 ms`**       | `0` | `0 ms` | `1.11 MB` (`1,105,847 B`) |
| `/enterprise` (`mobile`)                        |         `92` / `3302 ms`          |      **`100` / `1052 ms`**       | `0` | `0 ms` | `378.2 KB` (`378,158 B`)  |
| `/enterprise` (`desktop`)                       |         `100` / `244 ms`          |       **`100` / `284 ms`**       | `0` | `0 ms` | `825.2 KB` (`825,171 B`)  |
| `/deploy` (`mobile`)                            |         `89` / `3752 ms`          |       **`89` / `3752 ms`**       | `0` | `0 ms` | `406.8 KB` (`406,839 B`)  |
| `/deploy` (`desktop`)                           |          `99` / `962 ms`          |       **`99` / `962 ms`**        | `0` | `0 ms` | `626.2 KB` (`626,209 B`)  |
| `/net-metering` (`mobile`)                      |         `92` / `3302 ms`          |      **`100` / `1061 ms`**       | `0` | `0 ms` | `326.7 KB` (`326,717 B`)  |
| `/net-metering` (`desktop`)                     |         `100` / `722 ms`          |       **`100` / `284 ms`**       | `0` | `0 ms` | `326.7 KB` (`326,717 B`)  |
| `/architects`, `/legal/privacy`, `/legal/terms` |   `100` (`mobile` & `desktop`)    | **`100` (`mobile` & `desktop`)** | `0` | `0 ms` |     `251.9–286.8 KB`      |
