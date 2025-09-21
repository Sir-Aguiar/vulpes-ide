"use client";

import { CustomWebWorkersRunner } from "@/utils/WebWorkerRunner";
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

  const handleRunCode = () => {
    if (executor) {
      executor.run(portugolCode);
    }
  };

  return (
    <div>
      <textarea value={portugolCode} onChange={e => setPortugolCode(e.target.value)} rows={10} cols={50} />
      <button onClick={handleRunCode} disabled={!executor}>
        Executar
      </button>
      <pre>
        <strong>Saída:</strong>
        <br />
        {output}
      </pre>
    </div>
  );
}
