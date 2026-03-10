import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DEMO_USERS, DEMO_POSTS, DEMO_COMMENTS } from "@/lib/demo-data";
import { ProfilePageClient } from "./ProfilePageClient";

interface Props {
  params: Promise<{ userId: string }>;
}

function findUser(userId: string) {
  return DEMO_USERS.find(
    (u) => u.clerkId === userId || u.username === userId
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { userId } = await params;
  const user = findUser(userId);
  if (!user) {
    return { title: "User Not Found" };
  }
  return {
    title: `${user.name} (@${user.username})`,
    description: user.bio || `${user.name}'s profile on GetWired.dev`,
  };
}

export default async function ProfilePage({ params }: Props) {
  const { userId } = await params;
  const user = findUser(userId);

  if (!user) {
    notFound();
  }

  // Get user's posts
  const userPosts = DEMO_POSTS
    .filter((p) => p.authorIndex === DEMO_USERS.indexOf(user))
    .map((p) => ({
      title: p.title,
      category: p.category,
      likes: p.likes,
      commentCount: p.commentCount,
      views: p.views,
      createdAt: p.createdAt,
    }));

  // Get user's comments
  const userIndex = DEMO_USERS.indexOf(user);
  const userComments = DEMO_COMMENTS
    .filter((c) => c.authorIndex === userIndex)
    .map((c) => ({
      content: c.content,
      postTitle: DEMO_POSTS[c.postIndex]?.title ?? "Unknown post",
      likes: c.likes,
      createdAt: c.createdAt,
    }));

  return (
    <ProfilePageClient
      user={user}
      posts={userPosts}
      comments={userComments}
    />
  );
}

