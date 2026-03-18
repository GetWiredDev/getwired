"use client";

import Link from "next/link";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/shared/Avatar";
import { Calendar, Users } from "lucide-react";
import type { EventType } from "@/lib/types";

const EVENT_COLORS: Record<EventType, { bg: string; text: string; label: string }> = {
  ama: { bg: "bg-purple-500/20", text: "text-purple-400", label: "AMA" },
  meetup: { bg: "bg-blue-500/20", text: "text-blue-400", label: "Meetup" },
  hackathon: { bg: "bg-amber-500/20", text: "text-amber-400", label: "Hackathon" },
};

function formatDateTime(ts: number) {
  return new Date(ts).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function EventCard({
  event,
}: {
  event: {
    _id: string;
    title: string;
    description: string;
    type: EventType;
    startTime: number;
    tags: string[];
    attendees: string[];
    host?: {
      name: string;
      username: string;
      avatar?: string;
    } | null;
  };
}) {
  const [rsvp, setRsvp] = useState(false);
  const [attendeeCount, setAttendeeCount] = useState(event.attendees.length);
  const typeConfig = EVENT_COLORS[event.type];

  const handleRsvp = () => {
    setRsvp((current) => {
      setAttendeeCount((count) => (current ? Math.max(count - 1, 0) : count + 1));
      return !current;
    });
  };

  return (
    <Card className="glass border-border transition-all hover:border-[#3B82F6]/20" data-testid="event-card">
      <CardContent className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <Badge className={`${typeConfig.bg} ${typeConfig.text} border-none text-[10px] font-semibold`}>
            {typeConfig.label}
          </Badge>
        </div>

        <h3 className="mb-1.5 text-sm font-semibold">{event.title}</h3>
        <p className="mb-3 line-clamp-2 text-xs text-muted-foreground">{event.description}</p>

        <div className="mb-3 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Calendar className="size-3.5 text-[#3B82F6]" />
          <span>{formatDateTime(event.startTime)}</span>
        </div>

        {event.host && (
          <div className="mb-3 flex items-center gap-2">
            <Link href={`/profile/${event.host.username}`} className="shrink-0">
              <UserAvatar src={event.host.avatar} name={event.host.name} size="sm" />
            </Link>
            <Link href={`/profile/${event.host.username}`} className="transition-colors hover:text-[#3B82F6]">
              <p className="text-xs font-medium">Hosted by {event.host.name}</p>
              <p className="text-[10px] text-muted-foreground">@{event.host.username}</p>
            </Link>
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Users className="size-3" />
            {attendeeCount}
          </span>

          <Button
            size="sm"
            variant={rsvp ? "default" : "outline"}
            onClick={handleRsvp}
            data-testid="event-rsvp-button"
            aria-label={rsvp ? "Cancel RSVP" : "RSVP to event"}
            aria-pressed={rsvp}
            className={
              rsvp
                ? "h-7 bg-[#3B82F6] text-xs text-white hover:bg-[#3B82F6]/80"
                : "h-7 border-[#3B82F6]/30 text-xs text-[#3B82F6] hover:bg-[#3B82F6]/10"
            }
          >
            {rsvp ? "Going ✓" : "RSVP"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
