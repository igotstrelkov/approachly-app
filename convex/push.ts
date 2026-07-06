import { mutation, query, internalQuery, internalMutation } from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { v } from "convex/values";
import { localDayKey, isoWeekKey } from "./model";

async function me(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not authenticated");
  const user = await ctx.db
    .query("users")
    .withIndex("by_token", (q) => q.eq("tokenId", identity.tokenIdentifier))
    .unique();
  if (!user) throw new Error("No user");
  return user;
}

/** Whether this signed-in user has any push subscription + their schedule. */
export const getStatus = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenId", identity.tokenIdentifier))
      .unique();
    if (!user) return null;
    const subs = await ctx.db
      .query("pushSubscriptions")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .take(20);
    return {
      subscribed: subs.length > 0,
      reminderFreq: user.reminderFreq ?? "daily",
      reminderDow: user.reminderDow ?? 0,
      reminderHour: user.reminderHour ?? 10,
    };
  },
});

/** Save/refresh this device's subscription (upsert by endpoint). */
export const saveSubscription = mutation({
  args: { endpoint: v.string(), p256dh: v.string(), auth: v.string() },
  handler: async (ctx, args) => {
    const user = await me(ctx);
    const existing = await ctx.db
      .query("pushSubscriptions")
      .withIndex("by_endpoint", (q) => q.eq("endpoint", args.endpoint))
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, { userId: user._id, p256dh: args.p256dh, auth: args.auth });
    } else {
      await ctx.db.insert("pushSubscriptions", {
        userId: user._id,
        endpoint: args.endpoint,
        p256dh: args.p256dh,
        auth: args.auth,
        createdAt: Date.now(),
      });
    }
  },
});

export const removeSubscription = mutation({
  args: { endpoint: v.string() },
  handler: async (ctx, { endpoint }) => {
    await me(ctx); // ensure authed
    const existing = await ctx.db
      .query("pushSubscriptions")
      .withIndex("by_endpoint", (q) => q.eq("endpoint", endpoint))
      .unique();
    if (existing) await ctx.db.delete(existing._id);
  },
});

/**
 * Turn reminders off for the whole account. Used by the "Off" tab: the browser
 * may have no local subscription to report an endpoint for (getSubscription →
 * null), so removing by-endpoint isn't reliable; this clears every row so
 * `getStatus.subscribed` deterministically flips to false.
 */
export const removeAllSubscriptions = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await me(ctx);
    const subs = await ctx.db
      .query("pushSubscriptions")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
    for (const s of subs) await ctx.db.delete(s._id);
  },
});

export const setReminderSchedule = mutation({
  args: { reminderDow: v.number(), reminderHour: v.number() },
  handler: async (ctx, args) => {
    const user = await me(ctx);
    await ctx.db.patch(user._id, {
      reminderDow: Math.max(0, Math.min(6, Math.round(args.reminderDow))),
      reminderHour: Math.max(0, Math.min(23, Math.round(args.reminderHour))),
    });
  },
});

export const setReminderFreq = mutation({
  args: { freq: v.union(v.literal("daily"), v.literal("weekly")) },
  handler: async (ctx, { freq }) => {
    const user = await me(ctx);
    await ctx.db.patch(user._id, { reminderFreq: freq });
  },
});

// ---- internal (cron) ----

const DOW: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
function localDowHour(ts: number, tz: string) {
  const d = new Date(ts);
  const wd = new Intl.DateTimeFormat("en-US", { timeZone: tz, weekday: "short" }).format(d);
  const hourStr = new Intl.DateTimeFormat("en-US", { timeZone: tz, hour: "2-digit", hourCycle: "h23" }).format(d);
  return { dow: DOW[wd] ?? 0, hour: parseInt(hourStr, 10) || 0 };
}

/** Subscriptions whose owner is due a nudge right now (cron runs hourly). */
export const dueRecipients = internalQuery({
  args: { now: v.number() },
  handler: async (ctx, { now }) => {
    const subs = await ctx.db.query("pushSubscriptions").take(2000);
    const out: Array<{
      endpoint: string; p256dh: string; auth: string;
      userId: Id<"users">;
      mode: "daily" | "weekly";
      dayKey: string; weekKey: string; remaining: number;
    }> = [];
    for (const sub of subs) {
      const user = await ctx.db.get(sub.userId);
      if (!user || !user.onboarded) continue;
      const tz = user.timezone || "UTC";
      const { dow, hour } = localDowHour(now, tz);
      if (hour !== (user.reminderHour ?? 10)) continue; // wrong local hour
      // Rough-patch cooldown: after a hard rep (went poorly / high nerves) we
      // back off for ~48h — never push "do more" onto a low moment.
      const ROUGH_COOLDOWN_MS = 48 * 60 * 60 * 1000;
      if (
        user.lastRepRough &&
        user.lastRepAt &&
        now - user.lastRepAt < ROUGH_COOLDOWN_MS
      )
        continue;
      const dayKey = localDayKey(now, tz, user.dayRolloverHour);
      const weekKey = isoWeekKey(dayKey);
      const freq = user.reminderFreq ?? "daily";
      if (freq === "weekly") {
        if (dow !== (user.reminderDow ?? 0)) continue; // wrong local day
        if (user.lastRemindedWeekKey === weekKey) continue; // already nudged this week
        const weekCount =
          user.currentWeekKey === weekKey ? user.repsThisWeek : 0;
        if (weekCount >= user.weeklyGoal) continue; // already hit goal — no nag
        out.push({
          endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth,
          userId: sub.userId, mode: "weekly", dayKey, weekKey,
          remaining: user.weeklyGoal - weekCount,
        });
      } else {
        // daily
        if (user.lastRemindedDayKey === dayKey) continue; // already nudged today
        const todayCount =
          user.currentDayKey === dayKey ? user.repsToday : 0;
        if (todayCount >= 1) continue; // already showed up today — no nag
        // Taper: an invite that goes quiet gets quieter. 0–2 unanswered nudges →
        // daily; 3–5 → ~weekly; 6+ → dormant (stop, no shame). Logging a rep
        // resets the counter and re-arms full cadence.
        const un = user.unansweredNudges ?? 0;
        const gapDays = un < 3 ? 0 : un < 6 ? 7 : Infinity;
        if (gapDays === Infinity) continue; // gone quiet — stop until they return
        if (
          gapDays > 0 &&
          user.lastNudgeAt &&
          now - user.lastNudgeAt < gapDays * 24 * 60 * 60 * 1000
        )
          continue;
        out.push({
          endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth,
          userId: sub.userId, mode: "daily", dayKey, weekKey, remaining: 0,
        });
      }
    }
    return out;
  },
});

/** All subscriptions (QA helper for the test-send action). */
export const allSubscriptions = internalQuery({
  args: {},
  handler: async (ctx) => {
    const subs = await ctx.db.query("pushSubscriptions").take(2000);
    return subs.map((s) => ({ endpoint: s.endpoint, p256dh: s.p256dh, auth: s.auth }));
  },
});

export const markReminded = internalMutation({
  args: {
    userId: v.id("users"),
    mode: v.union(v.literal("daily"), v.literal("weekly")),
    dayKey: v.string(),
    weekKey: v.string(),
    now: v.number(),
  },
  handler: async (ctx, { userId, mode, dayKey, weekKey, now }) => {
    const user = await ctx.db.get(userId);
    // Bump the unanswered-nudge counter (drives the taper) and stamp the send.
    // A logged rep resets the counter, so this only climbs while they're away.
    const unansweredNudges = (user?.unansweredNudges ?? 0) + 1;
    await ctx.db.patch(userId, {
      ...(mode === "daily"
        ? { lastRemindedDayKey: dayKey }
        : { lastRemindedWeekKey: weekKey }),
      unansweredNudges,
      lastNudgeAt: now,
    });
  },
});

export const deleteByEndpoint = internalMutation({
  args: { endpoint: v.string() },
  handler: async (ctx, { endpoint }) => {
    const existing = await ctx.db
      .query("pushSubscriptions")
      .withIndex("by_endpoint", (q) => q.eq("endpoint", endpoint))
      .unique();
    if (existing) await ctx.db.delete(existing._id);
  },
});
