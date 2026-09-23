import { Link } from "@tanstack/react-router";
import { BRAND_CONFIG } from "@/config/brand";

interface BrandLogoProps {
  className?: string;
  asLink?: boolean;
  size?: "sm" | "md" | "lg";
}

export function BrandLogo({
  className = "",
  asLink = true,
  size = "md",
}: BrandLogoProps) {
  const sizeClasses = {
    sm: "text-base tracking-[0.3em]",
    md: "text-lg lg:text-xl tracking-[0.35em]",
    lg: "text-2xl lg:text-3xl tracking-[0.4em]",
  };

  const content = (
    <span
      className={`inline-block font-bold uppercase select-none text-white transition-opacity duration-300 hover:opacity-90 ${sizeClasses[size]} ${className}`}
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
