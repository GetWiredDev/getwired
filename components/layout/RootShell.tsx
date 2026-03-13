"use client";

import { usePathname } from "next/navigation";
import { Desktop } from "@/components/desktop/Desktop";
import { Navbar } from "@/components/layout/Navbar";

export function RootShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isAuthPage =
    !pathname ||
    pathname.startsWith("/sign-in") ||
    pathname.startsWith("/sign-up");

  if (isAuthPage) {
    return children;
  }

  if (pathname === "/") {
    return (
      <>
        {/* Desktop: window-manager UI */}
        <div className="hidden lg:block">
          <Desktop />
        </div>
        {/* Mobile: standard feed layout with bottom nav padding */}
        <div className="lg:hidden">
          <Navbar />
          <div className="pt-14 pb-16">{children}</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="pt-14 pb-16 md:pb-0">{children}</div>
    </>
  );
}
