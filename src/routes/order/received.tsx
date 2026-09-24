import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import {
  Check,
  ArrowRight,
  PhoneCall,
  ShieldCheck,
  FileText,
  CalendarCheck,
  Home,
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BRAND_CONFIG } from "@/config/brand";

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

function OrderReceivedPage() {
  const { ref } = Route.useSearch();

  const whatsappHref = `${BRAND_CONFIG.contact.whatsappLink}?text=${encodeURIComponent(
    `Hello WAVENOX Team, I recently requested an architectural solar proposal with reference code ${ref}. I would like to review my technical sizing and schedule an engineering consultation.`,
  )}`;

  return (
    <div className="min-h-screen w-full bg-[#FFFFFF] text-[#171A20] selection:bg-[#171A20] selection:text-white flex flex-col justify-between">
      <Header />

      <main className="flex-1 pt-32 pb-20 px-6 lg:px-12">
        <div className="mx-auto max-w-2xl text-center">
          {/* Animated Success Badge */}
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 mb-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white shadow-md">
              <Check className="h-8 w-8 stroke-[2.5]" />
            </div>
          </div>

          <div className="space-y-3">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#5C5E62]">
              PROPOSAL DOSSIER LOGGED
            </span>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#171A20]">
              Proposal Request Confirmed
            </h1>
            <p className="text-sm sm:text-base text-[#5C5E62] leading-relaxed max-w-lg mx-auto">
              Thank you for trusting WAVENOX. Your technical configuration has been registered in
              our advisory queue.
            </p>
          </div>

          {/* Reference Code Card */}
          <div className="my-8 p-6 rounded-2xl border border-[#E2E8F0] bg-[#F8F8FA] space-y-2">
            <div className="text-xs uppercase tracking-wider text-[#5C5E62]">
              Official Reference Code
            </div>
            <div className="font-mono text-2xl sm:text-3xl font-bold tracking-wider text-[#171A20]">
              {ref}
            </div>
            <p className="text-[11px] text-[#5C5E62]">
              Save this reference number for all direct inquiries, site survey bookings, and
              WhatsApp support.
            </p>
          </div>

          {/* 3 Clear Next Steps */}
          <div className="text-left space-y-4 my-10">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-[#5C5E62] text-center">
              What Happens Next
            </h2>

            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-start gap-3.5 p-4 rounded-xl border border-[#E2E8F0] bg-white">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#171A20] text-xs font-bold text-white">
                  1
                </div>
                <div>
                  <div className="text-sm font-semibold text-[#171A20] flex items-center gap-1.5">
                    <FileText className="h-4 w-4 text-[#5C5E62]" />
                    Satellite Roof Geometry & Sizing Verification
                  </div>
                  <div className="text-xs text-[#5C5E62] mt-0.5 leading-relaxed">
                    Our technical engineers analyze high-resolution satellite imagery of your roof
                    topology, tilt, and azimuth to verify module placement.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-4 rounded-xl border border-[#E2E8F0] bg-white">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#171A20] text-xs font-bold text-white">
                  2
                </div>
                <div>
                  <div className="text-sm font-semibold text-[#171A20] flex items-center gap-1.5">
                    <PhoneCall className="h-4 w-4 text-[#5C5E62]" />
                    Senior Advisory Consultation
                  </div>
                  <div className="text-xs text-[#5C5E62] mt-0.5 leading-relaxed">
                    A dedicated solar advisor will connect with you to review your historical power
                    bills, DISCOM sanction constraints, and battery backup requirements.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-4 rounded-xl border border-[#E2E8F0] bg-white">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#171A20] text-xs font-bold text-white">
                  3
                </div>
                <div>
                  <div className="text-sm font-semibold text-[#171A20] flex items-center gap-1.5">
                    <CalendarCheck className="h-4 w-4 text-[#5C5E62]" />
                    Precision 3D Drone Survey & Feasibility Dossier
                  </div>
                  <div className="text-xs text-[#5C5E62] mt-0.5 leading-relaxed">
                    We schedule a non-invasive physical lidar/drone scan of your terrace to produce
                    sub-millimeter 3D shadow models and engineering single-line diagrams (SLD).
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary w-full sm:w-auto text-xs py-3.5 cursor-pointer flex items-center justify-center gap-2"
            >
              Connect on WhatsApp ({ref})
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
            <Link
              to="/"
              className="btn-secondary w-full sm:w-auto text-xs py-3.5 cursor-pointer flex items-center justify-center gap-2"
            >
              <Home className="h-3.5 w-3.5" />
              Return to Homepage
            </Link>
          </div>

          {/* Regulatory Support Assurance */}
          <div className="mt-12 inline-flex items-center gap-2 text-xs text-[#5C5E62]">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>Turnkey net-metering & PM Surya Ghar liaison included</span>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
