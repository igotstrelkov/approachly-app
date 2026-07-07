"use client";
import { useApp } from "../AppContext";
import { DISPLAY, iconBtn, MONO } from "../theme";

export function ReminderScreen() {
  const {
    nav,
    pushBusy,
    scheduleLabel,
    reminderMode,
    setReminderMode,
    needsIosInstall,
  } = useApp();
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
        Reminder
      </div>
      <div style={{ fontSize: 13.5, color: "var(--ash)", marginBottom: 26 }}>
        {pushBusy
          ? "…"
          : reminderMode === "off"
            ? "A gentle nudge to beat the freeze — never a guilt trip."
            : scheduleLabel}
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
                padding: "11px 0",
                borderRadius: 9,
                border: "none",
                cursor: pushBusy ? "default" : "pointer",
                background: active ? "var(--go)" : "transparent",
                color: active ? "#07130C" : "var(--ash)",
                fontFamily: MONO,
                fontSize: 13,
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
            marginTop: 14,
          }}
        >
          On iPhone: tap <span style={{ color: "var(--bone)" }}>Share</span> →{" "}
          <span style={{ color: "var(--bone)" }}>Add to Home Screen</span>, then
          open Couragely from your home screen to turn on reminders.
        </div>
      )}
    </div>
  );
}
