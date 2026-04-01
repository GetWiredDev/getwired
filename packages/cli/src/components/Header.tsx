
import { Box, Text } from "ink";

const LOGO = `
  ██████╗ ███████╗████████╗██╗    ██╗██╗██████╗ ███████╗██████╗
 ██╔════╝ ██╔════╝╚══██╔══╝██║    ██║██║██╔══██╗██╔════╝██╔══██╗
 ██║  ███╗█████╗     ██║   ██║ █╗ ██║██║██████╔╝█████╗  ██║  ██║
 ██║   ██║██╔══╝     ██║   ██║███╗██║██║██╔══██╗██╔══╝  ██║  ██║
 ╚██████╔╝███████╗   ██║   ╚███╔███╔╝██║██║  ██║███████╗██████╔╝
  ╚═════╝ ╚══════╝   ╚═╝    ╚══╝╚══╝ ╚═╝╚═╝  ╚═╝╚══════╝╚═════╝`;

export function Header({ subtitle }: { subtitle?: string }) {
  return (
    <Box flexDirection="column" alignItems="center" marginBottom={1}>
      <Text color="green" bold>
        {LOGO}
      </Text>
      <Text color="greenBright" dimColor>
        {subtitle ?? "Human-Like AI Testing CLI"}
      </Text>
      <Text color="green" dimColor>
        {"─".repeat(62)}
      </Text>
    </Box>
  );
}
