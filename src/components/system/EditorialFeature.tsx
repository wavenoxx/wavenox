import * as React from "react";
import { Media, type MediaDescriptor } from "./Media";
import { Reveal } from "./Reveal";

export interface EditorialCardItem {
  id?: string;
  icon?: React.ReactNode;
  metric?: string;
  title: string;
  description: string;
}

export interface EditorialFeatureProps {
  id?: string;
  secondaryAnchorId?: string;
  media?: MediaDescriptor | string;
  alt?: string;
  objectPosition?: string;
  /** Optional custom media slot (e.g. OEM inverter console showcase) instead of a photograph */
  customMedia?: React.ReactNode;
  title: React.ReactNode;
  lead?: React.ReactNode;
  actions?: React.ReactNode;
  cards?: EditorialCardItem[];
  cardColumns?: 3 | 4;
  footnote?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export function EditorialFeature({
  id,
  secondaryAnchorId,
  media,
  alt = "",
  objectPosition = "center",
  customMedia,
  title,
  lead,
  actions,
  cards,
  cardColumns = 3,
  footnote,
  children,
  className = "",
}: EditorialFeatureProps) {
  const cardGridClass =
    cardColumns === 4 ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" : "grid-cols-1 md:grid-cols-3";

  return (
    <section
      id={id}
      data-theme="light"
      className={`relative w-full bg-[#FFFFFF] text-[#171A20] pt-16 sm:pt-24 lg:pt-32 pb-8 sm:pb-12 lg:pb-16 scroll-mt-14 ${className}`}
    >
      {secondaryAnchorId && (
        <span id={secondaryAnchorId} className="block scroll-mt-20" aria-hidden="true" />
      )}

      {/* Unobstructed Monumental Media Frame: 16:9 inset on Desktop -> Full-bleed 4:5 on Mobile */}
      {media && (
        <div className="w-full max-w-[1344px] mx-auto px-0 md:px-8 lg:px-12">
          <div className="relative w-full aspect-[4/5] md:aspect-[16/9] overflow-hidden rounded-none md:rounded-[8px] bg-[#F4F4F4]">
            <Media
              media={media}
              alt={alt}
              objectPosition={objectPosition}
              sizes="(max-width: 768px) 100vw, (max-width: 1344px) 94vw, 1344px"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}

      {customMedia && (
        <div className="w-full max-w-[1344px] mx-auto px-5 sm:px-6 md:px-8 lg:px-12">
          {customMedia}
        </div>
      )}

      {/* Left-Aligned Editorial Typography & Feature Cards within 1116px Architectural Measure */}
      <div
        className={`w-full max-w-[1116px] mx-auto px-6 md:px-8 xl:px-0 ${
          media || customMedia ? "mt-10 sm:mt-14 lg:mt-16" : ""
        }`}
      >
        <Reveal>
          <div className="max-w-[780px] space-y-4 sm:space-y-5">
            <h2 className="text-[30px] sm:text-[40px] lg:text-[48px] font-medium tracking-[-0.028em] leading-[1.12] text-[#171A20] text-balance">
              {title}
            </h2>
            {lead && (
              <p className="text-[16px] sm:text-[18px] lg:text-[20px] font-normal leading-[1.52] text-[#5C5E62] text-pretty">
                {lead}
              </p>
            )}
            {actions && <div className="pt-2 flex flex-wrap items-center gap-3">{actions}</div>}
          </div>
        </Reveal>

        {cards && cards.length > 0 && (
          <div className={`grid ${cardGridClass} gap-4 sm:gap-6 mt-10 sm:mt-12 lg:mt-14`}>
            {cards.map((card, idx) => (
              <article
                key={card.id || `${card.title}-${idx}`}
                className="rounded-[8px] bg-[#F4F4F4] p-6 sm:p-7 flex flex-col justify-between gap-4"
              >
                <div className="space-y-3">
                  {card.icon && (
                    <div className="text-[#171A20] flex items-center" aria-hidden="true">
                      {card.icon}
                    </div>
                  )}
                  {card.metric && (
                    <div className="text-[26px] sm:text-[30px] font-medium tracking-[-0.024em] leading-[1.1] tabular-nums text-[#171A20]">
                      {card.metric}
                    </div>
                  )}
                  <h3 className="text-[22px] sm:text-[24px] lg:text-[26px] font-medium tracking-[-0.02em] leading-[1.2] text-[#171A20]">
                    {card.title}
                  </h3>
                </div>
                <p className="text-[15px] sm:text-[16px] lg:text-[17px] font-normal leading-[1.5] text-[#5C5E62] text-pretty">
                  {card.description}
                </p>
              </article>
            ))}
          </div>
        )}

        {children && <div className="mt-10 sm:mt-12 lg:mt-14">{children}</div>}

        {footnote && (
          <p className="mt-6 text-[12px] text-[#5C5E62] leading-[1.55] max-w-[78ch]">{footnote}</p>
        )}
      </div>
    </section>
  );
}
