import assert from "node:assert/strict";
import childProcess from "node:child_process";
import { syncBuiltinESMExports } from "node:module";
import { afterEach, describe, it, mock } from "node:test";

type ExecOutcome = "ok" | "fail";
type ExecPlan = Record<string, ExecOutcome | ExecOutcome[]>;

let importNonce = 0;

function nextOutcome(command: string, plan: ExecPlan, counts: Map<string, number>): ExecOutcome {
  const seen = counts.get(command) ?? 0;
  counts.set(command, seen + 1);

  const configured = plan[command];
  if (configured === undefined) return "fail";
  if (Array.isArray(configured)) return configured[Math.min(seen, configured.length - 1)];
  return configured;
}

async function loadEnsureAgentBrowser(plan: ExecPlan) {
  const counts = new Map<string, number>();
  const logs: string[] = [];

  mock.method(console, "log", (...args: unknown[]) => {
    logs.push(args.map((arg) => String(arg)).join(" "));
  });
  mock.method(childProcess, "execSync", (command: string) => {
    if (nextOutcome(command, plan, counts) === "ok") {
      return "";
    }

    throw new Error(`mocked failure: ${command}`);
  });
  syncBuiltinESMExports();

  const moduleUrl = new URL("../../src/providers/ensure-cli.ts", import.meta.url);
  moduleUrl.searchParams.set("case", String(importNonce++));

  const { ensureAgentBrowser } = await import(moduleUrl.href);

  return { ensureAgentBrowser: ensureAgentBrowser as () => boolean, counts, logs };
}

afterEach(() => {
  mock.restoreAll();
  syncBuiltinESMExports();
});

describe("ensureAgentBrowser", () => {
  it("returns true when the binary exists and the browser engine is ready", async () => {
    const { ensureAgentBrowser, counts } = await loadEnsureAgentBrowser({
      "command -v agent-browser": "ok",
      "agent-browser install": "ok",
    });

    assert.equal(ensureAgentBrowser(), true);
    assert.equal(counts.get("npm install -g agent-browser") ?? 0, 0);
  });

  it("returns false with an actionable message when the binary exists but the browser engine is not ready", async () => {
    const { ensureAgentBrowser, counts, logs } = await loadEnsureAgentBrowser({
      "command -v agent-browser": "ok",
      "agent-browser install": "fail",
    });

    assert.equal(ensureAgentBrowser(), false);
    assert.equal(counts.get("npm install -g agent-browser") ?? 0, 0);
    assert.match(logs.join("\n"), /browser engine.*agent-browser install/i);
  });

  it("returns true when install succeeds and the browser engine is ready", async () => {
    const { ensureAgentBrowser, counts } = await loadEnsureAgentBrowser({
      "command -v agent-browser": ["fail", "ok"],
      "npm install -g agent-browser": "ok",
      "agent-browser install": "ok",
    });

    assert.equal(ensureAgentBrowser(), true);
    assert.equal(counts.get("npm install -g agent-browser"), 1);
    assert.equal(counts.get("agent-browser install"), 1);
  });

  it("returns false when install succeeds but browser engine setup fails", async () => {
    const { ensureAgentBrowser, counts, logs } = await loadEnsureAgentBrowser({
      "command -v agent-browser": ["fail", "ok"],
      "npm install -g agent-browser": "ok",
      "agent-browser install": "fail",
    });

    assert.equal(ensureAgentBrowser(), false);
    assert.equal(counts.get("npm install -g agent-browser"), 1);
    assert.equal(counts.get("agent-browser install"), 1);
    assert.match(logs.join("\n"), /installed, but browser engine setup failed.*agent-browser install/i);
  });

  it("returns false when all install methods fail", async () => {
    const { ensureAgentBrowser, counts, logs } = await loadEnsureAgentBrowser({
      "command -v agent-browser": "fail",
      "npm install -g agent-browser": "fail",
    });

    assert.equal(ensureAgentBrowser(), false);
    assert.equal(counts.get("npm install -g agent-browser"), 1);
    assert.equal(counts.get("agent-browser install") ?? 0, 0);
    assert.match(logs.join("\n"), /auto-install failed.*install manually/i);
  });
});