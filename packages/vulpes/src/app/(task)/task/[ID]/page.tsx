"use client";

import Sidebar from "@/components/Sidebar";
import { Editor } from "@monaco-editor/react";
import { useEffect, useState } from "react";
import { executeWithTestInputs } from "@/utils/code-tester";
import { useParams } from "next/navigation";
import { registerPortugolLanguage } from "../../../../../libs/monaco-config";
import { baseCode } from "@/utils/mocks";
import { appendFunctionToCode } from "@/utils/code-extractor";
import { ITask } from "@/@types/Task";
import API from "@/services/API";
import ContentWrapper from "@/components/ContentWrapper/ContentWrapper";

export default function Page() {
  const { ID } = useParams();

  const [task, setTask] = useState<ITask | null>(null);

  const getTask = async () => {
    const response = await API.get("/task", { params: { ID } });
    setTask(response.data);
    setCode(appendFunctionToCode(baseCode, response.data.functionDef));
  };

  useEffect(() => {
    if (ID) getTask();
  }, [ID]);

  const [code, setCode] = useState<string>(baseCode);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  const handleRunCode = async () => {
    if (code && task) {
      setIsRunning(true);
      try {
        const results = await executeWithTestInputs(code, task);
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
    <ContentWrapper className="w-full min-h-screen">
      <div
        className="flex flex-row w-full h-screen p-4 gap-2"
        style={{ backgroundColor: "#263238" }}
      >
        <Sidebar isRunning={isRunning} onRunCode={handleRunCode} />
        <div
          className="flex-1 flex flex-col rounded-md overflow-hidden gap-1"
          style={{ backgroundColor: "#445056" }}
        >
          <div className="flex-1" style={{ height: "80%" }}>
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
        </div>
      </div>
    </ContentWrapper>
  );
}
