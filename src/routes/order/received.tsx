import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { Printer, Share2, FileDown } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button, TextLink } from "@/components/system";
import { BRAND_CONFIG } from "@/config/brand";
import { ArchitecturalDossierModal, type DossierData } from "@/components/ArchitecturalDossierModal";
import { PRODUCTS_CONFIG } from "@/config/products";

const orderReceivedSearchSchema = z.object({
  ref: z.string().optional().default("WNX-PROPOSAL"),
});

export const Route = createFileRoute("/order/received")({
  validateSearch: (search) => orderReceivedSearchSchema.parse(search),
  head: () => ({
    meta: [
      { title: `Proposal Request Confirmed — ${BRAND_CONFIG.name}` },
      {
        name: "description",
        content: "Your architectural solar proposal request has been received and logged.",
      },
    ],
  }),
  component: OrderReceivedPage,
});

const NEXT_STEPS = [
  {
    num: "01",
    title: "Satellite Roof Geometry Review",
    desc: "Our solar engineers analyze high-resolution satellite imagery of your roof topology, tilt, and azimuth to verify module placement.",
  },
  {
    num: "02",
    title: "Technical Advisory Consultation",
    desc: "A dedicated solar engineer contacts you to review your DISCOM sanction requirements, historical bills, and storage needs.",
  },
  {
    num: "03",
    title: "Engineering Survey & Proposal Dossier",
    desc: "We perform an on-site terrace measurement to produce sub-millimeter 3D shadow models and engineering single-line diagrams.",
  },
];

function OrderReceivedPage() {
  const { ref } = Route.useSearch();
  const [dossierModalOpen, setDossierModalOpen] = React.useState(false);
  const [dossierData, setDossierData] = React.useState<DossierData | null>(null);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = sessionStorage.getItem("wavenox_active_dossier");
        if (stored) {
          const parsed = JSON.parse(stored);
          setDossierData(parsed);
          return;
        }
      } catch {
        // fallback
      }
    }
    // Default fallback if directly visited
    setDossierData({
      refCode: ref,
      clientName: "Valued Estate Owner",
      phone: "",
      address: "Telangana / Andhra Pradesh",
      pinCode: "500033",
      discomName: "TGSPDCL",
      systemKw: 13.2,
      panelCount: 24,
      batteryUnits: 1,
      batteryKwh: PRODUCTS_CONFIG.battery.usableCapacityKwh,
      monthlyBill: 12000,
      grossCapex: 1098400,
      subsidyInr: 78000,
      netPayable: 1020400,
      monthlyEmi: 21450,
      paybackYears: 4.2,
      annualSavings: 132480,
      twentyFiveYearSavings: 4210000,
    });
  }, [ref]);

  const whatsappHref = `${BRAND_CONFIG.contact.whatsappLink}?text=${encodeURIComponent(
    `Hello WAVENOX Team, I recently requested an architectural solar proposal with reference code ${ref}. I would like to review my technical sizing and schedule an engineering consultation.`,
  )}`;

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#171A20] selection:bg-[#171A20] selection:text-[#FFFFFF] flex flex-col justify-between">
      <Header />

      <main className="flex-1 pt-32 pb-20 px-6">
        <div className="max-w-2xl mx-auto text-center space-y-10">
          <div className="space-y-3">
            <span className="text-[12px] font-medium uppercase tracking-widest text-[#5C5E62]">
              Proposal Registered
            </span>
            <h1 className="text-[32px] sm:text-[40px] font-medium tracking-tight text-[#171A20]">
              Request Confirmed
            </h1>
            <p className="text-[15px] text-[#5C5E62] leading-relaxed max-w-lg mx-auto">
              Thank you for trusting WAVENOX. Your technical configuration is logged in our advisory
              queue.
            </p>
          </div>

          {/* Reference Code */}
          <div className="py-6 px-8 rounded-[4px] border border-[#E3E4E6] bg-[#F4F4F4] space-y-1">
            <div className="text-[12px] uppercase tracking-wider text-[#5C5E62]">
              Official Reference Code
            </div>
            <div className="text-[28px] sm:text-[32px] font-semibold tracking-wider tabular-nums text-[#171A20]">
              {ref}
            </div>
            <p className="text-[12px] text-[#5C5E62] pt-1">
              Quote this reference for priority scheduling and WhatsApp support.
            </p>
          </div>

          {/* Next Steps */}
          <div className="text-left space-y-6 pt-4 border-t border-[#E3E4E6]">
            <h2 className="text-[13px] font-medium uppercase tracking-wider text-[#5C5E62] text-center">
              Next Steps
            </h2>

            <div className="space-y-6">
              {NEXT_STEPS.map((s) => (
                <div key={s.num} className="flex items-start gap-4">
                  <span className="text-[13px] font-medium tabular-nums text-[#5C5E62] shrink-0 pt-0.5">
                    {s.num}
                  </span>
                  <div className="space-y-1">
                    <h3 className="text-[15px] font-medium text-[#171A20]">{s.title}</h3>
                    <p className="text-[13px] text-[#5C5E62] leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-6">
            <button
              type="button"
              onClick={() => setDossierModalOpen(true)}
              className="w-full sm:w-auto min-w-[220px] h-10 px-5 rounded-[4px] bg-[#171A20] text-[#FFFFFF] text-[13px] font-medium tracking-wide hover:bg-[#2C3038] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <FileDown className="w-4 h-4 text-[#F57C00]" />
              <span>Download Dossier (PDF)</span>
            </button>
            <Button
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              variant="secondary"
              tone="light"
              className="w-full sm:w-auto min-w-[180px]"
            >
              Chat on WhatsApp
            </Button>
            <Button
              to="/"
              variant="secondary"
              tone="light"
              className="w-full sm:w-auto min-w-[150px]"
            >
              Showcase
            </Button>
          </div>

          <p className="text-[12px] text-[#5C5E62] text-center pt-2">
            Turnkey net-metering approvals and PM Surya Ghar national portal filing included.
          </p>
        </div>
      </main>

      {/* Bespoke Architectural Dossier Modal */}
      {dossierData && (
        <ArchitecturalDossierModal
          isOpen={dossierModalOpen}
          onClose={() => setDossierModalOpen(false)}
          data={dossierData}
        />
      )}

      <Footer />
    </div>
  );
}
