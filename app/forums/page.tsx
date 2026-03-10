import type { Metadata } from "next";
import { ForumsPageClient } from "./ForumsPageClient";

export const metadata: Metadata = {
  title: "Forums",
  description: "Browse tech discussion forums — AI, web dev, mobile, security, startups, career, and more.",
  openGraph: {
    title: "Forums | GetWired.dev",
    description: "Browse tech discussion forums — AI, web dev, mobile, security, startups, career, and more.",
  },
};

export default function ForumsPage() {
  return <ForumsPageClient />;
}

