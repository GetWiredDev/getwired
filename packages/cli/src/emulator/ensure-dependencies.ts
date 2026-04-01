import { spawn } from "node:child_process";
import { clearAndroidSdkInfoCache, getAndroidSdkInfo } from "./android-sdk.js";
import type { NativePlatform } from "./types.js";
import { detectProjectAutomationProfile } from "./native-launch.js";
import { hasRequiredAppiumDriver, installAppiumDriver, installAppiumServer } from "./appium.js";

interface CommandResult {
  ok: boolean;
  stderr: string;
}

interface InstallResult {
  ok: boolean;
  error?: string;
}

function runCommand(command: string, args: string[], timeout = 300_000): Promise<CommandResult> {
  return new Promise((resolve) => {
    let settled = false;
    let stderr = "";

    const child = spawn(command, args, {
      stdio: ["ignore", "ignore", "pipe"],
    });

    const finish = (result: CommandResult) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve(result);
    };

    const timer = setTimeout(() => {
      child.kill("SIGTERM");
      finish({
        ok: false,
        stderr: `${command} ${args.join(" ")} timed out`,
      });
    }, timeout);

    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("error", (error) => {
      finish({ ok: false, stderr: error.message });
    });

    child.on("close", (code) => {
      finish({
        ok: code === 0,
        stderr: stderr.trim(),
      });
    });
  });
}

async function hasCommand(command: string): Promise<boolean> {
  const result = await runCommand("which", [command], 5_000);
  return result.ok;
}

export async function hasHomebrew(): Promise<boolean> {
  if (process.platform !== "darwin") return false;
  return hasCommand("brew");
}

export async function installNativeTestDependencies(
  platform: NativePlatform,
  projectPath = process.cwd(),
): Promise<InstallResult> {
  const automation = await detectProjectAutomationProfile(projectPath, platform);

  if (platform === "android") {
    clearAndroidSdkInfoCache();
    const androidSdk = getAndroidSdkInfo();
    const steps: Array<{ command: string; args: string[] }> = [];
    const brewAvailable = await hasHomebrew();

    if (!androidSdk.sdkRoot && brewAvailable) {
      steps.push({ command: "brew", args: ["install", "--cask", "android-commandlinetools"] });
    }

    if (!androidSdk.adbPath && brewAvailable) {
      steps.push({ command: "brew", args: ["install", "--cask", "android-platform-tools"] });
    }

    for (const step of steps) {
      const result = await runCommand(step.command, step.args);
      if (!result.ok) {
        return {
          ok: false,
          error: result.stderr || `${step.command} ${step.args.join(" ")} failed`,
        };
      }
    }

    if (automation.mode === "hybrid") {
      const appiumInstall = await installAppiumServer();
      if (!appiumInstall.ok) {
        return appiumInstall;
      }

      if (!(await hasRequiredAppiumDriver("android"))) {
        const driverInstall = await installAppiumDriver("android");
        if (!driverInstall.ok) {
          return driverInstall;
        }
      }
    }

    clearAndroidSdkInfoCache();
    return { ok: true };
  }

  if (platform !== "ios") {
    return { ok: true };
  }

  if (automation.mode === "hybrid") {
    const appiumInstall = await installAppiumServer();
    if (!appiumInstall.ok) {
      return appiumInstall;
    }

    if (!(await hasRequiredAppiumDriver("ios"))) {
      const driverInstall = await installAppiumDriver("ios");
      if (!driverInstall.ok) {
        return driverInstall;
      }
    }

    return { ok: true };
  }

  if (await hasCommand("axe")) {
    return { ok: true };
  }

  if (!(await hasHomebrew())) {
    return {
      ok: false,
      error: "Homebrew is required to auto-install AXe. Install manually: brew tap cameroncooke/axe && brew install axe",
    };
  }

  const steps = [
    { command: "brew", args: ["tap", "cameroncooke/axe"] },
    { command: "brew", args: ["install", "axe"] },
  ];

  for (const step of steps) {
    const result = await runCommand(step.command, step.args);
    if (!result.ok) {
      return {
        ok: false,
        error: result.stderr || `${step.command} ${step.args.join(" ")} failed`,
      };
    }
  }

  if (!(await hasCommand("axe"))) {
    return {
      ok: false,
      error: "AXe install completed, but the `axe` binary is still not available in PATH.",
    };
  }

  return { ok: true };
}
