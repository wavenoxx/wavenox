# WAVENOX — Technical Architecture Specification (`Architecture.md`)

---

## 1. High-Level Architecture Overview

WAVENOX is engineered as a modern, high-performance, full-stack reusable web application leveraging the **TanStack Start** meta-framework. It decouples the visual presentation layer from business specifics through a centralized configuration engine, enabling rapid rebranding and multi-client deployments.

```
                              ┌──────────────────────────────────────────────┐
                              │            CONFIGURATION ENGINE              │
                              │    src/config/brand.ts   (Identity/Links)    │
                              │    src/config/business.ts (Hubs/Reviews)     │
                              │    src/config/solar.ts   (Tariffs/Specs)     │
                              └──────────────────────┬───────────────────────┘
                                                     │ Type-Safe Config Context
                                                     ▼
                              ┌──────────────────────────────────────────────┐
                              │                 CLIENT TIER                  │
                              │  React 19 • Framer Motion 12 • Radix UI      │
                              │  Dynamic Branding • Responsive Micro-Interactions
                              └──────────────────────┬───────────────────────┘
                                                     │ HTTP / Hydration
                                                     ▼
                              ┌──────────────────────────────────────────────┐
                              │            ROUTING & SSR ENGINE              │
                              │    TanStack Router (File-based routes)       │
                              │    Dynamic JSON-LD Schema & SEO Headers      │
                              └──────────────────────┬───────────────────────┘
                                                     │ Vite SSR Bundle
                                                     ▼
                              ┌──────────────────────────────────────────────┐
                              │                 SERVER TIER                  │
                              │          Nitro Engine / H3 Runtime           │
                              │    TanStack Server Functions (createServerFn)│
                              │    Zod Validation • Anti-Burst Rate Limits   │
                              └──────────────────────┬───────────────────────┘
                                                     │ Service Role Persistence
                                                     ▼
                              ┌──────────────────────────────────────────────┐
                              │            DATA & INTEGRATION TIER           │
                              │    Supabase PostgreSQL (Advisory Locks)      │
                              │    Meta WhatsApp Cloud API (Owner Alerts)    │
                              │    Google Ads Consent Mode v2 Attributions  │
                              └──────────────────────────────────────────────┘
```

---

## 2. Configuration & Reusability Architecture

The platform follows the proven configuration pattern established in the founder's prior enterprise project (`InvisProtect`), decoupling all owner-specific and regional attributes into three strict TypeScript modules in `src/config/`:

### 2.1 `src/config/brand.ts` (Brand Identity & Communications)
- **Purpose**: Single source of truth for the company name, website origin, phone numbers, WhatsApp, email, social URLs, and logo wordmark.
- **Environment Overrides**: Automatically reads `VITE_BRAND_NAME`, `VITE_SITE_URL`, `VITE_BUSINESS_PHONE_*`, and `VITE_BUSINESS_WHATSAPP_*` from `.env`, falling back to safe defaults.
- **Dial Normalization**: Built-in helper functions (`normalizedDial`, `normalizedWhatsAppDial`, `validWhatsAppLink`) ensure that invalid numbers never break UI links or generate malformed `tel:` / `https://wa.me/` URLs.

### 2.2 `src/config/business.ts` (Geographic Coverage & Proof)
- **Purpose**: Defines regional coverage, primary operating city, geo coordinates for Google LocalBusiness schema, and verified service hubs (e.g., Hyderabad & Secunderabad, Bengaluru, Vijayawada, Delhi-NCR).
- **Customer Reviews**: Dynamic review registry. Sections automatically hide if the array is empty, ensuring adherence to consumer protection standards (no invented testimonials).

### 2.3 `src/config/solar.ts` (Solar Physics & Financial Engine Constants)
- **Purpose**: Centralizes all mathematical and financial parameters for the ROI engine and energy calculators:
  - `WATTS_PER_SQFT_WAVENOX`: Energy density rating (default 13 W/sq.ft).
  - `WATTS_PER_SQFT_CONV`: Baseline conventional density (10 W/sq.ft).
  - `GEN_HOURS_PER_YEAR`: Effective solar insolation hours (default 1,600 hrs/yr).
  - `TARIFF_INR_PER_KWH`: Local utility tariff (default ₹9.5/kWh).
  - `DISCOM_SCHEDULES`: Tariff tables for state electricity boards (TSSPDCL, TSNPDCL, BESCOM, MSEDCL, TANGEDCO).
  - `SUBSIDY_SLABS`: Government subsidy calculations under the PM Surya Ghar scheme.
  - `WARRANTY_YEARS`: Structural and performance warranty terms (25 Years).

---

## 3. Directory Layout & Modular Structure

```
wavenox/
├── docs/                     # Handover & Architecture Documentation
│   ├── CUSTOMIZE.md          # 15-minute rebranding guide for new solar owners
│   ├── LEAD_GENERATION_ARCHITECTURE.md # Lead capture, attribution & CRM pipeline
│   └── SEO_ARCHITECTURE.md   # Schema.org, canonicalization & local indexing
├── public/                   # Static assets (favicons, robots.txt, sitemap.xml)
├── src/
│   ├── assets/               # Photographic placeholders & high-res renders
│   ├── config/               # Single-source-of-truth configuration files
│   │   ├── brand.ts          # Identity, phone, WhatsApp, email, socials
│   │   ├── business.ts       # Service hubs, regions, reviews, coverage
│   │   └── solar.ts          # Solar physics, tariffs, subsidy models
│   ├── components/           # UI components
│   │   ├── BrandLogo.tsx     # Reusable dynamic brand wordmark
│   │   ├── Header.tsx        # Sticky glass header with mobile menu
│   │   ├── Hero.tsx          # 4-slide storytelling carousel + Ghost CTA
│   │   ├── Features.tsx      # Core advantage cards with conic-border glow
│   │   ├── Comparison.tsx    # Split-screen conventional vs Wavenox
│   │   ├── DataMatrix.tsx    # 7-row technical benchmark table
│   │   ├── Ecosystem.tsx     # Horizontal parallax rail
│   │   ├── RoiEngine.tsx     # Live financial calculator (reads from solar.ts)
│   │   ├── Process.tsx       # 3-phase deployment timeline with energy pulse
│   │   ├── Portfolio.tsx     # Genesis deployment showcase
│   │   ├── Press.tsx         # Media marquee & feature articles
│   │   ├── Certifications.tsx# Holographic compliance seals
│   │   ├── Faq.tsx           # 10-item spring-accordion FAQ
│   │   ├── Footer.tsx        # Global ultra-luxury 4-column footer
│   │   ├── ConsultationDrawer.tsx # Lead inquiry & VIP proposal drawer
│   │   └── ui/               # Radix UI / shadcn headless primitives
│   ├── routes/               # TanStack Router file-based pages
│   │   ├── __root.tsx        # Root HTML shell & dynamic branding meta
│   │   ├── index.tsx         # Homepage orchestrating 12 core sections
│   │   ├── liquid-glass.tsx  # Liquid Glass roofing product line
│   │   ├── residential.tsx   # Residential luxury estate configurations
│   │   ├── defense.tsx       # High-security storm & EMP fortitude
│   │   ├── omnigrid.tsx      # Central intelligence unit & failsafe specs
│   │   ├── enterprise.tsx    # Commercial & industrial megawatt solar
│   │   ├── intelligence.tsx  # AI telemetry & smart routing
│   │   ├── brand.tsx         # Wavenox vision, R&D lab & manifesto
│   │   └── deploy.tsx        # Interactive roof quote configurator
│   ├── server.ts             # SSR server entry with error normalizer
│   ├── start.ts              # TanStack Start initialization & CSRF middleware
│   └── styles.css            # Tailwind CSS v4 tokens, animations & void masks
├── supabase/                 # Database migrations for lead persistence
│   └── migrations/           # PostgreSQL schemas with advisory locks & audit history
├── package.json              # Dependencies and npm scripts
└── vite.config.ts            # Vite 8 config with Lovable TanStack preset
```

---

## 4. Full-Stack Lead Generation & Attribution Pipeline

The lead generation pipeline is built for high-value enterprise and estate inquiries:

1. **Client Capture**:
   - The user opens the `ConsultationDrawer` from any CTA or visits `/deploy`.
   - Captures property tier, roof footprint / monthly bill, solar objectives, full name, phone number, and location.
   - Preserves traffic attribution: `gclid`, `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, and initial landing URL.
2. **Server-Side Validation & Normalization**:
   - TanStack Server Function validates payload using Zod.
   - Normalizes mobile numbers to Indian standard `+91XXXXXXXXXX`.
   - In-memory burst rate limiting prevents spam flooding.
3. **Database Concurrency & Deduplication**:
   - Executes a transaction-scoped advisory lock in PostgreSQL based on the normalized phone number.
   - Rejects duplicate inquiries submitted within 10 minutes to prevent double-entries across multiple browser tabs or rapid clicks.
   - Persists the lead with initial status `new` in `consultations` table with stage timestamp audit history.
4. **Instant Owner Notification**:
   - Dispatches a formatted notification via Meta WhatsApp Cloud API or Email to the solar business owner with client name, phone, roof size, and attribution source.
   - Runs asynchronously via `waitUntil` to guarantee the visitor receives a sub-500ms confirmation response without waiting for third-party network roundtrips.
5. **Conversion Measurement**:
   - Fires Google Ads conversion event only after Supabase returns the persisted lead UUID, passing the UUID as the unique `transaction_id`.

---

## 5. Technical SEO & Dynamic Structured Data

All pages dynamically inject JSON-LD structured data derived from `src/config/`:
- **`Organization` & `SolarInstallationBusiness`**: Dynamic company name, URL, logo, telephone, address, and geo-coordinates from `brand.ts` and `business.ts`.
- **`areaServed`**: Dynamically mapped from `BUSINESS.serviceHubs`.
- **`FAQPage`**: Dynamic structured data for the accordion FAQ, boosting rich search snippets on Google.
- **Canonical URLs & Open Graph**: Derives canonical origins dynamically from `BRAND_CONFIG.domain`, avoiding duplicate content penalties.
