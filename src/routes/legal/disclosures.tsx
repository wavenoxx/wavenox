import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Info, ExternalLink } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BRAND_CONFIG } from "@/config/brand";
import { DISCOMS, SOLAR_ASSUMPTIONS } from "@/config/solar";
import { PRODUCTS_CONFIG } from "@/config/products";
import {
  PM_SURYA_GHAR_SOURCE,
  TGERC_TARIFF_SOURCE,
  TGERC_RTS_REGULATION_2025_SOURCE,
  APERC_TARIFF_SOURCE,
  APERC_RTS_REGULATION_2023_SOURCE,
  HYDERABAD_YIELD_SOURCE,
  IS_875_WIND_SOURCE,
  INCOME_TAX_SECTION_33_SOURCE,
  SBI_SOLAR_LOAN_SOURCE,
  MOP_ROOFTOP_RULES_SOURCE,
  MODULE_WARRANTY_SOURCE,
} from "@/config/regulatory";

export const Route = createFileRoute("/legal/disclosures")({
  head: () => ({
    meta: [
      { title: `Financial Calculation Methodology & Disclosures — ${BRAND_CONFIG.name}` },
      {
        name: "description",
        content: `Transparent engineering assumptions, DISCOM tariff schedules, solar generation physics, and financial modeling methodologies used by ${BRAND_CONFIG.name}.`,
      },
      { property: "og:title", content: `Methodology & Disclosures — ${BRAND_CONFIG.name}` },
      {
        property: "og:description",
        content: `Transparent engineering assumptions, DISCOM tariff schedules, and financial modeling methodologies used by ${BRAND_CONFIG.name}.`,
      },
      { property: "og:image", content: `${BRAND_CONFIG.domain}/media/home-hero-1600w.jpg` },
      { property: "og:url", content: `${BRAND_CONFIG.domain}/legal/disclosures` },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: `${BRAND_CONFIG.domain}/legal/disclosures` }],
  }),
  component: DisclosuresPage,
});

function DisclosuresPage() {
  return (
    <div className="min-h-screen bg-[#FDFDFD] text-[#171A20] selection:bg-[#171A20] selection:text-white flex flex-col">
      <Header />

      <main className="flex-1 pt-28 pb-20 px-6 sm:px-12 max-w-4xl mx-auto w-full">
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs text-[#5C5E62] hover:text-[#171A20] transition-colors mb-4"
          >
            <ArrowLeft size={14} />
            <span>Back to Home</span>
          </Link>
          <div className="text-xs font-semibold uppercase tracking-widest text-[#5C5E62]">
            Engineering Transparency & Compliance
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#171A20] mt-2">
            Calculation Methodology & Consumer Disclosures
          </h1>
          <p className="text-xs text-[#5C5E62] mt-2">
            Single Source of Truth: Mathematical Models, DISCOM Tariffs & PM Surya Ghar Rules
          </p>
        </div>

        <div className="space-y-10 text-sm leading-relaxed text-[#393C41]">
          {/* Statutory Disclosure Banner */}
          <div className="p-5 rounded-2xl bg-[#F8F8FA] border border-[#E2E8F0]">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-[#171A20] shrink-0 mt-0.5" />
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#171A20]">
                  Indicative Financial Model Notice
                </h2>
                <p className="text-xs text-[#5C5E62] mt-1 leading-relaxed">
                  These figures are indicative models based on standard irradiation data and current
                  DISCOM tariffs. Actual generation depends on shading, tilt angle, local weather,
                  and rooftop orientation. A certified site survey provides guaranteed engineering
                  projections.
                </p>
              </div>
            </div>
          </div>

          {/* Section 1: Physics & Generation Yields */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#171A20] border-b border-[#E2E8F0] pb-2">
              1. Solar Physics & Specific Generation Yield
            </h2>
            <p>
              Solar output calculations across our calculators and design studios are derived using
              the following standardized physics formulas:
            </p>
            <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] space-y-2 text-xs font-mono">
              <div className="text-[#171A20] font-bold">
                Annual Energy Output (kWh) = System Capacity (kWp) × Specific Yield (kWh/kWp/yr)
              </div>
              <div className="text-[#5C5E62]">
                Monthly Energy Output (kWh) = Annual Energy Output ÷ 12
              </div>
            </div>
            <ul className="list-disc pl-5 space-y-2 text-[#5C5E62]">
              <li>
                <strong className="text-[#171A20]">
                  Regional Specific Yield ({SOLAR_ASSUMPTIONS.yieldKwhPerKwYear} kWh/kWp/year —
                  Indicative Engineering Model Assumption):
                </strong>{" "}
                Derived from verified NASA POWER 22-year climatology (GHI &amp; ambient temperature)
                combined with an NREL PVWatts v8 standard 14.08% system loss derate factor (soiling,
                inverter, wiring, mismatch, and availability). While the underlying meteorological
                dataset is verified, the modeled kWh/kWp/year yield is classified as{" "}
                <code>INDICATIVE</code> because actual output depends on site shading, tilt, and
                azimuth.
              </li>
              <li>
                <strong className="text-[#171A20]">N-Type TOPCon Efficiency:</strong> Our models
                calibrate against {SOLAR_ASSUMPTIONS.panelWatt}W dual-glass bifacial panels with an
                operating temperature coefficient of -0.30%/°C, significantly outperforming legacy
                P-type PERC panels in high-ambient Indian summers.
              </li>
              <li>
                <strong className="text-[#171A20]">Degradation Multiplier:</strong> Year-1
                degradation is modeled at {PRODUCTS_CONFIG.module.degradationYear1Pct}%, followed by
                a linear annual degradation of {SOLAR_ASSUMPTIONS.degradationPerYear * 100}% per
                year over 25 years.
              </li>
            </ul>
          </section>

          {/* Section 2: Self-Consumption & Net-Metering Math */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#171A20] border-b border-[#E2E8F0] pb-2">
              2. Self-Consumption &amp; Monthly Billing-Period Net-Metering Economics
            </h2>
            <p>
              Power savings depend on utility net-metering regulations and monthly billing-period
              energy netting:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-[#5C5E62]">
              <li>
                <strong className="text-[#171A20]">
                  12-Month Billing-Period Settlement (TGERC Regulation No. 1 of 2025 &amp; APERC
                  Regulation No. 4 of 2023):
                </strong>{" "}
                For verified utilities (<code>TGSPDCL</code>, <code>TGNPDCL</code>,{" "}
                <code>APEPDCL</code>, <code>APSPDCL</code>), energy settlement is simulated month by
                month across all 12 calendar months using the regional monthly solar yield curve (
                <code>CITY_SOLAR_METEOROLOGY[cityKey].monthlyYield</code>). Within each monthly
                billing period, solar generation is partitioned without double-counting into: (1)
                direct behind-the-meter self-consumption (<code>selfConsumedKwh</code>, modeled at
                70% for solar-only and 90% with hybrid storage, capped at that month&apos;s
                consumption), (2) within-period 1:1 net-metered export offset (
                <code>netMeteredOffsetKwh = min(exportedKwh_m, importedKwh_m)</code>), and (3)
                billing-period excess exported energy (
                <code>excessExportKwh_m = exportedKwh_m - netMeteredOffsetKwh_m</code>). Surplus
                exported in month <em>m</em> cannot offset grid imports in a different month{" "}
                <em>m&prime; &ne; m</em> at 1:1 retail slab rates.
              </li>
              <li>
                <strong className="text-[#171A20]">
                  Uniform Monthly Consumption Assumption Disclosure:
                </strong>{" "}
                When 12-month historical utility bills are not uploaded by the customer, the
                calculator models uniform monthly consumption (
                <code>monthlyConsumptionAssumedUniform = true</code>) derived from the entered
                monthly bill. Actual seasonal air-conditioning peaks (April–June) and monsoon solar
                dips (July–September) can create monthly import/export asymmetries; our engine
                explicitly supports 12-month consumption arrays (
                <code>monthlyConsumptionByMonth</code>) to prevent cross-period retail offset.
              </li>
              <li>
                <strong className="text-[#171A20]">
                  Regulator-Grounded Slab Settlement &amp; Unavoidable Fixed Charges:
                </strong>{" "}
                Self-consumed and within-period 1:1 net-metered offset units reduce billed grid
                consumption in each month to residual net imported units (
                <code>residualGridImportKwh</code>). Bill savings equal the avoided retail slab and
                electricity duty charges while retaining unavoidable monthly fixed and customer
                charges even in zero-net-import months.
              </li>
              <li>
                <strong className="text-[#171A20]">
                  Surplus Export Credit Valuation (TGERC Verified ₹2.57/kWh &amp; APERC Indicative
                  ₹2.09/kWh):
                </strong>{" "}
                Under <strong>TGERC Regulation No. 1 of 2025 (Clause 8.1.3)</strong> and{" "}
                <strong>Proceedings No. TGERC/Secy/77/2025 dated 29.12.2025 (Page 3)</strong>, net
                billing-period excess exported energy for TGSPDCL and TGNPDCL is settled at the
                Commission-approved rate of <strong>₹2.57/kWh</strong> (derived from the FY 2024-25
                200 MW NLC India Limited Section 63 PUA dated 27-08-2024 and approved on
                17-05-2025), effective from 15.11.2025 until superseded by further Commission
                proceedings. Per Clause 8.1.3, the settlement credit is either adjusted in the next
                month&apos;s electricity bill or deposited in the eligible prosumer&apos;s bank
                account, while the consumer remains subject to a monthly minimum bill. Under{" "}
                <strong>APERC Regulation No. 4 of 2023 (Clauses 16.1 &amp; 16.5)</strong>, excess
                exported units are valued at an <strong>indicative ₹2.09/kWh</strong> feed-in
                benchmark. Surplus export credits are strictly separated from{" "}
                <code>avoidedBillSavingsInr</code>.
              </li>
              <li>
                <strong className="text-[#171A20]">
                  Sanctioned Load &amp; Transformer Hosting Limits:
                </strong>{" "}
                Under <strong>TGERC Regulation No. 1 of 2025</strong>, permissible grid-interactive
                rooftop solar capacity is capped at <strong>100% of sanctioned load</strong> for
                Residential and Government consumers and <strong>80% of sanctioned load</strong> for
                Commercial and Industrial consumers (up to 500 kWp net metering). Under{" "}
                <strong>APERC Regulation No. 4 of 2023</strong>, permissible capacity is capped at{" "}
                <strong>100% of sanctioned load / contracted demand</strong> (up to 500 kW, subject
                to an 80% distribution transformer capacity limit). Unless the customer explicitly
                confirms their sanctioned load, WAVENOX treats the 5 kW default as an unverified
                assumption and flags when load enhancement may be required.
              </li>
              <li>
                <strong className="text-[#171A20]">Battery Value Proposition:</strong> For
                grid-connected residential consumers under domestic net-metering without Time-of-Day
                (ToD) tariffs, an energy storage battery (15.0 kWh nominal / 14.3 kWh usable
                LiFePO4) shifts daytime export into evening self-consumption and provides sub-20ms
                backup resilience during power outages.
              </li>
            </ul>
          </section>

          {/* Section 3: DISCOM Tariffs & State ERC Schedules */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#171A20] border-b border-[#E2E8F0] pb-2">
              3. State DISCOM Tariff Schedules &amp; Verification Status (FY 2025-26 / FY 2026-27)
            </h2>
            <p>
              We classify every utility in our registry as either{" "}
              <strong className="text-[#171A20]">Verified Schedule</strong> (full telescopic slab,
              customer charge, fixed charge, and duty logic verified against official TGERC and
              APERC Retail Supply Tariff Orders) or{" "}
              <strong className="text-[#171A20]">Indicative Regional Benchmark</strong> (blended
              regional tariff assumption used for preliminary sizing until site-specific SERC bill
              verification). In multi-year financial forecasts, an annual grid tariff escalation
              rate of{" "}
              <strong className="text-[#171A20]">
                {SOLAR_ASSUMPTIONS.tariffEscalationPerYear * 100}%
              </strong>{" "}
              is applied:
            </p>
            <div className="overflow-x-auto rounded-xl border border-[#E2E8F0]">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#F8F8FA] border-b border-[#E2E8F0] text-[#171A20]">
                    <th className="py-2.5 px-4 font-semibold">DISCOM Code</th>
                    <th className="py-2.5 px-4 font-semibold">State</th>
                    <th className="py-2.5 px-4 font-semibold">Verification Status</th>
                    <th className="py-2.5 px-4 font-semibold">Residential Base</th>
                    <th className="py-2.5 px-4 font-semibold">Commercial HT Base</th>
                    <th className="py-2.5 px-4 font-semibold">Surplus Export Rate (Indicative)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {DISCOMS.map((d) => (
                    <tr key={d.code} className="hover:bg-[#FDFDFD]">
                      <td className="py-2.5 px-4 font-mono font-medium text-[#171A20]">{d.code}</td>
                      <td className="py-2.5 px-4 text-[#5C5E62]">{d.state}</td>
                      <td className="py-2.5 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[12px] font-medium ${
                            d.status === "VERIFIED"
                              ? "bg-[#E8F5E9] text-[#1B5E20]"
                              : "bg-[#FFF8E1] text-[#8D6E00]"
                          }`}
                        >
                          {d.status === "VERIFIED"
                            ? `Verified (${d.authority})`
                            : "Indicative Benchmark"}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 tabular-nums">
                        ₹{d.residentialTariffInr.toFixed(2)} / kWh
                      </td>
                      <td className="py-2.5 px-4 tabular-nums">
                        ₹{d.commercialTariffInr.toFixed(2)} / kWh
                      </td>
                      <td className="py-2.5 px-4 tabular-nums text-[#5C5E62]">
                        ₹{d.exportRateInr.toFixed(2)} / kWh (Indicative)
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-[#F8F8FA] border border-[#E2E8F0] space-y-2 text-xs">
                <div className="font-semibold text-[#171A20]">
                  Telangana (TGERC) LT-I Domestic Telescopic Slabs (TGSPDCL &amp; TGNPDCL)
                </div>
                <ul className="list-disc pl-4 space-y-1 text-[#5C5E62]">
                  <li>
                    <strong>LT-I(A) (≤ 100 units/mo):</strong> 0–50 @ ₹1.95, 51–100 @ ₹3.10
                  </li>
                  <li>
                    <strong>LT-I(B) (101–200 units/mo):</strong> 0–100 @ ₹3.40, 101–200 @ ₹4.80
                  </li>
                  <li>
                    <strong>LT-I(C) (&gt; 200 units/mo):</strong> 0–200 @ ₹5.10, 201–300 @ ₹7.70,
                    301–400 @ ₹9.00, 401–800 @ ₹9.50, &gt;800 @ ₹10.00
                  </li>
                  <li>
                    <strong>Fixed &amp; Customer Charges:</strong> LT-I(C) fixed charge
                    ₹10/kW/month; customer charge ₹25–₹80/month; electricity duty ₹0.06/kWh.
                  </li>
                  <li>
                    <strong>Gruha Jyothi Scheme:</strong> Eligible domestic households in Telangana
                    receive zero electricity charges for consumption up to 200 units per month.
                  </li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-[#F8F8FA] border border-[#E2E8F0] space-y-2 text-xs">
                <div className="font-semibold text-[#171A20]">
                  Andhra Pradesh (APERC) LT-I(A) Domestic Telescopic Slabs (APEPDCL &amp; APSPDCL)
                </div>
                <ul className="list-disc pl-4 space-y-1 text-[#5C5E62]">
                  <li>
                    <strong>0 – 30 units/mo:</strong> ₹1.90 / kWh
                  </li>
                  <li>
                    <strong>31 – 75 units/mo:</strong> ₹3.00 / kWh
                  </li>
                  <li>
                    <strong>76 – 125 units/mo:</strong> ₹4.50 / kWh
                  </li>
                  <li>
                    <strong>126 – 225 units/mo:</strong> ₹6.00 / kWh
                  </li>
                  <li>
                    <strong>226 – 400 units/mo:</strong> ₹8.75 / kWh ·{" "}
                    <strong>&gt; 400 units/mo:</strong> ₹9.75 / kWh
                  </li>
                  <li>
                    <strong>Fixed &amp; Customer Charges:</strong> Fixed charge ₹10/kW/month;
                    customer charge ₹25–₹55/month; electricity duty ₹0.06/kWh (excludes variable
                    monthly FPPCA).
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 4: Commercial Tax Depreciation (Section 33) */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#171A20] border-b border-[#E2E8F0] pb-2">
              4. Commercial &amp; Industrial Tax Depreciation (Section 33)
            </h2>
            <p>
              Under Section 33 of the Income-tax Act, 2025 and the Notified Income-tax Rules, 2026
              (in force 1 April 2026, succeeding Section 32 of the 1961 Act), commercial and
              industrial enterprises investing in rooftop solar capital assets can claim Written
              Down Value (WDV) depreciation deductions (modeled at{" "}
              <strong className="text-[#171A20]">40% WDV in Year 1</strong> when put to use for 180
              days or more in the financial year, or 20% under the half-year rule, subject to
              applicable 2026 depreciation block rules and corporate tax regime eligibility).
            </p>
            <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] space-y-1 text-xs">
              <div className="font-semibold text-[#171A20]">Tax Shield Disclaimer</div>
              <p className="text-[#5C5E62]">
                Tax benefits shown in commercial proposals are illustrative models based on a
                corporate tax rate of 25.17% (Section 115BAA) or 30% for partnership firms. The
                actual tax shield realized depends on the company&apos;s taxable profit, tax regime,
                Notified Income-tax Rules, 2026 block schedule, and asset capitalization date.
                Clients must consult their Chartered Accountant before financial commitment.
              </p>
            </div>
          </section>

          {/* Section 5: PM Surya Ghar Sizing & DBT Slab Schedule */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#171A20] border-b border-[#E2E8F0] pb-2">
              5. PM Surya Ghar: Muft Bijli Yojana Central Financial Assistance Slabs
            </h2>
            <p>
              In accordance with official MNRE Operational Guidelines for PM Surya Ghar: Muft Bijli
              Yojana, Central Financial Assistance (CFA) is disbursed strictly as follows:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-[#5C5E62]">
              <li>
                <strong className="text-[#171A20]">First 2 kW:</strong> ₹30,000 per kW (₹60,000 for
                a 2 kW system).
              </li>
              <li>
                <strong className="text-[#171A20]">3rd kW (2 kW to 3 kW):</strong> ₹18,000 for the
                third kilowatt.
              </li>
              <li>
                <strong className="text-[#171A20]">Maximum Residential Subsidy:</strong> ₹78,000 cap
                reached at 3 kW. Systems larger than 3 kW remain eligible for ₹78,000 maximum CFA.
              </li>
              <li>
                <strong className="text-[#171A20]">Special Category States/UTs:</strong> ₹33,000/kW
                for first 2 kW and ₹19,800 for 3rd kW (cap ₹85,800) in Uttarakhand, Himachal
                Pradesh, J&amp;K, Ladakh, North-Eastern States, and Island UTs.
              </li>
              <li>
                <strong className="text-[#171A20]">Group Housing / RWA Common Areas:</strong>{" "}
                ₹18,000 per kW up to 500 kW capacity.
              </li>
              <li>
                <strong className="text-[#171A20]">Commercial/Industrial Exemption:</strong> ₹0
                subsidy. Subsidies apply exclusively to individual residential grid-connected
                consumers and RWAs.
              </li>
              <li>
                <strong className="text-[#171A20]">
                  Conditional DBT Disbursement &amp; Cash-Flow Timing:
                </strong>{" "}
                Unless customer-specific facts (DCR-compliant solar modules, active grid-connected
                DISCOM net-metering, and no prior central rooftop solar subsidy) are verified, CFA
                is modeled as a <strong>conditional potential benefit</strong> (
                <code>potentialSubsidyInr</code>). It is not an upfront vendor discount and is
                credited post-commissioning (modeled in Year 1 of the 25-year cash-flow ledger) via
                Direct Benefit Transfer (DBT) to the beneficiary&apos;s Aadhaar-linked bank account.
              </li>
            </ul>
          </section>

          {/* Section 6: Financing & EMI Terms */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#171A20] border-b border-[#E2E8F0] pb-2">
              6. Indicative Solar Loan, Direct-to-Loan Subsidy Credit &amp; Amortization
            </h2>
            <p>
              Where estimated monthly installments (EMI) are displayed, they are computed as{" "}
              <strong>Indicative Financing Estimates</strong> using the State Bank of India (SBI) PM
              Surya Ghar Loan for Solar Roof Top schedule (SBI Green Loans page effective{" "}
              <strong>15 October 2026</strong>):
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-[#5C5E62]">
              <li>
                <strong className="text-[#171A20]">
                  Financing Coverage &amp; Standalone Battery Exclusion:
                </strong>{" "}
                Up to 90% of <strong>eligible rooftop solar turnkey cost</strong> (10% Year-0
                customer margin down payment). Standalone battery storage capex is outside the PM
                Surya Ghar scheme loan scope and is modeled as an upfront customer outlay (
                <code>unfinancedCapexInr</code>).
              </li>
              <li>
                <strong className="text-[#171A20]">
                  Direct-to-Loan-Account DBT Subsidy Prepayment (Month 3):
                </strong>{" "}
                Under official SBI PM Surya Ghar loan terms, the borrower&apos;s SBI loan account is
                linked on the National Portal and post-commissioning MNRE central subsidy (up to
                ₹78,000 in general category states) is{" "}
                <strong>credited directly into the borrower&apos;s SBI loan account</strong> to
                prepay loan principal with zero prepayment penalty (not paid out as unrestricted
                cash while leaving the 90% loan unreduced).
              </li>
              <li>
                <strong className="text-[#171A20]">
                  Three Indicative Amortization Scenarios Modeled:
                </strong>{" "}
                Because individual bank branches may either recast the monthly EMI or shorten the
                remaining tenure upon subsidy credit, our engine computes three explicitly labeled{" "}
                <code>INDICATIVE</code> schedules: (1){" "}
                <code>LOAN_PRINCIPAL_PREPAYMENT_RECAST_EMI</code> (default when subsidy &gt; 0:
                Months 1–3 at initial EMI on 90% solar principal, Month-3 principal prepayment via
                DBT subsidy, and Months 4–60 re-amortized at a lower{" "}
                <code>postSubsidyMonthlyEmiInr</code>), (2){" "}
                <code>LOAN_PRINCIPAL_PREPAYMENT_REDUCE_TENURE</code> (Month-3 principal prepayment
                while keeping the monthly EMI constant to shorten tenure), and (3){" "}
                <code>UNRESTRICTED_SUBSIDY_NO_PREPAYMENT</code> (unadjusted 60-month schedule).
              </li>
              <li>
                <strong className="text-[#171A20]">
                  Interest Rates &amp; Capacity Tiers (Effective 15 Oct 2026 Schedule):
                </strong>{" "}
                Floating EBLR-linked rates: Tier 1 (loan ≤ ₹2,00,000 and system ≤ 3 kW) at{" "}
                <strong className="text-[#171A20]">6.00% p.a.</strong>; Tier 2 (loan up to ₹6,00,000
                and system &gt; 3 kW up to 10 kW) at{" "}
                <strong className="text-[#171A20]">8.15% p.a.</strong> (Note: an older SBI personal
                banking page dated 15 Dec 2025 listed 5.75% / 7.90% p.a.; we model the newer 15 Oct
                2026 SBI Green Loans schedule and classify all loan outputs as{" "}
                <code>INDICATIVE</code>).
              </li>
              <li>
                <strong className="text-[#171A20]">
                  Systems &gt; 10 kW or Loans Above ₹6,00,000 Cap:
                </strong>{" "}
                Concessional PM Surya Ghar scheme loans apply to residential systems up to 10 kW and
                loan principals up to ₹6,00,000. For systems &gt; 10 kW or financed principals above
                ₹6,00,000, the calculator applies a{" "}
                <strong className="text-[#171A20]">9.15% p.a.</strong> indicative non-scheme retail
                solar loan assumption and flags <code>isSchemeEligible = false</code>.
              </li>
            </ul>
            <p className="text-xs text-[#5C5E62]">
              WAVENOX maintains no exclusive banking partnerships. Customers may select any
              empanelled public or private sector lender directly on the national portal at{" "}
              <a
                href="https://pmsuryaghar.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-[#171A20]"
              >
                pmsuryaghar.gov.in
              </a>
              . Final loan sanctions and terms remain at the sole discretion of the lending bank.
            </p>
          </section>

          {/* Section 7: Sourced Verification Index (#sources) */}
          <section id="sources" className="space-y-4 pt-6 border-t-2 border-[#171A20]">
            <div>
              <div className="text-xs font-semibold uppercase tracking-widest text-[#B45309]">
                Single Source of Truth
              </div>
              <h2 className="text-xl font-bold text-[#171A20] mt-1">
                7. Statutory Verification & Sources Register
              </h2>
              <p className="text-xs text-[#5C5E62] mt-1">
                Every constant, tariff slab, subsidy formula, and physical assumption is verified
                against official regulatory orders and codes.
              </p>
            </div>

            <div className="overflow-x-auto rounded-xl border border-[#E2E8F0]">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#F8F8FA] border-b border-[#E2E8F0] text-[#171A20]">
                    <th className="py-2.5 px-4 font-semibold">Subject</th>
                    <th className="py-2.5 px-4 font-semibold">Statutory Reference & Document</th>
                    <th className="py-2.5 px-4 font-semibold">Verified</th>
                    <th className="py-2.5 px-4 font-semibold">Source Link</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  <tr>
                    <td className="py-2.5 px-4 font-medium text-[#171A20]">PM Surya Ghar CFA</td>
                    <td className="py-2.5 px-4 text-[#5C5E62]">
                      {PM_SURYA_GHAR_SOURCE.title} ({PM_SURYA_GHAR_SOURCE.documentRef})
                    </td>
                    <td className="py-2.5 px-4 font-mono text-[#5C5E62]">
                      {PM_SURYA_GHAR_SOURCE.verifiedOn}
                    </td>
                    <td className="py-2.5 px-4">
                      <a
                        href={PM_SURYA_GHAR_SOURCE.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[#171A20] hover:underline"
                      >
                        <span>Portal</span>
                        <ExternalLink size={11} />
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-medium text-[#171A20]">Telangana Tariffs</td>
                    <td className="py-2.5 px-4 text-[#5C5E62]">
                      {TGERC_TARIFF_SOURCE.title} ({TGERC_TARIFF_SOURCE.documentRef})
                    </td>
                    <td className="py-2.5 px-4 font-mono text-[#5C5E62]">
                      {TGERC_TARIFF_SOURCE.verifiedOn}
                    </td>
                    <td className="py-2.5 px-4">
                      <a
                        href={TGERC_TARIFF_SOURCE.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[#171A20] hover:underline"
                      >
                        <span>Tariff Order</span>
                        <ExternalLink size={11} />
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-medium text-[#171A20]">
                      Telangana Net-Metering (2025)
                    </td>
                    <td className="py-2.5 px-4 text-[#5C5E62]">
                      {TGERC_RTS_REGULATION_2025_SOURCE.title} (
                      {TGERC_RTS_REGULATION_2025_SOURCE.documentRef})
                    </td>
                    <td className="py-2.5 px-4 font-mono text-[#5C5E62]">
                      {TGERC_RTS_REGULATION_2025_SOURCE.verifiedOn}
                    </td>
                    <td className="py-2.5 px-4">
                      <a
                        href={TGERC_RTS_REGULATION_2025_SOURCE.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[#171A20] hover:underline"
                      >
                        <span>Regulation PDF</span>
                        <ExternalLink size={11} />
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-medium text-[#171A20]">
                      Andhra Pradesh Tariffs
                    </td>
                    <td className="py-2.5 px-4 text-[#5C5E62]">
                      {APERC_TARIFF_SOURCE.title} ({APERC_TARIFF_SOURCE.documentRef})
                    </td>
                    <td className="py-2.5 px-4 font-mono text-[#5C5E62]">
                      {APERC_TARIFF_SOURCE.verifiedOn}
                    </td>
                    <td className="py-2.5 px-4">
                      <a
                        href={APERC_TARIFF_SOURCE.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[#171A20] hover:underline"
                      >
                        <span>APERC Order</span>
                        <ExternalLink size={11} />
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-medium text-[#171A20]">
                      Andhra Pradesh Net-Metering
                    </td>
                    <td className="py-2.5 px-4 text-[#5C5E62]">
                      {APERC_RTS_REGULATION_2023_SOURCE.title} (
                      {APERC_RTS_REGULATION_2023_SOURCE.documentRef})
                    </td>
                    <td className="py-2.5 px-4 font-mono text-[#5C5E62]">
                      {APERC_RTS_REGULATION_2023_SOURCE.verifiedOn}
                    </td>
                    <td className="py-2.5 px-4">
                      <a
                        href={APERC_RTS_REGULATION_2023_SOURCE.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[#171A20] hover:underline"
                      >
                        <span>APERC Reg</span>
                        <ExternalLink size={11} />
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-medium text-[#171A20]">
                      Solar Yield &amp; Insolation
                    </td>
                    <td className="py-2.5 px-4 text-[#5C5E62]">{HYDERABAD_YIELD_SOURCE.title}</td>
                    <td className="py-2.5 px-4 font-mono text-[#5C5E62]">
                      {HYDERABAD_YIELD_SOURCE.verifiedOn}
                    </td>
                    <td className="py-2.5 px-4">
                      <a
                        href={HYDERABAD_YIELD_SOURCE.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[#171A20] hover:underline"
                      >
                        <span>NASA POWER</span>
                        <ExternalLink size={11} />
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-medium text-[#171A20]">
                      Wind Load Engineering
                    </td>
                    <td className="py-2.5 px-4 text-[#5C5E62]">
                      {IS_875_WIND_SOURCE.title} ({IS_875_WIND_SOURCE.documentRef})
                    </td>
                    <td className="py-2.5 px-4 font-mono text-[#5C5E62]">
                      {IS_875_WIND_SOURCE.verifiedOn}
                    </td>
                    <td className="py-2.5 px-4">
                      <a
                        href={IS_875_WIND_SOURCE.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[#171A20] hover:underline"
                      >
                        <span>BIS Portal</span>
                        <ExternalLink size={11} />
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-medium text-[#171A20]">
                      Commercial Depreciation
                    </td>
                    <td className="py-2.5 px-4 text-[#5C5E62]">
                      {INCOME_TAX_SECTION_33_SOURCE.title}
                    </td>
                    <td className="py-2.5 px-4 font-mono text-[#5C5E62]">
                      {INCOME_TAX_SECTION_33_SOURCE.verifiedOn}
                    </td>
                    <td className="py-2.5 px-4">
                      <a
                        href={INCOME_TAX_SECTION_33_SOURCE.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[#171A20] hover:underline"
                      >
                        <span>Income Tax</span>
                        <ExternalLink size={11} />
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-medium text-[#171A20]">Solar Financing</td>
                    <td className="py-2.5 px-4 text-[#5C5E62]">
                      {SBI_SOLAR_LOAN_SOURCE.title} ({SBI_SOLAR_LOAN_SOURCE.documentRef})
                    </td>
                    <td className="py-2.5 px-4 font-mono text-[#5C5E62]">
                      {SBI_SOLAR_LOAN_SOURCE.verifiedOn}
                    </td>
                    <td className="py-2.5 px-4">
                      <a
                        href={SBI_SOLAR_LOAN_SOURCE.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[#171A20] hover:underline"
                      >
                        <span>SBI Portal</span>
                        <ExternalLink size={11} />
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-medium text-[#171A20]">
                      Connection Feasibility
                    </td>
                    <td className="py-2.5 px-4 text-[#5C5E62]">
                      {MOP_ROOFTOP_RULES_SOURCE.title} ({MOP_ROOFTOP_RULES_SOURCE.documentRef})
                    </td>
                    <td className="py-2.5 px-4 font-mono text-[#5C5E62]">
                      {MOP_ROOFTOP_RULES_SOURCE.verifiedOn}
                    </td>
                    <td className="py-2.5 px-4">
                      <a
                        href={MOP_ROOFTOP_RULES_SOURCE.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[#171A20] hover:underline"
                      >
                        <span>Gazette</span>
                        <ExternalLink size={11} />
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-medium text-[#171A20]">
                      Module Linear Degradation
                    </td>
                    <td className="py-2.5 px-4 text-[#5C5E62]">
                      {MODULE_WARRANTY_SOURCE.title} ({MODULE_WARRANTY_SOURCE.documentRef})
                    </td>
                    <td className="py-2.5 px-4 font-mono text-[#5C5E62]">
                      {MODULE_WARRANTY_SOURCE.verifiedOn}
                    </td>
                    <td className="py-2.5 px-4">
                      <a
                        href={MODULE_WARRANTY_SOURCE.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[#171A20] hover:underline"
                      >
                        <span>Datasheet</span>
                        <ExternalLink size={11} />
                      </a>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
