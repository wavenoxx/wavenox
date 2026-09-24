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
    "inline-flex items-center justify-center h-10 px-6 rounded-[4px] text-[14px] font-medium leading-none tracking-normal whitespace-nowrap transition-colors duration-150 select-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40";

  let variantClasses = "";
  if (tone === "dark") {
    if (variant === "primary") {
      variantClasses =
        "bg-[#FFFFFF] text-[#171A20] hover:bg-[#FFFFFF]/90 active:bg-[#FFFFFF]/80 focus-visible:ring-[#FFFFFF] focus-visible:ring-offset-[#171A20]";
    } else {
      variantClasses =
        "bg-[#FFFFFF]/15 text-[#FFFFFF] backdrop-blur-md hover:bg-[#FFFFFF]/25 active:bg-[#FFFFFF]/30 focus-visible:ring-[#FFFFFF] focus-visible:ring-offset-[#171A20]";
    }
  } else {
    // tone === "light"
    if (variant === "primary") {
      variantClasses =
        "bg-[#171A20] text-[#FFFFFF] hover:bg-[#171A20]/90 active:bg-[#171A20]/80 focus-visible:ring-[#171A20] focus-visible:ring-offset-[#FFFFFF]";
    } else {
      variantClasses =
        "bg-[#F4F4F4] text-[#171A20] hover:bg-[#EAEAEA] active:bg-[#DFDFDF] focus-visible:ring-[#171A20] focus-visible:ring-offset-[#FFFFFF]";
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
