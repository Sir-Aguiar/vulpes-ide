/* eslint-disable @typescript-eslint/no-base-to-string */
import { PortugolCodeError } from "@portugol-webstudio/antlr";
import { PortugolErrorChecker } from "@portugol-webstudio/parser";
import { PortugolExecutor } from "@portugol-webstudio/runner";
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
import { devLog } from "./dev-logger";
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

const looksLikeJsonArray = (value: unknown): value is string => {
  if (typeof value !== "string") return false;
  const trimmed = value.trim();
  return trimmed.startsWith("[") && trimmed.endsWith("]");
};

/**
 * Normaliza o input de um testCase defensivamente.
 *
 * O backend pode enviar o input em diferentes formatos:
 *  - array de strings (ideal):           ["1000", "2", "6"]
 *  - string JSON (single-encoded):       "[\"1000\",\"2\",\"6\"]"
 *  - string JSON double-encoded:         "[\"[\\\"1000\\\",\\\"2\\\",\\\"6\\\"]\"]"
 *  - array com uma única string JSON:    ["[\"1000\",\"2\",\"6\"]"]
 *
 * Esta função aplica parses sucessivos até chegar em um array plano de
 * strings, protegendo a pipeline de execução contra serializações duplas.
 */
export const normalizeTestCaseInput = (input: unknown): string[] => {
  const trace: string[] = [];
  let current: unknown = input;
  trace.push(`inicio: ${JSON.stringify(current)}`);

  let safety = 0;
  while (safety++ < 5) {
    // String JSON → parse
    if (looksLikeJsonArray(current)) {
      try {
        current = JSON.parse(current);
        trace.push(`parse string JSON → ${JSON.stringify(current)}`);
        continue;
      } catch {
        break;
      }
    }

    // Array com 1 único elemento que é uma string JSON → desembrulha e parse novamente
    if (
      Array.isArray(current) &&
      current.length === 1 &&
      looksLikeJsonArray(current[0])
    ) {
      try {
        const parsed = JSON.parse(current[0]);
        current = parsed;
        trace.push(`desembrulha array[1] + parse → ${JSON.stringify(current)}`);
        continue;
      } catch {
        break;
      }
    }

    break;
  }

  // Converte todos os itens finais para string, pois a pipeline de formatação espera strings.
  let result: string[];
  if (Array.isArray(current)) {
    result = current.map((v) =>
      typeof v === "string" ? v : v == null ? "" : String(v),
    );
  } else if (current == null) {
    result = [];
  } else {
    result = [typeof current === "string" ? current : String(current)];
  }

  if (trace.length > 1) {
    devLog.info(
      "[code-tester] normalizeTestCaseInput aplicou reparse defensivo",
      { trace, finalInput: result },
    );
  }

  return result;
};

const normalizeComparableOutput = (value: unknown): string =>
  String(value ?? "")
    .replaceAll("\r", "")
    .trim();

const extractReceivedOutput = (output: string): string | null => {
  const matches = [...output.matchAll(/Saída recebida:\s*(.*)/g)];
  const last = matches.at(-1)?.[1];

  if (last == null) {
    return null;
  }

  return normalizeComparableOutput(last);
};

export const executeWithTestInputs = async (
  code: string,
  task: ITask,
): Promise<IExecuteWithTestInputsResult> => {
  // Remove BOM and trim the code to prevent ANTLR errors missing the 'programa' keyword at line 1 column 0
  code = code.replace(/^\uFEFF/, "").trim();

  devLog.group(`Execução de Tarefa — ${task.title ?? task.taskId}`);
  devLog.time("execução total");

  devLog.section("Tarefa");
  devLog.kv("taskId", task.taskId);
  devLog.kv("title", task.title);
  devLog.kv("inputMode", task.inputMode);
  devLog.code(
    "functionDef (assinatura oficial)",
    task.functionDef ?? "<vazio>",
  );
  devLog.code("código do usuário (fonte)", code);

  // 1) Checagem de compilação do código do usuário antes de montar/rodar qualquer teste.
  //    Se houver erros de parse ou semânticos, retornamos imediatamente para que a UI
  //    possa exibir o log do compilador no terminal, sem tentar rodar os casos de teste.
  devLog.section("Checagem de compilação");
  try {
    const checkResult = PortugolErrorChecker.checkCode(code);
    const parseErrors = mapPortugolErrors(checkResult.parseErrors, "parse");
    const semanticErrors = mapPortugolErrors(checkResult.errors, "semantic");
    const compileErrors = [...parseErrors, ...semanticErrors];

    devLog.kv("parseErrors", parseErrors.length);
    devLog.kv("semanticErrors", semanticErrors.length);

    if (compileErrors.length > 0) {
      devLog.error(
        "Código não compila — abortando execução de casos de teste.",
      );
      devLog.table("Erros encontrados", compileErrors);
      devLog.timeEnd("execução total");
      devLog.groupEnd();
      return {
        compileErrors,
        results: new Map(),
      };
    }
    devLog.ok("Código compila sem erros.");
  } catch (error) {
    devLog.error("Falha inesperada no PortugolErrorChecker", error);
    devLog.timeEnd("execução total");
    devLog.groupEnd();
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

  devLog.section("Extração da assinatura oficial (functionDef)");
  if (functionData) {
    devLog.kv("functionName", functionData.functionName);
    devLog.kv("returnType", functionData.returnType);
    devLog.table(
      "params esperados (derivados de functionDef)",
      functionData.params,
    );
  } else {
    devLog.error(
      "Não foi possível extrair a assinatura da função a partir de functionDef.",
    );
  }

  devLog.section("taskParams (vindos do backend)");
  devLog.table("task.taskParams", task.taskParams);

  devLog.section("Bibliotecas incluídas no código do usuário");
  if (libariesDeclarations.length === 0) {
    devLog.info("nenhuma biblioteca detectada");
  } else {
    devLog.list("declarações", libariesDeclarations);
  }

  devLog.section("Função do usuário extraída");
  if (functionMatch) {
    devLog.code(`funcao ${functionData.functionName}`, functionMatch);
  } else {
    devLog.warn(
      `Função '${functionData.functionName}' não encontrada no código do usuário. O teste provavelmente vai falhar.`,
    );
  }

  // Diagnóstico cruzado: verifica se functionDef e taskParams divergem em aridade.
  const expectedParamCount = functionData.params.length;
  if (task.taskParams && task.taskParams.length !== expectedParamCount) {
    devLog.warn(
      `Divergência de aridade: functionDef declara ${expectedParamCount} parâmetro(s), mas task.taskParams traz ${task.taskParams.length}.`,
    );
  }

  const executableTestCases: IExecutableTestCase[] = task.taskTests.map(
    (testCase) => ({
      ...testCase,
      // Aplica normalização defensiva contra double-encoding e envelopamentos.
      input: normalizeTestCaseInput(testCase.input),
      arraysDeclarations: [],
    }),
  );

  devLog.section(`Casos de teste brutos (${task.taskTests.length})`);
  devLog.table(
    "task.taskTests",
    task.taskTests.map((tc, i) => ({
      "#": i,
      testId: tc.testId,
      inputLenBruto: Array.isArray(tc.input)
        ? tc.input.length
        : typeof tc.input,
      inputLenNormalizado: executableTestCases[i].input.length,
      inputBruto: JSON.stringify(tc.input),
      inputNormalizado: JSON.stringify(executableTestCases[i].input),
      expectedOutput: tc.expectedOutput,
    })),
  );

  devLog.section("Pré-processamento dos inputs (formatação por tipo)");
  // Para cada testCase será feita uma processamento dos inputs.
  // Obs.: iteramos usando os inputs JÁ NORMALIZADOS (executableTestCases),
  // pois task.taskTests pode vir com double-encoding vindo do backend.
  for (let index = 0; index < task.taskTests.length; index++) {
    const rawTestCase = task.taskTests[index];
    const normalizedInputs = executableTestCases[index].input;

    devLog.group(
      `Teste #${index} — testId=${rawTestCase.testId}`,
      true /* collapsed */,
    );
    devLog.kv("input bruto (vindo do backend)", rawTestCase.input);
    devLog.kv("input normalizado", [...normalizedInputs]);
    devLog.kv("expectedOutput", rawTestCase.expectedOutput);

    // Itera sobre os inputs normalizados — cada posição corresponde a um parâmetro.
    for (
      let inputIndex = 0;
      inputIndex < normalizedInputs.length;
      inputIndex++
    ) {
      const param = task.taskParams[inputIndex];
      const input = normalizedInputs[inputIndex];

      if (!param) {
        devLog.warn(
          `Input [${inputIndex}] sem parâmetro correspondente em task.taskParams`,
          { value: input },
        );
        continue;
      }

      const before = executableTestCases[index].input[inputIndex];

      if (param.isArray) {
        const declaration = generateArrayVariable(param, input);
        executableTestCases[index].arraysDeclarations.push(declaration);
        executableTestCases[index].input[inputIndex] = declaration.name;
        devLog.info(
          `  [${inputIndex}] ${param.name}: ${param.type}[] (array) — ${JSON.stringify(before)} → variável ${declaration.name}`,
          declaration,
        );
        continue;
      }

      if (param.type === "cadeia") {
        executableTestCases[index].input[inputIndex] = `"${input}"`;
        devLog.info(
          `  [${inputIndex}] ${param.name}: cadeia — ${JSON.stringify(before)} → ${JSON.stringify(executableTestCases[index].input[inputIndex])}`,
        );
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
        devLog.info(
          `  [${inputIndex}] ${param.name}: real — ${JSON.stringify(before)} → ${JSON.stringify(executableTestCases[index].input[inputIndex])}`,
        );
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
        devLog.info(
          `  [${inputIndex}] ${param.name}: logico — ${JSON.stringify(before)} → ${JSON.stringify(executableTestCases[index].input[inputIndex])}`,
        );
        continue;
      }

      devLog.info(
        `  [${inputIndex}] ${param.name}: ${param.type} — ${JSON.stringify(before)} (sem formatação adicional)`,
      );
    }

    devLog.kv("inputs formatados", executableTestCases[index].input);
    devLog.groupEnd();
  }

  const testCaseResults = new Map<number, ITestCaseResult>();

  devLog.section("Execução dos casos de teste");

  let passedCount = 0;
  let failedCount = 0;
  let arityFailCount = 0;

  for (const testCase of executableTestCases) {
    testCaseResults.set(testCase.testId, {
      expectedOutput: testCase.expectedOutput,
      input: testCase.input,
      actualOutput: null,
      passed: false,
    });

    devLog.group(`▶ Teste testId=${testCase.testId}`);
    devLog.kv("inputs (prontos para chamada)", testCase.input);
    devLog.kv("expectedOutput", testCase.expectedOutput);
    if (testCase.arraysDeclarations.length > 0) {
      devLog.list(
        "variáveis de array declaradas",
        testCase.arraysDeclarations.map((d) => d.declaration),
      );
    }

    // Valida se o número de inputs bate com o número de parâmetros da função.
    if (testCase.input.length !== expectedParamCount) {
      const message =
        `Erro: caso de teste possui ${testCase.input.length} entrada(s), ` +
        `mas a função '${functionData.functionName}' espera ${expectedParamCount}.`;
      testCaseResults.get(testCase.testId)!.actualOutput = message;
      arityFailCount += 1;
      failedCount += 1;

      devLog.error(
        `Falha de aridade — esperado ${expectedParamCount}, recebido ${testCase.input.length}`,
      );
      devLog.kv("mensagem", message);
      devLog.kv("inputs recebidos", testCase.input);
      devLog.kv(
        "params esperados (derivados)",
        functionData.params.map(
          (p) => `${p.type}${p.isArray ? "[]" : ""} ${p.name}`,
        ),
      );
      devLog.groupEnd();
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

      devLog.code("Código transpilado (enviado ao executor)", baseCode);

      const stdoutBuffer: string[] = [];
      let gotOutput = false;

      const applyCapturedOutput = (output: string) => {
        const actualOutput = extractReceivedOutput(output);

        if (actualOutput == null) {
          return false;
        }

        gotOutput = true;
        const result = testCaseResults.get(testCase.testId)!;
        result.actualOutput = actualOutput;
        result.passed =
          actualOutput === normalizeComparableOutput(result.expectedOutput);
        return true;
      };

      const finishTest = () => {
        stdOutSubscription.unsubscribe();
        eventsSubscription.unsubscribe();
        executor.stop();
      };

      const stdOutSubscription = executor.stdOut$.subscribe((output) => {
        stdoutBuffer.push(output);

        if (applyCapturedOutput(output)) {
          const result = testCaseResults.get(testCase.testId)!;
          devLog.info(
            `stdout → saída capturada: ${JSON.stringify(result.actualOutput)} (esperado ${JSON.stringify(result.expectedOutput)}) — ${result.passed ? "OK" : "DIVERGE"}`,
          );
        } else {
          devLog.info(`stdout → ${JSON.stringify(output)}`);
        }
      });

      const eventsSubscription = executor.events.subscribe((event) => {
        if (event.type === "finish") {
          finishTest();
          const result = testCaseResults.get(testCase.testId)!;
          if (result.passed) passedCount += 1;
          else failedCount += 1;

          if (!gotOutput) {
            result.actualOutput =
              result.actualOutput ??
              "A execução terminou sem produzir saída da função.";
            devLog.warn(
              "Execução terminou sem emitir 'Saída recebida:' — verifique se o código chama 'escreva' e se a função retorna um valor.",
            );
          }
          devLog.kv("resumo do teste", {
            passed: result.passed,
            expected: result.expectedOutput,
            actual: result.actualOutput,
          });
          if (!result.passed) {
            devLog.list("stdout bruto completo", stdoutBuffer);
          }
          devLog.groupEnd();
          resolve();
        }

        if (event.type === "parseError") {
          finishTest();
          const result = testCaseResults.get(testCase.testId)!;
          const errorMessage =
            event.errors
              .map((err) => err.message)
              .filter(Boolean)
              .join("; ") ||
            "Erro de compilação no código gerado para o teste.";
          result.actualOutput = `Erro: ${errorMessage}`;
          result.passed = false;
          failedCount += 1;
          devLog.error("Erro de parse no executor", event.errors);
          devLog.kv("mensagem", errorMessage);
          devLog.groupEnd();
          resolve();
        }

        if (event.type === "error") {
          finishTest();

          const result = testCaseResults.get(testCase.testId)!;
          const errorMessage =
            (event.error && (event.error.message || String(event.error))) ||
            "Erro na execução do código";
          if (result.actualOutput === null) {
            result.actualOutput = `Erro: ${errorMessage}`;
          }
          result.passed = false;
          failedCount += 1;

          devLog.error("Erro em runtime no executor", event.error);
          devLog.kv("mensagem", errorMessage);
          devLog.list("stdout bruto completo", stdoutBuffer);
          try {
            devLog.code(
              "byteCode gerado (runtime)",
              typeof executor.byteCode === "string"
                ? executor.byteCode
                : JSON.stringify(executor.byteCode, null, 2),
            );
          } catch {
            devLog.warn("Falha ao serializar byteCode para log");
          }
          devLog.groupEnd();
          resolve();
        }
      });

      executor.run(baseCode);
    });
  }

  devLog.section("Resumo da execução");
  devLog.kv("total de testes", executableTestCases.length);
  devLog.kv("aprovados", passedCount);
  devLog.kv("reprovados", failedCount);
  if (arityFailCount > 0) {
    devLog.warn(
      `${arityFailCount} teste(s) reprovaram antes de executar por divergência de aridade.`,
    );
  }
  devLog.timeEnd("execução total");
  devLog.groupEnd();

  return {
    compileErrors: [],
    results: testCaseResults,
  };
};
