import { spawn } from "node:child_process";
import type { Readable } from "node:stream";
import {
  TestingProvider,
  ProviderConfig,
  ProviderMessage,
  StreamChunk,
  TestContext,
  TestFinding,
  ToolCall,
} from "./types.js";
import { buildRegressionPrompt } from "./auggie.js";

export class OpenCodeProvider extends TestingProvider {
  readonly config: ProviderConfig = {
    name: "opencode",
    displayName: "OpenCode",
    authType: "subscription",
    authInstructions:
      "Requires OpenCode CLI installed plus a configured provider/model. Install via `npm install -g opencode-ai` or `brew install anomalyco/tap/opencode`. Run `opencode auth login` (or `/connect` in the TUI) to add credentials, then set a default model in your OpenCode config or via `OPENCODE_MODEL`.",
  };

  async *stream(context: TestContext, messages: ProviderMessage[]): AsyncGenerator<StreamChunk> {
    const prompt = messages.map((m) => m.content).join("\n\n");
    const proc = spawn("opencode", buildOpenCodeArgs(prompt, context.reportDir, "json"), {
      cwd: context.reportDir,
      env: buildOpenCodeEnv(),
      stdio: ["pipe", "pipe", "pipe"],
    });
    closeProcessInput(proc);

    // Capture the exit promise BEFORE consuming the stream to avoid a race
    // where the 'close' event fires before we register the listener.
    const exitPromise = new Promise<number | null>((resolve) => {
      proc.on("close", resolve);
      proc.on("error", () => resolve(null));
    });

    const chunks = createChunkQueue(proc.stdout!, proc.stderr!);
    let buffer = "";

    for await (const raw of chunks) {
      buffer += raw;
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        for (const chunk of parseOpenCodeLine(line)) {
          yield chunk;
        }
      }
    }

    if (buffer.trim()) {
      for (const chunk of parseOpenCodeLine(buffer)) {
        yield chunk;
      }
    }

    const exitCode = await exitPromise;

    if (exitCode !== null && exitCode !== 0) {
      yield { type: "text", content: `\n[opencode exited with code ${exitCode}]\n` };
    }

    yield { type: "done" };
  }

  async evaluateRegression(
    baselineBase64: string,
    currentBase64: string,
    diffBase64: string,
    url: string,
    device: "desktop" | "mobile",
  ): Promise<TestFinding[]> {
    const prompt = buildRegressionPrompt(url, device);
    const result = await this.execOpenCode(prompt);
    try {
      return JSON.parse(result);
    } catch {
      return [];
    }
  }

  private execOpenCode(prompt: string, cwd?: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const proc = spawn("opencode", buildOpenCodeArgs(prompt, cwd, "json"), {
        cwd,
        env: buildOpenCodeEnv(),
        stdio: ["pipe", "pipe", "pipe"],
      });
      closeProcessInput(proc);

      let stdout = "";
      let stderr = "";

      proc.stdout!.on("data", (data: Buffer) => {
        stdout += data.toString();
      });
      proc.stderr!.on("data", (data: Buffer) => {
        stderr += data.toString();
      });

      proc.on("close", (code) => {
        if (code === 0) {
          resolve(extractOpenCodeText(stdout));
        } else {
          reject(new Error(`OpenCode exited with code ${code}: ${stderr}`));
        }
      });
      proc.on("error", (err) => reject(err));
    });
  }
}

function buildOpenCodeArgs(prompt: string, dir?: string, format: "default" | "json" = "json"): string[] {
  const args = ["run", "--format", format];
  if (dir) {
    args.push("--dir", dir);
  }
  const model = process.env.OPENCODE_MODEL?.trim();
  if (model) {
    args.push("--model", model);
  }
  args.push(prompt);
  return args;
}

function buildOpenCodeEnv(): NodeJS.ProcessEnv {
  return {
    ...process.env,
    OPENCODE_PERMISSION: JSON.stringify(mergeOpenCodePermission(process.env.OPENCODE_PERMISSION)),
  };
}

function mergeOpenCodePermission(raw: string | undefined): Record<string, unknown> {
  const parsed = parsePermissionObject(raw);
  return {
    ...parsed,
    bash: mergePermissionSection(parsed.bash, {
      "agent-browser": "allow",
      "agent-browser *": "allow",
    }),
    external_directory: mergePermissionSection(parsed.external_directory, {
      "~/.agent-browser": "allow",
      "~/.agent-browser/**": "allow",
    }),
  };
}

function parsePermissionObject(raw: string | undefined): Record<string, unknown> {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as unknown;
    return isRecord(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function mergePermissionSection(
  section: unknown,
  additions: Record<string, string>,
): Record<string, string> {
  if (typeof section === "string") {
    return { "*": section, ...additions };
  }
  if (isRecord(section)) {
    const normalized: Record<string, string> = {};
    for (const [key, value] of Object.entries(section)) {
      if (typeof value === "string") {
        normalized[key] = value;
      }
    }
    return { ...normalized, ...additions };
  }
  return additions;
}

function extractOpenCodeText(output: string): string {
  const normalized = stripAnsi(output).trim();
  if (!normalized) {
    return "";
  }

  const lines = normalized.split("\n").filter((line) => line.trim());
  const texts: string[] = [];

  for (const line of lines) {
    try {
      const parsed = JSON.parse(line) as unknown;
      collectOpenCodeEvent(parsed, texts, []);
    } catch {
      return normalized;
    }
  }

  return texts.length > 0 ? texts.join("") : normalized;
}

function parseOpenCodeLine(line: string): StreamChunk[] {
  const cleaned = stripAnsi(line).trim();
  if (!cleaned) {
    return [];
  }

  try {
    const parsed = JSON.parse(cleaned) as unknown;
    const texts: string[] = [];
    const toolCalls: ToolCall[] = [];
    collectOpenCodeEvent(parsed, texts, toolCalls);

    const chunks: StreamChunk[] = [];
    for (const text of texts) {
      if (text) {
        chunks.push({ type: "text", content: text });
      }
    }
    for (const toolCall of toolCalls) {
      chunks.push({ type: "tool_call", toolCall });
    }
    return chunks;
  } catch {
    return [{ type: "text", content: cleaned + "\n" }];
  }
}

function collectOpenCodeEvent(value: unknown, texts: string[], toolCalls: ToolCall[]): void {
  if (!value || typeof value !== "object") {
    return;
  }

  const event = value as {
    type?: string;
    text?: unknown;
    tool?: unknown;
    callID?: unknown;
    state?: { input?: unknown };
    delta?: unknown;
    part?: unknown;
    parts?: unknown;
    data?: unknown;
    message?: unknown;
    content?: unknown;
  };

  if (event.type === "text" && typeof event.text === "string") {
    texts.push(event.text);
    return;
  }

  if (event.type === "tool" && typeof event.tool === "string") {
    toolCalls.push({
      id: typeof event.callID === "string" ? event.callID : event.tool,
      name: event.tool,
      args: isRecord(event.state?.input) ? event.state.input : {},
    });
    return;
  }

  if (isRecord(event.delta)) {
    collectOpenCodeEvent(event.delta, texts, toolCalls);
  }
  if (isRecord(event.part)) {
    collectOpenCodeEvent(event.part, texts, toolCalls);
  }
  if (Array.isArray(event.parts)) {
    for (const part of event.parts) {
      collectOpenCodeEvent(part, texts, toolCalls);
    }
  }
  if (isRecord(event.data)) {
    collectOpenCodeEvent(event.data, texts, toolCalls);
  }
  if (isRecord(event.message)) {
    collectOpenCodeEvent(event.message, texts, toolCalls);
  }
  if (Array.isArray(event.content)) {
    for (const item of event.content) {
      collectOpenCodeEvent(item, texts, toolCalls);
    }
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function closeProcessInput(proc: { stdin?: { end: () => void } | null }): void {
  try {
    proc.stdin?.end();
  } catch {
    // Ignore EPIPE/closed-stdin errors from CLIs that manage stdin themselves.
  }
}

function stripAnsi(text: string): string {
  return text.replace(/\u001B\[[0-?]*[ -/]*[@-~]/g, "");
}

async function* createChunkQueue(stdout: Readable, stderr: Readable): AsyncGenerator<string> {
  const queue: string[] = [];
  let finished = 0;
  let waiting: (() => void) | null = null;

  function onData(chunk: Buffer) {
    queue.push(chunk.toString());
    if (waiting) { const w = waiting; waiting = null; w(); }
  }
  function onEnd() {
    finished++;
    if (waiting) { const w = waiting; waiting = null; w(); }
  }

  stdout.on("data", onData);
  stderr.on("data", onData);
  stdout.on("end", onEnd);
  stderr.on("end", onEnd);
  stdout.on("error", onEnd);
  stderr.on("error", onEnd);

  while (true) {
    if (queue.length > 0) yield queue.shift()!;
    else if (finished >= 2) break;
    else await new Promise<void>((r) => { waiting = r; });
  }
}
