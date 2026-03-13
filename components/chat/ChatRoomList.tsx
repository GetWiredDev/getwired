"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useAppAuth } from "@/lib/auth";
import { toast } from "sonner";
import {
  Search,
  Plus,
  Hash,
  Lock,
  MessageCircle,
  Brain,
  Globe,
  Smartphone,
  Cpu,
  ShieldCheck,
  Rocket,
  TrendingUp,
  Coffee,
} from "lucide-react";
import { api } from "../../convex/_generated/api";

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  "ai-ml": Brain,
  "web-dev": Globe,
  mobile: Smartphone,
  hardware: Cpu,
  cybersecurity: ShieldCheck,
  startups: Rocket,
  career: TrendingUp,
  "off-topic": Coffee,
};

interface ChatRoomListProps {
  activeRoomId: string | null;
  onSelectRoom: (roomId: string) => void;
}

export function ChatRoomList({ activeRoomId, onSelectRoom }: ChatRoomListProps) {
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");
  const [newRoomDesc, setNewRoomDesc] = useState("");
  const [newRoomType, setNewRoomType] = useState<"public" | "private">("public");
  const { isSignedIn, signIn } = useAppAuth();
  const rooms = useQuery(api.chat.listRooms, {}) ?? [];
  const createRoom = useMutation(api.chat.createRoom);

  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      if (!search) {
        return true;
      }

      return (
        room.name.toLowerCase().includes(search.toLowerCase()) ||
        room.description?.toLowerCase().includes(search.toLowerCase())
      );
    });
  }, [rooms, search]);

  const publicRooms = filteredRooms.filter((room) => room.type === "public");
  const privateRooms = filteredRooms.filter((room) => room.type === "private");
  const dmRooms = filteredRooms.filter((room) => room.type === "dm");

  return (
    <div className="flex h-full flex-col border-r border-border bg-card/50" data-testid="chat-room-list" aria-label="Chat rooms">
      <div className="flex items-center justify-between border-b border-border px-3 py-3">
        <h2 className="text-sm font-semibold text-foreground">Chat</h2>
        <Button
          variant="ghost"
          size="icon"
          className="size-7"
          onClick={() => {
            if (!isSignedIn) {
              toast.error("Sign in required", {
                description: "You need to sign in to create rooms.",
                action: { label: "Sign In", onClick: signIn },
              });
              return;
            }
            setCreateOpen(true);
          }}
        >
          <Plus className="size-4 text-[#3B82F6]" />
        </Button>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create Chat Room</DialogTitle>
            </DialogHeader>
            <form
              className="space-y-4"
              onSubmit={async (e) => {
                e.preventDefault();
                if (!newRoomName.trim()) return;
                try {
                  const roomId = await createRoom({
                    name: newRoomName.trim(),
                    description: newRoomDesc.trim() || undefined,
                    type: newRoomType,
                  });
                  setNewRoomName("");
                  setNewRoomDesc("");
                  setCreateOpen(false);
                  onSelectRoom(roomId);
                  toast.success("Room created!");
                } catch {
                  toast.error("Failed to create room");
                }
              }}
            >
              <div className="space-y-2">
                <Label htmlFor="room-name">Room Name</Label>
                <Input
                  id="room-name"
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  placeholder="e.g. general-discussion"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="room-desc">Description (optional)</Label>
                <Input
                  id="room-desc"
                  value={newRoomDesc}
                  onChange={(e) => setNewRoomDesc(e.target.value)}
                  placeholder="What is this room about?"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={newRoomType === "public" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setNewRoomType("public")}
                >
                  <Hash className="size-3 mr-1" /> Public
                </Button>
                <Button
                  type="button"
                  variant={newRoomType === "private" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setNewRoomType("private")}
                >
                  <Lock className="size-3 mr-1" /> Private
                </Button>
              </div>
              <Button type="submit" className="w-full">Create Room</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="px-3 py-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search rooms..."
            className="h-8 border-border/50 bg-secondary/30 pl-8 text-xs"
            data-testid="chat-room-search"
            aria-label="Search chat rooms"
          />
        </div>
      </div>

      <ScrollArea className="flex-1 overflow-y-auto">
        <div className="px-2 py-1">
          <RoomSection
            title="Public Rooms"
            rooms={publicRooms}
            activeRoomId={activeRoomId}
            onSelectRoom={onSelectRoom}
          />
          <RoomSection
            title="Private Groups"
            rooms={privateRooms}
            activeRoomId={activeRoomId}
            onSelectRoom={onSelectRoom}
          />
          <RoomSection
            title="Direct Messages"
            rooms={dmRooms}
            activeRoomId={activeRoomId}
            onSelectRoom={onSelectRoom}
          />
        </div>
      </ScrollArea>
    </div>
  );
}

function RoomSection({
  title,
  rooms,
  activeRoomId,
  onSelectRoom,
}: {
  title: string;
  rooms: Array<{
    _id: string;
    name: string;
    type: "public" | "private" | "dm";
    categorySlug?: string;
    lastMessage: {
      content: string;
      createdAt: number;
      author: { name: string; username: string } | null;
    } | null;
  }>;
  activeRoomId: string | null;
  onSelectRoom: (roomId: string) => void;
}) {
  return (
    <>
      <p className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </p>
      {rooms.map((room) => {
        const Icon =
          room.type === "dm"
            ? MessageCircle
            : room.type === "private"
              ? Lock
              : (room.categorySlug && CATEGORY_ICONS[room.categorySlug]) || Hash;

        const preview = room.lastMessage
          ? `${room.lastMessage.author?.username ?? room.lastMessage.author?.name ?? "user"}: ${room.lastMessage.content}`
          : room.type === "dm"
            ? "Start the conversation"
            : "No messages yet";

        return (
          <RoomItem
            key={room._id}
            icon={<Icon className="size-4" />}
            name={room.name}
            preview={preview}
            active={activeRoomId === room._id}
            onClick={() => onSelectRoom(room._id)}
          />
        );
      })}
      {rooms.length === 0 && (
        <p className="px-2 py-1 text-[11px] text-muted-foreground">No rooms</p>
      )}
    </>
  );
}

function RoomItem({
  icon,
  name,
  preview,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  name: string;
  preview: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      data-testid="chat-room-item"
      aria-label={`Chat room: ${name}`}
      aria-current={active ? "true" : undefined}
      className={cn(
        "flex w-full items-center gap-2.5 rounded-lg border px-2 py-2 text-left transition-colors",
        active
          ? "border-[#3B82F6]/30 bg-[#3B82F6]/10"
          : "border-transparent hover:bg-secondary/50",
      )}
    >
      <span className={cn("shrink-0", active ? "text-[#3B82F6]" : "text-muted-foreground")}>
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className={cn("truncate text-sm font-medium", active ? "text-[#3B82F6]" : "text-foreground")}>
          {name}
        </p>
        <p className="truncate text-[11px] text-muted-foreground">{preview}</p>
      </div>
      {active && <Badge className="bg-[#3B82F6] text-white text-[10px]">Live</Badge>}
    </button>
  );
}
