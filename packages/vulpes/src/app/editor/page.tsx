"use client";

import Sidebar from "@/components/Sidebar";
import { CustomWebWorkersRunner } from "@/utils/WebWorkerRunner";
import { Editor } from "@monaco-editor/react";
import { PortugolExecutor } from "@portugol-webstudio/runner";
import { useEffect, useState } from "react";
import { registerPortugolLanguage } from "../../../libs/monaco-config";

export default function EditorPage() {
  const [executor, setExecutor] = useState<PortugolExecutor | null>(null);
  const [output, setOutput] = useState<string>("");
  const [code, setCode] = useState<string>(`programa {\n  funcao inicio() {\n    \n  }\n}\n`);
  const [title, setTitle] = useState<string>("Sem título");
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isTranspiling, setIsTranspiling] = useState<boolean>(false);

  useEffect(() => {
    const exec = new PortugolExecutor(CustomWebWorkersRunner);
    setExecutor(exec);

    const subscription = exec.stdOut$.subscribe(data => {
      setOutput(data);
    });

    const handleKeyDown = (event: KeyboardEvent) => {
      // F1 - Help
      if (event.key === "F1") {
        event.preventDefault();
        handleOpenHelp();
      }

      // Ctrl+S - Save
      if (event.ctrlKey && event.key === "s") {
        event.preventDefault();
        handleSaveFile();
      }

      // Ctrl+O - Open
      if (event.ctrlKey && event.key === "o") {
        event.preventDefault();
        handleOpenFile();
      }

      // Ctrl+Enter - Run
      if (event.ctrlKey && event.key === "Enter") {
        event.preventDefault();
        handleRunCode();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      subscription.unsubscribe();
      exec.stop();
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleRunCode = () => {
    if (executor) {
      setIsTranspiling(true);
      setIsRunning(true);

      executor.run(code);

      setIsTranspiling(false);
      setIsRunning(false);
    }
  };

  const handleStopCode = () => {
    if (executor) {
      executor.stop();
      setIsRunning(false);
      setIsTranspiling(false);
    }
  };

  const handleSaveFile = () => {
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = title.endsWith(".por") ? title : `${title}.por`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleOpenFile = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".por,text/plain";
    input.onchange = async event => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (file) {
        const content = await file.text();
        setCode(content);
        setTitle(file.name);
      }
    };
    input.click();
  };

  const handleOpenHelp = () => {
    console.log("Abrindo ajuda...");
  };

  const handleOpenSettings = () => {
    console.log("Abrindo configurações...");
  };

  function handleEditorDidMount(editorInstance: any, monacoInstance: any) {
    registerPortugolLanguage(monacoInstance);
    monacoInstance.editor.setTheme("vs-dark");
  }

  return (
    <div className="flex flex-row w-full h-screen p-4 gap-2" style={{ backgroundColor: "#263238" }}>
      <Sidebar
        isRunning={isRunning}
        isTranspiling={isTranspiling}
        onRunCode={handleRunCode}
        onStopCode={handleStopCode}
        onSaveFile={handleSaveFile}
        onOpenFile={handleOpenFile}
        onOpenHelp={handleOpenHelp}
        onOpenSettings={handleOpenSettings}
      />
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
