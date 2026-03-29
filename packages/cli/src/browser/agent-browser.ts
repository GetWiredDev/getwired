import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const BINARY = "agent-browser";
const DEFAULT_TIMEOUT = 30_000;

// Strip ANSI escape codes from output
function stripAnsi(str: string): string {
  return str.replace(/\x1B\[[0-9;]*[a-zA-Z]/g, "").replace(/\x1B\].*?\x07/g, "");
}

async function exec(args: string[], timeout = DEFAULT_TIMEOUT): Promise<string> {
  const { stdout } = await execFileAsync(BINARY, args, {
    encoding: "utf-8",
    timeout,
    env: { ...process.env, NO_COLOR: "1", FORCE_COLOR: "0" },
  });
  return stripAnsi(stdout).trim();
}

// ─── Navigation ──────────────────────────────────────────────

export async function open(
  url: string,
  options?: { viewport?: string; userAgent?: string; waitUntil?: string; timeout?: number },
): Promise<string> {
  const args = ["open", url];
  if (options?.viewport) args.push("--viewport", options.viewport);
  if (options?.userAgent) args.push("--user-agent", options.userAgent);
  return exec(args, options?.timeout ?? 30_000);
}

export async function back(): Promise<string> {
  return exec(["back"]);
}

export async function forward(): Promise<string> {
  return exec(["forward"]);
}

// ─── Interaction ─────────────────────────────────────────────

export async function click(selector: string): Promise<string> {
  return exec(["click", selector]);
}

export async function fill(selector: string, value: string): Promise<string> {
  return exec(["fill", selector, value]);
}

export async function selectOption(selector: string, value: string): Promise<string> {
  return exec(["select", selector, value]);
}

export async function hover(selector: string): Promise<string> {
  return exec(["hover", selector]);
}

export async function check(selector: string): Promise<string> {
  return exec(["check", selector]);
}

export async function press(key: string): Promise<string> {
  return exec(["press", key]);
}

export async function type(selector: string, text: string): Promise<string> {
  return exec(["type", selector, text]);
}

// ─── Snapshot & Screenshot ───────────────────────────────────

export interface SnapshotOptions {
  interactive?: boolean;
  compact?: boolean;
  scope?: string;
  depth?: number;
}

export async function snapshot(options?: SnapshotOptions): Promise<string> {
  const args = ["snapshot"];
  if (options?.interactive) args.push("-i");
  if (options?.compact) args.push("-c");
  if (options?.scope) args.push("-s", options.scope);
  if (options?.depth) args.push("-d", String(options.depth));
  return exec(args);
}

export async function screenshot(path: string, options?: { fullPage?: boolean }): Promise<string> {
  const args = ["screenshot", path];
  if (options?.fullPage) args.push("--full-page");
  return exec(args);
}

// ─── JavaScript Execution ────────────────────────────────────

export async function evaluate(script: string): Promise<string> {
  // Use base64 encoding to avoid shell escaping issues with complex scripts
  const encoded = Buffer.from(script, "utf-8").toString("base64");
  const raw = await exec(["eval", "-b", encoded], 15_000);
  // agent-browser may prefix output with status lines — extract the last meaningful line
  const lines = raw.split("\n").filter((l) => l.trim().length > 0);
  return lines[lines.length - 1] ?? raw;
}

/**
 * Run JS in the browser and return parsed JSON.
 * Handles agent-browser's double-encoding (JSON.stringify results get quoted).
 */
export async function evaluateJson<T = unknown>(script: string): Promise<T> {
  const raw = await evaluate(script);
  let parsed = JSON.parse(raw);
  // agent-browser wraps JSON.stringify results in quotes — unwrap if needed
  if (typeof parsed === "string") {
    try { parsed = JSON.parse(parsed); } catch { /* keep as string */ }
  }
  return parsed as T;
}

// ─── Wait ────────────────────────────────────────────────────

export async function waitForLoad(strategy: string = "networkidle"): Promise<string> {
  return exec(["wait", "--load", strategy], 30_000);
}

export async function waitForText(text: string): Promise<string> {
  return exec(["wait", "--text", text]);
}

export async function waitForSelector(selector: string): Promise<string> {
  return exec(["wait", selector]);
}

export async function waitMs(ms: number): Promise<string> {
  return exec(["wait", String(ms)]);
}

// ─── Scroll ──────────────────────────────────────────────────

export async function scroll(distance: number): Promise<string> {
  const direction = distance >= 0 ? "down" : "up";
  return exec(["scroll", direction, String(Math.abs(distance))]);
}

// ─── Authentication ─────────────────────────────────────────

import type { AuthCookie } from "../config/settings.js";

/**
 * Inject cookies into the current browser session via JavaScript.
 * Must be called after `open()` so there's an active page on the correct domain.
 */
export async function injectCookies(cookies: AuthCookie[]): Promise<void> {
  if (cookies.length === 0) return;
  const cookieStrings = cookies.map((c) => {
    let str = `${encodeURIComponent(c.name)}=${encodeURIComponent(c.value)}`;
    if (c.path) str += `; path=${c.path}`;
    if (c.domain) str += `; domain=${c.domain}`;
    if (c.secure) str += "; secure";
    return str;
  });
  const script = cookieStrings
    .map((cs) => `document.cookie = ${JSON.stringify(cs)};`)
    .join("\n");
  await evaluate(script);
}

/**
 * Inject key/value pairs into localStorage in the current browser session.
 * Must be called after `open()` so there's an active page on the correct domain.
 */
export async function injectLocalStorage(entries: Record<string, string>): Promise<void> {
  const keys = Object.keys(entries);
  if (keys.length === 0) return;
  const lines = keys.map(
    (k) => `localStorage.setItem(${JSON.stringify(k)}, ${JSON.stringify(entries[k])});`,
  );
  await evaluate(lines.join("\n"));
}

// ─── Session Management ──────────────────────────────────────

export async function close(): Promise<string> {
  try {
    return await exec(["close"]);
  } catch {
    return ""; // Daemon may already be stopped
  }
}

/**
 * Inject a console/error catcher into the current page.
 * Works around agent-browser not having native event listeners.
 */
export async function injectErrorCatcher(): Promise<void> {
  await evaluate(`
    window.__gw_errors = window.__gw_errors || { console: [], network: [] };
    if (!window.__gw_patched) {
      const origError = console.error;
      console.error = function() {
        window.__gw_errors.console.push(Array.from(arguments).join(' '));
        origError.apply(console, arguments);
      };
      window.addEventListener('error', function(e) {
        window.__gw_errors.console.push(e.message || String(e));
      });
      window.__gw_patched = true;
    }
  `);
}

/**
 * Retrieve captured console errors and network errors from the page.
 */
export async function getCollectedErrors(): Promise<{ console: string[]; network: string[] }> {
  try {
    return await evaluateJson(`JSON.stringify(window.__gw_errors || { console: [], network: [] })`);
  } catch {
    return { console: [], network: [] };
  }
}
