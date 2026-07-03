"use client";
import { useApp } from "../AppContext";
import { DISPLAY, eyebrow, GO_GRAD, iconBtn, MONO } from "../theme";

export function HypeScreen() {
  const { nav, hypeStep, hypeWhy, hypeGo, hypeCount, startLog } = useApp();
  return (
          <div
            style={{
              minHeight: "100vh",
              background:
                "radial-gradient(120% 70% at 50% 0%, #241a10 0%, var(--ink) 55%)",
              display: "flex",
              flexDirection: "column",
              padding: "calc(env(safe-area-inset-top, 0px) + 20px) 24px 34px",
            }}
          >
            {hypeStep === "primer" && (
              <>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: 20,
                  }}
                >
                  <button onClick={() => nav("home")} style={{ ...iconBtn }}>
                    ✕
                  </button>
                </div>
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                  }}
                >
                  <div style={{ ...eyebrow("var(--ash)"), marginBottom: 12 }}>
                    Before you walk over
                  </div>
                  <div
                    style={{
                      fontFamily: DISPLAY,
                      fontSize: 34,
                      color: "var(--bone)",
                      textTransform: "uppercase",
                      lineHeight: 1,
                      marginBottom: 26,
                    }}
                  >
                    The freeze is
                    <br />
                    the only enemy.
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: 13,
                      alignItems: "center",
                      background: "var(--charcoal)",
                      border: "1px solid var(--slate)",
                      borderRadius: 16,
                      padding: 16,
                      marginBottom: 12,
                    }}
                  >
                    <div
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: 11,
                        background: "rgba(255,178,62,.14)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        color: "var(--ember)",
                        fontSize: 18,
                      }}
                    >
                      ✦
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: 12,
                          color: "var(--ash)",
                          marginBottom: 2,
                        }}
                      >
                        You&apos;re doing this for
                      </div>
                      <div
                        style={{
                          fontSize: 15,
                          color: "var(--bone)",
                          fontWeight: 600,
                        }}
                      >
                        {hypeWhy()}
                      </div>
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: 13,
                      alignItems: "center",
                      background: "var(--charcoal)",
                      border: "1px solid var(--slate)",
                      borderRadius: 16,
                      padding: 16,
                      marginBottom: 12,
                    }}
                  >
                    <div
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: 11,
                        background: "rgba(90,155,230,.14)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        color: "var(--cool)",
                        fontSize: 18,
                      }}
                    >
                      “
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: 12,
                          color: "var(--ash)",
                          marginBottom: 2,
                        }}
                      >
                        An easy opener
                      </div>
                      <div
                        style={{
                          fontSize: 15,
                          color: "var(--bone)",
                          fontWeight: 600,
                        }}
                      >
                        &quot;Hey — this is random, but I saw you and had to say
                        hi.&quot;
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: "center", marginTop: 22 }}>
                    <div
                      style={{
                        width: 96,
                        height: 96,
                        borderRadius: "50%",
                        margin: "0 auto 12px",
                        border: "1.5px solid var(--ember)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <div
                        style={{
                          width: 70,
                          height: 70,
                          borderRadius: "50%",
                          background: "rgba(255,178,62,.18)",
                          animation: "aBreath 4s ease-in-out infinite",
                        }}
                      />
                    </div>
                    <div style={{ fontSize: 12.5, color: "var(--ash)" }}>
                      One slow breath in… and out.
                    </div>
                  </div>
                </div>
                <button
                  onClick={hypeGo}
                  style={{
                    width: "100%",
                    border: "none",
                    borderRadius: 20,
                    padding: 19,
                    cursor: "pointer",
                    background: "linear-gradient(180deg,#FFC65E,var(--ember))",
                    color: "#2a1a05",
                    fontFamily: DISPLAY,
                    fontSize: 22,
                    textTransform: "uppercase",
                    boxShadow: "0 14px 40px -10px rgba(255,178,62,.5)",
                  }}
                >
                  I&apos;m ready — count me down
                </button>
              </>
            )}

            {hypeStep === "countdown" && (
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    position: "relative",
                    width: 200,
                    height: 200,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      borderRadius: "50%",
                      border: "2px solid var(--ember)",
                      opacity: 0.5,
                      animation: "aRing 1s ease-out infinite",
                    }}
                  />
                  <span
                    style={{
                      fontFamily: DISPLAY,
                      fontSize: 130,
                      color: "var(--ember)",
                      lineHeight: 1,
                      animation: "aCount 1s ease-out",
                    }}
                    key={hypeCount}
                  >
                    {hypeCount}
                  </span>
                </div>
                <div
                  style={{
                    fontFamily: MONO,
                    fontSize: 12,
                    letterSpacing: 2,
                    color: "var(--ash)",
                    textTransform: "uppercase",
                    marginTop: 20,
                  }}
                >
                  Lock eyes. Smile. Move your feet.
                </div>
              </div>
            )}

            {hypeStep === "go" && (
              <>
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      fontFamily: DISPLAY,
                      fontSize: 96,
                      color: "var(--go)",
                      textTransform: "uppercase",
                      lineHeight: 1,
                      animation: "aPop .4s cubic-bezier(.2,.8,.3,1.2) both",
                    }}
                  >
                    Go.
                  </div>
                  <div
                    style={{
                      fontSize: 17,
                      color: "var(--bone)",
                      fontWeight: 700,
                      marginTop: 8,
                    }}
                  >
                    Walk over. Right now.
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: "var(--ash)",
                      marginTop: 8,
                      maxWidth: 280,
                      lineHeight: 1.5,
                    }}
                  >
                    Whatever happens next, you already won the second you moved.
                  </div>
                </div>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 11 }}
                >
                  <button
                    onClick={startLog}
                    style={{
                      width: "100%",
                      border: "none",
                      borderRadius: 20,
                      padding: 18,
                      cursor: "pointer",
                      background: GO_GRAD,
                      color: "#07130C",
                      fontFamily: DISPLAY,
                      fontSize: 20,
                      textTransform: "uppercase",
                    }}
                  >
                    I took the shot — log it
                  </button>
                  <button
                    onClick={() => nav("home")}
                    style={{
                      width: "100%",
                      border: "1px solid var(--slateHi)",
                      borderRadius: 16,
                      padding: 15,
                      background: "none",
                      color: "var(--ash)",
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Not yet — back
                  </button>
                </div>
              </>
            )}
          </div>
  );
}
