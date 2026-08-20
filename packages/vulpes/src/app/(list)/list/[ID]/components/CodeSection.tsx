"use client";

import { ExecutionOutput } from "@/components/ide/ExecutionOutput";
import { usePortugolEditor } from "@/hooks/usePortugolEditor";
import { useAppTheme } from "@/providers/ColorModeProvider";
import { ICompileError, ITestCaseResult } from "@/utils/code-tester";
import CodeIcon from "@mui/icons-material/Code";
import TerminalIcon from "@mui/icons-material/Terminal";
import { Editor } from "@monaco-editor/react";
import { Box } from "@mui/material";
import { useState } from "react";
import CheckIcon from "../../../../../../public/icons/CheckIcon";
import XIcon from "../../../../../../public/icons/XIcon";
import CollapsibleHeader from "./CollapsibleHeader";

interface ICodeSection {
  code: string;
  setCode: (code: string) => void;
  submissionStatus: "success" | "error" | null;
  lastResults: ITestCaseResult[];
  compileErrors: ICompileError[];
  isRunning: boolean;
}

export default function CodeSection({
  code,
  setCode,
  submissionStatus,
  lastResults,
  compileErrors,
  isRunning,
}: ICodeSection) {
  const theme = useAppTheme();
  const [editorCollapsed, setEditorCollapsed] = useState(false);
  const [outputCollapsed, setOutputCollapsed] = useState(false);
  const { handleEditorDidMount } = usePortugolEditor(compileErrors);

  const statusBadge =
    submissionStatus === "success" ? (
      <span className="flex items-center text-xs font-bold text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20">
        <CheckIcon className="w-3.5 h-3.5 mr-1" /> SUCESSO
      </span>
    ) : submissionStatus === "error" ? (
      <span className="flex items-center text-xs font-bold text-red-500 bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20">
        <XIcon className="w-3.5 h-3.5 mr-1" /> FALHA
      </span>
    ) : null;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
        height: "100%",
        gap: 1,
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          flex: editorCollapsed ? "0 0 auto" : "1 1 60%",
          minHeight: editorCollapsed ? 0 : 200,
          borderRadius: "8px",
          overflow: "hidden",
          bgcolor: theme.contentPanel,
          border: "1px solid",
          borderColor: theme.contentPanelBorder,
        }}
      >
        <CollapsibleHeader
          icon={<CodeIcon fontSize="small" />}
          title="Editor"
          collapsed={editorCollapsed}
          onToggle={() => setEditorCollapsed((v) => !v)}
        />
        {!editorCollapsed && (
          <Box sx={{ flex: 1, minHeight: 0, bgcolor: theme.codeBg }}>
            <Editor
              height="100%"
              theme="vs-dark"
              language="portugol"
              value={code}
              onChange={(value) => setCode(value || "")}
              onMount={handleEditorDidMount}
              options={{
                fontSize: 14,
                tabSize: 2,
                wordWrap: "on",
                minimap: { enabled: true },
                lineNumbers: "on",
                renderWhitespace: "selection",
                automaticLayout: true,
                tabCompletion: "on",
                cursorStyle: "line",
                scrollBeyondLastLine: false,
              }}
            />
          </Box>
        )}
      </Box>

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          flex: outputCollapsed ? "0 0 auto" : "1 1 40%",
          minHeight: outputCollapsed ? 0 : 240,
          borderRadius: "8px",
          overflow: "hidden",
          bgcolor: theme.contentPanel,
          border: "1px solid",
          borderColor: theme.contentPanelBorder,
        }}
      >
        <CollapsibleHeader
          icon={<TerminalIcon fontSize="small" />}
          title="Terminal / Resultados"
          collapsed={outputCollapsed}
          onToggle={() => setOutputCollapsed((v) => !v)}
          trailing={statusBadge}
        />
        {!outputCollapsed && (
          <Box
            sx={{
              flex: 1,
              minHeight: 0,
              overflowY: "auto",
              p: 2,
              bgcolor: theme.contentPanel,
            }}
          >
            <ExecutionOutput
              compileErrors={compileErrors}
              lastResults={lastResults}
              isRunning={isRunning}
            />
          </Box>
        )}
      </Box>
    </Box>
  );
}
