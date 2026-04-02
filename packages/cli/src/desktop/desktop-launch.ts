import { readFile, readdir, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import type { GetwiredSettings } from "../config/settings.js";
import type {
  DesktopPlatform,
  ResolvedDesktopLaunchTarget,
  ResolvedElectronLaunchTarget,
} from "./types.js";

const IGNORED_DIRS = new Set([
  ".git",
  ".next",
  ".turbo",
  "coverage",
  "node_modules",
]);

interface DesktopLaunchMemoryHints {
  electron: {
    appPath?: string;
    launchCommand?: string;
    workingDirectory?: string;
    source?: string;
  };
}

interface DetectedCandidate {
  value: string;
  detectedFrom: string;
  confidence: number;
  launchCommand?: string;
  workingDirectory?: string;
}

export function parseDesktopLaunchMemory(memory: string): DesktopLaunchMemoryHints {
  const hints: DesktopLaunchMemoryHints = {
    electron: {},
  };
  if (!memory) return hints;

  const sectionMatch = memory.match(/## Desktop Launch\n([\s\S]*?)(?=\n## |\n*$)/);
  if (!sectionMatch) return hints;

  const lines = sectionMatch[1]
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("- "));

  for (const line of lines) {
    const match = line.match(/^- ([a-z]+)\.([a-zA-Z]+):\s*(.+)$/);
    if (!match) continue;
    const [, platform, key, value] = match;
    if (platform !== "electron") continue;

    const target = hints[platform as keyof DesktopLaunchMemoryHints];
    switch (key) {
      case "appPath":
      case "launchCommand":
      case "workingDirectory":
      case "source":
        (target as Record<string, string | undefined>)[key] = value.trim();
        break;
      default:
        break;
    }
  }

  return hints;
}

export function upsertDesktopLaunchMemory(
  memory: string,
  target: ResolvedDesktopLaunchTarget,
): string {
  const hints = parseDesktopLaunchMemory(memory);

  if (target.platform === "electron") {
    hints.electron.appPath = target.appPath;
    hints.electron.launchCommand = target.launchCommand;
    hints.electron.workingDirectory = target.workingDirectory;
    hints.electron.source = target.detectedFrom;
  }

  const sectionLines = ["## Desktop Launch"];

  if (hints.electron.appPath) sectionLines.push(`- electron.appPath: ${hints.electron.appPath}`);
  if (hints.electron.launchCommand) sectionLines.push(`- electron.launchCommand: ${hints.electron.launchCommand}`);
  if (hints.electron.workingDirectory) sectionLines.push(`- electron.workingDirectory: ${hints.electron.workingDirectory}`);
  if (hints.electron.source) sectionLines.push(`- electron.source: ${hints.electron.source}`);

  const newSection = `${sectionLines.join("\n")}\n`;

  if (!memory.trim()) return `${newSection}\n`;

  if (/## Desktop Launch\n/.test(memory)) {
    return memory.replace(/## Desktop Launch\n[\s\S]*?(?=\n## |\n*$)/, newSection.trimEnd());
  }

  const trimmed = memory.trimEnd();
  return `${trimmed}\n\n${newSection}`;
}

export function persistDesktopLaunchTarget(
  settings: GetwiredSettings,
  target: ResolvedDesktopLaunchTarget,
): GetwiredSettings {
  const native = settings.native ?? { ios: {}, android: {}, electron: {} };

  if (target.platform === "electron") {
    return {
      ...settings,
      native: {
        ...native,
        electron: {
          ...native.electron,
          appPath: target.appPath,
          launchCommand: target.launchCommand ?? native.electron?.launchCommand,
          workingDirectory: target.workingDirectory ?? native.electron?.workingDirectory,
          source: target.detectedFrom,
        },
      },
    };
  }

  return settings;
}

export async function resolveDesktopLaunchTarget(
  platform: DesktopPlatform,
  projectDir: string,
  settings: GetwiredSettings,
  memory?: string,
  options?: { skipCache?: boolean },
): Promise<ResolvedDesktopLaunchTarget> {
  const memoryHints = memory ? parseDesktopLaunchMemory(memory) : { electron: {} };
  const configHints = settings.native ?? { ios: {}, android: {}, electron: {} };

  if (!options?.skipCache && platform === "electron") {
    if (memoryHints.electron.appPath) {
      return {
        platform: "electron",
        appPath: memoryHints.electron.appPath,
        launchCommand: memoryHints.electron.launchCommand ?? configHints.electron?.launchCommand,
        workingDirectory: memoryHints.electron.workingDirectory ?? configHints.electron?.workingDirectory,
        source: "memory",
        detectedFrom: memoryHints.electron.source ?? "memory",
      };
    }
    if (configHints.electron?.appPath) {
      return {
        platform: "electron",
        appPath: configHints.electron.appPath,
        launchCommand: configHints.electron.launchCommand,
        workingDirectory: configHints.electron.workingDirectory,
        source: "config",
        detectedFrom: configHints.electron.source ?? ".getwired/config.json",
      };
    }
  }

  const detected = await inspectProjectDesktopLaunchTarget(projectDir, platform);
  if (!detected) {
    const configPath = ".getwired/config.json";
    throw new Error(
      `Unable to determine which Electron app to launch. Add native.electron.appPath to ${configPath} or ensure your project has detectable Electron configuration.`,
    );
  }

  const electronDetected = detected as DetectedCandidate;
  return {
    platform: "electron",
    appPath: electronDetected.value,
    launchCommand: electronDetected.launchCommand ?? memoryHints.electron.launchCommand ?? configHints.electron?.launchCommand,
    workingDirectory: electronDetected.workingDirectory ?? memoryHints.electron.workingDirectory ?? configHints.electron?.workingDirectory,
    source: "project",
    detectedFrom: electronDetected.detectedFrom,
  };
}

export function describeDesktopLaunchTarget(target: ResolvedDesktopLaunchTarget): string {
  const commandSummary = target.launchCommand
    ? `; command ${target.launchCommand}${target.workingDirectory ? ` @ ${target.workingDirectory}` : ""}`
    : "";

  return `electron ${target.appPath} (${target.detectedFrom}${commandSummary})`;
}

async function inspectProjectDesktopLaunchTarget(
  projectDir: string,
  platform: DesktopPlatform,
): Promise<DetectedCandidate | undefined> {
  if (platform === "electron") {
    return await detectElectronLaunchTarget(projectDir);
  }
  return undefined;
}

async function detectElectronLaunchTarget(projectDir: string): Promise<DetectedCandidate | undefined> {
  const packageJsonPath = join(projectDir, "package.json");
  if (!existsSync(packageJsonPath)) return undefined;

  const parsed = await safeReadJson(packageJsonPath) as Record<string, unknown> | undefined;
  if (!parsed || typeof parsed !== "object") return undefined;

  const dependencies = {
    ...(typeof parsed.dependencies === "object" && parsed.dependencies ? parsed.dependencies : {}),
    ...(typeof parsed.devDependencies === "object" && parsed.devDependencies ? parsed.devDependencies : {}),
  } as Record<string, string>;

  const hasElectron = Boolean(
    dependencies.electron
    || dependencies["electron-builder"]
    || dependencies["@electron-forge/cli"]
    || dependencies["@electron-forge/core"]
  );

  if (!hasElectron) return undefined;

  const mainField = typeof parsed.main === "string" ? parsed.main : "index.js";
  const scriptsObj = typeof parsed.scripts === "object" && parsed.scripts ? parsed.scripts as Record<string, unknown> : {};

  let launchCommand: string | undefined;
  let workingDirectory: string | undefined;

  const electronScripts = ["start", "electron", "electron:start", "dev"];
  for (const scriptName of electronScripts) {
    if (typeof scriptsObj[scriptName] === "string") {
      launchCommand = `npm run ${scriptName}`;
      workingDirectory = ".";
      break;
    }
  }

  const buildDirs = ["dist", "out", "release", "build"];
  for (const buildDir of buildDirs) {
    const buildPath = join(projectDir, buildDir);
    if (existsSync(buildPath)) {
      const appPath = await findElectronAppInDir(buildPath);
      if (appPath) {
        return {
          value: appPath,
          detectedFrom: `${buildDir}/`,
          launchCommand,
          workingDirectory: workingDirectory ?? ".",
          confidence: 90,
        };
      }
    }
  }

  return {
    value: join(projectDir, mainField),
    detectedFrom: "package.json main field",
    launchCommand,
    workingDirectory: workingDirectory ?? ".",
    confidence: 80,
  };
}

async function findElectronAppInDir(dir: string): Promise<string | undefined> {
  if (!existsSync(dir)) return undefined;

  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (entry.name.endsWith(".app")) {
        return join(dir, entry.name);
      }
      if (process.platform === "win32" && entry.name.endsWith("-win")) {
        const exePath = await findExeInDir(join(dir, entry.name));
        if (exePath) return exePath;
      }
    }
    if (entry.isFile() && entry.name.endsWith(".exe")) {
      return join(dir, entry.name);
    }
  }

  for (const entry of entries) {
    if (entry.isDirectory() && !IGNORED_DIRS.has(entry.name)) {
      const found = await findElectronAppInDir(join(dir, entry.name));
      if (found) return found;
    }
  }

  return undefined;
}

async function findExeInDir(dir: string): Promise<string | undefined> {
  if (!existsSync(dir)) return undefined;

  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isFile() && entry.name.endsWith(".exe")) {
      return join(dir, entry.name);
    }
  }

  for (const entry of entries) {
    if (entry.isDirectory() && !IGNORED_DIRS.has(entry.name)) {
      const found = await findExeInDir(join(dir, entry.name));
      if (found) return found;
    }
  }

  return undefined;
}

async function safeReadJson(filePath: string): Promise<unknown> {
  try {
    return JSON.parse(await readFile(filePath, "utf-8"));
  } catch {
    return undefined;
  }
}

async function safeReadText(filePath: string): Promise<string> {
  try {
    return await readFile(filePath, "utf-8");
  } catch {
    return "";
  }
}

function normalizeSlashes(value: string): string {
  return value.split("\\").join("/");
}
