import type { Metadata } from "next";
import { BookmarksClient } from "./BookmarksClient";

export const metadata: Metadata = {
  title: "Bookmarks",
  description: "Your saved posts, news articles, and users on GetWired.dev.",
  openGraph: {
    title: "Bookmarks | GetWired.dev",
    description: "Your saved posts, news articles, and users on GetWired.dev.",
  },
  twitter: {
    card: "summary",
    title: "Bookmarks | GetWired.dev",
    description: "Your saved posts, news articles, and users on GetWired.dev.",
  },
};

export default function BookmarksPage() {
  return <BookmarksClient />;
}

