# WAVENOX — Product Requirements Document (PRD / PMD)

---

## 1. Executive Summary & Product Vision

**WAVENOX** is an architectural clean-technology demonstration and design platform that adapts the aesthetic restraint, spatial discipline, and typography of the world's leading clean-tech interfaces for **India**.

It eliminates the cluttered, sales-aggressive, and clichéd tropes of conventional Indian solar websites, replacing them with quiet showroom discipline, monochrome aesthetics, and 100% sourced statutory calculations (TGERC, MNRE, IS 875, NASA POWER).

### 1.1 Architectural Concept & Portfolio Scope

WAVENOX is designed as a **concept demonstration and engineering portfolio asset**.

- **Decoupled Architecture**: All brand, regulatory, and solar parameters are isolated in `src/config/` (`brand.ts`, `regulatory.ts`, `solar.ts`, `sources.ts`).
- **Honest Demo End-State**: Form submissions on the site reach an honest demonstration confirmation (`WNX-PREVIEW-XXXXXX`) that clarifies the concept nature of the platform while providing real simulated dossier data.
- **Sourced Assumptions Catalog**: Every metric on screen traces directly to an official government gazette or verified scientific dataset.

---

## 2. Problem Statement & Architectural Positioning

### 2.1 The Indian Rooftop Solar Landscape

1. **Low-Trust Aggregator Models**: Standard rooftop solar portals make unsubstantiated claims ("Free electricity forever", "Guaranteed 48-hour sanctions"), ignoring statutory transformer loading caps and site inspection requirements.
2. **Terrace Destruction**: Crude galvanized mounting scaffolding bolted directly into RCC slabs destroys terrace usability and punctures waterproofing membranes. WAVENOX explores elevated pergola structures maintaining 7 to 9 feet of clear headroom.
3. **Blackout Inadequacy**: Standard grid-tied systems disconnect during utility power cuts. Adding battery storage is often sold as a financial investment when under net metering it is purely an outage-security asset.
4. **Subsidy & Tariff Obfuscation**: Government subsidies (PM Surya Ghar) and DISCOM slab charges are frequently misrepresented. WAVENOX presents exact telescopic tariff math upfront.

### 2.2 The WAVENOX Solution

- **Elevated Pergola Architecture**: Concealed wiring, weather-sealed conduits, and preserved terrace outdoor living space.
- **Showroom Cleanliness**: Pure White (`#FFFFFF`) and Studio Light Gray (`#F4F4F4`) canvas with deep Carbon Dark (`#171A20`) typography.
- **Honest Battery Storage**: LiFePO4 whole-home storage with &lt;20ms UPS transfer during Indian power cuts, accompanied by clear economic advisories regarding net metering ROI.
- **Sourced Bill Decoder**: Real telescopic slab math under TGERC FY 2025–26 schedules.
- **Interactive System Design Studio (`/deploy`)**: Sizing tiers (3 kW – 25 kW), Leaflet satellite terrace sketcher, monthly solar generation charts, and upfront PM Surya Ghar central financial assistance.

---

## 3. Product Architecture

### 3.1 LAYER 1: The Rooftop Solar Showcase (`/`)

1. **Floating Blur Header**: Accessible navigation menu with residential, commercial, and regulatory links, language toggle, and consultation button.
2. **100svh Full-Bleed Hero**: Centered clean title (`Rooftop Solar`), single-line lead, bottom floating dock with 3 sourced specs (`₹78,000 Surya Ghar Subsidy`, `25-Year Linear Warranty`, `24/7 Outage Protection`) and dual pill CTAs (`Design Yours` / `Schedule Consultation`).
3. **Clean Architecture & Terrace Mounting**: Flush elevated pergola aesthetic, zero visible conduits, all-black bifacial modules.
4. **24/7 Outage Protection**: Integrated battery storage for Indian grid blackouts with 24-hour Day / Night / Outage energy flow simulator.
5. **Pay Less for Electricity**: Interactive monthly electricity bill slider (₹3,000 to ₹75,000+) with real-time TGERC net-metering math and upfront PM Surya Ghar subsidy calculations.
6. **Efficiency & All-Weather Reliability**: High-yield N-type TOPCon dual-glass cells with low temperature coefficient (−0.30%/°C) engineered for Indian summer ambient heat.
7. **Monitor and Optimize**: Inverter app telemetry overview with animated energy flow.
8. **Built to Last (Specs Drawer)**: Expandable 2-column minimalist engineering specs with verified ALMM DCR datasheets.
9. **Order to Power On (5-Step Timeline)**: 1. Digital Terrace Design ➔ 2. DISCOM Net-Metering Feasibility ➔ 3. Professional Installation ➔ 4. CEIG Inspection ➔ 5. Power On & DBT Subsidy.
10. **Schedule a Consultation**: Energy advisor drawer for technical review.
11. **Comprehensive FAQ & Support**: Clear answers on net-metering, roofs, warranties, and PM Surya Ghar subsidies.
12. **4-Column Engineered Footer**: Comprehensive directory navigation and legal fine-print concept strip.

### 3.2 LAYER 2: The Interactive System Design Studio (`/deploy`)

- **Step 1: Property Location & Monthly Power Bill**: City selector and monthly bill slider (₹3,000 to ₹75,000+).
- **Step 2: Recommended System Sizing**: Sizing tiers (3kW to 25kW) with Satellite Roof Sketcher integration.
- **Step 3: Battery Storage**: Sourced BEE appliance runtime advisor and plain payback statement.
- **Step 4: Roof Geometry & Obstructions**: Setback perimeter and mumty/water tank footprint deduction.
- **Step 5: Monthly Generation Profile**: NASA POWER / NREL PVWatts v8 insolation chart for Hyderabad.
- **Step 6: Feasibility Proposal Request**: Honest demo submission state with downloadable dossier preview.

### 3.3 LAYER 3: Dedicated Ecosystem Routes

- **Solar for Homes (`/residential`)**: Architectural elevated pergola terrace layouts.
- **Commercial & Industrial (`/enterprise`)**: Megawatt-scale solar, Section 32/34 40% Year-1 tax depreciation calculator.
- **Battery Storage (`/omnigrid`)**: Whole-home battery storage, &lt;20ms UPS transfer during grid blackouts.
- **Solar Physics & Engineering (`/technology`)**: 3D astronomical sun-path simulator and cell physics.
- **Colophon & Case Study (`/about-this-project`)**: Before/after transformation matrix, architectural decision log, and sources catalog.
