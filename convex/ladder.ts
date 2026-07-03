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

const MAX_TIER = 5;

/** "Swap" → show a different mission from the same tier's pool. */
export const swapMission = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await meOrThrow(ctx);
    await ctx.db.patch(user._id, { missionIdx: (user.missionIdx ?? 0) + 1 });
  },
});

/** "Too much" → step down a rung (zero penalty — the therapeutic principle). */
export const stepDownTier = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await meOrThrow(ctx);
    const tier = Math.max(1, (user.ladderTier ?? 1) - 1);
    await ctx.db.patch(user._id, { ladderTier: tier, tierCleared: 0 });
  },
});

/** "Too easy" → step up a rung. */
export const stepUpTier = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await meOrThrow(ctx);
    const tier = Math.min(MAX_TIER, (user.ladderTier ?? 1) + 1);
    await ctx.db.patch(user._id, { ladderTier: tier, tierCleared: 0 });
  },
});
