import {
  PM_SURYA_GHAR_SOURCE,
  TGERC_TARIFF_SOURCE,
  APERC_TARIFF_SOURCE,
  INCOME_TAX_SECTION_33_SOURCE,
} from "./regulatory";

/**
 * Sourced Regulatory, Meteorological, and Engineering Assumptions Catalog
 *
 * Published references and indicative model assumptions are distinguished below.
 * A reference is not a site approval, manufacturer warranty or compliance certification.
 */

export interface SourcedDatum {
  id: string;
  metric: string;
  value: string;
  formulaOrBasis?: string;
  authority: string;
  sourceDoc: string;
  sourceUrl: string;
  reviewedDate: string;
  status: "Published reference" | "Indicative model" | "Operational controls";
  notes?: string;
}

export const SOURCES_CATALOG: Record<string, SourcedDatum> = {
  pmSuryaGharSubsidy: {
    id: "pmSuryaGharSubsidy",
    metric: "Central Financial Assistance (CFA)",
    value: "Up to ₹78,000 (General) / ₹85,800 (Special Category)",
    formulaOrBasis:
      "₹30,000 for 1st kW + ₹30,000 for 2nd kW + ₹18,000 for 3rd kW (capped at ₹78,000 for ≥ 3 kW; ₹33,000/kW up to 2 kW + ₹19,800 for 3rd kW in Special Category States)",
    authority: "Ministry of New and Renewable Energy (MNRE), Govt. of India",
    sourceDoc:
      "PM Surya Ghar: Muft Bijli Yojana Operational Guidelines (No. 318/17/2024-GCRT, 7 June 2024; amended 7 July 2025)",
    sourceUrl: PM_SURYA_GHAR_SOURCE.url,
    reviewedDate: "10 Nov 2026",
    status: "Published reference",
    notes:
      "Direct Benefit Transfer credited post-commissioning after DISCOM net-meter activation. When financed via an SBI PM Surya Ghar loan linked on the National Portal, the subsidy is credited directly into the borrower's SBI loan account to prepay loan principal with zero prepayment penalty. Standalone battery storage and commercial installations are ineligible.",
  },
  tgercTariffs: {
    id: "tgercTariffs",
    metric: "Telangana Residential Tariffs & Rooftop Net-Metering (LT-I A/B(i)/B(ii))",
    value: "₹1.95 to ₹10.00 / kWh (Retail) · ₹2.57 / kWh (Verified Surplus Settlement)",
    formulaOrBasis:
      "LT-I(A) ≤100 u: 0–50 @ ₹1.95, 51–100 @ ₹3.10; LT-I(B)(i) 101–200 u: 0–100 @ ₹3.40, 101–200 @ ₹4.80; LT-I(B)(ii) >200 u: 0–200 @ ₹5.10, 201–300 @ ₹7.70, 301–400 @ ₹9.00, 401–800 @ ₹9.50, >800 @ ₹10.00 + Customer/Fixed Charges & ₹0.06/kWh duty",
    authority: "Telangana Electricity Regulatory Commission (TGERC)",
    sourceDoc:
      "Retail Supply Tariff Orders (FY 2025-26 & FY 2026-27), TGERC Regulation No. 1 of 2025 (15 Nov 2025) & Proceedings No. TGERC/Secy/77/2025 (29 Dec 2025)",
    sourceUrl: TGERC_TARIFF_SOURCE.url,
    reviewedDate: "10 Nov 2026",
    status: "Published reference",
    notes:
      "Under TGERC Regulation No. 1 of 2025 (Clause 8.1.3) and Proceedings No. TGERC/Secy/77/2025 dated 29.12.2025 (Page 3), import/export netting occurs per monthly billing period and excess exported units are settled at ₹2.57/kWh (effective from 15.11.2025 until further Commission proceedings), either adjusted in the next month's bill or deposited to the prosumer's bank account while preserving monthly minimum charges. Permissible capacity: 100% of sanctioned load (Residential/Govt) and 80% of sanctioned load (C&I).",
  },
  apercTariffs: {
    id: "apercTariffs",
    metric: "Andhra Pradesh Residential Tariffs & Rooftop Net-Metering (LT-I A)",
    value: "₹1.90 to ₹9.75 / kWh (Retail) · ₹2.09 / kWh (Indicative Surplus)",
    formulaOrBasis:
      "Telescopic slabs across all domestic connections: 0–30 @ ₹1.90; 31–75 @ ₹3.00; 76–125 @ ₹4.50; 126–225 @ ₹6.00; 226–400 @ ₹8.75; >400 @ ₹9.75 + Customer/Fixed Charges & ₹0.06/kWh duty",
    authority: "Andhra Pradesh Electricity Regulatory Commission (APERC)",
    sourceDoc:
      "Retail Supply Tariff Orders (FY 2025-26 & FY 2026-27) & APERC Regulation No. 4 of 2023",
    sourceUrl: APERC_TARIFF_SOURCE.url,
    reviewedDate: "10 Nov 2026",
    status: "Published reference",
    notes:
      "Unified 6-tier telescopic domestic tariff schedule across APEPDCL & APSPDCL. Under APERC Regulation No. 4 of 2023 (Clauses 16.1 & 16.5), energy settlement is performed per monthly billing period (₹2.09/kWh indicative surplus export benchmark), with permissible capacity up to 100% of sanctioned load / contracted demand (80% DT hosting cap).",
  },
  hyderabadSolarYield: {
    id: "hyderabadSolarYield",
    metric: "Hyderabad Annual Solar Generation Yield",
    value: "1,490 kWh / kWp / year (~4.08 kWh/kWp/day)",
    formulaOrBasis:
      "Preliminary generation benchmark at Hyderabad; site-specific weather/model export is not supplied with this estimate",
    authority: "WAVENOX engineering assumption; NASA POWER / PVWatts reference methods",
    sourceDoc: "Regional yield model; validation against a site simulation required",
    sourceUrl: "https://power.larc.nasa.gov",
    reviewedDate: "10 Nov 2026",
    status: "Indicative model",
    notes:
      "Assumes an unshaded south-facing array and modeled system losses. Not a measured output or performance guarantee.",
  },
  windRating: {
    id: "windRating",
    metric: "Preliminary Basic Wind Speed Assumption",
    value: "44 m/s (158.4 km/h)",
    formulaOrBasis:
      "44 m/s is a preliminary design input; location, terrain, height, topography, anchorage and structural loads require engineer approval",
    authority: "Bureau of Indian Standards (BIS)",
    sourceDoc: "IS 875 (Part 3): 2015 Design Loads for Buildings and Structures - Wind Loads",
    sourceUrl: "https://standardsbis.bsbedge.com",
    reviewedDate: "10 Nov 2026",
    status: "Indicative model",
    notes: "No site-specific structural or wind-load certification is provided by this calculator.",
  },
  sbiSolarLoan: {
    id: "sbiSolarLoan",
    metric: "PM Surya Ghar Concessional Solar Loan",
    value:
      "6.00% p.a. (≤ ₹2L, ≤ 3 kW) / 8.15% p.a. (₹2L–₹6L, > 3–10 kW) floating (eff. 15 Oct 2026)",
    formulaOrBasis:
      "90% financing of eligible rooftop solar turnkey cost (10% borrower margin) over 60 months. Post-commissioning MNRE central subsidy is credited directly into the borrower's linked SBI loan account (modeled in Month 3) to prepay loan principal with zero prepayment penalty, reducing remaining monthly EMI or shortening tenure.",
    authority: "State Bank of India (SBI)",
    sourceDoc:
      "SBI Green Loans — PM Surya Ghar Loan for Solar Roof Top (Effective 15 Oct 2026; older personal-banking page lists 5.75% / 7.90% as of 15 Dec 2025)",
    sourceUrl:
      "https://sbi.bank.in/web/sbi-green/green-loans/personal/pm-surya-ghar-loan-for-solar-roof-top",
    reviewedDate: "10 Nov 2026",
    status: "Indicative model",
    notes:
      "Rates are floating (linked to SBI EBLR) and conditional on borrower CIBIL appraisal and bank sanction. Concessional PM Surya Ghar loan ceiling is ₹6,00,000 for systems up to 10 kW; standalone battery storage capex is excluded from scheme financing.",
  },
  section33TaxDepreciation: {
    id: "section33TaxDepreciation",
    metric: "Commercial Solar Accelerated Tax Depreciation",
    value: "40% Written Down Value (WDV) in Year 1",
    formulaOrBasis:
      "40% WDV deduction when commissioned and put to use ≥ 180 days in the financial year (20% if < 180 days); tax shield = Depreciation Deduction × Effective Corporate Tax Rate",
    authority: "Central Board of Direct Taxes (CBDT), Ministry of Finance",
    sourceDoc: "Income-tax Act, 2025 (Section 33) & Notified Income-tax Rules, 2026",
    sourceUrl: INCOME_TAX_SECTION_33_SOURCE.url,
    reviewedDate: "10 Nov 2026",
    status: "Published reference",
    notes:
      "Depreciation reduces taxable business income and is not a direct cash grant; actual realization depends on profitable tax capacity and tax regime election.",
  },
  moduleDegradation: {
    id: "moduleDegradation",
    metric: "Indicative N-Type TOPCon Performance Curve",
    value: "1.0% Year 1 degradation, 0.40%/year thereafter (≥89.4% at Year 25)",
    formulaOrBasis:
      "Illustrative linear degradation curve; final warranty depends on the selected manufacturer and module SKU",
    authority: "WAVENOX module modeling assumption",
    sourceDoc: "Manufacturer datasheet and warranty to be confirmed",
    sourceUrl: "https://mnre.gov.in",
    reviewedDate: "10 Nov 2026",
    status: "Indicative model",
    notes:
      "IEC qualification standards alone do not establish these warranty percentages or zero degradation.",
  },
  temperatureCoefficient: {
    id: "temperatureCoefficient",
    metric: "TOPCon Temperature Coefficient of Pmax",
    value: "−0.30% / °C",
    formulaOrBasis:
      "Power derating above 25°C standard test condition (STC). At 70°C cell temp: −13.5% derating vs −18.0% on −0.40%/°C PERC (+5.49% real gain)",
    authority: "WAVENOX module modeling assumption",
    sourceDoc: "Selected module datasheet required",
    sourceUrl: "https://mnre.gov.in",
    reviewedDate: "10 Nov 2026",
    status: "Indicative model",
    notes:
      "Coefficient is indicative until the actual module datasheet and operating temperature are known.",
  },
  beeApplianceRatings: {
    id: "beeApplianceRatings",
    metric: "Home Appliance Realistic Power Consumption",
    value: "Indicative appliance loads",
    formulaOrBasis:
      "1.5T 5-Star Inverter AC = 850W; BLDC Ceiling Fan = 28W; 5-Star Fridge = 80W; LED Lighting = 40W; Wi-Fi = 15W",
    authority: "WAVENOX load assumptions; BEE labeling reference",
    sourceDoc: "Appliance-specific nameplates and duty cycles required",
    sourceUrl: "https://beeindia.gov.in",
    reviewedDate: "10 Nov 2026",
    status: "Indicative model",
    notes:
      "Backup estimates vary with actual appliance models, cycling, startup current and battery conditions; these are not BEE-certified average loads.",
  },
  dpdpConsent: {
    id: "dpdpConsent",
    metric: "Data Privacy & Statutory Protection",
    value: "Consent and privacy controls; legal review required",
    formulaOrBasis:
      "Explicit consent notice, minimal data collection, zero third-party marketing brokers, right to grievance withdrawal",
    authority: "Ministry of Electronics and Information Technology (MeitY)",
    sourceDoc: "Digital Personal Data Protection Act, 2023 & Notified Rules 2025",
    sourceUrl: "https://meity.gov.in",
    reviewedDate: "10 Nov 2026",
    status: "Operational controls",
    notes:
      "LIVE fails closed without configured persistence. DEMO requires explicit selection. DPDP commencement is phased; these controls are not a legal compliance certification.",
  },
};
