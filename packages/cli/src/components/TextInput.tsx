import { useState } from "react";
import { Box, Text, useInput } from "ink";

interface TextInputProps {
  label: string;
  placeholder?: string;
  onSubmit: (value: string) => void;
  onCancel?: () => void;
}

export function TextInput({ label, placeholder, onSubmit, onCancel }: TextInputProps) {
  const [value, setValue] = useState("");

  useInput((input, key) => {
    if (key.return) {
      onSubmit(value);
      return;
    }
    if (key.escape && onCancel) {
      onCancel();
      return;
    }
    if (key.backspace || key.delete) {
      setValue((v) => v.slice(0, -1));
      return;
    }
    if (input && !key.ctrl && !key.meta) {
      setValue((v) => v + input);
    }
  });

  return (
    <Box gap={1}>
      <Text color="greenBright" bold>{label}</Text>
      <Box>
        <Text color="green">
          {value || (placeholder ? <Text dimColor>{placeholder}</Text> : "")}
        </Text>
        <Text color="green" dimColor>█</Text>
      </Box>
    </Box>
  );
}
