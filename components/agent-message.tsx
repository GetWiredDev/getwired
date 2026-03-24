"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { AgentToolCall } from "@/components/agent-tool-call";
import { Bot, User, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface AgentMessageProps {
  run: Doc<"agentRuns">;
}

export function AgentMessage({ run }: AgentMessageProps) {
  const toolCalls = useQuery(api.agent.getToolCalls, { runId: run._id });

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      {/* User prompt */}
      <div className="flex gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-white"
          style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-hover))" }}
        >
          <User className="h-4 w-4" />
        </div>
        <div className="flex-1 pt-1">
          <p className="text-sm" style={{ color: "var(--fg)" }}>{run.prompt}</p>
        </div>
      </div>

      {/* Agent response */}
      <div className="flex gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
          style={{ background: "var(--bg-glass)", border: "1px solid var(--border-color)" }}
        >
          <Bot className="h-4 w-4" style={{ color: "var(--accent)" }} />
        </div>
        <div className="flex-1 space-y-2 pt-1">
          {toolCalls && toolCalls.length > 0 && (
            <div className="space-y-1.5">
              {toolCalls.map((tc) => <AgentToolCall key={tc._id} toolCall={tc} />)}
            </div>
          )}

          {run.status === "running" ? (
            <div className="flex items-center gap-2 text-sm" style={{ color: "var(--fg-muted)" }}>
              <Loader2 className="h-4 w-4 animate-spin" style={{ color: "var(--accent)" }} />
              <span>Thinking...</span>
            </div>
          ) : run.status === "failed" ? (
            <div className="rounded-xl p-3 text-sm" style={{ background: "rgba(239,68,68,0.1)", color: "var(--destructive)" }}>
              {run.result ?? "An error occurred"}
            </div>
          ) : run.result ? (
            <div className="text-sm whitespace-pre-wrap" style={{ color: "var(--fg-secondary)" }}>{run.result}</div>
          ) : null}
        </div>
      </div>
    </motion.div>
  );
}

