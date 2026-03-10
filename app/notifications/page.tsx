import type { Metadata } from "next";
import { NotificationsClient } from "./NotificationsClient";

export const metadata: Metadata = {
  title: "Notifications",
  description: "View your notifications — likes, comments, mentions, follows, and news updates.",
  openGraph: {
    title: "Notifications | GetWired.dev",
    description: "View your notifications — likes, comments, mentions, follows, and news updates.",
  },
};

export default function NotificationsPage() {
  return <NotificationsClient />;
}

