# WAVENOX — Visual Design System & Showroom Manual (`design.md`)

---

## 1. Design Philosophy: Clean-Technology Showroom Restraint

The WAVENOX visual language is built upon the restraint, stillness, and spatial discipline of a premium clean-technology showroom, anchored entirely in an authentic Indian residential and industrial context.

### Core Principles

1. **One Idea Per Screen**: Every marketing section communicates a single concept cleanly. No multi-tier competing cards, no badge clutter, and no visual noise.
2. **The Photograph Sells**: Real, high-resolution photography commands the user's attention. Text sits peacefully on natural gradients or quiet backdrops.
3. **Typography as Structure**: Hierarchy is achieved through size, tracking, and weight contrast using **Inter Variable** (`400` body, `500` headings and buttons, `600` tabular numbers). We never use font weight 700 for headlines.
4. **No Text Below 12px**: Every single label, footnote, legal disclaimer, and caption on the site meets or exceeds `12px` (computed) to guarantee legibility and accessibility.
5. **Numbers Large & Unboxed**: Key performance indicators, financial savings, and battery capacities are presented as bold statistics with value stacked vertically above the label (`<StatRow>`). We never wrap numbers inside bordered cards or gradient boxes in marketing sections.
6. **Strict Monochrome with Amber Data Accent**: The palette is strictly neutral monochrome (`--ink`, `--muted`, `--surface`, `--white`). Accent amber (`#F57C00`) is used **exclusively** for live energy telemetry flows and power status indicators.

---

## 2. Design Tokens & Palette

Defined in `src/styles.css` with Tailwind v4 `@theme` integration:

### 2.1 Colors

| Token | Hex Value | Purpose |
| :--- | :--- | :--- |
| `--ink` | `#171A20` | Primary display headlines, dark buttons, deep contrast |
| `--ink-2` | `#393C41` | Secondary headings, borders on dark panels |
| `--muted` | `#5C5E62` | Descriptive leads, metadata, stat labels, disclaimers |
| `--line` | `#E3E4E6` | Subtle dividers, segmented control borders |
| `--surface` | `#F4F4F4` | Quiet section backgrounds, neutral interactive pads |
| `--white` | `#FFFFFF` | Canvas backdrop, primary card containers, light buttons |
| `--accent` | `#F57C00` | Energy flow marks, battery telemetry, real-time pulses |
| `--danger` | `#B42318` | Validation errors and statutory warnings |

### 2.2 Fluid Clamp Typography Scale

Scale interpolates smoothly between 390px mobile viewports and 1440px desktop displays:

- **Display**: `clamp(36px, 4vw, 48px)`, weight 500, line-height 1.1, tracking `-0.015em`
- **Title**: `clamp(28px, 3vw, 40px)`, weight 500, line-height 1.15, tracking `-0.01em`
- **Lead**: `clamp(15px, 1.5vw, 17px)`, weight 400, line-height 1.5
- **Body**: `clamp(14px, 1.2vw, 15px)`, weight 400, line-height 1.6
- **Stat Value**: `clamp(24px, 2.5vw, 32px)`, weight 500/600, tabular numbers, line-height 1.2
- **Label**: `clamp(12px, 1vw, 13px)`, weight 400, color `--muted`, line-height 1.4

### 2.3 Geometry & Rhythm

- **Button Height**: Exactly `40px` (`h-10`).
- **Button Radius**: Exactly `4px` (`rounded-[4px]`).
- **Button Padding**: `px-6` (24px horizontal).
- **Desktop Button Min-Width**: `min-w-[200px]` with `whitespace-nowrap`.
- **Transitions**: `150ms` ease for color changes.

---

## 3. System Components Directory (`src/components/system/`)

| Component | File | Description |
| :--- | :--- | :--- |
| `<Button>` | `Button.tsx` | Showroom poly-component rendering TanStack `<Link>`, `<a>`, or `<button>`. Supports `primary` \| `secondary` variants across `light` and `dark` image tones with 2px offset focus rings. |
| `<Media>` | `Media.tsx` | Responsive `<picture>` rendering AVIF, WebP, and JPG source sets across breakpoints [640w, 1080w, 1600w, 2400w] with 4:5 mobile portrait crops and explicit dimensions for 0 CLS. |
| `<Panel>` | `Panel.tsx` | Full-bleed 100svh showroom panel with top title/lead, background photography, subtle directional scrims, and bottom docked `<StatRow>` + buttons. |
| `<QuietSection>` | `QuietSection.tsx` | Generously padded section (`py-20 md:py-32`) with `--white` or `--surface` backdrop for calculators, steps, and interactive widgets. |
| `<StatRow>` | `StatRow.tsx` | Unboxed horizontal sequence of 1 to 3 clean numbers with value positioned directly above label. |
| `<Reveal>` | `Reveal.tsx` | Subtle viewport entrance animation (+12px rise and fade) that respects `prefers-reduced-motion`. |
| `<TextLink>` | `TextLink.tsx` | Minimal text link with 4px underline offset and optional trailing arrow (`→`). |
| `<SpecsDrawer>` | `SpecsDrawer.tsx` | Full-height Radix Dialog right sheet displaying verified hardware datasheets and engineering specs. |
| `<Faq>` | `Faq.tsx` | Hairline Radix Accordion with 16px weight 500 questions and concise answers (≤ 60 words). |

---

## 4. Photographic Guidelines & Master Shots

All imagery reflects authentic Indian clean-technology environments. Documented in `docs/SHOT_LIST.md` and compiled automatically via `scripts/build-images.mjs` using `sharp`:

1. `home-hero`: Contemporary Jubilee Hills / Bengaluru villa with flat RCC roof and low-profile black bifacial solar array.
2. `home-design`: Architectural terrace detail showing concealed mounting rails and hidden cable raceways.
3. `home-outage`: Dusk neighborhood power-cut contrast with a brightly illuminated WAVENOX home powered by Omnigrid.
4. `home-heat`: High-efficiency N-type TOPCon bifacial cells producing through extreme 42°C Deccan summer afternoon heat.
5. `home-final`: Twilight terrace gathering beneath an elevated solar pergola canopy.
6. `omnigrid-hero`: Graphite wall-mounted Omnigrid battery storage unit in a clean utility space with live LED indicator.
7. `homes-hero`: Independent multi-story residential home with complete turnkey rooftop solar installation.
8. `commercial-hero`: Multi-megawatt industrial manufacturing facility rooftop array engineered for daytime load offset.

### Performance Budgets

- Hero AVIF at 1600w: **≤ 250 KB**
- Secondary Panels AVIF at 1600w: **≤ 180 KB**
- Dedicated mobile portrait crop (aspect 4:5) for viewports `≤ 768px`.

---

## 5. Automated QA Budgets & Thresholds

Automated verification is enforced via `scripts/qa-metrics.mjs` running in Playwright across Desktop (1440×900) and Mobile (390×844):

| Metric | Budget / Threshold | Verification Tool |
| :--- | :--- | :--- |
| **Home Page Word Count** | ≤ 450 words | `qa-metrics.mjs` (Actual: 440 desktop / 434 mobile) |
| **Subpage Word Count** | ≤ 350 words | `qa-metrics.mjs` (Actual: 167 – 216 words) |
| **Home Page Icon Count** | ≤ 8 icons | `qa-metrics.mjs` (Actual: 4 icons) |
| **CTA Count** | Order CTAs ≤ 6, Consultation CTAs ≤ 3 | `qa-metrics.mjs` (Actual: 6 Order, 2 Consultation) |
| **Minimum Text Size** | 0 elements < 12px computed font size | `qa-metrics.mjs` (Actual: 0 violations) |
| **Horizontal Overflow** | `scrollWidth <= clientWidth` | `qa-metrics.mjs` (Actual: 0 overflow) |
| **Typeface** | Inter Variable loaded | `document.fonts.check()` |
| **Unit Test Suite** | 100% passing tests | `vitest run` (9/9 tests pass) |
| **Type Check** | 0 TypeScript errors | `npx tsc --noEmit` |
| **Linter** | 0 ESLint errors | `npm run lint` |
| **Production Build** | Nitro Cloudflare target | `npm run build` |
