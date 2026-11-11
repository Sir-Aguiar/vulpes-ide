"use client";

import { useStoredUserPreferences } from "@/hooks/useStoredUserPreferences";
import { resolveEditorPreferences } from "@/utils/editor-preferences";
import { useMemo } from "react";

export function useEditorPreferences() {
  const stored = useStoredUserPreferences();

  return useMemo(() => resolveEditorPreferences(stored), [stored]);
}
