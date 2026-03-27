import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import type { DeviceProfile } from "../providers/types.js";

export interface CaptureOptions {
  url: string;
  outputDir: string;
  deviceProfile: DeviceProfile;
  viewports: {
    desktop: { width: number; height: number };
    mobile: { width: number; height: number };
  };
  fullPage: boolean;
  delay: number;
  label?: string;
}

export interface CaptureResult {
  device: "desktop" | "mobile";
  path: string;
  url: string;
  width: number;
  height: number;
  timestamp: string;
}

const MOBILE_USER_AGENT =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1";

export async function captureScreenshots(options: CaptureOptions): Promise<CaptureResult[]> {
  // Dynamic import — playwright is an optional peer dep
  const { chromium, devices } = await import("playwright");

  await mkdir(options.outputDir, { recursive: true });

  const results: CaptureResult[] = [];
  const devicesToTest = getDeviceList(options.deviceProfile);
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const slug = slugify(options.url);

  const browser = await chromium.launch({ headless: true });

  try {
    for (const device of devicesToTest) {
      const isDesktop = device === "desktop";
      const viewport = isDesktop ? options.viewports.desktop : options.viewports.mobile;

      const context = await browser.newContext({
        viewport,
        userAgent: isDesktop ? undefined : MOBILE_USER_AGENT,
        isMobile: !isDesktop,
        hasTouch: !isDesktop,
        deviceScaleFactor: isDesktop ? 1 : 3,
      });

      const page = await context.newPage();

      await page.goto(options.url, { waitUntil: "networkidle", timeout: 30_000 });

      if (options.delay > 0) {
        await page.waitForTimeout(options.delay);
      }

      const filename = `${slug}-${device}-${options.label ?? timestamp}.png`;
      const screenshotPath = join(options.outputDir, filename);

      await page.screenshot({
        path: screenshotPath,
        fullPage: options.fullPage,
      });

      results.push({
        device,
        path: screenshotPath,
        url: options.url,
        width: viewport.width,
        height: viewport.height,
        timestamp: new Date().toISOString(),
      });

      await context.close();
    }
  } finally {
    await browser.close();
  }

  return results;
}

export async function captureMultiplePages(
  urls: string[],
  options: Omit<CaptureOptions, "url">,
): Promise<CaptureResult[]> {
  const allResults: CaptureResult[] = [];

  for (const url of urls) {
    const results = await captureScreenshots({ ...options, url });
    allResults.push(...results);
  }

  return allResults;
}

function getDeviceList(profile: DeviceProfile): Array<"desktop" | "mobile"> {
  switch (profile) {
    case "desktop":
      return ["desktop"];
    case "mobile":
      return ["mobile"];
    case "both":
      return ["desktop", "mobile"];
  }
}

function slugify(url: string): string {
  return url
    .replace(/^https?:\/\//, "")
    .replace(/[^a-zA-Z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}
