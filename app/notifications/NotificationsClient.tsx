"use client";

import { useState, useMemo, useCallback } from "react";
import { CheckCheck, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { NotificationItem, type NotificationType } from "@/components/shared/NotificationItem";
import { DEMO_NOTIFICATIONS } from "@/lib/demo-data";
import { useDemoAuth } from "@/lib/demo-auth";

const USER_ID_TO_INDEX: Record<string, number> = {
  user_001: 0,
  user_002: 1,
  user_003: 2,
  user_004: 3,
  user_005: 5,
};

const FILTER_TABS: { value: string; label: string }[] = [
  { value: "all", label: "All" },
  { value: "like", label: "Likes" },
  { value: "comment", label: "Comments" },
  { value: "mention", label: "Mentions" },
  { value: "follow", label: "Follows" },
  { value: "news", label: "News" },
];

interface NotificationState {
  type: NotificationType;
  message: string;
  link: string;
  isRead: boolean;
  createdAt: number;
}

export function NotificationsClient() {
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

  const [activeTab, setActiveTab] = useState("all");

  const filtered = useMemo(() => {
    if (activeTab === "all") return notifications;
    return notifications.filter((n) => n.type === activeTab);
  }, [notifications, activeTab]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  }, []);

  const markRead = useCallback((index: number) => {
    setNotifications((prev) =>
      prev.map((n, i) => (i === index ? { ...n, isRead: true } : n))
    );
  }, []);

  return (
    <main className="mx-auto max-w-3xl px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Bell className="size-6 text-[#00FF41]" />
          <h1 className="text-2xl font-bold text-white">Notifications</h1>
          {unreadCount > 0 && (
            <span className="flex items-center justify-center rounded-full bg-[#00FF41]/20 px-2 py-0.5 text-xs font-medium text-[#00FF41]">
              {unreadCount} unread
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={markAllRead}
            className="gap-1.5 text-[#00FF41] hover:text-[#00FF41]/80"
          >
            <CheckCheck className="size-4" />
            Mark all as read
          </Button>
        )}
      </div>

      <Tabs defaultValue="all" onValueChange={setActiveTab}>
        <TabsList className="mb-4 bg-black/40 border border-green-500/10 flex-wrap">
          {FILTER_TABS.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="data-active:text-[#00FF41]"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {FILTER_TABS.map((tab) => (
          <TabsContent key={tab.value} value={tab.value}>
            {filtered.length === 0 ? (
              <div className="rounded-lg border border-white/5 bg-white/[0.02] px-4 py-12 text-center">
                <Bell className="mx-auto size-10 text-muted-foreground/40 mb-3" />
                <p className="text-sm text-muted-foreground">No notifications</p>
              </div>
            ) : (
              <div className="space-y-1 rounded-lg border border-white/5 bg-white/[0.02] p-2">
                {filtered.map((n, i) => (
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
          </TabsContent>
        ))}
      </Tabs>
    </main>
  );
}

