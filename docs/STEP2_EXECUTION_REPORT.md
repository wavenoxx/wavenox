# WAVENOX — STEP 2 EXECUTION REPORT

## Premium Solar Showroom, Homepage UX & Customer Conversion Experience

- **Repository**: `https://github.com/wavenoxx/wavenox.git`
- **Verified Step 1 Base Branch**: `feat/wavenox-step1-foundation`
- **Verified Step 1 Base Commit**: `67ef841236488dcf50ad33d0838433e1eaae341e`
- **Active Step 2 Feature Branch**: `feat/wavenox-step2-experience`
- **Production Deployment Authorized**: `NO`

---

## 1. Executive Summary

Step 2 upgrades WAVENOX's customer-facing showroom, homepage information architecture, desktop and mobile navigation, product family alignment, statutory copy accuracy, and visual asset authenticity on top of the verified Step 1 foundation (`67ef841236488dcf50ad33d0838433e1eaae341e`):

1. **Immediate Product Clarity on Homepage (`/`)**: Upgraded the homepage hero (`Solar, Designed Around Your Home`) and added the **Three Solar Paths** showcase (`#solutions`) presenting WAVENOX's three core product families (**Solar Panels for Homes** → `/residential`, **Solar + Battery Storage** → `/omnigrid`, **Commercial Solar** → `/enterprise`) with authentic imagery, capacity specs, and direct CTAs.
2. **Cohesive 8-Part Customer Journey**: Refined the homepage narrative across architectural solar (`#design`), hybrid battery outage explanation (`#outage-protection`), 3-metric indicative savings calculator (`#savings`), N-type TOPCon thermal resilience (`#heat-performance`), live inverter telemetry (`#monitoring`), 6-step consultation-to-power-on delivery (`#process`) paired with a 3-column **Built on Verifiable Engineering & Governance** summary, FAQ (`#faq`), and final consultation CTA (`#consultation`).
3. **Header & Mobile Navigation Upgrade (`Header.tsx` & `MegaMenu.tsx`)**:
   - Upgraded desktop navigation to `Solar Panels`, `Solar + Storage`, `Commercial`, `Design Studio`, and `Discover` with active route indicators (`aria-current="page"`), keyboard `ArrowDown`/`Escape` handling, and a direct desktop `Talk to Advisor` CTA.
   - Simplified the mobile top bar (`WAVENOX` wordmark + single `Menu` trigger without icon clutter) and upgraded the mobile drawer with a dual-CTA bottom dock (`Get Solar Estimate` + `Talk to a Solar Advisor`) and SPA `useNavigate()` routing.
4. **Targeted Statutory & Governance Hardening**:
   - **Workmanship Warranty Alignment**: Removed the unconditional 5-year partner workmanship warranty claim from the homepage trust summary and aligned it with [`src/routes/legal/terms.tsx`](file:///Users/bunny/.gemini/antigravity/scratch/wavenox/src/routes/legal/terms.tsx) (`authorized partner workmanship coverage as defined in your signed installation contract`).
   - **Income-tax Act, 2025 Section 33 Correction**: Corrected commercial depreciation references from `Section 34` to **`Section 33`** across commercial navigation (`Header.tsx`, `MegaMenu.tsx`), homepage (`src/routes/index.tsx`), commercial page (`src/routes/enterprise.tsx`), consultation drawer (`src/components/ConsultationDrawer.tsx`), FAQ (`src/routes/faq.tsx`, `src/data/faqData.ts`), disclosures (`src/routes/legal/disclosures.tsx`), and regulatory metadata (`src/config/regulatory.ts`). Replaced unconditional `40%` claims in navigation labels, homepage cards, and the `/enterprise` hero with qualified `Section 33` tax depreciation wording while preserving existing calculator formulas untouched for Step 3 verification.
   - **Qualified Regional Tariff Basis**: Qualified homepage trust and calculator copy (`src/routes/index.tsx`) to state that indicative residential estimates are modeled on verified Telangana (`TGERC FY 2025-26`) retail tariff slabs and MNRE central subsidy benchmarks, with state-specific DISCOM schedules confirmed during engineering site assessment and expanded regulatory engine verification scheduled for Step 3.
5. **Authentic Indian Architectural & Product Imagery (`scripts/build-images.mjs`)**:
   - Replaced the US ocean-cliff villa on `/residential` (`res-hero`), the TV-bezel render on `/omnigrid` (`omnigrid-hero`), the US highway road-marking aerial on `/enterprise` (`commercial-hero`), and the mismatched battery-tablet graphic on the homepage heat panel (`home-heat`) with authentic Indian architectural/product photography and rebuilt all responsive AVIF, WebP, JPG, and 9:16 mobile portrait assets.

---

## 2. Git Baseline & Branch Lineage

- **Base Branch**: `feat/wavenox-step1-foundation` (`67ef841236488dcf50ad33d0838433e1eaae341e`)
- **Feature Branch**: `feat/wavenox-step2-experience`
- **Main Branch Status**: Untouched (`390640d`)

---

## 3. Phase A Visual & UX Baseline Findings

Baseline screenshots were captured in explicit `DEMO` mode across `390×844`, `768×1024`, `1024×768`, and `1440×900` prior to code modifications:

- **Homepage Product Family Discovery Gap**: The baseline homepage jumped directly from the hero into full-bleed panels without a structured side-by-side comparison of WAVENOX's three core product families (`Solar Panels`, `Solar + Storage`, `Commercial`).
- **Header & Mobile Top Bar Friction**: Desktop lacked a direct consultation button in the top bar; mobile displayed extra utility icons next to `Menu`; `Header.tsx` used `window.location.href` in one sub-category action instead of SPA `useNavigate()`; `MegaMenu.tsx` still referenced a legacy `"Zero Terrace Damage Guarantee"` link label.
- **Visual Asset Mismatches**:
  - `res-hero` (`luxury_solar_villa.jpg`) showed a Western cliffside house overlooking an ocean.
  - `omnigrid-hero` (`og-core.jpg`) resembled a wall-mounted flat-screen TV bezel rather than a modular LiFePO4 battery stack + hybrid inverter.
  - `commercial-hero` (`enterprise_mw_rooftop.jpg`) showed US road markings (`ONLY`).
  - `home-heat` (`og-hero-01.jpg`) showed a tablet screen reading `"76% BATTERY RESERVE"` on a section about solar cell heat performance.

---

## 4. Product Architecture & Navigation Changes (Phases B & D)

- **[`src/components/Header.tsx`](file:///Users/bunny/.gemini/antigravity/scratch/wavenox/src/components/Header.tsx)**:
  - Structured `NAV_ITEMS` around the 5 primary customer destinations: `Solar Panels` (`/residential`), `Solar + Storage` (`/omnigrid`), `Commercial` (`/enterprise`), `Design Studio` (`/deploy`), and `Discover` (`/technology`).
  - Updated commercial quick link to `Section 33 Tax Depreciation Guide`.
  - Added active route highlighting (`aria-current="page"`), keyboard `ArrowDown` and `Escape` handlers, and a desktop `Talk to Advisor` CTA button.
  - Simplified mobile top bar to `BrandLogo` + `Menu` button, and added a dual-CTA bottom dock (`Get Solar Estimate` + `Talk to a Solar Advisor`) inside the mobile drawer.
  - Replaced `window.location.href` with TanStack Router `useNavigate()`.
- **[`src/components/MegaMenu.tsx`](file:///Users/bunny/.gemini/antigravity/scratch/wavenox/src/components/MegaMenu.tsx)**:
  - Expanded category support to `"solar" | "omnigrid" | "commercial" | "studio" | "discover" | null`.
  - Replaced e-commerce `"Order"` link labels with consultation-appropriate `"Get Estimate"`, `"Configure"`, and `"Request Assessment"`.
  - Updated commercial quick link to `Section 33 Tax Depreciation Guide`, removed legacy `"Zero Terrace Damage Guarantee"` link copy, and added `role="region"` + keyboard `Escape` support.

---

## 5. Homepage Upgrade Summary (Phase C)

- **[`src/routes/index.tsx`](file:///Users/bunny/.gemini/antigravity/scratch/wavenox/src/routes/index.tsx)**:
  1. **01 Hero (`#solar-panels`)**: Updated headline (`Solar, Designed Around Your Home`), lead copy, stats (`₹78,000 Max Central Subsidy*`, `25 Years OEM Module Warranty`, `1,490 kWh Annual Yield / kWp`), primary CTA (`Get Solar Estimate` → `/deploy`), and secondary CTA (`Talk to a Solar Advisor`).
  2. **02 Three Solar Paths (`#solutions`)**: Added a 3-column architectural product showcase for **Solar Panels for Homes** (`/residential`), **Solar + Battery Storage** (`/omnigrid`), and **Commercial Solar** (`/enterprise`, citing `Section 33 tax depreciation modeling*`).
  3. **03 Architectural Solar (`#design`)**: Highlighted flush terrace mounts, concealed conduit routing, and IS 875 (`158 km/h`) wind load rating.
  4. **04 Solar + Battery (`#outage-protection`)**: Explained why standard grid-tied solar shuts off during outages and how Omnigrid provides `< 20 ms` backup switchover, with transparent runtime disclaimers.
  5. **05 Savings Entry Point (`#savings`)**: Preserved the `estimate()` calculation engine and TGERC/MNRE disclosures while presenting a 3-metric output summary (`Recommended System`, `Est. Annual Savings`, `Central Subsidy*`), explicit qualification that indicative figures are modeled on verified Telangana (`TGERC FY 2025-26`) retail tariff slabs and MNRE benchmarks, and dual CTAs (`Open in Design Studio` + `Talk to a Solar Advisor`).
  6. **06 Built for Indian Heat (`#heat-performance`) & Live Generation (`#monitoring`)**: Paired N-type TOPCon cell physics (`-0.30% / °C`, `22.8%` efficiency, `IP68`) with the real-time inverter cloud app preview.
  7. **07 From Consultation to Power-On (`#process`)**: Expanded to a realistic 6-step delivery sequence (`01 Consultation` → `06 After-Sales Support`) with a 3-column **Built on Verifiable Engineering & Governance** trust block (`/warranty`, `/legal/disclosures`, `/our-story`) aligned with signed-contract workmanship terms and qualified regional tariff basis.
  8. **08 FAQ (`#faq`) & Final Consultation CTA (`#consultation`)**: Closed with `Plan Your Solar System with WAVENOX` (`Get Solar Estimate` + `Request Consultation`).

---

## 6. Product Page Alignment & Statutory Hardening Summary (Phase E)

- **[`src/routes/residential.tsx`](file:///Users/bunny/.gemini/antigravity/scratch/wavenox/src/routes/residential.tsx)**: Aligned hero/panel CTAs (`Get Solar Estimate`, `Talk to a Solar Advisor`, `Explore Battery Storage`) and added the **Explore Related WAVENOX Solutions** cross-navigation block.
- **[`src/routes/omnigrid.tsx`](file:///Users/bunny/.gemini/antigravity/scratch/wavenox/src/routes/omnigrid.tsx)**: Clarified automatic islanding switchover and load-dependent backup duration, updated `"100% Solar Self-Use"` to `"Up to 90% Solar Self-Use"`, aligned CTAs (`Configure Solar + Storage`, `Talk to a Solar Advisor`), and added related solutions navigation.
- **[`src/routes/enterprise.tsx`](file:///Users/bunny/.gemini/antigravity/scratch/wavenox/src/routes/enterprise.tsx)**:
  - Corrected statutory citations from `Section 34` to **`Section 33`** of the Income-tax Act, 2025 (succeeding Section 32 of the 1961 Act).
  - Updated hero stat from unconditional `"40%"` to `"Sec 33"` (`Tax Depreciation*`) with a clear disclaimer that depreciation deductions depend on applicable 2026 block schedules and corporate tax regime.
  - Preserved existing calculator formulas (`depreciationRate = commissionedHalf === "H1" ? 0.4 : 0.2`) without speculative changes, while labeling calculator outputs as illustrative `Section 33` models and adding the **Explore Related WAVENOX Solutions** cross-navigation block.

---

## 7. Design Studio & Consultation Flow Verification (Phase F)

- Verified that all Step 1 lead security controls, DPDP Act 2023 consent checkboxes, explicit `DEMO` vs `LIVE` mode separation, `/deploy` URL search-param handoff (`?bill=...&discom=...`), and `/order/received` stale/missing session-storage protections remain 100% intact.

---

## 8. Visual System & Responsive Refinements (Phase G)

- **[`src/components/system/Panel.tsx`](file:///Users/bunny/.gemini/antigravity/scratch/wavenox/src/components/system/Panel.tsx)**: Tuned vertical padding (`pt-20 sm:pt-24 lg:pt-28`, `pb-8 sm:pb-10 lg:pb-12`) and fluid heading typography so `1024×768` landscape viewports and `390×844` mobile viewports maintain clean separation between top copy and bottom stats/CTAs.

---

## 9. Photography & Media Audit and Asset Changes (Phase H)

- Updated master sources and rebuilt all responsive variants (`640w`, `1080w`, `1600w`, `1920w`, plus `1080×1920` mobile 9:16 portrait in AVIF, WebP, and JPG) via [`scripts/build-images.mjs`](file:///Users/bunny/.gemini/antigravity/scratch/wavenox/scripts/build-images.mjs):
  - `res-hero` (`src/assets/luxury_solar_villa.jpg`): Replaced US ocean-cliff house with a contemporary Indian sandstone and teakwood villa at dusk with a flat RCC rooftop solar array (`259 KB` at `1600w` AVIF).
  - `omnigrid-hero` (`src/assets/og-core.jpg`): Replaced TV-bezel render with 3 stacked matte-graphite modular battery enclosures on a concrete plinth + wall-mounted hybrid inverter (`136 KB` at `1600w` AVIF).
  - `commercial-hero` (`src/assets/enterprise_mw_rooftop.jpg`): Replaced US highway aerial with a Deccan industrial manufacturing facility rooftop covered with solar rows at sunrise (`198 KB` at `1600w` AVIF).
  - `home-heat`: Pointed to `src/assets/res-tile.jpg` (macro close-up of dark N-type solar cell surface catching warm sunlight, `173 KB` at `1600w` AVIF) instead of the `og-hero-01.jpg` battery tablet render.

---

## 10. Performance, SEO & Accessibility Verification (Phases I & J)

- **Single `<h1>` & `<main>`**: Verified `h1Count === 1` and `mainCount === 1` across all 17 routes.
- **12px Minimum Text Size**: Verified `sub12pxCount === 0` across all 17 routes and inside header dialogs.
- **WCAG 2.1 AA (`@axe-core/playwright`)**: Verified `0` serious or critical violations across all 17 routes.
- **Zero Horizontal Overflow**: Verified `scrollWidth - innerWidth <= 0` across `390×844`, `768×1024`, `1024×768`, and `1440×900`.
- **Copy Lint**: Verified `0` banned marketing buzzwords across `src/`.

---

## 11. Automated Test Results (Phase K)

| Suite                                           | Command            | Result                                                           |
| :---------------------------------------------- | :----------------- | :--------------------------------------------------------------- |
| Unit & Integration Tests                        | `npm test`         | **PASS** (`5` test files, `56/56` tests passed)                  |
| ESLint & Copy Lint                              | `npm run lint`     | **PASS** (`0` errors, `0` banned words)                          |
| TypeScript Check                                | `npx tsc --noEmit` | **PASS** (`0` errors)                                            |
| Production Build                                | `npm run build`    | **PASS** (Client + SSR Nitro build succeeded)                    |
| Full E2E + Accessibility + Multi-Viewport Audit | `npm run test:e2e` | **PASS** (`17/17` routes + Step 2 UX & 4-viewport checks passed) |

---

## 12. Visual QA Screenshot Evidence (Before vs After)

- **Baseline BEFORE Screenshots (`26` PNGs)**: `/Users/bunny/.gemini/antigravity/brain/156e39e9-35c8-4264-9c1e-0067ed1aefe9/qa-step2-before/`
- **Verified AFTER Screenshots (`26` PNGs)**: `/Users/bunny/.gemini/antigravity/brain/156e39e9-35c8-4264-9c1e-0067ed1aefe9/qa-step2-after/`
  - Viewports verified: `390×844` (Mobile), `768×1024` (Tablet), `1024×768` (Landscape), and `1440×900` (Desktop) across `/`, `/residential`, `/omnigrid`, `/enterprise`, `/deploy`, Navigation Menu/Drawer, and Consultation Drawer.

---

## 13. Unresolved Calculations & Migration Notes for Step 3

1. **Commercial Tax Depreciation Schedule Verification (Step 3 Scope)**:
   - Under the **Income-tax Act, 2025** (effective 1 April 2026), **Section 33** governs depreciation deductions (succeeding Section 32 of the 1961 Act).
   - All user-facing references, navigation links, and metadata have been updated from `Section 34` to `Section 33`, and unconditional `40%` claims in navigation/hero cards have been removed or qualified.
   - Per Step 2 constraints, the underlying calculator formulas in [`src/routes/enterprise.tsx`](file:///Users/bunny/.gemini/antigravity/scratch/wavenox/src/routes/enterprise.tsx) (`depreciationRate = commissionedHalf === "H1" ? 0.4 : 0.2`) and [`src/config/regulatory.ts`](file:///Users/bunny/.gemini/antigravity/scratch/wavenox/src/config/regulatory.ts) (`TAX_DEPRECIATION_CONFIG`) were **not** altered based on assumptions; verifying the exact notified 2026 Appendix I block rates, half-year rules, and corporate regime caps is documented for **Step 3**.
2. **Multi-State / DISCOM Tariff Engine Verification (Step 3 Scope)**:
   - Residential savings estimates in [`src/config/solar.ts`](file:///Users/bunny/.gemini/antigravity/scratch/wavenox/src/config/solar.ts) currently use verified Telangana (`TGSPDCL` / `TGNPDCL` FY 2025-26) retail tariff slabs and MNRE PM Surya Ghar central subsidy slabs as their baseline model. Expanding and verifying state-by-state DISCOM tariff schedules across additional jurisdictions is scheduled for **Step 3**.
3. **Database Migrations (`supabase/migrations/`)**:
   - The repository's actual Supabase SQL migrations for the `public.consultations` table are:
     - [`supabase/migrations/20260923_consultations.sql`](file:///Users/bunny/.gemini/antigravity/scratch/wavenox/supabase/migrations/20260923_consultations.sql)
     - [`supabase/migrations/20260924_consultations_v2.sql`](file:///Users/bunny/.gemini/antigravity/scratch/wavenox/supabase/migrations/20260924_consultations_v2.sql)
     - [`supabase/migrations/20260926_consultations_v3.sql`](file:///Users/bunny/.gemini/antigravity/scratch/wavenox/supabase/migrations/20260926_consultations_v3.sql)
   - No production SQL migrations have been executed during Step 2.
