"use client";
import { useApp } from "../AppContext";
import { DISPLAY, MONO, eyebrow, iconBtn } from "../theme";
import { DAYS, CHALLENGE_LENGTH } from "../lib/ladder";

export function LadderScreen() {
  const { nav, challengeDay, challengeDone } = useApp();
  // top → bottom: Day 7 at the summit, Day 1 at the base
  const rows = [...DAYS].reverse();
  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "calc(env(safe-area-inset-top, 0px) + 20px) 22px 40px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", marginBottom: 22 }}>
        <button onClick={() => nav("home")} style={{ ...iconBtn }}>
          ‹
        </button>
      </div>

      <div style={{ ...eyebrow("var(--go)"), letterSpacing: 2, marginBottom: 6 }}>
        The 7-Day Challenge
      </div>
      <div
        style={{
          fontFamily: DISPLAY,
          fontSize: 30,
          textTransform: "uppercase",
          color: "var(--bone)",
          lineHeight: 1,
          marginBottom: 6,
        }}
      >
        {challengeDone ? "You did all seven." : "Seven days to climb."}
      </div>
      <div
        style={{
          fontSize: 13,
          color: "var(--ash)",
          marginBottom: 26,
          lineHeight: 1.5,
        }}
      >
        {challengeDone
          ? "You finished every day. Keep going with free reps — the challenge is yours to revisit anytime."
          : "One small mission per day, at your own pace. A day only advances when you complete it — step back anytime."}
      </div>

      <div style={{ display: "flex", flexDirection: "column" }}>
        {rows.map((r, i, arr) => {
          const isTop = i === 0,
            isBottom = i === arr.length - 1;
          const cleared = challengeDone ? true : r.day < challengeDay;
          const current = !challengeDone && r.day === challengeDay;
          const doneTop = challengeDone && r.day === CHALLENGE_LENGTH;
          const fillAbove = !isTop && (challengeDone || r.day + 1 <= challengeDay);
          const fillBelow = !isBottom && (challengeDone || r.day <= challengeDay);
          const spine = (on: boolean) =>
            on
              ? { background: "var(--go)" }
              : {
                  backgroundImage:
                    "repeating-linear-gradient(var(--ashDim) 0 3px, transparent 3px 8px)",
                };
          const nodeBg =
            doneTop || current
              ? "var(--go)"
              : cleared
                ? "rgba(52,209,126,.2)"
                : "var(--charcoal)";
          const nodeColor =
            doneTop || current
              ? "#07130C"
              : cleared
                ? "var(--go)"
                : "var(--ashDim)";
          const nodeBorder = current
            ? "2px solid var(--go)"
            : cleared
              ? "1px solid rgba(52,209,126,.4)"
              : "1px solid var(--slate)";
          return (
            <div
              key={r.day}
              style={{
                display: "flex",
                gap: 14,
                alignItems: "stretch",
                minHeight: 92,
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
                    ...(isTop ? { background: "transparent" } : spine(fillAbove)),
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
                    fontSize: 12,
                    fontWeight: 700,
                    background: nodeBg,
                    color: nodeColor,
                    border: nodeBorder,
                    zIndex: 1,
                  }}
                >
                  {doneTop ? "👑" : cleared ? "✓" : r.day}
                </div>
                <div
                  style={{
                    width: 2,
                    flex: 1,
                    ...(isBottom
                      ? { background: "transparent" }
                      : spine(fillBelow)),
                  }}
                />
              </div>
              <div
                style={{
                  flex: 1,
                  alignSelf: "center",
                  padding: "13px 15px",
                  borderRadius: 14,
                  background: current ? "rgba(52,209,126,.1)" : "var(--charcoal)",
                  border: `1px solid ${current ? "var(--go)" : "var(--slate)"}`,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                    gap: 10,
                  }}
                >
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: 15,
                      color: cleared || current ? "var(--bone)" : "var(--ashDim)",
                    }}
                  >
                    Day {r.day} · {r.chapter}
                  </div>
                  <span
                    style={{
                      fontFamily: MONO,
                      fontSize: 11,
                      color: current ? "var(--go)" : "var(--ash)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {doneTop
                      ? "Done"
                      : current
                        ? "You're here"
                        : cleared
                          ? "Cleared"
                          : `Day ${r.day}`}
                  </span>
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "var(--ash)",
                    marginTop: 3,
                    lineHeight: 1.4,
                  }}
                >
                  {current ? "● You're here — " : ""}
                  {r.mission}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
