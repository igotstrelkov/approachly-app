"use client";

import Script from "next/script";

// Privacy-friendly analytics (Plausible). Auto-tracks pageviews; custom events
// (CompleteRegistration, RepLogged, FirstRep, GotNumber, OnboardingStarted) fire
// from lib/analytics.ts alongside the Meta Pixel. This is Couragely's site script.
export default function Plausible() {
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
