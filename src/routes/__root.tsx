import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import "@fontsource-variable/inter";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { BRAND_CONFIG } from "../config/brand";
import { BUSINESS } from "../config/business";
import { ConsultationDrawer } from "../components/ConsultationDrawer";
import { BrandLogo } from "../components/BrandLogo";
import { initTelemetry } from "../lib/telemetry";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#111215] text-[#FFFFFF] px-6 text-center select-text">
      <div className="mb-8">
        <BrandLogo asLink size="md" className="text-[#FFFFFF]" />
      </div>
      <div className="max-w-md">
        <span className="text-[12px] font-mono tracking-[0.2em] uppercase text-[#F57C00]">
          404 · Navigation Exception
        </span>
        <h1 className="mt-2 text-[32px] sm:text-[40px] font-medium tracking-tight text-[#FFFFFF]">
          Page Not Found
        </h1>
        <p className="mt-3 text-[14px] leading-relaxed text-[#9CA3AF]">
          The requested architectural solar showroom view does not exist or has been relocated.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/"
            className="w-full sm:w-auto inline-flex items-center justify-center min-h-[44px] h-11 px-7 rounded-[4px] bg-[#FFFFFF] text-[#171A20] text-[13px] font-medium tracking-[0.04em] transition-opacity hover:opacity-90 cursor-pointer"
          >
            Explore Systems
          </Link>
          <Link
            to="/deploy"
            className="w-full sm:w-auto inline-flex items-center justify-center min-h-[44px] h-11 px-7 rounded-[4px] bg-[#1B1E24] hover:bg-[#23272F] text-[#FFFFFF] border border-[#2C323C] text-[13px] font-medium tracking-[0.04em] transition-colors cursor-pointer"
          >
            Design Studio
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#111215] text-[#FFFFFF] px-6 text-center select-text">
      <div className="mb-8">
        <BrandLogo asLink size="md" className="text-[#FFFFFF]" />
      </div>
      <div className="max-w-md">
        <span className="text-[12px] font-mono tracking-[0.2em] uppercase text-[#F57C00]">
          Telemetry Exception
        </span>
        <h1 className="mt-2 text-[32px] sm:text-[40px] font-medium tracking-tight text-[#FFFFFF]">
          System Offline
        </h1>
        <p className="mt-3 text-[14px] leading-relaxed text-[#9CA3AF]">
          An unexpected telemetry exception occurred while rendering this interface. Reconnecting
          telemetry or returning to the showroom will restore operation.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="w-full sm:w-auto inline-flex items-center justify-center min-h-[44px] h-11 px-7 rounded-[4px] bg-[#FFFFFF] text-[#171A20] text-[13px] font-medium tracking-[0.04em] transition-opacity hover:opacity-90 cursor-pointer"
          >
            Retry Connection
          </button>
          <Link
            to="/"
            className="w-full sm:w-auto inline-flex items-center justify-center min-h-[44px] h-11 px-7 rounded-[4px] bg-[#1B1E24] hover:bg-[#23272F] text-[#FFFFFF] border border-[#2C323C] text-[13px] font-medium tracking-[0.04em] transition-colors cursor-pointer"
          >
            Return to Showroom
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: `${BRAND_CONFIG.name} — ${BRAND_CONFIG.tagline}` },
      { name: "description", content: BRAND_CONFIG.description },
      { name: "author", content: BRAND_CONFIG.legalName },
      { property: "og:title", content: `${BRAND_CONFIG.name} — ${BRAND_CONFIG.tagline}` },
      { property: "og:description", content: BRAND_CONFIG.description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: BRAND_CONFIG.domain },
      { property: "og:image", content: `${BRAND_CONFIG.domain}/icon-512.png` },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "theme-color", content: "#171A20" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/favicon.ico", sizes: "32x32" },
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
      { rel: "manifest", href: "/site.webmanifest" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: `${BRAND_CONFIG.name} Architectural Solar`,
    legalName: BRAND_CONFIG.legalName,
    url: BRAND_CONFIG.domain,
    logo: `${BRAND_CONFIG.domain}/icon-512.png`,
    image: `${BRAND_CONFIG.domain}/icon-512.png`,
    telephone: BRAND_CONFIG.contact.phoneDisplay,
    email: BRAND_CONFIG.contact.email,
    address: {
      "@type": "PostalAddress",
      addressLocality: BUSINESS.primaryCity,
      addressRegion: BUSINESS.primaryRegion,
      addressCountry: "IN",
    },
    areaServed: {
      "@type": "State",
      name: "Telangana",
    },
  };

  return (
    <html lang="en">
      <head>
        <HeadContent />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  useEffect(() => {
    initTelemetry();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
      <ConsultationDrawer />
    </QueryClientProvider>
  );
}
