# WAVENOX — STEP 3 EXECUTION REPORT

## 1. Repository & Branch Status

- **Repository:** `https://github.com/wavenoxx/wavenox.git`
- **Base Branch Verified:** `feat/wavenox-step2-experience` (`ca073199b53d7db52e3424990e5860f6fe89`)
- **Step 3 Feature Branch:** `feat/wavenox-step3-solar-engine`
- **Target Branch for Draft PR:** `feat/wavenox-step2-experience` (never merged to `main`, never force-pushed, no live database or production deployment executed)

---

## 2. Calculation & Regulatory Audit Summary

During the baseline audit of `src/config/regulatory.ts`, `src/config/solar.ts`, `src/config/sources.ts`, and consumer-facing UI surfaces, 10 critical engineering and regulatory discrepancies were identified and resolved:

1. **Non-Telangana DISCOM Misrepresentation:** `src/config/regulatory.ts` previously applied Telangana's TGERC LT-I(A/B/C) telescopic slab function (`energyCharge()`, `calculateMonthlyElectricityBill()`, `decodeBill()`) to every DISCOM, while `solar.ts` listed 11 DISCOMs across 7 states.
2. **Stale PM Surya Ghar Central Subsidy Citations:** `src/config/sources.ts` and `src/components/PmSuryaGharJourney.tsx` contained outdated `₹30,000 + ₹30,000 + ₹28,000` (`₹88,000` / `₹94,800`) bracket labels, conflicting with the verified MNRE CFA structure (`₹30,000/kW` up to 2 kW + `₹18,000` for the 3rd kW = **`₹78,000`** cap, **`₹85,800`** in Special Category States).
3. **Unconditional Residential Subsidy Assumption:** `solar.ts` automatically applied PM Surya Ghar subsidy without evaluating consumer category, ownership status, prior subsidy history, or ALMM/DCR domestic content module eligibility.
4. **Gross vs. Post-DBT Cost Ambiguity:** Battery storage capex (`₹1,95,000` per `5.12 kWh` LFP unit) was mixed with solar capex without clearly distinguishing non-subsidized battery capex and post-commissioning Direct Benefit Transfer (DBT) timing.
5. **Single-City Meteorology for All States:** Only Hyderabad PVGIS TMY data (`1,490 kWh/kWp/yr`) was modeled in `regulatory.ts`, while `solar.ts` hardcoded `1,450 kWh/kWp/yr` for all states.
6. **Hardware Wattage Label Drift (`550W` vs `580W`):** `PRODUCTS_CONFIG.module.ratedPowerW` is `580W` N-Type TOPCon, whereas `SystemConfigurator.tsx` and `RoofSketcher.tsx` still displayed `550W` in UI labels.
7. **Cash vs. Financed 25-Year Projection Conflation:** `WealthCurveVisualizer.tsx` and `ArchitecturalDossierModal.tsx` only plotted an all-cash purchase curve, and `ArchitecturalDossierModal.tsx` duplicated its own 25-year loop with hardcoded `1,450` and `9.2` constants.
8. **Outdated SBI Surya Ghar Loan Rates:** `sources.ts` cited `6.00% / 8.15%`, whereas current verified SBI Surya Ghar floating EBLR-linked rates (verified `2026-11-05`) are **`5.75% p.a.`** up to ₹2L (`≤ 3 kW`) and **`7.90% p.a.`** above ₹2L up to ₹6L (`> 3 kW to 10 kW`), with a 10% minimum borrower margin.
9. **Commercial Section 33 Tax Shield Conflation:** `/enterprise` multiplied 40% WDV depreciation directly by a tax rate to show a single "Year-1 Tax Benefit" without separating statutory **Year-1 WDV Depreciation Allowance** (40% for `≥ 180 days` / 20% for `< 180 days` under Section 33 of the Income-tax Act, 2025 & 2026 Rules) from the **Conditional Cash Tax Shield**, and lacked a `0%` non-taxable / tax-holiday option.
10. **Identifier Naming (`INCOME_TAX_SECTION_34_SOURCE`):** `regulatory.ts` exported the constant under the legacy name `INCOME_TAX_SECTION_34_SOURCE` even though its text referenced Section 33.

---

## 3. Verified Regulatory & Financial Sources

Full source documentation is maintained in [`docs/STEP3_REGULATORY_SOURCE_MATRIX.md`](./STEP3_REGULATORY_SOURCE_MATRIX.md) and [`docs/SOURCES.md`](./SOURCES.md):

| Domain                             | Authority / Source                                                                                               | Scope                   | Verification Status                           | Key Verified Parameters                                                                                                                                                                                           |
| :--------------------------------- | :--------------------------------------------------------------------------------------------------------------- | :---------------------- | :-------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Telangana Domestic Tariff**      | TGERC Retail Supply Tariff Order FY 2025-26 & FY 2026-27 (unchanged domestic schedule)                           | `TGSPDCL`, `TGNPDCL`    | `VERIFIED`                                    | LT-I(A) `≤100` (`₹1.95`/`₹3.10`), LT-I(B) `101–200` (`₹3.40`/`₹4.80`), LT-I(C) `>200` (`₹5.10` to `₹10.00`); Fixed `₹10/kW/mo`; Duty `₹0.06/u`; Gruha Jyothi `≤200 u` waiver                                      |
| **Andhra Pradesh Domestic Tariff** | APERC Retail Supply Tariff Order FY 2025-26 & FY 2026-27 (LT-I Domestic)                                         | `APEPDCL`, `APSPDCL`    | `VERIFIED`                                    | Unified 6-tier LT-I(A) telescopic schedule: `0–30 @ ₹1.90`, `31–75 @ ₹3.00`, `76–125 @ ₹4.50`, `126–225 @ ₹6.00`, `226–400 @ ₹8.75`, `>400 @ ₹9.75/kWh`; Fixed `₹10/kW/mo`; Customer `₹25–₹55/mo`; Duty `₹0.06/u` |
| **7 Other Listed DISCOMs**         | KERC (`BESCOM`), MERC (`MSEDCL`, `TATA_MUMBAI`), DERC (`BRPL`), HERC (`DHBVN`), JERC (`GED`), TNERC (`TANGEDCO`) | KA, MH, DL, HR, GA, TN  | `INDICATIVE`                                  | Blended tariff benchmarks (`₹7.80–₹9.80/kWh` residential) explicitly labeled `INDICATIVE` with consultation verification notice                                                                                   |
| **Central Solar Subsidy**          | MNRE PM Surya Ghar: Muft Bijli Yojana CFA Guidelines                                                             | Pan-India Residential   | `VERIFIED`                                    | `₹30,000/kW` up to 2 kW (`₹60,000`), `₹18,000/kW` for 2–3 kW, max **`₹78,000`** (`₹85,800` Special Category); GHS/RWA `₹18,000/kW`; Commercial & Battery `₹0` (`INELIGIBLE`)                                      |
| **Residential Solar Loan**         | State Bank of India (SBI) PM Surya Ghar Scheme (`2026-11-05`)                                                    | Pan-India Residential   | `VERIFIED` (`≤ ₹6L`) / `INDICATIVE` (`> ₹6L`) | `5.75% p.a.` floating (`≤ 3 kW`, loan `≤ ₹2L`); `7.90% p.a.` floating (`> 3–10 kW`, loan `₹2L–₹6L`); `9.15% p.a.` indicative above `₹6L`; 10% minimum borrower margin                                             |
| **Commercial Depreciation**        | Section 33, Income-tax Act, 2025 & Draft Income-tax Rules, 2026                                                  | Commercial & Industrial | `VERIFIED`                                    | `40%` WDV block rate (`≥ 180 days` H1 commissioning) / `20%` (`< 180 days` H2 commissioning); conditional cash tax shield separated from deduction                                                                |
| **Solar Meteorology**              | EC JRC PVGIS v5.3 TMY & NASA POWER (16% system loss derate)                                                      | 7 Service Corridors     | `INDICATIVE`                                  | Specific yields: Hyderabad `1,490`, Visakhapatnam `1,460`, Chennai `1,470`, Mumbai `1,450`, Bengaluru `1,440`, Goa `1,430`, Delhi-NCR `1,420` kWh/kWp/yr                                                          |

---

## 4. State / DISCOM Tariff Engine Changes

Implemented in [`src/config/regulatory.ts`](../src/config/regulatory.ts):

- Added `DISCOM_TARIFF_PROFILES` covering all 11 supported utilities with `status`, `authority`, `financialYear`, `residentialBlendedTariffInr`, `commercialBlendedTariffInr`, `exportSettlementRateInr`, `netMeteringMechanism`, `fixedChargePerKwMonthInr`, `electricityDutyPerUnitInr`, and `gruhaJyothiApplicable`.
- Implemented `calculateApLt1EnergyCharge()` and `apCustomerCharge()` for verified 6-tier APERC domestic billing in Andhra Pradesh (`APEPDCL`, `APSPDCL`).
- Implemented `calculateElectricityBill()` and `estimateConsumptionFromBill()` separating `avoidableChargesInr` (energy + electricity duty) from `unavoidableChargesInr` (fixed + customer charges) across verified Telangana, verified Andhra Pradesh, indicative benchmark DISCOMs, and safe `UNAVAILABLE` unknown DISCOMs.
- Updated `decodeBill()` so `BillDecoder.tsx` renders exact slab breakdowns for `TGSPDCL`, `TGNPDCL`, `APEPDCL`, and `APSPDCL`, and displays an honest `Indicative Regional Benchmark` notice for non-TG/AP utilities.

---

## 5. Solar Generation, Net-Metering & Sizing Changes

Implemented in [`src/config/regulatory.ts`](../src/config/regulatory.ts) and [`src/config/solar.ts`](../src/config/solar.ts):

- Expanded `CITY_SOLAR_METEOROLOGY` to all 7 service corridors (`hyderabad`, `visakhapatnam`, `bengaluru`, `mumbai`, `delhi`, `goa`, `chennai`) with monthly kWh/kWp distributions and `systemLossDerateFraction = 0.16` (16% system losses).
- Added `getSolarYieldProfileForDiscom()` so selecting any DISCOM automatically binds the corresponding regional solar yield (`1,420–1,490 kWh/kWp/yr`).
- Added `validateRoofFeasibility(systemKw, availableRoofAreaSqFt)` (`~80 sq.ft/kW` shadow-free rule of thumb, `28 sq.ft` per `580W` module) and wired real-time roof area constraint warnings into `SystemConfigurator.tsx`.
- Modeled self-consumption vs. grid export (`42%` solar-only / `72%` hybrid with battery), 1:1 billing-cycle offset, APPC surplus credit (`₹3.50–₹3.90/kWh`), and unavoidable fixed charges in `estimate()`.
- Unified all UI references on `580W N-Type TOPCon` (`SOLAR_ASSUMPTIONS.panelWatt = 580`) across `SystemConfigurator.tsx` and `RoofSketcher.tsx`.

---

## 6. Subsidy & Financing Engine Changes

Implemented in [`src/config/regulatory.ts`](../src/config/regulatory.ts), [`src/config/solar.ts`](../src/config/solar.ts), [`src/config/sources.ts`](../src/config/sources.ts), and [`src/components/PmSuryaGharJourney.tsx`](../src/components/PmSuryaGharJourney.tsx):

- Implemented `evaluateSubsidyEligibility()` returning `POTENTIALLY_ELIGIBLE`, `INELIGIBLE` (for commercial/industrial or repeat beneficiaries), or `REQUIRES_VERIFICATION` (for non-DCR modules or tenant connections without verified NOC).
- Corrected all PM Surya Ghar slab descriptions in `sources.ts`, `DOCS/SOURCES.md`, and `PmSuryaGharJourney.tsx` to `₹30,000 + ₹30,000 + ₹18,000 = ₹78,000` (and `₹85,800` for Special Category States).
- Separated `grossCostInr` (including non-subsidized battery capex) from `netCostAfterSubsidyInr` (post-commissioning DBT credit).
- Implemented `calculateSolarFinancing()` with verified SBI Surya Ghar tiers (`5.75%` ≤ ₹2L, `7.90%` ₹2L–₹6L, `9.15%` `INDICATIVE` above ₹6L), 10% minimum margin, numerically stable EMI (handling `0%` rate and edge inputs cleanly), `totalInterestInr`, and `totalPayableInr`.

---

## 7. Commercial Tax & 25-Year Cash-Flow Changes

Implemented in [`src/config/regulatory.ts`](../src/config/regulatory.ts), [`src/config/solar.ts`](../src/config/solar.ts), [`src/routes/enterprise.tsx`](../src/routes/enterprise.tsx), [`src/components/WealthCurveVisualizer.tsx`](../src/components/WealthCurveVisualizer.tsx), and [`src/components/ArchitecturalDossierModal.tsx`](../src/components/ArchitecturalDossierModal.tsx):

- Renamed `INCOME_TAX_SECTION_34_SOURCE` to `INCOME_TAX_SECTION_33_SOURCE` (retaining a deprecated alias for backward compatibility).
- Implemented `calculateCommercialSolarAssessment()` modeling Section 33 of the Income-tax Act, 2025 & Draft Income-tax Rules, 2026:
  - Separates **Statutory Year-1 WDV Depreciation Allowance** (`40%` for `≥ 180 days` H1 vs `20%` for `< 180 days` H2) from **Conditional Illustrative Year-1 Cash Tax Shield** (`0%`, `25.17%`, `29.12%`, `31.20%`, `34.94%`).
  - Separates **Operational Simple Payback (Pre-Tax)** from **Illustrative Post-Tax-Shield Payback**.
- Upgraded `project25Years()` to support both **Cash Purchase** (`projection`) and **Financed / Loan Mode** (`financedProjection`), accounting for initial down payment, post-DBT credit, annual EMI debt service during loan tenure, `0.40%/yr` N-Type TOPCon degradation, `3.0%/yr` tariff escalation, and escalated O&M reserve.
- Eliminated duplicate calculation loops in `ArchitecturalDossierModal.tsx` so all surfaces consume the single `estimate()` output.

---

## 8. Customer-Facing UI & Disclosure Updates

- **Homepage (`src/routes/index.tsx`):** Quick Estimator displays dynamic `Verified TGERC/APERC Schedule` vs `Indicative Regional Benchmark` badge, DISCOM-specific regulatory notes, estimated annual generation, and Gross vs Post-DBT net cost.
- **Design Studio (`src/components/SystemConfigurator.tsx`):** Added DISCOM verification badge, `580W TOPCon` label, available roof area input with real-time `validateRoofFeasibility()` warning, full Gross vs Post-DBT vs Loan EMI breakdown, and unified child component props.
- **Bill Decoder (`src/components/BillDecoder.tsx`):** Displays verified slab-by-slab breakdown for Telangana and Andhra Pradesh, and switches to an honest `Indicative Regional Benchmark` breakdown for other states.
- **Monthly Generation Chart (`src/components/MonthlyGenerationChart.tsx`):** Syncs with selected DISCOM across all 7 regional meteorology profiles and discloses the 16% system loss derate.
- **Wealth Curve Visualizer (`src/components/WealthCurveVisualizer.tsx`):** Reflects active Cash Purchase vs SBI Surya Ghar Loan Mode (`financedProjection`) with clear loan interest and net cash-flow summaries.
- **Enterprise (`src/routes/enterprise.tsx`):** Updated Section 33 Commercial Tax Estimator with `0% (Tax Holiday / Loss / Non-Taxable)` option, distinct cards for Year-1 WDV Depreciation Allowance (`₹`), Conditional Cash Tax Shield (`₹`), and Operational vs Post-Tax Payback.
- **Legal Disclosures (`src/routes/legal/disclosures.tsx`):** Added the 11-DISCOM Verification Status & Solar Yield Matrix, the APERC LT-I(A) 6-tier schedule alongside TGERC LT-I(A/B/C), and updated Section 33 tax references.

---

## 9. Unit, Regression & E2E Test Results

- **Unit & Regression Tests (`npm test`):** **62 passed / 62 total** across 5 test files:
  - `src/config/regulatory.test.ts` (18 tests: TGERC slabs, Gruha Jyothi, APERC 6-tier slabs, indicative DISCOMs, unknown DISCOM fallback, inverse bill estimation, PM Surya Ghar eligibility states, 7-city meteorology, Section 33 source alias)
  - `src/config/solar.test.ts` (15 tests: cross-component consistency contract, roof feasibility, SBI financing tiers & 0% edge case, cash vs financed 25-year projections, commercial Section 33 H1/H2/0%-tax/oversized-load edge cases, non-negative bounds)
  - `src/functions/leads.test.ts` (21 tests: Step 1 lead pipeline & demo/live safety)
  - `src/config/brand.test.ts` (5 tests: Step 1 brand integrity)
  - `src/lib/suncalc.test.ts` (3 tests: solar geometry)
- **Linter & Copy-Lint (`npm run lint`):** **0 errors**, **0 banned buzzwords**.
- **TypeScript (`npx tsc --noEmit`):** **0 errors**.
- **Production Build (`npm run build`):** **Succeeded cleanly** (sitemap + client + SSR nitro bundle).
- **Playwright E2E Audit (`npm run test:e2e`):** All 17 routes audited across desktop (`1440×900`), landscape (`1024×768`), tablet (`768×1024`), and mobile (`390×844`), plus Step 1, Step 2, and Step 3 interactive verification checks.

---

## 10. Known Limitations & Items Deferred to Step 4

1. **Non-TG/AP State Tariff Slabs:** While Telangana (`TGSPDCL`, `TGNPDCL`) and Andhra Pradesh (`APEPDCL`, `APSPDCL`) implement full verified multi-tier telescopic domestic tariff schedules, the remaining 7 listed DISCOMs (`BESCOM`, `MSEDCL`, `TATA_MUMBAI`, `BRPL`, `DHBVN`, `GED`, `TANGEDCO`) intentionally use clearly labeled `INDICATIVE` regional blended benchmarks pending state-by-state tariff slab expansion.
2. **Variable Monthly Fuel Surcharges (FPPCA / FAC / PPAC):** Monthly utility fuel adjustment surcharges vary billing cycle by billing cycle and are excluded from baseline estimates (disclosed in UI and `/legal/disclosures`).
3. **2D Roof Sketcher Geometry:** `RoofSketcher.tsx` remains an indicative 2D module-packing estimator (`580W` modules) and does not replace a physical structural wind-load or 3D horizon shading survey (planned for deeper CAD/3D engineering enhancements in subsequent steps).
