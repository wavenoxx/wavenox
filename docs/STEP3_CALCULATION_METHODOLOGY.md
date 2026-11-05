# WAVENOX — Step 3 Solar Engineering & Financial Calculation Methodology

**Version:** Step 3 (`feat/wavenox-step3-solar-engine`)
**Verification Date:** `2026-11-05`
**Core Engine Modules:** [`src/config/regulatory.ts`](../src/config/regulatory.ts), [`src/config/solar.ts`](../src/config/solar.ts)

---

## 1. Electricity Bill & Inverse Consumption Estimation

### 1.1 Forward Monthly Electricity Bill (`calculateElectricityBill`)

Given a `discomCode`, monthly grid consumption $U \ge 0$ (kWh/month), sanctioned load $L > 0$ (kW), and `consumerCategory`:

$$\text{Total Monthly Bill} = \text{Energy Charge}(U) + \text{Customer Charge}(U) + \text{Fixed Charge}(L) + \text{Electricity Duty}(U)$$

where:

- **Unavoidable Monthly Charges (not offset by solar kWh):**
  $$\text{Unavoidable Charges} = \text{Customer Charge}(U) + \text{Fixed Charge}(L)$$
- **Avoidable Monthly Charges (offsettable by solar self-consumption & 1:1 net-metering):**
  $$\text{Avoidable Charges} = \text{Energy Charge}(U) + \text{Electricity Duty}(U)$$

#### State-Specific Domestic Schedules:

1. **Telangana (`TGSPDCL`, `TGNPDCL` — Verified TGERC LT-I):**
   - **LT-I(A)** ($U \le 100$): $0\text{–}50 \times ₹1.95 + 51\text{–}100 \times ₹3.10$
   - **LT-I(B)** ($100 < U \le 200$): $0\text{–}100 \times ₹3.40 + 101\text{–}200 \times ₹4.80$
   - **LT-I(C)** ($U > 200$):
     $$0\text{–}200 \times ₹5.10 + 201\text{–}300 \times ₹7.70 + 301\text{–}400 \times ₹9.00 + 401\text{–}800 \times ₹9.50 + (>800) \times ₹10.00$$
   - **Fixed Charge:** $₹10/\text{kW/month} \times L$
   - **Customer Charge:** $₹40\text{–}₹100/\text{month}$ by consumption tier
   - **Electricity Duty:** $₹0.06/\text{unit} \times U$
   - **Gruha Jyothi Scheme:** If `applyGruhaJyothi = true` and $U \le 200$, total payable bill is $₹0$.

2. **Andhra Pradesh (`APEPDCL`, `APSPDCL` — Verified APERC LT-I(A)):**
   - **Unified 6-Tier Telescopic Schedule:**
     $$0\text{–}30 \times ₹1.90 + 31\text{–}75 \times ₹3.00 + 76\text{–}125 \times ₹4.50 + 126\text{–}225 \times ₹6.00 + 226\text{–}400 \times ₹8.75 + (>400) \times ₹9.75$$
   - **Fixed Charge:** $₹10/\text{kW/month} \times L$
   - **Customer Charge:** $₹25\text{–}₹55/\text{month}$ by consumption tier
   - **Electricity Duty:** $₹0.06/\text{unit} \times U$

3. **Indicative Regional Benchmarks (`BESCOM`, `MSEDCL`, `TATA_MUMBAI`, `BRPL`, `DHBVN`, `GED`, `TANGEDCO`):**
   - Uses the DISCOM's published blended domestic/commercial benchmark rate $R_{\text{blend}}$, fixed charge per kW, and electricity duty per unit, explicitly tagged `status: "INDICATIVE"`.

4. **Unknown / Unrecognized DISCOM:**
   - Safely returns `status: "UNAVAILABLE"` with zeroed figures and a clear warning message.

### 1.2 Inverse Consumption Estimation (`estimateConsumptionFromBill`)

Given a target monthly bill $B \ge 0$ (₹/month), binary search over $U \in [0, 50000]$ solves for the monthly consumption $U$ whose forward bill matches $B$ (after accounting for fixed/customer charges).

---

## 2. Solar Generation & Roof-Area Feasibility

### 2.1 Regional Specific Yield (`getSolarYieldProfileForDiscom`)

Each DISCOM maps to one of 7 meteorological profiles derived from PVGIS v5.3 TMY & NASA POWER:

- **Hyderabad (`TGSPDCL`, `TGNPDCL`):** $Y_{\text{spec}} = 1,490\text{ kWh/kWp/year}$
- **Visakhapatnam / AP (`APEPDCL`, `APSPDCL`):** $Y_{\text{spec}} = 1,460\text{ kWh/kWp/year}$
- **Bengaluru (`BESCOM`):** $Y_{\text{spec}} = 1,440\text{ kWh/kWp/year}$
- **Mumbai (`MSEDCL`, `TATA_MUMBAI`):** $Y_{\text{spec}} = 1,450\text{ kWh/kWp/year}$
- **Delhi-NCR (`BRPL`, `DHBVN`):** $Y_{\text{spec}} = 1,420\text{ kWh/kWp/year}$
- **Goa (`GED`):** $Y_{\text{spec}} = 1,430\text{ kWh/kWp/year}$
- **Chennai (`TANGEDCO`):** $Y_{\text{spec}} = 1,470\text{ kWh/kWp/year}$

All yields incorporate a **16% total system loss derate** (`systemLossDerateFraction = 0.16`, Performance Ratio $\approx 84\%$) covering temperature derating, soiling, DC/AC wiring, and inverter conversion efficiency.

### 2.2 System Sizing & Module Count

Given estimated monthly consumption $U_{\text{mo}}$ (kWh/month):
$$\text{Target Annual Demand} = 12 \times U_{\text{mo}} \times \text{coverageRatio}$$
$$\text{Raw Capacity (kW)} = \frac{\text{Target Annual Demand}}{Y_{\text{spec}}}$$
Snapped to discrete architectural system tiers $\{3, 5, 8, 10, 15, 20, 25\}\text{ kW}$.

- **Module Count ($580\text{W}$ N-Type TOPCon):**
  $$N_{\text{panels}} = \left\lceil \frac{\text{System kW} \times 1000}{580} \right\rceil$$
- **Required Shadow-Free Roof Area:**
  $$A_{\text{req}} = N_{\text{panels}} \times 28\text{ sq.ft/module} \quad (\approx 80\text{ sq.ft/kW including maintenance aisles})$$

### 2.3 Roof Feasibility Check (`validateRoofFeasibility`)

Given user-available shadow-free roof area $A_{\text{avail}}$:

- $\text{Max Feasible kW} = \lfloor (A_{\text{avail}} / 80) \times 2 \rfloor / 2$
- Returns `isFeasible = (A_avail >= A_req)` and recommends a downsized system if constrained.

---

## 3. Net-Metering & Monthly Bill Savings

Given monthly solar generation $G_{\text{mo}} = \text{round}((\text{System kW} \times Y_{\text{spec}}) / 12)$ and monthly consumption $U_{\text{mo}}$:

- **Self-consumption fraction:**
  - Solar-only: $f_{\text{self}} = 0.42$ (42% daytime self-consumption, 58% exported to grid)
  - Hybrid with LFP battery: $f_{\text{self}} = 0.72$ (72% self-consumption via evening load shifting)
- **Self-consumed solar:** $E_{\text{self}} = \min(U_{\text{mo}}, \text{round}(G_{\text{mo}} \times f_{\text{self}}))$
- **Exported solar to grid:** $E_{\text{exp}} = \max(0, G_{\text{mo}} - E_{\text{self}})$
- **Gross grid import:** $E_{\text{imp}} = \max(0, U_{\text{mo}} - E_{\text{self}})$
- **1:1 Net-Metered Offset within cycle:** $E_{\text{offset}} = \min(E_{\text{exp}}, E_{\text{imp}})$
- **Residual net grid billed units:** $U_{\text{net}} = \max(0, U_{\text{mo}} - G_{\text{mo}})$
- **Net exported surplus units (settled at APPC):** $E_{\text{surplus}} = \max(0, G_{\text{mo}} - U_{\text{mo}})$

$$\text{Monthly Savings} = \left(\text{Bill}(U_{\text{mo}}) - \text{Bill}(U_{\text{net}})\right) + \text{round}(E_{\text{surplus}} \times R_{\text{APPC}})$$

Unavoidable fixed and customer charges remain in $\text{Bill}(U_{\text{net}})$ and are never falsely zeroed out by energy offset.

---

## 4. PM Surya Ghar Subsidy Engine (`evaluateSubsidyEligibility`)

Under MNRE PM Surya Ghar: Muft Bijli Yojana guidelines:

- **Ineligible (`INELIGIBLE`, ₹0):**
  - `consumerCategory === "commercial"` or `"industrial"`
  - `hasExistingPmsgSubsidy === true`
- **Requires Verification (`REQUIRES_VERIFICATION`):**
  - `dcrModulesConfirmed === false` (ALMM/DCR domestic content modules required)
  - `ownershipType === "tenant"` (requires landlord NOC & utility connection in applicant's name)
- **Residential Individual Slab Formula:**
  - First $2\text{ kW}$: $₹30,000/\text{kW}$ ($1\text{ kW} \to ₹30,000$; $2\text{ kW} \to ₹60,000$)
  - Additional capacity from $2\text{ kW}$ to $3\text{ kW}$: $₹18,000/\text{kW}$
  - Above $3\text{ kW}$: Capped at **$₹78,000$** ($₹85,800$ in Special Category States)
- **GHS / RWA Common Facilities:** $₹18,000/\text{kW}$ up to $500\text{ kW}$ (@ $3\text{ kW}$ per house).
- **Important Financial Separation:**
  - Gross Installed Cost = Solar Capex + Battery Capex (if selected)
  - Post-DBT Net Customer Cost = Gross Installed Cost − Indicative Solar Subsidy (credited via DBT after commissioning; battery storage is excluded from subsidy calculation).

---

## 5. Residential Solar Financing & EMI (`calculateSolarFinancing`)

Based on published **SBI Surya Ghar** terms (verified `2026-11-05`):

- **Minimum Borrower Margin (Down Payment):** $10\%$ of project cost ($\text{Max Principal} = 90\%$).
- **Interest Rate Tiers:**
  - System $\le 3\text{ kW}$ and Loan Principal $\le ₹2,00,000$: **$5.75\%\text{ p.a.}$** (`VERIFIED`)
  - Loan Principal $> ₹2,00,000$ up to $₹6,00,000$: **$7.90\%\text{ p.a.}$** (`VERIFIED`)
  - Loan Principal $> ₹6,00,000$ (above concessional scheme cap): **$9.15\%\text{ p.a.}$** (`INDICATIVE`)
- **Standard Reducing-Balance Monthly EMI:**
  Given principal $P$, monthly rate $r = \frac{\text{APR}}{12 \times 100}$, and tenure $n = \text{years} \times 12$:
  $$\text{EMI} = \begin{cases} \frac{P}{n} & \text{if } r = 0 \\ P \cdot \frac{r(1+r)^n}{(1+r)^n - 1} & \text{if } r > 0 \end{cases}$$
- **Total Payable:** $\text{Total Repayment} = \text{EMI} \times n$; $\text{Total Interest} = \text{Total Repayment} - P$.

---

## 6. 25-Year Cash Flow & Payback (`project25Years`)

For each year $t \in \{1, \dots, 25\}$:

- **Degraded Generation:**
  $$G_t = \text{round}\left(G_1 \times (1 - 0.004)^{t-1}\right) \quad (0.40\%/\text{yr N-Type TOPCon degradation})$$
- **Escalated Tariff:**
  $$T_t = T_1 \times (1 + 0.03)^{t-1} \quad (3.0\%/\text{yr conservative tariff escalation})$$
- **Gross Annual Savings:** $S_t = \text{round}(G_t \times T_t)$
- **Annual O&M Reserve:** $M_t = \text{round}(\text{System kW} \times ₹600 \times 1.03^{t-1})$

###Two Distinct Cash-Flow Views:

1. **Cash Purchase Mode (`projection`):**
   - Initial Outflow at $t=0$: $-\text{Net Capex After DBT}$
   - Annual Net Cash Flow: $\text{CF}_t = S_t - M_t$
2. **Financed / Loan Mode (`financedProjection`):**
   - Initial Outflow at $t=0$: $-(\text{Down Payment} - \text{Post-Commissioning DBT Credit})$
   - Annual Debt Service for $t \le \text{Tenure Years}$: $\text{DS}_t = 12 \times \text{EMI}$
   - Annual Net Cash Flow: $\text{CF}_t = S_t - M_t - \text{DS}_t$

---

## 7. Commercial Solar Tax Intelligence (`calculateCommercialSolarAssessment`)

Under **Section 33 of the Income-tax Act, 2025** and **Draft Income-tax Rules, 2026** (effective 1 April 2026, Tax Year 2026-27):

- **Statutory WDV Block Rate:** $40\%$ for renewable energy devices / solar power generating systems.
- **Half-Year Rule (`putToUseHalfYear`):**
  - `H1_180_DAYS_OR_MORE` ($\ge 180$ days in tax year): **Effective Year-1 Depreciation Rate = $40\%$**
  - `H2_LESS_THAN_180_DAYS` ($< 180$ days in tax year): **Effective Year-1 Depreciation Rate = $20\%$**
- **Year-1 WDV Depreciation Allowance (Deduction from Taxable Income):**
  $$D_1 = \text{round}(\text{Gross Capex} \times d_{\text{eff}})$$
- **Closing Year-1 WDV:** $\text{WDV}_1 = \text{Gross Capex} - D_1$
- **Conditional Illustrative Year-1 Cash Tax Shield:**
  $$\text{Tax Shield}_1 = \text{round}\left(D_1 \times \frac{\text{Effective Tax Rate \%}}{100}\right)$$
  _(Explicitly $₹0$ when the entity selects the $0\%$ non-taxable / tax-holiday / loss-making regime)._
- **Operational Simple Payback (Pre-Tax):** $\frac{\text{Gross Capex}}{\text{Annual Energy Savings}}$
- **Illustrative Post-Tax-Shield Payback:** $\frac{\max(0, \text{Gross Capex} - \text{Tax Shield}_1)}{\text{Annual Energy Savings}}$
