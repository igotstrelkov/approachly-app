export type Mode = {
  n: number;
  name: string;
  emoji: string;
  color: string;
  blurb: string;
};
export const MODES: Mode[] = [
  {
    n: 1,
    name: "Logged",
    emoji: "✅",
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
export const modeFor = (n: number) => MODES[Math.min(Math.max(n, 1), 7) - 1];
