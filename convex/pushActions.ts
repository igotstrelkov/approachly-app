"use node";

import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import webpush from "web-push";

/**
 * Sends daily/weekly reminders to everyone due right now. Invoked hourly by the
 * cron; `dueRecipients` handles the per-user local-time + freq + skip-if-done +
 * dedupe logic, so this action just delivers and records/cleans up.
 */
type Recipient = {
  endpoint: string;
  p256dh: string;
  auth: string;
  userId: Id<"users">;
  mode: "daily" | "weekly";
  dayKey: string;
  weekKey: string;
  remaining: number;
};

// Daily lines — invitational, never obligational. Validate the act, never shame
// a miss, never a quota. Rotated by day so it doesn't go stale. (See the
// notification voice guidelines: one small, safe hello; showing up is the win.)
const DAILY_LINES = [
  "One hello out there today. However it goes, that's the win.",
  "See someone today? A simple hi is a full rep.",
  "No pressure — just one small hello today if the moment's there.",
  "Your fear falls one rep at a time. Today's a chance for one.",
  "Say hi to one person today. That's the whole thing.",
  "Ready when you are — one rep, whenever it feels right.",
  "A single hello today keeps things moving. Win or awkward, it counts.",
  "If you catch a moment today, walk over and say hi. One's plenty.",
  "Today's rep is just showing up. Nothing to prove.",
];
// Stable per-key rotation: same day/week → same line, but varied across keys.
function hashKey(key: string) {
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) | 0;
  return Math.abs(h);
}
function dailyLine(key: string) {
  return DAILY_LINES[hashKey(key) % DAILY_LINES.length];
}

// Weekly lines — same invitational voice, split by how close the week is (one
// more vs a couple). Never a quota; `remaining` only nudges singular vs plural
// tone. Rotated by week so it stays fresh.
const WEEKLY_CLOSE = [
  "One hello this week keeps your line moving. Whenever you're ready.",
  "Just one rep this week — no rush on the day.",
  "A single hello this week and you're rolling. On your time.",
  "One more moment out there this week, whenever it feels right.",
];
const WEEKLY_SOME = [
  "A rep or two this week keeps things going. One at a time, no pressure.",
  "A couple of hellos this week, whenever they come. No rush.",
  "Nothing to prove this week — just a rep or two when the moment's there.",
  "A few small hellos this week keep the fear falling. On your terms.",
];
function weeklyLine(key: string, remaining: number) {
  const pool = remaining <= 1 ? WEEKLY_CLOSE : WEEKLY_SOME;
  return pool[hashKey(key) % pool.length];
}

export const sendDueReminders = internalAction({
  args: {},
  handler: async (ctx): Promise<{ attempted: number; sent: number }> => {
    const pub = process.env.VAPID_PUBLIC_KEY;
    const priv = process.env.VAPID_PRIVATE_KEY;
    const subj = process.env.VAPID_SUBJECT;
    if (!pub || !priv || !subj) {
      console.error("VAPID env vars missing — skipping reminders");
      return { attempted: 0, sent: 0 };
    }
    webpush.setVapidDetails(subj, pub, priv);

    const now = Date.now();
    const due: Recipient[] = await ctx.runQuery(internal.push.dueRecipients, { now });
    const reminded = new Map<
      Id<"users">,
      { mode: "daily" | "weekly"; dayKey: string; weekKey: string }
    >();

    for (const r of due) {
      const body =
        r.mode === "weekly"
          ? weeklyLine(r.weekKey, r.remaining)
          : dailyLine(r.dayKey);
      const payload = JSON.stringify({ title: "Couragely", body, url: "/" });
      try {
        await webpush.sendNotification(
          { endpoint: r.endpoint, keys: { p256dh: r.p256dh, auth: r.auth } },
          payload
        );
        reminded.set(r.userId, {
          mode: r.mode,
          dayKey: r.dayKey,
          weekKey: r.weekKey,
        });
      } catch (e) {
        const code = (e as { statusCode?: number })?.statusCode;
        if (code === 404 || code === 410) {
          await ctx.runMutation(internal.push.deleteByEndpoint, { endpoint: r.endpoint });
        } else {
          console.error("push send failed", code ?? e);
        }
      }
    }

    for (const [userId, k] of reminded) {
      await ctx.runMutation(internal.push.markReminded, {
        userId,
        mode: k.mode,
        dayKey: k.dayKey,
        weekKey: k.weekKey,
        now,
      });
    }
    return { attempted: due.length, sent: reminded.size };
  },
});

/** QA: send a test notification to every subscribed device now (ignores timing). */
export const sendTest = internalAction({
  args: {},
  handler: async (ctx): Promise<{ sent: number; failed: number }> => {
    const pub = process.env.VAPID_PUBLIC_KEY;
    const priv = process.env.VAPID_PRIVATE_KEY;
    const subj = process.env.VAPID_SUBJECT;
    if (!pub || !priv || !subj) return { sent: 0, failed: 0 };
    webpush.setVapidDetails(subj, pub, priv);
    const subs: { endpoint: string; p256dh: string; auth: string }[] =
      await ctx.runQuery(internal.push.allSubscriptions, {});
    let sent = 0, failed = 0;
    const payload = JSON.stringify({
      title: "Couragely",
      body: "Test nudge — reminders are wired up. One hello whenever you're ready.",
      url: "/",
    });
    for (const s of subs) {
      try {
        await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, payload);
        sent++;
      } catch (e) {
        const code = (e as { statusCode?: number })?.statusCode;
        if (code === 404 || code === 410) await ctx.runMutation(internal.push.deleteByEndpoint, { endpoint: s.endpoint });
        failed++;
      }
    }
    return { sent, failed };
  },
});
