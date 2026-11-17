# Phase 1 Workstream 4 — Homepage Functional Regression Report

## 1. Automated Test & Release Gate Summary

All local checks and release gates were re-executed after the final edit to `src/routes/index.tsx`:

| Command / Gate                               | Result   | Scope & Measured Counts                                                                                                                                                                                                                           |
| -------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npx tsc --noEmit`                           | **PASS** | `0` TypeScript errors across client and server bundles                                                                                                                                                                                            |
| `npm run lint`                               | **PASS** | `0` ESLint errors, `0` warnings in Workstream 4 files, `0` banned copy terms (`scripts/copy-lint.mjs`)                                                                                                                                            |
| `npm test`                                   | **PASS** | `21` active Vitest files passed (`203` tests passed, including `3` new tests in `src/routes/-index.test.tsx` & `4` in `src/components/navigation.test.tsx`); `4` live-env gated suites (`35` tests) skipped without Supabase/provider credentials |
| `npm run build`                              | **PASS** | Clean production build (`16` sitemap routes generated)                                                                                                                                                                                            |
| `npm run test:e2e`                           | **PASS** | All `17` audited routes HTTP `200`, `0` console errors, `0` sub-`12px` elements, `0` serious/critical Axe violations, Step 1–5 functional & DISCOM checks passed                                                                                  |
| `npm run test:e2e:step6`                     | **PASS** | Desktop & mobile Step 6 intake, PDF, redaction, correction, override, and roof checks passed                                                                                                                                                      |
| `node scripts/step7-tests/browser.mjs`       | **PASS** | Step 7 portal browser suite passed across 5 viewports                                                                                                                                                                                             |
| `NITRO_PRESET=node-server npm run build`     | **PASS** | Node production server bundle built (`71` JS chunk assets, `1,789,885 B` total un-gzipped JS bundle)                                                                                                                                              |
| `node scripts/step8-tests/release-audit.mjs` | **PASS** | SEO uniqueness across 16 routes, private `/ops` & `/portal` header isolation, 16×5 WCAG 2.2 AA Axe checks, keyboard checks, and all 16 Lighthouse audits passed                                                                                   |

---

## 2. Interactive Scene & Business Logic Verification (`verify_ws4_after.mjs`)

1. **Scene 01 Hero Conversion & Consultation Drawer**: Primary CTA navigates to `/deploy`; secondary CTA opens `ConsultationDrawer`.
2. **Scene 02 Borderless Solution Paths**: Displays 3 product families (`/residential`, `/omnigrid`, `/enterprise`) and understated `/deploy` link with zero dense 6-button clutter.
3. **Scene 03 Consolidated SpecsDrawer**: Clicking `"View Technical Specs"` opens `SpecsDrawer`; `Escape` dismisses cleanly.
4. **Scene 04 Outage Protection & Illustrative Monitoring**: Upfront explanation distinguishes grid-tied anti-islanding shutoff from hybrid battery backup; `#monitoring` carries explicit `"Illustrative sample"` and `"Illustrative monitoring example"` labels with zero `"Realtime"` or `animate-pulse` status dots.
5. **Scene 05 Calculator & Query Handoff**: Default `TGSPDCL` displays `"Verified TGERC Schedule"`; switching `#discom-select` to `BESCOM` updates to `"Indicative Regional Benchmark"`; setting `#discom-select` to `APEPDCL` and bill slider to `15000` updates `"Open in Design Studio"` href dynamically to `/deploy?bill=15000&discom=APEPDCL` without `NaN` or broken output values.
6. **Scene 06 Installation Milestones**: All 6 delivery milestones (`STEP 01` through `STEP 06`) render in `3×2` desktop / `2×3` tablet / `1×6` mobile flow without claiming live per-user progress status.
7. **Scene 07 Governance & Synchronized FAQ**: All 3 governance links (`/warranty`, `/legal/disclosures`, `/our-story`) work; Radix accordion expands `"Will my solar panels work during a power outage?"` cleanly; `FAQPage` JSON-LD schema (`6` items) matches the visible accordion questions and qualified answer definitions.
8. **Scene 08 Closing Panel & Workstream 3 Footer**: Renders `data-panel-height="closing"`, opens `ConsultationDrawer` on `"Request Consultation"`, and transitions into a single Workstream 3 `<Footer />` instance.

---

## 3. Limitations & Deferred Items

- Local runs of `scripts/step5-tests/live.test.ts`, `scripts/step6-tests/provider.test.ts`, `scripts/step7-tests/database.test.ts`, and `scripts/step8-tests/security.test.ts` require live Supabase / provider credentials (`35` tests skipped locally) and are verified in the GitHub Actions `database` job on the Draft PR.
- Secondary showroom routes (`/residential`, `/omnigrid`, `/enterprise`, `/technology`) remain scheduled for Workstream 5 final polish (`P1-07`).
