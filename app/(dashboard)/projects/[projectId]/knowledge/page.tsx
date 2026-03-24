"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { useParams } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { Id, Doc } from "@/convex/_generated/dataModel";
import { KnowledgeEditor } from "@/components/knowledge-editor";
import { KnowledgeList } from "@/components/knowledge-list";
import { motion } from "framer-motion";

type Category = "product" | "faq" | "messaging" | "competitor_diff";

const categories = [
  { value: "all", label: "All" },
  { value: "product", label: "Product Info" },
  { value: "faq", label: "FAQ" },
  { value: "messaging", label: "Messaging" },
  { value: "competitor_diff", label: "Competitor Diff" },
];

const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } } };

export default function KnowledgePage() {
  const params = useParams();
  const projectId = params.projectId as Id<"projects">;
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [editingEntry, setEditingEntry] = useState<Doc<"knowledgeBase"> | null>(null);

  const entries = useQuery(api.knowledgeBase.listByProject, {
    projectId,
    ...(categoryFilter !== "all" ? { category: categoryFilter as Category } : {}),
  });

  return (
    <motion.div className="space-y-6" initial="hidden" animate="show" variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}>
      <motion.div variants={fadeUp}>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--fg)" }}>Knowledge Base</h1>
        <p className="text-sm mt-1" style={{ color: "var(--fg-secondary)" }}>Add product info and messaging guidelines for AI-powered responses</p>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-[1fr_350px]">
        <div className="space-y-4">
          <motion.div variants={fadeUp} className="flex gap-1.5 flex-wrap">
            {categories.map((c) => (
              <button key={c.value} onClick={() => setCategoryFilter(c.value)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer"
                style={{
                  background: categoryFilter === c.value ? "var(--accent)" : "var(--bg-glass)",
                  color: categoryFilter === c.value ? "white" : "var(--fg-secondary)",
                  border: categoryFilter === c.value ? "1px solid transparent" : "1px solid var(--border-color)",
                }}
              >{c.label}</button>
            ))}
          </motion.div>

          <motion.div variants={fadeUp}>
            {entries === undefined ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="h-24 rounded-xl animate-pulse" style={{ background: "var(--bg-card)" }} />
                ))}
              </div>
            ) : (
              <KnowledgeList entries={entries} onEdit={(entry) => setEditingEntry(entry)} />
            )}
          </motion.div>
        </div>

        <motion.div variants={fadeUp}>
          <KnowledgeEditor projectId={projectId} entry={editingEntry ?? undefined} onComplete={() => setEditingEntry(null)} />
        </motion.div>
      </div>
    </motion.div>
  );
}

