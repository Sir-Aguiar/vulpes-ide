import { PortugolExecutor } from "@portugol-webstudio/runner";
import { PortugolErrorChecker } from "@portugol-webstudio/parser";
import { PortugolCodeError } from "@portugol-webstudio/antlr";
import { IExecutableTestCase, ITask } from "../@types/Task";
import {
  extractFunctionTypeAndParams,
  extractLibariesFromPrograma,
  extractUserFunction,
} from "./code-extractor";
import {
  appendArrayVariablesToCode,
  appendLibrariesToCode,
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

export interface ICompileError {
  message: string;
  line: number;
  column: number;
  kind: "parse" | "semantic";
}

export interface IExecuteWithTestInputsResult {
  compileErrors: ICompileError[];
  results: Map<number, ITestCaseResult>;
}

const mapPortugolErrors = (
  errors: PortugolCodeError[],
  kind: "parse" | "semantic",
): ICompileError[] =>
  errors.map((err) => ({
    message: err.message,
    line: err.startLine ?? 0,
    column: err.startCol ?? 0,
    kind,
  }));

export const executeWithTestInputs = async (
  code: string,
  task: ITask,
): Promise<IExecuteWithTestInputsResult> => {
  // 1) Checagem de compilação do código do usuário antes de montar/rodar qualquer teste.
  //    Se houver erros de parse ou semânticos, retornamos imediatamente para que a UI
  //    possa exibir o log do compilador no terminal, sem tentar rodar os casos de teste.
  try {
    const checkResult = PortugolErrorChecker.checkCode(code);
    const parseErrors = mapPortugolErrors(checkResult.parseErrors, "parse");
    const semanticErrors = mapPortugolErrors(checkResult.errors, "semantic");
    const compileErrors = [...parseErrors, ...semanticErrors];

    if (compileErrors.length > 0) {
      return {
        compileErrors,
        results: new Map(),
      };
    }
  } catch (error) {
    // Falha inesperada do checker — trata como erro de compilação genérico.
    return {
      compileErrors: [
        {
          message: `Falha ao verificar o código: ${
            (error as Error)?.message ?? String(error)
          }`,
          line: 0,
          column: 0,
          kind: "parse",
        },
      ],
      results: new Map(),
    };
  }

  const functionData = extractFunctionTypeAndParams(task.functionDef)!;
  const libariesDeclarations = extractLibariesFromPrograma(code);
  const functionMatch = extractUserFunction(code, functionData.functionName);
  console.log(task);
  const executableTestCases: IExecutableTestCase[] = task.taskTests.map(
    (testCase) => ({
      ...testCase,
      input: [...testCase.input],
      arraysDeclarations: [],
    }),
  );

  // Para cada testCase será feita uma processamento dos inputs
  for (let index = 0; index < task.taskTests.length; index++) {
    const testCase = task.taskTests[index];

    // Para cada input do testCase, formatar de acordo com o tipo esperado
    for (let inputIndex = 0; inputIndex < testCase.input.length; inputIndex++) {
      const param = task.taskParams[inputIndex];
      const input = testCase.input[inputIndex];

      if (param.isArray) {
        const declaration = generateArrayVariable(param, input);
        executableTestCases[index].arraysDeclarations.push(declaration);
        executableTestCases[index].input[inputIndex] = declaration.name;
        continue;
      }

      if (param.type === "cadeia") {
        executableTestCases[index].input[inputIndex] = `"${input}"`;
        continue;
      }

      if (param.type === "real") {
        const rawValue = (input ?? "").trim();
        // Garante literal de ponto flutuante (ex: "100" -> "100.0")
        // para que o Portugol não infira o tipo como 'inteiro'.
        if (
          rawValue &&
          !rawValue.includes(".") &&
          !Number.isNaN(Number(rawValue))
        ) {
          executableTestCases[index].input[inputIndex] = `${rawValue}.0`;
        } else {
          executableTestCases[index].input[inputIndex] = rawValue;
        }
        continue;
      }

      if (param.type === "logico") {
        const rawValue = (input ?? "").trim().toLowerCase();
        const truthy = ["true", "verdadeiro", "1", "sim"];
        const falsy = ["false", "falso", "0", "nao", "não"];
        if (truthy.includes(rawValue)) {
          executableTestCases[index].input[inputIndex] = "verdadeiro";
        } else if (falsy.includes(rawValue)) {
          executableTestCases[index].input[inputIndex] = "falso";
        }
        continue;
      }
    }
  }

  const testCaseResults = new Map<number, ITestCaseResult>();
  const expectedParamCount = functionData.params.length;

  for (const testCase of executableTestCases) {
    testCaseResults.set(testCase.testId, {
      expectedOutput: testCase.expectedOutput,
      input: testCase.input,
      actualOutput: null,
      passed: false,
    });

    // Valida se o número de inputs bate com o número de parâmetros da função.
    if (testCase.input.length !== expectedParamCount) {
      testCaseResults.get(testCase.testId)!.actualOutput =
        `Erro: caso de teste possui ${testCase.input.length} entrada(s), ` +
        `mas a função '${functionData.functionName}' espera ${expectedParamCount}.`;
      continue;
    }

    await new Promise<void>((resolve) => {
      const executor = new PortugolExecutor(CustomWebWorkersRunner);

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
        testCase.arraysDeclarations.map((decl) => decl.declaration),
      );

      baseCode = appendLibrariesToCode(baseCode, libariesDeclarations);

      baseCode = formatPortugolCode(baseCode);

      const stdOutSubscription = executor.stdOut$.subscribe((output) => {
        const match = output.match(/Saída recebida:\s*(.*)/);

        if (match) {
          testCaseResults.get(testCase.testId)!.actualOutput = match[1];
          testCaseResults.get(testCase.testId)!.passed =
            match[1] === testCaseResults.get(testCase.testId)!.expectedOutput;
        }
      });

      const eventsSubscription = executor.events.subscribe((event) => {
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

          const result = testCaseResults.get(testCase.testId)!;
          const errorMessage =
            (event.error && (event.error.message || String(event.error))) ||
            "Erro na execução do código";
          // Mantém a saída parcial se houver, senão registra o erro.
          if (result.actualOutput === null) {
            result.actualOutput = `Erro: ${errorMessage}`;
          }
          result.passed = false;

          console.log(event.error);
          console.log(executor.byteCode);
          // Resolve (em vez de rejeitar) para que os demais casos sigam executando.
          resolve();
        }
      });

      console.log(baseCode);
      executor.run(baseCode);
    });
  }

  return {
    compileErrors: [],
    results: testCaseResults,
  };
};
