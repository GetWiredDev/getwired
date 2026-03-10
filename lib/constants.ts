import type { RankInfo } from "./types";

// Theme colors
export const THEME = {
  primary: "#00FF41",       // Electric green
  primaryDim: "#00CC33",
  background: "#0A0A0A",   // Deep black
  surface: "#111111",
  surfaceHover: "#1A1A1A",
  border: "#222222",
  text: "#E0E0E0",
  textMuted: "#888888",
  accent: "#00FF41",
  danger: "#FF4444",
  warning: "#FFB800",
  success: "#00FF41",
  info: "#00BFFF",
} as const;

// Rank definitions
export const RANKS: Record<string, RankInfo> = {
  newbie: {
    name: "newbie",
    label: "Newbie",
    minKarma: 0,
    color: "#888888",
    icon: "Sprout",
  },
  active: {
    name: "active",
    label: "Active",
    minKarma: 100,
    color: "#00BFFF",
    icon: "Zap",
  },
  contributor: {
    name: "contributor",
    label: "Contributor",
    minKarma: 500,
    color: "#00FF41",
    icon: "Code2",
  },
  expert: {
    name: "expert",
    label: "Expert",
    minKarma: 2000,
    color: "#FFB800",
    icon: "Award",
  },
  top: {
    name: "top",
    label: "Top Contributor",
    minKarma: 5000,
    color: "#FF6B00",
    icon: "Crown",
  },
  moderator: {
    name: "moderator",
    label: "Moderator",
    minKarma: 0,
    color: "#FF4444",
    icon: "Shield",
  },
} as const;

// Karma thresholds
export const KARMA_THRESHOLDS = {
  POST: 10,
  COMMENT: 5,
  LIKE_RECEIVED: 2,
  BEST_ANSWER: 25,
  DAILY_LOGIN: 1,
  FIRST_POST: 50,
  STREAK_BONUS: 10,
} as const;

// Forum categories config
export const FORUM_CATEGORIES = [
  { name: "AI & Machine Learning", slug: "ai-ml", icon: "Brain", color: "#8B5CF6", description: "Discuss AI models, ML pipelines, LLMs, and the future of artificial intelligence" },
  { name: "Web Development", slug: "web-dev", icon: "Globe", color: "#3B82F6", description: "Frontend, backend, full-stack — React, Next.js, Node, and everything web" },
  { name: "Mobile Development", slug: "mobile", icon: "Smartphone", color: "#10B981", description: "iOS, Android, React Native, Flutter, and cross-platform development" },
  { name: "Hardware & IoT", slug: "hardware", icon: "Cpu", color: "#F59E0B", description: "Embedded systems, Raspberry Pi, Arduino, robotics, and hardware hacking" },
  { name: "Cybersecurity", slug: "cybersecurity", icon: "ShieldCheck", color: "#EF4444", description: "Security research, pentesting, CTFs, privacy, and threat analysis" },
  { name: "Startups & Business", slug: "startups", icon: "Rocket", color: "#EC4899", description: "Founding, funding, scaling — share your startup journey and lessons" },
  { name: "Career & Growth", slug: "career", icon: "TrendingUp", color: "#14B8A6", description: "Job hunting, interviews, salary negotiation, mentorship, and career advice" },
  { name: "Off-Topic & Fun", slug: "off-topic", icon: "Coffee", color: "#6B7280", description: "Memes, side projects, tech humor, and everything else" },
] as const;

// Tech stack items for profiles
export const TECH_STACKS = [
  "React", "Next.js", "TypeScript", "JavaScript", "Python", "Rust", "Go",
  "Node.js", "Deno", "Bun", "Vue.js", "Svelte", "Angular", "Tailwind CSS",
  "PostgreSQL", "MongoDB", "Redis", "Prisma", "Drizzle", "Convex",
  "Docker", "Kubernetes", "AWS", "GCP", "Vercel", "Cloudflare",
  "GraphQL", "tRPC", "REST", "gRPC", "WebSockets",
  "React Native", "Flutter", "Swift", "Kotlin",
  "TensorFlow", "PyTorch", "Hugging Face", "LangChain",
  "Git", "Linux", "Vim", "VS Code", "Figma",
] as const;

// AI tools for profiles
export const AI_TOOLS = [
  "ChatGPT", "Claude", "GitHub Copilot", "Cursor", "Midjourney",
  "Stable Diffusion", "DALL-E", "Whisper", "GPT-4", "Gemini",
  "Perplexity", "Ollama", "LM Studio", "Hugging Face",
  "Augment Code", "Windsurf", "Tabnine", "Codeium",
  "v0", "Bolt", "Replit AI", "Amazon Q",
] as const;

// Tags for posts
export const POST_TAGS = [
  "react", "nextjs", "typescript", "python", "rust", "ai", "ml",
  "webdev", "mobile", "devops", "security", "startup", "career",
  "tutorial", "discussion", "showoff", "help", "news", "opinion",
  "open-source", "side-project", "hiring", "remote", "freelance",
  "beginner", "advanced", "architecture", "performance", "testing",
] as const;

// News sources
export const NEWS_SOURCES = [
  "Hacker News", "The Verge", "TechCrunch", "Ars Technica",
  "Wired", "Dev.to", "Product Hunt", "MIT Technology Review",
  "IEEE Spectrum", "The Register", "ZDNet", "VentureBeat",
] as const;

// App constants
export const APP_NAME = "GetWired.dev";
export const APP_TAGLINE = "Where tech minds connect";
export const APP_DESCRIPTION = "The all-in-one tech community platform — forums, chat, news, and networking for developers, engineers, and tech enthusiasts.";
export const MADE_WITH = "Made with Opus 4.6";
export const POSTS_PER_PAGE = 20;
export const MESSAGES_PER_PAGE = 50;
export const MAX_POST_LENGTH = 10000;
export const MAX_COMMENT_LENGTH = 5000;
export const MAX_MESSAGE_LENGTH = 2000;

