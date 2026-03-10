import { v } from "convex/values";
import { query } from "./_generated/server";

export const getByPost = query({
  args: { postId: v.id("posts") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("polls")
      .withIndex("by_post", (q) => q.eq("postId", args.postId))
      .first();
  },
});

