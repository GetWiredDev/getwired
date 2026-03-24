"use client";

import { useState } from "react";
import { Send, Loader2 } from "lucide-react";

interface AgentInputProps {
  onSubmit: (prompt: string) => Promise<void>;
  isRunning: boolean;
  disabled?: boolean;
}

export function AgentInput({ onSubmit, isRunning, disabled }: AgentInputProps) {
  const [prompt, setPrompt] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isRunning || disabled) return;
    const text = prompt.trim();
    setPrompt("");
    await onSubmit(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-3 items-end">
      <div className="flex-1 relative">
        <textarea
          placeholder={disabled ? "Select a project first..." : "Ask the agent to analyze your growth..."}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isRunning || disabled}
          rows={2}
          className="w-full px-4 py-3 text-sm rounded-xl outline-none resize-none transition-all duration-200 focus:ring-2 disabled:opacity-50"
          style={{
            background: "var(--bg-glass)",
            border: "1px solid var(--border-color)",
            color: "var(--fg)",
            minHeight: "60px",
            maxHeight: "200px",
            "--tw-ring-color": "var(--accent)",
          } as React.CSSProperties}
        />
      </div>
      <button type="submit" disabled={!prompt.trim() || isRunning || disabled}
        className="shrink-0 h-[52px] w-[52px] rounded-xl flex items-center justify-center text-white transition-all duration-200 hover:scale-105 active:scale-[0.98] disabled:opacity-40 disabled:hover:scale-100 cursor-pointer"
        style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-hover))" }}
      >
        {isRunning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
      </button>
    </form>
  );
}

