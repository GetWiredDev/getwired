"use client";

import { ChevronRight } from "lucide-react";
import { useQuery } from "convex/react";
import { PostDetail } from "@/components/forums/PostDetail";
import { CommentTree } from "@/components/forums/CommentTree";
import { ForumsLink } from "@/components/forums/ForumsNavigation";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "../../../../convex/_generated/api";

interface PostPageClientProps {
  categorySlug: string;
  postId: string;
}

function PostPageSkeleton() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <div className="mb-4 flex items-center gap-1.5">
        <Skeleton className="h-3 w-12" />
        <Skeleton className="size-3" />
        <Skeleton className="h-3 w-20" />
        <Skeleton className="size-3" />
        <Skeleton className="h-3 w-40" />
      </div>
      <div className="glass rounded-xl p-6 space-y-4">
        <div className="flex gap-2">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-12" />
        </div>
        <Skeleton className="h-7 w-3/4" />
        <div className="flex items-center gap-3">
          <Skeleton className="size-10 rounded-full" />
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-px w-full" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-16" />
        </div>
      </div>
    </div>
  );
}

export function PostPageClient({ categorySlug, postId }: PostPageClientProps) {
  const category = useQuery(api.forums.getCategoryBySlug, { slug: categorySlug });
  const post = useQuery(api.posts.getDetailedById, { postId: postId as never });

  if (post === undefined || category === undefined) {
    return <PostPageSkeleton />;
  }

  if (!post) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 text-center text-muted-foreground">
        <p className="text-sm">Post not found</p>
        <ForumsLink href="/forums" className="mt-2 inline-block text-sm text-[#3B82F6] hover:underline">
          Back to Forums
        </ForumsLink>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6" data-testid="post-detail-page">
          <nav className="mb-4 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground" data-testid="breadcrumb" aria-label="Breadcrumb">
            <ForumsLink href="/forums" className="transition-colors hover:text-foreground">
              Forums
            </ForumsLink>
            <ChevronRight className="size-3" />
            {category && (
              <>
                <ForumsLink href={`/forums/${category.slug}`} className="transition-colors hover:text-foreground">
                  {category.name}
                </ForumsLink>
                <ChevronRight className="size-3" />
              </>
            )}
            <span className="line-clamp-1 text-foreground">{post.title}</span>
          </nav>

          <PostDetail postId={postId} />

          <div className="mt-6" data-testid="comments-section">
            <div className="glass rounded-xl p-6">
              <CommentTree postId={postId} />
            </div>
          </div>
    </div>
  );
}
