import { mutation } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";

async function meOrThrow(ctx: MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not authenticated");
  const user = await ctx.db
    .query("users")
    .withIndex("by_token", (q) => q.eq("tokenId", identity.tokenIdentifier))
    .unique();
  if (!user) throw new Error("No user");
  return user;
}

/** "Too much today" → step back a day (zero penalty — the therapeutic principle).
 * No skip-ahead: the sequence is the point; a confident user just does the easy
 * days fast. */
export const stepBackDay = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await meOrThrow(ctx);
    const day = Math.max(1, (user.challengeDay ?? 1) - 1);
    await ctx.db.patch(user._id, { challengeDay: day });
  },
});

/** "Skip — just let me log freely" → leave the challenge for the free-play
 * steady state, from the onboarding hand-off. */
export const skipChallenge = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await meOrThrow(ctx);
    await ctx.db.patch(user._id, { challengeDone: true });
  },
});
