"use client";

import { useConvexAuth } from "convex/react";
import { useMutation } from "convex/react";
import { useEffect, useRef } from "react";
import { useUser, useAuth } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";

import { AppSidebar } from "@/components/app-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated: isConvexAuthenticated, isLoading: isConvexLoading } = useConvexAuth();
  const { isSignedIn, isLoaded: isClerkLoaded } = useAuth();
  const { user } = useUser();
  const ensureUser = useMutation(api.users.ensureUser);
  const hasEnsuredUser = useRef(false);

  useEffect(() => {
    if (isConvexAuthenticated && user && !hasEnsuredUser.current) {
      hasEnsuredUser.current = true;
      ensureUser({
        clerkId: user.id,
        email: user.primaryEmailAddress?.emailAddress ?? "",
        name: user.fullName ?? undefined,
        imageUrl: user.imageUrl ?? undefined,
      });
    }
  }, [isConvexAuthenticated, user, ensureUser]);

  if (!isClerkLoaded || isConvexLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: "var(--bg)" }}>
        <div className="flex flex-col items-center gap-4">
          <div
            className="h-10 w-10 rounded-xl animate-pulse"
            style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-hover))" }}
          />
          <div className="h-1 w-24 rounded-full overflow-hidden" style={{ background: "var(--border-color)" }}>
            <div className="h-full w-1/2 rounded-full shimmer" style={{ background: "var(--accent)" }} />
          </div>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return null;
  }

  return (
    <div className="flex min-h-screen" style={{ background: "var(--bg)" }}>
      <AppSidebar />
      <div className="flex-1 flex flex-col" style={{ marginLeft: "var(--sidebar-width)" }}>
        {/* Header */}
        <header
          className="sticky top-0 z-30 flex items-center justify-end px-6 shrink-0"
          style={{
            height: "var(--header-height)",
            background: "var(--bg)",
            borderBottom: "1px solid var(--border-subtle)",
          }}
        >
          <ThemeToggle />
        </header>

        {/* Main content */}
        <main className="flex-1 flex flex-col overflow-hidden px-6 py-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}

