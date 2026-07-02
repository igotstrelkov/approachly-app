// Client-facing mirror of convex/model.ts for UI display (labels, colors, ranks).
// XP math is intentionally NOT surfaced to the user (PRD §7: hidden math) — the
// server returns the single +XP; the client only renders it.

export const MODES = [
  { tier: 1, key: "warmup", label: "Warm-up", emoji: "🔥", color: "var(--color-mode-warmup)" },
  { tier: 2, key: "lockedin", label: "Locked In", emoji: "💪", color: "var(--color-mode-lockedin)" },
  { tier: 3, key: "dialed", label: "Dialed", emoji: "⚡", color: "var(--color-mode-dialed)" },
  { tier: 4, key: "beast", label: "Beast Mode", emoji: "🦍", color: "var(--color-mode-beast)" },
  { tier: 5, key: "cracked", label: "Cracked", emoji: "🚀", color: "var(--color-mode-cracked)" },
  { tier: 6, key: "him", label: "Him", emoji: "👑", color: "var(--color-mode-him)" },
  { tier: 7, key: "finalboss", label: "Final Boss", emoji: "🌌", color: "var(--color-mode-finalboss)" },
] as const;

export type Mode = (typeof MODES)[number];

export function modeForTier(tier: number): Mode {
  const idx = Math.max(1, Math.min(MODES.length, tier));
  return MODES[idx - 1];
}

export const RANKS = ["Rookie", "Bold", "Fearless", "Ironclad", "Legend"] as const;
export type Rank = (typeof RANKS)[number];

export function rankForLevel(level: number): Rank {
  if (level >= 20) return "Legend";
  if (level >= 15) return "Ironclad";
  if (level >= 10) return "Fearless";
  if (level >= 5) return "Bold";
  return "Rookie";
}

export interface LevelInfo {
  level: number;
  rank: string;
  xpIntoLevel: number;
  xpForThisLevel: number;
  xpToNext: number;
}

/** Progress within the current level, 0..1 — for the XP bar fill. */
export function levelProgress(info: LevelInfo): number {
  if (!info.xpForThisLevel) return 0;
  return Math.max(0, Math.min(1, info.xpIntoLevel / info.xpForThisLevel));
}
