import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, Zap } from "lucide-react";

export default function NotFound() {
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="relative mb-6">
        <div className="text-8xl font-black text-[#00FF41]/10 select-none">404</div>
        <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-16 text-[#00FF41] animate-pulse" />
      </div>
      <h1 className="text-2xl font-bold text-white mb-2">Page Not Found</h1>
      <p className="text-muted-foreground mb-6 max-w-md">
        Looks like this wire got disconnected. The page you&apos;re looking for
        doesn&apos;t exist or has been moved.
      </p>
      <Link href="/">
        <Button className="gap-2 bg-[#00FF41] text-black hover:bg-[#00FF41]/80 font-semibold">
          <Home className="size-4" />
          Go Home
        </Button>
      </Link>
    </main>
  );
}

