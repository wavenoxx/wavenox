import * as React from "react";
import { Reveal } from "./Reveal";

export interface QuietSectionProps {
  id?: string;
  bg?: "white" | "surface";
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
  const bgClass = bg === "surface" ? "bg-[#F4F4F4]" : "bg-[#FFFFFF]";

  return (
    <section
      id={id}
      data-theme="light"
      className={`relative w-full py-20 md:py-32 px-6 ${bgClass} text-[#171A20] ${className}`}
    >
      <div className={`max-w-5xl mx-auto ${containerClassName}`}>
        {(title || lead || topAddon) && (
          <div className="text-center mb-12 md:mb-16">
            <Reveal>
              {title && (
                <h2 className="text-[28px] sm:text-[34px] md:text-[40px] font-medium tracking-tight leading-[1.15] text-[#171A20]">
                  {title}
                </h2>
              )}
              {lead && (
                <p className="text-[15px] md:text-[16px] font-normal leading-relaxed text-[#5C5E62] max-w-xl mx-auto mt-2.5">
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
