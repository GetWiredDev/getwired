import type { Metadata } from "next";
import { DiscoverContent } from "./DiscoverContent";

export const metadata: Metadata = {
  title: "Discover — GetWired.dev",
  description:
    "Discover trending posts, top contributors, upcoming events, and who to follow on GetWired.dev.",
};

export default function DiscoverPage() {
  return <DiscoverContent />;
}

