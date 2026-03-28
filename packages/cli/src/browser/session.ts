export function getBrowserSession(showBrowser: boolean) {
  const uiAvailable = process.env.CI !== "true"
    && (process.platform !== "linux" || Boolean(process.env.DISPLAY || process.env.WAYLAND_DISPLAY));
  const visible = showBrowser && uiAvailable;

  return {
    launchOptions: visible
      ? { headless: false, slowMo: 120 }
      : { headless: true },
    visible,
    label: visible
      ? "visible Playwright browser"
      : showBrowser
        ? "headless Playwright browser (no GUI display available)"
        : "headless Playwright browser",
  };
}
