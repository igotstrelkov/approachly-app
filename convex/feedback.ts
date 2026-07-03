import { mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Capture in-app feedback / feature requests from the profile screen. Stored in
 * the `feedback` table — read via the Convex dashboard or `npx convex data feedback`.
 */
export const submit = mutation({
  args: {
    kind: v.union(v.literal("idea"), v.literal("bug"), v.literal("other")),
    message: v.string(),
  },
  handler: async (ctx, { kind, message }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const trimmed = message.trim().slice(0, 2000);
    if (!trimmed) throw new Error("Empty feedback");
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenId", identity.tokenIdentifier))
      .unique();
    await ctx.db.insert("feedback", {
      userId: user?._id,
      kind,
      message: trimmed,
      email: identity.email,
      createdAt: Date.now(),
    });
  },
});
