import { v } from "convex/values";
import { action, internalMutation, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";

export const getPost = internalQuery({
  args: { postId: v.id("redditPosts") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.postId);
  },
});

export const updateSuggestedResponse = internalMutation({
  args: {
    postId: v.id("redditPosts"),
    suggestedResponse: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.postId, {
      suggestedResponse: args.suggestedResponse,
    });
  },
});

export const draftResponse = action({
  args: {
    projectId: v.id("projects"),
    redditPostId: v.id("redditPosts"),
    tone: v.optional(
      v.union(v.literal("helpful"), v.literal("casual"), v.literal("expert"))
    ),
  },
  handler: async (ctx, { projectId, redditPostId, tone }) => {
    const openrouterKey = process.env.OPENROUTER_API_KEY;
    if (!openrouterKey) {
      return "OpenRouter API key not configured. Please add OPENROUTER_API_KEY to your Convex environment variables.";
    }

    // Fetch the Reddit post
    const post = await ctx.runQuery(internal.responses.getPost, { postId: redditPostId });
    if (!post) return "Post not found";

    // Fetch knowledge base
    const knowledge = await ctx.runQuery(internal.knowledgeBase.searchInternal, {
      projectId,
      searchTerm: "",
    });

    const knowledgeContext = knowledge
      .map((e: { title: string; content: string }) => `## ${e.title}\n${e.content}`)
      .join("\n\n");

    const toneGuide =
      tone === "expert"
        ? "Use a professional, authoritative tone with technical depth."
        : tone === "casual"
          ? "Use a friendly, conversational tone. Be relatable."
          : "Be genuinely helpful and informative. Focus on solving the problem.";

    const { default: OpenAI } = await import("openai");
    const openai = new OpenAI({
      apiKey: openrouterKey,
      baseURL: "https://openrouter.ai/api/v1",
      defaultHeaders: {
        "HTTP-Referer": "https://getwired.app",
        "X-OpenRouter-Title": "GetWired",
      },
    });

    const completion = await openai.chat.completions.create({
      model: "openai/gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a helpful community member responding to a Reddit post. ${toneGuide}

Rules:
- No hard selling or obvious promotion
- Be genuinely helpful and add value
- Only mention the product if naturally relevant
- Match the subreddit's tone and culture
- Keep it concise (2-3 paragraphs max)

Product Knowledge:
${knowledgeContext || "No product knowledge available yet."}`,
        },
        {
          role: "user",
          content: `Reddit Post in r/${post.subreddit}:
Title: ${post.title}
${post.selfText ? `Body: ${post.selfText}` : ""}

Draft a response:`,
        },
      ],
      max_tokens: 500,
    });

    const response = completion.choices[0]?.message?.content ?? "Failed to generate response";

    // Save the suggested response
    await ctx.runMutation(internal.responses.updateSuggestedResponse, {
      postId: redditPostId,
      suggestedResponse: response,
    });

    return response;
  },
});

