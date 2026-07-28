import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValue } from "framer-motion";

export function EclipseGateway({ onUnlock }: { onUnlock: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const orbRef = useRef<HTMLDivElement>(null);
  const [locked, setLocked] = useState(true);
  const [flash, setFlash] = useState(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);


  useEffect(() => {
    // Lock body scroll while gateway is active
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const handleDragEnd = () => {
    if (!ringRef.current || !orbRef.current) return;
    const ring = ringRef.current.getBoundingClientRect();
    const orb = orbRef.current.getBoundingClientRect();
    const ringCx = ring.left + ring.width / 2;
    const ringCy = ring.top + ring.height / 2;
    const orbCx = orb.left + orb.width / 2;
    const orbCy = orb.top + orb.height / 2;
    const dist = Math.hypot(orbCx - ringCx, orbCy - ringCy);

    if (dist < ring.width / 2 - 8) {
      // Snap to center
      const currentX = x.get();
      const currentY = y.get();
      x.set(currentX + (ringCx - orbCx));
      y.set(currentY + (ringCy - orbCy));
      setFlash(true);
      setTimeout(() => {
        setLocked(false);
        setTimeout(onUnlock, 1400);
      }, 550);
    }
  };

  return (
    <AnimatePresence>
      {locked && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.2 }}
          transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[100] bg-black overflow-hidden"
        >
          {/* subtle radial vignette */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at center, rgba(245,124,0,0.06) 0%, rgba(0,0,0,0) 55%)",
            }}
          />

          {/* Centerpiece: ring + typography */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="relative">
              {/* rotating faint aura */}
              <motion.div
                aria-hidden
                className="absolute -inset-8 rounded-full"
                style={{
                  background:
                    "conic-gradient(from 0deg, rgba(245,124,0,0.18), transparent 30%, transparent 60%, rgba(245,124,0,0.12), transparent)",
                  filter: "blur(20px)",
                }}
                animate={{ rotate: 360 }}
                transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
              />
              <div
                ref={ringRef}
                className="relative h-64 w-64 rounded-full border border-white/10 bg-white/[0.03] backdrop-blur-2xl"
                style={{
                  boxShadow:
                    "inset 0 0 60px rgba(255,255,255,0.04), 0 0 80px rgba(0,0,0,0.6)",
                }}
              >
                <div className="absolute inset-4 rounded-full border border-white/5" />
                <AnimatePresence>
                  {flash && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.3 }}
                      animate={{ opacity: [0, 1, 0.8], scale: [0.3, 1.05, 1] }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.9, ease: "easeOut" }}
                      className="absolute inset-0 rounded-full"
                      style={{
                        background:
                          "radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(245,124,0,0.9) 40%, rgba(245,124,0,0) 75%)",
                        boxShadow:
                          "0 0 120px 40px rgba(255,255,255,0.7), 0 0 240px 80px rgba(245,124,0,0.6)",
                      }}
                    />
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="mt-14 flex flex-col items-center">
              <h1 className="text-2xl md:text-3xl font-light tracking-[0.55em] text-white">
                W A V E N O X
              </h1>
              <p className="mt-4 text-[10px] md:text-xs uppercase tracking-[0.4em] text-gray-500">
                {flash ? "Alignment Confirmed" : "Align to Initialize"}
              </p>
            </div>
          </div>

          {/* Draggable orb layer */}
          <motion.div
            drag
            dragConstraints={{
              left: -window.innerWidth,
              right: window.innerWidth,
              top: -window.innerHeight,
              bottom: window.innerHeight,
            }}
            dragElastic={0.15}
            dragMomentum={false}
            onDragEnd={handleDragEnd}
            style={{ x, y }}
            className="absolute z-10 cursor-grab active:cursor-grabbing"
            initial={{
              right: "12%",
              bottom: "12%",
            }}
            animate={
              flash
                ? { scale: 6, opacity: 0 }
                : { scale: [1, 1.06, 1] }
            }
            transition={
              flash
                ? { duration: 0.6, ease: "easeIn" }
                : { duration: 2.4, repeat: Infinity, ease: "easeInOut" }
            }
          >
            <div ref={orbRef} className="relative h-16 w-16">
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background:
                    "radial-gradient(circle at 35% 35%, #FFD9A8 0%, #F57C00 45%, #8a3f00 100%)",
                  boxShadow:
                    "0 0 40px 8px rgba(245,124,0,0.7), 0 0 100px 30px rgba(245,124,0,0.35)",
                }}
              />
              <div
                className="absolute -inset-6 rounded-full opacity-70"
                style={{
                  background:
                    "radial-gradient(circle, rgba(245,124,0,0.5) 0%, rgba(245,124,0,0) 70%)",
                  filter: "blur(10px)",
                }}
              />
            </div>
          </motion.div>

          {/* Hint */}
          <div className="pointer-events-none absolute inset-x-0 bottom-8 flex justify-center">
            <p className="text-[10px] uppercase tracking-[0.4em] text-gray-600">
              Drag the energy core into the ring
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
