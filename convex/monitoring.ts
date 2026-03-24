import { v } from "convex/values";
import { mutation, query, internalMutation, internalAction } from "./_generated/server";
import { getAuthenticatedUser } from "./helpers";

export const createAlert = internalMutation({
  args: {
    projectId: v.id("projects"),
    type: v.union(
      v.literal("reddit_mention"),
      v.literal("rank_change"),
      v.literal("trend_spike"),
      v.literal("new_competitor")
    ),
    title: v.string(),
    description: v.string(),
    relatedId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("alerts", {
      projectId: args.projectId,
      type: args.type,
      title: args.title,
      description: args.description,
      isRead: false,
      relatedId: args.relatedId,
      createdAt: Date.now(),
    });
  },
});

export const getUnreadAlerts = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    const project = await ctx.db.get(args.projectId);
    if (!project || project.userId !== user._id) throw new Error("Not found");

    return await ctx.db
      .query("alerts")
      .withIndex("by_project_unread", (q) =>
        q.eq("projectId", args.projectId).eq("isRead", false)
      )
      .collect();
  },
});

export const getAllAlerts = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    const project = await ctx.db.get(args.projectId);
    if (!project || project.userId !== user._id) throw new Error("Not found");

    return await ctx.db
      .query("alerts")
      .withIndex("by_project_unread", (q) =>
        q.eq("projectId", args.projectId)
      )
      .collect();
  },
});

export const markAlertRead = mutation({
  args: { alertId: v.id("alerts") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.alertId, { isRead: true });
  },
});

export const markAllRead = mutation({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const unread = await ctx.db
      .query("alerts")
      .withIndex("by_project_unread", (q) =>
        q.eq("projectId", args.projectId).eq("isRead", false)
      )
      .collect();

    for (const alert of unread) {
      await ctx.db.patch(alert._id, { isRead: true });
    }
  },
});

export const generateWeeklyDigest = internalAction({
  args: {},
  handler: async (ctx) => {
    // Placeholder for weekly digest generation
    // In production, this would:
    // 1. Iterate all projects with tracked keywords
    // 2. Compare current snapshots to 7-day-old snapshots
    // 3. Summarize changes and create alerts
    console.log("Weekly digest generation triggered");
  },
});

