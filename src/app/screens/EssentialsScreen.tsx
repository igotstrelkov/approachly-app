"use client";
import { useRef, useState } from "react";
import { useApp } from "../AppContext";
import { DISPLAY, GO_GRAD, iconBtn, MONO } from "../theme";

const FIVE: { h: string; beats: string[] }[] = [
  {
    h: "The 5-Second Rule",
    beats: [
      "The moment you see her, you have exactly five seconds to move.",
      "If you hesitate longer, your logical brain will kick in, create fake scenarios, and paralyze you with overthinking.",
      "Kill the hesitation, lock your eyes on the target, and immediately step into her space.",
    ],
  },
  {
    h: "Lead with Absolute Body Language",
    beats: [
      "Before you even open your mouth, your posture has already spoken for you.",
      "Keep your shoulders back, stand tall, and maintain unbreakable eye contact.",
      "A slouching, nervous posture instantly screams low status. Walk in with the unshakeable presence of a man who belongs in that room.",
    ],
  },
  {
    h: "Drop the Cringe Pick-Up Lines",
    beats: [
      "Never use scripted, cheesy lines you found on the internet.",
      "High-value women spot artificial game from a mile away.",
      "Keep your opening simple, direct, and completely honest.",
      "A confident, masculine “Hey, I saw you standing here and I had to come over and meet you” works 100% better.",
    ],
  },
  {
    h: "Be Completely Detached from the Outcome",
    beats: [
      "The reason most men freeze is because they are terrified of rejection.",
      "You must enter the approach with zero expectations.",
      "If she has a boyfriend or isn't interested, you simply smile, wish her a good day, and walk away with your head high.",
      "You don't lose—you either win or you build mental toughness.",
    ],
  },
  {
    h: "Clear Execution & The Clean Exit",
    beats: [
      "Do not linger around making awkward small talk for thirty minutes.",
      "Keep the initial interaction short, high-energy, and impactful. Once you establish a strong vibe, state your intent clearly, exchange contact information, and make a clean exit.",
      "Leave her wanting to know more about you.",
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
