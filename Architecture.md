# WAVENOX — Technical Architecture Specification (`Architecture.md`)

---

## 1. High-Level Architecture Overview

WAVENOX is engineered as a high-performance, full-stack, reusable clean-technology platform built on the **TanStack Start** meta-framework. It pairs **Tesla-grade architectural showroom restraint** with an authentic Indian localized financial, meteorological, and regulatory engine, decoupled via a centralized configuration system.

```
                              ┌──────────────────────────────────────────────┐
                              │            CONFIGURATION ENGINE              │
                              │    src/config/brand.ts      (Identity)       │
                              │    src/config/regulatory.ts (TGERC/MNRE/IS)  │
                              │    src/config/solar.ts      (Physics/Yield)  │
                              │    src/config/sources.ts    (Sourced Truth)  │
                              └──────────────────────┬───────────────────────┘
                                                     │ Type-Safe Config
                                                     ▼
                              ┌──────────────────────────────────────────────┐
                              │            SYSTEM DESIGN & UI TIER           │
                              │  React 19 • Tailwind CSS v4 • Radix UI       │
                              │  Pure White (#FFFFFF) & Studio (#F4F4F4)     │
                              │  Carbon Dark (#171A20) • 12px Text Floor     │
                              └──────────────────────┬───────────────────────┘
                                                     │ HTTP / Hydration
                                                     ▼
                              ┌──────────────────────────────────────────────┐
                              │            ROUTING & SSR ENGINE              │
                              │    TanStack Router (17 File-based routes)    │
                              │    Dynamic JSON-LD Schema & Meta Tags        │
                              └──────────────────────┬───────────────────────┘
                                                     │ Vite SSR Bundle
                                                     ▼
                              ┌──────────────────────────────────────────────┐
                              │           SYSTEM DESIGN STUDIO               │
                              │   Interactive Configurator (/deploy)         │
                              │   Satellite Roof Sketcher & Battery Advisor  │
                              └──────────────────────┬───────────────────────┘
                                                     │ Zero-Trust RPC
                                                     ▼
                              ┌──────────────────────────────────────────────┐
                              │            LEAD & PROPOSAL ENGINE            │
                              │    Server Function (submitLead)              │
                              │    DPDP Act 2023 Consent Audit Logging       │
                              │    Supabase Private Service-Role Client      │
                              └──────────────────────────────────────────────┘
```

---

## 2. Configuration & Decoupling Engine (`src/config/`)

All business-specific, geographic, and statutory physics variables are centralized:

### 2.1 `src/config/brand.ts`

- Single source of truth for: Brand name, legal concept attribution, phone numbers (display and E.164), WhatsApp links, email addresses, social profiles, and domain.
- Built-in validation and normalization helpers (`validSiteUrl`, `normalizedDial`, `normalizedWhatsAppDial`, `validWhatsAppLink`).

### 2.2 `src/config/sources.ts` & `docs/SOURCES.md`

- Authoritative regulatory register containing issuing authority, publication date, gazette link, and verification date for every constant displayed on the platform.

### 2.3 `src/config/regulatory.ts`

- PM Surya Ghar CFA subsidy slabs (including standard and special category states).
- TGERC FY 2025–26 LT-I(C) telescopic tariff schedules with Gruha Jyothi scheme handling.
- Accelerated depreciation rules (Section 32/34: 40% WDV).
- Concessional green loan terms (SBI PM Surya Ghar at 7.00% floating).
- Basic wind speed standard ($V_b = 44\text{ m/s}$ per IS 875 Part 3).

### 2.4 `src/config/solar.ts`

- Solar generation physics and calculations:
  - Specific yield: `1,490 kWh/kWp/year` based on NASA POWER / NREL PVWatts v8 insolation in Hyderabad.
  - Self-consumption: 70% direct solar, 90% with LiFePO4 battery pack.
  - Linear degradation curve: 1.0% Year 1, 0.40%/year linear (≥89.4% Year 25).
  - Reverse bill decoder: `decodeTelanganaBill` converting ₹ bill amount to exact units consumed.

---

## 3. Directory Layout & System Architecture

```
wavenox/
├── docs/
│   ├── FIX_PLAN.md           # Master architectural audit & implementation plan
│   ├── IMAGE_BRIEF.md        # Comprehensive visual direction & rendering specs
│   └── SOURCES.md            # Complete statutory & meteorological register
├── scripts/
│   ├── copy-lint.mjs         # Static analyzer forbidding marketing buzzwords
│   └── run-e2e-audit.mjs     # Playwright E2E & Axe accessibility audit script
├── src/
│   ├── config/               # Single-source-of-truth configuration
│   │   ├── brand.ts          # Identity & contact links
│   │   ├── regulatory.ts     # Statutory subsidies, tariffs & taxes
│   │   ├── solar.ts          # Solar physics, degradation & bill decoder
│   │   └── sources.ts        # Verified citations registry
│   ├── components/
│   │   ├── system/           # Core design system primitives
│   │   │   ├── Button.tsx    # Accessible showroom poly-button (pill)
│   │   │   ├── Media.tsx     # Responsive picture with AVIF/WebP/JPG
│   │   │   ├── Panel.tsx     # Full-bleed 100svh showcase section
│   │   │   ├── QuietSection.tsx # Generously padded content section
│   │   │   ├── StatRow.tsx   # Unboxed numerical metrics row
│   │   │   └── SpecsDrawer.tsx # Verified hardware datasheets drawer
│   │   ├── Header.tsx        # Navigation menu with mobile drawer & language switcher
│   │   ├── Footer.tsx        # 4-Column footer with verified concept strip
│   │   ├── BillDecoder.tsx   # Sourced TGERC tariff slab breakdown
│   │   ├── MonthlyGenerationChart.tsx # NASA POWER monthly yield chart
│   │   ├── RoofSketcher.tsx  # Leaflet satellite terrace geometry engine
│   │   ├── BatteryHonestyAdvisor.tsx # Sourced BEE appliance runtime calculator
│   │   ├── PmSuryaGharJourney.tsx    # Official National Portal workflow & checklist
│   │   ├── SunPathSimulator.tsx      # Real-time astronomical sun-path & shadow preview
│   │   └── SystemConfigurator.tsx    # Interactive solar design studio (/deploy)
│   └── routes/               # 17 Type-safe file-based routes
```

---

## 4. Route Architecture (17 Verified Routes)

| Route                 | Page Name                       | Primary Capability                                                                     |
| :-------------------- | :------------------------------ | :------------------------------------------------------------------------------------- |
| `/`                   | **Rooftop Solar Showcase**      | Full-bleed panels, outage protection, bill savings slider, specs drawer, FAQ           |
| `/residential`        | **Luxury Residential**          | Pergola terrace mounting, architectural integration, PM Surya Ghar subsidy breakdown   |
| `/omnigrid`           | **Home Battery Storage**        | LiFePO4 home storage, &lt;20ms UPS transfer, ToD tariff peak shaving                   |
| `/enterprise`         | **Commercial & Industrial**     | Megawatt-scale solar, Section 32/34 40% Year-1 tax depreciation, corporate RFP         |
| `/deploy`             | **Interactive Design Studio**   | Sizing tiers (3kW–25kW), satellite roof sketcher, battery advisor, proposal submission |
| `/technology`         | **Engineering & Physics**       | N-Type TOPCon cell physics, 3D sun-path solar shading simulator, wind tolerances       |
| `/our-story`          | **Design Philosophy**           | The motivation for architectural solar in India, engineering principles                |
| `/architects`         | **Architectural Specification** | Structural tolerances, 6005-T5 aluminium specs, CAD load tables, Dossier modal         |
| `/net-metering`       | **DISCOM Feasibility**          | TGERC net-metering regulations, DT transformer caps, bi-directional meter workflow     |
| `/service-areas`      | **Operational Hubs**            | Coverage across Telangana & AP, solar insolation metrics, consultation liaison         |
| `/warranty`           | **25-Year Performance**         | Linear degradation curve (≤1.0% Yr 1, ≤0.40%/yr), inverter & battery terms             |
| `/faq`                | **Frequently Asked Questions**  | PM Surya Ghar eligibility, net metering, power cuts, terrace usability                 |
| `/about-this-project` | **Colophon & Case Study**       | Complete audit before/after matrix, architectural decision log, sources catalog        |
| `/legal/terms`        | **Indicative Terms**            | Preliminary quotation disclaimers, DISCOM grid approval dependencies                   |
| `/legal/privacy`      | **Privacy Policy**              | DPDP Act 2023 & DPDP Rules 2025 compliance, data fiduciary declaration                 |
| `/legal/disclosures`  | **Calculation Methodology**     | Complete mathematical formulas, specific yield derivations (1,490 kWh/kWp/yr)          |
| `/order/received`     | **Demo Confirmation**           | Displays unambiguous concept reference code (`WNX-PREVIEW-XXXXXX`)                     |

---

## 5. Security, Performance & Quality Assurance

1. **Strict TypeScript (Zero `any`)**: All props, states, and solar calculator interfaces are strongly typed.
2. **Strict 12px Text Floor**: Zero micro-text below 12px across all pages.
3. **Automated Axe Accessibility**: 0 serious and 0 critical violations across all 17 routes (WCAG 2.1 AA compliant).
4. **Copywriting Integrity**: Automated static linting rejects banned hyperbolic marketing words.
5. **Zero-Trust Server Functions**: Sensitive database operations and `SUPABASE_SERVICE_ROLE_KEY` are isolated to server functions.
