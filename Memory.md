# WAVENOX — Persistent Project Memory & Brain (`Memory.md`)

---

## 1. Project Genesis & Strategic Direction

- **Brand Name**: WAVENOX
- **Legal Entity**: WAVENOX Technologies Private Limited
- **Tagline**: Absolute power. Zero compromise.
- **Operating Territory**: Hyderabad HQ, Bengaluru, Mumbai, Vijayawada, Delhi-NCR
- **Active Branch**: `phase-1-foundation`
- **Strategic Mandate**:
  - Build an honest, robust, accessible, and mathematically verifiable architectural clean-tech web platform.
  - Phase 1 ("Honest & Working Foundation") is complete: regulatory alignment, DPDP Act 2023 compliance, zero-trust server lead pipeline, single calculation engine, and Radix Dialog accessibility.
  - Ready for Phase 2: Tesla-style design pass.

---

## 2. Technical Stack State

| Parameter                | Current Value                       | Notes                                                     |
| :----------------------- | :---------------------------------- | :-------------------------------------------------------- |
| **Node.js Version**      | `v26.4.0`                           | Node 26 LTS runtime                                       |
| **Meta-Framework**       | TanStack Start (`^1.168.26`)        | Nitro-based SSR + Vite 8                                  |
| **Routing**              | TanStack Router (`^1.170.16`)       | Type-safe, file-based (`src/routes/`)                     |
| **Styling**              | Tailwind CSS v4 (`^4.2.1`)          | Native `@theme inline`, OKLCH colors                      |
| **Animation Engine**     | Framer Motion (`^12.42.2`)          | GPU-accelerated spring physics                            |
| **Component Primitives** | Radix UI (`@radix-ui/react-dialog`) | Accessible modal dialogs with focus trapping and ARIA     |
| **Validation**           | Zod `3.x`                           | Strict type validation for inputs and RPC handlers        |
| **Database**             | Supabase (PostgreSQL 15+)           | RLS zero-trust policies, duplicate trigger, consent audit |
| **Unit Testing**         | Vitest (`v5.0.1`)                   | 9/9 tests passing (`src/config/solar.test.ts`)            |
| **Build Target**         | Cloudflare Pages / Workers          | Output in `.output/server` and `.output/public`           |

---

## 3. Key Architecture & Engineering Decisions

1. **Import Protection & RPC File Structure:**
   - TanStack Start uses `vite-plugin-import-protection` which blocks client components from importing any module located in a path matching `**/server/**`.
   - Therefore, public RPC server functions (`createServerFn`) reside in `src/functions/leads.ts`.
   - Server-only secrets (`SUPABASE_SERVICE_ROLE_KEY`) reside in `src/server/supabase.ts` and are dynamically imported exclusively inside server function handlers.
   - Proof: Client bundle (`.output/public`) has **zero** occurrences of `SUPABASE_SERVICE_ROLE_KEY` or `service_role`.

2. **Unified Solar Physics Engine (`src/config/solar.ts`):**
   - Single source of truth for all calculations.
   - Tied directly to `PRODUCTS_CONFIG.module.ratedPowerW` (550W) and `PRODUCTS_CONFIG.battery.usableCapacityKwh`.
   - Modeled savings are mathematically capped at 100% of baseline annual power bill.
   - Commercial segment returns ₹0 subsidy (PM Surya Ghar is residential-only).

3. **Lead Pipeline & Bot Suppression:**
   - Honeypot field (`company_website`) silently returns success for bots without writing to the database.
   - Normalizes all Indian numbers to E.164 (`+91XXXXXXXXXX`).
   - Requires explicit DPDP Act 2023 consent checkbox.
   - PostgreSQL trigger enforces a 60-second duplicate submission cooldown per phone number.
   - "Demo Fallback Mode" was removed — if Supabase keys are missing, the server returns an explicit configuration error rather than dropping leads.

4. **Global Dialog Mount:**
   - `ConsultationDrawer` is mounted once globally in `src/routes/__root.tsx`.
   - Redundant mounts in individual page routes were removed to eliminate duplicated state and event conflicts.
   - Triggerable anywhere via `openConsultationDrawer(tier?)` custom window event.

---

## 4. Verification Checklist & Current Health

- [x] `npm test`: 9/9 passing
- [x] `npx tsc --noEmit`: 0 errors
- [x] `npm run lint`: 0 errors (7 minor react-refresh warnings on UI component files)
- [x] `npm run build`: Successful Nitro Cloudflare build
- [x] Secret Leak Audit: 0 matches in `.output/public`
