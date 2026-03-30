import Link from "next/link";

export default function NotFound() {
  return (
    <main
      id="main-content"
      className="flex min-h-screen flex-col items-center justify-center bg-black px-4"
    >
      <h1 className="font-mono text-6xl font-bold text-emerald-400">404</h1>
      <p className="mt-4 font-mono text-sm text-emerald-500">
        Page not found — this wire leads nowhere.
      </p>
      <div className="mt-8 flex gap-4">
        <Link
          href="/"
          className="rounded border border-emerald-500/20 px-4 py-2 font-mono text-xs text-emerald-500 transition hover:border-emerald-400/50 hover:bg-emerald-400 hover:text-black"
        >
          ← Home
        </Link>
        <Link
          href="/docs"
          className="rounded border border-emerald-500/20 px-4 py-2 font-mono text-xs text-emerald-500 transition hover:border-emerald-400/50 hover:bg-emerald-400 hover:text-black"
        >
          Docs
        </Link>
      </div>
    </main>
  );
}
