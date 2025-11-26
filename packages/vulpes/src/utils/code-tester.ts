import { PortugolExecutor } from "@portugol-webstudio/runner";
import { IExecutableTestCase, ITask } from "../@types/Task";
import { extractFunctionTypeAndParams, extractUserFunction } from "./code-extractor";
import {
  appendArrayVariablesToCode,
  formatPortugolCode,
  generateArrayVariable,
  generatePrintStatement,
} from "./code-formatter";
import { CustomWebWorkersRunner } from "./WebWorkerRunner";

export interface ITestCaseResult {
  input: any[];
  expectedOutput: any;
  actualOutput: any;
  passed: boolean;
}

export const executeWithTestInputs = async (code: string, task: ITask) => {
  const functionData = extractFunctionTypeAndParams(task.functionDef)!;

  const functionMatch = extractUserFunction(code, functionData.functionName);

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

  const testCaseResults = new Map<number, ITestCaseResult>();

  for (const testCase of executableTestCases) {
    await new Promise<void>((resolve, reject) => {
      const executor = new PortugolExecutor(CustomWebWorkersRunner);

      testCaseResults.set(testCase.id, {
        expectedOutput: testCase.expectedOutput,
        input: testCase.input,
        actualOutput: null,
        passed: false,
      });

      let baseCode = `
        programa {
          ${functionMatch || ""}

          funcao inicio() {
            ${generatePrintStatement(functionData, testCase.input)}
          }
        }
      `;

      baseCode = appendArrayVariablesToCode(
        baseCode,
        testCase.arraysDeclarations.map(decl => decl.declaration),
      );

      baseCode = formatPortugolCode(baseCode);

      const stdOutSubscription = executor.stdOut$.subscribe(output => {
        const match = output.match(/Saída recebida:\s*(.*)/);

        if (match) {
          testCaseResults.get(testCase.id)!.actualOutput = match[1];
          testCaseResults.get(testCase.id)!.passed = match[1] === testCaseResults.get(testCase.id)!.expectedOutput;
        }
      });

      const eventsSubscription = executor.events.subscribe(event => {
        if (event.type === "finish") {
          stdOutSubscription.unsubscribe();
          eventsSubscription.unsubscribe();
          executor.stop();
          resolve();
        }

        if (event.type === "error") {
          stdOutSubscription.unsubscribe();
          eventsSubscription.unsubscribe();
          executor.stop();

          reject(new Error("Erro na execução do código"));
        }
      });

      executor.run(baseCode);
    });
  }

  return testCaseResults;
};
