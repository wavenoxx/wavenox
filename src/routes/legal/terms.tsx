import { createFileRoute, Link } from "@tanstack/react-router";
import { FileText, ArrowLeft, AlertCircle, CheckCircle2 } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BRAND_CONFIG } from "@/config/brand";
import { PRODUCTS_CONFIG } from "@/config/products";

export const Route = createFileRoute("/legal/terms")({
  head: () => ({
    meta: [
      { title: `Terms of Service & Quotation Conditions — ${BRAND_CONFIG.name}` },
      {
        name: "description",
        content: `Standard Terms of Service, engineering quotation policies, and warranty definitions for ${BRAND_CONFIG.legalName}.`,
      },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
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
            Commercial & Engineering Governance
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#171A20] mt-2">
            Terms of Service & Engineering Quotations
          </h1>
          <p className="text-xs text-[#5C5E62] mt-2">
            Last Updated: September 2026 | Governing Entity: {BRAND_CONFIG.legalName}
          </p>
        </div>

        <div className="space-y-10 text-sm leading-relaxed text-[#393C41]">
          {/* Important Notice */}
          <div className="p-5 rounded-2xl bg-[#F8F8FA] border border-[#E2E8F0]">
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-[#171A20] shrink-0 mt-0.5" />
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#171A20]">
                  Master Engineering Agreement
                </h2>
                <p className="text-xs text-[#5C5E62] mt-1 leading-relaxed">
                  These Terms govern all digital proposals, feasibility evaluations, engineering
                  surveys, equipment procurement, and turnkey engineering, procurement, and
                  construction (EPC) solar contracts executed by {BRAND_CONFIG.legalName}{" "}
                  (&quot;WAVENOX&quot;).
                </p>
              </div>
            </div>
          </div>

          {/* Section 1: Indicative Quotations */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#171A20] border-b border-[#E2E8F0] pb-2">
              1. Digital Proposals & Preliminary Quotations
            </h2>
            <p>
              All online calculations, design studio proposals, and automated estimates provided via
              this website are preliminary models based on standard regional solar irradiance data
              (1,450 kWh/kWp/year) and prevailing electricity distribution tariffs.
            </p>
            <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/80 text-xs text-amber-900 space-y-1">
              <div className="font-semibold flex items-center gap-1.5">
                <AlertCircle size={14} className="text-amber-700" />
                <span>Subject to Site Verification</span>
              </div>
              <p>
                A proposal becomes a binding fixed-price contract only after an authorized WAVENOX
                structural engineer completes an on-site physical survey, roof load-bearing
                assessment, shadow azimuth mapping, and state DISCOM technical feasibility review.
              </p>
            </div>
          </section>

          {/* Section 2: DISCOM Approvals & Net-Metering Timelines */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#171A20] border-b border-[#E2E8F0] pb-2">
              2. Grid Interconnection & Net-Metering Feasibility
            </h2>
            <p>
              Grid-tied solar systems require regulatory net-metering approval and bidirectional
              meter commissioning from your respective state electricity distribution company
              (DISCOM, e.g., TGSPDCL, TGNPDCL, BESCOM, MSEDCL, APEPDCL).
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-[#5C5E62]">
              <li>
                WAVENOX acts as the customer&apos;s authorized engineering liaison, preparing
                single-line diagrams (SLDs), submitting load enhancement applications, and
                scheduling inspectorate visits.
              </li>
              <li>
                Approval timelines, transformer capacity availability, and bidirectional meter
                installation schedules are determined entirely by the state DISCOM and local
                electrical inspectorate (CEIG/TSDISCOM guidelines). WAVENOX is not liable for
                regulatory delays outside its operational control.
              </li>
            </ul>
          </section>

          {/* Section 3: PM Surya Ghar Central Financial Assistance */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#171A20] border-b border-[#E2E8F0] pb-2">
              3. PM Surya Ghar: Muft Bijli Yojana Subsidies
            </h2>
            <p>
              Under the Government of India&apos;s PM Surya Ghar scheme, eligible residential
              individual households can receive Central Financial Assistance (CFA) up to ₹78,000 for
              installations up to 3 kW (or higher).
            </p>
            <ul className="list-disc pl-5 space-y-2 text-[#5C5E62]">
              <li>
                <strong className="text-[#171A20]">Direct Benefit Transfer (DBT):</strong> The
                subsidy is not deducted upfront from project equipment invoices. Instead, it is
                disbursed directly by the Ministry of New and Renewable Energy (MNRE) into the
                beneficiary&apos;s bank account post-commissioning.
              </li>
              <li>
                <strong className="text-[#171A20]">Vendor Role:</strong> WAVENOX assists clients by
                installing ALMM-compliant DCR modules, generating test reports, and submitting
                commissioning documentation to the national portal. Final approval and disbursement
                speed depend strictly on MNRE and DISCOM joint inspection.
              </li>
              <li>
                <strong className="text-[#171A20]">Commercial Ineligibility:</strong> Commercial,
                industrial, and institutional rooftop segments are strictly ineligible for PM Surya
                Ghar residential subsidies under central guidelines.
              </li>
            </ul>
          </section>

          {/* Section 4: Equipment Warranties & Workmanship */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#171A20] border-b border-[#E2E8F0] pb-2">
              4. Warranties: Manufacturer & Workmanship Guarantees
            </h2>
            <p>Every WAVENOX installation includes tiered multi-party warranty protection:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] space-y-1.5">
                <div className="flex items-center gap-2 font-semibold text-xs text-[#171A20]">
                  <CheckCircle2 size={16} className="text-emerald-600" />
                  <span>Solar Modules (25 Years)</span>
                </div>
                <p className="text-xs text-[#5C5E62]">
                  {PRODUCTS_CONFIG.module.performanceWarrantyYears}-year linear performance warranty
                  backed directly by Tier-1 OEM manufacturers, guaranteeing ≥80% output at Year 25.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] space-y-1.5">
                <div className="flex items-center gap-2 font-semibold text-xs text-[#171A20]">
                  <CheckCircle2 size={16} className="text-emerald-600" />
                  <span>Inverter & Battery (10 Years)</span>
                </div>
                <p className="text-xs text-[#5C5E62]">
                  {PRODUCTS_CONFIG.inverter.warrantyYears}-year hybrid inverter and{" "}
                  {PRODUCTS_CONFIG.battery.warrantyYears}-year LFP battery storage warranty covering
                  manufacturing defects and throughput degradation.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] space-y-1.5">
                <div className="flex items-center gap-2 font-semibold text-xs text-[#171A20]">
                  <CheckCircle2 size={16} className="text-emerald-600" />
                  <span>WAVENOX Workmanship (5 Years)</span>
                </div>
                <p className="text-xs text-[#5C5E62]">
                  Comprehensive engineering coverage against roof penetrations, anodized aluminum
                  structural clamp failures, and AC/DC cable conduits.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] space-y-1.5">
                <div className="flex items-center gap-2 font-semibold text-xs text-[#171A20]">
                  <CheckCircle2 size={16} className="text-emerald-600" />
                  <span>Annual Health Audits</span>
                </div>
                <p className="text-xs text-[#5C5E62]">
                  Proactive thermographic string scans, torque checks, and digital generation
                  telemetry audits during the warranty period.
                </p>
              </div>
            </div>
          </section>

          {/* Section 5: Force Majeure */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#171A20] border-b border-[#E2E8F0] pb-2">
              5. Force Majeure & Limitation of Liability
            </h2>
            <p>
              WAVENOX shall not be liable for generation shortfalls, commissioning delays, or
              performance deviations resulting from events beyond reasonable control, including but
              not limited to: severe monsoon storms, seismic activity, grid load
              shedding/curtailment by transmission utilities, unapproved tree shading or adjacent
              high-rise construction, or changes in state ERC tariff structures.
            </p>
          </section>

          {/* Section 6: Jurisdiction */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#171A20] border-b border-[#E2E8F0] pb-2">
              6. Governing Law & Dispute Resolution
            </h2>
            <p>
              These Terms, all quotations, and subsequent engineering EPC contracts shall be
              governed by and construed in accordance with the laws of India. Any legal dispute,
              arbitration, or proceeding arising under or in connection with WAVENOX products and
              services shall be subject to the exclusive jurisdiction of the competent courts in{" "}
              <strong className="text-[#171A20]">Hyderabad, Telangana, India</strong>.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
