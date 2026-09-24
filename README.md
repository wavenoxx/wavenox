# WAVENOX — Architectural Solar & Clean Energy Platform

WAVENOX is an architectural clean-technology platform deploying low-profile rooftop solar, energy storage (Omnigrid), and commercial megawatt infrastructure across India.

Engineered with **TanStack Start**, **React 19**, **Tailwind CSS v4**, and **Nitro SSR**, targeting Cloudflare Pages / Workers.

---

## 1. Technical Stack Overview

| Layer              | Technology                          | Details                                                             |
| :----------------- | :---------------------------------- | :------------------------------------------------------------------ |
| **Meta-Framework** | TanStack Start `1.168.x`            | Full-stack React with type-safe server functions (`createServerFn`) |
| **Routing**        | TanStack Router `1.170.x`           | Fully type-safe file-based routing (`src/routes/`)                  |
| **View Layer**     | React 19 + TypeScript               | Strict typing, zero `any` policy                                    |
| **Styling**        | Tailwind CSS v4                     | Native CSS theme integration (`@theme inline`), OKLCH colors        |
| **Motion**         | Framer Motion `12.x`                | Hardware-accelerated transitions & viewport animations              |
| **Primitives**     | Radix UI (`@radix-ui/react-dialog`) | Accessible modal dialogs with focus trapping and ARIA standards     |
| **Validation**     | Zod `3.x`                           | Schema validation for lead payloads and search params               |
| **Database**       | Supabase (PostgreSQL 15+)           | Zero-Trust RLS, honeypot suppression, DPDP audit logging            |
| **Build / SSR**    | Vite 8 + Nitro                      | Bundled for Cloudflare Workers / Cloudflare Pages                   |

---

## 2. Route Architecture

All application pages are strictly file-based routes residing in `src/routes/`:

| Path                 | Purpose                      | Key Components & Logic                                                                                |
| :------------------- | :--------------------------- | :---------------------------------------------------------------------------------------------------- |
| `/`                  | Flagship Solar Showcase      | 100vh Hero, Sleek Design, Outage Protection, Bill Savings Slider, Tech Specs, FAQ, and Order Process  |
| `/residential`       | Luxury Villas & Residences   | Monolithic rooftop layouts, architectural integration, PM Surya Ghar subsidy breakdown                |
| `/omnigrid`          | Omnigrid Energy Storage      | LiFePO4 whole-home storage, sub-4ms failsafe islanding, TOD tariff peak shaving                       |
| `/enterprise`        | Commercial & Industrial MW   | 10,000–500,000 sq.ft industrial rooftops, 40% accelerated depreciation, direct RFP proposal form      |
| `/deploy`            | Interactive Design Studio    | Sizing tiers (3kW–25kW), battery stack configuration, multi-year compounding wealth model             |
| `/order/received`    | Confirmation & Tracking      | Displays unambiguous reference code (`WNX-XXXXXX`), WhatsApp direct sync link                         |
| `/legal/privacy`     | Privacy & DPDP Act 2023      | Data fiduciary declaration, collection categories, processing purposes, Grievance Officer details     |
| `/legal/terms`       | Quotation & Terms of Service | Preliminary quotation conditions, DISCOM timeline disclaimers, OEM warranties, Hyderabad jurisdiction |
| `/legal/disclosures` | Financial Disclosures        | Specific yield (1,450 kWh/kWp/yr), degradation, tariff schedules, math formulas, and subsidy slabs    |

---

## 3. Unified Solar Calculation Engine (`src/config/solar.ts`)

The repository enforces a **Single Source of Truth** for all mathematical models, energy yields, and financial projections via `src/config/solar.ts`.

### Key Functions

- `estimate({ monthlyBillInr, segment, state, discomCode, customKw, batteryUnits })`: Comprehensive financial and energy calculation.
- `calculateSubsidy(kw, segment)`: Official PM Surya Ghar: Muft Bijli Yojana calculation (₹33,000/kW for first 2 kW; ₹12,000 for 3rd kW; capped at ₹78,000 for residential; ₹0 for commercial).
- `computeSolarYield(sqft, tariff)`: Area-based commercial yield estimator.

### Core Mathematical Constants (`SOLAR_ASSUMPTIONS`)

- **Module Rating:** Derived from `PRODUCTS_CONFIG.module.ratedPowerW` (default: 550W N-Type TOPCon).
- **Specific Yield:** `1,450 kWh/kWp/year` (Central & Southern India insolation standard).
- **Self-Consumption:** `70%` without battery; `90%` with Omnigrid battery.
- **Degradation:** `0.5%` per annum over 25 years.
- **Tariff Inflation:** `3.0%` annual escalation based on historical ERC orders.
- **Battery Capacity:** Derived from `PRODUCTS_CONFIG.battery.usableCapacityKwh`.
- **Annual Savings Cap:** Guaranteed never to exceed 100% of baseline annual power bill.

---

## 4. Product Specifications Configuration (`src/config/products.ts`)

Hardware specifications are completely decoupled from UI presentation in `src/config/products.ts`:

- **Solar Module:** Rated power, cell technology (N-Type TOPCon), efficiency (22.8%), bifaciality (80%), temperature coefficients, warranties.
- **Hybrid Inverter:** Three-phase string inverter with rapid shutdown, IP66, 98.4% efficiency.
- **Omnigrid Battery:** Usable capacity, LiFePO4 chemistry, sub-20ms UPS islanding, IP65 enclosure.

### Business Owner Action Items

Any placeholder value requiring confirmation against manufacturer datasheets is marked with:

```typescript
// VERIFY(owner): replace placeholder with verified OEM battery capacity
```

When verified datasheets are confirmed, flip `specsVerified: true` in `PRODUCTS_CONFIG` to remove user-facing indicative disclaimer banners.

---

## 5. Lead Pipeline & Zero-Trust Architecture

Leads are acquired via the consultation drawer, interactive design studio, or commercial RFP form.

### Pipeline Flow

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

1. **Zero Client Leakage:** `SUPABASE_SERVICE_ROLE_KEY` is strictly confined to server-side Nitro functions (`src/server/supabase.ts` and `src/functions/leads.ts`). It is never bundled or exposed to the browser.
2. **Honeypot Suppression:** Silent honeypot field (`company_website`) traps bots without database persistence.
3. **Phone Normalization:** Indian mobile numbers are normalized to E.164 (`+91XXXXXXXXXX`).
4. **Anti-Duplicate Trigger:** PostgreSQL database trigger rejects multiple submissions from the same phone number within 60 seconds.
5. **DPDP Act 2023 Consent Audit:** Requires explicit opt-in checkbox, logging `consent_given: true`, `consent_version`, and `consent_at` timestamp.
6. **Zero-Trust RLS:** Public `anon` permissions to read/insert `consultations` are dropped. All database mutations occur via trusted server functions.

---

## 6. Supabase Database Setup

To provision your Supabase instance, execute the SQL migration scripts in order:

### Migration Order

1. **Step 1:** Open Supabase SQL Editor and execute `supabase/migrations/20260923_consultations.sql`.
2. **Step 2:** Execute `supabase/migrations/20260924_consultations_v2.sql`.

The v2 migration adds reference codes, DPDP consent tracking, and normalizes legacy data tiers defensively.

---

## 7. Environment Variables

Create a `.env` file in the root directory:

```bash
# Supabase Configuration (Required for Lead Pipeline)
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="your-secret-service-role-key"

# Brand & Identity Overrides (Optional - defaults in src/config/brand.ts)
VITE_BRAND_NAME="WAVENOX"
VITE_LEGAL_NAME="WAVENOX Technologies Private Limited"
VITE_SITE_URL="https://wavenox.com"
VITE_BUSINESS_PHONE_DISPLAY="+91 91546 26354"
VITE_BUSINESS_PHONE_DIAL="+919154626354"
VITE_BUSINESS_WHATSAPP_DISPLAY="+91 70758 70054"
VITE_BUSINESS_WHATSAPP_DIAL="917075870054"
VITE_BUSINESS_WHATSAPP_LINK="https://wa.me/917075870054"
VITE_BUSINESS_EMAIL="advisory@wavenox.com"
VITE_BUSINESS_ADDRESS="WAVENOX Innovation Lab, Financial District, Gachibowli, Hyderabad, Telangana 500032"
```

---

## 8. Development & Deployment

### Local Development

```bash
npm install
npm run dev
```

The application will launch at `http://localhost:8080/`.

### Testing & Quality Assurance

```bash
npm test          # Run Vitest test suite (financial calculation engine)
npx tsc --noEmit  # Full TypeScript compiler verification
npm run lint      # ESLint static analysis
npm run build     # Production build with Nitro SSR output
```

### Production Deployment (Cloudflare)

The project builds via `@lovable.dev/vite-tanstack-config` into Cloudflare Pages / Workers (`.output/server` and `.output/public`):

```bash
npm run build
npx nitro deploy --prebuilt
```

Ensure `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are configured in your Cloudflare environment variables dashboard.
