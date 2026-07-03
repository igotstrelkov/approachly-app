export type Screen =
  | "landing"
  | "home"
  | "hype"
  | "log"
  | "reward"
  | "you"
  | "quiz"
  | "ranks"
  | "ladder";
export type Vibe = "GREAT_SET" | "STILL_A_REP" | null;

// Onboarding step order — the single source of truth for the quiz sequence.
// Render blocks and helpers key off STEP.<name>, so reordering or inserting a
// step is an edit to this array, not a hand-renumber of a dozen `quizStep === N`
// checks scattered through the render.
export const STEP_ORDER = [
  "reframe", // "swiping is hiding" reframe + chart
  "scenario", // what usually happens when you see someone (freq)
  "anxiety", // baseline anxiety slider
  "motivation", // why you're here (multi-select)
  "barrier", // what's really stopping you
  "reassure", // you're not alone interstitial
  "goal", // weekly goal
  "respect", // the pledge interstitial
  "building", // loading beat → auto-advances to plan
  "plan", // plan reveal → quizFinish
] as const;
export const STEP = Object.fromEntries(
  STEP_ORDER.map((k, i) => [k, i]),
) as Record<(typeof STEP_ORDER)[number], number>;
