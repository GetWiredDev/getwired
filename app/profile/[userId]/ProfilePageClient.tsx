"use client";

import { useQuery } from "convex/react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { TechStack } from "@/components/profile/TechStack";
import { TechCV } from "@/components/profile/TechCV";
import { ActivityFeed } from "@/components/profile/ActivityFeed";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppAuth } from "@/lib/auth";
import { api } from "../../../convex/_generated/api";

function ProfileSkeleton() {
  return (
    <main className="space-y-6 px-4 py-6">
      <div className="glass rounded-xl p-6">
        <div className="flex items-start gap-5">
          <Skeleton className="size-20 rounded-full" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-64" />
            <div className="flex gap-3">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-20 rounded-full" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="glass rounded-xl p-4 space-y-3">
          <Skeleton className="h-4 w-24" />
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-6 w-16 rounded-full" />
          ))}
        </div>
        <div className="glass rounded-xl p-4 space-y-3">
          <Skeleton className="h-4 w-32" />
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    </main>
  );
}

export function ProfilePageClient({ userId }: { userId: string }) {
  const { user: currentUser } = useAppAuth();
  const user = useQuery(api.users.getProfileByIdentifier, { identifier: userId });
  const posts = useQuery(
    api.posts.getDetailedByAuthor,
    user ? { authorId: user._id, limit: 50 } : "skip",
  ) ?? [];
  const comments = useQuery(
    api.comments.getByAuthor,
    user ? { authorId: user._id, limit: 50 } : "skip",
  ) ?? [];

  if (user === undefined) {
    return (
      <div className="mx-auto max-w-4xl">
        <ProfileSkeleton />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-4xl">
        <main className="space-y-6 px-4 py-6">
          <p className="text-sm text-muted-foreground">Profile not found.</p>
        </main>
      </div>
    );
  }

  const isOwnProfile = currentUser?.username === user.username;

  return (
    <div className="mx-auto max-w-4xl">
    <main className="space-y-6 px-4 py-6" data-testid="profile-page">
      <ProfileHeader
        user={{
          name: user.name,
          username: user.username,
          avatar: user.avatar,
          bio: user.bio,
          location: user.location,
          website: user.website,
          github: user.github,
          linkedin: user.linkedin,
          twitter: user.twitter,
          rank: user.rank,
          karma: user.karma,
          createdAt: user.createdAt,
          postCount: posts.length,
        }}
        isOwnProfile={isOwnProfile}
      />

      <Tabs defaultValue="overview" data-testid="profile-tabs">
        <TabsList className="h-auto w-full justify-start rounded-full border border-border bg-muted/50 p-1">
          <TabsTrigger value="overview" className="rounded-full px-4 py-1.5 text-xs data-active:bg-[#3B82F6] data-active:text-white data-active:shadow-lg data-active:shadow-blue-500/20" data-testid="profile-tab-overview">
            Overview
          </TabsTrigger>
          <TabsTrigger value="posts" className="rounded-full px-4 py-1.5 text-xs data-active:bg-[#3B82F6] data-active:text-white data-active:shadow-lg data-active:shadow-blue-500/20" data-testid="profile-tab-posts">
            Posts ({posts.length})
          </TabsTrigger>
          <TabsTrigger value="comments" className="rounded-full px-4 py-1.5 text-xs data-active:bg-[#3B82F6] data-active:text-white data-active:shadow-lg data-active:shadow-blue-500/20" data-testid="profile-tab-comments">
            Comments ({comments.length})
          </TabsTrigger>
          <TabsTrigger value="cv" className="rounded-full px-4 py-1.5 text-xs data-active:bg-[#3B82F6] data-active:text-white data-active:shadow-lg data-active:shadow-blue-500/20" data-testid="profile-tab-cv">
            Tech CV
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 gap-6 pt-6 lg:grid-cols-[1fr_1.2fr]">
            <div>
              <TechStack techStack={user.techStack} aiTools={user.aiTools} />
            </div>
            <div>
              <ActivityFeed
                posts={posts.map((post) => ({
                  id: post._id,
                  title: post.title,
                  category: post.categoryInfo?.name ?? post.category,
                  categorySlug: post.category ?? undefined,
                  likes: post.likes,
                  commentCount: post.commentCount,
                  views: post.views,
                  createdAt: post.createdAt,
                }))}
                comments={comments.map((comment) => ({
                  id: comment._id,
                  content: comment.content,
                  postId: comment.postId,
                  postTitle: comment.postTitle,
                  likes: comment.likes,
                  createdAt: comment.createdAt,
                }))}
                mode="all"
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="posts">
          <div className="pt-6">
            <ActivityFeed
              posts={posts.map((post) => ({
                id: post._id,
                title: post.title,
                category: post.categoryInfo?.name ?? post.category,
                categorySlug: post.category ?? undefined,
                likes: post.likes,
                commentCount: post.commentCount,
                views: post.views,
                createdAt: post.createdAt,
              }))}
              comments={[]}
              mode="posts"
            />
          </div>
        </TabsContent>

        <TabsContent value="comments">
          <div className="pt-6">
            <ActivityFeed
              posts={[]}
              comments={comments.map((comment) => ({
                id: comment._id,
                content: comment.content,
                postId: comment.postId,
                postTitle: comment.postTitle,
                likes: comment.likes,
                createdAt: comment.createdAt,
              }))}
              mode="comments"
            />
          </div>
        </TabsContent>

        <TabsContent value="cv">
          <div className="pt-6">
            <TechCV
              experience={user.experience}
              projects={user.projects}
              education={user.education}
              certifications={user.certifications}
            />
          </div>
        </TabsContent>
      </Tabs>
    </main>
    </div>
  );
}
