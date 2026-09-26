import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldCheck, Mail, Phone, MapPin, ArrowLeft } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BRAND_CONFIG } from "@/config/brand";

export const Route = createFileRoute("/legal/privacy")({
  head: () => ({
    meta: [
      { title: `Privacy Policy & DPDP Act Compliance — ${BRAND_CONFIG.name}` },
      {
        name: "description",
        content: `Privacy Policy and data governance standards under India's Digital Personal Data Protection Act, 2023 (DPDP Act) for ${BRAND_CONFIG.legalName}.`,
      },
      { property: "og:title", content: `Privacy Policy — ${BRAND_CONFIG.name}` },
      {
        property: "og:description",
        content: `Privacy Policy and data governance standards under India's Digital Personal Data Protection Act, 2023 (DPDP Act) for ${BRAND_CONFIG.legalName}.`,
      },
      { property: "og:image", content: `${BRAND_CONFIG.domain}/media/home-hero-1600w.jpg` },
      { property: "og:url", content: `${BRAND_CONFIG.domain}/legal/privacy` },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: `${BRAND_CONFIG.domain}/legal/privacy` }],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
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
            Data Governance & Legal Compliance
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#171A20] mt-2">
            Privacy Policy & Data Protection
          </h1>
          <p className="text-xs text-[#5C5E62] mt-2">
            Effective Date: September 24, 2026 | Compliant with India's Digital Personal Data
            Protection Act, 2023 (DPDP Act)
          </p>
        </div>

        <div className="space-y-10 text-sm leading-relaxed text-[#393C41]">
          {/* Statutory Notice */}
          <div className="p-5 rounded-2xl bg-[#F8F8FA] border border-[#E2E8F0]">
            <div className="flex items-start gap-3">
              <ShieldCheck className="h-5 w-5 text-[#171A20] shrink-0 mt-0.5" />
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#171A20]">
                  DPDP Act 2023 Statutory Notice
                </h2>
                <p className="text-xs text-[#5C5E62] mt-1 leading-relaxed">
                  {BRAND_CONFIG.legalName} (&quot;{BRAND_CONFIG.name}&quot;, &quot;we&quot;,
                  &quot;us&quot;) operates as a Data Fiduciary under the Digital Personal Data
                  Protection Act, 2023. We collect and process personal data exclusively for
                  specified, legitimate purposes associated with assessing solar feasibility,
                  engineering design, regulatory net-metering approvals, and MNRE subsidy
                  processing.
                </p>
              </div>
            </div>
          </div>

          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#171A20] border-b border-[#E2E8F0] pb-2">
              1. What Personal Data We Collect
            </h2>
            <p>
              To design, engineer, and legally commission rooftop solar power plants and energy
              storage systems, we collect the following categories of data directly from you or
              through site surveys:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-[#5C5E62]">
              <li>
                <strong className="text-[#171A20]">Identity & Contact Data:</strong> Full legal
                name, mobile phone number, WhatsApp contact handle, and email address.
              </li>
              <li>
                <strong className="text-[#171A20]">Site & Geolocation Data:</strong> Property
                address, city, state, postal PIN code, geospatial rooftop coordinates, roof
                photographs, shadow profiles, and structural drawings.
              </li>
              <li>
                <strong className="text-[#171A20]">Utility & DISCOM Data:</strong> State electricity
                distribution company (DISCOM) consumer/service number, electricity bills (past 12
                months consumption history), sanction load, and phase configuration (single-phase
                vs. three-phase).
              </li>
              <li>
                <strong className="text-[#171A20]">Subsidy & KYC Information:</strong> Bank account
                details (cancelled cheque / IFSC) and Aadhaar card (masked as per UIDAI norms)
                required exclusively for direct benefit transfer (DBT) under the PM Surya Ghar: Muft
                Bijli Yojana national portal.
              </li>
              <li>
                <strong className="text-[#171A20]">Digital Telemetry:</strong> Anonymized referrer
                URLs, UTM campaign identifiers, device viewport, and submission timestamps to
                safeguard our infrastructure against fraudulent bot traffic.
              </li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#171A20] border-b border-[#E2E8F0] pb-2">
              2. How Your Data Is Used
            </h2>
            <p>Your data is processed strictly for the following lawful and necessary purposes:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-[#5C5E62]">
              <li>
                Conducting 3D computer-aided solar shading analysis and generating custom generation
                dossiers.
              </li>
              <li>
                Preparing accurate financial estimates, payback projections, and equipment sizing
                recommendations.
              </li>
              <li>
                Liaising with your state DISCOM for technical feasibility assessment, load
                sanctioning, and bidirectional net-meter installation.
              </li>
              <li>
                Filing documentation on the National Portal for PM Surya Ghar to claim applicable
                Central Financial Assistance (subsidy).
              </li>
              <li>
                Coordinating on-site physical structural audits, delivery logistics, and certified
                engineering installation.
              </li>
              <li>
                Communicating system status, commissioning documentation, and post-installation
                warranty operations.
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#171A20] border-b border-[#E2E8F0] pb-2">
              3. Data Sharing & Third-Party Disclosure
            </h2>
            <p>
              We do <strong className="text-[#171A20]">not</strong> sell, rent, or trade your
              personal data to marketing aggregators. Data is shared exclusively with authorized
              entities essential for commissioning your solar asset:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-[#5C5E62]">
              <li>
                <strong className="text-[#171A20]">
                  Statutory Electricity Regulators & DISCOMs:
                </strong>{" "}
                Transmission and distribution companies (e.g., TGSPDCL, TGNPDCL, BESCOM, MSEDCL,
                APEPDCL) for statutory net-metering approvals and interconnection agreements.
              </li>
              <li>
                <strong className="text-[#171A20]">
                  Ministry of New and Renewable Energy (MNRE):
                </strong>{" "}
                Uploading documentation to the National Portal for PM Surya Ghar for direct subsidy
                disbursement to your bank account.
              </li>
              <li>
                <strong className="text-[#171A20]">
                  Certified Installation Engineering Partners:
                </strong>{" "}
                Licensed electrical contractors and structural engineers executing physical mounting
                and wiring under strict non-disclosure obligations.
              </li>
              <li>
                <strong className="text-[#171A20]">Green Financing Partners:</strong> Scheduled
                commercial banks or NBFCs if you explicitly request solar loan assistance or
                zero-down financing options.
              </li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#171A20] border-b border-[#E2E8F0] pb-2">
              4. Data Retention Policy
            </h2>
            <p>
              Because solar power installations carry 25-year performance warranties and statutory
              DISCOM agreements, project-related technical dossiers, warranty serial numbers, and
              regulatory permits are retained for the operating lifecycle of the solar asset (up to
              25 years). Inquiries that do not proceed to execution are retained for 24 months to
              address subsequent inquiries, after which they are securely purged.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#171A20] border-b border-[#E2E8F0] pb-2">
              5. Your Rights as a Data Principal
            </h2>
            <p>
              Under the DPDP Act 2023, you hold the following explicit rights regarding your
              personal information:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-[#5C5E62]">
              <li>
                <strong className="text-[#171A20]">Right to Access & Summary:</strong> Request a
                copy of the personal data held in our systems.
              </li>
              <li>
                <strong className="text-[#171A20]">Right to Correction & Updating:</strong> Correct
                inaccurate, outdated, or incomplete details.
              </li>
              <li>
                <strong className="text-[#171A20]">Right to Erasure:</strong> Request deletion of
                your personal data where statutory regulatory retention mandates are satisfied.
              </li>
              <li>
                <strong className="text-[#171A20]">Right to Withdraw Consent:</strong> You may
                revoke consent for non-statutory communications at any time by contacting our
                Grievance Officer.
              </li>
            </ul>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#171A20] border-b border-[#E2E8F0] pb-2">
              6. Grievance Officer & Data Protection Contact
            </h2>
            <p>
              In accordance with the Digital Personal Data Protection Act, 2023 and Information
              Technology Rules, the details of our designated Data Grievance Redressal Officer are:
            </p>
            <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] space-y-2 text-xs">
              <div className="font-semibold text-[#171A20]">
                Designated Grievance & Compliance Officer
              </div>
              <div>{BRAND_CONFIG.legalName}</div>
              <div className="flex items-center gap-2 text-[#5C5E62]">
                <MapPin size={13} className="shrink-0 text-[#171A20]" />
                <span>{BRAND_CONFIG.contact.address}</span>
              </div>
              <div className="flex items-center gap-2 text-[#5C5E62]">
                <Mail size={13} className="shrink-0 text-[#171A20]" />
                <a href={BRAND_CONFIG.contact.emailHref} className="hover:text-[#171A20] underline">
                  {BRAND_CONFIG.contact.email}
                </a>
              </div>
              <div className="flex items-center gap-2 text-[#5C5E62]">
                <Phone size={13} className="shrink-0 text-[#171A20]" />
                <a
                  href={BRAND_CONFIG.contact.phone.href}
                  className="hover:text-[#171A20] underline"
                >
                  {BRAND_CONFIG.contact.phone.display}
                </a>
              </div>
              <div className="text-[12px] text-[#5C5E62] pt-1">
                Grievances are acknowledged within 24 hours and redressed within 15 working days.
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
