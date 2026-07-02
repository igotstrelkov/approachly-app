import type { Metadata } from "next";
import type { CSSProperties } from "react";

export const metadata: Metadata = { title: "Privacy Policy — Couragely" };

const DISPLAY = "var(--font-display), Anton, sans-serif";
const MONO = "var(--font-space-mono), 'Space Mono', monospace";

const wrap: CSSProperties = {
  maxWidth: 640,
  margin: "0 auto",
  padding: "calc(env(safe-area-inset-top, 0px) + 36px) 22px 72px",
  color: "#c7ccd2",
};
const h1: CSSProperties = {
  fontFamily: DISPLAY,
  fontSize: 32,
  textTransform: "uppercase",
  color: "var(--bone)",
  margin: "16px 0 4px",
};
const h2: CSSProperties = {
  fontFamily: DISPLAY,
  fontSize: 18,
  textTransform: "uppercase",
  color: "var(--bone)",
  margin: "28px 0 8px",
};
const p: CSSProperties = { fontSize: 15, lineHeight: 1.6, margin: "0 0 12px" };
const ul: CSSProperties = { paddingLeft: 20, margin: "0 0 12px" };
const li: CSSProperties = { fontSize: 15, lineHeight: 1.6, marginBottom: 8 };
const muted: CSSProperties = { color: "var(--ash)", fontSize: 13 };
const back: CSSProperties = {
  color: "var(--go)",
  fontFamily: MONO,
  fontSize: 12,
  textDecoration: "none",
};

export default function Privacy() {
  return (
    <div style={wrap}>
      <a href="/" style={back}>
        ← Back to Couragely
      </a>
      <h1 style={h1}>Privacy Policy</h1>
      <p style={muted}>Last updated: July 2026</p>

      <p style={p}>
        Couragely (&ldquo;we&rdquo;) is a courage-training app that helps you
        approach people in real life. This page explains what we collect, why,
        and your choices. We&apos;re privacy-first: we collect the minimum needed
        to run the app, and we never sell your data.
      </p>

      <h2 style={h2}>What we collect</h2>
      <ul style={ul}>
        <li style={li}>
          <b>Account:</b> your email and sign-in details, handled by our
          authentication provider (Clerk).
        </li>
        <li style={li}>
          <b>App data you create:</b> your onboarding answers (age range, goals,
          baseline anxiety) and the reps you log — how it went, your anxiety
          rating, an optional note, and whether you got a number — plus your
          streak, XP, and progress.
        </li>
        <li style={li}>
          <b>If you enable weekly reminders:</b> a push-notification
          subscription for your device.
        </li>
        <li style={li}>
          <b>Automatically:</b> basic technical data (IP address,
          browser/user-agent, referring URL, and UTM campaign tags) used to keep
          the app secure and to measure ad performance.
        </li>
      </ul>

      <h2 style={h2}>How we use it</h2>
      <ul style={ul}>
        <li style={li}>
          To run the app — track your reps, show your progress, and send the
          reminders you opt into.
        </li>
        <li style={li}>
          To understand what helps people and which messages resonate, so we can
          improve the product and our ads.
        </li>
      </ul>

      <h2 style={h2}>Analytics</h2>
      <p style={p}>
        We use privacy-friendly analytics (Plausible — no cookies, no cross-site
        tracking) and the Meta Pixel to measure how our ads perform and how the
        app is used. You can block these with standard browser privacy tools or
        an ad blocker without affecting the app.
      </p>

      <h2 style={h2}>Sharing</h2>
      <p style={p}>
        We do not sell your personal information. We share data only with the
        service providers that operate the app — authentication (Clerk),
        backend and hosting (Convex, Vercel), and analytics (Plausible, Meta) —
        and only as needed to provide the service.
      </p>

      <h2 style={h2}>Your choices</h2>
      <p style={p}>
        You can turn weekly reminders off inside the app at any time, and you can
        request access to or deletion of your account and data by contacting us.
        Deleting your account removes your logged reps and profile.
      </p>

      <h2 style={h2}>Not medical advice</h2>
      <p style={p}>
        Couragely helps you build confidence through practice; it is not therapy
        or medical advice. If you&apos;re struggling with severe anxiety, please
        reach out to a qualified professional.
      </p>

      <h2 style={h2}>Contact</h2>
      <p style={p}>
        Questions or requests (including data access or deletion)? Email us at{" "}
        <a href="mailto:hello@couragely.app" style={{ color: "var(--go)" }}>
          hello@couragely.app
        </a>
        .
      </p>

      <p style={{ ...muted, marginTop: 28 }}>
        18+ · adults approaching adults.
      </p>
    </div>
  );
}
