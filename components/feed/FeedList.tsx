"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { PostCard } from "./PostCard";
import { InfiniteScroll } from "@/components/shared/InfiniteScroll";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "../../convex/_generated/api";

interface FeedListProps {
  posts: Array<any>;
  isLoading?: boolean;
}

const PAGE_SIZE = 8;

function PostSkeleton() {
  return (
    <div className="glass rounded-xl p-4 space-y-3">
      <div className="flex items-center gap-2.5">
        <Skeleton className="size-8 rounded-full" />
        <div className="space-y-1.5">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-2 w-16" />
        </div>
      </div>
      <Skeleton className="h-5 w-3/4" />
      <div className="space-y-1.5">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-12" />
      </div>
    </div>
  );
}

export function FeedList({ posts, isLoading }: FeedListProps) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const toggleLike = useMutation(api.posts.toggleLike);
  const toggleBookmark = useMutation(api.bookmarks.toggleBookmark);
  const likedPostIds = useQuery(api.posts.getLikedPostIds, {}) ?? [];
  const bookmarkedPostIds = useQuery(api.bookmarks.getBookmarkedPostIds, {}) ?? [];
  const likedSet = useMemo(() => new Set(likedPostIds), [likedPostIds]);
  const bookmarkedSet = useMemo(() => new Set(bookmarkedPostIds), [bookmarkedPostIds]);

  const visiblePosts = useMemo(() => posts.slice(0, visibleCount), [posts, visibleCount]);
  const hasMore = visibleCount < posts.length;

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <PostSkeleton key={index} />
        ))}
      </div>
    );
  }

  return (
    <InfiniteScroll
      onLoadMore={() => setVisibleCount((current) => Math.min(current + PAGE_SIZE, posts.length))}
      hasMore={hasMore}
      isLoading={false}
    >
      <div className="space-y-4" data-testid="feed-list" role="feed" aria-label="Posts feed">
        {visiblePosts.map((post) => {
          const postId = post._id;

          return (
            <PostCard
              key={postId}
              post={post}
              liked={likedSet.has(postId)}
              bookmarked={bookmarkedSet.has(postId)}
              likeCount={post.likes}
              onLike={() => {
                void toggleLike({ postId });
              }}
              onBookmark={() => {
                void toggleBookmark({ targetId: postId, targetType: "post" });
              }}
            />
          );
        })}
      </div>
    </InfiniteScroll>
  );
}
