import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const getSubscribers = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("newsletterSubscribers").collect();
  },
});

export const isSubscribed = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const subscriber = await ctx.db
      .query("newsletterSubscribers")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
    return subscriber?.isActive ?? false;
  },
});

export const subscribe = mutation({
  args: { email: v.string(), userId: v.optional(v.id("users")) },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("newsletterSubscribers")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { isActive: true });
      return existing._id;
    }

    return await ctx.db.insert("newsletterSubscribers", {
      email: args.email,
      userId: args.userId,
      isActive: true,
      subscribedAt: Date.now(),
    });
  },
});

