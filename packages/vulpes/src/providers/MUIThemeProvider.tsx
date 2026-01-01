"use client";

import { COLORS } from "@/utils/colors";
import { ThemeProvider, createTheme } from "@mui/material/styles";

const MaterialUITheme = createTheme({
  typography: {
    fontFamily: "var(--font-inter)",
  },
  palette: {
    primary: {
      main: COLORS.light.primary[500],
      ...COLORS.light.primary,
    },
    secondary: {
      main: COLORS.light.secondary[500],
      ...COLORS.light.secondary,
    },
    text: {
      primary: COLORS.light.text[500],
      ...COLORS.light.text,
    },
    background: {
      default: COLORS.light.background[500],
      ...COLORS.light.background,
    },
    action: {
      hover: COLORS.light.accent[500],
      ...COLORS.light.accent,
    },
  },
});

export default function MUIThemeProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <ThemeProvider theme={MaterialUITheme}>{children}</ThemeProvider>;
}
