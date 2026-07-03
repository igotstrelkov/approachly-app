# Couragely — v1 (Lean MVP) · Design Brief

**Scope:** design **only the v1 solo loop** (6 screens, free, no community/Pro/second-act). Full system: `../Design Brief.md`.
**Read with:** `Product Spec.md` (in this folder) and `../Reference Images/` (10 concept mockups — **direction/mood only**, AI-generated: fuzzy text, imprecise, mono-color — make it real and refined).

---

## 0. What we're designing
A men's confidence app that beats *approach anxiety* through real-world reps. Men 18–30, iOS, **dark theme only.**

### Framing (non-negotiable, shapes every screen)
1. **Anxiety-first, never PUA.**
2. **No shame** — a freeze/no is neutral, **never red, never a failure state.**
3. **The count is private** — never a public flex.
4. **Courage is the surface, connection is the spine** — hype *with heart*; surface the "why" (the life he wants) at real moments.

### The spine (drives layout priority)
**Prime → Go → Debrief.** The **warm-up** (before) and the **debrief** (after) are the **hero surfaces**. **No in-app SOS** — the warm-up arms the user with the "3-2-1, just go" rule + their opener; in the moment, phone away. Missions are **context-fitted** to the user's real life, with a "doesn't fit — swap."

---

## 1. Design system
**Color** (introduce tonal range — *don't* make every screen all black+orange; use Ember/Go + elevation):
Ink `#0B0B0D` (bg) · Charcoal `#16161A` (surface) · Slate `#24252B` (surface-2) · **Flare `#FF5A36`** (primary) · Ember `#FFB23E` (milestones) · Go `#34D17E` (wins) · Amber `#E0A030` ("froze", calm) · Bone `#F4F3F0` (text) · Ash `#9A9CA3` (muted). Signal Red destructive-only — **never a user result.**

**Type:** Anton / Archivo Black for headlines + hero numbers only; **Inter sentence-case** for all body (no all-caps paragraphs); Space Mono for stats.

**Layout:** 8pt grid, 16–20px radii, 1px Slate card borders, 44px min targets, safe areas. **Rebalance the Home screen** into a clean top→bottom flow (not a giant number → gap → floating SOS).

**Motion:** counter count-up + haptic · streak flame grows · milestone unlock (Ember pop) · SOS 3·2·1 ring · **post-freeze reset = calm, never punishing.** 180–320ms.

---

## 2. Components (v1 subset, with states)
- Buttons: Primary (Flare/dark text), Secondary (Slate outline), Text.
- **Counter module** (giant number + label).
- **Streak chip** (flame + days) + **streak-freeze / at-risk** states.
- **Level / XP bar** — current rank (fire-themed: Spark → Ignition → … → Bold) + progress bar with "XP to next"; use **Ember→Flare** for the fill, not just flat orange.
- **Rep-logged reward** — celebratory beat after Debrief: flame + rank + big **"+XP · courage banked"** + "Rep logged. Showing up is the whole win." + Share/Continue. Flare-forward, jubilant but not garish; **level-up** is a bigger variant (rank changes).
- **Stat card** (label + mono value), rows of 3.
- **Mission card** (context-fitted task + "I did it / I froze" + "doesn't fit — swap").
- **Warm-up flow** (why · mission · breath · **the 3-2-1 rule + your opener**) — a hero surface; the app's in-the-moment help lives here, not in a mid-approach screen.
- **Debrief control** — **Win (Go) / No, still a rep (neutral) / I froze (Amber — never red)** + anxiety slider + note; **post-freeze micro-recovery** prompt.
- **Anxiety chart** (line, Flare, "down is good", milestone dots).
- **Milestone badge** (hexagon; Ember earned / Slate locked).
- Inputs / slider / toggle.
- Icon set — single line style, ~1.75–2px stroke, forward-arrow motif.

*(Not in v1: field-report/cohort rows, coach/debrief-insight cards, paywall cards, share cards, widget/Lock-Screen — those are v1.1+.)*

---

## 3. Screens to deliver (v1) + states
1. **Onboarding → Starting-Point reveal** (why + contexts + freeze profile → ladder; first-session micro-win)
2. **Home** (counter · streak · today's mission · warm-up entry — **rebalanced**)
3. **Daily warm-up** (why · mission · breath · **the 3-2-1 rule + your opener**)
4. **Today's Mission** (context-fitted, "swap")
5. **Debrief** (Win / No / Froze + slider + note → micro-recovery → **rep-logged reward: +XP · rank**)
6. **Progress** (anxiety-down chart · milestones · **level / XP**)

**States:** empty / Day-0 · logged-"froze" → micro-recovery · **rep-logged reward (+XP, rank)** · **level-up** · streak-at-risk / freeze · milestone-unlock.

---

## 4. Deliverables
Design tokens, the v1 component library with states, the 7 screens + states, and a **clickable prototype of the core loop** (warm-up → mission → debrief → home updates). Accessibility: WCAG AA, Dynamic Type, 44px targets. Dark theme only.

## 5. Anti-goals
❌ Attractiveness ratings / PUA framing · ❌ red for a user's result · ❌ public approach-count · ❌ AI roleplay surfaces · ❌ conquest framing · ❌ all-caps body / single-color screens · ❌ treating the mockups as pixel-accurate truth.
