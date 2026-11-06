# WAVENOX — Step 3 Solar Engineering & Financial Calculation Methodology

**Version:** Step 3 Final Source Accuracy Patch (`feat/wavenox-step3-solar-engine`)
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
- **Avoidable Monthly Charges (offsettable by solar self-consumption & 1:1 net-metering within the billing period):**
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

## 2. Solar Generation, Roof-Area Feasibility & Sanctioned Load Caps (`Task C`)

### 2.1 Regional Specific Yield & 12-Month Seasonality (`getSolarYieldProfileForDiscom`)

Each supported DISCOM maps to one of 7 city meteorological profiles in `CITY_SOLAR_METEOROLOGY` derived from NASA POWER SSE Release 8 climatology and NREL PVWatts v8, including a 12-month yield distribution $(y_1, \dots, y_{12})$ summing to $Y_{\text{spec}}$:

- **Hyderabad (`TGSPDCL`, `TGNPDCL`):** $Y_{\text{spec}} = 1,490\text{ kWh/kWp/year}$ (`monthlyYield = [125, 130, 148, 152, 155, 110, 98, 95, 108, 124, 122, 123]`)
- **Visakhapatnam / AP (`APEPDCL`, `APSPDCL`):** $Y_{\text{spec}} = 1,460\text{ kWh/kWp/year}$ (`monthlyYield = [128, 132, 144, 146, 140, 102, 94, 92, 105, 120, 125, 132]`)
- **Bengaluru (`BESCOM`):** $Y_{\text{spec}} = 1,440\text{ kWh/kWp/year}$
- **Mumbai (`MSEDCL`, `TATA_MUMBAI`):** $Y_{\text{spec}} = 1,450\text{ kWh/kWp/year}$
- **Delhi-NCR (`BRPL`, `DHBVN`):** $Y_{\text{spec}} = 1,420\text{ kWh/kWp/year}$
- **Goa (`GED`):** $Y_{\text{spec}} = 1,430\text{ kWh/kWp/year}$
- **Chennai (`TANGEDCO`):** $Y_{\text{spec}} = 1,470\text{ kWh/kWp/year}$

All 7 profiles use a consistent **14.08% composite system loss derate** (`systemLossDeratePct = 14.08`, NREL PVWatts v8 standard loss model) and are classified as `status: "INDICATIVE"`, `category: "ENGINEERING_MODEL_ASSUMPTION"`. Unknown DISCOMs receive `UNAVAILABLE_SOLAR_YIELD_PROFILE` (`annualKwhPerKw = 0`, `status: "UNAVAILABLE"`).

### 2.2 System Sizing, Module Count & Roof Area (`validateRoofFeasibility`)

Given estimated annual consumption $U_{\text{annual}} = \sum_{m=1}^{12} U_m$ (kWh/year):

$$\text{Needed kW} = \text{clamp}\left(\frac{U_{\text{annual}}}{Y_{\text{spec}}},\; 3\text{ kW},\; 25\text{ kW}\right)$$

- **Module Count ($580\text{W}$ N-Type TOPCon):**
  $$N_{\text{panels}} = \left\lceil \frac{\text{Needed kW} \times 1000}{580} \right\rceil, \qquad \text{System kW} = \text{round}_2\left(\frac{N_{\text{panels}} \times 580}{1000}\right)$$
- **Physical Module Footprint (`panelFootprintSqft = 27.8`):**
  $$A_{\text{module}} = \text{round}(N_{\text{panels}} \times 27.8\text{ sq.ft}) \quad (2278\text{ mm} \times 1134\text{ mm} = 2.583\text{ m}^2 = 27.8\text{ sq.ft})$$
- **Recommended Shadow-Free Clear Roof Area (`clearRoofSqftPerKw = 100`):**
  $$A_{\text{clear}} = \text{round}(\text{System kW} \times 100\text{ sq.ft/kW})$$

### 2.3 Sanctioned Load & Regulatory Hosting Feasibility (`evaluateSanctionedLoadFeasibility` — `Task C`)

The engine never silently assumes the customer has a verified `5 kW` sanctioned load unless `sanctionedLoadConfirmed === true` (`knownSanctionedLoadKw` vs `assumedSanctionedLoadKw = 5`):

1. **Telangana (`TGERC Regulation No. 1 of 2025`):**
   - **Residential & Government:** Capped at **100% of sanctioned load / contracted demand** ($\text{Max Solar kW} = 1.00 \times L_{\text{sanctioned}}$, up to $500\text{ kWp}$ net metering).
   - **Commercial & Industrial:** Capped at **80% of sanctioned load / contracted demand** ($\text{Max Solar kW} = 0.80 \times L_{\text{sanctioned}}$, up to $500\text{ kWp}$ net metering; $> 500\text{ kWp}$ up to $2\text{ MW}$ under gross metering).
   - **Distribution Transformer (DT) Hosting Limit:** $80\%$ of DT rated capacity (`dtHostingCapacityLimitPct = 80`).
2. **Andhra Pradesh (`APERC Regulation No. 4 of 2023`):**
   - **Residential & Commercial:** Capped at **100% of sanctioned load / contracted demand** ($\text{Max Solar kW} = 1.00 \times L_{\text{sanctioned}}$, up to $500\text{ kW}$; $80\%$ DT hosting limit).
3. **Other Regional Benchmarks:**
   - Default $100\%$ of sanctioned load (`status: "INDICATIVE"`).
4. **Load Enhancement Detection:**
   - Whenever $\text{System kW} > \text{Max Permissible Solar kW}$ (either against confirmed sanctioned load or the unconfirmed `5 kW` planning assumption), `requiresLoadEnhancement = true`, `requiredSanctionedLoadKwForSystem = ceil((systemKw / capRatio) * 100) / 100`, and an explicit warning is surfaced in `estimate().warnings` and `SystemConfigurator.tsx`.

---

## 3. 12-Month Billing-Period Net-Metering Settlement (`Task A`, `P0-A` & Final Source Patch)

### 3.1 Legal & Regulatory Basis (`TGERC Regulation No. 1 of 2025`, `Proceedings No. TGERC/Secy/77/2025` & `APERC Regulation No. 4 of 2023`)

Under **TGERC Rooftop Solar PV Grid Interactive Systems Regulation No. 1 of 2025 (Sections 2 & Clauses 8.1.1–8.1.5, notified 15 Nov 2025)**, **TGERC Proceedings No. `TGERC/Secy/77/2025` (dated 29 Dec 2025, Page 3)**, and **APERC Grid Interactive Solar Rooftop Photovoltaic System Regulation No. 4 of 2023 (Clauses 16.1 & 16.5)**:

- Import/export netting occurs **per monthly billing period** ($m \in \{1, \dots, 12\}$), **never across the entire year at retail slab rates**.
- If exported solar energy in billing period $m$ exceeds imported grid energy in billing period $m$, the net surplus exported energy for that billing period is settled at the statutory surplus export rate (`exportRateInr`), and the consumer receives a **monthly minimum bill** (unavoidable monthly fixed and customer charges for month $m$ are preserved).
- Under **Clause 8.1.3 of TGERC Regulation No. 1 of 2025**, the surplus settlement amount is either **adjusted in the next month's electricity bill** or **deposited in the bank account** of the eligible consumer/prosumer furnished to the licensee at the time of application.
- Excess export in month $m$ (e.g., March/April peak solar or low-load winter months) **cannot** be carried forward as a 1:1 kWh credit to offset net grid imports in month $m' \ne m$ (e.g., May peak AC load or July/August monsoon months) at retail telescopic slab rates ($₹5.10\text{–}₹10.00/\text{kWh}$).

### 3.2 Monthly Energy Partition & Settlement Equations ($m = 1, \dots, 12$)

Given system capacity $\text{System kW}$, monthly specific yield distribution $y_m$ ($\sum_{m=1}^{12} y_m = Y_{\text{spec}}$), and monthly consumption $U_m$ (either from actual 12-month bill history `monthlyConsumptionByMonth` or uniform $U_m = U_{\text{mo}}$ disclosed as `consumptionProfileBasis: "UNIFORM_MONTHLY_ASSUMPTION"`):

- **Monthly Solar Generation ($G_m$):**
  $$G_m = \text{round}\left(\text{System kW} \times y_m\right), \qquad \text{with peak month adjusted so } \sum_{m=1}^{12} G_m = G_{\text{annual}}$$
- **Monthly Direct Self-Consumed Energy ($E_{\text{self},m}$):**
  $$E_{\text{self},m} = \min\left(U_m,\; \text{round}(G_m \times f_{\text{self}})\right), \qquad f_{\text{self}} \in \{0.70, 0.90\}$$
- **Monthly Exported Solar Energy ($E_{\text{exp},m}$):**
  $$E_{\text{exp},m} = \max(0,\; G_m - E_{\text{self},m})$$
- **Monthly Gross Imported Grid Energy ($E_{\text{imp},m}$):**
  $$E_{\text{imp},m} = \max(0,\; U_m - E_{\text{self},m})$$
- **Monthly 1:1 Net-Metered Offset Energy ($E_{\text{offset},m}$):**
  $$E_{\text{offset},m} = \min(E_{\text{exp},m},\; E_{\text{imp},m})$$
- **Monthly Billing-Period Net Surplus Export ($E_{\text{surplus},m}$):**
  $$E_{\text{surplus},m} = \max(0,\; E_{\text{exp},m} - E_{\text{offset},m})$$
- **Monthly Residual Net Billed Grid Import ($E_{\text{res},m}$):**
  $$E_{\text{res},m} = \max(0,\; E_{\text{imp},m} - E_{\text{offset},m}) = \max(0,\; U_m - G_m)$$

### 3.3 Monthly Monetary Valuation & Annual Aggregation

For each month $m \in \{1, \dots, 12\}$:
- **Baseline Monthly Bill:** $B_{\text{base},m} = \text{TotalBill}(U_m)$
- **Unavoidable Monthly Fixed & Customer Charges:** $C_{\text{unavoid},m} = \text{UnavoidableCharges}(U_m)$
- **Post-Solar Monthly Bill:**
  $$B_{\text{post},m} = \min\left(B_{\text{base},m},\; C_{\text{unavoid},m} + \text{AvoidableCharges}(E_{\text{res},m})\right)$$
- **Monthly Avoided Retail Bill Savings:**
  $$\text{AvoidedSavings}_m = \max(0,\; B_{\text{base},m} - B_{\text{post},m})$$

Summing over $m = 1, \dots, 12$:
- $\text{AvoidedBillSavings}_{\text{yr}} = \sum_{m=1}^{12} \text{AvoidedSavings}_m$
- $E_{\text{surplus,yr}} = \sum_{m=1}^{12} E_{\text{surplus},m}$
- $\text{SurplusExportCredit}_{\text{yr}} = \text{round}\left(E_{\text{surplus,yr}} \times R_{\text{surplus}}\right)$
  - **Telangana (`TGERC Regulation No. 1 of 2025` Clause 8.1.3 & `Proceedings No. TGERC/Secy/77/2025` dated `29.12.2025`, Page 3):** $R_{\text{surplus}} = ₹2.57/\text{kWh}$ (`status: "VERIFIED"` — expressly approved by the Commission based on the FY 2024-25 200 MW NLC India Limited Section 63 PUA dated `27-08-2024` and approved on `17-05-2025`, effective from `15.11.2025` until superseded by further Commission proceedings).
  - **Andhra Pradesh (`APERC Regulation No. 4 of 2023`, Clauses 16.1 & 16.5):** $R_{\text{surplus}} = ₹2.09/\text{kWh}$ (`status: "INDICATIVE"` — regulatory surplus feed-in benchmark).
- $\text{AnnualSavings}_{\text{yr}} = \text{AvoidedBillSavings}_{\text{yr}} + \text{SurplusExportCredit}_{\text{yr}}$

### 3.4 Proof That 12-Month Billing-Period Settlement Prevents Cross-Period Retail Offset (`Task A8`)

| Scenario | DISCOM | Consumption Profile | System Size | Annual Consumption | Annual Gen | 12-Month Billing-Period Offset ($E_{\text{offset,yr}}$) | 12-Month Billing-Period Surplus ($E_{\text{surplus,yr}}$) | Cross-Period Offset Prevented | 12-Month Avoided Bill Savings | Surplus Export Credit (`@ ₹2.57/kWh`) | Total Annual Savings |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **A. Uniform Boundary Case** | `TGSPDCL` | Uniform `836 u/mo` (₹7,200/mo bill) | `6.96 kW` (12 panels) | `10,032 kWh` | `10,370 kWh` | `2,240 kWh` | `870 kWh` (Mar–May peak solar surplus) | `532 kWh` | `₹81,024/yr` (vs `₹84,840/yr` invalid annual aggregate) | `₹2,236/yr` (`870 × ₹2.57`) | **`₹83,260/yr`** |
| **B. Seasonal 12-Month Profile** | `TGSPDCL` | Seasonal `[250..950 u/mo]` (Winter low, Summer AC peak, Monsoon moderate) | `5.22 kW` (9 panels) | `6,550 kWh` | `7,778 kWh` | `935 kWh` | `2,068 kWh` (Winter & spring surplus) | `840 kWh` | `₹39,353/yr` (vs `₹46,836/yr` invalid annual aggregate) | `₹5,315/yr` (`2,068 × ₹2.57`) | **`₹44,668/yr`** |
| **C. Oversized Export Case** | `TGSPDCL` | Uniform `416 u/mo` (₹3,000/mo bill) | `8.12 kW` (14 panels) | `4,992 kWh` | `12,099 kWh` | `0 kWh` (`4,992 kWh` direct self-consumed) | `7,107 kWh` | `0 kWh` | `₹34,440/yr` (retains `₹1,560/yr` minimum bill) | `₹18,265/yr` (`7,107 × ₹2.57`) | **`₹52,705/yr`** |

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
- **Omnigrid Battery Storage:** **`15.0 kWh` nominal / `14.3 kWh` usable `LiFePO4`** per unit (`6.0 kW` continuous / `10.0 kW` surge output, `< 20 ms` transfer time), priced at **`₹2,80,000` per unit** (`SOLAR_ASSUMPTIONS.battery.unitPriceInr = 280000`). Standalone battery storage is excluded from both PM Surya Ghar subsidy calculation and PM Surya Ghar concessional loan principal.

---

## 5. SBI PM Surya Ghar Loan Amortization & Strict Scheme Eligibility Gating (`Task B`, `P0-C` & Final Source Patch)

### 5.1 Official SBI PM Surya Ghar Scheme Rules & Strict Eligibility Gating (`2026-10-15` Schedule)

Based on the official **SBI Green Loans — PM Surya Ghar Loan for Solar Roof Top** schedule effective **`2026-10-15`** (`https://sbi.bank.in/web/sbi-green/green-loans/personal/pm-surya-ghar-loan-for-solar-roof-top`), while documenting the older `2025-12-15` SBI personal-banking page (`5.75% / 7.90%`):

- **Four Mandatory Scheme Eligibility Conditions (`isSchemeEligible`):**
  1. **Residential Eligible Segment:** `segment === "residential"` (commercial installations are ineligible).
  2. **Appropriate Equipment / Loan Category:** `!batteryIncludedInSchemeLoan && !isStandaloneBatteryOnly` (battery-inclusive loans where battery storage is bundled into the loan principal, or standalone battery storage with zero solar PV, are outside the PM Surya Ghar scheme).
  3. **Supported System Capacity:** `systemKw <= 10.0 kW` (`!exceedsCapacityCap`).
  4. **Supported Principal Amount:** `initialLoanPrincipalInr <= ₹6,00,000` (`!exceedsConcessionalCap`).

- **Interest Rate Tiers (`status: "INDICATIVE"`, Strict `isSchemeEligible` Gate):**
  - **Tier 1 (`isSchemeEligible === true` AND $P_0 \le ₹2,00,000$ AND $\text{System kW} \le 3.0\text{ kW}$):** **`6.00% p.a.` floating** (`EBLR - 2.15%`, zero processing fee, collateral-free).
  - **Tier 2 (`isSchemeEligible === true` AND NOT Tier 1 AND $P_0 \le ₹6,00,000$ AND $\text{System kW} \le 10.0\text{ kW}$):** **`8.15% p.a.` floating** (`EBLR`, zero processing fee, collateral-free).
  - **Non-Scheme Illustrative Scenario (`isSchemeEligible === false` — Commercial Segment, Battery-Inclusive Loan, Standalone Battery, $> 10.0\text{ kW}$, or $P_0 > ₹6,00,000$):** **`9.15% p.a.` indicative non-scheme modeling assumption** (`SOLAR_LOAN_TERMS.aboveCapIndicativeRate = 0.0915`), clearly labeled in `tierLabel` and `note`.

### 5.2 Direct-to-Loan-Account DBT Prepayment Mechanics (`Task B1–B3`)

Under official SBI PM Surya Ghar loan rules, the borrower links their SBI loan account on the National Portal (`pmsuryaghar.gov.in`). Upon post-commissioning DBT release (modeled at `subsidyCreditMonth` $m_s = 3$, i.e., after 3 monthly EMI payments), **MNRE central subsidy is credited directly into the borrower's SBI loan account** to prepay/reduce the outstanding loan principal with **Nil prepayment penalty**:

1. **Months $1 \dots m_s$ (Pre-Subsidy Phase):**
   - Initial monthly EMI on $P_0$ over $n = 60$ months at monthly rate $r = \text{APR} / 12$:
     $$\text{EMI}_{\text{init}} = \text{round}\left(P_0 \cdot \frac{r(1+r)^n}{(1+r)^n - 1}\right)$$
   - Reducing-balance simulation for months $t = 1, \dots, m_s$ yields outstanding principal $B_{m_s}$ (`balanceBeforeSubsidyCreditInr`).
2. **At Month $m_s$ (Direct-to-Loan-Account DBT Credit):**
   - **Subsidy Credited to Loan Principal:** $S_{\text{loan}} = \min(B_{m_s},\; \text{Subsidy}_{\text{DBT}})$ (`subsidyCreditedToLoanInr`; `₹0` for commercial or standalone battery scenarios).
   - **Excess Subsidy to Borrower (if $\text{Subsidy}_{\text{DBT}} > B_{m_s}$):** $S_{\text{excess}} = \max(0,\; \text{Subsidy}_{\text{DBT}} - B_{m_s})$ (`excessSubsidyToBorrowerInr`).
   - **Post-Subsidy Remaining Principal:** $P_{\text{post}} = B_{m_s} - S_{\text{loan}}$ (`postSubsidyPrincipalInr`).
3. **Three Explicitly Labeled `INDICATIVE` Amortization Scenarios (`amortizationScenarios`):**
   - **Scenario 1 — `recastEmi` (`LOAN_PRINCIPAL_PREPAYMENT_RECAST_EMI`, Default when $\text{Subsidy}_{\text{DBT}} > 0$):**
     Re-amortizes $P_{\text{post}}$ over the remaining $n - m_s = 57$ months at a **reduced monthly EMI** ($\text{EMI}_{\text{post}} < \text{EMI}_{\text{init}}$).
   - **Scenario 2 — `reduceTenure` (`LOAN_PRINCIPAL_PREPAYMENT_REDUCE_TENURE`):**
     Maintains the initial EMI ($\text{EMI}_{\text{post}} = \text{EMI}_{\text{init}}$) after Month $m_s$ and **shortens the remaining loan tenure** ($n_{\text{eff}} < 60$ months), yielding maximum interest savings.
   - **Scenario 3 — `unadjustedNoPrepayment` (`UNRESTRICTED_SUBSIDY_NO_PREPAYMENT`):**
     Sensitivity baseline where $P_0$ is amortized over all 60 months at $\text{EMI}_{\text{init}}$ without principal prepayment.

---

## 6. Reconciled 25-Year Cash-Flow Ledger (`project25Years` — `Task B6` & `P0-B`)

For each year $y \in \{1, \dots, 25\}$:
- **Degraded Generation:** $G_y = \text{round}\left(G_1 \times (1 - 0.004)^{y-1}\right)$
- **Escalated Tariff Factor:** $E_y = (1 + 0.03)^{y-1}$
- **Annual Savings:** $S_y = \text{round}\left(S_1 \times (1 - 0.004)^{y-1} \times (1 + 0.03)^{y-1}\right)$

### Explicit Cash-Flow Ledger (Zero Subsidy Clamping & Zero Double-Counting)

1. **Cash Purchase Mode (`projection`):**
   - **Year 0 Outlay:** $\text{GrossCapex}$
   - **Year 1 Post-Commissioning DBT Credit:** $+\text{Subsidy}_{\text{DBT}}$ (`subsidyCreditInr = subsidyInr` in Year 1; `0` in Years 2–25)
   - **Cumulative Customer Outflow at Year $y$:** $\text{CumOutflow}_y = \text{GrossCapex} - \text{Subsidy}_{\text{DBT}} = \text{ConditionalNetCapex}$
   - **Net Cumulative Cash Flow at Year $y$:**
     $$\text{NetCumCF}_y = \sum_{t=1}^{y} S_t - \text{CumOutflow}_y \quad \implies \quad \text{projection}[24].\text{netCumulativeCashflow} \equiv \text{netGain25YearsInr}$$

2. **Financed / Loan Mode (`financedProjection` — Direct-to-Loan-Account Prepayment):**
   - **Year 0 Outlay:** $\text{CustomerDownPayment}$ ($10\%$ solar margin $+$ any unfinanced battery capex)
   - **Year 1 Direct-to-Loan-Account DBT Prepayment:** `loanPrincipalPrepaymentInr` $= S_{\text{loan}}$ is credited directly into the SBI loan account at Month 3, reducing the borrower's remaining loan principal and annual EMI outflows (`annualBorrowerEmiOutflows[0..4]`). Any excess subsidy above loan balance ($S_{\text{excess}}$) is recorded in `subsidyCreditInr` (`0` whenever $S_{\text{loan}} = \text{Subsidy}_{\text{DBT}}$). **Subsidy is NEVER both deducted from loan principal AND added as unrestricted customer cash inflow.**
   - **Annual Customer EMI Outflow ($\text{LoanOutflow}_y$):** Exact sum of the 12 monthly customer EMI payments in Year $y$ from the active amortization schedule (`annualBorrowerEmiOutflows[y-1]`), satisfying $\sum_{y=1}^{25} \text{LoanOutflow}_y = \text{TotalCustomerEmiOutflow}$ (`financing.totalRepaymentInr`).
   - **At Year 25:**
     $$\text{CumOutflow}_{25} = \text{CustomerDownPayment} + \text{TotalCustomerEmiOutflow} - S_{\text{excess}} = \text{ConditionalNetCapex} + \text{TotalInterest}_{\text{recast}}$$
     $$\implies \quad \text{financedProjection}[24].\text{netCumulativeCashflow} \equiv \text{financedNetGain25YearsInr}$$

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
