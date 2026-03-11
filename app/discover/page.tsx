import type { Metadata } from "next";
import { DiscoverContent } from "./DiscoverContent";

export const metadata: Metadata = {
  title: "Discover",
  description:
    "Discover trending posts, top contributors, upcoming events, and who to follow on GetWired.dev.",
  openGraph: {
    title: "Discover | GetWired.dev",
    description: "Discover trending posts, top contributors, upcoming events, and who to follow on GetWired.dev.",
  },
  twitter: {
    card: "summary",
    title: "Discover | GetWired.dev",
    description: "Discover trending posts, top contributors, upcoming events, and who to follow on GetWired.dev.",
  },
};

export default function DiscoverPage() {
  return <DiscoverContent />;
}

