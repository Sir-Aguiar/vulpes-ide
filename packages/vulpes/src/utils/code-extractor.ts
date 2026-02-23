import { IParam } from "@/@schemas/Task.schema";
import { v4 as uuidv4 } from "uuid";

export interface IFunctionData {
  returnType: string;
  functionName: string;
  params: IParam[];
}

export const extractFunctionTypeAndParams = (
  code: string,
): IFunctionData | null => {
  // Remove quebras de linha e espaços extras para normalizar o código
  const cleanCode = code.replaceAll(/\s+/g, " ").trim();

  // Regex atualizada para aceitar colchetes nos parâmetros
  const regex = /funcao\s+(\w+)\s+(\w+)\s*\(\s*([^)]*)\s*\)/;
  const match = cleanCode.match(regex);

  if (!match) {
    return null;
  }

  const returnType = match[1];
  const functionName = match[2];
  const paramString = match[3].trim();

  // Se não houver parâmetros, retornar array vazio
  if (!paramString) {
    return {
      returnType,
      functionName,
      params: [],
    };
  }

  const params = paramString
    .split(",")
    .filter((param) => param.trim())
    .map((param) => {
      const trimmedParam = param.trim();
      const paramId = uuidv4();
      // Regex para capturar tipo, nome e possível indicador de vetor
      // Formatos suportados: "inteiro nome", "inteiro nome[]", "inteiro nome[10]"
      const paramRegex = /^(\w+)\s+(\w+)(\[\d*])?$/;
      const paramMatch = trimmedParam.match(paramRegex);

      if (paramMatch) {
        const type = paramMatch[1];
        const name = paramMatch[2];
        const isArray = !!paramMatch[3];

        return { paramId, name, type, isArray };
      }

      // Fallback para formato simples
      const parts = trimmedParam.split(/\s+/);
      if (parts.length >= 2) {
        const type = parts[0];
        const name = parts[1];
        const isArray = false;
        return { paramId, name, type, isArray };
      }

      console.warn(
        `[code-extractor] Malformed parameter detected: "${trimmedParam}". Returning with type "desconhecido".`,
      );

      return {
        paramId,
        name: trimmedParam,
        type: "desconhecido",
        isArray: false,
      };
    })
    .filter((param) => param.name && param.type);

  return {
    returnType,
    functionName,
    params,
  };
};

export const extractUserFunction = (
  code: string,
  functionName: string,
): string | null => {
  const regex = new RegExp(
    `funcao\\s+(?:[\\w\\[\\]]+\\s+)?${functionName}\\s*\\([^)]*\\)\\s*\\{`,
  );
  const match = regex.exec(code);

  if (!match) return null;

  const startIndex = match.index;
  let openBraces = 0;
  let i = startIndex + match[0].length - 1; // Aponta para a primeira '{' da função

  for (; i < code.length; i++) {
    if (code[i] === "{") {
      openBraces++;
    } else if (code[i] === "}") {
      openBraces--;
      if (openBraces === 0) {
        // eslint-disable-next-line unicorn/prefer-string-slice
        return code.substring(startIndex, i + 1);
      }
    }
  }

  return null;
};

/**
 * Extrai a primeira função definida no código que não seja 'inicio'
 * Retorna um objeto com o tipo de retorno, nome da função e parâmetros
 * ou null se nenhuma função for encontrada
 */
export const extractFunctionFromProgram = (
  code: string,
): IFunctionData | null => {
  // Remove comentários e espaços desnecessários
  const cleanCode = code
    .replaceAll(/\/\*[\S\s]*?\*\//g, "")
    .replaceAll(/\/\/.*$/gm, "")
    .trim();

  // Regex para capturar funções que não sejam 'inicio'
  // Formato: funcao [tipo] [nome]([parametros]) {
  const functionRegex = /funcao\s+(\w+)\s+(\w+)\s*\(\s*([^)]*)\s*\)\s*{/g;

  let match;
  const functions: IFunctionData[] = [];

  // Encontrar todas as funções no código
  while ((match = functionRegex.exec(cleanCode)) !== null) {
    const returnType = match[1];
    const functionName = match[2];
    const paramString = match[3].trim();

    // Ignorar a função 'inicio'
    if (functionName === "inicio") {
      continue;
    }

    // Processar parâmetros
    let params: IParam[] = [];

    if (paramString) {
      // Dividir parâmetros por vírgula e processar cada um
      params = paramString
        .split(",")
        .map((param) => {
          const trimmedParam = param.trim();
          const paramId = uuidv4();
          // Regex para capturar tipo, nome e possível indicador de vetor
          // Formatos suportados: "inteiro nome", "inteiro nome[]", "inteiro nome[10]"
          const paramRegex = /^(\w+)\s+(\w+)(\[\d*])?$/;
          const paramMatch = trimmedParam.match(paramRegex);

          if (paramMatch) {
            const type = paramMatch[1];
            const name = paramMatch[2];
            const isArray = !!paramMatch[3];

            return { paramId, name, type, isArray };
          }

          // Último fallback
          return {
            paramId,
            name: trimmedParam,
            type: "desconhecido",
            isArray: false,
          };
        })
        .filter((param) => param.name && param.name !== "");
    }

    functions.push({
      returnType,
      functionName,
      params,
    });
  }

  // Retornar a primeira função encontrada (excluindo 'inicio')
  return functions.length > 0 ? functions[0] : null;
};

export const extractFunctionCodeFromProgram = (code: string): string | null => {
  // Remove comentários e espaços desnecessários
  const cleanCode = code
    .replaceAll(/\/\*[\S\s]*?\*\//g, "")
    .replaceAll(/\/\/.*$/gm, "")
    .trim();

  // Regex para capturar funções que não sejam 'inicio'
  // Formato: funcao [tipo] [nome]([parametros]) {
  const functionRegex =
    /funcao\s+(\w+)\s+(\w+)\s*\(\s*([^)]*)\s*\)\s*{([\S\s]*?)}\s*/g;

  let match;

  // Encontrar todas as funções no código
  while ((match = functionRegex.exec(cleanCode)) !== null) {
    const functionName = match[2];

    // Ignorar a função 'inicio'
    if (functionName === "inicio") {
      continue;
    } else {
      return match[0];
    }
  }

  return null;
};

export const extractLibariesFromPrograma = (code: string): string[] => {
  const libraryRegex = /inclua\s+biblioteca\s+(\w+)(?:\s*-->\s*(\w+))?/g;
  const libraries: string[] = [];
  let match;

  while ((match = libraryRegex.exec(code)) !== null) {
    const libraryName = match[1];
    const alias = match[2];

    if (alias) {
      libraries.push(`inclua biblioteca ${libraryName} --> ${alias}`);
    } else {
      libraries.push(`inclua biblioteca ${libraryName}`);
    }
  }

  return libraries;
};
