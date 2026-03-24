"use client";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { Trash2, Pencil, BookOpen } from "lucide-react";
import { motion } from "framer-motion";

const CATEGORY_LABELS: Record<string, string> = {
  product: "Product Info", faq: "FAQ", messaging: "Messaging", competitor_diff: "Competitor Diff",
};

interface KnowledgeListProps {
  entries: Doc<"knowledgeBase">[];
  onEdit?: (entry: Doc<"knowledgeBase">) => void;
}

export function KnowledgeList({ entries, onEdit }: KnowledgeListProps) {
  const remove = useMutation(api.knowledgeBase.remove);

  if (entries.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="h-12 w-12 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "var(--accent-subtle)" }}>
          <BookOpen className="h-5 w-5" style={{ color: "var(--accent)" }} />
        </div>
        <p className="text-sm" style={{ color: "var(--fg-muted)" }}>
          No knowledge base entries yet. Add product info, FAQs, and messaging guidelines.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {entries.map((entry) => (
        <motion.div key={entry._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="card rounded-xl p-4 transition-all duration-200"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-semibold" style={{ color: "var(--fg)" }}>{entry.title}</h4>
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-md" style={{ background: "var(--accent-subtle)", color: "var(--accent)" }}>
                {CATEGORY_LABELS[entry.category] ?? entry.category}
              </span>
            </div>
            <div className="flex gap-1">
              {onEdit && (
                <button onClick={() => onEdit(entry)} className="p-1.5 rounded-lg transition-colors duration-150 cursor-pointer"
                  style={{ color: "var(--fg-muted)" }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "var(--bg-card-hover)"; e.currentTarget.style.color = "var(--accent)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--fg-muted)"; }}
                ><Pencil className="h-3.5 w-3.5" /></button>
              )}
              <button onClick={() => remove({ entryId: entry._id })} className="p-1.5 rounded-lg transition-colors duration-150 cursor-pointer"
                style={{ color: "var(--fg-muted)" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "var(--bg-card-hover)"; e.currentTarget.style.color = "var(--destructive)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--fg-muted)"; }}
              ><Trash2 className="h-3.5 w-3.5" /></button>
            </div>
          </div>
          <p className="text-sm line-clamp-3" style={{ color: "var(--fg-secondary)" }}>{entry.content}</p>
          <p className="text-[11px] mt-2" style={{ color: "var(--fg-muted)" }}>Updated {new Date(entry.updatedAt).toLocaleDateString()}</p>
        </motion.div>
      ))}
    </div>
  );
}

