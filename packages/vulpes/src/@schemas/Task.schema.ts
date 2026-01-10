import * as Zod from "zod";

export const CodeTestSchema = Zod.object({
  input: Zod.array(Zod.string()).min(1, "Defina ao menos uma entrada"),
  expectedOutput: Zod.string().min(1, "Defina uma saída esperada"),
});

export type ICodeTest = Zod.infer<typeof CodeTestSchema>;

export const ParamSchema = Zod.object({
  paramId: Zod.string().min(1, "Defina o ID do parâmetro"),
  name: Zod.string().min(1, "Defina o nome do parâmetro"),
  type: Zod.string().min(1, "Defina o tipo do parâmetro"),
  isArray: Zod.boolean().default(false),
});

export interface IParam extends Zod.infer<typeof ParamSchema> {
  paramId: string;
}

export const CreateTaskSchema = Zod.object({
  title: Zod.string().min(1, "Defina um título"),
  description: Zod.string().min(1, "Defina uma descrição"),
  functionDef: Zod.string().min(1, "Defina a assinatura da função"),
  inputMode: Zod.string(),
  isVisible: Zod.boolean().default(true),
  taskParams: Zod.array(ParamSchema).min(1, "Defina ao menos um parâmetro"),
});
