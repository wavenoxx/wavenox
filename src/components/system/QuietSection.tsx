import * as React from "react";
import { Reveal } from "./Reveal";

export interface QuietSectionProps {
  id?: string;
  bg?: "white" | "surface" | "dark";
  title?: React.ReactNode;
  lead?: React.ReactNode;
  topAddon?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  containerClassName?: string;
}

export function QuietSection({
  id,
  bg = "white",
  title,
  lead,
  topAddon,
  children,
  className = "",
  containerClassName = "",
}: QuietSectionProps) {
  const isDark = bg === "dark";
  const surfaceClasses =
    bg === "surface"
      ? "bg-[#F4F4F4] text-[#171A20]"
      : isDark
        ? "bg-[#171A20] text-[#FFFFFF]"
        : "bg-[#FFFFFF] text-[#171A20]";

  return (
    <section
      id={id}
      data-theme={isDark ? "dark" : "light"}
      className={`relative w-full py-14 sm:py-16 md:py-24 lg:py-28 px-4 sm:px-6 md:px-8 lg:px-12 ${surfaceClasses} ${className}`}
    >
      <div className={`max-w-5xl mx-auto ${containerClassName}`}>
        {(title || lead || topAddon) && (
          <div className="text-center mb-10 sm:mb-12 md:mb-16">
            <Reveal>
              {title && (
                <h2 className="text-[26px] sm:text-[32px] lg:text-[40px] font-medium tracking-[-0.02em] leading-[1.12] text-inherit text-balance max-w-[26ch] mx-auto">
                  {title}
                </h2>
              )}
              {lead && (
                <p
                  className={`text-[15px] sm:text-[16px] lg:text-[17px] font-normal leading-[1.55] max-w-[56ch] mx-auto mt-3 text-balance ${
                    isDark ? "text-[#FFFFFF]/80" : "text-[#393C41]"
                  }`}
                >
                  {lead}
                </p>
              )}
              {topAddon && <div className="mt-3">{topAddon}</div>}
            </Reveal>
          </div>
        )}

        {children}
      </div>
    </section>
  );
}
