"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/docs", label: "INTRO" },
  { href: "/docs/getting-started", label: "GETTING-STARTED" },
  { href: "/docs/commands", label: "COMMANDS" },
  { href: "/docs/providers", label: "PROVIDERS" },
  { href: "/docs/test-modes", label: "TEST-MODES" },
  { href: "/docs/reports", label: "REPORTS" },
  { href: "/docs/configuration", label: "CONFIGURATION" },
  { href: "/docs/authentication", label: "AUTHENTICATION" },
  { href: "/docs/faq", label: "FAQ" },
];

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-black">
      {/* Sidebar */}
      <aside className="sticky top-0 h-screen w-64 shrink-0 border-r border-emerald-500/20 bg-black/95 p-6 overflow-y-auto">
        <Link href="/" className="block mb-8">
          <span className="font-mono text-sm font-bold text-emerald-400 tracking-widest">
            GETWIRED
          </span>
          <span className="font-mono text-[10px] text-emerald-600 block mt-1">DOCS</span>
        </Link>
        <nav className="flex flex-col gap-1" aria-label="Documentation">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded px-3 py-2 font-mono text-xs transition ${
                  isActive
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                    : "text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/5 border border-transparent"
                }`}
              >
                [{item.label}]
              </Link>
            );
          })}
        </nav>
        <div className="mt-8 pt-6 border-t border-emerald-500/10">
          <a
            href="https://github.com/JaySym-ai/getwired"
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-[10px] text-emerald-600 hover:text-emerald-400 transition"
          >
            GitHub &rarr;
          </a>
        </div>
      </aside>

      {/* Main content */}
      <main id="main-content" className="flex-1 overflow-y-auto">
        {/* Top banner */}
        <div
          className="w-full border-b border-emerald-500/20 py-2 text-center"
          style={{
            background: "linear-gradient(90deg, rgba(6,78,59,0.3) 0%, transparent 50%, rgba(6,78,59,0.3) 100%)",
            boxShadow: "0 0 24px rgba(16, 185, 129, 0.1)",
          }}
        >
          <div className="flex items-center justify-center gap-2">
            <span className="font-mono text-xs text-emerald-500">
              Community-driven · Built with{" "}
              <a
                href="https://pxllnk.co/intent-getwired"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-400 hover:text-emerald-300 underline underline-offset-2 transition"
              >
                Intent
              </a>
              {" "}by{" "}
              <a
                href="https://www.reddit.com/r/AugmentCodeAI/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-400 hover:text-emerald-300 underline underline-offset-2 transition"
              >
                Augment Code Community
              </a>
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-8 py-12">
          {children}
        </div>

        {/* Footer */}
        <footer className="border-t border-emerald-500/10 py-6 text-center">
          <p className="font-mono text-[10px] text-emerald-600">
            &copy; 2026 GetWired &middot;{" "}
            <a
              href="https://github.com/JaySym-ai/getwired"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-emerald-400 transition"
            >
              Open Source
            </a>
          </p>
        </footer>
      </main>
    </div>
  );
}
