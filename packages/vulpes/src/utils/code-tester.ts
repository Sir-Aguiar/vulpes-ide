import { PortugolExecutor } from "@portugol-webstudio/runner";
import { ITask } from "../@types/Task";
import { extractFunctionTypeAndParams, extractUserFunction } from "./code-extractor";

export const executeWithTestInputs = (executor: PortugolExecutor, code: string, task: ITask) => {
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

  console.log(finalCode);

  executor.run(finalCode);
};
