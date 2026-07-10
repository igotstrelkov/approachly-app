"use client";
import { useEffect, useState } from "react";
import { useApp } from "../AppContext";
import { DISPLAY, eyebrow, GO_GRAD, iconBtn, MONO } from "../theme";

// Box-breathing-lite, looping: inhale 4s → hold 2s → exhale 4s (10s/cycle).
// The circle scales + a synced opacity pulse; the label paces it in real text.
const BREATH = [
  { key: "in", label: "Breathe in", ms: 4000 },
  { key: "hold", label: "Hold", ms: 2000 },
  { key: "out", label: "Breathe out", ms: 4000 },
] as const;

const buzz = (p: number) => {
  try {
    navigator.vibrate?.(p);
  } catch {}
};

// Paced guided breath — the calm centerpiece of the primer. USER-PACED: it loops
// forever and never advances the flow on its own; only the pinned button starts
// the countdown. Owns its state so it only runs while the primer is mounted.
function BreathGuide({ onCycle }: { onCycle?: (n: number) => void }) {
  const [i, setI] = useState(0);
  const [reduced, setReduced] = useState(() => {
    try {
      return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const on = () => setReduced(mq.matches);
    mq.addEventListener?.("change", on);
    return () => mq.removeEventListener?.("change", on);
  }, []);

  // Advance phases on a timer; count a full cycle each time the exhale (last
  // phase) elapses. onCycle runs in the timeout callback — never inside the setI
  // updater, which React executes during render (would setState mid-render).
  useEffect(() => {
    const t = setTimeout(() => {
      setI((p) => (p + 1) % BREATH.length);
      if (i === BREATH.length - 1) onCycle?.(1);
    }, BREATH[i].ms);
    return () => clearTimeout(t);
  }, [i, onCycle]);

  // Short haptic at the start of each inhale and exhale (feature-detected).
  useEffect(() => {
    const k = BREATH[i].key;
    if (k === "in" || k === "out") buzz(15);
  }, [i]);

  const phase = BREATH[i];
  // Target the END state of the current phase so the transition animates over it.
  const grown = phase.key === "in" || phase.key === "hold";
  const dur = phase.key === "hold" ? 300 : phase.ms;
  const scale = reduced ? 1 : grown ? 1 : 0.6;
  const opacity = grown ? 1 : reduced ? 0.5 : 0.85;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 20,
      }}
    >
      <div
        aria-hidden
        style={{
          width: 200,
          height: 200,
          borderRadius: "50%",
          display: "grid",
          placeItems: "center",
          border: "2px solid rgba(255,178,62,.55)",
          boxShadow: "0 0 44px -6px rgba(255,178,62,.4)",
          transform: `scale(${scale})`,
          opacity,
          transition: `transform ${dur}ms ease-in-out, opacity ${dur}ms ease-in-out`,
          willChange: "transform, opacity",
        }}
      >
        <div
          style={{
            width: 150,
            height: 150,
            borderRadius: "50%",
            background:
              "radial-gradient(circle at 50% 40%, rgba(255,178,62,.62), rgba(255,178,62,.16))",
            boxShadow: "0 0 36px -4px rgba(255,178,62,.55)",
          }}
        />
      </div>
      <div
        aria-live="polite"
        style={{
          fontFamily: MONO,
          fontSize: 15,
          letterSpacing: 3,
          fontWeight: 700,
          color: "var(--amber)",
          textTransform: "uppercase",
        }}
      >
        {phase.label}
      </div>
    </div>
  );
}

export function HypeScreen() {
  const { nav, hypeStep, hypeGo, hypeCount, startLog, showToast } = useApp();
  // Count breaths so a non-coercive "no rush" line can fade in after ~2 cycles.
  // The primer block unmounts on countdown/go, so this resets naturally per visit.
  const [breaths, setBreaths] = useState(0);
  const showNoRush = breaths >= 2;

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(120% 70% at 50% 0%, #241a10 0%, var(--ink) 55%)",
        display: "flex",
        flexDirection: "column",
        padding: "calc(env(safe-area-inset-top, 0px) + 20px) 24px 34px",
      }}
    >
      {hypeStep === "primer" && (
        <>
          <div
            style={{ display: "flex", alignItems: "center", marginBottom: 20 }}
          >
            <button onClick={() => nav("home")} style={{ ...iconBtn }}>
              ✕
            </button>
          </div>
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
            }}
          >
            <div style={{ ...eyebrow("var(--ash)"), marginBottom: 10 }}>
              Before you walk over
            </div>
            <div
              style={{
                fontFamily: DISPLAY,
                fontSize: 30,
                color: "var(--bone)",
                textTransform: "uppercase",
                lineHeight: 1,
                marginBottom: 36,
              }}
            >
              The freeze is the only enemy.
            </div>
            {/* <div
              style={{
                fontSize: 13.5,
                color: "var(--ash)",
                marginBottom: 36,
                maxWidth: 300,
              }}
            >
              You&apos;re doing this to become{" "}
              <span style={{ color: "var(--bone)", fontWeight: 600 }}>
                the guy who just says hi
              </span>
              .
            </div> */}

            <BreathGuide onCycle={() => setBreaths((b) => b + 1)} />

            <div
              style={{
                fontSize: 14,
                color: "var(--ash)",
                marginTop: 36,
                maxWidth: 320,
                lineHeight: 1.55,
              }}
            >
              Keep it simple <br />
              <span style={{ color: "var(--bone)" }}>
                &ldquo;Hey, I saw you standing here and I had to come over and
                meet you.&rdquo;
              </span>
            </div>
          </div>
          <button
            onClick={hypeGo}
            style={{
              width: "100%",
              border: "none",
              borderRadius: 20,
              padding: 19,
              cursor: "pointer",
              background: "linear-gradient(180deg,#FFC65E,var(--ember))",
              color: "#2a1a05",
              fontFamily: DISPLAY,
              fontSize: 22,
              textTransform: "uppercase",
              boxShadow: "0 14px 40px -10px rgba(255,178,62,.5)",
            }}
          >
            I&apos;m ready — count me down
          </button>
          {/* Non-coercive reassurance, only after they've settled into a couple
              of breaths. Reserves space so the button never jumps. */}
          <div
            style={{
              textAlign: "center",
              fontSize: 12.5,
              color: "var(--ash)",
              marginTop: 12,
              minHeight: 16,
              opacity: showNoRush ? 1 : 0,
              transition: "opacity .8s ease",
            }}
          >
            Go when you&apos;re ready — no rush.
          </div>
        </>
      )}

      {hypeStep === "countdown" && (
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              position: "relative",
              width: 200,
              height: 200,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: "50%",
                border: "2px solid var(--ember)",
                opacity: 0.5,
                animation: "aRing 1s ease-out infinite",
              }}
            />
            <span
              style={{
                fontFamily: DISPLAY,
                fontSize: 130,
                color: "var(--ember)",
                lineHeight: 1,
                animation: "aCount 1s ease-out",
              }}
              key={hypeCount}
            >
              {hypeCount}
            </span>
          </div>
          <div
            style={{
              fontFamily: MONO,
              fontSize: 12,
              letterSpacing: 2,
              color: "var(--ash)",
              textTransform: "uppercase",
              marginTop: 20,
              textAlign: "center",
            }}
          >
            Lock eyes. Smile. Move your feet.
          </div>
        </div>
      )}

      {hypeStep === "go" && (
        <>
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontFamily: DISPLAY,
                fontSize: 96,
                color: "var(--go)",
                textTransform: "uppercase",
                lineHeight: 1,
                animation: "aPop .4s cubic-bezier(.2,.8,.3,1.2) both",
              }}
            >
              Go.
            </div>
            <div
              style={{
                fontSize: 17,
                color: "var(--bone)",
                fontWeight: 700,
                marginTop: 8,
              }}
            >
              Walk over. Right now.
            </div>
            <div
              style={{
                fontSize: 13,
                color: "var(--ash)",
                marginTop: 8,
                maxWidth: 280,
                lineHeight: 1.5,
              }}
            >
              Whatever happens next, you already won the second you moved.
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
            <button
              onClick={() => startLog(true)}
              style={{
                width: "100%",
                border: "none",
                borderRadius: 20,
                padding: 18,
                cursor: "pointer",
                background: GO_GRAD,
                color: "#07130C",
                fontFamily: DISPLAY,
                fontSize: 20,
                textTransform: "uppercase",
              }}
            >
              I took the shot — log it
            </button>
            <button
              onClick={() => {
                // Judgment-free exit: no lost streak, no penalty — one warm line.
                showToast("The freeze won this one. It won't always.");
                nav("home");
              }}
              style={{
                width: "100%",
                border: "1px solid var(--slateHi)",
                borderRadius: 16,
                padding: 15,
                background: "none",
                color: "var(--ash)",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Not yet — back
            </button>
          </div>
        </>
      )}
    </div>
  );
}
