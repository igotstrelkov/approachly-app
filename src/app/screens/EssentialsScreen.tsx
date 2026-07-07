"use client";
import { useRef, useState } from "react";
import { useApp } from "../AppContext";
import { DISPLAY, GO_GRAD, iconBtn, MONO } from "../theme";

const FIVE: { h: string; beats: string[] }[] = [
  {
    h: "Move on five",
    beats: [
      "The moment you notice her, you've got about five seconds before your head takes over.",
      "Wait longer and the overthinking brain kicks in — inventing scenarios, weighing odds, freezing you in place. That's the enemy. Not her, not the moment.",
      "So don't negotiate with it. Count down, and let your feet start moving before the fear finishes its sentence.",
    ],
  },
  {
    h: "Stand easy",
    beats: [
      "Your body settles before your words do — and it settles you, not just her.",
      "Shoulders down, stand tall, unhurried. Meet her eyes and hold a beat — warm, not a staring contest.",
      "A nervous posture feeds the nerves; an easy one quiets them. You're not performing anything — you're just not rushing.",
    ],
  },
  {
    h: "Say the real thing",
    beats: [
      "No scripts. No lines you copied off the internet.",
      "People clock a rehearsed bit instantly, and it reads like you're hiding. Honest is more disarming anyway.",
      "Keep it simple, direct, true: “Hey — this is random, but I saw you and had to say hi.” That's the whole move.",
    ],
  },
  {
    h: "Walk in unattached",
    beats: [
      "Most men freeze because they're scared of the “no.” So take its power away — walk over wanting nothing.",
      "If she's got a boyfriend or she's just not feeling it: smile, wish her a good one, and go. No sting to nurse.",
      "You didn't lose. You did the rep — and the rep was always the win.",
    ],
  },
  {
    h: "Leave it clean",
    beats: [
      "You don't have to fill thirty minutes. A short, warm exchange is a complete rep.",
      "When it's found its natural end, be straight about it: if it felt mutual, ask once — “I'd love to keep talking, can I get your number?” No pressure, no angle.",
      "Then go, warm. Whatever she says, you already won the second you walked over.",
    ],
  },
];

export function EssentialsScreen() {
  const { nav } = useApp();
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const last = index === FIVE.length - 1;

  const goTo = (i: number) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
  };
  const onScroll = () => {
    const el = trackRef.current;
    if (!el) return;
    const i = Math.round(el.scrollLeft / el.clientWidth);
    if (i !== index) setIndex(i);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(120% 70% at 50% 0%, #241a10 0%, var(--ink) 55%)",
        display: "flex",
        flexDirection: "column",
        padding: "calc(env(safe-area-inset-top, 0px) + 20px) 0 30px",
      }}
    >
      {/* Header: close + counter */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 22px",
          marginBottom: 8,
        }}
      >
        <button onClick={() => nav("home")} style={{ ...iconBtn }}>
          ✕
        </button>
        <span
          style={{
            fontFamily: MONO,
            fontSize: 12,
            letterSpacing: 1.5,
            color: "var(--ash)",
          }}
        >
          {index + 1} / {FIVE.length}
        </span>
      </div>

      {/* Swipe track */}
      <div
        ref={trackRef}
        onScroll={onScroll}
        style={{
          flex: 1,
          display: "flex",
          overflowX: "auto",
          overflowY: "hidden",
          scrollSnapType: "x mandatory",
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {FIVE.map((f, i) => (
          <div
            key={f.h}
            style={{
              minWidth: "100%",
              scrollSnapAlign: "center",
              display: "flex",
              flexDirection: "column",
              overflowY: "auto",
              scrollbarWidth: "none",
              padding: "0 30px",
            }}
          >
            {/* margin:auto centers when short, scrolls-from-top when tall — no clipping */}
            <div style={{ margin: "auto 0", padding: "20px 0" }}>
              <div
                style={{
                  fontFamily: DISPLAY,
                  fontSize: 64,
                  color: "var(--ember)",
                  lineHeight: 1,
                  marginBottom: 10,
                }}
              >
                {i + 1}
              </div>
              <div
                style={{
                  fontFamily: DISPLAY,
                  fontSize: 34,
                  color: "var(--bone)",
                  textTransform: "uppercase",
                  lineHeight: 1.02,
                  marginBottom: 22,
                }}
              >
                {f.h}
              </div>
              <div
                style={{ display: "flex", flexDirection: "column", gap: 16 }}
              >
                {f.beats.map((b, bi) => (
                  <p
                    key={bi}
                    style={{
                      margin: 0,
                      fontSize: 15.5,
                      color: bi === 0 ? "var(--bone)" : "var(--ash)",
                      lineHeight: 1.55,
                    }}
                  >
                    {b}
                  </p>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Dots */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 8,
          padding: "22px 0 18px",
        }}
      >
        {FIVE.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Go to ${i + 1}`}
            style={{
              width: i === index ? 22 : 8,
              height: 8,
              borderRadius: 4,
              border: "none",
              padding: 0,
              cursor: "pointer",
              background: i === index ? "var(--ember)" : "var(--slate)",
              transition: "width .2s, background .2s",
            }}
          />
        ))}
      </div>

      {/* Advance / finish */}
      <div style={{ padding: "0 22px" }}>
        <button
          onClick={() => (last ? nav("home") : goTo(index + 1))}
          style={{
            width: "100%",
            border: "none",
            borderRadius: 20,
            padding: 18,
            cursor: "pointer",
            background: last
              ? GO_GRAD
              : "linear-gradient(180deg,#FFC65E,var(--ember))",
            color: last ? "#07130C" : "#2a1a05",
            fontFamily: DISPLAY,
            fontSize: 20,
            textTransform: "uppercase",
          }}
        >
          {last ? "Got it — let's go" : "Next"}
        </button>
      </div>
    </div>
  );
}
