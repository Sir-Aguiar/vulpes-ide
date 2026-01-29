"use client";

import { ITask } from "@/@types/Task";
import ContentWrapper from "@/components/ContentWrapper/ContentWrapper";
import AuthGuard from "@/components/AuthGuard";
import Sidebar from "@/components/Sidebar";
import API from "@/services/API";
import { appendFunctionToCode } from "@/utils/code-extractor";
import { executeWithTestInputs, ITestCaseResult } from "@/utils/code-tester";
import { baseCode } from "@/utils/mocks";
import { Editor } from "@monaco-editor/react";
import MDEditor from "@uiw/react-md-editor";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { registerPortugolLanguage } from "../../../../../libs/monaco-config";

const CheckIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M5 13l4 4L19 7"
    />
  </svg>
);

const XIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);

export default function Page() {
  return (
    <AuthGuard>
      <TaskContent />
    </AuthGuard>
  );
}

function TaskContent() {
  const { ID } = useParams();

  const [task, setTask] = useState<ITask | null>(null);
  const [code, setCode] = useState<string>(baseCode);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [lastResults, setLastResults] = useState<ITestCaseResult[]>([]);
  const [submissionStatus, setSubmissionStatus] = useState<
    "success" | "error" | null
  >(null);

  const getTask = async () => {
    try {
      const response = await API.get("/task", { params: { id: ID } });
      console.log(response);

      // Converter os inputs dos testCases de string para array, se necessário
      const taskTestCases = response.data.taskTests;
      const formattedTestCases = taskTestCases.map((testCase: any) => ({
        ...testCase,
        input:
          typeof testCase.input === "string"
            ? JSON.parse(testCase.input)
            : testCase.input,
      }));

      const taskData = { ...response.data, taskTests: formattedTestCases };
      setTask(taskData);
      setCode(appendFunctionToCode(baseCode, response.data.functionDef));
    } catch (e) {
      console.error("Failed to load task", e);
    }
  };

  useEffect(() => {
    if (ID) getTask();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ID]);

  const registerSubmission = async (results: ITestCaseResult[]) => {
    const isCorrect = results.every((res) => res.passed);
    return await API.post("/submission", {
      taskId: ID,
      code,
      isCorrect,
    });
  };

  const handleRunCode = async () => {
    if (code && task) {
      setIsRunning(true);
      setSubmissionStatus(null);
      setLastResults([]);
      try {
        const results = await executeWithTestInputs(code, task);
        const resultsArray: ITestCaseResult[] = [];

        results.keys().forEach((key) => {
          const result = results.get(key);
          resultsArray.push(result!);
        });

        setLastResults(resultsArray);

        await registerSubmission(resultsArray);

        const allPassed = resultsArray.every((r) => r.passed);
        setSubmissionStatus(allPassed ? "success" : "error");

        console.log("Resultados dos testes:", results);
      } catch (error) {
        console.error("Erro ao executar testes:", error);
        setSubmissionStatus("error");
      } finally {
        setIsRunning(false);
      }
    }
  };

  function handleEditorDidMount(editorInstance: any, monacoInstance: any) {
    registerPortugolLanguage(monacoInstance);
    monacoInstance.editor.setTheme("vs-dark");
  }

  return (
    <ContentWrapper className="w-full min-h-screen flex flex-row">
      <div
        className="flex flex-row w-full h-screen p-4 gap-2"
        style={{ backgroundColor: "#263238" }}
      >
        <Sidebar isRunning={isRunning} onRunCode={handleRunCode} />
        <div className="flex-1 flex flex-col rounded-md overflow-hidden gap-1">
          <div className="flex-1">
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
          </div>
          <div className="w-full h-48 flex flex-col bg-[#1e1e1e] rounded-md border border-gray-700 overflow-hidden shadow-lg">
            <div className="flex items-center justify-between px-4 py-2 bg-[#252526] border-b border-gray-700">
              <span className="text-sm font-semibold text-gray-300">
                Terminal / Resultados
              </span>
              <div className="flex items-center gap-2">
                {submissionStatus === "success" && (
                  <span className="flex items-center text-xs font-bold text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20">
                    <CheckIcon className="w-3.5 h-3.5 mr-1" /> SUCESSO
                  </span>
                )}
                {submissionStatus === "error" && (
                  <span className="flex items-center text-xs font-bold text-red-500 bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20">
                    <XIcon className="w-3.5 h-3.5 mr-1" /> FALHA
                  </span>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {lastResults.length === 0 && !isRunning && (
                <div className="flex h-full items-center justify-center text-gray-500 text-sm">
                  Execute o código para ver os resultados.
                </div>
              )}
              {isRunning && (
                <div className="flex h-full items-center justify-center text-gray-400 text-sm animate-pulse">
                  Executando testes...
                </div>
              )}

              {lastResults.map((result, index) => (
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
          </div>
        </div>
      </div>
      <MDEditor.Markdown
        source={task?.description || ""}
        style={{
          minHeight: "100vh",
          height: "100%",
          maxHeight: "100vh",
          width: "100%",
          padding: "8px 16px",
          overflowY: "auto",
          backgroundColor: "#263238",
        }}
      />
    </ContentWrapper>
  );
}
