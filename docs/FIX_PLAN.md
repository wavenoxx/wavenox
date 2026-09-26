# WAVENOX — Antigravity 2.0 Execution Prompt

_Audit fix plan · prepared 26 Sep 2026 from a full review of `wavenoxx/wavenox` @ `820c3de`_

**How to use:** save this file in the repo as `docs/FIX_PLAN.md` and the image brief as `docs/IMAGE_BRIEF.md`, open the project in Antigravity (Planning mode), and send:

> Read `docs/FIX_PLAN.md` completely. Execute it phase by phase, starting with Phase 0. After each phase: run all checks, commit, show me a short summary with before/after screenshots, and wait for my "go" before starting the next phase.

Everything below the line is the prompt.

---

## ROLE

You are a senior product engineer and product designer working in this repository (TanStack Start + React 19 + Tailwind v4 + Supabase, deployed to Cloudflare). Your job is to turn WAVENOX into a portfolio piece that is (1) factually true, (2) bug-free, and (3) Tesla-grade in restraint and cinematic impact, yet unmistakably WAVENOX. The Tesla-inspired soul — full-bleed 100svh photo panels, bottom stat dock, paired CTAs, quiet white sections, monochrome palette with one amber accent — is **kept 100 %**. Nothing in this plan may make the site duller, busier or less premium.

## GROUND RULES (non-negotiable)

1. **Truth over polish.** Every number or claim shown to users must come from one of: (a) an official public source (tariff order, MNRE/MoP notification, BIS/IS code, Income-tax Act), (b) one real manufacturer datasheet, or (c) the visitor's own input. Store each constant in `src/config/*` with `{ source: { title, url, verifiedOn } }`. If you cannot source it, delete the claim. Fewer true things beat more invented things.
2. **This is a portfolio concept, not a registered company.** Never present WAVENOX as a legal entity, never invent addresses, offices, certifications, partnerships, SLAs, customers, projects, reviews or guarantees.
3. **AI visuals are allowed and stay cinematic.** Regenerate them to the standard in `docs/IMAGE_BRIEF.md`: photographic (not CGI), Hyderabad-specific, engineering-correct, layout-aware, one consistent visual world, never duller than today. Never caption a render as a real project; credit them as concept renders on `/about-this-project`.
4. **Git safety.** Work on branch `fix/audit-2026-09`. Small commits, one per task group. Never force-push, rebase, amend or squash pushed commits (this repo syncs with Lovable — see `AGENTS.md`).
5. **Checks after every phase:** `npx tsc --noEmit`, `npm test`, `npm run lint` (must be 0 errors — it is currently 144 Prettier errors, run `npx eslint . --fix` first), `npm run build`. All must pass before committing.
6. **Single source of truth.** Components never hardcode numbers, business details, or hex colours. Numbers come from `src/config/*`; colours come from CSS tokens.
7. **This plan overrides** `Rules.md`, `design.md`, `Architecture.md`, `pmd.md`, `Memory.md`, `Tasks.md` where they conflict (for example the "1-line footer" rule and wording like "exact replica"). The Tesla-inspired design DNA in those docs stays. Phase 7 rewrites the docs so they stop conflicting.
8. **Stop and ask me** when you need: approval of generated images (show me the variants), my name for the concept credit, a choice between lead modes, or any business fact.

## DECISIONS / INPUTS FROM THE OWNER

Use these defaults unless I say otherwise:

- `VITE_LEAD_MODE=demo` (forms show the full experience but store nothing; final step says so honestly and offers to contact the designer). `live` is allowed only if real business details are configured; otherwise the build must fail with a clear message.
- Concept credit line: `WAVENOX is a design concept by [OWNER_NAME]. Not a registered company; no products are sold.` Ask me for `[OWNER_NAME]`.
- Geography: Hyderabad (TGSPDCL/TGNPDCL) as the single, fully-sourced market. Other states appear only after their data is verified from official orders.
- Domain: `wavenox.in` is the chosen domain (to be purchased). Keep `VITE_SITE_URL=https://wavenox.in` for canonicals, OG, sitemap and JSON-LD. Until I confirm it is bought and verified, do not send any email from it.

---

## PHASE 0 — Branch and baseline

1. Create branch `fix/audit-2026-09`.
2. Capture baseline screenshots (1440×900 and 390×844) of all 15 routes into `qa-artifacts/before/` (already git-ignored).
3. Run `npx eslint . --fix`, confirm 0 errors, commit `chore: prettier baseline`.

---

## PHASE 1 — P0 functional bugs

### 1.1 Enterprise leads are silently discarded
`src/routes/enterprise.tsx` shows a visible field "Company Website (Optional)" bound to `company_website`. `src/functions/leads.ts` treats a non-empty `company_website` as the **bot honeypot** and returns a fake success with a random reference code without saving. Any real business that types its website is lost.
- Rename the honeypot to a non-guessable name (e.g. `hp_extra`) in the schema and all three forms; render it visually hidden (off-screen absolute positioning, `aria-hidden`, `tabIndex={-1}`, `autoComplete="off"`), not `display:none`.
- Add real optional fields `company_name` and `company_url` to the zod schema and a new migration `supabase/migrations/20260926_consultations_v3.sql`. Stop stuffing the company name into `city`.
- **Accept:** enterprise form with website filled → row created (live) / honest demo success (demo). Honeypot filled → no row.

### 1.2 Two forms pretend to submit
`src/routes/net-metering.tsx` (`handleFeasibilityCheck`) and `src/routes/architects.tsx` (`handleSubmit`) only set local state, then say "Feasibility Request Logged… our utility engineer will cross-reference your service connection with DISCOM substation records within 24 hours" and "Architectural Dossier Request Confirmed". Nothing is sent.
- Either wire them to `submitLead` (add `source` values `net_metering` and `architects` to the zod enum and the DB check constraint; add labelled inputs and the consent checkbox), or replace them with an honest WhatsApp deep link.
- Delete promises we cannot keep (DISCOM substation lookups, 24-hour turnaround, BIM downloads).
- Never show a "confirmed" state unless a request was actually sent (or demo mode says clearly that nothing was sent).

### 1.3 Home calculator → Studio hand-off is broken
Home recommends 7.7 kW for a ₹8,000 bill; clicking "Order Now" opens `/deploy?bill=8000&discom=TGSPDCL`, which shows **13.2 kW, 24 panels, 1 battery pre-selected, ₹10.2 lakh net, 10.6-year payback**. `SystemConfigurator` ignores `initialBill` when sizing, and `handleBillChange` uses its own hardcoded thresholds.
- Initialise `panelCount` from `estimate({ monthlyBillInr, discomCode }).recommendedPanels`; delete the hardcoded thresholds; default battery = 0 units.
- Clamp panel count to the engine's residential maximum and show why (sanctioned load / net-metering limits). The drawer's "Luxury Villa 25–50 kW" tier must match the engine.
- **Accept:** for any bill and DISCOM, the kW on `/` equals the kW on `/deploy`.

### 1.4 Header is invisible on two pages
`src/components/Header.tsx` decides transparent vs solid with a hardcoded `isLightPage` list. `/net-metering` and `/architects` start on a light background, so the white logo and nav disappear at the top.
- Replace the list with route `staticData: { headerTone: "overlay" | "solid" }` (default `solid`), set `overlay` only on routes whose first section is a dark photo panel.
- **Accept:** a Playwright test confirms logo and nav meet 4.5:1 contrast at `scrollY=0` on every route.

### 1.5 Hero stats wrap 2 + 1 on desktop
`src/components/system/StatRow.tsx` keeps `max-w-sm / sm:max-w-md` at `md:` widths, so three stats wrap into two lines on `/`, `/residential`, `/omnigrid`, `/enterprise` at 1440 px.
- Remove the max-width at `md:` and above; never wrap three stats. Test at 768, 1024, 1440, 1920.

### 1.6 Template favicon
`public/favicon.ico` is the Lovable template heart logo; it is also used as the Organization `logo` in JSON-LD.
- Design a WAVENOX mark (SVG). Ship `favicon.svg`, 32 px `favicon.ico`, 180 px `apple-touch-icon.png`, 512 px `icon-512.png`, `site.webmanifest`, `theme-color`. Use the 512 px PNG (absolute URL) as the JSON-LD logo.

### 1.7 SEO fundamentals
- `og:image` is relative on every page (e.g. `/media/home-hero-1600w.jpg`) → make it absolute from `BRAND_CONFIG.domain`; add `og:url` per page; add `og:image` to legal pages.
- No page has `<link rel="canonical">` → add per route.
- `/`, `/residential`, `/omnigrid`, `/enterprise` have **no `<h1>` and no `<main>`**. Give `Panel` an `as="h1"` option for the first panel and wrap page content in `<main>`.
- `/order/received` → `noindex`. It also prints any `?ref=` value as an "Official Reference Code"; only show a code that came from the submission response (sessionStorage), otherwise show a neutral message.
- Home FAQ JSON-LD is a hand-copied duplicate of `FAQ_ITEMS` and has already drifted ("water borewell pumps, and refrigeration" vs "water pumps, and luxury appliances"). Generate JSON-LD from the same array. Note: Google shows FAQ rich results only for government/health sites, so keep it minimal.
- Remove `twitter:site @wavenox` and default social URLs (Instagram, LinkedIn, YouTube, X) unless I confirm I own them.

### 1.8 Domain, sitemap and email
- Keep `wavenox.in` (planned domain). Generate `sitemap.xml` and `robots.txt` at build time from the route list and `VITE_SITE_URL`, so nothing is hardcoded.
- `src/functions/leads.ts` sends email `from: "WAVENOX Leads <leads@wavenox.com>"`. `wavenox.com` is a different live site (creator tools), not ours. Read the sender from env `LEADS_FROM_EMAIL` (future `leads@wavenox.in`), and skip sending when it is unset or the domain is not verified in Resend.
- `DEFAULT_EMAIL = advisory@wavenox.in` will bounce until the domain and mailbox exist; in demo mode show the owner's real contact instead.
- `.gitignore` lists `public/robots.txt`, `public/sitemap.xml`, `public/favicon.ico` although they are tracked — clean this up.

### 1.9 Form UX and labels
- `submitLead` uses `.parse` in the validator, so any zod error reaches the client as a generic "Failed to submit". Use `safeParse` and return `{ success:false, fieldErrors }`; show per-field messages.
- `ConsultationDrawer.tsx` inputs have no `id`/`htmlFor`, so screen readers get no labels. Label every input in every form.
- Reset drawer step and fields after a successful submit or close.
- Consent text: remove "Zero spam guarantee"; state purpose, what is stored, how to withdraw, and link the privacy page.

---

## PHASE 2 — Real-world data engine

Create `src/config/regulatory.ts` (typed, every constant carries `source`). Add Vitest tests for each item. Show a small "Source · verified <date>" chip under every calculator result, linking to `/legal/disclosures#sources`.

### 2.1 PM Surya Ghar subsidy (CFA)
- General category: ₹30,000/kW for the first 2 kW + ₹18,000 for the 3rd kW → **cap ₹78,000**.
- Special-category states/UTs (Uttarakhand, Himachal Pradesh, J&K, Ladakh, North-East incl. Sikkim, Andaman & Nicobar, Lakshadweep): ₹33,000/kW for the first 2 kW + ₹19,800 → **cap ₹85,800**.
- RWA/Group Housing: ₹18,000/kW for common facilities, up to 500 kW (3 kW per house).
- Commercial/industrial: ₹0. Subsidy requires DCR (Indian cells) modules.
- **Fix `/legal/disclosures`**: it currently says "₹33,000 per kW for first 2 kW, ₹12,000 for the 3rd kW" — wrong for general category.
- The subsidy is **credited to the bank account after commissioning**, it is not an upfront discount. Rename "Net Payable Investment" to "Effective cost after subsidy" with the note "subsidy is credited to your bank account after commissioning". MNRE says release is within ~15 days of DISCOM approval (Aug 2026 update); tell users to plan for 1–3 months in total.
- Tests: `subsidy(1)=30000`, `subsidy(2)=60000`, `subsidy(3)=78000`, `subsidy(10)=78000`, `subsidy(3,{specialCategory:true})=85800`, commercial = 0.

### 2.2 Tariffs: slabs, not a flat rate
The engine converts bill → units with one flat ₹/kWh (`TGSPDCL 9.2`). Real domestic tariffs are telescopic slabs plus fixed and customer charges, so the flat model under-estimates units by roughly 25–35 % for ₹2,000–₹3,000 bills (the main PM Surya Ghar audience).
- Model Telangana domestic tariff from the **TGERC Retail Supply Tariff Order FY 2025-26** (download the official PDF from tgerc.telangana.gov.in / tgsouthernpower.org and verify every value before committing):
  - LT-I(A) ≤100 units/month: 0–50 @ ₹1.95, 51–100 @ ₹3.10
  - LT-I(B) 101–200: 0–100 @ ₹3.40, 101–200 @ ₹4.80
  - LT-I(C) >200: 0–200 @ ₹5.10, 201–300 @ ₹7.70, 301–400 @ ₹9.00, 401–800 @ ₹9.50, >800 @ ₹10.00
  - plus fixed/customer charges and electricity duty exactly as the order states.
- Implement `energyCharge(discom, units)` and `unitsForBill(discom, billInr, sanctionedLoadKw)` (inverse via binary search, including fixed charges).
- Tests (update only if the official PDF differs): `energyCharge(TG, 300) = 1790`, `energyCharge(TG, 900) = 7490`; `unitsForBill` round-trips within ±1 unit.
- Add a note: Telangana's Gruha Jyothi scheme gives eligible households up to 200 free units/month.
- Remove DISCOMs you cannot verify from the official order (BESCOM, MSEDCL, TANGEDCO, BSES, APEPDCL) rather than keeping guessed numbers. Re-add each one later with its own tariff order.
- Rename everywhere: TSNPDCL → **TGNPDCL**, TSSPDCL → **TGSPDCL**; `https://www.tssouthernpower.com` → `https://tgsouthernpower.org`; verify the current TGNPDCL domain. The residential application portal is `https://pmsuryaghar.gov.in`.

### 2.3 Net-metering economics and batteries
- The engine values 30 % of generation as "export at ₹3" and 70 % at retail, and raises self-consumption to 90 % when a battery is added. Under net metering, exported units offset imported units at the retail tariff within the billing/settlement period; only year-end surplus is paid at the SERC-notified rate. Model monthly netting, make the surplus rate a sourced per-DISCOM constant, and remove the "battery increases savings" effect for net-metered homes.
- Telangana's Time-of-Day order (TGERC, Nov 2025) applies only to HT commercial/industrial categories: peak 6–10 AM and 6–10 PM +₹1.00/unit; the night rebate was withdrawn from 1 Dec 2025. Homes in Telangana have no ToD tariff, so a home battery is **backup**, not savings. Use ToD only in the C&I calculator.
- Simulator copy "Omnigrid completely avoids grid bills" must go.

### 2.4 Solar yield
The site uses three different yields: 1,450 kWh/kWp/yr (engine), 1,550 (enterprise calculator) and "1,550–1,680 units/kW/yr" (service areas, Hyderabad).
- Pull monthly irradiance/yield for Hyderabad once from **NASA POWER** (no key) or **NREL PVWatts v8** (free key, NSRDB covers India), commit the monthly numbers with source and date (no API key in the client), and use that single value everywhere. Show a 12-month generation chart (the monsoon dip is a nice, honest detail).

### 2.5 Tax (commercial)
The **Income-tax Act, 2025 is in force from 1 April 2026**; depreciation is now **Section 34** (was Section 32 of the 1961 Act). The 40 % rate for solar and the half-rate rule (assets used < 180 days in the year) continue.
- Replace all 17 "Section 32 / Sec 32" references in `src/`. Enterprise calculator: add the half-year toggle and a tax-rate selector; label results "illustrative — consult your CA".

### 2.6 Loans
The studio uses 9.5 % for 60 months. Replace with a sourced config (verify on sbi.co.in; as of Sep 2026 secondary sources report): SBI PM Surya Ghar loan up to ₹2 lakh ≈ 5.75 % p.a. (collateral-free), ₹2–6 lakh ≈ 7.90 %, tenure up to 120 months, up to 90 % of system cost, floating (EBLR-linked).
- EMI principal = 90 % of gross cost (not gross − subsidy); show the subsidy pre-payment effect separately.
- Delete "partner lending institutions (SBI, HDFC, Canara, Tata Capital)" — there are no partnerships. Link to the lender list on the national portal instead.

### 2.7 Wind loads (IS 875 Part 3:2015 basic wind speed)
Hyderabad **44 m/s (158 km/h)**, Vijayawada and Visakhapatnam **50 m/s (180 km/h)**, Chennai 50, Delhi 47, Mumbai 44, Pune 39, Bengaluru 33. The site says "150 km/h" for Hyderabad and "170 km/h severe cyclone rating" for coastal Andhra — both **below** the code's basic wind speed. Remove every "150/170 km/h certified / FEA wind-tunnel tested" claim (16 occurrences of "170 km/h"). Replace with: "Structures are designed to IS 875 (Part 3) for the site's basic wind speed — e.g. 44 m/s in Hyderabad."

### 2.8 ALMM and DCR
From 1 June 2026 ALMM List-II (cells) applies to net-metering projects; MNRE clarified that net-metered projects commissioned by 31 Dec 2026 are exempt; PM Surya Ghar subsidy always requires DCR modules. Add this to the FAQ with sources. Delete "guaranteeing unconditional subsidy approval".

### 2.9 Rooftop connection rules (Ministry of Power)
Technical feasibility is deemed/waived up to 10 kW, deemed load enhancement up to 10 kW, and connection + meter + commissioning within 15 days (verify against the Gazette text of the Electricity (Rights of Consumers) Amendment Rules, 2024 and the MoP PM Surya Ghar guidelines). Update the FAQ "Can I install more than my sanctioned load?" and the net-metering page's hardcoded "transformerCapPct: 80/70" values (delete them unless sourced).

### 2.10 One projection, used everywhere
For the same inputs the studio shows "25-Year Est. Net Savings ₹24.8 L" (from `estimate`) and the chart shows ₹22.96 L (its own maths in `WealthCurveVisualizer`). Create one `project25Years()` in the engine; both must use it. The chart must show the negative cumulative (the investment dip before payback) instead of clamping to 0, have axis labels, and support keyboard and touch scrubbing. Rename "Grid Loss" to "Spent on electricity without solar".

### 2.11 Energy-flow simulator must obey physics
`EnergyFlowSimulator.tsx` shows the battery going from 82 % to 62 % while supplying ~16 kWh from a 14.3 kWh pack (and similar later). Generate the 24-hour timeline from a small model: `SOC(t+Δt) = SOC(t) + P_batt·Δt·η / capacity`, clamp to [10 %, 100 %]. Test energy balance each step: `solar + import = load + charge + export` (±0.05 kW).

### 2.12 Degradation and warranty maths
Warranty page: "≥ 99.0 % in Year 1, ≤ 0.55 %/yr, ≥ 84.8 % in Year 25" — but 99 − 0.55 × 24 = **85.8 %**. `products.ts` says 1.0 % + 0.4 %/yr (→ 89.4 %); README says 0.5 %/yr. Take all values from one real module datasheet (Phase 3) and generate the table from a function with a test.

---

## PHASE 3 — Honesty pass (remove fabricated facts)

Use grep to find and fix every item. Commit per bullet group.

- **Legal entity:** two different names — `brand.ts` "WAVENOX Technologies Private Limited" and `Footer.tsx` (hardcoded) "WAVENOX Clean Energy Systems India Private Limited". Replace with the concept credit line. No "Private Limited" anywhere unless a real CIN/GSTIN is provided.
- **Addresses and facilities:** "WAVENOX Innovation Lab, Financial District, Gachibowli", "Regional Liaison Office: MVP Colony, Visakhapatnam", "Service Dispatch Hub: Indiranagar 100ft Road", "R&D lab", "structural prototyping center", "24/7 Hyderabad Command Center" → delete.
- **Operations:** "48-hour SLA", "factory-trained engineers", "in-house engineers", "dedicated project engineer", "sub-millimeter 3D shadow models", "kilohertz sampling", `keyProjects` in `business.ts` (Lutyens' Delhi, Amaravati Institutional Capital, Bandra Kurla Complex…), "Customer Stories & Installations" menu link (there are no stories), BIM/Revit/DWG "downloads" that do not exist → delete.
- **Monitoring app:** the "WAVENOX Live" phone mockup implies an app that does not exist. Say "Monitored through your inverter maker's app" or remove.
- **Certifications and "verified":** footer "BIS, IEC 61215, ALMM Approved Hardware", technology page "Verified Component Specifications" (while `specsVerified: false`), "CEA compliant", "Class A fire rated" → only if they come from the chosen real datasheet, shown with its link.
- **Guarantees:** "Zero Slab Damage Guarantee", "0% Terrace Damage", "Never.", "legally warranted", "Guaranteed 48-hour", "5-year waterproofing SLA", "Guaranteed Lowest Price" → delete.
- **Module:** "WAVENOX Monocrystalline TOPCon Series" implies we make modules. Choose one real ALMM-listed DCR N-type TOPCon module, link its datasheet, and derive every module number from it. Fix the contradictions:
  - front glass "3.2 mm" (SpecsDrawer) vs "2.0 + 2.0 mm dual glass" (products.ts);
  - "black backsheet" on a "dual-glass bifacial" module (a backsheet module is not dual-glass);
  - "Cell efficiency 22.8 %" — 22.8 % is module efficiency;
  - TOPCon uses a doped **poly-Si** passivating contact, not "microcrystalline silicon";
  - "completely eliminates LID" is false (TOPCon still has LeTID/UV-induced degradation);
  - "industry-leading −0.30 %/°C" is false (HJT is ≈ −0.24 to −0.26 %/°C);
  - "up to 8 % more power at 44 °C" — compute it: at ~70 °C cell temperature the gain versus −0.40 %/°C is ≈ 4–5 %; show the formula;
  - `/architects` labels "5400 Pa front (snow/uplift) / 2400 Pa rear (wind)" are swapped: front = static/snow load, rear = wind uplift.
- **Battery ("Omnigrid"):** it is fictional, and its dimensions/weight on `/architects` (750 × 1150 × 150 mm, 115 kg) mirror Tesla Powerwall 2 (753 × 1150 × 147 mm, 114 kg) while claiming a 14.3 kWh LFP pack — recognisable and physically implausible. Recommended: drop the "Omnigrid" product; talk about "a LiFePO4 home battery" with one real, India-available datasheet as the example. (Alternative: keep it as a clearly tagged concept product with self-consistent specs.) Also unify: "< 20 ms", "< 10 ms", "sub-4 ms", "sub-millisecond"; IP65/IP66/IP68; 6063-T6 vs 6005-T5; SS304 vs SS316; "Stack up to 4" vs studio max 3; "100 % solar self-use" vs engine 90 %.
- **Geography:** four different service areas (TG+AP; TG+AP+KA; five hubs incl. Mumbai & Delhi; "HYD, BLR, VIZ"). Use the Hyderabad-only default and derive every mention from `business.ts`.
- **Structured data:** remove `Product` schemas with `offers` (InStock, ₹2,80,000 etc.) for concept products; use `LocalBusiness`/`HomeAndConstructionBusiness` only with a real address; otherwise a minimal `Organization` + `WebSite`.
- **Proposal PDF (`ArchitecturalDossierModal.tsx`):** remove "CERTIFIED SOLAR ARCHITECTURE" seal, "Authorized Electronic Issuance", "Classification: Bespoke Engineering Proposal" and the auto-printed "✓ Net-Metering Sanction Feasible". Title it "Indicative solar estimate — not a quotation or engineering document", include inputs, assumptions, sources and the date.
- **`/our-story`:** the founding story and the quote attributed to "WAVENOX Architectural Engineering Studio" are invented. Rewrite as the honest concept story (why I designed it, what problem I explored) or remove the route.
- **Legal pages:** rewrite for a concept site (what data demo mode does/doesn't collect; DPDP Act 2023 and DPDP Rules 2025, notified Nov 2025 with phased timelines). Remove the fictional grievance-officer block unless a real person is named.

---

## PHASE 4 — Premium polish (keep the Tesla-grade DNA, make it unmistakably WAVENOX)

### 4.1 Keep the DNA, own the words
**Keep exactly:** full-bleed `100svh` photo panels, centred title + one-line lead, bottom-docked stat row with two pill CTAs, quiet white/`#F4F4F4` sections between panels, the monochrome palette with the single amber accent, Inter, 4 px buttons, generous whitespace, the mega menu pattern. Do not add sections, colours, gradients or decoration.

**Refine only the words:** several headings are Tesla's verbatim ("Solar Panels", "Power Through Outages", "Pay Less for Electricity", "Schedule a Virtual Consultation", "Monitor from Anywhere"). Propose WAVENOX-voiced alternatives of the same length and tone for each, show me a side-by-side, and apply only the ones I approve. "Order Now" promises an ordering flow that does not exist; propose a same-length alternative (e.g. "Design Yours", "Get Estimate") for my approval. Remove the words "exact replica" from the docs; describe Tesla as the benchmark for restraint.

### 4.2 Consistency inside the existing identity
- Tokens only: add an ESLint rule that fails on raw hex colours inside `className` (current code mixes `#171A20`, `#F9FAFB`, `#E5E7EB`, `#9CA3AF`, `#16181D`, `#10B981`, `#EF4444`…). Map everything to the existing tokens (`--ink`, `--ink-2`, `--muted`, `--line`, `--surface`, `--white`, `--accent`, `--danger`). One radius scale (today: 2/3/4/6/8 px and `rounded-full`), one shadow scale (mostly none).
- Minimum text size 12 px (every page currently has 5–34 elements at 9–11 px). Add a Playwright check.
- Rebuild `EnergyFlowSimulator` and `WealthCurveVisualizer` in the site's own monochrome + amber language (like the rest of the site) — no neon emerald/red/purple icon bubbles, no uppercase monospace labels. Keep them cinematic: large numbers, smooth amber flow lines, generous space.
- Signature interaction (real data, fits the DNA): a sun-path slider (SunCalc) over Hyderabad by month and hour, showing the roof shadow and the matching generation.
- Brand 404 and error pages in the same showroom style (currently the generic template).
- Remove `select-none` from header, footer and panels (users cannot copy the phone number or email today).

### 4.3 Imagery — regenerate, don't downgrade
Follow `docs/IMAGE_BRIEF.md` exactly (shot list, prompts, style and realism blocks, reject list). Problems to fix in the current renders:
- Non-Indian scenes: US-style streets and "ONLY" road markings (`commercial-hero`), an American-style suburb (`home-outage`), ocean clifftops (`res-hero`, `res-terrace`).
- Wrong story: the "power cut" in `home-outage` has lit streetlights and lit neighbours; `home-heat` is a black tablet, not a solar panel; `omnigrid-hero` reads as a TV bezel; `omnigrid-night` as a server rack.
- Engineering: panels lying flat with no visible mounting (`home-design`), arrays that no Indian installer would build.
- Duplicates and waste: `homes-hero` = `res-terrace`; `liquid-glass` (hexagonal cells don't exist) is unused — delete both.
- Continuity: desktop and mobile heroes show different houses. Mobile must be the same scene recomposed to 9:16 from the approved desktop render.
- Resolution: masters are 1376 px wide and mobile crops come from 430–610 px slices, so the build upscales them. New masters ≥ 2400 px; add `withoutEnlargement: true` to `scripts/build-images.mjs`, skip widths above the source, and fail the build on any upscale.
- Layout fit: every panel image keeps the top third calm for the title and the bottom quarter darker for the stat dock — check each one in the real page at 1440×900 and 390×844 before accepting it.
- Alt text: rewrite from what is actually visible (no "Jubilee Hills installation" claims).
- Show me 4 variants per shot and wait for my pick before replacing files.

### 4.4 Copy
Add `scripts/copy-lint.mjs` (run in `npm run lint`) that fails on these words in `src/`: Atelier, Monolithic, Sovereign, Bespoke, Institutional, Obsidian, Quantum, Dossier, Seamless, Apex, Kinetic, Nocturnal, Charter, Pillars, Command Center, Masterpiece, Ultra-luxury, Unparalleled, Elevate, Unleash, "Absolute power", "Zero compromise". (Today: Atelier 25×, Monolithic 18×, Dossier 53×, Architectural 64×, Estate 119×, Guarantee 35×.)
Voice: a calm Hyderabad engineer. Short sentences, specific sourced numbers, Indian English, ₹ with en-IN grouping, lakhs.

### 4.5 Clean-up
Remove unused shadcn components and unused dependencies (`framer-motion`, `recharts`, etc.) after confirming no imports. Keep the 4-column footer if you like it, but update the docs.

---

## PHASE 5 — Accessibility, performance, security

- **Keyboard:** the mega menu opens only on mouse hover. Rebuild with Radix `NavigationMenu` (already installed): opens on focus/Enter/ArrowDown, closes on Escape. Label the region-dialog close button. Toggle groups (bill presets, tiers, batteries, roof, payment, loads) → `radiogroup`/`aria-pressed`. Range inputs: visible focus ring (currently `outline:none`), Firefox `::-moz-range-thumb`, `aria-valuetext` ("₹8,000 per month").
- **axe-core:** today 162 colour-contrast nodes on 13 pages, heading-order on 12 pages, unlabelled range input on `/net-metering`. Target 0 serious/critical.
- **Performance** (local production build, mobile Lighthouse: Performance 60, LCP 8.3 s on `/`, 6.7 s on `/deploy`; ~270 KB unused JS): lazy-load `ConsultationDrawer` on first open; keep zod out of the client bundle; load only needed font subsets; long cache headers for `/media/*` with versioned filenames. Re-measure on the deployed URL with PageSpeed Insights — target Performance ≥ 90, LCP < 2.5 s.
- **Security headers** in `public/_headers`: CSP, HSTS, `X-Content-Type-Options`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`, `frame-ancestors 'none'`.
- **Bots:** Cloudflare Turnstile on forms (server-side token check) + simple per-IP rate limit in the server function (live mode).
- **Analytics:** Cloudflare Web Analytics (cookie-less) or none; reflect it in the privacy page.

---

## PHASE 6 — New features (in this order; each with sources and tests)

1. **Bill decoder:** "Your ₹3,000 TGSPDCL bill ≈ N units/month" using the real slabs and fixed charges, with a slab-by-slab breakdown.
2. **Monthly generation chart** for the chosen city from committed NASA POWER / PVWatts data.
3. **Roof sketcher:** draw the usable terrace on satellite tiles (Leaflet + Esri World Imagery, with attribution); subtract setbacks/walkways and the water-tank footprint; get area → panel layout → kW, feeding the studio.
4. **Battery honesty advisor:** backup hours for chosen loads using realistic averages (BEE-label-level figures, sourced), and a plain statement when a battery does not pay back under net metering.
5. **PM Surya Ghar journey:** the official steps, document checklist and links to pmsuryaghar.gov.in; no promised timelines.
6. **"Sources & assumptions" popover** on every number.
7. **Telugu (and optionally Hindi) toggle** for the homepage and calculators, with `hreflang`.
8. **Colophon / case study page** (`/about-this-project`): problem, research, design system, data sources with dates, before/after screenshots, image credits, tech stack — the portfolio centrepiece.
9. **Sun-path shading preview** (Phase 4.2 signature interaction), if not done yet.

---

## PHASE 7 — QA and documentation

- **Playwright** (`tests/e2e`): every route returns 200, exactly one `<h1>`, one `<main>`; logo visible at `scrollY=0`; no text < 12 px; axe 0 serious/critical; no console errors; three hero stats on one line at 1024/1440; home kW == studio kW; each form reaches the correct honest end state in demo mode.
- **Vitest:** subsidy (incl. special category), TG slab charges and inverse, EMI, 25-year projection, simulator energy balance and SOC bounds, degradation table.
- **Lint:** Prettier + hex-colour rule + copy-lint all green.
- **Docs:** rewrite README, Rules.md, design.md, Architecture.md, pmd.md, Memory.md, Tasks.md to match reality: keep the Tesla-inspired DNA rules, drop "exact replica" wording, update the footer rule to the 4-column footer, and remove the false "0 lint errors / 0 text below 12 px" claims. Add `docs/SOURCES.md` listing every source URL with its verified date.
- **Final report:** summary of changes, before/after screenshots (1440 and 390), Lighthouse from the deployed preview, and any open questions for me.

## ACCEPTANCE CHECKLIST

- [ ] No invented company facts: entity, addresses, offices, SLAs, partners, certifications, customers, projects, guarantees (grep proves it).
- [ ] Concept credit visible in the footer and on `/about-this-project`.
- [ ] Every number on screen traces to `src/config/*` with a source and date.
- [ ] Subsidy, tariff, tax, loan, wind and ALMM facts match Phase 2 (tests pass).
- [ ] Every render passes the reject list in `docs/IMAGE_BRIEF.md`, is at least as striking as the one it replaces, and was approved by me; alt text matches images; no upscaled variants; renders credited as concept visuals.
- [ ] Tesla-grade DNA intact: full-bleed panels, stat dock, pill CTAs, monochrome + amber, quiet sections.
- [ ] No banned words; no raw hex in components; min text 12 px.
- [ ] Header visible on every route; hero stats never wrap; home and studio agree.
- [ ] Every form either really submits or honestly says it is a demo.
- [ ] `tsc`, `vitest`, `eslint` (0 errors), `build`, Playwright and axe all green.
- [ ] Lighthouse (deployed, mobile): Performance ≥ 90, Accessibility ≥ 98, SEO 100.

## REFERENCE SOURCES (verify again before committing; store in `docs/SOURCES.md`)

- PM Surya Ghar CFA amounts and process — https://pmsuryaghar.gov.in ; summaries: https://www.surgepv.com/blog/pm-surya-ghar-guide-for-epcs , https://freyrenergy.com/solar-subsidy-in-india/
- ALMM List-II (cells) from 1 June 2026 and the Dec-2026 net-metering exemption — https://myrsolar.com/almm-list-ii-solar-cells , https://www.solarsquare.in/blog/mnre-approved-solar-panels-new-almm-list-2-rule/
- Income-tax Act, 2025 (Section 34 depreciation) — https://www.incometaxindia.gov.in/documents/d/guest/income_tax_act_2025_as_amended_by_fa_act_2026-pdf , https://taxguru.in/income-tax/depreciation-income-tax-act-2025-section-34-rates-provisions.html
- TGERC Retail Supply Tariff Order FY 2025-26 — https://www.tgerc.telangana.gov.in/file_upload/uploads/Tariff%20Orders/Current%20Year%20Orders/2025/RST%20Order%20FY%202025-26%20FINAL.pdf ; tariff schedule — https://tgsouthernpower.org/resources/PDF/Tariffs/63tarifffile.pdf
- TGERC ToD order (Nov 2025) — https://www.tgerc.telangana.gov.in/file_upload/uploads/Tariff%20Orders/Current%20Year%20Orders/2025/TGERC%20ToD%20Order%202025-26%2015112025.pdf
- IS 875 (Part 3):2015 basic wind speeds — https://infralens.in/handbook/wind-speed
- Rooftop rules (feasibility waiver ≤10 kW, 15-day timelines) — https://www.mercomindia.com/rooftop-solar-10-kw-exempted-feasibility-study-mandate , https://www.scconline.com/blog/post/2024/02/27/mop-notifies-electricity-rights-of-consumer-amendment-rules-2024-legal-news/
- SBI PM Surya Ghar loan terms — https://myrsolar.com/sbi-pm-surya-ghar-solar-loan (confirm on sbi.co.in)
- DPDP Rules, 2025 — https://www.pib.gov.in/PressReleasePage.aspx?PRID=2190014
- Tesla Powerwall 2 dimensions (to avoid mirroring) — https://www.cahillrenewables.co.uk/tesla-powerwall-dimensions-a-comprehensive-guide/
