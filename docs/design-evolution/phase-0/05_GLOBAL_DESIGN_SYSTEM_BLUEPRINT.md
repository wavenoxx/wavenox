# PHASE 0 — DELIVERABLE 5: GLOBAL DESIGN SYSTEM BLUEPRINT

**Document ID:** `05_GLOBAL_DESIGN_SYSTEM_BLUEPRINT.md`  
**Verified Repository Commit:** `c01704c1b3298361b796558aa629cc18cb632ba0`  
**Audit Branch:** `docs/wavenox-phase0-design-blueprint`  
**Implementation Status:** Blueprint Specification Only (No Phase 0 Runtime Component Changes)

---

## 1. Typography Specification (`Inter Variable`)

### 1.1 Font-Family Strategy

- **Primary UI & Display Stack:** `'Inter Variable', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
- **Asset Delivery:** Self-hosted WOFF2 (`/fonts/inter-latin-wght-normal.woff2`, `font-display: swap`, preloaded in `src/routes/__root.tsx`).
- **OpenType Features:**
  - `font-feature-settings: "cv02", "cv03", "cv04", "cv11"` for clean geometric numeral and character forms.
  - `font-variant-numeric: tabular-nums` mandatory on all prices, kW capacities, percentages, bill sliders, and stat bars.

### 1.2 Complete Typographic Scale & Line-Length Rules

| Role                      | Token / Class         | Mobile (`320px–767px`)              | Tablet (`768px–1023px`) | Desktop (`1024px+`)  | Weight | Line Height | Letter Spacing             | Max Line Length                   |
| ------------------------- | --------------------- | ----------------------------------- | ----------------------- | -------------------- | ------ | ----------- | -------------------------- | --------------------------------- |
| **Display H1 (Hero)**     | `.text-display`       | `34px` (`2.125rem`)                 | `42px` (`2.625rem`)     | `48px` (`3.0rem`)    | `500`  | `1.08`      | `-0.025em`                 | `18ch–24ch` (`max-w-[640px]`)     |
| **Section H2**            | `.text-headline`      | `26px` (`1.625rem`)                 | `32px` (`2.0rem`)       | `40px` (`2.5rem`)    | `500`  | `1.12`      | `-0.02em`                  | `22ch–30ch` (`max-w-[680px]`)     |
| **Card / Feature H3**     | `.text-title`         | `20px` (`1.25rem`)                  | `22px` (`1.375rem`)     | `24px` (`1.5rem`)    | `500`  | `1.25`      | `-0.015em`                 | `26ch–36ch`                       |
| **Lead Copy**             | `.text-body-lg`       | `15px` (`0.9375rem`)                | `16px` (`1.0rem`)       | `17px` (`1.0625rem`) | `400`  | `1.55`      | `-0.005em`                 | `48ch–60ch` (`max-w-[560px]`)     |
| **Body Copy**             | `.text-body`          | `14px` (`0.875rem`)                 | `15px` (`0.9375rem`)    | `15px` (`0.9375rem`) | `400`  | `1.6`       | `0em`                      | `45ch–65ch` (min column `28ch`)   |
| **Captions & Sub-labels** | `.text-caption`       | `13px` (`0.8125rem`)                | `13px` (`0.8125rem`)    | `13px` (`0.8125rem`) | `400`  | `1.5`       | `0em`                      | `40ch–65ch`                       |
| **Eyebrow Labels**        | `.text-eyebrow`       | `12px` (`0.75rem`)                  | `12px` (`0.75rem`)      | `12px` (`0.75rem`)   | `500`  | `1.4`       | `0.08em` (UPPERCASE)       | `35ch`                            |
| **Numerical Stat Value**  | `StatRow` value       | `20px` (`320px`) / `22px` (`390px`) | `26px` (`1.625rem`)     | `30px–32px`          | `500`  | `1.1`       | `-0.02em` (`tabular-nums`) | Single line (`whitespace-nowrap`) |
| **Legal Disclosures**     | Footnote / fine print | `12px` (`0.75rem`)                  | `12px` (`0.75rem`)      | `12px` (`0.75rem`)   | `400`  | `1.5`       | `0.01em`                   | `60ch–75ch` (`max-w-[680px]`)     |
| **Buttons / CTAs**        | `Button`              | `14px` (`0.875rem`)                 | `14px` (`0.875rem`)     | `14px` (`0.875rem`)  | `500`  | `1.0`       | `0.01em`                   | Single line (`whitespace-nowrap`) |
| **Top Navigation**        | `Header` nav link     | `15px` (in drawer)                  | `15px` (in drawer)      | `14px` (top rail)    | `500`  | `1.2`       | `0em`                      | Single line (`whitespace-nowrap`) |

> **Hard Accessibility Floor:** No rendered text element anywhere in the DOM may compute below **`12px` (`0.75rem`)**.

---

## 2. Color System Specification

### 2.1 Approved Token Palette (`src/styles.css`)

| Token                 | Hex / Value | Permitted Usage                                                                                                       | Prohibited Usage                                                                           |
| --------------------- | ----------- | --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `--bg-canvas`         | `#FFFFFF`   | Primary light section background, primary button fill on dark panels (`light` variant), MegaMenu background.          | Never use without contrast-checked text (`#171A20` or `#393C41`).                          |
| `--bg-surface`        | `#F4F4F4`   | Alternating quiet section surface, input well background, subtle stat tiles.                                          | Do not nest `#F4F4F4` boxes inside `#F4F4F4` sections.                                     |
| `--bg-obsidian`       | `#171A20`   | Full-viewport `<Panel>` fallback canvas, primary text on light backgrounds, primary button fill on light backgrounds. | —                                                                                          |
| `--text-primary`      | `#171A20`   | Headings (`h1`–`h4`), primary metrics, active navigation text on light surfaces (`17.4:1` on `#FFFFFF`).              | Never use on dark `<Panel>` backgrounds.                                                   |
| `--text-secondary`    | `#393C41`   | Standard body paragraphs and descriptions on `#FFFFFF` (`10.9:1`) or `#F4F4F4` (`9.7:1`).                             | —                                                                                          |
| `--text-muted`        | `#5C5E62`   | Eyebrow labels, footnotes, regulatory disclosures, inactive metadata (`6.4:1` on `#FFFFFF`, `5.7:1` on `#F4F4F4`).    | Never use over photographic backgrounds (use `rgba(255,255,255,0.82)` with scrim instead). |
| `--border-subtle`     | `#E3E4E6`   | `1px` section dividers, accordion rules, input borders, subtle card outlines.                                         | Avoid `2px+` heavy decorative borders.                                                     |
| `--accent-solar`      | `#F57C00`   | Non-text telemetry graphics, active slider thumb accent, subtle status dot.                                           | **Never** use for body text or small labels on white/light backgrounds (fails 4.5:1).      |
| `--accent-solar-text` | `#B45309`   | Verified tariff/status text labels on light surfaces (`5.02:1` on `#FFFFFF`), active navigation indicator.            | Do not use for large background fills.                                                     |
| `--accent-error`      | `#B42318`   | Form validation error text and input error border (`6.1:1` on `#FFFFFF`).                                             | —                                                                                          |

### 2.2 Required Color Cleanup in Phase 1

- **Remove off-palette pastel green in `#savings` (`src/routes/index.tsx#L244-L250`):** Replace `bg-emerald-50 text-emerald-800 border-emerald-200` on the `Verified TGERC Schedule` badge with a monochrome `#F4F4F4` surface pill (`border-[#E3E4E6] text-[#171A20]`) featuring a `6px` `#B45309` indicator dot.

---

## 3. Responsive Layout & Spatial Specification Across Six Viewports

| Viewport          | Horizontal Gutters | Max Content Width           | `<Panel>` Top / Bottom Padding                           | `<QuietSection>` Vertical Padding | Grid Columns & Gap               | Button Layout                            |
| ----------------- | ------------------ | --------------------------- | -------------------------------------------------------- | --------------------------------- | -------------------------------- | ---------------------------------------- |
| **`320 × 720`**   | `16px` (`px-4`)    | `100%` (`288px` inner)      | `pt-16 pb-5` (`64px` / `20px`)                           | `py-14` (`56px`)                  | 1 col (`gap-6` / `24px`)         | Full-width stacked (`w-full`, `gap-2.5`) |
| **`390 × 844`**   | `24px` (`px-6`)    | `100%` (`342px` inner)      | `pt-20 pb-6` (`80px` / `24px`)                           | `py-16` (`64px`)                  | 1 col (`gap-6` / `24px`)         | Full-width stacked (`w-full`, `gap-3`)   |
| **`768 × 1024`**  | `32px` (`px-8`)    | `704px`                     | `pt-24 pb-8` (`96px` / `32px`)                           | `py-20` (`80px`)                  | 2 cols (`gap-8` / `32px`)        | Side-by-side (`min-w-[200px]`, `gap-4`)  |
| **`1024 × 768`**  | `40px` (`px-10`)   | `944px`                     | `pt-20 pb-6` (`80px` / `24px` to protect `768px` height) | `py-20` (`80px`)                  | 3 or 12 cols (`gap-8` / `32px`)  | Side-by-side (`min-w-[200px]`, `gap-4`)  |
| **`1440 × 900`**  | `48px` (`px-12`)   | `1344px` (`max-w-[1440px]`) | `pt-24 pb-8` (`96px` / `32px`)                           | `py-24` (`96px`)                  | 3 or 12 cols (`gap-10` / `40px`) | Side-by-side (`min-w-[216px]`, `gap-4`)  |
| **`1920 × 1080`** | `48px` (`px-12`)   | `1344px` (`max-w-[1440px]`) | `pt-28 pb-10` (`112px` / `40px`)                         | `py-28` (`112px`)                 | 3 or 12 cols (`gap-12` / `48px`) | Side-by-side (`min-w-[224px]`, `gap-4`)  |

### 3.1 Hero & `<Panel>` Safe-Zone Geometry

- **Top Copy Block (`12%–26%` viewport height):** Holds optional eyebrow, `h1`/`h2` heading, and 1-sentence subtitle (`max-w-[600px]`, `mx-auto`).
- **Center Photographic Band (`28%–66%` viewport height):** Reserved strictly for the architectural subject (roofline + solar array). Zero text or buttons may intrude into this zone on any viewport (`320px` through `1920px`).
- **Bottom Action & Metric Cluster (`68%–94%` viewport height):** Holds `<StatRow>` (max 3 items, compact `mb-4 md:mb-6`) + 2 `<Button>` actions + 1-line footnote (`12px`).

---

## 4. Component Strategy (`KEEP` / `REFINE` / `RESTRUCTURE` / `REPLACE WITH JUSTIFICATION`)

| Component                                                          | Verdict           | Technical & Design Rationale                                                                                                                                                                                                                   | Phase 1 Target Scope                                                                                                                                                                                                                                                                  |
| ------------------------------------------------------------------ | ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`BrandLogo`** (`src/components/BrandLogo.tsx`)                   | **KEEP**          | Clean, original geometric SVG wordmark (`viewBox="0 0 230 20"`), crisp rendering at all DPIs, zero external dependencies.                                                                                                                      | No changes needed.                                                                                                                                                                                                                                                                    |
| **`Header`** (`src/components/Header.tsx`)                         | **KEEP / REFINE** | `56px` fixed height, transparent-to-solid transition (`scrollY > 40`), Region Globe modal, and 2-level Radix mobile drawer (`EV-WVX-08`) work cleanly.                                                                                         | Keep structure; ensure keyboard `Escape` and focus return from MegaMenu remain seamless.                                                                                                                                                                                              |
| **`MegaMenu`** (`src/components/MegaMenu.tsx`)                     | **REFINE**        | Curtain animation (`300ms`) and backdrop blur are high quality (`EV-WVX-07`), but each card currently renders two redundant sub-links (`Learn · Get Estimate`) and the `Elevated Solar Pergola` card reuses `res-hero` (which has no pergola). | Make each visual card a single unified `<Link>` target; deduplicate right-rail links from 7 down to 4–5 distinct routes; update pergola thumbnail once new terrace asset is built.                                                                                                    |
| **`Panel`** (`src/components/system/Panel.tsx`)                    | **REFINE**        | Core `100svh` showroom primitive is solid. However, on `320×720` and `390×844` (`EV-WVX-01`, `EV-WVX-02`), the bottom block (`StatRow` + 2 buttons + footnote) rises too high and overlaps the hero villa.                                     | Tighten mobile bottom spacing (`gap` between `StatRow` and CTA stack), strengthen the lower mobile linear scrim (`from-[#171A20]/95 via-[#171A20]/65`), and support an optional `height="closing"` (`min-h-[80svh]`) variant for Scene 8.                                             |
| **`QuietSection`** (`src/components/system/QuietSection.tsx`)      | **KEEP**          | Clean semantic container supporting `bg="white"`, `bg="surface"`, and `bg="obsidian"` with consistent `max-w-[1440px]` gutters.                                                                                                                | No structural changes needed.                                                                                                                                                                                                                                                         |
| **`Media`** (`src/components/system/Media.tsx`)                    | **KEEP / REFINE** | Properly serves `<picture>` with mobile portrait `<source media="(max-width: 767px)">` and multi-width AVIF/WebP srcsets.                                                                                                                      | Keep `<Media>` component; fix the `<link rel="preload">` tags in route `head()` functions (`index.tsx`, `residential.tsx`, `omnigrid.tsx`, `enterprise.tsx`) to preload `.avif` instead of `.webp`.                                                                                   |
| **`Button`** (`src/components/system/Button.tsx`)                  | **REFINE**        | Meets WCAG 2.2 target size (`min-h-[44px] h-11`) with 4 clean variants (`primary`, `secondary`, `light`, `glass`). However, inside narrow 3-column cards (`EV-WVX-09`), text wraps onto 2 lines.                                               | Add `whitespace-nowrap` to `Button` base classes; update legacy `.btn-primary` in `src/styles.css` from `40px` to `44px` to match `Button.tsx`.                                                                                                                                       |
| **`StatRow`** (`src/components/system/StatRow.tsx`)                | **REFINE**        | Clean tabular-nums layout, but on `320×720` (`EV-WVX-01`) 3-line uppercase labels (`MAX CENTRAL SUBSIDY*`) make the stat block tall enough to collide with the hero house.                                                                     | Slightly compact mobile label line-height/margin (`mt-0.5`, concise 2-word mobile labels where needed) so the 3-column stat bar stays low in the frame.                                                                                                                               |
| **`Reveal`** (`src/components/system/Reveal.tsx`)                  | **REFINE**        | Currently a no-op pass-through (`return <div className={className}>{children}</div>`) that ignores `delay`, `yOffset`, and `immediate`.                                                                                                        | Implement a lightweight, SSR-safe IntersectionObserver / CSS reveal (`translateY(12px) -> 0`, `opacity: 0 -> 1` over `500ms` `cubic-bezier(0.16, 1, 0.3, 1)`) that immediately renders visible when `immediate={true}` (hero LCP) or when `prefers-reduced-motion: reduce` is active. |
| **`Faq`** (`src/components/system/Faq.tsx`)                        | **KEEP**          | Accessible `@radix-ui/react-accordion` with `44px` triggers, clean `1px` dividers, and smooth `+`/`×` icon rotation.                                                                                                                           | No changes needed.                                                                                                                                                                                                                                                                    |
| **`SpecsDrawer`** (`src/components/SpecsDrawer.tsx`)               | **KEEP**          | Clean slide-over sheet keeping dense electrical/mechanical datasheets accessible without cluttering the homepage scroll.                                                                                                                       | Trigger directly from Scene 3 (`Beautiful Rooftop Integration`).                                                                                                                                                                                                                      |
| **`ConsultationDrawer`** (`src/components/ConsultationDrawer.tsx`) | **KEEP**          | Protected lead-capture drawer with explicit consent, attribution capture, and `LIVE`/`DEMO` mode handling.                                                                                                                                     | Preserve 100% of form logic, validation, and backend submission behavior.                                                                                                                                                                                                             |
| **`Footer`** (`src/components/Footer.tsx`)                         | **REFINE**        | Well-structured 4-column directory, but repeats `/legal/disclosures` 3 times and `/faq` twice.                                                                                                                                                 | Deduplicate repeated links so each column presents 4–5 distinct, high-value destinations.                                                                                                                                                                                             |
