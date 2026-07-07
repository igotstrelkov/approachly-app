<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Couragely — project guide

Couragely is a men's approach-anxiety PWA: a daily "rep" tracker that turns walking up and saying hi into a low-shame habit. **Governing principle: reps not results — showing up is the win, don't chase numbers.** Anti-PUA, anxiety-first, respectful; "a 'no' is a complete win." This thesis drives copy and UX decisions — e.g. never render a metric as a scoreboard to maximize (no arrows / accents / "& climbing" on vanity totals), and validate the *act*, not the count.

## Stack
- **Next.js 16.2** (App Router, Turbopack) — see the warning above; read `node_modules/next/dist/docs/` before framework work.
- **React 19**, **TypeScript 5**, **ESLint 9** (`eslint-config-next`).
- **Tailwind v4** is installed, but the app UI is **inline-styled with CSS custom properties**, not Tailwind classes (see Styling).
- **Convex** backend (see Convex section), **Clerk** auth (`@clerk/nextjs`), **web-push** (daily/weekly reminders), **react-confetti** (reward celebration), **sharp** (icon generation).

## Run & verify
- **Dev server:** `next dev -p 3200` — the app expects **:3200** (the `dev` script is bare `next dev`, which defaults to 3000; pass `-p 3200`). The environment tends to kill background servers, so restart as needed.
- **Typecheck gate:** `npx tsc --noEmit` must report **0 errors** before a change is done. This is the primary safety net.
- **Lint:** `npx eslint <path>` — `no-unused-vars` is on, so **remove an import when you delete its last use** (e.g. dropping `hexA` after removing the element that used it).
- **Build:** `npm run build`.
- Automated browser click-throughs are unreliable here and analytics suppresses `navigator.webdriver` traffic — **auth-gated screens need real manual QA on :3200.**

## Architecture — one feature, split across files
`src/app/ApproachlyApp.tsx` is the root client component but only a **thin ~135-line wrapper**. Know where things live:

- **`useAppState.tsx`** — ALL logic: every `useState`/`useQuery`/`useMutation`/Clerk hook, all derived values and handlers. Returns one big object. Exports `type Plan`. **Change state or a handler here.**
- **`AppContext.tsx`** — `AppProvider` + `useApp()`. Its type is `ReturnType<typeof useAppState>` (fully inferred — do NOT hand-maintain an interface). **To expose a new value to screens, add it to `useAppState`'s `return`.**
- **`ApproachlyApp.tsx`** — calls `useAppState`, wraps the render in `<AppProvider>`, renders the boot-splash guard + shared chrome (root div, toast) + the 8 guarded screens (`{screen === "home" && <HomeScreen />}` …).
- **`screens/*Screen.tsx`** — the 8 screens: `Home`, `Hype`, `Log`, `Reward`, `You`, `Quiz`, `Ranks`, `Landing`. Each is `"use client"` and reads what it needs via `const { … } = useApp();`. **Edit a screen here.**
- Shared, stateless modules:
  - **`theme.ts`** — `DISPLAY`/`MONO` fonts, `GO_GRAD`, `iconBtn`, `eyebrow(color)`.
  - **`types.ts`** — `Screen`, `Vibe`, and the onboarding `STEP_ORDER` / `STEP` map.
  - **`lib/levels.ts`** (XP/rank math), **`lib/modes.ts`** (daily mode tiers — the Reward reveal; the Home mode badge is gated until `activeDays >= 3`), **`lib/chart.ts`** (`buildChart`, `monotonePath`, `hexA` — the reward celebration uses **`react-confetti`**, not a hand-rolled system).
  - **`components/AnxRow.tsx`** — the 1–10 anxiety picker.
- Other app files: `layout.tsx`, `ConvexClientProvider.tsx`, `MetaPixel.tsx`, `Plausible.tsx`, `PwaRegister.tsx`, `manifest.ts`, `opengraph-image.tsx`, `privacy/`.

Auth: **landing** + **quiz** are the signed-out front door; `home/log/reward/you/ranks/hype` require a Clerk session. Boot routes onboarded → home, else → landing (in `useAppState`). A signed-out user on an authed screen is routed back to landing.

## Styling — match, don't invent
Inline `style={{…}}` + CSS custom properties from `globals.css`. **No component library. When changing UI, reuse existing tokens/patterns — do not introduce a new design system.**

Tokens (`globals.css`):
- Surfaces: `--ink` (#0b0b0d page bg), `--charcoal` (cards), `--slate` (borders/muted fills), `--slateHi`.
- Accents: `--go` (#34d17e — the primary green, "go / win"), `--ember`/`--amber` (orange — streak & journey/XP), `--flare` (#ff5a36), `--danger`, `--cool`.
- Text: `--bone` (primary), `--ash` (muted), `--ashDim` (faint).
- Fonts (via `theme.ts`): `DISPLAY` = Anton (uppercase display), `MONO` = Space Mono (stats/labels).

Conventions worth matching:
- Section labels: `eyebrow(color)`.
- **Stat numbers render MONO + `--bone`** (see `RewardScreen`); reserve `--go` for the one live/actionable metric (weekly-goal progress) and for wins.
- **Green ✓ = a win** ("Goal hit ✓") — keep checkmarks green for consistency.
- Cards: `background: var(--charcoal); border: 1px solid var(--slate); border-radius: 14–20; padding`.
- Hierarchy matters: the weekly (actionable) block leads, lifetime totals recede (muted `--ash`), status strips read quiet so they don't compete with CTA cards.

## Onboarding quiz
Data-driven: `STEP_ORDER` (ordered array of step keys) → `STEP` name→index map, both in `types.ts`. Render blocks + helpers key off `STEP.<name>`. **To add/reorder a step: edit the array + add a `{quizStep === STEP.<name> && …}` block in `QuizScreen.tsx` — no hand-renumbering.** Per-step analytics fire `OnboardingStep {step, name}` on each advance.

## Analytics
`lib/analytics.ts` exposes `track` / `trackCustom`, fanning out to **Meta Pixel + Plausible**. Headless / `navigator.webdriver` traffic is suppressed. Key events: `OnboardingStarted`, `OnboardingStep`, `CompleteRegistration` (fired on completed sign-up — the ad-optimization conversion event).

## Convex — project specifics
(See the auto-managed Convex block below for the general rule: **read `convex/_generated/ai/guidelines.md` first**.)
- Functions: `convex/{users,approaches,feedback,push,pushActions,crons,model,schema,auth.config}.ts`.
- Data model (`schema.ts`): `users` (denormalized counters, keyed by Clerk `tokenIdentifier`), `approaches`, `pushSubscriptions`, `feedback`. Reads avoid unbounded history scans — counters live on the user doc (e.g. `activeDays`, which gates the Home mode badge).
- **Reminder cadence** (highest-volume surface pre-ad-launch): `crons.ts` runs hourly → `pushActions.sendDueReminders` → `push.dueRecipients` picks who's due (user's local hour, daily/weekly, dedupe, skip-if-already-logged). Anti-nag guardrails: a **taper** (an unanswered invite quiets to weekly, then dormant; a logged rep re-arms it), a **48h cooldown after a rough rep**, and invitational copy in `pushActions.ts`. Never streak-guilt or absence-shame.
- **Mutations validate args (`v.optional(...)`) and REJECT unknown args.** A new field must be added to BOTH `schema.ts` AND the mutation's args — and pushed — in lockstep with the frontend, or live writes/sign-ups break.
- Push to dev deployment: `npx convex dev --once`. Deploy to prod: `npx convex deploy`. **Frontend + Convex must ship together** whenever args/schema change.

## Before a prod deploy / ad launch
1. `npx tsc --noEmit` = 0 and `npx eslint` clean.
2. Manually QA all 8 screens on :3200 (auth-gated screens need a real session + some logged reps; headless automation won't cover them).
3. Deploy Vercel (frontend) **and** `npx convex deploy` (backend) together.
4. Verify `CompleteRegistration` fires on the live URL before spending on ads.

<!-- convex-ai-start -->

This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read
`convex/_generated/ai/guidelines.md` first** for important guidelines on
how to correctly use Convex APIs and patterns. The file contains rules that
override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running
`npx convex ai-files install`.

<!-- convex-ai-end -->
