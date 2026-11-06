# WAVENOX — STEP 4 IMPLEMENTATION PLAN
## Intelligent Solar Configurator & Personalized Design Studio (`/deploy`)

- **Repository:** `https://github.com/wavenoxx/wavenox.git`
- **Verified Step 3 Base Commit:** `46e9fb79d2b15844c1f12871aeb847ff22cd6b15` (`feat/wavenox-step3-solar-engine`)
- **Step 4 Feature Branch:** `feat/wavenox-step4-intelligent-configurator`

---

## 1. Phase A — Existing Experience Audit & Baseline Findings

Before editing any code, the existing `/deploy` Design Studio (`SystemConfigurator.tsx`, `RoofSketcher.tsx`, `BillDecoder.tsx`, `MonthlyGenerationChart.tsx`, `WealthCurveVisualizer.tsx`, `ArchitecturalDossierModal.tsx`, `BatteryHonestyAdvisor.tsx`, `src/routes/deploy.tsx`, and `src/config/solar.ts`) was audited across code, automated tests (`68/68` unit tests passing), and real Playwright screenshots (`qa-step4-before/` at `390×844` mobile and `1440×900` desktop).

### Genuine Defects & UX Gaps Identified in Baseline

1. **RoofSketcher Physical & Regional Calculation Defects (`src/components/RoofSketcher.tsx`):**
   - **Artificial 200 sq.ft. Floor (`Math.max(200, net)`):** Line 53 forces `netUsableSqft` to at least `200 sq.ft.` (`6 panels` / `3.48 kW`) even when parapet setbacks, water tanks, and walkways exceed the gross terrace area (e.g., `600 sq.ft.` gross minus `490 sq.ft.` setback, `400 sq.ft.` tank, and `300 sq.ft.` walkway = `-590 sq.ft.`, which falsely reported `200 sq.ft.` usable and `3.48 kW`).
   - **Contradictory Capacity Formula (`32 sq.ft./panel` vs `validateRoofFeasibility()`):** `RoofSketcher` computed `Math.floor(netUsableSqft / 32)` with an outdated `550W` comment instead of delegating to `validateRoofFeasibility()` from `src/config/solar.ts` (`580W` modules from `PRODUCTS_CONFIG`, `27.8 sq.ft.` physical module footprint vs `100 sq.ft./kW` recommended shadow-free clear installation area).
   - **Hardcoded Hyderabad Yield (`1490 / 12`):** Line 60 hardcoded `1490 / 12` for monthly generation regardless of the selected DISCOM's regional solar meteorology profile (`getSolarYieldProfileForDiscom(discomCode)`).
   - **Unlabeled Sample Satellite Presets:** `HYDERABAD_PRESETS` were presented without disclosing that they are sample reference coordinates rather than the customer's actual surveyed roof.
   - **Cramped `lg:grid-cols-12` Layout Inside Studio Column:** When opened inside the 42%-wide right column of `/deploy` on desktop (`1440×900`), `lg:grid-cols-12` split a ~500px container into two ~230px sub-columns, causing the `"Gross: 600 sq.ft"` and `"Net Solar Zone: 200 sq.ft"` labels to collide with the panel blocks and red `"Mumty / Tank"` box.

2. **Silent Overwrite of Manual Customer Panel Customizations (`src/components/SystemConfigurator.tsx`):**
   - Changing the monthly bill (`handleBillChange`) or DISCOM (`handleDiscomChange`) unconditionally overwrote `panelCount` with `rec.recommendedPanels`, silently erasing a customer's custom panel count.
   - There was no visual distinction between the **Recommended System** (`recommendedKw` / `recommendedPanels`) and a **Customer-Selected Configuration** (`systemKw` / `panelCount`), nor a choice to **"Keep current configuration"** vs **"Apply updated recommendation"** when bill or DISCOM changed during a custom override.

3. **Unsupported / Invalid URL Handoff & `UNAVAILABLE` Display (`src/routes/deploy.tsx`, `src/components/SystemConfigurator.tsx`, `src/components/BillDecoder.tsx`):**
   - Visiting `/deploy?bill=abc&discom=FAKECO` passed `bill: NaN` from `validateSearch` and fell back in `SystemConfigurator.tsx` (`DISCOMS.find(...) || DISCOMS[0]`) to displaying `TGSPDCL` ("Telangana Southern Power Distribution Company") in the selector and TGERC regulatory notes, while `calculation.status === "UNAVAILABLE"` rendered as `"Indicative Regional Benchmark"` and displayed **`₹0` Annual Bill Savings** in the hero stats dock as if solar genuinely saved `₹0`.
   - Per Phase F & Phase I requirements, invalid URL parameters must be sanitized safely, unsupported DISCOMs must never be presented as verified Telangana calculations, and `UNAVAILABLE` calculations must never display `₹0` savings as a real-world result (instead showing `"Detailed regional calculation unavailable — advisor assessment required."`).

4. **Missing Stage 1 Property & Engineering Input Modes ("Help me estimate" vs "I know my details"):**
   - Customers had no way in `/deploy` to optionally enter their actual monthly kWh consumption (`monthlyUnitsOverride`), known available roof area (`availableRoofSqft`), or electricity-bill sanctioned load (`sanctionedLoadKw` and `sanctionedLoadConfirmed`), forcing every configuration to rely solely on an unverified 5 kW sanctioned-load baseline.

5. **Overstated Battery Copy & Missing Solar-Only vs Solar + Battery Guidance (`src/components/SystemConfigurator.tsx`):**
   - `BATTERY_OPTIONS` for 2 units stated `"Whole-home backup. Fast transfer powering up to 4 air conditioners"` without qualification, and did not display unit price (`₹2,80,000` per `14.3 kWh` usable LFP unit from `SOLAR_ASSUMPTIONS` / `PRODUCTS_CONFIG`), total storage outlay, solar-only grid-shutdown behavior, inverter/wiring/protected-load compatibility disclosures, or illustrative backup-priority guidance.

6. **Non-Scheme Financing Prepayment Caveat (`Phase G`):**
   - When `!calculation.financing.isSchemeEligible` (e.g., `> 10 kW` or `> ₹6,00,000` initial solar loan principal), the financing breakdown still presented Month-3 DBT loan principal prepayment and recast EMI without clarifying that direct loan-account DBT prepayment is a verified rule for SBI PM Surya Ghar scheme loans (`≤ 10 kW`, `≤ ₹6,00,000`) and is only an illustrative modeling scenario alongside the unadjusted EMI for non-scheme loans.

7. **Dossier Modal Mobile Header / Table Collision & Missing Assessment Fields (`src/components/ArchitecturalDossierModal.tsx`):**
   - At `390×844` mobile, the modal header button wrapped across 3 cramped lines and the BoM table headers (`COMPONENT DESCRIPTION` / `ENGINEERING SPECIFICATION`) collided horizontally (`COMPONENT ENGINEERING DESCRIPTIONSPECIFICATION`).
   - The preview needed explicit `"Preliminary Solar Assessment"` / `"Indicative System Design"` / `"Subject to Site Survey and Formal Quotation"` labeling, recommended vs customer-selected sizing, roof & sanctioned-load feasibility status/warnings, financing assumptions when loan mode is active, regulatory verification status, and clear disclosure that `Print / Save PDF` invokes the browser's print dialog rather than issuing a server-certified engineering stamp.

8. **Form Validation & Mobile Summary Ergonomics (`src/components/SystemConfigurator.tsx`):**
   - Native HTML5 tooltip validation intercepted invalid PIN inputs without triggering accessible inline field/form errors, and disabling the submit button when `!consentGiven` prevented users who clicked submit from seeing the explicit consent error message (`"Please confirm your consent to receive your proposal."`).

---

## 2. Step 4 Architecture & Implementation Strategy

### Phase B & C — Pure Recommendation Layer (`src/config/recommendation.ts`)
Create a deterministic, explainable, unit-tested recommendation module (`buildSolarRecommendation()`) layered strictly **above** `estimate()` and `validateRoofFeasibility()` in `src/config/solar.ts` and `PRODUCTS_CONFIG` in `src/config/products.ts` (zero duplicate tariff, subsidy, EMI, net-metering, or 25-year projection math):
- Accepts user property & configuration state (`discomCode`, `monthlyBillInr`, `inputMode: "estimate" | "known"`, `monthlyUnitsOverride`, `roofProfile`, `availableRoofSqft`, `sanctionedLoadKw`, `sanctionedLoadConfirmed`, `selectedPanels`, `isManualPanelOverride`, `selectedBatteryUnits`, `backupPriority`, `paymentMode`).
- Calls `estimate()` once for the active configuration and derives:
  - `recommendedCapacityKw`, `recommendedPanels`, `currentSelectedPanels`, `currentSelectedKw`, `isCustomPanelSelection`
  - `recommendationStatus`: `"Recommended"` | `"Customer Selected"` | `"Requires Site Assessment"` | `"Utility Verification Required"`
  - `explanation`: plain-language, non-AI explanation of **why** the system is recommended and what assumptions apply.
  - `roofFeasibility` & `sanctionedLoadFeasibility` summaries with actionable guidance (e.g., one-click `"Fit to Available Roof"` when roof-constrained).
  - `batteryGuidance`: structured comparison between **Solar Only** and **Solar + Omnigrid LFP Storage** (`0, 1, 2, 3` units) using `PRODUCTS_CONFIG.battery` (`14.3 kWh` usable / `15.0 kWh` nominal, `6.0 kW` continuous / `10.0 kW` peak, `< 20 ms` transfer, `91.5%` RTE, `10-year` / `6,000-cycle` OEM warranty) and `SOLAR_ASSUMPTIONS.battery.unitPriceInr` (`₹2,80,000/unit`), plus illustrative load-band guidance for customer backup priorities without falsely precise whole-home runtime guarantees.
  - `financingAvailability`: distinguishes verified SBI PM Surya Ghar scheme eligibility (`Tier 1: 6.00%`, `Tier 2: 8.15%`) from non-scheme illustrative scenarios (`9.15%`), exposing both initial/unadjusted EMI and illustrative post-subsidy recast EMI.

### Phase D — Roof Sketcher Engineering Reconciliation (`src/components/RoofSketcher.tsx`)
- Extract and export a pure, deterministic helper `calculateRoofSketcherGeometry()` so roof geometry and deduction math can be unit-tested directly:
  - `rawNetSqft = grossAreaSqft - setbackDeductionSqft - waterTankSqft - walkwaySqft`
  - `netUsableSqft = Math.max(0, rawNetSqft)` — **never** artificially inflated to `200 sq.ft.`. Permits `0 sq.ft.` and flags `isObstructionOverflow = rawNetSqft <= 0` or `netUsableSqft < minOnePanelClearSqft`.
  - Uses `PRODUCTS_CONFIG.module.ratedPowerW` (`580W`), `SOLAR_ASSUMPTIONS.panelFootprintSqft` (`27.8 sq.ft.` physical module footprint), and `validateRoofFeasibility()` (`100 sq.ft./kW` clear installation area = `58 sq.ft./panel` clear roof requirement) so `RoofSketcher` and `validateRoofFeasibility()` agree 100%.
  - Uses `getSolarYieldProfileForDiscom(discomCode)` so monthly and annual generation reflect the selected DISCOM's actual regional yield profile (or `UNAVAILABLE` when unverified) — never defaulting non-Hyderabad regions to `1490 / 12`.
  - Clearly labels satellite presets as **Sample Reference Locations (Illustrative Map Preview — Not Your Surveyed Roof)** and adapts the default sample preset to the selected DISCOM's city while keeping Hyderabad presets available.
  - Fixes the internal layout so it renders cleanly inside the `/deploy` right column without text collision or horizontal overflow at `320px`, `390px`, `768px`, `1024px`, and `1440px`.

### Phase B, E, F, G, H, I, J, K — Guided 6-Stage Design Studio (`src/components/SystemConfigurator.tsx` & modular subcomponents)
Organize the `/deploy` right-hand studio into a calm, progressive 6-stage journey while preserving all existing Step 1–3 capabilities and E2E selectors:
1. **Stage 1 — Understand Your Property (`1. Electricity Board & Property Details`):**
   - DISCOM selector (including safe handling when an unsupported `discom` query param is passed), verification badge (`Verified {authority} Schedule` / `Indicative Regional Benchmark` / `Utility Verification Required`), monthly electricity bill slider + presets, and `BillDecoder`.
   - Segmented mode toggle: **"Help me estimate"** (default) vs **"I know my details"** (optional actual monthly kWh consumption, known available roof area in sq.ft., and electricity-bill sanctioned load in kW with a `"Verified from my electricity bill"` checkbox).
2. **Stage 2 — Recommended Solar System (`2. Recommended Solar System`):**
   - Explainable recommendation card showing Recommended Capacity (`recommendedKw` kW · `recommendedPanels` × `580W TOPCon` modules), Indicative Annual Generation, Estimated Clear Roof Needed (`~X sq.ft.`), Indicative Bill Offset, Verification Status badge, and plain-language explanation of why this size is recommended.
3. **Stage 3 — Customize Your Solar Design & Roof Feasibility (`3. Customize Solar Capacity & Roof Planning`):**
   - Capacity tier buttons (`Small`, `Medium`, `Large`, `Extra Large`) + `- / +` custom panel stepper (`580W TOPCon`).
   - Clear badge distinguishing **`Recommended`** vs **`Customer Selected`**.
   - **Manual Override Preservation Banner:** When the customer has manually customized the panel count and then changes their bill or DISCOM, their custom panel count is preserved and a choice banner appears: **"Keep current configuration ({systemKw} kW)"** or **"Apply updated recommendation ({recommendedKw} kW)"**.
   - Integrated Roof Profile (`RCC Flat Slab`, `Sloped Tile`, `Standing-Seam`), Physical Module Area vs Recommended Shadow-Free Roof Area, Roof & Sanctioned-Load feasibility warnings, and the interactive `RoofSketcher` drawer.
4. **Stage 4 — Explore Battery Storage (`4. Omnigrid Storage & Backup Planning`):**
   - `0, 1, 2, 3` unit selector reading specs from `PRODUCTS_CONFIG.battery` and `SOLAR_ASSUMPTIONS.battery`.
   - Clear side-by-side comparison of **Solar Only (Grid-Tied)** vs **Solar + Omnigrid LFP Backup**, optional customer backup priority selector (`Essential lighting & fans`, `Wi-Fi & workstations`, `Refrigerator & kitchen circuits`, `Extended backup with 1 inverter AC`), illustrative load-band runtime ranges with honest load/inverter/wiring caveats, and an expandable `BatteryHonestyAdvisor` drawer.
5. **Stage 5 — Understand Cost, Subsidy & Financing (`5. Cost, Subsidy & Investment Structure`):**
   - Toggle between `5-Year Financing` and `Direct Purchase`.
   - Explicit separation of **Gross Installed System Cost**, **Potential Post-Commissioning DBT Subsidy (Conditional)**, **Conditional Cost After Potential DBT**, and **Cash vs Indicative Bank / Financing Scenario** (including non-scheme loan prepayment safeguard when `!calculation.financing.isSchemeEligible`).
   - Safe handling of `UNAVAILABLE` status: never shows `₹0` savings as a real figure when regional data is unavailable; displays `"Detailed regional calculation unavailable — advisor assessment required."`
   - Preserves `WealthCurveVisualizer` and `MonthlyGenerationChart`.
6. **Stage 6 — Review Summary & Request Assessment (`6. Review Configuration & Request Solar Proposal`):**
   - Live **Personalized Configuration Summary** card showing Selected DISCOM, Consumption Basis, Recommended vs Selected System, Modules, Battery Configuration, Estimated Yearly Generation, Roof Feasibility Status, Sanctioned Load Status, Gross Installed Cost, Potential Subsidy, Conditional Cost After Subsidy, Indicative Annual Bill Savings, and Cash/Financing Status.
   - Optional **Preliminary Solar Assessment (`ArchitecturalDossierModal`)** preview and print-to-PDF.
   - Secure Step 1 lead form (`submitLead` with `source: "studio"`, DPDP consent, honeypot, session-bound confirmation, explicit DEMO/LIVE handling, and accessible inline validation).

---

## 3. Files to Create or Modify

| File | Action | Purpose |
| --- | --- | --- |
| `src/config/recommendation.ts` | Create | Pure, deterministic Step 4 recommendation, feasibility summary, and battery guidance layer above `estimate()` and `validateRoofFeasibility()`. |
| `src/config/recommendation.test.ts` | Create | Unit tests for recommendation behavior, manual override preservation, roof sketcher geometry, battery guidance, and `UNAVAILABLE` handling. |
| `src/components/RoofSketcher.tsx` | Modify | Remove `Math.max(200, net)` floor, permit `0 sq.ft.`, reconcile with `580W` modules & `validateRoofFeasibility()`, use regional DISCOM solar yield, label sample satellite presets clearly, and fix narrow-column layout collisions. |
| `src/components/BillDecoder.tsx` | Modify | Handle `UNAVAILABLE` DISCOM status gracefully without displaying `≈ 0 units/month` as an indicative regional benchmark. |
| `src/components/ArchitecturalDossierModal.tsx` | Modify | Upgrade to include Preliminary Solar Assessment terminology, recommended vs selected sizing, roof & sanctioned-load feasibility warnings, financing assumptions, regulatory status, and responsive mobile table/header layout. |
| `src/components/SystemConfigurator.tsx` | Modify | Implement the 6-stage guided configurator journey, `"Help me estimate"` vs `"I know my details"` inputs, manual override preservation with Keep/Apply choice, honest battery guidance, live configuration summary, `UNAVAILABLE` safeguards, and accessible form validation. |
| `src/routes/deploy.tsx` | Modify | Harden `validateSearch` so invalid `bill` (`NaN`, negative, `Infinity`) and empty `discom` query parameters are safely normalized. |
| `scripts/run-e2e-audit.mjs` | Modify | Add Step 4 E2E checks covering URL handoff, recommendation & manual override preservation, roof planner valid/insufficient states, battery selection, cash/loan switching, dossier preview, and form error/submission states. |
| `docs/STEP4_IMPLEMENTATION_PLAN.md` | Create | Phase A audit and implementation plan. |
| `docs/STEP4_CONFIGURATOR_ARCHITECTURE.md` | Create | Detailed Step 4 architecture documentation. |
| `docs/STEP4_EXECUTION_REPORT.md` | Create | Full Step 4 execution report with before/after visual QA and verification metrics. |
