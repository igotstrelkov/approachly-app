"use client";
import { useApp } from "../AppContext";
import { AnxRow } from "../components/AnxRow";
import { DISPLAY, GO_GRAD, MONO } from "../theme";
import { STEP } from "../types";

export function QuizScreen() {
  const {
    quizShowChrome,
    quizBack,
    quizPct,
    quizStep,
    quizNext,
    optStyle,
    quiz,
    quizSet,
    haptic,
    anxScale,
    quizToggle,
    goalVals,
    quizGoal,
    quizFinish,
  } = useApp();
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        padding: "calc(env(safe-area-inset-top, 0px) + 20px) 22px 32px",
      }}
    >
      {quizShowChrome && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            marginBottom: 30,
          }}
        >
          <button
            onClick={quizBack}
            style={{
              width: 34,
              height: 34,
              flexShrink: 0,
              borderRadius: 10,
              border: "1px solid var(--slate)",
              background: "var(--charcoal)",
              color: "var(--ash)",
              fontSize: 16,
              cursor: "pointer",
            }}
          >
            ‹
          </button>
          <div
            style={{
              flex: 1,
              height: 6,
              borderRadius: 999,
              background: "var(--slate)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${quizPct}%`,
                background: "var(--go)",
                borderRadius: 999,
                transition: "width .3s",
              }}
            />
          </div>
        </div>
      )}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {quizStep === STEP.reframe && (
          <>
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  fontFamily: MONO,
                  fontSize: 12,
                  letterSpacing: 1.5,
                  color: "var(--go)",
                  marginBottom: 16,
                }}
              >
                18+ · THE REAL GAME
              </div>
              <div
                style={{
                  fontFamily: DISPLAY,
                  fontSize: 34,
                  color: "var(--bone)",
                  textTransform: "uppercase",
                  lineHeight: 0.98,
                  marginBottom: 18,
                }}
              >
                Stop swiping, Start Approaching.
              </div>
              <div
                style={{
                  background: "var(--charcoal)",
                  border: "1px solid var(--slate)",
                  borderRadius: 18,
                  padding: "16px 18px 14px",
                  marginBottom: 18,
                }}
              >
                <div
                  style={{
                    fontFamily: MONO,
                    fontSize: 10.5,
                    letterSpacing: 1,
                    color: "var(--ash)",
                    marginBottom: 12,
                  }}
                >
                  WHERE CONFIDENCE ACTUALLY COMES FROM
                </div>
                <svg
                  viewBox="0 0 300 96"
                  width="100%"
                  style={{ display: "block" }}
                >
                  <path
                    d="M8 78 C110 74, 190 40, 292 10"
                    fill="none"
                    stroke="var(--go)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  <circle cx="292" cy="10" r="4" fill="var(--go)" />
                  <path
                    d="M8 80 C110 79, 190 80, 292 82"
                    fill="none"
                    stroke="var(--ember)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeDasharray="4 5"
                  />
                  <circle cx="292" cy="82" r="4" fill="var(--ember)" />
                </svg>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: 8,
                    fontFamily: MONO,
                    fontSize: 11,
                  }}
                >
                  <span style={{ color: "var(--ember)" }}>Swiping · stuck</span>
                  <span style={{ color: "var(--go)" }}>
                    Real reps · climbing
                  </span>
                </div>
              </div>
              <div
                style={{
                  fontSize: 15,
                  color: "var(--ash)",
                  lineHeight: 1.55,
                }}
              >
                The apps reward waiting. Real life rewards reps — and approach
                anxiety only dies one way: doing it, in small doses, on repeat.{" "}
                <span style={{ color: "var(--bone)" }}>
                  That&apos;s the whole app.
                </span>
              </div>
            </div>
            <button
              onClick={quizNext}
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
              I&apos;m 18+ · Start
            </button>
          </>
        )}

        {quizStep === STEP.scenario && (
          <>
            <div
              style={{
                fontFamily: DISPLAY,
                fontSize: 26,
                color: "var(--bone)",
                textTransform: "uppercase",
                lineHeight: 1.04,
                marginBottom: 22,
              }}
            >
              You spot someone you&apos;d love to talk to. What usually happens?
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 11,
              }}
            >
              {[
                { v: "never", label: "I look away and keep moving" },
                {
                  v: "rarely",
                  label: "I think about it… then the moment passes",
                },
                { v: "sometimes", label: "Sometimes I go for it" },
                { v: "often", label: "I walk over and say hi" },
              ].map((o) => (
                <button
                  key={o.v}
                  onClick={() => quizSet("freq", o.v)}
                  style={{
                    textAlign: "left",
                    borderRadius: 15,
                    padding: "17px 18px",
                    ...optStyle(quiz.freq === o.v),
                    color: "var(--bone)",
                    fontSize: 15.5,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  {o.label}
                </button>
              ))}
            </div>
            <div style={{ flex: 1 }} />
            <button
              onClick={quizNext}
              disabled={!quiz.freq}
              style={{
                width: "100%",
                border: "none",
                borderRadius: 16,
                padding: 17,
                background: quiz.freq ? "var(--go)" : "var(--slate)",
                color: quiz.freq ? "#07130C" : "var(--ashDim)",
                fontWeight: 700,
                fontSize: 16,
                cursor: quiz.freq ? "pointer" : "not-allowed",
                marginTop: 22,
              }}
            >
              Continue
            </button>
          </>
        )}

        {quizStep === STEP.anxiety && (
          <>
            <div
              style={{
                fontFamily: DISPLAY,
                fontSize: 26,
                color: "var(--bone)",
                textTransform: "uppercase",
                lineHeight: 1.04,
                marginBottom: 8,
              }}
            >
              Picture walking up to someone you find attractive. How anxious?
            </div>
            <div
              style={{
                fontSize: 13,
                color: "var(--ash)",
                marginBottom: 26,
              }}
            >
              This is your day-zero point — the line you&apos;re about to bring
              down.
            </div>
            <div style={{ textAlign: "center", marginBottom: 18 }}>
              <span
                style={{
                  fontFamily: DISPLAY,
                  fontSize: 66,
                  color: "var(--bone)",
                  lineHeight: 0.9,
                }}
              >
                {quiz.anxiety}
              </span>
              <span
                style={{
                  fontFamily: MONO,
                  fontSize: 16,
                  color: "var(--ash)",
                }}
              >
                /10
              </span>
            </div>
            <AnxRow
              value={quiz.anxiety}
              onPick={(n) => {
                haptic();
                quizSet("anxiety", n);
              }}
            />
            {anxScale}
            <div style={{ flex: 1 }} />
            <button
              onClick={quizNext}
              style={{
                width: "100%",
                border: "none",
                borderRadius: 16,
                padding: 17,
                background: "var(--go)",
                color: "#07130C",
                fontWeight: 700,
                fontSize: 16,
                cursor: "pointer",
                marginTop: 22,
              }}
            >
              Continue
            </button>
          </>
        )}

        {quizStep === STEP.motivation && (
          <>
            <div
              style={{
                fontFamily: DISPLAY,
                fontSize: 26,
                color: "var(--bone)",
                textTransform: "uppercase",
                lineHeight: 1.04,
                marginBottom: 6,
              }}
            >
              What would change if approaching didn&apos;t scare you?
            </div>
            <div
              style={{
                fontSize: 13,
                color: "var(--ash)",
                marginBottom: 22,
              }}
            >
              Pick all that fit.
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              {[
                { v: "dates", label: "More dates" },
                { v: "relationship", label: "A real relationship" },
                { v: "confidence", label: "Confidence everywhere" },
                { v: "chances", label: "Stop missing chances" },
                { v: "prove", label: "Prove something to myself" },
              ].map((o) => {
                const sel = quiz.motivation.includes(o.v);
                return (
                  <button
                    key={o.v}
                    onClick={() => quizToggle("motivation", o.v)}
                    style={{
                      textAlign: "left",
                      borderRadius: 14,
                      padding: "15px 17px",
                      ...optStyle(sel),
                      color: "var(--bone)",
                      fontSize: 15,
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    {o.label}
                    <span style={{ color: "var(--go)", fontSize: 15 }}>
                      {sel ? "✓" : ""}
                    </span>
                  </button>
                );
              })}
            </div>
            <div style={{ flex: 1 }} />
            <button
              onClick={quizNext}
              style={{
                width: "100%",
                border: "none",
                borderRadius: 16,
                padding: 17,
                background: "var(--go)",
                color: "#07130C",
                fontWeight: 700,
                fontSize: 16,
                cursor: "pointer",
                marginTop: 22,
              }}
            >
              Continue
            </button>
          </>
        )}

        {quizStep === STEP.barrier && (
          <>
            <div
              style={{
                fontFamily: DISPLAY,
                fontSize: 26,
                color: "var(--bone)",
                textTransform: "uppercase",
                lineHeight: 1.04,
                marginBottom: 6,
              }}
            >
              What&apos;s really stopping you?
            </div>
            <div
              style={{
                fontSize: 13,
                color: "var(--ash)",
                marginBottom: 22,
              }}
            >
              The honest one — this is the thing the reps dissolve.
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
              {[
                { v: "rejection", label: "Fear of rejection" },
                { v: "words", label: "I don't know what to say" },
                {
                  v: "creepy",
                  label: "Worried I'll seem creepy or awkward",
                },
                { v: "freeze", label: "I freeze and overthink it" },
                { v: "timing", label: 'Waiting for the "perfect" moment' },
              ].map((o) => (
                <button
                  key={o.v}
                  onClick={() => quizSet("barrier", o.v)}
                  style={{
                    textAlign: "left",
                    borderRadius: 15,
                    padding: "16px 18px",
                    ...optStyle(quiz.barrier === o.v),
                    color: "var(--bone)",
                    fontSize: 15,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  {o.label}
                </button>
              ))}
            </div>
            <div style={{ flex: 1 }} />
            <button
              onClick={quizNext}
              disabled={!quiz.barrier}
              style={{
                width: "100%",
                border: "none",
                borderRadius: 16,
                padding: 17,
                background: quiz.barrier ? "var(--go)" : "var(--slate)",
                color: quiz.barrier ? "#07130C" : "var(--ashDim)",
                fontWeight: 700,
                fontSize: 16,
                cursor: quiz.barrier ? "pointer" : "not-allowed",
                marginTop: 22,
              }}
            >
              Continue
            </button>
          </>
        )}

        {quizStep === STEP.reassure && (
          <>
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 40, marginBottom: 20 }}>🫂</div>
              <div
                style={{
                  fontFamily: DISPLAY,
                  fontSize: 28,
                  color: "var(--bone)",
                  textTransform: "uppercase",
                  lineHeight: 1.02,
                  marginBottom: 18,
                }}
              >
                You&apos;re not alone.
              </div>
              <div
                style={{
                  fontSize: 15.5,
                  color: "var(--ash)",
                  lineHeight: 1.55,
                  maxWidth: 330,
                  margin: "0 auto",
                }}
              >
                Approach anxiety is one of the most common social fears — and
                one of the most beatable. It responds to one thing: doing it, in
                small doses, on repeat.{" "}
                <span style={{ color: "var(--bone)" }}>
                  That&apos;s the whole app.
                </span>
              </div>
            </div>
            <button
              onClick={quizNext}
              style={{
                width: "100%",
                border: "none",
                borderRadius: 16,
                padding: 17,
                background: "var(--go)",
                color: "#07130C",
                fontWeight: 700,
                fontSize: 16,
                cursor: "pointer",
              }}
            >
              Makes sense
            </button>
          </>
        )}

        {quizStep === STEP.goal && (
          <>
            <div
              style={{
                fontFamily: DISPLAY,
                fontSize: 26,
                color: "var(--bone)",
                textTransform: "uppercase",
                lineHeight: 1.04,
                marginBottom: 6,
              }}
            >
              What feels like a real but doable start?
            </div>
            <div
              style={{
                fontSize: 13,
                color: "var(--ash)",
                marginBottom: 22,
              }}
            >
              Your weekly goal. Beat it a few weeks and we&apos;ll nudge it up.
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 11,
              }}
            >
              {goalVals.map((v) => (
                <button
                  key={v}
                  onClick={() => quizSet("goal", v)}
                  style={{
                    textAlign: "left",
                    borderRadius: 15,
                    padding: "17px 18px",
                    ...optStyle(quiz.goal === v),
                    color: "var(--bone)",
                    fontSize: 15.5,
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <span>{v} approaches</span>
                  <span
                    style={{
                      fontFamily: MONO,
                      fontSize: 13,
                      color: "var(--ash)",
                    }}
                  >
                    / week
                  </span>
                </button>
              ))}
            </div>
            <div style={{ flex: 1 }} />
            <button
              onClick={quizNext}
              disabled={!quiz.goal}
              style={{
                width: "100%",
                border: "none",
                borderRadius: 16,
                padding: 17,
                background: quiz.goal ? "var(--go)" : "var(--slate)",
                color: quiz.goal ? "#07130C" : "var(--ashDim)",
                fontWeight: 700,
                fontSize: 16,
                cursor: quiz.goal ? "pointer" : "not-allowed",
                marginTop: 22,
              }}
            >
              Continue
            </button>
          </>
        )}

        {quizStep === STEP.respect && (
          <>
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  fontSize: 15,
                  color: "var(--go)",
                  fontFamily: MONO,
                  letterSpacing: 1,
                  marginBottom: 16,
                }}
              >
                ONE RULE
              </div>
              <div
                style={{
                  fontFamily: DISPLAY,
                  fontSize: 32,
                  color: "var(--bone)",
                  textTransform: "uppercase",
                  lineHeight: 1.02,
                  marginBottom: 18,
                }}
              >
                Approach with respect.
              </div>
              <div
                style={{
                  fontSize: 15.5,
                  color: "var(--ash)",
                  lineHeight: 1.55,
                }}
              >
                Take a &quot;no&quot; gracefully and move on. Never follow or
                pressure anyone. A no is a complete win — respect it.
              </div>
            </div>
            <button
              onClick={() => {
                quizSet("respect", true);
                quizNext();
              }}
              style={{
                width: "100%",
                border: "none",
                borderRadius: 16,
                padding: 18,
                background: GO_GRAD,
                color: "#07130C",
                fontFamily: DISPLAY,
                fontSize: 20,
                textTransform: "uppercase",
                cursor: "pointer",
              }}
            >
              I agree
            </button>
          </>
        )}

        {quizStep === STEP.building && (
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
            <div style={{ display: "flex", gap: 8, marginBottom: 26 }}>
              {[0, 0.2, 0.4].map((d, i) => (
                <span
                  key={i}
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    background: "var(--go)",
                    animation: `aDot 1.2s ${d}s infinite`,
                  }}
                />
              ))}
            </div>
            <div
              style={{
                fontFamily: DISPLAY,
                fontSize: 28,
                color: "var(--bone)",
                textTransform: "uppercase",
              }}
            >
              Building your plan…
            </div>
          </div>
        )}

        {quizStep === STEP.plan && (
          <>
            <div style={{ animation: "aFadeUp .5s both" }}>
              <div
                style={{
                  fontFamily: MONO,
                  fontSize: 11,
                  letterSpacing: 2,
                  color: "var(--go)",
                  textTransform: "uppercase",
                  marginBottom: 8,
                }}
              >
                Your starting point
              </div>
              <div
                style={{
                  fontFamily: DISPLAY,
                  fontSize: 30,
                  color: "var(--bone)",
                  textTransform: "uppercase",
                  lineHeight: 1,
                  marginBottom: 22,
                }}
              >
                The plan
              </div>
              <div
                style={{
                  background: "var(--charcoal)",
                  border: "1px solid var(--slate)",
                  borderRadius: 18,
                  padding: 20,
                  marginBottom: 12,
                }}
              >
                <div
                  style={{
                    fontSize: 13,
                    color: "var(--ash)",
                    marginBottom: 6,
                  }}
                >
                  Your baseline anxiety
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
                      fontSize: 44,
                      color: "var(--bone)",
                      lineHeight: 0.9,
                    }}
                  >
                    {quiz.anxiety}
                  </span>
                  <span
                    style={{
                      fontFamily: MONO,
                      fontSize: 14,
                      color: "var(--ash)",
                    }}
                  >
                    /10 · we&apos;ll watch this fall
                  </span>
                </div>
              </div>
              <div
                style={{
                  background: "var(--charcoal)",
                  border: "1px solid var(--slate)",
                  borderRadius: 18,
                  padding: 20,
                  marginBottom: 12,
                }}
              >
                <div
                  style={{
                    fontSize: 13,
                    color: "var(--ash)",
                    marginBottom: 6,
                  }}
                >
                  Your weekly goal
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
                      fontSize: 44,
                      color: "var(--go)",
                      lineHeight: 0.9,
                    }}
                  >
                    {quizGoal}
                  </span>
                  <span
                    style={{
                      fontFamily: MONO,
                      fontSize: 14,
                      color: "var(--ash)",
                    }}
                  >
                    approaches / week
                  </span>
                </div>
              </div>
              <div
                style={{
                  background: "var(--charcoal)",
                  border: "1px solid var(--slate)",
                  borderRadius: 18,
                  padding: 20,
                }}
              >
                <div
                  style={{
                    fontSize: 13,
                    color: "var(--ash)",
                    marginBottom: 12,
                  }}
                >
                  What showing up tends to do:
                </div>
                <svg
                  viewBox="0 0 300 70"
                  width="100%"
                  style={{ display: "block" }}
                >
                  <path
                    d="M6 12 C80 16, 150 44, 294 60"
                    fill="none"
                    stroke="var(--go)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeDasharray="4 5"
                  />
                  <circle cx="6" cy="12" r="4" fill="var(--go)" />
                </svg>
                <div
                  style={{
                    fontSize: 12,
                    color: "var(--ash)",
                    fontStyle: "italic",
                    marginTop: 8,
                  }}
                >
                  Illustrative — your real line is the one you&apos;re about to
                  draw.
                </div>
              </div>
            </div>
            <div style={{ flex: 1 }} />
            <button
              onClick={quizFinish}
              style={{
                width: "100%",
                border: "none",
                borderRadius: 18,
                padding: 18,
                background: GO_GRAD,
                color: "#07130C",
                fontFamily: DISPLAY,
                fontSize: 20,
                textTransform: "uppercase",
                cursor: "pointer",
                marginTop: 22,
              }}
            >
              Log your first rep
            </button>
          </>
        )}
      </div>
    </div>
  );
}
