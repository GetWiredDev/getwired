import { TestingProvider, ProviderConfig } from "./types.js";
import { ClaudeCodeProvider } from "./claude-code.js";
import { AuggieProvider } from "./auggie.js";
import { CodexProvider } from "./codex.js";
import { OpenCodeProvider } from "./opencode.js";

const providers = new Map<string, () => TestingProvider>();

function register(name: string, factory: () => TestingProvider) {
  providers.set(name, factory);
}

register("claude-code", () => new ClaudeCodeProvider());
register("auggie", () => new AuggieProvider());
register("codex", () => new CodexProvider());
register("opencode", () => new OpenCodeProvider());

export function getProvider(name: string): TestingProvider {
  const factory = providers.get(name);
  if (!factory) {
    throw new Error(
      `Unknown provider: ${name}. Available: ${getAvailableProviders().map((p) => p.name).join(", ")}`,
    );
  }
  return factory();
}

export function getAvailableProviders(): ProviderConfig[] {
  return Array.from(providers.entries()).map(([, factory]) => factory().config);
}
