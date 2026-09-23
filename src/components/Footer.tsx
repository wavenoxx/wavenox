import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Phone, MessageSquare, Mail, MapPin, Shield, CheckCircle2 } from "lucide-react";
import { BRAND_CONFIG } from "@/config/brand";
import { BUSINESS } from "@/config/business";
import { BrandLogo } from "./BrandLogo";
import { openConsultationDrawer } from "./ConsultationDrawer";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      id="contact"
      className="relative overflow-hidden border-t border-white/10 bg-black text-white"
    >
      {/* Subtle top ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-[260px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#F57C00]/10 blur-[130px]"
      />

      <div className="relative mx-auto max-w-7xl px-6 pt-20 pb-12 lg:px-10 lg:pt-24">
        {/* Main 4-Column Grid */}
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          {/* Column 1: Brand & Manifesto (Col span 4) */}
          <div className="lg:col-span-4">
            <BrandLogo size="lg" />
            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.25em] text-[#F5B366]">
              {BRAND_CONFIG.tagline}
            </p>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/60">
              Pioneering monolithic Liquid Glass architectural solar infrastructure.
              Transforming luxury residential estates and commercial assets into
              autonomous power plants.
            </p>

            <div className="mt-8 flex items-start gap-3 text-xs text-white/60">
              <MapPin className="h-4 w-4 shrink-0 text-[#F57C00] mt-0.5" />
              <span>{BRAND_CONFIG.contact.address}</span>
            </div>

            {/* Compliance badges pill */}
            <div className="mt-8 flex flex-wrap items-center gap-2">
              {["BIS Certified", "TÜV Rheinland", "UL Listed", "20-Yr Patent"].map((badge) => (
                <span
                  key={badge}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white/70"
                >
                  <CheckCircle2 className="h-2.5 w-2.5 text-[#F57C00]" />
                  {badge}
                </span>
              ))}
            </div>
          </div>

          {/* Column 2: Architecture & Products (Col span 2) */}
          <div className="lg:col-span-2 lg:pl-4">
            <h3 className="text-xs font-bold uppercase tracking-[0.25em] text-white">
              Architecture
            </h3>
            <ul className="mt-6 space-y-3.5 text-xs tracking-wider uppercase text-white/60">
              <li>
                <Link
                  to="/liquid-glass"
                  className="transition-colors duration-200 hover:text-white"
                >
                  Liquid Glass
                </Link>
              </li>
              <li>
                <Link
                  to="/residential"
                  className="transition-colors duration-200 hover:text-white"
                >
                  Residential Estates
                </Link>
              </li>
              <li>
                <Link
                  to="/enterprise"
                  className="transition-colors duration-200 hover:text-white"
                >
                  Enterprise & MW
                </Link>
              </li>
              <li>
                <Link
                  to="/omnigrid"
                  className="transition-colors duration-200 hover:text-white"
                >
                  Omni-Grid Storage
                </Link>
              </li>
              <li>
                <Link
                  to="/intelligence"
                  className="transition-colors duration-200 hover:text-white"
                >
                  Energy Intelligence
                </Link>
              </li>
              <li>
                <Link
                  to="/defense"
                  className="transition-colors duration-200 hover:text-white"
                >
                  Defense & Fortitude
                </Link>
              </li>
              <li>
                <Link
                  to="/brand"
                  className="transition-colors duration-200 hover:text-white"
                >
                  The Manifesto
                </Link>
              </li>
              <li>
                <Link
                  to="/deploy"
                  className="transition-colors duration-200 hover:text-[#F57C00]"
                >
                  System Configurator →
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Service Hubs (Col span 3) */}
          <div className="lg:col-span-3">
            <h3 className="text-xs font-bold uppercase tracking-[0.25em] text-white">
              Service Hubs
            </h3>
            <p className="mt-3 text-[11px] text-white/40">
              Deployment engineering teams active in:
            </p>
            <ul className="mt-4 space-y-3 text-xs tracking-wider uppercase text-white/60">
              {BUSINESS.serviceHubs.map((hub) => (
                <li key={hub.shortName} className="flex items-center justify-between group">
                  <span className="group-hover:text-white transition-colors duration-200">
                    {hub.city}
                  </span>
                  <span className="text-[9px] text-white/30 font-mono tracking-widest">
                    {hub.state}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: VIP Advisory & Immediate Dispatch (Col span 3) */}
          <div className="lg:col-span-3">
            <h3 className="text-xs font-bold uppercase tracking-[0.25em] text-white">
              VIP Advisory
            </h3>
            <p className="mt-3 text-xs text-white/60 leading-relaxed">
              Direct consultation with our chief solar architects.
            </p>

            <div className="mt-6 space-y-3">
              {/* Phone call */}
              <a
                href={BRAND_CONFIG.contact.phoneHref}
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-3 text-xs font-semibold text-white/90 transition-all duration-300 hover:border-[#F57C00]/40 hover:bg-[#F57C00]/5 hover:text-white"
              >
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white/5 text-[#F57C00]">
                  <Phone className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-white/40">Direct Desk</p>
                  <p className="font-mono text-sm text-white">{BRAND_CONFIG.contact.phoneDisplay}</p>
                </div>
              </a>

              {/* WhatsApp */}
              <a
                href={BRAND_CONFIG.contact.whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-3 text-xs font-semibold text-white/90 transition-all duration-300 hover:border-[#F57C00]/40 hover:bg-[#F57C00]/5 hover:text-white"
              >
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white/5 text-[#F57C00]">
                  <MessageSquare className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] uppercase tracking-wider text-white/40">VIP WhatsApp Desk</p>
                  <p className="font-mono text-sm text-white">{BRAND_CONFIG.contact.whatsappDisplay}</p>
                </div>
                <ArrowUpRight className="h-4 w-4 text-white/40" />
              </a>

              {/* Email */}
              <a
                href={BRAND_CONFIG.contact.emailHref}
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-3 text-xs font-semibold text-white/90 transition-all duration-300 hover:border-white/30 hover:text-white"
              >
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white/5 text-white/70">
                  <Mail className="h-4 w-4" />
                </div>
                <div className="truncate">
                  <p className="text-[10px] uppercase tracking-wider text-white/40">Executive Inquiries</p>
                  <p className="text-xs text-white/90 truncate">{BRAND_CONFIG.contact.email}</p>
                </div>
              </a>
            </div>

            {/* Assessment Trigger */}
            <div className="mt-6">
              <button
                type="button"
                onClick={() => openConsultationDrawer()}
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FFB547] via-[#F57C00] to-[#E56A00] px-5 py-3 text-xs font-bold uppercase tracking-[0.2em] text-black shadow-[0_0_30px_-8px_rgba(245,124,0,0.6)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_40px_-5px_rgba(245,124,0,0.9)] cursor-pointer"
              >
                <span>Book Proposal</span>
                <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Legal */}
        <div className="mt-16 border-t border-white/10 pt-8 flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
          <p className="text-[11px] text-white/40 tracking-wider">
            © {currentYear} {BRAND_CONFIG.legalName}. All rights reserved.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-6 text-[11px] tracking-wider uppercase text-white/40">
            <span className="hover:text-white transition-colors cursor-pointer">
              Privacy Declaration
            </span>
            <span className="hover:text-white transition-colors cursor-pointer">
              Terms of Deployment
            </span>
            <span className="hover:text-white transition-colors cursor-pointer">
              BIS & MNRE Compliance
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
