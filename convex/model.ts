// Pure game + date logic shared by Convex functions (no Convex imports).
// A client-facing mirror lives in src/lib/game.ts for UI display. Keep them in sync.

// ---------- XP (PRD §7: courage-weighted, hidden math) ----------
export const XP_BASE = 60;
export const XP_PER_ANXIETY = 12;

/** 60 + anxiety×12 → 72 (calm) .. 180 (terrified). ~2.5× spread. */
export function xpForRep(anxietyBefore: number): number {
  const a = clampAnxiety(anxietyBefore);
  return XP_BASE + a * XP_PER_ANXIETY;
}

export function clampAnxiety(a: number): number {
  return Math.max(1, Math.min(10, Math.round(a)));
}

// ---------- Daily modes (reset each day; green → heat → violet) ----------
export const MODES = [
  { tier: 1, key: "logged", label: "Logged", emoji: "✅" },
  { tier: 2, key: "lockedin", label: "Locked In", emoji: "💪" },
  { tier: 3, key: "dialed", label: "Dialed", emoji: "⚡" },
  { tier: 4, key: "beast", label: "Beast Mode", emoji: "🦍" },
  { tier: 5, key: "cracked", label: "Cracked", emoji: "🚀" },
  { tier: 6, key: "him", label: "Him", emoji: "👑" },
  { tier: 7, key: "finalboss", label: "Final Boss", emoji: "🔥" },
] as const;

export type Mode = (typeof MODES)[number];

/** repsToday is 1-based (the rep being logged). 7+ all read as Final Boss. */
export function modeForCount(repsToday: number): Mode {
  const idx = Math.max(1, Math.min(MODES.length, repsToday));
  return MODES[idx - 1];
}

// ---------- Permanent levels + ranks (cumulative XP) ----------
/** Cumulative XP required to *reach* `level` (design curve: 75·L·(L-1)). */
export function xpForLevel(level: number): number {
  return 75 * level * (level - 1);
}

const PRESTIGE_START = 20; // level where "Legend" begins
const PRESTIGE_BAND = 5; // levels per Legend numeral

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

export function rankForLevel(level: number): string {
  if (level >= PRESTIGE_START) {
    const prestige = Math.floor((level - PRESTIGE_START) / PRESTIGE_BAND) + 1; // Legend I at L20
    return `Legend ${toRoman(prestige)}`;
  }
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

export function levelFromXp(totalXp: number): LevelInfo {
  const xp = Math.max(0, Math.floor(totalXp));
  let level = 1;
  while (level < 1000 && xpForLevel(level + 1) <= xp) level += 1;
  const base = xpForLevel(level);
  const next = xpForLevel(level + 1);
  return {
    level,
    rank: rankForLevel(level),
    xpIntoLevel: xp - base,
    xpForThisLevel: next - base,
    xpToNext: next - xp,
  };
}

// ---------- Date keys (4am local rollover; PRD §8) ----------
export function localDayKey(
  ts: number,
  timezone: string,
  rolloverHour: number,
): string {
  const shifted = ts - rolloverHour * 3600 * 1000;
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone || "UTC",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return fmt.format(new Date(shifted)); // YYYY-MM-DD
}

/** ISO week key "YYYY-Www" derived from a local day key. */
export function isoWeekKey(dayKey: string): string {
  const [y, m, d] = dayKey.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  const dow = (date.getUTCDay() + 6) % 7; // Mon=0
  date.setUTCDate(date.getUTCDate() - dow + 3); // to the Thursday of this week
  const firstThursday = new Date(Date.UTC(date.getUTCFullYear(), 0, 4));
  const week =
    1 +
    Math.round(
      (date.getTime() - firstThursday.getTime()) / 86400000 / 7 -
        ((firstThursday.getUTCDay() + 6) % 7) / 7,
    );
  return `${date.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

/**
 * Weeks since the Unix epoch for an ISO week key — a true monotonic count, so
 * consecutive ISO weeks always differ by exactly 1, including across year
 * boundaries (used for streak-consecutiveness math). Only differences are used,
 * so nothing stores this value; changing the formula needs no migration.
 */
export function weekOrdinal(weekKey: string): number {
  const [y, w] = weekKey.split("-W").map(Number);
  const WEEK_MS = 7 * 86400000;
  // ISO week 1 is the week containing Jan 4; anchor to that week's Monday (UTC).
  const jan4 = Date.UTC(y, 0, 4);
  const jan4Dow = (new Date(jan4).getUTCDay() + 6) % 7; // Mon=0 … Sun=6
  const week1Monday = jan4 - jan4Dow * 86400000;
  const monday = week1Monday + (w - 1) * WEEK_MS;
  return Math.round(monday / WEEK_MS);
}
