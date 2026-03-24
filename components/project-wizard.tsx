"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { Loader2, Globe, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export function ProjectWizard() {
  const [url, setUrl] = useState("");
  const [name, setName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const createProject = useMutation(api.projects.create);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    let normalizedUrl = url.trim();
    if (!normalizedUrl.startsWith("http")) normalizedUrl = `https://${normalizedUrl}`;
    try { new URL(normalizedUrl); } catch { setError("Please enter a valid URL"); return; }
    const projectName = name.trim() || new URL(normalizedUrl).hostname.replace("www.", "");
    setIsCreating(true);
    try {
      const projectId = await createProject({ name: projectName, url: normalizedUrl });
      router.push(`/projects/${projectId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create project");
      setIsCreating(false);
    }
  };

  const inputStyle = {
    background: "var(--bg-glass)",
    border: "1px solid var(--border-color)",
    color: "var(--fg)",
    borderRadius: "var(--radius)",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-lg mx-auto"
    >
      <div className="card rounded-2xl p-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-10 w-10 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-hover))" }}>
            <Globe className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-lg font-semibold" style={{ color: "var(--fg)" }}>New Project</h2>
        </div>
        <p className="text-sm mb-6" style={{ color: "var(--fg-secondary)" }}>
          Enter your website URL and we&apos;ll extract keywords, discover competitors, and find growth opportunities.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="url" className="text-sm font-medium" style={{ color: "var(--fg)" }}>Website URL</label>
            <input id="url" type="text" placeholder="https://example.com" value={url}
              onChange={(e) => setUrl(e.target.value)} disabled={isCreating} required
              className="w-full px-4 py-3 text-sm outline-none transition-all duration-200 focus:ring-2 disabled:opacity-50"
              style={{ ...inputStyle, "--tw-ring-color": "var(--accent)" } as React.CSSProperties}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium" style={{ color: "var(--fg)" }}>
              Project Name <span style={{ color: "var(--fg-muted)" }}>(optional)</span>
            </label>
            <input id="name" type="text" placeholder="Auto-generated from domain" value={name}
              onChange={(e) => setName(e.target.value)} disabled={isCreating}
              className="w-full px-4 py-3 text-sm outline-none transition-all duration-200 focus:ring-2 disabled:opacity-50"
              style={{ ...inputStyle, "--tw-ring-color": "var(--accent)" } as React.CSSProperties}
            />
          </div>

          {error && (
            <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
              className="text-sm font-medium" style={{ color: "var(--destructive)" }}
            >{error}</motion.p>
          )}

          <button type="submit" disabled={isCreating || !url.trim()}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 cursor-pointer"
            style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-hover))" }}
          >
            {isCreating ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Scanning Website...</>
            ) : (
              <>Scan Website <ArrowRight className="h-4 w-4" /></>
            )}
          </button>
        </form>
      </div>
    </motion.div>
  );
}

