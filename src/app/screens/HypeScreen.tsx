"use client";
import { useEffect, useState } from "react";
import { useApp } from "../AppContext";
import { DISPLAY, eyebrow, GO_GRAD, iconBtn, MONO } from "../theme";

const BREATH = [
  { label: "Breathe in", ms: 4000, scale: 1 },
  { label: "Hold", ms: 1600, scale: 1 },
  { label: "Breathe out", ms: 6000, scale: 0.58 },
];

// Paced guided breath — the calm centerpiece of the primer. Owns its state so
// it only runs while the primer is mounted (unmounts on countdown/go).
function BreathGuide() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setTimeout(
      () => setI((p) => (p + 1) % BREATH.length),
      BREATH[i].ms,
    );
    return () => clearTimeout(t);
  }, [i]);
  const step = BREATH[i];
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 18,
      }}
    >
      <div
        style={{
          width: 200,
          height: 200,
          borderRadius: "50%",
          display: "grid",
          placeItems: "center",
          border: "1.5px solid rgba(255,178,62,.30)",
        }}
      >
        <div
          style={{
            width: 150,
            height: 150,
            borderRadius: "50%",
            background:
              "radial-gradient(circle at 50% 40%, rgba(255,178,62,.34), rgba(255,178,62,.08))",
            transform: `scale(${step.scale})`,
            transition: `transform ${step.ms}ms ease-in-out`,
          }}
        />
      </div>
      <div
        style={{
          fontFamily: MONO,
          fontSize: 12.5,
          letterSpacing: 2,
          color: "var(--ash)",
          textTransform: "uppercase",
        }}
      >
        {step.label}
      </div>
    </div>
  );
}

export function HypeScreen() {
  const { nav, hypeStep, hypeWhy, hypeGo, hypeCount, startLog } = useApp();
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
                marginBottom: 8,
              }}
            >
              The freeze is the only enemy.
            </div>
            <div
              style={{
                fontSize: 13.5,
                color: "var(--ash)",
                marginBottom: 36,
                maxWidth: 300,
              }}
            >
              You&apos;re doing this for{" "}
              <span style={{ color: "var(--bone)", fontWeight: 600 }}>
                {hypeWhy()}
              </span>
              .
            </div>

            <BreathGuide />

            <div
              style={{
                fontSize: 14,
                color: "var(--ash)",
                marginTop: 36,
                maxWidth: 320,
                lineHeight: 1.55,
              }}
            >
              When you land it, keep it simple:{" "}
              <span style={{ color: "var(--bone)" }}>
                &ldquo;Hey — this is random, but I saw you and had to say
                hi.&rdquo;
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
              onClick={startLog}
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
              onClick={() => nav("home")}
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
