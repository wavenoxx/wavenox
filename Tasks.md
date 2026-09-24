# WAVENOX — Execution Roadmap & Task Matrix (`Tasks.md`)

---

## 1. Project Phase Overview

```
┌─────────────────────────────────┐       ┌─────────────────────────────────┐       ┌─────────────────────────────────┐
│            PHASE 1              │       │            PHASE 2              │       │            PHASE 3              │
│ Honest & Working Foundation     │ ────► │  Design Soul Pass (Showroom)    │ ────► │ Performance & Scale Tuning      │
│          (COMPLETED ✅)          │       │          (COMPLETED ✅)          │       │          (ROADMAP 🚀)           │
└─────────────────────────────────┘       └─────────────────────────────────┘       └─────────────────────────────────┘
```

---

## 2. Phase 1: Honest & Working Foundation (Status: COMPLETED ✅)

Branch: `phase-1-foundation` (Merged into `main` via PR #1 `1ef5d0d`)

- [x] **Step 1:** Repository hygiene, `.gitignore` hardening, root types standardization (`a9ba6a9`).
- [x] **Step 2:** Decoupled external branding, created `src/config/products.ts` with `// VERIFY(owner)` markers (`ec818da`).
- [x] **Step 3:** Removed unverifiable claims, aligned copy strictly with PM Surya Ghar scheme (`aa783a4`).
- [x] **Step 4:** Unified solar calculation engine in `src/config/solar.ts` with 9 passing Vitest tests (`49a3d72`).
- [x] **Step 5:** Server lead pipeline via `createServerFn`, zero-trust Supabase migrations, DPDP consent capture (`663362b`, `a845112`).
- [x] **Step 6:** Accessible Radix Dialog drawer, single root mount, menu accessibility (`3908f5e`).
- [x] **Step 7:** DPDP Act 2023 privacy policy, quotation terms, calculation disclosures (`dccaa91`).
- [x] **Step 8:** Full verification: tests pass, TypeScript clean, live Supabase DB lead insertion verified (`1ef5d0d`).

---

## 3. Phase 2: Design Soul Pass (Status: COMPLETED ✅)

Branch: `phase-2-design`

### Step 0: Carry-overs from Phase 1 Review

- [x] Hero buttons nowrap fix (`whitespace-nowrap min-w-[200px]`) in `Hero.tsx`.
- [x] Removed "guaranteed 25-year performance" from `enterprise.tsx` metadata.
- [x] Friendly customer error message on missing server configuration in `src/functions/leads.ts`.
- [x] Unique constraint retry on `reference_code` generation collision.
- [x] Resend REST API email notification dispatch to owner on lead insertion.
- [x] Documented `RESEND_API_KEY` and `OWNER_NOTIFY_EMAIL` in `.env.example`.
- [x] Commit: `phase2(step 0): carry-overs from phase 1 review` (`e31eb06`).

### Step 1: Baseline Captures, Design Tokens & Inter Variable Typeface

- [x] Captured 10 baseline full-page screenshots into `qa-artifacts/phase2/before/` across Desktop (1440×900) and Mobile (390×844).
- [x] Added `qa-artifacts/` to `.gitignore`.
- [x] Installed `@fontsource-variable/inter` and set up fluid clamp typography in `src/styles.css`.
- [x] Configured strict neutral monochrome design tokens (`--ink`, `--muted`, `--surface`, `--white`, `--accent`, `--line`, `--danger`).
- [x] 4px button border radius and 40px standard button height.
- [x] Commit: `phase2(step 1): baseline screenshots, inter variable typeface, and design tokens` (`318b5ea`).

### Step 2: Design-System Components

- [x] Created `src/components/system/Button.tsx`: Poly-component (Link/a/button) with light/dark tones, 40px height, 4px radius.
- [x] Created `src/components/system/Media.tsx`: Responsive picture element with AVIF/WebP/JPG sources, mobile portrait crops, priority loading, 0 CLS.
- [x] Created `src/components/system/Panel.tsx`: 100svh showroom panel with top title/lead and bottom stat/button dock.
- [x] Created `src/components/system/QuietSection.tsx`: Generously padded unboxed white/surface section.
- [x] Created `src/components/system/StatRow.tsx`: 1–3 large unboxed statistics (value above label).
- [x] Created `src/components/system/Reveal.tsx`: Subtle rise and fade respecting `prefers-reduced-motion`.
- [x] Created `src/components/system/TextLink.tsx`: Underline text link with offset and arrow.
- [x] Created `src/components/system/SpecsDrawer.tsx`: Radix Dialog full-height right sheet for technical hardware specs.
- [x] Created `src/components/system/Faq.tsx`: Hairline Radix Accordion with 16px questions and concise answers.
- [x] Created `src/components/system/index.ts` barrel export.
- [x] Commit: `phase2(step 2): design-system components` (`a929068`).

### Step 3: Responsive Image Pipeline & Master Shot Manifest

- [x] Installed `sharp` dev dependency.
- [x] Documented `docs/SHOT_LIST.md` defining all 8 authentic Indian clean-tech shots.
- [x] Created `scripts/build-images.mjs`: Multi-resolution builder outputting AVIF, WebP, JPG at [640w, 1080w, 1600w, 2400w] plus 4:5 mobile portrait crops into `public/media/`.
- [x] Generated typed manifest `src/config/media.ts`.
- [x] Verified file size budgets: Hero AVIF at 1600w ≤ 250 KB; Secondary Panels AVIF at 1600w ≤ 180 KB.
- [x] Deleted fake hexagonal image `liquid_glass_macro.jpg`.
- [x] Added `cellTypeShort: "N-type TOPCon"` to `src/config/products.ts` with `// VERIFY(owner)`.
- [x] Added `hasMonitoringApp: true` and `installDaysTypical: 3` to `src/config/brand.ts`.
- [x] Added `"images": "node scripts/build-images.mjs"` script to `package.json`.
- [x] Commit: `phase2(step 3): responsive image pipeline and shot manifest` (`8da00b6`).

### Step 4: Showroom Header, Menu Sheet & Single-Line Footer

- [x] Rebuilt `src/components/Header.tsx`: 56px height, soft hover pills, right "Consultation" text link, transparent over dark panels, switches to white glass on scroll.
- [x] Added Radix Dialog full-height right sheet menu with direct links, consultation action, phone and WhatsApp.
- [x] Rebuilt `src/components/Footer.tsx`: Single centered 12px line (`WAVENOX © {year} · Privacy · Terms · Disclosures · PM Surya Ghar · Contact`).
- [x] Commit: `phase2(step 4): showroom header, full-height menu sheet, and single-line footer` (`14c1553`).

### Step 5: Flagship Home Page Rebuild (`/`)

- [x] Assembled 10-item showroom sequence in `src/routes/index.tsx`:
  1. `PANEL home-hero`: "Solar Panels" + stats (₹78,000 subsidy / 25 Years warranty / 24/7 outage protection) + Order / Consultation CTAs.
  2. `PANEL home-design`: "Clean, All-Black Design" + stats + Order / Learn More CTAs.
  3. `PANEL home-outage`: "Power Through Outages" + stats (< 20 ms / 13.5 kWh) + Omnigrid / Order CTAs.
  4. `QUIET Pay Less for Electricity`: DISCOM select + monthly bill slider + annual savings output + Order Now pre-fill.
  5. `PANEL home-heat`: "Built for Indian Heat" + stats (-0.30% / °C / 22.8%) + Specs / Order CTAs.
  6. `QUIET Monitor Your System`: Minimalist phone mockup with amber energy flows.
  7. `QUIET From Order to Power On`: 5 unboxed horizontal steps.
  8. `QUIET Questions`: Radix `<Faq>` accordion with concise answers (≤ 60 words each).
  9. `PANEL home-final`: "Schedule a Virtual Consultation" + stats + Consultation / Order CTAs.
  10. `Footer`.
- [x] Deleted 9 obsolete legacy components (`Hero`, `SleekDesign`, `OutageProtection`, `BillSavingsSlider`, `EfficiencyTech`, `EnergyControl`, `TechSpecs`, `OrderProcess`, `SupportFaq`).
- [x] Commit: `phase2(step 5): showroom home page rebuild` (`c1fabd8`).

### Step 6: Subpages Rebuild (`/residential`, `/omnigrid`, `/enterprise`)

- [x] Rebuilt `/residential`: Showroom panel sequence (Hero, Terrace Mount, Whole-Home Backup, Turnkey Team, Consultation).
- [x] Rebuilt `/omnigrid`: Showroom panel sequence (Hero, Outage Protection, Sunset Power) + Backup Hours Estimator widget.
- [x] Rebuilt `/enterprise`: Commercial hero, Lower Operating Costs panel, unboxed commercial yield calculator, and DPDP-compliant lead intake form.
- [x] Commit: `phase2(step 6): showroom subpages for residential, omnigrid, and enterprise` (`d43e5fa`).

### Step 7: Studio (`/deploy`), Drawer, Legal, Order Alignment

- [x] Rebuilt `SystemConfigurator.tsx`: 58% sticky left media + StatRow, 42% scrolling configurator on right, segmented controls with 1.5px ink border, pre-fill from `?bill` and `?discom`, sticky mobile bottom bar.
- [x] Rebuilt `ConsultationDrawer.tsx`: Design tokens, 4px radius, clean inputs, zero text < 12px.
- [x] Rebuilt `src/routes/order/received.tsx`: Minimal confirmation screen with reference code, next steps, WhatsApp link.
- [x] Audited and fixed all legal routes (`privacy.tsx`, `disclosures.tsx`) ensuring zero text < 12px.
- [x] Commit: `phase2(step 7): studio configurator visual cleanup and legal pages styling` (`b973ac9`).

### Step 8: Automated QA Verification & Comparison Captures

- [x] Created `scripts/qa-metrics.mjs` running in Playwright.
- [x] Automated measurement results:
  - **Home Page Word Count:** 440 desktop / 434 mobile (Budget: ≤ 450 words) -> **PASS**
  - **Subpages Word Count:** 167 to 216 words (Budget: ≤ 350 words) -> **PASS**
  - **Home Page Icon Count:** 4 icons (Budget: ≤ 8 icons) -> **PASS**
  - **CTA Budget:** 6 Order CTAs, 2 Consultation CTAs -> **PASS**
  - **Minimum Text Size:** 0 elements < 12px computed across all routes -> **PASS**
  - **Horizontal Overflow:** 0 overflow across desktop & mobile -> **PASS**
  - **Font Loaded:** Inter Variable loaded in document.fonts -> **PASS**
  - **Test Suite:** 9/9 Vitest unit tests pass -> **PASS**
  - **Type Check:** 0 TypeScript compiler errors -> **PASS**
  - **ESLint:** 0 errors -> **PASS**
  - **Production Build:** Nitro Cloudflare Workers build succeeded -> **PASS**
- [x] Captured 10 "after" comparison screenshots into `qa-artifacts/phase2/after/`.
- [x] Commit: `phase2(step 8): automated qa metrics script and verification` (`a319cfd`).

### Step 9: Documentation & Pull Request

- [x] Rewrote `design.md` as the definitive WAVENOX design system manual.
- [x] Updated `Tasks.md` with complete Phase 2 deliverables and QA metrics table.
- [x] Pushed branch `phase-2-design` to GitHub and opened Pull Request to `main`.
