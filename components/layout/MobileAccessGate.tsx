import { Monitor } from "lucide-react";

/**
 * Full-screen gate shown only on mobile viewports (below the `lg` breakpoint).
 * Uses pure CSS (Tailwind responsive utilities) so it works without JS hydration
 * and cannot be bypassed by disabling JavaScript.
 */
export function MobileAccessGate() {
  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background px-6 text-center lg:hidden"
      aria-label="Desktop required notice"
    >
      <div className="flex flex-col items-center gap-6 max-w-md">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <Monitor className="h-8 w-8 text-primary" />
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Desktop Required
        </h1>

        <p className="text-base leading-relaxed text-muted-foreground">
          For the best experience, please access GetWired on a desktop or laptop
          computer with a larger screen.
        </p>
      </div>
    </div>
  );
}

