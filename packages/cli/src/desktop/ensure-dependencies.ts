import { execSync } from "node:child_process";
import type { DesktopPlatform } from "./types.js";

interface InstallResult {
  ok: boolean;
  error?: string;
}

export async function installDesktopDependencies(platform: DesktopPlatform): Promise<InstallResult> {
  if (platform === "electron") {
    try {
      execSync("npm install playwright", { stdio: "pipe" });
      return { ok: true };
    } catch (err) {
      return { ok: false, error: `Failed to install playwright: ${String(err)}` };
    }
  }
  return { ok: false, error: `Unsupported platform: ${platform}` };
}
