# WAVENOX — Step 3 Implementation Plan

## Solar Engineering, Financial Accuracy & Regulatory Intelligence

**Repository:** `https://github.com/wavenoxx/wavenox.git`  
**Verified Step 2 Base Branch:** `feat/wavenox-step2-experience`  
**Verified Step 2 Base Commit:** `ca073199b53d7db52e34249908f90e5860f6fe89`  
**Step 3 Feature Branch:** `feat/wavenox-step3-solar-engine`  
**Research & Verification Date:** November 5, 2026

---

## 1. Baseline Audit & Source-to-Output Dependency Map

### 1.1 Source-to-Output Dependency Map

```
Official Regulatory & Meteorological Sources (src/config/regulatory.ts, src/config/sources.ts)
  ├── TGERC Retail Supply Tariff Orders (FY 2025-26 & FY 2026-27) [VERIFIED]
  ├── APERC Retail Supply Tariff Orders (FY 2025-26 & FY 2026-27) [VERIFIED]
  ├── Non-Telangana/AP Service Corridor Benchmarks (BESCOM, MSEDCL, etc.) [INDICATIVE]
  ├── MNRE PM Surya Ghar: Muft Bijli Yojana CFA Guidelines [VERIFIED]
  ├── SBI PM Surya Ghar Concessional Loan Scheme (dated Nov 2026) [VERIFIED_DATED]
  ├── Income-tax Act, 2025 Section 33 & Income-tax Rules, 2026 WDV Schedule [VERIFIED]
  └── NASA POWER / NREL PVWatts v8 Regional Irradiance Profiles [VERIFIED]
        │
        ▼
State-Specific Tariff & Bill Engine (src/config/regulatory.ts)
  ├── calculateElectricityBill(discomCode, units, context)
  ├── estimateConsumptionFromBill(discomCode, billInr, context)
  └── decodeBill(discomCode, billInr, sanctionedLoadKw)
        │
        ▼
Core Solar Sizing, Net-Metering & Financial Engine (src/config/solar.ts)
  ├── estimate(params) -> EstimateResult
  │     ├── Consumption & Avoidable vs Unavoidable Bill Split
  │     ├── Regional Specific Yield & DC/AC System Sizing
  │     ├── Roof Area & Module Layout Feasibility Check
  │     ├── 1:1 Net-Metering Energy Balance & Surplus APPC Settlement
  │     ├── PM Surya Ghar CFA Eligibility & Gross/Net Cost Separation
  │     ├── Dated Residential Loan & EMI Amortization Schedule
  │     └── project25Years() (Cash vs Financed 25-Year Cash Flows)
  └── calculateCommercialSolarAssessment(params) -> CommercialAssessmentResult
        ├── Commercial Rooftop Sizing & Annual Energy Offset
        └── Section 33 WDV Depreciation Deduction vs Illustrative Tax Shield
        │
        ▼
Customer-Facing Output Surfaces
  ├── Homepage Calculator (src/routes/index.tsx)
  ├── Design Studio (src/components/SystemConfigurator.tsx)
  ├── Bill Decoder (src/components/BillDecoder.tsx)
  ├── Monthly Generation Chart (src/components/MonthlyGenerationChart.tsx)
  ├── 25-Year Wealth Curve (src/components/WealthCurveVisualizer.tsx)
  ├── Architectural Feasibility Proposal Modal (src/components/ArchitecturalDossierModal.tsx)
  ├── Enterprise Commercial Calculator (src/routes/enterprise.tsx)
  ├── Net-Metering Feasibility Guide (src/routes/net-metering.tsx)
  └── Disclosures, Sources & FAQ (src/routes/legal/disclosures.tsx, src/data/faqData.ts)
```

### 1.2 Confirmed Baseline Defects (A–H)

- **Defect A (Silent Telangana Tariff Reuse):** `energyCharge()`, `calculateMonthlyElectricityBill()`, `unitsForBill()`, and `decodeBill()` in `src/config/regulatory.ts` accepted `discomCode` but ignored it, applying Telangana LT-I(A/B/C) slabs to all 11 DISCOMs (`BESCOM`, `MSEDCL`, `APEPDCL`, etc.).
- **Defect B (Uniform Hyderabad Yield & Hardcoded Dossier Yield):** `estimate()` applied `1,490 kWh/kWp/yr` uniformly across all states, while `ArchitecturalDossierModal.tsx` hardcoded `1,450 kWh/kWp/yr` and `₹9.20/kWh` instead of using the engine's output.
- **Defect C (Net-Metering & Battery Savings Distortion):** `estimate()` valued 30% of daytime exports at APPC (`₹3.55/kWh`) even when net annual consumption exceeded generation under 1:1 net metering, and boosted self-consumption from 70% to 90% when a battery was added—artificially increasing annual rupee savings for battery configurations despite 1:1 net metering. It also did not separate unavoidable monthly fixed/customer charges from avoidable energy charges.
- **Defect D (Undated Loan Terms & Inconsistent Sources Catalog):** `regulatory.ts` used `5.75%` (≤ ₹2L) and `7.90%` (₹2L–₹6L), whereas `sources.ts` and `docs/SOURCES.md` stated `7.00% p.a. floating`. Loan calculations also applied concessional Surya Ghar rates to principal amounts above ₹6,00,000 or including standalone battery storage without qualification.
- **Defect E (25-Year Cash vs Financed Projection Conflation & Duplication):** `project25Years()` only modeled cash purchase (`netInvestmentInr`) even when `paymentMode === "loan"` was active, omitted Year-1 initial module degradation (`1.0%`), and `ArchitecturalDossierModal.tsx` duplicated its own 25-year loop.
- **Defect F (Inline Commercial Tax Calculator Without Deduction/Shield Separation):** `src/routes/enterprise.tsx` computed depreciation inline, did not separate the statutory WDV depreciation deduction from the conditional tax shield, and did not model a zero-tax-capacity / non-taxable scenario.
- **Defect G (Insufficient Regional Qualification in UI):** `BillDecoder.tsx` labeled every DISCOM as `"TGERC Sourced Tariff Breakdown"`, and `index.tsx` / `SystemConfigurator.tsx` showed Telangana Gruha Jyothi notes even when non-Telangana DISCOMs were selected.
- **Defect H (Stale `INCOME_TAX_SECTION_34_SOURCE` Identifier & CFA Text Mismatch):** `INCOME_TAX_SECTION_34_SOURCE` retained its old constant name in `regulatory.ts`, `PmSuryaGharJourney.tsx` and `sources.ts` misstated general-category CFA slabs as `₹33,000 + ₹33,000 + ₹12,000` instead of `₹30,000 + ₹30,000 + ₹18,000`, and `MODULE_WARRANTY_TERMS.ratedWatt` was `550` while `PRODUCTS_CONFIG.module.ratedPowerW` was `580`.

---

## 2. Implementation Phases

1. **Phase A (State-Specific Tariff Engine):**
   - Implement verified Telangana (`TGSPDCL`, `TGNPDCL`) TGERC FY 2025-26 / FY 2026-27 LT-I(A/B/C) telescopic tariff profiles and verified Andhra Pradesh (`APEPDCL`, `APSPDCL`) APERC FY 2025-26 / FY 2026-27 LT-I(A) 6-tier telescopic tariff profiles.
   - Mark other 7 DISCOMs (`BESCOM`, `MSEDCL`, `TATA_MUMBAI`, `BRPL`, `DHBVN`, `GED`, `TANGEDCO`) as `INDICATIVE` regional benchmarks with explicit unavoidable fixed-charge baselines and consultation prompts.
   - Handle unknown DISCOM codes safely with `UNAVAILABLE` status instead of silent Telangana fallback.
2. **Phase B (Solar Generation & System Sizing):**
   - Link each DISCOM to its regional solar meteorology profile (`1,490` Hyderabad/Telangana, `1,460` Visakhapatnam/AP, `1,440` Bengaluru/Karnataka, `1,450` Mumbai/Maharashtra, `1,420` Delhi-NCR, `1,430` Goa, `1,470` Chennai/Tamil Nadu).
   - Add roof-area feasibility validation (`validateRoofFeasibility`) and explicit satellite sketcher disclaimers.
3. **Phase C (Net-Metering & Electricity Savings):**
   - Model 1:1 monthly/annual unit netting (`selfConsumedKwh`, `exportedKwh`, `importedKwh`, `netMeteredOffsetKwh`, `netAnnualSurplusKwh`).
   - Cap avoidable savings at `annualAvoidableChargesInr` (`annualBillInr - annualUnavoidableFixedChargesInr`) unless net annual surplus exports earn APPC settlement, and ensure battery storage does not artificially inflate grid bill savings under 1:1 net metering.
4. **Phase D (PM Surya Ghar Subsidy Engine):**
   - Implement `evaluateSubsidyEligibility()` with `POTENTIALLY_ELIGIBLE`, `INELIGIBLE`, and `REQUIRES_VERIFICATION` states, strict exclusion of commercial and battery capex, and clear separation of gross project cost vs post-commissioning DBT subsidy.
5. **Phase E (Residential Financing & EMI):**
   - Implement `calculateSolarFinancing()` with dated SBI PM Surya Ghar terms (`5.75%` ≤ ₹2L, `7.90%` ₹2L–₹6L, `9.15%` indicative above ₹6L concessional cap), 10% minimum customer margin, total interest, and total repayment schedule.
6. **Phase F (25-Year Cash Flow & Payback):**
   - Model Year-1 (`1.0%`) + linear (`0.40%/yr`) degradation, separate Cash Purchase (`projection`) vs Financed Purchase (`financedProjection`), and unify `WealthCurveVisualizer` and `ArchitecturalDossierModal` on the single engine output.
7. **Phase G (Commercial Solar Tax Intelligence):**
   - Rename `INCOME_TAX_SECTION_34_SOURCE` to `INCOME_TAX_SECTION_33_SOURCE`, implement `calculateCommercialSolarAssessment()` under Section 33 of the Income-tax Act, 2025 and 2026 Rules, and separate WDV depreciation deduction, conditional tax shield (including a 0% non-taxable option), and operational payback.
8. **Phase H–L (UI Integration, Comprehensive Tests, Browser QA & Governance Docs):**
   - Integrate across all priority surfaces, expand unit/regression tests in `src/config/regulatory.test.ts` and `src/config/solar.test.ts`, run all quality gates (`npm test`, `npm run lint`, `npx tsc --noEmit`, `npm run build`, `npm run test:e2e`), and publish `STEP3_REGULATORY_SOURCE_MATRIX.md`, `STEP3_CALCULATION_METHODOLOGY.md`, and `STEP3_EXECUTION_REPORT.md`.
