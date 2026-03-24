"use client";

import { useState } from "react";
import { useQuery, useAction } from "convex/react";
import { useParams } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { RedditPostCard } from "@/components/reddit-post-card";
import { RedditFilters } from "@/components/reddit-filters";
import { Loader2, Search, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";

const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } } };

export default function RedditPage() {
  const params = useParams();
  const projectId = params.projectId as Id<"projects">;
  const posts = useQuery(api.reddit.listByProject, { projectId });
  const keywords = useQuery(api.keywords.listByProject, { projectId });
  const searchReddit = useAction(api.reddit.searchReddit);
  const [isSearching, setIsSearching] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [minRelevance, setMinRelevance] = useState(0);

  const handleSearch = async () => {
    if (!keywords) return;
    setIsSearching(true);
    try {
      const trackedKeywords = keywords.filter((k) => k.tracked).map((k) => k.keyword).slice(0, 10);
      await searchReddit({ projectId, keywords: trackedKeywords });
    } catch (e) { console.error("Reddit search failed:", e); }
    finally { setIsSearching(false); }
  };

  const filteredPosts = (posts ?? [])
    .filter((p) => statusFilter === "all" || p.status === statusFilter)
    .filter((p) => p.relevanceScore >= minRelevance)
    .sort((a, b) => b.relevanceScore - a.relevanceScore);

  return (
    <motion.div className="space-y-6" initial="hidden" animate="show" variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}>
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--fg)" }}>Reddit Intelligence</h1>
          <p className="text-sm mt-1" style={{ color: "var(--fg-secondary)" }}>Discover and respond to relevant Reddit discussions</p>
        </div>
        <button onClick={handleSearch} disabled={isSearching}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-all duration-200 hover:scale-105 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
          style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-hover))" }}
        >
          {isSearching ? <><Loader2 className="h-4 w-4 animate-spin" /> Searching...</> : <><Search className="h-4 w-4" /> Search Reddit</>}
        </button>
      </motion.div>

      <motion.div variants={fadeUp}>
        <RedditFilters statusFilter={statusFilter} onStatusChange={(v) => setStatusFilter(v ?? "all")} minRelevance={minRelevance} onRelevanceChange={setMinRelevance} />
      </motion.div>

      {posts === undefined ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card rounded-2xl p-5 animate-pulse">
              <div className="h-4 rounded-lg w-3/4 mb-2" style={{ background: "var(--border-color)" }} />
              <div className="h-3 rounded-lg w-1/2" style={{ background: "var(--border-subtle)" }} />
            </div>
          ))}
        </div>
      ) : filteredPosts.length === 0 ? (
        <motion.div variants={fadeUp}>
          <div className="card-dashed rounded-2xl p-12 flex flex-col items-center justify-center text-center">
            <div className="h-14 w-14 rounded-2xl flex items-center justify-center mb-5 animate-float" style={{ background: "var(--accent-subtle)" }}>
              <MessageSquare className="h-6 w-6" style={{ color: "var(--accent)" }} />
            </div>
            <h3 className="text-base font-semibold mb-2" style={{ color: "var(--fg)" }}>No Reddit posts found</h3>
            <p className="text-sm max-w-md" style={{ color: "var(--fg-secondary)" }}>
              Click &quot;Search Reddit&quot; to find relevant discussions for your keywords.
            </p>
          </div>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {filteredPosts.map((post) => <RedditPostCard key={post._id} post={post} />)}
        </div>
      )}
    </motion.div>
  );
}

