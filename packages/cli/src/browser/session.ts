import * as ab from "./agent-browser.js";

export interface BrowserSession {
  visible: boolean;
  label: string;
}

export function getBrowserSession(showBrowser: boolean): BrowserSession {
  const uiAvailable = process.env.CI !== "true"
    && (process.platform !== "linux" || Boolean(process.env.DISPLAY || process.env.WAYLAND_DISPLAY));
  const visible = showBrowser && uiAvailable;

  return {
    visible,
    label: visible
      ? "visible agent-browser"
      : showBrowser
        ? "headless agent-browser (no GUI display available)"
        : "headless agent-browser",
  };
}

/**
 * Open a URL in agent-browser with the correct viewport and device settings.
 * The daemon starts automatically on first command.
 */
export async function openPage(
  url: string,
  options?: {
    viewport?: { width: number; height: number };
    userAgent?: string;
    waitUntil?: string;
    timeout?: number;
  },
): Promise<string> {
  const viewport = options?.viewport
    ? `${options.viewport.width}x${options.viewport.height}`
    : undefined;

  return ab.open(url, {
    viewport,
    userAgent: options?.userAgent,
    waitUntil: options?.waitUntil,
    timeout: options?.timeout,
  });
}

/**
 * Close the agent-browser session and stop the daemon.
 */
export async function closeBrowser(): Promise<string> {
  return ab.close();
}
