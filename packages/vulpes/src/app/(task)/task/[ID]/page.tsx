"use client";

import { ITask } from "@/@types/Task";
import ContentWrapper from "@/components/ContentWrapper/ContentWrapper";
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

export default function Page() {
  const { ID } = useParams();

  const [task, setTask] = useState<ITask | null>(null);

  const getTask = async () => {
    const response = await API.get("/task", { params: { id: ID } });
    setTask(response.data);
    setCode(appendFunctionToCode(baseCode, response.data.functionDef));
  };

  useEffect(() => {
    if (ID) getTask();
  }, [ID]);

  const [code, setCode] = useState<string>(baseCode);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [lastResults, setLastResults] = useState<ITestCaseResult[]>([]);

  const handleRunCode = async () => {
    if (code && task) {
      setIsRunning(true);
      try {
        const results = await executeWithTestInputs(code, task);

        const resultsArray: ITestCaseResult[] = [];

        results.keys().forEach((key) => {
          const result = results.get(key);
          resultsArray.push(result!);
        });

        setLastResults(resultsArray);

        console.log("Resultados dos testes:", results);
      } catch (error) {
        console.error("Erro ao executar testes:", error);
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
          <div className="w-full h-36 py-1 overflow-y-auto text-gray-300">
            {lastResults.map((result, index) => (
              <pre className="text-sm">
                <div key={index} className="mb-2">
                  <div>
                    <strong>Teste {index + 1}:</strong>{" "}
                    {result.passed ? (
                      <span className="text-green-700">Passou</span>
                    ) : (
                      <span className="text-red-700">Falhou</span>
                    )}
                  </div>
                  {!result.passed && (
                    <div className="ml-4">
                      <div>
                        <strong>Saída Esperada:</strong>{" "}
                        <pre className="inline">{result.expectedOutput}</pre>
                      </div>
                      <div>
                        <strong>Saída Obtida:</strong>{" "}
                        <pre className="inline">{result.actualOutput}</pre>
                      </div>
                    </div>
                  )}
                </div>
              </pre>
            ))}
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
