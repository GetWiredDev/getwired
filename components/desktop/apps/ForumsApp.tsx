"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { ForumsPageClient } from "@/app/forums/ForumsPageClient";
import { CategoryFeedClient } from "@/app/forums/[category]/CategoryFeedClient";
import { PostPageClient } from "@/app/forums/[category]/[postId]/PostPageClient";

// ── Internal navigation context ──────────────────────────────────────────────

type ForumsView =
  | { kind: "categories" }
  | { kind: "category"; slug: string }
  | { kind: "post"; categorySlug: string; postId: string };

interface ForumsNavContextValue {
  navigate: (view: ForumsView) => void;
}

const ForumsNavContext = createContext<ForumsNavContextValue | null>(null);

export function useForumsNav() {
  return useContext(ForumsNavContext);
}

// ── Component ────────────────────────────────────────────────────────────────

export function ForumsApp() {
  const [view, setView] = useState<ForumsView>({ kind: "categories" });
  const containerRef = useRef<HTMLDivElement>(null);

  const navigate = useCallback((next: ForumsView) => setView(next), []);

  // Native DOM capture-phase listener — fires before React / Next.js Link handlers
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    function handleClick(e: MouseEvent) {
      if (e.ctrlKey || e.metaKey || e.shiftKey) return;

      const anchor = (e.target as HTMLElement).closest("a");
      if (!anchor || anchor.target === "_blank") return;

      const href = anchor.getAttribute("href");
      if (!href || !href.startsWith("/forums")) return;

      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();

      const segments = href.replace(/^\/forums\/?/, "").split("/").filter(Boolean);

      if (segments.length >= 2 && segments[0] && segments[1] && segments[1] !== "new") {
        setView({ kind: "post", categorySlug: segments[0], postId: segments[1] });
      } else if (segments.length === 1 && segments[0]) {
        setView({ kind: "category", slug: segments[0] });
      } else {
        setView({ kind: "categories" });
      }
    }

    el.addEventListener("click", handleClick, true); // capture phase
    return () => el.removeEventListener("click", handleClick, true);
  }, []);

  return (
    <ForumsNavContext.Provider value={{ navigate }}>
      <div className="p-4" ref={containerRef}>
        {view.kind === "categories" && <ForumsPageClient />}
        {view.kind === "category" && <CategoryFeedClient slug={view.slug} />}
        {view.kind === "post" && (
          <PostPageClient categorySlug={view.categorySlug} postId={view.postId} />
        )}
      </div>
    </ForumsNavContext.Provider>
  );
}
