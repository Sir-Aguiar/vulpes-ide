import * as Zod from "zod";

/*

{
  inputs: ["", ""]
  output: ""
}

Se os parâmetros forem do tipo array, o input deve ser um array também

Exemplo:

{
  inputs: ["1 2 3 4 5", "6 7 8 9 10"]
  output: "1"
}

*/

export const CodeTestSchema = Zod.object({
  input: Zod.array(Zod.string()).min(1, "Defina ao menos uma entrada"),
  expectedOutput: Zod.string().min(1, "Defina uma saída esperada"),
});

export type ICodeTest = Zod.infer<typeof CodeTestSchema>;

export const CreateTaskSchema = Zod.object({
  title: Zod.string().min(1, "Defina um título"),
  description: Zod.string().min(1, "Defina uma descrição"),
  functionDef: Zod.string().min(1, "Defina a assinatura da função"),
  inputMode: Zod.string(),
  isVisible: Zod.boolean().default(true),
});

export type CreateTaskDTO = Zod.infer<typeof CreateTaskSchema>;
