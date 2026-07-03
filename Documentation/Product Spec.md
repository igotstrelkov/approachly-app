# COURAGELY — v1 (Lean MVP) · Product Spec

> **Scope:** the smallest build that tests the one thing that matters. **Free-only. Solo loop.** No community, no Pro, no paywall, no second act. (Full roadmap: `../Product Spec.md`.)
> **The one question v1 answers:** *Can an app get an anxious man to actually approach in real life — and come back?*
> **Audience:** Men 18–30, strictly 18+. **Platform:** iOS, dark theme. **Updated:** 2026-07-01.

---

## 1. Thesis (why this works)
Anxiety is beaten by **graded exposure** — reps. The reframe the whole app serves:
> **The rep is the win, not the result. You approached = you won. The only failure is the freeze** — the *behavioral enemy* you're training away, **not** a punishment (see §5, Streak rules).

## 2. Non-negotiables
- **Anxiety-first, never PUA** — no rating, objectifying, or manipulation.
- **No shame, ever** — a freeze/no is neutral, **never red, never a failure state.**
- **The count is private motivation** — never a public flex.
- **Courage is the surface, connection is the spine** — hype *with heart*; the "why" is the life & relationship he actually wants.

## 3. The spine — Prime → Go → Debrief
The **warm-up** (before you go out) and the **debrief** (after: log → reframe → one lesson) are the **hero surfaces**. **There is no in-app SOS** — you carry the *"3-2-1, just go"* rule and your go-to opener out of the warm-up; in the moment, phone away. A **timed push** is the only nudge. *(The app deliberately gets out of your way when you're in front of her — no rival does that.)*

## 4. Core loop (v1)
**Onboard (your *why* + real-life contexts + one first-session micro-win) → daily warm-up (primes you + arms you with the 3-2-1 rule + your opener) → go take the rep IRL (phone away) → debrief (Win / No / Froze → one lesson + reframe; Froze → micro-recovery) → counter + streak climb → progress.** Free. Solo.

## 5. Feature set — build ONLY these
| Feature | What it does |
|---|---|
| **Onboarding + Starting-Point reveal** | Your *why*, where/how often you freeze, and **your real-life contexts** (commute, gym, coffee, campus, work, nightlife) → a **fixed** personalized ladder + reassuring reveal. Ends with a **first-session micro-win** (one tiny real rep on day one). |
| **The Counter** | Lifetime reps taken. Private motivation — **never public.** |
| **Streak (life-friendly)** | Days you did a rep. See **Streak rules** below. |
| **XP & levels** | Every logged rep earns **XP** — a base amount, **more for a harder rep, your first of the day, or a streak bonus**. XP fills a bar toward the next **level**, each a fire-themed **rank** (Spark → **Ignition** → … → Bold). Home shows current level + "XP to next"; **every rep ends on a reward beat** (below). Progression that compounds *beyond* the streak — reps move you forward even on a "no" or a froze. **Never a public/comparative leaderboard** — it's your own climb. |
| **Rep-logged reward** | The beat right after Debrief: a short celebratory screen — flame, your rank, **"+XP · courage banked"**, and **"Rep logged. Showing up is the whole win."** Rewards the *behavior* (the rep), never the outcome. |
| **Today's Mission** | One graded rep from your ladder, **fitted to where you are today** ("on your coffee run…"), with **"doesn't fit — swap."** Ladder is **fixed** (no adaptive ML in v1). |
| **Daily warm-up (prime)** | A 2-min pre-going-out ritual — your *why*, today's mission, a breath, **the "3-2-1, just go" rule, and your go-to opener** — so you carry them into the moment. **This is the app's in-the-moment help:** it arms you *before*, so you never need a screen when you're standing in front of her. |
| **Debrief (log + reframe)** | Win / No / **Froze** + anxiety slider + one-line note → one lesson + reframe. **Froze → post-freeze micro-recovery** (prompt the easiest rep so you never end on avoidance). |
| **Progress** | Anxiety-down chart, reps climbing, milestones — the visible transformation. |
| **Push notifications** | Timed nudges (do-your-rep, streak-save, hype). The v1 in-the-moment mechanism. |

### Streak rules (explicit — so it isn't built the punishing way)
- The streak counts **days you did a rep** (any rep, **including the micro-recovery one**).
- **A freeze never breaks the streak on its own.** It opens a **micro-recovery** rep; doing any rep (even eye contact) **keeps the day.**
- Only a **full day with zero reps** consumes a **streak-freeze**; when freezes run out, it's a **no-shame recovery** ("pick up where you left off") — never a punishing zero.
- Optional **"X per week"** goal for guys who can't go daily.

## 6. Screens (v1)
1. **Onboarding → Starting-Point reveal** (why + contexts + freeze profile → ladder; first-session micro-win)
2. **Home** — counter · streak · today's mission · warm-up entry *(clean top→bottom flow)*
3. **Daily warm-up** — why · mission · breath · **the 3-2-1 rule + your opener**
4. **Today's Mission** — context-fitted + "swap"
5. **Debrief** — Win / No / Froze + slider + note → micro-recovery → **rep-logged reward** (+XP · rank)
6. **Progress** — anxiety-down chart · milestones · **level / XP**

*(6 screens — no SOS screen; the warm-up carries the in-the-moment help. The rep-logged reward is a celebratory state at the end of the Debrief flow, not a 7th tab.)*

**States:** empty / Day-0 · logged-"froze" → micro-recovery · **rep-logged reward (+XP, rank)** · **level-up** · streak-at-risk / freeze · milestone-unlock.

## 7. Explicitly deferred (NOT in v1)
Community / cohort · Pro (Debrief coach, insights, adaptive plan) · **paywall (v1 is free)** · share cards · outcome logging · adaptive-difficulty ML · the **Second Act**. *(The Approach-SOS feature is **cut entirely**, not deferred — its value lives in the warm-up.)* *(All specified in the full roadmap docs one level up.)*

## 8. Safety
18+ gate · **not medical advice** (signpost real support for severe social anxiety) · **consent-positive** ("a no is a complete win — respect it and move on") · **privacy-first** (encrypted, easy delete).

## 9. Platform & tech (v1)
Native iOS, dark only. **Push is the core retention/in-the-moment infra.** No backend-heavy features in v1 (no community, no LLM) — local-first with light sync for the streak/logs. Analytics: **D1/D7/D30 retention, reps logged, warm-up + debrief completion.**

## 10. What v1 must prove
1. **Retention** — do men keep the reps loop going (D7/D30)?
2. **Real behavior** — are *reps actually logged* (not just app-opens)?

*Riskiest assumption: can an app bridge to the real-world moment?* **Success signal:** a meaningful share of users log **≥1 real rep in week 1** and **return in week 2+.** If that holds, layer v1.1 (community + Pro). If not, the concept — not the features — needs rethinking.

## 11. Anti-goals
No attractiveness ratings / PUA framing · no red for a user's result · **no public approach-count flex** · **no AI roleplay** · no conquest framing · no all-caps body copy / relentlessly single-color UI.
