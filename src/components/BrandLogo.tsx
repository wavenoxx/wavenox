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
    sm: "text-[13px] tracking-[0.32em]",
    md: "text-[15px] tracking-[0.36em]",
    lg: "text-[20px] tracking-[0.40em]",
  };

  const content = (
    <span
      className={`inline-flex items-center font-semibold uppercase transition-opacity duration-200 hover:opacity-80 ${sizeClasses[size]} ${className}`}
      style={{ letterSpacing: size === "lg" ? "0.40em" : "0.36em" }}
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
