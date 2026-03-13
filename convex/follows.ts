import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireCurrentUser } from "./users";

export const toggleFollow = mutation({
  args: {
    targetId: v.string(),
    targetType: v.union(v.literal("user"), v.literal("tag"), v.literal("category")),
  },
  handler: async (ctx, args) => {
    const { user } = await requireCurrentUser(ctx);

    const existing = await ctx.db
      .query("follows")
      .withIndex("by_follower", (q) => q.eq("followerId", user._id))
      .collect();

    const match = existing.find(
      (f) => f.targetId === args.targetId && f.targetType === args.targetType,
    );

    if (match) {
      await ctx.db.delete(match._id);
      return { following: false };
    }

    await ctx.db.insert("follows", {
      followerId: user._id,
      targetId: args.targetId,
      targetType: args.targetType,
      createdAt: Date.now(),
    });
    return { following: true };
  },
});

export const isFollowing = query({
  args: { targetId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return false;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();
    if (!user) return false;

    const follow = await ctx.db
      .query("follows")
      .withIndex("by_follower", (q) => q.eq("followerId", user._id))
      .collect();

    return follow.some((f) => f.targetId === args.targetId);
  },
});

export const getFollowedUserIds = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();
    if (!user) return [];

    const follows = await ctx.db
      .query("follows")
      .withIndex("by_follower", (q) => q.eq("followerId", user._id))
      .collect();

    return follows
      .filter((f) => f.targetType === "user")
      .map((f) => f.targetId);
  },
});

export const getFollowerCount = query({
  args: { targetId: v.string() },
  handler: async (ctx, args) => {
    const follows = await ctx.db
      .query("follows")
      .withIndex("by_target", (q) => q.eq("targetId", args.targetId))
      .collect();

    return follows.length;
  },
});

