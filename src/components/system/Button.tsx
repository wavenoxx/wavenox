import * as React from "react";
import { Link, type LinkProps } from "@tanstack/react-router";

export type ButtonVariant = "primary" | "secondary";
export type ButtonTone = "light" | "dark";

export interface ButtonBaseProps {
  variant?: ButtonVariant;
  tone?: ButtonTone;
  className?: string;
  children: React.ReactNode;
}

export type ButtonProps =
  | (ButtonBaseProps &
      React.ButtonHTMLAttributes<HTMLButtonElement> & { to?: undefined; href?: undefined })
  | (ButtonBaseProps & LinkProps & { to: LinkProps["to"]; href?: undefined })
  | (ButtonBaseProps &
      React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; to?: undefined });

export const Button = React.forwardRef<HTMLElement, ButtonProps>(function Button(
  { variant = "primary", tone = "light", className = "", children, ...rest },
  ref,
) {
  const baseClasses =
    "inline-flex items-center justify-center min-h-[44px] h-11 px-7 rounded-[4px] text-[13px] sm:text-[14px] font-medium tracking-[0.04em] whitespace-nowrap transition-all duration-150 select-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40 active:scale-[0.99]";

  let variantClasses = "";
  if (tone === "dark") {
    if (variant === "primary") {
      variantClasses =
        "bg-[#FFFFFF] text-[#171A20] hover:bg-[#FFFFFF]/90 active:bg-[#FFFFFF]/80 shadow-[0_2px_8px_rgba(0,0,0,0.3)] focus-visible:ring-[#FFFFFF] focus-visible:ring-offset-[#171A20]";
    } else {
      variantClasses =
        "bg-black/30 border border-white/30 text-[#FFFFFF] backdrop-blur-md hover:bg-white/15 hover:border-white/50 active:bg-white/20 focus-visible:ring-[#FFFFFF] focus-visible:ring-offset-[#171A20]";
    }
  } else {
    // tone === "light"
    if (variant === "primary") {
      variantClasses =
        "bg-[#171A20] text-[#FFFFFF] hover:bg-[#000000] active:bg-[#171A20]/90 shadow-[0_2px_8px_rgba(23,26,32,0.15)] focus-visible:ring-[#171A20] focus-visible:ring-offset-[#FFFFFF]";
    } else {
      variantClasses =
        "bg-[#F4F4F4] border border-[#E3E4E6] text-[#171A20] hover:bg-[#EAEAEA] active:bg-[#DFDFDF] focus-visible:ring-[#171A20] focus-visible:ring-offset-[#FFFFFF]";
    }
  }

  const combinedClasses = `${baseClasses} ${variantClasses} ${className}`.trim();

  if ("to" in rest && rest.to !== undefined) {
    const { to, ...linkRest } = rest as LinkProps & { to: LinkProps["to"] };
    return (
      <Link
        ref={ref as React.Ref<HTMLAnchorElement>}
        to={to}
        className={combinedClasses}
        {...linkRest}
      >
        {children}
      </Link>
    );
  }

  if ("href" in rest && rest.href !== undefined) {
    const { href, ...anchorRest } = rest as React.AnchorHTMLAttributes<HTMLAnchorElement> & {
      href: string;
    };
    return (
      <a
        ref={ref as React.Ref<HTMLAnchorElement>}
        href={href}
        className={combinedClasses}
        {...anchorRest}
      >
        {children}
      </a>
    );
  }

  const buttonRest = rest as React.ButtonHTMLAttributes<HTMLButtonElement>;
  return (
    <button
      ref={ref as React.Ref<HTMLButtonElement>}
      type={buttonRest.type || "button"}
      className={combinedClasses}
      {...buttonRest}
    >
      {children}
    </button>
  );
});
