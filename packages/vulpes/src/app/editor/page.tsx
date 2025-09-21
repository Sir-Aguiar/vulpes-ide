"use client";

import { CustomWebWorkersRunner } from "@/utils/WebWorkerRunner";
import { Editor } from "@monaco-editor/react";
import { PortugolExecutor } from "@portugol-webstudio/runner";
import React, { useEffect, useState } from "react";

export default function page() {
  const [executor, setExecutor] = useState<PortugolExecutor | null>(null);
  const [output, setOutput] = useState<string>("");

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
      executor.run(portugolCode);
    }
  };

  const [portugolCode, setPortugolCode] = React.useState<string>("");

  const handleEditorChange = (value: string | undefined) => {
    setPortugolCode(value || "");
  };

  return (
    <div className="w-full h-screen">
      <div className="w-full h-full flex">
        <div className="flex-1 flex flex-col bg-slate-900">
          <div className="flex-1">
            <Editor
              height="100%"
              defaultLanguage="c"
              value={portugolCode}
              onChange={handleEditorChange}
              theme="vs-dark"
            />
          </div>
          <div className="h-16 flex items-center px-4 ">
            <button
              className="flex items-center justify-center w-32 h-10 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg mr-4 transition-colors"
              onClick={handleRunCode}
            >
              Executar
            </button>
            <button className="flex items-center justify-center w-32 h-10 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors">
              Parar
            </button>
          </div>
        </div>
        <div className="flex-1 p-4">
          <h2 className="text-lg font-bold mb-2">Output</h2>
          <div className="w-full h-full bg-gray-800 rounded-lg p-2 overflow-auto">
            <pre className="text-white whitespace-pre-wrap">{output}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}
