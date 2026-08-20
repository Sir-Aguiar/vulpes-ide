"use client";

import {
  applyCompileErrorMarkers,
  registerPortugolLanguage,
} from "../../libs/monaco-config";
import { ICompileError } from "@/utils/code-tester";
import { useEffect, useRef } from "react";

export function usePortugolEditor(compileErrors: ICompileError[]) {
  const editorRef = useRef<{ getModel: () => unknown } | null>(null);
  const monacoRef = useRef<
    Parameters<typeof applyCompileErrorMarkers>[0] | null
  >(null);

  function handleEditorDidMount(
    editor: { getModel: () => unknown },
    monacoInstance: any,
  ) {
    registerPortugolLanguage(monacoInstance);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    monacoInstance.editor.setTheme("vs-dark");
    editorRef.current = editor;
    monacoRef.current = monacoInstance;
    applyCompileErrorMarkers(monacoInstance, editor, compileErrors);
  }

  useEffect(() => {
    if (monacoRef.current && editorRef.current) {
      applyCompileErrorMarkers(
        monacoRef.current,
        editorRef.current,
        compileErrors,
      );
    }
  }, [compileErrors]);

  return { handleEditorDidMount };
}
