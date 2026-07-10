"use client";
import { trackCustom } from "@/lib/analytics";
import { useApp } from "../AppContext";
import { DISPLAY, eyebrow, GO_GRAD, iconBtn, MONO } from "../theme";

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
    freezePulse,
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
        <button
          onClick={() => nav("ranks")}
          style={{
            background: "var(--charcoal)",
            border: "1px solid var(--slate)",
            borderRadius: 999,
            padding: "8px 14px",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            textAlign: "left",
            transition: "border-color 0.15s ease, background-color 0.15s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "var(--slateHi)";
            e.currentTarget.style.backgroundColor = "var(--charcoal2)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "var(--slate)";
            e.currentTarget.style.backgroundColor = "var(--charcoal)";
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <div
              style={{
                ...eyebrow("var(--ember)"),
              }}
            >
              Lvl {level} · {rank}
            </div>
            {/* <div
              style={{
                width: 70,
                height: 3,
                borderRadius: 999,
                background: "var(--slate)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${levelPct}%`,
                  background: "linear-gradient(90deg, var(--ember), #FFCF7A)",
                  borderRadius: 999,
                }}
              />
            </div> */}
          </div>
          <span
            style={{
              color: "var(--ash)",

              lineHeight: 1,
              transform: "translateY(-0.5px)",
            }}
          >
            ›
          </span>
        </button>
        <button
          onClick={() => nav("you")}
          aria-label="Profile"
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
          <div style={{ ...eyebrow("var(--ash)"), marginBottom: 10 }}>
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
                fill={chart.chartDotColor}
              />
              <circle
                cx={chart.chartDotX}
                cy={chart.chartDotY}
                r="6"
                fill="none"
                stroke={chart.chartDotColor}
                strokeWidth="2"
                opacity="0.5"
                style={{
                  transformOrigin: `${chart.chartDotX}px ${chart.chartDotY}px`,
                  animation: "aRing 2.2s ease-out infinite",
                }}
              />
            </g>
          </svg>

          {/* Rising-week reassurance — only when the recent trend ticks up. Calm,
              never an alarm: an amber-tinted note + a reframed caption. */}
          {chart.risingWeek && (
            <>
              <div
                style={{
                  background: "rgba(224,160,48,.12)",
                  borderRadius: 12,
                  padding: "10px 12px",
                  fontSize: 12.5,
                  lineHeight: 1.4,
                  color: "var(--amber)",
                }}
              >
                {chart.chartNote}
              </div>
              {/* <div
                style={{
                  fontSize: 12,
                  color: "var(--ash)",
                  fontStyle: "italic",
                  marginTop: 8,
                }}
              >
                {chart.chartSubcaption}
              </div> */}
            </>
          )}

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
              {/* <span style={{ fontSize: 15, lineHeight: 1 }}>
                {todayMode.emoji}
              </span> */}
              {/* <span
                style={{
                  letterSpacing: 1.5,
                  color: "var(--ash)",
                  textTransform: "uppercase",
                }}
              >
                Today
              </span> */}
              <span style={{ fontWeight: 700, color: todayMode.color }}>
                {todayMode.name}
              </span>
              <span style={{ color: "var(--ash)" }}>·</span>
              <span style={{ color: "var(--ash)" }}>
                {user.repsToday === 1
                  ? "you showed up today"
                  : `${user.repsToday} reps banked today`}{" "}
                <span style={{ color: "var(--ash)" }}>✓</span>
              </span>
            </div>
          )}
        </>
      )}

      {/* ACTIONS */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
          marginTop: 32,
        }}
      >
        {/* Beat the Freeze — amber co-hero. Freezing happens BEFORE the approach,
            so it leads. Pulses until the ritual is opened for the day. */}
        <button
          onClick={startHype}
          className={freezePulse ? "cg-freeze-pulse" : undefined}
          style={{
            width: "100%",
            cursor: "pointer",
            border: "none",
            background: "linear-gradient(180deg,#FFC65E,var(--ember))",
            color: "#2a1a05",
            borderRadius: 22,
            padding: "24px 20px",
            boxShadow: "0 14px 40px -10px rgba(255,178,62,.5)",
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
            Beat the freeze
          </div>
          <div
            style={{
              fontSize: 12.5,
              fontWeight: 600,
              opacity: 0.75,
              marginTop: 6,
            }}
          >
            Frozen? One breath and go.
          </div>
        </button>
        {/* Log a Rep — green co-hero. Logging happens AFTER, so it follows. */}
        <button
          onClick={() => startLog()}
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
          onClick={() => {
            trackCustom("PlaybookOpened");
            nav("essentials");
          }}
          style={{
            width: "100%",
            cursor: "pointer",
            background: "none",
            border: "1px solid var(--slate)",
            borderRadius: 20,
            padding: "16px 20px",
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
              background: "var(--slate)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--ash)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="9" y1="6" x2="20" y2="6" />
              <line x1="9" y1="12" x2="20" y2="12" />
              <line x1="9" y1="18" x2="20" y2="18" />
              <line x1="4" y1="6" x2="4" y2="6" />
              <line x1="4" y1="12" x2="4" y2="12" />
              <line x1="4" y1="18" x2="4" y2="18" />
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontWeight: 700,
                fontSize: 15,
                color: "var(--bone)",
              }}
            >
              The playbook
            </div>
            <div
              style={{
                fontSize: 12.5,
                color: "var(--ash)",
                marginTop: 1,
              }}
            >
              Every approach, first look to clean exit.
            </div>
          </div>
          <span style={{ color: "var(--ash)", fontSize: 20 }}>›</span>
        </button>
      </div>

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
                h: "Take the shot",
                p: "Lock eyes, walk into her space and say hi.",
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
              {/* Calm orientation, not a countdown: names when the week rolls
                  over without manufacturing deadline pressure. */}
              <div
                style={{
                  fontSize: 11.5,
                  color: "var(--ashDim)",
                  marginTop: 8,
                }}
              >
                New week starts Monday
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
            {/* Lifetime totals + earned stats now live on the Stats screen
                (top-right chart button) — Home stays action-first. */}
          </div>
        </div>
      )}
    </div>
  );
}
