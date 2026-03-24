"use client";

import { useState } from "react";
import { Doc } from "@/convex/_generated/dataModel";
import {
  MessageSquare, Key, Users, TrendingUp, Search, Bot, PenLine, BookOpen,
  ChevronRight, Loader2, CheckCircle2, XCircle,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const iconMap: Record<string, React.ElementType> = { MessageSquare, Key, Users, TrendingUp, Search, Bot, PenLine, BookOpen };

function getToolIcon(toolName: string) {
  const toolIcons: Record<string, string> = {
    search_reddit: "MessageSquare", find_keywords: "Key", analyze_competitors: "Users",
    check_trends: "TrendingUp", seo_analysis: "Search", geo_analysis: "Bot",
    draft_response: "PenLine", knowledge_lookup: "BookOpen",
  };
  return iconMap[toolIcons[toolName] ?? "Search"] ?? Search;
}

export function AgentToolCall({ toolCall }: { toolCall: Doc<"agentToolCalls"> }) {
  const [isOpen, setIsOpen] = useState(false);
  const Icon = getToolIcon(toolCall.toolName);

  const statusColor = toolCall.status === "running" ? "var(--accent)" : toolCall.status === "completed" ? "var(--success)" : toolCall.status === "failed" ? "var(--destructive)" : "var(--fg-muted)";
  const StatusIcon = toolCall.status === "running" ? Loader2 : toolCall.status === "completed" ? CheckCircle2 : toolCall.status === "failed" ? XCircle : Loader2;

  const duration = toolCall.completedAt && toolCall.startedAt ? `${((toolCall.completedAt - toolCall.startedAt) / 1000).toFixed(1)}s` : null;

  return (
    <div>
      <button onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition-all duration-200 cursor-pointer"
        style={{ background: "var(--bg-glass)", border: "1px solid var(--border-subtle)" }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-glass-hover)")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "var(--bg-glass)")}
      >
        <ChevronRight className="h-3.5 w-3.5 transition-transform duration-200"
          style={{ color: "var(--fg-muted)", transform: isOpen ? "rotate(90deg)" : "rotate(0deg)" }}
        />
        <Icon className="h-4 w-4" style={{ color: "var(--fg-muted)" }} />
        <span className="font-medium capitalize" style={{ color: "var(--fg)" }}>{toolCall.toolName.replace(/_/g, " ")}</span>
        <div className="ml-auto flex items-center gap-2">
          {duration && <span className="text-xs" style={{ color: "var(--fg-muted)" }}>{duration}</span>}
          <StatusIcon className={`h-3.5 w-3.5 ${toolCall.status === "running" ? "animate-spin" : ""}`} style={{ color: statusColor }} />
        </div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }} className="overflow-hidden"
          >
            <div className="ml-6 mt-1 space-y-1 rounded-xl p-3 text-xs font-mono"
              style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-subtle)" }}
            >
              <div>
                <span className="font-semibold" style={{ color: "var(--fg-muted)" }}>Input: </span>
                <code className="break-all" style={{ color: "var(--fg-secondary)" }}>{toolCall.input}</code>
              </div>
              {toolCall.output && (
                <div>
                  <span className="font-semibold" style={{ color: "var(--fg-muted)" }}>Output: </span>
                  <code className="break-all whitespace-pre-wrap" style={{ color: "var(--fg-secondary)" }}>
                    {toolCall.output.slice(0, 500)}{toolCall.output.length > 500 && "..."}
                  </code>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

