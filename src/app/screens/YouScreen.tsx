"use client";
import { useState } from "react";
import { useApp } from "../AppContext";
import { DISPLAY, GO_GRAD, iconBtn, MONO } from "../theme";

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
    scheduleLabel,
    reminderMode,
    setReminderMode,
    needsIosInstall,
    setBooted,
    setQuizStep,
    setScreen,
    signOut,
    submitFeedbackMut,
  } = useApp();
  const [fbOpen, setFbOpen] = useState(false);
  const [fbKind, setFbKind] = useState<"idea" | "bug" | "other">("idea");
  const [fbText, setFbText] = useState("");
  const [fbSending, setFbSending] = useState(false);
  const sendFeedback = async () => {
    if (fbSending || !fbText.trim()) return;
    setFbSending(true);
    try {
      await submitFeedbackMut({ kind: fbKind, message: fbText.trim() });
      setFbText("");
      setFbKind("idea");
      setFbOpen(false);
      showToast("Thanks — we read every one.");
    } catch {
      showToast("Couldn't send — try again.");
    } finally {
      setFbSending(false);
    }
  };
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
            background: "linear-gradient(135deg,var(--ember),var(--flare))",
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

        {/* Reminder cadence — daily / weekly / off segmented control */}
        <div
          style={{
            padding: "16px 0",
            borderBottom: "1px solid var(--slate)",
          }}
        >
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 14.5, color: "var(--bone)" }}>Reminder</div>
            <div style={{ fontSize: 12, color: "var(--ash)", marginTop: 2 }}>
              {pushBusy
                ? "…"
                : reminderMode === "off"
                  ? "A daily nudge to beat the freeze"
                  : scheduleLabel}
            </div>
          </div>
          <div
            style={{
              display: "flex",
              gap: 4,
              background: "var(--charcoal)",
              border: "1px solid var(--slate)",
              borderRadius: 12,
              padding: 4,
            }}
          >
            {(["daily", "weekly", "off"] as const).map((m) => {
              const active = reminderMode === m;
              return (
                <button
                  key={m}
                  onClick={() => setReminderMode(m)}
                  disabled={pushBusy}
                  aria-pressed={active}
                  style={{
                    flex: 1,
                    padding: "9px 0",
                    borderRadius: 9,
                    border: "none",
                    cursor: pushBusy ? "default" : "pointer",
                    background: active ? "var(--go)" : "transparent",
                    color: active ? "#07130C" : "var(--ash)",
                    fontFamily: MONO,
                    fontSize: 12.5,
                    fontWeight: active ? 700 : 400,
                    textTransform: "capitalize",
                    opacity: pushBusy ? 0.6 : 1,
                    transition: "background .15s, color .15s",
                  }}
                >
                  {m}
                </button>
              );
            })}
          </div>
          {needsIosInstall && (
            <div
              style={{
                fontSize: 12,
                color: "var(--ash)",
                lineHeight: 1.5,
                marginTop: 10,
              }}
            >
              On iPhone: tap <span style={{ color: "var(--bone)" }}>Share</span>{" "}
              → <span style={{ color: "var(--bone)" }}>Add to Home Screen</span>
              , then open Couragely from your home screen to turn on reminders.
            </div>
          )}
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

      {/* Feedback / feature requests */}
      <div
        style={{
          fontFamily: MONO,
          fontSize: 10.5,
          letterSpacing: 1.5,
          color: "var(--ash)",
          textTransform: "uppercase",
          marginTop: 30,
          marginBottom: 8,
        }}
      >
        Feedback
      </div>
      <button
        onClick={() => setFbOpen((v) => !v)}
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
          Send feedback or an idea
        </span>
        <span
          style={{
            color: "var(--ash)",
            fontSize: 17,
            display: "inline-block",
            transform: fbOpen ? "rotate(90deg)" : "none",
            transition: "transform .15s",
          }}
        >
          ›
        </span>
      </button>
      {fbOpen && (
        <div
          style={{ padding: "14px 0", borderBottom: "1px solid var(--slate)" }}
        >
          <div
            style={{
              display: "flex",
              gap: 4,
              background: "var(--charcoal)",
              border: "1px solid var(--slate)",
              borderRadius: 12,
              padding: 4,
              marginBottom: 10,
            }}
          >
            {(["idea", "bug", "other"] as const).map((k) => {
              const active = fbKind === k;
              return (
                <button
                  key={k}
                  onClick={() => setFbKind(k)}
                  style={{
                    flex: 1,
                    padding: "8px 0",
                    borderRadius: 9,
                    border: "none",
                    cursor: "pointer",
                    background: active ? "var(--go)" : "transparent",
                    color: active ? "#07130C" : "var(--ash)",
                    fontFamily: MONO,
                    fontSize: 12.5,
                    fontWeight: active ? 700 : 400,
                    textTransform: "capitalize",
                    transition: "background .15s, color .15s",
                  }}
                >
                  {k}
                </button>
              );
            })}
          </div>
          <textarea
            value={fbText}
            onChange={(e) => setFbText(e.target.value)}
            placeholder="What would make Couragely better?"
            rows={3}
            maxLength={2000}
            style={{
              width: "100%",
              background: "var(--charcoal)",
              border: "1px solid var(--slate)",
              borderRadius: 12,
              padding: "12px 14px",
              color: "var(--bone)",
              fontFamily: "inherit",
              fontSize: 14,
              lineHeight: 1.5,
              resize: "vertical",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
          <button
            onClick={sendFeedback}
            disabled={!fbText.trim() || fbSending}
            style={{
              width: "100%",
              marginTop: 10,
              border: "none",
              borderRadius: 12,
              padding: 12,
              background: GO_GRAD,
              color: "#07130C",
              fontFamily: DISPLAY,
              fontSize: 15,
              textTransform: "uppercase",
              cursor: fbText.trim() && !fbSending ? "pointer" : "default",
              opacity: fbText.trim() && !fbSending ? 1 : 0.5,
            }}
          >
            {fbSending ? "Sending…" : "Send"}
          </button>
        </div>
      )}

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
        Couragely · Stop swiping, start Approaching · 18+
      </div>
    </div>
  );
}
