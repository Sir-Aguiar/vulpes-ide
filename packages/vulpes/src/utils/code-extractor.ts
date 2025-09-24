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
