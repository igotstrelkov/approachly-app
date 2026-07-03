// Graduated exposure ladder ("missions") — a clinical exposure hierarchy, NOT
// pickup scripts. Every mission is a behavior the user *fully controls* (smile,
// ask, comment) — never an outcome that depends on the other person. This is the
// app's "reps not results" principle in the content itself.
//
// Tiers are 1-indexed (1–5) everywhere in the app; this array is 0-indexed, so
// go through the helpers below. The hierarchy is UNIVERSAL — only the entry rung
// and pace are personalized (see startingTier + the tier controls).

export type LadderTier = {
  name: string;
  why: string;
  missions: string[];
};

export const LADDER: LadderTier[] = [
  {
    name: "Warm contact",
    why: "Tiny, low-stakes reps. This is where the fear starts to lose its grip.",
    missions: [
      "Make eye contact and smile at someone",
      "Say 'hi' or 'morning' to someone passing",
    ],
  },
  {
    name: "Low-stakes words",
    why: "A few words, near-zero stakes. Teaching your brain that talking is safe.",
    missions: [
      "Ask a stranger for the time or directions",
      "Ask someone a quick, easy question",
    ],
  },
  {
    name: "Genuine comment",
    why: "Small and specific, on purpose. This is how the fear unlearns.",
    missions: [
      "Give someone a genuine compliment",
      "Comment on something you can both see",
    ],
  },
  {
    name: "Real conversation",
    why: "Now you're connecting — longer, but you've built up to it.",
    missions: [
      "Start a 30-second conversation",
      "Ask a follow-up question and keep it going",
    ],
  },
  {
    name: "The ask",
    why: "The top rung. By now, this is just the natural next step.",
    missions: [
      "Ask for their name",
      "Ask to keep in touch — swap contacts or suggest continuing another time",
      "Have a full conversation, start to finish",
      "Open, connect, and make the ask — the complete approach",
    ],
  },
];

export const LADDER_MAX_TIER = 5;
export const LADDER_THRESHOLD = 3; // missions cleared to advance a tier

const clampTier = (t: number) =>
  Math.min(Math.max(Math.round(t) || 1, 1), LADDER_MAX_TIER);

export const ladderTierData = (tier: number): LadderTier =>
  LADDER[clampTier(tier) - 1];
export const tierName = (tier: number): string => ladderTierData(tier).name;
export const missionText = (tier: number, idx: number): string => {
  const t = ladderTierData(tier);
  const n = t.missions.length;
  return t.missions[(((idx % n) + n) % n)];
};

/**
 * Onboarding: entry rung from approach frequency + baseline anxiety.
 * never/rarely → 1, sometimes → 2, often → 3; very high baseline (≥8) drops one
 * rung gentler (min 1). Content stays universal — only the start is personalized.
 */
export const startingTier = (
  approachFreq?: string | null,
  baselineAnxiety?: number | null,
): number => {
  let tier = approachFreq === "often" ? 3 : approachFreq === "sometimes" ? 2 : 1;
  if ((baselineAnxiety ?? 0) >= 8) tier = Math.max(1, tier - 1);
  return tier;
};
