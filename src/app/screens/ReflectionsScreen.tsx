"use client";
import { useState } from "react";
import { useApp } from "../AppContext";
import { DISPLAY, eyebrow, GO_GRAD, iconBtn, MONO } from "../theme";

// Calendar-day heading (not a rolling 24h window) so reps bucket the way a
// person reads a journal: Today / Yesterday / "Mar 3" (+ year if not this one).
function dayHeading(ts: number): string {
  const d = new Date(ts);
  const now = new Date();
  const startOf = (x: Date) =>
    new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diff = Math.round((startOf(now) - startOf(d)) / 86_400_000);
  if (diff <= 0) return "Today";
  if (diff === 1) return "Yesterday";
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    ...(d.getFullYear() !== now.getFullYear() ? { year: "numeric" } : {}),
  });
}

function timeOf(ts: number): string {
  return new Date(ts).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function ReflectionsScreen() {
  const { nav, recentReps, editNoteMut, showToast } = useApp();
  // Full timeline — every rep you've shown up for, newest first (recentReps is
  // ordered desc, capped at the last 30). Notes appear inline where written.
  const timeline = recentReps ?? [];
  const [editingId, setEditingId] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);

  const startEdit = (id: string, note: string) => {
    setEditingId(id);
    setText(note);
  };

  // Bucket the sorted reps into consecutive calendar-day groups for headers.
  const groups: { key: string; reps: typeof timeline }[] = [];
  for (const r of timeline) {
    const key = dayHeading(r.timestamp);
    const last = groups[groups.length - 1];
    if (last && last.key === key) last.reps.push(r);
    else groups.push({ key, reps: [r] });
  }

  const renderRep = (r: (typeof timeline)[number]) => {
    const editing = editingId === r._id;
    const good = r.vibe === "GREAT_SET";
    const outcomeColor = good ? "var(--go)" : "var(--amber)";
    const hasBody = editing || !!r.note?.trim();
    return (
      <div
        key={r._id}
        style={{ padding: "15px 0", borderBottom: "1px solid var(--slate)" }}
      >
        {/* Outcome + time + note affordance */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 9,
            marginBottom: 7,
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              flexShrink: 0,
              borderRadius: "50%",
              background: outcomeColor,
            }}
          />
          <span style={{ fontFamily: MONO, fontSize: 11.5, flex: 1 }}>
            <span style={{ color: outcomeColor, fontWeight: 700 }}>
              {good ? "Felt good" : "Felt rough"}
            </span>
            <span style={{ color: "var(--ash)" }}> · {timeOf(r.timestamp)}</span>
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
              {r.note?.trim() ? "Edit" : "+ Note"}
            </button>
          )}
        </div>

        {/* Nerves walked in with + whether they breathed first */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            flexWrap: "wrap",
            marginBottom: hasBody ? 10 : 0,
            paddingLeft: 17,
          }}
        >
          <span
            style={{ fontFamily: MONO, fontSize: 11.5, color: "var(--ash)" }}
          >
            Nerves {r.anxietyBefore}/10
          </span>
          {r.beatTheFreezeUsed && (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                fontFamily: MONO,
                fontSize: 10.5,
                fontWeight: 700,
                letterSpacing: 0.5,
                textTransform: "uppercase",
                color: "var(--amber)",
                background: "rgba(255,178,62,.12)",
                border: "1px solid rgba(255,178,62,.28)",
                borderRadius: 999,
                padding: "2px 9px",
              }}
            >
              ⚡ Breathed first
            </span>
          )}
        </div>

        {editing ? (
          <div style={{ paddingLeft: 17 }}>
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
        ) : r.note?.trim() ? (
          <div
            style={{
              fontSize: 14,
              color: "var(--bone)",
              lineHeight: 1.5,
              whiteSpace: "pre-wrap",
              overflowWrap: "anywhere",
              paddingLeft: 17,
            }}
          >
            {r.note}
          </div>
        ) : null}
      </div>
    );
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
        Your reps
      </div>
      <div style={{ fontSize: 13.5, color: "var(--ash)", marginBottom: 24 }}>
        Every rep you&apos;ve shown up for — the nerves, and what you wrote.
      </div>

      {timeline.length === 0 ? (
        <div
          style={{
            fontSize: 14,
            color: "var(--ash)",
            lineHeight: 1.6,
            padding: "24px 0",
          }}
        >
          No reps yet. Log your first one and it&apos;ll show up here — every one
          you show up for, and how far the fear has dropped.
        </div>
      ) : (
        groups.map((g, gi) => (
          <div key={g.key}>
            <div
              style={{
                ...eyebrow("var(--ashDim)"),
                letterSpacing: 2,
                marginTop: gi === 0 ? 4 : 24,
                marginBottom: 4,
              }}
            >
              {g.key}
            </div>
            {g.reps.map(renderRep)}
          </div>
        ))
      )}
    </div>
  );
}
