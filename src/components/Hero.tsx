import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight, Menu, X } from "lucide-react";
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
        <span style={{ color: "#F57C00" }}>Absolute</span> power.
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
        Your roof, your greatest <span style={{ color: "#F57C00" }}>asset</span>
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

const navLinks = ["Home", "Residential", "Commercial", "Contact"];

export function Hero() {
  const [index, setIndex] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
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

      {/* Header */}
      <header className="relative z-30">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-6 md:px-12 md:py-8">
          <a
            href="#"
            className="text-xl font-black uppercase tracking-[0.35em] md:text-2xl"
          >
            WAVENOX
          </a>

          <nav className="hidden items-center gap-10 md:flex">
            {navLinks.map((l) => (
              <a
                key={l}
                href="#"
                className="text-sm font-medium tracking-wide text-white/80 transition-colors hover:text-white"
              >
                {l}
              </a>
            ))}
          </nav>

          <button
            aria-label="Open menu"
            onClick={() => setMenuOpen(true)}
            className="grid h-10 w-10 place-items-center rounded-md border border-white/20 md:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm md:hidden"
          >
            <div className="flex items-center justify-between px-6 py-6">
              <span className="text-xl font-black uppercase tracking-[0.35em]">WAVENOX</span>
              <button
                aria-label="Close menu"
                onClick={() => setMenuOpen(false)}
                className="grid h-10 w-10 place-items-center rounded-md border border-white/20"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex flex-col gap-6 px-8 pt-10">
              {navLinks.map((l) => (
                <a
                  key={l}
                  href="#"
                  onClick={() => setMenuOpen(false)}
                  className="text-3xl font-semibold tracking-tight text-white/90"
                >
                  {l}
                </a>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <div className="relative z-20 mx-auto flex h-[calc(100vh-92px)] max-w-[1400px] flex-col justify-center px-6 md:px-12">
        <div className="max-w-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <h1 className="text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                {current.headline}
              </h1>
              <p className="mt-6 max-w-xl text-sm leading-relaxed text-white/75 md:text-base">
                {current.sub}
              </p>
            </motion.div>
          </AnimatePresence>

          <a
            href="#"
            className="group relative mt-8 inline-flex w-auto max-w-fit items-center justify-center gap-2 overflow-hidden border border-white px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] transition-colors duration-300 hover:text-black md:mt-10 md:gap-3 md:px-8 md:py-4 md:text-sm"
          >
            <span className="absolute inset-0 -z-0 origin-left scale-x-0 bg-white transition-transform duration-500 ease-out group-hover:scale-x-100" />
            <span className="relative z-10">Unlock Energy Independence</span>
            <ArrowRight
              className="relative z-10 h-3.5 w-3.5 transition-transform group-hover:translate-x-1 md:h-4 md:w-4"
              style={{ color: "#F57C00" }}
            />
          </a>
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
