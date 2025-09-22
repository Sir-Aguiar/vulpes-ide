"use client";

import Sidebar from "@/components/Sidebar";
import { CustomWebWorkersRunner } from "@/utils/WebWorkerRunner";
import Editor from "@monaco-editor/react";
import { PortugolExecutor } from "@portugol-webstudio/runner";
import { useEffect, useState } from "react";

export default function Home() {
  const [portugolCode, setPortugolCode] = useState(
    'programa\n{\n  funcao inicio()\n  {\n    escreva("Olá, Mundo!")\n  }\n}',
  );
  const [output, setOutput] = useState("");
  const [executor, setExecutor] = useState<PortugolExecutor | null>(null);

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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "Enter") {
        e.preventDefault();
        handleRunCode();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [executor, portugolCode]);

  const handleRunCode = () => {
    if (executor) {
      executor.run(portugolCode);
    }
  };

  const handleSaveFile = () => {
    console.log("Salvar código:", portugolCode);
  };

  const handleNewFile = () => {
    setPortugolCode('programa\n{\n  funcao inicio()\n  {\n    escreva("Olá, Mundo!")\n  }\n}');
  };

  const handleOpenFile = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".por";
    input.onchange = e => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          setPortugolCode(reader.result as string);
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleStopCode = () => {
    if (executor) {
      executor.stop();
    }
  };

  const handleOpenHelp = () => {
    console.log("Abrir ajuda");
  };

  const handleOpenSettings = () => {
    console.log("Abrir configurações");
  };

  return (
    <div className="h-screen w-screen bg-gray-900 text-white flex">
      <Sidebar
        isRunning={!executor}
        isTranspiling={false}
        onRunCode={handleRunCode}
        onStopCode={handleStopCode}
        onSaveFile={handleSaveFile}
        onOpenFile={handleOpenFile}
        onOpenHelp={handleOpenHelp}
        onOpenSettings={handleOpenSettings}
      />

      <div className="flex-1 flex flex-col">
        <div className="flex-1">
          <Editor
            defaultValue={portugolCode}
            language="portugol"
            theme="vs-dark"
            onChange={value => setPortugolCode(value || "")}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: "on",
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 2,
              wordWrap: "on",
            }}
          />
        </div>

        {output && (
          <div className="h-32 bg-gray-800 border-t border-gray-700 p-4 overflow-auto">
            <h3 className="text-sm font-semibold mb-2 text-gray-300">Saída:</h3>
            <pre className="text-sm text-green-400 whitespace-pre-wrap">{output}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
