"use client";

import { useEffect, useState } from "react";

const demoLines = [
  { type: "cmd", text: "user@dev:~/my-project $ npx getwired test" },
  { type: "info", text: "🔌 Connected to default provider" },
  { type: "info", text: "🌐 Detected dev server at http://localhost:3000" },
  { type: "action", text: "→ Clicking random nav links like a lost user..." },
  { type: "action", text: '→ Typing "asdkjh" into the search bar...' },
  { type: "action", text: "→ Smashing the back button 5 times..." },
  { type: "action", text: "→ Submitting empty form with no fields filled..." },
  { type: "warn", text: "⚠ Found: Form submitted without validation error!" },
  { type: "action", text: '→ Entering "<script>alert(1)</script>" in name field...' },
  { type: "warn", text: "⚠ Found: XSS payload reflected in DOM!" },
  { type: "action", text: "→ Triple-clicking logo like a confused user..." },
  { type: "action", text: "→ Resizing window to 200x100 like a phone from 2007..." },
  { type: "warn", text: "⚠ Found: Layout completely broken at 200px width" },
  { type: "action", text: "→ Rage-clicking the submit button 47 times..." },
  { type: "warn", text: "⚠ Found: 47 duplicate requests sent to /api/submit!" },
  { type: "action", text: "→ Pasting a 50,000 character essay into the bio field..." },
  { type: "info", text: "📸 Taking screenshot for regression analysis..." },
  { type: "result", text: "✅ Test complete: 4 issues found, 0 regressions" },
  { type: "result", text: "📄 Report saved to ./getwired-report.html" },
];

function TerminalDemo() {
  const [visibleLines, setVisibleLines] = useState<number>(0);

  useEffect(() => {
    if (visibleLines < demoLines.length) {
      const delay =
        demoLines[visibleLines]?.type === "cmd"
          ? 1200
          : visibleLines === 0
            ? 500
            : 600 + Math.random() * 400;
      const timer = setTimeout(() => setVisibleLines((v) => v + 1), delay);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => setVisibleLines(0), 4000);
      return () => clearTimeout(timer);
    }
  }, [visibleLines]);

  const colorFor = (type: string) => {
    switch (type) {
      case "cmd":
        return "text-green-400";
      case "info":
        return "text-emerald-300/90";
      case "action":
        return "text-gray-400";
      case "warn":
        return "text-yellow-400";
      case "result":
        return "text-emerald-400 font-semibold";
      default:
        return "text-gray-400";
    }
  };

  return (
    <div
      className="w-full max-w-6xl rounded-lg border border-emerald-500/30 overflow-hidden"
      style={{
        boxShadow: "0 0 40px rgba(16, 185, 129, 0.15), 0 0 80px rgba(16, 185, 129, 0.05)",
      }}
    >
      {/* Terminal header */}
      <div className="bg-emerald-950/40 border-b border-emerald-500/20 px-4 py-3 flex items-center gap-3">
        <div className="flex gap-2">
          <div className="h-3 w-3 rounded-full bg-red-500/70" />
          <div className="h-3 w-3 rounded-full bg-yellow-500/70" />
          <div className="h-3 w-3 rounded-full bg-green-500/70" />
        </div>
        <span className="font-mono text-xs text-emerald-400/60">getwired — ~/my-project</span>
      </div>
      {/* Terminal body */}
      <div
        className="bg-black/95 p-6 font-mono text-sm leading-relaxed relative overflow-hidden"
        style={{ height: 340 }}
      >
        <div className="absolute bottom-6 left-6 right-6">
          {demoLines.slice(0, visibleLines).map((line, i) => (
            <div
              key={i}
              className={`${colorFor(line.type)} ${i === visibleLines - 1 ? "animate-pulse" : ""}`}
            >
              {line.text}
            </div>
          ))}
          {visibleLines < demoLines.length && (
            <span className="inline-block w-2 h-4 bg-emerald-400 animate-pulse mt-1" />
          )}
        </div>
      </div>
    </div>
  );
}

function ProviderLogo({ name, icon }: { name: string; icon: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-emerald-500/10 bg-black/40 px-8 py-5 transition hover:border-emerald-500/30 hover:bg-emerald-950/30 hover:shadow-[0_0_20px_rgba(16,185,129,0.1)]">
      <div className="h-10 w-10 flex items-center justify-center text-emerald-400">
        {icon}
      </div>
      <span className="font-mono text-xs text-emerald-500/70">{name}</span>
    </div>
  );
}

// Provider logo components using real brand SVGs
const ClaudeIcon = () => (
  <img src="/logos/claude-code.svg" alt="Claude Code" className="h-8 w-8" />
);

const AuggieIcon = () => (
  <img src="/logos/auggie.svg" alt="Auggie" className="h-8 w-8" />
);

const CodexIcon = () => (
  <img src="/logos/codex.svg" alt="Codex" className="h-8 w-8" />
);

const OpenCodeIcon = () => (
  <img src="/logos/opencode.svg" alt="OpenCode" className="h-8 w-8" />
);

function CopyCommand({
  command,
  label = "Click to copy",
}: {
  command: string;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="group mt-8 inline-flex items-center gap-3 rounded-lg border border-emerald-500/30 bg-black/60 px-6 py-3 font-mono text-sm text-green-400 transition hover:border-emerald-400/50 hover:bg-emerald-950/30 hover:shadow-[0_0_20px_rgba(16,185,129,0.15)]"
    >
      <span className="text-emerald-600">$</span>
      <span>{command}</span>
      <span className="ml-2 text-emerald-500/40 text-xs transition group-hover:text-emerald-400/70">
        {copied ? "Copied!" : label}
      </span>
    </button>
  );
}

function InstallSection() {
  return (
    <section className="w-full border-t border-emerald-500/10 px-4 py-20">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10">
        <div className="max-w-2xl">
          <p className="font-mono text-xs uppercase tracking-[0.35em] text-emerald-500/40">
            Install
          </p>
          <h2 className="mt-4 font-mono text-2xl text-emerald-200 sm:text-3xl">
            GetWired is live on npm
          </h2>
          <p className="mt-4 font-mono text-sm leading-7 text-emerald-500/60">
            Install it globally for daily use, or run it with npx if you want to try it without
            changing your environment.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-2xl border border-emerald-500/15 bg-emerald-950/10 p-6 shadow-[0_0_40px_rgba(16,185,129,0.06)]">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-emerald-500/40">
              Recommended
            </p>
            <CopyCommand command="npm install -g getwired" label="Copy install" />

            <div className="mt-8 rounded-xl border border-emerald-500/10 bg-black/50 p-5">
              <p className="font-mono text-xs uppercase tracking-[0.3em] text-emerald-500/40">
                Quick start
              </p>
              <div className="mt-4 space-y-4 font-mono text-sm text-emerald-300/75">
                <div>
                  <p className="text-emerald-400">1. Verify the install</p>
                  <code className="mt-2 block rounded-lg border border-emerald-500/10 bg-black/60 px-4 py-3 text-green-400">
                    $ getwired --version
                  </code>
                </div>
                <div>
                  <p className="text-emerald-400">2. Initialize in your project</p>
                  <code className="mt-2 block rounded-lg border border-emerald-500/10 bg-black/60 px-4 py-3 text-green-400">
                    $ getwired init
                  </code>
                </div>
                <div>
                  <p className="text-emerald-400">3. Run your first test</p>
                  <code className="mt-2 block rounded-lg border border-emerald-500/10 bg-black/60 px-4 py-3 text-green-400">
                    $ getwired test --url https://example.com
                  </code>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-500/15 bg-black/40 p-6">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-emerald-500/40">
              No install
            </p>
            <CopyCommand command="npx getwired@0.0.1 --version" label="Copy npx command" />
            <p className="mt-6 font-mono text-sm leading-7 text-emerald-500/60">
              Requires Node.js 20 or newer. The package name on npm is lowercase:
              <span className="ml-2 rounded bg-emerald-950/40 px-2 py-1 text-emerald-300">
                getwired
              </span>
            </p>
            <div className="mt-6 rounded-xl border border-emerald-500/10 bg-emerald-950/10 p-5">
              <p className="font-mono text-xs uppercase tracking-[0.3em] text-emerald-500/40">
                Links
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <a
                  href="https://www.npmjs.com/package/getwired"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded border border-emerald-500/20 px-4 py-2 font-mono text-xs text-emerald-400/80 transition hover:border-emerald-400/50 hover:bg-emerald-400 hover:text-black"
                >
                  npm package
                </a>
                <a
                  href="https://github.com/JaySym-ai/getwired"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded border border-emerald-500/20 px-4 py-2 font-mono text-xs text-emerald-400/80 transition hover:border-emerald-400/50 hover:bg-emerald-400 hover:text-black"
                >
                  source
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center bg-black">
      {/* Top banner */}
      <div
        className="w-full border-b border-emerald-500/20 py-2 text-center"
        style={{
          background: "linear-gradient(90deg, rgba(6,78,59,0.3) 0%, transparent 50%, rgba(6,78,59,0.3) 100%)",
          boxShadow: "0 0 24px rgba(16, 185, 129, 0.1)",
        }}
      >
        <div className="flex items-center justify-center gap-2">
          <span className="rounded border border-emerald-400/40 bg-black/40 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-emerald-400">
            Alpha
          </span>
          <span className="font-mono text-xs text-emerald-500/60">
            Early preview — features may change
          </span>
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
        </div>
      </div>

      {/* Hero */}
      <div className="flex flex-col items-center px-4 pt-20 pb-16">
        <pre className="text-emerald-400 font-mono text-[8px] leading-tight sm:text-[10px] md:text-xs whitespace-pre select-none">
{`  ██████╗ ███████╗████████╗██╗    ██╗██╗██████╗ ███████╗██████╗
 ██╔════╝ ██╔════╝╚══██╔══╝██║    ██║██║██╔══██╗██╔════╝██╔══██╗
 ██║  ███╗█████╗     ██║   ██║ █╗ ██║██║██████╔╝█████╗  ██║  ██║
 ██║   ██║██╔══╝     ██║   ██║███╗██║██║██╔══██╗██╔══╝  ██║  ██║
 ╚██████╔╝███████╗   ██║   ╚███╔███╔╝██║██║  ██║███████╗██████╔╝
  ╚═════╝ ╚══════╝   ╚═╝    ╚══╝╚══╝ ╚═╝╚═╝  ╚═╝╚══════╝╚═════╝`}
        </pre>
        <p className="mt-4 font-mono text-base tracking-wide text-emerald-300/70 md:text-lg">
          Human-Like AI Testing CLI
        </p>
        <p className="mt-2 max-w-lg text-center font-mono text-sm text-emerald-500/50">
          Break your app before your users do. Harness AI to test like a real
          (chaotic) human.
        </p>
        <CopyCommand command="npm install -g getwired" label="Copy install" />
        <p className="mt-4 font-mono text-[11px] text-emerald-500/30">
          Community-driven &middot; Built with Intent from Augment Code
        </p>
      </div>

      {/* Terminal Demo */}
      <div className="w-full px-4 pb-20 flex flex-col items-center">
        <TerminalDemo />
      </div>

      <InstallSection />

      {/* Providers */}
      <div className="w-full border-t border-emerald-500/10 py-16 flex flex-col items-center">
        <p className="mb-8 font-mono text-xs uppercase tracking-widest text-emerald-500/40">
          Supported Providers
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <ProviderLogo name="Claude Code" icon={<ClaudeIcon />} />
          <ProviderLogo name="Auggie" icon={<AuggieIcon />} />
          <ProviderLogo name="Codex" icon={<CodexIcon />} />
          <ProviderLogo name="OpenCode" icon={<OpenCodeIcon />} />
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full border-t border-emerald-500/20 py-8">
        <div className="flex flex-col items-center gap-3">
          <div className="flex gap-3">
            <a
              href="https://github.com/JaySym-ai/getwired"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded border border-emerald-500/20 px-4 py-2 font-mono text-xs text-emerald-500/60 transition hover:border-emerald-400/50 hover:bg-emerald-400 hover:text-black"
            >
              GitHub
            </a>
            <a
              href="/docs"
              className="rounded border border-emerald-500/20 px-4 py-2 font-mono text-xs text-emerald-500/60 transition hover:border-emerald-400/50 hover:bg-emerald-400 hover:text-black"
            >
              Docs
            </a>
          </div>
          <p className="font-mono text-[10px] text-emerald-500/30">
            &copy; 2026 GetWired
          </p>
        </div>
      </footer>
    </main>
  );
}
