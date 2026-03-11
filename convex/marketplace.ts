import { v } from "convex/values";
import { query } from "./_generated/server";

export const getActivePromotions = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("promotions")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();
  },
});

export const getByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("promotions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

