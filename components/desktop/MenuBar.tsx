"use client";

import { useEffect, useMemo, useState } from "react";
import { Wifi, BatteryFull, Bell, Search, User, Bookmark, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/shared/Avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useAppAuth } from "@/lib/auth";
import { APP_ENV } from "@/lib/env";
import { useWindowManager } from "./useWindowManager";

function useCurrentTime() {
  const [time, setTime] = useState("");

  useEffect(() => {
    function update() {
      const now = new Date();
      const day = now.toLocaleDateString("en-US", { weekday: "short" });
      const clock = now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
      setTime(`${day}  ${clock}`);
    }

    update();
    const id = setInterval(update, 60_000);
    return () => clearInterval(id);
  }, []);

  return time;
}

export function MenuBar() {
  const { user, signIn, signOut } = useAppAuth();
  const time = useCurrentTime();
  const { state, openWindow } = useWindowManager();
  const [showSignOutDialog, setShowSignOutDialog] = useState(false);
  const focusedAppName = useMemo(() => {
    const visible = state.windows.filter((windowState) => !windowState.isMinimized);
    if (visible.length === 0) {
      return "GetWired";
    }

    const top = visible.reduce((current, next) => (current.zIndex > next.zIndex ? current : next));
    return top.title;
  }, [state.windows]);

  return (
    <>
      <div
        className="absolute inset-x-0 top-0 z-[9998] flex h-7 items-center justify-between border-b border-white/[0.06] bg-zinc-950/80 px-4 backdrop-blur-xl"
        style={{ height: 28 }}
      >
        <div className="flex items-center gap-0.5">
          <button className="rounded px-2 py-0.5 text-[13px] font-semibold text-white hover:bg-white/[0.08]">
            {focusedAppName}
          </button>
        </div>

        <div className="flex items-center gap-3">
          <Wifi className="size-3.5 text-zinc-400 hover:text-zinc-200" />
          <BatteryFull className="size-3.5 text-zinc-400 hover:text-zinc-200" />
          <button onClick={() => openWindow("notifications")} className="relative flex items-center">
            <Bell className="size-3.5 text-zinc-400 hover:text-zinc-200" />
          </button>
          <button onClick={() => openWindow("search")} className="flex items-center">
            <Search className="size-3.5 text-zinc-400 hover:text-zinc-200" />
          </button>
          <span className="rounded-full border border-[#3B82F6]/30 bg-[#3B82F6]/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.2em] text-[#3B82F6]">
            {APP_ENV}
          </span>
          <span className="text-xs text-zinc-400">{time}</span>
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="cursor-pointer rounded-full outline-none" data-testid="user-menu-trigger" aria-label="User menu">
                <UserAvatar
                  src={user.avatarUrl}
                  name={user.displayName}
                  size="sm"
                />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" sideOffset={8} className="w-56 border border-border bg-card" data-testid="user-menu-content">
                <div className="flex items-center gap-2 px-2 py-2">
                  <UserAvatar src={user.avatarUrl} name={user.displayName} size="md" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-foreground">{user.displayName}</span>
                    <span className="text-xs text-muted-foreground">@{user.username}</span>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => openWindow("profile")} data-testid="user-menu-profile">
                  <User className="size-4" /> View Profile
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => openWindow("bookmarks")} data-testid="user-menu-bookmarks">
                  <Bookmark className="size-4" /> Bookmarks
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2 cursor-pointer" data-testid="user-menu-settings">
                  <Settings className="size-4" /> Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="gap-2 cursor-pointer text-red-400"
                  onClick={() => {
                    // Defer so the dropdown fully closes before the dialog opens
                    requestAnimationFrame(() => setShowSignOutDialog(true));
                  }}
                  data-testid="user-menu-signout"
                >
                  <LogOut className="size-4" /> Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              size="xs"
              onClick={signIn}
              className="h-6 bg-[#3B82F6] px-2 text-[10px] font-semibold text-white hover:bg-[#2563EB]"
            >
              Sign In
            </Button>
          )}
        </div>
      </div>

      <Dialog open={showSignOutDialog} onOpenChange={setShowSignOutDialog}>
        <DialogContent data-testid="signout-confirm-dialog">
          <DialogHeader>
            <DialogTitle>Sign out</DialogTitle>
            <DialogDescription>
              Are you sure you want to sign out of your account?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowSignOutDialog(false)}
              data-testid="signout-cancel"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setShowSignOutDialog(false);
                void signOut();
              }}
              data-testid="signout-confirm"
            >
              <LogOut className="mr-1.5 size-4" />
              Sign Out
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
