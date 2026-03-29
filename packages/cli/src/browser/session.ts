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
