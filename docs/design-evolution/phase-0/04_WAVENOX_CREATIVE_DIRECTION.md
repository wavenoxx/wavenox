# PHASE 0 — DELIVERABLE 4: WAVENOX CREATIVE DIRECTION & BRAND EXPRESSION

**Document ID:** `04_WAVENOX_CREATIVE_DIRECTION.md`  
**Verified Repository Commit:** `c01704c1b3298361b796558aa629cc18cb632ba0`  
**Audit Branch:** `docs/wavenox-phase0-design-blueprint`  
**Working Creative Positioning:** _"WAVENOX — Architectural Energy, Thoughtfully Integrated."_

---

## 1. Creative Positioning & Design Philosophy

### 1.1 Working Creative Positioning Statement

> **"WAVENOX — Architectural Energy, Thoughtfully Integrated."**  
> _(Working creative direction for Phase 0 alignment; guides visual, typographic, and editorial decisions without altering legal corporate disclosures.)_

### 1.2 Core Design Philosophy: _Quiet Engineering Authority_

WAVENOX serves discerning Indian homeowners, villa architects, resident welfare associations (RWAs), and commercial enterprises across Telangana, Andhra Pradesh, and major Indian metros. Unlike impulsive consumer gadgets, a rooftop solar and battery system is a **25-year architectural and financial infrastructure decision**.

Our design philosophy rests on four pillars:

1. **Architecture First, Hardware Second:** Solar modules, elevated terrace pergolas, and LFP battery stacks must be shown integrated harmoniously into real Indian architecture—exposed Deccan granite, Dholpur/Tandur sandstone, board-formed concrete, warm teak louvers, and clean RCC parapets—never floating as sci-fi CGI objects in a black void.
2. **One Idea Per Viewport:** Every scroll screen answers one customer question with one clear visual, one medium-weight headline, and at most three supporting numbers.
3. **Radical Financial & Technical Honesty:** WAVENOX wins trust by showing its math openly—citing verified TGERC/APERC telescopic tariff schedules, PM Surya Ghar DBT subsidy conditions, anti-islanding safety physics, and the exact boundary between OEM hardware warranties and partner workmanship.
4. **Consultative Control Without Pressure:** Every interactive tool (Quick Bill Estimator, 6-Step `/deploy` Design Studio, Specs Drawer) empowers the customer to explore independently before speaking to a solar advisor.

---

## 2. How WAVENOX Is Distinct From Tesla (Originality & Brand Expression)

While WAVENOX learns from Tesla's **compositional restraint, typographic clarity, and monochrome UI discipline**, WAVENOX must never look or read like an unauthorized duplicate of Tesla's website.

| Dimension                         | Tesla Reference Benchmark                                                                   | WAVENOX Original Brand Expression                                                                                                                                                                                                                        |
| --------------------------------- | ------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Architectural Context**         | North American pitched asphalt/composite roofs, suburban cul-de-sacs, timber-frame garages. | **Contemporary Indian Architecture:** Flat RCC terraces, usable shaded rooftop pergolas, sandstone/concrete/teak villas, Deccan boulder landscapes, and high-clearance pre-engineered industrial sheds.                                                  |
| **Roof Usage Reality**            | Sloped roofs are non-habitable surfaces viewed only from the street.                        | **The Indian Terrace Is Living Space:** WAVENOX highlights elevated galvanized/anodized pergolas that preserve terrace walkability, evening gathering space, and non-penetrating waterproofing integrity.                                                |
| **Climate & Physics Story**       | General all-weather durability and snow/hail resistance.                                    | **Built for 45°C Indian Summers & Monsoon Gusts:** Focuses on N-Type TOPCon thermal coefficient (`-0.30%/°C`), dust/soiling mitigation, `158 km/h` cyclone/monsoon wind ratings, and `IP68` junction protection.                                         |
| **Energy Storage Hardware**       | Wall-mounted single-unit Powerwall enclosure with proprietary Tesla branding.               | **Modular Hybrid LFP Architecture:** Floor-standing or wall-integrated matte-graphite LiFePO4 stacks (`14.3 kWh` to `28.6 kWh`) paired with three-phase hybrid inverters designed to run 1.5-ton inverter ACs and domestic pumps silently.               |
| **Commercial & Regulatory Model** | Standardized US deposit checkout + federal ITC tax credit assumptions.                      | **Indian DISCOM & Subsidy Intelligence:** Telescopic slab modeling (`TGSPDCL`, `TGNPDCL`, `APCPDCL`, `APEPDCL`, `APSPDCL`), Clause 8.1.3 export settlement (`₹2.57/kWh` in Telangana), PM Surya Ghar `₹78,000` DBT cap, and Section 32 C&I depreciation. |
| **Service & Fulfilment Model**    | Direct manufacturer-owned fleet claim.                                                      | **Coordinated Engineering & Authorized Partner Network:** Transparently explains that WAVENOX coordinates system engineering, tariff modeling, and commissioning alongside vetted local installation partners and Tier-1 OEMs.                           |

---

## 3. Visual Mood & Material Palette

The WAVENOX visual world combines **cool monochrome precision** in the digital interface with **warm natural Indian materiality** inside the photography:

- **Interface Canvas (Cool & Quiet):** Pure white (`#FFFFFF`), warm alabaster (`#F4F4F4`), hairline stone borders (`#E3E4E6`), and deep obsidian ink (`#171A20`).
- **Photographic Palette (Warm & Grounded):**
  - _Stone & Earth:_ Warm beige sandstone, exposed grey-charcoal microcement, weathered Deccan granite boulders, terracotta courtyard tiles.
  - _Wood & Foliage:_ Oiled Burma/Indian teak louvers, neem and palm canopies, bougainvillea accents.
  - _Solar & Sky:_ Deep anti-reflective matte-black monocrystalline silicon cells, black anodized aluminum frames, golden-hour amber horizon light, and crisp blue-hour dusk skies.
- **Data Accent (Restrained Solar Amber):** Used exclusively for live energy-flow telemetry indicators (`#F57C00` graphic nodes) and verified active states (`#B45309` accessible text)—never as decorative background gradients or neon glows.

---

## 4. Typography Direction

1. **Retain Self-Hosted `Inter Variable`:** WAVENOX's existing `Inter Variable` setup (`src/styles.css`) is open-licensed, preloaded with zero FOIT/CLS, and provides native optical sizing and `tabular-nums`. Do not introduce proprietary or third-party fonts.
2. **Medium-Weight (`500`) Authority:** All display (`h1`), section (`h2`), and card (`h3`) headings use `font-weight: 500` with tight negative tracking (`-0.025em` to `-0.015em`). Avoid heavy `700`/`800` bold headings, which feel loud and promotional.
3. **Strict Line-Length & Column Floor:**
   - Narrative paragraphs must stay between **`45ch` and `65ch`** (`max-w-[540px]` to `max-w-[640px]`).
   - Multi-column grid cards must never compress body text narrower than **`28ch`** (eliminating the `16ch` 6-column squeeze in `#process`).
   - Buttons must maintain **`whitespace-nowrap`** on desktop and tablet so CTA labels never wrap onto two lines (`EV-WVX-09`).
4. **12px Minimum Floor:** Every eyebrow, footnote, badge, and legal disclaimer must compute to `>= 12px` (`0.75rem`) across all viewports.

---

## 5. Spatial Composition Rules

1. **Controlled Full-Screen Panel Budget:** Limit the homepage to **3 full-viewport (`100svh`) `<Panel>` sections** (Hero, Rooftop Architecture, Solar + Battery) plus **1 closing conversion panel (`75svh–85svh`)**, separated by open `<QuietSection>` blocks. This eliminates back-to-back full-screen fatigue.
2. **No Card-in-Card Nesting:** Inside `<QuietSection>`, do not place bordered cards inside bordered containers. Use open column alignment (`gap-8 lg:gap-12`) separated by subtle `1px` `#E3E4E6` horizontal hairlines.
3. **Middle-Third Subject Safe Zone (`32%–64%`):** On every `<Panel>` (both desktop `16:9` and mobile `9:16`), the primary architectural subject (roofline + solar array) must sit inside the middle vertical band (`32%` to `64%` from top) so it never collides with the top headline (`12%–26%`) or the bottom stat/CTA cluster (`68%–94%`).
4. **Maximum Two CTAs Per Section Cluster:** Never render 6 buttons in a 3-column grid. Each solution path gets 1 clear link; each full-bleed panel gets at most 1 primary + 1 secondary button.

---

## 6. Interaction Philosophy

1. **Purposeful, Calm Motion:**
   - MegaMenu curtain and mobile slide-over sheets use smooth `280ms–320ms` `cubic-bezier(0.16, 1, 0.3, 1)` transitions.
   - `<Reveal>` should implement a subtle, CSS/IntersectionObserver entrance (`opacity: 0 -> 1`, `translateY(12px -> 0)` over `500ms`) that immediately disables itself when `prefers-reduced-motion: reduce` is active or during SSR/initial above-the-fold render (so LCP is never delayed).
2. **Zero Scroll Hijacking:** Never trap scroll events, hijack wheel velocity, or force horizontal carousels on desktop.
3. **Instant Interactive Feedback:** The Quick Bill Estimator slider (`#savings`) and `/deploy` Design Studio controls update tabular numerals synchronously (`0ms` artificial delay) and pass state seamlessly via URL query parameters (`?bill=&discom=`).

---

## 7. Copyright, Brand & Realism Safeguards (Mandatory Compliance Checklist)

| Safeguard Rule                            | Enforcement Standard for Phase 1+                                                                                                                                                                                    |
| ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **No Tesla Visual Assets or Renders**     | Zero images, videos, CSS sprites, or product enclosures from `tesla.com` may ever be used.                                                                                                                           |
| **No Proprietary Tesla Fonts or Marks**   | Retain open-licensed `Inter Variable` and WAVENOX's original geometric wordmark (`BrandLogo.tsx`).                                                                                                                   |
| **No Confusing Hardware Imitation**       | Battery storage imagery must depict modular matte-graphite rack/stack LFP enclosures (`og-core.jpg` style) with generic OEM hybrid inverters—never a white/silver monolithic wall pack resembling a Tesla Powerwall. |
| **No Fabricated Customer Installations**  | Architectural renders and commissioned site visualisations must never be labeled as specific named customer homes or fake case-study addresses.                                                                      |
| **No Invented Certifications or Metrics** | Only cite verified regulatory schedules (TGERC Proceeding 29.12.2025, APERC, MNRE PM Surya Ghar) and standard Tier-1 OEM datasheet boundaries (`docs/CLAIM_EVIDENCE_MATRIX.md`).                                     |
