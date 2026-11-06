# WAVENOX — STEP 4 CONFIGURATOR ARCHITECTURE
## Intelligent Solar Configurator & Personalized Design Studio (`/deploy`)

---

## 1. Architectural Overview

The WAVENOX Design Studio (`/deploy`) uses a **two-layer deterministic architecture**:
1. **Verified Step 3 Calculation Engine (`src/config/solar.ts`, `src/config/regulatory.ts`, `src/config/products.ts`):**
   - Single source of truth for state electricity tariffs (`TGSPDCL`, `TGNPDCL`, `APEPDCL`, `APSPDCL` verified; regional benchmarks indicative), 12-month billing-period net-metering settlement, `580W` N-Type TOPCon module sizing, `validateRoofFeasibility()`, `evaluateSanctionedLoadFeasibility()`, PM Surya Ghar central subsidy evaluation, `calculateSolarFinancing()` (SBI Green Loans eff. `2026-10-15`), and `project25Years()`.
2. **Step 4 Explainable Recommendation & Guidance Layer (`src/config/recommendation.ts`):**
   - Pure, stateless, unit-tested layer (`buildSolarRecommendation()`, `calculateRoofSketcherGeometry()`, `buildBatteryGuidance()`) that consumes Step 3 outputs without duplicating any tariff, net-metering, subsidy, EMI, or 25-year projection math.

---

## 2. Input State & Precision Modes

`SystemConfigurator` (`src/components/SystemConfigurator.tsx`) owns a single cohesive state tree across 6 customer-facing stages:

- **URL Query Handoff (`src/routes/deploy.tsx`):**
  - `validateSearch` sanitizes `?bill=...&discom=...` so `NaN`, negative, or zero bills fall back safely to `₹12,000/month`, while unknown DISCOM strings are passed through to trigger explicit `"Utility Verification Required"` (`UNAVAILABLE`) handling rather than silently falling back to Telangana (`TGSPDCL`).
- **Property & Consumption Precision Mode (`inputMode: "estimate" | "known"`):**
  - **`"Help me estimate"` (Default):** Requires only DISCOM selection and monthly electricity bill (`₹3,000–₹75,000` slider or presets).
  - **`"I know my details"` (Optional Precision Inputs):** Exposes optional inputs for:
    - Actual monthly electricity consumption (`monthlyUnitsOverride` in kWh/month)
    - Known available shadow-free roof area (`availableRoofSqft` in sq.ft., synchronized with `RoofSketcher`)
    - Sanctioned load (`sanctionedLoadKw` in kW) + explicit checkbox (`sanctionedLoadConfirmed`: *"This sanctioned load is verified from my printed electricity bill"*)

---

## 3. Recommendation State & Manual Override Preservation

`buildSolarRecommendation(input)` returns a typed `SolarRecommendationResult`:
- `recommendedCapacityKw` and `recommendedPanels` (from Step 3 `estimate()`)
- `currentSelectedKw` and `currentSelectedPanels`
- `isCustomPanelSelection` and `panelDeltaFromRecommended`
- `recommendationStatus`:
  - `"Utility Verification Required"` when `estimateResult.status === "UNAVAILABLE"`
  - `"Requires Site Assessment"` when `!roofFeasibility.isFeasible || sanctionedLoadFeasibility.requiresLoadEnhancement`
  - `"Customer Selected"` when `isCustomPanelSelection === true`
  - `"Recommended"` when matching the consumption-based recommendation without hard constraints
- `explanation`: Plain-language rationale citing the consumption basis, DISCOM, regional yield (`kWh/kWp/yr`), and recommended clear roof area (`~100 sq.ft./kW`).

### Manual Override Behavior
- When a customer clicks a sizing tier (`Small`, `Medium`, `Large`, `Extra Large`) or adjusts the `- / +` panel stepper, `isManualPanelOverride` becomes `true`.
- If the customer subsequently changes their monthly electricity bill or DISCOM while `isManualPanelOverride === true`, the studio **never silently overwrites** their custom `panelCount`. Instead, it displays an interactive choice banner (`data-testid="manual-override-banner"`):
  - **Keep current configuration (`{systemKw} kW`)**
  - **Apply updated recommendation (`{recommendedCapacityKw} kW`)**

---

## 4. Roof Calculation Integration (`calculateRoofSketcherGeometry` & `RoofSketcher`)

`calculateRoofSketcherGeometry()` in `src/config/recommendation.ts` powers `src/components/RoofSketcher.tsx`:
- **No Artificial Minimum Floor:** Computes `rawNetSqft = grossAreaSqft - setbackDeductionSqft - waterTankSqft - walkwaySqft` and `netUsableSqft = Math.max(0, rawNetSqft)`. Eliminates the legacy `Math.max(200, net)` bug and permits valid `0 sq.ft.` usable roof area.
- **580W Module & `validateRoofFeasibility()` Alignment:** Reads `PRODUCTS_CONFIG.module.ratedPowerW` (`580W`), distinguishes physical module glass area (`27.8 sq.ft./panel`) from recommended shadow-free clear installation area (`58.0 sq.ft./panel` at `100 sq.ft./kW`), and delegates feasibility validation to Step 3 `validateRoofFeasibility()`.
- **Regional Solar Meteorology:** Uses `getSolarYieldProfileForDiscom(discomCode)` so monthly/annual generation reflects the selected DISCOM (`1490` Hyderabad, `1460` Visakhapatnam, `1440` Bengaluru, `1450` Mumbai, etc., or `UNAVAILABLE` for unknown utilities).
- **Sample Satellite Map Disclosure:** Sample presets are explicitly labeled as illustrative examples (`Sample Roof Sizes (Examples Only)` / `Sample Satellite Map`) and never represented as automatic rooftop detection or satellite shade analysis.

---

## 5. Battery Configuration & Backup Guidance (`buildBatteryGuidance`)

`buildBatteryGuidance()` reads all hardware parameters directly from `PRODUCTS_CONFIG.battery` (`14.3 kWh` usable / `15.0 kWh` nominal LiFePO4, `6.0 kW` continuous / `10.0 kW` peak, `< 20 ms` islanding transfer, `91.5%` round-trip efficiency, `10-year` / `6,000-cycle` OEM warranty) and `SOLAR_ASSUMPTIONS.battery.unitPriceInr` (`₹2,80,000/unit`):
- Compares **Solar Only (`0 Units · Grid-Tied`)** (mandatory anti-islanding shutdown during grid outages) against **Solar + Omnigrid LFP (`1, 2, 3 Units`)**.
- Provides 4 customer outage priority profiles (`Essential Lighting & Fans`, `Wi-Fi, Workstations & Security`, `Refrigerator & Home Circuits`, `Extended Backup + Inverter AC`) with illustrative runtime ranges (`~low–high hrs at min–max W`) rather than unverified single-number whole-home backup promises.
- Integrates the interactive `BatteryHonestyAdvisor` appliance-by-appliance drawer for customers who want to toggle individual BEE-rated appliances.

---

## 6. Financial Presentation & `UNAVAILABLE` Safeguards

- **Strict Distinction of Capital & Subsidy:** Clearly separates **Gross Installed System Cost** (with Solar vs Battery capex breakdown), **Potential Post-Commissioning DBT Subsidy (Conditional)**, and **Conditional Cost After Potential DBT**.
- **Cash vs Indicative 5-Year Financing:** Preserves Step 3 `calculateSolarFinancing()`. When `!calculation.financing.isSchemeEligible` (e.g., `> 10 kW` or `> ₹6,00,000` initial solar loan principal), explicitly labels Month-3 DBT prepayment and recast EMI as an illustrative scenario subject to lender terms and displays the unadjusted monthly EMI alongside it.
- **`UNAVAILABLE` Handling:** When `calculation.status === "UNAVAILABLE"`, the UI never displays `₹0` savings as if solar saves nothing; it displays `"Detailed regional calculation unavailable — advisor assessment required."`

---

## 7. Preliminary Proposal (`ArchitecturalDossierModal`) & Secure Lead Submission

- **Preliminary Proposal Preview (`src/components/ArchitecturalDossierModal.tsx`):**
  - Uses explicit non-binding terminology: `"Preliminary Solar Assessment"`, `"Indicative System Design"`, and `"Subject to Site Survey and Formal Quotation"`.
  - Displays recommended vs customer-selected sizing, DISCOM & verification status, roof & sanctioned-load feasibility statuses/warnings, conditional subsidy & financing assumptions, and 4-step post-request delivery milestones.
- **Lead Conversion (`submitLead` in `src/functions/leads.ts`):**
  - Preserves Step 1 fail-closed LIVE mode and explicit DEMO mode (`WNX-DEMO-XXXXXX`).
  - Validates full name, 10-digit Indian mobile number, city/locality, 6-digit PIN code, and mandatory DPDP Act 2023 consent (`consent_version: "2026-11-v2"`, `source: "studio"`) with accessible inline error alerts (`#studio-form-error`, `role="alert"`).
  - Never stores customer PII in URLs or persistent `localStorage`; uses session-scoped, 24-hour-bounded `sessionStorage` solely for the `/order/received` confirmation handoff.

---

## 8. Known Limitations & Release Checklist Items

- **TGERC Proceeding Identifier & Non-Scheme Prepayment:** Step 3 models Telangana surplus export settlement at `₹2.57/kWh` per TGERC `Proceedings No. TGERC/Secy/77/2025` (`29.12.2025`) and models non-scheme loans (`> 10 kW` or `> ₹6,00,000`) at an illustrative `9.15% p.a.` rate. Step 4 preserves all Step 3 formulas and explicitly discloses that direct loan-account DBT prepayment is verified for SBI PM Surya Ghar scheme loans and is illustrative/subject to lender terms for non-scheme loans.
- **2D Roof & Backup Estimates:** Online roof planning (`100 sq.ft./kW`) and backup runtime bands are preliminary estimates and do not replace an on-site structural, shading, and electrical distribution survey.
