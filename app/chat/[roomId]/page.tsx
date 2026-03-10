import type { Metadata } from "next";
import { DEMO_CHAT_ROOMS } from "@/lib/demo-data";
import { ChatRoomPageClient } from "./ChatRoomPageClient";

interface PageProps {
  params: Promise<{ roomId: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { roomId } = await params;
  const index = parseInt(roomId, 10);
  const room = DEMO_CHAT_ROOMS[index];
  const name = room?.name ?? "Chat Room";

  const desc = room?.description ?? "Chat room on GetWired.dev";
  return {
    title: name,
    description: desc,
    openGraph: {
      title: `${name} | GetWired.dev`,
      description: desc,
    },
    twitter: {
      card: "summary",
      title: `${name} | GetWired.dev`,
      description: desc,
    },
  };
}

export default async function ChatRoomPage({ params }: PageProps) {
  const { roomId } = await params;
  const index = parseInt(roomId, 10);
  return <ChatRoomPageClient roomIndex={index} />;
}

