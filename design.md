# WAVENOX — Visual Design System & UI/UX Specification (`design.md`)

---

## 1. Brand Aesthetics & Visual Philosophy: The Tesla Solar Showroom Standard

The WAVENOX visual language is directly inspired by **Tesla Solar Panels (`https://www.tesla.com/solarpanels`)** and the **Tesla Energy Design Studio (`https://www.tesla.com/energy/design`)**, fused with the architectural luxury of high-end Indian estates.

It embodies Tesla's philosophy of **"Radical Subtraction & Showroom Cleanliness"**:
- **Pure White & Studio Light Gray Canvas**: Content breathes on pristine, ultra-clean white (`#FFFFFF`) and studio light gray (`#F8F8FA` / `#F4F4F6`), creating an airy, high-trust showroom aesthetic.
- **Cinematic Photography Contrast**: Dark contrast is reserved for edge-to-edge photography viewports (like the Hero and macro hardware shots), allowing the obsidian solar panels and luxury villa rooflines to command focus.
- **Engineered Typography**: Deep, authoritative Carbon Dark (`#171A20`) and Graphite (`#393C41`) headings with clean, geometric letter-spacing.
- **Minimalist Pill Buttons**: Confident, tactile pill buttons (`rounded-full`) in solid Carbon Dark and Cloud Gray.
- **No Decorative AI Fluff**: No busy glowing borders, no rainbow cards, no fake gradients, no clutter.

---

## 2. Color Palette & Token System

### 2.1 Core Palette

| Token Name | Hex Code | OKLCH / CSS Value | Primary Purpose |
| :--- | :--- | :--- | :--- |
| **Pure White** | `#FFFFFF` | `oklch(1 0 0)` | Primary page canvas, light section backdrops, modal backgrounds |
| **Studio Light Gray** | `#F8F8FA` | `oklch(0.98 0.003 260)` | Alternating section backdrops, card containers, calculator pads |
| **Cloud Gray** | `#EEEEEE` | `oklch(0.94 0 0)` | Secondary pill buttons, divider lines, active border tabs |
| **Pale Silver** | `#E2E8F0` | `oklch(0.92 0.005 260)` | Subtle structural borders, slider tracks, input field borders |
| **Carbon Dark** | `#171A20` | `oklch(0.18 0.005 260)` | Primary headlines, display text, primary solid pill CTA buttons |
| **Graphite** | `#393C41` | `oklch(0.32 0.005 260)` | Sub-headings, body narrative, secondary text |
| **Pewter / Slate** | `#5C5E62` | `oklch(0.45 0.005 260)` | Technical spec labels, footnotes, disclaimers, input placeholders |
| **Sunburst Amber** | `#F57C00` | `oklch(0.72 0.18 55)` | Active solar energy telemetry, battery charging indicator, live power pulses |
| **Electric Accent** | `#3E6AE1` | `oklch(0.55 0.20 260)` | Interactive links, active slider handles, map pin highlights |
| **Obsidian Photo Void** | `#000000` | `oklch(0 0 0)` | Hero photographic viewport backdrop, full-bleed media overlays |

---

## 3. The 3-Layer Tesla Solar Architecture

### LAYER 1: The Main Solar Panels Showcase (`/` or `/solarpanels`)
1. **Header (`Header.tsx`)**:
   - Floating blur navigation bar.
   - Left: Monolithic `WAVENOX` brand logo.
   - Center: `Solar Roof` | `Solar Panels` | `Omnigrid` | `Commercial`.
   - Right: Sleek `Schedule Consultation` pill & `Menu` icon.
2. **Hero Section (`Hero.tsx`)**:
   - Full-bleed 100vh cinematic villa render (`luxury_solar_villa.jpg`).
   - Clean centered title: `Solar for Existing Roofs` / `Solar Panels`.
   - Subtitle: `Lowest Cost in India — Guaranteed` with arrow link `Schedule a Virtual Consultation →`.
   - Bottom floating dock:
     - 3 clean specs: `Guaranteed` / `Lowest Price in India`, `25-Year` / `Complete System Warranty`, `24/7` / `Outage Protection`.
     - Dual Tesla-style pill CTAs: Solid Carbon Dark `Order Now` pill + Translucent dark glass `Schedule Consultation` pill.
3. **Clean Energy & Architectural Integration (`SleekDesign.tsx`)**:
   - Clean White background (`#FFFFFF`).
   - Macro photography of flush-mounted all-black solar cells (`liquid_glass_macro.jpg`).
   - Narrative on concealed mounting hardware, zero visible conduits, and monolithic all-black styling.
   - Key Spec Badges: `Concealed Mounting Hardware` • `Zero Visible Conduits` • `Monolithic All-Black Aesthetic`.
4. **24/7 Outage Protection Section (`OutageProtection.tsx`)**:
   - Omnigrid battery storage integration for uninterrupted power during Indian grid blackouts.
   - Studio Gray background (`#F8F8FA`).
   - Interactive status simulator: Toggle between `Day (Solar Charging)`, `Night (Battery Power)`, and `Grid Outage (Instant Backup)` with live SVG power flow pulses.
5. **Pay Less for Electricity Section (`BillSavingsSlider.tsx`)**:
   - Pure White background (`#FFFFFF`).
   - Interactive monthly electricity bill slider (₹3,000 to ₹75,000+ per month).
   - Indian state DISCOM selector (TSSPDCL, BESCOM, MSEDCL, TANGEDCO, BSES).
   - Live reactive calculations: Recommended System Size (kW), Annual Savings (₹), 25-Year Net Wealth Generated (₹), and Upfront PM Surya Ghar Subsidy Credit (up to ₹78,000).
6. **Efficiency & All-Weather Reliability (`EfficiencyTech.tsx`)**:
   - Studio Gray background (`#F8F8FA`).
   - High-yield N-type TOPCon dual-glass cells, cascading cell architecture, shade resilience, and extreme temperature tolerance (up to 50°C Indian summer ambient).
7. **Monitor and Optimize Section (`EnergyControl.tsx`)**:
   - Pure White background (`#FFFFFF`).
   - Minimalist phone frame with live animated energy flow telemetry (Solar ➔ Battery ➔ Home ➔ Grid), live generation graphs, and self-powered percentage.
8. **Built to Last: Technical Specs Drawer (`TechSpecs.tsx`)**:
   - Expandable slide-out or clean 2-column minimalist engineering specs table matching Tesla's spec drawer.
   - Wattage (550W–600W TOPCon), Inverter (98.6% European Efficiency), Dimensions, Wind Rating (250 km/h), Class 4 Hail rating, BIS/IEC certifications, 25-Year Warranty.
9. **Order to Power On Section (`OrderProcess.tsx`)**:
   - 5-step clean timeline:
     1. *Virtual 3D Design & Quote*
     2. *DISCOM Net-Metering Feasibility*
     3. *Single-Day Certified Installation*
     4. *CEIG / DISCOM Inspection & Bi-directional Meter*
     5. *Power On & PM Surya Ghar Subsidy Credit*
10. **Schedule a Virtual Consultation Modal (`ConsultationModal.tsx`)**:
    - Tesla Energy Advisor booking drawer for 1-on-1 virtual design reviews.
11. **Comprehensive FAQ & Support Accordion (`SupportFaq.tsx`)**:
    - Clean accordion answering key Indian rooftop solar questions (DISCOM net-metering approvals, roof waterproofing, subsidy disbursal timeline, warranty claims).
12. **Minimalist 1-Line Showroom Footer (`Footer.tsx`)**:
    - Understated 1-line footer: `WAVENOX © 2026 | Privacy & Legal | Consumer Disclosures | PM Surya Ghar Guidelines | Locations | Contact`.

---

### LAYER 2: The Interactive System Design Studio (`/deploy` or `/energy/design`)
- **Step 1: Property Location & Monthly Power Bill**:
  - Enter City/PIN code (e.g. Hyderabad 500033) and select average monthly electricity bill (₹5,000 to ₹75,000+).
- **Step 2: Recommended System Sizing**:
  - *Small (4.8 kW)*: 12 Panels (covers ₹4,000–₹6,000 bills)
  - *Medium (9.6 kW)*: 24 Panels (covers ₹8,000–₹12,000 bills)
  - *Large (14.4 kW)*: 36 Panels (covers ₹14,000–₹18,000 bills)
  - *Extra Large (19.2 kW+)*: 48 Panels (covers ₹20,000+ bills)
- **Step 3: Battery Storage (Omnigrid)**:
  - Select 0, 1, 2, or 3 Omnigrid units with Whole Home vs Essential Load Backup toggle.
- **Step 4: Roof Type Selection**:
  - RCC Flat Slab Terrace (standard Indian homes), Sloped Mangalore Tile, Industrial Metal Sheet.
- **Step 5: Financial Breakdown & PM Surya Ghar Subsidy**:
  - Gross System Cost, Direct Government Subsidy Credit (up to ₹78,000), Net Payable Cost, Estimated Annual Savings, and Cash vs 5-Year Green Energy Loan EMI options.
- **Step 6: One-Click WhatsApp Reservation**:
  - Dispatches pre-filled inquiry dossier directly to the solar business owner.

---

### LAYER 3: Dedicated Ecosystem Subpages
- **Solar for Homes (`/residential`)**: Deep dive into luxury residential architectural solar.
- **Commercial & Megawatt Industrial (`/enterprise`)**: Commercial solar, factory rooftops, Section 32 40% Year-1 tax depreciation calculator with [`enterprise_mw_rooftop.jpg`](file:///Users/bunny/.gemini/antigravity/scratch/wavenox/src/assets/enterprise_mw_rooftop.jpg).
- **Omnigrid Storage (`/omnigrid`)**: Whole-home battery storage, sub-millisecond islanding during Indian summer blackouts.

---

## 4. Typography Hierarchy (Universal Sans Style)

| Style Level | Desktop Size / Leading | Mobile Size / Leading | Weight / Tracking | Color Token |
| :--- | :--- | :--- | :--- | :--- |
| **Eyebrow / Category** | `13px` / `16px` | `12px` / `14px` | SemiBold / `tracking-widest uppercase` | `#5C5E62` (Pewter) |
| **Hero Title** | `56px` / `1.05` | `32px` / `1.15` | Medium-Bold / `tracking-tight` | `#FFFFFF` on Photo / `#171A20` on Light |
| **Section Title** | `40px` / `1.1` | `28px` / `1.2` | SemiBold / `tracking-tight` | `#171A20` (Carbon Dark) |
| **Subtitle Link** | `16px` / `24px` | `14px` / `20px` | Regular / `underline underline-offset-4` | `#393C41` (Graphite) / `#3E6AE1` (Accent) |
| **Body Copy** | `15px` / `24px` | `14px` / `22px` | Regular / `leading-relaxed` | `#393C41` (Graphite) |
| **Spec Value** | `28px` / `32px` | `22px` / `26px` | SemiBold / `tabular-nums` | `#171A20` (Carbon Dark) |
| **Spec Label** | `12px` / `16px` | `11px` / `14px` | Regular / `leading-normal` | `#5C5E62` (Pewter) |

---

## 5. Tesla-Style Pill Button Specifications

- **Primary Pill (Solid Carbon Dark)**:
  - Class: `px-8 py-2.5 rounded-full bg-[#171A20] text-white text-sm font-medium hover:bg-black transition-colors shadow-sm text-center`
- **Secondary Pill (Cloud Gray)**:
  - Class: `px-8 py-2.5 rounded-full bg-[#EEEEEE] text-[#171A20] text-sm font-medium hover:bg-[#E5E7EB] transition-colors text-center`
- **Frosted Glass Pill (Over Dark Photos)**:
  - Class: `px-8 py-2.5 rounded-full bg-black/60 backdrop-blur-md text-white text-sm font-medium border border-white/20 hover:bg-black/80 transition-colors text-center`
- **Mobile Behavior**: Fluid width (`w-full sm:w-auto`) for thumb-friendly accessibility.
