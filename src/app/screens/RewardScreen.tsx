"use client";
import { useEffect, useState } from "react";
import Confetti from "react-confetti";
import { trackCustom } from "@/lib/analytics";
import { useApp } from "../AppContext";
import { hexA } from "../lib/chart";
import { DISPLAY, GO_GRAD, MONO } from "../theme";

function useWindowSize() {
  const [size, setSize] = useState({ width: 0, height: 0 });
  useEffect(() => {
    const update = () =>
      setSize({ width: window.innerWidth, height: window.innerHeight });
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return size;
}

export function RewardScreen() {
  const {
    reward,
    displayXp,
    displayReps,
    numberSaved,
    setNumberSaved,
    markNumberMut,
    showToast,
    nav,
  } = useApp();
  const { width, height } = useWindowSize();
  if (!reward) return null;
  return (
          <div
            style={{
              minHeight: "100vh",
              position: "relative",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "calc(env(safe-area-inset-top, 0px) + 20px) 24px 32px",
            }}
          >
            {reward.confetti && (
              <Confetti
                width={width}
                height={height}
                recycle={false}
                numberOfPieces={
                  reward.leveledUp || reward.rankUp ? 260 : 180
                }
                gravity={0.25}
                colors={[
                  reward.mode.color,
                  "#F4F3F0",
                  "#FFB23E",
                  "#34D17E",
                  "#FF5A36",
                ]}
                style={{
                  position: "fixed",
                  top: 0,
                  left: 0,
                  pointerEvents: "none",
                  zIndex: 60,
                }}
              />
            )}
            <div
              style={{
                position: "relative",
                zIndex: 2,
                width: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                flex: 1,
              }}
            >
              <div
                style={{
                  position: "relative",
                  marginTop: 10,
                  marginBottom: 6,
                  animation: "aPop .5s cubic-bezier(.2,.8,.3,1.2) both",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    inset: -24,
                    borderRadius: "50%",
                    background: `radial-gradient(circle,${hexA(reward.mode.color, 0.5)} 0%,transparent 70%)`,
                    animation: "aGlow 2.4s ease-in-out infinite",
                  }}
                />
                <div
                  style={{
                    position: "relative",
                    width: 100,
                    height: 100,
                    borderRadius: 30,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 50,
                    background: "var(--charcoal)",
                    border: `1.5px solid ${reward.mode.color}`,
                  }}
                >
                  {reward.mode.emoji}
                </div>
              </div>
              <div
                style={{
                  fontFamily: MONO,
                  fontSize: 11,
                  letterSpacing: 2.5,
                  textTransform: "uppercase",
                  color: "var(--ash)",
                  marginBottom: 2,
                }}
              >
                {reward.eyebrow}
              </div>
              <div
                style={{
                  fontFamily: DISPLAY,
                  fontSize: 28,
                  textTransform: "uppercase",
                  color: reward.mode.color,
                  animation: "aFadeUp .5s .1s both",
                }}
              >
                {reward.mode.name}
              </div>
              <div
                style={{
                  fontSize: 13.5,
                  color: "var(--bone)",
                  maxWidth: 290,
                  textAlign: "center",
                  lineHeight: 1.4,
                  marginTop: 8,
                  animation: "aFadeUp .5s .16s both",
                }}
              >
                {reward.mode.blurb}
              </div>

              <div
                style={{
                  marginTop: 24,
                  textAlign: "center",
                  animation: "aFadeUp .5s .18s both",
                }}
              >
                <div
                  style={{
                    fontFamily: DISPLAY,
                    fontSize: 74,
                    lineHeight: 0.9,
                    color: "var(--go)",
                  }}
                >
                  +{displayXp}
                </div>
                <div
                  style={{
                    fontFamily: MONO,
                    fontSize: 12,
                    letterSpacing: 2,
                    color: "var(--ash)",
                    textTransform: "uppercase",
                  }}
                >
                  XP · Courage banked
                </div>
              </div>

              {reward.leveledUp && (
                <div
                  style={{
                    marginTop: 18,
                    padding: "10px 20px",
                    borderRadius: 999,
                    background: "rgba(255,178,62,.12)",
                    border: "1px solid rgba(255,178,62,.5)",
                    animation: "aPop .5s .3s both",
                  }}
                >
                  <span
                    style={{
                      fontFamily: MONO,
                      fontSize: 12,
                      letterSpacing: 1.5,
                      color: "var(--ember)",
                      textTransform: "uppercase",
                    }}
                  >
                    ⬆ Level up · Level {reward.newLevel}
                  </span>
                </div>
              )}
              {reward.rankUp && (
                <div
                  style={{
                    marginTop: 10,
                    textAlign: "center",
                    animation: "aPop .5s .4s both",
                  }}
                >
                  <div
                    style={{
                      fontFamily: MONO,
                      fontSize: 11,
                      letterSpacing: 2,
                      color: "var(--ash)",
                      textTransform: "uppercase",
                    }}
                  >
                    New rank
                  </div>
                  <div
                    style={{
                      fontFamily: DISPLAY,
                      fontSize: 24,
                      color: "var(--ember)",
                      textTransform: "uppercase",
                    }}
                  >
                    {reward.newRank}
                  </div>
                </div>
              )}
              {reward.milestone && (
                <div
                  style={{
                    marginTop: 16,
                    padding: "10px 20px",
                    borderRadius: 999,
                    background: hexA(reward.milestone.color, 0.12),
                    border: `1px solid ${hexA(reward.milestone.color, 0.5)}`,
                    animation: "aPop .5s .45s both",
                  }}
                >
                  <span
                    style={{
                      fontFamily: MONO,
                      fontSize: 12,
                      letterSpacing: 1.5,
                      color: reward.milestone.color,
                      textTransform: "uppercase",
                    }}
                  >
                    ⭐ {reward.milestone.label}
                  </span>
                </div>
              )}

              <div
                style={{
                  marginTop: 26,
                  textAlign: "center",
                  maxWidth: 300,
                  animation: "aFadeUp .5s .28s both",
                }}
              >
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 18,
                    color: "var(--bone)",
                    lineHeight: 1.3,
                  }}
                >
                  {reward.isFirstEver
                    ? "That was the hardest one. You're on the board."
                    : "Rep logged. Showing up is the whole win."}
                </div>
                <div
                  style={{ marginTop: 10, fontSize: 13, color: "var(--ash)" }}
                >
                  {reward.isFirstEver ? (
                    <>
                      Approach{" "}
                      <span style={{ fontFamily: MONO, color: "var(--bone)" }}>
                        #1
                      </span>{" "}
                      · your line starts here.
                    </>
                  ) : (
                    <>
                      Approach{" "}
                      <span style={{ fontFamily: MONO, color: "var(--bone)" }}>
                        #{displayReps}
                      </span>{" "}
                      ·{" "}
                      <span style={{ fontFamily: MONO, color: "var(--bone)" }}>
                        {reward.streak}
                      </span>
                      -week streak
                    </>
                  )}
                </div>
              </div>

              <button
                onClick={async () => {
                  const next = !numberSaved;
                  setNumberSaved(next);
                  try {
                    await markNumberMut({
                      approachId: reward.approachId,
                      gotNumber: next,
                    });
                    if (next) trackCustom("GotNumber");
                  } catch {
                    setNumberSaved(!next);
                    showToast("Couldn't save that.");
                  }
                }}
                style={{
                  marginTop: 18,
                  background: numberSaved
                    ? "rgba(52,209,126,.12)"
                    : "var(--charcoal)",
                  border: `1px solid ${numberSaved ? "var(--go)" : "var(--slateHi)"}`,
                  borderRadius: 999,
                  padding: "9px 16px",
                  color: numberSaved ? "var(--go)" : "var(--ash)",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  animation: "aFadeUp .5s .34s both",
                }}
              >
                <span>📱</span>
                {numberSaved ? "Number saved ✓" : "Got their number?"}
              </button>

              <div style={{ flex: 1 }} />

              <div style={{ width: "100%", animation: "aFadeUp .5s .5s both" }}>
                <button
                  onClick={() => nav("home")}
                  style={{
                    width: "100%",
                    border: "none",
                    borderRadius: 18,
                    padding: 16,
                    cursor: "pointer",
                    background: GO_GRAD,
                    color: "#07130C",
                    fontWeight: 700,
                    fontSize: 16,
                  }}
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
  );
}
