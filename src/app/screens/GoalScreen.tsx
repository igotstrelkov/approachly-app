"use client";
import { useApp } from "../AppContext";
import { DISPLAY, iconBtn, MONO } from "../theme";

export function GoalScreen() {
  const { nav, user, setWeeklyGoalMut, showToast } = useApp();
  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "calc(env(safe-area-inset-top, 0px) + 20px) 22px 40px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", marginBottom: 24 }}>
        <button onClick={() => nav("you")} style={{ ...iconBtn }}>
          ‹
        </button>
      </div>

      <div
        style={{
          fontFamily: DISPLAY,
          fontSize: 32,
          color: "var(--bone)",
          textTransform: "uppercase",
          lineHeight: 1,
          marginBottom: 6,
        }}
      >
        Weekly goal
      </div>
      <div style={{ fontSize: 13.5, color: "var(--ash)", marginBottom: 26 }}>
        How many reps a week you&apos;re aiming for. Showing up is the win — pick
        a number you can keep.
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 10,
        }}
      >
        {[2, 3, 4, 5, 6, 7].map((g) => {
          const sel = user.weeklyGoal === g;
          return (
            <button
              key={g}
              onClick={async () => {
                if (g === user.weeklyGoal) {
                  nav("you");
                  return;
                }
                try {
                  await setWeeklyGoalMut({ weeklyGoal: g });
                  showToast("Weekly goal updated.");
                  nav("you");
                } catch {
                  showToast("Couldn't update goal.");
                }
              }}
              style={{
                height: 64,
                borderRadius: 14,
                cursor: "pointer",
                background: sel ? "rgba(52,209,126,.12)" : "var(--charcoal)",
                border: `1.5px solid ${sel ? "var(--go)" : "var(--slate)"}`,
                color: sel ? "var(--go)" : "var(--bone)",
                fontFamily: MONO,
                fontSize: 20,
                fontWeight: 700,
              }}
            >
              {g}
              <span
                style={{
                  display: "block",
                  fontSize: 10,
                  fontWeight: 400,
                  color: "var(--ash)",
                  marginTop: 2,
                }}
              >
                / week
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
