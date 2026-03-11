import { v } from "convex/values";
import { query } from "./_generated/server";

export const getByUser = query({
  args: { userId: v.id("users"), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20;
    return await ctx.db
      .query("bookmarks")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(limit);
  },
});

export const isBookmarked = query({
  args: { userId: v.id("users"), targetId: v.string() },
  handler: async (ctx, args) => {
    const bookmark = await ctx.db
      .query("bookmarks")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    return bookmark.some((b) => b.targetId === args.targetId);
  },
});

