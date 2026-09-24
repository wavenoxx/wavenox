import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";

export interface RevealProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  yOffset?: number;
  immediate?: boolean;
}

export function Reveal({
  children,
  delay = 0,
  className = "",
  yOffset = 12,
  immediate = false,
}: RevealProps) {
  const prefersReduced = useReducedMotion();

  if (prefersReduced || immediate) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: yOffset }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px" }}
      transition={{
        duration: 0.4,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
