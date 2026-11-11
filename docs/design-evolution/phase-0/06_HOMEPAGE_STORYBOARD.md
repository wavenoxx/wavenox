# PHASE 0 — DELIVERABLE 6: PROPOSED HOMEPAGE CREATIVE STORYBOARD

**Document ID:** `06_HOMEPAGE_STORYBOARD.md`  
**Verified Repository Commit:** `c01704c1b3298361b796558aa629cc18cb632ba0`  
**Audit Branch:** `docs/wavenox-phase0-design-blueprint`  
**Target Route:** `src/routes/index.tsx` (Proposal Only — No Route Changes in Phase 0)

---

## 1. Executive Narrative Architecture: From 10 Sections to 8 Cohesive Scenes

Today's homepage (`src/routes/index.tsx`) stacks **10 `<main>` sections** (5 full-viewport `100svh` dark `<Panel>` sections + 5 `<QuietSection>` blocks) plus Header and Footer. Because `#design` (`Clean, All-Black Architecture`) and `#heat-performance` (`Built for Indian Heat`) both tell the rooftop solar module story in separate `100svh` panels, and because `#process` bundles 6 narrow step cards + 3 governance cards into one crowded section (`EV-WVX-11`), visitors experience scroll fatigue and repetitive CTAs.

The proposed **8-Scene Homepage Storyboard** preserves **100% of WAVENOX's existing capabilities, calculators, drawers, and links** while tightening the narrative into a calm, logical, zero-redundancy sequence:

### Section-to-Scene Preservation Map

| Current Homepage Region (`src/routes/index.tsx`)                                                          | Proposed Destination in 8-Scene Storyboard                            | What Changes & What Is Preserved                                                                                                                                                                                                                                                                                                |
| --------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **0. `<Header />` & `<MegaMenu />`**                                                                      | **Global Chrome (Above Scene 1)**                                     | **Preserved** (`56px` bar, mobile drawer, Globe modal); MegaMenu links deduplicated.                                                                                                                                                                                                                                            |
| **1. `#solar-panels` (Hero `<Panel>`)**                                                                   | **Scene 1 — Architectural Solar Hero**                                | **Refined:** Shorter 1-sentence subtitle; mobile crop/spacing adjusted so stats never overlap the villa windows (`EV-WVX-01`); `.avif` preload fixed.                                                                                                                                                                           |
| **2. `#solutions` (`Three Solar Paths`)**                                                                 | **Scene 2 — Why WAVENOX Solar (Three Architectural Paths)**           | **Refined:** Bordered SaaS boxes and 6 wrapping buttons (`EV-WVX-09`) become a borderless 3-column architectural showcase with **1 primary CTA per path**.                                                                                                                                                                      |
| **3. `#design` (`Clean, All-Black Architecture`)** + **6. `#heat-performance` (`Built for Indian Heat`)** | **Scene 3 — Beautiful Rooftop Integration & Indian Heat Engineering** | **Consolidated:** Merges roof aesthetics (`Flush / Pergola`, `158 km/h`) with N-Type TOPCon thermal performance (`-0.30%/°C`, `22.8%`) and the `View Technical Specs` (`<SpecsDrawer>`) trigger into one authoritative architectural scene, eliminating one redundant `100svh` panel and the abstract CGI pad (`res-tile.jpg`). |
| **4. `#outage-protection` (`Solar + Battery`)** + **7. `#monitoring` (`Track Live Generation`)**          | **Scene 4 — Solar + Battery Storage & Live Telemetry**                | **Unified Energy Intelligence:** Pairs the full-viewport outage-backup story (with honest grid-tied vs. hybrid explanation) with the live OEM inverter cloud telemetry showcase.                                                                                                                                                |
| **5. `#savings` (`Estimate Your Solar System & Savings`)**                                                | **Scene 5 — Personalized Design & Tariff Intelligence**               | **Refined:** Keeps `estimateQuickSolarPreview` (verified TGERC/APERC math), DISCOM selector, bill slider, and `/deploy?bill=&discom=` deep-link; removes duplicate internal disclaimer block and off-palette green badge (`EV-WVX-10`).                                                                                         |
| **8a. `#process` Top Half (`From Consultation to Power-On`)**                                             | **Scene 6 — From Design to Installation**                             | **Restructured:** Replaces the cramped 6-across card row (`16ch` columns in `EV-WVX-11`) with a spacious **3×2 borderless architectural milestone grid** (`34ch–42ch` per column).                                                                                                                                              |
| **8b. `#process` Bottom Half (`TRUST_CARDS`)** + **9. `#faq` (`Questions & Answers`)**                    | **Scene 7 — Answers and Verifiable Trust**                            | **Consolidated:** Pairs the 6-item `<Faq>` accordion with the 3 verifiable governance pillars (`Three-Tier Warranty`, `Verified Tariff & Subsidy Basis`, `Coordinated Delivery & DPDP Privacy`) in one calm section.                                                                                                            |
| **10. `#consultation` (`Plan Your Solar System`)** + **11. `<Footer />`**                                 | **Scene 8 — Final Action & Quiet Architectural Footer**               | **Refined:** Replaces the abstract curved-glass `home-final` image with a warm dusk Indian architectural canvas (`80svh`) flowing into the deduplicated 4-column footer.                                                                                                                                                        |

---

## 2. Scene-by-Scene Specification (Scenes 1–8)

### Scene 1 — Architectural Solar Hero (`#solar-panels`)

- **Purpose:** Establish WAVENOX's identity, showcase solar integrated naturally onto a contemporary Indian home, and provide an immediate path to estimate savings or speak with an advisor within 5 seconds.
- **Proposed Headline Direction (Proposal):** `"Solar, Designed Around Your Home"`
- **Supporting-Copy Direction (Proposal):** `"Custom rooftop solar and LFP battery storage engineered for Indian homes—from DISCOM tariff modeling to net-meter commissioning."` _(1 concise sentence, `<= 20` words)._
- **Visual Type:** Full-bleed (`100svh`) commissioned architectural photograph (`home-hero-master.jpg` desktop `16:9`, `home-hero-mobile-master.jpg` mobile `9:16`) depicting the Deccan sandstone/teak villa with flat RCC solar arrays and granite boulder context.
- **Layout Recommendation:** Full-viewport `<Panel as="h1">` with centered upper title block (`14%–24%` vertical zone), unobstructed middle architectural band (`28%–66%`), and lower stat + CTA cluster (`68%–94%`).
- **Desktop Layout (`1024px–1920px`):** `48px` display H1, `17px` single-sentence subcopy (`max-w-[560px]`), 3-column `<StatRow>` (`₹78,000 Max Central Subsidy*`, `25 Years OEM Module Warranty`, `1,490 kWh Annual Yield / kWp`), side-by-side `<Button variant="light">` (`Get Solar Estimate`) and `<Button variant="glass">` (`Talk to a Solar Advisor`), plus 1-line `12px` PM Surya Ghar footnote.
- **Mobile Layout (`320px–767px`):** `34px` H1, `15px` subcopy, compact 3-column `<StatRow>` positioned below the villa roofline (`pb-5`), full-width stacked CTAs (`44px` height each), and 2-line `12px` footnote over a strengthened bottom scrim (`from-[#171A20]/95`).
- **Primary Interaction:** Clicking `Get Solar Estimate` navigates to `/deploy`; clicking `Talk to a Solar Advisor` opens `<ConsultationDrawer>` with `source="home-hero"`.
- **CTA Destination:** Primary: `/deploy` | Secondary: `<ConsultationDrawer>` (`openConsultationDrawer`).
- **Required Evidence:** MNRE PM Surya Ghar central residential subsidy slab (`₹78,000` cap at `3 kW+`), Tier-1 OEM 25-year linear performance warranty, and `1,490 kWh/kWp/yr` South/Central India irradiation benchmark (`docs/CLAIM_EVIDENCE_MATRIX.md`).
- **Dependencies on Existing Components:** `Header`, `MegaMenu`, `Panel`, `Media`, `StatRow`, `Button`, `ConsultationDrawer`.
- **Risk or Limitation:** `home-hero-mobile.avif` is currently `436.2 KB` and `<head>` preloads `.webp`; Phase 1 must re-encode the mobile AVIF under `65 KB` and align `<link rel="preload" type="image/avif">` to protect mobile LCP.
- **Originality Statement:** Features authentic Indian flat-roof sandstone/teak architecture in a Deccan boulder landscape with Indian rupee subsidy (`₹78,000`) and kWp yield metrics—distinct from North American pitched-roof benchmarks.

---

### Scene 2 — Why WAVENOX Solar: Three Architectural Paths (`#solutions`)

- **Purpose:** Help the visitor self-select the right system architecture (Residential Rooftop, Residential Solar + Battery Backup, or Commercial & Industrial Solar) without drowning in bordered boxes or 6 competing buttons.
- **Proposed Headline Direction (Proposal):** `"Three Solar Paths. One Coordinated Experience."`
- **Supporting-Copy Direction (Proposal):** `"Choose the system architecture tailored to your roof geometry, daytime load profile, and backup power requirements."`
- **Visual Type:** Three coordinated `16:10` architectural photographs (`res-hero` dusk Indian villa, `omnigrid-hero` matte-graphite LFP stack, `commercial-hero` Deccan industrial array).
- **Layout Recommendation:** `<QuietSection bg="white">` featuring a **borderless 3-column architectural gallery** (`grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-12`). Remove the outer card borders, remove the bullet-point lists, and replace the 6 wrapping buttons with **1 clear CTA per column**.
- **Desktop Layout (`1024px–1920px`):** Each column displays:
  1. `16:10` rounded-`[4px]` photograph with subtle capacity caption below (`01 · RESIDENTIAL ROOFTOP · 3 kW – 25 kW`).
  2. `24px` medium-weight title (`Solar Panels for Homes`, `Solar + Battery Storage`, `Commercial Solar`).
  3. Concise 2-sentence description (`max-w-[38ch]`) integrating the key benefit (up to `₹78,000` subsidy, `< 20 ms` backup switchover, or `3–4 year` C&I payback).
  4. **One** full-clarity action button (`Explore Solar Panels` -> `/residential`, `Explore Battery Storage` -> `/omnigrid`, `Explore Commercial` -> `/enterprise`) plus a subtle inline text link (`Configure in Studio ->` `/deploy`).
- **Mobile Layout (`320px–767px`):** Vertical stack of the 3 pathways separated by `1px` `#E3E4E6` horizontal dividers (`py-8` each), with full-width `44px` primary buttons that never wrap onto two lines.
- **Primary Interaction:** Direct route navigation to the selected product line (`/residential`, `/omnigrid`, `/enterprise`) or `/deploy`.
- **CTA Destination:** `/residential`, `/omnigrid`, `/enterprise` (secondary text link to `/deploy`).
- **Required Evidence:** Verified capacity ranges (`3–25 kW` residential, `14.3–28.6 kWh` LFP storage, `25 kW–Multi-MW` C&I) and Section 32 accelerated depreciation disclosure.
- **Dependencies on Existing Components:** `QuietSection`, `Media`, `Button`, `Link`, `Reveal`.
- **Risk or Limitation:** Removing the second button per card reduces total buttons in this section from 6 to 3; ensure `/deploy` remains accessible via the inline link and Scene 5.
- **Originality Statement:** Structured around Indian buyer segments (independent homes/RWAs, outage-prone hybrid storage homes, and HT/LT industrial facilities).

---

### Scene 3 — Beautiful Rooftop Integration & Indian Heat Engineering (`#design`)

- **Purpose:** Show how WAVENOX integrates all-black N-Type TOPCon modules onto Indian flat RCC terraces and elevated pergolas while thriving in `45°C` ambient heat and monsoon winds—consolidating `#design` and `#heat-performance` into one powerful scene.
- **Proposed Headline Direction (Proposal):** `"Engineered for Indian Rooftops and 45°C Summers"`
- **Supporting-Copy Direction (Proposal):** `"Low-profile RCC mounts and elevated terrace pergolas with concealed conduit raceways, -0.30%/°C thermal resilience, and 158 km/h wind-load certification."`
- **Visual Type:** Full-bleed (`100svh`) original architectural photograph (`home-design` replacement—Category C/B in `07_PHOTOGRAPHY_AND_ASSET_DIRECTION.md`) showing an authentic Indian flat-roof terrace with an elevated black-anodized solar pergola, warm sandstone parapet, concealed raceways, and usable shaded terrace space below.
- **Layout Recommendation:** Full-viewport `<Panel>` combining architectural beauty with WAVENOX's core module engineering metrics and direct access to the `<SpecsDrawer>`.
- **Desktop Layout (`1024px–1920px`):** Upper centered title + subcopy; middle band showing the elevated solar pergola and anti-reflective black modules; bottom `<StatRow>` with 3 high-impact engineering facts (`-0.30% / °C Thermal Coefficient`, `22.8% N-Type TOPCon Efficiency`, `158 km/h Wind Load Rating`), followed by 2 CTAs: `<Button variant="light">` (`View Technical Specs` -> opens `<SpecsDrawer>`) and `<Button variant="glass">` (`Explore Solar Panels` -> `/residential`).
- **Mobile Layout (`320px–767px`):** Dedicated `9:16` portrait crop of the **exact same Indian terrace pergola**, keeping the canopy in the middle third (`32%–64%`) with stacked CTAs at the bottom.
- **Primary Interaction:** Clicking `View Technical Specs` opens `<SpecsDrawer>` (`isSpecsOpen = true`) to inspect full electrical, thermal, and mechanical specifications without leaving the page.
- **CTA Destination:** Primary: `<SpecsDrawer>` modal trigger | Secondary: `/residential`.
- **Required Evidence:** Tier-1 N-Type TOPCon datasheet specs (`-0.30%/°C` Pmax temperature coefficient, `22.8%` module efficiency, `IP68` junction box, `2400 Pa` / `158 km/h` wind load).
- **Dependencies on Existing Components:** `Panel`, `Media`, `StatRow`, `Button`, `SpecsDrawer`.
- **Risk or Limitation:** Requires replacing `home-design-master.jpg` (flat bitumen roof) and retiring `res-tile.jpg` (abstract CGI pad) in Phase 1.
- **Originality Statement:** Focuses on usable Indian RCC terrace architecture (elevated pergolas, waterproofing protection, and `45°C` Deccan summer thermal performance).

---

### Scene 4 — Solar + Battery Storage & Live Telemetry (`#outage-protection`)

- **Purpose:** Explain honestly what happens during a grid power cut (standard grid-tied solar pauses for anti-islanding safety; hybrid solar + LFP storage switches over in `< 20 ms`) and show how homeowners monitor live generation, home load, and battery backup.
- **Proposed Headline Direction (Proposal):** `"Uninterrupted Power When the Grid Goes Down"`
- **Supporting-Copy Direction (Proposal):** `"Standard grid-tied solar shuts down during power cuts for utility safety. Pair your rooftop array with Omnigrid LiFePO4 storage for automatic sub-20ms backup that runs ACs, Wi-Fi, and home essentials silently."`
- **Visual Type:** Full-bleed (`100svh`) dusk architectural photograph (`home-outage` replacement—Category D in `07_PHOTOGRAPHY_AND_ASSET_DIRECTION.md`) showing a warm-lit contemporary Indian residence at twilight during a neighborhood grid cut, followed immediately by a compact `<QuietSection bg="white">` split showcasing the **Live Inverter Cloud Telemetry** interface (`#monitoring`).
- **Layout Recommendation:**
  - **Part 4A (`<Panel>`):** Dusk Indian residence backup showcase with 3 stats (`< 20 ms Automatic Switchover`, `14.3 kWh Expandable LFP Storage`, `6.0 kW Surge Backup Output`) and 2 CTAs (`Explore Battery Storage` -> `/omnigrid`, `Configure Solar + Storage` -> `/deploy`).
  - **Part 4B (`<QuietSection bg="white">`):** 12-column split pairing concise explanation of real-time energy visibility with the pure-CSS dark telemetry mockup (`5.8 kW` Solar, `1.6 kW` Home Load, `98%` Battery, `2.0 kW` Net Export).
- **Desktop Layout (`1024px–1920px`):** `100svh` `<Panel>` followed by a compact `py-20` 12-column telemetry split (`5` cols narrative left, `7` cols telemetry phone card right).
- **Mobile Layout (`320px–767px`):** `100svh` portrait `<Panel>` followed by stacked narrative + responsive telemetry card (`320px`-safe 2×2 metric grid).
- **Primary Interaction:** Navigate to `/omnigrid` or `/deploy`.
- **CTA Destination:** `/omnigrid` and `/deploy`.
- **Required Evidence:** Hybrid inverter UPS transfer specification (`< 20 ms`), cobalt-free LiFePO4 chemistry (`14.3 kWh` / `28.6 kWh`), and explicit OEM monitoring app disclosure.
- **Dependencies on Existing Components:** `Panel`, `QuietSection`, `Media`, `StatRow`, `Button`.
- **Risk or Limitation:** Must replace `home-outage-master.jpg` (California coastal cul-de-sac) with an authentic Indian dusk residential composition in Phase 1.
- **Originality Statement:** Directly addresses Indian grid-outage pain points (inverter AC runtime, diesel generator replacement, and anti-islanding transparency).

---

### Scene 5 — Personalized Design & Tariff Intelligence (`#savings`)

- **Purpose:** Give visitors an immediate, transparent preview of their recommended system size, annual bill savings, and PM Surya Ghar subsidy based on their actual DISCOM and monthly electricity bill—serving as a frictionless bridge into the full `/deploy` Design Studio.
- **Proposed Headline Direction (Proposal):** `"Estimate Your Solar System & Savings"`
- **Supporting-Copy Direction (Proposal):** `"Select your electricity utility and monthly bill for an instant sizing preview modeled on verified state tariff slabs—then customize your roof and battery in the Design Studio."`
- **Visual Type:** Clean interactive financial configurator surface (`<QuietSection bg="surface">`) with tabular numeric cards and an instant deep-link handoff to `/deploy?bill=...&discom=...`.
- **Layout Recommendation:** Refine the existing `#savings` card (`EV-WVX-10`):
  1. Replace the off-palette green badge (`bg-emerald-50`) with a monochrome `#F4F4F4` / `#171A20` badge (`Verified TGERC / APERC Schedule` with a `6px` `#B45309` dot).
  2. **Remove the duplicate 4-line regulatory paragraph between the slider and the metrics** (`src/routes/index.tsx#L286-L290`), keeping the controls and the 3 output metrics (`7.54 kW`, `₹93,452`, `₹78,000`) visually immediate.
  3. Consolidate all tariff, Clause 8.1.3 (`₹2.57/kWh` Telangana export settlement), and PM Surya Ghar DBT disclosures into **one** clean, scannable footnote block at the bottom of the card with a link to `/legal/disclosures`.
- **Desktop Layout (`1024px–1920px`):** Centered `max-w-[820px]` white architectural surface (`p-8 md:p-12`), DISCOM selector + bill slider at top, 3-column metric bar (`Recommended kW`, `Est. Annual Savings`, `Potential DBT Subsidy*`) in the middle, generation/capex strip below, 1 unified disclosure footnote, and 2 centered CTAs (`Open in Design Studio` -> `/deploy?bill=...&discom=...`, `Talk to a Solar Advisor`).
- **Mobile Layout (`320px–767px`):** Full-width touch-friendly range slider (`accent-[#171A20]`), stacked 1-column metric tiles on `320px` / 3-column on `640px+`, and full-width stacked CTAs.
- **Primary Interaction:** Selecting DISCOM (`TGSPDCL`, `TGNPDCL`, `APCPDCL`, `APEPDCL`, `APSPDCL`, `OTHER_INDIA`), dragging the `₹2,000–₹35,000` bill slider, and clicking `Open in Design Studio` to launch `/deploy` pre-populated with `?bill=&discom=`.
- **CTA Destination:** Primary: `/deploy?bill=${monthlyBill}&discom=${selectedDiscom}` | Secondary: `<ConsultationDrawer>`.
- **Required Evidence:** `src/data/tariffSchedules.ts` (`estimateQuickSolarPreview`), TGERC Proceeding No. TGERC/Secy/77/2025 dated 29.12.2025 (`₹2.57/kWh` export settlement), APERC FY 2025-26/2026-27 slabs, and MNRE PM Surya Ghar subsidy tiers.
- **Dependencies on Existing Components:** `QuietSection`, `Button`, `estimateQuickSolarPreview`, `DISCOM_SCHEDULES`, `useRegion`.
- **Risk or Limitation:** Zero changes permitted to `estimateQuickSolarPreview` math or `/deploy` query parameter contract.
- **Originality Statement:** Built onWAVENOХ's verified Indian state electricity board telescopic slab engine rather than generic rule-of-thumb multipliers.

---

### Scene 6 — From Design to Installation (`#process`)

- **Purpose:** Demystify what happens after a customer requests a consultation—from 3D sun-path site survey to DISCOM net-meter commissioning and PM Surya Ghar portal documentation.
- **Proposed Headline Direction (Proposal):** `"From Consultation to Power-On"`
- **Supporting-Copy Direction (Proposal):** `"WAVENOX coordinates engineering design, structural verification, authorized installation, and DISCOM bi-directional metering through one accountable workflow."`
- **Visual Type:** Architectural editorial timeline grid (`<QuietSection bg="white">`).
- **Layout Recommendation:** Replace the cramped 6-across card row (`lg:grid-cols-6` with `16ch` columns in `EV-WVX-11`) with a spacious, **borderless 3×2 architectural grid** (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-10`) where each step has a top `1px` `#E3E4E6` hairline, a tabular step index (`01` through `06`), a `20px` medium heading, and a comfortable `34ch–42ch` paragraph.
- **Desktop Layout (`1024px–1920px`):** 2 rows of 3 steps (`01 Consultation`, `02 Site Assessment`, `03 Design & Quotation` on Row 1; `04 Installation Coordination`, `05 Utility Commissioning`, `06 After-Sales Support` on Row 2), followed by a single concise timeline note and links to `/net-metering` and `/subsidy`.
- **Mobile Layout (`320px–767px`):** Clean single-column vertical progression (`gap-8`) with `1px` top dividers.
- **Primary Interaction:** Scanning the 6 operational milestones and optionally clicking through to `/net-metering` or `/subsidy` guides.
- **CTA Destination:** Inline links to `/net-metering` and `/subsidy`.
- **Required Evidence:** Accurate representation of WAVENOX's coordinated partner fulfillment model and state DISCOM net-metering workflow (`Rules.md`).
- **Dependencies on Existing Components:** `QuietSection`, `Reveal`, `Link`.
- **Risk or Limitation:** Relocating the 3 `TRUST_CARDS` out of `#process` into Scene 7 must preserve all 3 governance links (`/warranty`, `/legal/disclosures`, `/our-story`).
- **Originality Statement:** Tailored to Indian rooftop execution realities (3D sun-path shading analysis around adjacent buildings/water tanks, DISCOM feeder feasibility, and bi-directional meter commissioning).

---

### Scene 7 — Answers and Verifiable Trust (`#faq` + Governance Pillars)

- **Purpose:** Resolve final buyer objections with honest engineering answers (`<Faq>`) backed directly by WAVENOX's three verifiable governance pillars (Warranty Clarity, Tariff & Subsidy Basis, Coordinated Delivery & DPDP Privacy).
- **Proposed Headline Direction (Proposal):** `"Questions, Answers & Verifiable Governance"`
- **Supporting-Copy Direction (Proposal):** `"Every specification, tariff assumption, and warranty boundary is documented openly before you commit."`
- **Visual Type:** Clean typographic accordion (`<Faq>`) paired with a 3-column governance summary strip (`<QuietSection bg="surface">`).
- **Layout Recommendation:**
  - **Top Block:** The 3 governance pillars (`Three-Tier Warranty Clarity` -> `/warranty`, `Transparent Tariff & Subsidy Basis` -> `/legal/disclosures`, `Coordinated Delivery & Privacy` -> `/our-story`) arranged as a clean 3-column architectural row (`grid-cols-1 md:grid-cols-3 gap-8`).
  - **Bottom Block:** The 6-item `<Faq>` accordion (`max-w-[800px] mx-auto`) + footer link to `/faq` and advisor phone line (`+91 91546 26354`).
- **Desktop Layout (`1024px–1920px`):** 3-column trust row above a centered `800px` accordion container.
- **Mobile Layout (`320px–767px`):** Stacked trust pillars above full-width `44px`-tall accordion triggers.
- **Primary Interaction:** Expanding/collapsing Radix accordion items via pointer or keyboard (`Enter`/`Space`/`ArrowDown`/`ArrowUp`) and inspecting governance pages.
- **CTA Destination:** `/warranty`, `/legal/disclosures`, `/our-story`, `/faq`, `tel:+919154626354`.
- **Required Evidence:** Three-tier warranty separation (25-yr OEM module / 10-yr OEM inverter & battery / partner workmanship), DPDP Act 2023 compliance, and verified TGERC/APERC citations.
- **Dependencies on Existing Components:** `QuietSection`, `Faq`, `Link`.
- **Risk or Limitation:** Ensure all 6 existing `FAQ_ITEMS` and all 3 `TRUST_CARDS` remain intact so zero consumer disclosures are lost.
- **Originality Statement:** Rejects fabricated testimonials and star badges in favor of auditable engineering disclosures and Indian regulatory citations.

---

### Scene 8 — Final Action & Quiet Architectural Footer (`#consultation` + `<Footer />`)

- **Purpose:** Close the homepage with one calm, high-confidence invitation to configure a system or speak with a WAVENOX solar engineer, followed by a clean, deduplicated architectural sitemap footer.
- **Proposed Headline Direction (Proposal):** `"Plan Your Solar System with WAVENOX"`
- **Supporting-Copy Direction (Proposal):** `"Generate a preliminary rooftop sizing and savings proposal online, or request a no-obligation engineering consultation for your property."`
- **Visual Type:** Full-bleed closing architectural photograph (`home-final` replacement—Category A/C warm twilight Indian villa terrace) + clean white `<Footer />`.
- **Layout Recommendation:**
  - **Closing `<Panel>` (`min-h-[80svh]`):** Warm twilight Indian villa composition, 2 concise metrics (`15 Mins Discovery Call`, `₹0 Preliminary Sizing`), and 2 final CTAs (`Get Solar Estimate` -> `/deploy`, `Request Consultation` -> `<ConsultationDrawer>`).
  - **`<Footer />`:** Retain the 4-column sitemap (`Clean Energy Systems`, `Engineering & Science`, `Jurisdictions & Grid`, `Company & Governance`), regional contact strip (`Hyderabad, Telangana · +91 91546 26354 · connect@wavenox.in`), and legal bottom strip, while deduplicating repeated `/legal/disclosures` and `/faq` entries.
- **Desktop Layout (`1024px–1920px`):** Centered closing panel above a 4-column `max-w-[1440px]` footer (`py-16`).
- **Mobile Layout (`320px–767px`):** Portrait closing panel with full-width stacked CTAs above a 2-column (`sm:grid-cols-2`) / 1-column mobile footer with `>= 36px` touch spacing.
- **Primary Interaction:** Final conversion trigger (`/deploy` or `<ConsultationDrawer>`) or deep navigation to regional/legal pages.
- **CTA Destination:** `/deploy`, `<ConsultationDrawer>`, and all public route links in `<Footer />`.
- **Required Evidence:** Accurate contact details (`+91 91546 26354`, `connect@wavenox.in`, Hyderabad operational hub) and legal links (`/privacy`, `/terms`, `/legal/disclosures`, `/warranty`).
- **Dependencies on Existing Components:** `Panel`, `Media`, `StatRow`, `Button`, `ConsultationDrawer`, `Footer`.
- **Risk or Limitation:** Replace `res-hero-02.jpg` (abstract curved glass roof) with an authentic Indian dusk architectural photograph in Phase 1.
- **Originality Statement:** Grounds the closing impression in WAVENOX's Hyderabad/Telangana/AP engineering hub and consultative delivery model.
