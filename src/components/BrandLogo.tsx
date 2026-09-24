import { Link } from "@tanstack/react-router";
import { BRAND_CONFIG } from "@/config/brand";

interface BrandLogoProps {
  className?: string;
  asLink?: boolean;
  size?: "sm" | "md" | "lg";
}

export function BrandLogo({
  className = "text-white",
  asLink = true,
  size = "md",
}: BrandLogoProps) {
  const sizeClasses = {
    sm: "text-base tracking-[0.28em]",
    md: "text-lg lg:text-xl tracking-[0.32em]",
    lg: "text-2xl lg:text-3xl tracking-[0.35em]",
  };

  const content = (
    <span
      className={`inline-block font-bold uppercase transition-colors duration-200 hover:opacity-85 ${sizeClasses[size]} ${className}`}
    >
      {BRAND_CONFIG.name}
    </span>
  );

  if (asLink) {
    return (
      <Link to="/" aria-label={`${BRAND_CONFIG.name} Home`} className="inline-flex items-center">
        {content}
      </Link>
    );
  }

  return content;
}
