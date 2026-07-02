"use client";

/*
 * Couragely — full app, ported 1:1 from the Claude Design bundle.
 * PHASE 1: faithful, self-contained port with in-memory mock state (no backend),
 * so the UX matches the design exactly. PHASE 2 swaps this local state for Convex
 * queries/mutations + Clerk auth (see convex/ + SETUP.md).
 */

import { subscribeThisDevice, unsubscribeThisDevice } from "@/lib/push";
import { track, trackCustom } from "@/lib/analytics";
import { useAuth, useClerk, useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import Image from "next/image";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

const DISPLAY = "var(--font-display), Anton, sans-serif";
const MONO = "var(--font-space-mono), 'Space Mono', monospace";
const GO_GRAD = "linear-gradient(180deg,#3BE389,var(--go))";

// ---------- pure logic (mirrors the design) ----------
const levelForXp = (xp: number) => {
  let L = 1;
  while (75 * (L + 1) * L <= xp) L++;
  return L;
};
const xpForLevel = (L: number) => 75 * L * (L - 1);
const PRESTIGE_START = 20;
const PRESTIGE_BAND = 5;
function toRoman(n: number): string {
  const map: [number, string][] = [
    [1000, "M"],
    [900, "CM"],
    [500, "D"],
    [400, "CD"],
    [100, "C"],
    [90, "XC"],
    [50, "L"],
    [40, "XL"],
    [10, "X"],
    [9, "IX"],
    [5, "V"],
    [4, "IV"],
    [1, "I"],
  ];
  let r = "",
    x = Math.max(1, Math.floor(n));
  for (const [v, s] of map)
    while (x >= v) {
      r += s;
      x -= v;
    }
  return r;
}
const rankForLevel = (L: number) =>
  L >= PRESTIGE_START
    ? `Legend ${toRoman(Math.floor((L - PRESTIGE_START) / PRESTIGE_BAND) + 1)}`
    : L >= 15
      ? "Ironclad"
      : L >= 10
        ? "Fearless"
        : L >= 5
          ? "Bold"
          : "Rookie";
// Base (undecorated) rank — used to match the 5-rung ladder's "current" state.
const baseRankForLevel = (L: number) =>
  L >= 20
    ? "Legend"
    : L >= 15
      ? "Ironclad"
      : L >= 10
        ? "Fearless"
        : L >= 5
          ? "Bold"
          : "Rookie";
const RANK_LADDER = [
  {
    name: "Rookie",
    lvl: 1,
    short: "RK",
    desc: "showing up for the first reps",
  },
  {
    name: "Bold",
    lvl: 5,
    short: "BD",
    desc: "walking over even when it's scary",
  },
  {
    name: "Fearless",
    lvl: 10,
    short: "FR",
    desc: "where approaching starts to feel normal",
  },
  {
    name: "Ironclad",
    lvl: 15,
    short: "IC",
    desc: "rejection barely registers anymore",
  },
  {
    name: "Legend",
    lvl: 20,
    short: "LG",
    desc: "you approach on pure instinct",
  },
] as const;

type Mode = {
  n: number;
  name: string;
  emoji: string;
  color: string;
  blurb: string;
};
const MODES: Mode[] = [
  {
    n: 1,
    name: "Warm-up",
    emoji: "🔥",
    color: "#34D17E",
    blurb: "The first one's the hardest — and you just beat the freeze.",
  },
  {
    n: 2,
    name: "Locked In",
    emoji: "💪",
    color: "#FFB23E",
    blurb: "Two down. You're locked in now — nerves don't stand a chance.",
  },
  {
    n: 3,
    name: "Dialed",
    emoji: "⚡",
    color: "#FF9A2E",
    blurb: "Three in a day. Fully dialed — you're on another level.",
  },
  {
    n: 4,
    name: "Beast Mode",
    emoji: "🦍",
    color: "#FF5A36",
    blurb: "Four. Beast mode: fear isn't driving anymore — you are.",
  },
  {
    n: 5,
    name: "Cracked",
    emoji: "🚀",
    color: "#FF3D6E",
    blurb: "Five. Absolutely cracked. No wall left to hit today.",
  },
  {
    n: 6,
    name: "Him",
    emoji: "👑",
    color: "#C15CFF",
    blurb: "Six. Yeah — you're Him. A different person than day one.",
  },
  {
    n: 7,
    name: "Final Boss",
    emoji: "🌌",
    color: "#8B7BFF",
    blurb: "Seven and climbing. Final boss energy. Untouchable.",
  },
];
const modeFor = (n: number) => MODES[Math.min(Math.max(n, 1), 7) - 1];

const hexA = (hex: string, a: number) => {
  const h = hex.replace("#", "");
  return `rgba(${parseInt(h.slice(0, 2), 16)},${parseInt(h.slice(2, 4), 16)},${parseInt(h.slice(4, 6), 16)},${a})`;
};

// Monotone cubic (Fritsch–Carlson): tangents are clamped so a segment never
// overshoots its endpoints — a falling trend can't render as an upward hump.
function monotonePath(pts: number[][]): string {
  const n = pts.length;
  if (n < 2)
    return (
      "M" + pts.map((p) => p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" L")
    );
  const xs = pts.map((p) => p[0]),
    ys = pts.map((p) => p[1]);
  const dx: number[] = [],
    slope: number[] = [];
  for (let i = 0; i < n - 1; i++) {
    dx[i] = xs[i + 1] - xs[i];
    slope[i] = (ys[i + 1] - ys[i]) / dx[i];
  }
  const m: number[] = new Array(n);
  m[0] = slope[0];
  m[n - 1] = slope[n - 2];
  for (let i = 1; i < n - 1; i++)
    m[i] = slope[i - 1] * slope[i] <= 0 ? 0 : (slope[i - 1] + slope[i]) / 2;
  for (let i = 0; i < n - 1; i++) {
    if (slope[i] === 0) {
      m[i] = 0;
      m[i + 1] = 0;
      continue;
    }
    const a = m[i] / slope[i],
      b = m[i + 1] / slope[i],
      s = a * a + b * b;
    if (s > 9) {
      const t = 3 / Math.sqrt(s);
      m[i] = t * a * slope[i];
      m[i + 1] = t * b * slope[i];
    }
  }
  let path = "M" + xs[0].toFixed(1) + " " + ys[0].toFixed(1);
  for (let i = 0; i < n - 1; i++) {
    const c1x = xs[i] + dx[i] / 3,
      c1y = ys[i] + (m[i] * dx[i]) / 3;
    const c2x = xs[i + 1] - dx[i] / 3,
      c2y = ys[i + 1] - (m[i + 1] * dx[i]) / 3;
    path +=
      " C" +
      c1x.toFixed(1) +
      " " +
      c1y.toFixed(1) +
      " " +
      c2x.toFixed(1) +
      " " +
      c2y.toFixed(1) +
      " " +
      xs[i + 1].toFixed(1) +
      " " +
      ys[i + 1].toFixed(1);
  }
  return path;
}

function buildChart(trend: number[], W: number, H: number) {
  const pad = 8,
    padB = 8;
  const max = Math.max(...trend),
    min = Math.min(...trend),
    range = Math.max(1, max - min);
  const pts = trend.map((v, i) => [
    pad + (trend.length === 1 ? 0.5 : i / (trend.length - 1)) * (W - pad * 2),
    pad + (1 - (v - min) / range) * (H - pad - padB),
  ]);
  const line = monotonePath(pts);
  const first = pts[0],
    last = pts[pts.length - 1];
  const area =
    line +
    " L" +
    last[0].toFixed(1) +
    " " +
    H +
    " L" +
    first[0].toFixed(1) +
    " " +
    H +
    " Z";
  // faint straight reference from first → current so the overall direction is unambiguous
  const refLine =
    "M" +
    first[0].toFixed(1) +
    " " +
    first[1].toFixed(1) +
    " L" +
    last[0].toFixed(1) +
    " " +
    last[1].toFixed(1);

  const delta = trend[0] - trend[trend.length - 1]; // positive = improvement (lower fear is better)
  const hasDelta = trend.length >= 2;
  let chartArrow: string,
    chartDelta: string,
    chartTrendColor: string,
    chartTrendTint: string;
  if (!hasDelta || Math.abs(delta) <= 0.05) {
    chartArrow = "—";
    chartDelta = "no change yet";
    chartTrendColor = "var(--ash)";
    chartTrendTint = "var(--slate)";
  } else if (delta > 0.05) {
    chartArrow = "▼";
    chartDelta = Math.abs(delta).toFixed(1) + " since start";
    chartTrendColor = "var(--go)";
    chartTrendTint = "rgba(52,209,126,.12)";
  } else {
    chartArrow = "▲";
    chartDelta = Math.abs(delta).toFixed(1) + " since start";
    chartTrendColor = "var(--amber)";
    chartTrendTint = "rgba(224,160,48,.12)";
  }
  return {
    chartLine: line,
    chartArea: area,
    chartRefLine: refLine,
    chartW: W,
    chartH: H,
    chartDotX: last[0].toFixed(1),
    chartDotY: last[1].toFixed(1),
    chartCurrent: trend[trend.length - 1].toFixed(1),
    chartArrow,
    chartDelta,
    chartTrendColor,
    chartTrendTint,
    chartSubcaption: hasDelta
      ? "Down is the win. Your real line — not a promise."
      : "Baseline set. Log a rep to start drawing your line.",
  };
}

type Confetto = { id: number; style: CSSProperties };
function makeConfetti(accent: string, enabled: boolean): Confetto[] {
  if (!enabled) return [];
  const cols = [accent, "#F4F3F0", "#FFB23E", "#34D17E", "#FF5A36"];
  const arr: Confetto[] = [];
  for (let i = 0; i < 52; i++) {
    const size = 6 + Math.random() * 8,
      round = Math.random() > 0.5;
    arr.push({
      id: i,
      style: {
        position: "absolute",
        top: -24,
        left: `${Math.random() * 100}%`,
        width: size,
        height: round ? size : size * 0.45,
        background: cols[i % cols.length],
        borderRadius: round ? "50%" : 2,
        animation: `aConfetti ${(0.95 + Math.random() * 0.9).toFixed(2)}s ${(Math.random() * 0.3).toFixed(2)}s cubic-bezier(.2,.6,.35,1) forwards`,
      },
    });
  }
  return arr;
}

// shared small styles
const iconBtn: CSSProperties = {
  width: 38,
  height: 38,
  borderRadius: 11,
  border: "1px solid var(--slate)",
  background: "var(--charcoal)",
  color: "var(--ash)",
  fontSize: 18,
  cursor: "pointer",
};
const eyebrow = (color: string): CSSProperties => ({
  fontFamily: MONO,
  fontSize: 11,
  letterSpacing: 2.4,
  color,
  textTransform: "uppercase",
});

type Screen =
  "landing" | "home" | "hype" | "log" | "reward" | "you" | "quiz" | "ranks";
type Vibe = "GREAT_SET" | "STILL_A_REP" | null;
type BeforeInstallPromptEvent = Event & {
  prompt: () => void;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const AnxRow = ({
  value,
  onPick,
}: {
  value: number;
  onPick: (n: number) => void;
}) => (
  <div style={{ display: "flex", gap: 5, marginBottom: 8 }}>
    {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => {
      const on = n === value;
      return (
        <button
          key={n}
          className="aq-cell"
          onClick={() => onPick(n)}
          style={{
            flex: 1,
            height: 46,
            border: "none",
            borderRadius: 10,
            cursor: "pointer",
            background: on ? "var(--bone)" : "var(--slate)",
            color: on ? "var(--ink)" : "var(--ash)",
            fontFamily: MONO,
            fontSize: 14,
            fontWeight: 700,
            transform: on ? "scale(1.08)" : "scale(1)",
            transition:
              "transform .13s cubic-bezier(.3,1.4,.5,1),background .13s ease",
          }}
        >
          {n}
        </button>
      );
    })}
  </div>
);

export default function ApproachlyApp({
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
  }>({ vibe: null, anxiety: 5, note: "" });
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
    goal: number | null;
    respect: boolean;
  }>({ freq: null, anxiety: 5, motivation: [], goal: null, respect: false });
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
  const [pushBusy, setPushBusy] = useState(false);
  const [goalEditing, setGoalEditing] = useState(false);
  const [installEvent, setInstallEvent] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS] = useState(() =>
    typeof navigator !== "undefined"
      ? /iphone|ipad|ipod/i.test(navigator.userAgent)
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

  // PWA install: capture the deferred prompt (Chrome/Android/desktop) + detect platform.
  useEffect(() => {
    const onBIP = (e: Event) => {
      e.preventDefault();
      setInstallEvent(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onBIP);
    const onInstalled = () => setInstallEvent(null);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBIP);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

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

  // log
  const startLog = () => {
    setDraft({ vibe: null, anxiety: 5, note: "" });
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
      eyebrow:
        repsToday === 1
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
    const countMs = [10, 25, 50, 100, 250, 500];
    const milestone = res.isNewPeak
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
    setQuizStep(step);
    if (step === 7)
      setTimeout(() => setQuizStep((s) => (s === 7 ? 8 : s)), 1900);
    window.scrollTo(0, 0);
  };
  const quizBack = () => setQuizStep((s) => Math.max(0, s - 1));
  const quizFinish = () => {
    const plan: Plan = {
      weeklyGoal: quiz.goal || 3,
      baselineAnxiety: quiz.anxiety,
      reason: quiz.motivation[0] || undefined,
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

  // PWA install (onboarding "Add to Home Screen")
  const handleInstall = async () => {
    if (installEvent) {
      try {
        installEvent.prompt();
        await installEvent.userChoice;
      } catch {
        /* ignore */
      }
      setInstallEvent(null);
      quizFinish();
    } else if (isIOS && !isStandalone) {
      // iOS has no programmatic install — guide, and let them tap "Enter Couragely" after.
      showToast("Tap the Share icon in Safari, then 'Add to Home Screen'.");
    } else {
      quizFinish();
    }
  };

  // weekly reminder push
  const pushOn = !!pushStatus?.subscribed;
  const DOW_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const remHour = pushStatus?.reminderHour ?? 10;
  const scheduleLabel = `${DOW_NAMES[pushStatus?.reminderDow ?? 0]} · ${remHour % 12 || 12}:00 ${remHour < 12 ? "AM" : "PM"}`;
  const toggleReminders = async () => {
    if (pushBusy) return;
    setPushBusy(true);
    try {
      if (!pushOn) {
        if (!VAPID) {
          showToast("Push isn't configured.");
          return;
        }
        const sub = await subscribeThisDevice(VAPID);
        await saveSubMut(sub);
        showToast("Weekly reminders on.");
      } else {
        const endpoint = await unsubscribeThisDevice();
        if (endpoint) await removeSubMut({ endpoint });
        showToast("Weekly reminders off.");
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
  const chart = buildChart(trend, 360, 190);
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
  const quizPct = Math.round((quizStep / 9) * 100);
  const quizShowChrome = quizStep >= 1 && quizStep <= 6;
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
        {screen === "home" && (
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
              <div style={{ ...eyebrow("var(--ash)"), letterSpacing: 2 }}>
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
                  <svg
                    viewBox="0 0 360 84"
                    width="100%"
                    style={{ display: "block" }}
                  >
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
                    Log your first rep to draw the first real point. From here,
                    the only way is down.
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
                  <div
                    style={{ display: "flex", alignItems: "baseline", gap: 9 }}
                  >
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
                    <span
                      style={{ color: chart.chartTrendColor, fontSize: 13 }}
                    >
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
                      <stop
                        offset="0%"
                        stopColor="var(--go)"
                        stopOpacity="0.22"
                      />
                      <stop
                        offset="100%"
                        stopColor="var(--go)"
                        stopOpacity="0"
                      />
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
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 11,
                      marginTop: 24,
                      background: hexA(todayMode.color, 0.12),
                      border: `1px solid ${todayMode.color}`,
                      borderRadius: 14,
                      padding: "11px 14px",
                    }}
                  >
                    <span style={{ fontSize: 20, lineHeight: 1 }}>
                      {todayMode.emoji}
                    </span>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontFamily: MONO,
                          fontSize: 10,
                          letterSpacing: 1.5,
                          color: "var(--ash)",
                          textTransform: "uppercase",
                        }}
                      >
                        Today
                      </div>
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: 14.5,
                          color: todayMode.color,
                        }}
                      >
                        {todayMode.name}
                      </div>
                    </div>
                    <span
                      style={{
                        fontFamily: MONO,
                        fontSize: 12.5,
                        color: "var(--ash)",
                      }}
                    >
                      {user.repsToday === 1
                        ? "1 rep"
                        : `${user.repsToday} reps`}
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
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 14 }}
                >
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
                <div
                  style={{
                    ...eyebrow("var(--ash)"),
                    letterSpacing: 2,
                    marginBottom: 6,
                  }}
                >
                  Your progress
                </div>
                <div>
                  {/* This week — with a glanceable goal indicator */}
                  <div
                    style={{
                      padding: "17px 0",
                      borderBottom: "1px solid var(--slate)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: 10,
                      }}
                    >
                      <span style={{ fontSize: 14.5, color: "var(--bone)" }}>
                        This week
                      </span>
                      {user.repsThisWeek >= user.weeklyGoal ? (
                        <span
                          style={{
                            fontFamily: MONO,
                            fontSize: 14,
                            color: "var(--go)",
                            fontWeight: 700,
                          }}
                        >
                          Goal hit ✓
                        </span>
                      ) : (
                        <span
                          style={{
                            fontFamily: MONO,
                            fontSize: 14,
                            color: "var(--bone)",
                          }}
                        >
                          <span style={{ color: "var(--go)" }}>
                            {user.repsThisWeek}
                          </span>{" "}
                          / {user.weeklyGoal} · goal
                        </span>
                      )}
                    </div>
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
                  </div>
                  {[
                    {
                      l: (
                        <span style={{ fontSize: 14.5, color: "var(--bone)" }}>
                          Weekly streak
                        </span>
                      ),
                      r: (
                        <span
                          style={{
                            fontFamily: MONO,
                            fontSize: 14,
                            color: "var(--bone)",
                          }}
                        >
                          <span style={{ color: "var(--ember)" }}>
                            {user.streakWeeks}
                          </span>{" "}
                          now · {user.streakLongest} best
                        </span>
                      ),
                    },
                    {
                      l: (
                        <span style={{ fontSize: 14.5, color: "var(--bone)" }}>
                          Total approaches
                        </span>
                      ),
                      r: (
                        <span
                          style={{
                            fontFamily: MONO,
                            fontSize: 14,
                            color: "var(--bone)",
                          }}
                        >
                          {user.totalApproaches}
                        </span>
                      ),
                    },
                    {
                      l: (
                        <span style={{ fontSize: 14.5, color: "var(--bone)" }}>
                          Great sets{" "}
                          <span style={{ color: "var(--go)" }}>▲</span>
                        </span>
                      ),
                      r: (
                        <span
                          style={{
                            fontFamily: MONO,
                            fontSize: 14,
                            color: "var(--go)",
                          }}
                        >
                          {user.greatSets} &amp; climbing
                        </span>
                      ),
                    },
                  ].map((row, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "17px 0",
                        borderBottom: "1px solid var(--slate)",
                      }}
                    >
                      {row.l}
                      {row.r}
                    </div>
                  ))}
                  {/* Journey card — ambient hook into the Ranks view (not the hero) */}
                  <button
                    onClick={() => nav("ranks")}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      cursor: "pointer",
                      display: "block",
                      marginTop: 18,
                      background: "var(--charcoal)",
                      border: "1px solid var(--slate)",
                      borderRadius: 16,
                      padding: 16,
                    }}
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 13 }}
                    >
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
                          <span style={{ color: "var(--ash)" }}>
                            · Level {level}
                          </span>
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
                      <span style={{ color: "var(--ash)", fontSize: 20 }}>
                        ›
                      </span>
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
                          background:
                            "linear-gradient(90deg,var(--ember),#FFCF7A)",
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
        )}

        {/* ============ HYPE ============ */}
        {screen === "hype" && (
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
        )}

        {/* ============ LOG ============ */}
        {screen === "log" && (
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
                <div style={{ fontSize: 22, marginBottom: 8 }}>✦</div>
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
                <div style={{ fontSize: 22, marginBottom: 8 }}>◆</div>
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
              disabled={!draft.vibe}
              style={{
                width: "100%",
                border: "none",
                borderRadius: 20,
                padding: 19,
                cursor: draft.vibe ? "pointer" : "not-allowed",
                background: draft.vibe ? GO_GRAD : "var(--slate)",
                color: draft.vibe ? "#07130C" : "var(--ashDim)",
                fontFamily: DISPLAY,
                fontSize: 22,
                textTransform: "uppercase",
              }}
            >
              Log it
            </button>
          </div>
        )}

        {/* ============ REWARD ============ */}
        {screen === "reward" && reward && (
          <div
            style={{
              minHeight: "100vh",
              position: "relative",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "calc(env(safe-area-inset-top, 0px) + 20px) 24px 32px",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                pointerEvents: "none",
                overflow: "hidden",
              }}
            >
              {reward.confetti.map((c) => (
                <div key={c.id} style={c.style} />
              ))}
            </div>
            <div
              style={{
                position: "relative",
                zIndex: 2,
                width: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                flex: 1,
              }}
            >
              <div
                style={{
                  position: "relative",
                  marginTop: 10,
                  marginBottom: 6,
                  animation: "aPop .5s cubic-bezier(.2,.8,.3,1.2) both",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    inset: -24,
                    borderRadius: "50%",
                    background: `radial-gradient(circle,${hexA(reward.mode.color, 0.5)} 0%,transparent 70%)`,
                    animation: "aGlow 2.4s ease-in-out infinite",
                  }}
                />
                <div
                  style={{
                    position: "relative",
                    width: 100,
                    height: 100,
                    borderRadius: 30,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 50,
                    background: "var(--charcoal)",
                    border: `1.5px solid ${reward.mode.color}`,
                  }}
                >
                  {reward.mode.emoji}
                </div>
              </div>
              <div
                style={{
                  fontFamily: MONO,
                  fontSize: 11,
                  letterSpacing: 2.5,
                  textTransform: "uppercase",
                  color: "var(--ash)",
                  marginBottom: 2,
                }}
              >
                {reward.eyebrow}
              </div>
              <div
                style={{
                  fontFamily: DISPLAY,
                  fontSize: 28,
                  textTransform: "uppercase",
                  color: reward.mode.color,
                  animation: "aFadeUp .5s .1s both",
                }}
              >
                {reward.mode.name}
              </div>
              <div
                style={{
                  fontSize: 13.5,
                  color: "var(--bone)",
                  maxWidth: 290,
                  textAlign: "center",
                  lineHeight: 1.4,
                  marginTop: 8,
                  animation: "aFadeUp .5s .16s both",
                }}
              >
                {reward.mode.blurb}
              </div>

              <div
                style={{
                  marginTop: 24,
                  textAlign: "center",
                  animation: "aFadeUp .5s .18s both",
                }}
              >
                <div
                  style={{
                    fontFamily: DISPLAY,
                    fontSize: 74,
                    lineHeight: 0.9,
                    color: "var(--go)",
                  }}
                >
                  +{displayXp}
                </div>
                <div
                  style={{
                    fontFamily: MONO,
                    fontSize: 12,
                    letterSpacing: 2,
                    color: "var(--ash)",
                    textTransform: "uppercase",
                  }}
                >
                  XP · Courage banked
                </div>
              </div>

              {reward.leveledUp && (
                <div
                  style={{
                    marginTop: 18,
                    padding: "10px 20px",
                    borderRadius: 999,
                    background: "rgba(255,178,62,.12)",
                    border: "1px solid rgba(255,178,62,.5)",
                    animation: "aPop .5s .3s both",
                  }}
                >
                  <span
                    style={{
                      fontFamily: MONO,
                      fontSize: 12,
                      letterSpacing: 1.5,
                      color: "var(--ember)",
                      textTransform: "uppercase",
                    }}
                  >
                    ⬆ Level up · Level {reward.newLevel}
                  </span>
                </div>
              )}
              {reward.rankUp && (
                <div
                  style={{
                    marginTop: 10,
                    textAlign: "center",
                    animation: "aPop .5s .4s both",
                  }}
                >
                  <div
                    style={{
                      fontFamily: MONO,
                      fontSize: 11,
                      letterSpacing: 2,
                      color: "var(--ash)",
                      textTransform: "uppercase",
                    }}
                  >
                    New rank
                  </div>
                  <div
                    style={{
                      fontFamily: DISPLAY,
                      fontSize: 24,
                      color: "var(--ember)",
                      textTransform: "uppercase",
                    }}
                  >
                    {reward.newRank}
                  </div>
                </div>
              )}
              {reward.milestone && (
                <div
                  style={{
                    marginTop: 16,
                    padding: "10px 20px",
                    borderRadius: 999,
                    background: hexA(reward.milestone.color, 0.12),
                    border: `1px solid ${hexA(reward.milestone.color, 0.5)}`,
                    animation: "aPop .5s .45s both",
                  }}
                >
                  <span
                    style={{
                      fontFamily: MONO,
                      fontSize: 12,
                      letterSpacing: 1.5,
                      color: reward.milestone.color,
                      textTransform: "uppercase",
                    }}
                  >
                    ⭐ {reward.milestone.label}
                  </span>
                </div>
              )}

              <div
                style={{
                  marginTop: 26,
                  textAlign: "center",
                  maxWidth: 300,
                  animation: "aFadeUp .5s .28s both",
                }}
              >
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 18,
                    color: "var(--bone)",
                    lineHeight: 1.3,
                  }}
                >
                  Rep logged. Showing up is the whole win.
                </div>
                <div
                  style={{ marginTop: 10, fontSize: 13, color: "var(--ash)" }}
                >
                  Approach{" "}
                  <span style={{ fontFamily: MONO, color: "var(--bone)" }}>
                    #{displayReps}
                  </span>{" "}
                  ·{" "}
                  <span style={{ fontFamily: MONO, color: "var(--bone)" }}>
                    {reward.streak}
                  </span>
                  -week streak
                </div>
              </div>

              <button
                onClick={async () => {
                  const next = !numberSaved;
                  setNumberSaved(next);
                  try {
                    await markNumberMut({
                      approachId: reward.approachId,
                      gotNumber: next,
                    });
                    if (next) trackCustom("GotNumber");
                  } catch {
                    setNumberSaved(!next);
                    showToast("Couldn't save that.");
                  }
                }}
                style={{
                  marginTop: 18,
                  background: numberSaved
                    ? "rgba(52,209,126,.12)"
                    : "var(--charcoal)",
                  border: `1px solid ${numberSaved ? "var(--go)" : "var(--slateHi)"}`,
                  borderRadius: 999,
                  padding: "9px 16px",
                  color: numberSaved ? "var(--go)" : "var(--ash)",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  animation: "aFadeUp .5s .34s both",
                }}
              >
                <span>📱</span>
                {numberSaved ? "Number saved ✓" : "Got their number?"}
              </button>

              <div style={{ flex: 1 }} />

              <div style={{ width: "100%", animation: "aFadeUp .5s .5s both" }}>
                <button
                  onClick={() => nav("home")}
                  style={{
                    width: "100%",
                    border: "none",
                    borderRadius: 18,
                    padding: 16,
                    cursor: "pointer",
                    background: GO_GRAD,
                    color: "#07130C",
                    fontWeight: 700,
                    fontSize: 16,
                  }}
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============ YOU ============ */}
        {screen === "you" && (
          <div
            style={{
              minHeight: "100vh",
              padding: "calc(env(safe-area-inset-top, 0px) + 20px) 22px 40px",
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
                ‹
              </button>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 15,
                marginBottom: 30,
              }}
            >
              <div
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 19,
                  background:
                    "linear-gradient(135deg,var(--ember),var(--flare))",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: DISPLAY,
                  fontSize: 26,
                  color: "#1a0f08",
                }}
              >
                {level}
              </div>
              <div>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 19,
                    color: "var(--bone)",
                  }}
                >
                  {rank}
                </div>
                <div
                  style={{
                    fontFamily: MONO,
                    fontSize: 12,
                    color: "var(--ash)",
                  }}
                >
                  Level {level} · {user.totalApproaches} approach
                  {user.totalApproaches === 1 ? "" : "es"}
                </div>
                {clerkUser?.primaryEmailAddress?.emailAddress && (
                  <div
                    style={{
                      fontSize: 12,
                      color: "var(--ashDim)",
                      marginTop: 3,
                    }}
                  >
                    {clerkUser.primaryEmailAddress.emailAddress}
                  </div>
                )}
              </div>
            </div>

            <div
              style={{
                fontFamily: MONO,
                fontSize: 10.5,
                letterSpacing: 1.5,
                color: "var(--ash)",
                textTransform: "uppercase",
                marginBottom: 8,
              }}
            >
              Your plan
            </div>
            <div>
              {/* Weekly goal — tap to edit */}
              <button
                onClick={() => setGoalEditing((v) => !v)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "16px 0",
                  background: "none",
                  border: "none",
                  borderBottom: "1px solid var(--slate)",
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <span style={{ fontSize: 14.5, color: "var(--bone)" }}>
                  Weekly goal
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span
                    style={{
                      fontFamily: MONO,
                      fontSize: 14,
                      color: "var(--go)",
                      fontWeight: 700,
                    }}
                  >
                    {user.weeklyGoal} / week
                  </span>
                  <span
                    style={{
                      color: "var(--ash)",
                      fontSize: 17,
                      display: "inline-block",
                      transform: goalEditing ? "rotate(90deg)" : "none",
                      transition: "transform .15s",
                    }}
                  >
                    ›
                  </span>
                </span>
              </button>
              {goalEditing && (
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    padding: "14px 0",
                    borderBottom: "1px solid var(--slate)",
                  }}
                >
                  {[2, 3, 4, 5, 6, 7].map((g) => {
                    const sel = user.weeklyGoal === g;
                    return (
                      <button
                        key={g}
                        onClick={async () => {
                          setGoalEditing(false);
                          if (g === user.weeklyGoal) return;
                          try {
                            await setWeeklyGoalMut({ weeklyGoal: g });
                            showToast("Weekly goal updated.");
                          } catch {
                            showToast("Couldn't update goal.");
                          }
                        }}
                        style={{
                          flex: 1,
                          height: 44,
                          borderRadius: 12,
                          cursor: "pointer",
                          background: sel
                            ? "rgba(52,209,126,.12)"
                            : "var(--charcoal)",
                          border: `1.5px solid ${sel ? "var(--go)" : "var(--slate)"}`,
                          color: sel ? "var(--go)" : "var(--bone)",
                          fontFamily: MONO,
                          fontSize: 15,
                          fontWeight: 700,
                        }}
                      >
                        {g}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Weekly reminder — toggle switch */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "16px 0",
                  borderBottom: "1px solid var(--slate)",
                  gap: 12,
                }}
              >
                <div>
                  <div style={{ fontSize: 14.5, color: "var(--bone)" }}>
                    Weekly reminder
                  </div>
                  <div
                    style={{ fontSize: 12, color: "var(--ash)", marginTop: 2 }}
                  >
                    {pushBusy
                      ? "…"
                      : pushOn
                        ? scheduleLabel
                        : "A weekly nudge toward your goal"}
                  </div>
                </div>
                <button
                  role="switch"
                  aria-checked={pushOn}
                  aria-label="Weekly reminder"
                  onClick={toggleReminders}
                  disabled={pushBusy}
                  style={{
                    width: 46,
                    height: 28,
                    borderRadius: 999,
                    background: pushOn ? "var(--go)" : "var(--slate)",
                    border: "none",
                    position: "relative",
                    cursor: pushBusy ? "default" : "pointer",
                    flexShrink: 0,
                    opacity: pushBusy ? 0.6 : 1,
                    transition: "background .2s",
                  }}
                >
                  <span
                    style={{
                      position: "absolute",
                      top: 3,
                      left: pushOn ? 21 : 3,
                      width: 22,
                      height: 22,
                      borderRadius: "50%",
                      background: "#fff",
                      transition: "left .2s",
                      boxShadow: "0 1px 3px rgba(0,0,0,.4)",
                    }}
                  />
                </button>
              </div>

              {/* Week rolls over */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "16px 0",
                  borderBottom: "1px solid var(--slate)",
                }}
              >
                <span style={{ fontSize: 14.5, color: "var(--bone)" }}>
                  Week rolls over
                </span>
                <span style={{ fontSize: 13, color: "var(--ash)" }}>
                  4:00 AM local
                </span>
              </div>
            </div>

            <button
              onClick={async () => {
                setBooted(false);
                setQuizStep(0);
                setScreen("quiz");
                await signOut();
              }}
              style={{
                width: "100%",
                marginTop: 30,
                background: "none",
                border: "1px solid var(--slate)",
                borderRadius: 14,
                padding: 15,
                color: "var(--ash)",
                fontSize: 14.5,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Sign out
            </button>
            <div
              style={{
                textAlign: "center",
                fontSize: 11,
                color: "var(--ashDim)",
                marginTop: 18,
              }}
            >
              Couragely · adults approaching adults · 18+
            </div>
          </div>
        )}

        {/* ============ ONBOARDING / QUIZ ============ */}
        {screen === "quiz" && (
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
              {quizStep === 0 && (
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
                    <div
                      style={{
                        fontFamily: MONO,
                        fontSize: 12,
                        letterSpacing: 1.5,
                        color: "var(--go)",
                        marginBottom: 20,
                      }}
                    >
                      18+ · ADULTS APPROACHING ADULTS
                    </div>
                    <div
                      style={{
                        fontFamily: DISPLAY,
                        fontSize: 30,
                        color: "var(--bone)",
                        textTransform: "uppercase",
                        lineHeight: 1,
                        marginBottom: 16,
                      }}
                    >
                      Let&apos;s get you started
                    </div>
                    <div
                      style={{
                        fontSize: 15,
                        color: "var(--ash)",
                        lineHeight: 1.5,
                        maxWidth: 320,
                        margin: "0 auto",
                      }}
                    >
                      A few quick questions and we&apos;ll build your starting
                      point — then you&apos;ll log your first rep.
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

              {quizStep === 1 && (
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
                    Right now — how often do you actually walk over and say hi?
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 11,
                    }}
                  >
                    {[
                      { v: "never", label: "Never" },
                      { v: "rarely", label: "Rarely — a few times a year" },
                      { v: "sometimes", label: "Sometimes — about monthly" },
                      { v: "often", label: "Often — weekly or more" },
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

              {quizStep === 2 && (
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
                    Picture walking up to someone you find attractive. How
                    anxious?
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: "var(--ash)",
                      marginBottom: 26,
                    }}
                  >
                    This is your day-zero point — the line you&apos;re about to
                    bring down.
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

              {quizStep === 3 && (
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

              {quizStep === 4 && (
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
                      Approach anxiety is one of the most common social fears —
                      and one of the most beatable. It responds to one thing:
                      doing it, in small doses, on repeat.{" "}
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

              {quizStep === 5 && (
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
                    Your weekly goal. Beat it a few weeks and we&apos;ll nudge
                    it up.
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

              {quizStep === 6 && (
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
                      Take a &quot;no&quot; gracefully and move on. Never follow
                      or pressure anyone. A no is a complete win — respect it.
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

              {quizStep === 7 && (
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

              {quizStep === 8 && (
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
                        Illustrative — your real line is the one you&apos;re
                        about to draw.
                      </div>
                    </div>
                  </div>
                  <div style={{ flex: 1 }} />
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

              {quizStep === 9 && (
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
                    <div style={{ fontSize: 40, marginBottom: 18 }}>📲</div>
                    <div
                      style={{
                        fontFamily: DISPLAY,
                        fontSize: 28,
                        color: "var(--bone)",
                        textTransform: "uppercase",
                        lineHeight: 1.02,
                        marginBottom: 14,
                      }}
                    >
                      Make it stick
                    </div>
                    <div
                      style={{
                        fontSize: 14.5,
                        color: "var(--ash)",
                        lineHeight: 1.55,
                        maxWidth: 320,
                        margin: "0 auto 24px",
                      }}
                    >
                      Add Couragely to your home screen so the weekly nudge can
                      reach you. You can switch reminders on anytime from your
                      profile.
                    </div>
                    {!isStandalone && (
                      <button
                        onClick={handleInstall}
                        style={{
                          width: "100%",
                          border: "none",
                          borderRadius: 14,
                          padding: 16,
                          background: "var(--bone)",
                          color: "var(--ink)",
                          fontWeight: 700,
                          fontSize: 15,
                          cursor: "pointer",
                        }}
                      >
                        Add to Home Screen
                      </button>
                    )}
                  </div>
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
                    }}
                  >
                    Enter Couragely
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* ============ RANKS (permanent) ============ */}
        {screen === "ranks" && (
          <div
            style={{
              minHeight: "100vh",
              padding: "calc(env(safe-area-inset-top, 0px) + 20px) 22px 40px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: 22,
              }}
            >
              <button onClick={() => nav("home")} style={{ ...iconBtn }}>
                ‹
              </button>
            </div>
            <div
              style={{
                ...eyebrow("var(--ash)"),
                letterSpacing: 2.4,
                marginBottom: 12,
              }}
            >
              Your journey
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                marginBottom: 18,
              }}
            >
              <div
                style={{
                  width: 66,
                  height: 66,
                  flexShrink: 0,
                  borderRadius: 20,
                  background:
                    "linear-gradient(135deg,var(--ember),var(--flare))",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: DISPLAY,
                  fontSize: 30,
                  color: "#1a0f08",
                }}
              >
                {level}
              </div>
              <div>
                <div
                  style={{
                    fontFamily: DISPLAY,
                    fontSize: 26,
                    textTransform: "uppercase",
                    color: "var(--bone)",
                    lineHeight: 1,
                  }}
                >
                  Level {level}
                </div>
                <div
                  style={{
                    fontFamily: MONO,
                    fontSize: 12,
                    color: "var(--ash)",
                    marginTop: 3,
                  }}
                >
                  {into} / {need} XP
                </div>
              </div>
            </div>
            <div
              style={{
                height: 9,
                borderRadius: 999,
                background: "var(--slate)",
                overflow: "hidden",
                marginBottom: 8,
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
              style={{ fontSize: 12.5, color: "var(--ash)", marginBottom: 6 }}
            >
              {xpToNext} XP to Level {level + 1}
            </div>
            <div
              style={{ fontSize: 12, color: "var(--ash)", marginBottom: 32 }}
            >
              XP is courage banked — every rep counts, more the scarier it felt.
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                justifyContent: "space-between",
                marginBottom: 16,
              }}
            >
              <span style={{ ...eyebrow("var(--ash)"), letterSpacing: 2 }}>
                Ranks · permanent climb
              </span>
              <span
                style={{ fontFamily: MONO, fontSize: 11, color: "var(--ash)" }}
              >
                {user.totalApproaches} approaches
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column" }}>
              {journeyClimb.map((r, i, arr) => {
                const isTop = i === 0,
                  isBottom = i === arr.length - 1;
                const topFilled = !isTop && arr[i - 1].reached; // link up to the higher rank
                const botFilled = !isBottom && r.reached; // link down, climbed once this rank is reached
                const seg = (filled: boolean): CSSProperties =>
                  filled
                    ? {
                        background:
                          "linear-gradient(180deg, var(--ember), var(--go))",
                      }
                    : {
                        backgroundImage:
                          "repeating-linear-gradient(var(--ashDim) 0 3px, transparent 3px 8px)",
                      };
                return (
                  <div
                    key={r.name}
                    style={{
                      display: "flex",
                      gap: 14,
                      alignItems: "stretch",
                      minHeight: 84,
                    }}
                  >
                    <div
                      style={{
                        width: 34,
                        flexShrink: 0,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                      }}
                    >
                      <div
                        style={{
                          width: 2,
                          flex: 1,
                          ...(isTop
                            ? { background: "transparent" }
                            : seg(topFilled)),
                        }}
                      />
                      <div
                        style={{
                          width: 34,
                          height: 34,
                          flexShrink: 0,
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontFamily: MONO,
                          fontSize: 11,
                          fontWeight: 700,
                          background: r.nodeBg,
                          color: r.nodeColor,
                          border: r.nodeBorder,
                          zIndex: 1,
                        }}
                      >
                        {r.short}
                      </div>
                      <div
                        style={{
                          width: 2,
                          flex: 1,
                          ...(isBottom
                            ? { background: "transparent" }
                            : seg(botFilled)),
                        }}
                      />
                    </div>
                    <div
                      style={{
                        flex: 1,
                        alignSelf: "center",
                        display: "flex",
                        alignItems: "center",
                        gap: 13,
                        padding: "13px 15px",
                        borderRadius: 14,
                        background: r.cardBg,
                        border: `1px solid ${r.cardBorder}`,
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontWeight: 700,
                            fontSize: 15,
                            color: r.nameColor,
                          }}
                        >
                          {r.name}
                        </div>
                        <div
                          style={{
                            fontSize: 12,
                            color: "var(--ash)",
                            marginTop: 1,
                          }}
                        >
                          {r.subtitle}
                        </div>
                      </div>
                      <span
                        style={{
                          fontFamily: MONO,
                          fontSize: 11,
                          color: r.markColor,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {r.mark}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ============ LANDING (signed-out front door) ============ */}
        {screen === "landing" && (
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
              Swiping is hiding · 18+
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
              Walk up, say hi, get the number — without your mind going blank.
              Couragely trains the freeze out of you, one rep at a time.
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
                The real flex isn&apos;t a number — it&apos;s watching the fear
                drop.
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
                Rejection is just data. Showing up is the win. Here&apos;s how
                it feels.
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
                It&apos;s about not going home wondering &ldquo;what if.&rdquo;
                About not doing life alone. Couragely just gets you to the
                first hello — the rest is yours.
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
              Couragely · adults approaching adults · 18+
            </div>
          </div>
        )}
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
  );
}
