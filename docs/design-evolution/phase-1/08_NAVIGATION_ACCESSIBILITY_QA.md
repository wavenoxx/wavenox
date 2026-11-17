# Phase 1 Workstream 3 — Navigation & Footer Accessibility QA Report

## 1. Accessibility & Interaction Audit Matrix

All accessibility checks were executed against a production Node SSR build (`NITRO_PRESET=node-server npm run build`) running in Chromium via Playwright and `@axe-core/playwright` (`wcag2a`, `wcag2aa`, `wcag21aa`, `wcag22aa`).

| Surface / Flow                                                          | Tested Mechanism                                                             | Measured Outcome                                                                                                                                     |
| ----------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Desktop Top Rail (`1024×768`, `1440×900`, `1920×1080`)                  | Bounding rect check across all 5 nav links + CTA                             | `maxNavHeight: 33px`, `topSpreadPx: 0px`, `overflowPx: 0`, single horizontal line                                                                    |
| Direct `Design Studio` Link                                             | DOM attribute check + pointer click                                          | No `aria-expanded` / `aria-haspopup`; hovers close open MegaMenus; click navigates directly to `/deploy`                                             |
| Keyboard Tab Without Obscuring Flyout                                   | `.focus()` on top-level `Solar Panels` link                                  | `#wavenox-megamenu` remains closed (`openedOnFocus: false`) so content below header is never unexpectedly obscured                                   |
| Keyboard `ArrowDown` Disclosure                                         | `ArrowDown` keypress on focused category trigger                             | Opens `#wavenox-megamenu` (`openedOnArrowDown: true`) and focuses first interactive link/button inside (`focusMovedInsideMenu: true`)                |
| Keyboard `Escape` & Focus Restoration                                   | `Escape` keypress while focus is inside `#wavenox-megamenu`                  | Closes `#wavenox-megamenu` (`closedOnEscape: true`) and restores `document.activeElement` to triggering header link (`focusRestoredToTrigger: true`) |
| Open MegaMenu Axe Scans (`solar`, `omnigrid`, `commercial`, `discover`) | `@axe-core/playwright` scoped to `#wavenox-megamenu`                         | 0 serious or critical violations across all 4 panels; 0 nested anchors (`a a`); 100% thumbnail image loads (`-640w.webp`, `loading="lazy"`)          |
| Tablet `768×1024` Header Check                                          | Viewport resize + visibility audit                                           | Desktop nav bar hidden (`isVisible: false`), `44px+` `Menu` trigger button visible, 0px overflow                                                     |
| Mobile Drawer Root & Sub-View (`390×844`)                               | Click `Menu` -> Axe scan -> click `Solar Panels` -> click `Back` -> `Escape` | 0 serious/critical Axe violations; Level 1 focuses `Back` button; returning restores focus to `Solar Panels`; `Escape` closes drawer cleanly         |
| Narrow (`320×720`), 200% Zoom (`720×450`), Short (`640×360`)            | Open & close mobile drawer + scroll width check                              | 0px horizontal overflow (`overflowPx <= 0`), full drawer scrollability intact                                                                        |
| Footer (`1440×900` & `390×844`)                                         | Axe scan + heading hierarchy + font-size + SVG audit                         | 0 serious/critical Axe violations; 4 `<h2>` landmarks; 0 leaf text nodes `< 12px`; all decorative icons `aria-hidden="true"`                         |

---

## 2. Step 8 Release Audit Lighthouse Snapshot (Post-WS3)

Measured via `node scripts/step8-tests/release-audit.mjs` on loopback production Nitro server:

| Route            | Desktop Perf | Desktop LCP | Mobile Perf | Mobile LCP | CLS | TBT  |
| ---------------- | ------------ | ----------- | ----------- | ---------- | --- | ---- |
| `/`              | 100          | 284.7 ms    | 100         | 1223.9 ms  | 0   | 0 ms |
| `/residential`   | 100          | 283.8 ms    | 100         | 1051.5 ms  | 0   | 0 ms |
| `/enterprise`    | 100          | 283.9 ms    | 100         | 1052.2 ms  | 0   | 0 ms |
| `/deploy`        | 99           | 962.0 ms    | 89          | 3751.9 ms  | 0   | 0 ms |
| `/net-metering`  | 100          | 283.7 ms    | 100         | 1061.0 ms  | 0   | 0 ms |
| `/architects`    | 100          | 243.7 ms    | 100         | 901.6 ms   | 0   | 0 ms |
| `/legal/privacy` | 100          | 243.6 ms    | 100         | 901.5 ms   | 0   | 0 ms |
| `/legal/terms`   | 100          | 243.4 ms    | 100         | 901.5 ms   | 0   | 0 ms |

_Limitations (per `scripts/step8-tests/release-audit.mjs`): Lab measurements over loopback without CrUX field INP or live Supabase/AI external latency._

---

## 3. Private Route Isolation Verification

Both automated Vitest SSR assertions (`src/components/navigation.test.tsx`) and live DOM checks confirm that zero public navigation links in `<header>`, `#wavenox-megamenu`, `[aria-label="Mobile Navigation"]`, or `<footer>` link to `/ops`, `/portal`, or internal `/api/*` endpoints.
