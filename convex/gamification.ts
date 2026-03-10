import { v } from "convex/values";
import { query } from "./_generated/server";

export const getKarma = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return null;
    return { karma: user.karma, rank: user.rank };
  },
});

export const getLeaderboard = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 10;
    return await ctx.db
      .query("users")
      .withIndex("by_karma")
      .order("desc")
      .take(limit);
  },
});

export const getRankDistribution = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    const distribution: Record<string, number> = {};
    for (const user of users) {
      distribution[user.rank] = (distribution[user.rank] || 0) + 1;
    }
    return distribution;
  },
});

