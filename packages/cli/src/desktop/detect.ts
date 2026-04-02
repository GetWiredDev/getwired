import { execFile } from "node:child_process";
import { promisify } from "node:util";
import type { DesktopPlatform, DesktopPrerequisiteCheck, DesktopDevice, PrerequisiteIssue } from "./types.js";

const execFileAsync = promisify(execFile);

async function execSafe(cmd: string, args: string[], timeout = 10_000): Promise<string> {
  try {
    const { stdout } = await execFileAsync(cmd, args, { encoding: "utf-8", timeout });
    return stdout.trim();
  } catch {
    return "";
  }
}

async function hasNodeCommand(): Promise<boolean> {
  const result = await execSafe("node", ["--version"]);
  return result.length > 0;
}

export async function checkElectronPrerequisites(): Promise<DesktopPrerequisiteCheck> {
  const issues: PrerequisiteIssue[] = [];
  const devices: DesktopDevice[] = [];

  const hasNode = await hasNodeCommand();
  issues.push({
    check: "Node.js installed",
    passed: hasNode,
    hint: hasNode ? undefined : "Install Node.js from https://nodejs.org",
  });

  const hasPlaywright = await execSafe("npx", ["playwright", "--version"]);
  const hasPlaywrightBool = hasPlaywright.length > 0;
  issues.push({
    check: "Playwright installed",
    passed: hasPlaywrightBool,
    autoFixable: !hasPlaywrightBool,
    hint: hasPlaywrightBool ? undefined : "Install Playwright: npm install playwright",
  });

  const available = issues.every((i) => i.passed);
  const canProceed = issues.every((i) => i.passed || i.autoFixable);
  return { platform: "electron", available, canProceed, issues, devices };
}

export async function checkDesktopPrerequisites(platform: DesktopPlatform): Promise<DesktopPrerequisiteCheck> {
  if (platform === "electron") {
    return checkElectronPrerequisites();
  }
  
  const issues: PrerequisiteIssue[] = [
    { check: `Unknown platform: ${platform}`, passed: false },
  ];
  return { platform: platform as "electron", available: false, issues, devices: [] };
}
