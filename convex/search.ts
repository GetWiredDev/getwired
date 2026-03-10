import { v } from "convex/values";
import { query } from "./_generated/server";

export const searchPosts = query({
  args: { query: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20;
    const searchTerm = args.query.toLowerCase();

    // Simple text search across posts
    const allPosts = await ctx.db.query("posts").collect();
    return allPosts
      .filter(
        (post) =>
          post.title.toLowerCase().includes(searchTerm) ||
          post.content.toLowerCase().includes(searchTerm) ||
          post.tags.some((tag: string) => tag.toLowerCase().includes(searchTerm))
      )
      .slice(0, limit);
  },
});

export const searchUsers = query({
  args: { query: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 10;
    const searchTerm = args.query.toLowerCase();

    const allUsers = await ctx.db.query("users").collect();
    return allUsers
      .filter(
        (user) =>
          user.name.toLowerCase().includes(searchTerm) ||
          user.username.toLowerCase().includes(searchTerm) ||
          (user.bio && user.bio.toLowerCase().includes(searchTerm))
      )
      .slice(0, limit);
  },
});

export const searchNews = query({
  args: { query: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 10;
    const searchTerm = args.query.toLowerCase();

    const allNews = await ctx.db.query("newsArticles").collect();
    return allNews
      .filter(
        (article) =>
          article.title.toLowerCase().includes(searchTerm) ||
          article.summary.toLowerCase().includes(searchTerm) ||
          article.tags.some((tag: string) => tag.toLowerCase().includes(searchTerm))
      )
      .slice(0, limit);
  },
});

