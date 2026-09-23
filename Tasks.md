# WAVENOX — Execution Roadmap & Task Matrix (`Tasks.md`)

---

## 1. Project Phase Overview

```
┌─────────────────────────┐     ┌─────────────────────────┐     ┌─────────────────────────┐
│        PHASE 1          │     │        PHASE 2          │     │        PHASE 3          │
│   Foundation & Audit    │ ──► │  Reusable Config Engine │ ──► │    Missing Subpages     │
│       (COMPLETED)       │     │     & Conversion UI     │     │     & Configurator      │
└─────────────────────────┘     └─────────────────────────┘     └─────────────────────────┘
                                                                             │
                                                                             ▼
┌─────────────────────────┐     ┌─────────────────────────┐     ┌─────────────────────────┐
│        PHASE 6          │     │        PHASE 5          │     │        PHASE 4          │
│   Launch & Handover     │ ◄── │   Production QA         │ ◄── │ Full-Stack Lead Engine  │
│     (Sale-Ready)        │     │   & Optimization        │     │  & Server Functions     │
└─────────────────────────┘     └─────────────────────────┘     └─────────────────────────┘
```

---

## 2. Phase 1: Codebase Audit & Reference Scanning (Status: COMPLETED ✅)

- [x] Clone and deep scan GitHub repository (`https://github.com/wavenoxx/wavenox.git`).
- [x] Inspect founder's reference masterpiece project (`InvisProtect` at `/scratch/invisprotect`).
- [x] Extract core reusability pattern: Centralized configuration engine (`brand.ts`, `business.ts`), 15-minute rebranding guide (`CUSTOMIZE.md`), lead generation pipeline, and dynamic SEO schema.
- [x] Document placeholder imagery strategy and owner-agnostic business configuration.
- [x] Generate updated foundational documents: `pmd.md`, `Architecture.md`, `Rules.md`, `design.md`, `Tasks.md`, `Memory.md`.

---

## 3. Phase 2: Centralized Configuration & Core Interface (Current Sprint - Priority: CRITICAL 🔴)

### Task 2.1: Centralized Configuration Engine (`src/config/`)
- [x] Create `src/config/brand.ts`:
  - Brand identity, default brand name, fallback URLs, phone display/dial, WhatsApp display/dial/link, email, socials.
  - Safe URL and E.164 dial normalization helpers (`validSiteUrl`, `normalizedDial`, `normalizedWhatsAppDial`, `validWhatsAppLink`).
- [x] Create `src/config/business.ts`:
  - Primary operating city, region label, geo coordinates for structured data.
  - Service hubs (Hyderabad & Secunderabad, Bengaluru, Vijayawada, Delhi-NCR, Mumbai).
  - Verified reviews registry (auto-hiding when empty to adhere to consumer protection laws).
- [x] Create `src/config/solar.ts`:
  - Energy density constants (Watts/sq.ft), annual effective sunlight hours.
  - State utility tariff schedules (TSSPDCL, TSNPDCL, BESCOM, MSEDCL, TANGEDCO).
  - PM Surya Ghar Muft Bijli Yojana subsidy formulas.
  - Structural and performance warranty terms (25-year ironclad warranty).

### Task 2.2: Dynamic Brand Logo Component (`BrandLogo.tsx`)
- [x] Create `src/components/BrandLogo.tsx`:
  - Reads brand wordmark dynamically from `BRAND_CONFIG.name`.
  - Luxury typographic treatment (`font-bold uppercase tracking-[0.35em]`).
  - Optional SVG logo slot for future client branding.

### Task 2.3: Restore Missing Hero CTA Button
- [x] Update `src/components/Hero.tsx`:
  - Re-introduce Ghost CTA button below slide H2: `"UNLOCK ENERGY INDEPENDENCE →"`.
  - Transparent 1px white border, uppercase tracking, Sunburst Orange right arrow.
  - White background with black text on hover; flash Sunburst Orange on active.
  - Fluid mobile width (`w-full sm:w-auto`).
  - Wire click handler to open the `ConsultationDrawer`.

### Task 2.4: Build Global Ultra-Luxury Footer
- [x] Create `src/components/Footer.tsx`:
  - Architectural 4-column layout reading directly from `BRAND_CONFIG` and `BUSINESS`.
  - Column 1: Brand wordmark, Hyderabad HQ tag, BIS/TÜV/UL compliance badges.
  - Column 2: Architecture & Products (Liquid Glass, Omni-Grid, Quantum Inverters).
  - Column 3: Sectors (Residential Villas, Commercial & Industrial, Defense).
  - Column 4: Direct contact links (Click-to-Call, Click-to-WhatsApp, Email, VIP consultation trigger).
  - Bottom bar: Dynamic copyright string, Privacy Policy, Terms of Deployment.
  - Integrate across `index.tsx`, `residential.tsx`, `liquid-glass.tsx`, `defense.tsx`, `omnigrid.tsx`.

### Task 2.5: Build Interactive Consultation & Solar Proposal Drawer
- [x] Create `src/components/ConsultationDrawer.tsx`:
  - Built with Framer Motion slide-over modal with obsidian glassmorphic backdrop blur.
  - 3-step interactive inquiry:
    1. Select Sector: Luxury Villa, Private Estate, Commercial Asset, Defense/Compound.
    2. Sizing Metric: Usable Roof Area (sq.ft) with live 25-yr financial return calculation.
    3. Contact Details: Name, WhatsApp/Phone (+91 format), City / Hub.
  - One-click direct WhatsApp connection pre-populated with lead details.
  - Global triggerable state accessible from any CTA button on the website.

### Task 2.6: Metadata & Branding Hardening
- [x] Update `src/routes/__root.tsx`:
  - Derive title, description, canonical domain, and OpenGraph tags dynamically from `BRAND_CONFIG`.
  - Inject Schema.org JSON-LD LocalBusiness microdata for Indian service hubs.
  - Eliminate placeholder `"Lovable App"` tags.

---

## 4. Phase 3: Missing Subpages & Architectural Configurator (Status: COMPLETED ✅)

### Task 3.1: Enterprise Scale Page (`/enterprise`)
- [x] Create `src/routes/enterprise.tsx`:
  - Industrial rooftop solar, megawatt-scale carports, floating arrays.
  - Accelerated depreciation tax benefits under Indian IT Act Section 32 (40% Year 1 write-off).
  - Dynamic MW Financial Engine with reactive roof area and tariff slider.

### Task 3.2: System Intelligence Page (`/intelligence`)
- [x] Create `src/routes/intelligence.tsx`:
  - AI-driven energy arbitration, predictive weather forecasting, and micro-inverter telemetry.
  - Interactive live telemetry simulator with real-time solar harvest, battery SOC, home load, and grid export meters.

### Task 3.3: The Brand Page (`/brand`)
- [x] Create `src/routes/brand.tsx`:
  - The WAVENOX Genesis: Hyderabad engineering laboratory, aerospace materials research.
  - The Monolithic Manifesto: Why traditional bolt-on solar is an obsolete liability.
  - Global certification matrix (BIS, TÜV Rheinland, UL Class A Fire, ASTM E330).

### Task 3.4: Interactive Solar Deploy Configurator (`/deploy`)
- [x] Create `src/routes/deploy.tsx`:
  - Multi-step interactive roof configurator.
  - City selector (`BUSINESS.serviceHubs`), roof profile (Villa, Estate, Commercial), battery storage tier (Omnigrid 20/40/100kWh).
  - Instant preliminary capacity, PM Surya Ghar subsidy credit, and 25-year financial yield projection.
  - Direct WhatsApp dossier generation and consultation booking.

---

## 5. Phase 4: Full-Stack Lead Engine & Backend (Status: IN PROGRESS 🔵)

### Task 4.1: Database Migrations (Supabase PostgreSQL)
- [x] Create `supabase/migrations/20260923_consultations.sql`:
  - `consultations` table with status lifecycle (`new`, `contacted`, `qualified`, `survey_booked`, `quoted`, `contract_signed`, `installed`).
  - Row Level Security (RLS) with public rate-limited insert and authenticated admin access.
  - Anti-spam database trigger rejecting double submissions within 60 seconds from same phone number.
  - Full marketing telemetry columns (`utm_source`, `utm_medium`, `utm_campaign`, `landing_url`).

---

## 6. Phase 5: Handover Documentation & Sale-Ready Packaging (Status: COMPLETED ✅)

- [x] Create `docs/CUSTOMIZE.md` (Step-by-step 15-minute rebranding guide for a new solar business owner).
- [x] Create `docs/LEAD_GENERATION_ARCHITECTURE.md` (Detailed lead capture & attribution documentation).
- [x] Create `docs/SEO_ARCHITECTURE.md` (Solar installation schema & indexing registry).

