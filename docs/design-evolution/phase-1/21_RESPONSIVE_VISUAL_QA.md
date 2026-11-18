# PHASE 1 — DELIVERABLE 21: NINE-VIEWPORT RESPONSIVE VISUAL QA & ACCESSIBILITY AUDIT

**Document ID:** `21_RESPONSIVE_VISUAL_QA.md`
**Base Commit (`main`):** `542e2ccd311f08bfa5bb4fded7b8e17d216abaa7`
**Feature Branch:** `feat/wavenox-premium-design-dna-realignment`
**Evidence Contact Sheets:**

- `docs/design-evolution/phase-1/evidence/design-dna-desktop-before-after-qa.jpg`
- `docs/design-evolution/phase-1/evidence/design-dna-mobile-before-after-qa.jpg`

---

## 1. Mandatory Nine-Viewport Structural & Visual Matrix

All nine mandatory viewports (`320×720` through `1920×1080`) were audited against the production Node build using Playwright Chromium:

| Viewport          | Device Class                | DPR      | Horizontal Overflow (`px`) | Hero Frame (`#solar-panels`) | Selected Hero Asset (`currentSrc`) | All 10 Legacy Anchors Present | Sub-`12px` Text Violations | Visual Composition Status                                                                                  |
| ----------------- | --------------------------- | -------- | -------------------------- | ---------------------------- | ---------------------------------- | ----------------------------- | -------------------------- | ---------------------------------------------------------------------------------------------------------- |
| **`320 × 720`**   | Small Mobile                | `2x`     | `0px`                      | `320 × 400` (`1122:1402`)    | `home-hero-v3-mobile-1122w.webp`   | `10 / 10`                     | `0`                        | **PASS** — Side-by-side CTAs fit cleanly; zero roof overlap.                                               |
| **`360 × 800`**   | Standard Android            | `2x`     | `0px`                      | `360 × 450` (`1122:1402`)    | `home-hero-v3-mobile-1122w.webp`   | `10 / 10`                     | `0`                        | **PASS** — Full portrait hero visible; Scene 3 inset terrace un-cropped.                                   |
| **`390 × 844`**   | Primary Modern iPhone       | `3x`     | `0px`                      | `390 × 487` (`1122:1402`)    | `home-hero-v3-mobile-1122w.webp`   | `10 / 10`                     | `0`                        | **PASS** — Zero bottom gray blur; Scene 3 & 4A footnotes 100% unclipped.                                   |
| **`412 × 915`**   | Large Android               | `2.625x` | `0px`                      | `412 × 515` (`1122:1402`)    | `home-hero-v3-mobile-1122w.webp`   | `10 / 10`                     | `0`                        | **PASS** — Clean vertical rhythm across all 8 scenes + Footer.                                             |
| **`430 × 932`**   | Pro Max Mobile              | `3x`     | `0px`                      | `430 × 537` (`1122:1402`)    | `home-hero-v3-mobile-1122w.webp`   | `10 / 10`                     | `0`                        | **PASS** — Generous negative sky space; crisp tabular metrics.                                             |
| **`768 × 1024`**  | Tablet Portrait             | `2x`     | `0px`                      | `768 × 960` (`1122:1402`)    | `home-hero-v3-mobile-1122w.webp`   | `10 / 10`                     | `0`                        | **PASS** — Exact `max-[769px]:aspect-[1122/1402]` alignment matches `<source media="(max-width: 768px)">`. |
| **`1024 × 768`**  | Compact Desktop / Landscape | `1x`     | `0px`                      | `1024 × 768` (`100svh`)      | `home-hero-v3-1080w.webp`          | `10 / 10`                     | `0`                        | **PASS** — 5-item desktop nav rail active; unobstructed center focal band.                                 |
| **`1440 × 900`**  | Primary Desktop             | `1x`     | `0px`                      | `1440 × 900` (`100svh`)      | `home-hero-v3-1672w.webp`          | `10 / 10`                     | `0`                        | **PASS** — `1240px` editorial grid alignment; single-line H2s in Scenes 4A & 8.                            |
| **`1920 × 1080`** | Large Widescreen Desktop    | `1x`     | `0px`                      | `1920 × 1080` (`100svh`)     | `home-hero-v3-1672w.webp`          | `10 / 10`                     | `0`                        | **PASS** — Editorial containers capped at `1240px`; line measure `<= 65ch`.                                |

---

## 2. Zoom, Motion, Keyboard & Anchor Verification

| Check                                                      | Test Method                                                                                                                                                                                                                                                                                                                  | Result                                                                                                                            |
| ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| **200% Browser Zoom (`WCAG 1.4.4`)**                       | Playwright `1280×800` at `zoom: 2` + `min-h-[44px] py-2.5` button architecture                                                                                                                                                                                                                                               | **PASS** — `0px` horizontal overflow; buttons expand vertically without text clipping.                                            |
| **Reduced-Motion Mode (`prefers-reduced-motion: reduce`)** | Playwright context `reducedMotion: "reduce"` + `@media (prefers-reduced-motion: reduce)` CSS rule                                                                                                                                                                                                                            | **PASS** — `[data-reveal]` elements render at `opacity: 1; transform: none; transition: none`.                                    |
| **Ten Legacy Section Anchors**                             | Verified unique presence and scroll target resolution for `#solar-panels`, `#solutions`, `#design`, `#heat-performance`, `#outage-protection`, `#monitoring`, `#savings`, `#process`, `#faq`, and `#consultation`                                                                                                            | **PASS** — All 10 IDs exist uniquely (`1` match each) with `scroll-mt-14` / `scroll-mt-24` clearance for the `56px` fixed header. |
| **Interactive Flows**                                      | Verified Hero `Design Your System` -> `/deploy`, Hero `Book a Consultation` -> `ConsultationDrawer`, Scene 3 `View Technical Specs` -> `SpecsDrawer`, Scene 5 `#discom-select` (`TGSPDCL` -> `BESCOM`) and `/deploy?bill=8000&discom=TGSPDCL` handoff, Scene 7 `<Faq>` accordion toggle, and Mobile `Menu` drill-down drawer | **PASS** — All interactive journeys pass automated Playwright verification.                                                       |
