# WAVENOX — Execution Roadmap & Task Matrix (`Tasks.md`)

---

## 1. Project Phase Overview

```
┌─────────────────────────────────┐       ┌─────────────────────────────────┐
│            PHASE 1              │       │            PHASE 2              │
│ Honest & Working Foundation     │ ────► │  Tesla-Style Design Pass        │
│          (COMPLETED ✅)          │       │           (NEXT UP 🚀)          │
└─────────────────────────────────┘       └─────────────────────────────────┘
```

---

## 2. Phase 1: Honest & Working Foundation (Status: COMPLETED ✅)

Branch: `phase-1-foundation`

### Step 1: Repository Hygiene & Foundation Integrity
- [x] Removed obsolete legacy routes and unused demo files.
- [x] Hardened `.gitignore` to prevent any credential leaks (`.env`, `.env.*`, Supabase service role keys).
- [x] Standardized root types and resolved all TypeScript compiler warnings in core configurations.
- [x] Commit: `phase1(step 1): clean legacy routes, fix root types, gitignore` (`a9ba6a9`).

### Step 2: Product Specifications & Decoupling
- [x] Removed all unauthorized "Tesla Powerwall" and "Tesla Solar" branding references.
- [x] Created `src/config/products.ts` as the central repository for hardware datasheets (TOPCon module, hybrid string inverter, Omnigrid battery storage).
- [x] Added `// VERIFY(owner): ...` annotations on all unconfirmed OEM specifications.
- [x] Added user-facing indicative spec disclaimer banner.
- [x] Commit: `phase1(step 2): remove tesla branding, extract product specs to products.ts` (`ec818da`).

### Step 3: Regulatory Alignment & Copy Accuracy
- [x] Removed unverifiable marketing claims (e.g., "India's #1", fake uptime guarantees).
- [x] Aligned subsidy language strictly with PM Surya Ghar: Muft Bijli Yojana (up to ₹78,000 for residential systems up to 3 kW; ₹0 for commercial).
- [x] Replaced misleading "zero bill forever" claims with realistic net-metering offsets and grid fixed-charge disclosures.
- [x] Commit: `phase1(step 3): remove unverifiable claims, align regulatory copy` (`aa783a4`).

### Step 4: Unified Solar Calculation Engine (`src/config/solar.ts`)
- [x] Centralized all solar calculations, energy yields, and financial math into `src/config/solar.ts`.
- [x] Deprecated duplicate calculators across components (`BillSavingsSlider`, `SystemConfigurator`, `ConsultationDrawer`, `enterprise.tsx`).
- [x] Added Vitest test suite (`src/config/solar.test.ts`) with 9 comprehensive unit tests (all passing).
- [x] Ensured modeled savings never exceed 100% of baseline annual power bill.
- [x] Commit: `phase1(step 4): one calculation engine in solar.ts with tests` (`49a3d72`).

### Step 5: Server Lead Pipeline & Zero-Trust Security
- [x] Created `src/functions/leads.ts` using TanStack Start `createServerFn` with Zod validation.
- [x] Created `src/server/supabase.ts` for secure server-side Supabase client using `SUPABASE_SERVICE_ROLE_KEY`.
- [x] Implemented bot suppression via hidden honeypot field (`company_website`).
- [x] Implemented phone number normalization to Indian E.164 standard (`+91XXXXXXXXXX`).
- [x] Added DPDP Act 2023 consent capture (`consent_given`, `consent_version`, `consent_at`).
- [x] Created database migrations:
  - `supabase/migrations/20260923_consultations.sql`: Baseline schema, indices, 60s duplicate trigger.
  - `supabase/migrations/20260924_consultations_v2.sql`: Reference codes, zero-trust RLS hardening, defensive legacy tier normalization.
- [x] Wired direct submission in `ConsultationDrawer`, `SystemConfigurator`, and `enterprise.tsx`.
- [x] Eliminated "Demo Fallback Mode" — server returns explicit configuration error if keys are missing rather than dropping leads with fake success.
- [x] Centralized battery capacity (`PRODUCTS_CONFIG.battery.usableCapacityKwh`) across calculations, OutageProtection, and Omnigrid routes.
- [x] Commits: `663362b`, `a845112`.

### Step 6: Accessible Radix Dialog & Navigation Menus
- [x] Replaced custom modal/drawer in `ConsultationDrawer.tsx` with `@radix-ui/react-dialog` (`Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`).
- [x] Guaranteed focus trapping, ESC key dismiss, outside click dismiss, and return focus on close.
- [x] Deduplicated consultation drawer mount: mounted once globally in `src/routes/__root.tsx`, removed duplicate mounts from individual pages.
- [x] Enhanced `Header.tsx` mobile menu with `aria-expanded`, `aria-controls`, ESC key dismiss, and auto-close on route navigation.
- [x] Commit: `phase1(step 6): accessible Radix Dialog for consultation drawer, header menu a11y, deduplicate drawer mount` (`3908f5e`).

### Step 7: Legal Pages & Footer Integration
- [x] Created `src/routes/legal/privacy.tsx` compliant with India's Digital Personal Data Protection Act, 2023 (DPDP Act).
- [x] Created `src/routes/legal/terms.tsx` detailing preliminary quotation terms, DISCOM timelines, and Hyderabad jurisdiction.
- [x] Created `src/routes/legal/disclosures.tsx` with complete mathematical models, DISCOM tariff schedules, and financial assumptions.
- [x] Updated `src/components/Footer.tsx` with clean legal links, corporate entity name, registered office address, and copyright notice.
- [x] Commit: `phase1(step 7): DPDP Act 2023 privacy policy, quotation terms, financial disclosures, and footer links` (`dccaa91`).

### Step 8: Documentation
- [x] Updated `README.md` with complete technical stack, route map, calculation engine, lead pipeline, and deployment guide.
- [x] Updated `Tasks.md` and `Memory.md`.

---

## 3. Phase 2: Tesla-Style Design Pass (Backlog 📋)

- [ ] **Full-bleed Hero Showcase**: Refine photography overlays, typography kerning, and floating bottom docks.
- [ ] **Interactive 3D Roof Visualizer**: WebGL/Three.js or fluid SVG model for villa roof solar panel layout.
- [ ] **Sound Design & Micro-Interactions**: Subtle audio/haptic feedback on slider adjustments and button clicks.
- [ ] **Design Studio Polish**: Streamlined multi-step configurator mirroring Tesla Energy Design Studio with live 3D preview.
- [ ] **Omnigrid Microgrid Animator**: Real-time energy flow animation between solar panels, battery, home, and utility grid.
