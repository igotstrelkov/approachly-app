"use node";

import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import webpush from "web-push";

/**
 * Sends the weekly reminder to everyone due right now. Invoked hourly by the
 * cron; `dueRecipients` handles the per-user local-time + goal + dedupe logic,
 * so this action just delivers and records/cleans up.
 */
type Recipient = {
  endpoint: string;
  p256dh: string;
  auth: string;
  userId: Id<"users">;
  weekKey: string;
  remaining: number;
};

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
    const reminded = new Map<Id<"users">, string>(); // userId -> weekKey

    for (const r of due) {
      const payload = JSON.stringify({
        title: "Approachly",
        body:
          r.remaining <= 1
            ? "One approach to hit this week's goal. Beat the freeze."
            : `${r.remaining} approaches from this week's goal. One rep at a time.`,
        url: "/",
      });
      try {
        await webpush.sendNotification(
          { endpoint: r.endpoint, keys: { p256dh: r.p256dh, auth: r.auth } },
          payload
        );
        reminded.set(r.userId, r.weekKey);
      } catch (e) {
        const code = (e as { statusCode?: number })?.statusCode;
        if (code === 404 || code === 410) {
          await ctx.runMutation(internal.push.deleteByEndpoint, { endpoint: r.endpoint });
        } else {
          console.error("push send failed", code ?? e);
        }
      }
    }

    for (const [userId, weekKey] of reminded) {
      await ctx.runMutation(internal.push.markReminded, { userId, weekKey });
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
      title: "Approachly",
      body: "Test nudge — reminders are wired up. Beat the freeze.",
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
