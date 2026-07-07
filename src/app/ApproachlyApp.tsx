"use client";

/*
 * Couragely — full app, ported 1:1 from the Claude Design bundle.
 * PHASE 1: faithful, self-contained port with in-memory mock state (no backend),
 * so the UX matches the design exactly. PHASE 2 swaps this local state for Convex
 * queries/mutations + Clerk auth (see convex/ + SETUP.md).
 */

import { DISPLAY } from "./theme";
import { useAppState } from "./useAppState";
import { AppProvider } from "./AppContext";
import { LogScreen } from "./screens/LogScreen";
import { RanksScreen } from "./screens/RanksScreen";
import { YouScreen } from "./screens/YouScreen";
import { RewardScreen } from "./screens/RewardScreen";
import { HypeScreen } from "./screens/HypeScreen";
import { LandingScreen } from "./screens/LandingScreen";
import { HomeScreen } from "./screens/HomeScreen";
import { QuizScreen } from "./screens/QuizScreen";
import { ReflectionsScreen } from "./screens/ReflectionsScreen";
import { GoalScreen } from "./screens/GoalScreen";
import { ReminderScreen } from "./screens/ReminderScreen";
import { FeedbackScreen } from "./screens/FeedbackScreen";

export default function ApproachlyApp(props: {
  startScreen?: "Home" | "Onboarding";
  courageColor?: string;
  confetti?: boolean;
}) {
  const app = useAppState(props);
  const {
    rootRef,
    screen,
    reward,
    toast,
    dash,
    isSignedIn,
    onboarded,
    booting,
  } = app;

  if (booting || (isSignedIn && onboarded && dash === undefined)) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "var(--ink)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            fontFamily: DISPLAY,
            fontSize: 40,
            color: "var(--go)",
            textTransform: "uppercase",
            animation: "aPulse 1.4s ease-in-out infinite",
          }}
        >
          Couragely
        </div>
      </div>
    );
  }

  return (
    <AppProvider value={app}>
    <div
      style={{
        minHeight: "100vh",
        background: "var(--ink)",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        ref={rootRef}
        style={{
          width: "100%",
          maxWidth: 440,
          minHeight: "100vh",
          background: "var(--ink)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* ============ HOME ============ */}
        {screen === "home" && <HomeScreen />}

        {/* ============ HYPE ============ */}
        {screen === "hype" && <HypeScreen />}

        {/* ============ LOG ============ */}
        {screen === "log" && <LogScreen />}

        {/* ============ REWARD ============ */}
        {screen === "reward" && reward && <RewardScreen />}

        {/* ============ YOU ============ */}
        {screen === "you" && <YouScreen />}

        {/* ============ REFLECTIONS ============ */}
        {screen === "reflections" && <ReflectionsScreen />}

        {/* ============ GOAL ============ */}
        {screen === "goal" && <GoalScreen />}

        {/* ============ REMINDER ============ */}
        {screen === "reminder" && <ReminderScreen />}

        {/* ============ FEEDBACK ============ */}
        {screen === "feedback" && <FeedbackScreen />}

        {/* ============ ONBOARDING / QUIZ ============ */}
        {screen === "quiz" && <QuizScreen />}

        {/* ============ RANKS (permanent) ============ */}
        {screen === "ranks" && <RanksScreen />}

        {/* ============ LANDING (signed-out front door) ============ */}
        {screen === "landing" && <LandingScreen />}
      </div>
      {toast && (
        <div
          style={{
            position: "fixed",
            left: "50%",
            bottom: 24,
            transform: "translateX(-50%)",
            background: "var(--slate)",
            border: "1px solid var(--slateHi)",
            color: "var(--bone)",
            padding: "12px 18px",
            borderRadius: 12,
            fontSize: 14,
            zIndex: 50,
            boxShadow: "0 8px 30px rgba(0,0,0,.5)",
            maxWidth: "90%",
            textAlign: "center",
          }}
        >
          {toast}
        </div>
      )}
    </div>
    </AppProvider>
  );
}
