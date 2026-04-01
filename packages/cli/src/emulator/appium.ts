import { spawn, type ChildProcessByStdio } from "node:child_process";
import type { Readable } from "node:stream";
import { mkdir } from "node:fs/promises";
import { createServer } from "node:net";
import { homedir } from "node:os";
import { join } from "node:path";
import type { NativePlatform } from "./types.js";
import type { ResolvedAndroidLaunchTarget, ResolvedIosLaunchTarget } from "./native-launch.js";
import { getAndroidToolEnv } from "./android-sdk.js";

const APPIUM_HOST = "127.0.0.1";
const APPIUM_HOME = join(homedir(), ".getwired", "appium");
const APPIUM_START_TIMEOUT = 45_000;
const DEFAULT_COMMAND_TIMEOUT = 30_000;
const APPIUM_NEW_COMMAND_TIMEOUT = 3000;
const ANDROID_CHROMEDRIVER_AUTODOWNLOAD_FEATURE = "chromedriver_autodownload";
const ANDROID_CHROMEDRIVER_AUTODOWNLOAD_FEATURE_SCOPED = "uiautomator2:chromedriver_autodownload";

interface CommandResult {
  ok: boolean;
  stdout: string;
  stderr: string;
}

export interface AppiumServer {
  process: ChildProcessByStdio<null, Readable, Readable>;
  port: number;
  url: string;
  stop(): Promise<void>;
}

export interface AppiumSession {
  id: string;
  server: AppiumServer;
  platform: NativePlatform;
  capabilities: Record<string, unknown>;
}

export interface AppiumContextInfo {
  id: string;
  title?: string;
  url?: string;
  bundleId?: string;
}

async function runCommand(
  command: string,
  args: string[],
  timeout = 300_000,
  env?: NodeJS.ProcessEnv,
): Promise<CommandResult> {
  return new Promise((resolve) => {
    let settled = false;
    let stdout = "";
    let stderr = "";

    const child = spawn(command, args, {
      stdio: ["ignore", "pipe", "pipe"],
      env: env ? { ...process.env, ...env } : process.env,
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
        stdout: stdout.trim(),
        stderr: `${command} ${args.join(" ")} timed out`,
      });
    }, timeout);

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("error", (error) => {
      finish({ ok: false, stdout: stdout.trim(), stderr: error.message });
    });
    child.on("close", (code) => {
      finish({
        ok: code === 0,
        stdout: stdout.trim(),
        stderr: stderr.trim(),
      });
    });
  });
}

async function hasCommand(command: string): Promise<boolean> {
  const result = await runCommand("which", [command], 5_000);
  return result.ok;
}

export async function hasAppiumCommand(): Promise<boolean> {
  return hasCommand("appium");
}

function getAppiumEnv(): NodeJS.ProcessEnv {
  return { APPIUM_HOME };
}

async function getAppiumMajorVersion(): Promise<number | undefined> {
  if (!(await hasAppiumCommand())) return undefined;
  const result = await runCommand("appium", ["--version"], 10_000, getAppiumEnv());
  const match = `${result.stdout}\n${result.stderr}`.match(/\b(\d+)\.\d+\.\d+\b/);
  return match ? Number.parseInt(match[1], 10) : undefined;
}

async function getAndroidAllowInsecureFeatureCandidates(): Promise<string[]> {
  const majorVersion = await getAppiumMajorVersion();
  const primary = majorVersion !== undefined && majorVersion < 3
    ? ANDROID_CHROMEDRIVER_AUTODOWNLOAD_FEATURE
    : ANDROID_CHROMEDRIVER_AUTODOWNLOAD_FEATURE_SCOPED;
  const fallback = primary === ANDROID_CHROMEDRIVER_AUTODOWNLOAD_FEATURE
    ? ANDROID_CHROMEDRIVER_AUTODOWNLOAD_FEATURE_SCOPED
    : ANDROID_CHROMEDRIVER_AUTODOWNLOAD_FEATURE;
  return [primary, fallback];
}

function shouldRetryAppiumAllowInsecureFeature(error: unknown, logs: string): boolean {
  const combined = `${String(error)}\n${logs}`;
  return /allow[- ]insecure/i.test(combined)
    || /full feature name must include/i.test(combined)
    || /feature name split by a colon/i.test(combined)
    || /insecure feature/i.test(combined);
}

export async function listInstalledAppiumDrivers(): Promise<string[]> {
  if (!(await hasAppiumCommand())) return [];
  await mkdir(APPIUM_HOME, { recursive: true });
  const jsonResult = await runCommand(
    "appium",
    ["driver", "list", "--installed", "--json"],
    60_000,
    getAppiumEnv(),
  );
  const namesFromJson = parseInstalledDriverNames(jsonResult.stdout);
  if (namesFromJson.length > 0) return namesFromJson;

  const textResult = await runCommand(
    "appium",
    ["driver", "list", "--installed"],
    60_000,
    getAppiumEnv(),
  );
  return parseInstalledDriverNames(`${textResult.stdout}\n${textResult.stderr}`);
}

export async function hasRequiredAppiumDriver(platform: NativePlatform): Promise<boolean> {
  const drivers = await listInstalledAppiumDrivers();
  return platform === "ios"
    ? drivers.includes("xcuitest")
    : drivers.includes("uiautomator2");
}

export async function installAppiumServer(): Promise<{ ok: boolean; error?: string }> {
  if (await hasAppiumCommand()) return { ok: true };
  const result = await runCommand("npm", ["install", "-g", "appium"]);
  return result.ok
    ? { ok: true }
    : { ok: false, error: result.stderr || "npm install -g appium failed" };
}

export async function installAppiumDriver(platform: NativePlatform): Promise<{ ok: boolean; error?: string }> {
  if (!(await hasAppiumCommand())) {
    return { ok: false, error: "The `appium` command is not available yet." };
  }
  await mkdir(APPIUM_HOME, { recursive: true });
  const driverName = platform === "ios" ? "xcuitest" : "uiautomator2";
  if (await hasRequiredAppiumDriver(platform)) {
    return { ok: true };
  }
  const result = await runCommand(
    "appium",
    ["driver", "install", driverName],
    300_000,
    getAppiumEnv(),
  );
  const combinedOutput = `${result.stdout}\n${result.stderr}`;
  if (/already installed/i.test(combinedOutput)) {
    return { ok: true };
  }
  return result.ok
    ? { ok: true }
    : { ok: false, error: combinedOutput.trim() || `appium driver install ${driverName} failed` };
}

async function findFreePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = createServer();
    server.listen(0, APPIUM_HOST, () => {
      const address = server.address();
      if (address && typeof address === "object") {
        const { port } = address;
        server.close((error) => {
          if (error) reject(error);
          else resolve(port);
        });
        return;
      }
      server.close();
      reject(new Error("Unable to allocate a free Appium port."));
    });
    server.on("error", reject);
  });
}

async function waitForServer(url: string, timeout = APPIUM_START_TIMEOUT): Promise<void> {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeout) {
    try {
      const response = await fetch(`${url}/status`);
      if (response.ok) return;
    } catch {
      // Retry until timeout.
    }
    await sleep(500);
  }
  throw new Error(`Timed out waiting for Appium server at ${url}`);
}

export async function startAppiumServer(platform: NativePlatform): Promise<AppiumServer> {
  if (!(await hasAppiumCommand())) {
    throw new Error("Appium CLI is not installed.");
  }
  await mkdir(APPIUM_HOME, { recursive: true });

  const port = await findFreePort();
  const url = `http://${APPIUM_HOST}:${port}`;
  const allowInsecureCandidates = platform === "android"
    ? await getAndroidAllowInsecureFeatureCandidates()
    : [undefined];
  const appiumEnv = platform === "android"
    ? { ...getAndroidToolEnv(process.env), ...getAppiumEnv() }
    : { ...process.env, ...getAppiumEnv() };
  let lastError: Error | undefined;

  for (const allowInsecureFeature of allowInsecureCandidates) {
    const args = [
      "server",
      "--address", APPIUM_HOST,
      "--port", String(port),
      "--base-path", "/",
      "--session-override",
    ];
    if (allowInsecureFeature) {
      args.push("--allow-insecure", allowInsecureFeature);
    }

    const child = spawn("appium", args, {
      stdio: ["ignore", "pipe", "pipe"],
      env: appiumEnv,
    });

    let serverStopped = false;
    let serverLogs = "";
    child.stdout.on("data", (chunk) => {
      serverLogs += chunk.toString();
    });
    child.stderr.on("data", (chunk) => {
      serverLogs += chunk.toString();
    });

    const stopChild = async () => {
      if (serverStopped) return;
      serverStopped = true;
      child.kill("SIGTERM");
      await new Promise<void>((resolve) => {
        child.once("close", () => resolve());
        setTimeout(resolve, 3_000);
      });
    };

    try {
      await Promise.race([
        waitForServer(url),
        new Promise<never>((_, reject) => {
          child.once("close", (code) => {
            reject(new Error(`Appium server exited before becoming ready (code ${code ?? "unknown"}).`));
          });
        }),
      ]);

      return {
        process: child,
        port,
        url,
        async stop() {
          await stopChild();
        },
      };
    } catch (error) {
      await stopChild();
      lastError = new Error(`${String(error)}${serverLogs ? `\n${serverLogs.trim()}` : ""}`);
      if (
        platform === "android"
        && allowInsecureFeature
        && allowInsecureFeature !== allowInsecureCandidates[allowInsecureCandidates.length - 1]
        && shouldRetryAppiumAllowInsecureFeature(error, serverLogs)
      ) {
        continue;
      }
      throw lastError;
    }
  }

  throw lastError ?? new Error("Failed to start Appium server.");
}

function buildSessionCapabilities(
  platform: NativePlatform,
  target: ResolvedAndroidLaunchTarget | ResolvedIosLaunchTarget,
  deviceId?: string,
): Record<string, unknown> {
  if (platform === "ios") {
    const iosTarget = target as ResolvedIosLaunchTarget;
    return {
      platformName: "iOS",
      "appium:automationName": "XCUITest",
      "appium:bundleId": iosTarget.bundleId,
      "appium:udid": deviceId,
      "appium:noReset": true,
      "appium:newCommandTimeout": APPIUM_NEW_COMMAND_TIMEOUT,
      "appium:webviewConnectRetries": 30,
      "appium:webviewConnectTimeout": 10_000,
      "appium:fullContextList": true,
      "appium:includeSafariInWebviews": true,
      "appium:additionalWebviewBundleIds": ["*"],
    };
  }

  const androidTarget = target as ResolvedAndroidLaunchTarget;
  return {
    platformName: "Android",
    "appium:automationName": "UiAutomator2",
    "appium:appPackage": androidTarget.packageName,
    ...(androidTarget.activity ? { "appium:appActivity": androidTarget.activity } : {}),
    "appium:udid": deviceId,
    "appium:noReset": true,
    "appium:newCommandTimeout": APPIUM_NEW_COMMAND_TIMEOUT,
    "appium:autoGrantPermissions": true,
    "appium:fullContextList": true,
  };
}

async function requestAppium<T>(
  serverUrl: string,
  method: "GET" | "POST" | "DELETE",
  path: string,
  body?: unknown,
  timeout = DEFAULT_COMMAND_TIMEOUT,
): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(`${serverUrl}${path}`, {
      method,
      headers: body ? { "content-type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
    const json = await response.json().catch(() => ({}));
    if (!response.ok || json?.value?.error) {
      const message = json?.value?.message || response.statusText || "Unknown Appium error";
      throw new Error(message);
    }
    return json as T;
  } finally {
    clearTimeout(timer);
  }
}

export async function createHybridAppiumSession(
  platform: NativePlatform,
  target: ResolvedAndroidLaunchTarget | ResolvedIosLaunchTarget,
  deviceId?: string,
): Promise<AppiumSession> {
  const server = await startAppiumServer(platform);
  try {
    const caps = buildSessionCapabilities(platform, target, deviceId);
    const result = await requestAppium<{
      sessionId?: string;
      value?: { sessionId?: string; capabilities?: Record<string, unknown> };
    }>(
      server.url,
      "POST",
      "/session",
      {
        capabilities: {
          alwaysMatch: caps,
          firstMatch: [{}],
        },
      },
      120_000,
    );

    const sessionId = result.value?.sessionId ?? result.sessionId;
    if (!sessionId) {
      throw new Error("Appium did not return a session id.");
    }

    return {
      id: sessionId,
      server,
      platform,
      capabilities: result.value?.capabilities ?? caps,
    };
  } catch (error) {
    await server.stop();
    throw error;
  }
}

export async function deleteAppiumSession(session: AppiumSession): Promise<void> {
  try {
    await requestAppium(session.server.url, "DELETE", `/session/${session.id}`);
  } catch {
    // Best-effort cleanup.
  } finally {
    await session.server.stop();
  }
}

export async function getAppiumContexts(session: AppiumSession): Promise<AppiumContextInfo[]> {
  const response = await requestAppium<{ value?: Array<string | Record<string, unknown>> }>(
    session.server.url,
    "GET",
    `/session/${session.id}/contexts`,
  );
  return normalizeContexts(response.value ?? []);
}

function normalizeContexts(items: Array<string | Record<string, unknown>>): AppiumContextInfo[] {
  return items.map((item) => {
    if (typeof item === "string") return { id: item };
    return {
      id: String(item.id ?? item.name ?? item.context ?? "UNKNOWN"),
      title: typeof item.title === "string" ? item.title : undefined,
      url: typeof item.url === "string" ? item.url : undefined,
      bundleId: typeof item.bundleId === "string" ? item.bundleId : undefined,
    };
  });
}

export async function switchAppiumContext(session: AppiumSession, contextId: string): Promise<void> {
  await requestAppium(session.server.url, "POST", `/session/${session.id}/context`, { name: contextId });
}

export async function waitForHybridWebviewContext(
  session: AppiumSession,
  timeout = 20_000,
): Promise<AppiumContextInfo> {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeout) {
    const contexts = await getAppiumContexts(session);
    const webview = contexts.find((context) => /^WEBVIEW/i.test(context.id));
    if (webview) return webview;
    await sleep(1_000);
  }

  const contexts = await getAppiumContexts(session).catch(() => []);
  const knownContexts = contexts.map((context) => context.id).join(", ") || "NATIVE_APP only";
  throw new Error(
    session.platform === "android"
      ? `Appium never exposed a WEBVIEW context. Available contexts: ${knownContexts}. Ensure the Android WebView is debuggable in this build.`
      : `Appium never exposed a WEBVIEW context. Available contexts: ${knownContexts}. Ensure the iOS webview is visible to Appium and the app is fully loaded.`,
  );
}

export async function getAppiumPageSource(session: AppiumSession): Promise<string> {
  const response = await requestAppium<{ value?: string }>(
    session.server.url,
    "GET",
    `/session/${session.id}/source`,
    undefined,
    60_000,
  );
  return response.value ?? "";
}

export async function executeAppiumScript<T = unknown>(
  session: AppiumSession,
  script: string,
  args: unknown[] = [],
): Promise<T> {
  const response = await requestAppium<{ value?: T }>(
    session.server.url,
    "POST",
    `/session/${session.id}/execute/sync`,
    { script, args },
    60_000,
  );
  return response.value as T;
}

export async function describeHybridWebview(session: AppiumSession): Promise<string> {
  const summary = await executeAppiumScript<Record<string, unknown>>(session, `return (() => {
    const normalizeText = (value) => (value || "").trim().replace(/\\s+/g, " ").slice(0, 80);
    const toXPathLiteral = (value) => {
      if (typeof value !== "string" || !value) return null;
      if (!value.includes("'")) return "'" + value + "'";
      if (!value.includes('"')) return '"' + value + '"';
      return null;
    };

    const selectorFor = (element) => {
      if (!(element instanceof Element)) return null;
      const attrNames = ["data-testid", "data-test", "data-qa", "id", "name", "aria-label", "placeholder"];
      for (const attr of attrNames) {
        const value = element.getAttribute(attr);
        if (!value) continue;
        if (attr === "id") return "#" + CSS.escape(value);
        return "[" + attr + "=\\"" + value.replace(/"/g, '\\\\"') + "\\"]";
      }
      if (element.tagName === "A" && element.getAttribute("href")) {
        return "a[href=\\"" + element.getAttribute("href").replace(/"/g, '\\\\"') + "\\"]";
      }
      return null;
    };

    const xpathFor = (element) => {
      if (!(element instanceof Element)) return null;
      const text = normalizeText(element.innerText || element.textContent || "");
      const role = element.getAttribute("role");
      const roleLiteral = toXPathLiteral(role);
      const textLiteral = toXPathLiteral(text);
      if (roleLiteral && textLiteral) {
        return "//*[@role=" + roleLiteral + " and normalize-space(.)=" + textLiteral + "]";
      }
      if (element.tagName === "BUTTON" && textLiteral) {
        return "//button[normalize-space(.)=" + textLiteral + "]";
      }
      if (element.tagName === "A" && textLiteral) {
        return "//a[normalize-space(.)=" + textLiteral + "]";
      }
      const placeholder = element.getAttribute("placeholder");
      const placeholderLiteral = toXPathLiteral(placeholder);
      if ((element.tagName === "INPUT" || element.tagName === "TEXTAREA") && placeholderLiteral) {
        return "//" + element.tagName.toLowerCase() + "[@placeholder=" + placeholderLiteral + "]";
      }
      return null;
    };

    const collect = (selector) => Array.from(document.querySelectorAll(selector))
      .slice(0, 40)
      .map((element) => {
        const cssSelector = selectorFor(element);
        const xpathSelector = xpathFor(element);
        return {
          tag: element.tagName.toLowerCase(),
          text: normalizeText(element.innerText || element.textContent || ""),
          selector: cssSelector || xpathSelector,
          selectorCandidates: Array.from(new Set([cssSelector, xpathSelector].filter(Boolean))).slice(0, 3),
          role: element.getAttribute("role") || undefined,
          name: element.getAttribute("name") || undefined,
          ariaLabel: element.getAttribute("aria-label") || undefined,
          placeholder: element.getAttribute("placeholder") || undefined,
          href: element.getAttribute("href") || undefined,
          type: element.getAttribute("type") || undefined,
        };
      });

    return {
      url: window.location.href,
      title: document.title,
      readyState: document.readyState,
      textSnippet: (document.body?.innerText || "").replace(/\\s+/g, " ").slice(0, 2000),
      buttons: collect("button, [role=button]"),
      links: collect("a[href]"),
      inputs: collect("input, textarea"),
      selects: collect("select"),
      forms: collect("form"),
      iframes: Array.from(document.querySelectorAll("iframe"))
        .slice(0, 20)
        .map((frame) => ({
          src: frame.getAttribute("src") || undefined,
          title: frame.getAttribute("title") || undefined,
        })),
    };
  })();`);

  return JSON.stringify(summary, null, 2);
}

type AppiumElementRef = string;

function getElementId(value: Record<string, unknown>): string | undefined {
  return typeof value["element-6066-11e4-a52e-4f735466cecf"] === "string"
    ? value["element-6066-11e4-a52e-4f735466cecf"] as string
    : typeof value.ELEMENT === "string"
      ? value.ELEMENT
      : undefined;
}

function getLocator(selector: string): { using: string; value: string } {
  const trimmed = selector.trim();
  if (trimmed.startsWith("//") || trimmed.startsWith("(//")) {
    return { using: "xpath", value: trimmed };
  }
  return { using: "css selector", value: trimmed };
}

function getResolveElementScript(action: "click" | "fill" | "select" | "exists"): string {
  const actionBody = {
    click: `
      target.scrollIntoView({ block: "center", inline: "center" });
      if (typeof target.click === "function") {
        target.click();
      } else {
        target.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, view: window }));
      }
      return true;`,
    fill: `
      const nextValue = arguments[1];
      target.focus();
      const proto = target.tagName === "TEXTAREA"
        ? HTMLTextAreaElement.prototype
        : HTMLInputElement.prototype;
      const descriptor = Object.getOwnPropertyDescriptor(proto, "value");
      if (descriptor && descriptor.set) descriptor.set.call(target, nextValue);
      else target.value = nextValue;
      target.dispatchEvent(new Event("input", { bubbles: true }));
      target.dispatchEvent(new Event("change", { bubbles: true }));
      return true;`,
    select: `
      const wanted = arguments[1];
      if (!(target instanceof HTMLSelectElement)) throw new Error("Select element not found");
      const options = Array.from(target.options);
      const match = options.find((option) => option.value === wanted || option.label === wanted || option.text === wanted);
      if (!match) throw new Error("No matching option");
      target.value = match.value;
      target.dispatchEvent(new Event("input", { bubbles: true }));
      target.dispatchEvent(new Event("change", { bubbles: true }));
      return true;`,
    exists: `
      return Boolean(target);`,
  }[action];

  return `const selector = arguments[0];
    const resolveElement = (rawSelector) => {
      if (!rawSelector || typeof rawSelector !== "string") return null;
      const trimmed = rawSelector.trim();
      if (!trimmed) return null;
      const normalizeText = (value) => String(value || "").replace(/\\s+/g, " ").trim();
      const findByText = (elements, expectedText) => {
        const normalizedExpected = normalizeText(expectedText);
        if (!normalizedExpected) return null;
        const exact = elements.find((element) => normalizeText(element.innerText || element.textContent) === normalizedExpected);
        if (exact) return exact;
        return elements.find((element) => {
          const text = normalizeText(element.innerText || element.textContent);
          return Boolean(text) && (text.includes(normalizedExpected) || normalizedExpected.includes(text));
        }) || null;
      };
      const roleTextMatch = trimmed.match(/^\\/\\/\\*\\[@role=(["'])(.+?)\\1 and normalize-space\\(\\.\\)=(["'])(.*?)\\3\\]$/);
      if (roleTextMatch) {
        return findByText(Array.from(document.querySelectorAll('[role="' + roleTextMatch[2] + '"]')), roleTextMatch[4]);
      }
      const buttonTextMatch = trimmed.match(/^\\/\\/button\\[normalize-space\\(\\.\\)=(["'])(.*?)\\1\\]$/);
      if (buttonTextMatch) {
        return findByText(Array.from(document.querySelectorAll("button")), buttonTextMatch[2]);
      }
      const linkTextMatch = trimmed.match(/^\\/\\/a\\[normalize-space\\(\\.\\)=(["'])(.*?)\\1\\]$/);
      if (linkTextMatch) {
        return findByText(Array.from(document.querySelectorAll("a")), linkTextMatch[2]);
      }
      if (trimmed.startsWith("//") || trimmed.startsWith("(//")) {
        const xpathResult = document.evaluate(trimmed, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
        if (xpathResult) return xpathResult;
        const fallbackTextMatch = trimmed.match(/normalize-space\\(\\.\\)=(["'])(.*?)\\1/);
        if (fallbackTextMatch) {
          return findByText(Array.from(document.querySelectorAll("button, a, [role=button], [role=tab]")), fallbackTextMatch[2]);
        }
        return null;
      }
      return document.querySelector(trimmed);
    };
    const target = resolveElement(selector);
    if (!(target instanceof Element)) throw new Error("Selector not found");
    ${actionBody}`;
}

export async function findAppiumElement(session: AppiumSession, selector: string): Promise<AppiumElementRef> {
  const locator = getLocator(selector);
  const response = await requestAppium<{ value?: Record<string, unknown> }>(
    session.server.url,
    "POST",
    `/session/${session.id}/element`,
    locator,
  );
  const elementId = response.value ? getElementId(response.value) : undefined;
  if (!elementId) {
    throw new Error(`Appium could not resolve selector "${selector}"`);
  }
  return elementId;
}

export async function clickAppiumElement(session: AppiumSession, selector: string): Promise<void> {
  try {
    const elementId = await findAppiumElement(session, selector);
    await requestAppium(session.server.url, "POST", `/session/${session.id}/element/${elementId}/click`, {});
  } catch {
    await executeAppiumScript(
      session,
      getResolveElementScript("click"),
      [selector],
    );
  }
}

export async function fillAppiumElement(session: AppiumSession, selector: string, value: string): Promise<void> {
  try {
    await executeAppiumScript(
      session,
      getResolveElementScript("fill"),
      [selector, value],
    );
  } catch {
    const elementId = await findAppiumElement(session, selector);
    await requestAppium(session.server.url, "POST", `/session/${session.id}/element/${elementId}/clear`, {});
    await requestAppium(session.server.url, "POST", `/session/${session.id}/element/${elementId}/value`, {
      text: value,
      value: Array.from(value),
    });
  }
}

export async function selectAppiumOption(session: AppiumSession, selector: string, value: string): Promise<void> {
  await executeAppiumScript(
    session,
    getResolveElementScript("select"),
    [selector, value],
  );
}

export async function assertAppiumSelector(session: AppiumSession, selector: string): Promise<boolean> {
  try {
    await findAppiumElement(session, selector);
    return true;
  } catch {
    try {
      return await executeAppiumScript<boolean>(session, getResolveElementScript("exists"), [selector]);
    } catch {
      const pageSource = await getAppiumPageSource(session).catch(() => "");
      return pageSource.toLowerCase().includes(selector.toLowerCase());
    }
  }
}

export async function navigateAppiumTo(session: AppiumSession, url: string): Promise<void> {
  if (/^https?:\/\//i.test(url)) {
    await requestAppium(session.server.url, "POST", `/session/${session.id}/url`, { url });
    return;
  }
  await executeAppiumScript(session, "window.location.href = arguments[0];", [url]);
}

export async function scrollAppiumBy(session: AppiumSession, amount: number): Promise<void> {
  await executeAppiumScript(session, "window.scrollBy({ top: arguments[0], behavior: 'auto' });", [amount]);
}

export async function pressAppiumKey(session: AppiumSession, key: string): Promise<void> {
  await executeAppiumScript(
    session,
    `const key = arguments[0];
     const el = document.activeElement || document.body;
     if (!el) return;
     const down = new KeyboardEvent("keydown", { key, bubbles: true });
     const press = new KeyboardEvent("keypress", { key, bubbles: true });
     const up = new KeyboardEvent("keyup", { key, bubbles: true });
     el.dispatchEvent(down);
     el.dispatchEvent(press);
     el.dispatchEvent(up);
     if (key === "Enter" && el.form && typeof el.form.requestSubmit === "function") {
       el.form.requestSubmit();
     }`,
    [normalizeKeyName(key)],
  );
}

export async function captureAppiumScreenshot(session: AppiumSession): Promise<Buffer> {
  const response = await requestAppium<{ value?: string }>(
    session.server.url,
    "GET",
    `/session/${session.id}/screenshot`,
    undefined,
    60_000,
  );
  return Buffer.from(response.value ?? "", "base64");
}

function normalizeKeyName(key: string): string {
  switch (key.toLowerCase()) {
    case "enter":
      return "Enter";
    case "tab":
      return "Tab";
    case "escape":
      return "Escape";
    default:
      return key;
  }
}

function parseInstalledDriverNames(raw: string): string[] {
  const trimmed = raw.trim();
  if (!trimmed) return [];

  try {
    const parsed = JSON.parse(trimmed);
    const names = new Set<string>();
    collectDriverNames(parsed, names);
    if (names.size > 0) return Array.from(names);
  } catch {
    // Fallback to text parsing below.
  }

  const names = new Set<string>();
  for (const match of trimmed.matchAll(/\b(xcuitest|uiautomator2)\b/gi)) {
    names.add(match[1].toLowerCase());
  }
  for (const match of trimmed.matchAll(/^\s*[-•*]?\s*([a-z0-9-]+)\s*(?:@|$)/gim)) {
    names.add(match[1].toLowerCase());
  }
  return Array.from(names);
}

function collectDriverNames(value: unknown, names: Set<string>): void {
  if (!value) return;
  if (Array.isArray(value)) {
    for (const item of value) collectDriverNames(item, names);
    return;
  }
  if (typeof value === "object") {
    for (const [key, item] of Object.entries(value)) {
      if (/^(xcuitest|uiautomator2)$/i.test(key)) {
        names.add(key.toLowerCase());
      }
      collectDriverNames(item, names);
    }
    return;
  }
  if (typeof value === "string" && /^(xcuitest|uiautomator2)$/i.test(value.trim())) {
    names.add(value.trim().toLowerCase());
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
