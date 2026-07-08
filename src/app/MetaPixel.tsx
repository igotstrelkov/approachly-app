"use client";

import Script from "next/script";
import { useNotHeadless } from "./useNotHeadless";

// Loads the Meta Pixel base code app-wide and fires PageView. Conversion + custom
// events (CompleteRegistration, RepLogged, …) fire from lib/analytics.ts at the real
// moments — NOT here. Same pixel as the marketing landing so both surfaces feed
// one funnel. Gated on NEXT_PUBLIC_FB_PIXEL_ID so the app runs fine with no pixel.
//
// The JS pixel (base code + PageView) is skipped under automation/headless
// (navigator.webdriver) so bot pageviews don't pollute the funnel — matching the
// custom-event guard in lib/analytics.ts. The <noscript> img stays for genuine
// no-JS users; headless browsers run JS, so they're caught on the JS path.
const PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID;

export default function MetaPixel() {
  const notHeadless = useNotHeadless();
  if (!PIXEL_ID) return null;
  return (
    <>
      {notHeadless && (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window,document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init','${PIXEL_ID}');
        fbq('track','PageView');`}
        </Script>
      )}
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          alt=""
          src={`https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1`}
        />
      </noscript>
    </>
  );
}
