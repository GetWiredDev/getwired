import { v } from "convex/values";
import { query } from "./_generated/server";

export const listRooms = query({
  args: { type: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (args.type) {
      return await ctx.db
        .query("chatRooms")
        .withIndex("by_type", (q) => q.eq("type", args.type as "public" | "private" | "dm"))
        .collect();
    }
    return await ctx.db.query("chatRooms").collect();
  },
});

export const getRoomById = query({
  args: { roomId: v.id("chatRooms") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.roomId);
  },
});

export const getRoomByCategorySlug = query({
  args: { categorySlug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("chatRooms")
      .withIndex("by_categorySlug", (q) => q.eq("categorySlug", args.categorySlug))
      .first();
  },
});

export const getMessages = query({
  args: { roomId: v.id("chatRooms"), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    return await ctx.db
      .query("chatMessages")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .order("asc")
      .take(limit);
  },
});

export const getThreadMessages = query({
  args: { threadId: v.id("chatMessages") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("chatMessages")
      .withIndex("by_thread", (q) => q.eq("threadId", args.threadId))
      .order("asc")
      .collect();
  },
});

