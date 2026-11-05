# WAVENOX — STEP 3 EXECUTION & FINAL REGULATORY / FINANCIAL HARDENING REPORT

## 1. Repository & Branch Status

- **Repository:** `https://github.com/wavenoxx/wavenox.git`
- **Base Branch Verified:** `feat/wavenox-step2-experience` (`ca073199b53d7db52e34249908f90e5860f6fe89`)
- **Step 3 Feature Branch:** `feat/wavenox-step3-solar-engine`
- **Previous Step 3 Commit Verified:** `b324ccc36eeecec2802470975f6f5aaf7a81b8ac`
- **Target Branch for Draft PR #7:** `feat/wavenox-step2-experience` (never merged to `main`, never force-pushed, no live database or production deployment executed)

---

## 2. Final Source Accuracy Patch (`Two Narrowly Scoped Corrections`)

Following commit `b324ccc`, a final two-point source-accuracy patch was executed and verified:

### Correction 1 — Telangana Export Settlement Rate (`₹2.65/kWh` → `₹2.57/kWh`, `VERIFIED`)
- **Official Source Verified:**
  - **Telangana Electricity Regulatory Commission (TGERC) `Proceedings No. TGERC/Secy/77/2025`, dated `29.12.2025` (Page 3, Clause 4 Settlement Rate):** [`Proceeding Solar.pdf`](https://tgerc.telangana.gov.in/file_upload/uploads/Regulations/Final/tserc/2025/Proceeding%20Solar.pdf).
  - **Underlying Section 63 Agreement:** Power Usage Agreement (PUA) entered on `27-08-2024` between NLC India Limited and TGSPDCL & TGNPDCL for supply of 200 MW solar power from NLC Solar PV Station (Kutch District, Gujarat under CPSU Phase II Tranche III) during FY 2024-25 at **`₹2.57/unit`**, approved by TGERC on `17-05-2025`.
  - **Effective Period:** Expressly applicable with effect from the date of notification of *TGERC (Rooftop Solar PV Grid Interactive Systems) Regulation No. 01 of 2025* (`15.11.2025`) until the date of issuance of further proceedings by the Commission. Verified against the official TGERC website that no superseding proceeding has been issued.
- **Changes Implemented:**
  - Replaced `2.65` with **`2.57`** for `TGSPDCL` and `TGNPDCL` across `src/config/regulatory.ts`, `src/config/sources.ts`, `src/routes/legal/disclosures.tsx`, test suites, and documentation.
  - Updated `exportSettlementRateStatus` / `surplusRateStatus` for `TGSPDCL` and `TGNPDCL` to **`"VERIFIED"`** and added `TGERC_EXPORT_SETTLEMENT_PROCEEDING_2025_SOURCE`.
  - Preserved Clause 8.1.3 settlement-credit rules (settlement amount adjusted in the next month's electricity bill or deposited in the eligible prosumer's bank account) and monthly minimum bill charges (`unavoidableFixedCustomerChargesInr`).
  - Preserved Andhra Pradesh (`APEPDCL`, `APSPDCL`) at **`₹2.09/kWh` (`INDICATIVE`)**.

### Correction 2 — SBI Scheme Eligibility Gating in `calculateSolarFinancing()` (`FIXED & VERIFIED`)
- **Defect Identified:** In `src/config/solar.ts`, `calculateSolarFinancing()` computed `isSchemeEligible`, but `qualifiesForTier1` and `qualifiesForTier2` did not check `isSchemeEligible` (and `isSchemeEligible` did not guard against standalone battery storage with `eligibleSolarCapexInr === 0`). Consequently, ineligible battery-inclusive loans (`includeBatteryInSchemeLoan: true`), commercial scenarios (`segment: "commercial"`), and standalone battery configurations with `initialLoanPrincipalInr <= ₹6,00,000` silently received SBI PM Surya Ghar Tier 1 (`6.00%`) or Tier 2 (`8.15%`) concessional rates and scheme labels.
- **Changes Implemented:**
  - Enforced strict 4-part scheme eligibility gating (`isSchemeEligible`) before selecting Tier 1 (`6.00%`) or Tier 2 (`8.15%`):
    1. **Residential Eligible Segment:** `(params.segment ?? "residential") === "residential"`
    2. **Appropriate Equipment / Loan Category:** `!batteryIncludedInSchemeLoan && !isStandaloneBatteryOnly`
    3. **Supported System Capacity:** `systemKw <= 10.0 kW` (`!exceedsCapacityCap`)
    4. **Supported Principal Amount:** `initialLoanPrincipalInr <= ₹6,00,000` (`!exceedsConcessionalCap`)
  - Required `isSchemeEligible === true` in both `qualifiesForTier1` and `qualifiesForTier2`, and gated `rawSubsidy` to residential solar-eligible configurations (`isResidentialSegment && !isStandaloneBatteryOnly`).
  - Assigned the clearly labeled non-scheme illustrative rate (`9.15% p.a. Indicative`) and specific `tierLabel` / `note` disclosures whenever `isSchemeEligible === false`.
  - Verified monthly EMI, total interest, Month-3 subsidy prepayment, and 100% 25-year `financedProjection` reconciliation across all scheme and non-scheme scenarios.

### Before / After Affected Calculations

| Scenario | Metric | Before (`b324ccc`) | After (Final Source Patch) |
| :--- | :--- | :--- | :--- |
| **1. `TGSPDCL` Oversized Export (`₹3,000/mo`, 14 panels `8.12 kW`, `7,107 kWh` surplus)** | Surplus Rate / Surplus Credit / Total Annual Savings | `₹2.65/kWh` (`INDICATIVE`) / `₹18,834/yr` / `₹53,274/yr` | **`₹2.57/kWh` (`VERIFIED`) / `₹18,265/yr` / `₹52,705/yr`** (retains `₹1,560/yr` minimum bill) |
| **2. `TGSPDCL` Seasonal 12-Month Profile (`6,550 kWh/yr` load, 9 panels `5.22 kW`, `2,068 kWh` surplus)** | Surplus Rate / Surplus Credit / Total Annual Savings | `₹2.65/kWh` (`INDICATIVE`) / `₹5,480/yr` / `₹44,833/yr` | **`₹2.57/kWh` (`VERIFIED`) / `₹5,315/yr` / `₹44,668/yr`** |
| **3. `TGSPDCL` Uniform Boundary Case (`₹7,200/mo`, 12 panels `6.96 kW`, `870 kWh` surplus)** | Surplus Rate / Surplus Credit / Total Annual Savings | `₹2.65/kWh` (`INDICATIVE`) / `₹2,306/yr` / `₹83,330/yr` | **`₹2.57/kWh` (`VERIFIED`) / `₹2,236/yr` / `₹83,260/yr`** |
| **4. Battery-Inclusive Loan (`3.48 kW` solar + 1 battery = `₹4,80,760` gross, `includeBatteryInSchemeLoan: true`, `₹78,000` subsidy)** | Rate / Initial EMI / Post-Subsidy Recast EMI / Total Interest | `8.15% p.a.` (falsely received Tier 2) / `₹8,804/mo` / `₹7,145/mo` / `₹78,993` | **`9.15% p.a.` (Non-Scheme Illustrative) / `₹9,013/mo` / `₹7,321/mo` / `₹89,652`** |
| **5. Commercial Small Loan (`2.5 kW`, `₹1,80,000` gross, `segment: "commercial"`)** | Rate / Subsidy Credited / Monthly EMI / Total Interest | `6.00% p.a.` (falsely received Tier 1) / `₹78,000` (if passed) / `₹3,132/mo` | **`9.15% p.a.` (Non-Scheme Illustrative) / `₹0` / `₹3,375/mo` / `₹40,500`** |

---

## 3. Summary of All Step 3 Reconciliations (`Tasks A–D` & `P0-A` through `P1-F`, Preserved)

- **TASK A — 12-Month Billing-Period Net-Metering Settlement (`TGERC Reg. No. 1 of 2025`, `Proceedings No. TGERC/Secy/77/2025` & `APERC Reg. No. 4 of 2023`):** 12-month billing-period settlement loop using regional monthly yield curves; prevents cross-period retail slab offsetting; preserves unavoidable monthly minimum bill charges; values Telangana excess exports at `₹2.57/kWh` (`VERIFIED`) and AP excess exports at `₹2.09/kWh` (`INDICATIVE`).
- **TASK B — SBI Direct-to-Loan-Account DBT Prepayment & Amortization:** Models Month-3 direct-to-loan-account DBT prepayment with zero prepayment penalty across three `INDICATIVE` scenarios (`recastEmi`, `reduceTenure`, `unadjustedNoPrepayment`), strict 4-part scheme eligibility gating, standalone battery exclusion, and 100% 25-year cash-flow chart reconciliation.
- **TASK C — Sanctioned Load & Regulatory Hosting Feasibility:** Enforces TGERC (`100%` Residential/Govt, `80%` Commercial/Industrial) and APERC (`100%`) sanctioned-load caps without assuming an unverified `5 kW` load is confirmed.
- **P0-A through P1-F:** Preserved net-metering energy partition, 25-year ledger reconciliation, SBI `2026-10-15` schedule (`6.00% / 8.15% / 9.15%`), conditional subsidy differentiation (`potentialSubsidyInr`, `confirmedSubsidyInr`, `receivedSubsidyInr`), unknown DISCOM `UNAVAILABLE` fallback, and Notified Income-tax Rules, 2026 Section 33 (`40%` H1 / `20%` H2 WDV) depreciation.

---

## 4. Verified Regulatory & Financial Sources Summary

| Domain                             | Authority / Source                                                                                               | Scope                   | Verification Status                           | Key Parameters                                                                                                                                                                                                    |
| :--------------------------------- | :--------------------------------------------------------------------------------------------------------------- | :---------------------- | :-------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Telangana Domestic Tariff**      | TGERC Retail Supply Tariff Order FY 2025-26 & FY 2026-27                                                         | `TGSPDCL`, `TGNPDCL`    | `VERIFIED`                                    | LT-I(A) `≤100` (`₹1.95`/`₹3.10`), LT-I(B) `101–200` (`₹3.40`/`₹4.80`), LT-I(C) `>200` (`₹5.10` to `₹10.00`); Fixed `₹10/kW/mo`; Customer `₹25–₹80/mo`; Duty `₹0.06/u`                                             |
| **Telangana Rooftop Net-Metering** | TGERC Reg. No. 1 of 2025 (`15-11-2025`) & Proceedings No. `TGERC/Secy/77/2025` (`29-12-2025`)                    | `TGSPDCL`, `TGNPDCL`    | `VERIFIED`                                    | Monthly billing-period netting (Clause 8.1.3); Res/Govt cap `100%` of sanctioned load, C&I cap `80%`; surplus rate **`₹2.57/kWh` (`VERIFIED`, eff. `15.11.2025` until further proceedings)**; minimum bill kept    |
| **Andhra Pradesh Domestic Tariff** | APERC Retail Supply Tariff Order FY 2025-26 & FY 2026-27                                                         | `APEPDCL`, `APSPDCL`    | `VERIFIED`                                    | Unified 6-tier LT-I(A) telescopic schedule: `0–30 @ ₹1.90`, `31–75 @ ₹3.00`, `76–125 @ ₹4.50`, `126–225 @ ₹6.00`, `226–400 @ ₹8.75`, `>400 @ ₹9.75/kWh`; Fixed `₹10/kW/mo`; Customer `₹25–₹55/mo`; Duty `₹0.06/u` |
| **Andhra Pradesh Net-Metering**    | APERC Grid Interactive Solar Rooftop PV System Regulation No. 4 of 2023                                          | `APEPDCL`, `APSPDCL`    | `VERIFIED` (Rules) / `INDICATIVE` (Surplus ₹) | Monthly billing-period netting (Clauses 16.1 & 16.5); cap `100%` of sanctioned load / contracted demand (`80%` DT limit); surplus export rate `₹2.09/kWh` (`INDICATIVE`)                                          |
| **7 Other Listed DISCOMs**         | KERC (`BESCOM`), MERC (`MSEDCL`, `TATA_MUMBAI`), DERC (`BRPL`), HERC (`DHBVN`), JERC (`GED`), TNERC (`TANGEDCO`) | KA, MH, DL, HR, GA, TN  | `INDICATIVE`                                  | Blended tariff benchmarks (`₹7.80–₹9.80/kWh` residential) explicitly labeled `INDICATIVE`                                                                                                                         |
| **Central Solar Subsidy**          | MNRE PM Surya Ghar: Muft Bijli Yojana CFA Guidelines                                                             | Pan-India Residential   | `VERIFIED` (Formula) / `POTENTIALLY_ELIGIBLE` | `₹30,000/kW` up to 2 kW (`₹60,000`), `₹18,000/kW` for 2–3 kW, max **`₹78,000`** (`₹85,800` Special Category); GHS/RWA `₹18,000/kW`; Commercial & Battery `₹0` (`INELIGIBLE`)                                      |
| **Residential Solar Loan**         | SBI Green Loans — PM Surya Ghar Scheme (Effective `2026-10-15`; older `2025-12-15` schedule noted)               | Pan-India Residential   | `INDICATIVE`                                  | **`6.00% p.a.`** (`≤ 3 kW`, loan `≤ ₹2L`); **`8.15% p.a.`** (`> 3–10 kW`, loan `₹2L–₹6L`); **`9.15% p.a.`** non-scheme illustrative (commercial, battery-inclusive, standalone battery, `> 10 kW`, or `> ₹6L`)     |
| **Commercial Depreciation**        | Section 33, Income-tax Act, 2025 & Notified Income-tax Rules, 2026                                               | Commercial & Industrial | `VERIFIED`                                    | `40%` WDV block rate (`≥ 180 days` H1 commissioning) / `20%` (`< 180 days` H2 commissioning); conditional cash tax shield separated from statutory deduction                                                      |
| **Solar Meteorology**              | NASA POWER SSE Release 8 & NREL PVWatts v8 (`14.08%` system loss derate)                                         | 7 Service Corridors     | `INDICATIVE`                                  | Specific yields: Hyderabad `1,490`, Chennai `1,470`, Visakhapatnam `1,460`, Mumbai `1,450`, Bengaluru `1,440`, Goa `1,430`, Delhi-NCR `1,420` kWh/kWp/yr                                                          |

---

## 5. Unit, Regression, Build & E2E Verification Results

- **Unit & Regression Tests (`npm test`):** **68 passed / 68 total** across 5 test files:
  - `src/config/regulatory.test.ts` (20 tests: TGERC slabs, APERC 6-tier slabs, indicative DISCOMs, unknown DISCOM fallback, inverse bill round-trip, conditional vs confirmed vs received PM Surya Ghar subsidy states, 7-city `14.08%` meteorology, `2026-10-15` SBI `6.00% / 8.15% / 9.15%` loan constants & direct-to-loan-account DBT rules, Notified Income-tax Rules 2026 Section 33 constants, TGERC Proceedings No. `TGERC/Secy/77/2025` `₹2.57/kWh` `VERIFIED` & APERC 2023 `₹2.09/kWh` `INDICATIVE` surplus rates, and `evaluateSanctionedLoadFeasibility` across TGERC 100%/80% and APERC 100% caps)
  - `src/config/solar.test.ts` (19 tests: P0-A net-metering energy partition & slab settlement; Task A 12-month billing-period settlement vs annual aggregate netting across uniform boundary and seasonal 12-month profiles with `₹2.57/kWh` TGERC settlement; Task B & Final Source Patch 25-year cash & financed ledger reconciliation with Month-3 direct-to-loan-account DBT prepayment across all 3 amortization scenarios (`recastEmi`, `reduceTenure`, `unadjustedNoPrepayment`), strict `isSchemeEligible` gating rejecting battery-inclusive, commercial, standalone-battery, `> 10 kW`, and `> ₹6L` scenarios from Tier 1/Tier 2 concessional rates; Task C `sanctionedLoadFeasibility` integration in `estimate()`; P1-D conditional subsidy states; P1-E unknown DISCOM zeroed financial outputs; P1-F Section 33 commercial tax assessment)
  - `src/functions/leads.test.ts` (21 tests: Step 1 lead pipeline & demo/live safety)
  - `src/config/brand.test.ts` (5 tests: Step 1 brand integrity)
  - `src/lib/suncalc.test.ts` (3 tests: solar geometry)
- **Linter & Copy-Lint (`npm run lint`):** **0 errors**, **0 banned buzzwords**.
- **TypeScript (`npx tsc --noEmit`):** **0 errors**.
- **Production Build (`npm run build`):** **Succeeded cleanly**.
- **Playwright E2E Audit (`npm run test:e2e`):** **All 17 routes and all Step 1 / Step 2 / Step 3 E2E check suites passed (`exit code 0`)**.
