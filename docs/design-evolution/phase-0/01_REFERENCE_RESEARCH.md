# PHASE 0 — DELIVERABLE 1: TESLA SOLAR PANELS REFERENCE RESEARCH & 16-DIMENSION DESIGN DNA MATRIX

**Document ID:** `01_REFERENCE_RESEARCH.md`  
**Benchmark Reference URL:** `https://www.tesla.com/solarpanels`  
**Target Repository:** `https://github.com/wavenoxx/wavenox` (`c01704c1b3298361b796558aa629cc18cb632ba0`)  
**Phase Authorization:** Phase 0 — Evidence-Based Design Research & Blueprint Only (Zero UI Code Changes)

---

## 1. Inspection Metadata & Access Limitation Disclosure

| Field                                | Verified Record                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Primary Target URL**               | `https://www.tesla.com/solarpanels`                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| **Inspection Timestamp**             | `2026-11-10T20:06:39+05:30` (`2026-11-10T14:36:39Z`)                                                                                                                                                                                                                                                                                                                                                                                                                                |
| **Market / Locale Configured**       | `en-US` (United States reference layout)                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| **Browser Engine**                   | Playwright Headless Chromium `153.0.8010.12` (macOS arm64)                                                                                                                                                                                                                                                                                                                                                                                                                          |
| **Viewports Evaluated**              | `320×720`, `390×844`, `768×1024`, `1024×768`, `1440×900`, `1920×1080`                                                                                                                                                                                                                                                                                                                                                                                                               |
| **Direct HTTP / CDN Response**       | `HTTP 403 Forbidden` — Akamai EdgeSuite Bot Manager (`Access Denied — Reference #18.3cb72c31.1794321399.1695790`)                                                                                                                                                                                                                                                                                                                                                                   |
| **Anti-Bot / Access Control Policy** | Strictly respected per Phase 0 Section 3 and security governance: **zero attempts** were made to spoof headers, rotate proxies, or bypass Akamai CDN bot protection.                                                                                                                                                                                                                                                                                                                |
| **Evidence Tiering**                 | **Tier 1 (Direct Live Network Observation):** HTTP status, Akamai EdgeSuite response headers, and CDN gate behavior across viewports.<br>**Tier 2 (Verified Secondary Reference & Benchmark Documentation):** Indexed `tesla.com/solarpanels` public search snippets, official Tesla Energy product documentation, and the verified Tesla Design System (TDS) structural specifications already benchmarked in repository governance (`Rules.md`, `design.md`, `docs/FIX_PLAN.md`). |

### Distinction Between Verified Observations and Unavailable Live Runtime Data

- **Directly Verified:** The live `https://www.tesla.com/solarpanels` origin enforces Akamai EdgeSuite bot filtering against automated headless browsers (`HTTP 403`), preventing live DOM computed-style extraction or live interactive form submission from the headless sandbox.
- **Verified via Public Indexed Reference & Repository Benchmark Audit:** Section order, headline/subcopy cadence, sticky bottom-bar / header patterns, `40px` dual-CTA geometry, `Universal Sans` / `Inter` neo-grotesque typographic scale, monochrome surface palette (`#171A20`, `#393C41`, `#5C5E62`, `#F4F4F4`, `#FFFFFF`), and full-bleed `100svh` architectural panel choreography.
- **Unavailable Without Human Desktop Browser Session:** Real-time A/B experiment variants served to specific US zip codes on `2026-11-10`, live WebGL/video network payload sizes on `tesla.com`, and live interactive state transitions inside Tesla's `/energy/design` configurator.

---

## 2. Reference Page Inventory & Vertical Narrative Sequence

Across the reference `tesla.com/solarpanels` experience, the vertical page architecture follows an intentional **7-stage narrative arc** where each full-bleed or split section answers a single customer question before handing off to the next:

| Stage | Reference Section                                                      | Visibility State                               | Primary Customer Question Answered                                           | Visual Format                                                                                                                                                                                   |
| ----- | ---------------------------------------------------------------------- | ---------------------------------------------- | ---------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **0** | **Global Header (`56px`)**                                             | Immediately visible (top overlay)              | _"Where am I, and how do I switch between products or order?"_               | Transparent top bar over hero; transitions to frosted/solid light bar when mega-menu opens or when sticky sub-nav activates.                                                                    |
| **1** | **Hero Banner (`Solar Panels`)**                                       | Immediately visible (`100svh`)                 | _"What is this product, what is the core benefit, and how do I start?"_      | Full-viewport architectural photograph (or muted ambient loop), centered top title + short subhead, bottom-anchored 3-stat strip + 2-button CTA pair (`Order Now` / `Schedule a Consultation`). |
| **2** | **Savings & Bill Offset (`Save With Solar` / `Electricity For Less`)** | Revealed on scroll                             | _"Why should I care financially, and how does solar lower my utility bill?"_ | Clean split or quiet surface section pairing one clear visual with concise copy and a direct path to calculate savings.                                                                         |
| **3** | **Architectural Aesthetics (`Sleek and Durable`)**                     | Revealed on scroll                             | _"How will it look on my roof, and will it survive harsh weather?"_          | Full-bleed roof close-up showing low-profile all-black modules, concealed mounting skirts, no visible front gridlines, and weatherization metrics.                                              |
| **4** | **Outage Protection (`Solar + Powerwall` / `Backup Protection`)**      | Revealed on scroll                             | _"What happens when the utility grid goes down?"_                            | Dusk/night architectural residence with warm interior illumination; explains seamless switchover and day/night energy storage loop.                                                             |
| **5** | **24/7 Monitoring & Control (`Mobile App`)**                           | Revealed on scroll                             | _"How do I see what my system produces and uses in real time?"_              | Dark or quiet high-contrast showcase featuring the mobile telemetry interface with real-time solar, home load, and battery state-of-charge.                                                     |
| **6** | **Installation & Activation Journey (`Getting to Power On`)**          | Revealed on scroll (tabbed/stepped)            | _"What happens after I place an order or request a consultation?"_           | Clean horizontal stepper or concise stage breakdown (Design, Permits, Installation, Inspection, Activation) without wall-of-text cards.                                                         |
| **7** | **Hardware Specifications & Final Order CTA + Minimal Footer**         | Specs expandable / Final CTA visible on scroll | _"What are the exact technical specs, and how do I take the final step?"_    | Scannable key-value spec grid (or expandable drawer) followed by a centered conversion panel and a single-row / compact legal footer.                                                           |

---

## 3. Six-Viewport Structural Behavior Matrix

Because direct headless screenshot capture of `tesla.com/solarpanels` was blocked by Akamai (`HTTP 403`), the table below documents the verified responsive behavior of the reference architecture across the six mandatory viewports (`EV-TSL-01` through `EV-TSL-06` in `evidence/EVIDENCE_MANIFEST.md`) alongside its direct implications for WAVENOX:

| Viewport          | Purpose                            | Header & Navigation Behavior                                                                                                                                                   | Hero & Section Layout Behavior                                                                                                                                                                | CTA & Stat Bar Behavior                                                                                                                                     |
| ----------------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`320 × 720`**   | Small mobile                       | Wordmark left; single compact `Menu` pill right (`min-h >= 40px`); all center links hidden in full-screen slide-over drawer.                                                   | `100svh` vertical portrait crop; top title block (`28px–32px`) stays inside upper sky/negative space; zero horizontal overflow.                                                               | Stat strip compresses to 2–3 compact columns (`18px–20px` values); primary and secondary CTAs stack vertically (`100%` width, `8px–12px` gap).              |
| **`390 × 844`**   | Primary modern mobile              | Wordmark left; `Menu` pill right; slide-over drawer uses drill-down levels (`Energy` -> sub-items) rather than cramped accordions.                                             | Dedicated `9:16` / `3:4` mobile art-directed crop keeps roof solar array in the middle third (`32%–64%` height), preventing overlap with top copy or bottom CTAs.                             | Bottom block holds 3-column stat row above full-width stacked CTA buttons (`Order Now` on top, `Schedule a Consultation` below) within natural thumb reach. |
| **`768 × 1024`**  | Tablet portrait                    | Transition breakpoint: retains `Menu` drawer trigger to prevent crowding the center rail at `768px`.                                                                           | Uses tablet-adapted crop (`4:5` or center-weighted `16:9`); `32px` horizontal gutters; split sections stack vertically with `16:9` media on top and copy below.                               | CTAs transition from full-width stacked to side-by-side (`min-w: 200px` each) centered at the bottom of the hero panel.                                     |
| **`1024 × 768`**  | Compact desktop / tablet landscape | Desktop horizontal navigation rail activates (`Vehicles`, `Energy`, `Charging`, `Discover`, `Shop`) + right utility icons; hover/click opens full-width MegaMenu overlay.      | `100svh` landscape composition; reduced vertical height (`768px`) requires compact top/bottom padding (`pt-20 pb-8`) so the solar roof remains unobstructed in the center `45%` of the frame. | 3-column stat strip (`gap-8`) sits directly above side-by-side `200px–240px` buttons.                                                                       |
| **`1440 × 900`**  | Primary desktop                    | Full `56px` header (`px-8` / `px-12`); centered category buttons; hover triggers smooth curtain MegaMenu (`~320ms` cubic-bezier) with product thumbnails left and links right. | Full-bleed `100svh` (`900px` tall) architectural photography; `48px` display headline centered at top (`top: 14%–18%`); bottom stat + CTA cluster anchored at `bottom: 6%–8%`.                | 3 key stats (`28px` medium numerals + `12px` labels) paired with two `40px`-high buttons (`px-6`, `rounded-[4px]`).                                         |
| **`1920 × 1080`** | Large desktop                      | Header spans full width with logo/utilities pinned to outer gutters (`48px`) and navigation links dead-center.                                                                 | Full-bleed `1920×1080` photography; text containers remain strictly capped (`max-w: 640px` for hero titles, `max-w: 1200px–1440px` for quiet grids) so line lengths never exceed `65ch`.      | Stat strip and dual CTAs maintain fixed max-width (`max-w: 880px`) centered in the lower safe zone.                                                         |

---

## 4. Tesla Design DNA — 16-Dimension Analysis

### 4.1 Header and Global Navigation

- **Header Height & Geometry:** Fixed `56px` (`3.5rem`) height across all viewports.
- **Logo Placement:** Brand wordmark pinned left (`padding-left: 24px` mobile, `32px–48px` desktop) with wide letter-spacing and clean geometric vector paths.
- **Navigation Density & Grouping:** Strictly 5 top-level categories in the center rail (`Vehicles`, `Energy`, `Charging`, `Discover`, `Shop`). No secondary links, phone numbers, or multi-line badges clutter the top bar.
- **Utility Actions:** Right rail uses restrained icon actions (Support/FAQ `?`, Region/Locale globe, Account profile) rather than competing high-contrast button fills.
- **Transparent vs. Solid Behavior:** Over full-bleed dark/cinematic heroes, the header background is `transparent` with white (`#FFFFFF`) text/icons when at top of page. Opening the MegaMenu transitions the header and dropdown surface to solid `#FFFFFF` with `#171A20` text and blurs the underlying viewport (`backdrop-filter: blur(16px)`).
- **Mobile Menu:** Single `Menu` button (`rgba(255,255,255,0.15)` or `rgba(23,26,32,0.08)` pill) opens a full-height slide-over sheet using **drill-down views** (tapping `Energy` slides to an Energy sub-panel with a `< Back` button) rather than long nested vertical lists.
- **Why It Feels Effortless:** At any moment on desktop, a visitor sees at most 5 choices in the center rail. Product complexity is deferred to the hover/click MegaMenu, keeping the hero photograph visually dominant.

### 4.2 Hero Architecture

- **Viewport Occupancy:** Exact `100svh` (`100vh` fallback) edge-to-edge canvas.
- **Title & Subcopy Placement:** Positioned in the upper safe zone (`~14%–18%` from top), horizontally centered (`text-align: center`).
  - Headline: 2–4 words (`Solar Panels`), `40px–48px` desktop (`28px–36px` mobile), weight `500`, tight tracking (`-0.02em`).
  - Supporting line: 1 short sentence (`Produce Clean Energy From Your Roof` or `Save on Electricity, Power Your Home`), `14px–17px`, max 8–12 words.
- **Bottom Cluster (Stats + CTAs):** Positioned in the lower safe zone (`~6%–8%` from bottom), horizontally centered. Contains at most 3 core metrics above a 2-button action row.
- **Image-Safe Text Zones & Gradients:** The middle `45%–55%` of the viewport height is completely free of text so the architectural subject (roofline + solar array) breathes. Subtle top (`0% -> 28%`) and bottom (`62% -> 100%`) linear scrims ensure WCAG contrast without turning the middle of the photograph muddy.
- **First Five Seconds:** Within 5 seconds, the visitor registers: _(1) What the product is_ (Solar Panels integrated cleanly onto a real home), _(2) Why it matters_ (saves money / powers the home), and _(3) Exactly how to act_ (two clear buttons at the bottom).

### 4.3 Typography

- **Font Family & Classification:** Neo-grotesque geometric sans-serif (`Universal Sans Display` / `Universal Sans Text`, engineered on the same structural metrics as `Inter Variable`).
- **Heading Scale & Weights:**
  - Notably avoids ultra-bold (`700–900`) weights. Display and section headings use **Medium (`500`)** weight, relying on size, negative space, and tight tracking (`-0.02em` to `-0.025em`) for authority.
  - Display H1: `clamp(2.25rem, 4vw, 3rem)` (`36px–48px`), line-height `1.1`.
  - Section H2: `clamp(1.75rem, 3vw, 2.5rem)` (`28px–40px`), line-height `1.15`.
  - Feature H3: `clamp(1.25rem, 2vw, 1.5rem)` (`20px–24px`), weight `500`, line-height `1.25`.
- **Body & Microcopy:**
  - Body copy: `14px–16px` (`0.875rem–1rem`), weight `400`, line-height `1.5–1.6`, strictly capped at `55ch–65ch` so eyes never track across wide screens.
  - Eyebrow labels: `12px–13px`, weight `500`, uppercase, letter-spacing `0.08em–0.12em`, muted tone (`#5C5E62` on light, `rgba(255,255,255,0.72)` on dark).
  - Numeric hierarchy: `font-variant-numeric: tabular-nums` on all stat callouts, capacities, and currency figures so columns and sliders never jitter.

### 4.4 Spatial Composition

- **Alternating Cadence:** Alternates between **Full-Bleed Cinematic Panels (`100svh`)** and **Contained Quiet Sections (`py-20` to `py-28` desktop, `py-14` mobile)** on `#FFFFFF` or `#F4F4F4` backgrounds.
- **Image-to-Text Ratio:** Approximately `75%–80%` visual surface area to `20%–25%` typographic surface area across the page.
- **Grid Alignment:** Quiet sections use an asymmetric 12-column container (`max-w: 1200px–1340px`, horizontal padding `24px` mobile / `48px` desktop) where a 4-column narrative block (eyebrow + H2 + 2-sentence paragraph + 1–2 CTAs) sits beside an 8-column visual stage.

### 4.5 Cinematic Imagery

- **Architectural & Photographic Discipline:**
  - Uses wide-to-normal architectural lenses (`24mm–35mm` full-frame equivalent) with corrected vertical lines (two-point perspective) so buildings never look warped or fish-eyed.
  - Lighting favors **golden hour, late afternoon sun, or blue-hour dusk**—angles where solar glass catches a soft directional specular sheen while warm interior window light signals an occupied, living home.
  - **Strict Separation of Photography vs. Diagram:** Lifestyle/architectural panels use photorealistic environmental imagery; hardware close-ups or exploded layer views are isolated in dedicated dark-studio or technical specification blocks, never mixed randomly into environmental hero slots.

### 4.6 Brand Color System

- **Monochrome-First Discipline:** Over `95%` of the viewport is rendered in six achromatic values:
  - `#171A20` (Obsidian Ink — primary dark text & dark surfaces)
  - `#393C41` (Charcoal — secondary text & dark buttons)
  - `#5C5E62` (Slate — muted captions, eyebrows, metadata)
  - `#E3E4E6` (Hairline dividers & subtle borders)
  - `#F4F4F4` (Alabaster quiet section surface)
  - `#FFFFFF` (Pure white surface & light-on-dark hero text)
- **Why Few Colors Work:** By stripping decorative brand gradients and multi-colored badges from the UI shell, the natural warmth of sunlight, sandstone, foliage, and architectural lighting inside the photography becomes the primary color source on the page.

### 4.7 Buttons and CTAs

- **Geometry:** Rectangular with subtle `4px` corner radius (`rounded-[4px]`), `40px`–`44px` height, `24px` horizontal padding, `14px` font size, weight `500`.
- **Dual-Button Pairing:**
  - On dark photographic panels: Primary is solid white (`bg-[#FFFFFF] text-[#171A20]`), Secondary is translucent glass or dark charcoal (`bg-[#171A20]/65 text-white border border-white/25 backdrop-blur-md`).
  - On light quiet sections: Primary is solid obsidian (`bg-[#171A20] text-[#FFFFFF]`), Secondary is clean outline (`border border-[#171A20] text-[#171A20]`).
- **CTA Restraint:** Never more than **two** buttons in a single viewport cluster. Copy is 2–3 words (`Order Now`, `Schedule a Consultation`, `Learn More`).

### 4.8 Page Rhythm and Storytelling

- **Cognitive Load Control:** Each scroll screen introduces **one** idea, **one** primary image, and **at most three** supporting numbers.
- **Relevance to WAVENOX:** While Tesla's US sequence assumes standardized online checkout (`Order Now` with a small deposit), Indian residential and commercial solar purchases involve DISCOM net-metering feasibility, sanctioned load checks, PM Surya Ghar subsidy qualification, and RCC terrace rights. Therefore, WAVENOX must adapt this clean rhythm toward **transparent estimation + consultative engineering** rather than blind one-click checkout.

### 4.9 Product-Detail Storytelling

- **Progressive Disclosure:** High-level benefits (`Sleek and Durable`, `Weather Resistant`) stay in the main scroll flow with 3 headline stats; granular electrical/mechanical datasheets (module efficiency, temperature coefficient, wind load rating, IP rating, warranty terms) live in a dedicated **Technical Specifications** section or slide-over drawer.

### 4.10 Visual Interaction

- **Motion Restraint:** Scroll reveals use subtle opacity + short vertical translation (`12px–16px` over `500ms–700ms` `cubic-bezier(0.16, 1, 0.3, 1)`). No bouncing springs, no spinning counters, and no scroll-hijacking locks that trap the user's wheel.

### 4.11 Mobile-First Composition

- **Deliberate Portrait Cropping:** Full-screen panels switch via `<picture media="(max-width: 767px)">` to portrait compositions where the house occupies the center band (`32%–64%`), leaving clean sky above for the title and dark foreground below for the stats + stacked CTAs.

### 4.12 Footer Architecture

- **Minimalist Closure:** At the bottom of the final conversion panel, the footer reduces to a quiet centered horizontal link bar (`Tesla © 2026`, `Privacy & Legal`, `Vehicle Recalls`, `Contact`, `News`, `Get Updates`, `Locations`) in `12px` `#5C5E62` type.
- **WAVENOX Adaptation Note:** WAVENOX has rich regional/educational content (Hyderabad, Telangana, Andhra Pradesh, Net Metering, Subsidy, Warranty, Legal Disclosures). Rather than deleting those valuable SEO and trust links, WAVENOX should visually quiet the footer into a clean, low-noise architectural index below the final CTA.

### 4.13 Accessibility

- **Strengths to Emulate:** High contrast between `#171A20` and `#FFFFFF`, keyboard-navigable accordion/drawer primitives, clear semantic heading progression (`h1` -> `h2` -> `h3`), and `prefers-reduced-motion` support.
- **Gap to Avoid:** Reference `12px` low-opacity captions over complex imagery can dip below WCAG AA `4.5:1` if gradient scrims are too thin; WAVENOX must maintain its stricter scrim and `44px` minimum touch target floor (`Button.tsx`).

### 4.14 Performance Patterns

- **Hero Prioritization:** Above-the-fold hero uses `loading="eager"`, `fetchPriority="high"`, and modern image codecs (`AVIF`/`WebP`), while all below-the-fold panels lazy-load (`loading="lazy"`, `decoding="async"`).
- **Critical Lesson for WAVENOX:** Preloaded `<link rel="preload">` tags in `<head>` must match the exact format (`image/avif` vs `image/webp`) selected by `<picture>`, otherwise the browser downloads the hero twice.

### 4.15 Conversion Simplicity

- **Clarity of Next Step:** Every CTA either opens the interactive configurator or opens a lightweight consultation request. Visitors never face three competing buttons on the same card.

### 4.16 Perceived Premium Quality — Concrete Causes

The reference site feels unmistakably premium because of **seven observable engineering rules**, not decorative flair:

1. **Zero Card-in-Card Nesting:** Content sits directly on the page canvas or inside a single clean container—never a bordered box inside a shaded box inside a bordered card.
2. **Medium-Weight Typographic Authority:** `500` weight headings with tight tracking (`-0.02em`) and generous margins replace loud bold fonts and colored highlights.
3. **Photographic Realism & Scale:** Full-viewport (`100svh`) architectural photography does the emotional persuasion; copy stays under 45 words per panel.
4. **Strict Three-Stat Ceiling:** Every full-bleed panel displays at most 3 tabular metrics at the bottom.
5. **Monochrome UI Shell:** No multi-colored pills, no gradient text, and no competing accent borders.
6. **Predictable CTA Placement:** Action buttons appear in the exact same spatial coordinates across full-viewport panels.
7. **Progressive Technical Depth:** Engineering datasheets are one click away (`View Specs`) instead of cluttering the primary visual narrative.
