# WAVENOX — Engineering & Design Rules (`Rules.md`)

---

## 1. The Tesla-Inspired Clean-Tech Standard (Benchmark for Restraint)

WAVENOX draws inspiration from the design DNA, architectural restraint, typography, and section flow of the world's leading clean-tech interfaces, adapted rigorously for **India** (rupees, state DISCOM net-metering regulations, and PM Surya Ghar Muft Bijli Yojana subsidies).

Tesla serves as the benchmark for restraint, typography, and radical subtraction—not as an exact replica. WAVENOX speaks with its own engineering voice tailored to Indian conditions.

### Commandment 1: The Monochrome Palette with Single Amber Accent

- **Primary Background**: **Pure White (`#FFFFFF`) & Soft Studio Light Gray (`#F8F8FA` / `#F4F4F4`)** across content sections, calculators, engineering specs, drawers, and configurators.
- **Cinematic Contrast**: Dark backgrounds (`#171A20` / `#111215`) are reserved for full-bleed photography viewports (like the Hero and hardware macro panels) and high-contrast telemetry cards.
- **Typography Scale**: Deep, engineered neutrals:
  - **Carbon Dark (`#171A20`)**: Display titles, H1/H2 headings, primary metrics.
  - **Graphite (`#393C41`)**: Body copy, descriptions, subtitles (minimum 4.5:1 WCAG AA contrast).
  - **Pewter / Slate (`#5C5E62`)**: Spec labels, footnotes, disclaimers on light backgrounds.
  - **Light Slate (`#9CA3AF`)**: Spec labels and secondary text on dark backgrounds.
- **Buttons & Pills**:
  - Primary CTA: **Solid Carbon Dark (`#171A20`) with Pure White text**.
  - Secondary CTA: **Cloud Gray (`#EEEEEE` / `#E5E7EB`) with Carbon Dark text**, or translucent glass with crisp text.
  - Micro-radii: 4px button border radius.
- **Accent**: Sunburst Amber (`#F57C00` / `#B45309`) reserved strictly for active energy flow, sun azimuth paths, and verified regulatory badges.

### Commandment 2: Minimalism & Radical Subtraction

- **Rule**: Ruthlessly eliminate clutter. No cheap AI-style floating cards, no busy rainbow glow borders, no cluttered multi-colored badges.
- **Soul**: Everything is edge-to-edge, disciplined, confident, and uncluttered. Content breathes with generous whitespace (`py-16` to `py-24` or full `100svh` viewports).

### Commandment 3: The Full-Bleed 100svh Hero with Bottom Dock

- **Rule**: Homepage hero sections feature a full-bleed `100svh` cinematic viewport.
- **Top**: Clean centered title, single-line lead, and consultation link.
- **Bottom**: Bottom-docked floating specification bar featuring:
  - 3 clean sourced specs (e.g. `₹78,000 Surya Ghar Subsidy`, `25-Year Linear Warranty`, `24/7 Outage Protection`).
  - Dual pill CTAs:
    - Primary: Solid Carbon Dark pill button (`Design Yours` / `Get Estimate`).
    - Secondary: Translucent dark glass pill button (`Schedule Consultation`).

### Commandment 4: The 4-Column Architectural Footer

- **Rule**: The platform utilizes an organized, accessible 4-column footer providing structured navigation across:
  1. Residential Solutions (`/residential`, `/omnigrid`, `/deploy`)
  2. Commercial & Architecture (`/enterprise`, `/architects`, `/technology`)
  3. Regulatory & Grid Guidelines (`/net-metering`, `/warranty`, `/service-areas`, `/faq`, `/about-this-project`)
  4. Direct Advisory & WhatsApp Inquiries
- **Fine-Print Strip**: Displays clear portfolio concept credit line, copyright, and links to Privacy, Terms, Disclosures, Colophon, and FAQ with verified WCAG contrast.

### Commandment 5: True Fluid Mobile Responsiveness & 12px Text Floor

- **Rule**: Every typography scale and interactive element must be fluid across mobile and desktop.
- **Text Floor**: **Zero text below 12px** anywhere on the platform (enforced by automated Playwright assertions).
- **H1 Scaling**: Never render oversized text on mobile viewports. Use responsive sizing (e.g., `text-3xl sm:text-5xl md:text-6xl`).
- **Button Sizing**: CTA buttons must be ergonomic on mobile (`w-full sm:w-auto px-6 py-3`). Touch targets must never be smaller than 44px.

### Commandment 6: Accessible Navigation Menu

- **Rule**: Header navigation utilizes accessible Radix UI primitives with keyboard support (Enter/ArrowDown to open, Escape to close), clean focus rings, and a dedicated mobile slide drawer.

### Commandment 7: Indian Localization & Sourced Truth

- **Rule**: Every calculation, regulatory claim, and financial figure must be strictly tailored for the Indian market and verified against official sources:
  - Currency: Indian Rupees (`₹`, Lakhs, Crores) with `en-IN` number formatting.
  - Tariffs: Telangana Electricity Regulatory Commission (TGERC) FY 2025–26 LT-I(C) telescopic slabs.
  - Subsidies: PM Surya Ghar Muft Bijli Yojana (up to ₹78,000 central assistance).
  - Roof Types: RCC Flat Slab Terrace (standard Indian homes), Sloped Mangalore Tile, Industrial Metal Sheet.
  - Structure: IS 875 (Part 3): 2015 basic wind speed of 44 m/s (Zone II).
  - Solar Irradiance: NASA POWER / NREL PVWatts v8 multi-year insolation data for Hyderabad (1,490 kWh/kWp/yr).

### Commandment 8: Tone of Voice & Copy Integrity

- **Rule**: WAVENOX speaks with the calm, precise voice of an experienced Hyderabad solar architect. Short sentences, specific numbers, and verifiable facts.
- **Banned Vocabulary**: Enforced via `scripts/copy-lint.mjs`. Never use hyperbolic buzzwords:
  _Atelier_, _Monolithic_, _Sovereign_, _Bespoke_, _Institutional_, _Obsidian_, _Quantum_, _Dossier_, _Seamless_, _Apex_, _Kinetic_, _Nocturnal_, _Charter_, _Pillars_, _Command Center_, _Masterpiece_, _Ultra-luxury_, _Unparalleled_, _Elevate_, _Unleash_, _Absolute power_, _Zero compromise_, _Guaranteed Lowest Price_.
- **Approved Vocabulary**: Sourced, calm technical terms: _Architectural solar_, _Concealed mounting_, _Low-profile_, _N-type TOPCon_, _LiFePO4 storage_, _Net-metering feasibility_, _BEE star-rated_.

---

## 2. Decoupled Engineering Architecture

### Commandment 9: Zero Hardcoded Business Details

- **Rule**: NEVER hardcode brand names, contact phones, WhatsApp numbers, emails, domains, or physical addresses inside UI components or routes.
- **Implementation**: Always import from `src/config/brand.ts`:
  ```tsx
  import { BRAND_CONFIG } from "@/config/brand";
  ```

### Commandment 10: Sourced Constants Decoupling

- **Rule**: Mathematical and financial assumptions (tariffs, kWh yields, watts/sq.ft, subsidy formulas) must NEVER be hardcoded inside calculator components.
- **Implementation**: Always import from `src/config/solar.ts`, `src/config/regulatory.ts`, or `src/config/sources.ts`.

### Commandment 11: High-Aesthetic Sourced Imagery Contract

- **Rule**: All imagery must depict authentic Indian rooftop architecture (RCC flat slabs, urban villas, industrial sheds), correct solar hardware (tilt angle, walkways, setbacks), and consistent lighting. Renders are attributed honestly as architectural concept visuals.

---

## 3. TypeScript & Quality Assurance Standards

1. **Zero `any`**: Strictly enforce TypeScript types for all component props, calculation engines, and lead payloads.
2. **Automated E2E Audit**: Every route must return status 200, exactly one `<h1>`, exactly one `<main>`, logo visible at scrollY=0, zero sub-12px elements, and zero serious/critical axe accessibility violations.
3. **Vitest Unit Test Suite**: All calculations (subsidies, slab tariffs, EMI, 25-yr compounding wealth, battery runtime) must pass automated regression testing.
