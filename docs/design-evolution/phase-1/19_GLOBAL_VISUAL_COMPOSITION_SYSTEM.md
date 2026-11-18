# PHASE 1 — DELIVERABLE 19: WAVENOX GLOBAL VISUAL COMPOSITION SYSTEM

**Document ID:** `19_GLOBAL_VISUAL_COMPOSITION_SYSTEM.md`
**Repository:** `https://github.com/wavenoxx/wavenox`
**Branch:** `feat/wavenox-premium-design-dna-realignment`
**Creative Identity:** **WAVENOX — Architectural Energy, Beautifully Integrated.**

---

## 1. Brand Expression & Creative Boundary

WAVENOX establishes an independent Indian architectural solar design language inspired by the compositional restraint of leading clean-energy platforms while remaining 100% original in its photography, typography, copywriting, and regulatory transparency:

- **Independent Visual Identity:** Uses self-hosted `Inter Variable` (`cv02`, `cv03`, `cv04`, `cv11`, `ss01`), original Indian architectural photography (Deccan sandstone villas, RCC flat-slab terraces, tropical foliage, and industrial rooftops), and Indian regulatory intelligence (MNRE PM Surya Ghar DBT subsidies, TGERC/APERC telescopic tariffs, and IS 875 wind load engineering).
- **Zero Proprietary Duplication:** No Tesla fonts, logos, copy, icons, vehicle imagery, US incentive claims, or proprietary source code are used anywhere in the system.

---

## 2. Monochrome-First Color Architecture

Over 95% of the interface shell is rendered in six achromatic values so that natural sunlight, sandstone warmth, twilight interiors, and lush landscaping inside the photography provide the primary color energy:

| Token                          | Hex                   | Semantic Role                                                                                                 |
| ------------------------------ | --------------------- | ------------------------------------------------------------------------------------------------------------- |
| `--ink` / `--text-primary`     | `#171A20`             | Primary dark text, dark photographic panel surfaces, and primary light-mode CTA background                    |
| `--ink-2` / `--text-secondary` | `#393C41`             | Secondary body copy, lead paragraphs, and accordion content                                                   |
| `--muted` / `--text-muted`     | `#5C5E62`             | Eyebrow labels, technical footnotes, unit captions, and regulatory disclosures                                |
| `--line` / `--border-subtle`   | `#E3E4E6`             | `1px` architectural hairlines, table dividers, and card boundaries (`#D8DADC` on `#F4F4F4` surfaces)          |
| `--surface` / `--bg-surface`   | `#F4F4F4`             | Quiet editorial section background (`#design`, `#savings`, `#faq`)                                            |
| `--white` / `--bg-canvas`      | `#FFFFFF`             | Primary light canvas (`#solutions`, `#monitoring`, `#process`, `Footer`) and dark-mode primary button surface |
| `--accent` / `--accent-text`   | `#F57C00` / `#B45309` | Restrained functional status indicator (verified tariff schedule dot, net-metering label, contact icons)      |

---

## 3. Precision Fluid Typography System (`Inter Variable`)

All headings use **Medium (`500`)** weight rather than heavy bold (`700–800`), relying on scale, negative tracking, and surrounding whitespace for authority. Fluid `clamp()` tokens use `rem` bounds where the maximum never exceeds `2.5×` the minimum (preserving WCAG 1.4.4 200% browser zoom and WCAG 1.4.12 text spacing):

| Role                        | CSS Token / Utility              | Mobile (`320px–390px`)             | Desktop (`1440px+`)                | Weight        | Line Height | Tracking                   | Measure Cap                      |
| --------------------------- | -------------------------------- | ---------------------------------- | ---------------------------------- | ------------- | ----------- | -------------------------- | -------------------------------- |
| **Hero Display (`H1`)**     | `--text-display`                 | `30px–34px` (`1.875rem–2.125rem`)  | `52px–54px` (`3.25rem–3.375rem`)   | `500`         | `1.06`      | `-0.028em`                 | `<= 22ch` (`text-balance`)       |
| **Section Headline (`H2`)** | `--text-headline`                | `26px–28px` (`1.625rem–1.75rem`)   | `42px–44px` (`2.625rem–2.75rem`)   | `500`         | `1.10`      | `-0.024em`                 | `<= 26ch–28ch` (`text-balance`)  |
| **Feature Title (`H3`)**    | `--text-title`                   | `20px–22px` (`1.25rem–1.375rem`)   | `22px–26px` (`1.375rem–1.625rem`)  | `500`         | `1.20`      | `-0.018em`                 | `<= 32ch`                        |
| **Section Lead**            | `--text-lead`                    | `14px–15px` (`0.875rem–0.9375rem`) | `17px–18px` (`1.0625rem–1.125rem`) | `400`         | `1.55–1.60` | `-0.005em`                 | `<= 58ch–64ch` (`text-pretty`)   |
| **Editorial Body**          | `--text-body`                    | `14px` (`0.875rem`)                | `15px–16px` (`0.9375rem–1rem`)     | `400`         | `1.60`      | `0em`                      | `<= 60ch` (`text-pretty`)        |
| **Stat Numerals**           | `--text-stat-value`              | `20px–30px` (`1.25rem–1.875rem`)   | `32px–40px` (`2rem–2.5rem`)        | `500`         | `1.10`      | `-0.025em`                 | `tabular-nums whitespace-nowrap` |
| **Eyebrows & Footnotes**    | `--text-label` / `.text-eyebrow` | `12px` (`0.75rem` hard floor)      | `12px–13px` (`0.75rem–0.8125rem`)  | `500` / `400` | `1.40–1.55` | `0.06em–0.08em` (eyebrows) | `<= 68ch`                        |

---

## 4. Responsive Spatial & Grid System

| Dimension                         | Mobile (`320px–768px`)                  | Desktop (`1024px–1920px`)                    | Implementation Contract                                                                                                                   |
| --------------------------------- | --------------------------------------- | -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| **Horizontal Page Gutters**       | `20px` (`px-5` / `1.25rem`)             | `32px–48px` (`sm:px-8 lg:px-12`)             | Unified across `Panel`, `QuietSection`, `#design`, and `Footer`.                                                                          |
| **Editorial Container Width**     | `100%`                                  | `1240px` (`max-w-[1240px]`)                  | Standard container for `#solutions`, `#design`, `#monitoring`, `#process`, `#faq`, and `Footer`; `1080px` for `#savings` financial sheet. |
| **Quiet Section Vertical Rhythm** | `64px–80px` (`py-16 sm:py-20`)          | `96px–128px` (`md:py-24 lg:py-32`)           | Consistent breathing room between narrative stages.                                                                                       |
| **Button Touch Geometry**         | `min-h-[44px] py-2.5` (`rounded-[4px]`) | `min-h-[44px] py-2.5 px-7` (`rounded-[4px]`) | Uses `min-height: 44px` without rigid fixed `height` so labels never clip under 200% zoom or WCAG 1.4.12 text-spacing overrides.          |

---

## 5. Five-Pattern Photographic Presentation Grammar

Rather than turning every image into an overlaid wallpaper or stuffing images into small bordered cards, the homepage alternates deliberately among five presentation patterns:

1. **Pattern A — Signature Cinematic Hero / Twilight Panel (`#solar-panels`, `#outage-protection`, `#consultation`)**
   - Full-bleed photography (`100svh` desktop; exact `1122:1402` portrait frame on mobile `#solar-panels`) where copy is strictly confined to the upper sky safe zone (`0%–24%`) and lower foreground dock (`80%–100%`), leaving the central architectural subject (`25%–78%`) completely unobstructed.
2. **Pattern B — Large Editorial Architectural Frame (`#design`)**
   - A full `1240px` inset `16:9` photograph (`media["home-design"]`) on an alabaster `#F4F4F4` canvas with **zero text overlay and zero dark scrim**, paired with a 12-column split header above and a 3-column hairline specification bar below.
3. **Pattern C — Split Image / Telemetry Stage (`#monitoring`)**
   - Asymmetric 12-column split pairing a 5-column technical narrative and dispatch key on the left with a 7-column framed telemetry stage on the right.
4. **Pattern D — Borderless Architectural Product Gallery (`#solutions`)**
   - Three equal columns separated by top `1px` index hairlines (`01`, `02`, `03`), pairing `16:10.5` architectural photographs (`res-hero`, `omnigrid-hero`, `commercial-hero`) with concise descriptions and a single action per path.
5. **Pattern E — Hairline Typographic Ledger (`#savings`, `#process`, `#faq`)**
   - Pure typographic and tabular compositions where `1px` `#E3E4E6` / `#D8DADC` hairlines organize financial outputs, 6 installation milestones, and 6 FAQ disclosures without nested card boxes.
