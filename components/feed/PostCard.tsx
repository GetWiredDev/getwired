"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import Link from "next/link";
import { Heart, MessageCircle, Eye, Bookmark, Sparkles, MessagesSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "@/components/shared/Avatar";
import { RankBadge } from "@/components/shared/Badge";
import { ShareButtons } from "@/components/shared/ShareButtons";
import { TagList } from "@/components/shared/TagList";
import { Poll } from "@/components/shared/Poll";

interface PostCardProps {
  post: any;
  liked: boolean;
  bookmarked: boolean;
  likeCount: number;
  onLike: () => void;
  onBookmark: () => void;
  onOpenPost: () => void;
}

function formatRelativeTime(timestamp: number) {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export function PostCard({ post, liked, bookmarked, likeCount, onLike, onBookmark, onOpenPost }: PostCardProps) {
  const contentPreview = post.content.length > 200 ? `${post.content.slice(0, 200)}...` : post.content;
  const postUrl = `/forums/${post.category ?? "off-topic"}/${post._id}`;
  const isForumThread = Boolean(post.category);
  const categoryLabel = post.categoryInfo?.name ?? post.category?.replace(/-/g, " ");

  return (
    <article className="glass group rounded-xl p-4 transition-all duration-200 hover:border-[#3B82F6]/20 hover:glow-green-sm" data-testid="post-card" aria-label={`Post by ${post.author.name}`}>
      {post.isBoosted && (
        <div className="mb-2 flex items-center gap-1.5 text-[10px] text-amber-400/70">
          <Sparkles className="size-3" />
          <span>Promoted</span>
        </div>
      )}

      <div className="mb-3 flex items-center gap-2.5">
        <Link href={`/profile/${post.author.username}`} className="shrink-0">
          <UserAvatar src={post.author.avatar} name={post.author.name} size="md" />
        </Link>
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <Link
            href={`/profile/${post.author.username}`}
            className="min-w-0 truncate text-sm font-medium text-foreground transition-colors hover:text-[#3B82F6]"
          >
            {post.author.name}
          </Link>
          <RankBadge rank={post.author.rank} />
          <span className="ml-auto shrink-0 text-xs text-muted-foreground">
            {formatRelativeTime(post.createdAt)}
          </span>
        </div>
      </div>

      {isForumThread ? (
        <Link href={postUrl} className="mb-3 block">
          <div className="mb-2 flex flex-wrap items-center gap-1.5">
            <Badge
              variant="secondary"
              className="border-[#3B82F6]/30 bg-[#3B82F6]/10 text-[10px] text-[#3B82F6]"
            >
              <MessagesSquare className="mr-1 size-3" />
              Forum Thread
            </Badge>
            {categoryLabel && (
              <Badge variant="secondary" className="text-[10px] capitalize">
                {categoryLabel}
              </Badge>
            )}
          </div>
          {post.title && (
            <h3 className="mb-1 line-clamp-2 text-sm font-semibold text-foreground transition-colors group-hover:text-[#3B82F6]">
              {post.title}
            </h3>
          )}
          <p className="line-clamp-4 text-sm leading-relaxed text-muted-foreground group-hover:text-foreground transition-colors">
            {contentPreview}
          </p>
        </Link>
      ) : (
        <button type="button" onClick={onOpenPost} className="mb-3 block w-full text-left">
          <div className="mb-2 flex flex-wrap items-center gap-1.5">
            <Badge variant="secondary" className="text-[10px]">
              Social Post
            </Badge>
          </div>
          <p className="line-clamp-4 text-sm leading-relaxed text-muted-foreground transition-colors group-hover:text-foreground">
            {contentPreview}
          </p>
        </button>
      )}

      {post.poll && (
        <div className="mb-3">
          <Poll pollId={post.poll._id} question={post.poll.question} options={post.poll.options} />
        </div>
      )}

      {post.tags.length > 0 && (
        <div className="mb-3">
          <TagList tags={post.tags.slice(0, 3)} size="sm" />
        </div>
      )}

      <div className="-ml-1 flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={onLike}
          className={liked ? "text-red-400" : "text-muted-foreground hover:text-red-400"}
          data-testid="post-like-button"
          aria-label={liked ? "Unlike post" : "Like post"}
          aria-pressed={liked}
        >
          <Heart className={`size-3.5 ${liked ? "fill-current" : ""}`} />
        </Button>
        <span className="mr-2 text-xs text-muted-foreground" data-testid="post-like-count">{likeCount}</span>

        {isForumThread ? (
          <Link
            href={postUrl}
            className="inline-flex size-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            data-testid="post-comments-link"
            aria-label={`${post.commentCount} comments`}
          >
            <MessageCircle className="size-3.5" />
          </Link>
        ) : (
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={onOpenPost}
            className="text-muted-foreground hover:text-foreground"
            data-testid="post-comments-link"
            aria-label={`${post.commentCount} comments`}
          >
            <MessageCircle className="size-3.5" />
          </Button>
        )}
        <span className="mr-2 text-xs text-muted-foreground" data-testid="post-comment-count">{post.commentCount}</span>

        <Eye className="size-3.5 text-muted-foreground" />
        <span className="mr-2 text-xs text-muted-foreground" data-testid="post-view-count">{post.views.toLocaleString()}</span>

        <div className="ml-auto flex items-center gap-0.5">
          <ShareButtons url={postUrl} title={post.title} />
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={onBookmark}
            className={bookmarked ? "text-[#3B82F6]" : "text-muted-foreground hover:text-[#3B82F6]"}
            data-testid="post-bookmark-button"
            aria-label={bookmarked ? "Remove bookmark" : "Bookmark post"}
            aria-pressed={bookmarked}
          >
            <Bookmark className={`size-3.5 ${bookmarked ? "fill-current" : ""}`} />
          </Button>
        </div>
      </div>
    </article>
  );
}
