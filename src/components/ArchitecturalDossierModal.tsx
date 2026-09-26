import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Printer, Share2, ShieldCheck, Download, CheckCircle2 } from "lucide-react";
import { BRAND_CONFIG } from "@/config/brand";

export interface DossierData {
  refCode: string;
  clientName?: string;
  phone?: string;
  address?: string;
  pinCode?: string;
  discomName?: string;
  systemKw: number;
  panelCount: number;
  batteryUnits: number;
  batteryKwh: number;
  monthlyBill: number;
  grossCapex: number;
  subsidyInr: number;
  netPayable: number;
  monthlyEmi: number;
  paybackYears: number;
  annualSavings: number;
  twentyFiveYearSavings: number;
  dateStr?: string;
}

interface ArchitecturalDossierModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: DossierData;
}

function formatInr(val: number): string {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(val);
}

export function ArchitecturalDossierModal({
  isOpen,
  onClose,
  data,
}: ArchitecturalDossierModalProps) {
  const currentDate =
    data.dateStr ||
    new Date().toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  const handlePrint = () => {
    window.print();
  };

  const whatsappText = `Hello WAVENOX Engineering Team, I am reviewing my Architectural Solar Feasibility Dossier (${data.refCode}) for a ${data.systemKw} kW system in ${data.address || "my city"} (PIN: ${data.pinCode || "verified"}). I would like to schedule the on-site physical laser survey.`;
  const whatsappUrl = `${BRAND_CONFIG.contact.whatsappLink}?text=${encodeURIComponent(whatsappText)}`;

  // Financial 25-Year Matrix calculation
  const matrixYears = [1, 5, 10, 15, 20, 25];
  const compoundMatrix = matrixYears.map((yr) => {
    // 3% tariff inflation, 0.4% degradation
    let totalSaved = 0;
    for (let y = 1; y <= yr; y++) {
      const tariffMultiplier = Math.pow(1.03, y - 1);
      const degradationMultiplier = 1 - (y - 1) * 0.004;
      totalSaved += data.annualSavings * tariffMultiplier * degradationMultiplier;
    }
    const netCashflow = totalSaved - data.netPayable;
    return {
      year: yr,
      cumulativeSavings: Math.round(totalSaved),
      netRetainedWealth: Math.round(netCashflow),
    };
  });

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        {/* Backdrop for Screen view */}
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 no-print" />

        <Dialog.Content className="fixed inset-2 sm:inset-6 md:inset-10 z-50 overflow-y-auto bg-[#FBFBFC] rounded-lg shadow-2xl focus:outline-none flex flex-col no-print-dialog">
          {/* Action Header bar (Hidden in Print) */}
          <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 bg-[#FFFFFF] border-b border-[#E3E4E6] shadow-xs no-print">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-[#171A20]" />
              <span className="text-[13px] font-semibold tracking-wider uppercase text-[#171A20]">
                {BRAND_CONFIG.name} Atelier · Architectural Feasibility Dossier
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] uppercase font-bold tracking-widest bg-[#F4F4F4] text-[#5C5E62] rounded">
                Ref: {data.refCode}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[4px] bg-[#171A20] text-[#FFFFFF] text-[13px] font-medium hover:bg-[#2C3038] transition-colors cursor-pointer"
                title="Print or Save as Vector PDF"
              >
                <Printer className="w-4 h-4" />
                <span>Print / Save PDF</span>
              </button>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] border border-[#E3E4E6] text-[#171A20] bg-[#FFFFFF] text-[13px] font-medium hover:bg-[#F4F4F4] transition-colors"
                title="Share with Advisory on WhatsApp"
              >
                <Share2 className="w-4 h-4 text-[#F57C00]" />
                <span>Escalate via WhatsApp</span>
              </a>

              <Dialog.Close asChild>
                <button
                  type="button"
                  className="p-1.5 rounded-[4px] text-[#5C5E62] hover:text-[#171A20] hover:bg-[#F4F4F4] transition-colors"
                  aria-label="Close Dossier"
                >
                  <X className="w-5 h-5" />
                </button>
              </Dialog.Close>
            </div>
          </div>

          {/* Dossier Document Container (Visible in Screen & Print) */}
          <div className="flex-1 p-4 sm:p-10 md:p-16 max-w-4xl mx-auto w-full text-[#171A20] print:p-0 print:m-0 print:max-w-none">
            <div className="bg-[#FFFFFF] p-8 sm:p-12 border border-[#E3E4E6] rounded-[4px] shadow-sm print:border-none print:shadow-none print:p-0">
              {/* Document Master Header */}
              <div className="border-b-2 border-[#171A20] pb-6 mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <div className="text-[24px] font-bold tracking-[0.18em] text-[#171A20] uppercase font-mono">
                    {BRAND_CONFIG.name}
                  </div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#5C5E62] mt-0.5">
                    Architectural Clean Energy Atelier &amp; Engineering Lab
                  </div>
                  <div className="text-[10px] text-[#5C5E62] mt-1 font-mono">
                    Financial District, Hyderabad · Telangana &amp; Pan-India Operations
                  </div>
                </div>

                <div className="text-left sm:text-right font-mono text-[11px] space-y-1">
                  <div className="text-[#171A20] font-bold tracking-wider">
                    DOCUMENT ID: {data.refCode}
                  </div>
                  <div className="text-[#5C5E62]">DATE OF ISSUE: {currentDate}</div>
                  <div className="text-[#F57C00] font-semibold">
                    CLASSIFICATION: BESPOKE ENGINEERING PROPOSAL
                  </div>
                </div>
              </div>

              {/* Client & Site Demographics Grid */}
              <div className="mb-8 p-4 bg-[#F8F9FA] rounded-[4px] border border-[#E9ECEF] grid grid-cols-1 sm:grid-cols-3 gap-4 text-[12px]">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#5C5E62]">
                    Client / Estate Name
                  </div>
                  <div className="font-semibold text-[#171A20] mt-0.5">
                    {data.clientName || "Valued Estate Owner"}
                  </div>
                  {data.phone && (
                    <div className="text-[#5C5E62] text-[11px] font-mono mt-0.5">
                      Tel: {data.phone}
                    </div>
                  )}
                </div>

                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#5C5E62]">
                    Terrace Location &amp; Jurisdiction
                  </div>
                  <div className="font-semibold text-[#171A20] mt-0.5">
                    {data.address || "Terrace Feasibility Assessment"}
                  </div>
                  <div className="text-[#5C5E62] text-[11px] font-mono mt-0.5">
                    PIN: {data.pinCode || "Verified Local Hub"}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#5C5E62]">
                    Designated Grid Utility (DISCOM)
                  </div>
                  <div className="font-semibold text-[#171A20] mt-0.5">
                    {data.discomName || "Regional Net-Metering Feeder"}
                  </div>
                  <div className="text-[#2E7D32] text-[11px] font-medium mt-0.5">
                    ✓ Net-Metering Sanction Feasible
                  </div>
                </div>
              </div>

              {/* Section I: Sizing & Bill of Materials */}
              <div className="mb-8 avoid-break">
                <div className="flex items-center justify-between border-b border-[#E3E4E6] pb-2 mb-3">
                  <h3 className="text-[13px] font-bold uppercase tracking-wider text-[#171A20]">
                    I. Architectural Bill of Materials (BoM)
                  </h3>
                  <span className="text-[11px] font-mono text-[#5C5E62]">
                    Total Array: {data.systemKw.toFixed(2)} kWp DC
                  </span>
                </div>

                <table className="w-full text-left text-[12px] border-collapse">
                  <thead>
                    <tr className="border-b border-[#E3E4E6] text-[10px] uppercase font-bold text-[#5C5E62]">
                      <th className="py-2">Component Description</th>
                      <th className="py-2">Engineering Specification</th>
                      <th className="py-2 text-right">Quantity / Capacity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E9ECEF] text-[#171A20]">
                    <tr>
                      <td className="py-2.5 font-medium">Monolithic Bifacial PV Modules</td>
                      <td className="py-2.5 text-[#5C5E62]">
                        N-Type TOPCon Dual-Glass (2.0+2.0mm), 22.8% STC Efficiency, ALMM Listed, BIS
                        Certified (IS 14286 / IS 61730). Class A Fire Rated.
                      </td>
                      <td className="py-2.5 text-right font-mono font-medium">
                        {data.panelCount} × 550W ({data.systemKw.toFixed(2)} kW)
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-medium">Three-Phase Hybrid String Inverter</td>
                      <td className="py-2.5 text-[#5C5E62]">
                        Dual MPPT Trackers, 98.4% Peak Efficiency, IP66 Enclosure, Integrated DC
                        Isolator &amp; Rapid Arc Fault Detection.
                      </td>
                      <td className="py-2.5 text-right font-mono font-medium">
                        1 Unit (Three-Phase)
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-medium">Omnigrid Modular Energy Storage</td>
                      <td className="py-2.5 text-[#5C5E62]">
                        Lithium Iron Phosphate (LiFePO4) high-voltage stack, &lt;20ms solid-state
                        automatic islanding switchover, 6000-cycle life warranty.
                      </td>
                      <td className="py-2.5 text-right font-mono font-medium">
                        {data.batteryUnits} × {data.batteryKwh.toFixed(1)} kWh
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-medium">Structural Pergola &amp; Mounting</td>
                      <td className="py-2.5 text-[#5C5E62]">
                        Anodized Extruded Aluminum (6005-T5), SS304 Fasteners, IS 875 (Part 3) 44
                        m/s Wind Compliance, Zero Terrace Slab Penetration.
                      </td>
                      <td className="py-2.5 text-right font-mono font-medium">
                        Custom Architectural Fit
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-medium">Balance of System &amp; Protection</td>
                      <td className="py-2.5 text-[#5C5E62]">
                        Class II Surge Protection Devices (SPD), Chemical Earthing Pits (x3),
                        UV-Resistant DC/AC Armored Cabling, Smart Bi-directional Energy Meter.
                      </td>
                      <td className="py-2.5 text-right font-mono font-medium">
                        Turnkey Full Package
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Section II: Financial Economics & PM Surya Ghar Ledger */}
              <div className="mb-8 avoid-break">
                <div className="flex items-center justify-between border-b border-[#E3E4E6] pb-2 mb-3">
                  <h3 className="text-[13px] font-bold uppercase tracking-wider text-[#171A20]">
                    II. Capital Investment &amp; Statutory Subsidy Ledger
                  </h3>
                  <span className="text-[11px] font-mono text-[#5C5E62]">Currency: INR (₹)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div className="p-4 rounded-[4px] border border-[#E3E4E6] bg-[#FAFAFA] space-y-2 text-[12px]">
                    <div className="flex justify-between py-1 border-b border-[#EAEAEA]">
                      <span className="text-[#5C5E62]">Estimated Gross Turnkey Capex:</span>
                      <span className="font-mono font-semibold">₹{formatInr(data.grossCapex)}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#EAEAEA] text-[#2E7D32]">
                      <span className="font-medium">PM Surya Ghar Central Subsidy (DBT):</span>
                      <span className="font-mono font-bold">-₹{formatInr(data.subsidyInr)}</span>
                    </div>
                    <div className="flex justify-between py-1 text-[14px] font-bold text-[#171A20] pt-1">
                      <span>Net Capital Payable:</span>
                      <span className="font-mono text-[16px]">₹{formatInr(data.netPayable)}</span>
                    </div>
                    <p className="text-[10px] text-[#5C5E62] pt-1">
                      * Central subsidy is processed via national portal Direct Benefit Transfer
                      directly into client bank account.
                    </p>
                  </div>

                  <div className="p-4 rounded-[4px] border border-[#E3E4E6] bg-[#FAFAFA] space-y-2 text-[12px]">
                    <div className="flex justify-between py-1 border-b border-[#EAEAEA]">
                      <span className="text-[#5C5E62]">Current Monthly Electricity Bill:</span>
                      <span className="font-mono font-semibold">
                        ₹{formatInr(data.monthlyBill)}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#EAEAEA]">
                      <span className="text-[#5C5E62]">First Year Annual Solar Generation:</span>
                      <span className="font-mono font-semibold">
                        ~{formatInr(Math.round(data.systemKw * 1450))} kWh
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#EAEAEA] text-[#2E7D32]">
                      <span className="font-medium">Estimated First-Year Cash Savings:</span>
                      <span className="font-mono font-bold">
                        ₹{formatInr(data.annualSavings)}/yr
                      </span>
                    </div>
                    <div className="flex justify-between py-1 text-[13px] font-bold text-[#171A20] pt-1">
                      <span>Full Amortization / Payback Horizon:</span>
                      <span className="font-mono text-[#F57C00]">
                        {data.paybackYears.toFixed(1)} Years
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section III: 25-Year Cumulative Compounding Wealth Schedule */}
              <div className="mb-8 avoid-break page-break-after">
                <div className="flex items-center justify-between border-b border-[#E3E4E6] pb-2 mb-3">
                  <h3 className="text-[13px] font-bold uppercase tracking-wider text-[#171A20]">
                    III. 25-Year Compounding Wealth Schedule
                  </h3>
                  <span className="text-[10px] text-[#5C5E62] font-mono">
                    Modeled at 3.0% Annual Tariff Inflation · 0.4% Module Degradation
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[11px] border-collapse">
                    <thead>
                      <tr className="border-b border-[#E3E4E6] text-[10px] uppercase font-bold text-[#5C5E62] bg-[#F8F9FA]">
                        <th className="py-2 px-3">Timeline Milestone</th>
                        <th className="py-2 px-3">Estimated Grid Tariff</th>
                        <th className="py-2 px-3">Cumulative Solar Utility Offset</th>
                        <th className="py-2 px-3 text-right">Net Retained Cash Wealth</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E9ECEF] text-[#171A20]">
                      {compoundMatrix.map((row) => (
                        <tr key={row.year} className="hover:bg-[#FAFAFA]">
                          <td className="py-2 px-3 font-semibold">
                            Year {row.year} {row.year === 25 ? "(Full Warranty Maturity)" : ""}
                          </td>
                          <td className="py-2 px-3 text-[#5C5E62] font-mono">
                            ₹{(9.2 * Math.pow(1.03, row.year - 1)).toFixed(2)} / kWh
                          </td>
                          <td className="py-2 px-3 font-mono font-medium">
                            ₹{formatInr(row.cumulativeSavings)}
                          </td>
                          <td
                            className={`py-2 px-3 text-right font-mono font-bold ${
                              row.netRetainedWealth > 0 ? "text-[#2E7D32]" : "text-[#5C5E62]"
                            }`}
                          >
                            ₹{formatInr(row.netRetainedWealth)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Section IV: Technical Single-Line Schematic Representation */}
              <div className="mb-8 avoid-break">
                <div className="flex items-center justify-between border-b border-[#E3E4E6] pb-2 mb-3">
                  <h3 className="text-[13px] font-bold uppercase tracking-wider text-[#171A20]">
                    IV. Turnkey Single-Line Engineering Schematic (SLD)
                  </h3>
                  <span className="text-[10px] font-mono text-[#5C5E62]">
                    System Architecture Class: Hybrid Microgrid
                  </span>
                </div>

                {/* Minimalist SVG Schematic */}
                <div className="p-4 bg-[#F8F9FA] rounded-[4px] border border-[#E9ECEF] flex flex-col items-center">
                  <div className="w-full max-w-2xl py-2 flex items-center justify-between text-[10px] font-mono font-medium text-center">
                    <div className="p-2.5 bg-[#FFFFFF] border border-[#171A20] rounded-[4px] shadow-xs">
                      <div className="font-bold text-[#171A20]">SOLAR ARRAY</div>
                      <div className="text-[9px] text-[#5C5E62]">
                        {data.systemKw.toFixed(1)} kWp DC
                      </div>
                    </div>
                    <div className="text-[#5C5E62]">── DC ──►</div>
                    <div className="p-2.5 bg-[#FFFFFF] border border-[#171A20] rounded-[4px] shadow-xs">
                      <div className="font-bold text-[#171A20]">HYBRID INVERTER</div>
                      <div className="text-[9px] text-[#5C5E62]">Three-Phase 98.4%</div>
                    </div>
                    <div className="text-[#5C5E62]">◄──►</div>
                    <div className="p-2.5 bg-[#FFFFFF] border border-[#F57C00] rounded-[4px] shadow-xs">
                      <div className="font-bold text-[#F57C00]">OMNIGRID LFP</div>
                      <div className="text-[9px] text-[#5C5E62]">
                        {data.batteryKwh.toFixed(1)} kWh
                      </div>
                    </div>
                    <div className="text-[#5C5E62]">── AC ──►</div>
                    <div className="p-2.5 bg-[#FFFFFF] border border-[#2E7D32] rounded-[4px] shadow-xs">
                      <div className="font-bold text-[#2E7D32]">NET METER</div>
                      <div className="text-[9px] text-[#5C5E62]">DISCOM Grid</div>
                    </div>
                  </div>
                  <div className="text-[10px] text-[#5C5E62] mt-2 font-mono text-center">
                    Compliant with Central Electricity Authority (CEA) Technical Standards &amp;
                    State DISCOM Interconnection Codes
                  </div>
                </div>
              </div>

              {/* Warranties & Legal Signature Seal */}
              <div className="pt-6 border-t border-[#E3E4E6] grid grid-cols-1 sm:grid-cols-2 gap-6 items-end avoid-break">
                <div className="space-y-2 text-[11px] text-[#5C5E62]">
                  <div className="font-bold uppercase tracking-wider text-[#171A20]">
                    Institutional Asset Warranties:
                  </div>
                  <div className="flex items-center gap-1.5 text-[#171A20]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#2E7D32]" />
                    <span>25-Year Linear Power Guarantee (&ge; 84.8% Year 25)</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#171A20]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#2E7D32]" />
                    <span>10-Year Omnigrid Battery Storage Warranty (6,000 cycles)</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#171A20]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#2E7D32]" />
                    <span>5-Year Terrace Structural Weatherproofing SLA</span>
                  </div>
                </div>

                <div className="p-4 bg-[#F8F9FA] rounded-[4px] border border-[#E9ECEF] text-center font-mono">
                  <div className="text-[10px] uppercase font-bold tracking-widest text-[#5C5E62]">
                    WAVENOX INNOVATION LAB
                  </div>
                  <div className="text-[12px] font-bold text-[#171A20] my-1">
                    CERTIFIED SOLAR ARCHITECTURE
                  </div>
                  <div className="text-[9px] text-[#5C5E62]">
                    Authorized Electronic Issuance · Gachibowli, Hyderabad 500032
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
