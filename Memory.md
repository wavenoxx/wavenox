# WAVENOX — Persistent Project Memory & Brain (`Memory.md`)

---

## 1. Project Genesis & Current State

- **Brand Name**: WAVENOX
- **Concept Attribution**: Designed & Engineered by Bunny (Clean-technology architectural solar portfolio prototype)
- **Active Branch**: `fix/audit-2026-09`
- **Current Milestone**: **All Phases (Phase 0 through Phase 7) 100% Completed & Verified**
- **Strategic Mandate**:
  - Tesla-inspired clean showroom restraint, radical subtraction, 100svh photography viewports, quiet monochrome surfaces.
  - 100% sourced statutory calculations (TGERC, MNRE, IS 875, NASA POWER).
  - 0 banned marketing buzzwords in copy.
  - Strict 12px font floor across all 17 routes.
  - 0 serious and 0 critical Axe-core accessibility violations.
  - 30/30 passing unit tests.
  - Production build clean targeting Cloudflare Pages / Workers.

---

## 2. Technical Stack State

| Parameter                | Current Value                 | Notes                                                                                         |
| :----------------------- | :---------------------------- | :-------------------------------------------------------------------------------------------- |
| **Node.js Version**      | `v26.4.0`                     | Node 26 LTS runtime                                                                           |
| **Meta-Framework**       | TanStack Start (`^1.168.26`)  | Nitro-based SSR + Vite 8                                                                      |
| **Routing**              | TanStack Router (`^1.170.16`) | Type-safe, 17 file-based routes (`src/routes/`)                                               |
| **Styling**              | Tailwind CSS v4 (`^4.2.1`)    | Native `@theme inline`, OKLCH and HEX tokens                                                  |
| **Component Primitives** | Radix UI                      | Accessible `Dialog`, `NavigationMenu`, `Popover`, ARIA standards                              |
| **Validation**           | Zod `3.x`                     | Strict type validation for inputs and RPC handlers                                            |
| **Mapping**              | Leaflet + Esri World Imagery  | Satellite rooftop usable area and obstruction sketching                                       |
| **Solar Physics**        | SunCalc & PVWatts v8          | Real-time astronomical sun-path shading & Hyderabad irradiance                                |
| **Database**             | Supabase (PostgreSQL 15+)     | RLS zero-trust policies, duplicate trigger, consent audit                                     |
| **Unit Testing**         | Vitest (`v5.0.1`)             | **30/30 tests passing** (`src/config/solar.test.ts`, `regulatory.test.ts`, `suncalc.test.ts`) |
| **E2E Testing**          | Playwright + Axe-Core         | **17/17 routes passing audit** (`scripts/run-e2e-audit.mjs`)                                  |
| **Build Target**         | Cloudflare Pages / Workers    | Output in `.output/server` and `.output/public`                                               |

---

## 3. Key Architecture & Engineering Decisions

1. **Strict 12px Text Floor:**
   - Every text element across all components, calculators, charts, and notes has been audited and enforced to `≥ 12px`.
   - Verified automatically via Playwright traversing computed styles of all leaf nodes.

2. **Axe-Core WCAG 2.1 AA Compliance:**
   - Color contrast verified across dark and light surfaces:
     - Monochrome dark: `#171A20`
     - Charcoal/body: `#393C41` (contrast ratio > 8:1)
     - High-contrast amber: `#B45309` / `#92400E` on light badges (contrast ratio ≥ 4.6:1)
     - Neutral muted: `#5C5E62` on light, `#9CA3AF` on dark.
   - Zero serious and zero critical violations across all 17 routes.

3. **Copywriting Integrity (`scripts/copy-lint.mjs`):**
   - Automatically scans `src/` for banned hyperbolic marketing words (_Atelier_, _Monolithic_, _Sovereign_, _Bespoke_, _Command Center_, etc.).
   - Replaced with calm, technically grounded engineering language.

4. **Sourced Statutory Register (`docs/SOURCES.md` & `src/config/sources.ts`):**
   - Every number on screen traces to an official authority:
     - PM Surya Ghar CFA subsidy: MNRE Guidelines (Feb 2024)
     - Telangana DISCOM tariffs: TGERC RST Order FY 2025–26
     - Solar yield: NASA POWER / NREL PVWatts v8 (1,490 kWh/kWp/yr)
     - Wind standard: IS 875 (Part 3): 2015 (44 m/s Zone II)
     - Tax depreciation: Income-tax Act Sec 32/34 (40% WDV)
     - Solar loan: SBI PM Surya Ghar lending terms (7.00% floating)
     - Data protection: DPDP Act 2023 & DPDP Rules 2025

5. **Honest Demo End-State:**
   - Forms on `/deploy` submit to an honest portfolio demonstration preview (`WNX-PREVIEW-XXXXXX`).
   - Disclaims concept prototype status while generating real indicative engineering dossiers.

---

## 4. Verification Checklist & Current Health

- [x] `npm test`: **30/30 passing**
- [x] `npm run test:e2e`: **17/17 routes passing E2E and Axe audits**
- [x] `npx tsc --noEmit`: **0 errors**
- [x] `npm run lint`: **0 errors**, **0 banned buzzwords**
- [x] `npm run build`: **Successful Nitro SSR Cloudflare build**
- [x] Secret Leak Audit: **0 matches in `.output/public`**
