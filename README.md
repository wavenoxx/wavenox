# WAVENOX — Architectural Solar & Clean Energy Platform

WAVENOX is an architectural clean-technology demonstration and portfolio concept platform showcasing low-profile rooftop solar, LiFePO4 home battery storage, and commercial megawatt infrastructure tailored for India.

Engineered with **TanStack Start**, **React 19**, **Tailwind CSS v4**, and **Nitro SSR**, targeting Cloudflare Pages / Workers.

Designed with Tesla-grade aesthetic restraint, monumental 100svh photography viewports, quiet monochrome surfaces, and 100% sourced statutory calculations (TGERC, MNRE, IS 875, NASA POWER).

---

## 1. Technical Stack Overview

| Layer              | Technology                     | Details                                                                   |
| :----------------- | :----------------------------- | :------------------------------------------------------------------------ |
| **Meta-Framework** | TanStack Start `1.168.x`       | Full-stack React with type-safe server functions (`createServerFn`)       |
| **Routing**        | TanStack Router `1.170.x`      | Fully type-safe file-based routing (`src/routes/`)                        |
| **View Layer**     | React 19 + TypeScript          | Strict typing, zero `any` policy                                          |
| **Styling**        | Tailwind CSS v4                | Native CSS theme integration (`@theme inline`), OKLCH & HEX tokens        |
| **Primitives**     | Radix UI                       | Accessible `Dialog`, `NavigationMenu`, `Popover`, ARIA standards          |
| **Validation**     | Zod `3.x`                      | Schema validation for lead payloads and URL search params                 |
| **Mapping**        | Leaflet + Esri World Imagery   | Satellite rooftop usable area and obstruction sketching                   |
| **Solar Physics**  | SunCalc & PVWatts v8           | Real-time astronomical sun-path shading & Hyderabad irradiance profiles   |
| **Auditing & QA**  | Playwright + Axe-Core + Vitest | Automated E2E route audit, WCAG 2.1 AA accessibility, and financial tests |
| **Database**       | Supabase (PostgreSQL 15+)      | Zero-Trust RLS, honeypot suppression, DPDP audit logging                  |
| **Build / SSR**    | Vite 8 + Nitro                 | Bundled for Cloudflare Workers / Cloudflare Pages                         |

---

## 2. Route Architecture (17 Verified Routes)

All application pages are strictly file-based routes residing in `src/routes/`:

| Path                  | Purpose                         | Key Capabilities                                                                                                  |
| :-------------------- | :------------------------------ | :---------------------------------------------------------------------------------------------------------------- |
| `/`                   | Flagship Solar Showcase         | 100svh Panels, Outage Protection, Bill Savings Slider, Specs Drawer, FAQ, and Order Process                       |
| `/residential`        | Luxury Villas & Residences      | Elevated pergola terrace mounting, architectural integration, PM Surya Ghar subsidy breakdown                     |
| `/omnigrid`           | Home Battery Storage            | LiFePO4 whole-home storage, &lt;20ms UPS transfer, ToD tariff peak shaving, 24-hr energy flow simulator           |
| `/enterprise`         | Commercial & Industrial MW      | 10,000–500,000 sq.ft industrial rooftops, 40% accelerated tax depreciation (Sec 32/34), RFP submission            |
| `/deploy`             | Interactive Design Studio       | Sizing tiers (3kW–25kW), satellite roof sketcher, battery advisor, monthly generation chart, honest demo proposal |
| `/technology`         | Solar Engineering & Physics     | N-Type TOPCon cell physics, 3D sun-path solar shading simulator, structural wind tolerances                       |
| `/our-story`          | Concept Design Philosophy       | The motivation for architectural solar in India, engineering principles, and design colophon                      |
| `/architects`         | Architects & Specifiers         | BIM tolerances, 6005-T5 aluminium specs, CAD load tables, Dossier estimation modal                                |
| `/net-metering`       | DISCOM Feasibility Guide        | TGERC net-metering regulations, DT transformer caps, bi-directional meter workflow                                |
| `/service-areas`      | Hyderabad & Telangana Hubs      | Operational coverage, solar insolation metrics, and regional engineering consultation                             |
| `/warranty`           | 25-Year Performance Guarantee   | Linear degradation curve (≤1.0% Yr 1, ≤0.40%/yr), inverter & battery terms, hassle-free claims                    |
| `/faq`                | Frequently Asked Questions      | PM Surya Ghar eligibility, net metering, power cuts, terrace usability, and maintenance                           |
| `/about-this-project` | Colophon & Case Study           | Complete audit before/after matrix, architectural decision log, and sources catalog                               |
| `/legal/terms`        | Indicative Terms of Service     | Preliminary quotation disclaimers, DISCOM grid approval dependencies, OEM hardware warranties                     |
| `/legal/privacy`      | Privacy & DPDP Compliance       | Digital Personal Data Protection Act 2023 & Rules 2025 compliance, data fiduciary declaration                     |
| `/legal/disclosures`  | Sourced Calculation Methodology | Complete mathematical formulas, specific yield derivations (1,490 kWh/kWp/yr), and tariff tables                  |
| `/order/received`     | Demo Confirmation & Tracking    | Displays unambiguous concept reference code (`WNX-PREVIEW-XXXXXX`), WhatsApp direct contact                       |

---

## 3. Unified Solar Calculation Engine (`src/config/solar.ts`)

The repository enforces a **Single Source of Truth** for all mathematical models, energy yields, and financial projections via `src/config/solar.ts` and `src/config/regulatory.ts`.

### Key Functions

- `estimate({ monthlyBillInr, segment, state, discomCode, customKw, batteryUnits })`: Comprehensive financial and energy calculation.
- `calculateSubsidy(kw, segment, isSpecialCategory)`: Sourced PM Surya Ghar: Muft Bijli Yojana calculation (₹33,000/kW for 1st & 2nd kW; ₹12,000 for 3rd kW; capped at ₹78,000 for standard states, ₹85,800 for special category states; ₹0 for commercial).
- `computeSolarYield(sqft, tariff)`: Area-based commercial yield estimator.
- `decodeTelanganaBill(monthlyBillInr, sanctionedLoadKw)`: Reverse calculates exact units consumed and slab charges under TGERC FY 2025-26 tariff schedules.

### Core Mathematical Constants (`SOLAR_ASSUMPTIONS`)

- **Module Rating:** Derived from `PRODUCTS_CONFIG.module.ratedPowerW` (default: 550W N-Type TOPCon).
- **Specific Yield:** `1,490 kWh/kWp/year` (~4.08 kWh/kWp/day) derived from NASA POWER & NREL PVWatts v8 insolation at 17.3850° N, 78.4867° E.
- **Self-Consumption:** `70%` without battery; `90%` with LiFePO4 battery pack.
- **Degradation:** `1.0%` Year 1, `0.40%` linear annual degradation thereafter (≥89.4% retained at Year 25).
- **Tariff Inflation:** `3.0%` annual escalation based on historical TGERC orders.
- **Annual Savings Cap:** Capped at 100% of baseline annual power bill.

---

## 4. Architectural Design System & Tesla Restraint

WAVENOX strictly embodies the design DNA of Tesla's clean-tech showroom interfaces:

1. **Full-Bleed 100svh Hero Panels**: Single centered title, clean one-line lead, bottom-docked stat bar, and dual pill CTAs.
2. **Quiet Neutral Surfaces**: Content transitions cleanly between pure white (`#FFFFFF`), light gray (`#F4F4F4`), and architectural dark (`#171A20`).
3. **Monochrome + Amber Palette**: The interface remains monochrome with a single functional amber accent (`#F57C00` / `#B45309`) reserved for electrical telemetry, sun paths, and regulatory badges.
4. **Strict 12px Text Floor**: Zero micro-text below 12px anywhere on the platform, verified by automated Playwright assertions.
5. **No Banned Marketing Buzzwords**: Enforced via `scripts/copy-lint.mjs` against hyperbolic copy (e.g. _Atelier_, _Monolithic_, _Bespoke_, _Command Center_, _Guaranteed Lowest Price_).
6. **4-Column Engineered Footer**: Comprehensive, accessible navigation across residential, commercial, regulatory, and contact directories.

---

## 5. Statutory Sources & Transparency (`docs/SOURCES.md`)

Every number, equation, and claim is traced to an official gazette:

- **PM Surya Ghar Subsidy**: MNRE Notification No. 318/61/2024-GCRT ([pmsuryaghar.gov.in](https://pmsuryaghar.gov.in))
- **Telangana DISCOM Tariffs**: TGERC Retail Supply Tariff Order FY 2025–26 (LT-I C Domestic Slabs)
- **Solar Meteorology**: NASA POWER Atmospheric Science Data Center / NREL PVWatts v8
- **Wind Speed Resilience**: IS 875 (Part 3): 2015 Basic Wind Speed ($V_b = 44\text{ m/s}$ for Hyderabad Zone II)
- **Accelerated Depreciation**: Income-tax Act, 1961 / 2025 (Section 32/34: 40% WDV)
- **Concessional Green Loan**: SBI PM Surya Ghar Scheme (7.00% p.a. floating)
- **Data Protection**: Digital Personal Data Protection Act, 2023 & DPDP Rules 2025

Refer to [`docs/SOURCES.md`](docs/SOURCES.md) for the complete statutory register.

---

## 6. Lead Pipeline & Zero-Trust Architecture

Leads submitted via the consultation drawer or design studio proposal flow pass through rigorous server-side validation:

```
User Form ──► Zod Validation ──► Honeypot Check ──► RPC Server Function (submitLead)
                                                            │
                                                            ▼ (Nitro Server-side)
                                                   Supabase Private Client
                                                (SUPABASE_SERVICE_ROLE_KEY)
                                                            │
                                                            ▼
                                                public.consultations Table
```

### Security & Privacy Protections

1. **Zero Client Leakage:** `SUPABASE_SERVICE_ROLE_KEY` is strictly confined to server-side Nitro functions (`src/server/supabase.ts` and `src/functions/leads.ts`).
2. **Honeypot Suppression:** Silent honeypot field (`company_website`) traps bots without database persistence.
3. **Phone Normalization:** Indian mobile numbers are normalized to E.164 (`+91XXXXXXXXXX`).
4. **Anti-Duplicate Trigger:** Database trigger prevents spam submissions within 60 seconds.
5. **DPDP Act 2023 Consent Audit:** Explicit checkbox logs `consent_given: true`, `consent_version`, and `consent_at`.
6. **Honest Concept Status:** Submissions in demonstration mode display unambiguous preview status (`WNX-PREVIEW-XXXXXX`).

---

## 7. Development & Quality Assurance

### Local Development

```bash
npm install
npm run dev
```

The application runs locally at `http://localhost:8080/`.

### Automated Test Suite

```bash
npm test          # Run Vitest suite (30/30 passing unit tests)
npm run test:e2e  # Run Playwright E2E & Axe-Core audit (17/17 routes passing)
npm run lint      # Run ESLint + Prettier + Copy Lint (0 errors)
npm run format    # Format all files with Prettier
npm run build     # Production build with Nitro SSR output
```

### Production Build

```bash
npm run build
```

Build artifacts are generated in `.output/server` and `.output/public` for direct deployment on Cloudflare Pages / Workers.
