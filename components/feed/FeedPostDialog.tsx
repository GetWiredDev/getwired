"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import Link from "next/link";
import { Eye } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { UserAvatar } from "@/components/shared/Avatar";
import { RankBadge } from "@/components/shared/Badge";
import { TagList } from "@/components/shared/TagList";
import { Poll } from "@/components/shared/Poll";
import { CommentTree } from "@/components/forums/CommentTree";

interface FeedPostDialogProps {
  post: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function formatTimeAgo(timestamp: number) {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function FeedPostDialog({ post, open, onOpenChange }: FeedPostDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-hidden p-0 sm:max-w-3xl">
        <DialogTitle className="sr-only">{post.title || "Post discussion"}</DialogTitle>
        <div className="max-h-[90vh] overflow-y-auto p-6">
          <div className="mb-4 flex items-center gap-3">
            <Link href={`/profile/${post.author.username}`} className="shrink-0">
              <UserAvatar src={post.author.avatar} name={post.author.name} size="md" />
            </Link>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <Link
                  href={`/profile/${post.author.username}`}
                  className="min-w-0 truncate text-sm font-medium text-foreground transition-colors hover:text-[#3B82F6]"
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

          {post.title && (
            <h2 className="mb-3 text-lg font-semibold text-foreground">{post.title}</h2>
          )}

          <div className="prose prose-invert mb-4 max-w-none whitespace-pre-wrap text-sm text-foreground/90">
            {post.content}
          </div>

          {post.poll && (
            <div className="mb-4">
              <Poll pollId={post.poll._id} question={post.poll.question} options={post.poll.options} />
            </div>
          )}

          {post.tags.length > 0 && (
            <div className="mb-4 flex items-center gap-2">
              <Badge variant="secondary" className="text-[10px]">
                Social Post
              </Badge>
              <TagList tags={post.tags} size="sm" />
            </div>
          )}

          {post.tags.length === 0 && (
            <div className="mb-4">
              <Badge variant="secondary" className="text-[10px]">
                Social Post
              </Badge>
            </div>
          )}

          <Separator className="mb-4" />

          <CommentTree postId={post._id} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
