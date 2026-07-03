"use client";

import { subscribeThisDevice, unsubscribeThisDevice } from "@/lib/push";
import { track, trackCustom } from "@/lib/analytics";
import { useAuth, useClerk, useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { buildChart, makeConfetti } from "./lib/chart";
import {
  baseRankForLevel,
  levelForXp,
  PRESTIGE_BAND,
  PRESTIGE_START,
  RANK_LADDER,
  rankForLevel,
  xpForLevel,
} from "./lib/levels";
import { MODES, modeFor, type Mode } from "./lib/modes";
import { MONO } from "./theme";
import { STEP, STEP_ORDER, type Screen, type Vibe } from "./types";

export type Plan = {
  weeklyGoal: number;
  baselineAnxiety: number;
  reason?: string;
  approachFreq?: string;
  mainBarrier?: string;
  timezone: string;
  reminderHour: number;
};

export function useAppState({
  startScreen = "Onboarding",
  courageColor = "#34D17E",
  confetti = true,
}: {
  startScreen?: "Home" | "Onboarding";
  courageColor?: string;
  confetti?: boolean;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [screen, setScreen] = useState<Screen>(
    startScreen === "Home" ? "home" : "landing",
  );
  const [draft, setDraft] = useState<{
    vibe: Vibe;
    anxiety: number;
    note: string;
  }>({ vibe: null, anxiety: 0, note: "" });
  const [reward, setReward] = useState<ReturnType<typeof buildReward> | null>(
    null,
  );
  const [displayXp, setDisplayXp] = useState(0);
  const [displayReps, setDisplayReps] = useState(0);
  const [numberSaved, setNumberSaved] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [hypeStep, setHypeStep] = useState<"primer" | "countdown" | "go">(
    "primer",
  );
  const [hypeCount, setHypeCount] = useState(3);
  const [quizStep, setQuizStep] = useState(0);
  const [quiz, setQuiz] = useState<{
    freq: string | null;
    anxiety: number;
    motivation: string[];
    barrier: string | null;
    goal: number | null;
    respect: boolean;
  }>({
    freq: null,
    anxiety: 5,
    motivation: [],
    barrier: null,
    goal: null,
    respect: false,
  });
  // ---- Convex + Clerk wiring ----
  const timezone = useMemo(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    } catch {
      return "UTC";
    }
  }, []);
  const { isLoaded, isSignedIn } = useAuth();
  const { openSignIn, openSignUp, signOut } = useClerk();
  const { user: clerkUser } = useUser();
  const me = useQuery(api.users.getMe, isSignedIn ? {} : "skip");
  const dash = useQuery(
    api.approaches.dashboard,
    isSignedIn ? { timezone } : "skip",
  );
  const logRepMut = useMutation(api.approaches.logRep);
  const completeOnboardingMut = useMutation(api.users.completeOnboarding);
  const setWeeklyGoalMut = useMutation(api.users.setWeeklyGoal);
  const markNumberMut = useMutation(api.approaches.markNumber);
  const pushStatus = useQuery(api.push.getStatus, isSignedIn ? {} : "skip");
  const saveSubMut = useMutation(api.push.saveSubscription);
  const removeSubMut = useMutation(api.push.removeSubscription);
  const removeAllSubMut = useMutation(api.push.removeAllSubscriptions);
  const setReminderFreqMut = useMutation(api.push.setReminderFreq);
  const submitFeedbackMut = useMutation(api.feedback.submit);
  const [pushBusy, setPushBusy] = useState(false);
  const [goalEditing, setGoalEditing] = useState(false);
  // iOS delivers web-push only to a home-screen-installed PWA, not a Safari tab.
  // Detect so the reminder UI can tell iPhone users to install first.
  const [isIOS] = useState(() =>
    typeof navigator !== "undefined"
      ? /iphone|ipad|ipod/i.test(navigator.userAgent) ||
        (navigator.maxTouchPoints > 1 && /Macintosh/.test(navigator.userAgent))
      : false,
  );
  const [isStandalone] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia?.("(display-mode: standalone)").matches ||
        (navigator as Navigator & { standalone?: boolean }).standalone === true
      : false,
  );
  const VAPID = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const onboarded = !!me?.onboarded;
  const booting = !isLoaded || (isSignedIn && me === undefined);

  type Plan = {
    weeklyGoal: number;
    baselineAnxiety: number;
    reason?: string;
    approachFreq?: string;
    mainBarrier?: string;
    timezone: string;
    reminderHour: number;
  };
  const [pendingPlan, setPendingPlan] = useState<Plan | null>(null);
  const [replaying, setReplaying] = useState(false);
  const [booted, setBooted] = useState(false);

  // Choose the entry screen once auth + profile resolve.
  if (!booting && !booted) {
    setBooted(true);
    setScreen(onboarded ? "home" : "landing");
  }

  // Signed out (sign-out button or expired session) while on an authed screen →
  // return to the landing front door. Without this the last screen lingers with
  // empty data ("Day zero") until a manual refresh. The quiz + signup flow (a
  // legitimately signed-out user on "quiz"/"landing", or mid-signup with a
  // pendingPlan) is excluded.
  if (
    isLoaded &&
    !isSignedIn &&
    !pendingPlan &&
    screen !== "landing" &&
    screen !== "quiz"
  ) {
    setScreen("landing");
  }

  // Returning user signs in mid-quiz → jump home (unless intentionally replaying onboarding).
  if (
    !booting &&
    isSignedIn &&
    !pendingPlan &&
    !replaying &&
    onboarded &&
    (screen === "quiz" || screen === "landing")
  ) {
    setScreen("home");
  }

  // After sign-up, check if returning user already onboarded mid-quiz.
  if (isSignedIn && me && pendingPlan && me.onboarded) {
    setPendingPlan(null);
    setReplaying(false);
    setQuizStep(0);
    setScreen("home");
  }

  // After sign-up, persist the quiz the user already completed.
  useEffect(() => {
    if (!isSignedIn || me === undefined || !pendingPlan) return;
    if (me?.onboarded) return;
    const plan = pendingPlan;
    Promise.resolve().then(() => setPendingPlan(null));
    completeOnboardingMut(plan)
      .then(() => {
        track("CompleteRegistration");
        setReplaying(false);
        setQuizStep(0);
        setScreen("home");
      })
      .catch(() => {});
  }, [isSignedIn, me, pendingPlan, completeOnboardingMut]);

  // Derive the mock-shaped `user` + `trend` from the dashboard so the screens below stay unchanged.
  const user = {
    totalXp: dash?.user.totalXp ?? 0,
    weeklyGoal: dash?.week.goal ?? quiz.goal ?? 3,
    repsThisWeek: dash?.week.count ?? 0,
    repsToday: dash?.today.count ?? 0,
    streakWeeks: dash?.streak.current ?? 0,
    streakLongest: dash?.streak.longest ?? 0,
    totalApproaches: dash?.totals.approaches ?? 0,
    greatSets: dash?.totals.greatSets ?? 0,
    mostInDay: 0,
  };
  const trend: number[] = dash?.trend?.length
    ? dash.trend.map((p) => p.a)
    : [dash?.user.baselineAnxiety ?? quiz.anxiety ?? 5];

  useEffect(() => {
    if (rootRef.current)
      rootRef.current.style.setProperty("--go", courageColor);
  });
  useEffect(
    () => () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    },
    [],
  );


  const haptic = (ms = 12) => {
    try {
      navigator.vibrate?.(ms);
    } catch {}
  };
  const nav = (s: Screen) => {
    setScreen(s);
    window.scrollTo(0, 0);
  };
  const showToast = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(null), 3200);
  };

  // hype
  const startHype = () => {
    setHypeStep("primer");
    setHypeCount(3);
    nav("hype");
  };
  const hypeGo = () => {
    setHypeStep("countdown");
    setHypeCount(3);
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setHypeCount((c) => {
        if (c - 1 <= 0) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setHypeStep("go");
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  };
  const hypeWhy = () => {
    const map: Record<string, string> = {
      dates: "more dates",
      relationship: "a real relationship",
      confidence: "confidence everywhere",
      chances: "to stop missing chances",
      prove: "to prove something to yourself",
    };
    const key = me?.reason || quiz.motivation[0];
    return key ? map[key] || "the life you want" : "the life you want";
  };
  // The warm-up, aimed at the barrier they flagged in onboarding (mainBarrier):
  // acknowledges their specific blocker, then reframes it. Delivers on the
  // onboarding promise ("this is the thing the reps dissolve").
  const hypeBarrier = (): { label: string; line: string } | null => {
    const map: Record<string, { label: string; line: string }> = {
      rejection: {
        label: "Fear of rejection",
        line: "A 'no' is just data — it costs you nothing. You win the second you walk over.",
      },
      words: {
        label: "Not knowing what to say",
        line: "You don't need a line. 'Hey, I had to come say hi' is plenty.",
      },
      creepy: {
        label: "Seeming creepy or awkward",
        line: "Warm, brief, and you leave the moment they're not into it. That's respect.",
      },
      freeze: {
        label: "Freezing and overthinking",
        line: "Don't wait to feel ready — 3-2-1, feet first. The freeze breaks the instant you move.",
      },
      timing: {
        label: "Waiting for the perfect moment",
        line: "There's no perfect moment. This one is it. Go before you think.",
      },
    };
    const key = me?.mainBarrier || quiz.barrier;
    return key ? (map[key] ?? null) : null;
  };

  // log
  const startLog = () => {
    setDraft({ vibe: null, anxiety: 0, note: "" });
    nav("log");
  };
  const setAnx = (v: number) => {
    haptic();
    setDraft((d) => ({ ...d, anxiety: v }));
  };

  function buildReward(
    approachId: Id<"approaches">,
    xp: number,
    mode: Mode,
    repsToday: number,
    streak: number,
    leveledUp: boolean,
    newLevel: number,
    rankUp: boolean,
    newRank: string,
    milestone: { label: string; color: string } | null,
    isFirstEver: boolean,
  ) {
    return {
      approachId,
      xp,
      mode,
      repsToday,
      streak,
      leveledUp,
      newLevel,
      rankUp,
      newRank,
      milestone,
      isFirstEver,
      eyebrow: isFirstEver
        ? "Your first approach. Ever."
        : repsToday === 1
          ? "You broke the ice today"
          : "Rep " + repsToday + " today",
      confetti: makeConfetti(mode.color, confetti),
    };
  }

  const animateReward = (xp: number, total: number) => {
    const start = performance.now(),
      dur = 950,
      from = total - 1;
    const tick = (now: number) => {
      const t = Math.min((now - start) / dur, 1),
        e = 1 - Math.pow(1 - t, 3);
      setDisplayXp(Math.round(xp * e));
      setDisplayReps(Math.round(from + (total - from) * e));
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  };

  const logIt = async () => {
    if (!draft.vibe) return;
    const prevTotal = user.totalApproaches;
    let res: Awaited<ReturnType<typeof logRepMut>>;
    try {
      res = await logRepMut({
        vibe: draft.vibe,
        anxietyBefore: draft.anxiety,
        gotNumber: false,
        note: draft.note.trim() || undefined,
        timezone,
      });
    } catch {
      showToast("Couldn't log that rep — try again.");
      return;
    }
    // Meta Pixel: core activation signal (only fires on a real logged rep).
    trackCustom("RepLogged", {
      xp: res.xpAwarded,
      modeTier: res.modeTier,
      total: res.newTotal,
      leveledUp: res.leveledUp,
    });
    if (res.newTotal === 1) trackCustom("FirstRep", { xp: res.xpAwarded });
    const mode = MODES[res.modeTier - 1];
    const newTotal = prevTotal + 1;
    const isFirstEver = res.newTotal === 1;
    const countMs = [10, 25, 50, 100, 250, 500];
    const milestone = isFirstEver
      ? { label: "Day one · you beat the freeze", color: "var(--go)" }
      : res.isNewPeak
        ? { label: `New peak · ${mode.emoji} ${mode.name}`, color: mode.color }
        : countMs.includes(res.newTotal)
          ? { label: `${res.newTotal} approaches banked`, color: "#FFB23E" }
          : null;
    setReward(
      buildReward(
        res.approachId,
        res.xpAwarded,
        mode,
        res.countToday,
        res.streak,
        res.leveledUp,
        res.level,
        res.rankUp,
        res.newRank,
        milestone,
        isFirstEver,
      ),
    );
    setDisplayXp(0);
    setDisplayReps(newTotal - 1);
    setNumberSaved(false);
    setScreen("reward");
    window.scrollTo(0, 0);
    animateReward(res.xpAwarded, newTotal);
  };

  // quiz
  const quizSet = (f: string, v: unknown) => setQuiz((q) => ({ ...q, [f]: v }));
  const quizToggle = (f: "motivation", v: string) =>
    setQuiz((q) => {
      const a = q[f] || [];
      return {
        ...q,
        [f]: a.includes(v) ? a.filter((x) => x !== v) : [...a, v],
      };
    });
  const quizNext = () => {
    const step = quizStep + 1;
    // Per-step funnel analytics: reveals exactly which onboarding step bleeds.
    trackCustom("OnboardingStep", { step, name: STEP_ORDER[step] });
    setQuizStep(step);
    // The "building" beat auto-advances to the plan reveal.
    if (step === STEP.building)
      setTimeout(
        () =>
          setQuizStep((s) => {
            if (s !== STEP.building) return s;
            trackCustom("OnboardingStep", { step: STEP.plan, name: "plan" });
            return STEP.plan;
          }),
        1900,
      );
    window.scrollTo(0, 0);
  };
  const quizBack = () => setQuizStep((s) => Math.max(0, s - 1));
  const quizFinish = () => {
    const plan: Plan = {
      weeklyGoal: quiz.goal || 3,
      baselineAnxiety: quiz.anxiety,
      reason: quiz.motivation[0] || undefined,
      approachFreq: quiz.freq || undefined,
      mainBarrier: quiz.barrier || undefined,
      timezone,
      reminderHour: 10,
    };
    if (isSignedIn) {
      completeOnboardingMut(plan)
        .then(() => {
          track("CompleteRegistration");
          setReplaying(false);
          setQuizStep(0);
          nav("home");
        })
        .catch(() => showToast("Something went wrong — try again."));
    } else {
      // Invested user finishes the quiz, then signs up; the effect above persists it.
      setPendingPlan(plan);
      openSignUp();
    }
  };


  // weekly reminder push
  const pushOn = !!pushStatus?.subscribed;
  const reminderFreq: "daily" | "weekly" = pushStatus?.reminderFreq ?? "daily";
  const reminderMode: "off" | "daily" | "weekly" = pushOn
    ? reminderFreq
    : "off";
  // iPhone + not-yet-installed → reminders can't be enabled until the PWA is on
  // the home screen; the profile shows an install hint when true.
  const needsIosInstall = isIOS && !isStandalone;
  const DOW_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const remHour = pushStatus?.reminderHour ?? 10;
  const remTime = `${remHour % 12 || 12}:00 ${remHour < 12 ? "AM" : "PM"}`;
  const scheduleLabel =
    reminderMode === "off"
      ? "Off"
      : reminderMode === "daily"
        ? `Daily · ${remTime}`
        : `${DOW_NAMES[pushStatus?.reminderDow ?? 0]} · ${remTime}`;
  // Daily / Weekly / Off. "off" unsubscribes the device; daily/weekly subscribe
  // (if needed) then set the cadence.
  const setReminderMode = async (mode: "off" | "daily" | "weekly") => {
    if (pushBusy || mode === reminderMode) return;
    setPushBusy(true);
    try {
      if (mode === "off") {
        // Best-effort browser unsubscribe, then clear ALL server subs for the
        // account. The browser may have no local subscription to report (returns
        // null), which would otherwise leave the server row — and the tab stuck.
        const endpoint = await unsubscribeThisDevice();
        if (endpoint) await removeSubMut({ endpoint });
        await removeAllSubMut();
        showToast("Reminders off.");
      } else {
        if (!pushOn) {
          if (needsIosInstall) {
            // Can't subscribe in a Safari tab on iOS — guide them to install.
            showToast(
              "On iPhone: tap Share → Add to Home Screen, then open Couragely from your home screen to turn on reminders.",
            );
            return;
          }
          if (!VAPID) {
            showToast("Push isn't configured.");
            return;
          }
          const sub = await subscribeThisDevice(VAPID);
          await saveSubMut(sub);
        }
        await setReminderFreqMut({ freq: mode });
        showToast(
          mode === "daily" ? "Daily reminders on." : "Weekly reminders on.",
        );
      }
    } catch (e) {
      const msg = (e as Error)?.message;
      showToast(
        msg === "denied"
          ? "Enable notifications in your browser settings."
          : msg === "unsupported"
            ? "Reminders aren't supported on this device."
            : "Couldn't update reminders.",
      );
    } finally {
      setPushBusy(false);
    }
  };

  // ---------- derived ----------
  const level = levelForXp(user.totalXp);
  const base = xpForLevel(level),
    next = xpForLevel(level + 1),
    into = user.totalXp - base,
    need = next - base;
  const xpToNext = need - into,
    levelPct = Math.round((into / need) * 100),
    rank = rankForLevel(level);
  const nextRankHint = (() => {
    const thresholds: [number, string][] = [
      [5, "Bold"],
      [10, "Fearless"],
      [15, "Ironclad"],
      [20, "Legend"],
    ];
    const next = thresholds.find(([lvl]) => lvl > level);
    if (next) return `Level ${next[0]} unlocks ${next[1]}`;
    // Legend: point at the next prestige tier so the hint stays honest with the prestige system.
    const nextTierLevel =
      PRESTIGE_START +
      (Math.floor((level - PRESTIGE_START) / PRESTIGE_BAND) + 1) *
        PRESTIGE_BAND;
    return `Level ${nextTierLevel} unlocks ${rankForLevel(nextTierLevel)}`;
  })();
  const chart = buildChart(trend, 360, 150, user.totalApproaches);
  const fearLabel =
    trend.length < 2
      ? "Your starting line"
      : trend[0] - trend[trend.length - 1] > 0.05
        ? "Your fear, falling"
        : trend[0] - trend[trend.length - 1] < -0.05
          ? "Your fear, lately"
          : "Your fear, so far";
  const isFresh = user.totalApproaches === 0;
  const baselineAnx = trend.length ? Number(trend[0]).toFixed(1) : "—";
  const hasRepsToday = user.repsToday >= 1;
  const todayMode = modeFor(Math.max(1, user.repsToday));

  // ---- Progression (Ranks + Daily Modes) ----
  const baseRank = baseRankForLevel(level);
  const nextLockedLvl = RANK_LADDER.find((r) => r.lvl > level)?.lvl; // immediate target
  const journeyRanks = RANK_LADDER.map((r) => {
    const reached = level >= r.lvl;
    const current = baseRank === r.name;
    const isNext = r.lvl === nextLockedLvl;
    const distance = Math.max(0, r.lvl - level);
    return {
      ...r,
      reached,
      current,
      isNext,
      distance,
      subtitle: current || isNext ? r.desc : `Level ${r.lvl}+`,
      mark: current
        ? "● Current"
        : reached
          ? "✓"
          : `${distance} ${distance === 1 ? "level" : "levels"} away`,
      nodeBg: current
        ? "var(--ember)"
        : reached
          ? "rgba(255,178,62,.2)"
          : "var(--charcoal)",
      nodeColor: current
        ? "#1a0f08"
        : reached
          ? "var(--ember)"
          : "var(--ashDim)",
      nodeBorder: current
        ? "2px solid var(--ember)"
        : reached
          ? "1px solid rgba(255,178,62,.4)"
          : "1px solid var(--slate)",
      cardBg: current ? "rgba(255,178,62,.12)" : "var(--charcoal)",
      cardBorder: current
        ? "var(--ember)"
        : isNext
          ? "var(--slateHi)"
          : "var(--slate)",
      nameColor: reached || current ? "var(--bone)" : "var(--ashDim)",
      markColor: current
        ? "var(--ember)"
        : reached
          ? "var(--go)"
          : isNext
            ? "var(--ember)"
            : "var(--ashDim)",
    };
  });
  // top-down climb: Legend at the summit, Rookie at the base
  const journeyClimb = [...journeyRanks].reverse();
  const quizPct = Math.round((quizStep / (STEP_ORDER.length - 1)) * 100);
  const quizShowChrome = quizStep >= STEP.scenario && quizStep <= STEP.respect;
  let goalVals = [2, 3, 5, 7];
  if (quiz.freq === "never" || quiz.freq === "rarely") goalVals = [2, 3, 4];
  else if (quiz.freq === "sometimes") goalVals = [3, 4, 5];
  else if (quiz.freq === "often") goalVals = [4, 5, 7];
  const quizGoal = quiz.goal || goalVals[1];

  const optStyle = (sel: boolean): CSSProperties => ({
    background: sel ? "rgba(52,209,126,.1)" : "var(--charcoal)",
    border: `1.5px solid ${sel ? "var(--go)" : "var(--slate)"}`,
  });

  const anxScale = (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        fontFamily: MONO,
        fontSize: 10.5,
        color: "var(--ashDim)",
      }}
    >
      <span>1 · calm</span>
      <span>10 · terrified</span>
    </div>
  );

  return {
    startScreen,
    courageColor,
    confetti,
    rootRef,
    rafRef,
    intervalRef,
    screen,
    setScreen,
    draft,
    setDraft,
    reward,
    setReward,
    displayXp,
    setDisplayXp,
    displayReps,
    setDisplayReps,
    numberSaved,
    setNumberSaved,
    toast,
    setToast,
    hypeStep,
    setHypeStep,
    hypeCount,
    setHypeCount,
    quizStep,
    setQuizStep,
    quiz,
    setQuiz,
    pushBusy,
    setPushBusy,
    goalEditing,
    setGoalEditing,
    pendingPlan,
    setPendingPlan,
    replaying,
    setReplaying,
    booted,
    setBooted,
    timezone,
    me,
    dash,
    pushStatus,
    logRepMut,
    completeOnboardingMut,
    setWeeklyGoalMut,
    markNumberMut,
    saveSubMut,
    removeSubMut,
    isSignedIn,
    isLoaded,
    openSignIn,
    openSignUp,
    signOut,
    user,
    clerkUser,
    VAPID,
    onboarded,
    booting,
    trend,
    haptic,
    nav,
    showToast,
    startHype,
    hypeGo,
    hypeWhy,
    hypeBarrier,
    startLog,
    setAnx,
    buildReward,
    animateReward,
    logIt,
    quizSet,
    quizToggle,
    quizNext,
    quizBack,
    quizFinish,
    pushOn,
    DOW_NAMES,
    remHour,
    scheduleLabel,
    reminderMode,
    setReminderMode,
    needsIosInstall,
    submitFeedbackMut,
    level,
    base,
    into,
    need,
    xpToNext,
    levelPct,
    rank,
    nextRankHint,
    chart,
    fearLabel,
    isFresh,
    baselineAnx,
    hasRepsToday,
    todayMode,
    baseRank,
    nextLockedLvl,
    journeyRanks,
    journeyClimb,
    quizPct,
    quizShowChrome,
    goalVals,
    quizGoal,
    optStyle,
    anxScale,
  };
}
