"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id, Doc } from "@/convex/_generated/dataModel";
import { Loader2 } from "lucide-react";

type Category = "product" | "faq" | "messaging" | "competitor_diff";

const CATEGORIES: { value: Category; label: string }[] = [
  { value: "product", label: "Product Info" },
  { value: "faq", label: "FAQ" },
  { value: "messaging", label: "Messaging Guidelines" },
  { value: "competitor_diff", label: "Competitor Differentiators" },
];

interface KnowledgeEditorProps {
  projectId: Id<"projects">;
  entry?: Doc<"knowledgeBase">;
  onComplete?: () => void;
}

export function KnowledgeEditor({ projectId, entry, onComplete }: KnowledgeEditorProps) {
  const [title, setTitle] = useState(entry?.title ?? "");
  const [content, setContent] = useState(entry?.content ?? "");
  const [category, setCategory] = useState<Category>(entry?.category ?? "product");
  const [isSaving, setIsSaving] = useState(false);

  const create = useMutation(api.knowledgeBase.create);
  const update = useMutation(api.knowledgeBase.update);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    setIsSaving(true);
    try {
      if (entry) { await update({ entryId: entry._id, title, content, category }); }
      else { await create({ projectId, title, content, category }); }
      if (!entry) { setTitle(""); setContent(""); setCategory("product"); }
      onComplete?.();
    } finally { setIsSaving(false); }
  };

  const inputClass = "w-full px-4 py-2.5 text-sm rounded-xl outline-none transition-all duration-200 focus:ring-2";
  const inputStyle = { background: "var(--bg-glass)", border: "1px solid var(--border-color)", color: "var(--fg)", "--tw-ring-color": "var(--accent)" } as React.CSSProperties;

  return (
    <div className="card rounded-2xl p-6 sticky top-20">
      <h3 className="text-base font-semibold mb-4" style={{ color: "var(--fg)" }}>{entry ? "Edit Entry" : "Add Knowledge"}</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium" style={{ color: "var(--fg)" }}>Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Product Overview" required className={inputClass} style={inputStyle} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium" style={{ color: "var(--fg)" }}>Category</label>
          <div className="flex gap-1.5 flex-wrap">
            {CATEGORIES.map((c) => (
              <button key={c.value} type="button" onClick={() => setCategory(c.value)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer"
                style={{
                  background: category === c.value ? "var(--accent)" : "var(--bg-glass)",
                  color: category === c.value ? "white" : "var(--fg-secondary)",
                  border: category === c.value ? "1px solid transparent" : "1px solid var(--border-color)",
                }}
              >{c.label}</button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium" style={{ color: "var(--fg)" }}>Content</label>
          <textarea value={content} onChange={(e) => setContent(e.target.value)}
            placeholder="Describe your product, key features, differentiators..." rows={6} required
            className={`${inputClass} resize-none`} style={inputStyle} />
        </div>
        <button type="submit" disabled={isSaving || !title.trim() || !content.trim()}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 cursor-pointer"
          style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-hover))" }}
        >
          {isSaving ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</> : entry ? "Update" : "Add Entry"}
        </button>
      </form>
    </div>
  );
}

