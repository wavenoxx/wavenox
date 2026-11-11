# PHASE 0 — DELIVERABLE 2: WAVENOX INDEPENDENT CURRENT-STATE AUDIT

**Document ID:** `02_WAVENOX_CURRENT_STATE.md`  
**Verified Repository Commit:** `c01704c1b3298361b796558aa629cc18cb632ba0` (`Merge pull request #13 from wavenoxx/fix/wavenox-step8-final-release-gates`)  
**Audit Branch:** `docs/wavenox-phase0-design-blueprint`  
**Inspection Target:** Local Production Build (`.output/server/index.mjs` at `http://127.0.0.1:4399`) + Full Source Inspection

---

## 1. Repository & Environment Verification

| Verification Check                           | Observed Result                                                                                                                                                                 |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **GitHub Repository**                        | `https://github.com/wavenoxx/wavenox`                                                                                                                                           |
| **Verified `main` SHA**                      | `c01704c1b3298361b796558aa629cc18cb632ba0` (Step 8 source commit `3befc8a72e824f439021bf8f0bcb7f9d837df665`)                                                                    |
| **Canonical Domain (`src/config/brand.ts`)** | `https://wavenox.in`                                                                                                                                                            |
| **Live Public Domain Status**                | `https://wavenox.in` is not yet resolving publicly (`fetch failed` on `2026-11-10T20:06:39+05:30`).                                                                             |
| **Local Production Verification**            | Served from `.output/server/index.mjs` (`NITRO_PRESET=node-server`) and verified across all 6 viewports (`EV-WVX-01` through `EV-WVX-11`).                                      |
| **Automated Quality Baseline**               | `npm run lint` (`0` errors), `npx tsc --noEmit` (`0` errors), `npm test` (`115/115` unit tests passing), Playwright E2E + SEO/A11y/Performance release gates (`25/25` passing). |

---

## 2. Current Design Tokens & System Primitives (`src/styles.css` & `design.md`)

### 2.1 Color Tokens (`src/styles.css`)

| CSS Custom Property   | Value     | Current Role                                      | Audit Assessment                                              |
| --------------------- | --------- | ------------------------------------------------- | ------------------------------------------------------------- |
| `--bg-canvas`         | `#FFFFFF` | Primary light background                          | Clean, high-contrast canvas. **KEEP.**                        |
| `--bg-surface`        | `#F4F4F4` | Secondary quiet section surface                   | Crisp neutral separation without heavy borders. **KEEP.**     |
| `--bg-obsidian`       | `#171A20` | Dark showroom canvas & primary text               | Signature Tesla-grade deep slate-black. **KEEP.**             |
| `--text-primary`      | `#171A20` | Primary headings & body text on light             | `17.4:1` contrast on `#FFFFFF`. **KEEP.**                     |
| `--text-secondary`    | `#393C41` | Secondary body copy                               | `10.9:1` contrast on `#FFFFFF`. **KEEP.**                     |
| `--text-muted`        | `#5C5E62` | Captions, eyebrows, metadata                      | `6.4:1` on `#FFFFFF`, `5.7:1` on `#F4F4F4`. **KEEP.**         |
| `--border-subtle`     | `#E3E4E6` | Hairline card/section dividers                    | Clean `1px` structural divider. **KEEP.**                     |
| `--accent-solar`      | `#F57C00` | Decorative/icon solar amber                       | Used sparingly in telemetry mockup. **KEEP (non-text only).** |
| `--accent-solar-text` | `#B45309` | WCAG AA accessible amber text (`5.02:1` on white) | Used for active nav underlines and verified badges. **KEEP.** |
| `--accent-error`      | `#B42318` | Form validation error state                       | High-contrast accessible crimson. **KEEP.**                   |

### 2.2 Typography System (`src/styles.css`)

- **Font Family:** Self-hosted `Inter Variable` (`/fonts/inter-latin-wght-normal.woff2`, preloaded in `__root.tsx`).
- **Scale & Weights:**
  - `.text-display`: `clamp(2.25rem, 4.5vw, 3.25rem)` (`36px–52px`), weight `500`, line-height `1.08`, tracking `-0.025em`.
  - `.text-headline`: `clamp(1.75rem, 3.2vw, 2.5rem)` (`28px–40px`), weight `500`, line-height `1.12`, tracking `-0.02em`.
  - `.text-title`: `clamp(1.25rem, 2vw, 1.5rem)` (`20px–24px`), weight `500`, line-height `1.25`, tracking `-0.015em`.
  - `.text-body-lg`: `1.0625rem` (`17px`), weight `400`, line-height `1.6`.
  - `.text-body`: `0.9375rem` (`15px`), weight `400`, line-height `1.6`.
  - `.text-caption`: `0.8125rem` (`13px`), weight `400`, line-height `1.5`.
  - `.text-eyebrow`: `0.75rem` (`12px`), weight `500`, uppercase, tracking `0.08em`.
- **12px Computed Floor:** Enforced across all routes (`test-Step8SeoA11yReleaseGates`).

### 2.3 Component Map

| Component            | Source Path                              | Current Implementation Summary                                                                                                                                                                                                                                                                                                           |
| -------------------- | ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Header`             | `src/components/Header.tsx`              | Fixed `h-14` (`56px`) top bar; transparent over dark hero (`scrollY <= 40`), solid `bg-[#FFFFFF]/95` on scroll/hover; 5 center nav links (`Solar Panels`, `Solar + Storage`, `Commercial`, `Design Studio`, `Discover`); right Region Globe modal + `Talk to Advisor` CTA; mobile `Menu` button opening 2-level Radix Dialog slide-over. |
| `MegaMenu`           | `src/components/MegaMenu.tsx`            | Desktop curtain overlay (`duration-300`) showing 3 visual product cards (`16:10` `<Media>`) on the left and 6–7 quick links on the right, plus full-screen backdrop blur.                                                                                                                                                                |
| `BrandLogo`          | `src/components/BrandLogo.tsx`           | Wide-tracked geometric SVG wordmark (`W A V E N O X`, `viewBox="0 0 230 20"`).                                                                                                                                                                                                                                                           |
| `Panel`              | `src/components/system/Panel.tsx`        | Full-viewport (`min-h-[100svh]`) dark showcase section with `<Media>` background, top/bottom linear scrims (`from-[#171A20]/65` top, `from-[#171A20]/90` bottom), top title block (`pt-20 md:pt-28`), and bottom stat + CTA cluster (`pb-6 md:pb-8`).                                                                                    |
| `QuietSection`       | `src/components/system/QuietSection.tsx` | Light/dark editorial container (`py-16 md:py-24 lg:py-32`, `max-w-[1440px]`, `px-6 md:px-12`).                                                                                                                                                                                                                                           |
| `Media`              | `src/components/system/Media.tsx`        | Responsive `<picture>` rendering mobile portrait (`max-width: 767px`) and desktop srcsets (`640w`, `960w`, `1280w`, `1600w`, `1920w`) in AVIF, WebP, and JPG fallback.                                                                                                                                                                   |
| `Button`             | `src/components/system/Button.tsx`       | 4 variants (`primary`, `secondary`, `light`, `glass`), `min-h-[44px] h-11`, `rounded-[4px]`, `px-6`, `text-[14px] font-medium`.                                                                                                                                                                                                          |
| `StatRow`            | `src/components/system/StatRow.tsx`      | 1-to-4 column tabular metric bar (`tabular-nums`, `20px–34px` values + `12px` uppercase labels).                                                                                                                                                                                                                                         |
| `Reveal`             | `src/components/system/Reveal.tsx`       | **Currently a static pass-through wrapper** (`return <div className={className}>{children}</div>`) that ignores `delay`, `yOffset`, and `immediate` props.                                                                                                                                                                               |
| `Faq`                | `src/components/system/Faq.tsx`          | Accessible Radix UI `@radix-ui/react-accordion` (`max-w-[800px]`, `+` rotated to `45°` on open).                                                                                                                                                                                                                                         |
| `SpecsDrawer`        | `src/components/SpecsDrawer.tsx`         | Slide-over technical specification sheet opened from `#heat-performance`.                                                                                                                                                                                                                                                                |
| `ConsultationDrawer` | `src/components/ConsultationDrawer.tsx`  | Global slide-over consultation lead capture drawer connected to `submitConsultationServerFn`.                                                                                                                                                                                                                                            |
| `Footer`             | `src/components/Footer.tsx`              | 4-column architectural sitemap (24 links) + regional contact strip + legal/copyright bottom strip.                                                                                                                                                                                                                                       |

---

## 3. Homepage Header-to-Footer Audit (`src/routes/index.tsx`)

The current WAVENOX homepage renders **12 distinct structural regions** (`Header` + 10 `<main>` sections + `Footer`):

### Section 1 — Header & Global Navigation (`src/components/Header.tsx`, `src/components/MegaMenu.tsx`)

- **A. Customer Purpose:** Identify the brand, switch between Residential Solar, Battery Storage, Commercial Solar, and Design Studio, or contact an advisor.
- **B. Current Visual Presentation:** Fixed `56px` bar (`px-6 md:px-12`), `<BrandLogo>` left, 5 center links (`Solar Panels`, `Solar + Storage`, `Commercial`, `Design Studio`, `Discover`), right region globe button + `Talk to Advisor` bordered pill (`EV-WVX-05`). Hovering a category opens `<MegaMenu>` (`EV-WVX-07`). Mobile shows `Menu` pill opening a clean 2-level slide-over drawer (`EV-WVX-08`).
- **C. Information Density:** Top bar is clean, but `<MegaMenu>` on `Solar Panels` displays 3 visual cards (each with 2 links: `Learn` and `Get Estimate`) plus 7 right-rail links = **13 clickable links inside one hover dropdown**, several pointing to the exact same `/deploy` or `/residential` URLs.
- **D. Visual Quality:** High on the top bar and mobile drawer; medium-low inside the `Solar Panels` MegaMenu where `Elevated Solar Pergola` reuses `res-hero` (`luxury_solar_villa.jpg`), which does not show a pergola.
- **E. Relative Importance:** Primary global chrome (**Remain Prominent / Refine**).
- **F. Technical Dependency:** React state (`activeCategory`, `isScrolled`, `mobileMenuOpen`), `@radix-ui/react-dialog`, `openConsultationDrawer`, `useRegion` context.
- **G. Proposed Design Treatment:** Keep the `56px` header and 2-level mobile drawer; simplify `<MegaMenu>` so each card has a single clickable target (no redundant `Learn · Get Estimate` sub-links under every thumbnail) and cap right-rail links at 4–5 distinct destinations.
- **H. Originality:** Retains WAVENOX's India-specific `PM Surya Ghar Subsidy`, `DISCOM Net-Metering`, and `Telangana / AP` regional context without copying Tesla's `Vehicles / Charging / Shop` taxonomy.

### Section 2 — Hero (`#solar-panels` in `src/routes/index.tsx`)

- **A. Customer Purpose:** _"What does WAVENOX build, why does it fit my Indian home, and how do I start?"_
- **B. Current Visual Presentation:** `<Panel as="h1" media={media["home-hero"]}>` with headline `"Solar, Designed Around Your Home"`, 2-line subtitle, 3 bottom stats (`₹78,000 Max Central Subsidy*`, `25 Years OEM Module Warranty`, `1,490 kWh Annual Yield / kWp`), 2 CTAs (`Get Solar Estimate` -> `/deploy`, `Talk to a Solar Advisor` -> drawer), and a 2-line footnote.
- **C. Information Density:** Slightly crowded at the bottom on `320×720` (`EV-WVX-01`) and `390×844` (`EV-WVX-02`): the 3-column stat row + 2 stacked buttons + 3-line footnote occupy the bottom `46%` of the mobile screen, pushing the white stat numerals directly over the brightly lit yellow windows and solar roof of the villa.
- **D. Visual Quality:** The photograph itself (`home-hero-master.jpg`, Deccan sandstone villa with Jubilee Hills granite boulders) is WAVENOX's strongest asset. However, mobile text placement overlaps the hero subject, and `src/routes/index.tsx` preloads `home-hero-mobile.webp` while `<Media>` loads `home-hero-mobile.avif` (`436 KB`), causing a double download.
- **E. Relative Importance:** Primary above-the-fold impression (**Remain Prominent / Refine**).
- **F. Technical Dependency:** `Panel`, `Media`, `StatRow`, `Button`, `openConsultationDrawer`, `<head>` preload links.
- **G. Proposed Design Treatment:** Shorten hero subtitle to 1 crisp sentence; adjust mobile portrait crop/scrim and compact bottom spacing so the villa roof sits cleanly above the stat row; fix `.avif` preload alignment and re-encode `home-hero-mobile.avif` under `65 KB`.
- **H. Originality:** Showcases authentic Indian sandstone/teak flat-roof architecture set in Deccan granite terrain with Indian rupee subsidy (`₹78,000`) and kWp yield metrics.

### Section 3 — Solar Product Selection / Solutions (`#solutions` in `src/routes/index.tsx`)

- **A. Customer Purpose:** _"Which WAVENOX system fits my property: Residential Rooftop, Solar + Battery, or Commercial?"_
- **B. Current Visual Presentation:** `<QuietSection bg="white">` (`EV-WVX-09`) with heading `"Three Solar Paths. One Coordinated Experience."` and 3 bordered cards (`SOLUTION_FAMILIES`). Each card contains a `16:10` image, dark overlay badge, numbered eyebrow (`01`, `02`, `03`), title, 4-line paragraph, divider, 3 bullet points, and 2 side-by-side buttons (`Explore ...` + `Get Estimate`).
- **C. Information Density:** **Over-dense.** Across 3 cards, the visitor faces 3 images, 3 badges, 3 paragraphs, 9 bullet points, and **6 action buttons** in a single viewport. On `1024px–1440px`, button labels (`Explore Solar Panels`, `Request Assessment`) wrap onto two lines inside the narrow card footer (`EV-WVX-09`).
- **D. Visual Quality:** All three card images (`res-hero`, `omnigrid-hero`, `commercial-hero`) are strong, authentic photographs, but the heavy card chrome (borders, dividers, bullet lists, dual buttons) looks like a SaaS pricing table rather than an architectural showroom.
- **E. Relative Importance:** High (**Remain Prominent / Simplify into Scene 2**).
- **F. Technical Dependency:** `QuietSection`, `Media`, `Button`, `Link`.
- **G. Proposed Design Treatment:** Remove bordered boxes, internal dividers, and dual-button footers. Present a clean, borderless 3-column architectural showcase where each column has: `16:10` photograph, 1 key capacity line, 2-sentence summary, and **1 primary link/CTA** per path.
- **H. Originality:** Organizes WAVENOX around Indian buyer realities (Residential Terrace vs. Outage Backup vs. C&I Tax-Depreciated Rooftop).

### Section 4 — Architectural Solar Design Story (`#design` in `src/routes/index.tsx`)

- **A. Customer Purpose:** _"How cleanly will the panels integrate with my roof and terrace?"_
- **B. Current Visual Presentation:** Full-screen `<Panel media={media["home-design"]}>` with title `"Clean, All-Black Architecture"`, 3 stats (`Flush`, `Concealed`, `158 km/h`), and the exact same 2 CTAs (`Get Solar Estimate`, `Talk to Advisor` replaced by `Explore Solar Panels`).
- **C. Information Density:** Low text density, high visual weight (`100svh`).
- **D. Visual Quality:** **Weak / Inconsistent Media.** `home-design-master.jpg` shows solar panels laid at `0°` flat on black bitumen felt with a hazy US-style skyline (`res-terrace` is an exact byte-for-byte duplicate `sha256: 120f2539b3bf`), while `home-design-mobile-master.jpg` shows a completely different house in a forest.
- **E. Relative Importance:** High (**Remain Prominent as Scene 3, with new Indian terrace/pergola photography**).
- **F. Technical Dependency:** `Panel`, `Media`, `StatRow`, `Button`.
- **G. Proposed Design Treatment:** Replace `home-design` image with an authentic Indian RCC terrace / elevated pergola installation showing usable terrace floor beneath a matte-black solar canopy and concealed UPVC/GI raceways.
- **H. Originality:** Addresses a quintessentially Indian architectural requirement—preserving usable flat-roof terrace life (evening walks, waterproofing integrity, parapet aesthetics) rather than North American pitched asphalt shingles.

### Section 5 — Solar + Battery / Outage Story (`#outage-protection` in `src/routes/index.tsx`)

- **A. Customer Purpose:** _"What happens during a daytime or evening grid outage, and how does battery backup work?"_
- **B. Current Visual Presentation:** Full-screen `<Panel media={media["home-outage"]}>` with title `"Solar + Battery for Uninterrupted Power"`, 3 stats (`< 20 ms`, `14.3 kWh`, `6.0 kW`), and 2 CTAs (`Explore Battery Storage`, `Get Solar Estimate`).
- **C. Information Density:** Concise, but fails to clarify the critical engineering distinction between **standard grid-tied solar** (which shuts down during a grid cut for anti-islanding safety) and **hybrid solar + storage** (which isolates and powers the home in `< 20 ms`).
- **D. Visual Quality:** **Geographically Inauthentic Media.** `home-outage-master.jpg` (`1376×768`) depicts a California coastal cliffside cul-de-sac overlooking the Pacific Ocean (and is duplicated byte-for-byte in `omnigrid-night`), while `home-outage-mobile-master.jpg` shows a different suburban house.
- **E. Relative Importance:** High (**Remain Prominent as Scene 4**).
- **F. Technical Dependency:** `Panel`, `Media`, `StatRow`, `Button`.
- **G. Proposed Design Treatment:** Replace the California coastal image with a dusk Indian residence or the authentic `omnigrid-hero` LFP battery suite (`og-core.jpg`), and explicitly state the honest engineering truth: _Grid-tied solar pauses during outages for utility line safety; pairing with Omnigrid LFP storage enables automatic `< 20 ms` backup._
- **H. Originality:** Grounded in Indian grid-outage realities (running 1.5-ton inverter ACs, Wi-Fi, lighting, and domestic water pumps seamlessly without diesel generator noise or fumes).

### Section 6 — Savings Estimation (`#savings` in `src/routes/index.tsx`)

- **A. Customer Purpose:** _"Roughly what system size, annual savings, and central subsidy apply to my monthly electricity bill?"_
- **B. Current Visual Presentation:** `<QuietSection bg="surface">` (`EV-WVX-10`) containing a bordered white card (`max-w-[760px]`) with DISCOM selector, green `Verified TGERC Schedule` pill, monthly bill slider (`₹2,000–₹35,000`), a 4-line regulatory paragraph above a divider, 3 grey metric boxes (`7.54 kW`, `₹93,452`, `₹78,000`), a generation/capex strip, a _second_ 3-line regulatory paragraph, and 2 bottom CTAs (`Open in Design Studio` passing `?bill=&discom=`, `Talk to a Solar Advisor`).
- **C. Information Density:** **Cluttered internal card layout.** Two separate multi-line legal/tariff disclaimers appear inside the same card (lines 286–290 and lines 331–342 of `src/routes/index.tsx`), and the green pill (`bg-emerald-50 text-emerald-800`) breaks the monochrome palette.
- **D. Visual Quality:** Functional and mathematically rigorous (`estimateQuickSolarPreview`), but visually boxed-in and text-heavy (`EV-WVX-10`).
- **E. Relative Importance:** High (**Refine into Scene 5 — Personalized Design Studio Bridge**).
- **F. Technical Dependency:** `estimateQuickSolarPreview` (`src/data/tariffSchedules.ts`), `DISCOM_SCHEDULES`, `useRegion`, `/deploy?bill=...&discom=...` URL handoff.
- **G. Proposed Design Treatment:** Preserve the exact `estimateQuickSolarPreview` math, DISCOM selector, bill slider, and `/deploy?bill=&discom=` deep-link, but consolidate the two duplicate regulatory notes into **one** clean disclosure footer below the metrics and replace the green emerald pill with a monochrome `#171A20`/`#F4F4F4` verified badge.
- **H. Originality:** Powered by WAVENOX's verified TGERC (`₹2.57/kWh` export settlement per Proceeding dated 29.12.2025) and APERC telescopic slab engine—not generic US flat-rate estimates.

### Section 7 — Product Technology / Heat-Performance Story (`#heat-performance` in `src/routes/index.tsx`)

- **A. Customer Purpose:** _"How do these modules perform in 45°C Indian summer heat and monsoon storms?"_
- **B. Current Visual Presentation:** Full-screen `<Panel media={media["home-heat"]}>` with title `"Built for Indian Heat"`, 3 stats (`-0.30% / °C`, `22.8%`, `IP68`), and 2 CTAs (`View Technical Specs` opening `<SpecsDrawer>`, `Explore Engineering` -> `/technology`).
- **C. Information Density:** Low text density, high visual weight (`100svh`).
- **D. Visual Quality:** **Weak / Abstract CGI Media.** `home-heat` (`res-tile.jpg`, `1200×1200` square upscaled to `1920w`) is an abstract CGI dark bevelled pad with a glowing neon-orange corner on a pitch-black studio void—it looks like a gaming mouse pad or CPU cooler, not a solar module on an Indian roof.
- **E. Relative Importance:** Medium-High (**Consolidate into Scene 3 Rooftop Engineering & Specs Drawer** so the homepage does not stack 5 separate `100svh` dark panels).
- **F. Technical Dependency:** `SpecsDrawer` (`isSpecsOpen` state), `/technology` link.
- **G. Proposed Design Treatment:** Merge the N-Type TOPCon heat resilience metrics (`-0.30% / °C`, `22.8%`, `IP68`) and the `View Technical Specs` drawer trigger directly into **Scene 3 (Beautiful Rooftop Integration)** or present it as a crisp macro detail split paired with an authentic close-up of black anodized solar glass and concealed mounting clamps.
- **H. Originality:** Focuses on Deccan `45°C` summer ambient thermal coefficients and monsoon wind-load engineering (`158 km/h`).

### Section 8 — Monitoring Story (`#monitoring` in `src/routes/index.tsx`)

- **A. Customer Purpose:** _"How will I track solar generation, home consumption, and battery backup day to day?"_
- **B. Current Visual Presentation:** `<QuietSection bg="white">` 12-column split: left 5 columns hold copy + link to `/deploy`; right 7 columns render a pure-CSS dark phone mockup (`Inverter Cloud App`) showing `5.8 kW` Solar, `1.6 kW` Home, `98%` Battery (`2.2 kW`), and `2.0 kW` Net Export (`34.2 kWh Today`).
- **C. Information Density:** Balanced and immediately readable.
- **D. Visual Quality:** Good. The pure-CSS telemetry interface is crisp, honest (`Illustrative live telemetry interface`), and avoids fake app-store claims.
- **E. Relative Importance:** Medium (**Retain as part of Scene 4 Solar + Storage & Telemetry or compact split showcase**).
- **F. Technical Dependency:** `QuietSection`, `Button`.
- **G. Proposed Design Treatment:** Pair the live telemetry view with the Solar + Battery & Smart Energy Management narrative so customers see hardware + real-time visibility together, reducing vertical scroll fatigue.
- **H. Originality:** Explicitly labels the interface as OEM hybrid inverter cloud telemetry (`Illustrative live telemetry interface — actual mobile app provided by your selected inverter OEM`) per `Rules.md`.

### Section 9 — Consultation-to-Installation Process & Governance (`#process` in `src/routes/index.tsx`)

- **A. Customer Purpose:** _"What happens step-by-step from my enquiry to net-meter commissioning, and what warranties protect me?"_
- **B. Current Visual Presentation:** `<QuietSection bg="surface">` (`EV-WVX-11`) combining **two separate sections into one**:
  1. A 6-column horizontal grid of bordered white cards (`STEP 01` to `STEP 06`: Consultation, Site Assessment, Design & Quotation, Installation Coordination, Utility Commissioning, After-Sales Support).
  2. A horizontal `<hr>` divider followed by `"Built on Verifiable Engineering & Governance"` and 3 more bordered white cards (`Three-Tier Warranty Clarity`, `Transparent Tariff & Subsidy Basis`, `Coordinated Delivery & Privacy`).
- **C. Information Density:** **Severely overcrowded on desktop (`EV-WVX-11`).** Placing 6 bordered cards in a single row (`lg:grid-cols-6`) forces each card's body text into a narrow `~140px` (`16ch–18ch`) column that wraps over 8–9 lines, followed immediately by 3 more bordered cards below.
- **D. Visual Quality:** Below the intended showroom standard due to the 9-card wall-of-boxes layout.
- **E. Relative Importance:** High (**Restructure into Scene 6 [From Design to Installation] and Scene 7 [Answers & Trust]**).
- **F. Technical Dependency:** `QuietSection`, `Link` (`/warranty`, `/legal/disclosures`, `/our-story`).
- **G. Proposed Design Treatment:**
  - Replace the 6 narrow `lg:grid-cols-6` boxed cards with a clean, borderless **3×2 architectural timeline grid** (or horizontal milestone rail with generous `32ch–40ch` column width).
  - Move the 3 governance/trust pillars (`Warranty`, `Tariff & Subsidy Basis`, `Delivery & Privacy`) into **Scene 7 (Answers & Trust)** alongside the FAQ accordion so trust proof and common questions live together cleanly.
- **H. Originality:** Explains India-specific milestones (3D sun-path shading study, DISCOM bi-directional net-meter inspection, PM Surya Ghar portal documentation, and DPDP Act 2023 privacy governance).

### Section 10 — FAQ (`#faq` in `src/routes/index.tsx`)

- **A. Customer Purpose:** _"What are the honest answers on installation timelines, power cuts, roof area, subsidy rules, and warranties?"_
- **B. Current Visual Presentation:** `<QuietSection bg="white">` with centered header, 6-item `<Faq>` Radix accordion (`max-w-[800px]`), and bottom links (`View Full FAQ Directory` -> `/faq`, phone dial `+91 91546 26354`).
- **C. Information Density:** Clean and scannable (collapsed by default).
- **D. Visual Quality:** High—clean `1px` dividers, accessible keyboard focus, and `44px` triggers.
- **E. Relative Importance:** High (**Retain in Scene 7 — Answers and Trust**).
- **F. Technical Dependency:** `Faq` (`@radix-ui/react-accordion`), `Link`.
- **G. Proposed Design Treatment:** Combine with the 3 verifiable trust links in Scene 7 so visitors can read key answers and verify warranty/tariff governance in one calm section before the final CTA.
- **H. Originality:** Directly answers Indian homeowner questions (`100 sq. ft. per kWp`, PM Surya Ghar `₹78,000` residential DBT rules, anti-islanding vs. hybrid backup).

### Section 11 — Final Conversion CTA (`#consultation` in `src/routes/index.tsx`)

- **A. Customer Purpose:** _"Ready to start—should I configure my estimate online or request an advisor call?"_
- **B. Current Visual Presentation:** Full-screen `<Panel media={media["home-final"]}>` with title `"Plan Your Solar System with WAVENOX"`, 2 stats (`15 Mins`, `₹0`), and 2 CTAs (`Get Solar Estimate`, `Request Consultation`).
- **C. Information Density:** Low text density, high visual weight (`100svh`).
- **D. Visual Quality:** **Weak Media.** `home-final` (`res-hero-02.jpg`) is an abstract dark curved glass roof reflecting storm clouds—it does not look like an Indian home or terrace and feels visually disconnected from the warm sandstone villa in the hero.
- **E. Relative Importance:** High (**Refine into Scene 8 — Final Action & Footer**).
- **F. Technical Dependency:** `Panel`, `Media`, `StatRow`, `Button`, `openConsultationDrawer`.
- **G. Proposed Design Treatment:** Use a calm, dusk architectural composition (or a refined `75svh–85svh` closing architectural canvas) that echoes the warmth of Scene 1, leading directly into the quiet footer.
- **H. Originality:** Emphasizes WAVENOX's consultative, no-pressure engineering assessment (`15 Mins Discovery Call`, `₹0 Preliminary Sizing`).

### Section 12 — Footer (`src/components/Footer.tsx`)

- **A. Customer Purpose:** Access deep technical pages, regional jurisdiction guides (`Hyderabad`, `Telangana`, `Andhra Pradesh`), net-metering/subsidy guides, warranties, legal disclosures, and contact channels.
- **B. Current Visual Presentation:** White (`bg-[#FFFFFF]`) 4-column sitemap (`Clean Energy Systems`, `Engineering & Science`, `Jurisdictions & Grid`, `Company & Governance`, 6 links per column = 24 links), middle contact strip (`Hyderabad, Telangana`, phone, email, `Schedule Consultation`), and bottom copyright + 4 legal links.
- **C. Information Density:** Medium-high (28 links + contact block), though well-organized into 4 semantic columns.
- **D. Visual Quality:** Clean typography (`12px` eyebrows, `13px` links with `min-h-[36px]`), but some links duplicate each other (e.g., `/legal/disclosures` appears in Column 2, Column 4, and the bottom bar; `/faq` appears in Column 4 with two different hash anchors).
- **E. Relative Importance:** Essential utility closure (**Refine in Scene 8**).
- **F. Technical Dependency:** `BrandLogo`, `Link`, `openConsultationDrawer`, `brand.ts`.
- **G. Proposed Design Treatment:** Keep the 4-column architectural directory for SEO and deep discoverability, deduplicate repeated links (`/legal/disclosures`, `/faq`), and tighten vertical padding so the page closes quietly.
- **H. Originality:** Highlights WAVENOX's verified regional regulatory hubs (`Telangana`, `Andhra Pradesh`, `Hyderabad`) and DPDP Act 2023 compliance.

---

## 4. Summary of Visual Strengths vs. Friction Points

### 4.1 What WAVENOX Already Does Well (Preserve & Build Upon)

1. **Verified Indian Regulatory & Financial Intelligence:** `src/data/tariffSchedules.ts` and `/deploy` implement genuine TGERC (`₹2.57/kWh` export settlement per 29 Dec 2025 proceeding) and APERC telescopic slab math, PM Surya Ghar residential subsidy rules, and SBI Surya Ghar financing eligibility gates.
2. **Strong Primary Photography in 4 Key Slots:** `home-hero` (Deccan sandstone villa), `res-hero` (dusk luxury villa), `omnigrid-hero` (`og-core.jpg` matte-graphite LFP stack), and `commercial-hero` (`enterprise_mw_rooftop.jpg` industrial array) are authentic, high-taste images.
3. **Solid System Primitives:** `Header`, `Panel`, `QuietSection`, `Media`, `Button`, `StatRow`, `Faq`, `SpecsDrawer`, and `ConsultationDrawer` are cleanly typed React/TanStack Start components with accessible Radix primitives and `100%` passing automated tests.
4. **Honest Governance & Security:** Clear separation between OEM hardware warranties and partner installation workmanship, explicit customer consent, and hardened server-only CRM data protection.

### 4.2 Confirmed Visual & Experience Friction Points (To Address in Phase 1)

1. **Mobile Hero Stat Overlap (`P1`):** On `320×720` (`EV-WVX-01`) and `390×844` (`EV-WVX-02`), the 3-column stat row in `#solar-panels` overlaps the bright yellow interior windows and sunlit roof of the hero villa.
2. **Media Duplication & Abstract CGI Mismatches (`P1`):**
   - `res-terrace` === `home-design` (`sha256: 120f2539b3bf`), showing flat `0°` panels on bitumen felt; mobile crop shows a different house in a forest.
   - `omnigrid-night` === `home-outage` (`sha256: b802f80c3d86`), showing a California coastal cliffside cul-de-sac; mobile crop shows a different house.
   - `studio-estate` === `res-weather` (`sha256: 35002c84942b`), using `def-tile.jpg` (an abstract CGI square diagram on a black void).
   - `home-heat` (`res-tile.jpg`), `omnigrid-switchover` (`og-module.jpg`), `commercial-industrial` (`def-grid.jpg`), `commercial-campus` (`eco-01-grid.jpg`), and `home-final` (`res-hero-02.jpg`) are abstract CGI renders or non-Indian scenes that break photographic continuity.
3. **Hero Preload Format Mismatch & Mobile AVIF Weight (`P1`):** `src/routes/index.tsx` (and `/residential`, `/omnigrid`, `/enterprise`) preloads `.webp` in `<head>` while `<Media>` selects `.avif` first, causing double downloads. Additionally, `home-hero-mobile.avif` is `436.2 KB` (larger than `home-hero-mobile.webp` at `181.6 KB`).
4. **Card-in-Card & Button Clutter in Quiet Sections (`P1`/`P2`):**
   - `#solutions` (`EV-WVX-09`) packs 3 bordered cards, 9 bullets, and 6 wrapping buttons into one screen.
   - `#savings` (`EV-WVX-10`) repeats two long regulatory disclaimers inside the same card and uses an off-palette green badge.
   - `#process` (`EV-WVX-11`) squeezes 6 narrow vertical cards (`16ch` wide) above 3 governance cards in a single section.
5. **Repetitive Full-Screen Panels & CTA Fatigue (`P2`):** The homepage stacks 5 full-screen `100svh` `<Panel>` sections repeating nearly identical CTA pairs (`Get Solar Estimate` + `Talk to a Solar Advisor`) 7 times down the page.
6. **No-Op `<Reveal>` Component (`P3`):** `src/components/system/Reveal.tsx` is a static `<div>` wrapper that ignores its `delay`, `yOffset`, and `immediate` props.

---

## 5. Complete Existing Media Inventory Summary (`src/config/media.ts`)

_(See `07_PHOTOGRAPHY_AND_ASSET_DIRECTION.md` for the full forensic SHA-256 table, dimensions, byte weights, and 18-point replacement briefs.)_

| Media Slug              | Master Source File                                         | Native Master Size        | Current Status Summary                                                                                     |
| ----------------------- | ---------------------------------------------------------- | ------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `home-hero`             | `home-hero-master.jpg` + `home-hero-mobile-master.jpg`     | `2752×1536` / `1536×2752` | **KEEP / REPROCESS** (Fix `.avif` 436 KB weight & preload mismatch; refine mobile text overlap).           |
| `home-design`           | `home-design-master.jpg` + `home-design-mobile-master.jpg` | `2752×1536` / `1536×2752` | **REPLACE** (Duplicate of `res-terrace`; `0°` flat panels on bitumen; mismatched mobile house).            |
| `home-outage`           | `home-outage-master.jpg` + `home-outage-mobile-master.jpg` | `1376×768` / `768×1376`   | **REPLACE** (Duplicate of `omnigrid-night`; California Pacific coastline; upscaled to `1920w`).            |
| `home-heat`             | `res-tile.jpg`                                             | `1200×1200`               | **REPLACE** (Abstract CGI glowing pad on black void; upscaled from `1200px` to `1920w`).                   |
| `home-final`            | `res-hero-02.jpg`                                          | `1920×1088`               | **REPLACE** (Abstract curved glass roof; no terrace context).                                              |
| `res-hero`              | `luxury_solar_villa.jpg`                                   | `1376×768`                | **KEEP / REPROCESS** (Authentic Indian dusk villa; disable upscaling past `1376w`).                        |
| `res-terrace`           | `home-design-master.jpg`                                   | `2752×1536`               | **REPLACE** (Exact byte duplicate of `home-design`; shows no pergola or usable terrace).                   |
| `res-weather`           | `def-tile.jpg`                                             | `1440×1440`               | **REPLACE** (Exact byte duplicate of `studio-estate`; abstract CGI exploded diagram, not monsoon weather). |
| `omnigrid-hero`         | `og-core.jpg`                                              | `1376×768`                | **KEEP / REPROCESS** (Strong, original 3-stack matte-graphite LFP battery + hybrid inverter).              |
| `omnigrid-switchover`   | `og-module.jpg`                                            | `1088×1440`               | **REPLACE** (Abstract black monolith on void; contradicts `omnigrid-hero` form factor).                    |
| `omnigrid-night`        | `home-outage-master.jpg`                                   | `1376×768`                | **REPLACE** (Exact byte duplicate of `home-outage`; California coastline).                                 |
| `commercial-hero`       | `enterprise_mw_rooftop.jpg`                                | `1376×768`                | **KEEP / REPROCESS** (Authentic Deccan sunrise industrial rooftop array).                                  |
| `commercial-industrial` | `def-grid.jpg`                                             | `1920×1088`               | **REPLACE** (Abstract CGI black plates floating in void, not an industrial roof).                          |
| `commercial-campus`     | `eco-01-grid.jpg`                                          | `1024×1024`               | **REPLACE** (CGI skyscraper with glowing neon-orange lava strips & US traffic).                            |
| `studio-estate`         | `def-tile.jpg`                                             | `1440×1440`               | **REPLACE** (Exact byte duplicate of `res-weather`; abstract CGI diagram).                                 |
