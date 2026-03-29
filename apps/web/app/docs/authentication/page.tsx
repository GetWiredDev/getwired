import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Authentication",
  description:
    "How to test pages behind login: cookie injection, localStorage tokens, environment variable secrets, and login flow automation with GetWired.",
  alternates: { canonical: "https://getwired.dev/docs/authentication" },
};

export default function Authentication() {
  return (
    <div>
      <h1 className="font-mono text-2xl font-bold text-emerald-400 tracking-wider">
        [AUTHENTICATION]
      </h1>
      <p className="mt-2 font-mono text-sm text-emerald-500/50">
        Test pages behind login &mdash; securely.
      </p>

      {/* Overview */}
      <section className="mt-10">
        <h2 className="font-mono text-base font-bold text-emerald-300">Overview</h2>
        <p className="mt-3 font-mono text-xs text-emerald-500/60 leading-relaxed">
          Many apps require authentication to reach the pages you want to test.
          GetWired supports three methods, from safest to simplest:
        </p>
        <ol className="mt-4 ml-4 list-decimal font-mono text-xs text-emerald-500/60 leading-relaxed space-y-1">
          <li><strong className="text-emerald-400">Cookie / localStorage injection</strong> &mdash; inject session tokens directly, no credentials needed</li>
          <li><strong className="text-emerald-400">Environment variable references</strong> &mdash; reference secrets from your shell or CI, never stored in config</li>
          <li><strong className="text-emerald-400">Login flow automation</strong> &mdash; fill a login form automatically before tests run</li>
        </ol>
      </section>

      {/* Security principles */}
      <section className="mt-10">
        <h2 className="font-mono text-base font-bold text-emerald-300">Security Principles</h2>
        <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/5 p-5 font-mono text-xs text-amber-400/80 leading-relaxed space-y-2">
          <div><strong>Never put real passwords in config.json.</strong> Use <code className="text-amber-300">$ENV_VAR</code> references instead.</div>
          <div><strong>Add <code className="text-amber-300">.getwired/</code> to your <code className="text-amber-300">.gitignore</code></strong> if you store any auth state locally.</div>
          <div><strong>Prefer cookie injection over login credentials.</strong> Cookies are short-lived and don&apos;t expose your password.</div>
          <div><strong>In CI, use your platform&apos;s secrets manager</strong> (GitHub Actions secrets, Vault, etc.) and reference them via env vars.</div>
        </div>
      </section>

      {/* Method 1: Cookie injection */}
      <section className="mt-10">
        <h2 className="font-mono text-base font-bold text-emerald-300">Method 1: Cookie Injection (Recommended)</h2>
        <p className="mt-3 font-mono text-xs text-emerald-500/60 leading-relaxed">
          The safest approach. Log into your app manually, copy the session cookie, and tell GetWired to inject it.
          Your actual username and password never touch GetWired.
        </p>

        <h3 className="mt-6 font-mono text-xs font-bold text-emerald-400/80">Step 1: Find your session cookie</h3>
        <p className="mt-2 font-mono text-xs text-emerald-500/60 leading-relaxed">
          Open your app in a browser, log in, then open DevTools &rarr; Application &rarr; Cookies.
          Copy the session cookie name and value (e.g. <code className="text-emerald-400">session_id</code>).
        </p>

        <h3 className="mt-6 font-mono text-xs font-bold text-emerald-400/80">Step 2: Add to config</h3>
        <div className="mt-3 rounded-lg border border-emerald-500/15 bg-black/40 p-5 font-mono text-xs">
          <pre className="text-emerald-500/60 leading-relaxed whitespace-pre">{`// .getwired/config.json
{
  "authentication": {
    "cookies": [
      {
        "name": "session_id",
        "value": "$SESSION_TOKEN",
        "path": "/"
      }
    ]
  }
}`}</pre>
        </div>
        <p className="mt-3 font-mono text-xs text-emerald-500/60 leading-relaxed">
          The <code className="text-emerald-400">$SESSION_TOKEN</code> reference means GetWired reads the value from your
          environment at runtime &mdash; it is never saved to disk.
        </p>

        <h3 className="mt-6 font-mono text-xs font-bold text-emerald-400/80">Step 3: Set the env var and run</h3>
        <div className="mt-3 rounded-lg border border-emerald-500/15 bg-black/40 p-5 font-mono text-xs">
          <pre className="text-emerald-500/60 leading-relaxed whitespace-pre">{`export SESSION_TOKEN="abc123..."
getwired test`}</pre>
        </div>
      </section>

      {/* Method 2: localStorage */}
      <section className="mt-10">
        <h2 className="font-mono text-base font-bold text-emerald-300">Method 2: localStorage Injection</h2>
        <p className="mt-3 font-mono text-xs text-emerald-500/60 leading-relaxed">
          Some apps (especially SPAs) store auth tokens in localStorage instead of cookies. Same idea &mdash; inject the token, skip the login.
        </p>
        <div className="mt-4 rounded-lg border border-emerald-500/15 bg-black/40 p-5 font-mono text-xs">
          <pre className="text-emerald-500/60 leading-relaxed whitespace-pre">{`// .getwired/config.json
{
  "authentication": {
    "localStorage": {
      "auth_token": "$AUTH_TOKEN",
      "refresh_token": "$REFRESH_TOKEN"
    }
  }
}`}</pre>
        </div>
        <div className="mt-3 rounded-lg border border-emerald-500/15 bg-black/40 p-5 font-mono text-xs">
          <pre className="text-emerald-500/60 leading-relaxed whitespace-pre">{`export AUTH_TOKEN="eyJhbGci..."
export REFRESH_TOKEN="dGhpcyBp..."
getwired test`}</pre>
        </div>
      </section>

      {/* Method 3: Login flow */}
      <section className="mt-10">
        <h2 className="font-mono text-base font-bold text-emerald-300">Method 3: Login Flow Automation</h2>
        <p className="mt-3 font-mono text-xs text-emerald-500/60 leading-relaxed">
          If you need GetWired to actually fill in a login form, provide a <code className="text-emerald-400">loginUrl</code> and <code className="text-emerald-400">credentials</code>.
          Always use env var references for the values.
        </p>
        <div className="mt-4 rounded-lg border border-emerald-500/15 bg-black/40 p-5 font-mono text-xs">
          <pre className="text-emerald-500/60 leading-relaxed whitespace-pre">{`// .getwired/config.json
{
  "authentication": {
    "loginUrl": "http://localhost:3000/login",
    "credentials": {
      "username": "$TEST_USER",
      "password": "$TEST_PASSWORD"
    }
  }
}`}</pre>
        </div>
        <div className="mt-3 rounded-lg border border-emerald-500/15 bg-black/40 p-5 font-mono text-xs">
          <pre className="text-emerald-500/60 leading-relaxed whitespace-pre">{`export TEST_USER="testuser@example.com"
export TEST_PASSWORD="s3cure-t3st-passw0rd"
getwired test`}</pre>
        </div>
        <p className="mt-3 font-mono text-xs text-emerald-500/60 leading-relaxed">
          GetWired will navigate to the login URL, find common form fields
          (email/username, password), fill them, submit, wait for the page to load,
          then proceed with testing.
        </p>
        <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 font-mono text-xs text-amber-400/80 leading-relaxed">
          <strong>Tip:</strong> Use a dedicated test account with limited permissions &mdash; never your personal or admin credentials.
        </div>
      </section>

      {/* CI/CD */}
      <section className="mt-10">
        <h2 className="font-mono text-base font-bold text-emerald-300">CI/CD Example</h2>
        <p className="mt-3 font-mono text-xs text-emerald-500/60 leading-relaxed">
          In CI, set secrets through your platform&apos;s secrets manager. Here&apos;s a GitHub Actions example:
        </p>
        <div className="mt-4 rounded-lg border border-emerald-500/15 bg-black/40 p-5 font-mono text-xs">
          <pre className="text-emerald-500/60 leading-relaxed whitespace-pre">{`# .github/workflows/test.yml
- name: Run GetWired
  env:
    SESSION_TOKEN: \${{ secrets.TEST_SESSION_TOKEN }}
  run: getwired test`}</pre>
        </div>
        <p className="mt-3 font-mono text-xs text-emerald-500/60 leading-relaxed">
          The secret is injected at runtime by GitHub Actions, never stored in your repo.
        </p>
      </section>

      {/* Combining methods */}
      <section className="mt-10">
        <h2 className="font-mono text-base font-bold text-emerald-300">Combining Methods</h2>
        <p className="mt-3 font-mono text-xs text-emerald-500/60 leading-relaxed">
          You can combine cookies, localStorage, and login flow in the same config. GetWired applies them in order:
        </p>
        <ol className="mt-3 ml-4 list-decimal font-mono text-xs text-emerald-500/60 leading-relaxed space-y-1">
          <li>Opens the login URL (or your app URL)</li>
          <li>Injects cookies</li>
          <li>Injects localStorage</li>
          <li>Fills and submits the login form (if credentials are set)</li>
          <li>Navigates to your app and starts testing</li>
        </ol>
      </section>

      {/* Full config reference */}
      <section className="mt-10">
        <h2 className="font-mono text-base font-bold text-emerald-300">Full Config Reference</h2>
        <div className="mt-4 rounded-lg border border-emerald-500/15 bg-black/40 p-5 font-mono text-xs">
          <pre className="text-emerald-500/60 leading-relaxed whitespace-pre">{`{
  "authentication": {
    "cookies": [
      {
        "name": "session_id",   // cookie name (required)
        "value": "$ENV_VAR",    // value or $ENV reference (required)
        "domain": ".example.com", // optional
        "path": "/",              // optional, defaults to /
        "secure": true,           // optional
        "httpOnly": false         // optional
      }
    ],
    "localStorage": {
      "key": "$ENV_VAR"         // key-value pairs
    },
    "loginUrl": "http://...",   // URL of login page
    "credentials": {
      "username": "$TEST_USER",
      "password": "$TEST_PASS"
    }
  }
}`}</pre>
        </div>
      </section>

      <div className="mt-12 flex justify-between">
        <Link
          href="/docs/configuration"
          className="rounded border border-emerald-500/20 px-4 py-2 font-mono text-xs text-emerald-500/60 transition hover:border-emerald-400/50 hover:bg-emerald-400 hover:text-black"
        >
          &larr; Configuration
        </Link>
        <Link
          href="/docs/faq"
          className="rounded border border-emerald-500/20 px-4 py-2 font-mono text-xs text-emerald-500/60 transition hover:border-emerald-400/50 hover:bg-emerald-400 hover:text-black"
        >
          Next: FAQ &rarr;
        </Link>
      </div>
    </div>
  );
}
