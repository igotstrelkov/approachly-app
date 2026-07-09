// Unified analytics — fans each event out to BOTH Meta Pixel (fbq) and Plausible.
// Client-only, SSR-safe; each destination no-ops if its script isn't loaded.
// Base pixel + PageView live in app/MetaPixel.tsx; Plausible loader in app/Plausible.tsx.
type Params = Record<string, string | number | boolean>;

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    plausible?: (
      event: string,
      opts?: { props?: Params; callback?: () => void },
    ) => void;
  }
}

function meta(kind: "track" | "trackCustom", event: string, params?: Params) {
  if (typeof window !== "undefined" && typeof window.fbq === "function") {
    window.fbq(kind, event, params);
  }
}

function plausible(event: string, params?: Params) {
  if (typeof window !== "undefined" && typeof window.plausible === "function") {
    window.plausible(event, params ? { props: params } : undefined);
  }
}

// Suppress automation/headless traffic (Playwright, crawlers, bots) so it never
// pollutes conversion data. navigator.webdriver is true under browser automation.
function suppressed() {
  return typeof navigator !== "undefined" && navigator.webdriver === true;
}

/** Standard Meta event (reserved name, e.g. "CompleteRegistration") + Plausible goal. */
export function track(event: string, params?: Params) {
  if (suppressed()) return;
  meta("track", event, params);
  plausible(event, params);
}

/** Custom Meta event (any name, e.g. "RepLogged") + Plausible goal. */
export function trackCustom(event: string, params?: Params) {
  if (suppressed()) return;
  meta("trackCustom", event, params);
  plausible(event, params);
}

/**
 * Meta Advanced Matching — attach the signed-in user's email to the pixel so
 * events match to a person (better attribution + higher event match quality).
 * The pixel SHA-256-hashes `em` itself before sending; we pass the raw value.
 * Re-calling init with the same id just updates the matching data (no extra
 * PageView). Pixel-only — Plausible is cookieless and does no PII matching.
 */
export function identify(email?: string | null) {
  if (suppressed() || !email) return;
  const id = process.env.NEXT_PUBLIC_FB_PIXEL_ID;
  if (!id) return;
  if (typeof window !== "undefined" && typeof window.fbq === "function") {
    window.fbq("init", id, { em: email });
  }
}
