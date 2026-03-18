"use client";

import { ProfilePageClient } from "@/app/profile/[userId]/ProfilePageClient";
import { useAppAuth } from "@/lib/auth";

export function ProfileApp({ userId }: { userId?: string }) {
  const { user } = useAppAuth();
  const resolvedUserId = userId || user?.username;

  if (!resolvedUserId) {
    return <div className="p-4 text-sm text-muted-foreground">Sign in to view your profile.</div>;
  }

  return (
    <div className="p-4">
      <ProfilePageClient userId={resolvedUserId} />
    </div>
  );
}
