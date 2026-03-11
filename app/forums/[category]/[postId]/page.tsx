import type { Metadata } from "next";
import { DEMO_POSTS, DEMO_USERS, DEMO_CATEGORIES } from "@/lib/demo-data";
import { PostPageClient } from "./PostPageClient";

interface Props {
  params: Promise<{ category: string; postId: string }>;
}

function getPostIndex(postId: string): number {
  const match = postId.match(/^post-(\d+)$/);
  const val = match?.[1];
  return val ? parseInt(val, 10) : -1;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { postId } = await params;
  const idx = getPostIndex(postId);
  const post = idx >= 0 ? DEMO_POSTS[idx] : undefined;
  const author = post ? DEMO_USERS[post.authorIndex] : undefined;
  const title = post?.title ?? "Post";
  const desc = post?.content.slice(0, 160) ?? "";

  return {
    title,
    description: desc,
    openGraph: {
      title: `${title} | GetWired.dev`,
      description: desc,
      type: "article",
      authors: author ? [author.name] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: desc,
    },
  };
}

export function generateStaticParams() {
  return DEMO_POSTS.flatMap((post, i) => {
    const cat = DEMO_CATEGORIES.find((c) => c.slug === post.category);
    if (!cat) return [];
    return [{ category: cat.slug, postId: `post-${i}` }];
  });
}

export default async function PostPage({ params }: Props) {
  const { category, postId } = await params;
  const idx = getPostIndex(postId);
  const post = idx >= 0 ? DEMO_POSTS[idx] : undefined;
  const author = post ? DEMO_USERS[post.authorIndex] : undefined;

  const jsonLd = post
    ? {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: post.title,
        description: post.content.slice(0, 160),
        author: author
          ? { "@type": "Person", name: author.name, url: `https://getwired.dev/profile/${author.username}` }
          : undefined,
        datePublished: new Date(post.createdAt).toISOString(),
        publisher: { "@type": "Organization", name: "GetWired.dev", url: "https://getwired.dev" },
        mainEntityOfPage: `https://getwired.dev/forums/${category}/${postId}`,
      }
    : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <PostPageClient categorySlug={category} postIndex={idx} />
    </>
  );
}

