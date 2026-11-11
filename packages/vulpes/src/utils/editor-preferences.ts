import { IUserPreferences } from "@/@dtos/Auth";

export const DEFAULT_EDITOR_THEME = "dark" as const;
export const DEFAULT_EDITOR_FONT_SIZE = 14;
export const DEFAULT_EDITOR_WORD_WRAP = true;

export type StoredEditorTheme = "dark" | "light";
export type MonacoEditorTheme = "portugol-dark" | "portugol-light";

export interface ResolvedEditorPreferences {
  theme: MonacoEditorTheme;
  fontSize: number;
  wordWrap: "on" | "off";
}

/** Valor persistido. Nomes do Monaco e temas antigos viram dark ou light. */
export function normalizeStoredEditorTheme(
  value: string | undefined,
): StoredEditorTheme {
  if (value === "light" || value === "vs" || value === "portugol-light") {
    return "light";
  }

  return "dark";
}

export function monacoThemeForStoredTheme(
  theme: StoredEditorTheme,
): MonacoEditorTheme {
  return theme === "light" ? "portugol-light" : "portugol-dark";
}

export function resolveEditorPreferences(
  preferences: IUserPreferences | undefined,
): ResolvedEditorPreferences {
  const fontSize = preferences?.editorFontSize;
  const storedTheme = normalizeStoredEditorTheme(preferences?.editorTheme);

  return {
    theme: monacoThemeForStoredTheme(storedTheme),
    fontSize:
      typeof fontSize === "number" &&
      Number.isInteger(fontSize) &&
      fontSize >= 8 &&
      fontSize <= 32
        ? fontSize
        : DEFAULT_EDITOR_FONT_SIZE,
    wordWrap:
      typeof preferences?.editorWordWrap === "boolean"
        ? preferences.editorWordWrap
          ? "on"
          : "off"
        : DEFAULT_EDITOR_WORD_WRAP
          ? "on"
          : "off",
  };
}
