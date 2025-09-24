export interface IFunctionData {
  returnType: string;
  functionName: string;
  params: Array<{ name: string; type: string }>;
}

export const extractFunctionTypeAndParams = (code: string): IFunctionData | null => {
  const regex = /funcao (\w+) (\w+)\(([\s\w,]*)\)/;
  const match = code.match(regex);

  if (!match) {
    return null;
  }

  const returnType = match[1];
  const functionName = match[2];

  const params = match[3].split(",").map(param => {
    const [type, name] = param.trim().split(" ");
    return { name, type };
  });

  return {
    returnType,
    functionName,
    params,
  };
};

export const extractUserFunction = (code: string, functionName: string): string | null => {
  const functionRegex = new RegExp(`funcao\\s+.*\\s+${functionName}\\s*\\(.*\\)\\s*{([\\s\\S]*?)}\\s*`);
  const userFunction = code.match(functionRegex)?.[0];
  return userFunction || null;
};

export const appendFunctionToCode = (code: string, functionDef: string): string => {
  const insertionPoint = "funcao inicio()";
  const insertionIndex = code.indexOf(insertionPoint);

  if (insertionIndex === -1) {
    return code;
  }

  const before = code.slice(0, Math.max(0, insertionIndex));
  const after = code.slice(Math.max(0, insertionIndex));

  const newFunction = `\t${functionDef} {\n\n\t}\n\n`;

  return `${before}${newFunction}\t${after}`;
};
