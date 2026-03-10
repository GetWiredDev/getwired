import Link from "next/link";
import { UserX } from "lucide-react";

export default function ProfileNotFound() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
      <UserX className="size-16 text-muted-foreground mx-auto" />
      <h1 className="text-2xl font-bold text-foreground">User Not Found</h1>
      <p className="text-muted-foreground">
        The profile you&apos;re looking for doesn&apos;t exist or has been removed.
      </p>
      <Link href="/" className="inline-flex items-center justify-center h-8 rounded-lg border border-border bg-background px-4 text-sm font-medium hover:bg-muted transition-colors">
        Back to Home
      </Link>
    </main>
  );
}

