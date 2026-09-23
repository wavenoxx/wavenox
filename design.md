# WAVENOX — Visual Design System & UI/UX Specification (`design.md`)

---

## 1. Brand Aesthetics & Visual Philosophy

The WAVENOX visual language represents **"The Billion-Dollar Clean-Tech Aesthetic"**—a fusion of aerospace engineering precision, architectural minimalism, and raw energy. Every screen feels cinematic, deliberate, and high-tech, evoking the institutional authority of a global defense contractor combined with the sleek luxury of a supercar atelier.

---

## 2. Color Palette & Token System

### 2.1 Core Palette

| Token Name | Hex Code | OKLCH / CSS Value | Primary Purpose |
| :--- | :--- | :--- | :--- |
| **Obsidian Void** | `#000000` | `oklch(0 0 0)` | Root canvas, immersive backdrop, total light absorption |
| **Sunburst Orange** | `#F57C00` | `oklch(0.72 0.18 55)` | Brand core, primary actions, focal metrics, energy pulses |
| **Solar Amber** | `#FFB547` | `oklch(0.80 0.16 65)` | Ambient highlights, gradient text stops, active glows |
| **Sunburst Gold** | `#FFC978` | `oklch(0.85 0.12 70)` | Secondary glow highlights, physics bar peaks |
| **Solar Ember** | `#C25A00` | `oklch(0.55 0.20 45)` | Deep gradient shadow base, outer radial glows |
| **Pure White** | `#FFFFFF` | `oklch(1 0 0)` | Display headlines, high-contrast borders on hover |
| **Platinum Silver** | `#FAFAFA` | `oklch(0.98 0 0)` | Primary body headers, bold data points |
| **Muted Smoke** | `#9CA3AF` | `text-gray-400` / `rgba(255,255,255,0.6)` | Secondary copy, sub-labels, metadata |
| **Hairline White** | `rgba(255,255,255,0.10)` | `oklch(1 0 0 / 10%)` | Subtle structural division lines, card outlines |
| **Liability Crimson**| `#EF4444` | `oklch(0.63 0.24 25)` | Highlighting conventional solar flaws, failure points |

### 2.2 Radiant Gradients & Glow Formulas

1. **Sunburst Text Gradient**:
   ```css
   background: linear-gradient(to right, #FFB547, #F57C00, #C25A00);
   -webkit-background-clip: text;
   -webkit-text-fill-color: transparent;
   filter: drop-shadow(0 0 10px rgba(245, 124, 0, 0.35));
   ```
2. **Radial Atmospheric Fog**:
   ```css
   background: radial-gradient(ellipse at center, rgba(245, 124, 0, 0.08) 0%, transparent 70%);
   filter: blur(140px);
   ```
3. **Orbiting Conic Border (`card-glow-spin`)**:
   ```css
   background: conic-gradient(
     from 0deg,
     transparent 0%,
     rgba(245, 124, 0, 0.55) 12%,
     transparent 25%,
     transparent 50%,
     rgba(245, 124, 0, 0.35) 62%,
     transparent 75%
   );
   animation: border-spin 6s linear infinite;
   ```

---

## 3. Rebrandable Component Specifications

### 3.1 Dynamic Brand Wordmark (`BrandLogo.tsx`)
- **Behavior**: Reads the brand name from `BRAND_CONFIG.name`.
- **Styling**: All-caps bold, ultra-wide tracking (`tracking-[0.35em]`), pure white with subtle hover glow.
- **Flexibility**: If a buyer provides an SVG logo, it can be passed via an optional asset slot without altering the header structure.

### 3.2 Placeholder Imagery & Asset Replacement Guide
All current images are placeholders selected for visual mood and aesthetic alignment. When a real solar business owner provides original photography, assets can be replaced using these standard specifications:

| Asset Slot | Recommended Aspect Ratio | Target Dimensions | Visual Content Description |
| :--- | :--- | :--- | :--- |
| **Hero Carousel (Desktop)** | `16:9` | 1920 × 1080 px | Ultra-luxury villa roof, modern architectural dusk exterior, high-angle roof shot. |
| **Hero Carousel (Mobile)** | `9:16` | 1080 × 1920 px | Vertical framing of luxury villa solar installation. |
| **Liquid Glass Product** | `4:3` or `1:1` | 1200 × 900 px | Macro detail of monolithic obsidian solar tile texture, flush edge. |
| **Residential Estates** | `16:10` | 1600 × 1000 px | Sprawling modern estate at twilight with black solar glass roof. |
| **Industrial / Commercial** | `16:9` | 1920 × 1080 px | Clean industrial rooftop array, solar carports, megawatt facility. |
| **Hardware & Inverter** | `1:1` | 1200 × 1200 px | Monolithic dark matte battery vault or inverter tower against dark void. |

---

## 4. Typography Hierarchy

The typographic system utilizes **Inter** paired with clean, architectural geometry. High-contrast uppercase treatments with ultra-wide tracking are contrasted against clean, balanced body typography.

```
┌────────────────────────────────────────────────────────────────────────┐
│  EYEBROW: "THE WAVENOX ADVANTAGE" • 10px • BOLD • TRACKING: 0.32em     │
├────────────────────────────────────────────────────────────────────────┤
│  HEADLINE: "Absolute power. Zero compromise."                          │
│  Desktop: 60px / 1.05 leading / Bold                                   │
│  Mobile: 32px / 1.1 leading / Bold                                     │
├────────────────────────────────────────────────────────────────────────┤
│  SUB-HEADLINE: "Deploying world-class solar infrastructure..."         │
│  Desktop: 16px / 1.6 leading / text-white/75                           │
│  Mobile: 14px / 1.5 leading / text-white/75                            │
├────────────────────────────────────────────────────────────────────────┤
│  METRICS: "250 kmph" / "₹48.2 L"                                       │
│  Font: font-bold tabular-nums • #F57C00 Drop-shadow                    │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Micro-Interactions & Animation Specs

1. **Ghost CTA Button**:
   - **Resting**: Transparent background, 1px white border (`border-white/40`), white uppercase text with wide tracking, Sunburst Orange right arrow.
   - **Hover**: Smooth transition to solid pure white background with black text (`bg-white text-black`).
   - **Active**: Flash Sunburst Orange (`bg-[#F57C00] border-[#F57C00]`).
2. **Carousel Controls**:
   - Monospace numeric indicator (`01 / 04`).
   - Square icon buttons (`h-10 w-10`), hairline white border.
   - Active state flashes Sunburst Orange (`active:border-[#F57C00] active:bg-[#F57C00] active:text-black`).
   - Auto-scrolling progress bars (6.5s interval with linear width fill).
3. **Custom ROI Slider**:
   - Track: 6px rounded, dynamic dual-tone gradient fill (`#F57C00` fill + `rgba(255,255,255,0.1)` remaining).
   - Thumb: 20px circular Sunburst Orange with 2px black border and glowing orange shadow (`0 0 20px rgba(245,124,0,0.7)`).
   - Hover: Scales to 1.15x with smooth spring.

---

## 6. Global Ultra-Luxury Footer Specification

- **Surface**: Obsidian void with hairline top border (`border-t border-white/10`) and subtle top amber ambient glow.
- **Column 1 — Brand Heritage**:
  - Dynamic logo rendered via `BrandLogo.tsx`.
  - Headquarter and territory tag: e.g., "Hyderabad, Telangana · Serving Pan-India & Global Deployments".
  - Tagline and BIS / TÜV / UL compliance badges.
- **Column 2 — Architecture & Solutions**:
  - Liquid Glass Monolithic Roofs, Omni-Grid Energy Storage, Quantum Micro-Inverters, Defense Grade EMP Shielding.
- **Column 3 — Sectors**:
  - Residential Luxury Villas, Commercial & Industrial Megawatts, Institutional & Aviation Hubs.
- **Column 4 — Direct Contact & VIP Advisory**:
  - Interactive Click-to-Call and Click-to-WhatsApp reading directly from `BRAND_CONFIG.contact`.
  - Direct email action link.
  - Quick proposal booking trigger button.
- **Bottom Bar**:
  - Dynamic copyright string with current year: `© {new Date().getFullYear()} {BRAND_CONFIG.legalName}`.
  - Links: Privacy Policy, Terms of Deployment, BIS Compliance.
