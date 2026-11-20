import * as React from "react";
import type { SpecCategory } from "./SpecsDrawer";

export interface SpecsGridProps {
  id?: string;
  title: string;
  subtitle?: string;
  categories: SpecCategory[];
  footnote?: React.ReactNode;
  className?: string;
}

export function SpecsGrid({
  id,
  title,
  subtitle,
  categories,
  footnote,
  className = "",
}: SpecsGridProps) {
  return (
    <section
      id={id}
      data-theme="dark"
      className={`relative w-full bg-[#000000] text-[#FFFFFF] py-20 sm:py-24 lg:py-28 scroll-mt-14 ${className}`}
    >
      <div className="w-full max-w-[1116px] mx-auto px-6 md:px-8 xl:px-0">
        <div className="space-y-3 pb-10 sm:pb-12">
          <h2 className="text-[30px] sm:text-[38px] lg:text-[44px] font-medium tracking-[-0.026em] leading-[1.12] text-[#FFFFFF]">
            {title}
          </h2>
          {subtitle && (
            <p className="text-[15px] sm:text-[17px] text-[#A2A3A5] leading-[1.55] max-w-[60ch]">
              {subtitle}
            </p>
          )}
        </div>

        <div className="divide-y divide-white/15 border-t border-white/15">
          {categories.map((category) => (
            <div key={category.title} className="py-10 sm:py-12 space-y-6 sm:space-y-8">
              <h3 className="text-[19px] sm:text-[21px] font-medium tracking-[-0.015em] text-[#FFFFFF]">
                {category.title}
              </h3>

              <dl className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 sm:gap-x-8 gap-y-6 sm:gap-y-8">
                {category.items.map((item) => (
                  <div key={`${category.title}-${item.label}`} className="space-y-1.5 min-w-0">
                    <dt className="text-[13px] sm:text-[14px] font-medium leading-[1.4] text-[#A2A3A5]">
                      {item.label}
                    </dt>
                    <dd className="text-[14px] sm:text-[15px] font-normal leading-[1.45] text-[#FFFFFF] tabular-nums">
                      {item.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </div>

        {footnote && (
          <p className="mt-8 pt-6 border-t border-white/15 text-[12px] text-[#A2A3A5] leading-[1.6] max-w-[78ch]">
            {footnote}
          </p>
        )}
      </div>
    </section>
  );
}
