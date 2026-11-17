# Phase 1 Workstream 4 — Cinematic Eight-Scene Homepage Execution Report

## 1. Executive Summary

Workstream 4 transforms the public WAVENOX homepage (`src/routes/index.tsx`) from the legacy ten-section layout into a cohesive **Eight-Scene Architectural Storytelling** sequence without altering solar physics, tariff calculations, backend APIs, authentication, or database behavior.

- **Base Commit (`origin/main`)**: `89af69881a661284e90a14e870f599d41512baf5` (Phase 1 Workstream 3 PR #18 merge commit)
- **Feature Branch**: `feat/wavenox-phase1-ws4-cinematic-homepage`
- **Primary Modified File**: `src/routes/index.tsx`
- **Homepage Test Suite**: `src/routes/-index.test.tsx`
- **Visual Comparison Sheet**: `docs/design-evolution/phase-1/evidence/workstream-4-homepage-eight-scene-qa.jpg`

---

## 2. Ten-Section to Eight-Scene Consolidation Architecture

| Legacy Baseline (`89af6988`)                                                         | Workstream 4 Eight-Scene Mapping                                                          | Key Improvements & Preserved Contracts                                                                                                                                                                                                                                                               |
| ------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. `#solar-panels` (`Panel` full-bleed)                                              | **Scene 01 — Architectural Solar Hero** (`#solar-panels`)                                 | Concise 1-sentence lead; protected mobile safe zone; qualified `₹78,000`, `25 Years`, `1,490 kWh` stats; `/deploy` + Consultation Drawer CTAs; responsive AVIF preloads preserved (`1` hero request per viewport).                                                                                   |
| 2. `#solutions` (`QuietSection`, 3 bordered cards, 9 bullets, 6 buttons)             | **Scene 02 — Three Solar Paths** (`#solutions`)                                           | Replaced dense bordered boxes, bullet lists, and 6 buttons with a borderless 3-column architectural gallery (`res-hero`, `omnigrid-hero`, `commercial-hero`), 1 primary button per family (`/residential`, `/omnigrid`, `/enterprise`), and one understated section link to `/deploy`.               |
| 3. `#design` (`Panel`) + 6. `#heat-performance` (`Panel`)                            | **Scene 03 — Rooftop Beauty & Engineering** (`#design` + `#heat-performance`)             | Merged solar architecture (`home-design`) and thermal/wind metrics (`-0.30% / °C`, `22.45%+`, `158 km/h`) into one authoritative `Panel` with `SpecsDrawer` trigger and `/residential` CTA, eliminating a duplicate `100svh` section while keeping `#heat-performance` cleanly scrollable.           |
| 4. `#outage-protection` (`Panel`) + 7. `#monitoring` (`QuietSection` centered phone) | **Scene 04 — Solar + Storage & Energy Visibility** (`#outage-protection` + `#monitoring`) | Leads upfront with the anti-islanding safety distinction (`home-outage`), qualified storage metrics (`< 20 ms*`, `14.3 kWh`, `6.0 kW*`), and pairs `#monitoring` as an editorial 12-column split explicitly labeled `"Illustrative monitoring example"` (removing `"Realtime"` and `animate-pulse`). |
| 5. `#savings` (`QuietSection` white card with duplicate mid-card paragraph)          | **Scene 05 — Personalized Design & Savings** (`#savings`)                                 | Preserves `estimate({ monthlyBillInr, discomCode, segment: "residential" })`, `#discom-select`, slider, status badge (`Verified TGERC/APERC Schedule` vs. `Indicative Regional Benchmark`), and `/deploy?bill=...&discom=...` handoff while consolidating disclosures into one clean bottom block.   |
| 8. `#process` (`lg:grid-cols-6` squeezed boxes + 3 `TRUST_CARDS`)                    | **Scene 06 — From Consultation to Power-On** (`#process`)                                 | Reformatted 6 delivery milestones (`01 Consultation` through `06 After-Sales Support`) into a borderless `3×2` architectural grid with top `1px` hairlines and discreet `/net-metering` workflow link.                                                                                               |
| 9. `#faq` (`Faq`) + governance `TRUST_CARDS`                                         | **Scene 07 — Governance & FAQs** (`#faq`)                                                 | Elevated the 3 governance pillars (`Three-Tier Warranty Clarity`, `Transparent Tariff & Subsidy Basis`, `Coordinated Delivery & Privacy`) cleanly above the 6-item `Faq` accordion, with synchronized, non-absolute `FAQPage` JSON-LD.                                                               |
| 10. `#consultation` (`100svh` Panel) + `<Footer />`                                  | **Scene 08 — Final Consultation & Footer** (`#consultation`)                              | Uses Workstream 2 `Panel height="closing"` over `home-final` with qualified metrics (`15 Mins` initial advisory call, `₹0` online sizing preview), `/deploy` + Consultation Drawer triggers, and the Workstream 3 `<Footer />`.                                                                      |

---

## 3. Component Reuse & Integrity Preservation

- **Reused Without Rewrites**: `Panel`, `QuietSection`, `StatRow`, `Button`, `TextLink`, `SpecsDrawer`, `Faq`, `Media`, `Header`, `Footer`, and `ConsultationDrawer`.
- **Unchanged Engines & Security Boundaries**: `estimate()` (`src/config/solar.ts`), `DISCOMS`, `SOURCES_CATALOG`, `BRAND_CONFIG`, `PRODUCTS_CONFIG`, Supabase migrations, CRM auth, customer portal isolation, and LIVE/DEMO mode gates remain completely untouched.
- **Technical & Copy Discipline**: Zero banned buzzwords (`npm run lint` copy check passed); all uncertified product specifications and conditional subsidy/runtime statements are explicitly qualified.
