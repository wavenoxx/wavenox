# WAVENOX — Product Requirements Document (PRD / PMD)

---

## 1. Executive Summary & Product Vision

**WAVENOX** is a category-defining, full-stack, reusable architectural solar technology web platform. It elevates solar power from an unsightly utilitarian bolt-on into an elite, monolithic luxury asset designed for luxury residences, commercial headquarters, and high-security industrial installations.

### 1.1 The Reusable "Sale-Ready" Masterpiece Business Model
WAVENOX is architected from day one as a **turnkey, white-label, sale-ready business asset**. 
- **Owner-Agnostic Core**: The platform is not hardcoded to a single business entity. It is decoupled through a centralized configuration engine (`src/config/brand.ts`, `src/config/business.ts`, `src/config/solar.ts`).
- **15-Minute Rebranding**: When sold to a real-world solar EPC contractor, rooftop solar installer, or green-tech conglomerate, the buyer's company name, logo, phone, WhatsApp, email, service hubs, warranty claims, DISCOM tariffs, and pricing can be rebranded in under 30 minutes without touching UI markup.
- **Placeholder Visuals Policy**: The initial photographic and render assets are high-aesthetic placeholders generated to establish the luxury design language. They can be replaced progressively with the buyer's real drone footage, rooftop installation photography, and actual client project media.

---

## 2. Core Value Proposition & Market Need

### 2.1 The Solar Market Paradox
1. **Low-End Competition**: 98% of solar installers in India look identical—amateur websites with clichéd green leaves, stock panels, and low-trust branding competing in a race to the bottom on price.
2. **The Luxury & Enterprise Vacuum**: High-net-worth estate owners (Jubilee Hills, Banjara Hills, Gachibowli, Goa, Delhi-NCR) and corporate headquarters refuse to install ugly bolt-on aluminum rails that ruin architectural aesthetics and risk roof leaks.
3. **The WAVENOX Opportunity**: WAVENOX positions the buyer as a **billion-dollar luxury clean-tech atelier**, selling monolithic Liquid Glass solar architecture, 25-year structural warranties, and day-one financial wealth generation.

---

## 3. Target Buyer & End-Customer Personas

### 3.1 Platform Buyer (The Solar Business Owner)
- **Profile**: Ambitious Solar EPC contractors, rooftop solar developers, or industrial renewable energy companies looking to dominate the premium residential and commercial solar market.
- **Need**: An institutional-grade website and lead conversion engine that commands 30–50% higher price premiums over conventional solar vendors.

### 3.2 End Customers (The Solar Asset Buyers)
- **UHNWI Luxury Villa & Estate Owners**: 30kW–120kW autonomous systems with zero visual clutter, silent battery backup, and 14+ day grid independence.
- **Commercial & Industrial Conglomerates**: Megawatt-scale industrial rooftops, solar carports, and corporate headquarters looking for rapid 2.5–3 year ROI and 40% Year-1 accelerated tax depreciation.
- **High-Security & Critical Infrastructure**: Government buildings, data centers, and off-grid command nodes requiring EMP shielding, ballistic impact ratings, and < 0.1ms instant blackout islanding.

---

## 4. Reusable Feature Matrix

### 4.1 Centralized Brand & Business Configuration (`src/config/`)
- `brand.ts`: Brand name, legal entity, tagline, phone (display & E.164 dial), WhatsApp (display & link), email, social channels, domain.
- `business.ts`: Region coverage, primary city, geo coordinates, service hubs, customer reviews, pricing guides.
- `solar.ts`: DISCOM tariff rates (e.g., TSSPDCL ₹9.5/kWh), Watts/sqft density, solar generation hours, subsidy slabs (PM Surya Ghar Muft Bijli Yojana), warranty terms.

### 4.2 Core Frontend Engine (Completed 50% Milestone)
- **Hero Storytelling Carousel**: 4 dynamic slides with fluid typography, Sunburst Orange (`#F57C00`) accents, slide counter, and active-state navigation.
- **Advantage Matrix (`Features.tsx`)**: 4 tier-1 cards with continuous rotating conic border glow (`card-glow-spin`).
- **Conventional vs Wavenox (`Comparison.tsx`)**: Interactive split-screen comparison highlighting liabilities vs advantages.
- **Benchmark Data Grid (`DataMatrix.tsx`)**: 7-criteria technical comparison between conventional solar and Wavenox.
- **Omni-Grid Parallax Rail (`Ecosystem.tsx`)**: Horizontal scroll rail showcasing 6 modular solar applications.
- **Interactive Financial Engine (`RoiEngine.tsx`)**: Live reactive calculator with area slider (1,000–100,000 sq.ft), spring-animated CountUp numbers, and physics comparison bars.
- **Integration Protocol (`Process.tsx`)**: 3-stage deployment timeline with animated SVG energy packet pulse.
- **Genesis Deployments (`Portfolio.tsx`)**: 6 showcase cards across Government, Aviation, Logistics, and Hospitality.
- **Media & Proof (`Press.tsx` & `Certifications.tsx`)**: Draggable publication marquee and holographic compliance seals.
- **System Intelligence FAQ (`Faq.tsx`)**: 10-item spring-animated accordion FAQ.
- **Dedicated Solution Pages**: `/liquid-glass`, `/residential`, `/defense`, `/omnigrid`.

### 4.3 High-Converting Lead Generation Architecture (Phase 2 & 3)
- **Multi-Touchpoints**:
  1. Primary Hero CTA button (`"UNLOCK ENERGY INDEPENDENCE →"`).
  2. Slide-over Consultation Drawer (`ConsultationDrawer.tsx`) accessible from all pages.
  3. Direct VIP WhatsApp Link (`https://wa.me/...`) with pre-filled solar quote request text.
- **Solar Qualification Inputs**:
  - Property Type: Luxury Villa, Commercial Estate, Industrial Plant, Defense/Compound.
  - Sizing Metric: Roof Footprint (sq.ft) OR Average Monthly Electricity Bill (₹).
  - Energy Objective: Bill Elimination, Failsafe Battery Backup, Luxury Architectural Aesthetic.
  - Contact Details: Name, WhatsApp/Phone (+91 format), City / PIN code.
- **Backend Flow**:
  - Server function with Zod validation, Indian phone normalization, and anti-spam burst limiting.
  - Database persistence via Supabase with transaction-scoped advisory locks.
  - Automated WhatsApp Cloud API or Email alert sent directly to the business owner.
  - Google Ads Consent Mode v2 integration with duplicate-proof transaction tracking.

---

## 5. Implementation Roadmap

- **Phase 1 (Completed)**: Visual design foundation, landing page sections, subpage prototypes, deep scan.
- **Phase 2 (Current Sprint)**: Reusable config layer (`src/config/`), Global Footer, Consultation Drawer, Hero CTA restoration, Root metadata branding.
- **Phase 3 (Subpages & Configurator)**: `/enterprise`, `/intelligence`, `/brand`, and interactive `/deploy` roof configurator.
- **Phase 4 (Lead Engine & Backend)**: Supabase lead migrations, server functions, owner WhatsApp alert, PDF assessment generator.
- **Phase 5 (Documentation & Handover)**: `docs/CUSTOMIZE.md`, `docs/LEAD_GENERATION_ARCHITECTURE.md`, `docs/SEO_ARCHITECTURE.md`.
