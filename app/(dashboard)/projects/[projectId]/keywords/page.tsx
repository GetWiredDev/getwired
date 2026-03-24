"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { useParams } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { KeywordTable } from "@/components/keyword-table";
import { Plus } from "lucide-react";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

export default function KeywordsPage() {
  const params = useParams();
  const projectId = params.projectId as Id<"projects">;
  const keywords = useQuery(api.keywords.listByProject, { projectId });
  const addKeyword = useMutation(api.keywords.addKeyword);
  const [newKeyword, setNewKeyword] = useState("");

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyword.trim()) return;
    await addKeyword({ projectId, keyword: newKeyword.trim() });
    setNewKeyword("");
  };

  return (
    <motion.div className="space-y-6" initial="hidden" animate="show" variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}>
      <motion.div variants={fadeUp}>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--fg)" }}>Keywords</h1>
        <p className="text-sm mt-1" style={{ color: "var(--fg-secondary)" }}>Manage and analyze your tracked keywords</p>
      </motion.div>

      <motion.form variants={fadeUp} onSubmit={handleAdd} className="flex gap-2 max-w-md">
        <input
          placeholder="Add a keyword..."
          value={newKeyword}
          onChange={(e) => setNewKeyword(e.target.value)}
          className="flex-1 px-4 py-2.5 text-sm rounded-xl outline-none transition-all duration-200 focus:ring-2"
          style={{
            background: "var(--bg-glass)",
            border: "1px solid var(--border-color)",
            color: "var(--fg)",
            "--tw-ring-color": "var(--accent)",
          } as React.CSSProperties}
        />
        <button type="submit" disabled={!newKeyword.trim()}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-all duration-200 hover:scale-105 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
          style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-hover))" }}
        >
          <Plus className="h-4 w-4" /> Add
        </button>
      </motion.form>

      <motion.div variants={fadeUp}>
        {keywords === undefined ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 rounded-xl animate-pulse" style={{ background: "var(--bg-card)" }} />
            ))}
          </div>
        ) : (
          <KeywordTable keywords={keywords} />
        )}
      </motion.div>
    </motion.div>
  );
}

