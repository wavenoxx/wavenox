# Statutory, Regulatory, & Meteorological Sources Register

Every calculation, specification, tariff slab, subsidy ceiling, and structural tolerance used across WAVENOX is derived from official statutory gazettes, regulatory commission tariff orders, national building standards, or peer-reviewed satellite meteorological datasets.

This register serves as the authoritative single source of truth and verification index.

---

## 1. Central Financial Assistance (Subsidy)

| Attribute                  | Specification                                                                                                                                                               |
| :------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Scheme**                 | PM Surya Ghar: Muft Bijli Yojana                                                                                                                                            |
| **Governing Authority**    | Ministry of New and Renewable Energy (MNRE), Government of India                                                                                                            |
| **CFA Structure**          | • ₹33,000 for 1st kW<br>• ₹33,000 for 2nd kW<br>• ₹12,000 for 3rd kW<br>• Capped at ₹78,000 for residential systems ≥ 3 kW<br>• ₹0 for commercial / industrial segments     |
| **Special Category**       | ₹36,300/kW for first 2 kW; ₹13,200 for 3rd kW (capped at ₹85,800 for NE states, J&K, Ladakh, HP, Uttarakhand, Lakshadweep, A&N Islands)                                     |
| **Disbursement Mode**      | Direct Benefit Transfer (DBT) directly into Aadhaar-seeded consumer bank account following DISCOM commissioning and net-meter testing                                       |
| **Official Portal**        | [pmsuryaghar.gov.in](https://pmsuryaghar.gov.in)                                                                                                                            |
| **Operational Guidelines** | MNRE Notification No. 318/61/2024-GCRT (February 2024)                                                                                                                      |
| **Verification Date**      | August 2026                                                                                                                                                                 |
| **Secondary References**   | [SurgePV PM Surya Ghar Guide](https://www.surgepv.com/blog/pm-surya-ghar-guide-for-epcs) · [Freyr Energy Subsidy Overview](https://freyrenergy.com/solar-subsidy-in-india/) |

---

## 2. Retail Electricity Tariffs & Net-Metering (Telangana)

| Attribute                     | Specification                                                                                                                                                                                                                      |
| :---------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Regulatory Authority**      | Telangana Electricity Regulatory Commission (TGERC)                                                                                                                                                                                |
| **Jurisdiction DISCOMs**      | TGSPDCL (Southern Power Distribution) & TGNPDCL (Northern Power Distribution)                                                                                                                                                      |
| **Domestic Tariff (LT-I C)**  | **Telescopic Slabs (FY 2025–26 Order):**<br>• 0 – 200 units: ₹5.10 / kWh<br>• 201 – 300 units: ₹7.70 / kWh<br>• 301 – 400 units: ₹9.00 / kWh<br>• > 400 units: ₹9.50 / kWh                                                         |
| **Fixed / Customer Charges**  | ₹50 to ₹70/month based on sanctioned load; Electricity Duty at 6 paise / kWh                                                                                                                                                       |
| **Gruha Jyothi Policy**       | Domestic consumers with monthly consumption ≤ 200 units and verified Food Security Card receive 100% electricity waiver (Telangana Govt. GO Ms. No. 5). Sizing models conservatively model standard tariffs for rooftop solar ROI. |
| **Net-Metering Settlement**   | 1:1 energy credit settlement per billing cycle; unadjusted banked energy settled annually at pooled avoided cost (or APPC per TGERC guidelines)                                                                                    |
| **Time-of-Day (ToD) Tariffs** | TGERC ToD Tariff Order (November 2025) for high-tension & commercial consumers                                                                                                                                                     |
| **Official Tariff Order**     | [TGERC Retail Supply Tariff Order FY 2025-26](https://www.tgerc.telangana.gov.in/file_upload/uploads/Tariff%20Orders/Current%20Year%20Orders/2025/RST%20Order%20FY%202025-26%20FINAL.pdf)                                          |
| **DISCOM Tariff Schedule**    | [TGSPDCL FY 2025-26 Tariff File](https://tgsouthernpower.org/resources/PDF/Tariffs/63tarifffile.pdf)                                                                                                                               |
| **Verification Date**         | August 2026                                                                                                                                                                                                                        |

---

## 3. Solar Meteorology & Insolation Datasets

| Attribute                 | Specification                                                                                                                                          |
| :------------------------ | :----------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Source Agency**         | NASA Langley Atmospheric Science Data Center (NASA POWER Project) / NREL PVWatts v8                                                                    |
| **Location Baseline**     | Hyderabad, Telangana (17.3850° N, 78.4867° E)                                                                                                          |
| **Specific Annual Yield** | **1,490 kWh / kWp / year** (~4.08 kWh/kWp/day average)                                                                                                 |
| **Installation Geometry** | True South azimuth (180°), 14° fixed latitude tilt                                                                                                     |
| **System Loss Derating**  | 14.08% overall derate factor (soiling, shading, wiring, inverter efficiency, thermal derate)                                                           |
| **Seasonal Variation**    | • Pre-monsoon peak (Mar–May): 134 – 144 kWh/kWp/mo<br>• Monsoon low (Jul–Aug): 98 – 105 kWh/kWp/mo<br>• Winter clarity (Nov–Jan): 118 – 128 kWh/kWp/mo |
| **Access URL**            | [NASA POWER API & Data Viewer](https://power.larc.nasa.gov)                                                                                            |
| **Verification Date**     | August 2026                                                                                                                                            |

---

## 4. Structural Wind Load Standards

| Attribute                    | Specification                                                                                                                                                                       |
| :--------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Standard Code**            | IS 875 (Part 3): 2015 / Reaffirmed 2020                                                                                                                                             |
| **Title**                    | Design Loads for Buildings and Structures — Wind Loads                                                                                                                              |
| **Issuing Authority**        | Bureau of Indian Standards (BIS)                                                                                                                                                    |
| **Basic Wind Speed ($V_b$)** | **44 m/s (158.4 km/h)** for Hyderabad / Telangana Zone II                                                                                                                           |
| **Engineering Parameters**   | Terrain Category 2, Risk Coefficient ($k_1$) = 1.0 (50-year design life), Topography Factor ($k_3$) = 1.0, Importance Factor ($k_4$) = 1.15                                         |
| **Structural Materials**     | 6005-T5 architectural anodized aluminium rafters with 4.0 mm Hot-Dip Galvanized (HDG) steel chemical anchor footings, maintaining minimum 2.1 m (7.0 ft) pergola headroom clearance |
| **Source URL**               | [BIS Handbook IS 875 (Part 3)](https://standardsbis.bsbedge.com) · [Infralens Wind Speed Handbook](https://infralens.in/handbook/wind-speed)                                        |
| **Verification Date**        | August 2026                                                                                                                                                                         |

---

## 5. ALMM Compliance & Module Physics

| Attribute                   | Specification                                                                                                                                                                                              |
| :-------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Policy Mandate**          | Approved List of Models and Manufacturers (ALMM) Order, MNRE                                                                                                                                               |
| **ALMM List-II (Cells)**    | Mandates domestic content requirement (DCR) solar cells from 1 June 2026 for government and net-metered residential subsidized installations; net-metering transition windows respected per MNRE circulars |
| **Module Architecture**     | N-Type TOPCon (Tunnel Oxide Passivated Contact) Monocrystalline Dual-Glass Bifacial                                                                                                                        |
| **Module Efficiency**       | 22.8% (Module STC efficiency)                                                                                                                                                                              |
| **Temperature Coefficient** | **−0.30% / °C** for $P_{\text{max}}$ (IEC 61215-2 test standard). At 70°C operating cell temperature, produces +5.49% real energy yield advantage over standard −0.40%/°C p-type PERC panels               |
| **Degradation Warranty**    | ≤ 1.0% in Year 1; ≤ 0.40% / year linear degradation through Year 25 (minimum 89.4% retained capacity at Year 25)                                                                                           |
| **Standards**               | IEC 61215:2021, IEC 61730:2023, BIS IS 14286                                                                                                                                                               |
| **Source References**       | [ALMM List-II Analysis (MYR Solar)](https://myrsolar.com/almm-list-ii-solar-cells) · [SolarSquare MNRE ALMM Rule](https://www.solarsquare.in/blog/mnre-approved-solar-panels-new-almm-list-2-rule/)        |
| **Verification Date**       | August 2026                                                                                                                                                                                                |

---

## 6. Accelerated Tax Depreciation (Commercial & Industrial)

| Attribute                | Specification                                                                                                                                                                                                                                                                               |
| :----------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Statute**              | Income-tax Act, 1961 / Income-tax Act, 2025 (Section 32 / Section 34 Rules)                                                                                                                                                                                                                 |
| **Eligible Asset Class** | Renewable Energy Devices — Solar Photovoltaic Systems                                                                                                                                                                                                                                       |
| **Depreciation Rate**    | **40% Written Down Value (WDV)** in Year 1 for commercial & industrial business entities (50% of 40% = 20% if commissioned for < 180 days in the financial year)                                                                                                                            |
| **Source Reference**     | [Income Tax Department Act & Rules](https://www.incometaxindia.gov.in/documents/d/guest/income_tax_act_2025_as_amended_by_fa_act_2026-pdf) · [TaxGuru Section 34/32 Depreciation Schedule](https://taxguru.in/income-tax/depreciation-income-tax-act-2025-section-34-rates-provisions.html) |
| **Verification Date**    | August 2026                                                                                                                                                                                                                                                                                 |

---

## 7. DISCOM Regulatory Feasibility & Interconnection Timelines

| Attribute             | Specification                                                                                                                                                                                                                                                                                     |
| :-------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Regulation**        | Electricity (Rights of Consumers) Amendment Rules, 2024                                                                                                                                                                                                                                           |
| **Issuing Authority** | Ministry of Power (MoP), Government of India                                                                                                                                                                                                                                                      |
| **Key Mandate**       | **Exemption from technical feasibility study for rooftop solar installations up to 10 kW** (sanctioned load deemed approved upon application submission)                                                                                                                                          |
| **Commissioning SLA** | 15 days maximum statutory timeline from application to meter installation and synchronization for systems ≤ 10 kW                                                                                                                                                                                 |
| **Source Reference**  | [Mercom India Feasibility Waiver Notification](https://www.mercomindia.com/rooftop-solar-10-kw-exempted-feasibility-study-mandate) · [SCC Online Gazette Commentary](https://www.scconline.com/blog/post/2024/02/27/mop-notifies-electricity-rights-of-consumer-amendment-rules-2024-legal-news/) |
| **Verification Date** | August 2026                                                                                                                                                                                                                                                                                       |

---

## 8. Concessional Green Finance Lending Terms

| Attribute                 | Specification                                                                                                                              |
| :------------------------ | :----------------------------------------------------------------------------------------------------------------------------------------- |
| **Financial Institution** | State Bank of India (SBI)                                                                                                                  |
| **Scheme**                | SBI PM Surya Ghar Solar Loan Scheme                                                                                                        |
| **Interest Rate**         | **7.00% p.a. floating** (linked to 1-year EBLR concessional green discount)                                                                |
| **Tenure**                | Up to 60 months (5 years) or 84 months (7 years)                                                                                           |
| **Collateral**            | Nil tangible collateral required for rooftop installations up to 3 kW capacity                                                             |
| **Margin Money**          | 10% borrower margin; 90% project cost financed                                                                                             |
| **Source Reference**      | [SBI Solar Loan Terms](https://sbi.co.in) · [MYR Solar SBI PM Surya Ghar Lending Brief](https://myrsolar.com/sbi-pm-surya-ghar-solar-loan) |
| **Verification Date**     | August 2026                                                                                                                                |

---

## 9. Data Privacy & Statutory Compliance

| Attribute              | Specification                                                                                                                                                                             |
| :--------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Legislation**        | Digital Personal Data Protection Act, 2023 (DPDP Act) & DPDP Rules 2025                                                                                                                   |
| **Issuing Authority**  | Ministry of Electronics and Information Technology (MeitY), Government of India                                                                                                           |
| **Enactment Notice**   | Notified in 2025 with phased implementation guidelines                                                                                                                                    |
| **Compliance Posture** | Explicit purpose-specific consent capture (`consent_given`, `consent_version`, `consent_at`), zero marketing data brokerage, right to withdraw consent, zero unsolicited outbound contact |
| **Concept Status**     | WAVENOX operates as an architectural technology portfolio concept prototype; submissions are recorded as feasibility requests with honest demo end-states                                 |
| **Source URL**         | [PIB MeitY DPDP Notification](https://www.pib.gov.in/PressReleasePage.aspx?PRID=2190014)                                                                                                  |
| **Verification Date**  | August 2026                                                                                                                                                                               |

---

## 10. Appliance Power Ratings (BEE Standards)

| Appliance                      | Rating Standard     | Continuous Power                    | Source Authority                           |
| :----------------------------- | :------------------ | :---------------------------------- | :----------------------------------------- |
| **1.5T 5-Star Inverter AC**    | ISEER ≥ 5.0         | 850 W sustained (1,450 W peak pull) | Bureau of Energy Efficiency (BEE) Schedule |
| **BLDC Ceiling Fan**           | 5-Star Rated        | 28 W (at speed 5)                   | BEE Mandatory Label                        |
| **350L Inverter Refrigerator** | 5-Star Rated        | 80 W (compressor duty-cycle avg)    | BEE Schedule                               |
| **Whole-Home LED Lighting**    | 10x 4W LED fixtures | 40 W                                | IS 16102                                   |
| **Wi-Fi Router & ONT**         | Fiber gateway       | 15 W                                | OEM Datasheet                              |
| **43-inch 4K Smart TV**        | 5-Star Rated        | 55 W                                | BEE Schedule                               |
| **Microwave Oven**             | Standard Convection | 1,200 W (intermittent duty)         | IS 302-2-25                                |
| **0.5 HP Water Booster Pump**  | Domestic Monobloc   | 375 W                               | IS 9079                                    |

---

_Register maintained and verified for the WAVENOX Clean Technology Prototype. Last updated: September 2026._
