import { v } from "convex/values";
import { query } from "./_generated/server";

export const listCategories = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("forumCategories")
      .withIndex("by_order")
      .order("asc")
      .collect();
  },
});

export const getCategoryBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("forumCategories")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
  },
});

