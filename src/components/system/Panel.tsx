import * as React from "react";
import { Media, type MediaDescriptor } from "./Media";
import { Reveal } from "./Reveal";

export interface PanelProps {
  id?: string;
  media?: MediaDescriptor | string;
  mediaSrc?: string;
  alt?: string;
  priority?: boolean;
  tone?: "dark" | "light";
  title?: React.ReactNode;
  lead?: React.ReactNode;
  topAddon?: React.ReactNode;
  stats?: React.ReactNode;
  actions?: React.ReactNode;
  disclaimer?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  objectPosition?: string;
}

export function Panel({
  id,
  media,
  mediaSrc,
  alt = "",
  priority = false,
  tone = "dark",
  title,
  lead,
  topAddon,
  stats,
  actions,
  disclaimer,
  children,
  className = "",
  objectPosition = "center",
}: PanelProps) {
  const isDark = tone === "dark";
  const textColor = isDark ? "text-[#FFFFFF]" : "text-[#171A20]";

  return (
    <section
      id={id}
      data-theme={tone}
      className={`relative w-full h-[100svh] min-h-[600px] flex flex-col justify-between overflow-hidden select-none ${textColor} ${className}`}
    >
      {/* Background Media */}
      <div className="absolute inset-0 -z-10 w-full h-full pointer-events-none">
        {(media || mediaSrc) && (
          <Media
            media={media}
            src={mediaSrc}
            alt={alt}
            priority={priority}
            fill
            objectPosition={objectPosition}
            className="w-full h-full object-cover"
          />
        )}

        {/* Subtle scrims only where text sits */}
        {isDark && (
          <>
            <div className="absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-black/60 via-black/25 to-transparent pointer-events-none" />
            <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-black/75 via-black/35 to-transparent pointer-events-none" />
          </>
        )}
      </div>

      {/* Top Section: Title & Lead */}
      <div className="pt-24 sm:pt-28 md:pt-32 px-6 text-center z-10">
        <Reveal>
          {title && (
            <h2 className="text-[34px] sm:text-[40px] md:text-[48px] font-medium tracking-tight leading-[1.1] text-inherit">
              {title}
            </h2>
          )}
          {lead && (
            <p className="text-[15px] md:text-[17px] font-normal leading-relaxed text-inherit/80 max-w-xl mx-auto mt-2.5">
              {lead}
            </p>
          )}
          {topAddon && <div className="mt-3">{topAddon}</div>}
        </Reveal>
      </div>

      {/* Middle Custom Content if any */}
      {children && <div className="flex-1 flex items-center justify-center px-6 z-10">{children}</div>}

      {/* Bottom Dock: Stats, Actions, Disclaimer */}
      <div className="pb-10 sm:pb-12 md:pb-14 px-6 flex flex-col items-center gap-5 sm:gap-6 z-10 w-full max-w-4xl mx-auto text-center">
        {stats && <Reveal delay={0.1}>{stats}</Reveal>}

        {actions && (
          <Reveal delay={0.15} className="w-full sm:w-auto">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full">
              {actions}
            </div>
          </Reveal>
        )}

        {disclaimer && (
          <p className="text-[12px] font-normal leading-normal text-inherit/60 max-w-xl mx-auto">
            {disclaimer}
          </p>
        )}
      </div>
    </section>
  );
}
