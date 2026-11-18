import * as React from "react";
import { Reveal } from "./Reveal";

export interface QuietSectionProps {
  id?: string;
  bg?: "white" | "surface" | "dark";
  eyebrow?: React.ReactNode;
  title?: React.ReactNode;
  lead?: React.ReactNode;
  topAddon?: React.ReactNode;
  headerAlign?: "center" | "left";
  children?: React.ReactNode;
  className?: string;
  containerClassName?: string;
}

export function QuietSection({
  id,
  bg = "white",
  eyebrow,
  title,
  lead,
  topAddon,
  headerAlign = "center",
  children,
  className = "",
  containerClassName = "",
}: QuietSectionProps) {
  const isDark = bg === "dark";
  const isLeft = headerAlign === "left";
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
      className={`relative w-full py-16 sm:py-20 md:py-24 lg:py-32 px-5 sm:px-8 lg:px-12 ${surfaceClasses} ${className}`}
    >
      <div className={`max-w-[1240px] mx-auto ${containerClassName}`}>
        {(eyebrow || title || lead || topAddon) && (
          <div
            className={`${isLeft ? "text-left" : "text-center"} mb-12 sm:mb-14 md:mb-16 lg:mb-20`}
          >
            <Reveal>
              {eyebrow && (
                <div
                  className={`text-[12px] font-medium uppercase tracking-[0.08em] mb-3 ${
                    isDark ? "text-[#FFFFFF]/70" : "text-[#5C5E62]"
                  }`}
                >
                  {eyebrow}
                </div>
              )}
              {title && (
                <h2
                  className={`text-[28px] sm:text-[36px] lg:text-[44px] font-medium tracking-[-0.024em] leading-[1.1] text-inherit text-balance max-w-[26ch] ${
                    isLeft ? "" : "mx-auto"
                  }`}
                >
                  {title}
                </h2>
              )}
              {lead && (
                <p
                  className={`text-[15px] sm:text-[16px] lg:text-[17px] font-normal leading-[1.6] max-w-[58ch] mt-3.5 text-pretty ${
                    isLeft ? "" : "mx-auto"
                  } ${isDark ? "text-[#FFFFFF]/80" : "text-[#393C41]"}`}
                >
                  {lead}
                </p>
              )}
              {topAddon && <div className="mt-4">{topAddon}</div>}
            </Reveal>
          </div>
        )}

        {children}
      </div>
    </section>
  );
}
