# WAVENOX — Engineering & Design Rules (`Rules.md`)

---

## 1. The Cardinal Brand Commandments

These commandments are non-negotiable. Every line of code, component, and visual asset added to WAVENOX must adhere strictly to these principles.

### Commandment 1: The Obsidian Void (`#000000`)
- **Rule**: The canvas background is ALWAYS pure black `#000000` (`oklch(0 0 0)`).
- **Forbidden**: Never use dark gray, navy, slate, charcoal, or washed-out off-black backgrounds for root layouts or sections.
- **Implementation**: `background-color: #000000 !important; background-image: none !important;` in `src/styles.css`.

### Commandment 2: The Sunburst Radiant Accent (`#F57C00`)
- **Rule**: Sunburst Orange (`#F57C00` / `oklch(0.72 0.18 55)`) is the proprietary solar signature of WAVENOX.
- **Usage**: Reserve it for critical focal points, glowing active states, key metric highlights, and high-conversion actions.
- **Accents**: Complement with amber/gold glows (`#FFB547`, `#FFC978`) and deep ember shadows (`#C25A00`).

### Commandment 3: Absolute Prohibition of Breadcrumbs
- **Rule**: NEVER place breadcrumb navigation (e.g., `Home / Wavenox` or `Home > Products`) in the Hero section or top navigation.
- **Reason**: Breadcrumbs belong in utilitarian documentation or e-commerce catalogues, not in an elite, billion-dollar luxury brand presentation.

### Commandment 4: True Fluid Mobile Responsiveness
- **Rule**: Every typography scale and interactive element must be fluid.
- **H1 Scaling**: Never render oversized text on mobile viewports. Use responsive sizing (e.g., `text-3xl sm:text-4xl md:text-5xl lg:text-6xl`).
- **Button Sizing**: CTA buttons must be ergonomic on mobile (`w-full sm:w-auto px-6 py-3`). Touch targets must never be smaller than 44px.

### Commandment 5: Complete Mobile Menu Collapse
- **Rule**: Desktop navigation links must never simply be hidden with `hidden`.
- **Implementation**: They must collapse into an elegant, full-viewport animated mobile drawer (`AnimatePresence` + `motion.div`) with a high-contrast close button (`✕`) and clean chevron indicators.

### Commandment 6: The Fade-to-Void Masking Standard
- **Rule**: Imagery must never terminate with jarring, hard horizontal or vertical cutoff borders against the black canvas.
- **Implementation**: Always apply soft gradient masks:
  - `mask-void-bottom`: Linear fade to black at base.
  - `mask-void-y`: Dual fade top and bottom.
  - `mask-void-all`: Radial vignette blending all 4 corners into `#000000`.

### Commandment 7: Tone of Voice & Copywriting
- **Rule**: WAVENOX speaks with authoritative, institutional prestige.
- **Forbidden Vocabulary**: Never use cheap clean-tech cliches like *"Go Green"*, *"Eco-friendly saving"*, *"Budget solar"*, *"Cheap panels"*.
- **Mandatory Vocabulary**: Use words like *"Apex energy independence"*, *"Monolithic architecture"*, *"High-yielding asset"*, *"Absolute power. Zero compromise."*, *"Category 5 resilience"*, *"Architectural supremacy"*.

---

## 2. Reusability & "Sale-Ready" Engineering Standards

### Commandment 8: Zero Hardcoded Business Details
- **Rule**: NEVER hardcode the brand name, contact phone, WhatsApp number, email, domain, or physical address inside UI components or routes.
- **Implementation**: Always import from `src/config/brand.ts` or `src/config/business.ts`:
  ```tsx
  import { BRAND_CONFIG } from "@/config/brand";
  import { BUSINESS } from "@/config/business";
  ```
- **Reason**: When the website is sold to a real-world solar business owner, changing `brand.ts` or `.env` must instantly rebrand the entire website without touching component code.

### Commandment 9: Solar Constants Decoupling
- **Rule**: Mathematical and financial assumptions (tariffs, kWh yields, watts/sq.ft, subsidy formulas) must NEVER be hardcoded inside calculator components.
- **Implementation**: Always import from `src/config/solar.ts`:
  ```tsx
  import { SOLAR_CONFIG } from "@/config/solar";
  ```

### Commandment 10: Placeholder Imagery & Replacement Contract
- **Rule**: All existing images are high-aesthetic placeholders generated during development.
- **Requirement**: Keep image imports clean and modular in `src/assets/`. Use descriptive filenames (e.g., `res-hero-01.jpg`, `lg-tile.jpg`) and standard aspect ratios (`16:9`, `4:3`, `1:1`) so that when the buyer replaces them with real installation photographs, layouts do not break.

### Commandment 11: Truth in Endorsements & Claims
- **Rule**: Following Indian consumer protection guidelines (CCPA 2022) and international standards, never invent fake customer testimonials or unverified reviews.
- **Implementation**: The reviews section must conditionally render only when real entries exist in `BUSINESS.reviews`. If empty, the component remains hidden cleanly.

---

## 3. TypeScript & Code Standards

1. **Zero `any`**: Do not use `any`. Always create strict types or interfaces for component props, slide models, data matrices, and API responses.
2. **Component Architecture Rules**:
   - Single responsibility per component.
   - Use semantic HTML tags (`<main>`, `<section>`, `<article>`, `<header>`, `<footer>`, `<nav>`).
   - Every interactive icon-only button must have an explicit `aria-label`.
   - Accessible modal focus traps and keyboard Escape listeners on all drawers.
3. **Framer Motion Performance**:
   - Only animate `transform` (`x`, `y`, `scale`, `rotate`) and `opacity`.
   - Never animate layout properties like `width`, `height`, `margin`, or `padding` on scroll.
   - Always supply `viewport={{ once: true, amount: 0.15 }}`.

---

## 4. Git & Branch Hygiene

1. **Lovable Branch Preservation**:
   - **NEVER** force-push (`git push --force`) or rewrite published git history (interactive rebase, amend published commits, or squashing), as this corrupts Lovable's sync index.
2. **Atomic Commits**:
   - Keep commit messages concise, descriptive, and capitalized (e.g., `Add global site footer component`, `Restore hero CTA button`).
3. **Sandbox Workarounds**:
   - In environments where `~/.gitconfig` is restricted, prepend `GIT_CONFIG_GLOBAL=/dev/null` for git commands.
