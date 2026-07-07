"use client";
import { useState } from "react";
import { useApp } from "../AppContext";
import { DISPLAY, GO_GRAD, iconBtn, MONO } from "../theme";

export function FeedbackScreen() {
  const { nav, submitFeedbackMut, showToast } = useApp();
  const [kind, setKind] = useState<"idea" | "bug" | "other">("idea");
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  const send = async () => {
    if (sending || !text.trim()) return;
    setSending(true);
    try {
      await submitFeedbackMut({ kind, message: text.trim() });
      showToast("Thanks — we read every one.");
      nav("you");
    } catch {
      showToast("Couldn't send — try again.");
    } finally {
      setSending(false);
    }
  };

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
        Send feedback
      </div>
      <div style={{ fontSize: 13.5, color: "var(--ash)", marginBottom: 22 }}>
        An idea, a bug, anything. We read every one.
      </div>

      <div
        style={{
          display: "flex",
          gap: 4,
          background: "var(--charcoal)",
          border: "1px solid var(--slate)",
          borderRadius: 12,
          padding: 4,
          marginBottom: 12,
        }}
      >
        {(["idea", "bug", "other"] as const).map((k) => {
          const active = kind === k;
          return (
            <button
              key={k}
              onClick={() => setKind(k)}
              style={{
                flex: 1,
                padding: "10px 0",
                borderRadius: 9,
                border: "none",
                cursor: "pointer",
                background: active ? "var(--go)" : "transparent",
                color: active ? "#07130C" : "var(--ash)",
                fontFamily: MONO,
                fontSize: 13,
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
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="What would make Couragely better?"
        rows={5}
        maxLength={2000}
        autoFocus
        style={{
          width: "100%",
          background: "var(--charcoal)",
          border: "1px solid var(--slate)",
          borderRadius: 12,
          padding: "13px 15px",
          color: "var(--bone)",
          fontFamily: "inherit",
          fontSize: 14,
          lineHeight: 1.5,
          resize: "none",
          outline: "none",
          boxSizing: "border-box",
        }}
      />
      <button
        onClick={send}
        disabled={!text.trim() || sending}
        style={{
          width: "100%",
          marginTop: 12,
          border: "none",
          borderRadius: 14,
          padding: 15,
          background: GO_GRAD,
          color: "#07130C",
          fontFamily: DISPLAY,
          fontSize: 17,
          textTransform: "uppercase",
          cursor: text.trim() && !sending ? "pointer" : "default",
          opacity: text.trim() && !sending ? 1 : 0.5,
        }}
      >
        {sending ? "Sending…" : "Send"}
      </button>
    </div>
  );
}
