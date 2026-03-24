"use client";

import {
  LayoutDashboard,
  FolderKanban,
  Bot,
  Settings,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavUser } from "@/components/nav-user";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/" },
  { label: "Projects", icon: FolderKanban, href: "/projects" },
  { label: "Agent", icon: Bot, href: "/agent" },
  { label: "Settings", icon: Settings, href: "/settings" },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="fixed left-0 top-0 bottom-0 z-40 flex flex-col"
      style={{
        width: "var(--sidebar-width)",
        background: "var(--bg-secondary)",
        borderRight: "1px solid var(--border-color)",
      }}
    >
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-4 h-[52px] shrink-0">
        <div
          className="flex h-7 w-7 items-center justify-center rounded-lg text-white"
          style={{ background: "var(--accent)" }}
        >
          <Zap className="h-3.5 w-3.5" />
        </div>
        <span className="text-[13px] font-bold tracking-tight" style={{ color: "var(--fg)" }}>
          GetWired
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-2 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href}>
              <div
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150 cursor-pointer"
                style={{
                  color: isActive ? "#fff" : "var(--fg-secondary)",
                  background: isActive ? "var(--accent)" : "transparent",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.background = "var(--bg-card-hover)";
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.background = "transparent";
                }}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="px-2 pb-3">
        <NavUser />
      </div>
    </aside>
  );
}

