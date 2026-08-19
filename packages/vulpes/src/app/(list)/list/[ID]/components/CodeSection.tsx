"use client";

import { useAppTheme } from "@/providers/ColorModeProvider";
import { ICompileError, ITestCaseResult } from "@/utils/code-tester";
import CodeIcon from "@mui/icons-material/Code";
import TerminalIcon from "@mui/icons-material/Terminal";
import { Editor } from "@monaco-editor/react";
import { Box } from "@mui/material";
import { useState } from "react";
import { registerPortugolLanguage } from "../../../../../../libs/monaco-config";
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

  function handleEditorDidMount(_editor: unknown, monacoInstance: unknown) {
    registerPortugolLanguage(monacoInstance);
    (monacoInstance as { editor: { setTheme: (t: string) => void } }).editor.setTheme("vs-dark");
  }

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
          flex: editorCollapsed ? "0 0 auto" : "1 1 70%",
          minHeight: 0,
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
          <Box sx={{ flex: 1, minHeight: 240, bgcolor: theme.codeBg }}>
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
          flex: outputCollapsed ? "0 0 auto" : "1 1 30%",
          minHeight: 0,
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
              overflowY: "auto",
              p: 2,
              minHeight: 160,
              bgcolor: theme.contentPanel,
              display: "flex",
              flexDirection: "column",
              gap: 1,
            }}
          >
            {compileErrors.length === 0 &&
              lastResults.length === 0 &&
              !isRunning && (
                <Box
                  sx={{
                    display: "flex",
                    height: "100%",
                    alignItems: "center",
                    justifyContent: "center",
                    color: theme.textMuted,
                    fontSize: 14,
                  }}
                >
                  Execute o código para ver os resultados.
                </Box>
              )}
            {isRunning && (
              <Box
                sx={{
                  display: "flex",
                  height: "100%",
                  alignItems: "center",
                  justifyContent: "center",
                  color: theme.textSecondary,
                  fontSize: 14,
                }}
                className="animate-pulse"
              >
                Executando testes...
              </Box>
            )}

            {!isRunning && compileErrors.length > 0 && (
              <div
                className="rounded border border-red-500/30 overflow-hidden"
                style={{ backgroundColor: theme.bgElevated }}
              >
                <div className="flex items-center px-3 py-2 bg-red-500/10 border-b border-red-500/20">
                  <XIcon className="w-4 h-4 text-red-500 mr-2" />
                  <span className="text-sm font-semibold text-red-400">
                    {compileErrors.length === 1
                      ? "1 erro de compilação"
                      : `${compileErrors.length} erros de compilação`}
                  </span>
                </div>
                <ul className="px-4 py-2 space-y-1 text-xs font-mono text-red-300">
                  {compileErrors.map((err, idx) => (
                    <li key={idx} className="leading-relaxed">
                      <span className="mr-2" style={{ color: theme.textMuted }}>
                        [{err.kind === "parse" ? "sintaxe" : "semântico"}]
                      </span>
                      <span className="mr-2" style={{ color: theme.textSecondary }}>
                        linha {err.line}, coluna {err.column}:
                      </span>
                      <span>{err.message}</span>
                    </li>
                  ))}
                </ul>
                <div
                  className="px-4 py-2 text-[11px] border-t"
                  style={{ color: theme.textMuted, borderColor: theme.border }}
                >
                  Corrija os erros acima para que os testes sejam executados.
                </div>
              </div>
            )}

            {!isRunning &&
              compileErrors.length === 0 &&
              lastResults.map((result, index) => (
                <Box
                  key={index}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    bgcolor: theme.bgElevated,
                    borderRadius: 1,
                    overflow: "hidden",
                    border: "1px solid",
                    borderColor: theme.border,
                  }}
                >
                  <div
                    className={`flex items-center px-3 py-2 border-l-4 ${
                      result.passed
                        ? "border-green-500 bg-green-500/5"
                        : "border-red-500 bg-red-500/5"
                    }`}
                  >
                    <span className="mr-3">
                      {result.passed ? (
                        <CheckIcon className="w-5 h-5 text-green-500" />
                      ) : (
                        <XIcon className="w-5 h-5 text-red-500" />
                      )}
                    </span>
                    <span
                      className={`text-sm font-medium ${
                        result.passed ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      Teste {index + 1}
                    </span>
                    <span className="ml-auto text-xs" style={{ color: theme.textMuted }}>
                      {result.passed ? "Passou" : "Falhou"}
                    </span>
                  </div>

                  {!result.passed && (
                    <Box
                      sx={{
                        px: 2,
                        py: 1,
                        bgcolor: theme.bg,
                        fontSize: 12,
                        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                        borderTop: "1px solid",
                        borderColor: theme.border,
                        color: theme.textSecondary,
                      }}
                    >
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="block mb-0.5" style={{ color: theme.textMuted }}>
                            Esperado:
                          </span>
                          <Box sx={{ bgcolor: theme.bgElevated, p: 0.5, borderRadius: 1, color: "success.light" }}>
                            {result.expectedOutput}
                          </Box>
                        </div>
                        <div>
                          <span className="block mb-0.5" style={{ color: theme.textMuted }}>
                            Obtido:
                          </span>
                          <Box sx={{ bgcolor: theme.bgElevated, p: 0.5, borderRadius: 1, color: "error.light" }}>
                            {result.actualOutput}
                          </Box>
                        </div>
                      </div>
                    </Box>
                  )}
                </Box>
              ))}
          </Box>
        )}
      </Box>
    </Box>
  );
}
