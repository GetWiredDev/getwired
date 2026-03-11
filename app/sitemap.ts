import type { MetadataRoute } from "next";
import { DEMO_CATEGORIES, DEMO_POSTS, DEMO_USERS } from "@/lib/demo-data";

const BASE_URL = "https://getwired.dev";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/forums`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/news`,
      lastModified: now,
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/chat`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/discover`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/marketplace`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/newsletter`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/search`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/sign-in`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/sign-up`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];

  // Forum category routes
  const categoryRoutes: MetadataRoute.Sitemap = DEMO_CATEGORIES.map((cat) => ({
    url: `${BASE_URL}/forums/${cat.slug}`,
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  // Forum post routes
  const postRoutes: MetadataRoute.Sitemap = DEMO_POSTS.map((post, i) => {
    const cat = DEMO_CATEGORIES.find((c) => c.slug === post.category);
    return {
      url: `${BASE_URL}/forums/${cat?.slug ?? post.category}/post-${i}`,
      lastModified: new Date(post.createdAt),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    };
  });

  // User profile routes
  const profileRoutes: MetadataRoute.Sitemap = DEMO_USERS.map((user) => ({
    url: `${BASE_URL}/profile/${user.username}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.5,
  }));

  return [...staticRoutes, ...categoryRoutes, ...postRoutes, ...profileRoutes];
}

