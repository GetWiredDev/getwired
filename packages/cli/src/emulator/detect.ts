import { execFile } from "node:child_process";
import { promisify } from "node:util";
import type { PrerequisiteCheck, PrerequisiteIssue, EmulatorDevice } from "./types.js";
import { getAndroidSdkInfo } from "./android-sdk.js";
import { hasHomebrew } from "./ensure-dependencies.js";
import { hasAxe } from "./ios-simulator.js";
import { detectProjectAutomationProfile } from "./native-launch.js";
import { hasAppiumCommand, hasRequiredAppiumDriver } from "./appium.js";

const execFileAsync = promisify(execFile);

async function execSafe(cmd: string, args: string[], timeout = 10_000): Promise<string> {
  try {
    const { stdout } = await execFileAsync(cmd, args, { encoding: "utf-8", timeout });
    return stdout.trim();
  } catch {
    return "";
  }
}

// ─── Android Prerequisite Check ───────────────────────────────

export async function checkAndroidPrerequisites(projectPath = process.cwd()): Promise<PrerequisiteCheck> {
  const issues: PrerequisiteIssue[] = [];
  const devices: EmulatorDevice[] = [];
  const androidSdk = getAndroidSdkInfo();
  const brewAvailable = await hasHomebrew();
  const automation = await detectProjectAutomationProfile(projectPath, "android");

  issues.push({
    check: `Detected project automation: ${formatAutomationLabel(automation)}`,
    passed: true,
    hint: automation.reason,
  });

  // Check ADB
  const hasAdb = !!androidSdk.adbPath;
  issues.push({
    check: "ADB (Android Debug Bridge)",
    passed: hasAdb,
    autoFixable: !hasAdb && brewAvailable,
    hint: hasAdb ? undefined : "Install Android Studio or set up Android SDK",
  });

  // Check emulator CLI
  const hasEmulator = !!androidSdk.emulatorPath;
  issues.push({
    check: "Android Emulator CLI",
    passed: hasEmulator,
    hint: hasEmulator ? undefined : "Install Android Studio with emulator component",
  });

  // Check Android SDK root
  issues.push({
    check: androidSdk.sdkSource ? `Android SDK root (${androidSdk.sdkSource})` : "Android SDK root",
    passed: !!androidSdk.sdkRoot,
    autoFixable: !androidSdk.sdkRoot && brewAvailable,
    hint: androidSdk.sdkRoot ? undefined : "Install Android Studio or set ANDROID_HOME to your SDK path",
  });

  // List AVDs
  if (androidSdk.emulatorPath) {
    const avdOutput = await execSafe(androidSdk.emulatorPath, ["-list-avds"]);
    const avdNames = avdOutput.split("\n").filter((l) => l.trim().length > 0);
    for (const name of avdNames) {
      devices.push({ id: name, name, platform: "android", state: "shutdown" });
    }
    if (avdNames.length === 0) {
      issues.push({
        check: "Available AVDs",
        passed: false,
        hint: "Create an AVD in Android Studio → Device Manager",
      });
    } else {
      issues.push({ check: `Available AVDs (${avdNames.length} found)`, passed: true });
    }
  }

  // Mark running devices
  if (androidSdk.adbPath) {
    const devOutput = await execSafe(androidSdk.adbPath, ["devices"]);
    const runningIds = devOutput
      .split("\n")
      .slice(1)
      .filter((l) => l.includes("device"))
      .map((l) => l.split("\t")[0].trim());
    for (const dev of devices) {
      if (runningIds.some((id) => id.includes("emulator"))) {
        dev.state = "booted";
      }
    }
  }

  if (automation.mode === "hybrid") {
    const appiumInstalled = await hasAppiumCommand();
    issues.push({
      check: "Appium CLI (hybrid WebView automation)",
      passed: appiumInstalled,
      autoFixable: !appiumInstalled,
      hint: appiumInstalled ? undefined : "Install Appium: npm install -g appium",
    });

    const hasDriver = appiumInstalled && await hasRequiredAppiumDriver("android");
    issues.push({
      check: "Appium UiAutomator2 driver",
      passed: hasDriver,
      autoFixable: !hasDriver,
      hint: hasDriver ? undefined : "Install driver: appium driver install uiautomator2",
    });
  }

  const available = issues.every((i) => i.passed);
  const canProceed = issues.every((i) => i.passed || i.autoFixable);
  return { platform: "android", available, canProceed, issues, devices };
}

// ─── iOS Prerequisite Check ──────────────────────────────────

export async function checkIosPrerequisites(projectPath = process.cwd()): Promise<PrerequisiteCheck> {
  const issues: PrerequisiteIssue[] = [];
  const devices: EmulatorDevice[] = [];
  const automation = await detectProjectAutomationProfile(projectPath, "ios");

  // Check macOS
  const isMac = process.platform === "darwin";
  issues.push({
    check: "macOS required",
    passed: isMac,
    hint: isMac ? undefined : "iOS Simulator requires macOS",
  });

  if (!isMac) {
    return { platform: "ios", available: false, issues, devices };
  }

  issues.push({
    check: `Detected project automation: ${formatAutomationLabel(automation)}`,
    passed: true,
    hint: automation.reason,
  });

  // Check Xcode
  const xcodePathOutput = await execSafe("xcode-select", ["-p"]);
  const hasXcode = xcodePathOutput.length > 0;
  issues.push({
    check: "Xcode installation",
    passed: hasXcode,
    hint: hasXcode ? undefined : "Install Xcode from the App Store",
  });

  // Check simctl
  const simctlOutput = await execSafe("xcrun", ["simctl", "list", "devices", "-j"]);
  const hasSimctl = simctlOutput.length > 0;
  issues.push({
    check: "Simulator CLI (simctl)",
    passed: hasSimctl,
    hint: hasSimctl ? undefined : "Run: xcode-select --install",
  });

  // Check AXe CLI for native interaction (tap, swipe, type)
  if (automation.mode === "hybrid") {
    const appiumInstalled = await hasAppiumCommand();
    issues.push({
      check: "Appium CLI (hybrid WebView automation)",
      passed: appiumInstalled,
      autoFixable: !appiumInstalled,
      hint: appiumInstalled ? undefined : "Install Appium: npm install -g appium",
    });

    const hasDriver = appiumInstalled && await hasRequiredAppiumDriver("ios");
    issues.push({
      check: "Appium XCUITest driver",
      passed: hasDriver,
      autoFixable: !hasDriver,
      hint: hasDriver ? undefined : "Install driver: appium driver install xcuitest",
    });
  } else {
    const axeInstalled = await hasAxe();
    const brewAvailable = await hasHomebrew();
    issues.push({
      check: "AXe CLI (native touch/type/swipe)",
      passed: axeInstalled,
      autoFixable: !axeInstalled && brewAvailable,
      hint: axeInstalled ? undefined : "Install AXe: brew tap cameroncooke/axe && brew install axe",
    });
  }

  // Parse simulator devices
  if (hasSimctl) {
    try {
      const parsed = JSON.parse(simctlOutput);
      const deviceMap = parsed.devices || {};
      for (const [runtime, devList] of Object.entries(deviceMap)) {
        if (!runtime.includes("iOS")) continue;
        for (const dev of devList as any[]) {
          if (!dev.isAvailable) continue;
          devices.push({
            id: dev.udid,
            name: `${dev.name} (${runtime.split(".").pop()})`,
            platform: "ios",
            state: dev.state === "Booted" ? "booted" : "shutdown",
          });
        }
      }
    } catch { /* parse error — devices stay empty */ }

    if (devices.length === 0) {
      issues.push({
        check: "Available iOS Simulators",
        passed: false,
        hint: "No simulators found — install an iOS runtime in Xcode → Settings → Platforms",
      });
    } else {
      issues.push({ check: `Available Simulators (${devices.length} found)`, passed: true });
    }
  }

  const available = issues.every((i) => i.passed);
  const canProceed = issues.every((i) => i.passed || i.autoFixable);
  return { platform: "ios", available, canProceed, issues, devices };
}

function formatAutomationLabel(
  automation: Awaited<ReturnType<typeof detectProjectAutomationProfile>>,
): string {
  return automation.mode === "hybrid"
    ? `Hybrid WebView (${automation.framework})`
    : `Native views (${automation.framework})`;
}
