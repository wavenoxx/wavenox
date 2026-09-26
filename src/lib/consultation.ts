/**
 * Lightweight event dispatcher for the consultation drawer.
 * Decoupled from the React component to avoid bundling heavy drawer components
 * and zod into initial entry chunks.
 */

export const CONSULTATION_EVENT = "open-wavenox-consultation";

export function openConsultationDrawer(initialTier?: string) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(CONSULTATION_EVENT, { detail: { tier: initialTier } }));
  }
}
