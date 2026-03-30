import { TestingProvider, ProviderConfig } from "./types.js";
import { ClaudeCodeProvider } from "./claude-code.js";
import { AuggieProvider } from "./auggie.js";
import { CodexProvider } from "./codex.js";
import { OpenCodeProvider } from "./opencode.js";
import { ensureProviderCli } from "./ensure-cli.js";

const providers = new Map<string, () => TestingProvider>();

function register(name: string, factory: () => TestingProvider) {
  providers.set(name, factory);
}

register("auggie", () => new AuggieProvider());
register("claude-code", () => new ClaudeCodeProvider());
register("codex", () => new CodexProvider());
register("opencode", () => new OpenCodeProvider());

export function getProvider(name: string): TestingProvider {
  const factory = providers.get(name);
  if (!factory) {
    throw new Error(
      `Unknown provider: ${name}. Available: ${getAvailableProviders().map((p) => p.name).join(", ")}`,
    );
  }

  if (!ensureProviderCli(name)) {
    throw new Error(
      `Provider "${name}" requires its CLI tool to be installed. See above for instructions.`,
    );
  }

  return factory();
}

export function getAvailableProviders(): ProviderConfig[] {
  return Array.from(providers.entries()).map(([, factory]) => factory().config);
}
