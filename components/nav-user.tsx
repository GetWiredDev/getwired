"use client";

import { useState, useRef, useEffect } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { LogOut, ChevronUp } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export function NavUser() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!user) return null;

  const initials = (user.fullName ?? user.primaryEmailAddress?.emailAddress ?? "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 cursor-pointer"
        style={{ background: open ? "var(--accent-subtle)" : "transparent" }}
      >
        {user.imageUrl ? (
          <img
            src={user.imageUrl}
            alt={user.fullName ?? ""}
            className="h-7 w-7 rounded-full object-cover ring-2"
            style={{ outlineColor: "var(--border-color)" }}
          />
        ) : (
          <div
            className="h-7 w-7 rounded-full flex items-center justify-center text-[11px] font-semibold"
            style={{ background: "var(--accent-subtle)", color: "var(--accent)" }}
          >
            {initials}
          </div>
        )}
        <div className="flex flex-col text-left text-xs leading-tight flex-1 min-w-0">
          <span className="font-medium truncate" style={{ color: "var(--fg)" }}>
            {user.fullName ?? "User"}
          </span>
          <span className="truncate" style={{ color: "var(--fg-muted)" }}>
            {user.primaryEmailAddress?.emailAddress}
          </span>
        </div>
        <ChevronUp
          className="h-4 w-4 shrink-0 transition-transform duration-200"
          style={{
            color: "var(--fg-muted)",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
          }}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.15, ease: "easeOut" as const }}
            className="absolute bottom-full left-0 right-0 mb-2 rounded-xl p-1"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-color)",
              boxShadow: "var(--shadow-lg)",
            }}
          >
            <button
              onClick={() => signOut()}
              className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg text-sm transition-all duration-150 cursor-pointer"
              style={{ color: "var(--destructive)" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "var(--bg-card-hover)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

