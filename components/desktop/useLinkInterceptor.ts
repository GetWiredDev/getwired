"use client";

import { useCallback } from "react";
import { useWindowManager } from "./useWindowManager";

/**
 * Route mapping: URL path prefix → appId
 */
const ROUTE_TO_APP: Record<string, string> = {
  "/profile": "profile",
  "/forums": "forums",
  "/chat": "chat",
  "/news": "news",
  "/discover": "discover",
  "/marketplace": "marketplace",
  "/bookmarks": "bookmarks",
  "/notifications": "notifications",
  "/search": "search",
  "/admin": "admin",
  "/newsletter": "newsletter",
};

/**
 * Parse a URL pathname into an appId and optional context
 */
function parseRoute(pathname: string): { appId: string; context?: string } | null {
  // Try prefix match
  for (const [prefix, appId] of Object.entries(ROUTE_TO_APP)) {
    if (pathname === prefix || pathname.startsWith(prefix + "/")) {
      const rest = pathname.slice(prefix.length + 1);
      return { appId, context: rest || undefined };
    }
  }

  // Root path → feed
  if (pathname === "/") {
    return { appId: "feed" };
  }

  return null;
}

export function useLinkInterceptor() {
  const { openWindow } = useWindowManager();

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      // Let modified clicks (ctrl/cmd + click) pass through
      if (e.ctrlKey || e.metaKey || e.shiftKey) return;

      // Find the closest <a> tag
      const anchor = (e.target as HTMLElement).closest("a");
      if (!anchor) return;

      // Let target="_blank" links pass through
      if (anchor.target === "_blank") return;

      const href = anchor.getAttribute("href");
      if (!href) return;

      // Skip external links
      if (href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("tel:")) return;

      // Skip hash links
      if (href.startsWith("#")) return;

      // Parse the internal route
      const parsed = parseRoute(href);
      if (!parsed) return;

      // Prevent default navigation
      e.preventDefault();
      e.stopPropagation();

      // Build a custom title for certain apps
      let title: string | undefined;
      if (parsed.appId === "profile" && parsed.context) {
        title = `Profile — ${parsed.context}`;
      }
      if (parsed.appId === "search" && href.includes("?")) {
        const params = new URLSearchParams(href.split("?")[1]);
        const q = params.get("q") || params.get("tag");
        if (q) title = `Search — ${q}`;
      }

      openWindow(parsed.appId, title);
    },
    [openWindow],
  );

  return handleClick;
}

