"use client";

import { useCallback, useState } from "react";
import { ForumsPageClient } from "@/app/forums/ForumsPageClient";
import { CategoryFeedClient } from "@/app/forums/[category]/CategoryFeedClient";
import { PostPageClient } from "@/app/forums/[category]/[postId]/PostPageClient";
import { ForumsNavProvider, type ForumsView } from "@/components/forums/ForumsNavigation";

// ── Component ────────────────────────────────────────────────────────────────

export function ForumsApp() {
  const [view, setView] = useState<ForumsView>({ kind: "categories" });
  const navigate = useCallback((next: ForumsView) => setView(next), []);

  return (
    <ForumsNavProvider navigate={navigate}>
      <div className="p-4">
        {view.kind === "categories" && <ForumsPageClient />}
        {view.kind === "category" && <CategoryFeedClient slug={view.slug} />}
        {view.kind === "post" && (
          <PostPageClient categorySlug={view.categorySlug} postId={view.postId} />
        )}
      </div>
    </ForumsNavProvider>
  );
}
