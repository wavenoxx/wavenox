# WAVENOX — STEP 3 EXECUTION & FINAL FINANCIAL HARDENING REPORT

## 1. Repository & Branch Status

- **Repository:** `https://github.com/wavenoxx/wavenox.git`
- **Base Branch Verified:** `feat/wavenox-step2-experience` (`ca073199b53d7db52e3424990e5860f6fe89`)
- **Step 3 Feature Branch:** `feat/wavenox-step3-solar-engine`
- **Baseline Step 3 Commit Verified:** `608869280b17075c2d897f5c05b09317a87dcd1c`
- **Target Branch for Draft PR #7:** `feat/wavenox-step2-experience` (never merged to `main`, never force-pushed, no live database or production deployment executed)

---

## 2. Independent Financial & Regulatory Reconciliation Summary (`P0-A` through `P1-F`)

Following the initial Step 3 implementation (`6088692`), an independent financial engineering audit was executed to verify every mathematical formula, cash-flow invariant, regulatory citation, and status flag:

### P0-A — Net-Metering and Real Bill Savings (`FIXED & VERIFIED`)
- **Finding:** In `src/config/solar.ts`, `estimate()` previously computed `netMeteredOffsetKwh` and `netAnnualSurplusKwh`, but `annualGenValueInr` valued all `exportedKwh` at `discom.exportRateInr` (`₹3.55/kWh` APPC) instead of valuing `netMeteredOffsetKwh` against the avoided retail tariff bill.
- **Fix Implemented:**
  - Partitioned solar generation strictly without double-counting:
    - `selfConsumedKwh = min(annualConsumptionKwh, round(annualGenKwh * selfConsumptionRatio))`
    - `exportedKwh = max(0, annualGenKwh - selfConsumedKwh)`
    - `importedKwh = max(0, annualConsumptionKwh - selfConsumedKwh)`
    - `netMeteredOffsetKwh = min(exportedKwh, importedKwh)`
    - `netAnnualSurplusKwh = max(0, exportedKwh - netMeteredOffsetKwh)`
    - `residualGridImportKwh = max(0, importedKwh - netMeteredOffsetKwh)`
  - For verified utilities (`TGSPDCL`, `TGNPDCL`, `APEPDCL`, `APSPDCL`), `estimate()` computes the post-solar annual bill from `residualMonthlyUnits = round(residualGridImportKwh / 12)` using `calculateElectricityBill()`, preserving unavoidable monthly fixed and customer charges (`unavoidableAnnualFixedChargesInr`) and valuing only true net surplus (`netAnnualSurplusKwh`) at the notified APPC rate (`exportRateInr`).
  - For unsupported/unknown DISCOM codes, `annualGenKwh`, `avoidedBillSavingsInr`, `surplusExportCreditInr`, and `annualSavingsInr` are withheld (`0`) with `status: "UNAVAILABLE"`.

### P0-B — Financed Cash Flow & Subsidy Timing Reconciliation (`FIXED & VERIFIED`)
- **Finding:** `project25Years()` previously initialized `cumLoanOutflow = Math.max(0, customerDownPaymentInr - subsidyInr)` at Year 0. Whenever `subsidyInr` (`₹78,000`) exceeded the 10% `customerDownPaymentInr` (e.g., `₹21,576` on a 6-panel `3.48 kW` system), `Math.max(0, ...)` silently dropped `₹56,424` of the subsidy from `financedProjection[24].netCumulativeCashflow`, causing a `₹56,424` mismatch with `financedNetGain25YearsInr`.
- **Fix Implemented:**
  - Removed `Math.max(0, customerDownPaymentInr - subsidyInr)` from `project25Years()`.
  - Implemented an explicit, reconciled **Cash-Flow Ledger** (`CashFlowLedgerSummary` and `YearProjectionPoint`):
    - **Year 0 Initial Outflow:** `grossInvestmentInr` (Cash mode) or `customerDownPaymentInr` (Loan mode, 10% margin).
    - **Year 1 Post-Commissioning DBT Credit:** `subsidyCreditInr = subsidyInr` credited once in Year 1 (`0` in Years 2–25).
    - **Years 1..Tenure Loan Outflow:** `annualLoanOutflow = monthlyEmiInr * activeMonths`, summing exactly to `financing.totalRepaymentInr`.
    - **Exact Reconciliation:** `projection[24].netCumulativeCashflow === netGain25YearsInr` and `financedProjection[24].netCumulativeCashflow === financedNetGain25YearsInr` hold identically across all system sizes, including when `subsidyInr > customerDownPaymentInr`.

### P0-C — Current SBI Loan Rate Verification & Above-Cap Branch (`FIXED & VERIFIED`)
- **Finding:**
  1. Official SBI sources publish two dated schedules: SBI's older personal-banking page (`2025-12-15`) lists `5.75% / 7.90%`, while SBI's newer **SBI Green Loans — PM Surya Ghar Loan for Solar Roof Top** page (`https://sbi.bank.in/web/sbi-green/green-loans/personal/pm-surya-ghar-loan-for-solar-roof-top`, effective **`2026-10-15`**) lists **`6.00% p.a.` (up to ₹2,00,000, ≤ 3 kW)** and **`8.15% p.a.` (above ₹2,00,000 up to ₹6,00,000, > 3–10 kW)**.
  2. In `calculateSolarFinancing()`, the `else` branch for `loanPrincipalInr > ₹6,00,000` previously assigned `SOLAR_LOAN_TERMS.tier2.annualInterestRate` instead of `SOLAR_LOAN_TERMS.aboveCapIndicativeRate` (`0.0915`).
- **Fix Implemented:**
  - Updated `SOLAR_LOAN_TERMS` and `SBI_SOLAR_LOAN_SOURCE` to the newer **`2026-10-15` SBI Green Loans schedule (`6.00% p.a.` Tier 1 / `8.15% p.a.` Tier 2)** while explicitly documenting the older `2025-12-15` personal-banking schedule (`5.75% / 7.90%`) in `documentRef`, `restrictions`, `legacyScheduleNote`, and `/legal/disclosures`.
  - Updated the above-₹6L branch in `calculateSolarFinancing()` to use `SOLAR_LOAN_TERMS.aboveCapIndicativeRate` (`0.0915` = `9.15% p.a.`), set `isSchemeEligible = false` and `exceedsConcessionalCap = true`, and surface an explicit warning note.
  - Classified all financing outputs as `status: "INDICATIVE"`.

### P1-D — Conditional Subsidy Treatment (`FIXED & VERIFIED`)
- **Finding:** `estimate()` previously hardcoded `isGridConnected: true, dcrCompliant: true` when calling `evaluateSubsidyEligibility()`, treating unconfirmed customer eligibility facts as verified.
- **Fix Implemented:**
  - Removed hardcoded `true` flags from `estimate()`.
  - `evaluateSubsidyEligibility()` and `EstimateResult` now explicitly separate:
    - `potentialSubsidyInr`: Potential statutory CFA (`up to ₹78,000`) when customer facts are unconfirmed (`eligibilityStatus: "POTENTIALLY_ELIGIBLE"`, `isConditional: true`).
    - `confirmedSubsidyInr` (`confirmedEligibleSubsidyInr`): Populated only when `isGridConnected === true`, `dcrCompliant === true`, `hasPriorSubsidy === false`, and `ownershipConfirmed !== false` are confirmed (`eligibilityStatus: "CONFIRMED_ELIGIBLE"`).
    - `receivedSubsidyInr`: Populated only when post-commissioning DBT disbursement (`subsidyReceived` / `subsidyDisbursed`) is confirmed.
  - Updated `SystemConfigurator.tsx` and `src/routes/index.tsx` to display **Gross Installed System Cost** prominently and label potential subsidy and net-after-subsidy cost as **Conditional (`Potential Post-Commissioning DBT Subsidy (Conditional)*` / `Conditional cost after potential DBT*`)**.

### P1-E — Unsupported Regions & Granular Source Status (`FIXED & VERIFIED`)
- **Finding:** Unknown DISCOM codes previously fell back to Hyderabad (`1,490 kWh/kWp/yr`) in `getSolarYieldProfileForDiscom()`, and `CITY_SOLAR_METEOROLOGY` mixed `VERIFIED` and `INDICATIVE` statuses and `14.0%` vs `14.08%` loss derates.
- **Fix Implemented:**
  - Added `UNAVAILABLE_SOLAR_YIELD_PROFILE` (`annualKwhPerKw: 0`, `status: "UNAVAILABLE"`). Unknown DISCOMs now return `0` generation, `0` tariff, and `0` financial savings with `status: "UNAVAILABLE"`.
  - Standardized all 7 city profiles in `CITY_SOLAR_METEOROLOGY` to `status: "INDICATIVE"`, `category: "ENGINEERING_MODEL_ASSUMPTION"`, and `systemLossDeratePct: 14.08` (NREL PVWatts v8 standard 14.08% composite system loss model).
  - Added `verificationBreakdown` (`tariffSchedule`, `solarGeneration`, `subsidyEligibility`, `financing`, `completeEstimate`) to `EstimateResult`.

### P1-F — Tax & Engineering Documentation Reconciliation (`FIXED & VERIFIED`)
- **Fixes Implemented:**
  - Updated all Income-tax Act, 2025 Section 33 references across `src/config/regulatory.ts`, `src/config/solar.ts`, `src/config/sources.ts`, `src/routes/enterprise.tsx`, `src/routes/legal/disclosures.tsx`, and `docs/` to cite **Notified Income-tax Rules, 2026** (effective 1 April 2026) instead of draft rules.
  - Reconciled all documentation in `docs/STEP3_REGULATORY_SOURCE_MATRIX.md`, `docs/STEP3_CALCULATION_METHODOLOGY.md`, and `docs/STEP3_EXECUTION_REPORT.md` to match the exact code constants:
    - Omnigrid Battery: **`15.0 kWh` nominal / `14.3 kWh` usable `LiFePO4`** at **`₹2,80,000/unit`** (`PRODUCTS_CONFIG.battery` & `SOLAR_ASSUMPTIONS.battery.unitPriceInr`).
    - System Loss Derate: **`14.08%`** (NREL PVWatts v8 standard loss model).
    - Roof Area: **`27.8 sq.ft/panel`** physical footprint and **`100 sq.ft/kW`** shadow-free roof requirement.
    - Self-Consumption Ratio: **`70%`** solar-only / **`90%`** with hybrid battery storage.

---

## 3. Verified Regulatory & Financial Sources Summary

| Domain                             | Authority / Source                                                                                               | Scope                   | Verification Status                           | Key Parameters                                                                                                                                                                                                    |
| :--------------------------------- | :--------------------------------------------------------------------------------------------------------------- | :---------------------- | :-------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Telangana Domestic Tariff**      | TGERC Retail Supply Tariff Order FY 2025-26 & FY 2026-27                                                         | `TGSPDCL`, `TGNPDCL`    | `VERIFIED`                                    | LT-I(A) `≤100` (`₹1.95`/`₹3.10`), LT-I(B) `101–200` (`₹3.40`/`₹4.80`), LT-I(C) `>200` (`₹5.10` to `₹10.00`); Fixed `₹10/kW/mo`; Customer `₹25–₹80/mo`; Duty `₹0.06/u`; APPC `₹3.55/kWh`                           |
| **Andhra Pradesh Domestic Tariff** | APERC Retail Supply Tariff Order FY 2025-26 & FY 2026-27                                                         | `APEPDCL`, `APSPDCL`    | `VERIFIED`                                    | Unified 6-tier LT-I(A) telescopic schedule: `0–30 @ ₹1.90`, `31–75 @ ₹3.00`, `76–125 @ ₹4.50`, `126–225 @ ₹6.00`, `226–400 @ ₹8.75`, `>400 @ ₹9.75/kWh`; Fixed `₹10/kW/mo`; Customer `₹25–₹55/mo`; Duty `₹0.06/u` |
| **7 Other Listed DISCOMs**         | KERC (`BESCOM`), MERC (`MSEDCL`, `TATA_MUMBAI`), DERC (`BRPL`), HERC (`DHBVN`), JERC (`GED`), TNERC (`TANGEDCO`) | KA, MH, DL, HR, GA, TN  | `INDICATIVE`                                  | Blended tariff benchmarks (`₹7.80–₹9.80/kWh` residential) explicitly labeled `INDICATIVE`                                                                                                                         |
| **Central Solar Subsidy**          | MNRE PM Surya Ghar: Muft Bijli Yojana CFA Guidelines                                                             | Pan-India Residential   | `VERIFIED` (Formula) / `POTENTIALLY_ELIGIBLE` | `₹30,000/kW` up to 2 kW (`₹60,000`), `₹18,000/kW` for 2–3 kW, max **`₹78,000`** (`₹85,800` Special Category); GHS/RWA `₹18,000/kW`; Commercial & Battery `₹0` (`INELIGIBLE`)                                      |
| **Residential Solar Loan**         | SBI Green Loans — PM Surya Ghar Scheme (Effective `2026-10-15`; older `2025-12-15` schedule noted)               | Pan-India Residential   | `INDICATIVE`                                  | **`6.00% p.a.`** floating (`≤ 3 kW`, loan `≤ ₹2L`); **`8.15% p.a.`** floating (`> 3–10 kW`, loan `₹2L–₹6L`); **`9.15% p.a.`** indicative above `₹6L` (`isSchemeEligible = false`); 10% customer margin             |
| **Commercial Depreciation**        | Section 33, Income-tax Act, 2025 & Notified Income-tax Rules, 2026                                               | Commercial & Industrial | `VERIFIED`                                    | `40%` WDV block rate (`≥ 180 days` H1 commissioning) / `20%` (`< 180 days` H2 commissioning); conditional cash tax shield separated from statutory deduction                                                      |
| **Solar Meteorology**              | NASA POWER SSE Release 8 & NREL PVWatts v8 (`14.08%` system loss derate)                                         | 7 Service Corridors     | `INDICATIVE`                                  | Specific yields: Hyderabad `1,490`, Chennai `1,470`, Visakhapatnam `1,460`, Mumbai `1,450`, Bengaluru `1,440`, Goa `1,430`, Delhi-NCR `1,420` kWh/kWp/yr                                                          |

---

## 4. Unit, Regression, Build & E2E Verification Results

- **Unit & Regression Tests (`npm test`):** **63 passed / 63 total** across 5 test files:
  - `src/config/regulatory.test.ts` (18 tests: TGERC slabs, APERC 6-tier slabs, indicative DISCOMs, unknown DISCOM fallback, inverse bill round-trip, conditional vs confirmed vs received PM Surya Ghar subsidy states, 7-city `14.08%` meteorology, `2026-10-15` SBI `6.00% / 8.15% / 9.15%` loan constants, Notified Income-tax Rules 2026 Section 33 constants)
  - `src/config/solar.test.ts` (16 tests: P0-A net-metering energy partition & slab settlement across Consumption > Gen, Gen > Consumption, Solar-Only vs Hybrid; P0-B 25-year cash & financed ledger reconciliation when `subsidyInr > customerDownPaymentInr`; P0-C Tier 1 `6.00%`, Tier 2 `8.15%`, Above-Cap `9.15%`, zero-interest & zero-principal EMI; P1-D conditional subsidy states; P1-E unknown DISCOM zeroed financial outputs; P1-F Section 33 commercial tax assessment)
  - `src/functions/leads.test.ts` (21 tests: Step 1 lead pipeline & demo/live safety)
  - `src/config/brand.test.ts` (5 tests: Step 1 brand integrity)
  - `src/lib/suncalc.test.ts` (3 tests: solar geometry)
- **Linter & Copy-Lint (`npm run lint`):** **0 errors**, **0 banned buzzwords**.
- **TypeScript (`npx tsc --noEmit`):** **0 errors**.
- **Production Build (`npm run build`):** **Succeeded cleanly**.
- **Playwright E2E Audit (`npm run test:e2e`):** **All 17 routes and all 14 Step 1 / Step 2 / Step 3 E2E check suites passed (`exit code 0`)**.
