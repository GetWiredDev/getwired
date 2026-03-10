"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { TechStack } from "@/components/profile/TechStack";
import { TechCV } from "@/components/profile/TechCV";
import { ActivityFeed } from "@/components/profile/ActivityFeed";
import { Separator } from "@/components/ui/separator";
import { useDemoAuth } from "@/lib/demo-auth";
import type { UserRank } from "@/lib/types";
import type { Experience, Project, Education, Certification } from "@/lib/types";

interface ProfileUser {
  clerkId: string;
  name: string;
  username: string;
  avatar?: string;
  bio?: string;
  location?: string;
  website?: string;
  github?: string;
  linkedin?: string;
  twitter?: string;
  techStack: string[];
  aiTools: string[];
  experience: Experience[];
  projects: Project[];
  education: Education[];
  certifications: Certification[];
  rank: UserRank;
  karma: number;
  createdAt: number;
}

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

interface ProfilePageClientProps {
  user: ProfileUser;
  posts: PostItem[];
  comments: CommentItem[];
}

export function ProfilePageClient({ user, posts, comments }: ProfilePageClientProps) {
  const { user: currentUser } = useDemoAuth();
  const isOwnProfile = currentUser?.username === user.username;

  return (
    <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      <ProfileHeader user={user} isOwnProfile={isOwnProfile} />

      <Tabs defaultValue="overview">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="posts">Posts ({posts.length})</TabsTrigger>
          <TabsTrigger value="comments">Comments ({comments.length})</TabsTrigger>
          <TabsTrigger value="cv">Tech CV</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="space-y-6 pt-4">
            <TechStack techStack={user.techStack} aiTools={user.aiTools} />
            <Separator className="bg-white/5" />
            <ActivityFeed posts={posts} comments={comments} mode="all" />
          </div>
        </TabsContent>

        <TabsContent value="posts">
          <div className="pt-4">
            <ActivityFeed posts={posts} comments={[]} mode="posts" />
          </div>
        </TabsContent>

        <TabsContent value="comments">
          <div className="pt-4">
            <ActivityFeed posts={[]} comments={comments} mode="comments" />
          </div>
        </TabsContent>

        <TabsContent value="cv">
          <div className="pt-4">
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
  );
}

