"use client";

import { useColorMode } from "@/providers/ColorModeProvider";
import { COLORS } from "@/utils/colors";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { useMemo } from "react";

export default function MUIThemeProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isDark } = useColorMode();

  const theme = useMemo(
    () =>
      createTheme({
        typography: {
          fontFamily: "var(--font-inter)",
        },
        palette: {
          mode: isDark ? "dark" : "light",
          primary: {
            main: COLORS.light.primary[500],
            ...COLORS.light.primary,
          },
          secondary: {
            main: COLORS.light.secondary[500],
            ...COLORS.light.secondary,
          },
          ...(isDark
            ? {
                background: {
                  default: "#0a0a0a",
                  paper: "#18181b",
                },
                text: {
                  primary: "rgba(255,255,255,0.92)",
                  secondary: "rgba(255,255,255,0.62)",
                },
              }
            : {
                background: {
                  default: "#f4f6f8",
                  paper: "#ffffff",
                },
                text: {
                  primary: "rgba(15,23,42,0.92)",
                  secondary: "rgba(51,65,85,0.78)",
                },
              }),
        },
      }),
    [isDark],
  );

  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}
