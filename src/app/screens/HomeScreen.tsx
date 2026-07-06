"use client";
import { useApp } from "../AppContext";
import { DISPLAY, eyebrow, GO_GRAD, iconBtn, MONO } from "../theme";
import { CHALLENGE_LENGTH } from "../lib/ladder";

export function HomeScreen() {
  const {
    level,
    rank,
    nav,
    isFresh,
    baselineAnx,
    fearLabel,
    chart,
    hasRepsToday,
    todayMode,
    user,
    startHype,
    startLog,
    levelPct,
    nextRankHint,
    xpToNext,
    challengeDay,
    challengeDone,
    today,
    startMission,
    stepBackDay,
    logFreeform,
  } = useApp();
  return (
    <div
      style={{
        padding: "calc(env(safe-area-inset-top, 0px) + 20px) 22px 44px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 34,
        }}
      >
        <div style={{ ...eyebrow("var(--ember)"), letterSpacing: 2 }}>
          Lvl {level} · {rank}
        </div>
        <button
          onClick={() => nav("you")}
          style={{
            ...iconBtn,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="8" r="4" />
            <path d="M4 20 c0-4 4-6 8-6 s8 2 8 6" />
          </svg>
        </button>
      </div>

      {isFresh ? (
        <>
          <div style={{ ...eyebrow("var(--go)"), marginBottom: 10 }}>
            Day zero
          </div>
          <div
            style={{
              fontFamily: DISPLAY,
              fontSize: 42,
              lineHeight: 0.96,
              textTransform: "uppercase",
              color: "var(--bone)",
              marginBottom: 18,
            }}
          >
            Your line
            <br />
            starts here.
          </div>
          <div
            style={{
              background: "var(--charcoal)",
              border: "1px solid var(--slate)",
              borderRadius: 20,
              padding: 20,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "space-between",
                marginBottom: 14,
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 12,
                    color: "var(--ash)",
                    marginBottom: 3,
                  }}
                >
                  Where your fear is today
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: 8,
                  }}
                >
                  <span
                    style={{
                      fontFamily: DISPLAY,
                      fontSize: 58,
                      lineHeight: 0.85,
                      color: "var(--bone)",
                    }}
                  >
                    {baselineAnx}
                  </span>
                  <span
                    style={{
                      fontFamily: MONO,
                      fontSize: 13,
                      color: "var(--ash)",
                    }}
                  >
                    /10
                  </span>
                </div>
              </div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  background: "rgba(52,209,126,.12)",
                  borderRadius: 999,
                  padding: "7px 12px",
                }}
              >
                <span
                  style={{
                    fontFamily: MONO,
                    fontSize: 12,
                    color: "var(--go)",
                    fontWeight: 700,
                  }}
                >
                  Baseline
                </span>
              </div>
            </div>
            <svg viewBox="0 0 360 84" width="100%" style={{ display: "block" }}>
              <path
                d="M12 20 C110 26, 240 58, 348 72"
                fill="none"
                stroke="var(--go)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeDasharray="3 7"
                opacity="0.55"
              />
              <circle cx="12" cy="20" r="6" fill="var(--go)" />
              <circle
                cx="348"
                cy="72"
                r="4"
                fill="none"
                stroke="var(--ash)"
                strokeWidth="2"
                opacity="0.5"
              />
            </svg>
            <div
              style={{
                fontSize: 12.5,
                color: "var(--ash)",
                fontStyle: "italic",
                marginTop: 8,
              }}
            >
              Log your first rep to draw the first real point. From here, the
              only way is down.
            </div>
          </div>
        </>
      ) : (
        <>
          <div style={{ ...eyebrow("var(--ash)"), marginBottom: 10 }}>
            {fearLabel}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              marginBottom: 18,
            }}
          >
            <div style={{ display: "flex", alignItems: "baseline", gap: 9 }}>
              <span
                style={{
                  fontFamily: DISPLAY,
                  fontSize: 76,
                  lineHeight: 0.82,
                  color: "var(--bone)",
                }}
              >
                {chart.chartCurrent}
              </span>
              <span
                style={{
                  fontFamily: MONO,
                  fontSize: 13,
                  color: "var(--ash)",
                }}
              >
                /10
              </span>
            </div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                background: chart.chartTrendTint,
                borderRadius: 999,
                padding: "7px 12px",
                marginBottom: 6,
              }}
            >
              <span style={{ color: chart.chartTrendColor, fontSize: 13 }}>
                {chart.chartArrow}
              </span>
              <span
                style={{
                  fontFamily: MONO,
                  fontSize: 13,
                  color: chart.chartTrendColor,
                  fontWeight: 700,
                }}
              >
                {chart.chartDelta}
              </span>
            </div>
          </div>
          <svg
            viewBox={`0 0 ${chart.chartW} ${chart.chartH}`}
            width="100%"
            style={{
              display: "block",
              overflow: "visible",
              marginBottom: 6,
            }}
          >
            <defs>
              <linearGradient id="heroFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--go)" stopOpacity="0.22" />
                <stop offset="100%" stopColor="var(--go)" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d={chart.chartArea}
              fill="url(#heroFill)"
              style={{ animation: "aFadeIn 1s ease .3s both" }}
            />
            <path
              d={chart.chartRefLine}
              fill="none"
              stroke="var(--ash)"
              strokeWidth="1.5"
              strokeDasharray="3 6"
              strokeLinecap="round"
              opacity="0.3"
              style={{ animation: "aFadeIn 1s ease .6s both" }}
            />
            <path
              d={chart.chartLine}
              fill="none"
              stroke="var(--go)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                strokeDasharray: 600,
                strokeDashoffset: 0,
                animation: "aDraw 1.6s cubic-bezier(.45,0,.2,1) both",
              }}
            />
            <g style={{ animation: "aFadeIn .5s ease 1.2s both" }}>
              <circle
                cx={chart.chartDotX}
                cy={chart.chartDotY}
                r="6"
                fill="var(--go)"
              />
              <circle
                cx={chart.chartDotX}
                cy={chart.chartDotY}
                r="6"
                fill="none"
                stroke="var(--go)"
                strokeWidth="2"
                opacity="0.5"
                style={{
                  transformOrigin: `${chart.chartDotX}px ${chart.chartDotY}px`,
                  animation: "aRing 2.2s ease-out infinite",
                }}
              />
            </g>
          </svg>
          <div
            style={{
              fontSize: 12,
              color: "var(--ash)",
              fontStyle: "italic",
            }}
          >
            {chart.chartSubcaption}
          </div>

          {hasRepsToday && (
            // Quiet today-status strip: reads as status, not an action, so it
            // doesn't compete with the CTA cards below. Affirms the act (never
            // a raw count at 1 — "showing up is the win"); a count only shows
            // from 2+, where it reads as momentum. Non-interactive by design.
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginTop: 18,
                fontFamily: MONO,
                fontSize: 12.5,
              }}
            >
              <span style={{ fontSize: 15, lineHeight: 1 }}>
                {todayMode.emoji}
              </span>
              <span
                style={{
                  letterSpacing: 1.5,
                  color: "var(--ash)",
                  textTransform: "uppercase",
                }}
              >
                Today
              </span>
              <span style={{ fontWeight: 700, color: todayMode.color }}>
                {todayMode.name}
              </span>
              <span style={{ color: "var(--ash)" }}>·</span>
              <span style={{ color: "var(--ash)" }}>
                {user.repsToday === 1
                  ? "you showed up"
                  : `${user.repsToday} reps banked`}{" "}
                <span style={{ color: "var(--ash)" }}>✓</span>
              </span>
            </div>
          )}
        </>
      )}

      {/* ACTIONS */}
      {!challengeDone && (
        <>
          {/* Today's mission — the hero action (7-Day Challenge) */}
          <div
            style={{
              background: "var(--charcoal)",
              border: "1px solid var(--go)",
              borderRadius: 20,
              padding: 20,
              marginTop: 32,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 10,
                marginBottom: 12,
              }}
            >
              <span style={{ ...eyebrow("var(--go)"), letterSpacing: 1.5 }}>
                Day {challengeDay} of {CHALLENGE_LENGTH} · {today.chapter}
              </span>
              <button
                onClick={() => nav("ladder")}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--ash)",
                  fontSize: 12.5,
                  cursor: "pointer",
                  flexShrink: 0,
                  fontFamily: MONO,
                }}
              >
                The challenge ›
              </button>
            </div>
            <div
              style={{
                fontFamily: DISPLAY,
                fontSize: 25,
                color: "var(--bone)",
                lineHeight: 1.05,
                textTransform: "uppercase",
                marginBottom: 8,
              }}
            >
              {today.mission}
            </div>
            <div
              style={{
                fontSize: 13,
                color: "var(--ash)",
                lineHeight: 1.45,
                marginBottom: 16,
              }}
            >
              {today.why}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 10,
                marginBottom: 16,
              }}
            >
              <div style={{ display: "flex", gap: 5, flex: 1 }}>
                {Array.from({ length: CHALLENGE_LENGTH }).map((_, i) => (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      height: 6,
                      borderRadius: 999,
                      background:
                        i < challengeDay - 1 ? "var(--go)" : "var(--slate)",
                    }}
                  />
                ))}
              </div>
              <span
                style={{
                  fontFamily: MONO,
                  fontSize: 11.5,
                  color: "var(--ash)",
                  whiteSpace: "nowrap",
                }}
              >
                Day {challengeDay} of {CHALLENGE_LENGTH}
              </span>
            </div>
            <button
              onClick={startMission}
              style={{
                width: "100%",
                border: "none",
                borderRadius: 16,
                padding: 16,
                background: GO_GRAD,
                color: "#07130C",
                fontFamily: DISPLAY,
                fontSize: 19,
                textTransform: "uppercase",
                cursor: "pointer",
                marginBottom: challengeDay > 1 ? 12 : 0,
              }}
            >
              Start Day {challengeDay} →
            </button>
            {challengeDay > 1 && (
              <button
                onClick={stepBackDay}
                style={{
                  width: "100%",
                  background: "none",
                  border: "none",
                  padding: "4px 0",
                  color: "var(--ash)",
                  fontSize: 12.5,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Too much today — step back a day
              </button>
            )}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              margin: "18px 0",
            }}
          >
            <div style={{ flex: 1, height: 1, background: "var(--slate)" }} />
            <span
              style={{
                fontFamily: MONO,
                fontSize: 11,
                letterSpacing: 2,
                color: "var(--ashDim)",
              }}
            >
              OR
            </span>
            <div style={{ flex: 1, height: 1, background: "var(--slate)" }} />
          </div>
          <button
            onClick={logFreeform}
            style={{
              width: "100%",
              background: "var(--charcoal)",
              border: "1px solid var(--slate)",
              borderRadius: 16,
              padding: "16px 18px",
              cursor: "pointer",
              textAlign: "center",
            }}
          >
            <span
              style={{ fontSize: 15, fontWeight: 700, color: "var(--bone)" }}
            >
              Just log a rep
            </span>
            <span style={{ fontSize: 15, color: "var(--ash)" }}>
              {" "}
              — I did my own thing
            </span>
          </button>
        </>
      )}
      {challengeDone && (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
          marginTop: 32,
        }}
      >
        <button
          onClick={startHype}
          style={{
            width: "100%",
            cursor: "pointer",
            background: "var(--charcoal)",
            border: "1.5px solid var(--ember)",
            borderRadius: 20,
            padding: "18px 20px",
            display: "flex",
            alignItems: "center",
            gap: 14,
            textAlign: "left",
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 13,
              background: "rgba(255,178,62,.14)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--ember)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M13 2 L4 14 H12 L11 22 L20 10 H12 Z" />
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontWeight: 700,
                fontSize: 16,
                color: "var(--bone)",
              }}
            >
              I&apos;m out — hype me
            </div>
            <div
              style={{
                fontSize: 12.5,
                color: "var(--ash)",
                marginTop: 1,
              }}
            >
              Before you walk over. 30 seconds.
            </div>
          </div>
          <span style={{ color: "var(--ember)", fontSize: 22 }}>›</span>
        </button>

        <button
          onClick={startLog}
          style={{
            width: "100%",
            cursor: "pointer",
            border: "none",
            background: GO_GRAD,
            color: "#07130C",
            borderRadius: 22,
            padding: "24px 20px",
            boxShadow: "0 14px 40px -10px rgba(52,209,126,.5)",
          }}
        >
          <div
            style={{
              fontFamily: DISPLAY,
              fontSize: 32,
              textTransform: "uppercase",
              lineHeight: 1,
            }}
          >
            {isFresh ? "Log your first rep" : "Log a rep"}
          </div>
          <div
            style={{
              fontSize: 12.5,
              fontWeight: 600,
              opacity: 0.72,
              marginTop: 6,
            }}
          >
            {isFresh
              ? "You walked over. This is the one."
              : "You walked over. Bank it."}
          </div>
        </button>
          <button
            onClick={() => nav("ladder")}
            style={{
              background: "none",
              border: "1px solid var(--slate)",
              borderRadius: 14,
              padding: 13,
              color: "var(--ash)",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Revisit the challenge ›
          </button>
      </div>
      )}

      {isFresh && (
        <div style={{ marginTop: 42 }}>
          <div
            style={{
              ...eyebrow("var(--ash)"),
              letterSpacing: 2,
              marginBottom: 14,
            }}
          >
            The loop
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              {
                n: 1,
                c: "var(--go)",
                bg: "rgba(255,178,62,.14)",
                h: "Get hyped",
                p: "A 30-second primer to beat the freeze.",
              },
              {
                n: 2,
                c: "var(--go)",
                bg: "rgba(52,209,126,.14)",
                h: "Log the rep",
                p: "Two taps. Great set or flop — both count.",
              },
              {
                n: 3,
                c: "var(--go)",
                bg: "rgba(52,209,126,.14)",
                h: "Watch your fear fall",
                p: "Every rep draws your line further down.",
              },
            ].map((s) => (
              <div
                key={s.n}
                style={{ display: "flex", gap: 13, alignItems: "center" }}
              >
                <div
                  style={{
                    width: 34,
                    height: 34,
                    flexShrink: 0,
                    borderRadius: 10,
                    background: s.bg,
                    border: `1px solid ${s.c}`,
                    color: s.c,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: MONO,
                    fontSize: 14,
                    fontWeight: 700,
                  }}
                >
                  {s.n}
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 14.5,
                      fontWeight: 700,
                      color: "var(--bone)",
                    }}
                  >
                    {s.h}
                  </div>
                  <div style={{ fontSize: 12.5, color: "var(--ash)" }}>
                    {s.p}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!isFresh && (
        <div style={{ marginTop: 46 }}>
          <div>
            {/* GROUP 1 — THIS WEEK (live, emphasized) */}
            <div
              style={{
                ...eyebrow("var(--ash)"),
                letterSpacing: 2,
                marginTop: 24,
                marginBottom: 10,
              }}
            >
              This week
            </div>
            <div
              style={{
                background: "var(--charcoal)",
                border: "1px solid var(--slate)",
                borderRadius: 16,
                padding: "16px 18px",
              }}
            >
              {/* Weekly goal — glanceable pip indicator */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 10,
                }}
              >
                <span style={{ fontSize: 14.5, color: "var(--bone)" }}>
                  Weekly goal
                </span>
                {user.repsThisWeek >= user.weeklyGoal ? (
                  <span
                    style={{
                      fontFamily: MONO,
                      fontSize: 14,
                      color: "var(--go)",
                    }}
                  >
                    Goal hit ✓
                  </span>
                ) : (
                  <span
                    style={{
                      fontFamily: MONO,
                      fontSize: 14,
                      color: "var(--ash)",
                    }}
                  >
                    <span style={{ color: "var(--ash)" }}>
                      {user.repsThisWeek}
                    </span>{" "}
                    / {user.weeklyGoal}
                  </span>
                )}
              </div>
              {/* pip row: weeklyGoal segments, repsThisWeek filled green */}
              <div style={{ display: "flex", gap: 5 }}>
                {Array.from({ length: Math.max(1, user.weeklyGoal) }).map(
                  (_, i) => (
                    <div
                      key={i}
                      style={{
                        flex: 1,
                        height: 6,
                        borderRadius: 999,
                        background:
                          i < Math.min(user.repsThisWeek, user.weeklyGoal)
                            ? "var(--go)"
                            : "var(--slate)",
                      }}
                    />
                  ),
                )}
              </div>
              {/* Streak — weekly, so it lives with the goal */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginTop: 14,
                  paddingTop: 14,
                  borderTop: "1px solid var(--slate)",
                }}
              >
                <span style={{ fontSize: 14.5, color: "var(--bone)" }}>
                  Streak
                </span>
                <span
                  style={{
                    fontFamily: MONO,
                    fontSize: 14,
                    color: "var(--ash)",
                  }}
                >
                  {user.streakWeeks} now · {user.streakLongest} best
                </span>
              </div>
            </div>
            {/* GROUP 2 — LIFETIME (muted totals, recedes) */}
            <div
              style={{
                ...eyebrow("var(--ash)"),
                letterSpacing: 2,
                marginTop: 24,
                marginBottom: 2,
              }}
            >
              Lifetime
            </div>
            {[
              { l: "Total approaches", r: `${user.totalApproaches}` },
              // Great sets: a quiet neutral stat, NOT a maximizable target
              // (reps not results) — no arrow, no accent, no "& climbing".
              { l: "Great sets", r: `${user.greatSets}` },
            ].map((row) => (
              <div
                key={row.l}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "15px 0",
                  borderBottom: "1px solid var(--slate)",
                }}
              >
                <span style={{ fontSize: 14, color: "var(--ash)" }}>
                  {row.l}
                </span>
                <span
                  style={{
                    fontFamily: MONO,
                    fontSize: 14,
                    color: "var(--bone)",
                  }}
                >
                  {row.r}
                </span>
              </div>
            ))}
            {/* GROUP 3 — YOUR JOURNEY (anchors the bottom) */}
            <div
              style={{
                ...eyebrow("var(--ash)"),
                letterSpacing: 2,
                marginTop: 24,
                marginBottom: 10,
              }}
            >
              Your journey
            </div>
            {/* Journey card — ambient hook into the Ranks view (not the hero) */}
            <button
              onClick={() => nav("ranks")}
              style={{
                width: "100%",
                textAlign: "left",
                cursor: "pointer",
                display: "block",
                background: "var(--charcoal)",
                border: "1px solid var(--slate)",
                borderRadius: 16,
                padding: 16,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
                <div
                  style={{
                    width: 46,
                    height: 46,
                    flexShrink: 0,
                    borderRadius: 13,
                    background:
                      "linear-gradient(135deg,var(--ember),var(--flare))",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: DISPLAY,
                    fontSize: 22,
                    color: "#1a0f08",
                  }}
                >
                  {level}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, color: "var(--bone)" }}>
                    <span style={{ fontWeight: 700 }}>{rank}</span>{" "}
                    <span style={{ color: "var(--ash)" }}>· Level {level}</span>
                  </div>
                  <div
                    style={{
                      fontSize: 12.5,
                      color: "var(--ash)",
                      marginTop: 2,
                    }}
                  >
                    {nextRankHint}
                  </div>
                </div>
                <span style={{ color: "var(--ash)", fontSize: 20 }}>›</span>
              </div>
              <div
                style={{
                  height: 6,
                  borderRadius: 999,
                  background: "var(--slate)",
                  overflow: "hidden",
                  marginTop: 14,
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${levelPct}%`,
                    background: "linear-gradient(90deg,var(--ember),#FFCF7A)",
                    borderRadius: 999,
                  }}
                />
              </div>
              <div
                style={{
                  fontFamily: MONO,
                  fontSize: 11.5,
                  color: "var(--ash)",
                  marginTop: 8,
                }}
              >
                {xpToNext} XP to Level {level + 1} · View journey ›
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
