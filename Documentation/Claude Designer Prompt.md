# Handoff prompt for Claude (designer / builder) — v1 (Lean MVP)

**How to use:** paste the block below into Claude.
- **Claude Code** (has this folder): it'll read the v1 docs itself.
- **Claude app** (no file access): it's self-contained — and if you can, **attach the 10 images from `../Reference Images/`** (tell it "mood/direction only — the text is fuzzy AI output, refine it").

---

You are a **senior product designer + front-end engineer**. Design (and, if asked, build) the UI for **Couragely v1**, the lean MVP of a men's confidence app that beats *approach anxiety* through real-world reps. **v1 is the free, solo loop only — 6 screens.** I want a cohesive, production-intent design system, not concept art.

**If you can, read (in this v1 folder):** `Product Spec.md`, `Design Brief.md`, and `../Reference Images/` (10 concept mockups — **DIRECTION/MOOD ONLY**; AI-generated with fuzzy text, imprecise spacing, mono-color — make it real and refined, don't copy the artifacts).

**Product in one line:** Log a real-world approach (win, no, or *froze*), build a streak, watch your anxiety fall. "Couch-to-5K for social courage." Men 18–30. iOS, dark theme only.

**Non-negotiable framing:**
1. **Anxiety-first, never PUA** — no rating women, no manipulation, no scoreboard of conquests.
2. **No shame, ever** — a freeze/no is neutral; **never red, never a failure state.**
3. **The count is private motivation, not a public flex.**
4. **Courage is the surface, connection is the spine** — hype *with heart*; the "why" is the life & relationship he wants, surfaced at real moments. Never mocking or bro-for-its-own-sake.

**The spine (drives layout priority):** **Prime → Go → Debrief.** The **warm-up** (before you go out) and the **debrief** (after: log → reframe → one lesson) are the **hero surfaces**. **There is NO in-app SOS screen** — the warm-up arms the user with the "3-2-1, just go" rule + their go-to opener, so in the moment the phone stays away (the app deliberately gets out of the way in front of her). **Missions are context-fitted** to the user's real life (commute/gym/coffee/campus…) with a one-tap "doesn't fit — swap."

**Design system (use exactly):**
- **Color:** Ink `#0B0B0D` (bg) · Charcoal `#16161A` · Slate `#24252B` · **Flare `#FF5A36`** (primary) · Ember `#FFB23E` (milestones) · Go `#34D17E` (wins) · Amber `#E0A030` ("froze", calm) · Bone `#F4F3F0` (text) · Ash `#9A9CA3` (muted). Signal Red destructive-only, never a user result. **Introduce tonal range — don't make every screen all black+orange.**
- **Type:** Anton / Archivo Black for headlines + hero numbers only; **Inter sentence-case for all body**; Space Mono for stats.
- **Layout:** 8pt grid, 16–20px radii, 1px Slate borders, 44px targets, safe areas. **Rebalance the Home screen** into a clean top→bottom flow.

**Component library (v1 subset, with states):** primary/secondary/text buttons; counter module; streak chip + **streak-freeze/at-risk** states; **level/XP bar** (fire-themed rank Spark → Ignition → … → Bold + "XP to next", Ember→Flare fill); stat card; **mission card** (context-fitted + "swap"); **warm-up flow** (why · mission · breath · **the 3-2-1 rule + your opener** — the in-the-moment help lives here); **Debrief control** — Win (Go) / No-still-a-rep (neutral) / Froze (Amber, *never red*) + slider + note + **post-freeze micro-recovery** prompt; **rep-logged reward** (flame + rank + "+XP · courage banked" + "Rep logged. Showing up is the whole win." + Share/Continue; **level-up** variant when the rank changes); anxiety "down-is-good" chart; milestone hexagon (Ember/Slate); inputs/slider/toggle; line-icon set (~2px, forward-arrow motif).

**v1 screens (the only 6 — refined from the Reference Images):**
1. Onboarding → Starting-Point reveal (why + contexts + freeze profile; first-session micro-win)
2. Home — counter · streak · **level/XP** · today's mission · warm-up entry *(rebalanced)*
3. Daily warm-up — why · mission · breath · **the 3-2-1 rule + your opener**
4. Today's Mission — context-fitted + "swap"
5. Debrief — Win / No / Froze + slider + note → micro-recovery → **rep-logged reward (+XP · rank)**
6. Progress — anxiety-down chart · milestones · **level/XP**
**States:** empty/Day-0 · logged-"froze" → micro-recovery · **rep-logged reward (+XP, rank)** · **level-up** · streak-at-risk/freeze · milestone-unlock.

**Streak rule to reflect in the UI:** a freeze **never** breaks the streak on its own — it opens a micro-recovery rep; doing any rep keeps the day. Design the streak-at-risk/freeze state as calm and forgiving, never punishing.

**Out of scope for v1 (do NOT design):** community/cohort, Pro coach/insights, paywall, share cards, widget/Lock-Screen SOS, outcome logging, the Second Act.

**Deliverables:** design tokens, the v1 component library with states, the 7 screens + states, and a clickable core-loop prototype (warm-up → mission → debrief → home). WCAG AA, Dynamic Type, generous targets. If a quick prototype (Claude app): a single **React + Tailwind** iPhone-framed, dark, tap-through artifact using Google Fonts (Anton / Inter / Space Mono).

**Anti-goals:** no attractiveness ratings / PUA framing; no red for a user's result; no public approach-count flex; **XP/levels are private progression, never a comparative leaderboard**; no AI roleplay; no conquest framing; no all-caps body or single-color screens; don't treat the mockups as pixel-accurate truth.

Start by confirming your understanding and proposing the **design tokens + 2 hero screens (Home, Debrief)** for my sign-off before building the rest.
