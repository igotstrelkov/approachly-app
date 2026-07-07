import { mutation, query } from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { v } from "convex/values";
import {
  xpForRep,
  clampAnxiety,
  levelFromXp,
  localDayKey,
  isoWeekKey,
  weekOrdinal,
} from "./model";

async function meOrThrow(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not authenticated");
  const user = await ctx.db
    .query("users")
    .withIndex("by_token", (q) => q.eq("tokenId", identity.tokenIdentifier))
    .unique();
  return user;
}

const TREND_POINTS = 60;

/**
 * Log a completed approach → award XP, escalate the daily mode, roll the
 * weekly-goal streak, update level (PRD §5–§7). Only completed approaches reach
 * here — there is no "froze"; if you didn't approach, there's nothing to log.
 * All progress is denormalized onto the user doc so reads never scan history.
 */
export const logRep = mutation({
  args: {
    vibe: v.union(v.literal("GREAT_SET"), v.literal("STILL_A_REP")),
    anxietyBefore: v.number(),
    gotNumber: v.boolean(),
    note: v.optional(v.string()),
    timezone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await meOrThrow(ctx);
    if (!user) throw new Error("Complete onboarding first");

    const now = Date.now();
    const tz = args.timezone || user.timezone || "UTC";
    const dayKey = localDayKey(now, tz, user.dayRolloverHour);
    const weekKey = isoWeekKey(dayKey);

    const repsToday = user.currentDayKey === dayKey ? user.repsToday + 1 : 1;
    const repsThisWeek = user.currentWeekKey === weekKey ? user.repsThisWeek + 1 : 1;
    const firstOfDay = repsToday === 1;
    const modeTier = Math.min(Math.max(repsToday, 1), 7); // client maps tier → name/color/blurb
    const xp = xpForRep(args.anxietyBefore);

    // Milestone signals for the reward banner (client builds the copy).
    const prevPeak = user.peakModeN ?? 0;
    const peakModeN = Math.max(prevPeak, modeTier);
    const isNewPeak = modeTier > prevPeak && modeTier >= 2;
    const newTotal = user.totalApproaches + 1;

    const prev = levelFromXp(user.totalXp);
    const totalXp = user.totalXp + xp;
    const info = levelFromXp(totalXp);
    const leveledUp = info.level > prev.level;
    const rankUp = info.rank !== prev.rank;

    // Weekly-goal streak: count once, the first time this week reaches the goal.
    let { streakWeeks, streakLongest } = user;
    let lastGoalWeekKey = user.lastGoalWeekKey;
    if (lastGoalWeekKey !== weekKey && repsThisWeek >= user.weeklyGoal) {
      const consecutive =
        !!lastGoalWeekKey && weekOrdinal(weekKey) - weekOrdinal(lastGoalWeekKey) === 1;
      streakWeeks = consecutive ? user.streakWeeks + 1 : 1;
      streakLongest = Math.max(streakLongest, streakWeeks);
      lastGoalWeekKey = weekKey;
    }

    const approachId = await ctx.db.insert("approaches", {
      userId: user._id,
      timestamp: now,
      dayKey,
      weekKey,
      vibe: args.vibe,
      anxietyBefore: clampAnxiety(args.anxietyBefore),
      gotNumber: args.gotNumber,
      note: args.note,
      xpAwarded: xp,
      modeReached: modeTier,
    });

    await ctx.db.patch(user._id, {
      totalXp,
      level: info.level,
      totalApproaches: newTotal,
      greatSets: user.greatSets + (args.vibe === "GREAT_SET" ? 1 : 0),
      gotNumbers: user.gotNumbers + (args.gotNumber ? 1 : 0),
      peakModeN,
      repsToday,
      currentDayKey: dayKey,
      repsThisWeek,
      currentWeekKey: weekKey,
      streakWeeks,
      streakLongest,
      lastGoalWeekKey,
      lastRepAt: now,
      timezone: tz,
      // Notification cadence: logging a rep re-arms full cadence (resets the
      // taper). A "rough" rep (went poorly, or high nerves) cools off the next
      // nudge so we never push "do more" onto a hard moment.
      unansweredNudges: 0,
      lastRepRough:
        args.vibe === "STILL_A_REP" || args.anxietyBefore >= 8,
    });

    // Everything the Reward screen needs (PRD §6).
    return {
      approachId,
      xpAwarded: xp,
      totalXp,
      modeTier,
      firstOfDay,
      countToday: repsToday,
      leveledUp,
      level: info.level,
      rankUp,
      newRank: info.rank,
      streak: streakWeeks,
      isNewPeak,
      newTotal,
    };
  },
});

/**
 * Quiet post-celebration number capture (PRD §6): mark whether a rep exchanged a
 * number. Toggles the flag on the user's own approach and keeps the counter in sync.
 * Stores nothing about the person — only the boolean.
 */
export const markNumber = mutation({
  args: { approachId: v.id("approaches"), gotNumber: v.boolean() },
  handler: async (ctx, { approachId, gotNumber }) => {
    const user = await meOrThrow(ctx);
    if (!user) throw new Error("Not authenticated");
    const approach = await ctx.db.get(approachId);
    if (!approach || approach.userId !== user._id) throw new Error("Not found");
    if (approach.gotNumber === gotNumber) return;
    await ctx.db.patch(approachId, { gotNumber });
    await ctx.db.patch(user._id, {
      gotNumbers: Math.max(0, user.gotNumbers + (gotNumber ? 1 : -1)),
    });
  },
});

/**
 * Edit the reflection note on one of the user's own approaches. Note already
 * lives on the approach doc (v.optional(v.string())) — this only patches text,
 * no schema change, no counters touched. Empty text clears the note.
 */
export const editNote = mutation({
  args: { approachId: v.id("approaches"), note: v.string() },
  handler: async (ctx, { approachId, note }) => {
    const user = await meOrThrow(ctx);
    if (!user) throw new Error("Not authenticated");
    const approach = await ctx.db.get(approachId);
    if (!approach || approach.userId !== user._id) throw new Error("Not found");
    const trimmed = note.trim();
    await ctx.db.patch(approachId, { note: trimmed || undefined });
  },
});

/** Undo/delete the most recent rep, best-effort reversing counters (PRD §18). */
export const undoLast = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await meOrThrow(ctx);
    if (!user) throw new Error("No user");
    const last = await ctx.db
      .query("approaches")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .first();
    if (!last) return { removed: false };

    await ctx.db.delete(last._id);
    const totalXp = Math.max(0, user.totalXp - last.xpAwarded);
    await ctx.db.patch(user._id, {
      totalXp,
      level: levelFromXp(totalXp).level,
      totalApproaches: Math.max(0, user.totalApproaches - 1),
      greatSets: Math.max(0, user.greatSets - (last.vibe === "GREAT_SET" ? 1 : 0)),
      gotNumbers: Math.max(0, user.gotNumbers - (last.gotNumber ? 1 : 0)),
      repsToday:
        last.dayKey === user.currentDayKey ? Math.max(0, user.repsToday - 1) : user.repsToday,
      repsThisWeek:
        last.weekKey === user.currentWeekKey
          ? Math.max(0, user.repsThisWeek - 1)
          : user.repsThisWeek,
      // streak is not reversed here (undo is an edge action on the latest rep).
    });
    return { removed: true };
  },
});

/** Everything Home needs: the falling line (bounded), week vs goal, streak, totals. */
export const dashboard = query({
  args: { timezone: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const user = await meOrThrow(ctx);
    if (!user) return null;

    const tz = args.timezone || user.timezone || "UTC";
    const now = Date.now();
    const currentDay = localDayKey(now, tz, user.dayRolloverHour);
    const currentWeek = isoWeekKey(currentDay);

    // Bounded: only the most recent points feed the chart.
    const recent = await ctx.db
      .query("approaches")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(TREND_POINTS);
    const trend = recent
      .reverse()
      .map((a) => ({ t: a.timestamp, a: a.anxietyBefore }));
    if (user.baselineAnxiety != null) {
      trend.unshift({ t: user.createdAt, a: user.baselineAnxiety });
    }

    const todayCount = user.currentDayKey === currentDay ? user.repsToday : 0;
    const weekCount = user.currentWeekKey === currentWeek ? user.repsThisWeek : 0;

    // Streak stands if the goal was hit this week or last (current week may be in progress).
    let streakCurrent = 0;
    if (user.lastGoalWeekKey) {
      const diff = weekOrdinal(currentWeek) - weekOrdinal(user.lastGoalWeekKey);
      if (diff === 0 || diff === 1) streakCurrent = user.streakWeeks;
    }

    return {
      user: { ...user, levelInfo: levelFromXp(user.totalXp) },
      today: { count: todayCount, modeTier: todayCount > 0 ? Math.min(todayCount, 7) : null },
      week: { count: weekCount, goal: user.weeklyGoal },
      streak: { current: streakCurrent, longest: user.streakLongest },
      totals: { approaches: user.totalApproaches, greatSets: user.greatSets, numbers: user.gotNumbers },
      trend,
      isDayZero: user.totalApproaches === 0,
    };
  },
});

/** Recent reps (for a history list / undo affordance). */
export const recent = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit }) => {
    const user = await meOrThrow(ctx);
    if (!user) return [];
    return ctx.db
      .query("approaches")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(limit ?? 20);
  },
});
