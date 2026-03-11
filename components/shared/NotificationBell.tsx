"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { Bell, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { NotificationItem, type NotificationType } from "@/components/shared/NotificationItem";
import { DEMO_NOTIFICATIONS } from "@/lib/demo-data";
import { useDemoAuth } from "@/lib/demo-auth";

// Map demo auth user IDs to demo-data userIndex
const USER_ID_TO_INDEX: Record<string, number> = {
  user_001: 0,
  user_002: 1,
  user_003: 2,
  user_004: 3,
  user_005: 5,
};

interface NotificationState {
  type: NotificationType;
  message: string;
  link: string;
  isRead: boolean;
  createdAt: number;
}

export function NotificationBell() {
  const { user } = useDemoAuth();
  const userIndex = user ? (USER_ID_TO_INDEX[user.id] ?? 0) : 0;

  const [notifications, setNotifications] = useState<NotificationState[]>(() =>
    DEMO_NOTIFICATIONS
      .filter((n) => n.userIndex === userIndex)
      .map((n) => ({
        type: n.type as NotificationType,
        message: n.message,
        link: n.link,
        isRead: n.isRead,
        createdAt: n.createdAt,
      }))
  );

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  }, []);

  const markRead = useCallback((index: number) => {
    setNotifications((prev) =>
      prev.map((n, i) => (i === index ? { ...n, isRead: true } : n))
    );
  }, []);

  const recent = notifications.slice(0, 5);

  return (
    <Popover>
      <PopoverTrigger
        className="relative inline-flex items-center justify-center size-9 rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground cursor-pointer"
      >
        <Bell className="size-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-[#3B82F6] text-[9px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-80 bg-card border border-border p-0"
      >
        <div className="flex items-center justify-between px-3 py-2.5">
          <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="flex items-center gap-1 text-xs text-[#3B82F6] hover:underline cursor-pointer"
            >
              <CheckCheck className="size-3" />
              Mark all read
            </button>
          )}
        </div>
        <Separator className="bg-border" />
        <ScrollArea className="max-h-[320px] overflow-y-auto">
          {recent.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">
              No notifications yet
            </p>
          ) : (
            <div className="py-1">
              {recent.map((n, i) => (
                <NotificationItem
                  key={`${n.type}-${n.createdAt}`}
                  type={n.type}
                  message={n.message}
                  link={n.link}
                  isRead={n.isRead}
                  createdAt={n.createdAt}
                  onClick={() => markRead(i)}
                />
              ))}
            </div>
          )}
        </ScrollArea>
        <Separator className="bg-border" />
        <div className="px-3 py-2">
          <Link
            href="/notifications"
            className="block text-center text-xs text-[#3B82F6] hover:underline"
          >
            View all notifications
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}

