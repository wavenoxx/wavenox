# WAVENOX — Execution Roadmap & Task Matrix (`Tasks.md`)

---

## 1. Project Phase Overview

```
┌─────────────────────────────────┐       ┌─────────────────────────────────┐       ┌─────────────────────────────────┐
│        PHASES 0 – 2             │       │        PHASES 3 – 5             │       │        PHASES 6 – 7             │
│ Foundation, Decoupling & Design │ ────► │ Pricing, Identity & Compliance  │ ────► │ New Features, QA & Final Audit  │
│          (COMPLETED ✅)          │       │          (COMPLETED ✅)          │       │          (COMPLETED ✅)          │
└─────────────────────────────────┘       └─────────────────────────────────┘       └─────────────────────────────────┘
```

---

## 2. Phase-by-Phase Completion Matrix (`docs/FIX_PLAN.md`)

### Phase 0: Ground Truth & Sanity Check (Status: COMPLETED ✅)

- [x] Sourced data from official gazettes: TGERC RST FY 2025–26, MNRE PM Surya Ghar, IS 875 (Part 3), NASA POWER, SBI Loan.
- [x] Audited existing codebase against ground truth.
- [x] Established strict copy-lint vocabulary rules.

### Phase 1: Git Hygiene & Decoupling (Status: COMPLETED ✅)

- [x] Branch initialized: `fix/audit-2026-09`.
- [x] Decoupled brand configuration in `src/config/brand.ts`.
- [x] Normalized phone, WhatsApp, and email handling.

### Phase 2: Regulatory & Financial Engine (Status: COMPLETED ✅)

- [x] Created `src/config/regulatory.ts` with PM Surya Ghar CFA subsidy engine, special category calculation, and TGERC telescopic slab schedule.
- [x] Sourced accelerated tax depreciation (Sec 32/34 40% WDV) and SBI PM Surya Ghar loan terms.
- [x] Wrote 18 comprehensive regression tests in `src/config/regulatory.test.ts`.

### Phase 3: Integrity Audit & Truthful Presentation (Status: COMPLETED ✅)

- [x] Purged all fictional entity names, non-existent addresses, and fake SLA promises.
- [x] Replaced "Zero Slab Damage Guarantee" and fake guarantees with honest engineering tolerances.
- [x] Rewrote `/our-story` as an authentic concept design statement.
- [x] Updated legal pages (`/legal/terms`, `/legal/privacy`, `/legal/disclosures`) for DPDP Act 2023 & Rules 2025.
- [x] Updated Proposal Dossier to state clearly: "Indicative solar estimate — not a quotation or engineering document".

### Phase 4: Premium Polish & Design Refinement (Status: COMPLETED ✅)

- [x] Preserved Tesla-grade DNA: 100svh photo panels, centered titles, bottom-docked stats, dual pills.
- [x] Sourced calm, authoritative voice of a Hyderabad solar architect.
- [x] Rebuilt `EnergyFlowSimulator` and `WealthCurveVisualizer` in monochrome + amber.
- [x] Added astronomical 3D Sun-Path Shading Simulator via SunCalc (`src/components/SunPathSimulator.tsx`).
- [x] Enforced copy lint (`scripts/copy-lint.mjs`) forbidding hyperbolic buzzwords.
- [x] Maintained 4-column structured footer with fine-print concept strip.

### Phase 5: Accessibility, Performance & Security (Status: COMPLETED ✅)

- [x] Radix `NavigationMenu` with full keyboard support (Enter/ArrowDown, Escape to close).
- [x] Enforced strict 12px text floor across all components.
- [x] Configured Cloudflare security headers in `public/_headers` (CSP, HSTS, X-Content-Type-Options, Permissions-Policy).
- [x] Zero-Trust server function architecture protecting secrets from client bundles.

### Phase 6: New Feature Implementations (Status: COMPLETED ✅)

- [x] **Bill Decoder**: Sourced TGERC telescopic slab breakdown (`src/components/BillDecoder.tsx`).
- [x] **Monthly Generation Chart**: Committed NASA POWER / PVWatts v8 insolation profiles (`src/components/MonthlyGenerationChart.tsx`).
- [x] **Satellite Roof Sketcher**: Leaflet + Esri World Imagery terrace usability engine (`src/components/RoofSketcher.tsx`).
- [x] **Battery Honesty Advisor**: Sourced BEE appliance runtime calculator and plain net-metering statement (`src/components/BatteryHonestyAdvisor.tsx`).
- [x] **PM Surya Ghar Journey**: Official 5-step national portal workflow and document checklist (`src/components/PmSuryaGharJourney.tsx`).
- [x] **Sourced Popovers**: Interactive `<SourcePopover>` citations on every numerical claim (`src/components/SourcePopover.tsx`).
- [x] **Telugu / English Switcher**: Bidirectional localization with hreflang tags (`src/components/LanguageToggle.tsx`, `src/lib/i18n.tsx`).
- [x] **Colophon Case Study Page**: Exhaustive portfolio center-piece route (`src/routes/about-this-project.tsx`).

### Phase 7: QA, Documentation & Final Audit (Status: COMPLETED ✅)

- [x] **Playwright E2E Audit (`npm run test:e2e`)**:
  - 17/17 routes return HTTP 200.
  - Exactly 1 `<h1>` and 1 `<main>` per route.
  - Brand logo visible at scrollY=0.
  - 0 elements with font-size < 12px across the entire application.
  - 0 serious and 0 critical Axe-core accessibility violations.
  - 0 console errors.
  - Three hero stats render on a single line at 1024px and 1440px viewports.
  - Sizing tier consistency (Home kW == Studio kW).
  - Honest demo submission end-state verified.
- [x] **Vitest Unit Test Suite (`npm test`)**: 30/30 unit tests passing.
- [x] **Lint & Format (`npm run lint` / `npm run format`)**: 0 errors, 0 banned words.
- [x] **Production Build (`npm run build`)**: Clean Nitro SSR Cloudflare build.
- [x] **Authoritative Sources Register (`docs/SOURCES.md`)**: Complete statutory index published.
- [x] **Documentation Overhaul**: `README.md`, `Rules.md`, `design.md`, `Architecture.md`, `pmd.md`, `Memory.md`, `Tasks.md` fully synchronized with reality.
