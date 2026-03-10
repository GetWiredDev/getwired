import type { Id } from "../convex/_generated/dataModel";

// User types
export type UserRank = "newbie" | "active" | "contributor" | "expert" | "top" | "moderator";
export type UserRole = "user" | "moderator" | "admin";

export interface Experience {
  title: string;
  company: string;
  period: string;
  description: string;
}

export interface Project {
  name: string;
  url: string;
  description: string;
  techStack: string[];
}

export interface Education {
  school: string;
  degree: string;
  field: string;
  year: string;
}

export interface Certification {
  name: string;
  issuer: string;
  year: string;
  url?: string;
}

export interface User {
  _id: Id<"users">;
  clerkId: string;
  name: string;
  username: string;
  email: string;
  avatar?: string;
  bio?: string;
  location?: string;
  website?: string;
  github?: string;
  linkedin?: string;
  twitter?: string;
  techStack: string[];
  aiTools: string[];
  tags: string[];
  experience: Experience[];
  projects: Project[];
  education: Education[];
  certifications: Certification[];
  rank: UserRank;
  karma: number;
  role: UserRole;
  isDemo: boolean;
  createdAt: number;
}

// Post types
export type PostType = "post" | "news_discussion" | "poll";

export interface Post {
  _id: Id<"posts">;
  authorId: Id<"users">;
  title: string;
  content: string;
  category?: string;
  tags: string[];
  type: PostType;
  likes: number;
  commentCount: number;
  views: number;
  isBoosted: boolean;
  boostExpiry?: number;
  isPinned: boolean;
  isDemo: boolean;
  createdAt: number;
}

// Comment types
export interface Comment {
  _id: Id<"comments">;
  postId: Id<"posts">;
  authorId: Id<"users">;
  parentId?: Id<"comments">;
  content: string;
  likes: number;
  isDemo: boolean;
  createdAt: number;
}

// Forum types
export interface ForumCategory {
  _id: Id<"forumCategories">;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  postCount: number;
  chatRoomId?: Id<"chatRooms">;
  order: number;
}

// Chat types
export type RoomType = "public" | "private" | "dm";

export interface ChatRoom {
  _id: Id<"chatRooms">;
  name: string;
  type: RoomType;
  categorySlug?: string;
  members: Id<"users">[];
  description?: string;
  createdBy: Id<"users">;
  isDemo: boolean;
  createdAt: number;
}

export interface Reaction {
  emoji: string;
  userId: Id<"users">;
}

export interface ChatMessage {
  _id: Id<"chatMessages">;
  roomId: Id<"chatRooms">;
  authorId: Id<"users">;
  content: string;
  threadId?: Id<"chatMessages">;
  reactions: Reaction[];
  mentions: string[];
  isDemo: boolean;
  createdAt: number;
}

// News types
export interface NewsArticle {
  _id: Id<"newsArticles">;
  title: string;
  url: string;
  source: string;
  summary: string;
  imageUrl?: string;
  tags: string[];
  discussionPostId?: Id<"posts">;
  publishedAt: number;
  isDemo: boolean;
  createdAt: number;
}

// Notification types
export type NotificationType = "like" | "comment" | "mention" | "follow" | "news";

export interface Notification {
  _id: Id<"notifications">;
  userId: Id<"users">;
  type: NotificationType;
  message: string;
  link: string;
  isRead: boolean;
  fromUserId?: Id<"users">;
  isDemo: boolean;
  createdAt: number;
}

// Bookmark types
export type BookmarkTargetType = "post" | "news" | "user" | "category" | "tag";

export interface Bookmark {
  _id: Id<"bookmarks">;
  userId: Id<"users">;
  targetId: string;
  targetType: BookmarkTargetType;
  createdAt: number;
}

// Follow types
export type FollowTargetType = "user" | "tag" | "category";

export interface Follow {
  _id: Id<"follows">;
  followerId: Id<"users">;
  targetId: string;
  targetType: FollowTargetType;
  createdAt: number;
}

// Poll types
export interface PollOption {
  text: string;
  votes: number;
}

export interface Poll {
  _id: Id<"polls">;
  postId: Id<"posts">;
  question: string;
  options: PollOption[];
  voters: Id<"users">[];
  expiresAt?: number;
  isDemo: boolean;
}

// Event types
export type EventType = "ama" | "meetup" | "hackathon";

export interface Event {
  _id: Id<"events">;
  title: string;
  description: string;
  type: EventType;
  hostId: Id<"users">;
  startTime: number;
  endTime: number;
  tags: string[];
  attendees: Id<"users">[];
  isDemo: boolean;
  createdAt: number;
}

// Promotion types
export type PromotionType = "boost" | "banner" | "sponsored";
export type PromotionStatus = "active" | "expired" | "pending";

export interface Promotion {
  _id: Id<"promotions">;
  userId: Id<"users">;
  type: PromotionType;
  targetId?: string;
  status: PromotionStatus;
  startTime: number;
  endTime: number;
  impressions: number;
  clicks: number;
  price: number;
  isDemo: boolean;
}

// Newsletter types
export interface NewsletterSubscriber {
  _id: Id<"newsletterSubscribers">;
  email: string;
  userId?: Id<"users">;
  isActive: boolean;
  subscribedAt: number;
}

// Moderation types
export type ModerationAction = "blocked" | "flagged" | "approved";
export type ModerationContentType = "post" | "comment" | "chat";

export interface ModerationLog {
  _id: Id<"moderationLogs">;
  contentType: ModerationContentType;
  contentId: string;
  authorId: Id<"users">;
  reason: string;
  action: ModerationAction;
  isDemo: boolean;
  createdAt: number;
}

// Rank info for display
export interface RankInfo {
  name: string;
  label: string;
  minKarma: number;
  color: string;
  icon: string;
}

