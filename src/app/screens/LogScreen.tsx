"use client";
import { useApp } from "../AppContext";
import { AnxRow } from "../components/AnxRow";
import { DISPLAY, GO_GRAD, iconBtn } from "../theme";

export function LogScreen() {
  const { nav, setDraft, draft, optStyle, setAnx, anxScale, logIt } = useApp();
  const canLog = !!draft.vibe && draft.anxiety >= 1;
  const label = !draft.vibe
    ? "Pick how it went ↑"
    : draft.anxiety < 1
      ? "Rate your nerves ↑"
      : "Log it";
  return (
          <div
            style={{
              minHeight: "100vh",
              padding: "calc(env(safe-area-inset-top, 0px) + 20px) 22px 34px",
              display: "flex",
              flexDirection: "column",
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
                ✕
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
              You did it.
              <br />
              How&apos;d it go?
            </div>
            <div
              style={{ fontSize: 13.5, color: "var(--ash)", marginBottom: 24 }}
            >
              Both count exactly the same.
            </div>

            <div style={{ display: "flex", gap: 11, marginBottom: 30 }}>
              <button
                onClick={() => setDraft((d) => ({ ...d, vibe: "GREAT_SET" }))}
                style={{
                  flex: 1,
                  textAlign: "left",
                  cursor: "pointer",
                  borderRadius: 18,
                  padding: "18px 16px",
                  ...optStyle(draft.vibe === "GREAT_SET"),
                }}
              >
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: "var(--go)",
                    marginBottom: 12,
                  }}
                />
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 15.5,
                    color: "var(--bone)",
                  }}
                >
                  Great set
                </div>
                <div
                  style={{ fontSize: 12, color: "var(--ash)", marginTop: 2 }}
                >
                  Flowed, connected.
                </div>
              </button>
              <button
                onClick={() => setDraft((d) => ({ ...d, vibe: "STILL_A_REP" }))}
                style={{
                  flex: 1,
                  textAlign: "left",
                  cursor: "pointer",
                  borderRadius: 18,
                  padding: "18px 16px",
                  background:
                    draft.vibe === "STILL_A_REP"
                      ? "rgba(224,160,48,.1)"
                      : "var(--charcoal)",
                  border: `1.5px solid ${draft.vibe === "STILL_A_REP" ? "var(--amber)" : "var(--slate)"}`,
                }}
              >
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: "var(--amber)",
                    marginBottom: 12,
                  }}
                />
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 15.5,
                    color: "var(--bone)",
                  }}
                >
                  Still a rep
                </div>
                <div
                  style={{ fontSize: 12, color: "var(--ash)", marginTop: 2 }}
                >
                  Flat or awkward — carried it anyway.
                </div>
              </button>
            </div>

            <div
              style={{
                fontWeight: 600,
                fontSize: 15,
                color: "var(--bone)",
                marginBottom: 3,
              }}
            >
              How anxious were you, right before?
            </div>
            <div
              style={{ fontSize: 12.5, color: "var(--ash)", marginBottom: 16 }}
            >
              Tap one. Just for you — it&apos;s how we track your fear falling.
            </div>
            <AnxRow value={draft.anxiety} onPick={setAnx} />
            <div style={{ marginBottom: 26 }}>{anxScale}</div>

            <input
              value={draft.note}
              onChange={(e) =>
                setDraft((d) => ({ ...d, note: e.target.value }))
              }
              placeholder="One line for yourself (optional)"
              style={{
                width: "100%",
                background: "var(--slate)",
                border: "1px solid var(--slateHi)",
                borderRadius: 14,
                padding: "15px 16px",
                color: "var(--bone)",
                fontSize: 14,
                marginBottom: 24,
              }}
            />

            <div style={{ flex: 1 }} />
            <button
              onClick={logIt}
              disabled={!canLog}
              style={{
                width: "100%",
                border: "none",
                borderRadius: 20,
                padding: 19,
                cursor: canLog ? "pointer" : "not-allowed",
                background: canLog ? GO_GRAD : "var(--slate)",
                color: canLog ? "#07130C" : "var(--ashDim)",
                fontFamily: DISPLAY,
                fontSize: 22,
                textTransform: "uppercase",
              }}
            >
              {label}
            </button>
          </div>
  );
}
