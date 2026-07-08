"use client";

import Script from "next/script";
import { useNotHeadless } from "./useNotHeadless";

// Privacy-friendly analytics (Plausible). Auto-tracks pageviews; custom events
// (CompleteRegistration, RepLogged, FirstRep, GotNumber, OnboardingStarted) fire
// from lib/analytics.ts alongside the Meta Pixel. This is Couragely's site script.
//
// Not loaded (so its pageview never fires) when:
//   • NEXT_PUBLIC_PLAUSIBLE_DISABLED === "true" — set on the Vercel Preview (and
//     Development) scopes so preview builds don't pollute stats; prod stays on
//     with zero config. (Plausible already ignores localhost by default.)
//   • the visit is automation/headless (navigator.webdriver) — suppresses bot
//     pageviews, matching the custom-event guard in lib/analytics.ts.
export default function Plausible() {
  const notHeadless = useNotHeadless();
  if (process.env.NEXT_PUBLIC_PLAUSIBLE_DISABLED === "true" || !notHeadless) {
    return null;
  }
  return (
    <>
      <Script
        src="https://plausible.io/js/pa-Mvc-qm618g527moiscWwH.js"
        strategy="afterInteractive"
      />
      <Script id="plausible-init" strategy="afterInteractive">
        {`window.plausible=window.plausible||function(){(plausible.q=plausible.q||[]).push(arguments)},plausible.init=plausible.init||function(i){plausible.o=i||{}};plausible.init()`}
      </Script>
    </>
  );
}
