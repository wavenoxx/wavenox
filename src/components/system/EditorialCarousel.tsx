import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Media, type MediaDescriptor } from "./Media";

export interface EditorialSlide {
  id: string;
  media: MediaDescriptor | string;
  alt?: string;
  objectPosition?: string;
  title: string;
  description: string;
}

export interface EditorialCarouselProps {
  slides: EditorialSlide[];
  label: string;
  className?: string;
}

export function EditorialCarousel({ slides, label, className = "" }: EditorialCarouselProps) {
  const trackRef = React.useRef<HTMLDivElement>(null);
  const prevBtnRef = React.useRef<HTMLButtonElement>(null);
  const nextBtnRef = React.useRef<HTMLButtonElement>(null);
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [statusMessage, setStatusMessage] = React.useState("");
  const lastSettledIndexRef = React.useRef(0);
  const pendingTargetRef = React.useRef<number | null>(null);
  const settleTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const getNearestIndex = React.useCallback(() => {
    const track = trackRef.current;
    if (!track) return 0;
    const children = Array.from(track.children) as HTMLElement[];
    if (children.length === 0) return 0;

    const trackRect = track.getBoundingClientRect();
    let bestIdx = 0;
    let bestDist = Infinity;

    for (let i = 0; i < children.length; i++) {
      const childRect = children[i].getBoundingClientRect();
      const dist = Math.abs(childRect.left - trackRect.left);
      if (dist < bestDist) {
        bestDist = dist;
        bestIdx = i;
      }
    }
    return bestIdx;
  }, []);

  const handleSettle = React.useCallback(() => {
    pendingTargetRef.current = null;
    const idx = getNearestIndex();
    setActiveIndex(idx);
    if (idx !== lastSettledIndexRef.current) {
      lastSettledIndexRef.current = idx;
      setStatusMessage(`Slide ${idx + 1} of ${slides.length}: ${slides[idx]?.title || ""}`);
    }
  }, [getNearestIndex, slides]);

  React.useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let rafId = 0;
    const supportsScrollEnd = "onscrollend" in window;

    const onScroll = () => {
      if (pendingTargetRef.current === null && !rafId) {
        rafId = window.requestAnimationFrame(() => {
          rafId = 0;
          const nearest = getNearestIndex();
          setActiveIndex((prev) => (prev === nearest ? prev : nearest));
        });
      }

      if (!supportsScrollEnd) {
        if (settleTimerRef.current) clearTimeout(settleTimerRef.current);
        settleTimerRef.current = setTimeout(handleSettle, 140);
      }
    };

    const onScrollEnd = () => {
      handleSettle();
    };

    track.addEventListener("scroll", onScroll, { passive: true });
    if (supportsScrollEnd) {
      track.addEventListener("scrollend", onScrollEnd, { passive: true });
    }

    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      if (settleTimerRef.current) clearTimeout(settleTimerRef.current);
      track.removeEventListener("scroll", onScroll);
      if (supportsScrollEnd) {
        track.removeEventListener("scrollend", onScrollEnd);
      }
    };
  }, [getNearestIndex, handleSettle]);

  const scrollToSlide = React.useCallback(
    (targetIdx: number) => {
      const track = trackRef.current;
      if (!track) return;
      const clamped = Math.max(0, Math.min(slides.length - 1, targetIdx));
      const slideEl = track.children[clamped] as HTMLElement | undefined;
      if (!slideEl) return;

      // Redirect focus cleanly before a control becomes disabled at an end
      if (clamped === 0 && document.activeElement === prevBtnRef.current) {
        nextBtnRef.current?.focus();
      } else if (clamped === slides.length - 1 && document.activeElement === nextBtnRef.current) {
        prevBtnRef.current?.focus();
      }

      pendingTargetRef.current = clamped;
      setActiveIndex(clamped);

      const trackRect = track.getBoundingClientRect();
      const slideRect = slideEl.getBoundingClientRect();
      const delta = slideRect.left - trackRect.left;
      const prefersReduced =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      track.scrollBy({
        left: delta,
        behavior: prefersReduced ? "auto" : "smooth",
      });

      if (!("onscrollend" in window)) {
        if (settleTimerRef.current) clearTimeout(settleTimerRef.current);
        settleTimerRef.current = setTimeout(handleSettle, 350);
      }
    },
    [slides.length, handleSettle],
  );

  const handleStep = (direction: -1 | 1) => {
    const baseIndex =
      pendingTargetRef.current !== null ? pendingTargetRef.current : getNearestIndex();
    scrollToSlide(baseIndex + direction);
  };

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      className={`relative w-full ${className}`}
    >
      {/* Desktop Previous / Next Controls (DOM order before track per Modern Web Guidance) */}
      <div className="hidden md:flex items-center justify-end gap-2.5 mb-5">
        <button
          ref={prevBtnRef}
          type="button"
          onClick={() => handleStep(-1)}
          disabled={activeIndex === 0}
          aria-label="Previous slide"
          className="w-10 h-10 rounded-full bg-[#F4F4F4] border border-[#E3E4E6] text-[#171A20] inline-flex items-center justify-center transition-colors hover:bg-[#E8E9EC] disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#171A20]"
        >
          <ChevronLeft className="w-5 h-5" aria-hidden="true" />
        </button>
        <button
          ref={nextBtnRef}
          type="button"
          onClick={() => handleStep(1)}
          disabled={activeIndex === slides.length - 1}
          aria-label="Next slide"
          className="w-10 h-10 rounded-full bg-[#F4F4F4] border border-[#E3E4E6] text-[#171A20] inline-flex items-center justify-center transition-colors hover:bg-[#E8E9EC] disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#171A20]"
        >
          <ChevronRight className="w-5 h-5" aria-hidden="true" />
        </button>
      </div>

      {/* Horizontal Freeflow Track: 4:3 cards identically on Desktop and Mobile with right-edge peek */}
      <div
        ref={trackRef}
        tabIndex={0}
        role="group"
        aria-label={`${label} slides`}
        className="editorial-carousel-track gap-4 sm:gap-6 pb-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#171A20] rounded-[8px]"
      >
        {slides.map((slide, idx) => (
          <div
            key={slide.id}
            role="group"
            aria-roledescription="slide"
            aria-label={`${idx + 1} of ${slides.length}`}
            className="shrink-0 w-[84vw] sm:w-[70vw] md:w-[68%] lg:w-[740px] snap-start space-y-5"
          >
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[8px] bg-[#F4F4F4]">
              <Media
                media={slide.media}
                alt={slide.alt}
                preserveDesktopAspect={true}
                lowPriority={idx > 0}
                objectPosition={slide.objectPosition || "center"}
                sizes="(max-width: 768px) 84vw, 740px"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="space-y-2 pr-2 sm:pr-6">
              <h3 className="text-[22px] sm:text-[26px] lg:text-[28px] font-medium tracking-[-0.02em] leading-[1.2] text-[#171A20]">
                {slide.title}
              </h3>
              <p className="text-[15px] sm:text-[17px] lg:text-[18px] font-normal leading-[1.52] text-[#5C5E62] max-w-[54ch] text-pretty">
                {slide.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Polite Status Region for Assistive Technology */}
      <p className="sr-only" role="status" aria-live="polite">
        {statusMessage}
      </p>

      {/* Accessible Slide Markers (>= 24x24px touch targets + non-color width affordance) */}
      <nav aria-label={`Choose a slide in ${label}`} className="flex items-center gap-1 mt-4">
        {slides.map((slide, idx) => {
          const isCurrent = idx === activeIndex;
          return (
            <button
              key={slide.id}
              type="button"
              onClick={() => scrollToSlide(idx)}
              aria-label={`Go to slide ${idx + 1}: ${slide.title}`}
              aria-current={isCurrent ? "true" : undefined}
              className="min-w-[28px] min-h-[28px] inline-flex items-center justify-center cursor-pointer touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#171A20] rounded-full"
            >
              <span
                aria-hidden="true"
                className={`block h-2 rounded-full transition-all duration-200 ${
                  isCurrent ? "w-7 bg-[#171A20]" : "w-2 bg-[#D0D1D2] hover:bg-[#8E9094]"
                }`}
              />
            </button>
          );
        })}
      </nav>
    </div>
  );
}
