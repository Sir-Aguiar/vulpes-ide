"use client";

import { useEditorPreferences } from "@/hooks/useEditorPreferences";
import { registerPortugolLanguage } from "../../../libs/monaco-config";
import Editor, { type BeforeMount, type EditorProps, type OnMount } from "@monaco-editor/react";
import { useCallback, useEffect, useRef } from "react";

type Monaco = Parameters<OnMount>[1];

export function CodeEditor({
  options,
  onMount,
  beforeMount,
  theme: _ignoredTheme,
  ...props
}: EditorProps) {
  const preferences = useEditorPreferences();
  const monacoRef = useRef<Monaco | null>(null);
  const onMountRef = useRef(onMount);
  const beforeMountRef = useRef(beforeMount);

  onMountRef.current = onMount;
  beforeMountRef.current = beforeMount;

  const handleBeforeMount = useCallback<BeforeMount>((monaco) => {
    registerPortugolLanguage(monaco);
    beforeMountRef.current?.(monaco);
  }, []);

  const handleMount = useCallback<OnMount>((editor, monaco) => {
    monacoRef.current = monaco;
    registerPortugolLanguage(monaco);
    onMountRef.current?.(editor, monaco);
    monaco.editor.setTheme(preferences.theme);
  }, [preferences.theme]);

  useEffect(() => {
    monacoRef.current?.editor.setTheme(preferences.theme);
  }, [preferences.theme]);

  return (
    <Editor
      {...props}
      theme={preferences.theme}
      beforeMount={handleBeforeMount}
      onMount={handleMount}
      options={{
        ...options,
        fontSize: preferences.fontSize,
        wordWrap: preferences.wordWrap,
      }}
    />
  );
}
