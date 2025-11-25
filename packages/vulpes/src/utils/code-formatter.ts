import { IParam } from "@/app/(task)/new-task/schemas/CreateTask.schema";
import { IFunctionData } from "./code-extractor";

export function formatValue(input: string, type: string): string {
  // É array
  if (type.endsWith("[]")) {
    // É array de cadeias
    if (type.startsWith("cadeia")) {
      const stringItems = input.split(" ").map(item => `"${item}"`);
      return `{${stringItems.join(", ")}}`;
    }
    // Array de primitivos (inteiro, real, etc)
    return `{${input.split(" ").join(", ")}}`;
  }

  // Se for cadeia simples, adicionar aspas
  if (type === "cadeia") {
    return `"${input}"`;
  }

  // Outros tipos primitivos (inteiro, real, logico)
  return input;
}

export interface IArrayVariableDeclaration {
  declaration: string;
  name: string;
  values: string;
}

export function generateArrayVariable(param: IParam, value: string): IArrayVariableDeclaration {
  function getUniqueName() {
    return `arrayVar_${Math.random().toString(36).slice(2, 15)}`;
  }

  const cleanValue = value.split(" ");

  const name = getUniqueName();
  const declaration = `${param.type} ${name}[] = {${cleanValue.join(", ")}}`;

  return {
    declaration,
    name,
    values: `{${cleanValue.join(" ")}}`,
  };
}

export function appendArrayVariablesToCode(code: string, arrayVars: string[]): string {
  if (arrayVars.length === 0) return code;

  const variablesString = arrayVars.join("\n\t");

  // Procura por "programa {" ou "programa{" ignorando espaços e quebras de linha
  const regex = /(programa\s*{)/;

  // Insere as variáveis logo após a abertura do programa
  return code.replace(regex, `$1\n\t${variablesString}\n`);
}

export function generatePrintStatement(functionData: IFunctionData, params: string[]): string {
  const paramsString = params.join(", ");
  return `escreva("Saída recebida: " + ${functionData.functionName}(${paramsString}) + "\\n")`;
}
