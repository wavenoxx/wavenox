# WAVENOX — Persistent Project Memory & Brain (`Memory.md`)

---

## 1. Project Genesis & Business Strategy

- **Brand Name**: WAVENOX
- **Tagline**: Absolute power. Zero compromise.
- **Vision**: Building a category-defining billion-dollar luxury architectural solar infrastructure enterprise web platform.
- **The Reusable Masterpiece Strategy**:
  - The founder started WAVENOX based on a bold forward-looking vision for the future of solar in India and globally.
  - The business details currently in the project are not tied to a specific real-world owner yet.
  - **The Goal**: Build WAVENOX end-to-end as an impeccable, high-converting, full-stack **reusable masterpiece**. When complete, the platform will be sold to a real-world solar business owner (Solar EPC / Rooftop installer / Renewable energy developer), customizing it to their specific company details, claims, and requirements in 15–30 minutes.
- **Visual Assets Policy**:
  - All current imagery in `wavenox` consists of high-aesthetic placeholders generated in Lovable. They are not final.
  - The founder will replace them with original installation photography and drone shots when customized for a client.
  - Any new images created during development should match this high-aesthetic luxury standard and follow clean aspect-ratio contracts.
- **Reference Project Blueprint (`InvisProtect`)**:
  - The founder previously created an end-to-end reusable masterpiece website for invisible grills and safety solutions (`https://github.com/wavenoxx/invisprotect.git`, located locally at `/Users/bunny/.gemini/antigravity/scratch/invisprotect`).
  - **Key Architecture Borrowed from `InvisProtect`**:
    1. **Decoupled Configuration Layer (`src/config/`)**:
       - `brand.ts`: Single source of truth for identity, domain, phone, WhatsApp, email, social links, with environment variable overrides.
       - `business.ts`: Region, primary city, geo coordinates, service hubs, genuine review registry.
       - `solar.ts`: Solar physics, DISCOM utility tariffs, subsidy slabs, warranty years.
    2. **Sale-Ready Handover Documentation (`docs/`)**:
       - `CUSTOMIZE.md`: Detailed guide for handing over and rebranding a copy for a new business owner in 15–30 minutes.
       - `LEAD_GENERATION_ARCHITECTURE.md`: Lead attribution, duplicate-proof advisory locking, owner WhatsApp notifications, and Google Ads measurement.
       - `SEO_ARCHITECTURE.md`: Dynamic JSON-LD structured data and route indexing registry.
    3. **Resilient Lead Capture Pipeline**:
       - Multi-channel capture (Consultation drawer, direct VIP WhatsApp link, quote configurator).
       - Phone normalization to `+91XXXXXXXXXX`, Zod validation, and in-memory rate limiting.
       - Supabase database persistence with transaction-scoped advisory locks to eliminate duplicate submissions.
       - Direct WhatsApp Cloud API alert dispatched to the business owner with client name, roof area, and UTM traffic attribution.

---

## 2. Technical Environment & Stack State

| Parameter | Current Value | Notes |
| :--- | :--- | :--- |
| **Operating System** | macOS (Darwin) | Local developer machine |
| **Node.js Version** | `v26.4.0` | Node 26 LTS runtime |
| **Package Tooling** | `npm` / `bun` (bun.lock present) | Scripts configured in `package.json` |
| **Meta-Framework** | TanStack Start (`^1.168.26`) | Nitro-based SSR + Vite 8 |
| **Routing** | TanStack Router (`^1.170.16`) | Type-safe, file-based (`src/routes/`) |
| **Styling** | Tailwind CSS v4 (`^4.2.1`) | `@theme inline`, OKLCH color space |
| **Animation Engine** | Framer Motion (`^12.42.2`) | GPU-accelerated spring physics |
| **Component Kit** | Radix UI + shadcn/ui | Headless accessible primitives |
| **Icons** | Lucide React (`^0.575.0`) | Clean line-art icons |

---

## 3. Brand Invariants & "Sale-Ready" Design Rules

1. **The Obsidian Void Canvas**:
   - The canvas background is strictly `#000000` (`oklch(0 0 0)`). No gray or washed-out backgrounds are permitted.
2. **Sunburst Orange Core**:
   - Accent color is `#F57C00` (`oklch(0.72 0.18 55)`), representing radiant solar energy against the obsidian void.
   - Secondary amber and gold glows (`#FFB547`, `#FFC978`).
3. **Zero Hardcoded Business Details**:
   - Brand name, telephone, WhatsApp, email, and addresses must ALWAYS be imported from `src/config/brand.ts` or `src/config/business.ts`.
4. **Solar Constants Decoupling**:
   - Tariffs, efficiencies, subsidy slabs, and warranties must ALWAYS be imported from `src/config/solar.ts`.
5. **No Breadcrumbs Rule**:
   - Never insert breadcrumb navigation in Hero or headers.
6. **True Mobile Fluidity**:
   - All H1 headings must scale down gracefully (`text-3xl sm:text-4xl md:text-5xl lg:text-6xl`).
   - Mobile buttons must be ergonomic (`w-full sm:w-auto`).
7. **Mobile Navigation Overlay**:
   - The desktop menu must collapse into a fullscreen animated dark sheet with an elegant close trigger.
8. **Fade-to-Void Image Blending**:
   - All photographic assets must fade softly into the black background using `mask-void-bottom`, `mask-void-y`, or `mask-void-all`.
9. **Institutional Prestige Voice**:
   - Tone is bold, authoritative, and architectural. Never use clichéd budget-solar slogans.

---

## 4. Current File & Component Status Matrix

| Component / Route | Path | Status | Analysis & Notes |
| :--- | :--- | :--- | :--- |
| **Config Engine** | `src/config/` | 🟢 100% Complete | `brand.ts`, `business.ts`, `solar.ts` established and active. |
| **Root Shell** | `src/routes/__root.tsx` | 🟢 100% Complete | Dynamic title, author, description, and OpenGraph tags from `BRAND_CONFIG`. |
| **Homepage** | `src/routes/index.tsx` | 🟢 100% Complete | Renders all 12 sections + global luxury Footer. |
| **Brand Wordmark** | `src/components/BrandLogo.tsx` | 🟢 100% Complete | Dynamic logo wordmark reading from `BRAND_CONFIG.name`. |
| **Header** | `src/components/Header.tsx` | 🟢 100% Complete | Dynamic BrandLogo integrated, navigation links wired. |
| **Hero Section** | `src/components/Hero.tsx` | 🟢 100% Complete | 4-slide carousel + Ghost CTA button (`UNLOCK ENERGY INDEPENDENCE →`). |
| **Features** | `src/components/Features.tsx` | 🟢 100% Complete | 4 advantage cards with 24/7 rotating conic glow (`card-glow-spin`). |
| **Comparison** | `src/components/Comparison.tsx`| 🟢 100% Complete | Interactive split-screen comparison with dimming hover effect. |
| **DataMatrix** | `src/components/DataMatrix.tsx`| 🟢 100% Complete | 7-row technical benchmark table with desktop and mobile layouts. |
| **Ecosystem** | `src/components/Ecosystem.tsx` | 🟢 100% Complete | Horizontal scroll parallax rail with 6 system modules. |
| **RoiEngine** | `src/components/RoiEngine.tsx` | 🟢 100% Complete | Live financial calculator with area slider and animated physics bars. |
| **Process** | `src/components/Process.tsx` | 🟢 100% Complete | 3-step deployment timeline with animated SVG pulse packet line. |
| **Portfolio** | `src/components/Portfolio.tsx` | 🟢 100% Complete | 6 genesis deployments across high-security and luxury sectors. |
| **Press** | `src/components/Press.tsx` | 🟢 100% Complete | Interactive draggable media marquee and 3 feature article cards. |
| **Certifications**| `src/components/Certifications.tsx`| 🟢 100% Complete | Holographic compliance seals (UL, TÜV, BIS, Patent). |
| **FAQ** | `src/components/Faq.tsx` | 🟢 100% Complete | 10-item accordion with spring height expansion. |
| **Liquid Glass** | `src/routes/liquid-glass.tsx`| 🟢 100% Complete | Cinematic product presentation + mounted Footer. |
| **Residential** | `src/routes/residential.tsx` | 🟢 100% Complete | Villa/Estate/Compound tiers with SVG flow + mounted Footer. |
| **Defense** | `src/routes/defense.tsx` | 🟢 100% Complete | High-security storm and EMP resilience + mounted Footer. |
| **Omnigrid** | `src/routes/omnigrid.tsx` | 🟢 100% Complete | Central unit logic and failsafe islanding + mounted Footer. |
| **Global Footer**| `src/components/Footer.tsx` | 🟢 100% Complete | Ultra-luxury 4-column footer reading from `BRAND_CONFIG`. |
| **Consultation Drawer**| `src/components/ConsultationDrawer.tsx`| 🟢 100% Complete | Multi-step VIP lead capture drawer with WhatsApp dispatch & ROI yield calc. |
| **Enterprise** | `src/routes/enterprise.tsx` | 🟢 100% Complete | MW-scale commercial & industrial solar with Section 32 40% tax benefits. |
| **Intelligence**| `src/routes/intelligence.tsx`| 🟢 100% Complete | AI telemetry & interactive energy flow simulator widget. |
| **The Brand** | `src/routes/brand.tsx` | 🟢 100% Complete | WAVENOX Genesis, Hyderabad R&D laboratory, and Monolithic Manifesto. |
| **Deploy** | `src/routes/deploy.tsx` | 🟢 100% Complete | 4-step architectural solar configurator & PM Surya Ghar subsidy estimator. |
| **Handover Docs**| `docs/` | 🟢 100% Complete | `CUSTOMIZE.md`, `LEAD_GENERATION_ARCHITECTURE.md`, `SEO_ARCHITECTURE.md`. |
| **Lead Schema** | `supabase/migrations/` | 🟢 100% Complete | Postgres consultation schema with RLS, anti-spam trigger & UTM attribution. |

---

## 5. Continuity Instructions for Future Sessions

1. **Always reference this `Memory.md`, `Tasks.md`, and `invisprotect`'s architectural blueprint**.
2. **Never hardcode client details**. Everything must flow through `src/config/`.
3. **Sale-Ready Platform Verified**: All 9 routes (`/`, `/residential`, `/enterprise`, `/liquid-glass`, `/omnigrid`, `/defense`, `/intelligence`, `/brand`, `/deploy`) are fully built, typed, and integrated with the global VIP Consultation Engine.

