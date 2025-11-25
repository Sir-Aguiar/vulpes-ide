import { PortugolExecutor } from "@portugol-webstudio/runner";
import { IExecutableTestCase, ITask } from "../@types/Task";
import { extractFunctionTypeAndParams, extractUserFunction } from "./code-extractor";
import { appendArrayVariablesToCode, generateArrayVariable, generatePrintStatement } from "./code-formatter";
import { CustomWebWorkersRunner } from "./WebWorkerRunner";

export const executeWithTestInputs = (code: string, task: ITask) => {
  const executor = new PortugolExecutor(CustomWebWorkersRunner);

  const functionData = extractFunctionTypeAndParams(task.functionDef)!;

  console.log(functionData);

  const functionMatch = extractUserFunction(code, functionData.functionName);

  console.log(functionMatch);

  console.log(task);

  const executableTestCases: IExecutableTestCase[] = task.testCases.map(testCase => ({
    ...testCase,
    arraysDeclarations: [],
  }));

  // Para cada testCase será feita uma processamento dos inputs
  for (let index = 0; index < task.testCases.length; index++) {
    const testCase = task.testCases[index];

    // Para cada input do testCase, formatar de acordo com o tipo esperado
    for (let inputIndex = 0; inputIndex < testCase.input.length; inputIndex++) {
      const param = task.params[inputIndex];
      const input = testCase.input[inputIndex];

      if (param.type === "cadeia") {
        executableTestCases[index].input[inputIndex] = `"${input}"`;
      }

      if (param.isArray) {
        const declaration = generateArrayVariable(param, input);
        executableTestCases[index].arraysDeclarations.push(declaration);
        executableTestCases[index].input[inputIndex] = declaration.name;
      }
    }
  }

  console.log(executableTestCases);

  let baseCode = `
    programa {
      ${functionMatch || ""}

      funcao inicio() {
        ${generatePrintStatement(functionData, executableTestCases[0].input)}
      }
    }
  `;

  baseCode = appendArrayVariablesToCode(
    baseCode,
    executableTestCases[0].arraysDeclarations.map(decl => decl.declaration),
  );

  console.log(baseCode);

  executor.stdOut$.subscribe(output => {
    console.log(output);
  });

  executor.run(baseCode);
};
