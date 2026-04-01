import type { NativePlatform } from "./types.js";

// ─── Native Action Registry ────────────────────────────────────
// Defines all available native actions per platform. Used to:
// 1. Generate accurate prompts for AI providers
// 2. Validate AI-generated scenarios at parse time
// 3. Keep prompts in sync with actual executor capabilities

export interface NativeActionDef {
  type: string;
  description: string;
  platforms: NativePlatform[];
  params: {
    selector?: string;
    value?: string;
    key?: string;
    url?: string;
  };
  examples: string[];
}

type AutomationMode = "native" | "hybrid";

const ACTIONS: NativeActionDef[] = [
  {
    type: "tap",
    description: "Tap a native element by its visible label, accessibility identifier, or resource-id",
    platforms: ["android", "ios"],
    params: { selector: "Visible text, accessibility label, or resource-id of the element to tap" },
    examples: [
      '{ "type": "tap", "selector": "Sign In", "description": "Tap the Sign In button" }',
      '{ "type": "tap", "selector": "username_field", "description": "Tap the username input" }',
    ],
  },
  {
    type: "fill",
    description: "Tap an input field and type text into it. The field is tapped first, then text is entered",
    platforms: ["android", "ios"],
    params: {
      selector: "Visible label or accessibility identifier of the input field",
      value: "Text to type into the field",
    },
    examples: [
      '{ "type": "fill", "selector": "Email", "value": "test@example.com", "description": "Enter email address" }',
    ],
  },
  {
    type: "scroll",
    description: "Scroll the screen up or down. Positive value = scroll down, negative = scroll up",
    platforms: ["android", "ios"],
    params: { value: "Scroll distance in pixels (positive=down, negative=up). Default: 600" },
    examples: [
      '{ "type": "scroll", "value": "600", "description": "Scroll down to see more content" }',
      '{ "type": "scroll", "value": "-400", "description": "Scroll back up" }',
    ],
  },
  {
    type: "swipe-gesture",
    description: "Perform a named swipe gesture (iOS only: scroll-up, scroll-down, scroll-left, scroll-right, swipe-from-left-edge for back navigation, swipe-from-bottom-edge to reveal)",
    platforms: ["ios"],
    params: { value: "Gesture preset name" },
    examples: [
      '{ "type": "swipe-gesture", "value": "swipe-from-left-edge", "description": "Swipe from left edge to go back" }',
    ],
  },
  {
    type: "keyboard",
    description: "Press a keyboard key. Android: Enter, Tab, Back, Escape, Home, Delete. iOS: Enter, Tab, Escape, Delete (uses HID keycodes internally)",
    platforms: ["android", "ios"],
    params: { key: "Key name: Enter, Tab, Escape, Back, Delete, Home" },
    examples: [
      '{ "type": "keyboard", "key": "Enter", "description": "Submit the form" }',
      '{ "type": "keyboard", "key": "Back", "description": "Navigate back (Android)" }',
    ],
  },
  {
    type: "button",
    description: "Press a hardware button (iOS only: home, lock, side-button, siri). On Android, use keyboard with Home or Back instead",
    platforms: ["ios"],
    params: { key: "Button name: home, lock, side-button, siri" },
    examples: [
      '{ "type": "button", "key": "home", "description": "Press the home button" }',
    ],
  },
  {
    type: "screenshot",
    description: "Capture the current screen state as a PNG screenshot for evidence",
    platforms: ["android", "ios"],
    params: {},
    examples: [
      '{ "type": "screenshot", "description": "Capture current screen state" }',
    ],
  },
  {
    type: "wait",
    description: "Wait for a specified duration in milliseconds (max 5000ms) to let animations or loading complete",
    platforms: ["android", "ios"],
    params: { value: "Duration in milliseconds (e.g. 1000 for 1 second)" },
    examples: [
      '{ "type": "wait", "value": "2000", "description": "Wait for content to load" }',
    ],
  },
  {
    type: "assert",
    description: "Assert that a native element with the given text or accessibility label is visible on screen",
    platforms: ["android", "ios"],
    params: { selector: "Text or accessibility label that should be visible" },
    examples: [
      '{ "type": "assert", "selector": "Welcome", "description": "Verify welcome screen is shown" }',
    ],
  },
  {
    type: "navigate",
    description: "Open a deep link URL in the app (Android: via intent, iOS: via simctl openurl). Only use for deep links, not regular URLs",
    platforms: ["android", "ios"],
    params: { url: "Deep link URL (e.g. myapp://profile)" },
    examples: [
      '{ "type": "navigate", "url": "myapp://settings", "description": "Open settings via deep link" }',
    ],
  },
];

export function getActionsForPlatform(platform: NativePlatform): NativeActionDef[] {
  return ACTIONS.filter((action) => action.platforms.includes(platform));
}

export function getValidActionTypes(platform: NativePlatform): Set<string> {
  return new Set(getActionsForPlatform(platform).map((a) => a.type));
}

export function isValidAction(type: string, platform: NativePlatform): boolean {
  return getValidActionTypes(platform).has(type);
}

// Generate the action reference section for AI prompts
export function buildActionPrompt(platform: NativePlatform, mode: AutomationMode = "native"): string {
  if (mode === "hybrid") {
    return buildHybridActionPrompt(platform);
  }

  const actions = getActionsForPlatform(platform);
  const platformLabel = platform === "android" ? "Android Emulator" : "iOS Simulator";

  const lines: string[] = [
    `## Available Native Actions (${platformLabel})`,
    "",
    "You MUST only use action types from this list. Any other action type will be rejected.",
    "",
  ];

  for (const action of actions) {
    lines.push(`### \`${action.type}\``);
    lines.push(action.description);
    const paramEntries = Object.entries(action.params);
    if (paramEntries.length > 0) {
      lines.push("Parameters:");
      for (const [key, desc] of paramEntries) {
        lines.push(`  - \`${key}\`: ${desc}`);
      }
    }
    lines.push(`Example: ${action.examples[0]}`);
    lines.push("");
  }

  lines.push("## Action JSON Format");
  lines.push("");
  lines.push("Return scenarios as a JSON array:");
  lines.push("```");
  lines.push('[{ "name": "Scenario name", "category": "happy-path|edge-case|abuse|boundary|error-recovery",');
  lines.push('   "actions": [{ "type": "<action-type>", "selector": "...", "value": "...", "key": "...", "url": "...", "description": "What you are doing and why" }] }]');
  lines.push("```");
  lines.push("");
  lines.push("CRITICAL RULES:");
  lines.push("- ONLY use action types listed above. Do NOT invent new action types.");
  lines.push("- For `tap` and `fill`: use the exact visible text, accessibility label, or resource-id from the UI structure. Do NOT use CSS selectors or XPath.");
  lines.push("- For `assert`: use text that should be visible on screen, not element IDs.");
  lines.push("- For `scroll`: use pixel values (positive=down, negative=up). Typical screen height is ~800pt.");
  lines.push("- The app is already open. Do NOT start with a navigate action unless testing a deep link.");
  lines.push("- Include at least one `screenshot` action per scenario for evidence.");
  lines.push("- Return ONLY raw JSON. No markdown fences, no prose.");

  return lines.join("\n");
}

function buildHybridActionPrompt(platform: NativePlatform): string {
  const platformLabel = platform === "android" ? "Android Emulator" : "iOS Simulator";
  return [
    `## Available Hybrid Actions (${platformLabel} via Appium WEBVIEW)`,
    "",
    "The app is a hybrid WebView shell. Interactions happen inside a WEBVIEW context through Appium.",
    "You MUST only use action types from this list. Any other action type will be rejected.",
    "",
    "### `click`",
    "Click an element inside the WEBVIEW using a CSS selector or XPath selector.",
    "Example: { \"type\": \"click\", \"selector\": \"button[type=\\\"submit\\\"]\", \"description\": \"Submit the form\" }",
    "",
    "### `tap`",
    "Alias for click. Use only if the control behaves like a tap target.",
    "Example: { \"type\": \"tap\", \"selector\": \"[data-testid=\\\"nav-chat\\\"]\", \"description\": \"Open chat tab\" }",
    "",
    "### `fill`",
    "Fill a WEBVIEW input or textarea using a CSS selector or XPath selector.",
    "Example: { \"type\": \"fill\", \"selector\": \"input[name=\\\"email\\\"]\", \"value\": \"test@example.com\", \"description\": \"Enter email\" }",
    "",
    "### `select`",
    "Select an option in a `<select>` element using a CSS selector or XPath selector.",
    "Example: { \"type\": \"select\", \"selector\": \"select[name=\\\"guild\\\"]\", \"value\": \"Knights\", \"description\": \"Choose guild\" }",
    "",
    "### `assert`",
    "Assert that a WEBVIEW element or text is visible. Prefer selectors when possible.",
    "Example: { \"type\": \"assert\", \"selector\": \"form button[type=\\\"submit\\\"]\", \"description\": \"Verify the submit button is visible\" }",
    "",
    "### `scroll`",
    "Scroll the WEBVIEW vertically by pixel amount. Positive = down, negative = up.",
    "Example: { \"type\": \"scroll\", \"value\": \"600\", \"description\": \"Scroll down in the current screen\" }",
    "",
    "### `navigate`",
    "Navigate the WEBVIEW to an http(s) URL, an in-app route, or a native deep link if required.",
    "Example: { \"type\": \"navigate\", \"url\": \"/chat\", \"description\": \"Open the chat route\" }",
    "",
    "### `wait`",
    "Wait for a specified duration in milliseconds (max 5000ms).",
    "Example: { \"type\": \"wait\", \"value\": \"1000\", \"description\": \"Wait for the app to settle\" }",
    "",
    "### `screenshot`",
    "Capture the current app screen for evidence.",
    "Example: { \"type\": \"screenshot\", \"description\": \"Capture the current screen\" }",
    "",
    "### `keyboard`",
    "Dispatch a keyboard key inside the WEBVIEW. Only use Enter, Tab, or Escape unless the DOM summary clearly needs it.",
    "Example: { \"type\": \"keyboard\", \"key\": \"Enter\", \"description\": \"Submit the focused form\" }",
    "",
    "## Action JSON Format",
    "",
    "Return scenarios as a JSON array:",
    "```",
    '[{ "name": "Scenario name", "category": "happy-path|edge-case|abuse|boundary|error-recovery",',
    '   "actions": [{ "type": "<action-type>", "selector": "...", "value": "...", "key": "...", "url": "...", "description": "What you are doing and why" }] }]',
    "```",
    "",
    "CRITICAL RULES:",
    "- Use CSS selectors or XPath from the WEBVIEW DOM summary. Reuse `selector` or `selectorCandidates` exactly when they are available. Do NOT use native accessibility labels for hybrid actions.",
    "- Prefer stable selectors like `#id`, `[data-testid=...]`, `[name=...]`, `[aria-label=...]`, or `[placeholder=...]`.",
    "- Prefer CSS over XPath. Only use XPath when the DOM summary does not provide a stable CSS candidate.",
    "- Never use generic selectors like `button`, `button[type=\"button\"]`, `//button`, or `[role=button]` for required actions. Those are too weak and will be rejected.",
    "- The app is already open inside the native shell. Do NOT begin every scenario with a navigate action unless route/deep-link coverage is the goal.",
    "- Include at least one `screenshot` action per scenario for evidence.",
    "- Return ONLY raw JSON. No markdown fences, no prose.",
  ].join("\n");
}

// Validate and filter scenarios, removing actions with invalid types.
// Generic to preserve the caller's scenario type.
export function validateScenarioActions<T extends { actions: Array<{ type: string }> }>(
  scenarios: T[],
  platform: NativePlatform,
  mode: AutomationMode = "native",
): T[] {
  const validTypes = mode === "hybrid"
    ? new Set(["navigate", "click", "tap", "fill", "select", "scroll", "wait", "screenshot", "keyboard", "assert"])
    : getValidActionTypes(platform);
  return scenarios
    .map((scenario) => ({
      ...scenario,
      actions: scenario.actions.filter((action) => validTypes.has(action.type)),
    }))
    .filter((scenario) => scenario.actions.length > 0);
}
