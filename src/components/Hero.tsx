import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { openConsultationDrawer } from "./ConsultationDrawer";
import slide1 from "@/assets/slide-01.jpg";
import slide2 from "@/assets/slide-02.jpg";
import slide3 from "@/assets/slide-03.jpg";
import slide4 from "@/assets/slide-04.jpg";
import slide1Mobile from "@/assets/slide-01-mobile.jpg";
import slide2Mobile from "@/assets/slide-02-mobile.jpg";
import slide3Mobile from "@/assets/slide-03-mobile.jpg";
import slide4Mobile from "@/assets/slide-04-mobile.jpg";

type Slide = {
  desktopImage: string;
  mobileImage: string;
  headline: React.ReactNode;
  sub: string;
};

const slides: Slide[] = [
  {
    desktopImage: slide1,
    mobileImage: slide1Mobile,
    headline: (
      <>
        <span style={{ color: "#F57C00" }}>Absolute</span> power
        <br className="hidden sm:block" /> Zero compromise
      </>
    ),
    sub: "Deploying world-class solar infrastructure for residential and commercial assets. Superior engineering, seamless execution, and absolute energy independence.",
  },
  {
    desktopImage: slide2,
    mobileImage: slide2Mobile,
    headline: (
      <>
        <span style={{ color: "#F57C00" }}>Engineered</span> for the future
      </>
    ),
    sub: "Intelligent roof architecture that actively monitors and maximizes your energy generation. Real-time data, AI-driven efficiency, and complete control.",
  },
  {
    desktopImage: slide3,
    mobileImage: slide3Mobile,
    headline: (
      <>
        Your roof your greatest <span style={{ color: "#F57C00" }}>asset</span>
      </>
    ),
    sub: "Turn sunlight into a high-yielding financial investment. Eliminate rising electricity costs instantly and secure maximum government subsidies across Hyderabad.",
  },
  {
    desktopImage: slide4,
    mobileImage: slide4Mobile,
    headline: (
      <>
        <span style={{ color: "#F57C00" }}>Built</span> to last a lifetime
      </>
    ),
    sub: "From ultra-premium villas to massive commercial hubs, Wavenox delivers Tier-1 solar performance backed by an ironclad 25-year structural warranty.",
  },
];

export function Hero() {
  const [index, setIndex] = useState(0);
  const total = slides.length;

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % total), 6500);
    return () => clearInterval(id);
  }, [total]);

  const go = (dir: 1 | -1) =>
    setIndex((i) => (i + dir + total) % total);

  const current = slides[index];

  return (
    <section className="relative h-screen w-full overflow-hidden bg-black text-white">
      {/* Background slides — stacked, crossfade via opacity */}
      <div className="absolute inset-0">
        {slides.map((s, i) => (
          <div
            key={i}
            className="absolute inset-0 transition-opacity duration-1000 ease-out"
            style={{ opacity: i === index ? 1 : 0 }}
            aria-hidden={i !== index}
          >
            <img
              src={s.desktopImage}
              alt=""
              className="hidden md:block h-full w-full object-cover"
              draggable={false}
            />
            <img
              src={s.mobileImage}
              alt=""
              className="block md:hidden h-full w-full object-cover"
              draggable={false}
            />
          </div>
        ))}
      </div>

      {/* Gradient overlay: strong left → transparent right (desktop); stronger bottom on mobile */}
      <div
        className="absolute inset-0 hidden md:block"
        style={{
          background:
            "linear-gradient(90deg, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.78) 30%, rgba(0,0,0,0.45) 60%, rgba(0,0,0,0.05) 100%)",
        }}
      />
      <div
        className="absolute inset-0 md:hidden"
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.35) 40%, rgba(0,0,0,0.85) 100%)",
        }}
      />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-linear-to-t from-black/70 to-transparent" />

      {/* Content */}
      <div className="relative z-20 mx-auto flex h-screen max-w-[1400px] flex-col justify-center px-6 md:px-12">
        <div className="flex w-full flex-col items-start justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <h1 className="max-w-[280px] text-balance text-3xl font-bold leading-[1.05] tracking-tight sm:max-w-xs sm:text-4xl md:max-w-2xl md:text-5xl lg:text-6xl">
                {current.headline}
              </h1>
              <p className="mt-6 max-w-xl text-sm leading-relaxed text-white/75 md:text-base">
                {current.sub}
              </p>
            </motion.div>
          </AnimatePresence>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="mt-8 w-full sm:w-auto md:mt-10"
          >
            <button
              type="button"
              onClick={() => openConsultationDrawer("villa")}
              className="group inline-flex w-full sm:w-auto items-center justify-center gap-3 border border-white/40 bg-transparent px-8 py-3.5 text-xs font-bold uppercase tracking-[0.25em] text-white transition-all duration-300 hover:border-white hover:bg-white hover:text-black active:border-[#F57C00] active:bg-[#F57C00] active:text-black cursor-pointer"
            >
              <span>Unlock Energy Independence</span>
              <span className="text-[#F57C00] transition-colors duration-300 group-hover:text-black group-active:text-black font-mono text-sm">
                →
              </span>
            </button>
          </motion.div>
        </div>
      </div>

      {/* Carousel controls */}
      <div className="absolute bottom-8 left-6 z-20 md:bottom-12 md:left-12">
        <div className="flex items-center gap-6">
          <div className="font-mono text-sm tracking-widest">
            <span className="text-white">{String(index + 1).padStart(2, "0")}</span>
            <span className="text-white/40"> / {String(total).padStart(2, "0")}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              aria-label="Previous slide"
              onClick={() => go(-1)}
              className="grid h-10 w-10 place-items-center border border-white/40 text-white transition-colors hover:border-white active:border-[#F57C00] active:bg-[#F57C00] active:text-black"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              aria-label="Next slide"
              onClick={() => go(1)}
              className="grid h-10 w-10 place-items-center border border-white/40 text-white transition-colors hover:border-white active:border-[#F57C00] active:bg-[#F57C00] active:text-black"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-5 flex gap-1.5">
          {slides.map((_, i) => (
            <button
              key={i}
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => setIndex(i)}
              className="relative h-[2px] w-14 overflow-hidden bg-white/20"
            >
              <motion.span
                className="absolute inset-y-0 left-0 bg-white"
                initial={{ width: 0 }}
                animate={{
                  width: i < index ? "100%" : i === index ? "100%" : "0%",
                }}
                transition={{ duration: i === index ? 6.5 : 0.3, ease: "linear" }}
                key={`${i}-${index}`}
              />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
