import { v } from "convex/values";
import { action, mutation, query, internalMutation, ActionCtx } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { getAuthenticatedUser } from "./helpers";

async function executeToolCall(
  ctx: ActionCtx,
  projectId: Id<"projects">,
  toolName: string,
  args: Record<string, string>
): Promise<string> {
  switch (toolName) {
    case "search_reddit": {
      const keywords = args.query ? [args.query] : [];
      await ctx.runAction(api.reddit.searchReddit, { projectId, keywords });
      return `Searched Reddit for: ${keywords.join(", ")}. Results saved to project.`;
    }
    case "find_keywords": {
      if (args.url) {
        await ctx.runAction(api.scanning.scanWebsite, { projectId, url: args.url });
        return `Scanned ${args.url} and extracted keywords.`;
      }
      return "No URL provided for keyword extraction.";
    }
    case "analyze_competitors": {
      const domain = args.query || args.url || "";
      await ctx.runAction(api.competitors.discoverCompetitors, { projectId, domain });
      return `Discovered competitors for ${domain}.`;
    }
    case "seo_analysis":
    case "geo_analysis":
    case "check_trends": {
      const domain = args.url || args.query || "";
      await ctx.runAction(api.analysis.analyzeKeywords, { projectId, domain });
      return `Analyzed keywords for project. Check the keywords page for updated metrics.`;
    }
    case "draft_response": {
      return `To draft a response, please go to the Reddit Intelligence page and click "Draft Response" on a specific post.`;
    }
    case "knowledge_lookup": {
      const entries = await ctx.runQuery(internal.knowledgeBase.searchInternal, {
        projectId,
        searchTerm: args.query || "",
      });
      if (entries.length === 0) return "No knowledge base entries found.";
      return entries.map((e: { title: string; content: string }) => `**${e.title}**: ${e.content.slice(0, 200)}`).join("\n\n");
    }
    default:
      return `Unknown tool: ${toolName}`;
  }
}


export const AGENT_TOOLS = [
  { name: "search_reddit", description: "Search Reddit for posts matching keywords", icon: "MessageSquare" },
  { name: "find_keywords", description: "Extract keywords from a URL", icon: "Key" },
  { name: "analyze_competitors", description: "Find competitors for a domain", icon: "Users" },
  { name: "check_trends", description: "Check Google Trends for a keyword", icon: "TrendingUp" },
  { name: "seo_analysis", description: "Get SEO metrics for keywords", icon: "Search" },
  { name: "geo_analysis", description: "Check AI visibility for a keyword", icon: "Bot" },
  { name: "draft_response", description: "Draft a response for a Reddit post", icon: "PenLine" },
  { name: "knowledge_lookup", description: "Search the knowledge base", icon: "BookOpen" },
] as const;

export const createRun = mutation({
  args: {
    projectId: v.id("projects"),
    prompt: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    return await ctx.db.insert("agentRuns", {
      projectId: args.projectId,
      userId: user._id,
      prompt: args.prompt,
      status: "running",
      createdAt: Date.now(),
    });
  },
});

export const updateRun = internalMutation({
  args: {
    runId: v.id("agentRuns"),
    status: v.union(v.literal("running"), v.literal("completed"), v.literal("failed")),
    result: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.runId, {
      status: args.status,
      result: args.result,
      completedAt: args.status !== "running" ? Date.now() : undefined,
    });
  },
});

export const createToolCall = internalMutation({
  args: {
    runId: v.id("agentRuns"),
    toolName: v.string(),
    input: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("agentToolCalls", {
      runId: args.runId,
      toolName: args.toolName,
      input: args.input,
      status: "running",
      startedAt: Date.now(),
    });
  },
});

export const updateToolCall = internalMutation({
  args: {
    toolCallId: v.id("agentToolCalls"),
    status: v.union(v.literal("pending"), v.literal("running"), v.literal("completed"), v.literal("failed")),
    output: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.toolCallId, {
      status: args.status,
      output: args.output,
      completedAt: args.status === "completed" || args.status === "failed" ? Date.now() : undefined,
    });
  },
});

export const listRuns = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    const project = await ctx.db.get(args.projectId);
    if (!project || project.userId !== user._id) throw new Error("Not found");
    return await ctx.db
      .query("agentRuns")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();
  },
});

export const getToolCalls = query({
  args: { runId: v.id("agentRuns") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("agentToolCalls")
      .withIndex("by_run", (q) => q.eq("runId", args.runId))
      .collect();
  },
});

export const runAgent = action({
  args: {
    runId: v.id("agentRuns"),
    projectId: v.id("projects"),
    prompt: v.string(),
  },
  handler: async (ctx, { runId, projectId, prompt }) => {
    const openrouterKey = process.env.OPENROUTER_API_KEY;
    if (!openrouterKey) {
      await ctx.runMutation(internal.agent.updateRun, {
        runId,
        status: "failed",
        result: "OpenRouter API key not configured",
      });
      return;
    }

    try {
      const { default: OpenAI } = await import("openai");
      const openai = new OpenAI({
        apiKey: openrouterKey,
        baseURL: "https://openrouter.ai/api/v1",
        defaultHeaders: {
          "HTTP-Referer": "https://getwired.app",
          "X-OpenRouter-Title": "GetWired",
        },
      });

      const tools = AGENT_TOOLS.map((t) => ({
        type: "function" as const,
        function: {
          name: t.name,
          description: t.description,
          parameters: {
            type: "object" as const,
            properties: {
              query: { type: "string" as const, description: "The search query or keyword" },
              url: { type: "string" as const, description: "URL to analyze (for find_keywords)" },
            },
          },
        },
      }));

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const messages: any[] = [
        {
          role: "system",
          content: `You are GetWired, a growth intelligence agent. You help users analyze their website's growth opportunities including SEO, competitor analysis, Reddit opportunities, and AI visibility. Use the available tools to gather data and provide actionable insights. Be concise and data-driven.`,
        },
        { role: "user", content: prompt },
      ];

      // Agent loop - handle tool calls
      let iterations = 0;
      const maxIterations = 5;

      while (iterations < maxIterations) {
        iterations++;
        const completion = await openai.chat.completions.create({
          model: "openai/gpt-4o",
          messages,
          tools,
        });

        const choice = completion.choices[0] as { message: { content?: string | null; tool_calls?: Array<{ id: string; function: { name: string; arguments: string } }> } };
        if (!choice.message.tool_calls || choice.message.tool_calls.length === 0) {
          // Final response
          await ctx.runMutation(internal.agent.updateRun, {
            runId,
            status: "completed",
            result: choice.message.content ?? "No response generated",
          });
          return;
        }

        // Process tool calls
        messages.push(choice.message);

        for (const toolCall of choice.message.tool_calls) {
          const toolCallId = await ctx.runMutation(internal.agent.createToolCall, {
            runId,
            toolName: toolCall.function.name,
            input: toolCall.function.arguments,
          });

          let result = "";
          try {
            // Execute tool based on name
            const args = JSON.parse(toolCall.function.arguments);
            result = await executeToolCall(ctx, projectId, toolCall.function.name, args);

            await ctx.runMutation(internal.agent.updateToolCall, {
              toolCallId,
              status: "completed",
              output: result.slice(0, 5000),
            });
          } catch (e) {
            result = `Error: ${e instanceof Error ? e.message : "Unknown error"}`;
            await ctx.runMutation(internal.agent.updateToolCall, {
              toolCallId,
              status: "failed",
              output: result,
            });
          }

          messages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            content: result,
          });
        }
      }

      await ctx.runMutation(internal.agent.updateRun, {
        runId,
        status: "completed",
        result: "Agent completed after maximum iterations",
      });
    } catch (e) {
      await ctx.runMutation(internal.agent.updateRun, {
        runId,
        status: "failed",
        result: e instanceof Error ? e.message : "Unknown error",
      });
    }
  },
});

