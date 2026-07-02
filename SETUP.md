# Approachly — setup

Stack: **Next.js 16** (App Router, Turbopack, `src/proxy.ts`) · **React 19** · **Convex** · **Clerk** · **Tailwind v4** · installable **PWA**.

The app is the **green** courage trainer (see `../approachly/Documentation/PRD.md`). The orange marketing landing lives in the separate `approachly/` project.

## 1. Clerk (auth)
1. Create an app at https://dashboard.clerk.com.
2. Copy the API keys into `.env.local` (`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`).
3. **JWT template:** Clerk → JWT Templates → New → **Convex**. Name it exactly `convex`. Copy the **Issuer** URL.

## 2. Convex (data + scheduled push)
```bash
npx convex dev        # logs in, provisions a dev deployment, writes NEXT_PUBLIC_CONVEX_URL, generates convex/_generated
```
Then in the **Convex dashboard** → Settings → Environment Variables, add:
```
CLERK_JWT_ISSUER_DOMAIN = <the Clerk Issuer URL from step 1.3>
```
(`convex/auth.config.ts` reads this to trust Clerk-issued JWTs.)

> Until `npx convex dev` runs once, `convex/_generated/*` won't exist and editor imports (`./_generated/server`, `convex/_generated/api`) will show as missing — that's expected.

## 3. Run
```bash
npm run dev           # http://localhost:3000  (keep `npx convex dev` running in another tab)
```

## 4. PWA icons (before install/testing push)
Add to `public/icons/`: `icon-192.png`, `icon-512.png`, `maskable-512.png`, `badge-72.png`. Manifest at `src/app/manifest.ts`, service worker at `public/sw.js`.

## What's built already (backend)
- `convex/schema.ts` — users + approaches (PRD §13; no PII on people approached).
- `convex/model.ts` — XP (`60 + anxiety×12`), daily modes, permanent levels/ranks, 4am-rollover day/week keys.
- `convex/approaches.ts` — `logRep`, `undoLast`, `dashboard` (falling-line + week-vs-goal + streak), `recent`.
- `convex/users.ts` — `getMe`, `completeOnboarding`, `setWeeklyGoal`, `setReminderHour`.
- `src/app/layout.tsx` — Clerk + Convex providers, fonts (Anton/Inter/Space Mono), theme-color, PWA register.
- `src/lib/game.ts` — client mirror of modes/ranks for display.

## Next (once the Claude Design import arrives)
Screens per PRD §5–§11: Onboarding (age gate → quiz → sign-up → plan → install → first rep), Home (falling line), Hype, Log (two-tap + 1–10 row), Reward, Day-0. Then Convex scheduled weekly push.
