import type { CSSProperties } from "react";

// Design tokens — mirror the CSS custom properties defined in globals.css.
export const DISPLAY = "var(--font-display), Anton, sans-serif";
export const MONO = "var(--font-space-mono), 'Space Mono', monospace";
export const GO_GRAD = "linear-gradient(180deg,#3BE389,var(--go))";

// shared small styles
export const iconBtn: CSSProperties = {
  width: 38,
  height: 38,
  borderRadius: 11,
  border: "1px solid var(--slate)",
  background: "var(--charcoal)",
  color: "var(--ash)",
  fontSize: 18,
  cursor: "pointer",
};
export const eyebrow = (color: string): CSSProperties => ({
  fontFamily: MONO,
  fontSize: 11,
  letterSpacing: 2.4,
  color,
  textTransform: "uppercase",
});
