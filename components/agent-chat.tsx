"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { AgentMessage } from "@/components/agent-message";
import { AgentInput } from "@/components/agent-input";
import { Bot, ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export function AgentChat() {
  const projects = useQuery(api.projects.listMyProjects);
  const [selectedProjectId, setSelectedProjectId] = useState<Id<"projects"> | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const runs = useQuery(api.agent.listRuns, selectedProjectId ? { projectId: selectedProjectId } : "skip");
  const createRun = useMutation(api.agent.createRun);
  const runAgent = useAction(api.agent.runAgent);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setDropdownOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [runs]);

  const handleSubmit = async (prompt: string) => {
    if (!selectedProjectId) return;
    setIsRunning(true);
    try {
      const runId = await createRun({ projectId: selectedProjectId, prompt });
      await runAgent({ runId, projectId: selectedProjectId, prompt });
    } catch (e) { console.error("Agent run failed:", e); }
    finally { setIsRunning(false); }
  };

  const selectedProject = projects?.find((p) => p._id === selectedProjectId);

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Project selector */}
      <div className="pb-4 shrink-0" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium" style={{ color: "var(--fg-muted)" }}>Project:</label>
          <div ref={dropdownRef} className="relative">
            <button onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-200 cursor-pointer min-w-[200px]"
              style={{ background: "var(--bg-glass)", border: "1px solid var(--border-color)", color: "var(--fg)" }}
            >
              <span className="flex-1 text-left truncate">{selectedProject?.name ?? "Select a project..."}</span>
              <ChevronDown className="h-4 w-4 shrink-0" style={{ color: "var(--fg-muted)" }} />
            </button>
            <AnimatePresence>
              {dropdownOpen && (
                <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.15 }}
                  className="absolute top-full left-0 right-0 mt-1 rounded-xl p-1 z-50"
                  style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", boxShadow: "var(--shadow-lg)" }}
                >
                  {projects?.map((p) => (
                    <button key={p._id} onClick={() => { setSelectedProjectId(p._id); setDropdownOpen(false); }}
                      className="w-full text-left px-3 py-2 rounded-lg text-sm transition-colors duration-150 cursor-pointer"
                      style={{ color: p._id === selectedProjectId ? "var(--accent)" : "var(--fg)" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-card-hover)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >{p.name}</button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-6 space-y-6">
        {!selectedProjectId ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="h-14 w-14 rounded-2xl flex items-center justify-center mb-4 animate-float" style={{ background: "var(--accent-subtle)" }}>
              <Bot className="h-6 w-6" style={{ color: "var(--accent)" }} />
            </div>
            <p className="text-lg font-semibold" style={{ color: "var(--fg)" }}>Select a project to start</p>
            <p className="text-sm" style={{ color: "var(--fg-muted)" }}>Choose a project above to begin chatting with the growth agent</p>
          </div>
        ) : runs && runs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="h-14 w-14 rounded-2xl flex items-center justify-center mb-4 animate-float" style={{ background: "var(--accent-subtle)" }}>
              <Bot className="h-6 w-6" style={{ color: "var(--accent)" }} />
            </div>
            <p className="text-lg font-semibold" style={{ color: "var(--fg)" }}>Ask me anything</p>
            <p className="text-sm text-center max-w-md" style={{ color: "var(--fg-muted)" }}>
              I can search Reddit, analyze keywords, discover competitors, check trends, and more.
            </p>
          </div>
        ) : (
          <>
            {runs?.map((run) => <AgentMessage key={run._id} run={run} />)}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="pt-4 shrink-0" style={{ borderTop: "1px solid var(--border-subtle)" }}>
        <AgentInput onSubmit={handleSubmit} isRunning={isRunning} disabled={!selectedProjectId} />
      </div>
    </div>
  );
}

