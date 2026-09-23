# WAVENOX — Engineering & Design Rules (`Rules.md`)

---

## 1. The Tesla Solar Clean-Tech Standard (The Non-Negotiable Soul)

WAVENOX is modeled **100% after the design DNA, architectural restraint, typography, color palette, and section flow of the live Tesla Solar website (`https://www.tesla.com/solarpanels` & `https://www.tesla.com/energy/design`)**, adapted exclusively for **India** (rupees, DISCOM net-metering, and PM Surya Ghar Muft Bijli Yojana subsidies).

### Commandment 1: The Tesla Color Palette (Showroom Cleanliness)
- **Primary Background**: **Pure White (`#FFFFFF`) & Soft Studio Light Gray (`#F8F8FA` / `#F4F4F6`)** across all content sections, calculators, engineering specs, drawers, and configurators.
- **Cinematic Contrast**: Dark backgrounds are reserved exclusively for full-bleed photography viewports (like the Hero and hardware macro shots) where the dark sky and roof contrast naturally with crisp white text.
- **Typography**: Deep, engineered neutrals:
  - **Carbon Dark (`#171A20`)**: Display titles, H1/H2 headings, key data points.
  - **Graphite (`#393C41`)**: Body copy, descriptions, subtitles.
  - **Pewter / Slate (`#5C5E62`)**: Spec labels, footnotes, disclaimers.
- **Buttons & Pills**:
  - Primary CTA: **Solid Carbon Dark (`#171A20`) with Pure White text**.
  - Secondary CTA: **Cloud Gray (`#EEEEEE` / `#E5E7EB`) with Carbon Dark text**, or Frosted Glass (`rgba(255,255,255,0.85)` with dark text).
  - Hover states: Smooth 0.2s transitions with subtle micro-scale or tone shift.
- **Accent**: Precise Sunburst Amber / Electric Accent (`#F57C00` / `#3E6AE1`) reserved for active battery flow lines, live telemetry, and selected states.

### Commandment 2: Tesla-Grade Minimalism & Radical Subtraction
- **Rule**: Ruthlessly eliminate clutter. No cheap AI-style floating cards, no busy rainbow glow borders, no cluttered multi-colored badges.
- **Soul**: Everything is edge-to-edge, disciplined, confident, monolithic, and uncluttered. Content breathes with generous whitespace (`py-24` to `py-36` or full `100vh` viewports).

### Commandment 3: The Full-Bleed 100vh Hero with Bottom Dock
- **Rule**: The homepage hero is a full-bleed `100vh` cinematic viewport.
- **Top**: Clean centered title (`Solar for Existing Roofs` / `Solar Panels`), subtitle link (`Schedule a Virtual Consultation →`).
- **Bottom**: Bottom-docked floating specification bar featuring:
  - 3 clean specs (e.g. `Guaranteed Lowest Price in India`, `25-Year Complete Warranty`, `24/7 Outage Protection`).
  - Dual Tesla-style pill CTAs:
    - Primary: Solid Carbon Dark pill button with white text (`Order Now`).
    - Secondary: Translucent dark glass pill button with white text (`Schedule Consultation`).

### Commandment 4: The Minimalist 1-Line Showroom Footer
- **Rule**: Strictly FORBIDDEN to use a bloated 4-column footer with dozens of links.
- **Tesla Standard**: A single clean line of understated text and links at the very bottom:
  `WAVENOX © 2026 | Privacy & Legal | Consumer Disclosures | PM Surya Ghar Guidelines | Locations | Contact`

### Commandment 5: True Fluid Mobile Responsiveness
- **Rule**: Every typography scale and interactive element must be fluid.
- **H1 Scaling**: Never render oversized text on mobile viewports. Use responsive sizing (e.g., `text-3xl sm:text-4xl md:text-5xl lg:text-6xl`).
- **Button Sizing**: CTA buttons must be ergonomic on mobile (`w-full sm:w-auto px-6 py-3`). Touch targets must never be smaller than 44px.

### Commandment 6: Mobile Navigation Drawer
- **Rule**: Desktop navigation links must collapse into an elegant, full-viewport light/dark glass drawer with a clean close trigger (`✕`), mirroring Tesla's mobile menu.

### Commandment 7: Indian Localization Exclusivity
- **Rule**: Every calculation, regulatory claim, and financial figure must be strictly tailored for the Indian market:
  - Currency: Indian Rupees (`₹`, Lakhs, Crores).
  - Tariffs: State DISCOMs (Telangana TSSPDCL, Karnataka BESCOM, Maharashtra MSEDCL, Tamil Nadu TANGEDCO, Delhi BSES).
  - Subsidies: PM Surya Ghar Muft Bijli Yojana (up to ₹78,000 direct credit).
  - Roof Types: RCC Flat Slab Terrace (standard Indian homes), Sloped Mangalore Tile, Industrial Metal Sheet.
  - Hubs: Tier-1 Indian hubs (Hyderabad HQ, Bengaluru, Mumbai, Vijayawada, Delhi-NCR).

### Commandment 8: Tone of Voice & Copywriting
- **Rule**: WAVENOX speaks with authoritative, institutional prestige.
- **Forbidden Vocabulary**: Never use cheap clean-tech cliches like *"Go Green"*, *"Eco-friendly saving"*, *"Budget solar"*, *"Cheap panels"*.
- **Mandatory Vocabulary**: Use words like *"Solar for Existing Roofs"*, *"Concealed mounting hardware"*, *"24/7 Outage protection"*, *"Pay less for electricity"*, *"Built to last"*, *"Order to power on"*, *"Energy independence"*.

---

## 2. Reusability & "Sale-Ready" Engineering Standards

### Commandment 9: Zero Hardcoded Business Details
- **Rule**: NEVER hardcode the brand name, contact phone, WhatsApp number, email, domain, or physical address inside UI components or routes.
- **Implementation**: Always import from `src/config/brand.ts` or `src/config/business.ts`:
  ```tsx
  import { BRAND_CONFIG } from "@/config/brand";
  import { BUSINESS } from "@/config/business";
  ```
- **Reason**: When the website is sold to a real-world solar business owner, changing `brand.ts` or `.env` must instantly rebrand the entire website without touching component code.

### Commandment 10: Solar Constants Decoupling
- **Rule**: Mathematical and financial assumptions (tariffs, kWh yields, watts/sq.ft, subsidy formulas) must NEVER be hardcoded inside calculator components.
- **Implementation**: Always import from `src/config/solar.ts`:
  ```tsx
  import { SOLAR_CONFIG, computeSolarYield } from "@/config/solar";
  ```

### Commandment 11: High-Aesthetic Placeholder Imagery Contract
- **Rule**: All images are cinema-grade placeholders stored in `src/assets/`. Keep filenames descriptive and clean (`luxury_solar_villa.jpg`, `liquid_glass_macro.jpg`, `enterprise_mw_rooftop.jpg`). When the buyer replaces them with real client photos, layouts must remain rock-solid.

---

## 3. TypeScript & Code Standards

1. **Zero `any`**: Do not use `any`. Always create strict types or interfaces for component props, slide models, data matrices, and API responses.
2. **Error Boundary Protection**: Every calculator and dynamic component must safely handle edge cases (undefined inputs, NaN, negative numbers) so pages NEVER throw error boundaries.
3. **Semantic HTML**: Use `<main>`, `<section>`, `<article>`, `<header>`, `<footer>`, `<nav>`.
4. **Framer Motion Performance**: Animate only GPU-accelerated properties (`opacity`, `transform`).
