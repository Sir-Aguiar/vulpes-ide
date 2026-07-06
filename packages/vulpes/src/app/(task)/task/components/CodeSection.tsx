"use client";

import { Box } from "@mui/material";
import CodeIcon from "@mui/icons-material/Code";
import TerminalIcon from "@mui/icons-material/Terminal";
import { useState } from "react";
import { Editor } from "@monaco-editor/react";
import { ICompileError, ITestCaseResult } from "@/utils/code-tester";
import { registerPortugolLanguage } from "../../../../../libs/monaco-config";
import CheckIcon from "../../../../../public/icons/CheckIcon";
import XIcon from "../../../../../public/icons/XIcon";
import { CollapsibleHeader } from "./CollapsibleHeader";

export interface ICodeSectionProps {
  code: string;
  setCode: (code: string) => void;
  submissionStatus: "success" | "error" | null;
  lastResults: ITestCaseResult[];
  compileErrors: ICompileError[];
  isRunning: boolean;
}

export function CodeSection({
  code,
  setCode,
  submissionStatus,
  lastResults,
  compileErrors,
  isRunning,
}: ICodeSectionProps) {
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
          bgcolor: "#1e1e1e",
          border: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <CollapsibleHeader
          icon={<CodeIcon fontSize="small" />}
          title="Editor"
          collapsed={editorCollapsed}
          onToggle={() => setEditorCollapsed((v) => !v)}
        />
        {!editorCollapsed && (
          <Box sx={{ flex: 1, minHeight: 240 }}>
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
          bgcolor: "#1e1e1e",
          border: "1px solid rgba(255,255,255,0.05)",
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
          <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-[#1e1e1e] min-h-[160px]">
            {compileErrors.length === 0 &&
              lastResults.length === 0 &&
              !isRunning && (
                <div className="flex h-full items-center justify-center text-gray-500 text-sm">
                  Execute o código para ver os resultados.
                </div>
              )}
            {isRunning && (
              <div className="flex h-full items-center justify-center text-gray-400 text-sm animate-pulse">
                Executando testes...
              </div>
            )}

            {!isRunning && compileErrors.length > 0 && (
              <div className="bg-[#1e1e1e] rounded border border-red-500/30 overflow-hidden">
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
                      <span className="text-gray-500 mr-2">
                        [{err.kind === "parse" ? "sintaxe" : "semântico"}]
                      </span>
                      <span className="text-gray-400 mr-2">
                        linha {err.line}, coluna {err.column}:
                      </span>
                      <span>{err.message}</span>
                    </li>
                  ))}
                </ul>
                <div className="px-4 py-2 text-[11px] text-gray-500 border-t border-gray-700">
                  Corrija os erros acima para que os testes sejam executados.
                </div>
              </div>
            )}

            {!isRunning &&
              compileErrors.length === 0 &&
              lastResults.map((result, index) => (
                <div
                  key={index}
                  className="flex flex-col bg-[#2d2d2d] rounded bg-opacity-40 overflow-hidden"
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
                    <span className="ml-auto text-xs text-gray-500">
                      {result.passed ? "Passou" : "Falhou"}
                    </span>
                  </div>

                  {!result.passed && (
                    <div className="px-4 py-2 bg-[#1e1e1e] bg-opacity-50 text-xs font-mono border-t border-gray-700 text-gray-300">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="block text-gray-500 mb-0.5">
                            Esperado:
                          </span>
                          <div className="bg-gray-800 p-1 rounded text-green-300">
                            {result.expectedOutput}
                          </div>
                        </div>
                        <div>
                          <span className="block text-gray-500 mb-0.5">
                            Obtido:
                          </span>
                          <div className="bg-gray-800 p-1 rounded text-red-300">
                            {result.actualOutput}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
          </div>
        )}
      </Box>
    </Box>
  );
}
