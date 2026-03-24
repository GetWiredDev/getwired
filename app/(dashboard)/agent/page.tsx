"use client";

import { AgentChat } from "@/components/agent-chat";
import { motion } from "framer-motion";

export default function AgentPage() {
  return (
    <motion.div
      className="flex flex-col flex-1 min-h-0 max-w-4xl"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" as const }}
    >
      <div className="mb-4">
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--fg)" }}>Growth Agent</h1>
        <p className="text-sm mt-1" style={{ color: "var(--fg-secondary)" }}>AI-powered growth analysis and recommendations</p>
      </div>
      <AgentChat />
    </motion.div>
  );
}

