// The 7-Day Challenge — a self-paced exposure hierarchy, NOT pickup scripts.
// Every mission is a behavior the user *fully controls* (smile, ask, comment) —
// never an outcome that depends on the other person. This is the app's "reps not
// results" principle in the content itself.
//
// A "day" is a rung, not a calendar day: it advances only when the user completes
// that day's mission (logs a rep tagged to it) — never on a real-time tick. That
// gives challenge/completion psychology without daily-streak shame, which is off
// -brand for an anxiety app. Everyone starts Day 1; finishing Day 7 → free play.

export const CHALLENGE_LENGTH = 7;

export type ChallengeDay = {
  day: number;
  chapter: string;
  mission: string;
  why: string;
};

export const DAYS: ChallengeDay[] = [
  { day: 1, chapter: "Warm contact",     mission: "Make eye contact and smile at someone",                    why: "Tiny, low-stakes reps. This is where the fear starts to lose its grip." },
  { day: 2, chapter: "Warm contact",     mission: "Say 'hi' or 'morning' to someone passing",                 why: "Still low-stakes — teaching your body that this is safe." },
  { day: 3, chapter: "Low-stakes words", mission: "Ask a stranger for the time or directions",                why: "A few words, near-zero stakes. Talking to strangers is becoming normal." },
  { day: 4, chapter: "Genuine comment",  mission: "Give someone a genuine compliment",                        why: "Small and specific, on purpose. This is how the fear unlearns." },
  { day: 5, chapter: "Real conversation",mission: "Start a 30-second conversation",                           why: "Now you're connecting — longer, but you've built up to it." },
  { day: 6, chapter: "Real conversation",mission: "Ask a follow-up question and keep it going",               why: "Keeping it alive past the opener. This is the muscle now." },
  { day: 7, chapter: "The ask",          mission: "Open, connect, and make the ask — the complete approach",  why: "The whole thing. By now, this is just the natural next step." },
];

export const dayFor = (n: number): ChallengeDay =>
  DAYS[Math.min(Math.max(Math.round(n) || 1, 1), CHALLENGE_LENGTH) - 1];
