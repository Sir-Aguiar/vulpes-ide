"use client";

import { Box } from "@mui/material";
import React, { useRef } from "react";

interface CodeInputProps {
  length?: number;
  value: string[];
  onChange: (value: string[]) => void;
  onComplete?: (code: string) => void;
  disabled?: boolean;
}

export default function CodeInput({
  length = 5,
  value,
  onChange,
  onComplete,
  disabled = false,
}: CodeInputProps) {
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  const focusInput = (index: number) => {
    const target = inputsRef.current[index];
    if (target) {
      target.focus();
      target.select();
    }
  };

  const emitChange = (next: string[]) => {
    onChange(next);
    const joined = next.join("");
    if (joined.length === length && !next.includes("")) {
      onComplete?.(joined);
    }
  };

  const handleChange = (index: number, raw: string) => {
    const char = raw.slice(-1).toUpperCase();
    if (raw && !/^[a-zA-Z0-9]$/.test(char)) return;

    const next = [...value];
    next[index] = char;
    emitChange(next);

    if (char && index < length - 1) {
      focusInput(index + 1);
    }
  };

  const handleKeyDown = (
    index: number,
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === "Backspace") {
      event.preventDefault();
      const next = [...value];

      if (next[index]) {
        next[index] = "";
        onChange(next);
        return;
      }

      if (index > 0) {
        next[index - 1] = "";
        onChange(next);
        focusInput(index - 1);
      }
    }

    if (event.key === "ArrowLeft" && index > 0) {
      focusInput(index - 1);
    }

    if (event.key === "ArrowRight" && index < length - 1) {
      focusInput(index + 1);
    }
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pasted = event.clipboardData
      .getData("text")
      .replace(/[^a-zA-Z0-9]/g, "")
      .toUpperCase()
      .slice(0, length);

    if (!pasted) return;

    const next = Array.from({ length }, (_, i) => pasted[i] ?? "");
    emitChange(next);

    const lastFilled = Math.min(pasted.length, length) - 1;
    focusInput(lastFilled < length - 1 ? lastFilled + 1 : length - 1);
  };

  return (
    <Box
      sx={{
        display: "flex",
        gap: 1.5,
        justifyContent: "center",
      }}
    >
      {Array.from({ length }).map((_, index) => (
        <Box
          key={index}
          component="input"
          ref={(el: HTMLInputElement | null) => {
            inputsRef.current[index] = el;
          }}
          type="text"
          inputMode="text"
          maxLength={1}
          autoComplete="one-time-code"
          disabled={disabled}
          value={value[index] ?? ""}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            handleChange(index, e.target.value)
          }
          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
            handleKeyDown(index, e)
          }
          onPaste={handlePaste}
          onFocus={(e: React.FocusEvent<HTMLInputElement>) => e.target.select()}
          sx={{
            width: 56,
            height: 64,
            textAlign: "center",
            fontSize: "1.75rem",
            fontWeight: 600,
            color: "text.primary",
            caretColor: "#FF6D00",
            borderRadius: "12px",
            border: "2px solid",
            borderColor: value[index]
              ? "#FF6D00"
              : "rgba(255, 255, 255, 0.18)",
            backgroundColor: "rgba(255, 255, 255, 0.04)",
            outline: "none",
            transition:
              "border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease",
            "&:hover": {
              borderColor: "rgba(255, 109, 0, 0.6)",
            },
            "&:focus": {
              borderColor: "#FF6D00",
              backgroundColor: "rgba(255, 109, 0, 0.08)",
              boxShadow: "0 0 0 4px rgba(255, 109, 0, 0.18)",
            },
            "&:disabled": {
              opacity: 0.5,
              cursor: "not-allowed",
            },
          }}
        />
      ))}
    </Box>
  );
}
