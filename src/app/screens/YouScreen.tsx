"use client";
import { useApp } from "../AppContext";
import { DISPLAY, iconBtn, MONO } from "../theme";

export function YouScreen() {
  const {
    nav,
    level,
    rank,
    user,
    clerkUser,
    setGoalEditing,
    goalEditing,
    setWeeklyGoalMut,
    showToast,
    pushBusy,
    pushOn,
    scheduleLabel,
    toggleReminders,
    setBooted,
    setQuizStep,
    setScreen,
    signOut,
  } = useApp();
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
                marginBottom: 24,
              }}
            >
              <button onClick={() => nav("home")} style={{ ...iconBtn }}>
                ‹
              </button>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 15,
                marginBottom: 30,
              }}
            >
              <div
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 19,
                  background:
                    "linear-gradient(135deg,var(--ember),var(--flare))",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: DISPLAY,
                  fontSize: 26,
                  color: "#1a0f08",
                }}
              >
                {level}
              </div>
              <div>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 19,
                    color: "var(--bone)",
                  }}
                >
                  {rank}
                </div>
                <div
                  style={{
                    fontFamily: MONO,
                    fontSize: 12,
                    color: "var(--ash)",
                  }}
                >
                  Level {level} · {user.totalApproaches} approach
                  {user.totalApproaches === 1 ? "" : "es"}
                </div>
                {clerkUser?.primaryEmailAddress?.emailAddress && (
                  <div
                    style={{
                      fontSize: 12,
                      color: "var(--ashDim)",
                      marginTop: 3,
                    }}
                  >
                    {clerkUser.primaryEmailAddress.emailAddress}
                  </div>
                )}
              </div>
            </div>

            <div
              style={{
                fontFamily: MONO,
                fontSize: 10.5,
                letterSpacing: 1.5,
                color: "var(--ash)",
                textTransform: "uppercase",
                marginBottom: 8,
              }}
            >
              Your plan
            </div>
            <div>
              {/* Weekly goal — tap to edit */}
              <button
                onClick={() => setGoalEditing((v) => !v)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "16px 0",
                  background: "none",
                  border: "none",
                  borderBottom: "1px solid var(--slate)",
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <span style={{ fontSize: 14.5, color: "var(--bone)" }}>
                  Weekly goal
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span
                    style={{
                      fontFamily: MONO,
                      fontSize: 14,
                      color: "var(--go)",
                      fontWeight: 700,
                    }}
                  >
                    {user.weeklyGoal} / week
                  </span>
                  <span
                    style={{
                      color: "var(--ash)",
                      fontSize: 17,
                      display: "inline-block",
                      transform: goalEditing ? "rotate(90deg)" : "none",
                      transition: "transform .15s",
                    }}
                  >
                    ›
                  </span>
                </span>
              </button>
              {goalEditing && (
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    padding: "14px 0",
                    borderBottom: "1px solid var(--slate)",
                  }}
                >
                  {[2, 3, 4, 5, 6, 7].map((g) => {
                    const sel = user.weeklyGoal === g;
                    return (
                      <button
                        key={g}
                        onClick={async () => {
                          setGoalEditing(false);
                          if (g === user.weeklyGoal) return;
                          try {
                            await setWeeklyGoalMut({ weeklyGoal: g });
                            showToast("Weekly goal updated.");
                          } catch {
                            showToast("Couldn't update goal.");
                          }
                        }}
                        style={{
                          flex: 1,
                          height: 44,
                          borderRadius: 12,
                          cursor: "pointer",
                          background: sel
                            ? "rgba(52,209,126,.12)"
                            : "var(--charcoal)",
                          border: `1.5px solid ${sel ? "var(--go)" : "var(--slate)"}`,
                          color: sel ? "var(--go)" : "var(--bone)",
                          fontFamily: MONO,
                          fontSize: 15,
                          fontWeight: 700,
                        }}
                      >
                        {g}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Weekly reminder — toggle switch */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "16px 0",
                  borderBottom: "1px solid var(--slate)",
                  gap: 12,
                }}
              >
                <div>
                  <div style={{ fontSize: 14.5, color: "var(--bone)" }}>
                    Weekly reminder
                  </div>
                  <div
                    style={{ fontSize: 12, color: "var(--ash)", marginTop: 2 }}
                  >
                    {pushBusy
                      ? "…"
                      : pushOn
                        ? scheduleLabel
                        : "A weekly nudge toward your goal"}
                  </div>
                </div>
                <button
                  role="switch"
                  aria-checked={pushOn}
                  aria-label="Weekly reminder"
                  onClick={toggleReminders}
                  disabled={pushBusy}
                  style={{
                    width: 46,
                    height: 28,
                    borderRadius: 999,
                    background: pushOn ? "var(--go)" : "var(--slate)",
                    border: "none",
                    position: "relative",
                    cursor: pushBusy ? "default" : "pointer",
                    flexShrink: 0,
                    opacity: pushBusy ? 0.6 : 1,
                    transition: "background .2s",
                  }}
                >
                  <span
                    style={{
                      position: "absolute",
                      top: 3,
                      left: pushOn ? 21 : 3,
                      width: 22,
                      height: 22,
                      borderRadius: "50%",
                      background: "#fff",
                      transition: "left .2s",
                      boxShadow: "0 1px 3px rgba(0,0,0,.4)",
                    }}
                  />
                </button>
              </div>

              {/* Week rolls over */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "16px 0",
                  borderBottom: "1px solid var(--slate)",
                }}
              >
                <span style={{ fontSize: 14.5, color: "var(--bone)" }}>
                  Week rolls over
                </span>
                <span style={{ fontSize: 13, color: "var(--ash)" }}>
                  4:00 AM local
                </span>
              </div>
            </div>

            <button
              onClick={async () => {
                setBooted(false);
                setQuizStep(0);
                setScreen("quiz");
                await signOut();
              }}
              style={{
                width: "100%",
                marginTop: 30,
                background: "none",
                border: "1px solid var(--slate)",
                borderRadius: 14,
                padding: 15,
                color: "var(--ash)",
                fontSize: 14.5,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Sign out
            </button>
            <div
              style={{
                textAlign: "center",
                fontSize: 11,
                color: "var(--ashDim)",
                marginTop: 18,
              }}
            >
              Couragely · adults approaching adults · 18+
            </div>
          </div>
  );
}
