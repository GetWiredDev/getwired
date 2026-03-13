"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Home,
  MessageSquare,
  Newspaper,
  MessagesSquare,
  Compass,
  Search,
  Menu,
  LogOut,
  User,
  Bookmark,
  Settings,
} from "lucide-react";
import { NotificationBell } from "@/components/shared/NotificationBell";
import { Button } from "@/components/ui/button";
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
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { UserAvatar } from "@/components/shared/Avatar";
import { useAppAuth } from "@/lib/auth";
import { APP_ENV } from "@/lib/env";

const NAV_LINKS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/forums", label: "Forums", icon: MessageSquare },
  { href: "/news", label: "News", icon: Newspaper },
  { href: "/chat", label: "Chat", icon: MessagesSquare },
  { href: "/discover", label: "Discover", icon: Compass },
];

export function Navbar() {
  const { user, isSignedIn, signIn, signOut } = useAppAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-14 border-b border-border bg-background/50 backdrop-blur-xl" data-testid="navbar" aria-label="Main navigation">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight" data-testid="navbar-logo" aria-label="GetWired.dev home">
          <span className="text-foreground">GetWired</span>
          <span className="text-[#3B82F6] text-glow">.dev</span>
          <span className="rounded-full border border-[#3B82F6]/30 bg-[#3B82F6]/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#3B82F6]">
            {APP_ENV}
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex" data-testid="navbar-links">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              data-testid={`nav-link-${link.label.toLowerCase()}`}
              aria-label={`Navigate to ${link.label}`}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <link.icon className="size-4" />
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2" data-testid="navbar-actions">
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground" render={<Link href="/search" />} data-testid="nav-search-button" aria-label="Search">
            <Search className="size-4" />
          </Button>

          <NotificationBell />

          {isSignedIn && user ? (
            <UserMenu user={user} onSignOut={signOut} />
          ) : (
            <Button size="sm" onClick={signIn} className="bg-[#3B82F6] text-white hover:bg-[#3B82F6]/80" data-testid="sign-in-button" aria-label="Sign in">
              Sign In
            </Button>
          )}

          <MobileMenu />
        </div>
      </div>
    </nav>
  );
}

function UserMenu({
  user,
  onSignOut,
}: {
  user: { displayName: string; username: string; avatarUrl: string };
  onSignOut: () => Promise<void>;
}) {
  const [showSignOutDialog, setShowSignOutDialog] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger className="hidden cursor-pointer rounded-full outline-none md:block" data-testid="user-menu-trigger" aria-label="User menu">
          <UserAvatar src={user.avatarUrl} name={user.displayName} size="md" />
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
          <Link href={`/profile/${user.username}`}>
            <DropdownMenuItem className="gap-2 cursor-pointer" data-testid="user-menu-profile">
              <User className="size-4" /> View Profile
            </DropdownMenuItem>
          </Link>
          <Link href="/bookmarks">
            <DropdownMenuItem className="gap-2 cursor-pointer" data-testid="user-menu-bookmarks">
              <Bookmark className="size-4" /> Bookmarks
            </DropdownMenuItem>
          </Link>
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
                void onSignOut();
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

function MobileMenu() {
  return (
    <Sheet>
      <SheetTrigger className="md:hidden" data-testid="mobile-menu-trigger" aria-label="Open mobile menu" render={<Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground" />}>
        <Menu className="size-5" />
      </SheetTrigger>
      <SheetContent side="left" className="w-72 border-r border-border bg-background">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-1 text-lg font-bold">
            <span className="text-foreground">GetWired</span>
            <span className="text-[#3B82F6]">.dev</span>
          </SheetTitle>
        </SheetHeader>
        <nav className="mt-6 flex flex-col gap-1 px-2">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <link.icon className="size-4" />
              {link.label}
            </Link>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
