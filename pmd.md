# WAVENOX — Product Requirements Document (PRD / PMD)

---

## 1. Executive Summary & Product Vision

**WAVENOX** is a category-defining clean-tech web platform engineered to bring the **complete Tesla Solar Panels & Energy Design Studio experience (`https://www.tesla.com/solarpanels` & `https://www.tesla.com/energy/design`)** to **India**.

It eliminates the amateur, cluttered, and clichéd tropes of conventional Indian solar websites, replacing them with Tesla's world-renowned showroom design discipline, radical subtraction, pure white & studio-gray aesthetics, and seamless multi-layer user experience.

### 1.1 The Reusable "Sale-Ready" Masterpiece Business Model
WAVENOX is architected from day one as a **turnkey, white-label, sale-ready business asset**. 
- **Owner-Agnostic Core**: The platform is decoupled through a centralized configuration engine (`src/config/brand.ts`, `src/config/business.ts`, `src/config/solar.ts`).
- **15-Minute Rebranding**: When sold to a real-world solar EPC contractor, rooftop solar installer, or renewable energy conglomerate in India, the buyer's company name, logo, phone, WhatsApp, email, service hubs, warranty claims, DISCOM tariffs, and pricing can be rebranded in under 30 minutes without touching UI markup.
- **Cinema-Grade Placeholder Visuals**: All photography and renders are high-aesthetic placeholders in `src/assets/`, structured with standardized aspect ratios for instant zero-breakage replacement with actual client media.

---

## 2. Market Problem & Strategic Positioning

### 2.1 The Indian Solar Landscape Problem
1. **The Race to the Bottom**: 99% of Indian rooftop solar websites are chaotic, low-trust pages with clichéd green foliage, low-res stock panels, and confusing government jargon.
2. **The Luxury & Premium Void**: High-net-worth estate owners (Jubilee Hills, Kokapet, Indiranagar, South Delhi, Goa) and corporate headquarters demand clean, concealed, all-black solar architecture that enhances property value rather than destroying roof aesthetics with ugly silver rails and messy conduits.
3. **The Power Cut Reality**: Unlike Western grids, Indian households face frequent voltage fluctuations and power outages during peak summers. Solar alone is incomplete without battery storage (Omnigrid / Powerwall) for 24/7 outage protection.
4. **The Subsidy Confusion**: Homeowners find government subsidies (PM Surya Ghar Muft Bijli Yojana) complicated and opaque. WAVENOX integrates instant, transparent subsidy calculations upfront.

### 2.2 The WAVENOX Solution (The Tesla Blueprint for India)
WAVENOX delivers:
- **Sleek, Low-Profile All-Black Panels**: Concealed mounting hardware, zero visible conduits, flush aesthetic.
- **Showroom Cleanliness**: Pure White (`#FFFFFF`) and Studio Light Gray (`#F8F8FA`) canvas with deep Carbon Dark (`#171A20`) typography.
- **24/7 Outage Protection**: Seamless battery backup (Omnigrid) that islands the home in under 4ms during Indian power cuts.
- **Pay Less for Electricity Calculator**: Instant monthly electricity bill slider (₹3k to ₹75k+) with real-time state DISCOM net-metering math and upfront PM Surya Ghar Muft Bijli Yojana subsidy credits.
- **The System Design Studio (`/deploy`)**: A 6-step online configurator mirroring `tesla.com/energy/design` with custom sizing, battery options, and instant WhatsApp booking.

---

## 3. The 3-Layer Product Feature Matrix

### 3.1 LAYER 1: The Main Solar Panels Showcase (`/` or `/solarpanels`)
1. **Floating Blur Header**: Monolithic brand wordmark | `Solar Roof` | `Solar Panels` | `Omnigrid` | `Commercial` | `Schedule Consultation` pill & `Menu`.
2. **100vh Full-Bleed Hero**: Centered clean title (`Solar for Existing Roofs` / `Solar Panels`), subtitle link (`Schedule a Virtual Consultation →`), bottom floating dock with 3 key specs (`Guaranteed Lowest Price`, `25-Year Warranty`, `24/7 Outage Protection`) and dual pills (`Order Now` / `Schedule Consultation`).
3. **Clean Energy & Architectural Integration**: Flush aesthetic, concealed mounting hardware, zero visible conduits, all-black aesthetic.
4. **24/7 Outage Protection (Omnigrid)**: Integrated battery storage for Indian grid blackouts with interactive Day / Night / Outage flow simulator.
5. **Pay Less for Electricity**: Interactive monthly electricity bill slider (₹3k to ₹75k+) with instant system sizing, annual savings, and PM Surya Ghar subsidy credit in Indian rupees (₹).
6. **Efficiency & All-Weather Reliability**: High-yield N-type TOPCon dual-glass cells, cascading cell architecture, shade resilience, and extreme temperature tolerance.
7. **Monitor and Optimize**: Sleek mobile app mockup with live animated energy flow telemetry (Solar ➔ Battery ➔ Home ➔ Grid).
8. **Built to Last (Specs Drawer)**: Expandable 2-column minimalist engineering specs matching Tesla's drawer.
9. **Order to Power On (5-Step Timeline)**: 1. Virtual 3D Design ➔ 2. DISCOM Net-Metering Feasibility ➔ 3. 1-Day Installation ➔ 4. CEIG Inspection ➔ 5. Power On & Subsidy Credit.
10. **Schedule a Virtual Consultation**: Energy advisor booking modal for 1-on-1 virtual design reviews.
11. **Comprehensive FAQ & Support**: Clear answers on net-metering, roofs, warranties, and PM Surya Ghar subsidies.
12. **Minimalist 1-Line Showroom Footer**: `WAVENOX © 2026 | Privacy & Legal | Consumer Disclosures | PM Surya Ghar Guidelines | Locations | Contact`.

### 3.2 LAYER 2: The Interactive System Design Studio (`/deploy` or `/energy/design`)
- **Step 1: Property Location & Monthly Power Bill**: City/PIN code and monthly bill slider (₹5,000 to ₹75,000+).
- **Step 2: Recommended System Sizing**: Small (4.8 kW / 12 panels), Medium (9.6 kW / 24 panels), Large (14.4 kW / 36 panels), Extra Large (19.2 kW+ / 48 panels).
- **Step 3: Battery Storage (Omnigrid)**: Select 0, 1, 2, or 3 units (Whole Home vs Partial Backup).
- **Step 4: Roof Type Selector**: RCC Flat Terrace vs Sloped Mangalore Tile vs Metal Sheet.
- **Step 5: Financial Breakdown & PM Surya Ghar Subsidy**: Gross price, Upfront government subsidy credit (up to ₹78,000), Net payable cost, 25-yr wealth generated, Cash vs 5-year loan EMI options.
- **Step 6: One-Click WhatsApp Reservation**: Direct dossier dispatch to the solar business owner.

### 3.3 LAYER 3: Dedicated Ecosystem Sub-Pages
- **Solar for Homes (`/residential`)**: Deep dive into luxury residential architectural solar.
- **Commercial & Megawatt Industrial (`/enterprise`)**: Commercial solar, factory rooftops, Section 32 40% Year-1 tax depreciation calculator with [`enterprise_mw_rooftop.jpg`](file:///Users/bunny/.gemini/antigravity/scratch/wavenox/src/assets/enterprise_mw_rooftop.jpg).
- **Omnigrid Storage (`/omnigrid`)**: Whole-home battery storage, sub-millisecond islanding during Indian summer blackouts.
