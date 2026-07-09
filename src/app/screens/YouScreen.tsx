"use client";
import type { ReactNode } from "react";
import { useApp } from "../AppContext";
import { DISPLAY, iconBtn, MONO } from "../theme";

function Row({
  label,
  value,
  onClick,
  first,
}: {
  label: string;
  value?: ReactNode;
  onClick: () => void;
  first?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "17px 0",
        background: "none",
        border: "none",
        borderTop: first ? "1px solid var(--slate)" : "none",
        borderBottom: "1px solid var(--slate)",
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
            Level {level}
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

      <div style={{ marginBottom: 30 }}>
        <Row label="Reflections" onClick={() => nav("reflections")} first />
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
        <Row label="Send feedback or an idea" onClick={() => nav("feedback")} />
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
      <div
        style={{
          textAlign: "center",
          fontSize: 11,
          color: "var(--ashDim)",
          marginTop: 18,
        }}
      >
        Couragely · Swiping is hiding · 18+
      </div>
    </div>
  );
}
