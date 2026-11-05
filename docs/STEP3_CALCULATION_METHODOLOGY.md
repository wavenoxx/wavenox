# WAVENOX — Step 3 Solar Engineering & Financial Calculation Methodology

**Version:** Step 3 Final Hardening (`feat/wavenox-step3-solar-engine`)
**Verification Date:** `2026-11-05`
**Core Engine Modules:** [`src/config/regulatory.ts`](../src/config/regulatory.ts), [`src/config/solar.ts`](../src/config/solar.ts)

---

## 1. Electricity Bill & Inverse Consumption Estimation

### 1.1 Forward Monthly Electricity Bill (`calculateElectricityBill`)

Given a `discomCode`, monthly grid consumption $U \ge 0$ (kWh/month), sanctioned load $L > 0$ (kW), and `segment`:

$$\text{Total Monthly Bill} = \text{Energy Charge}(U) + \text{Customer Charge}(U) + \text{Fixed Charge}(L) + \text{Electricity Duty}(U)$$

where:

- **Unavoidable Monthly Charges (never offset by solar kWh generation):**
  $$\text{Unavoidable Charges} = \text{Customer Charge}(U) + \text{Fixed Charge}(L)$$
- **Avoidable Monthly Charges (offsettable by solar self-consumption & 1:1 net-metering):**
  $$\text{Avoidable Charges} = \text{Energy Charge}(U) + \text{Electricity Duty}(U)$$

#### State-Specific Domestic Schedules:

1. **Telangana (`TGSPDCL`, `TGNPDCL` — Verified TGERC LT-I):**
   - **LT-I(A)** ($U \le 100$): $0\text{–}50 \times ₹1.95 + 51\text{–}100 \times ₹3.10$
   - **LT-I(B)** ($100 < U \le 200$): $0\text{–}100 \times ₹3.40 + 101\text{–}200 \times ₹4.80$
   - **LT-I(C)** ($U > 200$):
     $$0\text{–}200 \times ₹5.10 + 201\text{–}300 \times ₹7.70 + 301\text{–}400 \times ₹9.00 + 401\text{–}800 \times ₹9.50 + (>800) \times ₹10.00$$
   - **Fixed Charge:** $₹10/\text{kW/month} \times L$ (applicable to LT-I(C); ₹0 for LT-I(A/B))
   - **Customer Charge:** $₹25\text{–}₹80/\text{month}$ by consumption tier ($\le 100: ₹25$, $101\text{–}200: ₹50$, $201\text{–}300: ₹60$, $301\text{–}400: ₹70$, $>400: ₹80$)
   - **Electricity Duty:** $₹0.06/\text{unit} \times U$
   - **Gruha Jyothi Scheme:** Eligible domestic households in Telangana consuming $\le 200$ units/month receive a 100% bill waiver.

2. **Andhra Pradesh (`APEPDCL`, `APSPDCL` — Verified APERC LT-I(A)):**
   - **Unified 6-Tier Telescopic Schedule:**
     $$0\text{–}30 \times ₹1.90 + 31\text{–}75 \times ₹3.00 + 76\text{–}125 \times ₹4.50 + 126\text{–}225 \times ₹6.00 + 226\text{–}400 \times ₹8.75 + (>400) \times ₹9.75$$
   - **Fixed Charge:** $₹10/\text{kW/month} \times L$
   - **Customer Charge:** $₹25\text{–}₹55/\text{month}$ by consumption tier ($\le 50: ₹25$, $51\text{–}100: ₹30$, $101\text{–}200: ₹45$, $201\text{–}300: ₹50$, $>300: ₹55$)
   - **Electricity Duty:** $₹0.06/\text{unit} \times U$

3. **Indicative Regional Benchmarks (`BESCOM`, `MSEDCL`, `TATA_MUMBAI`, `BRPL`, `DHBVN`, `GED`, `TANGEDCO`):**
   - Uses the DISCOM's published blended domestic/commercial benchmark rate $R_{\text{blend}}$, fixed charge per kW, customer charge, and electricity duty per unit, explicitly tagged `status: "INDICATIVE"`.

4. **Unknown / Unsupported DISCOM (`P1-E`):**
   - Safely returns `status: "UNAVAILABLE"`, withholds Hyderabad-based tariffs, units, and yields (`annualGenKwh = 0`, `annualSavingsInr = 0`), and returns an explicit warning.

### 1.2 Inverse Consumption Estimation (`estimateConsumptionFromBill` / `unitsForBill`)

Given a target monthly bill $B \ge 0$ (₹/month), binary search over $U \in [0, 25000]$ solves for the monthly consumption $U$ whose forward bill matches $B$ (within $\pm 1\text{ unit}$ across all verified TGERC and APERC tiers).

---

## 2. Solar Generation & Roof-Area Feasibility

### 2.1 Regional Specific Yield (`getSolarYieldProfileForDiscom` — `P1-E`)

Each supported DISCOM maps to one of 7 city meteorological profiles in `CITY_SOLAR_METEOROLOGY` derived from NASA POWER SSE Release 8 climatology and NREL PVWatts v8:

- **Hyderabad (`TGSPDCL`, `TGNPDCL`):** $Y_{\text{spec}} = 1,490\text{ kWh/kWp/year}$
- **Visakhapatnam / AP (`APEPDCL`, `APSPDCL`):** $Y_{\text{spec}} = 1,460\text{ kWh/kWp/year}$
- **Bengaluru (`BESCOM`):** $Y_{\text{spec}} = 1,440\text{ kWh/kWp/year}$
- **Mumbai (`MSEDCL`, `TATA_MUMBAI`):** $Y_{\text{spec}} = 1,450\text{ kWh/kWp/year}$
- **Delhi-NCR (`BRPL`, `DHBVN`):** $Y_{\text{spec}} = 1,420\text{ kWh/kWp/year}$
- **Goa (`GED`):** $Y_{\text{spec}} = 1,430\text{ kWh/kWp/year}$
- **Chennai (`TANGEDCO`):** $Y_{\text{spec}} = 1,470\text{ kWh/kWp/year}$

All 7 profiles use a consistent **14.08% composite system loss derate** (`systemLossDeratePct = 14.08`, NREL PVWatts v8 standard loss model: 2% soiling, 3% shading, 2% mismatch, 2% wiring, 0.5% connections, 1.5% light-induced degradation, 1% nameplate rating, 3% availability) and are classified as `status: "INDICATIVE"`, `category: "ENGINEERING_MODEL_ASSUMPTION"`. Unknown DISCOMs receive `UNAVAILABLE_SOLAR_YIELD_PROFILE` (`annualKwhPerKw = 0`, `status: "UNAVAILABLE"`).

### 2.2 System Sizing, Module Count & Roof Area (`validateRoofFeasibility`)

Given estimated annual consumption $U_{\text{annual}} = 12 \times U_{\text{mo}}$ (kWh/year):

$$\text{Needed kW} = \text{clamp}\left(\frac{U_{\text{annual}}}{Y_{\text{spec}}},\; 3\text{ kW},\; 25\text{ kW}\right)$$

- **Module Count ($580\text{W}$ N-Type TOPCon):**
  $$N_{\text{panels}} = \left\lceil \frac{\text{Needed kW} \times 1000}{580} \right\rceil, \qquad \text{System kW} = \text{round}_2\left(\frac{N_{\text{panels}} \times 580}{1000}\right)$$
- **Physical Module Footprint (`panelFootprintSqft = 27.8`):**
  $$A_{\text{module}} = \text{round}(N_{\text{panels}} \times 27.8\text{ sq.ft}) \quad (2278\text{ mm} \times 1134\text{ mm} = 2.583\text{ m}^2 = 27.8\text{ sq.ft})$$
- **Recommended Shadow-Free Clear Roof Area (`clearRoofSqftPerKw = 100`):**
  $$A_{\text{clear}} = \text{round}(\text{System kW} \times 100\text{ sq.ft/kW}) \quad (\text{includes row pitch spacing, tilt clearance & walkways})$$
- **Feasibility Validation:** Given available roof area $A_{\text{avail}}$, `isFeasible = (A_avail >= A_clear)` and $\text{Max Feasible Panels} = \lfloor ((A_{\text{avail}} / 100) \times 1000) / 580 \rfloor$.

---

## 3. Regulator-Grounded Net-Metering & Bill Savings (`P0-A`)

Given annual solar generation $G_{\text{annual}} = \text{round}(\text{System kW} \times Y_{\text{spec}})$ and annual consumption $U_{\text{annual}} = 12 \times U_{\text{mo}}$:

### 3.1 Partition of Energy Flows (Zero Double-Counting)

- **Self-Consumption Ratio ($f_{\text{self}}$):**
  - Solar-only (`batteryUnits === 0`): $f_{\text{self}} = 0.70$ (`70%` direct daytime behind-the-meter self-consumption)
  - Hybrid with Omnigrid LFP (`batteryUnits > 0`): $f_{\text{self}} = 0.90$ (`90%` self-consumption via evening load shifting)
- **Direct Self-Consumed Energy:**
  $$E_{\text{self}} = \min\left(U_{\text{annual}},\; \text{round}(G_{\text{annual}} \times f_{\text{self}})\right)$$
- **Exported Solar Energy to Grid:**
  $$E_{\text{exp}} = \max(0,\; G_{\text{annual}} - E_{\text{self}}) \quad \implies \quad E_{\text{self}} + E_{\text{exp}} = G_{\text{annual}}$$
- **Gross Imported Grid Energy:**
  $$E_{\text{imp}} = \max(0,\; U_{\text{annual}} - E_{\text{self}})$$
- **Qualifying 1:1 Net-Metered Offset Energy:**
  $$E_{\text{offset}} = \min(E_{\text{exp}},\; E_{\text{imp}})$$
- **True Net Annual Surplus Energy (Settled at APPC):**
  $$E_{\text{surplus}} = \max(0,\; E_{\text{exp}} - E_{\text{offset}}) \quad \implies \quad E_{\text{offset}} + E_{\text{surplus}} = E_{\text{exp}}$$
- **Residual Net Billed Grid Import:**
  $$E_{\text{residual}} = \max(0,\; E_{\text{imp}} - E_{\text{offset}}) = \max(0,\; U_{\text{annual}} - G_{\text{annual}})$$

### 3.2 Monetary Settlement Valuation

1. **Verified Telangana (`TGSPDCL`, `TGNPDCL`) & Andhra Pradesh (`APEPDCL`, `APSPDCL`) Domestic Schedule:**
   - Residual monthly billed units: $U_{\text{res,mo}} = \text{round}(E_{\text{residual}} / 12)$.
   - Unavoidable annual fixed & customer charges: $C_{\text{unavoidable,yr}} = 12 \times \text{UnavoidableCharges}(U_{\text{mo}})$.
   - Residual avoidable annual energy & duty charges: $C_{\text{avoidable,res,yr}} = 12 \times \text{AvoidableCharges}(U_{\text{res,mo}})$.
   - Post-solar annual bill:
     $$\text{PostSolarBill}_{\text{yr}} = \min\left(\text{AnnualBill}_{\text{yr}},\; C_{\text{unavoidable,yr}} + C_{\text{avoidable,res,yr}}\right)$$
   - Avoided retail bill savings:
     $$\text{AvoidedBillSavings}_{\text{yr}} = \max(0,\; \text{AnnualBill}_{\text{yr}} - \text{PostSolarBill}_{\text{yr}})$$
   - True annual surplus APPC settlement credit:
     $$\text{SurplusExportCredit}_{\text{yr}} = \text{round}(E_{\text{surplus}} \times R_{\text{APPC}})$$
   - Total annual monetary benefit:
     $$\text{AnnualSavings}_{\text{yr}} = \text{AvoidedBillSavings}_{\text{yr}} + \text{SurplusExportCredit}_{\text{yr}}$$

2. **Indicative Regional Benchmarks (`BESCOM`, `MSEDCL`, etc.):**
   - $\text{MaxAvoidable}_{\text{yr}} = \max(0,\; \text{AnnualBill}_{\text{yr}} - C_{\text{unavoidable,yr}})$
   - $\text{AvoidedBillSavings}_{\text{yr}} = \min(\text{MaxAvoidable}_{\text{yr}},\; \text{round}((E_{\text{self}} + E_{\text{offset}}) \times R_{\text{blend}}))$
   - $\text{SurplusExportCredit}_{\text{yr}} = \text{round}(E_{\text{surplus}} \times R_{\text{APPC}})$

### 3.3 Independent Numeric Verification Examples (`P0-A`)

| Scenario | DISCOM | Monthly Bill | System Size | Annual Consumption ($U_{\text{annual}}$) | Annual Gen ($G_{\text{annual}}$) | Self-Consumed ($E_{\text{self}}$) | 1:1 Net-Metered Offset ($E_{\text{offset}}$) | True Surplus ($E_{\text{surplus}}$) | Residual Import ($E_{\text{residual}}$) | Avoided Bill Savings | Surplus APPC Credit | Total Annual Savings |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **1. Consumption > Generation** | `TGSPDCL` | ₹15,000/mo (₹1,80,000/yr) | `3.48 kW` (6 panels, 0 bat) | `21,792 kWh` (`1,816 u/mo`) | `5,185 kWh` | `3,630 kWh` | `1,555 kWh` | `0 kWh` | `16,607 kWh` (`1,384 u/mo`) | `₹52,152/yr` | `₹0/yr` | **`₹52,152/yr`** (vs old buggy ₹44,988) |
| **2. Generation > Consumption** | `TGSPDCL` | ₹3,000/mo (₹36,000/yr) | `8.12 kW` (14 panels, 0 bat) | `4,992 kWh` (`416 u/mo`) | `12,099 kWh` | `4,992 kWh` | `0 kWh` | `7,107 kWh` | `0 kWh` (`0 u/mo`) | `₹34,440/yr` (retains ₹1,560/yr fixed) | `₹25,230/yr` (`7,107 × ₹3.55`) | **`₹59,670/yr`** |
| **3. Solar-Only vs Hybrid (1:1 Netting)** | `APEPDCL` | ₹12,000/mo (₹1,44,000/yr) | `5.80 kW` (10 panels, 0 vs 1 bat) | `17,856 kWh` (`1,488 u/mo`) | `8,468 kWh` | `5,928 kWh` (0 bat) / `7,621 kWh` (1 bat) | `2,540 kWh` (0 bat) / `847 kWh` (1 bat) | `0 kWh` | `9,388 kWh` (`782 u/mo`) | `₹82,980/yr` | `₹0/yr` | **`₹82,980/yr`** |

---

## 4. Conditional PM Surya Ghar Subsidy & Hardware Specs (`P1-D` & `P1-F`)

### 4.1 Conditional Subsidy States (`evaluateSubsidyEligibility`)

The engine never hardcodes unconfirmed customer eligibility flags (`isGridConnected`, `dcrCompliant`, `hasPriorSubsidy`) as `true`. Instead, it distinguishes three explicit values:

1. **`potentialSubsidyInr` (`₹30,000/kW` up to 2 kW + `₹18,000` for 3rd kW, capped at `₹78,000` general / `₹85,800` special category):** Potential statutory CFA if all MNRE conditions are satisfied (`eligibilityStatus: "POTENTIALLY_ELIGIBLE"`, `isConditional: true`).
2. **`confirmedSubsidyInr` (`confirmedEligibleSubsidyInr`):** `₹0` until `isGridConnected === true`, `dcrCompliant === true`, `hasPriorSubsidy === false`, and `ownershipConfirmed !== false` are explicitly confirmed (`eligibilityStatus: "CONFIRMED_ELIGIBLE"`, `isConditional: false`).
3. **`receivedSubsidyInr`:** `₹0` until post-commissioning DBT disbursement is confirmed (`subsidyReceived === true`).

### 4.2 Hardware & Battery Specification Reconciliation (`P1-F`)

Per [`src/config/products.ts`](../src/config/products.ts) and [`src/config/solar.ts`](../src/config/solar.ts):
- **Solar Module:** `580W` N-Type TOPCon Dual-Glass Bifacial (`22.8%` efficiency, `-0.30%/°C` temperature coefficient, `27.8 sq.ft` physical footprint, `1.0%` Year-1 max degradation, `0.40%/yr` linear degradation Years 2–25).
- **Omnigrid Battery Storage:** **`15.0 kWh` nominal / `14.3 kWh` usable `LiFePO4`** per unit (`6.0 kW` continuous / `10.0 kW` surge output, `< 20 ms` transfer time), priced at **`₹2,80,000` per unit** (`SOLAR_ASSUMPTIONS.battery.unitPriceInr = 280000`). Standalone battery storage is excluded from PM Surya Ghar subsidy calculation.

---

## 5. Residential Solar Financing & EMI (`calculateSolarFinancing` — `P0-C`)

Based on the official **SBI Green Loans — PM Surya Ghar Loan for Solar Roof Top** schedule effective **`2026-10-15`** (`https://sbi.bank.in/web/sbi-green/green-loans/personal/pm-surya-ghar-loan-for-solar-roof-top`), while documenting the older `2025-12-15` SBI personal-banking page (`5.75% / 7.90%`):

- **Minimum Customer Margin (Year-0 Down Payment):** $10\%$ of gross project cost ($\text{Financed Principal } P = 90\%\text{ of Gross Capex}$).
- **Interest Rate Tiers (`status: "INDICATIVE"`):**
  - **Tier 1 ($P \le ₹2,00,000$, systems $\le 3\text{ kW}$):** **`6.00% p.a.` floating** (`SOLAR_LOAN_TERMS.tier1.annualInterestRate = 0.06`, `isSchemeEligible = true`)
  - **Tier 2 ($₹2,00,000 < P \le ₹6,00,000$, systems $> 3\text{–}10\text{ kW}$):** **`8.15% p.a.` floating** (`SOLAR_LOAN_TERMS.tier2.annualInterestRate = 0.0815`, `isSchemeEligible = true`)
  - **Above-Cap Branch ($P > ₹6,00,000$):** **`9.15% p.a.` indicative non-scheme modeling assumption** (`SOLAR_LOAN_TERMS.aboveCapIndicativeRate = 0.0915`, `isSchemeEligible = false`, `exceedsConcessionalCap = true`).
- **Standard Reducing-Balance Monthly EMI:**
  Given principal $P$, monthly rate $r = \frac{\text{APR}}{12}$, and tenure $n = 60\text{ months}$:
  $$\text{EMI} = \begin{cases} \text{round}(P / n) & \text{if } r = 0 \\ \text{round}\left(P \cdot \frac{r(1+r)^n}{(1+r)^n - 1}\right) & \text{if } r > 0 \end{cases}$$
  $$\text{Total Repayment} = \text{EMI} \times n, \qquad \text{Total Interest} = \text{Total Repayment} - P$$

---

## 6. Reconciled 25-Year Cash-Flow Ledger (`project25Years` — `P0-B`)

For each year $y \in \{1, \dots, 25\}$:
- **Degraded Generation:** $G_y = \text{round}\left(G_1 \times (1 - 0.004)^{y-1}\right)$
- **Escalated Tariff Factor:** $E_y = (1 + 0.03)^{y-1}$
- **Annual Savings:** $S_y = \text{round}\left(S_1 \times (1 - 0.004)^{y-1} \times (1 + 0.03)^{y-1}\right)$

### Explicit Cash-Flow Ledger (Zero Subsidy Clamping or Double-Counting)

Previously, `project25Years()` used `Math.max(0, customerDownPaymentInr - subsidyInr)` at Year 0, which silently dropped `₹56,424` of a `₹78,000` subsidy whenever `customerDownPaymentInr < subsidyInr` (e.g., `₹21,576` 10% down payment on a `3.48 kW` system). The hardened ledger models exact cash-flow timing:

1. **Cash Purchase Mode (`projection`):**
   - **Year 0 Outlay:** $\text{GrossCapex}$
   - **Year 1 Post-Commissioning DBT Credit:** $+\text{Subsidy}_{\text{DBT}}$ (0 in Years 2–25)
   - **Cumulative Customer Outflow at Year $y$:** $\text{CumOutflow}_y = \text{GrossCapex} - \text{Subsidy}_{\text{DBT}} = \text{ConditionalNetCapex}$
   - **Net Cumulative Cash Flow at Year $y$:**
     $$\text{NetCumCF}_y = \sum_{t=1}^{y} S_t - \text{CumOutflow}_y \quad \implies \quad \text{projection}[24].\text{netCumulativeCashflow} \equiv \text{netGain25YearsInr}$$

2. **Financed / Loan Mode (`financedProjection`):**
   - **Year 0 Outlay:** $\text{DownPayment}_{10\%}$
   - **Year 1 Post-Commissioning DBT Credit:** $+\text{Subsidy}_{\text{DBT}}$ (credited once in Year 1; 0 in Years 2–25)
   - **Annual Loan Outflow ($\text{LoanOutflow}_y$):** $12 \times \text{EMI}$ for $y \in \{1, \dots, 5\}$ (0 for $y \in \{6, \dots, 25\}$), with $\sum_{y=1}^{25} \text{LoanOutflow}_y = \text{TotalRepayment}$.
   - **Cumulative Customer Outflow at Year $y$:**
     $$\text{CumOutflow}_y = \text{DownPayment}_{10\%} + \sum_{t=1}^{y} \text{LoanOutflow}_t - \text{Subsidy}_{\text{DBT}}$$
   - **At Year 25:**
     $$\text{CumOutflow}_{25} = \text{DownPayment}_{10\%} + (\text{LoanPrincipal}_{90\%} + \text{TotalInterest}) - \text{Subsidy}_{\text{DBT}} = \text{ConditionalNetCapex} + \text{TotalInterest}$$
     $$\implies \quad \text{financedProjection}[24].\text{netCumulativeCashflow} \equiv \text{financedNetGain25YearsInr}$$

### Independent Numeric Reconciliation Example (`3.48 kW`, 6 Panels, `TGSPDCL`, ₹4,500/mo Bill)
- **Gross Installed System Cost:** `₹2,15,760`
- **Year 0 Customer Down Payment (10%):** `₹21,576`
- **Financed Loan Principal (90%):** `₹1,94,184` (`≤ ₹2,00,000` $\to$ Tier 1 @ `6.00% p.a.` for 60 months)
- **Monthly EMI:** `₹3,754/mo` $\to$ **Total 60-Month EMI Repayment:** `₹2,25,240` (**Total Interest:** `₹31,056`)
- **Year 1 Conditional Post-Commissioning DBT Credit:** `+₹78,000`
- **Net Financed Total Customer Outflow (`DownPayment + TotalRepayment - Subsidy`):** `₹21,576 + ₹2,25,240 - ₹78,000 = ₹1,68,816` (`= ConditionalNetCapex ₹1,37,760 + TotalInterest ₹31,056`)
- **25-Year Cumulative Bill Savings (`savings25YearsInr`):** `₹15,43,891`
- **Year 25 Cash Net Gain (`projection[24].netCumulativeCashflow === netGain25YearsInr`):** `₹15,43,891 - ₹1,37,760 = ₹14,06,131`
- **Year 25 Financed Net Gain (`financedProjection[24].netCumulativeCashflow === financedNetGain25YearsInr`):** `₹15,43,891 - ₹1,68,816 = ₹13,75,075` (**Exact ₹0 discrepancy**).

---

## 7. Commercial Solar Tax Intelligence (`calculateCommercialSolarAssessment` — `P1-F`)

Under **Section 33 of the Income-tax Act, 2025** and **Notified Income-tax Rules, 2026** (effective 1 April 2026, Tax Year 2026-27, Appendix I — Renewable Energy Devices: Solar Power Generating Systems):

- **Statutory WDV Block Rate:** $40\%$ for qualifying solar power generating systems.
- **Half-Year Commissioning Rule:**
  - `H1_FULL_RATE` ($\ge 180$ days in tax year): **Year-1 WDV Depreciation Rate = $40\%$**
  - `H2_HALF_RATE` ($< 180$ days in tax year): **Year-1 WDV Depreciation Rate = $20\%$**
- **Year-1 WDV Depreciation Allowance (Deduction from Taxable Business Income):**
  $$D_1 = \text{round}(\text{Gross Capex} \times d_{\text{eff}}), \qquad \text{Closing Year-1 WDV} = \text{Gross Capex} - D_1$$
- **Conditional Illustrative Year-1 Cash Tax Shield:**
  $$\text{Tax Shield}_1 = \text{round}\left(D_1 \times \frac{\text{Effective Tax Rate \%}}{100}\right) \quad (\text{₹0 when tax rate is } 0\% \text{ or entity has no current taxable profit})$$
