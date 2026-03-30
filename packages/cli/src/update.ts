import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

export function getLocalVersion(): string {
  const pkg = JSON.parse(
    readFileSync(join(__dirname, "..", "package.json"), "utf-8")
  );
  return pkg.version;
}

function getLatestVersion(packageName: string): string | null {
  try {
    const result = execSync(`npm view ${packageName} version`, {
      encoding: "utf-8",
      timeout: 5000,
      stdio: ["pipe", "pipe", "pipe"],
    });
    return result.trim();
  } catch {
    // Network error or package not published yet — skip silently
    return null;
  }
}

function isNewer(latest: string, current: string): boolean {
  const parse = (v: string) => v.split(".").map(Number);
  const [lMaj, lMin, lPat] = parse(latest);
  const [cMaj, cMin, cPat] = parse(current);
  if (lMaj !== cMaj) return lMaj > cMaj;
  if (lMin !== cMin) return lMin > cMin;
  return lPat > cPat;
}

function installUpdate(packageName: string, latest: string): boolean {
  try {
    execSync(`npm install -g ${packageName}@${latest}`, {
      encoding: "utf-8",
      timeout: 60000,
      stdio: ["pipe", "pipe", "pipe"],
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Check for a newer version on npm and auto-install it.
 * Runs synchronously so the CLI starts with the latest code.
 * Designed to fail silently — never blocks the user.
 */
export function checkForUpdates(): void {
  if (process.env.GETWIRED_DISABLE_UPDATE_CHECK === "1") {
    return;
  }

  const packageName = "getwired";
  const current = getLocalVersion();
  const latest = getLatestVersion(packageName);

  if (!latest || !isNewer(latest, current)) {
    return;
  }

  console.log(`\n⬆  Update available: ${current} → ${latest}`);
  console.log(`   Installing ${packageName}@${latest}…`);

  const ok = installUpdate(packageName, latest);

  if (ok) {
    console.log(`   ✓ Updated! Restart getwired to use v${latest}.\n`);
  } else {
    console.log(
      `   ✗ Auto-update failed. Run manually:\n   npm install -g ${packageName}@${latest}\n`
    );
  }
}
