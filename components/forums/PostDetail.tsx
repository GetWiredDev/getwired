"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { Heart, Bookmark, Share2, Eye, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { UserAvatar } from "@/components/shared/Avatar";
import { RankBadge } from "@/components/shared/Badge";
import { ForumsLink } from "@/components/forums/ForumsNavigation";
import { useAppAuth } from "@/lib/auth";
import { toast } from "sonner";
import { api } from "../../convex/_generated/api";

function formatTimeAgo(ts: number) {
  const diff = Date.now() - ts;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function PostDetail({ postId }: { postId: string }) {
  const post = useQuery(api.posts.getDetailedById, { postId: postId as never });
  const relatedSource = useQuery(
    api.posts.listDetailed,
    post?.category ? { category: post.category, limit: 4 } : "skip",
  );
  const { isSignedIn, signIn } = useAppAuth();
  const toggleLike = useMutation(api.posts.toggleLike);
  const toggleBookmark = useMutation(api.bookmarks.toggleBookmark);
  const likedPostIds = useQuery(api.posts.getLikedPostIds, isSignedIn ? {} : "skip") ?? [];
  const bookmarkedPostIds = useQuery(api.bookmarks.getBookmarkedPostIds, isSignedIn ? {} : "skip") ?? [];
  const liked = likedPostIds.includes(postId as never);
  const bookmarked = bookmarkedPostIds.includes(postId);

  const relatedPosts = useMemo(
    () => (relatedSource ?? []).filter((candidate) => candidate._id !== postId).slice(0, 3),
    [postId, relatedSource],
  );

  if (post === undefined) {
    return null;
  }

  if (!post) {
    return null;
  }

  return (
    <div className="space-y-6" data-testid="post-detail">
      <div className="glass rounded-xl p-6">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {post.categoryInfo && (
            <ForumsLink href={`/forums/${post.categoryInfo.slug}`}>
              <Badge
                variant="secondary"
                className="text-[10px]"
                style={{
                  color: post.categoryInfo.color,
                  borderColor: `${post.categoryInfo.color}30`,
                }}
              >
                {post.categoryInfo.name}
              </Badge>
            </ForumsLink>
          )}
          {post.tags.map((tag: string) => (
            <Badge key={tag} variant="secondary" className="text-[10px]">
              #{tag}
            </Badge>
          ))}
          {post.isPinned && (
            <Badge className="border-[#3B82F6]/30 bg-[#3B82F6]/10 text-[10px] text-[#3B82F6]">
              📌 Pinned
            </Badge>
          )}
        </div>

        <h1 className="mb-4 text-xl font-bold text-foreground">{post.title}</h1>

        <div className="mb-6 flex items-center gap-3">
          <Link href={`/profile/${post.author.username}`} className="shrink-0">
            <UserAvatar src={post.author.avatar} name={post.author.name} size="md" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <Link
                href={`/profile/${post.author.username}`}
                className="text-sm font-medium text-foreground transition-colors hover:text-[#3B82F6]"
              >
                {post.author.name}
              </Link>
              <RankBadge rank={post.author.rank} />
            </div>
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
              <span>{formatTimeAgo(post.createdAt)}</span>
              <span>·</span>
              <span className="flex items-center gap-0.5">
                <Eye className="size-3" /> {post.views.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        <div className="prose prose-invert max-w-none whitespace-pre-wrap text-sm text-foreground/90">
          {post.content}
        </div>

        <Separator className="my-6" />

        <div className="flex items-center gap-2">
          <Button
            variant={liked ? "secondary" : "ghost"}
            size="sm"
            onClick={() => {
              if (!isSignedIn) {
                toast.error("Sign in required", {
                  description: "You need to sign in to like posts.",
                  action: { label: "Sign In", onClick: signIn },
                });
                return;
              }
              void toggleLike({ postId: postId as never });
            }}
            className={`gap-1.5 ${liked ? "text-red-400" : ""}`}
            data-testid="post-detail-like-button"
            aria-label={liked ? "Unlike post" : "Like post"}
            aria-pressed={liked}
          >
            <Heart className={`size-3.5 ${liked ? "fill-current" : ""}`} />
            {post.likes}
          </Button>
          <Button variant="ghost" size="sm" className="gap-1.5" data-testid="post-detail-comment-count">
            <MessageSquare className="size-3.5" />
            {post.commentCount}
          </Button>
          <Button
            variant={bookmarked ? "secondary" : "ghost"}
            size="sm"
            onClick={() => {
              if (!isSignedIn) {
                toast.error("Sign in required", {
                  description: "You need to sign in to bookmark posts.",
                  action: { label: "Sign In", onClick: signIn },
                });
                return;
              }
              void toggleBookmark({ targetId: postId, targetType: "post" });
            }}
            className={`gap-1.5 ${bookmarked ? "text-[#3B82F6]" : ""}`}
            data-testid="post-detail-bookmark-button"
            aria-label={bookmarked ? "Remove bookmark" : "Bookmark post"}
            aria-pressed={bookmarked}
          >
            <Bookmark className={`size-3.5 ${bookmarked ? "fill-current" : ""}`} />
            Save
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5"
            data-testid="post-detail-share-button"
            aria-label="Share post"
            onClick={() => {
              const url = window.location.href;
              if (navigator.share) {
                void navigator.share({ title: post.title, url });
              } else {
                void navigator.clipboard.writeText(url);
                toast.success("Link copied to clipboard!");
              }
            }}
          >
            <Share2 className="size-3.5" />
            Share
          </Button>
        </div>
      </div>

      {relatedPosts.length > 0 && (
        <div className="glass rounded-xl p-5" data-testid="related-posts">
          <h3 className="mb-3 text-sm font-semibold text-foreground">Related Posts</h3>
          <div className="space-y-3">
            {relatedPosts.map((relatedPost) => (
              <ForumsLink
                key={relatedPost._id}
                href={`/forums/${relatedPost.category ?? "off-topic"}/${relatedPost._id}`}
                className="group block"
              >
                <div className="rounded-lg p-3 transition-colors hover:bg-accent">
                  <h4 className="line-clamp-2 text-xs font-medium text-foreground transition-colors group-hover:text-[#3B82F6]">
                    {relatedPost.title}
                  </h4>
                  <div className="mt-1.5 flex items-center gap-2 text-[10px] text-muted-foreground">
                    <span>{relatedPost.author.name}</span>
                    <span>·</span>
                    <span className="flex items-center gap-0.5">
                      <Heart className="size-2.5" /> {relatedPost.likes}
                    </span>
                    <span className="flex items-center gap-0.5">
                      <MessageSquare className="size-2.5" /> {relatedPost.commentCount}
                    </span>
                  </div>
                </div>
              </ForumsLink>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
