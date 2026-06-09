"use client";

import {
  AppThemeTokens,
  getAppTheme,
  readStoredThemeMode,
  THEME_STORAGE_KEY,
  ThemeMode,
} from "@/utils/app-theme";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

interface IColorModeContext {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
  isDark: boolean;
}

const ColorModeContext = createContext<IColorModeContext | undefined>(undefined);

function applyThemeMode(mode: ThemeMode) {
  document.documentElement.setAttribute("data-theme", mode);
  try {
    localStorage.setItem(THEME_STORAGE_KEY, mode);
  } catch {
    // ignore storage errors
  }
}

export function ColorModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>("dark");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = readStoredThemeMode();
    setModeState(stored);
    applyThemeMode(stored);
    setReady(true);
  }, []);

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next);
    applyThemeMode(next);
  }, []);

  const toggleMode = useCallback(() => {
    setModeState((current) => {
      const next: ThemeMode = current === "dark" ? "light" : "dark";
      applyThemeMode(next);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      mode,
      setMode,
      toggleMode,
      isDark: mode === "dark",
    }),
    [mode, setMode, toggleMode],
  );

  if (!ready) {
    return (
      <ColorModeContext.Provider value={value}>{children}</ColorModeContext.Provider>
    );
  }

  return (
    <ColorModeContext.Provider value={value}>{children}</ColorModeContext.Provider>
  );
}

export function useColorMode() {
  const context = useContext(ColorModeContext);
  if (!context) {
    throw new Error("useColorMode must be used within ColorModeProvider");
  }
  return context;
}

export function useAppTheme(): AppThemeTokens {
  const { mode } = useColorMode();
  return useMemo(() => getAppTheme(mode), [mode]);
}
