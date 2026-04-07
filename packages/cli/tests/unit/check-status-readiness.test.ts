import assert from "node:assert/strict";
import { chmod, mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { delimiter, join } from "node:path";
import { describe, it } from "node:test";

import { registerCheckStatus } from "../../src/mcp/tools/check-status.js";
import { checkAgentBrowserInstalled, checkProviderCliInstalled } from "../../src/providers/ensure-cli.js";

type HandlerResponse = { content: Array<{ type: string; text: string }>; isError?: boolean };

type ReadinessBody = {
  initialized: boolean;
  readiness: {
    providerCli: { installed: boolean; binary: string; name: string };
    agentBrowser: { installed: boolean };
    urlReachable: { reachable: boolean | null; url: string | null; error?: string };
    ready: boolean;
  };
};

async function withPathBins<T>(bins: string[], run: () => Promise<T> | T): Promise<T> {
  const originalPath = process.env.PATH;
  const binDir = await mkdtemp(join(tmpdir(), "check-status-bins-"));
  for (const bin of bins) {
    const binPath = join(binDir, bin);
    await writeFile(binPath, "#!/bin/sh\nexit 0\n");
    await chmod(binPath, 0o755);
  }
  process.env.PATH = [binDir].join(delimiter);
  try {
    return await run();
  } finally {
    if (originalPath === undefined) delete process.env.PATH;
    else process.env.PATH = originalPath;
    await rm(binDir, { recursive: true, force: true });
  }
}

async function createProjectConfig(provider: string, url?: string): Promise<string> {
  const projectPath = await mkdtemp(join(tmpdir(), "check-status-project-"));
  await mkdir(join(projectPath, ".getwired"), { recursive: true });
  await writeFile(join(projectPath, ".getwired", "config.json"), `${JSON.stringify({
    provider,
    project: { name: "test-project", url },
    testing: { deviceProfile: "desktop" },
  }, null, 2)}\n`);
  return projectPath;
}

function getCheckStatusHandler(): (args: { project_path: string }) => Promise<HandlerResponse> {
  let handler: ((args: { project_path: string }) => Promise<HandlerResponse>) | undefined;
  registerCheckStatus({
    tool: (_name: string, _description: string, _schema: unknown, fn: typeof handler) => {
      handler = fn;
    },
  } as never);
  assert.ok(handler, "expected registerCheckStatus to register a handler");
  return handler;
}

async function invokeCheckStatus(projectPath: string): Promise<ReadinessBody> {
  const response = await getCheckStatusHandler()({ project_path: projectPath });
  assert.equal(response.isError, undefined);
  return JSON.parse(response.content[0]?.text ?? "{}") as ReadinessBody;
}

async function withHttpServer<T>(run: (url: string) => Promise<T>): Promise<T> {
  const server = createServer((_req, res) => {
    res.statusCode = 200;
    res.end();
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", () => resolve()));
  const address = server.address();
  assert.ok(address && typeof address !== "string");
  try {
    return await run(`http://127.0.0.1:${address.port}`);
  } finally {
    await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
}

describe("check-status readiness", () => {
  it("checkProviderCliInstalled reports installed and missing states for a supported provider", async () => {
    await withPathBins(["claude"], async () => {
      assert.deepEqual(checkProviderCliInstalled("claude-code"), {
        installed: true,
        binary: "claude",
        displayName: "Claude Code",
      });
    });
    await withPathBins([], async () => {
      assert.deepEqual(checkProviderCliInstalled("claude-code"), {
        installed: false,
        binary: "claude",
        displayName: "Claude Code",
      });
    });
  });

  it("checkAgentBrowserInstalled returns the expected shape for installed and missing states", async () => {
    await withPathBins(["agent-browser"], async () => {
      assert.deepEqual(checkAgentBrowserInstalled(), { installed: true });
    });
    await withPathBins([], async () => {
      assert.deepEqual(checkAgentBrowserInstalled(), { installed: false });
    });
  });

  it("handler reports readiness when provider, browser, and configured URL are reachable", async () => {
    await withHttpServer(async (url) => {
      const projectPath = await createProjectConfig("claude-code", url);
      try {
        const body = await withPathBins(["claude", "agent-browser"], () => invokeCheckStatus(projectPath));
        assert.equal(body.initialized, true);
        assert.deepEqual(body.readiness.providerCli, { installed: true, binary: "claude", name: "Claude Code" });
        assert.deepEqual(body.readiness.agentBrowser, { installed: true });
        assert.equal(body.readiness.urlReachable.reachable, true);
        assert.equal(body.readiness.urlReachable.url, url);
        assert.equal(body.readiness.ready, true);
      } finally {
        await rm(projectPath, { recursive: true, force: true });
      }
    });
  });

  it("handler marks readiness false when the URL is unreachable or the provider/browser is missing", async () => {
    const projectPath = await createProjectConfig("claude-code", "http://127.0.0.1:1");
    try {
      const unreachable = await withPathBins(["claude", "agent-browser"], () => invokeCheckStatus(projectPath));
      assert.equal(unreachable.readiness.urlReachable.reachable, false);
      assert.equal(unreachable.readiness.ready, false);

      const missingProvider = await withPathBins(["agent-browser"], () => invokeCheckStatus(projectPath));
      assert.equal(missingProvider.readiness.providerCli.installed, false);
      assert.equal(missingProvider.readiness.ready, false);

      const missingBrowser = await withPathBins(["claude"], () => invokeCheckStatus(projectPath));
      assert.equal(missingBrowser.readiness.agentBrowser.installed, false);
      assert.equal(missingBrowser.readiness.ready, false);
    } finally {
      await rm(projectPath, { recursive: true, force: true });
    }
  });

  it("handler treats an unconfigured URL as nullable and still ready when binaries are available", async () => {
    const projectPath = await createProjectConfig("claude-code");
    try {
      const body = await withPathBins(["claude", "agent-browser"], () => invokeCheckStatus(projectPath));
      assert.deepEqual(body.readiness.urlReachable, { reachable: null, url: null });
      assert.equal(body.readiness.ready, true);
    } finally {
      await rm(projectPath, { recursive: true, force: true });
    }
  });
});
