"use client";

import Link from "next/link";
import {
  createContext,
  useContext,
  type ComponentProps,
  type MouseEvent,
  type ReactNode,
} from "react";

export type ForumsView =
  | { kind: "categories" }
  | { kind: "category"; slug: string }
  | { kind: "post"; categorySlug: string; postId: string };

interface ForumsNavContextValue {
  navigate: (view: ForumsView) => void;
}

const ForumsNavContext = createContext<ForumsNavContextValue | null>(null);

export function ForumsNavProvider({
  children,
  navigate,
}: {
  children: ReactNode;
  navigate: (view: ForumsView) => void;
}) {
  return <ForumsNavContext.Provider value={{ navigate }}>{children}</ForumsNavContext.Provider>;
}

export function useForumsNav() {
  return useContext(ForumsNavContext);
}

export function parseForumsHref(href: string): ForumsView | null {
  if (!href.startsWith("/forums")) {
    return null;
  }

  const pathname = href.split(/[?#]/, 1)[0] ?? href;
  const segments = pathname.replace(/^\/forums\/?/, "").split("/").filter(Boolean);

  if (segments.length >= 2 && segments[0] && segments[1] && segments[1] !== "new") {
    return { kind: "post", categorySlug: segments[0], postId: segments[1] };
  }

  if (segments.length === 1 && segments[0] && segments[0] !== "new") {
    return { kind: "category", slug: segments[0] };
  }

  if (segments.length === 0) {
    return { kind: "categories" };
  }

  return null;
}

function isPlainLeftClick(event: MouseEvent<HTMLAnchorElement>) {
  return (
    event.button === 0 &&
    !event.altKey &&
    !event.ctrlKey &&
    !event.metaKey &&
    !event.shiftKey
  );
}

type ForumsHref = "/forums" | `/forums/${string}`;

type ForumsLinkProps = Omit<ComponentProps<typeof Link>, "href"> & {
  href: ForumsHref;
};

export function ForumsLink({ href, onClick, target, ...props }: ForumsLinkProps) {
  const nav = useForumsNav();
  const nextView = parseForumsHref(href);

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.(event);

    if (
      event.defaultPrevented ||
      !nav ||
      !nextView ||
      target === "_blank" ||
      !isPlainLeftClick(event)
    ) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    nav.navigate(nextView);
  }

  return (
    <Link
      {...props}
      href={href}
      onClick={handleClick}
      target={target}
      data-local-forums-nav={nav && nextView ? "true" : undefined}
    />
  );
}
