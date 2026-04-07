import { useEffect, useRef, useState } from "react";
import { Box, Text, render, useApp, useInput } from "ink";
import { ProviderStream } from "./components/ProviderStream.js";

const INSTRUCTIONS = "Test scroll: ↑↓/jk scroll, u/d page, G bottom";
const TOTAL_DYNAMIC_LINES = 110;
const DELAYS_MS = [220, 260, 300, 340, 240, 280, 320];
const PHASES = [
  "Boot harness",
  "Scan app shell",
  "Inspect auth flow",
  "Exercise search",
  "Validate checkout",
  "Wrap up",
];
const SEED_LINES = [
  "> booting scroll test harness",
  "[tool:harness.setup] Mounting ProviderStream inside split-pane layout",
  "Streaming mock agent output. Scroll up while new lines arrive to verify auto-scroll pauses.",
  "Press Ctrl+C when you are done testing.",
];
const COMMANDS = ["open dashboard", "inspect login form", "follow search flow", "compare checkout summary"];
const TOOLS = ["browser.snapshot", "browser.click", "browser.type", "browser.waitFor", "diff.report"];
const SUBJECTS = ["header", "sidebar", "search results", "cart drawer", "toast banner", "checkout modal"];

function buildLine(index: number): string {
  const lineNumber = SEED_LINES.length + index + 1;
  const phaseIndex = Math.min(PHASES.length - 1, Math.floor((index / TOTAL_DYNAMIC_LINES) * PHASES.length));
  const phase = PHASES[phaseIndex];
  const command = COMMANDS[index % COMMANDS.length];
  const tool = TOOLS[index % TOOLS.length];
  const subject = SUBJECTS[index % SUBJECTS.length];

  switch (index % 7) {
    case 0:
      return `> ${command} (${lineNumber})`;
    case 1:
      return `[tool:${tool}] completed sample ${lineNumber} in ${120 + (index % 5) * 35}ms`;
    case 2:
      return `Observed ${subject} render stable during ${phase.toLowerCase()}.`;
    case 3:
      return `> verify scroll anchor after response chunk ${lineNumber}`;
    case 4:
      return `[tool:${tool}] wrote artifact-${String(lineNumber).padStart(3, "0")}.json`;
    case 5:
      return index % 18 === 5
        ? `! transient timeout while checking ${subject}; retrying automatically`
        : `Continuing ${phase.toLowerCase()} after response chunk ${lineNumber}.`;
    default:
      return `Current phase: ${phase}. Provider output chunk ${lineNumber} appended successfully.`;
  }
}

function ScrollHarnessApp() {
  const { exit } = useApp();
  const [lines, setLines] = useState(SEED_LINES);
  const [generated, setGenerated] = useState(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startedAtRef = useRef(Date.now());

  useInput((input, key) => {
    if (key.ctrl && input === "c") {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      exit();
    }
  });

  useEffect(() => {
    if (generated >= TOTAL_DYNAMIC_LINES) return;

    const delay = DELAYS_MS[generated % DELAYS_MS.length];
    timeoutRef.current = setTimeout(() => {
      setLines((prev) => [...prev, buildLine(generated)]);
      setGenerated((prev) => prev + 1);
    }, delay);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [generated]);

  const isStreaming = generated < TOTAL_DYNAMIC_LINES;
  const elapsedSeconds = Math.floor((Date.now() - startedAtRef.current) / 1000);
  const paneHeight = Math.max(22, (process.stdout.rows ?? 30) - 6);
  const phaseIndex = Math.min(PHASES.length - 1, Math.floor((generated / TOTAL_DYNAMIC_LINES) * PHASES.length));
  const currentPhase = PHASES[phaseIndex];

  return (
    <Box flexDirection="column" paddingX={1}>
      <Text color="cyanBright" bold>{INSTRUCTIONS}</Text>
      <Text color="cyan" dimColor>
        Ctrl+C exit · {lines.length} lines shown · elapsed {elapsedSeconds}s
      </Text>

      <Box flexDirection="row" marginTop={1} width="100%" height={paneHeight}>
        <Box width="50%" flexDirection="column" borderStyle="single" borderColor="yellow" paddingX={1}>
          <Text color="yellowBright" bold>Manual Scroll Harness</Text>
          <Text color="yellow">Status: {isStreaming ? "streaming" : "complete"}</Text>
          <Text color="yellow" dimColor>Phase: {currentPhase}</Text>
          <Text color="yellow" dimColor>Generated: {generated}/{TOTAL_DYNAMIC_LINES} dynamic lines</Text>

          <Box flexDirection="column" marginTop={1}>
            <Text color="yellowBright">Check while streaming</Text>
            <Text color="yellow" dimColor>• scroll up and confirm new output keeps arriving</Text>
            <Text color="yellow" dimColor>• use ↑↓ or j/k for line-by-line movement</Text>
            <Text color="yellow" dimColor>• use u/d for page jumps and G for bottom</Text>
          </Box>

          <Box flexDirection="column" marginTop={1}>
            <Text color="yellowBright">Line legend</Text>
            <Text color="greenBright">&gt; commands</Text>
            <Text color="cyan">[tool:*] tool output</Text>
            <Text color="redBright">! transient errors</Text>
            <Text>plain text narrative</Text>
          </Box>

          <Box flexDirection="column" marginTop={1}>
            <Text color="yellowBright">Mock phases</Text>
            {PHASES.map((phase, index) => (
              <Text key={phase} color={index === phaseIndex ? "yellowBright" : "yellow"} dimColor={index !== phaseIndex}>
                {index === phaseIndex ? "▸" : " "} {phase}
              </Text>
            ))}
          </Box>

          {!isStreaming && (
            <Box marginTop={1}>
              <Text color="greenBright">Stream complete — keep scrolling, then press Ctrl+C.</Text>
            </Box>
          )}
        </Box>

        <Box width="50%" flexGrow={0} flexShrink={0}>
          <ProviderStream
            output={lines.join("\n")}
            providerName="Harness"
            maxLines={Math.max(18, paneHeight - 6)}
            isStreaming={isStreaming}
          />
        </Box>
      </Box>
    </Box>
  );
}

render(<ScrollHarnessApp />);