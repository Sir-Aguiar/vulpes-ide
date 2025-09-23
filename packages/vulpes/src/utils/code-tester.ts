/* eslint-disable @typescript-eslint/no-unsafe-call */
import { PortugolExecutor } from "@portugol-webstudio/runner";

const injectTestInputs = (userCode: string, inputs: string[]): string => {
  // Remove todas as chamadas de leia() e substitui por valores pré-definidos
  let modifiedCode = userCode;

  // Adiciona as entradas no início do programa
  const inputsArray = inputs.map(input => `"${input}"`).join(", ");

  // Injeta um sistema de entrada mock
  const mockInputSystem = `
    cadeia entradas[] = {${inputsArray}}
    inteiro indiceEntrada = 0

    funcao real lerProximaEntrada() {
      se (indiceEntrada < ${inputs.length}) {
        cadeia entrada = entradas[indiceEntrada]
        indiceEntrada++
        retorne Tipos.cadeia_para_real(entrada)
      }
      retorne 0.0
    }
  `;

  // Substitui todas as chamadas leia() por lerProximaEntrada()
  modifiedCode = modifiedCode.replaceAll(/leia\s*\(\s*([^)]+)\s*\)/g, "$1 = lerProximaEntrada()");

  // Injeta o sistema mock antes da função inicio
  modifiedCode = modifiedCode.replace(/(funcao\s+inicio\s*\(\s*\)\s*{)/, `${mockInputSystem}\n\n$1`);

  return modifiedCode;
};

export const executeWithTestInputs = (
  executor: PortugolExecutor,
  userCode: string,
  testInputs: any[],
  functionName: string,
) => {
  const modifiedCode = injectTestInputs(userCode, testInputs);

  // Guarde somente a implementação da função `functionName`, todo o resto do código pode ser ignorado
  const functionRegex = new RegExp(`funcao\\s+.*\\s+${functionName}\\s*\\(.*\\)\\s*{([\\s\\S]*?)}\\s*`);
  const functionMatch = modifiedCode.match(functionRegex)?.[0];

  console.log(functionMatch);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return
  const inputTests = [testInputs.map(test => test.input.split("\n"))];

  console.log(inputTests);

  function formatPrint(code: string) {
    return `escreva("Saída recebida: " + ${code} + "\\n")`;
  }

  const finalCode = `
    programa {
      ${functionMatch || ""}

      funcao inicio() {
        ${testInputs
          .map((_, index) => formatPrint(`${functionName}(${inputTests.map(inputs => inputs[index]).join(", ")})`))
          .join("\n        ")}
      }
    }
  `;

  console.log(finalCode);
  executor.run(finalCode);
};
