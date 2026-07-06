import { mutation, query } from "./_generated/server";
import type { QueryCtx, MutationCtx } from "./_generated/server";
import { v } from "convex/values";
import { levelFromXp } from "./model";

async function requireIdentity(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not authenticated");
  return identity;
}

async function userByToken(ctx: QueryCtx | MutationCtx, tokenId: string) {
  return ctx.db
    .query("users")
    .withIndex("by_token", (q) => q.eq("tokenId", tokenId))
    .unique();
}

/** Current user + derived level info, or null if signed-out / not yet created. */
export const getMe = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const user = await userByToken(ctx, identity.tokenIdentifier);
    if (!user) return null;
    return { ...user, levelInfo: levelFromXp(user.totalXp) };
  },
});

/** Persist the quiz outcome and mark onboarded. Creates the user on first run. */
export const completeOnboarding = mutation({
  args: {
    weeklyGoal: v.number(),
    baselineAnxiety: v.number(),
    reason: v.optional(v.string()),
    approachFreq: v.optional(v.string()),
    mainBarrier: v.optional(v.string()),
    timezone: v.optional(v.string()),
    reminderHour: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await requireIdentity(ctx);
    const existing = await userByToken(ctx, identity.tokenIdentifier);
    const plan = {
      weeklyGoal: args.weeklyGoal,
      baselineAnxiety: args.baselineAnxiety,
      reason: args.reason,
      approachFreq: args.approachFreq,
      mainBarrier: args.mainBarrier,
      timezone: args.timezone,
      reminderHour: args.reminderHour,
      onboarded: true,
    };
    if (existing) {
      // Existing account → NEVER wipe progress. Onboarding is one-time; if a
      // returning user walks the quiz again (e.g. after signing out) we keep all
      // their data intact. Plan changes happen via setWeeklyGoal, not here.
      return existing._id;
    }
    return ctx.db.insert("users", {
      tokenId: identity.tokenIdentifier,
      createdAt: Date.now(),
      dayRolloverHour: 4,
      totalXp: 0,
      level: 1,
      totalApproaches: 0,
      greatSets: 0,
      gotNumbers: 0,
      repsToday: 0,
      repsThisWeek: 0,
      streakWeeks: 0,
      streakLongest: 0,
      ...plan,
    });
  },
});

export const setWeeklyGoal = mutation({
  args: { weeklyGoal: v.number() },
  handler: async (ctx, { weeklyGoal }) => {
    const identity = await requireIdentity(ctx);
    const user = await userByToken(ctx, identity.tokenIdentifier);
    if (!user) throw new Error("No user");
    await ctx.db.patch(user._id, { weeklyGoal });
  },
});

export const setReminderHour = mutation({
  args: { reminderHour: v.number() },
  handler: async (ctx, { reminderHour }) => {
    const identity = await requireIdentity(ctx);
    const user = await userByToken(ctx, identity.tokenIdentifier);
    if (!user) throw new Error("No user");
    await ctx.db.patch(user._id, { reminderHour });
  },
});
