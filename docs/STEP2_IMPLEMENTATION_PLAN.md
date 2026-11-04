# WAVENOX — Step 2 Implementation Plan

## Premium Solar Showroom, Homepage UX & Customer Conversion Experience

**Date:** 2026-11-05  
**Repository:** `https://github.com/wavenoxx/wavenox.git`  
**Verified Step 1 Base Branch:** `feat/wavenox-step1-foundation`  
**Verified Step 1 Base Commit:** `67ef841236488dcf50ad33d0838433e1eaae341e`  
**Step 2 Feature Branch:** `feat/wavenox-step2-experience`

---

## 1. Baseline Observations

Before modifying any code, we inspected the repository documentation (`AGENTS.md`, `design.md`, `Rules.md`, `Architecture.md`, `docs/IMAGE_BRIEF.md`, `docs/STEP1_FINAL_VERIFICATION.md`), audited the component and route architecture, and captured full-viewport and full-page baseline screenshots across `390×844` (Mobile), `768×1024` (Tablet), `1024×768` (Landscape), and `1440×900` (Desktop) in explicit `DEMO` mode (`/Users/bunny/.gemini/antigravity/brain/156e39e9-35c8-4264-9c1e-0067ed1aefe9/qa-step2-before/`).

### What Already Works Well (Preserved)

1. **Showroom Visual System (`Panel`, `QuietSection`, `Media`, `StatRow`, `Button`)**: The monochrome palette (`#FFFFFF`, `#F4F4F4`, `#171A20`, `#393C41`) with functional amber (`#F57C00` / `#B45309`) and responsive `<picture>` media pipeline (`AVIF`, `WebP`, `JPG`, plus 9:16 mobile portrait crops) provides a strong architectural foundation.
2. **Sourced Calculation Engines (`src/config/solar.ts`, `src/config/regulatory.ts`)**: The TGERC FY 2025-26 telescopic bill decoder, PM Surya Ghar CFA calculation, NASA POWER 1,490 kWh/kWp/yr insolation model, and `BatteryHonestyAdvisor` work reliably and are covered by unit tests.
3. **Hardened Lead Pipeline (`src/functions/leads.ts`)**: Step 1 fail-closed `LIVE` mode, explicit `DEMO` mode (`WNX-DEMO-XXXXXX`), DPDP consent enforcement, and v3/v2 schema compatibility work cleanly across all 5 enquiry sources.

---

## 2. UX & Conversion Problems Found in Baseline Audit

1. **Ambiguous Navigation Labels & Hidden Design Studio CTA (`src/components/Header.tsx`, `src/components/MegaMenu.tsx`)**:
   - Desktop navigation lists both `"Rooftop Solar"` (`/`) and `"Homes"` (`/residential`), which blurs the distinction between the brand overview and residential solar panels.
   - The interactive **Design Studio** (`/deploy`) is buried under a generic `<User />` icon in the top-right header utility bar or inside `"Discover"`, rather than being a clear, first-class navigation and estimate entry point.
   - Desktop header lacks a clear primary action (`Get Estimate` / `Talk to Advisor`) in the right utility area.
   - In `Header.tsx` (line 649), clicking the primary CTA inside a mobile drill-down category uses `window.location.href = ...` (forcing a full browser reload) instead of client-side router navigation.
   - Several navigation descriptions in `Header.tsx` and `MegaMenu.tsx` still contain pre-Step-1 absolute claims (`"Zero Terrace Damage Guarantee"`, `"99.9% uptime compliance"`, `"up to 50 m/s"`, `"7 premier Indian luxury states"`) or e-commerce `"Order"` labels (`orderLabel: "Order"`) instead of `"Get Estimate"` / `"Configure"`.
2. **Homepage Hero & Story Flow Gaps (`src/routes/index.tsx`)**:
   - **Hero Panel (`#solar-panels`)**: Displays `"24/7 Outage Protection"` in the primary hero stat row without clarifying that grid-tied solar requires adding battery storage for outage backup, and uses generic `"Design Yours"` / `"Schedule Consultation"` labels instead of clear customer actions (`"Get Solar Estimate"` / `"Talk to a Solar Advisor"`).
   - **Solar + Battery Explanation (`#outage-protection`)**: Does not explicitly explain to first-time solar buyers _why_ standard grid-tied solar shuts off during utility blackouts and how pairing a hybrid inverter + battery storage provides backup power (with runtime dependent on connected loads).
   - **Missing Unified Product Family Discovery**: First-time visitors landing on `/` are not presented with a clear side-by-side comparison of WAVENOX's three core product families (**Residential Solar Panels**, **Solar + Battery Storage**, and **Commercial Solar**) to self-select their path.
   - **Process Journey (`#process`)**: Currently lists 5 brief items (`"15-minute roof feasibility review..."`) without covering the full 6-stage coordinated customer journey from **Consultation → Site Assessment → System Design & Quotation → Installation Coordination → Utility Approval & Commissioning → After-Sales Coordination** or clarifying that timelines depend on site readiness and DISCOM approvals.
   - **Trust & Responsibility Clarity**: Lacks a concise homepage section summarizing WAVENOX's transparent 3-tier warranty structure (OEM hardware, authorized partner workmanship, WAVENOX support coordination) and sourced regulatory calculations.
3. **Product Page Entry & Cross-Navigation Consistency (`/residential`, `/omnigrid`, `/enterprise`)**:
   - CTA labels vary inconsistently (`"Design Yours"` vs `"Configure Omnigrid"` vs `"Schedule Consultation"`).
   - `/omnigrid` Panel 3 (`#sunset-power`) displays `"100% Solar Self-Use"` in `StatRow` instead of the sourced `90% Est. Self-Use` model from `src/config/solar.ts`, and its hero copy can more clearly state that backup duration depends on installed capacity and active loads.
   - None of the three product pages (`/residential`, `/omnigrid`, `/enterprise`) provide a clean cross-navigation discovery section at the bottom for visitors who want to explore the other two product families (e.g., a residential visitor exploring Omnigrid battery backup, or a business owner moving from residential to commercial solar).

---

## 3. Design Rationale & Homepage Journey Architecture

Following the official Tesla Solar Panels reference principles (product-first clarity, calm photographic hierarchy, concise customer-friendly explanations, and honest consultation-to-activation stages) while keeping WAVENOX 100% original and tailored to Indian rooftops and regulations, the homepage (`src/routes/index.tsx`) will guide visitors through an 8-stage narrative:

1. **01 — Immediate Product Clarity (`#solar-panels` Hero Panel)**:
   - **H1**: `Solar, Designed Around Your Home`
   - **Lead**: `Explore rooftop solar and battery storage engineered for Indian homes, with a coordinated journey from consultation to commissioning.`
   - **Stats**: `₹78,000` (`Max Central Subsidy*`), `25 Years` (`OEM Module Warranty`), `1,490 kWh` (`Annual Yield / kWp`)
   - **Primary CTA**: `Get Solar Estimate` (`/deploy`)
   - **Secondary CTA**: `Talk to a Solar Advisor` (`openConsultationDrawer()`)
2. **02 — Three Clear Solution Paths (`#solutions` QuietSection)**:
   - Restrained 3-column architectural showcase introducing:
     1. **Solar Panels** (`/residential`) — Low-profile terrace & pergola systems for independent homes and villas (`Explore Solar Panels →`).
     2. **Solar + Storage** (`/omnigrid`) — Modular LFP battery backup (`14.3 kWh` per unit, `< 20 ms` switchover) for grid outages and evening loads (`Explore Battery Storage →`).
     3. **Commercial Solar** (`/enterprise`) — High-yield industrial and corporate rooftop arrays with Section 33 tax depreciation modeling (`Explore Commercial Solar →`).
3. **03 — Architectural Solar Design (`#design` Panel)**:
   - Low-profile all-black N-type TOPCon modules and elevated terrace pergolas that preserve usable rooftop space, with concealed cable raceways and non-penetrating or sealed anchor options.
   - **CTAs**: `Explore Solar Panels` (`/residential`) and `Get Solar Estimate` (`/deploy`).
4. **04 — Solar + Battery Outage Resilience (`#outage-protection` Panel)**:
   - Clear customer education: standard grid-tied solar shuts down during grid outages for utility safety; pairing Omnigrid battery storage and a hybrid inverter keeps essential home loads and air conditioning running, with backup duration determined by installed capacity and active appliance load.
   - **CTAs**: `Explore Battery Storage` (`/omnigrid`) and `Get Solar Estimate` (`/deploy`).
5. **05 — Simple Energy Savings Entry Point (`#savings` QuietSection)**:
   - Preserves the exact `estimate()` calculation engine while presenting a clear 3-metric output summary (**Recommended System kW**, **Indicative Annual Bill Savings**, **PM Surya Ghar Subsidy up to ₹78,000**), clear indicative-estimate caveats, and direct CTAs (`Get Solar Estimate` passing `bill` & `discom` to `/deploy`, plus `Talk to a Solar Advisor`).
6. **06 — Built for Indian Heat & Real-Time Telemetry (`#heat-performance` Panel & `#monitoring` QuietSection)**:
   - Highlights N-type TOPCon thermal performance (`-0.30% / °C`, `22.8%` efficiency) and real-time production/consumption visibility via the inverter manufacturer's cloud app.
7. **07 — From Consultation to Power-On & Trust Through Clarity (`#process` QuietSection)**:
   - 6-stage realistic customer journey:
     1. `01 · Consultation`
     2. `02 · Site Assessment`
     3. `03 · System Design & Quotation`
     4. `04 · Installation Coordination`
     5. `05 · Utility Approval & Commissioning`
     6. `06 · After-Sales Coordination`
   - Paired with a concise **Trust Through Clarity** governance strip explaining WAVENOX's 3-tier warranty structure (OEM hardware, partner workmanship, WAVENOX coordination), sourced DISCOM/MNRE calculations, and feasibility caveats.
8. **08 — Questions & Answers (`#faq`) & Final Consultation CTA (`#consultation` Panel)**:
   - Concise FAQ accordion + final full-bleed panel (`"Plan Your Solar System with WAVENOX"`) with `Get Solar Estimate` (`/deploy`) and `Request Consultation` (`openConsultationDrawer()`).

---

## 4. Intended Files to Change

| File                                | Planned Changes                                                                                                                                                                                                                                                                                                                                      |
| :---------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/routes/index.tsx`              | Implement the refined 8-stage homepage narrative, 3-solution discovery section, 6-step consultation-to-commissioning journey, trust-through-clarity strip, and clear primary/secondary CTAs.                                                                                                                                                         |
| `src/components/Header.tsx`         | Refine navigation hierarchy (`Solar Panels`, `Solar + Storage`, `Commercial`, `Design Studio`, `Discover`), add active route state (`aria-current="page"`), add a clean desktop `Get Estimate` / `Talk to Advisor` action, replace `window.location.href` with SPA router navigation, and remove legacy absolute claims in mobile menu descriptions. |
| `src/components/MegaMenu.tsx`       | Align mega-menu categories with the refined header navigation, replace e-commerce `"Order"` labels with `"Get Estimate"` / `"Configure"`, remove legacy `"Zero Terrace Damage Guarantee"` wording, and improve keyboard focus/Escape handling.                                                                                                       |
| `src/components/system/Panel.tsx`   | Ensure short-height / mobile landscape viewports (`1024×768`, small phones) handle `100svh` gracefully without clipping top headlines or bottom CTA docks.                                                                                                                                                                                           |
| `src/routes/residential.tsx`        | Align hero and section CTAs (`Get Solar Estimate`, `Talk to a Solar Advisor`), refine supporting copy, and add a restrained product-family cross-navigation section.                                                                                                                                                                                 |
| `src/routes/omnigrid.tsx`           | Clarify solar + storage relationship and load-dependent backup runtime, update `"100% Solar Self-Use"` to sourced `"Up to 90% Solar Self-Use"`, align CTAs, and add product-family cross-navigation.                                                                                                                                                 |
| `src/routes/enterprise.tsx`         | Align hero and section CTAs (`Request Commercial Assessment`, `Calculate Commercial Yield`, `Talk to a Solar Advisor`) and add product-family cross-navigation.                                                                                                                                                                                      |
| `scripts/run-e2e-audit.mjs`         | Expand automated Playwright E2E tests to verify Step 2 homepage CTAs, 3 product family links, mobile menu open/close + Escape key, Consultation Drawer trigger, and `1024×768` landscape viewport checks.                                                                                                                                            |
| `docs/STEP2_IMPLEMENTATION_PLAN.md` | This implementation plan.                                                                                                                                                                                                                                                                                                                            |
| `docs/STEP2_EXECUTION_REPORT.md`    | Comprehensive verification report with before/after screenshot paths, CTA matrix, accessibility, performance, and test results.                                                                                                                                                                                                                      |

---

## 5. Risk Assessment & Safeguards

- **Copy-Lint Compliance (`scripts/copy-lint.mjs`)**: All new or edited copy must strictly avoid banned hyperbolic words (`seamless`, `bespoke`, `ultra-luxury`, `unparalleled`, `elevate`, `pillars`, `charter`, `dossier`, etc.) and maintain the 12px minimum font size floor.
- **Zero Lead-Pipeline Regression**: `src/functions/leads.ts`, `src/server/supabase.ts`, and form submission handlers remain untouched so Step 1 fail-closed `LIVE` mode and explicit `DEMO` mode guarantees are 100% preserved.
- **Single `<h1>` & `<main>` Invariant**: Every route must preserve exactly one `<h1>` and one `<main>`, verified by `npm run test:e2e`.

---

## 6. Acceptance Criteria

1. Visitors landing on `/` immediately understand WAVENOX's offering, value proposition, and next steps (`Get Solar Estimate` and `Talk to a Solar Advisor`).
2. All three product families (`Solar Panels` → `/residential`, `Solar + Storage` → `/omnigrid`, `Commercial Solar` → `/enterprise`) and the `Design Studio` (`/deploy`) are effortlessly discoverable from the homepage, desktop header, and mobile menu.
3. All CTAs navigate to real working routes or open the `ConsultationDrawer`.
4. Zero horizontal overflow, zero text `< 12px`, zero console errors, and zero serious/critical Axe accessibility violations across `390×844`, `768×1024`, `1024×768`, and `1440×900`.
5. `npm test`, `npm run lint`, `npx tsc --noEmit`, `npm run build`, and `npm run test:e2e` all pass with 0 errors.
