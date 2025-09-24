"use client";

import Sidebar from "@/components/Sidebar";
import { CustomWebWorkersRunner } from "@/utils/WebWorkerRunner";
import { Editor } from "@monaco-editor/react";
import { PortugolExecutor } from "@portugol-webstudio/runner";
import { useEffect, useMemo, useState } from "react";
import { executeWithTestInputs } from "@/utils/code-tester";
import { useParams } from "next/navigation";
import axios from "axios";
import { registerPortugolLanguage } from "../../../../../libs/monaco-config";
import { baseCode } from "@/utils/mocks";
import { appendFunctionToCode, extractFunctionTypeAndParams, extractUserFunction } from "@/utils/code-extractor";
import { ITask } from "@/@types/Task";

export default function Page() {
  const { ID } = useParams();

  const [task, setTask] = useState<ITask | null>(null);

  const getTask = async () => {
    const response = await axios.get("/api/task", { params: { ID } });
    setTask(response.data);
  };

  const functionData = useMemo(() => {
    if (task) return extractFunctionTypeAndParams(task.functionDef);
  }, [task]);

  const [executor, setExecutor] = useState<PortugolExecutor | null>(null);
  const [output, setOutput] = useState<string>("");
  const [code, setCode] = useState<string>(baseCode);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isTranspiling, setIsTranspiling] = useState<boolean>(false);

  useEffect(() => {
    if (ID) {
      getTask();
    }
  }, [ID]);

  useEffect(() => {
    if (task && functionData) {
      const newCode = appendFunctionToCode(baseCode, task.functionDef);
      setCode(newCode);
    }
  }, [functionData]);

  useEffect(() => {
    const exec = new PortugolExecutor(CustomWebWorkersRunner);
    setExecutor(exec);

    const subscription = exec.stdOut$.subscribe(data => {
      setOutput(data);
    });

    return () => {
      subscription.unsubscribe();
      exec.stop();
    };
  }, []);

  const handleRunCode = () => {
    if (executor && code) {
      setIsRunning(true);
      executeWithTestInputs(code, task!);
    }
  };

  function handleEditorDidMount(editorInstance: any, monacoInstance: any) {
    registerPortugolLanguage(monacoInstance);
    monacoInstance.editor.setTheme("vs-dark");
  }

  return (
    <div className="flex flex-row w-full h-screen p-4 gap-2" style={{ backgroundColor: "#263238" }}>
      <Sidebar isRunning={isRunning} isTranspiling={isTranspiling} onRunCode={handleRunCode} />
      <div className="flex-1 flex flex-col rounded-md overflow-hidden gap-1" style={{ backgroundColor: "#445056" }}>
        <div className="flex-1" style={{ height: "80%" }}>
          <Editor
            height="100%"
            theme="vs-dark"
            language="portugol"
            value={code}
            onChange={value => setCode(value || "")}
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

        <div style={{ height: "20%", backgroundColor: "#121e24" }}>
          <Editor
            height="100%"
            theme="vs-dark"
            value={output}
            options={{
              fontSize: 14,
              fontFamily: '"Lato", sans-serif',
              lineNumbers: "off",
              readOnly: true,
              minimap: { enabled: false },
              wordWrap: "on",
              automaticLayout: true,
              overviewRulerLanes: 0,
              hideCursorInOverviewRuler: true,
              overviewRulerBorder: false,
              renderLineHighlight: "none",
              scrollBeyondLastLine: false,
              contextmenu: false,
            }}
          />
        </div>
      </div>
    </div>
  );
}
