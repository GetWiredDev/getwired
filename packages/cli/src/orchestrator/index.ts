import { readFile, writeFile, readdir, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, relative } from "node:path";
import { execSync } from "node:child_process";
import { getBrowserSession } from "../browser/session.js";
import { getProvider } from "../providers/registry.js";
import { loadConfig, getBaselineDir, getReportDir, getNotesDir } from "../config/settings.js";
import { captureScreenshots, captureMultiplePages } from "../screenshot/capture.js";
import { compareScreenshots, imageToBase64 } from "../screenshot/compare.js";
import type {
  TestContext,
  TestReport,
  TestFinding,
  TestPersona,
  TestingProvider,
} from "../providers/types.js";
import type { GetwiredSettings } from "../config/settings.js";

export type TestPhase =
  | "initializing"
  | "scanning"
  | "planning"
  | "capturing-baseline"
  | "testing"
  | "capturing-current"
  | "comparing"
  | "analyzing"
  | "breaking"
  | "reporting"
  | "done"
  | "error";

export interface TestStep {
  name: string;
  status: "pending" | "running" | "passed" | "failed" | "skipped";
  duration?: number;
  details?: string;
}

export interface OrchestratorCallbacks {
  onPhaseChange: (phase: TestPhase, message: string) => void;
  onStepUpdate: (steps: TestStep[]) => void;
  onFinding: (finding: TestFinding) => void;
  onLog: (message: string) => void;
  onProviderOutput?: (text: string) => void;
}

// ─── Interaction action types for Playwright execution ───
interface TestAction {
  type: "navigate" | "click" | "fill" | "select" | "scroll" | "wait" | "screenshot" | "assert" | "keyboard";
  selector?: string;
  value?: string;
  url?: string;
  key?: string;
  description: string;
}

interface InteractionScenario {
  name: string;
  category: "happy-path" | "edge-case" | "abuse" | "boundary" | "error-recovery";
  actions: TestAction[];
}

// ─── Main test session ──────────────────────────────────
export async function runTestSession(
  projectPath: string,
  options: {
    url?: string;
    commitId?: string;
    prId?: string;
    scope?: string;
    persona?: TestPersona;
  },
  callbacks: OrchestratorCallbacks,
): Promise<TestReport> {
  const startTime = Date.now();
  const settings = await loadConfig(projectPath);
  const provider = getProvider(settings.provider);
  const browserSession = getBrowserSession(settings.testing.showBrowser);
  const persona = options.persona ?? "standard";
  const personaProfile = getPersonaProfile(persona);
  const findings: TestFinding[] = [];

  const runId = generateId();
  const context: TestContext = {
    projectPath,
    url: options.url ?? settings.project.url,
    commitId: options.commitId,
    prId: options.prId,
    scope: options.scope,
    persona,
    deviceProfile: settings.testing.deviceProfile,
    baselineDir: getBaselineDir(projectPath),
    reportDir: join(getReportDir(projectPath), runId),
  };

  await mkdir(context.reportDir, { recursive: true });

  const steps: TestStep[] = personaProfile.stepNames.map((name) => ({ name, status: "pending" }));

  callbacks.onStepUpdate(steps);

  const out = (text: string) => callbacks.onProviderOutput?.(text);

  async function streamAnalyze(
    ctx: TestContext,
    messages: { role: "user" | "assistant" | "system"; content: string }[],
  ): Promise<string> {
    let full = "";
    for await (const chunk of provider.stream(ctx, messages)) {
      if (chunk.type === "text" && chunk.content) {
        out(chunk.content);
        full += chunk.content;
      } else if (chunk.type === "tool_call" && chunk.toolCall) {
        out(`\n[tool: ${chunk.toolCall.name}(${JSON.stringify(chunk.toolCall.args).slice(0, 80)})]\n`);
      }
    }
    out("\n");
    return full;
  }

  try {
    // ── Step 1: Scan project ───────────────────────────
    callbacks.onPhaseChange("scanning", "Scanning project structure...");
    await updateStep(steps, 0, "running", callbacks);
    const projectInfo = await scanProject(projectPath, context);
    await updateStep(steps, 0, "passed", callbacks, Date.now() - startTime);

    // ── Step 2: Load notes ─────────────────────────────
    callbacks.onPhaseChange("scanning", "Loading project context...");
    await updateStep(steps, 1, "running", callbacks);
    const notes = await loadProjectNotes(projectPath);
    await updateStep(steps, 1, "passed", callbacks);

    // ── Step 3: Reconnaissance — AI explores like a human would ──
    callbacks.onPhaseChange("planning", personaProfile.phaseMessages.planning);
    await updateStep(steps, 2, "running", callbacks);
    out(`> ${settings.provider}: ${personaProfile.outputMessages.planning}\n\n`);

    let pageMap = "";
    if (context.url) {
      out(`> Crawling visible links and forms...\n`);
      pageMap = await crawlSiteMap(context.url, out, settings.testing.showBrowser);
    }

    const testPlan = await streamAnalyze(context, [
      { role: "system", content: buildSystemPrompt(persona) },
      { role: "user", content: buildReconPrompt(context, projectInfo, notes, pageMap) },
    ]);
    callbacks.onLog(`Test plan generated with ${countPlanSteps(testPlan)} scenarios`);
    await updateStep(steps, 2, "passed", callbacks);

    // ── Step 4: First impression screenshots ───────────
    let captures: Array<{ path: string; url: string; device: "desktop" | "mobile" }> = [];

    if (context.url) {
      callbacks.onPhaseChange("capturing-current", "Taking first-impression screenshots...");
      await updateStep(
        steps,
        3,
        "running",
        callbacks,
        undefined,
        `Opening ${browserSession.label} for first-impression captures`,
      );
      out(`> Opening ${browserSession.label} — first thing a human sees...\n`);

      const pages = settings.project.pages.length > 0
        ? settings.project.pages
        : [context.url];

      try {
        captures = await captureMultiplePages(pages, {
          outputDir: join(context.reportDir, "screenshots"),
          deviceProfile: settings.testing.deviceProfile,
          viewports: settings.testing.viewports,
          fullPage: settings.testing.screenshotFullPage,
          delay: settings.testing.screenshotDelay,
          showBrowser: settings.testing.showBrowser,
        });
        for (const cap of captures) {
          out(`  📸 ${cap.device}: ${toProjectRelativePath(projectPath, cap.path)}\n`);
        }
        await updateStep(
          steps,
          3,
          "passed",
          callbacks,
          undefined,
          `Saved ${captures.length} screenshot${captures.length === 1 ? "" : "s"} to ${toProjectRelativePath(projectPath, join(context.reportDir, "screenshots"))}`,
        );
      } catch (err) {
        out(`\n! Screenshot failed: ${String(err).slice(0, 100)}\n`);
        await updateStep(steps, 3, "failed", callbacks, undefined, "Screenshot capture failed");
      }

      // ── Step 5: Compare with baselines ──────────────
      callbacks.onPhaseChange("comparing", "Comparing with baselines...");
      await updateStep(steps, 4, "running", callbacks);
      if (captures.length > 0) {
        out(`\n> Pixel-diffing against baselines...\n`);
        const regressionFindings = await compareWithBaselines(captures, context, settings, provider, callbacks);
        findings.push(...regressionFindings);
      }
      await updateStep(steps, 4, captures.length > 0 ? "passed" : "skipped", callbacks);
    } else {
      await updateStep(steps, 3, "skipped", callbacks);
      await updateStep(steps, 4, "skipped", callbacks);
    }

    // ── Step 6: Walk the happy paths (real Playwright interactions) ──
    if (context.url) {
      callbacks.onPhaseChange("testing", personaProfile.phaseMessages.happyPath);
      await updateStep(steps, 5, "running", callbacks, undefined, `Using ${browserSession.label}`);
      out(`\n> ${settings.provider}: ${personaProfile.outputMessages.happyPath}\n\n`);

      const happyPathResult = await streamAnalyze(context, [
        { role: "system", content: buildSystemPrompt(persona) },
        { role: "user", content: buildHappyPathPrompt(context, testPlan, pageMap) },
      ]);

      const happyScenarios = parseScenarios(happyPathResult);
      if (happyScenarios.length > 0 && context.url) {
        out(`\n> Executing ${happyScenarios.length} happy-path scenarios in browser...\n`);
        const happyFindings = await executeScenarios(
          happyScenarios, context, settings, out,
        );
        findings.push(...happyFindings);
      }
      await updateStep(steps, 5, "passed", callbacks);

      // ── Step 7: Try to break things (adversarial testing) ──
      callbacks.onPhaseChange("breaking", personaProfile.phaseMessages.breaking);
      await updateStep(steps, 6, "running", callbacks, undefined, `Using ${browserSession.label}`);
      out(`\n> ${settings.provider}: ${personaProfile.outputMessages.breaking}\n\n`);

      const breakResult = await streamAnalyze(context, [
        { role: "system", content: buildSystemPrompt(persona) },
        { role: "user", content: buildBreakItPrompt(context, testPlan, pageMap) },
      ]);

      const breakScenarios = parseScenarios(breakResult);
      if (breakScenarios.length > 0) {
        out(`\n> Executing ${breakScenarios.length} adversarial scenarios...\n`);
        const breakFindings = await executeScenarios(
          breakScenarios, context, settings, out,
        );
        findings.push(...breakFindings);
      }
      await updateStep(steps, 6, "passed", callbacks);

      // ── Step 8: Edge cases & boundary testing ──────────
      callbacks.onPhaseChange("breaking", personaProfile.phaseMessages.edgeCases);
      await updateStep(steps, 7, "running", callbacks, undefined, `Using ${browserSession.label}`);
      out(`\n> ${settings.provider}: ${personaProfile.outputMessages.edgeCases}\n\n`);

      const edgeResult = await streamAnalyze(context, [
        { role: "system", content: buildSystemPrompt(persona) },
        { role: "user", content: buildEdgeCasePrompt(context, testPlan, pageMap) },
      ]);

      const edgeScenarios = parseScenarios(edgeResult);
      if (edgeScenarios.length > 0) {
        out(`\n> Executing ${edgeScenarios.length} edge-case scenarios...\n`);
        const edgeFindings = await executeScenarios(
          edgeScenarios, context, settings, out,
        );
        findings.push(...edgeFindings);
      }
      await updateStep(steps, 7, "passed", callbacks);
    } else {
      await updateStep(steps, 5, "skipped", callbacks);
      await updateStep(steps, 6, "skipped", callbacks);
      await updateStep(steps, 7, "skipped", callbacks);
    }

    // ── Step 9: Accessibility & keyboard-only ────────────
    callbacks.onPhaseChange("testing", personaProfile.phaseMessages.accessibility);
    await updateStep(steps, 8, "running", callbacks, undefined, `Using ${browserSession.label}`);

    if (context.url) {
      out(`\n> Running real keyboard-only navigation test...\n`);
      const a11yFindings = await testAccessibility(context, settings, out);
      findings.push(...a11yFindings);

      out(`\n> ${settings.provider}: ${personaProfile.outputMessages.accessibility}\n\n`);
      const a11yAiResult = await streamAnalyze(context, [
        { role: "system", content: buildSystemPrompt(persona) },
        { role: "user", content: buildAccessibilityPrompt(context, pageMap) },
      ]);
      findings.push(...parseFindings(a11yAiResult));
    }
    await updateStep(steps, 8, context.url ? "passed" : "skipped", callbacks);

    // ── Step 10: Generate report ────────────────────────
    callbacks.onPhaseChange("reporting", "Generating report...");
    await updateStep(steps, 9, "running", callbacks);

    const report: TestReport = {
      id: runId,
      timestamp: new Date().toISOString(),
      provider: settings.provider,
      context,
      findings,
      summary: {
        totalTests: steps.length,
        passed: steps.filter((s) => s.status === "passed").length,
        failed: findings.filter((f) => f.severity === "critical" || f.severity === "high").length,
        warnings: findings.filter((f) => f.severity === "medium" || f.severity === "low").length,
        duration: Date.now() - startTime,
      },
      notes: [notes],
    };

    await saveReport(context.reportDir, report);
    out(`\n> Report saved: ${report.id}.json\n`);
    await updateStep(steps, 9, "passed", callbacks);

    callbacks.onPhaseChange("done", "Testing complete!");
    return report;
  } catch (err) {
    out(`\n! Error: ${String(err)}\n`);
    callbacks.onPhaseChange("error", `Error: ${err}`);
    throw err;
  }
}

const BASE_SYSTEM_PROMPT = `You are GetWired — a senior QA engineer with 15 years of experience who tests web apps the way a skeptical, thorough human would. You don't just verify that things work; you actively try to make them fail.

Your testing personality:
- You click things a normal user wouldn't think to click
- You paste garbage into every input field you find
- You submit forms with missing fields, wrong formats, absurd values
- You hit the back button at the worst possible time
- You double-click submit buttons, mash Enter, rapid-fire actions
- You try URLs that shouldn't exist, parameters that don't belong
- You resize the browser mid-action to see what breaks
- You disable JavaScript mentally and ask "what if this didn't load?"
- You think "what would happen if the API returned an error right here?"
- You navigate away mid-form, return, and check if state is preserved
- You look for things that "technically work but feel broken"

You are NOT a scanner or automated tool. You are a person sitting at a computer, using the app, and reporting what feels wrong.

When you return findings, use this JSON format:
[{ "id": "unique-id", "severity": "critical|high|medium|low|info", "category": "functional|ui-regression|accessibility|performance|security|console-error", "title": "Short description", "description": "Detailed explanation of what happened and why it matters", "steps": ["Step 1", "Step 2"], "url": "page where it happened", "device": "desktop|mobile" }]

When you return interaction scenarios, use this JSON format:
[{ "name": "Scenario name", "category": "happy-path|edge-case|abuse|boundary|error-recovery", "actions": [{ "type": "navigate|click|fill|select|scroll|wait|screenshot|keyboard", "selector": "CSS selector", "value": "text to type or URL", "url": "for navigate actions", "key": "for keyboard actions like Tab, Enter, Escape", "description": "What a human tester would say they're doing" }] }]`;

const PERSONA_PROMPT_APPENDIX: Record<TestPersona, string> = {
  standard: `Mode: Standard testing.
Keep a balanced QA mindset. Cover obvious flows first, then escalate into meaningful abuse and edge cases.`,
  hacky: `Mode: Hacky testing.
Behave like a curious, persistent attacker with no privileged access. Stay inside what a browser user can do by navigating, clicking, typing, reloading, editing URLs, query params, hashes, form inputs, and normal browser actions. Focus on exposed admin paths, insecure object references, role leaks, missing guards, destructive actions, confusing state transitions, and places where the app reveals too much or lets a normal visitor do too much.
Do not assume shell access, stolen credentials, direct database access, or hidden APIs that a browser user cannot reach.`,
  "old-man": `Mode: Old Man Test.
Simulate an older, non-technical user who is trying sincerely to use the app but is hesitant, literal, and easily confused. Move slower, prefer the obvious button, misread labels, distrust jargon, and notice anything unclear or intimidating. Report what felt easy, what was confusing, what wording was hard to understand, and what would make this person give up or call someone for help.`,
};

interface PersonaProfile {
  stepNames: string[];
  phaseMessages: {
    planning: string;
    happyPath: string;
    breaking: string;
    edgeCases: string;
    accessibility: string;
  };
  outputMessages: {
    planning: string;
    happyPath: string;
    breaking: string;
    edgeCases: string;
    accessibility: string;
  };
}

const PERSONA_PROFILES: Record<TestPersona, PersonaProfile> = {
  standard: {
    stepNames: [
      "Scan project structure",
      "Load project context & notes",
      "Reconnaissance & test planning",
      "First impression & screenshots",
      "Compare with baselines",
      "Walk the happy paths",
      "Try to break things",
      "Poke at edge cases & boundaries",
      "Accessibility & keyboard-only",
      "Generate report",
    ],
    phaseMessages: {
      planning: "Exploring the site like a human tester...",
      happyPath: "Walking the happy paths...",
      breaking: "Trying to break things...",
      edgeCases: "Poking at edge cases...",
      accessibility: "Testing accessibility like a real user...",
    },
    outputMessages: {
      planning: "exploring the site and planning attacks...",
      happyPath: "planning happy-path walkthroughs...",
      breaking: "thinking of ways to break this...",
      edgeCases: "finding edge cases and boundary conditions...",
      accessibility: "deep accessibility analysis...",
    },
  },
  hacky: {
    stepNames: [
      "Scan project structure",
      "Load project context & notes",
      "Reconnaissance & attack planning",
      "First impression & screenshots",
      "Compare with baselines",
      "Probe the obvious flows",
      "Try to bypass and tamper",
      "Poke routes, params & boundaries",
      "Accessibility & keyboard-only",
      "Generate report",
    ],
    phaseMessages: {
      planning: "Mapping the surface like a hostile browser user...",
      happyPath: "Probing the obvious flows...",
      breaking: "Trying to bypass and tamper...",
      edgeCases: "Poking routes, params, and edge cases...",
      accessibility: "Checking if rough UX hides exploitable cracks...",
    },
    outputMessages: {
      planning: "mapping routes, forms, and weak spots...",
      happyPath: "probing the obvious flows for cracks...",
      breaking: "trying bypasses, tampering, and unsafe navigation...",
      edgeCases: "pushing params, routes, and edge conditions...",
      accessibility: "checking whether rough UX hides risky behavior...",
    },
  },
  "old-man": {
    stepNames: [
      "Scan project structure",
      "Load project context & notes",
      "First-time user orientation",
      "First impression & screenshots",
      "Compare with baselines",
      "Try the obvious tasks slowly",
      "Get confused and recover",
      "Misread labels & navigation",
      "Accessibility & readability",
      "Generate report",
    ],
    phaseMessages: {
      planning: "Approaching the site like a hesitant first-time user...",
      happyPath: "Trying the obvious tasks slowly...",
      breaking: "Getting confused and trying to recover...",
      edgeCases: "Misreading labels, navigation, and wording...",
      accessibility: "Checking readability and comfort for a low-tech user...",
    },
    outputMessages: {
      planning: "looking around carefully and trying to understand the site...",
      happyPath: "trying the obvious tasks one slow step at a time...",
      breaking: "getting confused, hesitating, and seeing what goes wrong...",
      edgeCases: "misreading labels and testing what feels unclear...",
      accessibility: "checking readability, clarity, and comfort...",
    },
  },
};

function buildSystemPrompt(persona: TestPersona): string {
  return `${BASE_SYSTEM_PROMPT}

${PERSONA_PROMPT_APPENDIX[persona]}`;
}

function getPersonaProfile(persona: TestPersona): PersonaProfile {
  return PERSONA_PROFILES[persona];
}

// ─── Prompt builders ───────────────────────────────────────

function buildReconPrompt(context: TestContext, projectInfo: string, notes: string, pageMap: string): string {
  return `I need you to plan a thorough test session for this website. You're sitting down at your desk, opening this site for the first time, and your job is to find everything that's broken or could break.

URL: ${context.url ?? "not provided"}
Device: ${context.deviceProfile}
Persona: ${getPersonaLabel(context.persona)}
Scope: ${context.scope ?? "full — test everything you can find"}
${context.commitId ? `Changes since commit: ${context.commitId}` : ""}
${context.prId ? `Testing PR #${context.prId}` : ""}

Project info:
${projectInfo}

${notes ? `Previous tester notes:\n${notes}` : ""}

${pageMap ? `I already crawled the site and found these pages, links, and forms:\n${pageMap}` : ""}

Persona guidance:
${getPersonaPromptGuidance(context.persona, "recon")}

Create a test plan that covers:
1. **Happy paths** — the main flows a real user would follow. Navigate, click, fill forms, complete actions.
2. **Abuse scenarios** — what happens when you enter SQL injection strings, XSS payloads, emoji floods, 10000-character strings, special characters, or just leave everything blank?
3. **Boundary testing** — max lengths, zero values, negative numbers, dates in the past/future, uploading wrong file types
4. **Error recovery** — submit with bad data, hit back, refresh mid-action, navigate to /does-not-exist, mess with URL params
5. **Race conditions** — double-click submit, rapid tab between fields, submit while still typing

Return the plan as a JSON array of interaction scenarios.`;
}

function buildHappyPathPrompt(context: TestContext, testPlan: string, pageMap: string): string {
  return `Based on your test plan, generate the happy-path interaction scenarios — the core flows a real user would complete.

URL: ${context.url}
Device: ${context.deviceProfile}
Persona: ${getPersonaLabel(context.persona)}

${pageMap ? `Site map:\n${pageMap}\n` : ""}

Your earlier test plan:
${testPlan.slice(0, 3000)}

Persona guidance:
${getPersonaPromptGuidance(context.persona, "happy")}

For each flow, generate step-by-step Playwright-compatible actions. Think like a user:
- Navigate to the page
- Look around (take a screenshot)
- Click what looks clickable
- Fill forms with realistic data
- Submit and check what happens
- Take a screenshot of the result

Return as a JSON array of interaction scenarios. Each scenario should have 3-10 actions. Use CSS selectors that Playwright can find (prefer visible text, roles, placeholders over IDs).`;
}

function buildBreakItPrompt(context: TestContext, testPlan: string, pageMap: string): string {
  const persona = context.persona ?? "standard";
  if (persona === "old-man") {
    return `Now simulate what happens when an older, low-tech user gets confused, hesitant, or uncertain.

URL: ${context.url}
Device: ${context.deviceProfile}
Persona: ${getPersonaLabel(context.persona)}

${pageMap ? `Site map (forms, inputs, buttons found):\n${pageMap}\n` : ""}

Generate confusion and recovery scenarios like these:

- Click the most obvious button even if it is not the right next step
- Read labels too literally and choose the wrong path
- Start filling a form, stop halfway, go back, and try to recover
- Miss secondary actions because they are too subtle
- Fail to notice success state and try the same action again
- Get nervous after warnings or unfamiliar wording
- Misunderstand icons, abbreviations, and technical terms
- Assume the app is broken when feedback is delayed or unclear
- Use browser back/forward because there is no obvious in-app path
- Give up when the next step is not visually obvious

Return as a JSON array of interaction scenarios. Focus on confusion, clarity, trust, and recovery rather than hostile abuse.`;
  }

  if (persona === "hacky") {
    return `Now it's time to probe this site like a hostile but unprivileged browser user. Be creative, persistent, and suspicious.

URL: ${context.url}
Device: ${context.deviceProfile}
Persona: ${getPersonaLabel(context.persona)}

${pageMap ? `Site map (forms, inputs, buttons found):\n${pageMap}\n` : ""}

Generate adversarial interaction scenarios. Here's what I want you to try:

**Route and permission probing:**
- Navigate to admin-, staff-, settings-, billing-, export-, and debug-looking URLs
- Modify IDs in the URL to access neighboring records
- Remove required URL params and swap in nonsense values
- Add \`?debug=true\`, \`?role=admin\`, \`?view=all\`, \`?tab=internal\`
- Try deep links that bypass the normal navigation order

**Input tampering:**
- Submit every form empty, malformed, oversized, and duplicated
- Use suspicious payloads, weird unicode, absurd lengths, broken dates, and wrong types
- Repeat destructive-looking actions twice to see if protections fail

**State abuse:**
- Refresh mid-action, go back, go forward, resubmit, or reopen pages from browser history
- Trigger the same action from multiple obvious UI paths
- Look for stale state, leaked data, or actions that succeed after the UI says they failed

**Browser-only attack surface:**
- Probe hidden links, obvious API-like routes, exported files, and anything that looks internal
- Check whether the app reveals too much through error messages, disabled controls, or missing empty-state guards

Return as a JSON array of interaction scenarios. 5-15 scenarios, each with 3-8 actions. Focus on what a normal browser user should not be able to reach or infer.`;
  }

  return `Now it's time to try to break this site. You're a QA tester whose bonus depends on finding bugs. Be creative, be mean, be thorough.

URL: ${context.url}
Device: ${context.deviceProfile}
Persona: ${getPersonaLabel(context.persona)}

${pageMap ? `Site map (forms, inputs, buttons found):\n${pageMap}\n` : ""}

Persona guidance:
${getPersonaPromptGuidance(context.persona, "breaking")}

Generate adversarial interaction scenarios. Here's what I want you to try:

**Input abuse:**
- Submit every form you find completely empty
- Fill text fields with: \`<script>alert('xss')</script>\`
- Fill text fields with: \`'; DROP TABLE users; --\`
- Fill email fields with: \`not-an-email\`, \`@@@\`, \`a@b\`
- Fill number fields with: \`-1\`, \`0\`, \`99999999\`, \`NaN\`, \`1.1.1\`
- Fill phone fields with: \`abc\`, \`+0000000\`, emojis
- Paste a 10,000 character string into short text inputs
- Fill date fields with: \`2099-12-31\`, \`1900-01-01\`, \`0000-00-00\`

**Navigation abuse:**
- Navigate to \`${context.url}/admin\`, \`${context.url}/api\`, \`${context.url}/../etc/passwd\`
- Add \`?debug=true\`, \`?role=admin\` to URLs
- Navigate to a page, hit back, hit forward, refresh
- Open a form, fill half of it, navigate away, come back

**Interaction abuse:**
- Double-click every submit button
- Click disabled-looking buttons
- Press Enter in every input field
- Press Escape during modals/overlays
- Tab through the entire page and press Enter on focused elements
- Right-click interactive elements
- Scroll to the very bottom immediately, then scroll back up

**State abuse:**
- Refresh the page mid-form-submission
- Clear cookies/localStorage conceptually (navigate with ?nocache)
- Try the same action twice (double-submit, double-add-to-cart)

Return as a JSON array of interaction scenarios. 5-15 scenarios, each with 3-8 actions. Focus on things most likely to expose real bugs.`;
}

function buildEdgeCasePrompt(context: TestContext, testPlan: string, pageMap: string): string {
  if ((context.persona ?? "standard") === "old-man") {
    return `Now think about clarity, confidence, and comprehension edge cases for an older low-tech user.

URL: ${context.url}
Device: ${context.deviceProfile}
Persona: ${getPersonaLabel(context.persona ?? "old-man")}

${pageMap ? `Site map:\n${pageMap}\n` : ""}

Generate scenarios for:

**Comprehension edge cases:**
- Buttons whose labels are vague, similar, or too technical
- Icons with no text labels
- Error messages that do not explain what to do next
- Success states that are too subtle to notice
- Long forms where it is unclear what is required

**Navigation edge cases:**
- No obvious next step from the current page
- Multiple competing calls to action
- Browser back/forward creating confusion
- Modals, drawers, or menus that close unexpectedly

**Confidence edge cases:**
- Slow responses that make the user think nothing happened
- Destructive-looking actions with weak confirmation
- Tiny text, low contrast, or cramped layouts that make reading difficult
- Jargon, abbreviations, and internal vocabulary that a normal older person would not understand

Return as a JSON array of interaction scenarios. Focus on confusion, readability, trust, and recovery.`;
  }

  return `Now think about edge cases and boundary conditions. The subtle stuff that slips through code review.

URL: ${context.url}
Device: ${context.deviceProfile}
Persona: ${getPersonaLabel(context.persona)}

${pageMap ? `Site map:\n${pageMap}\n` : ""}

Persona guidance:
${getPersonaPromptGuidance(context.persona, "edge")}

Generate scenarios for:

**Responsive edge cases:**
- How does the site look at exactly 768px? At 320px? At 2560px?
- What happens to long text that doesn't fit?
- Do images scale or overflow?
- Are touch targets big enough on mobile?

**Content edge cases:**
- What if there are zero items/results?
- What if there are 1000 items?
- What about very long names, titles, or descriptions?
- Unicode characters: Chinese, Arabic, emoji sequences (👨‍👩‍👧‍👦), RTL text (مرحبا)

**Timing edge cases:**
- Click a link before the page fully loads
- Type faster than autocomplete can respond
- Submit while an animation is still playing

**URL/routing edge cases:**
- Remove a required URL param
- Use an ID that doesn't exist (\`/item/99999999\`)
- Use a negative ID (\`/item/-1\`)
- Use a string where a number is expected (\`/item/abc\`)
- Trailing slashes vs no trailing slashes
- Hash fragments that don't match anything

Return as a JSON array of interaction scenarios. 5-10 scenarios, 3-8 actions each.`;
}

function buildAccessibilityPrompt(context: TestContext, pageMap: string): string {
  return `Test this site's accessibility as if you personally depend on assistive technology.

URL: ${context.url}
Device: ${context.deviceProfile}
Persona: ${getPersonaLabel(context.persona)}

${pageMap ? `Site map:\n${pageMap}\n` : ""}

Persona guidance:
${getPersonaPromptGuidance(context.persona, "accessibility")}

Check these things that real users with disabilities encounter:

1. **Keyboard navigation** — Can I complete every flow without a mouse? Are there keyboard traps? Is focus visible?
2. **Screen reader** — Do images have alt text? Are form labels associated? Are dynamic changes announced?
3. **Visual** — Is contrast ratio at least 4.5:1 for text? Can I zoom to 200% without breaking layout? Are colors the only way information is conveyed?
4. **Motor** — Are click/touch targets at least 44x44px? Are there hover-only interactions with no alternative?
5. **Cognitive** — Are error messages clear? Is language simple? Are timeouts reasonable?

Don't give generic advice. Look at what's actually on this site and report specific failures.

Return findings as a JSON array with severity, category "accessibility", and specific steps to reproduce.`;
}

function getPersonaLabel(persona: TestPersona | undefined): string {
  switch (persona ?? "standard") {
    case "hacky": return "Hacky Testing";
    case "old-man": return "Old Man Test";
    default: return "Standard Testing";
  }
}

function getPersonaPromptGuidance(
  persona: TestPersona | undefined,
  stage: "recon" | "happy" | "breaking" | "edge" | "accessibility",
): string {
  switch (persona ?? "standard") {
    case "hacky":
      if (stage === "happy") {
        return `Treat "happy path" as "obvious path a real attacker or curious user would try first." Prefer flows that reveal permissions, account boundaries, hidden state, destructive actions, and route protection gaps.`;
      }
      if (stage === "breaking") {
        return `Prioritize auth bypass by navigation, route tampering, query/hash manipulation, ID enumeration, role leakage, insecure direct object references, repeated destructive actions, and anything that should be guarded but is reachable in a browser.`;
      }
      if (stage === "edge") {
        return `Focus on route boundaries, malformed params, odd URL states, empty states that expose data, and flows that break when a normal user pushes the browser in slightly hostile ways.`;
      }
      if (stage === "accessibility") {
        return `Keep the accessibility check practical: highlight confusing or inaccessible UI that also increases the risk of mistaken actions, hidden warnings, or unsafe destructive behavior.`;
      }
      return `Think like a hostile but unprivileged browser user. The goal is to find holes, exposed surfaces, and broken assumptions without leaving normal web navigation and form interaction.`;
    case "old-man":
      if (stage === "happy") {
        return `Pick the most obvious flows and move through them slowly. Favor the biggest buttons, the plainest wording, and common expectations. Note every place where the user has to stop and think.`;
      }
      if (stage === "breaking") {
        return `Generate confusion scenarios rather than technical abuse: wrong button clicks, misunderstood labels, mistaken back navigation, fear after an unclear warning, uncertainty about whether an action worked, and giving up when the app feels intimidating.`;
      }
      if (stage === "edge") {
        return `Focus on wording, navigation, icon-only controls, hidden assumptions, unfamiliar jargon, unclear empty states, and moments where an older low-tech user would think "I don't know what this means."`;
      }
      if (stage === "accessibility") {
        return `Emphasize readability, contrast, text size, cognitive load, predictable navigation, obvious confirmation states, and whether this person can trust what they just did.`;
      }
      return `Simulate a sincere older person who is not comfortable with technology. They want to succeed, but they are literal, patient, confused by jargon, and easily thrown off by ambiguous UI.`;
    default:
      return `Use the normal skeptical QA mindset: balanced coverage of obvious flows, realistic mistakes, abuse cases, and edge conditions.`;
  }
}

// ─── Site crawler — discover what's on the page ────────────
async function crawlSiteMap(url: string, out: (text: string) => void, showBrowser: boolean): Promise<string> {
  try {
    const { chromium } = await import("playwright");
    const browser = await chromium.launch(getBrowserSession(showBrowser).launchOptions);
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle", timeout: 30_000 });

    const siteInfo = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll("a[href]"))
        .map((a) => ({ text: a.textContent?.trim().slice(0, 50), href: (a as HTMLAnchorElement).href }))
        .filter((l) => l.text && l.href && !l.href.startsWith("javascript:"))
        .slice(0, 50);

      const forms = Array.from(document.querySelectorAll("form")).map((form) => {
        const inputs = Array.from(form.querySelectorAll("input, textarea, select")).map((el) => ({
          tag: el.tagName.toLowerCase(),
          type: (el as HTMLInputElement).type || "text",
          name: (el as HTMLInputElement).name || (el as HTMLInputElement).placeholder || "",
          required: (el as HTMLInputElement).required,
          placeholder: (el as HTMLInputElement).placeholder || "",
        }));
        const buttons = Array.from(form.querySelectorAll("button, input[type=submit]"))
          .map((b) => b.textContent?.trim() || (b as HTMLInputElement).value || "Submit");
        return { action: form.action, method: form.method, inputs, buttons };
      });

      const buttons = Array.from(document.querySelectorAll("button:not(form button)"))
        .map((b) => ({ text: b.textContent?.trim().slice(0, 50), disabled: (b as HTMLButtonElement).disabled }))
        .filter((b) => b.text)
        .slice(0, 30);

      const inputs = Array.from(document.querySelectorAll("input:not(form input), textarea:not(form textarea)"))
        .map((el) => ({
          type: (el as HTMLInputElement).type || "text",
          name: (el as HTMLInputElement).name || (el as HTMLInputElement).placeholder || "",
          placeholder: (el as HTMLInputElement).placeholder || "",
        }))
        .slice(0, 20);

      const headings = Array.from(document.querySelectorAll("h1, h2, h3"))
        .map((h) => ({ level: h.tagName, text: h.textContent?.trim().slice(0, 80) }))
        .slice(0, 20);

      const images = Array.from(document.querySelectorAll("img"))
        .map((img) => ({ src: (img as HTMLImageElement).src?.slice(0, 80), alt: (img as HTMLImageElement).alt }))
        .slice(0, 20);

      return { title: document.title, links, forms, buttons, inputs, headings, images };
    });

    await browser.close();

    const lines: string[] = [];
    lines.push(`Page title: ${siteInfo.title}`);

    if (siteInfo.headings.length > 0) {
      lines.push(`\nHeadings:`);
      for (const h of siteInfo.headings) lines.push(`  ${h.level}: ${h.text}`);
    }

    if (siteInfo.links.length > 0) {
      lines.push(`\nLinks (${siteInfo.links.length}):`);
      for (const l of siteInfo.links) lines.push(`  "${l.text}" -> ${l.href}`);
    }

    if (siteInfo.forms.length > 0) {
      lines.push(`\nForms (${siteInfo.forms.length}):`);
      for (const f of siteInfo.forms) {
        lines.push(`  Form: ${f.method.toUpperCase()} ${f.action}`);
        for (const inp of f.inputs) {
          lines.push(`    <${inp.tag} type="${inp.type}" name="${inp.name}" ${inp.required ? "REQUIRED" : ""} placeholder="${inp.placeholder}">`);
        }
        lines.push(`    Buttons: ${f.buttons.join(", ")}`);
      }
    }

    if (siteInfo.buttons.length > 0) {
      lines.push(`\nStandalone buttons (${siteInfo.buttons.length}):`);
      for (const b of siteInfo.buttons) lines.push(`  [${b.disabled ? "DISABLED" : "active"}] "${b.text}"`);
    }

    if (siteInfo.inputs.length > 0) {
      lines.push(`\nStandalone inputs (${siteInfo.inputs.length}):`);
      for (const inp of siteInfo.inputs) lines.push(`  <input type="${inp.type}" placeholder="${inp.placeholder}">`);
    }

    if (siteInfo.images.length > 0) {
      const noAlt = siteInfo.images.filter((i) => !i.alt);
      lines.push(`\nImages: ${siteInfo.images.length} total, ${noAlt.length} missing alt text`);
    }

    const result = lines.join("\n");
    out(`  Found: ${siteInfo.links.length} links, ${siteInfo.forms.length} forms, ${siteInfo.buttons.length} buttons\n`);
    return result;
  } catch (err) {
    out(`  ! Crawl failed: ${String(err).slice(0, 80)}\n`);
    return "";
  }
}

// ─── Execute interaction scenarios via Playwright ──────────
async function executeScenarios(
  scenarios: InteractionScenario[],
  context: TestContext,
  settings: GetwiredSettings,
  out: (text: string) => void,
): Promise<TestFinding[]> {
  const findings: TestFinding[] = [];

  try {
    const { chromium } = await import("playwright");
    const browser = await chromium.launch(getBrowserSession(settings.testing.showBrowser).launchOptions);

    for (const scenario of scenarios) {
      out(`\n  ── ${scenario.category}: ${scenario.name} ──\n`);
      const page = await browser.newPage({
        viewport: settings.testing.viewports.desktop,
      });
      const consoleErrors: string[] = [];
      const networkErrors: string[] = [];

      page.on("console", (msg) => {
        if (msg.type() === "error") consoleErrors.push(msg.text());
      });
      page.on("pageerror", (err) => {
        consoleErrors.push(err.message);
      });
      page.on("response", (res) => {
        if (res.status() >= 500) {
          networkErrors.push(`${res.status()} ${res.url()}`);
        }
      });

      let currentUrl = context.url ?? "";
      let stepFailed = false;

      for (const action of scenario.actions) {
        if (stepFailed) break;
        out(`    ${action.description}\n`);

        try {
          switch (action.type) {
            case "navigate": {
              const target = action.url ?? action.value ?? context.url ?? "";
              // Resolve relative URLs
              const resolvedUrl = target.startsWith("http") ? target : new URL(target, currentUrl).href;
              await page.goto(resolvedUrl, { waitUntil: "domcontentloaded", timeout: 15_000 });
              currentUrl = page.url();
              break;
            }
            case "click": {
              if (action.selector) {
                const el = page.locator(action.selector).first();
                await el.click({ timeout: 5_000 }).catch(async () => {
                  // Try by text content as fallback
                  if (action.value) {
                    await page.getByText(action.value, { exact: false }).first().click({ timeout: 5_000 });
                  }
                });
              }
              break;
            }
            case "fill": {
              if (action.selector) {
                const selector = action.selector;
                const el = page.locator(selector).first();
                await el.fill(action.value ?? "", { timeout: 5_000 }).catch(async () => {
                  // Try by placeholder as fallback
                  if (action.value !== undefined) {
                    const byPlaceholder = page.getByPlaceholder(selector.replace(/[[\]"']/g, "")).first();
                    await byPlaceholder.fill(action.value, { timeout: 3_000 });
                  }
                });
              }
              break;
            }
            case "select": {
              if (action.selector && action.value) {
                await page.locator(action.selector).first().selectOption(action.value, { timeout: 5_000 });
              }
              break;
            }
            case "keyboard": {
              if (action.key) {
                await page.keyboard.press(action.key);
              }
              break;
            }
            case "scroll": {
              const distance = parseInt(action.value ?? "500", 10);
              await page.evaluate((d) => window.scrollBy(0, d), distance);
              break;
            }
            case "wait": {
              const ms = parseInt(action.value ?? "1000", 10);
              await page.waitForTimeout(Math.min(ms, 5000));
              break;
            }
            case "screenshot": {
              const screenshotPath = join(
                context.reportDir, "screenshots",
                `${scenario.name.replace(/[^a-zA-Z0-9]/g, "-").slice(0, 40)}-${Date.now()}.png`,
              );
              await mkdir(join(context.reportDir, "screenshots"), { recursive: true });
              await page.screenshot({ path: screenshotPath, fullPage: false });
              out(`      [screenshot saved: ${toProjectRelativePath(context.projectPath, screenshotPath)}]\n`);
              break;
            }
            case "assert": {
              // Check if something expected is visible or absent
              if (action.selector) {
                const visible = await page.locator(action.selector).first().isVisible({ timeout: 3_000 }).catch(() => false);
                if (!visible && action.value === "visible") {
                  findings.push({
                    id: `assert-${generateId()}`,
                    severity: "medium",
                    category: "functional",
                    title: `Expected element not visible: ${action.selector}`,
                    description: `During "${scenario.name}": ${action.description}`,
                    url: page.url(),
                    steps: scenario.actions.map((a) => a.description),
                  });
                }
              }
              break;
            }
          }
        } catch (err) {
          const errMsg = String(err).slice(0, 150);
          out(`      ! Action failed: ${errMsg}\n`);

          // A failed action during an abuse/edge-case test isn't necessarily a bug —
          // if the site properly blocks it, that's good. But if it's a crash or
          // unhandled error, it's a finding.
          if (scenario.category === "happy-path") {
            findings.push({
              id: `scenario-${generateId()}`,
              severity: "high",
              category: "functional",
              title: `Happy path broken: ${action.description}`,
              description: `During "${scenario.name}": ${errMsg}`,
              url: page.url(),
              device: "desktop",
              steps: scenario.actions.map((a) => a.description),
            });
            stepFailed = true;
          }
        }
      }

      // Check if any console errors or 500s happened during this scenario
      if (consoleErrors.length > 0) {
        findings.push({
          id: `console-${generateId()}`,
          severity: scenario.category === "abuse" ? "medium" : "high",
          category: "console-error",
          title: `Console errors during: ${scenario.name}`,
          description: consoleErrors.slice(0, 5).join("\n"),
          url: page.url(),
          steps: scenario.actions.map((a) => a.description),
        });
        out(`      ! ${consoleErrors.length} console error(s)\n`);
      }

      if (networkErrors.length > 0) {
        findings.push({
          id: `network-${generateId()}`,
          severity: "high",
          category: "functional",
          title: `Server errors (5xx) during: ${scenario.name}`,
          description: networkErrors.join("\n"),
          url: page.url(),
          steps: scenario.actions.map((a) => a.description),
        });
        out(`      ! ${networkErrors.length} server error(s)\n`);
      }

      // Take a final screenshot of the state after this scenario
      try {
        const finalPath = join(
          context.reportDir, "screenshots",
          `${scenario.category}-${scenario.name.replace(/[^a-zA-Z0-9]/g, "-").slice(0, 30)}-final.png`,
        );
        await mkdir(join(context.reportDir, "screenshots"), { recursive: true });
        await page.screenshot({ path: finalPath, fullPage: false });
      } catch { /* page may have navigated away */ }

      await page.close();
    }

    await browser.close();
  } catch (err) {
    out(`\n! Browser execution failed: ${String(err).slice(0, 120)}\n`);
  }

  return findings;
}

// ─── Real accessibility testing via Playwright ─────────────
async function testAccessibility(
  context: TestContext,
  settings: GetwiredSettings,
  out: (text: string) => void,
): Promise<TestFinding[]> {
  const findings: TestFinding[] = [];
  if (!context.url) return findings;

  try {
    const { chromium } = await import("playwright");
    const browser = await chromium.launch(getBrowserSession(settings.testing.showBrowser).launchOptions);
    const page = await browser.newPage({ viewport: settings.testing.viewports.desktop });
    await page.goto(context.url, { waitUntil: "networkidle", timeout: 30_000 });

    // Tab through the entire page and check focus visibility
    out(`  Tabbing through the page...\n`);
    let tabCount = 0;
    let focusTraps = 0;
    let invisibleFocus = 0;
    const seenElements = new Set<string>();

    for (let i = 0; i < 50; i++) {
      await page.keyboard.press("Tab");
      tabCount++;

      const focusInfo = await page.evaluate(() => {
        const el = document.activeElement;
        if (!el || el === document.body) return null;

        const rect = el.getBoundingClientRect();
        const styles = window.getComputedStyle(el);
        const outlineVisible = styles.outline !== "none" && styles.outline !== "" && styles.outlineWidth !== "0px";
        const boxShadowVisible = styles.boxShadow !== "none" && styles.boxShadow !== "";
        const bgChanged = styles.backgroundColor !== "rgba(0, 0, 0, 0)";

        return {
          tag: el.tagName,
          text: el.textContent?.trim().slice(0, 30) ?? "",
          visible: rect.width > 0 && rect.height > 0,
          focusIndicatorVisible: outlineVisible || boxShadowVisible || bgChanged,
          role: el.getAttribute("role"),
          ariaLabel: el.getAttribute("aria-label"),
        };
      });

      if (!focusInfo) continue;

      const key = `${focusInfo.tag}-${focusInfo.text}`;
      if (seenElements.has(key)) {
        focusTraps++;
        if (focusTraps > 3) {
          out(`    ! Focus trap detected — stuck in a loop\n`);
          findings.push({
            id: `a11y-focus-trap`,
            severity: "high",
            category: "accessibility",
            title: "Keyboard focus trap detected",
            description: `Tab key gets stuck cycling between the same elements, preventing keyboard users from navigating the full page.`,
            url: context.url,
          });
          break;
        }
      }
      seenElements.add(key);

      if (!focusInfo.focusIndicatorVisible) {
        invisibleFocus++;
      }
    }

    if (invisibleFocus > 3) {
      out(`    ! ${invisibleFocus} elements with invisible focus indicator\n`);
      findings.push({
        id: `a11y-focus-invisible`,
        severity: "medium",
        category: "accessibility",
        title: `${invisibleFocus} interactive elements have no visible focus indicator`,
        description: `Keyboard users can't see where they are on the page. ${invisibleFocus} elements received focus but had no visible outline, box-shadow, or background change.`,
        url: context.url,
      });
    }

    out(`  Tabbed through ${tabCount} elements, ${seenElements.size} unique\n`);

    // Check images for alt text
    const imgIssues = await page.evaluate(() => {
      return Array.from(document.querySelectorAll("img"))
        .filter((img) => !img.alt && img.getBoundingClientRect().width > 1)
        .map((img) => (img as HTMLImageElement).src?.slice(0, 80))
        .slice(0, 10);
    });

    if (imgIssues.length > 0) {
      out(`    ! ${imgIssues.length} images missing alt text\n`);
      findings.push({
        id: `a11y-alt-text`,
        severity: "medium",
        category: "accessibility",
        title: `${imgIssues.length} images missing alt text`,
        description: `Screen reader users won't know what these images show:\n${imgIssues.join("\n")}`,
        url: context.url,
      });
    }

    // Check for form labels
    const unlabeledInputs = await page.evaluate(() => {
      return Array.from(document.querySelectorAll("input, textarea, select"))
        .filter((el) => {
          const id = el.id;
          const hasLabel = id && document.querySelector(`label[for="${id}"]`);
          const hasAriaLabel = el.getAttribute("aria-label");
          const hasAriaLabelledBy = el.getAttribute("aria-labelledby");
          const wrappedInLabel = el.closest("label");
          const hasPlaceholder = (el as HTMLInputElement).placeholder;
          return !hasLabel && !hasAriaLabel && !hasAriaLabelledBy && !wrappedInLabel && !hasPlaceholder;
        })
        .map((el) => `<${el.tagName.toLowerCase()} type="${(el as HTMLInputElement).type}" name="${(el as HTMLInputElement).name}">`)
        .slice(0, 10);
    });

    if (unlabeledInputs.length > 0) {
      out(`    ! ${unlabeledInputs.length} form inputs with no label\n`);
      findings.push({
        id: `a11y-labels`,
        severity: "medium",
        category: "accessibility",
        title: `${unlabeledInputs.length} form inputs without accessible labels`,
        description: `These inputs have no label, aria-label, or placeholder:\n${unlabeledInputs.join("\n")}`,
        url: context.url,
      });
    }

    // Check touch target sizes (mobile)
    if (context.deviceProfile !== "desktop") {
      const smallTargets = await page.evaluate(() => {
        const interactive = document.querySelectorAll("a, button, input, select, textarea, [role=button], [tabindex]");
        return Array.from(interactive)
          .filter((el) => {
            const rect = el.getBoundingClientRect();
            return rect.width > 0 && rect.height > 0 && (rect.width < 44 || rect.height < 44);
          })
          .map((el) => ({
            tag: el.tagName,
            text: el.textContent?.trim().slice(0, 30),
            width: Math.round(el.getBoundingClientRect().width),
            height: Math.round(el.getBoundingClientRect().height),
          }))
          .slice(0, 10);
      });

      if (smallTargets.length > 0) {
        out(`    ! ${smallTargets.length} touch targets smaller than 44px\n`);
        findings.push({
          id: `a11y-touch-targets`,
          severity: "medium",
          category: "accessibility",
          title: `${smallTargets.length} touch targets too small for mobile`,
          description: `These elements are smaller than the 44x44px minimum:\n${smallTargets.map((t) => `${t.tag} "${t.text}" (${t.width}x${t.height}px)`).join("\n")}`,
          url: context.url,
          device: "mobile",
        });
      }
    }

    await browser.close();
  } catch (err) {
    out(`  ! Accessibility test failed: ${String(err).slice(0, 80)}\n`);
  }

  return findings;
}

// ─── Helpers ───────────────────────────────────────────────

async function scanProject(projectPath: string, context: TestContext): Promise<string> {
  const info: string[] = [];

  const pkgPath = join(projectPath, "package.json");
  if (existsSync(pkgPath)) {
    const pkg = JSON.parse(await readFile(pkgPath, "utf-8"));
    info.push(`Project: ${pkg.name ?? "unknown"}`);
    info.push(`Dependencies: ${Object.keys(pkg.dependencies ?? {}).join(", ")}`);
    info.push(`Dev deps: ${Object.keys(pkg.devDependencies ?? {}).join(", ")}`);
  }

  const frameworkFiles = [
    "next.config.js", "next.config.ts", "next.config.mjs",
    "vite.config.ts", "nuxt.config.ts", "svelte.config.js",
    "angular.json", "astro.config.mjs",
  ];
  for (const f of frameworkFiles) {
    if (existsSync(join(projectPath, f))) {
      info.push(`Framework config: ${f}`);
    }
  }

  if (context.commitId) {
    try {
      const diff = execSync(`git diff ${context.commitId}...HEAD --stat`, {
        cwd: projectPath, encoding: "utf-8",
      });
      info.push(`Changes since ${context.commitId}:\n${diff}`);
    } catch { /* not a git repo or invalid commit */ }
  }

  if (context.prId) {
    try {
      const prInfo = execSync(`gh pr view ${context.prId} --json title,body,files`, {
        cwd: projectPath, encoding: "utf-8",
      });
      info.push(`PR #${context.prId}:\n${prInfo}`);
    } catch { /* gh not available */ }
  }

  return info.join("\n");
}

async function loadProjectNotes(projectPath: string): Promise<string> {
  const notesDir = getNotesDir(projectPath);
  if (!existsSync(notesDir)) return "";

  const files = await readdir(notesDir);
  const notes: string[] = [];
  for (const file of files) {
    if (file.endsWith(".md") || file.endsWith(".txt")) {
      const content = await readFile(join(notesDir, file), "utf-8");
      notes.push(content);
    }
  }
  return notes.join("\n\n");
}

async function compareWithBaselines(
  captures: Array<{ path: string; url: string; device: "desktop" | "mobile" }>,
  context: TestContext,
  settings: GetwiredSettings,
  provider: TestingProvider,
  callbacks: OrchestratorCallbacks,
): Promise<TestFinding[]> {
  const findings: TestFinding[] = [];

  for (const capture of captures) {
    const baselineDir = getBaselineDir(context.projectPath);
    if (!existsSync(baselineDir)) continue;

    const baselineFiles = await readdir(baselineDir);
    const matchingBaseline = baselineFiles.find(
      (f) => f.includes(capture.device) && capture.url.includes(f.split("-")[0]),
    );

    if (!matchingBaseline) {
      callbacks.onLog(`No baseline for ${capture.device} ${capture.url} — saving as new baseline`);
      continue;
    }

    const result = await compareScreenshots({
      baselinePath: join(baselineDir, matchingBaseline),
      currentPath: capture.path,
      outputDir: join(context.reportDir, "diffs"),
      threshold: settings.testing.diffThreshold,
    });

    if (result.isRegression) {
      callbacks.onLog(
        `UI change detected: ${(result.diffPercentage * 100).toFixed(1)}% pixels changed on ${capture.device}`,
      );

      const baselineB64 = await imageToBase64(result.baselinePath);
      const currentB64 = await imageToBase64(result.currentPath);
      const diffB64 = await imageToBase64(result.diffPath);

      const aiFindings = await provider.evaluateRegression(
        baselineB64, currentB64, diffB64, capture.url, capture.device,
      );

      findings.push(
        ...aiFindings.map((f) => ({
          ...f,
          screenshotPath: capture.path,
          diffScreenshotPath: result.diffPath,
        })),
      );
    }
  }

  return findings;
}

function parseScenarios(content: string): InteractionScenario[] {
  try {
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (Array.isArray(parsed)) {
        return parsed.filter(
          (s) => s.name && Array.isArray(s.actions) && s.actions.length > 0,
        );
      }
    }
    return [];
  } catch {
    return [];
  }
}

function parseFindings(content: string): TestFinding[] {
  try {
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return [];
  } catch {
    return [];
  }
}

function countPlanSteps(plan: string): number {
  try {
    const parsed = JSON.parse(plan);
    return Array.isArray(parsed) ? parsed.length : 0;
  } catch {
    return plan.split("\n").filter((l) => l.trim().match(/^\d+\./)).length || 1;
  }
}

async function updateStep(
  steps: TestStep[],
  index: number,
  status: TestStep["status"],
  callbacks: OrchestratorCallbacks,
  duration?: number,
  details?: string,
) {
  steps[index].status = status;
  if (duration !== undefined) steps[index].duration = duration;
  if (details !== undefined) steps[index].details = details;
  callbacks.onStepUpdate([...steps]);
}

function toProjectRelativePath(projectPath: string, targetPath: string): string {
  const relativePath = relative(projectPath, targetPath);
  return relativePath && !relativePath.startsWith("..") ? relativePath : targetPath;
}

function generateId(): string {
  return `gw-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

async function saveReport(reportDir: string, report: TestReport): Promise<string> {
  await mkdir(reportDir, { recursive: true });
  const filePath = join(reportDir, `${report.id}.json`);
  await writeFile(filePath, JSON.stringify(report, null, 2));
  return filePath;
}
