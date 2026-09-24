import * as React from "react";

export interface RevealProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  yOffset?: number;
  immediate?: boolean;
}

export function Reveal({
  children,
  className = "",
}: RevealProps) {
  return <div className={className}>{children}</div>;
}
