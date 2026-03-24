import { v } from "convex/values";
import { action, internalAction, query, mutation, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { getAuthenticatedUser } from "./helpers";

async function getRedditAccessToken(): Promise<string> {
  const clientId = process.env.REDDIT_CLIENT_ID;
  const clientSecret = process.env.REDDIT_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Reddit API credentials not configured");
  }

  const auth = btoa(`${clientId}:${clientSecret}`);
  const response = await fetch("https://www.reddit.com/api/v1/access_token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": "GetWired/1.0",
    },
    body: "grant_type=client_credentials",
  });

  const data = await response.json();
  return data.access_token;
}

function calculateRelevance(post: {
  title: string;
  selftext?: string;
  score: number;
  num_comments: number;
  created_utc: number;
}, keyword: string): number {
  let score = 0;
  const titleLower = post.title.toLowerCase();
  const kwLower = keyword.toLowerCase();

  // Title match (high weight)
  if (titleLower.includes(kwLower)) score += 40;

  // Body match
  if (post.selftext?.toLowerCase().includes(kwLower)) score += 20;

  // Engagement signals
  if (post.num_comments > 10) score += 15;
  else if (post.num_comments > 5) score += 10;
  else if (post.num_comments > 0) score += 5;

  // Recency (within last 24h = bonus)
  const ageHours = (Date.now() / 1000 - post.created_utc) / 3600;
  if (ageHours < 24) score += 15;
  else if (ageHours < 72) score += 10;
  else if (ageHours < 168) score += 5;

  // Upvotes
  if (post.score > 50) score += 10;
  else if (post.score > 10) score += 5;

  return Math.min(100, score);
}

export const insertPost = internalMutation({
  args: {
    projectId: v.id("projects"),
    keywordId: v.optional(v.id("keywords")),
    redditId: v.string(),
    subreddit: v.string(),
    title: v.string(),
    selfText: v.optional(v.string()),
    url: v.string(),
    score: v.number(),
    numComments: v.number(),
    createdUtc: v.number(),
    relevanceScore: v.number(),
  },
  handler: async (ctx, args) => {
    // Check for duplicate
    const existing = await ctx.db
      .query("redditPosts")
      .withIndex("by_reddit_id", (q) => q.eq("redditId", args.redditId))
      .unique();
    if (existing) return existing._id;

    return await ctx.db.insert("redditPosts", {
      ...args,
      status: "new",
      discoveredAt: Date.now(),
    });
  },
});

export const searchReddit = action({
  args: {
    projectId: v.id("projects"),
    keywords: v.array(v.string()),
  },
  handler: async (ctx, { projectId, keywords }) => {
    let token: string;
    try {
      token = await getRedditAccessToken();
    } catch {
      console.warn("Reddit API not configured, using mock data");
      // Insert mock posts for development
      for (const keyword of keywords.slice(0, 3)) {
        await ctx.runMutation(internal.reddit.insertPost, {
          projectId,
          redditId: `mock_${keyword.replace(/\s/g, "_")}_${Date.now()}`,
          subreddit: "webdev",
          title: `Looking for tools related to ${keyword}`,
          selfText: `Has anyone used any good tools for ${keyword}? Looking for recommendations.`,
          url: `https://reddit.com/r/webdev/mock`,
          score: 15,
          numComments: 8,
          createdUtc: Date.now() / 1000 - 3600,
          relevanceScore: 75,
        });
      }
      return;
    }

    for (const keyword of keywords) {
      const response = await fetch(
        `https://oauth.reddit.com/search?q=${encodeURIComponent(keyword)}&sort=new&limit=25&t=week`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "User-Agent": "GetWired/1.0",
          },
        }
      );

      const data = await response.json();
      const posts = data?.data?.children ?? [];

      for (const { data: post } of posts) {
        const relevanceScore = calculateRelevance(post, keyword);
        if (relevanceScore < 20) continue; // Skip low relevance

        await ctx.runMutation(internal.reddit.insertPost, {
          projectId,
          redditId: post.id,
          subreddit: post.subreddit,
          title: post.title,
          selfText: post.selftext?.slice(0, 2000),
          url: `https://reddit.com${post.permalink}`,
          score: post.score,
          numComments: post.num_comments,
          createdUtc: post.created_utc,
          relevanceScore,
        });
      }
    }
  },
});

export const listByProject = query({
  args: {
    projectId: v.id("projects"),
    status: v.optional(v.union(
      v.literal("new"),
      v.literal("reviewed"),
      v.literal("responded"),
      v.literal("dismissed")
    )),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    const project = await ctx.db.get(args.projectId);
    if (!project || project.userId !== user._id) throw new Error("Not found");

    if (args.status) {
      return await ctx.db
        .query("redditPosts")
        .withIndex("by_project_status", (q) =>
          q.eq("projectId", args.projectId).eq("status", args.status!)
        )
        .collect();
    }
    return await ctx.db
      .query("redditPosts")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();
  },
});

export const updatePostStatus = mutation({
  args: {
    postId: v.id("redditPosts"),
    status: v.union(
      v.literal("new"),
      v.literal("reviewed"),
      v.literal("responded"),
      v.literal("dismissed")
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.postId, { status: args.status });
  },
});

export const scanAllProjects = internalAction({
  args: {},
  handler: async (ctx) => {
    console.log("Reddit scan triggered for all projects");
  },
});

