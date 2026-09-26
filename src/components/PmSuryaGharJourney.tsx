import * as React from "react";
import {
  FileText,
  CheckCircle2,
  ExternalLink,
  AlertCircle,
  HelpCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  Building2,
  UploadCloud,
  Banknote,
  Compass,
} from "lucide-react";
import { SourcePopover } from "@/components/SourcePopover";

export interface PmSuryaGharJourneyProps {
  className?: string;
}

const OFFICIAL_STEPS = [
  {
    stepNumber: "01",
    title: "National Portal Registration",
    subtitle: "Consumer Profile & Service Verification",
    actor: "Consumer / WAVENOX Liaison",
    description:
      "Register on the National Portal (pmsuryaghar.gov.in) by selecting your State, DISCOM (e.g. TGSPDCL), entering your Consumer Account Number, linked mobile number, and active email address.",
    requirements: [
      "Electricity Bill Consumer Number (USC)",
      "Linked Mobile Number with OTP verification",
    ],
  },
  {
    stepNumber: "02",
    title: "Technical Feasibility Approval (TFA)",
    subtitle: "Distribution Transformer Feeder Clearance",
    actor: "State DISCOM (TGSPDCL / APEPDCL)",
    description:
      "The local DISCOM divisional office evaluates feeder capacity on your distribution transformer (DT). Under Ministry of Power 2024 Rules, residential installations up to 10 kW are granted simplified technical feasibility without separate load studies.",
    requirements: [
      "Active electricity connection in good standing",
      "Sanctioned connected load review",
    ],
  },
  {
    stepNumber: "03",
    title: "Turnkey System Installation",
    subtitle: "ALMM & DCR Compliant Solar Array",
    actor: "Empanelled Solar Contractor",
    description:
      "Installation of Domestic Content Requirement (DCR) compliant N-type TOPCon solar modules from the Approved List of Models and Manufacturers (ALMM List-I), grid-tied inverter, and surge protection devices.",
    requirements: [
      "DCR module serial numbers",
      "ALMM List-I compliance certificates",
      "IS 875 wind-load certified mounting structure",
    ],
  },
  {
    stepNumber: "04",
    title: "Work Completion & Joint Inspection",
    subtitle: "Bi-Directional Net-Meter Synchronization",
    actor: "DISCOM Junior Engineer & Contractor",
    description:
      "The empanelled vendor uploads the Work Completion Report and installation photographs to the National Portal. A DISCOM junior engineer conducts physical site verification and installs the tested bi-directional net-meter.",
    requirements: [
      "Work Completion Report (WCR)",
      "Site geo-tagged photographs",
      "Bi-directional net-meter test report",
    ],
  },
  {
    stepNumber: "05",
    title: "Direct Benefit Transfer (DBT)",
    subtitle: "Central Financial Assistance (CFA) Release",
    actor: "MNRE / National Portal",
    description:
      "Once the DISCOM commissioning certificate is approved on the portal, MNRE directly transfers the Central Financial Assistance (up to ₹78,000) into the consumer's Aadhaar-linked bank account within statutory processing windows.",
    requirements: [
      "Aadhaar-seeded bank account",
      "Cancelled cheque / bank passbook copy with IFSC",
    ],
  },
];

const DOCUMENT_CHECKLIST = [
  {
    title: "Recent Electricity Bill",
    format: "PDF or clear photo",
    detail:
      "Must be from the last 2 billing cycles showing consumer name, USC number, sanctioned load, and residential tariff category (LT-I).",
    critical: true,
  },
  {
    title: "Aadhaar Card of Electricity Bill Holder",
    format: "Clear color scan",
    detail:
      "Name on Aadhaar should match the electricity bill. If property ownership transferred recently, bill name update with DISCOM is required first.",
    critical: true,
  },
  {
    title: "Cancelled Cheque / Bank Passbook",
    format: "Original scan",
    detail:
      "Bank account must be in the applicant's name with visible IFSC code and account number, and linked to Aadhaar for DBT receipt.",
    critical: true,
  },
  {
    title: "Terrace / Rooftop Ownership Proof",
    format: "Municipal tax receipt or title deed",
    detail:
      "Latest Municipal Corporation Property Tax receipt (e.g. GHMC/GHMC assessment) proving terrace access rights.",
    critical: true,
  },
  {
    title: "Site Geo-tagged Photographs",
    format: "JPEG with GPS metadata",
    detail:
      "Pre-installation terrace clear shot and post-installation array showing panels, inverter, and earthing pits.",
    critical: false,
  },
];

const SUBSIDY_BRACKETS = [
  { capacity: "1 kW", cfaInr: 33000, description: "Flat ₹33,000 CFA for 1st kW" },
  { capacity: "2 kW", cfaInr: 66000, description: "₹33,000 for 1st kW + ₹33,000 for 2nd kW" },
  { capacity: "3 kW", cfaInr: 78000, description: "₹66,000 (first 2 kW) + ₹12,000 (3rd kW)" },
  {
    capacity: "Above 3 kW (up to 10 kW)",
    cfaInr: 78000,
    description: "Capped at maximum ₹78,000 for residential systems",
  },
];

export function PmSuryaGharJourney({ className = "" }: PmSuryaGharJourneyProps) {
  const [activeTab, setActiveTab] = React.useState<"steps" | "docs" | "brackets">("steps");
  const [checkedDocs, setCheckedDocs] = React.useState<Record<number, boolean>>({});

  const toggleDoc = (index: number) => {
    setCheckedDocs((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <div
      className={`rounded-[8px] border border-[#E3E4E6] bg-[#FFFFFF] overflow-hidden ${className}`}
    >
      {/* Header Banner */}
      <div className="p-6 sm:p-8 bg-[#171A20] text-[#FFFFFF] space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-[4px] bg-[#FFFFFF]/10 text-[12px] font-medium text-[#FFFFFF]">
            <Building2 className="w-3.5 h-3.5 text-[#F57C00]" />
            <span>Official National Framework · MNRE</span>
          </div>
          <SourcePopover sourceId="pmSuryaGharSubsidy" label="Subsidy Rules · Aug 2026" />
        </div>

        <h3 className="text-[22px] sm:text-[26px] font-medium tracking-tight text-[#FFFFFF]">
          PM Surya Ghar: Muft Bijli Yojana Official Journey
        </h3>

        <p className="text-[13px] sm:text-[14px] text-[#FFFFFF]/70 max-w-3xl leading-relaxed">
          The national rooftop solar scheme enables eligible Indian residential households to claim
          up to ₹78,000 in Central Financial Assistance. WAVENOX prepares and submits all technical
          application paperwork, while approvals and payouts are executed strictly through the
          official National Portal.
        </p>

        {/* Honest Timeline Notice */}
        <div className="p-3.5 rounded-[6px] bg-[#FFFFFF]/5 border border-[#FFFFFF]/15 flex items-start gap-3 mt-4 text-[12px] text-[#FFFFFF]/80 leading-relaxed">
          <Clock className="w-4 h-4 text-[#F57C00] shrink-0 mt-0.5" />
          <div>
            <strong className="text-[#FFFFFF]">Statutory Timeline Notice: </strong>
            We do not promise artificial 48-hour turnarounds or instant net-metering. Feasibility
            approval and meter commissioning timelines depend strictly on your local DISCOM division
            engineer workload and bi-directional meter inventory. Under Ministry of Power 2024
            guidelines, standard processing target is 15 to 30 days.
          </div>
        </div>
      </div>

      {/* Tabs Selector */}
      <div className="border-b border-[#E3E4E6] bg-[#F4F4F4] px-6 sm:px-8 flex gap-2">
        {[
          { id: "steps", label: "5-Step Official Workflow", icon: Compass },
          { id: "docs", label: "Document Checklist", icon: FileText },
          { id: "brackets", label: "Subsidy Matrix (₹78k)", icon: Banknote },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`py-3.5 px-4 text-[13px] font-medium flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
                isActive
                  ? "border-[#171A20] text-[#171A20] bg-[#FFFFFF]"
                  : "border-transparent text-[#5C5E62] hover:text-[#171A20]"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: 5-Step Official Workflow */}
      {activeTab === "steps" && (
        <div className="p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 gap-4">
            {OFFICIAL_STEPS.map((step) => (
              <div
                key={step.stepNumber}
                className="p-5 rounded-[6px] border border-[#E3E4E6] bg-[#FFFFFF] hover:border-[#171A20]/40 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex items-start gap-3.5">
                    <span className="w-8 h-8 rounded-[4px] bg-[#171A20] text-[#FFFFFF] font-mono text-[13px] font-bold flex items-center justify-center shrink-0">
                      {step.stepNumber}
                    </span>
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-baseline gap-2">
                        <h4 className="text-[15px] font-semibold text-[#171A20]">{step.title}</h4>
                        <span className="text-[12px] text-[#5C5E62]">· {step.subtitle}</span>
                      </div>
                      <p className="text-[13px] text-[#5C5E62] leading-relaxed pt-1">
                        {step.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-1.5 pt-2">
                        <span className="text-[12px] font-medium text-[#171A20] uppercase tracking-wider">
                          Key Validation:
                        </span>
                        {step.requirements.map((req, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[3px] bg-[#F4F4F4] text-[#5C5E62] text-[12px]"
                          >
                            <CheckCircle2 className="w-3 h-3 text-[#16A34A]" />
                            {req}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="text-[12px] font-medium text-[#5C5E62] bg-[#F4F4F4] px-2.5 py-1 rounded-[4px] self-start shrink-0">
                    Lead: {step.actor}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Official Portal CTA */}
          <div className="p-4 rounded-[6px] bg-[#F4F4F4] border border-[#E3E4E6] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-[13px] text-[#5C5E62]">
              Direct National Portal access for registration and status tracking:
            </div>
            <a
              href="https://pmsuryaghar.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[4px] bg-[#171A20] text-[#FFFFFF] text-[13px] font-medium hover:bg-[#2C3038] transition-colors shrink-0"
            >
              <span>Open pmsuryaghar.gov.in</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      )}

      {/* Tab 2: Document Checklist */}
      {activeTab === "docs" && (
        <div className="p-6 sm:p-8 space-y-6">
          <div>
            <h4 className="text-[16px] font-semibold text-[#171A20]">
              Statutory Checklist for National Portal Upload
            </h4>
            <p className="text-[13px] text-[#5C5E62] mt-1">
              Have these documents ready before submitting your application. Click to mark off items
              as you gather them.
            </p>
          </div>

          <div className="space-y-3">
            {DOCUMENT_CHECKLIST.map((doc, idx) => {
              const isChecked = !!checkedDocs[idx];
              return (
                <div
                  key={idx}
                  onClick={() => toggleDoc(idx)}
                  className={`p-4 rounded-[6px] border cursor-pointer transition-all flex items-start gap-3.5 ${
                    isChecked
                      ? "border-[#16A34A] bg-[#F0FDF4]"
                      : "border-[#E3E4E6] bg-[#FFFFFF] hover:border-[#171A20]/40"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleDoc(idx)}
                    className="mt-1 h-4 w-4 rounded border-[#E3E4E6] text-[#171A20] focus:ring-0 cursor-pointer"
                    aria-label={doc.title}
                  />
                  <div className="flex-1 space-y-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span
                        className={`text-[14px] font-medium ${isChecked ? "text-[#166534] line-through" : "text-[#171A20]"}`}
                      >
                        {doc.title}
                      </span>
                      <span className="text-[12px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-[3px] bg-[#F4F4F4] text-[#5C5E62]">
                        {doc.format}
                      </span>
                    </div>
                    <p
                      className={`text-[12px] leading-relaxed ${isChecked ? "text-[#15803D]" : "text-[#5C5E62]"}`}
                    >
                      {doc.detail}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-[12px] text-[#5C5E62] bg-[#F4F4F4] p-3.5 rounded-[4px] leading-relaxed">
            * <strong>DPDP Compliance Note:</strong> When WAVENOX assists with document preparation,
            files are processed solely for DISCOM technical upload and are never shared with
            marketing aggregators or commercial lead brokers.
          </div>
        </div>
      )}

      {/* Tab 3: Subsidy Matrix */}
      {activeTab === "brackets" && (
        <div className="p-6 sm:p-8 space-y-6">
          <div>
            <h4 className="text-[16px] font-semibold text-[#171A20]">
              PM Surya Ghar Central Financial Assistance Schedule
            </h4>
            <p className="text-[13px] text-[#5C5E62] mt-1">
              Subsidy is calculated progressively based on installed capacity up to the national
              statutory cap of ₹78,000.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px] border border-[#E3E4E6] rounded-[6px] overflow-hidden">
              <thead className="bg-[#F4F4F4] text-[#171A20] font-semibold">
                <tr>
                  <th className="p-3.5 border-b border-[#E3E4E6]">Installed Capacity</th>
                  <th className="p-3.5 border-b border-[#E3E4E6]">National Subsidy (CFA)</th>
                  <th className="p-3.5 border-b border-[#E3E4E6]">Calculation Formula</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E3E4E6]">
                {SUBSIDY_BRACKETS.map((b, i) => (
                  <tr key={i} className="hover:bg-[#F9FAFB]">
                    <td className="p-3.5 font-medium text-[#171A20]">{b.capacity}</td>
                    <td className="p-3.5 font-semibold text-[#16A34A] tabular-nums">
                      ₹{b.cfaInr.toLocaleString("en-IN")}
                    </td>
                    <td className="p-3.5 text-[#5C5E62]">{b.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 rounded-[6px] bg-[#F4F4F4] border border-[#E3E4E6] text-[12px] text-[#5C5E62] space-y-2 leading-relaxed">
            <p>
              <strong>Special Category States / UTs:</strong> Higher CFA scales apply to Himachal
              Pradesh, Uttarakhand, Jammu &amp; Kashmir, Ladakh, and North-Eastern States (₹33,000
              for 1st kW, ₹66,000 for 2nd kW, ₹78,000 for ≥3 kW plus relevant state top-ups).
            </p>
            <p>
              <strong>Residential Housing Societies (GHS/RWA):</strong> Subsidy of ₹18,000 per kW is
              available for common facilities (e.g. lifts, water pumping) up to a maximum aggregate
              capacity of 500 kW.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
