"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, ThumbsUp, Eye, ArrowRight } from "lucide-react";

interface PostItem {
  title: string;
  category?: string;
  likes: number;
  commentCount: number;
  views: number;
  createdAt: number;
}

interface CommentItem {
  content: string;
  postTitle: string;
  likes: number;
  createdAt: number;
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

interface ActivityFeedProps {
  posts: PostItem[];
  comments: CommentItem[];
  mode?: "posts" | "comments" | "all";
}

export function ActivityFeed({ posts, comments, mode = "all" }: ActivityFeedProps) {
  const showPosts = mode === "all" || mode === "posts";
  const showComments = mode === "all" || mode === "comments";

  return (
    <div className="space-y-6">
      {showPosts && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">
              Recent Posts
              <span className="text-sm font-normal text-muted-foreground ml-2">({posts.length})</span>
            </h3>
            {mode === "all" && posts.length > 3 && (
              <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">
                View all <ArrowRight className="size-3 ml-1" />
              </Button>
            )}
          </div>

          {posts.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">No posts yet.</p>
          ) : (
            <div className="space-y-2">
              {(mode === "all" ? posts.slice(0, 3) : posts).map((post, i) => (
                <Card key={i} className="glass border-white/5">
                  <CardContent className="py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <h4 className="font-medium text-foreground text-sm truncate">{post.title}</h4>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          {post.category && (
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                              {post.category}
                            </Badge>
                          )}
                          <span className="flex items-center gap-1">
                            <ThumbsUp className="size-3" />
                            {post.likes}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="size-3" />
                            {post.commentCount}
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="size-3" />
                            {post.views}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">{timeAgo(post.createdAt)}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {showComments && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">
              Recent Comments
              <span className="text-sm font-normal text-muted-foreground ml-2">({comments.length})</span>
            </h3>
            {mode === "all" && comments.length > 3 && (
              <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">
                View all <ArrowRight className="size-3 ml-1" />
              </Button>
            )}
          </div>

          {comments.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">No comments yet.</p>
          ) : (
            <div className="space-y-2">
              {(mode === "all" ? comments.slice(0, 3) : comments).map((comment, i) => (
                <Card key={i} className="glass border-white/5">
                  <CardContent className="py-3">
                    <p className="text-sm text-foreground/80 line-clamp-2">{comment.content}</p>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                      <span className="truncate">on &ldquo;{comment.postTitle}&rdquo;</span>
                      <span className="flex items-center gap-1 shrink-0">
                        <ThumbsUp className="size-3" />
                        {comment.likes}
                      </span>
                      <span className="shrink-0">{timeAgo(comment.createdAt)}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

