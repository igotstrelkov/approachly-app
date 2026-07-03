"use client";
import { type CSSProperties } from "react";
import { useApp } from "../AppContext";
import { DISPLAY, eyebrow, iconBtn, MONO } from "../theme";

export function RanksScreen() {
  const { nav, level, into, need, levelPct, xpToNext, user, journeyClimb } =
    useApp();
  return (
          <div
            style={{
              minHeight: "100vh",
              padding: "calc(env(safe-area-inset-top, 0px) + 20px) 22px 40px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: 22,
              }}
            >
              <button onClick={() => nav("home")} style={{ ...iconBtn }}>
                ‹
              </button>
            </div>
            <div
              style={{
                ...eyebrow("var(--ash)"),
                letterSpacing: 2.4,
                marginBottom: 12,
              }}
            >
              Your journey
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                marginBottom: 18,
              }}
            >
              <div
                style={{
                  width: 66,
                  height: 66,
                  flexShrink: 0,
                  borderRadius: 20,
                  background:
                    "linear-gradient(135deg,var(--ember),var(--flare))",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: DISPLAY,
                  fontSize: 30,
                  color: "#1a0f08",
                }}
              >
                {level}
              </div>
              <div>
                <div
                  style={{
                    fontFamily: DISPLAY,
                    fontSize: 26,
                    textTransform: "uppercase",
                    color: "var(--bone)",
                    lineHeight: 1,
                  }}
                >
                  Level {level}
                </div>
                <div
                  style={{
                    fontFamily: MONO,
                    fontSize: 12,
                    color: "var(--ash)",
                    marginTop: 3,
                  }}
                >
                  {into} / {need} XP
                </div>
              </div>
            </div>
            <div
              style={{
                height: 9,
                borderRadius: 999,
                background: "var(--slate)",
                overflow: "hidden",
                marginBottom: 8,
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${levelPct}%`,
                  background: "linear-gradient(90deg,var(--ember),#FFCF7A)",
                  borderRadius: 999,
                }}
              />
            </div>
            <div
              style={{ fontSize: 12.5, color: "var(--ash)", marginBottom: 6 }}
            >
              {xpToNext} XP to Level {level + 1}
            </div>
            <div
              style={{ fontSize: 12, color: "var(--ash)", marginBottom: 32 }}
            >
              XP is courage banked — every rep counts, more the scarier it felt.
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                justifyContent: "space-between",
                marginBottom: 16,
              }}
            >
              <span style={{ ...eyebrow("var(--ash)"), letterSpacing: 2 }}>
                Ranks · permanent climb
              </span>
              <span
                style={{ fontFamily: MONO, fontSize: 11, color: "var(--ash)" }}
              >
                {user.totalApproaches} approaches
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column" }}>
              {journeyClimb.map((r, i, arr) => {
                const isTop = i === 0,
                  isBottom = i === arr.length - 1;
                const topFilled = !isTop && arr[i - 1].reached; // link up to the higher rank
                const botFilled = !isBottom && r.reached; // link down, climbed once this rank is reached
                const seg = (filled: boolean): CSSProperties =>
                  filled
                    ? {
                        background:
                          "linear-gradient(180deg, var(--ember), var(--go))",
                      }
                    : {
                        backgroundImage:
                          "repeating-linear-gradient(var(--ashDim) 0 3px, transparent 3px 8px)",
                      };
                return (
                  <div
                    key={r.name}
                    style={{
                      display: "flex",
                      gap: 14,
                      alignItems: "stretch",
                      minHeight: 84,
                    }}
                  >
                    <div
                      style={{
                        width: 34,
                        flexShrink: 0,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                      }}
                    >
                      <div
                        style={{
                          width: 2,
                          flex: 1,
                          ...(isTop
                            ? { background: "transparent" }
                            : seg(topFilled)),
                        }}
                      />
                      <div
                        style={{
                          width: 34,
                          height: 34,
                          flexShrink: 0,
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontFamily: MONO,
                          fontSize: 11,
                          fontWeight: 700,
                          background: r.nodeBg,
                          color: r.nodeColor,
                          border: r.nodeBorder,
                          zIndex: 1,
                        }}
                      >
                        {r.short}
                      </div>
                      <div
                        style={{
                          width: 2,
                          flex: 1,
                          ...(isBottom
                            ? { background: "transparent" }
                            : seg(botFilled)),
                        }}
                      />
                    </div>
                    <div
                      style={{
                        flex: 1,
                        alignSelf: "center",
                        display: "flex",
                        alignItems: "center",
                        gap: 13,
                        padding: "13px 15px",
                        borderRadius: 14,
                        background: r.cardBg,
                        border: `1px solid ${r.cardBorder}`,
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontWeight: 700,
                            fontSize: 15,
                            color: r.nameColor,
                          }}
                        >
                          {r.name}
                        </div>
                        <div
                          style={{
                            fontSize: 12,
                            color: "var(--ash)",
                            marginTop: 1,
                          }}
                        >
                          {r.subtitle}
                        </div>
                      </div>
                      <span
                        style={{
                          fontFamily: MONO,
                          fontSize: 11,
                          color: r.markColor,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {r.mark}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
  );
}
