import type { DesktopPlatform } from "./types.js";

// ─── Desktop Action Registry ────────────────────────────────────
// Defines all available desktop actions per platform. Used to:
// 1. Generate accurate prompts for AI providers
// 2. Validate AI-generated scenarios at parse time
// 3. Keep prompts in sync with actual executor capabilities

export interface DesktopActionDef {
  type: string;
  description: string;
  platforms: DesktopPlatform[];
  params: {
    selector?: string;
    value?: string;
    key?: string;
    url?: string;
  };
  examples: string[];
}

const ACTIONS: DesktopActionDef[] = [
  {
    type: "tap",
    description: "Click a desktop element using CSS selector or XPath.",
    platforms: ["electron"],
    params: { selector: "Element selector (CSS/XPath for Electron)" },
    examples: [
      '{ "type": "tap", "selector": "button[type=\\"submit\\"]", "description": "Click submit button" }',
    ],
  },
  {
    type: "click",
    description: "Alias for tap. Click a desktop element using CSS selector or XPath.",
    platforms: ["electron"],
    params: { selector: "Element selector (CSS/XPath for Electron)" },
    examples: [
      '{ "type": "click", "selector": "#login-button", "description": "Click login button" }',
    ],
  },
  {
    type: "fill",
    description: "Click an input field and type text into it using CSS selector or XPath.",
    platforms: ["electron"],
    params: {
      selector: "Input field selector (CSS/XPath for Electron)",
      value: "Text to type into the field",
    },
    examples: [
      '{ "type": "fill", "selector": "input[name=\\"email\\"]", "value": "test@example.com", "description": "Enter email" }',
    ],
  },
  {
    type: "select",
    description: "Select an option in a dropdown/select element. Electron only (web-based select elements).",
    platforms: ["electron"],
    params: {
      selector: "CSS selector or XPath for the select element",
      value: "Value or text of the option to select",
    },
    examples: [
      '{ "type": "select", "selector": "select[name=\\"country\\"]", "value": "US", "description": "Select country" }',
    ],
  },
  {
    type: "scroll",
    description: "Scroll the window or element. Positive value = scroll down, negative = scroll up.",
    platforms: ["electron"],
    params: { value: "Scroll distance in pixels (positive=down, negative=up). Default: 600" },
    examples: [
      '{ "type": "scroll", "value": "600", "description": "Scroll down to see more content" }',
      '{ "type": "scroll", "value": "-400", "description": "Scroll back up" }',
    ],
  },
  {
    type: "keyboard",
    description: "Press a keyboard key. Common keys: Enter, Tab, Escape, Backspace, Delete, ArrowUp, ArrowDown, ArrowLeft, ArrowRight.",
    platforms: ["electron"],
    params: { key: "Key name: Enter, Tab, Escape, Backspace, Delete, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, etc." },
    examples: [
      '{ "type": "keyboard", "key": "Enter", "description": "Submit the form" }',
      '{ "type": "keyboard", "key": "Tab", "description": "Move to next field" }',
    ],
  },
  {
    type: "wait",
    description: "Wait for a specified duration in milliseconds (max 5000ms) to let animations or loading complete.",
    platforms: ["electron"],
    params: { value: "Duration in milliseconds (e.g. 1000 for 1 second)" },
    examples: [
      '{ "type": "wait", "value": "2000", "description": "Wait for content to load" }',
    ],
  },
  {
    type: "assert",
    description: "Assert that an element with the given selector is visible on screen.",
    platforms: ["electron"],
    params: { selector: "Element selector (CSS/XPath for Electron)" },
    examples: [
      '{ "type": "assert", "selector": "h1.welcome", "description": "Verify welcome message" }',
    ],
  },
  {
    type: "navigate",
    description: "Navigate to a URL (Electron only, for web-based navigation within the app).",
    platforms: ["electron"],
    params: { url: "URL to navigate to (e.g. https://example.com or app://route)" },
    examples: [
      '{ "type": "navigate", "url": "https://example.com/dashboard", "description": "Navigate to dashboard" }',
    ],
  },
  {
    type: "screenshot",
    description: "Capture the current screen state as a PNG screenshot for evidence.",
    platforms: ["electron"],
    params: {},
    examples: [
      '{ "type": "screenshot", "description": "Capture current screen state" }',
    ],
  },
];

export function getActionsForPlatform(platform: DesktopPlatform): DesktopActionDef[] {
  return ACTIONS.filter((action) => action.platforms.includes(platform));
}

export function getValidActionTypes(platform: DesktopPlatform): Set<string> {
  return new Set(getActionsForPlatform(platform).map((a) => a.type));
}

export function isValidAction(type: string, platform: DesktopPlatform): boolean {
  return getValidActionTypes(platform).has(type);
}

export function buildDesktopActionPrompt(platform: DesktopPlatform): string {
  const actions = getActionsForPlatform(platform);
  
  const platformLabels: Record<DesktopPlatform, string> = {
    electron: "Electron",
  };
  
  const platformLabel = platformLabels[platform];

  const lines: string[] = [
    `## Available Desktop Actions (${platformLabel})`,
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
  
  if (platform === "electron") {
    lines.push("- For `tap`, `click`, `fill`, and `assert`: use CSS selectors or XPath expressions.");
    lines.push("- Prefer stable selectors like `#id`, `[data-testid=...]`, `[name=...]`, `[aria-label=...]`.");
    lines.push("- The app is already open. Do NOT start with a navigate action unless testing a specific URL.");
  }
  
  lines.push("- For `scroll`: use pixel values (positive=down, negative=up). Typical scroll distance is ~600px.");
  lines.push("- Include at least one `screenshot` action per scenario for evidence.");
  lines.push("- Return ONLY raw JSON. No markdown fences, no prose.");

  return lines.join("\n");
}

export function validateDesktopScenarioActions<T extends { actions: Array<{ type: string }> }>(
  scenarios: T[],
  platform: DesktopPlatform,
): T[] {
  const validTypes = getValidActionTypes(platform);
  return scenarios
    .map((scenario) => ({
      ...scenario,
      actions: scenario.actions.filter((action) => validTypes.has(action.type)),
    }))
    .filter((scenario) => scenario.actions.length > 0);
}
