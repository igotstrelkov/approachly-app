import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// Data model — PRD §13, adjusted to Convex guidelines: denormalized counters on
// the user doc (so the dashboard never scans unbounded history), and the auth key
// is the Clerk-issued tokenIdentifier. The courage layer holds NOTHING identifying
// about anyone approached. Connections (v2) will be a separate, lock-protected store.
export default defineSchema({
  users: defineTable({
    tokenId: v.string(), // ctx.auth identity.tokenIdentifier (issuer|subject)
    createdAt: v.number(),
    timezone: v.optional(v.string()),
    dayRolloverHour: v.number(), // = 4 (PRD §8)

    // plan / onboarding
    onboarded: v.boolean(),
    weeklyGoal: v.number(),
    baselineAnxiety: v.optional(v.number()), // day-zero point on the line
    reason: v.optional(v.string()), // the "why", seeds the Hype flow
    reminderHour: v.optional(v.number()), // local hour for the weekly push

    // progression
    totalXp: v.number(),
    level: v.number(),

    // denormalized counters (updated in mutations — no history scans)
    totalApproaches: v.number(),
    greatSets: v.number(),
    gotNumbers: v.number(),
    peakModeN: v.optional(v.number()), // highest daily mode tier ever reached (milestones)

    // rolling day/week state (keyed so a stale day/week reads as 0)
    repsToday: v.number(),
    currentDayKey: v.optional(v.string()),
    repsThisWeek: v.number(),
    currentWeekKey: v.optional(v.string()),

    // weekly-goal streak (consecutive weeks hitting goal)
    streakWeeks: v.number(),
    streakLongest: v.number(),
    lastGoalWeekKey: v.optional(v.string()), // most recent week the goal was hit

    // weekly reminder push (PRD §8)
    reminderDow: v.optional(v.number()), // 0=Sun … 6=Sat (default 0)
    lastRemindedWeekKey: v.optional(v.string()), // dedupe: one nudge per week

    lastRepAt: v.optional(v.number()),
  }).index("by_token", ["tokenId"]),

  // Web-push subscriptions — one row per installed device.
  pushSubscriptions: defineTable({
    userId: v.id("users"),
    endpoint: v.string(),
    p256dh: v.string(),
    auth: v.string(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_endpoint", ["endpoint"]),

  approaches: defineTable({
    userId: v.id("users"),
    timestamp: v.number(),
    dayKey: v.string(), // local day w/ 4am rollover
    weekKey: v.string(), // ISO week
    vibe: v.union(v.literal("GREAT_SET"), v.literal("STILL_A_REP")),
    anxietyBefore: v.number(), // 1–10, required
    gotNumber: v.boolean(),
    note: v.optional(v.string()),
    xpAwarded: v.number(),
    modeReached: v.number(), // daily mode tier reached with this rep
  })
    .index("by_user", ["userId"])
    .index("by_user_week", ["userId", "weekKey"]),
});
