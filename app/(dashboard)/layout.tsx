"use client";

import { useConvexAuth } from "convex/react";
import { useMutation } from "convex/react";
import { useEffect, useRef } from "react";
import { RedirectToSignIn, useUser } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";

import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { AppSidebar } from "@/components/app-sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { user } = useUser();
  const ensureUser = useMutation(api.users.ensureUser);
  const hasEnsuredUser = useRef(false);

  useEffect(() => {
    if (isAuthenticated && user && !hasEnsuredUser.current) {
      hasEnsuredUser.current = true;
      ensureUser({
        clerkId: user.id,
        email: user.primaryEmailAddress?.emailAddress ?? "",
        name: user.fullName ?? undefined,
        imageUrl: user.imageUrl ?? undefined,
      });
    }
  }, [isAuthenticated, user, ensureUser]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <RedirectToSignIn />;
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 !h-4" />
        </header>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}

