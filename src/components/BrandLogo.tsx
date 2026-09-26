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
    sm: "text-[18px] tracking-[0.28em]",
    md: "text-[22px] tracking-[0.30em]",
    lg: "text-[30px] tracking-[0.32em]",
  };

  const content = (
    <span
      className={`inline-flex items-center font-bold uppercase transition-opacity duration-200 hover:opacity-80 select-none ${sizeClasses[size]} ${className}`}
    >
      {BRAND_CONFIG.name}
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
