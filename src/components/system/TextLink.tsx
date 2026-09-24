import * as React from "react";
import { Link, type LinkProps } from "@tanstack/react-router";

export interface TextLinkBaseProps {
  className?: string;
  arrow?: boolean;
  children: React.ReactNode;
}

export type TextLinkProps =
  | (TextLinkBaseProps & React.ButtonHTMLAttributes<HTMLButtonElement> & { to?: undefined; href?: undefined })
  | (TextLinkBaseProps & LinkProps & { to: LinkProps["to"]; href?: undefined })
  | (TextLinkBaseProps & React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; to?: undefined });

export const TextLink = React.forwardRef<HTMLElement, TextLinkProps>(function TextLink(
  { className = "", arrow = false, children, ...rest },
  ref
) {
  const baseClasses =
    "inline-flex items-center gap-1.5 text-[14px] font-medium underline underline-offset-4 decoration-current/30 hover:decoration-current transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2";

  const content = (
    <>
      <span>{children}</span>
      {arrow && <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">→</span>}
    </>
  );

  const combinedClasses = `${baseClasses} ${className}`.trim();

  if ("to" in rest && rest.to !== undefined) {
    const { to, ...linkRest } = rest as LinkProps & { to: LinkProps["to"] };
    return (
      <Link
        ref={ref as React.Ref<HTMLAnchorElement>}
        to={to}
        className={combinedClasses}
        {...linkRest}
      >
        {content}
      </Link>
    );
  }

  if ("href" in rest && rest.href !== undefined) {
    const { href, ...anchorRest } = rest as React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };
    return (
      <a
        ref={ref as React.Ref<HTMLAnchorElement>}
        href={href}
        className={combinedClasses}
        {...anchorRest}
      >
        {content}
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
      {content}
    </button>
  );
});
