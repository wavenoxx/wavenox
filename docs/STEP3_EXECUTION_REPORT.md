# WAVENOX — STEP 3 EXECUTION & FINAL REGULATORY / FINANCIAL HARDENING REPORT

## 1. Repository & Branch Status

- **Repository:** `https://github.com/wavenoxx/wavenox.git`
- **Base Branch Verified:** `feat/wavenox-step2-experience` (`ca073199b53d7db52e3424990e5860f6fe89`)
- **Step 3 Feature Branch:** `feat/wavenox-step3-solar-engine`
- **Previous Step 3 Hardening Commit Verified:** `4493c53d13d0640432bd0d1d824a259639d234e6`
- **Target Branch for Draft PR #7:** `feat/wavenox-step2-experience` (never merged to `main`, never force-pushed, no live database or production deployment executed)

---

## 2. Final Regulatory Settlement & Bank Finance Correction (`Tasks A, B, C & D`)

Following the P0/P1 financial reconciliation (`4493c53`), a final regulatory and bank-finance audit was executed to align the calculation engine 100% with the official **TGERC Regulation No. 1 of 2025**, **APERC Regulation No. 4 of 2023**, and **SBI Green Loans — PM Surya Ghar Loan for Solar Roof Top** rules:

### TASK A — 12-Month Billing-Period Net-Metering Settlement (`FIXED & VERIFIED`)
- **Primary Sources Verified:**
  - **Telangana:** *TGERC Rooftop Solar PV Grid Interactive Systems Regulation No. 1 of 2025* (notified 15 November 2025, Sections 2 & Clauses 8.1.1–8.1.5, superseding Regulation No. 6 of 2016) — [`Final Solar Roof top Regulation 1 of 2025 15112025.pdf`](https://www.tgerc.telangana.gov.in/file_upload/uploads/Regulations/Final/tserc/2025/Final%20Solar%20Roof%20top%20Regulation%201%20of%202025%2015112025.pdf).
  - **Andhra Pradesh:** *APERC Grid Interactive Solar Rooftop Photovoltaic System Regulation No. 4 of 2023* (Clauses 16.1 & 16.5) — [`https://aperc.gov.in`](https://aperc.gov.in).
- **Fixes Implemented:**
  1. **12-Month Billing-Period Settlement Ledger (`MonthlySettlementEntry` & `EnergyBalanceBreakdown`):** Replaced annual aggregate netting with a 12-month billing-period settlement loop in `estimate()` using the 12-month solar yield distributions (`CITY_SOLAR_METEOROLOGY[cityKey].monthlyYield`).
  2. **Consumption Profile Disclosure (`consumptionProfileBasis`):** Uses uniform monthly consumption (`UNIFORM_MONTHLY_ASSUMPTION`) only when actual 12-month bill history (`monthlyConsumptionByMonth?: number[]`) is unavailable (`ACTUAL_OR_SEASONAL_12_MONTH`), disclosing this explicitly in `energyBalance.consumptionAssumptionDisclosure`, `SystemConfigurator.tsx`, and `/legal/disclosures`.
  3. **Zero Cross-Period Retail Offset:** In each month $m \in \{1, \dots, 12\}$, `netMeteredOffsetKwh_m = min(exportedKwh_m, importedKwh_m)`, `residualGridImportKwh_m = max(0, importedKwh_m - netMeteredOffsetKwh_m)`, and `billingPeriodSurplusKwh_m = max(0, exportedKwh_m - netMeteredOffsetKwh_m)`. Surplus exported in high-generation or low-load months (e.g., winter or March/April peak solar) cannot offset net imports in high-demand or monsoon months (e.g., May AC peak or July/August monsoon) at retail telescopic slab rates.
  4. **Telangana Surplus Export Rate (`₹2.65/kWh`, `status: "INDICATIVE"`):** Under TGERC Regulation No. 1 of 2025 Clauses 8.1.3–8.1.5, surplus exported energy is settled at the lowest solar tariff discovered through Section 63 competitive bidding by Telangana DISCOMs in the preceding financial year (superseding the 2016 APPC rule). Replaced the unverified `₹3.55/kWh` APPC assumption with the `₹2.65/kWh` Section 63 benchmark and classified `exportRateStatus: "INDICATIVE"` (`verificationBreakdown.surplusExportRate = "INDICATIVE"`).
  5. **Andhra Pradesh Surplus Export Rate (`₹2.09/kWh`, `status: "INDICATIVE"`):** Under APERC Regulation No. 4 of 2023 Clauses 16.1 & 16.5, surplus export rate (`₹2.09/kWh` feed-in benchmark) is explicitly tagged `exportRateStatus: "INDICATIVE"`.
  6. **Annual Aggregate Comparison Proof (`annualAggregateComparison`):** Added `crossPeriodOffsetPreventedKwh` and `savingsDifferenceVsAnnualAggregateInr` to `energyBalance` and verified with both uniform and seasonal 12-month test scenarios in `src/config/solar.test.ts`.

### TASK B — SBI Direct-to-Loan-Account DBT Prepayment & Amortization (`FIXED & VERIFIED`)
- **Primary Source Verified:** *SBI Green Loans — PM Surya Ghar Loan for Solar Roof Top* (`https://sbi.bank.in/web/sbi-green/green-loans/personal/pm-surya-ghar-loan-for-solar-roof-top`, effective `2026-10-15`; older `2025-12-15` personal-banking schedule noted).
- **Fixes Implemented:**
  1. **Direct-to-Loan-Account DBT Credit (`LOAN_PRINCIPAL_PREPAYMENT`):** Under official SBI PM Surya Ghar loan rules, the borrower's SBI loan account is linked on the National Portal and post-commissioning MNRE central subsidy is credited **directly into the borrower's SBI loan account** (modeled at `subsidyCreditMonth = 3`, Nil prepayment penalty) to prepay/reduce the outstanding loan principal — NOT paid out as unrestricted customer cash while leaving the 90% loan unreduced.
  2. **Explicit Pre/Post-Subsidy Loan State:** `SolarFinancingAssessment` now computes and exposes:
     - `initialLoanPrincipalInr` (90% of eligible solar capex) & `initialMonthlyEmiInr` (Months 1–3)
     - `subsidyCreditMonth` (default Month 3) & `balanceBeforeSubsidyCreditInr`
     - `subsidyCreditedToLoanInr` (`min(balanceBeforeSubsidyCreditInr, subsidyInr)`) & `excessSubsidyToBorrowerInr`
     - `postSubsidyPrincipalInr` & `postSubsidyMonthlyEmiInr`
  3. **Three Explicitly Labeled `INDICATIVE` Amortization Scenarios (`amortizationScenarios`):**
     - `recastEmi` (`LOAN_PRINCIPAL_PREPAYMENT_RECAST_EMI`, default when `subsidyInr > 0`): Re-amortizes `postSubsidyPrincipalInr` over the remaining 57 months at a lower monthly EMI (`₹2,301/mo` vs `₹3,952/mo` initial on a 6-panel `3.48 kW` system).
     - `reduceTenure` (`LOAN_PRINCIPAL_PREPAYMENT_REDUCE_TENURE`): Keeps the initial EMI (`₹3,952/mo`) and shortens total loan tenure (`36 months` vs `60 months`), maximizing interest savings.
     - `unadjustedNoPrepayment` (`UNRESTRICTED_SUBSIDY_NO_PREPAYMENT`): 60-month unprepaid baseline for sensitivity comparison.
  4. **Strict Eligibility & Battery Exclusion (`Task B5`):**
     - Standalone battery storage capex (`excludedBatteryCapexInr`) is excluded from PM Surya Ghar scheme loan principal (`eligibleSolarCapexInr = grossCapexInr - excludedBatteryCapexInr`), with `unfinancedBatteryOutlayInr` added to Year-0 customer outlay.
     - Validates both loan principal (`≤ ₹2,00,000` Tier 1, `≤ ₹6,00,000` Tier 2) AND system capacity (`≤ 3.0 kW` Tier 1 `6.00%`, `> 3.0–10.0 kW` Tier 2 `8.15%`, `> 10.0 kW` ineligible for scheme loan $\to$ `9.15%` indicative non-scheme rate with `exceedsCapacityCap = true` and `isSchemeEligible = false`).
  5. **100% Cash-Flow Ledger Reconciliation Without Double-Counting (`Task B6`):**
     - In `project25Years()`, `financedProjection` uses the exact annual customer EMI outflows (`annualLoanOutflowByYear`) from the active amortization schedule, records `loanPrincipalPrepaymentInr` in Year 1 for display transparency, and only credits `excessSubsidyToBorrowerInr` (if any) as cash inflow — ensuring `financedProjection[24].netCumulativeCashflow === financedNetGain25YearsInr` with zero double-counting.

### TASK C — Sanctioned Load & Regulatory Hosting Feasibility (`FIXED & VERIFIED`)
- **Fixes Implemented:**
  1. Added `SANCTIONED_LOAD_RULES` and `evaluateSanctionedLoadFeasibility()` in `src/config/regulatory.ts`, integrated into `estimate()` (`sanctionedLoadFeasibility`).
  2. **Telangana (`TGERC Regulation No. 1 of 2025`):** Residential & Government capped at **100% of sanctioned load**; Commercial & Industrial capped at **80% of sanctioned load** (`maxCapacityRatioOfSanctionedLoad = 0.80`), up to 500 kWp net metering (`80%` DT hosting limit).
  3. **Andhra Pradesh (`APERC Regulation No. 4 of 2023`):** Residential & Commercial capped at **100% of sanctioned load / contracted demand**, up to 500 kW (`80%` DT hosting limit).
  4. **No Silent Verified 5 kW Assumption:** Unless `sanctionedLoadConfirmed === true` is explicitly passed with `sanctionedLoadKw`, `knownSanctionedLoadKw` is `null`, `sanctionedLoadConfirmed` is `false`, `BillDecoder.tsx` displays `Assumed load: 5 kW (Unverified)`, and `SystemConfigurator.tsx` surfaces an amber regulatory warning whenever `systemKw` exceeds the permissible sanctioned load cap (`requiresLoadEnhancement = true`).

---

## 3. Summary of Earlier Step 3 Reconciliations (`P0-A` through `P1-F`, Preserved)

- **P0-A — Net-Metering Energy Partition:** Strict partition of `selfConsumedKwh`, `exportedKwh`, `importedKwh`, `netMeteredOffsetKwh`, `netAnnualSurplusKwh`, and `residualGridImportKwh` with unavoidable monthly fixed and customer charges preserved.
- **P0-B — Financed Cash Flow & Subsidy Timing:** Eliminated `Math.max(0, customerDownPaymentInr - subsidyInr)` clamping; `projection[24].netCumulativeCashflow === netGain25YearsInr` and `financedProjection[24].netCumulativeCashflow === financedNetGain25YearsInr`.
- **P0-C — SBI `2026-10-15` Schedule (`6.00% / 8.15% / 9.15%`):** Updated to the newer `2026-10-15` SBI Green Loans schedule while documenting the older `2025-12-15` schedule (`5.75% / 7.90%`).
- **P1-D — Conditional Subsidy States:** Explicit separation of `potentialSubsidyInr`, `confirmedSubsidyInr`, and `receivedSubsidyInr`.
- **P1-E — Unsupported Regions & Granular Source Status:** Unknown DISCOMs return `UNAVAILABLE` with zeroed financial outputs; all 7 city meteorological profiles use a consistent `14.08%` NREL PVWatts v8 loss derate and `INDICATIVE` status.
- **P1-F — Section 33 Tax & Hardware Reconciliation:** Cites **Notified Income-tax Rules, 2026** (Section 33, `40%` H1 / `20%` H2 WDV depreciation) and reconciles all battery (`15.0 kWh` nominal / `14.3 kWh` usable at `₹2,80,000/unit`) and roof (`27.8 sq.ft/panel`, `100 sq.ft/kW`) specifications.

---

## 4. Verified Regulatory & Financial Sources Summary

| Domain                             | Authority / Source                                                                                               | Scope                   | Verification Status                           | Key Parameters                                                                                                                                                                                                    |
| :--------------------------------- | :--------------------------------------------------------------------------------------------------------------- | :---------------------- | :-------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Telangana Domestic Tariff**      | TGERC Retail Supply Tariff Order FY 2025-26 & FY 2026-27                                                         | `TGSPDCL`, `TGNPDCL`    | `VERIFIED`                                    | LT-I(A) `≤100` (`₹1.95`/`₹3.10`), LT-I(B) `101–200` (`₹3.40`/`₹4.80`), LT-I(C) `>200` (`₹5.10` to `₹10.00`); Fixed `₹10/kW/mo`; Customer `₹25–₹80/mo`; Duty `₹0.06/u`                                             |
| **Telangana Rooftop Net-Metering** | TGERC Rooftop Solar PV Grid Interactive Systems Regulation No. 1 of 2025 (`15-11-2025`)                          | `TGSPDCL`, `TGNPDCL`    | `VERIFIED` (Rules) / `INDICATIVE` (Surplus ₹) | Monthly billing-period netting (Clauses 8.1.1–8.1.2); Residential cap `100%` of sanctioned load, Commercial/Industrial cap `80%`; surplus rate `₹2.65/kWh` (`INDICATIVE`, Section 63 competitive bidding benchmark) |
| **Andhra Pradesh Domestic Tariff** | APERC Retail Supply Tariff Order FY 2025-26 & FY 2026-27                                                         | `APEPDCL`, `APSPDCL`    | `VERIFIED`                                    | Unified 6-tier LT-I(A) telescopic schedule: `0–30 @ ₹1.90`, `31–75 @ ₹3.00`, `76–125 @ ₹4.50`, `126–225 @ ₹6.00`, `226–400 @ ₹8.75`, `>400 @ ₹9.75/kWh`; Fixed `₹10/kW/mo`; Customer `₹25–₹55/mo`; Duty `₹0.06/u` |
| **Andhra Pradesh Net-Metering**    | APERC Grid Interactive Solar Rooftop PV System Regulation No. 4 of 2023                                          | `APEPDCL`, `APSPDCL`    | `VERIFIED` (Rules) / `INDICATIVE` (Surplus ₹) | Monthly billing-period netting (Clauses 16.1 & 16.5); cap `100%` of sanctioned load / contracted demand (`80%` DT limit); surplus export rate `₹2.09/kWh` (`INDICATIVE`)                                          |
| **7 Other Listed DISCOMs**         | KERC (`BESCOM`), MERC (`MSEDCL`, `TATA_MUMBAI`), DERC (`BRPL`), HERC (`DHBVN`), JERC (`GED`), TNERC (`TANGEDCO`) | KA, MH, DL, HR, GA, TN  | `INDICATIVE`                                  | Blended tariff benchmarks (`₹7.80–₹9.80/kWh` residential) explicitly labeled `INDICATIVE`                                                                                                                         |
| **Central Solar Subsidy**          | MNRE PM Surya Ghar: Muft Bijli Yojana CFA Guidelines                                                             | Pan-India Residential   | `VERIFIED` (Formula) / `POTENTIALLY_ELIGIBLE` | `₹30,000/kW` up to 2 kW (`₹60,000`), `₹18,000/kW` for 2–3 kW, max **`₹78,000`** (`₹85,800` Special Category); GHS/RWA `₹18,000/kW`; Commercial & Battery `₹0` (`INELIGIBLE`)                                      |
| **Residential Solar Loan**         | SBI Green Loans — PM Surya Ghar Scheme (Effective `2026-10-15`; older `2025-12-15` schedule noted)               | Pan-India Residential   | `INDICATIVE`                                  | **`6.00% p.a.`** (`≤ 3 kW`, loan `≤ ₹2L`); **`8.15% p.a.`** (`> 3–10 kW`, loan `₹2L–₹6L`); **`9.15% p.a.`** (`> ₹6L` or `> 10 kW`, non-scheme); Month-3 direct-to-loan-account DBT prepayment (3 scenarios)       |
| **Commercial Depreciation**        | Section 33, Income-tax Act, 2025 & Notified Income-tax Rules, 2026                                               | Commercial & Industrial | `VERIFIED`                                    | `40%` WDV block rate (`≥ 180 days` H1 commissioning) / `20%` (`< 180 days` H2 commissioning); conditional cash tax shield separated from statutory deduction                                                      |
| **Solar Meteorology**              | NASA POWER SSE Release 8 & NREL PVWatts v8 (`14.08%` system loss derate)                                         | 7 Service Corridors     | `INDICATIVE`                                  | Specific yields: Hyderabad `1,490`, Chennai `1,470`, Visakhapatnam `1,460`, Mumbai `1,450`, Bengaluru `1,440`, Goa `1,430`, Delhi-NCR `1,420` kWh/kWp/yr                                                          |

---

## 5. Unit, Regression, Build & E2E Verification Results

- **Unit & Regression Tests (`npm test`):** **68 passed / 68 total** across 5 test files:
  - `src/config/regulatory.test.ts` (20 tests: TGERC slabs, APERC 6-tier slabs, indicative DISCOMs, unknown DISCOM fallback, inverse bill round-trip, conditional vs confirmed vs received PM Surya Ghar subsidy states, 7-city `14.08%` meteorology, `2026-10-15` SBI `6.00% / 8.15% / 9.15%` loan constants & direct-to-loan-account DBT rules, Notified Income-tax Rules 2026 Section 33 constants, TGERC 2025 `₹2.65/kWh` & APERC 2023 `₹2.09/kWh` `INDICATIVE` surplus rates, and `evaluateSanctionedLoadFeasibility` across TGERC 100%/80% and APERC 100% caps)
  - `src/config/solar.test.ts` (19 tests: P0-A net-metering energy partition & slab settlement; Task A 12-month billing-period settlement vs annual aggregate netting across uniform boundary and seasonal 12-month profiles; Task B & P0-B 25-year cash & financed ledger reconciliation with Month-3 direct-to-loan-account DBT prepayment across all 3 amortization scenarios (`recastEmi`, `reduceTenure`, `unadjustedNoPrepayment`), battery capex exclusion, and `> 10 kW` capacity cap; P0-C Tier 1 `6.00%`, Tier 2 `8.15%`, Above-Cap `9.15%`; Task C `sanctionedLoadFeasibility` integration in `estimate()`; P1-D conditional subsidy states; P1-E unknown DISCOM zeroed financial outputs; P1-F Section 33 commercial tax assessment)
  - `src/functions/leads.test.ts` (21 tests: Step 1 lead pipeline & demo/live safety)
  - `src/config/brand.test.ts` (5 tests: Step 1 brand integrity)
  - `src/lib/suncalc.test.ts` (3 tests: solar geometry)
- **Linter & Copy-Lint (`npm run lint`):** **0 errors**, **0 banned buzzwords**.
- **TypeScript (`npx tsc --noEmit`):** **0 errors**.
- **Production Build (`npm run build`):** **Succeeded cleanly**.
- **Playwright E2E Audit (`npm run test:e2e`):** **All 17 routes and all 14 Step 1 / Step 2 / Step 3 E2E check suites passed (`exit code 0`)**.
