import { PortugolExecutor } from "@portugol-webstudio/runner";
import { ITask } from "../@types/Task";
import { extractFunctionTypeAndParams, extractUserFunction } from "./code-extractor";
import { CustomWebWorkersRunner } from "./WebWorkerRunner";

export const executeWithTestInputs = (code: string, task: ITask) => {
  const executor = new PortugolExecutor(CustomWebWorkersRunner);

  const functionData = extractFunctionTypeAndParams(task.functionDef)!;
  const functionMatch = extractUserFunction(code, functionData.functionName);

  function formatPrint(code: string) {
    return `escreva("Saída recebida: " + ${code} + "\\n")`;
  }

  const finalCode = `
    programa {
      ${functionMatch || ""}

      funcao inicio() {
        ${task.testCases.map(testCase => formatPrint(`${functionData.functionName}(${testCase.input})`)).join("\n        ")}
      }
    }
  `;

  executor.stdOut$.subscribe(output => {
    console.log(output);
  });

  executor.run(finalCode);
};
