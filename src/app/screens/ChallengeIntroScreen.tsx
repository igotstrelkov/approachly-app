"use client";
import { useApp } from "../AppContext";
import { DISPLAY, GO_GRAD, MONO, eyebrow } from "../theme";

// The onboarding hand-off: instead of dropping a freshly-onboarded user on Home,
// hand them into the challenge — the activation moment. Reuses the --go accent
// and the card/eyebrow patterns; no new design system.
const CHAPTERS = [
  {
    n: 1,
    label: "Warm contact",
    desc: "Eye contact, a smile, a quick hello. The freeze starts to lift.",
  },
  {
    n: 2,
    label: "Real conversation",
    desc: "A compliment, then a 30-second chat. You're connecting.",
  },
  {
    n: 3,
    label: "The ask",
    desc: "Open, connect, and make the ask — the complete approach.",
  },
];

export function ChallengeIntroScreen() {
  const { nav, skipChallenge } = useApp();
  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "calc(env(safe-area-inset-top, 0px) + 32px) 24px 32px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ ...eyebrow("var(--go)"), letterSpacing: 2, marginBottom: 10 }}>
        Your 7-Day Challenge
      </div>
      <div
        style={{
          fontFamily: DISPLAY,
          fontSize: 34,
          textTransform: "uppercase",
          color: "var(--bone)",
          lineHeight: 0.98,
          marginBottom: 12,
        }}
      >
        Beat the freeze
        <br />
        in 7 days.
      </div>
      <div
        style={{
          fontSize: 14.5,
          color: "var(--ash)",
          lineHeight: 1.5,
          marginBottom: 30,
        }}
      >
        One small mission at a time, at your pace. A day only moves when you do
        it — no clock, no streak to break.
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {CHAPTERS.map((c) => (
          <div
            key={c.n}
            style={{
              display: "flex",
              gap: 14,
              alignItems: "center",
              background: "var(--charcoal)",
              border: "1px solid var(--slate)",
              borderRadius: 16,
              padding: "16px 18px",
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                flexShrink: 0,
                borderRadius: 11,
                background: "rgba(52,209,126,.14)",
                border: "1px solid var(--go)",
                color: "var(--go)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: MONO,
                fontSize: 14,
                fontWeight: 700,
              }}
            >
              {c.n}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{ fontSize: 15, fontWeight: 700, color: "var(--bone)" }}
              >
                {c.label}
              </div>
              <div
                style={{ fontSize: 12.5, color: "var(--ash)", marginTop: 2 }}
              >
                {c.desc}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ flex: 1, minHeight: 28 }} />

      <button
        onClick={() => nav("home")}
        style={{
          width: "100%",
          border: "none",
          borderRadius: 20,
          padding: 19,
          cursor: "pointer",
          background: GO_GRAD,
          color: "#07130C",
          fontFamily: DISPLAY,
          fontSize: 22,
          textTransform: "uppercase",
        }}
      >
        Start Day 1 →
      </button>
      <button
        onClick={skipChallenge}
        style={{
          width: "100%",
          background: "none",
          border: "none",
          padding: "16px 0 4px",
          color: "var(--ash)",
          fontSize: 13.5,
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        Skip — just let me log freely
      </button>
    </div>
  );
}
