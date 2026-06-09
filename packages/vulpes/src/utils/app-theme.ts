export type ThemeMode = "dark" | "light";

export interface AppThemeTokens {
  mode: ThemeMode;
  bg: string;
  bgElevated: string;
  bgCard: string;
  border: string;
  borderStrong: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  brand: string;
  brandDark: string;
  brandGlow: string;
  success: string;
  hover: string;
  navbar: string;
  navbarText: string;
  menuBg: string;
  menuBorder: string;
  menuTextMuted: string;
  contentPanel: string;
  contentPanelText: string;
  contentPanelTextSecondary: string;
  contentPanelBorder: string;
  gridLine: string;
  heroGradient: string;
  codeBg: string;
  maxWidth: number;
}

const SHARED = {
  brand: "#FF6D00",
  brandDark: "#e36c1c",
  success: "#22c55e",
  maxWidth: 1200,
} as const;

const DARK: Omit<AppThemeTokens, "mode"> = {
  ...SHARED,
  bg: "#0a0a0a",
  bgElevated: "#111113",
  bgCard: "#18181b",
  border: "rgba(255,255,255,0.08)",
  borderStrong: "rgba(255,255,255,0.14)",
  text: "rgba(255,255,255,0.92)",
  textSecondary: "rgba(255,255,255,0.62)",
  textMuted: "rgba(255,255,255,0.4)",
  brandGlow: "rgba(255,109,0,0.35)",
  hover: "rgba(255,255,255,0.04)",
  navbar: "rgba(10, 10, 10, 0.9)",
  navbarText: "rgba(255, 255, 255, 0.7)",
  menuBg: "#1E1E1E",
  menuBorder: "rgba(255, 255, 255, 0.08)",
  menuTextMuted: "rgba(255, 255, 255, 0.6)",
  contentPanel: "#18181b",
  contentPanelText: "rgba(255,255,255,0.92)",
  contentPanelTextSecondary: "rgba(255,255,255,0.62)",
  contentPanelBorder: "rgba(255,255,255,0.08)",
  gridLine: "rgba(255,255,255,0.5)",
  heroGradient: `
    radial-gradient(ellipse 80% 60% at 20% 40%, rgba(255,109,0,0.12) 0%, transparent 60%),
    radial-gradient(ellipse 60% 50% at 80% 20%, rgba(255,109,0,0.08) 0%, transparent 55%),
    radial-gradient(ellipse 50% 40% at 60% 80%, rgba(99,102,241,0.06) 0%, transparent 50%)
  `,
  codeBg: "#1e1e1e",
};

const LIGHT: Omit<AppThemeTokens, "mode"> = {
  ...SHARED,
  bg: "#f4f6f8",
  bgElevated: "#ffffff",
  bgCard: "#ffffff",
  border: "rgba(15,23,42,0.08)",
  borderStrong: "rgba(15,23,42,0.14)",
  text: "rgba(15,23,42,0.92)",
  textSecondary: "rgba(51,65,85,0.78)",
  textMuted: "rgba(100,116,139,0.85)",
  brandGlow: "rgba(255,109,0,0.22)",
  hover: "rgba(15,23,42,0.04)",
  navbar: "rgba(255, 255, 255, 0.92)",
  navbarText: "rgba(51, 65, 85, 0.85)",
  menuBg: "#ffffff",
  menuBorder: "rgba(15, 23, 42, 0.08)",
  menuTextMuted: "rgba(100, 116, 139, 0.9)",
  contentPanel: "#ffffff",
  contentPanelText: "#111827",
  contentPanelTextSecondary: "#6b7280",
  contentPanelBorder: "#e5e7eb",
  gridLine: "rgba(15,23,42,0.08)",
  heroGradient: `
    radial-gradient(ellipse 80% 60% at 20% 40%, rgba(255,109,0,0.08) 0%, transparent 60%),
    radial-gradient(ellipse 60% 50% at 80% 20%, rgba(255,109,0,0.05) 0%, transparent 55%),
    radial-gradient(ellipse 50% 40% at 60% 80%, rgba(99,102,241,0.04) 0%, transparent 50%)
  `,
  codeBg: "#1e1e1e",
};

export function getAppTheme(mode: ThemeMode): AppThemeTokens {
  return { mode, ...(mode === "dark" ? DARK : LIGHT) };
}

export const THEME_STORAGE_KEY = "vulpes-theme";

export function readStoredThemeMode(): ThemeMode {
  if (typeof window === "undefined") return "dark";
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return stored === "light" ? "light" : "dark";
  } catch {
    return "dark";
  }
}
