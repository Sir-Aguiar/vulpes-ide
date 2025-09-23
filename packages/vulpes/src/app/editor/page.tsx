"use client";

import Sidebar from "@/components/Sidebar";
import { CustomWebWorkersRunner } from "@/utils/WebWorkerRunner";
import { Editor } from "@monaco-editor/react";
import { PortugolExecutor } from "@portugol-webstudio/runner";
import { useEffect, useState } from "react";
import { registerPortugolLanguage } from "../../../libs/monaco-config";
import { taskTemplate } from "@/utils/mocks";
import { executeWithTestInputs } from "@/utils/code-tester";

export default function EditorPage() {
  const [executor, setExecutor] = useState<PortugolExecutor | null>(null);
  const [output, setOutput] = useState<string>("");
  const [code, setCode] = useState<string>(taskTemplate.initialCode);
  const [title, setTitle] = useState<string>("Sem título");
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isTranspiling, setIsTranspiling] = useState<boolean>(false);

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
    if (executor) {
      runTestCases();
    }
  };

  const runTestCases = async () => {
    executeWithTestInputs(executor!, code, taskTemplate.testCases, taskTemplate.functionName);
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
