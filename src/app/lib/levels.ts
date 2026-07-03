// ---------- level / rank logic (mirrors the design) ----------
export const levelForXp = (xp: number) => {
  let L = 1;
  while (75 * (L + 1) * L <= xp) L++;
  return L;
};
export const xpForLevel = (L: number) => 75 * L * (L - 1);
export const PRESTIGE_START = 20;
export const PRESTIGE_BAND = 5;
export function toRoman(n: number): string {
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
export const rankForLevel = (L: number) =>
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
export const baseRankForLevel = (L: number) =>
  L >= 20
    ? "Legend"
    : L >= 15
      ? "Ironclad"
      : L >= 10
        ? "Fearless"
        : L >= 5
          ? "Bold"
          : "Rookie";
export const RANK_LADDER = [
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
