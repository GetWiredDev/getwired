import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import type { DeviceProfile, ProviderAuth } from "../providers/types.js";

const DEFAULT_SHOW_BROWSER = process.env.CI !== "true"
  && (process.platform !== "linux" || Boolean(process.env.DISPLAY || process.env.WAYLAND_DISPLAY));

export interface GetwiredSettings {
  provider: string;
  auth: Record<string, ProviderAuth>;
  testing: {
    deviceProfile: DeviceProfile;
    viewports: {
      desktop: { width: number; height: number };
      mobile: { width: number; height: number };
    };
    screenshotFullPage: boolean;
    screenshotDelay: number;
    diffThreshold: number;
    maxConcurrency: number;
    showBrowser: boolean;
  };
  project: {
    name: string;
    url?: string;
    notes: string[];
    pages: string[];
    ignorePatterns: string[];
  };
  reporting: {
    outputFormat: "json" | "html" | "markdown";
    includeScreenshots: boolean;
    autoOpen: boolean;
  };
}

const DEFAULT_SETTINGS: GetwiredSettings = {
  provider: "claude-code",
  auth: {},
  testing: {
    deviceProfile: "both",
    viewports: {
      desktop: { width: 1920, height: 1080 },
      mobile: { width: 390, height: 844 },
    },
    screenshotFullPage: true,
    screenshotDelay: 1000,
    diffThreshold: 0.01,
    maxConcurrency: 3,
    showBrowser: DEFAULT_SHOW_BROWSER,
  },
  project: {
    name: "",
    url: undefined,
    notes: [],
    pages: [],
    ignorePatterns: ["node_modules", ".git", "dist", ".next"],
  },
  reporting: {
    outputFormat: "json",
    includeScreenshots: true,
    autoOpen: false,
  },
};

export function getConfigDir(projectPath: string): string {
  return join(projectPath, ".getwired");
}

export function getConfigPath(projectPath: string): string {
  return join(getConfigDir(projectPath), "config.json");
}

export function getBaselineDir(projectPath: string): string {
  return join(getConfigDir(projectPath), "baselines");
}

export function getReportDir(projectPath: string): string {
  return join(getConfigDir(projectPath), "reports");
}

export function getNotesDir(projectPath: string): string {
  return join(getConfigDir(projectPath), "notes");
}

export function getMemoryPath(projectPath: string): string {
  return join(getConfigDir(projectPath), "memory.md");
}

export async function initConfig(projectPath: string, projectName: string): Promise<GetwiredSettings> {
  const configDir = getConfigDir(projectPath);
  await mkdir(configDir, { recursive: true });
  await mkdir(getBaselineDir(projectPath), { recursive: true });
  await mkdir(getReportDir(projectPath), { recursive: true });
  await mkdir(getNotesDir(projectPath), { recursive: true });

  const settings: GetwiredSettings = {
    ...DEFAULT_SETTINGS,
    project: { ...DEFAULT_SETTINGS.project, name: projectName },
  };

  await saveConfig(projectPath, settings);
  return settings;
}

export async function loadConfig(projectPath: string): Promise<GetwiredSettings> {
  const configPath = getConfigPath(projectPath);
  if (!existsSync(configPath)) {
    throw new Error(
      `No .getwired/config.json found in ${projectPath}. Run \`getwired init\` first.`,
    );
  }
  const raw = await readFile(configPath, "utf-8");
  const saved = JSON.parse(raw);
  return {
    ...DEFAULT_SETTINGS,
    ...saved,
    auth: {
      ...DEFAULT_SETTINGS.auth,
      ...(saved.auth ?? {}),
    },
    testing: {
      ...DEFAULT_SETTINGS.testing,
      ...(saved.testing ?? {}),
      viewports: {
        ...DEFAULT_SETTINGS.testing.viewports,
        ...(saved.testing?.viewports ?? {}),
        desktop: {
          ...DEFAULT_SETTINGS.testing.viewports.desktop,
          ...(saved.testing?.viewports?.desktop ?? {}),
        },
        mobile: {
          ...DEFAULT_SETTINGS.testing.viewports.mobile,
          ...(saved.testing?.viewports?.mobile ?? {}),
        },
      },
    },
    project: {
      ...DEFAULT_SETTINGS.project,
      ...(saved.project ?? {}),
    },
    reporting: {
      ...DEFAULT_SETTINGS.reporting,
      ...(saved.reporting ?? {}),
    },
  };
}

export async function saveConfig(projectPath: string, settings: GetwiredSettings): Promise<void> {
  const configPath = getConfigPath(projectPath);
  await writeFile(configPath, JSON.stringify(settings, null, 2) + "\n");
}

export function configExists(projectPath: string): boolean {
  return existsSync(getConfigPath(projectPath));
}
