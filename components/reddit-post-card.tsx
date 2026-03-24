"use client";

import { Doc } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ArrowUpRight, MessageSquare, ThumbsUp, Eye, X } from "lucide-react";
import { motion } from "framer-motion";

function getRelevanceColor(score: number) {
  if (score >= 70) return "var(--success)";
  if (score >= 40) return "var(--warning)";
  return "var(--fg-muted)";
}

function timeAgo(utcSeconds: number): string {
  const diff = Date.now() / 1000 - utcSeconds;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

interface RedditPostCardProps {
  post: Doc<"redditPosts">;
  onDraftResponse?: (postId: Doc<"redditPosts">["_id"]) => void;
}

function SmallBtn({ onClick, children, variant = "default" }: { onClick: () => void; children: React.ReactNode; variant?: "default" | "ghost" }) {
  return (
    <button onClick={onClick}
      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer"
      style={{
        background: variant === "default" ? "var(--accent-subtle)" : "transparent",
        color: variant === "default" ? "var(--accent)" : "var(--fg-muted)",
        border: variant === "ghost" ? "none" : "1px solid var(--border-color)",
      }}
    >{children}</button>
  );
}

export function RedditPostCard({ post, onDraftResponse }: RedditPostCardProps) {
  const updateStatus = useMutation(api.reddit.updatePostStatus);
  const relColor = getRelevanceColor(post.relevanceScore);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="card rounded-2xl p-5 transition-all duration-200"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-md" style={{ background: "var(--accent-subtle)", color: "var(--accent)" }}>
              r/{post.subreddit}
            </span>
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-md" style={{ background: `color-mix(in srgb, ${relColor} 15%, transparent)`, color: relColor }}>
              {post.relevanceScore}% relevant
            </span>
            <span className="text-[11px] font-medium capitalize" style={{ color: "var(--fg-muted)" }}>{post.status}</span>
          </div>
          <h3 className="text-sm font-semibold leading-snug" style={{ color: "var(--fg)" }}>{post.title}</h3>
        </div>
        <a href={post.url} target="_blank" rel="noopener noreferrer" className="shrink-0 p-1.5 rounded-lg transition-colors duration-150"
          style={{ color: "var(--fg-muted)" }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "var(--accent)"; e.currentTarget.style.background = "var(--bg-card-hover)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "var(--fg-muted)"; e.currentTarget.style.background = "transparent"; }}
        >
          <ArrowUpRight className="h-4 w-4" />
        </a>
      </div>

      {post.selfText && <p className="text-sm line-clamp-2 mb-3" style={{ color: "var(--fg-secondary)" }}>{post.selfText}</p>}

      <div className="flex items-center gap-4 text-xs mb-4" style={{ color: "var(--fg-muted)" }}>
        <span className="flex items-center gap-1"><ThumbsUp className="h-3 w-3" /> {post.score}</span>
        <span className="flex items-center gap-1"><MessageSquare className="h-3 w-3" /> {post.numComments}</span>
        <span>{timeAgo(post.createdUtc)}</span>
      </div>

      {post.suggestedResponse && (
        <div className="rounded-xl p-3 text-xs mb-4" style={{ background: "var(--bg-glass)", border: "1px solid var(--border-subtle)" }}>
          <p className="font-semibold mb-1" style={{ color: "var(--fg)" }}>Suggested Response:</p>
          <p className="line-clamp-2" style={{ color: "var(--fg-secondary)" }}>{post.suggestedResponse}</p>
        </div>
      )}

      <div className="flex gap-2">
        {onDraftResponse && post.status !== "responded" && (
          <SmallBtn onClick={() => onDraftResponse(post._id)}>Draft Response</SmallBtn>
        )}
        {post.status === "new" && (
          <SmallBtn onClick={() => updateStatus({ postId: post._id, status: "reviewed" })}><Eye className="h-3 w-3" /> Mark Reviewed</SmallBtn>
        )}
        {post.status !== "dismissed" && (
          <SmallBtn variant="ghost" onClick={() => updateStatus({ postId: post._id, status: "dismissed" })}><X className="h-3 w-3" /> Dismiss</SmallBtn>
        )}
      </div>
    </motion.div>
  );
}

