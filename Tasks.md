# WAVENOX — Execution Roadmap & Task Matrix (`Tasks.md`)

---

## 1. Project Phase Overview

```
┌─────────────────────────┐     ┌─────────────────────────┐     ┌─────────────────────────┐
│        PHASE 1          │     │        PHASE 2          │     │        PHASE 3          │
│   Foundation & Audit    │ ──► │  Config & Bespoke Assets│ ──► │ Layer 1: Tesla Showcase │
│       (COMPLETED)       │     │       (COMPLETED)       │     │     (ACTIVE SPRINT)     │
└─────────────────────────┘     └─────────────────────────┘     └─────────────────────────┘
                                                                             │
                                                                             ▼
┌─────────────────────────┐     ┌─────────────────────────┐     ┌─────────────────────────┐
│        PHASE 6          │     │        PHASE 5          │     │        PHASE 4          │
│   Production Audit      │ ◄── │ Layer 3: Ecosystem      │ ◄── │ Layer 2: Design Studio  │
│   & Git Remote Push     │     │ Subpages Refactor       │     │  Configurator (/deploy) │
└─────────────────────────┘     └─────────────────────────┘     └─────────────────────────┘
```

---

## 2. Phase 1: Codebase Audit & Reference Scanning (Status: COMPLETED ✅)

- [x] Clone and deep scan GitHub repository (`https://github.com/wavenoxx/wavenox.git`).
- [x] Inspect founder's reference project (`InvisProtect`) at `/scratch/invisprotect`.
- [x] Analyze live Tesla Solar website (`tesla.com/solarpanels` & `tesla.com/energy/design`) structure, typography, and color tokens.
- [x] Identify root causes of previous prototype rejection (unfocused AI-style clutter, busy glowing cards, bloated footer).

---

## 3. Phase 2: Configuration & Asset Generation (Status: COMPLETED ✅)

- [x] Create centralized decoupled configuration engine (`src/config/brand.ts`, `business.ts`, `solar.ts`).
- [x] Resolve critical runtime bug in `computeSolarYield` in `src/config/solar.ts` (preventing error boundaries).
- [x] Generate cinema-grade bespoke visual assets in `src/assets/`:
  - `luxury_solar_villa.jpg`: Modern concrete villa with seamless black solar roof at golden hour.
  - `liquid_glass_macro.jpg`: Macro shot of hexagonal N-type TOPCon silicon cells under tempered diamond glass.
  - `enterprise_mw_rooftop.jpg`: High-angle aerial render of 1MW monolithic black solar roof.

---

## 4. Phase 3: Layer 1 — The Main Tesla Solar Showcase (`src/routes/index.tsx`) (Active Sprint 🔴)

- [ ] **Step 3.1: Floating Blur Header (`Header.tsx`)**
  - Left: Monolithic `WAVENOX` logo.
  - Center: Clean links (`Solar Roof`, `Solar Panels`, `Omnigrid`, `Commercial`).
  - Right: Sleek `Schedule Consultation` pill & `Menu` drawer trigger.
- [ ] **Step 3.2: 100vh Full-Bleed Hero Section (`Hero.tsx`)**
  - Full-screen `luxury_solar_villa.jpg` background.
  - Centered clean title (`Solar for Existing Roofs` / `Solar Panels`).
  - Subtitle link (`Schedule a Virtual Consultation →`).
  - Bottom floating dock with 3 key specs (`Guaranteed Lowest Price`, `25-Year Warranty`, `24/7 Outage Protection`).
  - Dual Tesla pill buttons (`Order Now` solid Carbon Dark pill + `Schedule Consultation` dark glass pill).
- [ ] **Step 3.3: Sleek Low-Profile Design Section (`SleekDesign.tsx`)**
  - Pure White `#FFFFFF` backdrop.
  - Concealed mounting hardware, zero visible conduits, monolithic all-black styling.
  - Macro visual (`liquid_glass_macro.jpg`).
- [ ] **Step 3.4: 24/7 Outage Protection Section (`OutageProtection.tsx`)**
  - Studio Gray `#F8F8FA` backdrop.
  - Omnigrid battery storage integration for uninterrupted power during Indian grid blackouts.
  - Interactive status simulator (Day: Solar Charging / Night: Battery / Grid Outage: Instant Islanding).
- [ ] **Step 3.5: Pay Less for Electricity Section (`BillSavingsSlider.tsx`)**
  - Pure White `#FFFFFF` backdrop.
  - Interactive monthly electricity bill slider (₹3,000 to ₹75,000+ per month).
  - Indian state DISCOM selector (TSSPDCL, BESCOM, MSEDCL, TANGEDCO, BSES).
  - Live reactive calculations: System size (kW), annual savings, 25-yr net wealth, and PM Surya Ghar subsidy credit.
- [ ] **Step 3.6: Efficiency & All-Weather Reliability (`EfficiencyTech.tsx`)**
  - Studio Gray `#F8F8FA` backdrop.
  - N-type TOPCon cascading cell tech, shade resilience, 50°C Indian heat resistance.
- [ ] **Step 3.7: Monitor and Optimize Section (`EnergyControl.tsx`)**
  - Pure White `#FFFFFF` backdrop.
  - Sleek mobile phone mockup with animated energy flow telemetry (Solar ➔ Battery ➔ Home ➔ Grid).
- [ ] **Step 3.8: Built to Last: Technical Specs Drawer (`TechSpecs.tsx`)**
  - Expandable 2-column minimalist engineering specs table matching Tesla's spec drawer.
- [ ] **Step 3.9: Order to Power On Section (`OrderProcess.tsx`)**
  - Studio Gray `#F8F8FA` backdrop.
  - 5-step installation timeline (Virtual Design ➔ Permitting ➔ Installation ➔ CEIG Inspection ➔ Power On & Subsidies).
- [ ] **Step 3.10: Schedule a Virtual Consultation Modal (`ConsultationModal.tsx`)**
  - Tesla Energy Advisor booking drawer for 1-on-1 virtual design reviews.
- [ ] **Step 3.11: Comprehensive FAQ & Support Accordion (`SupportFaq.tsx`)**
  - High-trust Indian rooftop solar Q&A on net-metering, subsidies, warranties.
- [ ] **Step 3.12: Minimalist 1-Line Showroom Footer (`Footer.tsx`)**
  - Replaces 4-column footer with Tesla's iconic 1-line understated footer.
- [ ] **Step 3.13: Assemble Homepage (`src/routes/index.tsx`)**
  - Orchestrate all 12 modules into the seamless Tesla Solar Showcase flow.

---

## 5. Phase 4: Layer 2 — Interactive System Design Studio (`/deploy`)

- [ ] **Step 4.1**: Build `SystemConfigurator.tsx` with 6-step interactive flow:
  1. *Location & Bill*: City/PIN code + Monthly power bill (₹3k to ₹75k+).
  2. *System Sizing*: Small (4.8 kW), Medium (9.6 kW), Large (14.4 kW), Extra Large (19.2 kW+).
  3. *Battery Storage (Omnigrid)*: 0, 1, 2, or 3 units with Whole Home vs Essential Load backup toggle.
  4. *Roof Type Selector*: RCC Flat Terrace vs Sloped Mangalore Tile vs Metal Sheet.
  5. *Financial Breakdown*: Gross price, PM Surya Ghar subsidy credit (up to ₹78,000), Net payable cost, Cash vs Loan EMI.
  6. *One-Click WhatsApp Reservation*: Direct dossier dispatch.
- [ ] **Step 4.2**: Mount into `src/routes/deploy.tsx` with showroom styling.

---

## 6. Phase 5: Layer 3 — Ecosystem Subpages Refactor

- [ ] **Step 5.1**: Refactor `/residential` (Solar for Homes) with Tesla showroom styling and spec docks.
- [ ] **Step 5.2**: Refactor `/enterprise` (Commercial & Industrial MW) with Section 32 40% depreciation engine.
- [ ] **Step 5.3**: Refactor `/omnigrid` (Storage) with whole-home backup and sub-millisecond islanding.

---

## 7. Phase 6: Production Audit, Verification & Git Remote Push

- [ ] Execute `npm run build` to verify clean compilation.
- [ ] Confirm local development server is active on `http://localhost:8080/`.
- [ ] Commit all changes with clean atomic git messages.
- [ ] Push to GitHub remote `https://github.com/wavenoxx/wavenox.git`.
