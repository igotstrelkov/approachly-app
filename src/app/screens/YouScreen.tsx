"use client";
import type { ReactNode } from "react";
import { useApp } from "../AppContext";
import { eyebrow, iconBtn, MONO } from "../theme";

function Row({
  label,
  value,
  onClick,
  last,
}: {
  label: string;
  value?: ReactNode;
  onClick: () => void;
  last?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "16px 0",
        background: "none",
        border: "none",
        borderBottom: last ? "none" : "1px solid var(--slate)",
        cursor: "pointer",
        textAlign: "left",
      }}
    >
      <span style={{ fontSize: 14.5, color: "var(--bone)" }}>{label}</span>
      <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {value != null && (
          <span style={{ fontFamily: MONO, fontSize: 13, color: "var(--ash)" }}>
            {value}
          </span>
        )}
        <span style={{ color: "var(--ash)", fontSize: 17 }}>›</span>
      </span>
    </button>
  );
}

export function YouScreen() {
  const {
    nav,
    level,
    rank,
    user,
    clerkUser,
    reminderMode,
    setBooted,
    setQuizStep,
    setScreen,
    signOut,
  } = useApp();
  const reminderValue =
    reminderMode === "off"
      ? "Off"
      : reminderMode.charAt(0).toUpperCase() + reminderMode.slice(1);

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
          ...eyebrow("var(--ash)"),
          letterSpacing: 2.4,
          marginBottom: 14,
        }}
      >
        Account
      </div>
      {/* Identity doubles as the door to the rank journey (matches Home's badge). */}
      {/* <button
        onClick={() => nav("ranks")}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 15,
          marginBottom: 26,
          background: "none",
          border: "none",
          padding: 0,
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <div
          style={{
            width: 60,
            height: 60,
            flexShrink: 0,
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
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontFamily: DISPLAY,
              fontSize: 22,
              textTransform: "uppercase",
              lineHeight: 1,
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
              marginTop: 4,
            }}
          >
            Level {level}
          </div>
          {clerkUser?.primaryEmailAddress?.emailAddress && (
            <div
              style={{
                fontSize: 12,
                color: "var(--ash)",
                marginTop: 3,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {clerkUser.primaryEmailAddress.emailAddress}
            </div>
          )}
        </div>
        <span style={{ color: "var(--ash)", fontSize: 20, flexShrink: 0 }}>
          ›
        </span>
      </button> */}

      {/* Your reps — a review surface, not a setting: given card weight + an
          icon so it reads as content, distinct from the settings list below. */}
      <button
        onClick={() => nav("reflections")}
        style={{
          width: "100%",
          cursor: "pointer",
          background: "var(--charcoal)",
          border: "1px solid var(--slate)",
          borderRadius: 16,
          padding: "16px 18px",
          display: "flex",
          alignItems: "center",
          gap: 14,
          textAlign: "left",
          marginBottom: 26,
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            flexShrink: 0,
            borderRadius: 13,
            background: "rgba(52,209,126,.12)",
            display: "grid",
            placeItems: "center",
          }}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--go)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="9" y1="6" x2="20" y2="6" />
            <line x1="9" y1="12" x2="20" y2="12" />
            <line x1="9" y1="18" x2="20" y2="18" />
            <circle cx="4.5" cy="6" r="1" fill="var(--go)" stroke="none" />
            <circle cx="4.5" cy="12" r="1" fill="var(--go)" stroke="none" />
            <circle cx="4.5" cy="18" r="1" fill="var(--go)" stroke="none" />
          </svg>
        </div>
        <div style={{ flex: 1 }}>
          <div
            style={{ fontWeight: 700, fontSize: 15.5, color: "var(--bone)" }}
          >
            Your reps
          </div>
          <div style={{ fontSize: 12.5, color: "var(--ash)", marginTop: 1 }}>
            Every rep you&apos;ve logged, with your notes.
          </div>
        </div>
        <span style={{ color: "var(--ash)", fontSize: 20 }}>›</span>
      </button>

      <div style={{ ...eyebrow("var(--ash)"), marginBottom: 8 }}>Settings</div>
      <div
        style={{
          background: "var(--charcoal)",
          border: "1px solid var(--slate)",
          borderRadius: 16,
          padding: "0 16px",
          marginBottom: 30,
        }}
      >
        <Row
          label="Weekly goal"
          value={`${user.weeklyGoal} / week`}
          onClick={() => nav("goal")}
        />
        <Row
          label="Reminder"
          value={reminderValue}
          onClick={() => nav("reminder")}
        />
        <Row
          label="Send feedback or an idea"
          onClick={() => nav("feedback")}
          last
        />
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
      <div style={{ textAlign: "center", marginTop: 18 }}>
        <a
          href="/privacy"
          style={{
            color: "var(--ash)",
            fontSize: 12,
            textDecoration: "none",
          }}
        >
          Privacy
        </a>
        <div
          style={{
            fontSize: 11,
            color: "var(--ashDim)",
            marginTop: 8,
          }}
        >
          Couragely · Swiping is hiding · 18+
        </div>
      </div>
    </div>
  );
}
