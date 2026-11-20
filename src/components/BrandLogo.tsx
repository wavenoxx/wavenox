import * as React from "react";
import { Link } from "@tanstack/react-router";
import { BRAND_CONFIG } from "@/config/brand";

interface BrandLogoProps {
  className?: string;
  asLink?: boolean;
  size?: "sm" | "md" | "lg";
}

export function BrandLogo({ className = "", asLink = true, size = "md" }: BrandLogoProps) {
  const sizeClasses = {
    sm: "h-[13px] w-auto aspect-[235/22]",
    md: "h-[14px] sm:h-[16px] w-auto aspect-[235/22]",
    lg: "h-[21px] w-auto aspect-[235/22]",
  };

  const content = (
    <span
      className={`inline-flex items-center transition-opacity duration-200 hover:opacity-85 select-none ${className}`}
    >
      <span className="sr-only">{BRAND_CONFIG.name}</span>
      <svg
        viewBox="0 0 235 22"
        fill="currentColor"
        aria-hidden="true"
        className={`block ${sizeClasses[size]}`}
      >
        {/* W — dual-valley solar geometry */}
        <path d="M2 2 H4.8 L10.5 16.2 L15.7 3.8 H18.3 L23.5 16.2 L29.2 2 H32 L24.8 20 H22.2 L17 7.6 L11.8 20 H9.2 Z" />
        {/* A — architectural chevron with floating horizon louver */}
        <path d="M39 20 L49.6 2 H52.4 L63 20 H60.1 L51 4.6 L41.9 20 Z M46.6 13.8 H55.4 L56.4 16 H45.6 Z" />
        {/* V — mirrored architectural counterpart */}
        <path d="M69 2 H71.9 L81 17.4 L90.1 2 H93 L82.4 20 H79.6 Z" />
        {/* E — open-stem frame with suspended central energy bar */}
        <path d="M104 2 H124 V4.4 H106.4 V17.6 H124 V20 H104 Z M109.2 9.8 H122 V12.2 H109.2 Z" />
        {/* N — high-tension diagonal energy bridge */}
        <path d="M138 2 H141.2 L156.6 16.2 V2 H159 V20 H155.8 L140.4 5.8 V20 H138 Z" />
        {/* O — architectural chamfered solar-wafer frame */}
        <path
          fillRule="evenodd"
          d="M178 2 H192 Q197 2 197 7 V15 Q197 20 192 20 H178 Q173 20 173 15 V7 Q173 2 178 2 Z M178.4 4.4 H191.6 Q194.6 4.4 194.6 7.4 V14.6 Q194.6 17.6 191.6 17.6 H178.4 Q175.4 17.6 175.4 14.6 V7.4 Q175.4 4.4 178.4 4.4 Z"
        />
        {/* X — symmetrical intersecting terminal blades */}
        <path d="M210 2 H213.5 L233 20 H229.5 Z M229.5 2 H233 L213.5 20 H210 Z" />
      </svg>
    </span>
  );

  if (asLink) {
    return (
      <Link
        to="/"
        aria-label={`${BRAND_CONFIG.name} Home`}
        className="inline-flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current rounded-[2px]"
      >
        {content}
      </Link>
    );
  }

  return content;
}
