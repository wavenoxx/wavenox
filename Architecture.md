# WAVENOX — Technical Architecture Specification (`Architecture.md`)

---

## 1. High-Level Architecture Overview

WAVENOX is engineered as a high-performance, full-stack, reusable web platform built on the **TanStack Start** meta-framework. It marries **Tesla Solar's showroom design system (`https://www.tesla.com/solarpanels` & `https://www.tesla.com/energy/design`)** with an Indian localized financial and regulatory engine, decoupled via a centralized configuration system.

```
                              ┌──────────────────────────────────────────────┐
                              │            CONFIGURATION ENGINE              │
                              │    src/config/brand.ts   (Identity/Links)    │
                              │    src/config/business.ts (Hubs/Reviews)     │
                              │    src/config/solar.ts   (Tariffs/Specs)     │
                              └──────────────────────┬───────────────────────┘
                                                     │ Type-Safe Config
                                                     ▼
                              ┌──────────────────────────────────────────────┐
                              │           TESLA SHOWROOM UI TIER             │
                              │  React 19 • Framer Motion 12 • Tailwind v4   │
                              │  Pure White (#FFFFFF) & Studio Gray (#F8F8FA)│
                              │  Carbon Dark Typography • Tesla Pill Buttons │
                              └──────────────────────┬───────────────────────┘
                                                     │ HTTP / Hydration
                                                     ▼
                              ┌──────────────────────────────────────────────┐
                              │            ROUTING & SSR ENGINE              │
                              │    TanStack Router (File-based routes)       │
                              │    Dynamic JSON-LD Schema & Meta Tags        │
                              └──────────────────────┬───────────────────────┘
                                                     │ Vite SSR Bundle
                                                     ▼
                              ┌──────────────────────────────────────────────┐
                              │           SYSTEM DESIGN STUDIO               │
                              │   6-Step Interactive Configurator (/deploy)  │
                              │   Stateful System Sizing, Battery & Subsidy  │
                              └──────────────────────┬───────────────────────┘
                                                     │ Direct Connect
                                                     ▼
                              ┌──────────────────────────────────────────────┐
                              │            COMMUNICATION TIER                │
                              │    WhatsApp Direct Link (Pre-filled Dossier) │
                              │    Optional Supabase Lead Storage            │
                              └──────────────────────────────────────────────┘
```

---

## 2. Configuration & Reusability Engine (`src/config/`)

To guarantee that any solar EPC contractor in India can acquire and rebrand this platform within 30 minutes, all business-specific, geographic, and solar physics variables are centralized:

### 2.1 `src/config/brand.ts`
- Single source of truth for: Brand name, legal entity, phone numbers (display and dialable E.164), WhatsApp links, email addresses, social profiles, and domain.
- Built-in validation and normalization helpers (`validSiteUrl`, `normalizedDial`, `normalizedWhatsAppDial`, `validWhatsAppLink`).

### 2.2 `src/config/business.ts`
- Primary operating city (Hyderabad HQ), regional coverage, GPS coordinates for Schema.org LocalBusiness microdata, and verified service hubs across India (Bengaluru, Mumbai, Vijayawada, Delhi-NCR).
- Customer review registry (auto-hides when empty to comply with consumer protection laws).

### 2.3 `src/config/solar.ts`
- Complete solar physics and Indian financial models:
  - Energy density: `WATTS_PER_SQFT_WAVENOX = 13` W/sq.ft.
  - Annual effective solar hours: `GEN_HOURS_PER_YEAR = 1600` hrs.
  - State utility tariff schedules: TSSPDCL (Telangana), BESCOM (Karnataka), MSEDCL (Maharashtra), TANGEDCO (Tamil Nadu), BSES (Delhi).
  - Central Government Subsidies: PM Surya Ghar Muft Bijli Yojana calculation rules (up to ₹78,000 direct credit).
  - Robust calculation function `computeSolarYield` supporting both object parameters and positional numbers.

---

## 3. Directory Layout & 3-Layer Component Hierarchy

```
wavenox/
├── src/
│   ├── assets/               # High-res cinema-grade renders
│   │   ├── luxury_solar_villa.jpg     # 100vh Hero background
│   │   ├── liquid_glass_macro.jpg     # Sleek low-profile macro
│   │   └── enterprise_mw_rooftop.jpg  # Enterprise rooftop render
│   ├── config/               # Single-source-of-truth configuration
│   │   ├── brand.ts          # Identity & communication links
│   │   ├── business.ts       # Service hubs & Indian regions
│   │   └── solar.ts          # Tariffs, DISCOMs & subsidy engine
│   ├── components/           # Tesla Solar UI Component Tree
│   │   │                     # --- LAYER 1: SHOWCASE MODULES ---
│   │   ├── Header.tsx        # Floating blur header with navigation links & pills
│   │   ├── Hero.tsx          # 100vh full-bleed hero with bottom dock & dual pills
│   │   ├── SleekDesign.tsx   # Sleek low-profile design & concealed hardware (White)
│   │   ├── OutageProtection.tsx # 24/7 Outage protection with Omnigrid (Studio Gray)
│   │   ├── BillSavingsSlider.tsx # Interactive monthly bill slider for India (White)
│   │   ├── EfficiencyTech.tsx # Efficiency & all-weather cascading cells (Studio Gray)
│   │   ├── EnergyControl.tsx # Monitor and optimize (Mobile app telemetry) (White)
│   │   ├── TechSpecs.tsx     # Built to last: Tesla-style 2-column specs drawer
│   │   ├── OrderProcess.tsx  # Order to power on: 5-step timeline (Studio Gray)
│   │   ├── ConsultationModal.tsx # Tesla Energy Advisor virtual consultation modal
│   │   ├── SupportFaq.tsx    # Comprehensive Indian rooftop solar FAQ
│   │   ├── Footer.tsx        # Sleek 1-line Tesla-style showroom footer
│   │   │                     # --- LAYER 2: DESIGN STUDIO ---
│   │   └── SystemConfigurator.tsx # 6-Step interactive solar & storage configurator
│   └── routes/               # TanStack file-based routes
│       ├── __root.tsx        # Root HTML layout & dynamic metadata
│       ├── index.tsx         # Layer 1: Tesla Solar Panels Showcase
│       ├── deploy.tsx        # Layer 2: Interactive System Design Studio (/energy/design)
│       ├── residential.tsx   # Layer 3: Solar for Homes
│       ├── enterprise.tsx    # Layer 3: Commercial & Industrial Solar (MW scale)
│       └── omnigrid.tsx      # Layer 3: Omnigrid Battery Storage
```

---

## 4. Route Architecture & Page Mapping

| Route | Page Name | Primary Focus & Tesla Equivalent |
| :--- | :--- | :--- |
| `/` | **Solar Panels Showcase** | Exact replica of `https://www.tesla.com/solarpanels` section hierarchy on Pure White & Studio Gray canvas. |
| `/deploy` | **System Design Studio** | Interactive 6-step configurator mirroring `https://www.tesla.com/energy/design` with custom kW sizing, Omnigrid battery count, and PM Surya Ghar subsidy credits. |
| `/residential` | **Solar for Homes** | Architectural solar for luxury villas, independent houses, and penthouses. |
| `/enterprise` | **Commercial & Industrial** | Megawatt-scale solar, Section 32 40% Year-1 tax depreciation, corporate campuses. |
| `/omnigrid` | **Omnigrid Battery Storage** | Whole-home outage backup, seamless sub-millisecond islanding, compact wall-mounted battery. |

---

## 5. Security, Performance & Code Quality

1. **Strict TypeScript (Zero `any`)**: All props, states, and solar calculator interfaces are strongly typed.
2. **Defensive Programming**: Functions like `computeSolarYield` handle edge cases gracefully, preventing any client-side runtime errors.
3. **Hardware-Accelerated Animation**: Framer Motion transitions operate strictly on `opacity` and `transform` (`y`, `scale`).
4. **Instant 200 OK Response**: All routes build and hydrate without SSR mismatches or hydration glitches.
