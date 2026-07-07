"use client";
import { useState } from "react";
import { useApp } from "../AppContext";
import { DISPLAY, GO_GRAD, iconBtn, MONO } from "../theme";

function stamp(ts: number) {
  const day = Math.floor((Date.now() - ts) / 86_400_000);
  const label =
    day <= 0
      ? "Today"
      : day === 1
        ? "Yesterday"
        : new Date(ts).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
          });
  const time = new Date(ts).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
  return `${label} · ${time}`;
}

export function ReflectionsScreen() {
  const { nav, recentReps, editNoteMut, showToast } = useApp();
  const reflections = (recentReps ?? []).filter((r) => r.note?.trim());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);

  const startEdit = (id: string, note: string) => {
    setEditingId(id);
    setText(note);
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
        Reflections
      </div>
      <div style={{ fontSize: 13.5, color: "var(--ash)", marginBottom: 24 }}>
        What you wrote, and the nerves you walked in with.
      </div>

      {reflections.length === 0 ? (
        <div
          style={{
            fontSize: 14,
            color: "var(--ash)",
            lineHeight: 1.6,
            padding: "24px 0",
          }}
        >
          Nothing here yet. After your next rep, jot a line in the reflection box
          — it&apos;ll show up here so you can look back on how far the fear has
          dropped.
        </div>
      ) : (
        reflections.map((r) => {
          const editing = editingId === r._id;
          return (
            <div
              key={r._id}
              style={{
                padding: "16px 0",
                borderBottom: "1px solid var(--slate)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 8,
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background:
                      r.vibe === "GREAT_SET" ? "var(--go)" : "var(--amber)",
                  }}
                />
                <span
                  style={{
                    fontFamily: MONO,
                    fontSize: 11.5,
                    color: "var(--ash)",
                    flex: 1,
                  }}
                >
                  {stamp(r.timestamp)} · Felt {r.anxietyBefore}/10 before
                </span>
                {!editing && (
                  <button
                    onClick={() => startEdit(r._id, r.note ?? "")}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--ash)",
                      fontFamily: MONO,
                      fontSize: 12,
                      padding: "2px 4px",
                    }}
                  >
                    Edit
                  </button>
                )}
              </div>

              {editing ? (
                <div>
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onInput={(e) => {
                      const el = e.currentTarget;
                      el.style.height = "auto";
                      el.style.height = `${el.scrollHeight}px`;
                    }}
                    rows={3}
                    autoFocus
                    style={{
                      width: "100%",
                      background: "var(--slate)",
                      border: "1px solid var(--slateHi)",
                      borderRadius: 14,
                      padding: "13px 15px",
                      color: "var(--bone)",
                      fontSize: 14,
                      fontFamily: "inherit",
                      lineHeight: 1.5,
                      resize: "none",
                      minHeight: 78,
                      overflow: "hidden",
                      boxSizing: "border-box",
                    }}
                  />
                  <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                    <button
                      onClick={async () => {
                        if (saving) return;
                        setSaving(true);
                        try {
                          await editNoteMut({
                            approachId: r._id,
                            note: text.trim(),
                          });
                          setEditingId(null);
                          showToast(
                            text.trim() ? "Reflection saved." : "Reflection cleared.",
                          );
                        } catch {
                          showToast("Couldn't save — try again.");
                        } finally {
                          setSaving(false);
                        }
                      }}
                      disabled={saving}
                      style={{
                        flex: 1,
                        border: "none",
                        borderRadius: 12,
                        padding: 12,
                        background: GO_GRAD,
                        color: "#07130C",
                        fontFamily: DISPLAY,
                        fontSize: 15,
                        textTransform: "uppercase",
                        cursor: saving ? "default" : "pointer",
                        opacity: saving ? 0.6 : 1,
                      }}
                    >
                      {saving ? "Saving…" : "Save"}
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      style={{
                        border: "1px solid var(--slate)",
                        borderRadius: 12,
                        padding: "12px 18px",
                        background: "none",
                        color: "var(--ash)",
                        fontSize: 14,
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    fontSize: 14,
                    color: "var(--bone)",
                    lineHeight: 1.5,
                    whiteSpace: "pre-wrap",
                    overflowWrap: "anywhere",
                  }}
                >
                  {r.note}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
