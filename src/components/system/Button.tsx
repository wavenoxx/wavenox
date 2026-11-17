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
    "inline-flex items-center justify-center min-h-[44px] h-11 px-5 sm:px-7 rounded-[4px] text-[13px] sm:text-[14px] font-medium leading-none tracking-[0.02em] whitespace-nowrap select-none transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40 active:scale-[0.99]";

  let variantClasses = "";
  if (tone === "dark") {
    if (variant === "primary") {
      variantClasses =
        "bg-[#FFFFFF] text-[#171A20] hover:bg-[#F4F4F4] active:bg-[#E3E4E6] shadow-[0_2px_10px_rgba(0,0,0,0.28)] focus-visible:ring-[#FFFFFF] focus-visible:ring-offset-[#171A20]";
    } else {
      variantClasses =
        "bg-[#171A20]/55 border border-[#FFFFFF]/35 text-[#FFFFFF] backdrop-blur-md hover:bg-[#171A20]/75 hover:border-[#FFFFFF]/60 active:bg-[#171A20]/85 focus-visible:ring-[#FFFFFF] focus-visible:ring-offset-[#171A20]";
    }
  } else {
    // tone === "light"
    if (variant === "primary") {
      variantClasses =
        "bg-[#171A20] text-[#FFFFFF] hover:bg-[#2B2F36] active:bg-[#000000] shadow-[0_1px_4px_rgba(23,26,32,0.14)] focus-visible:ring-[#171A20] focus-visible:ring-offset-[#FFFFFF]";
    } else {
      variantClasses =
        "bg-[#F4F4F4] border border-[#E3E4E6] text-[#171A20] hover:bg-[#EAEAEA] hover:border-[#171A20]/30 active:bg-[#DFDFDF] focus-visible:ring-[#171A20] focus-visible:ring-offset-[#FFFFFF]";
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
