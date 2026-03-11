import { v } from "convex/values";
import { query } from "./_generated/server";

export const list = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20;
    return await ctx.db
      .query("newsArticles")
      .withIndex("by_publishedAt")
      .order("desc")
      .take(limit);
  },
});

export const getBySource = query({
  args: { source: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 10;
    return await ctx.db
      .query("newsArticles")
      .withIndex("by_source", (q) => q.eq("source", args.source))
      .order("desc")
      .take(limit);
  },
});

