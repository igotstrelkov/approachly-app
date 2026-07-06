"use client";
import { trackCustom } from "@/lib/analytics";
import Image from "next/image";
import { useApp } from "../AppContext";
import { DISPLAY, eyebrow, GO_GRAD, MONO } from "../theme";

export function LandingScreen() {
  const { openSignIn, nav } = useApp();
  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "calc(env(safe-area-inset-top, 0px) + 28px) 22px 40px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 40,
        }}
      >
        <div
          style={{
            fontFamily: DISPLAY,
            fontSize: 20,
            color: "var(--bone)",
          }}
        >
          COURAGE<span style={{ color: "var(--go)" }}>LY</span>
        </div>
        <button
          onClick={() => openSignIn()}
          style={{
            background: "none",
            border: "none",
            color: "var(--ash)",
            fontSize: 13.5,
            cursor: "pointer",
          }}
        >
          Sign in
        </button>
      </div>

      <div
        style={{
          ...eyebrow("var(--go)"),
          letterSpacing: 2,
          marginBottom: 14,
          textAlign: "center",
        }}
      >
        Stop swiping, Start Approaching · 18+
      </div>
      <div
        style={{
          fontFamily: DISPLAY,
          fontSize: 44,
          textTransform: "uppercase",
          color: "var(--bone)",
          lineHeight: 0.98,
          marginBottom: 16,
          textAlign: "center",
        }}
      >
        Most men <span style={{ color: "var(--go)" }}>freeze.</span>
        <br />
        Be the one who
        <br />
        doesn&apos;t.
      </div>
      <div
        style={{
          fontSize: 15,
          color: "var(--ash)",
          lineHeight: 1.55,
          maxWidth: 360,
          margin: "0 auto 22px",
          textAlign: "center",
        }}
      >
        You spot someone you&apos;d love to talk to — and freeze. Couragely
        trains that out of you, one rep at a time, until walking over feels
        normal.
      </div>

      <div style={{ margin: "6px auto 24px", maxWidth: 250 }}>
        <Image
          src="/screens/screenshot.png"
          alt="Couragely home — your fear, falling"
          width={1516}
          height={1834}
          style={{ width: "100%", height: "auto", display: "block" }}
        />
        <div
          style={{
            fontSize: 12,
            color: "var(--ash)",
            fontStyle: "italic",
            marginTop: 12,
            textAlign: "center",
          }}
        >
          The real flex isn&apos;t a number — it&apos;s watching the fear drop.
        </div>
      </div>

      <button
        onClick={() => {
          trackCustom("OnboardingStarted");
          nav("quiz");
        }}
        style={{
          width: "100%",
          border: "none",
          borderRadius: 18,
          padding: 18,
          background: GO_GRAD,
          color: "#07130C",
          fontFamily: DISPLAY,
          fontSize: 21,
          textTransform: "uppercase",
          cursor: "pointer",
        }}
      >
        Start — it&apos;s free
      </button>
      <div
        style={{
          textAlign: "center",
          fontSize: 12,
          color: "var(--ash)",
          marginTop: 10,
        }}
      >
        Takes 30 seconds · No card · 18+
      </div>

      <div style={{ marginTop: 48 }}>
        <div
          style={{
            ...eyebrow("var(--ash)"),
            textAlign: "center",
            marginBottom: 10,
          }}
        >
          Why it works
        </div>
        <div
          style={{
            fontFamily: DISPLAY,
            fontSize: 26,
            textTransform: "uppercase",
            color: "var(--bone)",
            lineHeight: 1.06,
            textAlign: "center",
            marginBottom: 8,
          }}
        >
          Volume kills the fear.
        </div>
        <div
          style={{
            fontSize: 15,
            color: "var(--ash)",
            textAlign: "center",
            maxWidth: 380,
            margin: "0 auto 22px",
            lineHeight: 1.5,
          }}
        >
          Rejection is just data. Showing up is the win. Here&apos;s how it
          feels.
        </div>
        {[
          {
            img: "/screens/07-log-the-rep.png",
            tag: "No more spiraling",
            title: "Every approach counts — win or lose",
            copy: "She says no? You froze halfway? Still a rep. The only failure is not going — and we kill the shame that wrecks your week when you miss one.",
          },
          {
            img: "/screens/11-rep-reward.png",
            tag: "Instant payoff",
            title: "Every rep pays out",
            copy: "Log an approach and you bank XP and level up — Spark, Ignition, all the way to Bold. It turns the scariest thing you do all day into a game you actually want to keep playing. Win or lose, you always move up.",
          },
          {
            img: "/screens/08-progress.png",
            tag: "The transformation",
            title: "Watch the fear fade",
            copy: "Your anxiety drops and your streak climbs, week over week. The real flex isn't a number — it's becoming the guy who just says hi.",
          },
        ].map((f) => (
          <div
            key={f.title}
            style={{
              background: "var(--charcoal)",
              border: "1px solid var(--slate)",
              borderRadius: 18,
              overflow: "hidden",
              marginBottom: 14,
            }}
          >
            <div
              style={{
                background: "#0e1216",
                padding: "18px 18px 0",
                textAlign: "center",
              }}
            >
              <Image
                src={f.img}
                alt={f.title}
                width={880}
                height={1880}
                style={{
                  width: "70%",
                  maxWidth: 200,
                  height: "auto",
                  display: "inline-block",
                  verticalAlign: "bottom",
                  borderRadius: "16px 16px 0 0",
                }}
              />
            </div>
            <div style={{ padding: "16px 18px 20px" }}>
              <div
                style={{
                  ...eyebrow("var(--ash)"),
                  fontSize: 10.5,
                  letterSpacing: 1.8,
                }}
              >
                {f.tag}
              </div>
              <div
                style={{
                  fontFamily: DISPLAY,
                  fontSize: 20,
                  textTransform: "uppercase",
                  color: "var(--bone)",
                  lineHeight: 1.06,
                  margin: "7px 0 8px",
                }}
              >
                {f.title}
              </div>
              <div
                style={{
                  fontSize: 14,
                  color: "var(--ash)",
                  lineHeight: 1.55,
                }}
              >
                {f.copy}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 48 }}>
        <div
          style={{
            ...eyebrow("var(--ash)"),
            textAlign: "center",
            marginBottom: 10,
          }}
        >
          How it works
        </div>
        <div
          style={{
            fontFamily: DISPLAY,
            fontSize: 26,
            textTransform: "uppercase",
            color: "var(--bone)",
            lineHeight: 1.06,
            textAlign: "center",
            marginBottom: 8,
          }}
        >
          Four steps. One rising count.
        </div>
        <div
          style={{
            fontSize: 15,
            color: "var(--ash)",
            textAlign: "center",
            maxWidth: 380,
            margin: "0 auto 22px",
            lineHeight: 1.5,
          }}
        >
          No scripts. No tricks. Just reps that get easier.
        </div>
        <div style={{ display: "grid", gap: 12 }}>
          {[
            {
              n: "1",
              h: "Get your mission",
              p: "One approach a day, sized to where you're at.",
            },
            {
              n: "2",
              h: "Take the shot",
              p: "Win or lose, going is the whole point.",
            },
            {
              n: "3",
              h: "Log it",
              p: "Win or lose — showing up is the win.",
            },
            {
              n: "4",
              h: "Watch the fear drop",
              p: "Your anxiety falls. Your count climbs.",
            },
          ].map((s) => (
            <div
              key={s.n}
              style={{
                display: "flex",
                gap: 14,
                alignItems: "center",
                background: "var(--charcoal)",
                border: "1px solid var(--slate)",
                borderRadius: 16,
                padding: "14px 16px",
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  flexShrink: 0,
                  borderRadius: 8,
                  background: GO_GRAD,
                  color: "#07130C",
                  display: "grid",
                  placeItems: "center",
                  fontFamily: MONO,
                  fontSize: 13,
                  fontWeight: 700,
                }}
              >
                {s.n}
              </div>
              <div>
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: "var(--bone)",
                  }}
                >
                  {s.h}
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: "var(--ash)",
                    lineHeight: 1.45,
                  }}
                >
                  {s.p}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          background: "var(--charcoal)",
          border: "1px solid var(--slate)",
          borderRadius: 20,
          padding: 22,
          margin: "48px 0 0",
        }}
      >
        <div
          style={{
            ...eyebrow("var(--ash)"),
            textAlign: "center",
            marginBottom: 10,
          }}
        >
          Why it matters
        </div>
        {/* <div
                style={{
                  fontFamily: DISPLAY,
                  fontSize: 26,
                  textTransform: "uppercase",
                  color: "var(--bone)",
                  lineHeight: 1.02,
                  marginBottom: 12,
                }}
              >
                It was never about a number.
              </div> */}
        <div
          style={{
            fontFamily: DISPLAY,
            fontSize: 26,
            textTransform: "uppercase",
            color: "var(--bone)",
            lineHeight: 1.06,
            textAlign: "center",
            marginBottom: 8,
          }}
        >
          It was never about a number.
        </div>
        <div
          style={{
            fontSize: 14.5,
            color: "var(--ash)",
            lineHeight: 1.55,
            textAlign: "center",
          }}
        >
          It&apos;s about not going home wondering &ldquo;what if.&rdquo; About
          not doing life alone. Couragely just gets you to the first hello — the
          rest is yours.
        </div>
      </div>

      <div style={{ marginTop: 48 }}>
        <div
          style={{
            ...eyebrow("var(--ash)"),
            textAlign: "center",
            marginBottom: 10,
          }}
        >
          Good to know
        </div>
        <div
          style={{
            fontFamily: DISPLAY,
            fontSize: 26,
            textTransform: "uppercase",
            color: "var(--bone)",
            lineHeight: 1.06,
            textAlign: "center",
            marginBottom: 18,
          }}
        >
          Questions, answered
        </div>
        <div style={{ display: "grid", gap: 10 }}>
          {[
            {
              q: "Is it free?",
              a: "Yes — the core is free: your counter, streak, daily missions and progress. A Pro coach comes later; you'll never be charged without choosing to.",
            },
            {
              q: "Is this about tricks or manipulation?",
              a: "No. Couragely is about beating your own anxiety and approaching respectfully — never manipulating anyone. A 'no' is a complete win. The goal is your confidence, full stop.",
            },
            {
              q: "What if I freeze or get rejected?",
              a: "That's the point. Every rep counts. A freeze logs with zero shame and you reset tomorrow — volume is how the fear dies.",
            },
            {
              q: "How much time does it take?",
              a: "About two minutes a day: a quick warm-up before you go out, then two taps to log the rep after. That's the whole loop.",
            },
          ].map((f) => (
            <details
              key={f.q}
              className="lp-faq"
              style={{
                background: "var(--charcoal)",
                border: "1px solid var(--slate)",
                borderRadius: 14,
                padding: "2px 16px",
              }}
            >
              <summary
                style={{
                  cursor: "pointer",
                  padding: "14px 0",
                  fontWeight: 700,
                  fontSize: 15,
                  color: "var(--bone)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                {f.q}
              </summary>
              <div
                style={{
                  fontSize: 13.5,
                  color: "var(--ash)",
                  lineHeight: 1.5,
                  padding: "0 0 16px",
                }}
              >
                {f.a}
              </div>
            </details>
          ))}
        </div>
      </div>

      <button
        onClick={() => {
          trackCustom("OnboardingStarted");
          nav("quiz");
        }}
        style={{
          width: "100%",
          border: "none",
          borderRadius: 18,
          padding: 18,
          background: GO_GRAD,
          color: "#07130C",
          fontFamily: DISPLAY,
          fontSize: 21,
          textTransform: "uppercase",
          cursor: "pointer",
          marginTop: 36,
        }}
      >
        Beat the freeze — start
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
